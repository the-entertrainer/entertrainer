<script setup lang="ts">
import StrengthBar from './StrengthBar.vue'
import CrackTimes from './CrackTimes.vue'
import { CHAR_CLASSES, naiveBits, analyze, sciNotation } from '~/utils/strong/crypto'

const store = useStrongStore()
const emit = defineEmits<{ back: []; continue: [] }>()

// Segment 02: the interactive haystack counter.
const enabled = reactive<Record<string, boolean>>({ lower: true, upper: false, digit: false, symbol: false })
const length = ref(8)
const pool = computed(() => CHAR_CLASSES.reduce((n, c) => n + (enabled[c.id] ? c.size : 0), 0))
const possLog10 = computed(() => pool.value >= 1 ? length.value * Math.log10(pool.value) : 0)
const bits = computed(() => pool.value > 1 ? length.value * Math.log2(pool.value) : 0)

// Segment 03: length beats symbols. Two honest examples.
const short = 'K7#mQ2$p'          // 8 chars, all four types
const long = 'mkplqzrtwvbnhxjd'   // 16 chars, lowercase only
const shortBits = naiveBits(short)
const longBits = naiveBits(long)

// Segment 05: naive entropy lies.
const weak = analyze('P@ssw0rd')

onMounted(() => store.markLessonComplete())
</script>

<template>
  <section class="st-screen st-lesson">
    <button type="button" class="st-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Menu
    </button>
    <p class="st-eyebrow">Lesson</p>
    <h2 class="st-h2 st-lesson__title">What makes a password strong</h2>

    <!-- 01 -->
    <article class="st-seg">
      <div class="st-seg__num st-num">01</div>
      <div class="st-seg__body">
        <h3 class="st-seg__h">Strength is the size of the haystack</h3>
        <p class="st-body">
          An attacker who wants your password guesses, over and over. So its strength is just how
          many guesses it would take to find it, which is how many passwords are possible in the
          first place. Two things set that count: how many characters you draw from (the pool), and
          how long the password is. The number of possibilities is the pool raised to the length.
        </p>
        <p class="st-lesson__formula st-num">possibilities = pool<sup>length</sup></p>
      </div>
    </article>

    <!-- 02 interactive -->
    <article class="st-seg">
      <div class="st-seg__num st-num">02</div>
      <div class="st-seg__body">
        <h3 class="st-seg__h">Count the haystack yourself</h3>
        <p class="st-body">
          Turn character types on and off, and drag the length. The pool is the sum of the types you
          include. Watch how much faster length grows the count than adding a whole new type does.
        </p>
        <div class="st-calc">
          <div class="st-calc__classes">
            <button
              v-for="c in CHAR_CLASSES" :key="c.id" type="button"
              class="st-chip" :class="{ 'is-on': enabled[c.id] }"
              :aria-pressed="enabled[c.id]" @click="enabled[c.id] = !enabled[c.id]"
            >{{ c.label }} <span class="st-chip__size st-num">+{{ c.size }}</span></button>
          </div>
          <div class="st-calc__len">
            <label for="st-len" class="st-calc__len-label">Length <b class="st-num">{{ length }}</b></label>
            <input id="st-len" type="range" min="4" max="24" v-model.number="length" class="st-range" />
          </div>
          <div class="st-calc__out">
            <div class="st-calc__cell">
              <span class="st-calc__k">Pool</span>
              <span class="st-calc__v st-num">{{ pool }}</span>
            </div>
            <div class="st-calc__cell">
              <span class="st-calc__k">Possibilities</span>
              <span class="st-calc__v st-num">{{ sciNotation(possLog10) }}</span>
            </div>
            <div class="st-calc__cell">
              <span class="st-calc__k">Entropy</span>
              <span class="st-calc__v st-num">{{ Math.round(bits) }} <small>bits</small></span>
            </div>
          </div>
          <p class="st-calc__formula st-num">
            bits = length × log₂(pool) = {{ length }} × {{ pool >= 1 ? Math.log2(pool || 1).toFixed(2) : '0' }} = {{ Math.round(bits) }}
          </p>
        </div>
      </div>
    </article>

    <!-- 03 -->
    <article class="st-seg">
      <div class="st-seg__num st-num">03</div>
      <div class="st-seg__body">
        <h3 class="st-seg__h">Length beats symbols, and it is not close</h3>
        <p class="st-body">
          Adding a character type only makes the pool bigger. Adding length raises that pool to a
          higher power. Since length is the exponent, it wins. Here is a short password using every
          trick, next to a longer one that is only lowercase letters.
        </p>
        <div class="st-versus">
          <div class="st-versus__card">
            <p class="st-versus__label">8 characters, all four types</p>
            <p class="st-versus__pw st-num">{{ short }}</p>
            <StrengthBar :bits="shortBits" compact />
          </div>
          <div class="st-versus__vs" aria-hidden="true">beats</div>
          <div class="st-versus__card st-versus__card--win">
            <p class="st-versus__label">16 characters, lowercase only</p>
            <p class="st-versus__pw st-num">{{ long }}</p>
            <StrengthBar :bits="longBits" compact />
          </div>
        </div>
        <p class="st-note st-seg__foot">
          The boring long one is worth about {{ Math.round(longBits) }} bits against the clever short
          one's {{ Math.round(shortBits) }}. Every extra character multiplies the work; every extra
          symbol type only adds to it.
        </p>
      </div>
    </article>

    <!-- 04 -->
    <article class="st-seg">
      <div class="st-seg__num st-num">04</div>
      <div class="st-seg__body">
        <h3 class="st-seg__h">The same password, three attackers</h3>
        <p class="st-body">
          Crack time is the haystack divided by how fast the attacker can guess, and that speed is
          not fixed. It depends on how the site stored your password. A login page with rate limits
          allows a handful of guesses a second. A leaked list of fast, unsalted hashes lets a single
          graphics card try a hundred billion a second. The password below does not change. Only the
          attacker does.
        </p>
        <div class="st-seg__panel">
          <p class="st-versus__pw st-num st-seg__example">{{ 'river9-KITE-mango' }}</p>
          <CrackTimes :bits="naiveBits('river9-KITE-mango')" />
        </div>
      </div>
    </article>

    <!-- 05 signature idea -->
    <article class="st-seg st-seg--signature">
      <div class="st-seg__num st-num">05</div>
      <div class="st-seg__body">
        <h3 class="st-seg__h">The formula lies when a password is guessable</h3>
        <p class="st-body">
          The math so far assumes every character is a coin flip. Real passwords are not random.
          Crackers do not brute-force blindly; they run wordlists first and apply obvious tweaks,
          swapping a for @, o for zero, and tacking a digit on the end. So a word dressed up with
          substitutions has almost none of the strength its character mix suggests.
        </p>
        <div class="st-seg__panel">
          <p class="st-versus__pw st-num st-seg__example">P@ssw0rd</p>
          <StrengthBar :bits="weak.effBits" :naive="weak.naiveBits" />
          <p class="st-note st-lesson__collapse">{{ weak.guessReason }}</p>
        </div>
        <p class="st-body st-lesson__fix">
          The way out is real unpredictability you can still remember: several words chosen at
          random. Each random word from a list adds about log₂ of the list size in bits, so a few of
          them reach strong territory while staying a phrase you can picture. You will build one in
          the lab.
        </p>
      </div>
    </article>

    <div class="st-lesson__actions">
      <button type="button" class="st-btn st-btn--primary" @click="emit('continue')">
        Open the password lab
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.st-lesson__title { max-width: 20ch; margin-bottom: 12rem; }
.st-seg { display: grid; grid-template-columns: 44rem 1fr; gap: 12rem; padding: 34rem 0; border-top: 1px solid var(--st-line); }
.st-seg:first-of-type { border-top: none; }
.st-seg__num { font-size: 14rem; color: var(--st-accent); padding-top: 4rem; }
.st-seg__h { font-family: var(--st-display); font-weight: 600; font-size: 21rem; margin-bottom: 12rem; letter-spacing: -0.01em; }
.st-body { max-width: 64ch; margin-bottom: 4rem; }
.st-seg__foot { margin-top: 14rem; max-width: 62ch; }
.st-lesson__formula { margin-top: 14rem; font-size: 18rem; color: var(--st-accent); }
.st-lesson__formula sup { font-size: 0.65em; }

.st-seg__panel { margin-top: 20rem; background: var(--st-panel); border: 1px solid var(--st-line); border-radius: 14rem; padding: 20rem; }
.st-seg__example { margin-bottom: 16rem; font-size: 17rem; }

/* calculator */
.st-calc { margin-top: 20rem; background: var(--st-panel); border: 1px solid var(--st-line); border-radius: 14rem; padding: 20rem; }
.st-calc__classes { display: flex; flex-wrap: wrap; gap: 8rem; margin-bottom: 18rem; }
.st-chip {
  display: inline-flex; align-items: center; gap: 7rem; padding: 9rem 13rem;
  border-radius: 8rem; border: 1px solid var(--st-line); background: var(--st-slot);
  font-size: 13.5rem; color: var(--st-muted); transition: all 0.14s ease;
}
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

/* range */
.st-range { -webkit-appearance: none; appearance: none; width: 100%; height: 6rem; border-radius: 999rem; background: var(--st-slot); outline: none; }
.st-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20rem; height: 20rem; border-radius: 50%; background: var(--st-accent); cursor: pointer; border: 3px solid var(--st-panel); }
.st-range::-moz-range-thumb { width: 18rem; height: 18rem; border-radius: 50%; background: var(--st-accent); cursor: pointer; border: 3px solid var(--st-panel); }
.st-range:focus-visible { outline: 2px solid var(--st-text); outline-offset: 3px; }

/* versus */
.st-versus { display: grid; grid-template-columns: 1fr auto 1fr; gap: 14rem; align-items: center; margin-top: 20rem; }
.st-versus__card { background: var(--st-panel); border: 1px solid var(--st-line); border-radius: 12rem; padding: 16rem; }
.st-versus__card--win { border-color: color-mix(in srgb, var(--st-t3) 55%, var(--st-line)); }
.st-versus__label { font-family: var(--st-mono); font-size: 11rem; color: var(--st-muted); margin-bottom: 10rem; }
.st-versus__pw { font-size: 15rem; color: var(--st-text); word-break: break-all; margin-bottom: 14rem; }
.st-versus__vs { font-family: var(--st-mono); font-size: 11rem; color: var(--st-muted); text-transform: uppercase; letter-spacing: 0.08em; }
.st-lesson__collapse { margin-top: 12rem; }
.st-lesson__fix { margin-top: 18rem; }
.st-lesson__actions { margin-top: 24rem; padding-top: 30rem; border-top: 1px solid var(--st-line); }

@media (max-width: 640px) {
  .st-seg { grid-template-columns: 1fr; gap: 4rem; }
  .st-seg__num { padding-top: 0; }
  .st-calc, .st-seg__panel { padding: 16rem; }
  .st-calc__out { grid-template-columns: 1fr; }
  .st-versus { grid-template-columns: 1fr; }
  .st-versus__vs { justify-self: start; }
}
</style>
