<script setup lang="ts">
/**
 * The front page.
 *
 * 1. Hero: a Vedic verse, headline-size, over a rising sun.
 *    On scroll the sun climbs (desktop, motion on).
 * 2. Manifesto: Naveen's line from the very first About page, lit word by word.
 * 3. The Three Es: a pinned horizontal run on desktop: Elevate (paper),
 *    Empower (ink), Engage (sun). Stacked on small screens.
 * 4. The person: portrait develops, one paragraph, a link to the long route.
 */
import { BLOG_POSTS } from '~/content/blogs'
import { APPS, GAMES } from '~/content/family'

useSeoMeta({
  title: 'Entertrainer',
  description: 'Naveen Jose designs learning people actually remember. Essays, free apps for trainers, and small games about how we learn.',
  ogTitle: 'Entertrainer',
  ogDescription: 'If it does not hold attention, it cannot teach. Essays, apps and games by Naveen Jose.',
  ogUrl: 'https://entertrainer.in/'
})

const published = BLOG_POSTS.filter(p => p.status === 'published')
const essays = [...published].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)).slice(0, 3)
const MANIFESTO = 'Entertrainer is not a typo. It’s a manifesto. If it doesn’t hold attention, it can’t transfer knowledge.'
const words = MANIFESTO.split(' ')

const root = ref<HTMLElement | null>(null)
const { run } = useMotion(root)
const preloaderActive = useState<boolean>('dp-preloader', () => false)
const handoff = useState<{ rings: { x: number; y: number; width: number; height: number } | null; word: { x: number; y: number; width: number; height: number } | null } | null>('dp-handoff', () => null)
let played = false

function play() {
  if (played || preloaderActive.value) return
  played = true
  const h = handoff.value
  handoff.value = null
  void run((m) => {
    const { gsap, ScrollTrigger, k, d } = m
    const desk = window.matchMedia('(min-width: 1024px)').matches

    /* Entrance */
    if (!m.late) {
      const tl = gsap.timeline({ defaults: { ease: 'ink' } })
      tl.from('.hx__quote', { autoAlpha: 0, y: 24 * d, duration: 1.2 * k, clearProps: 'all' }, 0.15)
      tl.from('.hx__meta > *, .hx__foot > *', { autoAlpha: 0, y: 12 * d, duration: 0.7 * k, stagger: 0.05 * k, clearProps: 'all' }, 0.45 * k)
      const sun = root.value?.querySelector('.hx__sun')
      if (h?.rings && sun) {
        const to = sun.getBoundingClientRect()
        gsap.from(sun, { x: h.rings.x + h.rings.width / 2 - (to.x + to.width / 2), y: h.rings.y + h.rings.height / 2 - (to.y + to.height / 2), scale: h.rings.width / to.width, duration: 1.4 * k, ease: 'ink', clearProps: 'transform' })
      } else {
        tl.from('.hx__sun', { yPercent: 60 * d, scale: 0.6, duration: 1.6 * k, ease: 'sun', clearProps: 'transform' }, 0)
      }
    }

    if (m.level !== 'full') return

    /* 1. Hero scrub: the sun climbs and grows behind the verse. */
    if (desk) {
      gsap.timeline({ scrollTrigger: { trigger: '.hx', start: 'top top', end: 'bottom top', scrub: 0.6 } })
        .to('.hx__sun-track', { yPercent: -28, scale: 1.25, ease: 'none' }, 0)
        .to('.hx__meta, .hx__foot', { autoAlpha: 0, ease: 'none', duration: 0.3 }, 0)
    }

    /* 2. Manifesto: each word lights up as it passes. */
    gsap.fromTo('.mf__w', { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: '.mf__text', start: 'top 80%', end: 'bottom 45%', scrub: true }
    })
    gsap.from('.mf__sun', { scale: 0.3, scrollTrigger: { trigger: '.mf', start: 'top bottom', end: 'bottom top', scrub: true } })

    /* 3. Three Es: horizontal run on desktop. */
    if (desk) {
      const track = root.value?.querySelector('.es__track') as HTMLElement | null
      if (track) {
        const dist = () => track.scrollWidth - window.innerWidth
        const run = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: '.es', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 }
        })
        gsap.utils.toArray<HTMLElement>('.es__panel').forEach((p) => {
          gsap.from(p.querySelectorAll('.es__big > span'), { yPercent: 100, ease: 'ink', duration: 1 * k, scrollTrigger: { trigger: p, containerAnimation: run, start: 'left 75%' } })
          gsap.from(p.querySelectorAll('.es__item'), { autoAlpha: 0, x: 60, ease: 'ink', duration: 0.9 * k, stagger: 0.08, clearProps: 'all', scrollTrigger: { trigger: p, containerAnimation: run, start: 'left 55%' } })
        })
      }
    } else {
      ScrollTrigger.batch('.es__item', { start: 'top 90%', once: true, onEnter: (els) => { gsap.from(els, { autoAlpha: 0, y: 30, stagger: 0.08, duration: 0.8 * k, ease: 'ink', clearProps: 'all' }) } })
    }

    /* 4. The person: portrait wipes open, name rises. */
    gsap.from('.me__photo', { clipPath: 'inset(100% 0 0 0)', ease: 'none', scrollTrigger: { trigger: '.me', start: 'top 85%', end: 'top 25%', scrub: true } })
    gsap.from('.me__photo-in', { scale: 1.3, ease: 'none', scrollTrigger: { trigger: '.me', start: 'top bottom', end: 'bottom top', scrub: true } })
    gsap.from('.me__name > span', { yPercent: 105, duration: 1.1 * k, ease: 'ink', scrollTrigger: { trigger: '.me__name', start: 'top 85%' } })
  })
}

watch(preloaderActive, (on) => { if (!on) nextTick(play) })
onMounted(() => nextTick(play))
</script>

<template>
  <div ref="root" class="home">
    <!-- 1 · The sun, and a verse -->
    <section class="hx br-stage" aria-labelledby="hx-title">
      <div class="hx__stick">
        <div class="hx__meta br-meta">
          <span>Naveen Jose</span>
          <span>Instructional designer</span>
          <span class="hx__meta-r">Essays · Apps · Games</span>
        </div>
        <div class="hx__sun-track"><BrandSun class="hx__sun" /></div>
        <h1 id="hx-title" class="sr-only">Entertrainer</h1>
        <BrandSunQuote class="hx__quote" />
        <div class="hx__foot">
          <p class="hx__lede">Learning people actually remember. Built by a hotel kid who found out training works better when it feels like a story.</p>
          <span class="br-meta hx__scroll" aria-hidden="true">Scroll <i /></span>
        </div>
      </div>
    </section>

    <!-- 2 · Manifesto -->
    <section class="mf" aria-label="Manifesto">
      <BrandSun class="mf__sun" :intensity="1.6" />
      <p class="mf__kicker br-meta">From the first About page, 2026</p>
      <p class="mf__text br-display"><span v-for="(w, i) in words" :key="i" class="mf__w">{{ w }}</span></p>
      <p class="mf__sig br-meta">Naveen Jose · Entertrainer</p>
    </section>

    <!-- 3 · The Three Es -->
    <section class="es" aria-label="The three Es">
      <div class="es__track">
        <article class="es__panel es__panel--elevate">
          <header class="es__head">
            <span class="br-meta">01 / 03 · Read</span>
            <h2 class="es__big br-display br-mask"><span>Elevate</span></h2>
            <p class="es__deck">Essays that start in a room and refuse the tidy story.</p>
          </header>
          <ol class="es__list">
            <li v-for="p in essays" :key="p.slug" class="es__item">
              <NuxtLink :to="`/elevate/${p.slug}`" class="es__essay" data-cursor="Read">
                <span class="es__thumb"><img :src="p.hero" :alt="p.heroAlt" loading="lazy" decoding="async"></span>
                <span class="es__essay-t">{{ p.title }}</span>
                <span class="br-meta">{{ p.minutes }} min</span>
              </NuxtLink>
            </li>
          </ol>
          <NuxtLink to="/elevate" class="es__all">All essays <span aria-hidden="true">→</span></NuxtLink>
        </article>

        <article class="es__panel es__panel--empower">
          <header class="es__head">
            <span class="br-meta">02 / 03 · Make</span>
            <h2 class="es__big br-display br-mask"><span>Empower</span></h2>
            <p class="es__deck">Free apps for the people who train other people.</p>
          </header>
          <ul class="es__list">
            <li v-for="a in APPS" :key="a.id" class="es__item">
              <NuxtLink :to="a.href" class="es__member" data-cursor="Open">
                <BrandMark :id="a.id" :size="56" />
                <span class="es__member-name br-display">{{ a.name }}</span>
                <span class="es__member-line">{{ a.line }}</span>
              </NuxtLink>
            </li>
          </ul>
          <NuxtLink to="/empower" class="es__all">All apps <span aria-hidden="true">→</span></NuxtLink>
        </article>

        <article class="es__panel es__panel--engage">
          <header class="es__head">
            <span class="br-meta">03 / 03 · Play</span>
            <h2 class="es__big br-display br-mask"><span>Engage</span></h2>
            <p class="es__deck">Small games about how we learn. A minute each.</p>
          </header>
          <ul class="es__list">
            <li v-for="g in GAMES" :key="g.id" class="es__item">
              <NuxtLink :to="g.href" class="es__member" data-cursor="Play">
                <BrandMark :id="g.id" :size="56" tone="ink" />
                <span class="es__member-name br-display">{{ g.name }}</span>
                <span class="es__member-line">{{ g.line }}</span>
              </NuxtLink>
            </li>
          </ul>
          <NuxtLink to="/engage" class="es__all">All games <span aria-hidden="true">→</span></NuxtLink>
        </article>
      </div>
    </section>

    <!-- 4 · The person -->
    <section class="me" aria-labelledby="me-name">
      <div class="me__photo"><div class="me__photo-in"><img src="/about/naveen-portrait.jpg" alt="Naveen Jose" loading="lazy" decoding="async"></div></div>
      <div class="me__copy">
        <p class="br-meta">The person behind it</p>
        <h2 id="me-name" class="me__name br-display br-mask"><span>Hi, I’m Naveen.</span></h2>
        <p class="me__lede">Born in hospitality. Hardwired for storytelling. Certified in instructional design.</p>
        <p class="me__body">It started with comic books. At Club Mahindra I was meant to do training the usual way, and made The SEWA Chronicles instead: service values as characters, scenes and stakes. Engagement went up. I have been chasing that feeling ever since.</p>
        <NuxtLink to="/about" class="fx-btn" data-cursor="Read">The longer route</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { overflow-x: clip; }

/* 1 · Hero */
.hx { position: relative; }
@media (min-width: 1024px) { .hx { height: 180vh; } .hx__stick { position: sticky; top: 0; } }
.hx__stick { height: 100svh; min-height: 560px; display: grid; grid-template-rows: auto 1fr auto; padding: 96px var(--hub-gutter) 28px; position: relative; overflow: hidden; }
.hx__meta { display: flex; gap: 24px; justify-content: space-between; position: relative; z-index: 2; border-top: 3px solid var(--ink); padding-top: 10px; }
.hx__meta-r { margin-left: auto; }
@media (max-width: 640px) { .hx__meta span:nth-child(2) { display: none; } }
.hx__sun-track { position: absolute; left: 50%; top: 52%; width: min(64vw, 68vh); translate: -50% -50%; z-index: 0; will-change: transform; }
.hx__quote { position: relative; z-index: 1; align-self: center; justify-self: center; width: min(640px, 86vw); margin: 0; }
.hx__foot { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
.hx__lede { max-width: 34ch; margin: 0; font: 400 clamp(17px, 1.4vw, 21px)/1.4 var(--font-ui); }
.hx__scroll { display: inline-flex; align-items: center; gap: 10px; flex-shrink: 0; }
.hx__scroll i { width: 1px; height: 44px; background: var(--ink); transform-origin: top; animation: hx-drip 2.2s var(--br-ease-io) infinite; }
@keyframes hx-drip { 0% { transform: scaleY(0); } 50% { transform: scaleY(1); transform-origin: top; } 51% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }
@media (max-width: 760px) {
  .hx__stick { height: auto; min-height: calc(100svh - 52px - 84px); padding-top: 20px; padding-bottom: 20px; gap: 18px; }
  .hx__sun-track { width: min(92vw, 70vh); top: 46%; }
  .hx__quote { width: min(100%, 86vw); }
  .hx__foot { flex-direction: column; align-items: stretch; }
  .hx__scroll { display: none; }
}

/* 2 · Manifesto */
.mf { position: relative; background: var(--br-dusk); color: var(--br-paper); padding: clamp(96px, 16vw, 240px) var(--hub-gutter); overflow: hidden; isolation: isolate; }
.mf__sun { position: absolute; width: min(60vw, 820px); right: -14vw; bottom: -30%; z-index: -1; opacity: .95; }
.mf__kicker { color: var(--br-sun); margin: 0 0 28px; }
.mf__text { font-size: clamp(40px, 6.4vw, 118px); line-height: .98; letter-spacing: -.035em; max-width: 15em; margin: 0; }
.mf__w { display: inline-block; margin-right: .22em; }
.mf__sig { margin: 40px 0 0; opacity: .6; }

/* 3 · Three Es */
.es { position: relative; }
.es__track { display: grid; }
.es__panel { position: relative; padding: clamp(56px, 8vw, 120px) var(--hub-gutter); display: grid; gap: 28px; align-content: start; }
.es__panel--elevate { background: var(--br-paper); color: var(--br-ink); }
.es__panel--empower { background: var(--br-ink); color: var(--br-paper); }
.es__panel--engage { background: var(--br-sun); color: var(--br-ink); }
.es__big { font-size: var(--br-giant); margin: 10px 0 0; }
.es__deck { font: 400 clamp(20px, 2vw, 28px)/1.25 var(--font-display); max-width: 24ch; margin: 18px 0 0; }
.es__list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0; }
.es__item { border-top: 1px solid color-mix(in srgb, currentColor 25%, transparent); }
.es__essay { display: grid; grid-template-columns: 96px 1fr auto; gap: 18px; align-items: center; padding: 14px 0; color: inherit; text-decoration: none; }
.es__thumb { width: 96px; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 8px; background: var(--paper-3); }
.es__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1) contrast(1.05); transition: filter .5s, transform .8s var(--br-ease); }
.es__essay:hover .es__thumb img { filter: none; transform: scale(1.06); }
.es__essay-t { font: 400 clamp(20px, 1.9vw, 28px)/1.1 var(--font-display); letter-spacing: -.015em; }
.es__member { display: grid; grid-template-columns: 56px auto 1fr; gap: 20px; align-items: center; padding: 16px 0; color: inherit; text-decoration: none; }
.es__member-name { font-size: clamp(40px, 4.4vw, 72px); transition: transform .5s var(--br-ease); }
.es__member:hover .es__member-name { transform: translateX(10px); }
.es__member-line { opacity: .75; max-width: 30ch; justify-self: end; text-align: right; }
.es__all { justify-self: start; color: inherit; font: 600 15px/1 var(--font-ui); text-decoration: none; border-bottom: 2px solid currentColor; padding-bottom: 4px; }
.es__all span { display: inline-block; transition: transform .4s var(--br-ease); }
.es__all:hover span { transform: translateX(6px); }
@media (max-width: 640px) {
  .es__member { grid-template-columns: 48px 1fr; gap: 6px 16px; }
  .es__member-line { grid-column: 2; justify-self: start; text-align: left; }
  .es__essay { grid-template-columns: 72px 1fr; }
  .es__essay .br-meta { display: none; }
  .es__thumb { width: 72px; }
}
@media (min-width: 1024px) {
  .es { height: 100vh; overflow: hidden; }
  .es__track { display: flex; height: 100%; width: max-content; }
  .es__panel { width: 82vw; height: 100%; grid-template-columns: 1fr 1fr; align-content: center; column-gap: 6vw; padding-top: 110px; }
  .es__panel--engage { width: 100vw; }
  .es__head { grid-row: 1 / 3; align-self: center; }
  .es__list { align-self: end; }
  .es__all { grid-column: 2; }
}

/* 4 · Person */
.me { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: clamp(28px, 6vw, 96px); align-items: center; padding: clamp(80px, 12vw, 180px) var(--hub-gutter); }
.me__photo { aspect-ratio: 4 / 5; overflow: hidden; border-radius: 4px; background: var(--paper-3); }
.me__photo-in, .me__photo img { width: 100%; height: 100%; }
.me__photo img { object-fit: cover; display: block; filter: grayscale(.25) contrast(1.05); }
.me__name { font-size: var(--br-big); margin: 14px 0 22px; }
.me__lede { font: 400 clamp(22px, 2vw, 30px)/1.25 var(--font-display); margin: 0 0 18px; max-width: 26ch; }
.me__body { max-width: 52ch; margin: 0 0 30px; font-size: 18px; line-height: 1.6; color: var(--gray-500); }
@media (max-width: 760px) { .me { grid-template-columns: 1fr; } .me__photo { max-width: 420px; } }

@media (prefers-reduced-motion: reduce) { .hx__scroll i { animation: none; } }
html[data-reduce-motion="on"] .hx__scroll i { animation: none; }
</style>
