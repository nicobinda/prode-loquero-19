'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FlagChip } from '@/components/FlagChip';
import { PBButton } from '@/components/PBButton';
import { ScoreBox } from '@/components/ScoreBox';
import { dayLabel, timeLabel } from '@/lib/dates';
import type { Match } from '@/types/db';
import { overrideMatch } from './actions';

interface Props {
  matches: Match[];
}

export function MatchOverridePanel({ matches }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string>('');
  const [goalsA, setGoalsA] = useState<number | null>(null);
  const [goalsB, setGoalsB] = useState<number | null>(null);
  const [wentToPenalties, setWentToPenalties] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [markFinished, setMarkFinished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selected = useMemo(
    () => matches.find((m) => m.id === selectedId) ?? null,
    [matches, selectedId],
  );

  // Pre-cargar valores al seleccionar
  function selectMatch(id: string) {
    setSelectedId(id);
    const m = matches.find((x) => x.id === id);
    if (m) {
      setGoalsA(m.goals_a);
      setGoalsB(m.goals_b);
      setWentToPenalties(m.went_to_penalties);
      setWinner(m.winner_team);
      setMarkFinished(m.status !== 'scheduled');
    }
    setError(null);
    setSuccess(false);
  }

  function submit() {
    if (!selected) return;
    if (goalsA === null || goalsB === null) {
      setError('Completá los dos marcadores');
      return;
    }
    let winnerToSave = winner;
    if (selected.stage > 1) {
      if (goalsA > goalsB) winnerToSave = selected.team_a;
      else if (goalsA < goalsB) winnerToSave = selected.team_b;
      else if (!winner) {
        setError('Empate en knockout — elegí quién pasa');
        return;
      }
    } else {
      winnerToSave = null;
    }

    startTransition(async () => {
      const res = await overrideMatch({
        matchId: selected.id,
        goalsA,
        goalsB,
        wentToPenalties: selected.stage > 1 && wentToPenalties,
        winnerTeam: winnerToSave,
        markFinished,
      });
      if (!res.ok) {
        setError(res.error ?? 'Error');
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 1500);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        value={selectedId}
        onChange={(e) => selectMatch(e.target.value)}
        className="w-full rounded-xl border border-pb-border bg-white px-3 py-2 text-sm focus:border-pb-ceruleo focus:outline-none focus:ring-4 focus:ring-pb-ceruleo/20"
      >
        <option value="">Elegí un partido…</option>
        {matches.map((m) => (
          <option key={m.id} value={m.id}>
            [{m.status}] {dayLabel(m.kickoff_at)} {timeLabel(m.kickoff_at)} ·{' '}
            {m.team_a} vs {m.team_b} — {m.round}
          </option>
        ))}
      </select>

      {selected && (
        <div className="flex flex-col gap-3 rounded-2xl border border-pb-border p-3">
          <div className="flex items-center justify-between gap-2">
            <TeamCol code={selected.team_a} />
            <div className="flex items-center gap-1.5">
              <ScoreBox value={goalsA} onChange={setGoalsA} />
              <span className="font-display text-base font-bold text-pb-muted">
                :
              </span>
              <ScoreBox value={goalsB} onChange={setGoalsB} />
            </div>
            <TeamCol code={selected.team_b} />
          </div>

          {selected.stage > 1 && (
            <>
              <label className="flex items-center gap-2 text-sm text-pb-deep-blue">
                <input
                  type="checkbox"
                  checked={wentToPenalties}
                  onChange={(e) => setWentToPenalties(e.target.checked)}
                />
                Fue a penales
              </label>
              {goalsA !== null && goalsB !== null && goalsA === goalsB && (
                <div className="flex flex-col gap-1.5">
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider text-pb-muted">
                    Empate → ¿quién pasa?
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <WinnerBtn
                      code={selected.team_a}
                      selected={winner === selected.team_a}
                      onClick={() => setWinner(selected.team_a)}
                    />
                    <WinnerBtn
                      code={selected.team_b}
                      selected={winner === selected.team_b}
                      onClick={() => setWinner(selected.team_b)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <label className="flex items-center gap-2 text-sm text-pb-deep-blue">
            <input
              type="checkbox"
              checked={markFinished}
              onChange={(e) => setMarkFinished(e.target.checked)}
            />
            Marcar partido como finalizado
          </label>

          {error && (
            <p className="rounded-xl bg-pb-red/10 px-3 py-2 text-xs font-semibold text-pb-red-dark">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-pb-green/15 px-3 py-2 text-xs font-bold text-pb-navy">
              ✓ Resultado actualizado
            </p>
          )}

          <PBButton onClick={submit} disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar override'}
          </PBButton>
        </div>
      )}
    </div>
  );
}

function TeamCol({ code }: { code: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
      <FlagChip code={code} size={28} />
      <span className="font-display text-[11px] font-bold uppercase tracking-wider text-pb-deep-blue">
        {code}
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
