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
  description: 'Naveen Jose — a certified instructional designer who designs learning, builds the tools to deliver it, and keeps daring to try new tech.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'A certified instructional designer who designs, builds, and dares to try new tech.',
  ogUrl: 'https://entertrainer.in/about'
})

interface Chapter { n: string; eyebrow: string; head: string; body: string; img: string; alt: string; place: string }

const CHAPTERS: Chapter[] = [
  { n: '01', eyebrow: 'Where it began', head: 'It started in hospitality',
    body: 'I studied hotel management in Chennai and began on the floor. Hospitality is where I learned to notice the small things that make service feel human — the details nobody asks for but everybody remembers.',
    img: '/about/about-housekeeper-1.webp', alt: 'On the hotel floor in the early hospitality years', place: 'Chennai · Hotel management' },
  { n: '02', eyebrow: 'The turn', head: 'A comic, and a new path',
    body: 'At Club Mahindra I moved into learning and development, and drew The SEWA Chronicles — a small comic of real guest-experience stories. That was the moment design stopped being a side interest and became the plan.',
    img: '/about/about-sewa-1.webp', alt: 'A page from The SEWA Chronicles comic', place: 'Club Mahindra · L&D' },
  { n: '03', eyebrow: 'The craft', head: 'Frontline to manager',
    body: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams — frontline associates through to managers. I learned how a good program actually holds together.',
    img: '/about/about-onboarding.webp', alt: 'Running a training session at Courtyard by Marriott', place: 'Courtyard by Marriott' },
  { n: '04', eyebrow: 'The tools', head: 'I design, and I build',
    body: 'I build training in Articulate Storyline — but I also ship the tools around it. StoryGen, EasyMCQ, Cadence, this very site: designed and built by me, because the idea deserved to exist.',
    img: '/about/about-ignite.webp', alt: 'A module in progress on the workbench', place: 'The workbench' },
  { n: '05', eyebrow: 'Now', head: 'Designing, building, daring',
    body: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world. I still reach for whatever is new — motion, WebGL, a little AI — on the days it makes the learning land better.',
    img: '/about/about-concentrix.webp', alt: 'Portrait, present day, at Concentrix', place: 'Concentrix · Training-as-a-Service' }
]
</script>

<template>
  <EdShell width="page">
    <EdStoryHero
      category="story"
      media="essay"
      title="Naveen Jose"
      deck="I design learning, build the tools that deliver it, and keep daring to try the thing I have not tried yet. Certified, but that is the least interesting part."
      stamp="Instructional Designer · Gurugram, IN"
      :minutes="4"
      byline
    >
      <figure class="ab__portrait">
        <img src="/about-me.png" alt="Portrait of Naveen Jose" width="880" height="1100" />
      </figure>
    </EdStoryHero>

    <div class="ab__lede">
      <p class="t-mono ab__kicker">The short version, in five stops</p>
      <h2 class="t-display ab__h2">Hospitality to L&amp;D</h2>
    </div>

    <ol class="ab__story">
      <li v-for="c in CHAPTERS" :key="c.n" class="ch u-reveal">
        <figure class="ch__fig">
          <img :src="c.img" :alt="c.alt" loading="lazy" decoding="async" />
          <figcaption class="t-mono ch__cap">{{ c.place }}</figcaption>
        </figure>
        <div class="ch__text ed">
          <p class="ed-note ch__n"><b>Chapter {{ c.n }}</b>{{ c.eyebrow }}</p>
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
        <NuxtLink to="/my-work" class="ticket">See my work</NuxtLink>
        <NuxtLink to="/tools" class="ticket ticket--ghost">The web apps I built</NuxtLink>
      </div>
    </footer>

    <EdReadNext from="about" />
  </EdShell>
</template>

<style scoped>
.ab__portrait {
  margin: clamp(24rem, 4vw, 40rem) 0 0;
  max-width: 320rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-l);
  overflow: hidden;
  
  background: var(--paper-2);
}
.ab__portrait img { display: block; width: 100%; height: auto; }

.ab__lede { margin: clamp(30rem, 5vw, 56rem) 0 clamp(24rem, 4vw, 40rem); }
.ab__kicker { margin: 0 0 10rem; color: var(--muted); }
.ab__h2 { font-size: var(--type-display); margin: 0; }

.ab__story { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: clamp(44rem, 7vh, 88rem); }

/* Each chapter is a band: the photograph at the full page width with its place
   printed under it, then the reading column beneath. Alternating image/text
   columns looked composed but made two 380px columns out of one good 760, and
   the photographs are the weaker half of that trade. */
.ch { display: flex; flex-direction: column; gap: clamp(18rem, 2.5vw, 28rem); }
.ch__fig { margin: 0; }
.ch__fig img {
  display: block; width: 100%; height: auto;
  aspect-ratio: 16 / 9; object-fit: cover;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-l);
  background: var(--paper-2);
}
.ch__cap { margin: 10rem 0 0; color: var(--muted); }

.ch__text { --ed-text: 640rem; }
.ch__n { margin: 0; }
.ch__head { font-size: var(--type-h2); margin: 0 0 12rem; line-height: 1.05; }
.ch__body { margin: 0; max-width: var(--measure-body); }

.ab__close {
  margin-top: clamp(48rem, 8vh, 90rem);
  display: flex; flex-wrap: wrap; align-items: center; gap: clamp(20rem, 3vw, 36rem);
  justify-content: space-between;
}
.ab__cta { display: flex; flex-wrap: wrap; gap: 12rem; }
</style>
