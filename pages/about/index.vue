<script setup lang="ts">
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import SplitType from 'split-type'

definePageMeta({ layout: false, pageTransition: { name: 'cine-fade', mode: 'out-in' } })
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'A short introduction to Naveen Jose, a certified instructional designer: from a hospitality floor into L&D at Club Mahindra, Marriott, and now Concentrix — told as a scroll-driven film in six frames.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'A certified instructional designer. The short story of how I got into designing learning, told as a film in six frames.',
  ogUrl: 'https://entertrainer.in/about'
})

// Each frame is one cell of the film. `side` alternates the image so the eye
// keeps moving; `img` fills its cell edge-to-edge (object-fit: cover) so the
// composition never depends on the photo's own orientation.
interface Frame {
  kicker: string
  head: string
  body: string
  img: string
  side: 'left' | 'right'
  place: string
  footnote?: string
}
const FRAMES: Frame[] = [
  { kicker: 'Frame 01 — Hello',      head: 'I’m\nNaveen Jose',            body: 'A certified instructional designer, based in Gurugram. What follows is the short version — six frames of how I got here.', img: '/about-me.png',                    side: 'right', place: 'Gurugram, IN' },
  { kicker: 'Frame 02 — The start',  head: 'It began\nin hospitality',    body: 'I studied hotel management in Chennai and started on the floor. Hospitality taught me to notice the small things that make service feel human.', img: '/about/about-housekeeper-1.webp', side: 'left',  place: 'Chennai, IN' },
  { kicker: 'Frame 03 — The turn',   head: 'A comic,\nand a new path',    body: 'At Club Mahindra I moved into L&D and drew The SEWA Chronicles — a small comic of real guest-experience stories. That’s where design became the plan.', img: '/about/about-sewa-1.webp',        side: 'right', place: 'Club Mahindra' },
  { kicker: 'Frame 04 — The craft',  head: 'Learning\nthe craft',         body: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams — from frontline associates through to managers.', img: '/about/about-onboarding.webp',    side: 'left',  place: 'Courtyard by Marriott' },
  { kicker: 'Frame 05 — The tools',  head: 'Building\nthe modules',       body: 'I build training in Articulate Storyline, with a little video and animation — trying to make each module something people actually want to finish.', img: '/about/about-ignite.webp',        side: 'right', place: 'The workbench' },
  { kicker: 'Frame 06 — Now',        head: 'Where I\nam today',           body: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world.', img: '/about/about-concentrix.webp',    side: 'left',  place: 'Concentrix', footnote: 'Asatoma Sadgamaya — from ignorance, toward truth.' }
]

const root  = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)

// Live HUD state (driven by the master ScrollTrigger)
const cur      = ref(0)             // active frame index
const railFill = ref(0)            // 0..1 overall progress
const timecode = ref('00:00:00')
const started  = ref(false)        // hides the "scroll" hint after first move
const reduce   = ref(false)

const total = FRAMES.length
const pad2  = (n: number) => String(n).padStart(2, '0')

let ctx: gsap.Context | null = null
const splits: SplitType[] = []
const { $lenis } = useNuxtApp() as unknown as { $lenis?: { on: Function; off: Function; scrollTo: Function } }

function setTimecode(p: number) {
  // A film-slate flavoured counter: HH:MM:FF from overall progress.
  const totalFrames = Math.round(p * (total * 24))
  const ff = totalFrames % 24
  const ss = Math.floor(totalFrames / 24) % 60
  const mm = Math.floor(totalFrames / (24 * 60))
  timecode.value = `${pad2(mm)}:${pad2(ss)}:${pad2(ff)}`
}

function jumpTo(i: number) {
  const st = master?.scrollTrigger
  if (!st) return
  const clamped = Math.max(0, Math.min(total - 1, i))
  const frac = total > 1 ? clamped / (total - 1) : 0
  const y = st.start + (st.end - st.start) * frac
  if ($lenis?.scrollTo) $lenis.scrollTo(y, { duration: 1.1 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

let master: gsap.core.Tween | null = null

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); jumpTo(cur.value + 1) }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); jumpTo(cur.value - 1) }
  else if (e.key === 'Home') { e.preventDefault(); jumpTo(0) }
  else if (e.key === 'End')  { e.preventDefault(); jumpTo(total - 1) }
}

const syncTrigger = () => ScrollTrigger.update()

onMounted(async () => {
  reduce.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  await nextTick()

  if (reduce.value) {
    // Reduced motion / no-scrub: everything is already laid out and visible via
    // the `.is-static` stylesheet. Nothing to animate.
    root.value?.classList.add('is-static')
    return
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
  // Keep ScrollTrigger frame-locked to Lenis' smoothed scroll.
  $lenis?.on('scroll', syncTrigger)

  ctx = gsap.context(() => {
    const trackEl  = track.value!
    const panels   = gsap.utils.toArray<HTMLElement>('.cine__panel')

    // ── The spine: vertical scroll drives horizontal travel of the film. ──
    master = gsap.to(trackEl, {
      x: () => -(trackEl.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: stage.value!,
        start: 'top top',
        end: () => '+=' + (trackEl.scrollWidth - window.innerWidth),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          railFill.value = self.progress
          setTimecode(self.progress)
          cur.value = Math.round(self.progress * (total - 1))
          if (self.progress > 0.004 && !started.value) started.value = true
        }
      }
    })

    // ── Per-frame choreography, every beat scrubbed to the film's position. ──
    panels.forEach((panel) => {
      const imgWrap = panel.querySelector<HTMLElement>('.cine__imgwrap')!
      const img     = panel.querySelector<HTMLElement>('.cine__img')!
      const ghost   = panel.querySelector<HTMLElement>('.cine__ghost')!
      const kicker  = panel.querySelector<HTMLElement>('.cine__kicker')!
      const headEl  = panel.querySelector<HTMLElement>('.cine__head')!
      const bodyEl  = panel.querySelector<HTMLElement>('.cine__body')!
      const meta    = panel.querySelector<HTMLElement>('.cine__meta')!
      const foot    = panel.querySelector<HTMLElement>('.cine__foot')
      const cta     = panel.querySelector<HTMLElement>('.cine__cta')
      const side    = panel.dataset.side as 'left' | 'right'

      const cont = { trigger: panel, containerAnimation: master!, scrub: true as const }
      const fromClip = side === 'left' ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)'

      // The photographic cell wipes open from the outer edge.
      gsap.fromTo(imgWrap,
        { clipPath: fromClip, webkitClipPath: fromClip },
        { clipPath: 'inset(0% 0% 0% 0%)', webkitClipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { ...cont, start: 'left 90%', end: 'left 35%' } })

      // Inside the cell, the image counter-drifts and settles from a push-in.
      gsap.fromTo(img,
        { scale: 1.28, xPercent: side === 'left' ? 10 : -10 },
        { scale: 1, xPercent: 0, ease: 'none',
          scrollTrigger: { ...cont, start: 'left right', end: 'right left' } })

      // A ghost frame numeral parallaxes behind the type — kept faint so it
      // never competes with the heading (its opacity lives in CSS, untouched).
      gsap.fromTo(ghost, { xPercent: 40 }, { xPercent: -40, ease: 'none',
        scrollTrigger: { ...cont, start: 'left right', end: 'right left' } })

      // Kicker slides in on a hairline.
      gsap.fromTo(kicker, { xPercent: -18, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none',
        scrollTrigger: { ...cont, start: 'left 80%', end: 'left 45%' } })

      // Heading: split to words, each rising out of its own clipped line.
      const hs = new SplitType(headEl, { types: 'lines,words', lineClass: 'cine__line' })
      splits.push(hs)
      gsap.fromTo(hs.words!, { yPercent: 120 }, { yPercent: 0, ease: 'none', stagger: 0.12,
        scrollTrigger: { ...cont, start: 'left 78%', end: 'left 38%' } })

      // Body: split to words, a soft blur-lift stagger.
      const bs = new SplitType(bodyEl, { types: 'words' })
      splits.push(bs)
      gsap.fromTo(bs.words!, { opacity: 0, y: 14, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'none', stagger: 0.02,
          scrollTrigger: { ...cont, start: 'left 68%', end: 'left 30%' } })

      // Meta line + footnote + CTA fade up last.
      gsap.fromTo([meta, foot, cta].filter(Boolean) as HTMLElement[],
        { opacity: 0, y: 18 }, { opacity: 1, y: 0, ease: 'none', stagger: 0.06,
          scrollTrigger: { ...cont, start: 'left 60%', end: 'left 28%' } })
    })
  }, root.value!)

  // Fonts + images can change layout; settle measurements once ready.
  ScrollTrigger.refresh()
  window.addEventListener('keydown', onKey)
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  $lenis?.off?.('scroll', syncTrigger)
  splits.forEach((s) => s.revert())
  ctx?.revert()
})
</script>

<template>
  <div ref="root" class="cine">
    <div class="cine__grain" aria-hidden="true" />
    <div class="cine__vig" aria-hidden="true" />

    <!-- Persistent HUD ─────────────────────────────────────────── -->
    <header class="cine__hud cine__hud--top">
      <NuxtLink to="/" class="glass-btn glass-btn--ghost cine__back" aria-label="Back to the site">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
        <span>Back</span>
      </NuxtLink>
      <span class="cine__slate">
        <span class="cine__rec" aria-hidden="true" />
        <span class="cine__tc">{{ timecode }}</span>
        <span class="cine__slate-name">NAVEEN&nbsp;JOSE · A SHORT FILM</span>
      </span>
      <span class="cine__count" aria-hidden="true">{{ pad2(cur + 1) }}<i>/</i>{{ pad2(total) }}</span>
    </header>

    <!-- Sprocket rails, top & bottom ────────────────────────────── -->
    <div class="cine__sprock cine__sprock--top" aria-hidden="true"><span v-for="n in 40" :key="'t'+n" /></div>
    <div class="cine__sprock cine__sprock--bot" aria-hidden="true"><span v-for="n in 40" :key="'b'+n" /></div>

    <!-- The pinned stage + horizontally-travelling film ─────────── -->
    <section ref="stage" class="cine__stage">
      <div ref="track" class="cine__track">
        <article
          v-for="(f, i) in FRAMES" :key="i"
          class="cine__panel" :class="`cine__panel--${f.side}`" :data-side="f.side"
        >
          <span class="cine__ghost" aria-hidden="true">{{ pad2(i + 1) }}</span>

          <figure class="cine__cell">
            <div class="cine__imgwrap">
              <img class="cine__img" :src="f.img" :alt="f.head.replace('\n', ' ')" loading="eager" draggable="false" />
            </div>
            <figcaption class="cine__place">{{ f.place }}</figcaption>
          </figure>

          <div class="cine__copy">
            <span class="cine__kicker">{{ f.kicker }}</span>
            <h1 class="cine__head">{{ f.head }}</h1>
            <p class="cine__body">{{ f.body }}</p>
            <p class="cine__meta"><span>Naveen Jose</span><i>·</i><span>Instructional Designer</span></p>
            <p v-if="f.footnote" class="cine__foot">{{ f.footnote }}</p>
            <div v-if="i === FRAMES.length - 1" class="cine__cta">
              <NuxtLink to="/my-work" class="glass-btn">See my work</NuxtLink>
              <button type="button" class="glass-btn glass-btn--ghost" @click="jumpTo(0)">Replay from the top</button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Bottom rail: chapter ticks + fill ───────────────────────── -->
    <footer class="cine__hud cine__hud--bot">
      <div class="cine__rail">
        <div class="cine__rail-fill" :style="{ transform: `scaleX(${railFill})` }" />
        <button
          v-for="(f, i) in FRAMES" :key="i" type="button" class="cine__tick"
          :class="{ done: i < cur, cur: i === cur }" :style="{ left: (total > 1 ? (i / (total - 1)) * 100 : 0) + '%' }"
          :aria-label="`Frame ${i + 1}: ${f.head.replace('\n', ' ')}`" @click="jumpTo(i)"
        />
      </div>
      <span class="cine__hint" :class="{ gone: started }">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        scroll to play
      </span>
    </footer>
  </div>
</template>

<style scoped>
.cine {
  position: relative; background: var(--color-bg); color: var(--color-text);
  overflow: hidden; --cell-w: 46vw; --cell-h: 66vh;
}

/* ── Atmosphere: grain + vignette sit above the film, below the HUD. ── */
.cine__grain {
  position: fixed; inset: 0; z-index: 6; pointer-events: none; opacity: 0.05; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: cine-grain 0.7s steps(2) infinite;
}
.cine__vig {
  position: fixed; inset: 0; z-index: 5; pointer-events: none;
  background: radial-gradient(130% 120% at 50% 46%, transparent 52%, color-mix(in srgb, var(--color-bg) 88%, #000) 100%);
}
@keyframes cine-grain { 0% { transform: translate(0,0) } 50% { transform: translate(-3%, 2%) } 100% { transform: translate(2%, -2%) } }

/* ── HUD ── */
.cine__hud {
  position: fixed; left: 0; right: 0; z-index: 12; pointer-events: none;
  display: flex; align-items: center; gap: 16rem;
}
.cine__hud > *, .cine__rail, .cine__back, .cine__tick { pointer-events: auto; }
.cine__hud--top {
  top: 0; justify-content: space-between;
  padding: calc(18rem + var(--safe-top)) clamp(18rem, 4vw, 40rem) 0;
}
.cine__back {
  display: inline-flex; align-items: center; gap: 7rem; height: 40rem; padding: 0 16rem 0 12rem;
  border-radius: 999rem; font-size: 12.5rem; font-weight: 600; text-decoration: none;
}
.cine__slate {
  display: inline-flex; align-items: center; gap: 10rem; font-size: 11rem; letter-spacing: 0.16em;
  font-weight: 600; opacity: 0.72; font-variant-numeric: tabular-nums;
}
.cine__rec { width: 8rem; height: 8rem; border-radius: 50%; background: #e2504b; box-shadow: 0 0 10rem #e2504b; animation: cine-rec 1.4s ease-in-out infinite; }
@keyframes cine-rec { 0%, 100% { opacity: 1 } 50% { opacity: 0.25 } }
.cine__tc { font-weight: 700; letter-spacing: 0.12em; }
.cine__slate-name { opacity: 0.66; }
.cine__count { font-size: 13rem; font-weight: 700; letter-spacing: 0.1em; opacity: 0.6; font-variant-numeric: tabular-nums; }
.cine__count i { font-style: normal; opacity: 0.4; margin: 0 2rem; }

@media (max-width: 720px) {
  .cine__slate-name { display: none; }
}

/* ── Sprocket rails ── */
.cine__sprock {
  position: fixed; left: 0; right: 0; z-index: 4; pointer-events: none; height: 26rem;
  display: flex; gap: 20rem; padding: 0 12rem; overflow: hidden;
  opacity: 0.5;
}
.cine__sprock--top { top: 60rem; }
.cine__sprock--bot { bottom: 58rem; }
.cine__sprock span {
  flex: 0 0 22rem; height: 13rem; margin: auto 0; border-radius: 3rem;
  background: var(--color-glass-bg); border: 1px solid var(--color-glass-border);
  animation: cine-drift 6s linear infinite;
}
@keyframes cine-drift { from { transform: translateX(0) } to { transform: translateX(-42rem) } }

/* ── Stage + film track ── */
.cine__stage { height: 100dvh; width: 100%; overflow: hidden; }
.cine__track { display: flex; height: 100dvh; will-change: transform; }

.cine__panel {
  position: relative; flex: 0 0 100vw; height: 100dvh;
  display: grid; align-items: center; gap: clamp(20rem, 4vw, 70rem);
  padding: 92rem clamp(24rem, 7vw, 130rem);
  grid-template-columns: 1fr 1fr;
}
.cine__panel--left  { grid-template-areas: 'cell copy'; }
.cine__panel--right { grid-template-areas: 'copy cell'; }
.cine__cell { grid-area: cell; }
.cine__copy { grid-area: copy; }

/* Ghost numeral */
.cine__ghost {
  position: absolute; z-index: 0; top: 50%; translate: 0 -50%;
  font-size: clamp(240rem, 42vw, 620rem); font-weight: 800; line-height: 0.8;
  letter-spacing: -0.04em; color: var(--color-text); opacity: 0.05; pointer-events: none;
  font-variant-numeric: tabular-nums; user-select: none;
}
.cine__panel--left  .cine__ghost { right: 3vw; }
.cine__panel--right .cine__ghost { left: 3vw; }

/* Photographic cell */
.cine__cell { position: relative; z-index: 1; justify-self: center; width: 100%; max-width: 560rem; }
.cine__imgwrap {
  position: relative; width: 100%; aspect-ratio: 4 / 5; border-radius: 14rem; overflow: hidden;
  box-shadow: 0 40rem 90rem -30rem rgba(0,0,0,0.7), 0 0 0 1px var(--color-glass-border);
  clip-path: inset(0% 0% 0% 0%);
}
.cine__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cine__place {
  margin-top: 12rem; font-size: 11rem; letter-spacing: 0.18em; text-transform: uppercase;
  opacity: 0.5; font-weight: 600;
}

/* Copy column */
.cine__copy { position: relative; z-index: 2; max-width: 480rem; }
.cine__panel--left  .cine__copy { justify-self: start; }
.cine__panel--right .cine__copy { justify-self: end; }
.cine__kicker {
  display: inline-block; font-size: 12rem; letter-spacing: 0.16em; text-transform: uppercase;
  font-weight: 700; opacity: 0.62; padding-bottom: 10rem;
  border-bottom: 1px solid var(--color-glass-border); margin-bottom: 22rem;
}
.cine__head {
  font-size: clamp(40rem, 6.4vw, 92rem); font-weight: 800; line-height: 0.98;
  letter-spacing: -0.03em; margin: 0; white-space: pre-line;
}
.cine__head :deep(.cine__line) { overflow: hidden; padding-bottom: 0.04em; }
.cine__body {
  margin: 24rem 0 0; max-width: 42ch; font-size: clamp(15rem, 1.5vw, 18rem);
  line-height: 1.62; opacity: 0.85;
}
.cine__meta {
  margin: 26rem 0 0; display: flex; align-items: center; gap: 10rem;
  font-size: 12rem; letter-spacing: 0.06em; opacity: 0.55; font-weight: 600;
}
.cine__meta i { font-style: normal; opacity: 0.5; }
.cine__foot { margin: 16rem 0 0; font-size: 13rem; font-style: italic; opacity: 0.6; }
.cine__cta { margin-top: 30rem; display: flex; flex-wrap: wrap; gap: 12rem; }
.cine__cta .glass-btn { text-decoration: none; }

/* ── Bottom rail ── */
.cine__hud--bot {
  bottom: 0; justify-content: space-between;
  padding: 0 clamp(18rem, 4vw, 40rem) calc(18rem + var(--safe-bottom));
}
.cine__rail { position: relative; flex: 1; height: 30rem; display: flex; align-items: center; }
.cine__rail::before {
  content: ''; position: absolute; left: 0; right: 0; height: 2rem; border-radius: 2rem;
  background: var(--color-glass-border);
}
.cine__rail-fill {
  position: absolute; left: 0; right: 0; height: 2rem; border-radius: 2rem;
  background: var(--color-text); opacity: 0.85; transform-origin: left center; transform: scaleX(0);
}
.cine__tick {
  position: absolute; top: 50%; width: 11rem; height: 11rem; margin: -5.5rem 0 0 -5.5rem;
  border-radius: 50%; padding: 0; cursor: pointer;
  background: var(--color-bg); border: 1.5px solid var(--color-glass-border); transition: transform 0.3s var(--ease-spring), border-color 0.3s ease, background 0.3s ease;
}
.cine__tick.done { background: var(--color-text); border-color: var(--color-text); }
.cine__tick.cur { transform: scale(1.55); border-color: var(--color-text); background: var(--color-text); box-shadow: 0 0 0 4rem color-mix(in srgb, var(--color-text) 16%, transparent); }
.cine__tick:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }
.cine__hint {
  display: inline-flex; align-items: center; gap: 7rem; font-size: 11.5rem; letter-spacing: 0.14em;
  text-transform: uppercase; font-weight: 600; opacity: 0.55; margin-left: 20rem; white-space: nowrap;
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.cine__hint svg { animation: cine-nudge 1.6s ease-in-out infinite; }
.cine__hint.gone { opacity: 0; transform: translateX(10rem); pointer-events: none; }
@keyframes cine-nudge { 0%, 100% { transform: translateX(0) } 50% { transform: translateX(4rem) } }
@media (max-width: 640px) { .cine__hint { display: none; } }

.cine-fade-enter-active, .cine-fade-leave-active { transition: opacity 0.35s ease; }
.cine-fade-enter-from, .cine-fade-leave-to { opacity: 0; }

/* ── Static / reduced-motion fallback: a clean vertical read ── */
.cine.is-static { overflow: visible; }
.cine.is-static .cine__stage { height: auto; overflow: visible; }
.cine.is-static .cine__track { flex-direction: column; height: auto; transform: none !important; will-change: auto; }
.cine.is-static .cine__panel {
  flex: none; height: auto; min-height: 92vh; grid-template-columns: 1fr;
  grid-template-areas: 'cell' 'copy' !important; gap: 30rem; padding: 120rem clamp(24rem, 8vw, 90rem) 90rem;
  justify-items: center; text-align: center; border-bottom: 1px solid var(--color-divider);
}
.cine.is-static .cine__copy { justify-self: center !important; }
.cine.is-static .cine__body { margin-left: auto; margin-right: auto; }
.cine.is-static .cine__meta, .cine.is-static .cine__cta { justify-content: center; }
.cine.is-static .cine__ghost { display: none; }
.cine.is-static .cine__sprock, .cine.is-static .cine__hint { display: none; }

/* ── Narrow screens: type before image, comfortable stacking (scrubbed mode) ── */
@media (max-width: 820px) {
  .cine { --cell-w: 74vw; }
  .cine__panel {
    grid-template-columns: 1fr; grid-template-areas: 'copy' 'cell' !important;
    align-content: center; gap: 26rem; padding: 96rem 30rem 92rem; justify-items: start;
  }
  .cine__copy, .cine__panel--left .cine__copy, .cine__panel--right .cine__copy { justify-self: start; max-width: 100%; }
  .cine__cell { justify-self: start; max-width: 62vw; }
  .cine__imgwrap { aspect-ratio: 3 / 4; }
  .cine__head { font-size: clamp(38rem, 11vw, 62rem); }
}
</style>
