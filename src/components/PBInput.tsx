import { type InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function PBInput({
  label,
  value,
  onChange,
  error,
  className = '',
  ...rest
}: Props) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="font-display text-sm font-semibold text-pb-deep-blue">
          {label}
        </span>
      )}
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          'w-full rounded-2xl border bg-white px-4 py-3 ' +
          'text-base text-pb-deep-blue placeholder:text-pb-muted ' +
          'transition focus:outline-none focus:ring-4 ' +
          (error
            ? 'border-pb-red focus:ring-pb-red/20'
            : 'border-pb-border focus:border-pb-ceruleo focus:ring-pb-ceruleo/20')
        }
      />
      {error && <span className="text-sm text-pb-red-dark">{error}</span>}
    </label>
  );
}
