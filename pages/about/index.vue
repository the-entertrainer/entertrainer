<script setup lang="ts">
// About — a broadsheet feature article. Same five stops as before (hotel
// floor → SEWA Chronicles → Courtyard by Marriott → the tools → Concentrix),
// now read top to bottom as a real article rather than dragged through as a
// deck — a feature about a career told once, in order, is better served by
// the reading rhythm a real magazine profile uses than by a swipeable stage.
definePageMeta({ layout: false })
useSeoMeta({
  title: 'About — Naveen Jose · Entertrainer',
  description: 'Naveen Jose — a certified instructional designer who designs learning, builds the tools to deliver it, and keeps daring to try new tech.',
  ogTitle: 'About — Naveen Jose',
  ogDescription: 'A certified instructional designer who designs, builds, and dares to try new tech.',
  ogUrl: 'https://entertrainer.in/about'
})

const R = useReveal()

interface Chapter { n: string; eyebrow: string; head: string; body: string; img: string; alt: string; place: string }
const CHAPTERS: Chapter[] = [
  { n: '01', eyebrow: 'Where it began', head: 'It started in hospitality',
    body: 'I studied hotel management in Chennai and began on the floor. Hospitality is where I learned to notice the small things that make service feel human — the details nobody asks for but everybody remembers.',
    img: '/about/about-housekeeper-1.webp', alt: 'On the hotel floor in the early hospitality years', place: 'Chennai · Hotel management' },
  { n: '02', eyebrow: 'The turn', head: 'A comic, and a new path',
    body: 'At Club Mahindra I moved into learning and development, and drew The SEWA Chronicles — a small comic of real guest-experience stories. That was the moment design stopped being a side interest and became the plan.',
    img: '/about/about-sewa-1.webp', alt: 'A page from The SEWA Chronicles comic', place: 'Club Mahindra · L&D' },
  { n: '03', eyebrow: 'The craft', head: 'Learning the craft',
    body: 'As an L&D specialist at Courtyard by Marriott, I helped run certification programs for teams — frontline associates through to managers. I learned how a good program actually holds together.',
    img: '/about/about-onboarding.webp', alt: 'Running a training session at Courtyard by Marriott', place: 'Courtyard by Marriott' },
  { n: '04', eyebrow: 'The tools', head: 'I design, and I build',
    body: 'I build training in Articulate Storyline — but I also ship the tools around it. StoryGen, EasyMCQ, Cadence, Draftly, this very site: designed and built by me, because the idea deserved to exist.',
    img: '/about/about-ignite.webp', alt: 'A module in progress on the workbench', place: 'The workbench' },
  { n: '05', eyebrow: 'Now', head: 'Designing, building, daring',
    body: 'I’m with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams around the world — and still daring to try new tech (a little motion, some WebGL, a bit of AI) whenever it makes the learning land better.',
    img: '/about/about-concentrix.webp', alt: 'Portrait, present day, at Concentrix', place: 'Concentrix · Training-as-a-Service' }
]

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

    <article class="ab-inner">
      <header class="ab-hero">
        <p class="press-label" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">About &middot; A short story</p>
        <h1 class="ab-hero__h1" v-motion :initial="R.rise(90).initial" :visible-once="R.rise(90).visibleOnce">Naveen Jose</h1>
        <p class="press-dropcap ab-hero__lead" v-motion :initial="R.rise(180).initial" :visible-once="R.rise(180).visibleOnce">
          A certified instructional designer who <em>designs</em> learning, <em>builds</em> the tools
          to deliver it, and keeps <em>daring</em> to try new tech.
        </p>
        <p class="ab-hero__meta" v-motion :initial="R.rise(240).initial" :visible-once="R.rise(240).visibleOnce">
          Instructional Designer &middot; Gurugram, IN
        </p>
      </header>

      <section class="ab-chapters">
        <article v-for="(c, i) in CHAPTERS" :key="c.n" class="ab-ch" :class="{ 'ab-ch--flip': i % 2 === 1 }"
                  v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">
          <PressHalftone :src="c.img" :alt="c.alt" ratio="4/5" class="ab-ch__art" />
          <div class="ab-ch__body">
            <p class="press-label"><em>{{ c.n }}</em> &mdash; {{ c.eyebrow }}</p>
            <h2 class="ab-ch__head">{{ c.head }}</h2>
            <p class="ab-ch__text">{{ c.body }}</p>
            <p class="ab-ch__place">{{ c.place }}</p>
          </div>
        </article>
      </section>

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
.ab-inner { max-width: 860px; margin: 0 auto; padding: clamp(40px, 6vw, 72px) var(--press-edge) clamp(64px, 8vw, 96px); }

.ab-hero { padding-bottom: clamp(32px, 5vw, 48px); border-bottom: 1px solid var(--press-rule); }
.ab-hero__h1 { margin: 14px 0 0; font-family: var(--press-serif); font-weight: 400; font-size: var(--press-display); line-height: 0.94; }
.ab-hero__lead { margin: 26px 0 0; font-size: var(--press-lead); line-height: 1.4; max-width: 42ch; }
.ab-hero__lead em { font-style: italic; }
.ab-hero__meta { margin-top: 18px; font-family: var(--press-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--press-ink-62); }

.ab-chapters { display: flex; flex-direction: column; gap: clamp(48px, 7vw, 76px); margin-top: clamp(48px, 7vw, 76px); }
.ab-ch { display: grid; grid-template-columns: 280px 1fr; gap: clamp(24px, 4vw, 44px); align-items: start; }
.ab-ch--flip { grid-template-columns: 1fr 280px; }
.ab-ch--flip .ab-ch__art { order: 2; }
.ab-ch__art { border: 1px solid var(--press-rule); }
.ab-ch__head { margin: 10px 0 0; font-family: var(--press-sans); font-weight: 800; font-size: var(--press-h2); line-height: 1.05; letter-spacing: -0.015em; }
.ab-ch__text { margin: 16px 0 0; font-family: var(--press-serif); font-size: var(--press-body); line-height: 1.68; color: var(--press-ink-80); max-width: 52ch; }
.ab-ch__place { margin-top: 12px; font-family: var(--press-mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--press-ink-42); }

.ab-cred { margin-top: clamp(56px, 8vw, 84px); padding-top: clamp(28px, 4vw, 40px); border-top: 2px solid var(--press-ink); }
.ab-cred__table { margin-top: 18px; }

.ab-close { margin-top: clamp(56px, 8vw, 84px); padding-top: clamp(28px, 4vw, 40px); border-top: 1px solid var(--press-rule); text-align: center; }
.ab-close__quote { font-family: var(--press-serif); font-style: italic; font-size: 18px; color: var(--press-ink-80); margin: 0; }
.ab-close__cta { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 24px; }

@media (max-width: 700px) {
  .ab-ch, .ab-ch--flip { grid-template-columns: 1fr; }
  .ab-ch--flip .ab-ch__art { order: 0; }
  .ab-ch__art { max-width: 320px; }
}
</style>
