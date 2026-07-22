<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Momentum Ring — Lab', robots: 'noindex' })
const N = LAB_NAV.length
const SEP = (Math.PI * 2) / N
const ang = ref(0)
let vel = 0, raf = 0
const router = useRouter()
const active = computed(() => { let best = 0, bd = 9; for (let i = 0; i < N; i++) { let a = (i * SEP + ang.value) % (Math.PI * 2); a = Math.atan2(Math.sin(a), Math.cos(a)); if (Math.abs(a) < bd) { bd = Math.abs(a); best = i } } return best })

function tick() {
  if (!dragging) {
    // spring toward nearest card + friction, so it always settles on a card
    const target = -Math.round(ang.value / SEP) * SEP
    vel += (target - ang.value) * 0.008
    vel *= 0.90
    ang.value += vel
  }
  raf = requestAnimationFrame(tick)
}
let dragging = false, lastX = 0, lastT = 0
function onDown(e: PointerEvent) { dragging = true; lastX = e.clientX; lastT = performance.now(); vel = 0; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) { if (!dragging) return; const now = performance.now(); const dx = e.clientX - lastX; ang.value += dx * 0.006; vel = dx * 0.006 * (16 / Math.max(now - lastT, 8)); lastX = e.clientX; lastT = now }
function onUp() { dragging = false }
function style(i: number) {
  const a = i * SEP + ang.value
  const R = 92, cx = 50, cy = 128
  const x = cx + Math.sin(a) * R, y = cy - Math.cos(a) * R
  const front = Math.cos(a)
  const sc = 0.55 + Math.max(0, front) * 0.55
  return { left: x + 'vw', top: y + 'vh', transform: `translate(-50%,-50%) rotate(${a}rad) scale(${sc})`, opacity: String(Math.max(0, front + 0.15)), zIndex: String(Math.round(front * 100)) }
}
function go(i: number) { if (i === active.value) router.push(LAB_NAV[i].href) }
onMounted(() => { raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <LabFrame n="02" name="Momentum Ring" hint="flick to spin">
    <div class="rg" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
      <button v-for="(item, i) in LAB_NAV" :key="item.href" class="rg__card" :style="style(i)" @click="go(i)" :aria-label="item.label">
        <img :src="item.img" :alt="''" draggable="false" />
      </button>
      <div class="rg__cap">
        <Transition name="rg" mode="out-in">
          <div :key="active" class="rg__cap-in">
            <span class="rg__n">{{ LAB_NAV[active].n }}</span>
            <h1 class="rg__label">{{ LAB_NAV[active].label }}</h1>
            <p class="rg__desc">{{ LAB_NAV[active].desc }} · tap to open</p>
          </div>
        </Transition>
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.rg { position: absolute; inset: 0; overflow: hidden; touch-action: none; cursor: grab; }
.rg:active { cursor: grabbing; }
.rg__card { position: absolute; width: 260rem; height: 330rem; padding: 0; border: 0; border-radius: 16rem; overflow: hidden; background: var(--color-glass-bg); box-shadow: 0 40rem 80rem -40rem rgba(0,0,0,0.55), 0 0 0 1px var(--color-glass-border); cursor: pointer; will-change: transform, opacity; }
.rg__card img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.rg__cap { position: absolute; left: 0; right: 0; top: clamp(120rem, 20vh, 200rem); text-align: center; pointer-events: none; padding: 0 24rem; }
.rg__n { font-family: var(--serif); font-size: 14rem; opacity: 0.5; }
.rg__label { font-family: var(--serif); font-weight: 400; font-size: clamp(40rem, 7vw, 88rem); line-height: 1; margin: 4rem 0 0; letter-spacing: -0.02em; }
.rg__desc { font-size: 14rem; opacity: 0.6; margin: 8rem 0 0; }
.rg-enter-active, .rg-leave-active { transition: opacity 0.3s ease, transform 0.4s cubic-bezier(.19,1,.22,1); }
.rg-enter-from { opacity: 0; transform: translateY(12rem); }
.rg-leave-to { opacity: 0; transform: translateY(-8rem); }
</style>
