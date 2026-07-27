<script setup lang="ts">
/**
 * The human voice.
 *
 * Two paragraphs and a credentials slab, in a narrow measure, surrounded by an
 * indecent amount of whitespace — then a scatter of photographs drifting at
 * different rates behind it.
 *
 * The second paragraph is doing the real work. The reference tells a fifteen-
 * year career as one sentence of comma-separated clauses ending on a
 * forward-looking note, and it is the single most reusable device on that
 * site: it reads as momentum instead of a CV. Every clause below is drawn from
 * the chapters in pages/about/index.vue — nothing here is invented.
 *
 * The credentials block takes the structural slot the reference gives its
 * awards list: dense, mono, two-column, unglamorous. Naveen has no awwwards
 * record and is not getting a fabricated one; what goes in the slot is the
 * real thing — where he has worked and what he has shipped.
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

const GALLERY = [
  { src: '/about/about-housekeeper-1.webp', cap: 'On the floor, where the noticing started', x: 6, y: 4, w: 20, r: -4, d: 0.55 },
  { src: '/about/about-sewa-1.webp', cap: 'The SEWA Chronicles — the page that changed the plan', x: 74, y: 12, w: 22, r: 5, d: 0.9 },
  { src: '/about/about-onboarding.webp', cap: 'Certification programs, Courtyard by Marriott', x: 2, y: 52, w: 18, r: 3, d: 1.25 },
  { src: '/about/about-ignite.webp', cap: 'A module in progress on the workbench', x: 79, y: 62, w: 19, r: -6, d: 0.7 },
  { src: '/about/about-concentrix.webp', cap: 'Present day ♥', x: 12, y: 82, w: 16, r: 7, d: 1.05 }
]

const root = ref<HTMLElement | null>(null)
useScrollProgress(root)
</script>

<template>
  <section id="about" ref="root" class="wa">
    <!-- Decorative scatter. Each plate multiplies the section's own scroll
         progress by a different coefficient, so one number produces the whole
         parallax field. -->
    <div class="wa__scatter" aria-hidden="true">
      <figure v-for="(g, i) in GALLERY" :key="i" class="wa__plate"
              :style="{ '--x': g.x + '%', '--y': g.y + '%', '--w': g.w + '%', '--r': g.r + 'deg', '--d': g.d }">
        <img :src="g.src" :alt="''" loading="lazy" decoding="async">
        <figcaption class="w-mono">{{ g.cap }}</figcaption>
      </figure>
    </div>

    <div class="wa__body">
      <span class="w-mono wa__eyebrow">01 — About</span>

      <p class="w-prose wa__lead">
        I work with teams who need training people will actually finish — and I
        build the tools that make it, when the tools don't already exist.
      </p>

      <p class="w-prose wa__run">
        I studied hotel management in Chennai, started on the hotel floor, moved
        into L&amp;D at Club Mahindra, drew a comic about guest service that
        changed my mind about everything, ran certification programs at
        <em>Courtyard by Marriott</em>, got certified as an instructional
        designer, started building the tools I couldn't find, shipped
        <NuxtLink to="/tools">four of them</NuxtLink>, and now turn operational
        detail into e-learning for teams around the world at Concentrix — and I
        still learn something new every single build.
      </p>

      <dl class="wa__cred">
        <div v-for="(c, i) in CREDENTIALS" :key="i" class="wa__cred-row">
          <dt class="w-mono">{{ c[0] }}</dt>
          <dd class="w-mono">{{ c[1] }}</dd>
        </div>
      </dl>

      <NuxtLink to="/about" class="wa__more w-mono">
        The longer story <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.wa {
  position: relative;
  z-index: 3;
  padding: var(--w-gap-section) var(--w-edge);
  overflow: hidden;
}

.wa__body {
  position: relative;
  z-index: 2;
  max-width: var(--w-measure);
  margin: 0 auto;
}

.wa__eyebrow { display: block; color: var(--w-ink-35); margin-bottom: 34rem; }

.wa__lead {
  margin: 0;
  font-size: var(--w-lead);
  color: var(--w-ink);
}

.wa__run {
  margin: 40rem 0 0;
  font-size: var(--w-body);
  line-height: 1.62;
  color: var(--w-ink-55);
}
.wa__run em { font-style: italic; color: var(--w-ink); }
.wa__run a {
  color: var(--w-ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wa__run a:hover { background: var(--w-accent); color: var(--w-on-accent); text-decoration-color: transparent; }

/* The credentials slab. Hairline-ruled rows, two columns, no decoration — the
   form carries the authority, so the copy doesn't have to strain for it. */
.wa__cred { margin: 56rem 0 0; border-top: 1px solid var(--w-rule); }
.wa__cred-row {
  display: grid;
  grid-template-columns: 8rem 1fr;
  grid-template-columns: minmax(88rem, 22%) 1fr;
  gap: 16rem;
  padding: 13rem 0;
  border-bottom: 1px solid var(--w-rule);
}
.wa__cred dt { margin: 0; color: var(--w-ink-35); }
.wa__cred dd { margin: 0; color: var(--w-ink); text-transform: none; letter-spacing: 0.02em; }

.wa__more {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  margin-top: 40rem;
  padding: 12rem 18rem;
  border: 1px solid var(--w-rule);
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease), border-color 0.3s var(--w-ease);
}
.wa__more:hover { background: var(--w-accent); border-color: var(--w-accent); color: var(--w-on-accent); }
.wa__more span { transition: transform 0.3s var(--w-ease); }
.wa__more:hover span { transform: translateX(4rem); }

/* ── The scatter ────────────────────────────────────────────────────────
   Absolutely placed, drifting on the section's `--p`. `--d` is each plate's
   depth: bigger drifts further, which is the entire parallax. */
.wa__scatter { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.wa__plate {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w);
  margin: 0;
  rotate: var(--r);
  translate: 0 calc((var(--p, 0.5) - 0.5) * var(--d) * -220rem);
  will-change: translate;
}
.wa__plate img {
  display: block;
  width: 100%;
  height: auto;
  filter: grayscale(1) contrast(1.06);
  opacity: 0.4;
}
.wa__plate figcaption {
  margin-top: 7rem;
  font-size: var(--w-micro);
  line-height: 1.4;
  color: var(--w-ink-35);
  text-transform: none;
  letter-spacing: 0.04em;
}

/* Below the point where the measure and the scatter start colliding, the
   photographs lose. They are atmosphere; the copy is the section. */
@media (max-width: 1100px) {
  .wa__scatter { display: none; }
}
@media (max-width: 560px) {
  .wa__cred-row { grid-template-columns: 1fr; gap: 3rem; padding: 12rem 0; }
}

@media (prefers-reduced-motion: reduce) {
  .wa__plate { translate: none; }
}
</style>
