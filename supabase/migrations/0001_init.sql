-- PRODE BINDA — Schema inicial
-- Convención: nombres en inglés en la DB, español en la UI.

create extension if not exists "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id              uuid primary key default gen_random_uuid(),
  dni             text not null unique check (dni ~ '^[0-9]{7,8}$'),
  pin_hash        text,                       -- null = aún no registró PIN
  nickname        text unique
                    check (char_length(nickname) between 2 and 20),
  avatar_url      text,
  is_admin        boolean not null default false,
  failed_attempts smallint not null default 0,
  locked_until    timestamptz,
  created_at      timestamptz not null default now(),
  first_login_at  timestamptz
);

create index users_dni_idx on public.users(dni);

-- ============================================================
-- MATCHES
-- ============================================================
create type match_status as enum ('scheduled', 'live', 'finished');

create table public.matches (
  id                 uuid primary key default gen_random_uuid(),
  external_id        bigint not null unique,     -- fixture id en API-Football
  stage              smallint not null check (stage in (1, 2, 3)),
  round              text not null,              -- "Group A", "Round of 16", etc.
  team_a             text not null,              -- "ARG"
  team_b             text not null,
  kickoff_at         timestamptz not null,
  status             match_status not null default 'scheduled',
  goals_a            smallint,                   -- regular + prórroga, sin penales
  goals_b            smallint,
  went_to_penalties  boolean not null default false,
  winner_team        text,                       -- null en grupos si empate
  updated_at         timestamptz not null default now()
);

create index matches_stage_idx     on public.matches(stage);
create index matches_kickoff_idx   on public.matches(kickoff_at);
create index matches_status_idx    on public.matches(status);

-- ============================================================
-- PREDICTIONS
-- ============================================================
create table public.predictions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  match_id           uuid not null references public.matches(id) on delete cascade,
  goals_a            smallint not null check (goals_a between 0 and 20),
  goals_b            smallint not null check (goals_b between 0 and 20),
  went_to_penalties  boolean not null default false,
  winner_team        text,                       -- null = empate (solo stage 1)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, match_id)
);

create index predictions_user_idx  on public.predictions(user_id);
create index predictions_match_idx on public.predictions(match_id);

-- ============================================================
-- PAYMENTS (tracking offline del pozo)
-- ============================================================
create table public.payments (
  user_id  uuid primary key references public.users(id) on delete cascade,
  paid     boolean not null default false,
  paid_at  timestamptz,
  notes    text
);

-- ============================================================
-- AUDIT LOG (admin actions)
-- ============================================================
create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.users(id),
  action      text not null,                   -- "reset_pin", "override_match", etc.
  target      text,                            -- id del recurso afectado
  payload     jsonb,
  created_at  timestamptz not null default now()
);

create index audit_log_admin_idx on public.audit_log(admin_id);
create index audit_log_created_idx on public.audit_log(created_at desc);

-- ============================================================
-- Helper: extraer user_id del JWT custom
-- (Lo seteamos en el cliente via set_config('request.jwt.claim.sub', uid))
-- ============================================================
create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select is_admin from public.users where id = public.current_user_id()),
    false
  );
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.users        enable row level security;
alter table public.matches      enable row level security;
alter table public.predictions  enable row level security;
alter table public.payments     enable row level security;
alter table public.audit_log    enable row level security;

-- USERS: cada uno ve su propio registro; admin ve todos
create policy "users_self_select" on public.users
  for select using (id = public.current_user_id() or public.is_admin());

create policy "users_self_update" on public.users
  for update using (id = public.current_user_id())
  with check (id = public.current_user_id());

create policy "users_admin_all" on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- MATCHES: lectura para todos los logueados; escritura solo admin/service
create policy "matches_read_authed" on public.matches
  for select using (public.current_user_id() is not null);

create policy "matches_admin_write" on public.matches
  for all using (public.is_admin()) with check (public.is_admin());

-- PREDICTIONS: cada uno ve las propias siempre.
-- Las de otros, solo si el partido ya inició (status != 'scheduled').
create policy "predictions_self_select" on public.predictions
  for select using (
    user_id = public.current_user_id()
    or public.is_admin()
    or exists (
      select 1 from public.matches m
      where m.id = predictions.match_id
        and m.status in ('live', 'finished')
    )
  );

create policy "predictions_self_write" on public.predictions
  for insert with check (user_id = public.current_user_id());

create policy "predictions_self_update" on public.predictions
  for update using (
    user_id = public.current_user_id()
    and exists (
      select 1 from public.matches m
      where m.id = predictions.match_id and m.status = 'scheduled'
    )
  )
  with check (user_id = public.current_user_id());

create policy "predictions_self_delete" on public.predictions
  for delete using (
    user_id = public.current_user_id()
    and exists (
      select 1 from public.matches m
      where m.id = predictions.match_id and m.status = 'scheduled'
    )
  );

-- PAYMENTS: cada uno ve el propio; solo admin escribe
create policy "payments_self_select" on public.payments
  for select using (user_id = public.current_user_id() or public.is_admin());

create policy "payments_admin_write" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- AUDIT_LOG: solo admin
create policy "audit_admin_all" on public.audit_log
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Updated_at triggers
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger matches_touch
  before update on public.matches
  for each row execute function public.touch_updated_at();

create trigger predictions_touch
  before update on public.predictions
  for each row execute function public.touch_updated_at();
