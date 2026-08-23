<script setup lang="ts">
useSeoMeta({
  title: 'Educate · Courses and lessons by Entertrainer',
  description: 'Interactive lessons and courses for difficult subjects that deserve a little more patience than a rushed explanation.',
  ogUrl: 'https://entertrainer.in/educate'
})

const lessons = [
  { title: 'How to make instructions people can actually follow', description: 'Take an instruction that makes people stop and reread it, then turn it into something another person can use.', detail: '4 min', action: 'Try the lesson', href: '/instructional-design', visual: 'lesson' },
  { title: 'From No AI to Know AI', description: 'See where AI came from, how prediction works, and why its use matters. The machinery is less mysterious once you look at the moving parts.', detail: '95 min', action: 'Start the course', href: '/courses/ai-atlas', visual: 'process' }
]
</script>

<template>
  <main id="main" class="educate">
    <header class="educate__hero">
      <p class="educate__eyebrow">The Three Es</p>
      <h1>Educate</h1>
      <p>Interactive learning for the things that usually get explained too quickly, preferably on a slide with fourteen arrows.</p>
      <EdPaperSignal class="educate__art" variant="lesson" label="A warm yellow Paper Signal learning card" />
    </header>
    <ol class="educate__list">
      <li v-for="lesson in lessons" :key="lesson.href">
        <NuxtLink :to="lesson.href" class="educate__lesson">
          <EdPaperSignal :variant="lesson.visual" label="" />
          <div><p>{{ lesson.detail }}</p><h2>{{ lesson.title }}</h2><span>{{ lesson.description }}</span><strong>{{ lesson.action }} <i aria-hidden="true">↗</i></strong></div>
        </NuxtLink>
      </li>
    </ol>
  </main>
</template>

<style scoped>
/* Educate: yellow editorial course shelf, high-clarity lesson cards, and readable learning cues. */
.educate { max-width: var(--shell-page); margin: 0 auto; padding: clamp(52rem, 9vw, 130rem) var(--shell-gutter) 120rem; }.educate__hero { border-bottom: var(--stroke) solid var(--ink); }.educate__eyebrow, .educate__lesson p { margin: 0; color: var(--signal-cobalt); font: 700 11rem/1.2 var(--font-mono); letter-spacing: .09em; text-transform: uppercase; }.educate h1 { margin: 14rem 0 16rem; font: 500 clamp(65rem, 10vw, 136rem)/.82 var(--font-display); letter-spacing: -.07em; }.educate__hero > p:last-of-type { max-width: 520rem; margin: 0; font-size: clamp(19rem, 2.1vw, 25rem); line-height: 1.45; }.educate__art { min-height: 230rem; margin: 42rem 0 0; border: 0; }.educate__list { padding: 0; margin: 0; list-style: none; }.educate__list li { border-bottom: var(--stroke) solid var(--line); }.educate__lesson { display: grid; grid-template-columns: .7fr 1.3fr; color: var(--ink); }.educate__lesson :deep(.ps-art) { min-height: 280rem; border-right: var(--stroke) solid var(--ink); }.educate__lesson > div { display: flex; flex-direction: column; align-items: flex-start; padding: clamp(28rem, 4vw, 56rem); }.educate h2 { max-width: 15ch; margin: 14rem 0; font: 500 clamp(33rem, 4vw, 60rem)/.95 var(--font-display); letter-spacing: -.045em; }.educate__lesson span { max-width: 48ch; font-family: var(--font-body); line-height: 1.5; }.educate__lesson strong { margin-top: 24rem; font-size: 14rem; }.educate__lesson i { color: var(--signal-cobalt); font-style: normal; } @media (hover:hover) { .educate__lesson:hover { background: var(--signal-field); } }.educate__lesson:focus-visible { outline: 3rem solid var(--focus); outline-offset: -3rem; } @media (max-width:680px) { .educate__lesson { grid-template-columns: 1fr; }.educate__lesson :deep(.ps-art) { min-height: 175rem; border-right: 0; border-bottom: var(--stroke) solid var(--ink); } }
</style>
