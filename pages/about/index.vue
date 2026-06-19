<script setup lang="ts">
import { animate, inView, stagger } from 'motion'

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

const EXPO:   [number, number, number, number] = [0.22, 1, 0.36, 1]
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ── Text helpers ───────────────────────────────────────────────────────
function splitChars(el: HTMLElement) {
  const chars: HTMLElement[] = []
  el.innerHTML = [...(el.textContent ?? '')].map((ch, i) =>
    ch === ' ' ? ' ' : `<span class="sc" style="--ci:${i}">${ch}</span>`
  ).join('')
  el.querySelectorAll<HTMLElement>('.sc').forEach(s => chars.push(s))
  return chars
}

function splitWords(el: HTMLElement) {
  const words: HTMLElement[] = []
  el.innerHTML = (el.textContent ?? '').split(' ').filter(Boolean)
    .map((w, i) => `<span class="sw" style="--wi:${i}">${w}</span>`).join(' ')
  el.querySelectorAll<HTMLElement>('.sw').forEach(s => words.push(s))
  return words
}

// ── Scroll-once helper for content sections ────────────────────────────
function once(target: Element, cb: () => void, margin = '0px 0px -80px 0px') {
  let stop: () => void
  stop = inView(target, () => { cb(); stop() }, { margin, amount: 0 } as any)
  cleanups.push(stop)
}
function onceEach(selector: string, cb: (el: HTMLElement) => void, margin = '0px 0px -80px 0px') {
  pageRef.value!.querySelectorAll<HTMLElement>(selector).forEach(el => once(el, () => cb(el), margin))
}

// ══════════════════════════════════════════════════════════════════════
// VERSE LINE ANIMATIONS — one unique reveal per line, tied to meaning
// ══════════════════════════════════════════════════════════════════════
function revealLine(idx: number) {
  const el = lineRefs.value[idx]
  if (!el) return
  el.style.opacity = '1' // unhide parent before animating children

  if (idx === 0) {
    // ── असतो मा सद्गमय  (Unreal → Real) ─────────────────────────────
    // The text swims in a deep blur — formless, uncertain, unreal.
    // Slowly, it sharpens into absolute clarity: truth resolving from fog.
    const hindi = el.querySelector<HTMLElement>('.vhindi')
    const eng   = el.querySelector<HTMLElement>('.veng')
    if (hindi) animate(hindi,
      { opacity: [0, 1], filter: ['blur(28px)', 'blur(0px)'] },
      { duration: 2.0, ease: SPRING }
    )
    if (eng) animate(eng,
      { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
      { duration: 0.9, delay: 1.6, ease: EXPO }
    )
    // Scroll cue appears after line settles
    const cue = scrollCueRef.value
    if (cue) animate(cue,
      { opacity: [0, 1] },
      { duration: 0.8, delay: 2.4, ease: EXPO }
    )
  }

  else if (idx === 1) {
    // ── तमसो मा ज्योतिर्गमय  (Darkness → Light) ──────────────────────
    // Each character ignites from left to right — a lamp being lit,
    // blazing bright for a moment, then settling into steady light.
    // The stage itself brightens as the verse fills with meaning.
    const hindi = el.querySelector<HTMLElement>('.vhindi')
    const eng   = el.querySelector<HTMLElement>('.veng')
    const cue   = scrollCueRef.value

    // Scroll cue fades before new line
    if (cue) animate(cue, { opacity: 0 }, { duration: 0.3, ease: EXPO })

    if (hindi) {
      const chars = splitChars(hindi)
      animate(chars,
        { opacity: [0, 1], filter: ['brightness(6)', 'brightness(1)'] },
        { duration: 0.8, delay: stagger(0.055), ease: EXPO }
      )
    }
    // Background brightens — a room being filled with light
    verseRootRef.value?.classList.add('verse-lit')
    if (eng) animate(eng,
      { opacity: [0, 1] },
      { duration: 0.8, delay: 1.0, ease: EXPO }
    )
  }

  else if (idx === 2) {
    // ── मृत्योर्माऽमृतं गमय  (Death → Immortality) ────────────────────
    // Characters scatter to chaos — dissolution, death, falling apart.
    // Then, pulled by an invisible force, they spring back to their place.
    // Order restored from entropy. Immortality is pattern that persists.
    const hindi = el.querySelector<HTMLElement>('.vhindi')
    const eng   = el.querySelector<HTMLElement>('.veng')
    if (hindi) {
      const chars  = splitChars(hindi)
      const spread = Math.min(window.innerWidth * 0.42, 280)

      // Scatter — death
      chars.forEach(c => {
        c.style.transform = `translate(${(Math.random() - 0.5) * spread * 2}px, ${(Math.random() - 0.5) * spread}px)`
        c.style.opacity = '0'
      })

      // Materialise at chaotic positions (scattered, ghostly)
      animate(chars,
        { opacity: [0, 0.55] },
        { duration: 0.55, delay: stagger(0.03), ease: EXPO }
      )

      // Reform — immortality springs back with precision
      const t = setTimeout(() => {
        chars.forEach((c, i) => {
          animate(c,
            { transform: 'translate(0px, 0px)', opacity: 1 },
            { duration: 1.15, delay: i * 0.022, ease: SPRING }
          )
        })
        if (eng) animate(eng,
          { opacity: [0, 1] },
          { duration: 0.9, delay: 0.6, ease: EXPO }
        )
      }, 700)
      cleanups.push(() => clearTimeout(t))
    }
  }

  else if (idx === 3) {
    // ── ॐ शान्तिः शान्तिः शान्तिः  (Peace) ───────────────────────────
    // The three lines that came before — striving, reaching, becoming —
    // they dim. Their purpose is complete.
    // OM appears oversized and slowly contracts to its rightful place.
    // PEACE unfolds three times, each breath slower than the last.
    // No movement. Just light. Just silence.
    lineRefs.value.slice(0, 3).forEach((prev, i) => {
      if (prev) animate(prev,
        { opacity: 0.14 },
        { duration: 2.2, delay: i * 0.1, ease: EXPO }
      )
    })

    const om     = el.querySelector<HTMLElement>('.om-glyph')
    const shanti = el.querySelector<HTMLElement>('.shanti-text')
    const eng    = el.querySelector<HTMLElement>('.veng')

    if (om) animate(om,
      { opacity: [0, 1], transform: ['scale(1.6)', 'scale(1)'] },
      { duration: 3.2, ease: [0.16, 1, 0.3, 1] }
    )
    if (shanti) animate(shanti,
      { opacity: [0, 1] },
      { duration: 4.5, delay: 0.9, ease: [0.16, 1, 0.3, 1] }
    )
    if (eng) animate(eng,
      { opacity: [0, 1] },
      { duration: 2.0, delay: 3.2, ease: EXPO }
    )
  }
}

// ── Scroll listener — triggers lines 1-3 ──────────────────────────────
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

  const pqEl       = page.querySelector<HTMLElement>('.prayer-quote')
  const ptEl       = page.querySelector<HTMLElement>('.prayer-trans')
  const clEl       = page.querySelector<HTMLElement>('.closing-line')
  const pqChars    = pqEl ? splitChars(pqEl) : []
  const ptWords    = ptEl ? splitWords(ptEl)  : []
  const clWords    = clEl ? splitWords(clEl)  : []
  const pcEls      = [...page.querySelectorAll<HTMLElement>('.prayer-context')]
  const momOpenEl  = page.querySelector<HTMLElement>('.mom-open')
  const momBodyEls = [...page.querySelectorAll<HTMLElement>('.mom-line:not(.mom-open)')]

  const heroEl = page.querySelector<HTMLElement>('.hero-section')
  if (heroEl) {
    once(heroEl, () => {
      if (pqChars.length)
        animate(pqChars,
          { opacity: [0, 1], transform: ['translateY(0.9em) skewX(-14deg)', 'translateY(0em) skewX(0deg)'] },
          { duration: 0.5, delay: stagger(0.028, { start: 0.1 }), ease: EXPO }
        )
      if (ptWords.length)
        animate(ptWords,
          { opacity: [0, 1], transform: ['translateY(18px)', 'translateY(0px)'] },
          { duration: 0.6, delay: stagger(0.07, { start: 0.55 }), ease: EXPO }
        )
      if (pcEls.length)
        animate(pcEls,
          { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
          { duration: 0.55, delay: stagger(0.14, { start: 0.9 }), ease: EXPO }
        )
      if (momOpenEl)
        animate(momOpenEl,
          { opacity: [0, 1], transform: ['translateY(32px)', 'translateY(0px)'] },
          { duration: 0.85, delay: 1.25, ease: SPRING }
        )
      if (momBodyEls.length)
        animate(momBodyEls,
          { opacity: [0, 1], transform: ['translateY(22px)', 'translateY(0px)'] },
          { duration: 0.7, delay: stagger(0.18, { start: 1.75 }), ease: EXPO }
        )
    }, '0px')
  }

  const portraitEl = page.querySelector<HTMLElement>('.portrait-wrap')
  if (portraitEl)
    once(portraitEl, () => {
      animate(portraitEl, { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: 1.1, ease: SPRING })
    }, '0px 0px -100px 0px')

  const identityEl = page.querySelector<HTMLElement>('.portrait-identity')
  if (identityEl)
    once(identityEl, () => {
      animate(identityEl,
        { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] },
        { duration: 0.65, delay: 0.25, ease: EXPO }
      )
    }, '0px 0px -40px 0px')

  onceEach('.section-label', el => {
    animate(el,
      { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
      { duration: 0.5, ease: EXPO }
    )
  }, '0px 0px -60px 0px')

  page.querySelectorAll<HTMLElement>('.section-body').forEach(body => {
    const paras = [...body.querySelectorAll<HTMLElement>('p')]
    if (paras.length)
      once(body, () => {
        animate(paras,
          { opacity: [0, 1], transform: ['translateY(22px)', 'translateY(0px)'] },
          { duration: 0.65, delay: stagger(0.1), ease: EXPO }
        )
      }, '0px 0px -60px 0px')
  })

  if (clEl && clWords.length)
    once(clEl, () => {
      animate(clWords,
        { opacity: [0, 1], transform: ['translateY(48px) skewY(5deg)', 'translateY(0px) skewY(0deg)'] },
        { duration: 0.75, delay: stagger(0.1), ease: SPRING }
      )
    }, '0px 0px -40px 0px')

  const timelineEl = page.querySelector<HTMLElement>('.timeline')
  if (timelineEl) {
    const items = [...timelineEl.querySelectorAll<HTMLElement>('.timeline-item')]
    once(timelineEl, () => {
      animate(items,
        { opacity: [0, 1], transform: ['translateX(-32px)', 'translateX(0px)'] },
        { duration: 0.6, delay: stagger(0.1), ease: EXPO }
      )
    }, '0px 0px -60px 0px')
  }

  onceEach('.contact-link', el => {
    animate(el,
      { opacity: [0, 1], transform: ['translateY(18px)', 'translateY(0px)'] },
      { duration: 0.6, ease: EXPO }
    )
  }, '0px 0px -40px 0px')
})

onUnmounted(() => {
  cleanups.forEach(fn => fn())
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
        <p class="veng">(Lead me from the unreal to the Real)</p>
      </div>

      <!-- Line 1: तमसो मा ज्योतिर्गमय — Darkness → Light -->
      <div class="verse-line" style="opacity:0" :ref="el => (lineRefs[1] = el as HTMLElement)">
        <p class="vhindi">तमसो मा ज्योतिर्गमय</p>
        <p class="veng">(Lead me from darkness to Light)</p>
      </div>

      <!-- Line 2: मृत्योर्माऽमृतं गमय — Death → Immortality -->
      <div class="verse-line" style="opacity:0" :ref="el => (lineRefs[2] = el as HTMLElement)">
        <p class="vhindi">मृत्योर्माऽमृतं गमय</p>
        <p class="veng">(Lead me from death to Immortality)</p>
      </div>

      <!-- Line 3: ॐ शान्तिः शान्तिः शान्तिः — Peace -->
      <div class="verse-line" style="opacity:0" :ref="el => (lineRefs[3] = el as HTMLElement)">
        <p class="vhindi">
          <span class="om-glyph">ॐ</span><span class="shanti-text"> शान्तिः शान्तिः शान्तिः</span>
        </p>
        <p class="veng">(Om. Peace. Peace. Peace.)</p>
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
        <p class="prayer-trans">Lead me from ignorance to light.</p>
        <div class="prayer-pause"></div>
        <p class="prayer-context">Somebody wrote that three thousand years ago.</p>
        <p class="prayer-context">It still describes everything I do.</p>
      </div>

      <div class="hero-mom">
        <p class="mom-line mom-open">My mother was a teacher.<br>I was her worst student.</p>
        <p class="mom-line">She marked my papers last — hoping the rest of the class would give her enough patience for mine.</p>
        <p class="mom-line">But what she accidentally gave me was worth more than any grade: I know exactly what it feels like when the explanation fails. I've sat in that room. I've been that student. The worst students always know where things broke down.</p>
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
        <p>Instead, I made a comic book.</p>
        <p><em>"The SEWA Chronicles"</em> turned service values into characters, scenes, and stakes. Not because I had a clever strategy. Because I refused to design something I'd have walked out of as a student.</p>
      </div>
    </section>

    <!-- PHILOSOPHY -->
    <section class="about-section">
      <p class="section-label">Philosophy</p>
      <div class="section-body">
        <p>You can start a fire with two rocks. You can also use a clipper lighter.</p>
        <p>We live in a world that invents better lighters every year. Yet somehow, training departments are still handing employees two rocks and calling it learning.</p>
        <p>Asatoma Sadgamaya isn't about discarding the lighter. It's about understanding the fire — what it is, what it needs, what happens when it goes out — so you can light it with whatever you have.</p>
        <p>That's what I design. Not content. Not courses. Learning that survives the moment the lighter isn't there.</p>
      </div>
      <p class="closing-line">Entertrainer isn't a typo. It's an argument.</p>
    </section>

    <!-- TIMELINE -->
    <section class="about-section">
      <p class="section-label">Timeline</p>
      <div class="timeline">
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

/* Subtle brightening when "Light" line appears */
[data-theme="dark"] .verse-stage.verse-lit {
  background: #111110;
}
[data-theme="light"] .verse-stage.verse-lit {
  background: #f8f5ef;
}

.verse-line {
  text-align: center;
  will-change: opacity;
}

.vhindi {
  font-family: 'Noto Sans Devanagari', 'Mangal', 'Aparajita', sans-serif;
  font-size: clamp(28rem, 3.8vw, 52rem);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  color: var(--color-text);
  margin-bottom: 10rem;
}

.veng {
  font-size: clamp(12rem, 1.3vw, 15rem);
  font-weight: 400;
  font-style: italic;
  letter-spacing: 0.04em;
  color: var(--color-text);
  opacity: 0.38;
}

/* OM glyph — appears larger, settles to normal */
.om-glyph {
  display: inline-block;
  font-size: 1.35em;
  will-change: transform, opacity;
}

.shanti-text {
  will-change: opacity;
}

/* Split char/word spans */
:deep(.sc),
:deep(.sw) {
  display: inline-block;
  will-change: opacity, transform, filter;
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
/* Only animate when visible */
.scroll-cue[style*="opacity: 1"] { animation-play-state: running; }

@keyframes cue-bob {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(6px); }
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
  opacity: 0.4;
}

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
}

.portrait-identity {
  display: flex;
  align-items: center;
  gap: 10rem;
  flex-wrap: wrap;
}

.identity-name {
  font-size: 15rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.identity-sep { opacity: 0.25; font-size: 13rem; }

.identity-cred {
  font-size: 13rem;
  font-weight: 400;
  opacity: 0.4;
  letter-spacing: -0.01em;
}

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

.section-body {
  display: flex;
  flex-direction: column;
  gap: 22rem;
}

.section-body p {
  font-size: clamp(16rem, 1.8vw, 19rem);
  font-weight: 400;
  line-height: 1.8;
  opacity: 0.75;
}

.section-body em {
  font-style: italic;
  opacity: 1;
  color: var(--color-text);
}

.closing-line {
  margin-top: 52rem;
  font-size: clamp(28rem, 4vw, 48rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.1;
  font-style: italic;
}

/* ── Timeline ── */
.timeline { display: flex; flex-direction: column; }

.timeline-item {
  display: grid;
  grid-template-columns: 130rem 1fr;
  gap: 0 28rem;
  padding: 24rem 0;
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

.t-content { display: flex; flex-direction: column; gap: 4rem; }

.t-content strong {
  font-size: 16rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

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
  transition: opacity 0.2s ease;
}

.contact-link:hover { opacity: 1; }

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
