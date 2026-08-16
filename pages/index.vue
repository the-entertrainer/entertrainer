<script setup lang="ts">
/**
 * No-miss homepage: an ordinary visitor should understand the site, choose a
 * path, see a small amount of real work, and meet Naveen without decoding
 * portfolio metadata. The page is intentionally open, direct, and text-first.
 */
import { ITEMS } from '~/content/editorial'

useSeoMeta({
  title: 'Entertrainer — Lessons, projects, and free tools by Naveen Jose',
  description: 'Naveen Jose makes lessons, projects, and free tools that make complicated work easier to understand.',
  ogTitle: 'Entertrainer — Lessons, projects, and free tools by Naveen Jose',
  ogDescription: 'Lessons, projects, and free tools that make complicated work easier to understand.',
  ogUrl: 'https://entertrainer.in/'
})

const pathways = [
  {
    title: 'Lessons',
    body: 'Try a short lesson that shows how a confusing instruction can become easier to follow.',
    href: '/lessons', action: 'See lessons',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/idMdUldTgLmROPkp.jpg'
  },
  {
    title: 'Projects',
    body: 'See the comics, courses, and interactive explainers I have made for real work.',
    href: '/my-work', action: 'See projects',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/JGRlAfvUmoOLfMks.jpg'
  },
  {
    title: 'Free tools',
    body: 'Use small browser tools I built to make planning, writing, and quiz-making quicker.',
    href: '/tools', action: 'Use a tool',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/arGfHThKMakIOmAy.jpg'
  },
  {
    title: 'About',
    body: 'Read how I moved from hotel floors to making learning for people around the world.',
    href: '/about', action: 'Read my story',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/qAPWGwOScgDPspmw.jpg'
  }
]

const selectedWork = computed(() => ITEMS.filter(item => ['sewa-chronicles', 'ai-atlas', 'strong'].includes(item.id)))
const selectedTools = computed(() => ITEMS.filter(item => item.category === 'tools').slice(0, 3))
</script>

<template>
  <EdShell width="wide">
    <header class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__title-wrap">
        <p class="home-hero__kicker t-mono">Hello, I’m Naveen.</p>
        <h1 id="home-title" class="home-hero__title t-display">I make complicated work easier to understand.</h1>
      </div>
      <div class="home-hero__copy">
        <p>I started out on hotel floors, where a good explanation helped someone get through a busy shift. Now I make lessons, projects, and small tools for people who need to understand difficult things.</p>
        <NuxtLink to="/instructional-design" class="ticket">Try a short lesson <span aria-hidden="true">→</span></NuxtLink>
      </div>
    </header>

    <section class="paths" aria-labelledby="paths-title">
      <div class="section-intro">
        <h2 id="paths-title" class="section-intro__title t-display">Start here.</h2>
        <p class="section-intro__deck">Choose what you would like to do. You do not need to know anything about learning design to look around.</p>
      </div>
      <ul class="paths__list">
        <li v-for="route in pathways" :key="route.title" class="path">
          <NuxtLink :to="route.href" class="path__link">
            <figure class="path__art"><img :src="route.image" alt="" loading="lazy" decoding="async" /></figure>
            <div class="path__copy">
              <h3 class="path__title t-display">{{ route.title }}</h3>
              <p>{{ route.body }}</p>
              <span class="path__action">{{ route.action }} <b aria-hidden="true">→</b></span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="projects" aria-labelledby="projects-title">
      <div class="section-intro section-intro--split">
        <div><h2 id="projects-title" class="section-intro__title t-display">Projects</h2><p class="section-intro__deck">Courses, stories, and interactive explainers I made for real people to use.</p></div>
        <NuxtLink to="/my-work" class="section-intro__link u-underline">See all projects</NuxtLink>
      </div>
      <div class="projects__grid">
        <EdCard v-for="item in selectedWork" :key="item.id" :item="item" variant="standard" />
      </div>
    </section>

    <section class="tools" aria-labelledby="tools-title">
      <div class="section-intro section-intro--split">
        <div><h2 id="tools-title" class="section-intro__title t-display">Free tools</h2><p class="section-intro__deck">Small browser tools I made after doing the same slow jobs too many times.</p></div>
        <NuxtLink to="/tools" class="section-intro__link u-underline">See all free tools</NuxtLink>
      </div>
      <ul class="tools__list">
        <li v-for="tool in selectedTools" :key="tool.id">
          <NuxtLink :to="tool.href" class="tool-row">
            <span class="tool-row__name t-display">{{ tool.title }}</span>
            <span class="tool-row__dek">{{ tool.dek }}</span>
            <span class="tool-row__action">Use it <b aria-hidden="true">→</b></span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="close" aria-labelledby="close-title">
      <p class="close__kicker t-mono">About Naveen</p>
      <h2 id="close-title" class="close__title t-display">I care about the moment someone says, “Oh. I get it now.”</h2>
      <p class="close__body">That is why I make this work. If you are trying to explain something important, I would genuinely like to hear about it.</p>
      <a href="mailto:iamnaveenjose@outlook.com" class="ticket">Start a conversation <span aria-hidden="true">→</span></a>
    </section>
  </EdShell>
</template>

<style scoped>
/* Direct, personal, open. Hierarchy comes from prose, type and space—not card stacks or metadata. */
.home-hero { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280rem, .8fr); gap: clamp(36rem, 8vw, 132rem); padding: clamp(54rem, 9vw, 132rem) 0 clamp(58rem, 10vw, 148rem); border-bottom: var(--stroke) solid var(--line); }
.home-hero__kicker, .close__kicker { margin: 0; color: var(--muted); }
.home-hero__title { max-width: 10ch; margin: 18rem 0 0; font-size: clamp(54rem, 8vw, 128rem); line-height: .92; letter-spacing: -.025em; word-spacing: .035em; }
.home-hero__copy { align-self: end; display: flex; flex-direction: column; align-items: flex-start; gap: 24rem; max-width: 39ch; padding-bottom: 5rem; }
.home-hero__copy p { margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.65vw, 22rem); line-height: 1.6; }

.paths, .projects, .tools { padding: clamp(54rem, 9vw, 132rem) 0; border-bottom: var(--stroke) solid var(--line); }
.section-intro { display: grid; grid-template-columns: minmax(0, 1fr) minmax(250rem, .56fr); gap: 28rem; align-items: end; margin-bottom: clamp(30rem, 5vw, 64rem); }
.section-intro--split { grid-template-columns: minmax(0, 1fr) auto; }
.section-intro__title { margin: 0; max-width: 15ch; font-size: clamp(42rem, 5vw, 72rem); line-height: .95; }
.section-intro__deck { max-width: 36ch; margin: 12rem 0 0; color: var(--muted); font-family: var(--font-reading); font-size: 18rem; line-height: 1.55; }
.section-intro > .section-intro__deck { margin: 0; }
.section-intro__link { align-self: end; color: var(--ink); font-weight: 700; white-space: nowrap; }

.paths__list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); list-style: none; padding: 0; margin: 0; border-top: var(--stroke) solid var(--line); }
.path { min-width: 0; border-bottom: var(--stroke) solid var(--line); }
.path:nth-child(odd) { border-right: var(--stroke) solid var(--line); }
.path__link { display: grid; grid-template-columns: minmax(150rem, .76fr) minmax(0, 1.24fr); min-height: 238rem; color: var(--ink); }
.path__art { margin: 0; overflow: hidden; background: var(--paper-2); border-right: var(--stroke) solid var(--line); }
.path__art img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-mid) var(--ease-out); }
.path__copy { display: flex; flex-direction: column; align-items: flex-start; gap: 11rem; padding: clamp(20rem, 2.6vw, 32rem); }
.path__title { margin: 0; font-size: clamp(28rem, 3vw, 44rem); line-height: .98; }
.path__copy p { margin: 0; color: var(--muted); font-family: var(--font-reading); line-height: 1.5; }
.path__action { margin-top: auto; padding-top: 7rem; font-size: 14rem; font-weight: 750; }.path__action b { color: var(--blue); }
@media (hover: hover) { .path__link:hover { background: var(--paper-2); }.path__link:hover .path__art img { transform: scale(1.035); } }

.projects__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(18rem, 2.4vw, 32rem); }
.tools__list { list-style: none; margin: 0; padding: 0; border-top: var(--stroke) solid var(--line); }
.tool-row { display: grid; grid-template-columns: minmax(160rem, .72fr) minmax(0, 1.35fr) auto; gap: 20rem; align-items: baseline; padding: 24rem 0; color: var(--ink); border-bottom: var(--stroke) solid var(--line); transition: color var(--dur-fast) var(--ease-out), padding var(--dur-fast) var(--ease-out); }
.tool-row__name { font-size: clamp(28rem, 3vw, 42rem); line-height: 1; }.tool-row__dek { color: var(--muted); font-family: var(--font-reading); line-height: 1.5; }.tool-row__action { font-size: 14rem; font-weight: 750; white-space: nowrap; }.tool-row__action b { color: var(--blue); }
@media (hover: hover) { .tool-row:hover { padding-left: 10rem; color: var(--blue); } }

.close { max-width: 760rem; padding: clamp(60rem, 11vw, 160rem) 0 calc(clamp(72rem, 12vw, 180rem)); }
.close__title { max-width: 14ch; margin: 14rem 0 20rem; font-size: clamp(42rem, 5.8vw, 82rem); line-height: .96; }.close__body { max-width: 53ch; margin: 0 0 30rem; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.7vw, 21rem); line-height: 1.6; }

@media (max-width: 900px) { .home-hero { grid-template-columns: minmax(0, 1fr); gap: 32rem; }.home-hero__title { max-width: 11ch; }.projects__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 660px) { .home-hero { padding-top: 42rem; }.home-hero__title { font-size: clamp(52rem, 15vw, 70rem); }.section-intro, .section-intro--split { grid-template-columns: minmax(0, 1fr); gap: 18rem; }.paths__list, .projects__grid { grid-template-columns: minmax(0, 1fr); }.path:nth-child(odd) { border-right: 0; }.path__link { min-height: 190rem; grid-template-columns: 39% 61%; }.path__copy { padding: 18rem; }.tool-row { grid-template-columns: minmax(0, 1fr) auto; gap: 8rem 16rem; }.tool-row__dek { grid-column: 1 / -1; }.tool-row__action { grid-column: 2; grid-row: 1; } }
@media (prefers-reduced-motion: reduce) { .path__art img, .tool-row { transition: none; } }
</style>
