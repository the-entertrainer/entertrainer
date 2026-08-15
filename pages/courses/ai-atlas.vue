<script setup lang="ts">
/**
 * Design reminder — Learning Atlas, Rise-inspired refinement:
 * Use calm, professional e-learning blocks with simple instructions, visible
 * completion controls, warm paper, Atlas Ink, and mineral-emerald accents.
 * Every interaction must tell the learner what to do and why it matters.
 */
import { AI_GLOSSARY, AI_MODULES, type AiModule } from '~/content/aiCourse'

type Screen = { id: string; kind: 'welcome' | 'objectives' | 'module' | 'capstone'; title: string; module?: AiModule }

const STORAGE_KEY = 'entertrainer-ai-atlas-v2'
const screens: Screen[] = [
  { id: 'welcome', kind: 'welcome', title: 'Artificial Intelligence: From Its Origins to the Frontier' },
  { id: 'objectives', kind: 'objectives', title: 'Course objectives' },
  ...AI_MODULES.map(module => ({ id: module.id, kind: 'module' as const, title: module.title, module })),
  { id: 'capstone', kind: 'capstone', title: 'Apply your learning' }
]

const termCards = [
  { term: 'Training', plain: 'The practice stage, where an AI system learns from many examples.' },
  { term: 'Inference', plain: 'The use stage, where a trained AI system responds to a new question or task.' },
  { term: 'Dataset', plain: 'A collection of examples used to teach, test, or check an AI system.' }
]

definePageMeta({ layout: false, pageTransition: { name: 'rise-fade', mode: 'out-in' } })
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap' }
  ]
})
useSeoMeta({
  title: 'Artificial Intelligence: From Its Origins to the Frontier · Entertrainer',
  description: 'A beginner-friendly AI course for understanding today’s tools with confidence and care.',
  ogTitle: 'Artificial Intelligence: From Its Origins to the Frontier',
  ogDescription: 'A clear, beginner-friendly Entertrainer course on AI.'
})

const current = ref(0)
const furthest = ref(0)
const menuOpen = ref(false)
const resourcesOpen = ref(false)
const completed = ref(false)
const openExplore = ref(false)
const activeTab = ref<'rules' | 'examples'>('rules')
const revealedTerms = ref<string[]>([])
const diagnostic = ref('')
const learningCheck = ref('')
const scenarioChoice = ref('')
const reflection = reactive({ use: '', check: '', review: '' })

const active = computed(() => screens[current.value])
const module = computed(() => active.value.module)
const progress = computed(() => Math.round((furthest.value / (screens.length - 1)) * 100))
const remaining = computed(() => Math.max(0, 7 - Math.round((furthest.value / (screens.length - 1)) * 7)))
const capstoneReady = computed(() => reflection.use.trim().length > 7 && reflection.check.trim().length > 7 && reflection.review.trim().length > 7)
const diagnosticFeedback = computed(() => {
  if (!diagnostic.value) return ''
  return diagnostic.value === 'patterns'
    ? 'Correct. A language model creates a likely response from patterns in data. It can be useful, but it does not automatically check every statement for you.'
    : 'Not quite. A polished answer can still contain a mistake. For important information, always check a reliable source.'
})
const learningFeedback = computed(() => {
  if (!learningCheck.value) return ''
  return learningCheck.value === 'training'
    ? 'Correct. Training is the learning stage. Inference is the stage where a trained system responds to a new question or task.'
    : 'Try once more. This option describes using a model after it has already been trained.'
})
const scenarioFeedback = computed(() => {
  if (!scenarioChoice.value) return ''
  return scenarioChoice.value === 'check'
    ? 'Good choice. Start by looking for an official announcement, a research paper, or independent testing. If none exists, say that reliable public evidence is not available.'
    : 'Pause before sharing. A social-media post or a dramatic screenshot is not enough to prove a major AI claim.'
})

function persist() {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ current: current.value, furthest: furthest.value, completed: completed.value }))
}

function go(index: number) {
  if (index < 0 || index > furthest.value + 1 || index >= screens.length) return
  current.value = index
  furthest.value = Math.max(furthest.value, index)
  openExplore.value = false
  menuOpen.value = false
  persist()
}

function next() { go(Math.min(current.value + 1, screens.length - 1)) }
function previous() { current.value = Math.max(0, current.value - 1); openExplore.value = false; persist() }
function revealTerm(term: string) {
  revealedTerms.value = revealedTerms.value.includes(term)
    ? revealedTerms.value.filter(item => item !== term)
    : [...revealedTerms.value, term]
}
function finish() {
  if (!capstoneReady.value) return
  completed.value = true
  furthest.value = screens.length - 1
  persist()
}
function restart() {
  current.value = 0
  furthest.value = 0
  completed.value = false
  openExplore.value = false
  revealedTerms.value = []
  diagnostic.value = ''
  learningCheck.value = ''
  scenarioChoice.value = ''
  reflection.use = ''; reflection.check = ''; reflection.review = ''
  persist()
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const state = JSON.parse(saved)
    current.value = Math.min(Math.max(0, Number(state.current) || 0), screens.length - 1)
    furthest.value = Math.min(Math.max(current.value, Number(state.furthest) || 0), screens.length - 1)
    completed.value = Boolean(state.completed)
  } catch { localStorage.removeItem(STORAGE_KEY) }
})
</script>

<template>
  <div class="rise-course">
    <header class="rise-topbar">
      <NuxtLink to="/" class="rise-brand" aria-label="Return to Entertrainer home">
        <img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/uhoXkRLkUCsfcHKt.png'" alt="" />
        <span>Entertrainer<span>.</span></span>
      </NuxtLink>
      <div class="rise-course-name">Artificial Intelligence: From Its Origins to the Frontier</div>
      <div class="rise-topbar__actions">
        <button type="button" class="rise-text-button" @click="resourcesOpen = !resourcesOpen" :aria-expanded="resourcesOpen">Resources</button>
        <button type="button" class="rise-menu-button" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen"><span aria-hidden="true">☰</span> Course menu</button>
      </div>
    </header>

    <aside class="rise-sidebar" aria-label="Course menu">
      <div class="rise-progress-summary">
        <span>Course progress</span>
        <b>{{ progress }}% complete</b>
        <div class="rise-progress-bar" aria-hidden="true"><span :style="{ width: `${progress}%` }"></span></div>
      </div>
      <ol class="rise-lessons">
        <li class="rise-lessons__section">Start here</li>
        <li v-for="(screen, index) in screens.slice(0, 2)" :key="screen.id">
          <button type="button" :class="{ active: current === index, done: index <= furthest }" :disabled="index > furthest + 1" @click="go(index)">
            <i>{{ index <= furthest ? '✓' : index + 1 }}</i><span>{{ screen.title }}</span>
          </button>
        </li>
        <li class="rise-lessons__section">Lessons</li>
        <li v-for="(item, index) in AI_MODULES" :key="item.id">
          <button type="button" :class="{ active: active.id === item.id, done: index + 2 <= furthest }" :disabled="index + 2 > furthest + 1" @click="go(index + 2)">
            <i>{{ index + 2 <= furthest ? '✓' : item.number }}</i><span><b>{{ item.short }}</b><small>{{ item.duration }}</small></span>
          </button>
        </li>
        <li class="rise-lessons__section">Finish</li>
        <li><button type="button" :class="{ active: active.kind === 'capstone', done: completed }" :disabled="screens.length - 1 > furthest + 1" @click="go(screens.length - 1)"><i>{{ completed ? '✓' : '13' }}</i><span>Apply your learning</span></button></li>
      </ol>
      <div class="rise-sidebar__status"><span class="rise-status-dot" :class="{ complete: completed }"></span>{{ completed ? 'Course completed' : `${remaining} hours left` }}</div>
    </aside>

    <main class="rise-main" id="main">
      <Transition name="rise-fade" mode="out-in">
        <section :key="active.id" class="rise-screen">
          <template v-if="active.kind === 'welcome'">
            <div class="rise-hero">
              <div class="rise-hero__copy">
                <p class="rise-eyebrow">A beginner-friendly course · 7 hours</p>
                <h1>Understand AI<br />with <em>clarity</em>, not hype.</h1>
                <p>This course is for anyone who is curious about AI. You do not need coding experience or a technical background. We will use everyday examples, short activities, and simple language.</p>
                <div class="rise-hero__details"><span>No technical background needed</span><span>10 short lessons</span><span>Learn at your own pace</span></div>
                <button type="button" class="rise-primary" @click="next">Start course <span aria-hidden="true">→</span></button>
              </div>
              <figure class="rise-hero__art"><img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg'" alt="An illustrated map showing the journey through the history of artificial intelligence." /><figcaption><b>Why this matters</b><span>AI is already changing how we learn, work, travel, create, and make decisions. Understanding the basics helps you use it with confidence.</span></figcaption></figure>
            </div>
            <section class="rise-info-strip" aria-label="What this course covers"><div><b>01</b><span>How AI began</span></div><div><b>02</b><span>How today’s tools work</span></div><div><b>03</b><span>How to use AI responsibly</span></div></section>
          </template>

          <template v-else-if="active.kind === 'objectives'">
            <article class="rise-page-card rise-page-card--objectives">
              <p class="rise-eyebrow">Before you begin</p>
              <h2>By the End of this module, you will be able to:</h2>
              <ol class="rise-objectives"><li><b>1</b><span>Explain the major stages in the development of AI.</span></li><li><b>2</b><span>Tell the difference between common AI approaches, tools, and capabilities.</span></li><li><b>3</b><span>Check AI claims using evidence, limitations, and source quality.</span></li></ol>
              <div class="rise-note"><b>A quick note before you continue</b><p>We will focus on what is publicly known and well supported. We will clearly separate facts, reported claims, rumours, and future possibilities.</p></div>
              <button type="button" class="rise-primary" @click="next">Continue to Lesson 1 <span aria-hidden="true">→</span></button>
            </article>
          </template>

          <template v-else-if="active.kind === 'module' && module">
            <article class="rise-lesson">
              <header class="rise-lesson__header">
                <p class="rise-eyebrow">Lesson {{ module.number }} · {{ module.duration }}</p>
                <h2>{{ module.title }}</h2>
                <p>{{ module.blurb }}</p>
              </header>

              <section v-if="module.visual === 'history'" class="rise-media-block"><img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/lMkColbiQZRDDmAi.jpg'" alt="A visual timeline from early mechanical calculation to modern AI models." /><div><b>Look for the big shift</b><span>Early AI often used rules. Modern AI often learns patterns from examples. Both ideas still matter.</span></div></section>
              <section v-if="module.visual === 'agents'" class="rise-media-block"><img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/MivTADgxAPaQaRCw.jpg'" alt="A visual map of AI tools, planning, and human review." /><div><b>Notice the human review point</b><span>An AI agent is not just a model. It also needs clear instructions, allowed tools, limits, and people who stay accountable.</span></div></section>

              <section class="rise-block rise-block--key">
                <span class="rise-block__label">Key idea</span>
                <template v-if="module.id === 'bearing'"><h3>AI is a tool that helps with a specific job.</h3><p>For example, an AI feature might predict traffic, spot an unusual transaction, suggest the next word on your phone, or help write a first draft. A useful question is not “Is this AI smart?” It is “Is this tool suitable for this job?”</p></template>
                <template v-else-if="module.id === 'rules'"><h3>Some AI follows rules. Some AI learns from examples.</h3><p>Both can be useful. The best choice depends on the problem, the information available, and how easy it is to check the result.</p></template>
                <template v-else-if="module.id === 'data'"><h3>AI needs examples before it can help with new work.</h3><p>Like a learner practising with many questions, an AI system uses examples to improve. After training, it can respond to a new message, image, or task.</p></template>
                <template v-else-if="module.id === 'attention'"><h3>Modern AI looks at the important parts of your input.</h3><p>When you ask a question, the system looks at the words around it and works out which parts may matter most. This is one reason newer language tools can work across many topics.</p></template>
                <template v-else-if="module.id === 'generation'"><h3>Generative AI is helpful for a first draft, not a final decision.</h3><p>It can write, translate, summarise, make pictures, or organise ideas. But a confident answer can still be incomplete, old, biased, or wrong.</p></template>
                <template v-else-if="module.id === 'agents'"><h3>AI agents can take a series of steps.</h3><p>With approved tools, an agent may search, organise, or update information. It needs clear instructions and a person who can review the work and stop it when needed.</p></template>
                <template v-else-if="module.id === 'embodied'"><h3>Real-world AI needs stronger safety checks.</h3><p>A robot, medical tool, or vehicle works around people and places. Small mistakes can have real consequences, so testing and human responsibility are essential.</p></template>
                <template v-else-if="module.id === 'frontier'"><h3>Big AI claims deserve careful checking.</h3><p>Ask what has been shown publicly, who has tested it, and whether the source is reliable. Avoid treating a rumour as a fact.</p></template>
                <template v-else-if="module.id === 'responsible'"><h3>Responsible use starts before you enter a prompt.</h3><p>Think about privacy, fairness, mistakes, and who may be affected. Do not put confidential information into a public tool unless your organisation has approved it.</p></template>
                <template v-else><h3>Start small and learn from the result.</h3><p>Choose one low-risk task where AI can help you begin. Decide what you will check yourself before sharing or using the output.</p></template>
              </section>

              <section class="rise-accordion-block">
                <button type="button" class="rise-accordion" :aria-expanded="openExplore" @click="openExplore = !openExplore"><span><b>Explore this idea</b><small>Optional: open for a little more detail</small></span><i>{{ openExplore ? '−' : '+' }}</i></button>
                <div v-if="openExplore" class="rise-accordion__content"><h3>{{ module.exploreTitle }}</h3><p>{{ module.exploreText }}</p></div>
              </section>

              <section v-if="module.id === 'rules'" class="rise-block rise-block--tabs">
                <div class="rise-block__title"><span class="rise-block__label">Compare</span><h3>Choose a tab to compare the two approaches</h3></div>
                <div class="rise-tabs" role="tablist" aria-label="Compare AI approaches"><button type="button" role="tab" :aria-selected="activeTab === 'rules'" :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">AI with rules</button><button type="button" role="tab" :aria-selected="activeTab === 'examples'" :class="{ active: activeTab === 'examples' }" @click="activeTab = 'examples'">AI with examples</button></div>
                <div class="rise-tab-panel"><template v-if="activeTab === 'rules'"><b>AI with rules</b><p>A person writes clear instructions: “If this happens, do that.” For example, a form can be flagged for review when it meets a set condition.</p><small>Best when the rules are known and easy to explain.</small></template><template v-else><b>AI with examples</b><p>The system looks at many past examples and learns a pattern. For example, it may learn to sort photos or predict likely demand.</p><small>Best when there are useful examples and the result can be checked.</small></template></div>
              </section>

              <section v-if="module.id === 'data'" class="rise-block rise-block--flashcards">
                <div class="rise-block__title"><span class="rise-block__label">Tap to reveal</span><h3>Three useful words</h3><p>Tap each card to see a simple meaning.</p></div>
                <div class="rise-flashcards"><button v-for="card in termCards" :key="card.term" type="button" class="rise-flashcard" :class="{ revealed: revealedTerms.includes(card.term) }" @click="revealTerm(card.term)"><span v-if="!revealedTerms.includes(card.term)"><b>{{ card.term }}</b><small>Tap to reveal</small></span><span v-else><b>{{ card.term }}</b><small>{{ card.plain }}</small></span></button></div>
              </section>

              <section v-if="module.id === 'attention'" class="rise-block rise-block--process"><span class="rise-block__label">How it works</span><h3>A simple view of a modern chat tool</h3><ol><li><b>1</b><span>You ask a question or give an instruction.</span></li><li><b>2</b><span>The model considers the useful parts of your input.</span></li><li><b>3</b><span>It creates a likely next response, one small piece at a time.</span></li><li><b>4</b><span>You review the output before using it for anything important.</span></li></ol></section>

              <section v-if="module.id === 'agents'" class="rise-block rise-block--steps"><span class="rise-block__label">The building blocks</span><h3>A safe agent needs more than a good model</h3><div class="rise-step-row"><span>Clear task</span><i>→</i><span>Approved tools</span><i>→</i><span>Safety limits</span><i>→</i><span>Human review</span></div></section>

              <section v-if="module.video" class="rise-video-block"><div class="rise-video-block__icon" aria-hidden="true">▶</div><div><span class="rise-block__label">Optional video</span><h3>{{ module.video.title }}</h3><p>{{ module.video.instruction }}</p><a :href="module.video.url" target="_blank" rel="noreferrer">Watch the video <span aria-hidden="true">↗</span></a></div></section>

              <section v-if="module.id === 'bearing'" class="rise-check-block">
                <span class="rise-block__label">Check your understanding</span><h3>A chatbot gives you a clear answer about an important topic. What should you do next?</h3>
                <div class="rise-options"><button type="button" :class="{ selected: diagnostic === 'patterns' }" @click="diagnostic = 'patterns'"><b>A</b><span>Use it as a useful starting point, then check the important details with a reliable source.</span></button><button type="button" :class="{ selected: diagnostic === 'trust' }" @click="diagnostic = 'trust'"><b>B</b><span>Trust it because the answer sounds clear and confident.</span></button></div>
                <p v-if="diagnosticFeedback" class="rise-feedback" :class="{ correct: diagnostic === 'patterns' }">{{ diagnosticFeedback }}</p>
              </section>

              <section v-if="module.id === 'data'" class="rise-check-block">
                <span class="rise-block__label">Check your understanding</span><h3>Which sentence describes training?</h3>
                <div class="rise-options rise-options--stack"><button type="button" :class="{ selected: learningCheck === 'inference' }" @click="learningCheck = 'inference'"><b>A</b><span>Using a trained tool to draft a new email from a fresh prompt.</span></button><button type="button" :class="{ selected: learningCheck === 'training' }" @click="learningCheck = 'training'"><b>B</b><span>Using examples and feedback to help the system improve before it is used.</span></button></div>
                <p v-if="learningFeedback" class="rise-feedback" :class="{ correct: learningCheck === 'training' }">{{ learningFeedback }}</p>
              </section>

              <section v-if="module.id === 'frontier'" class="rise-scenario">
                <div class="rise-scenario__label">Scenario</div>
                <div class="rise-scenario__body"><span class="rise-block__label">Make a careful choice</span><h3>You see a post saying a secret AI system can now make every business decision better than people.</h3><p>What is the most responsible next step?</p><div class="rise-options rise-options--stack"><button type="button" :class="{ selected: scenarioChoice === 'check' }" @click="scenarioChoice = 'check'"><b>A</b><span>Look for an official source or independent testing before sharing the claim.</span></button><button type="button" :class="{ selected: scenarioChoice === 'share' }" @click="scenarioChoice = 'share'"><b>B</b><span>Share it quickly because it may be important news.</span></button></div><p v-if="scenarioFeedback" class="rise-feedback" :class="{ correct: scenarioChoice === 'check' }">{{ scenarioFeedback }}</p></div>
              </section>

              <section v-if="module.id === 'responsible'" class="rise-block rise-block--checklist"><span class="rise-block__label">Before you use AI</span><h3>Use this three-question check</h3><ul><li><i>✓</i><span>Am I keeping private or confidential information safe?</span></li><li><i>✓</i><span>Will I check important facts, numbers, and sources?</span></li><li><i>✓</i><span>Does a person remain responsible for the final decision?</span></li></ul></section>

              <section class="rise-source-block"><div><span class="rise-block__label">Source and evidence</span><b>{{ module.confidence }}</b><p>{{ module.sourceLabel }}</p></div><a :href="module.sourceUrl" target="_blank" rel="noreferrer">Open source <span aria-hidden="true">↗</span></a></section>
              <section class="rise-takeaway"><b>Key takeaway</b><p>{{ module.takeaway }}</p></section>
              <div class="rise-complete-row"><span><b>Lesson complete?</b><small>You can return to this lesson from the course menu at any time.</small></span><button type="button" class="rise-primary" @click="next">{{ current < screens.length - 2 ? 'Mark lesson complete' : 'Continue to your action plan' }} <span aria-hidden="true">→</span></button></div>
            </article>
          </template>

          <template v-else>
            <article class="rise-capstone">
              <header><p class="rise-eyebrow">Your action plan</p><h2>Choose one small, responsible way to use AI.</h2><p>Use this final activity to turn the course into something practical. Keep your plan simple and clear.</p></header>
              <form class="rise-capstone__form" @submit.prevent="finish">
                <label><b>1. Choose one task AI could help you start</b><span>Pick a low-risk task such as organising ideas, drafting an outline, or simplifying notes.</span><textarea v-model="reflection.use" rows="2" placeholder="For example: Prepare a first draft of a training outline for my team."></textarea></label>
                <label><b>2. Decide what you will check yourself</b><span>Think about facts, numbers, names, policies, or sources.</span><textarea v-model="reflection.check" rows="2" placeholder="For example: I will check every policy reference and source before sharing it."></textarea></label>
                <label><b>3. Name the person or step that keeps the final decision safe</b><span>Important work should have a clear review step.</span><textarea v-model="reflection.review" rows="2" placeholder="For example: My manager or subject expert will review the final version."></textarea></label>
                <div class="rise-capstone__action"><p><b>To complete this course:</b> fill in all three parts of your action plan.</p><button type="submit" class="rise-primary" :disabled="!capstoneReady">{{ completed ? 'Course completed' : 'Complete course' }} <span aria-hidden="true">→</span></button></div>
              </form>
              <div v-if="completed" class="rise-completion"><i>✓</i><div><span class="rise-block__label">Completion recorded</span><h3>You have completed this course.</h3><p>Keep using the same habit: start small, check important work, and stay responsible for the final decision.</p></div><button type="button" @click="restart">Restart course</button></div>
            </article>
          </template>
        </section>
      </Transition>
    </main>

    <footer class="rise-footerbar">
      <button type="button" :disabled="current === 0" @click="previous">← Previous</button>
      <div class="rise-footerbar__meter"><span :style="{ width: `${progress}%` }"></span></div>
      <span>{{ current + 1 }} of {{ screens.length }} · {{ progress }}% complete</span>
      <button type="button" :disabled="current === screens.length - 1" @click="next">Next →</button>
    </footer>

    <aside v-if="menuOpen" class="rise-drawer" aria-label="Course menu" role="dialog" aria-modal="true"><header><div><span class="rise-block__label">Your learning path</span><h2>Course menu</h2></div><button type="button" @click="menuOpen = false" aria-label="Close course menu">×</button></header><ol><li v-for="(screen, index) in screens" :key="screen.id"><button type="button" :disabled="index > furthest + 1" :class="{ active: index === current, done: index <= furthest }" @click="go(index)"><i>{{ index <= furthest ? '✓' : String(index + 1).padStart(2, '0') }}</i><span>{{ screen.kind === 'module' ? screen.module?.short : screen.title }}</span><small v-if="screen.kind === 'module'">{{ screen.module?.duration }}</small></button></li></ol></aside>
    <aside v-if="resourcesOpen" class="rise-drawer rise-drawer--resources" aria-label="Course resources" role="dialog" aria-modal="true"><header><div><span class="rise-block__label">Keep learning</span><h2>Resources</h2></div><button type="button" @click="resourcesOpen = false" aria-label="Close resources">×</button></header><p>Use these simple definitions when you meet a new AI word. You can also open the full source register used in this course.</p><dl><div v-for="item in AI_GLOSSARY" :key="item[0]"><dt>{{ item[0] }}</dt><dd>{{ item[1] }}</dd></div></dl><a href="/docs/ai-course-research.md">Open source register <span aria-hidden="true">↗</span></a></aside>
  </div>
</template>

<style>
/* Learning Atlas, Rise-inspired: focused e-learning blocks with clear hierarchy and learner-led interactions. */
:root { --rise-ink:#173b52; --rise-ink-soft:#355868; --rise-paper:#f6f2e9; --rise-white:#fffdf8; --rise-mist:#e9f2ed; --rise-teal:#2d7868; --rise-amber:#c98541; --rise-line:#d7ddd8; --rise-muted:#64767c; --rise-sans:'Manrope', ui-sans-serif, system-ui, sans-serif; --rise-serif:'DM Serif Display', Georgia, serif; }
* { box-sizing:border-box; }
.rise-course { min-height:100dvh; display:grid; grid-template-columns:270px minmax(0,1fr); grid-template-rows:66px minmax(0,1fr) 58px; overflow:hidden; background:#edf1ee; color:var(--rise-ink); font-family:var(--rise-sans); }
.rise-topbar { grid-column:1 / -1; display:flex; align-items:center; gap:22px; padding:0 24px; background:var(--rise-white); border-bottom:1px solid var(--rise-line); position:relative; z-index:5; }.rise-brand { display:inline-flex; align-items:center; gap:9px; color:var(--rise-ink); text-decoration:none; font:400 20px var(--rise-serif); white-space:nowrap; }.rise-brand img { width:27px; height:27px; object-fit:contain; }.rise-brand span span { color:var(--rise-teal); }.rise-course-name { min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-size:12px; font-weight:700; color:var(--rise-ink-soft); }.rise-topbar__actions { margin-left:auto; display:flex; gap:7px; }.rise-text-button,.rise-menu-button { min-height:35px; border:0; background:none; color:var(--rise-ink); padding:8px 10px; font:700 11px var(--rise-sans); cursor:pointer; }.rise-menu-button { border:1px solid var(--rise-line); border-radius:4px; }.rise-menu-button:hover,.rise-text-button:hover { background:var(--rise-paper); }
.rise-sidebar { grid-column:1; grid-row:2; overflow-y:auto; background:var(--rise-white); border-right:1px solid var(--rise-line); padding:20px 14px; display:flex; flex-direction:column; }.rise-progress-summary { display:grid; gap:7px; padding:0 8px 19px; border-bottom:1px solid var(--rise-line); }.rise-progress-summary span,.rise-progress-summary b { font-size:10px; }.rise-progress-summary span { color:var(--rise-muted); text-transform:uppercase; letter-spacing:.1em; font-weight:800; }.rise-progress-summary b { color:var(--rise-ink); }.rise-progress-bar,.rise-footerbar__meter { height:4px; background:#e1e7e3; overflow:hidden; }.rise-progress-bar span,.rise-footerbar__meter span { display:block; height:100%; background:var(--rise-teal); transition:width 220ms ease; }.rise-lessons { list-style:none; padding:11px 0; margin:0; }.rise-lessons__section { margin:15px 8px 6px; color:var(--rise-muted); font-size:9px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }.rise-lessons li button { width:100%; display:flex; align-items:flex-start; gap:9px; padding:8px; border:0; border-radius:4px; background:none; color:var(--rise-muted); text-align:left; font:600 11px/1.3 var(--rise-sans); cursor:pointer; }.rise-lessons li button:hover:not(:disabled) { background:#f1f5f2; color:var(--rise-ink); }.rise-lessons li button:disabled { cursor:default; opacity:.55; }.rise-lessons li button.active { background:#e7f1ec; color:var(--rise-ink); }.rise-lessons li button.done { color:var(--rise-ink); }.rise-lessons li i { flex:0 0 19px; width:19px; height:19px; display:grid; place-items:center; border:1px solid var(--rise-line); border-radius:50%; font-size:8px; font-style:normal; color:var(--rise-muted); }.rise-lessons li button.done i { color:white; background:var(--rise-teal); border-color:var(--rise-teal); }.rise-lessons li span { display:grid; gap:2px; }.rise-lessons li b { font-weight:700; }.rise-lessons li small { color:var(--rise-muted); font-size:9px; }.rise-sidebar__status { margin-top:auto; display:flex; align-items:center; gap:7px; border-top:1px solid var(--rise-line); padding:16px 8px 0; font-size:10px; color:var(--rise-muted); font-weight:700; }.rise-status-dot { width:7px; height:7px; background:var(--rise-amber); border-radius:50%; }.rise-status-dot.complete { background:var(--rise-teal); }
.rise-main { grid-column:2; grid-row:2; overflow:auto; background:linear-gradient(180deg,#f3f5f2 0,#edf1ee 100%); }.rise-screen { width:min(100%,1040px); min-height:100%; padding:clamp(32px,6vw,72px) clamp(22px,6vw,80px) 72px; margin:auto; }.rise-hero { min-height:calc(100vh - 196px); display:grid; grid-template-columns:minmax(290px,.92fr) minmax(345px,1.08fr); align-items:center; gap:clamp(34px,7vw,90px); }.rise-eyebrow,.rise-block__label { display:inline-block; color:var(--rise-teal); font-size:10px; line-height:1.2; letter-spacing:.1em; text-transform:uppercase; font-weight:800; }.rise-hero h1,.rise-page-card h2,.rise-lesson h2,.rise-capstone h2 { margin:12px 0 20px; color:var(--rise-ink); font:400 clamp(46px,5.6vw,76px)/.96 var(--rise-serif); letter-spacing:-.04em; }.rise-hero h1 em { color:var(--rise-teal); font-style:italic; }.rise-hero__copy > p { margin:0; max-width:48ch; color:var(--rise-ink-soft); font-size:15px; line-height:1.7; }.rise-hero__details { display:flex; flex-wrap:wrap; gap:7px; margin:24px 0 29px; }.rise-hero__details span { padding:6px 8px; border:1px solid var(--rise-line); border-radius:2px; background:#fbfcfa; font-size:10px; font-weight:700; color:var(--rise-ink-soft); }.rise-primary { display:inline-flex; align-items:center; justify-content:center; gap:12px; min-height:42px; padding:10px 16px; border:1px solid var(--rise-teal); border-radius:3px; background:var(--rise-teal); color:white; cursor:pointer; font:800 11px var(--rise-sans); transition:transform 150ms ease,background 150ms ease; }.rise-primary:hover:not(:disabled) { background:#236456; transform:translateY(-1px); }.rise-primary:active:not(:disabled) { transform:scale(.98); }.rise-primary:disabled { opacity:.45; cursor:not-allowed; }.rise-hero__art { position:relative; margin:0; }.rise-hero__art img { width:100%; min-height:380px; object-fit:cover; display:block; border-radius:3px; box-shadow:10px 11px 0 var(--rise-ink); }.rise-hero__art figcaption { position:absolute; left:-24px; bottom:-24px; max-width:265px; display:grid; gap:5px; padding:14px; background:var(--rise-white); border:1px solid var(--rise-line); box-shadow:0 9px 25px rgba(23,59,82,.12); }.rise-hero__art figcaption b { color:var(--rise-teal); font-size:9px; text-transform:uppercase; letter-spacing:.1em; }.rise-hero__art figcaption span { color:var(--rise-ink-soft); font-size:11px; line-height:1.45; }.rise-info-strip { display:grid; grid-template-columns:repeat(3,1fr); margin-top:44px; border-top:1px solid var(--rise-line); border-bottom:1px solid var(--rise-line); background:rgba(255,253,248,.56); }.rise-info-strip div { display:flex; align-items:center; gap:11px; padding:14px 18px; border-right:1px solid var(--rise-line); }.rise-info-strip div:last-child { border-right:0; }.rise-info-strip b { color:var(--rise-teal); font-size:12px; }.rise-info-strip span { font-size:11px; font-weight:700; color:var(--rise-ink-soft); }
.rise-page-card,.rise-lesson,.rise-capstone { width:min(100%,820px); margin:0 auto; }.rise-page-card { padding:clamp(28px,5vw,56px); border:1px solid var(--rise-line); background:var(--rise-white); border-radius:4px; box-shadow:0 10px 28px rgba(23,59,82,.06); }.rise-page-card h2 { max-width:12ch; font-size:clamp(40px,5vw,62px); }.rise-objectives { list-style:none; padding:0; margin:30px 0; }.rise-objectives li { display:grid; grid-template-columns:30px 1fr; gap:13px; padding:14px 0; border-top:1px solid var(--rise-line); color:var(--rise-ink-soft); font-size:15px; line-height:1.5; }.rise-objectives li:last-child { border-bottom:1px solid var(--rise-line); }.rise-objectives b { color:var(--rise-teal); font-size:12px; }.rise-note { max-width:670px; margin:25px 0; padding:16px 18px; background:var(--rise-mist); border-left:3px solid var(--rise-teal); }.rise-note b { color:var(--rise-ink); font-size:11px; }.rise-note p { margin:6px 0 0; color:var(--rise-ink-soft); font-size:12px; line-height:1.55; }
.rise-lesson__header { padding-bottom:31px; margin-bottom:23px; border-bottom:1px solid var(--rise-line); }.rise-lesson h2 { max-width:15ch; margin:10px 0 13px; font-size:clamp(43px,5.2vw,66px); }.rise-lesson__header > p:not(.rise-eyebrow) { max-width:55ch; margin:0; color:var(--rise-ink-soft); font-size:15px; line-height:1.68; }.rise-media-block { margin:25px 0; overflow:hidden; border:1px solid var(--rise-line); background:var(--rise-white); border-radius:4px; }.rise-media-block img { width:100%; max-height:310px; display:block; object-fit:cover; }.rise-media-block > div { display:grid; gap:4px; padding:14px 17px; }.rise-media-block b { font-size:11px; color:var(--rise-ink); }.rise-media-block span { color:var(--rise-ink-soft); font-size:12px; line-height:1.5; }
.rise-block,.rise-check-block,.rise-source-block,.rise-takeaway,.rise-video-block,.rise-scenario { margin:18px 0; border:1px solid var(--rise-line); border-radius:4px; background:var(--rise-white); }.rise-block { padding:25px; }.rise-block--key { border-top:3px solid var(--rise-teal); }.rise-block h3,.rise-check-block h3,.rise-video-block h3,.rise-scenario h3,.rise-completion h3 { margin:8px 0 10px; color:var(--rise-ink); font:400 clamp(26px,3vw,35px)/1.08 var(--rise-serif); letter-spacing:-.02em; }.rise-block--key p { max-width:62ch; margin:0; color:var(--rise-ink-soft); font-size:14px; line-height:1.7; }.rise-accordion-block { margin:18px 0; border:1px solid var(--rise-line); border-radius:4px; overflow:hidden; background:var(--rise-white); }.rise-accordion { width:100%; display:flex; align-items:center; justify-content:space-between; gap:15px; padding:17px 20px; border:0; background:var(--rise-white); color:var(--rise-ink); text-align:left; cursor:pointer; font-family:var(--rise-sans); }.rise-accordion:hover { background:#f7faf8; }.rise-accordion span { display:grid; gap:3px; }.rise-accordion b { font-size:12px; }.rise-accordion small { color:var(--rise-muted); font-size:10px; }.rise-accordion i { color:var(--rise-teal); font-size:22px; font-style:normal; }.rise-accordion__content { padding:0 20px 20px; border-top:1px solid var(--rise-line); }.rise-accordion__content h3 { margin:17px 0 7px; font:400 25px var(--rise-serif); }.rise-accordion__content p { margin:0; color:var(--rise-ink-soft); font-size:13px; line-height:1.65; }
.rise-block__title p { margin:4px 0 0; color:var(--rise-muted); font-size:12px; }.rise-tabs { display:flex; gap:0; margin-top:18px; border-bottom:1px solid var(--rise-line); }.rise-tabs button { padding:10px 13px; border:0; border-bottom:3px solid transparent; background:none; color:var(--rise-muted); cursor:pointer; font:800 11px var(--rise-sans); }.rise-tabs button.active { color:var(--rise-teal); border-bottom-color:var(--rise-teal); }.rise-tab-panel { min-height:128px; margin-top:17px; padding:16px; background:#f4f8f5; }.rise-tab-panel b { font-size:12px; }.rise-tab-panel p { margin:7px 0; color:var(--rise-ink-soft); font-size:13px; line-height:1.55; }.rise-tab-panel small { color:var(--rise-teal); font-size:10px; font-weight:800; }.rise-flashcards { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:16px; }.rise-flashcard { min-height:132px; padding:15px; border:1px solid var(--rise-line); border-radius:3px; background:#fbfcfa; color:var(--rise-ink); text-align:left; cursor:pointer; transition:transform 150ms ease,background 150ms ease; }.rise-flashcard:hover { transform:translateY(-2px); border-color:var(--rise-teal); }.rise-flashcard.revealed { background:var(--rise-mist); }.rise-flashcard span { display:grid; gap:9px; }.rise-flashcard b { font-size:13px; }.rise-flashcard small { color:var(--rise-muted); font-size:11px; line-height:1.45; }.rise-block--process ol { list-style:none; padding:0; margin:17px 0 0; display:grid; gap:10px; }.rise-block--process li { display:grid; grid-template-columns:26px 1fr; gap:10px; align-items:center; padding-bottom:10px; border-bottom:1px solid var(--rise-line); font-size:12px; color:var(--rise-ink-soft); }.rise-block--process li:last-child { border-bottom:0; padding-bottom:0; }.rise-block--process li b { width:24px; height:24px; display:grid; place-items:center; background:var(--rise-mist); color:var(--rise-teal); border-radius:50%; font-size:10px; }.rise-step-row { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:17px; }.rise-step-row span { padding:8px 10px; background:#f2f7f4; border:1px solid var(--rise-line); font-size:11px; font-weight:700; }.rise-step-row i { color:var(--rise-teal); font-style:normal; }.rise-video-block { display:grid; grid-template-columns:54px 1fr; gap:16px; padding:19px; }.rise-video-block__icon { width:42px; height:42px; display:grid; place-items:center; border-radius:50%; background:var(--rise-teal); color:white; font-size:15px; }.rise-video-block h3 { margin:5px 0; font-size:28px; }.rise-video-block p { margin:0; color:var(--rise-ink-soft); font-size:12px; line-height:1.55; }.rise-video-block a,.rise-source-block a,.rise-drawer > a { display:inline-flex; gap:7px; margin-top:10px; color:var(--rise-teal); font-size:11px; font-weight:800; text-decoration:none; }
.rise-check-block { padding:25px; background:#fffdfa; }.rise-options { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:17px; }.rise-options--stack { grid-template-columns:1fr; }.rise-options button { display:grid; grid-template-columns:22px 1fr; gap:9px; align-items:start; padding:12px; border:1px solid var(--rise-line); border-radius:3px; background:var(--rise-white); color:var(--rise-ink-soft); text-align:left; cursor:pointer; font:600 12px/1.5 var(--rise-sans); }.rise-options button:hover { border-color:var(--rise-teal); }.rise-options button.selected { border-color:var(--rise-teal); background:#eaf4ef; }.rise-options b { width:20px; height:20px; display:grid; place-items:center; border-radius:50%; background:#e9eeeb; color:var(--rise-ink); font-size:9px; }.rise-feedback { margin:13px 0 0; padding:11px 13px; background:#fae9df; color:#87492e; font-size:12px; line-height:1.5; }.rise-feedback.correct { background:#e5f2eb; color:#17594b; }.rise-scenario { overflow:hidden; display:grid; grid-template-columns:135px 1fr; }.rise-scenario__label { display:flex; align-items:flex-start; padding:23px 16px; background:var(--rise-ink); color:white; font:700 11px var(--rise-sans); letter-spacing:.08em; text-transform:uppercase; }.rise-scenario__body { padding:25px; }.rise-scenario__body > p { color:var(--rise-ink-soft); font-size:13px; }.rise-block--checklist ul { list-style:none; padding:0; margin:17px 0 0; display:grid; gap:11px; }.rise-block--checklist li { display:grid; grid-template-columns:22px 1fr; gap:9px; align-items:center; color:var(--rise-ink-soft); font-size:12px; }.rise-block--checklist i { width:20px; height:20px; display:grid; place-items:center; border-radius:50%; background:#e3f1e9; color:var(--rise-teal); font-size:11px; font-style:normal; font-weight:800; }
.rise-source-block { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:15px 17px; background:#f2f7f4; }.rise-source-block div { display:grid; gap:4px; }.rise-source-block b { color:var(--rise-teal); font-size:10px; text-transform:uppercase; letter-spacing:.08em; }.rise-source-block p { margin:0; color:var(--rise-ink); font-size:12px; font-weight:800; }.rise-source-block a { margin:0; white-space:nowrap; }.rise-takeaway { display:grid; grid-template-columns:120px 1fr; gap:14px; padding:16px 18px; border-left:3px solid var(--rise-amber); }.rise-takeaway b { color:var(--rise-amber); font-size:10px; text-transform:uppercase; letter-spacing:.1em; }.rise-takeaway p { margin:0; color:var(--rise-ink); font-size:13px; line-height:1.5; font-weight:700; }.rise-complete-row { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-top:26px; padding-top:20px; border-top:1px solid var(--rise-line); }.rise-complete-row span { display:grid; gap:3px; }.rise-complete-row b { font-size:11px; }.rise-complete-row small { color:var(--rise-muted); font-size:10px; }
.rise-capstone header { max-width:690px; }.rise-capstone h2 { max-width:12ch; font-size:clamp(43px,5.3vw,68px); }.rise-capstone header > p:not(.rise-eyebrow) { margin:0 0 26px; color:var(--rise-ink-soft); font-size:15px; line-height:1.65; }.rise-capstone__form { padding:25px; border:1px solid var(--rise-line); border-radius:4px; background:var(--rise-white); display:grid; gap:19px; }.rise-capstone__form label { display:grid; gap:5px; }.rise-capstone__form label b { font-size:12px; }.rise-capstone__form label span { color:var(--rise-muted); font-size:11px; }.rise-capstone textarea { width:100%; min-height:58px; resize:vertical; padding:11px 12px; border:1px solid var(--rise-line); border-radius:3px; background:#fbfcfa; color:var(--rise-ink); font:500 12px/1.5 var(--rise-sans); outline:none; }.rise-capstone textarea:focus { border-color:var(--rise-teal); box-shadow:0 0 0 3px rgba(45,120,104,.12); }.rise-capstone__action { display:flex; align-items:center; justify-content:space-between; gap:18px; padding-top:6px; }.rise-capstone__action p { margin:0; max-width:34ch; color:var(--rise-muted); font-size:11px; line-height:1.5; }.rise-completion { display:grid; grid-template-columns:48px 1fr auto; align-items:center; gap:16px; margin-top:17px; padding:21px; background:var(--rise-ink); color:white; border-radius:4px; }.rise-completion > i { width:38px; height:38px; display:grid; place-items:center; border:1px solid #b1dac8; border-radius:50%; color:#b1dac8; font-style:normal; }.rise-completion h3 { color:white; margin:4px 0; font-size:27px; }.rise-completion p { margin:0; color:#d5e1dd; font-size:11px; line-height:1.5; }.rise-completion .rise-block__label { color:#a8d5c1; }.rise-completion button { border:0; background:none; color:#b7e1ce; text-decoration:underline; white-space:nowrap; cursor:pointer; font:700 11px var(--rise-sans); }
.rise-footerbar { grid-column:1 / -1; grid-row:3; display:grid; grid-template-columns:auto minmax(120px,1fr) auto auto; align-items:center; gap:15px; padding:0 23px; border-top:1px solid var(--rise-line); background:var(--rise-white); z-index:4; }.rise-footerbar button { border:0; background:none; color:var(--rise-ink); cursor:pointer; font:800 11px var(--rise-sans); }.rise-footerbar button:disabled { cursor:not-allowed; opacity:.36; }.rise-footerbar > span { color:var(--rise-muted); font-size:10px; white-space:nowrap; }
.rise-drawer { position:fixed; top:66px; right:0; bottom:58px; z-index:10; width:min(405px,100vw); overflow:auto; padding:26px; background:var(--rise-white); border-left:1px solid var(--rise-line); box-shadow:-14px 0 35px rgba(23,59,82,.14); animation:drawer-in 190ms ease-out both; }.rise-drawer header { display:flex; justify-content:space-between; align-items:start; padding-bottom:17px; border-bottom:1px solid var(--rise-line); }.rise-drawer h2 { margin:5px 0 0; font:400 36px var(--rise-serif); }.rise-drawer header button { width:31px; height:31px; border:1px solid var(--rise-line); background:none; color:var(--rise-ink); cursor:pointer; font-size:21px; }.rise-drawer ol { list-style:none; padding:10px 0; margin:0; }.rise-drawer li button { width:100%; display:grid; grid-template-columns:30px 1fr auto; gap:8px; align-items:center; padding:12px 0; border:0; border-bottom:1px solid var(--rise-line); background:none; color:var(--rise-ink); text-align:left; cursor:pointer; }.rise-drawer li button:disabled { cursor:default; opacity:.45; }.rise-drawer li i { width:21px; height:21px; display:grid; place-items:center; border-radius:50%; background:#f0f3f0; color:var(--rise-muted); font-size:9px; font-style:normal; }.rise-drawer li button.done i { background:var(--rise-teal); color:white; }.rise-drawer li button.active { color:var(--rise-teal); }.rise-drawer li span { font-size:12px; font-weight:700; }.rise-drawer li small { font-size:9px; color:var(--rise-muted); }.rise-drawer--resources > p { color:var(--rise-ink-soft); font-size:12px; line-height:1.55; }.rise-drawer dl { margin:16px 0; }.rise-drawer dl div { padding:11px 0; border-top:1px solid var(--rise-line); }.rise-drawer dt { color:var(--rise-ink); font-size:12px; font-weight:800; }.rise-drawer dd { margin:4px 0 0; color:var(--rise-muted); font-size:11px; line-height:1.5; }
.rise-fade-enter-active,.rise-fade-leave-active { transition:opacity 200ms ease,transform 200ms ease; }.rise-fade-enter-from { opacity:0; transform:translateY(10px); }.rise-fade-leave-to { opacity:0; transform:translateY(-5px); } @keyframes drawer-in { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
@media (max-width:900px) { .rise-course { grid-template-columns:1fr; grid-template-rows:61px minmax(0,1fr) 56px; }.rise-topbar { padding:0 15px; }.rise-sidebar { display:none; }.rise-main { grid-column:1; }.rise-hero { grid-template-columns:1fr; min-height:auto; }.rise-hero__art { margin-top:10px; }.rise-hero__art img { min-height:285px; }.rise-course-name { display:none; }.rise-screen { padding:35px 22px 65px; }.rise-footerbar { padding:0 15px; }.rise-drawer { top:61px; bottom:56px; }.rise-lesson h2 { max-width:100%; }.rise-info-strip { margin-top:35px; }.rise-info-strip div { padding:13px 10px; }.rise-source-block { align-items:flex-start; flex-direction:column; }.rise-source-block a { margin-top:3px; }.rise-topbar__actions { gap:0; } }
@media (max-width:580px) { .rise-brand { font-size:18px; }.rise-topbar__actions .rise-text-button { display:none; }.rise-menu-button { padding:8px; }.rise-menu-button span { display:none; }.rise-hero h1 { font-size:47px; }.rise-hero__art figcaption { position:relative; left:auto; bottom:auto; max-width:none; box-shadow:none; border-top:0; }.rise-info-strip { grid-template-columns:1fr; }.rise-info-strip div { border-right:0; border-bottom:1px solid var(--rise-line); }.rise-info-strip div:last-child { border-bottom:0; }.rise-flashcards,.rise-options { grid-template-columns:1fr; }.rise-scenario { grid-template-columns:1fr; }.rise-scenario__label { padding:11px 16px; }.rise-takeaway { grid-template-columns:1fr; gap:5px; }.rise-complete-row,.rise-capstone__action { flex-direction:column; align-items:flex-start; }.rise-completion { grid-template-columns:1fr; }.rise-footerbar { grid-template-columns:auto 1fr auto; }.rise-footerbar > span { display:none; } }
@media (prefers-reduced-motion:reduce) { .rise-fade-enter-active,.rise-fade-leave-active,.rise-progress-bar span,.rise-footerbar__meter span { transition:none; }.rise-drawer { animation:none; } }
</style>
