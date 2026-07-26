<script setup lang="ts">
/**
 * The homepage's card, brought to the rest of the site.
 *
 * Every image outside the WebGL stage was a flat rectangle, which made the
 * front door and the interior read as two different pieces of software. This
 * gives any image the same behaviour: it sits on a plane in space, catches a
 * moving sheen, and turns.
 *
 * How it turns depends on what is driving it, and that distinction is the whole
 * component. A mouse gets direct manipulation — the card tilts toward the
 * cursor, because a pointer is a hand and the card should follow it. Touch has
 * no hover to trade on, so the card is driven by *where it sits on screen*
 * instead: it leans as it rises into view and settles as it reaches the middle.
 * That way a phone, which is the primary target, gets the effect from the one
 * input it always has — scrolling — rather than getting a dead flat image.
 */
const props = withDefaults(defineProps<{
  src: string
  alt?: string
  /** Degrees of tilt at the extremes. */
  strength?: number
  /** Rounds the plate; matches the stage's card radius by default. */
  radius?: string
  /**
   * Intrinsic aspect, e.g. "16/9". Reserves the box before the image loads.
   * Without it a lazy image below the fold has no height, so its container
   * collapses to nothing and the page jumps when it finally arrives — which is
   * exactly what happened when these replaced plain <img> tags carrying width
   * and height attributes.
   *
   * Pass "fill" where the *parent* already defines the box — a hero slot with
   * its own height, for instance. Forcing an aspect there fights the layout and
   * leaves the image stranded in the top of an over-tall container.
   */
  ratio?: string
  eager?: boolean
}>(), { alt: '', strength: 9, radius: '18rem', ratio: '16/9', eager: false })

const root = ref<HTMLElement | null>(null)
const plate = ref<HTMLElement | null>(null)

let raf = 0
let fine = false
let reduce = false
const cur = { rx: 0, ry: 0, sx: 50, sy: 50 }
const tgt = { rx: 0, ry: 0, sx: 50, sy: 50 }

function apply() {
  const el = plate.value
  if (!el) return
  el.style.transform = `rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg)`
  el.style.setProperty('--sx', `${cur.sx.toFixed(1)}%`)
  el.style.setProperty('--sy', `${cur.sy.toFixed(1)}%`)
}

function tick() {
  raf = requestAnimationFrame(tick)
  // Scroll-driven path: recompute the target from the element's position every
  // frame, so it tracks the page instead of an event that may never fire.
  if (!fine) {
    const el = root.value
    if (!el) return
    const r = el.getBoundingClientRect()
    const mid = r.top + r.height / 2
    // -1 well below the fold, 0 dead centre, +1 well above.
    const p = Math.max(-1, Math.min(1, (innerHeight / 2 - mid) / (innerHeight * 0.75)))
    tgt.rx = -p * props.strength
    tgt.ry = p * props.strength * 0.35
    tgt.sy = 50 - p * 40
    tgt.sx = 50
  }
  const k = 0.09
  cur.rx += (tgt.rx - cur.rx) * k
  cur.ry += (tgt.ry - cur.ry) * k
  cur.sx += (tgt.sx - cur.sx) * k
  cur.sy += (tgt.sy - cur.sy) * k
  apply()
}

function onMove(e: PointerEvent) {
  const el = root.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  tgt.ry = (px - 0.5) * 2 * props.strength
  tgt.rx = -(py - 0.5) * 2 * props.strength
  tgt.sx = px * 100
  tgt.sy = py * 100
}
function onLeave() { tgt.rx = 0; tgt.ry = 0; tgt.sx = 50; tgt.sy = 50 }

onMounted(() => {
  reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  fine = matchMedia('(hover: hover) and (pointer: fine)').matches
  if (fine) {
    root.value?.addEventListener('pointermove', onMove)
    root.value?.addEventListener('pointerleave', onLeave)
  }
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  root.value?.removeEventListener('pointermove', onMove)
  root.value?.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <div ref="root" class="c3" :class="{ 'c3--fill': ratio === 'fill' }"
       :style="{ '--r': radius, '--ar': ratio === 'fill' ? 'auto' : ratio }">
    <div ref="plate" class="c3__plate">
      <img class="c3__img mono-img" :src="src" :alt="alt"
           :loading="eager ? 'eager' : 'lazy'" decoding="async">
      <!-- The sheen is a separate layer so it stays flat against the glass
           while the plate turns underneath it. -->
      <span class="c3__sheen" aria-hidden="true" />
      <span class="c3__rim" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.c3 { perspective: 1100px; }
.c3--fill, .c3--fill .c3__plate, .c3--fill .c3__img { height: 100%; }
.c3--fill .c3__img { aspect-ratio: auto; }
.c3__plate {
  position: relative;
  border-radius: var(--r);
  overflow: hidden;
  transform-style: preserve-3d;
  will-change: transform;
  box-shadow:
    0 40rem 90rem -46rem rgba(0, 0, 0, 0.95),
    0 0 60rem -30rem var(--glow-soft);
}
.c3__img { display: block; width: 100%; height: auto; aspect-ratio: var(--ar, 16/9); object-fit: cover; }

/* A moving specular band. `--sx/--sy` follow the pointer on a mouse and the
   element's height on the page under touch, so the highlight always has a
   reason to be where it is. */
.c3__sheen {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(60% 80% at var(--sx, 50%) var(--sy, 50%),
    rgba(255,255,255,0.22), rgba(255,255,255,0.05) 42%, transparent 68%);
  mix-blend-mode: screen;
}
/* The lit edge — the same rim the stage's glass carries. */
.c3__rim {
  position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.34), inset 0 0 0 1px rgba(255,255,255,0.10);
}

@media (prefers-reduced-motion: reduce) {
  .c3__plate { transform: none !important; }
  .c3__sheen { display: none; }
}
</style>
