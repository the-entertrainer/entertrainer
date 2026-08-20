<script setup lang="ts">
/**
 * Immersive AI course player
 * Design contract: each screen teaches one idea, shows one visual anchor, or
 * asks one low-stakes action. The top course bar is the only player chrome.
 */
useSeoMeta({
  title: 'From No AI to Know AI · Entertrainer',
  description: 'A short, visual, beginner course tracing AI from early ideas to responsible modern use.',
  ogTitle: 'From No AI to Know AI · Entertrainer',
  ogDescription: 'A short, visual, beginner course tracing AI from early ideas to responsible modern use.',
  ogUrl: 'https://entertrainer.in/courses/ai-atlas'
})

type ScreenKind = 'cover' | 'objectives' | 'explain' | 'media' | 'video' | 'timeline' | 'prediction' | 'input' | 'evidence' | 'safeguards' | 'plan' | 'quiz' | 'summary'
type VideoKey = 'machineLearning' | 'astrobee' | 'trainingBias'
type Screen = { lesson: string; label: string; kind: ScreenKind; title: string; body: string[]; media?: keyof typeof media; caption?: string; video?: VideoKey }

const STORAGE_KEY = 'entertrainer-ai-immersive-screens-v1'
const screenIndex = ref(0)
const furthestIndex = ref(0)
const screenHeading = ref<HTMLElement | null>(null)
const motionDirection = ref<'forward' | 'backward'>('forward')

const historyIndex = ref(0)
const predictionIndex = ref(0)
const predictionChoice = ref<number | null>(null)
const inputChoice = ref<number | null>(null)
const evidenceChoice = ref<string | null>(null)
const safeguardChoices = ref<string[]>([])
const quizChoice = ref<string | null>(null)
const plan = reactive({ task: '', check: '', reviewer: '' })

const media = {
  cover: { scene: 'hero', src: '/work/ai-course-cover.png' },
  turing: { scene: 'evidence', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/OxdXlbgOfXEkTLHF.jpg' },
  eniac: { scene: 'infrastructure', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/SPEtUbjdHEzdnSkY.jpg' },
  earlyBench: { scene: 'project', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/SPEtUbjdHEzdnSkY.jpg' },
  signalBoard: { scene: 'process', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/moUiSubVTjxUVwjH.jpg' },
  patternCards: { scene: 'project', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/fwdrOnvaUvKFwRRw.jpg' },
  context: { scene: 'route', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/HskWrjBphxuOOcHq.jpg' },
  fieldKit: { scene: 'tool', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/mPazqNdxSYgYJBwt.jpg' },
  astrobee: { scene: 'robot', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/hLWRGpDaupOqbeei.jpg' },
  evaluation: { scene: 'evidence', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/tCQsxAZOHvMWOTPx.jpg' },
  serverRoom: { scene: 'infrastructure', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/CcQpBNlrdbhsTXFm.jpg' },
  responsible: { scene: 'evidence', src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/pQVXfuGdMKkvZYTs.jpg' }
} as const

const videos = {
  machineLearning: {
    id: 'OeU5m6vRyCk',
    title: 'AI: What is Machine Learning?',
    duration: '2:55',
    source: 'Code.org',
    prompt: 'Watch to discover how machine learning differs from traditional programming by using vast data to recognize patterns and make predictions.',
    reflection: 'How could a narrow or uneven set of examples change the pattern a model learns?',
    caveat: 'Models identify statistical relationships in training data; they do not have human-like comprehension or common sense.'
  },
  astrobee: {
    id: 'hk-1j3sXTqA',
    title: 'NASA’s Astrobee Robot First Free Flight in Space',
    duration: '1:32',
    source: 'IEEE Spectrum · NASA footage',
    prompt: 'Watch closely how the Astrobee robot uses its built-in cameras and sensors to independently navigate the zero-gravity space station environment.',
    reflection: 'Besides cameras, what other signals could help a robot navigate a shared physical space?',
    caveat: 'The footage shows autonomous free flight, not the full underlying mapping or decision process.'
  },
  trainingBias: {
    id: 'x2mRoFNm22g',
    title: 'AI: Training Data & Bias',
    duration: '2:40',
    source: 'Code.org',
    prompt: 'As you watch, carefully identify how the source and variety of training data directly impact the fairness of AI predictions.',
    reflection: 'What could be missing from a school book-recommendation dataset, and how might that affect a learner?',
    caveat: 'Bias is not the only risk: privacy, consent, appropriate use, evidence, and accountable review still matter.'
  }
} as const

const screens: Screen[] = [
  { lesson: 'Welcome', label: 'Start', kind: 'cover', title: 'From No AI to Know AI', body: ['Artificial intelligence did not begin with ChatGPT. This course traces the longer route from early questions about machine intelligence to prediction, modern systems, and responsible use.'] },
  { lesson: 'Welcome', label: 'Objectives', kind: 'objectives', title: 'What you will learn', body: ['By the end of this module, you will be able to place modern AI in a longer history, explain how a prediction system works in simple terms, recognise different types of AI input, and describe one responsible-use check.'] },
  { lesson: 'Lesson 1 · Before ChatGPT', label: 'The long history', kind: 'media', title: 'AI did not begin with ChatGPT', body: ['Chat tools made AI visible to many people. They did not create the field.', 'Questions about machine intelligence, language, learning, and problem solving were being explored decades earlier. The people and machines in this evidence remind us that computing involved hardware, records, switches, and skilled operators—not an invisible force.'], media: 'turing', caption: 'Alan Turing, 1951. A historical source for questions that shaped AI research.' },
  { lesson: 'Lesson 1 · Before ChatGPT', label: 'Work bench', kind: 'media', title: 'A field grew beside real machines', body: ['Before modern software ran in a browser, researchers and operators worked with physical computing systems. The field did not suddenly appear with one new product.'], media: 'earlyBench', caption: 'Notice the route from cards and relays toward modern hardware: the questions changed over time, but the work stayed tangible.' },
  { lesson: 'Lesson 1 · Before ChatGPT', label: 'Timeline', kind: 'timeline', title: 'Trace the route to modern AI', body: ['Move through four moments. Each one adds a condition that made today’s systems possible.'] },
  { lesson: 'Lesson 2 · What AI is', label: 'One useful system', kind: 'media', title: 'Keep task, output, and human check visible', body: ['Start with a bounded task. Name the information the system receives. Treat its result as a candidate output. Then name the person or evidence that checks it.', 'A travel-time estimate can use route and traffic information. It still needs local knowledge about weather, closures, and the need to arrive early.'], media: 'signalBoard', caption: 'Input, pattern work, output, and human review are different jobs in one practical system.' },
  { lesson: 'Lesson 2 · What AI is', label: 'System check', kind: 'input', title: 'Choose the human check', body: ['A travel-time tool estimates that a route will take 25 minutes. What is the most useful next move?'] },
  { lesson: 'Lesson 3 · Learning patterns', label: 'Rules and patterns', kind: 'media', title: 'Some methods are written. Others are learned.', body: ['A clear rule can be written in advance: if a form is incomplete, return it. A learned pattern uses many examples to estimate which category or value best fits a new input.', 'A new request is not copied from one old example. The examples shape both a model’s strengths and its blind spots.'], media: 'patternCards', caption: 'Varied examples gather into a pattern before a new request is considered.' },
  { lesson: 'Lesson 3 · Learning patterns', label: 'Watch patterns', kind: 'video', title: 'Watch a pattern become a prediction', body: ['This short video makes the difference between written rules and learned patterns visible.'], video: 'machineLearning' },
  { lesson: 'Lesson 4 · Prediction engine', label: 'Next token', kind: 'media', title: 'Earlier context changes the next estimate', body: ['A language model estimates a likely next token from the words and instructions in context. It adds the token, then repeats the same process.', 'The words that came before make some possible continuations fit more strongly than others. Fluent output can still need checking: a likely continuation is not the same as a verified fact.'], media: 'context', caption: 'The viewing window carries earlier context forward before one next piece is estimated.' },
  { lesson: 'Lesson 4 · Prediction engine', label: 'Prediction lab', kind: 'prediction', title: 'Build a service update one choice at a time', body: ['Use the growing context to select the best next word.'] },
  { lesson: 'Lesson 5 · Modern AI types', label: 'Different inputs', kind: 'media', title: 'Different information supports different work', body: ['A language tool begins with text. A vision system begins with images or video. A robot needs camera and sensor information about its surroundings.', 'Text, images, sound, location, and sensors can all be useful information. They should not be treated as interchangeable.'], media: 'fieldKit', caption: 'The field kit separates information types before a system is asked to make a candidate result.' },
  { lesson: 'Lesson 5 · Modern AI types', label: 'Real robot', kind: 'media', title: 'A robot needs information about space', body: ['NASA’s Astrobee is a real free-flying research robot. It uses camera and sensor information to understand position, obstacles, and movement.'], media: 'astrobee', caption: 'Real autonomy depends on input from the changing world, not a general instruction alone.' },
  { lesson: 'Lesson 5 · Modern AI types', label: 'Watch Astrobee', kind: 'video', title: 'Watch a robot use its surroundings', body: ['A short real-world clip lets you observe a free-flying robot before you decide which input it needs.'], video: 'astrobee' },
  { lesson: 'Lesson 5 · Modern AI types', label: 'Input detective', kind: 'input', title: 'Find the required input', body: ['A robot checks whether a free-flying path is clear inside a space station. What information is most useful?'] },
  { lesson: 'Lesson 6 · Models in the world', label: 'Candidate output', kind: 'media', title: 'Test the real work', body: ['A public capability claim can help a team decide what to test. It does not show that a tool is reliable enough for the team’s actual task.', 'A useful test uses representative inputs, compares outcomes with evidence, and identifies who will review the result.'], media: 'evaluation', caption: 'Evaluation is a practical worktable: try representative cases, inspect the outcome, then decide what to change.' },
  { lesson: 'Lesson 6 · Models in the world', label: 'Infrastructure', kind: 'media', title: 'AI is also hardware, power, cooling, and people', body: ['Useful AI services depend on physical servers, networks, cooling, maintenance, energy, and people who decide how results are used.'], media: 'serverRoom', caption: 'A real server room makes the infrastructure behind an online AI service visible.' },
  { lesson: 'Lesson 6 · Models in the world', label: 'Evidence check', kind: 'evidence', title: 'Choose the strongest evidence', body: ['Which statement best supports using a model for a practical team task?'] },
  { lesson: 'Lesson 7 · Know AI', label: 'Use with care', kind: 'media', title: 'Use a checkpoint before action', body: ['A useful task is clear and bounded. Information is safe and approved. Important outputs are checked. A person remains accountable for the final decision.', 'Permission, safe information, evidence, human review, and escalation are practical safeguards—not a final slide after the task is finished.'], media: 'responsible', caption: 'A careful workflow puts safeguards in the route before a result is used.' },
  { lesson: 'Lesson 7 · Know AI', label: 'Watch data', kind: 'video', title: 'Watch why data coverage matters', body: ['This short video strengthens one safeguard: check whether the data behind a system represents the people it may affect.'], video: 'trainingBias' },
  { lesson: 'Lesson 7 · Know AI', label: 'Safeguards', kind: 'safeguards', title: 'Select the essential safeguards', body: ['Choose the three actions that make a low-risk AI-assisted draft more responsible.'] },
  { lesson: 'Lesson 7 · Know AI', label: 'Apply it', kind: 'plan', title: 'Create a responsible-use plan', body: ['Apply the course to one realistic low-risk task. Keep the task, check, and human review point clear.'] },
  { lesson: 'Close', label: 'Knowledge check', kind: 'quiz', title: 'One final decision', body: ['Which statement best describes a responsible AI workflow?'] },
  { lesson: 'Close', label: 'Takeaway', kind: 'summary', title: 'Use the route, not a shortcut', body: ['Define the task. Name the information. Treat output as a candidate. Check important claims. Keep a person accountable for the decision.', 'That is the move from No AI to Know AI.'] }
]

const historyEvents = [
  { year: '1950', title: 'A practical question', text: 'Alan Turing proposed judging machine intelligence through observable performance rather than a vague argument about whether a machine “thinks”.' },
  { year: '1956', title: 'AI becomes a named field', text: 'The Dartmouth research project brought learning, language, abstraction, and problem solving together under the name artificial intelligence.' },
  { year: '1980s–2010s', title: 'Learning from data becomes practical', text: 'More examples, capable computing, and improved methods helped models learn patterns from images, speech, recommendations, and language.' },
  { year: '2017 onward', title: 'Transformers change scale', text: 'Transformer architectures improved work with long sequences. Modern language and multimodal systems build on this longer research history.' }
]

const predictionRounds = [
  { context: 'Heavy rain has flooded the', options: ['tracks', 'invoice', 'ladder'], correct: 0, feedback: 'Tracks fits the growing context because rain, flooding, and travel make a service disruption likely.' },
  { context: 'Heavy rain has flooded the tracks, so the next train will be', options: ['delayed', 'celebrated', 'invisible'], correct: 0, feedback: 'Delayed fits the earlier tokens. The model uses context to estimate a likely continuation.' },
  { context: 'Heavy rain has flooded the tracks, so the next train will be delayed. Passengers need to know when it may', options: ['resume', 'juggle', 'shrink'], correct: 0, feedback: 'Resume keeps the service update coherent. The same estimate-and-add process repeats across a generated response.' }
]

const currentScreen = computed(() => screens[screenIndex.value])
const currentVideo = computed(() => currentScreen.value.video ? videos[currentScreen.value.video] : null)
const progress = computed(() => Math.round((furthestIndex.value / (screens.length - 1)) * 100))
const currentHistory = computed(() => historyEvents[historyIndex.value])
const currentPrediction = computed(() => predictionRounds[predictionIndex.value])
const predictionCorrect = computed(() => predictionChoice.value === currentPrediction.value.correct)
const planReady = computed(() => Boolean(plan.task.trim() && plan.check.trim() && plan.reviewer.trim()))

const screenReady = computed(() => {
  switch (currentScreen.value.kind) {
    case 'input': return inputChoice.value !== null
    case 'prediction': return predictionIndex.value === predictionRounds.length - 1 && predictionCorrect.value
    case 'evidence': return evidenceChoice.value === 'test'
    case 'safeguards': return safeguardChoices.value.length === 3 && safeguardChoices.value.includes('safe') && safeguardChoices.value.includes('check') && safeguardChoices.value.includes('review')
    case 'plan': return planReady.value
    case 'quiz': return quizChoice.value === 'workflow'
    default: return true
  }
})

const continueLabel = computed(() => screenIndex.value === screens.length - 1 ? 'Restart' : 'Continue')

function saveProgress() {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ screenIndex: screenIndex.value, furthestIndex: furthestIndex.value, historyIndex: historyIndex.value, predictionIndex: predictionIndex.value, predictionChoice: predictionChoice.value, inputChoice: inputChoice.value, evidenceChoice: evidenceChoice.value, safeguardChoices: safeguardChoices.value, quizChoice: quizChoice.value, plan }))
}

function focusScreen() {
  nextTick(() => screenHeading.value?.focus({ preventScroll: true }))
}

function moveTo(index: number) {
  if (index < 0 || index > furthestIndex.value || index >= screens.length) return
  motionDirection.value = index < screenIndex.value ? 'backward' : 'forward'
  screenIndex.value = index
  saveProgress()
  focusScreen()
}

function continueScreen() {
  if (screenIndex.value === screens.length - 1) {
    motionDirection.value = 'backward'
    screenIndex.value = 0
    furthestIndex.value = 0
    predictionIndex.value = 0
    predictionChoice.value = null
    inputChoice.value = null
    evidenceChoice.value = null
    safeguardChoices.value = []
    quizChoice.value = null
    Object.assign(plan, { task: '', check: '', reviewer: '' })
    saveProgress()
    focusScreen()
    return
  }
  if (!screenReady.value) return
  const next = screenIndex.value + 1
  motionDirection.value = 'forward'
  furthestIndex.value = Math.max(furthestIndex.value, next)
  screenIndex.value = next
  saveProgress()
  focusScreen()
}

function choosePrediction(index: number) {
  predictionChoice.value = index
  if (index === currentPrediction.value.correct && predictionIndex.value < predictionRounds.length - 1) {
    window.setTimeout(() => { predictionIndex.value += 1; predictionChoice.value = null; saveProgress() }, 420)
  }
  saveProgress()
}

function chooseInput(index: number) { inputChoice.value = index; saveProgress() }
function chooseEvidence(choice: string) { evidenceChoice.value = choice; saveProgress() }
function toggleSafeguard(id: string) {
  safeguardChoices.value = safeguardChoices.value.includes(id) ? safeguardChoices.value.filter((item) => item !== id) : [...safeguardChoices.value, id]
  saveProgress()
}
function chooseQuiz(choice: string) { quizChoice.value = choice; saveProgress() }

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const state = JSON.parse(saved)
    furthestIndex.value = Math.min(Number(state.furthestIndex) || 0, screens.length - 1)
    screenIndex.value = Math.min(Number(state.screenIndex) || 0, furthestIndex.value)
    historyIndex.value = Math.min(Number(state.historyIndex) || 0, historyEvents.length - 1)
    predictionIndex.value = Math.min(Number(state.predictionIndex) || 0, predictionRounds.length - 1)
    predictionChoice.value = typeof state.predictionChoice === 'number' ? state.predictionChoice : null
    inputChoice.value = typeof state.inputChoice === 'number' ? state.inputChoice : null
    evidenceChoice.value = typeof state.evidenceChoice === 'string' ? state.evidenceChoice : null
    safeguardChoices.value = Array.isArray(state.safeguardChoices) ? state.safeguardChoices : []
    quizChoice.value = typeof state.quizChoice === 'string' ? state.quizChoice : null
    Object.assign(plan, state.plan ?? {})
  } catch { localStorage.removeItem(STORAGE_KEY) }
})
</script>

<template>
  <main class="ai-player">
    <header class="ai-player__bar" aria-label="Course controls">
      <NuxtLink to="/lessons" class="ai-player__exit">All lessons</NuxtLink>
      <div class="ai-player__identity"><span aria-hidden="true">E</span><p>From No AI to Know AI</p></div>
      <div class="ai-player__progress" :aria-label="`${progress}% course complete`"><i><b :style="{ width: `${progress}%` }" /></i><span>{{ progress }}%</span></div>
      <nav class="ai-player__steps" aria-label="Course screen navigation"><button type="button" :disabled="screenIndex === 0" aria-label="Back" @click="moveTo(screenIndex - 1)">Back</button><span>{{ screenIndex + 1 }} / {{ screens.length }}</span><button type="button" :disabled="screenIndex >= furthestIndex || screenIndex === screens.length - 1" aria-label="Continue" @click="continueScreen">Continue</button></nav>
    </header>

    <section class="ai-player__stage" aria-live="polite">
      <div class="ai-player__meta"><span>{{ currentScreen.lesson }}</span><span>{{ currentScreen.label }}</span></div>
      <div class="ai-screen-stack" :class="`ai-screen-stack--${motionDirection}`">
      <Transition :name="`ai-stack-${motionDirection}`">
      <article :key="screenIndex" class="ai-screen" :class="{ 'ai-screen--cover': currentScreen.kind === 'cover' }">
        <template v-if="currentScreen.kind === 'cover'">
          <div class="ai-cover"><img :src="media.cover.src" alt="Original Entertrainer course artwork for From No AI to Know AI" /></div>
          <div class="ai-cover__copy"><p class="ai-eyebrow">Beginner module · 35–45 minutes</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p>{{ currentScreen.body[0] }}</p></div>
        </template>

        <template v-else-if="currentScreen.kind === 'objectives'">
          <p class="ai-eyebrow">Before you begin</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p class="ai-lead">By the end of this module, you will be able to:</p><ol class="ai-objectives"><li>Place modern AI in a longer history.</li><li>Explain a next-token prediction in simple terms.</li><li>Recognise which inputs fit different AI tasks.</li><li>Name practical checks for responsible use.</li></ol>
        </template>

        <template v-else-if="currentScreen.kind === 'explain'">
          <p class="ai-eyebrow">{{ currentScreen.lesson }}</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><div class="ai-prose"><p v-for="paragraph in currentScreen.body" :key="paragraph">{{ paragraph }}</p></div>
        </template>

        <template v-else-if="currentScreen.kind === 'media'">
          <div class="ai-media-layout"><div><p class="ai-eyebrow">{{ currentScreen.lesson }}</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><div class="ai-prose"><p v-for="paragraph in currentScreen.body" :key="paragraph">{{ paragraph }}</p></div></div><figure class="ai-figure ai-figure--evidence"><img v-if="media[currentScreen.media!].src" :src="media[currentScreen.media!].src" :alt="currentScreen.caption" /><EdPaperSignal v-else :variant="media[currentScreen.media!].scene" :label="currentScreen.caption" /><figcaption>{{ currentScreen.caption }}</figcaption></figure></div>
        </template>

        <template v-else-if="currentScreen.kind === 'video' && currentVideo">
          <div class="ai-video-layout"><div><p class="ai-eyebrow">Short evidence video · {{ currentVideo.duration }}</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><div class="ai-prose"><p v-for="paragraph in currentScreen.body" :key="paragraph">{{ paragraph }}</p></div><aside class="ai-video-note"><b>Watch for</b><p>{{ currentVideo.prompt }}</p></aside></div><figure class="ai-video"><iframe :src="`https://www.youtube-nocookie.com/embed/${currentVideo.id}?rel=0&modestbranding=1`" :title="currentVideo.title" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen /><figcaption><span>{{ currentVideo.source }} · {{ currentVideo.duration }}</span><a :href="`https://www.youtube.com/watch?v=${currentVideo.id}`" target="_blank" rel="noreferrer">Open on YouTube <EdSignalIcon name="external" /></a></figcaption></figure></div><aside class="ai-video-reflection"><b>After watching</b><p>{{ currentVideo.reflection }}</p><small><strong>Keep in mind:</strong> {{ currentVideo.caveat }}</small></aside>
        </template>

        <template v-else-if="currentScreen.kind === 'timeline'">
          <p class="ai-eyebrow">Interactive timeline · {{ historyIndex + 1 }} of {{ historyEvents.length }}</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p class="ai-lead">{{ currentScreen.body[0] }}</p><section class="timeline-card"><b>{{ currentHistory.year }}</b><h2>{{ currentHistory.title }}</h2><p>{{ currentHistory.text }}</p><div><button type="button" :disabled="historyIndex === 0" @click="historyIndex -= 1; saveProgress()">Back</button><span>{{ historyIndex + 1 }} / {{ historyEvents.length }}</span><button type="button" :disabled="historyIndex === historyEvents.length - 1" @click="historyIndex += 1; saveProgress()">Continue</button></div></section>
        </template>

        <template v-else-if="currentScreen.kind === 'prediction'">
          <p class="ai-eyebrow">Prediction lab · {{ predictionIndex + 1 }} of {{ predictionRounds.length }}</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p class="ai-lead">{{ currentScreen.body[0] }}</p><section class="prediction-card"><p class="prediction-card__context">{{ currentPrediction.context }} <b>_____</b></p><div class="choice-grid"><button v-for="(option, index) in currentPrediction.options" :key="option" type="button" :class="{ 'is-selected': predictionChoice === index, 'is-correct': predictionChoice !== null && index === currentPrediction.correct, 'is-wrong': predictionChoice === index && !predictionCorrect }" @click="choosePrediction(index)">{{ option }}</button></div><p v-if="predictionChoice !== null" class="ai-feedback"><b>{{ predictionCorrect ? 'Good prediction.' : 'Try again.' }}</b> {{ predictionCorrect ? currentPrediction.feedback : 'Read the growing service update once more. Which choice fits the context already present?' }}</p></section>
        </template>

        <template v-else-if="currentScreen.kind === 'input'">
          <p class="ai-eyebrow">Quick decision</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p class="ai-lead">{{ currentScreen.body[0] }}</p><section class="choice-panel"><button type="button" :class="{ 'is-selected': inputChoice === 0 }" @click="chooseInput(0)">Camera and sensor readings</button><button type="button" :class="{ 'is-selected': inputChoice === 1 }" @click="chooseInput(1)">Only a long written essay</button><button type="button" :class="{ 'is-selected': inputChoice === 2 }" @click="chooseInput(2)">A paper timetable with no location data</button><p v-if="inputChoice !== null" class="ai-feedback"><b>{{ inputChoice === 0 ? 'Correct.' : 'Look again.' }}</b> {{ inputChoice === 0 ? 'A robot needs information about position, obstacles, and movement. Cameras and sensors can describe the changing space around it.' : 'This task depends on the changing physical space. The system needs information that represents that space.' }}</p></section>
        </template>

        <template v-else-if="currentScreen.kind === 'evidence'">
          <p class="ai-eyebrow">Evidence check</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p class="ai-lead">{{ currentScreen.body[0] }}</p><section class="choice-panel"><button type="button" :class="{ 'is-selected': evidenceChoice === 'name' }" @click="chooseEvidence('name')">The tool has a famous model name.</button><button type="button" :class="{ 'is-selected': evidenceChoice === 'demo' }" @click="chooseEvidence('demo')">A short demo looked impressive once.</button><button type="button" :class="{ 'is-selected': evidenceChoice === 'test' }" @click="chooseEvidence('test')">The team tested representative inputs, checked outcomes, and named a reviewer.</button><p v-if="evidenceChoice" class="ai-feedback"><b>{{ evidenceChoice === 'test' ? 'Correct.' : 'Not enough.' }}</b> {{ evidenceChoice === 'test' ? 'This connects a documented capability to the actual task, its conditions, and a review step.' : 'A name or one polished demo can inspire a test. It does not show reliability for this specific task.' }}</p></section>
        </template>

        <template v-else-if="currentScreen.kind === 'safeguards'">
          <p class="ai-eyebrow">Responsible-use check</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p class="ai-lead">{{ currentScreen.body[0] }}</p><section class="safeguard-grid"><button type="button" :class="{ 'is-selected': safeguardChoices.includes('safe') }" @click="toggleSafeguard('safe')">Use only safe and approved information.</button><button type="button" :class="{ 'is-selected': safeguardChoices.includes('check') }" @click="toggleSafeguard('check')">Check important claims against appropriate evidence.</button><button type="button" :class="{ 'is-selected': safeguardChoices.includes('review') }" @click="toggleSafeguard('review')">Name a person responsible for the final decision.</button><button type="button" :class="{ 'is-selected': safeguardChoices.includes('upload') }" @click="toggleSafeguard('upload')">Upload personal information if the draft will be reviewed later.</button></section><p v-if="safeguardChoices.length" class="ai-feedback"><b>{{ screenReady ? 'Ready to continue.' : 'Keep checking.' }}</b> Responsible use protects information, checks consequential results, and keeps human accountability visible.</p>
        </template>

        <template v-else-if="currentScreen.kind === 'plan'">
          <p class="ai-eyebrow">Apply the method</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p class="ai-lead">{{ currentScreen.body[0] }}</p><form class="plan-form" @submit.prevent="continueScreen"><label><b>Choose one bounded task</b><textarea v-model="plan.task" rows="2" placeholder="For example: Prepare an outline from public workshop notes." /></label><label><b>State what you will check</b><textarea v-model="plan.check" rows="2" placeholder="For example: Check every policy reference against the current published policy." /></label><label><b>Name the human review point</b><textarea v-model="plan.reviewer" rows="2" placeholder="For example: A subject expert approves the outline before sharing." /></label></form>
        </template>

        <template v-else-if="currentScreen.kind === 'quiz'">
          <p class="ai-eyebrow">Final check</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><p class="ai-lead">{{ currentScreen.body[0] }}</p><section class="choice-panel"><button type="button" :class="{ 'is-selected': quizChoice === 'workflow' }" @click="chooseQuiz('workflow')">Define a bounded task, use safe information, check important results, and keep a person accountable.</button><button type="button" :class="{ 'is-selected': quizChoice === 'automation' }" @click="chooseQuiz('automation')">Choose the best-known model and let it make the final decision without a review step.</button><button type="button" :class="{ 'is-selected': quizChoice === 'prompt' }" @click="chooseQuiz('prompt')">Write a longer prompt so the model does not need evidence or a reviewer.</button><p v-if="quizChoice" class="ai-feedback"><b>{{ quizChoice === 'workflow' ? 'Correct.' : 'Not quite.' }}</b> {{ quizChoice === 'workflow' ? 'Responsible use is a workflow, not a model setting.' : 'A capable output still needs fit, evidence, and accountable human review.' }}</p></section>
        </template>

        <template v-else-if="currentScreen.kind === 'summary'">
          <div class="summary-layout"><div><p class="ai-eyebrow">Take this with you</p><h1 ref="screenHeading" tabindex="-1">{{ currentScreen.title }}</h1><div class="ai-prose"><p v-for="paragraph in currentScreen.body" :key="paragraph">{{ paragraph }}</p></div><details class="source-list"><summary>Sources and media credits <span>+</span></summary><ol><li><a href="https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth" target="_blank" rel="noreferrer">Dartmouth — The origin of the term artificial intelligence</a></li><li><a href="https://www.nasa.gov/astrobee/" target="_blank" rel="noreferrer">NASA — Astrobee</a></li><li><a href="https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence" target="_blank" rel="noreferrer">NIST — Generative AI Profile</a></li><li><a href="https://www.youtube.com/watch?v=OeU5m6vRyCk" target="_blank" rel="noreferrer">Code.org — AI: What is Machine Learning?</a></li><li><a href="https://www.youtube.com/watch?v=hk-1j3sXTqA" target="_blank" rel="noreferrer">IEEE Spectrum / NASA — Astrobee Robot First Free Flight in Space</a></li><li><a href="https://www.youtube.com/watch?v=x2mRoFNm22g" target="_blank" rel="noreferrer">Code.org — AI: Training Data & Bias</a></li><li>Paper Signal illustrations are original Entertrainer learning graphics. Embedded evidence videos remain linked to their original authoritative sources.</li></ol></details></div><figure class="ai-figure"><EdPaperSignal variant="evidence" label="A Paper Signal responsible-use checkpoint" /><figcaption>Use the route: task, information, candidate output, evidence, and accountable human decision.</figcaption></figure></div>
        </template>

        <p v-if="!screenReady" class="ai-screen__status" role="status">Complete the activity to continue.</p><div class="ai-screen__continue"><button type="button" :disabled="!screenReady" @click="continueScreen">{{ continueLabel }}</button></div>
      </article>
      </Transition>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Immersive player: the course bar is the only chrome; each screen owns one learning purpose. */
.ai-player { --ai-blue: #235fc3; --ai-violet: #6b5cf6; --ai-ink: #202731; --ai-muted: #5e6a79; --ai-line: #dbe2eb; --ai-paper: #f8f7f3; --ai-ease: cubic-bezier(.16, 1, .3, 1); min-height: 100dvh; background: #eef1f5; color: var(--ai-ink); font-family: 'Nunito Sans', Archivo, Arial, sans-serif; }
.ai-player__bar { position: sticky; top: 0; z-index: 10; display: grid; grid-template-columns: 1fr auto 1fr auto; align-items: center; gap: 18px; min-height: 60px; padding: 0 clamp(16px, 4vw, 46px); background: rgb(255 255 255 / 96%); border-bottom: 1px solid var(--ai-line); backdrop-filter: blur(16px); }.ai-player__exit { color: var(--ai-muted); font-size: 13px; font-weight: 700; text-decoration: none; }.ai-player__exit::before { content: '← '; }.ai-player__exit:hover { color: var(--ai-blue); }.ai-player__identity { display: flex; align-items: center; gap: 9px; }.ai-player__identity span { display: grid; place-items: center; width: 27px; height: 27px; color: #fff; background: #1d2631; border-radius: 3px; font-size: 11px; font-weight: 900; }.ai-player__identity p { margin: 0; font-size: 13px; font-weight: 800; }.ai-player__progress { display: flex; align-items: center; gap: 8px; justify-self: end; color: var(--ai-muted); font-family: var(--font-mono); font-size: 10px; }.ai-player__progress i { width: 70px; height: 4px; overflow: hidden; background: #dfe4ed; border-radius: 999px; }.ai-player__progress b { display: block; height: 100%; background: linear-gradient(90deg, var(--ai-blue), var(--ai-violet)); border-radius: inherit; transition: width 260ms var(--ai-ease); }.ai-player__steps { display: flex; align-items: center; gap: 7px; color: var(--ai-muted); font-family: var(--font-mono); font-size: 10px; }.ai-player__steps button { display: grid; place-items: center; width: 27px; height: 27px; color: var(--ai-blue); background: #fff; border: 1px solid var(--ai-line); border-radius: 3px; font: 800 15px inherit; cursor: pointer; transition: transform 150ms var(--ai-ease), border-color 150ms var(--ai-ease); }.ai-player__steps button:hover:not(:disabled) { border-color: var(--ai-blue); transform: translateY(-1px); }.ai-player__steps button:disabled { color: #c4cad3; cursor: not-allowed; }
	.ai-player__stage { display: flex; flex-direction: column; width: min(100% - 32px, 1040px); min-height: calc(100dvh - 60px); margin: 0 auto; padding: clamp(20px, 4vh, 48px) 0 28px; }.ai-player__meta { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 12px; color: var(--ai-blue); font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }.ai-screen-stack { position: relative; display: flex; flex: 1; isolation: isolate; }.ai-screen { position: relative; z-index: 2; display: flex; flex: 1; flex-direction: column; width: 100%; min-height: min(690px, calc(100dvh - 138px)); padding: clamp(28px, 5vw, 62px); overflow: hidden; background: #fff; border: 1px solid var(--ai-line); border-top: 4px solid var(--ai-blue); border-radius: 10px; box-shadow: 0 18px 45px rgb(32 43 61 / 8%); will-change: transform, opacity; }.ai-screen-stack::before { position: absolute; inset: 10px 13px -9px; z-index: 0; content: ''; background: #e3e9f5; border: 1px solid #d5deec; border-radius: 10px; transform: rotate(.35deg); }.ai-screen--cover { display: grid; grid-template-columns: 1.1fr .9fr; padding: 0; background: var(--ai-paper); border: 0; }.ai-cover { position: relative; min-height: 470px; margin: 0; overflow: hidden; }.ai-cover :deep(.ps-art__paper) { width: min(72%, 360px); }.ai-cover__copy { display: flex; flex-direction: column; justify-content: center; padding: clamp(34px, 6vw, 78px); }.ai-eyebrow { margin: 0 0 14px; color: var(--ai-blue); font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }.ai-screen h1 { max-width: 17ch; margin: 0; font-family: Archivo, Arial, sans-serif; font-size: clamp(33px, 4.8vw, 56px); letter-spacing: -.06em; line-height: 1.02; }.ai-screen h2 { margin: 0; font-size: 25px; letter-spacing: -.04em; }.ai-cover__copy > p:last-child, .ai-lead, .ai-prose { max-width: 62ch; color: #3e4855; font-family: var(--font-reading); font-size: 18px; line-height: 1.6; }.ai-cover__copy > p:last-child { margin: 22px 0 0; }.ai-lead { margin: 22px 0 0; }.ai-prose { margin-top: 24px; }.ai-prose p { margin: 0 0 16px; }.ai-objectives { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; max-width: 790px; margin: 30px 0 0; padding: 0; list-style: none; counter-reset: objectives; }.ai-objectives li { position: relative; min-height: 84px; padding: 18px 18px 18px 48px; background: #f3f6ff; border: 1px solid #dce5fa; border-radius: 6px; font-size: 15px; font-weight: 700; line-height: 1.42; counter-increment: objectives; }.ai-objectives li::before { content: counter(objectives); position: absolute; top: 18px; left: 17px; display: grid; place-items: center; width: 21px; height: 21px; color: #fff; background: var(--ai-blue); border-radius: 50%; font-family: var(--font-mono); font-size: 10px; }
	.ai-media-layout, .summary-layout { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: clamp(26px, 6vw, 72px); height: 100%; }.ai-figure { margin: 0; overflow: hidden; background: #eef0f3; border-radius: 7px; box-shadow: 0 12px 25px rgb(28 43 71 / 8%); }.ai-figure :deep(.ps-art) { min-height: 0; aspect-ratio: 3 / 2; }.ai-figure figcaption { padding: 11px 13px; color: var(--ai-muted); background: #fff; font-size: 11px; line-height: 1.45; }.timeline-card, .prediction-card, .choice-panel, .safeguard-grid, .plan-form { max-width: 750px; margin-top: 27px; }.timeline-card { padding: 27px; background: #f5f7fb; border-left: 4px solid var(--ai-blue); }.timeline-card > b { color: var(--ai-blue); font-family: var(--font-mono); font-size: 12px; }.timeline-card h2 { margin-top: 10px; }.timeline-card p { max-width: 62ch; margin: 12px 0 0; font-family: var(--font-reading); font-size: 17px; line-height: 1.55; }.timeline-card > div { display: flex; align-items: center; gap: 11px; margin-top: 22px; }.timeline-card button { min-height: 37px; padding: 0 12px; color: var(--ai-blue); background: #fff; border: 1px solid #ccd7e9; border-radius: 4px; font-weight: 700; cursor: pointer; }.timeline-card button:disabled { color: #a5adba; cursor: not-allowed; }.timeline-card span { color: var(--ai-muted); font-family: var(--font-mono); font-size: 10px; }.prediction-card { padding: 25px; background: #f8fafc; border: 1px solid var(--ai-line); border-radius: 8px; }.prediction-card__context { padding: 18px; color: #25354d; background: #eef3ff; border-left: 3px solid var(--ai-blue); font-family: var(--font-reading); font-size: 19px; line-height: 1.55; }.prediction-card__context b { color: var(--ai-violet); }.choice-grid, .choice-panel, .safeguard-grid { display: grid; gap: 10px; }.choice-grid { grid-template-columns: repeat(3, 1fr); margin-top: 18px; }.choice-grid button, .choice-panel button, .safeguard-grid button { min-height: 53px; padding: 13px 15px; color: #303946; background: #fff; border: 1px solid #ced7e3; border-radius: 5px; font: 700 14px inherit; line-height: 1.4; text-align: left; cursor: pointer; transition: transform 160ms var(--ai-ease), border-color 160ms var(--ai-ease), background 160ms var(--ai-ease); }.choice-grid button:hover, .choice-panel button:hover, .safeguard-grid button:hover { border-color: var(--ai-blue); transform: translateY(-1px); }.choice-grid button.is-selected, .choice-panel button.is-selected, .safeguard-grid button.is-selected { color: #fff; background: var(--ai-blue); border-color: var(--ai-blue); }.choice-grid button.is-correct { color: #204632; background: #edf8f1; border-color: #2d8c5b; }.choice-grid button.is-wrong { color: #783d3d; background: #fff4f4; border-color: #bb5c5c; }.ai-feedback { margin: 16px 0 0; padding: 13px 15px; color: #244432; background: #edf8f1; border-left: 3px solid #2d8c5b; font-size: 14px; line-height: 1.5; }.safeguard-grid { grid-template-columns: 1fr 1fr; }.plan-form { display: grid; gap: 14px; }.plan-form label { display: grid; gap: 7px; padding: 15px; background: #f7f9fc; border: 1px solid var(--ai-line); border-radius: 5px; }.plan-form b { color: #344253; font-size: 13px; }.plan-form textarea { width: 100%; resize: vertical; padding: 10px; color: var(--ai-ink); background: #fff; border: 1px solid #cdd7e5; border-radius: 4px; font: 14px var(--font-reading); line-height: 1.45; }.source-list { max-width: 540px; margin-top: 26px; border-top: 1px solid var(--ai-line); border-bottom: 1px solid var(--ai-line); }.source-list summary { display: flex; justify-content: space-between; padding: 14px 0; font-size: 13px; font-weight: 800; cursor: pointer; list-style: none; }.source-list summary::-webkit-details-marker { display: none; }.source-list ol { padding: 0 0 14px 18px; }.source-list li { margin-top: 8px; color: var(--ai-muted); font-family: var(--font-reading); font-size: 13px; line-height: 1.45; }.source-list a { color: var(--ai-blue); }.ai-screen__continue { display: flex; justify-content: flex-end; margin-top: auto; padding-top: 28px; }.ai-screen__continue button { min-height: 48px; padding: 0 17px; color: #fff; background: var(--ai-blue); border: 0; border-radius: 5px; font-weight: 800; cursor: pointer; transition: transform 160ms var(--ai-ease), background 160ms var(--ai-ease), opacity 160ms var(--ai-ease); }.ai-screen__continue button:hover:not(:disabled) { background: #194b9f; transform: translateY(-1px); }.ai-screen__continue button:disabled { opacity: .42; cursor: not-allowed; }
	.ai-video-layout { display: grid; grid-template-columns: minmax(0, .85fr) minmax(360px, 1.15fr); align-items: center; gap: clamp(28px, 5vw, 62px); height: 100%; }.ai-video { margin: 0; overflow: hidden; background: #131b27; border: 1px solid #233247; border-radius: 8px; box-shadow: 0 18px 34px rgb(28 43 71 / 13%); }.ai-video iframe { display: block; width: 100%; aspect-ratio: 16 / 9; border: 0; }.ai-video figcaption { display: flex; justify-content: space-between; gap: 12px; padding: 11px 13px; color: #cfd8e7; font-family: var(--font-mono); font-size: 10px; background: #182230; }.ai-video a { color: #fff; font-weight: 700; text-decoration: none; }.ai-video-note, .ai-video-reflection { margin-top: 22px; padding: 15px 16px; background: #f2f5ff; border-left: 3px solid var(--ai-violet); }.ai-video-note b, .ai-video-reflection b { color: var(--ai-violet); font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }.ai-video-note p, .ai-video-reflection p { margin: 7px 0 0; color: #384558; font-family: var(--font-reading); font-size: 15px; line-height: 1.5; }.ai-video-reflection { max-width: 720px; background: #f8fafc; border-left-color: var(--ai-blue); }.ai-video-reflection b { color: var(--ai-blue); }.ai-video-reflection small { display: block; margin-top: 11px; color: var(--ai-muted); font-size: 12px; line-height: 1.45; }.ai-stack-forward-enter-active, .ai-stack-forward-leave-active, .ai-stack-backward-enter-active, .ai-stack-backward-leave-active { transition: transform 360ms var(--ai-ease), opacity 360ms var(--ai-ease), filter 360ms var(--ai-ease); }.ai-stack-forward-leave-active, .ai-stack-backward-leave-active { position: absolute; inset: 0; z-index: 1; pointer-events: none; }.ai-stack-forward-enter-from { opacity: 0; transform: translate3d(28px, 0, 0) scale(.985); filter: saturate(.88); }.ai-stack-forward-leave-to { opacity: 0; transform: translate3d(-18px, 0, 0) scale(.976); filter: saturate(.82); }.ai-stack-backward-enter-from { opacity: 0; transform: translate3d(-28px, 0, 0) scale(.985); filter: saturate(.88); }.ai-stack-backward-leave-to { opacity: 0; transform: translate3d(18px, 0, 0) scale(.976); filter: saturate(.82); }
	@media (max-width: 760px) { .ai-player__bar { grid-template-columns: 1fr auto auto; gap: 10px; min-height: 54px; padding: 0 14px; }.ai-player__identity p, .ai-player__progress { display: none; }.ai-player__steps { justify-self: end; }.ai-player__stage { width: min(100% - 22px, 620px); min-height: calc(100dvh - 54px); padding-top: 14px; }.ai-player__meta { margin-bottom: 9px; font-size: 9px; }.ai-screen { min-height: calc(100dvh - 102px); padding: 25px 18px; border-radius: 7px; }.ai-screen-stack::before { inset: 7px 8px -6px; border-radius: 7px; }.ai-screen--cover { display: block; padding: 0; }.ai-cover { min-height: 250px; }.ai-cover__copy { padding: 30px 21px 32px; }.ai-screen h1 { font-size: 34px; }.ai-cover__copy > p:last-child, .ai-lead, .ai-prose { font-size: 16px; line-height: 1.55; }.ai-objectives, .ai-media-layout, .summary-layout, .ai-video-layout { display: grid; grid-template-columns: 1fr; }.ai-objectives { gap: 9px; margin-top: 22px; }.ai-objectives li { min-height: 68px; padding-top: 14px; padding-bottom: 14px; }.ai-media-layout, .summary-layout, .ai-video-layout { gap: 22px; }.ai-figure { order: -1; }.ai-figure img { max-height: 260px; }.ai-video { order: -1; }.ai-video-note { margin-top: 18px; }.choice-grid, .safeguard-grid { grid-template-columns: 1fr; }.timeline-card, .prediction-card { padding: 19px; }.timeline-card p, .prediction-card__context { font-size: 16px; }.ai-screen__continue { padding-top: 20px; }.ai-screen__continue button { width: 100%; }.source-list { margin-top: 18px; } }
	/* Real evidence is framed by Paper Signal; it is not replaced by it. */
	.ai-cover > img { display:block; width:100%; height:100%; object-fit:cover; object-position:center; }.ai-figure--evidence { background:var(--ai-paper); border:1px solid var(--ai-line); box-shadow:12px 12px 0 #dbe7f6; }.ai-figure--evidence > img { display:block; width:100%; min-height:260px; max-height:390px; object-fit:cover; object-position:center; filter:saturate(.94) contrast(1.02); }.ai-figure--evidence figcaption { position:relative; border-top:1px solid var(--ai-line); }.ai-figure--evidence figcaption::before { content:'EVIDENCE'; display:block; margin-bottom:5px; color:var(--ai-blue); font-family:var(--font-mono); font-size:9px; font-weight:700; letter-spacing:.08em; }@media (max-width:760px) { .ai-figure--evidence > img { min-height:0; aspect-ratio:16 / 10; max-height:none; } }
	/* Graceful course travel: words, not arrow glyphs; a patient stack that never races the learner. */
	.ai-player__exit::before { content: none; }.ai-player__progress b { transition-duration: var(--dur-mid); }.ai-player__steps button { width: auto; min-width: 52px; height: 30px; padding: 0 10px; font-family: var(--font-ui); font-size: 11px; transition: transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }.ai-player__steps button:hover:not(:disabled) { transform: translateY(-1px); }.ai-screen__continue button { transition-duration: var(--dur-fast); }.ai-screen__status { align-self: flex-end; margin: 20px 0 -12px; color: var(--ai-muted); font-family: var(--font-reading); font-size: 14px; }.ai-stack-forward-enter-active, .ai-stack-forward-leave-active, .ai-stack-backward-enter-active, .ai-stack-backward-leave-active { transition-duration: 520ms; transition-timing-function: cubic-bezier(.22, .82, .32, 1); }.ai-screen-stack::before { transition: transform 520ms cubic-bezier(.22, .82, .32, 1), opacity 520ms cubic-bezier(.22, .82, .32, 1); }.ai-screen-stack--forward::before { transform: translate3d(-8px, 3px, 0) rotate(.35deg); }.ai-screen-stack--backward::before { transform: translate3d(8px, 3px, 0) rotate(-.35deg); }
	@media (max-width: 760px) { .ai-player__steps button { min-width: 48px; padding: 0 8px; font-size: 10px; }.ai-screen__status { align-self: stretch; margin: 18px 0 -10px; text-align: center; } }
	@media (prefers-reduced-motion: reduce) { .ai-stack-forward-enter-active, .ai-stack-forward-leave-active, .ai-stack-backward-enter-active, .ai-stack-backward-leave-active, .ai-screen-stack::before { transition: none !important; }.ai-player *, .ai-player *::before, .ai-player *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; } }
</style>
<style scoped>
/* Motion-design choreography: the hero card leads, depth layers counter-shift, then the reading surface settles. */
.ai-screen-stack::after { position: absolute; inset: 16px 22px -14px; z-index: -1; content: ''; background: #d9e1ef; border: 1px solid #cbd7e8; border-radius: 10px; opacity: .72; transition: transform 560ms cubic-bezier(.22, .78, .2, 1), opacity 440ms cubic-bezier(.22, .78, .2, 1); }
.ai-stack-forward-enter-active, .ai-stack-backward-enter-active { z-index: 3; transition: transform 560ms cubic-bezier(.22, .78, .2, 1), opacity 560ms cubic-bezier(.22, .78, .2, 1), filter 560ms cubic-bezier(.22, .78, .2, 1); }
.ai-stack-forward-leave-active, .ai-stack-backward-leave-active { position: absolute; inset: 0; z-index: 1; pointer-events: none; transition: transform 390ms cubic-bezier(.56, .05, .82, .4), opacity 390ms cubic-bezier(.56, .05, .82, .4), filter 390ms cubic-bezier(.56, .05, .82, .4); }
.ai-stack-forward-enter-from { opacity: 0; transform: translate3d(30px, 0, 0) scale(.986); filter: saturate(.88) blur(.3px); }.ai-stack-forward-enter-to, .ai-stack-backward-enter-to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: none; }.ai-stack-forward-leave-to { opacity: 0; transform: translate3d(-20px, 0, 0) scale(.978); filter: saturate(.84); }
.ai-stack-backward-enter-from { opacity: 0; transform: translate3d(-30px, 0, 0) scale(.986); filter: saturate(.88) blur(.3px); }.ai-stack-backward-leave-to { opacity: 0; transform: translate3d(20px, 0, 0) scale(.978); filter: saturate(.84); }
.ai-stack-forward-enter-active > * { animation: ai-stack-content-forward 430ms cubic-bezier(.22, .78, .2, 1) 120ms both; }.ai-stack-backward-enter-active > * { animation: ai-stack-content-backward 430ms cubic-bezier(.22, .78, .2, 1) 120ms both; }
.ai-screen-stack--forward::before { transform: translate3d(-10px, 5px, 0) rotate(.5deg); }.ai-screen-stack--forward::after { transform: translate3d(-5px, 8px, 0) rotate(.18deg); }.ai-screen-stack--backward::before { transform: translate3d(10px, 5px, 0) rotate(-.5deg); }.ai-screen-stack--backward::after { transform: translate3d(5px, 8px, 0) rotate(-.18deg); }
@keyframes ai-stack-content-forward { from { opacity: .42; transform: translateX(8px); } to { opacity: 1; transform: none; } } @keyframes ai-stack-content-backward { from { opacity: .42; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ai-stack-forward-enter-active, .ai-stack-forward-leave-active, .ai-stack-backward-enter-active, .ai-stack-backward-leave-active, .ai-screen-stack::before, .ai-screen-stack::after { transition: none !important; }.ai-stack-forward-enter-active > *, .ai-stack-backward-enter-active > * { animation: none !important; } }
</style>
