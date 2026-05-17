'use client';

export interface SegmentTab<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  tabs: ReadonlyArray<SegmentTab<T>>;
  active: T;
  onChange: (id: T) => void;
}

export function SegmentTabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <nav className="flex border-b border-pb-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={
            'flex-1 py-3 font-display text-sm font-bold uppercase tracking-wider transition ' +
            (active === t.id
              ? 'border-b-2 border-pb-navy text-pb-navy'
              : 'text-pb-muted hover:text-pb-deep-blue')
          }
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
