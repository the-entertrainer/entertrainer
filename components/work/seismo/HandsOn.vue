<script setup lang="ts">
import Caliper from './Caliper.vue'
import StationMap from './StationMap.vue'
import {
  P_ARRIVAL_S, SP_TOLERANCE_S, STATIONS, TRACE_WINDOW_S,
  sArrivalS, spToDistance, trueSpSeconds
} from '~/utils/seismo/model'

const store = useSeismoStore()
const emit = defineEmits<{ back: []; continue: [] }>()

const SEEDS: Record<string, number> = { HLM: 1201, KRS: 3350, DVP: 5077 }

const phase = ref<'measure' | 'locate'>('measure')
const stationIndex = ref(0)
const subPhase = ref<'measuring' | 'checked'>('measuring')
const currentSpan = ref(0)

const station = computed(() => STATIONS[stationIndex.value])
const liveDistance = computed(() => Math.round(spToDistance(currentSpan.value)))
const trueSp = computed(() => trueSpSeconds(station.value))
const lastOk = ref(false)

function onSpan(s: number) { currentSpan.value = s }

function confirmMeasurement() {
  const st = station.value
  const ok = Math.abs(currentSpan.value - trueSp.value) <= SP_TOLERANCE_S
  lastOk.value = ok
  store.setMeasurement({
    stationId: st.id,
    spSeconds: Number(currentSpan.value.toFixed(1)),
    distanceKm: Math.round(spToDistance(currentSpan.value)),
    ok
  })
  subPhase.value = 'checked'
}

function nextStation() {
  if (stationIndex.value < STATIONS.length - 1) {
    stationIndex.value += 1
    subPhase.value = 'measuring'
    currentSpan.value = 0
  } else {
    phase.value = 'locate'
  }
}

const radii = computed<Record<string, number>>(() => {
  const out: Record<string, number> = {}
  for (const m of store.measurements) out[m.stationId] = m.distanceKm
  return out
})

const located = ref(store.placement != null)
function onLocated(payload: { x: number; y: number; errorKm: number }) {
  store.setPlacement(payload)
  located.value = true
}

// If resuming with all measurements + placement already done, jump to locate.
onMounted(() => {
  if (store.measurements.length >= STATIONS.length) phase.value = 'locate'
})
</script>

<template>
  <section class="sg-screen sg-hands">
    <button type="button" class="sg-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Station log
    </button>
    <p class="sg-eyebrow">Hands on</p>
    <h2 class="sg-h2">Locate the epicentre</h2>
    <p class="sg-lead sg-hands__intro">
      One earthquake was recorded at three stations. Measure the S-minus-P gap on each record,
      then cross the three circles to place the epicentre.
    </p>

    <!-- ── Measure phase ── -->
    <div v-if="phase === 'measure'" class="sg-hands__stage">
      <div class="sg-hands__stepper" aria-hidden="true">
        <span
          v-for="(s, i) in STATIONS"
          :key="s.id"
          class="sg-hands__step"
          :class="{ 'is-active': i === stationIndex, 'is-done': i < stationIndex || (i === stationIndex && subPhase === 'checked') }"
        >{{ s.id }}</span>
      </div>

      <div class="sg-hands__panel">
        <div class="sg-hands__panel-head">
          <span class="sg-hands__station">Station {{ station.id }} · {{ station.name }}</span>
          <span class="sg-hands__pos">{{ stationIndex + 1 }} of {{ STATIONS.length }}</span>
        </div>

        <p class="sg-note sg-hands__task">
          Drag the <b class="sg-hands__p">P</b> marker onto the first arrival and the
          <b class="sg-hands__s">S</b> marker onto the larger second arrival.
        </p>

        <Caliper
          :key="station.id"
          :seed="SEEDS[station.id]"
          :window-s="TRACE_WINDOW_S"
          :p-arrival-s="P_ARRIVAL_S"
          :s-arrival-s="sArrivalS(station)"
          :disabled="subPhase === 'checked'"
          @span="onSpan"
        />

        <div class="sg-hands__readout">
          <div class="sg-hands__metric">
            <span class="sg-hands__metric-label">S − P gap</span>
            <span class="sg-hands__metric-val">{{ currentSpan.toFixed(1) }}<small>s</small></span>
          </div>
          <span class="sg-hands__times">×8</span>
          <div class="sg-hands__metric">
            <span class="sg-hands__metric-label">distance</span>
            <span class="sg-hands__metric-val sg-hands__metric-val--out">{{ liveDistance }}<small>km</small></span>
          </div>
        </div>

        <div v-if="subPhase === 'measuring'" class="sg-hands__actions">
          <button type="button" class="sg-btn sg-btn--primary" @click="confirmMeasurement">Confirm measurement</button>
        </div>

        <div v-else class="sg-hands__checked">
          <p class="sg-hands__fb">
            You read {{ currentSpan.toFixed(1) }} s, which is {{ liveDistance }} km. The true gap here is
            {{ trueSp.toFixed(1) }} s.
            <span :class="lastOk ? 'sg-hands__tag is-ok' : 'sg-hands__tag'">{{ lastOk ? 'Within tolerance.' : 'A little off, but usable.' }}</span>
          </p>
          <button type="button" class="sg-btn sg-btn--primary" @click="nextStation">
            {{ stationIndex < STATIONS.length - 1 ? 'Next station' : 'Go to the map' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Locate phase ── -->
    <div v-else class="sg-hands__stage">
      <p class="sg-note sg-hands__maptask">
        Each circle is one station's distance. Place the epicentre where all three cross.
      </p>
      <StationMap :radii="radii" @located="onLocated" />

      <div v-if="located" class="sg-hands__done">
        <button type="button" class="sg-btn sg-btn--primary" @click="emit('continue')">
          Continue to Assessment
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sg-hands__intro { max-width: 58ch; margin-bottom: 24rem; }
.sg-hands__stepper { display: flex; gap: 8rem; margin-bottom: 16rem; }
.sg-hands__step {
  font-family: var(--sg-mono);
  font-size: 12rem;
  padding: 5rem 11rem;
  border-radius: 6rem;
  border: 1.5px solid var(--sg-line);
  color: var(--sg-muted-strong);
}
.sg-hands__step.is-active { border-color: var(--sg-ink); color: var(--sg-ink); }
.sg-hands__step.is-done { background: var(--sg-p); border-color: var(--sg-p); color: var(--sg-panel); }

.sg-hands__panel {
  background: var(--sg-panel);
  border: 1.5px solid var(--sg-line);
  border-radius: 14rem;
  padding: 22rem 22rem 24rem;
  box-shadow: 0 26rem 50rem -38rem rgba(22, 36, 43, 0.5);
}
.sg-hands__panel-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10rem; }
.sg-hands__station { font-family: var(--sg-display); font-size: 16rem; font-weight: 600; color: var(--sg-ink); }
.sg-hands__pos { font-family: var(--sg-mono); font-size: 12rem; color: var(--sg-muted-strong); }
.sg-hands__task { margin-bottom: 20rem; }
.sg-hands__p { color: var(--sg-p); font-family: var(--sg-mono); }
.sg-hands__s { color: var(--sg-s); font-family: var(--sg-mono); }

.sg-hands__readout {
  display: flex;
  align-items: center;
  gap: 18rem;
  margin-top: 22rem;
  padding: 16rem 20rem;
  background: var(--sg-paper);
  border-radius: 10rem;
}
.sg-hands__metric { display: flex; flex-direction: column; gap: 3rem; }
.sg-hands__metric-label { font-family: var(--sg-mono); font-size: 11rem; color: var(--sg-muted-strong); text-transform: uppercase; letter-spacing: 0.04em; }
.sg-hands__metric-val { font-family: var(--sg-mono); font-size: 26rem; font-weight: 600; color: var(--sg-ink); line-height: 1; }
.sg-hands__metric-val small { font-size: 14rem; color: var(--sg-muted-strong); margin-left: 2rem; }
.sg-hands__metric-val--out { color: var(--sg-p); }
.sg-hands__times { font-family: var(--sg-mono); font-size: 15rem; color: var(--sg-muted); }

.sg-hands__actions, .sg-hands__done { margin-top: 22rem; }
.sg-hands__checked { margin-top: 20rem; }
.sg-hands__fb { font-size: 14rem; line-height: 1.55; color: var(--sg-muted-strong); margin-bottom: 16rem; }
.sg-hands__tag { font-family: var(--sg-mono); font-size: 12.5rem; color: var(--sg-muted-strong); }
.sg-hands__tag.is-ok { color: var(--sg-p); }

.sg-hands__maptask { margin-bottom: 18rem; }
.sg-hands__done { margin-top: 24rem; }

@media (max-width: 560px) {
  .sg-hands__readout { flex-wrap: wrap; gap: 12rem; }
}
</style>
