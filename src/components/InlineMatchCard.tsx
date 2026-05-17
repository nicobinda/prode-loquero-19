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

export function InlineMatchCard({ match, prediction, onSaved, showDay }: Props) {
  const [goalsA, setGoalsA] = useState<number | null>(prediction?.goals_a ?? null);
  const [goalsB, setGoalsB] = useState<number | null>(prediction?.goals_b ?? null);
  const [winnerTie, setWinnerTie] = useState<string | null>(
    prediction?.winner_team ?? null,
  );
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Snapshot del último estado persistido (inicializado con lo que vino del server)
  const lastSavedRef = useRef({
    a: prediction?.goals_a ?? null,
    b: prediction?.goals_b ?? null,
    w: prediction?.winner_team ?? null,
  });

  const isTbd = isTbdCode(match.team_a) || isTbdCode(match.team_b);
  const isKnockout = match.stage > 1;
  const isTie = goalsA !== null && goalsB !== null && goalsA === goalsB;
  const needsWinner = isKnockout && isTie;
  const canSave =
    !isTbd && goalsA !== null && goalsB !== null && (!needsWinner || !!winnerTie);

  // Debounced auto-save — solo si hubo cambio real desde el último guardado
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
