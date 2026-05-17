// Helpers de fecha — timezone Argentina.

const TZ = 'America/Argentina/Buenos_Aires';

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function dayLabel(isoUtc: string): string {
  const d = new Date(isoUtc);
  const local = new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(d);
  // "lun., 11 de jun." → "Lun 11 Jun"
  const cleaned = local
    .replace(/\./g, '')
    .replace(' de ', ' ')
    .split(', ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
  return cleaned;
}

export function timeLabel(isoUtc: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoUtc));
}

export function dayKey(isoUtc: string): string {
  // YYYY-MM-DD en TZ Argentina
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoUtc));
}

export function dayKeyToday(): string {
  return dayKey(new Date().toISOString());
}

export function hasKickedOff(isoUtc: string): boolean {
  return new Date(isoUtc).getTime() <= Date.now();
}

export function dayOfWeekShort(isoUtc: string): string {
  const d = new Date(isoUtc);
  const weekdayIdx = new Date(
    d.toLocaleString('en-US', { timeZone: TZ }),
  ).getDay();
  return DAY_NAMES_SHORT[weekdayIdx];
}
