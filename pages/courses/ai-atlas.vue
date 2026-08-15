<script setup lang="ts">
/**
 * Screenshot-grounded Rise 360 reference:
 * Match the supplied mobile course: white reading canvas, a single blue
 * accent, image-led course start, blue lesson headers, large black rounded
 * headings, generous text spacing, and a vertical completion-circle menu.
 */
import { AI_GLOSSARY, AI_MODULES, type AiModule } from '~/content/aiCourse'

type Screen = { id: string; kind: 'welcome' | 'objectives' | 'module' | 'capstone'; title: string; module?: AiModule }

const STORAGE_KEY = 'entertrainer-ai-atlas-v5'
const screens: Screen[] = [
  { id: 'welcome', kind: 'welcome', title: 'Course overview' },
  { id: 'objectives', kind: 'objectives', title: 'Objectives' },
  ...AI_MODULES.map(module => ({ id: module.id, kind: 'module' as const, title: module.title, module })),
  { id: 'capstone', kind: 'capstone', title: 'Summary and action plan' }
]

const lessonBody: Record<string, string[]> = {
  bearing: ['Artificial intelligence is a broad term for systems that perform tasks commonly associated with human judgement, such as recognising patterns, making predictions, or generating text.', 'AI is most useful when it supports a clear task. Before you use a tool, identify the task, the information it needs, and the result you will check.'],
  rules: ['Some AI systems follow instructions written by people. Others learn a pattern from many examples. Both approaches can be useful.', 'Use written rules when the condition is clear. Use examples when the pattern is harder to describe but the outcome can still be checked.'],
  data: ['AI systems learn from examples. The examples may include text, images, numbers, audio, or records of past decisions.', 'The quality of those examples affects the quality of the result. Missing, biased, or outdated examples can lead to poor decisions.'],
  attention: ['Modern language tools consider the relationship between words in a prompt. This helps them decide which parts of the context are most relevant.', 'The result is generated one part at a time. Review the output before using it for important work.'],
  generation: ['Generative AI can create a draft, summary, image, translation, or list of ideas from a prompt.', 'Treat the output as a starting point. Check facts, names, numbers, policies, and sources before you share it.'],
  agents: ['An AI agent can follow a sequence of steps using approved tools. For example, it may find information, organise it, and prepare a draft.', 'The task, tools, limits, and review process should be clear before an agent is allowed to act.'],
  embodied: ['Some AI systems act in the physical world through devices, robots, vehicles, or medical equipment.', 'Physical actions need stronger testing and supervision because an incorrect result can affect people, places, or safety.'],
  frontier: ['New AI announcements can be useful, but they should be checked carefully. A claim is not established just because it is repeated online.', 'Look for public evidence, independent testing, and clear limits before you describe a major claim as a fact.'],
  responsible: ['Responsible AI use begins before you enter a prompt. Consider privacy, fairness, accuracy, and who remains accountable for the decision.', 'Do not enter confidential information into an unapproved tool. Keep a person responsible for reviewing important work.'],
  next: ['Start with a low-risk task where you can review the result easily. This helps you learn what the tool can and cannot do.', 'Keep the same routine: define the task, protect information, check the result, and make the final decision yourself.']
}

const termCards = [
  { term: 'Training', plain: 'The stage where a system improves from examples.' },
  { term: 'Inference', plain: 'The stage where a trained system responds to new input.' },
  { term: 'Dataset', plain: 'A collection of examples used to train, test, or check a system.' }
]

definePageMeta({ layout: false, pageTransition: { name: 'rise-fade', mode: 'out-in' } })
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap' }
  ]
})
useSeoMeta({ title: 'Artificial Intelligence: From Its Origins to the Frontier · Entertrainer', description: 'An introductory course on artificial intelligence, evidence, and responsible use.' })

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
const capstoneReady = computed(() => reflection.use.trim().length > 7 && reflection.check.trim().length > 7 && reflection.review.trim().length > 7)
const diagnosticFeedback = computed(() => !diagnostic.value ? '' : diagnostic.value === 'patterns' ? 'Correct. Check important information before you use the response.' : 'Try again. A confident answer can still be incorrect.')
const learningFeedback = computed(() => !learningCheck.value ? '' : learningCheck.value === 'training' ? 'Correct. Training is the stage where a system improves from examples.' : 'Try again. This describes using a system after it has been trained.')
const scenarioFeedback = computed(() => !scenarioChoice.value ? '' : scenarioChoice.value === 'check' ? 'Correct. Find official evidence or independent testing before sharing the claim.' : 'Try again. A post alone does not prove a major claim.')

function persist() {
  if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify({ current: current.value, furthest: furthest.value, completed: completed.value }))
}
function go(index: number) {
  if (index < 0 || index >= screens.length) return
  current.value = index
  furthest.value = Math.max(furthest.value, index)
  openExplore.value = false
  menuOpen.value = false
  persist()
}
function next() { go(Math.min(current.value + 1, screens.length - 1)) }
function previous() { go(Math.max(0, current.value - 1)) }
function revealTerm(term: string) { revealedTerms.value = revealedTerms.value.includes(term) ? revealedTerms.value.filter(item => item !== term) : [...revealedTerms.value, term] }
function finish() { if (capstoneReady.value) { completed.value = true; furthest.value = screens.length - 1; persist() } }
function restart() { current.value = 0; furthest.value = 0; completed.value = false; openExplore.value = false; revealedTerms.value = []; diagnostic.value = ''; learningCheck.value = ''; scenarioChoice.value = ''; reflection.use = ''; reflection.check = ''; reflection.review = ''; persist() }

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
  <div class="reference-page">
    <div class="reference-course">
      <header class="reference-appbar">
        <div class="reference-mark" aria-hidden="true">e</div>
        <div class="reference-appbar__name">Artificial Intelligence: From Its Origins to the Frontier</div>
        <button type="button" class="reference-version">Current version <span>⌄</span></button>
      </header>
      <nav class="reference-nav" aria-label="Course navigation">
        <button type="button" @click="menuOpen = !menuOpen"><span class="reference-menu-icon" aria-hidden="true"></span> Course outline</button>
        <button type="button" class="reference-more" aria-label="More course actions">•••</button>
        <button type="button" class="reference-resources" @click="resourcesOpen = !resourcesOpen">Resources</button>
      </nav>
      <div class="reference-progress" aria-label="Course progress"><span :style="{ width: `${progress}%` }"></span></div>

      <main class="reference-main" id="main">
        <Transition name="rise-fade" mode="out-in">
          <section :key="active.id" class="reference-screen">
            <template v-if="active.kind === 'welcome'">
              <article class="course-start">
                <div class="course-start__hero"><img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg'" alt="Illustrated map tracing the development of artificial intelligence." /><div class="course-start__shade"></div><h1>Artificial Intelligence<br />from Origins to the Frontier</h1><button type="button" @click="next">Start course</button></div>
                <div class="course-start__details"><div class="course-start__wordmark">Entertrainer</div><p><b>Duration: 2 hours</b></p><p>This course introduces the foundations of artificial intelligence, current AI tools, and practical steps for responsible use. It is designed for learners with no technical background.</p><ol class="course-outline"><li v-for="(screen, index) in screens.slice(1)" :key="screen.id"><button type="button" @click="go(index + 1)"><i :class="{ quiz: screen.kind === 'capstone' }" aria-hidden="true"></i><span>{{ screen.kind === 'module' ? screen.module?.short : screen.title }}</span><b :class="{ complete: index + 1 <= furthest }">{{ index + 1 <= furthest ? '✓' : '' }}</b></button></li></ol></div>
              </article>
            </template>

            <template v-else-if="active.kind === 'objectives'">
              <article class="reading-page objectives-page"><div class="page-controls"><button type="button" aria-label="Open course outline" @click="menuOpen = true"><span class="reference-menu-icon" aria-hidden="true"></span></button><button type="button" aria-label="Return to course overview" @click="previous">←</button></div><h1>Objectives</h1><p class="objectives-lead">By the End of this module, you will be able to:</p><ul><li>Explain the major stages in AI development.</li><li>Distinguish common AI approaches and capabilities.</li><li>Check AI claims using evidence and limitations.</li><li>Apply simple steps for responsible AI use.</li></ul><h2>What is artificial intelligence?</h2><p>Artificial intelligence is a broad term for systems that identify patterns, make predictions, or generate content from information. The next lessons introduce these ideas in clear, practical terms.</p><div class="page-continue"><button type="button" class="text-link" @click="next">Continue to the first lesson</button></div></article>
            </template>

            <template v-else-if="active.kind === 'module' && module">
              <article class="lesson-page">
                <header class="lesson-banner"><div class="lesson-banner__controls"><button type="button" aria-label="Open course outline" @click="menuOpen = true"><span class="reference-menu-icon" aria-hidden="true"></span></button><b>Lesson {{ module.number }} of {{ AI_MODULES.length }}</b></div><h1>{{ module.title }}</h1><i></i></header>
                <div class="reading-page lesson-reading"><p v-for="paragraph in lessonBody[module.id]" :key="paragraph">{{ paragraph }}</p>
                  <section class="reading-highlight"><b>Key point</b><p>{{ module.takeaway }}</p></section>
                  <section v-if="module.visual === 'history' || module.visual === 'agents'" class="reading-media"><img v-if="module.visual === 'history'" :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/lMkColbiQZRDDmAi.jpg'" alt="Visual timeline of AI development." /><img v-else :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/MivTADgxAPaQaRCw.jpg'" alt="Visual map of AI agents and human review." /><p>{{ module.visual === 'history' ? 'AI moved from written rules to learning patterns from examples.' : 'A controlled agent uses approved tools and remains subject to human review.' }}</p></section>
                  <section class="reading-accordion"><button type="button" :aria-expanded="openExplore" @click="openExplore = !openExplore"><span>Additional information</span><b>{{ openExplore ? '−' : '+' }}</b></button><div v-if="openExplore"><h3>{{ module.exploreTitle }}</h3><p>{{ module.exploreText }}</p></div></section>
                  <section v-if="module.id === 'rules'" class="reading-interaction"><h3>Compare the two approaches</h3><div class="reading-tabs" role="tablist"><button type="button" :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">Written rules</button><button type="button" :class="{ active: activeTab === 'examples' }" @click="activeTab = 'examples'">Past examples</button></div><div><template v-if="activeTab === 'rules'"><p><b>Written rules</b></p><p>A person defines the instructions. Use this approach when the rule is clear.</p></template><template v-else><p><b>Past examples</b></p><p>The system learns a pattern from examples. Use this approach when results can be checked.</p></template></div></section>
                  <section v-if="module.id === 'data'" class="reading-interaction"><h3>Key terms</h3><p>Select a card to view the definition.</p><div class="term-grid"><button v-for="card in termCards" :key="card.term" type="button" :class="{ revealed: revealedTerms.includes(card.term) }" @click="revealTerm(card.term)"><b>{{ card.term }}</b><span>{{ revealedTerms.includes(card.term) ? card.plain : 'Select to view' }}</span></button></div></section>
                  <section v-if="module.id === 'attention' || module.id === 'agents'" class="reading-interaction"><h3>{{ module.id === 'attention' ? 'How a response is created' : 'Elements of a controlled workflow' }}</h3><ol class="process-list"><template v-if="module.id === 'attention'"><li>You give a prompt.</li><li>The model weighs the context.</li><li>It creates a likely response.</li><li>You review the output.</li></template><template v-else><li>Define the task.</li><li>Choose approved tools.</li><li>Set clear limits.</li><li>Review the output.</li></template></ol></section>
                  <section v-if="module.id === 'bearing'" class="reading-interaction"><h3>Knowledge check</h3><p>What should you do with an important AI answer?</p><div class="answer-options"><button type="button" :class="{ selected: diagnostic === 'patterns' }" @click="diagnostic = 'patterns'"><i>A</i><span>Check it with a reliable source.</span></button><button type="button" :class="{ selected: diagnostic === 'trust' }" @click="diagnostic = 'trust'"><i>B</i><span>Trust it because it sounds confident.</span></button></div><aside v-if="diagnosticFeedback" :class="{ correct: diagnostic === 'patterns' }">{{ diagnosticFeedback }}</aside></section>
                  <section v-if="module.id === 'data'" class="reading-interaction"><h3>Knowledge check</h3><p>Which describes training?</p><div class="answer-options stack"><button type="button" :class="{ selected: learningCheck === 'inference' }" @click="learningCheck = 'inference'"><i>A</i><span>Using a trained tool on a new prompt.</span></button><button type="button" :class="{ selected: learningCheck === 'training' }" @click="learningCheck = 'training'"><i>B</i><span>Improving a system with examples and feedback.</span></button></div><aside v-if="learningFeedback" :class="{ correct: learningCheck === 'training' }">{{ learningFeedback }}</aside></section>
                  <section v-if="module.id === 'frontier'" class="reading-interaction"><h3>Scenario</h3><p>A post makes a dramatic AI claim. Select the most appropriate response.</p><div class="answer-options stack"><button type="button" :class="{ selected: scenarioChoice === 'check' }" @click="scenarioChoice = 'check'"><i>A</i><span>Look for official evidence or independent testing.</span></button><button type="button" :class="{ selected: scenarioChoice === 'share' }" @click="scenarioChoice = 'share'"><i>B</i><span>Share it immediately.</span></button></div><aside v-if="scenarioFeedback" :class="{ correct: scenarioChoice === 'check' }">{{ scenarioFeedback }}</aside></section>
                  <section v-if="module.id === 'responsible'" class="reading-interaction"><h3>Before you use AI</h3><ul class="checklist"><li>Private information is protected.</li><li>Important outputs will be checked.</li><li>A person remains accountable.</li></ul></section>
                  <section v-if="module.video" class="video-link"><b>Optional video</b><span>{{ module.video.title }}</span><a :href="module.video.url" target="_blank" rel="noreferrer">Watch video</a></section>
                  <section class="reading-source"><span>Source</span><a :href="module.sourceUrl" target="_blank" rel="noreferrer">{{ module.sourceLabel }}</a></section>
                  <div class="page-continue"><button type="button" class="text-link" @click="next">{{ current < screens.length - 2 ? 'Continue to the next lesson' : 'Continue to the action plan' }}</button></div>
                </div>
              </article>
            </template>

            <template v-else>
              <article class="reading-page capstone-page"><div class="page-controls"><button type="button" aria-label="Open course outline" @click="menuOpen = true"><span class="reference-menu-icon" aria-hidden="true"></span></button><button type="button" aria-label="Return to previous lesson" @click="previous">←</button></div><h1>Summary and action plan</h1><p>Use this final activity to plan one responsible use of AI in your own work or learning.</p><form @submit.prevent="finish"><label><b>1. Choose a low-risk task.</b><span>Select a task that you can review easily.</span><textarea v-model="reflection.use" rows="3" placeholder="For example: Draft a training outline."></textarea></label><label><b>2. State what you will check.</b><span>Consider facts, policies, or sources.</span><textarea v-model="reflection.check" rows="3" placeholder="For example: Check every source."></textarea></label><label><b>3. Name the review step.</b><span>State who confirms the final result.</span><textarea v-model="reflection.review" rows="3" placeholder="For example: A subject expert reviews it."></textarea></label><button type="submit" class="complete-course" :disabled="!capstoneReady">{{ completed ? 'Course completed' : 'Complete course' }}</button></form><aside v-if="completed" class="completion-note"><b>Course completed</b><p>Your action plan has been recorded in this browser.</p><button type="button" class="text-link" @click="restart">Restart course</button></aside></article>
            </template>
          </section>
        </Transition>
      </main>
      <footer class="reference-footer"><button type="button" :disabled="current === 0" @click="previous">Previous</button><span>{{ current + 1 }} of {{ screens.length }}</span><button type="button" :disabled="current === screens.length - 1" @click="next">Next</button></footer>

      <aside v-if="menuOpen" class="outline-drawer" aria-label="Course outline" role="dialog" aria-modal="true"><header><button type="button" aria-label="Close course outline" @click="menuOpen = false">×</button><h2>Course outline</h2></header><p><b>Duration: 2 hours</b></p><ol><li v-for="(screen, index) in screens.slice(1)" :key="screen.id"><button type="button" @click="go(index + 1)"><i :class="{ quiz: screen.kind === 'capstone' }" aria-hidden="true"></i><span>{{ screen.kind === 'module' ? screen.module?.short : screen.title }}</span><b :class="{ complete: index + 1 <= furthest }">{{ index + 1 <= furthest ? '✓' : '' }}</b></button></li></ol></aside>
      <aside v-if="resourcesOpen" class="resources-drawer" aria-label="Course resources" role="dialog" aria-modal="true"><header><h2>Resources</h2><button type="button" aria-label="Close resources" @click="resourcesOpen = false">×</button></header><dl><div v-for="item in AI_GLOSSARY" :key="item[0]"><dt>{{ item[0] }}</dt><dd>{{ item[1] }}</dd></div></dl><a href="/docs/ai-course-research.md">View source register</a></aside>
    </div>
  </div>
</template>

<style>
:root { --rise-blue:#377bc9; --rise-light-blue:#78c5ee; --rise-black:#0a0a0a; --rise-grey:#f7f7f7; --rise-line:#e4e4e4; --rise-font:'Nunito',Arial,sans-serif; }
* { box-sizing:border-box; }
body { background:#efefef; }
.reference-page { min-height:100dvh; background:#efefef; font-family:var(--rise-font); }
.reference-course { position:relative; width:100%; max-width:828px; min-height:100dvh; margin:0 auto; background:#fff; color:var(--rise-black); box-shadow:0 0 1px rgba(0,0,0,.25); }
.reference-appbar { display:grid; grid-template-columns:87px minmax(0,1fr) auto; align-items:center; min-height:64px; border-bottom:1px solid var(--rise-line); background:#fff; }
.reference-mark { display:grid; place-items:center; width:87px; height:64px; background:var(--rise-blue); color:#fff; font-size:40px; font-weight:900; }
.reference-appbar__name { overflow:hidden; padding:0 20px; font-size:15px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
.reference-version { padding:10px 16px; border:0; background:#fff; color:#111; cursor:pointer; font:800 14px var(--rise-font); white-space:nowrap; }.reference-version span { margin-left:4px; font-size:18px; }
.reference-nav { display:grid; grid-template-columns:1fr auto auto; align-items:center; min-height:62px; padding:0 18px 0 29px; border-bottom:1px solid var(--rise-line); background:#fff; }.reference-nav button { border:0; background:none; color:#0a0a0a; cursor:pointer; font:800 16px var(--rise-font); }.reference-nav button:first-child { display:flex; align-items:center; gap:10px; text-align:left; }.reference-more { margin:0 26px; letter-spacing:3px; }.reference-resources { padding:9px 16px; border-radius:999px !important; background:var(--rise-blue) !important; color:#fff !important; }
.reference-menu-icon { position:relative; display:inline-block; width:16px; height:12px; border-top:2px solid #333; border-bottom:2px solid #333; }.reference-menu-icon::after { content:''; position:absolute; top:4px; left:0; width:16px; border-top:2px solid #333; }
.reference-progress { height:4px; background:#fff; }.reference-progress span { display:block; height:4px; background:var(--rise-blue); transition:width .2s ease; }
.reference-main { min-height:calc(100dvh - 182px); background:#fff; }.reference-screen { min-height:inherit; }
.course-start__hero { position:relative; min-height:430px; overflow:hidden; background:#333; }.course-start__hero img { width:100%; height:430px; object-fit:cover; display:block; }.course-start__shade { position:absolute; inset:0; background:linear-gradient(180deg,rgba(0,0,0,.05) 20%,rgba(0,0,0,.7) 100%); }.course-start__hero h1 { position:absolute; left:36px; right:36px; bottom:122px; margin:0; color:#fff; font-size:42px; font-weight:900; letter-spacing:-.035em; line-height:1.08; }.course-start__hero button { position:absolute; left:28px; right:28px; bottom:36px; min-height:62px; border:0; border-radius:999px; background:#fff; color:#111; cursor:pointer; font:900 17px var(--rise-font); letter-spacing:.05em; text-transform:uppercase; }
.course-start__details { padding:55px 36px 112px; }.course-start__wordmark { margin-bottom:46px; font-size:48px; font-weight:900; letter-spacing:-.065em; }.course-start__details p { margin:0 0 31px; font-size:22px; font-weight:600; line-height:1.52; }.course-start__details p b { font-weight:900; }.course-outline { display:grid; gap:0; padding:10px 0 0; margin:0; list-style:none; }.course-outline li button { width:100%; display:grid; grid-template-columns:34px 1fr 29px; gap:14px; align-items:center; padding:22px 14px; border:0; background:#fff; color:#111; cursor:pointer; text-align:left; font:800 17px var(--rise-font); }.course-outline i,.outline-drawer i { width:22px; height:16px; position:relative; display:block; border-top:3px solid #787878; border-bottom:3px solid #787878; }.course-outline i::after,.outline-drawer i::after { content:''; position:absolute; top:5px; left:0; width:22px; border-top:3px solid #787878; }.course-outline i.quiz,.outline-drawer i.quiz { width:20px; height:20px; border:2px solid #787878; }.course-outline i.quiz::after,.outline-drawer i.quiz::after { content:'?'; top:-3px; left:5px; width:auto; border:0; color:#787878; font-size:13px; font-weight:900; }.course-outline b,.outline-drawer li b { width:27px; height:27px; display:grid; place-items:center; border:3px solid #dedede; border-radius:50%; color:#fff; font-size:13px; }.course-outline b.complete,.outline-drawer b.complete { border-color:var(--rise-blue); background:var(--rise-blue); }
.reading-page { padding:44px 35px 112px; }.page-controls { display:flex; align-items:center; justify-content:space-between; margin:-5px 0 44px; }.page-controls button { width:34px; height:34px; border:0; background:#fff; color:#111; cursor:pointer; font-size:27px; }.objectives-page h1,.reading-page h1 { margin:0 0 22px; font-size:52px; font-weight:900; letter-spacing:-.05em; line-height:1.03; }.objectives-lead { margin:0 0 50px; font-size:27px; font-weight:900; line-height:1.35; }.objectives-page ul { display:grid; gap:25px; padding-left:32px; margin:0 0 84px; }.objectives-page li { padding-left:7px; font-size:25px; font-weight:600; line-height:1.45; }.objectives-page h2 { margin:0 0 21px; font-size:43px; font-weight:900; letter-spacing:-.045em; }.objectives-page p,.capstone-page>p,.lesson-reading>p { font-size:24px; font-weight:600; line-height:1.56; }
.lesson-banner { min-height:322px; padding:16px 35px 42px; background:var(--rise-light-blue); }.lesson-banner__controls { display:flex; align-items:center; justify-content:space-between; }.lesson-banner__controls button { width:39px; height:39px; border:0; border-radius:3px; background:#fff; cursor:pointer; }.lesson-banner__controls b { font-size:16px; font-weight:900; }.lesson-banner h1 { max-width:650px; margin:72px 0 26px; font-size:43px; font-weight:900; letter-spacing:-.04em; line-height:1.15; }.lesson-banner>i { display:block; width:50px; border-top:7px solid #0a0a0a; }
.lesson-reading { padding-top:47px; }.lesson-reading>p { margin:0 0 42px; }.reading-highlight { padding:22px 24px; margin:12px 0 42px; border-left:4px solid var(--rise-blue); background:#f6fbff; }.reading-highlight b { font-size:15px; font-weight:900; }.reading-highlight p { margin:8px 0 0; font-size:20px; font-weight:700; line-height:1.45; }.reading-media { margin:0 0 42px; border:1px solid var(--rise-line); }.reading-media img { display:block; width:100%; max-height:320px; object-fit:cover; }.reading-media p { padding:16px 19px; margin:0; font-size:17px; font-weight:700; line-height:1.45; }
.reading-accordion,.reading-interaction { margin:0 0 36px; border-top:1px solid var(--rise-line); border-bottom:1px solid var(--rise-line); }.reading-accordion>button { width:100%; display:flex; align-items:center; justify-content:space-between; padding:19px 0; border:0; background:#fff; cursor:pointer; font:900 19px var(--rise-font); text-align:left; }.reading-accordion>button b { color:#777; font-size:27px; }.reading-accordion>div { padding:0 0 22px; }.reading-accordion h3,.reading-interaction h3 { margin:0 0 12px; font-size:27px; font-weight:900; }.reading-accordion p,.reading-interaction p { margin:0 0 16px; font-size:18px; font-weight:600; line-height:1.55; }.reading-interaction { padding:25px 0; border-top:0; }.reading-tabs { display:flex; gap:27px; margin:17px 0 22px; border-bottom:1px solid var(--rise-line); }.reading-tabs button { padding:11px 0; border:0; border-bottom:4px solid transparent; background:#fff; color:#777; cursor:pointer; font:900 16px var(--rise-font); }.reading-tabs button.active { border-bottom-color:var(--rise-blue); color:#111; }
.term-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:13px; }.term-grid button { min-height:134px; padding:16px; border:1px solid var(--rise-line); background:#fff; color:#111; cursor:pointer; text-align:left; }.term-grid button.revealed { background:#eef8fb; border-color:#9dd1df; }.term-grid b,.term-grid span { display:block; }.term-grid b { margin-bottom:12px; font-size:17px; }.term-grid span { color:#555; font-size:14px; line-height:1.35; }.process-list { display:grid; gap:0; padding:0; margin:18px 0 0; list-style:none; }.process-list li { padding:16px 0 16px 44px; position:relative; border-top:1px solid var(--rise-line); font-size:18px; font-weight:700; }.process-list li::before { content:counter(list-item); position:absolute; left:0; top:13px; width:25px; height:25px; display:grid; place-items:center; border:2px solid var(--rise-blue); border-radius:50%; color:var(--rise-blue); font-size:12px; font-weight:900; }
.answer-options { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:22px; }.answer-options.stack { grid-template-columns:1fr; }.answer-options button { display:grid; grid-template-columns:30px 1fr; gap:11px; align-items:start; padding:15px; border:1px solid var(--rise-line); background:#fff; color:#111; cursor:pointer; font:700 16px/1.4 var(--rise-font); text-align:left; }.answer-options button.selected { border:2px solid var(--rise-blue); background:#f4fbfd; }.answer-options i { width:24px; height:24px; display:grid; place-items:center; border:1px solid #bbb; border-radius:50%; color:#555; font-size:12px; font-style:normal; }.answer-options button.selected i { border-color:var(--rise-blue); background:var(--rise-blue); color:#fff; }.reading-interaction aside { padding:14px 16px; margin-top:14px; background:#fff1ef; color:#8a3b32; font-size:15px; font-weight:700; line-height:1.45; }.reading-interaction aside.correct { background:#eaf7f0; color:#2c735e; }.checklist { display:grid; gap:16px; padding:0; margin:20px 0 0; list-style:none; }.checklist li { padding-left:39px; position:relative; font-size:18px; font-weight:700; line-height:1.4; }.checklist li::before { content:'✓'; position:absolute; left:0; top:0; width:24px; height:24px; display:grid; place-items:center; border-radius:50%; background:var(--rise-blue); color:#fff; font-size:13px; }.video-link { display:grid; gap:6px; padding:21px 0; margin:0 0 36px; border-top:1px solid var(--rise-line); border-bottom:1px solid var(--rise-line); }.video-link b { font-size:16px; }.video-link span { font-size:18px; font-weight:700; }.video-link a,.reading-source a,.resources-drawer>a { color:var(--rise-blue); font-size:17px; font-weight:900; }.reading-source { display:grid; gap:5px; padding:17px 0; margin-top:20px; border-top:1px solid var(--rise-line); }.reading-source span { color:#777; font-size:15px; font-weight:700; }.page-continue { margin-top:45px; }.text-link { padding:0; border:0; background:none; color:var(--rise-blue); cursor:pointer; font:900 18px var(--rise-font); text-decoration:underline; }
.capstone-page>p { margin:0 0 39px; }.capstone-page form { display:grid; gap:28px; }.capstone-page label { display:grid; gap:7px; }.capstone-page label b { font-size:20px; font-weight:900; }.capstone-page label span { color:#555; font-size:16px; font-weight:600; }.capstone-page textarea { width:100%; padding:15px; border:1px solid var(--rise-line); color:#111; font:600 16px/1.45 var(--rise-font); outline:none; }.capstone-page textarea:focus { border:2px solid var(--rise-blue); }.complete-course { min-height:56px; border:0; border-radius:999px; background:var(--rise-blue); color:#fff; cursor:pointer; font:900 16px var(--rise-font); text-transform:uppercase; }.complete-course:disabled { opacity:.45; cursor:not-allowed; }.completion-note { padding:22px; margin-top:34px; border-left:4px solid var(--rise-blue); background:#eef8fb; }.completion-note b { font-size:20px; }.completion-note p { font-size:16px; font-weight:600; line-height:1.5; }
.reference-footer { display:flex; align-items:center; justify-content:space-between; min-height:56px; padding:0 29px; border-top:1px solid var(--rise-line); background:#fff; }.reference-footer button { border:0; background:#fff; color:#111; cursor:pointer; font:800 14px var(--rise-font); }.reference-footer button:disabled { color:#ccc; cursor:not-allowed; }.reference-footer span { color:#777; font-size:13px; font-weight:700; }
.outline-drawer,.resources-drawer { position:fixed; top:0; right:0; bottom:0; z-index:20; width:min(640px,92vw); overflow:auto; padding:35px; background:#fff; box-shadow:-5px 0 25px rgba(0,0,0,.14); }.outline-drawer header,.resources-drawer header { display:flex; align-items:center; gap:24px; padding-bottom:22px; border-bottom:1px solid var(--rise-line); }.outline-drawer header button,.resources-drawer header button { width:38px; height:38px; border:0; background:#fff; cursor:pointer; font-size:31px; }.outline-drawer h2,.resources-drawer h2 { margin:0; font-size:35px; font-weight:900; }.outline-drawer>p { margin:43px 0 28px; font-size:22px; }.outline-drawer ol { padding:0; margin:0; list-style:none; }.outline-drawer li button { width:100%; display:grid; grid-template-columns:34px 1fr 31px; gap:14px; align-items:center; padding:23px 12px; border:0; background:#fff; color:#111; cursor:pointer; text-align:left; font:800 18px var(--rise-font); }.outline-drawer li button:hover { background:#fafafa; }.outline-drawer li b { justify-self:end; }.resources-drawer dl { margin:36px 0; }.resources-drawer dl div { padding:16px 0; border-bottom:1px solid var(--rise-line); }.resources-drawer dt { font-size:19px; font-weight:900; }.resources-drawer dd { margin:6px 0 0; color:#555; font-size:16px; font-weight:600; line-height:1.45; }
.rise-fade-enter-active,.rise-fade-leave-active { transition:opacity .2s ease,transform .2s ease; }.rise-fade-enter-from { opacity:0; transform:translateY(7px); }.rise-fade-leave-to { opacity:0; transform:translateY(-5px); }
@media (min-width:829px) { .reference-course { box-shadow:0 0 30px rgba(0,0,0,.12); } }
@media (max-width:620px) { .reference-appbar { grid-template-columns:68px minmax(0,1fr) auto; min-height:55px; }.reference-mark { width:68px; height:55px; font-size:34px; }.reference-appbar__name { padding:0 12px; font-size:12px; }.reference-version { padding:8px 10px; font-size:11px; }.reference-nav { min-height:53px; padding:0 18px; }.reference-nav button { font-size:13px; }.reference-more { margin:0 14px; }.reference-resources { padding:8px 12px !important; }.course-start__hero,.course-start__hero img { min-height:338px; height:338px; }.course-start__hero h1 { left:26px; right:26px; bottom:103px; font-size:33px; }.course-start__hero button { left:20px; right:20px; bottom:25px; min-height:51px; font-size:14px; }.course-start__details { padding:42px 28px 88px; }.course-start__wordmark { margin-bottom:34px; font-size:39px; }.course-start__details p { font-size:18px; }.course-outline li button { padding:18px 6px; font-size:15px; }.reading-page { padding:36px 28px 88px; }.objectives-page h1,.reading-page h1 { font-size:43px; }.objectives-lead { margin-bottom:38px; font-size:23px; }.objectives-page li { font-size:21px; }.objectives-page h2 { font-size:36px; }.objectives-page p,.capstone-page>p,.lesson-reading>p { font-size:20px; }.lesson-banner { min-height:268px; padding:14px 28px 32px; }.lesson-banner h1 { margin-top:58px; font-size:35px; }.term-grid { grid-template-columns:1fr; }.answer-options { grid-template-columns:1fr; }.outline-drawer,.resources-drawer { padding:26px; }.outline-drawer li button { padding:18px 6px; font-size:16px; } }
@media (prefers-reduced-motion:reduce) { .rise-fade-enter-active,.rise-fade-leave-active,.reference-progress span { transition:none; } }
</style>
