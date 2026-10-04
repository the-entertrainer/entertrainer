<script setup lang="ts">
import FiveSlicesArt from './FiveSlicesArt.vue'
import { formatSliceDate, slicesNewestFirst, type SliceStory } from '~/content/five-slices'

/**
 * 5 Slices. A reel over the publication, not a restyle of it.
 * Frames advance only when the reader moves: wheel, swipe, keys.
 * Nothing here plays on a timer.
 */
const route = useRoute()
const { open, closeSlices } = useFiveSlices()

const stories = slicesNewestFirst()
const storyId = ref(stories[0]!.id)
const index = ref(0)
const dialog = ref<HTMLElement | null>(null)
const scroller = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)

const story = computed(() => stories.find((s) => s.id === storyId.value) ?? stories[0]!)
const frame = computed(() => story.value.frames[index.value] ?? story.value.frames[0]!)
const indexLabel = computed(() => String(index.value + 1).padStart(2, '0'))

function newest(): SliceStory {
  return stories[0]!
}

function beginNewest() {
  storyId.value = newest().id
  index.value = 0
  nextTick(() => {
    if (scroller.value) scroller.value.scrollTop = 0
  })
}

function selectStory(id: string) {
  if (id !== storyId.value) {
    storyId.value = id
    index.value = 0
    nextTick(() => {
      if (scroller.value) scroller.value.scrollTop = 0
    })
    return
  }
  stepTo(0)
}

function reducedMotion() {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.reduceMotion === 'on'
}

function stepTo(next: number) {
  const el = scroller.value
  const frames = story.value.frames.length
  const clamped = Math.max(0, Math.min(frames - 1, next))
  index.value = clamped
  if (!el) return
  el.scrollTo({
    top: clamped * el.clientHeight,
    behavior: reducedMotion() ? 'auto' : 'smooth'
  })
}

function step(delta: number) {
  stepTo(index.value + delta)
}

function syncIndex() {
  const el = scroller.value
  if (!el || el.clientHeight === 0) return
  const next = Math.round(el.scrollTop / el.clientHeight)
  const last = story.value.frames.length - 1
  index.value = Math.max(0, Math.min(last, next))
}

let wheelLocked = false
let wheelTimer = 0
function onWheel(e: WheelEvent) {
  e.preventDefault()
  if (wheelLocked) return
  if (Math.abs(e.deltaY) < 2 && Math.abs(e.deltaX) < 8) return
  const dir = Math.abs(e.deltaY) >= Math.abs(e.deltaX)
    ? (e.deltaY > 0 ? 1 : -1)
    : 0
  if (!dir) return
  wheelLocked = true
  step(dir)
  window.clearTimeout(wheelTimer)
  wheelTimer = window.setTimeout(() => { wheelLocked = false }, reducedMotion() ? 0 : 380)
}

function onKey(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closeSlices()
    return
  }
  if (e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault()
    step(1)
    return
  }
  if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault()
    step(-1)
    return
  }
  if (e.key !== 'Tab' || !dialog.value) return
  const nodes = [...dialog.value.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)
  if (nodes.length === 0) return
  const first = nodes[0]!
  const last = nodes[nodes.length - 1]!
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

let armed: HTMLElement | null = null
function arm() {
  disarm()
  const el = dialog.value
  if (!el) return
  armed = el
  el.addEventListener('wheel', onWheel, { passive: false })
}
function disarm() {
  armed?.removeEventListener('wheel', onWheel)
  armed = null
}

function lockPage(on: boolean) {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('five-slices-open', on)
}

watch(open, async (isOpen, wasOpen) => {
  lockPage(isOpen)
  if (isOpen && wasOpen !== true) beginNewest()
  if (!import.meta.client) return
  if (!isOpen) {
    disarm()
    return
  }
  await nextTick()
  arm()
  closeBtn.value?.focus()
}, { immediate: true })

watch(() => route.path, (path, prev) => {
  if (!prev || path === prev) return
  if (path === '/slices') {
    beginNewest()
    open.value = true
    return
  }
  if (open.value) open.value = false
})

onMounted(() => {
  window.addEventListener('keydown', onKey, true)
  if (open.value) {
    lockPage(true)
    arm()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey, true)
  disarm()
  window.clearTimeout(wheelTimer)
  lockPage(false)
})
</script>

<template>
  <div
    v-if="open"
    id="five-slices"
    ref="dialog"
    class="fs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="fs-title"
  >
    <div class="fs__top">
      <p class="fs__index" aria-hidden="true">{{ indexLabel }}</p>
      <button
        ref="closeBtn"
        type="button"
        class="fs__close"
        aria-label="Close 5 Slices"
        @click="closeSlices()"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <h2 id="fs-title" class="sr-only">5 Slices. {{ story.title }}</h2>
    <p class="sr-only" aria-live="polite">
      Frame {{ index + 1 }} of {{ story.frames.length }}. {{ frame.headline }}
    </p>

    <div
      :key="story.id"
      ref="scroller"
      class="fs__reel"
      tabindex="-1"
      @scroll.passive="syncIndex"
    >
      <section
        v-for="(item, i) in story.frames"
        :key="`${story.id}-${i}`"
        class="fs__frame"
        :aria-label="`Frame ${i + 1} of ${story.frames.length}`"
        :inert="i !== index"
      >
        <div class="fs__col">
          <p class="fs__kicker">{{ item.kicker }}</p>
          <h3 class="fs__headline">{{ item.headline }}</h3>
          <p v-if="item.dek" class="fs__dek">{{ item.dek }}</p>
          <div class="fs__art">
            <FiveSlicesArt :name="item.art" />
          </div>
          <ul v-if="item.labels?.length" class="fs__labels">
            <li v-for="label in item.labels" :key="label">{{ label }}</li>
          </ul>
          <p v-if="item.body" class="fs__body">{{ item.body }}</p>
          <p v-if="item.badge" class="fs__badge">{{ item.badge }}</p>
          <p v-if="item.foot" class="fs__foot">{{ item.foot }}</p>
          <p v-if="item.close" class="fs__signoff">{{ item.close }}</p>
        </div>
      </section>
    </div>

    <nav class="fs__time" aria-label="Stories by date, newest first">
      <p class="fs__time-kicker" id="fs-time-label">Time</p>
      <ul class="fs__time-list">
        <li v-for="item in stories" :key="item.id">
          <button
            type="button"
            class="fs__time-btn"
            :aria-current="item.id === story.id ? 'true' : undefined"
            @click="selectStory(item.id)"
          >
            <time :datetime="item.date">{{ formatSliceDate(item.date) }}</time>
            <span>{{ item.title }}</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.fs {
  --fs-navy: #081428;
  --fs-navy-2: #10284f;
  --fs-cream: #f3e6c4;
  --fs-white: #f7f7f5;
  --fs-cyan: #3ddcff;
  --fs-yellow: #ffe14a;
  --fs-muted: #c9d4e4;
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-overlay) + 40);
  background: var(--fs-navy);
  color: var(--fs-white);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
}

.fs__top {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(8rem + var(--safe-top)) calc(12rem + var(--safe-right)) 0 calc(16rem + var(--safe-left));
  pointer-events: none;
}
.fs__index {
  margin: 0;
  min-width: 44rem;
  font-family: var(--font-mono);
  font-size: 18rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--fs-cream);
}
.fs__close {
  pointer-events: auto;
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2rem solid var(--fs-cream);
  border-radius: 8rem;
  background: transparent;
  color: var(--fs-cream);
  cursor: pointer;
}
.fs__close svg {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
}
.fs__close:focus-visible {
  outline: 3rem solid var(--fs-cyan);
  outline-offset: 3rem;
}

.fs__reel {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.fs__reel::-webkit-scrollbar { display: none; }

.fs__frame {
  height: 100%;
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  box-sizing: border-box;
  padding:
    calc(60rem + var(--safe-top))
    calc(18rem + var(--safe-right))
    calc(108rem + var(--safe-bottom))
    calc(18rem + var(--safe-left));
}
.fs__col {
  width: min(440rem, 100%);
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.fs__kicker {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fs-cyan);
}
.fs__headline {
  margin: 8rem 0 0;
  font-family: "Archivo", "Arial Narrow", sans-serif;
  font-weight: 800;
  font-stretch: 70%;
  font-variation-settings: "wdth" 70, "wght" 800;
  font-size: 32rem;
  line-height: 0.92;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--fs-cream);
}
.fs__dek {
  margin: 8rem 0 0;
  font-family: var(--font-ui);
  font-size: 15rem;
  line-height: 1.35;
  color: var(--fs-white);
}
.fs__art {
  flex: 1 1 auto;
  min-height: 132rem;
  margin: 8rem 0;
}
.fs__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 6rem;
  margin: 0 0 8rem;
  padding: 0;
  list-style: none;
}
.fs__labels li {
  padding: 4rem 8rem;
  border: 2rem solid var(--fs-cyan);
  border-radius: 999rem;
  color: var(--fs-cream);
  font-family: var(--font-mono);
  font-size: 10rem;
  letter-spacing: 0.08em;
  line-height: 1.3;
}
.fs__body {
  margin: 0;
  font-family: var(--font-ui);
  font-size: 14rem;
  line-height: 1.35;
  color: var(--fs-white);
}
.fs__badge {
  align-self: flex-start;
  margin: 8rem 0 0;
  padding: 6rem 10rem;
  background: var(--fs-yellow);
  color: var(--fs-navy);
  font-family: var(--font-ui);
  font-size: 13rem;
  font-weight: 700;
  line-height: 1.3;
}
.fs__foot,
.fs__signoff {
  margin: 8rem 0 0;
  font-family: var(--font-mono);
  font-size: 11rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fs-muted);
}
.fs__signoff { text-transform: none; letter-spacing: 0; font-family: var(--font-ui); font-size: 15rem; color: var(--fs-cream); }

.fs__time {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: stretch;
  gap: 8rem;
  padding: 8rem calc(12rem + var(--safe-right)) calc(8rem + var(--safe-bottom)) calc(12rem + var(--safe-left));
  background: linear-gradient(180deg, transparent, #081428 28%);
}
.fs__time-kicker {
  margin: 0;
  align-self: center;
  font-family: var(--font-mono);
  font-size: 11rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fs-cyan);
}
.fs__time-list {
  display: flex;
  gap: 8rem;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  scrollbar-width: none;
}
.fs__time-list::-webkit-scrollbar { display: none; }
.fs__time-btn {
  min-height: 44rem;
  min-width: 44rem;
  max-width: 240rem;
  padding: 6rem 12rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2rem;
  border: 2rem solid rgba(243, 230, 196, 0.45);
  border-radius: 8rem;
  background: rgba(8, 20, 40, 0.72);
  color: var(--fs-cream);
  text-align: left;
  cursor: pointer;
}
.fs__time-btn time {
  font-family: var(--font-mono);
  font-size: 11rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fs-cyan);
}
.fs__time-btn span {
  font-family: var(--font-ui);
  font-size: 12rem;
  line-height: 1.25;
  color: var(--fs-white);
}
.fs__time-btn[aria-current="true"] {
  border-color: var(--fs-cyan);
  background: var(--fs-navy-2);
}
.fs__time-btn:focus-visible,
.fs__reel:focus-visible {
  outline: 3rem solid var(--fs-cyan);
  outline-offset: 2rem;
}

@media (min-width: 700px) {
  .fs__headline { font-size: 44rem; }
  .fs__body { font-size: 16rem; }
}

@media (max-height: 700px) {
  .fs__headline { font-size: 26rem; }
  .fs__art { min-height: 104rem; }
  .fs__frame {
    padding-bottom: calc(96rem + var(--safe-bottom));
  }
}

@media (prefers-reduced-motion: reduce) {
  .fs__reel { scroll-behavior: auto; }
}
</style>

<style>
html.five-slices-open,
html.five-slices-open body {
  overflow: hidden;
}
html[data-reduce-motion="on"] .fs__reel {
  scroll-behavior: auto;
}
</style>
