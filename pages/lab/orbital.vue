<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Orbital Depth — Lab', robots: 'noindex' })
const N = LAB_NAV.length
const BASE = [{ a: 0, y: -50, r: 1.0 }, { a: Math.PI / 2, y: 40, r: 1.12 }, { a: Math.PI, y: -14, r: 0.95 }, { a: 3 * Math.PI / 2, y: 60, r: 1.05 }]
const ry = ref(0), rx = ref(0)
let vry = 0, rxT = 0, raf = 0, dragging = false, lastX = 0, lastY = 0, lastT = 0
const router = useRouter()
const SEP = (Math.PI * 2) / N
const active = computed(() => { let best = 0, bd = -9; for (let i = 0; i < N; i++) { const dp = Math.cos(BASE[i].a + ry.value); if (dp > bd) { bd = dp; best = i } } return best })

function tick() {
  if (!dragging) { const target = -Math.round(ry.value / SEP) * SEP; vry += (target - ry.value) * 0.006; vry *= 0.92; ry.value += vry; rxT *= 0.9 }
  rx.value += (rxT - rx.value) * 0.08
  raf = requestAnimationFrame(tick)
}
function style(i: number) {
  const ang = BASE[i].a + ry.value
  const depth = Math.cos(ang), nf = (depth + 1) / 2
  const x = 50 + Math.sin(ang) * 26 * BASE[i].r
  const y = 46 + BASE[i].y / 10 + rx.value * 14
  const scale = 0.5 + nf * 0.62, blur = (1 - nf) * 8, op = 0.2 + nf * 0.8
  return { left: x + 'vw', top: y + 'vh', transform: `translate(-50%,-50%) scale(${scale})`, filter: `blur(${blur}rem)`, opacity: String(op), zIndex: String(Math.round(nf * 100)) }
}
function onDown(e: PointerEvent) { dragging = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now(); vry = 0; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) { if (!dragging) return; const now = performance.now(); const dx = e.clientX - lastX, dy = e.clientY - lastY; ry.value += dx * 0.006; rxT = Math.max(-1.2, Math.min(1.2, rxT - dy * 0.01)); vry = dx * 0.006 * (16 / Math.max(now - lastT, 8)); lastX = e.clientX; lastY = e.clientY; lastT = now }
function onUp() { dragging = false }
function go(i: number) { if (i === active.value) router.push(LAB_NAV[i].href) }
onMounted(() => { raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <LabFrame n="10" name="Orbital Depth" hint="drag to orbit">
    <div class="ob" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
      <button v-for="(item, i) in LAB_NAV" :key="item.href" class="ob__card" :style="style(i)" @click="go(i)" :aria-label="item.label">
        <img :src="item.img" :alt="''" draggable="false" />
      </button>
      <div class="ob__cap">
        <Transition name="ob" mode="out-in">
          <div :key="active" class="ob__cap-in">
            <span class="ob__n">{{ LAB_NAV[active].n }}</span>
            <h1 class="ob__label">{{ LAB_NAV[active].label }}</h1>
            <p class="ob__desc">{{ LAB_NAV[active].desc }} · tap to open</p>
          </div>
        </Transition>
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.ob { position: absolute; inset: 0; overflow: hidden; touch-action: none; cursor: grab; }
.ob:active { cursor: grabbing; }
.ob__card { position: absolute; width: 300rem; height: 380rem; padding: 0; border: 0; border-radius: 16rem; overflow: hidden; background: var(--color-glass-bg); box-shadow: 0 40rem 80rem -40rem rgba(0,0,0,0.55), 0 0 0 1px var(--color-glass-border); cursor: pointer; will-change: transform, filter, opacity; }
.ob__card img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.ob__cap { position: absolute; left: 0; right: 0; bottom: clamp(60rem, 12vh, 120rem); text-align: center; pointer-events: none; padding: 0 24rem; }
.ob__n { font-family: var(--serif); font-size: 14rem; opacity: 0.5; }
.ob__label { font-family: var(--serif); font-weight: 400; font-size: clamp(40rem, 7vw, 88rem); line-height: 1; margin: 4rem 0 0; letter-spacing: -0.02em; }
.ob__desc { font-size: 14rem; opacity: 0.6; margin: 8rem 0 0; }
.ob-enter-active, .ob-leave-active { transition: opacity 0.3s ease, transform 0.4s cubic-bezier(.19,1,.22,1); }
.ob-enter-from { opacity: 0; transform: translateY(12rem); } .ob-leave-to { opacity: 0; transform: translateY(-8rem); }
</style>
