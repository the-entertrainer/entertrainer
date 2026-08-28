/**
 * EKANS sound — a tiny Web Audio chiptune synth, plus one real sample.
 *
 * Nearly everything is generated at runtime: square and triangle
 * oscillators, pitch sweeps and filtered noise, all with very short
 * envelopes. The one exception is the bite — thirteen individual chews cut
 * from a single field recording, played back at random so the same crunch
 * never lands twice in a row. They're tiny (a few KB each) and fetched
 * lazily on first use, so a page that never eats never downloads them.
 *
 * Browsers refuse to start audio outside a user gesture, so the context is
 * created lazily on the first tap and resumed if it was suspended.
 */

const STORE_KEY = 'ekans-muted'
const CHEW_COUNT = 13
const CHEW_URL = (n: number) => `/sounds/ekans/chew/chew-${String(n).padStart(2, '0')}.mp3`

class ArcadeAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private _muted = false
  private _ready = false
  private chewBuffers: AudioBuffer[] = []
  private chewLoadStarted = false
  private lastChewIndex = -1

  get muted() { return this._muted }

  /** Read the stored preference. Safe to call before any gesture. */
  restore() {
    if (typeof window === 'undefined') return
    try { this._muted = window.localStorage.getItem(STORE_KEY) === '1' } catch { /* private mode */ }
  }

  setMuted(v: boolean) {
    this._muted = v
    try { window.localStorage.setItem(STORE_KEY, v ? '1' : '0') } catch { /* private mode */ }
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v ? 0 : 0.9, this.ctx.currentTime, 0.02)
    }
  }

  /** Call from inside a real user gesture (a tap or click handler). */
  unlock() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
      if (!Ctor) return
      try {
        this.ctx = new Ctor()
        this.master = this.ctx.createGain()
        this.master.gain.value = this._muted ? 0 : 0.9
        this.master.connect(this.ctx.destination)
        this._ready = true
        void this.loadChewBuffers()
      } catch { this.ctx = null }
    }
    if (this.ctx?.state === 'suspended') void this.ctx.resume().catch(() => undefined)
  }

  dispose() {
    try { void this.ctx?.close() } catch { /* already gone */ }
    this.ctx = null; this.master = null; this._ready = false
    this.chewBuffers = []; this.chewLoadStarted = false; this.lastChewIndex = -1
  }

  /** Fetch and decode the thirteen chew clips once, in the background. */
  private async loadChewBuffers() {
    if (this.chewLoadStarted || !this.ctx) return
    this.chewLoadStarted = true
    const ctx = this.ctx
    const clips = await Promise.all(
      Array.from({ length: CHEW_COUNT }, async (_, i) => {
        try {
          const res = await fetch(CHEW_URL(i + 1))
          const bytes = await res.arrayBuffer()
          return await ctx.decodeAudioData(bytes)
        } catch { return null }
      })
    )
    this.chewBuffers = clips.filter((clip): clip is AudioBuffer => clip != null)
  }

  /** One random chew clip, never the same one twice in a row. */
  private playChew() {
    if (!this.live() || !this.chewBuffers.length) return false
    const ctx = this.ctx!
    let index = Math.floor(Math.random() * this.chewBuffers.length)
    if (this.chewBuffers.length > 1 && index === this.lastChewIndex) index = (index + 1) % this.chewBuffers.length
    this.lastChewIndex = index
    const src = ctx.createBufferSource()
    src.buffer = this.chewBuffers[index]
    src.playbackRate.value = 0.94 + Math.random() * 0.12
    const gain = ctx.createGain()
    gain.gain.value = 0.8 + Math.random() * 0.2
    src.connect(gain); gain.connect(this.master!)
    src.start()
    src.onended = () => { src.disconnect(); gain.disconnect() }
    return true
  }

  private get t() { return this.ctx ? this.ctx.currentTime : 0 }
  private live() { return this._ready && !!this.ctx && !!this.master && !this._muted }

  /** One oscillator with an attack/decay envelope, optionally gliding in pitch. */
  private tone(opts: {
    from: number; to?: number; dur: number
    type?: OscillatorType; vol?: number; delay?: number; glideCurve?: 'lin' | 'exp'
  }) {
    if (!this.live()) return
    const ctx = this.ctx!, start = this.t + (opts.delay ?? 0)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = opts.type ?? 'square'
    osc.frequency.setValueAtTime(opts.from, start)
    if (opts.to != null && opts.to !== opts.from) {
      if (opts.glideCurve === 'lin') osc.frequency.linearRampToValueAtTime(opts.to, start + opts.dur)
      else osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), start + opts.dur)
    }
    const peak = opts.vol ?? 0.18
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(peak, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.dur)
    osc.connect(gain); gain.connect(this.master!)
    osc.start(start); osc.stop(start + opts.dur + 0.02)
    osc.onended = () => { osc.disconnect(); gain.disconnect() }
  }

  /** Filtered white noise — the bite, the crumble, the thud. */
  private noise(opts: { dur: number; from: number; to: number; vol?: number; delay?: number; q?: number }) {
    if (!this.live()) return
    const ctx = this.ctx!, start = this.t + (opts.delay ?? 0)
    const frames = Math.max(1, Math.floor(ctx.sampleRate * opts.dur))
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource(); src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = opts.q ?? 1.4
    filter.frequency.setValueAtTime(opts.from, start)
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), start + opts.dur)
    const gain = ctx.createGain()
    const peak = opts.vol ?? 0.16
    gain.gain.setValueAtTime(peak, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.dur)
    src.connect(filter); filter.connect(gain); gain.connect(this.master!)
    src.start(start); src.stop(start + opts.dur + 0.02)
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect() }
  }

  // --- the kit ------------------------------------------------------------

  /** Generic UI press. */
  tap() { this.tone({ from: 620, to: 880, dur: 0.06, vol: 0.10 }) }

  /** Mode / option change — a step up the scale. */
  select() { this.tone({ from: 520, to: 780, dur: 0.07, type: 'square', vol: 0.11 }) }

  /** Food dropped on the board: a bright two-step blip. */
  place() {
    this.tone({ from: 880, dur: 0.045, vol: 0.10 })
    this.tone({ from: 1320, dur: 0.06, vol: 0.085, delay: 0.045 })
  }

  /** Illegal tap. */
  deny() { this.tone({ from: 180, to: 90, dur: 0.13, type: 'square', vol: 0.13, glideCurve: 'lin' }) }

  /**
   * The bite. A random real chew if the samples have loaded, a synthesized
   * two-burst crunch if they haven't yet — either way, a short low body
   * underneath for weight.
   */
  crunch() {
    if (!this.playChew()) {
      this.noise({ dur: 0.055, from: 2600, to: 700, vol: 0.15, q: 1.1 })
      this.noise({ dur: 0.07, from: 1500, to: 380, vol: 0.11, q: 1.6, delay: 0.045 })
    }
    this.tone({ from: 300, to: 150, dur: 0.10, type: 'triangle', vol: 0.13, glideCurve: 'lin' })
    this.tone({ from: 1100, to: 1500, dur: 0.05, vol: 0.05, delay: 0.02 })
  }

  /** Run starts. */
  start() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.09, vol: 0.12, delay: i * 0.055 }))
  }

  /** The snake is trapped — the player won. */
  win() {
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.16, vol: 0.14, delay: i * 0.075 }))
    this.tone({ from: 1047, dur: 0.42, type: 'triangle', vol: 0.10, delay: 0.42 })
  }

  /** The snake made its target — the player lost. */
  lose() {
    const notes = [440, 392, 330, 247]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.20, type: 'square', vol: 0.12, delay: i * 0.10 }))
    this.tone({ from: 180, to: 90, dur: 0.5, type: 'triangle', vol: 0.10, delay: 0.42, glideCurve: 'lin' })
  }

  /** Solver found a line. */
  reveal() {
    const notes = [784, 988, 1319]
    notes.forEach((f, i) => this.tone({ from: f, dur: 0.11, vol: 0.11, delay: i * 0.06 }))
  }
}

export const arcade = new ArcadeAudio()
