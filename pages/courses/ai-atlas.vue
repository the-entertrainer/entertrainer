<script setup lang="ts">
/**
 * Design reminder — Rise-style, content-led AI course.
 * The course is a reading canvas first. Use prose, diagrams, media, and
 * interactions only when each serves a stated learning purpose.
 */
import { AI_MODULES, AI_GLOSSARY, type AiModule } from '~/content/aiCourse'

useHead({
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800;6..12,900&display=swap' }]
})

type ScreenId = 'objectives' | 'quiz' | 'match-game' | 'summary' | string
type QuizQuestion = { prompt: string; options: string[]; correct: number; explanation: string }
type PredictionStep = { context: string; options: string[]; correct: number; explanation: string }
type SortCard = { prompt: string; answer: string; explanation: string }
type MatchPrompt = { prompt: string; answer: string; explanation: string }

const STORAGE_KEY = 'entertrainer-ai-course-v9'
const current = ref(-1)
const menuOpen = ref(false)
const openDetails = ref<string | null>(null)
const visited = ref<string[]>([])
const predictionStep = ref(0)
const predictionChoice = ref<number | null>(null)
const predictionSubmitted = ref(false)
const timelineStep = ref(0)
const openFlashcards = ref<number[]>([])
const learningTab = ref(0)
const sortIndex = ref(0)
const sortChoice = ref<string | null>(null)
const sortSubmitted = ref(false)
const matchIndex = ref(0)
const matchChoice = ref<string | null>(null)
const matchSubmitted = ref(false)
const scenarioChoice = ref<number | null>(null)
const scenarioSubmitted = ref(false)
const safeguardsSelected = ref<number[]>([])
const safeguardsSubmitted = ref(false)
const quizIndex = ref(0)
const quizChoice = ref<number | null>(null)
const quizSubmitted = ref(false)
const quizAnswers = ref<number[]>([])
const plan = reactive({ task: '', check: '', reviewer: '' })
const courseCompleted = ref(false)
const courseMain = ref<HTMLElement | null>(null)
let revealObserver: IntersectionObserver | undefined

const predictionSteps: PredictionStep[] = [
  {
    context: 'Heavy rain has flooded the',
    options: ['tracks', 'invoice', 'ladder'],
    correct: 0,
    explanation: 'Tracks is the strongest continuation because the surrounding words describe flooding and travel. The model has not observed the event; it has estimated which token best fits this context.'
  },
  {
    context: 'Heavy rain has flooded the tracks, so the next train will be',
    options: ['delayed', 'celebrated', 'invisible'],
    correct: 0,
    explanation: 'Delayed fits the growing sentence. The earlier tokens, including “flooded the tracks”, remain in context and make a service disruption more likely than the alternatives.'
  },
  {
    context: 'Heavy rain has flooded the tracks, so the next train will be delayed. Passengers need to know when it may',
    options: ['resume', 'juggle', 'shrink'],
    correct: 0,
    explanation: 'Resume makes the service update coherent. A language model repeats this next-token process to extend a response. A fluent result can emerge from many small estimates, which is why fluency still needs verification.'
  }
]

const historyEvents = [
  { year: '1950', title: 'A practical question about intelligence', text: 'Alan Turing proposed judging machine intelligence through observable performance rather than a vague argument about whether a machine “thinks”.' },
  { year: '1956', title: 'AI becomes a named field', text: 'The Dartmouth Summer Research Project on Artificial Intelligence brought learning, language, abstraction, and problem solving together under the name “artificial intelligence”.' },
  { year: '1980s–2010s', title: 'Learning from data becomes practical', text: 'More data, better algorithms, and more capable computing helped models learn patterns from examples in images, speech, recommendations, and language.' },
  { year: '2017 onward', title: 'Transformers make scale possible', text: 'Transformer architectures improved the handling of long sequences. Modern language and multimodal models build on this long research history.' }
]

const definitionFlashcards = [
  { front: 'Task', back: 'What useful job is the system helping with? For example, estimate a travel time or draft a short summary.' },
  { front: 'Information', back: 'What input does the system receive? This may be text, images, measurements, locations, or structured records.' },
  { front: 'Check', back: 'How will a person decide whether the output is suitable, accurate enough, and safe to use?' }
]

const learningTabs = [
  { label: 'Written rules', title: 'A person specifies the method', text: 'If a form is incomplete, return it. The behaviour is predictable when the relevant rule can be written clearly in advance.', example: 'Example: Lock an account after too many incorrect password attempts.' },
  { label: 'Learned patterns', title: 'A model learns from examples', text: 'A model uses many examples to estimate which category or value best fits a new input. The examples shape both its strengths and its blind spots.', example: 'Example: Classify a customer message as delivery, billing, or product help.' },
  { label: 'Next-token prediction', title: 'A model extends a sequence', text: 'A language model estimates a likely next token from the words and instructions already in context, then adds it and repeats.', example: 'Example: Draft a meeting summary one context-sensitive token at a time.' }
]

const sortCards: SortCard[] = [
  { prompt: 'A photograph of a damaged parcel before a vision system examines it.', answer: 'Input', explanation: 'The photograph is input: information supplied to the system before it produces a result.' },
  { prompt: 'A system estimates an 80% chance that a delivery will arrive late.', answer: 'Output', explanation: 'The estimate is output: the system’s result from the information and pattern it used.' },
  { prompt: 'A team compares a delay prediction with what actually happened on recent deliveries.', answer: 'Evaluation', explanation: 'This is evaluation: people check whether the model’s outputs are useful and accurate enough for the task.' }
]

const matchPrompts: MatchPrompt[] = [
  { prompt: 'A model family described as working across text, images, audio, and video.', answer: 'Gemini', explanation: 'Gemini is publicly described as a multimodal model family designed to work across several forms of information.' },
  { prompt: 'A technical report describes this model as accepting image and text inputs and producing text outputs.', answer: 'GPT-4', explanation: 'GPT-4 is described in its technical report as accepting image and text inputs and producing text outputs.' },
  { prompt: 'Public documentation describes text analysis, coding, structured output, and vision tasks.', answer: 'Claude', explanation: 'Claude is publicly described through these capabilities. In each case, the key question remains how the output will be evaluated in the real task.' }
]

const scenarioOptions = [
  'Upload the file to a public tool because the summary will be checked later.',
  'Pause, remove personal information, and confirm whether an approved tool and review process are available.',
  'Ask the model to decide which employee needs the most attention and act on its answer.'
]

const safeguardOptions = [
  'Use only information that is safe and approved for the task.',
  'Check important facts, references, and policy wording against reliable sources.',
  'Keep a named person accountable for the final decision.',
  'Treat confident wording as proof that the result is correct.'
]

const quizQuestions: QuizQuestion[] = [
  {
    prompt: 'Which statement best corrects the belief that AI began with ChatGPT?',
    options: ['AI became a field only when chat tools became popular', 'AI research on reasoning, learning, language, and problem solving has developed over many decades', 'Modern chat tools do not use any earlier research'],
    correct: 1,
    explanation: 'Modern chat tools are a recent public chapter in a much longer history of AI research, including the 1950 Turing paper and the 1956 Dartmouth project.'
  },
  {
    prompt: 'Which question helps define an AI system in practical terms?',
    options: ['Does the system sound intelligent?', 'What task does it support, what information does it use, and how will the output be checked?', 'Can it produce a long answer?'],
    correct: 1,
    explanation: 'Task, information, pattern, and checking method provide a practical way to understand an AI use case.'
  },
  {
    prompt: 'Which statement describes training from examples?',
    options: ['Using a trained model on a new request', 'Adjusting a model with examples so it can learn a useful pattern', 'Checking an AI output against a source'],
    correct: 1,
    explanation: 'Training is the stage where a model learns patterns from examples. Inference is using that trained model on a new input.'
  },
  {
    prompt: 'Why can a language model give a different continuation in two similar sentences?',
    options: ['The surrounding context changes which next token is most likely', 'The model retrieves one fixed answer from a database', 'The model can only process one word at a time without context'],
    correct: 0,
    explanation: 'Language models use patterns in the surrounding context when they estimate a likely next token.'
  },
  {
    prompt: 'Which statement best describes the modern AI landscape?',
    options: ['A chatbot is the only important type of AI', 'Different AI systems work with different inputs and outputs, including prediction, vision, language, multimodal, and tool-using systems', 'Every famous model is suitable for every task'],
    correct: 1,
    explanation: 'Modern AI includes several task-specific families. The right question is which kind of system fits the particular task and how its output will be checked.'
  },
  {
    prompt: 'Which is the strongest low-risk starting point for an AI use case?',
    options: ['Making a final eligibility decision about a person', 'Drafting a meeting outline from non-sensitive notes, then reviewing it', 'Sending a confidential file to a public tool without controls'],
    correct: 1,
    explanation: 'A bounded task with safe inputs, a clear review step, and human accountability is a sensible starting point.'
  }
]

const currentModule = computed<AiModule | undefined>(() => current.value >= 1 && current.value <= AI_MODULES.length ? AI_MODULES[current.value - 1] : undefined)
const currentId = computed<ScreenId>(() => {
  if (current.value === 0) return 'objectives'
  if (current.value >= 1 && current.value <= AI_MODULES.length) return AI_MODULES[current.value - 1].id
  if (current.value === AI_MODULES.length + 1) return 'quiz'
  if (current.value === AI_MODULES.length + 2) return 'match-game'
  return 'summary'
})
const TOTAL_SCREENS = AI_MODULES.length + 4
const progress = computed(() => Math.round((visited.value.length / TOTAL_SCREENS) * 100))
const quizQuestion = computed(() => quizQuestions[quizIndex.value])
const quizScore = computed(() => quizAnswers.value.filter((answer, index) => answer === quizQuestions[index]?.correct).length)
const planReady = computed(() => plan.task.trim().length > 10 && plan.check.trim().length > 10 && plan.reviewer.trim().length > 10)
const currentSortCard = computed(() => sortCards[sortIndex.value])
const currentMatchPrompt = computed(() => matchPrompts[matchIndex.value])

function persist() {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ current: current.value, visited: visited.value, quizAnswers: quizAnswers.value, completed: courseCompleted.value }))
}
function markVisited(id: string) {
  if (!visited.value.includes(id)) visited.value = [...visited.value, id]
}
function setupScrollReveals() {
  if (!import.meta.client || !courseMain.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  revealObserver?.disconnect()
  const root = courseMain.value
  root.classList.add('has-scroll-reveal')
  const rootBounds = root.getBoundingClientRect()
  const targets = root.querySelectorAll<HTMLElement>('.cover__body > *, .screen > *, .reading > *')
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ;(entry.target as HTMLElement).classList.add('is-visible')
        revealObserver?.unobserve(entry.target)
      }
    })
  }, { root, threshold: 0.08 })
  targets.forEach(target => {
    target.classList.remove('rise-reveal', 'is-visible', 'is-pending')
    target.classList.add('rise-reveal')
    const bounds = target.getBoundingClientRect()
    if (bounds.top < rootBounds.bottom + 32 && bounds.bottom > rootBounds.top - 32) target.classList.add('is-visible')
    else {
      target.classList.add('is-pending')
      revealObserver?.observe(target)
    }
  })
}
function scrollCourseToTop() {
  if (!import.meta.client) return
  nextTick(() => requestAnimationFrame(() => {
    const behaviour = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    courseMain.value?.scrollTo({ top: 0, behavior: behaviour })
    window.scrollTo({ top: 0, behavior: behaviour })
    setupScrollReveals()
  }))
}
function go(index: number) {
  current.value = index
  if (index >= 0) markVisited(currentId.value)
  menuOpen.value = false
  openDetails.value = null
  persist()
  scrollCourseToTop()
}
function startCourse() { go(0) }
function next() { if (current.value < AI_MODULES.length + 3) go(current.value + 1) }
function previous() { if (current.value > -1) go(current.value - 1) }
function completeCurrent() { markVisited(currentId.value); next() }
function submitQuiz() {
  if (quizChoice.value === null) return
  quizSubmitted.value = true
}
function submitPrediction() {
  if (predictionChoice.value === null) return
  predictionSubmitted.value = true
}
function nextPredictionStep() {
  if (!predictionSubmitted.value) return
  if (predictionStep.value < predictionSteps.length - 1) {
    predictionStep.value += 1
    predictionChoice.value = null
    predictionSubmitted.value = false
  }
}
function toggleFlashcard(index: number) {
  openFlashcards.value = openFlashcards.value.includes(index)
    ? openFlashcards.value.filter((item) => item !== index)
    : [...openFlashcards.value, index]
}
function submitSort() {
  if (!sortChoice.value) return
  sortSubmitted.value = true
}
function nextSortCard() {
  if (!sortSubmitted.value) return
  if (sortIndex.value < sortCards.length - 1) {
    sortIndex.value += 1
    sortChoice.value = null
    sortSubmitted.value = false
  }
}
function submitMatch() {
  if (!matchChoice.value) return
  matchSubmitted.value = true
}
function nextMatchPrompt() {
  if (!matchSubmitted.value) return
  if (matchIndex.value < matchPrompts.length - 1) {
    matchIndex.value += 1
    matchChoice.value = null
    matchSubmitted.value = false
  }
}
function submitScenario() {
  if (scenarioChoice.value === null) return
  scenarioSubmitted.value = true
}
function toggleSafeguard(index: number) {
  safeguardsSelected.value = safeguardsSelected.value.includes(index)
    ? safeguardsSelected.value.filter((item) => item !== index)
    : [...safeguardsSelected.value, index]
}
function submitSafeguards() {
  if (!safeguardsSelected.value.length) return
  safeguardsSubmitted.value = true
}
function isCorrectSafeguardSet() {
  return safeguardsSelected.value.length === 3 && [0, 1, 2].every((item) => safeguardsSelected.value.includes(item))
}
function nextQuizQuestion() {
  if (!quizSubmitted.value || quizChoice.value === null) return
  quizAnswers.value = [...quizAnswers.value, quizChoice.value]
  if (quizIndex.value < quizQuestions.length - 1) {
    quizIndex.value += 1
    quizChoice.value = null
    quizSubmitted.value = false
  } else {
    markVisited('quiz')
    go(AI_MODULES.length + 2)
  }
  persist()
  if (quizIndex.value < quizQuestions.length - 1) scrollCourseToTop()
}
function finishCourse() {
  if (!planReady.value) return
  courseCompleted.value = true
  markVisited('summary')
  persist()
}
function resetCourse() {
  current.value = -1
  visited.value = []
  predictionStep.value = 0
  predictionChoice.value = null
  predictionSubmitted.value = false
  timelineStep.value = 0
  openFlashcards.value = []
  learningTab.value = 0
  sortIndex.value = 0
  sortChoice.value = null
  sortSubmitted.value = false
  matchIndex.value = 0
  matchChoice.value = null
  matchSubmitted.value = false
  scenarioChoice.value = null
  scenarioSubmitted.value = false
  safeguardsSelected.value = []
  safeguardsSubmitted.value = false
  quizIndex.value = 0
  quizChoice.value = null
  quizSubmitted.value = false
  quizAnswers.value = []
  plan.task = ''; plan.check = ''; plan.reviewer = ''
  courseCompleted.value = false
  resetOrderGame()
  shuffleMemoryGame()
  recapStep.value = 0
  activeFamily.value = null
  persist()
}
function isComplete(id: string) { return visited.value.includes(id) }
function headerLabel() {
  if (current.value === 0) return 'Course introduction'
  if (currentModule.value) return `Lesson ${currentModule.value.number} of ${AI_MODULES.length}`
  if (currentId.value === 'quiz') return 'Knowledge check'
  if (currentId.value === 'match-game') return 'Bonus round'
  return 'Course summary'
}
function headerTitle() {
  if (current.value === 0) return 'Objectives'
  if (currentModule.value) return currentModule.value.title
  if (currentId.value === 'quiz') return 'Knowledge check'
  if (currentId.value === 'match-game') return 'Match the words'
  return 'Wrap-up'
}

/**
 * Mini-game 1 — Put the milestones in order.
 * A tap-to-place ordering game built from the same four `historyEvents`
 * already used by the timeline explorer above it. No new facts: it reuses
 * the exact year/title pairs, just as a quick recall game instead of a
 * reading panel.
 */
const orderPool = ref<string[]>([])
const orderPlaced = ref<string[]>([])
const orderSubmitted = ref(false)
function shuffleOrderPool() {
  const years = historyEvents.map((e) => e.year)
  orderPool.value = [...years].sort(() => Math.random() - 0.5)
  orderPlaced.value = []
  orderSubmitted.value = false
}
function placeOrderItem(year: string) {
  if (orderSubmitted.value) return
  orderPool.value = orderPool.value.filter((y) => y !== year)
  orderPlaced.value = [...orderPlaced.value, year]
}
function removeOrderItem(year: string) {
  if (orderSubmitted.value) return
  orderPlaced.value = orderPlaced.value.filter((y) => y !== year)
  orderPool.value = [...orderPool.value, year]
}
function submitOrder() {
  if (orderPlaced.value.length !== historyEvents.length) return
  orderSubmitted.value = true
}
function resetOrderGame() { shuffleOrderPool() }
const isOrderCorrect = computed(() =>
  orderSubmitted.value && orderPlaced.value.every((year, i) => year === historyEvents[i].year))
shuffleOrderPool()

/**
 * Mini-game 2 — Match the words.
 * A flip-card memory game built from the existing `AI_GLOSSARY` pairs — the
 * same eight terms already defined for the site's glossary, just presented
 * as a matching game instead of a list. No new content is introduced.
 */
type MemoryCard = { uid: number; pairId: number; face: string; kind: 'term' | 'def' }
const memoryCards = ref<MemoryCard[]>([])
const memoryFlipped = ref<number[]>([])
const memoryMatched = ref<number[]>([])
const memoryMoves = ref(0)
const memoryLocked = ref(false)
function shuffleMemoryGame() {
  const cards: MemoryCard[] = []
  AI_GLOSSARY.forEach(([term, def], pairId) => {
    cards.push({ uid: pairId * 2, pairId, face: term, kind: 'term' })
    cards.push({ uid: pairId * 2 + 1, pairId, face: def, kind: 'def' })
  })
  memoryCards.value = cards.sort(() => Math.random() - 0.5)
  memoryFlipped.value = []
  memoryMatched.value = []
  memoryMoves.value = 0
  memoryLocked.value = false
}
function flipMemoryCard(uid: number) {
  if (memoryLocked.value) return
  if (memoryFlipped.value.includes(uid) || memoryMatched.value.includes(uid)) return
  if (memoryFlipped.value.length === 2) return
  memoryFlipped.value = [...memoryFlipped.value, uid]
  if (memoryFlipped.value.length === 2) {
    memoryMoves.value += 1
    const [a, b] = memoryFlipped.value.map((id) => memoryCards.value.find((c) => c.uid === id)!)
    if (a.pairId === b.pairId) {
      memoryMatched.value = [...memoryMatched.value, a.uid, b.uid]
      memoryFlipped.value = []
    } else {
      memoryLocked.value = true
      setTimeout(() => { memoryFlipped.value = []; memoryLocked.value = false }, 800)
    }
  }
}
const memoryComplete = computed(() => memoryMatched.value.length === memoryCards.value.length && memoryCards.value.length > 0)
shuffleMemoryGame()

/**
 * Rise "Process" block — a step carousel. Used once, as a recap of the
 * prediction lab the learner just completed: same three `predictionSteps`,
 * replayed as Step 1/2/3 cards instead of the live activity. No new content.
 */
const recapStep = ref(0)

/**
 * Rise "Labeled Graphic" block — numbered pins on a diagram, click to
 * reveal a caption. Used once, on the "modern-landscape" lesson, with
 * captions lifted verbatim from that lesson's own "Five useful families to
 * recognise" section rather than written fresh.
 */
const aiFamilies = [
  { label: 'Prediction & recommendation', x: 20, y: 30, caption: 'Estimate a value or rank options: travel time, likely demand, possible fraud, or a video you may want to watch.' },
  { label: 'Computer vision', x: 78, y: 26, caption: 'Classify or locate patterns in images and video: a defect on a product, a road sign, or a medical feature that needs a clinician’s attention.' },
  { label: 'Language models', x: 50, y: 15, caption: 'Work with text and code.' },
  { label: 'Multimodal models', x: 22, y: 75, caption: 'Combine information such as text, images, audio, and video.' },
  { label: 'Tool-using systems', x: 78, y: 75, caption: 'Connect a model to approved search, database, or workflow tools.' }
]
const activeFamily = ref<number | null>(null)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const state = JSON.parse(saved)
      current.value = typeof state.current === 'number' ? Math.min(state.current, AI_MODULES.length + 3) : -1
      visited.value = Array.isArray(state.visited) ? state.visited : []
      quizAnswers.value = Array.isArray(state.quizAnswers) ? state.quizAnswers : []
      courseCompleted.value = Boolean(state.completed)
    } catch { localStorage.removeItem(STORAGE_KEY) }
  }
  nextTick(setupScrollReveals)
})
onBeforeUnmount(() => revealObserver?.disconnect())
</script>

<template>
  <div class="course">
    <!-- ── Masthead ──────────────────────────────────────────────────── -->
    <header class="course__bar">
      <button type="button" class="course__brand" @click="go(-1)">
        <span class="course__mark" aria-hidden="true">E</span>
        <span class="course__brand-text">From No AI to Know AI</span>
      </button>
      <nav class="course__actions" aria-label="Course">
        <NuxtLink to="/my-work" class="course__link">Exit</NuxtLink>
      </nav>
    </header>

    <div class="course__subbar">
      <button type="button" class="course__hamburger" :class="{ 'is-on': menuOpen }"
              aria-label="Course contents" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <div class="course__progress" v-if="current >= 0">
        <span class="course__progress-n">{{ progress }}% complete</span>
      </div>
    </div>
    <span v-if="current >= 0" class="course__progress-track" role="img" :aria-label="`${progress}% complete`">
      <span class="course__progress-fill" :style="{ width: progress + '%' }" />
    </span>

    <!-- ── Course-contents drawer ────────────────────────────────────── -->
    <div v-if="menuOpen" class="course__scrim" @click="menuOpen = false" />
    <aside class="course__drawer" :class="{ 'is-open': menuOpen }" :inert="!menuOpen" aria-label="Course contents">
      <div class="course__drawer-head">
        <p class="course__drawer-kicker">Course content</p>
        <button type="button" class="course__drawer-close" aria-label="Close course contents" @click="menuOpen = false">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <ol class="course__drawer-list">
        <li>
          <button type="button" class="drawer-row" :class="{ 'is-active': current === 0 }" @click="go(0)">
            <span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h7M9 14h7" /></svg></span>
            <span class="drawer-row__label">Objectives</span>
            <span class="drawer-row__dot" :class="{ 'is-done': isComplete('objectives') }" aria-hidden="true" />
          </button>
        </li>
        <li v-for="(item, index) in AI_MODULES" :key="item.id">
          <button type="button" class="drawer-row" :class="{ 'is-active': current === index + 1 }" @click="go(index + 1)">
            <span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h7M9 14h7M9 18h4" /></svg></span>
            <span class="drawer-row__label">{{ item.short }}</span>
            <span class="drawer-row__dot" :class="{ 'is-done': isComplete(item.id) }" aria-hidden="true" />
          </button>
        </li>
        <li>
          <button type="button" class="drawer-row" :class="{ 'is-active': currentId === 'quiz' }" @click="go(AI_MODULES.length + 1)">
            <span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg></span>
            <span class="drawer-row__label">Knowledge check</span>
            <span class="drawer-row__dot" :class="{ 'is-done': isComplete('quiz') }" aria-hidden="true" />
          </button>
        </li>
        <li>
          <button type="button" class="drawer-row" :class="{ 'is-active': currentId === 'match-game' }" @click="go(AI_MODULES.length + 2)">
            <span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="4.5" /></svg></span>
            <span class="drawer-row__label">Bonus: Match the words</span>
            <span class="drawer-row__dot" :class="{ 'is-done': isComplete('match-game') }" aria-hidden="true" />
          </button>
        </li>
        <li>
          <button type="button" class="drawer-row" :class="{ 'is-active': currentId === 'summary' }" @click="go(AI_MODULES.length + 3)">
            <span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h7M9 14h7M9 18h4" /></svg></span>
            <span class="drawer-row__label">Summary</span>
            <span class="drawer-row__dot" :class="{ 'is-done': isComplete('summary') }" aria-hidden="true" />
          </button>
        </li>
      </ol>
    </aside>

    <main ref="courseMain" class="course__main">
      <Transition name="course-fade" mode="out-in" @after-enter="setupScrollReveals">
        <!-- ── Cover ─────────────────────────────────────────────────── -->
        <section v-if="current === -1" key="overview" class="cover">
          <div class="cover__banner">
            <h1 class="cover__title">From No AI<br />to Know AI</h1>
            <button type="button" class="cover__start" @click="startCourse">{{ visited.length ? 'Resume course' : 'Start course' }}</button>
          </div>
          <div class="cover__body">
            <span class="course__mark course__mark--lg" aria-hidden="true">E</span>
            <p class="cover__duration">Approximately 95 minutes</p>
            <p>Artificial intelligence did not begin with ChatGPT. This course traces the long path from early questions about machine intelligence to the prediction systems, language models, and multimodal tools used today.</p>
            <p>Read each lesson in sequence. The course begins with history, then explains learning and prediction, maps the modern AI landscape, and ends with a practical way to use capability with judgement.</p>
            <div class="cover__panel">
              <h2 class="cover__panel-h">Course content</h2>
              <ol class="cover__outline">
                <li><button type="button" @click="go(0)"><span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h7M9 14h7" /></svg></span><span>Objectives</span><span class="drawer-row__dot" :class="{ 'is-done': isComplete('objectives') }" /></button></li>
                <li v-for="(item, index) in AI_MODULES" :key="item.id"><button type="button" @click="go(index + 1)"><span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h7M9 14h7M9 18h4" /></svg></span><span>{{ item.short }}</span><span class="drawer-row__dot" :class="{ 'is-done': isComplete(item.id) }" /></button></li>
                <li><button type="button" @click="go(AI_MODULES.length + 1)"><span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg></span><span>Knowledge check</span><span class="drawer-row__dot" :class="{ 'is-done': isComplete('quiz') }" /></button></li>
                <li><button type="button" @click="go(AI_MODULES.length + 2)"><span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="4.5" /></svg></span><span>Bonus: Match the words</span><span class="drawer-row__dot" :class="{ 'is-done': isComplete('match-game') }" /></button></li>
                <li><button type="button" @click="go(AI_MODULES.length + 3)"><span class="drawer-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h7M9 14h7M9 18h4" /></svg></span><span>Summary</span><span class="drawer-row__dot" :class="{ 'is-done': isComplete('summary') }" /></button></li>
              </ol>
            </div>
          </div>
        </section>

        <!-- ── Lesson / quiz / game / summary screens ───────────────────── -->
        <section v-else :key="currentId" class="screen">
          <header class="lesson-banner">
            <p class="lesson-banner__crumb">{{ headerLabel() }}</p>
            <h1 class="lesson-banner__title">{{ headerTitle() }}</h1>
            <span class="lesson-banner__rule" aria-hidden="true" />
          </header>

          <article v-if="current === 0" class="reading">
            <p>Before you begin, use these objectives to organise the story of the course. Each lesson develops one idea needed for the next: history, task, learning, prediction, modern capability, and judgement.</p>
            <div class="panel">
              <h2 class="panel__h">Objectives</h2>
              <p class="panel__sub">By the end of this course, you should be able to:</p>
              <ul class="panel__list">
                <li>Correct the misconception that AI began with modern chat tools by describing its long research history.</li>
                <li>Explain how examples, context, and next-token prediction produce useful AI outputs.</li>
                <li>Recognise major AI types and match their capabilities, limits, and safeguards to a real task.</li>
              </ul>
            </div>
            <h2>How the course is organised</h2>
            <p>The first three lessons answer where AI came from, what it is, and how a model learns a pattern. The central lesson then makes next-token prediction visible. The final lessons map modern AI types, explain what famous models can and cannot demonstrate, and turn the story into a practical use routine.</p>
            <section class="info-note"><i aria-hidden="true">i</i><div><b>Reading first</b><p>Complete the explanations and worked examples before opening the small activities. Each activity is designed to make one idea visible, not to replace the lesson.</p></div></section>

            <h2>Course at a glance</h2>
            <div class="rise-table">
              <div class="rise-table__row rise-table__row--head">
                <span>Lesson</span><span>Duration</span><span>What it's for</span>
              </div>
              <div v-for="item in AI_MODULES" :key="item.id" class="rise-table__row">
                <span><b>{{ item.number }}</b> {{ item.short }}</span>
                <span>{{ item.duration }}</span>
                <span>{{ item.objective }}</span>
              </div>
            </div>

            <button type="button" class="continue-block" @click="completeCurrent">Continue to Lesson 1</button>
          </article>

          <article v-else-if="currentModule" class="reading">
            <p v-for="paragraph in currentModule.introduction" :key="paragraph">{{ paragraph }}</p>
            <section class="info-note"><i aria-hidden="true">i</i><div><b>Learning objective</b><p>{{ currentModule.objective }}</p></div></section>

            <section v-for="section in currentModule.sections" :key="section.heading" class="text-section">
              <h2>{{ section.heading }}</h2>
              <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
            </section>

            <section class="diagram">
              <template v-if="currentModule.diagram === 'timeline'"><span>Questions</span><i>→</i><span>Rules</span><i>→</i><span>Learning</span><i>→</i><span>Transformers</span><i>→</i><span>Modern AI</span></template>
              <template v-else-if="currentModule.diagram === 'task'"><span>Task</span><i>→</i><span>Information</span><i>→</i><span>Output</span><i>→</i><span>Check</span></template>
              <template v-else-if="currentModule.diagram === 'learning'"><span>Labelled examples</span><i>→</i><span>Training</span><i>→</i><span>New request</span><i>→</i><span>Output</span></template>
              <template v-else-if="currentModule.diagram === 'prediction'"><span>Prompt and context</span><i>→</i><span>Relevant patterns</span><i>→</i><span>Likely next token</span></template>
              <template v-else-if="currentModule.diagram === 'landscape'"><span>Prediction</span><i>·</i><span>Vision</span><i>·</i><span>Language</span><i>·</i><span>Multimodal</span><i>·</i><span>Tools</span></template>
              <template v-else-if="currentModule.diagram === 'capabilities'"><span>Input</span><i>→</i><span>Model</span><i>→</i><span>Candidate output</span><i>→</i><span>Evaluation</span></template>
              <template v-else><span>Bounded task</span><i>→</i><span>Protect information</span><i>→</i><span>Check output</span><i>→</i><span>Accountable person</span></template>
            </section>

            <section class="worked-example">
              <h2>{{ currentModule.exampleTitle }}</h2>
              <p v-for="paragraph in currentModule.example" :key="paragraph">{{ paragraph }}</p>
            </section>

            <section v-if="currentModule.visual === 'history'" class="media"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/UrwXNXgLQEdronNQ.jpg" alt="Editorial visual timeline from early artificial intelligence research to modern AI systems" /><p>Use this timeline as a reading aid. It does not list every breakthrough; it shows how modern AI rests on a long sequence of questions, methods, data, computing, and model design.</p></section>
            <section v-if="currentModule.visual === 'models'" class="media"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/htTSgHWeiwDLlMXR.jpg" alt="Editorial visual showing different types of modern AI systems and their inputs" /><p>This visual groups modern AI by the kind of information it works with and the kind of output it can create. It reinforces the distinction explained in the lesson text.</p></section>

            <section v-if="currentModule.video" class="video"><h2>{{ currentModule.video.title }}</h2><p><strong>Viewing question:</strong> {{ currentModule.video.question }}</p><div class="video__frame"><iframe :src="currentModule.video.url" :title="currentModule.video.title" loading="lazy" allowfullscreen /></div></section>

            <hr class="rise-divider" />

            <section v-if="currentModule.id === 'modern-landscape'" class="labeled-graphic">
              <p class="block__eyebrow">Labeled graphic</p>
              <h2>Five families, one landscape</h2>
              <p>Select each point to see what that family of AI actually does.</p>
              <div class="labeled-graphic__stage">
                <span class="labeled-graphic__hub">Modern AI</span>
                <button
                  v-for="(family, i) in aiFamilies" :key="family.label" type="button"
                  class="labeled-graphic__pin" :class="{ 'is-active': activeFamily === i }"
                  :style="{ left: family.x + '%', top: family.y + '%' }"
                  :aria-expanded="activeFamily === i" :aria-label="family.label"
                  @click="activeFamily = activeFamily === i ? null : i"
                >{{ i + 1 }}</button>
              </div>
              <div v-if="activeFamily !== null" class="labeled-graphic__caption">
                <b>{{ aiFamilies[activeFamily].label }}</b>
                <p>{{ aiFamilies[activeFamily].caption }}</p>
              </div>
              <p v-else class="labeled-graphic__hint">Tap a numbered point on the diagram above.</p>
            </section>

            <section v-if="currentModule.id === 'before-chatbots'" class="block">
              <p class="block__eyebrow">Interactive timeline · {{ timelineStep + 1 }} of {{ historyEvents.length }}</p>
              <h2>Trace the long route to modern AI</h2>
              <p>Move through four milestones. Notice that a modern chatbot appears only after earlier questions about intelligence, named AI research, learning from examples, and transformer architecture.</p>
              <div class="timeline-nav" role="tablist" aria-label="AI history milestones"><button v-for="(event, index) in historyEvents" :key="event.year" type="button" :class="{ 'is-active': timelineStep === index }" :aria-selected="timelineStep === index" role="tab" @click="timelineStep = index"><b>{{ event.year }}</b><span>{{ event.title }}</span></button></div>
              <div class="timeline-event"><b>{{ historyEvents[timelineStep].year }}</b><h3>{{ historyEvents[timelineStep].title }}</h3><p>{{ historyEvents[timelineStep].text }}</p></div>
              <p class="block__takeaway">The point is not to memorise every date. It is to see that ChatGPT is a recent public chapter in a much older field.</p>
            </section>

            <!-- Mini-game: put the same four milestones in order, tap-to-place -->
            <section v-if="currentModule.id === 'before-chatbots'" class="block game-block">
              <p class="block__eyebrow">Mini game</p>
              <h2>Put the milestones in order</h2>
              <p>Tap the four cards below, oldest first, to rebuild the timeline you just read.</p>
              <div class="order-game">
                <ol class="order-game__slots" aria-label="Your order">
                  <li v-for="(year, i) in orderPlaced" :key="year" class="order-game__slot is-filled">
                    <span class="order-game__slot-n">{{ i + 1 }}</span>
                    <button type="button" :disabled="orderSubmitted" @click="removeOrderItem(year)">{{ year }}</button>
                  </li>
                  <li v-for="n in (historyEvents.length - orderPlaced.length)" :key="`empty-${n}`" class="order-game__slot">
                    <span class="order-game__slot-n">{{ orderPlaced.length + n }}</span>
                  </li>
                </ol>
                <div class="order-game__pool">
                  <button v-for="year in orderPool" :key="year" type="button" class="order-game__chip" @click="placeOrderItem(year)">{{ year }}</button>
                </div>
                <button v-if="!orderSubmitted" type="button" class="submit-btn" :disabled="orderPlaced.length !== historyEvents.length" @click="submitOrder">Check my order</button>
                <template v-else>
                  <p class="activity-feedback" :class="{ 'is-correct': isOrderCorrect }">
                    <strong>{{ isOrderCorrect ? 'That is the right order.' : 'Not quite the right order.' }}</strong>
                    {{ isOrderCorrect ? 'Questions came first, then a named field, then learning from data, then transformers.' : 'The correct order is 1950, 1956, 1980s–2010s, 2017 onward.' }}
                  </p>
                  <button type="button" class="next-link" @click="resetOrderGame">Shuffle and try again</button>
                </template>
              </div>
            </section>

            <section v-if="currentModule.id === 'what-ai-is'" class="block flashcards">
              <p class="block__eyebrow">Recall pause</p>
              <h2>Use the practical definition</h2>
              <p>Before continuing, turn over each card and connect it to the travel-time example you have just read.</p>
              <div class="flashcards__grid"><button v-for="(card, index) in definitionFlashcards" :key="card.front" type="button" :class="{ 'is-open': openFlashcards.includes(index) }" :aria-pressed="openFlashcards.includes(index)" @click="toggleFlashcard(index)"><span v-if="!openFlashcards.includes(index)"><b>{{ card.front }}</b><small>Select to reveal</small></span><span v-else><small>{{ card.front }}</small><b>{{ card.back }}</b></span></button></div>
              <p class="block__takeaway">When you meet an AI claim, return to these three prompts: task, information, and check.</p>
            </section>

            <section v-if="currentModule.id === 'learning-patterns'" class="block tabs-block">
              <p class="block__eyebrow">Compare the methods</p>
              <h2>One task, three ways of producing an output</h2>
              <p>Read the three panels in order. Each method can be useful; the difference is how the output is produced and where its limits come from.</p>
              <div class="tabs-block__tabs" role="tablist" aria-label="Ways a system produces an output"><button v-for="(tab, index) in learningTabs" :key="tab.label" type="button" :class="{ 'is-active': learningTab === index }" :aria-selected="learningTab === index" role="tab" @click="learningTab = index">{{ tab.label }}</button></div>
              <div class="tabs-block__panel"><h3>{{ learningTabs[learningTab].title }}</h3><p>{{ learningTabs[learningTab].text }}</p><p><strong>{{ learningTabs[learningTab].example }}</strong></p></div>
              <p class="block__takeaway">Rules follow an authored method. Learned models estimate from examples. Language models estimate how a text sequence may continue.</p>
            </section>

            <section v-if="currentModule.activity === 'predictionLab'" class="prediction-lab">
              <p class="prediction-lab__eyebrow">Prediction lab · {{ predictionStep + 1 }} of {{ predictionSteps.length }}</p>
              <h2>Watch a response take shape</h2>
              <p>You have read how context changes a next-token estimate. Now build one short service update across three predictions. Choose the continuation that best fits the text, then observe how that predicted token becomes part of the next context.</p>
              <blockquote>{{ predictionSteps[predictionStep].context }} <b>…</b></blockquote>
              <div class="choice-column">
                <button v-for="(option, index) in predictionSteps[predictionStep].options" :key="option" type="button" :class="{ 'is-selected': predictionChoice === index }" :disabled="predictionSubmitted" @click="predictionChoice = index">{{ option }}</button>
              </div>
              <button v-if="!predictionSubmitted" type="button" class="submit-btn" :disabled="predictionChoice === null" @click="submitPrediction">Submit prediction</button>
              <template v-else>
                <p class="activity-feedback" :class="{ 'is-correct': predictionChoice === predictionSteps[predictionStep].correct }"><strong>{{ predictionChoice === predictionSteps[predictionStep].correct ? 'A useful estimate.' : 'Compare the context again.' }}</strong> {{ predictionSteps[predictionStep].explanation }}</p>
                <div class="prediction-lab__output"><span>Growing generated text</span><p>{{ predictionSteps[predictionStep].context }} <b>{{ predictionSteps[predictionStep].options[predictionSteps[predictionStep].correct] }}</b></p></div>
              </template>
              <button v-if="predictionSubmitted && predictionStep < predictionSteps.length - 1" type="button" class="next-link" @click="nextPredictionStep">Continue the prediction</button>
              <p v-if="predictionSubmitted && predictionStep === predictionSteps.length - 1" class="prediction-lab__conclusion">You have now seen the core mechanism: a language-model response is built through many small, context-sensitive estimates. That is powerful, but it does not make the result automatically true.</p>
            </section>

            <section v-if="currentModule.activity === 'predictionLab' && predictionSubmitted && predictionStep === predictionSteps.length - 1" class="process">
              <p class="block__eyebrow">Process · replay</p>
              <h2>The three estimates, side by side</h2>
              <div class="process__card">
                <span class="process__step">Step {{ recapStep + 1 }} of {{ predictionSteps.length }}</span>
                <blockquote>{{ predictionSteps[recapStep].context }} <b>{{ predictionSteps[recapStep].options[predictionSteps[recapStep].correct] }}</b></blockquote>
                <p>{{ predictionSteps[recapStep].explanation }}</p>
                <div class="process__nav">
                  <button type="button" aria-label="Previous step" :disabled="recapStep === 0" @click="recapStep -= 1">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
                  </button>
                  <span class="process__dots">
                    <i v-for="(s, i) in predictionSteps" :key="i" :class="{ 'is-on': i === recapStep }" />
                  </span>
                  <button type="button" aria-label="Next step" :disabled="recapStep === predictionSteps.length - 1" @click="recapStep += 1">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
            </section>

            <section v-if="currentModule.id === 'modern-landscape'" class="block game-block">
              <p class="block__eyebrow">Sorting game · {{ sortIndex + 1 }} of {{ sortCards.length }}</p>
              <h2>Sort the AI workflow</h2>
              <p>You have seen that an AI system takes information, produces an output, and needs evaluation. Classify the item below using that same sequence.</p>
              <blockquote>{{ currentSortCard.prompt }}</blockquote>
              <div class="choice-row"><button v-for="option in ['Input', 'Output', 'Evaluation']" :key="option" type="button" :class="{ 'is-selected': sortChoice === option }" :disabled="sortSubmitted" @click="sortChoice = option">{{ option }}</button></div>
              <button v-if="!sortSubmitted" type="button" class="submit-btn" :disabled="!sortChoice" @click="submitSort">Check category</button>
              <template v-else><p class="activity-feedback" :class="{ 'is-correct': sortChoice === currentSortCard.answer }"><strong>{{ sortChoice === currentSortCard.answer ? 'Correct.' : 'Review the workflow.' }}</strong> {{ currentSortCard.explanation }}</p><button v-if="sortIndex < sortCards.length - 1" type="button" class="next-link" @click="nextSortCard">Sort the next item</button><p v-else class="block__takeaway">Every AI workflow needs all three: suitable input, a meaningful output, and evaluation of whether that output is useful.</p></template>
            </section>

            <section v-if="currentModule.id === 'models-world'" class="block game-block">
              <p class="block__eyebrow">Matching game · {{ matchIndex + 1 }} of {{ matchPrompts.length }}</p>
              <h2>Match capability to a documented model family</h2>
              <p>Read the capability description and select the model name that best matches the documented public description.</p>
              <blockquote>{{ currentMatchPrompt.prompt }}</blockquote>
              <div class="choice-row"><button v-for="option in ['GPT-4', 'Gemini', 'Claude']" :key="option" type="button" :class="{ 'is-selected': matchChoice === option }" :disabled="matchSubmitted" @click="matchChoice = option">{{ option }}</button></div>
              <button v-if="!matchSubmitted" type="button" class="submit-btn" :disabled="!matchChoice" @click="submitMatch">Check match</button>
              <template v-else><p class="activity-feedback" :class="{ 'is-correct': matchChoice === currentMatchPrompt.answer }"><strong>{{ matchChoice === currentMatchPrompt.answer ? 'Correct.' : 'Review the description.' }}</strong> {{ currentMatchPrompt.explanation }}</p><button v-if="matchIndex < matchPrompts.length - 1" type="button" class="next-link" @click="nextMatchPrompt">Match the next capability</button><p v-else class="block__takeaway">A name is not a guarantee. The practical question is always whether the capability, inputs, checks, and safeguards fit the task.</p></template>
            </section>

            <section v-if="currentModule.id === 'know-ai'" class="block scenario-block">
              <p class="block__eyebrow">Decision scenario</p>
              <h2>Choose a responsible next action</h2>
              <p>A learning coordinator wants an AI tool to summarise notes from a meeting. The notes include names, personal feedback, and a draft action plan. What should happen first?</p>
              <div class="choice-column"><button v-for="(option, index) in scenarioOptions" :key="option" type="button" :class="{ 'is-selected': scenarioChoice === index }" :disabled="scenarioSubmitted" @click="scenarioChoice = index">{{ option }}</button></div>
              <button v-if="!scenarioSubmitted" type="button" class="submit-btn" :disabled="scenarioChoice === null" @click="submitScenario">Check decision</button>
              <template v-else><p class="activity-feedback" :class="{ 'is-correct': scenarioChoice === 1 }"><strong>{{ scenarioChoice === 1 ? 'A responsible start.' : 'Pause before proceeding.' }}</strong> The task may be useful, but the information and the tool both need review before the coordinator asks for any output.</p>
                <div class="scenario-block__check"><h3>Select all safeguards that still apply</h3><p>The decision is not complete until you identify the conditions that keep the task bounded and accountable.</p><button v-for="(option, index) in safeguardOptions" :key="option" type="button" :class="{ 'is-selected': safeguardsSelected.includes(index) }" :aria-pressed="safeguardsSelected.includes(index)" @click="toggleSafeguard(index)"><i aria-hidden="true">{{ safeguardsSelected.includes(index) ? '✓' : '' }}</i>{{ option }}</button><button v-if="!safeguardsSubmitted" type="button" class="submit-btn" :disabled="!safeguardsSelected.length" @click="submitSafeguards">Check safeguards</button><p v-else class="activity-feedback" :class="{ 'is-correct': isCorrectSafeguardSet() }"><strong>{{ isCorrectSafeguardSet() ? 'Complete.' : 'Review the conditions.' }}</strong> {{ isCorrectSafeguardSet() ? 'Safe inputs, evidence checks, and named accountability work together. Confident wording is never proof.' : 'The correct set includes the first three statements. A confident answer still needs checking.' }}</p></div></template>
            </section>

            <section class="source-line"><strong>Source:</strong> <a :href="currentModule.sourceUrl" target="_blank" rel="noreferrer">{{ currentModule.sourceLabel }}</a> <span>· {{ currentModule.confidence }}</span></section>
            <section class="bridge"><b>Next connection</b><p>{{ currentModule.bridge }}</p></section>
            <button type="button" class="continue-block" @click="completeCurrent">{{ currentModule.number === '07' ? 'Continue to the knowledge check' : 'Continue to the next lesson' }}</button>
          </article>

          <article v-else-if="currentId === 'quiz'" class="reading quiz-screen">
            <p>This knowledge check asks you to retrieve and apply ideas from the seven lessons. Read each question carefully, select one answer, and submit it before moving to the next question.</p>
            <section class="quiz">
              <span>Question</span><b>{{ String(quizIndex + 1).padStart(2, '0') }}/{{ String(quizQuestions.length).padStart(2, '0') }}</b>
              <h2>{{ quizQuestion.prompt }}</h2>
              <p>Choose the correct answer from the options below.</p>
              <label v-for="(option, index) in quizQuestion.options" :key="option" class="quiz__option" :class="{ 'is-selected': quizChoice === index, 'is-locked': quizSubmitted, 'is-right': quizSubmitted && index === quizQuestion.correct, 'is-wrong': quizSubmitted && quizChoice === index && index !== quizQuestion.correct }">
                <input v-model="quizChoice" type="radio" :value="index" :disabled="quizSubmitted" class="sr-only" />
                <span class="quiz__letter">{{ ['A', 'B', 'C', 'D'][index] }}</span>
                <span>{{ option }}</span>
              </label>
              <button v-if="!quizSubmitted" type="button" class="submit-btn" :disabled="quizChoice === null" @click="submitQuiz">Submit</button>
              <aside v-else :class="{ 'is-correct': quizChoice === quizQuestion.correct }"><strong>{{ quizChoice === quizQuestion.correct ? 'Correct.' : 'Review this point.' }}</strong> {{ quizQuestion.explanation }}</aside>
              <button v-if="quizSubmitted" type="button" class="next-link" @click="nextQuizQuestion">{{ quizIndex === quizQuestions.length - 1 ? 'Continue to the bonus round' : 'Next question' }}</button>
            </section>
          </article>

          <!-- Mini-game: memory match built from the site's own glossary -->
          <article v-else-if="currentId === 'match-game'" class="reading">
            <p>A quick, non-technical break before the wrap-up. Flip two cards at a time and pair each term with its plain-English meaning. Nothing here is scored against you — it is just a way to make the glossary stick.</p>
            <section class="block game-block">
              <p class="block__eyebrow">Memory match · {{ memoryMoves }} {{ memoryMoves === 1 ? 'move' : 'moves' }}</p>
              <h2>Match the words</h2>
              <div class="memory-grid" :class="{ 'is-complete': memoryComplete }">
                <button
                  v-for="card in memoryCards" :key="card.uid" type="button" class="memory-card"
                  :class="{ 'is-face-up': memoryFlipped.includes(card.uid) || memoryMatched.includes(card.uid), 'is-matched': memoryMatched.includes(card.uid), 'is-def': card.kind === 'def' }"
                  :disabled="memoryMatched.includes(card.uid)"
                  @click="flipMemoryCard(card.uid)"
                >
                  <span class="memory-card__face memory-card__face--back">?</span>
                  <span class="memory-card__face memory-card__face--front">{{ card.face }}</span>
                </button>
              </div>
              <p v-if="memoryComplete" class="block__takeaway">All eight pairs matched in {{ memoryMoves }} moves. These are the same terms used throughout the course.</p>
              <button v-if="memoryComplete" type="button" class="next-link" @click="shuffleMemoryGame">Shuffle and play again</button>
            </section>
            <button type="button" class="continue-block" @click="completeCurrent">Continue to summary</button>
          </article>

          <article v-else class="reading summary">
            <p>This course began before the modern chat era, with the long history of questions about machine intelligence. The seven lessons then connected that history to learning from examples, next-token prediction, modern AI types, famous models, and practical judgement.</p>
            <h2>What to carry forward</h2>
            <section class="statement">
              <span class="statement__rule" aria-hidden="true" />
              <p>Use AI as a powerful prediction tool, not as an unquestioned authority.</p>
            </section>
            <ul>
              <li>Ask what task the system is designed to support, what information shapes its output, and what it cannot know from the prompt alone.</li>
              <li>Treat a generated response as a candidate answer built from patterns until important claims have been checked.</li>
              <li>Choose a model and workflow that fit the task, protect information, and keep a person accountable for the final decision.</li>
            </ul>
            <h2>Create a responsible-use plan</h2>
            <p>Use the three prompts below to apply the course to one realistic, low-risk task. A strong plan makes the task, the evidence check, and the human review point explicit.</p>
            <form class="action-plan" @submit.prevent="finishCourse">
              <label><b>Choose one bounded task.</b><span>Describe a low-risk task where AI could help you prepare a first draft, organise notes, or identify questions.</span><textarea v-model="plan.task" rows="3" placeholder="For example: Prepare a first outline for a training session using public policy notes." /></label>
              <label><b>State what you will check.</b><span>Name the facts, sources, numbers, policy wording, or other outputs that require review.</span><textarea v-model="plan.check" rows="3" placeholder="For example: Check every policy reference against the current published policy." /></label>
              <label><b>Name the human review point.</b><span>Identify the person or role accountable for approving the final result.</span><textarea v-model="plan.reviewer" rows="3" placeholder="For example: A subject expert reviews the outline before it is shared." /></label>
              <button type="submit" class="submit-btn" :disabled="!planReady">{{ courseCompleted ? 'Course completed' : 'Complete course' }}</button>
            </form>
            <section v-if="courseCompleted" class="complete-note"><b>Course completed</b><p>Your plan links the course concepts to a practical use case. Keep the same sequence: define the task, protect the information, check the output, and retain accountability.</p><button type="button" class="next-link" @click="resetCourse">Restart course</button></section>
          </article>
        </section>
      </Transition>
    </main>

    <footer v-if="current >= 0" class="course__foot">
      <button type="button" class="foot-btn" :disabled="current < 0" @click="previous">← Previous</button>
      <span class="foot-pos">{{ current + 1 }} of {{ AI_MODULES.length + 4 }}</span>
      <button type="button" class="foot-btn foot-btn--primary" :disabled="current >= AI_MODULES.length + 3" @click="next">Next →</button>
    </footer>
  </div>
</template>

<style>
/* ── Rise 360 skin ──────────────────────────────────────────────────────
   Matches the reference course exactly: Nunito Sans throughout, one brand
   blue, a two-row header with a thin progress strip, a gradient cover
   banner with a white pill CTA, a colour-tinted lesson banner with a black
   underline rule, round-bullet objective lists, and lettered A/B/C/D
   knowledge-check options. No sidebar rail — the course-contents list lives
   in a hamburger-triggered drawer, exactly like the reference. */

:root {
  --co-blue: #1B6FC9;
  --co-blue-dark: #0F52A0;
  --co-blue-tint: #EAF2FC;
  --co-ink: #14181F;
  --co-muted: #5B6472;
  --co-line: #E2E6EC;
  --co-paper: #FFFFFF;
  --co-paper-2: #F7F9FC;
  --co-green: #1E8E5A;
  --co-shadow: 0 1px 2px rgba(20, 40, 70, 0.06), 0 4px 16px rgba(20, 40, 70, 0.08);
  --co-radius-s: 8px;
  --co-radius-m: 10px;
  --co-radius-l: 16px;
  --co-radius-full: 999px;
}

.course {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--co-paper);
  color: var(--co-ink);
  font-family: 'Nunito Sans', system-ui, sans-serif;
}
.course * { box-sizing: border-box; }

/* ── Masthead ── */
.course__bar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 10px 24px;
  border-bottom: 1px solid var(--co-line);
}
.course__brand { display: flex; align-items: center; gap: 10px; border: none; background: none; cursor: pointer; padding: 0; }
.course__mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 6px;
  background: var(--co-ink); color: #fff;
  font-weight: 900; font-size: 15px;
}
.course__mark--lg { width: 40px; height: 40px; font-size: 19px; border-radius: 8px; margin-bottom: 18px; }
.course__brand-text { font-size: 15px; font-weight: 800; color: var(--co-ink); }
.course__actions { display: flex; align-items: center; gap: 18px; }
.course__link { font-size: 14.5px; font-weight: 700; color: var(--co-ink); text-decoration: none; }
.course__link:hover { color: var(--co-blue); }

.course__subbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 24px; border-bottom: 1px solid var(--co-line);
}
.course__hamburger {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: var(--co-radius-s);
  border: none; background: var(--co-paper-2); color: var(--co-ink); cursor: pointer;
}
.course__hamburger.is-on, .course__hamburger:hover { background: var(--co-blue); color: #fff; }
.course__progress { display: flex; align-items: center; }
.course__progress-n { font-size: 12.5px; font-weight: 800; color: var(--co-muted); letter-spacing: 0.02em; text-transform: uppercase; }
.course__progress-track { display: block; width: 100%; height: 4px; background: var(--co-blue-tint); }
.course__progress-fill { display: block; height: 100%; background: var(--co-blue); transition: width 0.25s ease; }

/* ── Drawer ── */
.course__scrim { position: fixed; inset: 0; background: rgba(15, 22, 33, 0.35); z-index: 30; }
.course__drawer {
  position: fixed; top: 0; bottom: 0; left: 0; z-index: 31;
  width: min(340px, 88vw); background: var(--co-paper);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.18);
  transform: translateX(-104%);
  transition: transform 0.22s ease;
  display: flex; flex-direction: column;
}
.course__drawer.is-open { transform: none; }
.course__drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--co-line); }
.course__drawer-kicker { margin: 0; font-size: 12.5px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: var(--co-muted); }
.course__drawer-close { width: 30px; height: 30px; border: none; border-radius: 50%; background: var(--co-paper-2); color: var(--co-ink); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.course__drawer-list { list-style: none; margin: 0; padding: 8px 0; overflow-y: auto; }

.drawer-row {
  width: 100%; display: grid; grid-template-columns: 28px minmax(0, 1fr) 12px;
  align-items: center; gap: 12px;
  padding: 11px 20px; border: none; background: none; color: var(--co-ink);
  text-align: left; cursor: pointer; font-family: inherit;
}
.drawer-row:hover, .drawer-row.is-active { background: var(--co-blue-tint); }
.drawer-row.is-active .drawer-row__label { color: var(--co-blue); font-weight: 800; }
.drawer-row__icon {
  width: 26px; height: 26px; border-radius: var(--co-radius-s);
  display: flex; align-items: center; justify-content: center;
  background: var(--co-blue-tint); color: var(--co-blue); flex: none;
}
.drawer-row.is-active .drawer-row__icon { background: var(--co-blue); color: #fff; }
.drawer-row__label { font-size: 14.5px; font-weight: 700; }
.drawer-row__dot { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid var(--co-line); background: transparent; flex: none; justify-self: end; }
.drawer-row__dot.is-done { background: var(--co-blue); border-color: var(--co-blue); }

/* ── Main / cover ── */
.course__main { flex: 1; }
.cover { max-width: 980px; margin: 0 auto; padding: 28px 24px 80px; }
.cover__banner {
  position: relative; margin: 0 0 32px;
  padding: clamp(48px, 8vw, 88px) clamp(20px, 4vw, 40px) clamp(52px, 7vw, 72px);
  background: linear-gradient(135deg, var(--co-blue-dark), var(--co-blue) 65%);
  border-radius: var(--co-radius-l); overflow: hidden;
}
.cover__title {
  margin: 0 0 32px; color: #fff; font-weight: 900;
  font-size: clamp(30px, 5vw, 56px); line-height: 1.06; max-width: 16ch;
}
.cover__start {
  display: inline-block; padding: 15px 32px; border: none; border-radius: var(--co-radius-full);
  background: #fff; color: var(--co-blue); font-size: 14.5px; font-weight: 800;
  letter-spacing: 0.03em; text-transform: uppercase; cursor: pointer; box-shadow: var(--co-shadow);
}
.cover__body { max-width: 700px; }
.cover__duration { font-size: 17px; font-weight: 700; margin: 0 0 22px; }
.cover__body > p { font-size: 17.5px; line-height: 1.65; margin: 0 0 22px; }
.cover__panel {
  margin-top: 20px; padding: 22px 24px; background: var(--co-paper-2);
  border-radius: var(--co-radius-l); box-shadow: var(--co-shadow);
}
.cover__panel-h { font-weight: 900; font-size: 20px; margin: 0 0 4px; }
.cover__outline { list-style: none; margin: 10px 0 0; padding: 0; display: grid; }
.cover__outline li button {
  width: 100%; display: grid; grid-template-columns: 26px minmax(0, 1fr) 12px; align-items: center;
  gap: 12px; padding: 10px 4px; border: none; border-top: 1px solid var(--co-line);
  background: none; color: var(--co-ink); text-align: left; cursor: pointer;
  font-family: inherit; font-size: 15px; font-weight: 700;
}
.cover__outline li:first-child button { border-top: none; }
.cover__outline li button:hover { color: var(--co-blue); }

/* ── Lesson banner ── */
.screen { max-width: 910px; margin: 0 auto; padding: 0 24px 90px; }
.lesson-banner {
  position: relative; margin: 22px 0 26px;
  padding: clamp(20px, 3vw, 30px) clamp(20px, 3vw, 30px) clamp(24px, 3.5vw, 34px);
  background: var(--co-blue-tint); border-radius: var(--co-radius-l);
}
.lesson-banner__crumb { margin: 0 0 10px; text-align: right; font-size: 12.5px; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; color: var(--co-muted); }
.lesson-banner__title { font-weight: 900; letter-spacing: -0.01em; font-size: clamp(24px, 3.4vw, 38px); line-height: 1.1; margin: 0; }
.lesson-banner__rule { display: block; width: 60px; height: 4px; margin-top: 16px; background: var(--co-ink); }

/* ── Reading typography ── */
.reading > p, .text-section > p, .worked-example > p { max-width: 780px; margin: 0 0 24px; font-size: 18px; font-weight: 500; line-height: 1.68; }
.reading h2 { max-width: 780px; margin: 44px 0 14px; font-size: 30px; font-weight: 900; letter-spacing: -0.015em; line-height: 1.2; }
.reading h3 { margin: 0 0 10px; font-size: 22px; font-weight: 900; }
.reading .lead { font-size: 22px; font-weight: 800; line-height: 1.5; }
.reading > ul { display: grid; gap: 18px; max-width: 780px; padding-left: 28px; margin: 0 0 44px; }
.reading > ul li { padding-left: 6px; font-size: 18px; font-weight: 500; line-height: 1.55; }

.panel { max-width: 780px; margin: 30px 0; padding: 22px 24px; background: var(--co-paper-2); border-radius: var(--co-radius-l); box-shadow: var(--co-shadow); }
.panel__h { font-weight: 900; font-size: 18px; margin: 0 0 8px; }
.panel__sub { font-size: 15px; font-weight: 700; margin: 0 0 12px; }
.panel__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.panel__list li { position: relative; padding-left: 22px; font-size: 15.5px; line-height: 1.55; }
.panel__list li::before { content: ''; position: absolute; left: 3px; top: 8px; width: 7px; height: 7px; border-radius: 50%; background: var(--co-blue); }

.info-note { display: grid; grid-template-columns: 30px 1fr; gap: 13px; max-width: 780px; padding: 22px; margin: 32px 0; background: var(--co-paper-2); border-radius: var(--co-radius-l); box-shadow: var(--co-shadow); }
.info-note > i { width: 24px; height: 24px; display: grid; place-items: center; border: 2px solid var(--co-blue); border-radius: 50%; color: var(--co-blue); font-size: 15px; font-style: normal; font-weight: 900; }
.info-note b { font-size: 16px; }
.info-note p { margin: 6px 0 0; font-size: 16px; font-weight: 500; line-height: 1.55; }

.diagram { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; max-width: 780px; margin: 34px 0; padding: 18px 0; border-top: 1px solid var(--co-line); border-bottom: 1px solid var(--co-line); }
.diagram span { padding: 8px 12px; background: var(--co-blue-tint); border-radius: var(--co-radius-full); font-size: 13.5px; font-weight: 700; }
.diagram i { font-style: normal; color: var(--co-blue); font-size: 18px; font-weight: 800; }

.worked-example { max-width: 780px; margin: 40px 0; padding-top: 2px; }
.worked-example h2 { margin-top: 0; }
.media { max-width: 780px; margin: 36px 0; }
.media img { display: block; width: 100%; max-height: 420px; object-fit: cover; border-radius: var(--co-radius-l); }
.media p { margin: 12px 0 0; font-size: 15.5px; font-weight: 500; line-height: 1.55; color: var(--co-muted); }
.video { max-width: 780px; margin: 40px 0; }
.video h2 { margin: 0 0 12px; }
.video > p { margin: 0 0 16px; font-size: 16.5px; line-height: 1.55; }
.video__frame { position: relative; aspect-ratio: 16 / 9; border-radius: var(--co-radius-l); overflow: hidden; box-shadow: var(--co-shadow); }
.video__frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

/* ── Activity blocks ── */
.block { max-width: 780px; margin: 44px 0; padding: 26px; background: var(--co-paper); border-radius: var(--co-radius-l); box-shadow: var(--co-shadow); }
.block__eyebrow { margin: 0 0 10px !important; color: var(--co-blue); font-size: 12px !important; font-weight: 800 !important; letter-spacing: 0.05em; text-transform: uppercase; }
.block h2 { margin: 0 0 14px !important; font-size: 26px !important; }
.block > p { font-size: 17px; font-weight: 500; line-height: 1.6; }
.block__takeaway { margin: 20px 0 0 !important; padding: 14px 16px !important; border-radius: var(--co-radius-m); border-left: 4px solid var(--co-blue); background: var(--co-blue-tint); font-size: 15.5px !important; font-weight: 700 !important; line-height: 1.55; }

/* ── Rise "Divider" block ── */
.rise-divider { max-width: 780px; margin: 40px 0; border: none; border-top: 1px solid var(--co-line); }

/* ── Rise "Table" block ── */
.rise-table { max-width: 780px; margin: 20px 0 32px; border-radius: var(--co-radius-l); overflow: hidden; box-shadow: var(--co-shadow); }
.rise-table__row { display: grid; grid-template-columns: 1.1fr 0.6fr 1.6fr; gap: 14px; padding: 13px 18px; background: var(--co-paper); border-bottom: 1px solid var(--co-line); font-size: 14.5px; line-height: 1.5; }
.rise-table__row:last-child { border-bottom: none; }
.rise-table__row--head { background: var(--co-blue); color: #fff; font-weight: 800; font-size: 12.5px; letter-spacing: 0.03em; text-transform: uppercase; }
.rise-table__row b { color: var(--co-blue); }
.rise-table__row--head b { color: #fff; }

/* ── Rise "Button" / "Continue" block ── */
.continue-block {
  display: block; width: 100%; max-width: 780px; margin: 38px 0 0;
  padding: 17px 24px; border: none; border-radius: var(--co-radius-m);
  background: var(--co-blue); color: #fff; cursor: pointer;
  font: 800 15px inherit; letter-spacing: 0.03em; text-transform: uppercase; text-align: center;
  transition: background 0.15s;
}
.continue-block:hover { background: var(--co-blue-dark); }

/* ── Rise "Statement" block ── */
.statement { max-width: 780px; margin: 8px 0 34px; }
.statement__rule { display: block; width: 34px; height: 4px; margin-bottom: 16px; background: var(--co-blue); border-radius: 2px; }
.statement p { margin: 0; font-size: 26px; font-weight: 800; line-height: 1.45; letter-spacing: -0.01em; }

/* ── Rise "Labeled Graphic" block ── */
.labeled-graphic { max-width: 780px; margin: 44px 0; padding: 26px; background: var(--co-paper); border-radius: var(--co-radius-l); box-shadow: var(--co-shadow); }
.labeled-graphic h2 { margin: 0 0 8px !important; font-size: 26px !important; }
.labeled-graphic > p { font-size: 16px; color: var(--co-muted); margin: 0 0 6px; }
.labeled-graphic__stage {
  position: relative; margin: 22px 0 18px; aspect-ratio: 16 / 9;
  border-radius: var(--co-radius-l);
  background: radial-gradient(circle at 50% 50%, var(--co-blue-tint), var(--co-paper-2));
  border: 1px solid var(--co-line);
}
.labeled-graphic__hub {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 96px; height: 96px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; text-align: center;
  background: var(--co-blue); color: #fff; font-weight: 800; font-size: 13px; line-height: 1.2;
  box-shadow: var(--co-shadow);
}
.labeled-graphic__pin {
  position: absolute; transform: translate(-50%, -50%);
  width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--co-blue);
  background: #fff; color: var(--co-blue); font-weight: 800; font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; box-shadow: var(--co-shadow);
  transition: background 0.15s, color 0.15s, transform 0.15s;
}
.labeled-graphic__pin:hover { transform: translate(-50%, -50%) scale(1.08); }
.labeled-graphic__pin.is-active { background: var(--co-blue); color: #fff; }
.labeled-graphic__caption { padding: 16px 18px; border-radius: var(--co-radius-m); background: var(--co-blue-tint); }
.labeled-graphic__caption b { display: block; margin-bottom: 4px; font-size: 15px; }
.labeled-graphic__caption p { margin: 0; font-size: 15px; line-height: 1.55; }
.labeled-graphic__hint { color: var(--co-muted); font-size: 14px; margin: 0; }

/* ── Rise "Process" block (step carousel) ── */
.process { max-width: 780px; margin: 40px 0; }
.process h2 { margin: 0 0 16px !important; font-size: 24px !important; }
.process__card { padding: 26px; background: var(--co-paper); border-radius: var(--co-radius-l); box-shadow: var(--co-shadow); }
.process__step {
  display: inline-block; margin-bottom: 14px; padding: 5px 14px; border-radius: var(--co-radius-full);
  background: var(--co-blue); color: #fff; font-size: 11.5px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase;
}
.process__card blockquote { margin: 0 0 14px; padding: 16px 18px; border-left: 4px solid var(--co-blue); border-radius: 0 var(--co-radius-m) var(--co-radius-m) 0; background: var(--co-blue-tint); font-size: 17px; font-weight: 700; line-height: 1.5; }
.process__card blockquote b { color: var(--co-blue); }
.process__card > p { margin: 0; font-size: 15.5px; line-height: 1.55; color: var(--co-muted); }
.process__nav { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 20px; }
.process__nav button { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid var(--co-line); background: #fff; color: var(--co-ink); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.process__nav button:disabled { opacity: 0.35; cursor: not-allowed; }
.process__dots { display: flex; gap: 7px; }
.process__dots i { display: block; width: 7px; height: 7px; border-radius: 50%; background: var(--co-line); font-style: normal; }
.process__dots i.is-on { background: var(--co-blue); }

.timeline-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 22px 0 0; }
.timeline-nav button { min-height: 78px; padding: 12px; border: 1.5px solid var(--co-line); border-radius: var(--co-radius-m); background: var(--co-paper); color: var(--co-muted); text-align: left; cursor: pointer; font: 700 13px/1.35 inherit; }
.timeline-nav button.is-active { background: var(--co-blue-tint); color: var(--co-ink); border-color: var(--co-blue); }
.timeline-nav b { display: block; margin-bottom: 4px; color: var(--co-blue); font-size: 14px; }
.timeline-event { min-height: 150px; padding: 22px 0 4px; }
.timeline-event > b { color: var(--co-blue); font-size: 13px; font-weight: 800; }
.timeline-event h3 { margin: 6px 0 10px; }
.timeline-event p { max-width: 680px; margin: 0; font-size: 17px; font-weight: 500; line-height: 1.6; }

/* Order game */
.order-game { margin-top: 22px; }
.order-game__slots { list-style: none; margin: 0 0 18px; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.order-game__slot {
  min-height: 64px; border-radius: var(--co-radius-m); border: 1.5px dashed var(--co-line);
  display: flex; align-items: center; justify-content: center; position: relative; padding: 6px;
}
.order-game__slot.is-filled { border-style: solid; background: var(--co-blue-tint); }
.order-game__slot-n { position: absolute; top: 4px; left: 6px; font-size: 10.5px; font-weight: 800; color: var(--co-muted); }
.order-game__slot button { border: none; background: none; font: 800 14px inherit; color: var(--co-blue); cursor: pointer; padding: 4px; }
.order-game__pool { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.order-game__chip { padding: 10px 18px; border-radius: var(--co-radius-full); border: 1.5px solid var(--co-blue); background: #fff; color: var(--co-blue); cursor: pointer; font: 800 14px inherit; }
.order-game__chip:hover { background: var(--co-blue-tint); }

/* Memory game */
.memory-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 22px 0; perspective: 800px; }
.memory-card { position: relative; aspect-ratio: 1; border: none; border-radius: var(--co-radius-m); background: none; cursor: pointer; padding: 0; }
.memory-card__face {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  border-radius: var(--co-radius-m); backface-visibility: hidden;
  transition: transform 0.35s ease; padding: 6px; text-align: center;
}
.memory-card__face--back { background: var(--co-blue); color: #fff; font-size: 22px; font-weight: 900; }
.memory-card__face--front { background: var(--co-blue-tint); color: var(--co-ink); font-size: 11.5px; font-weight: 700; line-height: 1.3; transform: rotateY(180deg); }
.memory-card:not(.is-face-up) .memory-card__face--back { transform: rotateY(0); }
.memory-card:not(.is-face-up) .memory-card__face--front { transform: rotateY(180deg); }
.memory-card.is-face-up .memory-card__face--back { transform: rotateY(-180deg); }
.memory-card.is-face-up .memory-card__face--front { transform: rotateY(0); }
.memory-card.is-def .memory-card__face--front { background: #FFF6DA; }
.memory-card.is-matched .memory-card__face--front { background: #DCF3E6; }
.memory-card.is-matched { cursor: default; }
@media (max-width: 560px) { .memory-grid { grid-template-columns: repeat(3, 1fr); } .order-game__slots { grid-template-columns: repeat(2, 1fr); } }

.flashcards__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 22px; }
.flashcards__grid button { min-height: 170px; padding: 18px; border: 1.5px solid var(--co-line); border-radius: var(--co-radius-m); background: #fff; color: var(--co-ink); text-align: left; cursor: pointer; font-family: inherit; transition: background 0.16s, border-color 0.16s; }
.flashcards__grid button:hover, .flashcards__grid button.is-open { border-color: var(--co-blue); background: var(--co-blue-tint); }
.flashcards__grid button span { display: grid; gap: 12px; }
.flashcards__grid button b { font-size: 18px; line-height: 1.4; }
.flashcards__grid button small { color: var(--co-muted); font-size: 12.5px; font-weight: 700; }

.tabs-block__tabs { display: flex; flex-wrap: wrap; gap: 0; margin-top: 22px; border-bottom: 1px solid var(--co-line); }
.tabs-block__tabs button { padding: 12px 16px; border: none; border-bottom: 3px solid transparent; background: none; color: var(--co-muted); cursor: pointer; font: 800 14px inherit; }
.tabs-block__tabs button.is-active { border-bottom-color: var(--co-blue); color: var(--co-ink); }
.tabs-block__panel { min-height: 200px; padding: 22px 0 4px; }
.tabs-block__panel h3 { margin-bottom: 8px; }
.tabs-block__panel p { max-width: 690px; font-size: 17px; font-weight: 500; line-height: 1.6; }

/* Prediction lab */
.prediction-lab { max-width: 780px; margin: 44px 0; padding: 28px; background: var(--co-paper); border-radius: var(--co-radius-l); box-shadow: var(--co-shadow); }
.prediction-lab__eyebrow { margin: 0 0 10px; color: var(--co-blue); font-size: 12px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
.prediction-lab h2 { margin: 0 0 14px; }
.prediction-lab > p { font-size: 17px; font-weight: 500; line-height: 1.6; }
.prediction-lab blockquote { margin: 22px 0; padding: 18px 20px; border-left: 4px solid var(--co-blue); border-radius: 0 var(--co-radius-m) var(--co-radius-m) 0; background: var(--co-blue-tint); font-size: 19px; font-weight: 700; line-height: 1.55; }
.prediction-lab blockquote b { color: var(--co-blue); }
.prediction-lab__output { margin: 16px 0 0; padding: 14px 16px; border-left: 3px solid var(--co-blue); border-radius: 0 var(--co-radius-m) var(--co-radius-m) 0; background: var(--co-paper-2); }
.prediction-lab__output span { display: block; margin-bottom: 4px; color: var(--co-blue); font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
.prediction-lab__output p { margin: 0; font-size: 16px !important; line-height: 1.55; }
.prediction-lab__output b { color: var(--co-blue); }
.prediction-lab__conclusion { margin-top: 22px !important; padding-top: 16px; border-top: 1px solid var(--co-line); font-weight: 700 !important; }

.choice-row { display: flex; flex-wrap: wrap; gap: 9px; margin: 20px 0; }
.choice-column { display: grid; gap: 8px; margin: 20px 0; }
.choice-row button, .choice-column button { border: 1.5px solid var(--co-line); border-radius: var(--co-radius-m); background: #fff; color: var(--co-ink); cursor: pointer; font: 700 15px inherit; }
.choice-row button { padding: 12px 16px; }
.choice-column button { padding: 14px 15px; text-align: left; }
.choice-row button.is-selected, .choice-column button.is-selected { border-color: var(--co-blue); background: var(--co-blue-tint); }
.activity-feedback { padding: 16px 0 0; border-top: 1px solid var(--co-line); font-size: 16px !important; margin-top: 16px; }
.activity-feedback.is-correct strong { color: var(--co-green); }

.source-line { max-width: 780px; padding-top: 18px; border-top: 1px solid var(--co-line); font-size: 14.5px; }
.source-line a, .source-line span { color: var(--co-blue); font-weight: 700; }
.bridge { max-width: 780px; margin: 32px 0; padding-left: 16px; border-left: 4px solid var(--co-blue); }
.bridge b { font-size: 14.5px; }
.bridge p { margin: 6px 0 0; font-size: 16.5px; font-weight: 500; line-height: 1.55; }
.next-link { margin-top: 36px; padding: 0; border: none; background: none; color: var(--co-blue); cursor: pointer; font: 800 16px inherit; text-decoration: underline; text-underline-offset: 3px; }

/* ── Quiz ── */
.quiz { max-width: 780px; padding: 30px; margin: 40px 0; border-radius: var(--co-radius-l); background: var(--co-paper); box-shadow: var(--co-shadow); }
.quiz > span { display: block; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: var(--co-muted); }
.quiz > b { display: block; margin: 2px 0 20px; color: var(--co-blue); font-size: 22px; }
.quiz h2 { margin: 0 0 16px; font-size: 23px; }
.quiz > p { margin: 0 0 16px; font-size: 16px; font-weight: 500; }
.quiz__option {
  display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
  padding: 13px 15px; border-radius: var(--co-radius-m);
  border: 1.5px solid var(--co-line); background: #fff; color: var(--co-ink);
  font-size: 15.5px; font-weight: 600; cursor: pointer; margin-bottom: 8px;
  transition: background 0.14s, border-color 0.14s;
}
.quiz__option:hover:not(.is-locked) { border-color: var(--co-blue); background: var(--co-blue-tint); }
.quiz__option.is-selected { border-color: var(--co-blue); background: var(--co-blue-tint); }
.quiz__option.is-right { border-color: var(--co-green); background: #DCF3E6; }
.quiz__option.is-wrong { border-color: #C64A3A; background: #FBE3DF; }
.quiz__letter {
  flex: none; width: 28px; height: 28px; border-radius: 50%;
  border: 1.5px solid var(--co-line); background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12.5px; font-weight: 800; color: var(--co-muted);
}
.quiz__option.is-selected .quiz__letter { background: var(--co-blue); color: #fff; border-color: var(--co-blue); }
.quiz__option.is-right .quiz__letter { background: var(--co-green); color: #fff; border-color: var(--co-green); }
.quiz__option.is-wrong .quiz__letter { background: #C64A3A; color: #fff; border-color: #C64A3A; }
.quiz aside { padding: 14px 0 0; font-size: 15.5px; font-weight: 600; line-height: 1.5; }
.quiz aside.is-correct { color: var(--co-green); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

.submit-btn {
  display: block; min-width: 150px; height: 44px; margin: 22px auto 0;
  border: none; border-radius: var(--co-radius-full);
  background: var(--co-blue); color: #fff; cursor: pointer;
  font: 800 12.5px inherit; letter-spacing: 0.05em; text-transform: uppercase;
}
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Summary / action plan ── */
.action-plan { display: grid; max-width: 780px; gap: 24px; margin-top: 32px; }
.action-plan label { display: grid; gap: 7px; }
.action-plan label b { font-size: 18px; }
.action-plan label span { color: var(--co-muted); font-size: 15px; font-weight: 500; }
.action-plan textarea { width: 100%; padding: 13px; border: 1.5px solid var(--co-line); border-radius: var(--co-radius-m); font: 500 15.5px/1.45 inherit; outline: none; }
.action-plan textarea:focus { border-color: var(--co-blue); }
.action-plan .submit-btn { margin: 0; }
.complete-note { max-width: 780px; padding: 22px; margin-top: 30px; background: var(--co-blue-tint); border-radius: var(--co-radius-l); }
.complete-note b { font-size: 18px; }
.complete-note p { font-size: 16px; font-weight: 500; line-height: 1.5; }

/* ── Footer ── */
.course__foot { position: sticky; bottom: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 56px; border-top: 1px solid var(--co-line); background: var(--co-paper); }
.foot-btn { border: none; background: none; color: var(--co-blue); cursor: pointer; font: 800 14px inherit; }
.foot-btn:disabled { color: #C4CAD3; cursor: not-allowed; }
.foot-btn--primary { color: var(--co-blue); }
.foot-pos { color: var(--co-muted); font-size: 13px; font-weight: 700; }

.course-fade-enter-active, .course-fade-leave-active { transition: opacity 0.18s ease; }
.course-fade-enter-from, .course-fade-leave-to { opacity: 0; }
.has-scroll-reveal .rise-reveal.is-pending { opacity: 0; transform: translateY(10px); transition: opacity 0.28s cubic-bezier(.23,1,.32,1), transform 0.28s cubic-bezier(.23,1,.32,1); }
.has-scroll-reveal .rise-reveal.is-pending.is-visible { opacity: 1; transform: none; }

@media (max-width: 760px) {
  .course__bar, .course__subbar { padding-left: 16px; padding-right: 16px; }
  .cover, .screen { padding-left: 16px; padding-right: 16px; }
  .lesson-banner__title { font-size: 26px; }
  .reading h2 { font-size: 25px; }
  .flashcards__grid { grid-template-columns: 1fr; }
  .timeline-nav { grid-template-columns: repeat(2, 1fr); }
  .memory-grid { grid-template-columns: repeat(3, 1fr); }
  .order-game__slots { grid-template-columns: repeat(2, 1fr); }
  .choice-row { flex-direction: column; }
  .course__foot { padding: 0 16px; }
  .rise-table__row { grid-template-columns: 1fr; gap: 4px; }
  .rise-table__row--head { display: none; }
  .rise-table__row:not(.rise-table__row--head) { padding: 14px 16px; }
  .labeled-graphic { padding: 18px; }
  .labeled-graphic__hub { width: 76px; height: 76px; font-size: 11px; }
  .labeled-graphic__pin { width: 30px; height: 30px; font-size: 13px; }
  .statement p { font-size: 21px; }
}

@media (prefers-reduced-motion: reduce) {
  .course-fade-enter-active, .course-fade-leave-active,
  .memory-card__face, .course__drawer, .course__progress-fill,
  .has-scroll-reveal .rise-reveal.is-pending { transition: none; opacity: 1; transform: none; }
}
</style>
