<script setup lang="ts">
/**
 * The human voice: a narrow column of prose with 240px of air above and below
 * it, and a scatter of photographs drifting past at different rates behind.
 *
 * The second paragraph is doing the real work. The original tells a long career
 * as one sentence of comma-separated clauses ending on a forward-looking note,
 * and it is the most reusable device on that site: it reads as momentum rather
 * than a CV. Every clause below is drawn from the chapters in
 * pages/about/index.vue — none of it is invented.
 *
 * The credentials slab takes the structural slot the original gives its awards
 * list: dense, mono, hairline-ruled, unglamorous. What fills it is the real
 * thing — where Naveen has worked and what he has shipped.
 */
const CREDENTIALS: Array<[string, string]> = [
  ['Certified', 'Instructional Design Specialist'],
  ['Now', 'Concentrix — Training-as-a-Service'],
  ['Before', 'Courtyard by Marriott — L&D Specialist'],
  ['Before', 'Club Mahindra — L&D, The SEWA Chronicles'],
  ['Started', 'Hotel management, Chennai'],
  ['Shipped', '4 web apps · 15 WebGL experiments'],
  ['Tools', 'Storyline · Nuxt · Three.js · far too much CSS']
]

// `d` is depth: how far each plate drifts against the section's progress.
const GALLERY = [
  { src: '/about/about-housekeeper-1.webp', cap: 'On the floor, where the noticing started', x: 4, y: 2, w: 17, r: -4, d: 0.55 },
  { src: '/about/about-sewa-1.webp', cap: 'The page that changed the plan', x: 78, y: 8, w: 19, r: 5, d: 0.95 },
  { src: '/work-01.png', cap: 'The SEWA Chronicles', x: 84, y: 34, w: 14, r: -3, d: 0.4 },
  { src: '/about/about-onboarding.webp', cap: 'Certification programs, Courtyard by Marriott', x: 1, y: 40, w: 16, r: 3, d: 1.3 },
  { src: '/strong.png', cap: 'Strong — entropy, in bits', x: 7, y: 68, w: 13, r: 6, d: 0.75 },
  { src: '/about/about-ignite.webp', cap: 'A module in progress on the workbench', x: 80, y: 63, w: 17, r: -6, d: 0.7 },
  { src: '/about/about-concentrix.webp', cap: 'Present day ♥', x: 86, y: 86, w: 13, r: 4, d: 1.15 },
  { src: '/storygen.png', cap: 'StoryGen, mid-build', x: 2, y: 88, w: 15, r: -5, d: 0.5 }
]

const root = ref<HTMLElement | null>(null)
useWodProgress(root)
</script>

<template>
  <section id="about" ref="root" class="wa">
    <div class="wa__scatter" aria-hidden="true">
      <figure v-for="(g, i) in GALLERY" :key="i" class="wa__plate"
              :style="{ '--x': g.x + '%', '--y': g.y + '%', '--w': g.w + '%', '--r': g.r + 'deg', '--d': g.d }">
        <img :src="g.src" alt="" loading="lazy" decoding="async">
        <figcaption>{{ g.cap }}</figcaption>
      </figure>
    </div>

    <div class="wa__body">
      <p class="w-prose wa__lead">
        I work with teams who need training people will actually finish — and I
        build the tools that make it, when the tools don't already exist.
      </p>

      <p class="w-base wa__run">
        I studied hotel management in Chennai, started on the hotel floor, moved
        into L&amp;D at Club Mahindra, drew a comic about guest service that
        changed my mind about everything, ran certification programs at
        Courtyard by Marriott, got certified as an instructional designer,
        started building the tools I couldn't find, shipped
        <NuxtLink to="/tools">four of them</NuxtLink>, and now turn operational
        detail into e-learning for teams around the world at Concentrix — and I
        still learn something new every single build.
      </p>

      <h2 class="wa__h">Credentials</h2>
      <dl class="wa__cred">
        <div v-for="(c, i) in CREDENTIALS" :key="i" class="wa__row">
          <dt>{{ c[0] }}</dt>
          <dd>{{ c[1] }}</dd>
        </div>
      </dl>

      <NuxtLink to="/about" class="wa__more">The longer story <span aria-hidden="true">&rarr;</span></NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.wa {
  position: relative;
  z-index: 3;
  padding: var(--w-gap-section) 0;
  overflow: hidden;
}

.wa__body {
  position: relative;
  z-index: 2;
  width: var(--w-measure);
  max-width: calc(100% - 2 * var(--w-edge));
  margin: 0 auto;
}

.wa__lead { margin: 0; font-size: var(--w-lead); line-height: 1.13; color: var(--w-ink); }
.wa__run { margin: 40rem 0 0; color: var(--w-ink); }
.wa__run a {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wa__run a:hover { background: var(--w-red); color: var(--w-paper); text-decoration-color: transparent; }

.wa__h {
  margin: 72rem 0 0;
  font-family: var(--w-mono);
  font-size: var(--w-chrome);
  font-weight: 700;
  letter-spacing: var(--w-track-chrome);
  text-transform: uppercase;
  color: var(--w-ink);
}

/* Hairline-ruled rows, two columns, no decoration. The form carries the
   authority so the copy never has to strain for it. */
.wa__cred {
  margin: 16rem 0 0;
  border-top: 1px solid var(--w-rule);
  font-family: var(--w-mono);
  font-size: var(--w-chrome);
  letter-spacing: var(--w-track-chrome);
}
.wa__row {
  display: grid;
  grid-template-columns: minmax(88rem, 24%) 1fr;
  gap: 16rem;
  padding: 12rem 0;
  border-bottom: 1px solid var(--w-rule);
}
.wa__cred dt { margin: 0; text-transform: uppercase; color: var(--w-ink-55); }
.wa__cred dd { margin: 0; color: var(--w-ink); }

.wa__more {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  margin-top: 40rem;
  padding: 13rem 20rem;
  border: 1px solid var(--w-rule);
  font-family: var(--w-mono);
  font-size: var(--w-chrome);
  letter-spacing: var(--w-track-chrome);
  text-transform: uppercase;
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wa__more:hover { background: var(--w-ink); color: var(--w-paper); }
.wa__more span { transition: transform 0.3s var(--w-ease); }
.wa__more:hover span { transform: translateX(4rem); }

/* ── The scatter ────────────────────────────────────────────────────────
   Absolutely placed, each plate multiplying the section's own `--p` by its own
   depth. One number, a whole parallax field. */
.wa__scatter { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.wa__plate {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w);
  margin: 0;
  rotate: var(--r);
  translate: 0 calc((var(--p, 0.5) - 0.5) * var(--d) * -280rem);
  will-change: translate;
}
.wa__plate img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--w-rule);
  filter: grayscale(1) contrast(1.05);
}
.wa__plate figcaption {
  margin-top: 6rem;
  font-family: var(--w-mono);
  font-size: var(--w-micro);
  line-height: 1.4;
  letter-spacing: 0.04em;
  color: var(--w-ink-55);
}

/* Below the width where the column and the scatter start colliding, the
   photographs lose. They are atmosphere; the copy is the section. */
@media only screen and (max-width: 1180px) { .wa__scatter { display: none; } }
@media only screen and (max-width: 576px) {
  .wa__row { grid-template-columns: 1fr; gap: 3rem; }
}

@media (prefers-reduced-motion: reduce) { .wa__plate { translate: none; } }
</style>
