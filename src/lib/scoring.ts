// Cálculo de puntajes según las reglas de PRODE LOQUERO 19.
// Etapa 1: solo "gana A / empate / gana B" → 1 punto por acertar.
// Etapas 2 y 3: como Binda (quién pasa, goles exactos, penales).

import type { Match, Prediction, Stage } from '@/types/db';

export function pointsForMatch(m: Match, p: Prediction | null): number {
  if (!p || m.status !== 'finished') return 0;
  if (m.goals_a === null || m.goals_b === null) return 0;

  if (m.stage === 1) {
    // Solo importa quién gana (o empate). +1 por acertar.
    const realWinner =
      m.goals_a > m.goals_b ? m.team_a :
      m.goals_a < m.goals_b ? m.team_b :
      null;
    return p.winner_team === realWinner ? 1 : 0;
  }

  // Stage 2 y 3: knockout
  const exactA = p.goals_a === m.goals_a ? 1 : 0;
  const exactB = p.goals_b === m.goals_b ? 1 : 0;
  const advance = p.winner_team === m.winner_team ? 1 : 0;
  // El punto de penales solo se da si predijo penales Y el partido fue a penales.
  const penalties = p.went_to_penalties && m.went_to_penalties ? 1 : 0;

  // Adivinar quién pasa vale 1 punto más que cada gol exacto.
  const goalsPts: number = m.stage === 2 ? 2 : 3;
  const advancePts: number = goalsPts + 1; // stage 2: 3, stage 3: 4
  const penaltyPts = 1;

  return advance * advancePts + exactA * goalsPts + exactB * goalsPts + penalties * penaltyPts;
}

export function maxPointsForStage(stage: Stage): number {
  if (stage === 1) return 1;
  if (stage === 2) return 3 + 2 + 2 + 1;   // 8 por partido
  return 4 + 3 + 3 + 1;                     // 11 por partido
}
