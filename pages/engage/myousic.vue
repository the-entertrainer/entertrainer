<script setup lang="ts">
definePageMeta({ layout: false })

/**
 * Myousic — color choices, then a composed just-intonation tune.
 * Flute or violin, plucked harmony, bass. Phrases, not a drone.
 */
import {
  energyWord,
  pleasantnessWord,
  strategyText,
  buildPlan,
  type SessionPlan,
} from '~/utils/myousic/bridge'
import { createEngine, type LyreEngine } from '~/utils/myousic/engine'
import { mulberry32, nextChoices, settled, type Swatch } from '~/utils/myousic/survey'
import { getTuning } from '~/utils/myousic/tunings'
import type { ComponentPublicInstance } from 'vue'

useSeoMeta({
  title: 'Myousic · Engage',
  description:
    'Repeated color choices estimate pleasantness and energy. A just-intonation flute or violin meets that reading, then shifts.',
  ogUrl: 'https://entertrainer.in/engage/myousic',
})

type Phase = 'mark' | 'ask' | 'listen'
type Theme = 'light' | 'dark'

const THEME_KEY = 'entertrainer-myousic-theme'

const phase = ref<Phase>('mark')
const theme = ref<Theme>('light')
const choices = ref<Swatch[]>([])
const history = ref<Swatch[]>([])
const plan = ref<SessionPlan | null>(null)
const running = ref(false)
const level = ref(0.78)

const stringEls = ref<(HTMLElement | null)[]>([])
const journeyEl = ref<HTMLElement | null>(null)
const readoutEl = ref<HTMLElement | null>(null)

let rng: () => number = () => 0.5
let engine: LyreEngine | null = null
let splashTimer = 0
let frame = 0

const tuning = computed(() => (plan.value ? getTuning(plan.value.tuningId) : null))
const voice = computed(() => (plan.value?.instrument === 'violin' ? 'Violin' : 'Flute'))

function setString(index: number, el: Element | ComponentPublicInstance | null) {
  stringEls.value[index] = el instanceof HTMLElement ? el : null
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function toggleTheme() {
  const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
  theme.value = next
  try {
    sessionStorage.setItem(THEME_KEY, next)
  } catch {
    /* private mode */
  }
}

function tick() {
  const snap = engine?.snapshot()
  if (snap) {
    stringEls.value.forEach((el, i) => {
      if (!el) return
      const on = snap.degree === i
      const lift = on ? 2.15 : 0.85 + snap.amp * 0.45
      el.style.transform = `scaleY(${lift})`
      el.style.opacity = String(on ? 0.95 : 0.22 + snap.amp * 0.35)
    })
    if (journeyEl.value) {
      journeyEl.value.style.transform = `scaleX(${Math.max(0.02, snap.journey)})`
    }
    if (readoutEl.value && snap.label) {
      const hz = snap.hz >= 100 ? snap.hz.toFixed(0) : snap.hz.toFixed(1)
      readoutEl.value.textContent = `${snap.label} · ${hz} Hz`
    }
  }
  frame = window.requestAnimationFrame(tick)
}

function onPick(swatch: Swatch) {
  const next = [...history.value, swatch]
  if (!settled(next)) {
    history.value = next
    choices.value = nextChoices(next, rng)
    return
  }
  const seed = (Date.now() ^ next.length * 997) >>> 0
  const made = buildPlan(next, seed || 1)
  engine?.dispose()
  engine = createEngine()
  history.value = next
  plan.value = made
  phase.value = 'listen'
  running.value = true
  void engine.start(made, level.value).catch(() => {
    running.value = false
  })
}

async function togglePlay() {
  if (!engine) return
  if (engine.isRunning()) {
    await engine.pause()
    running.value = false
  } else {
    await engine.resume()
    running.value = true
  }
}

function onLevel(value: number) {
  level.value = value
  engine?.setLevel(value)
}

function again() {
  engine?.dispose()
  engine = null
  running.value = false
  plan.value = null
  history.value = []
  choices.value = nextChoices([], rng)
  phase.value = 'ask'
}

function onKey(event: KeyboardEvent) {
  if (phase.value !== 'listen' || event.code !== 'Space') return
  const tag = (event.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SUMMARY') return
  event.preventDefault()
  void togglePlay()
}

onMounted(() => {
  try {
    const saved = sessionStorage.getItem(THEME_KEY)
    theme.value = saved === 'light' || saved === 'dark' ? saved : systemTheme()
  } catch {
    theme.value = systemTheme()
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0
  rng = mulberry32(seed)
  choices.value = nextChoices([], rng)
  splashTimer = window.setTimeout(() => {
    phase.value = 'ask'
  }, reduce ? 700 : 2400)
  frame = window.requestAnimationFrame(tick)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.clearTimeout(splashTimer)
  window.cancelAnimationFrame(frame)
  window.removeEventListener('keydown', onKey)
  engine?.dispose()
  engine = null
})
</script>

<template>
  <div class="my" :class="theme === 'dark' ? 'my--dark' : 'my--light'">
    <header class="my__bar">
      <NuxtLink to="/engage" class="my__back" aria-label="Back to Engage">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
        <span>Back</span>
      </NuxtLink>
      <NuxtLink to="/" class="my__home" aria-label="Entertrainer home">
        <EdWordmark variant="mark" :size="28" />
      </NuxtLink>
      <div class="my__end">
        <div class="my__titles">
          <span class="my__title">Myousic</span>
          <span class="my__subtitle">Color, then a tone</span>
        </div>
        <button
          type="button"
          class="my__theme"
          :aria-label="theme === 'dark' ? 'Use light colors' : 'Use dark colors'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z" />
          </svg>
        </button>
      </div>
    </header>

    <div v-if="phase === 'mark'" class="my__splash">
      <h1>
        <span class="my__wordmark my__wordmark--lg">
          <svg class="my__mark my__mark--lg" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M22 46 V24 M32 50 V16 M42 46 V24 M18 46 H46" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <span class="my__word">Myousic</span>
        </span>
      </h1>
    </div>

    <main v-else-if="phase === 'ask'" class="my__stage">
      <h1>Which is closest</h1>
      <p class="my__sub">to right now</p>
      <div class="my__swatches">
        <button
          v-for="swatch in choices"
          :key="swatch.id"
          type="button"
          class="my__swatch"
          :style="{ background: swatch.hex }"
          :aria-label="swatch.name"
          @click="onPick(swatch)"
        />
      </div>
      <div class="my__dots" aria-hidden="true">
        <span v-for="(_, i) in history" :key="i" class="my__dot" />
      </div>
      <p class="my__sr" aria-live="polite">
        {{ history.length === 0 ? 'Choose a color' : `${history.length} chosen` }}
      </p>
    </main>

    <main v-else-if="phase === 'listen' && plan && tuning" class="my__stage my__listen">
      <p class="my__sr">
        {{ plan.tentative ? 'Tentative reading. ' : '' }}{{ plan.phrase }}. {{ plan.intent }}
      </p>
      <h1>{{ plan.phrase }}</h1>
      <p class="my__intent">{{ plan.intent }}</p>
      <p v-if="plan.tentative" class="my__tentative">The colors disagreed, so this is tentative.</p>
      <div class="my__strings" aria-hidden="true">
        <span v-for="i in 7" :key="i" :ref="(el) => setString(i - 1, el)" />
      </div>
      <div class="my__journey" aria-hidden="true">
        <span ref="journeyEl" />
      </div>
      <p class="my__meta">{{ voice }} · {{ tuning.name }}</p>
      <p ref="readoutEl" class="my__readout">&nbsp;</p>
      <div class="my__controls">
        <button
          type="button"
          class="my__play"
          :aria-label="running ? 'Pause' : 'Play'"
          :aria-pressed="running"
          @click="togglePlay"
        >
          <svg v-if="running" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </button>
        <input
          class="my__level"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="level"
          aria-label="Level"
          @input="onLevel(Number(($event.target as HTMLInputElement).value))"
        />
      </div>
      <button type="button" class="my__text" @click="again">Begin again</button>
      <details class="my__basis">
        <summary>Basis</summary>
        <p>
          {{ plan.affect.rounds }} choices, later ones weighted more. They read as
          {{ pleasantnessWord(plan.affect.valence) }}, {{ energyWord(plan.affect.arousal) }}. This is an estimate from
          color, not a diagnosis. One swatch is ambiguous, which is why it asks more than once and keeps a
          disagreeing option in the later rounds.
        </p>
        <p>
          Pleasantness follows brightness. Energy follows chroma — how much the color actually varies — with a
          smaller push from warmth. That pattern is from Valdez and Mehrabian, 1994. It is an average tendency,
          not a private fact about you.
        </p>
        <p>{{ strategyText(plan.strategy) }}</p>
        <p>
          The sequence is the iso principle used in music therapy: match the state, then move (Altshuler, 1948;
          Starcke and von Georgi, 2023). For stress, the useful change is often a slower, less aroused line, not
          a cheerful one (de Witte and colleagues, music-and-stress meta-analyses). Nothing here treats a
          condition.
        </p>
        <p>
          Pitches are integer ratios from the base-60 string lengths 60, 54, 48, 45, 40, 36 and 32 — unison,
          10/9, 5/4, 4/3, 3/2, 5/3, 15/8. {{ tuning.name }}: {{ tuning.line }} The seven names are the Mesopotamian
          retuning cycle. It is a reconstruction, not a recovered recording. Overtones are divisors of 60 only, so
          the tone stays harmonic instead of beating.
        </p>
        <p>
          What plays is a tune in 4/4: a short idea, the same idea again, an answer, then a cadence home to the
          tonic. Tempo and how many notes there are follow energy. Pleasantness decides whether the just major
          third is in the chords yet. Those two levers — speed for energy, mode for pleasantness — are what
          tempo and mode experiments find (Husain, Thompson, and Schellenberg, 2002). EEG studies measure the
          same axes, not a hidden frequency: pleasant music shifts frontal asymmetry, and a faster event rate
          rides with arousal (Schmidt and Trainor, 2001). A clear pulse is used because attention locks to
          rhythm, not to a wash (Thaut). This page does not read brainwaves. It does not play binaural beats;
          those effects are small and inconsistent. Harmonic expectation — the ear waiting for the cadence — is
          the part that is actually well studied (Koelsch and colleagues).
        </p>
        <p>
          {{ voice }} leads, with a soft plucked harmony and a bass. All synthesized: sines, breath or bow noise,
          a short hall. No samples, no held drone. If the line lifts, a later phrase may step up by a just fifth,
          3/2. The gold line is that shift. It takes about a minute and a half, then the tune stays in the mood it
          arrived at and keeps varying. Nothing here treats a condition.
        </p>
      </details>
    </main>
  </div>
</template>

<style scoped>
.my {
  --my-bg: #f3eee6;
  --my-fg: #1c1b19;
  --my-muted: #5c564c;
  --my-line: #ddd4c6;
  --my-gold: #a6843d;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--my-bg);
  color: var(--my-fg);
  color-scheme: light;
  font-family: var(--font-ui, Archivo, sans-serif);
  -webkit-tap-highlight-color: transparent;
  padding-bottom: env(safe-area-inset-bottom);
}

.my--dark {
  --my-bg: #0e0e10;
  --my-fg: #ede6d6;
  --my-muted: #a39b90;
  --my-line: #2c2b28;
  --my-gold: #c9a227;
  color-scheme: dark;
}

.my__bar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12rem;
  min-height: 56rem;
  padding: 10rem clamp(14rem, 3vw, 28rem);
  padding-top: max(10rem, env(safe-area-inset-top));
  background: color-mix(in srgb, var(--my-bg) 92%, transparent);
  border-bottom: 1rem solid var(--my-line);
  backdrop-filter: blur(8px);
}

.my__back,
.my__home {
  color: var(--my-fg);
  text-decoration: none;
  font: 600 11rem/1 var(--font-mono, ui-monospace, monospace);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  min-height: 44rem;
  display: inline-flex;
  align-items: center;
}

.my__back { justify-self: start; gap: 6rem; }
.my__back svg {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.my__home { justify-self: center; }

.my__end {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 8rem;
}

.my__titles {
  text-align: right;
  display: grid;
  gap: 2rem;
}

.my__title {
  font: 600 13rem/1.1 var(--font-display, Fraunces, serif);
  letter-spacing: 0.02em;
}

.my__subtitle {
  font: 500 9rem/1 var(--font-mono, ui-monospace, monospace);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--my-muted);
}

.my__theme {
  width: 44rem;
  height: 44rem;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--my-fg);
  cursor: pointer;
}

.my__theme svg {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.my__splash,
.my__stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rem 24rem 32rem;
  text-align: center;
}

.my__splash h1 { margin: 0; }

.my__wordmark {
  display: inline-flex;
  align-items: center;
  gap: 9rem;
  color: var(--my-fg);
}

.my__wordmark--lg {
  flex-direction: column;
  gap: 18rem;
}

.my__word {
  font-family: var(--font-display, Fraunces, serif);
  font-size: 22rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
}

.my__wordmark--lg .my__word {
  font-size: clamp(52rem, 12vw, 84rem);
}

.my__mark { width: 22rem; height: 22rem; }
.my__mark--lg { width: 56rem; height: 56rem; }

.my__stage h1 {
  margin: 0;
  font-family: var(--font-display, Fraunces, serif);
  font-weight: 500;
  letter-spacing: -0.03em;
  font-size: clamp(32rem, 7vw, 44rem);
  line-height: 1.05;
  text-wrap: balance;
}

.my__sub {
  margin: 6rem 0 0;
  color: var(--my-muted);
  font-size: 17rem;
}

.my__swatches {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18rem 22rem;
  max-width: 352rem;
  margin: 36rem 0 0;
}

.my__swatch {
  width: 108rem;
  height: 108rem;
  border: 0;
  border-radius: 999rem;
  cursor: pointer;
  box-shadow: inset 0 0 0 1rem color-mix(in srgb, var(--my-fg) 16%, transparent);
  transition: transform 160ms ease;
}

.my__swatch:hover { transform: scale(1.03); }
.my__swatch:active { transform: scale(0.97); }

.my__dots {
  display: flex;
  gap: 6rem;
  min-height: 7rem;
  margin-top: 32rem;
}

.my__dot {
  width: 6rem;
  height: 6rem;
  border-radius: 999rem;
  background: var(--my-fg);
}

.my__listen { width: min(448rem, 100%); margin: 0 auto; }

.my__listen h1 {
  font-size: clamp(38rem, 8vw, 54rem);
  line-height: 1.02;
}

.my__intent {
  margin: 12rem auto 0;
  max-width: 352rem;
  color: var(--my-muted);
  font-size: 16rem;
}

.my__tentative {
  margin: 10rem 0 0;
  color: var(--my-muted);
  font-size: 14rem;
}

.my__strings {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 14rem;
  height: 72rem;
  margin: 32rem 0 14rem;
}

.my__strings span {
  width: 1rem;
  height: 42%;
  background: var(--my-fg);
  opacity: 0.28;
  transform-origin: bottom center;
}

.my__journey {
  width: 120rem;
  height: 1rem;
  margin: 0 auto;
  background: var(--my-line);
}

.my__journey span {
  display: block;
  height: 100%;
  background: var(--my-gold);
  transform: scaleX(0);
  transform-origin: left center;
}

.my__readout {
  margin: 14rem 0 0;
  color: var(--my-muted);
  font-size: 14rem;
  font-variant-numeric: tabular-nums;
}

.my__meta {
  margin: 3rem 0 0;
  color: var(--my-muted);
  font-size: 13rem;
}

.my__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rem;
  margin-top: 24rem;
}

.my__play {
  width: 52rem;
  height: 52rem;
  display: grid;
  place-items: center;
  border: 1rem solid var(--my-line);
  border-radius: 999rem;
  background: transparent;
  color: var(--my-fg);
  cursor: pointer;
}

.my__play svg { width: 18rem; height: 18rem; fill: currentColor; }

.my__level {
  width: 120rem;
  height: 44rem;
  margin: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;
}

.my__level::-webkit-slider-runnable-track {
  height: 1rem;
  background: var(--my-line);
}

.my__level::-webkit-slider-thumb {
  width: 14rem;
  height: 14rem;
  margin-top: -6rem;
  border: 0;
  border-radius: 999rem;
  background: var(--my-fg);
  appearance: none;
}

.my__level::-moz-range-track {
  height: 1rem;
  background: var(--my-line);
  border: 0;
}

.my__level::-moz-range-thumb {
  width: 14rem;
  height: 14rem;
  border: 0;
  border-radius: 999rem;
  background: var(--my-fg);
}

.my__text {
  margin-top: 22rem;
  border: 0;
  background: transparent;
  color: var(--my-muted);
  font: inherit;
  font-size: 14rem;
  cursor: pointer;
}

.my__text:hover { color: var(--my-fg); }

.my__basis {
  width: min(416rem, 100%);
  margin: 44rem auto 0;
  color: var(--my-muted);
  font-size: 13rem;
  line-height: 1.55;
  text-align: left;
}

.my__basis summary {
  text-align: center;
  color: var(--my-muted);
  list-style: none;
  cursor: pointer;
}

.my__basis summary::-webkit-details-marker { display: none; }
.my__basis p { margin: 14rem 0 0; }

.my__theme:focus-visible,
.my__swatch:focus-visible,
.my__text:focus-visible,
.my__play:focus-visible,
.my__level:focus-visible,
.my__basis summary:focus-visible,
.my__back:focus-visible,
.my__home:focus-visible {
  outline: 2rem solid var(--my-fg);
  outline-offset: 3rem;
}

.my__sr {
  position: absolute;
  width: 1rem;
  height: 1rem;
  padding: 0;
  margin: -1rem;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 640px) {
  .my__swatches {
    max-width: 544rem;
    gap: 24rem 28rem;
  }
  .my__swatch { width: 132rem; height: 132rem; }
}

@media (prefers-reduced-motion: reduce) {
  .my__swatch { transition: none; }
  .my__swatch:hover,
  .my__swatch:active { transform: none; }
}
</style>
