<script setup lang="ts">
useSeoMeta({
  title: 'The SEWA Chronicles — service-culture comics for Club Mahindra · Naveen Jose',
  description: 'A case study of The SEWA Chronicles: a comic magazine by Naveen Jose that teaches Club Mahindra hospitality teams the SEWA service values through true guest-service stories.',
  ogTitle: 'The SEWA Chronicles — a case study',
  ogDescription: 'A service-culture comic magazine that teaches hospitality values through true stories from the resort floor.',
  ogUrl: 'https://entertrainer.in/my-work/sewa-chronicles',
  ogImage: 'https://entertrainer.in/work/sewa/cover.webp'
})
const R = useReveal()

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
          <p class="eyebrow cs-eyebrow">My Work · Club Mahindra · 2023</p>
          <h1 class="display-serif cs-title">The SEWA Chronicles</h1>
          <p class="cs-deck">A service-culture comic magazine that teaches hospitality teams the values behind great guest experience, through true stories from the resort floor.</p>
          <dl class="cs-meta">
            <div v-for="m in meta" :key="m.k" class="cs-meta__row">
              <dt class="eyebrow eyebrow--quiet">{{ m.k }}</dt>
              <dd>{{ m.v }}</dd>
            </div>
          </dl>
        </div>
        <button class="cs-hero__cover u-lift" @click="open(0)" aria-label="Open the cover" v-motion :initial="R.scaleIn(120).initial" :visible-once="R.scaleIn(120).visibleOnce">
          <img src="/work/sewa/cover.webp" width="1400" height="1980" alt="The SEWA Chronicles cover" loading="eager">
        </button>
      </header>

      <!-- Narrative -->
      <section class="cs-body">
        <div class="cs-block" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">
          <h2>The problem</h2>
          <p>Service values usually live in a slide deck that nobody remembers. But hospitality is made of small human moments, and a resort team spread across the country needs those values to feel real, not like a poster in the back office.</p>
        </div>

        <div class="cs-block" v-motion :initial="R.rise(90).initial" :visible-once="R.rise(90).visibleOnce">
          <h2>The idea</h2>
          <p>Turn real guest-service moments into a comic. Each issue collects true stories of SEWA Champions, the housekeepers, front-office and food-and-beverage staff who went out of their way for a member, and draws them as short strips. People remember a story long after they forget a rule.</p>
        </div>

        <div class="cs-block" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">
          <h2>How it is built to teach</h2>
          <ul class="cs-list">
            <li><strong>Story over instruction.</strong> Every value is shown happening, not described.</li>
            <li><strong>Recognition as motivation.</strong> Each strip names the real employee and resort, so good service becomes something to be seen doing.</li>
            <li><strong>A shared vocabulary.</strong> Each story is tagged with one named service behaviour, from Going the Extra Mile to Attention to Detail, so teams build a common language for what good looks like.</li>
            <li><strong>A loop that keeps it alive.</strong> A submission page invites staff to send their own stories, so the next issue partly writes itself.</li>
          </ul>
        </div>

        <div class="cs-block" v-motion :initial="R.rise(90).initial" :visible-once="R.rise(90).visibleOnce">
          <h2>My part</h2>
          <p>I made it end to end: gathering the stories, writing and storyboarding each strip, illustrating the characters, and laying out the issue. It is the clearest example of how I like to design learning, warm, specific, and built around a real human moment.</p>
        </div>
      </section>

      <!-- Gallery -->
      <section class="cs-gallery" aria-label="Selected pages">
        <p class="glass-label cs-gallery__label">Selected pages</p>
        <div class="cs-grid">
          <figure v-for="(p, i) in pages" :key="p.src" class="cs-fig" v-motion :initial="R.scaleInStagger(i).initial" :visible-once="R.scaleInStagger(i).visibleOnce">
            <button class="cs-fig__btn u-lift" @click="open(i)" :aria-label="`Enlarge: ${p.cap}`">
              <img :src="`/work/sewa/${p.src}.webp`" width="1400" height="1980" :alt="p.alt" :loading="i < 2 ? 'eager' : 'lazy'" decoding="async">
            </button>
            <figcaption>
              <strong>{{ p.cap }}</strong>
              <span class="cs-fig__tag">{{ p.tag }}</span>
            </figcaption>
          </figure>
        </div>
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
.cs-page { position: relative; z-index: 1; min-height: 100dvh; --serif: var(--serif-font); }
.cs-inner {
  max-width: var(--maxw-read);
  margin: 0 auto;
  padding: var(--page-top) var(--edge-column) var(--page-bottom);
}

/* Hero */
.cs-hero {
  display: grid;
  grid-template-columns: 1fr 300rem;
  gap: 34rem;
  align-items: center;
  margin-bottom: 48rem;
}
.cs-title { font-size: var(--text-display); margin-top: 12rem; }
.cs-deck { font-size: 17rem; line-height: 1.55; opacity: 0.7; margin-top: 16rem; max-width: 30em; }
.cs-meta { display: flex; flex-wrap: wrap; gap: 10rem 28rem; margin-top: 26rem; }
.cs-meta__row { display: flex; flex-direction: column; gap: 3rem; }
.cs-meta__row dt { letter-spacing: 0.1em; }
.cs-meta__row dd { font-size: 13.5rem; font-weight: 600; }
.cs-hero__cover {
  border-radius: 16rem;
  overflow: hidden;
  box-shadow: var(--elev-4);
  transition: transform 0.2s ease;
  cursor: zoom-in;
  background: none;
  padding: 0;
  border: 1px solid var(--color-glass-border);
}
.cs-hero__cover img { width: 100%; height: auto; display: block; }

/* Body */
.cs-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rem 40rem;
  padding: 34rem 0;
  border-top: 1px solid var(--color-divider);
  border-bottom: 1px solid var(--color-divider);
}
.cs-block h2 { font-family: var(--serif); font-style: italic; font-weight: 400; font-size: 26rem; letter-spacing: -0.01em; opacity: 0.9; margin-bottom: 12rem; }
.cs-block p { font-size: 15rem; line-height: 1.65; opacity: 0.82; }
.cs-list { list-style: none; display: flex; flex-direction: column; gap: 11rem; }
.cs-list li { font-size: 14.5rem; line-height: 1.55; opacity: 0.82; padding-left: 18rem; position: relative; }
.cs-list li::before { content: ""; position: absolute; left: 0; top: 8rem; width: 7rem; height: 7rem; border-radius: 999px; background: linear-gradient(135deg, var(--color-accent), var(--color-accent-deep)); }
.cs-list strong { font-weight: 700; opacity: 1; }

/* Gallery */
.cs-gallery { margin-top: 44rem; }
.cs-gallery__label { margin-bottom: 16rem; }
.cs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rem; }
.cs-fig { display: flex; flex-direction: column; gap: 9rem; }
.cs-fig__btn::after {
  /* `cursor: zoom-in` says "you can open this" only once the pointer is already
     on it. This says it before you commit — and on touch, where there is no
     cursor at all, it is the only thing that says it. */
  content: "";
  position: absolute;
  right: 10rem; bottom: 10rem;
  width: 30rem; height: 30rem;
  border-radius: var(--radius-full);
  background:
    linear-gradient(currentColor, currentColor) center/11rem 1.5px no-repeat,
    linear-gradient(currentColor, currentColor) center/1.5px 11rem no-repeat,
    color-mix(in srgb, var(--color-bg) 68%, transparent);
  border: 1px solid var(--color-glass-border);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  opacity: 0.72;
  transition: opacity var(--dur-2) var(--ease-out-soft), scale var(--dur-3) var(--ease-out-soft);
  pointer-events: none;
}
@media (hover: hover) and (pointer: fine) {
  .cs-fig__btn:hover::after { opacity: 1; scale: 1.08; }
}
.cs-fig__btn {
  position: relative;
  padding: 0;
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  overflow: hidden;
  cursor: zoom-in;
  background: var(--color-glass-bg);
}
.cs-fig__btn img { width: 100%; height: auto; display: block; }
.cs-fig figcaption { display: flex; flex-direction: column; gap: 2rem; padding: 0 2rem; }
.cs-fig figcaption strong { font-size: 13.5rem; letter-spacing: -0.01em; }
.cs-fig__tag { font-size: 11rem; font-weight: 600; opacity: 0.5; }

/* Close */
.cs-foot { margin-top: 48rem; padding-top: 28rem; border-top: 1px solid var(--color-divider); }
.cs-foot > p { font-family: var(--serif); font-style: italic; font-weight: 400; font-size: clamp(22rem, 3vw, 30rem); letter-spacing: -0.01em; line-height: 1.25; opacity: 0.9; max-width: 20em; }
.cs-foot__links { display: flex; flex-wrap: wrap; gap: 10rem 24rem; margin-top: 22rem; }
.cs-link {
  display: inline-flex;
  align-items: center;
  min-height: 44rem; font-size: 14rem; font-weight: 600; color: var(--color-text); opacity: 0.7; transition: opacity 0.15s ease; }
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
  background: rgba(10, 8, 6, 0.92);
  backdrop-filter: blur(8px);
  /* The scrim is intentionally dark in both themes — a comic page reads best
     against black. That makes the ring theme-independent too. */
  --lb-ink: #fff;
  --lb-surface: rgba(255, 255, 255, 0.14);
  --lb-edge: rgba(255, 255, 255, 0.24);
  -webkit-backdrop-filter: blur(8px);
}
.cs-lb__figure { display: flex; flex-direction: column; align-items: center; gap: 12rem; max-height: 100%; }
.cs-lb__figure img { max-width: min(92vw, 760rem); max-height: 84dvh; border-radius: 8rem; box-shadow: 0 40rem 120rem -30rem rgba(0, 0, 0, 0.8); }
.cs-lb__figure figcaption { color: color-mix(in srgb, var(--lb-ink) 78%, transparent); font-size: 13rem; font-weight: 600; }
.cs-lb__close {
  position: absolute;
  top: calc(16rem + var(--safe-top));
  right: 18rem;
  width: 44rem; height: 44rem;
  border-radius: 999px;
  color: var(--lb-ink);
  font-size: 18rem;
  background: var(--lb-surface);
  border: 1px solid var(--lb-edge);
}
.cs-lb__nav {
  width: 52rem; height: 52rem;
  border-radius: 999px;
  color: var(--lb-ink);
  font-size: 30rem;
  line-height: 1;
  flex-shrink: 0;
  background: var(--lb-surface);
  border: 1px solid var(--lb-edge);
  transition: background var(--dur-2) var(--ease-out-soft);
}
/* The global ring is `2px solid var(--color-text)`, which in light theme is
   near-black — drawn on a near-black scrim it was invisible. */
.cs-lb :focus-visible { outline: 2px solid var(--lb-ink); outline-offset: 3px; }
@media (hover: hover) { .cs-lb__nav:hover, .cs-lb__close:hover { background: color-mix(in srgb, var(--lb-ink) 26%, transparent); } }
.cs-lb-enter-active, .cs-lb-leave-active { transition: opacity 0.25s ease; }
.cs-lb-enter-from, .cs-lb-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 760px) {
  .cs-hero { grid-template-columns: 1fr; gap: 24rem; }
  .cs-hero__cover { max-width: 260rem; order: -1; }
  .cs-body { grid-template-columns: 1fr; gap: 26rem; }
}
@media (max-width: 640px) {
  .cs-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  /* One page at a time. Two columns here means ~156px per comic page and the
     dialogue stops being legible, which defeats the point of showing them. */
  .cs-grid { grid-template-columns: 1fr; gap: 22rem; }
  /* Arrows flanking the image ate ~110px of a 360px viewport; move them under
     it and give the page the full width. */
  .cs-lb { flex-direction: column; gap: 14rem; padding: 16rem; }
  .cs-lb__figure { order: -1; }
  .cs-lb__nav { width: 48rem; height: 48rem; font-size: 26rem; }
  .cs-lb__figure img { max-width: 96vw; max-height: 68dvh; }
}
</style>
