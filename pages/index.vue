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

/**
 * Search.
 *
 * Ten entries does not need an index, a worker or a ranking function — it
 * needs a substring match over the fields a person would actually type. What
 * it does need is to search the *dek and the stamp* as well as the title,
 * because people search for what a thing is about ("password", "comic",
 * "storyboard") far more often than for what it is called.
 */
const query = ref('')
const needle = computed(() => query.value.trim().toLowerCase())

/**
 * Every query token must appear somewhere in the entry — and a trailing plural
 * is stripped before matching, because the first thing anyone typed into this
 * box was "passwords" against a dek that says "password" and got nothing. A
 * search that fails on a plural is a search people stop trusting immediately.
 */
const matches = (i: (typeof ITEMS)[number]) => {
  if (!needle.value) return true
  const label = CATEGORIES.find(c => c.id === i.category)?.label ?? ''
  const hay = [i.title, i.dek, i.stamp, label, i.media].join(' ').toLowerCase()
  return needle.value.split(/\s+/).every(term => {
    if (hay.includes(term)) return true
    const singular = term.replace(/(?:ies|es|s)$/, m => (m === 'ies' ? 'y' : ''))
    return singular.length > 2 && hay.includes(singular)
  })
}

const counts = computed(() => {
  const c: Record<string, number> = {}
  for (const i of ITEMS.filter(matches)) c[i.category] = (c[i.category] ?? 0) + 1
  return c
})

// The lead is only "the lead" when you are looking at everything unfiltered.
// Narrow the field by section or by search and it becomes an ordinary member
// of the results, because pinning it above a filtered list would be showing
// you something you just asked not to see.
const showLead = computed(() => filter.value === 'all' && !needle.value)
const field = computed(() => {
  const base = filter.value === 'all' ? (needle.value ? ITEMS : REST) : ITEMS.filter(i => i.category === filter.value)
  return base.filter(matches)
})

// A filter that survives a search which has excluded it is a filter showing
// nothing. Fall back to everything rather than to an empty page.
watch(needle, () => {
  if (filter.value !== 'all' && !(counts.value[filter.value] ?? 0)) filter.value = 'all'
})

const variantFor = (i: (typeof ITEMS)[number]) => i.size ?? 'standard'

/**
 * The rotating standfirst.
 *
 * A fixed opening clause with a changing completion — a masthead device old
 * enough to be furniture, and the fastest way to say four things about a
 * publication in the space of one line. All four completions are true, which
 * is the only rule that matters here: a rotating tagline that overclaims just
 * overclaims four times.
 *
 * It pauses on hover and focus, and does not rotate at all under reduced
 * motion — where it prints the first line and stops, so the sentence is
 * always complete.
 */
const ENDINGS = [
  'teaches while you read it',
  'shows its own workings',
  'ships the tools it argues for',
  'has been wrong in public, on purpose'
]
const ending = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => { if (!paused.value) ending.value = (ending.value + 1) % ENDINGS.length }, 3200)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <EdShell width="wide">
    <EdIssueStrip note="Everything here is either a thing I made or the thinking behind it." />

    <!-- ── Standfirst ──────────────────────────────────────────────────── -->
    <p class="sf" @mouseenter="paused = true" @mouseleave="paused = false"
       @focusin="paused = true" @focusout="paused = false">
      <span class="sf__fixed">An instructional-design portfolio that…</span>
      <Transition name="sf" mode="out-in">
        <b :key="ending" class="sf__var">{{ ENDINGS[ending] }}</b>
      </Transition>
      <span class="sr-only">
        This portfolio {{ ENDINGS.join(', ') }}.
      </span>
    </p>

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
          <NuxtLink to="/tools" class="np__secondary u-underline">Explore four free web apps <span aria-hidden="true">→</span></NuxtLink>
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
        <h2 id="field-h" class="t-mono field__label">{{ needle ? 'Results' : 'Everything else' }}</h2>
        <EdFilterRail v-model="filter" :counts="counts" />
      </div>

      <!-- Search sits with the filter, not in the masthead. On a ten-entry
           index a search box in the chrome would be a promise the site cannot
           keep; here it is plainly a way to narrow the list in front of you. -->
      <div class="find">
        <label class="sr-only" for="find">Find a story</label>
        <span class="find__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
               stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4.2-4.2" /></svg>
        </span>
        <input id="find" v-model="query" type="search" class="find__input"
               placeholder="Find a story — try “comic”, “passwords”, “storyboard”" />
        <button v-if="query" type="button" class="find__clear" @click="query = ''">Clear</button>
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

      <p v-if="!field.length" class="field__empty">
        Nothing matches <template v-if="needle">“{{ query }}”</template><template v-else>that filter</template>.
        <button v-if="needle" type="button" class="field__reset" @click="query = ''">Show everything</button>
      </p>
    </section>

    <!-- ── Interlude ───────────────────────────────────────────────────── -->
    <section class="interlude">
      <EdNote label="From the desk" accent="var(--green)">
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

  </EdShell>
</template>

<style scoped>
/* ── Standfirst ────────────────────────────────────────────────────────── */
.sf {
  display: flex; flex-wrap: wrap; align-items: baseline; gap: 6rem 10rem;
  margin: clamp(20rem, 3vw, 32rem) 0 0;
  font-family: var(--font-reading);
  font-size: clamp(17rem, 1.9vw, 23rem);
  line-height: 1.4;
}
.sf__fixed { color: var(--muted); }
.sf__var {
  font-weight: 600; color: var(--ink);
  border-bottom: 4rem solid var(--yellow);
  padding-bottom: 1rem;
}
.sf-enter-active { transition: opacity var(--dur-mid) var(--ease-out), transform var(--dur-mid) var(--ease-out); }
.sf-leave-active { transition: opacity 120ms var(--ease-in), transform 120ms var(--ease-in); }
.sf-enter-from { opacity: 0; transform: translateY(8rem); }
.sf-leave-to { opacity: 0; transform: translateY(-8rem); }

/* ── Nameplate ─────────────────────────────────────────────────────────── */
.np {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
  gap: clamp(24rem, 4vw, 56rem);
  align-items: end;
  padding: clamp(28rem, 5vw, 60rem) 0 clamp(30rem, 5vw, 56rem);
  border-bottom: var(--stroke) solid var(--line);
}
.np__line {
  font-size: var(--type-hero);
  margin: 0;
  /* 1.08, not the 0.86 a display line usually wants. The highlighted word on
     the second line paints a background box, and at tighter leading that box
     climbs over the descenders of the line above — it was clipping the "y" of
     "actually". Leading is the fix; shrinking the highlight would have been
     the workaround. */
  line-height: 1.08;
}
/* The one italic on the page. Bangers has no italic, so the emphasis is drawn
   instead: the word gets the highlighter, which is what an editor would do.
   A full marker block rather than a swipe across the baseline — the swipe
   version left the word set in --ink on top of yellow, which is fine on paper
   and unreadable on the night printing. `box-decoration-break` keeps it intact
   if the word ever lands on a line break. */
.np__line em {
  font-style: normal;
  background: var(--yellow);
  color: var(--on-yellow);
  padding: 0.02em 0.07em;
  /* Fraunces' descending y swings right, and the highlight box was landing on
     its tail. The box starts a hair later; the word itself does not move,
     because the padding absorbs the offset. */
  margin-left: 0.06em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.np__side { display: flex; flex-direction: column; gap: 20rem; padding-bottom: 6rem; }
.np__deck {
  font-family: var(--font-reading);
  font-size: clamp(16rem, 1.4vw, 19rem); line-height: 1.6;
  color: var(--muted); margin: 0; max-width: 42ch;
}
.np__cta { display: flex; flex-wrap: wrap; align-items: center; gap: 16rem; }
.np__secondary { color: var(--muted); font-size: 15rem; font-weight: 600; }
.np__secondary:hover { color: var(--ink); }

@media (max-width: 900px) {
  .np { grid-template-columns: minmax(0, 1fr); align-items: start; gap: 26rem; }
}

/* ── Lead ──────────────────────────────────────────────────────────────── */
.lead {
  display: grid;
  grid-template-columns: 150rem minmax(0, 1fr);
  gap: clamp(16rem, 2.5vw, 32rem);
  padding: clamp(30rem, 5vw, 56rem) 0;
  border-bottom: var(--stroke) solid var(--line);
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
  border-bottom: var(--stroke) solid var(--line);
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

/* ── Search ── */
.find { position: relative; display: flex; align-items: center; margin-bottom: clamp(20rem, 3vw, 30rem); }
.find__icon { position: absolute; left: 16rem; display: flex; color: var(--muted); pointer-events: none; }
.find__input {
  width: 100%; max-width: 560rem;
  min-height: 48rem; padding: 12rem 16rem 12rem 46rem;
  border: var(--stroke) solid var(--line); border-radius: var(--radius-full);
  background: var(--paper); color: var(--ink);
  font-family: inherit; font-size: 15.5rem;
  transition: box-shadow var(--dur-fast) var(--ease-out);
}
.find__input::placeholder { color: var(--muted); }
.find__input:focus { outline: none;  }
.find__input:focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; }
.find__clear {
  margin-left: 12rem; padding: 8rem 14rem; border-radius: var(--radius-full);
  border: var(--stroke) solid var(--ink); background: var(--paper);
  font-family: var(--font-mono); font-size: var(--type-meta);
  letter-spacing: var(--tracking-meta); text-transform: uppercase; cursor: pointer;
}
@media (hover: hover) { .find__clear:hover { background: var(--yellow); color: var(--on-yellow); } }

.field__empty { padding: 40rem 0; color: var(--muted); font-family: var(--font-reading); }
.field__reset {
  margin-left: 8rem; font-family: inherit; font-size: inherit;
  color: var(--blue); text-decoration: underline; text-underline-offset: 3px; cursor: pointer;
}

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
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-l);
}
.interlude__by { display: flex; flex-direction: column; align-items: flex-start; gap: 16rem; }
@media (max-width: 820px) { .interlude { grid-template-columns: minmax(0, 1fr); } }

@media (prefers-reduced-motion: reduce) {
  .field__grid > li { animation: none; }
  .swap-enter-active, .swap-leave-active { transition-duration: 1ms; }
  /* The standfirst does not rotate at all under reduced motion — see the
     script — so this only guards the transition if one is ever queued. */
  .sf-enter-active, .sf-leave-active { transition-duration: 1ms; }
  .sf-enter-from, .sf-leave-to { transform: none; }
}
</style>
