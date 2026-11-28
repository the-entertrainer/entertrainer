/**
 * EasyMCQ export formats. Pure functions, no DOM, so they can be tested and
 * reused. Each item is one question with its key and three distractors in
 * the order shown on screen.
 */
export interface McqItem {
  question: string
  answer: string
  distractors: string[]
  /** Position of the correct answer among the four options (0–3). */
  keyIndex: number
  rationales?: string[]
}

export function optionsOf(item: McqItem): { text: string; correct: boolean }[] {
  const opts = item.distractors.map(text => ({ text, correct: false }))
  opts.splice(Math.min(item.keyIndex, opts.length), 0, { text: item.answer, correct: true })
  return opts
}

const LETTERS = ['A', 'B', 'C', 'D']

function csvCell(v: string) {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

export function toCsv(items: McqItem[]): string {
  const head = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct']
  const rows = items.map((it) => {
    const opts = optionsOf(it)
    return [it.question, ...opts.map(o => o.text), LETTERS[opts.findIndex(o => o.correct)] ?? '']
  })
  return [head, ...rows].map(r => r.map(c => csvCell(String(c))).join(',')).join('\r\n') + '\r\n'
}

/** Moodle GIFT. Special characters ~ = # { } : are escaped with a backslash. */
function gift(v: string) {
  return v.replace(/([~=#{}:\\])/g, '\\$1').replace(/\r?\n/g, ' ')
}

export function toGift(items: McqItem[]): string {
  return items.map((it, i) => {
    const opts = optionsOf(it).map(o => `  ${o.correct ? '=' : '~'}${gift(o.text)}`).join('\n')
    return `::Q${i + 1}:: ${gift(it.question)} {\n${opts}\n}`
  }).join('\n\n') + '\n'
}

/** Aiken: one line per option, "ANSWER: X". Lines must not wrap. */
export function toAiken(items: McqItem[]): string {
  const one = (v: string) => v.replace(/\s*\r?\n\s*/g, ' ').trim()
  return items.map((it) => {
    const opts = optionsOf(it)
    const key = LETTERS[opts.findIndex(o => o.correct)]
    return [one(it.question), ...opts.map((o, i) => `${LETTERS[i]}. ${one(o.text)}`), `ANSWER: ${key}`].join('\n')
  }).join('\n\n') + '\n'
}

export function toPlain(item: McqItem): string {
  const opts = optionsOf(item)
  return [item.question, ...opts.map((o, i) => `${LETTERS[i]}. ${o.text}${o.correct ? '  (correct)' : ''}`)].join('\n')
}
