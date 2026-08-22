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

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,600;6..96,700;6..96,800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap' },
  ],
})

const bookRoot = ref<HTMLElement | null>(null)
const pageFlip = shallowRef<PageFlip | null>(null)
const activeIndex = ref(0)
const reducedMotion = ref(false)
const readerReady = ref(false)
let motionQuery: MediaQueryList | undefined

const currentPage = computed(() => props.pages[activeIndex.value])
const pageNumber = computed(() => String(activeIndex.value + 1).padStart(2, '0'))
const canPrevious = computed(() => activeIndex.value > 0)
const canNext = computed(() => activeIndex.value < props.pages.length - 1)
const flipState = ref('read')
const touchStart = ref<{ x: number, y: number } | null>(null)

const canvasSize = { width: 1120, height: 1520 }

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  })
  if (line) lines.push(line)
  return lines
}

function drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const lines = wrapLines(context, text, maxWidth)
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight))
  return y + lines.length * lineHeight
}

function drawRule(context: CanvasRenderingContext2D, y: number) {
  context.save()
  context.strokeStyle = '#b04434'
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(92, y)
  context.lineTo(190, y)
  context.stroke()
  context.restore()
}

function renderNarrativePage(page: EditorialBookPage, index: number) {
  const canvas = document.createElement('canvas')
  canvas.width = canvasSize.width
  canvas.height = canvasSize.height
  const context = canvas.getContext('2d')!
  const { width, height } = canvasSize

  const paper = context.createLinearGradient(0, 0, width, height)
  paper.addColorStop(0, '#fffdf8')
  paper.addColorStop(1, '#f3ebdf')
  context.fillStyle = paper
  context.fillRect(0, 0, width, height)

  context.fillStyle = 'rgba(100, 70, 45, .055)'
  for (let x = 42; x < width; x += 74) context.fillRect(x, 0, 1, height)

  const margin = 126
  let cursor = 176
  if (page.eyebrow) {
    context.fillStyle = '#7c3028'
    context.font = '700 23px "IBM Plex Mono", monospace'
    context.fillText(page.eyebrow, margin, cursor)
    drawRule(context, cursor + 38)
    cursor += 112
  }

  context.fillStyle = '#181413'
  context.font = '800 82px "Bodoni Moda", Didot, Georgia, serif'
  cursor = drawWrappedText(context, page.title || '', margin, cursor, 790, 88)
  cursor += 54

  context.fillStyle = '#2b2522'
  context.font = '400 32px "Libre Baskerville", Georgia, serif'
  for (const paragraph of page.body || []) {
    cursor = drawWrappedText(context, paragraph, margin, cursor, 812, 52)
    cursor += 30
  }

  if (page.steps?.length) {
    cursor += 12
    context.strokeStyle = '#1d1816'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(margin, cursor)
    context.lineTo(width - margin, cursor)
    context.stroke()
    cursor += 48
    for (const [stepIndex, step] of page.steps.entries()) {
      context.fillStyle = '#a23f32'
      context.font = '700 22px "IBM Plex Mono", monospace'
      context.fillText(String(stepIndex + 1).padStart(2, '0'), margin, cursor)
      context.fillStyle = '#201a18'
      context.font = '700 29px "Libre Baskerville", Georgia, serif'
      cursor = drawWrappedText(context, step, margin + 82, cursor, 710, 42) + 22
    }
  }

  if (page.credit) {
    context.fillStyle = '#6c625d'
    context.font = '700 19px "IBM Plex Mono", monospace'
    context.fillText(page.credit, margin, height - 105)
  }

  context.fillStyle = '#88786d'
  context.font = '700 19px "IBM Plex Mono", monospace'
  context.textAlign = 'right'
  context.fillText(String(index + 1).padStart(2, '0'), width - margin, height - 72)
  context.textAlign = 'left'
  return canvas.toDataURL('image/png')
}

function visualSource(page: EditorialBookPage, index: number) {
  if (page.kind === 'cover' || page.kind === 'comic') return `/work/sewa/${page.src}.webp`
  return renderNarrativePage(page, index)
}

async function startReader() {
  if (reducedMotion.value || !bookRoot.value) return
  await nextTick()
  try {
    await document.fonts.ready
    await Promise.all([
      document.fonts.load('800 86px "Bodoni Moda"'),
      document.fonts.load('400 34px "Libre Baskerville"'),
    ])
  } catch {
    // Browser fallbacks remain deliberately print-like when custom fonts are unavailable.
  }

  const images = props.pages.map(visualSource)
  pageFlip.value?.destroy()
  pageFlip.value = new PageFlip(bookRoot.value, {
    width: canvasSize.width,
    height: canvasSize.height,
    size: 'stretch',
    minWidth: 300,
    maxWidth: 1120,
    minHeight: 408,
    maxHeight: 1520,
    maxShadowOpacity: 0.72,
    showCover: true,
    mobileScrollSupport: false,
    usePortrait: true,
    drawShadow: true,
    flippingTime: 1180,
    startZIndex: 10,
    swipeDistance: 30,
    useMouseEvents: true,
    clickEventForward: false,
    disableFlipByClick: false,
  })
  pageFlip.value.loadFromImages(images)
  pageFlip.value.on('flip', (event: { data: number }) => { activeIndex.value = event.data })
  pageFlip.value.on('changeState', (event: { data: string }) => { flipState.value = event.data })
  readerReady.value = true
}

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
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previous()
  }
  if (event.key === 'ArrowRight' || event.key === ' ') {
    event.preventDefault()
    next()
  }
  if (event.key === 'Home') {
    event.preventDefault()
    restart()
  }
}

function focusReader(event: PointerEvent) {
  const reader = (event.currentTarget as HTMLElement).closest<HTMLElement>('.sewa-publication')
  reader?.focus({ preventScroll: true })
}

function onTouchStart(event: TouchEvent) {
  if (event.touches.length !== 1 || reducedMotion.value) return
  const touch = event.touches[0]
  touchStart.value = { x: touch.clientX, y: touch.clientY }
}

function onTouchEnd(event: TouchEvent) {
  if (!touchStart.value || reducedMotion.value) return
  const touch = event.changedTouches[0]
  const start = touchStart.value
  touchStart.value = null
  if (!touch) return

  const horizontalDistance = touch.clientX - start.x
  const verticalDistance = touch.clientY - start.y
  if (Math.abs(horizontalDistance) < 46 || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) return

  const pageBeforeFallback = activeIndex.value
  window.setTimeout(() => {
    const engineDidNotTurn = flipState.value === 'read' && activeIndex.value === pageBeforeFallback
    if (!engineDidNotTurn) return
    if (horizontalDistance < 0) next()
    else previous()
  }, 140)
}

function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  window.location.reload()
}

onMounted(async () => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
  await startReader()
})

onBeforeUnmount(() => {
  motionQuery?.removeEventListener('change', onMotionChange)
  pageFlip.value?.destroy()
})
</script>

<template>
  <article class="sewa-publication" :aria-label="label" tabindex="0" @keydown="handleKey">
    <header class="sewa-publication__masthead">
      <NuxtLink to="/" class="sewa-publication__brand" aria-label="Entertrainer home"><EdWordmark :animate="false" /></NuxtLink>
      <NuxtLink :to="returnTo" class="sewa-publication__exit">{{ returnLabel }}</NuxtLink>
    </header>

    <main class="sewa-publication__reader">
      <section class="sewa-publication__stage" :class="{ 'sewa-publication__stage--ready': readerReady }" aria-roledescription="book" :aria-label="`${label}, page ${activeIndex + 1} of ${pages.length}`" @pointerdown="focusReader" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <div v-if="!reducedMotion" ref="bookRoot" class="sewa-publication__flipbook" aria-hidden="true" />

        <section v-else class="sewa-publication__still" :class="`sewa-publication__still--${currentPage.kind}`">
          <img v-if="currentPage.kind === 'cover' || currentPage.kind === 'comic'" :src="`/work/sewa/${currentPage.src}.webp`" :alt="currentPage.alt" />
          <div v-else class="sewa-publication__still-copy">
            <p v-if="currentPage.eyebrow" class="sewa-publication__eyebrow">{{ currentPage.eyebrow }}</p>
            <h1>{{ currentPage.title }}</h1>
            <p v-for="paragraph in currentPage.body" :key="paragraph">{{ paragraph }}</p>
            <ol v-if="currentPage.steps"><li v-for="step in currentPage.steps" :key="step">{{ step }}</li></ol>
            <p v-if="currentPage.credit" class="sewa-publication__credit">{{ currentPage.credit }}</p>
          </div>
        </section>

        <span class="sewa-publication__corner sewa-publication__corner--previous" aria-hidden="true" />
        <span class="sewa-publication__corner sewa-publication__corner--next" aria-hidden="true" />
      </section>

      <p class="sewa-publication__sr-only" id="sewa-reader-help">Swipe, drag a corner, or tap a page edge. Use Left and Right Arrow keys to turn pages. Press Home to return to the cover.</p>
      <p class="sewa-publication__sr-only" role="status" aria-live="polite">Page {{ activeIndex + 1 }} of {{ pages.length }}. {{ currentPage.title || currentPage.caption }}</p>
      <section class="sewa-publication__sr-only" aria-label="Book content" aria-describedby="sewa-reader-help">
        <template v-for="(page, index) in pages" :key="page.id">
          <article v-if="index === activeIndex">
            <h1>{{ page.title || page.caption || 'The SEWA Chronicles cover' }}</h1>
            <p v-if="page.alt">{{ page.alt }}</p>
            <p v-for="paragraph in page.body" :key="paragraph">{{ paragraph }}</p>
            <ol v-if="page.steps"><li v-for="step in page.steps" :key="step">{{ step }}</li></ol>
            <p v-if="page.credit">{{ page.credit }}</p>
          </article>
        </template>
      </section>
      <nav class="sewa-publication__sr-only" aria-label="Book navigation">
        <button type="button" :disabled="!canPrevious" @click="previous">Previous page</button>
        <button type="button" :disabled="!canNext" @click="next">Next page</button>
        <button type="button" @click="restart">Return to cover</button>
      </nav>
    </main>
  </article>
</template>

<style scoped>
/* SEWA publication: StPageFlip visual pages plus a semantic reading equivalent. */
.sewa-publication { min-height: 100dvh; color: #171210; background: #f2eadf; display: flex; flex-direction: column; outline: none; }
.sewa-publication__masthead { min-height: 66rem; padding: 12rem clamp(18rem, 4vw, 62rem); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2b211c; background: rgba(250,247,240,.96); }
.sewa-publication__brand { justify-self: start; color: #15110f; }
.sewa-publication__brand :deep(.wordmark) { max-width: 185rem; }
.sewa-publication__exit { min-height: 44rem; display: inline-flex; align-items: center; border-bottom: 1px solid currentColor; font-family: "Libre Baskerville", Georgia, serif; font-size: 13rem; font-weight: 700; }
.sewa-publication__reader { flex: 1; display: flex; flex-direction: column; }
.sewa-publication__stage { position: relative; flex: 1; min-height: calc(100dvh - 66rem); display: grid; place-items: center; padding: clamp(22rem, 5vw, 68rem); overflow: hidden; overscroll-behavior-x: contain; background: radial-gradient(ellipse at 50% 18%, #fffdf8 0, #f6efe4 44%, #dfd0bc 100%); }
.sewa-publication__stage::before { content: ''; position: absolute; width: min(88vw, 960rem); height: min(78dvh, 820rem); border-radius: 50%; background: rgba(61,35,22,.15); filter: blur(42rem); transform: translateY(34rem) scale(.9); pointer-events: none; }
.sewa-publication__flipbook { position: relative; z-index: 1; width: min(100%, 1120rem); height: min(82dvh, 760rem); min-height: 408rem; opacity: 0; touch-action: pan-y; -webkit-user-select: none; user-select: none; transition: opacity 260ms ease; }
.sewa-publication__stage--ready .sewa-publication__flipbook { opacity: 1; }
.sewa-publication__flipbook :deep(.stf__parent) { margin: 0 auto; }
.sewa-publication__flipbook :deep(.stf__wrapper) { box-shadow: 0 30rem 56rem rgba(50,35,23,.26), 0 0 0 1rem rgba(64,43,27,.1); }
.sewa-publication__flipbook :deep(.stf__block) { background: #fffdf8; }
.sewa-publication__corner { position: absolute; z-index: 0; top: 50%; width: 34rem; height: 84rem; opacity: .45; pointer-events: none; }
.sewa-publication__corner--previous { left: max(14rem, calc(50% - 580rem)); border-left: 1px solid #4b3830; border-top: 1px solid #4b3830; transform: translateY(-50%) rotate(-45deg); }
.sewa-publication__corner--next { right: max(14rem, calc(50% - 580rem)); border-right: 1px solid #4b3830; border-bottom: 1px solid #4b3830; transform: translateY(-50%) rotate(-45deg); }
.sewa-publication__still { position: relative; z-index: 1; width: min(100%, 560rem); min-height: min(132vw, 760rem); overflow: hidden; background: #fffdf8; box-shadow: 10rem 16rem 0 rgba(50,35,23,.15); }
.sewa-publication__still > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.sewa-publication__still-copy { min-height: inherit; box-sizing: border-box; padding: clamp(30rem, 7vw, 68rem); font: 400 18rem/1.55 "Libre Baskerville", Georgia, serif; }
.sewa-publication__still-copy h1 { font: 800 clamp(36rem, 10vw, 58rem)/.94 "Bodoni Moda", Didot, Georgia, serif; letter-spacing: -.055em; }
.sewa-publication__eyebrow { color: #a23f32; font: 700 10rem/1.2 "IBM Plex Mono", monospace; letter-spacing: .17em; }
.sewa-publication__credit { margin-top: 32rem; color: #766860; font: 700 10rem/1.2 "IBM Plex Mono", monospace; letter-spacing: .1em; }
.sewa-publication__sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.sewa-publication:focus-visible, .sewa-publication__brand:focus-visible, .sewa-publication__exit:focus-visible { outline: 3px solid #315fc7; outline-offset: 4rem; }
@media (max-width: 680px) {
  .sewa-publication__masthead { min-height: 60rem; }
  .sewa-publication__brand :deep(.wordmark) { max-width: 160rem; }
  .sewa-publication__stage { min-height: calc(100dvh - 60rem); padding: 18rem 14rem; }
  .sewa-publication__flipbook { height: min(79dvh, 720rem); min-height: 440rem; }
  .sewa-publication__corner { opacity: .3; }
}
@media (prefers-reduced-motion: reduce) { .sewa-publication__flipbook { transition: none; } }
</style>
