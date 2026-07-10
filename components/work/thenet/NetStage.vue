<script setup lang="ts">
import gsap from 'gsap'
import { NetStage } from '~/utils/thenet/stage'
import type { OrangeScreenPos } from '~/utils/thenet/stage'
import { useTheNetStore } from '~/stores/theNet'

// Scenes 1 (the pick) and 2 (the reveal) share one procedural stage. The
// net is present from the first frame; scene 2 is only the animation that
// takes it away. No explanation is allowed on screen until AFTER the
// learner has committed to a choice.
const emit = defineEmits<{ (e: 'revealed'): void }>()

const store = useTheNetStore()
const wrap = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let stage: NetStage | null = null
let overlayRaf = 0
let ro: ResizeObserver | null = null

const reduced = ref(false)
const positions = ref<OrangeScreenPos[]>([])
const chosen = computed(() => store.chosenIndex)
const hovered = ref<number | null>(null)
const revealLine = ref(false)
const picked = ref(false)

// the scrubbable net: 0 = resting on the fruit, 1 = carried away
const lift = ref(0)
const scrubbed = ref(false)
function onScrub() {
  scrubbed.value = true
  stage?.setNetLift(lift.value)
}

function syncOverlay() {
  if (!stage) return
  positions.value = Array.from({ length: 6 }, (_, i) => stage!.projectOrange(i))
  overlayRaf = requestAnimationFrame(syncOverlay)
}

function onPointerMove(e: PointerEvent) {
  if (reduced.value || !wrap.value || !stage) return
  const r = wrap.value.getBoundingClientRect()
  const nx = ((e.clientX - r.left) / r.width) * 2 - 1
  const ny = ((e.clientY - r.top) / r.height) * 2 - 1
  stage.setPointer(nx, -ny)
}

function pick(i: number) {
  if (picked.value) return
  picked.value = true
  hovered.value = null
  store.choose(i)
  // No feedback. No right, no wrong. Let the commitment sit for a beat.
  gsap.delayedCall(1.0, runReveal)
}

function runReveal() {
  if (!stage) return
  store.goTo(2)

  if (reduced.value) {
    // prefers-reduced-motion: a short linear lift, no theatrics.
    gsap.to(lift, { value: 1, duration: 0.8, ease: 'none', onUpdate: () => stage?.setNetLift(lift.value) })
    gsap.delayedCall(1.4, showLine)
    return
  }

  // The bag is picked up by its knot and carried off; the cast lattice
  // fades from the fruit and the pile gives a small settle as it clears.
  // Everything routes through setNetLift so the learner's scrub control is
  // the exact same motion, reversible.
  const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(1.2, showLine) })
  tl.to(lift, {
    value: 1,
    duration: 1.9,
    ease: 'power2.inOut',
    onUpdate: () => stage?.setNetLift(lift.value)
  })
  tl.add(() => stage!.pulseOranges(gsap), 1.15)
}

function showLine() {
  revealLine.value = true
  emit('revealed')
}

onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  stage = new NetStage(canvas.value!)
  syncOverlay()
  ro = new ResizeObserver(() => stage?.resize())
  ro.observe(wrap.value!)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(overlayRaf)
  ro?.disconnect()
  stage?.dispose()
  stage = null
})
</script>

<template>
  <div ref="wrap" class="stage" @pointermove="onPointerMove">
    <canvas ref="canvas" class="stage__canvas" />

    <!-- Focusable transparent hit targets pinned to each fruit: pointer tap
         AND keyboard (tab + enter) selection, and the accessible names. -->
    <button
      v-for="(p, i) in positions"
      :key="i"
      class="pip"
      :style="{ left: p.x + 'px', top: p.y + 'px', width: p.r * 2 + 'px', height: p.r * 2 + 'px' }"
      :aria-label="`Orange ${i + 1} of 6`"
      :aria-pressed="chosen === i"
      :disabled="picked"
      @click="pick(i)"
      @pointerenter="!picked && (hovered = i)"
      @pointerleave="hovered === i && (hovered = null)"
      @focus="!picked && (hovered = i)"
      @blur="hovered === i && (hovered = null)"
    />

    <!-- hover / focus affordance -->
    <div
      v-if="hovered !== null && positions[hovered]"
      class="halo"
      :style="{
        left: positions[hovered].x + 'px',
        top: positions[hovered].y + 'px',
        width: positions[hovered].r * 2.3 + 'px',
        height: positions[hovered].r * 2.3 + 'px'
      }"
      aria-hidden="true"
    />

    <!-- the learner's committed marker: pinned in 3D, survives the reveal -->
    <div
      v-if="chosen !== null && positions[chosen]"
      class="marker"
      :style="{ left: positions[chosen].x + 'px', top: positions[chosen].y + 'px' }"
      aria-hidden="true"
    >
      <span v-if="revealLine" class="marker__tag">your pick</span>
    </div>

    <!-- scene 1: one line, no heading, no explanation -->
    <transition name="fade-line">
      <div v-if="!picked" class="prompt">
        <p class="prompt__main">Pick the ripest orange.</p>
        <p class="prompt__sub">Go on — trust your eye.</p>
      </div>
    </transition>

    <!-- scene 2: the only words allowed here, after the silence -->
    <transition name="fade-line">
      <p v-if="revealLine" class="reveal">They were always the same color.</p>
    </transition>

    <!-- the reversible experiment: lower the bag back over the fruit and
         watch "ripeness" return; nothing about the fruit changes -->
    <transition name="fade-line">
      <div v-if="revealLine" class="scrub">
        <label class="scrub__label" for="net-lift">the net</label>
        <input
          id="net-lift"
          v-model.number="lift"
          class="scrub__input"
          type="range"
          min="0"
          max="1"
          step="0.005"
          aria-label="Raise and lower the net over the fruit"
          @input="onScrub"
        />
        <span class="scrub__hint">{{ scrubbed ? (lift < 0.5 ? 'on' : 'off') : 'drag me' }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: manipulation;
}
.stage__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.pip {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  outline: none;
}
.pip:disabled { cursor: default; }
.pip:focus-visible { box-shadow: 0 0 0 2px rgba(241, 236, 230, 0.8); }

.halo {
  position: absolute;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(241, 236, 230, 0.4);
  border-radius: 9999px;
  pointer-events: none;
  animation: halo-in 0.28s var(--ease-expo-out, ease) both;
}
@keyframes halo-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.marker {
  position: absolute;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  border: 1.5px solid #f1ece6;
  border-radius: 9999px;
  box-shadow: 0 0 0 3px rgba(20, 17, 15, 0.5);
  pointer-events: none;
  animation: marker-in 0.4s ease both;
}
.marker__tag {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a8480;
  white-space: nowrap;
  animation: tag-in 0.6s ease both;
}
@keyframes marker-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(1.7); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes tag-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.prompt {
  position: absolute;
  left: 50%;
  bottom: clamp(28px, 9vh, 76px);
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
}
.prompt__main {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: clamp(21px, 2.8vw, 28px);
  letter-spacing: 0.005em;
  color: #d8d2ca;
  white-space: nowrap;
}
.prompt__sub {
  margin: 10px 0 0;
  font-size: clamp(12px, 1.4vw, 14px);
  letter-spacing: 0.04em;
  color: #6f6a65;
}

.reveal {
  position: absolute;
  left: 50%;
  bottom: clamp(28px, 9vh, 76px);
  transform: translateX(-50%);
  margin: 0;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 350;
  font-size: clamp(19px, 2.4vw, 25px);
  color: #8a8480;
  white-space: nowrap;
}

.scrub {
  position: absolute;
  right: clamp(70px, 8vw, 130px);
  bottom: clamp(30px, 9vh, 80px);
  display: flex;
  align-items: center;
  gap: 10px;
}
.scrub__label,
.scrub__hint {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6f6a65;
  white-space: nowrap;
}
.scrub__hint { min-width: 58px; color: #8a8480; }
.scrub__input {
  width: clamp(110px, 14vw, 180px);
  accent-color: #e8471a;
  cursor: grab;
}
.scrub__input:active { cursor: grabbing; }

.fade-line-enter-active { transition: opacity 1.1s ease; }
.fade-line-leave-active { transition: opacity 0.35s ease; }
.fade-line-enter-from,
.fade-line-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .marker, .halo { animation: none; }
}
</style>
