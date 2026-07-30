<script setup lang="ts">
// About — the career told as a stack of sheets, exactly like the home page:
// an intro card, then the five real stops (hotel floor → SEWA Chronicles →
// Courtyard by Marriott → the tools → Concentrix), flicked through rather
// than scrolled past. Same Concept as home (`press`), same engine — the
// point of building About this way is that it reads as the identical
// material, not a look-alike.
import concept from '~/experience/lab/concepts/press'
import type { NavItem } from '~/types/nav'

definePageMeta({ layout: false })
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'Naveen Jose — a certified instructional designer who designs learning, builds the tools to deliver it, and keeps daring to try new tech.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'A certified instructional designer who designs, builds, and dares to try new tech.',
  ogUrl: 'https://entertrainer.in/about'
})

const STORY: NavItem[] = [
  { id: 'intro', color: '#243F6A', meta: 'Story',
    label: 'Naveen Jose',
    description: 'A certified instructional designer who designs learning, builds the tools to deliver it, and keeps daring to try new tech.',
    href: '/about', img: '/naveen.jpeg' },
  { id: 'ch-01', color: '#243F6A', meta: 'Where it began',
    label: 'It started in hospitality',
    description: 'I studied hotel management in Chennai and began on the floor. Hospitality is where I learned to notice the small things that make service feel human — the details nobody asks for but everybody remembers.',
    href: '/about', img: '/about/about-housekeeper-1.webp' },
  { id: 'ch-02', color: '#243F6A', meta: 'The turn',
    label: 'A comic, and a new path',
    description: 'At Club Mahindra I moved into learning and development, and drew The SEWA Chronicles — a small comic of real guest-experience stories. That was the moment design stopped being a side interest and became the plan.',
    href: '/about', img: '/about/about-sewa-1.webp' },
  { id: 'ch-03', color: '#243F6A', meta: 'The craft',
    label: 'Learning the craft',
    description: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams — frontline associates through to managers. I learned how a good program actually holds together.',
    href: '/about', img: '/about/about-onboarding.webp' },
  { id: 'ch-04', color: '#243F6A', meta: 'The tools',
    label: 'I design, and I build',
    description: 'I build training in Articulate Storyline — but I also ship the tools around it. StoryGen, EasyMCQ, Cadence, Draftly, this very site: designed and built by me, because the idea deserved to exist.',
    href: '/about', img: '/about/about-ignite.webp' },
  { id: 'ch-05', color: '#243F6A', meta: 'Now',
    label: 'Designing, building, daring',
    description: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world — and still daring to try new tech whenever it makes the learning land better.',
    href: '/about', img: '/about/about-concentrix.webp' }
]

// Nowhere to navigate to — this is the one page these cards live on. Select
// is a deliberate no-op; the flick itself is the point, not a doorway.
function onSelect() {}

const CREDENTIALS: Array<[string, string]> = [
  ['Certified', 'Instructional Design Specialist'],
  ['Now', 'Concentrix — Training-as-a-Service'],
  ['Before', 'Courtyard by Marriott — L&D Specialist'],
  ['Before', 'Club Mahindra — L&D, The SEWA Chronicles'],
  ['Started', 'Hotel management, Chennai'],
  ['Shipped', 'Four web apps, and this site'],
  ['Tools', 'Storyline · Nuxt · Three.js']
]
</script>

<template>
  <div class="press-page ab">
    <PressMast section="About" />

    <div class="ab-stage">
      <LabSpatialStage :concept="concept" :items="STORY" @select="onSelect" />
    </div>

    <article class="ab-inner">
      <section class="ab-cred">
        <p class="press-label">Credentials</p>
        <dl class="press-table ab-cred__table">
          <div v-for="(c, i) in CREDENTIALS" :key="i" class="press-row">
            <dt>{{ c[0] }}</dt>
            <dd>{{ c[1] }}</dd>
          </div>
        </dl>
      </section>

      <footer class="ab-close">
        <p class="ab-close__quote">Asatoma Sadgamaya &mdash; from ignorance, toward truth.</p>
        <div class="ab-close__cta">
          <NuxtLink to="/my-work" class="press-btn">See my work</NuxtLink>
          <NuxtLink to="/tools" class="press-btn press-btn--solid">The web apps I built</NuxtLink>
        </div>
      </footer>
    </article>

    <PressFoot />
  </div>
</template>

<style scoped>
/* The story, flicked through rather than scrolled — same stage treatment as
   home, sized to sit between the mast and the static reference sections
   below rather than fill the rest of the viewport (there's real content
   after it that has to stay reachable by an ordinary scroll). */
.ab-stage {
  position: relative;
  height: clamp(560px, 82vh, 860px);
  overflow: hidden;
  background: #dedbd2;
}

.ab-inner { max-width: var(--press-col-feature); margin: 0 auto; padding: var(--press-pad-top) var(--press-edge) var(--press-pad-bottom); }

.ab-cred { padding-top: clamp(28px, 4vw, 40px); border-top: 2px solid var(--press-rule-strong); }
.ab-cred__table { margin-top: 18px; }

.ab-close { margin-top: clamp(56px, 8vw, 84px); padding-top: clamp(28px, 4vw, 40px); border-top: 1px solid var(--press-rule); text-align: center; }
.ab-close__quote { font-family: var(--press-serif); font-style: italic; font-size: var(--press-lead); color: var(--press-ink-80); margin: 0; }
.ab-close__cta { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 24px; }
</style>
