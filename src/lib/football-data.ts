// Cliente de football-data.org (v4).
// Free tier incluye FIFA World Cup. Límite: 10 req/min.
// Docs: https://www.football-data.org/documentation/api

import { env } from './env';

const BASE = 'https://api.football-data.org/v4';

export interface FdMatch {
  id: number;
  utcDate: string;       // ISO
  status:
    | 'SCHEDULED'
    | 'TIMED'
    | 'IN_PLAY'
    | 'PAUSED'
    | 'EXTRA_TIME'
    | 'PENALTY_SHOOTOUT'
    | 'FINISHED'
    | 'SUSPENDED'
    | 'POSTPONED'
    | 'CANCELLED'
    | 'AWARDED';
  stage:
    | 'GROUP_STAGE'
    | 'LAST_32'
    | 'LAST_16'
    | 'QUARTER_FINALS'
    | 'SEMI_FINALS'
    | 'THIRD_PLACE'
    | 'FINAL';
  group: string | null;          // "GROUP_A" en fase de grupos, null en knockout
  homeTeam: { id: number | null; name: string | null; tla: string | null };
  awayTeam: { id: number | null; name: string | null; tla: string | null };
  score: {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
    duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
    fullTime:    { home: number | null; away: number | null };
    halfTime:    { home: number | null; away: number | null };
    regularTime?:{ home: number | null; away: number | null };
    extraTime?:  { home: number | null; away: number | null };
    penalties?:  { home: number | null; away: number | null };
  };
}

interface MatchesResponse {
  matches: FdMatch[];
  count: number;
}

async function call<T>(path: string): Promise<T> {
  if (!env.footballData.token) {
    throw new Error('FOOTBALL_DATA_TOKEN no configurado');
  }
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': env.footballData.token },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`football-data ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

// Trae todos los partidos del torneo. Competición default: WC.
export async function fetchWorldCupMatches(): Promise<FdMatch[]> {
  const data = await call<MatchesResponse>(
    `/competitions/${env.footballData.competition}/matches`,
  );
  return data.matches;
}

// Info de la competición y temporada actual.
export async function fetchCompetitionInfo(): Promise<unknown> {
  return call(`/competitions/${env.footballData.competition}`);
}

// Fetch del match completo (endpoint individual)
export async function fetchMatchById(id: number): Promise<unknown> {
  return call(`/matches/${id}`);
}

// Mapeo: stage de football-data → nuestro 1/2/3
export function stageOf(s: FdMatch['stage']): 1 | 2 | 3 {
  if (s === 'GROUP_STAGE') return 1;
  if (s === 'LAST_32' || s === 'LAST_16') return 2;
  return 3; // QUARTER_FINALS, SEMI_FINALS, THIRD_PLACE, FINAL
}

// "Round" legible para la UI
export function roundLabel(m: FdMatch): string {
  switch (m.stage) {
    case 'GROUP_STAGE':
      return m.group ? m.group.replace('GROUP_', 'Grupo ') : 'Fase de grupos';
    case 'LAST_32':       return '16vos de Final';
    case 'LAST_16':       return 'Octavos de Final';
    case 'QUARTER_FINALS':return 'Cuartos de Final';
    case 'SEMI_FINALS':   return 'Semifinal';
    case 'THIRD_PLACE':   return 'Tercer Puesto';
    case 'FINAL':         return 'Final';
  }
}

// Status → nuestro enum
export function mapStatus(s: FdMatch['status']): 'scheduled' | 'live' | 'finished' {
  if (s === 'FINISHED' || s === 'AWARDED') return 'finished';
  if (s === 'IN_PLAY' || s === 'PAUSED' || s === 'EXTRA_TIME' || s === 'PENALTY_SHOOTOUT') {
    return 'live';
  }
  return 'scheduled';
}

// Goles del tiempo regular + prórroga (sin penales)
export function goalsExcludingPenalties(m: FdMatch): {
  home: number | null;
  away: number | null;
  wentToPenalties: boolean;
} {
  const wentToPenalties =
    m.score.duration === 'PENALTY_SHOOTOUT' ||
    (m.score.penalties?.home !== null && m.score.penalties?.home !== undefined);

  // Tomamos el máximo entre fullTime y extraTime. football-data a veces
  // devuelve extraTime = {0,0} cuando no hubo goles en la prórroga
  // (semántica "goles durante ET" en vez de "score acumulado"), lo cual
  // pisaba el resultado de 90 min con cero. El max evita ese bug.
  const et = m.score.extraTime;
  const ft = m.score.fullTime;
  const pickMax = (
    a: number | null | undefined,
    b: number | null | undefined,
  ): number | null => {
    if ((a === null || a === undefined) && (b === null || b === undefined)) {
      return null;
    }
    return Math.max(a ?? 0, b ?? 0);
  };
  const home = pickMax(et?.home, ft?.home);
  const away = pickMax(et?.away, ft?.away);

  return { home, away, wentToPenalties };
}
