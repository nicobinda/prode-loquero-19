// Diagnóstico: estado del token y qué trae football-data por fase.
// GET /api/admin/check

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  fetchCompetitionInfo,
  fetchMatchById,
  fetchWorldCupMatches,
} from '@/lib/football-data';
import { env } from '@/lib/env';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const matchId = url.searchParams.get('matchId');
  const user = await getCurrentUser();
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Modo individual: ?matchId=537327 → trae el match completo del endpoint individual
  if (matchId) {
    try {
      const single = await fetchMatchById(Number(matchId));
      return NextResponse.json({ matchId, raw: single });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : String(e) },
        { status: 500 },
      );
    }
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

  // Partidos no-scheduled (live/finished) — para debug del MEX-RSA y similares
  const interesting = matches
    .filter(
      (m) =>
        m.status !== 'TIMED' &&
        m.status !== 'SCHEDULED' &&
        m.status !== 'POSTPONED' &&
        m.status !== 'CANCELLED',
    )
    .map((m) => ({
      id: m.id,
      utcDate: m.utcDate,
      status: m.status,
      home: m.homeTeam.tla,
      away: m.awayTeam.tla,
      goals: (m as unknown as { goals?: { home: number | null; away: number | null } }).goals,
      fullTime: m.score.fullTime,
      extraTime: m.score.extraTime,
      penalties: m.score.penalties,
      winner: m.score.winner,
      duration: m.score.duration,
    }));

  const compSummary =
    competition && typeof competition === 'object'
      ? {
          id: (competition as { id?: number }).id,
          name: (competition as { name?: string }).name,
        }
      : competition;

  return NextResponse.json({
    config: { competition: env.footballData.competition },
    competitionError,
    competition: compSummary,
    matchesError,
    totalMatches: matches.length,
    byStage,
    interestingMatches: interesting,
  });
}
