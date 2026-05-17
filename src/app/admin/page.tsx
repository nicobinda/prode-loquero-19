import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { supabaseAdmin } from '@/lib/supabase';
import { SyncButton } from './SyncButton';
import { PlayerManager, type PlayerRow } from './PlayerManager';
import { MatchOverridePanel } from './MatchOverridePanel';
import { SimulatorPanel } from './SimulatorPanel';
import type { Match } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.is_admin) redirect('/');

  const sb = supabaseAdmin();
  const [
    { count: usersCount },
    { count: matchesCount },
    { count: predictionsCount },
    { data: usersData },
    { data: paymentsData },
    { data: matchesData },
  ] = await Promise.all([
    sb.from('users').select('*', { count: 'exact', head: true }),
    sb.from('matches').select('*', { count: 'exact', head: true }),
    sb.from('predictions').select('*', { count: 'exact', head: true }),
    sb
      .from('users')
      .select('id, dni, nickname, avatar_url, is_admin, pin_hash, first_login_at')
      .order('created_at', { ascending: true }),
    sb.from('payments').select('*'),
    sb
      .from('matches')
      .select('*')
      .order('kickoff_at', { ascending: true })
      .limit(200),
  ]);

  const paymentsByUser = new Map<string, boolean>();
  for (const p of paymentsData ?? []) {
    paymentsByUser.set(p.user_id, p.paid);
  }

  const players: PlayerRow[] = (usersData ?? []).map((u) => ({
    id: u.id,
    dni: u.dni,
    nickname: u.nickname,
    avatar_url: u.avatar_url,
    is_admin: u.is_admin,
    has_pin: !!u.pin_hash,
    paid: paymentsByUser.get(u.id) ?? false,
    first_login_at: u.first_login_at,
  }));

  const matches = (matchesData ?? []) as Match[];
  const paidCount = players.filter((p) => p.paid).length;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-display text-sm font-bold text-pb-muted">
          ← Volver
        </Link>
        <h1 className="font-display text-xl font-black text-pb-navy">Admin</h1>
        <span className="w-12" />
      </header>

      <section className="grid grid-cols-4 gap-2">
        <Stat label="Jugadores" value={usersCount ?? 0} />
        <Stat label="Pagaron" value={`${paidCount}/${players.length}`} />
        <Stat label="Partidos" value={matchesCount ?? 0} />
        <Stat label="Pronós." value={predictionsCount ?? 0} />
      </section>

      <Card title="Sincronizar partidos" subtitle="Trae fixtures y resultados desde football-data.org">
        <SyncButton />
      </Card>

      <Card title="Jugadores" subtitle="Alta, reset PIN, pagos y baja">
        <PlayerManager players={players} currentAdminId={user.id} />
      </Card>

      <Card title="Override de resultados" subtitle="Cargar marcador manualmente si la API falla">
        <MatchOverridePanel matches={matches} />
      </Card>

      <Card title="Simulador de resultados" subtitle="Solo para testing — setea resultados aleatorios">
        <SimulatorPanel />
      </Card>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-2.5 text-center shadow-[0_4px_12px_rgba(11,29,94,0.08)]">
      <div className="font-display text-lg font-black text-pb-navy">{value}</div>
      <div className="text-[9px] font-bold uppercase tracking-wider text-pb-muted">
        {label}
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_4px_12px_rgba(11,29,94,0.08)]">
      <h2 className="font-display text-lg font-bold text-pb-navy">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-pb-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
