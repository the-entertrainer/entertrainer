<script setup lang="ts">
import { animate, inView, stagger } from 'motion'
import gsap from 'gsap'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap'
    }
  ]
})

const pageRef      = ref<HTMLElement | null>(null)
const verseRootRef = ref<HTMLElement | null>(null)
const scrollCueRef = ref<HTMLElement | null>(null)
const lineRefs     = ref<(HTMLElement | null)[]>([null, null, null, null])
const cleanups: Array<() => void> = []

const EXPO:   [number, number, number, number] = [0.16, 1, 0.3, 1]
const SPRING: [number, number, number, number] = [0.34, 1.2, 0.4, 1]

// ── Word masking ───────────────────────────────────────────────────────
// CRITICAL: Devanagari is a complex script — its vowel signs (मात्रा) and
// conjuncts (e.g. द्ग, ्य) are shaped together by the text engine. Splitting it
// per code-point into inline-block spans shatters that shaping (the old bug).
// So we only ever split on WORD boundaries, which keeps every grapheme cluster
// intact inside its span. The splitter also preserves inline children such as
// <span class="hl"> so accent highlights survive the rewrite.
function maskWords(el: HTMLElement): HTMLElement[] {
  const fills: HTMLElement[] = []
  const frag  = document.createDocumentFragment()

  const wrap = (html: string, extraClass = '') => {
    const mask = document.createElement('span')
    mask.className = 'wmask'
    const fill = document.createElement('span')
    fill.className = ('wfill ' + extraClass).trim()
    fill.innerHTML = html
    mask.appendChild(fill)
    frag.appendChild(mask)
    fills.push(fill)
  }

  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      ;(node.textContent ?? '').split(/(\s+)/).forEach((part) => {
        if (part === '') return
        if (part.trim() === '') frag.appendChild(document.createTextNode(part))
        else wrap(part)
      })
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const en = node as HTMLElement
      wrap(en.innerHTML, en.className) // e.g. keep the .hl class on the fill
    }
  })

  el.innerHTML = ''
  el.appendChild(frag)
  // Pre-hide so there is never a flash before the reveal fires.
  fills.forEach((f) => {
    f.style.opacity = '0'
    f.style.transform = 'translateY(130%)'
  })
  return fills
}

// Words rise out of their mask, de-blurring as they settle. The signature
// modern reveal used across the whole page.
function rise(
  fills: HTMLElement[],
  { d = 0.85, st = 0.05, start = 0, ease = EXPO, blur = true } = {}
) {
  if (!fills.length) return
  animate(
    fills,
    {
      y: ['130%', '0%'],
      opacity: [0, 1],
      ...(blur ? { filter: ['blur(7px)', 'blur(0px)'] } : {})
    },
    { duration: d, delay: stagger(st, { start }), ease }
  )
}

// Whole-block reveal — used for long body copy where per-word would be noisy.
// Preserves inline highlight spans.
function blockRise(el: HTMLElement, { d = 0.9, delay = 0, ease = EXPO } = {}) {
  el.style.opacity = '0'
  animate(
    el,
    { opacity: [0, 1], y: [26, 0], filter: ['blur(7px)', 'blur(0px)'] },
    { duration: d, delay, ease }
  )
}

// A luminous accent beam sweeping across a line — built on the fly, removed
// after it passes. Used for the Light + Immortality transformations.
function sweepBeam(host: HTMLElement, delay = 0.15) {
  const beam = document.createElement('span')
  beam.className = 'vbeam'
  host.appendChild(beam)
  animate(beam, { x: ['-120%', '380%'], opacity: [0, 1, 0] }, { duration: 1.25, delay, ease: EXPO })
  const t = setTimeout(() => beam.remove(), 1800)
  cleanups.push(() => { clearTimeout(t); beam.remove() })
}

// ── Scroll-once helper for content sections ────────────────────────────
function once(target: Element, cb: () => void, margin = '0px 0px -80px 0px') {
  let stop: () => void
  stop = inView(target, () => { cb(); stop() }, { margin } as any)
  cleanups.push(stop)
}
function onceEach(selector: string, cb: (el: HTMLElement) => void, margin = '0px 0px -80px 0px') {
  pageRef.value!.querySelectorAll<HTMLElement>(selector).forEach((el) => once(el, () => cb(el), margin))
}

// ══════════════════════════════════════════════════════════════════════
// VERSE LINE ANIMATIONS — one unique, meaning-tied reveal per line.
// Modern, bold, minimal: mask-rise + light beams + a peace ripple. No
// per-character flicker, no PowerPoint scatter.
// ══════════════════════════════════════════════════════════════════════
function revealLine(idx: number) {
  const el = lineRefs.value[idx]
  if (!el) return
  el.style.opacity = '1' // unhide parent before animating children

  const hindi = el.querySelector<HTMLElement>('.vhindi')
  const eng   = el.querySelector<HTMLElement>('.veng')
  const cue   = scrollCueRef.value

  if (idx === 0) {
    // असतो मा सद्गमय (Unreal → Real)
    // Formless words rise out of a deep blur and resolve into clarity:
    // truth emerging from the unreal.
    if (hindi) rise(maskWords(hindi), { d: 1.5, st: 0.16, ease: SPRING })
    if (eng)   blockRise(eng, { d: 0.9, delay: 1.4 })
    if (cue)   animate(cue, { opacity: [0, 1] }, { duration: 0.8, delay: 2.4, ease: EXPO })
  }

  else if (idx === 1) {
    // तमसो मा ज्योतिर्गमय (Darkness → Light)
    // Words emerge OUT of darkness — born dim, then lit — while a luminous
    // accent beam sweeps the line and the whole stage brightens.
    if (cue) animate(cue, { opacity: 0 }, { duration: 0.3, ease: EXPO })
    if (hindi) {
      const fills = maskWords(hindi)
      animate(
        fills,
        { y: ['130%', '0%'], opacity: [0, 1], filter: ['brightness(0.15)', 'brightness(1)'] },
        { duration: 1.3, delay: stagger(0.13), ease: EXPO }
      )
      sweepBeam(el, 0.45)
    }
    verseRootRef.value?.classList.add('verse-lit')
    if (eng) blockRise(eng, { d: 0.9, delay: 1.1 })
  }

  else if (idx === 2) {
    // मृत्योर्माऽमृतं गमय (Death → Immortality)
    // The line is reborn: words rise and spring into being, larger-than-life,
    // and an accent beam passes like a charge of life through them.
    if (hindi) {
      const fills = maskWords(hindi)
      animate(
        fills,
        { y: ['140%', '0%'], opacity: [0, 1], scale: [0.86, 1] },
        { duration: 1.4, delay: stagger(0.12), ease: SPRING }
      )
      sweepBeam(el, 0.6)
    }
    if (eng) blockRise(eng, { d: 0.9, delay: 1.1 })
  }

  else if (idx === 3) {
    // ॐ शान्तिः शान्तिः शान्तिः (Peace)
    // The striving lines settle to rest. ॐ contracts from oversized to its
    // rightful size while concentric ripples of peace pulse outward, three
    // times — one for each shanti.
    lineRefs.value.slice(0, 3).forEach((prev, i) => {
      if (prev) animate(prev, { opacity: 0.12 }, { duration: 2.2, delay: i * 0.1, ease: EXPO })
    })

    const om     = el.querySelector<HTMLElement>('.om-glyph')
    const shanti = el.querySelector<HTMLElement>('.shanti-text')
    const rings  = el.querySelectorAll<HTMLElement>('.om-rings i')

    if (om) animate(om, { opacity: [0, 1], scale: [1.7, 1] }, { duration: 2.8, ease: SPRING })
    if (shanti) rise(maskWords(shanti), { d: 1.6, st: 0.22, start: 0.7, ease: EXPO, blur: false })
    if (eng) blockRise(eng, { d: 2.0, delay: 2.4 })

    // GSAP drives the looping ripple — a different engine for a continuous,
    // breath-paced pulse layered under the Motion One reveals.
    if (rings.length) {
      gsap.set(rings, { scale: 0, opacity: 0 })
      const tl = gsap.timeline({ delay: 0.4, repeat: 1, repeatDelay: 0.7 })
      rings.forEach((r, i) =>
        tl.fromTo(
          r,
          { scale: 0, opacity: 0.45 },
          { scale: 3.4, opacity: 0, duration: 2.6, ease: 'power2.out' },
          i * 0.55
        )
      )
      cleanups.push(() => tl.kill())
    }
  }
}

// ── Scroll listener — triggers lines 1-3 by viewport depth ─────────────
let lastRevealedLine = -1

function onScroll() {
  const root = verseRootRef.value
  if (!root) return
  const scrolled = Math.max(0, -root.getBoundingClientRect().top)
  const vh = window.innerHeight
  if (scrolled >= vh * 1 && lastRevealedLine < 1) { revealLine(1); lastRevealedLine = 1 }
  if (scrolled >= vh * 2 && lastRevealedLine < 2) { revealLine(2); lastRevealedLine = 2 }
  if (scrolled >= vh * 3 && lastRevealedLine < 3) { revealLine(3); lastRevealedLine = 3 }
}

onMounted(() => {
  // Line 0 fires on load
  const t0 = setTimeout(() => { revealLine(0); lastRevealedLine = 0 }, 500)
  cleanups.push(() => clearTimeout(t0))

  window.addEventListener('scroll', onScroll, { passive: true })
  cleanups.push(() => window.removeEventListener('scroll', onScroll))

  // ── Content section animations ───────────────────────────────────────
  const page = pageRef.value
  if (!page) return

  // Pre-split the big display lines so they're hidden from first paint.
  const pqEl = page.querySelector<HTMLElement>('.prayer-quote')
  const ptEl = page.querySelector<HTMLElement>('.prayer-trans')
  const moEl = page.querySelector<HTMLElement>('.mom-open')
  const clEl = page.querySelector<HTMLElement>('.closing-line')
  const pqFills = pqEl ? maskWords(pqEl) : []
  const ptFills = ptEl ? maskWords(ptEl) : []
  const moFills = moEl ? maskWords(moEl) : []
  const clFills = clEl ? maskWords(clEl) : []

  const pcEls      = [...page.querySelectorAll<HTMLElement>('.prayer-context')]
  const momBodyEls = [...page.querySelectorAll<HTMLElement>('.mom-line:not(.mom-open)')]
  pcEls.forEach((e) => (e.style.opacity = '0'))
  momBodyEls.forEach((e) => (e.style.opacity = '0'))

  const heroEl = page.querySelector<HTMLElement>('.hero-section')
  if (heroEl) {
    once(heroEl, () => {
      rise(pqFills, { d: 1.0, st: 0.06, start: 0.1, ease: SPRING })
      rise(ptFills, { d: 0.7, st: 0.05, start: 0.55 })
      pcEls.forEach((e, i) => blockRise(e, { d: 0.6, delay: 0.95 + i * 0.14 }))
      rise(moFills, { d: 0.9, st: 0.05, start: 1.35, ease: SPRING })
      momBodyEls.forEach((e, i) => blockRise(e, { d: 0.75, delay: 1.85 + i * 0.18 }))
    }, '0px')
  }

  // Portrait — clip reveal, then a continuous GSAP parallax tied to scroll
  // (a second engine layered over the Motion One entrance).
  const portraitEl  = page.querySelector<HTMLElement>('.portrait-wrap')
  const portraitImg = page.querySelector<HTMLElement>('.portrait-img')
  if (portraitEl)
    once(portraitEl, () => {
      animate(portraitEl, { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: 1.1, ease: SPRING })
    }, '0px 0px -100px 0px')

  if (portraitEl && portraitImg) {
    const setY = gsap.quickTo(portraitImg, 'yPercent', { duration: 0.6, ease: 'power3' })
    const onParallax = () => {
      const r = portraitEl.getBoundingClientRect()
      const prog = (window.innerHeight - r.top) / (window.innerHeight + r.height)
      setY((Math.min(1, Math.max(0, prog)) - 0.5) * -10)
    }
    onParallax()
    window.addEventListener('scroll', onParallax, { passive: true })
    cleanups.push(() => window.removeEventListener('scroll', onParallax))
  }

  const identityEl = page.querySelector<HTMLElement>('.portrait-identity')
  if (identityEl) {
    identityEl.style.opacity = '0'
    once(identityEl, () => blockRise(identityEl, { d: 0.65, delay: 0.25 }), '0px 0px -40px 0px')
  }

  onceEach('.section-label', (el) => rise(maskWords(el), { d: 0.6, st: 0.025, blur: false }), '0px 0px -60px 0px')

  page.querySelectorAll<HTMLElement>('.section-body').forEach((body) => {
    const paras = [...body.querySelectorAll<HTMLElement>('p')]
    paras.forEach((p) => (p.style.opacity = '0'))
    if (paras.length)
      once(body, () => paras.forEach((p, i) => blockRise(p, { d: 0.8, delay: i * 0.12 })), '0px 0px -60px 0px')
  })

  if (clEl && clFills.length)
    once(clEl, () => rise(clFills, { d: 1.0, st: 0.06, ease: SPRING }), '0px 0px -40px 0px')

  const timelineEl = page.querySelector<HTMLElement>('.timeline')
  if (timelineEl) {
    const items = [...timelineEl.querySelectorAll<HTMLElement>('.timeline-item')]
    const tline = timelineEl.querySelector<HTMLElement>('.t-axis')
    items.forEach((i) => (i.style.opacity = '0'))
    once(timelineEl, () => {
      if (tline) animate(tline, { scaleY: [0, 1] }, { duration: 1.1, ease: EXPO })
      animate(items, { opacity: [0, 1], x: [-28, 0] }, { duration: 0.6, delay: stagger(0.1, { start: 0.15 }), ease: EXPO })
    }, '0px 0px -60px 0px')
  }

  onceEach('.contact-link', (el) => rise(maskWords(el), { d: 0.7, st: 0.03 }), '0px 0px -40px 0px')
})

onUnmounted(() => {
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
})
</script>

<template>

  <!-- ═══ VERSE INTRO ════════════════════════════════════════════════════ -->
  <div class="verse-root" ref="verseRootRef">
    <div class="verse-stage">

      <!-- Line 0: असतो मा सद्गमय — Unreal → Real -->
      <div class="verse-line" style="opacity:0" :ref="el => (lineRefs[0] = el as HTMLElement)">
        <p class="vhindi">असतो मा सद्गमय</p>
        <p class="veng">Lead me from the unreal to the <span class="hl">Real</span></p>
      </div>

      <!-- Line 1: तमसो मा ज्योतिर्गमय — Darkness → Light -->
      <div class="verse-line" style="opacity:0" :ref="el => (lineRefs[1] = el as HTMLElement)">
        <p class="vhindi">तमसो मा ज्योतिर्गमय</p>
        <p class="veng">Lead me from darkness to <span class="hl">Light</span></p>
      </div>

      <!-- Line 2: मृत्योर्माऽमृतं गमय — Death → Immortality -->
      <div class="verse-line" style="opacity:0" :ref="el => (lineRefs[2] = el as HTMLElement)">
        <p class="vhindi">मृत्योर्माऽमृतं गमय</p>
        <p class="veng">Lead me from death to <span class="hl">Immortality</span></p>
      </div>

      <!-- Line 3: ॐ शान्तिः शान्तिः शान्तिः — Peace -->
      <div class="verse-line verse-peace" style="opacity:0" :ref="el => (lineRefs[3] = el as HTMLElement)">
        <span class="om-rings"><i></i><i></i><i></i></span>
        <p class="vhindi">
          <span class="om-glyph">ॐ</span><span class="shanti-text"> शान्तिः शान्तिः शान्तिः</span>
        </p>
        <p class="veng">Om. <span class="hl">Peace. Peace. Peace.</span></p>
      </div>

      <!-- Scroll hint — appears after line 0 settles -->
      <p class="scroll-cue" ref="scrollCueRef" style="opacity:0">scroll ↓</p>

    </div>
  </div>

  <!-- ═══ ABOUT CONTENT ══════════════════════════════════════════════════ -->
  <div ref="pageRef" class="about-page">

    <!-- HERO -->
    <section class="hero-section">
      <div class="hero-prayer">
        <p class="prayer-quote">"Asatoma Sadgamaya."</p>
        <p class="prayer-trans">Lead me from ignorance to <span class="hl">light</span>.</p>
        <div class="prayer-pause"></div>
        <p class="prayer-context">Somebody wrote that three thousand years ago.</p>
        <p class="prayer-context">It still describes everything I do.</p>
      </div>

      <div class="hero-mom">
        <p class="mom-line mom-open">My mother was a teacher.<br>I was her <span class="hl">worst student</span>.</p>
        <p class="mom-line">She marked my papers last — hoping the rest of the class would give her enough patience for mine.</p>
        <p class="mom-line">But what she accidentally gave me was worth more than any grade: I know exactly what it feels like <span class="hl">when the explanation fails</span>. I've sat in that room. I've been that student. The worst students always know where things broke down.</p>
      </div>

      <div class="portrait-wrap">
        <img src="/naveen.jpeg" alt="Naveen Jose" class="portrait-img" />
      </div>
      <div class="portrait-identity">
        <span class="identity-name">Naveen Jose</span>
        <span class="identity-sep">·</span>
        <span class="identity-cred">CIDS Certified Instructional Designer</span>
      </div>
    </section>

    <!-- ORIGIN -->
    <section class="about-section">
      <p class="section-label">Origin</p>
      <div class="section-body">
        <p>At Mahindra Holidays, I was handed a standard brief: compliance training. Slide decks. Sign-off sheets. The usual.</p>
        <p>Instead, I made a <span class="hl">comic book</span>.</p>
        <p><em>"The SEWA Chronicles"</em> turned service values into characters, scenes, and stakes. Not because I had a clever strategy. Because I refused to design something I'd have walked out of as a student.</p>
      </div>
    </section>

    <!-- PHILOSOPHY -->
    <section class="about-section">
      <p class="section-label">Philosophy</p>
      <div class="section-body">
        <p>You can start a <span class="hl">fire</span> with two rocks. You can also use a clipper lighter.</p>
        <p>We live in a world that invents better lighters every year. Yet somehow, training departments are still handing employees two rocks and calling it learning.</p>
        <p>Asatoma Sadgamaya isn't about discarding the lighter. It's about understanding the fire — what it is, what it needs, what happens when it goes out — so you can light it with whatever you have.</p>
        <p>That's what I design. Not content. Not courses. Learning that survives the moment the lighter isn't there.</p>
      </div>
      <p class="closing-line">Entertrainer isn't a typo. It's an <span class="hl">argument</span>.</p>
    </section>

    <!-- TIMELINE -->
    <section class="about-section">
      <p class="section-label">Timeline</p>
      <div class="timeline">
        <span class="t-axis"></span>
        <div class="timeline-item">
          <span class="t-period">2026 – Now</span>
          <div class="t-content">
            <strong>Asst Manager, Training &amp; Quality</strong>
            <span class="t-company">Concentrix</span>
            <em class="t-context">Scaling what works. Unlearning what doesn't.</em>
          </div>
        </div>
        <div class="timeline-item">
          <span class="t-period">2024 – 2026</span>
          <div class="t-content">
            <strong>Asst Manager, L&amp;D</strong>
            <span class="t-company">Courtyard by Marriott</span>
            <em class="t-context">Where hospitality became the classroom.</em>
          </div>
        </div>
        <div class="timeline-item">
          <span class="t-period">2022 – 2024</span>
          <div class="t-content">
            <strong>CMET, L&amp;D</strong>
            <span class="t-company">Mahindra Holidays</span>
            <em class="t-context">The SEWA Chronicles. Comics as compliance.</em>
          </div>
        </div>
        <div class="timeline-item">
          <span class="t-period">Foundation</span>
          <div class="t-content">
            <strong>BSc Hotel Management</strong>
            <span class="t-company">IHM Chennai</span>
            <em class="t-context">Learned service before I could design for it.</em>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="about-section about-contact">
      <p class="section-label">Say hello.</p>
      <div class="contact-links">
        <a href="mailto:iamnaveenjose@outlook.com" class="contact-link">iamnaveenjose@outlook.com</a>
        <a href="https://linkedin.com/in/entertrainer" target="_blank" rel="noopener noreferrer" class="contact-link">linkedin.com/in/entertrainer</a>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* Accent "pi" highlight — the brand navy reads too dark on the dark canvas,
   so dark theme uses a luminous lift of it; light theme uses the true brand. */
.verse-root,
.about-page {
  --hl: #6E92CE;
}
[data-theme="light"] .verse-root,
[data-theme="light"] .about-page {
  --hl: #243F6A;
}

.hl {
  color: var(--hl);
  font-weight: 600;
  font-style: inherit;
}

/* Word-mask reveal scaffolding. Padding+negative-margin gives Devanagari
   matras vertical room so the mask never clips them. */
:deep(.wmask) {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding: 0.16em 0.07em;
  margin: -0.16em -0.07em;
}
:deep(.wfill) {
  display: inline-block;
  will-change: transform, opacity, filter;
}

/* ══════════════════════════════════════════════════════════════════════
   VERSE INTRO
══════════════════════════════════════════════════════════════════════ */
.verse-root {
  height: 500vh;
  background: var(--color-bg);
}

.verse-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40rem;
  padding: 60rem 40rem;
  background: var(--color-bg);
  overflow: hidden;
  transition: background 3s ease;
}

[data-theme="dark"] .verse-stage.verse-lit { background: #14130F; }
[data-theme="light"] .verse-stage.verse-lit { background: #FBF8F2; }

.verse-line {
  position: relative;
  text-align: center;
  will-change: opacity;
}

.vhindi {
  position: relative;
  z-index: 1;
  font-family: 'Noto Sans Devanagari', 'Mangal', 'Aparajita', sans-serif;
  font-size: clamp(30rem, 4vw, 56rem);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.4;
  color: var(--color-text);
  margin-bottom: 12rem;
}

.veng {
  font-size: clamp(12rem, 1.3vw, 15rem);
  font-weight: 400;
  font-style: italic;
  letter-spacing: 0.04em;
  color: var(--color-text);
  opacity: 0.4;
}
.veng .hl { opacity: 1; font-style: normal; letter-spacing: 0.06em; }

/* Sweeping accent light beam */
:deep(.vbeam) {
  position: absolute;
  top: -20%;
  left: 0;
  width: 26%;
  height: 140%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--hl), transparent);
  filter: blur(20px);
  opacity: 0;
  mix-blend-mode: screen;
  z-index: 0;
}

/* OM peace ripples */
.verse-peace { isolation: isolate; }
.om-rings {
  position: absolute;
  top: 38%;
  left: 50%;
  width: 80rem;
  height: 80rem;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
}
.om-rings i {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5rem solid var(--hl);
}

.om-glyph {
  display: inline-block;
  font-size: 1.4em;
  will-change: transform, opacity;
}

/* Scroll hint */
.scroll-cue {
  position: absolute;
  bottom: 40rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0;
  animation: cue-bob 2.4s ease-in-out infinite;
  animation-play-state: paused;
}
.scroll-cue[style*="opacity: 1"] { animation-play-state: running; }

@keyframes cue-bob {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(6px); }
}

/* ══════════════════════════════════════════════════════════════════════
   ABOUT PAGE CONTENT
══════════════════════════════════════════════════════════════════════ */
.about-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--main-font);
  padding: calc(var(--safe-top) + 120rem) var(--grid-margin) calc(var(--safe-bottom) + 120rem);
  max-width: 800rem;
}

/* ── Hero ── */
.hero-section { margin-bottom: 100rem; }

.hero-prayer { margin-bottom: 80rem; }

.prayer-quote {
  font-size: clamp(44rem, 6vw, 80rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
  font-style: italic;
  margin-bottom: 14rem;
}

.prayer-trans {
  font-size: clamp(17rem, 2vw, 22rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.5;
  opacity: 0.55;
}
.prayer-trans .hl { opacity: 1; }

.prayer-pause { height: 44rem; }

.prayer-context {
  font-size: clamp(15rem, 1.6vw, 17rem);
  font-weight: 400;
  line-height: 1.7;
  opacity: 0.45;
  margin-top: 6rem;
}

.hero-mom {
  display: flex;
  flex-direction: column;
  gap: 24rem;
  margin-bottom: 72rem;
}

.mom-open {
  font-size: clamp(30rem, 4.5vw, 56rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.mom-line {
  font-size: clamp(16rem, 1.8vw, 19rem);
  font-weight: 400;
  line-height: 1.8;
  opacity: 0.7;
}
.mom-line.mom-open { opacity: 1; }

/* Portrait */
.portrait-wrap {
  width: 100%;
  max-width: 500rem;
  aspect-ratio: 4 / 3;
  border-radius: 16rem;
  overflow: hidden;
  margin-bottom: 20rem;
}

.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
  transform: scale(1.12); /* headroom for the scroll parallax */
  will-change: transform;
}

.portrait-identity {
  display: flex;
  align-items: center;
  gap: 10rem;
  flex-wrap: wrap;
}

.identity-name { font-size: 15rem; font-weight: 600; letter-spacing: -0.02em; }
.identity-sep  { opacity: 0.25; font-size: 13rem; }
.identity-cred { font-size: 13rem; font-weight: 400; opacity: 0.4; letter-spacing: -0.01em; }

/* ── Sections ── */
.about-section {
  border-top: 1px solid var(--color-divider);
  padding-top: 64rem;
  margin-bottom: 64rem;
}

.section-label {
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.28;
  margin-bottom: 32rem;
}

.section-body { display: flex; flex-direction: column; gap: 22rem; }

.section-body p {
  font-size: clamp(16rem, 1.8vw, 19rem);
  font-weight: 400;
  line-height: 1.8;
  opacity: 0.75;
}
.section-body em { font-style: italic; opacity: 1; color: var(--color-text); }
.section-body .hl { opacity: 1; }

.closing-line {
  margin-top: 52rem;
  font-size: clamp(28rem, 4vw, 48rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.1;
  font-style: italic;
}

/* ── Timeline ── */
.timeline { position: relative; display: flex; flex-direction: column; }

.t-axis {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: var(--hl);
  opacity: 0.4;
  transform: scaleY(0);
  transform-origin: top;
}

.timeline-item {
  display: grid;
  grid-template-columns: 130rem 1fr;
  gap: 0 28rem;
  padding: 24rem 0 24rem 22rem;
  border-bottom: 1px solid var(--color-divider);
}
.timeline-item:last-child { border-bottom: none; }

.t-period {
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-accent);
  padding-top: 3rem;
  line-height: 1.4;
}
[data-theme="dark"] .t-period { color: var(--hl); }

.t-content { display: flex; flex-direction: column; gap: 4rem; }
.t-content strong { font-size: 16rem; font-weight: 600; letter-spacing: -0.02em; }
.t-company { font-size: 13rem; opacity: 0.35; }
.t-context { font-size: 13rem; font-style: italic; opacity: 0.5; margin-top: 2rem; }

/* ── Contact ── */
.contact-links { display: flex; flex-direction: column; gap: 14rem; }

.contact-link {
  font-size: clamp(18rem, 2.2vw, 26rem);
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  letter-spacing: -0.02em;
  opacity: 0.6;
  transition: opacity 0.2s ease, color 0.2s ease;
}
.contact-link:hover { opacity: 1; color: var(--hl); }

/* ── Mobile ── */
@media (max-width: 640px) {
  .about-page { max-width: 100%; }
  .verse-stage { gap: 28rem; padding: 48rem 24rem; }
  .hero-prayer { margin-bottom: 56rem; }
  .hero-mom { margin-bottom: 52rem; }
  .portrait-wrap { max-width: 100%; border-radius: 12rem; }
  .timeline-item { grid-template-columns: 1fr; gap: 4rem 0; }
}
</style>
