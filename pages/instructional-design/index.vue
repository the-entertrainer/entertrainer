<script setup lang="ts">
/**
 * Compact instructional-design player
 * Design contract: one short teaching purpose per screen. Each screen carries a
 * single explanation, visual, or practice moment; navigation is screen-level,
 * saved locally, and never exposes a kilometre-long scrolling lesson.
 */
useSeoMeta({
  title: 'Introduction to Instructional Design · Entertrainer',
  description: 'A compact beginner e-learning module about planning learning experiences that help people do real work, starting with the task rather than the course.',
  ogTitle: 'Introduction to Instructional Design · Entertrainer',
  ogDescription: 'A beginner e-learning module for planning learning experiences that help people do real work. Start with the need, then work out the support.',
  ogUrl: 'https://entertrainer.in/instructional-design'
})

type SortBucket = 'learning' | 'environment'

const STORAGE_KEY = 'entertrainer-instructional-design-screens-v2'
const screenIndex = ref(0)
const furthestIndex = ref(0)
const screenHeading = ref<HTMLElement | null>(null)
const motionDirection = ref<'forward' | 'backward'>('forward')

const startingChoice = ref<string | null>(null)
const learnerChoice = ref<string | null>(null)
const objectiveChoice = ref<string | null>(null)
const artifactChoice = ref<string | null>(null)
const scenarioChoice = ref<string | null>(null)
const finalChoice = ref<string | null>(null)
const finalSubmitted = ref(false)
const sortChoices = ref<Record<string, SortBucket | null>>({ checklist: null, skill: null, equipment: null, procedure: null })
const matchingAnswers = ref<Record<string, string | null>>({ analysis: null, design: null, evaluation: null })
const matchingSubmitted = ref(false)
const activeAddie = ref('analysis')
const gameIndex = ref(0)
const gameChoice = ref<string | null>(null)
const gameSubmitted = ref(false)
const gameComplete = ref(false)

const evidenceMedia = {
  hero: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/sHIaqHUyLPpHlXwn.jpg',
  collaboration: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/kxDxXEUdsOGXhYBN.jpeg',
  learnerContext: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/bcdzCJyXARgsjUzg.jpeg',
  blooms: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/SjxuvaLcEiNASJWC.png'
} as const

const screens = [
  { lesson: 'Welcome', label: 'Start', title: 'Introduction to Instructional Design' },
  { lesson: 'Welcome', label: 'Objectives', title: 'What you should be able to do by the end' },
  { lesson: 'Lesson 1 · Understand the need', label: 'The request', title: 'A request is a starting point, not a solution' },
  { lesson: 'Lesson 1 · Understand the need', label: 'Cause check', title: 'Find the real cause' },
  { lesson: 'Lesson 1 · Understand the need', label: 'Learner lens', title: 'Understand the learner and the context' },
  { lesson: 'Lesson 2 · Plan the learning', label: 'ADDIE in practice', title: 'Use ADDIE as a map for the work' },
  { lesson: 'Lesson 2 · Plan the learning', label: 'Route Builder', title: 'Build one learning route that works in the real world' },
  { lesson: 'Lesson 2 · Plan the learning', label: 'Alignment', title: 'Connect objective, practice, and evidence' },
  { lesson: 'Lesson 2 · Plan the learning', label: 'Design artefacts', title: 'Make useful things' },
  { lesson: 'Lesson 3 · Apply the method', label: 'Design decision', title: 'Make one sound design decision' },
  { lesson: 'Lesson 3 · Apply the method', label: 'Stage match', title: 'Check the design language' },
  { lesson: 'Lesson 3 · Apply the method', label: 'Final check', title: 'What is instructional design?' },
  { lesson: 'Close', label: 'Takeaway', title: 'Start with the real task' }
]

const addieStages = [
  { id: 'analysis', letter: 'A', title: 'Analyse', lead: 'Understand the problem before deciding that the answer is a course.', example: 'Observe two closing shifts. Ask where mistakes happen and what gets in the way.', output: 'A short problem statement and learner notes.' },
  { id: 'design', letter: 'D', title: 'Design', lead: 'Plan what learners will do, not only what they will read.', example: 'Write one objective, choose a short demonstration, and plan a safe practice task.', output: 'An objective, activity plan, and evidence plan.' },
  { id: 'development', letter: 'D', title: 'Develop', lead: 'Make the materials and test a small version.', example: 'Create a one-page job aid, a short course, and a practice scenario.', output: 'A reviewable prototype.' },
  { id: 'implementation', letter: 'I', title: 'Implement', lead: 'Put the learning support into the real setting.', example: 'Give new staff time, equipment, and support to complete the practice.', output: 'A practical delivery plan.' },
  { id: 'evaluation', letter: 'E', title: 'Evaluate', lead: 'Use evidence to decide what should change. The loop is the point.', example: 'Check the practice result, then see whether staff can complete the closing task on shift.', output: 'A revision decision and follow-up support.' }
]

const sortItems = [
  { id: 'checklist', title: 'The closing checklist is missing.', detail: 'Staff already know the steps, but each shift has a different printed list.', answer: 'environment' as const },
  { id: 'skill', title: 'New staff cannot explain the cleaning sequence.', detail: 'They have the right equipment and a clear process, but need guided practice.', answer: 'learning' as const },
  { id: 'equipment', title: 'The sanitising solution is often unavailable.', detail: 'Staff know the procedure but cannot complete it when the supply cabinet is empty.', answer: 'environment' as const },
  { id: 'procedure', title: 'Staff can do the task but make the same mistake in a new situation.', detail: 'They need practice deciding what to do when the usual routine changes.', answer: 'learning' as const }
]

const matchingPrompts = [
  { id: 'analysis', label: 'Analyse', answer: 'needs' },
  { id: 'design', label: 'Design', answer: 'plan' },
  { id: 'evaluation', label: 'Evaluate', answer: 'improve' }
]

const matchingChoices = [
  { id: 'needs', label: 'Find the learner and task need' },
  { id: 'plan', label: 'Plan the objective, activity, and evidence' },
  { id: 'improve', label: 'Use evidence to improve the support' }
]

const gameRounds = [
  {
    stage: 'Analyse',
    prompt: 'New staff miss cleaning steps when the counter is busy. What is the best first move?',
    hint: 'Do not choose a solution until you know what the work and the constraint look like.',
    choices: [
      { id: 'observe', label: 'Watch two busy closing shifts and ask staff where the step breaks down.', correct: true },
      { id: 'video', label: 'Record a long video explaining every cleaning product.', correct: false },
      { id: 'quiz', label: 'Build a quiz before speaking to anyone who does the work.', correct: false }
    ],
    feedback: 'Analyse first. Observe the work and speak with the people doing it before deciding whether training, a job aid, or a work-environment change will help.'
  },
  {
    stage: 'Design',
    prompt: 'Staff know the steps but forget the order during a rush. Which design choice is most useful?',
    hint: 'Support should help people perform the real task, not only read about it.',
    choices: [
      { id: 'practice', label: 'Plan a short counter-side checklist and a coached practice run during a quiet period.', correct: true },
      { id: 'slides', label: 'Add more definitions to a presentation about food safety.', correct: false },
      { id: 'poster', label: 'Print a poster that says “Remember the correct order.”', correct: false }
    ],
    feedback: 'Design connects the task, the learner, and the practice. A usable checklist plus a safe practice opportunity helps staff perform the actual sequence.'
  },
  {
    stage: 'Evaluate',
    prompt: 'The checklist and practice have been used for one week. What evidence should you check next?',
    hint: 'Look for evidence that the support changed real performance.',
    choices: [
      { id: 'evidence', label: 'Review whether the cleaning steps are completed correctly on later busy shifts.', correct: true },
      { id: 'colour', label: 'Ask whether the checklist uses a more attractive colour.', correct: false },
      { id: 'length', label: 'Count the number of screens in the short course.', correct: false }
    ],
    feedback: 'Evaluate with evidence from the work. Check whether the support improves performance, then revise what is not helping.'
  }
]

const currentScreen = computed(() => screens[screenIndex.value])
const progress = computed(() => Math.round((furthestIndex.value / (screens.length - 1)) * 100))
const activeStage = computed(() => addieStages.find((stage) => stage.id === activeAddie.value) ?? addieStages[0])
const activeGameRound = computed(() => gameRounds[Math.min(gameIndex.value, gameRounds.length - 1)])
const chosenGameOption = computed(() => activeGameRound.value.choices.find((option) => option.id === gameChoice.value))
const gameCorrect = computed(() => chosenGameOption.value?.correct === true)
const sortComplete = computed(() => sortItems.every((item) => Boolean(sortChoices.value[item.id])))
const sortCorrect = computed(() => sortItems.every((item) => sortChoices.value[item.id] === item.answer))
const matchingComplete = computed(() => matchingPrompts.every((item) => Boolean(matchingAnswers.value[item.id])))
const matchingCorrect = computed(() => matchingPrompts.every((item) => matchingAnswers.value[item.id] === item.answer))
const screenReady = computed(() => {
  const index = screenIndex.value
  if ([0, 1, 5, 12].includes(index)) return true
  if (index === 2) return Boolean(startingChoice.value)
  if (index === 3) return sortComplete.value
  if (index === 4) return Boolean(learnerChoice.value)
  if (index === 6) return gameComplete.value
  if (index === 7) return Boolean(objectiveChoice.value)
  if (index === 8) return Boolean(artifactChoice.value)
  if (index === 9) return Boolean(scenarioChoice.value)
  if (index === 10) return matchingSubmitted.value
  if (index === 11) return finalSubmitted.value
  return false
})
const continueLabel = computed(() => {
  if (screenIndex.value === screens.length - 1) return 'Restart'
  return 'Continue'
})
const startingFeedback = computed(() => startingChoice.value === 'investigate'
  ? 'First, find out what the task looks like, what staff already know, and what is causing the error.'
  : startingChoice.value ? 'Not yet. A checklist or video may be useful later. First, gather evidence about the task, the people doing it, and the cause of the problem. Do not build the answer before meeting the problem.' : '')
const learnerFeedback = computed(() => learnerChoice.value === 'time'
  ? 'Correct. Time, access, language, confidence, and real working conditions change what learning support is possible.'
  : learnerChoice.value ? 'Look for information about the learner and real work. Decorative choices and screen count do not explain whether people can use the task.' : '')
const objectiveFeedback = computed(() => objectiveChoice.value === 'strong'
  ? 'Correct. This objective names an observable action, the situation, and the standard for successful performance.'
  : objectiveChoice.value ? 'Try again. “Understand” and “learn about” do not tell us what a learner must demonstrate.' : '')
const artifactFeedback = computed(() => artifactChoice.value === 'storyboard'
  ? 'Correct. A storyboard makes the learning route reviewable before expensive build work begins.'
  : artifactChoice.value ? 'Not yet. More screens or a poster may carry information, but they do not show how a learner will practise the required decision.' : '')
const scenarioFeedback = computed(() => scenarioChoice.value === 'observe'
  ? 'Correct. The report tells you there is a problem. It does not yet tell you why. Observe the work and speak with the people who do it before proposing training.'
  : scenarioChoice.value ? 'This may be useful later, but it skips the evidence step. Start by finding the cause of the problem.' : '')
const finalFeedback = computed(() => finalChoice.value === 'process'
  ? 'Correct. Instructional design connects a real need, the learner, the activity, and evidence of learning. The screen is only one possible part of that work.'
  : finalChoice.value ? 'Not yet. Screens and quizzes may be useful tools. The work begins earlier: understand the need, plan the support, and use evidence to improve it.' : '')

function saveProgress() {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    screenIndex: screenIndex.value,
    furthestIndex: furthestIndex.value,
    startingChoice: startingChoice.value,
    learnerChoice: learnerChoice.value,
    objectiveChoice: objectiveChoice.value,
    artifactChoice: artifactChoice.value,
    scenarioChoice: scenarioChoice.value,
    finalChoice: finalChoice.value,
    finalSubmitted: finalSubmitted.value,
    sortChoices: sortChoices.value,
    matchingAnswers: matchingAnswers.value,
    matchingSubmitted: matchingSubmitted.value,
    gameIndex: gameIndex.value,
    gameChoice: gameChoice.value,
    gameSubmitted: gameSubmitted.value,
    gameComplete: gameComplete.value,
    activeAddie: activeAddie.value
  }))
}

function moveTo(index: number) {
  if (index < 0 || index > furthestIndex.value) return
  motionDirection.value = index < screenIndex.value ? 'backward' : 'forward'
  screenIndex.value = index
}

function continueScreen() {
  if (!screenReady.value) return
  if (screenIndex.value === screens.length - 1) {
    furthestIndex.value = screens.length - 1
    saveProgress()
    return
  }
  const next = screenIndex.value + 1
  motionDirection.value = 'forward'
  furthestIndex.value = Math.max(furthestIndex.value, next)
  screenIndex.value = next
  saveProgress()
}

function selectSort(id: string, bucket: SortBucket) {
  sortChoices.value[id] = bucket
}

function selectMatch(promptId: string, choiceId: string) {
  matchingAnswers.value[promptId] = choiceId
  matchingSubmitted.value = false
}

function submitMatching() {
  if (matchingComplete.value) matchingSubmitted.value = true
}

function selectGameChoice(id: string) {
  if (!gameSubmitted.value) gameChoice.value = id
}

function submitGameTurn() {
  if (gameChoice.value) gameSubmitted.value = true
}

function continueGame() {
  if (!gameSubmitted.value) return
  if (!gameCorrect.value) {
    gameChoice.value = null
    gameSubmitted.value = false
    return
  }
  if (gameIndex.value === gameRounds.length - 1) {
    gameComplete.value = true
    saveProgress()
    return
  }
  gameIndex.value += 1
  gameChoice.value = null
  gameSubmitted.value = false
}

function submitFinal() {
  if (finalChoice.value) finalSubmitted.value = true
}

watch(screenIndex, async () => {
  saveProgress()
  await nextTick()
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  screenHeading.value?.focus({ preventScroll: true })
})

watch([startingChoice, learnerChoice, objectiveChoice, artifactChoice, scenarioChoice, finalChoice, finalSubmitted, sortChoices, matchingAnswers, matchingSubmitted, gameIndex, gameChoice, gameSubmitted, gameComplete, activeAddie], saveProgress, { deep: true })

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const state = JSON.parse(saved)
    furthestIndex.value = typeof state.furthestIndex === 'number' ? Math.min(Math.max(state.furthestIndex, 0), screens.length - 1) : 0
    screenIndex.value = typeof state.screenIndex === 'number' ? Math.min(Math.max(state.screenIndex, 0), furthestIndex.value) : 0
    startingChoice.value = state.startingChoice ?? null
    learnerChoice.value = state.learnerChoice ?? null
    objectiveChoice.value = state.objectiveChoice ?? null
    artifactChoice.value = state.artifactChoice ?? null
    scenarioChoice.value = state.scenarioChoice ?? null
    finalChoice.value = state.finalChoice ?? null
    finalSubmitted.value = state.finalSubmitted === true
    sortChoices.value = { ...sortChoices.value, ...(state.sortChoices ?? {}) }
    matchingAnswers.value = { ...matchingAnswers.value, ...(state.matchingAnswers ?? {}) }
    matchingSubmitted.value = state.matchingSubmitted === true
    gameIndex.value = typeof state.gameIndex === 'number' ? Math.min(Math.max(state.gameIndex, 0), gameRounds.length - 1) : 0
    gameChoice.value = state.gameChoice ?? null
    gameSubmitted.value = state.gameSubmitted === true
    gameComplete.value = state.gameComplete === true
    activeAddie.value = addieStages.some((stage) => stage.id === state.activeAddie) ? state.activeAddie : 'analysis'
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
})

</script>

<template>
  <div class="compact-course">
    <header class="course-bar" aria-label="Course controls">
      <NuxtLink to="/learn" class="course-bar__back">All lessons</NuxtLink>
      <p>Introduction to Instructional Design</p>
      <div class="course-bar__progress" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="progress"><i><b :style="{ width: `${progress}%` }" /></i><span aria-hidden="true">{{ progress }}%</span></div>
      <nav class="course-bar__steps" aria-label="Screen navigation"><button type="button" :disabled="screenIndex === 0" aria-label="Back" @click="moveTo(screenIndex - 1)">Back</button><span>{{ screenIndex + 1 }} / {{ screens.length }}</span><button type="button" :disabled="screenIndex >= furthestIndex || screenIndex === screens.length - 1" aria-label="Continue" @click="moveTo(screenIndex + 1)">Continue</button></nav>
    </header>

    <section class="course-stage">
      <div class="screen-meta"><span>{{ currentScreen.lesson }}</span><span>Screen {{ screenIndex + 1 }} of {{ screens.length }}</span></div>

      <div class="learning-screen-stack" :class="`learning-screen-stack--${motionDirection}`">
      <Transition :name="`learning-stack-${motionDirection}`">
      <article :key="screenIndex" class="learning-screen screen--enter" :class="{ 'learning-screen--hero': screenIndex === 0 }">
        <template v-if="screenIndex === 0">
          <div class="hero-visual"><img :src="evidenceMedia.hero" alt="Original Entertrainer course artwork showing a practical workplace learning context" /><span class="hero-route" aria-hidden="true"><i /><i /><i /><i /><i /></span></div>
          <div class="hero-copy"><p class="eyebrow">Beginner module · 15–20 minutes</p><h1 ref="screenHeading" tabindex="-1">Introduction to<br>Instructional Design</h1><p>Instructional design is the work of helping people learn to do something real. Start with the problem, understand the people, then build and improve the support.</p></div>
        </template>

        <template v-else-if="screenIndex === 1">
          <p class="eyebrow">Before you begin</p><h2 ref="screenHeading" tabindex="-1">By the end of this module, you will be able to:</h2>
          <ol class="objective-list"><li><b>Explain</b> instructional design in simple words and identify its purpose.</li><li><b>Recognise</b> the difference between a learning need and a non-learning problem.</li><li><b>Use</b> a simple five-step design cycle to plan a small learning experience.</li><li><b>Write</b> one clear learning objective that connects to activity and evidence.</li></ol><figure class="screen-visual visual-strip"><EdPaperSignal variant="route" label="Source notes becoming an organised plan and a completed output" /><figcaption>Notice the route: understand the work, plan practice, then check evidence.</figcaption></figure>
        </template>

        <template v-else-if="screenIndex === 2">
          <p class="eyebrow">Start with the work</p><h2 ref="screenHeading" tabindex="-1">A request is not yet a solution.</h2><p class="lead">A café manager says, “New staff are making mistakes at closing time. Please make a training course.” That is a useful starting point—not enough information to design good learning.</p><p class="callout"><b>Instructional design:</b> turn a real need into support people can understand, practise, and use.</p>
          <div class="case-context"><div class="case-card"><b>The situation</b><p>One person skips equipment cleaning. Another cannot find the checklist. A third has never been shown the sequence.</p></div><figure class="context-figure context-figure--evidence"><img :src="evidenceMedia.collaboration" alt="Adult learners collaborating with laptops at a shared worktable" /><figcaption><span>WORKPLACE CONTEXT</span>Real work always has people, tools, and constraints.</figcaption></figure></div>
          <section class="question-card"><p class="eyebrow">First decision</p><h3>What should happen first?</h3><button :aria-pressed="startingChoice === 'video'" :class="{ 'is-selected': startingChoice === 'video' }" @click="startingChoice = 'video'">Record a short video of the closing steps.</button><button :aria-pressed="startingChoice === 'checklist'" :class="{ 'is-selected': startingChoice === 'checklist' }" @click="startingChoice = 'checklist'">Write a new checklist immediately.</button><button :aria-pressed="startingChoice === 'investigate'" :class="{ 'is-selected': startingChoice === 'investigate' }" @click="startingChoice = 'investigate'">Observe the task and find out what is causing the errors.</button><p v-if="startingFeedback" class="feedback" role="status" aria-live="polite"><b>{{ startingChoice === 'investigate' ? 'Correct.' : 'Not yet.' }}</b> {{ startingFeedback }}</p></section>
        </template>

        <template v-else-if="screenIndex === 3">
          <p class="eyebrow">Find the cause</p><h2 ref="screenHeading" tabindex="-1">Not every problem needs training.</h2><p class="lead">Sort each café problem. Does learning support help, or is the work environment blocking success?</p>
          <div class="screen-split screen-split--activity"><div class="sort-grid"><article v-for="item in sortItems" :key="item.id"><h3>{{ item.title }}</h3><p>{{ item.detail }}</p><div><button :class="{ 'is-selected': sortChoices[item.id] === 'learning' }" @click="selectSort(item.id, 'learning')">Learning can help</button><button :class="{ 'is-selected': sortChoices[item.id] === 'environment' }" @click="selectSort(item.id, 'environment')">Fix the environment</button></div></article></div><figure class="screen-visual"><EdPaperSignal variant="evidence" label="Observation sheet with a checked item and simple result bars" /><figcaption>Different causes need different support. Training is only one possible answer.</figcaption></figure></div><p v-if="sortComplete" class="feedback"><b>{{ sortCorrect ? 'Correct.' : 'Review your choices.' }}</b> Good analysis checks skills, tools, time, guidance, and the working environment.</p>
        </template>

        <template v-else-if="screenIndex === 4">
          <p class="eyebrow">Know the learner</p><h2 ref="screenHeading" tabindex="-1">Before you teach, learn about the learner.</h2><p class="lead">People bring experience, prior knowledge, language, time limits, confidence, and different access to tools.</p>
          <figure class="wide-context-figure wide-context-figure--evidence"><img :src="evidenceMedia.learnerContext" alt="Adult learners working together with laptops in a technical learning setting" /><figcaption><span>LEARNER CONTEXT</span>Context matters: role, task, available time, and access to support all shape a useful learning experience.</figcaption></figure><div class="three-cues"><p><b>Role</b> What do they already know?</p><p><b>Task</b> What decisions and tools matter?</p><p><b>Context</b> What can stop them succeeding?</p></div><section class="question-card"><p class="eyebrow">Learner lens</p><h3>Which question gives a designer useful evidence?</h3><button :class="{ 'is-selected': learnerChoice === 'time' }" @click="learnerChoice = 'time'">How much uninterrupted time can a new team member realistically use for practice during a shift?</button><button :class="{ 'is-selected': learnerChoice === 'colour' }" @click="learnerChoice = 'colour'">Which background colour will make the course look most modern?</button><button :class="{ 'is-selected': learnerChoice === 'length' }" @click="learnerChoice = 'length'">How many screens can be added before the course feels comprehensive?</button><p v-if="learnerFeedback" class="feedback"><b>{{ learnerChoice === 'time' ? 'Correct.' : 'Look again.' }}</b> {{ learnerFeedback }}</p></section>
        </template>

        <template v-else-if="screenIndex === 5">
          <div class="screen-split"><div><h2 ref="screenHeading" tabindex="-1">Use ADDIE to think through the work.</h2><p class="lead"><b>ADDIE</b> means Analyse, Design, Develop, Implement, and Evaluate. It is a useful planning map, not a strict straight line.</p><div class="addie-map"><div v-for="(stage, index) in addieStages" :key="stage.id"><span>{{ stage.letter }}</span><b>{{ stage.title }}</b><i v-if="index < addieStages.length - 1">→</i></div></div><p class="callout">Evaluation sends evidence back to the beginning.</p></div><figure class="screen-visual"><EdPaperSignal variant="process" label="Three clear work stages flowing from notes to a verified output" /><figcaption>ADDIE is a practical workbench: each stage creates something useful.</figcaption></figure></div><div class="addie-tabs" role="tablist" aria-label="ADDIE stages"><button v-for="(stage, index) in addieStages" :key="stage.id" :id="`addie-tab-${stage.id}`" role="tab" :aria-selected="activeAddie === stage.id" :aria-controls="`addie-panel-${stage.id}`" :tabindex="activeAddie === stage.id ? 0 : -1" :class="{ 'is-active': activeAddie === stage.id }" @keydown.right.prevent="activeAddie = addieStages[(index + 1) % addieStages.length].id" @keydown.left.prevent="activeAddie = addieStages[(index + addieStages.length - 1) % addieStages.length].id" @keydown.home.prevent="activeAddie = addieStages[0].id" @keydown.end.prevent="activeAddie = addieStages[addieStages.length - 1].id" @click="activeAddie = stage.id"><span>{{ stage.letter }}</span>{{ stage.title}}</button></div><section :id="`addie-panel-${activeStage.id}`" class="stage-card" role="tabpanel" :aria-labelledby="`addie-tab-${activeStage.id}`"><div class="stage-output" :class="`stage-output--${activeStage.id}`" aria-hidden="true"><i /><i /><i /></div><div><p>{{ activeStage.letter }} · {{ activeStage.title }}</p><h3>{{ activeStage.lead }}</h3><p><b>In the café:</b> {{ activeStage.example }}</p><p><span>Useful output</span>{{ activeStage.output }}</p></div></section>
        </template>

        <template v-else-if="screenIndex === 6">
          <div class="game-top"><p class="eyebrow">Mini mobile game · Route Builder</p><span>{{ gameComplete ? '3 / 3 complete' : `${gameIndex + 1} / ${gameRounds.length}` }}</span></div><div class="game-title-row"><div><h2 ref="screenHeading" tabindex="-1">Build one useful learning route.</h2><p class="lead">Make one decision at a time. Each correct move shows how analysis, design, and evaluation connect to real work.</p></div><figure class="task-trail"><EdPaperSignal variant="route" label="Source notes becoming an organised plan and final work output" /><figcaption>Follow the route from task to evidence.</figcaption></figure></div>
          <template v-if="!gameComplete"><p class="game-stage"><b>{{ activeGameRound.stage }}</b> Choose the next best move</p><p class="game-prompt">{{ activeGameRound.prompt }}</p><details><summary>Hint <span>+</span></summary><p>{{ activeGameRound.hint }}</p></details><div class="game-choices"><button v-for="choice in activeGameRound.choices" :key="choice.id" :disabled="gameSubmitted" :aria-pressed="gameChoice === choice.id" :class="{ 'is-selected': gameChoice === choice.id, 'is-correct': gameSubmitted && choice.correct, 'is-incorrect': gameSubmitted && gameChoice === choice.id && !choice.correct }" @click="selectGameChoice(choice.id)">{{ choice.label }}</button></div><p v-if="gameSubmitted" class="feedback" role="status" aria-live="polite"><b>{{ gameCorrect ? 'Good decision.' : 'Try again.' }}</b> {{ gameCorrect ? activeGameRound.feedback : 'Return to the hint. Start with evidence, support a real performance, or check whether performance improved.' }}</p><button class="game-action" :disabled="!gameChoice" @click="gameSubmitted ? continueGame() : submitGameTurn()">{{ gameSubmitted ? (gameCorrect ? 'Continue' : 'Choose again') : 'Check' }}</button></template><p v-else class="feedback" role="status" aria-live="polite"><b>Route complete.</b> You used analysis to understand the task, design to plan support, and evaluation to check the result.</p>
        </template>

        <template v-else-if="screenIndex === 7">
          <p class="eyebrow">Alignment</p><h2 ref="screenHeading" tabindex="-1">A clear objective connects the course.</h2><p class="lead">An objective says what a learner should be able to <b>do</b>. It guides the explanation, activity, and check for understanding.</p><div class="alignment"><div><span>1</span><b>Objective</b><p>What will the learner do?</p></div><i>→</i><div><span>2</span><b>Practice</b><p>How will they try it?</p></div><i>→</i><div><span>3</span><b>Evidence</b><p>How will we know?</p></div></div><figure class="alignment-visual alignment-visual--evidence"><img :src="evidenceMedia.blooms" alt="Bloom’s taxonomy diagram showing observable learning outcomes" /><figcaption><span>CITED REFERENCE · MIT DIGITAL LEARNING TOOLKIT</span>Observable objectives help connect practice and evidence.</figcaption></figure><p class="callout"><b>Worked example:</b> “After observing the counter setup, complete the six closing steps in the correct order using the checklist.”</p><section class="question-card"><p class="eyebrow">Objective check</p><h3>Which objective is strongest?</h3><div class="objective-cue" aria-hidden="true"><span>Observe</span><i>→</i><span>Do</span><i>→</i><span>Check</span></div><button :class="{ 'is-selected': objectiveChoice === 'vague' }" @click="objectiveChoice = 'vague'">Understand the café closing procedure.</button><button :class="{ 'is-selected': objectiveChoice === 'strong' }" @click="objectiveChoice = 'strong'">After observing the counter setup, complete the six closing steps in the correct order using the checklist.</button><button :class="{ 'is-selected': objectiveChoice === 'topic' }" @click="objectiveChoice = 'topic'">Learn about safe café closing.</button><p v-if="objectiveFeedback" class="feedback"><b>{{ objectiveChoice === 'strong' ? 'Correct.' : 'Try again.' }}</b> {{ objectiveFeedback }}</p></section>
        </template>

        <template v-else-if="screenIndex === 8">
          <div class="screen-split"><figure><EdPaperSignal variant="project" label="Three story-board frames and a drawing pencil" /><figcaption>Instructional design produces useful work objects, not only course screens.</figcaption></figure><div><p class="eyebrow">Useful artefacts</p><h2 ref="screenHeading" tabindex="-1">What does a designer actually make?</h2><p class="lead">The answer depends on the problem. A course can be one part of the solution.</p><ul class="artifact-list"><li><b>Learner notes</b> record what people need.</li><li><b>A storyboard</b> plans a learning route.</li><li><b>A job aid</b> supports the task at the moment it is done.</li><li><b>Evaluation notes</b> show what needs to change.</li></ul></div></div><section class="question-card"><p class="eyebrow">Artefact choice</p><h3>Choose the right planning artefact.</h3><button :class="{ 'is-selected': artifactChoice === 'storyboard' }" @click="artifactChoice = 'storyboard'">A short storyboard showing the explanation, decision point, practice, and feedback before production begins.</button><button :class="{ 'is-selected': artifactChoice === 'longer' }" @click="artifactChoice = 'longer'">A longer slide deck that repeats the policy in several fonts.</button><button :class="{ 'is-selected': artifactChoice === 'poster' }" @click="artifactChoice = 'poster'">A poster that asks learners to remember the policy without practice.</button><p v-if="artifactFeedback" class="feedback"><b>{{ artifactChoice === 'storyboard' ? 'Correct.' : 'Not yet.' }}</b> {{ artifactFeedback }}</p></section>
        </template>

        <template v-else-if="screenIndex === 9">
          <p class="eyebrow">Apply the method</p><h2 ref="screenHeading" tabindex="-1">Make one sound design decision.</h2><p class="lead">Closing mistakes happen most often on busy Fridays. Before building learning material, what should you do next?</p><figure class="wide-context-figure scenario-visual"><EdPaperSignal variant="profile" label="Annotated work plan and a practical task card on a working desk" /><figcaption>Look for the conditions that change performance: time pressure, tools, guidance, and the real sequence of work.</figcaption></figure><div class="scenario-list"><button :class="{ 'is-selected': scenarioChoice === 'video' }" @click="scenarioChoice = 'video'"><span>A</span><b>Film a five-minute training video.</b><small>It may help later, but you do not know the cause yet.</small></button><button :class="{ 'is-selected': scenarioChoice === 'observe' }" @click="scenarioChoice = 'observe'"><span>B</span><b>Observe a busy Friday closing shift and talk with staff.</b><small>Find out what changes under pressure and what support is missing.</small></button><button :class="{ 'is-selected': scenarioChoice === 'test' }" @click="scenarioChoice = 'test'"><span>C</span><b>Give every staff member a final test.</b><small>A test can check learning later; it cannot explain the problem now.</small></button></div><p v-if="scenarioFeedback" class="feedback"><b>{{ scenarioChoice === 'observe' ? 'Correct.' : 'Not yet.' }}</b> {{ scenarioFeedback }}</p>
        </template>

        <template v-else-if="screenIndex === 10">
          <p class="eyebrow">Stage match</p><h2 ref="screenHeading" tabindex="-1">Match each design stage to its purpose.</h2><p class="lead">Match each design action to its purpose.</p><div class="mini-sequence" aria-hidden="true"><span class="mini-sequence__note" /><i>→</i><span class="mini-sequence__plan" /><i>→</i><span class="mini-sequence__evidence" /></div><figure class="visual-strip"><EdPaperSignal variant="evidence" label="Reviewed observation sheet with a completion mark and result bars" /><figcaption>Practice improves when feedback returns to the real task while it still matters.</figcaption></figure><div class="match-list"><section v-for="prompt in matchingPrompts" :key="prompt.id"><h3>{{ prompt.label }}</h3><div><button v-for="choice in matchingChoices" :key="choice.id" :class="{ 'is-selected': matchingAnswers[prompt.id] === choice.id }" @click="selectMatch(prompt.id, choice.id)">{{ choice.label }}</button></div></section></div><button class="game-action" :disabled="!matchingComplete" @click="submitMatching">Check matches</button><p v-if="matchingSubmitted" class="feedback"><b>{{ matchingCorrect ? 'Correct.' : 'Review the matches.' }}</b> {{ matchingCorrect ? 'Analysis identifies the need, Design plans learning, and Evaluation tells you what to improve.' : 'Look for the purpose of each stage, not only the tool used inside it.' }}</p>
        </template>

        <template v-else-if="screenIndex === 11">
          <div class="screen-split"><div><p class="eyebrow">Final check</p><h2 ref="screenHeading" tabindex="-1">Which statement best describes instructional design?</h2><div class="question-card"><button :class="{ 'is-selected': finalChoice === 'screens' }" @click="finalChoice = 'screens'">It is the process of making attractive e-learning screens.</button><button :class="{ 'is-selected': finalChoice === 'process' }" @click="finalChoice = 'process'">It is a systematic way to understand a learning need, plan support, create it, and improve it using evidence.</button><button :class="{ 'is-selected': finalChoice === 'quiz' }" @click="finalChoice = 'quiz'">It is a way to test whether learners remember facts at the end of a course.</button><button class="game-action" :disabled="!finalChoice" @click="submitFinal">Submit answer</button><p v-if="finalSubmitted" class="feedback"><b>{{ finalChoice === 'process' ? 'Correct.' : 'Not yet.' }}</b> {{ finalFeedback }}</p></div></div><figure class="screen-visual"><EdPaperSignal variant="process" label="Three defined work stages moving toward a verified outcome" /><figcaption>Instructional design connects need, support, practice, and evidence in one improvement loop.</figcaption></figure></div>
        </template>

        <template v-else>
          <div class="screen-split"><div><p class="eyebrow">Key takeaway</p><h2 ref="screenHeading" tabindex="-1">Start with the real task.</h2><p class="lead">Find the real task. Understand the people doing it. Decide what successful performance looks like. Give learners a way to practise. Then use evidence to make the support better.</p><div class="completion-card"><EdSignalIcon name="check" /><p><b>Small first step:</b> when someone asks for a course, ask: “What should people be able to do differently after this?”</p></div></div><figure class="screen-visual close-visual"><EdPaperSignal variant="route" label="Source material, a planning board, and a completed output note" /></figure></div><details class="source-panel"><summary>Sources and media credits <span>+</span></summary><ol><li><a href="https://www.td.org/talent-development-glossary-terms/what-is-instructional-design" target="_blank" rel="noreferrer">Association for Talent Development — What is Instructional Design?</a></li><li><a href="https://dltoolkit.mit.edu/online-course-design-guide/pre-design/learner-analysis/" target="_blank" rel="noreferrer">MIT Digital Learning Toolkit — Learner Analysis</a></li><li><a href="https://www.uwb.edu/it/addie" target="_blank" rel="noreferrer">University of Washington Bothell — ADDIE Model</a></li><li><a href="https://edtechbooks.org/id/task_and_content_analysis" target="_blank" rel="noreferrer">EdTech Books — Task Analysis</a></li><li><a href="https://www.cdc.gov/training-development/php/about/evaluate-training-measuring-effectiveness.html" target="_blank" rel="noreferrer">CDC — Evaluate Training</a></li><li>Paper Signal illustrations are original Entertrainer learning graphics.</li></ol></details>
        </template>
      </article>
      </Transition>
      </div>

    </section>
  </div>
</template>

<style scoped>
/* Compact player: this file deliberately prevents long, multi-section course pages. */
.compact-course { --blue: #315fc7; --ink: #252a33; --muted: #657080; --rule: #dbe1e9; --paper: #fff; --blue-soft: #edf2ff; --accent-text: #8A6500; --accent-ink: #161618; --ease: cubic-bezier(.16, 1, .3, 1); min-height: 100vh; padding-bottom: 1.75rem; color: var(--ink); background: #f6f7f9; }
.course-bar { position: sticky; z-index: 8; top: 0; display: grid; grid-template-columns: 1fr auto 1fr auto; align-items: center; gap: 1rem; min-height: 3.625rem; padding: 0 max(1.25rem, calc((100vw - 70rem) / 2)); color: var(--muted); background: rgb(255 255 255 / 94%); border-bottom: 1px solid #e5e8ed; backdrop-filter: blur(12px); font-family: var(--font-ui); font-size: 0.75rem; }
  .course-bar__back { display:inline-flex; align-items:center; min-height:2rem; color:inherit; text-decoration:none; }.course-bar__back::before { content: '← '; }.course-bar__back:hover { color: var(--accent-text); }.course-bar > p { margin:0; color:var(--ink); font-weight:700; }.course-bar__progress { justify-self:end; display:flex; align-items:center; gap:0.5rem; font-family:var(--font-mono); font-size:0.75rem; }.course-bar__progress i { width:4.5rem; height:0.25rem; overflow:hidden; background:#e4e8ee; border-radius:62.4375rem; }.course-bar__progress b { display:block; height:100%; background:var(--blue); border-radius:inherit; transition:width 240ms var(--ease); }.course-bar__steps { display:flex; align-items:center; gap:0.4375rem; font-family:var(--font-mono); font-size:0.75rem; }.course-bar__steps button { display:grid; place-items:center; min-width:2.75rem; min-height:2.75rem; padding:0 0.625rem; color: var(--accent-text); background:#fff; border:1px solid #d5dde8; border-radius:0.1875rem; font:700 0.9375rem var(--font-ui); cursor:pointer; }.course-bar__steps button:disabled { color:#c5cbd5; cursor:not-allowed; }
.course-stage { width: min(100% - 2rem, 60rem); margin: 0 auto; padding-top: clamp(1.5rem, 5vh, 3.125rem); }.screen-meta { display: flex; justify-content: space-between; gap: 1.125rem; margin-bottom: 0.8125rem; color: var(--blue); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.learning-screen { min-height: min(43.125rem, calc(100vh - 10.625rem)); padding: clamp(1.6875rem, 5vw, 3.625rem); background: var(--paper); border: 1px solid #e1e5ea; border-top: 0.25rem solid var(--blue); border-radius: 0.625rem; box-shadow: 0 1.25rem 2.625rem rgb(30 45 74 / 7%); }.learning-screen--hero { display: grid; grid-template-columns: 1.05fr .95fr; padding: 0; overflow: hidden; background: #f4f2ee; border: 0; }.hero-visual img { display: block; width: 100%; height: 100%; object-fit: cover; }.hero-copy { display: flex; flex-direction: column; justify-content: center; padding: clamp(2.125rem, 6vw, 4.6875rem); }.eyebrow { margin: 0 0 0.8125rem; color: var(--accent-text); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }.learning-screen h1, .learning-screen h2 { max-width: 15ch; margin: 0; font-family: var(--font-ui); font-size: clamp(2.125rem, 5vw, 3.5625rem); letter-spacing: -.06em; line-height: 1.02; }.learning-screen h2 { font-size: clamp(1.75rem, 4.1vw, 2.625rem); }.hero-copy > p:last-child, .lead { max-width: 58ch; margin: 1.3125rem 0 0; color: #424a55; font-family: var(--font-reading); font-size: 1.125rem; line-height: 1.58; }
.objective-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8125rem 1.25rem; margin: 1.8125rem 0 0; padding: 0; list-style: none; }.objective-list li { position: relative; padding: 1rem 1rem 1rem 2.8125rem; background: #f5f7fc; border: 1px solid #dce5f8; border-radius: 0.375rem; font-family: var(--font-ui); font-size: 0.875rem; line-height: 1.45; }.objective-list li::before { content: counter(list-item); position: absolute; top: 1rem; left: 0.9375rem; display: grid; place-items: center; width: 1.25rem; height: 1.25rem; color: var(--accent-ink); background: var(--blue); border-radius: 50%; font-family: var(--font-mono); font-size: 0.75rem; }
.case-card, .callout, .completion-card { max-width: 42.5rem; margin-top: 1.5625rem; padding: 1.1875rem 1.3125rem; color: #39475b; background: #f3f6fd; border-left: 0.1875rem solid var(--blue); font-family: var(--font-reading); font-size: 1rem; line-height: 1.55; }.case-card b { color: var(--accent-text); font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: .06em; text-transform: uppercase; }.case-card p, .callout p, .completion-card p { margin: 0.375rem 0 0; }.callout { background: #f8f9fb; border-color: #8fa5d7; }.completion-card { display: grid; grid-template-columns: 2rem 1fr; gap: 0.75rem; margin-top: 1.75rem; color: #244332; background: #edf8f1; border-color: #2f8b5d; }.completion-card > span { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; color: #fff; background: #2f8b5d; border-radius: 50%; font-family: var(--font-ui); font-weight: 700; }
.question-card { max-width: 43.125rem; margin-top: 1.6875rem; padding: 1.5625rem; background: #f8fafc; border: 1px solid var(--rule); border-radius: 0.5rem; }.question-card h3 { max-width: 36ch; margin: 0 0 1.0625rem; font-family: var(--font-ui); font-size: 1.3125rem; letter-spacing: -.03em; line-height: 1.24; }.question-card > button, .game-choices button, .match-list button { display: block; width: 100%; min-height: 3.3125rem; margin-top: 0.5625rem; padding: 0.75rem 0.9375rem; color: #303842; background: #fff; border: 1px solid #cfd6df; border-radius: 0.3125rem; font-family: var(--font-ui); font-size: 0.875rem; font-weight: 600; line-height: 1.38; text-align: left; cursor: pointer; transition: transform 140ms var(--ease), border-color 140ms var(--ease), background 140ms var(--ease), color 140ms var(--ease); }.question-card > button:hover, .game-choices button:hover:not(:disabled), .match-list button:hover { border-color: var(--blue); color: var(--accent-text); transform: translateY(-0.0625rem); }.question-card > button.is-selected, .game-choices button.is-selected, .match-list button.is-selected, .scenario-list button.is-selected, .sort-grid button.is-selected { color: var(--accent-ink); background: var(--blue); border-color: var(--blue); }.feedback { max-width: 42.5rem; margin: 1.125rem 0 0; padding: 0.875rem 1rem; color: #244332; background: #edf8f1; border-left: 0.1875rem solid #2f8b5d; font-family: var(--font-ui); font-size: 0.875rem; line-height: 1.5; }
.screen-split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: clamp(1.625rem, 6vw, 4rem); }.screen-split figure { margin: 0; overflow: hidden; background: #eef0f3; border-radius: 0.4375rem; }.screen-split figure img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }.screen-split figure figcaption { padding: 0.625rem 0.75rem; color: var(--muted); background: #fff; font-family: var(--font-ui); font-size: 0.75rem; line-height: 1.4; }.screen-split--objective { align-items: stretch; margin-top: 1.5625rem; }.screen-split--objective .question-card { margin-top: 0; }.screen-split--objective figure img { object-fit: contain; background: #fff; }
.sort-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8125rem; margin-top: 1.75rem; }.sort-grid article { padding: 1.125rem; background: #f8fafc; border: 1px solid var(--rule); border-radius: 0.4375rem; }.sort-grid h3 { margin: 0; font-family: var(--font-ui); font-size: 0.9375rem; line-height: 1.32; }.sort-grid p { margin: 0.5rem 0 0; color: var(--muted); font-family: var(--font-reading); font-size: 0.875rem; line-height: 1.45; }.sort-grid article > div { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4375rem; margin-top: 0.9375rem; }.sort-grid button { min-height: 2.625rem; padding: 0.5rem; background: #fff; border: 1px solid #cfd6df; border-radius: 0.25rem; font-family: var(--font-ui); font-size: 0.75rem; font-weight: 700; line-height: 1.25; cursor: pointer; }
.three-cues { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 1.75rem; }.three-cues p { margin: 0; padding: 1.125rem; background: #f5f7fb; border-top: 0.1875rem solid var(--blue); font-family: var(--font-reading); font-size: 0.9375rem; line-height: 1.48; }.three-cues b { display: block; margin-bottom: 0.375rem; color: var(--accent-text); font-family: var(--font-ui); }
.addie-map { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-top: 2.1875rem; padding: 1.625rem 1rem; background: #f5f7fb; border: 1px solid #dce4f1; border-radius: 0.5rem; }.addie-map > div { position: relative; display: grid; flex: 1; justify-items: center; gap: 0.5rem; text-align: center; }.addie-map span { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; color: var(--accent-ink); background: var(--blue); border-radius: 50%; font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700; }.addie-map b { font-family: var(--font-ui); font-size: 0.75rem; }.addie-map i { position: absolute; top: 0.5625rem; right: -0.5rem; color: #3e5278; font-style: normal; }.addie-tabs { display: flex; flex-wrap: wrap; gap: 0.4375rem; margin-top: 1.875rem; }.addie-tabs button { display: inline-flex; align-items: center; gap: 0.4375rem; min-height: 2.3125rem; padding: 0.4375rem 0.6875rem; color: #536276; background: #f7f8fa; border: 1px solid #dce1e8; border-radius: 62.4375rem; font-family: var(--font-ui); font-size: 0.75rem; font-weight: 700; cursor: pointer; }.addie-tabs button span { display: grid; place-items: center; width: 1.125rem; height: 1.125rem; color: inherit; border: 1px solid currentColor; border-radius: 50%; font-family: var(--font-mono); font-size: 0.75rem; }.addie-tabs button.is-active { color: var(--accent-ink); background: var(--blue); border-color: var(--blue); }.stage-card { max-width: 42.5rem; margin-top: 1.125rem; padding: 1.5625rem; background: #f5f7fb; border-left: 0.1875rem solid var(--blue); }.stage-card > p { margin: 0.9375rem 0 0; color: #3d4651; font-family: var(--font-reading); font-size: 1rem; line-height: 1.5; }.stage-card > p:first-child { margin: 0; color: var(--accent-text); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }.stage-card h3 { max-width: 28ch; margin: 0.625rem 0 0; font-family: var(--font-ui); font-size: 1.4375rem; letter-spacing: -.03em; line-height: 1.2; }.stage-card > p:last-child { padding-top: 0.875rem; border-top: 1px solid #d9e1ef; }.stage-card > p:last-child span { display: block; margin-bottom: 0.3125rem; color: var(--accent-text); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.game-top { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }.game-top .eyebrow { margin: 0; }.game-top > span { padding: 0.3125rem 0.5rem; color: #45609b; background: #e8efff; border-radius: 62.4375rem; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }.game-stage { display: flex; align-items: center; gap: 0.5625rem; margin: 1.75rem 0 0; font-family: var(--font-ui); font-size: 0.8125rem; font-weight: 700; }.game-stage b { padding: 0.3125rem 0.5625rem; color: var(--accent-ink); background: var(--blue); border-radius: 62.4375rem; font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: .05em; text-transform: uppercase; }.game-prompt { max-width: 60ch; margin: 0.9375rem 0 0; font-family: var(--font-reading); font-size: 1.0625rem; line-height: 1.55; }.learning-screen details { max-width: 42.5rem; margin-top: 1.125rem; border-top: 1px solid #dae1ed; border-bottom: 1px solid #dae1ed; }.learning-screen summary { display: flex; justify-content: space-between; min-height: 2.8125rem; align-items: center; font-family: var(--font-ui); font-size: 0.8125rem; font-weight: 700; cursor: pointer; list-style: none; }.learning-screen summary::-webkit-details-marker { display: none; }.learning-screen details p { margin: 0 0 0.875rem; color: var(--muted); font-family: var(--font-reading); font-size: 0.9375rem; line-height: 1.5; }.game-choices { display: grid; gap: 0.5625rem; max-width: 43.75rem; margin-top: 1.1875rem; }.game-choices button { min-height: 3.75rem; }.game-choices button.is-correct { color: #244332; background: #edf8f1; border-color: #2f8b5d; }.game-choices button.is-incorrect { color: #813f3f; background: #fff4f4; border-color: #bd5757; }.game-choices button:disabled { cursor: default; }.game-action, .next-button { display: inline-flex; align-items: center; justify-content: center; gap: 0.5625rem; min-height: 2.9375rem; margin-top: 1.1875rem; padding: 0 1.0625rem; color: var(--accent-ink); background: var(--blue); border: 0; border-radius: 0.3125rem; font-family: var(--font-ui); font-size: 0.8125rem; font-weight: 700; cursor: pointer; transition: transform 140ms var(--ease), background 140ms var(--ease), opacity 140ms var(--ease); }.game-action:hover:not(:disabled), .next-button:hover:not(:disabled) { background: #274fa9; transform: translateY(-0.0625rem); }.game-action:disabled, .next-button:disabled { opacity: .42; cursor: not-allowed; }
.alignment { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; gap: 0.75rem; margin-top: 2rem; padding: 1.5625rem; background: #f5f7fb; border: 1px solid #dce4f1; border-radius: 0.5rem; }.alignment > div { text-align: center; }.alignment span { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; margin: 0 auto 0.5rem; color: var(--accent-ink); background: var(--blue); border-radius: 50%; font-family: var(--font-mono); font-size: 0.75rem; }.alignment b { font-family: var(--font-ui); font-size: 0.875rem; }.alignment p { margin: 0.375rem 0 0; color: var(--muted); font-family: var(--font-reading); font-size: 0.8125rem; line-height: 1.35; }.alignment i { color: #3e5278; font-style: normal; }.artifact-list { margin: 1.375rem 0 0; padding: 0; list-style: none; }.artifact-list li { margin-top: 0.6875rem; padding-left: 1.0625rem; color: #414b57; font-family: var(--font-reading); font-size: 0.9375rem; line-height: 1.42; border-left: 0.125rem solid #90a5d6; }.artifact-list b { font-family: var(--font-ui); }.scenario-list { display: grid; gap: 0.625rem; max-width: 45rem; margin-top: 1.75rem; }.scenario-list button { display: grid; grid-template-columns: 1.75rem 1fr; column-gap: 0.8125rem; padding: 1.0625rem; background: #f8fafc; border: 1px solid var(--rule); border-radius: 0.4375rem; text-align: left; cursor: pointer; }.scenario-list span { grid-row: span 2; display: grid; place-items: center; width: 1.625rem; height: 1.625rem; color: var(--accent-text); background: #e7edfc; border-radius: 50%; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }.scenario-list b { font-family: var(--font-ui); font-size: 0.9375rem; }.scenario-list small { margin-top: 0.3125rem; color: var(--muted); font-family: var(--font-reading); font-size: 0.8125rem; line-height: 1.4; }.scenario-list button.is-selected span { color: var(--accent-text); background: #fff; }.match-list { display: grid; gap: 0.75rem; max-width: 45.625rem; margin-top: 1.5625rem; }.match-list section { display: grid; grid-template-columns: 6.875rem 1fr; gap: 0.875rem; align-items: start; padding: 0.9375rem; background: #f8fafc; border: 1px solid var(--rule); border-radius: 0.4375rem; }.match-list h3 { margin: 0.5rem 0 0; font-family: var(--font-ui); font-size: 0.9375rem; }.match-list section > div { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4375rem; }.match-list button { min-height: 2.875rem; margin: 0; padding: 0.5rem; font-size: 0.75rem; }
.screen-controls { display: flex; justify-content: space-between; gap: 0.75rem; margin-top: 1.125rem; }.back-button { min-height: 2.9375rem; padding: 0 0.9375rem; color: #4f5d70; background: transparent; border: 1px solid #cfd6df; border-radius: 0.3125rem; font-family: var(--font-ui); font-size: 0.8125rem; font-weight: 700; cursor: pointer; }.back-button:disabled { opacity: .35; cursor: not-allowed; }.next-button { margin-top: 0; }.screen-navigator { margin-top: 1.5625rem; background: #fff; border: 1px solid #e0e4ea; border-radius: 0.4375rem; }.screen-navigator summary { display: flex; align-items: center; justify-content: space-between; min-height: 3.1875rem; padding: 0 1.125rem; color: #3a4657; font-family: var(--font-ui); font-size: 0.8125rem; font-weight: 700; cursor: pointer; list-style: none; }.screen-navigator summary::-webkit-details-marker { display: none; }.screen-navigator summary span { color: var(--muted); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 500; }.screen-navigator > div { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4375rem; padding: 0 0.875rem 0.875rem; }.screen-navigator button { display: flex; gap: 0.5rem; align-items: center; min-height: 2.375rem; padding: 0.4375rem; color: #556276; background: #f8fafc; border: 1px solid #e0e5ec; border-radius: 0.25rem; font-family: var(--font-ui); font-size: 0.75rem; text-align: left; cursor: pointer; }.screen-navigator button span { color: var(--accent-text); font-family: var(--font-mono); font-size: 0.75rem; }.screen-navigator button.is-current { color: var(--accent-ink); background: var(--blue); border-color: var(--blue); }.screen-navigator button.is-current span { color: #fff; }.screen-navigator button:disabled { color: #a2a9b3; background: #fafafa; cursor: not-allowed; }
.source-panel { padding-top: 1rem; }.source-panel ol { padding-left: 1.25rem; }.source-panel li { margin-top: 0.5rem; font-family: var(--font-reading); font-size: 0.875rem; line-height: 1.42; }.source-panel a { color: var(--accent-text); }
.hero-visual { position: relative; overflow: hidden; }.hero-route { position: absolute; right: 1.1875rem; bottom: 1.375rem; display: flex; align-items: center; gap: 0.6875rem; height: 1.625rem; padding: 0 0.6875rem; background: rgb(255 255 255 / 88%); border-radius: 62.4375rem; box-shadow: 0 0.375rem 1rem rgb(32 44 72 / 14%); }.hero-route::before { content: ''; position: absolute; right: 1rem; left: 1rem; top: 0.75rem; height: 0.125rem; background: var(--blue); transform: scaleX(0); transform-origin: left; animation: route-draw 900ms 380ms var(--ease) both; }.hero-route i { position: relative; z-index: 1; display: block; width: 0.4375rem; height: 0.4375rem; background: #fff; border: 0.125rem solid var(--blue); border-radius: 50%; animation: stop-pop 320ms var(--ease) both; }.hero-route i:nth-child(2) { animation-delay: 500ms; }.hero-route i:nth-child(3) { animation-delay: 610ms; }.hero-route i:nth-child(4) { animation-delay: 720ms; }.hero-route i:nth-child(5) { animation-delay: 830ms; background: #6b5cf6; border-color: #6b5cf6; }.screen-visual, .wide-context-figure, .context-figure, .task-trail, .alignment-visual { margin: 0; overflow: hidden; background: #eef0f3; border-radius: 0.4375rem; box-shadow: 0 0.625rem 1.5rem rgb(30 45 74 / 8%); }.screen-visual img, .wide-context-figure img, .context-figure img, .task-trail img, .alignment-visual img { display: block; width: 100%; object-fit: cover; }.screen-visual figcaption, .wide-context-figure figcaption, .context-figure figcaption, .task-trail figcaption, .alignment-visual figcaption { padding: 0.5625rem 0.6875rem; color: var(--muted); background: #fff; font-family: var(--font-ui); font-size: 0.75rem; line-height: 1.42; }.visual-strip { max-width: 45.625rem; margin-top: 1.5rem; }.visual-strip img { aspect-ratio: 16 / 5; }.case-context { display: grid; grid-template-columns: 1.25fr .75fr; align-items: end; gap: 1.125rem; max-width: 50.625rem; margin-top: 1.375rem; }.case-context .case-card { margin-top: 0; }.context-figure img { aspect-ratio: 4 / 3; }.wide-context-figure { max-width: 48.75rem; margin-top: 1.5625rem; }.wide-context-figure img { aspect-ratio: 16 / 6; }.screen-split--activity { align-items: stretch; margin-top: 1.625rem; }.screen-split--activity .sort-grid { margin-top: 0; }.screen-split--activity .screen-visual { align-self: stretch; }.screen-split--activity .screen-visual img { height: calc(100% - 2.6875rem); object-fit: cover; }
.stage-card { display: grid; grid-template-columns: 9.375rem 1fr; gap: 1.5rem; max-width: 47.5rem; }.stage-card p { margin: 0.9375rem 0 0; color: #3d4651; font-family: var(--font-reading); font-size: 1rem; line-height: 1.5; }.stage-card p:first-child { margin: 0; color: var(--accent-text); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }.stage-card p:last-child { padding-top: 0.875rem; border-top: 1px solid #d9e1ef; }.stage-card p:last-child span { display: block; margin-bottom: 0.3125rem; color: var(--accent-text); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }.stage-output { position: relative; min-height: 9rem; overflow: hidden; background: #eaf0ff; border: 1px solid #d2dff8; border-radius: 0.375rem; }.stage-output::before { content: ''; position: absolute; width: 6.875rem; height: 5rem; left: 1.1875rem; bottom: 1rem; background: #fffdf8; border: 0.125rem solid var(--blue); border-radius: 0.25rem; transform: rotate(-6deg); }.stage-output i { position: absolute; z-index: 1; display: block; border-radius: 50%; }.stage-output i:nth-child(1) { width: 1.75rem; height: 1.75rem; left: 1.6875rem; top: 1.5rem; background: #6b5cf6; }.stage-output i:nth-child(2) { width: 2.625rem; height: 0.5rem; right: 1.0625rem; top: 2.1875rem; background: #efbd37; border-radius: 62.4375rem; }.stage-output i:nth-child(3) { width: 1.125rem; height: 1.125rem; right: 1.6875rem; bottom: 1.6875rem; background: var(--blue); }.stage-output--design::before { transform: rotate(5deg); border-style: dashed; }.stage-output--development::before { background: #fff; box-shadow: 0.75rem -0.625rem 0 #dce7ff; }.stage-output--implementation::before { border-radius: 50% 50% 0.25rem 0.25rem; }.stage-output--evaluation::before { border-color: #2f8b5d; }.stage-output--evaluation i:nth-child(3) { background: #2f8b5d; }
.game-title-row { display: grid; grid-template-columns: 1fr 11.25rem; align-items: center; gap: 1.5rem; }.task-trail { align-self: stretch; }.task-trail img { height: 9.25rem; object-fit: cover; }.alignment-visual { max-width: 45rem; margin-top: 0.9375rem; }.alignment-visual img { aspect-ratio: 16 / 4; }.objective-cue { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.875rem; color: var(--accent-text); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }.objective-cue span { padding: 0.3125rem 0.4375rem; background: #e9effd; border-radius: 62.4375rem; }.objective-cue i { color: #6b5cf6; font-style: normal; }.scenario-visual { max-width: 45rem; }.scenario-visual img { aspect-ratio: 16 / 5; object-position: center 42%; }.mini-sequence { display: flex; align-items: center; gap: 0.6875rem; width: max-content; margin: 1.25rem 0 0; padding: 0.625rem 0.875rem; background: #f5f7fb; border: 1px solid #dce4f1; border-radius: 62.4375rem; }.mini-sequence span { display: block; width: 1.5rem; height: 1.5rem; background: #fffdf8; border: 0.125rem solid var(--blue); border-radius: 0.25rem; }.mini-sequence__plan { transform: rotate(-5deg); border-style: dashed !important; }.mini-sequence__evidence { border-color: #2f8b5d !important; border-radius: 50% !important; }.mini-sequence i { color: #6b5cf6; font-style: normal; }.close-visual img { aspect-ratio: 4 / 3; }
@keyframes route-draw { to { transform: scaleX(1); } } @keyframes stop-pop { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } } @keyframes visual-settle { from { opacity: 0; transform: translateY(0.75rem) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }.screen-visual, .wide-context-figure, .context-figure, .task-trail, .alignment-visual { animation: visual-settle 600ms 80ms var(--ease) both; }
.screen--enter { animation: screen-in 420ms var(--ease) both; }.screen--enter > :not(.hero-visual) { animation: screen-content-in 380ms var(--ease) both; }.screen--enter > :nth-child(2) { animation-delay: 45ms; }.screen--enter > :nth-child(3) { animation-delay: 85ms; }@keyframes screen-in { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }@keyframes screen-content-in { from { opacity: 0; transform: translateY(0.625rem); } to { opacity: 1; transform: translateY(0); } }
button:focus-visible, summary:focus-visible, a:focus-visible { outline: 0.1875rem solid #efbd37; outline-offset: 0.1875rem; } @media (prefers-reduced-motion: reduce) { .screen--enter, .screen--enter > *, .screen-visual, .wide-context-figure, .context-figure, .task-trail, .alignment-visual, .hero-route::before, .hero-route i { animation: none !important; transform: none !important; } * { scroll-behavior: auto !important; } }
@media (max-width: 760px) { .course-bar { grid-template-columns: 1fr auto; min-height: 3.25rem; padding: 0 1rem; }.course-bar > p { display: none; }.course-bar__progress { grid-column: 2; }.course-stage { width: min(100% - 1.5rem, 36.25rem); padding-top: 1.125rem; }.screen-meta { margin-bottom: 0.625rem; font-size: 0.75rem; }.learning-screen { min-height: auto; padding: 1.5rem 1.125rem 1.6875rem; }.learning-screen--hero { display: block; }.hero-visual { height: 14.6875rem; }.hero-copy { padding: 1.875rem 1.3125rem 2.1875rem; }.learning-screen h1 { font-size: 2.625rem; }.learning-screen h2 { font-size: 1.875rem; }.hero-copy > p:last-child, .lead { font-size: 1rem; }.objective-list, .sort-grid, .three-cues, .screen-split, .case-context, .game-title-row { grid-template-columns: 1fr; }.objective-list { gap: 0.625rem; }.screen-split figure { order: -1; }.screen-split--objective figure { order: 0; }.case-context .context-figure, .task-trail, .screen-split--activity .screen-visual { display: none; }.visual-strip img { aspect-ratio: 16 / 7; }.sort-grid article > div { grid-template-columns: 1fr 1fr; }.addie-map { gap: 0.3125rem; padding: 1.125rem 0.4375rem; }.addie-map span { width: 1.75rem; height: 1.75rem; font-size: 0.75rem; }.addie-map b { font-size: 0.75rem; }.addie-map i { top: 0.375rem; right: -0.3125rem; font-size: 0.75rem; }.stage-card { grid-template-columns: 1fr; gap: 1rem; }.stage-output { min-height: 6rem; }.stage-output::before { bottom: 0.625rem; }.alignment { grid-template-columns: 1fr; gap: 0.375rem; }.alignment i { transform: rotate(90deg); text-align: center; }.alignment-visual img { aspect-ratio: 16 / 7; }.match-list section { grid-template-columns: 1fr; gap: 0.5rem; }.match-list h3 { margin: 0; }.match-list section > div { grid-template-columns: 1fr; }.screen-navigator > div { grid-template-columns: 1fr 1fr; }.learning-screen details { margin-top: 0.9375rem; }.game-choices button { min-height: 3.875rem; }.screen-controls { position: sticky; bottom: 0.5rem; z-index: 2; padding: 0.625rem; background: rgb(246 247 249 / 92%); backdrop-filter: blur(9px); }.back-button, .next-button { flex: 1; min-width: 0; padding: 0 0.625rem; }.next-button { font-size: 0.75rem; }.screen-navigator { margin-bottom: 1.25rem; } }
/* Graceful refinement: controls use clear words and screen arrivals give learners time to orient. */
.compact-course { --ease: cubic-bezier(.22, .82, .32, 1); }
.course-bar__back::before { content: none; }
.course-bar__progress b { transition-duration: var(--dur-mid); }
.course-bar__steps button { width: auto; min-width: 3.25rem; height: 1.875rem; padding: 0 0.625rem; font-family: var(--font-ui); font-size: 0.75rem; transition: transform var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease); }
.course-bar__steps button:hover:not(:disabled) { transform: translateY(-0.0625rem); }
.screen--enter { animation-duration: 700ms; }
.screen--enter > :not(.hero-visual) { animation-duration: 560ms; }
.screen--enter > :nth-child(2) { animation-delay: 90ms; }
.screen--enter > :nth-child(3) { animation-delay: 170ms; }
.question-card > button, .game-choices button, .match-list button, .game-action, .next-button { transition-duration: var(--dur-fast); }
@media (max-width: 760px) { .course-bar__steps button { min-width: 3rem; padding: 0 0.5rem; font-size: 0.75rem; } }
		/* Motion-design stack: the incoming screen leads, paper layers counter-shift, then content settles. */
		.learning-screen-stack { position: relative; isolation: isolate; }.learning-screen-stack::before, .learning-screen-stack::after { position: absolute; content: ''; border: 1px solid #d6deeb; border-radius: 0.625rem; pointer-events: none; }.learning-screen-stack::before { inset: 0.5625rem 0.8125rem -0.5rem; z-index: -1; background: #e5ebf6; }.learning-screen-stack::after { inset: 1rem 1.375rem -0.875rem; z-index: -2; background: #dce4f1; opacity: .7; }.learning-screen-stack::before, .learning-screen-stack::after { transition: transform 560ms cubic-bezier(.22, .78, .2, 1), opacity 440ms cubic-bezier(.22, .78, .2, 1); }.learning-screen { position: relative; z-index: 2; will-change: transform, opacity; }.learning-stack-forward-enter-active, .learning-stack-backward-enter-active { z-index: 3; transition: transform 560ms cubic-bezier(.22, .78, .2, 1), opacity 560ms cubic-bezier(.22, .78, .2, 1), filter 560ms cubic-bezier(.22, .78, .2, 1); }.learning-stack-forward-leave-active, .learning-stack-backward-leave-active { position: absolute; inset: 0; z-index: 1; pointer-events: none; transition: transform 390ms cubic-bezier(.56, .05, .82, .4), opacity 390ms cubic-bezier(.56, .05, .82, .4), filter 390ms cubic-bezier(.56, .05, .82, .4); }.learning-stack-forward-enter-from { opacity: 0; transform: translate3d(1.875rem, 0, 0) scale(.986); filter: saturate(.88) blur(0.01875rem); }.learning-stack-forward-enter-to, .learning-stack-backward-enter-to { opacity: 1; transform: none; filter: none; }.learning-stack-forward-leave-to { opacity: 0; transform: translate3d(-1.25rem, 0, 0) scale(.978); filter: saturate(.84); }.learning-stack-backward-enter-from { opacity: 0; transform: translate3d(-1.875rem, 0, 0) scale(.986); filter: saturate(.88) blur(0.01875rem); }.learning-stack-backward-leave-to { opacity: 0; transform: translate3d(1.25rem, 0, 0) scale(.978); filter: saturate(.84); }.learning-stack-forward-enter-active > * { animation: learning-stack-content-forward 430ms cubic-bezier(.22, .78, .2, 1) 120ms both; }.learning-stack-backward-enter-active > * { animation: learning-stack-content-backward 430ms cubic-bezier(.22, .78, .2, 1) 120ms both; }.learning-screen-stack--forward::before { transform: translate3d(-0.625rem, 0.3125rem, 0) rotate(.5deg); }.learning-screen-stack--forward::after { transform: translate3d(-0.3125rem, 0.5rem, 0) rotate(.18deg); }.learning-screen-stack--backward::before { transform: translate3d(0.625rem, 0.3125rem, 0) rotate(-.5deg); }.learning-screen-stack--backward::after { transform: translate3d(0.3125rem, 0.5rem, 0) rotate(-.18deg); }@keyframes learning-stack-content-forward { from { opacity: .42; transform: translateX(0.5rem); } to { opacity: 1; transform: none; } }@keyframes learning-stack-content-backward { from { opacity: .42; transform: translateX(-0.5rem); } to { opacity: 1; transform: none; } }
			@media (prefers-reduced-motion: reduce) { .screen--enter, .screen--enter > *, .learning-stack-forward-enter-active, .learning-stack-forward-leave-active, .learning-stack-backward-enter-active, .learning-stack-backward-leave-active, .learning-screen-stack::before, .learning-screen-stack::after { animation: none !important; transition: none !important; transform: none !important; } .learning-stack-forward-enter-active > *, .learning-stack-backward-enter-active > * { animation: none !important; } }
			/* Contextual Paper Signal media replaces former image tags without flattening each learning screen to one generic card. */
			.hero-visual :deep(.ps-art) { width:100%; height:100%; min-height:100%; }.screen-split figure :deep(.ps-art) { width:100%; min-height:0; aspect-ratio:4 / 3; }.screen-visual :deep(.ps-art), .wide-context-figure :deep(.ps-art), .context-figure :deep(.ps-art), .task-trail :deep(.ps-art), .alignment-visual :deep(.ps-art) { display:block; width:100%; min-height:0; }.visual-strip :deep(.ps-art) { aspect-ratio:16 / 5; }.context-figure :deep(.ps-art) { aspect-ratio:4 / 3; }.wide-context-figure :deep(.ps-art) { aspect-ratio:16 / 6; }.screen-split--activity .screen-visual :deep(.ps-art) { height:calc(100% - 2.6875rem); }.task-trail :deep(.ps-art) { height:9.25rem; }.alignment-visual :deep(.ps-art), .scenario-visual :deep(.ps-art) { aspect-ratio:16 / 4; }.close-visual :deep(.ps-art) { aspect-ratio:4 / 3; }
			.context-figure--evidence, .wide-context-figure--evidence, .alignment-visual--evidence { border:0.0625rem solid #d8e1ef; box-shadow:0.625rem 0.625rem 0 #e3edf9; }.context-figure--evidence img, .wide-context-figure--evidence img, .alignment-visual--evidence img { display:block; width:100%; object-fit:cover; filter:saturate(.92) contrast(1.02); }.alignment-visual--evidence img { object-fit:contain; background:#fff; }.context-figure--evidence figcaption span, .wide-context-figure--evidence figcaption span, .alignment-visual--evidence figcaption span { display:block; margin-bottom:0.3125rem; color: var(--accent-text); font-family:var(--font-mono); font-size:0.75rem; font-weight:700; letter-spacing:.08em; }
</style>
<style scoped>
/* Route Builder selection: high-contrast text remains readable on mobile and desktop. */
.game-choices button.is-selected:not(.is-correct):not(.is-incorrect), .question-card > button.is-selected:not(.is-correct):not(.is-incorrect), .match-list button.is-selected:not(.is-correct):not(.is-incorrect) { color:#17233b; background:#e8efff; border-color:var(--blue); box-shadow:inset 0.25rem 0 0 var(--blue); }
.game-choices button.is-selected:not(.is-correct):not(.is-incorrect)::first-line { color:#17233b; }
</style>
