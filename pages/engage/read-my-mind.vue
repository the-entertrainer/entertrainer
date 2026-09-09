<script setup lang="ts">
useSeoMeta({
  title: 'The Mind Reader · Engage',
  description: 'Pick a two-digit number. Add the digits. Subtract that sum. Find your mark.',
  ogUrl: 'https://entertrainer.in/engage/read-my-mind'
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
  4: { label: 'Find', title: 'Find your mark' }
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
        <p class="mr__lede">Two digits. Two moves. One mark.</p>
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
            <h2>Pick a <span class="mr__accent-chip">two-digit</span> number.</h2>
            <p class="mr__copy">10 to 99. Just remember it.</p>
            <button class="mr__primary" type="button" @click="nextStep">Got it</button>
          </div>

          <div v-else-if="step === 2" class="mr__panel">
            <div class="mr__badge">02</div>
            <h2>Add those <span class="mr__accent-chip">digits</span>.</h2>
            <p class="mr__copy">Hold the sum.</p>
            <div class="mr__actions">
              <button class="mr__ghost" type="button" @click="previousStep">Back</button>
              <button class="mr__primary" type="button" @click="nextStep">Sum ready</button>
            </div>
          </div>

          <div v-else-if="step === 3" class="mr__panel">
            <div class="mr__badge">03</div>
            <h2>Subtract that sum from your <span class="mr__accent-chip">original</span>.</h2>
            <p class="mr__copy">Keep the result.</p>
            <div class="mr__actions">
              <button class="mr__ghost" type="button" @click="previousStep">Back</button>
              <button class="mr__primary" type="button" @click="nextStep">Ready</button>
            </div>
          </div>

          <div v-else class="mr__board">
            <div class="mr__board-head">
              <div>
                <div class="mr__badge">04</div>
                <h2>Find your number. Note the mark.</h2>
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
              <button class="mr__primary" type="button" @click="revealed = true">Reveal</button>
            </div>

            <div v-if="revealed" class="mr__reveal" role="status" aria-live="polite">
              <svg
                class="mr__reveal-symbol"
                viewBox="0 0 48 48"
                :style="{ color: targetSymbol.color }"
                v-html="targetSymbol.svg"
              />
              <button class="mr__again" type="button" @click="playAgain">Again</button>
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
  --mr-veil: color-mix(in srgb, var(--mr-paper) 72%, #e8d9a8);
  min-height: 100dvh;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--mr-yellow) 35%, transparent), transparent 70%),
    color-mix(in srgb, var(--mr-yellow) 12%, var(--mr-paper));
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
  gap: 16rem;
  padding: clamp(28rem, 6vw, 64rem);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--mr-yellow) 92%, #fff) 0%, var(--mr-yellow) 55%, color-mix(in srgb, var(--mr-gold) 28%, var(--mr-yellow)) 100%);
  border: 2rem solid var(--mr-ink);
  border-radius: 28rem;
  box-shadow: 10rem 10rem 0 var(--mr-ink);
}
.mr__eyebrow {
  margin: 0;
  font: 800 11rem/1.2 var(--font-mono);
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--mr-ink);
}
.mr__intro h1, .mr__guide-top h1, .mr__panel h2, .mr__board-head h2 {
  margin: 0;
  font: 500 clamp(42rem, 8vw, 84rem)/.88 var(--font-display);
  letter-spacing: -.06em;
  text-transform: uppercase;
}
.mr__accent-chip {
  display: inline-block;
  padding: 0.04em 0.18em;
  border-radius: 0.12em;
  background: var(--mr-yellow);
  color: var(--accent-ink, #161618);
}
.mr__intro .mr__accent-chip {
  background: var(--mr-ink);
  color: var(--mr-yellow);
}
.mr__lede, .mr__copy {
  margin: 0;
  max-width: 38ch;
  font-size: clamp(16rem, 2vw, 20rem);
  line-height: 1.45;
  color: color-mix(in srgb, var(--mr-ink) 78%, transparent);
}
.mr__copy--tight { max-width: 26ch; font-size: 15rem; }

.mr__primary, .mr__ghost, .mr__again {
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
  transition: transform .18s ease, box-shadow .18s ease;
}
.mr__primary { color: var(--mr-ink); background: var(--mr-paper); box-shadow: 4rem 4rem 0 var(--mr-ink); }
.mr__primary:hover { transform: translate(-1rem, -1rem); box-shadow: 5rem 5rem 0 var(--mr-ink); }
.mr__primary svg { width: 16rem; height: 16rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.mr__ghost { background: transparent; color: var(--mr-ink); }
.mr__again {
  min-height: 40rem;
  padding: 0 16rem;
  background: transparent;
  color: var(--mr-ink);
  font: 700 12rem/1 var(--font-mono);
  letter-spacing: .12em;
  text-transform: uppercase;
  border-width: 1.5rem;
  opacity: .72;
}
.mr__again:hover { opacity: 1; }
.mr__intro .mr__primary { margin-top: 8rem; width: fit-content; }

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
  min-height: 420rem;
  padding: clamp(22rem, 4vw, 48rem);
  background: var(--mr-veil);
  border: 2rem solid var(--mr-ink);
  border-radius: 28rem;
  box-shadow: 8rem 8rem 0 var(--mr-ink);
  overflow: hidden;
}
.mr__card--board { min-height: 0; padding: clamp(16rem, 3vw, 28rem); }
.mr__panel { display: grid; gap: 18rem; max-width: 560rem; align-content: center; min-height: 320rem; }
.mr__badge {
  display: grid; place-items: center; width: 42rem; height: 42rem;
  border-radius: 50%; background: var(--mr-ink); color: var(--mr-yellow);
  font: 800 11rem/1 var(--font-mono);
}

.mr__actions { display: flex; align-items: center; gap: 12rem; flex-wrap: wrap; margin-top: 4rem; }
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
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem;
  min-height: 48rem; border: 1rem solid color-mix(in srgb, var(--mr-ink) 12%, transparent);
  background: color-mix(in srgb, var(--mr-paper) 78%, transparent);
  font: 800 10rem/1 var(--font-mono); color: color-mix(in srgb, var(--mr-ink) 60%, transparent);
}
.mr__cell svg { width: 18rem; height: 18rem; }

.mr__reveal {
  position: absolute; inset: 0; z-index: 3;
  display: grid; place-content: center; justify-items: center; gap: 28rem;
  background: color-mix(in srgb, var(--mr-yellow) 90%, var(--mr-paper));
  backdrop-filter: blur(8px);
}
.mr__reveal-symbol {
  width: min(160rem, 42vw);
  height: min(160rem, 42vw);
  filter: drop-shadow(0 8rem 18rem color-mix(in srgb, var(--mr-ink) 18%, transparent));
}

@media (max-width: 720px) {
  .mr__steps strong { display: none; }
  .mr__board-head { flex-direction: column; align-items: start; }
  .mr__intro { min-height: calc(100dvh - 120rem); }
  .mr__grid { gap: 2rem; }
  .mr__cell { min-height: 38rem; }
  .mr__cell svg { width: 14rem; height: 14rem; }
}
@media (prefers-reduced-motion: reduce) {
  .mr__primary, .mr__ghost, .mr__again { transition: none; }
  .mr__primary:hover { transform: none; }
  .mr__reveal-symbol { filter: none; }
}
</style>
