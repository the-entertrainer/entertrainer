<template>
  <div class="about-page">
    <div class="grain" aria-hidden="true" />

    <!-- OPENING -->
    <section ref="openingEl" class="s-opening">
      <div class="opening-inner">
        <p ref="opening1El" class="opening-line">Finding Instructional design as a career was not planned.</p>
        <p ref="opening2El" class="opening-line opening-line--b">It was a <span ref="discoveryWordEl" class="discovery-word">discovery</span>.</p>
      </div>
    </section>

    <!-- NAME -->
    <section ref="nameEl" class="s-name">
      <div class="name-inner">
        <h1 ref="nameTextEl" class="name-display">NAVEEN JOSE</h1>
        <div ref="nameCaptionAEl" class="name-caption">
          I am Naveen.
        </div>
        <div ref="nameCaptionBEl" class="name-caption name-caption--b">
          I'm an instructional designer.
        </div>
      </div>
    </section>

    <!-- ORIGIN -->
    <section ref="originEl" class="s-origin">
      <div class="origin-inner">
        <div class="origin-left">
          <h2 ref="originHeadEl" class="display-lg origin-head">I started my career<br>in the hotel industry.</h2>
          <p ref="originBody1El" class="body-lg origin-body">I've worked with great brands such as Marriott International and Club Mahindra.</p>
          <p ref="originBody2El" class="body-lg origin-body">I started my first job as a housekeeper — yes I used to make beds, clean rooms, make towel art <em>(fun stuff eh)</em> and make rooms look decorative, arranged and beautiful.</p>
        </div>
        <div class="origin-right">
          <div ref="originGifEl" class="gif-frame gif-frame--hotel">
            <img src="/about/gifs/s3-0.gif" alt="A hotel room scene" class="gif-img" />
            <span class="gif-caption">circa Marriott era</span>
          </div>
        </div>
      </div>
    </section>

    <!-- THE TURN -->
    <section ref="turnEl" class="s-turn">
      <div class="turn-inner">
        <div class="turn-left">
          <div ref="turnGifEl" class="gif-frame gif-frame--struggle">
            <img src="/about/gifs/s7-0.gif" alt="Sleepless nights studying" class="gif-img" />
            <span class="gif-caption">a conservative count of nights not spent sleeping</span>
          </div>
        </div>
        <div class="turn-right">
          <h2 ref="turnHeadEl" class="display-lg turn-head">It was the mentors<br>that I met<br>along the way.</h2>
          <p ref="turnBodyEl" class="body-lg turn-body">That redirected my mind towards the path of learning and development.</p>
          <p ref="turnBody2El" class="body-lg turn-body">The transition took me countless, sleepless nights and tiring daylight where I kept on learning and introducing myself to concepts that once I believed never even existed.</p>
        </div>
      </div>
    </section>

    <!-- THE CORE -->
    <section ref="observeEl" class="s-observe">
      <div class="observe-inner">
        <blockquote ref="observeQuoteEl" class="observe-quote">
          It was the interaction and observation of people around me — how they responded to changes and their motives was what drove me towards L&amp;D and that thirst for knowledge was what got me to chase down the core —
        </blockquote>
      </div>
    </section>

    <!-- MANIFESTO (pinned) -->
    <section ref="philoEl" class="s-manifesto">
      <div class="manifesto-inner">
        <div ref="philoSlotEl" class="philo-slot">
          <p class="philo-line philo-ghost display-lg" aria-hidden="true">The ones that removes the noise and brings out the solid reality for your brain to understand.</p>
          <p
            v-for="(s, i) in manifestoLines"
            :key="s"
            :ref="(el) => { if (el) philoRefs[i] = el as HTMLElement }"
            class="philo-line display-lg"
          >{{ s }}</p>
        </div>
      </div>
      <div ref="brainGifEl" class="gif-frame gif-frame--brain">
        <img src="/about/gifs/s4-0.gif" alt="Brain neurons firing" class="gif-img" />
        <span class="gif-caption">solid reality unlocking</span>
      </div>
    </section>

    <!-- ASATOMA -->
    <section ref="asatomaEl" class="s-asatoma">
      <div class="asatoma-inner">
        <p ref="asatomaTextEl" class="asatoma-text">Asatoma Sadgamaya.</p>
        <p ref="asatomaTranslEl" class="asatoma-transl">Lead me from untruth to truth.</p>
        <div ref="finalSigEl" class="final-sig">
          <span>Naveen Jose</span>
          <span>Instructional Designer · Learning Architect · Entertrainer</span>
        </div>
        <div ref="finalCtaEl" class="final-cta-wrap">
          <NuxtLink to="/contact" class="final-cta">Let's build something worth remembering →</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Refs ──────────────────────────────────────────────────────────────────
const openingEl       = ref<HTMLElement>()
const opening1El      = ref<HTMLElement>()
const opening2El      = ref<HTMLElement>()
const discoveryWordEl = ref<HTMLElement>()
const nameEl          = ref<HTMLElement>()
const nameTextEl      = ref<HTMLElement>()
const nameCaptionAEl  = ref<HTMLElement>()
const nameCaptionBEl  = ref<HTMLElement>()
const originEl        = ref<HTMLElement>()
const originHeadEl    = ref<HTMLElement>()
const originBody1El   = ref<HTMLElement>()
const originBody2El   = ref<HTMLElement>()
const originGifEl     = ref<HTMLElement>()
const turnEl          = ref<HTMLElement>()
const turnHeadEl      = ref<HTMLElement>()
const turnBodyEl      = ref<HTMLElement>()
const turnBody2El     = ref<HTMLElement>()
const turnGifEl       = ref<HTMLElement>()
const observeEl       = ref<HTMLElement>()
const observeQuoteEl  = ref<HTMLElement>()
const philoEl         = ref<HTMLElement>()
const philoSlotEl     = ref<HTMLElement>()
const philoRefs       = ref<HTMLElement[]>([])
const brainGifEl      = ref<HTMLElement>()
const asatomaEl       = ref<HTMLElement>()
const asatomaTextEl   = ref<HTMLElement>()
const asatomaTranslEl = ref<HTMLElement>()
const finalSigEl      = ref<HTMLElement>()
const finalCtaEl      = ref<HTMLElement>()

const manifestoLines = [
  'trainers train.',
  'We instructional designers decide what is taught and how.',
  'We are entertrainers.',
  'The ones that removes the noise and brings out the solid reality for your brain to understand.',
]

let onLenisScroll: () => void

onMounted(async () => {
  document.documentElement.setAttribute('data-about', '')

  const { $lenis } = useNuxtApp()
  const lenis = $lenis as any
  onLenisScroll = () => ScrollTrigger.update()
  lenis.on('scroll', onLenisScroll)

  const { default: SplitType } = await import('split-type')

  setupOpening(SplitType)
  setupName(SplitType)
  setupOrigin()
  setupTurn()
  setupObserve()
  setupManifesto(SplitType)
  setupAsatoma(SplitType)

  await nextTick()
  ScrollTrigger.refresh()
})

onBeforeUnmount(() => {
  const { $lenis } = useNuxtApp()
  const lenis = $lenis as any
  if (onLenisScroll) lenis.off('scroll', onLenisScroll)
  ScrollTrigger.getAll().forEach(t => t.kill())
  document.documentElement.removeAttribute('data-about')
})

function setupOpening(SplitType: any) {
  if (!openingEl.value || !opening1El.value || !opening2El.value) return

  const split1 = new SplitType(opening1El.value, { types: 'chars' })
  const split2 = new SplitType(opening2El.value, { types: 'chars,words' })

  gsap.set(split1.chars, { opacity: 0, y: 20, filter: 'blur(4px)' })
  gsap.set(split2.chars, { opacity: 0, y: 20, filter: 'blur(4px)' })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: openingEl.value,
      start: 'top top',
      end: '+=320%',
      pin: true,
      scrub: 1.2,
      invalidateOnRefresh: true,
    }
  })

  tl.to(split1.chars, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.025, ease: 'power2.out' }, 0)
  tl.to(split1.chars, { opacity: 0, y: -12, stagger: 0.012, ease: 'power2.in' }, 0.52)
  tl.to(split2.chars, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.03, ease: 'power2.out' }, 0.57)

  const discoveryNode = discoveryWordEl.value
  if (discoveryNode && split2.chars) {
    const dChars = split2.chars.filter((c: HTMLElement) => discoveryNode.contains(c))
    if (dChars.length) {
      tl.to(dChars, { textShadow: '0 0 24px rgba(240,240,238,0.75)', letterSpacing: '0.06em', stagger: 0.03, ease: 'power1.out' }, 0.84)
      tl.to(dChars, { textShadow: '0 0 0px rgba(240,240,238,0)', letterSpacing: '0em', stagger: 0.02, ease: 'power2.inOut' }, 0.94)
    }
  }
}

function setupName(SplitType: any) {
  if (!nameEl.value || !nameTextEl.value) return

  const split = new SplitType(nameTextEl.value, { types: 'chars' })

  gsap.set(split.chars, { opacity: 1 })
  gsap.set(nameCaptionAEl.value!, { opacity: 0, y: 20 })
  gsap.set(nameCaptionBEl.value!, { opacity: 0, y: 20 })

  const xs = split.chars!.map((_: HTMLElement, i: number) =>
    gsap.utils.random(-280, 280) * (i % 2 === 0 ? 1 : -1)
  )

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: nameEl.value,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 1.2,
      invalidateOnRefresh: true,
    }
  })

  tl.to(split.chars, { x: (i: number) => xs[i], opacity: 0.08, stagger: 0.04, ease: 'power2.inOut' }, 0)
  tl.to(nameCaptionAEl.value!, { opacity: 1, y: 0, ease: 'power2.out' }, 0.45)
  tl.to(nameCaptionAEl.value!, { opacity: 0, y: -10, ease: 'power2.in' }, 0.7)
  tl.to(nameCaptionBEl.value!, { opacity: 1, y: 0, ease: 'power2.out' }, 0.72)
}

function setupOrigin() {
  if (!originEl.value || !originHeadEl.value) return

  gsap.set(originHeadEl.value, { opacity: 0, y: 40 })
  if (originBody1El.value) gsap.set(originBody1El.value, { opacity: 0, y: 28 })
  if (originBody2El.value) gsap.set(originBody2El.value, { opacity: 0, y: 28 })
  if (originGifEl.value)   gsap.set(originGifEl.value,   { opacity: 0, y: 40, rotate: -2 })

  ScrollTrigger.create({
    trigger: originEl.value,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      gsap.to(originHeadEl.value!, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' })
      if (originBody1El.value) gsap.to(originBody1El.value, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 })
      if (originBody2El.value) gsap.to(originBody2El.value, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.36 })
      if (originGifEl.value)   gsap.to(originGifEl.value,   { opacity: 1, y: 0, rotate: -2, duration: 1.3, ease: 'power3.out', delay: 0.5 })
    }
  })
}

function setupTurn() {
  if (!turnEl.value) return

  if (turnGifEl.value)   gsap.set(turnGifEl.value,   { opacity: 0, y: 40, rotate: 3 })
  if (turnHeadEl.value)  gsap.set(turnHeadEl.value,  { opacity: 0, y: 40 })
  if (turnBodyEl.value)  gsap.set(turnBodyEl.value,  { opacity: 0, y: 28 })
  if (turnBody2El.value) gsap.set(turnBody2El.value, { opacity: 0, y: 28 })

  ScrollTrigger.create({
    trigger: turnEl.value,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      if (turnGifEl.value)   gsap.to(turnGifEl.value,   { opacity: 1, y: 0, rotate: 3,  duration: 1.3, ease: 'power3.out' })
      if (turnHeadEl.value)  gsap.to(turnHeadEl.value,  { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.15 })
      if (turnBodyEl.value)  gsap.to(turnBodyEl.value,  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.3 })
      if (turnBody2El.value) gsap.to(turnBody2El.value, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.45 })
    }
  })
}

function setupObserve() {
  if (!observeEl.value || !observeQuoteEl.value) return

  gsap.set(observeQuoteEl.value, { opacity: 0, y: 32 })

  ScrollTrigger.create({
    trigger: observeEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      gsap.to(observeQuoteEl.value!, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
    }
  })
}

function setupManifesto(SplitType: any) {
  if (!philoEl.value || !philoRefs.value.length) return

  const splits = philoRefs.value.map((el: HTMLElement) => new SplitType(el, { types: 'chars' }))
  splits.forEach((s: any) => {
    if (s.chars) gsap.set(s.chars, { opacity: 0, filter: 'blur(8px)', y: -10 })
  })

  if (brainGifEl.value) gsap.set(brainGifEl.value, { opacity: 0, y: 20, rotate: 3 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: philoEl.value,
      start: 'top top',
      end: '+=500%',
      pin: true,
      scrub: 1.5,
      invalidateOnRefresh: true,
    }
  })

  if (brainGifEl.value) tl.to(brainGifEl.value, { opacity: 1, y: 0, duration: 0.12 }, 0.02)

  const step = 0.88 / manifestoLines.length
  manifestoLines.forEach((_, i) => {
    const inStart = 0.05 + i * step
    const holdEnd = inStart + step * 0.65

    tl.to(splits[i].chars!, { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.018, ease: 'power2.out' }, inStart)

    if (i < manifestoLines.length - 1) {
      tl.to(splits[i].chars!, { opacity: 0, filter: 'blur(8px)', y: -10, stagger: 0.012, ease: 'power2.in' }, holdEnd)
    }
  })
}

function setupAsatoma(SplitType: any) {
  if (!asatomaEl.value || !asatomaTextEl.value) return

  const split = new SplitType(asatomaTextEl.value, { types: 'chars' })
  gsap.set(split.chars, { opacity: 0, y: 24, filter: 'blur(6px)' })
  if (asatomaTranslEl.value) gsap.set(asatomaTranslEl.value, { opacity: 0 })
  if (finalSigEl.value)      gsap.set(finalSigEl.value,      { opacity: 0 })
  if (finalCtaEl.value)      gsap.set(finalCtaEl.value,      { opacity: 0, y: 20 })

  ScrollTrigger.create({
    trigger: asatomaEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(split.chars!, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.055, duration: 1.0, ease: 'power3.out' })
      if (asatomaTranslEl.value) tl.to(asatomaTranslEl.value, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.2')
      if (finalSigEl.value)      tl.to(finalSigEl.value,      { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.1')
      if (finalCtaEl.value)      tl.to(finalCtaEl.value,      { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.1')
    }
  })
}
</script>

<style scoped>
/* ─── Page base ─── */
.about-page {
  background: #0A0A0A;
  color: #F0F0EE;
  font-family: var(--main-font);
  overflow-x: hidden;
}

/* ─── Grain ─── */
.grain {
  position: fixed;
  inset: -200%;
  width: 400%;
  height: 400%;
  z-index: 999;
  pointer-events: none;
  opacity: 0.032;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain 0.2s steps(1) infinite;
}
@keyframes grain {
  0%   { transform: translate(0, 0); }
  10%  { transform: translate(-5%, -10%); }
  20%  { transform: translate(-15%, 5%); }
  30%  { transform: translate(7%, -25%); }
  40%  { transform: translate(-5%, 25%); }
  50%  { transform: translate(-15%, 10%); }
  60%  { transform: translate(15%, 0%); }
  70%  { transform: translate(0%, 15%); }
  80%  { transform: translate(3%, 35%); }
  90%  { transform: translate(-10%, 10%); }
  100% { transform: translate(9%, 0%); }
}

/* ─── Typography ─── */
.display-lg {
  font-size: clamp(44rem, 6.5vw, 130rem);
  font-weight: 800;
  line-height: 0.93;
  letter-spacing: -0.025em;
}
.body-lg {
  font-size: clamp(16rem, 1.8vw, 22rem);
  font-weight: 400;
  line-height: 1.7;
}

/* ─── GIF FRAMES ─── */
.gif-frame {
  display: inline-flex;
  flex-direction: column;
  background: #f3ede4;
  padding: 10rem 10rem 36rem;
  box-shadow: 0 24px 72px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.3);
  position: relative;
  will-change: transform, opacity;
}
.gif-img {
  display: block;
  width: 100%;
  height: auto;
}
.gif-caption {
  position: absolute;
  bottom: 9rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10rem;
  font-family: 'Courier New', monospace;
  color: #888;
  letter-spacing: 0.02em;
}
.gif-frame--hotel   { max-width: 260rem; }
.gif-frame--struggle { max-width: 260rem; }
.gif-frame--brain {
  position: absolute;
  bottom: clamp(40rem, 6vw, 80rem);
  right: clamp(40rem, 6vw, 100rem);
  max-width: 190rem;
  z-index: 2;
}

/* ─── OPENING ─── */
.s-opening {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(60rem, 10vw, 160rem);
}
.opening-inner { text-align: center; }
.opening-line {
  font-size: clamp(16rem, 2vw, 28rem);
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.005em;
  color: rgba(240,240,238,0.65);
}
.opening-line--b {
  margin-top: 0.45em;
  color: #F0F0EE;
  font-weight: 600;
  font-size: clamp(18rem, 2.4vw, 34rem);
}
.discovery-word { color: #F0F0EE; }

/* ─── NAME ─── */
.s-name {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(40rem, 6vw, 120rem);
  overflow: hidden;
}
.name-inner { text-align: center; position: relative; }
.name-display {
  font-size: clamp(56rem, 12vw, 210rem);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.04em;
  white-space: nowrap;
}
.name-caption {
  margin-top: 28rem;
  font-size: clamp(12rem, 1.3vw, 18rem);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  width: max-content;
  max-width: 90vw;
}
.name-caption--b { margin-top: 58rem; }

/* ─── ORIGIN ─── */
.s-origin {
  padding: clamp(100rem, 12vw, 200rem) clamp(40rem, 8vw, 140rem);
}
.origin-inner {
  max-width: 1360rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(60rem, 8vw, 120rem);
  align-items: center;
}
.origin-head  { margin-bottom: clamp(28rem, 3.5vw, 52rem); }
.origin-body  { margin-bottom: clamp(18rem, 2.2vw, 28rem); }
.origin-body:last-child { margin-bottom: 0; }
.origin-body em { font-style: italic; }
.origin-right { display: flex; justify-content: center; align-items: center; }

/* ─── THE TURN ─── */
.s-turn {
  padding: clamp(100rem, 12vw, 200rem) clamp(40rem, 8vw, 140rem);
  background: rgba(240,240,238,0.014);
}
.turn-inner {
  max-width: 1360rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(60rem, 8vw, 120rem);
  align-items: center;
}
.turn-head  { margin-bottom: clamp(24rem, 3vw, 44rem); }
.turn-body  { margin-bottom: clamp(16rem, 2vw, 26rem); }
.turn-body:last-child { margin-bottom: 0; }
.turn-left  { display: flex; justify-content: center; align-items: center; }

/* ─── THE CORE ─── */
.s-observe {
  padding: clamp(100rem, 12vw, 180rem) clamp(40rem, 8vw, 140rem);
}
.observe-inner {
  max-width: 960rem;
  margin: 0 auto;
  text-align: center;
}
.observe-quote {
  font-size: clamp(20rem, 2.8vw, 40rem);
  font-weight: 600;
  font-style: italic;
  line-height: 1.45;
  letter-spacing: -0.01em;
  margin: 0;
}

/* ─── MANIFESTO ─── */
.s-manifesto {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(60rem, 8vw, 120rem);
  overflow: hidden;
}
.manifesto-inner {
  width: 100%;
  max-width: 1060rem;
  margin: 0 auto;
  overflow: hidden;
}
.philo-slot {
  position: relative;
  text-align: center;
}
.philo-line {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}
.philo-ghost {
  position: relative !important;
  visibility: hidden;
}

/* ─── ASATOMA ─── */
.s-asatoma {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(80rem, 10vw, 160rem) clamp(40rem, 8vw, 140rem);
}
.asatoma-inner { text-align: center; }
.asatoma-text {
  font-size: clamp(44rem, 7vw, 140rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  margin-bottom: clamp(16rem, 2vw, 26rem);
}
.asatoma-transl {
  font-size: clamp(12rem, 1.3vw, 17rem);
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.4;
  margin-bottom: clamp(60rem, 8vw, 110rem);
}
.final-sig {
  display: flex;
  flex-direction: column;
  gap: 5rem;
  margin-bottom: clamp(36rem, 4.5vw, 60rem);
  font-size: clamp(12rem, 1.3vw, 16rem);
  opacity: 0.35;
  font-weight: 400;
}
.final-cta-wrap { display: inline-block; }
.final-cta {
  display: inline-block;
  font-size: clamp(13rem, 1.4vw, 19rem);
  font-weight: 500;
  border: 1rem solid rgba(240,240,238,0.32);
  padding: 14rem 32rem;
  border-radius: 999rem;
  text-decoration: none;
  color: inherit;
  letter-spacing: 0.02em;
  transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
.final-cta:hover {
  background: rgba(240,240,238,0.08);
  border-color: rgba(240,240,238,0.6);
  transform: scale(1.04);
}

/* ─── Mobile ─── */
@media (max-width: 768px) {
  .origin-inner  { grid-template-columns: 1fr; gap: clamp(48rem, 8vw, 80rem); }
  .turn-inner    { grid-template-columns: 1fr; }
  .turn-left     { order: 2; }
  .name-display  { font-size: clamp(40rem, 12vw, 90rem); }
  .name-caption  { white-space: normal; text-align: center; }
  .philo-line    { white-space: normal; }
  .gif-frame--brain {
    position: static;
    display: inline-flex;
    margin-top: clamp(28rem, 5vw, 48rem);
  }
}
</style>
