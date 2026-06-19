'use client';

import { useEffect, useMemo, useState } from 'react';
import { Avatar } from './Avatar';
import { InlineMatchCard } from './InlineMatchCard';
import { LockedMatchCard } from './LockedMatchCard';
import { MatchPopup, type PredWithUser } from './MatchPopup';
import { SegmentTabs } from './SegmentTabs';
import { dayKey, dayLabel, hasKickedOff } from '@/lib/dates';
import { isTbdCode } from '@/lib/flags';
import type { Match, Prediction, Stage } from '@/types/db';

type GroupBy = 'day' | 'zone';

interface Props {
  matches: Match[];
  myPredictions: Prediction[];
  lockedPreds: PredWithUser[];
  currentUserId: string;
  userNickname: string;
  userAvatarUrl: string | null;
}

const PHASE_META: Record<
  Stage,
  { label: string; full: string; expected: number; zoneLabel: string }
> = {
  1: {
    label: 'Fase 1',
    full: 'Fase de Grupos',
    expected: 72,
    zoneLabel: 'Por Zona',
  },
  2: {
    label: 'Fase 2',
    full: '16vos · 8vos',
    expected: 24,
    zoneLabel: 'Por Etapa',
  },
  3: {
    label: 'Fase 3',
    full: 'Cuartos · Semis · Final',
    expected: 8,
    zoneLabel: 'Por Etapa',
  },
};

const LS_GROUPBY = 'pb_home_groupby';

export function HomeContent({
  matches,
  myPredictions,
  lockedPreds,
  currentUserId,
  userNickname,
  userAvatarUrl,
}: Props) {
  // Estado de cada fase (para default y para el banner contextual)
  const stageStats = useMemo<
    Record<Stage, { total: number; finished: number; fullyFinished: boolean }>
  >(() => {
    const s: Record<Stage, { total: number; finished: number; fullyFinished: boolean }> = {
      1: { total: 0, finished: 0, fullyFinished: false },
      2: { total: 0, finished: 0, fullyFinished: false },
      3: { total: 0, finished: 0, fullyFinished: false },
    };
    for (const m of matches) {
      s[m.stage].total += 1;
      if (m.status === 'finished') s[m.stage].finished += 1;
    }
    for (const k of [1, 2, 3] as Stage[]) {
      s[k].fullyFinished = s[k].total > 0 && s[k].finished === s[k].total;
    }
    return s;
  }, [matches]);

  // Default phase: primera fase que NO esté totalmente finalizada.
  // Una fase sin matches aún cuenta como "no finalizada" (esperando sync).
  const defaultPhase = useMemo<Stage>(() => {
    for (const s of [1, 2, 3] as Stage[]) {
      if (!stageStats[s].fullyFinished) return s;
    }
    return 3;
  }, [stageStats]);

  const [phase, setPhase] = useState<Stage>(defaultPhase);
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [popupMatchId, setPopupMatchId] = useState<string | null>(null);
  const [myPreds, setMyPreds] = useState<Map<string, Prediction>>(
    () => new Map(myPredictions.map((p) => [p.match_id, p])),
  );

  // Cargar groupBy persistido (la fase la decide defaultPhase al montar)
  useEffect(() => {
    try {
      const gb = localStorage.getItem(LS_GROUPBY);
      if (gb === 'day' || gb === 'zone') setGroupBy(gb);
    } catch {}
  }, []);

  function changePhase(p: Stage) {
    setPhase(p);
  }
  function changeGroupBy(g: GroupBy) {
    setGroupBy(g);
    try { localStorage.setItem(LS_GROUPBY, g); } catch {}
  }

  const phaseMatches = useMemo(
    () => matches.filter((m) => m.stage === phase),
    [matches, phase],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of phaseMatches) {
      const key = groupBy === 'zone' ? m.round : dayKey(m.kickoff_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    // Sort matches within each group by kickoff
    for (const arr of map.values()) {
      arr.sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at));
    }
    // Sort groups: by day → fecha asc; by zone → orden de aparición (que ya viene por kickoff)
    return [...map.entries()];
  }, [phaseMatches, groupBy]);

  const popupMatch = useMemo(
    () => matches.find((m) => m.id === popupMatchId) ?? null,
    [matches, popupMatchId],
  );
  const popupPreds = useMemo(
    () => lockedPreds.filter((p) => p.match_id === popupMatchId),
    [lockedPreds, popupMatchId],
  );

  function handleSaved(p: Prediction) {
    setMyPreds((prev) => {
      const next = new Map(prev);
      next.set(p.match_id, p);
      return next;
    });
  }

  const meta = PHASE_META[phase];
  // Si la fase no tiene matches todavía:
  //   - "locked" si la fase anterior no está finalizada → mostrar 🔒
  //   - "pending" si la fase anterior sí está finalizada → mostrar ⏳ "esperando sorteo"
  const prevFullyFinished =
    phase > 1 ? stageStats[(phase - 1) as Stage].fullyFinished : true;
  const showLockedBanner =
    phaseMatches.length === 0 && phase > 1 && !prevFullyFinished;
  const showPendingBanner =
    phaseMatches.length === 0 && phase > 1 && prevFullyFinished;

  // Partidos pendientes — siempre se calculan sobre la FASE ACTIVA (vigente),
  // independientemente del tab seleccionado.
  function isPredictable(m: Match) {
    return (
      m.status === 'scheduled' &&
      !hasKickedOff(m.kickoff_at) &&
      !isTbdCode(m.team_a) &&
      !isTbdCode(m.team_b)
    );
  }
  const activePhaseMatches = useMemo(
    () => matches.filter((m) => m.stage === defaultPhase),
    [matches, defaultPhase],
  );
  const pendingInActivePhase = activePhaseMatches.filter(
    (m) => isPredictable(m) && !myPreds.has(m.id),
  ).length;
  const activePhaseHasOpen = activePhaseMatches.some(isPredictable);
  const activeMeta = PHASE_META[defaultPhase];

  // "Partido actual": el live más reciente; si no hay live, el último finished
  const currentMatch = useMemo(() => {
    const live = matches
      .filter((m) => m.status === 'live')
      .sort((a, b) => b.kickoff_at.localeCompare(a.kickoff_at))[0];
    if (live) return live;
    const finished = matches
      .filter((m) => m.status === 'finished')
      .sort((a, b) => b.kickoff_at.localeCompare(a.kickoff_at))[0];
    return finished ?? null;
  }, [matches]);

  function goToCurrentMatch() {
    if (!currentMatch) return;
    const scroll = () => {
      const el = document.getElementById(`match-${currentMatch.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    if (currentMatch.stage !== phase) {
      changePhase(currentMatch.stage);
      // Esperar al re-render con la fase nueva
      setTimeout(scroll, 80);
    } else {
      scroll();
    }
  }

  return (
    <>
      {activePhaseHasOpen && (
        <button
          type="button"
          onClick={() => changePhase(defaultPhase)}
          className="flex items-center gap-3 rounded-2xl p-4 text-white text-left shadow-[0_4px_12px_rgba(11,29,94,0.18)] transition active:translate-y-px hover:shadow-[0_6px_16px_rgba(11,29,94,0.22)]"
          style={{
            background:
              'linear-gradient(135deg, var(--color-pb-navy), var(--color-pb-violeta))',
          }}
        >
          <Avatar src={userAvatarUrl} nickname={userNickname} size={44} />
          <div className="flex-1 min-w-0">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.10em] text-white/70">
              Hola, {userNickname}
            </p>
            <p className="mt-0.5 font-display text-base font-bold leading-snug">
              {pendingInActivePhase > 0
                ? `Te ${pendingInActivePhase === 1 ? 'falta' : 'faltan'} ${pendingInActivePhase} pronóstico${pendingInActivePhase === 1 ? '' : 's'} en ${activeMeta.label}`
                : `¡${activeMeta.label} al día, dale!`}
            </p>
          </div>
          {phase !== defaultPhase && (
            <span className="font-display text-xs font-bold uppercase tracking-wider text-white/70">
              Ver →
            </span>
          )}
        </button>
      )}

      {currentMatch && (
        <button
          type="button"
          onClick={goToCurrentMatch}
          className="self-end rounded-full bg-white px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-pb-navy shadow-[0_2px_8px_rgba(11,29,94,0.08)] hover:bg-pb-very-light-blue active:translate-y-px"
        >
          Partido actual ↓
        </button>
      )}

      {/* Phase tabs */}
      <SegmentTabs
        tabs={[
          { id: '1', label: PHASE_META[1].label },
          { id: '2', label: PHASE_META[2].label },
          { id: '3', label: PHASE_META[3].label },
        ]}
        active={String(phase) as '1' | '2' | '3'}
        onChange={(id) => changePhase(Number(id) as Stage)}
      />

      {/* Phase header + group-by toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="font-display text-xs font-bold uppercase tracking-wider text-pb-muted">
          {meta.full}{' '}
          <span className="text-pb-deep-blue/40">
            · {phaseMatches.length || meta.expected} partidos
          </span>
        </div>
        <div className="flex rounded-xl border border-pb-border p-0.5">
          <ToggleBtn active={groupBy === 'day'} onClick={() => changeGroupBy('day')}>
            Por Día
          </ToggleBtn>
          <ToggleBtn active={groupBy === 'zone'} onClick={() => changeGroupBy('zone')}>
            {meta.zoneLabel}
          </ToggleBtn>
        </div>
      </div>

      {showLockedBanner && (
        <div className="flex items-center gap-2 rounded-2xl border border-pb-yellow/60 bg-pb-yellow/15 px-4 py-3">
          <span className="text-lg">🔒</span>
          <p className="text-sm text-pb-deep-blue">
            Esta fase se habilita cuando termine la anterior. Mientras tanto, dale
            a la <strong>Fase {(phase - 1) as 1 | 2}</strong>.
          </p>
        </div>
      )}

      {showPendingBanner && (
        <div className="flex items-center gap-2 rounded-2xl border border-pb-ceruleo/40 bg-pb-very-light-blue px-4 py-3">
          <span className="text-lg">⏳</span>
          <p className="text-sm text-pb-deep-blue">
            Los cruces de esta fase aún no están definidos. En cuanto se sorteen
            van a aparecer acá automáticamente.
          </p>
        </div>
      )}

      {!showLockedBanner && !showPendingBanner && phaseMatches.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-pb-muted shadow-[0_4px_12px_rgba(11,29,94,0.06)]">
          No hay partidos sincronizados para esta fase.
        </p>
      )}

      <section className="flex flex-col gap-6">
        {groups.map(([key, ms]) => (
          <div key={key} className="flex flex-col gap-2.5">
            <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-pb-deep-blue">
              <span>{groupBy === 'day' ? dayLabel(ms[0].kickoff_at) : key}</span>
              <div className="flex-1 border-t border-pb-border" />
              <span className="text-pb-muted">{ms.length}</span>
            </h2>
            {ms.map((match) =>
              match.status === 'scheduled' ? (
                <InlineMatchCard
                  key={match.id}
                  match={match}
                  prediction={myPreds.get(match.id) ?? null}
                  onSaved={handleSaved}
                  showDay={groupBy === 'zone'}
                />
              ) : (
                <LockedMatchCard
                  key={match.id}
                  match={match}
                  myPrediction={myPreds.get(match.id) ?? null}
                  onOpen={() => setPopupMatchId(match.id)}
                  showDay={groupBy === 'zone'}
                />
              ),
            )}
          </div>
        ))}
      </section>

      {popupMatch && (
        <MatchPopup
          match={popupMatch}
          preds={popupPreds}
          currentUserId={currentUserId}
          onClose={() => setPopupMatchId(null)}
        />
      )}
    </>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-lg px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider transition ' +
        (active
          ? 'bg-pb-navy text-white'
          : 'text-pb-muted hover:text-pb-deep-blue')
      }
    >
      {children}
    </button>
  );
}
