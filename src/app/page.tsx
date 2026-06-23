import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { supabaseAdmin } from '@/lib/supabase';
import { AppHeader } from '@/components/AppHeader';
import { HomeContent } from '@/components/HomeContent';
import type { PredWithUser } from '@/components/MatchPopup';
import type { Match, Prediction } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.nickname) redirect('/onboarding');

  const sb = supabaseAdmin();

  // Todos los partidos sincronizados, ordenados por kickoff.
  const { data: matchesData } = await sb
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  const matches = (matchesData ?? []) as Match[];

  const lockedMatchIds = matches
    .filter((m) => m.status !== 'scheduled')
    .map((m) => m.id);

  // Mis predicciones (un solo user, no debería superar 1000 nunca)
  const { data: myPredsData } = await sb
    .from('predictions')
    .select('*')
    .eq('user_id', user.id);
  const myPredictions = (myPredsData ?? []) as Prediction[];

  // Predicciones para partidos live/finished — paginadas (supera 1000 fácil)
  const lockedPreds: PredWithUser[] = [];
  if (lockedMatchIds.length > 0) {
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await sb
        .from('predictions')
        .select('*, user:users(id, nickname, avatar_url)')
        .in('match_id', lockedMatchIds)
        .range(from, from + PAGE - 1);
      if (error) break;
      if (!data || data.length === 0) break;
      lockedPreds.push(...(data as PredWithUser[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pb-12">
      <AppHeader nickname={user.nickname} current="home" />
      {user.is_admin && (
        <div className="flex justify-end -mt-2">
          <Link
            href="/admin"
            className="font-display text-xs font-bold uppercase tracking-wider text-pb-ceruleo"
          >
            Panel admin →
          </Link>
        </div>
      )}

      {matches.length === 0 ? (
        <EmptyState isAdmin={user.is_admin} />
      ) : (
        <HomeContent
          matches={matches}
          myPredictions={myPredictions}
          lockedPreds={lockedPreds}
          currentUserId={user.id}
          userNickname={user.nickname}
          userAvatarUrl={user.avatar_url}
        />
      )}
    </main>
  );
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-[0_4px_12px_rgba(11,29,94,0.08)]">
      <p className="font-display text-lg font-bold text-pb-navy">
        Todavía no hay partidos
      </p>
      <p className="mt-1 text-sm text-pb-muted">
        {isAdmin
          ? 'Andá a Admin → Sincronizar para traer los fixtures del Mundial.'
          : 'En cuanto se carguen los fixtures vas a poder pronosticar.'}
      </p>
      {isAdmin && (
        <Link
          href="/admin"
          className="mt-4 inline-block rounded-2xl bg-pb-navy px-5 py-2.5 font-display text-sm font-bold text-white"
        >
          Ir al panel admin
        </Link>
      )}
    </div>
  );
}
