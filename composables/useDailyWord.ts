/**
 * Word of the Day — tiny daily scramble from a curated bank.
 * Click-to-open (no auto popup). Dot clears on solve, skip, or reveal.
 */

import {
  WOTD_WORDS,
  WOTD_WORD_COUNT,
  type WotdEntry
} from '~/content/wotd-words'

export const DAILY_WORD_KEY = 'entertrainer.daily-word'
export const WOTD_FEATURE_NAME = 'Word of the Day'

/** @deprecated — kept for older imports; prefer WOTD_WORDS */
export const DAILY_WORDS = WOTD_WORDS.map((e) => e.word)

export type DailyWordStatus = 'pending' | 'solved' | 'skipped' | 'revealed'

export interface DailyWordRecord {
  date: string
  status: DailyWordStatus
  word?: string
}

export interface WotdDefinition {
  word: string
  pos?: string
  definition: string
  example?: string
  source: 'api' | 'bank'
}

function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function hashKey(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic bank entry for a YYYY-MM-DD key (cycles after bank length). */
export function entryForDate(dateKey: string): WotdEntry {
  const idx = hashKey(dateKey) % WOTD_WORD_COUNT
  return WOTD_WORDS[idx]!
}

/** @deprecated alias */
export function wordForDate(dateKey: string): string {
  return entryForDate(dateKey).word
}

/**
 * How many answer letters to pre-fill as locked hints.
 * Short ≤5 → ~2; medium 6–8 → ~3; longer → ceil(len/4).
 * Always leave ≥ ~40% empty and never reveal the whole word.
 */
export function hintCountForLength(len: number): number {
  if (len <= 1) return 0
  let n: number
  if (len <= 5) n = 2
  else if (len <= 8) n = 3
  else n = Math.ceil(len / 4)
  const maxByEmpty = Math.floor(len * 0.6)
  return Math.max(0, Math.min(n, maxByEmpty, len - 1))
}

/** Deterministic slot indices to pre-fill for a day+word seed. */
export function hintIndicesForWord(word: string, seed: string): number[] {
  const len = word.length
  const count = hintCountForLength(len)
  if (count <= 0) return []
  let h = hashKey(`hint:${seed}`) | 0
  const rand = () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return (h >>> 0) / 4294967296
  }
  const idxs = Array.from({ length: len }, (_, i) => i)
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[idxs[i], idxs[j]] = [idxs[j]!, idxs[i]!]
  }
  return idxs.slice(0, count).sort((a, b) => a - b)
}

/** Fair scramble: reshuffle until different from the answer. */
export function scrambleWord(word: string, seed: string): string {
  const chars = word.split('')
  if (chars.length < 2) return word
  let h = hashKey(seed) | 0
  const rand = () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return (h >>> 0) / 4294967296
  }
  let out = word
  for (let attempt = 0; attempt < 32; attempt++) {
    const a = chars.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j]!, a[i]!]
    }
    out = a.join('')
    if (out !== word) break
  }
  if (out === word) {
    const a = chars.slice()
    for (let i = 1; i < a.length; i++) {
      if (a[i] !== a[0]) {
        ;[a[0], a[i]] = [a[i]!, a[0]!]
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

/** Free Dictionary API with bank fallback. */
export async function fetchWotdDefinition(entry: WotdEntry): Promise<WotdDefinition> {
  const bank: WotdDefinition = {
    word: entry.word,
    pos: entry.pos,
    definition: entry.definition,
    example: entry.example,
    source: 'bank'
  }
  if (!import.meta.client) return bank
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(entry.word)}`,
      { signal: ctrl.signal }
    )
    if (!res.ok) return bank
    const data = await res.json() as Array<{
      meanings?: Array<{
        partOfSpeech?: string
        definitions?: Array<{ definition?: string; example?: string }>
      }>
    }>
    const meaning = data?.[0]?.meanings?.[0]
    const def = meaning?.definitions?.[0]
    if (!def?.definition) return bank
    return {
      word: entry.word,
      pos: meaning?.partOfSpeech || entry.pos,
      definition: def.definition,
      example: def.example || entry.example,
      source: 'api'
    }
  } catch {
    return bank
  } finally {
    window.clearTimeout(timer)
  }
}

export function useDailyWord() {
  const { settings, hydrate } = useSiteSettings()
  const today = localDateKey()
  const entry = entryForDate(today)
  const word = entry.word
  const daySeed = `${today}:${word}`
  const scrambled = scrambleWord(word, daySeed)
  const clue = entry.clue
  const hintIndices = hintIndicesForWord(word, daySeed)

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

  /** True when today's puzzle is still pending (for notification dot). */
  const hasNotification = computed(() => {
    if (!settings.value.wordOfTheDay) return false
    const r = record.value
    if (!r || r.date !== today) return true
    return r.status === 'pending'
  })

  const featureEnabled = computed(() => settings.value.wordOfTheDay)

  /** @deprecated auto-popup removed — use openGame() from masthead / home. */
  function shouldShow(): boolean {
    return false
  }

  function markStatus(status: DailyWordStatus) {
    const next: DailyWordRecord = { date: today, status, word }
    record.value = next
    writeRecord(next)
  }

  function markSolved() {
    markStatus('solved')
  }

  function markSkipped() {
    markStatus('skipped')
    open.value = false
  }

  function markRevealed() {
    markStatus('revealed')
  }

  function openGame() {
    if (!import.meta.client) return
    refresh()
    if (!settings.value.wordOfTheDay) return
    open.value = true
  }

  /** No-op: auto popup after preloader was removed by design. */
  function tryOpenAfterPreloader() {
    /* intentionally empty */
  }

  function close() {
    open.value = false
  }

  return {
    today,
    word,
    scrambled,
    clue,
    hintIndices,
    entry,
    record,
    open,
    refresh,
    shouldShow,
    hasNotification,
    featureEnabled,
    markSolved,
    markSkipped,
    markRevealed,
    openGame,
    tryOpenAfterPreloader,
    close,
    fetchWotdDefinition,
    WOTD_WORD_COUNT
  }
}
