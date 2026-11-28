/**
 * Plain: a clarity read of instructional text. Runs in the browser, no model.
 * Heuristics, not grammar: it flags what usually trips a reader.
 */
export type FlagKind = 'long' | 'passive' | 'jargon' | 'steps' | 'vague'
export interface Flag { kind: FlagKind; start: number; end: number; note: string }
export interface Report {
  flags: Flag[]
  words: number
  sentences: number
  avg: number
  ease: number
  score: number
}

export const KIND_LABEL: Record<FlagKind, string> = {
  long: 'Long sentence',
  passive: 'Passive voice',
  jargon: 'Office words',
  steps: 'Steps in a paragraph',
  vague: 'Vague instruction'
}

const SWAPS: Record<string, string> = {
  'utilise': 'use', 'utilize': 'use', 'utilisation': 'use', 'leverage': 'use', 'facilitate': 'help', 'commence': 'start',
  'in order to': 'to', 'prior to': 'before', 'subsequent to': 'after', 'ensure that': 'make sure', 'kindly': 'please',
  'do the needful': 'say exactly what to do', 'revert back': 'reply', 'in the event that': 'if', 'at this point in time': 'now',
  'with regard to': 'about', 'endeavour': 'try', 'endeavor': 'try', 'terminate': 'end', 'sufficient': 'enough',
  'assistance': 'help', 'approximately': 'about', 'additional': 'more', 'synergy': 'say what actually happens',
  'going forward': 'from now', 'please note that': 'cut it', 'it is mandatory to': 'you must', 'adhere to': 'follow'
}
const VAGUE = ['as appropriate', 'as needed', 'if required', 'where applicable', 'properly', 'correctly', 'as per process', 'as per sop', 'etc', 'and so on', 'relevant', 'accordingly']

function syllables(w: string) {
  const s = w.toLowerCase().replace(/[^a-z]/g, '')
  if (!s) return 0
  if (s.length <= 3) return 1
  const m = s.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g)
  return Math.max(1, m ? m.length : 1)
}

export function readPlain(text: string): Report {
  const flags: Flag[] = []
  const sentRe = /[^.!?\n]+[.!?]*/g
  let m: RegExpExecArray | null
  let sentences = 0
  let words = 0
  let syl = 0
  while ((m = sentRe.exec(text))) {
    const raw = m[0]
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lead = raw.length - raw.trimStart().length
    const start = m.index + lead
    const ws = trimmed.split(/\s+/).filter((w) => /\w/.test(w))
    if (!ws.length) continue
    sentences++
    words += ws.length
    syl += ws.reduce((a, w) => a + syllables(w), 0)
    if (ws.length > 25) flags.push({ kind: 'long', start, end: start + trimmed.length, note: `${ws.length} words. Split it near a comma or an “and”.` })
    const seq = trimmed.match(/\b(then|after that|next|once done|followed by|and finally)\b/gi)
    if (seq && seq.length >= 2) flags.push({ kind: 'steps', start, end: start + trimmed.length, note: 'Several steps in one sentence. Make it a numbered list.' })
  }
  const passive = /\b(is|are|was|were|be|been|being|gets|got)\s+(\w+ly\s+)?(\w+(?:ed|en)|done|made|sent|kept|held|told|given|taken|shown|known|set|put)\b/gi
  while ((m = passive.exec(text))) flags.push({ kind: 'passive', start: m.index, end: m.index + m[0].length, note: 'Who does it? Name them and put them first.' })
  const lower = text.toLowerCase()
  for (const [k, v] of Object.entries(SWAPS)) {
    const re = new RegExp(`\\b${k.replace(/ /g, '\\s+')}\\b`, 'gi')
    while ((m = re.exec(lower))) flags.push({ kind: 'jargon', start: m.index, end: m.index + m[0].length, note: v === 'cut it' ? 'Cut it. The sentence works without it.' : `Try “${v}”.` })
  }
  for (const k of VAGUE) {
    const re = new RegExp(`\\b${k.replace(/ /g, '\\s+')}\\b`, 'gi')
    while ((m = re.exec(lower))) flags.push({ kind: 'vague', start: m.index, end: m.index + m[0].length, note: 'A new joiner cannot act on this. Say what “right” looks like.' })
  }
  // Keep only non-overlapping flags, preferring the narrower one.
  flags.sort((a, b) => a.start - b.start || (a.end - a.start) - (b.end - b.start))
  const inline: Flag[] = []
  const blocks: Flag[] = []
  for (const f of flags) (f.kind === 'long' || f.kind === 'steps' ? blocks : inline).push(f)
  const kept: Flag[] = []
  let edge = -1
  for (const f of inline) { if (f.start >= edge) { kept.push(f); edge = f.end } }
  const avg = sentences ? words / sentences : 0
  const ease = sentences && words ? Math.max(0, Math.min(100, 206.835 - 1.015 * avg - 84.6 * (syl / words))) : 0
  const penalty = blocks.length * 8 + kept.length * 4
  const score = words ? Math.max(0, Math.min(100, Math.round(ease * 0.5 + 50 - penalty))) : 0
  return { flags: [...blocks, ...kept], words, sentences, avg, ease: Math.round(ease), score }
}

export interface Seg { text: string; kind?: FlagKind; block?: FlagKind; note?: string; n?: number }
/** Cut text into display segments: inline flags as marks, block flags as underlines. */
export function segments(text: string, flags: Flag[]): Seg[] {
  const inline = flags.filter((f) => f.kind !== 'long' && f.kind !== 'steps')
  const blocks = flags.filter((f) => f.kind === 'long' || f.kind === 'steps')
  const cuts = new Set<number>([0, text.length])
  for (const f of flags) { cuts.add(f.start); cuts.add(f.end) }
  const pts = [...cuts].sort((a, b) => a - b)
  const out: Seg[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    const inl = inline.find((f) => f.start <= a && f.end >= b)
    const blk = blocks.find((f) => f.start <= a && f.end >= b)
    out.push({ text: text.slice(a, b), kind: inl?.kind, block: blk?.kind, note: inl?.note || blk?.note, n: inl ? flags.indexOf(inl) + 1 : undefined })
  }
  return out
}
