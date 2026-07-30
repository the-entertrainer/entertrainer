<script setup lang="ts">
// The SEWA Chronicles — a broadsheet case study. Halftone carries the comic
// pages in the gallery grid (screening a comic through a dot pattern is, if
// anything, more honest than a filter — that's how comics were printed for
// most of the last century); the lightbox shows the real, full-colour art
// when a reader wants to actually read a page.
definePageMeta({ layout: false, pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'The SEWA Chronicles — service-culture comics for Club Mahindra · Naveen Jose',
  description: 'A case study of The SEWA Chronicles: a comic magazine by Naveen Jose that teaches Club Mahindra hospitality teams the SEWA service values through true guest-service stories.',
  ogTitle: 'The SEWA Chronicles — a case study',
  ogDescription: 'A service-culture comic magazine that teaches hospitality values through true stories from the resort floor.',
  ogUrl: 'https://entertrainer.in/my-work/sewa-chronicles',
  ogImage: 'https://entertrainer.in/work/sewa/cover.webp'
})
const R = useReveal()

interface Beat { n: string; h: string; body: string }
const beats: Beat[] = [
  { n: '01', h: 'The problem', body: 'Service values usually live in a slide deck that nobody remembers. But hospitality is made of small human moments, and a resort team spread across the country needs those values to feel real, not like a poster in the back office.' },
  { n: '02', h: 'The idea', body: 'Turn real guest-service moments into a comic. Each issue collects true stories of SEWA Champions — the housekeepers, front-office and food-and-beverage staff who went out of their way for a member — and draws them as short strips. People remember a story long after they forget a rule.' },
  { n: '03', h: 'How it is built to teach', body: 'Story over instruction: every value is shown happening, not described. Each strip names the real employee and resort, so good service is something to be seen doing. Every story is tagged with one named behaviour, so teams build a shared vocabulary — and a submission page keeps the next issue writing itself.' },
  { n: '04', h: 'My part', body: 'I made it end to end: gathering the stories, writing and storyboarding each strip, illustrating the characters, and laying out the issue. It is the clearest example of how I like to design learning — warm, specific, and built around a real human moment.' }
]

interface Page { src: string; alt: string; cap: string; tag: string }
const pages: Page[] = [
  { src: 'cover', tag: 'Volume 1', cap: 'Cover', alt: 'The SEWA Chronicles cover: four resort staff around the title, calling out Service, Empathy, Warmth and Attentiveness.' },
  { src: 'extra-mile', tag: 'Going the Extra Mile', cap: 'Come Back to the Resort', alt: "Comic strip: a member's car breaks down on the highway, and the front office arranges another car to bring him back to the resort." },
  { src: 'colors-in-the-rain', tag: 'Creative Restlessness', cap: 'Colors in the Rain', alt: 'Comic strip: staff hand out colourful umbrellas on a grey, rainy day, and guests share photos of them.' },
  { src: 'open-sesame', tag: 'Can Do, Will Do', cap: 'Open Sesame', alt: 'Comic strip: a guest is locked out of a room, and a front-office colleague opens the door without damage using a simple trick.' },
  { src: 'lost-and-found', tag: 'Ownership', cap: 'Lost Yet Found', alt: "Comic strip: a housekeeper finds a guest's lost bracelet and returns it safely." },
  { src: 'towel-origami', tag: 'Attention to Detail', cap: 'Towel Origami Magic', alt: 'Comic strip: staff calm a crying child at dinner by folding a towel into an origami rabbit.' }
]

const meta = [
  { k: 'Role', v: 'Concept, writing, illustration & layout' },
  { k: 'For', v: 'Club Mahindra · L&D' },
  { k: 'Year', v: '2023' },
  { k: 'Format', v: '16-page comic magazine' }
]

// Lightbox — shows the real full-colour art, not the halftone thumbnail.
const lightbox = ref<number | null>(null)
function open(i: number) { lightbox.value = i }
function close() { lightbox.value = null }
function step(dir: 1 | -1) {
  if (lightbox.value === null) return
  lightbox.value = (lightbox.value + dir + pages.length) % pages.length
}
function onKey(e: KeyboardEvent) {
  if (lightbox.value === null) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="press-page cs">
    <PressMast section="My Work" />

    <article class="cs-inner">
      <header class="cs-hero">
        <div class="cs-hero__text" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">
          <p class="press-label">My Work &middot; Club Mahindra &middot; 2023</p>
          <h1 class="press-h1 cs-title">The SEWA Chronicles</h1>
          <p class="cs-deck press-lead">A service-culture comic magazine that teaches hospitality teams the values behind great guest experience, through true stories from the resort floor.</p>
          <dl class="press-table cs-meta">
            <div v-for="m in meta" :key="m.k" class="press-row">
              <dt>{{ m.k }}</dt>
              <dd>{{ m.v }}</dd>
            </div>
          </dl>
        </div>
        <!-- The reveal animation lives on the wrapper, not the button: v-motion
             writes an inline `transform`, which would beat `.press-card`'s
             hover and press scales and leave this the one card on the site
             that doesn't respond to the pointer. -->
        <div class="cs-hero__coverwrap" v-motion :initial="R.scaleIn(120).initial" :visible-once="R.scaleIn(120).visibleOnce">
          <button class="press-card cs-hero__cover" @click="open(0)" aria-label="Open the cover">
            <PressHalftone src="/work/sewa/cover.webp" alt="The SEWA Chronicles cover" ratio="1400/1980" eager />
          </button>
        </div>
      </header>

      <section class="cs-body">
        <p class="press-label cs-body__label">How it came together</p>
        <article v-for="b in beats" :key="b.n" class="cs-beat">
          <span class="press-label cs-beat__n">{{ b.n }}</span>
          <h2>{{ b.h }}</h2>
          <p>{{ b.body }}</p>
        </article>
      </section>

      <section class="cs-gallery" aria-label="Selected pages">
        <p class="press-label cs-gallery__label">Selected pages</p>
        <div class="cs-grid">
          <figure v-for="(p, i) in pages" :key="p.src" class="cs-fig">
            <button class="press-card cs-fig__btn" @click="open(i)" :aria-label="`Enlarge: ${p.cap}`">
              <PressHalftone :src="`/work/sewa/${p.src}.webp`" :alt="p.alt" ratio="4/5" />
            </button>
            <figcaption>
              <strong>{{ p.cap }}</strong>
              <span class="cs-fig__tag">{{ p.tag }}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <footer class="cs-foot" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">
        <p>Learning that people actually want to finish — that is the whole idea.</p>
        <div class="cs-foot__links">
          <NuxtLink to="/my-work" class="press-btn">&larr; All work</NuxtLink>
          <NuxtLink to="/tools" class="press-btn press-btn--solid">See the tools I build &rarr;</NuxtLink>
        </div>
      </footer>
    </article>

    <PressFoot />

    <!-- Lightbox — real art, real colour -->
    <Transition name="cs-lb">
      <div v-if="lightbox !== null" class="cs-lb" @click.self="close()">
        <button class="cs-lb__close" aria-label="Close" @click="close()">&times;</button>
        <button class="cs-lb__nav cs-lb__nav--prev" aria-label="Previous page" @click.stop="step(-1)">&lsaquo;</button>
        <figure class="cs-lb__figure">
          <img :src="`/work/sewa/${pages[lightbox].src}.webp`" :alt="pages[lightbox].alt">
          <figcaption>{{ pages[lightbox].cap }} &middot; {{ pages[lightbox].tag }}</figcaption>
        </figure>
        <button class="cs-lb__nav cs-lb__nav--next" aria-label="Next page" @click.stop="step(1)">&rsaquo;</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cs-inner { max-width: var(--press-col-feature); margin: 0 auto; padding: var(--press-pad-top) var(--press-edge) var(--press-pad-bottom); }

.cs-hero { display: grid; grid-template-columns: 1fr 280px; gap: 34px; align-items: start; padding-bottom: clamp(32px, 5vw, 48px); border-bottom: 1px solid var(--press-rule); }
/* Sans-bold via `.press-h1`, matching the home card and the About hero. */
.cs-title { margin-top: 12px; }
.cs-deck { margin-top: 16px; max-width: 30em; }
.cs-meta { margin-top: 26px; }
/* Both this and the gallery figures below are zoom triggers, so both take
   `.press-card`. `zoom-in` overrides the shared `pointer` because it says
   something more specific about what the click does. */
.cs-hero__coverwrap { min-width: 0; }
.cs-hero__cover { display: block; width: 100%; padding: 0; border: 1px solid var(--press-rule); cursor: zoom-in; }

.cs-body { padding: clamp(32px, 5vw, 48px) 0; border-bottom: 1px solid var(--press-rule); }
.cs-body__label { margin-bottom: 20px; }
.cs-beat { display: grid; grid-template-columns: 48px 1fr; gap: 18px; padding: 22px 0; border-top: 1px solid var(--press-rule); }
.cs-beat:first-of-type { border-top: 0; }
.cs-beat__n { padding-top: 3px; }
.cs-beat h2 { margin: 0; font-family: var(--press-serif); font-weight: 800; font-size: var(--press-h3); letter-spacing: -0.01em; }
.cs-beat p { margin: 10px 0 0; font-family: var(--press-serif); font-size: var(--press-body); line-height: 1.6; color: var(--press-ink-80); max-width: 60ch; }

.cs-gallery { padding-top: clamp(32px, 5vw, 48px); }
.cs-gallery__label { margin-bottom: 18px; }
.cs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--press-rule); border: 1px solid var(--press-rule); }
.cs-fig { display: flex; flex-direction: column; background: var(--press-paper); }
.cs-fig__btn { display: block; padding: 0; border: 0; cursor: zoom-in; }
.cs-fig figcaption { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px 16px; }
.cs-fig figcaption strong { font-family: var(--press-serif); font-size: var(--press-small); font-weight: 700; letter-spacing: -0.005em; }
.cs-fig__tag { font-family: var(--press-mono); font-size: var(--press-label); letter-spacing: 0.06em; text-transform: uppercase; color: var(--press-ink-62); }

.cs-foot { margin-top: clamp(40px, 6vw, 64px); padding-top: 28px; border-top: 2px solid var(--press-rule-strong); }
.cs-foot > p { font-family: var(--press-serif); font-weight: 800; font-size: var(--press-h2); line-height: 1.05; letter-spacing: -0.02em; max-width: 20ch; }
.cs-foot__links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }

/* Lightbox — projection room: the page's own ink, at near-opacity, so the real
   colour art pops. Inside it the roles invert (paper-on-ink), which is why the
   controls are described in paper rather than reaching for `.press-btn`. */
.cs-lb {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px;
  background: rgba(14, 13, 13, 0.94);
}
.cs-lb__figure { display: flex; flex-direction: column; align-items: center; gap: 12px; max-height: 100%; }
.cs-lb__figure img { max-width: min(92vw, 760px); max-height: 84dvh; }
.cs-lb__figure figcaption { color: var(--press-paper); opacity: 0.8; font-family: var(--press-mono); font-size: var(--press-label); letter-spacing: 0.05em; }
.cs-lb__close {
  position: absolute; top: calc(16px + var(--safe-top)); right: 18px;
  width: 40px; height: 40px;
  color: var(--press-paper); font-size: 18px;
  background: transparent; border: 1px solid rgba(236, 233, 226, 0.4);
  transition: background var(--press-dur) var(--press-ease);
}
.cs-lb__nav {
  width: 48px; height: 48px; flex-shrink: 0;
  color: var(--press-paper); font-size: 28px; line-height: 1;
  background: transparent; border: 1px solid rgba(236, 233, 226, 0.4);
  transition: background var(--press-dur) var(--press-ease);
}
@media (hover: hover) { .cs-lb__nav:hover, .cs-lb__close:hover { background: rgba(236, 233, 226, 0.15); } }
.cs-lb__nav:active, .cs-lb__close:active { transform: scale(var(--press-press)); }
.cs-lb__nav:focus-visible, .cs-lb__close:focus-visible { outline: 2px solid var(--press-paper); outline-offset: 3px; }
.cs-lb-enter-active, .cs-lb-leave-active { transition: opacity 0.25s ease; }
.cs-lb-enter-from, .cs-lb-leave-to { opacity: 0; }

@media (max-width: 760px) {
  .cs-hero { grid-template-columns: 1fr; gap: 24px; }
  .cs-hero__coverwrap { max-width: 220px; order: -1; }
  .cs-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .cs-inner { padding: clamp(32px, 6vw, 56px) var(--press-edge) clamp(48px, 7vw, 72px); }
  .cs-lb__nav { width: 40px; height: 40px; font-size: 22px; }
}
</style>
