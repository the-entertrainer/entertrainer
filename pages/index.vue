<script setup lang="ts">
useSeoMeta({
  title: 'Entertrainer · Elevate, Empower, Educate',
  description: 'Stories for the questions that keep returning, tools for the work that keeps repeating, and courses for the things nobody explained properly the first time.',
  ogTitle: 'Entertrainer · The Three Es',
  ogDescription: 'Elevate, Empower, Educate.',
  ogUrl: 'https://entertrainer.in/'
})

const pillars = [
  { no: '01', name: 'Elevate', subtitle: 'The Entertrainer Blogs', body: 'Evidence-led stories about minds, machines, and the ordinary things that become suspiciously interesting when you look at them for too long.', href: '/elevate', hue: 'blog' },
  { no: '02', name: 'Empower', subtitle: 'Utility apps', body: 'Small tools for writing, planning, quizzes, and catching an idea before it evaporates into the “I will remember later” folder.', href: '/empower', hue: 'tools' },
  { no: '03', name: 'Educate', subtitle: 'Courses and lessons', body: 'Interactive learning for difficult ideas that deserve more than a rushed explanation and a slide full of arrows.', href: '/educate', hue: 'learn' }
]
</script>

<template>
  <main id="main" class="three-es">
    <header class="three-es__hero">
      <p class="three-es__eyebrow">Entertrainer</p>
      <h1>Three ways to make a day less confusing.</h1>
      <p>Some questions need a proper look. Some tasks need a small tool. Some difficult ideas just need to be explained without making a dramatic scene out of the fact that they were difficult.</p>
      <div class="three-es__hero-mark" aria-hidden="true"><EdWordmark variant="mark" :size="116" /></div>
    </header>

    <section class="three-es__pillars" aria-label="The Three Es">
      <p class="three-es__section-label">The Three Es</p>
      <ol>
        <li v-for="pillar in pillars" :key="pillar.name" :class="`three-es__pillar three-es__pillar--${pillar.hue}`">
          <NuxtLink :to="pillar.href">
            <span class="three-es__number">{{ pillar.no }}</span>
            <span class="three-es__subtitle">{{ pillar.subtitle }}</span>
            <h2>{{ pillar.name }}</h2>
            <p>{{ pillar.body }}</p>
            <strong>Open {{ pillar.name }} <i aria-hidden="true">↗</i></strong>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <section class="three-es__lower">
      <NuxtLink to="/games" class="three-es__games"><span>Games</span><strong>Small playable ideas are on the way. Useful things are allowed to be fun.</strong><i aria-hidden="true">↗</i></NuxtLink>
      <NuxtLink to="/about" class="three-es__about"><span>About Me</span><strong>From hotel floors to learning design, including the SEWA Chronicles.</strong><i aria-hidden="true">↗</i></NuxtLink>
    </section>
  </main>
</template>

<style scoped>
/* Three Es home: stacked editorial hierarchy, yellow compact-mark gravity, varied card spans, and no generic centred dashboard grid. */
.three-es { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(42rem, 8vw, 118rem) var(--shell-gutter) 110rem; }.three-es__hero { position: relative; min-height: min(560rem, calc(100dvh - 150rem)); max-width: 1050rem; }.three-es__eyebrow, .three-es__section-label, .three-es__pillar span, .three-es__lower span { margin: 0; font: 700 11rem/1.2 var(--font-mono); letter-spacing: .09em; text-transform: uppercase; }.three-es__eyebrow, .three-es__section-label { color: var(--signal-cobalt); }.three-es h1 { max-width: 920rem; margin: 18rem 0 24rem; font: 500 clamp(62rem, 9vw, 145rem)/.82 var(--font-display); letter-spacing: -.075em; }.three-es__hero > p:last-of-type { max-width: 560rem; margin: 0; font-size: clamp(19rem, 2.1vw, 26rem); line-height: 1.45; }.three-es__hero-mark { position: absolute; right: 3%; bottom: 10%; display: grid; width: clamp(130rem, 18vw, 230rem); aspect-ratio: 1; place-items: center; border: var(--stroke) solid var(--ink); border-radius: 50%; background: var(--signal-field); box-shadow: 12rem 12rem 0 var(--ink); }.three-es__pillars { padding-top: clamp(38rem, 7vw, 90rem); }.three-es__pillars ol { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: clamp(14rem, 2.4vw, 30rem); margin: 18rem 0 0; padding: 0; list-style: none; }.three-es__pillar { min-height: 405rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); overflow: hidden; }.three-es__pillar:nth-child(1) { grid-column: span 6; }.three-es__pillar:nth-child(2) { grid-column: span 3; }.three-es__pillar:nth-child(3) { grid-column: span 3; }.three-es__pillar a { position: relative; display: flex; min-height: 100%; flex-direction: column; align-items: flex-start; padding: clamp(24rem, 3vw, 42rem); color: var(--ink); overflow: hidden; }.three-es__pillar a::after { content: ''; position: absolute; width: 220rem; aspect-ratio: 1; right: -75rem; bottom: -94rem; border: 38rem solid color-mix(in srgb, var(--signal-cobalt) 46%, transparent); border-radius: 50%; }.three-es__pillar--tools a::after { border-radius: var(--radius-l); transform: rotate(18deg); }.three-es__pillar--learn a::after { width: 180rem; height: 280rem; border-radius: 90rem 90rem 0 0; }.three-es__number, .three-es__subtitle { position: relative; z-index: 1; }.three-es__number { color: var(--signal-cobalt); }.three-es__subtitle { margin-top: auto; color: var(--ink-soft); }.three-es h2 { position: relative; z-index: 1; margin: 8rem 0 12rem; font: 500 clamp(43rem, 5.5vw, 78rem)/.86 var(--font-display); letter-spacing: -.06em; }.three-es__pillar p { position: relative; z-index: 1; max-width: 34ch; margin: 0; line-height: 1.48; }.three-es__pillar strong { position: relative; z-index: 1; margin-top: 22rem; font-size: 14rem; }.three-es__pillar i, .three-es__lower i { color: var(--signal-cobalt); font-style: normal; }.three-es__lower { display: grid; grid-template-columns: 1fr .68fr; gap: clamp(15rem, 2.4vw, 30rem); padding-top: clamp(28rem, 5vw, 64rem); }.three-es__lower a { display: grid; grid-template-columns: 1fr auto; min-height: 190rem; align-content: space-between; padding: 24rem; color: var(--ink); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }.three-es__lower strong { grid-column: 1; max-width: 21ch; font: 500 clamp(27rem, 3vw, 42rem)/1 var(--font-display); letter-spacing: -.04em; }.three-es__lower i { grid-column: 2; grid-row: 1 / span 2; align-self: end; font-size: 25rem; } @media (hover:hover) { .three-es__pillar a:hover, .three-es__lower a:hover { background: var(--signal-field); transform: translateY(-3rem); } }.three-es__pillar a, .three-es__lower a { transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out); }.three-es__pillar a:focus-visible, .three-es__lower a:focus-visible { outline: 3rem solid var(--focus); outline-offset: 4rem; } @media (max-width:800px) { .three-es__hero { min-height: 510rem; }.three-es__hero-mark { right: 0; bottom: 0; }.three-es__pillar:nth-child(n) { grid-column: span 6; }.three-es__lower { grid-template-columns: 1fr; } } @media (max-width:560px) { .three-es { padding-top: 34rem; }.three-es h1 { font-size: clamp(56rem, 15vw, 76rem); }.three-es__hero { min-height: 570rem; }.three-es__hero-mark { width: 120rem; bottom: 18rem; }.three-es__pillar:nth-child(n) { grid-column: span 12; min-height: 300rem; }.three-es__pillars ol { gap: 13rem; } }
</style>
