<script setup lang="ts">
/**
 * Three tiny expansion exercises — one screen each, huge taps, almost no chrome.
 * step 1: Blow (everything drifts apart)
 * step 2: Tap yellow "you" → expand with you fixed in the middle
 * step 3: Tap a friend → same trick, they are the middle too
 */
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{ step?: 1 | 2 | 3 }>(),
  { step: 1 }
)

type Dot = { id: number; x: number; y: number; kind: 'plain' | 'you' | 'friend' }

/** Soft field coords in a 100×70 viewBox. Few dots, roomy taps. */
const SEED: Dot[] = [
  { id: 0, x: 18, y: 20, kind: 'plain' },
  { id: 1, x: 42, y: 34, kind: 'you' },
  { id: 2, x: 66, y: 36, kind: 'friend' },
  { id: 3, x: 28, y: 52, kind: 'plain' },
  { id: 4, x: 54, y: 18, kind: 'plain' },
  { id: 5, x: 14, y: 42, kind: 'plain' },
  { id: 6, x: 82, y: 52, kind: 'plain' },
  { id: 7, x: 58, y: 54, kind: 'plain' }
]

const FIELD_CX = 50
const FIELD_CY = 35
const SCALE_REST = 1
const SCALE_BLOWN = 1.55

const blown = ref(false)
const pickedId = ref<number | null>(null)
const displayScale = ref(SCALE_REST)
const reducedMotion = ref(false)

let raf = 0
let animFrom = SCALE_REST
let animTo = SCALE_REST
let animT0 = 0
const ANIM_MS = 900

const youDot = computed(() => SEED.find((d) => d.kind === 'you')!)
const friendDot = computed(() => SEED.find((d) => d.kind === 'friend')!)

const captions: Record<1 | 2 | 3, string> = {
  1: 'Everything moves away from everything.',
  2: 'When you stand here, it looks like the middle.',
  3: 'They’re the middle too. Every you is.'
}

const caption = computed(() => {
  if (props.step === 1) return captions[1]
  if (props.step === 2 && pickedId.value == null) return 'Tap the big yellow YOU.'
  if (props.step === 3 && pickedId.value == null) return 'Tap Friend — another galaxy.'
  return captions[props.step]
})

const hint = computed(() => {
  if (props.step === 1) return blown.value ? 'Tap again to reset.' : 'Tap Blow.'
  if (props.step === 2) {
    return pickedId.value == null ? 'One yellow dot. Hard to miss.' : 'That’s you. The rest drifts out.'
  }
  return pickedId.value == null ? 'Pick Friend this time.' : 'Same expansion. New middle.'
})

const stepLabel = computed(() => {
  if (props.step === 1) return 'Step 1 — Inflate'
  if (props.step === 2) return 'Step 2 — Stand on you'
  return 'Step 3 — Stand on a friend'
})

function prefersReduced() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function tick(now: number) {
  const t = Math.min(1, (now - animT0) / ANIM_MS)
  displayScale.value = animFrom + (animTo - animFrom) * easeOutCubic(t)
  if (t < 1) {
    raf = requestAnimationFrame(tick)
  } else {
    raf = 0
    displayScale.value = animTo
  }
}

function animateTo(target: number) {
  if (raf) cancelAnimationFrame(raf)
  if (reducedMotion.value) {
    displayScale.value = target
    return
  }
  animFrom = displayScale.value
  animTo = target
  animT0 = performance.now()
  raf = requestAnimationFrame(tick)
}

/** Expand about a reference seed point; then shift so the ref sits at field centre. */
function place(dot: Dot) {
  const s = displayScale.value

  if (props.step === 1 || pickedId.value == null) {
    return {
      x: FIELD_CX + (dot.x - FIELD_CX) * s,
      y: FIELD_CY + (dot.y - FIELD_CY) * s
    }
  }

  const ref = SEED.find((d) => d.id === pickedId.value) ?? youDot.value
  const ox = ref.x
  const oy = ref.y
  const expandedX = ox + (dot.x - ox) * s
  const expandedY = oy + (dot.y - oy) * s
  return {
    x: FIELD_CX + (expandedX - ox),
    y: FIELD_CY + (expandedY - oy)
  }
}

const placed = computed(() =>
  SEED.map((d) => {
    const p = place(d)
    return { ...d, px: p.x, py: p.y }
  })
)

function hitStyleFor(kind: 'you' | 'friend') {
  const d = placed.value.find((x) => x.kind === kind)
  if (!d) return { left: '50%', top: '50%' }
  return {
    left: `${d.px}%`,
    top: `${(d.py / 70) * 100}%`
  }
}

const youHitStyle = computed(() => hitStyleFor('you'))
const friendHitStyle = computed(() => hitStyleFor('friend'))

function blow() {
  if (props.step !== 1) return
  const next = !blown.value
  blown.value = next
  animateTo(next ? SCALE_BLOWN : SCALE_REST)
}

function pickYou() {
  if (props.step !== 2) return
  pickedId.value = youDot.value.id
  animateTo(SCALE_BLOWN)
}

function pickFriend() {
  if (props.step !== 3) return
  pickedId.value = friendDot.value.id
  animateTo(SCALE_BLOWN)
}

function resetStep() {
  blown.value = false
  pickedId.value = null
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  displayScale.value = SCALE_REST
}

watch(
  () => props.step,
  () => resetStep()
)

let mq: MediaQueryList | null = null
function onMqChange() {
  if (mq) reducedMotion.value = mq.matches
}

onMounted(() => {
  reducedMotion.value = prefersReduced()
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener?.('change', onMqChange)
})

onBeforeUnmount(() => {
  mq?.removeEventListener?.('change', onMqChange)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <section class="cms" :data-step="step" :aria-label="stepLabel">
    <p class="cms__step">{{ stepLabel }}</p>

    <div class="cms__stage" role="img" :aria-label="caption">
      <svg class="cms__svg" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect class="cms__field" x="0" y="0" width="100" height="70" rx="4" />
        <g v-for="d in placed" :key="d.id">
          <circle
            class="cms__dot"
            :class="{
              'cms__dot--you': d.kind === 'you' && step === 2,
              'cms__dot--friend': d.kind === 'friend' && step === 3,
              'cms__dot--picked': pickedId === d.id,
              'cms__dot--dim': pickedId != null && pickedId !== d.id
            }"
            :cx="d.px"
            :cy="d.py"
            :r="d.kind === 'you' && step === 2 ? 5.2 : d.kind === 'friend' && step === 3 ? 4.6 : 2.4"
          />
        </g>
      </svg>

      <button
        v-if="step === 2"
        type="button"
        class="cms__hit cms__hit--you"
        :style="youHitStyle"
        :aria-pressed="pickedId === youDot.id"
        @click="pickYou"
      >
        YOU
      </button>
      <button
        v-if="step === 3"
        type="button"
        class="cms__hit cms__hit--friend"
        :style="friendHitStyle"
        :aria-pressed="pickedId === friendDot.id"
        @click="pickFriend"
      >
        Friend
      </button>
    </div>

    <div class="cms__bar">
      <button
        v-if="step === 1"
        type="button"
        class="cms__blow"
        :aria-pressed="blown"
        @click="blow"
      >
        {{ blown ? 'Reset' : 'Blow' }}
      </button>
      <p class="cms__caption">{{ caption }}</p>
    </div>
    <p class="cms__hint">{{ hint }}</p>
  </section>
</template>

<style scoped>
.cms {
  margin: 36rem 0 48rem;
  padding: 18rem 16rem 16rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
}
.cms__step {
  margin: 0 0 12rem;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.cms__stage {
  position: relative;
  border: var(--stroke) solid var(--ink);
  border-radius: calc(var(--radius-m) - 4rem);
  overflow: visible;
  background: var(--paper);
  aspect-ratio: 100 / 70;
}
.cms__svg {
  display: block;
  width: 100%;
  height: 100%;
}
.cms__field {
  fill: color-mix(in srgb, var(--accent-soft) 55%, var(--paper));
}
.cms__dot {
  fill: var(--ink);
  transition: fill 0.2s ease, opacity 0.2s ease;
}
.cms__dot--you,
.cms__dot--friend,
.cms__dot--picked {
  fill: var(--accent);
  stroke: var(--accent-ink);
  stroke-width: 0.6;
}
.cms__dot--dim {
  opacity: 0.55;
}
.cms__hit {
  position: absolute;
  transform: translate(-50%, -50%);
  min-width: 72rem;
  min-height: 72rem;
  padding: 0 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--accent-ink);
  font: 700 13rem/1 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 2rem 0 color-mix(in srgb, var(--ink) 18%, transparent);
  z-index: 2;
}
.cms__hit[aria-pressed='true'] {
  box-shadow: none;
  transform: translate(-50%, -50%) scale(0.96);
}
.cms__hit:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 3px;
}
.cms__hit--friend {
  min-width: 88rem;
}
.cms__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14rem 18rem;
  margin-top: 14rem;
}
.cms__blow {
  appearance: none;
  flex: 0 0 auto;
  min-width: 120rem;
  min-height: 56rem;
  padding: 0 28rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--accent-ink);
  font: 700 18rem/1 var(--font-display);
  letter-spacing: -.02em;
  cursor: pointer;
  box-shadow: 0 3rem 0 color-mix(in srgb, var(--ink) 20%, transparent);
}
.cms__blow[aria-pressed='true'] {
  background: var(--paper);
  box-shadow: none;
}
.cms__blow:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 3px;
}
.cms__blow:active {
  transform: translateY(2rem);
  box-shadow: none;
}
.cms__caption {
  flex: 1 1 180rem;
  margin: 0;
  font: 500 clamp(20rem, 2.4vw, 28rem)/1.15 var(--font-display);
  letter-spacing: -.03em;
}
.cms__hint {
  margin: 8rem 0 0;
  color: var(--ink-soft);
  font: 400 13rem/1.4 var(--font-mono);
}
@media (max-width: 640px) {
  .cms { padding: 14rem 12rem 12rem; margin: 28rem 0 40rem; }
  .cms__blow { min-height: 52rem; width: 100%; }
  .cms__hit { min-width: 68rem; min-height: 68rem; }
}
@media (prefers-reduced-motion: reduce) {
  .cms__dot { transition: none; }
  .cms__blow:active { transform: none; }
  .cms__hit[aria-pressed='true'] { transform: translate(-50%, -50%); }
}
</style>
