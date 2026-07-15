<script setup lang="ts">
import { GrooveBox, type Lane, type Pattern, STEPS } from '~/utils/groove/audio'
import { LANES } from '~/utils/groove/patterns'

const props = withDefaults(defineProps<{
  modelValue: Pattern
  lanes?: Lane[]
  editable?: boolean
  editableLanes?: Lane[]        // if set, only these lanes accept edits
  transport?: boolean
  bpm?: number
  diff?: Record<Lane, ('ok' | 'miss' | 'extra' | 'none')[]> | null
  label?: string
}>(), { editable: true, transport: true, bpm: 96, diff: null, label: '' })

function canEdit(lane: Lane) {
  return props.editable && (!props.editableLanes || props.editableLanes.includes(lane))
}

const emit = defineEmits<{ 'update:modelValue': [Pattern]; playing: [boolean] }>()

const shownLanes = computed(() => LANES.filter(l => !props.lanes || props.lanes.includes(l.id)))
const laneMeta = (id: Lane) => LANES.find(l => l.id === id)!

let box: GrooveBox | null = null
const playing = ref(false)
const playhead = ref(-1)
const bpm = ref(props.bpm)
const muted = ref(false)
const stepIndex = Array.from({ length: STEPS }, (_, i) => i)

onMounted(() => {
  box = new GrooveBox(props.modelValue)
  box.setBpm(bpm.value)
})
onBeforeUnmount(() => { box?.dispose(); box = null })

watch(() => props.modelValue, p => box?.setPattern(p), { deep: true })
watch(bpm, b => box?.setBpm(b))
watch(muted, m => box?.setMuted(m))

async function togglePlay() {
  if (!box) return
  if (playing.value) {
    box.stop(); playing.value = false; playhead.value = -1; emit('playing', false)
  } else {
    playing.value = true; emit('playing', true)
    await box.start(s => { playhead.value = s })
  }
}

function toggleCell(lane: Lane, i: number) {
  if (!canEdit(lane)) return
  const next: Pattern = { kick: [...props.modelValue.kick], snare: [...props.modelValue.snare], hat: [...props.modelValue.hat] }
  next[lane][i] = !next[lane][i]
  emit('update:modelValue', next)
  if (next[lane][i]) box?.tap(lane)
}

const beatLabels = [1, 2, 3, 4]

defineExpose({
  stop: () => { if (box && playing.value) { box.stop(); playing.value = false; playhead.value = -1; emit('playing', false) } }
})
</script>

<template>
  <div class="gv-seq" :class="{ 'is-static': !editable }">
    <div v-if="transport || label" class="gv-seq__bar">
      <button v-if="transport" type="button" class="gv-seq__play" :class="{ 'is-playing': playing }" @click="togglePlay">
        <svg v-if="!playing" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z" /></svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        <span>{{ playing ? 'Stop' : 'Play' }}</span>
      </button>
      <span v-if="label" class="gv-seq__label">{{ label }}</span>
      <div v-if="transport" class="gv-seq__spacer" />
      <label v-if="transport" class="gv-seq__tempo">
        <span class="gv-seq__tempo-val">{{ bpm }}</span><span class="gv-seq__tempo-unit">BPM</span>
        <input type="range" min="66" max="132" step="2" v-model.number="bpm" aria-label="Tempo in beats per minute" />
      </label>
      <button v-if="transport" type="button" class="gv-seq__mute" :class="{ 'is-muted': muted }" :aria-pressed="muted" @click="muted = !muted">
        <svg v-if="!muted" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16 9a3 3 0 0 1 0 6M18.5 7a6 6 0 0 1 0 10" /></svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6" /></svg>
        <span class="gv-sr">{{ muted ? 'Unmute' : 'Mute' }}</span>
      </button>
    </div>

    <div class="gv-grid" :style="{ '--steps': STEPS }">
      <!-- beat ruler -->
      <div class="gv-grid__ruler" aria-hidden="true">
        <span class="gv-grid__gutter" />
        <span
          v-for="i in stepIndex"
          :key="'r' + i"
          class="gv-grid__tick"
          :class="{ 'is-beat': i % 4 === 0, 'is-head': i === playhead }"
        >{{ i % 4 === 0 ? beatLabels[i / 4] : '' }}</span>
      </div>

      <div v-for="lane in shownLanes" :key="lane.id" class="gv-lane" :data-lane="lane.id">
        <span class="gv-lane__label"><i class="gv-lane__dot" /><b>{{ lane.label }}</b><em>{{ lane.sound }}</em></span>
        <div class="gv-lane__cells">
          <button
            v-for="i in stepIndex"
            :key="lane.id + i"
            type="button"
            class="gv-cell"
            :class="[
              { 'is-on': modelValue[lane.id][i], 'is-beat': i % 4 === 0, 'is-head': i === playhead, 'is-static': !canEdit(lane.id) },
              diff ? 'gv-cell--' + diff[lane.id][i] : ''
            ]"
            :disabled="!canEdit(lane.id)"
            :aria-pressed="modelValue[lane.id][i]"
            :aria-label="`${lane.label}, step ${i + 1}, ${modelValue[lane.id][i] ? 'on' : 'off'}`"
            @click="toggleCell(lane.id, i)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gv-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

.gv-seq__bar {
  display: flex;
  align-items: center;
  gap: 14rem;
  margin-bottom: 16rem;
  flex-wrap: wrap;
}
.gv-seq__play {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  padding: 9rem 18rem;
  border-radius: 999rem;
  background: var(--gv-accent);
  color: var(--gv-bg);
  font-family: var(--gv-display);
  font-weight: 700;
  font-size: 14rem;
  transition: transform 0.1s ease, filter 0.15s ease;
}
.gv-seq__play:active { transform: scale(0.96); }
@media (hover: hover) { .gv-seq__play:hover { filter: brightness(1.08); } }
.gv-seq__play:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; }
.gv-seq__label { font-family: var(--gv-mono); font-size: 12.5rem; color: var(--gv-muted); }
.gv-seq__spacer { flex: 1; }
.gv-seq__tempo { display: inline-flex; align-items: center; gap: 8rem; font-family: var(--gv-mono); }
.gv-seq__tempo-val { font-size: 15rem; font-weight: 600; color: var(--gv-text); }
.gv-seq__tempo-unit { font-size: 10.5rem; color: var(--gv-muted); }
.gv-seq__tempo input { width: 92rem; accent-color: var(--gv-accent); }
.gv-seq__mute {
  width: 34rem; height: 34rem; display: flex; align-items: center; justify-content: center;
  border-radius: 9rem; color: var(--gv-muted); border: 1px solid var(--gv-line);
}
@media (hover: hover) { .gv-seq__mute:hover { color: var(--gv-text); } }
.gv-seq__mute.is-muted { color: var(--gv-accent); border-color: var(--gv-accent); }
.gv-seq__mute:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; }

.gv-grid { display: flex; flex-direction: column; gap: 8rem; }
.gv-grid__ruler { display: flex; align-items: center; gap: 6rem; }
.gv-grid__gutter { width: 92rem; flex-shrink: 0; }
.gv-grid__tick {
  flex: 1;
  text-align: center;
  font-family: var(--gv-mono);
  font-size: 11rem;
  color: var(--gv-muted);
  min-width: 0;
}
.gv-grid__tick.is-beat { color: var(--gv-text); }
.gv-grid__tick.is-head { color: var(--gv-accent); }

.gv-lane { display: flex; align-items: center; gap: 6rem; }
.gv-lane__label {
  width: 92rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 7rem;
  font-size: 13rem;
}
.gv-lane__dot { width: 10rem; height: 10rem; border-radius: 50%; flex-shrink: 0; }
.gv-lane__label b { font-weight: 600; color: var(--gv-text); }
.gv-lane__label em { display: none; font-family: var(--gv-mono); font-size: 10rem; color: var(--gv-muted); font-style: normal; }
.gv-lane[data-lane="kick"] .gv-lane__dot { background: var(--gv-kick); }
.gv-lane[data-lane="snare"] .gv-lane__dot { background: var(--gv-snare); }
.gv-lane[data-lane="hat"] .gv-lane__dot { background: var(--gv-hat); }

.gv-lane__cells { flex: 1; display: flex; gap: 6rem; min-width: 0; }
.gv-cell {
  flex: 1;
  min-width: 0;
  aspect-ratio: 1;
  border-radius: 7rem;
  background: var(--gv-slot);
  border: 1px solid var(--gv-line);
  transition: transform 0.08s ease, background 0.12s ease, box-shadow 0.12s ease;
  cursor: pointer;
  position: relative;
}
.gv-cell.is-beat { border-color: var(--gv-line-strong); }
.gv-cell.is-static { cursor: default; }
@media (hover: hover) { .gv-cell:not(.is-static):not(.is-on):hover { background: var(--gv-slot-hover); } }
.gv-cell:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; z-index: 1; }

.gv-lane[data-lane="kick"] .gv-cell.is-on { background: var(--gv-kick); border-color: var(--gv-kick); }
.gv-lane[data-lane="snare"] .gv-cell.is-on { background: var(--gv-snare); border-color: var(--gv-snare); }
.gv-lane[data-lane="hat"] .gv-cell.is-on { background: var(--gv-hat); border-color: var(--gv-hat); }

/* playhead column */
.gv-cell.is-head { box-shadow: 0 0 0 2px var(--gv-accent); }
/* the flash when an active cell is struck */
.gv-cell.is-on.is-head { transform: scale(1.14); box-shadow: 0 0 0 2px var(--gv-accent), 0 6rem 18rem -6rem var(--gv-accent); }

/* hands-on review overlay */
.gv-cell--miss { border-color: var(--gv-accent); border-style: dashed; }
.gv-cell--extra { opacity: 0.4; }

@media (prefers-reduced-motion: reduce) {
  .gv-cell { transition: background 0.12s ease; }
  .gv-cell.is-on.is-head { transform: none; }
}

@media (max-width: 640px) {
  .gv-grid__gutter, .gv-lane__label { width: 58rem; }
  .gv-lane__label b { font-size: 12rem; }
  .gv-lane__cells { gap: 3rem; }
  .gv-cell { border-radius: 5rem; }
  .gv-seq__tempo input { width: 70rem; }
}
</style>
