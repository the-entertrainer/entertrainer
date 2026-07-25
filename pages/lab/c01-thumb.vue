<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '01 Thumb Zone', robots: 'noindex' })
const C = CONCEPTS[0]

/**
 * Fitts's Law: T = a + b·log₂(2D/W). Time falls as targets get wider (W) and
 * closer (D). So the menu is an arc struck from the bottom-centre — the natural
 * pivot of a thumb — with every target on the same radius (equal D) and sized
 * well past the 44px minimum (large W). The readout shows the real index of
 * difficulty for whichever target the pointer is nearest, so the claim is
 * measurable rather than decorative.
 */
const TARGET = 76       // target diameter — comfortably above the 44px floor
// Radius scales with the viewport so the fan fills the frame on a desktop and
// still fits the reachable arc on a phone, instead of sitting as a small motif.
const R = ref(148)
const arc = ref<HTMLElement | null>(null)
const pointer = reactive({ x: 0, y: 0, inside: false })
const nearest = ref(0)

function sizeArc() {
  R.value = Math.round(Math.max(132, Math.min(268, Math.min(innerWidth * 0.30, innerHeight * 0.34))))
}
onMounted(() => { sizeArc(); addEventListener('resize', sizeArc) })
onBeforeUnmount(() => removeEventListener('resize', sizeArc))

// Spread across a 132° fan centred on straight-up from the pivot.
const angleFor = (i: number) => (-90 - 66 + (132 / (LAB_NAV.length - 1)) * i) * (Math.PI / 180)
const posFor = (i: number) => ({ x: Math.cos(angleFor(i)) * R.value, y: Math.sin(angleFor(i)) * R.value })

function onMove(e: PointerEvent) {
  const el = arc.value; if (!el) return
  const pv = el.querySelector('.t__pivot')?.getBoundingClientRect()
  if (!pv) return
  // Measure from the real pivot element so JS and CSS can never disagree.
  pointer.x = e.clientX - (pv.left + pv.width / 2)
  pointer.y = e.clientY - (pv.top + pv.height / 2)
  pointer.inside = true
  let best = 0, bd = Infinity
  LAB_NAV.forEach((_, i) => {
    const p = posFor(i)
    const d = Math.hypot(p.x - pointer.x, p.y - pointer.y)
    if (d < bd) { bd = d; best = i }
  })
  nearest.value = best
}

/** Index of difficulty in bits — the log term of Fitts's Law. */
const idBits = computed(() => {
  const p = posFor(nearest.value)
  const D = Math.max(1, Math.hypot(p.x - pointer.x, p.y - pointer.y))
  return Math.log2((2 * D) / TARGET + 1).toFixed(2)
})
</script>

<template>
  <LabShell bg="#0B0F14" ink="#EAF2FF" pop="#38E1B0" display="'Space Grotesk','DM Sans',sans-serif" :law="C.law">
    <div ref="arc" class="t" @pointermove="onMove" @pointerleave="pointer.inside = false">
      <header class="t__head">
        <p class="t__kick">Naveen Jose · Instructional Design</p>
        <h1 class="t__h1">Built for the device<br>already in your hand.</h1>
        <p class="t__read" aria-live="off">
          nearest <b>{{ LAB_NAV[nearest].label }}</b> · index of difficulty
          <b>{{ pointer.inside ? idBits : '—' }}</b> bits
        </p>
      </header>

      <!-- The fan and its guide arc share one pivot, so every target sits at
           an identical distance D — the variable Fitts's Law trades against W. -->
      <div class="t__stage" :style="{ '--r': R + 'rem' }">
        <svg class="t__guide" aria-hidden="true" :viewBox="`${-R - 40} ${-R - 40} ${(R + 40) * 2} ${R + 40}`">
          <path :d="`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0`" fill="none" stroke="currentColor"
                stroke-width="1" stroke-dasharray="3 5" opacity="0.3" />
        </svg>
        <nav class="t__fan" aria-label="Sections">
          <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="t__t"
                    :class="{ near: pointer.inside && nearest === i }"
                    :style="{ '--x': posFor(i).x + 'rem', '--y': posFor(i).y + 'rem' }">
            <span class="t__n">{{ it.n }}</span>
            <span class="t__l">{{ it.label }}</span>
          </NuxtLink>
        </nav>
        <div class="t__pivot" aria-hidden="true" />
      </div>
    </div>
  </LabShell>
</template>

<style scoped>
/* One centred column: headline, readout, then the fan — no dead gap between. */
.t { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(22rem, 4vh, 52rem); padding: 56rem 20rem 62rem; }
.t__head { width: min(600rem, 90vw); text-align: center; }
.t__kick { margin: 0 0 12rem; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-45); }
.t__h1 { margin: 0; font-size: clamp(28rem, 4.6vw, 46rem); line-height: 1.12; letter-spacing: -0.02em; font-weight: 500; }
.t__read { margin: 16rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; color: var(--ink-45); }
.t__read b { color: var(--pop); font-variant-numeric: tabular-nums; }

/* Height is the radius plus half a target, so the arc's own box hugs it. */
.t__stage { position: relative; width: 100%; height: calc(var(--r) + 44rem); }
.t__guide { position: absolute; left: 50%; bottom: 0; translate: -50% 0; width: calc((var(--r) + 40rem) * 2); height: calc(var(--r) + 40rem); color: var(--pop); pointer-events: none; }
.t__fan { position: absolute; left: 50%; bottom: 0; width: 0; height: 0; }
.t__t {
  position: absolute; left: var(--x); top: var(--y);
  translate: -50% -50%;
  width: 76rem; height: 76rem;                 /* W in Fitts's Law */
  display: grid; place-content: center; gap: 2rem;
  border-radius: 50%; text-decoration: none;
  background: rgba(255,255,255,0.05); border: 1px solid var(--ink-15); color: var(--ink);
  text-align: center;
  transition: background 160ms ease, border-color 160ms ease, scale 160ms cubic-bezier(.2,.8,.2,1);
}
.t__t.near { background: var(--pop); border-color: var(--pop); color: #06231B; scale: 1.1; }
.t__t:focus-visible { outline: 2px solid var(--pop); outline-offset: 4px; }
.t__n { font-size: 9.5rem; letter-spacing: 0.12em; opacity: 0.6; }
.t__l { font-size: 11.5rem; font-weight: 600; line-height: 1.1; }

.t__pivot { position: absolute; left: 50%; bottom: 0; translate: -50% 50%; width: 9rem; height: 9rem; border-radius: 50%; background: var(--pop); box-shadow: 0 0 0 6rem rgba(56,225,176,0.14); }

@media (prefers-reduced-motion: reduce) { .t__t { transition: none; } }
@media (max-width: 560px) { .t__h1 { font-size: 24rem; } }
</style>
