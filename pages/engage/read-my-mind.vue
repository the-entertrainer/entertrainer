<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * THE MIND READER — Engage parlor trick.
 * Visual DNA shared with Stack: cream/ink/yellow, floating chrome, soft CTAs.
 * Game logic (digit-sum force) stays intact.
 */
import { useThemeStore } from '~/stores/theme'

useSeoMeta({
  title: 'The Mind Reader · Engage',
  description: 'Example: 42. Add 4 + 2, subtract to get 36, and note the mark beside it.',
  ogUrl: 'https://entertrainer.in/engage/read-my-mind',
})

type SymbolKind =
  | 'ouroboros'
  | 'eye'
  | 'pentacle'
  | 'mercury'
  | 'ankh'
  | 'triquetra'
  | 'sun'
  | 'crescent'
  | 'solomon'

type GuideStep = 1 | 2 | 3 | 4

type SymbolDef = {
  id: SymbolKind
  label: string
  color: string
  svg: string
}

type GridCard = {
  number: number
  symbol: SymbolDef
}

const LAST_TARGET_KEY = 'entertrainer-mind-last-target'

const SYMBOLS: SymbolDef[] = [
  {
    id: 'ouroboros',
    label: 'ouroboros',
    color: '#B77A00',
    svg: [
      '<circle cx="24" cy="24" r="16.5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      '<path d="M24 7.2c9.4 0 16.8 6.6 16.8 14.8S33.4 36.8 24 36.8 7.2 30.2 7.2 22 14.6 7.2 24 7.2Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
      '<path d="M33.2 11.4c1.8 1.2 3.2 2.8 4.2 4.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
      '<path d="M37.6 16.2c.4 1.6.6 3.2.6 4.8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
      '<ellipse cx="34.8" cy="12.6" rx="3.4" ry="2.6" transform="rotate(35 34.8 12.6)" fill="none" stroke="currentColor" stroke-width="1.8"/>',
      '<circle cx="35.6" cy="11.8" r="1.1" fill="currentColor"/>',
      '<path d="M32.4 14.8 30.8 16.4M31.2 13.2l-2 1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
      '<path d="M10.4 27.6c1.2 2.8 3.4 5.2 6.2 6.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
      '<path d="M14 18.4c1.6-1.2 3.4-1.8 5.4-1.8M29 16.6c1.8.2 3.4.8 4.8 1.8" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".75"/>'
    ].join('')
  },
  {
    id: 'eye',
    label: 'all-seeing eye',
    color: '#6D45B5',
    svg: [
      '<path d="M24 6.5 40 36.5H8Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
      '<path d="M24 11.2 35.6 33.2H12.4Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" opacity=".55"/>',
      '<ellipse cx="24" cy="25.2" rx="9.2" ry="5.4" fill="none" stroke="currentColor" stroke-width="1.7"/>',
      '<circle cx="24" cy="25.2" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      '<circle cx="24" cy="25.2" r="1.35" fill="currentColor"/>',
      '<path d="M24 6.5v4.2M8 36.5h32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
      '<path d="M16.2 25.2h2.2M29.6 25.2h2.2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>'
    ].join('')
  },
  {
    id: 'pentacle',
    label: 'pentacle',
    color: '#D84A27',
    svg: [
      '<circle cx="24" cy="24" r="17.2" fill="none" stroke="currentColor" stroke-width="1.7"/>',
      '<circle cx="24" cy="24" r="14.6" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".55"/>',
      '<path d="M24 9.4 33.8 38.2 8.8 20.4h30.4L14.2 38.2Z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
      '<circle cx="24" cy="24" r="1.2" fill="currentColor"/>'
    ].join('')
  },
  {
    id: 'mercury',
    label: 'mercury',
    color: '#178C78',
    svg: [
      '<circle cx="24" cy="22" r="8.2" fill="none" stroke="currentColor" stroke-width="2"/>',
      '<path d="M24 30.2v9.4M19.2 35.4h9.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      '<path d="M15.2 10.6c2.4-3.2 5.4-4.8 8.8-4.8s6.4 1.6 8.8 4.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
      '<path d="M17.6 13.4c1.8-2.2 3.9-3.3 6.4-3.3s4.6 1.1 6.4 3.3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>',
      '<circle cx="24" cy="22" r="2.1" fill="currentColor"/>'
    ].join('')
  },
  {
    id: 'ankh',
    label: 'ankh',
    color: '#B93465',
    svg: [
      '<path d="M24 18.8c-4.6 0-7.8-3.2-7.8-7.2S19.4 4.4 24 4.4s7.8 3.2 7.8 7.2-3.2 7.2-7.8 7.2Z" fill="none" stroke="currentColor" stroke-width="2"/>',
      '<path d="M24 18.8v24.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
      '<path d="M13.6 27.6h20.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
      '<path d="M24 11.6c-2.2 0-3.8 1.5-3.8 3.4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>',
      '<circle cx="24" cy="11.2" r="1.1" fill="currentColor"/>'
    ].join('')
  },
  {
    id: 'triquetra',
    label: 'triquetra',
    color: '#9B5A2E',
    svg: [
      '<path d="M24 8.2c6.4 0 11.2 4.2 11.2 9.4 0 3.4-1.9 6.4-4.8 8.2 2.9 1.8 4.8 4.8 4.8 8.2 0 5.2-4.8 9.4-11.2 9.4S12.8 39.2 12.8 34c0-3.4 1.9-6.4 4.8-8.2-2.9-1.8-4.8-4.8-4.8-8.2 0-5.2 4.8-9.4 11.2-9.4Z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
      '<path d="M24 17.4c3.6 0 6.2 2.2 6.2 4.9S27.6 27.2 24 27.2s-6.2-2.2-6.2-4.9 2.6-4.9 6.2-4.9Z" fill="none" stroke="currentColor" stroke-width="1.5"/>',
      '<circle cx="24" cy="22.3" r="1.4" fill="currentColor"/>'
    ].join('')
  },
  {
    id: 'sun',
    label: 'radiant sun',
    color: '#B77A00',
    svg: [
      '<circle cx="24" cy="24" r="7.6" fill="none" stroke="currentColor" stroke-width="2"/>',
      '<circle cx="24" cy="24" r="3.4" fill="none" stroke="currentColor" stroke-width="1.35"/>',
      '<circle cx="24" cy="24" r="1.35" fill="currentColor"/>',
      '<path d="M24 4.4v5.2M24 38.4v5.2M4.4 24h5.2M38.4 24h5.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      '<path d="M10 10l3.7 3.7M34.3 34.3 38 38M38 10l-3.7 3.7M13.7 34.3 10 38" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/>',
      '<path d="M24 12.2l.55 1.7h1.8l-1.45 1.05.55 1.7L24 15.55l-1.45 1.1.55-1.7-1.45-1.05h1.8Z" fill="currentColor" opacity=".9"/>'
    ].join('')
  },
  {
    id: 'crescent',
    label: 'crescent',
    color: '#18181A',
    svg: [
      '<path d="M30.8 8.4A16.4 16.4 0 1 0 30.8 39.6 12.6 12.6 0 1 1 30.8 8.4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      '<path d="M28.4 13.2A10.4 10.4 0 1 0 28.4 34.8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>',
      '<circle cx="33.6" cy="16.4" r="1.1" fill="currentColor"/>',
      '<circle cx="36.2" cy="22.8" r=".8" fill="currentColor" opacity=".8"/>',
      '<circle cx="34.4" cy="28.6" r=".95" fill="currentColor" opacity=".7"/>',
      '<path d="M19.2 18.4c1.4-1 3-1.5 4.6-1.5" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".45"/>'
    ].join('')
  },
  {
    id: 'solomon',
    label: 'seal of solomon',
    color: '#178C78',
    svg: [
      '<circle cx="24" cy="24" r="17.4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      '<path d="M24 8.6 36.6 32.4H11.4Z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
      '<path d="M24 39.4 11.4 15.6h25.2Z" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>',
      '<circle cx="24" cy="24" r="3.6" fill="none" stroke="currentColor" stroke-width="1.3"/>',
      '<circle cx="24" cy="24" r="1.15" fill="currentColor"/>'
    ].join('')
  }
]

const theme = useThemeStore()
const phase = ref<'intro' | 'guide'>('intro')
const step = ref<GuideStep>(1)
const revealed = ref(false)
const cards = ref<GridCard[]>([])
const targetSymbol = ref<SymbolDef>(SYMBOLS[0]!)
const roundNumber = ref(0)

const stepMeta: Record<GuideStep, { label: string; title: string }> = {
  1: { label: 'Pick', title: 'Hold a number' },
  2: { label: 'Add', title: 'Add the digits' },
  3: { label: 'Cut', title: 'Subtract the sum' },
  4: { label: 'Find', title: 'Find your mark' },
}

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function readLastTargetId(): SymbolKind | null {
  if (!import.meta.client) return null
  try {
    const value = sessionStorage.getItem(LAST_TARGET_KEY)
    if (!value) return null
    return SYMBOLS.some((symbol) => symbol.id === value) ? (value as SymbolKind) : null
  } catch {
    return null
  }
}

function writeLastTargetId(id: SymbolKind) {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(LAST_TARGET_KEY, id)
  } catch {
    /* ignore quota / private mode */
  }
}

function pickTarget(): SymbolDef {
  const lastId = readLastTargetId()
  const pool = lastId ? SYMBOLS.filter((symbol) => symbol.id !== lastId) : SYMBOLS
  return pool[Math.floor(Math.random() * pool.length)]!
}

function buildRound() {
  const target = pickTarget()
  const decoys = shuffle(SYMBOLS.filter((symbol) => symbol.id !== target.id))
  const numbers = shuffle(Array.from({ length: 100 }, (_, number) => number))
  let decoyIndex = 0

  targetSymbol.value = target
  writeLastTargetId(target.id)
  cards.value = numbers.map((number) => {
    const isGuaranteedResult = number > 0 && number % 9 === 0 && number <= 81
    const symbol = isGuaranteedResult ? target : decoys[decoyIndex++ % decoys.length]!
    return { number, symbol }
  })
  roundNumber.value += 1
  revealed.value = false
}

function startGame() {
  buildRound()
  phase.value = 'guide'
  step.value = 1
}

function nextStep() {
  if (step.value < 4) step.value = (step.value + 1) as GuideStep
}

function previousStep() {
  if (step.value > 1) step.value = (step.value - 1) as GuideStep
}

function playAgain() {
  buildRound()
  step.value = 1
  revealed.value = false
}

function onThemeToggle(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  theme.toggle()
}

onMounted(() => {
  theme.init()
})
</script>

<template>
  <div class="mr" :data-phase="phase" :data-mr-theme="theme.theme">
    <NuxtLink
      to="/engage"
      class="mr__iconbtn mr__back"
      aria-label="Back to Engage"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>

    <button
      type="button"
      class="mr__iconbtn mr__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @click.stop.prevent="onThemeToggle"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <div class="mr__stage">
      <div v-if="phase === 'intro'" class="mr__overlay mr__overlay--title">
        <p class="mr__eyebrow mr__anim" style="--i:0">Engage</p>
        <h1 class="mr__title mr__anim" style="--i:1">Mind<br />Reader</h1>
        <p class="mr__lede mr__anim" style="--i:2">Two digits. Two moves. One mark.</p>
        <button
          class="mr__cta mr__anim mr__cta--pulse"
          style="--i:3"
          type="button"
          @click="startGame"
        >
          Begin
        </button>
      </div>

      <section v-else class="mr__guide">
        <header class="mr__guide-top mr__anim" style="--i:0">
          <div>
            <p class="mr__eyebrow">Round {{ roundNumber }}</p>
            <h1 class="mr__guide-title">{{ stepMeta[step].title }}</h1>
          </div>
          <button class="mr__ghost" type="button" @click="playAgain">Restart</button>
        </header>

        <nav class="mr__steps mr__anim" style="--i:1" aria-label="Steps">
          <button
            v-for="item in ([1, 2, 3, 4] as GuideStep[])"
            :key="item"
            type="button"
            :class="{ active: step === item, complete: step > item }"
            :aria-current="step === item ? 'step' : undefined"
            @click="step = item"
          >
            <span>{{ String(item).padStart(2, '0') }}</span>
            <strong>{{ stepMeta[item].label }}</strong>
          </button>
        </nav>

        <article
          class="mr__card mr__anim"
          style="--i:2"
          :class="{ 'mr__card--board': step === 4 }"
        >
          <div v-if="step === 1" class="mr__panel">
            <div class="mr__badge">01</div>
            <h2>Pick a <em>two-digit</em> number.</h2>
            <p class="mr__copy">10 to 99. Just remember it.</p>
            <p class="mr__example">
              <span>Example</span>
              <strong>42</strong>
              <em>This is the number. Yours can be any other from 10 to 99.</em>
            </p>
            <button class="mr__cta" type="button" @click="nextStep">Got it</button>
          </div>

          <div v-else-if="step === 2" class="mr__panel">
            <div class="mr__badge">02</div>
            <h2>Add those <em>digits</em>.</h2>
            <p class="mr__copy">Hold the sum. That is the first move.</p>
            <p class="mr__example">
              <span>Example</span>
              <strong>4 + 2 = 6</strong>
              <em>First move: add the two digits of 42. Hold 6.</em>
            </p>
            <div class="mr__actions">
              <button class="mr__ghost" type="button" @click="previousStep">Back</button>
              <button class="mr__cta" type="button" @click="nextStep">Sum ready</button>
            </div>
          </div>

          <div v-else-if="step === 3" class="mr__panel">
            <div class="mr__badge">03</div>
            <h2>Subtract that sum from your <em>original</em>.</h2>
            <p class="mr__copy">Keep the result. That is the second move.</p>
            <p class="mr__example">
              <span>Example</span>
              <strong>42 − 6 = 36</strong>
              <em>Second move: take the sum off the number you picked.</em>
            </p>
            <div class="mr__actions">
              <button class="mr__ghost" type="button" @click="previousStep">Back</button>
              <button class="mr__cta" type="button" @click="nextStep">Ready</button>
            </div>
          </div>

          <div v-else class="mr__board">
            <div class="mr__board-head">
              <div class="mr__badge">04</div>
              <div>
                <h2>Find your number. Note the mark.</h2>
                <p class="mr__example mr__example--board">
                  <span>Example</span>
                  <strong>36</strong>
                  <em>Find 36. The symbol beside it is the mark.</em>
                </p>
              </div>
            </div>
            <div class="mr__grid" role="grid" aria-label="Number board">
              <div
                v-for="card in cards"
                :key="`${roundNumber}-${card.number}`"
                class="mr__cell"
                role="gridcell"
                :aria-label="`Number ${card.number}, ${card.symbol.label}`"
              >
                <span>{{ card.number }}</span>
                <svg
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                  :style="{ color: card.symbol.color }"
                  v-html="card.symbol.svg"
                />
              </div>
            </div>
            <div class="mr__actions mr__actions--spread">
              <button class="mr__ghost" type="button" @click="previousStep">Back</button>
              <button class="mr__cta" type="button" @click="revealed = true">Reveal</button>
            </div>

            <div v-if="revealed" class="mr__reveal" role="status" aria-live="polite">
              <p class="mr__reveal-label mr__anim" style="--i:0">Your mark</p>
              <svg
                class="mr__reveal-symbol mr__anim mr__score-pop"
                viewBox="0 0 48 48"
                :style="{ color: targetSymbol.color, '--i': 1 }"
                v-html="targetSymbol.svg"
              />
              <button class="mr__cta mr__anim" style="--i:2" type="button" @click="playAgain">
                Again
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mr {
  --mr-paper: #fbf8ef;
  --mr-ink: #161618;
  --mr-yellow: #ffd43b;
  --ink: var(--mr-ink);
  --accent: var(--mr-yellow);
  position: relative;
  width: 100%;
  min-height: 100svh;
  min-height: 100dvh;
  background: var(--mr-paper);
  color: var(--mr-ink);
  overflow-x: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background 280ms ease, color 280ms ease;
}

.mr[data-mr-theme='dark'] {
  --mr-paper: #121214;
  --mr-ink: #ede6d6;
  --mr-yellow: #e8c547;
}

.mr[data-phase='intro'] {
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
}

.mr__iconbtn {
  position: absolute;
  z-index: 20;
  top: max(10rem, env(safe-area-inset-top));
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--mr-paper) 55%, transparent);
  color: color-mix(in srgb, var(--mr-ink) 70%, transparent);
  text-decoration: none;
  cursor: pointer;
  appearance: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.mr__iconbtn:hover,
.mr__iconbtn:focus-visible {
  color: var(--mr-ink);
  background: color-mix(in srgb, var(--mr-paper) 82%, transparent);
}
.mr__iconbtn:focus-visible {
  outline: 2rem solid var(--mr-yellow);
  outline-offset: 2rem;
}
.mr__iconbtn:active {
  transform: scale(0.94);
}

.mr__back {
  left: max(10rem, env(safe-area-inset-left));
}
.mr__back svg {
  width: 20rem;
  height: 20rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mr__theme {
  right: max(10rem, env(safe-area-inset-right));
}
.mr__theme :deep(svg) {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mr__stage {
  position: relative;
  width: 100%;
  min-height: inherit;
}

.mr__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12rem;
  padding: 28rem 24rem;
  padding-top: max(28rem, env(safe-area-inset-top));
  padding-bottom: max(28rem, env(safe-area-inset-bottom));
  text-align: center;
  background: color-mix(in srgb, var(--mr-paper) 55%, transparent);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  animation: mr-overlay-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.mr__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}

.mr__title {
  margin: 0;
  font: 700 clamp(64rem, 18vw, 112rem)/0.82 var(--font-display);
  letter-spacing: -0.07em;
  text-transform: uppercase;
}

.mr__lede,
.mr__copy {
  margin: 0 0 6rem;
  font-size: 15rem;
  line-height: 1.4;
  max-width: 28ch;
  letter-spacing: 0.01em;
  opacity: 0.82;
}

.mr__cta {
  appearance: none;
  border: none;
  background: var(--mr-yellow);
  color: #161618;
  font: 800 15rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 18rem 36rem;
  border-radius: 999px;
  cursor: pointer;
  box-shadow:
    0 1rem 0 color-mix(in srgb, #161618 12%, transparent),
    0 8rem 20rem color-mix(in srgb, var(--mr-ink) 10%, transparent);
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.mr__cta:hover,
.mr__cta:focus-visible {
  transform: translateY(-1rem);
}
.mr__cta:focus-visible {
  outline: 2rem solid var(--mr-ink);
  outline-offset: 3rem;
}
.mr__cta:active {
  transform: translateY(2rem) scale(0.98);
  box-shadow:
    0 0 0 transparent,
    0 2rem 8rem color-mix(in srgb, var(--mr-ink) 8%, transparent);
}

.mr__ghost {
  appearance: none;
  border: none;
  background: color-mix(in srgb, var(--mr-paper) 70%, transparent);
  color: color-mix(in srgb, var(--mr-ink) 72%, transparent);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 12rem 18rem;
  border-radius: 999px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.mr__ghost:hover,
.mr__ghost:focus-visible {
  color: var(--mr-ink);
  background: color-mix(in srgb, var(--mr-paper) 90%, transparent);
}
.mr__ghost:focus-visible {
  outline: 2rem solid var(--mr-yellow);
  outline-offset: 2rem;
}
.mr__ghost:active {
  transform: scale(0.96);
}

.mr__anim {
  animation: mr-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.mr__score-pop {
  animation:
    mr-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    mr-score-pop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.mr__cta--pulse {
  animation:
    mr-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    mr-cta-pulse 2.6s ease-in-out 650ms infinite;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms), 650ms;
}

/* —— Guide flow —— */
.mr__guide {
  width: min(100%, 920rem);
  margin: 0 auto;
  padding:
    max(64rem, calc(env(safe-area-inset-top) + 56rem))
    clamp(16rem, 3vw, 28rem)
    max(40rem, env(safe-area-inset-bottom));
}

.mr__guide-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rem;
  margin-bottom: 20rem;
}

.mr__guide-title {
  margin: 6rem 0 0;
  font: 700 clamp(36rem, 8vw, 64rem)/0.88 var(--font-display);
  letter-spacing: -0.06em;
  text-transform: uppercase;
}

.mr__steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6rem;
  margin-bottom: 18rem;
}
.mr__steps button {
  display: flex;
  align-items: center;
  gap: 8rem;
  padding: 10rem 12rem;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--mr-ink) 4%, transparent);
  color: color-mix(in srgb, var(--mr-ink) 50%, transparent);
  cursor: pointer;
  text-align: left;
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.mr__steps button:hover,
.mr__steps button:focus-visible {
  color: var(--mr-ink);
  background: color-mix(in srgb, var(--mr-ink) 8%, transparent);
}
.mr__steps button:focus-visible {
  outline: 2rem solid var(--mr-yellow);
  outline-offset: 2rem;
}
.mr__steps button.active {
  color: #161618;
  background: var(--mr-yellow);
}
.mr__steps button.complete:not(.active) {
  color: color-mix(in srgb, var(--mr-ink) 78%, transparent);
}
.mr__steps button:active {
  transform: scale(0.97);
}
.mr__steps span {
  display: grid;
  place-items: center;
  width: 22rem;
  height: 22rem;
  border-radius: 50%;
  background: color-mix(in srgb, currentColor 14%, transparent);
  font: 800 9rem/1 var(--font-mono);
}
.mr__steps button.active span {
  background: color-mix(in srgb, #161618 12%, transparent);
}
.mr__steps strong {
  font: 800 10rem/1 var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mr__card {
  position: relative;
  min-height: 380rem;
  padding: clamp(22rem, 4vw, 40rem);
  background: color-mix(in srgb, var(--mr-paper) 88%, var(--mr-ink));
  border-radius: 24rem;
  box-shadow:
    0 1rem 0 color-mix(in srgb, var(--mr-ink) 6%, transparent),
    0 12rem 32rem color-mix(in srgb, var(--mr-ink) 8%, transparent);
  overflow: hidden;
}
.mr[data-mr-theme='dark'] .mr__card {
  background: color-mix(in srgb, var(--mr-paper) 92%, #fff);
}
.mr__card--board {
  min-height: 0;
  padding: clamp(16rem, 3vw, 24rem);
}

.mr__panel {
  display: grid;
  gap: 18rem;
  max-width: 520rem;
  align-content: center;
  min-height: 280rem;
}
.mr__panel h2,
.mr__board-head h2 {
  margin: 0;
  font: 700 clamp(28rem, 5.5vw, 44rem)/0.92 var(--font-display);
  letter-spacing: -0.05em;
  text-transform: uppercase;
}
.mr__panel h2 em,
.mr__board-head h2 em {
  font-style: normal;
  color: color-mix(in srgb, var(--mr-ink) 55%, var(--mr-yellow));
  background: linear-gradient(
    180deg,
    transparent 62%,
    color-mix(in srgb, var(--mr-yellow) 55%, transparent) 62%
  );
}

.mr__badge {
  display: grid;
  place-items: center;
  width: 40rem;
  height: 40rem;
  border-radius: 999px;
  background: var(--mr-ink);
  color: var(--mr-yellow);
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.06em;
}

.mr__actions {
  display: flex;
  align-items: center;
  gap: 12rem;
  flex-wrap: wrap;
  margin-top: 4rem;
}
.mr__actions--spread {
  justify-content: space-between;
  margin-top: 16rem;
}


.mr__example {
  display: grid;
  gap: 6rem;
  margin: 0;
  max-width: 36ch;
  padding: 14rem 16rem;
  border-radius: 16rem;
  background: var(--mr-yellow);
  color: #161618;
}
.mr__example span {
  font: 800 10rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.mr__example strong {
  font: 700 clamp(28rem, 5vw, 40rem)/0.95 var(--font-display);
  letter-spacing: -0.04em;
}
.mr__example em {
  font: 500 14rem/1.35 var(--font-reading, inherit);
  font-style: normal;
}
.mr__example--board {
  margin-top: 8rem;
  max-width: none;
}
.mr[data-mr-theme='dark'] .mr__example {
  color: #161618;
}

.mr__board-head {
  display: flex;
  align-items: flex-start;
  gap: 14rem;
  margin-bottom: 14rem;
}

.mr__grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 3rem;
  padding: 8rem 0;
}
.mr__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  min-height: 48rem;
  border-radius: 6rem;
  background: color-mix(in srgb, var(--mr-paper) 70%, transparent);
  font: 800 10rem/1 var(--font-mono);
  color: color-mix(in srgb, var(--mr-ink) 55%, transparent);
}
.mr__cell svg {
  width: 18rem;
  height: 18rem;
}

.mr__reveal {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 20rem;
  padding: 28rem 24rem;
  background: color-mix(in srgb, var(--mr-paper) 72%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: mr-overlay-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.mr__reveal-label {
  margin: 0;
  font: 800 10rem/1 var(--font-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 6rem 10rem;
  border-radius: 999px;
  background: var(--mr-ink);
  color: var(--mr-yellow);
}
.mr__reveal-symbol {
  width: min(160rem, 42vw);
  height: min(160rem, 42vw);
  filter: drop-shadow(0 8rem 18rem color-mix(in srgb, var(--mr-ink) 14%, transparent));
}

@keyframes mr-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes mr-rise {
  from { opacity: 0; transform: translateY(12rem); }
  to { opacity: 1; transform: none; }
}
@keyframes mr-score-pop {
  0% { transform: scale(0.88); }
  55% { transform: scale(1.03); }
  100% { transform: scale(1); }
}
@keyframes mr-cta-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}

@media (max-width: 720px) {
  .mr__steps strong { display: none; }
  .mr__steps button { justify-content: center; padding: 10rem; }
  .mr__board-head { flex-direction: column; align-items: flex-start; gap: 10rem; }
  .mr__grid { gap: 2rem; }
  .mr__cell { min-height: 38rem; }
  .mr__cell svg { width: 14rem; height: 14rem; }
  .mr__guide-top { align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .mr__overlay,
  .mr__anim,
  .mr__score-pop,
  .mr__cta--pulse,
  .mr__reveal {
    animation: none !important;
    transition: none !important;
  }
  .mr__anim,
  .mr__score-pop,
  .mr__cta--pulse {
    opacity: 1;
    transform: none;
  }
  .mr,
  .mr__iconbtn,
  .mr__cta,
  .mr__ghost,
  .mr__steps button {
    transition: none;
  }
  .mr__reveal-symbol { filter: none; }
}
</style>
