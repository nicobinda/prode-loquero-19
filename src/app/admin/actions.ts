'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/getCurrentUser';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidDni, normalizeDni } from '@/lib/auth/pin';

type ActionResult = { ok: boolean; error?: string };

async function logAudit(
  adminId: string,
  action: string,
  target: string | null,
  payload: Record<string, unknown> | null,
) {
  await supabaseAdmin().from('audit_log').insert({
    admin_id: adminId,
    action,
    target,
    payload,
  });
}

export async function addPlayer(rawDni: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const dni = normalizeDni(rawDni);
  if (!isValidDni(dni)) return { ok: false, error: 'DNI inválido' };

  const sb = supabaseAdmin();
  const { data: existing } = await sb
    .from('users')
    .select('id')
    .eq('dni', dni)
    .maybeSingle();
  if (existing) return { ok: false, error: 'Ese DNI ya está cargado' };

  const { error } = await sb.from('users').insert({ dni, is_admin: false });
  if (error) return { ok: false, error: error.message };

  await logAudit(admin.id, 'add_player', dni, null);
  revalidatePath('/admin');
  return { ok: true };
}

export async function removePlayer(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    return { ok: false, error: 'No te podés borrar a vos mismo' };
  }
  const sb = supabaseAdmin();
  const { error } = await sb.from('users').delete().eq('id', userId);
  if (error) return { ok: false, error: error.message };
  await logAudit(admin.id, 'remove_player', userId, null);
  revalidatePath('/admin');
  return { ok: true };
}

export async function resetPin(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const sb = supabaseAdmin();
  const { error } = await sb
    .from('users')
    .update({ pin_hash: null, failed_attempts: 0, locked_until: null })
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  await logAudit(admin.id, 'reset_pin', userId, null);
  revalidatePath('/admin');
  return { ok: true };
}

export async function togglePayment(
  userId: string,
  paid: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const sb = supabaseAdmin();
  const { error } = await sb.from('payments').upsert({
    user_id: userId,
    paid,
    paid_at: paid ? new Date().toISOString() : null,
  });
  if (error) return { ok: false, error: error.message };
  await logAudit(admin.id, paid ? 'mark_paid' : 'mark_unpaid', userId, null);
  revalidatePath('/admin');
  return { ok: true };
}

export interface MatchOverrideInput {
  matchId: string;
  goalsA: number;
  goalsB: number;
  wentToPenalties: boolean;
  winnerTeam: string | null;
  markFinished: boolean;
}

// ============================================================
// SIMULADOR — para testing. Setea resultados random + en cascada
// llena los TBD de la fase siguiente con teams al azar (mocking la API).
// ============================================================

function randomScore(): number {
  const r = Math.random();
  if (r < 0.25) return 0;
  if (r < 0.55) return 1;
  if (r < 0.78) return 2;
  if (r < 0.92) return 3;
  if (r < 0.98) return 4;
  return 5;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface SimMatch {
  id: string;
  stage: number;
  round: string;
  team_a: string;
  team_b: string;
  winner_team: string | null;
}

async function simulateRound(round: string): Promise<SimMatch[]> {
  const sb = supabaseAdmin();
  const { data: matches } = await sb
    .from('matches')
    .select('id, stage, round, team_a, team_b')
    .eq('round', round)
    .order('kickoff_at', { ascending: true });

  if (!matches || matches.length === 0) return [];

  const simmed: SimMatch[] = [];

  for (const m of matches) {
    const a = randomScore();
    const b = randomScore();
    let winner: string | null = null;
    let wentToPenalties = false;

    if (m.stage === 1) {
      if (a > b) winner = m.team_a;
      else if (b > a) winner = m.team_b;
    } else {
      if (a > b) winner = m.team_a;
      else if (b > a) winner = m.team_b;
      else {
        winner = Math.random() < 0.5 ? m.team_a : m.team_b;
        wentToPenalties = true;
      }
    }

    await sb
      .from('matches')
      .update({
        goals_a: a,
        goals_b: b,
        winner_team: winner,
        went_to_penalties: wentToPenalties,
        status: 'finished',
      })
      .eq('id', m.id);

    simmed.push({ ...m, winner_team: winner });
  }

  return simmed;
}

async function fillRound(round: string, teams: string[]): Promise<void> {
  const sb = supabaseAdmin();
  const { data: matches } = await sb
    .from('matches')
    .select('id')
    .eq('round', round)
    .order('kickoff_at', { ascending: true });

  if (!matches) return;
  for (let i = 0; i < matches.length; i++) {
    const teamA = teams[i * 2];
    const teamB = teams[i * 2 + 1];
    if (!teamA || !teamB) continue;
    await sb
      .from('matches')
      .update({ team_a: teamA, team_b: teamB })
      .eq('id', matches[i].id);
  }
}

async function getPhase1Teams(): Promise<string[]> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('matches')
    .select('team_a, team_b')
    .eq('stage', 1);
  const set = new Set<string>();
  for (const m of data ?? []) {
    if (m.team_a && !m.team_a.startsWith('_')) set.add(m.team_a);
    if (m.team_b && !m.team_b.startsWith('_')) set.add(m.team_b);
  }
  return [...set];
}

async function hasRealTeams(round: string): Promise<boolean> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('matches')
    .select('team_a, team_b')
    .eq('round', round)
    .limit(1);
  const m = data?.[0];
  if (!m) return false;
  return !m.team_a.startsWith('_') && !m.team_b.startsWith('_');
}

export async function simulateStage(stage: 1 | 2 | 3): Promise<ActionResult> {
  const admin = await requireAdmin();
  const sb = supabaseAdmin();

  // Identificar las rounds de cada stage
  const groupRoundsRes = stage === 1
    ? await sb.from('matches').select('round').eq('stage', 1)
    : { data: null };

  if (stage === 1) {
    // 1. Simular todos los grupos
    const rounds = [
      ...new Set((groupRoundsRes.data ?? []).map((m) => m.round)),
    ];
    if (rounds.length === 0) {
      return { ok: false, error: 'No hay partidos en Fase 1' };
    }
    for (const r of rounds) {
      await simulateRound(r);
    }

    // 2. Llenar 16vos de Final con 32 teams random de Fase 1
    const teams = await getPhase1Teams();
    if (teams.length < 32) {
      // Igual continuamos, pero avisamos
    }
    const qualifiers = shuffle(teams).slice(0, 32);
    await fillRound('16vos de Final', qualifiers);
  } else if (stage === 2) {
    // Requiere que 16vos de Final tenga teams reales
    if (!(await hasRealTeams('16vos de Final'))) {
      return {
        ok: false,
        error: 'Antes simulá la Fase 1 (necesito teams para 16vos)',
      };
    }
    // 1. Simular 16vos
    const r32 = await simulateRound('16vos de Final');
    // 2. Llenar 8vos con winners
    const r32winners = r32.map((m) => m.winner_team).filter(Boolean) as string[];
    await fillRound('Octavos de Final', shuffle(r32winners));
    // 3. Simular 8vos
    const r16 = await simulateRound('Octavos de Final');
    // 4. Llenar Cuartos con winners
    const r16winners = r16.map((m) => m.winner_team).filter(Boolean) as string[];
    await fillRound('Cuartos de Final', shuffle(r16winners));
  } else {
    // stage === 3
    if (!(await hasRealTeams('Cuartos de Final'))) {
      return {
        ok: false,
        error: 'Antes simulá la Fase 2 (necesito teams para Cuartos)',
      };
    }
    // 1. Simular cuartos
    const qf = await simulateRound('Cuartos de Final');
    const qfWinners = qf.map((m) => m.winner_team).filter(Boolean) as string[];
    // 2. Llenar semis
    await fillRound('Semifinal', shuffle(qfWinners));
    // 3. Simular semis
    const sf = await simulateRound('Semifinal');
    const sfWinners: string[] = [];
    const sfLosers: string[] = [];
    for (const m of sf) {
      if (m.winner_team === m.team_a) {
        sfWinners.push(m.team_a);
        sfLosers.push(m.team_b);
      } else {
        sfWinners.push(m.team_b);
        sfLosers.push(m.team_a);
      }
    }
    // 4. Llenar Final y Tercer Puesto
    await fillRound('Final', sfWinners);
    await fillRound('Tercer Puesto', sfLosers);
    // 5. Simular ambos
    await simulateRound('Final');
    await simulateRound('Tercer Puesto');
  }

  await logAudit(admin.id, 'simulate_stage', String(stage), {
    cascade: stage < 3,
  });

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/ranking');
  return { ok: true };
}

export async function resetStage(stage: 1 | 2 | 3): Promise<ActionResult> {
  const admin = await requireAdmin();
  const sb = supabaseAdmin();

  const { error } = await sb
    .from('matches')
    .update({
      goals_a: null,
      goals_b: null,
      winner_team: null,
      went_to_penalties: false,
      status: 'scheduled',
    })
    .eq('stage', stage);

  if (error) return { ok: false, error: error.message };

  await logAudit(admin.id, 'reset_stage', String(stage), null);
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/ranking');
  return { ok: true };
}

export async function overrideMatch(
  input: MatchOverrideInput,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const sb = supabaseAdmin();
  const update: Record<string, unknown> = {
    goals_a: input.goalsA,
    goals_b: input.goalsB,
    went_to_penalties: input.wentToPenalties,
    winner_team: input.winnerTeam,
  };
  if (input.markFinished) update.status = 'finished';

  const { error } = await sb.from('matches').update(update).eq('id', input.matchId);
  if (error) return { ok: false, error: error.message };

  await logAudit(admin.id, 'override_match', input.matchId, input as unknown as Record<string, unknown>);
  revalidatePath('/admin');
  revalidatePath('/');
  return { ok: true };
}
