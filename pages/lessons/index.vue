<script setup lang="ts">
/**
 * Lessons landing page. This is a calm choice page, not a course catalogue:
 * one short lesson and one longer course, each with a clear time commitment.
 */
useSeoMeta({
  title: 'Lessons by Naveen Jose · Entertrainer',
  description: 'Try a short lesson about clear instructions or take a longer course about artificial intelligence.',
  ogTitle: 'Lessons by Naveen Jose',
  ogDescription: 'A short lesson about clear instructions and a longer course about artificial intelligence.',
  ogUrl: 'https://entertrainer.in/lessons'
})

const lessons = [
  {
    title: 'How to make instructions easier to follow',
    description: 'A four-minute interactive lesson about turning a hard-to-read instruction into something another person can use.',
    detail: '4 min', action: 'Try the lesson', href: '/instructional-design',
    visual: 'instructions'
  },
  {
    title: 'From No AI to Know AI',
    description: 'A longer course about where AI came from, how prediction works, and how to use modern AI with care.',
    detail: '95 min', action: 'Start the course', href: '/courses/ai-atlas',
    visual: 'image', image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg',
    alt: 'Editorial illustration mapping the history of artificial intelligence'
  }
]
const lessonsStudioArt = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/ZKPOHGdqpXIWtQzC.jpg'
</script>

<template>
  <EdShell width="page">
    <header class="lessons-head">
      <h1 class="lessons-head__title lessons-head__title--write t-display">Lessons</h1>
      <p class="lessons-head__deck">Short, practical learning experiences for people who want to understand something clearly and try it for themselves.</p>
      <figure class="lessons-head__art lessons-head__art--sheet u-paper-reveal"><img :src="lessonsStudioArt" alt="Editorial instruction-making desk with blank cards, a cobalt route, and a pencil" loading="eager" decoding="async" /></figure>
    </header>

    <ol class="lessons-list">
      <li v-for="lesson in lessons" :key="lesson.href">
        <NuxtLink :to="lesson.href" class="lesson">
          <figure class="lesson__art" :class="{ 'lesson__art--diagram': lesson.visual === 'instructions', 'lesson__art--ai': lesson.visual === 'image' }">
            <img v-if="lesson.visual === 'image'" :src="lesson.image" :alt="lesson.alt" loading="lazy" decoding="async" />
            <span v-else class="lesson__diagram" aria-hidden="true"><i></i><i></i><i></i><b></b></span>
          </figure>
          <div class="lesson__copy">
            <p class="lesson__detail t-mono">{{ lesson.detail }}</p>
            <h2 class="lesson__title t-display">{{ lesson.title }}</h2>
            <p class="lesson__description">{{ lesson.description }}</p>
            <span class="lesson__action">{{ lesson.action }} <b aria-hidden="true">→</b></span>
          </div>
        </NuxtLink>
      </li>
    </ol>

    <section class="lessons-note" aria-labelledby="lessons-note-title">
      <h2 id="lessons-note-title" class="t-mono">What to expect</h2>
      <p>These lessons are made to be read, tried, and used. There is no sign-up, no score to chase, and no professional background required.</p>
    </section>
  </EdShell>
</template>

<style scoped>
.lessons-head { padding: clamp(54rem, 9vw, 126rem) 0 clamp(44rem, 7vw, 96rem); border-bottom: var(--stroke) solid var(--line); }
.lessons-head__title { margin: 0; font-size: clamp(54rem, 7vw, 106rem); line-height: .92; }.lessons-head__deck { max-width: 52ch; margin: 22rem 0 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.7vw, 22rem); line-height: 1.6; }
.lessons-head__art { margin: clamp(30rem, 5vw, 52rem) 0 0; overflow: hidden; border: var(--stroke) solid var(--line); background: var(--paper-2); }.lessons-head__art img { display: block; width: 100%; aspect-ratio: 3 / 1; object-fit: cover; }
.lessons-list { list-style: none; margin: 0; padding: 0; }.lessons-list > li { border-bottom: var(--stroke) solid var(--line); }
.lesson { display: grid; grid-template-columns: minmax(220rem, .8fr) minmax(0, 1.2fr); color: var(--ink); min-height: 320rem; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-mid) var(--ease-spring); }.lesson__art { margin: 0; overflow: hidden; background: var(--paper-2); border-right: var(--stroke) solid var(--line); }.lesson__art img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-mid) var(--ease-out); }.lesson__art--diagram { display: grid; place-items: center; background: #f0f5ff; }.lesson__diagram { position: relative; display: grid; gap: 16rem; width: min(60%, 180rem); padding: 26rem 20rem; background: var(--paper); border: var(--stroke) solid var(--ink); box-shadow: 10rem 10rem 0 #d6e7fb; }.lesson__diagram i { display: block; height: 3rem; background: var(--ink); }.lesson__diagram i:nth-child(2) { width: 82%; }.lesson__diagram i:nth-child(3) { width: 65%; }.lesson__diagram b { position: absolute; width: 24rem; height: 24rem; right: 18rem; bottom: 17rem; background: var(--blue); border-radius: 50%; }.lesson__copy { display: flex; flex-direction: column; align-items: flex-start; gap: 14rem; padding: clamp(28rem, 4vw, 52rem); }.lesson__detail { margin: 0; color: var(--muted); }.lesson__title { margin: 0; max-width: 15ch; font-size: clamp(32rem, 4vw, 56rem); line-height: .98; }.lesson__description { max-width: 48ch; margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: 18rem; line-height: 1.55; }.lesson__action { margin-top: auto; padding-top: 8rem; font-size: 14rem; font-weight: 750; }.lesson__action b { display: inline-block; color: var(--blue); transition: transform var(--dur-fast) var(--ease-out); }
@media (hover: hover) { .lesson:hover { background: var(--paper-2); transform: translateX(4rem); }.lesson:hover .lesson__art img { transform: scale(1.035); }.lesson:hover .lesson__action b { transform: translateX(4rem); } }
.lesson:focus-visible { outline: 2rem solid var(--focus); outline-offset: -4rem; }.lesson:focus-visible .lesson__action b { transform: translateX(4rem); }.lesson:active { transform: scale(.995); }
.lessons-head { padding: clamp(78rem, 12vw, 168rem) 0 clamp(72rem, 10vw, 132rem); }
.lessons-head__title--write { animation: lesson-title-write 660ms var(--ease-expo-out) both; }
.lessons-head__deck { animation: lesson-deck-settle 460ms var(--ease-out) 160ms both; }
.lessons-head__art { margin: clamp(42rem, 6vw, 72rem) 0 0; }
.lessons-head__art img { animation: lesson-sheet-drift 12s var(--ease-in-out) both; }
.lesson__copy { padding: clamp(34rem, 4.8vw, 64rem); }
.lesson__diagram { animation: lesson-diagram-assemble 620ms var(--ease-spring) both; }
.lesson__diagram i { transform-origin: left; animation: lesson-line-draw 480ms var(--ease-expo-out) both; }
.lesson__diagram i:nth-child(2) { animation-delay: 100ms; }.lesson__diagram i:nth-child(3) { animation-delay: 180ms; }
.lesson__diagram b { animation: lesson-dot 420ms var(--ease-spring) 260ms both; }
.lesson__art--ai img { animation: lesson-ai-reveal 700ms var(--ease-expo-out) both; }
@keyframes lesson-title-write { from { opacity: 0; transform: translateX(-14rem) rotate(-.7deg); clip-path: inset(0 100% 0 0); } to { opacity: 1; transform: none; clip-path: inset(0 0 0 0); } }
@keyframes lesson-deck-settle { from { opacity: 0; transform: translateY(10rem); } to { opacity: 1; transform: none; } }
@keyframes lesson-sheet-drift { from { transform: scale(1.04) translate3d(-1%, 0, 0); } to { transform: none; } }
@keyframes lesson-diagram-assemble { from { opacity: 0; transform: translate3d(-12rem, 12rem, 0) rotate(-3deg); } to { opacity: 1; transform: none; } }
@keyframes lesson-line-draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes lesson-dot { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes lesson-ai-reveal { from { opacity: 0; transform: scale(1.08) translateX(2%); } to { opacity: 1; transform: none; } }
.lessons-note { max-width: 58ch; padding: clamp(42rem, 7vw, 86rem) 0 clamp(64rem, 10vw, 128rem); }.lessons-note h2 { margin: 0 0 12rem; color: var(--muted); }.lessons-note p { margin: 0; font-family: var(--font-reading); font-size: 18rem; line-height: 1.6; color: var(--muted); }
@media (max-width: 680px) { .lessons-head__art img { aspect-ratio: 16 / 9; }.lesson { grid-template-columns: minmax(0, 1fr); }.lesson__art { aspect-ratio: 16 / 9; border-right: 0; border-bottom: var(--stroke) solid var(--line); }.lesson__copy { padding: 24rem 0 34rem; }.lesson__title { font-size: clamp(34rem, 10vw, 48rem); }.lesson__description { font-size: 17rem; } }
@media (prefers-reduced-motion: reduce) { .lessons-head__title--write, .lessons-head__deck, .lessons-head__art img, .lesson__diagram, .lesson__diagram i, .lesson__diagram b, .lesson__art--ai img { animation: none; }.lesson, .lesson__art img, .lesson__action b { transition: none; }.lesson:hover, .lesson:active { transform: none; } }
</style>
