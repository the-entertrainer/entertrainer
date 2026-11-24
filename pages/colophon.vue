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
  description: 'How entertrainer.in is put together: Nuxt, an editorial design system, five open-source typefaces, and the reasoning behind each decision. Naveen Jose wrote this account.',
  ogTitle: 'Colophon — how this site is built',
  ogDescription: 'Nuxt, an editorial design system, and the reasoning behind the decisions that shape the site.',
  ogUrl: 'https://entertrainer.in/colophon'
})

const email = useContentStore().email

interface Entry { k: string; v: string; note: string }

const stack: Entry[] = [
  { k: 'Framework', v: 'Nuxt 3, server-rendered',
    note: 'One Vue app. AstroClock is a React island. Stack is a small WebGL game. Pages are in the first response, so a link describes the page being opened. The content does not wait on an animation.' },
  { k: 'Design system', v: 'One publication stylesheet',
    note: 'Colour, type, surface and motion for the magazine live in assets/css/main.css. Tailwind is only inside AstroClock. The publication itself is not a component library.' },
  { k: 'Type', v: 'Four faces, four jobs',
    note: 'Fraunces for display, Archivo for interface, Source Serif 4 for reading, IBM Plex Mono for metadata. All SIL Open Font License, all self-hosted, three of the four variable — so the whole range is eight files. Chosen as the closest open equivalents to a commercial stack I could not license.' },
  { k: 'Colour', v: 'Paper, ink, signal yellow',
    note: 'The interface accent is signal yellow, paired with near-black text that clears 4.5:1. Essay pictures keep one cobalt. Other hues are for status, not decoration.' },
  { k: 'Surfaces', v: 'Hairline first, shadow only when it lifts',
    note: 'Most separation is a hairline and the space around it. A few tactile objects — the home switchboard, the category tiles — still carry a hard offset shadow, because they are meant to feel like pieces you can pick up.' },
  { k: 'Motion', v: 'Four durations, five curves',
    note: 'Every transition picks from the same short list, and things leave faster than they arrive. Scroll reveals are CSS scroll-driven animations, so the failure mode is "no animation" rather than "no content". If motion fails, the content is still there.' },
  { k: 'Images', v: 'WebP and PNG, drawn or generated, then composited',
    note: 'Card artwork was generated and the titles set on top afterwards, because type rendered by an image model is type nobody proofread. Images can improvise; headlines need proofreading.' },
  { k: 'Hosting', v: 'Vercel',
    note: 'Pages are server-rendered. There is no analytics database. A tool sends only the request you make. StoryGen projects stay in the browser.' },
  { k: 'Opening sound', v: 'Pixabay ident by Diamond_Tunes',
    note: 'One short welcome tone on tap-to-enter: “Digital Vibe (Podcast Intro Ident)” by Diamond_Tunes on Pixabay (Content License). Trimmed to the preloader window. Attribution is appreciated; the license does not require it. Device silent mode is respected — playback uses ordinary HTML audio inside the tap gesture and fails quietly if muted or blocked.' }
]

const choices = [
  { h: 'It works without a pointer',
    b: 'Every filter is a real radio group with arrow-key movement, every control has a visible focus ring, and the first thing in the tab order is a skip link to the content. Keyboard access is therefore a requirement, not a finishing touch, for a learning designer’s portfolio.' },
  { h: 'It works without motion',
    b: 'Turn on reduced motion and the card lifts, the staggers and the page transitions all collapse to state changes. Nothing on this site is legible only while it is moving. Motion is optional; meaning is not.' },
  { h: 'It works without images',
    b: 'Every card puts its artwork in a band above the type instead of behind it, so a slow, dark or missing image costs you a picture and never a headline. The front page is fully readable with images disabled. The picture may wait. The headline does not.' },
  { h: 'Your StoryGen projects stay in your browser',
    b: 'StoryGen keeps your storyboards in your browser’s own storage, so they survive a refresh and never reach me. The others hold nothing at all. Where a tool calls a model it sends only the text you gave it for that one request, and nothing is kept on the way through. Your storyboard stays in the browser; only the text you submit is sent for that request.' }
]
</script>

<template>
  <EdShell width="page">
    <EdStoryHero
      title="How this site actually works"
      deck="A plain look at the technology, artwork, privacy choices, and decisions behind Entertrainer. No mystery tour; just the working parts."
    />

    <section class="co__sec" aria-labelledby="co-stack">
      <h2 id="co-stack" class="t-mono co__label">The technology, in plain terms</h2>
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
      <h2 id="co-choices" class="t-mono co__label">The decisions that matter</h2>
      <div class="co__choices">
        <article v-for="(c, i) in choices" :key="c.h" class="co__choice u-reveal" :style="{ '--i': i }">
          <h3 class="co__choice-h">{{ c.h }}</h3>
          <p class="co__choice-b t-read">{{ c.b }}</p>
        </article>
      </div>
    </section>

    <footer class="co__foot">
      <p>Found a problem? Tell me where it went wrong.</p>
      <a class="ticket" :href="`mailto:${email}`">Report a problem</a>
    </footer>

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
