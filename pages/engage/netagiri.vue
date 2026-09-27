<script setup lang="ts">
definePageMeta({ layout: false })

import { GAUGES, chairOf, type Gauge } from '~/utils/netagiri/cards'
import { createNetagiri, clampYear, leaderName, speak, type Netagiri, type Snapshot } from '~/utils/netagiri/game'
import { lookOf } from '~/utils/netagiri/stage'
import { createScore, type Score } from '~/utils/netagiri/score'
import { useThemeStore } from '~/stores/theme'

useSeoMeta({
  title: 'Netagiri · Engage',
  description: 'You are Prime Minister of India. Two orders. Four bars. Either end ends you.',
  ogUrl: 'https://entertrainer.in/engage/netagiri'
})

const BEST_KEY = 'entertrainer-netagiri-best'
const MUTE_KEY = 'entertrainer-netagiri-mute'
const NAME_KEY = 'entertrainer-netagiri-name'
const PARTY_KEY = 'entertrainer-netagiri-party'
const RUNS_KEY = 'entertrainer-netagiri-runs'
const theme = useThemeStore()
const name = ref('')
const party = ref('the Front')
const year = ref(2026)
const partyChips = ['the Front', 'Ribbon Front', 'National Chair', 'People\'s List', 'Clean Ticket']
const pastRuns = ref<{ name: string; party: string; years: number; year: number }[]>([])
const best = ref(0)
const muted = ref(false)
const snap = ref<Snapshot | null>(null)
const drag = ref(0)
const flying = ref<'left' | 'right' | ''>('')
const reduced = ref(false)
const arriving = ref(false)
const hover = ref<'left' | 'right' | ''>('')
const leanX = ref(0)
const leanY = ref(0)

let game: Netagiri | null = null
let startX = 0
let dragging = false
let score: Score | null = null

const phase = computed(() => snap.value?.phase ?? 'title')
const card = computed(() => snap.value?.card ?? null)
const chair = computed(() => (snap.value ? chairOf(new Set(snap.value.flags)) : 'Prime Minister'))
const displayYear = computed(() => {
  const n = Number(year.value)
  return Number.isFinite(n) ? Math.round(n) : '—'
})
const yearChips = [2026, 2038, 2100, 9999]
const shownName = computed(() => leaderName(name.value))
const look = computed(() => card.value ? lookOf(card.value) : null)
const line = computed(() => {
  if (!card.value || !snap.value) return ''
  return speak(card.value.text, snap.value.name, snap.value.party)
})
const leftLine = computed(() => {
  if (!card.value || !snap.value) return ''
  return speak(card.value.left.text, snap.value.name, snap.value.party)
})
const rightLine = computed(() => {
  if (!card.value || !snap.value) return ''
  return speak(card.value.right.text, snap.value.name, snap.value.party)
})
const stageStyle = computed(() => ({
  '--px': leanX.value.toFixed(3),
  '--py': leanY.value.toFixed(3)
}))
const eraLine = computed(() => {
  const n = Number(year.value)
  if (!Number.isFinite(n) || n < 2026 || n > 9999) return 'The chair only opens from 2026 to 9999.'
  if (n > 2040) return 'Same jokes. Domes, holograms, and a ribbon.'
  if (n >= 2036) return 'A few years of now. Then the year flips.'
  return 'Onions, ribbons, and a hundred days.'
})

function refresh() {
  snap.value = game?.snapshot() ?? null
  arriving.value = true
}

function toggleMute() {
  muted.value = !muted.value
  score?.setMuted(muted.value)
  try { localStorage.setItem(MUTE_KEY, muted.value ? '1' : '0') } catch { /* private mode */ }
}

function begin() {
  score = score ?? createScore()
  score.setMuted(muted.value)
  score.start(clampYear(Number(year.value)), Math.random())
  game = createNetagiri()
  game.start(name.value, Number(year.value), party.value)
  flying.value = ''
  drag.value = 0
  try {
    localStorage.setItem(NAME_KEY, name.value)
    localStorage.setItem(PARTY_KEY, party.value)
  } catch { /* private mode */ }
  refresh()
}

function onName(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  name.value = raw.replace(/[^A-Za-z]/g, '').slice(0, 16)
}

function initials(label: string) {
  return label.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 3).toUpperCase()
}

function rememberBest() {
  const years = snap.value?.end?.years ?? 0
  if (years > best.value) {
    best.value = years
    try { localStorage.setItem(BEST_KEY, String(years)) } catch { /* private mode */ }
  }
  if (snap.value?.phase === 'end' && snap.value.end) {
    score?.soften()
    const row = {
      name: snap.value.end.name,
      party: snap.value.end.party,
      years,
      year: snap.value.end.calendar
    }
    pastRuns.value = [row, ...pastRuns.value.filter((r) => r.name !== row.name || r.year !== row.year)].slice(0, 6)
    try { localStorage.setItem(RUNS_KEY, JSON.stringify(pastRuns.value)) } catch { /* private mode */ }
  }
}

function pick(hand: 'left' | 'right') {
  if (phase.value !== 'play' || flying.value) return
  try { navigator.vibrate?.(12) } catch { /* no actuator */ }
  if (reduced.value) {
    game?.choose(hand)
    refresh()
    rememberBest()
    return
  }
  flying.value = hand
  window.setTimeout(() => {
    game?.choose(hand)
    flying.value = ''
    drag.value = 0
    refresh()
    rememberBest()
  }, 240)
}
const aim = computed<'left' | 'right' | ''>(() => {
  if (flying.value) return flying.value
  if (drag.value > 16) return 'right'
  if (drag.value < -16) return 'left'
  return hover.value
})

function marked(key: Gauge) {
  const hand = aim.value
  const current = card.value
  if (!hand || !current) return false
  const side = current[hand]
  return !!side.d?.[key]
}

function onDown(event: PointerEvent) {
  if (phase.value !== 'play' || flying.value) return
  arriving.value = false
  dragging = true
  startX = event.clientX
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onMove(event: PointerEvent) {
  if (!dragging) return
  drag.value = event.clientX - startX
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
  leanX.value = ((event.clientX - box.left) / box.width - 0.5) * 2
  leanY.value = ((event.clientY - box.top) / box.height - 0.5) * 2
}

function onUp() {
  if (!dragging) return
  dragging = false
  if (drag.value > 72) pick('right')
  else if (drag.value < -72) pick('left')
  else drag.value = 0
}

function danger(n: number) {
  return n <= 18 || n >= 82
}

onMounted(() => {
  try { best.value = Number(localStorage.getItem(BEST_KEY) || 0) || 0 } catch { best.value = 0 }
  try { muted.value = localStorage.getItem(MUTE_KEY) === '1' } catch { muted.value = false }
  try { name.value = localStorage.getItem(NAME_KEY) || '' } catch { /* empty */ }
  try { party.value = localStorage.getItem(PARTY_KEY) || 'the Front' } catch { /* empty */ }
  try { pastRuns.value = JSON.parse(localStorage.getItem(RUNS_KEY) || '[]') } catch { pastRuns.value = [] }
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onBeforeUnmount(() => score?.stop())
</script>

<template>
  <div class="ng" :data-ng-theme="theme.theme">
    <NuxtLink to="/engage" class="ng__icon ng__back" aria-label="Back to Engage" @pointerdown.stop>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>
    <button
      type="button"
      class="ng__icon ng__mute"
      :aria-label="muted ? 'Unmute the reel' : 'Mute the reel'"
      @pointerdown.stop.prevent="toggleMute"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10v4h3l4 3V7L7 10H4z" />
        <path v-if="!muted" d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" />
        <path v-else d="M16 10l5 5M21 10l-5 5" />
      </svg>
    </button>
    <button
      type="button"
      class="ng__icon ng__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @pointerdown.stop.prevent="theme.toggle()"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <header v-if="phase !== 'title'" class="ng__meters" aria-label="Four bars. Empty or full, the run ends.">
      <div v-for="g in GAUGES" :key="g.key" class="ng__meter" :class="{ 'is-hot': snap && danger(snap.gauges[g.key]) }">
        <span class="ng__meter-name">{{ g.label }}</span>
        <span class="ng__track-wrap">
          <i class="ng__pip" :class="{ on: marked(g.key) }" />
          <span class="ng__track"><span class="ng__fill" :style="{ width: `${snap?.gauges[g.key] ?? 50}%` }" /></span>
        </span>
      </div>
      <p v-if="phase === 'play'" class="ng__when">
        <span>{{ snap?.calendar }}</span>
        <span>{{ chair }}</span>
        <span>Year {{ (snap?.years ?? 0) + 1 }}</span>
      </p>
    </header>

    <section v-if="phase === 'title'" class="ng__title">
      <p class="ng__eyebrow">Engage</p>
      <div class="ng__lockup" aria-hidden="true">
        <svg class="ng__mark" viewBox="0 0 48 48" width="48" height="48">
          <rect x="8" y="18" width="32" height="6" rx="1" fill="currentColor" />
          <rect x="21" y="10" width="6" height="28" fill="currentColor" />
          <path d="M10 38h28" stroke="currentColor" stroke-width="2" />
          <path d="M18 14l12 20" stroke="currentColor" stroke-width="1.5" opacity="0.55" />
        </svg>
        <h1 class="ng__word"><span>Neta</span>giri</h1>
      </div>
      <p class="ng__lede">You take the chair in {{ displayYear }} as {{ shownName }} of {{ party || 'the Front' }}.</p>
      <label class="ng__name">
        <span>Year you take the chair</span>
        <input
          v-model.number="year"
          type="number"
          inputmode="numeric"
          min="2026"
          max="9999"
          step="1"
          @change="year = clampYear(Number(year))"
        />
      </label>
      <div class="ng__chips" role="group" aria-label="Start years">
        <button
          v-for="y in yearChips"
          :key="y"
          type="button"
          class="ng__chip"
          :class="{ 'is-on': Number(year) === y }"
          @click="year = y"
        >{{ y }}</button>
      </div>
      <p class="ng__era">{{ eraLine }}</p>
      <label class="ng__name">
        <span>One-word name. Ji is added for you.</span>
        <input
          :value="name"
          maxlength="16"
          autocomplete="nickname"
          placeholder="Ramesh"
          @input="onName"
        />
      </label>
      <p class="ng__preview">On the card: <strong>{{ shownName }}</strong></p>
      <label class="ng__name">
        <span>Party</span>
        <input v-model="party" maxlength="28" placeholder="the Front" />
      </label>
      <div class="ng__chips" role="group" aria-label="Party names">
        <button
          v-for="p in partyChips"
          :key="p"
          type="button"
          class="ng__chip"
          :class="{ 'is-on': party === p }"
          @click="party = p"
        >{{ p }}</button>
      </div>
      <p class="ng__fine">Neither order is free. Empty or full, you are out. One song a term, at the speed it was written.</p>
      <button class="ng__cta" type="button" @click="begin">Take the chair</button>
      <p v-if="best" class="ng__best">Best · {{ best }} years</p>
      <ol v-if="pastRuns.length" class="ng__runs">
        <li v-for="(run, i) in pastRuns" :key="i">{{ run.name }} · {{ run.party }} · {{ run.years }} yrs · {{ run.year }}</li>
      </ol>
    </section>

    <section v-else-if="phase === 'end' && snap?.end" class="ng__end">
      <p class="ng__eyebrow">{{ snap.end.chair }} · {{ snap.end.years }} years</p>
      <h1>{{ snap.end.headline }}</h1>
      <p class="ng__epitaph">{{ snap.end.epitaph }}</p>
      <p class="ng__lede">{{ snap.end.name }} of {{ snap.end.party }} left the chair in {{ snap.end.calendar }}.</p>
      <button class="ng__cta" type="button" @click="begin">Again</button>
      <p class="ng__best">Best · {{ best }} years</p>
    </section>

    <section v-else-if="card" class="ng__play">
      <p v-if="snap?.turn === 0" class="ng__hint">Drag the card. A dot marks which bar is in play. It will not tell you which way.</p>
      <article
        :key="card.id"
        class="ng__card"
        :class="{
          'is-in': arriving && !flying && drag === 0,
          'is-fly-left': flying === 'left',
          'is-fly-right': flying === 'right'
        }"
        :style="flying || arriving ? undefined : { transform: `translateX(${drag}px) rotate(${drag / 28}deg)` }"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      >
        <div class="ng__stage" :data-scene="look?.scene" :data-mood="look?.mood" :style="stageStyle">
          <i class="ng__sky" />
          <i class="ng__mid" />
          <i class="ng__near" />
          <div class="ng__bob">
            <img class="ng__actor" :src="look?.src" :alt="card.speaker" />
            <span class="ng__stamp">{{ initials(snap?.party || 'the Front') }}</span>
          </div>
        </div>
        <div class="ng__body">
          <p class="ng__who"><strong>{{ card.speaker }}</strong> <span>{{ card.role }}</span></p>
          <p class="ng__say">{{ line }}</p>
        </div>
      </article>
      <div class="ng__hands">
        <button
          type="button"
          class="ng__hand"
          :class="{ 'is-lean': aim === 'left' }"
          :aria-label="leftLine"
          @mouseenter="hover = 'left'"
          @mouseleave="hover = hover === 'left' ? '' : hover"
          @focus="hover = 'left'"
          @blur="hover = ''"
          @click="pick('left')"
        >
          <span>{{ leftLine }}</span>
        </button>
        <button
          type="button"
          class="ng__hand"
          :class="{ 'is-lean': aim === 'right' }"
          :aria-label="rightLine"
          @mouseenter="hover = 'right'"
          @mouseleave="hover = hover === 'right' ? '' : hover"
          @focus="hover = 'right'"
          @blur="hover = ''"
          @click="pick('right')"
        >
          <span>{{ rightLine }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ng {
  --ng-paper: #fbf8ef;
  --ng-ink: #161618;
  --ng-yellow: #ffd43b;
  --ng-card: #f7f1e4;
  min-height: 100svh;
  min-height: 100dvh;
  background: var(--ng-paper);
  color: var(--ng-ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: max(18rem, env(safe-area-inset-top)) 16rem max(20rem, env(safe-area-inset-bottom));
  touch-action: manipulation;
  user-select: none;
}
.ng[data-ng-theme='dark'] {
  --ng-paper: #121214;
  --ng-ink: #ede6d6;
  --ng-yellow: #e8c547;
}
.ng__icon {
  position: absolute;
  z-index: 3;
  top: max(10rem, env(safe-area-inset-top));
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ng-paper) 70%, transparent);
  color: var(--ng-ink);
  text-decoration: none;
}
.ng__back { left: max(10rem, env(safe-area-inset-left)); }
.ng__back svg { width: 20rem; height: 20rem; fill: none; stroke: currentColor; stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round; }
.ng__theme { right: max(10rem, env(safe-area-inset-right)); }
.ng__mute { right: max(58rem, calc(env(safe-area-inset-right) + 48rem)); }
.ng__mute svg { width: 18rem; height: 18rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.ng__theme :deep(svg) { width: 18rem; height: 18rem; fill: none; stroke: currentColor; stroke-width: 1.75; }
.ng__meters { width: min(440rem, 100%); margin-top: 42rem; }
.ng__meter { display: grid; grid-template-columns: 84rem 1fr; gap: 8rem; align-items: end; margin-bottom: 6rem; }
.ng__meter-name { font: 700 11rem/1 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; padding-bottom: 2rem; }
.ng__track-wrap { display: grid; gap: 3rem; }
.ng__pip {
  width: 8rem;
  height: 8rem;
  border-radius: 99px;
  background: var(--ng-yellow);
  opacity: 0;
  transform: scale(0.4);
  transition: opacity 140ms ease, transform 140ms ease;
}
.ng__pip.on { opacity: 1; transform: none; }
.ng__track { height: 8rem; border-radius: 99px; background: color-mix(in srgb, var(--ng-ink) 16%, transparent); overflow: hidden; }
.ng__fill {
  display: block;
  height: 100%;
  background: var(--ng-ink);
  transition: width 460ms cubic-bezier(0.2, 0, 0, 1), background-color 180ms ease;
}
.ng__meter.is-hot .ng__fill { background: var(--ng-yellow); }
.ng__meter.is-hot .ng__meter-name { color: var(--ng-yellow); }
.ng__meter.is-hot .ng__track { animation: ng-hot 1.1s ease-in-out infinite; }
.ng__when {
  display: flex;
  justify-content: space-between;
  margin: 8rem 0 0;
  font: 600 12rem/1.3 var(--font-mono);
  letter-spacing: 0.04em;
  opacity: 0.75;
}
.ng__title, .ng__end {
  margin: auto;
  width: min(440rem, 100%);
  text-align: center;
  display: grid;
  justify-items: center;
  gap: 12rem;
  animation: ng-rise 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.ng__title > * { animation: ng-rise 380ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ng__title > *:nth-child(2) { animation-delay: 40ms; }
.ng__title > *:nth-child(3) { animation-delay: 70ms; }
.ng__title > *:nth-child(4) { animation-delay: 100ms; }
.ng__title > *:nth-child(n + 5) { animation-delay: 130ms; }
.ng__eyebrow { margin: 0; font: 800 11rem/1 var(--font-mono); letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.7; }
.ng h1 { margin: 0; font: 700 clamp(56rem, 14vw, 84rem)/0.9 var(--font-display); letter-spacing: -0.05em; }
.ng__lede, .ng__epitaph { margin: 0; max-width: 34ch; font-size: 16rem; line-height: 1.45; }
.ng__epitaph { font-size: 18rem; }
.ng__name { display: grid; gap: 6rem; width: min(260rem, 100%); text-align: left; font: 700 11rem/1 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; }
.ng__name input {
  font: 500 16rem/1.3 var(--font-display);
  letter-spacing: 0;
  text-transform: none;
  padding: 10rem 12rem;
  border-radius: 12rem;
  border: 1px solid color-mix(in srgb, var(--ng-ink) 30%, transparent);
  background: transparent;
  color: inherit;
}
.ng__chips { display: flex; flex-wrap: wrap; gap: 6rem; justify-content: center; }
.ng__chip {
  appearance: none;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--ng-ink) 30%, transparent);
  background: transparent;
  color: inherit;
  font: 700 12rem/1 var(--font-mono);
  padding: 8rem 12rem;
  cursor: pointer;
  transition: transform 120ms cubic-bezier(0.2, 0, 0, 1), background-color 160ms ease, color 160ms ease;
}
.ng__chip:active { transform: scale(0.96); }
.ng__chip.is-on { background: var(--ng-ink); color: var(--ng-paper); }
.ng__era, .ng__fine { margin: 0; max-width: 36ch; font-size: 14rem; line-height: 1.4; opacity: 0.8; }
.ng__cta {
  appearance: none;
  border: none;
  background: var(--ng-yellow);
  color: #161618;
  font: 800 14rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 16rem 28rem;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 140ms cubic-bezier(0.2, 0, 0, 1);
}
.ng__cta:active { transform: scale(0.96); }
.ng__best { margin: 0; font: 700 12rem/1 var(--font-mono); opacity: 0.7; }
.ng__play { width: min(440rem, 100%); margin-top: 12rem; }
.ng__hint { margin: 0 0 8rem; font-size: 13rem; line-height: 1.4; opacity: 0.75; }
.ng__card {
  background: var(--ng-card);
  color: #161618;
  border-radius: 18rem;
  overflow: hidden;
  box-shadow: 0 16rem 40rem color-mix(in srgb, #000 18%, transparent);
  touch-action: none;
  cursor: grab;
}
.ng__card.is-in { animation: ng-in 340ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ng__card.is-fly-left { transform: translateX(-118%) rotate(-7deg); transition: transform 240ms cubic-bezier(0.4, 0, 1, 1); }
.ng__card.is-fly-right { transform: translateX(118%) rotate(7deg); transition: transform 240ms cubic-bezier(0.4, 0, 1, 1); }
.ng__face { display: block; width: 100%; aspect-ratio: 3 / 2.1; object-fit: cover; object-position: center 18%; background: #f7f1e4; }
.ng__lockup { display: flex; align-items: center; gap: 12rem; }
.ng__mark { width: 42rem; height: 42rem; color: var(--ng-ink); flex: none; }
.ng__word { font: 800 36rem/1 var(--font-serif, Georgia, serif); letter-spacing: -0.03em; margin: 0; }
.ng__word span { font-weight: 500; }
.ng__preview { margin: 0; font: 400 13rem/1.4 var(--font-sans); opacity: 0.72; }
.ng__runs { margin: 8rem 0 0; padding: 0; list-style: none; font: 400 12rem/1.5 var(--font-mono); opacity: 0.7; }
.ng__stage {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2.1;
  overflow: hidden;
  background: #d9c7a4;
}
.ng__sky, .ng__mid, .ng__near {
  position: absolute; inset: -8%;
  pointer-events: none;
}
.ng__sky {
  background: linear-gradient(180deg, #f3e6c8, #c9b48a);
  transform: translate3d(calc(var(--px, 0) * -6px), calc(var(--py, 0) * -4px), 0);
}
.ng__mid {
  background:
    repeating-linear-gradient(90deg, transparent 0 18px, color-mix(in srgb, var(--ng-ink) 10%, transparent) 18px 20px),
    linear-gradient(180deg, transparent 40%, color-mix(in srgb, #6b3b2a 28%, transparent));
  transform: translate3d(calc(var(--px, 0) * -12px), calc(var(--py, 0) * -6px), 0);
}
.ng__near {
  background: radial-gradient(120% 80% at 50% 120%, color-mix(in srgb, #1c1917 35%, transparent), transparent 55%);
  transform: translate3d(calc(var(--px, 0) * -18px), calc(var(--py, 0) * -8px), 0);
}
.ng__stage[data-scene='studio'] .ng__sky { background: linear-gradient(180deg, #2a2a2e, #121214); }
.ng__stage[data-scene='court'] .ng__sky { background: linear-gradient(180deg, #e8e0d2, #b7a48a); }
.ng__stage[data-scene='dome'] .ng__sky { background: linear-gradient(180deg, #8fb7c9, #2c4a5a); }
.ng__stage[data-scene='ashram'] .ng__sky { background: linear-gradient(180deg, #f0d9a0, #c9893a); }
.ng__stage[data-scene='street'] .ng__sky { background: linear-gradient(180deg, #c9d6c0, #7a8a6a); }
.ng__stage[data-scene='rally'] .ng__sky { background: linear-gradient(180deg, #f2c36b, #c45a2a); }
.ng__bob { position: absolute; inset: 0; display: grid; place-items: end center; animation: ng-bob 3.6s ease-in-out infinite; }
.ng__actor { width: 72%; max-height: 100%; object-fit: cover; object-position: center top; filter: drop-shadow(0 8px 18px rgba(0,0,0,.28)); }
.ng__stage[data-mood='heat'] .ng__actor { filter: contrast(1.12) saturate(1.15) drop-shadow(0 8px 18px rgba(80,0,0,.35)); }
.ng__stamp {
  position: absolute; right: 10rem; bottom: 10rem;
  font: 700 11rem/1 var(--font-mono); letter-spacing: 0.12em;
  background: color-mix(in srgb, var(--ng-paper, #f4efe6) 86%, transparent);
  padding: 4rem 6rem; border-radius: 3px;
}
@keyframes ng-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.ng__body { padding: 14rem 16rem 16rem; }
.ng__who { margin: 0 0 8rem; display: flex; flex-wrap: wrap; gap: 6rem 10rem; align-items: baseline; }
.ng__who strong { font: 600 18rem/1.2 var(--font-display); }
.ng__who span { font: 600 12rem/1 var(--font-mono); letter-spacing: 0.04em; opacity: 0.65; }
.ng__say { margin: 0; font-size: 15.5rem; line-height: 1.45; }
.ng__hands { display: grid; grid-template-columns: 1fr 1fr; gap: 8rem; margin-top: 10rem; }
.ng__hand {
  appearance: none;
  text-align: left;
  border-radius: 14rem;
  border: 1px solid color-mix(in srgb, var(--ng-ink) 28%, transparent);
  background: color-mix(in srgb, var(--ng-paper) 80%, transparent);
  color: inherit;
  padding: 12rem;
  cursor: pointer;
  font: 600 14rem/1.35 var(--font-display);
  transition: transform 140ms cubic-bezier(0.2, 0, 0, 1), border-color 140ms ease, background-color 140ms ease;
}
.ng__hand:active { transform: scale(0.97); }
.ng__hand.is-lean {
  transform: translateY(-3px);
  border-color: var(--ng-yellow);
  background: color-mix(in srgb, var(--ng-yellow) 22%, transparent);
}
.ng__icon:focus-visible, .ng__cta:focus-visible, .ng__hand:focus-visible { outline: 2px solid var(--ng-yellow); outline-offset: 3px; }
@keyframes ng-in {
  from { opacity: 0; transform: translateY(22px) rotate(1.2deg) scale(0.98); }
  to { opacity: 1; transform: none; }
}
@keyframes ng-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
@keyframes ng-hot {
  0%, 100% { transform: none; }
  50% { transform: scaleY(1.35); }
}
@media (max-width: 380px) {
  .ng__hand { font-size: 13rem; padding: 10rem; }
  .ng__meter { grid-template-columns: 76rem 1fr; }
  .ng__say { font-size: 15rem; }
}
@media (max-height: 740px) {
  .ng__face { aspect-ratio: 16 / 9; }
  .ng h1 { font-size: clamp(44rem, 12vw, 68rem); }
  .ng__title, .ng__end { gap: 8rem; }
}
@media (prefers-reduced-motion: reduce) {
  .ng__card.is-fly-left, .ng__card.is-fly-right, .ng__card.is-in, .ng__title, .ng__title > *, .ng__end, .ng__meter.is-hot .ng__track { animation: none; transition: none; }
  .ng__fill, .ng__hand, .ng__cta, .ng__chip { transition: none; }
}
</style>
