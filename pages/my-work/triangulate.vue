<script setup lang="ts">
import type { SgView } from '~/types/seismo'
import SgTitle from '~/components/work/seismo/Title.vue'
import SgObjectives from '~/components/work/seismo/Objectives.vue'
import SgMenu from '~/components/work/seismo/Menu.vue'
import SgLesson from '~/components/work/seismo/Lesson.vue'
import SgHandsOn from '~/components/work/seismo/HandsOn.vue'
import SgAssessment from '~/components/work/seismo/Assessment.vue'
import SgThankYou from '~/components/work/seismo/ThankYou.vue'
import SgControls from '~/components/work/seismo/Controls.vue'

const SEQUENCE: { id: SgView; label: string }[] = [
  { id: 'title', label: 'Start' },
  { id: 'objectives', label: 'Objectives' },
  { id: 'menu', label: 'Station log' },
  { id: 'lesson', label: 'Lesson' },
  { id: 'hands-on', label: 'Hands on' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'thank-you', label: 'Result' }
]

definePageMeta({ layout: false, pageTransition: { name: 'sg-fade', mode: 'out-in' } })

useHead({
  title: 'Triangulate: Find the Epicentre',
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap' }
  ]
})

const store = useSeismoStore()
const scroller = ref<HTMLElement | null>(null)

onMounted(() => store.start())

function go(next: SgView) {
  store.goTo(next)
  nextTick(() => scroller.value?.scrollTo({ top: 0, behavior: 'auto' }))
}

const index = computed(() => SEQUENCE.findIndex(s => s.id === store.view))
const current = computed(() => SEQUENCE[index.value])
</script>

<template>
  <div class="sg-app">
    <div class="sg-app__paper" aria-hidden="true" />

    <NuxtLink to="/" class="sg-exit" aria-label="Leave the module">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      <span>Exit</span>
    </NuxtLink>

    <header class="sg-topbar">
      <div class="sg-topbar__brand">
        <span class="sg-topbar__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M1 12h4l2-7 4 14 3-9 2 4 3-2h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="sg-topbar__word">TRIANGULATE</span>
      </div>
      <div class="sg-topbar__progress" role="img" :aria-label="`${store.completedCount} of 3 sections complete`">
        <span class="sg-topbar__tick" :class="{ 'is-done': store.progress.lesson }"><i /> Lesson</span>
        <span class="sg-topbar__tick" :class="{ 'is-done': store.progress.handsOn }"><i /> Hands on</span>
        <span class="sg-topbar__tick" :class="{ 'is-done': store.progress.assessment }"><i /> Assessment</span>
      </div>
    </header>

    <main ref="scroller" class="sg-scroll">
      <Transition name="sg-screen" mode="out-in">
        <SgTitle v-if="store.view === 'title'" key="title" @start="go('objectives')" />
        <SgObjectives v-else-if="store.view === 'objectives'" key="objectives" @continue="go('menu')" />
        <SgMenu v-else-if="store.view === 'menu'" key="menu" @open="go" />
        <SgLesson v-else-if="store.view === 'lesson'" key="lesson" @back="go('menu')" @continue="go('hands-on')" />
        <SgHandsOn v-else-if="store.view === 'hands-on'" key="hands-on" @back="go('menu')" @continue="go('assessment')" />
        <SgAssessment v-else-if="store.view === 'assessment'" key="assessment" @back="go('menu')" @continue="go('thank-you')" />
        <SgThankYou v-else-if="store.view === 'thank-you'" key="thank-you" @restart="store.reset(); go('title')" />
      </Transition>
    </main>

    <SgControls
      :sequence="SEQUENCE"
      :index="index"
      :current-label="current?.label || ''"
      @go="go"
    />
  </div>
</template>

<style>
/* Unscoped: the design tokens and shared primitives below are consumed by
   every screen component under components/work/seismo/. */
.sg-app {
  --sg-paper: #E7EEEC;
  --sg-panel: #FBFDFC;
  --sg-ink: #16242B;
  --sg-muted: #566A70;
  --sg-muted-strong: #435459; /* passes AA on the panel surface */
  --sg-grid: #CAD8D5;
  --sg-line: #B7C7C4;
  --sg-p: #1E6E8C;      /* P wave — teal, AA on paper/panel */
  --sg-s: #946012;      /* S wave — ochre-amber, AA text on paper (4.5:1) */
  --sg-epi: #C13520;    /* epicentre / result — seismic red, AA text (4.7:1) */
  --sg-display: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
  --sg-body: 'Inter', system-ui, sans-serif;
  --sg-mono: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', monospace;

  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--sg-paper);
  color: var(--sg-ink);
  font-family: var(--sg-body);
}

/* faint graph paper across the whole app — you read time/amplitude off it */
.sg-app__paper {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(var(--sg-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--sg-grid) 1px, transparent 1px);
  background-size: 26rem 26rem;
  opacity: 0.5;
  mask-image: linear-gradient(180deg, transparent, #000 80rem, #000);
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 80rem, #000);
}

.sg-exit {
  position: absolute;
  top: calc(14rem + var(--safe-top));
  right: calc(18rem + var(--safe-right));
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 7rem 12rem;
  border-radius: 999rem;
  font-family: var(--sg-mono);
  font-size: 12rem;
  color: var(--sg-muted-strong);
  background: var(--sg-panel);
  border: 1px solid var(--sg-line);
  transition: color 0.15s ease, border-color 0.15s ease;
}
@media (hover: hover) { .sg-exit:hover { color: var(--sg-ink); border-color: var(--sg-muted); } }
.sg-exit:focus-visible { outline: 2px solid var(--sg-ink); outline-offset: 2px; }

/* ── top status strip ── */
.sg-topbar {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  height: 52rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rem;
  padding-top: var(--safe-top);
  padding-left: calc(20rem + var(--safe-left));
}
.sg-topbar__brand { display: inline-flex; align-items: center; gap: 9rem; color: var(--sg-ink); }
.sg-topbar__mark { color: var(--sg-epi); display: flex; }
.sg-topbar__word {
  font-family: var(--sg-display);
  font-weight: 700;
  font-size: 15rem;
  letter-spacing: 0.14em;
}
.sg-topbar__progress { display: flex; gap: 14rem; }
.sg-topbar__tick {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  font-family: var(--sg-mono);
  font-size: 11rem;
  letter-spacing: 0.02em;
  color: var(--sg-muted-strong);
}
.sg-topbar__tick i {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  border: 1.5px solid var(--sg-muted);
  transition: background 0.25s ease, border-color 0.25s ease;
}
.sg-topbar__tick.is-done i { background: var(--sg-epi); border-color: var(--sg-epi); }
.sg-topbar__tick.is-done { color: var(--sg-ink); }

/* ── scroll area ── */
.sg-scroll {
  position: relative;
  z-index: 5;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ── shared screen + editorial primitives ── */
.sg-screen {
  max-width: 900rem;
  margin: 0 auto;
  padding: 40rem 32rem 56rem;
}
.sg-screen--narrow { max-width: 680rem; }
.sg-eyebrow {
  font-family: var(--sg-mono);
  font-size: 12rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sg-s);
  margin-bottom: 14rem;
}
.sg-h1 {
  font-family: var(--sg-display);
  font-size: clamp(30rem, 4.4vw, 46rem);
  font-weight: 600;
  line-height: 1.06;
  letter-spacing: -0.01em;
  color: var(--sg-ink);
}
.sg-h2 {
  font-family: var(--sg-display);
  font-size: clamp(24rem, 3.2vw, 32rem);
  font-weight: 600;
  line-height: 1.14;
  color: var(--sg-ink);
  margin-bottom: 18rem;
}
.sg-lead {
  font-size: 17rem;
  line-height: 1.62;
  color: var(--sg-ink);
}
.sg-body {
  font-size: 15.5rem;
  line-height: 1.68;
  color: var(--sg-ink);
}
.sg-note { font-size: 13.5rem; line-height: 1.55; color: var(--sg-muted-strong); }

.sg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9rem;
  padding: 13rem 24rem;
  border-radius: 7rem;
  font-family: var(--sg-display);
  font-size: 14.5rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: transform 0.1s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.sg-btn:active { transform: translateY(1px); }
.sg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.sg-btn--primary { background: var(--sg-ink); color: var(--sg-paper); }
@media (hover: hover) { .sg-btn--primary:not(:disabled):hover { background: #22343c; } }
.sg-btn--ghost { background: transparent; color: var(--sg-ink); border-color: var(--sg-line); }
@media (hover: hover) { .sg-btn--ghost:not(:disabled):hover { border-color: var(--sg-muted); } }
.sg-btn:focus-visible { outline: 2px solid var(--sg-ink); outline-offset: 3px; }

.sg-back {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  font-family: var(--sg-mono);
  font-size: 12.5rem;
  color: var(--sg-muted-strong);
  padding: 6rem 0;
  margin-bottom: 8rem;
}
@media (hover: hover) { .sg-back:hover { color: var(--sg-ink); } }
.sg-back:focus-visible { outline: 2px solid var(--sg-ink); outline-offset: 2px; }

/* screen crossfade + page transition */
.sg-screen-enter-active, .sg-screen-leave-active { transition: opacity 0.26s ease; }
.sg-screen-enter-from, .sg-screen-leave-to { opacity: 0; }
.sg-fade-enter-active, .sg-fade-leave-active { transition: opacity 0.3s ease; }
.sg-fade-enter-from, .sg-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .sg-screen-enter-active, .sg-screen-leave-active,
  .sg-fade-enter-active, .sg-fade-leave-active { transition: none; }
}

@media (max-width: 720px) {
  .sg-topbar__progress { gap: 9rem; }
  .sg-topbar__tick { font-size: 0; gap: 0; }
  .sg-topbar__tick i { width: 10rem; height: 10rem; }
  .sg-screen { padding: 28rem 18rem 44rem; }
}
</style>
