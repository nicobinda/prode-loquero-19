import type { MatchStatus } from '@/types/db';

interface Props {
  status: MatchStatus;
  minute?: string; // p. ej. "67'"
}

const CONFIG: Record<MatchStatus, { label: string; cls: string }> = {
  scheduled: {
    label: 'PRÓXIMO',
    cls: 'bg-pb-very-light-blue text-pb-navy',
  },
  live: {
    label: 'EN VIVO',
    cls: 'bg-pb-red text-white animate-pulse',
  },
  finished: {
    label: 'FINAL',
    cls: 'bg-pb-bg-gray text-pb-muted',
  },
};

export function StatusTag({ status, minute }: Props) {
  const c = CONFIG[status];
  const label = status === 'live' && minute ? `${c.label} ${minute}` : c.label;
  return (
    <span
      className={
        `inline-flex items-center rounded-full px-2.5 py-1 ` +
        `font-display text-[10px] font-bold tracking-wider ${c.cls}`
      }
    >
      {label}
    </span>
  );
}
