import Image from 'next/image';
import Link from 'next/link';

interface Props {
  nickname?: string | null;
  current?: 'home' | 'rules' | 'ranking';
}

export function AppHeader({ nickname, current }: Props) {
  return (
    <header className="sticky top-0 z-10 -mx-5 flex items-center justify-between gap-3 border-b border-pb-border bg-white px-5 py-3">
      <Link href="/" className="flex items-center gap-2 min-w-0">
        <Image
          src="/logo-prode-binda.png"
          alt="Prode Loquero 19"
          width={32}
          height={32}
          priority
          className="shrink-0"
        />
        <span className="font-display text-lg font-black text-pb-deep-blue truncate">
          Prode{nickname ? ` de ${nickname}` : ''}
        </span>
      </Link>
      <nav className="flex items-center gap-1.5">
        <Link
          href="/reglas"
          className={
            'rounded px-2.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.10em] transition ' +
            (current === 'rules'
              ? 'text-pb-navy'
              : 'text-pb-muted hover:text-pb-deep-blue')
          }
        >
          Reglas
        </Link>
        <Link
          href="/ranking"
          className={
            'rounded border-[1.5px] border-pb-navy px-2.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.10em] transition ' +
            (current === 'ranking'
              ? 'bg-pb-navy text-white'
              : 'text-pb-navy hover:bg-pb-navy/5')
          }
        >
          Ranking
        </Link>
      </nav>
    </header>
  );
}
