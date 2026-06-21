<template>
  <div class="about-page">
    <div class="grain" aria-hidden="true" />

    <!-- OPENING -->
    <section ref="openingEl" class="opening">
      <div class="opening-inner">
        <p ref="opening1El" class="opening-text">Most people teach information.</p>
        <p ref="opening2El" class="opening-text opening-text--b">I teach what people <span ref="rememberEl" class="remember-word">remember</span>.</p>
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
          <span>Professional curiosity collector.</span>
        </div>
      </div>
    </section>

    <!-- THE PROBLEM -->
    <section ref="problemEl" class="s-problem">
      <div class="problem-inner">
        <h2 ref="problemHeadEl" class="problem-head display-lg">Most training<br>is forgotten.</h2>
        <div ref="statsEl" class="problem-stats">
          <p class="stat-line">People click.</p>
          <p class="stat-line">People pass.</p>
          <p class="stat-line">People forget.</p>
        </div>
        <div class="problem-mask-wrap">
          <p ref="problemConclusionEl" class="problem-conclusion body-lg">But learning was never supposed to feel like paperwork.</p>
        </div>
      </div>
    </section>

    <!-- ORIGIN STORY -->
    <section ref="originEl" class="s-origin">
      <div class="origin-inner">
        <div class="origin-left">
          <h2 ref="originHeadEl" class="display-lg origin-head">It started in<br>hospitality.</h2>
        </div>
        <div class="origin-right">
          <p ref="originBodyEl" class="body-lg origin-body">I spent years managing hotels — rooms, teams, guests, crises. Every day was a masterclass in human behavior. I learned that people don't follow procedures because they're told to. They follow them because they understand why.</p>
          <p ref="originBody2El" class="body-lg origin-body">When I moved into learning design, I brought that obsession with me. Not content. Not compliance. Behavior change.</p>
          <p ref="originBody3El" class="body-lg origin-body">That's the thread that runs through everything I build.</p>
        </div>
      </div>
    </section>

    <!-- TRANSFORMATION — horizontal scroll -->
    <section ref="transformEl" class="s-transform">
      <div ref="transformRailEl" class="transform-rail">
        <div class="transform-panel tp-from">
          <span class="tp-label label">The shift</span>
          <span class="tp-word display-xl">FROM</span>
        </div>
        <div class="transform-panel tp-middle">
          <span class="tp-service display-xl">SERVICE</span>
          <span class="tp-arrow display-xl">→</span>
          <span class="tp-to display-xl">TO</span>
        </div>
        <div class="transform-panel tp-stories">
          <span class="tp-word display-xl">STORIES</span>
        </div>
        <div class="transform-panel tp-list">
          <span class="label">Transforming</span>
          <ul class="transform-list">
            <li ref="tl1El">Policies</li>
            <li ref="tl2El">Processes</li>
            <li ref="tl3El">Systems</li>
            <li ref="tl4El">Data</li>
          </ul>
          <span class="transform-list-tail body-lg">into experiences people actually remember.</span>
        </div>
      </div>
    </section>

    <!-- THE WORK -->
    <section ref="workEl" class="s-work">
      <div class="work-morph">
        <p ref="morphAEl" class="morph-text display-xl">I DON'T BUILD<br>COURSES.</p>
        <p ref="morphBEl" class="morph-text display-xl">I BUILD<br>BEHAVIOR.</p>
      </div>
    </section>

    <!-- KEYWORDS -->
    <section class="s-keywords">
      <div ref="keywordsEl" class="keywords-field">
        <span
          v-for="(kw, i) in keywords"
          :key="kw.label"
          :ref="(el) => { if (el) kwRefs[i] = el as HTMLElement }"
          class="kw-pill"
          :style="`--kx: ${kw.x}%; --ky: ${kw.y}%; --kr: ${kw.rot}deg; --kd: ${kw.dur}s;`"
        >{{ kw.label }}</span>
      </div>
    </section>

    <!-- SEWA CHRONICLES -->
    <section ref="sewaEl" class="s-sewa">
      <div class="sewa-inner">
        <div class="sewa-header">
          <h2 class="display-lg sewa-title">The Sewa Chronicles</h2>
          <p class="body-lg sewa-sub">A passion project. A life lesson in disguise.</p>
        </div>
        <div class="sewa-panels">
          <div ref="sewaP1El" class="sewa-panel">
            <span class="sp-issue label">Chapter 01</span>
            <p class="sp-head">The School That Forgot to Teach</p>
            <p class="sp-body">When NGO training became a design challenge.</p>
          </div>
          <div ref="sewaP2El" class="sewa-panel">
            <span class="sp-issue label">Chapter 02</span>
            <p class="sp-head">500 Volunteers. Zero Manuals.</p>
            <p class="sp-body">Building learning from the ground up — in the field.</p>
          </div>
          <div ref="sewaP3El" class="sewa-panel">
            <span class="sp-issue label">Chapter 03</span>
            <p class="sp-head">What Stories Can Do</p>
            <p class="sp-body">When the curriculum became the community.</p>
          </div>
        </div>
        <div class="sewa-caption-wrap">
          <p ref="sewaCaptionEl" class="body-lg sewa-caption">Because stories teach better than manuals.</p>
        </div>
      </div>
    </section>

    <!-- PHILOSOPHY -->
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
            <h2 ref="nowHeadEl" class="display-lg now-head">Building learning experiences at Concentrix.</h2>
          </div>
          <div class="now-body-wrap">
            <p ref="nowBodyEl" class="body-lg now-body">Transforming complex operational knowledge into interactive digital learning experiences for global teams.</p>
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
          <span>Instructional Designer</span>
          <span>Learning Architect</span>
          <span>Narrative Builder</span>
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

const openingEl = ref<HTMLElement>()
const opening1El = ref<HTMLElement>()
const opening2El = ref<HTMLElement>()
const rememberEl = ref<HTMLElement>()
const nameEl = ref<HTMLElement>()
const nameTextEl = ref<HTMLElement>()
const nameCaptionAEl = ref<HTMLElement>()
const nameCaptionBEl = ref<HTMLElement>()
const problemEl = ref<HTMLElement>()
const problemHeadEl = ref<HTMLElement>()
const statsEl = ref<HTMLElement>()
const problemConclusionEl = ref<HTMLElement>()
const originEl = ref<HTMLElement>()
const originHeadEl = ref<HTMLElement>()
const originBodyEl = ref<HTMLElement>()
const originBody2El = ref<HTMLElement>()
const originBody3El = ref<HTMLElement>()
const transformEl = ref<HTMLElement>()
const transformRailEl = ref<HTMLElement>()
const tl1El = ref<HTMLElement>()
const tl2El = ref<HTMLElement>()
const tl3El = ref<HTMLElement>()
const tl4El = ref<HTMLElement>()
const workEl = ref<HTMLElement>()
const morphAEl = ref<HTMLElement>()
const morphBEl = ref<HTMLElement>()
const keywordsEl = ref<HTMLElement>()
const kwRefs = ref<HTMLElement[]>([])
const sewaEl = ref<HTMLElement>()
const sewaP1El = ref<HTMLElement>()
const sewaP2El = ref<HTMLElement>()
const sewaP3El = ref<HTMLElement>()
const sewaCaptionEl = ref<HTMLElement>()
const philoEl = ref<HTMLElement>()
const philoSlotEl = ref<HTMLElement>()
const philoRefs = ref<HTMLElement[]>([])
const nowEl = ref<HTMLElement>()
const nowHeadEl = ref<HTMLElement>()
const nowBodyEl = ref<HTMLElement>()
const finalEl = ref<HTMLElement>()
const finalLine1El = ref<HTMLElement>()
const finalLine2El = ref<HTMLElement>()
const finalBodyEl = ref<HTMLElement>()
const finalSigEl = ref<HTMLElement>()
const finalCtaEl = ref<HTMLElement>()

const keywords = [
  { label: 'Storyline 360', x: 8,  y: 12, rot: -3,  dur: 6.2 },
  { label: 'SCORM',         x: 28, y: 6,  rot: 2,   dur: 5.1 },
  { label: 'Vyond',         x: 55, y: 18, rot: -1,  dur: 7.0 },
  { label: 'After Effects', x: 72, y: 8,  rot: 3,   dur: 5.8 },
  { label: 'Canva',         x: 88, y: 22, rot: -2,  dur: 6.5 },
  { label: 'Adult Learning', x: 15, y: 55, rot: 1,  dur: 4.9 },
  { label: 'Storyboarding', x: 42, y: 62, rot: -4,  dur: 7.3 },
  { label: 'Microlearning', x: 65, y: 50, rot: 2,   dur: 5.5 },
  { label: 'Exp. Design',   x: 82, y: 68, rot: -1,  dur: 6.8 },
]

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
  setupProblem(SplitType)
  setupOrigin()
  setupTransform()
  setupWork(SplitType)
  setupKeywords()
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

  tl.to(split1.chars, {
    opacity: 1, y: 0, filter: 'blur(0px)',
    stagger: 0.03, ease: 'power2.out',
  }, 0)

  tl.to(split1.chars, {
    opacity: 0, y: -12,
    stagger: 0.015, ease: 'power2.in',
  }, 0.5)

  tl.to(split2.chars, {
    opacity: 1, y: 0, filter: 'blur(0px)',
    stagger: 0.025, ease: 'power2.out',
  }, 0.55)

  const rememberNode = rememberEl.value
  if (rememberNode && split2.chars) {
    const rememberChars = split2.chars.filter((c: HTMLElement) => rememberNode.contains(c))
    if (rememberChars.length) {
      tl.to(rememberChars, {
        x: (i: number) => (i - rememberChars.length / 2) * 6,
        scaleY: 1.08,
        filter: 'blur(1px)',
        textShadow: '0 0 18px rgba(240,240,238,0.55)',
        stagger: 0.04,
        ease: 'power1.out',
      }, 0.82)
      tl.to(rememberChars, {
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

  tl.to(split.chars, {
    x: (i: number) => xs[i],
    opacity: 0.08,
    stagger: 0.04,
    ease: 'power2.inOut',
  }, 0)

  tl.to(nameCaptionAEl.value!, { opacity: 1, y: 0, ease: 'power2.out' }, 0.45)
  tl.to(nameCaptionAEl.value!, { opacity: 0, y: -10, ease: 'power2.in' }, 0.7)
  tl.to(nameCaptionBEl.value!, { opacity: 1, y: 0, ease: 'power2.out' }, 0.72)
}

function setupProblem(SplitType: any) {
  if (!problemEl.value || !problemHeadEl.value || !statsEl.value) return

  const splitHead = new SplitType(problemHeadEl.value, { types: 'words' })
  gsap.set(splitHead.words, { opacity: 0, y: 60 })

  ScrollTrigger.create({
    trigger: problemEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      gsap.to(splitHead.words, {
        opacity: 1, y: 0,
        stagger: 0.07, duration: 0.9, ease: 'power3.out',
      })
    }
  })

  const statLines = statsEl.value.querySelectorAll('.stat-line')
  gsap.set(statLines, { opacity: 0, x: -40 })
  ScrollTrigger.create({
    trigger: statsEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      gsap.to(statLines, {
        opacity: 1, x: 0,
        stagger: 0.12, duration: 0.7, ease: 'power3.out',
      })
    }
  })

  if (problemConclusionEl.value) {
    gsap.set(problemConclusionEl.value, { y: '100%' })
    ScrollTrigger.create({
      trigger: problemConclusionEl.value,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(problemConclusionEl.value!, {
          y: '0%', duration: 1.0, ease: 'power3.out',
        })
      }
    })
  }
}

function setupOrigin() {
  if (!originEl.value || !originHeadEl.value) return

  const lines = originEl.value.querySelectorAll('.origin-body')
  gsap.set(originHeadEl.value, { opacity: 0, y: 40 })
  gsap.set(lines, { opacity: 0, y: 30 })

  ScrollTrigger.create({
    trigger: originEl.value,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      gsap.to(originHeadEl.value!, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' })
      gsap.to(lines, { opacity: 1, y: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out', delay: 0.2 })
    }
  })
}

function setupTransform() {
  if (!transformEl.value || !transformRailEl.value) return

  const rail = transformRailEl.value

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: transformEl.value,
      start: 'top top',
      end: () => `+=${rail.scrollWidth - window.innerWidth + 200}`,
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }
  })

  tl.to(rail, {
    x: () => -(rail.scrollWidth - window.innerWidth),
    ease: 'none',
  })

  const listItems = [tl1El.value, tl2El.value, tl3El.value, tl4El.value].filter(Boolean) as HTMLElement[]
  gsap.set(listItems, { opacity: 0, y: 30 })
  ScrollTrigger.create({
    trigger: tl4El.value,
    containerAnimation: tl,
    start: 'left 80%',
    once: true,
    onEnter: () => {
      gsap.to(listItems, { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' })
    }
  })
}

function setupWork(SplitType: any) {
  if (!workEl.value || !morphAEl.value || !morphBEl.value) return

  const splitA = new SplitType(morphAEl.value, { types: 'chars' })
  const splitB = new SplitType(morphBEl.value, { types: 'chars' })

  gsap.set(splitB.chars, { opacity: 0, filter: 'blur(12px)', y: 10 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: workEl.value,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 1.2,
    }
  })

  tl.to(splitA.chars, {
    opacity: 0, filter: 'blur(12px)', y: -10,
    stagger: 0.02, ease: 'power2.in',
  }, 0.35)

  tl.to(splitB.chars, {
    opacity: 1, filter: 'blur(0px)', y: 0,
    stagger: 0.025, ease: 'power2.out',
  }, 0.5)
}

function setupKeywords() {
  if (!kwRefs.value.length) return

  kwRefs.value.forEach((el) => {
    if (!el) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })

    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      xTo((e.clientX - (rect.left + rect.width / 2)) * 0.35)
      yTo((e.clientY - (rect.top + rect.height / 2)) * 0.35)
    })
    el.addEventListener('mouseleave', () => {
      xTo(0)
      yTo(0)
    })

    gsap.set(el, { opacity: 0, scale: 0.85 })
  })

  if (!keywordsEl.value) return
  ScrollTrigger.create({
    trigger: keywordsEl.value,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to(kwRefs.value, {
        opacity: 1, scale: 1,
        stagger: 0.07, duration: 0.8, ease: 'power3.out',
      })
    }
  })
}

function setupSewa() {
  if (!sewaEl.value) return

  const panels = [sewaP1El.value, sewaP2El.value, sewaP3El.value]
  const froms = [
    { x: -60, y: 0, opacity: 0 },
    { x: 0, y: 40, opacity: 0 },
    { x: 60, y: 0, opacity: 0 },
  ]

  panels.forEach((p, i) => {
    if (!p) return
    gsap.set(p, froms[i])
  })

  ScrollTrigger.create({
    trigger: sewaEl.value,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      panels.forEach((p, i) => {
        if (!p) return
        gsap.to(p, {
          x: 0, y: 0, opacity: 1,
          duration: 1.0, ease: 'power3.out',
          delay: i * 0.15,
        })
      })
    }
  })

  if (sewaCaptionEl.value) {
    gsap.set(sewaCaptionEl.value, { y: '100%' })
    ScrollTrigger.create({
      trigger: sewaCaptionEl.value,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(sewaCaptionEl.value!, { y: '0%', duration: 1.0, ease: 'power3.out' })
      }
    })
  }
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

    tl.to(splits[i].chars!, {
      opacity: 1, filter: 'blur(0px)', y: 0,
      stagger: 0.02, ease: 'power2.out',
    }, inStart)

    if (i < philosophySentences.length - 1) {
      tl.to(splits[i].chars!, {
        opacity: 0, filter: 'blur(8px)', y: -10,
        stagger: 0.015, ease: 'power2.in',
      }, holdEnd)
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
      tl.to(split1.chars!, {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        stagger: 0.04, duration: 0.8, ease: 'power3.out',
      })
      tl.to(split2.chars!, {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        textShadow: '0 0 30px rgba(240,240,238,0.3)',
        stagger: 0.04, duration: 0.8, ease: 'power3.out',
      }, '-=0.4')
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
.remember-word { color: #F0F0EE; }

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

/* ─── PROBLEM ─── */
.s-problem {
  padding: clamp(120rem, 15vw, 240rem) clamp(40rem, 8vw, 160rem);
}
.problem-inner { max-width: 1200rem; margin: 0 auto; }
.problem-head { margin-bottom: clamp(60rem, 8vw, 120rem); }
.problem-stats { margin-bottom: clamp(80rem, 10vw, 160rem); }
.stat-line {
  font-size: clamp(32rem, 4.5vw, 80rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  border-bottom: 1rem solid rgba(240,240,238,0.1);
  padding: 16rem 0;
}
.problem-mask-wrap { overflow: hidden; }
.problem-conclusion { max-width: 720rem; }

/* ─── ORIGIN ─── */
.s-origin {
  padding: clamp(100rem, 12vw, 200rem) clamp(40rem, 8vw, 160rem);
}
.origin-inner {
  max-width: 1400rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(60rem, 8vw, 160rem);
  align-items: start;
}
.origin-head { position: sticky; top: clamp(80rem, 10vw, 160rem); }
.origin-body { margin-bottom: clamp(24rem, 3vw, 40rem); }
.origin-body:last-child { margin-bottom: 0; }

/* ─── TRANSFORM ─── */
.s-transform {
  min-height: 100svh;
  overflow: hidden;
}
.transform-rail {
  display: flex;
  align-items: center;
  width: max-content;
  height: 100svh;
}
.transform-panel {
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: clamp(40rem, 6vw, 100rem);
}
.tp-label { margin-bottom: 32rem; }
.tp-word, .tp-service, .tp-to {
  font-size: clamp(72rem, 12vw, 220rem);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.04em;
}
.tp-middle {
  flex-direction: row;
  gap: clamp(28rem, 3.5vw, 70rem);
  align-items: center;
}
.tp-arrow {
  font-size: clamp(40rem, 6vw, 100rem);
  font-weight: 300;
  opacity: 0.4;
}
.transform-list {
  list-style: none;
  padding: 0;
  margin: 24rem 0 32rem;
}
.transform-list li {
  font-size: clamp(36rem, 5vw, 90rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  border-bottom: 1rem solid rgba(240,240,238,0.12);
  padding: 12rem 0;
}
.transform-list-tail {
  opacity: 0.5;
  max-width: 480rem;
}
.tp-list { align-items: flex-start; }

/* ─── WORK ─── */
.s-work {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(60rem, 8vw, 120rem);
}
.work-morph {
  position: relative;
  text-align: center;
  width: 100%;
}
.morph-text {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}
.morph-text:last-child {
  position: absolute;
  inset: 0;
}

/* ─── KEYWORDS ─── */
.s-keywords {
  min-height: 80svh;
  position: relative;
  padding: clamp(60rem, 8vw, 120rem) clamp(40rem, 6vw, 100rem);
}
.keywords-field {
  position: relative;
  height: 60svh;
  min-height: 400rem;
}
.kw-pill {
  position: absolute;
  left: var(--kx);
  top: var(--ky);
  transform: rotate(var(--kr)) translate(-50%, -50%);
  font-size: clamp(13rem, 1.4vw, 19rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  border: 1rem solid rgba(240,240,238,0.22);
  padding: 10rem 20rem;
  border-radius: 999rem;
  cursor: default;
  white-space: nowrap;
  animation: float var(--kd) ease-in-out infinite alternate;
  user-select: none;
}
@keyframes float {
  from { transform: rotate(var(--kr)) translate(-50%, -50%) translateY(0); }
  to   { transform: rotate(var(--kr)) translate(-50%, -50%) translateY(-12rem); }
}

/* ─── SEWA ─── */
.s-sewa {
  padding: clamp(100rem, 12vw, 200rem) clamp(40rem, 8vw, 160rem);
}
.sewa-inner { max-width: 1400rem; margin: 0 auto; }
.sewa-header { margin-bottom: clamp(60rem, 8vw, 120rem); }
.sewa-title { margin-bottom: 16rem; }
.sewa-sub { opacity: 0.55; }
.sewa-panels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(16rem, 2vw, 32rem);
  margin-bottom: clamp(60rem, 8vw, 100rem);
}
.sewa-panel {
  border: 2rem solid rgba(240,240,238,0.2);
  padding: clamp(32rem, 4vw, 60rem);
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: rgba(240,240,238,0.02);
}
.sp-issue { margin-bottom: 24rem; display: block; }
.sp-head {
  font-size: clamp(18rem, 2vw, 28rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 12rem;
}
.sp-body {
  font-size: clamp(13rem, 1.3vw, 16rem);
  opacity: 0.55;
  line-height: 1.55;
}
.sewa-caption-wrap { overflow: hidden; }
.sewa-caption { font-style: italic; opacity: 0.65; }

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
  gap: 4rem;
  margin-bottom: clamp(48rem, 6vw, 80rem);
  font-size: clamp(13rem, 1.4vw, 17rem);
  opacity: 0.45;
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
  .origin-inner { grid-template-columns: 1fr; gap: clamp(40rem, 8vw, 80rem); }
  .origin-head { position: static; }
  .now-inner { grid-template-columns: 1fr; }
  .now-right { order: -1; }
  .now-photo { aspect-ratio: 4/3; }
  .sewa-panels { grid-template-columns: 1fr; }
  .sewa-panel { aspect-ratio: auto; min-height: 280rem; }
  .name-display { font-size: clamp(44rem, 13vw, 100rem); }
  .philo-line { white-space: normal; }
  .tp-middle { flex-wrap: wrap; justify-content: center; }
}
</style>
