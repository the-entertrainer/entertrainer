import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useGsap } from './useGsap'

interface ScrollProgressState {
  progress: number
  velocity: number
  activeIndex: number
}

export function useScrollProgress(stationCount: number = 8) {
  const state = ref<ScrollProgressState>({
    progress: 0,
    velocity: 0,
    activeIndex: 0,
  })

  let accum = 0
  let targetAccum = 0
  let velocityX = 0
  let velocityY = 0

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    targetAccum += delta * 60
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      targetAccum += 60
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      targetAccum -= 60
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 1) {
      const dy = e.touches[0].clientY - (lastY ?? e.touches[0].clientY)
      lastY = e.touches[0].clientY
      targetAccum -= dy
    }
  }

  let lastY: number | null = null

  function onTouchStart(e: TouchEvent) {
    lastY = e.touches[0]?.clientY ?? null
  }

  function onTouchEnd() {
    lastY = null
  }

  const { gsap } = useGsap()

  let tickerFn: (() => void) | null = null

  onMounted(() => {
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    tickerFn = () => {
      accum += (targetAccum - accum) * 0.08

      const clampedAccum = Math.max(0, Math.min(accum, stationCount * 200))
      const p = clampedAccum / (stationCount * 200)

      state.value.progress = p
      state.value.velocity = Math.abs(targetAccum - accum)
      state.value.activeIndex = Math.round(p * (stationCount - 1))
    }

    gsap.ticker.add(tickerFn)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)

    if (tickerFn) {
      try {
        useGsap().gsap.ticker.remove(tickerFn)
      } catch {
        // ticker already gone
      }
    }
  })

  return state
}
