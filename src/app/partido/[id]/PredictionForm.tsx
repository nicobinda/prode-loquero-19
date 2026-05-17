'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PBButton } from '@/components/PBButton';
import { ScoreBox } from '@/components/ScoreBox';
import { FlagChip } from '@/components/FlagChip';
import type { Match, Prediction } from '@/types/db';
import { savePrediction } from './actions';

interface Props {
  match: Match;
  initial: Prediction | null;
}

export function PredictionForm({ match, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [goalsA, setGoalsA] = useState<number | null>(initial?.goals_a ?? null);
  const [goalsB, setGoalsB] = useState<number | null>(initial?.goals_b ?? null);
  const [winner, setWinner] = useState<string | null>(initial?.winner_team ?? null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isKnockout = match.stage > 1;
  const isDraw = goalsA !== null && goalsB !== null && goalsA === goalsB;
  const needsWinner = isKnockout && isDraw;

  function submit() {
    if (goalsA === null || goalsB === null) {
      setError('Cargá los dos goles');
      return;
    }
    if (needsWinner && !winner) {
      setError('Si empatan, elegí quién pasa por penales');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await savePrediction({
        matchId: match.id,
        goalsA,
        goalsB,
        wentToPenalties: needsWinner,
        winnerTeam: needsWinner ? winner : null,
      });
      if (!res.ok) {
        setError(res.error ?? 'Error');
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 2000);
    });
  }

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-[0_4px_12px_rgba(11,29,94,0.08)]">
      <h2 className="font-display text-base font-bold text-pb-navy">
        Tu pronóstico
      </h2>

      <div className="flex items-center justify-around">
        <div className="flex flex-col items-center gap-2">
          <FlagChip code={match.team_a} size={32} />
          <span className="font-display text-xs font-bold text-pb-deep-blue">
            {match.team_a}
          </span>
          <ScoreBox value={goalsA} onChange={setGoalsA} />
        </div>
        <span className="font-display text-2xl font-black text-pb-muted">–</span>
        <div className="flex flex-col items-center gap-2">
          <FlagChip code={match.team_b} size={32} />
          <span className="font-display text-xs font-bold text-pb-deep-blue">
            {match.team_b}
          </span>
          <ScoreBox value={goalsB} onChange={setGoalsB} />
        </div>
      </div>

      {needsWinner && (
        <div className="flex flex-col gap-2">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-pb-muted">
            ¿Quién pasa por penales?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <WinnerPick
              code={match.team_a}
              selected={winner === match.team_a}
              onClick={() => setWinner(match.team_a)}
            />
            <WinnerPick
              code={match.team_b}
              selected={winner === match.team_b}
              onClick={() => setWinner(match.team_b)}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-pb-red/10 px-4 py-3 text-sm font-semibold text-pb-red-dark">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl bg-pb-green/15 px-4 py-3 text-sm font-bold text-pb-navy">
          ✓ Pronóstico guardado
        </p>
      )}

      <PBButton
        onClick={submit}
        disabled={pending || goalsA === null || goalsB === null}
      >
        {pending ? 'Guardando…' : initial ? 'Actualizar' : 'Guardar pronóstico'}
      </PBButton>
    </section>
  );
}

function WinnerPick({
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
        'flex items-center justify-center gap-2 rounded-2xl px-3 py-3 font-display text-sm font-bold transition ' +
        (selected
          ? 'bg-pb-navy text-white'
          : 'bg-pb-bg-gray text-pb-deep-blue hover:bg-pb-very-light-blue')
      }
    >
      <FlagChip code={code} size={24} />
      {code}
    </button>
  );
}
