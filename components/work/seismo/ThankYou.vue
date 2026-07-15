<script setup lang="ts">
import { placementRemark } from '~/utils/seismo/content'
import { EPICENTRE, MAP_KM, STATIONS } from '~/utils/seismo/model'

const store = useSeismoStore()
const emit = defineEmits<{ restart: [] }>()

const placement = computed(() => store.placement)
const attempt = computed(() => store.latestAttempt)

const timeLabel = computed(() => {
  const s = store.elapsedSeconds()
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m} min ${r} s` : `${r} s`
})

// A small map showing where the learner placed vs the true epicentre.
const radii = computed<Record<string, number>>(() => {
  const out: Record<string, number> = {}
  for (const m of store.measurements) out[m.stationId] = m.distanceKm
  return out
})
</script>

<template>
  <section class="sg-screen sg-screen--narrow sg-ty">
    <p class="sg-eyebrow">Result</p>
    <h2 class="sg-h2">You located an earthquake</h2>

    <div class="sg-ty__grid">
      <figure class="sg-ty__map">
        <svg :viewBox="`0 0 ${MAP_KM} ${MAP_KM}`" role="img" aria-label="Your placement compared with the true epicentre.">
          <circle v-for="s in STATIONS" :key="s.id" :cx="s.x" :cy="s.y" :r="radii[s.id] || 0" class="sg-ty__circle" />
          <g v-for="s in STATIONS" :key="'s' + s.id"><path :d="`M${s.x} ${s.y - 8} l8 13 h-16 z`" class="sg-ty__stn" /></g>
          <g v-if="placement" :transform="`translate(${placement.x} ${placement.y})`"><circle r="6" class="sg-ty__pin" /></g>
          <g :transform="`translate(${EPICENTRE.x} ${EPICENTRE.y})`"><path d="M0 -11 L3 -3 L11 -3 L4 3 L6 11 L0 6 L-6 11 L-4 3 L-11 -3 L-3 -3 Z" class="sg-ty__epi" /></g>
        </svg>
        <figcaption class="sg-ty__legend">
          <span><i class="sg-ty__k-pin" />Your placement</span>
          <span><i class="sg-ty__k-epi" />True epicentre</span>
        </figcaption>
      </figure>

      <div class="sg-ty__stats">
        <div v-if="placement" class="sg-ty__stat">
          <span class="sg-ty__stat-val">{{ placement.errorKm }}<small>km</small></span>
          <span class="sg-ty__stat-label">from the real epicentre</span>
        </div>
        <div v-if="attempt" class="sg-ty__stat">
          <span class="sg-ty__stat-val">{{ Math.round(attempt.score * 100) }}<small>%</small></span>
          <span class="sg-ty__stat-label">on the assessment</span>
        </div>
        <div class="sg-ty__stat">
          <span class="sg-ty__stat-val sg-ty__stat-val--mono">{{ timeLabel }}</span>
          <span class="sg-ty__stat-label">time in the module</span>
        </div>
      </div>
    </div>

    <p v-if="placement" class="sg-lead sg-ty__remark">{{ placementRemark(placement.errorKm) }}</p>
    <p class="sg-note sg-ty__idea">
      The whole method reduces to one idea: the P wave outruns the S wave, so their gap is a
      distance, and three distances cross at a point. Real networks use dozens of stations and
      account for depth and the curve of the Earth, but the logic on your map is the logic they use.
    </p>

    <div class="sg-ty__actions">
      <NuxtLink to="/" class="sg-btn sg-btn--primary">Back to the site</NuxtLink>
      <button type="button" class="sg-btn sg-btn--ghost" @click="emit('restart')">Run it again</button>
    </div>
  </section>
</template>

<style scoped>
.sg-ty__grid { display: grid; grid-template-columns: 1fr 0.9fr; gap: 28rem; align-items: center; margin: 26rem 0 8rem; }
.sg-ty__map { margin: 0; }
.sg-ty__map svg {
  width: 100%;
  background: var(--sg-panel);
  border: 1.5px solid var(--sg-line);
  border-radius: 12rem;
  background-image: linear-gradient(var(--sg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--sg-grid) 1px, transparent 1px);
  background-size: 10% 10%;
}
.sg-ty__circle { fill: none; stroke: var(--sg-p); stroke-width: 1.4; opacity: 0.6; }
.sg-ty__stn { fill: var(--sg-ink); }
.sg-ty__pin { fill: none; stroke: var(--sg-ink); stroke-width: 2.5; }
.sg-ty__epi { fill: var(--sg-epi); stroke: var(--sg-panel); stroke-width: 1; }
.sg-ty__legend { display: flex; gap: 16rem; margin-top: 10rem; font-family: var(--sg-mono); font-size: 11.5rem; color: var(--sg-muted-strong); }
.sg-ty__legend span { display: inline-flex; align-items: center; gap: 6rem; }
.sg-ty__k-pin { width: 10rem; height: 10rem; border-radius: 50%; border: 2px solid var(--sg-ink); }
.sg-ty__k-epi { width: 10rem; height: 10rem; background: var(--sg-epi); clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }

.sg-ty__stats { display: flex; flex-direction: column; gap: 16rem; }
.sg-ty__stat { display: flex; flex-direction: column; gap: 3rem; }
.sg-ty__stat-val { font-family: var(--sg-display); font-size: 40rem; font-weight: 700; color: var(--sg-ink); line-height: 1; }
.sg-ty__stat-val--mono { font-family: var(--sg-mono); font-size: 30rem; }
.sg-ty__stat-val small { font-size: 18rem; color: var(--sg-muted-strong); margin-left: 3rem; }
.sg-ty__stat-label { font-size: 13rem; color: var(--sg-muted-strong); }

.sg-ty__remark { margin: 22rem 0 14rem; }
.sg-ty__idea { max-width: 62ch; }
.sg-ty__actions { margin-top: 30rem; display: flex; gap: 12rem; flex-wrap: wrap; }
.sg-ty__actions .sg-btn { text-decoration: none; }

@media (max-width: 640px) {
  .sg-ty__grid { grid-template-columns: 1fr; }
  .sg-ty__stats { flex-direction: row; flex-wrap: wrap; gap: 24rem; }
}
</style>
