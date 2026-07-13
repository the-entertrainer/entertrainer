import { defineStore } from 'pinia'
import type { AssessmentAttempt, GauntletResponse, LessonRating } from '~/types/confidenceTrap'
import { ASSESSMENT_PASS_THRESHOLD } from '~/utils/confidenceTrap/content'

// Holds every real, timestamped measurement taken across the module. The
// Thank You screen's chart reads directly from this store — there is no
// separate "display" data path, so what gets plotted is what actually
// happened.
export const useConfidenceTrapStore = defineStore('confidenceTrap', () => {
  const startedAt = ref<string | null>(null)
  const lessonRatings = ref<LessonRating[]>([])
  const gauntletResponses = ref<GauntletResponse[]>([])
  const assessmentAttempts = ref<AssessmentAttempt[]>([])

  function start() {
    if (!startedAt.value) startedAt.value = new Date().toISOString()
  }

  function logLessonRating(sectionId: string, rating: number) {
    lessonRatings.value = lessonRatings.value.filter(r => r.sectionId !== sectionId)
    lessonRatings.value.push({ sectionId, rating, at: new Date().toISOString() })
  }

  function logGauntletResponse(response: Omit<GauntletResponse, 'at'>) {
    gauntletResponses.value = gauntletResponses.value.filter(r => r.questionId !== response.questionId)
    gauntletResponses.value.push({ ...response, at: new Date().toISOString() })
  }

  function logAssessmentAttempt(answers: number[], score: number) {
    assessmentAttempts.value.push({
      answers,
      score,
      passed: score >= ASSESSMENT_PASS_THRESHOLD,
      at: new Date().toISOString()
    })
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
  }

  return {
    startedAt,
    lessonRatings,
    gauntletResponses,
    assessmentAttempts,
    start,
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
