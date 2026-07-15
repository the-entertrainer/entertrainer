<script setup lang="ts">
import type { GvView } from '~/types/groove'
import GvTitle from '~/components/work/groove/Title.vue'
import GvObjectives from '~/components/work/groove/Objectives.vue'
import GvMenu from '~/components/work/groove/Menu.vue'
import GvLesson from '~/components/work/groove/Lesson.vue'
import GvHandsOn from '~/components/work/groove/HandsOn.vue'
import GvAssessment from '~/components/work/groove/Assessment.vue'
import GvThankYou from '~/components/work/groove/ThankYou.vue'
import GvControls from '~/components/work/groove/Controls.vue'

const SEQUENCE: { id: GvView; label: string }[] = [
  { id: 'title', label: 'Start' },
  { id: 'objectives', label: 'Objectives' },
  { id: 'menu', label: 'Menu' },
  { id: 'lesson', label: 'Lesson' },
  { id: 'hands-on', label: 'Hands on' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'thank-you', label: 'Result' }
]

definePageMeta({ layout: false, pageTransition: { name: 'gv-fade', mode: 'out-in' } })
useHead({
  title: 'Downbeat: Build a Groove',
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap' }]
})

const store = useGrooveStore()
const scroller = ref<HTMLElement | null>(null)
onMounted(() => store.start())

function go(next: GvView) {
  store.goTo(next)
  nextTick(() => scroller.value?.scrollTo({ top: 0, behavior: 'auto' }))
}
const index = computed(() => SEQUENCE.findIndex(s => s.id === store.view))
const current = computed(() => SEQUENCE[index.value])
</script>

<template>
  <div class="gv-app">
    <header class="gv-topbar">
      <div class="gv-topbar__brand">
        <span class="gv-topbar__eq" aria-hidden="true"><i /><i /><i /><i /></span>
        <span class="gv-topbar__word">DOWNBEAT</span>
      </div>
      <div class="gv-topbar__right">
        <div class="gv-topbar__progress" role="img" :aria-label="`${store.completedCount} of 3 sections complete`">
          <span class="gv-tick" :class="{ 'is-done': store.progress.lesson }"><i /> Lesson</span>
          <span class="gv-tick" :class="{ 'is-done': store.progress.handsOn }"><i /> Hands on</span>
          <span class="gv-tick" :class="{ 'is-done': store.progress.assessment }"><i /> Assessment</span>
        </div>
        <NuxtLink to="/" class="gv-exit" aria-label="Leave the module">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
          <span>Exit</span>
        </NuxtLink>
      </div>
    </header>

    <main ref="scroller" class="gv-scroll">
      <Transition name="gv-screen" mode="out-in">
        <GvTitle v-if="store.view === 'title'" key="title" @start="go('objectives')" />
        <GvObjectives v-else-if="store.view === 'objectives'" key="objectives" @continue="go('menu')" />
        <GvMenu v-else-if="store.view === 'menu'" key="menu" @open="go" />
        <GvLesson v-else-if="store.view === 'lesson'" key="lesson" @back="go('menu')" @continue="go('hands-on')" />
        <GvHandsOn v-else-if="store.view === 'hands-on'" key="hands-on" @back="go('menu')" @continue="go('assessment')" />
        <GvAssessment v-else-if="store.view === 'assessment'" key="assessment" @back="go('menu')" @continue="go('thank-you')" />
        <GvThankYou v-else-if="store.view === 'thank-you'" key="thank-you" @restart="store.reset(); go('title')" />
      </Transition>
    </main>

    <GvControls :sequence="SEQUENCE" :index="index" :current-label="current?.label || ''" @go="go" />
  </div>
</template>

<style>
.gv-app {
  --gv-bg: #201933;
  --gv-panel: #2B2447;
  --gv-slot: #191330;
  --gv-slot-hover: #251D42;
  --gv-line: rgba(243, 239, 250, 0.10);
  --gv-line-strong: rgba(243, 239, 250, 0.22);
  --gv-text: #F3EFFA;
  --gv-muted: #B7AFD6;
  --gv-muted-strong: #C9C2E4;
  --gv-kick: #FF6E61;
  --gv-snare: #FFC53D;
  --gv-hat: #45C7BE;
  --gv-accent: #FF4D9D;
  --gv-display: 'Archivo', system-ui, sans-serif;
  --gv-body: 'Inter', system-ui, sans-serif;
  --gv-mono: 'Space Mono', ui-monospace, monospace;

  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(120% 80% at 15% -10%, #2A2148, transparent 60%),
    radial-gradient(120% 80% at 100% 110%, #2A1B3E, transparent 55%),
    var(--gv-bg);
  color: var(--gv-text);
  font-family: var(--gv-body);
}

.gv-exit {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 7rem 12rem;
  border-radius: 999rem;
  font-family: var(--gv-mono);
  font-size: 12rem;
  color: var(--gv-muted);
  border: 1px solid var(--gv-line);
  transition: color 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
}
@media (hover: hover) { .gv-exit:hover { color: var(--gv-text); border-color: var(--gv-line-strong); } }
.gv-exit:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; }

.gv-topbar {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  min-height: 54rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rem;
  padding: 0 20rem;
  padding-top: var(--safe-top);
  padding-left: calc(20rem + var(--safe-left));
  padding-right: calc(18rem + var(--safe-right));
}
.gv-topbar__right { display: flex; align-items: center; gap: 16rem; }
.gv-topbar__brand { display: inline-flex; align-items: center; gap: 11rem; }
.gv-topbar__eq { display: inline-flex; align-items: flex-end; gap: 2.5rem; height: 16rem; }
.gv-topbar__eq i {
  width: 3rem; border-radius: 2rem; background: var(--gv-accent);
  animation: gv-eq 0.9s ease-in-out infinite;
}
.gv-topbar__eq i:nth-child(1) { height: 8rem; animation-delay: 0s; }
.gv-topbar__eq i:nth-child(2) { height: 15rem; animation-delay: 0.15s; background: var(--gv-hat); }
.gv-topbar__eq i:nth-child(3) { height: 6rem; animation-delay: 0.3s; background: var(--gv-snare); }
.gv-topbar__eq i:nth-child(4) { height: 12rem; animation-delay: 0.45s; }
@keyframes gv-eq { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }
.gv-topbar__word { font-family: var(--gv-display); font-weight: 900; font-size: 16rem; letter-spacing: 0.06em; }

.gv-topbar__progress { display: flex; gap: 14rem; }
.gv-tick { display: inline-flex; align-items: center; gap: 6rem; font-family: var(--gv-mono); font-size: 11rem; color: var(--gv-muted); }
.gv-tick i { width: 8rem; height: 8rem; border-radius: 50%; border: 1.5px solid var(--gv-muted); transition: background 0.25s ease, border-color 0.25s ease; }
.gv-tick.is-done i { background: var(--gv-accent); border-color: var(--gv-accent); }
.gv-tick.is-done { color: var(--gv-text); }

.gv-scroll { position: relative; z-index: 5; flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; }

/* shared screen + type primitives */
.gv-screen { max-width: 920rem; margin: 0 auto; padding: 40rem 32rem 60rem; }
.gv-screen--narrow { max-width: 680rem; }
.gv-eyebrow { font-family: var(--gv-mono); font-size: 12rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gv-accent); margin-bottom: 14rem; }
.gv-h1 { font-family: var(--gv-display); font-weight: 900; font-size: clamp(38rem, 6vw, 76rem); line-height: 0.98; letter-spacing: -0.01em; }
.gv-h2 { font-family: var(--gv-display); font-weight: 800; font-size: clamp(24rem, 3.4vw, 34rem); line-height: 1.08; margin-bottom: 18rem; }
.gv-lead { font-size: 17rem; line-height: 1.6; color: var(--gv-muted-strong); }
.gv-body { font-size: 15.5rem; line-height: 1.65; color: var(--gv-muted-strong); }
.gv-note { font-size: 13.5rem; line-height: 1.55; color: var(--gv-muted); }

.gv-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9rem;
  padding: 13rem 24rem; border-radius: 999rem;
  font-family: var(--gv-display); font-weight: 700; font-size: 14.5rem;
  cursor: pointer; border: 1.5px solid transparent;
  transition: transform 0.1s ease, filter 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}
.gv-btn:active { transform: translateY(1px); }
.gv-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.gv-btn--primary { background: var(--gv-accent); color: var(--gv-bg); }
@media (hover: hover) { .gv-btn--primary:not(:disabled):hover { filter: brightness(1.08); } }
.gv-btn--ghost { background: transparent; color: var(--gv-text); border-color: var(--gv-line-strong); }
@media (hover: hover) { .gv-btn--ghost:not(:disabled):hover { border-color: var(--gv-text); } }
.gv-btn:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 3px; }

.gv-back {
  display: inline-flex; align-items: center; gap: 6rem;
  font-family: var(--gv-mono); font-size: 12.5rem; color: var(--gv-muted);
  padding: 6rem 0; margin-bottom: 8rem;
}
@media (hover: hover) { .gv-back:hover { color: var(--gv-text); } }
.gv-back:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; }

.gv-screen-enter-active, .gv-screen-leave-active { transition: opacity 0.26s ease; }
.gv-screen-enter-from, .gv-screen-leave-to { opacity: 0; }
.gv-fade-enter-active, .gv-fade-leave-active { transition: opacity 0.3s ease; }
.gv-fade-enter-from, .gv-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .gv-topbar__eq i { animation: none; }
  .gv-screen-enter-active, .gv-screen-leave-active, .gv-fade-enter-active, .gv-fade-leave-active { transition: none; }
}

@media (max-width: 720px) {
  .gv-topbar__progress { gap: 9rem; }
  .gv-tick { font-size: 0; gap: 0; }
  .gv-tick i { width: 10rem; height: 10rem; }
  .gv-screen { padding: 28rem 18rem 48rem; }
}
</style>
