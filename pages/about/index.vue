<template>
  <div class="about-page">
    <div class="grain" aria-hidden="true" />

    <!-- OPENING -->
    <section ref="openingEl" class="s-opening">
      <p ref="opening1El" class="opening-premise">FINDING INSTRUCTIONAL DESIGN AS A CAREER WAS NOT PLANNED.</p>
      <div class="opening-stack">
        <p ref="opening2El" class="opening-small">IT WAS A</p>
        <p ref="opening3El" class="opening-word">DISCOVERY.</p>
      </div>
    </section>

    <!-- NAME -->
    <section ref="nameEl" class="s-name">
      <div class="h-rule" />
      <span class="ghost-num" aria-hidden="true">01</span>
      <div class="name-block">
        <h1 ref="nameLineAEl" class="name-line">NAVEEN</h1>
        <h1 ref="nameLineBEl" class="name-line name-line--b">JOSE</h1>
      </div>
      <div class="name-meta">
        <p ref="nameCaptionAEl" class="name-caption">I AM NAVEEN.</p>
        <p ref="nameCaptionBEl" class="name-caption">I'M AN INSTRUCTIONAL DESIGNER.</p>
      </div>
    </section>

    <!-- ORIGIN -->
    <section ref="originEl" class="s-origin">
      <div class="h-rule" />
      <span class="ghost-num" aria-hidden="true">02</span>
      <div class="two-col">
        <div class="col-text">
          <h2 ref="originHeadEl" class="section-head">I STARTED MY CAREER<br>IN THE HOTEL INDUSTRY.</h2>
          <p ref="originBody1El" class="body-text">I've worked with great brands such as Marriott International and Club Mahindra.</p>
          <p ref="originBody2El" class="body-text">I started my first job as a housekeeper — yes I used to make beds, clean rooms, make towel art <em>(fun stuff eh)</em> and make rooms look decorative, arranged and beautiful.</p>
        </div>
        <div ref="originGifEl" class="gif-wrap">
          <img src="/about/gifs/s3-0.gif" alt="Hotel room scene" class="gif-img" />
          <span class="gif-label">CIRCA MARRIOTT ERA</span>
        </div>
      </div>
    </section>

    <!-- THE TURN -->
    <section ref="turnEl" class="s-turn">
      <div class="h-rule" />
      <span class="ghost-num" aria-hidden="true">03</span>
      <div class="two-col two-col--flip">
        <div ref="turnGifEl" class="gif-wrap">
          <img src="/about/gifs/s7-0.gif" alt="Sleepless nights studying" class="gif-img" />
          <span class="gif-label">A CONSERVATIVE COUNT OF NIGHTS NOT SPENT SLEEPING</span>
        </div>
        <div class="col-text">
          <h2 ref="turnHeadEl" class="section-head">IT WAS THE MENTORS<br>THAT I MET<br>ALONG THE WAY.</h2>
          <p ref="turnBodyEl" class="body-text">That redirected my mind towards the path of learning and development.</p>
          <p ref="turnBody2El" class="body-text">The transition took me countless, sleepless nights and tiring daylight where I kept on learning and introducing myself to concepts that once I believed never even existed.</p>
        </div>
      </div>
    </section>

    <!-- THE CORE -->
    <section ref="observeEl" class="s-observe">
      <div class="h-rule" />
      <span class="ghost-num" aria-hidden="true">04</span>
      <div class="observe-inner">
        <p ref="observeQuoteEl" class="observe-quote">IT WAS THE INTERACTION AND OBSERVATION OF PEOPLE AROUND ME — HOW THEY RESPONDED TO CHANGES AND THEIR MOTIVES WAS WHAT DROVE ME TOWARDS L&amp;D AND THAT THIRST FOR KNOWLEDGE WAS WHAT GOT ME TO CHASE DOWN THE CORE —</p>
      </div>
    </section>

    <!-- MANIFESTO (pinned) -->
    <section ref="philoEl" class="s-manifesto">
      <div class="h-rule" />
      <span class="ghost-num" aria-hidden="true">05</span>
      <div class="manifesto-inner">
        <div ref="philoSlotEl" class="philo-slot">
          <p class="philo-ghost section-head" aria-hidden="true">THE ONES THAT REMOVES THE NOISE AND BRINGS OUT THE SOLID REALITY FOR YOUR BRAIN TO UNDERSTAND.</p>
          <p
            v-for="(s, i) in manifestoLines"
            :key="s"
            :ref="(el) => { if (el) philoRefs[i] = el as HTMLElement }"
            class="philo-line section-head"
          >{{ s }}</p>
        </div>
        <div ref="brainGifEl" class="manifesto-gif">
          <img src="/about/gifs/s4-0.gif" alt="" class="gif-img gif-img--brain" />
          <span class="gif-label">SOLID REALITY UNLOCKING</span>
        </div>
      </div>
    </section>

    <!-- ASATOMA -->
    <section ref="asatomaEl" class="s-asatoma">
      <div class="h-rule" />
      <span class="ghost-num" aria-hidden="true">06</span>
      <div class="asatoma-inner">
        <p ref="asatomaTextEl" class="asatoma-text">ASATOMA<br>SADGAMAYA.</p>
        <p ref="asatomaTranslEl" class="asatoma-transl">LEAD ME FROM UNTRUTH TO TRUTH.</p>
        <div ref="finalSigEl" class="final-sig">NAVEEN JOSE · INSTRUCTIONAL DESIGNER · ENTERTRAINER</div>
        <div ref="finalCtaEl" class="final-cta-wrap">
          <NuxtLink to="/contact" class="final-cta">LET'S BUILD SOMETHING WORTH REMEMBERING →</NuxtLink>
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
const openingEl      = ref<HTMLElement>()
const opening1El     = ref<HTMLElement>()
const opening2El     = ref<HTMLElement>()
const opening3El     = ref<HTMLElement>()
const nameEl         = ref<HTMLElement>()
const nameLineAEl    = ref<HTMLElement>()
const nameLineBEl    = ref<HTMLElement>()
const nameCaptionAEl = ref<HTMLElement>()
const nameCaptionBEl = ref<HTMLElement>()
const originEl       = ref<HTMLElement>()
const originHeadEl   = ref<HTMLElement>()
const originBody1El  = ref<HTMLElement>()
const originBody2El  = ref<HTMLElement>()
const originGifEl    = ref<HTMLElement>()
const turnEl         = ref<HTMLElement>()
const turnHeadEl     = ref<HTMLElement>()
const turnBodyEl     = ref<HTMLElement>()
const turnBody2El    = ref<HTMLElement>()
const turnGifEl      = ref<HTMLElement>()
const observeEl      = ref<HTMLElement>()
const observeQuoteEl = ref<HTMLElement>()
const philoEl        = ref<HTMLElement>()
const philoSlotEl    = ref<HTMLElement>()
const philoRefs      = ref<HTMLElement[]>([])
const brainGifEl     = ref<HTMLElement>()
const asatomaEl      = ref<HTMLElement>()
const asatomaTextEl  = ref<HTMLElement>()
const asatomaTranslEl = ref<HTMLElement>()
const finalSigEl     = ref<HTMLElement>()
const finalCtaEl     = ref<HTMLElement>()

const manifestoLines = [
  'TRAINERS TRAIN.',
  'WE INSTRUCTIONAL DESIGNERS DECIDE WHAT IS TAUGHT AND HOW.',
  'WE ARE ENTERTRAINERS.',
  'THE ONES THAT REMOVES THE NOISE AND BRINGS OUT THE SOLID REALITY FOR YOUR BRAIN TO UNDERSTAND.',
]

let onLenisScroll: () => void

onMounted(async () => {
  document.documentElement.setAttribute('data-about', '')

  const { $lenis } = useNuxtApp()
  const lenis = $lenis as any
  onLenisScroll = () => ScrollTrigger.update()
  lenis.on('scroll', onLenisScroll)

  setupOpening()
  setupName()
  setupOrigin()
  setupTurn()
  setupObserve()
  setupManifesto()
  setupAsatoma()

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

function slam(targets: (HTMLElement | undefined | null)[], from: gsap.TweenVars, delay = 0) {
  targets.forEach(el => { if (el) gsap.set(el, from) })
  return (tl: gsap.core.Timeline, at: number | string = '>') => {
    targets.forEach((el, i) => {
      if (el) tl.to(el, { x: 0, y: 0, opacity: 1, duration: 0.28, ease: 'power4.out', delay: i * delay }, at)
    })
  }
}

function setupOpening() {
  if (!openingEl.value) return

  gsap.set(opening1El.value!, { y: -24, opacity: 0 })
  gsap.set(opening2El.value!, { opacity: 0 })
  gsap.set(opening3El.value!, { y: 80,  opacity: 0 })

  ScrollTrigger.create({
    trigger: openingEl.value,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(opening1El.value!, { y: 0, opacity: 1, duration: 0.22, ease: 'power4.out' }, 0)
      tl.to(opening2El.value!, { opacity: 1, duration: 0.15, ease: 'none' }, 0.12)
      tl.to(opening3El.value!, { y: 0, opacity: 1, duration: 0.35, ease: 'power4.out' }, 0.18)
    }
  })
}

function setupName() {
  if (!nameEl.value) return

  gsap.set(nameLineAEl.value!, { y: -50, opacity: 0 })
  gsap.set(nameLineBEl.value!, { y: 50,  opacity: 0 })
  gsap.set(nameCaptionAEl.value!, { x: -30, opacity: 0 })
  gsap.set(nameCaptionBEl.value!, { x: -30, opacity: 0 })

  ScrollTrigger.create({
    trigger: nameEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(nameLineAEl.value!, { y: 0, opacity: 1, duration: 0.3, ease: 'power4.out' }, 0)
      tl.to(nameLineBEl.value!, { y: 0, opacity: 1, duration: 0.3, ease: 'power4.out' }, 0.04)
      tl.to(nameCaptionAEl.value!, { x: 0, opacity: 1, duration: 0.22, ease: 'power4.out' }, 0.22)
      tl.to(nameCaptionBEl.value!, { x: 0, opacity: 1, duration: 0.22, ease: 'power4.out' }, 0.3)
    }
  })
}

function setupOrigin() {
  if (!originEl.value) return

  gsap.set(originHeadEl.value!,  { x: -60, opacity: 0 })
  gsap.set(originBody1El.value!, { y: 36, opacity: 0 })
  gsap.set(originBody2El.value!, { y: 36, opacity: 0 })
  gsap.set(originGifEl.value!,   { x: 60, opacity: 0 })

  ScrollTrigger.create({
    trigger: originEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(originHeadEl.value!,  { x: 0, opacity: 1, duration: 0.28, ease: 'power4.out' }, 0)
      tl.to(originGifEl.value!,   { x: 0, opacity: 1, duration: 0.28, ease: 'power4.out' }, 0.04)
      tl.to(originBody1El.value!, { y: 0, opacity: 1, duration: 0.24, ease: 'power4.out' }, 0.16)
      tl.to(originBody2El.value!, { y: 0, opacity: 1, duration: 0.24, ease: 'power4.out' }, 0.23)
    }
  })
}

function setupTurn() {
  if (!turnEl.value) return

  gsap.set(turnGifEl.value!,   { x: -60, opacity: 0 })
  gsap.set(turnHeadEl.value!,  { x: 60,  opacity: 0 })
  gsap.set(turnBodyEl.value!,  { y: 36,  opacity: 0 })
  gsap.set(turnBody2El.value!, { y: 36,  opacity: 0 })

  ScrollTrigger.create({
    trigger: turnEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(turnGifEl.value!,   { x: 0, opacity: 1, duration: 0.28, ease: 'power4.out' }, 0)
      tl.to(turnHeadEl.value!,  { x: 0, opacity: 1, duration: 0.28, ease: 'power4.out' }, 0.04)
      tl.to(turnBodyEl.value!,  { y: 0, opacity: 1, duration: 0.24, ease: 'power4.out' }, 0.18)
      tl.to(turnBody2El.value!, { y: 0, opacity: 1, duration: 0.24, ease: 'power4.out' }, 0.26)
    }
  })
}

function setupObserve() {
  if (!observeEl.value || !observeQuoteEl.value) return

  gsap.set(observeQuoteEl.value, { y: 50, opacity: 0 })

  ScrollTrigger.create({
    trigger: observeEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      gsap.to(observeQuoteEl.value!, { y: 0, opacity: 1, duration: 0.35, ease: 'power4.out' })
    }
  })
}

function setupManifesto() {
  if (!philoEl.value || !philoRefs.value.length) return

  philoRefs.value.forEach(el => gsap.set(el, { opacity: 0, y: 40 }))
  if (brainGifEl.value) gsap.set(brainGifEl.value, { opacity: 0 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: philoEl.value,
      start: 'top top',
      end: '+=400%',
      pin: true,
      scrub: 0.4,
      invalidateOnRefresh: true,
    }
  })

  if (brainGifEl.value) tl.to(brainGifEl.value, { opacity: 1, duration: 0.04 }, 0.01)

  const step = 0.9 / manifestoLines.length
  manifestoLines.forEach((_, i) => {
    const inStart = 0.04 + i * step
    const holdEnd = inStart + step * 0.58

    tl.to(philoRefs.value[i], { opacity: 1, y: 0, duration: 0.06, ease: 'none' }, inStart)

    if (i < manifestoLines.length - 1) {
      tl.to(philoRefs.value[i], { opacity: 0, y: -40, duration: 0.06, ease: 'none' }, holdEnd)
    }
  })
}

function setupAsatoma() {
  if (!asatomaEl.value || !asatomaTextEl.value) return

  gsap.set(asatomaTextEl.value,   { y: 60, opacity: 0 })
  gsap.set(asatomaTranslEl.value!, { opacity: 0 })
  gsap.set(finalSigEl.value!,     { opacity: 0 })
  gsap.set(finalCtaEl.value!,     { y: 20, opacity: 0 })

  ScrollTrigger.create({
    trigger: asatomaEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(asatomaTextEl.value!,   { y: 0, opacity: 1, duration: 0.38, ease: 'power4.out' })
      tl.to(asatomaTranslEl.value!, { opacity: 1, duration: 0.18, ease: 'none' }, '-=0.1')
      tl.to(finalSigEl.value!,      { opacity: 1, duration: 0.18, ease: 'none' }, '-=0.05')
      tl.to(finalCtaEl.value!,      { y: 0, opacity: 1, duration: 0.26, ease: 'power4.out' }, '-=0.05')
    }
  })
}
</script>

<style scoped>
/* ─── Base ─── */
.about-page {
  background: #050505;
  color: #FFFFFF;
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
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain 0.2s steps(1) infinite;
}
@keyframes grain {
  0%   { transform: translate(0,0); }
  10%  { transform: translate(-5%,-10%); }
  20%  { transform: translate(-15%,5%); }
  30%  { transform: translate(7%,-25%); }
  40%  { transform: translate(-5%,25%); }
  50%  { transform: translate(-15%,10%); }
  60%  { transform: translate(15%,0%); }
  70%  { transform: translate(0%,15%); }
  80%  { transform: translate(3%,35%); }
  90%  { transform: translate(-10%,10%); }
  100% { transform: translate(9%,0%); }
}

/* ─── Rules & Ghost Numbers ─── */
.h-rule {
  width: 100%;
  height: 3rem;
  background: #FFFFFF;
}
.ghost-num {
  position: absolute;
  right: clamp(20rem, 3vw, 60rem);
  bottom: clamp(10rem, 2vw, 40rem);
  font-size: clamp(160rem, 28vw, 500rem);
  font-weight: 900;
  line-height: 1;
  color: #FFFFFF;
  opacity: 0.045;
  pointer-events: none;
  user-select: none;
  letter-spacing: -0.06em;
  z-index: 0;
}

/* ─── Typography ─── */
.section-head {
  font-size: clamp(32rem, 5vw, 96rem);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}
.body-text {
  font-size: clamp(15rem, 1.7vw, 21rem);
  font-weight: 400;
  line-height: 1.68;
  color: rgba(255,255,255,0.7);
}
.body-text em { font-style: italic; }

/* ─── GIF ─── */
.gif-wrap { position: relative; max-width: 280rem; }
.gif-img {
  display: block;
  width: 100%;
  height: auto;
  filter: grayscale(1) contrast(1.08);
}
.gif-label {
  display: block;
  margin-top: 8rem;
  font-size: 9rem;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.3);
}

/* ─── Two-col layout ─── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(60rem, 8vw, 130rem);
  align-items: start;
  position: relative;
  z-index: 1;
}
.two-col--flip .gif-wrap { order: -1; }
.col-text .section-head { margin-bottom: clamp(28rem, 3.5vw, 52rem); }
.col-text .body-text     { margin-bottom: clamp(14rem, 1.8vw, 22rem); }
.col-text .body-text:last-child { margin-bottom: 0; }

/* ─── OPENING ─── */
.s-opening {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(60rem, 8vw, 140rem) clamp(40rem, 5vw, 100rem);
  gap: clamp(40rem, 6vw, 100rem);
}
.opening-premise {
  font-size: clamp(10rem, 1.3vw, 15rem);
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.38);
  max-width: 600rem;
  line-height: 1.8;
}
.opening-stack {
  display: flex;
  flex-direction: column;
}
.opening-small {
  font-size: clamp(18rem, 2.8vw, 52rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  line-height: 1.3;
}
.opening-word {
  font-size: clamp(60rem, 14vw, 240rem);
  font-weight: 900;
  line-height: 0.84;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #FFFFFF;
}

/* ─── NAME ─── */
.s-name {
  padding: clamp(60rem, 8vw, 120rem) clamp(40rem, 5vw, 100rem);
  position: relative;
  overflow: hidden;
}
.name-block { margin: clamp(20rem, 3vw, 52rem) 0; }
.name-line {
  font-size: clamp(80rem, 14vw, 260rem);
  font-weight: 900;
  line-height: 0.88;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  display: block;
}
.name-line--b {
  text-align: right;
  margin-right: -0.04em;
}
.name-meta {
  border-top: 1rem solid rgba(255,255,255,0.18);
  padding-top: clamp(16rem, 2vw, 28rem);
  position: relative;
  z-index: 1;
}
.name-caption {
  font-size: clamp(11rem, 1.3vw, 17rem);
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  line-height: 2.1;
}

/* ─── ORIGIN ─── */
.s-origin {
  padding: clamp(80rem, 10vw, 160rem) clamp(40rem, 5vw, 100rem);
  position: relative;
  overflow: hidden;
}

/* ─── TURN ─── */
.s-turn {
  padding: clamp(80rem, 10vw, 160rem) clamp(40rem, 5vw, 100rem);
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.018);
}

/* ─── OBSERVE ─── */
.s-observe {
  padding: clamp(80rem, 10vw, 160rem) clamp(40rem, 5vw, 100rem);
  position: relative;
  overflow: hidden;
}
.observe-inner {
  max-width: 1200rem;
  position: relative;
  z-index: 1;
}
.observe-quote {
  font-size: clamp(22rem, 3vw, 52rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.025em;
  text-transform: uppercase;
  border-left: 6rem solid #FFFFFF;
  padding-left: clamp(24rem, 3vw, 48rem);
  margin: 0;
}

/* ─── MANIFESTO ─── */
.s-manifesto {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(60rem, 8vw, 120rem) clamp(40rem, 5vw, 100rem);
  overflow: hidden;
}
.manifesto-inner {
  position: relative;
  z-index: 1;
}
.philo-slot { position: relative; }
.philo-line {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  text-align: left;
}
.philo-ghost {
  position: relative !important;
  visibility: hidden;
}
.manifesto-gif {
  position: absolute;
  bottom: clamp(40rem, 5vw, 80rem);
  right: clamp(40rem, 5vw, 80rem);
  max-width: 180rem;
  z-index: 2;
}
.gif-img--brain { filter: grayscale(1) contrast(1.2); }

/* ─── ASATOMA ─── */
.s-asatoma {
  padding: clamp(80rem, 10vw, 160rem) clamp(40rem, 5vw, 100rem);
  min-height: 90svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.asatoma-inner { position: relative; z-index: 1; }
.asatoma-text {
  font-size: clamp(60rem, 10vw, 180rem);
  font-weight: 900;
  line-height: 0.88;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  margin-bottom: clamp(20rem, 2.5vw, 36rem);
}
.asatoma-transl {
  font-size: clamp(11rem, 1.3vw, 16rem);
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: clamp(60rem, 8vw, 120rem);
}
.final-sig {
  font-size: clamp(10rem, 1.1vw, 13rem);
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  margin-bottom: clamp(32rem, 4vw, 56rem);
}
.final-cta-wrap { display: inline-block; }
.final-cta {
  display: inline-block;
  font-size: clamp(11rem, 1.3vw, 16rem);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: #050505;
  background: #FFFFFF;
  padding: 14rem 32rem;
  transition: background 0.12s ease, color 0.12s ease, outline-offset 0.12s ease;
  outline: 2rem solid transparent;
}
.final-cta:hover {
  background: transparent;
  color: #FFFFFF;
  outline-color: #FFFFFF;
  outline-offset: 0rem;
}

/* ─── Mobile ─── */
@media (max-width: 768px) {
  .two-col { grid-template-columns: 1fr; gap: clamp(48rem, 8vw, 80rem); }
  .two-col--flip .gif-wrap { order: 0; }
  .opening-word { font-size: clamp(52rem, 18vw, 140rem); }
  .name-line    { font-size: clamp(60rem, 18vw, 180rem); }
  .philo-line   { white-space: normal; }
  .manifesto-gif { position: static; margin-top: 32rem; }
}
</style>
