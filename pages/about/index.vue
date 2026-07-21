<script setup lang="ts">
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

definePageMeta({ layout: false, pageTransition: { name: 'os-fade', mode: 'out-in' } })
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'Naveen Jose — a certified instructional designer who designs learning, builds the tools to deliver it, and keeps daring to learn new tech.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'An instructional designer who designs, builds, and dares to try new tech.',
  ogUrl: 'https://entertrainer.in/about'
})
useHead({
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Instrument+Serif:ital@0;1&display=swap' }]
})

// Terminal script — full text lives in the DOM (accessible); reveal is per-line.
const TERM: { p: string; o?: string; cls?: string }[] = [
  { p: '$ whoami' },
  { o: 'naveen jose — instructional designer (who codes)', cls: 'ok' },
  { p: '$ ls ~/skills' },
  { o: 'design/   build/   dare/', cls: 'dim' },
  { p: '$ cat ~/dare/tech.txt' },
  { o: 'Articulate Storyline · SCORM · Vue + Nuxt · GSAP · Three.js / WebGL · a little Python · Figma · whatever the project needs', cls: 'cyan' },
  { p: '$ echo "this very site?"' },
  { o: 'designed & built by me. yup — both.', cls: 'mag' }
]

const PILLARS = [
  { k: 'design', tag: '/design', title: 'I design', body: 'Certified instructional designer. Storyboards, e-learning and programs that people actually finish — built on real learning principles, not filler.', tools: ['Instructional design', 'Storyline', 'Storyboarding', 'L&D programs'] },
  { k: 'build', tag: '/build', title: 'I build', body: 'I ship the tools too. This site, StoryGen, EasyMCQ, Cadence, Draftly — real apps for L&D teams, made because the idea deserved to exist.', tools: ['Vue + Nuxt', 'Design systems', 'Free web apps', 'Ship it'] },
  { k: 'dare', tag: '/dare', title: 'I dare', body: 'I keep trying tech that scares me a little — motion, WebGL, a bit of AI, some Python — whenever it makes the learning land better.', tools: ['GSAP', 'Three.js / WebGL', 'AI', 'Python'] }
]

const FILES = [
  { n: '01', img: '/about-me.png',                      title: 'Hello', place: 'Gurugram, IN', body: 'A certified instructional designer. Here is the short version.' },
  { n: '02', img: '/about/about-housekeeper-1.webp',    title: 'The floor', place: 'Chennai · Hospitality', body: 'Started in hotels. Learned to notice the small things that make service feel human.' },
  { n: '03', img: '/about/about-sewa-1.webp',           title: 'The turn', place: 'Club Mahindra · L&D', body: 'Moved into L&D and drew The SEWA Chronicles. Design became the plan.' },
  { n: '04', img: '/about/about-onboarding.webp',       title: 'The craft', place: 'Courtyard by Marriott', body: 'Ran certification programs, frontline to managers. Learned how a program holds together.' },
  { n: '05', img: '/about/about-ignite.webp',           title: 'The tools', place: 'The workbench', body: 'Build modules in Storyline with a little video and motion — something people want to finish.' },
  { n: '06', img: '/about/about-concentrix.webp',       title: 'Today', place: 'Concentrix · TaaS', body: 'Turning operational detail into e-learning for teams around the world.', foot: 'Asatoma Sadgamaya — from ignorance, toward truth.' }
]

const root = ref<HTMLElement | null>(null)
const clock = ref('--:--:--')
let clockTimer: ReturnType<typeof setInterval> | null = null
let ctx: gsap.Context | null = null
let reduce = false
const { $lenis } = useNuxtApp() as unknown as { $lenis?: { on: Function; off: Function } }
const sync = () => ScrollTrigger.update()

function tickClock() {
  const d = new Date(); const p = (n: number) => String(n).padStart(2, '0')
  clock.value = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// Draggable stickers (shared pattern with the home desktop)
let zTop = 30
function onDrag(e: PointerEvent) {
  if (reduce) return
  const el = e.currentTarget as HTMLElement
  e.preventDefault(); e.stopPropagation()
  el.setPointerCapture(e.pointerId); el.classList.add('is-drag'); el.style.zIndex = String(++zTop)
  const ox = parseFloat(el.dataset.x || '0'), oy = parseFloat(el.dataset.y || '0')
  const rot = parseFloat(el.dataset.rot || '0'); const sx = e.clientX, sy = e.clientY; let lastX = sx
  const move = (ev: PointerEvent) => {
    const nx = ox + (ev.clientX - sx), ny = oy + (ev.clientY - sy)
    el.dataset.x = String(nx); el.dataset.y = String(ny)
    const tilt = Math.max(-14, Math.min(14, (ev.clientX - lastX) * 1.3)); lastX = ev.clientX
    el.style.transform = `translate(${nx}px, ${ny}px) rotate(${rot + tilt}deg)`
  }
  const up = (ev: PointerEvent) => {
    el.releasePointerCapture(ev.pointerId); el.classList.remove('is-drag')
    el.style.transform = `translate(${el.dataset.x}px, ${el.dataset.y}px) rotate(${rot}deg)`
    el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up)
  }
  el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up)
}

onMounted(async () => {
  reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  tickClock(); clockTimer = setInterval(tickClock, 1000)
  await nextTick()
  gsap.registerPlugin(ScrollTrigger)
  $lenis?.on('scroll', sync)
  if (reduce) { ScrollTrigger.refresh(); return }

  ctx = gsap.context(() => {
    // Windows "open" as you reach them
    gsap.utils.toArray<HTMLElement>('.win').forEach((w) => {
      gsap.from(w, {
        opacity: 0, y: 30, scale: 0.965, transformOrigin: '50% 0%', duration: 0.6, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: w, start: 'top 85%' }
      })
    })
    // Terminal lines print in sequence
    const lines = gsap.utils.toArray<HTMLElement>('.term__line')
    gsap.from(lines, {
      opacity: 0, x: -8, duration: 0.28, stagger: 0.16, ease: 'none',
      scrollTrigger: { trigger: '.term', start: 'top 72%' }
    })
    // File cards stagger
    gsap.from('.file', {
      opacity: 0, y: 26, duration: 0.5, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.files', start: 'top 80%' }
    })
  }, root.value!)

  ScrollTrigger.refresh()
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
})
onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  $lenis?.off?.('scroll', sync)
  ctx?.revert(); ScrollTrigger.getAll().forEach((t) => t.kill())
})
</script>

<template>
  <div ref="root" class="osx" :class="{ 'osx--reduce': reduce }">
    <div class="osx__grain" aria-hidden="true" />
    <div class="osx__scan" aria-hidden="true" />
    <div class="osx__glow" aria-hidden="true" />

    <!-- OS top bar -->
    <header class="osx__bar">
      <NuxtLink to="/" class="osx__back" aria-label="Back to the desktop">◂ desktop</NuxtLink>
      <span class="osx__title" aria-hidden="true">entertrainer<span class="cy">.os</span> ▸ /about</span>
      <span class="osx__clock" aria-hidden="true">{{ clock }}</span>
    </header>

    <main class="osx__desk">
      <!-- about.exe -->
      <section class="win win--hero">
        <div class="win__bar"><span class="win__dots"><i /><i /><i /></span><span class="win__name">about.exe</span><span class="win__ctl">_ ▢ ✕</span></div>
        <div class="win__body hero">
          <div class="hero__copy">
            <span class="kick">readme.txt</span>
            <h1 class="hero__head">I <em class="cy">design</em>,<br>I <em class="mg">build</em>,<br>I <em class="bl">dare</em>.</h1>
            <p class="hero__sub">I’m <strong>Naveen Jose</strong> — a certified instructional designer who designs learning, builds the tools to deliver it, and keeps daring to try new tech.</p>
            <div class="hero__meta"><span>● instructional designer</span><span>● gurugram, in</span><span>● #opentowork</span></div>
          </div>
          <figure class="polaroid" data-rot="4" @pointerdown="onDrag" tabindex="0" aria-label="Portrait of Naveen Jose — drag me">
            <img src="/about-me.png" alt="Portrait of Naveen Jose" width="1920" height="1080" draggable="false" />
            <figcaption>~/naveen.jpg</figcaption>
          </figure>
        </div>
      </section>

      <!-- terminal -->
      <section class="win win--term term">
        <div class="win__bar"><span class="win__dots"><i /><i /><i /></span><span class="win__name">terminal — ~/naveen</span><span class="win__ctl">_ ▢ ✕</span></div>
        <div class="win__body term__body">
          <p v-for="(l, i) in TERM" :key="i" class="term__line" :class="l.cls">
            <span v-if="l.p" class="term__prompt">{{ l.p }}</span>
            <span v-else class="term__out">→ {{ l.o }}</span>
          </p>
          <p class="term__line term__cursor" aria-hidden="true"><span class="term__prompt">$ <span class="caret" /></span></p>
        </div>
      </section>

      <!-- pillars -->
      <section class="pillars">
        <article v-for="p in PILLARS" :key="p.k" class="win win--pill" :class="`pill--${p.k}`">
          <div class="win__bar"><span class="win__dots"><i /><i /><i /></span><span class="win__name">{{ p.tag }}</span></div>
          <div class="win__body pill__body">
            <h2 class="pill__title">{{ p.title }}</h2>
            <p class="pill__text">{{ p.body }}</p>
            <ul class="pill__tags"><li v-for="t in p.tools" :key="t">{{ t }}</li></ul>
          </div>
        </article>
      </section>

      <!-- journey — recent files -->
      <section class="win win--files">
        <div class="win__bar"><span class="win__dots"><i /><i /><i /></span><span class="win__name">journey — recent files</span><span class="win__ctl">_ ▢ ✕</span></div>
        <div class="win__body files">
          <article v-for="f in FILES" :key="f.n" class="file">
            <div class="file__thumb"><img :src="f.img" :alt="f.title" width="600" height="750" loading="lazy" decoding="async" draggable="false" /><span class="file__n">{{ f.n }}</span></div>
            <div class="file__meta">
              <h3 class="file__title">{{ f.title }}</h3>
              <span class="file__place">{{ f.place }}</span>
              <p class="file__body">{{ f.body }}</p>
              <p v-if="f.foot" class="file__foot">{{ f.foot }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- CTA -->
      <section class="win win--cta">
        <div class="win__bar"><span class="win__dots"><i /><i /><i /></span><span class="win__name">next.exe</span></div>
        <div class="win__body cta">
          <p class="cta__line">Want to see what I’ve shipped?</p>
          <div class="cta__row">
            <NuxtLink to="/my-work" class="btn btn--mg">open /my-work ▸</NuxtLink>
            <NuxtLink to="/tools" class="btn btn--cy">open /web-apps ▸</NuxtLink>
            <NuxtLink to="/" class="btn">◂ back to desktop</NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <!-- floating stickers -->
    <button type="button" class="stk stk--star" data-rot="8" aria-label="Sparkle sticker — drag me" @pointerdown="onDrag">
      <svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M32 2c2 16 12 26 28 30-16 4-26 14-28 30-2-16-12-26-28-30 16-4 26-14 28-30Z" fill="#18ffe8" stroke="#0d0c0a" stroke-width="2.5" stroke-linejoin="round"/></svg>
    </button>
    <button type="button" class="stk stk--stamp" data-rot="-12" aria-label="Certified sticker — drag me" @pointerdown="onDrag">
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <defs><path id="ax-arc" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0"/></defs>
        <circle cx="60" cy="60" r="56" fill="#f300c2" stroke="#0d0c0a" stroke-width="2.5"/>
        <text fill="#ffeefc" font-family="'Space Mono',monospace" font-size="12" font-weight="700" letter-spacing="3"><textPath href="#ax-arc" startOffset="0">CERTIFIED ✦ CURIOUS ✦ CERTIFIED ✦ CURIOUS ✦</textPath></text>
        <text x="60" y="66" text-anchor="middle" fill="#18ffe8" font-family="'Space Mono',monospace" font-size="24" font-weight="700">N.J</text>
      </svg>
    </button>

    <!-- marquee -->
    <div class="osx__marq" aria-hidden="true">
      <div class="osx__track">
        <template v-for="pass in 2" :key="pass">
          <span v-for="(w, i) in ['I design','I build','I dare new tech','instructional designer','learning that feels human']" :key="pass+'-'+i" class="osx__mi" :class="{ alt: i%2 }">{{ w }}<i>✳</i></span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.osx {
  --bg: #0b0712; --paper: #f3ecf6; --dim: rgba(243,236,246,0.62);
  --mag: #f300c2; --cy: #18ffe8; --bl: #8b8cff; --ink: #0d0c0a;
  --win: rgba(24,18,32,0.72); --winbar: rgba(255,255,255,0.06); --edge: rgba(255,255,255,0.14);
  --mono: 'Space Mono', ui-monospace, monospace; --serif: 'Instrument Serif', Georgia, serif;
  position: relative; min-height: 100dvh; background: var(--bg); color: var(--paper);
  overflow-x: clip; font-family: var(--main-font);
}
.cy { color: var(--cy); } .mg { color: var(--mag); } .bl { color: var(--bl); }

.osx__glow { position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(60vw 55vw at 78% 12%, rgba(243,0,194,0.22), transparent 60%), radial-gradient(55vw 55vw at 12% 82%, rgba(24,255,232,0.16), transparent 60%), radial-gradient(50vw 50vw at 50% 50%, rgba(139,140,255,0.10), transparent 65%); }
.osx__grain { position: fixed; inset: 0; z-index: 7; pointer-events: none; opacity: 0.05; mix-blend-mode: screen;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.osx__scan { position: fixed; inset: 0; z-index: 6; pointer-events: none; opacity: 0.4; mix-blend-mode: soft-light;
  background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px); }

/* top bar */
.osx__bar { position: fixed; top: 0; left: 0; right: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between;
  gap: 14rem; padding: calc(12rem + var(--safe-top)) clamp(14rem,3vw,32rem) 12rem; font-family: var(--mono); font-size: 12rem;
  background: linear-gradient(var(--bg), rgba(11,7,18,0)); }
.osx__back { color: var(--paper); text-decoration: none; min-height: 40rem; display: inline-flex; align-items: center; padding: 0 6rem; border-radius: 6rem; }
.osx__back:hover { color: var(--cy); } .osx__back:focus-visible { outline: 2px solid var(--cy); outline-offset: 3px; }
.osx__title { color: var(--dim); letter-spacing: 0.04em; }
.osx__clock { color: var(--dim); }
@media (max-width: 640px) { .osx__title { display: none; } }

/* desktop layout */
.osx__desk { position: relative; z-index: 2; max-width: 1080rem; margin: 0 auto;
  padding: calc(78rem + var(--safe-top)) clamp(14rem,4vw,40rem) 120rem; display: flex; flex-direction: column; gap: clamp(26rem,4vw,48rem); }

/* window shell */
.win { background: var(--win); border: 1px solid var(--edge); border-radius: 12rem; overflow: hidden;
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: 0 30rem 70rem -40rem rgba(0,0,0,0.8); }
.win__bar { display: flex; align-items: center; gap: 10rem; padding: 9rem 13rem; background: var(--winbar); border-bottom: 1px solid var(--edge); font-family: var(--mono); font-size: 11.5rem; }
.win__dots { display: inline-flex; gap: 6rem; }
.win__dots i { width: 10rem; height: 10rem; border-radius: 50%; background: var(--mag); }
.win__dots i:nth-child(2) { background: var(--cy); } .win__dots i:nth-child(3) { background: var(--bl); }
.win__name { color: var(--dim); letter-spacing: 0.02em; }
.win__ctl { margin-left: auto; color: rgba(243,236,246,0.4); letter-spacing: 2rem; }
.win__body { padding: clamp(20rem,3vw,40rem); }

/* hero */
.hero { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: clamp(20rem,3vw,44rem); align-items: center; }
.kick { font-family: var(--mono); font-size: 12rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--dim); }
.hero__head { font-family: var(--serif); font-weight: 400; font-size: clamp(52rem,9vw,116rem); line-height: 0.92; letter-spacing: -0.01em; margin: 14rem 0 0; }
.hero__head em { font-style: italic; }
.hero__sub { margin: 24rem 0 0; max-width: 46ch; font-size: clamp(15rem,1.6vw,18rem); line-height: 1.6; color: rgba(243,236,246,0.86); }
.hero__sub strong { color: var(--paper); }
.hero__meta { margin-top: 22rem; display: flex; flex-wrap: wrap; gap: 8rem 20rem; font-family: var(--mono); font-size: 11.5rem; color: var(--cy); }
.polaroid { margin: 0; background: #f3ecf6; padding: 12rem 12rem 40rem; border-radius: 3rem; box-shadow: 0 20rem 50rem -18rem rgba(0,0,0,0.7);
  transform: rotate(4deg); cursor: grab; touch-action: none; will-change: transform; justify-self: center; width: 100%; max-width: 260rem; }
.polaroid.is-drag { cursor: grabbing; }
.polaroid img { display: block; width: 100%; aspect-ratio: 4/5; object-fit: cover; object-position: 50% 30%; }
.polaroid figcaption { font-family: var(--mono); font-size: 12rem; color: #0d0c0a; text-align: center; padding-top: 12rem; }
.polaroid:focus-visible { outline: 2px solid var(--cy); outline-offset: 4px; }

/* terminal */
.term__body { font-family: var(--mono); font-size: clamp(12.5rem,1.4vw,14.5rem); line-height: 1.9; background: rgba(6,4,10,0.5); }
.term__line { margin: 0; white-space: pre-wrap; word-break: break-word; }
.term__prompt { color: var(--paper); }
.term__out { color: var(--dim); }
.term__line.ok .term__out { color: #7CFFA0; } .term__line.cyan .term__out { color: var(--cy); }
.term__line.mag .term__out { color: var(--mag); } .term__line.dim .term__out { color: var(--dim); }
.caret { display: inline-block; width: 8rem; height: 15rem; background: var(--cy); vertical-align: -2rem; margin-left: 2rem; animation: ax-blink 1.1s steps(1) infinite; }
@keyframes ax-blink { 0%,55% { opacity: 1 } 56%,100% { opacity: 0 } }

/* pillars */
.pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(16rem,2vw,24rem); }
.pill__body { padding: clamp(18rem,2vw,26rem); }
.pill__title { font-family: var(--serif); font-style: italic; font-weight: 400; font-size: clamp(30rem,3.4vw,44rem); margin: 0; }
.pill--design .pill__title { color: var(--cy); } .pill--build .pill__title { color: var(--mag); } .pill--dare .pill__title { color: var(--bl); }
.pill__text { margin: 12rem 0 0; font-size: 14.5rem; line-height: 1.6; color: rgba(243,236,246,0.82); }
.pill__tags { list-style: none; margin: 18rem 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 7rem; }
.pill__tags li { font-family: var(--mono); font-size: 11rem; padding: 5rem 9rem; border: 1px solid var(--edge); border-radius: 999rem; color: var(--dim); }

/* files */
.files { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(14rem,2vw,22rem); }
.file { display: flex; gap: 16rem; padding: 14rem; background: rgba(255,255,255,0.03); border: 1px solid var(--edge); border-radius: 10rem; }
.file__thumb { position: relative; flex: 0 0 92rem; }
.file__thumb img { width: 92rem; height: 116rem; object-fit: cover; border-radius: 6rem; filter: saturate(1.05); display: block; }
.file__n { position: absolute; top: 5rem; left: 5rem; font-family: var(--mono); font-size: 10rem; font-weight: 700; color: var(--ink); background: var(--cy); padding: 2rem 5rem; border-radius: 3rem; }
.file__meta { min-width: 0; }
.file__title { font-family: var(--serif); font-style: italic; font-size: 24rem; font-weight: 400; margin: 0; }
.file__place { font-family: var(--mono); font-size: 10.5rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--cy); }
.file__body { margin: 8rem 0 0; font-size: 13rem; line-height: 1.5; color: rgba(243,236,246,0.78); }
.file__foot { margin: 8rem 0 0; font-family: var(--mono); font-size: 11rem; font-style: italic; color: var(--dim); }

/* cta */
.cta { text-align: center; }
.cta__line { font-family: var(--serif); font-style: italic; font-size: clamp(26rem,3vw,40rem); margin: 0 0 22rem; }
.cta__row { display: flex; flex-wrap: wrap; gap: 12rem; justify-content: center; }
.btn { display: inline-flex; align-items: center; min-height: 50rem; padding: 0 22rem; font-family: var(--mono); font-size: 13rem; text-decoration: none;
  color: var(--paper); border: 1px solid var(--edge); border-radius: 8rem; background: rgba(255,255,255,0.04); transition: transform 0.18s ease, background 0.18s ease; }
.btn:hover { transform: translateY(-2rem); background: rgba(255,255,255,0.1); }
.btn--mg { background: var(--mag); color: var(--ink); border-color: var(--mag); font-weight: 700; }
.btn--cy { background: var(--cy); color: var(--ink); border-color: var(--cy); font-weight: 700; }
.btn:focus-visible { outline: 2px solid var(--cy); outline-offset: 3px; }

/* stickers */
.stk { position: fixed; z-index: 20; pointer-events: auto; padding: 0; border: 0; background: none; cursor: grab; touch-action: none;
  filter: drop-shadow(3rem 5rem 0 rgba(0,0,0,0.4)); animation: ax-float 6s ease-in-out infinite; }
.stk.is-drag { cursor: grabbing; animation: none; }
.osx--reduce .stk { animation: none; }
.stk--star { width: 50rem; height: 50rem; right: 7vw; top: 22vh; }
.stk--stamp { width: 96rem; height: 96rem; left: 5vw; bottom: 14vh; animation-delay: -2s; }
.stk:focus-visible { outline: 2px solid var(--cy); outline-offset: 4px; }
@keyframes ax-float { 0%,100% { translate: 0 0 } 50% { translate: 0 -9rem } }
@media (max-width: 900px) { .stk--star { display: none; } .stk--stamp { width: 72rem; height: 72rem; left: auto; right: 5vw; bottom: 16vh; } }

/* marquee */
.osx__marq { position: fixed; left: 0; right: 0; bottom: 0; z-index: 25; overflow: hidden; pointer-events: none;
  border-top: 1.5px solid var(--ink); background: rgba(11,7,18,0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); padding: 8rem 0; }
.osx__track { display: inline-flex; white-space: nowrap; animation: ax-marq 22s linear infinite; }
.osx--reduce .osx__track { animation: none; }
@keyframes ax-marq { to { transform: translateX(-50%) } }
.osx__mi { display: inline-flex; align-items: center; font-family: var(--mono); font-weight: 700; text-transform: uppercase; font-size: 13rem; color: var(--cy); padding: 0 3rem; }
.osx__mi.alt { color: var(--mag); }
.osx__mi i { font-style: normal; color: var(--paper); margin: 0 20rem; font-size: 0.7em; }

.os-fade-enter-active, .os-fade-leave-active { transition: opacity 0.35s ease; }
.os-fade-enter-from, .os-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) { .caret { animation: none; } }

/* responsive */
@media (max-width: 860px) {
  .hero { grid-template-columns: 1fr; }
  .polaroid { order: -1; max-width: 220rem; }
  .pillars { grid-template-columns: 1fr; }
  .files { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .osx__desk { padding-bottom: 130rem; }
  .file { flex-direction: row; }
}
</style>
