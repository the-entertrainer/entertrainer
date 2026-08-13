<script setup lang="ts">
// About.
//
// The five chapters spent a release inside a drag deck. It was the wrong
// container twice over. A career is a sequence you read, not a set you choose
// between — nobody wants to *operate* somebody's life story — and a deck shows
// one chapter at a time, so four fifths of the page was hidden behind a
// gesture and marked aria-hidden for anyone using a screen reader. Carousel
// research puts interaction with the first slide at around 1% and with any
// later slide under 0.5%, which for an about page means almost nobody ever
// reached the part where he becomes an instructional designer.
//
// It is a vertical narrative now: every chapter present, in order, image
// alongside text, alternating sides so the eye has a reason to keep going.
// You scroll. That is what people do on an about page.
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
        <p class="ab-hero__lead" v-motion :initial="rv.lead.initial" :visible-once="rv.lead.visibleOnce">I <em>design</em> learning, <em>build</em> the tools that deliver it, and keep <em>daring</em> to try the thing I have not tried yet. Certified, but that is the least interesting part.</p>
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
        <span class="t-mono ab-body__eyebrow">The short version, in five stops</span>
        <h2 class="t-display ab-body__title">Hospitality to L&amp;D</h2>
      </div>

      <ol class="ab-story">
        <li v-for="(c, i) in CHAPTERS" :key="c.n" class="ab-ch u-reveal" :class="{ 'ab-ch--flip': i % 2 === 1 }">
          <figure class="ab-ch__fig">
            <UiCard3D :src="c.img" :alt="c.alt" ratio="4/3" :strength="8" radius="14rem" />
          </figure>
          <div class="ab-ch__text">
            <p class="t-mono ab-ch__eyebrow"><em>{{ c.n }}</em> — {{ c.eyebrow }}</p>
            <h3 class="t-display ab-ch__head">{{ c.head }}</h3>
            <p class="ab-ch__body">{{ c.body }}</p>
            <p class="t-mono ab-ch__place">{{ c.place }}</p>
          </div>
        </li>
      </ol>

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
.ab-body__head { max-width: 640rem; margin: 0 0 clamp(34rem, 6vh, 64rem); }
.ab-body__eyebrow { display: inline-block; opacity: 0.6; margin-bottom: 10rem; }
.ab-body__title { font-size: var(--text-h2); line-height: 1; }

/* ── The story ────────────────────────────────────────────────────────────
   One chapter per row: image on one side, text on the other, sides swapping
   as you go down so the page has a rhythm rather than a column of identical
   blocks. Below 820px it stacks — two 380px columns is worse than one of 760
   for both the photograph and the prose. */
.ab-story { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: clamp(48rem, 8vh, 110rem); }
.ab-ch {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(28rem, 4vw, 64rem);
  align-items: center;
}
.ab-ch--flip .ab-ch__fig  { order: 2; }
.ab-ch--flip .ab-ch__text { order: 1; }

.ab-ch__fig { margin: 0; min-width: 0; }
.ab-ch__text { min-width: 0; max-width: 46ch; }
.ab-ch__eyebrow { margin: 0 0 14rem; opacity: 0.5; }
.ab-ch__eyebrow em { font-style: normal; opacity: 0.75; margin-right: 4rem; }
/* The chapter heading is the second-largest thing on the page, under the name
   itself — it is a chapter title, not a caption. */
.ab-ch__head { font-size: var(--text-h2); line-height: 1.02; margin: 0 0 16rem; }
.ab-ch__body { margin: 0; font-size: var(--text-body); line-height: 1.68; opacity: 0.78; }
.ab-ch__place { margin: 18rem 0 0; font-size: 10.5rem; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.42; }

@media (max-width: 820px) {
  .ab-ch { grid-template-columns: minmax(0, 1fr); gap: 22rem; }
  .ab-ch--flip .ab-ch__fig  { order: 0; }
  .ab-ch--flip .ab-ch__text { order: 0; }
  .ab-ch__text { max-width: none; }
}

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
