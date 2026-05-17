'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { resetStage, simulateStage } from './actions';

type Stage = 1 | 2 | 3;

const STAGE_LABELS: Record<Stage, string> = {
  1: 'Fase 1 (Grupos)',
  2: 'Fase 2 (16vos + 8vos)',
  3: 'Fase 3 (Cuartos + Semis + Final)',
};

export function SimulatorPanel() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(stage: Stage, action: 'simulate' | 'reset') {
    const verb = action === 'simulate' ? 'simular resultados aleatorios' : 'resetear';
    if (!window.confirm(`¿Seguro querés ${verb} de la ${STAGE_LABELS[stage]}?`)) {
      return;
    }
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = action === 'simulate' ? await simulateStage(stage) : await resetStage(stage);
      if (!res.ok) {
        setError(res.error ?? 'Error');
        return;
      }
      setMessage(
        action === 'simulate'
          ? `✓ ${STAGE_LABELS[stage]} simulada`
          : `✓ ${STAGE_LABELS[stage]} reseteada`,
      );
      router.refresh();
      setTimeout(() => setMessage(null), 2500);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-pb-muted">
        Testing en cascada: simula la fase pedida y llena los TBDs de la
        siguiente con teams al azar (mock de la API).
      </p>
      <ul className="text-[11px] text-pb-muted list-disc pl-4 -mt-1">
        <li>Fase 1 → simula grupos + llena 16vos con 32 teams random</li>
        <li>Fase 2 → simula 16vos + llena 8vos con winners, simula 8vos + llena 4tos</li>
        <li>Fase 3 → simula 4tos + llena semis, simula semis + llena Final y 3er puesto</li>
      </ul>

      {([1, 2, 3] as Stage[]).map((s) => (
        <div
          key={s}
          className="flex items-center justify-between gap-2 rounded-2xl border border-pb-border p-3"
        >
          <span className="font-display text-xs font-bold uppercase tracking-wider text-pb-deep-blue">
            {STAGE_LABELS[s]}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => run(s, 'simulate')}
              disabled={pending}
              className="rounded-full bg-pb-violeta/15 px-3 py-1 font-display text-[10px] font-bold text-pb-violeta hover:bg-pb-violeta/25 disabled:opacity-50"
            >
              🎲 Simular
            </button>
            <button
              type="button"
              onClick={() => run(s, 'reset')}
              disabled={pending}
              className="rounded-full bg-pb-bg-gray px-3 py-1 font-display text-[10px] font-bold text-pb-muted hover:bg-pb-very-light-blue disabled:opacity-50"
            >
              ↻ Reset
            </button>
          </div>
        </div>
      ))}

      {message && (
        <p className="rounded-xl bg-pb-green/15 px-3 py-2 text-xs font-bold text-pb-navy">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-pb-red/10 px-3 py-2 text-xs font-semibold text-pb-red-dark">
          {error}
        </p>
      )}
    </div>
  );
}
