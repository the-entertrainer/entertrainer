<script setup lang="ts">
import { PageFlip } from 'page-flip'

export type EditorialBookPage = {
  id: string
  kind: 'cover' | 'narrative' | 'process' | 'comic' | 'closing'
  eyebrow?: string
  kicker?: string
  title?: string
  body?: string[]
  quote?: string
  steps?: string[]
  src?: string
  alt?: string
  caption?: string
  tag?: string
  credit?: string
}

const props = withDefaults(defineProps<{
  pages: EditorialBookPage[]
  label: string
  returnTo?: string
  returnLabel?: string
}>(), {
  returnTo: '/my-work',
  returnLabel: 'All projects',
})

const bookRoot = ref<HTMLElement | null>(null)
const pageFlip = shallowRef<PageFlip | null>(null)
const activeIndex = ref(0)
const reducedMotion = ref(false)
let motionQuery: MediaQueryList | undefined
const onMotionChange = () => window.location.reload()

const currentPage = computed(() => props.pages[activeIndex.value])
const canPrevious = computed(() => activeIndex.value > 0)
const canNext = computed(() => activeIndex.value < props.pages.length - 1)

function previous() {
  if (!canPrevious.value) return
  if (reducedMotion.value) activeIndex.value -= 1
  else pageFlip.value?.flipPrev('bottom')
}

function next() {
  if (!canNext.value) return
  if (reducedMotion.value) activeIndex.value += 1
  else pageFlip.value?.flipNext('bottom')
}

function restart() {
  if (reducedMotion.value) activeIndex.value = 0
  else pageFlip.value?.turnToPage(0)
}

function handleKey(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') previous()
  if (event.key === 'ArrowRight') next()
}

async function startPageFlip() {
  if (reducedMotion.value || !bookRoot.value) return
  await nextTick()
  const sheets = Array.from(bookRoot.value.querySelectorAll<HTMLElement>('[data-book-page]'))
  pageFlip.value?.destroy()
  pageFlip.value = new PageFlip(bookRoot.value, {
    width: 560,
    height: 760,
    size: 'stretch',
    minWidth: 300,
    maxWidth: 1120,
    minHeight: 408,
    maxHeight: 1520,
    maxShadowOpacity: 0.46,
    showCover: true,
    mobileScrollSupport: false,
    usePortrait: true,
    drawShadow: true,
    flippingTime: 940,
    startZIndex: 10,
  })
  pageFlip.value.loadFromHTML(sheets)
  pageFlip.value.on('flip', (event: { data: number }) => {
    activeIndex.value = event.data
  })
}

onMounted(async () => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
  await startPageFlip()
})

onBeforeUnmount(() => {
  motionQuery?.removeEventListener('change', onMotionChange)
  pageFlip.value?.destroy()
})
</script>

<template>
  <article class="editorial-book" :aria-label="label" @keydown.left.prevent="previous" @keydown.right.prevent="next">
    <header class="editorial-book__masthead">
      <NuxtLink to="/" class="editorial-book__brand" aria-label="Entertrainer home">
        <EdWordmark :animate="false" />
      </NuxtLink>
      <p class="editorial-book__edition t-mono">FIELD NOTES · 2023</p>
      <NuxtLink :to="returnTo" class="editorial-book__exit">{{ returnLabel }}</NuxtLink>
    </header>

    <main class="editorial-book__reader">
      <div class="editorial-book__stage">
        <div v-if="!reducedMotion" ref="bookRoot" class="editorial-book__canvas" aria-label="Use the page controls or drag a corner to turn the book">
          <section v-for="(page, index) in pages" :key="page.id" class="editorial-book__page" :class="`editorial-book__page--${page.kind}`" data-book-page>
            <template v-if="page.kind === 'cover'">
              <img class="editorial-book__cover-image" :src="`/work/sewa/${page.src}.webp`" :alt="page.alt" draggable="false" />
              <div class="editorial-book__cover-type">
                <p class="editorial-book__cover-eyebrow t-mono">{{ page.eyebrow }}</p>
                <h1>{{ page.title }}</h1>
                <p>{{ page.kicker }}</p>
              </div>
            </template>

            <template v-else-if="page.kind === 'comic'">
              <figure class="editorial-book__comic-figure">
                <img :src="`/work/sewa/${page.src}.webp`" :alt="page.alt" draggable="false" />
                <figcaption>
                  <span>{{ page.caption }}</span>
                  <span class="t-mono">{{ page.tag }}</span>
                </figcaption>
              </figure>
            </template>

            <template v-else>
              <div class="editorial-book__paper">
                <p v-if="page.eyebrow" class="editorial-book__eyebrow t-mono">{{ page.eyebrow }}</p>
                <p v-if="page.kicker" class="editorial-book__kicker">{{ page.kicker }}</p>
                <h2>{{ page.title }}</h2>
                <div v-if="page.body" class="editorial-book__copy t-read">
                  <p v-for="paragraph in page.body" :key="paragraph">{{ paragraph }}</p>
                </div>
                <blockquote v-if="page.quote">{{ page.quote }}</blockquote>
                <ol v-if="page.steps" class="editorial-book__steps">
                  <li v-for="(step, stepIndex) in page.steps" :key="step"><span class="t-mono">0{{ stepIndex + 1 }}</span>{{ step }}</li>
                </ol>
                <p v-if="page.credit" class="editorial-book__credit t-mono">{{ page.credit }}</p>
              </div>
            </template>
            <p class="editorial-book__folio t-mono">{{ String(index + 1).padStart(2, '0') }}</p>
          </section>
        </div>

        <section v-else class="editorial-book__still" :class="`editorial-book__page--${currentPage.kind}`" aria-live="polite">
          <template v-if="currentPage.kind === 'cover'">
            <img class="editorial-book__cover-image" :src="`/work/sewa/${currentPage.src}.webp`" :alt="currentPage.alt" />
            <div class="editorial-book__cover-type">
              <p class="editorial-book__cover-eyebrow t-mono">{{ currentPage.eyebrow }}</p>
              <h1>{{ currentPage.title }}</h1>
              <p>{{ currentPage.kicker }}</p>
            </div>
          </template>
          <template v-else-if="currentPage.kind === 'comic'">
            <figure class="editorial-book__comic-figure">
              <img :src="`/work/sewa/${currentPage.src}.webp`" :alt="currentPage.alt" />
              <figcaption><span>{{ currentPage.caption }}</span><span class="t-mono">{{ currentPage.tag }}</span></figcaption>
            </figure>
          </template>
          <template v-else>
            <div class="editorial-book__paper">
              <p v-if="currentPage.eyebrow" class="editorial-book__eyebrow t-mono">{{ currentPage.eyebrow }}</p>
              <p v-if="currentPage.kicker" class="editorial-book__kicker">{{ currentPage.kicker }}</p>
              <h2>{{ currentPage.title }}</h2>
              <div v-if="currentPage.body" class="editorial-book__copy t-read"><p v-for="paragraph in currentPage.body" :key="paragraph">{{ paragraph }}</p></div>
              <blockquote v-if="currentPage.quote">{{ currentPage.quote }}</blockquote>
              <ol v-if="currentPage.steps" class="editorial-book__steps"><li v-for="(step, stepIndex) in currentPage.steps" :key="step"><span class="t-mono">0{{ stepIndex + 1 }}</span>{{ step }}</li></ol>
              <p v-if="currentPage.credit" class="editorial-book__credit t-mono">{{ currentPage.credit }}</p>
            </div>
          </template>
          <p class="editorial-book__folio t-mono">{{ String(activeIndex + 1).padStart(2, '0') }}</p>
        </section>
      </div>

      <nav class="editorial-book__controls" aria-label="Book controls">
        <button type="button" class="editorial-book__turn" :disabled="!canPrevious" @click="previous">Previous</button>
        <p class="editorial-book__status t-mono" aria-live="polite">Page {{ activeIndex + 1 }} of {{ pages.length }}</p>
        <button type="button" class="editorial-book__turn editorial-book__turn--next" :disabled="!canNext" @click="next">Next</button>
      </nav>
    </main>

    <footer class="editorial-book__footer">
      <p>{{ currentPage.caption || currentPage.title }}</p>
      <button type="button" class="editorial-book__restart" @click="restart">Read from cover</button>
    </footer>
  </article>
</template>

<style scoped>
/* SEWA book journey: original comic pages in a quiet fashion-editorial reading room. */
.editorial-book { min-height: 100dvh; color: #151314; background: #f6f3ee; display: flex; flex-direction: column; }
.editorial-book__masthead { min-height: 72rem; padding: 14rem clamp(18rem, 4vw, 62rem); display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; border-bottom: 1px solid #191719; background: #f6f3ee; }
.editorial-book__brand { justify-self: start; color: #151314; }
.editorial-book__brand :deep(.wordmark) { max-width: 185rem; }
.editorial-book__edition { margin: 0; letter-spacing: .12em; font-size: 10rem; color: #6d6765; }
.editorial-book__exit { justify-self: end; min-height: 44rem; display: inline-flex; align-items: center; border-bottom: 1px solid currentColor; font-size: 13rem; font-weight: 700; }
.editorial-book__reader { flex: 1; display: grid; grid-template-rows: 1fr auto; }
.editorial-book__stage { min-height: calc(100dvh - 150rem); display: grid; place-items: center; padding: clamp(18rem, 4vw, 54rem); background: radial-gradient(circle at 50% 25%, #fff 0, #f6f3ee 47%, #e8e1d7 100%); overflow: hidden; }
.editorial-book__canvas { width: min(100%, 1120rem); height: min(72vw, 760rem); min-height: 480rem; }
.editorial-book__page, .editorial-book__still { position: relative; overflow: hidden; background: #fcfaf6; color: #151314; }
.editorial-book__page { width: 100%; height: 100%; }
.editorial-book__still { width: min(100%, 560rem); min-height: min(132vw, 760rem); border: 1px solid #151314; box-shadow: 12rem 16rem 0 rgba(21,19,20,.16); }
.editorial-book__folio { position: absolute; bottom: 14rem; right: 18rem; margin: 0; color: #807a76; font-size: 10rem; letter-spacing: .12em; }
.editorial-book__cover-image { display: block; width: 100%; height: 100%; object-fit: cover; filter: saturate(.95) contrast(1.02); }
.editorial-book__cover-type { position: absolute; inset: auto 0 0; padding: clamp(20rem, 4vw, 42rem); color: #fff9f0; background: linear-gradient(0deg, rgba(17,12,11,.85), transparent 78%); }
.editorial-book__cover-eyebrow { margin: 0 0 12rem; font-size: 10rem; letter-spacing: .16em; }
.editorial-book__cover-type h1 { max-width: 7ch; margin: 0; font-family: Fraunces, Georgia, serif; font-size: clamp(42rem, 8vw, 86rem); line-height: .88; letter-spacing: -.065em; }
.editorial-book__cover-type > p:last-child { margin: 16rem 0 0; font-family: 'Source Serif 4', Georgia, serif; font-size: clamp(16rem, 2vw, 21rem); max-width: 27ch; }
.editorial-book__paper { height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; padding: clamp(28rem, 5.2vw, 56rem); background: linear-gradient(105deg, #fffdf8 0%, #f8f2e9 100%); }
.editorial-book__eyebrow { margin: 0 0 18rem; color: #a23f32; font-size: 10rem; letter-spacing: .17em; }
.editorial-book__kicker { margin: 0 0 12rem; color: #6b6560; font-style: italic; font-family: 'Source Serif 4', Georgia, serif; }
.editorial-book__paper h2 { margin: 0; max-width: 8.7ch; font-family: Fraunces, Georgia, serif; font-size: clamp(32rem, 4.2vw, 52rem); letter-spacing: -.065em; line-height: .95; }
.editorial-book__copy { margin-top: clamp(14rem, 2vw, 24rem); max-width: 32ch; font-size: clamp(16rem, 1.7vw, 19rem); line-height: 1.45; }
.editorial-book__copy p { margin: 0 0 10rem; }
.editorial-book__paper blockquote { margin: clamp(16rem, 2.5vw, 30rem) 0 0; padding: 14rem 0 0; border-top: 1px solid #151314; max-width: 20ch; font-family: Fraunces, Georgia, serif; font-size: clamp(21rem, 2.7vw, 31rem); line-height: 1.03; letter-spacing: -.04em; }
.editorial-book__steps { list-style: none; margin: 30rem 0 0; padding: 0; border-top: 1px solid #151314; }
.editorial-book__steps li { display: grid; grid-template-columns: 36rem 1fr; gap: 12rem; padding: 12rem 0; border-bottom: 1px solid #d4cdc3; font-weight: 650; font-size: clamp(15rem, 1.7vw, 18rem); }
.editorial-book__steps span { color: #a23f32; font-size: 10rem; letter-spacing: .08em; }
.editorial-book__credit { margin: auto 0 0; padding-top: 20rem; color: #766f68; font-size: 10rem; letter-spacing: .1em; }
.editorial-book__comic-figure { height: 100%; margin: 0; display: grid; grid-template-rows: 1fr auto; background: #171415; }
.editorial-book__comic-figure img { display: block; width: 100%; height: 100%; object-fit: contain; background: #171415; }
.editorial-book__comic-figure figcaption { display: flex; justify-content: space-between; gap: 12rem; padding: 12rem 16rem; color: #f6f3ee; background: #171415; font-size: 12rem; }
.editorial-book__comic-figure figcaption span:last-child { text-align: right; color: #f5ac81; font-size: 10rem; letter-spacing: .08em; }
.editorial-book__controls { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12rem; align-items: center; padding: 13rem clamp(18rem, 4vw, 62rem); border-top: 1px solid #151314; background: #fffdf8; }
.editorial-book__turn { justify-self: start; min-height: 44rem; padding: 0 14rem; border: 1px solid #151314; font-weight: 700; background: transparent; }
.editorial-book__turn--next { justify-self: end; color: #fffdf8; background: #151314; }
.editorial-book__turn:disabled { opacity: .32; cursor: not-allowed; }
.editorial-book__status { margin: 0; color: #716b66; font-size: 10rem; letter-spacing: .1em; }
.editorial-book__footer { padding: 10rem clamp(18rem, 4vw, 62rem); display: flex; gap: 18rem; align-items: center; justify-content: space-between; background: #151314; color: #f6f3ee; }
.editorial-book__footer p { margin: 0; font-family: 'Source Serif 4', Georgia, serif; font-size: 14rem; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.editorial-book__restart { min-height: 36rem; flex: none; border-bottom: 1px solid currentColor; font-size: 12rem; font-weight: 700; }
.editorial-book__turn:focus-visible, .editorial-book__exit:focus-visible, .editorial-book__restart:focus-visible, .editorial-book__brand:focus-visible { outline: 3px solid #315fc7; outline-offset: 4rem; }

@media (max-width: 680px) {
  .editorial-book__masthead { grid-template-columns: 1fr auto; min-height: 60rem; }
  .editorial-book__edition { display: none; }
  .editorial-book__brand :deep(.wordmark) { max-width: 160rem; }
  .editorial-book__stage { min-height: calc(100dvh - 140rem); padding: 14rem; }
  .editorial-book__canvas { height: min(132vw, 720rem); min-height: 400rem; }
  .editorial-book__paper { padding: 30rem 28rem; }
  .editorial-book__paper h2 { font-size: clamp(34rem, 10vw, 54rem); }
  .editorial-book__copy { font-size: 17rem; }
  .editorial-book__controls { grid-template-columns: 1fr auto 1fr; }
  .editorial-book__footer p { max-width: 22ch; }
}

@media (prefers-reduced-motion: reduce) {
  .editorial-book__still { box-shadow: none; }
}
</style>
