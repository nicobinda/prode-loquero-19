'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { PBButton } from '@/components/PBButton';
import { addPlayer, removePlayer, resetPin, togglePayment } from './actions';

export interface PlayerRow {
  id: string;
  dni: string;
  nickname: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  has_pin: boolean;
  paid: boolean;
  first_login_at: string | null;
}

interface Props {
  players: PlayerRow[];
  currentAdminId: string;
}

export function PlayerManager({ players, currentAdminId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newDni, setNewDni] = useState('');
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    startTransition(async () => {
      const res = await addPlayer(newDni);
      if (!res.ok) {
        setError(res.error ?? 'Error');
        return;
      }
      setNewDni('');
      router.refresh();
    });
  }

  function confirm(msg: string, fn: () => void) {
    if (window.confirm(msg)) fn();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          value={newDni}
          onChange={(e) =>
            setNewDni(e.target.value.replace(/\D/g, '').slice(0, 8))
          }
          placeholder="DNI"
          inputMode="numeric"
          className="flex-1 rounded-xl border border-pb-border bg-white px-3 py-2 text-sm focus:border-pb-ceruleo focus:outline-none focus:ring-4 focus:ring-pb-ceruleo/20"
        />
        <PBButton onClick={add} disabled={!newDni || pending} full={false} variant="primary">
          Agregar
        </PBButton>
      </div>
      {error && (
        <p className="rounded-xl bg-pb-red/10 px-3 py-2 text-xs font-semibold text-pb-red-dark">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {players.length === 0 && (
          <li className="text-center text-sm text-pb-muted">Aún no hay jugadores</li>
        )}
        {players.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-2xl border border-pb-border p-2.5"
          >
            <Avatar src={p.avatar_url} nickname={p.nickname ?? '?'} size={36} />
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1.5 font-display text-sm font-bold text-pb-deep-blue truncate">
                {p.nickname ?? <span className="italic text-pb-muted">sin apodo</span>}
                {p.is_admin && (
                  <span className="rounded-full bg-pb-ceruleo px-1.5 py-0.5 text-[9px] font-bold text-white">
                    admin
                  </span>
                )}
              </p>
              <p className="text-[11px] text-pb-muted">
                DNI {p.dni} ·{' '}
                {p.has_pin ? (
                  <span className="text-pb-green-dark">PIN ✓</span>
                ) : (
                  <span className="text-pb-yellow">sin PIN</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    await togglePayment(p.id, !p.paid);
                    router.refresh();
                  });
                }}
                title={p.paid ? 'Marcar como impago' : 'Marcar como pagado'}
                className={
                  'rounded-full px-2 py-1 font-display text-[10px] font-bold transition ' +
                  (p.paid
                    ? 'bg-pb-green/15 text-pb-green-dark'
                    : 'bg-pb-bg-gray text-pb-muted hover:bg-pb-very-light-blue')
                }
              >
                {p.paid ? '$ pagado' : '$ pendiente'}
              </button>
              <button
                type="button"
                onClick={() =>
                  confirm(
                    `Resetear PIN de ${p.nickname ?? p.dni}? Va a tener que definir uno nuevo en el próximo login.`,
                    () => {
                      startTransition(async () => {
                        await resetPin(p.id);
                        router.refresh();
                      });
                    },
                  )
                }
                title="Reset PIN"
                className="rounded-full bg-pb-bg-gray px-2 py-1 font-display text-[10px] font-bold text-pb-deep-blue hover:bg-pb-yellow/30"
              >
                ↻ PIN
              </button>
              {p.id !== currentAdminId && (
                <button
                  type="button"
                  onClick={() =>
                    confirm(
                      `Borrar a ${p.nickname ?? p.dni}? Esto también borra sus pronósticos.`,
                      () => {
                        startTransition(async () => {
                          await removePlayer(p.id);
                          router.refresh();
                        });
                      },
                    )
                  }
                  title="Eliminar"
                  className="rounded-full bg-pb-red/10 px-2 py-1 font-display text-[10px] font-bold text-pb-red-dark hover:bg-pb-red/20"
                >
                  ✕
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
