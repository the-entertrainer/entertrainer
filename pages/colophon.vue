<script setup lang="ts">
/**
 * The colophon.
 *
 * A long-standing convention on personal sites, and the one page here that
 * exists purely to be human. Two reasons it earns its place on this site
 * specifically:
 *
 *  1. The claim on /about is "I design learning, and I build the tools that
 *     deliver it." A portfolio that asserts this and then never shows its own
 *     workings is asking to be taken on trust. This is the working.
 *  2. Explaining how a thing was made, in plain language, to someone who did
 *     not make it, is the entire job being advertised. The page is a small
 *     demonstration of it.
 *
 * The rule for the copy below: no adjectives about the work, only facts about
 * the work. "Three fonts" rather than "a carefully considered type system".
 */
import { useContentStore } from '~/stores/content'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'Colophon — how this site is built · Entertrainer',
  description: 'How entertrainer.in is put together: Nuxt, Three.js, a hand-built lens, and the reasoning behind each decision. Written by Naveen Jose.',
  ogTitle: 'Colophon — how this site is built',
  ogDescription: 'Nuxt, Three.js, a hand-built lens, and the reasoning behind each decision.',
  ogUrl: 'https://entertrainer.in/colophon'
})

const email = useContentStore().email

interface Entry { k: string; v: string; note: string }

const stack: Entry[] = [
  { k: 'Framework', v: 'Nuxt 3, client-rendered',
    note: 'The home page is a WebGL scene, so there is nothing useful to render on a server. Every other route is plain HTML the moment it mounts.' },
  { k: 'The home stage', v: 'Three.js, written by hand',
    note: 'Each card is an extruded squircle with a real bevel, so the rim catches light instead of pretending to. The print sits on the front face; the glass around it does the refraction.' },
  { k: 'The lens', v: 'One custom shader pass',
    note: 'Barrel distortion, chromatic aberration that is zero at the centre and grows toward the corners, a smear that follows the deck’s own velocity, a vignette, and film grain. The optics read the physics that is already running rather than a timer.' },
  { k: 'Type', v: 'Archivo, DM Sans, and your system’s mono',
    note: 'Two webfonts, doing display and reading. The metadata is set in whatever monospace your machine already has, which is one less file to download and looks right on every platform. Archivo is variable, so headings gain weight as you scroll rather than switching between cut sizes.' },
  { k: 'Motion', v: 'Four durations, six curves',
    note: 'Every transition on the site picks from the same short list. Things leave faster than they arrive, because a departure nobody is watching should not cost anyone time.' },
  { k: 'Images', v: 'WebP, drawn or generated, then composited',
    note: 'The card artwork was generated and the titles set on top afterwards, because type rendered by an image model is type nobody proofread.' },
  { k: 'Hosting', v: 'Vercel, static output',
    note: 'No database and no analytics. The only thing that reaches a server is the AI request a tool makes when you ask it to, and nothing is kept.' }
]

const choices = [
  { h: 'It works without a pointer',
    b: 'Every deck answers to arrow keys, every control has a visible focus ring, and the menu returns focus where it found it. This is not a courtesy. If a learning designer cannot make their own portfolio operable by keyboard, the claim to design accessible learning is decoration.' },
  { h: 'It works without motion',
    b: 'Turn on reduced motion and the springs stop, the parallax stops, the smear stops. The lens keeps its vignette, grain and corner fringing, because asking for less motion is not asking for a worse-looking page.' },
  { h: 'Nothing you type leaves your browser',
    b: 'StoryGen keeps your storyboards in your browser’s own storage, so they survive a refresh and never reach me. The others hold nothing at all. Where a tool calls a model it sends only the text you gave it for that one request, and nothing is kept on the way through.' },
  { h: 'It is finished in the places that matter',
    b: 'A portfolio is a sample of the work. Loose ends here are loose ends in front of a client, so the alignment, the copy and the tab order all had a pass of their own.' }
]
</script>

<template>
  <UiPageShell>
    <UiPageHead
      eyebrow="Colophon"
      title="How this site is built"
      deck="I claim on the about page that I design learning and build the tools that deliver it. This page is the evidence, in enough detail to check."
    />

    <section class="co-sec" aria-labelledby="co-stack">
      <h2 id="co-stack" class="t-mono co-label">The stack</h2>
      <dl class="co-list ed">
        <template v-for="e in stack" :key="e.k">
          <div class="co-row u-reveal">
            <dt class="co-row__k t-mono">{{ e.k }}</dt>
            <dd class="co-row__v"><b>{{ e.v }}</b></dd>
          </div>
          <p class="ed-note co-row__note u-reveal"><b>{{ e.k }}</b>{{ e.note }}</p>
        </template>
      </dl>
    </section>

    <section class="co-sec ed" aria-labelledby="co-choices">
      <h2 id="co-choices" class="t-mono co-label ed-wide">Four decisions I would defend</h2>
      <div class="co-choices ed-wide">
        <article v-for="c in choices" :key="c.h" class="co-choice lg lg--raised u-reveal">
          <h3 class="t-display co-choice__h">{{ c.h }}</h3>
          <p class="co-choice__b">{{ c.b }}</p>
        </article>
      </div>
    </section>

    <footer class="co-foot">
      <p>Built in the evenings, mostly. If something here is broken, I would genuinely like to know.</p>
      <a class="glass-btn" :href="`mailto:${email}`">Tell me what broke</a>
    </footer>
  </UiPageShell>
</template>

<style scoped>
.co-sec { margin-top: clamp(38rem, 6vh, 72rem); }
.co-label {
  margin: 0 0 20rem; padding-bottom: 12rem;
  border-bottom: 1px solid var(--color-divider);
  opacity: 0.5;
}

/* A definition list, set as a two-column grid so the keys form a readable
   column of their own instead of running inline with the values. */
.co-list { margin: 0; }
.co-row {
  display: grid;
  grid-template-columns: 150rem minmax(0, 1fr);
  gap: 24rem; align-items: baseline;
  align-self: stretch;
  padding: 16rem 0;
  border-bottom: 1px solid var(--color-divider);
}
@media (max-width: 560px) { .co-row { grid-template-columns: minmax(0, 1fr); gap: 4rem; } }
.co-row__k { margin: 0; opacity: 0.45; }
.co-row__v { margin: 0; }
.co-row__v b { font-size: 15.5rem; font-weight: 600; }
/* The margin note sits on the same row as the entry it explains. */
/* The margin note shares the row's height and its rule, so the hairline reads
   across the whole spread with one deliberate break at the gutter. */
.co-row__note {
  align-self: stretch;
  margin: 0;
  padding: 16rem 0 16rem 14rem;
  border-bottom: 1px solid var(--color-divider);
}
@media (max-width: 900px) {
  .co-row__note { padding: 10rem 0 0 14rem; margin: 0 0 18rem; border-bottom: 0; }
}

.co-choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260rem, 1fr));
  gap: clamp(14rem, 1.8vw, 22rem);
}
.co-choice { border-radius: 18rem; padding: clamp(20rem, 2.4vw, 28rem); }
.co-choice__h { font-size: var(--text-h3); line-height: 1.1; margin: 0 0 10rem; }
.co-choice__b { margin: 0; font-size: 14rem; line-height: 1.62; opacity: 0.7; }

.co-foot {
  margin-top: clamp(38rem, 6vh, 72rem);
  padding-top: 26rem;
  border-top: 1px solid var(--color-divider);
  display: flex; flex-wrap: wrap; align-items: center; gap: 18rem;
  justify-content: space-between;
}
.co-foot p { margin: 0; font-size: 14.5rem; opacity: 0.62; max-width: 46ch; }
.co-foot .glass-btn { text-decoration: none; }
</style>
