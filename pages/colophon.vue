<script setup lang="ts">
/**
 * The colophon.
 *
 * The claim on /about is "I design learning, and I build the tools that
 * deliver it". A portfolio that asserts that and never shows its workings is
 * asking to be taken on trust. This is the working.
 *
 * The rule for the copy: no adjectives about the work, only facts about the
 * work. "Five fonts" rather than "a carefully considered type system". Which
 * also means this page has to be re-checked every time the build changes —
 * the entries below describe the editorial rebuild, not the WebGL site that
 * preceded it, because a colophon that has gone stale is worse than no
 * colophon at all.
 */
import { useContentStore } from '~/stores/content'

useSeoMeta({
  title: 'Colophon — how this site is built · Entertrainer',
  description: 'How entertrainer.in is put together: Nuxt, an editorial design system, five open-source typefaces, and the reasoning behind each decision. Written by Naveen Jose.',
  ogTitle: 'Colophon — how this site is built',
  ogDescription: 'Nuxt, an editorial design system, and the reasoning behind each decision.',
  ogUrl: 'https://entertrainer.in/colophon'
})

const email = useContentStore().email

interface Entry { k: string; v: string; note: string }

const stack: Entry[] = [
  { k: 'Framework', v: 'Nuxt 3, client-rendered',
    note: 'One Vue app, four of whose routes are full applications rather than pages. Every route is plain HTML the moment it mounts.' },
  { k: 'Design system', v: 'One CSS file, no framework',
    note: 'Colour, type, surface and motion are defined once in assets/css/main.css and read by everything downstream. No Tailwind, no component library, about six hundred lines including the comments.' },
  { k: 'Type', v: 'Four faces, four jobs',
    note: 'Fraunces for display, Archivo for interface, Source Serif 4 for reading, IBM Plex Mono for metadata. All SIL Open Font License, all self-hosted, three of the four variable — so the whole range is eight files. Chosen as the closest open equivalents to a commercial stack I could not license.' },
  { k: 'Colour', v: 'White, near-black, six accents',
    note: 'A neutral ramp from 50 to 1000 and six saturated accents, one per section. Every accent is paired with the one text colour that clears 4.5:1 on it — measured, not assumed, which is why the green and cyan carry black text and the blue carries white.' },
  { k: 'Surfaces', v: 'One hairline, 3-6px radii, no shadows',
    note: 'An earlier version put a 2px outline, a 20px radius and a hard offset shadow on everything — three treatments doing the job type and space are supposed to do. There are now two shadows in the whole stylesheet, both for things that genuinely float. Separation comes from the rule and the space around it.' },
  { k: 'Motion', v: 'Four durations, five curves',
    note: 'Every transition picks from the same short list, and things leave faster than they arrive. Scroll reveals are CSS scroll-driven animations, so the failure mode is "no animation" rather than "no content".' },
  { k: 'Images', v: 'WebP and PNG, drawn or generated, then composited',
    note: 'Card artwork was generated and the titles set on top afterwards, because type rendered by an image model is type nobody proofread.' },
  { k: 'Hosting', v: 'Vercel, static output',
    note: 'No database and no analytics. The only thing that reaches a server is the AI request a tool makes when you ask it to, and nothing is kept.' }
]

const choices = [
  { h: 'It works without a pointer',
    b: 'Every filter is a real radio group with arrow-key movement, every control has a visible focus ring, and the first thing in the tab order is a skip link to the content. This is not a courtesy. If a learning designer cannot make their own portfolio operable by keyboard, the claim to design accessible learning is decoration.' },
  { h: 'It works without motion',
    b: 'Turn on reduced motion and the card lifts, the staggers and the page transitions all collapse to state changes. Nothing on this site is legible only while it is moving.' },
  { h: 'It works without images',
    b: 'Every card puts its artwork in a band above the type instead of behind it, so a slow, dark or missing image costs you a picture and never a headline. The front page is fully readable with images disabled.' },
  { h: 'Nothing you type leaves your browser',
    b: 'StoryGen keeps your storyboards in your browser’s own storage, so they survive a refresh and never reach me. The others hold nothing at all. Where a tool calls a model it sends only the text you gave it for that one request, and nothing is kept on the way through.' }
]
</script>

<template>
  <EdShell width="page">
    <EdStoryHero
      category="notes"
      media="essay"
      title="How this site is built"
      deck="I claim on the about page that I design learning and build the tools that deliver it. This page is the evidence, in enough detail to check."
      :minutes="6"
      byline
    />

    <section class="co__sec" aria-labelledby="co-stack">
      <h2 id="co-stack" class="t-mono co__label">The stack</h2>
      <dl class="co__list ed">
        <template v-for="e in stack" :key="e.k">
          <div class="co__row u-reveal">
            <dt class="co__k t-mono">{{ e.k }}</dt>
            <dd class="co__v">{{ e.v }}</dd>
          </div>
          <p class="ed-note co__note u-reveal"><b>{{ e.k }}</b>{{ e.note }}</p>
        </template>
      </dl>
    </section>

    <section class="co__sec" aria-labelledby="co-choices">
      <h2 id="co-choices" class="t-mono co__label">Four decisions I would defend</h2>
      <div class="co__choices">
        <article v-for="(c, i) in choices" :key="c.h" class="co__choice u-reveal" :style="{ '--i': i }">
          <h3 class="co__choice-h">{{ c.h }}</h3>
          <p class="co__choice-b t-read">{{ c.b }}</p>
        </article>
      </div>
    </section>

    <footer class="co__foot">
      <p>Built in the evenings, mostly. If something here is broken, I would genuinely like to know.</p>
      <a class="ticket" :href="`mailto:${email}`">Tell me what broke</a>
    </footer>

    <EdReadNext from="colophon" />
  </EdShell>
</template>

<style scoped>
.co__sec { margin-top: clamp(34rem, 6vh, 64rem); }
.co__label {
  margin: 0 0 20rem; padding-bottom: 12rem;
  border-bottom: var(--stroke) solid var(--line);
  color: var(--muted);
}

.co__list { margin: 0; }
.co__row {
  display: grid; grid-template-columns: 170rem minmax(0, 1fr);
  gap: 22rem; align-items: baseline; align-self: stretch;
  padding: 16rem 0;
  border-bottom: var(--stroke) solid var(--line);
}
.co__k { margin: 0; color: var(--muted); }
.co__v { margin: 0; font-size: 16.5rem; font-weight: 600; }
.co__note { align-self: stretch; margin: 0; padding: 16rem 0 16rem 14rem; border-bottom: var(--stroke) solid var(--line); }

@media (max-width: 900px) {
  .co__note { padding: 10rem 0 0 14rem; margin: 0 0 18rem; border-bottom: 0; }
}
@media (max-width: 560px) { .co__row { grid-template-columns: minmax(0, 1fr); gap: 4rem; } }

.co__choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(280rem, 1fr)); gap: clamp(16rem, 2vw, 22rem); }
.co__choice {
  background: var(--paper); border: var(--stroke) solid var(--line);
  border-radius: var(--radius-l); padding: clamp(20rem, 2.4vw, 28rem);
}
.co__choice-h { font-size: var(--type-card); line-height: 1.1; margin: 0 0 12rem; }
.co__choice-b { margin: 0; font-size: 15.5rem; color: var(--muted); }

.co__foot {
  margin-top: clamp(38rem, 6vh, 72rem); padding-top: 26rem;
  border-top: var(--stroke) solid var(--line);
  display: flex; flex-wrap: wrap; align-items: center; gap: 18rem; justify-content: space-between;
}
.co__foot p { margin: 0; font-family: var(--font-reading); color: var(--muted); max-width: 46ch; }
</style>
