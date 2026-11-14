export interface SpeakIssue {
  id: string
  kind: 'long' | 'jargon'
  label: string
  excerpt: string
}

export interface SpeakPart {
  text: string
  jargon: boolean
  suggestion: string
}

export interface SpeakSegment {
  long: boolean
  parts: SpeakPart[]
}

export interface SpeakReport {
  words: number
  grade: number | null
  clarity: number | null
  issues: SpeakIssue[]
  segments: SpeakSegment[]
  plain: string
}

const PHRASES: { from: string; to: string }[] = [
  { from: 'due to the fact that', to: 'because' },
  { from: 'it is important to note that', to: '' },
  { from: 'it should be noted that', to: '' },
  { from: 'a large number of', to: 'many' },
  { from: 'the vast majority of', to: 'most' },
  { from: 'in the event that', to: 'if' },
  { from: 'has the ability to', to: 'can' },
  { from: 'in close proximity to', to: 'near' },
  { from: 'in close proximity', to: 'near' },
  { from: 'a wide range of', to: 'many' },
  { from: 'at the end of the day', to: '' },
  { from: 'with respect to', to: 'about' },
  { from: 'in terms of', to: 'about' },
  { from: 'in order to', to: 'to' },
  { from: 'each and every', to: 'every' },
  { from: 'going forward', to: 'from now' },
  { from: 'moving forward', to: 'next' },
  { from: 'circles back', to: 'follows up' },
  { from: 'circle back', to: 'follow up' },
  { from: 'circled back', to: 'followed up' },
  { from: 'take this offline', to: 'talk separately' },
  { from: 'low-hanging fruit', to: 'easy wins' },
  { from: 'best practices', to: 'ways that have worked' },
  { from: 'best practice', to: 'a way that has worked' },
  { from: 'key takeaways', to: 'the points' },
  { from: 'key takeaway', to: 'the point' },
  { from: 'pain points', to: 'problems' },
  { from: 'pain point', to: 'problem' },
  { from: 'value-add', to: 'extra value' },
  { from: 'value add', to: 'extra value' },
  { from: 'deep dive', to: 'close look' },
  { from: 'drill down', to: 'look closer' },
  { from: 'touch base', to: 'talk' },
  { from: 'prior to', to: 'before' },
  { from: 'subsequent to', to: 'after' },
].sort((a, b) => b.from.length - a.from.length)

const WORDS: Record<string, string> = {
  utilizes: 'uses',
  utilized: 'used',
  utilizing: 'using',
  utilize: 'use',
  utilises: 'uses',
  utilised: 'used',
  utilising: 'using',
  utilise: 'use',
  leverages: 'uses',
  leveraged: 'used',
  leveraging: 'using',
  leverage: 'use',
  facilitates: 'helps',
  facilitated: 'helped',
  facilitating: 'helping',
  facilitate: 'help',
  stakeholders: 'people involved',
  stakeholder: 'person involved',
  synergies: 'combined effort',
  synergy: 'working together',
  actionable: 'practical',
  bandwidth: 'time',
  paradigms: 'models',
  paradigm: 'model',
  ideation: 'ideas',
  ideate: 'think of ideas',
  operationalizes: 'puts into practice',
  operationalize: 'put into practice',
  operationalises: 'puts into practice',
  operationalise: 'put into practice',
  deliverables: 'results',
  deliverable: 'result',
  holistic: 'whole',
  robust: 'strong',
  streamlined: 'simplified',
  streamline: 'simplify',
  pedagogy: 'teaching',
  scaffolding: 'support',
  scaffold: 'support',
  rubrics: 'scoring guides',
  rubric: 'scoring guide',
  asynchronous: 'not at the same time',
  synchronous: 'at the same time',
  onboarding: 'getting started',
  onboard: 'get started',
  granularity: 'detail',
  ecosystems: 'systems',
  ecosystem: 'system',
  incentivize: 'encourage',
  incentivise: 'encourage',
  disseminate: 'share',
  commence: 'start',
  terminate: 'end',
  endeavor: 'effort',
  endeavour: 'effort',
  learnings: 'lessons',
  upskilling: 'learning',
  upskill: 'learn',
  optimization: 'improvement',
  optimisation: 'improvement',
  optimize: 'improve',
  optimise: 'improve',
  impactful: 'effective',
  alignment: 'agreement',
  boilerplate: 'standard text',
}

const WORD_KEYS = Object.keys(WORDS).sort((a, b) => b.length - a.length)

interface Span {
  start: number
  end: number
  from: string
  to: string
}

const LONG_WORDS = 25

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '')
  const groups = stripped.match(/[aeiouy]{1,}/g)
  return Math.max(1, groups?.length ?? 1)
}

function wordsOf(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

function matchCase(source: string, replacement: string): string {
  if (!replacement) return ''
  if (source === source.toUpperCase() && /[A-Z]/.test(source)) return replacement.toUpperCase()
  if (source[0] === source[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1)
  return replacement
}

function overlaps(start: number, end: number, spans: Span[]): boolean {
  return spans.some(span => start < span.end && end > span.start)
}

function findSpans(text: string): Span[] {
  const spans: Span[] = []
  const lower = text.toLowerCase()
  for (const phrase of PHRASES) {
    let from = 0
    while (from < text.length) {
      const index = lower.indexOf(phrase.from, from)
      if (index < 0) break
      const end = index + phrase.from.length
      const beforeOk = index === 0 || !/[a-z0-9]/i.test(text[index - 1])
      const afterOk = end >= text.length || !/[a-z0-9]/i.test(text[end])
      if (beforeOk && afterOk && !overlaps(index, end, spans)) {
        spans.push({ start: index, end, from: text.slice(index, end), to: phrase.to })
      }
      from = index + phrase.from.length
    }
  }
  for (const word of WORD_KEYS) {
    const re = new RegExp(`\\b${word}\\b`, 'gi')
    let match: RegExpExecArray | null
    while ((match = re.exec(text))) {
      const start = match.index
      const end = start + match[0].length
      if (!overlaps(start, end, spans)) {
        spans.push({ start, end, from: match[0], to: WORDS[word] })
      }
    }
  }
  return spans.sort((a, b) => a.start - b.start)
}

function sentenceRanges(text: string): { text: string; start: number; end: number }[] {
  const out: { text: string; start: number; end: number }[] = []
  const re = /[^.!?\n]+(?:[.!?]+|$)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    if (match[0].trim()) out.push({ text: match[0], start: match.index, end: match.index + match[0].length })
  }
  if (!out.length && text.trim()) out.push({ text, start: 0, end: text.length })
  return out
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/ +\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitLong(sentence: string): string {
  const trimmed = sentence.trim()
  if (wordsOf(trimmed).length <= LONG_WORDS) return sentence
  const words = trimmed.split(/(\s+)/)
  const real: { word: string; index: number }[] = []
  words.forEach((word, index) => {
    if (word.trim()) real.push({ word, index })
  })
  const mid = Math.floor(real.length / 2)
  let best = -1
  let bestDist = Number.POSITIVE_INFINITY
  real.forEach((entry, i) => {
    if (!/^(and|but|so|because|which|while|although|or)$/i.test(entry.word)) return
    const dist = Math.abs(i - mid)
    if (i > 4 && i < real.length - 4 && dist < bestDist) {
      best = entry.index
      bestDist = dist
    }
  })
  if (best < 0) return sentence
  const left = words.slice(0, best).join('').replace(/[\s,;:]+$/, '').trim()
  const rightWords = words.slice(best).join('').trim().replace(/^(and|but|so|because|which|while|although|or)\b[, ]*/i, '')
  if (!rightWords) return sentence
  const right = rightWords[0].toUpperCase() + rightWords.slice(1)
  const leftDone = /[.!?]$/.test(left) ? left : `${left}.`
  const pad = /^\s/.test(sentence) ? sentence.match(/^\s*/)?.[0] ?? '' : ''
  return `${pad}${leftDone} ${right}`
}

function applySpans(text: string, spans: Span[]): string {
  let out = text
  for (const span of [...spans].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, span.start) + matchCase(span.from, span.to) + out.slice(span.end)
  }
  return tidy(out)
}

function plainVersion(text: string, spans: Span[]): string {
  const replaced = applySpans(text, spans)
  let cursor = 0
  let out = ''
  for (const sentence of sentenceRanges(replaced)) {
    if (sentence.start > cursor) out += replaced.slice(cursor, sentence.start)
    out += splitLong(sentence.text)
    cursor = sentence.end
  }
  if (cursor < replaced.length) out += replaced.slice(cursor)
  return tidy(out)
}

export function analyzeSpeak(raw: string): SpeakReport | null {
  const text = raw.replace(/\r\n/g, '\n')
  if (!text.trim()) return null
  const limited = text.length > 50_000 ? text.slice(0, 50_000) : text
  const spans = findSpans(limited)
  const sentences = sentenceRanges(limited)
  const wordList = wordsOf(limited)
  const issues: SpeakIssue[] = []
  const segments: SpeakSegment[] = []
  let issueN = 0
  let covered = 0

  for (const sentence of sentences) {
    if (sentence.start > covered) {
      segments.push({
        long: false,
        parts: [{ text: limited.slice(covered, sentence.start), jargon: false, suggestion: '' }],
      })
    }
    covered = sentence.end
    const count = wordsOf(sentence.text).length
    const long = count > LONG_WORDS
    if (long) {
      issues.push({
        id: `long-${issueN++}`,
        kind: 'long',
        label: 'Long sentence',
        excerpt: sentence.text.trim().slice(0, 220),
      })
    }
    const local = spans.filter(span => span.start >= sentence.start && span.end <= sentence.end)
    const parts: SpeakPart[] = []
    let cursor = sentence.start
    for (const span of local) {
      if (span.start > cursor) {
        parts.push({ text: limited.slice(cursor, span.start), jargon: false, suggestion: '' })
      }
      const suggestion = matchCase(span.from, span.to)
      parts.push({ text: limited.slice(span.start, span.end), jargon: true, suggestion })
      issues.push({
        id: `jargon-${issueN++}`,
        kind: 'jargon',
        label: suggestion ? `Try: ${suggestion}` : 'Try: cut this',
        excerpt: span.from,
      })
      cursor = span.end
    }
    if (cursor < sentence.end) parts.push({ text: limited.slice(cursor, sentence.end), jargon: false, suggestion: '' })
    if (!parts.length) parts.push({ text: sentence.text, jargon: false, suggestion: '' })
    segments.push({ long, parts })
  }
  if (covered < limited.length) {
    segments.push({
      long: false,
      parts: [{ text: limited.slice(covered), jargon: false, suggestion: '' }],
    })
  }

  let grade: number | null = null
  let clarity: number | null = null
  if (wordList.length) {
    const syl = wordList.reduce((sum, word) => sum + syllables(word), 0)
    const sentenceCount = Math.max(1, sentences.length)
    const rawGrade = 0.39 * (wordList.length / sentenceCount) + 11.8 * (syl / wordList.length) - 15.59
    grade = Math.max(0, Math.round(rawGrade))
    clarity = Math.round(Math.max(0, Math.min(100, ((16 - rawGrade) / 10) * 100)))
  }

  return {
    words: wordList.length,
    grade,
    clarity,
    issues,
    segments,
    plain: plainVersion(limited, spans),
  }
}

export function speakStatus(report: SpeakReport | null, truncated: boolean): string {
  if (!report) return 'Paste anything you want clearer.'
  const marks = report.issues.length
  const clarity = report.clarity == null ? 'Clarity is not available yet.' : `Clarity ${report.clarity} out of 100.`
  const grade = report.grade == null ? '' : ` Grade ${report.grade}.`
  const markText = marks === 1 ? '1 mark.' : `${marks} marks.`
  const cut = truncated ? ' Only the first 50,000 characters are scored.' : ''
  return `${clarity}${grade} ${markText}${cut}`
}
