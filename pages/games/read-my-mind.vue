<script setup lang="ts">
import { computed, ref } from 'vue'

useSeoMeta({
  title: 'Read My Mind · Entertrainer Games',
  description: 'A quick flash mind-reader trick: choose a two-digit number, follow the subtraction, and let the symbols do the rest.',
  ogUrl: 'https://entertrainer.in/games/read-my-mind'
})

type SymbolKind = 'star' | 'shield' | 'crown' | 'plus' | 'hexagon' | 'target' | 'spark' | 'moon' | 'spiral'

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
  { id: 'star', label: 'star', color: '#2453D4', svg: '<polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2" fill="currentColor"/>' },
  { id: 'shield', label: 'shield', color: '#E44E24', svg: '<path d="M12 2L4 5v6.5c0 5 3.5 9.5 8 10.5 4.5-1 8-5.5 8-10.5V5l-8-3z" fill="currentColor"/>' },
  { id: 'crown', label: 'crown', color: '#C88A00', svg: '<polygon points="3 18 21 18 20 8 15 13 12 6 9 13 4 8 3 18" fill="currentColor"/>' },
  { id: 'plus', label: 'plus', color: '#138C78', svg: '<path d="M8 3h8v5h5v8h-5v5H8v-5H3V8h5V3z" fill="currentColor"/>' },
  { id: 'hexagon', label: 'hexagon', color: '#6D45B5', svg: '<polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" fill="currentColor"/>' },
  { id: 'target', label: 'target', color: '#B93465', svg: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" fill="none"/><circle cx="12" cy="12" r="4" fill="currentColor"/>' },
  { id: 'spark', label: 'spark', color: '#1A1A1A', svg: '<path d="M12 2L14 9L21 9L15.5 13.5L18 20L12 16L6 20L8.5 13.5L3 9L10 9L12 2Z" fill="currentColor"/>' },
  { id: 'moon', label: 'moon', color: '#256A9C', svg: '<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" fill="currentColor"/>' },
  { id: 'spiral', label: 'spiral', color: '#9B5A2E', svg: '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="4 2"/>' }
]

const phase = ref<'intro' | 'board'>('intro')
const revealed = ref(false)
const cards = ref<GridCard[]>([])
const targetSymbol = ref<SymbolDef>(SYMBOLS[0])
const roundNumber = ref(0)

const targetLabel = computed(() => targetSymbol.value.label)

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
        <NuxtLink to="/games" class="mind-reader__back"><span aria-hidden="true">↙</span> Games</NuxtLink>
        <span class="mind-reader__brand">Entertrainer / Games</span>
        <span class="mind-reader__eye" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
        </span>
      </header>

      <section v-if="phase === 'intro'" class="mind-reader__intro" aria-labelledby="mind-reader-title">
        <div class="mind-reader__intro-art" aria-hidden="true">
          <span class="mind-reader__sun"></span>
          <span class="mind-reader__burst mind-reader__burst--one"></span>
          <span class="mind-reader__burst mind-reader__burst--two"></span>
          <svg class="mind-reader__brain" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M49 20a19 19 0 0 0-19 19c0 3 .7 5.7 1.9 8.2A19 19 0 0 0 21 64c0 6.1 2.9 11.5 7.4 14.9A19 19 0 0 0 47 99" />
            <path d="M71 20a19 19 0 0 1 19 19c0 3-.7 5.7-1.9 8.2A19 19 0 0 1 99 64c0 6.1-2.9 11.5-7.4 14.9A19 19 0 0 1 73 99" />
            <path d="M60 27v68M42 38c7-2 13 2 14 8M60 73c-7-4-14-1-16 5M60 53c7-4 13-1 16 5M78 34c-4 1-7 4-7 8M38 62c4 0 7-2 8-6M82 65c-4 0-7-2-8-6" />
          </svg>
        </div>
        <p class="mind-reader__eyebrow">A small flash mind-reader</p>
        <h1 id="mind-reader-title">Want me to<br /><span>read your mind?</span></h1>
        <p class="mind-reader__intro-copy">Choose a number. Follow the little bit of maths. Keep your eyes on one symbol.</p>
        <button class="mind-reader__primary" type="button" @click="startGame">Yes, go on <span aria-hidden="true">↗</span></button>
      </section>

      <section v-else class="mind-reader__board" aria-labelledby="board-title">
        <div class="mind-reader__board-top">
          <div>
            <p class="mind-reader__eyebrow">Mind trick · Round {{ roundNumber }}</p>
            <h1 id="board-title">Read my mind.</h1>
          </div>
          <button class="mind-reader__new-round" type="button" @click="playAgain">New round <span aria-hidden="true">↻</span></button>
        </div>

        <article class="mind-reader__card">
          <div class="mind-reader__steps" aria-label="How to play">
            <div class="mind-reader__step"><span>01</span><p>Think of any <strong>two-digit number.</strong></p></div>
            <div class="mind-reader__step"><span>02</span><p>Subtract both of its digits. <strong>54 → 54 − 5 − 4 = 45</strong></p></div>
            <div class="mind-reader__step"><span>03</span><p>Find your answer below and <strong>focus on its symbol.</strong></p></div>
          </div>

          <div class="mind-reader__grid-label"><span>Find the answer</span><span>0—99 / shuffled</span></div>
          <div class="mind-reader__grid" role="grid" aria-label="Shuffled numbers and symbols">
            <div v-for="card in cards" :key="`${roundNumber}-${card.number}`" class="mind-reader__grid-item" role="gridcell" :aria-label="`Number ${card.number}, ${card.symbol.label}`">
              <span class="mind-reader__number">{{ card.number }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" :style="{ color: card.symbol.color }" v-html="card.symbol.svg"></svg>
            </div>
          </div>

          <div class="mind-reader__card-footer">
            <p>Every round changes the order and the symbols. The trick still knows where to look.</p>
            <button class="mind-reader__ready" type="button" @click="revealed = true">I’m ready <span aria-hidden="true">→</span></button>
          </div>

          <div v-if="revealed" class="mind-reader__reveal" role="status" aria-live="polite">
            <div class="mind-reader__reveal-inner">
              <p class="mind-reader__reveal-kicker">You were thinking of this</p>
              <svg class="mind-reader__reveal-symbol" viewBox="0 0 24 24" aria-hidden="true" :style="{ color: targetSymbol.color }" v-html="targetSymbol.svg"></svg>
              <strong class="mind-reader__reveal-name">The {{ targetLabel }}</strong>
              <p class="mind-reader__reveal-note">A two-digit number minus its digits always lands on a multiple of nine. Those are the places I marked.</p>
              <button class="mind-reader__retry" type="button" @click="playAgain">Try another number <span aria-hidden="true">↗</span></button>
            </div>
          </div>
        </article>
      </section>

      <p class="mind-reader__footnote">No data leaves your browser. It is just a number trick with better theatre.</p>
    </div>
  </main>
</template>

<style scoped>
.mind-reader { --mr-yellow: var(--signal-field, #f7d74b); --mr-paper: var(--paper, #fbf8ef); --mr-paper-2: var(--paper-2, #f0eadb); --mr-ink: var(--ink, #171719); --mr-cobalt: var(--signal-cobalt, #2453d4); min-height: calc(100dvh - 74rem); padding: clamp(18rem, 3vw, 42rem) var(--shell-gutter) 86rem; background: color-mix(in srgb, var(--mr-yellow) 22%, var(--mr-paper)); }
.mind-reader__shell { width: min(100%, 940rem); margin: 0 auto; }
.mind-reader__header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16rem; min-height: 48rem; margin-bottom: clamp(16rem, 3vw, 30rem); color: var(--mr-ink); font: 700 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.mind-reader__back { justify-self: start; display: inline-flex; align-items: center; gap: 8rem; color: inherit; }
.mind-reader__back span { font-size: 17rem; line-height: 0; }
.mind-reader__brand { justify-self: center; color: color-mix(in srgb, var(--mr-ink) 54%, transparent); }
.mind-reader__eye { justify-self: end; display: grid; width: 38rem; height: 38rem; place-items: center; border: var(--stroke) solid var(--mr-cobalt); border-radius: 50%; color: var(--mr-cobalt); }
.mind-reader__eye svg { width: 21rem; height: 21rem; }
.mind-reader__intro { display: flex; min-height: min(720rem, calc(100dvh - 170rem)); flex-direction: column; align-items: center; justify-content: space-between; padding: clamp(32rem, 8vw, 82rem) clamp(22rem, 8vw, 90rem) clamp(26rem, 5vw, 52rem); overflow: hidden; color: var(--mr-ink); background: var(--mr-yellow); border: var(--stroke) solid var(--mr-ink); border-radius: var(--radius-l); box-shadow: 9rem 9rem 0 var(--mr-ink); text-align: center; }
.mind-reader__intro-art { position: relative; width: clamp(156rem, 28vw, 220rem); height: clamp(156rem, 28vw, 220rem); display: grid; place-items: center; color: var(--mr-ink); }
.mind-reader__brain { position: relative; z-index: 2; width: 77%; height: 77%; filter: drop-shadow(7rem 8rem 0 color-mix(in srgb, var(--mr-ink) 16%, transparent)); }
.mind-reader__sun { position: absolute; z-index: 1; top: 0; right: 0; width: 40%; height: 40%; border-radius: 50%; background: var(--mr-cobalt); }
.mind-reader__burst { position: absolute; width: 19rem; height: 19rem; background: var(--mr-ink); transform: rotate(45deg); }
.mind-reader__burst--one { top: 10%; left: 2%; }
.mind-reader__burst--two { right: 1%; bottom: 3%; width: 13rem; height: 13rem; background: var(--mr-cobalt); }
.mind-reader__eyebrow { margin: 0; color: var(--mr-cobalt); font: 800 11rem/1.2 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; }
.mind-reader__intro h1 { margin: 20rem 0 16rem; font: 500 clamp(54rem, 9vw, 96rem)/.85 var(--font-display); letter-spacing: -.07em; text-transform: uppercase; }
.mind-reader__intro h1 span { color: var(--mr-cobalt); }
.mind-reader__intro-copy { max-width: 390rem; margin: 0; color: color-mix(in srgb, var(--mr-ink) 74%, transparent); font-size: clamp(16rem, 2vw, 20rem); line-height: 1.45; }
.mind-reader__primary, .mind-reader__ready, .mind-reader__retry { border: var(--stroke) solid var(--mr-ink); border-radius: var(--radius-s); cursor: pointer; font: 800 14rem/1 var(--font-ui); transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.mind-reader__primary { width: min(100%, 360rem); margin-top: 25rem; padding: 17rem 24rem; color: var(--mr-paper); background: var(--mr-cobalt); box-shadow: 5rem 5rem 0 var(--mr-ink); }
.mind-reader__primary span, .mind-reader__ready span, .mind-reader__retry span { margin-left: 9rem; font-size: 18rem; }
.mind-reader__primary:hover, .mind-reader__ready:hover, .mind-reader__retry:hover { transform: translateY(-2rem); }
.mind-reader__board { padding-bottom: 10rem; }
.mind-reader__board-top { display: flex; align-items: end; justify-content: space-between; gap: 18rem; margin: 0 0 20rem; }
.mind-reader__board-top h1 { margin: 10rem 0 0; font: 500 clamp(48rem, 8vw, 90rem)/.84 var(--font-display); letter-spacing: -.07em; text-transform: uppercase; }
.mind-reader__new-round { padding: 10rem 13rem; color: var(--mr-ink); background: transparent; border: var(--stroke) solid var(--mr-ink); border-radius: var(--radius-s); cursor: pointer; font: 800 12rem/1.1 var(--font-ui); }
.mind-reader__new-round span { margin-left: 6rem; font-size: 17rem; }
.mind-reader__card { position: relative; overflow: hidden; padding: clamp(17rem, 3vw, 30rem); color: var(--mr-ink); background: color-mix(in srgb, var(--mr-paper-2) 74%, var(--mr-yellow)); border: var(--stroke) solid var(--mr-ink); border-radius: var(--radius-l); box-shadow: 7rem 7rem 0 var(--mr-ink); }
.mind-reader__steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 13rem; padding-bottom: 24rem; border-bottom: var(--stroke) solid color-mix(in srgb, var(--mr-ink) 20%, transparent); }
.mind-reader__step { display: grid; grid-template-columns: auto 1fr; align-items: start; gap: 9rem; font-size: 14rem; line-height: 1.35; }
.mind-reader__step > span { color: var(--mr-cobalt); font: 800 11rem/1.3 var(--font-mono); }
.mind-reader__step p { margin: 0; }
.mind-reader__step strong { color: var(--mr-cobalt); }
.mind-reader__grid-label { display: flex; justify-content: space-between; gap: 15rem; padding: 20rem 0 10rem; color: color-mix(in srgb, var(--mr-ink) 56%, transparent); font: 800 10rem/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.mind-reader__grid { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 4rem 2rem; padding: 12rem 4rem 15rem; border-top: 1rem solid color-mix(in srgb, var(--mr-ink) 25%, transparent); border-bottom: 1rem solid color-mix(in srgb, var(--mr-ink) 25%, transparent); }
.mind-reader__grid-item { display: flex; min-width: 0; min-height: 48rem; flex-direction: column; align-items: center; justify-content: center; gap: 4rem; border: 1rem solid color-mix(in srgb, var(--mr-ink) 12%, transparent); background: color-mix(in srgb, var(--mr-paper) 50%, transparent); }
.mind-reader__number { color: color-mix(in srgb, var(--mr-ink) 61%, transparent); font: 800 clamp(9rem, 1.2vw, 12rem)/1 var(--font-mono); }
.mind-reader__grid-item svg { width: clamp(13rem, 2vw, 20rem); height: clamp(13rem, 2vw, 20rem); }
.mind-reader__card-footer { display: flex; align-items: center; justify-content: space-between; gap: 18rem; padding-top: 19rem; }
.mind-reader__card-footer p { max-width: 420rem; margin: 0; color: color-mix(in srgb, var(--mr-ink) 63%, transparent); font-size: 13rem; line-height: 1.45; }
.mind-reader__ready { flex: none; padding: 14rem 18rem; color: var(--mr-paper); background: var(--mr-cobalt); }
.mind-reader__reveal { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; padding: 22rem; background: color-mix(in srgb, var(--mr-yellow) 84%, var(--mr-paper)); backdrop-filter: blur(5rem); animation: mind-reader-fade-in 240ms var(--ease-out); }
.mind-reader__reveal-inner { display: flex; max-width: 410rem; flex-direction: column; align-items: center; text-align: center; }
.mind-reader__reveal-kicker { margin: 0 0 16rem; color: color-mix(in srgb, var(--mr-ink) 57%, transparent); font: 800 11rem/1.2 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; }
.mind-reader__reveal-symbol { width: 88rem; height: 88rem; margin-bottom: 13rem; animation: mind-reader-pop 500ms var(--ease-spring); }
.mind-reader__reveal-name { color: var(--mr-cobalt); font: 500 clamp(38rem, 6vw, 62rem)/.9 var(--font-display); letter-spacing: -.05em; text-transform: uppercase; }
.mind-reader__reveal-note { max-width: 360rem; margin: 18rem 0 22rem; color: color-mix(in srgb, var(--mr-ink) 68%, transparent); font-size: 14rem; line-height: 1.45; }
.mind-reader__retry { padding: 13rem 18rem; color: var(--mr-ink); background: var(--mr-paper); }
.mind-reader__footnote { margin: 18rem 0 0; color: color-mix(in srgb, var(--mr-ink) 55%, transparent); font: 400 11rem/1.35 var(--font-mono); text-align: center; }
@keyframes mind-reader-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes mind-reader-pop { 0% { opacity: 0; transform: scale(.3) rotate(-10deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@media (max-width: 680px) {
  .mind-reader__header { grid-template-columns: 1fr auto; }
  .mind-reader__brand { display: none; }
  .mind-reader__intro { min-height: calc(100dvh - 170rem); box-shadow: 5rem 5rem 0 var(--mr-ink); }
  .mind-reader__board-top { align-items: start; flex-direction: column; }
  .mind-reader__new-round { align-self: flex-start; }
  .mind-reader__steps { grid-template-columns: 1fr; gap: 10rem; padding-bottom: 18rem; }
  .mind-reader__step { grid-template-columns: 28rem 1fr; }
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
  .mind-reader__primary, .mind-reader__ready, .mind-reader__retry { transition: none; }
  .mind-reader__reveal { animation: none; }
  .mind-reader__reveal-symbol { animation: none; }
}
</style>
