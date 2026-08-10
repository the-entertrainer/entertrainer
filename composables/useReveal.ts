// Editorial motion presets built on @vueuse/motion (the Framer-Motion-like
// engine). Every preset is reduced-motion safe: when the user prefers reduced
// motion the element simply starts and stays visible — never hidden.
//
// Usage:
//   const R = useReveal()
//   <h1 v-motion="R.rise()">…            (fade + spring rise, once in view)
//   <li v-for="(x,i) in xs" v-motion="R.riseIn(i)">…   (staggered)
//   <img v-motion="R.scaleIn(120)">…     (delay in ms)

type Variant = Record<string, unknown>
export interface RevealConfig { initial: Variant; visibleOnce: Variant }

export function useReveal() {
  const reduce = import.meta.client
    && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  // A calm editorial spring — settles without overshooting much.
  const spring = { type: 'spring', stiffness: 90, damping: 20, mass: 0.9 } as const
  // A refined expo-out tween for pure fades.
  const expo = { duration: 720, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] }

  const shown: RevealConfig = { initial: { opacity: 1 }, visibleOnce: { opacity: 1 } }

  function rise(delay = 0): RevealConfig {
    if (reduce) return shown
    return { initial: { opacity: 0, y: 30 }, visibleOnce: { opacity: 1, y: 0, transition: { ...spring, delay } } }
  }
  function fade(delay = 0): RevealConfig {
    if (reduce) return shown
    return { initial: { opacity: 0 }, visibleOnce: { opacity: 1, transition: { ...expo, delay } } }
  }
  function scaleIn(delay = 0): RevealConfig {
    if (reduce) return shown
    return { initial: { opacity: 0, scale: 0.94, y: 18 }, visibleOnce: { opacity: 1, scale: 1, y: 0, transition: { ...spring, delay } } }
  }
  function slideX(from = -28, delay = 0): RevealConfig {
    if (reduce) return shown
    return { initial: { opacity: 0, x: from }, visibleOnce: { opacity: 1, x: 0, transition: { ...spring, delay } } }
  }
  // Staggered helpers — pass the item index.
  function riseIn(i = 0, step = 70): RevealConfig { return rise(i * step) }
  function scaleInStagger(i = 0, step = 80): RevealConfig { return scaleIn(i * step) }

  return { reduce, spring, expo, rise, fade, scaleIn, slideX, riseIn, scaleInStagger }
}
