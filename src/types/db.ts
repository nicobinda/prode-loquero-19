// Tipos del dominio PRODE BINDA

export type Stage = 1 | 2 | 3;
export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type TeamCode = string; // ISO 3-letras

export interface User {
  id: string;
  dni: string;
  pin_hash: string;
  nickname: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  first_login_at: string | null;
}

export interface Match {
  id: string;
  external_id: number; // fixture id de API-Football
  stage: Stage;
  round: string; // "Group A" | "Round of 16" | "Quarter-finals" | etc.
  team_a: TeamCode;
  team_b: TeamCode;
  kickoff_at: string; // ISO datetime UTC
  status: MatchStatus;
  goals_a: number | null; // tiempo regular + prórroga, sin penales
  goals_b: number | null;
  went_to_penalties: boolean;
  winner_team: TeamCode | null; // null en grupos si empate
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  goals_a: number;
  goals_b: number;
  went_to_penalties: boolean; // solo aplica stage 2 y 3
  winner_team: TeamCode | null; // null = empate (solo stage 1)
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface Payment {
  user_id: string;
  paid: boolean;
  paid_at: string | null;
  notes: string | null;
}
