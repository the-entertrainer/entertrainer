<script setup lang="ts">
import StrengthBar from './StrengthBar.vue'
import { strengthRemark } from '~/utils/strong/content'

const store = useStrongStore()
const emit = defineEmits<{ restart: [] }>()

const attempt = computed(() => store.latestAttempt)
const best = computed(() => store.best)
const open = ref(false)

const timeLabel = computed(() => {
  const s = store.elapsedSeconds()
  const m = Math.floor(s / 60)
  return m > 0 ? `${m} min ${s % 60} s` : `${s} s`
})
</script>

<template>
  <section class="st-card st-ty">
    <p class="st-eyebrow">Result</p>
    <h2 class="st-h2">You can read a password now</h2>

    <div class="st-ty__stats">
      <div class="st-ty__stat">
        <span class="st-ty__stat-val st-num">{{ Math.round(store.bestBits) }}<small>bits</small></span>
        <span class="st-ty__stat-label">strongest you built</span>
      </div>
      <div v-if="attempt" class="st-ty__stat">
        <span class="st-ty__stat-val st-num">{{ Math.round(attempt.score * 100) }}<small>%</small></span>
        <span class="st-ty__stat-label">on the check</span>
      </div>
      <div class="st-ty__stat">
        <span class="st-ty__stat-val st-num">{{ timeLabel }}</span>
        <span class="st-ty__stat-label">time taken</span>
      </div>
    </div>

    <div v-if="best" class="st-ty__bar">
      <StrengthBar :bits="store.bestBits" />
    </div>
    <p class="st-lead st-ty__remark">{{ strengthRemark(store.bestBits) }}</p>

    <button type="button" class="st-reveal" :class="{ 'is-open': open }" @click="open = !open">
      the three things worth keeping
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
    </button>
    <ol v-if="open" class="st-ty__list st-revealbody">
      <li><b>Strength is bits</b>, and each bit doubles the attacker's work.</li>
      <li><b>Length buys the most bits</b>, because it is the exponent.</li>
      <li><b>Unpredictability is everything.</b> A few random words beat any clever word.</li>
    </ol>

    <div class="st-ty__actions">
      <NuxtLink to="/" class="st-btn st-btn--primary">Back to the site</NuxtLink>
      <button type="button" class="st-btn st-btn--ghost" @click="emit('restart')">Run it again</button>
    </div>
  </section>
</template>

<style scoped>
.st-ty__stats { display: flex; gap: 34rem; flex-wrap: wrap; margin: 28rem 0 28rem; }
.st-ty__stat { display: flex; flex-direction: column; gap: 4rem; }
.st-ty__stat-val { font-family: var(--st-display); font-weight: 700; font-size: 46rem; line-height: 1; }
.st-ty__stat-val small { font-size: 16rem; color: var(--st-muted); margin-left: 4rem; }
.st-ty__stat-label { font-size: 13rem; color: var(--st-muted); }
.st-ty__bar { background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 14rem; padding: 20rem; margin-bottom: 16rem; }
.st-ty__remark { max-width: 52ch; margin-bottom: 8rem; }
.st-ty__list { margin: 0; padding-left: 20rem; display: flex; flex-direction: column; gap: 10rem; }
.st-ty__list li { font-size: 14.5rem; line-height: 1.55; color: var(--st-muted-strong); }
.st-ty__list b { color: var(--st-text); font-weight: 600; }
.st-ty__actions { margin-top: 34rem; display: flex; gap: 12rem; flex-wrap: wrap; }
.st-ty__actions .st-btn { text-decoration: none; }
</style>
