<script setup lang="ts">
import { CurvedReel, type ReelFrame } from '~/utils/reel/curvedReel'

definePageMeta({ layout: false, pageTransition: { name: 'reel-fade', mode: 'out-in' } })
useSeoMeta({
  title: 'About — Naveen Jose, in a reel · Entertrainer',
  description: 'The story behind Entertrainer, told as a curved 3D film reel: from folding towels at a hotel to designing learning for banking teams.',
  ogTitle: 'Naveen Jose, in a reel',
  ogDescription: 'From folding towels at a hotel to designing how people learn. The whole story as a 3D film reel.',
  ogUrl: 'https://entertrainer.in/about'
})

interface Scene { badge: string; head: string; caption: string; img: string; fit?: 'cover' | 'contain'; footnote?: string }
const SCENES: Scene[] = [
  { badge: 'The reel', head: 'This is me, in a reel', caption: 'From folding towels at a hotel to designing how people learn. The whole thing, one frame at a time.', img: '/about-me.png', fit: 'contain' },
  { badge: 'The floor', head: 'It started on the floor', caption: 'Hotel rooms at Club Mahindra and Marriott. Turning chaos into a feeling that someone had your back.', img: '/about/about-housekeeper-1.webp', fit: 'cover', footnote: 'I still fold towels that way at home.' },
  { badge: 'The spark', head: 'A comic lit the spark', caption: 'We turned dry service standards into a comic called SEWA Chronicles. People actually read it, and smiled.', img: '/about/about-sewa-1.webp', fit: 'contain' },
  { badge: 'The craft', head: 'Learning that feels human', caption: 'Leadership programs and trainer trainings at Marriott. The best rooms were the ones where tired people leaned forward.', img: '/about/about-ignite.webp', fit: 'contain' },
  { badge: 'The present', head: 'A face people trust', caption: 'Now with banking teams at Concentrix, turning tangled new systems into something a person can see themselves doing.', img: '/about/about-concentrix.webp', fit: 'cover' },
  { badge: 'Still day one', head: 'An idea they carry', caption: 'The moment an idea stops being an idea and becomes something someone keeps. That quiet shift is the whole point.', img: '/about/about-onboarding.webp', fit: 'contain', footnote: 'Asatoma Sadgamaya.' }
]

const SCENE_MS = 5200
const index = ref(0)
const progress = ref(0)
const playing = ref(true)
const reduce = ref(false)
const scene = computed(() => SCENES[index.value])
const atEnd = computed(() => index.value === SCENES.length - 1)

const cv = ref<HTMLCanvasElement | null>(null)
let reel: CurvedReel | null = null
let raf = 0, last = 0

function tick(now: number) {
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
  last = now
  if (playing.value && !reduce.value && !reel?.isDragging) {
    progress.value += (dt * 1000) / SCENE_MS
    if (progress.value >= 1) {
      if (index.value < SCENES.length - 1) { index.value++; progress.value = 0 }
      else { progress.value = 1; playing.value = false }
    }
  }
  reel?.update(dt)
  raf = requestAnimationFrame(tick)
}

watch(index, (i) => reel?.setIndex(i))
function goTo(i: number) { index.value = Math.max(0, Math.min(SCENES.length - 1, i)); progress.value = 0 }
function next() { if (!atEnd.value) goTo(index.value + 1); else playing.value = false }
function prev() { goTo(index.value - 1) }
function toggle() { if (atEnd.value && !playing.value) { goTo(0); playing.value = true; return } playing.value = !playing.value }

// Drag + wheel through the reel.
function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  playing.value = false
  reel?.startDrag(e.clientX)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
function onPointerMove(e: PointerEvent) { reel?.moveDrag(e.clientX) }
function onPointerUp() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  reel?.endDrag()
}
let wheelLock = false
function onWheel(e: WheelEvent) {
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  if (Math.abs(d) < 18 || wheelLock) return
  wheelLock = true; playing.value = false
  if (d > 0) next(); else prev()
  setTimeout(() => { wheelLock = false }, 420)
}

function onResize() { if (reel) reel.resize(window.innerWidth, window.innerHeight) }

onMounted(() => {
  reduce.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (reduce.value) playing.value = false
  reel = new CurvedReel(cv.value!, SCENES as ReelFrame[])
  reel.onIndex = (i) => { index.value = i; progress.value = 0 }
  reel.resize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', onResize)
  last = 0
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  reel?.dispose()
})
</script>

<template>
  <div class="areel">
    <UiGlassBackdrop />
    <canvas
      ref="cv" class="areel__canvas"
      @pointerdown="onPointerDown" @wheel.passive="onWheel"
      aria-hidden="true"
    />

    <header class="areel__top">
      <NuxtLink to="/" class="glass-btn glass-btn--ghost areel__ic" aria-label="Back to the site">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      </NuxtLink>
      <span class="areel__word">MY STORY</span>
      <NuxtLink to="/my-work" class="glass-btn areel__ic" aria-label="See my work">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </NuxtLink>
    </header>

    <div class="areel__cap">
      <Transition name="reel-swap" mode="out-in">
        <div :key="index" class="areel__cap-in">
          <span class="areel__badge">{{ scene.badge }}</span>
          <h1 class="areel__head">{{ scene.head }}</h1>
          <p class="areel__caption">{{ scene.caption }}</p>
          <p v-if="scene.footnote" class="areel__foot">{{ scene.footnote }}</p>
          <div v-if="atEnd" class="areel__cta">
            <NuxtLink to="/my-work" class="glass-btn">See my work</NuxtLink>
            <button type="button" class="glass-btn glass-btn--ghost" @click="goTo(0); playing = true">Replay</button>
          </div>
        </div>
      </Transition>
    </div>

    <div class="areel__bar">
      <button type="button" class="glass-btn areel__play" :aria-label="playing ? 'Pause' : 'Play'" @click="toggle">
        <svg v-if="playing" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </button>
      <div class="areel__seek">
        <button
          v-for="(s, i) in SCENES" :key="i" type="button" class="areel__seg"
          :class="{ done: i < index, cur: i === index }" :aria-label="`Scene ${i + 1}: ${s.head}`" @click="goTo(i)"
        ><span class="areel__seg-fill" :style="{ width: i < index ? '100%' : i === index ? progress * 100 + '%' : '0%' }" /></button>
      </div>
      <div class="areel__nav">
        <button type="button" class="glass-btn glass-btn--ghost areel__sm" aria-label="Previous" :disabled="index === 0" @click="prev">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
        </button>
        <button type="button" class="glass-btn glass-btn--ghost areel__sm" aria-label="Next" :disabled="atEnd" @click="next">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.areel { position: fixed; inset: 0; overflow: hidden; color: var(--color-text); }
.areel__canvas { position: fixed; inset: 0; z-index: 1; display: block; touch-action: none; cursor: grab; }
.areel__canvas:active { cursor: grabbing; }

.areel__top {
  position: fixed; top: 0; left: 0; right: 0; z-index: 3; pointer-events: none;
  display: flex; align-items: center; justify-content: space-between; gap: 12rem;
  max-width: 760rem; margin: 0 auto; padding: calc(16rem + var(--safe-top)) 22rem 0;
}
.areel__top > * { pointer-events: auto; }
.areel__word { font-size: 12rem; letter-spacing: 0.22em; font-weight: 600; opacity: 0.6; }
.areel__ic { width: 44rem; height: 44rem; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }

.areel__cap {
  position: fixed; left: 0; right: 0; bottom: 108rem; z-index: 3; pointer-events: none;
  max-width: 620rem; margin: 0 auto; padding: 0 26rem; text-align: center;
}
.areel__cap-in > * { text-shadow: 0 1rem 22rem var(--color-bg), 0 0 8rem var(--color-bg); }
.areel__badge {
  display: inline-block; pointer-events: auto; font-size: 12rem; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-text); background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  padding: 6rem 14rem; border-radius: 999rem; text-shadow: none;
}
.areel__head { font-size: clamp(30rem, 5.6vw, 54rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.02em; margin: 18rem 0 0; }
.areel__caption { margin: 14rem auto 0; max-width: 46ch; font-size: clamp(14.5rem, 2vw, 17rem); line-height: 1.55; opacity: 0.82; }
.areel__foot { margin-top: 12rem; font-size: 13rem; font-style: italic; opacity: 0.6; }
.areel__cta { margin-top: 22rem; display: flex; gap: 10rem; justify-content: center; pointer-events: auto; }
.areel__cta .glass-btn { text-decoration: none; }

.areel__bar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 3;
  display: flex; align-items: center; gap: 14rem;
  max-width: 620rem; margin: 0 auto; padding: 14rem 24rem calc(20rem + var(--safe-bottom));
}
.areel__play { width: 52rem; height: 52rem; padding: 0; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
.areel__sm { width: 36rem; height: 36rem; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
.areel__seek { flex: 1; display: flex; gap: 5rem; }
.areel__seg { flex: 1; height: 6rem; border-radius: 999rem; background: var(--color-glass-bg); border: 1px solid var(--color-glass-border); overflow: hidden; cursor: pointer; padding: 0; }
.areel__seg-fill { display: block; height: 100%; background: var(--color-text); opacity: 0.9; border-radius: 999rem; }
.areel__seg.cur .areel__seg-fill { transition: width 0.1s linear; }
.areel__seg:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }
.areel__nav { display: flex; gap: 6rem; flex-shrink: 0; }

.reel-swap-enter-active, .reel-swap-leave-active { transition: opacity 0.32s ease, transform 0.32s ease; }
.reel-swap-enter-from { opacity: 0; transform: translateY(10rem); }
.reel-swap-leave-to { opacity: 0; transform: translateY(-8rem); }
.reel-fade-enter-active, .reel-fade-leave-active { transition: opacity 0.3s ease; }
.reel-fade-enter-from, .reel-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .reel-swap-enter-active, .reel-swap-leave-active { transition: opacity 0.2s ease; }
  .reel-swap-enter-from, .reel-swap-leave-to { transform: none; }
}
@media (max-width: 640px) {
  .areel__cap { bottom: 96rem; }
  .areel__head { font-size: clamp(26rem, 7.5vw, 40rem); }
}
</style>
