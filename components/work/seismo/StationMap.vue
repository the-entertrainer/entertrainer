<script setup lang="ts">
import gsap from 'gsap'
import { EPICENTRE, EPICENTRE_TOLERANCE_KM, MAP_KM, STATIONS, distanceKm } from '~/utils/seismo/model'

// The triangulation. Three range circles (radii = the learner's measured
// distances) are drawn from the three stations. The learner clicks where the
// circles cross to place the epicentre, confirms, and the signature reveal
// runs: circles sweep out, the true epicentre star drops, the error is shown.
const props = defineProps<{ radii: Record<string, number> }>()
const emit = defineEmits<{ located: [payload: { x: number; y: number; errorKm: number }] }>()

const svgEl = ref<SVGSVGElement | null>(null)
const pin = ref<{ x: number; y: number } | null>(null)
const revealed = ref(false)

const circleEls = ref<SVGCircleElement[]>([])
const starEl = ref<SVGGElement | null>(null)

function setCircle(el: any) { if (el) circleEls.value.push(el) }

function kmFromEvent(e: PointerEvent): { x: number; y: number } | null {
  if (!svgEl.value) return null
  const r = svgEl.value.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * MAP_KM
  const y = ((e.clientY - r.top) / r.height) * MAP_KM
  return { x: Math.max(0, Math.min(MAP_KM, x)), y: Math.max(0, Math.min(MAP_KM, y)) }
}
function onMapDown(e: PointerEvent) {
  if (revealed.value) return
  const p = kmFromEvent(e)
  if (p) pin.value = p
}
function onMapKey(e: KeyboardEvent) {
  if (revealed.value) return
  const step = e.shiftKey ? 24 : 8
  const p = pin.value ?? { x: MAP_KM / 2, y: MAP_KM / 2 }
  if (e.key === 'ArrowLeft') { e.preventDefault(); pin.value = { ...p, x: Math.max(0, p.x - step) } }
  else if (e.key === 'ArrowRight') { e.preventDefault(); pin.value = { ...p, x: Math.min(MAP_KM, p.x + step) } }
  else if (e.key === 'ArrowUp') { e.preventDefault(); pin.value = { ...p, y: Math.max(0, p.y - step) } }
  else if (e.key === 'ArrowDown') { e.preventDefault(); pin.value = { ...p, y: Math.min(MAP_KM, p.y + step) } }
}

const errorKm = computed(() => pin.value ? Math.round(distanceKm(pin.value, EPICENTRE)) : 0)

function confirm() {
  if (!pin.value || revealed.value) return
  const err = Math.round(distanceKm(pin.value, EPICENTRE))
  revealed.value = true
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) {
    circleEls.value.forEach((c, i) => {
      const rTarget = c.getAttribute('data-r')
      gsap.fromTo(c, { attr: { r: 0 }, opacity: 0.9 },
        { attr: { r: rTarget }, opacity: 1, duration: 1.0, ease: 'power2.out', delay: i * 0.18 })
    })
    if (starEl.value) {
      gsap.fromTo(starEl.value, { scale: 0, opacity: 0, transformOrigin: 'center' },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.9 })
    }
  }
  emit('located', { x: pin.value.x, y: pin.value.y, errorKm: err })
}

defineExpose({ confirmDisabled: computed(() => !pin.value || revealed.value) })
</script>

<template>
  <div class="sg-map">
    <svg
      ref="svgEl"
      :viewBox="`0 0 ${MAP_KM} ${MAP_KM}`"
      class="sg-map__svg"
      :class="{ 'is-live': !revealed }"
      role="application"
      tabindex="0"
      aria-label="Map. Use arrow keys or click to place the epicentre where the three circles cross, then confirm."
      @pointerdown="onMapDown"
      @keydown="onMapKey"
    >
      <!-- range circles -->
      <circle
        v-for="s in STATIONS"
        :key="s.id"
        :ref="setCircle"
        :cx="s.x"
        :cy="s.y"
        :r="revealed ? radii[s.id] : radii[s.id]"
        :data-r="radii[s.id]"
        class="sg-map__circle"
      />

      <!-- stations -->
      <g v-for="s in STATIONS" :key="'stn' + s.id" class="sg-map__station">
        <path :d="`M${s.x} ${s.y - 9} l9 15 h-18 z`" />
        <text :x="s.x" :y="s.y - 13" text-anchor="middle" class="sg-map__code">{{ s.id }}</text>
      </g>

      <!-- learner's pin -->
      <g v-if="pin" class="sg-map__pin" :class="{ 'is-locked': revealed }" :transform="`translate(${pin.x} ${pin.y})`">
        <circle r="7" class="sg-map__pin-ring" />
        <circle r="2.5" class="sg-map__pin-dot" />
      </g>

      <!-- true epicentre (revealed) -->
      <g v-if="revealed" ref="starEl" class="sg-map__epi" :transform="`translate(${EPICENTRE.x} ${EPICENTRE.y})`">
        <path d="M0 -12 L3 -3 L12 -3 L4.5 3 L7 12 L0 6 L-7 12 L-4.5 3 L-12 -3 L-3 -3 Z" />
      </g>
    </svg>

    <div class="sg-map__bar">
      <p v-if="!revealed" class="sg-map__hint">
        {{ pin ? 'Adjust if you like, then confirm.' : 'Click or use arrow keys to place the epicentre.' }}
      </p>
      <p v-else class="sg-map__result">
        Your location was <b>{{ errorKm }} km</b> from the real epicentre.
        <span :class="errorKm <= EPICENTRE_TOLERANCE_KM ? 'sg-map__verdict is-ok' : 'sg-map__verdict'">
          {{ errorKm <= EPICENTRE_TOLERANCE_KM ? 'Located.' : 'Outside the located zone.' }}
        </span>
      </p>
      <button v-if="!revealed" type="button" class="sg-btn sg-btn--primary" :disabled="!pin" @click="confirm">
        Confirm location
      </button>
    </div>
  </div>
</template>

<style scoped>
.sg-map { display: flex; flex-direction: column; gap: 14rem; }
.sg-map__svg {
  width: 100%;
  max-width: 460rem;
  aspect-ratio: 1;
  align-self: center;
  background: var(--sg-panel);
  border: 1.5px solid var(--sg-line);
  border-radius: 12rem;
  background-image:
    linear-gradient(var(--sg-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--sg-grid) 1px, transparent 1px);
  background-size: 10% 10%;
}
.sg-map__svg.is-live { cursor: crosshair; }
.sg-map__svg:focus-visible { outline: 2px solid var(--sg-ink); outline-offset: 2px; }
.sg-map__circle { fill: color-mix(in srgb, var(--sg-p) 4%, transparent); stroke: var(--sg-p); stroke-width: 1.5; opacity: 0.85; }
.sg-map__station path { fill: var(--sg-ink); }
.sg-map__code { font-family: var(--sg-mono); font-size: 13px; fill: var(--sg-ink); font-weight: 600; }
.sg-map__pin-ring { fill: none; stroke: var(--sg-ink); stroke-width: 2; }
.sg-map__pin-dot { fill: var(--sg-ink); }
.sg-map__pin.is-locked .sg-map__pin-ring { stroke: var(--sg-muted); }
.sg-map__pin.is-locked .sg-map__pin-dot { fill: var(--sg-muted); }
.sg-map__epi path { fill: var(--sg-epi); stroke: var(--sg-panel); stroke-width: 1; }

.sg-map__bar { display: flex; align-items: center; justify-content: space-between; gap: 16rem; flex-wrap: wrap; }
.sg-map__hint { font-family: var(--sg-mono); font-size: 12.5rem; color: var(--sg-muted-strong); }
.sg-map__result { font-size: 15rem; color: var(--sg-ink); }
.sg-map__result b { font-family: var(--sg-mono); font-weight: 600; }
.sg-map__verdict { font-family: var(--sg-mono); font-size: 12.5rem; color: var(--sg-muted-strong); margin-left: 4rem; }
.sg-map__verdict.is-ok { color: var(--sg-p); }

@media (prefers-reduced-motion: reduce) {
  .sg-map__circle, .sg-map__epi { transition: none; }
}
</style>
