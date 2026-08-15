<script setup lang="ts">
/**
 * The SEWA Chronicles — a case study, set as a story page.
 *
 * The four beats are sections on the editorial grid with their numbers hung in
 * the margin, and the comic pages are a gallery at their own 1400×1980
 * proportions rather than letterboxed into a landscape deck. A comic is a
 * thing you look at.
 */
useSeoMeta({
  title: 'The SEWA Chronicles — service-culture comics for Club Mahindra · Naveen Jose',
  description: 'A case study of The SEWA Chronicles: a comic magazine by Naveen Jose that teaches Club Mahindra hospitality teams the SEWA service values through true guest-service stories.',
  ogTitle: 'The SEWA Chronicles — a case study',
  ogDescription: 'A service-culture comic magazine that teaches hospitality values through true stories from the resort floor.',
  ogUrl: 'https://entertrainer.in/my-work/sewa-chronicles',
  ogImage: 'https://entertrainer.in/work/sewa/cover.webp'
})

interface Beat { h: string; body: string }
const beats: Beat[] = [
  { h: 'The problem', body: 'Service values usually live in a slide deck that nobody remembers. But hospitality is made of small human moments, and a resort team spread across the country needs those values to feel real, not like a poster in the back office.' },
  { h: 'The idea', body: 'Turn real guest-service moments into a comic. Each issue collects true stories of SEWA Champions, the housekeepers, front-office and food-and-beverage staff who went out of their way for a member, and draws them as short strips. People remember a story long after they forget a rule.' },
  { h: 'Why it teaches', body: 'Story over instruction: every value is shown happening, not described. Each strip names the real employee and resort, so good service is something to be seen doing. Every story is tagged with one named behaviour, so teams build a shared vocabulary — and a submission page keeps the next issue writing itself.' },
  { h: 'What I did', body: "I made it end to end: gathering the stories, writing and storyboarding each strip, illustrating the characters, and laying out the issue. It's the clearest example of how I like to design learning: warm, specific, and built around one real human moment." }
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

// ── Lightbox ───────────────────────────────────────────────────────────────
// Focus is moved into the dialog on open and returned to the thumbnail that
// opened it on close; without that, dismissing a lightbox drops keyboard users
// back at the top of the document.
const lightbox = ref<number | null>(null)
const opener = ref<HTMLElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

function open(i: number, e?: Event) {
  opener.value = (e?.currentTarget as HTMLElement) ?? null
  lightbox.value = i
  nextTick(() => dialog.value?.querySelector<HTMLButtonElement>('.lb__close')?.focus())
}
function close() {
  lightbox.value = null
  nextTick(() => opener.value?.focus())
}
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
  <EdShell width="page">
    <EdStoryHero
      category="projects"
      media="case study"
      title="The SEWA Chronicles"
      deck="Sixteen pages of true stories from the resort floor, drawn as comic strips and handed back to the teams they came from."
      stamp="Club Mahindra · 2023"
      :minutes="5"
      byline
    >
      <div class="cs__facts">
        <button class="cs__cover" @click="open(0, $event)" aria-label="Enlarge the cover">
          <img src="/work/sewa/cover.webp" alt="The SEWA Chronicles cover" width="1400" height="1980" />
        </button>
        <dl class="cs__meta">
          <div v-for="m in meta" :key="m.k">
            <dt class="t-mono">{{ m.k }}</dt>
            <dd>{{ m.v }}</dd>
          </div>
        </dl>
      </div>
    </EdStoryHero>

    <section class="cs__beats" aria-labelledby="cs-how">
      <h2 id="cs-how" class="t-mono cs__label">How it came together</h2>
      <div class="ed">
        <template v-for="(b, i) in beats" :key="b.h">
          <p class="ed-note cs__n u-reveal"><b>{{ String(i + 1).padStart(2, '0') }} / {{ String(beats.length).padStart(2, '0') }}</b></p>
          <section class="cs__beat u-reveal">
            <h3 class="cs__beat-h">{{ b.h }}</h3>
            <p class="cs__beat-b t-read">{{ b.body }}</p>
          </section>
        </template>
      </div>
    </section>

    <section class="cs__gallery" aria-labelledby="cs-pages">
      <h2 id="cs-pages" class="t-mono cs__label">Selected pages</h2>
      <ul class="cs__grid">
        <li v-for="(p, i) in pages" :key="p.src" class="u-reveal">
          <button class="sheet" @click="open(i, $event)" :aria-label="`Enlarge: ${p.cap}`">
            <span class="sheet__plate">
              <img :src="`/work/sewa/${p.src}.webp`" :alt="p.alt" loading="lazy" decoding="async" width="1400" height="1980" />
            </span>
            <span class="sheet__cap">
              <strong>{{ p.cap }}</strong>
              <span class="t-mono sheet__tag">{{ p.tag }}</span>
            </span>
          </button>
        </li>
      </ul>
    </section>

    <footer class="cs__foot">
      <p class="t-hand">Learning people actually want to finish — that's the whole idea.</p>
      <div class="cs__links">
        <NuxtLink to="/my-work" class="ticket ticket--ghost">← All work</NuxtLink>
        <NuxtLink to="/tools" class="ticket">See the tools I build →</NuxtLink>
      </div>
    </footer>

    <EdReadNext from="sewa-chronicles" />

    <!-- Lightbox -->
    <Transition name="lb">
      <div v-if="lightbox !== null" ref="dialog" class="lb" role="dialog" aria-modal="true"
           :aria-label="pages[lightbox].cap" @click.self="close()">
        <button class="lb__close" aria-label="Close" @click="close()">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <button class="lb__nav lb__nav--prev" aria-label="Previous page" @click.stop="step(-1)">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
        </button>
        <figure class="lb__fig">
          <img :src="`/work/sewa/${pages[lightbox].src}.webp`" :alt="pages[lightbox].alt" />
          <figcaption class="t-mono">{{ pages[lightbox].cap }} · {{ pages[lightbox].tag }}</figcaption>
        </figure>
        <button class="lb__nav lb__nav--next" aria-label="Next page" @click.stop="step(1)">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </div>
    </Transition>
  </EdShell>
</template>

<style scoped>
.cs__facts {
  margin-top: clamp(24rem, 4vw, 38rem);
  display: grid; grid-template-columns: 260rem minmax(0, 1fr);
  gap: clamp(20rem, 3vw, 40rem); align-items: start;
}
.cs__cover {
  display: block; padding: 0; cursor: zoom-in;
  border: var(--stroke) solid var(--line); border-radius: var(--radius-m);
  overflow: hidden; background: var(--paper-2);
  
  transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .cs__cover:hover {   } }
.cs__cover img { display: block; width: 100%; height: auto; }

.cs__meta {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rem 32rem; margin: 0; max-width: 520rem;
}
.cs__meta dt { color: var(--muted); margin-bottom: 5rem; }
.cs__meta dd { margin: 0; font-size: 15.5rem; font-weight: 600; line-height: 1.35; }

@media (max-width: 720px) { .cs__facts { grid-template-columns: minmax(0, 1fr); } .cs__cover { max-width: 260rem; } }

.cs__label {
  margin: 0 0 22rem; padding-bottom: 12rem;
  border-bottom: var(--stroke) solid var(--line); color: var(--muted);
}
.cs__beats, .cs__gallery { margin-top: clamp(40rem, 7vh, 76rem); }
.cs__n { margin: 0; }
.cs__beat { margin-bottom: 30rem; }
.cs__beat-h { font-size: var(--type-h2); margin: 0 0 12rem; }
.cs__beat-b { margin: 0; max-width: var(--measure-body); }

.cs__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: clamp(18rem, 2.4vw, 28rem);
  grid-template-columns: repeat(auto-fill, minmax(260rem, 1fr));
}
.sheet { display: flex; flex-direction: column; gap: 12rem; width: 100%; text-align: left; padding: 0; cursor: zoom-in; }
.sheet__plate {
  display: block; overflow: hidden; background: var(--paper-2);
  border: var(--stroke) solid var(--line); border-radius: var(--radius-m);
  
  transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .sheet:hover .sheet__plate {   } }
.sheet__plate img { display: block; width: 100%; height: auto; }
.sheet__cap { display: flex; flex-direction: column; gap: 4rem; }
.sheet__cap strong { font-size: 16rem; font-weight: 700; }
.sheet__tag { color: var(--muted); }

.cs__foot {
  margin-top: clamp(44rem, 7vh, 80rem); padding-top: 26rem;
  border-top: var(--stroke) solid var(--line);
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20rem;
}
.cs__foot p { margin: 0; font-size: 18rem; max-width: 34ch; }
.cs__links { display: flex; flex-wrap: wrap; gap: 12rem; }

/* ── Lightbox ──────────────────────────────────────────────────────────── */
.lb {
  position: fixed; inset: 0; z-index: var(--z-overlay);
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center;
  gap: clamp(8rem, 2vw, 24rem);
  padding: clamp(16rem, 4vw, 48rem);
  background: color-mix(in srgb, var(--ink) 88%, transparent);
}
.lb__fig { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 12rem; min-width: 0; }
.lb__fig img {
  max-width: 100%; max-height: 78vh; object-fit: contain;
  border: var(--stroke) solid var(--paper); border-radius: var(--radius-s); background: var(--paper);
}
.lb__fig figcaption { color: var(--paper); }
.lb__close {
  position: absolute; top: clamp(14rem, 3vw, 26rem); right: clamp(14rem, 3vw, 26rem);
  width: 44rem; height: 44rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--paper); color: var(--ink); border: var(--stroke) solid var(--line);
}
.lb__nav {
  width: 48rem; height: 48rem; border-radius: 50%; flex: none;
  display: flex; align-items: center; justify-content: center;
  background: var(--paper); color: var(--ink); border: var(--stroke) solid var(--line);
}
.lb__close:focus-visible, .lb__nav:focus-visible { outline: 3px solid var(--yellow); outline-offset: 3px; }

.lb-enter-active, .lb-leave-active { transition: opacity var(--dur-mid) var(--ease-out); }
.lb-enter-from, .lb-leave-to { opacity: 0; }

@media (max-width: 560px) {
  .lb { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; }
  .lb__nav { position: static; }
  .lb__nav--prev { grid-row: 2; justify-self: start; }
  .lb__nav--next { grid-row: 2; justify-self: end; }
}
</style>
