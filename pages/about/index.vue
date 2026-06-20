<script setup lang="ts">
import gsap from 'gsap'
import { AboutExperience } from '~/experience/about/AboutExperience'
import { useThemeStore } from '~/stores/theme'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap'
    }
  ]
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { $lenis } = useNuxtApp()
const themeStore = useThemeStore()
const cleanups: Array<() => void> = []

let exp: AboutExperience | null = null

// ── 12 scenes: indices 0–11 ─────────────────────────────────────────────────
const SCENE_COUNT = 12

// Per-scene GIF src (null = no GIF for that scene)
const GIF_MAP: Record<number, string> = {
  1:  '/graduation.gif',
  2:  '/gifs/leap.gif',
  3:  '/gifs/myth.gif',
  4:  '/gifs/mentor.gif',
  5:  '/gifs/psych.gif',
  6:  '/gifs/hacker.gif',
  7:  '/gifs/strip.gif',
  8:  '/hi.gif',
  9:  '/gifs/verse.gif',
  10: '/gifs/closer.gif',
}

// GIF screen position per scene [left%, top%, width-vw]
const GIF_POS: Record<number, [string, string, string]> = {
  1:  ['64%', '22%', '20vw'],
  2:  ['12%', '55%', '16vw'],
  3:  ['60%', '58%', '14vw'],
  4:  ['62%', '24%', '17vw'],
  5:  ['10%', '22%', '18vw'],
  6:  ['60%', '50%', '15vw'],
  7:  ['62%', '30%', '20vw'],
  8:  ['52%', '60%', '14vw'],
  9:  ['10%', '60%', '12vw'],
  10: ['58%', '55%', '16vw'],
}

onMounted(async () => {
  if (!canvasRef.value) return

  // ── Boot Three.js experience ───────────────────────────────
  exp = new AboutExperience(canvasRef.value)
  exp.setTheme(themeStore.isDark)

  // ── Theme sync ─────────────────────────────────────────────
  const stopThemeWatch = watch(() => themeStore.isDark, (dark) => exp?.setTheme(dark))
  cleanups.push(stopThemeWatch)

  // ── Wire Lenis scroll → experience progress ────────────────
  const lenis = $lenis as any
  const onScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
    const p = limit > 0 ? scroll / limit : 0
    exp?.setProgress(p)
    updateOverlays(p)
  }
  lenis.on('scroll', onScroll)
  cleanups.push(() => lenis.off('scroll', onScroll))

  // ── Mouse parallax for GIF overlays ────────────────────────
  const gifEls = document.querySelectorAll<HTMLElement>('.gif-overlay')
  const onMouseMove = (e: MouseEvent) => {
    const dx = (e.clientX / window.innerWidth  - 0.5) * 2
    const dy = (e.clientY / window.innerHeight - 0.5) * 2
    gifEls.forEach((el) => {
      el.style.transform = `
        translateX(${dx * -16}px) translateY(${dy * -10}px)
        rotateY(${dx * 5}deg) rotateX(${-dy * 3}deg)
      `
    })
  }
  if (window.innerWidth > 768) {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    cleanups.push(() => window.removeEventListener('mousemove', onMouseMove))
  }

  // ── Initial overlay state ──────────────────────────────────
  await nextTick()
  updateOverlays(0)
})

onUnmounted(() => {
  exp?.destroy()
  exp = null
  cleanups.forEach(fn => fn())
  cleanups.length = 0
})

let _lastScene = -1

function updateOverlays(p: number) {
  const rawScene = p * SCENE_COUNT
  const sceneIdx  = Math.min(Math.floor(rawScene), SCENE_COUNT - 1)
  const sceneLocal = rawScene - sceneIdx

  if (sceneIdx === _lastScene) return
  _lastScene = sceneIdx

  // Text overlays
  for (let i = 0; i < SCENE_COUNT; i++) {
    const el = document.querySelector<HTMLElement>(`.scene-text[data-scene="${i}"]`)
    if (!el) continue
    const show = i === sceneIdx
    gsap.to(el, { opacity: show ? 1 : 0, y: show ? 0 : 28, duration: 0.55, ease: 'power3.out' })
  }

  // GIF overlays — show current ± 0 (current only)
  document.querySelectorAll<HTMLElement>('.gif-overlay').forEach((el) => {
    const s = parseInt(el.dataset.scene ?? '-1')
    const show = s === sceneIdx
    gsap.to(el, { opacity: show ? 1 : 0, scale: show ? 1 : 0.88, duration: 0.5, ease: 'power2.out' })
  })

  // Coda
  const coda = document.querySelector<HTMLElement>('.coda-overlay')
  if (coda) {
    const show = sceneIdx >= SCENE_COUNT - 1 && sceneLocal > 0.5
    gsap.to(coda, { opacity: show ? 1 : 0, y: show ? 0 : 36, duration: 0.7, ease: 'power3.out' })
  }
}
</script>

<template>
  <div class="about-root">
    <!-- Three.js canvas — fixed fullscreen -->
    <canvas ref="canvasRef" class="about-canvas" />

    <!-- Scroll driver — gives the page height so Lenis has something to scroll -->
    <div class="scroll-driver" />

    <!-- ── 12 text overlays ───────────────────────────────────────── -->

    <!-- 01 · WHO AM I -->
    <div class="scene-text" data-scene="0">
      <p class="st-eyebrow">01 / Who I Am</p>
      <h1 class="st-name">Naveen Jose</h1>
      <p class="st-title">Certified Instructional Design Specialist</p>
      <p class="st-body">Architecting learning experiences<br>that transform complexity<br>into clarity.</p>
    </div>

    <!-- 02 · THE PLAN -->
    <div class="scene-text" data-scene="1">
      <p class="st-eyebrow">02 / The Plan</p>
      <p class="st-lg">I graduated with a<br>hospitality degree.</p>
      <p class="st-body muted">The plan seemed simple.<br>Work in hotels. Learn operations.<br>Grow steadily. Keep moving forward.</p>
      <p class="st-lg hl">Then something unexpected happened.</p>
    </div>

    <!-- 03 · THE DETOUR -->
    <div class="scene-text" data-scene="2">
      <p class="st-eyebrow">03 / The Detour</p>
      <p class="st-body muted">Learning &amp; Development appeared.</p>
      <p class="st-body muted">Not as a dream.<br>Not as a master plan.</p>
      <p class="st-lg">Just <span class="hl">a door.</span></p>
      <p class="st-body muted">One I decided to walk through.</p>
    </div>

    <!-- 04 · THE FIRST REALIZATION -->
    <div class="scene-text" data-scene="3">
      <p class="st-eyebrow">04 / The First Realization</p>
      <p class="st-lg">I thought training<br>was simple.</p>
      <p class="st-body muted">Share information. People learn.<br>Problem solved.</p>
      <p class="st-lg">I was <span class="hl">wrong.</span></p>
      <p class="st-body muted">Knowledge is easy.<br><span class="hl-dim">Behavior change is hard.</span></p>
    </div>

    <!-- 05 · MENTORS -->
    <div class="scene-text" data-scene="4">
      <p class="st-eyebrow">05 / The Mentors</p>
      <p class="st-body muted">Then I met people who could make<br>learning feel effortless.</p>
      <p class="st-body muted">Not louder. Not flashier.<br>Not smarter.</p>
      <p class="st-lg">Just <span class="hl">better</span> at helping<br>people understand.</p>
      <p class="st-body muted">That changed everything.</p>
    </div>

    <!-- 06 · THE OBSESSION -->
    <div class="scene-text" data-scene="5">
      <p class="st-eyebrow">06 / The Obsession</p>
      <p class="st-lg">That curiosity became<br>an <span class="hl">obsession.</span></p>
      <p class="st-body muted">Memory. Attention. Motivation.</p>
      <p class="st-body muted">Why do people remember<br>some things forever…</p>
      <p class="st-lg">and forget others<br>by <span class="hl">lunch?</span></p>
    </div>

    <!-- 07 · THE DISCOVERY -->
    <div class="scene-text" data-scene="6">
      <p class="st-eyebrow">07 / The Discovery</p>
      <p class="st-body muted">Instructional Design isn't slides.</p>
      <p class="st-body muted">It isn't courses.<br>It isn't training calendars.</p>
      <p class="st-lg">It's understanding<br>how people <span class="hl">learn</span>…</p>
      <p class="st-lg">and designing<br><span class="hl">for that.</span></p>
    </div>

    <!-- 08 · STRIP THE NOISE -->
    <div class="scene-text" data-scene="7">
      <p class="st-eyebrow">08 / Strip the Noise</p>
      <p class="st-body muted">Every project starts the same way.</p>
      <p class="st-lg">Remove jargon.<br>Remove clutter.<br>Remove complexity.</p>
      <p class="st-body muted">Remove everything<br>that doesn't help people learn.</p>
      <p class="st-lg hl">Keep only what matters.</p>
    </div>

    <!-- 09 · SEWA CHRONICLES -->
    <div class="scene-text" data-scene="8">
      <p class="st-eyebrow">09 / SEWA Chronicles</p>
      <p class="st-body muted">My first mentor had an idea.</p>
      <p class="st-lg">A <span class="hl">comic book.</span></p>
      <p class="st-body muted">10 stories of service excellence.<br>Hand-drawn. Inked. Printed.</p>
      <p class="st-body muted">Distributed to every<br>Club Mahindra resort in the country.</p>
      <p class="st-lg hl">SEWA Chronicles.</p>
      <p class="st-body muted">It taught me:<br><span class="hl-dim">People don't remember information.<br>They remember stories.</span></p>
    </div>

    <!-- 10 · THE MANTRA -->
    <div class="scene-text scene-text--center" data-scene="9">
      <p class="st-eyebrow">10 / The Mantra</p>
      <p class="st-devanagari">असतो मा सद्गमय</p>
      <p class="st-translit">Asatoma sadgamaya.</p>
      <p class="st-lg">From the unreal<br>to the <span class="hl">real.</span></p>
      <p class="st-body muted">For me…<br>that is learning.</p>
    </div>

    <!-- 11 · TODAY -->
    <div class="scene-text" data-scene="10">
      <p class="st-eyebrow">11 / Today</p>
      <p class="st-lg">Today I design<br>learning experiences.</p>
      <p class="st-body muted">Digital. Interactive.<br>Human-centered.</p>
      <p class="st-lg">Built to be <span class="hl">remembered.</span><br>Built to create <span class="hl">change.</span></p>
    </div>

    <!-- 12 · ENDING -->
    <div class="scene-text scene-text--center" data-scene="11">
      <p class="st-eyebrow">12 / The Work</p>
      <p class="st-lg">I turn complexity<br>into <span class="hl">clarity.</span></p>
      <p class="st-body muted">And build learning experiences<br>people actually remember.</p>
      <p class="st-name-sm">— Naveen Jose</p>
    </div>

    <!-- ── GIF overlays ───────────────────────────────────────────── -->
    <img v-for="(src, idx) in GIF_MAP" :key="idx"
      class="gif-overlay"
      :data-scene="idx"
      :src="src"
      :style="{
        left:  GIF_POS[idx]?.[0] ?? '62%',
        top:   GIF_POS[idx]?.[1] ?? '30%',
        width: GIF_POS[idx]?.[2] ?? '18vw',
      }"
      alt=""
    />

    <!-- ── Coda ───────────────────────────────────────────────────── -->
    <div class="coda-overlay">
      <div class="coda-portrait">
        <img src="/naveen.jpeg" alt="Naveen Jose" />
      </div>
      <p class="coda-name">Naveen Jose</p>
      <p class="coda-cred">CIDS Certified Instructional Design Specialist</p>
      <div class="coda-links">
        <a href="mailto:iamnaveenjose@outlook.com">iamnaveenjose@outlook.com</a>
        <a href="https://linkedin.com/in/entertrainer" target="_blank" rel="noopener noreferrer">linkedin.com/in/entertrainer</a>
      </div>
      <div class="coda-cta">
        <a class="btn-cta" href="mailto:iamnaveenjose@outlook.com">Let's build something meaningful</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.about-root {
  position: relative;
  width: 100%;
}

.about-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* 13 viewport heights: 12 scenes + coda */
.scroll-driver {
  position: relative;
  height: 1300vh;
  width: 100%;
  pointer-events: none;
  z-index: 1;
}

/* ── Scene text overlays ── */
.scene-text {
  position: fixed;
  left: var(--grid-margin, 30px);
  top: 50%;
  transform: translateY(-50%);
  max-width: min(540px, 44vw);
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
}

.scene-text--center {
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  max-width: min(600px, 60vw);
  align-items: center;
}

/* Typography */
.st-eyebrow {
  font-size: clamp(10px, 1.1vw, 13px);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.35;
  font-family: var(--main-font);
  margin-bottom: 0.6em;
}

.st-name {
  font-size: clamp(48px, 7vw, 100px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.0;
  color: var(--color-text);
  font-family: var(--main-font);
}

.st-name-sm {
  font-size: clamp(20px, 2.5vw, 32px);
  font-weight: 600;
  letter-spacing: -0.03em;
  opacity: 0.6;
}

.st-title {
  font-size: clamp(13px, 1.5vw, 18px);
  font-weight: 400;
  opacity: 0.5;
  letter-spacing: -0.01em;
  margin-bottom: 0.4em;
}

.st-lg {
  font-size: clamp(28px, 4vw, 62px);
  font-weight: 650;
  letter-spacing: -0.035em;
  line-height: 1.1;
  color: var(--color-text);
  font-family: var(--main-font);
}

.st-body {
  font-size: clamp(14px, 1.6vw, 22px);
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: -0.02em;
  color: var(--color-text);
  font-family: var(--main-font);
}

.muted { opacity: 0.5; }

.hl     { color: #6E92CE; font-weight: 700; }
.hl-dim { color: #6E92CE; opacity: 0.85; }

[data-theme="light"] .hl     { color: #243F6A; }
[data-theme="light"] .hl-dim { color: #243F6A; }

/* Devanagari */
.st-devanagari {
  font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
  font-size: clamp(32px, 5.5vw, 82px);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.4;
  color: var(--color-text);
  margin-bottom: 0.1em;
}

.st-translit {
  font-style: italic;
  font-size: clamp(13px, 1.5vw, 20px);
  opacity: 0.45;
  letter-spacing: 0.02em;
  margin-bottom: 0.5em;
}

/* ── GIF overlays ── */
.gif-overlay {
  position: fixed;
  z-index: 8;
  pointer-events: none;
  border-radius: 10px;
  box-shadow: 0 18px 54px rgba(0,0,0,0.48), 0 4px 12px rgba(0,0,0,0.24);
  opacity: 0;
  transform-style: preserve-3d;
  will-change: transform, opacity;
  transform: scale(0.88);
}

/* ── Coda overlay ── */
.coda-overlay {
  position: fixed;
  inset: 0;
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  pointer-events: none;
  padding: 80px var(--grid-margin, 30px);
}

.coda-overlay[style*="opacity: 1"],
.coda-overlay.visible {
  pointer-events: auto;
}

.coda-portrait {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
}
.coda-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.coda-name {
  font-size: clamp(26px, 3.5vw, 42px);
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--color-text);
}

.coda-cred {
  font-size: 13px;
  opacity: 0.4;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.coda-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
}
.coda-links a {
  font-size: clamp(14px, 1.6vw, 19px);
  font-weight: 500;
  opacity: 0.55;
  letter-spacing: -0.02em;
  transition: opacity 0.2s;
}
.coda-links a:hover { opacity: 1; color: #6E92CE; }

.coda-cta {
  margin-top: 32px;
}
.btn-cta {
  display: inline-block;
  padding: 14px 32px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  font-size: clamp(13px, 1.4vw, 17px);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-text);
  opacity: 0.8;
  transition: opacity 0.2s, border-color 0.2s, background 0.2s;
}
.btn-cta:hover {
  opacity: 1;
  background: rgba(110,146,206,0.12);
  border-color: #6E92CE;
}

[data-theme="light"] .btn-cta {
  border-color: rgba(0,0,0,0.18);
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .scene-text {
    left: 18px;
    right: 18px;
    max-width: none;
    top: auto;
    bottom: 80px;
    transform: none;
  }
  .scene-text--center {
    left: 18px;
    right: 18px;
    bottom: 80px;
    top: auto;
    transform: none;
    align-items: flex-start;
    text-align: left;
  }
  .gif-overlay { display: none; }
  .st-lg { font-size: clamp(24px, 6.5vw, 40px); }
}
</style>
