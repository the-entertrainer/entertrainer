<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'The SEWA Chronicles — service-culture comics for Club Mahindra · Naveen Jose',
  description: 'A case study of The SEWA Chronicles: a comic magazine by Naveen Jose that teaches Club Mahindra hospitality teams the SEWA service values through true guest-service stories.',
  ogTitle: 'The SEWA Chronicles — a case study',
  ogDescription: 'A service-culture comic magazine that teaches hospitality values through true stories from the resort floor.',
  ogUrl: 'https://entertrainer.in/my-work/sewa-chronicles',
  ogImage: 'https://entertrainer.in/work/sewa/cover.webp'
})
const R = useReveal()

interface Beat { h: string; body: string }
const beats: Beat[] = [
  { h: 'The problem', body: 'Service values usually live in a slide deck that nobody remembers. But hospitality is made of small human moments, and a resort team spread across the country needs those values to feel real, not like a poster in the back office.' },
  { h: 'The idea', body: 'Turn real guest-service moments into a comic. Each issue collects true stories of SEWA Champions, the housekeepers, front-office and food-and-beverage staff who went out of their way for a member, and draws them as short strips. People remember a story long after they forget a rule.' },
  { h: 'How it is built to teach', body: 'Story over instruction: every value is shown happening, not described. Each strip names the real employee and resort, so good service is something to be seen doing. Every story is tagged with one named behaviour, so teams build a shared vocabulary — and a submission page keeps the next issue writing itself.' },
  { h: 'My part', body: 'I made it end to end: gathering the stories, writing and storyboarding each strip, illustrating the characters, and laying out the issue. It is the clearest example of how I like to design learning, warm, specific, and built around a real human moment.' }
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

// Lightbox
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
  <div class="cs-page">
    <UiGlassBackdrop calm />

    <article class="cs-inner">
      <!-- Hero -->
      <header class="cs-hero">
        <div class="cs-hero__text" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">
          <p class="cs-eyebrow">My Work · Club Mahindra · 2023</p>
          <h1 class="cs-title">The SEWA Chronicles</h1>
          <p class="cs-deck">A service-culture comic magazine that teaches hospitality teams the values behind great guest experience, through true stories from the resort floor.</p>
          <dl class="cs-meta">
            <div v-for="m in meta" :key="m.k" class="cs-meta__row">
              <dt>{{ m.k }}</dt>
              <dd>{{ m.v }}</dd>
            </div>
          </dl>
        </div>
        <button class="cs-hero__cover" @click="open(0)" aria-label="Open the cover" v-motion :initial="R.scaleIn(120).initial" :visible-once="R.scaleIn(120).visibleOnce">
          <UiCard3D src="/work/sewa/cover.webp" alt="The SEWA Chronicles cover" ratio="1400/1980" :strength="8" radius="12rem" eager />
        </button>
      </header>

      <!-- Narrative: four beats, dragged through rather than read down the page -->
      <section class="cs-body">
        <p class="glass-label cs-body__label">How it came together</p>
        <UiSpatialDeck :items="beats" :spacing="0.85" aria-label="How the comic came together">
          <template #default="{ item }">
            <article class="cs-beat">
              <h2>{{ item.h }}</h2>
              <p>{{ item.body }}</p>
            </article>
          </template>
        </UiSpatialDeck>
      </section>

      <!-- Gallery -->
      <section class="cs-gallery" aria-label="Selected pages">
        <p class="glass-label cs-gallery__label">Selected pages</p>
        <UiSpatialDeck :items="pages" aria-label="Selected comic pages">
          <template #default="{ item: p, index: i, active }">
            <figure class="cs-fig">
              <button class="cs-fig__btn" :tabindex="active ? 0 : -1" @click="open(i)" :aria-label="`Enlarge: ${p.cap}`">
                <UiCard3D :src="`/work/sewa/${p.src}.webp`" :alt="p.alt" ratio="fill" :strength="11" radius="0" />
              </button>
              <figcaption>
                <strong>{{ p.cap }}</strong>
                <span class="cs-fig__tag">{{ p.tag }}</span>
              </figcaption>
            </figure>
          </template>
        </UiSpatialDeck>
      </section>

      <!-- Close -->
      <footer class="cs-foot" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">
        <p>Learning that people actually want to finish, that is the whole idea.</p>
        <div class="cs-foot__links">
          <NuxtLink to="/my-work" class="cs-link">← All work</NuxtLink>
          <NuxtLink to="/tools" class="cs-link cs-link--accent">See the tools I build →</NuxtLink>
        </div>
      </footer>
    </article>

    <!-- Lightbox -->
    <Transition name="cs-lb">
      <div v-if="lightbox !== null" class="cs-lb" @click.self="close()">
        <button class="cs-lb__close" aria-label="Close" @click="close()">✕</button>
        <button class="cs-lb__nav cs-lb__nav--prev" aria-label="Previous page" @click.stop="step(-1)">‹</button>
        <figure class="cs-lb__figure">
          <img :src="`/work/sewa/${pages[lightbox].src}.webp`" :alt="pages[lightbox].alt">
          <figcaption>{{ pages[lightbox].cap }} · {{ pages[lightbox].tag }}</figcaption>
        </figure>
        <button class="cs-lb__nav cs-lb__nav--next" aria-label="Next page" @click.stop="step(1)">›</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cs-page { position: relative; z-index: 1; min-height: 100dvh; --serif: var(--display-font); }
.cs-inner {
  max-width: 920rem;
  margin: 0 auto;
  padding: calc(112rem + var(--safe-top)) 24rem calc(72rem + var(--safe-bottom));
}

/* Hero */
.cs-hero {
  display: grid;
  grid-template-columns: 1fr 300rem;
  gap: 34rem;
  align-items: center;
  margin-bottom: 48rem;
}
.cs-eyebrow { font-family: var(--mono-font); font-weight: 500; font-size: 12rem; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; }
.cs-title { font-family: var(--serif); font-optical-sizing: auto; font-size: var(--text-h1); font-weight: 800; line-height: 0.92; letter-spacing: var(--tracking-display); margin-top: 12rem; }
.cs-deck { font-size: 17rem; line-height: 1.55; opacity: 0.7; margin-top: 16rem; max-width: 30em; }
.cs-meta { display: flex; flex-wrap: wrap; gap: 10rem 28rem; margin-top: 26rem; }
.cs-meta__row { display: flex; flex-direction: column; gap: 3rem; }
.cs-meta__row dt { font-family: var(--mono-font); font-size: 10.5rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.45; }
.cs-meta__row dd { font-size: 13.5rem; font-weight: 600; }
.cs-hero__cover {
  display: block;
  border-radius: 16rem;
  cursor: zoom-in;
  background: none;
  padding: 0;
  border: 0;
  transition: transform 0.4s var(--ease-spring);
}
@media (hover: hover) { .cs-hero__cover:hover { transform: translateY(-6rem) scale(1.015); } }
.cs-hero__cover:focus-visible { outline: 2px solid var(--color-text); outline-offset: 4px; border-radius: 16rem; }

/* Body: a deck of four beats, dragged through rather than read as columns */
.cs-body { padding: 34rem 0; border-top: 1px solid var(--color-divider); border-bottom: 1px solid var(--color-divider); }
.cs-body__label { margin-bottom: 16rem; }
.cs-beat {
  display: flex; flex-direction: column; justify-content: center; gap: 14rem;
  width: 100%; height: 100%; padding: 30rem 32rem; box-sizing: border-box;
  border-radius: 20rem; overflow: hidden;
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px) saturate(1.3) brightness(1.08);
  -webkit-backdrop-filter: blur(20px) saturate(1.3) brightness(1.08);
  box-shadow: inset 0 1px 0 var(--glow-rim), inset 0 0 0 1px var(--color-glass-border);
}
.cs-beat h2 { font-family: var(--serif); font-weight: 800; font-size: var(--text-h3); letter-spacing: var(--tracking-display); line-height: 1; opacity: 1; flex-shrink: 0; }
.cs-beat p {
  font-size: 15rem; line-height: 1.65; opacity: 0.82;
  display: -webkit-box; -webkit-line-clamp: 8; -webkit-box-orient: vertical; overflow: hidden;
}

/* Gallery */
.cs-gallery { margin-top: 44rem; }
.cs-gallery__label { margin-bottom: 16rem; }
.cs-fig {
  display: flex; flex-direction: column; width: 100%; height: 100%;
  border-radius: 20rem; overflow: hidden;
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px) saturate(1.3) brightness(1.08);
  -webkit-backdrop-filter: blur(20px) saturate(1.3) brightness(1.08);
  box-shadow: inset 0 1px 0 var(--glow-rim), inset 0 0 0 1px var(--color-glass-border);
}
.cs-fig__btn {
  display: block; flex: 1 1 auto; min-height: 0; width: 100%;
  padding: 0; border: 0; cursor: zoom-in; background: none;
}
.cs-fig__btn :deep(.c3) { height: 100%; }
.cs-fig__btn :deep(.c3__plate) { border-radius: 0; box-shadow: none; height: 100%; }
.cs-fig__btn :deep(.c3__img) { height: 100%; }
.cs-fig__btn:focus-visible { outline: 2px solid var(--color-text); outline-offset: -3px; }
.cs-fig figcaption { display: flex; flex-direction: column; gap: 2rem; padding: 14rem 18rem 18rem; flex-shrink: 0; }
.cs-fig figcaption strong { font-size: 13.5rem; letter-spacing: -0.01em; }
.cs-fig__tag { font-size: 11rem; font-weight: 600; opacity: 0.5; }

/* Close */
.cs-foot { margin-top: 48rem; padding-top: 28rem; border-top: 1px solid var(--color-divider); }
.cs-foot > p { font-family: var(--serif); font-weight: 800; font-size: var(--text-h2); letter-spacing: var(--tracking-display); line-height: 0.98; opacity: 0.9; max-width: 20em; }
.cs-foot__links { display: flex; flex-wrap: wrap; gap: 10rem 24rem; margin-top: 22rem; }
.cs-link { display: inline-flex; align-items: center; min-height: 44rem; font-size: 14rem; font-weight: 600; color: var(--color-text); opacity: 0.7; transition: opacity 0.15s ease; }
.cs-link:hover { opacity: 1; }
.cs-link--accent { color: var(--color-accent); opacity: 1; }

@keyframes cs-rise { from { opacity: 0; transform: translateY(16rem); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .cs-hero { animation: none; } }

/* Lightbox */
.cs-lb {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rem;
  padding: 20rem;
  background: rgba(10, 8, 6, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.cs-lb__figure { display: flex; flex-direction: column; align-items: center; gap: 12rem; max-height: 100%; }
.cs-lb__figure img { max-width: min(92vw, 760rem); max-height: 84dvh; border-radius: 8rem; box-shadow: 0 40rem 120rem -30rem rgba(0, 0, 0, 0.8); }
.cs-lb__figure figcaption { color: rgba(255, 255, 255, 0.75); font-size: 13rem; font-weight: 600; }
.cs-lb__close {
  position: absolute;
  top: calc(16rem + var(--safe-top));
  right: 18rem;
  width: 44rem; height: 44rem;
  border-radius: 999px;
  color: #fff;
  font-size: 18rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
  transition: background 0.2s ease, transform 0.3s var(--ease-spring);
}
.cs-lb__nav {
  width: 52rem; height: 52rem;
  border-radius: 999px;
  color: #fff;
  font-size: 30rem;
  line-height: 1;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
  transition: background 0.2s ease, transform 0.3s var(--ease-spring);
}
@media (hover: hover) {
  .cs-lb__nav:hover, .cs-lb__close:hover { background: rgba(255, 255, 255, 0.22); transform: scale(1.06); }
}
.cs-lb-enter-active, .cs-lb-leave-active { transition: opacity 0.25s ease; }
.cs-lb-enter-from, .cs-lb-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 760px) {
  .cs-hero { grid-template-columns: 1fr; gap: 24rem; }
  .cs-hero__cover { max-width: 260rem; order: -1; }
}
@media (max-width: 640px) {
  .cs-inner { padding: calc(96rem + var(--safe-top)) 16rem calc(56rem + var(--safe-bottom)); }
  .cs-lb__nav { width: 44rem; height: 44rem; font-size: 24rem; }
}
</style>
