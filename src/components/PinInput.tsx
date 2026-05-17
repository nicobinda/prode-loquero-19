'use client';

import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string | null;
  autoFocus?: boolean;
}

export function PinInput({
  value,
  onChange,
  length = 4,
  error,
  autoFocus,
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function setDigit(i: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[i] = digit;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-center gap-3">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={value[i] ?? ''}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            inputMode="numeric"
            type="password"
            maxLength={1}
            className={
              'h-14 w-12 rounded-2xl border bg-white text-center ' +
              'font-display text-2xl font-bold text-pb-deep-blue ' +
              'transition focus:outline-none focus:ring-4 ' +
              (error
                ? 'border-pb-red focus:ring-pb-red/20'
                : 'border-pb-border focus:border-pb-ceruleo focus:ring-pb-ceruleo/20')
            }
          />
        ))}
      </div>
      {error && (
        <span className="text-center text-sm font-semibold text-pb-red">
          {error}
        </span>
      )}
    </div>
  );
}
