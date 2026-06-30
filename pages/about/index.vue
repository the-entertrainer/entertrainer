<template>
  <div class="about-wrap">
    <!-- Living fluted-glass gradient — the site's signature backdrop -->
    <UiGlassBackdrop />

    <!-- Cinematic film grain + cut flash overlay. Activated on claps for that real projector feel. -->
    <div class="cinema-grain" :class="{ 'cut-flash': isCutting }"></div>

    <!-- Cinematic Clapperboard Navigator: absurd-genius way to "direct" the story -->
    <!-- Clap to cut between scenes. Feels like editing a film. Adds agency + pacing control. -->
    <div class="clapper-nav" :class="{ 'is-clapping': isClapping }" @click="clapToNextScene" @mousedown="armDown" @mouseup="armUp" @mouseleave="armUp">
      <div class="clapper-slate">
        <div class="slate-row">
          <span>ENTERTRAINER</span>
          <span class="take">TAKE {{ currentTake.toString().padStart(2, '0') }}</span>
        </div>
        <div class="slate-row scene">
          SCENE {{ currentScene.toString().padStart(2, '0') }} / {{ totalScenes }}
        </div>
        <div class="slate-row small">DIRECTOR · NAVEEN</div>
      </div>
      <div class="clapper-arm" :style="{ transform: `rotate(${armAngle}deg)` }">
        <div class="arm-inner">CLAP</div>
      </div>
      <div class="clapper-hint">clap to cut</div>
    </div>

    <div class="about-container">

      <!-- ───────────────── Hero panel ───────────────── -->
      <section class="glass-panel about-panel about-panel--hero anim">
        <h1 class="about-intro">
          I am <span class="hl" data-text="Naveen">Naveen</span>.<br>
          And this? This is me finally shipping the one project I didn't know I was building the whole time.
        </h1>
        <hr class="about-rule" />
        <p class="about-lead">
          No roadmap. Just a former housekeeper who one day realized that the way you fold a bedsheet so it feels like a gift and the way you fold a hard idea so it actually sticks in someone's head are the exact same impossible craft.
        </p>
        <p class="about-lead">
          Instructional design crashed the party the night I turned dry service standards into comic strips that people actually wanted to read. That's when I figured out I wasn't just arranging information. I was writing the render loop for how humans change.
        </p>
        <div class="about-extravaganza">
          <span class="code-word">state</span>
          <span class="code-word">→</span>
          <span class="code-word">story</span>
          <span class="code-word">→</span>
          <span class="code-word">shift</span>
        </div>

        <p class="clapper-instruction">Use the clapperboard in the corner to direct the story. Clap to cut between scenes like a real film.</p>
      </section>

      <!-- ───────────────── Chapter 01 · The Floor ───────────────── -->
      <section class="glass-panel about-panel anim">
        <p class="about-chapter"><span class="about-chapter__no">01</span> The Floor</p>
        <p class="about-body">I started my career in the hotel industry and had the opportunity to work with brands such as Marriott International and Club Mahindra. My first job was as a housekeeper - with Club Mahindra. Yes, I made beds, cleaned rooms, folded towel art (the fun stuff), and learned how to make spaces feel welcoming, organized, and beautiful. Housekeeping is an art backed by science. You can still see the way I keep my toilet rolls in my place - nicely folded into a rose 😂 and my bedsheets are always wrinkle free 😉</p>
      </section>

      <figure class="shot shot--duo anim">
        <div class="shot__grid shot__grid--duo">
          <div class="shot__cell">
            <img class="shot__img px" src="/about/about-housekeeper-1.webp" alt="Naveen early in his career at the hotel" loading="lazy" />
          </div>
          <div class="shot__cell">
            <img class="shot__img px" src="/about/about-housekeeper-2.webp" alt="Naveen in a Marriott lobby" loading="lazy" />
          </div>
        </div>
        <figcaption class="shot__cap">
          <span class="shot__cap-rule" />
          <span>Where it started — the floors of Club Mahindra Udaipur. Long before I ever wrote a learning objective, I was learning the real craft: a room (or a mind) only feels right when every tiny detail has been considered and then made invisible.</span>
        </figcaption>
      </figure>

      <section class="glass-panel about-panel about-panel--callout anim">
        <p class="about-callout">
          That job was the original <span class="hl" data-text="debug">debug</span> session. I learned that the tiniest fold, the exact angle of a pillow, the way light hits a made bed — none of it is decoration. It's the difference between "fine" and "holy shit, someone cared."
        </p>
      </section>

      <!-- ───────────────── Chapter 02 · The Spark ───────────────── -->
      <section class="glass-panel about-panel anim">
        <p class="about-chapter"><span class="about-chapter__no">02</span> The Spark</p>
        <p class="about-body">The real plot twist hit when I started turning service standards into comic strips for SEWA. No one had taught me the term "instructional design" yet, but I was already doing the thing: taking something dense and corporate and making it feel like a story you want to keep reading at 1 a.m.</p>
        <p class="about-body">Mentors showed up like good code reviews — blunt, generous, and suddenly the whole mental model recompiled. I started obsessing over the same questions you ask when you're knee-deep in a gnarly frontend problem: how do people actually *parse* this? Where does it break? What makes the lightbulb go off instead of the eyes glaze over?</p>
      </section>

      <figure class="shot shot--editorial anim">
        <div class="shot__grid shot__grid--editorial">
          <div class="shot__cell shot__cell--wide">
            <img class="shot__img px" src="/about/about-sewa-1.webp" alt="SEWA Chronicles comic storyboards laid out on a table" loading="lazy" />
          </div>
          <div class="shot__cell shot__cell--tall">
            <img class="shot__img px" src="/about/about-sewa-2.webp" alt="SEWA Chronicles comic pages in a training room" loading="lazy" />
          </div>
        </div>
        <figcaption class="shot__cap">
          <span class="shot__cap-rule" />
          <span><strong>SEWA Chronicles</strong> — my first project alongside a Corporate L&amp;D team. We turned dry service standards into comic strips. I didn't have the words <em>"instructional design"</em> yet, but this was exactly that: turning information into something people actually wanted to read.</span>
        </figcaption>
      </figure>

      <section class="glass-panel about-panel anim">
        <p class="about-pull">
          What actually kept me up wasn't the content. It was the humans on the other side of it.
        </p>
        <div class="about-questions">
          <p>How does someone's brain decide this is worth paying attention to?</p>
          <p>Why does perfect information still slide right off people?</p>
          <p>What makes a lesson feel like it was written *for them* instead of at them?</p>
        </div>
        <p class="about-body">I got addicted to that exact click — the moment the fog lifts and something that used to be abstract suddenly feels obvious and personal. That's the real craft. Everything else is just scaffolding.</p>
      </section>

      <!-- ───────────────── Chapter 03 · The Craft ───────────────── -->
      <section class="glass-panel about-panel anim">
        <p class="about-chapter"><span class="about-chapter__no">03</span> The Craft</p>
        <p class="about-body">Instructional design, at its best, is just extremely good frontend engineering for the human brain. You decide the data model (what actually needs to be understood), the component architecture (how it should be broken down), and the interaction model (how someone moves through it without getting lost or bored). Then you ship it and watch what actually renders in their head.</p>
        <p class="about-body">The best work doesn't feel like training. It feels like you just handed someone a perfectly tuned shader and they suddenly see the whole scene in a new light.</p>
      </section>

      <figure class="shot shot--gallery anim">
        <div class="shot__grid shot__grid--gallery">
          <figure class="shot__item">
            <div class="shot__cell"><img class="shot__img" src="/about/about-ignite.webp" alt="IGNITE certification program for Marriott International" loading="lazy" /></div>
            <figcaption class="shot__tag">IGNITE · Leadership ignition</figcaption>
          </figure>
          <figure class="shot__item">
            <div class="shot__cell"><img class="shot__img" src="/about/about-cdt.webp" alt="CDT Masterclass — Training the Trainers" loading="lazy" /></div>
            <figcaption class="shot__tag">CDT Masterclass · Training the trainers</figcaption>
          </figure>
          <figure class="shot__item">
            <div class="shot__cell"><img class="shot__img" src="/about/about-onboarding.webp" alt="Heroes On Board onboarding program" loading="lazy" /></div>
            <figcaption class="shot__tag">Heroes On Board · Onboarding</figcaption>
          </figure>
        </div>
        <figcaption class="shot__cap">
          <span class="shot__cap-rule" />
          <span>Programs I went on to design and run for <strong>Marriott International</strong> — rooms full of people learning without ever feeling like they were being taught.</span>
        </figcaption>
      </figure>

      <!-- ───────────────── Chapter 04 · The Present ───────────────── -->
      <section class="glass-panel about-panel anim">
        <p class="about-chapter"><span class="about-chapter__no">04</span> The Present</p>
        <p class="about-body">These days I'm at Concentrix, deep in banking and finance systems, doing the same weird magic trick at scale. Taking frameworks that feel like they were written by lawyers on a bad day and turning them into things actual humans can pick up, play with, and actually use without their eyes rolling back into their skulls.</p>
      </section>

      <figure class="shot shot--solo anim">
        <div class="shot__cell shot__cell--portrait">
          <img class="shot__img px" src="/about/about-concentrix.webp" alt="Illustrated portrait of Naveen" loading="lazy" />
        </div>
        <figcaption class="shot__cap">
          <span class="shot__cap-rule" />
          <span>Still the same obsession. New canvas. New shaders. Same goal: people walk up to something that used to look impenetrable and leave thinking "oh... of course."</span>
        </figcaption>
      </figure>

      <section class="glass-panel about-panel about-panel--closing anim">
        <p class="about-body">That's the real high: when the thing you built stops feeling like "content" and just feels like the obvious next step in someone's head. The gradient keeps shifting, the spiral keeps pulling, and every once in a while the light hits exactly right.</p>
        <p class="about-asatoma">Asatoma Sadgamaya.</p>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

let io: IntersectionObserver | null = null
let ioHl: IntersectionObserver | null = null

// ── Scroll-linked parallax on photographs (cinematic drift) ────────────────
let pxEls: HTMLElement[] = []
let pxRaf = 0
let reduceMotion = false

function applyParallax() {
  pxRaf = 0
  const vh = window.innerHeight
  // Gentler drift on phones (smaller viewport, perf headroom).
  const mag = window.innerWidth <= 600 ? -10 : -16
  for (const el of pxEls) {
    const r = el.getBoundingClientRect()
    const center = r.top + r.height / 2
    // -0.5 (above centre) … +0.5 (below centre)
    const rel = (center - vh / 2) / vh
    const shift = Math.max(-1, Math.min(1, rel)) * mag // px
    el.style.transform = `translateY(${shift.toFixed(2)}px)`
  }
}

function onScroll() {
  if (!pxRaf) pxRaf = requestAnimationFrame(applyParallax)
}

// ── Cursor-tracked specular sheen on glass surfaces (desktop only) ──────────
let sheenEls: HTMLElement[] = []
let sheenRaf = 0
let pendingSheen: { el: HTMLElement; x: number; y: number } | null = null

function flushSheen() {
  sheenRaf = 0
  const s = pendingSheen
  if (!s) return
  s.el.style.setProperty('--mx', `${s.x}%`)
  s.el.style.setProperty('--my', `${s.y}%`)
  s.el.style.setProperty('--sheen', '1')
}
function onSheenMove(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  pendingSheen = {
    el,
    x: ((e.clientX - r.left) / r.width) * 100,
    y: ((e.clientY - r.top) / r.height) * 100,
  }
  if (!sheenRaf) sheenRaf = requestAnimationFrame(flushSheen)
}
function onSheenLeave(e: PointerEvent) {
  (e.currentTarget as HTMLElement).style.setProperty('--sheen', '0')
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  io = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view')
          io!.unobserve(e.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -28px 0px' }
  )

  const els = document.querySelectorAll('.anim')
  els.forEach((el, i) => {
    if (i < 3) (el as HTMLElement).style.transitionDelay = `${i * 0.09}s`
    io!.observe(el)
  })

  // Headline emphasis — light each key word as it reaches the reading band.
  const hlEls = document.querySelectorAll('.hl')
  if (reduceMotion) {
    hlEls.forEach(el => el.classList.add('lit'))
  } else {
    ioHl = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('lit')
            ioHl!.unobserve(e.target)
          }
        })
      },
      // Light when the word rises into the lower-mid of the viewport. This also
      // catches the hero (already on-screen at load) so it blooms in on arrival.
      { threshold: 0, rootMargin: '0px 0px -28% 0px' }
    )
    hlEls.forEach(el => ioHl!.observe(el))
  }

  if (!reduceMotion) {
    pxEls = Array.from(document.querySelectorAll<HTMLElement>('.px'))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    applyParallax()

    // Bind the cursor sheen only on hover-capable, fine-pointer devices.
    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (hoverCapable) {
      sheenEls = Array.from(document.querySelectorAll<HTMLElement>('.about-panel, .shot__cell'))
      for (const el of sheenEls) {
        el.addEventListener('pointermove', onSheenMove as EventListener, { passive: true })
        el.addEventListener('pointerleave', onSheenLeave as EventListener, { passive: true })
      }
    }
  }
})

onBeforeUnmount(() => {
  io?.disconnect()
  ioHl?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (pxRaf) cancelAnimationFrame(pxRaf)
  if (sheenRaf) cancelAnimationFrame(sheenRaf)
  for (const el of sheenEls) {
    el.removeEventListener('pointermove', onSheenMove as EventListener)
    el.removeEventListener('pointerleave', onSheenLeave as EventListener)
  }
})

// ── Cinematic "Clap to Cut" Story Navigation ───────────────────────────────
// Absurd but genius: You don't just scroll the story. You *direct* it.
// Clap the board to perform a "cut". Each cut advances the scene with a
// cinematic transition and drops a production note that adds real value
// (connects the beat to an instructional design principle).
// Keeps everything cinematic while staying true to the glass/gradient/spiral soul.

const currentScene = ref(1)
const currentTake = ref(1)
const totalScenes = 7
const isClapping = ref(false)
const isCutting = ref(false)
const armAngle = ref(0)

const aboutPanels = ref<HTMLElement[]>([])

function collectScenes() {
  const container = document.querySelector('.about-container')
  if (!container) return
  aboutPanels.value = Array.from(container.querySelectorAll<HTMLElement>('.about-panel, .shot'))
}

function getSceneLabel(index: number): string {
  const labels = [
    'HERO — THE RENDER',
    '01 — THE FLOOR',
    'CALL — DEBUG SESSION',
    '02 — THE SPARK',
    '03 — THE CRAFT',
    '04 — THE PRESENT',
    'FINAL — THE LIGHT'
  ]
  return labels[index - 1] || `SCENE ${index}`
}

function showProductionNote(scene: number) {
  const notes = [
    'Principle: Invisible craft > obvious instruction. The best experiences feel inevitable.',
    'Principle: Start with the environment. Everything else is decoration until the space feels right.',
    'Principle: Turn compliance into narrative. People remember stories, not rules.',
    'Principle: Mentorship as code review. Fast feedback loops = fast mental model shifts.',
    'Principle: Instructional design is frontend engineering for the brain.',
    'Principle: Ship the render that makes the complex feel obvious.',
    'The end. Gradient keeps moving. Keep cutting until it feels right.'
  ]
  const noteText = notes[scene - 1] || 'Every good story has a cut that changes everything.'

  const note = document.createElement('div')
  note.className = 'production-note glass-panel'
  note.innerHTML = `
    <div class="note-header">PRODUCTION NOTE — ${getSceneLabel(scene)}</div>
    <div class="note-body">${noteText}</div>
  `
  document.querySelector('.about-container')?.appendChild(note)

  setTimeout(() => note.classList.add('in'), 10)
  setTimeout(() => {
    note.classList.add('out')
    setTimeout(() => note.remove(), 400)
  }, 4200)
}

async function performCinematicCut(fromIndex: number, toIndex: number) {
  if (toIndex > totalScenes || toIndex < 1) return

  isCutting.value = true
  setTimeout(() => { isCutting.value = false }, 180)

  const target = aboutPanels.value[toIndex - 1]
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    target.classList.remove('scene-lit')
    void target.offsetWidth
    target.classList.add('scene-lit', 'just-cut')

    setTimeout(() => target.classList.remove('just-cut'), 900)
  }

  currentScene.value = toIndex
  currentTake.value += 1

  showProductionNote(toIndex)

  const container = document.querySelector('.about-container') as HTMLElement | null
  if (container) {
    container.style.setProperty('--sheen', '0.8')
    setTimeout(() => container.style.setProperty('--sheen', '0'), 650)
  }
}

function clapToNextScene() {
  if (isClapping.value) return
  isClapping.value = true

  const next = Math.min(currentScene.value + 1, totalScenes)

  armAngle.value = -38

  setTimeout(async () => {
    await performCinematicCut(currentScene.value, next)
    armAngle.value = 0
    isClapping.value = false
  }, 260)
}

function armDown() {
  if (!isClapping.value) armAngle.value = -22
}

function armUp() {
  if (!isClapping.value) armAngle.value = 0
}

onMounted(() => {
  nextTick(() => {
    collectScenes()
    if (aboutPanels.value.length) {
      aboutPanels.value[0]?.classList.add('scene-lit')
    }
  })

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c' || e.key === ' ') {
      e.preventDefault()
      clapToNextScene()
    }
    if (e.key === 'ArrowRight') {
      clapToNextScene()
    }
  })
})
</script>

<style scoped>
/* ─── Wrap ─── (transparent so the living gradient shows through) */
.about-wrap {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  padding: calc(108rem + var(--safe-top)) 0 96rem;
  overflow-x: clip;
}

/* ─── Container ─── */
.about-container {
  position: relative;
  z-index: 1;
  max-width: 720rem;
  margin: 0 auto;
  padding: 0 24rem;
}

/* ─── Base reveal ─── (clean spring rise — crisp text, no blur layer) */
.anim {
  opacity: 0;
  transform: translateY(26rem) scale(0.985);
  transition:
    opacity 0.7s ease,
    transform 0.9s var(--ease-spring);
}
.anim.in-view {
  opacity: 1;
  transform: none;
}

/* ─── Frosted glass story panel ─── */
.about-panel {
  position: relative;
  z-index: 1;
  margin: 0 0 18rem;
  padding: 40rem 40rem;
  border-radius: 26rem;
  /* theme-true frosted glass: dark panel in dark theme, light in light theme */
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.10), transparent 38%),
    color-mix(in srgb, var(--color-bg) 62%, transparent);
  backdrop-filter: blur(26px) saturate(1.4);
  -webkit-backdrop-filter: blur(26px) saturate(1.4);
  border: 1px solid var(--color-glass-border);
  box-shadow:
    0 34rem 90rem -42rem rgba(0, 0, 0, 0.6),
    inset 0 1px 1px color-mix(in srgb, var(--color-text) 16%, transparent),
    inset 0 0 60rem color-mix(in srgb, var(--color-text) 3%, transparent);
}
.about-panel--hero {
  padding: 48rem 40rem 44rem;
  margin-bottom: 26rem;
}
.about-panel--callout { padding: 30rem 36rem; }
.about-panel--closing { margin-bottom: 0; }

/* ─── Intro ─── */
.about-intro {
  font-size: clamp(32rem, 4vw, 50rem);
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: -0.04em;
  color: var(--color-text);
}

/* ─── Rule ─── */
.about-rule {
  border: none;
  border-top: 1px solid var(--color-divider);
  margin: 28rem 0 24rem;
}

/* ─── Lead ─── */
.about-lead {
  font-size: clamp(18rem, 2.1vw, 23rem);
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

/* ─── Scroll-emphasised headline words ─── */
/* Key words sit in normal ink until they scroll into the reading band, then
   cross-fade to the live backdrop palette (the same gradient stops the WebGL
   backdrop publishes). Wrap-safe: it tints the real text, so multi-word
   phrases never break across lines. */
.hl {
  /* symmetric stops so the flow loops seamlessly under `alternate` */
  background-image: linear-gradient(112deg,
    rgb(var(--grad-1, 200,120,255)),
    rgb(var(--grad-2, 130,150,255)),
    rgb(var(--grad-3, 120,200,255)),
    rgb(var(--grad-2, 130,150,255)),
    rgb(var(--grad-1, 200,120,255)));
  background-size: 220% auto;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--color-text);
  transition: -webkit-text-fill-color 0.8s ease;
}
.hl.lit {
  -webkit-text-fill-color: transparent;
  /* the gradient drifts back and forth once lit — the hero "moves" */
  animation: hl-flow 7s ease-in-out infinite alternate;
}
@keyframes hl-flow {
  from { background-position: 0% 50%; }
  to   { background-position: 100% 50%; }
}

/* ─── Chapter marker ─── */
.about-chapter {
  display: flex;
  align-items: baseline;
  gap: 14rem;
  margin: 0 0 22rem;
  font-size: 13rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.62;
}
.about-chapter__no {
  font-size: 13rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text);
  padding: 3rem 8rem;
  border: 1px solid color-mix(in srgb, var(--color-text) 35%, transparent);
  border-radius: 5rem;
  opacity: 0.9;
  transform-origin: left center;
  transition: transform 0.6s var(--ease-spring) 0.14s;
}
/* Micro-pop: the chapter chip springs in once its panel reveals */
.about-panel:not(.in-view) .about-chapter__no { transform: scale(0.55); }

/* ─── Body copy ─── */
.about-body {
  font-size: var(--text-body);
  font-weight: 400;
  line-height: 1.78;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.82;
}
.about-body + .about-body { margin-top: 18rem; }

/* ─── Callout ─── */
.about-callout {
  font-size: var(--text-body);
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: -0.02em;
  color: var(--color-text);
  border-left: 2px solid var(--color-accent);
  padding-left: 18rem;
}

/* ─── Pull ─── */
.about-pull {
  font-size: clamp(22rem, 2.6vw, 30rem);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.032em;
  color: var(--color-text);
  margin-bottom: 28rem;
}

/* ─── Questions ─── */
.about-questions {
  margin-bottom: 28rem;
}
.about-questions p {
  font-size: var(--text-body);
  font-weight: 400;
  font-style: italic;
  line-height: 2.0;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.72;
}

/* ───────────────── Cinematic photo shots — float on the gradient ───────────────── */
.shot {
  position: relative;
  z-index: 1;
  /* break out wider than the panels, floating directly on the gradient */
  width: min(92vw, 920rem);
  left: 50%;
  translate: -50% 0;
  margin: 34rem 0;
}

.shot__grid { display: grid; gap: 12rem; }
.shot__grid--duo { grid-template-columns: 1fr 1fr; }
.shot__grid--editorial { grid-template-columns: 1.5fr 1fr; }
.shot__grid--gallery { grid-template-columns: repeat(3, 1fr); gap: 16rem; }

/* Glass-framed cell — a floating "film still" */
.shot__cell {
  position: relative;
  overflow: hidden;
  border-radius: 16rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 30%, transparent);
  box-shadow:
    0 40rem 90rem -38rem rgba(0, 0, 0, 0.7),
    inset 0 1px 1px rgba(255, 255, 255, 0.28);
}
/* Duo / editorial use a fixed cinematic band height with cover crop */
.shot--duo .shot__cell      { aspect-ratio: 4 / 5; }
.shot__cell--wide           { aspect-ratio: 16 / 10; }
.shot__cell--tall           { aspect-ratio: 3 / 4; }

.shot__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 1.12;                                    /* cinematic settle (independent prop) */
  transition: scale 1.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.shot.in-view .shot__img { scale: 1.04; }

/* Solo portrait — a single centred glass-framed illustration */
.shot--solo { width: min(58vw, 360rem); }
.shot__cell--portrait { aspect-ratio: 1 / 1; }
.shot--solo .shot__img { scale: 1.06; }
.shot--solo.in-view .shot__img { scale: 1; }

/* Gallery items show the full collage (titles are baked in) — no crop, no overscan */
.shot__grid--gallery .shot__cell { aspect-ratio: auto; box-shadow: 0 34rem 76rem -34rem rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.24); }
.shot__grid--gallery .shot__img  { height: auto; object-fit: contain; scale: 1; }
.shot__item { margin: 0; }
.shot__tag {
  display: inline-block;
  margin-top: 12rem;
  padding: 6rem 11rem;
  border-radius: 9rem;
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.75;
  background: color-mix(in srgb, var(--color-bg) 52%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--color-glass-border);
}

/* Staggered reveal across gallery columns */
.shot--gallery .shot__item { opacity: 0; transform: translateY(18rem); transition: opacity 0.7s ease, transform 0.7s ease; }
.shot--gallery.in-view .shot__item:nth-child(1) { opacity: 1; transform: none; transition-delay: 0.05s; }
.shot--gallery.in-view .shot__item:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.16s; }
.shot--gallery.in-view .shot__item:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.27s; }

/* Caption — a frosted glass chip so it stays legible over the vivid gradient */
.shot__cap {
  display: flex;
  gap: 14rem;
  margin-top: 18rem;
  max-width: 640rem;
  padding: 15rem 18rem;
  border-radius: 14rem;
  font-size: var(--text-sm);
  line-height: 1.6;
  letter-spacing: -0.012em;
  color: var(--color-text);
  opacity: 0.92;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border: 1px solid var(--color-glass-border);
  box-shadow: inset 0 1px 1px color-mix(in srgb, var(--color-text) 14%, transparent);
  transition: opacity 0.6s ease 0.16s, transform 0.7s var(--ease-spring) 0.16s;
}
/* Caption settles in just after its photo frame */
.shot:not(.in-view) .shot__cap { opacity: 0; transform: translateY(10rem); }
.shot__cap em     { font-style: italic; opacity: 0.95; }
.shot__cap strong { font-weight: 600; }
.shot__cap-rule {
  flex: 0 0 auto;
  width: 2px;
  align-self: stretch;
  background: var(--color-accent);
  border-radius: 2px;
}

/* ─── Asatoma ─── */
.about-asatoma {
  font-size: var(--text-body);
  font-weight: 500;
  font-style: italic;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.5;
  margin-top: 28rem;
}

/* ─── Peak web dev wordplay extravaganza ─── */
.about-extravaganza {
  margin-top: 24rem;
  display: flex;
  align-items: center;
  gap: 12rem;
  font-family: ui-monospace, monospace;
  font-size: 13rem;
  letter-spacing: 0.08em;
  opacity: 0.65;
}
.about-extravaganza .code-word {
  padding: 4rem 10rem;
  border-radius: 6rem;
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}
.about-extravaganza .code-word:hover {
  opacity: 1;
  transform: translateY(-1rem) scale(1.02);
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  border-color: var(--color-glass-border-hover);
  box-shadow: 0 4rem 14rem -6rem rgba(0,0,0,0.3);
}

/* Little "compiling" pulse on the pipeline — feels like the whole site is one big render loop */
.about-extravaganza .code-word:nth-child(1) { animation: code-pulse 2.4s ease-in-out infinite; }
.about-extravaganza .code-word:nth-child(3) { animation: code-pulse 2.4s ease-in-out 0.4s infinite; }
.about-extravaganza .code-word:nth-child(5) { animation: code-pulse 2.4s ease-in-out 0.8s infinite; }

@keyframes code-pulse {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 0.95; }
}

/* ═══════════════════════════════════════════════════════════════════════
   CINEMATIC CLAPPER + STORY ENGINE
   Absurd-genius navigation: Clap the board to "call action" and cut scenes.
   Feels like a film set. Adds real value through production notes that
   surface instructional design principles hidden in the story.
   ═══════════════════════════════════════════════════════════════════════ */

.clapper-nav {
  position: fixed;
  top: calc(28rem + var(--safe-top));
  right: 28rem;
  z-index: 120;
  width: 148rem;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  border-radius: 10rem;
  padding: 10rem 12rem 14rem;
  backdrop-filter: blur(18px) saturate(1.35);
  -webkit-backdrop-filter: blur(18px) saturate(1.35);
  box-shadow: 0 20rem 60rem -20rem rgba(0,0,0,0.6);
  cursor: pointer;
  user-select: none;
  font-family: ui-monospace, monospace;
  font-size: 10rem;
  letter-spacing: 0.06em;
  color: var(--color-text);
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}

.clapper-nav:hover {
  box-shadow: 0 26rem 70rem -18rem rgba(0,0,0,0.7);
}

.clapper-nav.is-clapping {
  transform: scale(0.98);
}

.clapper-slate {
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 75%, transparent);
  padding: 8rem 10rem;
  border-radius: 6rem;
  margin-bottom: 8rem;
}

.slate-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 1;
}

.slate-row.scene {
  font-size: 14rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin: 6rem 0;
}

.slate-row.small {
  font-size: 9rem;
  opacity: 0.6;
}

.clapper-arm {
  height: 26rem;
  background: linear-gradient(180deg, var(--color-text), color-mix(in srgb, var(--color-text) 70%, transparent));
  border-radius: 3rem;
  margin: 0 8rem;
  position: relative;
  transition: transform 0.18s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: left center;
  box-shadow: 0 4rem 12rem -4rem rgba(0,0,0,0.5);
}

.arm-inner {
  position: absolute;
  right: 6rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--color-bg);
}

.clapper-hint {
  text-align: center;
  margin-top: 6rem;
  font-size: 9rem;
  opacity: 0.45;
  letter-spacing: 0.1em;
}

.clapper-instruction {
  font-size: 11rem;
  opacity: 0.45;
  margin-top: 12rem;
  font-style: italic;
  letter-spacing: -0.01em;
}

/* Cinema grain + flash for real cuts */
.cinema-grain {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  background-image: 
    linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.25;
  mix-blend-mode: screen;
  transition: opacity 0.2s ease;
}

.cinema-grain.cut-flash {
  opacity: 0.65;
  animation: film-flash 180ms steps(1);
}

@keyframes film-flash {
  0% { opacity: 0.8; }
  100% { opacity: 0.25; }
}

/* Scene focus + cut animation */
.about-panel.scene-lit,
.shot.scene-lit {
  box-shadow: 
    0 34rem 90rem -42rem rgba(0, 0, 0, 0.6),
    0 0 0 1px var(--color-glass-border-hover),
    inset 0 0 0 1px color-mix(in srgb, var(--color-text) 12%, transparent);
  transition: box-shadow 0.6s var(--ease-spring);
}

.about-panel.just-cut,
.shot.just-cut {
  animation: cinematic-cut-in 820ms var(--ease-spring);
}

@keyframes cinematic-cut-in {
  0% {
    transform: scale(0.96) translateY(12rem) rotateX(4deg);
    filter: blur(1px);
    opacity: 0.6;
  }
  60% {
    filter: blur(0);
  }
  100% {
    transform: none;
    opacity: 1;
  }
}

/* Production notes — little glass slates that pop on each cut */
.production-note {
  position: relative;
  margin: 18rem auto;
  max-width: 620rem;
  padding: 18rem 24rem 20rem;
  font-size: 13rem;
  line-height: 1.5;
  opacity: 0;
  transform: translateY(14rem) scale(0.985);
  transition: all 0.55s var(--ease-spring);
  pointer-events: none;
  z-index: 10;
}

.production-note.in {
  opacity: 1;
  transform: none;
}

.production-note.out {
  opacity: 0;
  transform: translateY(-10rem);
}

.note-header {
  font-family: ui-monospace, monospace;
  font-size: 10rem;
  letter-spacing: 0.1em;
  opacity: 0.5;
  margin-bottom: 8rem;
}

.note-body {
  color: var(--color-text);
}

/* Make sure clapper doesn't fight reduced motion */
@media (prefers-reduced-motion: reduce) {
  .clapper-arm,
  .cinema-grain,
  .production-note {
    transition: none;
    animation: none;
  }
}

/* ───────────────── Desktop micro-interactions (hover-capable only) ───────────────── */
/* A soft specular highlight tracks the cursor across each glass surface — the
   "liquid glass catches the light" tell. Driven by --mx/--my from pointermove
   (set in script, rAF-throttled). Pointer-fine devices only; phones never bind. */
.about-panel, .shot__cell { --mx: 50%; --my: 50%; --sheen: 0; }

@media (hover: hover) and (pointer: fine) {
  .about-panel::after,
  .shot__cell::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 3;
    background: radial-gradient(200rem circle at var(--mx) var(--my),
      rgba(255, 255, 255, 0.14), transparent 60%);
    opacity: var(--sheen);
    transition: opacity 0.4s ease;
    mix-blend-mode: screen;
  }

  /* Photo frames lift gently toward the viewer on hover */
  .shot__cell {
    transition: transform 0.5s var(--ease-spring), box-shadow 0.5s ease;
  }
  .shot__cell:hover {
    transform: translateY(-5rem);
    box-shadow:
      0 56rem 110rem -38rem rgba(0, 0, 0, 0.78),
      inset 0 1px 1px rgba(255, 255, 255, 0.34);
  }
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .anim,
  .shot__item,
  .shot__cap,
  .shot__cell,
  .about-chapter__no,
  .shot__img { transition: none; }
  .hl { transition: none; }
  .hl.lit { animation: none; }
  .shot__img { scale: 1; }
  .about-panel::after, .shot__cell::after { display: none; }
}

/* ─── Tablet ─── */
@media (max-width: 820px) {
  .shot { width: min(94vw, 720rem); }
  .shot__grid--editorial { grid-template-columns: 1.4fr 1fr; }
}

/* ─── Mobile ─── */
@media (max-width: 600px) {
  .about-wrap { padding-top: calc(92rem + var(--safe-top)); }
  .about-container { padding: 0 14rem; }

  /* Lighter backdrop blur on phones — backdrop-filter is the heaviest GPU cost */
  .about-panel {
    padding: 28rem 24rem;
    border-radius: 22rem;
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
  }
  .about-panel--hero { padding: 34rem 24rem 30rem; }
  .about-panel--callout { padding: 24rem 22rem; }

  .shot { width: 100%; left: 0; translate: none; margin: 26rem 0; }
  .shot--solo { width: min(70vw, 280rem); left: 50%; translate: -50% 0; }
  .shot__grid--duo { grid-template-columns: 1fr 1fr; gap: 10rem; }
  .shot__grid--editorial { grid-template-columns: 1fr; }
  .shot__cell--wide { aspect-ratio: 16 / 10; }
  .shot__cell--tall { aspect-ratio: 16 / 11; }
  .shot__grid--gallery { grid-template-columns: 1fr; gap: 22rem; }
  .shot__cap { font-size: 13rem; }
}
</style>
