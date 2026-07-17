<script setup lang="ts">
import { CurvedReel, type ReelFrame } from '~/utils/reel/curvedReel'

definePageMeta({ layout: false, pageTransition: { name: 'reel-fade', mode: 'out-in' } })
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'A short introduction to Naveen Jose, a certified instructional designer: from a hospitality background into L&D at Club Mahindra, Marriott, and now Concentrix.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'A certified instructional designer. A short story of how I got into designing learning, told as a curved film reel.',
  ogUrl: 'https://entertrainer.in/about'
})

// aspect = the image's own width/height. The reel sizes each frame to this
// exactly, so every photo fills its window edge-to-edge — no cropping, no
// letterbox bars, whatever the source orientation.
interface Scene { badge: string; head: string; caption: string; img: string; aspect: number; footnote?: string }
const SCENES: Scene[] = [
  { badge: 'Hello', head: 'I’m Naveen Jose', caption: 'A certified instructional designer, based in Gurugram. Here’s the short version of how I got here.', img: '/about-me.png', aspect: 1920 / 1080 },
  { badge: 'Where it began', head: 'It started in hospitality', caption: 'I studied hotel management in Chennai and began on the floor. Hospitality taught me to pay attention to the small things that make service feel human.', img: '/about/about-housekeeper-1.webp', aspect: 600 / 800 },
  { badge: 'First step into L&D', head: 'A comic, and a new path', caption: 'At Club Mahindra I moved into learning and development, and drew The SEWA Chronicles — a small comic of real guest-experience stories. That’s where design became the plan.', img: '/about/about-sewa-1.webp', aspect: 1600 / 900 },
  { badge: 'Marriott', head: 'Learning the craft', caption: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams, from frontline associates through to managers.', img: '/about/about-onboarding.webp', aspect: 1131 / 1600 },
  { badge: 'The tools', head: 'Building the modules', caption: 'I build training in Articulate Storyline, with a little video and animation, trying to make each module something people actually want to finish.', img: '/about/about-ignite.webp', aspect: 1131 / 1600 },
  { badge: 'Now', head: 'Where I am today', caption: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world.', img: '/about/about-concentrix.webp', aspect: 768 / 768, footnote: 'Asatoma Sadgamaya — from ignorance, toward truth.' }
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

// Drag anywhere on the reel; a still tap steps the story (left third = back).
let downX = 0, downY = 0, dragMoved = false
function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  playing.value = false
  downX = e.clientX; downY = e.clientY; dragMoved = false
  reel?.startDrag(e.clientX)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
function onPointerMove(e: PointerEvent) {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) dragMoved = true
  reel?.moveDrag(e.clientX)
}
function onPointerUp(e: PointerEvent) {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  reel?.endDrag()
  if (!dragMoved) {
    if (e.clientX < window.innerWidth * 0.3) prev()
    else next()
  }
}

// Wheel works everywhere on the page, not just over the canvas.
let wheelLock = false
function onWheel(e: WheelEvent) {
  if (e.ctrlKey) return
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  if (Math.abs(d) < 18 || wheelLock) return
  wheelLock = true; playing.value = false
  if (d > 0) next(); else prev()
  setTimeout(() => { wheelLock = false }, 420)
}

// Keyboard: arrows step, space toggles play.
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') { playing.value = false; next() }
  else if (e.key === 'ArrowLeft') { playing.value = false; prev() }
  else if (e.key === ' ' && e.target === document.body) { e.preventDefault(); toggle() }
}

// The reel leans toward the cursor for a touch of life between interactions.
function onHover(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  reel?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
}

function onResize() { if (reel) reel.resize(window.innerWidth, window.innerHeight) }

onMounted(() => {
  reduce.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (reduce.value) playing.value = false
  reel = new CurvedReel(cv.value!, SCENES as ReelFrame[])
  reel.onIndex = (i) => { index.value = i; progress.value = 0 }
  reel.resize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', onResize)
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointermove', onHover, { passive: true })
  last = 0
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointermove', onHover)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  reel?.dispose()
})
</script>

<template>
  <div class="areel">
    <UiGlassBackdrop />
    <div class="areel__scrim" aria-hidden="true" />
    <canvas
      ref="cv" class="areel__canvas"
      @pointerdown="onPointerDown"
      aria-hidden="true"
    />

    <header class="areel__top">
      <NuxtLink to="/" class="glass-btn glass-btn--ghost areel__ic" aria-label="Back to the site">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      </NuxtLink>
      <span class="areel__word">NAVEEN JOSE</span>
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
    </div>
  </div>
</template>

<style scoped>
.areel { position: fixed; inset: 0; overflow: hidden; color: var(--color-text); }
/* Calm the living glass into a quiet, clean backdrop. */
.areel__scrim {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    linear-gradient(color-mix(in srgb, var(--color-bg) 66%, transparent), color-mix(in srgb, var(--color-bg) 66%, transparent)),
    radial-gradient(135% 105% at 50% 32%, transparent 34%, var(--color-bg) 100%);
}
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
.areel__cap-in > * { text-shadow: 0 2rem 26rem var(--color-bg); }
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
.areel__seek { flex: 1; display: flex; gap: 5rem; }
.areel__seg { flex: 1; height: 6rem; border-radius: 999rem; background: var(--color-glass-bg); border: 1px solid var(--color-glass-border); overflow: hidden; cursor: pointer; padding: 0; }
.areel__seg-fill { display: block; height: 100%; background: var(--color-text); opacity: 0.9; border-radius: 999rem; }
.areel__seg.cur .areel__seg-fill { transition: width 0.1s linear; }
.areel__seg:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }

/* Filmic hand-off: the old caption slips away fast, the new one rises in soft. */
.reel-swap-enter-active { transition: opacity 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1); }
.reel-swap-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.reel-swap-enter-from { opacity: 0; transform: translateY(14rem); }
.reel-swap-leave-to { opacity: 0; transform: translateY(-6rem); }
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
