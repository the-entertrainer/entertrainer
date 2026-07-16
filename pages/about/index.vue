<script setup lang="ts">
// About, told as a film reel: an auto-playing strip of real photos from the
// journey, each with a badge, a bold headline and a caption, with a play/scrub
// control bar. Inspired by the "story reel" format, tuned to a cinematic look.

definePageMeta({ layout: false, pageTransition: { name: 'reel-fade', mode: 'out-in' } })
useHead({
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap' }]
})
useSeoMeta({
  title: 'About — Naveen Jose, in a reel · Entertrainer',
  description: 'The story behind Entertrainer, told as a film reel: from folding towels at a hotel to designing learning for banking teams.',
  ogTitle: 'Naveen Jose, in a reel',
  ogDescription: 'From folding towels at a hotel to designing how people learn. The whole story in a reel.',
  ogUrl: 'https://entertrainer.in/about'
})

interface Scene { id: string; badge: string; head: string; caption: string; img: string; fit?: 'cover' | 'contain'; footnote?: string }

const SCENES: Scene[] = [
  { id: 'intro', badge: 'The reel', head: 'This is me, in a reel', caption: 'From folding towels at a hotel to designing how people learn. Here is the whole thing, one frame at a time.', img: '/about-me.png', fit: 'contain' },
  { id: 'floor', badge: 'The floor', head: 'It started on the floor', caption: 'Hotel rooms at Club Mahindra and Marriott. Turning chaos into a feeling that someone had your back.', img: '/about/about-housekeeper-1.webp', fit: 'cover', footnote: 'I still fold towels that way at home.' },
  { id: 'spark', badge: 'The spark', head: 'A comic lit the spark', caption: 'We turned dry service standards into a comic called SEWA Chronicles. People actually read it, and smiled at their desks.', img: '/about/about-sewa-1.webp', fit: 'contain' },
  { id: 'craft', badge: 'The craft', head: 'Learning that feels human', caption: 'Leadership programs and trainer trainings at Marriott. The best rooms were the ones where tired people leaned forward.', img: '/about/about-ignite.webp', fit: 'contain' },
  { id: 'present', badge: 'The present', head: 'A face people trust', caption: 'Now with banking teams at Concentrix, turning tangled new systems into something a person can see themselves doing.', img: '/about/about-concentrix.webp', fit: 'cover' },
  { id: 'now', badge: 'Still day one', head: 'An idea they carry', caption: 'The moment an idea stops being an idea and becomes something someone keeps. That quiet shift is the whole point.', img: '/about/about-onboarding.webp', fit: 'contain', footnote: 'Asatoma Sadgamaya.' }
]

const SCENE_MS = 5200
const index = ref(0)
const progress = ref(0)
const playing = ref(true)
const reduce = ref(false)
const scene = computed(() => SCENES[index.value])
const atEnd = computed(() => index.value === SCENES.length - 1)

let raf = 0, last = 0
function tick(now: number) {
  const dt = last ? now - last : 0
  last = now
  if (playing.value && !reduce.value) {
    progress.value += dt / SCENE_MS
    if (progress.value >= 1) {
      if (index.value < SCENES.length - 1) { index.value++; progress.value = 0 }
      else { progress.value = 1; playing.value = false }
    }
  }
  raf = requestAnimationFrame(tick)
}

function goTo(i: number) { index.value = Math.max(0, Math.min(SCENES.length - 1, i)); progress.value = 0 }
function next() { if (!atEnd.value) goTo(index.value + 1); else { playing.value = false } }
function prev() { goTo(index.value - 1) }
function toggle() {
  if (atEnd.value && !playing.value) { goTo(0); playing.value = true; return }
  playing.value = !playing.value
}

// Swipe / drag / wheel to move through the reel by hand.
const dragPx = ref(0)
const dragging = ref(false)
let startX = 0, wheelLock = false
function onPointerMove(e: PointerEvent) { if (dragging.value) dragPx.value = e.clientX - startX }
function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  const th = Math.min(90, window.innerWidth * 0.12)
  if (dragPx.value < -th) next()
  else if (dragPx.value > th) prev()
  dragPx.value = 0
}
function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  dragging.value = true; startX = e.clientX; dragPx.value = 0; playing.value = false
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
function onWheel(e: WheelEvent) {
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  if (Math.abs(d) < 18 || wheelLock) return
  wheelLock = true; playing.value = false
  if (d > 0) next(); else prev()
  setTimeout(() => { wheelLock = false }, 450)
}

onMounted(() => {
  reduce.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (reduce.value) playing.value = false
  last = 0
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<template>
  <div class="reel">
    <div class="reel__grain" aria-hidden="true" />

    <header class="reel__top">
      <NuxtLink to="/" class="reel__icon" aria-label="Back to the site">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      </NuxtLink>
      <span class="reel__wordmark">MY STORY</span>
      <NuxtLink to="/my-work" class="reel__icon reel__icon--r" aria-label="See my work">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </NuxtLink>
    </header>

    <!-- Film strip -->
    <div
      class="reel__stage" :class="{ 'is-grab': dragging }"
      @pointerdown="onPointerDown" @wheel.passive="onWheel"
    >
      <div class="reel__hint" :class="{ 'is-hidden': index > 0 || dragging }" aria-hidden="true">swipe, scroll, or press play</div>
      <div class="reel__perf reel__perf--top" aria-hidden="true"><i v-for="n in 26" :key="n" /></div>
      <div class="reel__track" :class="{ 'is-drag': dragging }" :style="{ transform: `translateX(${-index * 100 / SCENES.length}%) translateX(${dragPx}px)`, width: `${SCENES.length * 100}%` }">
        <figure v-for="(s, i) in SCENES" :key="s.id" class="reel__frame" :class="{ 'is-active': i === index }" :style="{ width: `${100 / SCENES.length}%` }">
          <div class="reel__photo" :class="{ 'is-contain': s.fit === 'contain' }">
            <img :src="s.img" :alt="s.head" loading="eager" :style="{ objectFit: s.fit || 'cover' }" :class="{ 'is-kb': i === index && playing && !reduce && s.fit !== 'contain' }" />
            <div class="reel__photo-edge" aria-hidden="true" />
          </div>
        </figure>
      </div>
      <div class="reel__perf reel__perf--bot" aria-hidden="true"><i v-for="n in 26" :key="n" /></div>
    </div>

    <!-- Caption -->
    <div class="reel__cap">
      <Transition name="reel-swap" mode="out-in">
        <div :key="scene.id" class="reel__cap-in">
          <span class="reel__badge">{{ scene.badge }}</span>
          <h1 class="reel__head">{{ scene.head }}</h1>
          <p class="reel__caption">{{ scene.caption }}</p>
          <p v-if="scene.footnote" class="reel__foot">{{ scene.footnote }}</p>
          <div v-if="atEnd" class="reel__cta">
            <NuxtLink to="/my-work" class="reel__btn">See my work</NuxtLink>
            <button type="button" class="reel__btn reel__btn--ghost" @click="goTo(0); playing = true">Replay</button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Controls -->
    <div class="reel__bar">
      <button type="button" class="reel__play" :aria-label="playing ? 'Pause' : 'Play'" @click="toggle">
        <svg v-if="playing" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </button>
      <div class="reel__seek">
        <button
          v-for="(s, i) in SCENES" :key="s.id" type="button" class="reel__seg"
          :class="{ done: i < index, cur: i === index }" :aria-label="`Scene ${i + 1}: ${s.head}`" @click="goTo(i)"
        >
          <span class="reel__seg-fill" :style="{ width: i < index ? '100%' : i === index ? progress * 100 + '%' : '0%' }" />
        </button>
      </div>
      <div class="reel__nav">
        <button type="button" class="reel__icon reel__icon--sm" aria-label="Previous" :disabled="index === 0" @click="prev">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
        </button>
        <button type="button" class="reel__icon reel__icon--sm" aria-label="Next" :disabled="atEnd" @click="next">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reel {
  position: fixed; inset: 0; overflow: hidden;
  display: flex; flex-direction: column; align-items: center;
  background:
    radial-gradient(120% 80% at 50% 8%, #2a1f16, transparent 55%),
    radial-gradient(120% 90% at 50% 108%, #1c1a26, transparent 60%),
    #100d0b;
  color: #f4ede2;
  font-family: 'Inter', system-ui, sans-serif;
  --gold: #e8b24c; --coral: #ef6a45; --ink: #f4ede2; --muted: #b7a894;
}
.reel__grain { position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1.4px); background-size: 4px 4px; }

.reel__top {
  position: relative; z-index: 6; width: 100%; max-width: 720rem; flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between; gap: 12rem;
  padding: calc(16rem + var(--safe-top)) 22rem 8rem;
}
.reel__wordmark { font-family: 'Space Mono', monospace; font-size: 12rem; letter-spacing: 0.22em; color: var(--muted); }
.reel__icon {
  width: 42rem; height: 42rem; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--ink);
  transition: background 0.15s ease, transform 0.1s ease;
}
@media (hover: hover) { .reel__icon:hover { background: rgba(255,255,255,0.12); } }
.reel__icon:active { transform: scale(0.94); }
.reel__icon:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.reel__icon--r { background: var(--gold); color: #26170a; border-color: transparent; }
.reel__icon--sm { width: 34rem; height: 34rem; }
.reel__icon--sm:disabled { opacity: 0.3; cursor: not-allowed; }

/* Film strip */
.reel__stage { position: relative; z-index: 4; width: 100%; flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; margin-top: 6rem; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.reel__stage.is-grab { cursor: grabbing; }
.reel__hint {
  position: absolute; top: 10rem; left: 50%; transform: translateX(-50%); z-index: 6;
  font-family: 'Space Mono', monospace; font-size: 11rem; letter-spacing: 0.08em; color: var(--muted);
  background: rgba(0,0,0,0.4); padding: 6rem 12rem; border-radius: 999rem; pointer-events: none;
  opacity: 0.9; transition: opacity 0.4s ease;
}
.reel__hint.is-hidden { opacity: 0; }
.reel__perf { display: flex; justify-content: space-around; align-items: center; height: 20rem; background: #0b0908; flex-shrink: 0; }
.reel__perf i { width: 14rem; height: 9rem; border-radius: 2rem; background: #16120f; }
.reel__track { display: flex; align-items: center; transition: transform 0.6s cubic-bezier(0.22, 0.75, 0.2, 1); will-change: transform; }
.reel__frame { flex-shrink: 0; display: flex; justify-content: center; padding: 14rem 8rem; box-sizing: border-box; transition: opacity 0.5s ease, transform 0.5s ease; opacity: 0.32; transform: scale(0.86); }
.reel__frame.is-active { opacity: 1; transform: scale(1); }
.reel__photo {
  position: relative; height: min(52vh, 520rem); aspect-ratio: 3 / 4; max-width: 88vw; border-radius: 10rem; overflow: hidden;
  background: #14100c; box-shadow: 0 40rem 90rem -50rem #000;
}
.reel__photo.is-contain { background: linear-gradient(160deg, #1c1610, #100c09); }
.reel__photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.reel__photo img.is-kb { animation: reel-kb 6s ease-out both; }
@keyframes reel-kb { from { transform: scale(1.02); } to { transform: scale(1.12); } }
.reel__photo-edge { position: absolute; inset: 0; border-radius: 10rem; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 -60rem 80rem -50rem rgba(0,0,0,0.7); pointer-events: none; }

/* Caption */
.reel__cap { position: relative; z-index: 5; width: 100%; max-width: 640rem; flex-shrink: 0; padding: 20rem 26rem 8rem; text-align: center; min-height: 210rem; }
.reel__badge {
  display: inline-block; font-family: 'Space Mono', monospace; font-size: 13rem; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase; color: #26170a; background: var(--gold);
  padding: 5rem 12rem; border-radius: 6rem; transform: rotate(-1.4deg); box-shadow: 0 8rem 20rem -12rem #000;
}
.reel__head { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(30rem, 6.4vw, 52rem); line-height: 1.02; letter-spacing: 0.01em; text-transform: uppercase; color: var(--ink); margin: 16rem 0 0; }
.reel__caption { margin: 14rem auto 0; max-width: 44ch; font-size: clamp(14.5rem, 2vw, 16.5rem); line-height: 1.55; color: var(--muted); }
.reel__foot { margin-top: 12rem; font-size: 13rem; font-style: italic; color: color-mix(in srgb, var(--gold) 70%, var(--muted)); }
.reel__cta { margin-top: 22rem; display: flex; gap: 10rem; justify-content: center; }
.reel__btn { display: inline-flex; align-items: center; padding: 12rem 22rem; border-radius: 999rem; background: var(--gold); color: #26170a; font-weight: 700; font-size: 14rem; text-decoration: none; }
.reel__btn--ghost { background: transparent; color: var(--ink); border: 1px solid rgba(255,255,255,0.2); }
@media (hover: hover) { .reel__btn:hover { filter: brightness(1.07); } }

/* Control bar */
.reel__bar {
  position: relative; z-index: 6; width: 100%; max-width: 640rem; flex-shrink: 0;
  display: flex; align-items: center; gap: 14rem; padding: 12rem 22rem calc(20rem + var(--safe-bottom));
}
.reel__play {
  width: 52rem; height: 52rem; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; background: var(--gold); color: #26170a; cursor: pointer; box-shadow: 0 12rem 30rem -14rem var(--gold);
  transition: transform 0.1s ease, filter 0.15s ease;
}
.reel__play:active { transform: scale(0.94); }
@media (hover: hover) { .reel__play:hover { filter: brightness(1.08); } }
.reel__play:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
.reel__seek { flex: 1; display: flex; gap: 5rem; }
.reel__seg { flex: 1; height: 6rem; border-radius: 999rem; background: rgba(255,255,255,0.12); overflow: hidden; cursor: pointer; }
.reel__seg-fill { display: block; height: 100%; background: var(--gold); border-radius: 999rem; }
.reel__seg.cur .reel__seg-fill { transition: width 0.1s linear; }
.reel__seg:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.reel__nav { display: flex; gap: 6rem; flex-shrink: 0; }

.reel-swap-enter-active, .reel-swap-leave-active { transition: opacity 0.32s ease, transform 0.32s ease; }
.reel-swap-enter-from { opacity: 0; transform: translateY(10rem); }
.reel-swap-leave-to { opacity: 0; transform: translateY(-8rem); }
.reel-fade-enter-active, .reel-fade-leave-active { transition: opacity 0.3s ease; }
.reel-fade-enter-from, .reel-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .reel__track { transition: none; }
  .reel__photo img.is-kb { animation: none; }
  .reel-swap-enter-active, .reel-swap-leave-active { transition: opacity 0.2s ease; }
  .reel-swap-enter-from, .reel-swap-leave-to { transform: none; }
}
@media (max-width: 640px) {
  .reel__top, .reel__cap, .reel__bar { max-width: 100%; }
  .reel__cap { min-height: 180rem; padding: 16rem 20rem 6rem; }
  .reel__photo { height: min(46vh, 460rem); }
  .reel__head { font-size: clamp(28rem, 8vw, 44rem); }
}
</style>
