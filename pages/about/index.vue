<script setup lang="ts">
/**
 * About — a story page, in the publication's story-page anatomy.
 *
 * Five chapters, in order, every one on the page. They spent a release inside
 * a drag deck, which hid four fifths of a career behind a gesture; carousel
 * research puts interaction with the first slide at around 1% and with any
 * later slide under 0.5%. A career is a sequence you read, not a set you
 * operate.
 *
 * Paper Signal setting: a narrow reading measure and one quiet illustration
 * grammar rather than mixed photographic chapter bands.
 */
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'Naveen Jose’s story: from hotel floors to making lessons and useful tools for people around the world.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'From hotel floors to making lessons and useful tools for people around the world.',
  ogUrl: 'https://entertrainer.in/about'
})

interface Chapter { head: string; body: string; art: 'route' | 'lesson' | 'project' | 'tool' | 'evidence'; alt: string; place: string }

const CHAPTERS: Chapter[] = [
  { head: 'On hotel floors',
    body: 'I studied hotel management in Chennai and began on hotel floors. The work taught me to notice service details and respond when people needed help.',
    art: 'lesson', alt: 'Paper Signal chapter illustration for early hospitality work', place: 'Chennai · Hotel management' },
  { head: 'Drawing comics and designing learning',
    body: 'At Club Mahindra I moved into Learning and Development and drew The SEWA Chronicles from real guest-experience stories. It was the first project I took from workplace reporting to a finished comic.',
    art: 'project', alt: 'Paper Signal chapter illustration for The SEWA Chronicles', place: 'Club Mahindra · L&D' },
  { head: 'Running training programs',
    body: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams, from frontline associates through to managers. I learned how to plan a program that people could complete and use.',
    art: 'evidence', alt: 'Paper Signal chapter illustration for training work', place: 'Courtyard by Marriott' },
  { head: 'Designing and shipping tools',
    body: 'I build training in Articulate Storyline and the tools around it. StoryGen, EasyMCQ, Cadence, and this site are designed and built by me.',
    art: 'tool', alt: 'Paper Signal chapter illustration for the workbench', place: 'The workbench' },
  { head: 'Learning at scale',
    body: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world. I use motion, WebGL, and AI only when they help people understand or use the learning.',
    art: 'route', alt: 'Paper Signal chapter illustration for current work', place: 'Concentrix · Training-as-a-Service' }
]
</script>

<template>
  <EdShell width="page">
    <EdStoryHero
      title="Naveen Jose"
      deck="From hotel floors to learning at scale."
    />

    <EdPaperSignal class="ab__path-art u-paper-reveal" variant="route" label="A Paper Signal career route illustration" />

    <ol class="ab__story ab__story--path">
      <li v-for="(c, index) in CHAPTERS" :key="c.head" :class="['ch', index % 2 ? 'ch--even' : 'ch--odd']" :style="{ '--chapter-delay': `${index * 90}ms` }">
        <figure class="ch__fig">
          <EdPaperSignal :variant="c.art" :label="c.alt" />
          <figcaption class="t-mono ch__cap">{{ c.place }}</figcaption>
        </figure>
        <div class="ch__text ed">
          <h3 class="ch__head">{{ c.head }}</h3>
          <p class="ch__body t-read">{{ c.body }}</p>
        </div>
      </li>
    </ol>

    <footer class="ab__close">
      <EdNote label="A line I keep" accent="var(--purple)">
        <p>Asatoma Sadgamaya — from ignorance, toward truth.</p>
      </EdNote>
      <div class="ab__cta">
        <NuxtLink to="/my-work" class="ticket">See projects</NuxtLink>
      </div>
    </footer>
  </EdShell>
</template>

<style scoped>
.ab__lede { margin: clamp(46rem, 7vw, 84rem) 0 clamp(44rem, 6vw, 76rem); }
.ab__h2 { font-size: var(--type-display); margin: 0; }.ab__h2--path { animation: about-path-title 720ms var(--ease-expo-out) both; }
@keyframes about-path-title { from { opacity: 0; transform: translateX(-16rem); clip-path: inset(0 100% 0 0); } to { opacity: 1; transform: none; clip-path: inset(0 0 0 0); } }
.ab__path-art { min-height: 250rem; margin: 0 0 clamp(68rem, 10vw, 128rem); border: 0; }

.ab__story { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: clamp(68rem, 11vh, 148rem); }

/* Paper Signal chapters retain the reading measure and use a quiet visual
   anchor instead of full-bleed photographs or a decorative route line. */
.ch { position: relative; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: clamp(18rem, 3vw, 42rem); row-gap: clamp(22rem, 3vw, 34rem); }
.ch--odd .ch__fig { grid-column: 1 / span 8; }.ch--odd .ch__text { grid-column: 6 / span 7; margin-top: clamp(32rem, 7vw, 100rem); }
.ch--even .ch__fig { grid-column: 5 / span 8; }.ch--even .ch__text { grid-column: 1 / span 7; margin-top: clamp(32rem, 7vw, 100rem); }
.ch__fig { margin: 0; animation: chapter-photo 760ms var(--ease-expo-out) var(--chapter-delay, 0ms) both; }.ch__fig :deep(.ps-art) { aspect-ratio: 16 / 9; min-height: 0; }
.ch__cap { margin: 10rem 0 0; color: var(--muted); }

.ch__text { --ed-text: 640rem; animation: chapter-text 560ms var(--ease-out) calc(var(--chapter-delay, 0ms) + 120ms) both; }
.ch__head { font-size: var(--type-h2); margin: 0 0 12rem; line-height: 1.05; }
.ch__body { margin: 0; max-width: var(--measure-body); }
@keyframes chapter-photo { from { opacity: 0; clip-path: inset(0 0 100% 0); transform: translateY(14rem); } to { opacity: 1; clip-path: inset(0 0 0 0); transform: none; } }
@keyframes chapter-text { from { opacity: 0; transform: translateX(14rem); } to { opacity: 1; transform: none; } }

.ab__close {
  margin-top: clamp(48rem, 8vh, 90rem);
  display: flex; flex-wrap: wrap; align-items: center; gap: clamp(20rem, 3vw, 36rem);
  justify-content: space-between;
}
.ab__cta { display: flex; flex-wrap: wrap; gap: 12rem; }
@media (max-width: 680px) { .ab__path-art { min-height: 180rem; }.ch { display: flex; flex-direction: column; gap: 22rem; }.ch--odd .ch__text, .ch--even .ch__text { margin-top: 0; } }
@media (prefers-reduced-motion: reduce) { .ab__h2--path, .ch__fig, .ch__text { animation: none; } }
</style>
