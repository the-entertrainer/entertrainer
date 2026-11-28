/**
 * A short buzz on phones that support it (Android Chrome). Silent everywhere
 * else, and when the reader has turned motion off.
 */
export function haptic(pattern: number | number[] = 8) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  if (document.documentElement.getAttribute('data-reduce-motion') === 'on') return
  try { navigator.vibrate(pattern) } catch { /* ignore */ }
}
