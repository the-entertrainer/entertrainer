<script setup lang="ts">
/**
 * Empower: a workbench of instruments.
 * Each tool card plays a muted micro-demo of its own job while it is on
 * screen or under the pointer (CSS keyframes, paused otherwise, a still
 * final frame under reduced motion). The Studio shelf lists the bigger tools
 * from STUDIO in content/editorial.ts; set `listed: false` there to hide one.
 */
import { byCategory, STUDIO, type EditorialItem } from '~/content/editorial'

useSeoMeta({
  title: 'Empower · Free tools by Entertrainer',
  description: 'Free browser tools for learning and development work: quiz distractors, email polish, training calendars and storyboards. No sign-up.',
  ogUrl: 'https://entertrainer.in/empower'
})

const ICON_BY_ID: Record<string, string> = {
  easymcq: '/easymcq-icon.svg',
  'better-emails': '/draftly-icon.svg'
}

const tools = computed(() =>
  byCategory('tools').map((item: EditorialItem) => ({
    ...item,
    icon: ICON_BY_ID[item.id] || item.image || ''
  }))
)
const studio = STUDIO.filter(s => s.listed)
const total = computed(() => tools.value.length + studio.length)

/* Micro-demos run only while visible. */
const root = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
onMounted(() => {
  if (!('IntersectionObserver' in window) || !root.value) return
  io = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('is-live', e.isIntersecting)
  }, { threshold: 0.35 })
  root.value.querySelectorAll('.bench__demo').forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())

const { run } = useMotion(root)
onMounted(() => {
  void run((m) => {
    m.drawPath(root.value!.querySelectorAll('.bench-art__draw'), { duration: 1.4 * m.k, stagger: 0.12 * m.k })
    m.stampIn(root.value!.querySelectorAll('.bench-art__stamp'), { delay: 0.9 * m.k })
    m.ScrollTrigger.batch(root.value!.querySelectorAll('.bench__card, .shelf__card'), {
      start: 'top 90%',
      once: true,
      onEnter: els => { m.inkReveal(els, { y: 34 * m.d, stagger: 0.08 * m.k }) }
    })
  })
})
</script>

<template>
  <div ref="root" class="empower">
    <EdHubHero
      title="Empower"
      title-id="empower-title"
      no="02"
      :kicker="`${total} free tools · No sign-up`"
      deck="Free tools for work that keeps repeating. Open the browser and get on with it."
    >
      <template #art>
        <svg class="bench-art" viewBox="0 0 440 300" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <!-- pegboard -->
          <g class="bench-art__pegs" fill="currentColor" stroke="none" opacity=".25">
            <template v-for="r in 6" :key="`r${r}`"><circle v-for="c in 11" :key="`c${c}`" :cx="20 + c * 36" :cy="10 + r * 36" r="2" /></template>
          </g>
          <!-- ruler -->
          <path class="bench-art__draw" d="M56 60h0l20-12 0 210-20 12z" stroke-width="2" />
          <path class="bench-art__draw" d="M60 80h10M60 100h6M60 120h10M60 140h6M60 160h10M60 180h6M60 200h10M60 220h6M60 240h10" stroke-width="1.5" />
          <!-- set square -->
          <path class="bench-art__draw" d="M130 250 130 90 290 250Z M152 228 152 144 236 228Z" stroke-width="2" />
          <!-- compass -->
          <path class="bench-art__draw" d="M352 52v18M352 70 322 238M352 70l30 168M336 150h32" stroke-width="2" />
          <circle class="bench-art__draw" cx="352" cy="62" r="9" stroke-width="2" />
          <path class="bench-art__draw" d="M290 270a90 90 0 0 1 124 -40" stroke-width="1.2" stroke-dasharray="4 6" />
          <!-- the stamp: a sun -->
          <g class="bench-art__stamp">
            <circle cx="240" cy="96" r="34" fill="var(--accent)" stroke-width="2" />
            <path d="M226 96l10 10 18-20" stroke-width="3" />
          </g>
          <path class="bench-art__draw" d="M10 284h420" stroke-width="2" />
        </svg>
      </template>
    </EdHubHero>

    <section class="bench" aria-labelledby="bench-title">
      <h2 id="bench-title" class="dp-kicker">On the workbench</h2>
      <ol class="bench__grid">
        <li v-for="(item, i) in tools" :key="item.id" class="bench__card">
          <NuxtLink :to="item.href" class="bench__link" :aria-describedby="`bench-dek-${item.id}`">
            <div class="bench__head">
              <span class="bench__no">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="bench__icon" aria-hidden="true">
                <img v-if="item.icon" :src="item.icon" alt="" width="64" height="64" loading="lazy" decoding="async">
              </span>
              <span class="bench__stamp">{{ item.stamp }}</span>
            </div>
            <strong class="bench__name">{{ item.title }}</strong>
            <span :id="`bench-dek-${item.id}`" class="bench__dek">{{ item.dek }}</span>

            <!-- EasyMCQ: three wrong options shuffle into place around the right one. -->
            <div v-if="item.id === 'easymcq'" class="bench__demo demo-mcq" aria-hidden="true">
              <p class="demo-mcq__q">Which planet is closest to the Sun?</p>
              <ol class="demo-mcq__opts">
                <li class="demo-mcq__opt demo-mcq__opt--right"><i>A</i>Mercury</li>
                <li class="demo-mcq__opt demo-mcq__opt--d1"><i>B</i>Venus</li>
                <li class="demo-mcq__opt demo-mcq__opt--d2"><i>C</i>Mars</li>
                <li class="demo-mcq__opt demo-mcq__opt--d3"><i>D</i>Earth</li>
              </ol>
            </div>

            <!-- Draftly: a messy line tidies itself. -->
            <div v-else-if="item.id === 'better-emails'" class="bench__demo demo-draft" aria-hidden="true">
              <div class="demo-draft__stage">
                <p class="demo-draft__line demo-draft__line--messy"><del>hey so</del> <del>i was thinking maybe we cud</del> move <del>the mtg</del> to <del>thurs??</del></p>
                <p class="demo-draft__line demo-draft__line--clean"><ins>Hi Asha,</ins> <ins>could we</ins> move <ins>our meeting</ins> to <ins>Thursday?</ins></p>
              </div>
              <p class="demo-draft__note"><span class="dp-stamp">3 changes</span> Greeting, plain verb, full day name.</p>
            </div>

            <span class="bench__open">Open {{ item.title }} <span aria-hidden="true">→</span></span>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <section v-if="studio.length" class="shelf" aria-labelledby="shelf-title">
      <h2 id="shelf-title" class="dp-kicker">The studio shelf</h2>
      <p class="shelf__lede">Bigger tools for planning a month of training or a whole course.</p>
      <ul class="shelf__grid">
        <li v-for="s in studio" :key="s.id" class="shelf__card">
          <NuxtLink :to="s.href" class="shelf__link">
            <span class="shelf__icon" aria-hidden="true"><img :src="s.icon" alt="" width="56" height="56" loading="lazy" decoding="async"></span>
            <span class="shelf__text">
              <span class="shelf__stamp">{{ s.stamp }}</span>
              <strong class="shelf__name">{{ s.title }}</strong>
              <span class="shelf__dek">{{ s.dek }}</span>
            </span>
            <span class="shelf__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M14 6l6 6-6 6" /></svg>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.empower {
  max-width: var(--shell-max);
  margin: 0 auto;
  padding: var(--space-13) var(--hub-gutter) var(--space-89);
}

.bench-art { position: absolute; right: 0; bottom: 0; width: 100%; max-width: 480rem; height: 100%; color: var(--ink); }
@media (max-width: 899px) { .bench-art { left: 50%; transform: translateX(-50%); } }

.bench { margin-top: var(--space-34); }
.bench__grid {
  list-style: none; margin: var(--space-13) 0 0; padding: 0;
  display: grid; gap: var(--space-21);
}
@media (min-width: 900px) { .bench__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

.bench__link {
  position: relative;
  display: flex; flex-direction: column; gap: var(--space-13);
  height: 100%;
  padding: var(--space-21);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper);
  box-shadow: 6rem 6rem 0 color-mix(in srgb, var(--ink) 14%, transparent);
  transition: transform var(--dur-mid) var(--ease-ink), box-shadow var(--dur-mid) var(--ease-ink);
}
@media (hover: hover) {
  .bench__link:hover { transform: translate(-3rem, -3rem); box-shadow: 10rem 10rem 0 var(--accent), 10rem 10rem 0 1px var(--ink); }
}
.bench__link:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
.bench__link:active { transform: translate(0, 0) scale(.995); }

.bench__head { display: flex; align-items: center; gap: var(--space-13); }
.bench__no { font: 500 var(--type-meta)/1 var(--font-mono); color: var(--muted); }
.bench__icon { width: 52rem; height: 52rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); overflow: hidden; flex: none; }
.bench__icon img { width: 100%; height: 100%; display: block; object-fit: cover; }
.bench__stamp { margin-left: auto; font: 600 10px/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--accent-text); text-align: right; }
.bench__name { font: 400 clamp(40px, 4.4vw, 64px)/.95 var(--font-display); font-variation-settings: "opsz" 144, "SOFT" 40, "WONK" 1; letter-spacing: -.035em; }
.bench__dek { max-width: 40ch; font: 400 17px/1.45 var(--font-reading); color: var(--muted); }
.bench__open { margin-top: auto; padding-top: var(--space-8); font: 600 var(--type-meta)/1 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.bench__open span { display: inline-block; transition: transform var(--dur-mid) var(--ease-ink); }
@media (hover: hover) { .bench__link:hover .bench__open span { transform: translateX(6rem); } }

/* ── Demos ── */
.bench__demo {
  margin-top: var(--space-8);
  padding: var(--space-13) var(--space-13) var(--space-21);
  border: var(--stroke) dashed var(--line-strong);
  border-radius: var(--radius-s);
  background: var(--paper-2);
  min-height: 176rem;
}
.demo-mcq__q { margin: 0 0 var(--space-8); font: 500 17px/1.3 var(--font-display); }
.demo-mcq__opts { list-style: none; margin: 0; padding: 0; display: grid; gap: 6rem; }
.demo-mcq__opt {
  display: flex; align-items: center; gap: var(--space-8);
  padding: 6rem 10rem;
  border: var(--stroke) solid var(--ink); border-radius: var(--radius-s);
  background: var(--paper);
  font-size: 15px;
}
.demo-mcq__opt i { font: 600 11px/1 var(--font-mono); font-style: normal; width: 20rem; height: 20rem; display: grid; place-items: center; border: var(--stroke) solid currentColor; border-radius: 50%; }
.demo-mcq__opt--right { background: var(--accent); color: var(--accent-ink); }
.demo-mcq__opt--d1, .demo-mcq__opt--d2, .demo-mcq__opt--d3 { animation: mcq-in 4.8s var(--ease-stamp) infinite both paused; }
.demo-mcq__opt--d2 { animation-delay: .25s; }
.demo-mcq__opt--d3 { animation-delay: .5s; }
@keyframes mcq-in {
  0%, 6% { opacity: 0; transform: translateX(40rem) rotate(3deg); }
  18%, 86% { opacity: 1; transform: none; }
  96%, 100% { opacity: 0; transform: translateY(6rem); }
}

.demo-draft__stage { display: grid; }
.demo-draft__line { grid-area: 1 / 1; margin: 0; font: 400 18px/1.7 var(--font-reading); }
.demo-draft__line del { text-decoration: line-through; text-decoration-thickness: 2px; text-decoration-color: transparent; animation: draft-strike 5s var(--ease-ink) infinite both paused; }
.demo-draft__line--messy { animation: draft-out 5s var(--ease-ink) infinite both paused; }
.demo-draft__line--clean { animation: draft-in 5s var(--ease-ink) infinite both paused; }
.demo-draft__line ins { text-decoration: none; background: linear-gradient(transparent 60%, color-mix(in srgb, var(--accent) 80%, transparent) 60%); }
@keyframes draft-strike { 0%, 12% { text-decoration-color: transparent; } 26%, 100% { text-decoration-color: var(--danger); } }
@keyframes draft-out { 0%, 38% { opacity: 1; transform: none; } 48%, 92% { opacity: 0; transform: translateY(-6rem); } 100% { opacity: 1; transform: none; } }
@keyframes draft-in { 0%, 42% { opacity: 0; transform: translateY(6rem); } 54%, 88% { opacity: 1; transform: none; } 96%, 100% { opacity: 0; } }
.demo-draft__note { display: flex; align-items: center; gap: var(--space-8); margin: var(--space-13) 0 0; font-size: 14px; color: var(--muted); }
.demo-draft__note .dp-stamp { color: var(--ink); }

.bench__demo.is-live .demo-mcq__opt, .bench__link:hover .demo-mcq__opt, .bench__link:focus-visible .demo-mcq__opt,
.bench__demo.is-live .demo-draft__line, .bench__demo.is-live del, .bench__link:hover .demo-draft__line, .bench__link:hover del,
.bench__link:focus-visible .demo-draft__line, .bench__link:focus-visible del { animation-play-state: running; }

/* ── Studio shelf ── */
.shelf { margin-top: var(--space-55); }
.shelf__lede { margin: var(--space-8) 0 0; color: var(--muted); font: 400 17px/1.45 var(--font-reading); }
.shelf__grid { list-style: none; margin: var(--space-13) 0 0; padding: 0; display: grid; border-top: 2px solid var(--ink); }
@media (min-width: 900px) { .shelf__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .shelf__card + .shelf__card { border-left: var(--stroke) solid var(--ink); } }
.shelf__card { border-bottom: var(--stroke) solid var(--ink); }
.shelf__link { display: grid; grid-template-columns: 56rem minmax(0, 1fr) 24rem; gap: var(--space-13) var(--space-21); align-items: center; padding: var(--space-21); height: 100%; transition: background var(--dur-fast) var(--ease-out); }
@media (min-width: 900px) { .shelf__card:first-child .shelf__link { padding-left: 0; } }
@media (hover: hover) { .shelf__link:hover { background: color-mix(in srgb, var(--accent) 22%, transparent); } }
.shelf__link:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
.shelf__icon { width: 56rem; height: 56rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); overflow: hidden; }
.shelf__icon img { width: 100%; height: 100%; display: block; }
.shelf__text { display: grid; gap: 4rem; min-width: 0; }
.shelf__stamp { font: 600 10px/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--accent-text); }
.shelf__name { font: 500 28px/1.05 var(--font-display); letter-spacing: -.02em; }
.shelf__dek { font: 400 15px/1.45 var(--font-reading); color: var(--muted); }
.shelf__arrow { transition: transform var(--dur-mid) var(--ease-ink); }
@media (hover: hover) { .shelf__link:hover .shelf__arrow { transform: translateX(5rem); } }

@media (prefers-reduced-motion: reduce) {
  .demo-mcq__opt, .demo-draft__line, .demo-draft__line del { animation: none !important; }
  .demo-draft__line--messy { display: none; }
  .bench__link, .bench__open span, .shelf__arrow { transition: none; }
}
:global(html[data-reduce-motion="on"]) .demo-mcq__opt,
:global(html[data-reduce-motion="on"]) .demo-draft__line,
:global(html[data-reduce-motion="on"]) .demo-draft__line del { animation: none !important; }
:global(html[data-reduce-motion="on"]) .demo-draft__line--messy { display: none; }
</style>
