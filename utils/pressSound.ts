/**
 * Paper and press sounds, synthesised with Web Audio. Off by default; they
 * play only when Settings > Sound is on (html[data-ui-sound="on"]) and never
 * before the visitor has interacted with the page.
 */
let ctx: AudioContext | null = null

function on(): boolean {
  return typeof document !== 'undefined' && document.documentElement.getAttribute('data-ui-sound') === 'on'
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = ctx ?? new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch { return null }
}

/** A short filtered noise burst: a press, a page, a tap. */
function noise(dur: number, freq: number, q: number, gain: number) {
  const ac = audio(); if (!ac) return
  const len = Math.max(1, Math.floor(ac.sampleRate * dur))
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
  const src = ac.createBufferSource(); src.buffer = buf
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q
  const g = ac.createGain(); g.gain.value = gain
  src.connect(bp).connect(g).connect(ac.destination)
  src.start()
}

export type PressSound = 'tap' | 'toggle' | 'success' | 'page'

export function playPress(kind: PressSound = 'tap') {
  if (!on()) return
  if (kind === 'tap') noise(0.035, 2400, 1.2, 0.18)
  else if (kind === 'toggle') noise(0.05, 1500, 2, 0.2)
  else if (kind === 'page') noise(0.22, 900, 0.6, 0.12)
  else if (kind === 'success') { noise(0.06, 700, 1.5, 0.3); setTimeout(() => noise(0.04, 2200, 2, 0.15), 70) }
}
