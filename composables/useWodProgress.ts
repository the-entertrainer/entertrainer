import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Writes a section's scroll progress onto the section as `--p` (0 → 1), and
 * optionally pins a stage inside it while that progress is spent.
 *
 * This is the mechanic the original portfolio is built on, and the reason it
 * feels the way it does: JS writes exactly one number per section per frame,
 * and every moving child derives its own motion from that number in CSS with a
 * different coefficient. One variable produces a whole parallax field, and
 * nothing is styled per-element per-frame.
 *
 * ScrollTrigger rather than a hand-rolled rAF loop because pinning is the part
 * that has to be exact — a sticky element and a scrubbed timeline disagree by a
 * frame during momentum scrolling, and that disagreement is visible.
 */
export interface WodProgressOptions {
  /** Element to hold still while progress is spent. */
  pin?: Ref<HTMLElement | null>
  /** Extra vars to write. `--pc` is `--p` centred to -1 → 1. */
  centred?: boolean
  /** Where the range starts/ends, in ScrollTrigger syntax. */
  start?: string
  end?: string
}

export function useWodProgress(el: Ref<HTMLElement | null>, opts: WodProgressOptions = {}) {
  let trigger: ScrollTrigger | undefined

  onMounted(() => {
    const node = el.value
    if (!node) return

    // Reduced motion gets the resting state and no trigger at all: `--p` pinned
    // to its midpoint means every calc() built on it resolves to centre and
    // nothing ever moves.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.style.setProperty('--p', '0.5')
      node.style.setProperty('--pc', '0')
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    trigger = ScrollTrigger.create({
      trigger: node,
      start: opts.start ?? 'top bottom',
      end: opts.end ?? 'bottom top',
      pin: opts.pin?.value ?? false,
      pinSpacing: false,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress
        node.style.setProperty('--p', p.toFixed(4))
        if (opts.centred !== false) node.style.setProperty('--pc', (p * 2 - 1).toFixed(4))
      }
    })
  })

  onBeforeUnmount(() => trigger?.kill())
}
