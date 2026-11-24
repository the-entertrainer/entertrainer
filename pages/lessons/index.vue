<script setup lang="ts">
/**
 * Paper Signal Lessons landing page. This is a calm choice page, not a course
 * catalogue: two course routes, using only the approved illustration system.
 */
useSeoMeta({
  title: 'Lessons by Naveen Jose · Entertrainer',
  description: 'Try a short lesson on clear instructions, or take the longer course on artificial intelligence. Pick your route.',
  ogTitle: 'Lessons by Naveen Jose',
  ogDescription: 'One short lesson on clear instructions. One longer course on artificial intelligence. No need to overcomplicate the menu.',
  ogUrl: 'https://entertrainer.in/lessons'
})

const lessons = [
  {
    title: 'How to make instructions people can actually follow',
    description: 'Take an instruction that makes people stop and reread it, then turn it into something another person can use.',
    detail: '4 min', action: 'Try the lesson', href: '/instructional-design', visual: 'lesson'
  },
  {
    title: 'From No AI to Know AI',
    description: 'See where AI came from, how prediction works, and why its use matters. The machinery is less mysterious once you look at the moving parts.',
    detail: '95 min', action: 'Start the course', href: '/courses/ai-atlas', visual: 'process'
  }
]
</script>

<template>
  <EdShell width="page">
    <header class="lessons-head">
      <h1 class="lessons-head__title lessons-head__title--write t-display">Lessons</h1>
      <p class="lessons-head__deck">Short lessons you can understand, try, and use.</p>
      <EdPaperSignal class="lessons-head__art u-paper-reveal" variant="lesson" label="A Paper Signal lesson card with black instruction rules and a cobalt learning cue" />
    </header>

    <ol class="lessons-list">
      <li v-for="lesson in lessons" :key="lesson.href">
        <NuxtLink :to="lesson.href" class="lesson">
          <EdPaperSignal class="lesson__art" :variant="lesson.visual" label="" />
          <div class="lesson__copy">
            <p class="lesson__detail t-mono">{{ lesson.detail }}</p>
            <h2 class="lesson__title t-display">{{ lesson.title }}</h2>
            <p class="lesson__description">{{ lesson.description }}</p>
            <span class="lesson__action">{{ lesson.action }} <EdSignalIcon name="arrow" /></span>
          </div>
        </NuxtLink>
      </li>
    </ol>

    <section class="lessons-note" aria-labelledby="lessons-note-title">
      <h2 id="lessons-note-title" class="t-mono">What to expect</h2>
      <p>These lessons are made to be read, tried, and used. There is no sign-up, no score to chase, and no professional background required. You can start without prior experience: read the explanation, try the example, and use the method.</p>
    </section>
  </EdShell>
</template>

<style scoped>
.lessons-head { padding: clamp(76rem, 10vw, 146rem) 0 clamp(54rem, 8vw, 100rem); border-bottom: var(--stroke) solid var(--line); }.lessons-head__title { margin: 0; font-size: clamp(54rem, 7vw, 102rem); line-height: .92; animation: lesson-title 620ms var(--ease-expo-out) both; }.lessons-head__deck { max-width: 52ch; margin: 22rem 0 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.7vw, 22rem); line-height: 1.6; animation: lesson-deck 460ms var(--ease-out) 120ms both; }.lessons-head__art { width: 100%; min-height: 250rem; margin: clamp(36rem, 5vw, 56rem) 0 0; animation: lesson-art 620ms var(--ease-expo-out) 160ms both; }
.lessons-list { list-style: none; margin: 0; padding: 0; }.lessons-list > li { border-bottom: var(--stroke) solid var(--line); }.lesson { display: grid; grid-template-columns: minmax(220rem, .8fr) minmax(0, 1.2fr); color: var(--ink); min-height: 290rem; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out); }.lesson__art { min-height: 100%; margin: 0; border-right: var(--stroke) solid var(--line); }.lesson__copy { display: flex; flex-direction: column; align-items: flex-start; gap: 14rem; padding: clamp(30rem, 4vw, 52rem); }.lesson__detail { margin: 0; color: var(--muted); }.lesson__title { margin: 0; max-width: 15ch; font-size: clamp(32rem, 4vw, 56rem); line-height: .98; }.lesson__description { max-width: 48ch; margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: 18rem; line-height: 1.55; }.lesson__action { display: inline-flex; align-items: center; gap: 7rem; margin-top: auto; padding-top: 8rem; font-size: 14rem; font-weight: 750; }.lesson__action :deep(.ps-icon) { color: var(--signal-cobalt); transition: transform var(--dur-fast) var(--ease-out); } @media (hover: hover) { .lesson:hover { background: var(--signal-field); transform: translateX(4rem); }.lesson:hover .lesson__action :deep(.ps-icon) { transform: translateX(4rem); } }.lesson:focus-visible { outline: 2rem solid var(--focus); outline-offset: -4rem; }.lesson:active { transform: scale(.995); }
@keyframes lesson-title { from { opacity: 0; transform: translateY(14rem); } to { opacity: 1; transform: none; } } @keyframes lesson-deck { from { opacity: 0; transform: translateY(9rem); } to { opacity: 1; transform: none; } } @keyframes lesson-art { from { opacity: 0; transform: translateY(12rem) scale(.99); } to { opacity: 1; transform: none; } }.lessons-note { max-width: 58ch; padding: clamp(42rem, 7vw, 86rem) 0 clamp(64rem, 10vw, 128rem); }.lessons-note h2 { margin: 0 0 12rem; color: var(--muted); }.lessons-note p { margin: 0; font-family: var(--font-reading); font-size: 18rem; line-height: 1.6; color: var(--muted); }
@media (max-width: 680px) { .lessons-head__art { min-height: 180rem; }.lesson { grid-template-columns: minmax(0, 1fr); }.lesson__art { min-height: 178rem; border-right: 0; border-bottom: var(--stroke) solid var(--line); }.lesson__copy { padding: 24rem 0 34rem; }.lesson__title { font-size: clamp(34rem, 10vw, 48rem); }.lesson__description { font-size: 17rem; } } @media (prefers-reduced-motion: reduce) { .lessons-head__title, .lessons-head__deck, .lessons-head__art { animation: none; }.lesson, .lesson__action :deep(.ps-icon) { transition: none; }.lesson:hover, .lesson:active { transform: none; } }
</style>
