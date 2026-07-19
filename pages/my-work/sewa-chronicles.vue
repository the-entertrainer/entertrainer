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
        <div class="cs-hero__text">
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
        <button class="cs-hero__cover" @click="open(0)" aria-label="Open the cover">
          <img src="/work/sewa/cover.webp" width="1400" height="1980" alt="The SEWA Chronicles cover" loading="eager">
        </button>
      </header>

      <!-- Narrative -->
      <section class="cs-body">
        <div class="cs-block">
          <h2>The problem</h2>
          <p>Service values usually live in a slide deck that nobody remembers. But hospitality is made of small human moments, and a resort team spread across the country needs those values to feel real, not like a poster in the back office.</p>
        </div>

        <div class="cs-block">
          <h2>The idea</h2>
          <p>Turn real guest-service moments into a comic. Each issue collects true stories of SEWA Champions, the housekeepers, front-office and food-and-beverage staff who went out of their way for a member, and draws them as short strips. People remember a story long after they forget a rule.</p>
        </div>

        <div class="cs-block">
          <h2>How it is built to teach</h2>
          <ul class="cs-list">
            <li><strong>Story over instruction.</strong> Every value is shown happening, not described.</li>
            <li><strong>Recognition as motivation.</strong> Each strip names the real employee and resort, so good service becomes something to be seen doing.</li>
            <li><strong>A shared vocabulary.</strong> Each story is tagged with one named service behaviour, from Going the Extra Mile to Attention to Detail, so teams build a common language for what good looks like.</li>
            <li><strong>A loop that keeps it alive.</strong> A submission page invites staff to send their own stories, so the next issue partly writes itself.</li>
          </ul>
        </div>

        <div class="cs-block">
          <h2>My part</h2>
          <p>I made it end to end: gathering the stories, writing and storyboarding each strip, illustrating the characters, and laying out the issue. It is the clearest example of how I like to design learning, warm, specific, and built around a real human moment.</p>
        </div>
      </section>

      <!-- Gallery -->
      <section class="cs-gallery" aria-label="Selected pages">
        <p class="glass-label cs-gallery__label">Selected pages</p>
        <div class="cs-grid">
          <figure v-for="(p, i) in pages" :key="p.src" class="cs-fig">
            <button class="cs-fig__btn" @click="open(i)" :aria-label="`Enlarge: ${p.cap}`">
              <img :src="`/work/sewa/${p.src}.webp`" width="1400" height="1980" :alt="p.alt" loading="eager" decoding="async">
            </button>
            <figcaption>
              <strong>{{ p.cap }}</strong>
              <span class="cs-fig__tag">{{ p.tag }}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <!-- Close -->
      <footer class="cs-foot">
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
.cs-page { position: relative; z-index: 1; min-height: 100dvh; }
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
  animation: cs-rise 0.6s var(--ease-spring) both;
}
.cs-eyebrow { font-size: 12rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.5; }
.cs-title { font-size: clamp(34rem, 6vw, 52rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; margin-top: 12rem; }
.cs-deck { font-size: 17rem; line-height: 1.55; opacity: 0.7; margin-top: 16rem; max-width: 30em; }
.cs-meta { display: flex; flex-wrap: wrap; gap: 10rem 28rem; margin-top: 26rem; }
.cs-meta__row { display: flex; flex-direction: column; gap: 3rem; }
.cs-meta__row dt { font-size: 10.5rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.45; }
.cs-meta__row dd { font-size: 13.5rem; font-weight: 600; }
.cs-hero__cover {
  border-radius: 16rem;
  overflow: hidden;
  box-shadow: 0 40rem 90rem -40rem rgba(0, 0, 0, 0.6);
  transition: transform 0.2s ease;
  cursor: zoom-in;
  background: none;
  padding: 0;
  border: 1px solid var(--color-glass-border);
}
@media (hover: hover) { .cs-hero__cover:hover { transform: translateY(-4rem) scale(1.01); } }
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
.cs-block h2 { font-size: 13rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-accent); opacity: 0.9; margin-bottom: 10rem; }
.cs-block p { font-size: 15rem; line-height: 1.65; opacity: 0.82; }
.cs-list { list-style: none; display: flex; flex-direction: column; gap: 11rem; }
.cs-list li { font-size: 14.5rem; line-height: 1.55; opacity: 0.82; padding-left: 18rem; position: relative; }
.cs-list li::before { content: ""; position: absolute; left: 0; top: 8rem; width: 7rem; height: 7rem; border-radius: 999px; background: linear-gradient(135deg, #8B7CF6, #2DD4BF); }
.cs-list strong { font-weight: 700; opacity: 1; }

/* Gallery */
.cs-gallery { margin-top: 44rem; }
.cs-gallery__label { margin-bottom: 16rem; }
.cs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rem; }
.cs-fig { display: flex; flex-direction: column; gap: 9rem; }
.cs-fig__btn {
  padding: 0;
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  overflow: hidden;
  cursor: zoom-in;
  background: var(--color-glass-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
@media (hover: hover) {
  .cs-fig__btn:hover { transform: translateY(-4rem); border-color: color-mix(in srgb, var(--color-accent) 45%, var(--color-glass-border-hover)); box-shadow: 0 24rem 50rem -26rem rgba(0, 0, 0, 0.5); }
}
.cs-fig__btn img { width: 100%; height: auto; display: block; }
.cs-fig figcaption { display: flex; flex-direction: column; gap: 2rem; padding: 0 2rem; }
.cs-fig figcaption strong { font-size: 13.5rem; letter-spacing: -0.01em; }
.cs-fig__tag { font-size: 11rem; font-weight: 600; opacity: 0.5; }

/* Close */
.cs-foot { margin-top: 48rem; padding-top: 28rem; border-top: 1px solid var(--color-divider); }
.cs-foot > p { font-size: 18rem; font-weight: 600; letter-spacing: -0.02em; opacity: 0.85; max-width: 22em; }
.cs-foot__links { display: flex; flex-wrap: wrap; gap: 10rem 24rem; margin-top: 22rem; }
.cs-link { font-size: 14rem; font-weight: 600; color: var(--color-text); opacity: 0.7; transition: opacity 0.15s ease; }
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
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.cs-lb__nav {
  width: 52rem; height: 52rem;
  border-radius: 999px;
  color: #fff;
  font-size: 30rem;
  line-height: 1;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background 0.15s ease;
}
@media (hover: hover) { .cs-lb__nav:hover, .cs-lb__close:hover { background: rgba(255, 255, 255, 0.24); } }
.cs-lb-enter-active, .cs-lb-leave-active { transition: opacity 0.25s ease; }
.cs-lb-enter-from, .cs-lb-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 760px) {
  .cs-hero { grid-template-columns: 1fr; gap: 24rem; }
  .cs-hero__cover { max-width: 260rem; order: -1; }
  .cs-body { grid-template-columns: 1fr; gap: 26rem; }
}
@media (max-width: 640px) {
  .cs-inner { padding: calc(96rem + var(--safe-top)) 16rem calc(56rem + var(--safe-bottom)); }
  .cs-grid { grid-template-columns: repeat(2, 1fr); }
  .cs-lb__nav { width: 44rem; height: 44rem; font-size: 24rem; }
}
</style>
