import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'cta';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: Variant;
  full?: boolean;
}

const base =
  'inline-flex items-center justify-center rounded-2xl px-6 py-3.5 ' +
  'font-display font-bold text-base tracking-tight transition ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pb-ceruleo/30';

const variants: Record<Variant, string> = {
  primary:
    'bg-pb-navy text-white shadow-[0_4px_12px_rgba(11,29,94,0.18)] ' +
    'hover:bg-pb-deep-blue active:translate-y-px',
  secondary:
    'bg-transparent text-pb-navy border-[1.5px] border-pb-navy ' +
    'hover:bg-pb-navy/5',
  ghost:
    'bg-transparent text-pb-navy hover:bg-pb-navy/5',
  cta:
    'bg-pb-ceruleo text-white shadow-[0_4px_12px_rgba(97,141,255,0.35)] ' +
    'hover:bg-pb-ceruleo/90 active:translate-y-px',
};

export function PBButton({
  children,
  variant = 'primary',
  full = true,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`${base} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
