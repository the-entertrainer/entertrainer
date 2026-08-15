import { defineStore } from 'pinia'
import { MODULES, TOTAL_LESSONS, lessonKey, type Position } from '~/content/course/ai'

const KEY = 'et-course-ai-v1'

interface Saved {
  done: string[]
  answers: Record<string, number[]>
  /** Fill-in-the-blank answers, kept separately — free text, not option indices. */
  textAnswers: Record<string, string>
  pos: Position
  diagnostic: Record<string, number[]>
  final: Record<string, number[]>
  reflections: Record<string, string>
  startedAt: string | null
  finishedAt: string | null
}

const EMPTY: Saved = {
  done: [], answers: {}, textAnswers: {}, pos: { moduleIndex: 0, lessonIndex: 0 },
  diagnostic: {}, final: {}, reflections: {}, startedAt: null, finishedAt: null
}

/**
 * Course progress.
 *
 * Everything lives in this browser and nowhere else. There is no account, no
 * server and no submission — which is a design decision, not a limitation:
 * the site claims on /colophon that nothing you type leaves your browser, and
 * a course that quietly posted your quiz answers somewhere would make that
 * claim false.
 *
 * The practical consequence, stated plainly to the learner in the UI: clearing
 * site data loses your progress, and you cannot resume on a different device.
 */
export const useCourseStore = defineStore('course-ai', {
  state: () => ({ ...EMPTY, loaded: false }),

  getters: {
    completedCount: (s) => s.done.length,
    percent: (s) => Math.round((s.done.length / TOTAL_LESSONS) * 100),
    isDone: (s) => (moduleId: string, lessonId: string) => s.done.includes(lessonKey(moduleId, lessonId)),
    started: (s) => s.done.length > 0 || !!s.startedAt,

    /** Per-module completion, for the outline. */
    moduleProgress: (s) => (moduleIndex: number) => {
      const m = MODULES[moduleIndex]
      if (!m) return { done: 0, total: 0 }
      const done = m.lessons.filter(l => s.done.includes(lessonKey(m.id, l.id))).length
      return { done, total: m.lessons.length }
    },

    /** Minutes of lessons not yet marked complete. Shown as "time remaining". */
    minutesLeft: (s) => {
      let left = 0
      for (const m of MODULES) {
        for (const l of m.lessons) {
          if (!s.done.includes(lessonKey(m.id, l.id))) left += l.minutes
        }
      }
      return left
    }
  },

  actions: {
    load() {
      if (this.loaded || !import.meta.client) return
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) Object.assign(this, { ...EMPTY, ...JSON.parse(raw) })
      } catch { /* corrupt or unavailable storage is the same as no storage */ }
      this.loaded = true
    },

    save() {
      if (!import.meta.client) return
      const { done, answers, textAnswers, pos, diagnostic, final, reflections, startedAt, finishedAt } = this
      try {
        localStorage.setItem(KEY, JSON.stringify({ done, answers, textAnswers, pos, diagnostic, final, reflections, startedAt, finishedAt }))
      } catch { /* storage full or blocked — the course still works, it just will not resume */ }
    },

    begin() {
      if (!this.startedAt) this.startedAt = new Date().toISOString()
      this.save()
    },

    goTo(pos: Position) { this.pos = pos; this.save() },

    complete(moduleId: string, lessonId: string) {
      const k = lessonKey(moduleId, lessonId)
      if (!this.done.includes(k)) this.done.push(k)
      if (this.done.length === TOTAL_LESSONS && !this.finishedAt) this.finishedAt = new Date().toISOString()
      this.save()
    },

    /** Knowledge-check answers are kept so a revisited lesson shows your working. */
    answer(questionId: string, chosen: number[]) { this.answers[questionId] = chosen; this.save() },
    answerText(questionId: string, text: string) { this.textAnswers[questionId] = text; this.save() },
    answerDiagnostic(id: string, chosen: number[]) { this.diagnostic[id] = chosen; this.save() },
    answerFinal(id: string, chosen: number[]) { this.final[id] = chosen; this.save() },
    reflect(id: string, text: string) { this.reflections[id] = text; this.save() },

    reset() {
      Object.assign(this, { ...EMPTY, loaded: true })
      if (import.meta.client) { try { localStorage.removeItem(KEY) } catch {} }
    }
  }
})
