<script setup lang="ts">
useSeoMeta({
  title: 'Entertrainer · Elevate, Empower, Educate',
  description: 'Stories for the questions that keep returning, tools for the work that keeps repeating, and courses for the things nobody explained properly the first time.',
  ogTitle: 'Entertrainer · The Three Es',
  ogDescription: 'Elevate, Empower, Educate.',
  ogUrl: 'https://entertrainer.in/'
})

const routes = [
  { name: 'Elevate', type: 'Stories', href: '/elevate' },
  { name: 'Empower', type: 'Tools', href: '/empower' },
  { name: 'Educate', type: 'Courses', href: '/educate' },
  { name: 'Games', type: 'Play', href: '/games' },
  { name: 'About me', type: 'About', href: '/about' }
]
</script>

<template>
  <main id="main" class="route-index">
    <header class="route-index__intro">
      <h1>Stories, tools, and courses.</h1>
    </header>

    <nav class="route-index__switchboard" aria-label="Entertrainer sections">
      <div class="route-index__hub" aria-hidden="true">
        <EdWordmark variant="mark" :size="94" />
      </div>

      <ol class="route-index__routes">
        <li v-for="route in routes" :key="route.href" class="route-index__route">
          <NuxtLink :to="route.href">
            <span class="route-index__type">{{ route.type }}</span>
            <strong>{{ route.name }}</strong>
          </NuxtLink>
        </li>
      </ol>
    </nav>

  </main>
</template>

<style scoped>
/* Compact home: a tactile route switchboard around the yellow e mark. The experience is compact by default and turns into a clear ticket list on smaller screens. */
.route-index { max-width: var(--shell-wide); min-height: min(720rem, calc(100dvh - 130rem)); margin: 0 auto; padding: clamp(36rem, 6vw, 82rem) var(--shell-gutter) clamp(54rem, 7vw, 96rem); display: grid; align-content: center; gap: clamp(30rem, 5vw, 68rem); }
.route-index__intro { max-width: 720rem; }
.route-index__type { margin: 0; font: 700 11rem/1.1 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.route-index h1 { margin: 0; font: 500 clamp(58rem, 8vw, 122rem)/.83 var(--font-display); letter-spacing: -.075em; }

.route-index__switchboard { position: relative; display: grid; grid-template-columns: minmax(190rem, .62fr) minmax(0, 1.38fr); gap: clamp(22rem, 5vw, 78rem); align-items: center; padding: clamp(20rem, 3vw, 38rem); border: var(--stroke) solid var(--ink); border-radius: var(--radius-xl); background: var(--paper-2); box-shadow: 10rem 10rem 0 color-mix(in srgb, var(--signal-cobalt) 26%, transparent); overflow: hidden; }
.route-index__switchboard::before { content: ''; position: absolute; inset: auto -16% -68% auto; width: min(480rem, 54vw); aspect-ratio: 1; border: 38rem solid color-mix(in srgb, var(--signal-cobalt) 28%, transparent); border-radius: 50%; pointer-events: none; }
.route-index__hub { position: relative; z-index: 1; display: grid; width: min(100%, 260rem); aspect-ratio: 1; place-items: center; justify-self: center; border: var(--stroke) solid var(--ink); border-radius: 50%; background: var(--signal-field); box-shadow: 8rem 8rem 0 var(--ink); }
.route-index__hub::before, .route-index__hub::after { content: ''; position: absolute; inset: 18%; border: var(--stroke) solid var(--ink); border-radius: 50%; opacity: .14; }
.route-index__hub::after { inset: 34%; }
.route-index__hub :deep(.wordmark) { position: relative; z-index: 1; }
.route-index__routes { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10rem; padding: 0; margin: 0; list-style: none; }
.route-index__route:last-child { grid-column: span 2; }
.route-index__route a { position: relative; display: grid; min-height: 118rem; grid-template-columns: 1fr auto; align-items: start; padding: 18rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); color: var(--ink); background: color-mix(in srgb, var(--paper) 92%, transparent); overflow: hidden; transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
.route-index__type { justify-self: end; color: var(--ink-soft); }
.route-index__route strong { grid-column: 1 / 3; margin-top: 16rem; font: 500 clamp(28rem, 3vw, 42rem)/.88 var(--font-display); letter-spacing: -.055em; }
@media (hover: hover) { .route-index__route a:hover { background: var(--signal-field); transform: translate(-3rem, -3rem); box-shadow: 5rem 5rem 0 var(--ink); } }
.route-index__route a:focus-visible { outline: 3rem solid var(--focus); outline-offset: 4rem; }
@media (max-width: 780px) {
  .route-index { min-height: auto; gap: 26rem; }
  .route-index__switchboard { display: block; padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; overflow: visible; }
  .route-index__switchboard::before { display: none; }
  .route-index__hub { display: none; }
  .route-index__routes { display: block; border-top: var(--stroke) solid var(--ink); }
  .route-index__route, .route-index__route:last-child { display: block; }
  .route-index__route a { min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto auto; gap: 0 10rem; padding: 16rem 4rem; border: 0; border-bottom: var(--stroke) solid var(--ink); border-radius: 0; background: transparent; overflow: visible; }
  .route-index__type { grid-column: 2; grid-row: 1; align-self: center; font-size: 10rem; }
  .route-index__route strong { grid-column: 1 / 3; grid-row: 2; margin: 6rem 0 0; font-size: clamp(32rem, 9vw, 42rem); }
}
@media (max-width: 460px) { .route-index { padding-top: 24rem; gap: 22rem; }.route-index h1 { font-size: clamp(50rem, 15vw, 62rem); }.route-index__route a { padding: 14rem 2rem; }.route-index__route strong { font-size: 34rem; } }
</style>
