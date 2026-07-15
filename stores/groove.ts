import { defineStore } from 'pinia'
import type { AssessmentAttempt, GrooveResult, GvView } from '~/types/groove'
import type { Pattern } from '~/utils/groove/audio'
import { PASS_MARK } from '~/utils/groove/content'
import { MATCH_PASS, emptyPattern } from '~/utils/groove/patterns'

const STORAGE_KEY = 'groove-progress'

interface Persisted {
  view: GvView
  visited: GvView[]
  lessonComplete: boolean
  userPattern: Pattern
  bestMatch: number
  attempts: AssessmentAttempt[]
}

function load(): Partial<Persisted> {
  if (!import.meta.client) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export const useGrooveStore = defineStore('groove', () => {
  const p = load()

  const view = ref<GvView>(p.view ?? 'title')
  const visited = ref<GvView[]>(p.visited ?? ['title'])
  const lessonComplete = ref<boolean>(p.lessonComplete ?? false)
  const userPattern = ref<Pattern>(p.userPattern ?? emptyPattern())
  const bestMatch = ref<number>(p.bestMatch ?? 0)
  const attempts = ref<AssessmentAttempt[]>(p.attempts ?? [])
  const startedAt = ref<number | null>(null)

  function persist() {
    if (!import.meta.client) return
    try {
      const data: Persisted = {
        view: view.value, visited: visited.value, lessonComplete: lessonComplete.value,
        userPattern: userPattern.value, bestMatch: bestMatch.value, attempts: attempts.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }

  function start() { if (startedAt.value == null) startedAt.value = Date.now() }

  function goTo(next: GvView) {
    view.value = next
    if (!visited.value.includes(next)) visited.value.push(next)
    persist()
  }

  function markLessonComplete() { lessonComplete.value = true; persist() }

  function saveGroove(result: GrooveResult) {
    userPattern.value = result.pattern
    if (result.matchScore > bestMatch.value) bestMatch.value = result.matchScore
    persist()
  }

  function logAttempt(answers: number[], score: number) {
    attempts.value.push({ answers, score, passed: score >= PASS_MARK, at: new Date().toISOString() })
    persist()
  }

  const handsOnComplete = computed(() => bestMatch.value >= MATCH_PASS)
  const latestAttempt = computed<AssessmentAttempt | null>(() =>
    attempts.value.length ? attempts.value[attempts.value.length - 1] : null
  )
  const assessmentPassed = computed(() => !!latestAttempt.value?.passed)

  const progress = computed(() => ({
    lesson: lessonComplete.value,
    handsOn: handsOnComplete.value,
    assessment: assessmentPassed.value
  }))
  const completedCount = computed(() =>
    Number(progress.value.lesson) + Number(progress.value.handsOn) + Number(progress.value.assessment)
  )

  function elapsedSeconds(): number {
    if (startedAt.value == null) return 0
    return Math.round((Date.now() - startedAt.value) / 1000)
  }

  function reset() {
    view.value = 'title'
    visited.value = ['title']
    lessonComplete.value = false
    userPattern.value = emptyPattern()
    bestMatch.value = 0
    attempts.value = []
    startedAt.value = Date.now()
    if (import.meta.client) { try { localStorage.removeItem(STORAGE_KEY) } catch {} }
  }

  return {
    view, visited, lessonComplete, userPattern, bestMatch, attempts,
    start, goTo, markLessonComplete, saveGroove, logAttempt,
    handsOnComplete, latestAttempt, assessmentPassed, progress, completedCount,
    elapsedSeconds, reset
  }
})
