/**
 * Minimal iCalendar (RFC 5545) writer for Cadence. Times are floating local
 * times (no TZID), which every calendar app reads as "the time on the wall
 * where you are", the same thing the on-screen calendar means.
 */
export interface IcsEvent { uid: string; title: string; description?: string; date: Date; slot?: string }

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`

function esc(v: string) {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Fold lines at 75 octets as the spec asks. */
function fold(line: string) {
  const out: string[] = []
  let rest = line
  while (new TextEncoder().encode(rest).length > 75) {
    let cut = 75
    while (new TextEncoder().encode(rest.slice(0, cut)).length > 75) cut--
    out.push(rest.slice(0, cut))
    rest = ' ' + rest.slice(cut)
  }
  out.push(rest)
  return out.join('\r\n')
}

/** "9:00–12:00", "14:00-17:00", "9am - 1pm" → [startMinutes, endMinutes] or null. */
export function parseSlot(slot = ''): [number, number] | null {
  const m = slot.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!m) return null
  const toMin = (h: string, mm: string | undefined, ap: string | undefined) => {
    let hr = Number(h) % 24
    if (ap) { hr = hr % 12; if (/pm/i.test(ap)) hr += 12 }
    return hr * 60 + Number(mm || 0)
  }
  const s = toMin(m[1]!, m[2], m[3] || m[6]), e = toMin(m[4]!, m[5], m[6])
  return e > s ? [s, e] : null
}

export function toIcs(calName: string, events: IcsEvent[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Entertrainer//Cadence//EN', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${esc(calName)}`]
  for (const ev of events) {
    const span = parseSlot(ev.slot)
    lines.push('BEGIN:VEVENT', `UID:${ev.uid}@cadence.entertrainer.in`, `DTSTAMP:${stamp}`)
    if (span) {
      const t = (min: number) => `${pad(Math.floor(min / 60))}${pad(min % 60)}00`
      lines.push(`DTSTART:${ymd(ev.date)}T${t(span[0])}`, `DTEND:${ymd(ev.date)}T${t(span[1])}`)
    } else {
      const next = new Date(ev.date); next.setDate(next.getDate() + 1)
      lines.push(`DTSTART;VALUE=DATE:${ymd(ev.date)}`, `DTEND;VALUE=DATE:${ymd(next)}`)
    }
    lines.push(`SUMMARY:${esc(ev.title)}`)
    if (ev.description) lines.push(`DESCRIPTION:${esc(ev.description)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
