<script setup lang="ts">
useSeoMeta({
  title: 'Entertrainer · Elevate, Empower, Educate',
  description: 'Stories for the questions that keep returning, tools for the work that keeps repeating, and courses for the things nobody explained properly the first time.',
  ogTitle: 'Entertrainer · The Three Es',
  ogDescription: 'Elevate, Empower, Educate.',
  ogUrl: 'https://entertrainer.in/'
})

const routes = [
  { code: 'E01', name: 'Elevate', type: 'Stories', href: '/elevate', note: 'Look at an ordinary thing long enough. It starts talking back.' },
  { code: 'E02', name: 'Empower', type: 'Tools', href: '/empower', note: 'Small utilities for the work that has already asked twice.' },
  { code: 'E03', name: 'Educate', type: 'Courses', href: '/educate', note: 'Hard ideas, explained without a slide full of arrows.' },
  { code: 'G04', name: 'Games', type: 'Soon', href: '/games', note: 'Useful things are allowed to be fun. It is not illegal.' },
  { code: 'A05', name: 'About me', type: 'Story', href: '/about', note: 'The work, the person, and the comic that refused to stay a report.' }
]
</script>

<template>
  <main id="main" class="route-index">
    <header class="route-index__intro">
      <p class="route-index__kicker">Entertrainer / route index</p>
      <h1>Pick a direction.</h1>
      <p>I make stories, tools, and learning for the parts of work and life that should have made sense already.</p>
    </header>

    <nav class="route-index__switchboard" aria-label="Entertrainer sections">
      <div class="route-index__hub" aria-hidden="true">
        <EdWordmark variant="mark" :size="94" />
        <span>The Three Es</span>
      </div>

      <ol class="route-index__routes">
        <li v-for="route in routes" :key="route.href" :class="`route-index__route route-index__route--${route.code.slice(0, 1).toLowerCase()}`">
          <NuxtLink :to="route.href">
            <span class="route-index__code">{{ route.code }}</span>
            <span class="route-index__type">{{ route.type }}</span>
            <strong>{{ route.name }}</strong>
            <span class="route-index__note">{{ route.note }}</span>
            <span class="route-index__action">Enter {{ route.name }}</span>
          </NuxtLink>
        </li>
      </ol>
    </nav>

    <p class="route-index__footnote">Start anywhere. The map is not offended.</p>
  </main>
</template>

<style scoped>
/* Compact home: a tactile route switchboard around the yellow e mark. The experience is compact by default and turns into a clear ticket list on smaller screens. */
.route-index { max-width: var(--shell-wide); min-height: min(720rem, calc(100dvh - 130rem)); margin: 0 auto; padding: clamp(36rem, 6vw, 82rem) var(--shell-gutter) clamp(54rem, 7vw, 96rem); display: grid; align-content: center; gap: clamp(30rem, 5vw, 68rem); }
.route-index__intro { max-width: 720rem; }
.route-index__kicker, .route-index__code, .route-index__type, .route-index__hub span { margin: 0; font: 700 11rem/1.1 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.route-index__kicker { color: var(--signal-cobalt); }
.route-index h1 { margin: 14rem 0 16rem; font: 500 clamp(58rem, 8vw, 122rem)/.83 var(--font-display); letter-spacing: -.075em; }
.route-index__intro > p:last-child { max-width: 50ch; margin: 0; font-size: clamp(17rem, 1.65vw, 21rem); line-height: 1.45; }

.route-index__switchboard { position: relative; display: grid; grid-template-columns: minmax(190rem, .62fr) minmax(0, 1.38fr); gap: clamp(22rem, 5vw, 78rem); align-items: center; padding: clamp(20rem, 3vw, 38rem); border: var(--stroke) solid var(--ink); border-radius: var(--radius-xl); background: var(--paper-2); box-shadow: 10rem 10rem 0 color-mix(in srgb, var(--signal-cobalt) 26%, transparent); overflow: hidden; }
.route-index__switchboard::before { content: ''; position: absolute; inset: auto -16% -68% auto; width: min(480rem, 54vw); aspect-ratio: 1; border: 38rem solid color-mix(in srgb, var(--signal-cobalt) 28%, transparent); border-radius: 50%; pointer-events: none; }
.route-index__hub { position: relative; z-index: 1; display: grid; width: min(100%, 260rem); aspect-ratio: 1; place-items: center; justify-self: center; border: var(--stroke) solid var(--ink); border-radius: 50%; background: var(--signal-field); box-shadow: 8rem 8rem 0 var(--ink); }
.route-index__hub::before, .route-index__hub::after { content: ''; position: absolute; inset: 18%; border: var(--stroke) solid var(--ink); border-radius: 50%; opacity: .14; }
.route-index__hub::after { inset: 34%; }
.route-index__hub :deep(.wordmark) { position: relative; z-index: 1; }
.route-index__hub span { position: absolute; bottom: 26rem; color: var(--ink); }
.route-index__routes { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10rem; padding: 0; margin: 0; list-style: none; }
.route-index__route:last-child { grid-column: span 2; }
.route-index__route a { position: relative; display: grid; min-height: 150rem; grid-template-columns: auto 1fr; grid-template-rows: auto auto 1fr auto; column-gap: 10rem; align-items: start; padding: 16rem 18rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); color: var(--ink); background: color-mix(in srgb, var(--paper) 92%, transparent); overflow: hidden; transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
.route-index__route a::after { content: ''; position: absolute; right: 14rem; top: 14rem; width: 9rem; height: 9rem; border-radius: 50%; background: var(--signal-cobalt); }
.route-index__route--g a::after { border-radius: 2rem; }
.route-index__code { color: var(--signal-cobalt); }
.route-index__type { justify-self: end; color: var(--ink-soft); }
.route-index__route strong { grid-column: span 2; margin-top: 16rem; font: 500 clamp(28rem, 3vw, 42rem)/.88 var(--font-display); letter-spacing: -.055em; }
.route-index__note { grid-column: span 2; align-self: end; max-width: 29ch; margin-top: 9rem; font: 14rem/1.35 var(--font-reading); }
.route-index__action { grid-column: span 2; margin-top: 13rem; font: 700 11rem/1.1 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
@media (hover: hover) { .route-index__route a:hover { background: var(--signal-field); transform: translate(-3rem, -3rem); box-shadow: 5rem 5rem 0 var(--ink); } }
.route-index__route a:focus-visible { outline: 3rem solid var(--focus); outline-offset: 4rem; }
.route-index__footnote { margin: 0; color: var(--ink-soft); font: 15rem/1.4 var(--font-reading); }
@media (max-width: 780px) { .route-index { min-height: auto; }.route-index__switchboard { grid-template-columns: 1fr; }.route-index__hub { width: 154rem; }.route-index__hub span { bottom: 16rem; font-size: 9rem; }.route-index__routes { grid-template-columns: 1fr; }.route-index__route:last-child { grid-column: auto; }.route-index__route a { min-height: 128rem; }.route-index__route strong { margin-top: 11rem; }.route-index__note { max-width: 36ch; }.route-index__switchboard::before { width: 300rem; bottom: -125rem; } }
@media (max-width: 460px) { .route-index { padding-top: 30rem; gap: 28rem; }.route-index h1 { font-size: clamp(54rem, 16vw, 71rem); }.route-index__switchboard { padding: 14rem; border-radius: var(--radius-l); }.route-index__hub { width: 132rem; }.route-index__routes { gap: 8rem; }.route-index__route a { min-height: 120rem; padding: 15rem; }.route-index__route strong { font-size: 31rem; }.route-index__note { font-size: 13.5rem; } }
</style>
