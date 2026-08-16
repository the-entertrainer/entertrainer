<script setup lang="ts">
import { ITEMS } from '~/content/editorial'

/**
 * Design intent: an editorial field guide, not an archive dashboard.
 * Every section answers one visitor question in sequence: what this is,
 * where to go, what proves the claim, which tool can help, and who made it.
 * Paper, ink, thin rules, restrained category colour, and purposeful imagery
 * remain the visual vocabulary across this page.
 */
useSeoMeta({
  title: 'Entertrainer — I make complicated things easier to learn',
  description: 'Naveen Jose makes lessons, useful tools, and clear explanations for people who need to understand complicated things.',
  ogTitle: 'Entertrainer — I make complicated things easier to learn',
  ogDescription: 'Lessons, useful tools, and clear explanations by Naveen Jose.',
  ogUrl: 'https://entertrainer.in/'
})

const pathways = [
  {
    number: '01', label: 'Try a lesson', title: 'Try a short lesson',
    body: 'Spend four minutes with a tricky instruction and see how a few small changes make it easier to follow.',
    href: '/instructional-design', action: 'Try the lesson', accent: 'var(--blue)',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/idMdUldTgLmROPkp.jpg', icon: 'practice'
  },
  {
    number: '02', label: 'Things I made', title: 'See the work',
    body: 'Open a comic, a course, or an interactive explainer I made for real people with real jobs to do.',
    href: '/my-work', action: 'See what I made', accent: 'var(--red)',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/JGRlAfvUmoOLfMks.jpg', icon: 'projects'
  },
  {
    number: '03', label: 'Free tools', title: 'Save yourself some time',
    body: 'Use a few small browser tools I built after getting tired of doing the same slow jobs by hand.',
    href: '/tools', action: 'Use a free tool', accent: 'var(--green)',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/arGfHThKMakIOmAy.jpg', icon: 'tools'
  },
  {
    number: '04', label: 'About me', title: 'How I ended up here',
    body: 'Follow the route from hotel floors to making learning for people around the world.',
    href: '/about', action: 'Read my story', accent: 'var(--purple)',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/qAPWGwOScgDPspmw.jpg', icon: 'story'
  }
]

const selectedWork = computed(() => ITEMS.filter(item => ['sewa-chronicles', 'ai-atlas', 'strong'].includes(item.id)))
const tools = computed(() => ITEMS.filter(item => item.category === 'tools'))
</script>

<template>
  <EdShell width="wide">
    <EdIssueStrip note="I make complicated things easier to learn." />

    <header class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__intro">
        <p class="home-hero__eyebrow t-mono"><span aria-hidden="true"></span> Hello, I’m Naveen.</p>
        <h1 id="home-title" class="home-hero__title t-display">I make complicated things <em>click.</em></h1>
      </div>
      <div class="home-hero__copy">
        <p>I started out on hotel floors, where the best explanation was the one that helped someone get through a busy shift. Now I make lessons, useful little tools, and clear explanations for people who have complicated things to understand.</p>
        <NuxtLink to="/instructional-design" class="ticket">Try a four-minute lesson <span aria-hidden="true">→</span></NuxtLink>
      </div>
    </header>

    <section class="routes" aria-labelledby="routes-title">
      <div class="section-head">
        <div>
          <p class="section-head__label t-mono">Start wherever you like</p>
          <h2 id="routes-title" class="section-head__title t-display">What would you like to see?</h2>
        </div>
        <p class="section-head__deck">You do not need to work in training to look around. Pick the thing that sounds interesting and I will take it from there.</p>
      </div>
      <ol class="routes__grid">
        <li v-for="route in pathways" :key="route.label" class="route" :style="{ '--route': route.accent }">
          <NuxtLink :to="route.href" class="route__link">
            <div class="route__meta t-mono"><span>{{ route.number }}</span><span>{{ route.label }}</span></div>
            <figure class="route__art">
              <img :src="route.image" alt="" loading="eager" decoding="async" />
              <span class="route__icon" aria-hidden="true">
                <svg v-if="route.icon === 'practice'" viewBox="0 0 32 32" fill="none"><path d="M6 8.5h20v15H6zM10 12h8M10 16h12M10 20h5"/><path d="m22 22 4 4"/></svg>
                <svg v-else-if="route.icon === 'projects'" viewBox="0 0 32 32" fill="none"><path d="M6 7h20v18H6zM10 11h12M10 15h12M10 19h7"/><path d="M8 7V5h16v2"/></svg>
                <svg v-else-if="route.icon === 'tools'" viewBox="0 0 32 32" fill="none"><path d="M7 7h18v18H7zM12 12h3v3h-3zM17 12h3v3h-3zM12 17h3v3h-3zM17 17h3v3h-3z"/></svg>
                <svg v-else viewBox="0 0 32 32" fill="none"><path d="M16 26s9-5.3 9-12.1A5.4 5.4 0 0 0 16 10a5.4 5.4 0 0 0-9 3.9C7 20.7 16 26 16 26Z"/><path d="M12 15h8"/></svg>
              </span>
            </figure>
            <div class="route__body">
              <h3 class="route__title t-display">{{ route.title }}</h3>
              <p>{{ route.body }}</p>
              <span class="route__action">{{ route.action }} <b aria-hidden="true">→</b></span>
            </div>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <section class="proof" aria-labelledby="proof-title">
      <div class="section-head section-head--split">
        <div>
          <p class="section-head__label t-mono">A few things I’m proud of</p>
          <h2 id="proof-title" class="section-head__title t-display">Things people could actually use.</h2>
        </div>
        <NuxtLink to="/my-work" class="section-head__link u-underline">See more things I made <span aria-hidden="true">→</span></NuxtLink>
      </div>
      <div class="proof__grid">
        <EdCard v-for="(item, index) in selectedWork" :key="item.id" :item="item" :index="index" variant="standard" />
      </div>
    </section>

    <section class="toolkit" aria-labelledby="toolkit-title">
      <div class="toolkit__heading">
        <p class="section-head__label t-mono">Free little tools</p>
        <h2 id="toolkit-title" class="toolkit__title t-display">The boring bits, made quicker.</h2>
        <p>I made these after losing too many afternoons to the same repetitive jobs. No sign-up. What you type stays in your browser.</p>
        <NuxtLink to="/tools" class="ticket ticket--ghost">See all the free tools <span aria-hidden="true">→</span></NuxtLink>
      </div>
      <ul class="toolkit__list">
        <li v-for="(tool, index) in tools" :key="tool.id">
          <NuxtLink :to="tool.href" class="tool-row">
            <span class="tool-row__number t-mono">0{{ index + 1 }}</span>
            <span class="tool-row__name t-display">{{ tool.title }}</span>
            <span class="tool-row__dek">{{ tool.dek }}</span>
            <span class="tool-row__arrow" aria-hidden="true">↗</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="close" aria-labelledby="close-title">
      <div class="close__mark" aria-hidden="true"><span></span><span></span><span></span></div>
      <p class="close__label t-mono">A little more about me</p>
      <h2 id="close-title" class="close__title t-display">I like the moment someone says, “Oh. I get it now.”</h2>
      <p class="close__body">That is why I make this work. If you are trying to explain something important, or you have a learning problem that is getting in the way, I would genuinely like to hear about it.</p>
      <div class="close__actions">
        <NuxtLink to="/about" class="ticket ticket--ghost">A little more about me</NuxtLink>
        <a href="mailto:iamnaveenjose@outlook.com" class="close__email u-underline">Start a conversation <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </EdShell>
</template>

<style scoped>
/* Design intent reminder: hierarchy through reading order, rules, paper
   surfaces, and imagery—not component abundance or decorative chrome. */
.home-hero { display: grid; grid-template-columns: minmax(0, 1.28fr) minmax(280rem, .72fr); gap: clamp(32rem, 7vw, 112rem); padding: clamp(40rem, 7vw, 92rem) 0 clamp(48rem, 8vw, 112rem); border-bottom: var(--stroke) solid var(--line); }
.home-hero__eyebrow, .section-head__label, .close__label { margin: 0; color: var(--muted); }
.home-hero__eyebrow { display: flex; align-items: center; gap: 8rem; }.home-hero__eyebrow span { width: 8rem; height: 8rem; background: var(--red); border-radius: 50%; }
.home-hero__title { max-width: 9.3ch; margin: clamp(18rem, 3vw, 32rem) 0 0; font-size: clamp(56rem, 8.4vw, 132rem); line-height: .91; letter-spacing: -.055em; }.home-hero__title em { font-style: normal; color: var(--blue); }
.home-hero__copy { align-self: end; display: grid; gap: 24rem; max-width: 40ch; padding-bottom: 5rem; }.home-hero__copy p { margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.65vw, 22rem); line-height: 1.58; }
.routes, .proof { padding: clamp(52rem, 8vw, 116rem) 0; border-bottom: var(--stroke) solid var(--line); }
.section-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240rem, .52fr); gap: 24rem; align-items: end; margin-bottom: clamp(28rem, 4vw, 52rem); }.section-head--split { grid-template-columns: minmax(0, 1fr) auto; }.section-head__title { margin: 10rem 0 0; max-width: 12ch; font-size: clamp(38rem, 4.6vw, 66rem); line-height: .98; }.section-head__deck { margin: 0; max-width: 37ch; color: var(--muted); font-family: var(--font-reading); font-size: 18rem; line-height: 1.55; }.section-head__link { color: var(--ink); font-weight: 650; white-space: nowrap; }
.routes__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(16rem, 2vw, 28rem); list-style: none; margin: 0; padding: 0; }.route { min-width: 0; }.route__link { display: grid; grid-template-columns: minmax(0, .94fr) minmax(220rem, 1.06fr); height: 100%; color: var(--ink); background: var(--paper); border: var(--stroke) solid var(--line); transition: border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }.route__link:hover { border-color: var(--ink); transform: translateY(-3rem); box-shadow: 5rem 5rem 0 var(--line); }.route__meta { grid-column: 1 / -1; display: flex; justify-content: space-between; padding: 11rem 14rem; border-bottom: var(--stroke) solid var(--line); color: var(--muted); }
.route__art { position: relative; min-height: 210rem; margin: 0; overflow: hidden; background: var(--paper-2); border-right: var(--stroke) solid var(--line); }.route__art::after { content: ''; position: absolute; inset: 0; background: linear-gradient(145deg, color-mix(in srgb, var(--route) 15%, transparent), transparent 58%); pointer-events: none; }.route__art img { width: 100%; height: 100%; object-fit: cover; display: block; }.route__icon { position: absolute; z-index: 1; left: 14rem; bottom: 14rem; display: grid; place-items: center; width: 42rem; height: 42rem; border: var(--stroke) solid var(--ink); background: var(--paper); color: var(--ink); }.route__icon svg { width: 24rem; height: 24rem; stroke: currentColor; stroke-width: 1.7; }
.route__body { display: flex; flex-direction: column; align-items: flex-start; gap: 12rem; padding: 22rem; }.route__title { margin: 0; font-size: clamp(26rem, 2.6vw, 39rem); line-height: .98; }.route__body p { margin: 0; color: var(--muted); font-family: var(--font-reading); line-height: 1.5; }.route__action { margin-top: auto; padding-top: 10rem; font-size: 14rem; font-weight: 700; }.route__action b { margin-left: 5rem; color: var(--route); }
.proof__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(16rem, 2vw, 26rem); }
.toolkit { display: grid; grid-template-columns: minmax(260rem, .72fr) minmax(0, 1.28fr); gap: clamp(32rem, 6vw, 96rem); padding: clamp(58rem, 9vw, 126rem) 0; border-bottom: var(--stroke) solid var(--line); }.toolkit__heading { display: flex; flex-direction: column; align-items: flex-start; gap: 18rem; }.toolkit__title { margin: 0; font-size: clamp(42rem, 5vw, 72rem); line-height: .94; }.toolkit__heading p:not(.section-head__label) { margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: 18rem; line-height: 1.55; max-width: 30ch; }.toolkit__list { list-style: none; margin: 0; padding: 0; border-top: var(--stroke) solid var(--line); }.tool-row { display: grid; grid-template-columns: 52rem minmax(120rem, .7fr) minmax(180rem, 1.3fr) 22rem; gap: 14rem; align-items: baseline; padding: 20rem 0; color: var(--ink); border-bottom: var(--stroke) solid var(--line); transition: padding var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }.tool-row:hover { padding-left: 10rem; color: var(--blue); }.tool-row__number { color: var(--muted); }.tool-row__name { font-size: clamp(26rem, 2.8vw, 38rem); line-height: 1; }.tool-row__dek { color: var(--muted); font-family: var(--font-reading); line-height: 1.45; }.tool-row__arrow { text-align: right; font-size: 20rem; }
.close { position: relative; display: grid; justify-items: start; max-width: 760rem; padding: clamp(58rem, 10vw, 140rem) 0 clamp(72rem, 11vw, 154rem); }.close__mark { display: flex; gap: 5rem; margin-bottom: 22rem; }.close__mark span { width: 12rem; height: 12rem; border: var(--stroke) solid var(--ink); background: var(--paper); }.close__mark span:nth-child(1) { background: var(--yellow); }.close__mark span:nth-child(2) { background: var(--blue); }.close__mark span:nth-child(3) { background: var(--red); }.close__title { max-width: 13ch; margin: 12rem 0 18rem; font-size: clamp(42rem, 5.8vw, 82rem); line-height: .96; }.close__body { max-width: 54ch; margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.65vw, 21rem); line-height: 1.6; }.close__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 18rem; margin-top: 28rem; }.close__email { color: var(--ink); font-weight: 700; }
@media (max-width: 900px) { .home-hero, .toolkit { grid-template-columns: minmax(0, 1fr); }.home-hero { gap: 28rem; }.home-hero__title { max-width: 10.5ch; }.proof__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 660px) { .home-hero { padding-top: 34rem; }.home-hero__title { font-size: clamp(52rem, 16vw, 68rem); }.section-head, .section-head--split { grid-template-columns: minmax(0, 1fr); }.section-head--split { gap: 18rem; }.routes__grid, .proof__grid { grid-template-columns: minmax(0, 1fr); }.route__link { grid-template-columns: 42% 58%; }.route__art { min-height: 185rem; }.route__body { padding: 18rem; }.tool-row { grid-template-columns: 38rem minmax(0, 1fr) 22rem; gap: 8rem; }.tool-row__dek { grid-column: 2 / 4; grid-row: 2; }.tool-row__arrow { grid-column: 3; grid-row: 1; } }
@media (prefers-reduced-motion: reduce) { .route__link, .tool-row { transition: none; } }
</style>
