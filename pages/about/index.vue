<script setup lang="ts">
// About — the identity hero stays a normal scrolling page (there is nothing
// to spatially navigate about a name and a portrait), but the chapters that
// used to run on as six full-height scroll-jacked sections are now a
// UiSpatialDeck: the same drag-and-settle the rest of the site's content
// runs on, not a stepper dot-nav driving an IntersectionObserver.
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'Naveen Jose — a certified instructional designer who designs learning, builds the tools to deliver it, and keeps daring to try new tech.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'A certified instructional designer who designs, builds, and dares to try new tech.',
  ogUrl: 'https://entertrainer.in/about'
})

const R = useReveal()
const rv = {
  eyebrow: R.rise(0), name: R.rise(90), lead: R.rise(210), meta: R.rise(300),
  portrait: R.scaleIn(140), cue: R.fade(460)
}

interface Chapter { n: string; eyebrow: string; head: string; body: string; img: string; alt: string; place: string; footnote?: string }
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
    img: '/about/about-concentrix.webp', alt: 'Portrait, present day, at Concentrix', place: 'Concentrix · Training-as-a-Service',
  }
]
</script>

<template>
  <div class="ab">
    <UiPageOptics />

    <!-- Hero -->
    <section class="ab-hero">
      <div class="ab-hero__glow" aria-hidden="true" />
      <div class="ab-hero__copy">
        <span class="ab-hero__eyebrow" v-motion :initial="rv.eyebrow.initial" :visible-once="rv.eyebrow.visibleOnce">About · a short story</span>
        <h1 class="ab-hero__name" v-motion :initial="rv.name.initial" :visible-once="rv.name.visibleOnce">Naveen <br>Jose</h1>
        <p class="ab-hero__lead" v-motion :initial="rv.lead.initial" :visible-once="rv.lead.visibleOnce">A certified instructional designer who <em>designs</em> learning, <em>builds</em> the tools that deliver it, and <em>dares</em> to try the new thing.</p>
        <div class="ab-hero__meta" v-motion :initial="rv.meta.initial" :visible-once="rv.meta.visibleOnce">
          <span>Instructional Designer</span> <i aria-hidden="true">·</i> <span>Gurugram, IN</span>
        </div>
      </div>
      <figure class="ab-hero__portrait" v-motion :initial="rv.portrait.initial" :visible-once="rv.portrait.visibleOnce">
        <UiCard3D src="/about-me.png" alt="Portrait of Naveen Jose" ratio="fill" :strength="10" radius="16rem" eager />
      </figure>
    </section>

    <!-- Chapters: a deck, not a scroll -->
    <main class="ab-body">
      <div class="ab-body__head">
        <span class="t-mono ab-body__eyebrow">Five stops · drag to move</span>
        <h2 class="t-display ab-body__title">Hospitality to L&amp;D</h2>
      </div>

      <UiSpatialDeck :items="CHAPTERS" aria-label="Chapters of the story" fill aspect="7/6" aspect-narrow="5/6">
        <template #default="{ item }">
          <article class="ab-card lg lg--raised">
            <div class="ab-card__figure">
              <UiCard3D :src="item.img" :alt="item.alt" ratio="fill" :strength="8" radius="0" />
            </div>
            <div class="ab-card__body">
              <span class="t-mono ab-card__eyebrow"><em>{{ item.n }}</em> — {{ item.eyebrow }}</span>
              <h3 class="t-display ab-card__head">{{ item.head }}</h3>
              <p class="ab-card__text">{{ item.body }}</p>
              <p class="ab-card__place">{{ item.place }}</p>
            </div>
          </article>
        </template>
      </UiSpatialDeck>

      <footer class="ab-close">
        <p class="ab-close__quote">Asatoma Sadgamaya — from ignorance, toward truth.</p>
        <div class="ab-close__cta">
          <NuxtLink to="/my-work" class="glass-btn">See my work</NuxtLink>
          <NuxtLink to="/tools" class="glass-btn glass-btn--ghost">The web apps I built</NuxtLink>
        </div>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.ab {
  position: relative; background: var(--color-bg); color: var(--color-text);
  min-height: 100dvh; overflow-x: clip;
  /* The frame is the site's, not this page's. --edge/--maxw were a private
     grid that put this hero's copy 4px off /my-work's and 168px off
     /instructional-design's. */
  --edge: var(--shell-gutter); --maxw: var(--shell-max);
  --serif: var(--display-font);
}


.ab-hero { position: relative; max-width: var(--maxw); margin: 0 auto; padding: calc(var(--page-top) + 20rem) var(--edge) clamp(48rem, 8vh, 96rem); display: grid; gap: clamp(30rem, 5vw, 70rem); align-items: center; grid-template-columns: 1.05fr 0.95fr; }
.ab-hero__glow { position: absolute; z-index: 0; top: 18%; left: 28%; width: 60vw; height: 60vw; max-width: 720rem; max-height: 720rem; translate: -50% -30%; pointer-events: none; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--color-accent) 42%, transparent), transparent 62%); opacity: 0.3; filter: blur(30rem); }
.ab-hero__copy { position: relative; z-index: 2; max-width: 560rem; }
.ab-hero__eyebrow { display: inline-block; font-family: var(--mono-font); font-weight: 500; font-size: 12rem; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.7; margin-bottom: 22rem; }
.ab-hero__name { font-family: var(--serif); font-optical-sizing: auto; font-weight: 400; font-size: var(--text-h1); font-weight: 800; line-height: 0.92; letter-spacing: var(--tracking-display); margin: 0; }
.ab-hero__lead { margin: clamp(24rem, 3vw, 38rem) 0 0; max-width: 44ch; font-size: clamp(16rem, 1.8vw, 21rem); line-height: 1.58; opacity: 0.9; }
.ab-hero__lead em { font-family: var(--serif); font-style: italic; font-weight: 500; opacity: 1; }
.ab-hero__meta { margin-top: 26rem; display: flex; align-items: center; gap: 12rem; font-size: 12.5rem; letter-spacing: 0.06em; font-weight: 600; opacity: 0.72; flex-wrap: wrap; }
.ab-hero__meta i { opacity: 0.5; }
/* Card3D frames itself — its own rim light, sheen and outward glow — so this
   wrapper only needs to set the box it fills, not frame it a second time. */
.ab-hero__portrait { position: relative; z-index: 1; margin: 0; width: 100%; max-width: 440rem; justify-self: center; aspect-ratio: 4 / 5; }

.ab-body { position: relative; z-index: 1; max-width: var(--maxw); margin: 0 auto; padding: clamp(24rem, 4vh, 56rem) var(--edge) calc(90rem + var(--safe-bottom)); }
.ab-body__head { max-width: 640rem; margin: 0 auto clamp(26rem, 4vh, 44rem); text-align: center; }
.ab-body__eyebrow { display: inline-block; opacity: 0.6; margin-bottom: 10rem; }
.ab-body__title { font-size: var(--text-h2); line-height: 1; }

/* The chapter card: same glass surface the rest of the spiral's decks use —
   full-bleed photo on top, the text underneath. */
.ab-card {
  display: flex; flex-direction: column; width: 100%; height: 100%;
  border-radius: 20rem; overflow: hidden;
}
.ab-card__figure { flex: 1 1 auto; min-height: 0; }
.ab-card__figure :deep(.c3) { height: 100%; }
.ab-card__figure :deep(.c3__plate) { border-radius: 0; box-shadow: none; height: 100%; }
.ab-card__figure :deep(.c3__img) { height: 100%; }
.ab-card__body {
  position: relative;
  display: flex; flex-direction: column; gap: 6rem;
  padding: 22rem 24rem 24rem; flex-shrink: 0;
  background: linear-gradient(to bottom,
    color-mix(in srgb, var(--color-bg) 55%, transparent) 0%,
    color-mix(in srgb, var(--color-bg) 88%, transparent) 38%,
    color-mix(in srgb, var(--color-bg) 94%, transparent) 100%);
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
}
.ab-card__eyebrow { opacity: 0.6; }
.ab-card__eyebrow em { font-style: normal; opacity: 0.7; margin-right: 4rem; }
.ab-card__head { font-size: var(--text-h3); line-height: 1.05; }
.ab-card__text {
  margin-top: 4rem; font-size: var(--text-sm); line-height: 1.55; opacity: 0.78;
  display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden;
}
.ab-card__place { margin-top: 2rem; font-size: 11rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.5; }

.ab-close { max-width: 560rem; margin: clamp(40rem, 7vh, 72rem) auto 0; text-align: center; }
.ab-close__quote { font-family: var(--serif); font-style: italic; font-size: 16rem; opacity: 0.7; margin: 0; }
.ab-close__cta { display: flex; flex-wrap: wrap; justify-content: center; gap: 12rem; margin-top: 22rem; }
.ab-close__cta .glass-btn { text-decoration: none; }

@media (max-width: 900px) {
  .ab-hero { grid-template-columns: 1fr; min-height: auto; padding: calc(96rem + var(--safe-top)) var(--edge) 64rem; gap: 40rem; }
  .ab-hero__portrait { order: -1; max-width: 360rem; aspect-ratio: 3 / 4; }
  .ab-hero__glow { top: 6%; left: 50%; width: 90vw; height: 90vw; }
}
</style>
