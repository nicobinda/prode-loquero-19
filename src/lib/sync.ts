// Sync de fixtures del Mundial 2026 desde football-data.org → tabla `matches`.
// Idempotente: upsert por external_id.

import { supabaseAdmin } from '@/lib/supabase';
import {
  fetchWorldCupMatches,
  goalsExcludingPenalties,
  mapStatus,
  roundLabel,
  stageOf,
  type FdMatch,
} from '@/lib/football-data';

export interface SyncResult {
  fetched: number;
  upserted: number;
  errors: string[];
}

function teamCode(t: FdMatch['homeTeam'] | FdMatch['awayTeam']): string {
  return t.tla ?? t.name?.slice(0, 3).toUpperCase() ?? '???';
}

// Códigos placeholder cortos por etapa knockout (para partidos sin teams)
const STAGE_PREFIX: Record<FdMatch['stage'], string> = {
  GROUP_STAGE: 'G',
  LAST_32: 'R32',
  LAST_16: 'R16',
  QUARTER_FINALS: 'QF',
  SEMI_FINALS: 'SF',
  THIRD_PLACE: '3P',
  FINAL: 'F',
};

export async function syncMatches(): Promise<SyncResult> {
  const matches = await fetchWorldCupMatches();
  const errors: string[] = [];

  // Sortear y asignar posición 1..N dentro de cada stage knockout
  const positionById = new Map<number, number>();
  const byStage = new Map<FdMatch['stage'], FdMatch[]>();
  for (const m of matches) {
    if (!byStage.has(m.stage)) byStage.set(m.stage, []);
    byStage.get(m.stage)!.push(m);
  }
  for (const [, ms] of byStage) {
    ms.sort((a, b) => a.utcDate.localeCompare(b.utcDate));
    ms.forEach((m, i) => positionById.set(m.id, i + 1));
  }

  const rows = matches.map((m) => {
      const status = mapStatus(m.status);
      const goals = goalsExcludingPenalties(m);
      const stage = stageOf(m.stage);

      // Si falta TLA, generar placeholder único: _R32-1H, _R32-1A, etc.
      // El prefijo "_" indica TBD a la UI.
      const pos = positionById.get(m.id) ?? 0;
      const team_a = m.homeTeam.tla
        ? teamCode(m.homeTeam)
        : `_${STAGE_PREFIX[m.stage]}-${pos}H`;
      const team_b = m.awayTeam.tla
        ? teamCode(m.awayTeam)
        : `_${STAGE_PREFIX[m.stage]}-${pos}A`;

      let winner_team: string | null = null;
      if (status === 'finished') {
        if (stage === 1) {
          if (m.score.winner === 'HOME_TEAM') winner_team = team_a;
          else if (m.score.winner === 'AWAY_TEAM') winner_team = team_b;
        } else {
          // Knockout: si fue a penales, el winner se decide por penalty score
          const pens = m.score.penalties;
          if (pens && pens.home !== null && pens.away !== null) {
            winner_team =
              (pens.home ?? 0) > (pens.away ?? 0) ? team_a : team_b;
          } else if (m.score.winner === 'HOME_TEAM') winner_team = team_a;
          else if (m.score.winner === 'AWAY_TEAM') winner_team = team_b;
        }
      }

      return {
        external_id: m.id,
        stage,
        round: roundLabel(m),
        team_a,
        team_b,
        kickoff_at: m.utcDate,
        status,
        goals_a: goals.home,
        goals_b: goals.away,
        went_to_penalties: goals.wentToPenalties,
        winner_team,
      };
    });

  if (rows.length === 0) {
    return {
      fetched: matches.length,
      upserted: 0,
      errors: ['football-data devolvió 0 partidos con equipos definidos'],
    };
  }

  // Protección: si en DB el partido está finished pero la API dice scheduled,
  // no lo pisamos (preserva simulación o override manual previo).
  // Pero si la API dice 'live' o 'finished', siempre actualizamos:
  // el partido real arrancó y debe sobrescribir la simulación.
  const externalIds = rows.map((r) => r.external_id);
  const { data: existing } = await supabaseAdmin()
    .from('matches')
    .select('external_id, status')
    .in('external_id', externalIds);

  const finishedInDb = new Set(
    (existing ?? [])
      .filter((e) => e.status === 'finished')
      .map((e) => e.external_id as number),
  );

  const filteredRows = rows.filter(
    (r) => !finishedInDb.has(r.external_id) || r.status !== 'scheduled',
  );

  if (filteredRows.length === 0) {
    return {
      fetched: matches.length,
      upserted: 0,
      errors: ['Todos los partidos finalizados en DB; no se sobreescribe nada'],
    };
  }

  const { error, count } = await supabaseAdmin()
    .from('matches')
    .upsert(filteredRows, { onConflict: 'external_id', count: 'exact' });

  if (error) errors.push(error.message);

  return {
    fetched: matches.length,
    upserted: count ?? filteredRows.length,
    errors,
  };
}
