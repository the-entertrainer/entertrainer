/**
 * Pure, sample-exact sine tones for the Elevate frequency buttons.
 *
 * Why not a plain OscillatorNode: its pitch is already close, but every browser draws it
 * from its own interpolated wavetable, and the old widget cut the oscillator dead on stop,
 * which clicks. Here each tone is computed once, in double precision, straight from
 * sin(2π · f · n / sampleRate), into a buffer at the context's own sample rate. The buffer
 * holds a whole number of cycles (1 s for whole-hertz tones), so it loops with no seam and
 * no resampling: the same samples come out in every browser, and the period is exact.
 *
 * Start and stop use raised-cosine fades on two gain stages (one for the attack, one for the
 * release), so nothing is ever cancelled mid-ramp and nothing clicks.
 */

/** Peak level of the tone, linear. 0.07 ≈ -23 dBFS: quiet, never near clipping. */
export const PURE_TONE_LEVEL = 0.07
/** Fade-in and fade-out length, seconds. */
export const PURE_TONE_FADE = 0.04
/** Small scheduling lead so fades never start in an audio block that is already rendering. */
const LEAD = 0.01
const CURVE_POINTS = 256

type ToneVoice = {
  hz: number
  src: AudioScheduledSourceNode
  attack: GainNode
  release: GainNode
}

export type PureTonePlayer = {
  readonly context: BaseAudioContext
  /** Start a tone. Any tone already sounding fades out first; only one plays at a time. */
  play: (hz: number) => void
  /** Fade out whatever is sounding. */
  stop: () => void
  /** Hertz currently sounding, or null. */
  current: () => number | null
}

/** Rising raised-cosine curve from 0 to `peak` (inclusive of both ends). */
function riseCurve(peak: number): Float32Array {
  const c = new Float32Array(CURVE_POINTS)
  for (let i = 0; i < CURVE_POINTS; i++) {
    c[i] = peak * 0.5 * (1 - Math.cos((Math.PI * i) / (CURVE_POINTS - 1)))
  }
  return c
}

/** Falling raised-cosine curve from 1 to 0. */
function fallCurve(): Float32Array {
  const c = new Float32Array(CURVE_POINTS)
  for (let i = 0; i < CURVE_POINTS; i++) {
    c[i] = 0.5 * (1 + Math.cos((Math.PI * i) / (CURVE_POINTS - 1)))
  }
  return c
}

/**
 * Seconds of audio that hold a whole number of cycles of `hz` at `rate` samples a second.
 * 1 s for any whole-hertz tone (e.g. 528 Hz → exactly 528 cycles in `rate` samples).
 */
function loopSeconds(hz: number, rate: number): number | null {
  for (let s = 1; s <= 10; s++) {
    const cycles = hz * s
    const frames = rate * s
    if (Math.abs(cycles - Math.round(cycles)) < 1e-9 && Math.abs(frames - Math.round(frames)) < 1e-9) return s
  }
  return null
}

/**
 * One seamless loop of a unit-amplitude sine at exactly `hz`.
 * Phase is reduced with whole-number arithmetic, (cycles · n) mod frames, so no precision
 * is lost on long buffers; the only rounding is the final float32 sample (~-150 dB).
 */
export function pureSineBuffer(ctx: BaseAudioContext, hz: number): AudioBuffer | null {
  const rate = ctx.sampleRate
  const secs = loopSeconds(hz, rate)
  if (secs === null) return null
  const frames = Math.round(rate * secs)
  const cycles = Math.round(hz * secs)
  const buffer = ctx.createBuffer(1, frames, rate)
  const data = buffer.getChannelData(0)
  const step = (2 * Math.PI) / frames
  let k = 0 // (cycles · n) mod frames, kept exact as an integer
  for (let n = 0; n < frames; n++) {
    data[n] = Math.sin(step * k)
    k += cycles
    if (k >= frames) k -= frames
  }
  return buffer
}

export function createPureTonePlayer(ctx: BaseAudioContext): PureTonePlayer {
  const buffers = new Map<number, AudioBuffer | null>()
  const fall = fallCurve()
  let voice: ToneVoice | null = null
  /** Context time at which the last release finishes; a new tone starts no earlier. */
  let clearAt = 0

  function bufferFor(hz: number) {
    if (!buffers.has(hz)) buffers.set(hz, pureSineBuffer(ctx, hz))
    return buffers.get(hz) ?? null
  }

  function release(v: ToneVoice, at: number) {
    // The release gain has had no automation yet, so a curve here is always legal.
    v.release.gain.setValueCurveAtTime(fall, at, PURE_TONE_FADE)
    v.src.stop(at + PURE_TONE_FADE + 0.005)
    v.src.onended = () => {
      v.src.disconnect()
      v.attack.disconnect()
      v.release.disconnect()
    }
  }

  function stop() {
    if (!voice) return
    const at = ctx.currentTime + LEAD
    release(voice, at)
    clearAt = at + PURE_TONE_FADE
    voice = null
  }

  function play(hz: number) {
    stop()
    const at = Math.max(ctx.currentTime + LEAD, clearAt)
    const buffer = bufferFor(hz)
    let src: AudioScheduledSourceNode
    if (buffer) {
      const node = ctx.createBufferSource()
      node.buffer = buffer
      node.loop = true // loopStart/loopEnd default to the whole buffer: a whole number of cycles
      src = node
    } else {
      // Fallback for tones that never fit a whole number of cycles in 10 s.
      const node = ctx.createOscillator()
      node.type = 'sine'
      node.frequency.setValueAtTime(hz, 0)
      src = node
    }
    const attack = ctx.createGain()
    const releaseGain = ctx.createGain()
    attack.gain.setValueAtTime(0, 0)
    attack.gain.setValueCurveAtTime(riseCurve(PURE_TONE_LEVEL), at, PURE_TONE_FADE)
    releaseGain.gain.value = 1
    src.connect(attack)
    attack.connect(releaseGain)
    releaseGain.connect(ctx.destination)
    src.start(at)
    voice = { hz, src, attack, release: releaseGain }
  }

  return { context: ctx, play, stop, current: () => voice?.hz ?? null }
}
