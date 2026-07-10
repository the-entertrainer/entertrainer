<script setup lang="ts">
import gsap from 'gsap'
import { NetStage } from '~/utils/thenet/stage'
import type { OrangeScreenPos } from '~/utils/thenet/stage'
import { useTheNetStore } from '~/stores/theNet'

// Scenes 1 (THE TRAP) and 2 (THE REVEAL) share one procedural stage. The net
// is present the whole time; scene 2 is simply the animation that takes it
// away. No explanation is allowed to appear until AFTER a choice is committed.
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
const revealLine = ref(false) // "They were always the same color."
const picked = ref(false)

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
  store.choose(i)
  // No feedback. No right, no wrong. Let the choice sit, then reveal.
  gsap.delayedCall(0.9, runReveal)
}

function runReveal() {
  if (!stage) return
  store.goTo(2)
  const u = stage.netUniforms
  const shell = stage.netGroup
  const shadowMat = stage.shadow.material as any

  if (reduced.value) {
    // prefers-reduced-motion: a plain crossfade, no lift, no elastic.
    gsap.to(u.uOpacity, { value: 0, duration: 0.6, ease: 'none' })
    gsap.to(shadowMat, { opacity: 0.35, duration: 0.6, ease: 'none' })
    gsap.delayedCall(1.0, () => showLine())
    return
  }

  const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(1.2, showLine) })
  // The net lifts, stretches and dissolves upward over ~1.8s, gentle elastic.
  tl.to(shell.position, { y: 3.2, duration: 1.8, ease: 'elastic.out(0.6, 0.5)' }, 0)
  tl.to(shell.scale, { y: 2.1, x: 0.86, z: 0.86, duration: 1.8, ease: 'elastic.out(0.6, 0.5)' }, 0)
  tl.to(u.uDissolve, { value: 1, duration: 1.5, ease: 'power2.in' }, 0)
  // the cast shadow softens as the bag leaves
  tl.to(shadowMat, { opacity: 0.4, duration: 1.6, ease: 'power2.out' }, 0)
  tl.to(stage.shadow.scale, { x: 1.15, y: 1.15, duration: 1.6, ease: 'power2.out' }, 0)
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
  gsap.killTweensOf('*')
  stage?.dispose()
  stage = null
})
</script>

<template>
  <div ref="wrap" class="stage" @pointermove="onPointerMove">
    <canvas ref="canvas" class="stage__canvas" />

    <!-- Focusable, transparent hit targets pinned to each fruit. They give
         both pointer tap and keyboard (tab + enter) selection without a
         raycaster, and they carry the accessible names. -->
    <button
      v-for="(p, i) in positions"
      :key="i"
      class="pip"
      :class="{ 'pip--locked': picked }"
      :style="{ left: p.x + 'px', top: p.y + 'px', width: p.r * 2 + 'px', height: p.r * 2 + 'px' }"
      :aria-label="`Orange ${i + 1}`"
      :aria-pressed="chosen === i"
      :disabled="picked"
      @click="pick(i)"
    />

    <!-- The learner's marker: pinned in 3D space, survives the reveal. -->
    <div
      v-if="chosen !== null && positions[chosen]"
      class="marker"
      :style="{ left: positions[chosen].x + 'px', top: positions[chosen].y + 'px' }"
      aria-hidden="true"
    />

    <!-- Scene 1: one line, no heading. -->
    <p v-if="!picked" class="prompt">Tap the ripest one.</p>

    <!-- Scene 2: the only words allowed here, low contrast, after the silence. -->
    <transition name="fade-line">
      <p v-if="revealLine" class="reveal">They were always the same color.</p>
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
.pip:focus-visible {
  box-shadow: 0 0 0 2px rgba(241, 236, 230, 0.85);
}
.pip--locked {
  cursor: default;
}

.marker {
  position: absolute;
  width: 26px;
  height: 26px;
  transform: translate(-50%, -50%);
  border: 2px solid #f1ece6;
  border-radius: 9999px;
  box-shadow: 0 0 0 4px rgba(20, 17, 15, 0.55);
  pointer-events: none;
  animation: marker-in 0.4s ease both;
}
@keyframes marker-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.prompt {
  position: absolute;
  left: 50%;
  bottom: clamp(24px, 8vh, 64px);
  transform: translateX(-50%);
  margin: 0;
  color: #8a8480;
  font-size: clamp(15px, 2.2vw, 19px);
  font-weight: 400;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.reveal {
  position: absolute;
  left: 50%;
  bottom: clamp(24px, 8vh, 64px);
  transform: translateX(-50%);
  margin: 0;
  color: #8a8480;
  font-size: clamp(15px, 2.2vw, 19px);
  font-weight: 300;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.fade-line-enter-active { transition: opacity 1.1s ease; }
.fade-line-enter-from { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .marker { animation: none; }
}
</style>
