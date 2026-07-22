<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Gooey Metaballs — Lab', robots: 'noindex' })
const router = useRouter()
interface B { x: number; y: number; r: number; bx: number; by: number; ph: number }
const blobs = reactive<B[]>([])
const active = ref(-1)
const mouse = { x: -999, y: -999 }
let raf = 0, t = 0

function layout() {
  const w = innerWidth, h = innerHeight
  const cols = w < 720 ? 1 : 2
  blobs.length = 0
  LAB_NAV.forEach((_, i) => {
    const col = cols === 1 ? 0 : i % 2, row = cols === 1 ? i : Math.floor(i / 2)
    const bx = w * (cols === 1 ? 0.5 : (col === 0 ? 0.34 : 0.66))
    const by = h * (0.30 + row * (cols === 1 ? 0.16 : 0.34))
    blobs.push({ x: bx, y: by, bx, by, r: 92, ph: i * 1.7 })
  })
}
function tick() {
  t += 0.016
  let near = -1, nd = 150
  blobs.forEach((b, i) => {
    const dx = mouse.x - b.bx, dy = mouse.y - b.by
    const d = Math.hypot(dx, dy)
    const pull = d < 260 ? (1 - d / 260) * 0.5 : 0
    b.x = b.bx + Math.sin(t * 0.7 + b.ph) * 14 + dx * pull
    b.y = b.by + Math.cos(t * 0.6 + b.ph) * 14 + dy * pull
    const dm = Math.hypot(mouse.x - b.x, mouse.y - b.y)
    b.r += ((dm < 110 ? 118 : 92) - b.r) * 0.12
    if (dm < nd) { nd = dm; near = i }
  })
  active.value = near
  raf = requestAnimationFrame(tick)
}
function onMove(e: PointerEvent) { mouse.x = e.clientX; mouse.y = e.clientY }
function onLeave() { mouse.x = -999; mouse.y = -999 }
function go(i: number) { router.push(LAB_NAV[i].href) }
onMounted(() => { layout(); raf = requestAnimationFrame(tick); addEventListener('resize', layout) })
onBeforeUnmount(() => { cancelAnimationFrame(raf); removeEventListener('resize', layout) })
</script>

<template>
  <LabFrame n="03" name="Gooey Metaballs" hint="move through them">
    <div class="mb" @pointermove="onMove" @pointerleave="onLeave">
      <svg class="mb__svg" aria-hidden="true">
        <defs>
          <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b" /><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" /></filter>
        </defs>
        <g :filter="'url(#goo)'">
          <circle v-for="(b, i) in blobs" :key="i" :cx="b.x" :cy="b.y" :r="b.r" fill="var(--color-text)" />
        </g>
      </svg>
      <button v-for="(item, i) in LAB_NAV" :key="item.href" class="mb__label" :class="{ on: active === i }"
        :style="{ transform: `translate(${blobs[i]?.x || 0}px, ${blobs[i]?.y || 0}px)` }" @click="go(i)" @pointerenter="active = i">
        <span class="mb__n">{{ item.n }}</span>
        <span class="mb__t">{{ item.label }}</span>
      </button>
      <p class="mb__hint">move the cursor — the ink follows and merges</p>
    </div>
  </LabFrame>
</template>

<style scoped>
.mb { position: absolute; inset: 0; overflow: hidden; }
.mb__svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.mb__label { position: absolute; top: 0; left: 0; margin: -40rem 0 0 -80rem; width: 160rem; display: grid; place-items: center; gap: 3rem; background: none; border: 0; color: var(--color-bg); cursor: pointer; text-align: center; transition: opacity 0.3s ease; }
.mb__n { font-family: var(--serif); font-size: 12rem; opacity: 0.7; }
.mb__t { font-family: var(--serif); font-weight: 400; font-size: clamp(19rem, 2.2vw, 26rem); line-height: 1.05; }
.mb__label.on .mb__t { text-decoration: underline; text-underline-offset: 4rem; }
.mb__hint { position: absolute; left: 50%; bottom: calc(40rem + var(--safe-bottom)); translate: -50% 0; font-family: var(--serif); font-style: italic; font-size: 14rem; opacity: 0.5; }
</style>
