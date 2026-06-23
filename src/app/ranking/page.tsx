import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { supabaseAdmin } from '@/lib/supabase';
import { computeRanking, isStageFinished } from '@/lib/ranking';
import { AppHeader } from '@/components/AppHeader';
import type { Match, Prediction, User } from '@/types/db';
import { RankingTabs } from './RankingTabs';

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.nickname) redirect('/onboarding');

  const sb = supabaseAdmin();
  const [{ data: users }, { data: matches }] = await Promise.all([
    sb
      .from('users')
      .select('id, nickname, avatar_url')
      .not('nickname', 'is', null),
    sb.from('matches').select('*'),
  ]);

  // Solo predicciones de partidos finalizados (subset chico).
  // Supabase tiene hard-cap de 1000 rows por respuesta (config PostgREST),
  // .limit() no lo levanta. Paginamos con .range() para no perder data.
  const finishedMatchIds = ((matches ?? []) as Match[])
    .filter((m) => m.status === 'finished')
    .map((m) => m.id);

  const predictions: Prediction[] = [];
  if (finishedMatchIds.length > 0) {
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await sb
        .from('predictions')
        .select('*')
        .in('match_id', finishedMatchIds)
        .range(from, from + PAGE - 1);
      if (error) break;
      if (!data || data.length === 0) break;
      predictions.push(...(data as Prediction[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }
  }

  type RankUser = Pick<User, 'id' | 'nickname' | 'avatar_url'>;
  const ranking = computeRanking({
    users: (users ?? []) as RankUser[],
    matches: (matches ?? []) as Match[],
    predictions,
  });

  const stageFinished = {
    1: isStageFinished((matches ?? []) as Match[], 1),
    2: isStageFinished((matches ?? []) as Match[], 2),
    3: isStageFinished((matches ?? []) as Match[], 3),
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pb-12">
      <AppHeader nickname={user.nickname} current="ranking" />
      <RankingTabs
        ranking={ranking}
        currentUserId={user.id}
        stageFinished={stageFinished}
      />
    </main>
  );
}
