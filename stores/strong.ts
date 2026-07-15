import { defineStore } from 'pinia'
import type { AssessmentAttempt, LabResult, StView } from '~/types/strong'
import { PASS_MARK, TARGET_BITS } from '~/utils/strong/content'

const STORAGE_KEY = 'strong-progress'

interface Persisted {
  view: StView
  visited: StView[]
  lessonComplete: boolean
  bestBits: number
  best: LabResult | null
  attempts: AssessmentAttempt[]
}

function load(): Partial<Persisted> {
  if (!import.meta.client) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export const useStrongStore = defineStore('strong', () => {
  const p = load()

  const view = ref<StView>(p.view ?? 'title')
  const visited = ref<StView[]>(p.visited ?? ['title'])
  const lessonComplete = ref<boolean>(p.lessonComplete ?? false)
  const bestBits = ref<number>(p.bestBits ?? 0)
  const best = ref<LabResult | null>(p.best ?? null)
  const attempts = ref<AssessmentAttempt[]>(p.attempts ?? [])
  const startedAt = ref<number | null>(null)

  function persist() {
    if (!import.meta.client) return
    try {
      const data: Persisted = {
        view: view.value, visited: visited.value, lessonComplete: lessonComplete.value,
        bestBits: bestBits.value, best: best.value, attempts: attempts.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }

  function start() { if (startedAt.value == null) startedAt.value = Date.now() }

  function goTo(next: StView) {
    view.value = next
    if (!visited.value.includes(next)) visited.value.push(next)
    persist()
  }

  function markLessonComplete() { lessonComplete.value = true; persist() }

  function saveLab(result: LabResult) {
    if (result.effBits > bestBits.value) { bestBits.value = result.effBits; best.value = result }
    persist()
  }

  function logAttempt(answers: number[], score: number) {
    attempts.value.push({ answers, score, passed: score >= PASS_MARK, at: new Date().toISOString() })
    persist()
  }

  const handsOnComplete = computed(() => bestBits.value >= TARGET_BITS)
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
    bestBits.value = 0
    best.value = null
    attempts.value = []
    startedAt.value = Date.now()
    if (import.meta.client) { try { localStorage.removeItem(STORAGE_KEY) } catch {} }
  }

  return {
    view, visited, lessonComplete, bestBits, best, attempts,
    start, goTo, markLessonComplete, saveLab, logAttempt,
    handsOnComplete, latestAttempt, assessmentPassed, progress, completedCount,
    elapsedSeconds, reset
  }
})
