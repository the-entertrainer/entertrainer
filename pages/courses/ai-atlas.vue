<script setup lang="ts">
/**
 * Design reminder — Rise-style, content-led AI course.
 * The course is a reading canvas first. Use prose, diagrams, media, and
 * interactions only when each serves a stated learning purpose.
 */
import { AI_MODULES, type AiModule } from '~/content/aiCourse'

type ScreenId = 'objectives' | 'quiz' | 'summary' | string
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
  return 'summary'
})
const progress = computed(() => Math.round((visited.value.length / (AI_MODULES.length + 3)) * 100))
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
function go(index: number) {
  current.value = index
  if (index >= 0) markVisited(currentId.value)
  menuOpen.value = false
  openDetails.value = null
  persist()
}
function startCourse() { go(0) }
function next() { if (current.value < AI_MODULES.length + 2) go(current.value + 1) }
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
  persist()
}
function isComplete(id: string) { return visited.value.includes(id) }
function headerLabel() {
  if (current.value === 0) return 'Course introduction'
  if (currentModule.value) return `Lesson ${currentModule.value.number} of ${AI_MODULES.length}`
  if (currentId.value === 'quiz') return 'Knowledge check'
  return 'Course summary'
}
function headerTitle() {
  if (current.value === 0) return 'Objectives'
  if (currentModule.value) return currentModule.value.title
  if (currentId.value === 'quiz') return 'Knowledge check'
  return 'Wrap-up'
}
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const state = JSON.parse(saved)
    current.value = typeof state.current === 'number' ? Math.min(state.current, AI_MODULES.length + 2) : -1
    visited.value = Array.isArray(state.visited) ? state.visited : []
    quizAnswers.value = Array.isArray(state.quizAnswers) ? state.quizAnswers : []
    courseCompleted.value = Boolean(state.completed)
  } catch { localStorage.removeItem(STORAGE_KEY) }
})
</script>

<template>
  <div class="rise-canvas">
    <aside class="rise-sidebar" :class="{ open: menuOpen }" aria-label="Course outline">
      <button type="button" class="rise-sidebar__hero" @click="go(-1)">
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg" alt="Illustrated journey through the history of artificial intelligence" />
        <span>From No AI<br />to Know AI</span>
      </button>
      <button type="button" class="rise-sidebar__home" @click="go(-1)">Entertrainer AI course</button>
      <div class="rise-sidebar__progress"><span>{{ progress }}% complete</span><i><b :style="{ width: `${progress}%` }"></b></i></div>
      <ol class="rise-sidebar__list">
        <li><button type="button" :class="{ active: current === 0 }" @click="go(0)"><i class="rise-glyph"></i><span>Objectives</span><b :class="{ complete: isComplete('objectives') }">{{ isComplete('objectives') ? '✓' : '' }}</b></button></li>
        <li v-for="(item, index) in AI_MODULES" :key="item.id"><button type="button" :class="{ active: current === index + 1 }" @click="go(index + 1)"><i class="rise-glyph"></i><span>{{ item.short }}</span><b :class="{ complete: isComplete(item.id) }">{{ isComplete(item.id) ? '✓' : '' }}</b></button></li>
        <li><button type="button" :class="{ active: currentId === 'quiz' }" @click="go(AI_MODULES.length + 1)"><i class="rise-glyph quiz"></i><span>Knowledge check</span><b :class="{ complete: isComplete('quiz') }">{{ isComplete('quiz') ? '✓' : '' }}</b></button></li>
        <li><button type="button" :class="{ active: currentId === 'summary' }" @click="go(AI_MODULES.length + 2)"><i class="rise-glyph"></i><span>Summary</span><b :class="{ complete: isComplete('summary') }">{{ isComplete('summary') ? '✓' : '' }}</b></button></li>
      </ol>
      <button type="button" class="rise-sidebar__close" @click="menuOpen = false">Close course menu</button>
    </aside>

    <main class="rise-main">
      <Transition name="rise-fade" mode="out-in">
        <section v-if="current === -1" key="overview" class="rise-screen rise-overview">
          <div class="rise-overview__hero">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg" alt="An illustrated map showing the development of artificial intelligence" />
            <div class="rise-overview__shade"></div>
            <h1>From No AI<br />to Know AI</h1>
            <button type="button" @click="startCourse">Start course</button>
          </div>
          <div class="rise-overview__body">
            <h2 class="rise-wordmark">Entertrainer</h2>
            <p class="rise-duration"><strong>Duration:</strong> Approximately 95 minutes</p>
            <p>Artificial intelligence did not begin with ChatGPT. This course traces the long path from early questions about machine intelligence to the prediction systems, language models, and multimodal tools used today.</p>
            <p>Read each lesson in sequence. The course begins with history, then explains learning and prediction, maps the modern AI landscape, and ends with a practical way to use capability with judgement.</p>
            <ol class="rise-overview__outline">
              <li><button type="button" @click="go(0)"><i></i><span>Objectives</span><b :class="{ complete: isComplete('objectives') }">{{ isComplete('objectives') ? '✓' : '' }}</b></button></li>
              <li v-for="(item, index) in AI_MODULES" :key="item.id"><button type="button" @click="go(index + 1)"><i></i><span>{{ item.short }}</span><b :class="{ complete: isComplete(item.id) }">{{ isComplete(item.id) ? '✓' : '' }}</b></button></li>
              <li><button type="button" @click="go(AI_MODULES.length + 1)"><i class="quiz"></i><span>Knowledge check</span><b :class="{ complete: isComplete('quiz') }">{{ isComplete('quiz') ? '✓' : '' }}</b></button></li>
              <li><button type="button" @click="go(AI_MODULES.length + 2)"><i></i><span>Summary</span><b :class="{ complete: isComplete('summary') }">{{ isComplete('summary') ? '✓' : '' }}</b></button></li>
            </ol>
          </div>
        </section>

        <section v-else :key="currentId" class="rise-screen">
          <header class="rise-header">
            <div><button type="button" aria-label="Open course menu" @click="menuOpen = true"><i class="rise-menu-icon"></i></button><b>{{ headerLabel() }}</b></div>
            <h1>{{ headerTitle() }}</h1>
            <i></i>
          </header>

          <article v-if="current === 0" class="rise-reading">
            <p>Before you begin, use these objectives to organise the story of the course. Each lesson develops one idea needed for the next: history, task, learning, prediction, modern capability, and judgement.</p>
            <h2>By the End of this module, you will be able to:</h2>
            <p class="rise-lead">Explain where modern AI came from, how it learns and predicts, what different AI systems can do, and how to use those capabilities with judgement.</p>
            <ul>
              <li>Correct the misconception that AI began with modern chat tools by describing its long research history.</li>
              <li>Explain how examples, context, and next-token prediction produce useful AI outputs.</li>
              <li>Recognise major AI types and match their capabilities, limits, and safeguards to a real task.</li>
            </ul>
            <h2>How the course is organised</h2>
            <p>The first three lessons answer where AI came from, what it is, and how a model learns a pattern. The central lesson then makes next-token prediction visible. The final lessons map modern AI types, explain what famous models can and cannot demonstrate, and turn the story into a practical use routine.</p>
            <section class="rise-info"><i aria-hidden="true">i</i><div><b>Reading first</b><p>Complete the explanations and worked examples before opening the small activities. Each activity is designed to make one idea visible, not to replace the lesson.</p></div></section>
            <button type="button" class="rise-next-link" @click="completeCurrent">Continue to Lesson 1</button>
          </article>

          <article v-else-if="currentModule" class="rise-reading">
            <p v-for="paragraph in currentModule.introduction" :key="paragraph">{{ paragraph }}</p>
            <section class="rise-info"><i aria-hidden="true">i</i><div><b>Learning objective</b><p>{{ currentModule.objective }}</p></div></section>

            <section v-for="section in currentModule.sections" :key="section.heading" class="rise-text-section">
              <h2>{{ section.heading }}</h2>
              <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
            </section>

            <section class="rise-diagram" :class="`rise-diagram--${currentModule.diagram}`">
              <template v-if="currentModule.diagram === 'timeline'"><span>Questions</span><i>→</i><span>Rules</span><i>→</i><span>Learning</span><i>→</i><span>Transformers</span><i>→</i><span>Modern AI</span></template>
              <template v-else-if="currentModule.diagram === 'task'"><span>Task</span><i>→</i><span>Information</span><i>→</i><span>Output</span><i>→</i><span>Check</span></template>
              <template v-else-if="currentModule.diagram === 'learning'"><span>Labelled examples</span><i>→</i><span>Training</span><i>→</i><span>New request</span><i>→</i><span>Output</span></template>
              <template v-else-if="currentModule.diagram === 'prediction'"><span>Prompt and context</span><i>→</i><span>Relevant patterns</span><i>→</i><span>Likely next token</span></template>
              <template v-else-if="currentModule.diagram === 'landscape'"><span>Prediction</span><i>·</i><span>Vision</span><i>·</i><span>Language</span><i>·</i><span>Multimodal</span><i>·</i><span>Tools</span></template>
              <template v-else-if="currentModule.diagram === 'capabilities'"><span>Input</span><i>→</i><span>Model</span><i>→</i><span>Candidate output</span><i>→</i><span>Evaluation</span></template>
              <template v-else><span>Bounded task</span><i>→</i><span>Protect information</span><i>→</i><span>Check output</span><i>→</i><span>Accountable person</span></template>
            </section>

            <section class="rise-worked-example">
              <h2>{{ currentModule.exampleTitle }}</h2>
              <p v-for="paragraph in currentModule.example" :key="paragraph">{{ paragraph }}</p>
            </section>

            <section v-if="currentModule.visual === 'history'" class="rise-media"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/UrwXNXgLQEdronNQ.jpg" alt="Editorial visual timeline from early artificial intelligence research to modern AI systems" /><p>Use this timeline as a reading aid. It does not list every breakthrough; it shows how modern AI rests on a long sequence of questions, methods, data, computing, and model design.</p></section>
            <section v-if="currentModule.visual === 'models'" class="rise-media"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/htTSgHWeiwDLlMXR.jpg" alt="Editorial visual showing different types of modern AI systems and their inputs" /><p>This visual groups modern AI by the kind of information it works with and the kind of output it can create. It reinforces the distinction explained in the lesson text.</p></section>

            <section v-if="currentModule.video" class="rise-video"><h2>{{ currentModule.video.title }}</h2><p><strong>Viewing question:</strong> {{ currentModule.video.question }}</p><div class="rise-video__frame"><iframe :src="currentModule.video.url" :title="currentModule.video.title" loading="lazy" allowfullscreen></iframe></div></section>

            <section v-if="currentModule.id === 'before-chatbots'" class="rise-block rise-timeline-block">
              <p class="rise-block__eyebrow">Interactive timeline · {{ timelineStep + 1 }} of {{ historyEvents.length }}</p>
              <h2>Trace the long route to modern AI</h2>
              <p>Move through four milestones. Notice that a modern chatbot appears only after earlier questions about intelligence, named AI research, learning from examples, and transformer architecture.</p>
              <div class="rise-timeline-block__nav" role="tablist" aria-label="AI history milestones"><button v-for="(event, index) in historyEvents" :key="event.year" type="button" :class="{ active: timelineStep === index }" :aria-selected="timelineStep === index" role="tab" @click="timelineStep = index"><b>{{ event.year }}</b><span>{{ event.title }}</span></button></div>
              <div class="rise-timeline-block__event"><b>{{ historyEvents[timelineStep].year }}</b><h3>{{ historyEvents[timelineStep].title }}</h3><p>{{ historyEvents[timelineStep].text }}</p></div>
              <p class="rise-block__takeaway">The point is not to memorise every date. It is to see that ChatGPT is a recent public chapter in a much older field.</p>
            </section>

            <section v-if="currentModule.id === 'what-ai-is'" class="rise-block rise-flashcards">
              <p class="rise-block__eyebrow">Recall pause</p>
              <h2>Use the practical definition</h2>
              <p>Before continuing, turn over each card and connect it to the travel-time example you have just read.</p>
              <div class="rise-flashcards__grid"><button v-for="(card, index) in definitionFlashcards" :key="card.front" type="button" :class="{ open: openFlashcards.includes(index) }" :aria-pressed="openFlashcards.includes(index)" @click="toggleFlashcard(index)"><span v-if="!openFlashcards.includes(index)"><b>{{ card.front }}</b><small>Select to reveal</small></span><span v-else><small>{{ card.front }}</small><b>{{ card.back }}</b></span></button></div>
              <p class="rise-block__takeaway">When you meet an AI claim, return to these three prompts: task, information, and check.</p>
            </section>

            <section v-if="currentModule.id === 'learning-patterns'" class="rise-block rise-tabs-block">
              <p class="rise-block__eyebrow">Compare the methods</p>
              <h2>One task, three ways of producing an output</h2>
              <p>Read the three panels in order. Each method can be useful; the difference is how the output is produced and where its limits come from.</p>
              <div class="rise-tabs-block__tabs" role="tablist" aria-label="Ways a system produces an output"><button v-for="(tab, index) in learningTabs" :key="tab.label" type="button" :class="{ active: learningTab === index }" :aria-selected="learningTab === index" role="tab" @click="learningTab = index">{{ tab.label }}</button></div>
              <div class="rise-tabs-block__panel"><h3>{{ learningTabs[learningTab].title }}</h3><p>{{ learningTabs[learningTab].text }}</p><p><strong>{{ learningTabs[learningTab].example }}</strong></p></div>
              <p class="rise-block__takeaway">Rules follow an authored method. Learned models estimate from examples. Language models estimate how a text sequence may continue.</p>
            </section>

            <section v-if="currentModule.activity === 'predictionLab'" class="rise-prediction-lab">
              <p class="rise-prediction-lab__eyebrow">Prediction lab · {{ predictionStep + 1 }} of {{ predictionSteps.length }}</p>
              <h2>Watch a response take shape</h2>
              <p>You have read how context changes a next-token estimate. Now build one short service update across three predictions. Choose the continuation that best fits the text, then observe how that predicted token becomes part of the next context.</p>
              <blockquote>{{ predictionSteps[predictionStep].context }} <b>…</b></blockquote>
              <div class="rise-choice-column">
                <button v-for="(option, index) in predictionSteps[predictionStep].options" :key="option" type="button" :class="{ selected: predictionChoice === index }" :disabled="predictionSubmitted" @click="predictionChoice = index">{{ option }}</button>
              </div>
              <button v-if="!predictionSubmitted" type="button" class="rise-submit" :disabled="predictionChoice === null" @click="submitPrediction">Submit prediction</button>
              <template v-else>
                <p class="rise-activity__feedback" :class="{ correct: predictionChoice === predictionSteps[predictionStep].correct }"><strong>{{ predictionChoice === predictionSteps[predictionStep].correct ? 'A useful estimate.' : 'Compare the context again.' }}</strong> {{ predictionSteps[predictionStep].explanation }}</p>
                <div class="rise-prediction-lab__output"><span>Growing generated text</span><p>{{ predictionSteps[predictionStep].context }} <b>{{ predictionSteps[predictionStep].options[predictionSteps[predictionStep].correct] }}</b></p></div>
              </template>
              <button v-if="predictionSubmitted && predictionStep < predictionSteps.length - 1" type="button" class="rise-next-link" @click="nextPredictionStep">Continue the prediction</button>
              <p v-if="predictionSubmitted && predictionStep === predictionSteps.length - 1" class="rise-prediction-lab__conclusion">You have now seen the core mechanism: a language-model response is built through many small, context-sensitive estimates. That is powerful, but it does not make the result automatically true.</p>
            </section>

            <section v-if="currentModule.id === 'modern-landscape'" class="rise-block rise-game-block">
              <p class="rise-block__eyebrow">Sorting game · {{ sortIndex + 1 }} of {{ sortCards.length }}</p>
              <h2>Sort the AI workflow</h2>
              <p>You have seen that an AI system takes information, produces an output, and needs evaluation. Classify the item below using that same sequence.</p>
              <blockquote>{{ currentSortCard.prompt }}</blockquote>
              <div class="rise-choice-row"><button v-for="option in ['Input', 'Output', 'Evaluation']" :key="option" type="button" :class="{ selected: sortChoice === option }" :disabled="sortSubmitted" @click="sortChoice = option">{{ option }}</button></div>
              <button v-if="!sortSubmitted" type="button" class="rise-submit" :disabled="!sortChoice" @click="submitSort">Check category</button>
              <template v-else><p class="rise-activity__feedback" :class="{ correct: sortChoice === currentSortCard.answer }"><strong>{{ sortChoice === currentSortCard.answer ? 'Correct.' : 'Review the workflow.' }}</strong> {{ currentSortCard.explanation }}</p><button v-if="sortIndex < sortCards.length - 1" type="button" class="rise-next-link" @click="nextSortCard">Sort the next item</button><p v-else class="rise-block__takeaway">Every AI workflow needs all three: suitable input, a meaningful output, and evaluation of whether that output is useful.</p></template>
            </section>

            <section v-if="currentModule.id === 'models-world'" class="rise-block rise-game-block">
              <p class="rise-block__eyebrow">Matching game · {{ matchIndex + 1 }} of {{ matchPrompts.length }}</p>
              <h2>Match capability to a documented model family</h2>
              <p>Read the capability description and select the model name that best matches the documented public description.</p>
              <blockquote>{{ currentMatchPrompt.prompt }}</blockquote>
              <div class="rise-choice-row"><button v-for="option in ['GPT-4', 'Gemini', 'Claude']" :key="option" type="button" :class="{ selected: matchChoice === option }" :disabled="matchSubmitted" @click="matchChoice = option">{{ option }}</button></div>
              <button v-if="!matchSubmitted" type="button" class="rise-submit" :disabled="!matchChoice" @click="submitMatch">Check match</button>
              <template v-else><p class="rise-activity__feedback" :class="{ correct: matchChoice === currentMatchPrompt.answer }"><strong>{{ matchChoice === currentMatchPrompt.answer ? 'Correct.' : 'Review the description.' }}</strong> {{ currentMatchPrompt.explanation }}</p><button v-if="matchIndex < matchPrompts.length - 1" type="button" class="rise-next-link" @click="nextMatchPrompt">Match the next capability</button><p v-else class="rise-block__takeaway">A name is not a guarantee. The practical question is always whether the capability, inputs, checks, and safeguards fit the task.</p></template>
            </section>

            <section v-if="currentModule.id === 'know-ai'" class="rise-block rise-scenario-block">
              <p class="rise-block__eyebrow">Decision scenario</p>
              <h2>Choose a responsible next action</h2>
              <p>A learning coordinator wants an AI tool to summarise notes from a meeting. The notes include names, personal feedback, and a draft action plan. What should happen first?</p>
              <div class="rise-choice-column"><button v-for="(option, index) in scenarioOptions" :key="option" type="button" :class="{ selected: scenarioChoice === index }" :disabled="scenarioSubmitted" @click="scenarioChoice = index">{{ option }}</button></div>
              <button v-if="!scenarioSubmitted" type="button" class="rise-submit" :disabled="scenarioChoice === null" @click="submitScenario">Check decision</button>
              <template v-else><p class="rise-activity__feedback" :class="{ correct: scenarioChoice === 1 }"><strong>{{ scenarioChoice === 1 ? 'A responsible start.' : 'Pause before proceeding.' }}</strong> The task may be useful, but the information and the tool both need review before the coordinator asks for any output.</p>
                <div class="rise-scenario-block__check"><h3>Select all safeguards that still apply</h3><p>The decision is not complete until you identify the conditions that keep the task bounded and accountable.</p><button v-for="(option, index) in safeguardOptions" :key="option" type="button" :class="{ selected: safeguardsSelected.includes(index) }" :aria-pressed="safeguardsSelected.includes(index)" @click="toggleSafeguard(index)"><i aria-hidden="true">{{ safeguardsSelected.includes(index) ? '✓' : '' }}</i>{{ option }}</button><button v-if="!safeguardsSubmitted" type="button" class="rise-submit" :disabled="!safeguardsSelected.length" @click="submitSafeguards">Check safeguards</button><p v-else class="rise-activity__feedback" :class="{ correct: isCorrectSafeguardSet() }"><strong>{{ isCorrectSafeguardSet() ? 'Complete.' : 'Review the conditions.' }}</strong> {{ isCorrectSafeguardSet() ? 'Safe inputs, evidence checks, and named accountability work together. Confident wording is never proof.' : 'The correct set includes the first three statements. A confident answer still needs checking.' }}</p></div></template>
            </section>

            <section class="rise-source"><strong>Source:</strong> <a :href="currentModule.sourceUrl" target="_blank" rel="noreferrer">{{ currentModule.sourceLabel }}</a> <span>· {{ currentModule.confidence }}</span></section>
            <section class="rise-bridge"><b>Next connection</b><p>{{ currentModule.bridge }}</p></section>
            <button type="button" class="rise-next-link" @click="completeCurrent">{{ currentModule.number === '07' ? 'Continue to the knowledge check' : 'Continue to the next lesson' }}</button>
          </article>

          <article v-else-if="currentId === 'quiz'" class="rise-reading rise-quiz-screen">
            <p>This knowledge check asks you to retrieve and apply ideas from the seven lessons. Read each question carefully, select one answer, and submit it before moving to the next question.</p>
            <section class="rise-quiz">
              <span>Question</span><b>{{ String(quizIndex + 1).padStart(2, '0') }}/{{ String(quizQuestions.length).padStart(2, '0') }}</b>
              <h2>{{ quizQuestion.prompt }}</h2>
              <p>Choose the correct answer from the options below.</p>
              <label v-for="(option, index) in quizQuestion.options" :key="option" :class="{ selected: quizChoice === index }"><input v-model="quizChoice" type="radio" :value="index" :disabled="quizSubmitted" /><span>{{ option }}</span></label>
              <button v-if="!quizSubmitted" type="button" class="rise-submit" :disabled="quizChoice === null" @click="submitQuiz">Submit</button>
              <aside v-else :class="{ correct: quizChoice === quizQuestion.correct }"><strong>{{ quizChoice === quizQuestion.correct ? 'Correct.' : 'Review this point.' }}</strong> {{ quizQuestion.explanation }}</aside>
              <button v-if="quizSubmitted" type="button" class="rise-next-link" @click="nextQuizQuestion">{{ quizIndex === quizQuestions.length - 1 ? 'Continue to summary' : 'Next question' }}</button>
            </section>
          </article>

          <article v-else class="rise-reading rise-summary">
            <p>This course began before the modern chat era, with the long history of questions about machine intelligence. The seven lessons then connected that history to learning from examples, next-token prediction, modern AI types, famous models, and practical judgement.</p>
            <h2>What to carry forward</h2>
            <p class="rise-lead">Use AI as a powerful prediction tool, not as an unquestioned authority.</p>
            <ul>
              <li>Ask what task the system is designed to support, what information shapes its output, and what it cannot know from the prompt alone.</li>
              <li>Treat a generated response as a candidate answer built from patterns until important claims have been checked.</li>
              <li>Choose a model and workflow that fit the task, protect information, and keep a person accountable for the final decision.</li>
            </ul>
            <h2>Create a responsible-use plan</h2>
            <p>Use the three prompts below to apply the course to one realistic, low-risk task. A strong plan makes the task, the evidence check, and the human review point explicit.</p>
            <form class="rise-action-plan" @submit.prevent="finishCourse">
              <label><b>Choose one bounded task.</b><span>Describe a low-risk task where AI could help you prepare a first draft, organise notes, or identify questions.</span><textarea v-model="plan.task" rows="3" placeholder="For example: Prepare a first outline for a training session using public policy notes."></textarea></label>
              <label><b>State what you will check.</b><span>Name the facts, sources, numbers, policy wording, or other outputs that require review.</span><textarea v-model="plan.check" rows="3" placeholder="For example: Check every policy reference against the current published policy."></textarea></label>
              <label><b>Name the human review point.</b><span>Identify the person or role accountable for approving the final result.</span><textarea v-model="plan.reviewer" rows="3" placeholder="For example: A subject expert reviews the outline before it is shared."></textarea></label>
              <button type="submit" class="rise-submit" :disabled="!planReady">{{ courseCompleted ? 'Course completed' : 'Complete course' }}</button>
            </form>
            <section v-if="courseCompleted" class="rise-complete"><b>Course completed</b><p>Your plan links the course concepts to a practical use case. Keep the same sequence: define the task, protect the information, check the output, and retain accountability.</p><button type="button" class="rise-next-link" @click="resetCourse">Restart course</button></section>
          </article>
        </section>
      </Transition>
    </main>

    <footer v-if="current >= 0" class="rise-footer"><button type="button" :disabled="current < 0" @click="previous">Previous</button><span>{{ current + 1 }} of {{ AI_MODULES.length + 3 }}</span><button type="button" :disabled="current >= AI_MODULES.length + 2" @click="next">Next</button></footer>
  </div>
</template>

<style>
:root{--rise-blue:#2f6fb3;--rise-header:#9ac8e8;--rise-ink:#111;--rise-grey:#f3f3f3;--rise-line:#dedede;--rise-font:'Poppins',Arial,sans-serif}*{box-sizing:border-box}body{margin:0;background:#fff}.rise-canvas{min-height:100dvh;display:grid;grid-template-columns:242px minmax(0,1fr);grid-template-rows:minmax(0,1fr) 58px;background:#fff;color:var(--rise-ink);font-family:var(--rise-font)}.rise-sidebar{position:sticky;top:0;align-self:start;grid-row:1/-1;height:100dvh;overflow:auto;border-right:1px solid var(--rise-line);background:#fff}.rise-sidebar__hero{position:relative;width:100%;height:162px;padding:0;border:0;overflow:hidden;background:#222;color:#fff;text-align:left;cursor:pointer}.rise-sidebar__hero img{width:100%;height:100%;object-fit:cover}.rise-sidebar__hero::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.46)}.rise-sidebar__hero span{position:absolute;z-index:1;left:19px;bottom:17px;font-size:19px;font-weight:800;line-height:1.16}.rise-sidebar__home{width:100%;padding:14px 19px 10px;border:0;background:#fff;color:#111;text-align:left;cursor:pointer;font:800 13px var(--rise-font)}.rise-sidebar__progress{display:grid;gap:6px;padding:0 19px 18px;border-bottom:1px solid var(--rise-line)}.rise-sidebar__progress span{font-size:10px;font-weight:800}.rise-sidebar__progress i{display:block;height:3px;background:#e7e7e7}.rise-sidebar__progress i b{display:block;height:100%;background:var(--rise-blue)}.rise-sidebar__list{padding:11px 0;margin:0;list-style:none}.rise-sidebar__list li button{width:100%;display:grid;grid-template-columns:19px 1fr 18px;gap:10px;align-items:center;padding:13px 14px;border:0;background:#fff;color:#111;text-align:left;cursor:pointer;font:700 12px/1.25 var(--rise-font)}.rise-sidebar__list li button:hover,.rise-sidebar__list li button.active{background:#fafafa}.rise-glyph{position:relative;display:block;width:15px;height:11px;border-top:2px solid #777;border-bottom:2px solid #777}.rise-glyph::after{content:'';position:absolute;top:3px;left:0;width:15px;border-top:2px solid #777}.rise-glyph.quiz{width:14px;height:14px;border:2px solid #777}.rise-glyph.quiz::after{content:'?';top:-4px;left:3px;width:auto;border:0;color:#777;font-size:10px;font-weight:900}.rise-sidebar__list b,.rise-overview__outline b{width:16px;height:16px;display:grid;place-items:center;border:2px solid #dadada;border-radius:50%;color:#fff;font-size:9px}.rise-sidebar__list b.complete,.rise-overview__outline b.complete{background:var(--rise-blue);border-color:var(--rise-blue)}.rise-sidebar__close{display:none}.rise-main{min-width:0;background:#fff}.rise-screen{min-height:100dvh}.rise-overview{max-width:1180px;margin:0 auto}.rise-overview__hero{position:relative;min-height:410px;overflow:hidden;background:#202020}.rise-overview__hero img{width:100%;height:410px;display:block;object-fit:cover}.rise-overview__shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.64),rgba(0,0,0,.10) 74%)}.rise-overview__hero h1{position:absolute;left:50px;bottom:120px;max-width:630px;margin:0;color:#fff;font-size:50px;font-weight:900;letter-spacing:-.045em;line-height:1.12}.rise-overview__hero button{position:absolute;left:50px;bottom:42px;min-width:360px;height:58px;border:0;border-radius:999px;background:#fff;color:#111;cursor:pointer;font:900 15px var(--rise-font);letter-spacing:.07em;text-transform:uppercase}.rise-overview__body{max-width:880px;padding:52px 50px 86px}.rise-wordmark{margin:0 0 50px;font-size:55px;font-weight:900;letter-spacing:-.08em}.rise-overview__body p{max-width:670px;margin:0 0 31px;font-size:19px;font-weight:500;line-height:1.65}.rise-duration{font-size:18px!important}.rise-overview__outline{max-width:700px;padding:7px 0;margin:0;list-style:none}.rise-overview__outline li button{width:100%;display:grid;grid-template-columns:26px 1fr 22px;gap:15px;align-items:center;padding:17px 4px;border:0;background:#fff;color:#111;text-align:left;cursor:pointer;font:700 16px var(--rise-font)}.rise-overview__outline i{position:relative;width:17px;height:12px;border-top:2px solid #777;border-bottom:2px solid #777}.rise-overview__outline i::after{content:'';position:absolute;top:4px;left:0;width:17px;border-top:2px solid #777}.rise-overview__outline i.quiz{width:16px;height:16px;border:2px solid #777}.rise-overview__outline i.quiz::after{content:'?';top:-3px;left:4px;width:auto;border:0;color:#777;font-size:11px;font-weight:900}.rise-header{min-height:255px;padding:18px 54px 37px;background:var(--rise-header)}.rise-header>div{display:flex;align-items:center;justify-content:space-between}.rise-header button{width:36px;height:36px;border:0;border-radius:2px;background:#fff;cursor:pointer}.rise-menu-icon{position:relative;display:inline-block;width:15px;height:11px;border-top:2px solid #333;border-bottom:2px solid #333}.rise-menu-icon::after{content:'';position:absolute;top:3px;left:0;width:15px;border-top:2px solid #333}.rise-header>div>b{font-size:13px}.rise-header h1{max-width:760px;margin:67px 0 25px;font-size:46px;font-weight:900;letter-spacing:-.045em;line-height:1.12}.rise-header>i{display:block;width:65px;border-top:6px solid #111}.rise-reading{max-width:910px;padding:48px 54px 90px}.rise-reading>p,.rise-text-section>p,.rise-worked-example>p{max-width:780px;margin:0 0 28px;font-size:19px;font-weight:500;line-height:1.68}.rise-reading h2{max-width:780px;margin:52px 0 16px;font-size:35px;font-weight:900;letter-spacing:-.035em;line-height:1.2}.rise-reading h3{margin:0 0 11px;font-size:25px;font-weight:900}.rise-reading .rise-lead{font-size:24px;font-weight:800;line-height:1.5}.rise-reading>ul{display:grid;gap:20px;max-width:780px;padding-left:31px;margin:0 0 50px}.rise-reading>ul li{padding-left:7px;font-size:19px;font-weight:500;line-height:1.55}.rise-info{display:grid;grid-template-columns:34px 1fr;gap:13px;max-width:780px;padding:24px;margin:37px 0;background:#f5f5f5}.rise-info>i{width:24px;height:24px;display:grid;place-items:center;border:2px solid #777;border-radius:50%;color:#777;font-size:15px;font-style:normal;font-weight:900}.rise-info b{font-size:16px}.rise-info p{margin:6px 0 0;font-size:17px;font-weight:500;line-height:1.55}.rise-diagram{display:flex;flex-wrap:wrap;align-items:center;gap:9px;max-width:780px;margin:38px 0;padding:20px 0;border-top:1px solid var(--rise-line);border-bottom:1px solid var(--rise-line)}.rise-diagram span{padding:8px 10px;background:#f5f5f5;font-size:14px;font-weight:700}.rise-diagram i{font-style:normal;color:var(--rise-blue);font-size:20px;font-weight:800}.rise-worked-example{max-width:780px;margin:44px 0;padding-top:2px}.rise-worked-example h2{margin-top:0}.rise-media{max-width:780px;margin:40px 0}.rise-media img{display:block;width:100%;max-height:440px;object-fit:cover}.rise-media p{margin:12px 0 0;font-size:16px;font-weight:500;line-height:1.55}.rise-video{max-width:780px;margin:44px 0}.rise-video h2{margin:0 0 12px}.rise-video>p{margin:0 0 16px;font-size:17px;line-height:1.55}.rise-video__frame{position:relative;aspect-ratio:16/9;border:1px solid var(--rise-line)}.rise-video__frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.rise-activity{max-width:780px;margin:46px 0;padding-top:3px}.rise-activity h2{margin-top:0}.rise-activity>p{font-size:18px;font-weight:500;line-height:1.6}.rise-activity blockquote{margin:22px 0;padding:18px 22px;border-left:4px solid var(--rise-blue);background:#f5f5f5;font-size:18px;font-weight:600;line-height:1.55}.rise-choice-row{display:flex;flex-wrap:wrap;gap:9px;margin:20px 0}.rise-choice-row button,.rise-choice-column button{border:1px solid var(--rise-line);background:#fff;color:#111;cursor:pointer;font:700 15px var(--rise-font)}.rise-choice-row button{padding:12px 16px}.rise-choice-column{display:grid;margin:20px 0}.rise-choice-column button{padding:15px;text-align:left}.rise-choice-column button+button{border-top:0}.rise-choice-row button.selected,.rise-choice-column button.selected{border-color:var(--rise-blue);box-shadow:inset 0 0 0 1px var(--rise-blue)}.rise-activity__feedback{padding:17px 0 0;border-top:1px solid var(--rise-line);font-size:17px!important}.rise-source{max-width:780px;padding-top:18px;border-top:1px solid var(--rise-line);font-size:15px}.rise-source a,.rise-source span{color:var(--rise-blue);font-weight:700}.rise-bridge{max-width:780px;margin:34px 0;padding-left:17px;border-left:4px solid var(--rise-blue)}.rise-bridge b{font-size:15px}.rise-bridge p{margin:6px 0 0;font-size:17px;font-weight:500;line-height:1.55}.rise-next-link{margin-top:39px;padding:0;border:0;background:#fff;color:var(--rise-blue);cursor:pointer;font:800 17px var(--rise-font);text-decoration:underline}.rise-quiz{max-width:780px;padding:38px;margin:44px 0;border:1px solid #ededed;background:#fff}.rise-quiz>span{display:block;font-size:11px;font-weight:800}.rise-quiz>b{display:block;margin:2px 0 22px;color:var(--rise-blue);font-size:25px}.rise-quiz h2{margin:0 0 16px;font-size:25px}.rise-quiz>p{margin:0 0 18px;font-size:17px;font-weight:500}.rise-quiz label{display:grid;grid-template-columns:22px 1fr;gap:13px;align-items:center;padding:16px;border:1px solid #e2e2e2;cursor:pointer;font-size:17px;font-weight:600}.rise-quiz label+label{border-top:0}.rise-quiz input{appearance:none;width:15px;height:15px;margin:0;border:1px solid #bbb;border-radius:50%}.rise-quiz label.selected input{border:5px solid var(--rise-blue)}.rise-submit{display:block;min-width:145px;height:42px;margin:25px auto 0;border:0;border-radius:999px;background:var(--rise-blue);color:#fff;cursor:pointer;font:800 12px var(--rise-font);letter-spacing:.05em;text-transform:uppercase}.rise-submit:disabled{opacity:.45;cursor:not-allowed}.rise-quiz aside{padding:15px 0 0;font-size:16px;font-weight:600;line-height:1.5}.rise-quiz aside.correct{color:#1f5a39}.rise-action-plan{display:grid;max-width:780px;gap:26px;margin-top:36px}.rise-action-plan label{display:grid;gap:7px}.rise-action-plan label b{font-size:19px}.rise-action-plan label span{color:#555;font-size:16px;font-weight:500}.rise-action-plan textarea{width:100%;padding:14px;border:1px solid var(--rise-line);font:500 16px/1.45 var(--rise-font);outline:none}.rise-action-plan textarea:focus{border-color:var(--rise-blue)}.rise-action-plan .rise-submit{margin:0}.rise-complete{max-width:780px;padding:24px;margin-top:34px;background:#f5f5f5}.rise-complete b{font-size:20px}.rise-complete p{font-size:17px;font-weight:500;line-height:1.5}.rise-footer{position:sticky;bottom:0;grid-column:2;display:flex;align-items:center;justify-content:space-between;padding:0 54px;border-top:1px solid var(--rise-line);background:#fff}.rise-footer button{border:0;background:#fff;color:var(--rise-blue);cursor:pointer;font:800 14px var(--rise-font)}.rise-footer button:disabled{color:#bbb;cursor:not-allowed}.rise-footer span{color:#777;font-size:13px}.rise-fade-enter-active,.rise-fade-leave-active{transition:opacity .18s ease}.rise-fade-enter-from,.rise-fade-leave-to{opacity:0}@media(max-width:760px){.rise-canvas{display:block}.rise-sidebar{position:fixed;z-index:20;top:0;bottom:0;left:0;width:min(310px,88vw);height:auto;transform:translateX(-102%);transition:transform .2s ease;box-shadow:4px 0 18px rgba(0,0,0,.16)}.rise-sidebar.open{transform:none}.rise-sidebar__close{display:block;width:100%;padding:16px;border:0;border-top:1px solid var(--rise-line);background:#fff;cursor:pointer;font:800 14px var(--rise-font)}.rise-overview__hero,.rise-overview__hero img{min-height:338px;height:338px}.rise-overview__hero h1{left:28px;right:28px;bottom:104px;font-size:34px}.rise-overview__hero button{left:24px;right:24px;bottom:26px;min-width:0;height:52px;font-size:13px}.rise-overview__body{padding:42px 28px 78px}.rise-wordmark{margin-bottom:37px;font-size:42px}.rise-overview__body p{font-size:18px}.rise-overview__outline li button{font-size:15px}.rise-header{min-height:268px;padding:14px 28px 32px}.rise-header h1{margin-top:60px;font-size:35px}.rise-reading{padding:38px 28px 78px}.rise-reading>p,.rise-text-section>p,.rise-worked-example>p{font-size:18px}.rise-reading h2{font-size:32px}.rise-reading>ul li{font-size:18px}.rise-diagram{gap:7px}.rise-diagram span{font-size:12px}.rise-diagram i{font-size:16px}.rise-quiz{padding:25px}.rise-info{padding:18px}.rise-choice-row{display:grid;grid-template-columns:1fr}.rise-choice-row button{text-align:left}.rise-footer{position:sticky;bottom:0;padding:0 28px;height:58px}.rise-footer span{font-size:12px}}
.rise-prediction-lab{max-width:780px;margin:48px 0;padding:30px;border:1px solid var(--rise-line);background:#fff}.rise-prediction-lab__eyebrow{margin:0 0 10px;color:var(--rise-blue);font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}.rise-prediction-lab h2{margin:0 0 14px}.rise-prediction-lab>p{font-size:18px;font-weight:500;line-height:1.6}.rise-prediction-lab blockquote{margin:25px 0;padding:20px 22px;border-left:4px solid var(--rise-blue);background:#f5f5f5;font-size:21px;font-weight:700;line-height:1.55}.rise-prediction-lab blockquote b{color:var(--rise-blue)}.rise-prediction-lab .rise-submit{margin-left:0}.rise-prediction-lab .rise-choice-column button:disabled{cursor:default}.rise-prediction-lab .rise-activity__feedback.correct{color:#1f5a39}.rise-prediction-lab__output{margin:17px 0 0;padding:15px 17px;border-left:3px solid #9ac8e8;background:#f5f9fc}.rise-prediction-lab__output span{display:block;margin-bottom:4px;color:var(--rise-blue);font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.rise-prediction-lab__output p{margin:0;font-size:17px!important;line-height:1.55}.rise-prediction-lab__output b{color:var(--rise-blue)}.rise-prediction-lab__conclusion{margin-top:25px!important;padding-top:18px;border-top:1px solid var(--rise-line);font-weight:700!important}@media(max-width:760px){.rise-prediction-lab{padding:22px}.rise-prediction-lab blockquote{font-size:19px}}
.rise-block{max-width:780px;margin:48px 0;padding:30px;border-top:1px solid var(--rise-line);border-bottom:1px solid var(--rise-line);background:#fff}.rise-block__eyebrow{margin:0 0 10px!important;color:var(--rise-blue);font-size:12px!important;font-weight:800!important;letter-spacing:.05em;text-transform:uppercase}.rise-block h2{margin:0 0 14px!important;font-size:30px!important}.rise-block>p{font-size:18px;font-weight:500;line-height:1.6}.rise-block__takeaway{margin:23px 0 0!important;padding:15px 17px!important;border-left:3px solid #9ac8e8;background:#f5f9fc;font-size:16px!important;font-weight:700!important;line-height:1.55}.rise-timeline-block__nav{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:24px 0 0;border-top:1px solid var(--rise-line);border-bottom:1px solid var(--rise-line)}.rise-timeline-block__nav button{min-height:82px;padding:13px 11px;border:0;border-left:1px solid var(--rise-line);background:#fff;color:#555;text-align:left;cursor:pointer;font:700 13px/1.35 var(--rise-font)}.rise-timeline-block__nav button:first-child{border-left:0}.rise-timeline-block__nav button.active{background:#f5f9fc;color:#111;box-shadow:inset 0 3px 0 var(--rise-blue)}.rise-timeline-block__nav b{display:block;margin-bottom:4px;color:var(--rise-blue);font-size:14px}.rise-timeline-block__nav span{display:block}.rise-timeline-block__event{min-height:174px;padding:25px 0 6px}.rise-timeline-block__event>b{color:var(--rise-blue);font-size:14px}.rise-timeline-block__event h3{margin:7px 0 10px}.rise-timeline-block__event p{max-width:680px;margin:0;font-size:18px;font-weight:500;line-height:1.6}.rise-flashcards__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:25px}.rise-flashcards__grid button{min-height:180px;padding:20px;border:1px solid var(--rise-line);background:#fff;color:#111;text-align:left;cursor:pointer;font-family:var(--rise-font);transition:background .16s ease,border-color .16s ease}.rise-flashcards__grid button:hover,.rise-flashcards__grid button.open{border-color:var(--rise-blue);background:#f5f9fc}.rise-flashcards__grid button span{display:grid;gap:14px}.rise-flashcards__grid button b{font-size:19px;line-height:1.45}.rise-flashcards__grid button small{color:#666;font-size:13px;font-weight:700;line-height:1.5}.rise-tabs-block__tabs{display:flex;flex-wrap:wrap;gap:0;margin-top:24px;border-bottom:1px solid var(--rise-line)}.rise-tabs-block__tabs button{padding:13px 16px;border:0;border-bottom:3px solid transparent;background:#fff;color:#666;cursor:pointer;font:800 14px var(--rise-font)}.rise-tabs-block__tabs button.active{border-bottom-color:var(--rise-blue);color:#111}.rise-tabs-block__panel{min-height:220px;padding:25px 0 4px}.rise-tabs-block__panel h3{margin-bottom:9px}.rise-tabs-block__panel p{max-width:690px;font-size:18px;font-weight:500;line-height:1.6}.rise-game-block blockquote{margin:24px 0;padding:20px 22px;border-left:4px solid var(--rise-blue);background:#f5f5f5;font-size:19px;font-weight:700;line-height:1.55}.rise-game-block .rise-submit,.rise-scenario-block .rise-submit{margin-left:0}.rise-scenario-block .rise-choice-column{margin-top:22px}.rise-scenario-block__check{margin-top:27px;padding-top:25px;border-top:1px solid var(--rise-line)}.rise-scenario-block__check h3{margin-bottom:9px}.rise-scenario-block__check>p{font-size:17px;font-weight:500;line-height:1.55}.rise-scenario-block__check>button:not(.rise-submit){width:100%;display:grid;grid-template-columns:23px 1fr;gap:11px;align-items:center;padding:15px;border:1px solid var(--rise-line);background:#fff;color:#111;text-align:left;cursor:pointer;font:700 15px/1.45 var(--rise-font)}.rise-scenario-block__check>button:not(.rise-submit)+button:not(.rise-submit){border-top:0}.rise-scenario-block__check>button.selected{border-color:var(--rise-blue);background:#f5f9fc}.rise-scenario-block__check>button i{width:18px;height:18px;display:grid;place-items:center;border:1px solid #999;color:#fff;font-size:12px;font-style:normal}.rise-scenario-block__check>button.selected i{border-color:var(--rise-blue);background:var(--rise-blue)}@media(max-width:760px){.rise-block{padding:25px 0}.rise-block h2{font-size:28px!important}.rise-timeline-block__nav{grid-template-columns:1fr 1fr}.rise-timeline-block__nav button:nth-child(3){border-left:0;border-top:1px solid var(--rise-line)}.rise-timeline-block__nav button:nth-child(4){border-top:1px solid var(--rise-line)}.rise-flashcards__grid{grid-template-columns:1fr}.rise-flashcards__grid button{min-height:134px}.rise-tabs-block__tabs{display:grid;grid-template-columns:1fr}.rise-tabs-block__tabs button{text-align:left}.rise-tabs-block__panel{min-height:0}.rise-block__takeaway{font-size:15px!important}}
</style>
