<script setup lang="ts">
/**
 * Rise-style course reminder: neutral surfaces, compact sans-serif type,
 * restrained borders, direct instructional labels, and low-chrome blocks.
 */
import { AI_GLOSSARY, AI_MODULES, type AiModule } from '~/content/aiCourse'

type Screen = { id: string; kind: 'welcome' | 'objectives' | 'module' | 'capstone'; title: string; module?: AiModule }
type LessonGuide = { title: string; text: string; action: string }

const STORAGE_KEY = 'entertrainer-ai-atlas-v4'
const LEGACY_STORAGE_KEY = 'entertrainer-ai-atlas-v3'
const screens: Screen[] = [
  { id: 'welcome', kind: 'welcome', title: 'Introduction' },
  { id: 'objectives', kind: 'objectives', title: 'Course objectives' },
  ...AI_MODULES.map(module => ({ id: module.id, kind: 'module' as const, title: module.title, module })),
  { id: 'capstone', kind: 'capstone', title: 'Apply your learning' }
]

const termCards = [
  { term: 'Training', plain: 'The stage where a system improves from examples.' },
  { term: 'Inference', plain: 'The stage where a trained system responds to new input.' },
  { term: 'Dataset', plain: 'A collection of examples used to train, test, or check a system.' }
]

const lessonGuides: Record<string, LessonGuide> = {
  bearing: { title: 'Think about a task you do regularly.', text: 'Identify whether an AI feature could help with that task.', action: 'View example' },
  rules: { title: 'Compare the two approaches.', text: 'Decide whether the task needs written rules or useful examples.', action: 'View comparison' },
  data: { title: 'Think about the examples.', text: 'Imagine training a photo sorter. What examples would it need?', action: 'View key terms' },
  attention: { title: 'Review the process.', text: 'Follow the steps from a prompt to a response.', action: 'View process' },
  generation: { title: 'Choose an appropriate use.', text: 'Identify one task where an AI draft could help and one part you would check.', action: 'View guidance' },
  agents: { title: 'Review the workflow.', text: 'Identify the controls that keep an AI agent within an approved task.', action: 'View workflow' },
  embodied: { title: 'Consider the consequence.', text: 'Compare an incorrect answer with an incorrect physical action.', action: 'View example' },
  frontier: { title: 'Review the evidence.', text: 'Use the scenario to separate a strong claim from reliable evidence.', action: 'View scenario' },
  responsible: { title: 'Use the checklist.', text: 'Consider privacy, review, and accountability before using an AI tool.', action: 'View checklist' },
  next: { title: 'Prepare a small next step.', text: 'Choose a low-risk task where you can try a careful AI workflow.', action: 'View guidance' }
}

definePageMeta({ layout: false, pageTransition: { name: 'rise-fade', mode: 'out-in' } })
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap' }
  ]
})
useSeoMeta({
  title: 'Artificial Intelligence: From Its Origins to the Frontier · Entertrainer',
  description: 'A structured introductory course on artificial intelligence, evidence, and responsible use.'
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
const lessonGuide = computed(() => module.value ? lessonGuides[module.value.id] : null)
const progress = computed(() => Math.round((furthest.value / (screens.length - 1)) * 100))
const capstoneReady = computed(() => reflection.use.trim().length > 7 && reflection.check.trim().length > 7 && reflection.review.trim().length > 7)
const diagnosticFeedback = computed(() => !diagnostic.value ? '' : diagnostic.value === 'patterns' ? 'Correct. Check important information before you use the response.' : 'Try again. A confident answer can still be incorrect.')
const learningFeedback = computed(() => !learningCheck.value ? '' : learningCheck.value === 'training' ? 'Correct. Training is the stage where a system improves from examples.' : 'Try again. This describes using a system after it has been trained.')
const scenarioFeedback = computed(() => !scenarioChoice.value ? '' : scenarioChoice.value === 'check' ? 'Correct. Find official evidence or independent testing before sharing the claim.' : 'Try again. A post alone does not prove a major claim.')

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
function revealTerm(term: string) { revealedTerms.value = revealedTerms.value.includes(term) ? revealedTerms.value.filter(item => item !== term) : [...revealedTerms.value, term] }
function finish() { if (capstoneReady.value) { completed.value = true; furthest.value = screens.length - 1; persist() } }
function restart() {
  current.value = 0; furthest.value = 0; completed.value = false; openExplore.value = false
  revealedTerms.value = []; diagnostic.value = ''; learningCheck.value = ''; scenarioChoice.value = ''
  reflection.use = ''; reflection.check = ''; reflection.review = ''; persist()
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!saved) return
  try {
    const state = JSON.parse(saved)
    current.value = Math.min(Math.max(0, Number(state.current) || 0), screens.length - 1)
    furthest.value = Math.min(Math.max(current.value, Number(state.furthest) || 0), screens.length - 1)
    completed.value = Boolean(state.completed)
    persist()
  } catch { localStorage.removeItem(STORAGE_KEY) }
})
</script>

<template>
  <div class="rise-course">
    <header class="rise-header">
      <NuxtLink to="/" class="rise-brand" aria-label="Return to Entertrainer home"><img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/uhoXkRLkUCsfcHKt.png'" alt="" /><span>Entertrainer</span></NuxtLink>
      <div class="rise-course-title"><b>Artificial Intelligence: From Its Origins to the Frontier</b><span>Course</span></div>
      <div class="rise-progress"><span>Progress</span><div><i :style="{ width: `${progress}%` }"></i></div><b>{{ progress }}%</b></div>
      <div class="rise-header-actions"><button type="button" @click="resourcesOpen = !resourcesOpen">Resources</button><button type="button" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen">Contents</button></div>
    </header>

    <main class="rise-main" id="main">
      <Transition name="rise-fade" mode="out-in">
        <section :key="active.id" class="rise-screen">
          <template v-if="active.kind === 'welcome'">
            <article class="rise-intro">
              <div><p class="rise-overline">Introduction</p><h1>Artificial Intelligence:<br />From Its Origins to the Frontier</h1><p class="rise-summary">This course introduces key AI ideas, current applications, and responsible use through short lessons and practical activities.</p><div class="rise-facts"><span>10 lessons</span><span>About 2 hours</span><span>No technical background required</span></div><button type="button" class="rise-primary" @click="next">Start course</button></div>
              <figure><img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg'" alt="Illustrated map tracing the development of artificial intelligence." /><figcaption>From early ideas to current AI tools</figcaption></figure>
            </article>
          </template>

          <template v-else-if="active.kind === 'objectives'">
            <article class="rise-objectives"><p class="rise-overline">Course objectives</p><h2>By the End of this module, you will be able to:</h2><ol><li><i>1</i><span>Explain the major stages in AI development.</span></li><li><i>2</i><span>Distinguish common AI approaches and capabilities.</span></li><li><i>3</i><span>Check AI claims using evidence and limitations.</span></li></ol><aside><b>Note</b><p>Throughout the course, distinguish facts, reported claims, rumours, and future possibilities.</p></aside><button type="button" class="rise-primary" @click="next">Continue</button></article>
          </template>

          <template v-else-if="active.kind === 'module' && module">
            <article class="rise-lesson">
              <header><p class="rise-overline">Lesson {{ module.number }} · {{ module.duration }}</p><h2>{{ module.title }}</h2><p>{{ module.blurb }}</p></header>
              <section v-if="lessonGuide" class="rise-block"><h3>{{ lessonGuide.title }}</h3><p>{{ lessonGuide.text }}</p><button type="button" class="rise-link" @click="openExplore = true">{{ lessonGuide.action }}</button></section>
              <section v-if="module.visual === 'history'" class="rise-media"><img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/lMkColbiQZRDDmAi.jpg'" alt="Visual timeline from early mechanical calculation to modern AI models." /><p>Early AI often used written rules. Many current systems learn patterns from examples.</p></section>
              <section v-if="module.visual === 'agents'" class="rise-media"><img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/MivTADgxAPaQaRCw.jpg'" alt="Visual map of AI tools, planning, and human review." /><p>An AI agent needs clear instructions, approved tools, limits, and human review.</p></section>
              <section class="rise-key"><h3>Key point</h3><template v-if="module.id === 'bearing'"><p><b>AI supports a specific task.</b> Consider whether the tool suits the job.</p></template><template v-else-if="module.id === 'rules'"><p><b>AI may use rules or examples.</b> Select the method that fits the task.</p></template><template v-else-if="module.id === 'data'"><p><b>AI learns from examples.</b> It then applies that learning to new input.</p></template><template v-else-if="module.id === 'attention'"><p><b>Modern AI weighs relevant context.</b> This helps it respond across many topics.</p></template><template v-else-if="module.id === 'generation'"><p><b>Generative AI creates a first draft.</b> Review it before you rely on it.</p></template><template v-else-if="module.id === 'agents'"><p><b>Agents can take approved steps.</b> Limits and review keep the work safe.</p></template><template v-else-if="module.id === 'embodied'"><p><b>Real-world AI needs stronger safeguards.</b> Physical mistakes can have serious consequences.</p></template><template v-else-if="module.id === 'frontier'"><p><b>Strong claims need strong evidence.</b> Check the source before you share.</p></template><template v-else-if="module.id === 'responsible'"><p><b>Responsible use starts before the prompt.</b> Protect data and consider who may be affected.</p></template><template v-else><p><b>Start small and check the result.</b> Use AI where the risk is low and review is easy.</p></template></section>
              <section class="rise-accordion"><button type="button" :aria-expanded="openExplore" @click="openExplore = !openExplore"><span>Additional information</span><i>{{ openExplore ? '−' : '+' }}</i></button><div v-if="openExplore"><h3>{{ module.exploreTitle }}</h3><p>{{ module.exploreText }}</p></div></section>
              <section v-if="module.id === 'rules'" class="rise-block"><h3>Compare the two approaches</h3><div class="rise-tabs" role="tablist"><button type="button" :class="{ active: activeTab === 'rules' }" :aria-selected="activeTab === 'rules'" @click="activeTab = 'rules'">Written rules</button><button type="button" :class="{ active: activeTab === 'examples' }" :aria-selected="activeTab === 'examples'" @click="activeTab = 'examples'">Past examples</button></div><div class="rise-tab-content"><template v-if="activeTab === 'rules'"><b>Written rules</b><p>A person defines the instructions.</p><small>Use when the rule is clear.</small></template><template v-else><b>Past examples</b><p>The system learns a pattern from examples.</p><small>Use when the result can be checked.</small></template></div></section>
              <section v-if="module.id === 'data'" class="rise-block"><h3>Key terms</h3><p>Select a card to view the definition.</p><div class="rise-flashcards"><button v-for="card in termCards" :key="card.term" type="button" :class="{ revealed: revealedTerms.includes(card.term) }" @click="revealTerm(card.term)"><span v-if="!revealedTerms.includes(card.term)"><b>{{ card.term }}</b><small>Select to view</small></span><span v-else><b>{{ card.term }}</b><small>{{ card.plain }}</small></span></button></div></section>
              <section v-if="module.id === 'attention' || module.id === 'agents'" class="rise-block"><h3>{{ module.id === 'attention' ? 'How a response is created' : 'Elements of a controlled workflow' }}</h3><ol class="rise-steps"><template v-if="module.id === 'attention'"><li><i>1</i><span>You give a prompt.</span></li><li><i>2</i><span>The model weighs the context.</span></li><li><i>3</i><span>It creates a likely response.</span></li><li><i>4</i><span>You review the output.</span></li></template><template v-else><li><i>1</i><span>Clear task</span></li><li><i>2</i><span>Approved tools</span></li><li><i>3</i><span>Defined limits</span></li><li><i>4</i><span>Human review</span></li></template></ol></section>
              <section v-if="module.video" class="rise-video"><div aria-hidden="true">▶</div><div><h3>Optional video</h3><p>{{ module.video.title }}</p><a :href="module.video.url" target="_blank" rel="noreferrer">Watch video</a></div></section>
              <section v-if="module.id === 'bearing'" class="rise-block"><h3>Knowledge check</h3><p>What should you do with an important AI answer?</p><div class="rise-options"><button type="button" :class="{ selected: diagnostic === 'patterns' }" @click="diagnostic = 'patterns'"><i>A</i><span>Check it with a reliable source.</span></button><button type="button" :class="{ selected: diagnostic === 'trust' }" @click="diagnostic = 'trust'"><i>B</i><span>Trust it because it sounds confident.</span></button></div><aside v-if="diagnosticFeedback" :class="{ correct: diagnostic === 'patterns' }">{{ diagnosticFeedback }}</aside></section>
              <section v-if="module.id === 'data'" class="rise-block"><h3>Knowledge check</h3><p>Which describes training?</p><div class="rise-options stack"><button type="button" :class="{ selected: learningCheck === 'inference' }" @click="learningCheck = 'inference'"><i>A</i><span>Using a trained tool on a new prompt.</span></button><button type="button" :class="{ selected: learningCheck === 'training' }" @click="learningCheck = 'training'"><i>B</i><span>Improving a system with examples and feedback.</span></button></div><aside v-if="learningFeedback" :class="{ correct: learningCheck === 'training' }">{{ learningFeedback }}</aside></section>
              <section v-if="module.id === 'frontier'" class="rise-block"><h3>Scenario</h3><p>A post makes a dramatic AI claim. Select the most appropriate response.</p><div class="rise-options stack"><button type="button" :class="{ selected: scenarioChoice === 'check' }" @click="scenarioChoice = 'check'"><i>A</i><span>Look for official evidence or independent testing.</span></button><button type="button" :class="{ selected: scenarioChoice === 'share' }" @click="scenarioChoice = 'share'"><i>B</i><span>Share it immediately.</span></button></div><aside v-if="scenarioFeedback" :class="{ correct: scenarioChoice === 'check' }">{{ scenarioFeedback }}</aside></section>
              <section v-if="module.id === 'responsible'" class="rise-block"><h3>Before you use AI</h3><ul class="rise-checklist"><li><i>✓</i><span>Private information is protected.</span></li><li><i>✓</i><span>Important outputs will be checked.</span></li><li><i>✓</i><span>A person remains accountable.</span></li></ul></section>
              <section class="rise-source"><span>Source</span><b>{{ module.sourceLabel }}</b><a :href="module.sourceUrl" target="_blank" rel="noreferrer">View source</a></section>
              <section class="rise-takeaway"><b>Takeaway</b><p>{{ module.takeaway }}</p></section>
              <div class="rise-lesson-nav"><button type="button" class="rise-secondary" @click="previous">Previous lesson</button><button type="button" class="rise-primary" @click="next">{{ current < screens.length - 2 ? 'Continue to the next lesson' : 'Continue to the action plan' }}</button></div>
            </article>
          </template>

          <template v-else>
            <article class="rise-capstone"><p class="rise-overline">Apply your learning</p><h2>Prepare a responsible AI action plan</h2><p>Complete each step below. Your plan should identify a low-risk use, a review step, and accountability.</p><form @submit.prevent="finish"><label><b>1. Choose a low-risk task.</b><span>Select a task that you can review easily.</span><textarea v-model="reflection.use" rows="2" placeholder="For example: Draft a training outline."></textarea></label><label><b>2. State what you will check.</b><span>Consider facts, policies, or sources.</span><textarea v-model="reflection.check" rows="2" placeholder="For example: Check every source."></textarea></label><label><b>3. Name the review step.</b><span>State who confirms the final result.</span><textarea v-model="reflection.review" rows="2" placeholder="For example: A subject expert reviews it."></textarea></label><div class="rise-form-action"><p>Complete all three fields to finish the course.</p><button type="submit" class="rise-primary" :disabled="!capstoneReady">{{ completed ? 'Course completed' : 'Complete course' }}</button></div></form><aside v-if="completed"><b>Course completed</b><p>Your action plan has been recorded in this browser.</p><button type="button" class="rise-link" @click="restart">Restart course</button></aside></article>
          </template>
        </section>
      </Transition>
    </main>
    <footer class="rise-footer"><button type="button" :disabled="current === 0" @click="previous">Previous</button><span>{{ current + 1 }} of {{ screens.length }}</span><button type="button" :disabled="current === screens.length - 1" @click="next">Next</button></footer>
    <aside v-if="menuOpen" class="rise-drawer" aria-label="Course contents" role="dialog" aria-modal="true"><header><h2>Contents</h2><button type="button" @click="menuOpen = false" aria-label="Close contents">×</button></header><ol><li v-for="(screen, index) in screens" :key="screen.id"><button type="button" :class="{ active: index === current, done: index <= furthest }" :disabled="index > furthest + 1" @click="go(index)"><i>{{ index <= furthest ? '✓' : index + 1 }}</i><span>{{ screen.kind === 'module' ? screen.module?.short : screen.title }}</span><small v-if="screen.kind === 'module'">{{ screen.module?.duration }}</small></button></li></ol></aside>
    <aside v-if="resourcesOpen" class="rise-drawer" aria-label="Course resources" role="dialog" aria-modal="true"><header><h2>Resources</h2><button type="button" @click="resourcesOpen = false" aria-label="Close resources">×</button></header><p>Use these definitions when you meet an unfamiliar AI term.</p><dl><div v-for="item in AI_GLOSSARY" :key="item[0]"><dt>{{ item[0] }}</dt><dd>{{ item[1] }}</dd></div></dl><a href="/docs/ai-course-research.md">View source register</a></aside>
  </div>
</template>

<style>
:root { --text:#303030; --muted:#737373; --line:#e2e2e2; --bg:#f5f5f5; --accent:#2f7c8e; --accent-soft:#edf6f7; --success:#3f8b73; --error:#a95549; --sans:'Lato',Arial,sans-serif; }
* { box-sizing:border-box; }
.rise-course { min-height:100dvh; display:grid; grid-template-rows:62px minmax(0,1fr) 56px; background:var(--bg); color:var(--text); font-family:var(--sans); }
.rise-header { display:grid; grid-template-columns:auto minmax(0,1fr) minmax(145px,205px) auto; align-items:center; gap:22px; padding:0 28px; background:#fff; border-bottom:1px solid var(--line); }
.rise-brand { display:flex; align-items:center; gap:8px; color:var(--text); text-decoration:none; font-size:15px; font-weight:900; }.rise-brand img { width:25px; height:25px; object-fit:contain; }
.rise-course-title { display:grid; gap:1px; min-width:0; }.rise-course-title b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; }.rise-course-title span { color:var(--muted); font-size:10px; }
.rise-progress { display:grid; grid-template-columns:auto 1fr auto; gap:7px; align-items:center; }.rise-progress span,.rise-progress b { color:var(--muted); font-size:10px; }.rise-progress div { height:4px; overflow:hidden; background:#e8e8e8; border-radius:99px; }.rise-progress i { display:block; height:100%; background:var(--accent); border-radius:inherit; transition:width .2s ease; }
.rise-header-actions { display:flex; gap:3px; }.rise-header-actions button,.rise-link { padding:8px 0; border:0; background:none; color:var(--accent); cursor:pointer; font:700 11px var(--sans); text-decoration:underline; }
.rise-main { overflow:auto; background:var(--bg); }.rise-screen { width:min(100%,850px); min-height:100%; margin:auto; padding:clamp(32px,6vw,64px) 24px; }
.rise-overline { margin:0 0 8px; color:var(--muted); font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
.rise-intro { display:grid; grid-template-columns:1fr 1fr; gap:36px; align-items:center; min-height:calc(100vh - 185px); }.rise-intro h1,.rise-objectives h2,.rise-lesson h2,.rise-capstone h2 { margin:0 0 16px; font-size:clamp(34px,4.3vw,54px); line-height:1.12; font-weight:700; letter-spacing:-.025em; }.rise-summary { margin:0; max-width:43ch; color:#555; font-size:15px; line-height:1.6; }.rise-facts { display:flex; flex-wrap:wrap; gap:8px; margin:20px 0; }.rise-facts span { padding:7px 9px; border:1px solid var(--line); background:#fafafa; color:#555; font-size:10px; }.rise-intro figure { margin:0; border:1px solid var(--line); background:#fff; }.rise-intro figure img { display:block; width:100%; height:260px; object-fit:cover; }.rise-intro figcaption { padding:11px 13px; color:#555; font-size:11px; }
.rise-primary,.rise-secondary { min-height:39px; padding:9px 15px; border-radius:3px; cursor:pointer; font:700 11px var(--sans); }.rise-primary { border:1px solid var(--accent); background:var(--accent); color:#fff; }.rise-primary:hover:not(:disabled) { background:#256b7a; }.rise-primary:disabled { opacity:.45; cursor:not-allowed; }.rise-secondary { border:1px solid var(--line); background:#fff; color:var(--text); }.rise-secondary:hover { background:#f7f7f7; }
.rise-objectives,.rise-capstone { max-width:710px; margin:0 auto; padding:32px; background:#fff; border:1px solid var(--line); }.rise-objectives h2 { max-width:15ch; font-size:clamp(31px,3.7vw,43px); }.rise-objectives ol { padding:0; margin:28px 0; list-style:none; }.rise-objectives li { display:grid; grid-template-columns:28px 1fr; gap:11px; align-items:start; padding:14px 0; border-top:1px solid var(--line); font-size:14px; line-height:1.45; }.rise-objectives li:last-child { border-bottom:1px solid var(--line); }.rise-objectives i { width:22px; height:22px; display:grid; place-items:center; border:1px solid var(--accent); border-radius:50%; color:var(--accent); font-size:10px; font-style:normal; font-weight:700; }.rise-objectives aside { padding:13px 14px; margin:20px 0; background:#f7f7f7; border-left:3px solid var(--accent); }.rise-objectives aside b { font-size:11px; }.rise-objectives aside p { margin:4px 0 0; color:#555; font-size:12px; line-height:1.5; }
.rise-lesson { max-width:710px; margin:auto; }.rise-lesson>header { padding-bottom:23px; margin-bottom:20px; border-bottom:1px solid var(--line); }.rise-lesson>header>p:last-child { max-width:55ch; margin:0; color:#555; font-size:14px; line-height:1.55; }
.rise-block,.rise-key,.rise-video,.rise-source,.rise-takeaway { margin:18px 0; padding:22px; background:#fff; border:1px solid var(--line); }.rise-block h3,.rise-key h3,.rise-video h3 { margin:0 0 7px; font-size:18px; line-height:1.3; }.rise-block p,.rise-key p,.rise-video p { margin:0; color:#555; font-size:13px; line-height:1.55; }.rise-key { background:#fbfbfb; border-left:3px solid var(--accent); }.rise-key h3 { font-size:12px; }.rise-key p b { color:var(--text); }
.rise-media { margin:18px 0; background:#fff; border:1px solid var(--line); }.rise-media img { display:block; width:100%; max-height:285px; object-fit:cover; }.rise-media p { padding:12px 14px; margin:0; color:#555; font-size:12px; line-height:1.5; }
.rise-accordion { margin:18px 0; border:1px solid var(--line); background:#fff; }.rise-accordion>button { width:100%; display:flex; align-items:center; justify-content:space-between; padding:15px; border:0; background:#fff; color:var(--text); cursor:pointer; font:700 12px var(--sans); text-align:left; }.rise-accordion>button:hover { background:#fafafa; }.rise-accordion i { color:var(--muted); font-size:18px; font-style:normal; }.rise-accordion>div { padding:16px; border-top:1px solid var(--line); }.rise-accordion h3 { margin:0 0 6px; font-size:15px; }.rise-accordion p { margin:0; color:#555; font-size:13px; line-height:1.55; }
.rise-tabs { display:flex; margin:17px 0 0; border-bottom:1px solid var(--line); }.rise-tabs button { padding:10px 12px; border:0; border-bottom:2px solid transparent; background:none; color:var(--muted); cursor:pointer; font:700 11px var(--sans); }.rise-tabs button.active { border-bottom-color:var(--accent); color:var(--accent); }.rise-tab-content { padding:14px 0 0; }.rise-tab-content b { font-size:12px; }.rise-tab-content p { margin:5px 0; }.rise-tab-content small { color:var(--muted); font-size:10px; }
.rise-flashcards { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:16px; }.rise-flashcards button { min-height:112px; padding:13px; border:1px solid var(--line); background:#fff; color:var(--text); cursor:pointer; text-align:left; }.rise-flashcards button:hover { border-color:#b9cbd0; }.rise-flashcards button.revealed { background:var(--accent-soft); border-color:#bdd9dd; }.rise-flashcards span { display:grid; gap:8px; }.rise-flashcards b { font-size:12px; }.rise-flashcards small { color:var(--muted); font-size:10px; line-height:1.4; }
.rise-steps { display:grid; gap:0; padding:0; margin:16px 0 0; list-style:none; }.rise-steps li { display:grid; grid-template-columns:27px 1fr; gap:10px; align-items:center; padding:11px 0; border-top:1px solid var(--line); color:#555; font-size:12px; }.rise-steps i { width:21px; height:21px; display:grid; place-items:center; border-radius:50%; background:#f2f2f2; color:var(--accent); font-size:10px; font-style:normal; font-weight:700; }
.rise-video { display:grid; grid-template-columns:38px 1fr; gap:13px; align-items:start; }.rise-video>div:first-child { width:31px; height:31px; display:grid; place-items:center; border-radius:50%; background:#f1f1f1; color:var(--accent); font-size:10px; }.rise-video h3 { font-size:14px; }.rise-video a,.rise-source a,.rise-drawer>a { display:inline-block; margin-top:9px; color:var(--accent); font-size:11px; font-weight:700; }
.rise-options { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:15px; }.rise-options.stack { grid-template-columns:1fr; }.rise-options button { display:grid; grid-template-columns:22px 1fr; gap:9px; align-items:start; padding:11px; border:1px solid var(--line); background:#fff; color:#444; cursor:pointer; font:600 11px/1.45 var(--sans); text-align:left; }.rise-options button:hover { border-color:#b9cbd0; }.rise-options button.selected { border-color:var(--accent); background:var(--accent-soft); color:var(--text); }.rise-options i { width:19px; height:19px; display:grid; place-items:center; border-radius:50%; background:#f0f0f0; color:#666; font-size:9px; font-style:normal; }.rise-block aside { padding:10px 11px; margin-top:12px; background:#faeeee; color:var(--error); font-size:11px; line-height:1.45; }.rise-block aside.correct { background:#eaf5ef; color:#296c58; }
.rise-checklist { display:grid; gap:9px; padding:0; margin:15px 0 0; list-style:none; }.rise-checklist li { display:grid; grid-template-columns:20px 1fr; gap:9px; align-items:center; color:#555; font-size:12px; }.rise-checklist i { width:18px; height:18px; display:grid; place-items:center; border-radius:50%; background:var(--accent); color:#fff; font-size:9px; font-style:normal; }
.rise-source { display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; padding:14px; }.rise-source span { color:var(--muted); font-size:10px; }.rise-source b { font-size:11px; }.rise-source a { margin:0; white-space:nowrap; }.rise-takeaway { display:grid; grid-template-columns:75px 1fr; gap:12px; align-items:start; background:#f7f7f7; }.rise-takeaway b { font-size:11px; }.rise-takeaway p { margin:0; color:#444; font-size:12px; font-weight:700; line-height:1.45; }.rise-lesson-nav { display:flex; justify-content:space-between; gap:10px; margin-top:25px; }
.rise-capstone>p:not(.rise-overline) { margin:0; color:#555; font-size:14px; line-height:1.55; }.rise-capstone form { display:grid; gap:18px; margin-top:24px; }.rise-capstone label { display:grid; gap:4px; }.rise-capstone label b { font-size:12px; }.rise-capstone label span { color:var(--muted); font-size:10px; }.rise-capstone textarea { width:100%; min-height:58px; padding:10px; border:1px solid var(--line); background:#fff; color:var(--text); font:400 12px/1.5 var(--sans); outline:none; }.rise-capstone textarea:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(47,124,142,.12); }.rise-form-action { display:flex; align-items:center; justify-content:space-between; gap:15px; padding-top:4px; }.rise-form-action p { margin:0; color:var(--muted); font-size:11px; }.rise-capstone>aside { padding:17px; margin-top:19px; background:#eef7f3; border-left:3px solid var(--success); }.rise-capstone>aside b { font-size:13px; }.rise-capstone>aside p { margin:4px 0; color:#48685e; font-size:11px; }
.rise-footer { display:flex; align-items:center; justify-content:space-between; padding:0 28px; background:#fff; border-top:1px solid var(--line); }.rise-footer button { padding:8px 0; border:0; background:none; color:var(--accent); cursor:pointer; font:700 11px var(--sans); }.rise-footer button:disabled { color:#bbb; cursor:not-allowed; }.rise-footer span { color:var(--muted); font-size:10px; }
.rise-drawer { position:fixed; top:62px; right:0; bottom:56px; z-index:10; width:min(390px,100vw); overflow:auto; padding:24px; background:#fff; box-shadow:-12px 0 26px rgba(0,0,0,.12); }.rise-drawer header { display:flex; align-items:center; justify-content:space-between; padding-bottom:15px; border-bottom:1px solid var(--line); }.rise-drawer h2 { margin:0; font-size:23px; }.rise-drawer header button { width:31px; height:31px; border:1px solid var(--line); background:#fff; color:#555; cursor:pointer; font-size:20px; }.rise-drawer>p { color:#555; font-size:12px; line-height:1.5; }.rise-drawer ol { padding:0; margin:11px 0; list-style:none; }.rise-drawer li button { width:100%; display:grid; grid-template-columns:25px 1fr auto; gap:9px; align-items:center; padding:11px 0; border:0; border-bottom:1px solid var(--line); background:none; color:var(--text); cursor:pointer; text-align:left; }.rise-drawer li button:disabled { opacity:.45; cursor:default; }.rise-drawer li i { width:19px; height:19px; display:grid; place-items:center; border:1px solid var(--line); border-radius:50%; color:var(--muted); font-size:8px; font-style:normal; }.rise-drawer li button.done i { background:var(--success); border-color:var(--success); color:#fff; }.rise-drawer li button.active { color:var(--accent); }.rise-drawer li span { font-size:11px; font-weight:700; }.rise-drawer li small { color:var(--muted); font-size:9px; }.rise-drawer dl { margin:17px 0; }.rise-drawer dl div { padding:11px 0; border-top:1px solid var(--line); }.rise-drawer dt { font-size:12px; font-weight:700; }.rise-drawer dd { margin:4px 0 0; color:var(--muted); font-size:11px; line-height:1.45; }
.rise-fade-enter-active,.rise-fade-leave-active { transition:opacity .18s ease,transform .18s ease; }.rise-fade-enter-from { opacity:0; transform:translateY(6px); }.rise-fade-leave-to { opacity:0; transform:translateY(-4px); }
@media(max-width:760px){.rise-header{grid-template-columns:auto 1fr auto;padding:0 15px;gap:12px}.rise-course-title,.rise-progress{display:none}.rise-brand span{display:none}.rise-intro{grid-template-columns:1fr;min-height:auto}.rise-intro figure{order:-1}.rise-intro figure img{height:210px}.rise-objectives,.rise-capstone{padding:24px}.rise-lesson-nav{flex-direction:column-reverse;align-items:stretch}.rise-lesson-nav button{width:100%}.rise-flashcards,.rise-options{grid-template-columns:1fr}.rise-source{grid-template-columns:1fr;gap:4px}.rise-source a{margin-top:5px}.rise-form-action{flex-direction:column;align-items:flex-start}.rise-footer{padding:0 17px}.rise-drawer{top:62px;bottom:56px}}
@media(prefers-reduced-motion:reduce){.rise-fade-enter-active,.rise-fade-leave-active,.rise-progress i{transition:none}}
</style>
