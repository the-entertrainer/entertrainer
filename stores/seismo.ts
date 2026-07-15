import { defineStore } from 'pinia'
import type { AssessmentAttempt, Measurement, Placement, SgView } from '~/types/seismo'
import { PASS_MARK } from '~/utils/seismo/content'
import { EPICENTRE_TOLERANCE_KM, STATIONS } from '~/utils/seismo/model'

const STORAGE_KEY = 'seismo-progress'

interface Persisted {
  view: SgView
  visited: SgView[]
  lessonComplete: boolean
  measurements: Measurement[]
  placement: Placement | null
  attempts: AssessmentAttempt[]
}

function load(): Partial<Persisted> {
  if (!import.meta.client) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

// Holds every real thing the learner does. The Thank You screen reads straight
// from measurements / placement / attempts — nothing there is hardcoded.
// Navigation and progress persist (a real player resumes), but the elapsed
// -time clock is session-local so a resumed session never counts time the
// tab was closed.
export const useSeismoStore = defineStore('seismo', () => {
  const p = load()

  const view = ref<SgView>(p.view ?? 'title')
  const visited = ref<SgView[]>(p.visited ?? ['title'])
  const lessonComplete = ref<boolean>(p.lessonComplete ?? false)
  const measurements = ref<Measurement[]>(p.measurements ?? [])
  const placement = ref<Placement | null>(p.placement ?? null)
  const attempts = ref<AssessmentAttempt[]>(p.attempts ?? [])
  const startedAt = ref<number | null>(null)

  function persist() {
    if (!import.meta.client) return
    try {
      const data: Persisted = {
        view: view.value,
        visited: visited.value,
        lessonComplete: lessonComplete.value,
        measurements: measurements.value,
        placement: placement.value,
        attempts: attempts.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }

  function start() {
    if (startedAt.value == null) startedAt.value = Date.now()
  }

  function goTo(next: SgView) {
    view.value = next
    if (!visited.value.includes(next)) visited.value.push(next)
    persist()
  }

  function markLessonComplete() {
    lessonComplete.value = true
    persist()
  }

  function setMeasurement(m: Measurement) {
    measurements.value = measurements.value.filter(x => x.stationId !== m.stationId)
    measurements.value.push(m)
    persist()
  }

  function setPlacement(pl: Placement | null) {
    placement.value = pl
    persist()
  }

  function logAttempt(answers: number[], score: number) {
    attempts.value.push({ answers, score, passed: score >= PASS_MARK, at: new Date().toISOString() })
    persist()
  }

  const handsOnComplete = computed(() =>
    measurements.value.length >= STATIONS.length && placement.value != null
  )
  const located = computed(() =>
    placement.value != null && placement.value.errorKm <= EPICENTRE_TOLERANCE_KM
  )
  const latestAttempt = computed<AssessmentAttempt | null>(() =>
    attempts.value.length ? attempts.value[attempts.value.length - 1] : null
  )
  const assessmentPassed = computed(() => !!latestAttempt.value?.passed)

  // Menu progress: three sections, each done / not.
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
    measurements.value = []
    placement.value = null
    attempts.value = []
    startedAt.value = Date.now()
    if (import.meta.client) {
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    }
  }

  return {
    view, visited, lessonComplete, measurements, placement, attempts,
    start, goTo, markLessonComplete, setMeasurement, setPlacement, logAttempt,
    handsOnComplete, located, latestAttempt, assessmentPassed,
    progress, completedCount, elapsedSeconds, reset
  }
})
