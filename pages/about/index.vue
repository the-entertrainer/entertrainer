<script setup lang="ts">
import gsap from 'gsap'
import { useThemeStore } from '~/stores/theme'

definePageMeta({ pageTransition: false })

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap'
    }
  ]
})

const { $lenis }  = useNuxtApp()
const themeStore  = useThemeStore()
const canvasRef   = ref<HTMLCanvasElement | null>(null)
const isMobile    = ref(false)
const cleanups: Array<() => void> = []

// ── Mobile scene content ─────────────────────────────────────────────────────
const MOBILE_SCENES = [
  {
    eyebrow: '01 / Who I Am',
    gif: null as string | null,
    lines: [
      { tag: 'h1',  cls: 'm-name',  html: 'Naveen Jose' },
      { tag: 'p',   cls: 'm-title', html: 'Certified Instructional Design Specialist' },
      { tag: 'p',   cls: 'm-body',  html: 'Architecting learning experiences<br>that transform complexity into clarity.' },
    ],
  },
  {
    eyebrow: '02 / The Plan',
    gif: '/graduation.gif',
    lines: [
      { tag: 'p', cls: 'm-lg',   html: 'I graduated with a hospitality degree.' },
      { tag: 'p', cls: 'm-body muted', html: 'The plan seemed simple.<br>Work in hotels. Grow steadily.' },
      { tag: 'p', cls: 'm-lg hl', html: 'Then something unexpected happened.' },
    ],
  },
  {
    eyebrow: '03 / The Detour',
    gif: '/gifs/leap.gif',
    lines: [
      { tag: 'p', cls: 'm-body muted', html: 'Learning &amp; Development appeared.' },
      { tag: 'p', cls: 'm-body muted', html: 'Not as a dream. Not as a master plan.' },
      { tag: 'p', cls: 'm-lg',         html: 'Just <span class="hl">a door.</span>' },
      { tag: 'p', cls: 'm-body muted', html: 'One I decided to walk through.' },
    ],
  },
  {
    eyebrow: '04 / The First Realization',
    gif: '/gifs/myth.gif',
    lines: [
      { tag: 'p', cls: 'm-lg',         html: 'I thought training was simple.' },
      { tag: 'p', cls: 'm-body muted', html: 'Share information. People learn.<br>Problem solved.' },
      { tag: 'p', cls: 'm-lg',         html: 'I was <span class="hl">wrong.</span>' },
      { tag: 'p', cls: 'm-body muted', html: 'Knowledge is easy.<br>Behavior change is hard.' },
    ],
  },
  {
    eyebrow: '05 / The Mentors',
    gif: '/gifs/mentor.gif',
    lines: [
      { tag: 'p', cls: 'm-body muted', html: 'Then I met people who could make<br>learning feel effortless.' },
      { tag: 'p', cls: 'm-lg',         html: 'Just <span class="hl">better</span> at helping<br>people understand.' },
      { tag: 'p', cls: 'm-body muted', html: 'That changed everything.' },
    ],
  },
  {
    eyebrow: '06 / The Obsession',
    gif: '/gifs/psych.gif',
    lines: [
      { tag: 'p', cls: 'm-lg',         html: 'That curiosity became<br>an <span class="hl">obsession.</span>' },
      { tag: 'p', cls: 'm-body muted', html: 'Memory. Attention. Motivation.' },
      { tag: 'p', cls: 'm-lg',         html: 'Why do some things stick…<br>and others vanish by <span class="hl">lunch?</span>' },
    ],
  },
  {
    eyebrow: '07 / The Discovery',
    gif: '/gifs/hacker.gif',
    lines: [
      { tag: 'p', cls: 'm-body muted', html: 'Instructional Design isn\'t slides.' },
      { tag: 'p', cls: 'm-lg',         html: 'It\'s understanding how<br>people <span class="hl">learn</span>…' },
      { tag: 'p', cls: 'm-lg',         html: 'and designing<br><span class="hl">for that.</span>' },
    ],
  },
  {
    eyebrow: '08 / Strip the Noise',
    gif: '/gifs/strip.gif',
    lines: [
      { tag: 'p', cls: 'm-lg',   html: 'Remove jargon.<br>Remove clutter.<br>Remove complexity.' },
      { tag: 'p', cls: 'm-lg hl', html: 'Keep only what matters.' },
    ],
  },
  {
    eyebrow: '09 / SEWA Chronicles',
    gif: '/hi.gif',
    lines: [
      { tag: 'p', cls: 'm-body muted', html: 'My first mentor had an idea.' },
      { tag: 'p', cls: 'm-lg',         html: 'A <span class="hl">comic book.</span>' },
      { tag: 'p', cls: 'm-body muted', html: '10 stories of service excellence.<br>Hand-drawn. Inked. Printed.<br>Distributed to every Club Mahindra resort.' },
      { tag: 'p', cls: 'm-lg hl',      html: 'SEWA Chronicles.' },
      { tag: 'p', cls: 'm-body muted', html: 'People don\'t remember information.<br>They remember <span class="hl">stories.</span>' },
    ],
  },
  {
    eyebrow: '10 / The Mantra',
    gif: '/gifs/verse.gif',
    lines: [
      { tag: 'p', cls: 'm-deva',   html: 'असतो मा सद्गमय' },
      { tag: 'p', cls: 'm-translit', html: 'Asatoma sadgamaya.' },
      { tag: 'p', cls: 'm-lg',       html: 'From the unreal<br>to the <span class="hl">real.</span>' },
      { tag: 'p', cls: 'm-body muted', html: 'For me… that is learning.' },
    ],
  },
  {
    eyebrow: '11 / Today',
    gif: '/gifs/closer.gif',
    lines: [
      { tag: 'p', cls: 'm-lg',         html: 'Today I design<br>learning experiences.' },
      { tag: 'p', cls: 'm-body muted', html: 'Digital. Interactive. Human-centered.' },
      { tag: 'p', cls: 'm-lg',         html: 'Built to be <span class="hl">remembered.</span><br>Built to create <span class="hl">change.</span>' },
    ],
  },
  {
    eyebrow: '12 / The Work',
    gif: null,
    lines: [
      { tag: 'p', cls: 'm-lg',         html: 'I turn complexity<br>into <span class="hl">clarity.</span>' },
      { tag: 'p', cls: 'm-body muted', html: 'And build learning experiences<br>people actually remember.' },
      { tag: 'p', cls: 'm-sig',        html: '— Naveen Jose' },
    ],
  },
]

const GIF_MAP: Record<number, string> = {
  1: '/graduation.gif', 2: '/gifs/leap.gif',  3: '/gifs/myth.gif',
  4: '/gifs/mentor.gif', 5: '/gifs/psych.gif', 6: '/gifs/hacker.gif',
  7: '/gifs/strip.gif',  8: '/hi.gif',          9: '/gifs/verse.gif',
  10: '/gifs/closer.gif',
}
const GIF_POS: Record<number, [string, string, string]> = {
  1:  ['62%', '20%', '18vw'], 2:  ['10%', '52%', '15vw'],
  3:  ['60%', '56%', '13vw'], 4:  ['62%', '22%', '16vw'],
  5:  ['10%', '20%', '17vw'], 6:  ['60%', '48%', '14vw'],
  7:  ['62%', '28%', '19vw'], 8:  ['50%', '58%', '13vw'],
  9:  ['10%', '58%', '11vw'], 10: ['58%', '52%', '15vw'],
}

let exp: any = null
let _lastScene = -1

onMounted(async () => {
  isMobile.value = window.innerWidth < 768

  if (isMobile.value) {
    // ── Mobile: stop Lenis, use native CSS scroll-snap ────────
    const lenis = $lenis as any
    lenis?.stop?.()
    cleanups.push(() => lenis?.start?.())
    setupMobileIO()
  } else {
    // ── Desktop: boot Three.js experience ────────────────────
    const { AboutExperience } = await import('~/experience/about/AboutExperience')
    if (!canvasRef.value) return
    exp = new AboutExperience(canvasRef.value)
    exp.setTheme(themeStore.isDark)

    const stopTheme = watch(() => themeStore.isDark, (d) => exp?.setTheme(d))
    cleanups.push(stopTheme)

    const lenis = $lenis as any
    const onScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
      const p = limit > 0 ? scroll / limit : 0
      exp?.setProgress(p)
      updateDesktopOverlays(p)
    }
    lenis.on('scroll', onScroll)
    cleanups.push(() => lenis.off('scroll', onScroll))

    // Mouse parallax for GIF overlays (desktop)
    const gifEls = document.querySelectorAll<HTMLElement>('.gif-overlay')
    const onMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX / window.innerWidth  - 0.5) * 2
      const dy = (e.clientY / window.innerHeight - 0.5) * 2
      gifEls.forEach((el) => {
        el.style.transform = `translateX(${dx * -14}px) translateY(${dy * -9}px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg)`
      })
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    cleanups.push(() => window.removeEventListener('mousemove', onMouseMove))

    await nextTick()
    updateDesktopOverlays(0)
  }
})

onUnmounted(() => {
  exp?.destroy()
  exp = null
  cleanups.forEach(fn => fn())
  cleanups.length = 0
  _lastScene = -1
})

// ── Mobile: IntersectionObserver text reveal ─────────────────────────────────
function setupMobileIO() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      const section = e.target as HTMLElement
      // Stagger the child lines in
      const lines = section.querySelectorAll<HTMLElement>('.m-line')
      gsap.fromTo(lines,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.05 }
      )
      const gif = section.querySelector<HTMLElement>('.m-gif')
      if (gif) {
        gsap.fromTo(gif,
          { opacity: 0, scale: 0.88, rotation: -4 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.4)', delay: 0.15 }
        )
      }
      io.unobserve(section)
    })
  }, { threshold: 0.35 })

  document.querySelectorAll<HTMLElement>('.m-scene').forEach(el => io.observe(el))
  cleanups.push(() => io.disconnect())
}

// ── Desktop: GSAP overlay transitions ────────────────────────────────────────
const SCENE_COUNT = 12

function updateDesktopOverlays(p: number) {
  const rawScene  = p * SCENE_COUNT
  const sceneIdx  = Math.min(Math.floor(rawScene), SCENE_COUNT - 1)

  if (sceneIdx === _lastScene) return
  _lastScene = sceneIdx

  for (let i = 0; i < SCENE_COUNT; i++) {
    const el = document.querySelector<HTMLElement>(`.scene-text[data-scene="${i}"]`)
    if (!el) continue
    if (i === sceneIdx) {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }
      )
    } else {
      gsap.to(el, { opacity: 0, y: -18, duration: 0.4, ease: 'power2.in' })
    }
  }

  document.querySelectorAll<HTMLElement>('.gif-overlay').forEach((el) => {
    const s = parseInt(el.dataset.scene ?? '-1')
    const show = s === sceneIdx
    gsap.to(el, { opacity: show ? 1 : 0, scale: show ? 1 : 0.9, duration: 0.5, ease: 'power2.out' })
  })

  const coda = document.querySelector<HTMLElement>('.coda-overlay')
  if (coda) {
    const show = sceneIdx >= SCENE_COUNT - 1
    gsap.to(coda, { opacity: show ? 1 : 0, y: show ? 0 : 32, duration: 0.7, ease: 'power3.out', pointerEvents: show ? 'auto' : 'none' })
  }
}
</script>

<template>
  <div class="about-root">

    <!-- ══════════════════════════════════════════════════════════════
         MOBILE  — native scroll-snap, no Three.js
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="isMobile" class="mobile-about">
      <section
        v-for="(scene, i) in MOBILE_SCENES"
        :key="i"
        class="m-scene"
        :data-scene="i"
      >
        <!-- Eyebrow -->
        <p class="m-eyebrow m-line">{{ scene.eyebrow }}</p>

        <!-- GIF -->
        <div v-if="scene.gif" class="m-gif">
          <img :src="scene.gif" alt="" loading="lazy" />
        </div>

        <!-- Text lines -->
        <component
          :is="line.tag"
          v-for="(line, j) in scene.lines"
          :key="j"
          :class="['m-line', line.cls]"
          v-html="line.html"
        />
      </section>

      <!-- Mobile coda -->
      <section class="m-scene m-coda">
        <div class="coda-portrait m-line">
          <img src="/naveen.jpeg" alt="Naveen Jose" />
        </div>
        <p class="m-name m-line">Naveen Jose</p>
        <p class="m-cred m-line">CIDS Certified Instructional Design Specialist</p>
        <div class="m-links m-line">
          <a href="mailto:iamnaveenjose@outlook.com">iamnaveenjose@outlook.com</a>
          <a href="https://linkedin.com/in/entertrainer" target="_blank" rel="noopener noreferrer">linkedin.com/in/entertrainer</a>
        </div>
        <a class="btn-cta m-line" href="mailto:iamnaveenjose@outlook.com">Let's build something meaningful</a>
      </section>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         DESKTOP — Three.js canvas + fixed overlays
    ══════════════════════════════════════════════════════════════ -->
    <template v-else>
      <!-- Canvas sits behind everything via isolation -->
      <canvas ref="canvasRef" class="about-canvas" />

      <!-- Scroll driver — invisible height so Lenis has something to scroll -->
      <div class="scroll-driver" />

      <!-- 12 scene text overlays (fixed, GSAP-driven) -->

      <div class="scene-text" data-scene="0">
        <p class="st-eyebrow">01 / Who I Am</p>
        <h1 class="st-name">Naveen Jose</h1>
        <p class="st-title">Certified Instructional Design Specialist</p>
        <p class="st-body muted">Architecting learning experiences<br>that transform complexity into clarity.</p>
      </div>

      <div class="scene-text" data-scene="1">
        <p class="st-eyebrow">02 / The Plan</p>
        <p class="st-lg">I graduated with a<br>hospitality degree.</p>
        <p class="st-body muted">The plan seemed simple.<br>Work in hotels. Grow steadily.</p>
        <p class="st-lg hl">Then something unexpected happened.</p>
      </div>

      <div class="scene-text" data-scene="2">
        <p class="st-eyebrow">03 / The Detour</p>
        <p class="st-body muted">Learning &amp; Development appeared.</p>
        <p class="st-body muted">Not as a dream. Not as a master plan.</p>
        <p class="st-lg">Just <span class="hl">a door.</span></p>
        <p class="st-body muted">One I decided to walk through.</p>
      </div>

      <div class="scene-text" data-scene="3">
        <p class="st-eyebrow">04 / The First Realization</p>
        <p class="st-lg">I thought training was simple.</p>
        <p class="st-body muted">Share information. People learn. Problem solved.</p>
        <p class="st-lg">I was <span class="hl">wrong.</span></p>
        <p class="st-body muted">Knowledge is easy.<br>Behavior change is hard.</p>
      </div>

      <div class="scene-text" data-scene="4">
        <p class="st-eyebrow">05 / The Mentors</p>
        <p class="st-body muted">Then I met people who could make<br>learning feel effortless.</p>
        <p class="st-lg">Just <span class="hl">better</span> at helping<br>people understand.</p>
        <p class="st-body muted">That changed everything.</p>
      </div>

      <div class="scene-text" data-scene="5">
        <p class="st-eyebrow">06 / The Obsession</p>
        <p class="st-lg">That curiosity became<br>an <span class="hl">obsession.</span></p>
        <p class="st-body muted">Memory. Attention. Motivation.</p>
        <p class="st-lg">Why do some things stick…<br>and others vanish by <span class="hl">lunch?</span></p>
      </div>

      <div class="scene-text" data-scene="6">
        <p class="st-eyebrow">07 / The Discovery</p>
        <p class="st-body muted">Instructional Design isn't slides.</p>
        <p class="st-lg">It's understanding how<br>people <span class="hl">learn</span>…</p>
        <p class="st-lg">and designing <span class="hl">for that.</span></p>
      </div>

      <div class="scene-text" data-scene="7">
        <p class="st-eyebrow">08 / Strip the Noise</p>
        <p class="st-lg">Remove jargon.<br>Remove clutter.<br>Remove complexity.</p>
        <p class="st-lg hl">Keep only what matters.</p>
      </div>

      <div class="scene-text" data-scene="8">
        <p class="st-eyebrow">09 / SEWA Chronicles</p>
        <p class="st-body muted">My first mentor had an idea.</p>
        <p class="st-lg">A <span class="hl">comic book.</span></p>
        <p class="st-body muted">10 stories of service excellence.<br>Hand-drawn. Inked. Printed.<br>Every Club Mahindra resort in the country.</p>
        <p class="st-lg hl">SEWA Chronicles.</p>
        <p class="st-body muted">People remember <span class="hl">stories.</span></p>
      </div>

      <div class="scene-text scene-text--center" data-scene="9">
        <p class="st-eyebrow">10 / The Mantra</p>
        <p class="st-devanagari">असतो मा सद्गमय</p>
        <p class="st-translit">Asatoma sadgamaya.</p>
        <p class="st-lg">From the unreal<br>to the <span class="hl">real.</span></p>
        <p class="st-body muted">For me… that is learning.</p>
      </div>

      <div class="scene-text" data-scene="10">
        <p class="st-eyebrow">11 / Today</p>
        <p class="st-lg">Today I design<br>learning experiences.</p>
        <p class="st-body muted">Digital. Interactive. Human-centered.</p>
        <p class="st-lg">Built to be <span class="hl">remembered.</span><br>Built to create <span class="hl">change.</span></p>
      </div>

      <div class="scene-text scene-text--center" data-scene="11">
        <p class="st-eyebrow">12 / The Work</p>
        <p class="st-lg">I turn complexity<br>into <span class="hl">clarity.</span></p>
        <p class="st-body muted">And build learning experiences<br>people actually remember.</p>
        <p class="st-sig">— Naveen Jose</p>
      </div>

      <!-- GIF overlays (desktop only) -->
      <img
        v-for="(src, idx) in GIF_MAP" :key="idx"
        class="gif-overlay"
        :data-scene="idx"
        :src="src"
        :style="{ left: GIF_POS[idx]?.[0] ?? '62%', top: GIF_POS[idx]?.[1] ?? '30%', width: GIF_POS[idx]?.[2] ?? '16vw' }"
        alt=""
        loading="lazy"
      />

      <!-- Coda (desktop) -->
      <div class="coda-overlay">
        <div class="coda-portrait"><img src="/naveen.jpeg" alt="Naveen Jose" /></div>
        <p class="coda-name">Naveen Jose</p>
        <p class="coda-cred">CIDS Certified Instructional Design Specialist</p>
        <div class="coda-links">
          <a href="mailto:iamnaveenjose@outlook.com">iamnaveenjose@outlook.com</a>
          <a href="https://linkedin.com/in/entertrainer" target="_blank" rel="noopener noreferrer">linkedin.com/in/entertrainer</a>
        </div>
        <a class="btn-cta" href="mailto:iamnaveenjose@outlook.com">Let's build something meaningful</a>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* ── Root ── */
.about-root {
  width: 100%;
  background: var(--color-bg);
  /* isolate stacking context so fixed canvas sits above page bg */
  isolation: isolate;
}

/* ══════════════════════════════════════════════════════════
   MOBILE STYLES
══════════════════════════════════════════════════════════ */
.mobile-about {
  display: flex;
  flex-direction: column;
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100svh;
  background: #0D0C0A;
  -webkit-overflow-scrolling: touch;
}

[data-theme="light"] .mobile-about {
  background: #F4F1EC;
}

.m-scene {
  flex: 0 0 100svh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 72px 26px 80px;
  gap: 0.5em;
  overflow: hidden;
  /* Subtle radial gradient per scene */
  position: relative;
}

/* Decorative gradient blob */
.m-scene::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(110,146,206,0.12) 0%, transparent 70%);
  right: -60px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

[data-theme="light"] .m-scene::before {
  background: radial-gradient(circle, rgba(36,63,106,0.08) 0%, transparent 70%);
}

/* Mobile line starts hidden (GSAP reveals them) */
.m-line { opacity: 0; }

.m-eyebrow {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0;
  margin-bottom: 0.8em;
}

.m-gif {
  opacity: 0;
  width: clamp(80px, 28vw, 140px);
  margin-bottom: 0.6em;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0,0,0,0.45);
  align-self: flex-end;
}
.m-gif img { display: block; width: 100%; height: auto; }

.m-name {
  font-size: clamp(38px, 9vw, 58px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.0;
  color: var(--color-text);
}

.m-title {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.45;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin-bottom: 0.5em;
}

.m-lg {
  font-size: clamp(24px, 6.5vw, 38px);
  font-weight: 650;
  letter-spacing: -0.035em;
  line-height: 1.12;
  color: var(--color-text);
}

.m-body {
  font-size: clamp(14px, 3.8vw, 18px);
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.m-deva {
  font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
  font-size: clamp(26px, 7.5vw, 48px);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text);
}

.m-translit {
  font-style: italic;
  font-size: 14px;
  opacity: 0.4;
  letter-spacing: 0.02em;
  color: var(--color-text);
  margin-bottom: 0.4em;
}

.m-sig {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.55;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin-top: 0.3em;
}

.muted { opacity: 0.45 !important; }
.hl    { color: #6E92CE; font-weight: 700; }
[data-theme="light"] .hl { color: #243F6A; }
.hl    { color: #6E92CE; font-weight: 700; }

/* Mobile coda */
.m-coda { align-items: center; text-align: center; }
.m-coda .coda-portrait {
  width: 130px; height: 130px;
  border-radius: 50%; overflow: hidden;
  margin-bottom: 14px;
}
.m-coda .coda-portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.m-coda .m-name  { font-size: 28px; font-weight: 700; letter-spacing: -0.04em; }
.m-cred  { font-size: 12px; opacity: 0.38; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text); }
.m-links { display: flex; flex-direction: column; gap: 6px; margin-top: 18px; }
.m-links a {
  font-size: 15px; font-weight: 500; opacity: 0.55;
  letter-spacing: -0.02em; color: var(--color-text);
  transition: opacity 0.2s;
}
.m-links a:active { opacity: 1; color: #6E92CE; }

/* ══════════════════════════════════════════════════════════
   DESKTOP STYLES
══════════════════════════════════════════════════════════ */

/* Canvas absolutely isolated in its own layer */
.about-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  /* z-index managed by isolation on parent */
}

.scroll-driver {
  height: 1300vh;
  width: 100%;
  pointer-events: none;
}

/* Scene text overlays */
.scene-text {
  position: fixed;
  left: clamp(20px, 4vw, 60px);
  top: 50%;
  transform: translateY(-50%);
  max-width: min(520px, 42vw);
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 0.38em;
}

.scene-text--center {
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  max-width: min(580px, 56vw);
  align-items: center;
}

.st-eyebrow {
  font-size: clamp(10px, 1vw, 13px);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.32;
  color: var(--color-text);
  margin-bottom: 0.5em;
}
.st-name {
  font-size: clamp(44px, 6.5vw, 96px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.0;
  color: var(--color-text);
}
.st-title {
  font-size: clamp(12px, 1.3vw, 17px);
  font-weight: 400;
  opacity: 0.45;
  margin-bottom: 0.3em;
  color: var(--color-text);
}
.st-lg {
  font-size: clamp(26px, 3.8vw, 58px);
  font-weight: 650;
  letter-spacing: -0.035em;
  line-height: 1.1;
  color: var(--color-text);
}
.st-body {
  font-size: clamp(13px, 1.5vw, 20px);
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: -0.02em;
  color: var(--color-text);
}
.muted      { opacity: 0.45; }
.st-devanagari {
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: clamp(30px, 5vw, 76px);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text);
}
.st-translit {
  font-style: italic;
  font-size: clamp(12px, 1.3vw, 18px);
  opacity: 0.4;
  letter-spacing: 0.02em;
  color: var(--color-text);
}
.st-sig { font-size: clamp(16px, 2vw, 26px); font-weight: 600; opacity: 0.55; color: var(--color-text); }

/* GIF overlays */
.gif-overlay {
  position: fixed;
  z-index: 8;
  pointer-events: none;
  border-radius: 10px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.52), 0 3px 10px rgba(0,0,0,0.2);
  opacity: 0;
  transform-style: preserve-3d;
  will-change: transform, opacity;
  transform: scale(0.9);
}

/* Coda overlay */
.coda-overlay {
  position: fixed;
  inset: 0;
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  opacity: 0;
  pointer-events: none;
  padding: 80px clamp(20px, 4vw, 60px);
  background: rgba(13,12,10,0.7);
  backdrop-filter: blur(2px);
}
[data-theme="light"] .coda-overlay { background: rgba(244,241,236,0.75); }

.coda-portrait { width: 160px; height: 160px; border-radius: 50%; overflow: hidden; margin-bottom: 10px; }
.coda-portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.coda-name { font-size: clamp(24px, 3vw, 40px); font-weight: 700; letter-spacing: -0.04em; color: var(--color-text); }
.coda-cred { font-size: 12px; opacity: 0.38; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text); }
.coda-links { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 18px; }
.coda-links a {
  font-size: clamp(13px, 1.5vw, 18px);
  font-weight: 500; opacity: 0.55;
  letter-spacing: -0.02em; color: var(--color-text);
  transition: opacity 0.2s;
}
.coda-links a:hover { opacity: 1; color: #6E92CE; }

/* Shared CTA button */
.btn-cta {
  display: inline-block;
  margin-top: 22px;
  padding: 13px 28px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 999px;
  font-size: clamp(13px, 1.3vw, 16px);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-text);
  opacity: 0.75;
  transition: opacity 0.2s, border-color 0.2s, background 0.2s;
  text-align: center;
}
.btn-cta:hover, .btn-cta:active {
  opacity: 1;
  background: rgba(110,146,206,0.14);
  border-color: #6E92CE;
}
[data-theme="light"] .btn-cta { border-color: rgba(0,0,0,0.15); }
</style>
