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
  title: 'About Me — Naveen Jose · Entertrainer',
  description: 'Naveen Jose’s story, from hotel floors to learning at scale and the useful tools built along the way.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'From hotel floors to learning at scale, with a few useful tools built along the way.',
  ogUrl: 'https://entertrainer.in/about'
})

interface Chapter { head: string; body: string; art: 'route' | 'lesson' | 'project' | 'tool' | 'evidence'; alt: string; place: string }

const CHAPTERS: Chapter[] = [
  { head: 'Starting on hotel floors',
    body: 'I studied hotel management in Chennai and started on hotel floors. The work taught me to notice the small service details and respond when people actually needed help.',
    art: 'lesson', alt: 'Paper Signal chapter illustration for early hospitality work', place: 'Chennai · Hotel management' },
  { head: 'Turning guest stories into learning',
    body: 'At Club Mahindra, I moved into Learning and Development and drew The SEWA Chronicles from real guest-experience stories. It was the first project I carried from workplace reporting all the way to a finished comic. I turned a workplace report into a finished comic people could read.',
    art: 'project', alt: 'Paper Signal chapter illustration for The SEWA Chronicles', place: 'Club Mahindra · L&D' },
  { head: 'Making training programs work',
    body: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams, from frontline associates through to managers. That taught me the practical part: a program has to be something people can complete and use after the training ends.',
    art: 'evidence', alt: 'Paper Signal chapter illustration for training work', place: 'Courtyard by Marriott' },
  { head: 'Building the tools around learning',
    body: 'I build training in Articulate Storyline, along with the tools around it. StoryGen, EasyMCQ, Cadence, and this site are designed and built by me. If the same work keeps repeating, eventually I start building a tool for it.',
    art: 'tool', alt: 'Paper Signal chapter illustration for the workbench', place: 'The workbench' },
  { head: 'Learning at scale',
    body: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams. I use motion, WebGL, and AI when they help people understand or use the learning, not merely because the technology is standing nearby.',
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

    <section id="sewa-chronicles" class="ab__sewa" aria-labelledby="sewa-title">
      <p class="t-mono">A project I still care about</p>
      <h2 id="sewa-title">The SEWA Chronicles</h2>
      <p>A sixteen-page comic made from real resort service stories at Club Mahindra. It began as a workplace report and became the first project I took all the way from reporting to drawing to a finished publication. Essentially, one small work report refused to remain a work report.</p>
      <NuxtLink to="/my-work/sewa-chronicles" class="ticket">Read the SEWA Chronicles</NuxtLink>
    </section>

    <footer class="ab__close">
      <EdNote label="A line I keep" accent="var(--purple)">
        <p>Asatoma Sadgamaya — from ignorance, toward truth.</p>
      </EdNote>
      <div class="ab__cta"><NuxtLink to="/elevate" class="ticket">Read Elevate</NuxtLink></div>
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
.ab__sewa { max-width: 760rem; margin: clamp(78rem, 12vw, 150rem) 0 0 auto; padding: clamp(28rem, 5vw, 56rem); border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); background: var(--signal-field); }.ab__sewa > p:first-child { margin: 0; color: var(--ink-soft); font-size: 11rem; letter-spacing: .08em; text-transform: uppercase; }.ab__sewa h2 { margin: 13rem 0; font: 500 clamp(38rem, 5vw, 68rem)/.9 var(--font-display); letter-spacing: -.05em; }.ab__sewa > p:not(:first-child) { max-width: 58ch; margin: 0; font-family: var(--font-reading); font-size: 18rem; line-height: 1.55; }.ab__sewa .ticket { display: inline-flex; margin-top: 24rem; }
.ab__cta { display: flex; flex-wrap: wrap; gap: 12rem; }
@media (max-width: 680px) { .ab__path-art { min-height: 180rem; }.ch { display: flex; flex-direction: column; gap: 22rem; }.ch--odd .ch__text, .ch--even .ch__text { margin-top: 0; } }
@media (prefers-reduced-motion: reduce) { .ab__h2--path, .ch__fig, .ch__text { animation: none; } }
</style>
