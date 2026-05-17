import Image from 'next/image';

interface Props {
  src?: string | null;
  nickname: string;
  size?: number;
  ring?: boolean;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ src, nickname, size = 32, ring }: Props) {
  const ringCls = ring ? 'ring-2 ring-pb-ceruleo ring-offset-2 ring-offset-white' : '';
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-pb-very-light-blue text-pb-navy ${ringCls}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={nickname} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span
          className="font-display font-bold"
          style={{ fontSize: size * 0.4 }}
        >
          {initials(nickname || '?')}
        </span>
      )}
    </div>
  );
}
