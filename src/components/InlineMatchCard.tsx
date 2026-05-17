'use client';

import { useEffect, useRef, useState } from 'react';
import { FlagChip } from './FlagChip';
import { ScoreBox } from './ScoreBox';
import { StatusTag } from './StatusTag';
import { dayLabel, timeLabel } from '@/lib/dates';
import { isTbdCode } from '@/lib/flags';
import { savePrediction } from '@/app/partido/[id]/actions';
import type { Match, Prediction } from '@/types/db';

interface Props {
  match: Match;
  prediction: Prediction | null;
  onSaved?: (p: Prediction) => void;
  showDay?: boolean;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const DEBOUNCE_MS = 600;
// Sentinel para "empate" en el winner_team del backend (null = empate)
type Stage1Pick = 'A' | 'D' | 'B';

function pickFromPrediction(match: Match, p: Prediction | null): Stage1Pick | null {
  if (!p) return null;
  if (p.winner_team === match.team_a) return 'A';
  if (p.winner_team === match.team_b) return 'B';
  return 'D';
}

export function InlineMatchCard({ match, prediction, onSaved, showDay }: Props) {
  const isTbd = isTbdCode(match.team_a) || isTbdCode(match.team_b);
  const isStage1 = match.stage === 1;

  if (isStage1) {
    return (
      <Stage1Card
        match={match}
        prediction={prediction}
        onSaved={onSaved}
        showDay={showDay}
        isTbd={isTbd}
      />
    );
  }

  return (
    <KnockoutCard
      match={match}
      prediction={prediction}
      onSaved={onSaved}
      showDay={showDay}
      isTbd={isTbd}
    />
  );
}

// ─── STAGE 1: 3 botones (Gana A / Empate / Gana B) ────────────────
function Stage1Card({
  match,
  prediction,
  onSaved,
  showDay,
  isTbd,
}: Props & { isTbd: boolean }) {
  const [pick, setPick] = useState<Stage1Pick | null>(
    pickFromPrediction(match, prediction),
  );
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const lastSavedRef = useRef<Stage1Pick | null>(
    pickFromPrediction(match, prediction),
  );

  function pickToWinner(p: Stage1Pick): string | null {
    if (p === 'A') return match.team_a;
    if (p === 'B') return match.team_b;
    return null; // empate
  }

  async function choose(p: Stage1Pick) {
    if (isTbd) return;
    if (lastSavedRef.current === p) return;
    setPick(p);
    setState('saving');
    setError(null);
    const res = await savePrediction({
      matchId: match.id,
      goalsA: 0,
      goalsB: 0,
      wentToPenalties: false,
      winnerTeam: pickToWinner(p),
    });
    if (!res.ok) {
      setState('error');
      setError(res.error ?? 'Error');
      return;
    }
    lastSavedRef.current = p;
    setState('saved');
    onSaved?.({
      id: prediction?.id ?? '',
      user_id: prediction?.user_id ?? '',
      match_id: match.id,
      goals_a: 0,
      goals_b: 0,
      went_to_penalties: false,
      winner_team: pickToWinner(p),
      created_at: prediction?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setTimeout(() => setState('idle'), 1500);
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
      <header className="flex items-center justify-between gap-2">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-pb-muted truncate">
          {match.round}
          {showDay && ` · ${dayLabel(match.kickoff_at)}`} · {timeLabel(match.kickoff_at)}
        </span>
        <StatusTag status="scheduled" />
      </header>

      <div className="flex items-center justify-between gap-2">
        <TeamCol code={match.team_a} />
        <span className="font-display text-xs font-bold text-pb-muted">VS</span>
        <TeamCol code={match.team_b} />
      </div>

      {!isTbd && (
        <div className="grid grid-cols-3 gap-2">
          <PickBtn
            label={`Gana ${isTbdCode(match.team_a) ? 'A' : match.team_a}`}
            selected={pick === 'A'}
            onClick={() => choose('A')}
          />
          <PickBtn label="Empate" selected={pick === 'D'} onClick={() => choose('D')} />
          <PickBtn
            label={`Gana ${isTbdCode(match.team_b) ? 'B' : match.team_b}`}
            selected={pick === 'B'}
            onClick={() => choose('B')}
          />
        </div>
      )}

      {isTbd && (
        <p className="text-center font-display text-[10px] font-bold uppercase tracking-wider text-pb-muted">
          Equipos por definir — los pronósticos se habilitan cuando se sortee el cruce
        </p>
      )}

      <SaveIndicator state={state} error={error} hasPrediction={pick !== null} />
    </article>
  );
}

// ─── STAGE 2/3: igual que antes (goles + winner si empate) ────────
function KnockoutCard({
  match,
  prediction,
  onSaved,
  showDay,
  isTbd,
}: Props & { isTbd: boolean }) {
  const [goalsA, setGoalsA] = useState<number | null>(prediction?.goals_a ?? null);
  const [goalsB, setGoalsB] = useState<number | null>(prediction?.goals_b ?? null);
  const [winnerTie, setWinnerTie] = useState<string | null>(
    prediction?.winner_team ?? null,
  );
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastSavedRef = useRef({
    a: prediction?.goals_a ?? null,
    b: prediction?.goals_b ?? null,
    w: prediction?.winner_team ?? null,
  });

  const isTie = goalsA !== null && goalsB !== null && goalsA === goalsB;
  const needsWinner = isTie;
  const canSave =
    !isTbd && goalsA !== null && goalsB !== null && (!needsWinner || !!winnerTie);

  useEffect(() => {
    if (!canSave) return;
    const last = lastSavedRef.current;
    const effectiveWinner = needsWinner ? winnerTie : null;
    if (last.a === goalsA && last.b === goalsB && last.w === effectiveWinner) {
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      void doSave();
    }, DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalsA, goalsB, winnerTie]);

  async function doSave() {
    if (goalsA === null || goalsB === null) return;
    setState('saving');
    setError(null);
    const res = await savePrediction({
      matchId: match.id,
      goalsA,
      goalsB,
      wentToPenalties: needsWinner,
      winnerTeam: needsWinner ? winnerTie : null,
    });
    if (!res.ok) {
      setState('error');
      setError(res.error ?? 'Error');
      return;
    }
    lastSavedRef.current = {
      a: goalsA,
      b: goalsB,
      w: needsWinner ? winnerTie : null,
    };
    setState('saved');
    onSaved?.({
      id: prediction?.id ?? '',
      user_id: prediction?.user_id ?? '',
      match_id: match.id,
      goals_a: goalsA,
      goals_b: goalsB,
      went_to_penalties: needsWinner,
      winner_team: needsWinner ? winnerTie : null,
      created_at: prediction?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setTimeout(() => setState('idle'), 1500);
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
      <header className="flex items-center justify-between gap-2">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-pb-muted truncate">
          {match.round}
          {showDay && ` · ${dayLabel(match.kickoff_at)}`} · {timeLabel(match.kickoff_at)}
        </span>
        <StatusTag status="scheduled" />
      </header>

      <div className="flex items-center justify-between gap-2">
        <TeamCol code={match.team_a} />
        <div className="flex items-center gap-2">
          <ScoreBox
            value={goalsA}
            onChange={setGoalsA}
            disabled={isTbd}
            highlight={!isTbd && goalsA !== null}
          />
          <span className="font-display text-lg font-bold text-pb-muted">:</span>
          <ScoreBox
            value={goalsB}
            onChange={setGoalsB}
            disabled={isTbd}
            highlight={!isTbd && goalsB !== null}
          />
        </div>
        <TeamCol code={match.team_b} />
      </div>

      {isTbd && (
        <p className="text-center font-display text-[10px] font-bold uppercase tracking-wider text-pb-muted">
          Equipos por definir — los pronósticos se habilitan cuando se sortee el cruce
        </p>
      )}

      {needsWinner && (
        <div className="flex flex-col gap-1.5">
          <span className="font-display text-[10px] font-bold uppercase tracking-wider text-pb-muted">
            Empate → ¿quién pasa por penales?
          </span>
          <div className="grid grid-cols-2 gap-2">
            <WinnerBtn
              code={match.team_a}
              selected={winnerTie === match.team_a}
              onClick={() => setWinnerTie(match.team_a)}
            />
            <WinnerBtn
              code={match.team_b}
              selected={winnerTie === match.team_b}
              onClick={() => setWinnerTie(match.team_b)}
            />
          </div>
        </div>
      )}

      <SaveIndicator state={state} error={error} hasPrediction={!!prediction || canSave} />
    </article>
  );
}

function TeamCol({ code }: { code: string }) {
  const tbd = isTbdCode(code);
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
      <FlagChip code={code} size={32} />
      <span
        className={
          'font-display text-[11px] font-bold uppercase tracking-wider ' +
          (tbd ? 'text-pb-muted' : 'text-pb-deep-blue')
        }
      >
        {tbd ? 'TBD' : code}
      </span>
    </div>
  );
}

function PickBtn({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-xl px-2 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition ' +
        (selected
          ? 'bg-pb-navy text-white shadow-[0_2px_6px_rgba(11,29,94,0.18)]'
          : 'bg-pb-bg-gray text-pb-deep-blue hover:bg-pb-very-light-blue')
      }
    >
      {label}
    </button>
  );
}

function WinnerBtn({
  code,
  selected,
  onClick,
}: {
  code: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 font-display text-xs font-bold transition ' +
        (selected
          ? 'bg-pb-navy text-white'
          : 'bg-pb-bg-gray text-pb-deep-blue hover:bg-pb-very-light-blue')
      }
    >
      <FlagChip code={code} size={18} />
      {code}
    </button>
  );
}

function SaveIndicator({
  state,
  error,
  hasPrediction,
}: {
  state: SaveState;
  error: string | null;
  hasPrediction: boolean;
}) {
  if (state === 'saving') {
    return (
      <span className="self-end font-display text-[10px] font-bold uppercase tracking-wider text-pb-muted">
        Guardando…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="self-end font-display text-[10px] font-bold uppercase tracking-wider text-pb-green-dark">
        ✓ Guardado
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="self-end font-display text-[10px] font-bold uppercase tracking-wider text-pb-red-dark">
        {error ?? 'Error'}
      </span>
    );
  }
  return (
    <span
      className={
        'self-end font-display text-[10px] font-bold uppercase tracking-wider ' +
        (hasPrediction ? 'text-pb-ceruleo' : 'text-pb-muted')
      }
    >
      {hasPrediction ? '✓ Pronóstico cargado' : 'Cargá tu pronóstico'}
    </span>
  );
}
