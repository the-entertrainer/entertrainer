import gsap from 'gsap'

function motionOff() {
  if (!import.meta.client) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.reduceMotion === 'on'
}

/** One entrance. Opacity and a short rise. Nothing is left hidden if motion is off. */
export function useCraftReveal(root: Ref<HTMLElement | null>, selector = '.craft-card') {
  onMounted(() => {
    const el = root.value
    if (!el || motionOff()) return
    const items = el.querySelectorAll(selector)
    if (!items.length) return
    gsap.from(items, {
      opacity: 0,
      y: 12,
      duration: 0.42,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'opacity,transform',
    })
  })
}

/** A yellow sheen that follows the pointer. One layout read, and only while hovering a card. */
export function useCardSheen(root: Ref<HTMLElement | null>) {
  function move(event: PointerEvent) {
    if (event.pointerType === 'touch' || motionOff()) return
    const card = (event.target as Element | null)?.closest?.('.craft-card') as HTMLElement | null
    if (!card || !root.value?.contains(card)) return
    const box = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${event.clientX - box.left}px`)
    card.style.setProperty('--my', `${event.clientY - box.top}px`)
  }
  onMounted(() => root.value?.addEventListener('pointermove', move, { passive: true }))
  onBeforeUnmount(() => root.value?.removeEventListener('pointermove', move))
}
