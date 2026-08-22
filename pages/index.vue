<script setup lang="ts">
/**
 * Design contract — Paper Signal editorial homepage.
 * Hero first: clear point of view, one contextual scene, then a compact set of
 * choices. Every illustration explains a nearby subject; none is filler.
 */
import { ITEMS } from '~/content/editorial'

useSeoMeta({
  title: 'Entertrainer — Lessons, projects, and free tools by Naveen Jose',
  description: 'Naveen Jose makes lessons, projects, and small tools that make complicated work easier to understand.',
  ogTitle: 'Entertrainer — Lessons, projects, and free tools by Naveen Jose',
  ogDescription: 'Lessons, projects, and free tools that make complicated work easier to understand.',
  ogUrl: 'https://entertrainer.in/'
})

const routes = [
  { number: '01', title: 'Lessons', body: 'Learn how to write clearer instructions, understand AI, and design learning.', href: '/lessons', action: 'Explore lessons', visual: 'lesson' },
  { number: '02', title: 'Projects', body: 'Read courses, comics, and explainers made for workplace teams.', href: '/my-work', action: 'Browse projects', visual: 'project' },
  { number: '03', title: 'Free tools', body: 'Plan, write, and make quizzes with free browser tools.', href: '/tools', action: 'Open tools', visual: 'tool' }
] as const

const selectedWork = computed(() => ITEMS.filter(item => ['ai-atlas', 'sewa-chronicles'].includes(item.id)))
const workVisual: Record<string, 'process' | 'project'> = { 'ai-atlas': 'process', 'sewa-chronicles': 'project' }
const workImageFailed = ref<Record<string, boolean>>({})
const motionReady = ref(false)
const homeRoot = ref<HTMLElement | null>(null)
const heroTitle = ref<HTMLElement | null>(null)
const selectedTitle = ref<HTMLElement | null>(null)
const routeGrid = ref<HTMLElement | null>(null)
const workList = ref<HTMLElement | null>(null)
let disposeMotion: (() => void) | undefined

onMounted(async () => {
  requestAnimationFrame(() => { motionReady.value = true })
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const [{ gsap }, { ScrollTrigger }, splitModule] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('split-type')
  ])
  const SplitType = splitModule.default
  gsap.registerPlugin(ScrollTrigger)
  const splitInstances: InstanceType<typeof SplitType>[] = []
  const context = gsap.context(() => {
    const revealHeading = (element: HTMLElement | null) => {
      if (!element) return
      const split = new SplitType(element, { types: 'words' })
      splitInstances.push(split)
      gsap.from(split.words, {
        yPercent: 30,
        opacity: 0,
        duration: .6,
        ease: 'power3.out',
        stagger: .055,
        scrollTrigger: { trigger: element, start: 'top 84%', once: true }
      })
    }
    revealHeading(selectedTitle.value)

    if (routeGrid.value) gsap.from(routeGrid.value.children, {
      y: 20,
      opacity: 0,
      duration: .6,
      ease: 'power3.out',
      stagger: .08,
      scrollTrigger: { trigger: routeGrid.value, start: 'top 80%', once: true }
    })
    if (workList.value) gsap.from(workList.value.children, {
      y: 16,
      opacity: 0,
      duration: .6,
      ease: 'power3.out',
      stagger: .1,
      scrollTrigger: { trigger: workList.value, start: 'top 82%', once: true }
    })
  }, homeRoot)
  disposeMotion = () => { context.revert(); splitInstances.forEach(instance => instance.revert()) }
})

onBeforeUnmount(() => disposeMotion?.())
</script>

<template>
  <EdShell ref="homeRoot" width="wide" :class="{ 'home--motion-ready': motionReady }">
    <header class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__intro">
        <h1 id="home-title" ref="heroTitle" class="home-hero__title t-display" aria-label="I make complicated work easier to understand."><span class="home-hero__word" aria-hidden="true"><span>I make</span></span><span class="home-hero__word home-hero__word--accent" aria-hidden="true"><span>complicated</span></span><span class="home-hero__word" aria-hidden="true"><span>work easier</span></span><span class="home-hero__word" aria-hidden="true"><span>to understand.</span></span></h1>
        <p class="home-hero__deck"><span>Lessons, projects, and small tools for people who need a clearer way into difficult work.</span></p>
        <div class="home-hero__actions">
          <NuxtLink to="/instructional-design" class="ticket home-hero__primary">Start a short lesson <EdSignalIcon name="arrow" /></NuxtLink>
          <NuxtLink to="/my-work" class="home-hero__secondary">Browse my work</NuxtLink>
        </div>
      </div>

      <div class="home-hero__scene">
        <EdPaperSignal class="home-hero__art" variant="hero" label="Working notes, a clarified learning brief, and a useful browser tool assembled into one Paper Signal scene" />
      </div>
    </header>

    <section class="directions" aria-label="Explore Entertrainer">
      <ul ref="routeGrid" class="route-grid">
        <li v-for="(route, index) in routes" :key="route.title" :style="{ '--card-delay': `${index * 80}ms` }">
          <NuxtLink :to="route.href" class="route-card">
            <span class="route-card__top"><EdSignalIcon name="arrow" /></span>
            <EdPaperSignal class="route-card__art" :variant="route.visual" label="" />
            <span class="route-card__title t-display">{{ route.title }}</span>
            <span class="route-card__body">{{ route.body }}</span>
            <span class="route-card__action">{{ route.action }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="selected" aria-labelledby="selected-title">
      <div class="section-head section-head--split"><div><h2 id="selected-title" ref="selectedTitle" class="section-head__title t-display">Selected work</h2></div><NuxtLink to="/my-work" class="section-head__link">See all projects <EdSignalIcon name="arrow" /></NuxtLink></div>
      <ul ref="workList" class="work-list">
        <li v-for="item in selectedWork" :key="item.id">
          <NuxtLink :to="item.href" class="work-list__item">
            <span class="work-list__art"><img v-if="item.image && !workImageFailed[item.id]" :src="item.image" :alt="item.alt ?? ''" loading="lazy" @error="workImageFailed[item.id] = true" /><EdPaperSignal v-else :variant="workVisual[item.id]" label="" /></span>
            <span class="work-list__content"><span v-if="item.stamp" class="work-list__meta t-mono">{{ item.stamp }}</span><span class="work-list__title t-display">{{ item.title }}</span><span class="work-list__dek">{{ item.dek }}</span></span>
            <EdSignalIcon class="work-list__action" name="external" />
          </NuxtLink>
        </li>
      </ul>
    </section>
  </EdShell>
</template>

<style scoped>
/* Paper Signal homepage: editorial hierarchy, intentional whitespace, and one scene per proposition. */
.home-hero { position: relative; display: grid; grid-template-columns: minmax(0, .94fr) minmax(360rem, .86fr); column-gap: clamp(44rem, 8vw, 132rem); row-gap: 26rem; min-height: min(680rem, calc(100dvh - 76rem)); padding: clamp(62rem, 9vw, 132rem) 0 clamp(70rem, 9vw, 122rem); border-bottom: 1rem solid var(--line); }.home-hero__intro { align-self: center; max-width: 620rem; }.home-hero__kicker, .section-head__label { margin: 0; color: var(--muted); font-size: 11rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }.home-hero__title { max-width: 9ch; margin: 18rem 0 24rem; font-size: clamp(54rem, 6.45vw, 104rem); letter-spacing: -.045em; line-height: .89; }.home-hero__deck { max-width: 43ch; margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: clamp(18rem, 1.55vw, 22rem); line-height: 1.52; }.home-hero__actions { display:flex; align-items:center; flex-wrap:wrap; gap:24rem; margin-top:34rem; }.home-hero__primary { min-height: 52rem; padding-inline: 25rem; }.home-hero__primary :deep(.ps-icon), .section-head__link :deep(.ps-icon) { margin-left: 7rem; }.home-hero__secondary { color: var(--ink); font-size:16rem; font-weight:750; text-decoration: none; border-bottom:2rem solid var(--ink); padding-bottom: 3rem; }.home-hero__scene { align-self: center; min-width:0; }.home-hero__art { min-height: 0; aspect-ratio: 1.23; border: 1rem solid var(--signal-rule); box-shadow: 14rem 14rem 0 var(--signal-sheet); }.home-hero__caption { display:flex; align-items:center; gap:8rem; margin:16rem 0 0; color:var(--muted); font-size:10rem; letter-spacing:.04em; }.home-hero__caption span { display:block; width:28rem; height:2rem; background:var(--signal-cobalt); }.home-hero__index { grid-column: 1 / -1; display:grid; grid-template-columns: 1fr 2.08fr; gap:clamp(20rem, 5vw, 86rem); margin-top: clamp(6rem, 2vw, 24rem); padding-top: 18rem; border-top:1rem solid var(--line); }.home-hero__index p { margin:0; color:var(--muted); font-size:10rem; text-transform:uppercase; letter-spacing:.1em; }.home-hero__index ol { display:flex; gap:clamp(24rem, 6vw, 90rem); margin:0; padding:0; list-style:none; color:var(--ink); font-family:var(--font-reading); font-size:16rem; }.home-hero__index li::before { content: counter(list-item, decimal-leading-zero); margin-right:8rem; color:var(--signal-cobalt); font:700 10rem var(--font-mono); }

.directions, .selected { padding: clamp(70rem, 9vw, 128rem) 0; border-bottom:1rem solid var(--line); }.section-head { max-width:670rem; margin-bottom:clamp(34rem, 5vw, 62rem); }.section-head__title { max-width: 11ch; margin:13rem 0 0; font-size:clamp(42rem, 5vw, 76rem); letter-spacing:-.04em; line-height:.92; }.route-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:clamp(16rem, 2.4vw, 34rem); margin:0; padding:0; list-style:none; }.route-card { position:relative; display:flex; flex-direction:column; align-items:flex-start; min-height: 100%; padding:18rem 18rem 22rem; color:var(--ink); border:1rem solid var(--signal-rule); background:var(--paper); box-shadow: 0 0 0 0 var(--signal-sheet); text-decoration:none; transition: transform var(--dur-mid) var(--ease-expo-out), box-shadow var(--dur-mid) var(--ease-expo-out), border-color var(--dur-fast) var(--ease-out); }.route-card__top { display:flex; align-items:center; justify-content:space-between; width:100%; color:var(--muted); font-size:10rem; }.route-card__top :deep(.ps-icon) { color:var(--signal-cobalt); }.route-card__art { width:100%; min-height:154rem; margin:26rem 0 22rem; border:0; }.route-card__title { font-size:clamp(30rem, 3vw, 45rem); letter-spacing:-.035em; line-height:.95; }.route-card__body { margin-top:12rem; color:var(--muted); font-family:var(--font-reading); line-height:1.48; }.route-card__action { margin-top:auto; padding-top:22rem; color:var(--ink); font-size:13rem; font-weight:750; }.selected { padding-bottom: clamp(88rem, 11vw, 148rem); }.section-head--split { display:flex; align-items:end; justify-content:space-between; max-width:none; gap:30rem; }.section-head__link { display:inline-flex; align-items:center; color:var(--ink); font-size:15rem; font-weight:750; text-decoration:none; border-bottom:2rem solid var(--ink); padding-bottom:3rem; white-space:nowrap; }.work-list { margin:0; padding:0; list-style:none; border-top:1rem solid var(--signal-rule); }.work-list__item { display:grid; grid-template-columns:clamp(170rem, 20vw, 250rem) minmax(0, 1fr) 28rem; align-items:center; gap:clamp(22rem, 4vw, 62rem); padding:22rem 0; color:var(--ink); border-bottom:1rem solid var(--line); text-decoration:none; transition:padding var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out); }.work-list__art { min-height:150rem; border:0; }.work-list__content { display:flex; flex-direction:column; align-items:flex-start; }.work-list__meta { color:var(--muted); font-size:10rem; letter-spacing:.08em; }.work-list__title { margin-top:9rem; font-size:clamp(31rem, 3.5vw, 56rem); letter-spacing:-.04em; line-height:.92; }.work-list__dek { max-width:56ch; margin-top:13rem; color:var(--muted); font-family:var(--font-reading); line-height:1.5; }.work-list__action { color:var(--signal-cobalt); transition:transform var(--dur-fast) var(--ease-out); }

@media (hover:hover) { .route-card:hover { transform:translateY(-3rem); border-color:var(--ink); background:var(--signal-field); }.work-list__item:hover { padding-inline:10rem; background:var(--signal-field); }.work-list__item:hover .work-list__action { transform:translateX(5rem); } }.route-card:focus-visible, .work-list__item:focus-visible, .home-hero__secondary:focus-visible, .section-head__link:focus-visible { outline:3rem solid var(--focus); outline-offset:4rem; }

@keyframes home-copy-enter { from { opacity:0; transform:translate3d(0, 18rem, 0); } to { opacity:1; transform:none; } } @keyframes home-art-enter { from { opacity:0; transform:translate3d(18rem, 12rem, 0) scale(.98); } to { opacity:1; transform:none; } }
.home-hero__kicker { animation:home-copy-enter 420ms var(--ease-out) both; }.home-hero__title { animation:home-copy-enter 720ms var(--ease-expo-out) 90ms both; }.home-hero__deck { animation:home-copy-enter 560ms var(--ease-out) 180ms both; }.home-hero__actions { animation:home-copy-enter 520ms var(--ease-out) 250ms both; }.home-hero__scene { animation:home-art-enter 760ms var(--ease-expo-out) 140ms both; }

@media (max-width:850px) { .home-hero { grid-template-columns:1fr; min-height:auto; gap:42rem; }.home-hero__intro { max-width:680rem; }.home-hero__scene { width:min(100%, 660rem); }.home-hero__index { grid-template-columns:1fr; gap:14rem; }.route-grid { gap:14rem; }.route-card { padding:15rem 15rem 19rem; }.route-card__art { min-height:120rem; margin:20rem 0 18rem; }.work-list__item { grid-template-columns:190rem minmax(0, 1fr) 24rem; gap:26rem; } }
@media (max-width:600px) { .home-hero { padding-top:45rem; padding-bottom:58rem; gap:38rem; }.home-hero__kicker { font-size:10rem; }.home-hero__title { max-width:8.8ch; margin-top:15rem; font-size:clamp(51rem, 14.4vw, 70rem); line-height:.9; }.home-hero__deck { max-width:31ch; font-size:19rem; line-height:1.48; }.home-hero__actions { gap:20rem; margin-top:30rem; }.home-hero__primary { min-height:50rem; padding-inline:21rem; }.home-hero__secondary { font-size:15rem; }.home-hero__art { aspect-ratio:1.18; box-shadow:9rem 9rem 0 var(--signal-sheet); }.home-hero__caption { max-width:26ch; line-height:1.45; }.home-hero__index { display:none; }.directions, .selected { padding:62rem 0; }.section-head { margin-bottom:30rem; }.section-head__title { font-size:46rem; }.route-grid { grid-template-columns:1fr; gap:13rem; }.route-card { display:grid; grid-template-columns:106rem minmax(0, 1fr); column-gap:16rem; min-height:0; padding:15rem; }.route-card__top { grid-column:1/-1; }.route-card__art { grid-column:1; grid-row:2/span 3; min-height:94rem; margin:18rem 0 0; }.route-card__title { grid-column:2; margin-top:20rem; font-size:33rem; }.route-card__body { grid-column:2; margin-top:8rem; font-size:15rem; }.route-card__action { grid-column:2; margin-top:0; padding-top:14rem; }.section-head--split { align-items:flex-start; flex-direction:column; gap:20rem; }.work-list__item { grid-template-columns:108rem minmax(0, 1fr) 20rem; gap:14rem; padding:18rem 0; }.work-list__art { min-height:102rem; }.work-list__title { font-size:34rem; }.work-list__dek { margin-top:8rem; font-size:15rem; }.work-list__action { grid-column:3; grid-row:1; } }
@media (max-width:480px) { .route-card { grid-template-columns:1fr; row-gap:0; }.route-card__top, .route-card__art, .route-card__title, .route-card__body, .route-card__action { grid-column:1; }.route-card__art { grid-row:auto; min-height:140rem; margin:16rem 0 0; }.route-card__title { margin-top:20rem; }.route-card__body { margin-top:8rem; }.route-card__action { margin-top:0; padding-top:16rem; } }
@media (prefers-reduced-motion:reduce) { .home-hero__kicker, .home-hero__title, .home-hero__deck, .home-hero__actions, .home-hero__scene { animation:none; }.route-card, .work-list__item, .work-list__action { transition:background 150ms linear, border-color 150ms linear, color 150ms linear; } }

/* Editorial showcase motion: text leads the page; artwork supports it. */
.home-hero__title { position:relative; max-width:10ch; }.home-hero__word { display:block; overflow:hidden; padding:0 8rem 5rem 0; }.home-hero__word > span, .home-hero__deck > span { display:block; }.home-hero__word--accent { color:var(--signal-cobalt); }.home-hero__title::after { content:''; position:absolute; right:-5rem; bottom:10rem; width:10rem; height:10rem; background:var(--signal-cobalt); transform:scale(0) rotate(45deg); }.home-hero__deck { overflow:hidden; }.work-list__art { display:block; min-height:150rem; overflow:hidden; border:1rem solid var(--signal-rule); background:var(--signal-field); box-shadow:7rem 7rem 0 var(--signal-sheet); }.work-list__art :deep(.ps-art), .work-list__art > img { display:block; width:100%; height:100%; min-height:150rem; object-fit:cover; }.work-list__art > img { filter:saturate(.94) contrast(1.02); transition:transform var(--dur-slow) var(--ease-expo-out); }
@keyframes home-word-reveal { from { opacity:0; transform:translate3d(0, 112%, 0); } to { opacity:1; transform:none; } } @keyframes home-title-mark { from { transform:scale(0) rotate(45deg); } to { transform:scale(1) rotate(45deg); } }
.home--motion-ready .home-hero__title { animation:none; }.home--motion-ready .home-hero__word > span { animation:home-word-reveal 760ms var(--ease-expo-out) both; }.home--motion-ready .home-hero__word:nth-child(1) > span { animation-delay:60ms; }.home--motion-ready .home-hero__word:nth-child(2) > span { animation-delay:145ms; }.home--motion-ready .home-hero__word:nth-child(3) > span { animation-delay:230ms; }.home--motion-ready .home-hero__word:nth-child(4) > span { animation-delay:315ms; }.home--motion-ready .home-hero__title::after { animation:home-title-mark 440ms var(--ease-expo-out) 800ms both; }.home--motion-ready .home-hero__deck { animation:none; }.home--motion-ready .home-hero__deck > span { animation:home-copy-enter 560ms var(--ease-out) 410ms both; }@media (hover:hover) { .work-list__item:hover .work-list__art > img { transform:scale(1.035); } }
@media (max-width:600px) { .work-list__art, .work-list__art :deep(.ps-art), .work-list__art > img { min-height:102rem; } }.home--motion-ready .home-hero__kicker, .home--motion-ready .home-hero__actions, .home--motion-ready .home-hero__scene { will-change:transform, opacity; }@media (prefers-reduced-motion:reduce) { .home-hero__word > span, .home-hero__title::after, .home-hero__deck > span { animation:none !important; transform:none !important; opacity:1 !important; }.work-list__art > img { transition:none; } }
</style>
