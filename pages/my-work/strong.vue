<script setup lang="ts">
import type { StView } from '~/types/strong'
import StTitle from '~/components/work/strong/Title.vue'
import StObjectives from '~/components/work/strong/Objectives.vue'
import StMenu from '~/components/work/strong/Menu.vue'
import StLesson from '~/components/work/strong/Lesson.vue'
import StHandsOn from '~/components/work/strong/HandsOn.vue'
import StAssessment from '~/components/work/strong/Assessment.vue'
import StThankYou from '~/components/work/strong/ThankYou.vue'
import StControls from '~/components/work/strong/Controls.vue'

const SEQUENCE: { id: StView; label: string }[] = [
  { id: 'title', label: 'Start' },
  { id: 'objectives', label: 'Objectives' },
  { id: 'menu', label: 'Menu' },
  { id: 'lesson', label: 'Lesson' },
  { id: 'hands-on', label: 'Password lab' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'thank-you', label: 'Result' }
]

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
const scroller = ref<HTMLElement | null>(null)
onMounted(() => store.start())

function go(next: StView) {
  store.goTo(next)
  nextTick(() => scroller.value?.scrollTo({ top: 0, behavior: 'auto' }))
}
const index = computed(() => SEQUENCE.findIndex(s => s.id === store.view))
const current = computed(() => SEQUENCE[index.value])
</script>

<template>
  <div class="st-app">
    <header class="st-topbar">
      <div class="st-topbar__brand">
        <span class="st-topbar__mark" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </span>
        <span class="st-topbar__word">STRONG</span>
      </div>
      <div class="st-topbar__right">
        <div class="st-topbar__progress" role="img" :aria-label="`${store.completedCount} of 3 sections complete`">
          <span class="st-tick" :class="{ 'is-done': store.progress.lesson }"><i /> Lesson</span>
          <span class="st-tick" :class="{ 'is-done': store.progress.handsOn }"><i /> Lab</span>
          <span class="st-tick" :class="{ 'is-done': store.progress.assessment }"><i /> Assessment</span>
        </div>
        <NuxtLink to="/" class="st-exit" aria-label="Leave the module">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
          <span>Exit</span>
        </NuxtLink>
      </div>
    </header>

    <main ref="scroller" class="st-scroll">
      <Transition name="st-screen" mode="out-in">
        <StTitle v-if="store.view === 'title'" key="title" @start="go('objectives')" />
        <StObjectives v-else-if="store.view === 'objectives'" key="objectives" @continue="go('menu')" />
        <StMenu v-else-if="store.view === 'menu'" key="menu" @open="go" />
        <StLesson v-else-if="store.view === 'lesson'" key="lesson" @back="go('menu')" @continue="go('hands-on')" />
        <StHandsOn v-else-if="store.view === 'hands-on'" key="hands-on" @back="go('menu')" @continue="go('assessment')" />
        <StAssessment v-else-if="store.view === 'assessment'" key="assessment" @back="go('menu')" @continue="go('thank-you')" />
        <StThankYou v-else-if="store.view === 'thank-you'" key="thank-you" @restart="store.reset(); go('title')" />
      </Transition>
    </main>

    <StControls :sequence="SEQUENCE" :index="index" :current-label="current?.label || ''" @go="go" />
  </div>
</template>

<style>
.st-app {
  --st-bg: #0E1622;
  --st-panel: #16212E;
  --st-slot: #0B121C;
  --st-slot-hover: #1C2A38;
  --st-line: rgba(220, 232, 240, 0.10);
  --st-line-strong: rgba(220, 232, 240, 0.20);
  --st-text: #EAF2F8;
  --st-muted: #8FA3B4;
  --st-muted-strong: #B7C6D2;
  --st-accent: #35D0C4;

  /* Strength spectrum: entropy is encoded as colour, weak (warm) to strong (cool). */
  --st-t0: #FF5D5D;
  --st-t1: #FF9245;
  --st-t2: #F4C64A;
  --st-t3: #35C89A;
  --st-t4: #58A6FF;

  /* Attacker hues, referenced from crypto.ts ATTACKERS. */
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
  background:
    radial-gradient(115% 75% at 12% -8%, #13253180, transparent 60%),
    radial-gradient(120% 80% at 100% 108%, #141E2E, transparent 55%),
    var(--st-bg);
  color: var(--st-text);
  font-family: var(--st-body);
}
/* Faint search-space grid: the haystack the attacker sifts. */
.st-app::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(120, 200, 210, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 200, 210, 0.04) 1px, transparent 1px);
  background-size: 28rem 28rem;
  pointer-events: none;
  z-index: 0;
}

.st-exit {
  display: inline-flex; align-items: center; gap: 6rem;
  padding: 7rem 12rem; border-radius: 999rem;
  font-family: var(--st-mono); font-size: 12rem; color: var(--st-muted);
  border: 1px solid var(--st-line);
  transition: color 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
}
@media (hover: hover) { .st-exit:hover { color: var(--st-text); border-color: var(--st-line-strong); } }
.st-exit:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }

.st-topbar {
  position: relative; z-index: 10; flex-shrink: 0; min-height: 54rem;
  display: flex; align-items: center; justify-content: space-between; gap: 16rem;
  padding: 0 20rem; padding-top: var(--safe-top);
  padding-left: calc(20rem + var(--safe-left));
  padding-right: calc(18rem + var(--safe-right));
}
.st-topbar__right { display: flex; align-items: center; gap: 16rem; }
.st-topbar__brand { display: inline-flex; align-items: center; gap: 10rem; }
.st-topbar__mark { color: var(--st-accent); display: inline-flex; }
.st-topbar__word { font-family: var(--st-display); font-weight: 700; font-size: 16rem; letter-spacing: 0.14em; }

.st-topbar__progress { display: flex; gap: 14rem; }
.st-tick { display: inline-flex; align-items: center; gap: 6rem; font-family: var(--st-mono); font-size: 11rem; color: var(--st-muted); }
.st-tick i { width: 8rem; height: 8rem; border-radius: 50%; border: 1.5px solid var(--st-muted); transition: background 0.25s ease, border-color 0.25s ease; }
.st-tick.is-done i { background: var(--st-accent); border-color: var(--st-accent); }
.st-tick.is-done { color: var(--st-text); }

.st-scroll { position: relative; z-index: 5; flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; }

/* shared screen + type primitives */
.st-screen { position: relative; z-index: 1; max-width: 940rem; margin: 0 auto; padding: 40rem 32rem 60rem; }
.st-screen--narrow { max-width: 700rem; }
.st-eyebrow { font-family: var(--st-mono); font-size: 12rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--st-accent); margin-bottom: 14rem; }
.st-h1 { font-family: var(--st-display); font-weight: 700; font-size: clamp(40rem, 6.4vw, 82rem); line-height: 0.96; letter-spacing: -0.02em; }
.st-h2 { font-family: var(--st-display); font-weight: 600; font-size: clamp(24rem, 3.4vw, 34rem); line-height: 1.1; margin-bottom: 18rem; letter-spacing: -0.01em; }
.st-lead { font-size: 17rem; line-height: 1.6; color: var(--st-muted-strong); }
.st-body { font-size: 15.5rem; line-height: 1.65; color: var(--st-muted-strong); }
.st-note { font-size: 13.5rem; line-height: 1.55; color: var(--st-muted); }
.st-num { font-family: var(--st-mono); font-variant-numeric: tabular-nums; }

.st-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9rem;
  padding: 13rem 24rem; border-radius: 10rem;
  font-family: var(--st-display); font-weight: 600; font-size: 14.5rem;
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

.st-back {
  display: inline-flex; align-items: center; gap: 6rem;
  font-family: var(--st-mono); font-size: 12.5rem; color: var(--st-muted);
  padding: 6rem 0; margin-bottom: 8rem;
}
@media (hover: hover) { .st-back:hover { color: var(--st-text); } }
.st-back:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }

.st-screen-enter-active, .st-screen-leave-active { transition: opacity 0.26s ease; }
.st-screen-enter-from, .st-screen-leave-to { opacity: 0; }
.st-fade-enter-active, .st-fade-leave-active { transition: opacity 0.3s ease; }
.st-fade-enter-from, .st-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .st-screen-enter-active, .st-screen-leave-active, .st-fade-enter-active, .st-fade-leave-active { transition: none; }
}

@media (max-width: 720px) {
  .st-topbar__progress { gap: 9rem; }
  .st-tick { font-size: 0; gap: 0; }
  .st-tick i { width: 10rem; height: 10rem; }
  .st-screen { padding: 28rem 18rem 48rem; }
}
</style>
