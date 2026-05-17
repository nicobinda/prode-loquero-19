'use client';

import { FlagChip } from './FlagChip';
import { StatusTag } from './StatusTag';
import { dayLabel, timeLabel } from '@/lib/dates';
import { isTbdCode } from '@/lib/flags';
import type { Match, Prediction } from '@/types/db';
import { pointsForMatch } from '@/lib/scoring';

interface Props {
  match: Match;
  myPrediction: Prediction | null;
  onOpen: () => void;
  showDay?: boolean;
}

export function LockedMatchCard({ match, myPrediction, onOpen, showDay }: Props) {
  const myPoints =
    match.status === 'finished' && myPrediction
      ? pointsForMatch(match, myPrediction)
      : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 text-left shadow-[0_4px_12px_rgba(11,29,94,0.06)] transition hover:shadow-[0_6px_16px_rgba(11,29,94,0.10)] active:translate-y-px"
    >
      <header className="flex items-center justify-between gap-2">
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-pb-muted truncate">
          {match.round}
          {showDay && ` · ${dayLabel(match.kickoff_at)}`} · {timeLabel(match.kickoff_at)}
        </span>
        <StatusTag status={match.status} />
      </header>

      <div className="flex items-center justify-between gap-2">
        <TeamCol code={match.team_a} />
        <div className="flex items-center gap-2">
          <ScoreBig value={match.goals_a} />
          <span className="font-display text-base font-bold text-pb-muted">:</span>
          <ScoreBig value={match.goals_b} />
        </div>
        <TeamCol code={match.team_b} />
      </div>

      <footer className="flex items-center justify-between text-xs">
        <span className="rounded-full bg-pb-very-light-blue px-2.5 py-1 font-display font-bold text-pb-navy">
          Ver pronósticos
        </span>
        {myPoints !== null && (
          <span className="rounded-full bg-pb-navy px-3 py-1 font-display font-black text-white">
            +{myPoints} pts
          </span>
        )}
      </footer>
    </button>
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

function ScoreBig({ value }: { value: number | null }) {
  return (
    <span className="inline-flex h-10 min-w-[36px] items-center justify-center font-display text-2xl font-black text-pb-navy">
      {value ?? '–'}
    </span>
  );
}
