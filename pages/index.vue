<script setup lang="ts">
/**
 * The front page. Dawn Press: a broadsheet at sunrise.
 *
 * Structure kept from the owner's home: the rotating knowledge quote as the
 * H1, its attribution, the four route rows (Elevate, Empower, Engage, About
 * me) with info toggles, then the footer. What is new: the page uses the
 * whole desktop width, the quote sets in line by line over a hairline Flower
 * of Life, and the sun moves to whichever route you point at while a preview
 * of that section slides in beside it. A "this issue" strip under the routes
 * is built only from existing data.
 */
import { KNOWLEDGE_QUOTES, pickKnowledgeQuote } from '~/content/knowledge-quotes'
import { BLOG_POSTS } from '~/content/blogs'
import { normalizeElevateCategory } from '~/content/elevate-categories'
import { ITEMS } from '~/content/editorial'

useSeoMeta({
  title: 'Entertrainer · Elevate, Empower, Engage',
  description: 'Stories for questions that keep returning, tools for work that keeps repeating, and small games for short detours.',
  ogTitle: 'Entertrainer · The Three Es',
  ogDescription: 'Elevate, Empower, Engage.',
  ogUrl: 'https://entertrainer.in/'
})

type HomeRoute = { name: string; href: string; tip?: string; no: string }

const routes: HomeRoute[] = [
  { no: '01', name: 'Elevate', href: '/elevate', tip: 'Essays that start in a room and refuse the tidy story.' },
  { no: '02', name: 'Empower', href: '/empower', tip: 'Free tools for work that keeps repeating.' },
  { no: '03', name: 'Engage', href: '/engage', tip: 'Short games and little detours.' },
  { no: '04', name: 'About me', href: '/about' }
]

/* ── Data for the previews and the issue strip (existing content only) ── */
const published = BLOG_POSTS.filter(p => p.status === 'published')
const latest = [...published].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))[0]!
const latestCat = normalizeElevateCategory(latest.category)
const aboutItem = ITEMS.find(i => i.id === 'about')
const tools = [
  { name: 'EasyMCQ', href: '/tools/easymcq', icon: '/easymcq-icon.svg', line: 'Three believable wrong options' },
  { name: 'Draftly', href: '/tools/better-emails', icon: '/draftly-icon.svg', line: 'A rough email, made clear' }
]
const studio = [
  { name: 'Cadence', icon: '/cadence-icon.svg' },
  { name: 'StoryGen', icon: '/storygen-icon.svg' }
]
const games = ['Stack', 'The Mind Reader', 'AstroClock']

/* ── Route rows, tips and the moving sun ── */
const openTip = ref<string | null>(null)
const hovered = ref(0)
const tipId = (name: string) => `home-tip-${name.toLowerCase().replace(/\s+/g, '-')}`

const toggleTip = (name: string, i: number, event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  openTip.value = openTip.value === name ? null : name
  hovered.value = i
}
const closeTip = () => { openTip.value = null }
const onDocPointer = (event: Event) => {
  const target = event.target as Element | null
  if (!target?.closest?.('[data-route-tip]')) closeTip()
}
const onKeydown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeTip() }

const list = ref<HTMLElement | null>(null)
/** Sun offset from the top of the switchboard, centred on the lit row's name. */
const sunY = ref<number | null>(null)
function placeSun() {
  const li = list.value?.children[hovered.value] as HTMLElement | undefined
  const name = li?.querySelector('.home__route-name') as HTMLElement | null
  const board = list.value?.parentElement
  if (!li || !name || !board) return
  const b = board.getBoundingClientRect()
  const n = name.getBoundingClientRect()
  const sun = board.querySelector('.home__sun-track') as HTMLElement | null
  const size = sun?.offsetWidth ?? 76
  sunY.value = Math.round(n.top - b.top + n.height / 2 - size / 2)
}
function point(i: number) {
  if (hovered.value === i) return
  hovered.value = i
  nextTick(placeSun)
  playPress('tap')
}

/* ── The quote: SSR-stable first, then one pick per visit ── */
const quote = ref(KNOWLEDGE_QUOTES[0] ?? { text: '', attribution: '' })
const quoteReady = ref(false)
const quoteSize = computed(() => {
  const n = quote.value.text.length
  return n <= 34 ? 'xl' : n <= 72 ? 'l' : 'm'
})
const refreshQuote = () => {
  quote.value = pickKnowledgeQuote()
  quoteReady.value = true
}
const onVisibility = () => { if (document.visibilityState === 'visible') refreshQuote() }

/* ── Motion ── */
const root = ref<HTMLElement | null>(null)
const headline = ref<HTMLElement | null>(null)
const { run } = useMotion(root)
const preloaderActive = useState<boolean>('dp-preloader', () => false)
const handoff = useState<{ rings: { x: number; y: number; width: number; height: number } | null; word: { x: number; y: number; width: number; height: number } | null } | null>('dp-handoff', () => null)
let played = false

function flipFrom(el: Element | null, from: { x: number; y: number; width: number; height: number } | null, gsap: typeof import('gsap')['gsap'], k: number) {
  if (!el || !from) return
  const to = el.getBoundingClientRect()
  if (!to.width) return
  const s = from.width / to.width
  gsap.from(el, {
    x: from.x + from.width / 2 - (to.x + to.width / 2),
    y: from.y + from.height / 2 - (to.y + to.height / 2),
    scale: s,
    transformOrigin: '50% 50%',
    duration: 1.4 * k,
    ease: 'ink',
    clearProps: 'transform'
  })
}

function playEntrance() {
  if (played || preloaderActive.value) return
  played = true
  const h = handoff.value
  handoff.value = null
  void run((m) => {
    const { gsap, k } = m
    const tl = gsap.timeline({ defaults: { ease: 'ink' } })
    const rings = root.value?.querySelectorAll('.home__flower .fg__ring') ?? []
    if (h?.rings) {
      // The ident ends; its rings become the front page's construction grid.
      flipFrom(root.value?.querySelector('.home__flower') ?? null, h.rings, gsap, k)
      flipFrom(document.querySelector('.mh__brand .wm__mark'), h.word ? { ...h.word, width: h.word.height, x: h.word.x } : null, gsap, k)
    } else {
      tl.add(m.drawPath(rings, { duration: 1.6 * k, stagger: 0.045 * k }), 0)
    }
    const lines = headline.value ? m.splitLines(headline.value, { duration: 1 * k }) : null
    if (lines) tl.add(lines, 0.15 * k)
    tl.add(m.inkReveal('.home__attribution, .home__dateline > *', { y: 8 * m.d }), 0.55 * k)
    tl.add(m.drawRule('.home__rule'), 0.5 * k)
    tl.add(m.inkReveal('.home__route-name', { yPercent: 40 * m.d, y: 0, stagger: 0.07 * k }), 0.6 * k)
    tl.add(m.inkReveal('.home__route-no, .home__route-tip', { y: 6 * m.d, stagger: 0.05 * k }), 0.8 * k)
    tl.add(m.stampIn('.home__sun'), 0.9 * k)
    if (!m.late) tl.add(gsap.from('.home__preview', { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)', duration: 0.9 * k, clearProps: 'clipPath,opacity,visibility' }), 0.95 * k)
    // The issue strip develops as it scrolls in.
    m.ScrollTrigger.batch('.home__issue-card', {
      start: 'top 85%',
      once: true,
      onEnter: (els) => { m.inkReveal(els, { y: 21 * m.d, stagger: 0.07 * k }) }
    })
  })
}

watch(preloaderActive, (on) => { if (!on) nextTick(() => { placeSun(); playEntrance() }) })

onMounted(() => {
  refreshQuote()
  document.addEventListener('visibilitychange', onVisibility)
  document.addEventListener('pointerdown', onDocPointer)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', placeSun, { passive: true })
  nextTick(() => { placeSun(); playEntrance() })
  void (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(placeSun)
})
onActivated(() => { refreshQuote(); closeTip() })
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', placeSun)
})

const counts = `${published.length} essays · ${tools.length + studio.length} tools · ${games.length} games`
</script>

<template>
  <div ref="root" class="home">
    <div class="home__paper" aria-hidden="true">
      <EdFlowerGrid class="home__flower" />
    </div>

    <p class="home__dateline">
      <span>The Entertrainer</span>
      <span class="home__dateline-mid">Elevate · Empower · Engage</span>
      <span>{{ counts }}</span>
    </p>

    <header class="home__intro">
      <h1 ref="headline" class="home__headline" :class="[`home__headline--${quoteSize}`, { 'is-ready': quoteReady }]">
        <span class="home__quote">{{ quote.text }}</span>
      </h1>
      <p v-if="quote.attribution" class="home__attribution">{{ quote.attribution }}</p>
    </header>

    <div class="home__grid">
      <nav class="home__switchboard" aria-label="Entertrainer sections">
        <span class="home__rule dp-rule" aria-hidden="true" />
        <span class="home__sun-track" aria-hidden="true" :style="sunY !== null ? { transform: `translateY(${sunY}px)` } : undefined"><span class="home__sun dp-sun" /></span>
        <ol ref="list" class="home__routes">
          <li
            v-for="(route, i) in routes"
            :key="route.href"
            class="home__route"
            :class="{ 'is-open': openTip === route.name, 'is-lit': hovered === i }"
            @pointerenter="point(i)"
            @focusin="point(i)"
          >
            <div class="home__card">
              <NuxtLink :to="route.href" class="home__link">
                <span class="home__route-no" aria-hidden="true">{{ route.no }}</span>
                <strong class="home__route-name">{{ route.name }}</strong>
                <span v-if="route.tip" class="home__route-tip">{{ route.tip }}</span>
                <span class="home__route-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M14 6l6 6-6 6" /></svg>
                </span>
              </NuxtLink>
              <button
                v-if="route.tip"
                type="button"
                class="home__info u-icon-btn u-icon-btn--idle"
                data-route-tip
                :aria-expanded="openTip === route.name"
                :aria-controls="tipId(route.name)"
                :aria-label="`About ${route.name}`"
                @click="toggleTip(route.name, i, $event)"
              >
                <span aria-hidden="true">i</span>
              </button>
            </div>
            <Transition name="route-tip">
              <div
                v-if="route.tip && openTip === route.name"
                :id="tipId(route.name)"
                class="home__tip"
                data-route-tip
                role="note"
              >
                <p>{{ route.tip }}</p>
                <p v-if="i === 0" class="home__tip-more">Latest: <NuxtLink :to="`/elevate/${latest.slug}`">{{ latest.title }}</NuxtLink></p>
                <p v-else-if="i === 1" class="home__tip-more">{{ tools.map(t => t.name).join(', ') }}, plus {{ studio.map(s => s.name).join(' and ') }}</p>
                <p v-else-if="i === 2" class="home__tip-more">{{ games.join(', ') }}</p>
              </div>
            </Transition>
          </li>
        </ol>
      </nav>

      <!-- Desktop preview: decorative mirror of what each row leads to. The
           rows and the issue strip carry the same information as text. -->
      <aside class="home__preview" aria-hidden="true">
        <div class="home__pane" :class="{ 'is-on': hovered === 0 }">
          <p class="home__pane-kicker">Latest essay · {{ latestCat }} · {{ latest.minutes }} min</p>
          <div class="home__pane-art"><EdEditorialImage :src="latest.hero" alt="" /></div>
          <p class="home__pane-title">{{ latest.title }}</p>
          <p class="home__pane-dek">{{ latest.dek }}</p>
        </div>
        <div class="home__pane" :class="{ 'is-on': hovered === 1 }">
          <p class="home__pane-kicker">On the workbench</p>
          <ul class="home__tools">
            <li v-for="t in tools" :key="t.name" class="home__tool">
              <span class="home__tool-icon"><EdEditorialImage :src="t.icon" alt="" /></span>
              <span><strong>{{ t.name }}</strong><span>{{ t.line }}</span></span>
            </li>
          </ul>
          <p class="home__pane-kicker home__pane-kicker--sub">Studio</p>
          <ul class="home__studio">
            <li v-for="s in studio" :key="s.name"><span class="home__tool-icon home__tool-icon--sm"><EdEditorialImage :src="s.icon" alt="" /></span>{{ s.name }}</li>
          </ul>
        </div>
        <div class="home__pane" :class="{ 'is-on': hovered === 2 }">
          <p class="home__pane-kicker">Now playing · Stack</p>
          <div class="home__stack">
            <span v-for="n in 6" :key="n" class="home__block" :style="{ '--n': n }" />
          </div>
          <p class="home__pane-dek">{{ games.join(' · ') }}</p>
        </div>
        <div class="home__pane" :class="{ 'is-on': hovered === 3 }">
          <p class="home__pane-kicker">About Naveen</p>
          <div class="home__pane-art home__pane-art--portrait"><EdEditorialImage src="/about/naveen-portrait.jpg" alt="" /></div>
          <p class="home__pane-title">{{ aboutItem?.title }}</p>
        </div>
      </aside>
    </div>

    <section class="home__issue" aria-labelledby="issue-title">
      <h2 id="issue-title" class="dp-kicker">In this issue</h2>
      <ul class="home__issue-list">
        <li class="home__issue-card">
          <NuxtLink :to="`/elevate/${latest.slug}`" class="home__issue-link">
            <span class="home__issue-kind">Read · {{ latest.minutes }} min</span>
            <strong>{{ latest.title }}</strong>
            <span class="home__issue-dek">{{ latest.dek }}</span>
          </NuxtLink>
        </li>
        <li class="home__issue-card">
          <NuxtLink to="/tools/easymcq" class="home__issue-link">
            <span class="home__issue-kind">Use · free</span>
            <strong>EasyMCQ</strong>
            <span class="home__issue-dek">Give the question and the right answer. Get three wrong options that still sound believable.</span>
          </NuxtLink>
        </li>
        <li class="home__issue-card">
          <NuxtLink to="/engage/stack" class="home__issue-link">
            <span class="home__issue-kind">Play · one tap</span>
            <strong>Stack</strong>
            <span class="home__issue-dek">Tap to drop. Only the overlap stays.</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  max-width: var(--shell-max);
  margin: 0 auto;
  padding: var(--space-21) var(--shell-gutter) var(--space-55);
  isolation: isolate;
}
@media (min-width: 1024px) {
  .home { padding-left: var(--space-34); padding-right: var(--space-34); }
}

/* The construction grid sits behind the quote, top right, in hairline ink. */
.home__paper { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.home__flower {
  position: absolute;
  top: -40rem;
  right: -120rem;
  width: min(760rem, 70vw);
  color: color-mix(in srgb, var(--ink) 28%, transparent);
}
@media (max-width: 780px) {
  .home__flower { top: 10rem; right: -45%; width: 120vw; color: color-mix(in srgb, var(--ink) 16%, transparent); }
}

.home__dateline {
  display: flex;
  justify-content: space-between;
  gap: var(--space-13);
  margin: 0 0 var(--space-34);
  padding: var(--space-8) 0;
  border-top: 3px solid var(--ink);
  border-bottom: var(--stroke) solid var(--ink);
  font: 500 var(--type-meta)/1.3 var(--font-mono);
  letter-spacing: var(--tracking-meta);
  text-transform: uppercase;
  color: var(--ink);
}
@media (max-width: 780px) { .home__dateline-mid { display: none; } }
@media (max-width: 420px) { .home__dateline { flex-direction: column; gap: 2rem; } }

.home__intro { max-width: none; }
.home__headline {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-variation-settings: "opsz" 144, "SOFT" 30, "WONK" 0;
  line-height: .9;
  letter-spacing: -.035em;
  color: var(--ink);
  text-wrap: balance;
}
.home__headline--xl { font-size: var(--type-front); max-width: 9.5em; }
.home__headline--l { font-size: clamp(44px, 6.4vw, 112px); line-height: .94; }
.home__headline--m { font-size: clamp(34px, 4.6vw, 76px); line-height: 1; }
.home__headline--l, .home__headline--m { max-width: 20ch; }

.home__attribution {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  margin: var(--space-21) 0 0;
  font: 500 var(--type-meta)/1.35 var(--font-mono);
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--muted);
}
.home__attribution::before { content: ''; width: 34rem; height: 1px; background: var(--ink); }

.home__grid {
  display: grid;
  gap: var(--space-34);
  margin-top: var(--space-55);
}
@media (min-width: 1024px) {
  .home__grid { grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: var(--space-55); align-items: start; }
}

/* ── Route rows: the four sections in display type ── */
.home__switchboard { position: relative; }
.home__rule { border-top-width: 2px; }
.home__routes { position: relative; list-style: none; margin: 0; padding: 0; }
.home__route { position: relative; }
.home__card { position: relative; border-bottom: var(--stroke) solid var(--ink); }
.home__link {
  position: relative;
  display: grid;
  grid-template-columns: 44rem minmax(0, auto) minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--space-13);
  min-height: 88rem;
  padding: var(--space-13) 56rem var(--space-13) 0;
  color: var(--ink);
  text-decoration: none;
}
.home__route-no {
  align-self: start;
  margin-top: .9em;
  font: 500 var(--type-meta)/1 var(--font-mono);
  letter-spacing: .08em;
  color: var(--muted);
}
.home__route-name {
  position: relative;
  z-index: 1;
  font: 400 clamp(44px, 5.8vw, 92px)/.95 var(--font-display);
  font-variation-settings: "opsz" 144, "SOFT" 40, "WONK" 1;
  letter-spacing: -.035em;
  white-space: nowrap;
  transition: transform var(--dur-mid) var(--ease-ink), font-variation-settings var(--dur-slow) var(--ease-ink);
}
.home__route-tip {
  justify-self: start;
  max-width: 26ch;
  font: 400 15px/1.35 var(--font-reading);
  color: var(--muted);
  opacity: 0;
  transform: translateX(-8rem);
  transition: opacity var(--dur-mid) var(--ease-ink), transform var(--dur-mid) var(--ease-ink);
}
.home__route-arrow {
  position: absolute; right: 8rem; top: 50%;
  color: var(--ink);
  opacity: 0;
  transform: translate(-12rem, -50%);
  transition: opacity var(--dur-fast) var(--ease-out), transform var(--dur-mid) var(--ease-ink);
}
.home__route.is-lit .home__route-name { transform: translateX(var(--space-13)); font-variation-settings: "opsz" 144, "SOFT" 100, "WONK" 1; }
.home__route.is-lit .home__route-tip { opacity: 1; transform: none; }
.home__route.is-lit .home__route-arrow { opacity: 1; transform: translate(0, -50%); }
.home__route.is-lit .home__route-no { color: var(--ink); }

/* The sun rides to the lit row, behind its first letter. */
.home__sun-track {
  --sun-size: 76rem;
  position: absolute;
  left: 30rem;
  top: 0;
  z-index: 0;
  width: var(--sun-size);
  height: var(--sun-size);
  transform: translateY(8rem);
  transition: transform var(--dur-slow) var(--ease-sun);
  pointer-events: none;
}
.home__sun { position: absolute; inset: 0; width: 100%; }

.home__link:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }

.home__info {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 2;
  display: none;
  place-items: center;
  width: 30rem;
  height: 30rem;
  margin: 0;
  padding: 0;
  border: var(--stroke) solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
  color: var(--ink);
  font: 500 var(--type-meta)/1 var(--font-mono);
  cursor: pointer;
  transform: translateY(-50%);
}
.home__info::before { content: ''; position: absolute; inset: -8rem; }
.home__info:hover, .home__route.is-open .home__info { background: var(--accent); }

.home__tip {
  margin: 0 0 var(--space-13);
  padding: var(--space-13) var(--space-21);
  border: var(--stroke) solid var(--ink);
  background: var(--accent);
  color: var(--accent-ink);
  font: 400 var(--type-body)/1.45 var(--font-ui);
}
.home__tip p { margin: 0; }
.home__tip-more { margin-top: 6rem !important; font: 500 13px/1.4 var(--font-mono) !important; }
.home__tip-more a { text-decoration: underline; text-underline-offset: 3px; }

.route-tip-enter-active, .route-tip-leave-active { transition: opacity 160ms var(--ease-out), transform 220ms var(--ease-stamp); }
.route-tip-enter-from, .route-tip-leave-to { opacity: 0; transform: translateY(-4rem); }

/* Touch and narrow: the info button is how you preview a section. */
@media (hover: none), (max-width: 1023px) {
  .home__info { display: inline-grid; }
  .home__route-tip, .home__route-arrow { display: none; }
  .home__link { grid-template-columns: 34rem minmax(0, 1fr); }
  .home__route.is-lit .home__route-name { transform: none; }
}
@media (max-width: 780px) {
  .home__link { min-height: 72rem; }
  .home__route-name { font-size: clamp(38px, 11vw, 56px); }
  .home__sun-track { --sun-size: 58rem; left: 18rem; }
}

/* ── Preview panel (desktop) ── */
.home__preview { display: none; }
@media (min-width: 1024px) and (hover: hover) {
  .home__preview {
    position: sticky;
    top: calc(var(--nav-h) + var(--space-21));
    display: grid;
    min-height: 420rem;
    border: var(--stroke) solid var(--ink);
    border-radius: var(--radius-m);
    background: var(--paper);
    box-shadow: 8rem 8rem 0 color-mix(in srgb, var(--ink) 10%, transparent);
    overflow: hidden;
  }
}
.home__pane {
  grid-area: 1 / 1;
  display: flex; flex-direction: column; gap: var(--space-13);
  padding: var(--space-21);
  opacity: 0;
  visibility: hidden;
  transform: translateY(var(--off-13));
  transition: opacity var(--dur-mid) var(--ease-ink), transform var(--dur-slow) var(--ease-ink), visibility 0s linear var(--dur-mid);
}
.home__pane.is-on { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.home__pane-kicker {
  margin: 0;
  font: 500 var(--type-meta)/1.3 var(--font-mono);
  letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
}
.home__pane-kicker--sub { margin-top: var(--space-8); }
.home__pane-art {
  aspect-ratio: var(--crop);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  overflow: hidden;
  background: var(--paper-2);
}
.home__pane-art :deep(img) { object-fit: cover; }
.home__pane-art--portrait { aspect-ratio: 4 / 3; }
.home__pane-art--portrait :deep(img) { object-position: 50% 25%; filter: grayscale(.25) contrast(1.05); }
.home__pane-title { margin: 0; font: 500 26px/1.1 var(--font-display); letter-spacing: -.02em; }
.home__pane-dek { margin: 0; font: 400 15px/1.45 var(--font-reading); color: var(--muted); }

.home__tools, .home__studio { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-13); }
.home__tool { display: grid; grid-template-columns: 56rem 1fr; gap: var(--space-13); align-items: center; padding: var(--space-8); border: var(--stroke) solid var(--line); border-radius: var(--radius-s); }
.home__tool strong { display: block; font: 500 20px/1.1 var(--font-display); }
.home__tool span span { display: block; font-size: 14px; color: var(--muted); }
.home__tool-icon { display: block; width: 56rem; height: 56rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); overflow: hidden; }
.home__tool-icon--sm { width: 34rem; height: 34rem; display: inline-block; vertical-align: middle; margin-right: 10rem; }
.home__studio { grid-template-columns: 1fr 1fr; }
.home__studio li { font: 500 17px/1 var(--font-display); }

/* Stack attract mode: six slabs drop and trim, forever, in pure CSS. */
.home__stack { position: relative; height: 230rem; border-bottom: 2px solid var(--ink); overflow: hidden; }
.home__block {
  --w: calc(78% - var(--n) * 6%);
  position: absolute;
  left: calc(50% - var(--w) / 2 + (var(--n) - 3) * 1.5%);
  bottom: calc((var(--n) - 1) * 30rem);
  width: var(--w);
  height: 28rem;
  border: 1.5px solid var(--ink);
  background: var(--accent);
  animation: home-drop 6s var(--ease-stamp) infinite;
  animation-delay: calc(var(--n) * .6s);
}
.home__block:nth-child(even) { background: var(--paper); }
@keyframes home-drop {
  0% { transform: translate(-120%, -260rem); opacity: 0; }
  8% { opacity: 1; }
  14%, 86% { transform: none; opacity: 1; }
  96%, 100% { transform: translateY(40rem); opacity: 0; }
}

/* ── In this issue ── */
.home__issue { margin-top: var(--space-89); }
.home__issue-list {
  list-style: none; margin: var(--space-13) 0 0; padding: 0;
  display: grid; gap: 0;
  border-top: 2px solid var(--ink);
}
@media (min-width: 780px) { .home__issue-list { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.home__issue-card { border-bottom: var(--stroke) solid var(--ink); }
@media (min-width: 780px) {
  .home__issue-card + .home__issue-card { border-left: var(--stroke) solid var(--ink); }
}
.home__issue-link {
  display: grid; gap: var(--space-8); align-content: start;
  height: 100%;
  padding: var(--space-21);
  transition: background var(--dur-fast) var(--ease-out);
}
@media (min-width: 780px) { .home__issue-card:first-child .home__issue-link { padding-left: 0; } }
@media (hover: hover) { .home__issue-link:hover { background: color-mix(in srgb, var(--accent) 22%, transparent); } }
.home__issue-kind { font: 500 var(--type-meta)/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--accent-text); }
.home__issue-link strong { font: 500 26px/1.1 var(--font-display); letter-spacing: -.02em; }
.home__issue-dek { font: 400 15px/1.45 var(--font-reading); color: var(--muted); }

@media (prefers-reduced-motion: reduce) {
  .home__route-name, .home__route-tip, .home__route-arrow, .home__sun-track, .home__pane,
  .route-tip-enter-active, .route-tip-leave-active { transition: none; }
  .home__block { animation: none; }
  .route-tip-enter-from, .route-tip-leave-to { opacity: 1; transform: none; }
}
:global(html[data-reduce-motion="on"]) .home__route-name,
:global(html[data-reduce-motion="on"]) .home__route-tip,
:global(html[data-reduce-motion="on"]) .home__route-arrow,
:global(html[data-reduce-motion="on"]) .home__sun-track,
:global(html[data-reduce-motion="on"]) .home__pane { transition: none; }
:global(html[data-reduce-motion="on"]) .home__block { animation: none; }
</style>
