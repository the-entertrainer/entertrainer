import type { CourseMeta, Module } from './types'
import { M01 } from './m01'
import { M02 } from './m02'
import { M03 } from './m03'
import { M04 } from './m04'
import { M05 } from './m05'
import { M06 } from './m06'
import { M07 } from './m07'
import { M08 } from './m08'
import { M09 } from './m09'
import { M10 } from './m10'

export * from './types'
export { VIDEOS, RESOURCES, SOURCES, videoById, resourceById, sourceById } from './media'
export { GLOSSARY } from './glossary'
export { DIAGNOSTIC, FINAL, CAPSTONE } from './assessment'

export const MODULES: Module[] = [M01, M02, M03, M04, M05, M06, M07, M08, M09, M10]

/** Total teaching minutes, summed from the lessons rather than asserted. */
const lessonMinutes = MODULES.reduce(
  (sum, m) => sum + m.lessons.reduce((s, l) => s + l.minutes, 0), 0)

/** Diagnostic, final assessment, capstone and two breaks. */
const AROUND_THE_EDGES = 20 + 25 + 45 + 30

export const COURSE: CourseMeta = {
  title: 'Artificial Intelligence: From Its Origins to the Frontier',
  subtitle: 'A one-day journey from the 1950s to today, for people who want to judge AI claims instead of just repeating them',
  description:
    'A full-day course on how artificial intelligence really developed — rule-based systems, two big collapses, the rise of machine learning, transformers, generative AI, agents, and where the field stands today. Through all of it, you learn one simple method: how to tell what is proven from what is only announced.',
  audience:
    'No experience needed. Built for beginners, and just as useful for working professionals, teachers, creators and managers who keep getting asked what they think about AI, and want a real answer.',
  promise:
    'By the end of the day, you will be able to explain how AI got here, say clearly what today\'s systems can and cannot do, and judge any AI claim using evidence instead of guesswork.',
  prerequisites: 'None. No maths, no coding. Just curiosity and a browser.',
  level: 'Beginner to intermediate',
  minutes: lessonMinutes + AROUND_THE_EDGES,
  objectives: [
    'Explain the major stages in how AI developed, including the times it failed.',
    'Tell different AI approaches, model types and abilities apart.',
    'Judge AI claims using evidence, limits and the quality of the source.',
    'Decide where AI is useful in your own work, and explain why.'
  ],
  whyThisMatters: [
    'People expect you to have an opinion on this. It comes up in meetings, in hiring, in policy, in what your company buys — whether or not you feel ready to answer.',
    'Most explanations you find online are written to sell you something or to scare you. Both kinds bend the truth in predictable ways. Once you understand how the technology actually works, both get easier to see through.',
    'The history is not just background reading — it is useful on its own. This field has collapsed twice before, both times right after confident, smart people made big predictions. Knowing that pattern is one of the cheapest ways to gain good judgement.'
  ],
  currentAsOf: '15 August 2026'
}

/* ── Navigation helpers ─────────────────────────────────────────────────── */

export interface Position { moduleIndex: number; lessonIndex: number }

export const ALL_LESSONS = MODULES.flatMap((m, mi) =>
  m.lessons.map((l, li) => ({ module: m, lesson: l, moduleIndex: mi, lessonIndex: li })))

export const TOTAL_LESSONS = ALL_LESSONS.length

export function lessonKey(moduleId: string, lessonId: string) {
  return `${moduleId}/${lessonId}`
}

export function moduleMinutes(m: Module) {
  return m.lessons.reduce((s, l) => s + l.minutes, 0)
}

/** The next lesson after a position, or null at the end of the course. */
export function nextPosition(p: Position): Position | null {
  const m = MODULES[p.moduleIndex]
  if (!m) return null
  if (p.lessonIndex + 1 < m.lessons.length) return { ...p, lessonIndex: p.lessonIndex + 1 }
  if (p.moduleIndex + 1 < MODULES.length) return { moduleIndex: p.moduleIndex + 1, lessonIndex: 0 }
  return null
}

export function prevPosition(p: Position): Position | null {
  if (p.lessonIndex > 0) return { ...p, lessonIndex: p.lessonIndex - 1 }
  if (p.moduleIndex > 0) {
    const prev = MODULES[p.moduleIndex - 1]
    return { moduleIndex: p.moduleIndex - 1, lessonIndex: prev.lessons.length - 1 }
  }
  return null
}

/* ── The day ────────────────────────────────────────────────────────────
   A realistic schedule rather than a list of modules with times attached.
   The breaks are in it because a full day without them is a document, not a
   course, and the afternoon is deliberately lighter on new mechanism and
   heavier on judgement — which is what people can still do at four o'clock. */
export interface ScheduleRow {
  time: string
  what: string
  kind: 'orientation' | 'module' | 'break' | 'assessment' | 'capstone'
  minutes: number
  output: string
}

/**
 * Times below are recomputed to cascade from each module's actual lesson
 * minutes — moduleMinutes(M01) etc. — with a small rounding buffer (a few
 * minutes at most) at each join so the day still lands on tidy five-minute
 * marks rather than starting a module at, say, 15:16. This is the same
 * buffer the original schedule already carried; it just has to be
 * recomputed by hand whenever a module's content changes, because nothing
 * here enforces the two staying in sync automatically. */
export const SCHEDULE: ScheduleRow[] = [
  { time: '09:00', what: 'Welcome and orientation', kind: 'orientation', minutes: 10,
    output: 'You know how the day is shaped and how to resume if you stop.' },
  { time: '09:10', what: 'Diagnostic — six questions, not scored', kind: 'assessment', minutes: 15,
    output: 'A record of what you believed before the course, to compare against later.' },
  { time: '09:25', what: 'Module 01 · What we are actually talking about', kind: 'module', minutes: 32,
    output: 'A working definition, and your claim log started.' },
  { time: '10:00', what: 'Module 02 · Before there was a field', kind: 'module', minutes: 35,
    output: 'The Turing test in your own words; the Dartmouth promise scored.' },
  { time: '10:35', what: 'Break', kind: 'break', minutes: 15, output: 'Stand up. This is not optional.' },
  { time: '10:50', what: 'Module 03 · Rules, search and expert systems', kind: 'module', minutes: 33,
    output: 'A number that surprises you about combinatorial explosion.' },
  { time: '11:25', what: 'Module 04 · The winters', kind: 'module', minutes: 25,
    output: 'Claim log entry two: a result separated from its extrapolation.' },
  { time: '11:50', what: 'Module 05 · Learning from data', kind: 'module', minutes: 35,
    output: 'A classifier you trained and then deliberately broke.' },
  { time: '12:25', what: 'Lunch', kind: 'break', minutes: 45, output: 'Genuinely stop. The afternoon is the harder half.' },
  { time: '13:10', what: 'Module 06 · Neural networks', kind: 'module', minutes: 37,
    output: 'The smallest network you could get to solve the spiral — and a hill you can watch it descend badly.' },
  { time: '13:50', what: 'Module 07 · The deep learning decade', kind: 'module', minutes: 35,
    output: 'Claim log entry three, with a falsifiable expectation attached.' },
  { time: '14:25', what: 'Break', kind: 'break', minutes: 15, output: 'Move around.' },
  { time: '14:40', what: 'Module 08 · Transformers and language models', kind: 'module', minutes: 36,
    output: 'Token, embedding and attention defined in your own words.' },
  { time: '15:20', what: 'Module 09 · Generative, multimodal, agentic, embodied', kind: 'module', minutes: 36,
    output: 'One of your workflows mapped for reversibility and checkability.' },
  { time: '16:00', what: 'Module 10 · Risk, evidence and the frontier', kind: 'module', minutes: 40,
    output: 'Your claim log tiered, and one paragraph you would say out loud.' },
  { time: '16:40', what: 'Final assessment — fifteen questions', kind: 'assessment', minutes: 25,
    output: 'A score, and explanations for every answer including the ones you got right.' },
  { time: '17:05', what: 'Capstone — your AI position paper', kind: 'capstone', minutes: 45,
    output: 'One page you would be willing to defend in front of someone who disagrees.' },
  { time: '17:50', what: 'Close and next steps', kind: 'orientation', minutes: 10,
    output: 'A shortlist of where to go next, matched to what you found hardest.' }
]
