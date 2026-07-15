<script setup lang="ts">
import StrengthBar from './StrengthBar.vue'
import { strengthRemark } from '~/utils/strong/content'

const store = useStrongStore()
const emit = defineEmits<{ restart: [] }>()

const attempt = computed(() => store.latestAttempt)
const best = computed(() => store.best)

const timeLabel = computed(() => {
  const s = store.elapsedSeconds()
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m} min ${r} s` : `${r} s`
})
</script>

<template>
  <section class="st-screen st-screen--narrow st-ty">
    <p class="st-eyebrow">Result</p>
    <h2 class="st-h2">You can read a password now</h2>

    <div class="st-ty__stats">
      <div class="st-ty__stat">
        <span class="st-ty__stat-val st-num">{{ Math.round(store.bestBits) }}<small>bits</small></span>
        <span class="st-ty__stat-label">strongest you built</span>
      </div>
      <div v-if="attempt" class="st-ty__stat">
        <span class="st-ty__stat-val st-num">{{ Math.round(attempt.score * 100) }}<small>%</small></span>
        <span class="st-ty__stat-label">on the assessment</span>
      </div>
      <div class="st-ty__stat">
        <span class="st-ty__stat-val st-num">{{ timeLabel }}</span>
        <span class="st-ty__stat-label">time in the module</span>
      </div>
    </div>

    <div v-if="best" class="st-ty__bar">
      <p class="st-ty__bar-label">
        The strongest password you built {{ best.usedPassphrase ? 'was a passphrase' : 'reached this' }}, worth {{ Math.round(best.effBits) }} bits.
      </p>
      <StrengthBar :bits="store.bestBits" />
      <p class="st-note st-ty__remark">{{ strengthRemark(store.bestBits) }}</p>
    </div>

    <div class="st-ty__recap">
      <p class="st-ty__recap-h">The three things worth keeping</p>
      <ol class="st-ty__list">
        <li><b>Strength is bits.</b> Bits are log₂ of how many passwords are possible, and each bit doubles the attacker's work.</li>
        <li><b>Length buys the most bits.</b> It is the exponent on the pool, so a longer password beats a shorter one loaded with symbols.</li>
        <li><b>Unpredictability is everything.</b> A guessable word barely counts, whatever you dress it in. A handful of random words is strong and memorable.</li>
      </ol>
    </div>

    <div class="st-ty__actions">
      <NuxtLink to="/" class="st-btn st-btn--primary">Back to the site</NuxtLink>
      <button type="button" class="st-btn st-btn--ghost" @click="emit('restart')">Run it again</button>
    </div>
  </section>
</template>

<style scoped>
.st-ty__stats { display: flex; gap: 30rem; flex-wrap: wrap; margin: 26rem 0 30rem; }
.st-ty__stat { display: flex; flex-direction: column; gap: 3rem; }
.st-ty__stat-val { font-family: var(--st-display); font-weight: 700; font-size: 42rem; line-height: 1; }
.st-ty__stat-val small { font-size: 16rem; color: var(--st-muted); margin-left: 4rem; }
.st-ty__stat-label { font-size: 13rem; color: var(--st-muted); }

.st-ty__bar { background: var(--st-panel); border: 1px solid var(--st-line); border-radius: 14rem; padding: 20rem; margin-bottom: 24rem; }
.st-ty__bar-label { font-family: var(--st-mono); font-size: 11.5rem; color: var(--st-muted); margin-bottom: 16rem; }
.st-ty__remark { margin-top: 14rem; }

.st-ty__recap { margin-bottom: 30rem; }
.st-ty__recap-h { font-family: var(--st-display); font-weight: 600; font-size: 16rem; margin-bottom: 14rem; }
.st-ty__list { margin: 0; padding-left: 20rem; display: flex; flex-direction: column; gap: 12rem; }
.st-ty__list li { font-size: 14.5rem; line-height: 1.6; color: var(--st-muted-strong); }
.st-ty__list b { color: var(--st-text); font-weight: 600; }

.st-ty__actions { display: flex; gap: 12rem; flex-wrap: wrap; }
.st-ty__actions .st-btn { text-decoration: none; }
</style>
