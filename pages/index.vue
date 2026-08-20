<script setup lang="ts">
/**
 * Paper Signal homepage.
 * Design reminder: the homepage is a concise chooser—one statement, three
 * directions, and two proof points. Every non-brand visual uses Paper Signal.
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
  { number: '01', title: 'Lessons', body: 'Short, practical learning experiences for people who are new to the subject.', href: '/lessons', action: 'See lessons', visual: 'lesson' },
  { number: '02', title: 'Projects', body: 'Courses, comics, and explainers made to solve a real communication problem.', href: '/my-work', action: 'See projects', visual: 'project' },
  { number: '03', title: 'Free tools', body: 'Small browser tools for planning, writing, quiz-making, and clearer work.', href: '/tools', action: 'Use a tool', visual: 'tool' }
] as const

const selectedWork = computed(() => ITEMS.filter(item => ['ai-atlas', 'sewa-chronicles'].includes(item.id)))
const workVisual: Record<string, 'process' | 'evidence'> = { 'ai-atlas': 'process', 'sewa-chronicles': 'evidence' }
</script>

<template>
  <EdShell width="wide">
    <header class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__copy">
        <p class="home-hero__kicker t-mono">Entertrainer · Naveen Jose</p>
        <h1 id="home-title" class="home-hero__title t-display">I make complicated work easier to understand.</h1>
        <p class="home-hero__deck">I make lessons, projects, and small tools for people who need a clearer way into difficult work.</p>
        <div class="home-hero__actions">
          <NuxtLink to="/instructional-design" class="ticket">Start a short lesson <EdSignalIcon name="arrow" /></NuxtLink>
          <NuxtLink to="/my-work" class="home-hero__secondary u-underline">Browse my work</NuxtLink>
        </div>
      </div>
      <EdPaperSignal class="home-hero__art" variant="route" label="A Paper Signal route card with three black rules and a cobalt route signal" />
    </header>

    <section class="directions" aria-labelledby="directions-title">
      <div class="section-head"><p class="section-head__label t-mono">Choose a direction</p><h2 id="directions-title" class="section-head__title t-display">Start here.</h2></div>
      <ul class="route-list">
        <li v-for="route in routes" :key="route.title">
          <NuxtLink :to="route.href" class="route-list__item">
            <span class="route-list__number t-mono">{{ route.number }}</span>
            <span class="route-list__marker" aria-hidden="true" />
            <span class="route-list__title t-display">{{ route.title }}</span>
            <span class="route-list__body">{{ route.body }}</span>
            <span class="route-list__action">{{ route.action }} <EdSignalIcon name="arrow" /></span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="selected" aria-labelledby="selected-title">
      <div class="section-head section-head--split"><div><p class="section-head__label t-mono">A few things I made</p><h2 id="selected-title" class="section-head__title t-display">Selected work</h2></div><NuxtLink to="/my-work" class="section-head__link u-underline">See all projects</NuxtLink></div>
      <ul class="work-list">
        <li v-for="item in selectedWork" :key="item.id">
          <NuxtLink :to="item.href" class="work-list__item">
            <EdPaperSignal class="work-list__art" :variant="workVisual[item.id]" label="" />
            <span class="work-list__meta t-mono">{{ item.stamp }}</span>
            <span class="work-list__title t-display">{{ item.title }}</span>
            <span class="work-list__dek">{{ item.dek }}</span>
            <EdSignalIcon class="work-list__action" name="external" />
          </NuxtLink>
        </li>
      </ul>
    </section>
  </EdShell>
</template>

<style scoped>
/* Paper Signal homepage: a pale field, white panels, black rules, one cobalt cue, and no decorative raster art. */
.home-hero { display: grid; grid-template-columns: minmax(0, .94fr) minmax(320rem, .7fr); align-items: center; gap: clamp(36rem, 8vw, 126rem); min-height: min(610rem, calc(100dvh - 83rem)); padding: clamp(58rem, 8vw, 108rem) 0 clamp(64rem, 8vw, 102rem); border-bottom: var(--stroke) solid var(--line); }.home-hero__copy { max-width: 620rem; }.home-hero__kicker, .section-head__label { margin: 0; color: var(--muted); font-size: 11rem; letter-spacing: .11em; text-transform: uppercase; }.home-hero__kicker { animation: hero-kicker 420ms var(--ease-out) both; }.home-hero__title { max-width: 9ch; margin: 16rem 0 20rem; font-size: clamp(52rem, 6.5vw, 100rem); line-height: .91; letter-spacing: -.025em; animation: hero-title 680ms var(--ease-expo-out) 70ms both; }.home-hero__deck { max-width: 43ch; margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.5vw, 21rem); line-height: 1.55; animation: hero-copy 520ms var(--ease-out) 160ms both; }.home-hero__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 20rem; margin-top: 30rem; animation: hero-copy 520ms var(--ease-out) 240ms both; }.ticket :deep(.ps-icon) { margin-left: 1rem; }.home-hero__secondary { color: var(--ink); font-size: 15rem; font-weight: 700; }.home-hero__art { aspect-ratio: 5 / 4; min-height: 0; max-height: 410rem; border: 0; animation: art-arrive 680ms var(--ease-expo-out) 120ms both; }
.directions, .selected { padding: clamp(56rem, 7vw, 94rem) 0; border-bottom: var(--stroke) solid var(--line); }.section-head { display: flex; align-items: end; justify-content: space-between; gap: 24rem; margin-bottom: 28rem; }.section-head__title { margin: 10rem 0 0; font-size: clamp(40rem, 4.4vw, 64rem); line-height: .95; }.section-head__link { color: var(--ink); font-size: 15rem; font-weight: 700; white-space: nowrap; }.route-list, .work-list { list-style: none; margin: 0; padding: 0; border-top: var(--stroke) solid var(--signal-rule); }.route-list__item { display: grid; grid-template-columns: 44rem 14rem minmax(145rem, .7fr) minmax(0, 1.3fr) auto; align-items: center; gap: 18rem; padding: 22rem 0; color: var(--ink); border-bottom: var(--stroke) solid var(--line); transition: padding var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }.route-list__number, .work-list__meta { color: var(--muted); font-size: 11rem; letter-spacing: .08em; }.route-list__marker { width: 10rem; height: 10rem; background: var(--signal-cobalt); border-radius: 50%; transition: transform var(--dur-fast) var(--ease-out); }.route-list__title { font-size: clamp(28rem, 2.7vw, 40rem); line-height: 1; }.route-list__body, .work-list__dek { max-width: 48ch; color: var(--muted); font-family: var(--font-reading); line-height: 1.5; }.route-list__action { display: inline-flex; align-items: center; gap: 7rem; font-size: 14rem; font-weight: 750; white-space: nowrap; }.route-list__action :deep(.ps-icon) { color: var(--signal-cobalt); transition: transform var(--dur-fast) var(--ease-out); }
.work-list__item { display: grid; grid-template-columns: 150rem 130rem minmax(170rem, .8fr) minmax(0, 1.25fr) 22rem; align-items: center; gap: 24rem; padding: 24rem 0; color: var(--ink); border-bottom: var(--stroke) solid var(--line); transition: padding var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }.work-list__art { min-height: 96rem; width: 150rem; }.work-list__art :deep(.ps-art__paper) { min-height: 56rem; padding: 10rem 12rem; box-shadow: 7rem 7rem 0 var(--signal-sheet); }.work-list__art :deep(.ps-art__rule) { left: 12rem; height: 1rem; }.work-list__art :deep(.ps-art__rule--one) { top: 18rem; }.work-list__art :deep(.ps-art__rule--two) { top: 32rem; }.work-list__art :deep(.ps-art__rule--three) { top: 46rem; }.work-list__art :deep(.ps-art__signal) { right: 12rem; bottom: 12rem; width: 17rem; height: 17rem; }.work-list__title { font-size: clamp(28rem, 3vw, 44rem); line-height: .98; }.work-list__action { color: var(--signal-cobalt); transition: transform var(--dur-fast) var(--ease-out); }
@media (hover: hover) { .route-list__item:hover, .work-list__item:hover { padding-left: 8rem; background: var(--signal-field); }.route-list__item:hover .route-list__marker { transform: translateX(4rem); }.route-list__item:hover :deep(.ps-icon), .work-list__item:hover .work-list__action { transform: translateX(4rem); } }.route-list__item:focus-visible, .work-list__item:focus-visible { outline: 2rem solid var(--focus); outline-offset: -2rem; }
@keyframes hero-kicker { from { opacity: 0; transform: translateX(-8rem); } to { opacity: 1; transform: none; } } @keyframes hero-title { from { opacity: 0; transform: translateY(16rem); } to { opacity: 1; transform: none; } } @keyframes hero-copy { from { opacity: 0; transform: translateY(10rem); } to { opacity: 1; transform: none; } } @keyframes art-arrive { from { opacity: 0; transform: translateY(14rem) scale(.98); } to { opacity: 1; transform: none; } }
@media (max-width: 820px) { .home-hero { grid-template-columns: minmax(0, 1fr); min-height: auto; gap: 38rem; }.home-hero__title { max-width: 10ch; }.home-hero__art { width: min(100%, 580rem); aspect-ratio: 16 / 10; max-height: none; }.route-list__item { grid-template-columns: 42rem 12rem minmax(130rem, .7fr) minmax(0, 1.3fr); }.route-list__action { grid-column: 3 / -1; }.work-list__item { grid-template-columns: 132rem minmax(150rem, .8fr) minmax(0, 1.2fr) 22rem; }.work-list__meta { grid-column: 2 / -1; }.work-list__art { grid-row: 1 / span 3; width: 132rem; } }
@media (max-width: 560px) { .home-hero { padding-top: 48rem; padding-bottom: 60rem; }.home-hero__title { font-size: clamp(48rem, 14vw, 66rem); }.home-hero__actions { gap: 16rem; }.directions, .selected { padding: 52rem 0; }.section-head { align-items: flex-start; flex-direction: column; gap: 14rem; }.route-list__item { grid-template-columns: 30rem 12rem minmax(0, 1fr) auto; gap: 12rem; padding: 22rem 0; }.route-list__number { grid-column: 1; }.route-list__marker { grid-column: 2; }.route-list__title { grid-column: 3; }.route-list__body, .route-list__action { grid-column: 3 / -1; }.work-list__item { grid-template-columns: 100rem minmax(0, 1fr) 20rem; gap: 12rem; padding: 20rem 0; }.work-list__art { grid-row: 1 / span 3; width: 100rem; min-height: 80rem; }.work-list__meta { grid-column: 2 / -1; }.work-list__title { grid-column: 2; font-size: 31rem; }.work-list__dek { grid-column: 2 / -1; }.work-list__action { grid-column: 3; grid-row: 2; }.work-list__art :deep(.ps-art__paper) { width: 68%; } }
@media (prefers-reduced-motion: reduce) { .home-hero__kicker, .home-hero__title, .home-hero__deck, .home-hero__actions, .home-hero__art { animation: none; }.route-list__item, .work-list__item, .route-list__marker, .route-list__action :deep(.ps-icon), .work-list__action { transition: none; } }
</style>
