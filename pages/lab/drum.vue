<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'The Drum — Lab', robots: 'noindex' })
const N = LAB_NAV.length
const pos = ref(0)
let target = 0, raf = 0
const active = computed(() => Math.max(0, Math.min(N - 1, Math.round(pos.value))))
const router = useRouter()
const STEP = 24, RADIUS = 220

function clampT() { target = Math.max(0, Math.min(N - 1, target)) }
function tick() { pos.value += (target - pos.value) * 0.14; if (Math.abs(target - pos.value) < 0.0004) pos.value = target; raf = requestAnimationFrame(tick) }
let lock = false
function onWheel(e: WheelEvent) { const d = e.deltaY; if (Math.abs(d) < 10 || lock) return; lock = true; target = Math.round(target) + (d > 0 ? 1 : -1); clampT(); setTimeout(() => (lock = false), 240) }
function onKey(e: KeyboardEvent) { if (e.key === 'ArrowDown') { target = Math.round(target) + 1; clampT() } else if (e.key === 'ArrowUp') { target = Math.round(target) - 1; clampT() } else if (e.key === 'Enter') router.push(LAB_NAV[active.value].href) }
function itemStyle(i: number) {
  const d = i - pos.value
  const op = Math.max(0, 1 - Math.abs(d) * 0.42)
  return { transform: `rotateX(${-d * STEP}deg) translateZ(${RADIUS}rem)`, opacity: String(op) }
}
let downY = 0, base = 0, dragging = false, moved = false
function onDown(e: PointerEvent) { dragging = true; moved = false; downY = e.clientY; base = target; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) { if (!dragging) return; const dy = e.clientY - downY; if (Math.abs(dy) > 6) moved = true; target = base - dy / 70; clampT() }
function onUp() { if (!dragging) return; dragging = false; target = Math.round(target); clampT() }
function click(i: number) { if (moved) return; if (i === active.value) router.push(LAB_NAV[i].href); else { target = i; clampT() } }
onMounted(() => { raf = requestAnimationFrame(tick); window.addEventListener('wheel', onWheel, { passive: true }); window.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { cancelAnimationFrame(raf); window.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey) })
</script>

<template>
  <LabFrame n="04" name="The Drum" hint="scroll to spin">
    <div class="dr" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
      <span class="dr__eyebrow">Naveen Jose</span>
      <div class="dr__ring">
        <button v-for="(item, i) in LAB_NAV" :key="item.href" class="dr__item" :class="{ on: i === active }" :style="itemStyle(i)" @click="click(i)">{{ item.label }}</button>
      </div>
      <p class="dr__desc">
        <Transition name="d" mode="out-in"><span :key="active">{{ LAB_NAV[active].desc }} — press enter</span></Transition>
      </p>
      <div class="dr__line" aria-hidden="true" />
    </div>
  </LabFrame>
</template>

<style scoped>
.dr { position: absolute; inset: 0; display: grid; place-items: center; perspective: 900rem; touch-action: none; cursor: grab; }
.dr:active { cursor: grabbing; }
.dr__eyebrow { position: absolute; top: clamp(90rem, 16vh, 150rem); left: 50%; translate: -50% 0; font-size: 12rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; opacity: 0.5; }
.dr__ring { position: relative; transform-style: preserve-3d; width: min(80vw, 700rem); height: 120rem; }
.dr__item { position: absolute; inset: 0; margin: auto; display: grid; place-items: center; border: 0; background: none; color: var(--color-text); font-family: var(--serif); font-weight: 400; font-size: clamp(40rem, 8vw, 96rem); line-height: 1; letter-spacing: -0.02em; cursor: pointer; opacity: 0.5; backface-visibility: hidden; white-space: nowrap; }
.dr__item.on { opacity: 1; }
.dr__desc { position: absolute; bottom: clamp(80rem, 18vh, 160rem); left: 50%; translate: -50% 0; font-size: 14rem; opacity: 0.6; text-align: center; max-width: 42ch; padding: 0 24rem; }
.d-enter-active, .d-leave-active { transition: opacity 0.3s ease; }
.d-enter-from, .d-leave-to { opacity: 0; }
.dr__line { position: absolute; left: 50%; top: 50%; translate: -50% -50%; width: min(80vw, 720rem); height: 1px; background: var(--color-glass-border); }
</style>
