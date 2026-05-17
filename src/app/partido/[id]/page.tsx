import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { supabaseAdmin } from '@/lib/supabase';
import { FlagChip } from '@/components/FlagChip';
import { StatusTag } from '@/components/StatusTag';
import { Avatar } from '@/components/Avatar';
import { dayLabel, hasKickedOff, timeLabel } from '@/lib/dates';
import { pointsForMatch } from '@/lib/scoring';
import type { Match, Prediction, User } from '@/types/db';
import { PredictionForm } from './PredictionForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.nickname) redirect('/onboarding');

  const sb = supabaseAdmin();

  const { data: m } = await sb
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!m) notFound();
  const match = m as Match;

  const { data: ownPred } = await sb
    .from('predictions')
    .select('*')
    .eq('match_id', match.id)
    .eq('user_id', user.id)
    .maybeSingle();

  const locked = match.status !== 'scheduled' || hasKickedOff(match.kickoff_at);

  // Si está iniciado/terminado, traer todas las predicciones + usuarios
  let allPreds: Array<Prediction & { user: Pick<User, 'id' | 'nickname' | 'avatar_url'> }> = [];
  if (locked) {
    const { data } = await sb
      .from('predictions')
      .select('*, user:users(id, nickname, avatar_url)')
      .eq('match_id', match.id);
    allPreds = (data ?? []) as typeof allPreds;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-display text-sm font-bold text-pb-muted">
          ← Volver
        </Link>
        <StatusTag status={match.status} />
      </header>

      <section className="rounded-3xl bg-white p-6 text-center shadow-[0_4px_12px_rgba(11,29,94,0.08)]">
        <p className="font-display text-xs font-bold uppercase tracking-wider text-pb-muted">
          {match.round}
        </p>
        <p className="mt-1 font-display text-sm font-semibold text-pb-deep-blue">
          {dayLabel(match.kickoff_at)} · {timeLabel(match.kickoff_at)}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <TeamBig code={match.team_a} score={match.goals_a} locked={locked} />
          <span className="font-display text-lg font-black text-pb-muted">VS</span>
          <TeamBig code={match.team_b} score={match.goals_b} locked={locked} />
        </div>

        {locked && match.went_to_penalties && (
          <p className="mt-2 font-display text-xs font-bold text-pb-violeta">
            Definido por penales
          </p>
        )}
      </section>

      {locked ? (
        <PublishedPredictions match={match} preds={allPreds} currentUserId={user.id} />
      ) : (
        <PredictionForm match={match} initial={(ownPred as Prediction) ?? null} />
      )}
    </main>
  );
}

function TeamBig({
  code,
  score,
  locked,
}: {
  code: string;
  score: number | null;
  locked: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <FlagChip code={code} size={48} />
      <span className="font-display text-base font-bold text-pb-deep-blue">
        {code}
      </span>
      <span className="font-display text-4xl font-black text-pb-navy">
        {locked ? (score ?? '–') : '–'}
      </span>
    </div>
  );
}

function PublishedPredictions({
  match,
  preds,
  currentUserId,
}: {
  match: Match;
  preds: Array<Prediction & { user: Pick<User, 'id' | 'nickname' | 'avatar_url'> }>;
  currentUserId: string;
}) {
  const sorted = [...preds].sort((a, b) => {
    if (a.user.id === currentUserId) return -1;
    if (b.user.id === currentUserId) return 1;
    return pointsForMatch(match, b) - pointsForMatch(match, a);
  });

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-pb-muted">
        Pronósticos publicados
      </h2>
      {sorted.length === 0 && (
        <p className="rounded-2xl bg-white p-4 text-sm text-pb-muted shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
          Nadie cargó pronóstico para este partido.
        </p>
      )}
      {sorted.map((p) => {
        const pts = match.status === 'finished' ? pointsForMatch(match, p) : null;
        return (
          <div
            key={p.id}
            className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_4px_12px_rgba(11,29,94,0.06)] ${
              p.user.id === currentUserId ? 'ring-2 ring-pb-ceruleo' : ''
            }`}
          >
            <Avatar src={p.user.avatar_url} nickname={p.user.nickname ?? '?'} size={36} />
            <div className="flex-1">
              <p className="font-display text-sm font-bold text-pb-deep-blue">
                {p.user.nickname}
                {p.user.id === currentUserId && (
                  <span className="ml-2 text-xs text-pb-ceruleo">(vos)</span>
                )}
              </p>
              <p className="text-xs text-pb-muted">
                {p.goals_a} – {p.goals_b}
                {match.stage > 1 && p.went_to_penalties && ' · penales'}
                {match.stage > 1 && p.winner_team && ` · pasa ${p.winner_team}`}
              </p>
            </div>
            {pts !== null && (
              <span className="rounded-full bg-pb-navy px-3 py-1 font-display text-sm font-black text-white">
                +{pts}
              </span>
            )}
          </div>
        );
      })}
    </section>
  );
}
