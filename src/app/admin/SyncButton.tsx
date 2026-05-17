'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PBButton } from '@/components/PBButton';

interface Result {
  fetched: number;
  upserted: number;
  errors: string[];
}

export function SyncButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/sync', { method: 'POST' });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? 'Error');
          return;
        }
        setResult(json);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <PBButton onClick={run} disabled={pending}>
        {pending ? 'Sincronizando…' : 'Sincronizar ahora'}
      </PBButton>

      {result && (
        <div className="rounded-xl bg-pb-green/10 px-3 py-2 text-sm text-pb-navy">
          <strong>{result.upserted}</strong> partidos sincronizados (de{' '}
          {result.fetched} recibidos).
          {result.errors.length > 0 && (
            <p className="mt-1 text-pb-red-dark">
              Errores: {result.errors.join(', ')}
            </p>
          )}
        </div>
      )}
      {error && (
        <p className="rounded-xl bg-pb-red/10 px-3 py-2 text-sm font-semibold text-pb-red-dark">
          {error}
        </p>
      )}
    </div>
  );
}
