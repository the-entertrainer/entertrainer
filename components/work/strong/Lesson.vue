<script setup lang="ts">
import StrengthBar from './StrengthBar.vue'
import CrackTimes from './CrackTimes.vue'
import { CHAR_CLASSES, naiveBits, analyze, sciNotation } from '~/utils/strong/crypto'

const props = defineProps<{ step: number }>()
const open = ref(false)

// step 2 calculator
const enabled = reactive<Record<string, boolean>>({ lower: true, upper: false, digit: false, symbol: false })
const length = ref(8)
const pool = computed(() => CHAR_CLASSES.reduce((n, c) => n + (enabled[c.id] ? c.size : 0), 0))
const possLog10 = computed(() => pool.value >= 1 ? length.value * Math.log10(pool.value) : 0)
const bits = computed(() => pool.value > 1 ? length.value * Math.log2(pool.value) : 0)

// step 3
const short = 'K7#mQ2$p'
const long = 'mkplqzrtwvbnhxjd'
const shortBits = naiveBits(short)
const longBits = naiveBits(long)

// step 5
const weak = analyze('P@ssw0rd')
</script>

<template>
  <section class="st-card st-lesson">
    <p class="st-eyebrow">Lesson · {{ step }} of 5</p>

    <!-- 1: the haystack -->
    <template v-if="step === 1">
      <h2 class="st-h2">Strength is the size of a&nbsp;haystack</h2>
      <p class="st-lead st-lesson__line">The attacker guesses. So strength is just how many passwords they would have to try.</p>
      <p class="st-lesson__formula st-num">pool<sup>length</sup></p>
      <button type="button" class="st-reveal" :class="{ 'is-open': open }" @click="open = !open">
        why those two things?
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <p v-if="open" class="st-body st-revealbody">The pool is how many different characters you draw from. The length is how many you use. Every possible password is one combination of the two, so the count is the pool raised to the length.</p>
    </template>

    <!-- 2: count it -->
    <template v-else-if="step === 2">
      <h2 class="st-h2">Count the haystack</h2>
      <p class="st-lead st-lesson__line">Add character types, drag the length. Watch length grow the count fastest.</p>
      <div class="st-calc">
        <div class="st-calc__classes">
          <button v-for="c in CHAR_CLASSES" :key="c.id" type="button" class="st-chip" :class="{ 'is-on': enabled[c.id] }" :aria-pressed="enabled[c.id]" @click="enabled[c.id] = !enabled[c.id]">{{ c.label }} <span class="st-chip__size st-num">+{{ c.size }}</span></button>
        </div>
        <div class="st-calc__len">
          <label for="st-len" class="st-calc__len-label">Length <b class="st-num">{{ length }}</b></label>
          <input id="st-len" type="range" min="4" max="24" v-model.number="length" class="st-range" />
        </div>
        <div class="st-calc__out">
          <div class="st-calc__cell"><span class="st-calc__k">Pool</span><span class="st-calc__v st-num">{{ pool }}</span></div>
          <div class="st-calc__cell"><span class="st-calc__k">Possibilities</span><span class="st-calc__v st-num">{{ sciNotation(possLog10) }}</span></div>
          <div class="st-calc__cell"><span class="st-calc__k">Entropy</span><span class="st-calc__v st-num">{{ Math.round(bits) }} <small>bits</small></span></div>
        </div>
        <p class="st-calc__formula st-num">{{ length }} × log₂({{ pool || 1 }}) = {{ Math.round(bits) }} bits</p>
      </div>
    </template>

    <!-- 3: length wins -->
    <template v-else-if="step === 3">
      <h2 class="st-h2">Length beats symbols</h2>
      <p class="st-lead st-lesson__line">A short password with every trick, against a longer one that is only lowercase.</p>
      <div class="st-versus">
        <div class="st-versus__card">
          <p class="st-versus__label">8 chars, every type</p>
          <p class="st-versus__pw st-num">{{ short }}</p>
          <StrengthBar :bits="shortBits" compact />
        </div>
        <div class="st-versus__card st-versus__card--win">
          <p class="st-versus__label">16 chars, lowercase</p>
          <p class="st-versus__pw st-num">{{ long }}</p>
          <StrengthBar :bits="longBits" compact />
        </div>
      </div>
      <button type="button" class="st-reveal" :class="{ 'is-open': open }" @click="open = !open">
        why is it not close?
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <p v-if="open" class="st-body st-revealbody">Adding a character type only widens the pool. Adding length raises that pool to a higher power. Length is the exponent, so it wins every time.</p>
    </template>

    <!-- 4: three attackers -->
    <template v-else-if="step === 4">
      <h2 class="st-h2">Same password. Three&nbsp;attackers.</h2>
      <p class="st-lead st-lesson__line">Crack time depends on how the site stored it, not just the password.</p>
      <div class="st-lesson__panel">
        <p class="st-versus__pw st-num st-lesson__example">river9-KITE-mango</p>
        <CrackTimes :bits="naiveBits('river9-KITE-mango')" />
      </div>
      <button type="button" class="st-reveal" :class="{ 'is-open': open }" @click="open = !open">
        why so different?
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <p v-if="open" class="st-body st-revealbody">A rate-limited login allows a few guesses a second. A leaked list of fast, unsalted hashes lets one graphics card try a hundred billion a second. Same haystack, wildly different speed.</p>
    </template>

    <!-- 5: the lie -->
    <template v-else>
      <h2 class="st-h2">The math lies when it is guessable</h2>
      <p class="st-lead st-lesson__line">Real passwords are not random, and crackers know it.</p>
      <div class="st-lesson__panel">
        <p class="st-versus__pw st-num st-lesson__example">P@ssw0rd</p>
        <StrengthBar :bits="weak.effBits" :naive="weak.naiveBits" />
      </div>
      <button type="button" class="st-reveal" :class="{ 'is-open': open }" @click="open = !open">
        why does it collapse?
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <p v-if="open" class="st-body st-revealbody">{{ weak.guessReason }} The way out is real unpredictability you can still remember: a few random words. You will build one next.</p>
    </template>
  </section>
</template>

<style scoped>
.st-lesson__line { margin: 24rem 0 0; max-width: 38ch; }
.st-lesson__formula { margin: 44rem 0 10rem; font-size: clamp(50rem, 9.5vw, 92rem); font-weight: 500; color: var(--st-accent); line-height: 1; }
.st-lesson__formula sup { font-size: 0.5em; }
.st-lesson__panel { margin: 36rem 0 22rem; background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 16rem; padding: 26rem; }
.st-lesson__example { margin-bottom: 20rem; font-size: 17rem; }

/* calculator */
.st-calc { margin: 36rem 0 0; background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 16rem; padding: 26rem; }
.st-calc__classes { display: flex; flex-wrap: wrap; gap: 8rem; margin-bottom: 18rem; }
.st-chip { display: inline-flex; align-items: center; gap: 7rem; padding: 9rem 13rem; border-radius: 8rem; border: 1px solid var(--st-line); background: var(--st-slot); font-size: 13.5rem; color: var(--st-muted); transition: all 0.14s ease; }
.st-chip__size { font-size: 11rem; opacity: 0.7; }
.st-chip.is-on { border-color: var(--st-accent); color: var(--st-text); background: color-mix(in srgb, var(--st-accent) 12%, transparent); }
@media (hover: hover) { .st-chip:hover { border-color: var(--st-line-strong); } }
.st-chip:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-calc__len { margin-bottom: 18rem; }
.st-calc__len-label { display: block; font-size: 13rem; color: var(--st-muted); margin-bottom: 8rem; }
.st-calc__len-label b { color: var(--st-text); font-size: 15rem; margin-left: 4rem; }
.st-calc__out { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10rem; margin-bottom: 14rem; }
.st-calc__cell { background: var(--st-slot); border-radius: 10rem; padding: 12rem 14rem; }
.st-calc__k { display: block; font-family: var(--st-mono); font-size: 10.5rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--st-muted); margin-bottom: 6rem; }
.st-calc__v { font-size: 19rem; font-weight: 600; color: var(--st-text); }
.st-calc__v small { font-size: 11rem; color: var(--st-muted); }
.st-calc__formula { padding-top: 12rem; border-top: 1px solid var(--st-line); font-size: 13rem; color: var(--st-muted-strong); }

.st-range { -webkit-appearance: none; appearance: none; width: 100%; height: 6rem; border-radius: 999rem; background: var(--st-slot); outline: none; }
.st-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20rem; height: 20rem; border-radius: 50%; background: var(--st-accent); cursor: pointer; border: 3px solid var(--st-panel); }
.st-range::-moz-range-thumb { width: 18rem; height: 18rem; border-radius: 50%; background: var(--st-accent); cursor: pointer; border: 3px solid var(--st-panel); }
.st-range:focus-visible { outline: 2px solid var(--st-text); outline-offset: 3px; }

.st-versus { display: grid; grid-template-columns: 1fr 1fr; gap: 16rem; margin: 36rem 0 8rem; }
.st-versus__card { background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 12rem; padding: 16rem; }
.st-versus__card--win { border-color: color-mix(in srgb, var(--st-t3) 55%, var(--st-line)); }
.st-versus__label { font-family: var(--st-mono); font-size: 11rem; color: var(--st-muted); margin-bottom: 10rem; }
.st-versus__pw { font-size: 15rem; color: var(--st-text); word-break: break-all; margin-bottom: 14rem; }

@media (max-width: 560px) {
  .st-calc, .st-lesson__panel { padding: 16rem; }
  .st-calc__out { grid-template-columns: 1fr; }
  .st-versus { grid-template-columns: 1fr; }
}
</style>
