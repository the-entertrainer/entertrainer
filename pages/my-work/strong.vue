<script setup lang="ts">
import Backdrop3d from '~/components/work/Backdrop3d.vue'
import StCover from '~/components/work/strong/Title.vue'
import StObjectives from '~/components/work/strong/Objectives.vue'
import StLesson from '~/components/work/strong/Lesson.vue'
import StHandsOn from '~/components/work/strong/HandsOn.vue'
import StAssessment from '~/components/work/strong/Assessment.vue'
import StResult from '~/components/work/strong/ThankYou.vue'
import StPlayerbar from '~/components/work/strong/Controls.vue'
import StOutline from '~/components/work/strong/Menu.vue'

interface Slide {
  id: string
  section: string
  label: string
  comp: any
  props?: Record<string, any>
  gate?: 'lab' | 'assessment'
}

const SLIDES: Slide[] = [
  { id: 'cover',      section: 'Start',  label: 'Strong',           comp: StCover },
  { id: 'objectives', section: 'Start',  label: 'What you will do', comp: StObjectives },
  { id: 'l1',         section: 'Lesson', label: 'The haystack',     comp: StLesson, props: { step: 1 } },
  { id: 'l2',         section: 'Lesson', label: 'Count it',         comp: StLesson, props: { step: 2 } },
  { id: 'l3',         section: 'Lesson', label: 'Length wins',      comp: StLesson, props: { step: 3 } },
  { id: 'l4',         section: 'Lesson', label: 'Three attackers',  comp: StLesson, props: { step: 4 } },
  { id: 'l5',         section: 'Lesson', label: 'The lie',          comp: StLesson, props: { step: 5 } },
  { id: 'lab',        section: 'Lab',    label: 'Password lab',     comp: StHandsOn, gate: 'lab' },
  { id: 'quiz',       section: 'Check',  label: 'Five questions',   comp: StAssessment, gate: 'assessment' },
  { id: 'result',     section: 'Result', label: 'Result',           comp: StResult }
]
const LAB_INDEX = SLIDES.findIndex(s => s.id === 'lab')

const BG_COLORS = ['#182533', '#1E2E3E', '#22384A', '#35D0C4', '#1A2836', '#2A4258', '#284A5A', '#58A6FF']

definePageMeta({ layout: false, pageTransition: { name: 'st-fade', mode: 'out-in' } })
useHead({
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap' }]
})
useSeoMeta({
  title: 'Strong — How Passwords Really Break · Entertrainer',
  description: 'A short interactive module on the real math of password strength: entropy in bits, why length beats symbols, and why the same password is instant or eternal depending on the attacker.',
  ogTitle: 'Strong — how passwords really break',
  ogDescription: 'The real math behind password strength, made playable. Nothing you type ever leaves your device.',
  ogUrl: 'https://entertrainer.in/my-work/strong'
})

const store = useStrongStore()
const menuOpen = ref(false)
const dir = ref<'fwd' | 'back'>('fwd')

const index = computed(() => Math.min(store.index, SLIDES.length - 1))
const current = computed(() => SLIDES[index.value])

const canPrev = computed(() => index.value > 0)
const canNext = computed(() => {
  if (index.value >= SLIDES.length - 1) return false
  const g = current.value.gate
  if (g === 'lab') return store.handsOnComplete
  if (g === 'assessment') return store.assessmentPassed
  return true
})

function commit(i: number) {
  dir.value = i >= index.value ? 'fwd' : 'back'
  store.setIndex(i)
  if (i >= LAB_INDEX) store.markLessonComplete()
  menuOpen.value = false
}
// Jumps from the seekbar/menu can only reach slides already unlocked.
function goTo(i: number) {
  if (i < 0 || i > SLIDES.length - 1 || i > store.furthest) return
  commit(i)
}
// Linear next/prev are validated by canNext/canPrev, so they bypass the jump guard.
function next() { if (canNext.value) commit(index.value + 1) }
function prev() { if (canPrev.value) commit(index.value - 1) }
function restart() { store.reset(); dir.value = 'back'; store.setIndex(0) }

onMounted(() => store.start())
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') menuOpen.value = false
}
</script>

<template>
  <div class="st-app" @keydown="onKey">
    <Backdrop3d :colors="BG_COLORS" bg="#0E1622" :count="26" />
    <div class="st-app__veil" aria-hidden="true" />

    <header class="st-topbar">
      <div class="st-topbar__brand">
        <span class="st-topbar__mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </span>
        <span class="st-topbar__word">STRONG</span>
      </div>
      <div class="st-topbar__right">
        <button type="button" class="st-topbtn" :class="{ 'is-open': menuOpen }" @click="menuOpen = !menuOpen" aria-label="Course menu">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          <span>Menu</span>
        </button>
        <NuxtLink to="/" class="st-topbtn st-topbtn--exit" aria-label="Leave the module">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
          <span>Exit</span>
        </NuxtLink>
      </div>
    </header>

    <main class="st-stage">
      <Transition :name="dir === 'fwd' ? 'st-fwd' : 'st-back'" mode="out-in">
        <div class="st-stage__slide" :key="current.id">
          <component
            :is="current.comp"
            v-bind="current.props"
            @start="next"
            @restart="restart"
          />
        </div>
      </Transition>
    </main>

    <StPlayerbar
      :index="index"
      :total="SLIDES.length"
      :furthest="store.furthest"
      :label="current.label"
      :section="current.section"
      :can-prev="canPrev"
      :can-next="canNext"
      :gated="!!current.gate && !canNext"
      @prev="prev" @next="next" @jump="goTo"
    />

    <StOutline
      v-if="menuOpen"
      :slides="SLIDES"
      :index="index"
      :furthest="store.furthest"
      @jump="goTo"
      @close="menuOpen = false"
    />
  </div>
</template>

<style>
.st-app {
  --st-bg: #0E1622;
  --st-panel: #16212E;
  --st-panel-solid: #16212E;
  --st-slot: #0B121C;
  --st-slot-hover: #1C2A38;
  --st-line: rgba(220, 232, 240, 0.10);
  --st-line-strong: rgba(220, 232, 240, 0.20);
  --st-text: #EAF2F8;
  --st-muted: #8FA3B4;
  --st-muted-strong: #B7C6D2;
  --st-accent: #35D0C4;

  --st-t0: #FF5D5D;
  --st-t1: #FF9245;
  --st-t2: #F4C64A;
  --st-t3: #35C89A;
  --st-t4: #58A6FF;

  --st-online: #58A6FF;
  --st-fast: #FF6B6B;
  --st-slow: #35C89A;

  --st-display: 'Space Grotesk', system-ui, sans-serif;
  --st-body: 'Inter', system-ui, sans-serif;
  --st-mono: 'IBM Plex Mono', ui-monospace, monospace;

  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--st-bg);
  color: var(--st-text);
  font-family: var(--st-body);
}

.st-app__veil {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--st-bg) 55%, transparent), color-mix(in srgb, var(--st-bg) 45%, transparent)),
    radial-gradient(120% 85% at 50% 32%, transparent 42%, color-mix(in srgb, var(--st-bg) 52%, transparent) 100%);
}

/* Top chrome */
.st-topbar {
  position: relative; z-index: 10; flex-shrink: 0; min-height: 56rem;
  display: flex; align-items: center; justify-content: space-between; gap: 16rem;
  padding: 0 20rem; padding-top: var(--safe-top);
  padding-left: calc(20rem + var(--safe-left)); padding-right: calc(18rem + var(--safe-right));
}
.st-topbar__brand { display: inline-flex; align-items: center; gap: 10rem; }
.st-topbar__mark { color: var(--st-accent); display: inline-flex; }
.st-topbar__word { font-family: var(--st-display); font-weight: 700; font-size: 16rem; letter-spacing: 0.14em; }
.st-topbar__right { display: flex; align-items: center; gap: 8rem; }
.st-topbtn {
  display: inline-flex; align-items: center; gap: 7rem; padding: 8rem 13rem; border-radius: 999rem;
  font-family: var(--st-mono); font-size: 12rem; color: var(--st-muted);
  border: 1px solid var(--st-line); transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}
@media (hover: hover) { .st-topbtn:hover { color: var(--st-text); border-color: var(--st-line-strong); } }
.st-topbtn.is-open { color: var(--st-text); border-color: var(--st-accent); }
.st-topbtn:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }

/* Stage */
.st-stage { position: relative; z-index: 5; flex: 1; min-height: 0; display: flex; }
.st-stage__slide { position: relative; flex: 1; min-height: 0; display: flex; overflow-y: auto; overflow-x: hidden; }
.st-card { margin: auto; width: 100%; max-width: 760rem; padding: 40rem 32rem 44rem; }
.st-card--wide { max-width: 880rem; }

/* Slide transitions */
.st-fwd-enter-active, .st-fwd-leave-active, .st-back-enter-active, .st-back-leave-active { transition: opacity 0.28s ease, transform 0.28s ease; }
.st-fwd-enter-from { opacity: 0; transform: translateX(26rem); }
.st-fwd-leave-to { opacity: 0; transform: translateX(-26rem); }
.st-back-enter-from { opacity: 0; transform: translateX(-26rem); }
.st-back-leave-to { opacity: 0; transform: translateX(26rem); }
.st-fade-enter-active, .st-fade-leave-active { transition: opacity 0.3s ease; }
.st-fade-enter-from, .st-fade-leave-to { opacity: 0; }

/* Type + primitives */
.st-eyebrow { font-family: var(--st-mono); font-size: 12rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--st-accent); margin-bottom: 16rem; }
.st-h1 { font-family: var(--st-display); font-weight: 700; font-size: clamp(44rem, 7vw, 88rem); line-height: 0.95; letter-spacing: -0.02em; }
.st-h2 { font-family: var(--st-display); font-weight: 600; font-size: clamp(28rem, 4.4vw, 44rem); line-height: 1.06; letter-spacing: -0.015em; }
.st-lead { font-size: clamp(17rem, 2.2vw, 20rem); line-height: 1.55; color: var(--st-muted-strong); }
.st-body { font-size: 15.5rem; line-height: 1.65; color: var(--st-muted-strong); }
.st-note { font-size: 13.5rem; line-height: 1.55; color: var(--st-muted); }
.st-num { font-family: var(--st-mono); font-variant-numeric: tabular-nums; }

.st-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9rem;
  padding: 14rem 26rem; border-radius: 10rem;
  font-family: var(--st-display); font-weight: 600; font-size: 15rem;
  cursor: pointer; border: 1.5px solid transparent;
  transition: transform 0.1s ease, filter 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}
.st-btn:active { transform: translateY(1px); }
.st-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.st-btn--primary { background: var(--st-accent); color: #06222A; }
@media (hover: hover) { .st-btn--primary:not(:disabled):hover { filter: brightness(1.08); } }
.st-btn--ghost { background: transparent; color: var(--st-text); border-color: var(--st-line-strong); }
@media (hover: hover) { .st-btn--ghost:not(:disabled):hover { border-color: var(--st-text); } }
.st-btn:focus-visible { outline: 2px solid var(--st-text); outline-offset: 3px; }

.st-reveal {
  display: inline-flex; align-items: center; gap: 7rem; margin-top: 4rem;
  font-family: var(--st-mono); font-size: 12.5rem; color: var(--st-accent);
  padding: 6rem 0;
}
.st-reveal:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-reveal svg { transition: transform 0.2s ease; }
.st-reveal.is-open svg { transform: rotate(180deg); }
.st-revealbody { margin-top: 14rem; padding: 16rem 18rem; background: color-mix(in srgb, var(--st-panel) 70%, transparent); border: 1px solid var(--st-line); border-radius: 12rem; }

@media (prefers-reduced-motion: reduce) {
  .st-fwd-enter-active, .st-fwd-leave-active, .st-back-enter-active, .st-back-leave-active,
  .st-fade-enter-active, .st-fade-leave-active { transition: opacity 0.2s ease; transform: none !important; }
  .st-reveal svg { transition: none; }
}
@media (max-width: 640px) {
  .st-card { padding: 28rem 20rem 36rem; }
  .st-topbtn span { display: none; }
}
</style>
