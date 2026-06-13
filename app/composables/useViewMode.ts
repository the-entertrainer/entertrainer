import { ref } from 'vue'
import { useState } from '#app'

export type ViewMode = 'spiral' | 'grid' | 'list'

/**
 * Shared spiral|grid|list state. Backed by useState so it is SSR-safe and
 * shared across every component without a store. The actual GSAP Flip
 * choreography lives in SpiralEngine, which watches `mode`.
 */
export function useViewMode() {
  const mode = useState<ViewMode>('viewMode', () => 'spiral')
  const isAnimating = ref(false)

  function setMode(next: ViewMode) {
    if (next === mode.value || isAnimating.value) return
    mode.value = next
  }

  return { mode, isAnimating, setMode }
}
