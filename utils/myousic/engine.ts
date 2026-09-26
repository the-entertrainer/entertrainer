/**
 * Procedural flute or violin over a sexagesimal drone.
 * Partials are divisors of 60. No detuned chorus — consonance stays exact.
 * The just major third (5th harmonic) fades in only as pleasantness rises.
 */

import { affectAt, baseHzFor, degreeWeight, noteSeconds, type SessionPlan } from "./bridge"
import { getScale, type ScaleNote } from "./tunings"

export type Snapshot = {
  degree: number
  amp: number
  label: string
  hz: number
  journey: number
  running: boolean
}

type Stoppable = { stop: (when?: number) => void }

export type LyreEngine = {
  start: (plan: SessionPlan, level: number) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  setLevel: (level: number) => void
  snapshot: () => Snapshot
  isRunning: () => boolean
  dispose: () => void
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
  const len = Math.floor(ctx.sampleRate * 1.2)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function makeHall(ctx: AudioContext): AudioBuffer {
  const seconds = 3.4
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const data = buf.getChannelData(c)
    for (let i = 0; i < len; i++) {
      const t = i / ctx.sampleRate
      const env = Math.pow(1 - i / len, 2.15) * Math.exp(-t * 1.25)
      data[i] = (Math.random() * 2 - 1) * env
    }
  }
  return buf
}

function weightedPick(weights: number[], rng: () => number): number {
  let sum = 0
  for (const w of weights) sum += Math.max(0, w)
  if (sum <= 0) return Math.floor(rng() * weights.length)
  let r = rng() * sum
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i])
    if (r <= 0) return i
  }
  return weights.length - 1
}

export function createEngine(): LyreEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let disposed = false
  let running = false
  let timer = 0
  let level = 0.75
  let plan: SessionPlan | null = null
  let notes: ScaleNote[] = []
  let rng: () => number = Math.random
  let t0 = 0
  let nextNote = 0
  let prevDegree = -1
  let prev2 = -1
  let prevHz = 0
  let degree = 0
  let label = ""
  let shownHz = 0
  let droneBase = 60
  let noise: AudioBuffer | null = null
  const stops: Stoppable[] = []
  const droneOsc: OscillatorNode[] = []
  const droneMults = [1, 2, 3, 4]
  let bloomOsc: OscillatorNode | null = null
  let bloomGain: GainNode | null = null
  let analyser: AnalyserNode | null = null
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
    const elapsed = ctx.currentTime - t0
    const journey = clamp(elapsed / plan.journeySec, 0, 1)
    const point = affectAt(plan.start, plan.target, journey)
    return { ...point, journey }
  }

  function track(node: Stoppable) {
    stops.push(node)
  }

  function glideDrone(base: number, when: number) {
    if (!ctx) return
    const sec = 7.5
    droneOsc.forEach((osc, i) => {
      const dest = Math.max(1, base * droneMults[i])
      const t = Math.max(when, ctx!.currentTime)
      osc.frequency.cancelScheduledValues(t)
      osc.frequency.setValueAtTime(Math.max(1, osc.frequency.value || dest), t)
      osc.frequency.exponentialRampToValueAtTime(dest, t + sec)
    })
    if (bloomOsc) {
      const dest = Math.max(1, base * 5)
      const t = Math.max(when, ctx.currentTime)
      bloomOsc.frequency.cancelScheduledValues(t)
      bloomOsc.frequency.setValueAtTime(Math.max(1, bloomOsc.frequency.value || dest), t)
      bloomOsc.frequency.exponentialRampToValueAtTime(dest, t + sec)
    }
    droneBase = base
  }

  function scheduleLead(when: number, hz: number, dur: number, bloom: number) {
    const c = ac()
    const instrument = plan?.instrument ?? "flute"
    const peak = instrument === "violin" ? 0.2 : 0.18
    const attack = instrument === "violin" ? 0.32 : 0.18
    const bus = c.createGain()
    bus.gain.setValueAtTime(0.0001, when)
    bus.gain.exponentialRampToValueAtTime(peak, when + attack)
    const holdAt = when + Math.max(attack + 0.05, dur * 0.62)
    bus.gain.setValueAtTime(peak * 0.9, holdAt)
    bus.gain.exponentialRampToValueAtTime(0.0001, when + dur)
    bus.connect(master!)

    const partials = instrument === "violin" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]
    const weights =
      instrument === "violin"
        ? [0.46, 0.22, 0.13, 0.08, 0.05, 0.035]
        : [0.74, 0.16, 0.055, 0.02, 0.012 + bloom * 0.04]

    const startHz = prevHz > 40 && prevHz / hz < 2.2 && hz / prevHz < 2.2 ? prevHz : hz
    const glide = startHz !== hz ? 0.16 : 0.001

    const filter = c.createBiquadFilter()
    if (instrument === "violin") {
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(700, when)
      filter.frequency.exponentialRampToValueAtTime(2400 + bloom * 1800, when + 0.45)
      filter.Q.value = 0.6
    } else {
      filter.type = "lowpass"
      filter.frequency.value = 4200
      filter.Q.value = 0.4
    }
    filter.connect(bus)

    partials.forEach((m, i) => {
      const osc = c.createOscillator()
      osc.type = "sine"
      const from = Math.max(1, startHz * m)
      const to = Math.max(1, hz * m)
      osc.frequency.setValueAtTime(from, when)
      if (glide > 0.01) osc.frequency.exponentialRampToValueAtTime(to, when + glide)
      const vib = c.createOscillator()
      vib.frequency.setValueAtTime(instrument === "violin" ? 5.4 : 4.7, when)
      const depth = c.createGain()
      const cents = instrument === "violin" ? 11 : 7
      depth.gain.setValueAtTime(to * (2 ** (cents / 1200) - 1), when)
      vib.connect(depth)
      depth.connect(osc.frequency)
      const g = c.createGain()
      g.gain.value = weights[i] ?? 0.02
      osc.connect(g)
      g.connect(filter)
      osc.start(when)
      vib.start(when)
      osc.stop(when + dur + 0.02)
      vib.stop(when + dur + 0.02)
    })

    if (noise) {
      const src = c.createBufferSource()
      src.buffer = noise
      src.loop = true
      const bp = c.createBiquadFilter()
      bp.type = "bandpass"
      bp.frequency.value = instrument === "violin" ? 2200 : 1500
      bp.Q.value = instrument === "violin" ? 0.7 : 0.8
      const ng = c.createGain()
      const breath = instrument === "violin" ? 0.018 : 0.045
      ng.gain.setValueAtTime(0.0001, when)
      ng.gain.exponentialRampToValueAtTime(breath, when + (instrument === "violin" ? 0.2 : 0.08))
      ng.gain.exponentialRampToValueAtTime(breath * 0.55, when + dur * 0.7)
      ng.gain.exponentialRampToValueAtTime(0.0001, when + dur)
      src.connect(bp)
      bp.connect(ng)
      ng.connect(filter)
      src.start(when)
      src.stop(when + dur + 0.02)

      if (instrument === "flute") {
        const chiff = c.createBufferSource()
        chiff.buffer = noise
        const hp = c.createBiquadFilter()
        hp.type = "bandpass"
        hp.frequency.value = 2600
        hp.Q.value = 1.2
        const cg = c.createGain()
        cg.gain.setValueAtTime(0.05, when)
        cg.gain.exponentialRampToValueAtTime(0.0001, when + 0.11)
        chiff.connect(hp)
        hp.connect(cg)
        cg.connect(master!)
        chiff.start(when)
        chiff.stop(when + 0.16)
      }
    }
  }

  function pump() {
    if (!running || !ctx || !plan || disposed) return
    const now = ctx.currentTime
    const { valence, arousal, journey } = affectNow()
    const base = baseHzFor(valence, arousal)
    if (base !== droneBase) glideDrone(base, now)

    if (bloomGain) {
      const bloom = smoothBloom(valence)
      bloomGain.gain.setTargetAtTime(0.0008 + bloom * 0.062, now, 1.4)
    }

    while (nextNote < now + 0.35) {
      const weights = notes.map((n, i) => {
        if (i === prevDegree) return 0
        let w = degreeWeight(n.ratio.n / n.ratio.d, valence, arousal)
        if (i === prev2) w *= 0.4
        const step = Math.min(Math.abs(i - Math.max(prevDegree, 0)), 7 - Math.abs(i - Math.max(prevDegree, 0)))
        if (prevDegree >= 0 && arousal < 0.05 && step === 1) w *= 1.3
        if (prevDegree >= 0 && arousal > 0.3 && step >= 2) w *= 1.15
        return w
      })
      const idx = weightedPick(weights, rng)
      const note = notes[idx]
      const ratio = note.ratio.n / note.ratio.d
      let hz = base * ratio * 4
      while (hz > 760) hz /= 2
      while (hz < 210) hz *= 2
      const interval = noteSeconds(arousal) * (0.9 + rng() * 0.18)
      const dur = interval * 1.38
      const when = Math.max(nextNote, now + 0.02)
      scheduleLead(when, hz, dur, smoothBloom(valence))
      prev2 = prevDegree
      prevDegree = idx
      prevHz = hz
      degree = idx
      label = note.label
      shownHz = hz
      nextNote += interval
    }

    void journey
    timer = window.setTimeout(pump, 120)
  }

  function smoothBloom(valence: number): number {
    const t = clamp((valence + 0.05) / 0.7, 0, 1)
    return t * t * (3 - 2 * t)
  }

  function build(p: SessionPlan) {
    const c = ac()
    noise = makeNoise(c)
    master = c.createGain()
    master.gain.value = 0.0001
    const comp = c.createDynamicsCompressor()
    comp.threshold.value = -16
    comp.knee.value = 18
    comp.ratio.value = 2.2
    comp.attack.value = 0.012
    comp.release.value = 0.28
    analyser = c.createAnalyser()
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.85
    master.connect(comp)
    comp.connect(analyser)
    analyser.connect(c.destination)

    const verb = c.createConvolver()
    verb.buffer = makeHall(c)
    const pre = c.createDelay(0.08)
    pre.delayTime.value = 0.03
    const tone = c.createBiquadFilter()
    tone.type = "lowpass"
    tone.frequency.value = 3600
    const send = c.createGain()
    send.gain.value = 0.42
    master.connect(send)
    send.connect(tone)
    tone.connect(pre)
    pre.connect(verb)
    const wet = c.createGain()
    wet.gain.value = 0.9
    verb.connect(wet)
    wet.connect(comp)

    notes = getScale(p.tuningId)
    const base = baseHzFor(p.start.valence, p.start.arousal)
    droneBase = base
    const now = c.currentTime
    droneMults.forEach((m, i) => {
      const osc = c.createOscillator()
      osc.type = "sine"
      osc.frequency.value = base * m
      const g = c.createGain()
      g.gain.value = [0.05, 0.085, 0.05, 0.028][i] ?? 0.03
      const lfo = c.createOscillator()
      lfo.frequency.value = 0.07 + i * 0.012
      const ld = c.createGain()
      ld.gain.value = g.gain.value * 0.18
      lfo.connect(ld)
      ld.connect(g.gain)
      osc.connect(g)
      g.connect(master!)
      osc.start(now)
      lfo.start(now)
      droneOsc.push(osc)
      track(osc)
      track(lfo)
    })

    bloomOsc = c.createOscillator()
    bloomOsc.type = "sine"
    bloomOsc.frequency.value = base * 5
    bloomGain = c.createGain()
    bloomGain.gain.value = 0.0008
    bloomOsc.connect(bloomGain)
    bloomGain.connect(master)
    bloomOsc.start(now)
    track(bloomOsc)

    const t = c.currentTime
    master.gain.setValueAtTime(0.0001, t)
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.78), t + 1.1)
  }

  return {
    async start(p, nextLevel) {
      if (disposed) return
      level = clamp(nextLevel, 0, 1)
      plan = p
      rng = mulberry32(p.seed || 1)
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) throw new Error("This browser has no Web Audio")
      ctx = new AC()
      const resumed = ctx.resume()
      build(p)
      t0 = ctx.currentTime
      nextNote = ctx.currentTime + 0.35
      running = true
      label = notes[0]?.label ?? ""
      shownHz = baseHzFor(p.start.valence, p.start.arousal) * 4
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
        master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
        await new Promise((resolve) => window.setTimeout(resolve, 190))
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
        master.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.78), ctx.currentTime + 0.25)
      }
      pump()
    },

    setLevel(next) {
      level = clamp(next, 0, 1)
      if (!master || !ctx || !running) return
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t)
      master.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.78), t + 0.12)
    },

    snapshot() {
      if (!ctx || !plan) return { ...empty, running }
      let amp = 0
      if (analyser) {
        analyser.getFloatTimeDomainData(timeData)
        let sum = 0
        for (let i = 0; i < timeData.length; i++) sum += timeData[i] * timeData[i]
        amp = Math.min(1, Math.sqrt(sum / timeData.length) * 5)
      }
      const { journey } = affectNow()
      return {
        degree,
        amp,
        label,
        hz: shownHz,
        journey,
        running,
      }
    },

    isRunning() {
      return running
    },

    dispose() {
      disposed = true
      running = false
      if (timer) window.clearTimeout(timer)
      const t = ctx?.currentTime ?? 0
      for (const node of stops) {
        try {
          node.stop(t)
        } catch {
          /* already stopped */
        }
      }
      stops.length = 0
      droneOsc.length = 0
      try {
        void ctx?.close()
      } catch {
        /* */
      }
      ctx = null
      master = null
      bloomOsc = null
      bloomGain = null
      analyser = null
      plan = null
    },
  }
}
