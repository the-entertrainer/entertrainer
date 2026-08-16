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
 * What changed in the redesign is the setting, not the substance: a narrow
 * reading measure in a serif, the chapter number and place hung in the margin
 * as apparatus, and each photograph given a full-bleed band of its own so the
 * page has chapters you can see from across the room.
 */
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'Naveen Jose’s story: from hotel floors to making lessons and useful tools for people around the world.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'From hotel floors to making lessons and useful tools for people around the world.',
  ogUrl: 'https://entertrainer.in/about'
})

interface Chapter { head: string; body: string; img: string; alt: string; place: string }

const CHAPTERS: Chapter[] = [
  { head: 'It started in hospitality',
    body: 'I studied hotel management in Chennai and began on the floor. Hospitality is where I learned to notice the small things that make service feel human — the details nobody asks for but everybody remembers.',
    img: '/about/about-housekeeper-1.webp', alt: 'On the hotel floor in the early hospitality years', place: 'Chennai · Hotel management' },
  { head: 'A comic, and a new path',
    body: 'At Club Mahindra I moved into learning and development, and drew The SEWA Chronicles — a small comic of real guest-experience stories. That was the moment design stopped being a side interest and became the plan.',
    img: '/about/about-sewa-1.webp', alt: 'A page from The SEWA Chronicles comic', place: 'Club Mahindra · L&D' },
  { head: 'Frontline to manager',
    body: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams — frontline associates through to managers. I learned how a good program actually holds together.',
    img: '/about/about-onboarding.webp', alt: 'Running a training session at Courtyard by Marriott', place: 'Courtyard by Marriott' },
  { head: 'I design, and I build',
    body: 'I build training in Articulate Storyline — but I also ship the tools around it. StoryGen, EasyMCQ, Cadence, this very site: designed and built by me, because the idea deserved to exist.',
    img: '/about/about-ignite.webp', alt: 'A module in progress on the workbench', place: 'The workbench' },
  { head: 'What I do now',
    body: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world. I still reach for whatever is new — motion, WebGL, a little AI — on the days it makes the learning land better.',
    img: '/about/about-concentrix.webp', alt: 'Portrait, present day, at Concentrix', place: 'Concentrix · Training-as-a-Service' }
]
const chapterPathArt = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/AsqxheXjRYnWHnLi.jpg'
</script>

<template>
  <EdShell width="page">
    <EdStoryHero
      title="Naveen Jose"
      deck="I started on hotel floors. Now I make lessons, useful tools, and clearer ways to explain complicated work. This is how I got here."
    />

    <div class="ab__lede">
      <h2 class="t-display ab__h2 ab__h2--path">From hotel floors to making learning easier</h2>
    </div>
    <figure class="ab__path-art u-paper-reveal"><img :src="chapterPathArt" alt="A hand-drawn route connecting a service bell, folded map, teaching card, and pencil" loading="eager" decoding="async" /></figure>

    <ol class="ab__story ab__story--path">
      <li v-for="(c, index) in CHAPTERS" :key="c.head" class="ch" :style="{ '--chapter-delay': `${index * 90}ms` }">
        <figure class="ch__fig">
          <img :src="c.img" :alt="c.alt" loading="lazy" decoding="async" />
          <figcaption class="t-mono ch__cap">{{ c.place }}</figcaption>
        </figure>
        <div class="ch__text ed">
          <h3 class="ch__head">{{ c.head }}</h3>
          <p class="ch__body t-read">{{ c.body }}</p>
        </div>
      </li>
    </ol>

    <footer class="ab__close">
      <EdNote label="Something I keep" accent="var(--purple)">
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
.ab__path-art { margin: 0 0 clamp(68rem, 10vw, 128rem); overflow: hidden; border: var(--stroke) solid var(--line); background: var(--paper-2); }.ab__path-art img { display: block; width: 100%; aspect-ratio: 21 / 9; object-fit: cover; animation: about-route-art 13s var(--ease-in-out) both; }@keyframes about-route-art { from { transform: scale(1.035) translate3d(-.7%, 0, 0); } to { transform: none; } }

.ab__story { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: clamp(68rem, 11vh, 148rem); }.ab__story--path { position: relative; }.ab__story--path::before { content: ''; position: absolute; left: -18rem; top: 8rem; bottom: 12rem; width: 2rem; background: var(--blue); transform-origin: top; animation: about-route-grow 1.2s var(--ease-expo-out) both; }
@keyframes about-route-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

/* Each chapter is a band: the photograph at the full page width with its place
   printed under it, then the reading column beneath. Alternating image/text
   columns looked composed but made two 380px columns out of one good 760, and
   the photographs are the weaker half of that trade. */
.ch { display: flex; flex-direction: column; gap: clamp(22rem, 3vw, 34rem); }
.ch__fig { margin: 0; }
.ch__fig img {
  display: block; width: 100%; height: auto;
  aspect-ratio: 16 / 9; object-fit: cover;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-l);
  background: var(--paper-2);
  animation: chapter-photo 760ms var(--ease-expo-out) var(--chapter-delay, 0ms) both;
}
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
@media (max-width: 680px) { .ab__path-art img { aspect-ratio: 16 / 9; } }
@media (prefers-reduced-motion: reduce) { .ab__h2--path, .ab__path-art img, .ab__story--path::before, .ch__fig img, .ch__text { animation: none; } }
</style>
