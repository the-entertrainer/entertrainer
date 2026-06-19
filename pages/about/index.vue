<script setup lang="ts">
import { animate, inView, stagger } from 'motion'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const pageRef = ref<HTMLElement | null>(null)
const cleanups: Array<() => void> = []

// ── Text-splitting helpers ──────────────────────────────────────────────
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

// ── Fire once on viewport entry ─────────────────────────────────────────
function once(target: Element, cb: () => void, margin = '0px 0px -80px 0px') {
  let stop: () => void
  stop = inView(target, () => { cb(); stop() }, { margin, amount: 0 } as any)
  cleanups.push(stop)
}

function onceEach(selector: string, cb: (el: HTMLElement) => void, margin = '0px 0px -80px 0px') {
  pageRef.value!.querySelectorAll<HTMLElement>(selector)
    .forEach(el => once(el, () => cb(el), margin))
}

// ── Easing curves ───────────────────────────────────────────────────────
const EXPO: [number, number, number, number]   = [0.22, 1, 0.36, 1]
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1]

onMounted(() => {
  const page = pageRef.value!

  // ── Split key headline elements ─────────────────────────────────────
  const pqEl = page.querySelector<HTMLElement>('.prayer-quote')
  const ptEl = page.querySelector<HTMLElement>('.prayer-trans')
  const clEl = page.querySelector<HTMLElement>('.closing-line')

  const pqChars    = pqEl ? splitChars(pqEl) : []
  const ptWords    = ptEl ? splitWords(ptEl)  : []
  const clWords    = clEl ? splitWords(clEl)  : []
  const pcEls      = [...page.querySelectorAll<HTMLElement>('.prayer-context')]
  const momOpenEl  = page.querySelector<HTMLElement>('.mom-open')
  const momBodyEls = [...page.querySelectorAll<HTMLElement>('.mom-line:not(.mom-open)')]

  // ── HERO: entire cascade fires as hero enters viewport ──────────────
  const heroEl = page.querySelector<HTMLElement>('.hero-section')
  if (heroEl) {
    once(heroEl, () => {
      // 1. Prayer quote — char by char with lateral skew
      if (pqChars.length)
        animate(pqChars,
          { opacity: [0, 1], transform: ['translateY(0.9em) skewX(-14deg)', 'translateY(0em) skewX(0deg)'] },
          { duration: 0.5, delay: stagger(0.028, { start: 0.1 }), ease: EXPO }
        )
      // 2. Prayer translation — word cascade
      if (ptWords.length)
        animate(ptWords,
          { opacity: [0, 1], transform: ['translateY(18px)', 'translateY(0px)'] },
          { duration: 0.6, delay: stagger(0.07, { start: 0.55 }), ease: EXPO }
        )
      // 3. Prayer context lines
      if (pcEls.length)
        animate(pcEls,
          { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
          { duration: 0.55, delay: stagger(0.14, { start: 0.9 }), ease: EXPO }
        )
      // 4. Mom opening — large bold rise
      if (momOpenEl)
        animate(momOpenEl,
          { opacity: [0, 1], transform: ['translateY(32px)', 'translateY(0px)'] },
          { duration: 0.85, delay: 1.25, ease: SPRING }
        )
      // 5. Mom body paragraphs
      if (momBodyEls.length)
        animate(momBodyEls,
          { opacity: [0, 1], transform: ['translateY(22px)', 'translateY(0px)'] },
          { duration: 0.7, delay: stagger(0.18, { start: 1.75 }), ease: EXPO }
        )
    }, '0px')
  }

  // ── Portrait — curtain clip-path reveal ─────────────────────────────
  const portraitEl = page.querySelector<HTMLElement>('.portrait-wrap')
  if (portraitEl)
    once(portraitEl, () => {
      animate(portraitEl,
        { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] },
        { duration: 1.1, ease: SPRING }
      )
    }, '0px 0px -100px 0px')

  // ── Portrait identity ────────────────────────────────────────────────
  const identityEl = page.querySelector<HTMLElement>('.portrait-identity')
  if (identityEl)
    once(identityEl, () => {
      animate(identityEl,
        { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] },
        { duration: 0.65, delay: 0.25, ease: EXPO }
      )
    }, '0px 0px -40px 0px')

  // ── Section labels ───────────────────────────────────────────────────
  onceEach('.section-label', el => {
    animate(el,
      { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
      { duration: 0.5, ease: EXPO }
    )
  }, '0px 0px -60px 0px')

  // ── Section body paragraphs (stagger per section) ───────────────────
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

  // ── Closing line — word-by-word with skew (most dramatic) ───────────
  if (clEl && clWords.length)
    once(clEl, () => {
      animate(clWords,
        { opacity: [0, 1], transform: ['translateY(48px) skewY(5deg)', 'translateY(0px) skewY(0deg)'] },
        { duration: 0.75, delay: stagger(0.1), ease: SPRING }
      )
    }, '0px 0px -40px 0px')

  // ── Timeline — slide from left ────────────────────────────────────────
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

  // ── Contact links ────────────────────────────────────────────────────
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
        <a
          href="https://linkedin.com/in/entertrainer"
          target="_blank"
          rel="noopener noreferrer"
          class="contact-link"
        >linkedin.com/in/entertrainer</a>
      </div>
    </section>

  </div>
</template>

<style scoped>
.about-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--main-font);
  padding: calc(var(--safe-top) + 120rem) var(--grid-margin) calc(var(--safe-bottom) + 120rem);
  max-width: 800rem;
}

/* ── Split char / word spans ─────────────────────────────────────────── */
:deep(.sc),
:deep(.sw) {
  display: inline-block;
}

/* ── Hero ── */
.hero-section {
  margin-bottom: 100rem;
}

.hero-prayer {
  margin-bottom: 80rem;
}

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

.prayer-pause {
  height: 44rem;
}

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

.mom-line.mom-open {
  opacity: 1;
}

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

.identity-sep {
  opacity: 0.25;
  font-size: 13rem;
}

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

/* Closing line */
.closing-line {
  margin-top: 52rem;
  font-size: clamp(28rem, 4vw, 48rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.1;
  font-style: italic;
}

/* ── Timeline ── */
.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: grid;
  grid-template-columns: 130rem 1fr;
  gap: 0 28rem;
  padding: 24rem 0;
  border-bottom: 1px solid var(--color-divider);
}

.timeline-item:last-child {
  border-bottom: none;
}

.t-period {
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-accent);
  padding-top: 3rem;
  line-height: 1.4;
}

.t-content {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.t-content strong {
  font-size: 16rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.t-company {
  font-size: 13rem;
  opacity: 0.35;
}

.t-context {
  font-size: 13rem;
  font-style: italic;
  opacity: 0.5;
  margin-top: 2rem;
}

/* ── Contact ── */
.contact-links {
  display: flex;
  flex-direction: column;
  gap: 14rem;
}

.contact-link {
  font-size: clamp(18rem, 2.2vw, 26rem);
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  letter-spacing: -0.02em;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.contact-link:hover {
  opacity: 1;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .about-page {
    max-width: 100%;
  }

  .hero-prayer {
    margin-bottom: 56rem;
  }

  .hero-mom {
    margin-bottom: 52rem;
  }

  .portrait-wrap {
    max-width: 100%;
    border-radius: 12rem;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: 4rem 0;
  }
}
</style>
