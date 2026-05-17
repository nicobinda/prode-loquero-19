// Diagnóstico: estado del token y qué trae football-data por fase.
// GET /api/admin/check

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  fetchCompetitionInfo,
  fetchWorldCupMatches,
} from '@/lib/football-data';
import { env } from '@/lib/env';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let competition: unknown = null;
  let competitionError: string | null = null;
  try {
    competition = await fetchCompetitionInfo();
  } catch (e) {
    competitionError = e instanceof Error ? e.message : String(e);
  }

  let matches: Awaited<ReturnType<typeof fetchWorldCupMatches>> = [];
  let matchesError: string | null = null;
  try {
    matches = await fetchWorldCupMatches();
  } catch (e) {
    matchesError = e instanceof Error ? e.message : String(e);
  }

  // Resumen por stage
  const byStage: Record<
    string,
    { total: number; withBothTla: number; sampleMissing: unknown }
  > = {};
  for (const m of matches) {
    const k = m.stage;
    if (!byStage[k]) {
      byStage[k] = { total: 0, withBothTla: 0, sampleMissing: null };
    }
    byStage[k].total += 1;
    if (m.homeTeam.tla && m.awayTeam.tla) {
      byStage[k].withBothTla += 1;
    } else if (!byStage[k].sampleMissing) {
      byStage[k].sampleMissing = {
        id: m.id,
        utcDate: m.utcDate,
        status: m.status,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
      };
    }
  }

  return NextResponse.json({
    config: { competition: env.footballData.competition },
    competitionError,
    competition,
    matchesError,
    totalMatches: matches.length,
    byStage,
  });
}
