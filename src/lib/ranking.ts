import { pointsForMatch } from './scoring';
import type { Match, Prediction, Stage, User } from '@/types/db';

export interface RankingRow {
  user: Pick<User, 'id' | 'nickname' | 'avatar_url'>;
  total: number;
  byStage: Record<Stage, number>;
  finishedMatches: number; // partidos finalizados con predicción cargada
}

interface ComputeArgs {
  users: Array<Pick<User, 'id' | 'nickname' | 'avatar_url'>>;
  matches: Match[];
  predictions: Prediction[];
}

export function computeRanking({
  users,
  matches,
  predictions,
}: ComputeArgs): RankingRow[] {
  // Index matches by id
  const matchById = new Map(matches.map((m) => [m.id, m]));

  // Index predictions by user
  const predsByUser = new Map<string, Prediction[]>();
  for (const p of predictions) {
    const arr = predsByUser.get(p.user_id) ?? [];
    arr.push(p);
    predsByUser.set(p.user_id, arr);
  }

  const rows: RankingRow[] = users.map((u) => {
    const myPreds = predsByUser.get(u.id) ?? [];
    const byStage: Record<Stage, number> = { 1: 0, 2: 0, 3: 0 };
    let finishedMatches = 0;
    for (const p of myPreds) {
      const m = matchById.get(p.match_id);
      if (!m || m.status !== 'finished') continue;
      const pts = pointsForMatch(m, p);
      byStage[m.stage] += pts;
      finishedMatches += 1;
    }
    const total = byStage[1] + byStage[2] + byStage[3];
    return { user: u, total, byStage, finishedMatches };
  });

  rows.sort((a, b) => b.total - a.total);
  return rows;
}

// Ranking de una etapa específica (sort por puntos de esa etapa)
export function sortByStage(rows: RankingRow[], stage: Stage): RankingRow[] {
  return [...rows].sort((a, b) => b.byStage[stage] - a.byStage[stage]);
}

// ¿La etapa está finalizada? (todos los partidos status='finished')
export function isStageFinished(matches: Match[], stage: Stage): boolean {
  const stageMatches = matches.filter((m) => m.stage === stage);
  if (stageMatches.length === 0) return false;
  return stageMatches.every((m) => m.status === 'finished');
}
