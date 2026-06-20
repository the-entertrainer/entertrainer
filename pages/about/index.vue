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

const { $lenis }   = useNuxtApp()
const themeStore   = useThemeStore()
const canvasRef    = ref<HTMLCanvasElement | null>(null)
const isMobile     = ref(false)
const cleanups: Array<() => void> = []

// ── Word-mask utility (same pattern as old About page) ───────────────────────
function maskWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.masked === '1') return [...el.querySelectorAll<HTMLElement>('.wfill')]
  const fills: HTMLElement[] = []
  const frag  = document.createDocumentFragment()

  const wrap = (html: string, extra = '') => {
    const m = document.createElement('span'); m.className = 'wmask'
    const f = document.createElement('span'); f.className = ('wfill ' + extra).trim()
    f.innerHTML = html; m.appendChild(f); frag.appendChild(m); fills.push(f)
  }

  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      ;(node.textContent ?? '').split(/(\s+)/).forEach((p) => {
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

function prepScene(container: HTMLElement) {
  const allFills: HTMLElement[] = []
  container.querySelectorAll<HTMLElement>('.mk').forEach((el) => {
    const f = maskWords(el); allFills.push(...f)
  })
  gsap.set(allFills, RISE)
  return allFills
}

function revealScene(container: HTMLElement, delay = 0) {
  const fills = container.querySelectorAll<HTMLElement>('.wfill')
  const eyebrow = container.querySelector<HTMLElement>('.eyebrow')
  gsap.fromTo(eyebrow ?? [], { opacity: 0 }, { opacity: 0.38, duration: 0.5, delay })
  gsap.to(fills, {
    yPercent: 0, opacity: 1, filter: 'blur(0px)',
    duration: 0.72, ease: 'power3.out', stagger: 0.036, delay
  })
  const gif = container.querySelector<HTMLElement>('.mgif')
  if (gif) {
    gsap.fromTo(gif,
      { opacity: 0, scale: 0.82, rotation: -6 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.5)', delay: delay + 0.25 }
    )
  }
}

// ── Mobile: fixed-stack scene state ─────────────────────────────────────────
const mRefs = ref<(HTMLElement | null)[]>([])
const mCurrent = ref(0)
let mTransitioning = false
const TOTAL_MOBILE_SCENES = 13

function goMobile(next: number) {
  next = Math.max(0, Math.min(TOTAL_MOBILE_SCENES - 1, next))
  if (next === mCurrent.value || mTransitioning) return
  mTransitioning = true

  const prevEl = mRefs.value[mCurrent.value]
  const nextEl = mRefs.value[next]
  if (!prevEl || !nextEl) { mTransitioning = false; return }

  const dir = next > mCurrent.value ? 1 : -1

  prepScene(nextEl)
  gsap.set(nextEl, { yPercent: dir * 100, visibility: 'visible' })

  const tl = gsap.timeline({
    onComplete() { mTransitioning = false; mCurrent.value = next }
  })
  tl.to(prevEl, { yPercent: -dir * 10, opacity: 0, duration: 0.35, ease: 'power2.in' })
  tl.to(nextEl, { yPercent: 0, duration: 0.52, ease: 'power3.out' }, 0.18)
  tl.to(nextEl.querySelectorAll('.wfill'), {
    yPercent: 0, opacity: 1, filter: 'blur(0px)',
    duration: 0.68, ease: 'power3.out', stagger: 0.034
  }, 0.32)
  const eyebrow = nextEl.querySelector<HTMLElement>('.eyebrow')
  if (eyebrow) tl.fromTo(eyebrow, { opacity: 0 }, { opacity: 0.38, duration: 0.45 }, 0.28)
  const gif = nextEl.querySelector<HTMLElement>('.mgif')
  if (gif) tl.fromTo(gif, { opacity: 0, scale: 0.82, rotation: -6 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.52, ease: 'back.out(1.5)' }, 0.42)
  tl.set(prevEl, { visibility: 'hidden' })
}

// ── Desktop state ────────────────────────────────────────────────────────────
let exp: any = null
let _lastScene = -1
const SCENE_COUNT = 12

const GIF_MAP: Record<number, string> = {
  1: '/graduation.gif', 2: '/gifs/leap.gif',   3: '/gifs/myth.gif',
  4: '/gifs/mentor.gif', 5: '/gifs/psych.gif', 6: '/gifs/hacker.gif',
  7: '/gifs/strip.gif',  8: '/hi.gif',          9: '/gifs/verse.gif',
  10: '/gifs/closer.gif',
}
const GIF_POS: Record<number, [string, string, string]> = {
  1:  ['62%','20%','18vw'], 2:  ['10%','52%','15vw'], 3:  ['60%','55%','13vw'],
  4:  ['62%','22%','16vw'], 5:  ['10%','20%','17vw'], 6:  ['60%','47%','14vw'],
  7:  ['62%','28%','19vw'], 8:  ['50%','57%','13vw'], 9:  ['10%','57%','11vw'],
  10: ['58%','52%','15vw'],
}

function updateDesktop(p: number) {
  const idx = Math.min(Math.floor(p * SCENE_COUNT), SCENE_COUNT - 1)
  if (idx === _lastScene) return
  _lastScene = idx

  for (let i = 0; i < SCENE_COUNT; i++) {
    const el = document.querySelector<HTMLElement>(`.st[data-scene="${i}"]`)
    if (!el) continue
    if (i === idx) {
      gsap.set(el, { opacity: 1 })
      prepScene(el)
      revealScene(el)
    } else {
      gsap.to(el.querySelectorAll('.wfill'), { yPercent: -14, opacity: 0, filter: 'blur(4px)', duration: 0.3, ease: 'power2.in' })
      gsap.to(el, { opacity: 0, duration: 0.3 })
    }
  }

  document.querySelectorAll<HTMLElement>('.gif-overlay').forEach((el) => {
    const s = parseInt(el.dataset.scene ?? '-1')
    const show = s === idx
    gsap.to(el, { opacity: show ? 1 : 0, scale: show ? 1 : 0.9, duration: 0.5, ease: 'power2.out' })
  })

  const coda = document.querySelector<HTMLElement>('.coda-overlay')
  if (coda) {
    const show = idx >= SCENE_COUNT - 1
    gsap.to(coda, { opacity: show ? 1 : 0, duration: 0.65 })
    coda.style.pointerEvents = show ? 'auto' : 'none'
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  isMobile.value = window.innerWidth < 768
  await nextTick()

  if (isMobile.value) {
    mRefs.value.forEach((el, i) => {
      if (!el) return
      gsap.set(el, { yPercent: i === 0 ? 0 : 100, visibility: i === 0 ? 'visible' : 'hidden' })
    })
    mRefs.value.forEach((el) => { if (el) prepScene(el) })
    const s0 = mRefs.value[0]
    if (s0) revealScene(s0, 0.4)

    let ty = 0
    const root = document.querySelector<HTMLElement>('.mobile-root')!
    root.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY }, { passive: true })
    root.addEventListener('touchend', (e) => {
      const dy = ty - e.changedTouches[0].clientY
      if (Math.abs(dy) < 32) return
      goMobile(mCurrent.value + (dy > 0 ? 1 : -1))
    }, { passive: true })
    root.addEventListener('wheel', (e) => {
      goMobile(mCurrent.value + (e.deltaY > 0 ? 1 : -1))
    }, { passive: true })

  } else {
    const { AboutExperience } = await import('~/experience/about/AboutExperience')
    if (!canvasRef.value) return
    exp = new AboutExperience(canvasRef.value)
    exp.setTheme(themeStore.isDark)

    const stopTheme = watch(() => themeStore.isDark, (d) => exp?.setTheme(d))
    cleanups.push(stopTheme)

    document.querySelectorAll<HTMLElement>('.st').forEach((el) => prepScene(el))

    const lenis = $lenis as any
    const onScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
      exp?.setProgress(limit > 0 ? scroll / limit : 0)
      updateDesktop(limit > 0 ? scroll / limit : 0)
    }
    lenis.on('scroll', onScroll)
    cleanups.push(() => lenis.off('scroll', onScroll))

    const gifEls = document.querySelectorAll<HTMLElement>('.gif-overlay')
    const onMouse = (e: MouseEvent) => {
      const dx = (e.clientX / window.innerWidth  - 0.5) * 2
      const dy = (e.clientY / window.innerHeight - 0.5) * 2
      gifEls.forEach(el => {
        el.style.transform = `translateX(${dx * -14}px) translateY(${dy * -9}px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg)`
      })
    }
    window.addEventListener('mousemove', onMouse, { passive: true })
    cleanups.push(() => window.removeEventListener('mousemove', onMouse))

    updateDesktop(0)
  }
})

onUnmounted(() => {
  exp?.destroy(); exp = null
  cleanups.forEach(fn => fn()); cleanups.length = 0
  _lastScene = -1
})
</script>

<template>
  <div class="about-root">

    <!-- ══════════════════════════════════════════════════════════
         MOBILE — fixed stack, GSAP swipe transitions
    ══════════════════════════════════════════════════════════ -->
    <div v-if="isMobile" class="mobile-root">

      <!-- Scene 0 · WHO AM I -->
      <section class="m-scene" :ref="el => mRefs[0] = el as HTMLElement">
        <p class="eyebrow">01 / Who I Am</p>
        <h1 class="mk m-name">Naveen Jose</h1>
        <p class="mk m-title">Certified Instructional Design Specialist</p>
        <p class="mk m-body">Architecting learning experiences<br>that transform complexity into clarity.</p>
      </section>

      <!-- Scene 1 · THE PLAN -->
      <section class="m-scene" :ref="el => mRefs[1] = el as HTMLElement">
        <p class="eyebrow">02 / The Plan</p>
        <img class="mgif" :src="'/graduation.gif'" alt="" loading="lazy" />
        <p class="mk m-lg">I graduated with a hospitality degree.</p>
        <p class="mk m-body muted">The plan seemed simple.<br>Work in hotels. Grow steadily.</p>
        <p class="mk m-lg hl">Then something unexpected happened.</p>
      </section>

      <!-- Scene 2 · THE DETOUR -->
      <section class="m-scene" :ref="el => mRefs[2] = el as HTMLElement">
        <p class="eyebrow">03 / The Detour</p>
        <img class="mgif" :src="'/gifs/leap.gif'" alt="" loading="lazy" />
        <p class="mk m-body muted">Learning &amp; Development appeared.</p>
        <p class="mk m-body muted">Not as a dream. Not as a master plan.</p>
        <p class="mk m-lg">Just <span class="hl">a door.</span></p>
        <p class="mk m-body muted">One I decided to walk through.</p>
      </section>

      <!-- Scene 3 · THE FIRST REALIZATION -->
      <section class="m-scene" :ref="el => mRefs[3] = el as HTMLElement">
        <p class="eyebrow">04 / The First Realization</p>
        <img class="mgif" :src="'/gifs/myth.gif'" alt="" loading="lazy" />
        <p class="mk m-lg">I thought training was simple.</p>
        <p class="mk m-body muted">Share information. People learn. Problem solved.</p>
        <p class="mk m-lg">I was <span class="hl">wrong.</span></p>
        <p class="mk m-body muted">Knowledge is easy.<br>Behavior change is hard.</p>
      </section>

      <!-- Scene 4 · MENTORS -->
      <section class="m-scene" :ref="el => mRefs[4] = el as HTMLElement">
        <p class="eyebrow">05 / The Mentors</p>
        <img class="mgif" :src="'/gifs/mentor.gif'" alt="" loading="lazy" />
        <p class="mk m-body muted">Then I met people who could make<br>learning feel effortless.</p>
        <p class="mk m-lg">Just <span class="hl">better</span> at helping<br>people understand.</p>
        <p class="mk m-body muted">That changed everything.</p>
      </section>

      <!-- Scene 5 · THE OBSESSION -->
      <section class="m-scene" :ref="el => mRefs[5] = el as HTMLElement">
        <p class="eyebrow">06 / The Obsession</p>
        <img class="mgif" :src="'/gifs/psych.gif'" alt="" loading="lazy" />
        <p class="mk m-lg">That curiosity became<br>an <span class="hl">obsession.</span></p>
        <p class="mk m-body muted">Memory. Attention. Motivation.</p>
        <p class="mk m-lg">Why do some things stick…<br>and others vanish by <span class="hl">lunch?</span></p>
      </section>

      <!-- Scene 6 · THE DISCOVERY -->
      <section class="m-scene" :ref="el => mRefs[6] = el as HTMLElement">
        <p class="eyebrow">07 / The Discovery</p>
        <img class="mgif" :src="'/gifs/hacker.gif'" alt="" loading="lazy" />
        <p class="mk m-body muted">Instructional Design isn't slides.</p>
        <p class="mk m-lg">It's understanding how people <span class="hl">learn…</span></p>
        <p class="mk m-lg">and designing <span class="hl">for that.</span></p>
      </section>

      <!-- Scene 7 · STRIP THE NOISE -->
      <section class="m-scene" :ref="el => mRefs[7] = el as HTMLElement">
        <p class="eyebrow">08 / Strip the Noise</p>
        <img class="mgif" :src="'/gifs/strip.gif'" alt="" loading="lazy" />
        <p class="mk m-lg">Remove jargon.<br>Remove clutter.<br>Remove complexity.</p>
        <p class="mk m-lg hl">Keep only what matters.</p>
      </section>

      <!-- Scene 8 · SEWA CHRONICLES -->
      <section class="m-scene" :ref="el => mRefs[8] = el as HTMLElement">
        <p class="eyebrow">09 / SEWA Chronicles</p>
        <img class="mgif" :src="'/hi.gif'" alt="" loading="lazy" />
        <p class="mk m-body muted">My first mentor had an idea.</p>
        <p class="mk m-lg">A <span class="hl">comic book.</span></p>
        <p class="mk m-body muted">10 stories of service excellence.<br>Hand-drawn. Inked. Printed.<br>Every Club Mahindra resort in the country.</p>
        <p class="mk m-lg hl">SEWA Chronicles.</p>
        <p class="mk m-body muted">People remember <span class="hl">stories.</span></p>
      </section>

      <!-- Scene 9 · THE MANTRA -->
      <section class="m-scene m-scene--center" :ref="el => mRefs[9] = el as HTMLElement">
        <p class="eyebrow">10 / The Mantra</p>
        <img class="mgif mgif--center" :src="'/gifs/verse.gif'" alt="" loading="lazy" />
        <p class="mk m-deva">असतो मा सद्गमय</p>
        <p class="mk m-translit">Asatoma sadgamaya.</p>
        <p class="mk m-lg">From the unreal<br>to the <span class="hl">real.</span></p>
        <p class="mk m-body muted">For me… that is learning.</p>
      </section>

      <!-- Scene 10 · TODAY -->
      <section class="m-scene" :ref="el => mRefs[10] = el as HTMLElement">
        <p class="eyebrow">11 / Today</p>
        <img class="mgif" :src="'/gifs/closer.gif'" alt="" loading="lazy" />
        <p class="mk m-lg">Today I design<br>learning experiences.</p>
        <p class="mk m-body muted">Digital. Interactive. Human-centered.</p>
        <p class="mk m-lg">Built to be <span class="hl">remembered.</span><br>Built to create <span class="hl">change.</span></p>
      </section>

      <!-- Scene 11 · THE WORK -->
      <section class="m-scene m-scene--center" :ref="el => mRefs[11] = el as HTMLElement">
        <p class="eyebrow">12 / The Work</p>
        <p class="mk m-lg">I turn complexity<br>into <span class="hl">clarity.</span></p>
        <p class="mk m-body muted">And build learning experiences<br>people actually remember.</p>
        <p class="mk m-sig">— Naveen Jose</p>
      </section>

      <!-- Scene 12 · CODA -->
      <section class="m-scene m-scene--center m-coda" :ref="el => mRefs[12] = el as HTMLElement">
        <div class="coda-portrait mgif">
          <img :src="'/naveen.jpeg'" alt="Naveen Jose" />
        </div>
        <p class="mk m-name-sm">Naveen Jose</p>
        <p class="mk m-cred">CIDS Certified Instructional Design Specialist</p>
        <div class="mk m-links">
          <a href="mailto:iamnaveenjose@outlook.com">iamnaveenjose@outlook.com</a>
          <a href="https://linkedin.com/in/entertrainer" target="_blank" rel="noopener noreferrer">linkedin.com/in/entertrainer</a>
        </div>
        <a class="mk btn-cta" href="mailto:iamnaveenjose@outlook.com">Let's build something meaningful</a>
      </section>

      <!-- Progress dots -->
      <div class="m-dots">
        <span
          v-for="i in TOTAL_MOBILE_SCENES" :key="i"
          :class="{ active: mCurrent === i - 1 }"
        />
      </div>

      <!-- Swipe hint (only on first scene) -->
      <p v-if="mCurrent === 0" class="swipe-hint">Swipe up</p>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         DESKTOP — Three.js canvas + fixed text overlays
    ══════════════════════════════════════════════════════════ -->
    <template v-else>
      <canvas ref="canvasRef" class="about-canvas" />
      <div class="scroll-driver" />

      <!-- Scene 0 -->
      <div class="st" data-scene="0">
        <p class="eyebrow">01 / Who I Am</p>
        <h1 class="mk st-name">Naveen Jose</h1>
        <p class="mk st-title">Certified Instructional Design Specialist</p>
        <p class="mk st-body muted">Architecting learning experiences<br>that transform complexity into clarity.</p>
      </div>
      <!-- Scene 1 -->
      <div class="st" data-scene="1">
        <p class="eyebrow">02 / The Plan</p>
        <p class="mk st-lg">I graduated with a<br>hospitality degree.</p>
        <p class="mk st-body muted">The plan seemed simple.<br>Work in hotels. Grow steadily.</p>
        <p class="mk st-lg hl">Then something unexpected happened.</p>
      </div>
      <!-- Scene 2 -->
      <div class="st" data-scene="2">
        <p class="eyebrow">03 / The Detour</p>
        <p class="mk st-body muted">Learning &amp; Development appeared.</p>
        <p class="mk st-body muted">Not as a dream. Not as a master plan.</p>
        <p class="mk st-lg">Just <span class="hl">a door.</span></p>
        <p class="mk st-body muted">One I decided to walk through.</p>
      </div>
      <!-- Scene 3 -->
      <div class="st" data-scene="3">
        <p class="eyebrow">04 / The First Realization</p>
        <p class="mk st-lg">I thought training was simple.</p>
        <p class="mk st-body muted">Share information. People learn. Problem solved.</p>
        <p class="mk st-lg">I was <span class="hl">wrong.</span></p>
        <p class="mk st-body muted">Knowledge is easy.<br>Behavior change is hard.</p>
      </div>
      <!-- Scene 4 -->
      <div class="st" data-scene="4">
        <p class="eyebrow">05 / The Mentors</p>
        <p class="mk st-body muted">Then I met people who could make<br>learning feel effortless.</p>
        <p class="mk st-lg">Just <span class="hl">better</span> at helping<br>people understand.</p>
        <p class="mk st-body muted">That changed everything.</p>
      </div>
      <!-- Scene 5 -->
      <div class="st" data-scene="5">
        <p class="eyebrow">06 / The Obsession</p>
        <p class="mk st-lg">That curiosity became<br>an <span class="hl">obsession.</span></p>
        <p class="mk st-body muted">Memory. Attention. Motivation.</p>
        <p class="mk st-lg">Why do some things stick…<br>and others vanish by <span class="hl">lunch?</span></p>
      </div>
      <!-- Scene 6 -->
      <div class="st" data-scene="6">
        <p class="eyebrow">07 / The Discovery</p>
        <p class="mk st-body muted">Instructional Design isn't slides.</p>
        <p class="mk st-lg">It's understanding how people <span class="hl">learn…</span></p>
        <p class="mk st-lg">and designing <span class="hl">for that.</span></p>
      </div>
      <!-- Scene 7 -->
      <div class="st" data-scene="7">
        <p class="eyebrow">08 / Strip the Noise</p>
        <p class="mk st-lg">Remove jargon.<br>Remove clutter.<br>Remove complexity.</p>
        <p class="mk st-lg hl">Keep only what matters.</p>
      </div>
      <!-- Scene 8 -->
      <div class="st" data-scene="8">
        <p class="eyebrow">09 / SEWA Chronicles</p>
        <p class="mk st-body muted">My first mentor had an idea.</p>
        <p class="mk st-lg">A <span class="hl">comic book.</span></p>
        <p class="mk st-body muted">10 stories of service excellence.<br>Hand-drawn. Inked. Printed.</p>
        <p class="mk st-lg hl">SEWA Chronicles.</p>
        <p class="mk st-body muted">People remember <span class="hl">stories.</span></p>
      </div>
      <!-- Scene 9 -->
      <div class="st st--center" data-scene="9">
        <p class="eyebrow">10 / The Mantra</p>
        <p class="mk st-deva">असतो मा सद्गमय</p>
        <p class="mk st-translit">Asatoma sadgamaya.</p>
        <p class="mk st-lg">From the unreal<br>to the <span class="hl">real.</span></p>
        <p class="mk st-body muted">For me… that is learning.</p>
      </div>
      <!-- Scene 10 -->
      <div class="st" data-scene="10">
        <p class="eyebrow">11 / Today</p>
        <p class="mk st-lg">Today I design<br>learning experiences.</p>
        <p class="mk st-body muted">Digital. Interactive. Human-centered.</p>
        <p class="mk st-lg">Built to be <span class="hl">remembered.</span><br>Built to create <span class="hl">change.</span></p>
      </div>
      <!-- Scene 11 -->
      <div class="st st--center" data-scene="11">
        <p class="eyebrow">12 / The Work</p>
        <p class="mk st-lg">I turn complexity<br>into <span class="hl">clarity.</span></p>
        <p class="mk st-body muted">And build learning experiences<br>people actually remember.</p>
        <p class="mk st-sig">— Naveen Jose</p>
      </div>

      <!-- Desktop GIF overlays -->
      <img
        v-for="(src, idx) in GIF_MAP" :key="idx"
        class="gif-overlay"
        :data-scene="idx"
        :src="src"
        :style="{ left: GIF_POS[idx]?.[0], top: GIF_POS[idx]?.[1], width: GIF_POS[idx]?.[2] }"
        alt="" loading="lazy"
      />

      <!-- Desktop coda -->
      <div class="coda-overlay">
        <div class="coda-portrait"><img :src="'/naveen.jpeg'" alt="Naveen Jose" /></div>
        <p class="coda-name">Naveen Jose</p>
        <p class="coda-cred">CIDS Certified Instructional Design Specialist</p>
        <div class="coda-links">
          <a href="mailto:iamnaveenjose@outlook.com">iamnaveenjose@outlook.com</a>
          <a href="https://linkedin.com/in/entertrainer" target="_blank" rel="noopener">linkedin.com/in/entertrainer</a>
        </div>
        <a class="btn-cta" href="mailto:iamnaveenjose@outlook.com">Let's build something meaningful</a>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* ── Shared ── */
.about-root { width: 100%; background: var(--color-bg); }

.hl  { color: #6E92CE; font-weight: 700; }
[data-theme="light"] .hl { color: #243F6A; }

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

/* ══════════════════════════════════════════════════════════
   MOBILE
══════════════════════════════════════════════════════════ */
.mobile-root {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #0D0C0A;
  touch-action: none;
}
[data-theme="light"] .mobile-root { background: #F4F1EC; }

.m-scene {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 68px 28px 84px;
  gap: 0.48em;
  visibility: hidden;
}
.m-scene--center { align-items: center; text-align: center; }

.m-scene::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 55% at 80% 50%, rgba(110,146,206,0.1) 0%, transparent 100%);
  pointer-events: none;
}
[data-theme="light"] .m-scene::after {
  background: radial-gradient(ellipse 70% 55% at 80% 50%, rgba(36,63,106,0.06) 0%, transparent 100%);
}

.eyebrow {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.38;
  margin-bottom: 0.6em;
}

.mgif {
  width: clamp(72px, 26vw, 128px);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 32px rgba(0,0,0,0.48);
  align-self: flex-end;
  margin-bottom: 0.3em;
  display: block;
  opacity: 0;
}
.mgif--center { align-self: center; }
.mgif img { display: block; width: 100%; height: auto; }

.m-coda .coda-portrait {
  width: 120px; height: 120px;
  border-radius: 50%; overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  align-self: center;
  margin-bottom: 10px;
}
.m-coda .coda-portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }

.m-name {
  font-size: clamp(36px, 9vw, 56px);
  font-weight: 700; letter-spacing: -0.04em; line-height: 1.0;
  color: var(--color-text);
}
.m-name-sm {
  font-size: clamp(22px, 5.5vw, 32px);
  font-weight: 700; letter-spacing: -0.04em;
  color: var(--color-text);
}
.m-title {
  font-size: 13px; font-weight: 400; opacity: 0.42;
  letter-spacing: -0.01em; color: var(--color-text); margin-bottom: 0.3em;
}
.m-lg {
  font-size: clamp(22px, 6vw, 36px);
  font-weight: 650; letter-spacing: -0.035em; line-height: 1.12;
  color: var(--color-text);
}
.m-body {
  font-size: clamp(14px, 3.8vw, 18px);
  font-weight: 400; line-height: 1.6; letter-spacing: -0.02em;
  color: var(--color-text);
}
.m-deva {
  font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
  font-size: clamp(24px, 7vw, 44px);
  font-weight: 600; line-height: 1.4;
  color: var(--color-text);
}
.m-translit {
  font-style: italic; font-size: 13px; opacity: 0.4;
  letter-spacing: 0.02em; color: var(--color-text); margin-bottom: 0.4em;
}
.m-sig {
  font-size: 17px; font-weight: 600; opacity: 0.5;
  letter-spacing: -0.02em; color: var(--color-text); margin-top: 0.3em;
}
.m-cred { font-size: 11px; opacity: 0.38; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text); }
.m-links { display: flex; flex-direction: column; gap: 5px; align-items: center; margin-top: 14px; }
.m-links a { font-size: 14px; font-weight: 500; opacity: 0.55; color: var(--color-text); letter-spacing: -0.02em; }
.m-links a:active { opacity: 1; color: #6E92CE; }
.muted { opacity: 0.42 !important; }

.m-dots {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 20;
}
.m-dots span {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--color-text);
  opacity: 0.2;
  transition: opacity 0.3s, height 0.3s;
}
.m-dots span.active { opacity: 0.85; height: 12px; border-radius: 2px; }

.swipe-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.25;
  z-index: 20;
  animation: hintpulse 2s ease-in-out infinite;
}
@keyframes hintpulse {
  0%, 100% { opacity: 0.25; transform: translateX(-50%) translateY(0); }
  50% { opacity: 0.1; transform: translateX(-50%) translateY(4px); }
}

.btn-cta {
  display: inline-block;
  margin-top: 18px;
  padding: 12px 26px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 999px;
  font-size: 14px; font-weight: 500;
  color: var(--color-text);
  opacity: 0.75;
  transition: opacity 0.2s, border-color 0.2s;
  text-align: center;
}
.btn-cta:hover, .btn-cta:active { opacity: 1; border-color: #6E92CE; color: #6E92CE; }
[data-theme="light"] .btn-cta { border-color: rgba(0,0,0,0.15); }

/* ══════════════════════════════════════════════════════════
   DESKTOP
══════════════════════════════════════════════════════════ */
.about-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
}

.scroll-driver {
  height: 1300vh;
  width: 100%;
  pointer-events: none;
}

.st {
  position: fixed;
  left: clamp(20px, 4vw, 60px);
  top: 50%;
  transform: translateY(-50%);
  max-width: min(500px, 40vw);
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 0.36em;
}
.st--center {
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  align-items: center;
  max-width: min(560px, 52vw);
}

.st-name {
  font-size: clamp(42px, 6.2vw, 90px);
  font-weight: 700; letter-spacing: -0.04em; line-height: 1.0;
  color: var(--color-text);
}
.st-title { font-size: clamp(12px, 1.2vw, 16px); font-weight: 400; opacity: 0.42; color: var(--color-text); margin-bottom: 0.2em; }
.st-lg {
  font-size: clamp(24px, 3.6vw, 54px);
  font-weight: 650; letter-spacing: -0.035em; line-height: 1.1;
  color: var(--color-text);
}
.st-body { font-size: clamp(13px, 1.4vw, 19px); font-weight: 400; line-height: 1.55; letter-spacing: -0.02em; color: var(--color-text); }
.muted { opacity: 0.42 !important; }
.st-deva {
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: clamp(28px, 4.5vw, 70px);
  font-weight: 600; line-height: 1.4;
  color: var(--color-text);
}
.st-translit { font-style: italic; font-size: clamp(11px, 1.2vw, 17px); opacity: 0.4; letter-spacing: 0.02em; color: var(--color-text); }
.st-sig { font-size: clamp(15px, 1.8vw, 24px); font-weight: 600; opacity: 0.5; color: var(--color-text); }

.gif-overlay {
  position: fixed; z-index: 8; pointer-events: none;
  border-radius: 10px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.52), 0 3px 10px rgba(0,0,0,0.2);
  opacity: 0; transform-style: preserve-3d;
  will-change: transform, opacity;
  transform: scale(0.9);
}

.coda-overlay {
  position: fixed; inset: 0; z-index: 12;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; opacity: 0; pointer-events: none;
  padding: 80px 40px;
  background: rgba(13,12,10,0.72); backdrop-filter: blur(3px);
}
[data-theme="light"] .coda-overlay { background: rgba(244,241,236,0.8); }
.coda-portrait { width: 150px; height: 150px; border-radius: 50%; overflow: hidden; margin-bottom: 8px; }
.coda-portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.coda-name { font-size: clamp(22px, 2.8vw, 38px); font-weight: 700; letter-spacing: -0.04em; color: var(--color-text); }
.coda-cred { font-size: 11px; opacity: 0.38; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text); }
.coda-links { display: flex; flex-direction: column; align-items: center; gap: 5px; margin-top: 16px; }
.coda-links a { font-size: clamp(12px, 1.4vw, 17px); font-weight: 500; opacity: 0.55; letter-spacing: -0.02em; color: var(--color-text); transition: opacity 0.2s; }
.coda-links a:hover { opacity: 1; color: #6E92CE; }
</style>
