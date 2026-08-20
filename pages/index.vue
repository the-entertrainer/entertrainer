<script setup lang="ts">
/**
 * Compact Route Card homepage.
 * Design reminder: orient once, offer three clear directions, then show only
 * two pieces of work. Motion is limited to the first screen and direct input.
 */
import { ITEMS } from '~/content/editorial'

useSeoMeta({
  title: 'Entertrainer — Lessons, projects, and free tools by Naveen Jose',
  description: 'Naveen Jose makes lessons, projects, and free tools that make complicated work easier to understand.',
  ogTitle: 'Entertrainer — Lessons, projects, and free tools by Naveen Jose',
  ogDescription: 'Lessons, projects, and free tools that make complicated work easier to understand.',
  ogUrl: 'https://entertrainer.in/'
})

const routes = [
  { number: '01', title: 'Lessons', body: 'Short, practical learning experiences for people who are new to the subject.', href: '/lessons', action: 'See lessons' },
  { number: '02', title: 'Projects', body: 'Courses, comics, and explainers made to solve a real communication problem.', href: '/my-work', action: 'See projects' },
  { number: '03', title: 'Free tools', body: 'Small browser tools for planning, writing, quiz-making, and clearer work.', href: '/tools', action: 'Use a tool' }
]

const selectedWork = computed(() => ITEMS.filter(item => ['ai-atlas', 'sewa-chronicles'].includes(item.id)))
const worldRouteArt = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/YghNlEEMeBajZWCz.jpg'
</script>

<template>
  <EdShell width="wide">
    <header class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__copy">
        <p class="home-hero__kicker t-mono">Entertrainer · Naveen Jose</p>
        <h1 id="home-title" class="home-hero__title t-display">I make complicated work easier to understand.</h1>
        <p class="home-hero__deck">I make lessons, projects, and small tools for people who need a clearer way into difficult work.</p>
        <div class="home-hero__actions"><NuxtLink to="/instructional-design" class="ticket">Start a short lesson <span aria-hidden="true">→</span></NuxtLink><NuxtLink to="/my-work" class="home-hero__secondary u-underline">Browse my work</NuxtLink></div>
      </div>
      <figure class="home-hero__map" aria-label="A route through the work">
        <img :src="worldRouteArt" alt="Abstract world field with a blue route line converging on one point" loading="eager" decoding="async" />
        <span class="map-tiles" aria-hidden="true"><i class="map-tile map-tile--one" /><i class="map-tile map-tile--two" /><i class="map-tile map-tile--three" /></span>
        <figcaption class="home-hero__map-label t-mono">Choose a place to begin</figcaption>
      </figure>
    </header>

    <section class="directions" aria-labelledby="directions-title">
      <div class="section-head"><p class="section-head__label t-mono">Choose a direction</p><h2 id="directions-title" class="section-head__title t-display">Start here.</h2></div>
      <ul class="route-list"><li v-for="route in routes" :key="route.title"><NuxtLink :to="route.href" class="route-list__item"><span class="route-list__number t-mono">{{ route.number }}</span><span class="route-list__title t-display">{{ route.title }}</span><span class="route-list__body">{{ route.body }}</span><span class="route-list__action">{{ route.action }} <b aria-hidden="true">→</b></span></NuxtLink></li></ul>
    </section>

    <section class="selected" aria-labelledby="selected-title">
      <div class="section-head section-head--split"><div><p class="section-head__label t-mono">A few things I made</p><h2 id="selected-title" class="section-head__title t-display">Selected work</h2></div><NuxtLink to="/my-work" class="section-head__link u-underline">See all projects</NuxtLink></div>
      <ul class="work-list"><li v-for="item in selectedWork" :key="item.id"><NuxtLink :to="item.href" class="work-list__item"><span class="work-list__meta t-mono">{{ item.stamp }}</span><span class="work-list__title t-display">{{ item.title }}</span><span class="work-list__dek">{{ item.dek }}</span><span class="work-list__action" aria-hidden="true">↗</span></NuxtLink></li></ul>
    </section>
  </EdShell>
</template>

<style scoped>
/* Compact Route Card: one visual map, three routes, two works. All spacing and motion reduce the page’s vertical sprawl. */
.home-hero { display: grid; grid-template-columns: minmax(0, .94fr) minmax(340rem, .76fr); align-items: center; gap: clamp(34rem, 7vw, 104rem); min-height: min(650rem, calc(100dvh - 83rem)); padding: clamp(62rem, 8vw, 112rem) 0 clamp(64rem, 8vw, 104rem); border-bottom: var(--stroke) solid var(--line); }.home-hero__copy { max-width: 620rem; }.home-hero__kicker, .section-head__label { margin: 0; color: var(--muted); font-size: 11rem; letter-spacing: .11em; text-transform: uppercase; }.home-hero__kicker { animation: hero-kicker 460ms var(--ease-out) both; }.home-hero__title { max-width: 9ch; margin: 16rem 0 20rem; font-size: clamp(52rem, 6.6vw, 102rem); line-height: .91; letter-spacing: -.025em; animation: hero-title 760ms var(--ease-expo-out) 80ms both; }.home-hero__deck { max-width: 43ch; margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.5vw, 21rem); line-height: 1.55; animation: hero-copy 560ms var(--ease-out) 180ms both; }.home-hero__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 20rem; margin-top: 30rem; animation: hero-copy 560ms var(--ease-out) 260ms both; }.home-hero__secondary { color: var(--ink); font-size: 15rem; font-weight: 700; }.home-hero__map { position: relative; margin: 0; overflow: hidden; aspect-ratio: 4 / 5; max-height: 490rem; border: var(--stroke) solid var(--line); background: var(--paper-2); animation: map-arrive 760ms var(--ease-expo-out) 140ms both; }.home-hero__map img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-out); }.home-hero__map-label { position: absolute; right: 12rem; bottom: 12rem; margin: 0; padding: 7rem 9rem; background: color-mix(in srgb, var(--paper) 90%, transparent); color: var(--ink); font-size: 10rem; letter-spacing: .07em; }.map-tiles { position: absolute; inset: 0; pointer-events: none; }.map-tile { position: absolute; display: block; width: clamp(20rem, 3vw, 36rem); aspect-ratio: 1; border: var(--stroke) solid var(--ink); background: var(--violet); box-shadow: 4rem 4rem 0 color-mix(in srgb, var(--paper) 70%, transparent); animation: tile-drift-a 8s var(--ease-in-out) infinite alternate; }.map-tile--one { top: 12%; left: 12%; }.map-tile--two { right: 12%; bottom: 20%; background: var(--blue); animation-name: tile-drift-b; animation-delay: -3s; }.map-tile--three { top: 43%; right: 23%; width: clamp(14rem, 2vw, 24rem); background: var(--paper); animation-name: tile-drift-c; animation-delay: -4.5s; }
.directions, .selected { padding: clamp(56rem, 7vw, 94rem) 0; border-bottom: var(--stroke) solid var(--line); }.section-head { display: flex; align-items: end; justify-content: space-between; gap: 24rem; margin-bottom: 28rem; }.section-head__title { margin: 10rem 0 0; font-size: clamp(40rem, 4.4vw, 64rem); line-height: .95; }.section-head__link { color: var(--ink); font-size: 15rem; font-weight: 700; white-space: nowrap; }.route-list, .work-list { list-style: none; margin: 0; padding: 0; border-top: var(--stroke) solid var(--line); }.route-list__item { display: grid; grid-template-columns: 58rem minmax(145rem, .7fr) minmax(0, 1.3fr) auto; align-items: center; gap: 22rem; padding: 22rem 0; color: var(--ink); border-bottom: var(--stroke) solid var(--line); transition: padding var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }.route-list__number, .work-list__meta { color: var(--muted); font-size: 11rem; letter-spacing: .08em; }.route-list__title { font-size: clamp(28rem, 2.7vw, 40rem); line-height: 1; }.route-list__body, .work-list__dek { max-width: 48ch; color: var(--muted); font-family: var(--font-reading); line-height: 1.5; }.route-list__action { font-size: 14rem; font-weight: 750; white-space: nowrap; }.route-list__action b { color: var(--blue); transition: transform var(--dur-fast) var(--ease-out); display: inline-block; }.work-list__item { display: grid; grid-template-columns: 160rem minmax(180rem, .85fr) minmax(0, 1.25fr) 26rem; align-items: center; gap: 24rem; padding: 28rem 0; color: var(--ink); border-bottom: var(--stroke) solid var(--line); transition: padding var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }.work-list__title { font-size: clamp(28rem, 3vw, 44rem); line-height: .98; }.work-list__action { color: var(--blue); font-size: 24rem; transition: transform var(--dur-fast) var(--ease-out); }@media (hover: hover) { .home-hero__map:hover img { transform: scale(1.025); }.route-list__item:hover, .work-list__item:hover { padding-left: 9rem; color: var(--blue); }.route-list__item:hover b, .work-list__item:hover .work-list__action { transform: translate3d(4rem, -2rem, 0); } }
@keyframes hero-kicker { from { opacity: 0; transform: translateX(-8rem); } to { opacity: 1; transform: none; } } @keyframes hero-title { from { opacity: 0; transform: translateY(18rem); } to { opacity: 1; transform: none; } } @keyframes hero-copy { from { opacity: 0; transform: translateY(12rem); } to { opacity: 1; transform: none; } } @keyframes map-arrive { from { opacity: 0; transform: translateY(18rem) scale(.98); } to { opacity: 1; transform: none; } } @keyframes tile-drift-a { from { transform: translate3d(-4rem, 5rem, 0) rotate(-5deg); } to { transform: translate3d(5rem, -4rem, 0) rotate(-1deg); } } @keyframes tile-drift-b { from { transform: translate3d(4rem, -4rem, 0) rotate(5deg); } to { transform: translate3d(-5rem, 5rem, 0) rotate(9deg); } } @keyframes tile-drift-c { from { transform: translate3d(3rem, 4rem, 0) rotate(4deg); } to { transform: translate3d(-4rem, -5rem, 0) rotate(-2deg); } }
@media (max-width: 820px) { .home-hero { grid-template-columns: minmax(0, 1fr); min-height: auto; gap: 38rem; }.home-hero__title { max-width: 10ch; }.home-hero__map { width: min(100%, 620rem); aspect-ratio: 16 / 10; max-height: none; }.route-list__item { grid-template-columns: 42rem minmax(130rem, .7fr) minmax(0, 1.3fr); }.route-list__action { grid-column: 2 / -1; }.work-list__item { grid-template-columns: minmax(150rem, .8fr) minmax(0, 1.2fr) 24rem; }.work-list__meta { grid-column: 1 / -1; } }
@media (max-width: 560px) { .home-hero { padding-top: 48rem; padding-bottom: 60rem; }.home-hero__title { font-size: clamp(48rem, 14vw, 66rem); }.home-hero__actions { gap: 16rem; }.directions, .selected { padding: 52rem 0; }.section-head { align-items: flex-start; flex-direction: column; gap: 14rem; }.route-list__item, .work-list__item { grid-template-columns: minmax(0, 1fr) auto; gap: 12rem 16rem; padding: 22rem 0; }.route-list__number, .work-list__meta { grid-column: 1 / -1; }.route-list__body, .work-list__dek { grid-column: 1 / -1; }.route-list__action { grid-column: 1 / -1; }.work-list__title { font-size: 31rem; }.work-list__action { grid-column: 2; grid-row: 2; }.map-tile--three { display: none; } }
@media (prefers-reduced-motion: reduce) { .home-hero__kicker, .home-hero__title, .home-hero__deck, .home-hero__actions, .home-hero__map, .map-tile { animation: none; }.home-hero__map img, .route-list__item, .work-list__item, .route-list__action b, .work-list__action { transition: none; } }
</style>
