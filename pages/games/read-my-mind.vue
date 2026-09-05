<script setup lang="ts">
import { computed, ref } from 'vue'

useSeoMeta({
  title: 'Read My Mind · Entertrainer Games',
  description: 'A compact number illusion from Entertrainer. Pick a number, keep your mark in mind, and see what happens.',
  ogUrl: 'https://entertrainer.in/games/read-my-mind'
})

type SymbolKind = 'orbit' | 'prism' | 'arc' | 'node' | 'halo' | 'bracket' | 'spark' | 'wave' | 'hex'

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
  { id: 'orbit', label: 'orbit', color: '#2453D4', svg: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="7" r="2.2" fill="currentColor"/>' },
  { id: 'prism', label: 'prism', color: '#D84A27', svg: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m3 7 9 5 9-5M12 12v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' },
  { id: 'arc', label: 'arc', color: '#B77A00', svg: '<path d="M4 18a11 11 0 0 1 16 0M7 14a7 7 0 0 1 10 0M10 10a3 3 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'node', label: 'node', color: '#178C78', svg: '<path d="M7 7h10M7 17h10M7 7v10M17 7v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="7" cy="7" r="2.2" fill="currentColor"/><circle cx="17" cy="7" r="2.2" fill="currentColor"/><circle cx="7" cy="17" r="2.2" fill="currentColor"/><circle cx="17" cy="17" r="2.2" fill="currentColor"/>' },
  { id: 'halo', label: 'halo', color: '#6D45B5', svg: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>' },
  { id: 'bracket', label: 'bracket', color: '#B93465', svg: '<path d="M8 4H5v16h3M16 4h3v16h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'spark', label: 'spark', color: '#18181A', svg: '<path d="m12 2 1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2Z" fill="currentColor"/>' },
  { id: 'wave', label: 'wave', color: '#256A9C', svg: '<path d="M3 13c2.7 0 2.7-4 5.5-4s2.8 6 5.5 6 2.8-6 5.5-6c.9 0 1.7.5 2.5 1.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'hex', label: 'hex', color: '#9B5A2E', svg: '<path d="m12 2 8 4.7v9.6L12 21l-8-4.7V6.7L12 2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m8.5 12 2.4 2.4 4.8-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' }
]

const phase = ref<'intro' | 'board'>('intro')
const revealed = ref(false)
const cards = ref<GridCard[]>([])
const targetSymbol = ref<SymbolDef>(SYMBOLS[0])
const roundNumber = ref(0)
const roundLabel = computed(() => String(roundNumber.value).padStart(2, '0'))

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildRound() {
  const target = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  const decoys = shuffle(SYMBOLS.filter((symbol) => symbol.id !== target.id))
  const numbers = shuffle(Array.from({ length: 100 }, (_, number) => number))
  let decoyIndex = 0

  targetSymbol.value = target
  cards.value = numbers.map((number) => {
    const isGuaranteedResult = number > 0 && number % 9 === 0 && number <= 81
    const symbol = isGuaranteedResult ? target : decoys[decoyIndex++ % decoys.length]
    return { number, symbol }
  })
  revealed.value = false
  roundNumber.value += 1
}

function startGame() {
  phase.value = 'board'
  buildRound()
}

function playAgain() {
  buildRound()
}
</script>

<template>
  <main id="main" class="mind-reader">
    <div class="mind-reader__shell">
      <header class="mind-reader__header">
        <NuxtLink to="/games" class="mind-reader__back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 5 5 19M5 19V8M5 19h11" /></svg>
          <span>Games</span>
        </NuxtLink>
        <span class="mind-reader__brand">Entertrainer / Games</span>
        <span class="mind-reader__eye" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
        </span>
      </header>

      <section v-if="phase === 'intro'" class="mind-reader__intro" aria-labelledby="mind-reader-title">
        <div class="mind-reader__intro-copy-block">
          <p class="mind-reader__eyebrow">A compact number illusion</p>
          <h1 id="mind-reader-title">Keep one mark<br /><span>in your mind.</span></h1>
          <p class="mind-reader__intro-copy">Choose a two-digit number. Follow the small instruction. Hold on to the mark you land on.</p>
          <button class="mind-reader__primary" type="button" @click="startGame">
            Enter the board
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
          </button>
        </div>
        <div class="mind-reader__intro-art" aria-hidden="true">
          <div class="mind-reader__art-ring mind-reader__art-ring--outer"></div>
          <div class="mind-reader__art-ring mind-reader__art-ring--middle"></div>
          <div class="mind-reader__art-ring mind-reader__art-ring--inner"></div>
          <span class="mind-reader__sun"></span>
          <span class="mind-reader__burst mind-reader__burst--one"></span>
          <span class="mind-reader__burst mind-reader__burst--two"></span>
          <svg class="mind-reader__brain" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M49 20a19 19 0 0 0-19 19c0 3 .7 5.7 1.9 8.2A19 19 0 0 0 21 64c0 6.1 2.9 11.5 7.4 14.9A19 19 0 0 0 47 99" />
            <path d="M71 20a19 19 0 0 1 19 19c0 3-.7 5.7-1.9 8.2A19 19 0 0 1 99 64c0 6.1-2.9 11.5-7.4 14.9A19 19 0 0 1 73 99" />
            <path d="M60 27v68M42 38c7-2 13 2 14 8M60 73c-7-4-14-1-16 5M60 53c7-4 13-1 16 5M78 34c-4 1-7 4-7 8M38 62c4 0 7-2 8-6M82 65c-4 0-7-2-8-6" />
          </svg>
          <span class="mind-reader__art-label">000 / 100</span>
        </div>
      </section>

      <section v-else class="mind-reader__board" aria-labelledby="board-title">
        <div class="mind-reader__board-top">
          <div>
            <p class="mind-reader__eyebrow">The board <span>/ {{ roundLabel }}</span></p>
            <h1 id="board-title">Read my mind.</h1>
          </div>
          <button class="mind-reader__new-round" type="button" @click="playAgain">
            New board
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2 5M20 5v6h-6" /></svg>
          </button>
        </div>

        <article class="mind-reader__card">
          <div class="mind-reader__steps" aria-label="How to play">
            <div class="mind-reader__step"><span class="mind-reader__step-index">01</span><p>Choose any <strong>two-digit number.</strong></p></div>
            <div class="mind-reader__step"><span class="mind-reader__step-index">02</span><p>Take away its two digits. <strong>54 → 45</strong></p></div>
            <div class="mind-reader__step"><span class="mind-reader__step-index">03</span><p>Find the result. <strong>Keep its mark.</strong></p></div>
          </div>

          <div class="mind-reader__grid-label"><span>Find your number</span><span>100 positions</span></div>
          <div class="mind-reader__grid" role="grid" aria-label="The number board">
            <div v-for="card in cards" :key="`${roundNumber}-${card.number}`" class="mind-reader__grid-item" role="gridcell" :aria-label="`Number ${card.number}, ${card.symbol.label}`">
              <span class="mind-reader__number">{{ card.number }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" :style="{ color: card.symbol.color }" v-html="card.symbol.svg"></svg>
            </div>
          </div>

          <div class="mind-reader__card-footer">
            <p>Keep the mark in your mind.</p>
            <button class="mind-reader__ready" type="button" @click="revealed = true">
              I’m ready
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
            </button>
          </div>

          <div v-if="revealed" class="mind-reader__reveal" role="status" aria-live="polite">
            <div class="mind-reader__reveal-inner">
              <p class="mind-reader__reveal-kicker">Your mark</p>
              <svg class="mind-reader__reveal-symbol" viewBox="0 0 24 24" aria-hidden="true" :aria-label="`Your mark: ${targetSymbol.label}`" :style="{ color: targetSymbol.color }" v-html="targetSymbol.svg"></svg>
              <span class="mind-reader__reveal-rule"></span>
              <button class="mind-reader__retry" type="button" @click="playAgain">
                Try again
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2 5M20 5v6h-6" /></svg>
              </button>
            </div>
          </div>
        </article>
      </section>

      <p class="mind-reader__footnote">A small game for a short detour.</p>
    </div>
  </main>
</template>

<style scoped>
.mind-reader { --mr-yellow: var(--signal-field, #f7d74b); --mr-paper: var(--paper, #fbf8ef); --mr-paper-2: var(--paper-2, #f0eadb); --mr-ink: var(--ink, #171719); --mr-cobalt: var(--signal-cobalt, #2453d4); min-height: calc(100dvh - 74rem); padding: clamp(18rem, 3vw, 42rem) var(--shell-gutter) 86rem; background: color-mix(in srgb, var(--mr-yellow) 18%, var(--mr-paper)); }
.mind-reader__shell { width: min(100%, 1000rem); margin: 0 auto; }
.mind-reader__header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16rem; min-height: 48rem; margin-bottom: clamp(16rem, 3vw, 30rem); color: var(--mr-ink); font: 700 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.mind-reader__back { justify-self: start; display: inline-flex; align-items: center; gap: 8rem; color: inherit; }
.mind-reader__back svg { width: 16rem; height: 16rem; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.mind-reader__brand { justify-self: center; color: color-mix(in srgb, var(--mr-ink) 54%, transparent); }
.mind-reader__eye { justify-self: end; display: grid; width: 38rem; height: 38rem; place-items: center; border: var(--stroke) solid var(--mr-cobalt); border-radius: 50%; color: var(--mr-cobalt); }
.mind-reader__eye svg { width: 21rem; height: 21rem; }
.mind-reader__intro { display: grid; min-height: min(650rem, calc(100dvh - 170rem)); grid-template-columns: minmax(0, 1.05fr) minmax(270rem, .95fr); align-items: center; gap: clamp(20rem, 5vw, 84rem); padding: clamp(28rem, 7vw, 76rem); overflow: hidden; color: var(--mr-ink); background: var(--mr-yellow); border: var(--stroke) solid var(--mr-ink); border-radius: var(--radius-l); box-shadow: 9rem 9rem 0 var(--mr-ink); }
.mind-reader__intro-copy-block { position: relative; z-index: 2; max-width: 540rem; }
.mind-reader__eyebrow { margin: 0; color: var(--mr-cobalt); font: 800 11rem/1.2 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; }
.mind-reader__intro h1 { margin: 22rem 0 19rem; font: 500 clamp(54rem, 8vw, 100rem)/.84 var(--font-display); letter-spacing: -.08em; text-transform: uppercase; }
.mind-reader__intro h1 span { color: var(--mr-cobalt); }
.mind-reader__intro-copy { max-width: 390rem; margin: 0; color: color-mix(in srgb, var(--mr-ink) 74%, transparent); font-size: clamp(16rem, 2vw, 20rem); line-height: 1.45; }
.mind-reader__primary, .mind-reader__ready, .mind-reader__retry { display: inline-flex; align-items: center; justify-content: center; gap: 12rem; border: var(--stroke) solid var(--mr-ink); border-radius: var(--radius-s); cursor: pointer; font: 800 14rem/1 var(--font-ui); transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.mind-reader__primary svg, .mind-reader__ready svg, .mind-reader__retry svg, .mind-reader__new-round svg { width: 17rem; height: 17rem; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.mind-reader__primary { margin-top: 28rem; padding: 17rem 21rem; color: var(--mr-paper); background: var(--mr-cobalt); box-shadow: 5rem 5rem 0 var(--mr-ink); }
.mind-reader__primary:hover, .mind-reader__ready:hover, .mind-reader__retry:hover, .mind-reader__new-round:hover { transform: translateY(-2rem); }
.mind-reader__intro-art { position: relative; display: grid; width: min(100%, 430rem); aspect-ratio: 1; place-items: center; justify-self: end; }
.mind-reader__art-ring { position: absolute; border: 1rem solid color-mix(in srgb, var(--mr-ink) 34%, transparent); border-radius: 50%; }
.mind-reader__art-ring--outer { inset: 0; border-width: 2rem; }
.mind-reader__art-ring--middle { inset: 12%; border-width: 2rem; border-color: color-mix(in srgb, var(--mr-cobalt) 65%, transparent); }
.mind-reader__art-ring--inner { inset: 25%; border-width: 3rem; }
.mind-reader__brain { position: relative; z-index: 2; width: 47%; height: 47%; color: var(--mr-ink); filter: drop-shadow(7rem 8rem 0 color-mix(in srgb, var(--mr-ink) 16%, transparent)); }
.mind-reader__sun { position: absolute; z-index: 1; top: 16%; right: 14%; width: 24%; aspect-ratio: 1; border-radius: 50%; background: var(--mr-cobalt); }
.mind-reader__burst { position: absolute; width: 17rem; height: 17rem; background: var(--mr-ink); transform: rotate(45deg); }
.mind-reader__burst--one { top: 11%; left: 7%; }
.mind-reader__burst--two { right: 4%; bottom: 14%; width: 13rem; height: 13rem; background: var(--mr-cobalt); }
.mind-reader__art-label { position: absolute; right: 7%; bottom: 5%; color: color-mix(in srgb, var(--mr-ink) 52%, transparent); font: 800 10rem/1 var(--font-mono); letter-spacing: .14em; }
.mind-reader__board { padding-bottom: 10rem; }
.mind-reader__board-top { display: flex; align-items: end; justify-content: space-between; gap: 18rem; margin: 0 0 20rem; }
.mind-reader__board-top h1 { margin: 10rem 0 0; font: 500 clamp(48rem, 8vw, 90rem)/.84 var(--font-display); letter-spacing: -.07em; text-transform: uppercase; }
.mind-reader__board-top .mind-reader__eyebrow span { color: color-mix(in srgb, var(--mr-ink) 47%, transparent); }
.mind-reader__new-round { display: inline-flex; align-items: center; gap: 9rem; padding: 10rem 13rem; color: var(--mr-ink); background: transparent; border: var(--stroke) solid var(--mr-ink); border-radius: var(--radius-s); cursor: pointer; font: 800 12rem/1.1 var(--font-ui); }
.mind-reader__card { position: relative; overflow: hidden; padding: clamp(17rem, 3vw, 30rem); color: var(--mr-ink); background: color-mix(in srgb, var(--mr-paper-2) 74%, var(--mr-yellow)); border: var(--stroke) solid var(--mr-ink); border-radius: var(--radius-l); box-shadow: 7rem 7rem 0 var(--mr-ink); }
.mind-reader__steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 13rem; padding-bottom: 24rem; border-bottom: var(--stroke) solid color-mix(in srgb, var(--mr-ink) 20%, transparent); }
.mind-reader__step { display: grid; grid-template-columns: 27rem 1fr; align-items: start; gap: 9rem; font-size: 14rem; line-height: 1.35; }
.mind-reader__step-index { display: grid; width: 24rem; height: 24rem; place-items: center; color: var(--mr-paper); background: var(--mr-cobalt); border-radius: 50%; font: 800 9rem/1 var(--font-mono); }
.mind-reader__step p { margin: 2rem 0 0; }
.mind-reader__step strong { color: var(--mr-cobalt); }
.mind-reader__grid-label { display: flex; justify-content: space-between; gap: 15rem; padding: 20rem 0 10rem; color: color-mix(in srgb, var(--mr-ink) 56%, transparent); font: 800 10rem/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.mind-reader__grid { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 4rem 2rem; padding: 12rem 4rem 15rem; border-top: 1rem solid color-mix(in srgb, var(--mr-ink) 25%, transparent); border-bottom: 1rem solid color-mix(in srgb, var(--mr-ink) 25%, transparent); }
.mind-reader__grid-item { display: flex; min-width: 0; min-height: 48rem; flex-direction: column; align-items: center; justify-content: center; gap: 4rem; border: 1rem solid color-mix(in srgb, var(--mr-ink) 12%, transparent); background: color-mix(in srgb, var(--mr-paper) 50%, transparent); }
.mind-reader__number { color: color-mix(in srgb, var(--mr-ink) 61%, transparent); font: 800 clamp(9rem, 1.2vw, 12rem)/1 var(--font-mono); }
.mind-reader__grid-item svg { width: clamp(14rem, 2vw, 20rem); height: clamp(14rem, 2vw, 20rem); }
.mind-reader__card-footer { display: flex; align-items: center; justify-content: space-between; gap: 18rem; padding-top: 19rem; }
.mind-reader__card-footer p { margin: 0; color: color-mix(in srgb, var(--mr-ink) 63%, transparent); font: 800 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.mind-reader__ready { flex: none; padding: 14rem 18rem; color: var(--mr-paper); background: var(--mr-cobalt); }
.mind-reader__reveal { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; padding: 22rem; background: color-mix(in srgb, var(--mr-yellow) 84%, var(--mr-paper)); backdrop-filter: blur(5rem); animation: mind-reader-fade-in 240ms var(--ease-out); }
.mind-reader__reveal-inner { display: flex; max-width: 410rem; flex-direction: column; align-items: center; text-align: center; }
.mind-reader__reveal-kicker { margin: 0 0 22rem; color: color-mix(in srgb, var(--mr-ink) 57%, transparent); font: 800 11rem/1.2 var(--font-mono); letter-spacing: .15em; text-transform: uppercase; }
.mind-reader__reveal-symbol { width: 108rem; height: 108rem; color: var(--mr-cobalt); animation: mind-reader-pop 500ms var(--ease-spring); }
.mind-reader__reveal-rule { width: 46rem; height: 4rem; margin: 26rem 0 23rem; background: var(--mr-cobalt); }
.mind-reader__retry { padding: 13rem 18rem; color: var(--mr-ink); background: var(--mr-paper); }
.mind-reader__footnote { margin: 18rem 0 0; color: color-mix(in srgb, var(--mr-ink) 55%, transparent); font: 400 11rem/1.35 var(--font-mono); text-align: center; }
@keyframes mind-reader-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes mind-reader-pop { 0% { opacity: 0; transform: scale(.3) rotate(-10deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@media (max-width: 720px) {
  .mind-reader__header { grid-template-columns: 1fr auto; }
  .mind-reader__brand { display: none; }
  .mind-reader__intro { grid-template-columns: 1fr; min-height: calc(100dvh - 170rem); padding: 31rem 24rem 28rem; }
  .mind-reader__intro-art { width: min(74vw, 310rem); justify-self: center; order: -1; }
  .mind-reader__intro h1 { margin-top: 17rem; }
  .mind-reader__primary { width: 100%; }
  .mind-reader__board-top { align-items: start; flex-direction: column; }
  .mind-reader__new-round { align-self: flex-start; }
  .mind-reader__steps { grid-template-columns: 1fr; gap: 10rem; padding-bottom: 18rem; }
  .mind-reader__step { grid-template-columns: 27rem 1fr; }
  .mind-reader__grid { gap: 2rem 1rem; padding-inline: 1rem; }
  .mind-reader__grid-item { min-height: 37rem; }
  .mind-reader__card-footer { align-items: stretch; flex-direction: column; }
  .mind-reader__ready { align-self: flex-start; }
}
@media (max-width: 420px) {
  .mind-reader { padding-inline: 12rem; }
  .mind-reader__intro { padding-inline: 18rem; }
  .mind-reader__grid-item { min-height: 32rem; }
  .mind-reader__number { font-size: 8rem; }
  .mind-reader__grid-item svg { width: 12rem; height: 12rem; }
}
@media (prefers-reduced-motion: reduce) {
  .mind-reader__primary, .mind-reader__ready, .mind-reader__retry, .mind-reader__new-round { transition: none; }
  .mind-reader__reveal { animation: none; }
  .mind-reader__reveal-symbol { animation: none; }
}
</style>
