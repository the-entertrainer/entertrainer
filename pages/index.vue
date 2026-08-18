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
const homeHeroArt = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/CLHikwLahcffypTI.jpg'
const eveningNoteArt = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/vhnvNQcncSQVUYvR.jpg'
const worldRouteArt = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/YghNlEEMeBajZWCz.jpg'
const routeThreadArt = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/AeOTtEpKbhaRJHYH.jpg'
</script>

<template>
  <EdShell width="wide">
    <header class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__title-wrap">
        <p class="home-hero__kicker home-hero__kicker--arrival t-mono">Hello, I’m Naveen.</p>
        <h1 id="home-title" class="home-hero__title home-hero__title--ink t-display">I make complicated work easier to understand.</h1>
      </div>
      <div class="home-hero__copy">
        <p>I started out on hotel floors, where a good explanation helped someone get through a busy shift. Now I make lessons, projects, and small tools for people who need to understand difficult things.</p>
        <NuxtLink to="/instructional-design" class="ticket">Try a short lesson <span aria-hidden="true">→</span></NuxtLink>
      </div>
      <figure class="home-hero__art home-hero__art--human u-paper-reveal"><img :src="homeHeroArt" alt="Editorial still life showing a practical path from tangled work to a clear route" loading="eager" decoding="async" /></figure>
    </header>

    <section class="paths" aria-labelledby="paths-title">
      <div class="section-intro">
        <h2 id="paths-title" class="section-intro__title section-intro__title--route t-display">Start here.</h2>
        <p class="section-intro__deck">Choose what you would like to do. You do not need to know anything about learning design to look around.</p>
      </div>
      <figure class="paths__world u-paper-reveal"><img :src="worldRouteArt" alt="Abstract world field with a blue route line converging on one point" loading="lazy" decoding="async" /><figcaption class="paths__world-label t-mono">A route through the work</figcaption></figure>
      <ul class="paths__list">
        <li v-for="(route, index) in pathways" :key="route.title" :class="['path', `path--${index + 1}`]">
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
        <div><h2 id="projects-title" class="section-intro__title section-intro__title--artifact t-display">Projects</h2><p class="section-intro__deck">Courses, stories, and interactive explainers I made for real people to use.</p></div>
        <NuxtLink to="/my-work" class="section-intro__link u-underline">See all projects</NuxtLink>
      </div>
      <div class="projects__grid">
        <EdCard v-for="(item, index) in selectedWork" :key="item.id" :item="item" :class="['projects__item', `projects__item--${index + 1}`]" :variant="index === 0 ? 'wide' : 'standard'" />
      </div>
    </section>

    <section class="tools" aria-labelledby="tools-title">
      <div class="section-intro section-intro--split">
        <div><h2 id="tools-title" class="section-intro__title section-intro__title--utility t-display">Free tools</h2><p class="section-intro__deck">Small browser tools I made after doing the same slow jobs too many times.</p></div>
        <NuxtLink to="/tools" class="section-intro__link u-underline">See all free tools</NuxtLink>
      </div>
      <ul class="tools__list">
        <li v-for="(tool, index) in selectedTools" :key="tool.id" :class="`tools__item tools__item--${index + 1}`">
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
      <h2 id="close-title" class="close__title close__title--note t-display">I care about the moment someone says, “Oh. I get it now.”</h2>
      <p class="close__body">That is why I make this work. If you are trying to explain something important, I would genuinely like to hear about it.</p>
      <figure class="close__thread u-artifact-shift"><img :src="routeThreadArt" alt="A hand-drawn route connecting a service bell, instruction card, comic frame, pencil, and browser outline" loading="lazy" decoding="async" /></figure>
      <figure class="close__art u-paper-reveal"><img :src="eveningNoteArt" alt="A quiet evening desk with a notebook, service bell, pencil, and an open envelope" loading="lazy" decoding="async" /></figure>
      <a href="mailto:iamnaveenjose@outlook.com" class="ticket">Start a conversation <span aria-hidden="true">→</span></a>
    </section>
  </EdShell>
</template>

<style scoped>
/* Handcrafted homepage: changing visual chapters and asymmetric route fields replace repeated card treatments. */
.home-hero { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280rem, .8fr); gap: clamp(44rem, 9vw, 156rem); padding: clamp(72rem, 11vw, 172rem) 0 clamp(82rem, 12vw, 196rem); border-bottom: var(--stroke) solid var(--line); }
.home-hero__kicker, .close__kicker { margin: 0; color: var(--muted); }
.home-hero__kicker--arrival { animation: home-arrival 620ms var(--ease-out) both; }
.home-hero__title { max-width: 10ch; margin: 18rem 0 0; font-size: clamp(54rem, 8vw, 128rem); line-height: .92; letter-spacing: -.025em; word-spacing: .035em; }
.home-hero__title--ink { animation: home-ink 1080ms var(--ease-expo-out) 140ms both; }
.home-hero__copy { align-self: end; display: flex; flex-direction: column; align-items: flex-start; gap: 28rem; max-width: 39ch; padding-bottom: 5rem; animation: home-copy 760ms var(--ease-out) 280ms both; }
.home-hero__copy p { margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.65vw, 22rem); line-height: 1.6; }
.home-hero__art { grid-column: 1 / -1; height: clamp(260rem, 34vw, 510rem); margin: clamp(12rem, 2vw, 28rem) 0 0; overflow: hidden; border: var(--stroke) solid var(--line); background: var(--paper-2); }.home-hero__art img { display: block; width: 100%; height: 100%; object-fit: cover; animation: human-drift 14s var(--ease-in-out) both; }
@keyframes home-arrival { from { opacity: 0; transform: translateX(-10rem); letter-spacing: .18em; } to { opacity: 1; transform: none; } }
@keyframes home-ink { from { opacity: 0; clip-path: inset(0 100% 0 0); transform: translateY(16rem); } to { opacity: 1; clip-path: inset(0 0 0 0); transform: none; } }
@keyframes home-copy { from { opacity: 0; transform: translateY(14rem); } to { opacity: 1; transform: none; } }
@keyframes human-drift { from { transform: scale(1.035) translate3d(-.5%, 1%, 0); } to { transform: scale(1) translate3d(0, 0, 0); } }

.paths, .projects, .tools { position: relative; padding: clamp(84rem, 12vw, 188rem) 0; border-bottom: var(--stroke) solid var(--line); }
.section-intro { display: grid; grid-template-columns: minmax(0, 1fr) minmax(250rem, .56fr); gap: 28rem; align-items: end; margin-bottom: clamp(30rem, 5vw, 64rem); }
.section-intro--split { grid-template-columns: minmax(0, 1fr) auto; }
.section-intro__title { margin: 0; max-width: 15ch; font-size: clamp(42rem, 5vw, 72rem); line-height: .95; }
.section-intro__deck { max-width: 36ch; margin: 12rem 0 0; color: var(--muted); font-family: var(--font-reading); font-size: 18rem; line-height: 1.55; }
.section-intro > .section-intro__deck { margin: 0; }
.section-intro__link { align-self: end; color: var(--ink); font-weight: 700; white-space: nowrap; }
.section-intro__title--route { animation: route-title 880ms var(--ease-expo-out) both; }.section-intro__title--artifact { animation: artifact-title 880ms var(--ease-expo-out) both; }.section-intro__title--utility { animation: utility-title 760ms var(--ease-spring) both; }
@keyframes route-title { from { opacity: 0; transform: translateX(-18rem); clip-path: inset(0 100% 0 0); } to { opacity: 1; transform: none; clip-path: inset(0 0 0 0); } }
@keyframes artifact-title { from { opacity: 0; transform: translateY(14rem) rotate(-1deg); } to { opacity: 1; transform: none; } }
@keyframes utility-title { from { opacity: 0; transform: translateY(12rem) scale(.97); } to { opacity: 1; transform: none; } }

.paths__world { position: relative; z-index: 0; width: min(86%, 1030rem); margin: 0 0 clamp(-66rem, -5vw, -34rem) auto; height: clamp(170rem, 22vw, 330rem); overflow: hidden; border: var(--stroke) solid var(--line); background: var(--paper-2); }.paths__world img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; animation: world-field 16s var(--ease-in-out) both; }.paths__world-label { position: absolute; right: 18rem; bottom: 14rem; margin: 0; padding: 7rem 10rem; background: color-mix(in srgb, var(--paper) 88%, transparent); color: var(--ink); font-size: 11rem; letter-spacing: .06em; }
@keyframes world-field { from { transform: scale(1.04) translate3d(-.75%, 0, 0); } to { transform: scale(1) translate3d(0, 0, 0); } }

.paths__list { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); list-style: none; padding: 0; margin: 0; border-top: var(--stroke) solid var(--line); background: var(--paper); }.paths__list::before { content: ''; position: absolute; z-index: -1; width: 54%; height: 3rem; top: -2rem; left: 0; background: linear-gradient(90deg, var(--violet), var(--blue)); transform-origin: left; animation: atlas-route-line 1200ms var(--ease-expo-out) both; }
.path { min-width: 0; border-bottom: var(--stroke) solid var(--line); }
.path--1, .path--4 { grid-column: span 7; }.path--2, .path--3 { grid-column: span 5; }.path--1, .path--3 { border-right: var(--stroke) solid var(--line); }.path--2 { margin-top: 42rem; }.path--3 { margin-top: -18rem; }.path--4 { margin-top: 24rem; }
.path__link { display: grid; grid-template-columns: minmax(150rem, .76fr) minmax(0, 1.24fr); min-height: 238rem; color: var(--ink); }
.path__art { margin: 0; overflow: hidden; background: var(--paper-2); border-right: var(--stroke) solid var(--line); }
.path__art img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-mid) var(--ease-out); }
.path__copy { display: flex; flex-direction: column; align-items: flex-start; gap: 11rem; padding: clamp(20rem, 2.6vw, 32rem); }
.path__title { margin: 0; font-size: clamp(28rem, 3vw, 44rem); line-height: .98; }
.path__copy p { margin: 0; color: var(--muted); font-family: var(--font-reading); line-height: 1.5; }
.path__action { margin-top: auto; padding-top: 7rem; font-size: 14rem; font-weight: 750; }.path__action b { color: var(--blue); }
@media (hover: hover) { .path__link:hover { background: var(--paper-2); }.path__link:hover .path__art img { transform: scale(1.035); } }

.projects { background: linear-gradient(90deg, transparent 0 6%, var(--blue) 6% calc(6% + 3rem), transparent calc(6% + 3rem)); }.projects__grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: clamp(22rem, 3vw, 42rem); }.projects__item--1 { grid-column: span 8; }.projects__item--2 { grid-column: span 4; margin-top: clamp(46rem, 9vw, 132rem); }.projects__item--3 { grid-column: 4 / span 6; margin-top: clamp(-24rem, -2vw, -8rem); }
.tools__list { position: relative; list-style: none; margin: 0; padding: 0 0 0 clamp(22rem, 4vw, 56rem); border-top: var(--stroke) solid var(--line); }.tools__list::before { content: ''; position: absolute; left: 8rem; top: 0; bottom: 0; width: 3rem; background: linear-gradient(var(--violet), var(--blue)); transform-origin: top; animation: atlas-route-line 1200ms var(--ease-expo-out) both; }.tools__item { position: relative; }.tools__item::before { content: ''; position: absolute; left: clamp(-56rem, -4vw, -22rem); top: 31rem; width: 18rem; height: 18rem; border: 3rem solid var(--paper); border-radius: 50%; background: var(--blue); box-shadow: 0 0 0 2rem var(--ink); }.tools__item--2::before { background: var(--violet); }.tools__item--3::before { background: var(--yellow); }
.tool-row { display: grid; grid-template-columns: minmax(160rem, .72fr) minmax(0, 1.35fr) auto; gap: 20rem; align-items: baseline; padding: 24rem 0; color: var(--ink); border-bottom: var(--stroke) solid var(--line); transition: color var(--dur-fast) var(--ease-out), padding var(--dur-fast) var(--ease-out); }
.tool-row__name { font-size: clamp(28rem, 3vw, 42rem); line-height: 1; }.tool-row__dek { color: var(--muted); font-family: var(--font-reading); line-height: 1.5; }.tool-row__action { font-size: 14rem; font-weight: 750; white-space: nowrap; }.tool-row__action b { color: var(--blue); }
@media (hover: hover) { .tool-row:hover { padding-left: 10rem; color: var(--blue); } }

@keyframes atlas-route-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.close { max-width: 820rem; padding: clamp(96rem, 15vw, 240rem) 0 calc(clamp(96rem, 15vw, 230rem)); }
.close__title { max-width: 14ch; margin: 14rem 0 20rem; font-size: clamp(42rem, 5.8vw, 82rem); line-height: .96; }.close__body { max-width: 53ch; margin: 0 0 30rem; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.7vw, 21rem); line-height: 1.6; }
.close__title--note { animation: close-note 980ms var(--ease-expo-out) both; }@keyframes close-note { from { opacity: 0; transform: translateY(16rem); clip-path: inset(0 0 100% 0); } to { opacity: 1; transform: none; clip-path: inset(0 0 0 0); } }
.close__thread { width: min(100%, 720rem); margin: 0 0 38rem; overflow: hidden; border: var(--stroke) solid var(--line); background: var(--paper-2); }.close__thread img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
.close__art { width: min(100%, 620rem); margin: 0 0 30rem; overflow: hidden; border: var(--stroke) solid var(--line); background: var(--paper-2); }.close__art img { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; }

@media (max-width: 900px) { .home-hero { grid-template-columns: minmax(0, 1fr); gap: 42rem; }.home-hero__title { max-width: 11ch; }.projects__item--1 { grid-column: span 8; }.projects__item--2 { grid-column: span 4; }.projects__item--3 { grid-column: 3 / span 8; }.path--1, .path--2, .path--3, .path--4 { grid-column: span 6; }.path--2 { border-right: var(--stroke) solid var(--line); }.path--3 { border-right: 0; } }
@media (max-width: 660px) { .home-hero { padding-top: 58rem; }.home-hero__title { font-size: clamp(52rem, 15vw, 70rem); }.home-hero__art { height: auto; }.home-hero__art img { aspect-ratio: 4 / 3; object-fit: cover; }.paths, .projects, .tools { padding: 76rem 0; }.section-intro, .section-intro--split { grid-template-columns: minmax(0, 1fr); gap: 18rem; }.paths__world { width: 100%; margin-bottom: -24rem; height: 186rem; }.paths__world-label { right: 10rem; bottom: 10rem; }.paths__list, .projects__grid { grid-template-columns: minmax(0, 1fr); }.path--1, .path--2, .path--3, .path--4 { grid-column: 1; margin-top: 0; border-right: 0; }.path__link { min-height: 190rem; grid-template-columns: 39% 61%; }.path__copy { padding: 18rem; }.projects { background: linear-gradient(90deg, var(--blue) 0 3rem, transparent 3rem); }.projects__item--1, .projects__item--2, .projects__item--3 { grid-column: 1; margin-top: 0; }.tools__list { padding-left: 30rem; }.tools__list::before { left: 7rem; }.tools__item::before { left: -29rem; }.tool-row { grid-template-columns: minmax(0, 1fr) auto; gap: 8rem 16rem; }.tool-row__dek { grid-column: 1 / -1; }.tool-row__action { grid-column: 2; grid-row: 1; }.close__art img { aspect-ratio: 4 / 3; } }
@media (prefers-reduced-motion: reduce) { .home-hero__kicker--arrival, .home-hero__title--ink, .home-hero__copy, .home-hero__art img, .section-intro__title--route, .section-intro__title--artifact, .section-intro__title--utility, .paths__world img, .close__title--note, .paths__list::before, .tools__list::before { animation: none; }.path__art img, .tool-row { transition: none; } }
</style>
