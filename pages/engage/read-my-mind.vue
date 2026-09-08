<script setup lang="ts">
useSeoMeta({
  title: 'The Mind Reader · Engage',
  description: 'Pick a two-digit number. Add the digits. Subtract that sum. Find your mark.',
  ogUrl: 'https://entertrainer.in/engage/read-my-mind'
})

type SymbolKind = 'orbit' | 'prism' | 'arc' | 'node' | 'halo' | 'bracket' | 'spark' | 'wave' | 'hex'
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

const SYMBOLS: SymbolDef[] = [
  { id: 'orbit', label: 'orbit', color: '#B77A00', svg: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="7" r="2.2" fill="currentColor"/>' },
  { id: 'prism', label: 'prism', color: '#D84A27', svg: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m3 7 9 5 9-5M12 12v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' },
  { id: 'arc', label: 'arc', color: '#178C78', svg: '<path d="M4 18a11 11 0 0 1 16 0M7 14a7 7 0 0 1 10 0M10 10a3 3 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'node', label: 'node', color: '#6D45B5', svg: '<path d="M7 7h10M7 17h10M7 7v10M17 7v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="7" cy="7" r="2.2" fill="currentColor"/><circle cx="17" cy="7" r="2.2" fill="currentColor"/><circle cx="7" cy="17" r="2.2" fill="currentColor"/><circle cx="17" cy="17" r="2.2" fill="currentColor"/>' },
  { id: 'halo', label: 'halo', color: '#B93465', svg: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>' },
  { id: 'bracket', label: 'bracket', color: '#9B5A2E', svg: '<path d="M8 4H5v16h3M16 4h3v16h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'spark', label: 'spark', color: '#18181A', svg: '<path d="m12 2 1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2Z" fill="currentColor"/>' },
  { id: 'wave', label: 'wave', color: '#B77A00', svg: '<path d="M3 13c2.7 0 2.7-4 5.5-4s2.8 6 5.5 6 2.8-6 5.5-6c.9 0 1.7.5 2.5 1.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'hex', label: 'hex', color: '#178C78', svg: '<path d="m12 2 8 4.7v9.6L12 21l-8-4.7V6.7L12 2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m8.5 12 2.4 2.4 4.8-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' }
]

const phase = ref<'intro' | 'guide'>('intro')
const step = ref<GuideStep>(1)
const revealed = ref(false)
const cards = ref<GridCard[]>([])
const targetSymbol = ref<SymbolDef>(SYMBOLS[0])
const roundNumber = ref(0)

const stepMeta: Record<GuideStep, { label: string; title: string }> = {
  1: { label: 'Choose', title: 'Pick a number' },
  2: { label: 'Add', title: 'Add the digits' },
  3: { label: 'Subtract', title: 'Subtract the sum' },
  4: { label: 'Find', title: 'Find your mark' }
}

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildRound() {
  const target = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!
  const decoys = shuffle(SYMBOLS.filter((symbol) => symbol.id !== target.id))
  const numbers = shuffle(Array.from({ length: 100 }, (_, number) => number))
  let decoyIndex = 0

  targetSymbol.value = target
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
}
</script>

<template>
  <div class="mr">
    <header class="mr__bar">
      <NuxtLink to="/engage" class="mr__back" aria-label="Back to Engage">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
        <span>Back</span>
      </NuxtLink>
      <NuxtLink to="/" class="mr__home" aria-label="Entertrainer home">
        <EdWordmark variant="mark" :size="28" />
      </NuxtLink>
      <span class="mr__title">Mind Reader</span>
    </header>

    <main class="mr__stage">
      <section v-if="phase === 'intro'" class="mr__intro">
        <h1>The<br /><span class="mr__accent-chip">Mind Reader</span></h1>
        <p class="mr__lede">Two digits. Two small moves. One mark you will swear I somehow knew.</p>
        <button class="mr__primary" type="button" @click="startGame">
          Begin
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
        </button>
      </section>

      <section v-else class="mr__guide">
        <div class="mr__guide-top">
          <div>
            <p class="mr__eyebrow">Round {{ roundNumber }}</p>
            <h1>{{ stepMeta[step].title }}</h1>
          </div>
          <button class="mr__ghost" type="button" @click="playAgain">Restart</button>
        </div>

        <nav class="mr__steps" aria-label="Steps">
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

        <article class="mr__card" :class="{ 'mr__card--board': step === 4 }">
          <div v-if="step === 1" class="mr__panel">
            <div class="mr__badge">01</div>
            <h2>Choose a <span class="mr__accent-chip">two-digit</span> number.</h2>
            <p class="mr__copy">Anything from 10 to 99. Keep it in your head. Nothing to type.</p>
            <div class="mr__demo" aria-hidden="true">
              <span class="mr__demo-pill">10</span>
              <span class="mr__demo-dots">···</span>
              <span class="mr__demo-pill mr__demo-pill--hot">54</span>
              <span class="mr__demo-dots">···</span>
              <span class="mr__demo-pill">99</span>
            </div>
            <button class="mr__primary" type="button" @click="nextStep">I have my number</button>
          </div>

          <div v-else-if="step === 2" class="mr__panel">
            <div class="mr__badge">02</div>
            <h2>Add the <span class="mr__accent-chip">digits</span> together.</h2>
            <div class="mr__visual" aria-label="Example: five plus four equals nine">
              <div class="mr__visual-row">
                <span class="mr__num">5</span>
                <span class="mr__op">+</span>
                <span class="mr__num">4</span>
              </div>
              <div class="mr__visual-rule" aria-hidden="true" />
              <div class="mr__visual-row">
                <span class="mr__sum">9</span>
              </div>
              <p class="mr__visual-caption">If your number was 54 → 5 + 4 = 9</p>
            </div>
            <p class="mr__copy">Do the same with yours. Hold the sum.</p>
            <div class="mr__actions">
              <button class="mr__ghost" type="button" @click="previousStep">Back</button>
              <button class="mr__primary" type="button" @click="nextStep">I have the sum</button>
            </div>
          </div>

          <div v-else-if="step === 3" class="mr__panel">
            <div class="mr__badge">03</div>
            <h2>Subtract that sum from the <span class="mr__accent-chip">original</span>.</h2>
            <div class="mr__visual" aria-label="Example: fifty-four minus nine equals forty-five">
              <div class="mr__visual-row">
                <span class="mr__num">54</span>
                <span class="mr__op">−</span>
                <span class="mr__num">9</span>
              </div>
              <div class="mr__visual-rule" aria-hidden="true" />
              <div class="mr__visual-row">
                <span class="mr__sum">45</span>
              </div>
              <p class="mr__visual-caption">54 − 9 = 45. Your result will land on a multiple of 9.</p>
            </div>
            <p class="mr__copy">Keep the result. That is the number you will find next.</p>
            <div class="mr__actions">
              <button class="mr__ghost" type="button" @click="previousStep">Back</button>
              <button class="mr__primary" type="button" @click="nextStep">I have the result</button>
            </div>
          </div>

          <div v-else class="mr__board">
            <div class="mr__board-head">
              <div>
                <div class="mr__badge">04</div>
                <h2>Find your result. Remember the mark.</h2>
              </div>
              <p class="mr__copy mr__copy--tight">Scan the board. One mark sits beside your number.</p>
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
                <svg viewBox="0 0 24 24" aria-hidden="true" :style="{ color: card.symbol.color }" v-html="card.symbol.svg" />
              </div>
            </div>
            <div class="mr__actions mr__actions--spread">
              <button class="mr__ghost" type="button" @click="previousStep">Back</button>
              <button class="mr__primary" type="button" @click="revealed = true">I have my mark</button>
            </div>

            <div v-if="revealed" class="mr__reveal" role="status" aria-live="polite">
              <p class="mr__eyebrow">Your mark</p>
              <svg class="mr__reveal-symbol" viewBox="0 0 24 24" :style="{ color: targetSymbol.color }" v-html="targetSymbol.svg" />
              <button class="mr__primary" type="button" @click="playAgain">Try another round</button>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.mr {
  --mr-paper: #fbf8ef;
  --mr-ink: #171719;
  --mr-yellow: #ffd43b;
  --mr-gold: #b77a00;
  min-height: 100dvh;
  background: color-mix(in srgb, var(--mr-yellow) 14%, var(--mr-paper));
  color: var(--mr-ink);
  display: flex;
  flex-direction: column;
}
.mr__bar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12rem;
  min-height: 56rem;
  padding: 10rem clamp(14rem, 3vw, 28rem);
  background: color-mix(in srgb, var(--mr-paper) 92%, transparent);
  border-bottom: 2rem solid var(--mr-ink);
  backdrop-filter: blur(8px);
}
.mr__back, .mr__home, .mr__title {
  font: 700 12rem/1 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--mr-ink);
}
.mr__back {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 6rem;
}
.mr__back svg { width: 18rem; height: 18rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.mr__home { justify-self: center; display: inline-flex; }
.mr__title { justify-self: end; color: color-mix(in srgb, var(--mr-ink) 55%, transparent); }

.mr__stage {
  flex: 1;
  width: min(100%, 980rem);
  margin: 0 auto;
  padding: clamp(18rem, 3vw, 36rem) clamp(14rem, 3vw, 28rem) 48rem;
}

.mr__intro {
  min-height: min(640rem, calc(100dvh - 120rem));
  display: grid;
  align-content: center;
  gap: 18rem;
  padding: clamp(28rem, 6vw, 64rem);
  background: var(--mr-yellow);
  border: 2rem solid var(--mr-ink);
  border-radius: 28rem;
  box-shadow: 10rem 10rem 0 var(--mr-ink);
}
.mr__eyebrow { margin: 0; font: 800 11rem/1.2 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--mr-ink); }
.mr__intro h1, .mr__guide-top h1, .mr__panel h2, .mr__board-head h2 {
  margin: 0;
  font: 500 clamp(42rem, 8vw, 84rem)/.88 var(--font-display);
  letter-spacing: -.06em;
  text-transform: uppercase;
}
.mr__accent-chip {
  display: inline-block;
  padding: 0.04em 0.18em;
  background: var(--mr-ink);
  color: var(--mr-yellow);
  border-radius: 0.12em;
}
.mr__lede, .mr__copy {
  margin: 0;
  max-width: 42ch;
  font-size: clamp(16rem, 2vw, 20rem);
  line-height: 1.45;
  color: color-mix(in srgb, var(--mr-ink) 78%, transparent);
}
.mr__copy--tight { max-width: 28ch; font-size: 15rem; }

.mr__primary, .mr__ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10rem;
  min-height: 46rem;
  padding: 0 18rem;
  border: 2rem solid var(--mr-ink);
  border-radius: 999rem;
  cursor: pointer;
  font: 800 14rem/1 var(--font-ui);
}
.mr__primary { color: var(--mr-ink); background: var(--mr-paper); box-shadow: 4rem 4rem 0 var(--mr-ink); }
.mr__primary svg { width: 16rem; height: 16rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.mr__ghost { background: transparent; color: var(--mr-ink); }
.mr__intro .mr__primary { margin-top: 10rem; width: fit-content; }

.mr__guide-top { display: flex; align-items: end; justify-content: space-between; gap: 16rem; margin-bottom: 18rem; }
.mr__steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  margin-bottom: 18rem;
  border-top: 2rem solid color-mix(in srgb, var(--mr-ink) 20%, transparent);
  border-bottom: 2rem solid color-mix(in srgb, var(--mr-ink) 20%, transparent);
}
.mr__steps button {
  display: flex;
  align-items: center;
  gap: 8rem;
  padding: 12rem 8rem;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--mr-ink) 50%, transparent);
  cursor: pointer;
  text-align: left;
}
.mr__steps button.active { color: var(--mr-ink); box-shadow: inset 0 -3rem 0 var(--mr-yellow); }
.mr__steps span {
  display: grid; place-items: center; width: 24rem; height: 24rem;
  border: 2rem solid currentColor; border-radius: 50%;
  font: 800 9rem/1 var(--font-mono);
}
.mr__steps strong { font: 800 10rem/1 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; }

.mr__card {
  position: relative;
  min-height: 460rem;
  padding: clamp(22rem, 4vw, 48rem);
  background: color-mix(in srgb, var(--mr-paper) 86%, var(--mr-yellow));
  border: 2rem solid var(--mr-ink);
  border-radius: 28rem;
  box-shadow: 8rem 8rem 0 var(--mr-ink);
  overflow: hidden;
}
.mr__card--board { min-height: 0; padding: clamp(16rem, 3vw, 28rem); }
.mr__panel { display: grid; gap: 16rem; max-width: 640rem; align-content: center; min-height: 360rem; }
.mr__badge {
  display: grid; place-items: center; width: 42rem; height: 42rem;
  border-radius: 50%; background: var(--mr-ink); color: var(--mr-yellow);
  font: 800 11rem/1 var(--font-mono);
}
.mr__demo { display: flex; align-items: center; gap: 10rem; flex-wrap: wrap; }
.mr__demo-pill {
  display: inline-grid; place-items: center; min-width: 52rem; height: 44rem; padding: 0 12rem;
  border: 2rem solid var(--mr-ink); border-radius: 999rem; background: var(--mr-paper);
  font: 800 16rem/1 var(--font-mono);
}
.mr__demo-pill--hot { background: var(--mr-yellow); }
.mr__demo-dots { color: color-mix(in srgb, var(--mr-ink) 35%, transparent); letter-spacing: .2em; }

.mr__visual {
  display: grid;
  gap: 10rem;
  width: fit-content;
  padding: 18rem 22rem;
  background: var(--mr-paper);
  border: 2rem solid var(--mr-ink);
  border-radius: 20rem;
  box-shadow: 5rem 5rem 0 color-mix(in srgb, var(--mr-ink) 16%, transparent);
}
.mr__visual-row { display: flex; align-items: baseline; gap: 14rem; }
.mr__num, .mr__sum {
  font: 500 clamp(40rem, 7vw, 64rem)/.9 var(--font-display);
  letter-spacing: -.05em;
  color: var(--mr-ink);
}
.mr__sum {
  display: inline-block;
  padding: 0 .12em;
  background: var(--mr-yellow);
  border-radius: .1em;
}
.mr__op { font: 800 18rem/1 var(--font-mono); color: var(--mr-gold); }
.mr__visual-rule { height: 2rem; background: color-mix(in srgb, var(--mr-ink) 18%, transparent); }
.mr__visual-caption { margin: 0; font: 600 12rem/1.35 var(--font-mono); letter-spacing: .04em; text-transform: uppercase; color: color-mix(in srgb, var(--mr-ink) 55%, transparent); }

.mr__actions { display: flex; align-items: center; gap: 12rem; flex-wrap: wrap; margin-top: 8rem; }
.mr__actions--spread { justify-content: space-between; }

.mr__board-head { display: flex; justify-content: space-between; gap: 16rem; align-items: end; margin-bottom: 16rem; }
.mr__grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 3rem;
  padding: 10rem 0;
  border-top: 1rem solid color-mix(in srgb, var(--mr-ink) 22%, transparent);
  border-bottom: 1rem solid color-mix(in srgb, var(--mr-ink) 22%, transparent);
}
.mr__cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3rem;
  min-height: 46rem; border: 1rem solid color-mix(in srgb, var(--mr-ink) 12%, transparent);
  background: color-mix(in srgb, var(--mr-paper) 70%, transparent);
  font: 800 10rem/1 var(--font-mono); color: color-mix(in srgb, var(--mr-ink) 60%, transparent);
}
.mr__cell svg { width: 16rem; height: 16rem; }

.mr__reveal {
  position: absolute; inset: 0; z-index: 3;
  display: grid; place-content: center; justify-items: center; gap: 18rem;
  background: color-mix(in srgb, var(--mr-yellow) 88%, var(--mr-paper));
  backdrop-filter: blur(6px);
}
.mr__reveal-symbol { width: 96rem; height: 96rem; }

@media (max-width: 720px) {
  .mr__steps strong { display: none; }
  .mr__board-head { flex-direction: column; align-items: start; }
  .mr__intro { min-height: calc(100dvh - 120rem); }
  .mr__grid { gap: 2rem; }
  .mr__cell { min-height: 36rem; }
}
@media (prefers-reduced-motion: reduce) {
  .mr__primary, .mr__ghost { transition: none; }
}
</style>
