'use client';

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  highlight?: boolean;
}

export function ScoreBox({ value, onChange, disabled, highlight }: Props) {
  return (
    <input
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value.replace(/\D/g, '').slice(-1);
        onChange(v === '' ? null : Number(v));
      }}
      disabled={disabled}
      inputMode="numeric"
      maxLength={1}
      placeholder="–"
      className={
        'h-12 w-12 rounded-xl border text-center font-display text-2xl font-bold ' +
        'transition focus:outline-none focus:ring-4 ' +
        'disabled:bg-pb-bg-gray disabled:text-pb-muted ' +
        (highlight
          ? 'border-pb-ceruleo bg-pb-very-light-blue text-pb-navy focus:ring-pb-ceruleo/30'
          : 'border-pb-border bg-white text-pb-deep-blue focus:border-pb-ceruleo focus:ring-pb-ceruleo/20')
      }
    />
  );
}
