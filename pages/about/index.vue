<script setup lang="ts">
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

definePageMeta({ layout: false, pageTransition: { name: 'abx-fade', mode: 'out-in' } })
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'Naveen Jose, a certified instructional designer: from a hospitality floor into L&D at Club Mahindra, Marriott, and now Concentrix.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'A certified instructional designer. The short story of how I got into designing learning.',
  ogUrl: 'https://entertrainer.in/about'
})
useHead({
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap' }]
})

interface Chapter {
  n: string; eyebrow: string; head: string; body: string
  img: string; alt: string; place: string; role: string; footnote?: string
}
const CHAPTERS: Chapter[] = [
  { n: '02', eyebrow: 'Where it began', head: 'It started\non the floor',
    body: 'I studied hotel management in Chennai and began in hospitality. That floor is where I learned to notice the small things that make service feel human — the details nobody asks for but everybody remembers.',
    img: '/about/about-housekeeper-1.webp', alt: 'On the hotel floor in the early hospitality years', place: 'Chennai', role: 'Hotel Management' },
  { n: '03', eyebrow: 'The turn', head: 'A comic,\na new path',
    body: 'At Club Mahindra I moved into learning and development, and drew The SEWA Chronicles — a small comic of real guest-experience stories. That was the moment design stopped being a side interest and became the plan.',
    img: '/about/about-sewa-1.webp', alt: 'A page from The SEWA Chronicles comic', place: 'Club Mahindra', role: 'L&D' },
  { n: '04', eyebrow: 'The craft', head: 'Learning\nthe craft',
    body: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams — from frontline associates all the way through to managers. I learned how a good program actually holds together.',
    img: '/about/about-onboarding.webp', alt: 'Running a training session at Courtyard by Marriott', place: 'Marriott', role: 'L&D Specialist' },
  { n: '05', eyebrow: 'The tools', head: 'Building\nthe modules',
    body: 'I build training in Articulate Storyline, with a little video and animation along the way. The aim is simple: make each module something people actually want to finish, not something they endure.',
    img: '/about/about-ignite.webp', alt: 'A module in progress on the workbench', place: 'The Workbench', role: 'Storyline · Motion' },
  { n: '06', eyebrow: 'Now', head: 'Where I\nam today',
    body: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world — still chasing the same thing I noticed on the hotel floor all those years ago.',
    img: '/about/about-concentrix.webp', alt: 'Portrait, present day, at Concentrix', place: 'Concentrix', role: 'Training-as-a-Service',
    footnote: 'Asatoma Sadgamaya — from ignorance, toward truth.' }
]
const MARQUEE = ['Certified Instructional Designer', 'Hospitality → L&D', 'Club Mahindra', 'Courtyard by Marriott', 'Concentrix', 'Gurugram, IN']

const root   = ref<HTMLElement | null>(null)
const cursor = ref<HTMLElement | null>(null)
const velWrap = ref<HTMLElement | null>(null)
let reduce = false
let ctx: gsap.Context | null = null
const { $lenis } = useNuxtApp() as unknown as { $lenis?: { on: Function; off: Function; scrollTo: Function } }

// ── Text scramble / decode ─────────────────────────────────────────
const GLYPHS = '<>/\\[]{}=+*—#%_:;·▚▞░▓█'
class Scramble {
  el: HTMLElement; chars = GLYPHS; frameReq = 0; frame = 0
  queue: { from: string; to: string; start: number; end: number; char?: string }[] = []
  resolve: (() => void) | null = null
  constructor(el: HTMLElement) { this.el = el; this.update = this.update.bind(this) }
  run(text: string, speed = 1) {
    const old = this.el.textContent || ''
    const len = Math.max(old.length, text.length)
    this.queue = []
    for (let i = 0; i < len; i++) {
      const from = old[i] || ''
      const to = text[i] || ''
      const start = Math.floor(Math.random() * 26 / speed)
      const end = start + Math.floor(Math.random() * 26 / speed) + 6
      this.queue.push({ from, to, start, end })
    }
    cancelAnimationFrame(this.frameReq); this.frame = 0
    return new Promise<void>((res) => { this.resolve = res; this.update() })
  }
  update() {
    let out = '', done = 0
    for (const q of this.queue) {
      if (this.frame >= q.end) { done++; out += q.to }
      else if (this.frame >= q.start) {
        if (!q.char || Math.random() < 0.3) q.char = this.chars[(Math.random() * this.chars.length) | 0]
        out += `<span class="abx__dud">${q.char}</span>`
      } else out += q.from
    }
    this.el.innerHTML = out
    if (done === this.queue.length) this.resolve?.()
    else { this.frameReq = requestAnimationFrame(this.update); this.frame++ }
  }
}
const scramblers = new WeakMap<HTMLElement, Scramble>()
function scramble(el: HTMLElement, speed = 1) {
  const text = el.dataset.text ?? el.textContent ?? ''
  if (reduce) { el.textContent = text; return }
  let s = scramblers.get(el)
  if (!s) { s = new Scramble(el); scramblers.set(el, s) }
  s.run(text, speed)
}

// ── Scroll-velocity marquee skew ───────────────────────────────────
let vel = 0, velRAF = 0
function onLenisScroll(e: { velocity?: number }) {
  ScrollTrigger.update()
  vel = e.velocity ?? 0
  if (!velRAF) velRAF = requestAnimationFrame(applyVel)
}
function applyVel() {
  velRAF = 0
  if (reduce) return
  const sk = gsap.utils.clamp(-8, 8, vel * 0.6)
  if (velWrap.value) velWrap.value.style.setProperty('--sk', sk.toFixed(2) + 'deg')
}

function jumpTo(i: number) {
  const target = i <= 0
    ? root.value?.querySelector<HTMLElement>('.abx__hero')
    : root.value?.querySelectorAll<HTMLElement>('.abx__ch')[i - 1]
  if (!target) return
  if ($lenis?.scrollTo) $lenis.scrollTo(target, { offset: -40, duration: 0.9 })
  else target.scrollIntoView({ behavior: 'smooth' })
}

onMounted(async () => {
  reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  await nextTick()
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
  $lenis?.on('scroll', onLenisScroll)

  // Hover-scramble on marked elements (mouse only; SR keeps data-text as name)
  const scramEls = Array.from(root.value!.querySelectorAll<HTMLElement>('.abx__scram'))
  scramEls.forEach((el) => {
    if (!el.dataset.text) el.dataset.text = el.textContent || ''
    el.addEventListener('pointerenter', (e) => { if ((e as PointerEvent).pointerType === 'mouse') scramble(el, 1.6) })
  })

  // Custom acid cursor (fine pointers only)
  const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
  if (fine && !reduce && cursor.value) {
    root.value!.classList.add('cursor-on')
    const xTo = gsap.quickTo(cursor.value, 'x', { duration: 0.18, ease: 'power3' })
    const yTo = gsap.quickTo(cursor.value, 'y', { duration: 0.18, ease: 'power3' })
    const move = (e: PointerEvent) => { xTo(e.clientX); yTo(e.clientY) }
    const over = (e: PointerEvent) => {
      cursor.value!.classList.toggle('is-link', !!(e.target as HTMLElement)?.closest?.('a,button'))
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
  }

  if (reduce) { ScrollTrigger.refresh(); return }

  ctx = gsap.context(() => {
    // Hero decode-in
    const heroLines = gsap.utils.toArray<HTMLElement>('.abx__name')
    gsap.timeline()
      .from('.abx__kick > *', { yPercent: 120, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' })
      .add(() => heroLines.forEach((l, i) => setTimeout(() => { l.textContent = ''; scramble(l, 1) }, i * 120)), '-=0.1')
      .from('.abx__lead', { opacity: 0, y: 18, duration: 0.6, ease: 'power2.out' }, '+=0.35')
      .from('.abx__scrollcue', { opacity: 0, duration: 0.5 }, '<')

    // Per-chapter hard reveals
    gsap.utils.toArray<HTMLElement>('.abx__ch').forEach((el) => {
      const rule  = el.querySelector('.abx__ch-rule')
      const index = el.querySelector<HTMLElement>('.abx__ch-index')!
      const headEl = el.querySelector<HTMLElement>('.abx__ch-head')!
      const meta  = el.querySelectorAll('.abx__ch-meta > *')
      const bodyEl = el.querySelector('.abx__ch-body')
      const frame = el.querySelector<HTMLElement>('.abx__ch-frame')!
      const tail  = el.querySelectorAll('.abx__ch-foot, .abx__cta')

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, scrollTrigger: { trigger: el, start: 'top 78%' } })
      tl.from(rule, { scaleX: 0, duration: 0.7, ease: 'power2.inOut' })
        .from(index, { yPercent: 120, opacity: 0, duration: 0.5 }, '-=0.4')
        .from(frame, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'power4.inOut' }, '-=0.45')
        .add(() => scramble(headEl, 1), '-=0.55')
        .from(meta, { opacity: 0, y: 12, duration: 0.4, stagger: 0.06 }, '-=0.3')
        .from(bodyEl, { opacity: 0, y: 16, duration: 0.5 }, '-=0.25')
      if (tail.length) tl.from(tail, { opacity: 0, y: 14, duration: 0.45, stagger: 0.08 }, '-=0.2')

      // Grayscale image drifts a touch within its hard frame.
      gsap.fromTo(el.querySelector('.abx__ch-img'), { yPercent: -3 }, { yPercent: 3, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
  }, root.value!)

  ScrollTrigger.refresh()
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => {
  $lenis?.off?.('scroll', onLenisScroll)
  cancelAnimationFrame(velRAF)
  ctx?.revert()
  ScrollTrigger.getAll().forEach((t) => t.kill())
})
</script>

<template>
  <div ref="root" class="abx">
    <div class="abx__grain" aria-hidden="true" />
    <div ref="cursor" class="abx__cursor" aria-hidden="true"><span /></div>

    <!-- Top bar -->
    <header class="abx__bar">
      <NuxtLink to="/" class="abx__navlink abx__scram" data-text="[ Back ]" aria-label="Back to the site">[ Back ]</NuxtLink>
      <span class="abx__barword">About / Naveen Jose</span>
      <NuxtLink to="/my-work" class="abx__navlink abx__scram" data-text="[ Work ]" aria-label="See my work">[ Work ]</NuxtLink>
    </header>

    <!-- Hero -->
    <section class="abx__hero">
      <div class="abx__kick">
        <span>(01) — About</span>
        <span class="abx__kick-acid">Instructional Designer</span>
        <span>Est. Hospitality</span>
      </div>
      <h1 class="abx__title" aria-label="Naveen Jose">
        <span class="abx__name" data-text="Naveen" aria-hidden="true">Naveen</span>
        <span class="abx__name abx__name--acid" data-text="Jose" aria-hidden="true">Jose</span>
      </h1>
      <p class="abx__lead">A certified instructional designer. The short version of how a hospitality floor turned into a career in learning design — in six frames.</p>
      <span class="abx__scrollcue" aria-hidden="true">↓ Scroll</span>
    </section>

    <!-- Velocity marquee -->
    <div class="abx__marquee" aria-hidden="true">
      <div ref="velWrap" class="abx__marquee-vel">
        <div class="abx__marquee-track">
          <template v-for="pass in 2" :key="pass">
            <span v-for="(m, i) in MARQUEE" :key="pass + '-' + i" class="abx__marquee-item">
              {{ m }}<i class="abx__marquee-sep">✳</i>
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- Chapters -->
    <main class="abx__body">
      <section
        v-for="(c, i) in CHAPTERS" :key="i"
        class="abx__ch" :class="{ 'abx__ch--rev': i % 2 === 1 }"
        :aria-labelledby="`abx-h-${i}`"
      >
        <div class="abx__ch-rule" aria-hidden="true" />
        <div class="abx__ch-text">
          <span class="abx__ch-index" aria-hidden="true">{{ c.n }}</span>
          <span class="abx__ch-eyebrow">// {{ c.eyebrow }}</span>
          <h2 :id="`abx-h-${i}`" class="abx__ch-head abx__scram" :data-text="c.head" :aria-label="c.head.replace('\n',' ')">{{ c.head }}</h2>
          <p class="abx__ch-body">{{ c.body }}</p>
          <div class="abx__ch-meta">
            <span>{{ c.place }}</span>
            <span>{{ c.role }}</span>
          </div>
          <p v-if="c.footnote" class="abx__ch-foot">{{ c.footnote }}</p>
          <div v-if="i === CHAPTERS.length - 1" class="abx__cta">
            <NuxtLink to="/my-work" class="abx__btn abx__btn--acid abx__scram" data-text="See my work →">See my work →</NuxtLink>
            <NuxtLink to="/" class="abx__btn abx__scram" data-text="Back home">Back home</NuxtLink>
          </div>
        </div>
        <figure class="abx__ch-figure">
          <div class="abx__ch-frame">
            <img class="abx__ch-img" :src="c.img" :alt="c.alt" width="1131" height="1414" loading="lazy" decoding="async" draggable="false" />
            <span class="abx__ch-tag" aria-hidden="true">FIG. {{ c.n }}</span>
          </div>
        </figure>
      </section>
    </main>
  </div>
</template>

<style scoped>
.abx {
  --bg: #0A0A0A; --ink: #ECECE6; --acid: #D0FF14;
  --line: rgba(236,236,230,0.16); --dim: rgba(236,236,230,0.56);
  --disp: 'Space Grotesk', 'Helvetica Neue', sans-serif;
  --mono: 'Space Mono', ui-monospace, monospace;
  position: relative; background: var(--bg); color: var(--ink);
  min-height: 100dvh; overflow-x: clip; font-family: var(--disp);
}
.abx.cursor-on, .abx.cursor-on * { cursor: none; }
.abx :deep(.abx__dud) { color: var(--acid); }

/* Grain */
.abx__grain {
  position: fixed; inset: 0; z-index: 8; pointer-events: none; opacity: 0.06; mix-blend-mode: screen;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: abx-grain 0.6s steps(2) infinite;
}
@keyframes abx-grain { 0% { transform: translate(0,0) } 50% { transform: translate(-2%,1%) } 100% { transform: translate(1%,-2%) } }

/* Custom cursor */
.abx__cursor { position: fixed; top: 0; left: 0; z-index: 60; pointer-events: none; display: none; will-change: transform; }
.abx.cursor-on .abx__cursor { display: block; }
.abx__cursor span {
  position: absolute; top: 0; left: 0; width: 16rem; height: 16rem; translate: -50% -50%;
  border: 1.5px solid var(--acid); mix-blend-mode: difference;
  transition: width 0.25s var(--ease-spring), height 0.25s var(--ease-spring), background 0.25s ease;
}
.abx__cursor.is-link span { width: 42rem; height: 42rem; background: color-mix(in srgb, var(--acid) 22%, transparent); }

/* Top bar */
.abx__bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 30;
  display: flex; align-items: center; justify-content: space-between; gap: 14rem;
  padding: calc(14rem + var(--safe-top)) clamp(16rem, 4vw, 44rem) 14rem;
  font-family: var(--mono); font-size: 12rem;
  background: linear-gradient(var(--bg) 62%, transparent);
}
.abx__navlink { color: var(--ink); text-decoration: none; min-height: 44rem; display: inline-flex; align-items: center; letter-spacing: 0.02em; }
.abx__navlink:hover { color: var(--acid); }
.abx__navlink:focus-visible { outline: 2px solid var(--acid); outline-offset: 3px; }
.abx__barword { color: var(--dim); letter-spacing: 0.14em; text-transform: uppercase; font-size: 11rem; }
@media (max-width: 560px) { .abx__barword { display: none; } }

/* Hero */
.abx__hero {
  position: relative; min-height: 100dvh; display: flex; flex-direction: column; justify-content: center;
  padding: calc(120rem + var(--safe-top)) clamp(16rem, 4vw, 44rem) 40rem;
}
.abx__kick {
  display: flex; flex-wrap: wrap; gap: 8rem 24rem; font-family: var(--mono); font-size: 12.5rem;
  color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: clamp(20rem, 3vw, 40rem);
}
.abx__kick-acid { color: var(--acid); }
.abx__title { margin: 0; line-height: 0.8; }
.abx__name {
  display: block; font-weight: 700; text-transform: uppercase;
  font-size: clamp(74rem, 20vw, 300rem); letter-spacing: -0.04em; word-break: break-word;
}
.abx__name--acid { color: var(--acid); }
.abx__lead {
  margin: clamp(28rem, 4vw, 52rem) 0 0; max-width: 46ch; font-size: clamp(15rem, 1.7vw, 19rem);
  line-height: 1.55; color: var(--dim); font-family: var(--disp);
}
.abx__scrollcue {
  margin-top: clamp(30rem, 5vh, 64rem); font-family: var(--mono); font-size: 12rem;
  text-transform: uppercase; letter-spacing: 0.16em; color: var(--dim);
}

/* Marquee */
.abx__marquee { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); overflow: hidden; padding: 20rem 0; }
.abx__marquee-vel { transform: skewX(var(--sk, 0deg)); transition: transform 0.4s ease-out; will-change: transform; }
.abx__marquee-track { display: inline-flex; white-space: nowrap; animation: abx-marq 26s linear infinite; }
@keyframes abx-marq { to { transform: translateX(-50%); } }
.abx__marquee-item {
  display: inline-flex; align-items: center; font-weight: 600; text-transform: uppercase;
  font-size: clamp(22rem, 4vw, 46rem); letter-spacing: -0.01em; padding: 0 6rem;
}
.abx__marquee-sep { font-style: normal; color: var(--acid); margin: 0 26rem; font-size: 0.6em; }

/* Chapters */
.abx__body { position: relative; z-index: 1; }
.abx__ch {
  position: relative; max-width: 1360rem; margin: 0 auto;
  padding: clamp(56rem, 10vh, 130rem) clamp(16rem, 4vw, 44rem);
  display: grid; grid-template-columns: 1.15fr 0.85fr; gap: clamp(28rem, 5vw, 88rem); align-items: start;
}
.abx__ch--rev .abx__ch-figure { order: -1; }
.abx__ch-rule { position: absolute; top: 0; left: clamp(16rem, 4vw, 44rem); right: clamp(16rem, 4vw, 44rem); height: 1px; background: var(--line); transform-origin: left; }

.abx__ch-text { position: relative; }
.abx__ch-index {
  display: block; font-family: var(--mono); font-weight: 700; font-size: clamp(28rem, 4vw, 46rem);
  color: var(--acid); line-height: 1; margin-bottom: 18rem;
}
.abx__ch-eyebrow { display: block; font-family: var(--mono); font-size: 12.5rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--dim); margin-bottom: 18rem; }
.abx__ch-head {
  margin: 0; font-weight: 700; text-transform: uppercase; white-space: pre-line;
  font-size: clamp(40rem, 6.6vw, 108rem); line-height: 0.92; letter-spacing: -0.035em;
}
.abx__ch-body { margin: clamp(22rem, 3vw, 34rem) 0 0; max-width: 50ch; font-size: clamp(15rem, 1.5vw, 17.5rem); line-height: 1.66; color: var(--dim); }
.abx__ch-meta { margin-top: 26rem; display: flex; flex-wrap: wrap; gap: 8rem 28rem; font-family: var(--mono); font-size: 12rem; text-transform: uppercase; letter-spacing: 0.08em; }
.abx__ch-meta > span { position: relative; padding-left: 16rem; color: var(--dim); }
.abx__ch-meta > span::before { content: ''; position: absolute; left: 0; top: 50%; width: 7rem; height: 7rem; translate: 0 -50%; background: var(--acid); }
.abx__ch-foot { margin: 24rem 0 0; font-family: var(--mono); font-size: 12.5rem; font-style: normal; color: var(--dim); letter-spacing: 0.02em; }

.abx__cta { margin-top: 40rem; display: flex; flex-wrap: wrap; gap: 12rem; }
.abx__btn {
  display: inline-flex; align-items: center; min-height: 52rem; padding: 0 26rem;
  font-family: var(--mono); font-size: 13rem; text-transform: uppercase; letter-spacing: 0.06em;
  text-decoration: none; color: var(--ink); border: 1px solid var(--ink); transition: background 0.2s ease, color 0.2s ease;
}
.abx__btn:hover { background: var(--ink); color: var(--bg); }
.abx__btn--acid { background: var(--acid); border-color: var(--acid); color: #0A0A0A; font-weight: 700; }
.abx__btn--acid:hover { background: transparent; color: var(--acid); }
.abx__btn:focus-visible { outline: 2px solid var(--acid); outline-offset: 3px; }

/* Figure — hard edged, grayscale, colour on hover */
.abx__ch-figure { position: sticky; top: clamp(80rem, 12vh, 130rem); margin: 0; }
.abx__ch-frame { position: relative; width: 100%; aspect-ratio: 4 / 5; overflow: hidden; border: 1px solid var(--line); will-change: clip-path; }
.abx__ch-img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  filter: grayscale(1) contrast(1.08) brightness(0.94); transition: filter 0.5s ease; will-change: transform;
}
.abx__ch-figure:hover .abx__ch-img { filter: grayscale(0) contrast(1) brightness(1); }
.abx__ch-tag { position: absolute; left: 12rem; bottom: 12rem; font-family: var(--mono); font-size: 11rem; letter-spacing: 0.12em; color: var(--acid); background: rgba(10,10,10,0.7); padding: 4rem 8rem; }

.abx-fade-enter-active, .abx-fade-leave-active { transition: opacity 0.35s ease; }
.abx-fade-enter-from, .abx-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .abx__grain, .abx__marquee-track { animation: none; }
}

/* Tablet / mobile */
@media (max-width: 900px) {
  .abx__ch {
    grid-template-columns: 1fr; gap: 28rem; padding: clamp(44rem, 8vh, 72rem) clamp(16rem, 5vw, 40rem);
  }
  .abx__ch--rev .abx__ch-figure { order: 0; }
  .abx__ch-figure { position: static; top: auto; }
  .abx__ch-frame { aspect-ratio: 3 / 4; }
  .abx__ch-img { filter: grayscale(1) contrast(1.08) brightness(0.94); }
  .abx__ch-body { max-width: 100%; }
}
@media (max-width: 480px) {
  .abx__ch-frame { aspect-ratio: 4 / 5; }
  .abx__name { font-size: clamp(58rem, 22vw, 120rem); }
}
</style>
