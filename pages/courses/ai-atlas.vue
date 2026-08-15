<script setup lang="ts">
/**
 * Design reminder — The Learning Atlas:
 * an evidence-led editorial course canvas with a visible route, warm paper,
 * Atlas Ink, mineral emerald waypoints, and low-drama instructional motion.
 */
import { AI_GLOSSARY, AI_MODULES, type AiModule } from '~/content/aiCourse'

type Screen = { id: string; kind: 'welcome' | 'objectives' | 'module' | 'capstone'; title: string; module?: AiModule }

const screens: Screen[] = [
  { id: 'welcome', kind: 'welcome', title: 'Artificial Intelligence: From Its Origins to the Frontier' },
  { id: 'objectives', kind: 'objectives', title: 'Your learning objectives' },
  ...AI_MODULES.map(module => ({ id: module.id, kind: 'module' as const, title: module.title, module })),
  { id: 'capstone', kind: 'capstone', title: 'Your next responsible step' }
]

definePageMeta({ layout: false, pageTransition: { name: 'atlas-fade', mode: 'out-in' } })
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap' }
  ]
})
useSeoMeta({
  title: 'Artificial Intelligence: From Its Origins to the Frontier · Entertrainer',
  description: 'A full-day, evidence-led microlearning journey through the history, systems, claims, and responsible use of artificial intelligence.',
  ogTitle: 'Artificial Intelligence: From Its Origins to the Frontier',
  ogDescription: 'An evidence-led Entertrainer learning journey for curious professionals.'
})

const current = ref(0)
const furthest = ref(0)
const mapOpen = ref(false)
const resourceOpen = ref(false)
const completed = ref(false)
const diagnostic = ref('')
const learningCheck = ref('')
const claimLabels = ref<Record<string, string>>({})
const reflection = reactive({ use: '', claim: '', control: '' })

const active = computed(() => screens[current.value])
const module = computed(() => active.value.module)
const progress = computed(() => Math.round((furthest.value / (screens.length - 1)) * 100))
const remaining = computed(() => Math.max(0, 7 - Math.round((furthest.value / (screens.length - 1)) * 7)))
const diagnosticFeedback = computed(() => {
  if (!diagnostic.value) return ''
  return diagnostic.value === 'pattern'
    ? 'Exactly. A current language model generates likely continuations from patterns; that does not make every continuation verified or intentional.'
    : 'Try again. A model can produce polished answers without independently checking whether a claim is true.'
})
const learningFeedback = computed(() => {
  if (!learningCheck.value) return ''
  return learningCheck.value === 'training'
    ? 'Correct. Training changes parameters using examples or feedback; inference applies the trained model to a new input.'
    : 'Not quite. Inference is the use phase; training is where the system changes its parameters.'
})
const capstoneReady = computed(() => reflection.use.trim().length > 7 && reflection.claim.trim().length > 7 && reflection.control.trim().length > 7)

function persist() {
  if (!import.meta.client) return
  localStorage.setItem('entertrainer-ai-atlas', JSON.stringify({ current: current.value, furthest: furthest.value, completed: completed.value }))
}

function go(index: number) {
  if (index < 0 || index > furthest.value + 1 || index >= screens.length) return
  current.value = index
  furthest.value = Math.max(furthest.value, index)
  mapOpen.value = false
  persist()
}

function next() { go(Math.min(current.value + 1, screens.length - 1)) }
function previous() { current.value = Math.max(0, current.value - 1); persist() }
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
  diagnostic.value = ''
  learningCheck.value = ''
  claimLabels.value = {}
  reflection.use = ''; reflection.claim = ''; reflection.control = ''
  persist()
}

onMounted(() => {
  const saved = localStorage.getItem('entertrainer-ai-atlas')
  if (!saved) return
  try {
    const state = JSON.parse(saved)
    current.value = Math.min(Math.max(0, Number(state.current) || 0), screens.length - 1)
    furthest.value = Math.min(Math.max(current.value, Number(state.furthest) || 0), screens.length - 1)
    completed.value = Boolean(state.completed)
  } catch { localStorage.removeItem('entertrainer-ai-atlas') }
})
</script>

<template>
  <div class="atlas-app">
    <header class="atlas-topbar">
      <NuxtLink to="/" class="atlas-brand" aria-label="Exit course to Entertrainer home">
        <img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/uhoXkRLkUCsfcHKt.png'" alt="" class="atlas-brand__mark" />
        <span>Entertrainer<span class="atlas-brand__dot">.</span></span>
      </NuxtLink>
      <div class="atlas-topbar__center" aria-label="Course progress">
        <span class="atlas-topbar__eyebrow">AI learning atlas</span>
        <span class="atlas-topbar__progress">{{ progress }}% mapped</span>
      </div>
      <div class="atlas-topbar__actions">
        <button type="button" class="atlas-quiet-btn" @click="resourceOpen = !resourceOpen" :aria-expanded="resourceOpen">Sources</button>
        <button type="button" class="atlas-map-btn" @click="mapOpen = !mapOpen" :aria-expanded="mapOpen">
          <span class="atlas-map-btn__grid" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          Course map
        </button>
      </div>
    </header>

    <aside class="atlas-rail" aria-label="Course route">
      <div class="atlas-rail__cap"><span>Route</span><strong>01—10</strong></div>
      <ol class="atlas-route">
        <li v-for="(item, index) in AI_MODULES" :key="item.id" :class="{ 'is-current': active.id === item.id, 'is-done': furthest >= index + 2 }">
          <button type="button" @click="go(index + 2)" :disabled="index + 2 > furthest + 1">
            <span class="atlas-route__mark">{{ item.number }}</span>
            <span class="atlas-route__copy"><b>{{ item.short }}</b><small>{{ item.duration }}</small></span>
          </button>
        </li>
      </ol>
      <div class="atlas-rail__foot"><span class="atlas-status-dot" :class="{ 'is-complete': completed }"></span>{{ completed ? 'Completed' : 'In progress' }}</div>
    </aside>

    <main class="atlas-main" id="main">
      <Transition name="atlas-fade" mode="out-in">
        <section :key="active.id" class="atlas-screen">
          <template v-if="active.kind === 'welcome'">
            <div class="atlas-welcome">
              <div class="atlas-welcome__intro">
                <p class="atlas-kicker"><span></span> Full-day learning journey · 7 hours</p>
                <h1>Artificial Intelligence:<br /><em>from its origins</em><br />to the frontier.</h1>
                <p class="atlas-welcome__deck">Trace the ideas behind today’s AI—and practise reading bold claims with evidence, limits, and care.</p>
                <div class="atlas-welcome__facts" aria-label="Course details">
                  <span>Beginner-friendly</span><span>10 modules</span><span>Progress saves here</span>
                </div>
                <button type="button" class="atlas-primary" @click="next">Begin the journey <span aria-hidden="true">→</span></button>
              </div>
              <div class="atlas-welcome__image-wrap">
                <img :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg'" alt="An illustrated paper map tracing the evolution of artificial intelligence." class="atlas-welcome__image" />
                <div class="atlas-image-note"><b>Why this matters</b><span>AI changes what we can make, decide, and delegate. Understanding it changes how well we can judge it.</span></div>
              </div>
            </div>
            <div class="atlas-welcome__route-preview" aria-label="Course route preview">
              <span>1950</span><i></i><span>1956</span><i></i><span>1986</span><i></i><span>2017</span><i></i><span>Now</span>
            </div>
          </template>

          <template v-else-if="active.kind === 'objectives'">
            <div class="atlas-card atlas-card--objectives">
              <p class="atlas-kicker"><span></span> Before we begin</p>
              <h2>By the End of this module, you will be able to:</h2>
              <ol class="atlas-objectives">
                <li><b>1)</b><span>Explain the major stages in the development of AI.</span></li>
                <li><b>2)</b><span>Distinguish between different AI approaches, model types, and capabilities.</span></li>
                <li><b>3)</b><span>Evaluate AI claims using evidence, limitations, and source quality.</span></li>
              </ol>
              <div class="atlas-callout"><b>How to travel well</b><p>This is not a tour of “secret AI.” You will find clear tags for verified public evidence, informed analysis, speculative scenarios, and claims with no reliable public evidence.</p></div>
              <button type="button" class="atlas-primary" @click="next">Set your bearing <span aria-hidden="true">→</span></button>
            </div>
          </template>

          <template v-else-if="active.kind === 'module' && module">
            <div class="atlas-module-head">
              <div>
                <p class="atlas-kicker"><span></span> Module {{ module.number }} · {{ module.duration }}</p>
                <h2>{{ module.title }}</h2>
                <p>{{ module.blurb }}</p>
              </div>
              <div class="atlas-module-head__meta"><span>{{ module.short }}</span><b>{{ module.objective }}</b></div>
            </div>

            <img v-if="module.visual === 'history'" :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/lMkColbiQZRDDmAi.jpg'" alt="Editorial visual timeline from mechanical calculation to transformer models." class="atlas-feature-image" />
            <img v-if="module.visual === 'agents'" :src="'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/MivTADgxAPaQaRCw.jpg'" alt="A field notebook visualising AI tools, planning, and verified sources." class="atlas-feature-image atlas-feature-image--agents" />

            <div class="atlas-learning-grid">
              <article class="atlas-card atlas-card--lesson">
                <p class="atlas-card__label">Micro-lesson</p>
                <template v-if="module.id === 'bearing'">
                  <h3>AI is a toolbox, not a verdict.</h3>
                  <p>The name “AI” covers systems that recognise patterns, rank choices, generate media, optimise control, or take actions through tools. A useful discussion starts with the particular job and the evidence—not whether a system feels impressive.</p>
                  <div class="atlas-quote">“Can machines think?” was reframed by Turing as a more concrete test of observable behaviour.</div>
                </template>
                <template v-else-if="module.id === 'rules'">
                  <h3>Rules say what to do. Learning changes from examples.</h3>
                  <div class="atlas-compare"><div><b>Symbolic approach</b><span>“If a fever is high and test X is positive, flag a review.”</span></div><div><b>Learning approach</b><span>“Across many examples, these patterns often predict the label.”</span></div></div>
                </template>
                <template v-else-if="module.id === 'data'">
                  <h3>Training is the change; inference is the use.</h3>
                  <p>During training, an optimisation process adjusts many numerical parameters to reduce error on an objective. During inference, the trained system produces an output for a new prompt, image, record, or sensor reading.</p>
                </template>
                <template v-else-if="module.id === 'attention'">
                  <h3>Attention lets a model weigh relationships in context.</h3>
                  <p>In a sentence, the useful context for one word can be many positions away. Attention is a mechanism for deciding which other parts of a sequence should matter to the current computation. It is not human attention, and it does not prove comprehension.</p>
                </template>
                <template v-else-if="module.id === 'generation'">
                  <h3>A convincing output can still be wrong.</h3>
                  <p>Generation models learn statistical regularities. They can summarise, draft, translate, and create—but they may also invent citations, repeat bias, miss a changing fact, or produce a confident answer outside their reliable range.</p>
                </template>
                <template v-else-if="module.id === 'agents'">
                  <h3>An “agent” is a system around a model.</h3>
                  <div class="atlas-agent-flow"><span>Model</span><i>+</i><span>Tools</span><i>+</i><span>Instructions</span><i>+</i><span>Guardrails</span><i>+</i><span>Human review</span></div>
                  <p>Workflows follow a path set in code. Agents may choose a next action dynamically. Both require a clear goal, boundaries, and a way to know when to stop.</p>
                </template>
                <template v-else-if="module.id === 'embodied'">
                  <h3>The physical world is less forgiving than a chat box.</h3>
                  <p>A robot or autonomous vehicle has to operate through sensors and machines in changing surroundings. Safety depends on testing, fallback behaviour, governance, and the cost of being wrong—not model capability alone.</p>
                </template>
                <template v-else-if="module.id === 'frontier'">
                  <h3>Match the language to the evidence.</h3>
                  <p>Say “publicly reported” when a credible source describes a released system. Say “not independently verified” for claims that cannot be checked. Say “there is no reliable public evidence” when a claim runs ahead of available sources.</p>
                </template>
                <template v-else-if="module.id === 'responsible'">
                  <h3>Risk management is part of the design.</h3>
                  <div class="atlas-risk-list"><span><b>Hallucination</b><small>Require source checks for material claims.</small></span><span><b>Privacy</b><small>Minimise sensitive input and set retention boundaries.</small></span><span><b>Bias</b><small>Evaluate with the people and contexts affected.</small></span></div>
                </template>
                <template v-else>
                  <h3>Make one bounded, useful choice.</h3>
                  <p>Use AI where it can reduce busywork or widen a thoughtful first draft, then define what a person must review, what must remain private, and how you will tell whether the use is actually helping.</p>
                </template>
              </article>

              <aside class="atlas-card atlas-card--evidence">
                <p class="atlas-card__label">Evidence trail</p>
                <span class="atlas-confidence" :class="`is-${module.confidence.toLowerCase().replaceAll(' ', '-')}`">{{ module.confidence }}</span>
                <h3>{{ module.sourceLabel }}</h3>
                <p>Open the source before you repeat the claim. Note what it establishes—and what it does not.</p>
                <a :href="module.sourceUrl" target="_blank" rel="noreferrer" class="atlas-source-link">Read source <span aria-hidden="true">↗</span></a>
                <div v-if="module.video" class="atlas-video-link"><b>Watch with purpose</b><a :href="module.video.url" target="_blank" rel="noreferrer">{{ module.video.title }} <span aria-hidden="true">↗</span></a><small>{{ module.video.instruction }}</small></div>
              </aside>
            </div>

            <div v-if="module.id === 'bearing'" class="atlas-interaction">
              <div><p class="atlas-card__label">Diagnostic · low stakes</p><h3>A language model produces a polished answer. What is the safest first assumption?</h3></div>
              <div class="atlas-choice-row">
                <button type="button" :class="{ selected: diagnostic === 'pattern' }" @click="diagnostic = 'pattern'">It generates a likely continuation from patterns.</button>
                <button type="button" :class="{ selected: diagnostic === 'verified' }" @click="diagnostic = 'verified'">It has independently verified each statement.</button>
              </div>
              <p v-if="diagnosticFeedback" class="atlas-feedback" :class="{ 'is-correct': diagnostic === 'pattern' }">{{ diagnosticFeedback }}</p>
            </div>

            <div v-if="module.id === 'data'" class="atlas-interaction">
              <div><p class="atlas-card__label">Knowledge check</p><h3>Which statement describes training?</h3></div>
              <div class="atlas-choice-row atlas-choice-row--stack">
                <button type="button" :class="{ selected: learningCheck === 'inference' }" @click="learningCheck = 'inference'">Applying a fixed model to draft an email from a new prompt.</button>
                <button type="button" :class="{ selected: learningCheck === 'training' }" @click="learningCheck = 'training'">Adjusting model parameters using examples or feedback to improve an objective.</button>
              </div>
              <p v-if="learningFeedback" class="atlas-feedback" :class="{ 'is-correct': learningCheck === 'training' }">{{ learningFeedback }}</p>
            </div>

            <div v-if="module.id === 'frontier'" class="atlas-interaction atlas-interaction--claims">
              <div><p class="atlas-card__label">Sort the signal</p><h3>Label each statement by the strongest available evidence.</h3></div>
              <div class="atlas-claims">
                <div v-for="claim in [
                  { id: 'turing', text: 'Turing published “Computing Machinery and Intelligence” in 1950.', answer: 'Verified public evidence' },
                  { id: 'private', text: 'A private laboratory has already deployed a conscious AI system.', answer: 'No reliable public evidence' },
                  { id: 'future', text: 'Future models might perform longer autonomous tasks than today’s systems.', answer: 'Speculative scenario' }
                ]" :key="claim.id" class="atlas-claim">
                  <p>{{ claim.text }}</p>
                  <div class="atlas-claim__buttons"><button v-for="label in ['Verified public evidence', 'No reliable public evidence', 'Speculative scenario']" :key="label" type="button" @click="claimLabels[claim.id] = label" :class="{ selected: claimLabels[claim.id] === label, correct: claimLabels[claim.id] === label && label === claim.answer, incorrect: claimLabels[claim.id] === label && label !== claim.answer }">{{ label }}</button></div>
                </div>
              </div>
            </div>

            <div class="atlas-takeaway"><span>Field note</span><p>{{ module.takeaway }}</p></div>
            <div class="atlas-screen__next"><button type="button" class="atlas-primary" @click="next">Continue to {{ current < screens.length - 2 ? screens[current + 1].title : 'your capstone' }} <span aria-hidden="true">→</span></button></div>
          </template>

          <template v-else>
            <div class="atlas-capstone">
              <div class="atlas-capstone__intro"><p class="atlas-kicker"><span></span> Capstone · evidence-led action</p><h2>Make a small promise you can keep.</h2><p>Use this card to turn a broad understanding of AI into one bounded, reviewable, responsible use in your own work.</p></div>
              <form class="atlas-capstone__form" @submit.prevent="finish">
                <label><span>One task AI could help you with</span><textarea v-model="reflection.use" rows="2" placeholder="For example: create a first draft of a plain-language course outline…"></textarea></label>
                <label><span>One claim you will verify before using its output</span><textarea v-model="reflection.claim" rows="2" placeholder="For example: current policy details and any external citation…"></textarea></label>
                <label><span>One control or human review step you will keep</span><textarea v-model="reflection.control" rows="2" placeholder="For example: a subject-matter expert signs off before the draft is published…"></textarea></label>
                <div class="atlas-capstone__footer"><p><b>Completion condition:</b> make your action, evidence check, and control explicit.</p><button type="submit" class="atlas-primary" :disabled="!capstoneReady">{{ completed ? 'Journey completed' : 'Complete your atlas' }} <span aria-hidden="true">→</span></button></div>
              </form>
              <div v-if="completed" class="atlas-complete"><span class="atlas-complete__seal">✓</span><div><p class="atlas-card__label">Completion recorded</p><h3>You have mapped a responsible starting point.</h3><p>Keep the route open: return to the evidence register when a new claim, model, or policy changes your context.</p></div><button type="button" class="atlas-text-btn" @click="restart">Restart course</button></div>
            </div>
          </template>
        </section>
      </Transition>
    </main>

    <footer class="atlas-playerbar">
      <button type="button" class="atlas-playerbar__nav" :disabled="current === 0" @click="previous">← <span>Back</span></button>
      <div class="atlas-playerbar__track" aria-label="{{ progress }} percent course progress"><span :style="{ width: `${progress}%` }"></span></div>
      <div class="atlas-playerbar__status"><b>{{ String(current + 1).padStart(2, '0') }}</b><span>of {{ String(screens.length).padStart(2, '0') }} · ~{{ remaining }}h remaining</span></div>
      <button type="button" class="atlas-playerbar__nav atlas-playerbar__nav--next" :disabled="current === screens.length - 1" @click="next"><span>Continue</span> →</button>
    </footer>

    <aside v-if="mapOpen" class="atlas-drawer" aria-label="Course map" role="dialog" aria-modal="true">
      <div class="atlas-drawer__head"><div><p class="atlas-card__label">Your path</p><h2>Course map</h2></div><button type="button" class="atlas-drawer__close" @click="mapOpen = false" aria-label="Close course map">×</button></div>
      <ol class="atlas-drawer__list"><li v-for="(screen, index) in screens" :key="screen.id"><button type="button" :disabled="index > furthest + 1" :class="{ active: index === current, done: index <= furthest }" @click="go(index)"><span>{{ String(index + 1).padStart(2, '0') }}</span><b>{{ screen.kind === 'module' ? screen.module?.short : screen.title }}</b><small v-if="screen.kind === 'module'">{{ screen.module?.duration }}</small></button></li></ol>
    </aside>

    <aside v-if="resourceOpen" class="atlas-drawer atlas-drawer--resources" aria-label="Resource library" role="dialog" aria-modal="true">
      <div class="atlas-drawer__head"><div><p class="atlas-card__label">Save for later</p><h2>Resource library</h2></div><button type="button" class="atlas-drawer__close" @click="resourceOpen = false" aria-label="Close resource library">×</button></div>
      <p class="atlas-drawer__note">Sources are linked at the point of use. These glossary notes remain available as a downloadable-study reference in the project documentation.</p>
      <dl class="atlas-glossary"><div v-for="item in AI_GLOSSARY" :key="item[0]"><dt>{{ item[0] }}</dt><dd>{{ item[1] }}</dd></div></dl>
      <a href="/docs/ai-course-research.md" class="atlas-source-link">Open source register <span aria-hidden="true">↗</span></a>
    </aside>
  </div>
</template>

<style>
/* The Learning Atlas visual system: editorial wayfinding, no neon, no generic card grid. */
:root { --atlas-ink: #183B52; --atlas-ink-2: #0d2738; --atlas-paper: #f5f0e6; --atlas-paper-2: #ebe4d5; --atlas-emerald: #2c7a6b; --atlas-ember: #bb6540; --atlas-line: rgba(24, 59, 82, .16); --atlas-muted: #63737c; --atlas-serif: 'DM Serif Display', Georgia, serif; --atlas-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif; }
* { box-sizing: border-box; }
.atlas-app { min-height: 100dvh; display: grid; grid-template-columns: 250px 1fr; grid-template-rows: 68px minmax(0, 1fr) 60px; background: var(--atlas-paper); color: var(--atlas-ink); font-family: var(--atlas-sans); overflow: hidden; }
.atlas-topbar { grid-column: 1 / -1; grid-row: 1; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 0 24px; background: rgba(245, 240, 230, .93); border-bottom: 1px solid var(--atlas-line); position: relative; z-index: 20; }
.atlas-brand { display: inline-flex; align-items: center; gap: 9px; font-family: var(--atlas-serif); font-size: 21px; letter-spacing: -.03em; color: var(--atlas-ink); text-decoration: none; }
.atlas-brand__mark { width: 29px; height: 29px; object-fit: contain; }
.atlas-brand__dot { color: var(--atlas-emerald); }
.atlas-topbar__center { display: flex; align-items: baseline; gap: 13px; position: absolute; left: 50%; transform: translateX(-50%); }
.atlas-topbar__eyebrow, .atlas-topbar__progress, .atlas-card__label, .atlas-kicker, .atlas-rail__cap, .atlas-rail__foot { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; font-weight: 800; }
.atlas-topbar__eyebrow { color: var(--atlas-muted); }.atlas-topbar__progress { color: var(--atlas-emerald); }
.atlas-topbar__actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }.atlas-quiet-btn, .atlas-map-btn { border: 0; background: none; color: var(--atlas-ink); font: 700 12px var(--atlas-sans); cursor: pointer; padding: 9px 11px; }.atlas-map-btn { border: 1px solid var(--atlas-line); border-radius: 4px; display: inline-flex; align-items: center; gap: 8px; }.atlas-map-btn:hover, .atlas-quiet-btn:hover { background: var(--atlas-paper-2); }.atlas-map-btn__grid { display: grid; grid-template-columns: repeat(2, 3px); gap: 2px; }.atlas-map-btn__grid i { height: 3px; background: var(--atlas-emerald); }
.atlas-rail { grid-column: 1; grid-row: 2; padding: 27px 18px 20px; border-right: 1px solid var(--atlas-line); overflow-y: auto; display: flex; flex-direction: column; background: color-mix(in srgb, var(--atlas-paper-2) 42%, var(--atlas-paper)); }.atlas-rail__cap { display: flex; justify-content: space-between; color: var(--atlas-muted); padding: 0 8px 18px; border-bottom: 1px solid var(--atlas-line); }.atlas-rail__cap strong { color: var(--atlas-ink); font-weight: 800; }.atlas-route { list-style: none; padding: 19px 0; margin: 0; position: relative; }.atlas-route::before { content: ''; position: absolute; left: 18px; top: 25px; bottom: 25px; border-left: 1px dashed rgba(24, 59, 82, .25); }.atlas-route li { position: relative; z-index: 1; }.atlas-route button { width: 100%; display: flex; align-items: center; gap: 12px; padding: 8px 7px; background: none; border: 0; color: var(--atlas-muted); text-align: left; cursor: pointer; border-radius: 4px; }.atlas-route button:disabled { cursor: default; opacity: .55; }.atlas-route__mark { width: 24px; height: 24px; flex: 0 0 24px; border-radius: 50%; background: var(--atlas-paper); border: 1px solid var(--atlas-line); display: grid; place-items: center; font-size: 8px; font-weight: 800; }.atlas-route__copy { display: grid; gap: 2px; min-width: 0; }.atlas-route__copy b { font-size: 11px; line-height: 1.15; }.atlas-route__copy small { font-size: 9px; }.atlas-route li.is-done button { color: var(--atlas-ink); }.atlas-route li.is-done .atlas-route__mark { background: var(--atlas-emerald); color: white; border-color: var(--atlas-emerald); }.atlas-route li.is-current button { color: var(--atlas-ink); background: rgba(44, 122, 107, .1); }.atlas-route li.is-current .atlas-route__mark { box-shadow: 0 0 0 4px rgba(44, 122, 107, .12); }.atlas-rail__foot { margin-top: auto; padding: 14px 8px 0; border-top: 1px solid var(--atlas-line); color: var(--atlas-muted); display: flex; align-items: center; gap: 7px; }.atlas-status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--atlas-ember); }.atlas-status-dot.is-complete { background: var(--atlas-emerald); }
.atlas-main { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; background: radial-gradient(circle at 94% 8%, rgba(44, 122, 107, .10), transparent 25%), var(--atlas-paper); }.atlas-screen { max-width: 1170px; min-height: 100%; padding: clamp(36px, 7vh, 82px) clamp(24px, 6vw, 88px) 76px; margin: auto; }
.atlas-welcome { display: grid; grid-template-columns: minmax(280px, .86fr) minmax(340px, 1.14fr); align-items: center; gap: clamp(32px, 6vw, 84px); min-height: calc(100vh - 190px); }.atlas-kicker { color: var(--atlas-emerald); margin: 0 0 18px; display: inline-flex; align-items: center; gap: 8px; }.atlas-kicker span { height: 1px; width: 30px; background: currentColor; }.atlas-welcome h1, .atlas-card h2, .atlas-module-head h2, .atlas-capstone h2 { font-family: var(--atlas-serif); font-weight: 400; letter-spacing: -.045em; line-height: .93; margin: 0; }.atlas-welcome h1 { font-size: clamp(50px, 6.2vw, 86px); max-width: 650px; }.atlas-welcome h1 em { color: var(--atlas-emerald); font-style: italic; }.atlas-welcome__deck { font-size: clamp(16px, 1.6vw, 20px); line-height: 1.6; max-width: 47ch; color: #38515e; margin: 27px 0; }.atlas-welcome__facts { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 30px; }.atlas-welcome__facts span { padding: 6px 9px; border-radius: 999px; color: var(--atlas-ink); background: var(--atlas-paper-2); font-size: 10px; font-weight: 800; }.atlas-primary { display: inline-flex; align-items: center; gap: 13px; background: var(--atlas-ink); color: #f7f4eb; border: 1px solid var(--atlas-ink); padding: 13px 16px 13px 18px; border-radius: 4px; cursor: pointer; font: 800 12px var(--atlas-sans); transition: transform 160ms cubic-bezier(.23,1,.32,1), background 160ms ease; }.atlas-primary:hover { background: var(--atlas-emerald); border-color: var(--atlas-emerald); transform: translateY(-2px); }.atlas-primary:active { transform: scale(.97); }.atlas-primary:disabled { background: #94a09e; border-color: #94a09e; cursor: not-allowed; transform: none; }.atlas-welcome__image-wrap { position: relative; }.atlas-welcome__image { display: block; width: 100%; min-height: 430px; object-fit: cover; border-radius: 2px; box-shadow: 16px 18px 0 var(--atlas-ink); }.atlas-image-note { position: absolute; left: -28px; bottom: -28px; max-width: 260px; padding: 16px 17px; background: #f8f4ec; border: 1px solid var(--atlas-line); display: grid; gap: 6px; box-shadow: 0 10px 30px rgba(13, 39, 56, .12); }.atlas-image-note b { font: 800 10px var(--atlas-sans); text-transform: uppercase; letter-spacing: .1em; color: var(--atlas-emerald); }.atlas-image-note span { font: 500 12px/1.45 var(--atlas-sans); }.atlas-welcome__route-preview { display: flex; align-items: center; gap: 9px; margin-top: 44px; font: 800 9px var(--atlas-sans); letter-spacing: .13em; color: var(--atlas-muted); }.atlas-welcome__route-preview i { width: min(9vw, 125px); height: 1px; background: var(--atlas-line); position: relative; }.atlas-welcome__route-preview i::after { content: ''; position: absolute; right: 0; top: -2px; width: 5px; height: 5px; border-radius: 50%; background: var(--atlas-emerald); }
.atlas-card { background: rgba(255,255,255,.38); border: 1px solid var(--atlas-line); border-radius: 3px; }.atlas-card--objectives { max-width: 850px; padding: clamp(28px, 5vw, 60px); margin: clamp(20px, 8vh, 100px) auto; position: relative; overflow: hidden; }.atlas-card--objectives::after { content: 'AI'; position: absolute; right: -20px; top: -63px; font: 200px var(--atlas-serif); color: rgba(44, 122, 107, .07); }.atlas-card h2 { font-size: clamp(42px, 5vw, 64px); max-width: 10ch; }.atlas-objectives { list-style: none; padding: 0; margin: 36px 0; display: grid; gap: 0; }.atlas-objectives li { display: grid; grid-template-columns: 45px 1fr; gap: 15px; border-top: 1px solid var(--atlas-line); padding: 17px 0; font-size: clamp(15px, 1.5vw, 18px); line-height: 1.42; }.atlas-objectives li:last-child { border-bottom: 1px solid var(--atlas-line); }.atlas-objectives b { font: 700 13px var(--atlas-sans); color: var(--atlas-emerald); padding-top: 3px; }.atlas-callout { background: var(--atlas-ink); color: #eaf2ee; padding: 18px 20px; margin: 32px 0; max-width: 640px; }.atlas-callout b { font-size: 10px; letter-spacing: .11em; text-transform: uppercase; color: #9ed6bd; }.atlas-callout p { margin: 7px 0 0; font-size: 13px; line-height: 1.55; }
.atlas-module-head { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(210px, .6fr); gap: clamp(28px, 6vw, 94px); padding-bottom: 37px; border-bottom: 1px solid var(--atlas-line); }.atlas-module-head h2 { font-size: clamp(48px, 5.2vw, 76px); }.atlas-module-head > div > p { max-width: 54ch; color: #425963; line-height: 1.65; margin: 20px 0 0; font-size: 15px; }.atlas-module-head__meta { align-self: end; border-left: 2px solid var(--atlas-emerald); padding: 2px 0 2px 16px; display: grid; gap: 8px; }.atlas-module-head__meta span { color: var(--atlas-emerald); font: 800 10px var(--atlas-sans); text-transform: uppercase; letter-spacing: .1em; }.atlas-module-head__meta b { font-size: 12px; line-height: 1.45; font-weight: 700; }.atlas-feature-image { width: 100%; max-height: 292px; display: block; object-fit: cover; margin-top: 34px; border-radius: 2px; filter: saturate(.88); }.atlas-feature-image--agents { object-position: center 57%; }
.atlas-learning-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(230px, .6fr); gap: 18px; margin-top: 28px; }.atlas-card--lesson { padding: clamp(24px, 3vw, 38px); }.atlas-card--lesson h3 { margin: 10px 0 14px; font: 400 clamp(28px, 3.2vw, 42px)/1.02 var(--atlas-serif); letter-spacing: -.025em; }.atlas-card--lesson p { margin: 0; max-width: 62ch; color: #3d555f; font-size: 14px; line-height: 1.7; }.atlas-card__label { color: var(--atlas-muted); margin: 0; }.atlas-quote { margin-top: 26px; padding: 14px 0 0 18px; border-left: 2px solid var(--atlas-ember); max-width: 50ch; color: var(--atlas-ink); font: italic 19px/1.35 var(--atlas-serif); }.atlas-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 25px; }.atlas-compare div { min-height: 126px; background: var(--atlas-paper-2); padding: 16px; display: grid; align-content: start; gap: 10px; }.atlas-compare div:last-child { background: rgba(44, 122, 107, .13); }.atlas-compare b { font-size: 11px; }.atlas-compare span { font-size: 12px; line-height: 1.5; }.atlas-agent-flow { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; margin: 24px 0; }.atlas-agent-flow span { padding: 8px 10px; color: var(--atlas-ink); border: 1px solid var(--atlas-line); background: var(--atlas-paper); font-size: 11px; font-weight: 800; }.atlas-agent-flow span:nth-of-type(2), .atlas-agent-flow span:nth-of-type(4) { background: rgba(44, 122, 107, .12); }.atlas-agent-flow i { color: var(--atlas-emerald); font-style: normal; font-weight: 800; }.atlas-risk-list { display: grid; gap: 9px; margin-top: 22px; }.atlas-risk-list span { display: grid; grid-template-columns: 115px 1fr; gap: 8px; border-bottom: 1px solid var(--atlas-line); padding-bottom: 8px; }.atlas-risk-list b { font-size: 11px; }.atlas-risk-list small { font-size: 11px; line-height: 1.4; color: var(--atlas-muted); }
.atlas-card--evidence { padding: 24px; background: var(--atlas-ink); color: #eaf2ee; align-self: stretch; display: flex; flex-direction: column; }.atlas-card--evidence .atlas-card__label { color: #93c6b2; }.atlas-card--evidence h3 { font: 400 28px/1.05 var(--atlas-serif); margin: 16px 0 9px; }.atlas-card--evidence > p { font-size: 12px; line-height: 1.55; color: #c2d0ce; margin: 0; }.atlas-confidence { display: inline-flex; align-self: flex-start; padding: 5px 7px; margin-top: 20px; background: #e5f2ec; color: #1c5e50; font-size: 9px; line-height: 1.15; text-transform: uppercase; font-weight: 800; letter-spacing: .08em; }.atlas-confidence.is-informed-analysis { background: #f6e7bf; color: #72530b; }.atlas-confidence.is-speculative-scenario, .atlas-confidence.is-no-reliable-public-evidence { background: #f0d8cb; color: #8c432c; }.atlas-source-link { display: inline-flex; align-items: center; gap: 8px; color: inherit; font-size: 11px; font-weight: 800; text-decoration: none; margin-top: auto; padding-top: 20px; }.atlas-source-link:hover { color: var(--atlas-emerald); }.atlas-card--evidence .atlas-source-link { color: #a8dec8; }.atlas-video-link { display: grid; gap: 5px; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(234,242,238,.18); }.atlas-video-link b { color: #93c6b2; text-transform: uppercase; letter-spacing: .1em; font-size: 9px; }.atlas-video-link a { color: white; font-size: 12px; line-height: 1.3; font-weight: 800; text-decoration: none; }.atlas-video-link small { color: #c2d0ce; font-size: 10px; line-height: 1.4; }
.atlas-interaction { margin-top: 18px; padding: clamp(22px, 3vw, 34px); border: 1px solid var(--atlas-line); background: #faf7f0; display: grid; gap: 21px; }.atlas-interaction h3 { font: 400 clamp(25px, 3vw, 36px)/1.05 var(--atlas-serif); max-width: 22ch; margin: 8px 0 0; letter-spacing: -.025em; }.atlas-choice-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }.atlas-choice-row--stack { grid-template-columns: 1fr; }.atlas-choice-row button, .atlas-claim__buttons button { text-align: left; padding: 13px 15px; border: 1px solid var(--atlas-line); background: var(--atlas-paper); color: var(--atlas-ink); font: 600 12px/1.45 var(--atlas-sans); cursor: pointer; transition: background 150ms ease, border-color 150ms ease, transform 150ms ease; }.atlas-choice-row button:hover, .atlas-claim__buttons button:hover { border-color: var(--atlas-emerald); transform: translateY(-1px); }.atlas-choice-row button.selected { background: rgba(44,122,107,.13); border-color: var(--atlas-emerald); }.atlas-feedback { margin: 0; padding: 11px 13px; font-size: 12px; line-height: 1.5; color: #8c432c; background: #f6e7df; }.atlas-feedback.is-correct { color: #155345; background: #e2f0e9; }.atlas-claims { display: grid; gap: 11px; }.atlas-claim { padding-top: 14px; border-top: 1px solid var(--atlas-line); }.atlas-claim p { font-size: 13px; font-weight: 700; margin: 0 0 10px; }.atlas-claim__buttons { display: flex; flex-wrap: wrap; gap: 6px; }.atlas-claim__buttons button { font-size: 10px; padding: 7px 8px; }.atlas-claim__buttons button.selected.correct { background: #dceee5; border-color: var(--atlas-emerald); }.atlas-claim__buttons button.selected.incorrect { background: #f6ddd4; border-color: var(--atlas-ember); }.atlas-takeaway { margin: 18px 0; display: grid; grid-template-columns: 110px 1fr; gap: 17px; padding: 17px 19px; border-left: 3px solid var(--atlas-emerald); background: rgba(44,122,107,.08); }.atlas-takeaway span { color: var(--atlas-emerald); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; font-weight: 800; }.atlas-takeaway p { margin: 0; font-size: 14px; line-height: 1.5; font-weight: 700; }.atlas-screen__next { display: flex; justify-content: flex-end; margin-top: 30px; }
.atlas-capstone { max-width: 930px; margin: 20px auto; }.atlas-capstone__intro { max-width: 690px; }.atlas-capstone h2 { font-size: clamp(52px, 6vw, 80px); }.atlas-capstone__intro > p:not(.atlas-kicker) { color: #425963; line-height: 1.6; font-size: 16px; max-width: 51ch; margin: 21px 0 32px; }.atlas-capstone__form { padding: 24px; border: 1px solid var(--atlas-line); background: rgba(255,255,255,.42); display: grid; gap: 17px; }.atlas-capstone label { display: grid; gap: 7px; }.atlas-capstone label span { color: var(--atlas-ink); font-size: 11px; font-weight: 800; }.atlas-capstone textarea { width: 100%; resize: vertical; min-height: 62px; color: var(--atlas-ink); font: 500 13px/1.5 var(--atlas-sans); padding: 12px 13px; border: 1px solid var(--atlas-line); background: var(--atlas-paper); outline: none; }.atlas-capstone textarea:focus { border-color: var(--atlas-emerald); box-shadow: 0 0 0 3px rgba(44,122,107,.12); }.atlas-capstone__footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding-top: 8px; }.atlas-capstone__footer p { margin: 0; max-width: 36ch; color: var(--atlas-muted); font-size: 11px; line-height: 1.45; }.atlas-complete { display: grid; grid-template-columns: 58px 1fr auto; align-items: center; gap: 17px; padding: 23px; background: var(--atlas-ink); color: white; margin-top: 18px; }.atlas-complete__seal { width: 44px; height: 44px; border: 1px solid #9fd5bb; border-radius: 50%; display: grid; place-items: center; color: #9fd5bb; font-size: 21px; }.atlas-complete h3 { font: 400 27px var(--atlas-serif); margin: 4px 0; }.atlas-complete p { margin: 0; font-size: 11px; line-height: 1.5; color: #c0cfcc; }.atlas-complete .atlas-card__label { color: #9fd5bb; }.atlas-text-btn { border: 0; background: none; color: #a9dbc7; text-decoration: underline; cursor: pointer; white-space: nowrap; font: 700 11px var(--atlas-sans); }
.atlas-playerbar { grid-column: 1 / -1; grid-row: 3; display: grid; grid-template-columns: auto minmax(110px, 1fr) auto auto; align-items: center; gap: 16px; padding: 0 22px; border-top: 1px solid var(--atlas-line); background: rgba(245,240,230,.96); position: relative; z-index: 16; }.atlas-playerbar__nav { display: inline-flex; gap: 7px; align-items: center; min-width: 73px; border: 0; background: none; color: var(--atlas-ink); font: 800 11px var(--atlas-sans); cursor: pointer; }.atlas-playerbar__nav--next { justify-content: flex-end; }.atlas-playerbar__nav:disabled { opacity: .35; cursor: not-allowed; }.atlas-playerbar__track { height: 4px; background: #d7d2c6; overflow: hidden; }.atlas-playerbar__track span { height: 100%; display: block; background: var(--atlas-emerald); transition: width 220ms cubic-bezier(.23,1,.32,1); }.atlas-playerbar__status { display: flex; gap: 7px; align-items: baseline; color: var(--atlas-muted); white-space: nowrap; font-size: 10px; }.atlas-playerbar__status b { font-size: 12px; color: var(--atlas-ink); }
.atlas-drawer { position: fixed; top: 68px; right: 0; bottom: 60px; z-index: 30; width: min(410px, 100vw); padding: 28px; overflow-y: auto; background: #faf7f0; border-left: 1px solid var(--atlas-line); box-shadow: -18px 0 36px rgba(13,39,56,.11); animation: atlas-drawer-in 230ms cubic-bezier(.23,1,.32,1) both; }.atlas-drawer__head { display: flex; justify-content: space-between; align-items: start; padding-bottom: 18px; border-bottom: 1px solid var(--atlas-line); }.atlas-drawer__head h2 { font: 400 39px/.95 var(--atlas-serif); letter-spacing: -.03em; margin: 6px 0 0; }.atlas-drawer__close { width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid var(--atlas-line); background: none; cursor: pointer; color: var(--atlas-ink); font-size: 23px; line-height: 1; }.atlas-drawer__list { list-style: none; padding: 12px 0 0; margin: 0; }.atlas-drawer__list button { width: 100%; display: grid; grid-template-columns: 32px 1fr auto; gap: 8px; align-items: center; padding: 12px 0; text-align: left; border: 0; border-bottom: 1px solid var(--atlas-line); background: none; color: var(--atlas-ink); cursor: pointer; }.atlas-drawer__list button:disabled { opacity: .4; cursor: not-allowed; }.atlas-drawer__list button > span { color: var(--atlas-muted); font: 800 10px var(--atlas-sans); }.atlas-drawer__list button b { font-size: 12px; }.atlas-drawer__list button small { font-size: 9px; color: var(--atlas-muted); }.atlas-drawer__list button.active { color: var(--atlas-emerald); }.atlas-drawer__list button.done > span { color: var(--atlas-emerald); }.atlas-drawer__note { font-size: 12px; line-height: 1.55; color: var(--atlas-muted); }.atlas-glossary { display: grid; gap: 0; margin: 18px 0; }.atlas-glossary div { border-top: 1px solid var(--atlas-line); padding: 12px 0; }.atlas-glossary dt { font-size: 12px; font-weight: 800; }.atlas-glossary dd { margin: 4px 0 0; color: var(--atlas-muted); font-size: 11px; line-height: 1.5; }.atlas-drawer--resources .atlas-source-link { margin-top: 6px; color: var(--atlas-emerald); }
.atlas-fade-enter-active, .atlas-fade-leave-active { transition: opacity 260ms cubic-bezier(.23,1,.32,1), transform 260ms cubic-bezier(.23,1,.32,1); }.atlas-fade-enter-from { opacity: 0; transform: translateY(12px); }.atlas-fade-leave-to { opacity: 0; transform: translateY(-6px); } @keyframes atlas-drawer-in { from { opacity: 0; transform: translateX(22px); } to { opacity: 1; transform: translateX(0); } }
@media (max-width: 900px) { .atlas-app { grid-template-columns: 1fr; grid-template-rows: 62px minmax(0, 1fr) 58px; }.atlas-topbar { padding: 0 16px; }.atlas-topbar__center { display: none; }.atlas-rail { display: none; }.atlas-main { grid-column: 1; }.atlas-welcome { grid-template-columns: 1fr; min-height: auto; }.atlas-welcome__image { min-height: 280px; }.atlas-welcome__image-wrap { margin-top: 12px; }.atlas-module-head, .atlas-learning-grid { grid-template-columns: 1fr; }.atlas-module-head__meta { max-width: 520px; }.atlas-card--evidence { min-height: 235px; }.atlas-welcome__route-preview { overflow: hidden; }.atlas-playerbar { padding: 0 15px; gap: 10px; }.atlas-playerbar__status span { display: none; }.atlas-drawer { top: 62px; bottom: 58px; }.atlas-screen { padding: 38px 24px 70px; } }
@media (max-width: 580px) { .atlas-topbar__actions { gap: 2px; }.atlas-quiet-btn { display: none; }.atlas-map-btn { padding: 8px 9px; }.atlas-brand { font-size: 19px; }.atlas-welcome h1 { font-size: 49px; }.atlas-image-note { position: relative; left: auto; bottom: auto; max-width: none; box-shadow: none; border-top: 0; }.atlas-compare, .atlas-choice-row { grid-template-columns: 1fr; }.atlas-agent-flow { gap: 5px; }.atlas-takeaway { grid-template-columns: 1fr; gap: 5px; }.atlas-capstone__footer, .atlas-complete { grid-template-columns: 1fr; align-items: start; }.atlas-capstone__footer { flex-direction: column; align-items: flex-start; }.atlas-complete { display: grid; }.atlas-complete__seal { grid-row: 1; }.atlas-text-btn { padding: 0; }.atlas-playerbar__nav span { display: none; }.atlas-playerbar { grid-template-columns: auto 1fr auto; }.atlas-playerbar__status { display: none; } }
@media (prefers-reduced-motion: reduce) { .atlas-fade-enter-active, .atlas-fade-leave-active, .atlas-playerbar__track, .atlas-primary { transition: none; }.atlas-drawer { animation: none; } }
</style>
