<script setup lang="ts">
import Sequencer from './Sequencer.vue'
import { matchRemark } from '~/utils/groove/content'
import { clonePattern, countHits } from '~/utils/groove/patterns'

const store = useGrooveStore()
const emit = defineEmits<{ restart: [] }>()

const yourGroove = ref(clonePattern(store.userPattern))
const attempt = computed(() => store.latestAttempt)
const hits = computed(() => countHits(store.userPattern))

const timeLabel = computed(() => {
  const s = store.elapsedSeconds()
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m} min ${r} s` : `${r} s`
})
</script>

<template>
  <section class="gv-screen gv-screen--narrow gv-ty">
    <p class="gv-eyebrow">Result</p>
    <h2 class="gv-h2">You built a beat</h2>

    <div class="gv-ty__stats">
      <div class="gv-ty__stat">
        <span class="gv-ty__stat-val">{{ Math.round(store.bestMatch * 100) }}<small>%</small></span>
        <span class="gv-ty__stat-label">best groove match</span>
      </div>
      <div v-if="attempt" class="gv-ty__stat">
        <span class="gv-ty__stat-val">{{ Math.round(attempt.score * 100) }}<small>%</small></span>
        <span class="gv-ty__stat-label">on the assessment</span>
      </div>
      <div class="gv-ty__stat">
        <span class="gv-ty__stat-val gv-ty__stat-val--mono">{{ timeLabel }}</span>
        <span class="gv-ty__stat-label">time in the module</span>
      </div>
    </div>

    <div v-if="hits > 0" class="gv-ty__groove">
      <p class="gv-ty__groove-label">The groove you built. Press play whenever you like.</p>
      <Sequencer :model-value="yourGroove" :editable="false" :bpm="94" label="your groove" />
    </div>

    <p class="gv-lead gv-ty__remark">{{ matchRemark(store.bestMatch) }}</p>
    <p class="gv-note gv-ty__idea">
      The whole module was one idea: three sounds and a grid. Where you place the kick, snare, and
      hats is what makes a pulse feel like rock, house, or a breakbeat. Producers with racks of gear
      are still doing this, on a bigger grid.
    </p>

    <div class="gv-ty__actions">
      <NuxtLink to="/" class="gv-btn gv-btn--primary">Back to the site</NuxtLink>
      <button type="button" class="gv-btn gv-btn--ghost" @click="emit('restart')">Run it again</button>
    </div>
  </section>
</template>

<style scoped>
.gv-ty__stats { display: flex; gap: 30rem; flex-wrap: wrap; margin: 26rem 0 30rem; }
.gv-ty__stat { display: flex; flex-direction: column; gap: 3rem; }
.gv-ty__stat-val { font-family: var(--gv-display); font-weight: 900; font-size: 44rem; line-height: 1; }
.gv-ty__stat-val--mono { font-family: var(--gv-mono); font-size: 32rem; font-weight: 700; }
.gv-ty__stat-val small { font-size: 18rem; color: var(--gv-muted); margin-left: 3rem; }
.gv-ty__stat-label { font-size: 13rem; color: var(--gv-muted); }

.gv-ty__groove {
  background: var(--gv-panel);
  border: 1px solid var(--gv-line);
  border-radius: 14rem;
  padding: 20rem;
  margin-bottom: 24rem;
}
.gv-ty__groove-label { font-family: var(--gv-mono); font-size: 11.5rem; color: var(--gv-muted); margin-bottom: 16rem; }
.gv-ty__remark { margin-bottom: 14rem; }
.gv-ty__idea { max-width: 62ch; }
.gv-ty__actions { margin-top: 30rem; display: flex; gap: 12rem; flex-wrap: wrap; }
.gv-ty__actions .gv-btn { text-decoration: none; }
</style>
