/**
 * Daily scrambled-word splash — one word per local calendar day.
 * Solved or "not today" suppresses until the next local YYYY-MM-DD.
 */

export const DAILY_WORD_KEY = 'entertrainer.daily-word'

/** Tasteful learning / curiosity / Entertrainer-adjacent words (5–10 letters). */
export const DAILY_WORDS = [
  'curious',
  'insight',
  'spark',
  'learn',
  'wonder',
  'craft',
  'mentor',
  'story',
  'atlas',
  'focus',
  'clarity',
  'practice',
  'design',
  'listen',
  'explore',
  'habit',
  'reflect',
  'grow',
  'teach',
  'quest',
  'idea',
  'signal',
  'paper',
  'yellow',
  'elevate',
  'engage',
  'empower',
  'lesson',
  'prompt',
  'sketch',
  'rhythm',
  'memory',
  'reason',
  'gentle',
  'bright',
  'thrive',
  'vision',
  'create',
  'nurture',
  'wisdom'
] as const

export type DailyWordStatus = 'pending' | 'solved' | 'skipped'

export interface DailyWordRecord {
  date: string
  status: DailyWordStatus
  word?: string
}

function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Deterministic pick from the list for a YYYY-MM-DD key. */
export function wordForDate(dateKey: string): string {
  let h = 2166136261
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const idx = Math.abs(h) % DAILY_WORDS.length
  return DAILY_WORDS[idx]
}

/** Fair scramble: reshuffle until different from original (and not a trivial reverse for short words). */
export function scrambleWord(word: string, seed: string): string {
  const chars = word.split('')
  if (chars.length < 2) return word
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const rand = () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return (h >>> 0) / 4294967296
  }
  let out = word
  for (let attempt = 0; attempt < 24; attempt++) {
    const a = chars.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    out = a.join('')
    if (out !== word && out !== [...word].reverse().join('')) break
  }
  if (out === word) {
    // Last resort swap first two distinct letters.
    const a = chars.slice()
    for (let i = 1; i < a.length; i++) {
      if (a[i] !== a[0]) {
        ;[a[0], a[i]] = [a[i], a[0]]
        break
      }
    }
    out = a.join('')
  }
  return out
}

function readRecord(): DailyWordRecord | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(DAILY_WORD_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DailyWordRecord
    if (!parsed?.date || !parsed?.status) return null
    return parsed
  } catch {
    return null
  }
}

function writeRecord(rec: DailyWordRecord) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(DAILY_WORD_KEY, JSON.stringify(rec))
  } catch { /* private mode / quota */ }
}

export function useDailyWord() {
  const { settings, hydrate } = useSiteSettings()
  const today = localDateKey()
  const word = wordForDate(today)
  const scrambled = scrambleWord(word, `${today}:${word}`)

  const record = useState<DailyWordRecord | null>('entertrainer-daily-word', () => null)
  const open = useState<boolean>('entertrainer-daily-word-open', () => false)

  function refresh() {
    if (!import.meta.client) return
    hydrate()
    const stored = readRecord()
    if (stored && stored.date === today) {
      record.value = stored
    } else {
      record.value = { date: today, status: 'pending', word }
    }
  }

  /** Whether the splash should appear after the preloader. */
  function shouldShow(): boolean {
    if (!import.meta.client) return false
    refresh()
    if (!settings.value.wordOfTheDay) return false
    const r = record.value
    if (!r || r.date !== today) return true
    return r.status === 'pending'
  }

  function markSolved() {
    const next: DailyWordRecord = { date: today, status: 'solved', word }
    record.value = next
    writeRecord(next)
    open.value = false
  }

  function markSkipped() {
    const next: DailyWordRecord = { date: today, status: 'skipped', word }
    record.value = next
    writeRecord(next)
    open.value = false
  }

  function tryOpenAfterPreloader() {
    if (shouldShow()) open.value = true
  }

  function close() {
    open.value = false
  }

  return {
    today,
    word,
    scrambled,
    record,
    open,
    refresh,
    shouldShow,
    markSolved,
    markSkipped,
    tryOpenAfterPreloader,
    close
  }
}
