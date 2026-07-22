<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Elastic Peel — Lab', robots: 'noindex' })
const N = LAB_NAV.length
const idx = ref(0)
const x = ref(0)
const router = useRouter()
let v = 0, springV = 0, mode: 'idle' | 'drag' | 'fling' = 'idle', tx = 0, raf = 0
let startX = 0, base = 0, lastX = 0, lastV = 0, moved = false

function rel(i: number) { return (i - idx.value + N) % N }
function tick() {
  if (mode === 'drag') { x.value += (tx - x.value) * 0.35 }
  else if (mode === 'fling') { x.value += v; v *= 0.985; if (Math.abs(x.value) > innerWidth * 0.8) { idx.value = (idx.value + 1) % N; x.value = 0; v = 0; springV = 0; mode = 'idle' } }
  else { springV += (0 - x.value) * 0.16; springV *= 0.76; x.value += springV; if (Math.abs(x.value) < 0.3 && Math.abs(springV) < 0.3) { x.value = 0; springV = 0 } }
  raf = requestAnimationFrame(tick)
}
function topStyle() { return { transform: `translateX(${x.value}rem) rotate(${x.value * 0.045}deg)`, zIndex: '50' } }
function behind(i: number) { const r = Math.min(rel(i), 3); return { transform: `translateY(${r * 18}rem) scale(${1 - r * 0.05})`, opacity: rel(i) > 3 ? '0' : String(1 - r * 0.16), zIndex: String(49 - r) } }
function onDown(e: PointerEvent) { mode = 'drag'; moved = false; startX = e.clientX; base = x.value; lastX = e.clientX; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) { if (mode !== 'drag') return; tx = base + (e.clientX - startX); if (Math.abs(e.clientX - startX) > 6) moved = true; lastV = e.clientX - lastX; lastX = e.clientX }
function onUp() { if (mode !== 'drag') return; if (Math.abs(x.value) > 110 || Math.abs(lastV) > 16) { mode = 'fling'; v = (x.value !== 0 ? Math.sign(x.value) : Math.sign(lastV)) * Math.max(Math.abs(lastV), 16) } else mode = 'idle' }
function onCard(i: number) { if (moved || mode === 'fling') return; if (rel(i) === 0) router.push(LAB_NAV[i].href) }
function toss() { mode = 'fling'; v = -20 }
onMounted(() => { raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <LabFrame n="08" name="Elastic Peel" hint="peel & toss">
    <div class="pl">
      <div class="pl__stack" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
        <button v-for="(item, i) in LAB_NAV" :key="item.href" class="pl__card" :style="rel(i) === 0 ? topStyle() : behind(i)" @click="onCard(i)" :aria-label="item.label">
          <img :src="item.img" :alt="''" draggable="false" />
          <span class="pl__meta"><span class="pl__n">{{ item.n }}</span><strong class="pl__label">{{ item.label }}</strong><span class="pl__desc">{{ item.desc }}</span></span>
        </button>
      </div>
      <button class="pl__toss" @click="toss">toss →</button>
    </div>
  </LabFrame>
</template>

<style scoped>
.pl { position: absolute; inset: 0; display: grid; place-items: center; }
.pl__stack { position: relative; width: min(360rem, 82vw); height: 500rem; touch-action: none; }
.pl__card { position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; border-radius: 20rem; overflow: hidden; background: var(--color-bg); box-shadow: 0 50rem 90rem -40rem rgba(0,0,0,0.5), 0 0 0 1px var(--color-glass-border); cursor: grab; text-align: left; will-change: transform; }
.pl__card:active { cursor: grabbing; }
.pl__card img { width: 100%; height: 62%; object-fit: cover; display: block; pointer-events: none; }
.pl__meta { display: block; padding: 18rem 22rem; }
.pl__n { font-family: var(--serif); font-size: 13rem; opacity: 0.5; }
.pl__label { display: block; font-family: var(--serif); font-weight: 400; font-size: 32rem; margin: 2rem 0 6rem; }
.pl__desc { font-size: 13rem; opacity: 0.6; line-height: 1.4; }
.pl__toss { position: absolute; bottom: calc(40rem + var(--safe-bottom)); left: 50%; translate: -50% 0; background: none; border: 0; color: var(--color-text); opacity: 0.55; font-family: var(--serif); font-style: italic; font-size: 15rem; cursor: pointer; }
.pl__toss:hover { opacity: 1; }
</style>
