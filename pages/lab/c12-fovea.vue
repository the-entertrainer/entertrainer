<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '12 Foveal Lens', robots: 'noindex' })
const C = CONCEPTS[11]

/**
 * Human acuity is not uniform. The fovea covers roughly two degrees of visual
 * angle — about a thumbnail at arm's length — and acuity falls off steeply
 * outside it; the periphery is built for motion and contrast, not detail.
 *
 * The page renders that literally: everything is blurred except a lens that
 * follows the pointer (or a touch), sized to a plausible 2° patch. It reframes
 * the portfolio's real argument — attention is finite, so what you put in the
 * fovea is a design decision, not a layout accident.
 */
// Starts *on*, parked over the headline: landing on a fully blurred page reads
// as a rendering fault, and the effect has to be legible before it's explained.
const lens = reactive({ x: 0.5, y: 0.36, on: true })
const stage = ref<HTMLElement | null>(null)

function move(e: PointerEvent) {
  const r = stage.value?.getBoundingClientRect(); if (!r) return
  lens.x = (e.clientX - r.left) / r.width
  lens.y = (e.clientY - r.top) / r.height
  lens.on = true
}
// Radius is a share of the viewport's smaller edge, so the patch stays
// physically plausible across screen sizes.
const style = computed(() => ({
  '--lx': (lens.x * 100) + '%',
  '--ly': (lens.y * 100) + '%',
  '--on': lens.on ? 1 : 0
}))
</script>

<template>
  <LabShell bg="#0C0C0E" ink="#F0EFEA" pop="#FF3B6B" display="'Fraunces',Georgia,serif" :law="C.law">
    <div ref="stage" class="v" :style="style" @pointermove="move">
      <!-- Blurred base: what the periphery actually resolves -->
      <div class="v__layer v__blur" aria-hidden="true">
        <div class="v__content">
          <h1 class="v__h1">Attention is the<br>scarce resource.</h1>
          <p class="v__sub">Your fovea covers about two degrees. Everything else is a rumour your brain fills in. Move the lens.</p>
          <ul class="v__nav">
            <li v-for="it in LAB_NAV" :key="it.href"><span class="v__n">{{ it.n }}</span> {{ it.label }} — {{ it.desc }}</li>
          </ul>
        </div>
      </div>

      <!-- Sharp layer, revealed only inside the lens -->
      <div class="v__layer v__sharp">
        <div class="v__content">
          <h1 class="v__h1">Attention is the<br>scarce resource.</h1>
          <p class="v__sub">Your fovea covers about two degrees. Everything else is a rumour your brain fills in. Move the lens.</p>
          <ul class="v__nav">
            <li v-for="it in LAB_NAV" :key="it.href">
              <NuxtLink :to="it.href"><span class="v__n">{{ it.n }}</span> {{ it.label }} — {{ it.desc }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="v__ring" aria-hidden="true" />
    </div>
  </LabShell>
</template>

<style scoped>
.v { position: absolute; inset: 0; cursor: crosshair; }
/* Content is centred and set large so the lens nearly always has something to
   resolve — parked over dead space, the effect just reads as broken. */
.v__layer { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; padding: 66rem clamp(20rem, 5vw, 60rem) 76rem; }
.v__blur { filter: blur(7px) saturate(0.55); opacity: 0.75; }
/* The lens: a radial mask that only lets the sharp layer through near the
   pointer. Falls back to fully sharp when the pointer has never entered. */
.v__sharp {
  -webkit-mask-image: radial-gradient(circle at var(--lx) var(--ly), #000 0, #000 clamp(78px, 11vmin, 138px), transparent clamp(120px, 17vmin, 210px));
  mask-image: radial-gradient(circle at var(--lx) var(--ly), #000 0, #000 clamp(78px, 11vmin, 138px), transparent clamp(120px, 17vmin, 210px));
  opacity: var(--on);
}
.v__content { width: min(1000rem, 94vw); text-align: center; }
.v__h1 { margin: 0; font-size: clamp(34rem, 7.4vw, 92rem); line-height: 1.0; letter-spacing: -0.035em; font-weight: 400; }
.v__sub { margin: 20rem auto 30rem; font-family: 'DM Sans', sans-serif; font-size: clamp(14rem, 1.6vw, 18rem); line-height: 1.6; color: var(--ink-70); max-width: 48ch; }
.v__nav { list-style: none; margin: 0; padding: 0; display: grid; gap: 12rem; font-family: 'DM Sans', sans-serif; font-size: clamp(13rem, 1.5vw, 17rem); }
.v__nav a { color: var(--ink); text-decoration: none; }
.v__nav a:hover { color: var(--pop); }
.v__nav a:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }
.v__n { color: var(--pop); font-size: 11rem; letter-spacing: 0.1em; margin-right: 6rem; }

.v__ring {
  position: absolute; left: var(--lx); top: var(--ly); translate: -50% -50%;
  width: clamp(156px, 22vmin, 276px); aspect-ratio: 1; border-radius: 50%;
  border: 1px solid rgba(255,59,107,0.4); opacity: var(--on); pointer-events: none;
}
@media (pointer: coarse) { .v { cursor: default; } }
</style>
