<script setup lang="ts">
import { ITEMS, FEATURED, REST, CATEGORIES, type Category } from '~/content/editorial'

/**
 * The front page.
 *
 * A dense but calm editorial field, not a hero plus three cards. The order is
 * the one a reader actually uses: what this is, the one thing to read first,
 * a way to narrow the field, the field itself, a human aside, then the whole
 * index for anyone who would rather scan a list than look at pictures.
 *
 * The previous front page was a WebGL tower of four cards you rotated through
 * one at a time. It was the best-looking thing on the site and the worst
 * performing: four destinations, one visible at a time, no text for a crawler
 * or a screen reader beyond an off-screen link list, and roughly two seconds
 * of preloader before any of it appeared. Everything it held is on this page,
 * visible at once, in HTML.
 */
useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'The portfolio of Naveen Jose, a certified instructional designer who builds learning experiences that feel human, plus free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Learning experiences that feel human, plus free web apps for L&D teams.',
  ogUrl: 'https://entertrainer.in/'
})

const filter = ref<Category | 'all'>('all')

const counts = computed(() => {
  const c: Record<string, number> = {}
  for (const i of ITEMS) c[i.category] = (c[i.category] ?? 0) + 1
  return c
})

// The lead is only "the lead" when you are looking at everything. Filter to a
// section and it becomes an ordinary member of that section's field, because
// pinning it above a filtered list would be showing you something you just
// asked not to see.
const showLead = computed(() => filter.value === 'all')
const field = computed(() =>
  filter.value === 'all' ? REST : ITEMS.filter(i => i.category === filter.value))

const variantFor = (i: (typeof ITEMS)[number]) => i.size ?? 'standard'
</script>

<template>
  <EdShell width="wide">
    <EdIssueStrip note="Everything here is either a thing I made or the thinking behind it." />

    <!-- ── Nameplate ───────────────────────────────────────────────────── -->
    <section class="np">
      <h1 class="np__line t-display">
        <span class="t-rise" style="--i: 0"><span>Learning people</span></span>
        <span class="t-rise" style="--i: 1"><span>actually <em>finish</em>.</span></span>
      </h1>
      <div class="np__side">
        <p class="np__deck">
          I am Naveen Jose, a certified instructional designer. I design the learning, then I build
          the tools that deliver it — and I publish both here, with the reasoning attached.
        </p>
        <div class="np__cta">
          <NuxtLink to="/instructional-design" class="ticket">See the craft, live</NuxtLink>
          <NuxtLink to="/tools" class="ticket ticket--ghost">Four free web apps</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── The lead ────────────────────────────────────────────────────── -->
    <section v-if="showLead" class="lead" aria-labelledby="lead-h">
      <div class="lead__rail">
        <h2 id="lead-h" class="t-mono lead__label">Start here</h2>
        <p class="t-hand lead__hand">It takes four minutes and it argues with you.</p>
      </div>
      <EdCard :item="FEATURED" variant="feature" />
    </section>

    <!-- ── The field ───────────────────────────────────────────────────── -->
    <section class="field" aria-labelledby="field-h">
      <div class="field__head">
        <h2 id="field-h" class="t-mono field__label">Everything else</h2>
        <EdFilterRail v-model="filter" :counts="counts" />
      </div>

      <!-- Keyed on the filter so a change crossfades the whole field rather
           than mutating rows in place. The stagger is on the items. -->
      <Transition name="swap" mode="out-in">
        <ul class="field__grid" :key="filter">
          <li v-for="(it, i) in field" :key="it.id"
              :class="`is-${variantFor(it)}`" :style="{ '--i': i }">
            <EdCard :item="it" :variant="variantFor(it)" :index="i" />
          </li>
        </ul>
      </Transition>

      <p v-if="!field.length" class="field__empty">Nothing filed under that yet.</p>
    </section>

    <!-- ── Interlude ───────────────────────────────────────────────────── -->
    <section class="interlude">
      <EdNote label="From the desk" accent="var(--mint)">
        <p>
          Every tool on this site started as a slow afternoon in my own work. EasyMCQ exists because
          writing four plausible wrong answers is the dullest hour in assessment design. Cadence
          exists because a training calendar should not take a morning in a spreadsheet.
        </p>
        <p>If one of them saves you an afternoon, that is the whole return I was after.</p>
      </EdNote>
      <div class="interlude__by">
        <EdByline />
        <NuxtLink to="/about" class="ticket ticket--sm ticket--ghost">Read the long version</NuxtLink>
      </div>
    </section>

    <!-- ── Archive ─────────────────────────────────────────────────────── -->
    <section class="arch" aria-labelledby="arch-h">
      <div class="arch__head">
        <h2 id="arch-h" class="t-mono arch__label">The whole index</h2>
        <p class="t-mono arch__n">{{ String(ITEMS.length).padStart(2, '0') }} entries</p>
      </div>
      <ol class="arch__list">
        <li v-for="(it, i) in ITEMS" :key="it.id">
          <NuxtLink :to="it.href" class="arch__row">
            <span class="t-mono arch__i">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="arch__t">{{ it.title }}</span>
            <EdChip :category="it.category" class="arch__c" />
            <span class="t-mono arch__s">{{ it.stamp }}</span>
            <svg class="arch__go" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </NuxtLink>
        </li>
      </ol>
    </section>
  </EdShell>
</template>

<style scoped>
/* ── Nameplate ─────────────────────────────────────────────────────────── */
.np {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
  gap: clamp(24rem, 4vw, 56rem);
  align-items: end;
  padding: clamp(28rem, 5vw, 60rem) 0 clamp(30rem, 5vw, 56rem);
  border-bottom: var(--stroke) solid var(--ink);
}
.np__line {
  font-size: var(--type-hero);
  margin: 0;
  line-height: 0.86;
}
/* The one italic on the page. Bangers has no italic, so the emphasis is drawn
   instead: the word gets the highlighter, which is what an editor would do.
   A full marker block rather than a swipe across the baseline — the swipe
   version left the word set in --ink on top of yellow, which is fine on paper
   and unreadable on the night printing. `box-decoration-break` keeps it intact
   if the word ever lands on a line break. */
.np__line em {
  font-style: normal;
  background: var(--sun);
  color: var(--on-sun);
  padding: 0 0.09em 0.04em;
  border-radius: 0.06em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.np__side { display: flex; flex-direction: column; gap: 20rem; padding-bottom: 6rem; }
.np__deck {
  font-family: var(--font-reading);
  font-size: clamp(16rem, 1.4vw, 19rem); line-height: 1.6;
  color: var(--muted); margin: 0; max-width: 42ch;
}
.np__cta { display: flex; flex-wrap: wrap; gap: 12rem; }

@media (max-width: 900px) {
  .np { grid-template-columns: minmax(0, 1fr); align-items: start; gap: 26rem; }
}

/* ── Lead ──────────────────────────────────────────────────────────────── */
.lead {
  display: grid;
  grid-template-columns: 150rem minmax(0, 1fr);
  gap: clamp(16rem, 2.5vw, 32rem);
  padding: clamp(30rem, 5vw, 56rem) 0;
  border-bottom: var(--stroke-hair) solid var(--line);
}
.lead__rail { display: flex; flex-direction: column; gap: 12rem; padding-top: 4rem; }
.lead__label { margin: 0; color: var(--muted); }
.lead__hand { margin: 0; font-size: 16rem; color: var(--ink); max-width: 22ch; }

@media (max-width: 820px) {
  .lead { grid-template-columns: minmax(0, 1fr); }
  .lead__rail { flex-direction: row; align-items: baseline; justify-content: space-between; gap: 16rem; }
  .lead__hand { text-align: right; }
}

/* ── Field ─────────────────────────────────────────────────────────────── */
.field { padding: clamp(28rem, 4vw, 48rem) 0 0; }
.field__head {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8rem 24rem;
  border-bottom: var(--stroke-hair) solid var(--line);
  margin-bottom: clamp(20rem, 3vw, 32rem);
}
.field__label { margin: 0; color: var(--muted); }

/* Twelve columns on a large screen, six on a tablet, one on a phone. Cards
   claim different widths so the field has a rhythm instead of a checkerboard —
   but every card is still a full card, never a cropped one. */
.field__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(16rem, 2vw, 26rem);
}
.field__grid > li { grid-column: span 4; display: flex; min-width: 0; }
.field__grid > li.is-wide { grid-column: span 8; }
.field__grid > li.is-tall { grid-column: span 4; }

@media (max-width: 1080px) {
  .field__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .field__grid > li { grid-column: span 3; }
  .field__grid > li.is-wide { grid-column: span 6; }
  .field__grid > li.is-tall { grid-column: span 3; }
}
@media (max-width: 680px) {
  .field__grid { grid-template-columns: minmax(0, 1fr); }
  .field__grid > li,
  .field__grid > li.is-wide,
  .field__grid > li.is-tall { grid-column: span 1; }
}

.field__empty { padding: 40rem 0; color: var(--muted); font-family: var(--font-reading); }

/* Filter change: crossfade the field, stagger the cards in behind it. */
.swap-enter-active { transition: opacity var(--dur-mid) var(--ease-out); }
.swap-leave-active { transition: opacity 120ms var(--ease-in); }
.swap-enter-from, .swap-leave-to { opacity: 0; }
.swap-enter-active .field__grid > li,
.field__grid > li {
  animation: card-in 260ms var(--ease-out) both;
  animation-delay: calc(var(--i, 0) * 34ms);
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(10rem); }
  to { opacity: 1; transform: none; }
}

/* ── Interlude ─────────────────────────────────────────────────────────── */
.interlude {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: clamp(20rem, 3vw, 40rem);
  align-items: center;
  margin-top: clamp(48rem, 8vh, 90rem);
  padding: clamp(28rem, 4vw, 44rem);
  background: var(--paper-2);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-xl);
}
.interlude__by { display: flex; flex-direction: column; align-items: flex-start; gap: 16rem; }
@media (max-width: 820px) { .interlude { grid-template-columns: minmax(0, 1fr); } }

/* ── Archive ───────────────────────────────────────────────────────────── */
.arch { margin-top: clamp(48rem, 8vh, 90rem); }
.arch__head {
  display: flex; align-items: baseline; justify-content: space-between; gap: 16rem;
  padding-bottom: 12rem; border-bottom: var(--stroke) solid var(--ink);
}
.arch__label, .arch__n { margin: 0; color: var(--muted); }

.arch__list { list-style: none; margin: 0; padding: 0; }
.arch__row {
  display: grid;
  grid-template-columns: 44rem minmax(0, 1fr) auto auto 20rem;
  align-items: center; gap: 18rem;
  padding: 16rem 8rem;
  border-bottom: var(--stroke-hair) solid var(--line);
  transition: background var(--dur-fast) var(--ease-out), padding var(--dur-fast) var(--ease-out);
}
/* The hover fill is yellow in both themes, so the row's text has to switch to
   the ink that yellow carries — inheriting --ink puts cream on yellow at
   night. Every accent fill on the site pairs with its own --on-* token for
   exactly this reason. */
@media (hover: hover) {
  .arch__row:hover { background: var(--sun); color: var(--on-sun); padding-left: 16rem; padding-right: 0; }
  .arch__row:hover .arch__i, .arch__row:hover .arch__s { color: inherit; opacity: 0.7; }
  .arch__row:hover .arch__go { transform: translate(2rem, -2rem); }
}
.arch__i { color: var(--muted); }
.arch__t { font-size: clamp(17rem, 1.6vw, 21rem); font-weight: 600; line-height: 1.2; }
.arch__s { color: var(--muted); white-space: nowrap; }
.arch__go { opacity: 0.5; transition: transform var(--dur-fast) var(--ease-out); }

@media (max-width: 860px) {
  .arch__row { grid-template-columns: 34rem minmax(0, 1fr) auto; gap: 12rem; }
  .arch__s { display: none; }
  .arch__go { display: none; }
}
@media (max-width: 560px) {
  .arch__row { grid-template-columns: 30rem minmax(0, 1fr); }
  .arch__c { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .field__grid > li { animation: none; }
  .swap-enter-active, .swap-leave-active { transition-duration: 1ms; }
  .arch__row, .arch__go { transition: none; }
}
</style>
