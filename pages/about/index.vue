<script setup lang="ts">
import gsap from 'gsap'

definePageMeta({ layout: false })

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap'
    }
  ]
})

const { $lenis } = useNuxtApp()
const canvasRef  = ref<HTMLCanvasElement | null>(null)
const isMobile   = ref(false)
const cleanups: Array<() => void> = []

// ── Word-mask utility ────────────────────────────────────────────────────────
function maskWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.masked === '1') return [...el.querySelectorAll<HTMLElement>('.wfill')]
  const fills: HTMLElement[] = []
  const frag = document.createDocumentFragment()
  const wrap = (html: string, extra = '') => {
    const m = document.createElement('span'); m.className = 'wmask'
    const f = document.createElement('span'); f.className = ('wfill ' + extra).trim()
    f.innerHTML = html; m.appendChild(f); frag.appendChild(m); fills.push(f)
  }
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      ;(node.textContent ?? '').split(/(\s+)/).forEach(p => {
        if (!p) return
        if (p.trim() === '') frag.appendChild(document.createTextNode(p))
        else wrap(p)
      })
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const en = node as HTMLElement; wrap(en.innerHTML, en.className)
    }
  })
  el.innerHTML = ''; el.appendChild(frag); el.dataset.masked = '1'
  return fills
}

const RISE = { yPercent: 130, opacity: 0, filter: 'blur(8px)' } as const

function revealEntry(el: HTMLElement) {
  const fills = [...el.querySelectorAll<HTMLElement>('.mk')].flatMap(mk => maskWords(mk))
  gsap.set(fills, RISE)
  gsap.set(el, { opacity: 1 })
  gsap.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.036 })
  const ey = el.querySelector<HTMLElement>('.eyebrow')
  if (ey) gsap.fromTo(ey, { opacity: 0 }, { opacity: 0.38, duration: 0.5 })
}

function hideEntry(el: HTMLElement) {
  const fills = el.querySelectorAll<HTMLElement>('.wfill')
  gsap.to(fills, { yPercent: -12, opacity: 0, filter: 'blur(4px)', duration: 0.28, ease: 'power2.in' })
  gsap.to(el, { opacity: 0, duration: 0.28 })
}

// ── Mobile state ─────────────────────────────────────────────────────────────
const mRefs = ref<(HTMLElement | null)[]>([])
const mCurrent = ref(0)
let mTransitioning = false
const TOTAL_M = 12

function goMobile(next: number) {
  next = Math.max(0, Math.min(TOTAL_M - 1, next))
  if (next === mCurrent.value || mTransitioning) return
  mTransitioning = true
  const prevEl = mRefs.value[mCurrent.value]
  const nextEl = mRefs.value[next]
  if (!prevEl || !nextEl) { mTransitioning = false; return }
  const dir = next > mCurrent.value ? 1 : -1
  gsap.set(nextEl, { yPercent: dir * 100, visibility: 'visible' })
  const tl = gsap.timeline({ onComplete() { mTransitioning = false; mCurrent.value = next } })
  tl.to(prevEl, { yPercent: -dir * 10, opacity: 0, duration: 0.35, ease: 'power2.in' })
  tl.to(nextEl, { yPercent: 0, duration: 0.52, ease: 'power3.out' }, 0.18)
  const fills = [...nextEl.querySelectorAll<HTMLElement>('.mk')].flatMap(mk => maskWords(mk))
  gsap.set(fills, RISE)
  tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.68, ease: 'power3.out', stagger: 0.034 }, 0.32)
  tl.set(prevEl, { visibility: 'hidden' })
}

// ── Desktop world ─────────────────────────────────────────────────────────────
let world: any = null
let currentEntry = 0
const camRef = { pos: { x: 0, y: 0, z: -4 }, target: { x: 0, y: 0.2, z: 10 } }

onMounted(async () => {
  isMobile.value = window.innerWidth < 768
  await nextTick()

  if (isMobile.value) {
    mRefs.value.forEach((el, i) => {
      if (!el) return
      gsap.set(el, { yPercent: i === 0 ? 0 : 100, visibility: i === 0 ? 'visible' : 'hidden' })
    })
    if (mRefs.value[0]) revealEntry(mRefs.value[0])
    let ty = 0
    const root = document.querySelector<HTMLElement>('.fn-mobile-root')!
    root.addEventListener('touchstart', e => { ty = e.touches[0].clientY }, { passive: true })
    root.addEventListener('touchend', e => {
      const dy = ty - e.changedTouches[0].clientY
      if (Math.abs(dy) < 32) return
      goMobile(mCurrent.value + (dy > 0 ? 1 : -1))
    }, { passive: true })
    root.addEventListener('wheel', e => {
      goMobile(mCurrent.value + (e.deltaY > 0 ? 1 : -1))
    }, { passive: true })
    return
  }

  if (!canvasRef.value) return
  const [{ FieldNotesWorld }, { WAYPOINTS }] = await Promise.all([
    import('~/experience/fieldnotes/FieldNotesWorld'),
    import('~/experience/fieldnotes/entries/index'),
  ])

  const scatterEl = document.querySelector<HTMLElement>('.fn-scatter-container') ?? document.body
  world = new FieldNotesWorld(canvasRef.value, camRef, scatterEl)

  const onResize = () => world?.resize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', onResize)
  cleanups.push(() => window.removeEventListener('resize', onResize))

  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)
  const lenis = $lenis as any
  lenis.on('scroll', ScrollTrigger.update)

  // Camera timeline scrubbed by scroll
  const camTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.fn-scroll-driver',
      scrub: 1.8,
      start: 'top top',
      end:   'bottom bottom',
    }
  })
  WAYPOINTS.forEach((wp, i) => {
    const at = i / (WAYPOINTS.length - 1)
    camTl.to(camRef.pos,    { x: wp.pos[0],    y: wp.pos[1],    z: wp.pos[2],    ease: 'power1.inOut' }, at)
    camTl.to(camRef.target, { x: wp.target[0], y: wp.target[1], z: wp.target[2], ease: 'power1.inOut' }, at)
  })

  // Drive entry text + world activation from scroll progress
  const onScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
    const progress = limit > 0 ? scroll / limit : 0
    const n = Math.min(Math.floor(progress * WAYPOINTS.length), WAYPOINTS.length - 1) + 1
    if (n === currentEntry) return

    if (currentEntry > 0) {
      const oldEl = document.querySelector<HTMLElement>(`.fn-entry[data-entry="${currentEntry}"]`)
      if (oldEl) hideEntry(oldEl)
      if (currentEntry === 8) world?.getScatterPhysics()?.deactivate()
    }

    currentEntry = n
    world?.setActiveEntry(n)

    const newEl = document.querySelector<HTMLElement>(`.fn-entry[data-entry="${n}"]`)
    if (newEl) revealEntry(newEl)
    if (n === 8) world?.getScatterPhysics()?.activate()
  }
  lenis.on('scroll', onScroll)

  // Activate entry 1 immediately on load
  const e1 = document.querySelector<HTMLElement>('.fn-entry[data-entry="1"]')
  if (e1) revealEntry(e1)
  world?.setActiveEntry(1)
  currentEntry = 1

  cleanups.push(() => {
    lenis.off('scroll', ScrollTrigger.update)
    lenis.off('scroll', onScroll)
    ScrollTrigger.killAll()
  })
})

onBeforeUnmount(() => {
  world?.dispose(); world = null
  cleanups.forEach(fn => fn()); cleanups.length = 0
  currentEntry = 0
})
</script>

<template>
  <div class="fn-root">

    <!-- ══════════════════════════════════════════════════════════════════
         MOBILE — GSAP fixed-stack swipe carousel
    ══════════════════════════════════════════════════════════════════ -->
    <div v-if="isMobile" class="fn-mobile-root">

      <!-- 01 Who am I -->
      <section class="m-scene" :ref="el => mRefs[0] = el as HTMLElement">
        <p class="eyebrow">01 / Who am I</p>
        <h1 class="mk m-name">Naveen Jose</h1>
        <p class="mk m-title">Certified Instructional Design Specialist</p>
        <p class="mk m-body muted">Architecting learning experiences<br>that transform complexity into clarity.</p>
      </section>

      <!-- 02 The Plan -->
      <section class="m-scene" :ref="el => mRefs[1] = el as HTMLElement">
        <p class="eyebrow">02 / The Plan</p>
        <p class="mk m-lg">I graduated with a<br>hospitality degree.</p>
        <p class="mk m-body muted">Work in hotels. Grow steadily.<br>The plan seemed simple.</p>
        <p class="mk m-lg emp">Then something unexpected happened.</p>
      </section>

      <!-- 03 The Detour -->
      <section class="m-scene" :ref="el => mRefs[2] = el as HTMLElement">
        <p class="eyebrow">03 / The Detour</p>
        <p class="mk m-body muted">Learning &amp; Development appeared.</p>
        <p class="mk m-body muted">Not as a dream. Not as a master plan.</p>
        <p class="mk m-lg">Just <span class="emp">a door.</span></p>
        <p class="mk m-body muted">One I decided to walk through.</p>
      </section>

      <!-- 04 The Realization -->
      <section class="m-scene" :ref="el => mRefs[3] = el as HTMLElement">
        <p class="eyebrow">04 / The Realization</p>
        <p class="mk m-lg">I thought training was simple.</p>
        <p class="mk m-body muted">Share information. People learn. Problem solved.</p>
        <p class="mk m-lg">I was <span class="emp">wrong.</span></p>
        <p class="mk m-body muted">Information ≠ Learning.</p>
      </section>

      <!-- 05 The Mentors -->
      <section class="m-scene" :ref="el => mRefs[4] = el as HTMLElement">
        <p class="eyebrow">05 / The Mentors</p>
        <p class="mk m-body muted">I met people who could make<br>learning feel effortless.</p>
        <p class="mk m-lg">Just <span class="emp">better</span> at helping<br>people understand.</p>
        <p class="mk m-body muted">That changed everything.</p>
      </section>

      <!-- 06 The Obsession -->
      <section class="m-scene" :ref="el => mRefs[5] = el as HTMLElement">
        <p class="eyebrow">06 / The Obsession</p>
        <p class="mk m-lg">That curiosity became<br>an <span class="emp">obsession.</span></p>
        <p class="mk m-body muted">Memory. Attention. Motivation.</p>
        <p class="mk m-lg">Why do some things stick?</p>
      </section>

      <!-- 07 The Discovery -->
      <section class="m-scene" :ref="el => mRefs[6] = el as HTMLElement">
        <p class="eyebrow">07 / The Discovery</p>
        <p class="mk m-body muted">Instructional Design isn't slides.</p>
        <p class="mk m-lg">It's understanding how people <span class="emp">learn…</span></p>
        <p class="mk m-lg">and designing <span class="emp">for that.</span></p>
      </section>

      <!-- 08 Clarity -->
      <section class="m-scene" :ref="el => mRefs[7] = el as HTMLElement">
        <p class="eyebrow">08 / Clarity</p>
        <p class="mk m-lg">Remove jargon.<br>Remove clutter.<br>Remove complexity.</p>
        <p class="mk m-lg emp">Keep only what matters.</p>
      </section>

      <!-- 09 Stories -->
      <section class="m-scene" :ref="el => mRefs[8] = el as HTMLElement">
        <p class="eyebrow">09 / Stories</p>
        <p class="mk m-body muted">My first mentor had an idea.</p>
        <p class="mk m-lg">A <span class="emp">comic book.</span></p>
        <p class="mk m-body muted">10 stories of service excellence.<br>Hand-drawn. Inked. Printed.<br>Every Club Mahindra resort in the country.</p>
        <p class="mk m-lg emp">SEWA Chronicles.</p>
      </section>

      <!-- 10 The Mantra -->
      <section class="m-scene m-scene--center" :ref="el => mRefs[9] = el as HTMLElement">
        <p class="eyebrow">10 / The Mantra</p>
        <p class="mk m-deva">असतो मा सद्गमय</p>
        <p class="mk m-translit">Asatoma sadgamaya.</p>
        <p class="mk m-lg">From assumption<br>to <span class="emp">understanding.</span></p>
        <p class="mk m-body muted">That is learning.</p>
      </section>

      <!-- 11 Today -->
      <section class="m-scene" :ref="el => mRefs[10] = el as HTMLElement">
        <p class="eyebrow">11 / Today</p>
        <p class="mk m-lg">Today I design<br>learning experiences.</p>
        <p class="mk m-body muted">Digital. Interactive. Human-centered.</p>
        <p class="mk m-lg">Built to be <span class="emp">remembered.</span></p>
      </section>

      <!-- 12 Final -->
      <section class="m-scene m-scene--center m-coda" :ref="el => mRefs[11] = el as HTMLElement">
        <div class="m-portrait">
          <img :src="'/naveen.jpeg'" alt="Naveen Jose" />
        </div>
        <p class="mk m-lg">I turn complexity<br>into <span class="emp">clarity.</span></p>
        <p class="mk m-sig">— Naveen Jose</p>
        <div class="mk m-links">
          <a href="mailto:iamnaveenjose@outlook.com">iamnaveenjose@outlook.com</a>
          <a href="https://linkedin.com/in/entertrainer" target="_blank" rel="noopener">linkedin.com/in/entertrainer</a>
        </div>
        <a class="btn-cta" href="mailto:iamnaveenjose@outlook.com">Let's build something meaningful</a>
      </section>

      <!-- Progress dots -->
      <div class="m-dots" aria-hidden="true">
        <span v-for="i in TOTAL_M" :key="i" :class="{ active: mCurrent === i - 1 }" />
      </div>
      <p v-if="mCurrent === 0" class="swipe-hint">Swipe up</p>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         DESKTOP — Three.js notebook universe
    ══════════════════════════════════════════════════════════════════ -->
    <template v-else>
      <canvas ref="canvasRef" class="fn-canvas" />

      <!-- Scatter physics DOM container (Entry 08 word physics) -->
      <div class="fn-scatter-container" aria-hidden="true" />

      <!-- 1300vh scroll driver — pulls camera through Z-space -->
      <div class="fn-scroll-driver" />

      <!-- ── Entry text overlays ── -->
      <div class="fn-entry" data-entry="1">
        <p class="eyebrow">01 / Who am I</p>
        <h1 class="mk fn-name">Naveen Jose</h1>
        <p class="mk fn-title">Certified Instructional Design Specialist</p>
        <p class="mk fn-body muted">Architecting learning experiences<br>that transform complexity into clarity.</p>
      </div>

      <div class="fn-entry" data-entry="2">
        <p class="eyebrow">02 / The Plan</p>
        <p class="mk fn-lg">I graduated with a<br>hospitality degree.</p>
        <p class="mk fn-body muted">Work in hotels. Grow steadily.<br>The plan seemed simple.</p>
        <p class="mk fn-lg emp">Then something unexpected happened.</p>
      </div>

      <div class="fn-entry" data-entry="3">
        <p class="eyebrow">03 / The Detour</p>
        <p class="mk fn-body muted">Learning &amp; Development appeared.</p>
        <p class="mk fn-body muted">Not as a dream. Not as a master plan.</p>
        <p class="mk fn-lg">Just <span class="emp">a door.</span></p>
        <p class="mk fn-body muted">One I decided to walk through.</p>
      </div>

      <div class="fn-entry" data-entry="4">
        <p class="eyebrow">04 / The Realization</p>
        <p class="mk fn-lg">I thought training was simple.</p>
        <p class="mk fn-body muted">Share information. People learn. Problem solved.</p>
        <p class="mk fn-lg emp">Information ≠ Learning.</p>
        <p class="mk fn-body muted">Behavior change is hard.</p>
      </div>

      <div class="fn-entry" data-entry="5">
        <p class="eyebrow">05 / The Mentors</p>
        <p class="mk fn-body muted">I met people who could make<br>learning feel effortless.</p>
        <p class="mk fn-lg">Just <span class="emp">better</span> at helping<br>people understand.</p>
        <p class="mk fn-body muted">That changed everything.</p>
      </div>

      <div class="fn-entry" data-entry="6">
        <p class="eyebrow">06 / The Obsession</p>
        <p class="mk fn-lg">That curiosity became<br>an <span class="emp">obsession.</span></p>
        <p class="mk fn-body muted">Memory. Attention. Motivation.</p>
        <p class="mk fn-lg">Why do some things stick?</p>
      </div>

      <div class="fn-entry" data-entry="7">
        <p class="eyebrow">07 / The Discovery</p>
        <p class="mk fn-body muted">Instructional Design isn't slides.</p>
        <p class="mk fn-lg">It's understanding how people <span class="emp">learn…</span></p>
        <p class="mk fn-lg">and designing <span class="emp">for that.</span></p>
      </div>

      <div class="fn-entry fn-entry--right" data-entry="8">
        <p class="eyebrow">08 / Clarity</p>
        <p class="mk fn-lg">Remove jargon.<br>Remove clutter.<br>Remove complexity.</p>
        <p class="mk fn-lg emp">Keep only what matters.</p>
      </div>

      <div class="fn-entry" data-entry="9">
        <p class="eyebrow">09 / Stories</p>
        <p class="mk fn-body muted">My first mentor had an idea.</p>
        <p class="mk fn-lg">A <span class="emp">comic book.</span></p>
        <p class="mk fn-body muted">10 stories of service excellence.<br>Hand-drawn. Inked. Printed.</p>
        <p class="mk fn-lg emp">SEWA Chronicles.</p>
      </div>

      <div class="fn-entry fn-entry--center" data-entry="10">
        <p class="eyebrow">10 / The Mantra</p>
        <p class="mk fn-deva">असतो मा सद्गमय</p>
        <p class="mk fn-translit">Asatoma sadgamaya.</p>
        <p class="mk fn-lg">From assumption<br>to <span class="emp">understanding.</span></p>
        <p class="mk fn-body muted">That is learning.</p>
      </div>

      <div class="fn-entry" data-entry="11">
        <p class="eyebrow">11 / Today</p>
        <p class="mk fn-lg">Today I design<br>learning experiences.</p>
        <p class="mk fn-body muted">Digital. Interactive. Human-centered.</p>
        <p class="mk fn-lg">Built to be <span class="emp">remembered.</span></p>
      </div>

      <div class="fn-entry fn-entry--center" data-entry="12">
        <p class="eyebrow">12 / Field Notes Complete</p>
        <p class="mk fn-lg">I turn complexity<br>into <span class="emp">clarity.</span></p>
        <p class="mk fn-body muted">And build learning experiences<br>people actually remember.</p>
        <p class="mk fn-sig">— Naveen Jose</p>
        <div class="mk fn-cta-group">
          <a class="btn-cta" href="mailto:iamnaveenjose@outlook.com">Let's build something meaningful</a>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* ── Shared ──────────────────────────────────────────────────────────────── */
.fn-root {
  width: 100%;
  min-height: 100vh;
  background: #0D0C0A;
  color: #F4F1EC;
  font-family: "DM Sans", system-ui, sans-serif;
}
[data-theme="light"] .fn-root {
  background: #F4F1EC;
  color: #0D0C0A;
}

/* Monochrome emphasis — no blue */
.emp {
  font-weight: 720;
  color: #F4F1EC;
  opacity: 1 !important;
}
[data-theme="light"] .emp {
  color: #0D0C0A;
}

.muted { opacity: 0.42 !important; }

.eyebrow {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: inherit;
  opacity: 0.38;
  margin-bottom: 0.55em;
  display: block;
}

:deep(.wmask) {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding: 0.14em 0.06em;
  margin: -0.14em -0.06em;
}
:deep(.wfill) {
  display: inline-block;
  will-change: transform, opacity, filter;
}

.btn-cta {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 28px;
  border: 1px solid rgba(244, 241, 236, 0.2);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s, border-color 0.2s;
  text-align: center;
  letter-spacing: -0.01em;
}
.btn-cta:hover { opacity: 1; border-color: rgba(244, 241, 236, 0.55); }
[data-theme="light"] .btn-cta { border-color: rgba(13, 12, 10, 0.18); }
[data-theme="light"] .btn-cta:hover { border-color: rgba(13, 12, 10, 0.5); }

/* ── Mobile ──────────────────────────────────────────────────────────────── */
.fn-mobile-root {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #0D0C0A;
  touch-action: none;
}
[data-theme="light"] .fn-mobile-root { background: #F4F1EC; }

.m-scene {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 72px 32px 88px;
  gap: 0.44em;
  visibility: hidden;
  color: #F4F1EC;
}
[data-theme="light"] .m-scene { color: #0D0C0A; }
.m-scene--center { align-items: center; text-align: center; }

.m-portrait {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
}
.m-portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }

.m-name {
  font-size: clamp(34px, 8.5vw, 54px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.0;
}
.m-title {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.4;
  letter-spacing: 0.02em;
  margin-bottom: 0.2em;
}
.m-lg {
  font-size: clamp(22px, 5.8vw, 34px);
  font-weight: 650;
  letter-spacing: -0.035em;
  line-height: 1.12;
}
.m-body {
  font-size: clamp(14px, 3.6vw, 18px);
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: -0.02em;
}
.m-deva {
  font-family: 'Noto Sans Devanagari', serif;
  font-size: clamp(22px, 6.5vw, 40px);
  font-weight: 600;
  line-height: 1.4;
}
.m-translit {
  font-style: italic;
  font-size: 12px;
  opacity: 0.38;
  letter-spacing: 0.02em;
  margin-bottom: 0.35em;
}
.m-sig {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.48;
  letter-spacing: -0.02em;
  margin-top: 0.2em;
}
.m-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  margin-top: 12px;
}
.m-links a {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.5;
  color: inherit;
  letter-spacing: -0.01em;
}

.m-dots {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 20;
}
.m-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.2;
  transition: opacity 0.3s, height 0.3s;
}
.m-dots span.active { opacity: 0.8; height: 12px; border-radius: 2px; }
.m-coda { gap: 0.3em; }

.swipe-hint {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.22;
  z-index: 20;
  animation: hintpulse 2.2s ease-in-out infinite;
}
@keyframes hintpulse {
  0%, 100% { opacity: 0.22; transform: translateX(-50%) translateY(0); }
  50% { opacity: 0.08; transform: translateX(-50%) translateY(4px); }
}

/* ── Desktop canvas + entries ─────────────────────────────────────────────── */
.fn-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
}

.fn-scatter-container {
  position: fixed;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.fn-scroll-driver {
  height: 1300vh;
  width: 1px;
  pointer-events: none;
  position: relative;
}

.fn-entry {
  position: fixed;
  left: clamp(24px, 5vw, 72px);
  top: 50%;
  transform: translateY(-50%);
  max-width: min(480px, 38vw);
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 0.32em;
  color: #F4F1EC;
}
[data-theme="light"] .fn-entry { color: #0D0C0A; }

.fn-entry--right {
  left: auto;
  right: clamp(24px, 5vw, 72px);
  text-align: right;
}

.fn-entry--center {
  left: 50%;
  right: auto;
  transform: translate(-50%, -50%);
  text-align: center;
  align-items: center;
  max-width: min(560px, 48vw);
}

.fn-name {
  font-size: clamp(40px, 5.8vw, 84px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.0;
}
.fn-title {
  font-size: clamp(11px, 1.1vw, 15px);
  font-weight: 400;
  opacity: 0.4;
  margin-bottom: 0.15em;
  letter-spacing: 0.01em;
}
.fn-lg {
  font-size: clamp(22px, 3.4vw, 52px);
  font-weight: 650;
  letter-spacing: -0.036em;
  line-height: 1.1;
}
.fn-body {
  font-size: clamp(13px, 1.35vw, 18px);
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: -0.02em;
}
.fn-deva {
  font-family: 'Noto Sans Devanagari', serif;
  font-size: clamp(26px, 4.2vw, 66px);
  font-weight: 600;
  line-height: 1.4;
}
.fn-translit {
  font-style: italic;
  font-size: clamp(11px, 1.1vw, 16px);
  opacity: 0.38;
  letter-spacing: 0.02em;
}
.fn-sig {
  font-size: clamp(14px, 1.7vw, 22px);
  font-weight: 600;
  opacity: 0.48;
  letter-spacing: -0.02em;
}
.fn-cta-group { margin-top: 4px; pointer-events: auto; }
</style>
