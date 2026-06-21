<template>
  <div ref="rootEl" class="about">

    <!-- 1 · OPENING ───────────────────────────────────────── -->
    <section ref="openingEl" class="mv mv--opening">
      <div class="opening-inner">
        <p class="eyebrow">{{ content.tagline }}</p>
        <h1 ref="openingLineEl" class="hero opening-line">{{ beat(1, 0) }}</h1>
        <p class="opening-name">{{ content.name }}</p>
      </div>
      <div ref="scrollCueEl" class="scroll-cue" aria-hidden="true">
        <span class="scroll-cue__word">Scroll</span>
        <span class="scroll-cue__line" />
      </div>
    </section>

    <!-- 2 · ORIGIN ────────────────────────────────────────── -->
    <section ref="originEl" class="mv mv--origin">
      <span class="chapter-label">Where it began</span>
      <div class="origin-block">
        <p
          v-for="(b, i) in scene(2).beats"
          :key="`o2-${i}`"
          class="beat reveal-line"
          :class="[toneClass(b.tone), { 'is-accent': b.accent }]"
        >{{ b.text }}</p>
      </div>
      <div class="origin-aside">
        <p
          v-for="(b, i) in scene(3).beats"
          :key="`o3-${i}`"
          class="beat reveal-line"
          :class="toneClass(b.tone)"
        >{{ b.text }}</p>
      </div>
      <div class="origin-block origin-block--turn">
        <p
          v-for="(b, i) in scene(4).beats"
          :key="`o4-${i}`"
          class="beat reveal-line"
          :class="[toneClass(b.tone), { 'is-accent': b.accent }]"
        >{{ b.text }}</p>
      </div>
    </section>

    <!-- 3 · THE TURN (convergence) ────────────────────────── -->
    <section ref="turnEl" class="mv mv--turn">
      <div ref="convergeFieldEl" class="converge-field" aria-hidden="true">
        <span
          v-for="(w, i) in convergeWords"
          :key="w"
          class="converge-word"
          :style="convergeStyle(i)"
        >{{ w }}</span>
      </div>
      <div class="turn-center">
        <p
          v-for="(b, i) in scene(5).beats"
          :key="`t5-${i}`"
          class="beat reveal-line"
          :class="[toneClass(b.tone), { 'is-accent': b.accent }]"
        >{{ b.text }}</p>
      </div>
      <div class="turn-sewa">
        <p
          v-for="(b, i) in scene(6).beats"
          :key="`t6-${i}`"
          class="beat reveal-line"
          :class="[toneClass(b.tone), { 'is-accent': b.accent }]"
        >{{ b.text }}</p>
      </div>
    </section>

    <!-- 4 · CONSTELLATION ─────────────────────────────────── -->
    <section ref="constellationEl" class="mv mv--constellation">
      <div class="constellation-stage">
        <svg
          ref="constellationSvgEl"
          class="constellation-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <line
            v-for="(e, i) in graphEdges"
            :key="`e-${i}`"
            class="c-edge"
            :x1="nodeX(e[0])" :y1="nodeY(e[0])"
            :x2="nodeX(e[1])" :y2="nodeY(e[1])"
          />
          <g
            v-for="(n, i) in graphNodes"
            :key="`n-${i}`"
            class="c-node"
            :style="`--cx:${n.x * 100}; --cy:${n.y * 100};`"
          >
            <circle :cx="n.x * 100" :cy="n.y * 100" r="0.9" class="c-dot" />
          </g>
        </svg>
        <span
          v-for="(n, i) in graphNodes"
          :key="`l-${i}`"
          class="c-label"
          :style="`left:${n.x * 100}%; top:${n.y * 100}%;`"
        >{{ n.label }}</span>
      </div>
      <div class="constellation-caption">
        <p
          v-for="(b, i) in scene(7).beats.slice(2)"
          :key="`c7-${i}`"
          class="beat reveal-line"
          :class="[toneClass(b.tone), { 'is-accent': b.accent }]"
        >{{ b.text }}</p>
      </div>
    </section>

    <!-- 5 · DISCIPLINE ────────────────────────────────────── -->
    <section ref="disciplineEl" class="mv mv--discipline">
      <span class="chapter-label">{{ marriottLead }}</span>
      <div class="questions">
        <p
          v-for="(q, i) in marriottQuestions"
          :key="`q-${i}`"
          class="beat reveal-line lg"
          :class="{ 'is-accent': q.accent }"
        >{{ q.text }}</p>
      </div>
      <div class="discipline-reveal">
        <p
          v-for="(b, i) in scene(10).beats"
          :key="`d10-${i}`"
          class="beat reveal-line"
          :class="[toneClass(b.tone), { 'is-accent': b.accent }]"
        >{{ b.text }}</p>
      </div>
    </section>

    <!-- 6 · THE CRAFT ─────────────────────────────────────── -->
    <section ref="craftEl" class="mv mv--craft">
      <div class="craft-headline">
        <p
          v-for="(b, i) in scene(14).beats"
          :key="`cr14-${i}`"
          class="beat reveal-line"
          :class="[toneClass(b.tone), { 'is-accent': b.accent }]"
        >{{ b.text }}</p>
      </div>
      <div class="craft-steps">
        <p
          v-for="(b, i) in scene(13).beats"
          :key="`cr13-${i}`"
          class="beat reveal-line"
          :class="[toneClass(b.tone), { 'is-accent': b.accent }]"
        >{{ b.text }}</p>
      </div>
      <p ref="toolsEl" class="tools-line">{{ tools.join('  ·  ') }}</p>
    </section>

    <!-- 7 · PHILOSOPHY → PAYOFF ───────────────────────────── -->
    <section ref="philosophyEl" class="mv mv--philosophy">
      <div class="deva-block">
        <p ref="devaEl" class="deva">{{ beat(17, 0) }}</p>
        <p class="beat reveal-line md deva-trans">
          {{ beat(17, 1) }} <span class="is-accent">{{ beat(17, 2) }}</span>
        </p>
      </div>

      <ul class="transforms">
        <li
          v-for="(pair, i) in transformPairs"
          :key="`tp-${i}`"
          class="transform-pair reveal-line"
        >
          <span class="t-from">{{ pair.from }}</span>
          <span class="t-arrow" aria-hidden="true">→</span>
          <span class="t-to is-accent">{{ pair.to }}</span>
        </li>
      </ul>

      <div class="payoff">
        <p class="beat reveal-line lg">{{ beat(22, 0) }}</p>
        <p ref="payoffEl" class="hero payoff-line">{{ beat(22, 1) }}</p>
      </div>
    </section>

    <!-- 8 · SIGNATURE ─────────────────────────────────────── -->
    <section ref="signatureEl" class="mv mv--signature">
      <figure class="portrait">
        <img
          ref="portraitImgEl"
          src="/naveen.jpeg"
          :alt="`Portrait of ${content.name}`"
          class="portrait-img"
        />
      </figure>
      <div class="signature-copy">
        <p ref="signLineEl" class="xl sign-line">{{ beat(24, 0) }}</p>
        <p class="sign-name">{{ beat(24, 1) }}</p>
        <p class="sign-now reveal-line">Currently building learning experiences at Concentrix.</p>
        <p class="sign-role reveal-line">{{ content.tagline }} · {{ content.brand }}</p>
      </div>
    </section>

    <!-- 9 · CLOSE / CTA ───────────────────────────────────── -->
    <section ref="closeEl" class="mv mv--close">
      <NuxtLink :to="cta.to" class="cta-link reveal-line">{{ cta.text }}</NuxtLink>
      <div class="contacts">
        <a :href="`mailto:${content.email}`" class="contact reveal-line">{{ content.email }}</a>
        <a :href="linkedInUrl" target="_blank" rel="noopener" class="contact reveal-line">LinkedIn</a>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  SCENES,
  CONVERGE_WORDS,
  GRAPH_NODES,
  GRAPH_EDGES,
  CTA,
  type Tone
} from '~/experience/about/narrative'
import { useContentStore } from '~/stores/content'

gsap.registerPlugin(ScrollTrigger)

// ── Canonical data ──────────────────────────────────────────
const store = useContentStore()
const content = {
  name: store.name,
  brand: store.brand,
  tagline: store.tagline,
  email: store.email
}
const linkedInUrl =
  store.socialLinks.find(l => l.platform === 'linkedin')?.url ?? '#'

const convergeWords = CONVERGE_WORDS
const graphNodes = GRAPH_NODES
const graphEdges = GRAPH_EDGES
const cta = CTA

// User-confirmed tools (this session) — shown as one quiet line, not a cloud
const tools = ['Storyline 360', 'SCORM', 'Vyond', 'After Effects', 'Canva']

// Marriott beats (scene 9): split lead-in vs the three questions
const marriottLead = SCENES.find(s => s.id === 9)!.beats[0].text
const marriottQuestions = SCENES.find(s => s.id === 9)!.beats.filter(b =>
  b.text.trim().endsWith('?')
)

// Transform pairs (scene 18): pair "From X…" with "…to Y."
const transformPairs = (() => {
  const beats = SCENES.find(s => s.id === 18)!.beats
  const pairs: { from: string; to: string }[] = []
  for (let i = 1; i + 1 < beats.length; i += 2) {
    pairs.push({
      from: beats[i].text.replace(/^From\s+/i, '').replace(/[…\.]+$/, ''),
      to: beats[i + 1].text.replace(/^…?\s*to\s+/i, '').replace(/[…\.]+$/, '')
    })
  }
  return pairs
})()

// ── Helpers ─────────────────────────────────────────────────
const scene = (id: number) => SCENES.find(s => s.id === id)!
const beat = (id: number, i: number) => scene(id).beats[i]?.text ?? ''

const toneClass = (t: Tone) => t
const nodeX = (i: number) => graphNodes[i].x * 100
const nodeY = (i: number) => graphNodes[i].y * 100

// Deterministic scatter for the converge words (stable across renders)
const convergeStyle = (i: number) => {
  const angle = (i / convergeWords.length) * Math.PI * 2
  const r = 30 + (i % 3) * 9
  const x = Math.cos(angle) * r
  const y = Math.sin(angle) * r * 0.7
  const rot = (i % 2 === 0 ? -1 : 1) * (6 + (i % 4) * 4)
  return `--sx:${x}rem; --sy:${y}rem; --srot:${rot}deg;`
}

// ── Refs ────────────────────────────────────────────────────
const rootEl = ref<HTMLElement>()
const openingEl = ref<HTMLElement>()
const openingLineEl = ref<HTMLElement>()
const scrollCueEl = ref<HTMLElement>()
const originEl = ref<HTMLElement>()
const turnEl = ref<HTMLElement>()
const convergeFieldEl = ref<HTMLElement>()
const constellationEl = ref<HTMLElement>()
const constellationSvgEl = ref<SVGElement>()
const disciplineEl = ref<HTMLElement>()
const craftEl = ref<HTMLElement>()
const toolsEl = ref<HTMLElement>()
const philosophyEl = ref<HTMLElement>()
const devaEl = ref<HTMLElement>()
const payoffEl = ref<HTMLElement>()
const signatureEl = ref<HTMLElement>()
const portraitImgEl = ref<HTMLImageElement>()
const signLineEl = ref<HTMLElement>()
const closeEl = ref<HTMLElement>()

let onLenisScroll: (() => void) | null = null
const triggers: ScrollTrigger[] = []
const cleanups: Array<() => void> = []

onMounted(async () => {
  document.documentElement.setAttribute('data-about', '')

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Lenis ↔ ScrollTrigger bridge (Lenis already runs on the GSAP ticker)
  const { $lenis } = useNuxtApp()
  const lenis = $lenis as any
  if (lenis?.on) {
    onLenisScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onLenisScroll)
  }

  if (reduced) {
    revealEverything()
    return
  }

  const { default: SplitType } = await import('split-type')

  buildOpening(SplitType)
  buildLineReveals()
  buildConverge()
  buildConstellation()
  buildTools()
  buildDeva(SplitType)
  buildPayoff(SplitType)
  buildSignature(SplitType)

  await nextTick()
  ScrollTrigger.refresh()
})

onBeforeUnmount(() => {
  const { $lenis } = useNuxtApp()
  const lenis = $lenis as any
  if (onLenisScroll && lenis?.off) lenis.off('scroll', onLenisScroll)
  triggers.forEach(t => t.kill())
  ScrollTrigger.getAll().forEach(t => t.kill())
  cleanups.forEach(fn => fn())
  document.documentElement.removeAttribute('data-about')
})

// Fallback: show all content at rest (reduced motion)
function revealEverything() {
  if (!rootEl.value) return
  rootEl.value
    .querySelectorAll<HTMLElement>('.reveal-line, .converge-word, .c-label, .c-edge, .c-dot, .tools-line, .deva, .hero, .xl, .sign-name')
    .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none' })
}

// Generic blur-up reveal for a line, fired once on enter
function revealLines(scope: HTMLElement | undefined, opts: { stagger?: number; y?: number } = {}) {
  if (!scope) return
  const lines = scope.querySelectorAll<HTMLElement>('.reveal-line')
  if (!lines.length) return
  gsap.set(lines, { opacity: 0, y: opts.y ?? 22, filter: 'blur(6px)' })
  const t = ScrollTrigger.create({
    trigger: scope,
    start: 'top 72%',
    once: true,
    onEnter: () =>
      gsap.to(lines, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.9, ease: 'power3.out',
        stagger: opts.stagger ?? 0.08
      })
  })
  triggers.push(t)
}

function buildLineReveals() {
  revealLines(originEl.value, { stagger: 0.06 })
  revealLines(turnEl.value, { stagger: 0.06 })
  revealLines(disciplineEl.value, { stagger: 0.08 })
  revealLines(craftEl.value, { stagger: 0.07 })
  revealLines(philosophyEl.value, { stagger: 0.07 })
  revealLines(closeEl.value, { stagger: 0.1 })
}

function buildOpening(SplitType: any) {
  if (!openingLineEl.value) return
  const split = new SplitType(openingLineEl.value, { types: 'chars' })
  cleanups.push(() => split.revert())
  gsap.set(split.chars, { opacity: 0, y: 26, filter: 'blur(8px)' })
  gsap.to(split.chars, {
    opacity: 1, y: 0, filter: 'blur(0px)',
    duration: 1.1, ease: 'power3.out', stagger: 0.03, delay: 0.15
  })

  // gentle parallax + fade of the scroll cue as the hero leaves
  if (scrollCueEl.value) {
    const t = ScrollTrigger.create({
      trigger: openingEl.value,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: self => {
        gsap.set(scrollCueEl.value!, { opacity: 1 - self.progress * 1.4 })
      }
    })
    triggers.push(t)
  }
}

function buildConverge() {
  if (!convergeFieldEl.value || !turnEl.value) return
  const words = convergeFieldEl.value.querySelectorAll<HTMLElement>('.converge-word')
  // start scattered (set via CSS vars) then drift to centre + dissolve on scrub
  gsap.set(words, {
    x: (i, el) => parseFloat((el as HTMLElement).style.getPropertyValue('--sx')),
    y: (i, el) => parseFloat((el as HTMLElement).style.getPropertyValue('--sy')),
    rotate: (i, el) => parseFloat((el as HTMLElement).style.getPropertyValue('--srot')),
    opacity: 0.5
  })
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: turnEl.value,
      start: 'top 85%',
      end: 'center 55%',
      scrub: 1
    }
  })
  tl.to(words, {
    x: 0, y: 0, rotate: 0, opacity: 0,
    ease: 'power2.in', stagger: 0.04
  })
  if (tl.scrollTrigger) triggers.push(tl.scrollTrigger)
}

function buildConstellation() {
  if (!constellationEl.value) return
  const edges = constellationEl.value.querySelectorAll<SVGLineElement>('.c-edge')
  const dots = constellationEl.value.querySelectorAll<SVGCircleElement>('.c-dot')
  const labels = constellationEl.value.querySelectorAll<HTMLElement>('.c-label')

  gsap.set(edges, { opacity: 0, drawSVG: undefined })
  edges.forEach(e => {
    const len = e.getTotalLength?.() ?? 50
    e.style.strokeDasharray = String(len)
    e.style.strokeDashoffset = String(len)
  })
  gsap.set(dots, { scale: 0, transformOrigin: 'center', opacity: 0 })
  gsap.set(labels, { opacity: 0, y: 10 })

  const t = ScrollTrigger.create({
    trigger: constellationEl.value,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to(dots, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.05 })
      gsap.to(edges, {
        opacity: 0.35, strokeDashoffset: 0,
        duration: 1.1, ease: 'power2.out', stagger: 0.04, delay: 0.1
      })
      gsap.to(labels, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.25 })
    }
  })
  triggers.push(t)

  // slow continuous drift on the whole stage for depth
  const stage = constellationEl.value.querySelector<HTMLElement>('.constellation-stage')
  if (stage) {
    const drift = gsap.to(stage, {
      y: 8, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1
    })
    cleanups.push(() => drift.kill())
  }
}

function buildTools() {
  if (!toolsEl.value) return
  gsap.set(toolsEl.value, { opacity: 0, y: 14 })
  const t = ScrollTrigger.create({
    trigger: toolsEl.value,
    start: 'top 88%',
    once: true,
    onEnter: () =>
      gsap.to(toolsEl.value!, { opacity: 0.55, y: 0, duration: 1, ease: 'power2.out' })
  })
  triggers.push(t)
}

function buildDeva(SplitType: any) {
  if (!devaEl.value) return
  const split = new SplitType(devaEl.value, { types: 'chars' })
  cleanups.push(() => split.revert())
  gsap.set(split.chars, { opacity: 0, filter: 'blur(10px)', y: 14 })
  const t = ScrollTrigger.create({
    trigger: devaEl.value,
    start: 'top 75%',
    once: true,
    onEnter: () =>
      gsap.to(split.chars, {
        opacity: 1, filter: 'blur(0px)', y: 0,
        duration: 1.2, ease: 'power3.out', stagger: 0.05
      })
  })
  triggers.push(t)
}

function buildPayoff(SplitType: any) {
  if (!payoffEl.value) return
  const split = new SplitType(payoffEl.value, { types: 'chars' })
  cleanups.push(() => split.revert())
  gsap.set(split.chars, { opacity: 0, y: 40, filter: 'blur(12px)' })
  const t = ScrollTrigger.create({
    trigger: payoffEl.value,
    start: 'top 78%',
    once: true,
    onEnter: () =>
      gsap.to(split.chars, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 1, ease: 'power4.out', stagger: 0.035
      })
  })
  triggers.push(t)
}

function buildSignature(SplitType: any) {
  if (!signatureEl.value) return

  // portrait: blur→sharp + slow parallax
  if (portraitImgEl.value) {
    gsap.set(portraitImgEl.value, { opacity: 0, filter: 'blur(18px) grayscale(1)', scale: 1.08 })
    const reveal = ScrollTrigger.create({
      trigger: signatureEl.value,
      start: 'top 75%',
      once: true,
      onEnter: () =>
        gsap.to(portraitImgEl.value!, {
          opacity: 1, filter: 'blur(0px) grayscale(1)', scale: 1,
          duration: 1.3, ease: 'power3.out'
        })
    })
    triggers.push(reveal)

    const parallax = gsap.timeline({
      scrollTrigger: {
        trigger: signatureEl.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
    parallax.fromTo(portraitImgEl.value, { yPercent: -6 }, { yPercent: 6, ease: 'none' })
    if (parallax.scrollTrigger) triggers.push(parallax.scrollTrigger)
  }

  if (signLineEl.value) {
    const split = new SplitType(signLineEl.value, { types: 'words' })
    cleanups.push(() => split.revert())
    gsap.set(split.words, { opacity: 0, y: 24 })
    const t = ScrollTrigger.create({
      trigger: signLineEl.value,
      start: 'top 80%',
      once: true,
      onEnter: () =>
        gsap.to(split.words, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 })
    })
    triggers.push(t)
  }

  revealLines(signatureEl.value, { stagger: 0.1 })
}
</script>

<style scoped>
/* ───────────────────────── base ───────────────────────── */
.about {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--main-font);
  overflow-x: hidden;
}

.mv {
  position: relative;
  padding: clamp(120rem, 22vh, 220rem) clamp(28rem, 7vw, 140rem);
  max-width: 1400rem;
  margin: 0 auto;
}

/* ── tone scale (mirrors narrative.ts tones) ── */
.sm   { font-size: clamp(15rem, 4.4vw, 20rem); font-weight: 400; line-height: 1.5; opacity: 0.62; }
.md   { font-size: clamp(19rem, 5.2vw, 28rem); font-weight: 500; line-height: 1.35; letter-spacing: -0.01em; }
.lg   { font-size: clamp(28rem, 8vw, 46rem);  font-weight: 600; line-height: 1.12; letter-spacing: -0.02em; }
.xl   { font-size: clamp(40rem, 11vw, 84rem); font-weight: 700; line-height: 1.02; letter-spacing: -0.035em; }
.hero { font-size: clamp(52rem, 15vw, 150rem); font-weight: 800; line-height: 0.92; letter-spacing: -0.045em; }
.sig  { font-size: clamp(18rem, 5vw, 26rem);  font-weight: 500; opacity: 0.7; }

.beat { margin: 0; }
.beat + .beat { margin-top: clamp(8rem, 1.6vw, 16rem); }

/* accent: keep legible on both themes by mixing accent hue into text colour */
.is-accent {
  color: color-mix(in srgb, var(--color-accent) 60%, var(--color-text));
}

.chapter-label,
.eyebrow {
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  opacity: 0.45;
}
.chapter-label { display: block; margin-bottom: clamp(32rem, 6vw, 64rem); }

/* ───────────────────── 1 · opening ─────────────────────── */
.mv--opening {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-block: clamp(140rem, 18vh, 200rem);
}
.opening-inner { max-width: 1100rem; }
.eyebrow { margin-bottom: clamp(28rem, 5vw, 48rem); }
.opening-line { margin: 0; }
.opening-name {
  margin-top: clamp(28rem, 5vw, 48rem);
  font-size: clamp(15rem, 4vw, 20rem);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.scroll-cue {
  position: absolute;
  left: clamp(28rem, 7vw, 140rem);
  bottom: clamp(40rem, 6vh, 70rem);
  display: flex;
  align-items: center;
  gap: 14rem;
}
.scroll-cue__word {
  font-size: 11rem; font-weight: 600;
  letter-spacing: 0.28em; text-transform: uppercase; opacity: 0.4;
}
.scroll-cue__line {
  width: 60rem; height: 1rem;
  background: currentColor; opacity: 0.4;
  transform-origin: left center;
  animation: cue 2.4s var(--ease-quad-in-out) infinite;
}
@keyframes cue {
  0%, 100% { transform: scaleX(0.3); opacity: 0.2; }
  50%      { transform: scaleX(1);   opacity: 0.5; }
}

/* ───────────────────── 2 · origin ──────────────────────── */
.origin-block { max-width: 1000rem; }
.origin-aside {
  max-width: 640rem;
  margin: clamp(60rem, 10vw, 120rem) 0 clamp(60rem, 10vw, 120rem) auto;
  opacity: 0.78;
}
.origin-block--turn { max-width: 1100rem; }

/* ───────────────────── 3 · the turn ────────────────────── */
.mv--turn {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
.converge-field {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.converge-word {
  position: absolute;
  font-size: clamp(16rem, 4vw, 30rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: 0.5;
  will-change: transform, opacity;
}
.turn-center { position: relative; }
.turn-center .beat { margin-inline: auto; }
.turn-sewa {
  position: relative;
  margin-top: clamp(48rem, 9vw, 110rem);
}

/* ─────────────────── 4 · constellation ─────────────────── */
.mv--constellation {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.constellation-stage {
  position: relative;
  width: min(92vw, 620rem);
  aspect-ratio: 1 / 1;
  margin-bottom: clamp(40rem, 7vw, 80rem);
  will-change: transform;
}
.constellation-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.c-edge { stroke: var(--color-text); stroke-width: 0.18; }
.c-dot  { fill: color-mix(in srgb, var(--color-accent) 55%, var(--color-text)); }
.c-label {
  position: absolute;
  transform: translate(-50%, -150%);
  font-size: clamp(11rem, 2.6vw, 15rem);
  font-weight: 600;
  letter-spacing: 0.06em;
  white-space: nowrap;
  opacity: 0.85;
}

/* ───────────────────── 5 · discipline ──────────────────── */
.questions { max-width: 1000rem; }
.questions .beat + .beat { margin-top: clamp(10rem, 2vw, 20rem); }
.discipline-reveal { margin-top: clamp(50rem, 9vw, 110rem); max-width: 1100rem; }

/* ───────────────────── 6 · craft ───────────────────────── */
.craft-headline { max-width: 1100rem; }
.craft-steps {
  margin-top: clamp(48rem, 9vw, 100rem);
  max-width: 900rem;
}
.tools-line {
  margin-top: clamp(60rem, 11vw, 130rem);
  font-size: 12rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.55;
}

/* ─────────────── 7 · philosophy → payoff ───────────────── */
.mv--philosophy { text-align: center; }
.deva-block { margin-bottom: clamp(70rem, 13vw, 150rem); }
.deva {
  font-size: clamp(40rem, 12vw, 110rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
  margin-bottom: clamp(20rem, 4vw, 36rem);
  color: color-mix(in srgb, var(--color-accent) 55%, var(--color-text));
}
.deva-trans { text-align: center; }

.transforms {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: clamp(18rem, 3.5vw, 34rem);
  max-width: 900rem;
  margin: 0 auto clamp(80rem, 14vw, 170rem);
}
.transform-pair {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: clamp(14rem, 3vw, 32rem);
  font-size: clamp(26rem, 7vw, 60rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  flex-wrap: wrap;
}
.t-from { opacity: 0.5; }
.t-arrow { opacity: 0.35; font-weight: 300; }

.payoff { max-width: 1100rem; margin: 0 auto; }
.payoff .lg { opacity: 0.6; margin-bottom: clamp(14rem, 2.5vw, 24rem); }
.payoff-line { margin: 0; }

/* ───────────────────── 8 · signature ───────────────────── */
.mv--signature {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: clamp(40rem, 7vw, 110rem);
  align-items: center;
}
.portrait {
  margin: 0;
  overflow: hidden;
  border-radius: var(--radius-l);
}
.portrait-img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: top center;
  display: block;
  will-change: transform, filter;
}
.signature-copy { max-width: 560rem; }
.sign-line { margin: 0; }
.sign-name {
  margin-top: clamp(18rem, 3vw, 28rem);
  font-size: clamp(18rem, 5vw, 26rem);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: color-mix(in srgb, var(--color-accent) 55%, var(--color-text));
}
.sign-now {
  margin-top: clamp(36rem, 6vw, 56rem);
  font-size: clamp(17rem, 4vw, 22rem);
  font-weight: 500;
  line-height: 1.5;
}
.sign-role {
  margin-top: clamp(12rem, 2vw, 18rem);
  font-size: 12rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.45;
}

/* ───────────────────── 9 · close ───────────────────────── */
.mv--close {
  min-height: 80svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: clamp(40rem, 7vw, 70rem);
}
.cta-link {
  font-size: clamp(36rem, 10vw, 96rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.04em;
  display: inline-block;
  transition: opacity 0.4s ease, transform 0.5s var(--ease-spring);
}
.cta-link:hover { transform: translateX(14rem); }
.contacts {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(20rem, 5vw, 48rem);
}
.contact {
  font-size: clamp(15rem, 3.4vw, 19rem);
  font-weight: 500;
  letter-spacing: 0.02em;
  opacity: 0.65;
  border-bottom: 1rem solid color-mix(in srgb, var(--color-text) 30%, transparent);
  padding-bottom: 4rem;
  transition: opacity 0.3s ease, border-color 0.3s ease;
}
.contact:hover {
  opacity: 1;
  border-color: var(--color-text);
}

/* ───────────────────── responsive ──────────────────────── */
@media (max-width: 760px) {
  .mv { padding-inline: clamp(22rem, 7vw, 40rem); }
  .origin-aside { margin-inline: 0; }
  .mv--signature {
    grid-template-columns: 1fr;
    gap: clamp(36rem, 8vw, 60rem);
  }
  .portrait { order: -1; }
  .portrait-img { aspect-ratio: 3 / 4; }
  .transform-pair { gap: 12rem; }
  .c-label { font-size: clamp(10rem, 3.2vw, 13rem); }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-cue__line { animation: none; }
}
</style>
