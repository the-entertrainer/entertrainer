<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'The Arc — Lab', robots: 'noindex' })

const pos = ref(0)          // smoothed float index
let target = 0
const N = LAB_NAV.length
const active = computed(() => Math.max(0, Math.min(N - 1, Math.round(pos.value))))
let raf = 0
const router = useRouter()

function clampT() { target = Math.max(0, Math.min(N - 1, target)) }
function tick() {
  pos.value += (target - pos.value) * 0.12
  if (Math.abs(target - pos.value) < 0.0005) pos.value = target
  raf = requestAnimationFrame(tick)
}
let wheelLock = false
function onWheel(e: WheelEvent) {
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  if (Math.abs(d) < 12 || wheelLock) return
  wheelLock = true; target = Math.round(target) + (d > 0 ? 1 : -1); clampT()
  setTimeout(() => (wheelLock = false), 260)
}
let downX = 0, base = 0, dragging = false, moved = false
function onDown(e: PointerEvent) { dragging = true; moved = false; downX = e.clientX; base = target; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) { if (!dragging) return; const dx = e.clientX - downX; if (Math.abs(dx) > 6) moved = true; target = base - dx / 300; clampT() }
function onUp() { if (!dragging) return; dragging = false; target = Math.round(target); clampT() }
function cardStyle(i: number) {
  const a = i - pos.value
  const x = a * 300, y = a * a * 46, rot = a * 7, scale = Math.max(0.62, 1 - Math.abs(a) * 0.13)
  const op = Math.max(0, 1 - Math.abs(a) * 0.32)
  return { transform: `translate(-50%,-50%) translate(${x}rem, ${y}rem) rotate(${rot}deg) scale(${scale})`, opacity: op, zIndex: String(100 - Math.round(Math.abs(a) * 10)) }
}
function go(i: number) { if (moved) return; if (i === active.value) router.push(LAB_NAV[i].href); else { target = i; clampT() } }

onMounted(() => { raf = requestAnimationFrame(tick); window.addEventListener('wheel', onWheel, { passive: true }); window.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { cancelAnimationFrame(raf); window.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey) })
function onKey(e: KeyboardEvent) { if (e.key === 'ArrowRight') { target = Math.round(target) + 1; clampT() } else if (e.key === 'ArrowLeft') { target = Math.round(target) - 1; clampT() } else if (e.key === 'Enter') router.push(LAB_NAV[active.value].href) }
</script>

<template>
  <LabFrame n="02" name="The Arc" hint="scroll or drag">
    <div class="arc" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
      <div class="arc__stage">
        <button v-for="(item, i) in LAB_NAV" :key="item.href" class="arc__card" :style="cardStyle(i)" @click="go(i)" :aria-label="item.label">
          <img :src="item.img" :alt="''" />
        </button>
      </div>
      <div class="arc__cap">
        <Transition name="cap" mode="out-in">
          <div :key="active" class="arc__cap-in">
            <span class="arc__n">{{ LAB_NAV[active].n }}</span>
            <h1 class="arc__label">{{ LAB_NAV[active].label }}</h1>
            <p class="arc__desc">{{ LAB_NAV[active].desc }}</p>
          </div>
        </Transition>
      </div>
      <div class="arc__dots">
        <button v-for="(item, i) in LAB_NAV" :key="i" class="arc__dot" :class="{ on: i === active }" @click="target = i; clampT()" :aria-label="`Go to ${item.label}`" />
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.arc { position: absolute; inset: 0; touch-action: none; cursor: grab; overflow: hidden; }
.arc:active { cursor: grabbing; }
.arc__stage { position: absolute; left: 50%; top: 40%; width: 0; height: 0; }
.arc__card { position: absolute; left: 0; top: 0; width: 300rem; height: 380rem; padding: 0; border: 0; border-radius: 14rem; overflow: hidden; background: var(--color-glass-bg); box-shadow: 0 40rem 80rem -40rem rgba(0,0,0,0.55), 0 0 0 1px var(--color-glass-border); cursor: pointer; will-change: transform, opacity; }
.arc__card img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.arc__cap { position: absolute; left: 0; right: 0; bottom: clamp(70rem, 16vh, 150rem); text-align: center; pointer-events: none; padding: 0 24rem; }
.arc__n { font-family: var(--serif); font-size: 14rem; opacity: 0.5; }
.arc__label { font-family: var(--serif); font-weight: 400; font-size: clamp(38rem, 6vw, 72rem); line-height: 1; letter-spacing: -0.02em; margin: 6rem 0 0; }
.arc__desc { font-size: 14rem; opacity: 0.6; margin: 10rem auto 0; max-width: 42ch; }
.cap-enter-active, .cap-leave-active { transition: opacity 0.3s ease, transform 0.4s cubic-bezier(.19,1,.22,1); }
.cap-enter-from { opacity: 0; transform: translateY(14rem); }
.cap-leave-to { opacity: 0; transform: translateY(-8rem); }
.arc__dots { position: absolute; left: 50%; bottom: calc(34rem + var(--safe-bottom)); translate: -50% 0; display: flex; gap: 10rem; }
.arc__dot { width: 9rem; height: 9rem; border-radius: 50%; padding: 0; border: 1px solid var(--color-glass-border); background: transparent; cursor: pointer; transition: transform 0.3s var(--ease-spring), background 0.3s ease; }
.arc__dot.on { background: var(--color-text); border-color: var(--color-text); transform: scale(1.3); }
</style>
