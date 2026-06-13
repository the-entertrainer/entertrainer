import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { Draggable } from 'gsap/Draggable'

/**
 * Client-only GSAP registration. The `.client` suffix guarantees this never
 * runs during SSR (GSAP touches `window`), which is our primary hydration
 * safeguard. Free plugins only (Flip + Draggable) — no InertiaPlugin.
 */
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(Flip, Draggable)

  // Smooth out frame-rate hiccups (e.g. tab refocus) so the spiral doesn't jump.
  gsap.ticker.lagSmoothing(500, 33)

  return {
    provide: {
      gsap,
      Flip,
      Draggable,
    },
  }
})
