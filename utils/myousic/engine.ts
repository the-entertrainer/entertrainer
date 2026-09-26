/**
 * Plays a composed section: melody, alto, plucked harmony, bass.
 * Just intonation, no detuned chorus, no held drone.
 */

import { affectAt, baseHzFor, type SessionPlan } from "./bridge"
import { bpmFor, nextSection, type ScoreEvent, type Voice } from "./compose"
import { getScale, type ScaleNote } from "./tunings"

export type Snapshot = {
  degree: number
  amp: number
  label: string
  hz: number
  journey: number
  running: boolean
}

export type LyreEngine = {
  start: (plan: SessionPlan, level: number) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  setLevel: (level: number) => void
  snapshot: () => Snapshot
  isRunning: () => boolean
  dispose: () => void
}

type Playing = {
  when: number
  dur: number
  degree: number
  hz: number
  label: string
  voice: Voice
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeNoise(ctx: AudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * 1.5)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function makeHall(ctx: AudioContext): AudioBuffer {
  const seconds = 2.6
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const data = buf.getChannelData(c)
    for (let i = 0; i < len; i++) {
      const t = i / ctx.sampleRate
      const env = Math.pow(1 - i / len, 1.7) * Math.exp(-t * 1.55)
      data[i] = (Math.random() * 2 - 1) * env * (c === 0 ? 1 : 0.92)
    }
  }
  return buf
}

function freq(base: number, scale: readonly ScaleNote[], degree: number, octave: number): number {
  const d = ((degree % 7) + 7) % 7
  const ratio = scale[d].ratio.n / scale[d].ratio.d
  return Math.max(40, base * ratio * 2 ** octave)
}

export function createEngine(): LyreEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let analyser: AnalyserNode | null = null
  let disposed = false
  let running = false
  let timer = 0
  let level = 0.75
  let plan: SessionPlan | null = null
  let notes: ScaleNote[] = []
  let rng: () => number = Math.random
  let t0 = 0
  let degree = 0
  let label = ""
  let shownHz = 0
  let noise: AudioBuffer | null = null
  let sectionEnd = 0
  let sectionIndex = 0
  let motif: number[] | null = null
  let prevMelody = 0
  const upcoming: Playing[] = []
  const timeData = new Float32Array(1024)

  const empty: Snapshot = {
    degree: 0,
    amp: 0,
    label: "",
    hz: 0,
    journey: 0,
    running: false,
  }

  function ac(): AudioContext {
    if (!ctx || disposed) throw new Error("Sound is not ready")
    return ctx
  }

  function affectNow(): { valence: number; arousal: number; journey: number } {
    if (!plan || !ctx) return { valence: 0, arousal: 0, journey: 0 }
    const journey = clamp((ctx.currentTime - t0) / plan.journeySec, 0, 1)
    return { ...affectAt(plan.start, plan.target, journey), journey }
  }

  function envGain(c: AudioContext, when: number, dur: number, peak: number, attack: number, release: number) {
    const g = c.createGain()
    const a = Math.min(attack, dur * 0.28)
    const r = Math.min(release, dur * 0.42)
    const hold = Math.max(when + a, when + dur - r)
    g.gain.setValueAtTime(0.0001, when)
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), when + a)
    if (hold > when + a + 0.01) g.gain.setValueAtTime(Math.max(0.0002, peak * 0.86), hold)
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur)
    return g
  }

  function tone(
    when: number,
    hz: number,
    dur: number,
    peak: number,
    voice: Voice,
    instrument: "flute" | "violin",
  ) {
    const c = ac()
    if (!master) return
    const bus = envGain(
      c,
      when,
      dur,
      peak,
      voice === "harmony" ? 0.008 : voice === "bass" ? 0.05 : instrument === "violin" ? 0.09 : 0.045,
      voice === "harmony" ? dur * 0.75 : voice === "bass" ? 0.14 : instrument === "violin" ? 0.2 : 0.16,
    )

    const pan = c.createStereoPanner()
    pan.pan.value = voice === "harmony" ? (Math.round(hz / 30) % 2 === 0 ? -0.18 : 0.2) : voice === "alto" ? 0.12 : 0
    bus.connect(pan)
    pan.connect(master)

    const filter = c.createBiquadFilter()
    filter.type = "lowpass"
    if (voice === "melody" && instrument === "violin") {
      filter.frequency.setValueAtTime(900, when)
      filter.frequency.exponentialRampToValueAtTime(3200, when + Math.min(0.35, dur * 0.4))
      filter.Q.value = 0.7
    } else if (voice === "melody") {
      filter.frequency.value = 4800
      filter.Q.value = 0.45
    } else if (voice === "bass") {
      filter.frequency.value = 900
      filter.Q.value = 0.5
    } else {
      filter.frequency.value = 2400
      filter.Q.value = 0.4
    }
    filter.connect(bus)

    const partials =
      voice === "bass"
        ? [1, 2, 3]
        : voice === "harmony"
          ? [1, 2, 3]
          : instrument === "violin"
            ? [1, 2, 3, 4, 5, 6]
            : [1, 2, 3, 4]
    const weights =
      voice === "bass"
        ? [0.72, 0.22, 0.06]
        : voice === "harmony"
          ? [0.7, 0.22, 0.08]
          : instrument === "violin"
            ? [0.42, 0.22, 0.14, 0.09, 0.05, 0.03]
            : [0.7, 0.18, 0.07, 0.03]

    const glideFrom = voice === "melody" && prevMelody > 50 && Math.abs(Math.log2(prevMelody / hz)) < 0.72 ? prevMelody : hz

    partials.forEach((m, i) => {
      const osc = c.createOscillator()
      osc.type = "sine"
      const to = Math.max(1, hz * m)
      const from = Math.max(1, glideFrom * m)
      osc.frequency.setValueAtTime(from, when)
      if (Math.abs(from - to) > 1) osc.frequency.exponentialRampToValueAtTime(to, when + 0.045)
      if (voice === "melody" || voice === "alto") {
        const vib = c.createOscillator()
        vib.frequency.value = instrument === "violin" ? 5.1 : 4.6
        const depth = c.createGain()
        const cents = instrument === "violin" ? 9 : 6
        const full = to * (2 ** (cents / 1200) - 1)
        depth.gain.setValueAtTime(0.0001, when)
        depth.gain.exponentialRampToValueAtTime(Math.max(0.0002, full), when + 0.32)
        vib.connect(depth)
        depth.connect(osc.frequency)
        vib.start(when)
        vib.stop(when + dur + 0.02)
      }
      const g = c.createGain()
      g.gain.value = weights[i] ?? 0.02
      osc.connect(g)
      g.connect(filter)
      osc.start(when)
      osc.stop(when + dur + 0.02)
    })

    if (noise && (voice === "melody" || voice === "alto")) {
      const src = c.createBufferSource()
      src.buffer = noise
      src.loop = true
      const bp = c.createBiquadFilter()
      bp.type = "bandpass"
      bp.frequency.value = instrument === "violin" ? 1800 : 1400
      bp.Q.value = 0.8
      const ng = c.createGain()
      const breath = (instrument === "violin" ? 0.035 : 0.07) * (voice === "alto" ? 0.45 : 1)
      ng.gain.setValueAtTime(0.0001, when)
      ng.gain.exponentialRampToValueAtTime(breath, when + (instrument === "violin" ? 0.12 : 0.05))
      ng.gain.exponentialRampToValueAtTime(0.0001, when + dur)
      src.connect(bp)
      bp.connect(ng)
      ng.connect(filter)
      src.start(when)
      src.stop(when + dur + 0.02)

      if (instrument === "flute" && voice === "melody") {
        const chiff = c.createBufferSource()
        chiff.buffer = noise
        const hp = c.createBiquadFilter()
        hp.type = "bandpass"
        hp.frequency.value = 2800
        hp.Q.value = 1.1
        const cg = c.createGain()
        cg.gain.setValueAtTime(0.04, when)
        cg.gain.exponentialRampToValueAtTime(0.0001, when + 0.07)
        chiff.connect(hp)
        hp.connect(cg)
        cg.connect(master)
        chiff.start(when)
        chiff.stop(when + 0.1)
      }
    }

    if (voice === "melody") prevMelody = hz
  }

  function play(ev: ScoreEvent, when: number, seconds: number, base: number) {
    const instrument = plan?.instrument ?? "flute"
    const hz = freq(base, notes, ev.degree, ev.octave)
    const peak =
      (ev.voice === "melody" ? 0.2 : ev.voice === "bass" ? 0.14 : ev.voice === "alto" ? 0.07 : 0.055) * ev.velocity
    tone(when, hz, Math.max(0.08, seconds), peak, ev.voice, instrument)
    if (ev.voice === "melody") {
      const note = notes[ev.degree]
      upcoming.push({
        when,
        dur: seconds,
        degree: ev.degree,
        hz,
        label: note ? note.label : "",
        voice: ev.voice,
      })
    }
  }

  function scheduleSection(startTime: number) {
    const { valence, arousal } = affectNow()
    const bpm = bpmFor(valence, arousal)
    const beat = 60 / bpm
    const score = nextSection(notes, valence, arousal, rng, sectionIndex, motif)
    motif = score.motif.slice()
    const base = baseHzFor(valence, arousal)
    for (const ev of score.events) {
      let when = startTime + ev.beat * beat
      const strong = ev.beat % 4 < 0.06
      if (ev.voice === "melody" && !strong) when += (rng() - 0.5) * 0.016
      play(ev, when, ev.duration * beat, base)
    }
    sectionIndex += 1
    sectionEnd = startTime + score.beats * beat
  }

  function pump() {
    if (!running || !ctx || !plan || disposed) return
    const now = ctx.currentTime
    if (sectionEnd < now + 1.4) scheduleSection(Math.max(sectionEnd, now + 0.08))
    while (upcoming.length && upcoming[0].when + upcoming[0].dur < now - 0.2) upcoming.shift()
    const live = upcoming.find((n) => n.when <= now + 0.03 && n.when + n.dur > now)
    if (live) {
      degree = live.degree
      label = live.label
      shownHz = live.hz
    }
    timer = window.setTimeout(pump, 160)
  }

  function build() {
    const c = ac()
    noise = makeNoise(c)
    master = c.createGain()
    master.gain.value = 0.0001
    const comp = c.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.knee.value = 16
    comp.ratio.value = 2.4
    comp.attack.value = 0.008
    comp.release.value = 0.22
    analyser = c.createAnalyser()
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.82
    const tone = c.createBiquadFilter()
    tone.type = "lowpass"
    tone.frequency.value = 7800
    master.connect(tone)
    tone.connect(comp)

    const verb = c.createConvolver()
    verb.buffer = makeHall(c)
    const send = c.createGain()
    send.gain.value = 0.34
    const pre = c.createBiquadFilter()
    pre.type = "highpass"
    pre.frequency.value = 180
    tone.connect(send)
    send.connect(pre)
    pre.connect(verb)
    const wet = c.createGain()
    wet.gain.value = 0.85
    verb.connect(wet)
    wet.connect(comp)

    comp.connect(analyser)
    analyser.connect(c.destination)
    const t = c.currentTime
    master.gain.setValueAtTime(0.0001, t)
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.9), t + 0.6)
  }

  return {
    async start(p, nextLevel) {
      if (disposed) return
      level = clamp(nextLevel, 0, 1)
      plan = p
      rng = mulberry32(p.seed || 1)
      notes = getScale(p.tuningId)
      sectionIndex = 0
      motif = null
      sectionEnd = 0
      prevMelody = 0
      upcoming.length = 0
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) throw new Error("This browser has no Web Audio")
      ctx = new AC()
      const resumed = ctx.resume()
      build()
      t0 = ctx.currentTime
      label = notes[0]?.label ?? ""
      shownHz = baseHzFor(p.start.valence, p.start.arousal) * 4
      running = true
      scheduleSection(ctx.currentTime + 0.12)
      await resumed
      pump()
    },

    async pause() {
      running = false
      if (timer) window.clearTimeout(timer)
      timer = 0
      if (master && ctx) {
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime)
        master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16)
        await new Promise((resolve) => window.setTimeout(resolve, 170))
      }
      if (ctx && ctx.state === "running") await ctx.suspend()
    },

    async resume() {
      if (!ctx || disposed) return
      running = true
      if (ctx.state === "suspended") await ctx.resume()
      if (master) {
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.setValueAtTime(0.0001, ctx.currentTime)
        master.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.9), ctx.currentTime + 0.22)
      }
      pump()
    },

    setLevel(next) {
      level = clamp(next, 0, 1)
      if (!master || !ctx || !running) return
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t)
      master.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.9), t + 0.1)
    },

    snapshot() {
      if (!ctx || !plan) return { ...empty, running }
      let amp = 0
      if (analyser) {
        analyser.getFloatTimeDomainData(timeData)
        let sum = 0
        for (let i = 0; i < timeData.length; i++) sum += timeData[i] * timeData[i]
        amp = Math.min(1, Math.sqrt(sum / timeData.length) * 4.2)
      }
      const { journey } = affectNow()
      return { degree, amp, label, hz: shownHz, journey, running }
    },

    isRunning() {
      return running
    },

    dispose() {
      disposed = true
      running = false
      if (timer) window.clearTimeout(timer)
      upcoming.length = 0
      try {
        void ctx?.close()
      } catch {
        /* already closed */
      }
      ctx = null
      master = null
      analyser = null
      plan = null
    },
  }
}
