// A tiny drum machine. The three voices are synthesised from oscillators and
// noise (no samples to load), and playback uses a look-ahead scheduler so the
// groove stays tight even when the main thread is busy — the classic "two
// clocks" pattern: a coarse setInterval wakes up and schedules precise
// Web Audio events a fraction of a second ahead, while a rAF loop reports the
// visible step exactly when its audio actually sounds.

export type Lane = 'kick' | 'snare' | 'hat'
export type Pattern = Record<Lane, boolean[]>
export const STEPS = 16

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_S = 0.12

export class GrooveBox {
  private ctx: AudioContext | null = null
  private noise: AudioBuffer | null = null
  private master: GainNode | null = null
  private pattern: Pattern
  private bpm = 96
  private accentLane: Lane | null = null

  private playing = false
  private currentStep = 0
  private nextNoteTime = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private raf = 0
  private queue: { step: number; time: number }[] = []
  private onStep: ((step: number) => void) | null = null

  muted = false

  constructor(pattern: Pattern) {
    this.pattern = pattern
  }

  get available(): boolean {
    return typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext)
  }

  private ensure() {
    if (this.ctx) return
    const AC = window.AudioContext || (window as any).webkitAudioContext
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.9
    this.master.connect(this.ctx.destination)
    // one second of white noise, reused by the snare and hat
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    this.noise = buf
  }

  async resume() {
    this.ensure()
    if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume()
  }

  setPattern(p: Pattern) { this.pattern = p }
  setBpm(b: number) { this.bpm = b }
  setMuted(m: boolean) { this.muted = m }

  private secondsPerStep() { return (60 / this.bpm) / 4 } // sixteenth notes

  async start(onStep: (step: number) => void) {
    if (!this.available) { this.onStep = onStep; this.startSilent(onStep); return }
    await this.resume()
    if (!this.ctx) return
    this.onStep = onStep
    this.playing = true
    this.currentStep = 0
    this.queue = []
    this.nextNoteTime = this.ctx.currentTime + 0.08
    this.timer = setInterval(() => this.scheduler(), LOOKAHEAD_MS)
    this.raf = requestAnimationFrame(() => this.draw())
  }

  // Fallback when Web Audio is unavailable: drive the visual playhead only.
  private startSilent(onStep: (step: number) => void) {
    this.playing = true
    this.currentStep = 0
    const stepMs = this.secondsPerStep() * 1000
    this.timer = setInterval(() => {
      onStep(this.currentStep)
      this.currentStep = (this.currentStep + 1) % STEPS
    }, stepMs)
  }

  stop() {
    this.playing = false
    if (this.timer) { clearInterval(this.timer); this.timer = null }
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0 }
    this.queue = []
  }

  get isPlaying() { return this.playing }

  /** One-shot audition of a single voice (used when toggling a cell). */
  async tap(lane: Lane) {
    if (!this.available || this.muted) return
    await this.resume()
    if (this.ctx) this.trigger(lane, this.ctx.currentTime)
  }

  private scheduler() {
    if (!this.ctx) return
    while (this.nextNoteTime < this.ctx.currentTime + SCHEDULE_AHEAD_S) {
      if (!this.muted) {
        for (const lane of ['kick', 'snare', 'hat'] as Lane[]) {
          if (this.pattern[lane]?.[this.currentStep]) this.trigger(lane, this.nextNoteTime)
        }
      }
      this.queue.push({ step: this.currentStep, time: this.nextNoteTime })
      this.nextNoteTime += this.secondsPerStep()
      this.currentStep = (this.currentStep + 1) % STEPS
    }
  }

  private draw() {
    if (!this.ctx) return
    const now = this.ctx.currentTime
    while (this.queue.length && this.queue[0].time <= now) {
      const q = this.queue.shift()!
      this.onStep?.(q.step)
    }
    if (this.playing) this.raf = requestAnimationFrame(() => this.draw())
  }

  private trigger(lane: Lane, time: number) {
    if (!this.ctx || !this.master) return
    if (lane === 'kick') this.kick(time)
    else if (lane === 'snare') this.snare(time)
    else this.hat(time)
  }

  private kick(time: number) {
    const ctx = this.ctx!, out = this.master!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, time)
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.11)
    gain.gain.setValueAtTime(1.0, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22)
    osc.connect(gain).connect(out)
    osc.start(time)
    osc.stop(time + 0.24)
  }

  private snare(time: number) {
    const ctx = this.ctx!, out = this.master!
    // noise body
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'; hp.frequency.value = 1200
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.7, time)
    ng.gain.exponentialRampToValueAtTime(0.001, time + 0.16)
    src.connect(hp).connect(ng).connect(out)
    src.start(time); src.stop(time + 0.18)
    // tonal snap
    const osc = ctx.createOscillator()
    const og = ctx.createGain()
    osc.type = 'triangle'; osc.frequency.value = 185
    og.gain.setValueAtTime(0.5, time)
    og.gain.exponentialRampToValueAtTime(0.001, time + 0.1)
    osc.connect(og).connect(out)
    osc.start(time); osc.stop(time + 0.12)
  }

  private hat(time: number) {
    const ctx = this.ctx!, out = this.master!
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'; hp.frequency.value = 8000
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.35, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.045)
    src.connect(hp).connect(g).connect(out)
    src.start(time); src.stop(time + 0.06)
  }

  dispose() {
    this.stop()
    if (this.ctx) { this.ctx.close().catch(() => {}); this.ctx = null }
  }
}
