<script setup lang="ts">
/**
 * Introduction to Instructional Design
 *
 * Course design reminder: this page follows a calm Rise-style learning canvas.
 * One idea is taught at a time, a visual or worked example does real explanatory
 * work, and every interaction follows explanation rather than interrupting it.
 */
useSeoMeta({
  title: 'Introduction to Instructional Design · Entertrainer',
  description: 'A beginner e-learning module that explains what instructional design is, why it matters, and how to make the first sound design decisions.',
  ogTitle: 'Introduction to Instructional Design · Entertrainer',
  ogDescription: 'A beginner e-learning module about planning learning experiences that help people do real work.',
  ogUrl: 'https://entertrainer.in/instructional-design'
})

type SortBucket = 'learning' | 'environment'

const STARTING_CHOICE = 'investigate'
const PROGRESSION_STORAGE_KEY = 'entertrainer-instructional-design-progress-v1'
const unlockedBlock = ref(0)
const completedBlocks = ref<string[]>([])
const startingChoice = ref<string | null>(null)
const sortChoices = ref<Record<string, SortBucket | null>>({
  checklist: null,
  skill: null,
  equipment: null,
  procedure: null
})
const activeAddie = ref('analysis')
const objectiveChoice = ref<string | null>(null)
const caseChoice = ref<string | null>(null)
const finalChoice = ref<string | null>(null)
const showFinalFeedback = ref(false)
const matchingAnswers = ref<Record<string, string | null>>({
  analysis: null,
  design: null,
  evaluation: null
})
const matchingSubmitted = ref(false)
const learnerContextChoice = ref<string | null>(null)
const artifactChoice = ref<string | null>(null)
const releasedSection = ref<string | null>(null)

const navItems = [
  { id: 'start', label: 'Start', block: 0 },
  { id: 'analyse', label: 'Understand the need', block: 2 },
  { id: 'design', label: 'Plan the learning', block: 6 },
  { id: 'apply', label: 'Try a design decision', block: 9 },
  { id: 'check', label: 'Check your understanding', block: 10 }
]

const blockPath = [
  { id: 'start', lesson: 'Introduction', title: 'Begin the module' },
  { id: 'objectives', lesson: 'Introduction', title: 'Review the learning objectives' },
  { id: 'need', lesson: 'Lesson 1', title: 'Start with the work' },
  { id: 'definition', lesson: 'Lesson 1', title: 'Define instructional design' },
  { id: 'cause', lesson: 'Lesson 1', title: 'Identify the real cause' },
  { id: 'learner', lesson: 'Lesson 1', title: 'Understand the learner' },
  { id: 'addie', lesson: 'Lesson 2', title: 'Use the ADDIE planning map' },
  { id: 'objective', lesson: 'Lesson 2', title: 'Connect objective, practice, and evidence' },
  { id: 'artefacts', lesson: 'Lesson 2', title: 'Review useful design artefacts' },
  { id: 'scenario', lesson: 'Lesson 3', title: 'Make a sound design decision' },
  { id: 'matching', lesson: 'Lesson 3', title: 'Match the design actions' },
  { id: 'closing', lesson: 'Lesson 3', title: 'Complete the module' }
]

const sectionAnchors: Record<string, string> = {
  start: 'start',
  objectives: 'objectives',
  need: 'analyse',
  definition: 'definition',
  cause: 'cause',
  learner: 'learner',
  addie: 'design',
  objective: 'objective',
  artefacts: 'artefacts',
  scenario: 'apply',
  matching: 'check',
  closing: 'closing'
}

const media = {
  hero: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/sHIaqHUyLPpHlXwn.jpg',
  analysis: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/CLHikwLahcffypTI.jpg',
  blooms: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/SjxuvaLcEiNASJWC.png',
  artifacts: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/ZKPOHGdqpXIWtQzC.jpg',
  adultCollaboration: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/kxDxXEUdsOGXhYBN.jpeg',
  technicalLearning: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/bcdzCJyXARgsjUzg.jpeg',
  performanceGap: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/kxDxXEUdsOGXhYBN.jpeg',
  storyboard: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/bcdzCJyXARgsjUzg.jpeg'
}

const learnerContextOptions = [
  { id: 'time', label: 'How much uninterrupted time can a new team member realistically use for practice during a shift?', correct: true },
  { id: 'colour', label: 'Which background colour will make the course look most modern?', correct: false },
  { id: 'length', label: 'How many screens can be added before the course feels comprehensive?', correct: false }
]
const artifactOptions = [
  { id: 'storyboard', label: 'A short storyboard showing the explanation, decision point, practice, and feedback before production begins.', correct: true },
  { id: 'longer', label: 'A longer slide deck that repeats the closing policy in several fonts.', correct: false },
  { id: 'poster', label: 'A poster that asks learners to remember the policy without a practice opportunity.', correct: false }
]

const sortItems = [
  {
    id: 'checklist',
    title: 'The closing checklist is missing.',
    detail: 'Staff already know the steps, but each shift has a different printed list.',
    answer: 'environment' as const
  },
  {
    id: 'skill',
    title: 'New staff cannot explain the cleaning sequence.',
    detail: 'They have the right equipment and a clear process, but need guided practice.',
    answer: 'learning' as const
  },
  {
    id: 'equipment',
    title: 'The sanitising solution is often unavailable.',
    detail: 'Staff know the procedure but cannot complete it when the supply cabinet is empty.',
    answer: 'environment' as const
  },
  {
    id: 'procedure',
    title: 'Staff can do the task but make the same mistake in a new situation.',
    detail: 'They need practice deciding what to do when the usual routine changes.',
    answer: 'learning' as const
  }
]

const addieStages = [
  {
    id: 'analysis',
    letter: 'A',
    title: 'Analyse',
    lead: 'Understand the problem before deciding to make a course.',
    example: 'Observe two closing shifts. Ask where mistakes happen and what gets in the way.',
    output: 'A short problem statement and learner notes.'
  },
  {
    id: 'design',
    letter: 'D',
    title: 'Design',
    lead: 'Plan what learners will do, not just what they will read.',
    example: 'Write one objective, choose a short demonstration, and plan a safe practice task.',
    output: 'An objective, activity plan, and evidence plan.'
  },
  {
    id: 'development',
    letter: 'D',
    title: 'Develop',
    lead: 'Make the materials and test a small version.',
    example: 'Create a one-page job aid, a short course, and a practice scenario.',
    output: 'A reviewable prototype.'
  },
  {
    id: 'implementation',
    letter: 'I',
    title: 'Implement',
    lead: 'Put the learning support into the real setting.',
    example: 'Give new staff time, equipment, and support to complete the practice.',
    output: 'A practical delivery plan.'
  },
  {
    id: 'evaluation',
    letter: 'E',
    title: 'Evaluate',
    lead: 'Use evidence to decide what should change.',
    example: 'Check the practice result, then see whether staff can complete the closing task on shift.',
    output: 'A revision decision and follow-up support.'
  }
]

const objectiveOptions = [
  { id: 'vague', text: 'Understand the café closing procedure.' },
  { id: 'strong', text: 'After observing the counter setup, complete the six closing steps in the correct order using the checklist.' },
  { id: 'topic', text: 'Learn about safe café closing.' }
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

const activeStageInfo = computed(() => addieStages.find((stage) => stage.id === activeAddie.value) ?? addieStages[0])
const startingFeedback = computed(() => {
  if (!startingChoice.value) return ''
  return startingChoice.value === STARTING_CHOICE
    ? 'Correct. First, find out what the task looks like, what staff already know, and what is causing the error. A course may help, but it is not the only possible answer.'
    : 'Not yet. A checklist, video, or meeting may be useful later. First, gather evidence about the task, the people doing it, and the cause of the problem.'
})
const objectiveFeedback = computed(() => {
  if (!objectiveChoice.value) return ''
  return objectiveChoice.value === 'strong'
    ? 'Correct. This objective names an observable action, the situation, and the standard for a successful performance.'
    : 'Try again. “Understand” and “learn about” do not tell us what a learner must be able to demonstrate.'
})
const caseFeedback = computed(() => {
  if (!caseChoice.value) return ''
  return caseChoice.value === 'observe'
    ? 'Correct. The shift report tells you there is a problem. It does not yet tell you why. Observe the work and speak with the people who do it before proposing training.'
    : 'This may be useful later, but it skips the evidence step. Start by finding the cause of the problem.'
})
const sortedCount = computed(() => Object.values(sortChoices.value).filter(Boolean).length)
const sortComplete = computed(() => sortedCount.value === sortItems.length)
const sortCorrect = computed(() => sortItems.every((item) => sortChoices.value[item.id] === item.answer))
const matchingCorrect = computed(() => matchingPrompts.every((prompt) => matchingAnswers.value[prompt.id] === prompt.answer))
const progress = computed(() => Math.round((completedBlocks.value.length / (blockPath.length - 1)) * 100))
const currentBlockInfo = computed(() => blockPath[Math.min(unlockedBlock.value, blockPath.length - 1)])
const nextBlockInfo = computed(() => blockPath[Math.min(unlockedBlock.value + 1, blockPath.length - 1)])
const courseComplete = computed(() => completedBlocks.value.includes('closing'))
const learnerContextFeedback = computed(() => {
  if (!learnerContextChoice.value) return ''
  return learnerContextChoice.value === 'time'
    ? 'Correct. Time, access, language, confidence, and real working conditions can change what learning support is possible.'
    : 'Look for information about the learner and the real work. Decorative choices and screen count do not explain whether people can learn and use the task.'
})
const artifactFeedback = computed(() => {
  if (!artifactChoice.value) return ''
  return artifactChoice.value === 'storyboard'
    ? 'Correct. A storyboard makes the learning route reviewable before expensive build work starts. It can connect explanation, activity, feedback, and the task.'
    : 'Not yet. More screens or a poster may carry information, but they do not show how a learner will practise the required decision or receive feedback.'
})

function chooseSort(itemId: string, bucket: SortBucket) {
  sortChoices.value[itemId] = bucket
}

function selectMatch(promptId: string, choiceId: string) {
  matchingAnswers.value[promptId] = choiceId
  matchingSubmitted.value = false
}

function submitMatching() {
  matchingSubmitted.value = matchingPrompts.every((prompt) => matchingAnswers.value[prompt.id])
}

function persistProgress() {
  if (!import.meta.client) return
  localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify({ unlockedBlock: unlockedBlock.value, completedBlocks: completedBlocks.value }))
}

function completeBlock(id: string, nextIndex: number) {
  if (!completedBlocks.value.includes(id)) completedBlocks.value = [...completedBlocks.value, id]
  unlockedBlock.value = Math.max(unlockedBlock.value, nextIndex)
  persistProgress()
  const targetId = sectionAnchors[blockPath[nextIndex]?.id]
  releasedSection.value = targetId ?? null
  nextTick(() => {
    const target = targetId ? document.getElementById(targetId) : null
    if (!target) return
    const heading = target.querySelector<HTMLElement>('h1, h2')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  })
}

function startModule() {
  completeBlock('start', 1)
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  const saved = localStorage.getItem(PROGRESSION_STORAGE_KEY)
  if (!saved) return
  try {
    const state = JSON.parse(saved)
    unlockedBlock.value = typeof state.unlockedBlock === 'number' ? Math.min(Math.max(state.unlockedBlock, 0), blockPath.length - 1) : 0
    completedBlocks.value = Array.isArray(state.completedBlocks) ? state.completedBlocks.filter((id: unknown) => typeof id === 'string') : []
  } catch {
    localStorage.removeItem(PROGRESSION_STORAGE_KEY)
  }
})
</script>

<template>
  <main class="course">
    <header class="course-bar" aria-label="Course navigation">
      <NuxtLink to="/lessons" class="course-bar__back">All lessons</NuxtLink>
      <p class="course-bar__title">Introduction to Instructional Design</p>
      <div class="course-bar__progress" aria-label="Course activity progress">
        <span class="course-bar__progress-track" aria-hidden="true"><i :style="{ width: `${progress}%` }" /></span>
        <span>{{ progress }}%</span>
      </div>
    </header>

    <section class="course-hero" id="start" aria-labelledby="course-title">
      <div class="course-hero__image-wrap">
        <img
          class="course-hero__image"
          :src="media.hero"
          alt="Three café employees reviewing a practical paper checklist together after a shift."
        >
      </div>
      <div class="course-hero__body">
        <p class="course-hero__eyebrow">Beginner module · 15–20 minutes</p>
        <h1 id="course-title">Introduction to<br>Instructional Design</h1>
        <p class="course-hero__deck">Instructional design is the work of helping people learn to do something real. Start with the problem, understand the people, then build and improve the support.</p>
        <button type="button" class="course-hero__start" @click="startModule">{{ unlockedBlock ? 'Resume the module' : 'Start the module' }} <span aria-hidden="true">↓</span></button>
      </div>
    </section>

    <nav class="course-sections" aria-label="Module sections">
      <button v-for="item in navItems" :key="item.id" type="button" :disabled="item.block > unlockedBlock" :class="{ 'is-locked': item.block > unlockedBlock }" @click="scrollToSection(item.id)">{{ item.label }}<span v-if="item.block > unlockedBlock" aria-hidden="true"> · locked</span></button>
    </nav>

    <div class="lesson-canvas">
      <aside class="progress-path" aria-live="polite">
        <span class="progress-path__number">{{ String(Math.min(unlockedBlock + 1, blockPath.length)).padStart(2, '0') }}</span>
        <div><b>{{ currentBlockInfo.lesson }}</b><p>Current block: {{ currentBlockInfo.title }}</p></div>
      </aside>

      <section v-if="unlockedBlock >= 1" id="objectives" class="lesson-section lesson-section--objectives unlock-block" :class="{ 'is-complete': completedBlocks.includes('objectives'), 'is-released': releasedSection === 'objectives' }" aria-labelledby="objectives-title">
        <p class="section-kicker">Before you begin</p>
        <h2 id="objectives-title">By the End of this module, you will be able to:</h2>
        <ol class="objective-list">
          <li><span>1</span><p><b>Explain</b> instructional design in simple words and identify its purpose.</p></li>
          <li><span>2</span><p><b>Recognise</b> the difference between a training need and a non-training problem.</p></li>
          <li><span>3</span><p><b>Use</b> a simple five-step design cycle to plan a small learning experience.</p></li>
          <li><span>4</span><p><b>Write</b> one clear learning objective that connects to an activity and a check for understanding.</p></li>
        </ol>
        <button v-if="!completedBlocks.includes('objectives')" type="button" class="continue-block" @click="completeBlock('objectives', 2)">Continue to Lesson 1 <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 2" id="analyse" class="lesson-section unlock-block" :class="{ 'is-complete': completedBlocks.includes('need'), 'is-released': releasedSection === 'analyse' }" aria-labelledby="request-title">
        <p class="section-kicker">1. Start with the work</p>
        <h2 id="request-title">A request is not yet a solution.</h2>
        <p>Imagine that a café manager says, “New staff are making mistakes at closing time. Please make a training course.”</p>
        <p>That is a useful starting point. It is not enough information to design a good course.</p>

        <aside class="case-brief" aria-label="Café closing case">
          <span class="case-brief__label">The situation</span>
          <p>Three new team members leave the counter in different states at the end of the day. One skips equipment cleaning. Another cannot find the closing checklist. A third has never been shown the sequence.</p>
        </aside>

        <figure class="course-figure course-figure--wide expansion-figure">
          <img :src="media.performanceGap" loading="lazy" alt="Adult learners collaborating with laptops and notes in a shared learning space.">
          <figcaption><b>Think before building.</b> Real analysis starts with people, their task, and the setting. The same visible error can have different causes: a missing resource, an unclear process, or a skill that needs practice.</figcaption>
        </figure>

        <aside class="fact-hook"><span aria-hidden="true">?</span><p><b>Useful fact:</b> A course is one possible response to a performance problem. If the right solution is a stocked supply cupboard or a findable checklist, training alone cannot solve the problem.</p></aside>

        <div class="knowledge-check" aria-labelledby="start-question">
          <p class="knowledge-check__type">Knowledge check</p>
          <h3 id="start-question">What should happen first?</h3>
          <div class="choice-list">
            <button type="button" :class="{ 'is-selected': startingChoice === 'video' }" @click="startingChoice = 'video'">Record a short video of the closing steps.</button>
            <button type="button" :class="{ 'is-selected': startingChoice === 'checklist' }" @click="startingChoice = 'checklist'">Write a new checklist immediately.</button>
            <button type="button" :class="{ 'is-selected': startingChoice === STARTING_CHOICE }" @click="startingChoice = STARTING_CHOICE">Observe the task and find out what is causing the errors.</button>
          </div>
          <p v-if="startingFeedback" class="feedback" role="status"><b>{{ startingChoice === STARTING_CHOICE ? 'Correct.' : 'Not yet.' }}</b> {{ startingFeedback.replace(/^(Correct\.|Not yet\.)\s*/, '') }}</p>
        </div>
        <button v-if="!completedBlocks.includes('need')" type="button" class="continue-block" :disabled="!startingChoice" @click="completeBlock('need', 3)">Continue to the definition <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 3" id="definition" class="lesson-section lesson-section--definition unlock-block" :class="{ 'is-complete': completedBlocks.includes('definition'), 'is-released': releasedSection === 'definition' }" aria-labelledby="definition-title">
        <div class="lesson-split">
          <div>
            <p class="section-kicker">What it is</p>
            <h2 id="definition-title">Instructional design plans learning for a real purpose.</h2>
            <p>It is a systematic way to create education or training that helps people build knowledge and skills they can use. It is not only about slides, videos, or an online course.</p>
            <p>An instructional designer asks three connected questions: <b>What do people need to do?</b> <b>What makes that difficult now?</b> and <b>What support will help them succeed?</b></p>
          </div>
          <figure class="course-figure course-figure--borderless">
            <img :src="media.analysis" loading="lazy" alt="An instructional designer observing a café closing routine, speaking with staff, and gathering notes before creating training.">
            <figcaption>Good design begins with evidence from the real task.</figcaption>
          </figure>
        </div>
        <div class="definition-callout">
          <span aria-hidden="true">01</span>
          <p><b>In simple words:</b> instructional design helps turn a real need into learning support that people can understand, practise, and use.</p>
        </div>
        <aside class="fact-hook"><span aria-hidden="true">!</span><p><b>Do not confuse the screen with the design.</b> A video, job aid, workshop, practice task, or short course can all be part of instructional design when each one helps someone do the real work more reliably.</p></aside>
        <button v-if="!completedBlocks.includes('definition')" type="button" class="continue-block" @click="completeBlock('definition', 4)">Continue to the cause check <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 4" id="cause" class="lesson-section unlock-block" :class="{ 'is-complete': completedBlocks.includes('cause'), 'is-released': releasedSection === 'cause' }" aria-labelledby="sort-title">
        <p class="section-kicker">Look for the cause</p>
        <h2 id="sort-title">Not every problem needs training.</h2>
        <p>A course cannot replace missing equipment, an unclear process, or a checklist that nobody can find. Sort each café problem below. Decide whether learning support can help, or whether the work environment needs fixing first.</p>

        <div class="sort-board">
          <article v-for="item in sortItems" :key="item.id" class="sort-card" :class="{ 'is-set': sortChoices[item.id] }">
            <h3>{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
            <div class="sort-card__actions" :aria-label="`Choose a response for: ${item.title}`">
              <button type="button" :class="{ 'is-selected': sortChoices[item.id] === 'learning' }" @click="chooseSort(item.id, 'learning')">Learning can help</button>
              <button type="button" :class="{ 'is-selected': sortChoices[item.id] === 'environment' }" @click="chooseSort(item.id, 'environment')">Fix the work environment</button>
            </div>
          </article>
        </div>
        <p v-if="sortComplete" class="feedback" role="status"><b>{{ sortCorrect ? 'Correct.' : 'Review your choices.' }}</b> <template v-if="sortCorrect">Training is one part of performance support. Good analysis also checks tools, time, guidance, and the working environment.</template><template v-else>Ask: does the person need to learn a skill, or are they being blocked by the situation around the task?</template></p>
        <button v-if="!completedBlocks.includes('cause')" type="button" class="continue-block" :disabled="!sortComplete" @click="completeBlock('cause', 5)">Continue to learner analysis <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 5" id="learner" class="lesson-section lesson-section--quiet unlock-block" :class="{ 'is-complete': completedBlocks.includes('learner'), 'is-released': releasedSection === 'learner' }" aria-labelledby="learner-title">
        <p class="section-kicker">Understand people and context</p>
        <h2 id="learner-title">Before you teach, learn about the learner.</h2>
        <p>People do not arrive as empty containers. They bring experience, prior knowledge, language, time limits, confidence, and different access to tools. Find out enough to make the learning useful and possible.</p>
        <div class="reveal-list">
          <details open>
            <summary><span>Who are the learners?</span><i aria-hidden="true">+</i></summary>
            <p>Look at their role, previous experience, confidence, and reason for taking the course. Do not assume everyone in a job title needs the same support.</p>
          </details>
          <details>
            <summary><span>What does the task actually involve?</span><i aria-hidden="true">+</i></summary>
            <p>Watch the task or speak with someone who does it well. Break it into the decisions, steps, tools, and conditions that matter.</p>
          </details>
          <details>
            <summary><span>What could stop people from succeeding?</span><i aria-hidden="true">+</i></summary>
            <p>Check time, access to equipment, language, accessibility, manager support, and whether learners can practise in the real setting.</p>
          </details>
        </div>
        <div class="mini-practice" aria-labelledby="learner-mini-title">
          <p class="knowledge-check__type">Mini practice · learner lens</p>
          <h3 id="learner-mini-title">Which question gives a designer useful evidence?</h3>
          <p>Choose the question that tells you something important about whether people can practise and use the task.</p>
          <div class="choice-list choice-list--stacked"><button v-for="option in learnerContextOptions" :key="option.id" type="button" :class="{ 'is-selected': learnerContextChoice === option.id }" @click="learnerContextChoice = option.id">{{ option.label }}</button></div>
          <p v-if="learnerContextFeedback" class="feedback" role="status"><b>{{ learnerContextChoice === 'time' ? 'Correct.' : 'Look again.' }}</b> {{ learnerContextFeedback.replace(/^(Correct\.|Look again\.)\s*/, '') }}</p>
        </div>
        <button v-if="!completedBlocks.includes('learner')" type="button" class="continue-block" @click="completeBlock('learner', 6)">Continue to Lesson 2 <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 6" id="design" class="lesson-section unlock-block" :class="{ 'is-complete': completedBlocks.includes('addie'), 'is-released': releasedSection === 'design' }" aria-labelledby="addie-title">
        <p class="section-kicker">A simple planning map</p>
        <h2 id="addie-title">Use ADDIE to think through the work.</h2>
        <p><b>ADDIE</b> is short for Analyse, Design, Develop, Implement, and Evaluate. It helps designers remember the work that needs attention. It is not a strict straight line: you can return to an earlier step when you learn something new.</p>

        <div class="process-map" role="img" aria-label="An iterative five-stage process: Analyse, Design, Develop, Implement, and Evaluate. The final stage sends feedback to the first stage.">
          <div v-for="(stage, index) in addieStages" :key="stage.id" class="process-map__step">
            <span>{{ stage.letter }}</span>
            <b>{{ stage.title }}</b>
            <i v-if="index < addieStages.length - 1" aria-hidden="true">→</i>
          </div>
          <p>Evaluation sends evidence back to the beginning.</p>
        </div>

        <div class="addie-explorer" aria-label="ADDIE stages">
          <div class="addie-explorer__tabs" role="tablist" aria-label="Select an ADDIE stage">
            <button v-for="stage in addieStages" :key="stage.id" type="button" role="tab" :aria-selected="activeAddie === stage.id" :class="{ 'is-active': activeAddie === stage.id }" @click="activeAddie = stage.id">
              <span>{{ stage.letter }}</span>{{ stage.title }}
            </button>
          </div>
          <article class="addie-explorer__panel" role="tabpanel">
            <p class="addie-explorer__step">{{ activeStageInfo.letter }} · {{ activeStageInfo.title }}</p>
            <h3>{{ activeStageInfo.lead }}</h3>
            <p><b>In the café:</b> {{ activeStageInfo.example }}</p>
            <p class="addie-explorer__output"><span>Useful output</span>{{ activeStageInfo.output }}</p>
          </article>
        </div>
        <button v-if="!completedBlocks.includes('addie')" type="button" class="continue-block" @click="completeBlock('addie', 7)">Continue to alignment <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 7" id="objective" class="lesson-section unlock-block" :class="{ 'is-complete': completedBlocks.includes('objective'), 'is-released': releasedSection === 'objective' }" aria-labelledby="objective-title">
        <p class="section-kicker">Make the learning visible</p>
        <h2 id="objective-title">A clear objective connects the course.</h2>
        <p>An objective says what a learner should be able to <b>do</b>. It helps you choose the right explanation, activity, and check for understanding.</p>
        <div class="alignment-map" role="img" aria-label="An instructional alignment diagram: a clear objective connects to a meaningful practice activity, which connects to evidence of learning.">
          <div><span>1</span><b>Objective</b><p>What will the learner do?</p></div>
          <i aria-hidden="true">→</i>
          <div><span>2</span><b>Practice</b><p>How will they try it?</p></div>
          <i aria-hidden="true">→</i>
          <div><span>3</span><b>Evidence</b><p>How will we know?</p></div>
        </div>
        <p class="diagram-caption">Objective → practice → evidence. These three decisions should support each other.</p>

        <div class="worked-example">
          <div class="worked-example__header"><span>Worked example</span><b>From vague topic to useful objective</b></div>
          <div class="worked-example__grid">
            <p><span>Topic</span>Safe café closing</p>
            <p><span>Objective</span>After observing the counter setup, complete the six closing steps in the correct order using the checklist.</p>
            <p><span>Practice</span>Complete a guided closing run.</p>
            <p><span>Evidence</span>Use the checklist to check the completed counter.</p>
          </div>
        </div>

        <div class="knowledge-check" aria-labelledby="objective-question">
          <p class="knowledge-check__type">Knowledge check</p>
          <h3 id="objective-question">Which objective is strongest?</h3>
          <div class="choice-list choice-list--stacked">
            <button v-for="option in objectiveOptions" :key="option.id" type="button" :class="{ 'is-selected': objectiveChoice === option.id }" @click="objectiveChoice = option.id">{{ option.text }}</button>
          </div>
          <p v-if="objectiveFeedback" class="feedback" role="status"><b>{{ objectiveChoice === 'strong' ? 'Correct.' : 'Not yet.' }}</b> {{ objectiveFeedback.replace(/^(Correct\.|Try again\.)\s*/, '') }}</p>
        </div>

        <figure class="source-figure">
          <img :src="media.blooms" loading="lazy" alt="Bloom’s taxonomy diagram showing six levels: remember, understand, apply, analyse, evaluate, and create.">
          <figcaption>Real reference visual: MIT Digital Learning Toolkit’s Bloom’s taxonomy diagram, used under CC BY 4.0. It shows that objectives can ask for different kinds of performance, from remembering to creating.</figcaption>
        </figure>
        <button v-if="!completedBlocks.includes('objective')" type="button" class="continue-block" :disabled="!objectiveChoice" @click="completeBlock('objective', 8)">Continue to design artefacts <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 8" id="artefacts" class="lesson-section lesson-section--artifacts unlock-block" :class="{ 'is-complete': completedBlocks.includes('artefacts'), 'is-released': releasedSection === 'artefacts' }" aria-labelledby="artefacts-title">
        <div class="lesson-split lesson-split--flip">
          <figure class="course-figure course-figure--borderless">
            <img :src="media.artifacts" loading="lazy" alt="Hands arranging learner notes, a storyboard, a practice card, a job aid, and feedback notes on a worktable.">
            <figcaption>Instructional design produces useful work objects, not only course screens.</figcaption>
          </figure>
          <div>
            <p class="section-kicker">Make useful things</p>
            <h2 id="artefacts-title">What does an instructional designer actually make?</h2>
            <p>The answer depends on the problem. A course can be one part of the solution. Designers also use learner notes, task analysis, objectives, storyboards, activities, job aids, and evaluation plans.</p>
            <ul class="artifact-list">
              <li><b>Learner notes</b> record what people already know and need.</li>
              <li><b>A storyboard</b> plans a learning experience before expensive build work begins.</li>
              <li><b>A job aid</b> supports the task at the moment it is done.</li>
              <li><b>Evaluation notes</b> show what worked and what needs to change.</li>
            </ul>
          </div>
        </div>
        <figure class="course-figure course-figure--wide expansion-figure">
          <img :src="media.storyboard" loading="lazy" alt="Learners using laptops together in a technical learning environment.">
          <figcaption><b>Design for the setting where learning happens.</b> A storyboard is still a useful planning artefact because it makes the learner’s route visible before the course is built.</figcaption>
        </figure>
        <div class="mini-practice" aria-labelledby="artefact-mini-title">
          <p class="knowledge-check__type">Mini practice · choose the artefact</p>
          <h3 id="artefact-mini-title">A team needs to review a proposed learning flow before it is built. What is the most useful first artefact?</h3>
          <div class="choice-list choice-list--stacked"><button v-for="option in artifactOptions" :key="option.id" type="button" :class="{ 'is-selected': artifactChoice === option.id }" @click="artifactChoice = option.id">{{ option.label }}</button></div>
          <p v-if="artifactFeedback" class="feedback" role="status"><b>{{ artifactChoice === 'storyboard' ? 'Correct.' : 'Not yet.' }}</b> {{ artifactFeedback.replace(/^(Correct\.|Not yet\.)\s*/, '') }}</p>
        </div>
        <button v-if="!completedBlocks.includes('artefacts')" type="button" class="continue-block" @click="completeBlock('artefacts', 9)">Continue to Lesson 3 <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 9" id="apply" class="lesson-section unlock-block" :class="{ 'is-complete': completedBlocks.includes('scenario'), 'is-released': releasedSection === 'apply' }" aria-labelledby="apply-title">
        <p class="section-kicker">Put it together</p>
        <h2 id="apply-title">Make one sound design decision.</h2>
        <p>The café manager shares a report showing that closing mistakes happen most often on busy Fridays. Before building any learning material, what should you do next?</p>
        <div class="scenario-options">
          <button type="button" :class="{ 'is-selected': caseChoice === 'video' }" @click="caseChoice = 'video'"><span>A</span><b>Film a five-minute training video.</b><small>It might be helpful, but you do not know the cause yet.</small></button>
          <button type="button" :class="{ 'is-selected': caseChoice === 'observe' }" @click="caseChoice = 'observe'"><span>B</span><b>Observe a busy Friday closing shift and talk with staff.</b><small>Find out what changes under pressure and what support is missing.</small></button>
          <button type="button" :class="{ 'is-selected': caseChoice === 'test' }" @click="caseChoice = 'test'"><span>C</span><b>Give every staff member a final test.</b><small>A test can check learning later; it cannot explain the problem now.</small></button>
        </div>
        <p v-if="caseFeedback" class="feedback" role="status"><b>{{ caseChoice === 'observe' ? 'Correct.' : 'Not yet.' }}</b> {{ caseFeedback.replace(/^(Correct\.|This may be useful later, but)\s*/, '') }}</p>
        <button v-if="!completedBlocks.includes('scenario')" type="button" class="continue-block" :disabled="!caseChoice" @click="completeBlock('scenario', 10)">Continue to the final check <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 10" id="check" class="lesson-section lesson-section--check unlock-block" :class="{ 'is-complete': completedBlocks.includes('matching'), 'is-released': releasedSection === 'check' }" aria-labelledby="check-title">
        <p class="section-kicker">Check your understanding</p>
        <h2 id="check-title">Use the design language once more.</h2>
        <p>Match each design action to its purpose. Then answer one final question.</p>

        <div class="matching-check">
          <div v-for="prompt in matchingPrompts" :key="prompt.id" class="matching-row">
            <p>{{ prompt.label }}</p>
            <div class="matching-row__choices" :aria-label="`Match ${prompt.label} to its purpose`">
              <button v-for="choice in matchingChoices" :key="choice.id" type="button" :class="{ 'is-selected': matchingAnswers[prompt.id] === choice.id }" @click="selectMatch(prompt.id, choice.id)">{{ choice.label }}</button>
            </div>
          </div>
          <button type="button" class="submit-button" :disabled="!matchingPrompts.every((prompt) => matchingAnswers[prompt.id])" @click="submitMatching">Check matches</button>
          <p v-if="matchingSubmitted" class="feedback" role="status"><b>{{ matchingCorrect ? 'Correct.' : 'Review the matches.' }}</b> <template v-if="matchingCorrect">Analysis identifies the need, Design plans the learning, and Evaluation tells you what to improve.</template><template v-else>Look for the purpose of each stage, rather than the tool someone might use inside it.</template></p>
        </div>

        <div v-if="matchingSubmitted" class="knowledge-check knowledge-check--final" aria-labelledby="final-question">
          <p class="knowledge-check__type">Final question</p>
          <h3 id="final-question">Which statement best describes instructional design?</h3>
          <div class="choice-list choice-list--stacked">
            <button type="button" :class="{ 'is-selected': finalChoice === 'screens' }" @click="finalChoice = 'screens'">It is the process of making attractive e-learning screens.</button>
            <button type="button" :class="{ 'is-selected': finalChoice === 'process' }" @click="finalChoice = 'process'">It is a systematic way to understand a learning need, plan support, create it, and improve it using evidence.</button>
            <button type="button" :class="{ 'is-selected': finalChoice === 'quiz' }" @click="finalChoice = 'quiz'">It is a way to test whether learners remember facts at the end of a course.</button>
          </div>
          <button type="button" class="submit-button" :disabled="!finalChoice" @click="showFinalFeedback = true">Submit answer</button>
          <p v-if="showFinalFeedback" class="feedback" role="status"><b>{{ finalChoice === 'process' ? 'Correct.' : 'Not yet.' }}</b> <template v-if="finalChoice === 'process'">Instructional design connects a real need, the learner, the activity, and evidence of learning. The screen is only one possible part of that work.</template><template v-else>The screen and the quiz may be useful tools. The work begins earlier: understand the need, plan the learning, and use evidence to improve it.</template></p>
        </div>
        <button v-if="showFinalFeedback && !completedBlocks.includes('matching')" type="button" class="continue-block" @click="completeBlock('matching', 11)">Continue to the module close <span aria-hidden="true">↓</span></button>
      </section>

      <section v-if="unlockedBlock >= 11" id="closing" class="lesson-section lesson-section--closing unlock-block" :class="{ 'is-complete': courseComplete, 'is-released': releasedSection === 'closing' }" aria-labelledby="closing-title">
        <p class="section-kicker">Take this with you</p>
        <h2 id="closing-title">Good learning design starts before the screen.</h2>
        <p>Find the real task. Understand the people doing it. Decide what successful performance looks like. Give learners a way to practise. Then use evidence to make the support better.</p>
        <div class="closing-card">
          <span aria-hidden="true">✓</span>
          <p><b>Small first step:</b> the next time someone asks for a course, ask: “What should people be able to do differently after this?”</p>
        </div>
        <button v-if="!courseComplete" type="button" class="continue-block" @click="completeBlock('closing', 11)">Mark module complete <span aria-hidden="true">✓</span></button>
        <p v-else class="completion-note" role="status"><b>Module complete.</b> You can revisit any completed lesson from the path above.</p>
      </section>

      <aside v-if="unlockedBlock < blockPath.length - 1" class="locked-preview" aria-live="polite">
        <span aria-hidden="true">⌄</span>
        <div><b>Next: {{ nextBlockInfo.title }}</b><p>Complete the current block above to unlock this part of the module.</p></div>
      </aside>

      <details v-if="courseComplete" class="sources-panel">
        <summary>Sources and media credits <span aria-hidden="true">+</span></summary>
        <div class="sources-panel__body">
          <p>This module uses instructional-design sources for explanation, not as a substitute for professional consultation on a specific workplace problem.</p>
          <ol>
            <li><a href="https://www.td.org/talent-development-glossary-terms/what-is-instructional-design" target="_blank" rel="noreferrer">Association for Talent Development — What is Instructional Design?</a></li>
            <li><a href="https://dltoolkit.mit.edu/online-course-design-guide/pre-design/learner-analysis/" target="_blank" rel="noreferrer">MIT Digital Learning Toolkit — Learner Analysis</a></li>
            <li><a href="https://www.uwb.edu/it/addie" target="_blank" rel="noreferrer">University of Washington Bothell — ADDIE Model</a></li>
            <li><a href="https://edtechbooks.org/id/task_and_content_analysis" target="_blank" rel="noreferrer">EdTech Books — Using Task Analysis to Inform Instructional Design</a></li>
            <li><a href="https://www.cdc.gov/training-development/php/about/evaluate-training-measuring-effectiveness.html" target="_blank" rel="noreferrer">CDC — Evaluate Training: Measuring Effectiveness</a></li>
            <li><a href="https://dltoolkit.mit.edu/online-course-design-guide/design/objectives-outcomes/" target="_blank" rel="noreferrer">MIT Digital Learning Toolkit — Objectives & Outcomes</a></li>
            <li><a href="https://www.articulatesupport.com/article/Rise-How-to-Use-Knowledge-Check-Blocks" target="_blank" rel="noreferrer">Articulate Support — Rise 360 Knowledge Check Blocks</a></li>
            <li><a href="https://www.pexels.com/photo/colleagues-sitting-with-laptops-at-library-16420579/" target="_blank" rel="noreferrer">Pexels — Adult collaboration photograph</a> and <a href="https://www.pexels.com/photo/people-with-laptops-at-lecture-in-technical-school-19895774/" target="_blank" rel="noreferrer">Pexels — Technical learning photograph</a> (used under the Pexels License).</li>
          </ol>
          <p>Bloom’s taxonomy diagram: MIT Digital Learning Toolkit, CC BY 4.0. The two real learning-context photographs use the Pexels License; the remaining course illustrations are original Entertrainer artwork generated for this module.</p>
        </div>
      </details>
    </div>
  </main>
</template>

<style scoped>
/* Introduction to Instructional Design — Rise-style learning canvas.
   Style contract: calm white single-column reading, one blue accent, functional
   media, visible feedback, generous rhythm, and no motion that competes with teaching. */
.course { --course-blue: #315fc7; --course-blue-soft: #edf2ff; --course-ink: #23272e; --course-muted: #5f6772; --course-rule: #d8dce2; --motion-fast: 140ms; --motion-normal: 240ms; --motion-slow: 420ms; --motion-ease: cubic-bezier(.16, 1, .3, 1); background: #fff; color: var(--course-ink); padding-bottom: 100rem; }
.course-bar { position: sticky; z-index: calc(var(--z-chrome) - 1); top: 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20rem; min-height: 62rem; padding: 0 max(24rem, calc((100vw - 1120rem) / 2)); background: rgb(255 255 255 / 94%); border-bottom: 1px solid #eaecf0; backdrop-filter: blur(12px); font-family: var(--font-ui); font-size: 12rem; }
.course-bar__back { color: var(--course-muted); text-decoration: none; width: fit-content; }
.course-bar__back::before { content: '← '; }
.course-bar__back:hover { color: var(--course-blue); }
.course-bar__title { margin: 0; font-weight: 700; color: var(--course-ink); white-space: nowrap; }
.course-bar__progress { justify-self: end; display: flex; align-items: center; gap: 8rem; color: var(--course-muted); font-family: var(--font-mono); font-size: 10rem; }
.course-bar__progress-track { width: 66rem; height: 4rem; overflow: hidden; background: #e8ebf0; border-radius: 999rem; }
.course-bar__progress-track i { display: block; height: 100%; border-radius: inherit; background: var(--course-blue); transition: width 220ms var(--ease-out); }

.course-hero { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(330rem, .92fr); min-height: 580rem; max-width: 1280rem; margin: 0 auto; background: #f5f4f1; }
.course-hero__image-wrap { min-height: 100%; overflow: hidden; background: #e7e5df; }
.course-hero__image { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.course-hero__body { display: flex; flex-direction: column; justify-content: center; padding: clamp(46rem, 7vw, 106rem) clamp(32rem, 6vw, 76rem); }
.course-hero__eyebrow, .section-kicker, .knowledge-check__type { margin: 0 0 14rem; color: var(--course-blue); font-family: var(--font-mono); font-size: 11rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
.course-hero h1 { max-width: 9ch; margin: 0; font-family: var(--font-ui); font-size: clamp(42rem, 5.4vw, 68rem); font-weight: 700; letter-spacing: -.065em; line-height: .99; }
.course-hero__deck { max-width: 37ch; margin: 28rem 0 0; color: var(--course-muted); font-family: var(--font-reading); font-size: 18rem; line-height: 1.58; }
.course-hero__start { display: inline-flex; gap: 11rem; width: fit-content; margin-top: 34rem; padding: 13rem 18rem; background: var(--course-blue); color: #fff; border-radius: 6rem; font-family: var(--font-ui); font-size: 14rem; font-weight: 700; text-decoration: none; transition: transform 160ms var(--ease-out), background 160ms var(--ease-out); }
.course-hero__start:hover { background: #274fa9; transform: translateY(-2rem); }
.course-hero__start:active, .submit-button:active { transform: scale(.98); }

.course-sections { position: sticky; z-index: 3; top: 62rem; display: flex; justify-content: center; gap: 4rem; overflow-x: auto; padding: 10rem 18rem; background: #fff; border-bottom: 1px solid #eaecf0; }
.course-sections button { flex: none; padding: 7rem 10rem; color: var(--course-muted); border-radius: 4rem; font-family: var(--font-ui); font-size: 12rem; white-space: nowrap; transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.course-sections button:hover { background: var(--course-blue-soft); color: var(--course-blue); }
.course-sections button:disabled { color: #9aa3af; cursor: not-allowed; }
.course-sections button.is-locked { background: #f7f8fa; }

.lesson-canvas { width: min(100% - 40rem, 820rem); margin: 0 auto; }
.progress-path { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 12rem; margin: 42rem 0 -24rem; padding: 14rem 16rem; color: #33445f; background: #f3f6fd; border: 1px solid #dce5f8; border-radius: 7rem; font-family: var(--font-ui); }
.progress-path__number { display: grid; place-items: center; width: 30rem; height: 30rem; color: #fff; background: var(--course-blue); border-radius: 50%; font-family: var(--font-mono); font-size: 10rem; font-weight: 700; }
.progress-path b { display: block; color: var(--course-blue); font-family: var(--font-mono); font-size: 10rem; letter-spacing: .07em; text-transform: uppercase; }
.progress-path p { margin: 3rem 0 0; font-size: 13rem; font-weight: 700; }
.lesson-section { padding: 90rem 0; border-bottom: 1px solid #e6e8ec; scroll-margin-top: 126rem; }
.unlock-block { border-left: 3rem solid var(--course-blue); padding-left: 26rem; }
.unlock-block.is-complete { border-left-color: #2f8b5d; }
.unlock-block.is-released { animation: section-release var(--motion-slow) var(--motion-ease) both; }
.unlock-block.is-released > :is(.section-kicker, h2, .lesson-split) { animation: section-content-in var(--motion-normal) var(--motion-ease) both; }
.unlock-block.is-released > :is(.case-brief, .course-figure, .fact-hook, .knowledge-check, .sort-board, .mini-practice, .addie-explorer, .alignment-map, .source-figure, .scenario-options, .matching-check, .closing-card) { animation: section-content-in var(--motion-slow) var(--motion-ease) both; animation-delay: 70ms; }
.continue-block { display: inline-flex; align-items: center; gap: 9rem; margin-top: 30rem; padding: 12rem 16rem; color: #fff; background: var(--course-blue); border: 0; border-radius: 5rem; font-family: var(--font-ui); font-size: 13rem; font-weight: 700; cursor: pointer; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out); }
.continue-block:hover:not(:disabled) { background: #274fa9; transform: translateY(-1rem); }
.continue-block:disabled { opacity: .42; cursor: not-allowed; }
.continue-block:active:not(:disabled) { transform: scale(.98); }
.locked-preview { display: flex; align-items: flex-start; gap: 14rem; margin: 40rem 0 16rem; padding: 20rem; color: #667085; background: #f7f9fc; border: 1px dashed #c7d0de; border-radius: 7rem; font-family: var(--font-ui); }
.locked-preview > span { display: grid; place-items: center; flex: none; width: 28rem; height: 28rem; color: #76869f; background: #e8edf5; border-radius: 50%; font-size: 15rem; transform: rotate(-90deg); }
.locked-preview b { display: block; color: #455366; font-size: 14rem; }
.locked-preview p { margin: 5rem 0 0; font-family: var(--font-reading); font-size: 15rem; line-height: 1.45; }
.completion-note { margin: 30rem 0 0; padding: 15rem 17rem; color: #244332; background: #edf8f1; border-left: 3rem solid #2f8b5d; font-family: var(--font-ui); font-size: 14rem; }
@keyframes section-release { from { opacity: 0; transform: translateY(18rem); } to { opacity: 1; transform: translateY(0); } }
@keyframes section-content-in { from { opacity: 0; transform: translateY(10rem); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .unlock-block.is-released, .unlock-block.is-released > * { animation: none; opacity: 1; transform: none; }
}
.lesson-section > h2 { max-width: 16ch; margin: 0; font-family: var(--font-ui); font-size: clamp(30rem, 4vw, 44rem); letter-spacing: -.052em; line-height: 1.06; }
.lesson-section > p:not(.section-kicker):not(.feedback) { max-width: 61ch; margin: 22rem 0 0; color: #3c434c; font-family: var(--font-reading); font-size: 18rem; line-height: 1.65; }
.lesson-section--objectives { margin-top: 56rem; padding: 36rem clamp(24rem, 5vw, 52rem) 42rem; background: var(--course-blue-soft); border: 0; border-radius: 8rem; }
.lesson-section--objectives h2 { max-width: 26ch; font-size: clamp(25rem, 3.2vw, 33rem); }
.objective-list { display: grid; grid-template-columns: 1fr 1fr; gap: 14rem 24rem; margin: 28rem 0 0; padding: 0; list-style: none; }
.objective-list li { display: flex; align-items: flex-start; gap: 11rem; }
.objective-list span { display: grid; flex: none; place-items: center; width: 25rem; height: 25rem; margin-top: 2rem; color: #fff; background: var(--course-blue); border-radius: 50%; font-family: var(--font-mono); font-size: 10rem; }
.objective-list p { margin: 0; font-family: var(--font-ui); font-size: 14rem; line-height: 1.5; }

.case-brief { max-width: 680rem; margin: 30rem 0; padding: 22rem 25rem; border-left: 4rem solid var(--course-blue); background: #f8f9fb; }
.case-brief__label { display: block; margin-bottom: 8rem; color: var(--course-blue); font-family: var(--font-mono); font-size: 10rem; text-transform: uppercase; letter-spacing: .08em; }
.case-brief p { margin: 0; color: #3c434c; font-family: var(--font-reading); font-size: 17rem; line-height: 1.6; }
.knowledge-check { margin-top: 34rem; padding: clamp(24rem, 4vw, 36rem); background: #f8fafc; border: 1px solid #dfe4eb; border-radius: 9rem; }
.knowledge-check h3 { max-width: 31ch; margin: 0; font-family: var(--font-ui); font-size: clamp(20rem, 2.5vw, 25rem); letter-spacing: -.03em; line-height: 1.2; }
.choice-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10rem; margin-top: 22rem; }
.choice-list--stacked { grid-template-columns: 1fr; }
.choice-list button, .sort-card__actions button, .matching-row__choices button { min-height: 50rem; padding: 12rem 14rem; color: #303842; background: #fff; border: 1px solid #cfd6df; border-radius: 5rem; font-family: var(--font-ui); font-size: 14rem; font-weight: 600; line-height: 1.35; text-align: left; cursor: pointer; transition: border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out); }
.choice-list button:hover, .sort-card__actions button:hover, .matching-row__choices button:hover { border-color: var(--course-blue); color: var(--course-blue); }
.choice-list button:hover, .sort-card__actions button:hover, .matching-row__choices button:hover, .course-sections button:hover:not(:disabled) { transform: translateY(-1rem); }
.choice-list button:active, .sort-card__actions button:active, .matching-row__choices button:active { transform: scale(.98); }
.choice-list button.is-selected, .sort-card__actions button.is-selected, .matching-row__choices button.is-selected { background: var(--course-blue); border-color: var(--course-blue); color: #fff; }
.feedback { max-width: 62ch; margin: 20rem 0 0; padding: 14rem 16rem; color: #244332; background: #edf8f1; border-left: 3rem solid #2f8b5d; font-family: var(--font-ui); font-size: 14rem; line-height: 1.52; }

.lesson-section--definition { padding-top: 100rem; }
.lesson-split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: clamp(32rem, 7vw, 72rem); }
.lesson-split h2 { max-width: 11ch; margin: 0; font-family: var(--font-ui); font-size: clamp(30rem, 4vw, 44rem); letter-spacing: -.052em; line-height: 1.06; }
.lesson-split p:not(.section-kicker) { margin: 20rem 0 0; color: #3c434c; font-family: var(--font-reading); font-size: 18rem; line-height: 1.62; }
.course-figure { margin: 34rem 0 0; overflow: hidden; background: #f4f3ef; border: 1px solid #e2e4e8; border-radius: 8rem; }
.course-figure--borderless { margin: 0; background: transparent; border: 0; border-radius: 0; }
.course-figure--wide { margin-top: 32rem; }
.course-figure img { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; }
.course-figure--wide img { aspect-ratio: 16 / 7; }
.course-figure figcaption, .source-figure figcaption { padding: 11rem 14rem; color: var(--course-muted); background: #fff; font-family: var(--font-ui); font-size: 11.5rem; line-height: 1.45; }
.course-figure--borderless figcaption { padding: 10rem 0 0; background: transparent; }
.expansion-figure { margin-top: 38rem; animation: visual-block-in var(--motion-slow) var(--motion-ease) both; }
.expansion-figure img { background: #eaf0fa; }
.expansion-figure--split { max-width: 680rem; }
.fact-hook { display: grid; grid-template-columns: 30rem 1fr; gap: 14rem; max-width: 680rem; margin-top: 30rem; padding: 18rem 20rem; color: #354253; background: #f3f6fd; border-left: 3rem solid var(--course-blue); font-family: var(--font-reading); font-size: 16rem; line-height: 1.55; animation: visual-block-in var(--motion-normal) var(--motion-ease) both; }
.fact-hook > span { display: grid; place-items: center; width: 26rem; height: 26rem; color: var(--course-blue); border: 1px solid currentColor; border-radius: 50%; font-family: var(--font-ui); font-size: 14rem; font-weight: 700; }
.fact-hook p { margin: 0; }
.fact-hook b { font-family: var(--font-ui); }
.mini-practice { max-width: 700rem; margin-top: 38rem; padding: 26rem; background: #fff; border: 1px solid #dbe1eb; border-left: 3rem solid var(--course-blue); border-radius: 7rem; animation: visual-block-in var(--motion-normal) var(--motion-ease) both; }
.mini-practice h3 { max-width: 36ch; margin: 0; font-family: var(--font-ui); font-size: 22rem; letter-spacing: -.03em; line-height: 1.25; }
.mini-practice > p:not(.knowledge-check__type):not(.feedback) { max-width: 58ch; margin: 12rem 0 0; color: var(--course-muted); font-family: var(--font-reading); font-size: 16rem; line-height: 1.55; }
.mini-practice .choice-list { margin-top: 20rem; }
.mini-practice .feedback { animation: feedback-in var(--motion-normal) var(--motion-ease) both; }
@keyframes visual-block-in { from { opacity: 0; transform: translateY(10rem); } to { opacity: 1; transform: translateY(0); } }
@keyframes feedback-in { from { opacity: 0; transform: translateX(-6rem); } to { opacity: 1; transform: translateX(0); } }
.definition-callout { display: grid; grid-template-columns: auto 1fr; gap: 18rem; margin-top: 46rem; padding: 24rem 0 0; border-top: 1px solid var(--course-rule); }
.definition-callout span { color: var(--course-blue); font-family: var(--font-mono); font-size: 12rem; }
.definition-callout p { max-width: 48ch; margin: 0; font-family: var(--font-reading); font-size: 22rem; line-height: 1.45; }

.sort-board { display: grid; grid-template-columns: 1fr 1fr; gap: 14rem; margin-top: 32rem; }
.sort-card { padding: 22rem; background: #fff; border: 1px solid #dfe3e9; border-radius: 7rem; }
.sort-card.is-set { border-color: #b8c9ee; }
.sort-card h3 { margin: 0; font-family: var(--font-ui); font-size: 16rem; letter-spacing: -.015em; }
.sort-card p { margin: 9rem 0 0; color: var(--course-muted); font-family: var(--font-reading); font-size: 15rem; line-height: 1.5; }
.sort-card__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8rem; margin-top: 17rem; }
.sort-card__actions button { min-height: 45rem; padding: 8rem; font-size: 12rem; }
.lesson-section--quiet { padding: 75rem clamp(24rem, 6vw, 62rem); background: #f7f7f5; border-bottom: 0; }
.reveal-list { margin-top: 30rem; border-top: 1px solid #d8dadd; }
.reveal-list details { border-bottom: 1px solid #d8dadd; }
.reveal-list summary { display: flex; align-items: center; justify-content: space-between; gap: 16rem; min-height: 64rem; font-family: var(--font-ui); font-size: 16rem; font-weight: 700; cursor: pointer; list-style: none; }
.reveal-list summary::-webkit-details-marker { display: none; }
.reveal-list summary i { color: var(--course-blue); font-size: 20rem; font-style: normal; font-weight: 400; }
.reveal-list details[open] summary i { transform: rotate(45deg); }
.reveal-list details p { max-width: 59ch; margin: -4rem 0 21rem; color: #3e4650; font-family: var(--font-reading); font-size: 16rem; line-height: 1.6; }

.addie-explorer { margin-top: 36rem; border: 1px solid #dce1e8; border-radius: 8rem; overflow: hidden; }
.process-map { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8rem; position: relative; align-items: stretch; margin-top: 34rem; padding: 28rem 22rem 20rem; background: #f7f9fc; border: 1px solid #dbe1ea; border-radius: 8rem; }
.process-map__step { position: relative; display: flex; min-height: 98rem; flex-direction: column; justify-content: center; gap: 7rem; padding: 14rem 10rem; background: #fff; border: 1px solid #d8dee8; border-radius: 6rem; text-align: center; }
.process-map__step span { color: var(--course-blue); font-family: var(--font-mono); font-size: 12rem; font-weight: 700; }
.process-map__step b { font-family: var(--font-ui); font-size: 14rem; }
.process-map__step i { position: absolute; z-index: 1; top: 50%; right: -16rem; width: 23rem; color: var(--course-blue); background: #f7f9fc; font-family: var(--font-ui); font-size: 17rem; font-style: normal; transform: translateY(-50%); }
.process-map > p { grid-column: 1 / -1; width: fit-content; margin: 10rem auto 0; padding: 6rem 10rem; color: #45609b; background: #e8efff; border-radius: 999rem; font-family: var(--font-ui); font-size: 11rem; }
.addie-explorer__tabs { display: grid; grid-template-columns: repeat(5, 1fr); background: #f7f9fc; border-bottom: 1px solid #dce1e8; }
.addie-explorer__tabs button { min-height: 71rem; padding: 10rem 6rem; color: var(--course-muted); border-right: 1px solid #dce1e8; font-family: var(--font-ui); font-size: 12rem; cursor: pointer; }
.addie-explorer__tabs button:last-child { border-right: 0; }
.addie-explorer__tabs button span { display: block; margin-bottom: 3rem; color: var(--course-blue); font-family: var(--font-mono); font-size: 10rem; }
.addie-explorer__tabs button.is-active { background: var(--course-blue); color: #fff; }
.addie-explorer__tabs button.is-active span { color: #dce8ff; }
.addie-explorer__panel { padding: clamp(24rem, 5vw, 44rem); }
.addie-explorer__step { margin: 0 0 9rem; color: var(--course-blue); font-family: var(--font-mono); font-size: 11rem; letter-spacing: .08em; text-transform: uppercase; }
.addie-explorer__panel h3 { max-width: 30ch; margin: 0; font-family: var(--font-ui); font-size: 24rem; letter-spacing: -.035em; line-height: 1.18; }
.addie-explorer__panel > p:not(.addie-explorer__step):not(.addie-explorer__output) { max-width: 62ch; margin: 18rem 0 0; color: #3f4750; font-family: var(--font-reading); font-size: 17rem; line-height: 1.6; }
.addie-explorer__output { display: grid; grid-template-columns: 116rem 1fr; gap: 14rem; margin: 25rem 0 0; padding-top: 18rem; border-top: 1px solid #e3e6ea; color: #333b44; font-family: var(--font-ui); font-size: 14rem; line-height: 1.5; }
.addie-explorer__output span { color: var(--course-muted); font-family: var(--font-mono); font-size: 10rem; text-transform: uppercase; }

.worked-example { margin-top: 32rem; border: 1px solid #d7dce4; border-radius: 7rem; overflow: hidden; }
.worked-example__header { display: flex; align-items: baseline; gap: 13rem; padding: 15rem 18rem; background: #f6f8fb; border-bottom: 1px solid #d7dce4; font-family: var(--font-ui); font-size: 15rem; }
.worked-example__header span { color: var(--course-blue); font-family: var(--font-mono); font-size: 10rem; text-transform: uppercase; letter-spacing: .07em; }
.worked-example__grid { display: grid; grid-template-columns: 1fr 1fr; }
.worked-example__grid p { min-height: 104rem; margin: 0; padding: 18rem; border-right: 1px solid #e1e4e9; border-bottom: 1px solid #e1e4e9; color: #3a424c; font-family: var(--font-reading); font-size: 15rem; line-height: 1.48; }
.worked-example__grid p:nth-child(2n) { border-right: 0; }
.worked-example__grid p:nth-last-child(-n+2) { border-bottom: 0; }
.worked-example__grid span { display: block; margin-bottom: 6rem; color: var(--course-blue); font-family: var(--font-mono); font-size: 10rem; text-transform: uppercase; }
.alignment-map { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; gap: 8rem; margin-top: 34rem; padding: 22rem; background: #f7f9fc; border: 1px solid #dbe1ea; border-radius: 8rem; }
.alignment-map > div { min-height: 132rem; padding: 17rem 13rem; background: #fff; border: 1px solid #d7dee9; border-radius: 6rem; }
.alignment-map span { display: block; margin-bottom: 12rem; color: var(--course-blue); font-family: var(--font-mono); font-size: 11rem; }
.alignment-map b { display: block; font-family: var(--font-ui); font-size: 15rem; }
.alignment-map p { margin: 8rem 0 0; color: var(--course-muted); font-family: var(--font-reading); font-size: 13rem; line-height: 1.42; }
.alignment-map > i { color: var(--course-blue); font-family: var(--font-ui); font-size: 20rem; font-style: normal; }
.diagram-caption { margin: 10rem 0 0; color: var(--course-muted); font-family: var(--font-ui); font-size: 11.5rem; line-height: 1.45; }
.source-figure { max-width: 620rem; margin: 36rem auto 0; overflow: hidden; background: #fff; border: 1px solid #e1e4e9; border-radius: 7rem; }
.source-figure img { display: block; width: 100%; height: auto; }
.source-figure figcaption { background: #fafafa; }

.lesson-section--artifacts { padding: 100rem 0; }
.artifact-list { display: grid; gap: 13rem; margin: 27rem 0 0; padding: 0; list-style: none; }
.artifact-list li { padding-left: 19rem; border-left: 2rem solid #b9c8ef; color: #3f4750; font-family: var(--font-reading); font-size: 16rem; line-height: 1.55; }
.artifact-list b { font-family: var(--font-ui); }

.scenario-options { display: grid; gap: 10rem; margin-top: 30rem; }
.scenario-options button { display: grid; grid-template-columns: 30rem 1fr; column-gap: 15rem; align-items: center; min-height: 90rem; padding: 18rem; color: #343d47; background: #fff; border: 1px solid #d3d8df; border-radius: 6rem; text-align: left; cursor: pointer; transition: border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }
.scenario-options button:hover { border-color: var(--course-blue); }
.scenario-options button.is-selected { background: var(--course-blue-soft); border-color: var(--course-blue); }
.scenario-options span { grid-row: span 2; display: grid; place-items: center; width: 28rem; height: 28rem; color: var(--course-blue); border: 1px solid currentColor; border-radius: 50%; font-family: var(--font-mono); font-size: 11rem; }
.scenario-options b { font-family: var(--font-ui); font-size: 15rem; }
.scenario-options small { margin-top: 4rem; color: var(--course-muted); font-family: var(--font-reading); font-size: 14rem; line-height: 1.4; }

.lesson-section--check { padding: 82rem clamp(24rem, 6vw, 62rem); background: #f6f8fb; border-bottom: 0; }
.matching-check { margin-top: 32rem; }
.matching-row { display: grid; grid-template-columns: 120rem 1fr; gap: 18rem; align-items: center; margin-top: 12rem; padding: 14rem 0; border-top: 1px solid #dbe0e7; }
.matching-row p { margin: 0; font-family: var(--font-ui); font-size: 15rem; font-weight: 700; }
.matching-row__choices { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7rem; }
.matching-row__choices button { min-height: 45rem; padding: 8rem; font-size: 11.5rem; }
.submit-button { min-height: 46rem; margin-top: 22rem; padding: 0 18rem; color: #fff; background: var(--course-blue); border-radius: 5rem; font-family: var(--font-ui); font-size: 14rem; font-weight: 700; cursor: pointer; transition: transform 160ms var(--ease-out), background 160ms var(--ease-out); }
.submit-button:hover:not(:disabled) { background: #264fae; }
.submit-button:disabled { opacity: .45; cursor: not-allowed; }
.knowledge-check--final { margin-top: 56rem; background: #fff; }
.knowledge-check--final .submit-button { margin-top: 19rem; }

.lesson-section--closing { padding: 100rem 0; border-bottom: 0; }
.closing-card { display: grid; grid-template-columns: 34rem 1fr; gap: 16rem; max-width: 620rem; margin-top: 32rem; padding: 22rem; background: #fff9dc; border: 1px solid #ede0a1; border-radius: 7rem; }
.closing-card span { display: grid; place-items: center; width: 27rem; height: 27rem; color: #785d00; background: #ffe67d; border-radius: 50%; font-family: var(--font-ui); font-size: 15rem; font-weight: 700; }
.closing-card p { margin: 0; color: #51471d; font-family: var(--font-reading); font-size: 17rem; line-height: 1.55; }
.sources-panel { margin-top: 22rem; border-top: 1px solid #e3e5e9; border-bottom: 1px solid #e3e5e9; }
.sources-panel summary { display: flex; justify-content: space-between; gap: 16rem; min-height: 62rem; align-items: center; color: #37414a; font-family: var(--font-ui); font-size: 14rem; font-weight: 700; cursor: pointer; list-style: none; }
.sources-panel summary::-webkit-details-marker { display: none; }
.sources-panel[open] summary span { transform: rotate(45deg); }
.sources-panel__body { max-width: 68ch; padding: 0 0 28rem; color: var(--course-muted); font-family: var(--font-reading); font-size: 15rem; line-height: 1.6; }
.sources-panel__body p { margin: 0 0 14rem; }
.sources-panel__body ol { display: grid; gap: 7rem; margin: 0; padding-left: 20rem; }
.sources-panel__body a { color: var(--course-blue); text-underline-offset: 3rem; }

@media (max-width: 760px) {
  .course-bar { grid-template-columns: 1fr auto; padding: 0 18rem; }
  .course-bar__title { display: none; }
  .course-hero { grid-template-columns: 1fr; }
  .course-hero__image-wrap { min-height: 300rem; }
  .course-hero__body { padding: 43rem 24rem 50rem; }
  .course-sections { justify-content: flex-start; top: 62rem; }
  .lesson-canvas { width: min(100% - 32rem, 820rem); }
  .progress-path { margin-top: 30rem; }
  .lesson-section { padding: 64rem 0; }
  .unlock-block { padding-left: 18rem; }
  .lesson-section--objectives, .lesson-section--quiet, .lesson-section--check { padding: 30rem 20rem; }
  .objective-list, .sort-board, .worked-example__grid { grid-template-columns: 1fr; }
  .worked-example__grid p { min-height: 0; border-right: 0; border-bottom: 1px solid #e1e4e9; }
  .worked-example__grid p:last-child { border-bottom: 0; }
  .choice-list { grid-template-columns: 1fr; }
  .lesson-split, .lesson-split--flip { grid-template-columns: 1fr; }
  .lesson-split--flip > :first-child { order: 2; }
  .course-figure--wide img { aspect-ratio: 3 / 2; }
  .mini-practice { padding: 22rem 18rem; }
  .fact-hook { grid-template-columns: 26rem 1fr; padding: 16rem; }
  .process-map { grid-template-columns: 1fr; padding: 16rem; }
  .process-map__step { min-height: 0; flex-direction: row; align-items: center; justify-content: flex-start; padding: 13rem; }
  .process-map__step i { top: auto; right: auto; bottom: -15rem; left: 50%; transform: translateX(-50%) rotate(90deg); }
  .alignment-map { grid-template-columns: 1fr; gap: 6rem; }
  .alignment-map > div { min-height: 0; }
  .alignment-map > i { justify-self: center; transform: rotate(90deg); }
  .sort-card__actions { grid-template-columns: 1fr; }
  .addie-explorer__tabs { grid-template-columns: 1fr; }
  .addie-explorer__tabs button { display: flex; align-items: center; gap: 8rem; min-height: 43rem; padding: 9rem 14rem; border-right: 0; border-bottom: 1px solid #dce1e8; text-align: left; }
  .addie-explorer__tabs button:last-child { border-bottom: 0; }
  .addie-explorer__tabs button span { display: inline; margin: 0; }
  .addie-explorer__output, .matching-row { grid-template-columns: 1fr; gap: 9rem; }
  .matching-row__choices { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .course *, .course *::before, .course *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
</style>
