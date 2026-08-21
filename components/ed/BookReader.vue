<script setup lang="ts">
import { PageFlip } from 'page-flip'

interface BookPage {
  src: string
  alt: string
  cap: string
  tag: string
}

const props = defineProps<{
  pages: BookPage[]
  label: string
}>()

const emit = defineEmits<{
  open: [index: number]
}>()

const bookRoot = ref<HTMLElement | null>(null)
const pageFlip = shallowRef<PageFlip | null>(null)
const activeIndex = ref(0)
const reducedMotion = ref(false)

function previous() {
  if (reducedMotion.value) {
    activeIndex.value = Math.max(0, activeIndex.value - 1)
    return
  }
  pageFlip.value?.flipPrev('bottom')
}

function next() {
  if (reducedMotion.value) {
    activeIndex.value = Math.min(props.pages.length - 1, activeIndex.value + 1)
    return
  }
  pageFlip.value?.flipNext('bottom')
}

onMounted(async () => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = media.matches
  const syncMotion = () => {
    const changed = reducedMotion.value !== media.matches
    reducedMotion.value = media.matches
    if (changed) window.location.reload()
  }
  media.addEventListener('change', syncMotion)

  if (reducedMotion.value) return
  await nextTick()
  if (!bookRoot.value) return

  const pages = Array.from(bookRoot.value.querySelectorAll<HTMLElement>('[data-book-page]'))
  pageFlip.value = new PageFlip(bookRoot.value, {
    width: 460,
    height: 644,
    size: 'stretch',
    minWidth: 280,
    maxWidth: 920,
    minHeight: 392,
    maxHeight: 1288,
    maxShadowOpacity: 0.42,
    showCover: true,
    mobileScrollSupport: false,
    usePortrait: true,
    drawShadow: true,
    flippingTime: 860,
    startZIndex: 10,
  })
  pageFlip.value.loadFromHTML(pages)
  pageFlip.value.on('flip', (event: { data: number }) => {
    activeIndex.value = event.data
  })
})

onBeforeUnmount(() => pageFlip.value?.destroy())
</script>

<template>
  <section class="book-reader" :aria-label="label">
    <div class="book-reader__stage">
      <div v-if="!reducedMotion" ref="bookRoot" class="book-reader__canvas" aria-label="Drag or use the controls to turn pages">
        <article v-for="(page, index) in pages" :key="page.src" class="book-reader__page" data-book-page>
          <figure>
            <img :src="`/work/sewa/${page.src}.webp`" :alt="page.alt" draggable="false" />
            <figcaption>
              <span>{{ page.cap }}</span>
              <span class="t-mono">{{ page.tag }}</span>
            </figcaption>
          </figure>
        </article>
      </div>

      <figure v-else class="book-reader__still">
        <img :src="`/work/sewa/${pages[activeIndex].src}.webp`" :alt="pages[activeIndex].alt" />
        <figcaption>
          <span>{{ pages[activeIndex].cap }}</span>
          <span class="t-mono">{{ pages[activeIndex].tag }}</span>
        </figcaption>
      </figure>
    </div>

    <div class="book-reader__controls" aria-label="Book controls">
      <button type="button" class="ticket ticket--ghost" :disabled="activeIndex === 0" @click="previous">
        Previous page
      </button>
      <p class="book-reader__status t-mono" aria-live="polite">Page {{ activeIndex + 1 }} of {{ pages.length }}</p>
      <button type="button" class="ticket" :disabled="activeIndex === pages.length - 1" @click="next">
        Next page
      </button>
      <button type="button" class="book-reader__open" @click="emit('open', activeIndex)">
        View full page
      </button>
    </div>
  </section>
</template>

<style scoped>
/* Paper Signal book reader: black ink, paper edges, real SEWA comic pages. */
.book-reader { display: grid; gap: 18rem; }
.book-reader__stage {
  min-height: clamp(430rem, 64vw, 730rem);
  display: grid; place-items: center; overflow: hidden;
  padding: clamp(18rem, 3vw, 42rem);
  background: linear-gradient(135deg, var(--paper-2), color-mix(in srgb, var(--blue) 10%, var(--paper)));
  border: var(--stroke) solid var(--line);
  box-shadow: 10rem 12rem 0 color-mix(in srgb, var(--blue) 16%, transparent);
}
.book-reader__canvas { width: min(100%, 920rem); height: min(64vw, 644rem); min-height: 430rem; }
.book-reader__page { background: var(--paper); }
.book-reader__page figure, .book-reader__still { height: 100%; margin: 0; display: grid; grid-template-rows: 1fr auto; background: var(--paper); }
.book-reader__page img, .book-reader__still img { display: block; width: 100%; height: 100%; object-fit: contain; background: var(--paper); }
.book-reader__page figcaption, .book-reader__still figcaption { display: flex; justify-content: space-between; gap: 12rem; padding: 10rem 12rem; font-size: 13rem; border-top: 1px solid var(--line); }
.book-reader__page figcaption span:last-child, .book-reader__still figcaption span:last-child { color: var(--muted); text-align: right; }
.book-reader__still { width: min(100%, 460rem); border: var(--stroke) solid var(--line); box-shadow: 8rem 10rem 0 color-mix(in srgb, var(--blue) 16%, transparent); }
.book-reader__controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10rem 14rem; }
.book-reader__controls button { min-height: 44rem; }
.book-reader__status { margin: 0 auto; color: var(--muted); }
.book-reader__open { border-bottom: 2px solid currentColor; padding: 8rem 0; font-weight: 700; }
.book-reader__open:hover, .book-reader__open:focus-visible { color: var(--blue); }
.book-reader__controls button:disabled { opacity: .42; cursor: not-allowed; }

@media (max-width: 640px) {
  .book-reader__stage { min-height: 0; padding: 14rem; }
  .book-reader__canvas { height: 500rem; min-height: 0; }
  .book-reader__controls { display: grid; grid-template-columns: 1fr 1fr; }
  .book-reader__status { grid-column: 1 / -1; grid-row: 1; text-align: center; }
  .book-reader__open { grid-column: 1 / -1; justify-self: center; }
}

@media (prefers-reduced-motion: reduce) {
  .book-reader__stage { box-shadow: none; }
}
</style>
