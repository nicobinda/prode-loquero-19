'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/getCurrentUser';
import { supabaseAdmin } from '@/lib/supabase';
import { hasKickedOff } from '@/lib/dates';
import { isTbdCode } from '@/lib/flags';
import type { Match } from '@/types/db';

export interface PredictionInput {
  matchId: string;
  goalsA: number;
  goalsB: number;
  wentToPenalties: boolean;
  winnerTeam: string | null; // requerido en knockout
}

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export async function savePrediction(input: PredictionInput): Promise<SaveResult> {
  const user = await requireUser();
  const sb = supabaseAdmin();

  // Validar partido y que no haya iniciado.
  const { data: m } = await sb
    .from('matches')
    .select('*')
    .eq('id', input.matchId)
    .maybeSingle();
  if (!m) return { ok: false, error: 'Partido no encontrado' };

  const match = m as Match;
  if (match.status !== 'scheduled' || hasKickedOff(match.kickoff_at)) {
    return { ok: false, error: 'El partido ya empezó. No se puede modificar.' };
  }
  if (isTbdCode(match.team_a) || isTbdCode(match.team_b)) {
    return {
      ok: false,
      error: 'Aún no se definen los equipos de este partido.',
    };
  }

  // Validaciones
  if (
    !Number.isInteger(input.goalsA) ||
    !Number.isInteger(input.goalsB) ||
    input.goalsA < 0 ||
    input.goalsB < 0 ||
    input.goalsA > 20 ||
    input.goalsB > 20
  ) {
    return { ok: false, error: 'Goles inválidos (0–20)' };
  }

  let winner_team: string | null = null;
  let went_to_penalties = false;
  let goals_a = input.goalsA;
  let goals_b = input.goalsB;

  if (match.stage === 1) {
    // Loquero stage 1: pronóstico por resultado (gana A / empate / gana B).
    // Goles no son relevantes — se persisten como 0/0 (sentinel).
    if (
      input.winnerTeam !== null &&
      input.winnerTeam !== match.team_a &&
      input.winnerTeam !== match.team_b
    ) {
      return { ok: false, error: 'Equipo ganador inválido' };
    }
    winner_team = input.winnerTeam;
    goals_a = 0;
    goals_b = 0;
  } else {
    // Knockout: winner se deriva del marcador, salvo empate (penales)
    went_to_penalties = !!input.wentToPenalties;
    if (input.goalsA > input.goalsB) winner_team = match.team_a;
    else if (input.goalsA < input.goalsB) winner_team = match.team_b;
    else {
      if (!input.winnerTeam) {
        return {
          ok: false,
          error: 'En knockout con empate hay que elegir quién pasa.',
        };
      }
      if (![match.team_a, match.team_b].includes(input.winnerTeam)) {
        return { ok: false, error: 'Equipo ganador inválido' };
      }
      winner_team = input.winnerTeam;
      went_to_penalties = true;
    }
  }

  const row = {
    user_id: user.id,
    match_id: match.id,
    goals_a,
    goals_b,
    went_to_penalties,
    winner_team,
  };

  const { error } = await sb
    .from('predictions')
    .upsert(row, { onConflict: 'user_id,match_id' });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  revalidatePath(`/partido/${match.id}`);
  return { ok: true };
}
