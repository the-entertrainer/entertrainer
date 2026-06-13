import { useNuxtApp } from '#app'
import type { gsap as GsapType } from 'gsap'
import type { Flip as FlipType } from 'gsap/Flip'
import type { Draggable as DraggableType } from 'gsap/Draggable'

interface GsapBundle {
  gsap: typeof GsapType
  Flip: typeof FlipType
  Draggable: typeof DraggableType
}

/**
 * Accessor for the GSAP instance registered in plugins/gsap.client.ts.
 * Throws a helpful error if called on the server (GSAP is client-only).
 */
export function useGsap(): GsapBundle {
  const nuxtApp = useNuxtApp()
  if (import.meta.server || !nuxtApp.$gsap) {
    throw new Error('useGsap() is client-only — call it inside onMounted.')
  }
  return {
    gsap: nuxtApp.$gsap as typeof GsapType,
    Flip: nuxtApp.$Flip as typeof FlipType,
    Draggable: nuxtApp.$Draggable as typeof DraggableType,
  }
}
