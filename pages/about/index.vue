<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const pageRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    gsap.from('.prayer-line', {
      y: 32,
      autoAlpha: 0,
      duration: 0.85,
      ease: 'power3.out',
      stagger: 0.15,
      delay: 0.15
    })

    gsap.from('.mom-line', {
      y: 24,
      autoAlpha: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.13,
      delay: 0.7
    })

    gsap.fromTo(
      '.portrait-wrap',
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.portrait-wrap', start: 'top 85%' }
      }
    )

    gsap.from('.portrait-identity', {
      y: 16,
      autoAlpha: 0,
      duration: 0.65,
      ease: 'power3.out',
      delay: 0.25,
      scrollTrigger: { trigger: '.portrait-identity', start: 'top 90%' }
    })

    gsap.utils.toArray<HTMLElement>('.section-label').forEach(el => {
      gsap.from(el, {
        y: 12,
        autoAlpha: 0,
        duration: 0.55,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      })
    })

    gsap.utils.toArray<HTMLElement>('.section-body').forEach(body => {
      gsap.from(body.querySelectorAll('p'), {
        y: 20,
        autoAlpha: 0,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: body, start: 'top 82%' }
      })
    })

    gsap.from('.closing-line', {
      y: 24,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.closing-line', start: 'top 85%' }
    })

    gsap.from('.timeline-item', {
      x: -32,
      autoAlpha: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.timeline', start: 'top 82%' }
    })

    gsap.from('.contact-links > *', {
      y: 20,
      autoAlpha: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: '.contact-links', start: 'top 85%' }
    })
  }, pageRef.value!)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="pageRef" class="about-page">

    <!-- HERO -->
    <section class="hero-section">

      <div class="hero-prayer">
        <p class="prayer-line prayer-quote">"Asatoma Sadgamaya."</p>
        <p class="prayer-line prayer-trans">Lead me from ignorance to light.</p>
        <div class="prayer-pause"></div>
        <p class="prayer-line prayer-context">Somebody wrote that three thousand years ago.</p>
        <p class="prayer-line prayer-context">It still describes everything I do.</p>
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
