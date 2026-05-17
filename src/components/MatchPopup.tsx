'use client';

import { useEffect } from 'react';
import { FlagChip } from './FlagChip';
import { StatusTag } from './StatusTag';
import { Avatar } from './Avatar';
import { dayLabel, timeLabel } from '@/lib/dates';
import { pointsForMatch } from '@/lib/scoring';
import type { Match, Prediction } from '@/types/db';

export interface PredWithUser extends Prediction {
  user: { id: string; nickname: string | null; avatar_url: string | null };
}

interface Props {
  match: Match;
  preds: PredWithUser[];
  currentUserId: string;
  onClose: () => void;
}

export function MatchPopup({ match, preds, currentUserId, onClose }: Props) {
  // Cerrar con Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sorted = [...preds].sort((a, b) => {
    if (a.user.id === currentUserId) return -1;
    if (b.user.id === currentUserId) return 1;
    if (match.status === 'finished') {
      return pointsForMatch(match, b) - pointsForMatch(match, a);
    }
    return 0;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-pb-bg shadow-2xl sm:rounded-3xl">
        <header className="flex items-center justify-between gap-3 bg-white px-5 pb-4 pt-5">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-wider text-pb-muted">
              {match.round}
            </p>
            <p className="mt-0.5 font-display text-sm font-semibold text-pb-deep-blue">
              {dayLabel(match.kickoff_at)} · {timeLabel(match.kickoff_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full bg-pb-bg-gray text-pb-deep-blue hover:bg-pb-very-light-blue"
          >
            ✕
          </button>
        </header>

        <div className="bg-white px-5 pb-5">
          <div className="flex items-center justify-between">
            <TeamBig code={match.team_a} score={match.goals_a} />
            <div className="flex flex-col items-center gap-2">
              <StatusTag status={match.status} />
              {match.went_to_penalties && (
                <span className="font-display text-[10px] font-bold uppercase tracking-wider text-pb-violeta">
                  Penales
                </span>
              )}
            </div>
            <TeamBig code={match.team_b} score={match.goals_b} />
          </div>
        </div>

        <section className="flex-1 overflow-y-auto px-5 py-5">
          <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-pb-muted">
            Pronósticos
          </h3>

          {sorted.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-center text-sm text-pb-muted shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
              Nadie cargó pronóstico para este partido.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sorted.map((p) => {
                const pts =
                  match.status === 'finished' ? pointsForMatch(match, p) : null;
                const isMe = p.user.id === currentUserId;
                return (
                  <li
                    key={p.id}
                    className={
                      'flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_4px_12px_rgba(11,29,94,0.06)] ' +
                      (isMe ? 'ring-2 ring-pb-ceruleo' : '')
                    }
                  >
                    <Avatar
                      src={p.user.avatar_url}
                      nickname={p.user.nickname ?? '?'}
                      size={36}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-bold text-pb-deep-blue truncate">
                        {p.user.nickname}
                        {isMe && (
                          <span className="ml-2 text-xs text-pb-ceruleo">(vos)</span>
                        )}
                      </p>
                      <p className="text-xs text-pb-muted">
                        {p.goals_a} – {p.goals_b}
                        {match.stage > 1 && p.went_to_penalties && ' · penales'}
                        {match.stage > 1 && p.winner_team && ` · pasa ${p.winner_team}`}
                      </p>
                    </div>
                    {pts !== null && (
                      <span className="rounded-full bg-pb-navy px-3 py-1 font-display text-sm font-black text-white">
                        +{pts}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function TeamBig({ code, score }: { code: string; score: number | null }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <FlagChip code={code} size={44} />
      <span className="font-display text-xs font-bold text-pb-deep-blue">{code}</span>
      <span className="font-display text-3xl font-black text-pb-navy">
        {score ?? '–'}
      </span>
    </div>
  );
}
