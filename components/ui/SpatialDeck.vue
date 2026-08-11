<script setup lang="ts">
/**
 * The home spiral's interaction, brought to real content.
 *
 * The earlier pass gave every interior page the stage's *look* — glass,
 * Archivo, bloom — while the pages themselves stayed newspaper columns you
 * scroll top to bottom. That is a skin, not the interaction. This is the
 * interaction: content lives in a stack, you drag or swipe through it with
 * momentum that settles onto whole cards, and the one in front is the one
 * that is readable. It is the same physics as the home tower — critically
 * damped spring onto a detent, a capped flick, tap-to-focus versus
 * tap-to-activate — ported from WebGL to plain DOM transforms so it can hold
 * real text, real links, and stay inside the accessibility tree.
 *
 * What makes a DOM deck different from the canvas one:
 *  - Off-stack cards are real elements, not pixels in a framebuffer, so a
 *    screen reader or a keyboard could reach them directly. Left alone that
 *    is worse than the canvas, not better: Tab would leap through content
 *    sitting three cards away, out of visual order. So only the active
 *    card's interactive elements stay in the tab order — the caller marks
 *    that with the `active` slot prop — and the deck's own arrow keys are
 *    what moves *which* card is active, exactly like pressing the honest nav
 *    links did on the home page.
 *  - A tap on a card that is not yet active brings it to the front instead
 *    of firing whatever link or button sits inside it; the same tap when
 *    that card is already active reaches its content normally. That is the
 *    "tap a neighbour to bring it forward, tap the front card to act on it"
 *    rule from the home tower, generalised to arbitrary content.
 */
const props = withDefaults(defineProps<{
  items: unknown[]
  ariaLabel?: string
  /** Vertical travel between adjacent cards, as a fraction of the deck's own height. */
  spacing?: number
}>(), { ariaLabel: 'Items', spacing: 0.44 })

const emit = defineEmits<{ (e: 'update:active', index: number): void }>()

const root = ref<HTMLElement | null>(null)
const cardEls: (HTMLElement | null)[] = []
const setCardEl = (el: any, i: number) => { cardEls[i] = el as HTMLElement | null }

const N = computed(() => props.items.length)
const activeIndex = ref(0)

let calm = false // prefers-reduced-motion: user-driven moves stay, coasting/springing does not
let scroll = 0, target = 0, vel = 0
let dragging = false, dragged = false, justDragged = false
let downX = 0, downY = 0, base = 0, moveT = 0, moveV = 0
let raf = 0
const clock = { last: 0 }

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const clampTarget = (v: number) => clamp(Math.round(v), 0, Math.max(0, N.value - 1))

function place() {
  const el = root.value
  if (!el) return
  const h = el.clientHeight || 1
  const w = el.clientWidth || 1
  const spacingPx = h * props.spacing
  for (let i = 0; i < N.value; i++) {
    const card = cardEls[i]
    if (!card) continue
    const rel = i - scroll
    const ar = Math.abs(rel)
    const ty = rel * spacingPx
    const tx = Math.sin(rel * 0.5) * w * 0.05
    const scale = 1 - Math.min(ar, 4) * 0.10
    const rx = clamp(-rel * 4, -14, 14)
    const opacity = clamp(1 - ar * 0.42, 0.06, 1)
    const blur = Math.min(ar, 3) * 1.6
    card.style.transform =
      `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg) scale(${scale.toFixed(3)})`
    card.style.opacity = opacity.toFixed(3)
    card.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : ''
    card.style.zIndex = String(1000 - Math.round(ar * 10))
    // Only the active card may be reached by Tab or a screen reader. Anything
    // else is visually a preview, not a second reading surface, and leaving
    // it focusable would send Tab jumping to content sitting off in space.
    const isActive = i === activeIndex.value
    card.style.pointerEvents = ar < 3.2 ? '' : 'none'
    if (card.getAttribute('aria-hidden') !== String(!isActive)) {
      card.setAttribute('aria-hidden', String(!isActive))
    }
  }
}

function tick(t: number) {
  raf = requestAnimationFrame(tick)
  const dt = Math.min((t - (clock.last || t)) / 1000, 0.05)
  clock.last = t

  if (!dragging) {
    if (calm) {
      scroll = target; vel = 0
    } else {
      const k = 130, c = 2 * Math.sqrt(k)
      vel += (-k * (scroll - target) - c * vel) * dt
      scroll += vel * dt
      if (Math.abs(scroll - target) < 0.0006 && Math.abs(vel) < 0.008) { scroll = target; vel = 0 }
    }
  }
  place()
}

function travel() {
  return matchMedia('(pointer: coarse)').matches ? Math.max(90, Math.min(190, innerHeight * 0.22)) : 260
}

function onDown(e: PointerEvent) {
  if (N.value <= 1) return
  dragging = true; dragged = false
  downX = e.clientX; downY = e.clientY
  base = scroll; moveT = e.timeStamp; moveV = 0
  vel = 0; target = scroll
  // Capture is deferred to the moment a drag is confirmed, not taken here on
  // every pointerdown. Chromium retargets the click that follows a pointerup
  // to whichever element holds capture — if the stage captured a plain tap,
  // the click lands on the stage instead of the card underneath, and a link
  // inside the active card would silently never navigate.
}
function onMove(e: PointerEvent) {
  if (!dragging) return
  const dx = e.clientX - downX, dy = e.clientY - downY
  if (!dragged && dx * dx + dy * dy > 64) {
    dragged = true
    ;(root.value as HTMLElement)?.setPointerCapture?.(e.pointerId)
  }
  const prev = scroll
  let next = base - dy / travel()
  // Rubber-band past the ends rather than letting the deck run off into
  // empty space — a finite list of chapters is not a wrapping carousel.
  const lo = 0, hi = Math.max(0, N.value - 1)
  if (next < lo) next = lo + (next - lo) * 0.35
  if (next > hi) next = hi + (next - hi) * 0.35
  scroll = next
  const dt = Math.max(8, e.timeStamp - moveT) / 1000
  moveT = e.timeStamp
  moveV = moveV * 0.6 + ((scroll - prev) / dt) * 0.4
  target = scroll
}
function onUp() {
  if (!dragging) return
  dragging = false
  if (dragged) {
    vel = calm ? 0 : clamp(moveV, -14, 14)
    const here = Math.round(scroll)
    target = calm
      ? clampTarget(scroll)
      : clamp(clampTarget(scroll + vel * 0.2), here - 3, here + 3)
    target = clampTarget(target)
    justDragged = true
    setTimeout(() => { justDragged = false }, 60)
  } else {
    target = clampTarget(scroll)
  }
}

// Capture phase so a link or button inside a non-active card never fires —
// the tap is redirected into "bring this card forward" instead of whatever
// it would otherwise have done.
function onClickCapture(e: MouseEvent) {
  if (justDragged) { e.preventDefault(); e.stopPropagation(); return }
  const el = (e.target as HTMLElement)?.closest?.('[data-sd-card]') as HTMLElement | null
  if (!el) return
  const i = Number(el.dataset.sdCard)
  if (i !== activeIndex.value) {
    e.preventDefault(); e.stopPropagation()
    goTo(i)
  }
}

function goTo(i: number) {
  target = clampTarget(i)
  vel = 0
}
function next() { goTo(Math.round(scroll) + 1) }
function prev() { goTo(Math.round(scroll) - 1) }

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); next() }
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0) }
  else if (e.key === 'End') { e.preventDefault(); goTo(N.value - 1) }
}

// `target`/`scroll` are plain closured numbers, not refs — the physics loop
// mutates them every frame outside Vue's reactivity, on purpose, so a drag
// never waits on a render cycle. Polling once a frame is how the component's
// `active` prop and the `update:active` emit stay in sync with them.
function watchTarget() {
  let last = -1
  const poll = () => {
    const v = clampTarget(target)
    if (v !== last) { last = v; if (v !== activeIndex.value) { activeIndex.value = v; emit('update:active', v) } }
    requestAnimationFrame(poll)
  }
  poll()
}

onMounted(() => {
  calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  place()
  watchTarget()
  raf = requestAnimationFrame(tick)
  addEventListener('resize', place)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('resize', place)
})

defineExpose({ next, prev, goTo, activeIndex })
</script>

<template>
  <div class="sd" :class="{ 'sd--calm': calm }">
    <div
      ref="root" class="sd__stage" tabindex="0" role="group" :aria-label="ariaLabel"
      @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp"
      @click.capture="onClickCapture" @keydown="onKey" @dragstart.prevent
    >
      <div
        v-for="(item, i) in items" :key="i" class="sd__card" :data-sd-card="i"
        :ref="(el) => setCardEl(el, i)"
      >
        <slot :item="item" :index="i" :active="i === activeIndex" />
      </div>
    </div>

    <div v-if="N > 1" class="sd__bar">
      <button type="button" class="sd__nav" :disabled="activeIndex === 0" aria-label="Previous" @click="prev">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18 9 12l6-6" /></svg>
      </button>
      <p class="t-mono sd__count" aria-hidden="true">{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(N).padStart(2, '0') }}</p>
      <button type="button" class="sd__nav" :disabled="activeIndex === N - 1" aria-label="Next" @click="next">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sd { display: flex; flex-direction: column; gap: 18rem; }
.sd__stage {
  position: relative;
  /* Hugs the card rather than floating it in a tall box. At 66dvh the stage
     was 660px around a 480px card, parking 90px of dead space above and below
     the only thing anyone came to look at, and pushing the Prev/Next bar
     under the fold on a 1000px screen. */
  min-height: clamp(380rem, 56dvh, 560rem);
  /* Clipped to its own box so a receding card's translated bounds never
     bleed onto the Prev/Next bar sitting right below it in normal flow —
     that bar is a sibling, not part of this stack, and a card's very high
     z-index would otherwise paint straight over it mid-drag. */
  overflow: hidden;
  border-radius: 20rem;
  perspective: 1400px;
  touch-action: pan-x;
  cursor: grab;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
}
.sd__stage :deep(img) { -webkit-user-drag: none; user-drag: none; }
.sd__stage:active { cursor: grabbing; }
.sd__stage:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 6px; }

.sd__card {
  position: absolute;
  inset: 0;
  margin: auto;
  width: min(560rem, 100%);
  height: clamp(300rem, 50dvh, 480rem);
  will-change: transform, opacity, filter;
  transform-origin: center center;
}

.sd__bar {
  display: flex; align-items: center; justify-content: center; gap: 18rem;
}
.sd__nav {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44rem; height: 44rem; border-radius: 999rem; flex-shrink: 0;
  border: 0; cursor: pointer; color: var(--color-text);
  background: var(--color-glass-bg);
  backdrop-filter: blur(16px) saturate(1.3) brightness(1.08);
  -webkit-backdrop-filter: blur(16px) saturate(1.3) brightness(1.08);
  box-shadow: inset 0 1px 0 var(--glow-rim), inset 0 0 0 1px var(--color-glass-border);
  transition:
    transform var(--dur-fast) var(--ease-spring),
    background var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out),
    opacity var(--dur-fast) var(--ease-out);
}
@media (hover: hover) {
  .sd__nav:not(:disabled):hover {
    background: var(--color-glass-bg-hover);
    transform: translateY(var(--lift));
    box-shadow:
      inset 0 1px 0 var(--glow-rim),
      inset 0 0 0 1px var(--color-glass-border-hover);
  }
}
/* Small circular control, so it takes the deeper of the two press values —
   a 44px target needs more travel than a card for the press to read as
   equally firm. */
.sd__nav:active:not(:disabled) { transform: scale(var(--press-deep)); transition-duration: var(--dur-tap); }
.sd__nav:disabled { opacity: 0.3; cursor: not-allowed; }
.sd__nav:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }
.sd__count { opacity: 0.5; min-width: 64rem; text-align: center; }

@media (max-width: 560px) {
  .sd__card { width: 100%; }
}

/* The deck's physics already respect reduced motion in JS (`calm`), but the
   nav buttons are pure CSS and were still springing. */
@media (prefers-reduced-motion: reduce) {
  .sd__nav { transition-duration: 1ms; }
  .sd__nav:not(:disabled):hover,
  .sd__nav:active:not(:disabled) { transform: none; }
}
</style>
