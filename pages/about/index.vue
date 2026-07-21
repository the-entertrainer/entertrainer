<script setup lang="ts">
// About — editorial + modern, animated with Motion for Vue (v-motion springs)
// and set in Fraunces. Theme-aware via the site tokens; reduced-motion safe
// through useReveal(). No GSAP here — reveals are declarative.
definePageMeta({ layout: false })
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'Naveen Jose — a certified instructional designer who designs learning, builds the tools to deliver it, and keeps daring to try new tech.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'A certified instructional designer who designs, builds, and dares to try new tech.',
  ogUrl: 'https://entertrainer.in/about'
})

const R = useReveal()
const rv = {
  eyebrow: R.rise(0), name: R.rise(90), lead: R.rise(210), meta: R.rise(300),
  portrait: R.scaleIn(140), cue: R.fade(460)
}

interface Chapter { n: string; eyebrow: string; head: string; body: string; img: string; alt: string; place: string; footnote?: string }
const CHAPTERS: Chapter[] = [
  { n: '02', eyebrow: 'Where it began', head: 'It started in hospitality',
    body: 'I studied hotel management in Chennai and began on the floor. Hospitality is where I learned to notice the small things that make service feel human — the details nobody asks for but everybody remembers.',
    img: '/about/about-housekeeper-1.webp', alt: 'On the hotel floor in the early hospitality years', place: 'Chennai · Hotel management' },
  { n: '03', eyebrow: 'The turn', head: 'A comic, and a new path',
    body: 'At Club Mahindra I moved into learning and development, and drew The SEWA Chronicles — a small comic of real guest-experience stories. That was the moment design stopped being a side interest and became the plan.',
    img: '/about/about-sewa-1.webp', alt: 'A page from The SEWA Chronicles comic', place: 'Club Mahindra · L&D' },
  { n: '04', eyebrow: 'The craft', head: 'Learning the craft',
    body: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams — frontline associates through to managers. I learned how a good program actually holds together.',
    img: '/about/about-onboarding.webp', alt: 'Running a training session at Courtyard by Marriott', place: 'Courtyard by Marriott' },
  { n: '05', eyebrow: 'The tools', head: 'I design, and I build',
    body: 'I build training in Articulate Storyline — but I also ship the tools around it. StoryGen, EasyMCQ, Cadence, this very site: designed and built by me, because the idea deserved to exist.',
    img: '/about/about-ignite.webp', alt: 'A module in progress on the workbench', place: 'The workbench' },
  { n: '06', eyebrow: 'Now', head: 'Designing, building, daring',
    body: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world — and still daring to try new tech (a little motion, some WebGL, a bit of AI) whenever it makes the learning land better.',
    img: '/about/about-concentrix.webp', alt: 'Portrait, present day, at Concentrix', place: 'Concentrix · Training-as-a-Service',
    footnote: 'Asatoma Sadgamaya — from ignorance, toward truth.' }
]

const root = ref<HTMLElement | null>(null)
const progress = ref(0)
const active = ref(0)
const STEPS = CHAPTERS.length + 1
let io: IntersectionObserver | null = null
const { $lenis } = useNuxtApp() as unknown as { $lenis?: { on: Function; off: Function; scrollTo: Function } }

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
}
function jumpTo(i: number) {
  const target = i <= 0
    ? root.value?.querySelector<HTMLElement>('.ab-hero')
    : root.value?.querySelectorAll<HTMLElement>('.ab-ch')[i - 1]
  if (!target) return
  if ($lenis?.scrollTo) $lenis.scrollTo(target, { offset: -60, duration: 1 })
  else target.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  $lenis?.on?.('scroll', onScroll)
  // Active-section tracking for the stepper.
  const sections = [root.value?.querySelector('.ab-hero'), ...Array.from(root.value?.querySelectorAll('.ab-ch') ?? [])].filter(Boolean) as HTMLElement[]
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const idx = sections.indexOf(e.target as HTMLElement)
        if (idx >= 0) active.value = idx
      }
    })
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 })
  sections.forEach((s) => io!.observe(s))
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  $lenis?.off?.('scroll', onScroll)
  io?.disconnect()
})
</script>

<template>
  <div ref="root" class="ab">
    <div class="ab-prog" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }" /></div>

    <header class="ab-bar">
      <NuxtLink to="/" class="ab-back" aria-label="Back to the site">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg><span>Back</span>
      </NuxtLink>
      <span class="ab-bar__word">Naveen Jose</span>
      <NuxtLink to="/my-work" class="ab-bar__link">Work<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg></NuxtLink>
    </header>

    <nav class="ab-steps" aria-label="Jump to chapter">
      <button v-for="i in STEPS" :key="i" type="button" class="ab-step" :class="{ on: active === i - 1 }"
        :aria-label="i === 1 ? 'Introduction' : `Chapter ${CHAPTERS[i - 2].n}: ${CHAPTERS[i - 2].head}`"
        :aria-current="active === i - 1 ? 'true' : undefined" @click="jumpTo(i - 1)"><span /></button>
    </nav>

    <!-- Hero -->
    <section class="ab-hero">
      <div class="ab-hero__glow" aria-hidden="true" />
      <div class="ab-hero__copy">
        <span class="ab-hero__eyebrow" v-motion :initial="rv.eyebrow.initial" :visible-once="rv.eyebrow.visibleOnce">About · a short story</span>
        <h1 class="ab-hero__name" v-motion :initial="rv.name.initial" :visible-once="rv.name.visibleOnce">Naveen<br>Jose</h1>
        <p class="ab-hero__lead" v-motion :initial="rv.lead.initial" :visible-once="rv.lead.visibleOnce">A certified instructional designer who <em>designs</em> learning, <em>builds</em> the tools to deliver it, and keeps <em>daring</em> to try new tech.</p>
        <div class="ab-hero__meta" v-motion :initial="rv.meta.initial" :visible-once="rv.meta.visibleOnce">
          <span>Instructional Designer</span><i aria-hidden="true">·</i><span>Gurugram, IN</span>
        </div>
      </div>
      <figure class="ab-hero__portrait" v-motion :initial="rv.portrait.initial" :visible-once="rv.portrait.visibleOnce">
        <img src="/about-me.png" alt="Portrait of Naveen Jose" width="1920" height="1080" loading="eager" draggable="false" />
      </figure>
      <span class="ab-hero__cue" aria-hidden="true" v-motion :initial="rv.cue.initial" :visible-once="rv.cue.visibleOnce"><span class="ab-hero__cue-line" /> scroll</span>
    </section>

    <!-- Chapters -->
    <main class="ab-body">
      <section v-for="(c, i) in CHAPTERS" :key="i" class="ab-ch" :class="{ 'ab-ch--rev': i % 2 === 1 }" :aria-labelledby="`ab-h-${i}`">
        <figure class="ab-ch__figure" v-motion :initial="R.scaleIn(0).initial" :visible-once="R.scaleIn(0).visibleOnce">
          <div class="ab-ch__frame"><img class="ab-ch__img" :src="c.img" :alt="c.alt" width="1131" height="1414" loading="lazy" decoding="async" draggable="false" /></div>
          <figcaption class="ab-ch__place">{{ c.place }}</figcaption>
        </figure>
        <div class="ab-ch__prose">
          <span class="ab-ch__eyebrow" v-motion :initial="R.slideX(-24,60).initial" :visible-once="R.slideX(-24,60).visibleOnce"><em>{{ c.n }}</em> — {{ c.eyebrow }}</span>
          <h2 :id="`ab-h-${i}`" class="ab-ch__head" v-motion :initial="R.rise(120).initial" :visible-once="R.rise(120).visibleOnce">{{ c.head }}</h2>
          <p class="ab-ch__body" v-motion :initial="R.rise(200).initial" :visible-once="R.rise(200).visibleOnce">{{ c.body }}</p>
          <p v-if="c.footnote" class="ab-ch__foot" v-motion :initial="R.rise(280).initial" :visible-once="R.rise(280).visibleOnce">{{ c.footnote }}</p>
          <div v-if="i === CHAPTERS.length - 1" class="ab-ch__cta" v-motion :initial="R.rise(300).initial" :visible-once="R.rise(300).visibleOnce">
            <NuxtLink to="/my-work" class="glass-btn">See my work</NuxtLink>
            <NuxtLink to="/tools" class="glass-btn glass-btn--ghost">The web apps I built</NuxtLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ab {
  position: relative; background: var(--color-bg); color: var(--color-text);
  min-height: 100dvh; overflow-x: clip;
  --edge: clamp(20rem, 6vw, 96rem); --maxw: 1240rem;
  --serif: 'Fraunces', Georgia, 'Times New Roman', serif;
}

.ab-prog { position: fixed; top: 0; left: 0; right: 0; height: 3rem; z-index: 40; pointer-events: none; background: color-mix(in srgb, var(--color-text) 8%, transparent); }
.ab-prog span { display: block; height: 100%; transform-origin: left; transform: scaleX(0); background: var(--color-text); opacity: 0.85; }

.ab-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 36; display: flex; align-items: center; justify-content: space-between; gap: 16rem; padding: calc(14rem + var(--safe-top)) var(--edge) 14rem; }
.ab-bar::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(var(--color-bg), transparent); -webkit-mask: linear-gradient(#000, #000 55%, transparent); mask: linear-gradient(#000, #000 55%, transparent); }
.ab-back, .ab-bar__link { display: inline-flex; align-items: center; gap: 7rem; min-height: 44rem; padding: 0 4rem; color: var(--color-text); text-decoration: none; font-size: 13.5rem; font-weight: 600; opacity: 0.82; transition: opacity 0.25s ease, transform 0.25s ease; border-radius: 8rem; }
.ab-back:hover, .ab-bar__link:hover { opacity: 1; } .ab-back:hover { transform: translateX(-2rem); } .ab-bar__link:hover { transform: translateX(2rem); }
.ab-bar__word { font-size: 12rem; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; opacity: 0.6; }
.ab-back:focus-visible, .ab-bar__link:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; opacity: 1; }
@media (max-width: 560px) { .ab-bar__word { display: none; } }

.ab-steps { position: fixed; right: clamp(14rem, 2.4vw, 30rem); top: 50%; translate: 0 -50%; z-index: 36; display: flex; flex-direction: column; gap: 2rem; }
.ab-step { width: 40rem; height: 40rem; padding: 0; background: none; border: 0; cursor: pointer; display: grid; place-items: center; }
.ab-step span { width: 22rem; height: 2rem; border-radius: 2rem; background: var(--color-text); opacity: 0.22; transition: opacity 0.35s ease, width 0.4s var(--ease-spring); }
.ab-step:hover span { opacity: 0.5; } .ab-step.on span { opacity: 0.95; width: 30rem; }
.ab-step:focus-visible { outline: 2px solid var(--color-text); outline-offset: 2px; border-radius: 6rem; }
@media (max-width: 900px) { .ab-steps { display: none; } }

.ab-hero { position: relative; max-width: var(--maxw); margin: 0 auto; padding: calc(120rem + var(--safe-top)) var(--edge) clamp(60rem, 10vh, 120rem); display: grid; gap: clamp(30rem, 5vw, 70rem); align-items: center; grid-template-columns: 1.05fr 0.95fr; min-height: 100dvh; }
.ab-hero__glow { position: absolute; z-index: 0; top: 18%; left: 28%; width: 60vw; height: 60vw; max-width: 720rem; max-height: 720rem; translate: -50% -30%; pointer-events: none; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--color-accent) 42%, transparent), transparent 62%); opacity: 0.3; filter: blur(30rem); }
.ab-hero__copy { position: relative; z-index: 2; max-width: 560rem; }
.ab-hero__eyebrow { display: inline-block; font-size: 12rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; opacity: 0.7; margin-bottom: 22rem; }
.ab-hero__name { font-family: var(--serif); font-optical-sizing: auto; font-weight: 400; font-size: clamp(64rem, 11vw, 150rem); line-height: 0.92; letter-spacing: -0.015em; margin: 0; }
.ab-hero__lead { margin: clamp(24rem, 3vw, 38rem) 0 0; max-width: 44ch; font-size: clamp(16rem, 1.8vw, 21rem); line-height: 1.58; opacity: 0.9; }
.ab-hero__lead em { font-family: var(--serif); font-style: italic; font-weight: 500; opacity: 1; }
.ab-hero__meta { margin-top: 26rem; display: flex; align-items: center; gap: 12rem; font-size: 12.5rem; letter-spacing: 0.06em; font-weight: 600; opacity: 0.72; flex-wrap: wrap; }
.ab-hero__meta i { opacity: 0.5; }
.ab-hero__portrait { position: relative; z-index: 1; margin: 0; width: 100%; max-width: 440rem; justify-self: center; aspect-ratio: 4 / 5; border-radius: 18rem; overflow: hidden; box-shadow: 0 50rem 110rem -40rem rgba(0,0,0,0.6), 0 0 0 1px var(--color-glass-border); }
.ab-hero__portrait img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 32%; display: block; }
.ab-hero__cue { position: absolute; left: var(--edge); bottom: clamp(24rem, 5vh, 48rem); z-index: 2; display: inline-flex; align-items: center; gap: 12rem; font-size: 11rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600; opacity: 0.5; }
.ab-hero__cue-line { display: block; width: 46rem; height: 1px; background: currentColor; transform-origin: left; animation: ab-cue 2.4s ease-in-out infinite; }
@keyframes ab-cue { 0%, 100% { transform: scaleX(0.4); opacity: 0.4 } 50% { transform: scaleX(1); opacity: 0.9 } }

.ab-body { position: relative; z-index: 1; }
.ab-ch { max-width: var(--maxw); margin: 0 auto; padding: clamp(60rem, 12vh, 150rem) var(--edge); display: grid; grid-template-columns: 1fr 1fr; gap: clamp(30rem, 6vw, 96rem); align-items: start; }
.ab-ch--rev .ab-ch__figure { order: 2; }
.ab-ch__figure { position: sticky; top: clamp(90rem, 14vh, 140rem); margin: 0; }
.ab-ch__frame { width: 100%; aspect-ratio: 4 / 5; border-radius: 16rem; overflow: hidden; box-shadow: 0 44rem 100rem -44rem rgba(0,0,0,0.6), 0 0 0 1px var(--color-glass-border); }
.ab-ch__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ab-ch__place { margin-top: 14rem; font-size: 11rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; opacity: 0.66; }
.ab-ch__prose { align-self: stretch; max-width: 500rem; min-height: 82vh; display: flex; flex-direction: column; justify-content: center; padding-block: clamp(10rem, 6vh, 60rem); }
.ab-ch__eyebrow { display: inline-block; font-size: 12rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; opacity: 0.72; margin-bottom: 22rem; }
.ab-ch__eyebrow em { font-style: normal; opacity: 0.6; margin-right: 4rem; }
.ab-ch__head { font-family: var(--serif); font-optical-sizing: auto; font-weight: 400; font-size: clamp(34rem, 4.8vw, 66rem); line-height: 1.03; letter-spacing: -0.015em; margin: 0; }
.ab-ch__body { margin: clamp(20rem, 2.4vw, 30rem) 0 0; max-width: 46ch; font-size: clamp(15.5rem, 1.5vw, 18rem); line-height: 1.66; opacity: 0.84; }
.ab-ch__foot { margin: 20rem 0 0; font-family: var(--serif); font-style: italic; font-size: 16rem; opacity: 0.7; }
.ab-ch__cta { display: flex; flex-wrap: wrap; gap: 12rem; margin-top: 34rem; }
.ab-ch__cta .glass-btn { text-decoration: none; }

.ab.is-still .ab-hero__cue-line { animation: none; }
@media (prefers-reduced-motion: reduce) { .ab-hero__cue-line { animation: none; } }

@media (max-width: 900px) {
  .ab-hero { grid-template-columns: 1fr; min-height: auto; padding: calc(96rem + var(--safe-top)) var(--edge) 64rem; gap: 40rem; }
  .ab-hero__portrait { order: -1; max-width: 360rem; aspect-ratio: 3 / 4; }
  .ab-hero__cue { display: none; }
  .ab-hero__glow { top: 6%; left: 50%; width: 90vw; height: 90vw; }
  .ab-ch { grid-template-columns: 1fr; gap: 26rem; padding: clamp(48rem, 9vh, 84rem) var(--edge); }
  .ab-ch--rev .ab-ch__figure { order: 0; }
  .ab-ch__figure { position: static; top: auto; }
  .ab-ch__frame { aspect-ratio: 3 / 4; max-height: 62vh; margin-inline: auto; }
  .ab-ch__prose { max-width: 100%; min-height: 0; display: block; padding-block: 0; }
}
@media (max-width: 480px) { .ab-ch__frame { aspect-ratio: 4 / 5; } }
</style>
