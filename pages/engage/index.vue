<script setup lang="ts">
useSeoMeta({
  title: 'Engage · Entertrainer',
  description: 'Short games and little detours — Stack, The Mind Reader, and AstroClock.',
  ogUrl: 'https://entertrainer.in/engage',
})

const MIND_READER_SYMBOLS = [
  '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="7" r="2.2" fill="currentColor"/>',
  '<path d="m12 2 8 4.7v9.6L12 21l-8-4.7V6.7L12 2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  '<path d="M4 18a11 11 0 0 1 16 0M7 14a7 7 0 0 1 10 0M10 10a3 3 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
  '<path d="m12 2 1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2Z" fill="currentColor"/>'
]

const GAMES = [
  { no: '01', id: 'stack', name: 'Stack', href: '/engage/stack', blurb: 'Tap to drop. Only the overlap stays.', orbit: 0 },
  { no: '02', id: 'mind-reader', name: 'The Mind Reader', href: '/engage/read-my-mind', blurb: 'Example: 42. Add 4 + 2, subtract, and the mark is on 36.', orbit: 1 },
  { no: '03', id: 'astroclock', name: 'AstroClock', href: '/engage/astroclock', blurb: 'Birth place and time. A live dial. What today is doing.', orbit: 2 }
] as const

/* The orrery: three orbits around the sun, one body per game. Pointing at a
   card lights its body and draws its orbit. */
const lit = ref<number | null>(null)
const ORBITS = [
  { rx: 96, ry: 40, dur: 14, start: 20 },
  { rx: 156, ry: 66, dur: 22, start: 200 },
  { rx: 214, ry: 92, dur: 34, start: 110 }
]
const r1 = (n: number) => Math.round(n * 10) / 10
const pos = (o: typeof ORBITS[number], deg: number) => ({ x: r1(Math.cos(deg * Math.PI / 180) * o.rx), y: r1(Math.sin(deg * Math.PI / 180) * o.ry) })
const bodies = ref(ORBITS.map(o => pos(o, o.start)))
let raf = 0
let t0 = 0
function tick(t: number) {
  if (!t0) t0 = t
  const s = (t - t0) / 1000
  bodies.value = ORBITS.map(o => pos(o, o.start + (s / o.dur) * 360))
  raf = requestAnimationFrame(tick)
}
function onVis() {
  cancelAnimationFrame(raf)
  if (document.visibilityState === 'visible' && motionLevel() !== 'off') raf = requestAnimationFrame(tick)
}
onMounted(() => {
  onVis()
  document.addEventListener('visibilitychange', onVis)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  document.removeEventListener('visibilitychange', onVis)
})

const root = ref<HTMLElement | null>(null)
const { run } = useMotion(root)
onMounted(() => {
  void run((m) => {
    m.drawPath(root.value!.querySelectorAll('.orrery__orbit'), { duration: 1.6 * m.k, stagger: 0.18 * m.k })
    m.stampIn(root.value!.querySelectorAll('.orrery__sun, .orrery__body'), { delay: 0.6 * m.k, stagger: 0.12 * m.k, transformOrigin: '50% 50%' })
    m.ScrollTrigger.batch(root.value!.querySelectorAll('.engage__step'), {
      start: 'top 92%', once: true,
      onEnter: els => { m.inkReveal(els, { y: 34 * m.d, stagger: 0.1 * m.k }) }
    })
  })
})
</script>

<template>
  <div ref="root" class="engage">
    <EdHubHero
      title="Engage"
      title-id="engage-title"
      no="03"
      kicker="3 games · Short detours"
      deck="Short games and little detours."
    >
      <template #art>
        <svg class="orrery" viewBox="-240 -120 480 240" :class="{ 'has-lit': lit !== null }">
          <g v-for="(o, i) in ORBITS" :key="i" class="orrery__system" :class="{ 'is-lit': lit === i }">
            <ellipse class="orrery__orbit" cx="0" cy="0" :rx="o.rx" :ry="o.ry" />
            <ellipse class="orrery__trace" cx="0" cy="0" :rx="o.rx" :ry="o.ry" pathLength="100" />
            <circle class="orrery__body" :cx="bodies[i]!.x" :cy="bodies[i]!.y" :r="i === 2 ? 11 : i === 1 ? 9 : 7" />
          </g>
          <circle class="orrery__sun" cx="0" cy="0" r="30" />
          <circle class="orrery__core" cx="0" cy="0" r="4" />
        </svg>
      </template>
    </EdHubHero>

    <h2 class="dp-sr">Games</h2>
    <ol class="engage__grid">
      <li class="engage__step">
        <NuxtLink :to="GAMES[0].href" class="engage__card engage__card--stack" @pointerenter="lit = 0" @pointerleave="lit = null" @focus="lit = 0" @blur="lit = null">
          <span class="engage__stage" aria-hidden="true">
            <span class="engage__icon engage__icon--stack" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="34" height="34" fill="none" aria-hidden="true">
              <rect x="8" y="30" width="32" height="8" fill="currentColor"/>
              <rect x="12" y="20" width="24" height="8" fill="currentColor"/>
              <rect x="16" y="10" width="16" height="8" fill="var(--accent)" stroke="currentColor" stroke-width="2"/>
            </svg>
          </span>
          </span>
          <span class="engage__step-no">{{ GAMES[0].no }}</span>
          <strong class="engage__card-name">{{ GAMES[0].name }}</strong>
          <span class="engage__card-blurb">{{ GAMES[0].blurb }}</span>
          <span class="engage__play">Play <span aria-hidden="true">→</span></span>
        </NuxtLink>
      </li>
      <li class="engage__step">
        <NuxtLink :to="GAMES[1].href" class="engage__card engage__card--mind-reader" @pointerenter="lit = 1" @pointerleave="lit = null" @focus="lit = 1" @blur="lit = null">
          <span class="engage__stage" aria-hidden="true">
            <span class="engage__icon engage__icon--mind-reader" aria-hidden="true">
            <i v-for="(symbol, i) in MIND_READER_SYMBOLS" :key="i"><svg viewBox="0 0 24 24" aria-hidden="true" v-html="symbol"></svg></i>
          </span>
          </span>
          <span class="engage__step-no">{{ GAMES[1].no }}</span>
          <strong class="engage__card-name">{{ GAMES[1].name }}</strong>
          <span class="engage__card-blurb">{{ GAMES[1].blurb }}</span>
          <span class="engage__play">Play <span aria-hidden="true">→</span></span>
        </NuxtLink>
      </li>
      <li class="engage__step">
        <NuxtLink :to="GAMES[2].href" class="engage__card engage__card--astroclock" @pointerenter="lit = 2" @pointerleave="lit = null" @focus="lit = 2" @blur="lit = null">
          <span class="engage__stage" aria-hidden="true">
            <span class="engage__icon engage__icon--astroclock" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="34" height="34" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.6" opacity="0.35"/>
              <circle cx="24" cy="24" r="15.5" stroke="currentColor" stroke-width="2.2"/>
              <circle cx="24" cy="24" r="10.5" stroke="currentColor" stroke-width="1.3" opacity="0.85"/>
              <g stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <line x1="24" y1="5.5" x2="24" y2="9.2"/>
                <line x1="24" y1="38.8" x2="24" y2="42.5"/>
                <line x1="5.5" y1="24" x2="9.2" y2="24"/>
                <line x1="38.8" y1="24" x2="42.5" y2="24"/>
                <line x1="11.2" y1="11.2" x2="13.8" y2="13.8"/>
                <line x1="34.2" y1="34.2" x2="36.8" y2="36.8"/>
                <line x1="36.8" y1="11.2" x2="34.2" y2="13.8"/>
                <line x1="13.8" y1="34.2" x2="11.2" y2="36.8"/>
              </g>
              <g fill="currentColor" opacity="0.9">
                <circle cx="24" cy="13.5" r="1.1"/>
                <circle cx="31.5" cy="16.8" r="0.95"/>
                <circle cx="34.5" cy="24" r="1.1"/>
                <circle cx="31.5" cy="31.2" r="0.95"/>
                <circle cx="24" cy="34.5" r="1.1"/>
                <circle cx="16.5" cy="31.2" r="0.95"/>
                <circle cx="13.5" cy="24" r="1.1"/>
                <circle cx="16.5" cy="16.8" r="0.95"/>
              </g>
              <line x1="24" y1="24" x2="24" y2="12.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              <circle cx="24" cy="12.5" r="1.8" fill="currentColor"/>
              <circle cx="24" cy="24" r="3.2" fill="currentColor"/>
              <circle cx="24" cy="24" r="1.35" fill="var(--accent)"/>
            </svg>
          </span>
          </span>
          <span class="engage__step-no">{{ GAMES[2].no }}</span>
          <strong class="engage__card-name">{{ GAMES[2].name }}</strong>
          <span class="engage__card-blurb">{{ GAMES[2].blurb }}</span>
          <span class="engage__play">Play <span aria-hidden="true">→</span></span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.engage {
  max-width: var(--shell-max);
  margin: 0 auto;
  padding: var(--space-13) var(--hub-gutter) var(--space-89);
}

/* ── Orrery ── */
.orrery { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--ink); overflow: visible; }
.orrery__orbit { fill: none; stroke: currentColor; stroke-width: 1; opacity: .5; }
.orrery__trace { fill: none; stroke: var(--ink); stroke-width: 2.5; stroke-dasharray: 100; stroke-dashoffset: 100; transition: stroke-dashoffset var(--dur-stage) var(--ease-ink); }
.orrery__system.is-lit .orrery__trace { stroke-dashoffset: 0; }
.orrery__sun { fill: var(--accent); stroke: var(--ink); stroke-width: 1.5; }
.orrery__core { fill: var(--ink); }
.orrery__body { fill: var(--paper); stroke: var(--ink); stroke-width: 2; transition: fill var(--dur-mid) var(--ease-ink); }
.orrery__system.is-lit .orrery__body { fill: var(--accent); }
.orrery.has-lit .orrery__system:not(.is-lit) { opacity: .45; }
.orrery__system { transition: opacity var(--dur-mid) var(--ease-ink); }
@media (max-width: 899px) { .orrery { inset: 0 10%; width: 80%; } }

/* ── Cards ── */
.engage__grid { list-style: none; margin: var(--space-34) 0 0; padding: 0; display: grid; gap: var(--space-21); }
@media (min-width: 900px) { .engage__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.engage__card {
  position: relative;
  display: flex; flex-direction: column; gap: var(--space-8);
  height: 100%;
  padding: var(--space-21);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper);
  box-shadow: 6rem 6rem 0 color-mix(in srgb, var(--ink) 14%, transparent);
  transition: transform var(--dur-mid) var(--ease-ink), box-shadow var(--dur-mid) var(--ease-ink);
}
@media (hover: hover) {
  .engage__card:hover { transform: translate(-3rem, -3rem); box-shadow: 10rem 10rem 0 var(--accent), 10rem 10rem 0 1px var(--ink); }
}
.engage__card:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }

.engage__stage {
  display: grid; place-items: center;
  height: 150rem; margin-bottom: var(--space-8);
  border-radius: var(--radius-s);
  background: #161618;
  overflow: hidden;
}
.engage__card--astroclock .engage__stage { background: var(--accent); }
.engage__icon {
  position: relative;
  width: 96rem; height: 96rem;
  padding: 10rem;
  box-sizing: border-box;
  color: #FFD43B;
}
.engage__icon svg { display: block; width: 100%; height: 100%; }
.engage__icon--astroclock { color: var(--accent-ink); }
.engage__icon--mind-reader { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 6rem; width: 132rem; }
.engage__icon--mind-reader i { display: grid; place-items: center; color: #FFD43B; }
.engage__icon--mind-reader svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }

/* Attract loops, on hover or focus only. */
.engage__icon--stack rect { transform-box: fill-box; transform-origin: 50% 100%; }
.engage__card:is(:hover, :focus-visible) .engage__icon--stack rect:nth-of-type(3) { animation: eng-drop 1.4s var(--ease-stamp) infinite; }
.engage__card:is(:hover, :focus-visible) .engage__icon--stack rect:nth-of-type(2) { animation: eng-slide 1.4s var(--ease-ink) infinite; }
@keyframes eng-drop { 0% { transform: translate(-60%, -140%); } 35%, 100% { transform: none; } }
@keyframes eng-slide { 0%, 30% { transform: none; } 45% { transform: translateY(6%); } 60%, 100% { transform: none; } }
.engage__card:is(:hover, :focus-visible) .engage__icon--mind-reader i { animation: eng-flicker 1.8s var(--ease-sun) infinite; }
.engage__icon--mind-reader i:nth-child(2) { animation-delay: .15s !important; }
.engage__icon--mind-reader i:nth-child(3) { animation-delay: .3s !important; }
.engage__icon--mind-reader i:nth-child(4) { animation-delay: .45s !important; }
.engage__icon--mind-reader i:nth-child(5) { animation-delay: .6s !important; }
@keyframes eng-flicker { 0%, 100% { opacity: 1; transform: none; } 50% { opacity: .35; transform: scale(.82) rotate(-12deg); } }
.engage__icon--astroclock line:last-of-type { transform-box: view-box; transform-origin: 24px 24px; }
.engage__card:is(:hover, :focus-visible) .engage__icon--astroclock > svg > line { animation: eng-hand 4s linear infinite; transform-box: view-box; transform-origin: 24px 24px; }
@keyframes eng-hand { to { transform: rotate(360deg); } }

.engage__step-no {
  align-self: flex-start;
  display: inline-grid; place-items: center;
  min-width: 30rem; height: 22rem; padding: 0 6rem;
  border-radius: 999px;
  background: #161618; color: #FFD43B;
  font: 700 11rem/1 var(--font-mono); letter-spacing: .08em;
}
.engage__card-name { font: 400 clamp(30px, 2.8vw, 40px)/1 var(--font-display); font-variation-settings: "opsz" 144, "SOFT" 40, "WONK" 1; letter-spacing: -.03em; }
.engage__card-blurb { font: 400 16px/1.45 var(--font-reading); color: var(--muted); }
.engage__play { margin-top: auto; padding-top: var(--space-8); font: 600 var(--type-meta)/1 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.engage__play span { display: inline-block; transition: transform var(--dur-mid) var(--ease-ink); }
@media (hover: hover) { .engage__card:hover .engage__play span { transform: translateX(6rem); } }

@media (prefers-reduced-motion: reduce) {
  .engage__icon *, .engage__icon { animation: none !important; }
  .engage__card, .orrery__trace, .orrery__body, .orrery__system { transition: none; }
}
:global(html[data-reduce-motion="on"]) .engage__icon,
:global(html[data-reduce-motion="on"]) .engage__icon * { animation: none !important; }
:global(html[data-reduce-motion="on"]) .orrery__trace { transition: none; }
</style>
