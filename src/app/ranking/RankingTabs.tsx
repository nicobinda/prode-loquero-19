'use client';

import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { SegmentTabs } from '@/components/SegmentTabs';
import { sortByStage, type RankingRow } from '@/lib/ranking';
import type { Stage } from '@/types/db';

type View = 'general' | 'stage1' | 'stage2' | 'stage3';

interface Props {
  ranking: RankingRow[];
  currentUserId: string;
  stageFinished: Record<Stage, boolean>;
}

const TABS: Array<{ id: View; label: string }> = [
  { id: 'stage1', label: 'Fase 1' },
  { id: 'stage2', label: 'Fase 2' },
  { id: 'stage3', label: 'Fase 3' },
  { id: 'general', label: 'General' },
];

export function RankingTabs({ ranking, currentUserId, stageFinished }: Props) {
  // Default: la fase más baja que no haya terminado. Si todas terminaron, "general".
  const defaultView: View = !stageFinished[1]
    ? 'stage1'
    : !stageFinished[2]
      ? 'stage2'
      : !stageFinished[3]
        ? 'stage3'
        : 'general';
  const [view, setView] = useState<View>(defaultView);

  const stage: Stage | null =
    view === 'stage1' ? 1 : view === 'stage2' ? 2 : view === 'stage3' ? 3 : null;

  const rows = stage ? sortByStage(ranking, stage) : ranking;
  const winners =
    stage && stageFinished[stage] ? computeWinners(rows, stage) : null;

  return (
    <>
      <SegmentTabs tabs={TABS} active={view} onChange={setView} />

      {winners && <ChampionBanner winners={winners} stage={stage!} />}

      <ol className="flex flex-col gap-2">
        {rows.length === 0 && (
          <li className="rounded-2xl bg-white p-6 text-center text-sm text-pb-muted shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
            Aún no hay datos para mostrar.
          </li>
        )}
        {rows.map((r, i) => {
          const pts = stage ? r.byStage[stage] : r.total;
          const isMe = r.user.id === currentUserId;
          return (
            <li
              key={r.user.id}
              className={
                'flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_4px_12px_rgba(11,29,94,0.06)] ' +
                (isMe ? 'ring-2 ring-pb-ceruleo' : '')
              }
            >
              <div className="w-7 text-center font-display text-base font-black text-pb-muted">
                {i + 1}
              </div>
              <Avatar
                src={r.user.avatar_url}
                nickname={r.user.nickname ?? '?'}
                size={40}
              />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-pb-deep-blue truncate">
                  {r.user.nickname}
                  {isMe && (
                    <span className="ml-2 text-xs text-pb-ceruleo">(vos)</span>
                  )}
                </p>
                <p className="text-xs text-pb-muted">
                  {r.finishedMatches} {r.finishedMatches === 1 ? 'partido' : 'partidos'}
                </p>
              </div>
              <span className="rounded-full bg-pb-navy px-3 py-1 font-display text-sm font-black text-white">
                {pts} pts
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function computeWinners(rows: RankingRow[], stage: Stage): RankingRow[] {
  if (rows.length === 0) return [];
  const top = rows[0].byStage[stage];
  return rows.filter((r) => r.byStage[stage] === top && top > 0);
}

function ChampionBanner({ winners, stage }: { winners: RankingRow[]; stage: Stage }) {
  if (winners.length === 0) return null;
  const stageLabel =
    stage === 1 ? 'la Fase de Grupos' : stage === 2 ? 'la Etapa de Eliminatorias' : 'la Fase Final';
  return (
    <div className="rounded-3xl bg-pb-navy p-5 text-white shadow-[0_4px_16px_rgba(11,29,94,0.25)]">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.10em] text-pb-ceruleo">
        Campeón{winners.length > 1 ? 'es' : ''} de {stageLabel}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {winners.map((w) => (
          <div key={w.user.id} className="flex items-center gap-2">
            <Avatar
              src={w.user.avatar_url}
              nickname={w.user.nickname ?? '?'}
              size={40}
              ring
            />
            <div>
              <p className="font-display text-base font-black">{w.user.nickname}</p>
              <p className="font-display text-xs font-bold text-pb-light-blue">
                {w.byStage[stage]} pts
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
