/** Indian action-reel chiptune. A run picks a scale, a root, and a lead.
 *  The person in the room picks the reel. The year picks the tuning.
 *  After 2040 the same dhol goes through a slapback. */

export type Cue =
  | 'oath' | 'rally' | 'news' | 'baba' | 'money' | 'court'
  | 'family' | 'chase' | 'foreign' | 'street' | 'future'

export type Scene = {
  cue: Cue
  year: number
  later: boolean
  danger: boolean
  janta: number
  khazana: number
}

type Reel = {
  bpm: number
  kick: number[]
  slap: number[]
  hat: number[]
  bass: number[]
  brass: number[]
  leads: number[][]
  drone?: boolean
}

const SCALES: number[][] = [
  [0, 1, 4, 5, 7, 8, 11],
  [0, 1, 3, 5, 7, 8, 10],
  [0, 2, 3, 5, 7, 8, 11],
  [0, 2, 4, 6, 7, 9, 11],
  [0, 2, 3, 5, 7, 9, 10],
  [0, 2, 3, 6, 7, 9, 10],
  [0, 1, 3, 6, 7, 8, 11],
  [0, 1, 3, 6, 7, 8, 10]
]

const REELS: Record<Cue, Reel> = {
  oath: {
    bpm: 100,
    drone: true,
    kick: [1, 0, 0, 0, 0, 0, 0.7, 0, 1, 0, 0, 0, 0, 0, 0.7, 0],
    slap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [0, 0, 0.3, 0, 0, 0, 0.3, 0, 0, 0, 0.3, 0, 0, 0, 0.3, 0],
    bass: [0, -1, -1, -1, 0, -1, -1, -1, 5, -1, -1, -1, 4, -1, -1, -1],
    brass: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    leads: [
      [0, -1, 4, -1, 7, -1, 12, 11, 7, -1, 4, -1, 0, 0, -1, -1],
      [0, -1, 7, -1, 12, -1, 7, 4, 5, -1, 4, -1, 0, -1, -1, -1],
      [7, -1, 4, -1, 0, -1, 4, 7, 12, -1, 7, -1, 4, 0, -1, -1],
      [0, 0, -1, 4, -1, 7, -1, 12, -1, 7, -1, 4, -1, 0, -1, -1]
    ]
  },
  rally: {
    bpm: 132,
    kick: [1, 0, 0, 0, 1, 0, 0.65, 0, 1, 0, 0, 0, 1, 0, 0.65, 0],
    slap: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    hat: [0, 0.25, 0, 0.25, 0, 0.25, 0, 0.25, 0, 0.25, 0, 0.25, 0, 0.25, 0, 0.25],
    bass: [0, -1, 0, -1, 4, -1, 0, -1, 0, -1, 0, -1, 7, -1, 4, -1],
    brass: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    leads: [
      [0, 0, 4, 7, 4, 0, 1, 0, 7, 4, 1, 0, 4, 7, 8, 7],
      [0, -1, 4, -1, 7, 4, 0, -1, 1, 0, 4, 7, 4, 1, 0, -1],
      [7, 4, 0, 4, 7, 8, 7, 4, 0, 1, 0, 4, 7, 4, 0, -1],
      [0, 4, 7, 4, 0, -1, 1, 0, 4, -1, 7, 4, 8, 7, 4, 0]
    ]
  },
  news: {
    bpm: 124,
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    slap: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    hat: [0.2, 0, 0.2, 0, 0.5, 0, 0.2, 0, 0.2, 0, 0.2, 0, 0.5, 0, 0.2, 0],
    bass: [0, -1, -1, -1, 1, -1, -1, -1, 0, -1, -1, -1, 4, -1, 0, -1],
    brass: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    leads: [
      [0, -1, 1, -1, 0, -1, -1, 4, 1, -1, 0, -1, 8, -1, 7, -1],
      [0, -1, -1, 1, -1, -1, 0, -1, 4, -1, -1, 1, -1, 0, -1, -1],
      [8, -1, 7, -1, 4, -1, 1, 0, -1, 1, -1, 0, -1, -1, 4, -1],
      [0, 1, 0, -1, 1, 0, 4, -1, 0, -1, 1, -1, 0, 4, 0, -1]
    ]
  },
  baba: {
    bpm: 108,
    drone: true,
    kick: [1, 0, 0, 0.5, 0, 0, 1, 0, 1, 0, 0, 0.5, 0, 0, 1, 0],
    slap: [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
    hat: [0, 0, 0, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0.3, 0, 0, 0],
    bass: [0, -1, -1, -1, 0, -1, -1, -1, 0, -1, 1, -1, 0, -1, -1, -1],
    brass: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    leads: [
      [0, 0, 0, 1, 1, 0, 4, 4, 5, 4, 1, 0, 0, 1, 0, -1],
      [0, -1, 1, 0, -1, 4, -1, 5, 4, 1, 0, -1, 0, -1, 4, 0],
      [4, 4, 5, 4, 1, 0, 0, 1, 0, -1, 0, 1, 4, 5, 4, 0],
      [0, 0, 1, 0, 4, 4, 5, 4, 0, 0, 1, 0, 7, 4, 1, 0]
    ]
  },
  money: {
    bpm: 116,
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    slap: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    hat: [0, 0, 0.3, 0, 0, 0, 0.3, 0, 0, 0, 0.3, 0, 0, 0, 0.3, 0],
    bass: [0, -1, 7, -1, 5, -1, 4, -1, 0, -1, 7, -1, 10, -1, 7, 0],
    brass: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    leads: [
      [0, -1, 7, -1, 5, -1, 4, 0, 7, -1, 10, -1, 7, 5, 4, 0],
      [7, 7, 5, 4, 0, -1, 4, -1, 7, 10, 7, 5, 4, 0, -1, -1],
      [0, 4, 5, 7, 10, 7, 5, 4, 0, -1, 7, -1, 4, 0, -1, -1],
      [4, -1, 5, -1, 7, 0, -1, 4, 7, -1, 5, 4, 0, -1, -1, -1]
    ]
  },
  court: {
    bpm: 90,
    drone: true,
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 0, 0],
    slap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [0, 0, 0.2, 0, 0, 0, 0.2, 0, 0, 0, 0.2, 0, 0, 0, 0.2, 0],
    bass: [0, -1, -1, -1, 0, -1, -1, -1, 5, -1, -1, -1, 4, -1, -1, -1],
    brass: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    leads: [
      [0, -1, -1, 1, -1, -1, 0, -1, 5, -1, -1, 4, -1, -1, 0, -1],
      [0, -1, -1, -1, 1, -1, 0, -1, -1, 5, -1, 4, -1, 0, -1, -1],
      [4, -1, 5, -1, 4, -1, 0, -1, 1, -1, 0, -1, -1, -1, 0, -1],
      [0, 1, 0, -1, -1, -1, 5, 4, 0, -1, -1, -1, 0, -1, -1, -1]
    ]
  },
  family: {
    bpm: 126,
    kick: [1, 0, 0, 0.45, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0.5, 0, 0],
    slap: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
    hat: [0, 0.2, 0, 0.2, 0, 0.4, 0, 0.2, 0, 0.2, 0, 0.2, 0, 0.4, 0, 0.2],
    bass: [0, -1, 0, 4, 7, -1, 4, 0, 0, -1, 4, -1, 7, 4, 0, -1],
    brass: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    leads: [
      [0, 4, 7, 4, 0, 4, 7, 8, 7, 4, 0, -1, 4, 7, 4, 0],
      [0, -1, 4, 7, 8, 7, 4, 0, 4, -1, 0, 4, 7, 4, 0, -1],
      [7, 4, 0, -1, 4, 7, 8, 7, 0, 4, 0, -1, 4, 0, -1, -1],
      [0, 0, 4, 4, 7, 7, 8, 7, 4, 0, -1, 4, 7, 4, 0, -1]
    ]
  },
  chase: {
    bpm: 156,
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    slap: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    hat: [0.35, 0, 0.35, 0, 0.35, 0, 0.35, 0, 0.35, 0, 0.35, 0, 0.55, 0, 0.35, 0],
    bass: [0, -1, 0, 0, -1, 0, -1, 4, 0, -1, 0, 0, -1, 7, -1, 4],
    brass: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    leads: [
      [7, 7, 8, 7, 4, 1, 0, -1, 11, 8, 7, 4, 1, 0, 4, 7],
      [7, -1, 8, 7, -1, 4, -1, 1, 0, -1, 4, 7, 11, 7, 4, 0],
      [11, 8, 7, 4, 7, 4, 1, 0, 4, 7, 8, 11, 7, 4, 0, -1],
      [0, 4, 7, 11, 7, 4, 1, 0, 7, 8, 7, 4, 1, 0, -1, 7]
    ]
  },
  foreign: {
    bpm: 112,
    kick: [1, 0, 0, 0, 0, 0, 0.7, 0, 1, 0, 0, 0, 0, 0, 0.7, 0],
    slap: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    hat: [0, 0, 0.25, 0, 0, 0, 0.25, 0, 0, 0, 0.25, 0, 0, 0, 0.25, 0],
    bass: [4, -1, -1, 4, 7, -1, 4, -1, 0, -1, -1, 0, 4, -1, 0, -1],
    brass: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    leads: [
      [4, 4, 5, 7, -1, 4, 0, -1, 7, 8, 7, 5, 4, 0, -1, -1],
      [7, -1, 8, 7, 5, 4, 0, -1, 4, 5, 7, 4, 0, -1, -1, -1],
      [0, -1, 4, -1, 7, 5, 4, 0, 8, -1, 7, 5, 4, 0, -1, -1],
      [4, 5, 7, 8, 7, 5, 4, 0, -1, 4, -1, 0, -1, -1, 4, -1]
    ]
  },
  street: {
    bpm: 128,
    kick: [1, 0, 0, 0, 1, 0, 0.5, 0, 0, 0, 1, 0, 1, 0, 0.5, 0],
    slap: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    hat: [0, 0.3, 0, 0.3, 0, 0.3, 0, 0.3, 0, 0.3, 0, 0.3, 0, 0.3, 0, 0.3],
    bass: [0, -1, 0, 1, 0, -1, 4, -1, 5, 4, 0, -1, 1, 0, 4, 0],
    brass: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    leads: [
      [0, 1, 0, 4, 0, 1, 4, 5, 4, 1, 0, -1, 7, 4, 1, 0],
      [0, -1, 1, 0, 4, 5, 4, 1, 0, -1, 4, 7, 4, 1, 0, -1],
      [4, 1, 0, 1, 4, 5, 7, 4, 1, 0, -1, 0, 4, 1, 0, -1],
      [7, 4, 1, 0, 1, 0, 4, 5, 4, 0, -1, 1, 0, -1, 4, 0]
    ]
  },
  future: {
    bpm: 144,
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
    slap: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1],
    hat: [0.3, 0.15, 0.3, 0.15, 0.3, 0.15, 0.3, 0.15, 0.5, 0.15, 0.3, 0.15, 0.3, 0.15, 0.5, 0.15],
    bass: [0, -1, 0, 7, 0, -1, 4, -1, 0, -1, 0, 11, 7, -1, 4, 0],
    brass: [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    leads: [
      [0, 4, 7, 11, 12, 11, 7, 4, 14, 12, 11, 7, 4, 0, 7, 12],
      [7, 11, 12, 7, 4, 0, -1, 4, 11, 7, 4, 0, 12, 11, 7, 0],
      [0, -1, 7, 12, 11, 7, 4, 0, 4, 7, 11, 14, 12, 7, 4, 0],
      [12, 11, 7, 4, 0, 4, 7, 11, 14, -1, 12, 7, 4, 0, -1, 7]
    ]
  }
}

const FACE_CUE: Record<string, Cue> = {
  pinky: 'rally',
  nandini: 'news',
  baba: 'baba',
  lalaji: 'money',
  chintu: 'chase',
  kisan: 'street',
  mausi: 'family',
  hakim: 'court',
  envoy: 'foreign',
  captain: 'future'
}

export function cueFor(card: { id: string; face: string }): Cue {
  if (card.id.startsWith('oath') || card.id === 'immortal') return 'oath'
  if (card.id === 'convoy' || card.id === 'convoy_later') return 'chase'
  if (card.id === 'the_flip' || card.id === 'copies') return 'future'
  return FACE_CUE[card.face] ?? 'rally'
}

export function arrangement(year: number, roll: number) {
  const r = Number.isFinite(roll) ? Math.min(0.999, Math.max(0, roll)) : 0
  return {
    scale: (Math.abs(year) + Math.floor(r * 997)) % SCALES.length,
    lead: Math.floor(r * 4) % 4,
    root: 43 + ((Math.abs(Math.trunc(year)) + Math.floor(r * 5)) % 8)
  }
}

export function patternErrors(): string[] {
  const errs: string[] = []
  for (const [name, reel] of Object.entries(REELS)) {
    for (const key of ['kick', 'slap', 'hat', 'bass', 'brass'] as const) {
      if (reel[key].length !== 16) errs.push(`${name}.${key} ${reel[key].length}`)
    }
    if (reel.leads.length !== 4) errs.push(`${name}.leads ${reel.leads.length}`)
    reel.leads.forEach((lead, i) => {
      if (lead.length !== 16) errs.push(`${name}.lead${i} ${lead.length}`)
      if (lead.some((n) => n < -1 || n > 14)) errs.push(`${name}.lead${i} range`)
    })
  }
  return errs
}

function midiFreq(root: number, scale: number[], degree: number) {
  const oct = Math.floor(degree / scale.length)
  const semi = scale[((degree % scale.length) + scale.length) % scale.length] + oct * 12
  return 440 * Math.pow(2, (root + semi - 69) / 12)
}

export type Score = {
  start: (year: number, roll: number) => void
  setScene: (scene: Scene) => void
  setMuted: (muted: boolean) => void
  punch: () => void
  sting: (gentle: boolean) => void
  stop: () => void
}

export function createScore(ctx: AudioContext): Score {
  const master = ctx.createGain()
  master.gain.value = 0.58
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2600
  filter.Q.value = 0.6
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -16
  comp.knee.value = 10
  comp.ratio.value = 3.5
  comp.attack.value = 0.004
  comp.release.value = 0.18
  master.connect(filter)
  filter.connect(comp)
  comp.connect(ctx.destination)

  const delay = ctx.createDelay(0.4)
  delay.delayTime.value = 0.17
  const feedback = ctx.createGain()
  feedback.gain.value = 0.26
  const wet = ctx.createGain()
  wet.gain.value = 0
  const send = ctx.createGain()
  send.gain.value = 0.55
  send.connect(delay)
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(wet)
  wet.connect(master)

  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const noiseData = noiseBuf.getChannelData(0)
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1

  let run = arrangement(2026, 0)
  let scene: Scene = { cue: 'oath', year: 2026, later: false, danger: false, janta: 50, khazana: 50 }
  let next = 0
  let step = 0
  let timer = 0
  let running = false
  let ended = false
  let muted = false

  function burst(time: number, dur: number, gain: number, freq: number, type: BiquadFilterType) {
    const src = ctx.createBufferSource()
    src.buffer = noiseBuf
    const g = ctx.createGain()
    const f = ctx.createBiquadFilter()
    f.type = type
    f.frequency.setValueAtTime(Math.max(40, freq), time)
    if (type === 'bandpass') f.Q.value = 0.8
    g.gain.setValueAtTime(Math.max(0.0001, gain), time)
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    src.connect(f)
    f.connect(g)
    g.connect(master)
    src.start(time)
    src.stop(time + dur + 0.02)
  }

  function tone(time: number, freq: number, dur: number, type: OscillatorType, gain: number, bend = 1) {
    if (freq <= 0 || gain <= 0) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq * bend, time)
    if (bend !== 1) o.frequency.exponentialRampToValueAtTime(Math.max(1, freq), time + Math.min(0.07, dur))
    g.gain.setValueAtTime(0.0001, time)
    g.gain.exponentialRampToValueAtTime(gain, time + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    o.connect(g)
    g.connect(master)
    if (type === 'square') g.connect(send)
    o.start(time)
    o.stop(time + dur + 0.03)
  }

  function kick(time: number, vel: number) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(168, time)
    o.frequency.exponentialRampToValueAtTime(46, time + 0.09)
    g.gain.setValueAtTime(0.5 * vel, time)
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16)
    o.connect(g)
    g.connect(master)
    o.start(time)
    o.stop(time + 0.18)
    burst(time, 0.03, 0.07 * vel, 1400, 'highpass')
  }

  function stab(time: number, freq: number, gain: number) {
    for (const mul of [1, 1.5, 2]) tone(time, freq * mul, 0.13, 'square', gain, 1.08)
  }

  function tick() {
    if (!running) return
    if (next < ctx.currentTime - 0.05) next = ctx.currentTime + 0.05
    const horizon = ctx.currentTime + 0.16
    let guard = 0
    while (next < horizon && guard < 8) {
      guard++
      if (step % 16 === 0) armBar()
      const reel = REELS[scene.cue]
      const i = step % 16
      const scale = SCALES[run.scale]
      const bar = Math.floor(step / 16)
      const lead = reel.leads[(run.lead + (bar % 2)) % 4]
      const degree = lead[i]
      if (reel.kick[i] > 0) kick(next, reel.kick[i])
      if (reel.slap[i] > 0) burst(next, 0.05, 0.11 * reel.slap[i], 900, 'bandpass')
      const hat = scene.danger ? Math.min(1, reel.hat[i] + 0.4) : reel.hat[i]
      if (hat > 0) burst(next, 0.03, 0.035 * hat, 6000, 'highpass')
      if (reel.bass[i] >= 0) tone(next, midiFreq(run.root, scale, reel.bass[i]), 0.14, 'square', 0.07)
      if (degree >= 0) {
        const lifted = scene.danger ? Math.min(14, degree + 7) : degree
        const f = midiFreq(run.root + 12, scale, lifted)
        tone(next, f, 0.09, 'square', 0.055, 1.22)
        tone(next, f, 0.16, 'triangle', 0.028)
        if (scene.later && lifted < 8) tone(next, f * 2, 0.07, 'triangle', 0.012)
      }
      if (scene.khazana > 22 && reel.brass[i] > 0) stab(next, midiFreq(run.root + 12, scale, 0), 0.04)
      if (scene.janta >= 78 && (i === 4 || i === 12)) burst(next, 0.14, 0.045, 700, 'bandpass')
      const bpm = reel.bpm * (scene.danger ? 1.08 : 1) + (scene.year % 3)
      next += 60 / bpm / 4
      step++
    }
  }

  function armBar() {
    const reel = REELS[scene.cue]
    const t = next
    wet.gain.setTargetAtTime(scene.later ? 0.22 : 0, t, 0.05)
    filter.frequency.setTargetAtTime(scene.danger || scene.later ? 4800 : 2600, t, 0.08)
    if (reel.drone) {
      const scale = SCALES[run.scale]
      const dur = (60 / reel.bpm) * 0.98
      tone(t, midiFreq(run.root, scale, 0), dur, 'sine', 0.035)
      tone(t, midiFreq(run.root, scale, 4), dur, 'sine', 0.02)
    }
  }

  return {
    start(year, roll) {
      run = arrangement(year, roll)
      scene = {
        cue: 'oath',
        year,
        later: year > 2040,
        danger: false,
        janta: 50,
        khazana: 50
      }
      ended = false
      running = true
      step = 0
      next = ctx.currentTime + 0.06
      if (ctx.state === 'suspended') void ctx.resume()
      if (!timer) timer = globalThis.setInterval(tick, 40) as unknown as number
    },
    setScene(nextScene) {
      scene = nextScene
    },
    setMuted(nextMuted) {
      muted = nextMuted
      master.gain.setTargetAtTime(muted ? 0 : 0.58, ctx.currentTime, 0.03)
    },
    punch() {
      if (muted) return
      kick(ctx.currentTime, 0.55)
    },
    sting(gentle) {
      if (ended) return
      ended = true
      running = false
      const t0 = ctx.currentTime + 0.02
      const scale = SCALES[run.scale]
      const degs = gentle ? [0, 4, 7, 12] : [12, 8, 7, 4, 0]
      degs.forEach((d, i) => {
        tone(t0 + i * 0.15, midiFreq(run.root + 12, scale, d), 0.22, 'square', gentle ? 0.05 : 0.07, 1.1)
      })
      if (!gentle) kick(t0 + degs.length * 0.15, 1)
    },
    stop() {
      running = false
      ended = true
      if (timer) {
        globalThis.clearInterval(timer)
        timer = 0
      }
    }
  }
}
