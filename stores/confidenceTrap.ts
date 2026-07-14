import { defineStore } from 'pinia'
import type { AssessmentAttempt, CtView, GauntletResponse, LessonRating } from '~/types/confidenceTrap'
import { ASSESSMENT_PASS_THRESHOLD } from '~/utils/confidenceTrap/content'

const STORAGE_KEY = 'confidence-trap-progress'

interface PersistedShape {
  lessonRatings: LessonRating[]
  gauntletResponses: GauntletResponse[]
  assessmentAttempts: AssessmentAttempt[]
  view: CtView
  visited: CtView[]
}

function loadPersisted(): Partial<PersistedShape> {
  if (!import.meta.client) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

// Holds every real, timestamped measurement taken across the module, plus
// navigation position — a real SCORM module bookmarks and resumes, so this
// one does too. `startedAt` is deliberately NOT persisted: resuming a
// bookmarked session should not silently count the time the tab was
// closed as "time spent," so the elapsed-time clock restarts each session.
// The Thank You screen's chart reads directly from lessonRatings/
// gauntletResponses/assessmentAttempts — there is no separate "display"
// data path, so what gets plotted is what actually happened.
export const useConfidenceTrapStore = defineStore('confidenceTrap', () => {
  const persisted = loadPersisted()

  const startedAt = ref<string | null>(null)
  const lessonRatings = ref<LessonRating[]>(persisted.lessonRatings ?? [])
  const gauntletResponses = ref<GauntletResponse[]>(persisted.gauntletResponses ?? [])
  const assessmentAttempts = ref<AssessmentAttempt[]>(persisted.assessmentAttempts ?? [])
  const view = ref<CtView>(persisted.view ?? 'title')
  const visited = ref<CtView[]>(persisted.visited ?? ['title'])

  function persist() {
    if (!import.meta.client) return
    try {
      const shape: PersistedShape = {
        lessonRatings: lessonRatings.value,
        gauntletResponses: gauntletResponses.value,
        assessmentAttempts: assessmentAttempts.value,
        view: view.value,
        visited: visited.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shape))
    } catch {}
  }

  function start() {
    if (!startedAt.value) startedAt.value = new Date().toISOString()
  }

  function goTo(next: CtView) {
    view.value = next
    if (!visited.value.includes(next)) visited.value.push(next)
    persist()
  }

  function logLessonRating(sectionId: string, rating: number) {
    lessonRatings.value = lessonRatings.value.filter(r => r.sectionId !== sectionId)
    lessonRatings.value.push({ sectionId, rating, at: new Date().toISOString() })
    persist()
  }

  function logGauntletResponse(response: Omit<GauntletResponse, 'at'>) {
    gauntletResponses.value = gauntletResponses.value.filter(r => r.questionId !== response.questionId)
    gauntletResponses.value.push({ ...response, at: new Date().toISOString() })
    persist()
  }

  function logAssessmentAttempt(answers: number[], score: number) {
    assessmentAttempts.value.push({
      answers,
      score,
      passed: score >= ASSESSMENT_PASS_THRESHOLD,
      at: new Date().toISOString()
    })
    persist()
  }

  const averageLessonConfidence = computed(() => {
    if (!lessonRatings.value.length) return null
    return lessonRatings.value.reduce((sum, r) => sum + r.rating, 0) / lessonRatings.value.length
  })

  // The chart's single real data point: mean stated confidence vs actual
  // accuracy across the Hands-On gauntlet. This pairing exists because the
  // gauntlet is the one exercise that asks for a confidence estimate and a
  // checkable right/wrong answer together.
  const gauntletConfidenceAccuracy = computed<{ confidence: number; accuracy: number } | null>(() => {
    if (!gauntletResponses.value.length) return null
    const confidence = gauntletResponses.value.reduce((sum, r) => sum + r.confidence, 0) / gauntletResponses.value.length
    const correctCount = gauntletResponses.value.filter(r => r.correct).length
    const accuracy = (correctCount / gauntletResponses.value.length) * 100
    return { confidence, accuracy }
  })

  const latestAssessmentAttempt = computed<AssessmentAttempt | null>(() =>
    assessmentAttempts.value.length ? assessmentAttempts.value[assessmentAttempts.value.length - 1] : null
  )

  const hasPassedAssessment = computed(() => !!latestAssessmentAttempt.value?.passed)

  const hasMeasurements = computed(() =>
    !!gauntletConfidenceAccuracy.value && hasPassedAssessment.value
  )

  // A simple, explainable calibration score: 100 minus how far stated
  // confidence sat from actual accuracy. Higher means better calibrated,
  // not "smarter" — the gauge caption on the Thank You screen says so.
  const confidenceScore = computed<number | null>(() => {
    if (!gauntletConfidenceAccuracy.value) return null
    const { confidence, accuracy } = gauntletConfidenceAccuracy.value
    return 100 - Math.abs(confidence - accuracy)
  })

  function elapsedSeconds(): number {
    if (!startedAt.value) return 0
    return Math.round((Date.now() - new Date(startedAt.value).getTime()) / 1000)
  }

  function reset() {
    startedAt.value = null
    lessonRatings.value = []
    gauntletResponses.value = []
    assessmentAttempts.value = []
    view.value = 'title'
    visited.value = ['title']
    if (import.meta.client) {
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    }
  }

  return {
    startedAt,
    lessonRatings,
    gauntletResponses,
    assessmentAttempts,
    view,
    visited,
    start,
    goTo,
    logLessonRating,
    logGauntletResponse,
    logAssessmentAttempt,
    averageLessonConfidence,
    gauntletConfidenceAccuracy,
    latestAssessmentAttempt,
    hasPassedAssessment,
    hasMeasurements,
    confidenceScore,
    elapsedSeconds,
    reset
  }
})
