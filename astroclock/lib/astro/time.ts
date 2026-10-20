/**
 * Civil-time helpers. Birth times are entered as local wall-clock time at the
 * birth place; charts need the true UTC instant (historical offsets and DST
 * come from the browser's IANA tz database via Intl).
 */

export const DEFAULT_TZ = 'Asia/Kolkata';

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TZ;
  } catch {
    return DEFAULT_TZ;
  }
}

export function isValidTimeZone(tz: string | undefined | null): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Offset (ms) of `tz` from UTC at the UTC instant `utcMs`. */
export function tzOffsetMs(utcMs: number, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts: Record<string, number> = {};
  for (const p of dtf.formatToParts(new Date(utcMs))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour % 24,
    parts.minute,
    parts.second,
  );
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** Wall-clock time in `tz` → UTC Date (two-pass, DST-safe). */
export function zonedTimeToUtc(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  tz: string,
): Date {
  const zone = isValidTimeZone(tz) ? tz : DEFAULT_TZ;
  const naive = Date.UTC(y, mo - 1, d, h, mi, s);
  let off = tzOffsetMs(naive - tzOffsetMs(naive, zone), zone);
  const guess = naive - off;
  off = tzOffsetMs(guess, zone);
  return new Date(naive - off);
}

export interface BirthLike {
  date: string;
  h: number | string;
  m: number | string;
  s: number | string;
  tz?: string;
}

/** Birth instant as a true UTC Date (birth time is local time at `tz`). */
export function birthInstant(b: BirthLike): Date {
  const [Y, Mo, D] = b.date.split('-').map(Number);
  return zonedTimeToUtc(Y, Mo, D, +b.h, +b.m, +b.s, b.tz || DEFAULT_TZ);
}

/** Local weekday index (0 = Sunday) in `tz`, or the browser zone. */
export function localWeekday(d: Date, tz?: string): number {
  const zone = isValidTimeZone(tz) ? tz : browserTimeZone();
  const w = new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short' }).format(d);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(w);
}
