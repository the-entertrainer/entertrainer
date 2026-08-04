import { defineStore } from 'pinia'
import type { AssessmentAttempt, LabResult } from '~/types/strong'
import { PASS_MARK, TARGET_BITS } from '~/utils/strong/content'

const STORAGE_KEY = 'strong-progress'

interface Persisted {
  index: number
  furthest: number
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

  const index = ref<number>(p.index ?? 0)
  const furthest = ref<number>(p.furthest ?? 0)
  const lessonComplete = ref<boolean>(p.lessonComplete ?? false)
  const bestBits = ref<number>(p.bestBits ?? 0)
  const best = ref<LabResult | null>(p.best ?? null)
  const attempts = ref<AssessmentAttempt[]>(p.attempts ?? [])
  const startedAt = ref<number | null>(null)

  function persist() {
    if (!import.meta.client) return
    try {
      const data: Persisted = {
        index: index.value, furthest: furthest.value, lessonComplete: lessonComplete.value,
        bestBits: bestBits.value, best: best.value, attempts: attempts.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }

  function start() { if (startedAt.value == null) startedAt.value = Date.now() }

  function setIndex(i: number) {
    index.value = i
    if (i > furthest.value) furthest.value = i
    persist()
  }

  function markLessonComplete() { if (!lessonComplete.value) { lessonComplete.value = true; persist() } }

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
    index.value = 0
    furthest.value = 0
    lessonComplete.value = false
    bestBits.value = 0
    best.value = null
    attempts.value = []
    startedAt.value = Date.now()
    if (import.meta.client) { try { localStorage.removeItem(STORAGE_KEY) } catch {} }
  }

  return {
    index, furthest, lessonComplete, bestBits, best, attempts,
    start, setIndex, markLessonComplete, saveLab, logAttempt,
    handsOnComplete, latestAttempt, assessmentPassed, progress, completedCount,
    elapsedSeconds, reset
  }
})
