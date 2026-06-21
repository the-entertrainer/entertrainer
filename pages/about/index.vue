<template>
  <div class="about-page">
    <div class="grain" aria-hidden="true" />

    <!-- OPENING -->
    <section ref="openingEl" class="opening">
      <div class="opening-inner">
        <p ref="opening1El" class="opening-text">Most training is forgotten.</p>
        <p ref="opening2El" class="opening-text opening-text--b">I build the part that <span ref="sticksEl" class="sticks-word">sticks</span>.</p>
      </div>
    </section>

    <!-- NAME -->
    <section ref="nameEl" class="s-name">
      <div class="name-inner">
        <h1 ref="nameTextEl" class="name-display">NAVEEN JOSE</h1>
        <div ref="nameCaptionAEl" class="name-caption">
          <span>Instructional Designer.</span>
          <span>Learning Architect.</span>
          <span>Storyteller.</span>
        </div>
        <div ref="nameCaptionBEl" class="name-caption name-caption--b">
          <span>Former hotelier.</span>
          <span>Accidental educator.</span>
          <span>Definitely knows where the extra towels are.</span>
        </div>
      </div>
    </section>

    <!-- ORIGIN -->
    <section ref="originEl" class="s-origin">
      <div class="origin-inner">
        <div class="origin-left">
          <h2 ref="originHeadEl" class="display-lg origin-head">It started<br>in hotels.</h2>
          <p ref="originBody1El" class="body-lg origin-body">Years of rooms, rosters, and guests with very specific opinions about pillow firmness. What I learned: people don't perform because they're told to. They perform because they <em>understand why</em>.</p>
          <p ref="originBody2El" class="body-lg origin-body">When I moved into learning design, I brought that obsession with me. Not content. Not compliance. Behavior change.</p>
        </div>
        <div class="origin-right">
          <div v-if="hotelGif" ref="originGifEl" class="gif-frame">
            <img :src="hotelGif.url" :alt="hotelGif.title" class="gif-img" loading="lazy" />
            <span class="gif-caption">circa hotel era</span>
          </div>
        </div>
      </div>
    </section>

    <!-- THE PROBLEM -->
    <section ref="problemEl" class="s-problem">
      <div class="problem-inner">
        <div v-if="trainingGif" ref="problemGifEl" class="gif-frame gif-frame--problem">
          <img :src="trainingGif.url" :alt="trainingGif.title" class="gif-img" loading="lazy" />
          <span class="gif-caption">most corporate training, actually</span>
        </div>
        <h2 ref="problemHeadEl" class="display-lg problem-head">Then I saw<br>how companies<br>train people.</h2>
        <div ref="statsEl" class="problem-stats">
          <p class="stat-line">Slides.</p>
          <p class="stat-line">Clicks.</p>
          <p class="stat-line">Sign here.</p>
          <p class="stat-line stat-line--whisper">You're certified. Good luck.</p>
        </div>
        <div class="problem-mask-wrap">
          <p ref="problemConclusionEl" class="body-lg problem-conclusion">Learning was never supposed to feel like paperwork.</p>
        </div>
      </div>
    </section>

    <!-- THE SPARK — SEWA CHRONICLES -->
    <section ref="sewaEl" class="s-sewa">
      <div class="sewa-inner">
        <div class="sewa-left">
          <span class="label sewa-label">The Spark</span>
          <h2 ref="sewaHeadEl" class="display-lg sewa-head">So I drew<br>a comic book.</h2>
          <p ref="sewaBodyEl" class="body-lg sewa-body">At Mahindra Holidays, I hand-drew 10 real guest experience stories from our frontline teams — retro-comic panels, real people, real moments. We called it <em>The SEWA Chronicles</em>. It was highlighted at our Great Place to Work event.</p>
          <div class="sewa-punch-wrap">
            <p ref="sewaPunchEl" class="sewa-punch">Because stories land where manuals don't.</p>
          </div>
        </div>
        <div class="sewa-right">
          <div v-if="comicGif" ref="sewaGifEl" class="gif-frame gif-frame--lg">
            <img :src="comicGif.url" :alt="comicGif.title" class="gif-img" loading="lazy" />
            <span class="gif-caption">the sewa chronicles, energy-wise</span>
          </div>
        </div>
      </div>
    </section>

    <!-- PHILOSOPHY (pinned) -->
    <section ref="philoEl" class="s-philosophy">
      <div class="philo-inner">
        <div ref="philoSlotEl" class="philo-slot">
          <p
            v-for="(s, i) in philosophySentences"
            :key="s"
            :ref="(el) => { if (el) philoRefs[i] = el as HTMLElement }"
            class="philo-line display-lg"
          >{{ s }}</p>
        </div>
      </div>
    </section>

    <!-- NOW -->
    <section ref="nowEl" class="s-now">
      <div class="now-inner">
        <div class="now-left">
          <span class="label now-label">Currently</span>
          <div class="now-head-wrap">
            <h2 ref="nowHeadEl" class="display-lg now-head">Building learning at Concentrix.</h2>
          </div>
          <div class="now-body-wrap">
            <p ref="nowBodyEl" class="body-lg now-body">Converting complex operational knowledge into digital learning experiences for global teams. Applying adult learning science to data that otherwise just sits in a spreadsheet.</p>
          </div>
        </div>
        <div class="now-right">
          <img src="/naveen.jpeg" alt="Naveen Jose" class="now-photo" />
        </div>
      </div>
    </section>

    <!-- FINAL -->
    <section ref="finalEl" class="s-final">
      <div class="final-inner">
        <div class="final-head-block">
          <h2 ref="finalLine1El" class="display-xl final-line">MAKE PEOPLE</h2>
          <h2 ref="finalLine2El" class="display-xl final-line final-care">CARE.</h2>
        </div>
        <div class="final-body-wrap">
          <p ref="finalBodyEl" class="body-lg final-body">Because if nobody remembers it,<br>nobody learned it.</p>
        </div>
        <div ref="finalSigEl" class="final-sig">
          <span>Naveen Jose</span>
          <span>Instructional Designer · Learning Architect · Narrative Builder</span>
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

// ── GIF data via server-side Giphy proxy ──────────────────────────────────
const FALLBACK_GIFS = {
  hotel:    { url: 'https://media.giphy.com/media/3o7qDERaa7T4UoLJnO/giphy.gif', title: 'Hotel receptionist' },
  training: { url: 'https://media.giphy.com/media/cLGlV1RGONxKa71QDY/giphy.gif', title: 'Boring office training' },
  comic:    { url: 'https://media.giphy.com/media/xT9DPErFASWkKCaAJW/giphy.gif', title: 'Vintage comic book' },
}

const { data: hotelData }    = useFetch('/api/giphy', { query: { q: 'hotel receptionist funny vintage', limit: 1 }, server: false })
const { data: trainingData } = useFetch('/api/giphy', { query: { q: 'boring presentation office sleep', limit: 1 }, server: false })
const { data: comicData }    = useFetch('/api/giphy', { query: { q: 'vintage comic book retro pow', limit: 1 }, server: false })

const hotelGif    = computed(() => (hotelData.value?.items?.length    ? hotelData.value.items[0]    : FALLBACK_GIFS.hotel))
const trainingGif = computed(() => (trainingData.value?.items?.length ? trainingData.value.items[0] : FALLBACK_GIFS.training))
const comicGif    = computed(() => (comicData.value?.items?.length    ? comicData.value.items[0]    : FALLBACK_GIFS.comic))

// ── Refs ──────────────────────────────────────────────────────────────────
const openingEl           = ref<HTMLElement>()
const opening1El          = ref<HTMLElement>()
const opening2El          = ref<HTMLElement>()
const sticksEl            = ref<HTMLElement>()
const nameEl              = ref<HTMLElement>()
const nameTextEl          = ref<HTMLElement>()
const nameCaptionAEl      = ref<HTMLElement>()
const nameCaptionBEl      = ref<HTMLElement>()
const originEl            = ref<HTMLElement>()
const originHeadEl        = ref<HTMLElement>()
const originBody1El       = ref<HTMLElement>()
const originBody2El       = ref<HTMLElement>()
const originGifEl         = ref<HTMLElement>()
const problemEl           = ref<HTMLElement>()
const problemHeadEl       = ref<HTMLElement>()
const statsEl             = ref<HTMLElement>()
const problemConclusionEl = ref<HTMLElement>()
const problemGifEl        = ref<HTMLElement>()
const sewaEl              = ref<HTMLElement>()
const sewaHeadEl          = ref<HTMLElement>()
const sewaBodyEl          = ref<HTMLElement>()
const sewaPunchEl         = ref<HTMLElement>()
const sewaGifEl           = ref<HTMLElement>()
const philoEl             = ref<HTMLElement>()
const philoSlotEl         = ref<HTMLElement>()
const philoRefs           = ref<HTMLElement[]>([])
const nowEl               = ref<HTMLElement>()
const nowHeadEl           = ref<HTMLElement>()
const nowBodyEl           = ref<HTMLElement>()
const finalEl             = ref<HTMLElement>()
const finalLine1El        = ref<HTMLElement>()
const finalLine2El        = ref<HTMLElement>()
const finalBodyEl         = ref<HTMLElement>()
const finalSigEl          = ref<HTMLElement>()
const finalCtaEl          = ref<HTMLElement>()

const philosophySentences = [
  'Learning is not information.',
  'Learning is emotion.',
  'Learning is memory.',
  'Learning is behavior.',
  'Learning is change.',
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
  setupProblem(SplitType)
  setupSewa()
  setupPhilosophy(SplitType)
  setupNow()
  setupFinal(SplitType)

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
      end: '+=280%',
      pin: true,
      scrub: 1.2,
    }
  })

  tl.to(split1.chars, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.03, ease: 'power2.out' }, 0)
  tl.to(split1.chars, { opacity: 0, y: -12, stagger: 0.015, ease: 'power2.in' }, 0.5)
  tl.to(split2.chars, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.025, ease: 'power2.out' }, 0.55)

  const sticksNode = sticksEl.value
  if (sticksNode && split2.chars) {
    const sticksChars = split2.chars.filter((c: HTMLElement) => sticksNode.contains(c))
    if (sticksChars.length) {
      tl.to(sticksChars, {
        x: (i: number) => (i - sticksChars.length / 2) * 6,
        scaleY: 1.08, filter: 'blur(1px)',
        textShadow: '0 0 18px rgba(240,240,238,0.55)',
        stagger: 0.04, ease: 'power1.out',
      }, 0.82)
      tl.to(sticksChars, {
        x: 0, scaleY: 1, filter: 'blur(0px)',
        textShadow: '0 0 0px rgba(240,240,238,0)',
        stagger: 0.02, ease: 'power2.inOut',
      }, 0.92)
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
  if (originBody1El.value) gsap.set(originBody1El.value, { opacity: 0, y: 30 })
  if (originBody2El.value) gsap.set(originBody2El.value, { opacity: 0, y: 30 })
  if (originGifEl.value) gsap.set(originGifEl.value, { opacity: 0, y: 40, rotate: 3 })

  ScrollTrigger.create({
    trigger: originEl.value,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      gsap.to(originHeadEl.value!, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' })
      if (originBody1El.value) gsap.to(originBody1El.value, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 })
      if (originBody2El.value) gsap.to(originBody2El.value, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.35 })
      if (originGifEl.value) gsap.to(originGifEl.value, { opacity: 1, y: 0, rotate: 3, duration: 1.3, ease: 'power3.out', delay: 0.5 })
    }
  })
}

function setupProblem(SplitType: any) {
  if (!problemEl.value || !problemHeadEl.value || !statsEl.value) return

  if (problemGifEl.value) gsap.set(problemGifEl.value, { opacity: 0, y: 20, rotate: -3 })

  const splitHead = new SplitType(problemHeadEl.value, { types: 'words' })
  gsap.set(splitHead.words, { opacity: 0, y: 60 })

  ScrollTrigger.create({
    trigger: problemEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      if (problemGifEl.value) gsap.to(problemGifEl.value, { opacity: 1, y: 0, rotate: -3, duration: 1.1, ease: 'power3.out' })
      gsap.to(splitHead.words, { opacity: 1, y: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out', delay: 0.15 })
    }
  })

  const statLines = statsEl.value.querySelectorAll('.stat-line')
  gsap.set(statLines, { opacity: 0, x: -40 })
  ScrollTrigger.create({
    trigger: statsEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      gsap.to(statLines, { opacity: 1, x: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' })
    }
  })

  if (problemConclusionEl.value) {
    gsap.set(problemConclusionEl.value, { y: '100%' })
    ScrollTrigger.create({
      trigger: problemConclusionEl.value,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(problemConclusionEl.value!, { y: '0%', duration: 1.0, ease: 'power3.out' })
      }
    })
  }
}

function setupSewa() {
  if (!sewaEl.value) return

  if (sewaHeadEl.value) gsap.set(sewaHeadEl.value, { opacity: 0, y: 40 })
  if (sewaBodyEl.value) gsap.set(sewaBodyEl.value, { opacity: 0, y: 30 })
  if (sewaPunchEl.value) gsap.set(sewaPunchEl.value, { y: '100%' })
  if (sewaGifEl.value) gsap.set(sewaGifEl.value, { opacity: 0, y: 50, rotate: 4 })

  ScrollTrigger.create({
    trigger: sewaEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      if (sewaHeadEl.value) gsap.to(sewaHeadEl.value, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' })
      if (sewaBodyEl.value) gsap.to(sewaBodyEl.value, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 })
      if (sewaPunchEl.value) gsap.to(sewaPunchEl.value, { y: '0%', duration: 1.0, ease: 'power3.out', delay: 0.4 })
      if (sewaGifEl.value) gsap.to(sewaGifEl.value, { opacity: 1, y: 0, rotate: 4, duration: 1.4, ease: 'power3.out', delay: 0.55 })
    }
  })
}

function setupPhilosophy(SplitType: any) {
  if (!philoEl.value || !philoRefs.value.length) return

  const splits = philoRefs.value.map((el: HTMLElement) => new SplitType(el, { types: 'chars' }))
  splits.forEach((s: any) => {
    if (s.chars) gsap.set(s.chars, { opacity: 0, filter: 'blur(8px)', y: -10 })
  })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: philoEl.value,
      start: 'top top',
      end: '+=450%',
      pin: true,
      scrub: 1.5,
    }
  })

  const step = 1 / philosophySentences.length
  philosophySentences.forEach((_, i) => {
    const inStart = i * step
    const holdEnd = inStart + step * 0.65

    tl.to(splits[i].chars!, { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.02, ease: 'power2.out' }, inStart)

    if (i < philosophySentences.length - 1) {
      tl.to(splits[i].chars!, { opacity: 0, filter: 'blur(8px)', y: -10, stagger: 0.015, ease: 'power2.in' }, holdEnd)
    }
  })
}

function setupNow() {
  if (!nowEl.value) return

  if (nowHeadEl.value) gsap.set(nowHeadEl.value, { y: '100%' })
  if (nowBodyEl.value) gsap.set(nowBodyEl.value, { y: '100%' })

  ScrollTrigger.create({
    trigger: nowEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      if (nowHeadEl.value) gsap.to(nowHeadEl.value, { y: '0%', duration: 1.1, ease: 'power3.out' })
      if (nowBodyEl.value) gsap.to(nowBodyEl.value, { y: '0%', duration: 1.0, ease: 'power3.out', delay: 0.15 })
    }
  })
}

function setupFinal(SplitType: any) {
  if (!finalEl.value || !finalLine1El.value || !finalLine2El.value) return

  const split1 = new SplitType(finalLine1El.value, { types: 'chars' })
  const split2 = new SplitType(finalLine2El.value, { types: 'chars' })

  gsap.set([...(split1.chars ?? []), ...(split2.chars ?? [])], { opacity: 0, scale: 0.7, filter: 'blur(16px)' })
  if (finalBodyEl.value) gsap.set(finalBodyEl.value, { opacity: 0, y: 30 })
  if (finalSigEl.value) gsap.set(finalSigEl.value, { opacity: 0 })
  if (finalCtaEl.value) gsap.set(finalCtaEl.value, { opacity: 0, y: 20 })

  ScrollTrigger.create({
    trigger: finalEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(split1.chars!, { opacity: 1, scale: 1, filter: 'blur(0px)', stagger: 0.04, duration: 0.8, ease: 'power3.out' })
      tl.to(split2.chars!, { opacity: 1, scale: 1, filter: 'blur(0px)', textShadow: '0 0 30px rgba(240,240,238,0.3)', stagger: 0.04, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      if (finalBodyEl.value) tl.to(finalBodyEl.value, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      if (finalSigEl.value) tl.to(finalSigEl.value, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.2')
      if (finalCtaEl.value) tl.to(finalCtaEl.value, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.1')
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
.display-xl {
  font-size: clamp(80rem, 12vw, 240rem);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.03em;
}
.display-lg {
  font-size: clamp(48rem, 7vw, 140rem);
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -0.025em;
}
.body-lg {
  font-size: clamp(16rem, 1.8vw, 24rem);
  font-weight: 400;
  line-height: 1.65;
}
.label {
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  opacity: 0.45;
}

/* ─── GIF FRAMES — polaroid-style ─── */
.gif-frame {
  display: inline-flex;
  flex-direction: column;
  gap: 0;
  background: #f5f0e8;
  padding: 10rem 10rem 38rem;
  box-shadow: 0 28px 80px rgba(0,0,0,0.7), 0 6px 20px rgba(0,0,0,0.35);
  position: relative;
  will-change: transform;
}
.gif-img {
  display: block;
  width: 100%;
  height: auto;
  max-width: 260rem;
}
.gif-frame--lg .gif-img { max-width: 320rem; }
.gif-caption {
  position: absolute;
  bottom: 10rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10rem;
  font-family: 'Courier New', monospace;
  color: #888;
  letter-spacing: 0.02em;
}

/* Problem GIF is absolutely positioned top-right */
.gif-frame--problem {
  position: absolute;
  top: clamp(40rem, 5vw, 80rem);
  right: clamp(40rem, 6vw, 120rem);
  z-index: 2;
}
.gif-frame--problem .gif-img { max-width: 220rem; }

/* ─── OPENING ─── */
.opening {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(60rem, 10vw, 160rem);
  background: #0A0A0A;
}
.opening-inner { text-align: center; }
.opening-text {
  font-size: clamp(18rem, 2.2vw, 32rem);
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.01em;
  color: rgba(240,240,238,0.7);
}
.opening-text--b {
  margin-top: 0.4em;
  color: #F0F0EE;
  font-weight: 600;
}
.sticks-word { color: #F0F0EE; }

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
  font-size: clamp(64rem, 13vw, 220rem);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.04em;
  white-space: nowrap;
}
.name-caption {
  margin-top: 32rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
  font-size: clamp(12rem, 1.3vw, 18rem);
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}
.name-caption--b { margin-top: 80rem; }

/* ─── ORIGIN ─── */
.s-origin {
  padding: clamp(100rem, 12vw, 200rem) clamp(40rem, 8vw, 160rem);
}
.origin-inner {
  max-width: 1400rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(60rem, 8vw, 120rem);
  align-items: center;
}
.origin-head {
  margin-bottom: clamp(32rem, 4vw, 56rem);
}
.origin-body {
  margin-bottom: clamp(20rem, 2.5vw, 32rem);
}
.origin-body:last-child { margin-bottom: 0; }
.origin-body em { font-style: italic; }
.origin-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ─── PROBLEM ─── */
.s-problem {
  position: relative;
  padding: clamp(120rem, 15vw, 240rem) clamp(40rem, 8vw, 160rem);
}
.problem-inner {
  max-width: 900rem;
}
.problem-head { margin-bottom: clamp(60rem, 8vw, 120rem); }
.problem-stats { margin-bottom: clamp(80rem, 10vw, 140rem); }
.stat-line {
  font-size: clamp(32rem, 4.5vw, 80rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  border-bottom: 1rem solid rgba(240,240,238,0.1);
  padding: 16rem 0;
}
.stat-line--whisper {
  opacity: 0.35;
  font-weight: 400;
  font-size: clamp(18rem, 2.2vw, 36rem);
  font-style: italic;
}
.problem-mask-wrap { overflow: hidden; }
.problem-conclusion {
  max-width: 680rem;
  font-style: italic;
  opacity: 0.75;
}

/* ─── SEWA ─── */
.s-sewa {
  padding: clamp(100rem, 12vw, 200rem) clamp(40rem, 8vw, 160rem);
  background: rgba(240,240,238,0.018);
}
.sewa-inner {
  max-width: 1400rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(60rem, 8vw, 120rem);
  align-items: center;
}
.sewa-label { display: block; margin-bottom: 20rem; }
.sewa-head { margin-bottom: clamp(28rem, 3.5vw, 48rem); }
.sewa-body {
  margin-bottom: clamp(28rem, 3.5vw, 48rem);
  max-width: 580rem;
}
.sewa-body em { font-style: italic; }
.sewa-punch-wrap { overflow: hidden; }
.sewa-punch {
  font-size: clamp(17rem, 1.9vw, 26rem);
  font-weight: 600;
  font-style: italic;
  opacity: 0.7;
  border-left: 3rem solid rgba(240,240,238,0.35);
  padding-left: 20rem;
  line-height: 1.45;
}
.sewa-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ─── PHILOSOPHY ─── */
.s-philosophy {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(60rem, 8vw, 120rem);
}
.philo-inner {
  width: 100%;
  max-width: 1100rem;
  margin: 0 auto;
}
.philo-slot {
  position: relative;
  text-align: center;
  min-height: 1.2em;
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
.philo-line:first-child {
  position: relative;
  visibility: hidden;
}

/* ─── NOW ─── */
.s-now {
  padding: clamp(100rem, 12vw, 200rem) clamp(40rem, 8vw, 160rem);
}
.now-inner {
  max-width: 1400rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(60rem, 8vw, 140rem);
  align-items: center;
}
.now-label { display: block; margin-bottom: 24rem; }
.now-head-wrap { overflow: hidden; margin-bottom: clamp(24rem, 3vw, 40rem); }
.now-body-wrap { overflow: hidden; }
.now-photo {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  object-position: top center;
  filter: grayscale(1) contrast(1.05);
  display: block;
}

/* ─── FINAL ─── */
.s-final {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(60rem, 8vw, 120rem);
}
.final-inner {
  max-width: 1200rem;
  width: 100%;
  margin: 0 auto;
}
.final-head-block { margin-bottom: clamp(48rem, 6vw, 100rem); }
.final-line { display: block; }
.final-care {
  color: transparent;
  -webkit-text-stroke: 2rem rgba(240,240,238,0.85);
}
.final-body {
  margin-bottom: clamp(48rem, 6vw, 80rem);
  opacity: 0.7;
}
.final-sig {
  display: flex;
  flex-direction: column;
  gap: 6rem;
  margin-bottom: clamp(48rem, 6vw, 80rem);
  font-size: clamp(13rem, 1.4vw, 17rem);
  opacity: 0.4;
  font-weight: 400;
}
.final-cta-wrap { display: inline-block; }
.final-cta {
  display: inline-block;
  font-size: clamp(14rem, 1.5vw, 20rem);
  font-weight: 500;
  border: 1rem solid rgba(240,240,238,0.35);
  padding: 16rem 36rem;
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
  .sewa-inner    { grid-template-columns: 1fr; }
  .now-inner     { grid-template-columns: 1fr; }
  .now-right     { order: -1; }
  .now-photo     { aspect-ratio: 4/3; }
  .name-display  { font-size: clamp(44rem, 13vw, 100rem); }
  .philo-line    { white-space: normal; }
  .gif-frame--problem {
    position: static;
    margin-bottom: clamp(32rem, 5vw, 56rem);
    display: flex;
  }
  .gif-frame--problem .gif-img { max-width: 200rem; }
}
</style>
