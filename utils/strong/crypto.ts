// The real mechanics behind "is this password strong". Everything here is pure
// math on a string; nothing is sent anywhere. The teaching spine:
//
//   search space = pool ^ length         (how many passwords the attacker sifts)
//   entropy bits = log2(search space)    (each bit doubles the haystack)
//   crack time   = search space / rate   (rate depends on WHICH attacker)
//
// and the twist the naive formula misses: if the password is guessable (a
// dictionary word plus predictable tweaks), a real cracker needs far fewer
// guesses than pool^length implies, so its EFFECTIVE entropy is much lower.

import { COMMON_PASSWORDS, COMMON_WORDS, PHRASE_WORDS } from './words'

const COMMON_PW = new Set(COMMON_PASSWORDS)
const WORDS = new Set(COMMON_WORDS)

export interface CharClass { id: string; label: string; size: number; test: (pw: string) => boolean }

// Pool sizes are the count of distinct characters an attacker must consider once
// a class appears. Symbols use the ~33 printable ASCII punctuation marks.
export const CHAR_CLASSES: CharClass[] = [
  { id: 'lower',  label: 'a to z',   size: 26, test: pw => /[a-z]/.test(pw) },
  { id: 'upper',  label: 'A to Z',   size: 26, test: pw => /[A-Z]/.test(pw) },
  { id: 'digit',  label: '0 to 9',   size: 10, test: pw => /[0-9]/.test(pw) },
  { id: 'symbol', label: 'symbols',  size: 33, test: pw => /[^A-Za-z0-9]/.test(pw) }
]

export function activeClasses(pw: string): CharClass[] {
  return CHAR_CLASSES.filter(c => c.test(pw))
}

export function poolSize(pw: string): number {
  return activeClasses(pw).reduce((n, c) => n + c.size, 0)
}

// bits = length * log2(pool). Empty or single-character-space passwords are 0.
export function naiveBits(pw: string): number {
  const pool = poolSize(pw)
  if (!pw.length || pool <= 1) return 0
  return pw.length * Math.log2(pool)
}

// log10 of the number of possible passwords, for a readable "10^n" display.
export function possibilitiesLog10(pw: string): number {
  const pool = poolSize(pw)
  if (!pw.length || pool < 1) return 0
  return pw.length * Math.log10(pool)
}

export function sciNotation(log10: number): string {
  if (log10 <= 0) return '1'
  const exp = Math.floor(log10)
  const mant = Math.pow(10, log10 - exp)
  return `${mant.toFixed(1)} x 10^${exp}`
}

// ── Attackers ──────────────────────────────────────────────────────────────
// The same password is "instant" or "eternal" depending on how fast the
// attacker can guess. Rates are order-of-magnitude realistic for one machine.
export interface Attacker { id: string; label: string; note: string; rate: number; hue: string }

export const ATTACKERS: Attacker[] = [
  { id: 'online', label: 'Online guessing', note: 'trying it at a live login with rate limits', rate: 100, hue: 'var(--st-online)' },
  { id: 'fast',   label: 'Leaked fast hash', note: 'a GPU on an unsalted MD5 or SHA-1 dump', rate: 1e11, hue: 'var(--st-fast)' },
  { id: 'slow',   label: 'Leaked bcrypt',    note: 'a GPU on a slow, salted hash the way good sites store it', rate: 1e4, hue: 'var(--st-slow)' }
]

// log10 of average seconds to crack = log10( 2^(bits-1) / rate ).
export function crackLog10Seconds(bits: number, rate: number): number {
  if (bits <= 0) return -Infinity
  return (bits - 1) * Math.log10(2) - Math.log10(rate)
}

const DUR_UNITS: [number, string, string][] = [
  [1, 'second', 'seconds'], [60, 'minute', 'minutes'], [3600, 'hour', 'hours'], [86400, 'day', 'days'],
  [2.6298e6, 'month', 'months'], [3.1557e7, 'year', 'years'], [3.1557e9, 'century', 'centuries'],
  [3.1557e10, 'millennium', 'millennia']
]
const LOG10_YEAR = Math.log10(3.1557e7)

// Format from log10-seconds so astronomically large times never overflow, and
// collapse the far end into friendly phrases instead of "thousands of millennia".
export function formatCrack(log10s: number): string {
  if (!isFinite(log10s) || log10s < -0.5) return 'instantly'
  if (log10s < 0.5) return 'about a second'
  const log10years = log10s - LOG10_YEAR
  if (log10years > 10.14) return 'longer than the universe has existed'
  if (log10years > 9) return 'billions of years'
  if (log10years > 6) return 'millions of years'
  const secs = Math.pow(10, log10s)
  let unit = DUR_UNITS[0]
  for (const u of DUR_UNITS) if (secs >= u[0]) unit = u
  const val = secs / unit[0]
  const rounded = val >= 100 ? Math.round(val / 10) * 10 : val >= 10 ? Math.round(val) : Math.round(val * 10) / 10
  return `${rounded.toLocaleString('en-US')} ${rounded === 1 ? unit[1] : unit[2]}`
}

// ── Strength tiers ───────────────────────────────────────────────────────────
export interface Tier { id: string; label: string; min: number }
export const TIERS: Tier[] = [
  { id: 'vweak',   label: 'Very weak',   min: 0 },
  { id: 'weak',    label: 'Weak',        min: 28 },
  { id: 'fair',    label: 'Fair',        min: 40 },
  { id: 'strong',  label: 'Strong',      min: 60 },
  { id: 'vstrong', label: 'Very strong', min: 80 }
]
export function tierFor(bits: number): { tier: Tier; index: number } {
  let index = 0
  for (let i = 0; i < TIERS.length; i++) if (bits >= TIERS[i].min) index = i
  return { tier: TIERS[index], index }
}

// ── Realistic (guessability) analysis ────────────────────────────────────────
// Crackers substitute leetspeak and strip trailing digits before matching a
// wordlist, so we undo those to find a likely base word.
const LEET: Record<string, string> = {
  '@': 'a', '4': 'a', '8': 'b', '3': 'e', '1': 'l', '!': 'i', '|': 'l',
  '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't', '9': 'g', '6': 'g', '2': 'z'
}
function unleet(s: string): string {
  return s.split('').map(ch => LEET[ch] ?? ch).join('')
}

export interface Guessability {
  guessable: boolean
  base?: string
  reason?: string
  effBits: number
}

export function realisticBits(pw: string, naive: number): Guessability {
  if (!pw) return { guessable: false, effBits: 0 }
  const lower = pw.toLowerCase()

  if (COMMON_PW.has(lower)) {
    return {
      guessable: true,
      base: lower,
      reason: 'This is on every cracker\'s top list. It is tried in the first fraction of a second, whatever the character mix.',
      effBits: Math.min(naive, 10)
    }
  }

  // Undo leetspeak, keep only letters, and see if a common word is hiding inside.
  const core = unleet(lower).replace(/[^a-z]/g, '')
  if (core.length >= 3 && WORDS.has(core)) {
    const wasLeeted = unleet(lower).replace(/[^a-z]/g, '') !== lower.replace(/[^a-z]/g, '')
    const hasExtras = /[^a-z]/.test(lower)
    const mangles = (wasLeeted ? 1 : 0) + (hasExtras ? 1 : 0)
    const extraChars = Math.max(0, pw.length - core.length)
    // Attacker cost: run the wordlist, apply a handful of tweak rules, brute the
    // few leftover characters. Far below the naive pool^length figure.
    const eff = Math.min(naive, Math.log2(WORDS.size) + mangles * 2 + extraChars * 2)
    return {
      guessable: true,
      base: core,
      reason: `This is really the word "${core}" with predictable tweaks. Crackers apply leetspeak and trailing digits automatically, so the tweaks add almost nothing.`,
      effBits: eff
    }
  }

  return { guessable: false, effBits: naive }
}

// ── One-shot analysis for the lab ────────────────────────────────────────────
export interface CrackReadout { id: string; label: string; note: string; hue: string; log10s: number; text: string }

export interface Analysis {
  length: number
  classes: CharClass[]
  pool: number
  possLog10: number
  naiveBits: number
  effBits: number
  guessable: boolean
  guessReason?: string
  base?: string
  tier: Tier
  tierIndex: number
  crack: CrackReadout[]
}

export function analyze(pw: string): Analysis {
  const naive = naiveBits(pw)
  const guess = realisticBits(pw, naive)
  const effBits = guess.effBits
  const { tier, index } = tierFor(effBits)
  const crack = ATTACKERS.map(a => {
    const log10s = crackLog10Seconds(effBits, a.rate)
    return { id: a.id, label: a.label, note: a.note, hue: a.hue, log10s, text: formatCrack(log10s) }
  })
  return {
    length: pw.length,
    classes: activeClasses(pw),
    pool: poolSize(pw),
    possLog10: possibilitiesLog10(pw),
    naiveBits: naive,
    effBits,
    guessable: guess.guessable,
    guessReason: guess.reason,
    base: guess.base,
    tier,
    tierIndex: index,
    crack
  }
}

// ── Passphrase generator ─────────────────────────────────────────────────────
// Uses the browser's cryptographic RNG (not Math.random) to pick words with
// genuine uniform randomness, which is the whole point: the strength comes from
// unpredictable selection, not from the words being obscure.
function secureIndex(n: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const max = Math.floor(0xffffffff / n) * n
    const a = new Uint32Array(1)
    do { crypto.getRandomValues(a) } while (a[0] >= max) // reject bias
    return a[0] % n
  }
  return Math.floor(Math.random() * n)
}

export interface Passphrase { phrase: string; words: string[]; bits: number }

export function randomPassphrase(wordCount = 6): Passphrase {
  const n = PHRASE_WORDS.length
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) words.push(PHRASE_WORDS[secureIndex(n)])
  return { phrase: words.join('-'), words, bits: wordCount * Math.log2(n) }
}

export const PHRASE_WORD_COUNT = PHRASE_WORDS.length
export const BITS_PER_PHRASE_WORD = Math.log2(PHRASE_WORDS.length)
