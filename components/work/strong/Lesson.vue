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
      <h2 class="st-h2">Strength is the size of the haystack</h2>
      <p class="st-lead st-lesson__line">The attacker guesses. So password strength is simply how many tries the haystack demands.</p>
      <p class="st-lesson__formula st-num">pool<sup>length</sup></p>
      <button type="button" class="st-reveal" :class="{ 'is-open': open }" :aria-expanded="open" aria-controls="lesson-explanation" @click="open = !open">
        Why those two things?
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <p v-if="open" id="lesson-explanation" class="st-body st-revealbody">The pool is how many different characters you can draw from. The length is how many you use. Every password is one combination of those two, so the count is the pool raised to the length. That is the whole machine.</p>
    </template>

    <!-- 2: count it -->
    <template v-else-if="step === 2">
      <h2 class="st-h2">Count the haystack</h2>
      <p class="st-lead st-lesson__line">Add character types, then change the length. Watch which one makes the count grow faster.</p>
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
      <p class="st-lead st-lesson__line">A short password using every trick, compared with a longer one made only of lowercase letters.</p>
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
      <button type="button" class="st-reveal" :class="{ 'is-open': open }" :aria-expanded="open" aria-controls="lesson-explanation" @click="open = !open">
        Why isn’t it close?
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <p v-if="open" id="lesson-explanation" class="st-body st-revealbody">Adding a character type widens the pool. Adding length raises that pool to a higher power. Length is the exponent. That is why it keeps winning.</p>
    </template>

    <!-- 4: three attackers -->
    <template v-else-if="step === 4">
      <h2 class="st-h2">Same password. Three&nbsp;attackers.</h2>
      <p class="st-lead st-lesson__line">Crack time depends on how the site stored the password, not just on the password itself.</p>
      <div class="st-lesson__panel">
        <p class="st-versus__pw st-num st-lesson__example">river9-KITE-mango</p>
        <CrackTimes :bits="naiveBits('river9-KITE-mango')" />
      </div>
      <button type="button" class="st-reveal" :class="{ 'is-open': open }" :aria-expanded="open" aria-controls="lesson-explanation" @click="open = !open">
        Why so different?
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <p v-if="open" id="lesson-explanation" class="st-body st-revealbody">A rate-limited login allows only a few guesses per second. A leaked list of fast, unsalted hashes lets one graphics card try a hundred billion per second. Same haystack. Completely different speed.</p>
    </template>

    <!-- 5: the lie -->
    <template v-else>
      <h2 class="st-h2">The math lies when the password is guessable</h2>
      <p class="st-lead st-lesson__line">Real passwords are often not random. Crackers know that, and they start with the obvious guesses.</p>
      <div class="st-lesson__panel">
        <p class="st-versus__pw st-num st-lesson__example">P@ssw0rd</p>
        <StrengthBar :bits="weak.effBits" :naive="weak.naiveBits" />
      </div>
      <button type="button" class="st-reveal" :class="{ 'is-open': open }" :aria-expanded="open" aria-controls="lesson-explanation" @click="open = !open">
        Why does it collapse?
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <p v-if="open" id="lesson-explanation" class="st-body st-revealbody">{{ weak.guessReason }} The way out is real unpredictability you can still remember: a few random words. You will build one next.</p>
    </template>
  </section>
</template>

<style scoped>
.st-lesson__line { margin: 1.5rem 0 0; max-width: 38ch; }
.st-lesson__formula { margin: 2.75rem 0 0.625rem; font-size: clamp(3.125rem, 9.5vw, 5.75rem); font-weight: 500; color: var(--st-accent); line-height: 1; }
.st-lesson__formula sup { font-size: 0.75rem; }
.st-lesson__panel { margin: 2.25rem 0 1.375rem; background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 1rem; padding: 1.625rem; }
.st-lesson__example { margin-bottom: 1.25rem; font-size: 1.0625rem; }

/* calculator */
.st-calc { margin: 2.25rem 0 0; background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 1rem; padding: 1.625rem; }
.st-calc__classes { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.125rem; }
.st-chip { display: inline-flex; align-items: center; gap: 0.4375rem; padding: 0.5625rem 0.8125rem; border-radius: 0.5rem; border: 1px solid var(--st-line); background: var(--st-slot); font-size: 0.84375rem; color: var(--st-muted); transition: all 0.14s ease; }
.st-chip__size { font-size: 0.75rem; opacity: 0.7; }
.st-chip.is-on { border-color: var(--st-accent); color: var(--st-text); background: color-mix(in srgb, var(--st-accent) 12%, transparent); }
@media (hover: hover) { .st-chip:hover { border-color: var(--st-line-strong); } }
.st-chip:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-calc__len { margin-bottom: 1.125rem; }
.st-calc__len-label { display: block; font-size: 0.8125rem; color: var(--st-muted); margin-bottom: 0.5rem; }
.st-calc__len-label b { color: var(--st-text); font-size: 0.9375rem; margin-left: 0.25rem; }
.st-calc__out { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.625rem; margin-bottom: 0.875rem; }
.st-calc__cell { background: var(--st-slot); border-radius: 0.625rem; padding: 0.75rem 0.875rem; }
.st-calc__k { display: block; font-family: var(--st-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--st-muted); margin-bottom: 0.375rem; }
.st-calc__v { font-size: 1.1875rem; font-weight: 600; color: var(--st-text); }
.st-calc__v small { font-size: 0.75rem; color: var(--st-muted); }
.st-calc__formula { padding-top: 0.75rem; border-top: 1px solid var(--st-line); font-size: 0.8125rem; color: var(--st-muted-strong); }

.st-range { -webkit-appearance: none; appearance: none; width: 100%; height: 0.375rem; border-radius: 62.4375rem; background: var(--st-slot); outline: none; }
.st-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 1.25rem; height: 1.25rem; border-radius: 50%; background: var(--st-accent); cursor: pointer; border: 3px solid var(--st-panel); }
.st-range::-moz-range-thumb { width: 1.125rem; height: 1.125rem; border-radius: 50%; background: var(--st-accent); cursor: pointer; border: 3px solid var(--st-panel); }
.st-range:focus-visible { outline: 2px solid var(--st-text); outline-offset: 3px; }

.st-versus { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 2.25rem 0 0.5rem; }
.st-versus__card { background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 0.75rem; padding: 1rem; }
.st-versus__card--win { border-color: color-mix(in srgb, var(--st-t3) 55%, var(--st-line)); }
.st-versus__label { font-family: var(--st-mono); font-size: 0.75rem; color: var(--st-muted); margin-bottom: 0.625rem; }
.st-versus__pw { font-size: 0.9375rem; color: var(--st-text); word-break: break-all; margin-bottom: 0.875rem; }

@media (max-width: 560px) {
  .st-calc, .st-lesson__panel { padding: 1rem; }
  .st-calc__out { grid-template-columns: 1fr; }
  .st-versus { grid-template-columns: 1fr; }
}
</style>
