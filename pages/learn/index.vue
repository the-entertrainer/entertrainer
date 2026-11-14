<script setup lang="ts">
/**
 * Learn dock. Canonical index for the instructional-design lesson, AI Atlas,
 * and Strong. /lessons redirects here.
 */
useSeoMeta({
  title: 'Learn · Entertrainer',
  description: 'A short lesson on clear instructions, a longer course on artificial intelligence, and the Strong module.',
  ogTitle: 'Learn',
  ogDescription: 'One short lesson, one longer course, and a ten-minute module on passwords.',
  ogUrl: 'https://entertrainer.in/learn'
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
  },
  {
    title: 'Strong',
    description: 'The same password can take a second or a century to crack, depending entirely on who is doing the cracking.',
    detail: '10 min', action: 'Open the module', href: '/work/strong', visual: 'evidence'
  }
]
</script>

<template>
  <EdShell width="page">
    <header class="lessons-head">
      <h1 class="lessons-head__title lessons-head__title--write t-display">Learn</h1>
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
.lessons-head { padding: clamp(4.75rem, 10vw, 9.125rem) 0 clamp(3.375rem, 8vw, 6.25rem); border-bottom: var(--stroke) solid var(--line); }.lessons-head__title { margin: 0; font-size: clamp(3.375rem, 7vw, 6.375rem); line-height: .92; animation: lesson-title 620ms var(--ease-expo-out) both; }.lessons-head__deck { max-width: 52ch; margin: 1.375rem 0 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(1.125rem, 1.7vw, 1.375rem); line-height: 1.6; animation: lesson-deck 460ms var(--ease-out) 120ms both; }.lessons-head__art { width: 100%; min-height: 15.625rem; margin: clamp(2.25rem, 5vw, 3.5rem) 0 0; animation: lesson-art 620ms var(--ease-expo-out) 160ms both; }
.lessons-list { list-style: none; margin: 0; padding: 0; }.lessons-list > li { border-bottom: var(--stroke) solid var(--line); }.lesson { display: grid; grid-template-columns: minmax(13.75rem, .8fr) minmax(0, 1.2fr); color: var(--ink); min-height: 18.125rem; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out); }.lesson__art { min-height: 100%; margin: 0; border-right: var(--stroke) solid var(--line); }.lesson__copy { display: flex; flex-direction: column; align-items: flex-start; gap: 0.875rem; padding: clamp(1.875rem, 4vw, 3.25rem); }.lesson__detail { margin: 0; color: var(--muted); }.lesson__title { margin: 0; max-width: 15ch; font-size: clamp(2rem, 4vw, 3.5rem); line-height: .98; }.lesson__description { max-width: 48ch; margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: 1.125rem; line-height: 1.55; }.lesson__action { display: inline-flex; align-items: center; gap: 0.4375rem; margin-top: auto; padding-top: 0.5rem; font-size: 0.875rem; font-weight: 750; }.lesson__action :deep(.ps-icon) { color: var(--signal-cobalt); transition: transform var(--dur-fast) var(--ease-out); } @media (hover: hover) { .lesson:hover { background: var(--signal-field); transform: translateX(0.25rem); }.lesson:hover .lesson__action :deep(.ps-icon) { transform: translateX(0.25rem); } }.lesson:focus-visible { outline: 0.125rem solid var(--focus); outline-offset: -0.25rem; }.lesson:active { transform: scale(.995); }
@keyframes lesson-title { from { opacity: 0; transform: translateY(0.875rem); } to { opacity: 1; transform: none; } } @keyframes lesson-deck { from { opacity: 0; transform: translateY(0.5625rem); } to { opacity: 1; transform: none; } } @keyframes lesson-art { from { opacity: 0; transform: translateY(0.75rem) scale(.99); } to { opacity: 1; transform: none; } }.lessons-note { max-width: 58ch; padding: clamp(2.625rem, 7vw, 5.375rem) 0 clamp(4rem, 10vw, 8rem); }.lessons-note h2 { margin: 0 0 0.75rem; color: var(--muted); }.lessons-note p { margin: 0; font-family: var(--font-reading); font-size: 1.125rem; line-height: 1.6; color: var(--muted); }
@media (max-width: 680px) { .lessons-head__art { min-height: 11.25rem; }.lesson { grid-template-columns: minmax(0, 1fr); }.lesson__art { min-height: 11.125rem; border-right: 0; border-bottom: var(--stroke) solid var(--line); }.lesson__copy { padding: 1.5rem 0 2.125rem; }.lesson__title { font-size: clamp(2.125rem, 10vw, 3rem); }.lesson__description { font-size: 1.0625rem; } } @media (prefers-reduced-motion: reduce) { .lessons-head__title, .lessons-head__deck, .lessons-head__art { animation: none; }.lesson, .lesson__action :deep(.ps-icon) { transition: none; }.lesson:hover, .lesson:active { transform: none; } }
</style>
