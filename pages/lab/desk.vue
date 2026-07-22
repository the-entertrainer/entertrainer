<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'The Desk — Lab', robots: 'noindex' })

const SPOTS = [
  { x: 180, y: 150, rot: -4 }, { x: 900, y: 90, rot: 3 },
  { x: 300, y: 640, rot: 5 }, { x: 1000, y: 600, rot: -3 }
]
const CW = 1560, CH = 1120
const panX = ref(0), panY = ref(0)
const drift = ref(0)
let dragging = false, sx = 0, sy = 0, bx = 0, by = 0, moved = false, raf = 0, t = 0
const router = useRouter()

function clamp() {
  const vw = window.innerWidth, vh = window.innerHeight
  panX.value = Math.max(Math.min(panX.value, 40), vw - CW - 40)
  panY.value = Math.max(Math.min(panY.value, 40), vh - CH - 40)
}
function center() { panX.value = (window.innerWidth - CW) / 2; panY.value = (window.innerHeight - CH) / 2; clamp() }
function onDown(e: PointerEvent) { dragging = true; moved = false; sx = e.clientX; sy = e.clientY; bx = panX.value; by = panY.value; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) { if (!dragging) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.hypot(dx, dy) > 6) moved = true; panX.value = bx + dx; panY.value = by + dy; clamp() }
function onUp() { dragging = false }
function tick() { t += 0.016; drift.value = Math.sin(t * 0.4) * 14; raf = requestAnimationFrame(tick) }
function go(e: MouseEvent, href: string) { if (moved) { e.preventDefault(); return } router.push(href) }
onMounted(() => { center(); raf = requestAnimationFrame(tick); window.addEventListener('resize', center) })
onBeforeUnmount(() => { cancelAnimationFrame(raf); window.removeEventListener('resize', center) })
</script>

<template>
  <LabFrame n="09" name="The Desk" hint="drag to roam">
    <div class="dsk" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
      <div class="dsk__canvas" :style="{ transform: `translate(${panX + drift}px, ${panY - drift}px)`, width: CW + 'rem', height: CH + 'rem' }">
        <span class="dsk__hi">Naveen Jose — pull the desk around</span>
        <NuxtLink v-for="(item, i) in LAB_NAV" :key="item.href" :to="item.href" class="dsk__card" :style="{ left: SPOTS[i].x + 'rem', top: SPOTS[i].y + 'rem', '--rot': SPOTS[i].rot + 'deg' }" @click="go($event, item.href)">
          <div class="dsk__img"><img :src="item.img" :alt="''" draggable="false" /></div>
          <span class="dsk__n">{{ item.n }}</span>
          <strong class="dsk__label">{{ item.label }}</strong>
          <span class="dsk__desc">{{ item.desc }}</span>
        </NuxtLink>
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.dsk { position: absolute; inset: 0; overflow: hidden; cursor: grab; touch-action: none; background-image: radial-gradient(color-mix(in srgb, var(--color-text) 8%, transparent) 1px, transparent 1px); background-size: 26rem 26rem; }
.dsk:active { cursor: grabbing; }
.dsk__canvas { position: absolute; left: 0; top: 0; will-change: transform; }
.dsk__hi { position: absolute; left: 180rem; top: 60rem; font-family: var(--serif); font-style: italic; font-size: 22rem; opacity: 0.5; }
.dsk__card { position: absolute; width: 300rem; padding: 14rem 14rem 20rem; background: var(--color-bg); border: 1px solid var(--color-glass-border); border-radius: 12rem; box-shadow: 0 30rem 60rem -30rem rgba(0,0,0,0.5); text-decoration: none; color: var(--color-text); transform: rotate(var(--rot)); transition: transform 0.3s var(--ease-spring); }
@media (hover: hover) { .dsk__card:hover { transform: rotate(0deg) scale(1.03); z-index: 5; } }
.dsk__img { width: 100%; aspect-ratio: 3 / 2; border-radius: 7rem; overflow: hidden; }
.dsk__img img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.dsk__n { display: inline-block; margin-top: 12rem; font-family: var(--serif); font-size: 13rem; opacity: 0.5; }
.dsk__label { display: block; font-family: var(--serif); font-weight: 400; font-size: 28rem; margin: 2rem 0 5rem; }
.dsk__desc { font-size: 12.5rem; opacity: 0.6; line-height: 1.4; }
</style>
