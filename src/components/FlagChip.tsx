'use client';

import { useState } from 'react';
import Image from 'next/image';
import { flagUrl, isTbdCode } from '@/lib/flags';

interface Props {
  code: string;
  size?: number;
}

export function FlagChip({ code, size = 24 }: Props) {
  const [failed, setFailed] = useState(false);
  const url = flagUrl(code, 80);
  const w = size;
  const h = Math.round(size * (2 / 3));

  if (!url || failed) {
    const isTbd = isTbdCode(code);
    return (
      <span
        aria-label={isTbd ? 'TBD' : code}
        className={
          'inline-flex items-center justify-center rounded font-display text-[10px] font-bold ' +
          (isTbd ? 'bg-pb-bg-gray text-pb-muted' : 'bg-pb-bg-gray text-pb-deep-blue')
        }
        style={{ width: w, height: h }}
      >
        {isTbd ? '?' : code}
      </span>
    );
  }

  return (
    <Image
      src={url}
      alt={code}
      width={w}
      height={h}
      onError={() => setFailed(true)}
      className="inline-block rounded-sm object-cover shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
      unoptimized
    />
  );
}
