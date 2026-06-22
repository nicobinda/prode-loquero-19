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

  // Protección: traemos el estado actual de los matches para tomar decisiones.
  const externalIds = rows.map((r) => r.external_id);
  const { data: existing } = await supabaseAdmin()
    .from('matches')
    .select('external_id, status, goals_a, goals_b, winner_team, went_to_penalties, team_a, team_b')
    .in('external_id', externalIds);

  const existingByExt = new Map(
    (existing ?? []).map((e) => [e.external_id as number, e]),
  );

  // Lógica:
  // 1) Si DB.status === 'finished' y API.status === 'scheduled': SKIP
  //    (preserva simulación o override manual previo)
  // 2) Si API trae goles null pero la DB tenía valores reales: preservar los
  //    de DB (evita perder un resultado por lag de football-data)
  const filteredRows = rows
    .filter((r) => {
      const ex = existingByExt.get(r.external_id);
      if (ex?.status === 'finished' && r.status === 'scheduled') return false;
      return true;
    })
    .map((r) => {
      const ex = existingByExt.get(r.external_id);
      if (!ex) return r;
      const apiNulls = r.goals_a === null && r.goals_b === null;
      const dbHasGoals = ex.goals_a !== null || ex.goals_b !== null;
      // Preservar team codes una vez que son reales (no placeholder).
      // Si la API cambia el código (ej. URU → URY), las predicciones rompen.
      const apiTeamA = r.team_a;
      const apiTeamB = r.team_b;
      const isPlaceholderA = (ex.team_a as string)?.startsWith('_');
      const isPlaceholderB = (ex.team_b as string)?.startsWith('_');
      const team_a = !isPlaceholderA ? (ex.team_a as string) : apiTeamA;
      const team_b = !isPlaceholderB ? (ex.team_b as string) : apiTeamB;
      // Si reemplazamos team_a/team_b por el código preservado, hay que
      // remapear winner_team también para mantener consistencia.
      let winner_team = r.winner_team;
      if (winner_team === apiTeamA && team_a !== apiTeamA) winner_team = team_a;
      else if (winner_team === apiTeamB && team_b !== apiTeamB)
        winner_team = team_b;
      if (apiNulls && dbHasGoals) {
        return {
          ...r,
          team_a,
          team_b,
          winner_team: winner_team ?? ex.winner_team,
          goals_a: ex.goals_a,
          goals_b: ex.goals_b,
          went_to_penalties: r.went_to_penalties || ex.went_to_penalties,
        };
      }
      return { ...r, team_a, team_b, winner_team };
    });

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
