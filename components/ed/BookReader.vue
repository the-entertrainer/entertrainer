<script setup lang="ts">
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

const activeIndex = ref(0)
const reducedMotion = ref(false)
const isTurning = ref(false)
const turnDirection = ref<'next' | 'previous'>('next')
const gestureStart = ref<number | null>(null)
let lastPointerTurnAt = 0
let motionQuery: MediaQueryList | undefined

const currentPage = computed(() => props.pages[activeIndex.value])
const pageNumber = computed(() => String(activeIndex.value + 1).padStart(2, '0'))
const canPrevious = computed(() => activeIndex.value > 0)
const canNext = computed(() => activeIndex.value < props.pages.length - 1)

function turn(direction: 'next' | 'previous') {
  if (isTurning.value || (direction === 'next' && !canNext.value) || (direction === 'previous' && !canPrevious.value)) return
  turnDirection.value = direction
  isTurning.value = true
  activeIndex.value += direction === 'next' ? 1 : -1
  if (reducedMotion.value) isTurning.value = false
}

function restart() {
  if (isTurning.value || activeIndex.value === 0) return
  turnDirection.value = 'previous'
  isTurning.value = true
  activeIndex.value = 0
  if (reducedMotion.value) isTurning.value = false
}

function handleKey(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    turn('previous')
  }
  if (event.key === 'ArrowRight' || event.key === ' ') {
    event.preventDefault()
    turn('next')
  }
  if (event.key === 'Home') {
    event.preventDefault()
    restart()
  }
}

function onPointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('a, button')) return
  gestureStart.value = event.clientX
}

function onPointerUp(event: PointerEvent) {
  if (gestureStart.value === null) return
  const delta = event.clientX - gestureStart.value
  const boundary = (event.currentTarget as HTMLElement).getBoundingClientRect()
  gestureStart.value = null

  if (Math.abs(delta) > 42) {
    turn(delta < 0 ? 'next' : 'previous')
    lastPointerTurnAt = Date.now()
    return
  }

  const position = (event.clientX - boundary.left) / boundary.width
  if (position > 0.68) {
    turn('next')
    lastPointerTurnAt = Date.now()
  }
  if (position < 0.32) {
    turn('previous')
    lastPointerTurnAt = Date.now()
  }
}

function onStageClick(event: MouseEvent) {
  if (Date.now() - lastPointerTurnAt < 420 || (event.target as HTMLElement).closest('a, button')) return
  const boundary = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const position = (event.clientX - boundary.left) / boundary.width
  if (position > 0.68) turn('next')
  if (position < 0.32) turn('previous')
}

function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  isTurning.value = false
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
})

onBeforeUnmount(() => motionQuery?.removeEventListener('change', onMotionChange))
</script>

<template>
  <article class="editorial-book" :class="{ 'editorial-book--turning': isTurning }" :aria-label="label" tabindex="0" @keydown="handleKey">
    <header class="editorial-book__masthead">
      <NuxtLink to="/" class="editorial-book__brand" aria-label="Entertrainer home">
        <EdWordmark :animate="false" />
      </NuxtLink>
      <p class="editorial-book__edition t-mono">FIELD NOTES · 2023</p>
      <NuxtLink :to="returnTo" class="editorial-book__exit">{{ returnLabel }}</NuxtLink>
    </header>

    <main class="editorial-book__reader">
      <section
        class="editorial-book__stage"
        aria-roledescription="book"
        :aria-label="`${label}, page ${activeIndex + 1} of ${pages.length}`"
        aria-describedby="sewa-reader-help"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @click="onStageClick"
      >
        <span class="editorial-book__edge editorial-book__edge--previous" aria-hidden="true" />
        <span class="editorial-book__edge editorial-book__edge--next" aria-hidden="true" />

        <Transition :name="turnDirection === 'next' ? 'book-turn-next' : 'book-turn-previous'" mode="out-in" @after-enter="isTurning = false">
          <section :key="currentPage.id" class="editorial-book__sheet" :class="`editorial-book__sheet--${currentPage.kind}`">
            <template v-if="currentPage.kind === 'cover'">
              <img class="editorial-book__cover-image" :src="`/work/sewa/${currentPage.src}.webp`" :alt="currentPage.alt" draggable="false" />
            </template>

            <template v-else-if="currentPage.kind === 'comic'">
              <figure class="editorial-book__comic-figure">
                <img :src="`/work/sewa/${currentPage.src}.webp`" :alt="currentPage.alt" draggable="false" />
                <figcaption>
                  <span>{{ currentPage.caption }}</span>
                  <span class="t-mono">{{ currentPage.tag }}</span>
                </figcaption>
              </figure>
            </template>

            <template v-else>
              <div class="editorial-book__paper">
                <p v-if="currentPage.eyebrow" class="editorial-book__eyebrow t-mono">{{ currentPage.eyebrow }}</p>
                <p v-if="currentPage.kicker" class="editorial-book__kicker">{{ currentPage.kicker }}</p>
                <h1>{{ currentPage.title }}</h1>
                <div v-if="currentPage.body" class="editorial-book__copy t-read">
                  <p v-for="paragraph in currentPage.body" :key="paragraph">{{ paragraph }}</p>
                </div>
                <blockquote v-if="currentPage.quote">{{ currentPage.quote }}</blockquote>
                <ol v-if="currentPage.steps" class="editorial-book__steps">
                  <li v-for="(step, stepIndex) in currentPage.steps" :key="step"><span class="t-mono">0{{ stepIndex + 1 }}</span>{{ step }}</li>
                </ol>
                <p v-if="currentPage.credit" class="editorial-book__credit t-mono">{{ currentPage.credit }}</p>
              </div>
            </template>
            <p v-if="currentPage.kind !== 'cover'" class="editorial-book__folio t-mono">{{ pageNumber }}</p>
          </section>
        </Transition>
      </section>

      <p id="sewa-reader-help" class="editorial-book__sr-only">
        Swipe left or tap the right page edge for the next page. Swipe right or tap the left page edge for the previous page. Use left and right arrow keys to turn pages. Press Home to return to the cover.
      </p>
      <p class="editorial-book__sr-only" role="status" aria-live="polite">Page {{ activeIndex + 1 }} of {{ pages.length }}. {{ currentPage.title || currentPage.caption }}</p>
      <nav class="editorial-book__sr-only" aria-label="Book navigation">
        <button type="button" :disabled="!canPrevious" @click="turn('previous')">Previous page</button>
        <button type="button" :disabled="!canNext" @click="turn('next')">Next page</button>
        <button type="button" @click="restart">Return to cover</button>
      </nav>
    </main>
  </article>
</template>

<style scoped>
/* SEWA reader: a single bound sheet with content-contained turns and gesture-led navigation. */
.editorial-book { min-height: 100dvh; color: #151314; background: #f4f0e9; display: flex; flex-direction: column; outline: none; }
.editorial-book__masthead { min-height: 72rem; padding: 14rem clamp(18rem, 4vw, 62rem); display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; border-bottom: 1px solid #191719; background: #f6f3ee; }
.editorial-book__brand { justify-self: start; color: #151314; }
.editorial-book__brand :deep(.wordmark) { max-width: 185rem; }
.editorial-book__edition { margin: 0; letter-spacing: .12em; font-size: 10rem; color: #6d6765; }
.editorial-book__exit { justify-self: end; min-height: 44rem; display: inline-flex; align-items: center; border-bottom: 1px solid currentColor; font-size: 13rem; font-weight: 700; }
.editorial-book__reader { flex: 1; display: flex; flex-direction: column; }
.editorial-book__stage { position: relative; flex: 1; min-height: calc(100dvh - 72rem); display: grid; place-items: center; padding: clamp(22rem, 5vw, 68rem); overflow: hidden; touch-action: pan-y; cursor: ew-resize; background: radial-gradient(circle at 50% 23%, #fff 0, #f5f1e9 47%, #e5ddd0 100%); }
.editorial-book__stage::before { content: ''; position: absolute; width: min(92vw, 710rem); height: min(84dvh, 800rem); background: rgba(63,49,35,.13); filter: blur(34rem); transform: translateY(18rem) scale(.94); pointer-events: none; }
.editorial-book__stage::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; background: linear-gradient(90deg, transparent 42%, rgba(19,14,11,.14) 50%, transparent 58%); transition: opacity 180ms ease; }
.editorial-book--turning .editorial-book__stage::after { opacity: 1; }
.editorial-book__sheet { position: relative; z-index: 1; width: min(100%, 620rem); height: min(82dvh, 760rem); min-height: min(132vw, 500rem); overflow: hidden; isolation: isolate; contain: paint; clip-path: inset(0); transform: translateZ(0); backface-visibility: hidden; transform-style: preserve-3d; background: #fcfaf6; color: #151314; box-shadow: 0 18rem 34rem rgba(50,39,29,.18), 6rem 8rem 0 rgba(50,39,29,.11); }
.editorial-book__sheet > * { position: relative; z-index: 1; backface-visibility: hidden; transform: translateZ(0); }
.editorial-book__sheet::before { content: ''; position: absolute; z-index: 2; inset: 0; pointer-events: none; border: 1px solid rgba(30,24,19,.16); box-shadow: inset 0 0 0 8rem rgba(255,255,255,.15); }
.editorial-book__sheet--cover { background: #bf7b31; }
.editorial-book__cover-image { display: block; width: 100%; height: 100%; object-fit: cover; filter: saturate(.95) contrast(1.02); }
.editorial-book__paper { height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; padding: clamp(32rem, 7vw, 68rem); background: linear-gradient(105deg, #fffdf8 0%, #f7f0e5 100%); }
.editorial-book__eyebrow { margin: 0 0 18rem; color: #a23f32; font-size: 10rem; letter-spacing: .17em; }
.editorial-book__kicker { margin: 0 0 12rem; color: #6b6560; font-style: italic; font-family: 'Source Serif 4', Georgia, serif; }
.editorial-book__paper h1 { margin: 0; max-width: 8.8ch; font-family: Fraunces, Georgia, serif; font-size: clamp(34rem, 5vw, 58rem); letter-spacing: -.065em; line-height: .94; }
.editorial-book__copy { margin-top: clamp(16rem, 2vw, 26rem); max-width: 33ch; font-size: clamp(16rem, 1.8vw, 20rem); line-height: 1.48; }
.editorial-book__copy p { margin: 0 0 12rem; }
.editorial-book__sheet blockquote { margin: clamp(18rem, 2.5vw, 30rem) 0 0; padding: 14rem 0 0; border-top: 1px solid #151314; max-width: 20ch; font-family: Fraunces, Georgia, serif; font-size: clamp(21rem, 2.7vw, 31rem); line-height: 1.03; letter-spacing: -.04em; }
.editorial-book__steps { list-style: none; margin: 30rem 0 0; padding: 0; border-top: 1px solid #151314; }
.editorial-book__steps li { display: grid; grid-template-columns: 36rem 1fr; gap: 12rem; padding: 12rem 0; border-bottom: 1px solid #d4cdc3; font-weight: 650; font-size: clamp(15rem, 1.7vw, 18rem); }
.editorial-book__steps span { color: #a23f32; font-size: 10rem; letter-spacing: .08em; }
.editorial-book__credit { margin: auto 0 0; padding-top: 20rem; color: #766f68; font-size: 10rem; letter-spacing: .1em; }
.editorial-book__comic-figure { height: 100%; margin: 0; display: grid; grid-template-rows: 1fr auto; background: #171415; }
.editorial-book__comic-figure img { display: block; width: 100%; height: 100%; object-fit: contain; background: #171415; }
.editorial-book__comic-figure figcaption { display: flex; justify-content: space-between; gap: 12rem; padding: 12rem 16rem; color: #f6f3ee; background: #171415; font-size: 12rem; }
.editorial-book__comic-figure figcaption span:last-child { text-align: right; color: #f5ac81; font-size: 10rem; letter-spacing: .08em; }
.editorial-book__folio { position: absolute; z-index: 3; bottom: 14rem; right: 18rem; margin: 0; color: #807a76; font-size: 10rem; letter-spacing: .12em; }
.editorial-book__edge { position: absolute; z-index: 0; top: 50%; width: 34rem; height: 86rem; transform: translateY(-50%); opacity: .5; pointer-events: none; }
.editorial-book__edge--previous { left: max(12rem, calc(50% - 386rem)); border-left: 1px solid #151314; border-top: 1px solid #151314; transform: translateY(-50%) rotate(-45deg); }
.editorial-book__edge--next { right: max(12rem, calc(50% - 386rem)); border-right: 1px solid #151314; border-bottom: 1px solid #151314; transform: translateY(-50%) rotate(-45deg); }
.editorial-book__sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.editorial-book__brand:focus-visible, .editorial-book__exit:focus-visible, .editorial-book:focus-visible { outline: 3px solid #315fc7; outline-offset: 4rem; }

.book-turn-next-enter-active, .book-turn-next-leave-active, .book-turn-previous-enter-active, .book-turn-previous-leave-active { transition: transform 620ms cubic-bezier(.22,.9,.23,1), opacity 420ms ease; transform-style: preserve-3d; backface-visibility: hidden; }
.book-turn-next-leave-active { position: absolute; transform-origin: left center; }
.book-turn-next-enter-active { transform-origin: right center; }
.book-turn-next-leave-to { opacity: 0; transform: perspective(1800px) rotateY(-78deg) translateZ(-50rem); }
.book-turn-next-enter-from { opacity: 0; transform: perspective(1800px) rotateY(38deg) translateX(5%) translateZ(-20rem); }
.book-turn-previous-leave-active { position: absolute; transform-origin: right center; }
.book-turn-previous-enter-active { transform-origin: left center; }
.book-turn-previous-leave-to { opacity: 0; transform: perspective(1800px) rotateY(78deg) translateZ(-50rem); }
.book-turn-previous-enter-from { opacity: 0; transform: perspective(1800px) rotateY(-38deg) translateX(-5%) translateZ(-20rem); }

@media (max-width: 680px) {
  .editorial-book__masthead { grid-template-columns: 1fr auto; min-height: 60rem; }
  .editorial-book__edition { display: none; }
  .editorial-book__brand :deep(.wordmark) { max-width: 160rem; }
  .editorial-book__stage { min-height: calc(100dvh - 60rem); padding: 18rem 14rem; }
  .editorial-book__sheet { width: min(100%, 560rem); height: min(79dvh, 720rem); min-height: 440rem; }
  .editorial-book__paper { padding: 32rem 28rem; }
  .editorial-book__paper h1 { font-size: clamp(34rem, 10vw, 54rem); }
  .editorial-book__copy { font-size: 17rem; }
  .editorial-book__edge { opacity: .32; }
}

@media (prefers-reduced-motion: reduce) {
  .editorial-book__sheet, .editorial-book__stage::after { transition: none !important; animation: none !important; }
}
</style>
