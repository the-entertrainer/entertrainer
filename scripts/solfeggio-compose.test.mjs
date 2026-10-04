import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CENTER_HZ,
  PIECE_FOURTH_CENTS,
  PIECE_FIFTH_CENTS,
  PIECE_NEAR_FIFTH_CENTS,
  PIECE_NEAR_FIFTH_SHARP_CENTS,
  ENGINE_LOSS_START,
  ENGINE_LOSS_END,
  ENGINE_PARAMS,
  ENGINE_H,
  ENGINE_REST,
  ENGINE_START,
  composeSong,
  gruStep,
  tokenWeights,
} from '../utils/solfeggio-compose.mjs'

const PITCHES = [174, 285, 396, 417, 528, 639, 741, 852, 963]
const LEAD = [528, 570, 639, 741, 792, 834, 852, 963, 1056]
const REST = ENGINE_REST
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const py = path.join(root, 'scripts', 'solfeggio-compose.py')

assert.equal(CENTER_HZ, 528)
assert.equal(528 / 396, 4 / 3)
assert.equal(852 / 639, 4 / 3)
assert.ok(Math.abs(PIECE_FOURTH_CENTS - 1200 * Math.log2(4 / 3)) < 1e-9)
assert.ok(Math.abs(PIECE_FIFTH_CENTS - 1200 * Math.log2(3 / 2)) < 1e-9)
assert.ok(Math.abs(PIECE_NEAR_FIFTH_CENTS - 1200 * Math.log2(963 / 639)) < 1e-9)
assert.ok(Math.abs(PIECE_NEAR_FIFTH_SHARP_CENTS - (PIECE_NEAR_FIFTH_CENTS - PIECE_FIFTH_CENTS)) < 1e-12)
assert.ok(PIECE_NEAR_FIFTH_SHARP_CENTS > 8 && PIECE_NEAR_FIFTH_SHARP_CENTS < 8.2)
assert.ok(ENGINE_LOSS_END < ENGINE_LOSS_START * 0.5, `loss ${ENGINE_LOSS_START} -> ${ENGINE_LOSS_END}`)
assert.equal(ENGINE_PARAMS, 3402)
assert.equal(ENGINE_H, 24)

function makeRng(seed) {
  let a = seed >>> 0
  return {
    below(n) {
      a = (a + 0x6D2B79F5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) % n
    },
  }
}

function sampleMotif(rng) {
  let last = [0, 0, 0, 0, 0, 0, 0, 0]
  for (let attempt = 0; attempt < 6; attempt++) {
    let h = Array(ENGINE_H).fill(0)
    let x = ENGINE_START
    const toks = []
    for (let step = 0; step < 8; step++) {
      const out = gruStep(h, x)
      h = out.h
      const weights = tokenWeights(out.logits)
      const total = weights.reduce((sum, w) => sum + w, 0)
      const u = rng.below(total)
      let acc = 0
      let tok = weights.length - 1
      for (let i = 0; i < weights.length; i++) {
        acc += weights[i]
        if (u < acc) {
          tok = i
          break
        }
      }
      toks.push(tok)
      x = tok
    }
    last = toks
    if (toks.filter((t) => t !== REST).length >= 3) return toks
  }
  return last
}

function networkMotifs(seed) {
  const rng = makeRng(seed >>> 0)
  const bpm = 78 + rng.below(23)
  const pocketI = rng.below(2)
  return {
    bpm,
    pocket: pocketI === 0 ? 'boom-bap' : 'half-time',
    motifs: [sampleMotif(rng), sampleMotif(rng), sampleMotif(rng)],
  }
}

function seqUp(toks) {
  return toks.map((t) => (t === REST ? REST : Math.min(8, t + 1)))
}
function seqDown(toks) {
  return toks.map((t) => (t === REST ? REST : Math.max(0, t - 1)))
}
function invertMotif(toks) {
  return toks.map((t) => (t === REST ? REST : 8 - t))
}
function fragment(toks) {
  return toks.slice(0, 4).concat([REST, REST, REST, REST])
}
function chorusBars(motif) {
  const hook = [motif.slice(), seqUp(motif), motif.slice(), seqUp(motif)]
  return hook.concat(hook)
}
function verse1Bars(motif) {
  const inv = invertMotif(motif)
  return [motif.slice(), inv, motif.slice(), seqUp(motif), inv, seqUp(inv), motif.slice(), inv]
}
function verse2Bars(motif) {
  const frag = fragment(motif)
  const inv = invertMotif(motif)
  return [motif.slice(), seqUp(motif), inv, motif.slice(), frag, seqUp(frag), inv, motif.slice()]
}
function bridgeBars(motif) {
  const frag = fragment(motif)
  return [frag, seqUp(frag), frag, invertMotif(frag), frag, seqUp(frag), invertMotif(frag), frag]
}

function allowed(hz) {
  for (const pitch of PITCHES) {
    const ratio = hz / pitch
    if (ratio <= 0) continue
    const k = Math.round(Math.log2(ratio))
    if (k >= -4 && k <= 4 && Math.abs(ratio - 2 ** k) < 1e-6) return true
  }
  return false
}

function isCenter(hz) {
  const ratio = hz / 528
  if (ratio <= 0) return false
  const k = Math.round(Math.log2(ratio))
  return k >= -4 && k <= 4 && Math.abs(ratio - 2 ** k) < 1e-6
}

function onGrid(value) {
  return Math.abs(value * 4 - Math.round(value * 4)) < 1e-9
}

function startBeat(event) {
  return event.bar * 4 + event.beat
}

function leadGrid(song, section) {
  const grid = Array(section.bars * 8).fill(REST)
  for (const event of song.events) {
    if (event.voice !== 'lead') continue
    if (event.bar < section.bar || event.bar >= section.bar + section.bars) continue
    const start = (event.bar - section.bar) * 8 + Math.round(event.beat * 2)
    const steps = Math.round(event.durBeats * 2)
    const deg = LEAD.indexOf(event.hz)
    for (let s = 0; s < steps; s++) grid[start + s] = deg
  }
  return grid
}

function flat(rows) {
  return rows.flat()
}

function rel(song, section, voices) {
  return song.events
    .filter((event) => voices.includes(event.voice) && event.bar >= section.bar && event.bar < section.bar + section.bars)
    .map((event) => [event.bar - section.bar, event.beat, event.durBeats, event.hz, event.voice, event.gain])
}

function check(song) {
  assert.equal(song.meter, '4/4')
  assert.ok(song.bpm >= 78 && song.bpm <= 100, `bpm ${song.bpm}`)
  assert.equal(song.totalBars, 56)
  assert.ok(Math.abs(song.duration - song.totalBars * 4 * 60 / song.bpm) < 1e-9)
  assert.deepEqual(song.sections.map((section) => section.name), [
    'intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro',
  ])
  assert.deepEqual(song.sections.map((section) => section.bars), [4, 8, 8, 8, 8, 8, 8, 4])
  const drawn = networkMotifs(song.seed)
  assert.equal(song.bpm, drawn.bpm)
  assert.equal(song.pocket, drawn.pocket)
  assert.deepEqual(song.motifs, drawn.motifs)
  const chorus = leadGrid(song, song.sections[2])
  const hook = flat(chorusBars(song.motifs[0]))
  assert.deepEqual(chorus, hook, 'chorus is not a transformation of the network motif')
  assert.deepEqual(leadGrid(song, song.sections[4]), chorus)
  assert.deepEqual(leadGrid(song, song.sections[6]), chorus)
  assert.deepEqual(leadGrid(song, song.sections[1]), flat(verse1Bars(song.motifs[1])))
  assert.deepEqual(leadGrid(song, song.sections[3]), flat(verse2Bars(song.motifs[2])))
  assert.deepEqual(leadGrid(song, song.sections[5]), flat(bridgeBars(song.motifs[0])))
  const bars = []
  for (let i = 0; i < 8; i++) bars.push(chorus.slice(i * 8, (i + 1) * 8))
  assert.deepEqual(bars[0], song.motifs[0])
  assert.deepEqual(bars[1], seqUp(song.motifs[0]))
  assert.deepEqual(bars[2], song.motifs[0])
  assert.deepEqual(bars.slice(4), bars.slice(0, 4))
  const drums = ['kick', 'snare', 'hat', 'openhat']
  const verses = song.sections.filter((section) => section.name === 'verse')
  const choruses = song.sections.filter((section) => section.name === 'chorus')
  assert.deepEqual(rel(song, verses[0], drums), rel(song, verses[1], drums))
  const whole = drums.concat(['bass', 'chord', 'lead'])
  assert.deepEqual(rel(song, choruses[1], whole), rel(song, choruses[0], whole))
  assert.deepEqual(rel(song, choruses[2], whole), rel(song, choruses[0], whole))
  const bridge = song.sections[5]
  assert.equal(song.events.filter((event) => drums.includes(event.voice) && event.bar >= bridge.bar && event.bar < bridge.bar + bridge.bars).length, 0)
  for (const event of song.events) {
    assert.ok(allowed(event.hz), `hz ${event.hz}`)
    assert.ok(onGrid(event.beat) && onGrid(event.durBeats))
    if (event.voice === 'lead') assert.ok(LEAD.includes(event.hz))
    if (event.voice === 'bass') assert.ok(event.beat === 0 || event.beat === 2)
  }
  const leads = song.events.filter((event) => event.voice === 'lead').sort((a, b) => startBeat(a) - startBeat(b))
  for (let i = 1; i < leads.length; i++) {
    const ratio = Math.max(leads[i].hz, leads[i - 1].hz) / Math.min(leads[i].hz, leads[i - 1].hz)
    assert.ok(ratio <= 2 + 1e-9, `leap ${ratio}`)
  }
  const last = leads.reduce((best, event) => (
    startBeat(event) + event.durBeats > startBeat(best) + best.durBeats ? event : best
  ))
  assert.ok(last.hz === 528 || last.hz === 1056, `ending ${last.hz}`)
  const totalBeats = song.totalBars * 4
  const ending = song.events.filter((event) => startBeat(event) < totalBeats && startBeat(event) + event.durBeats >= totalBeats - 1e-9)
  assert.ok(ending.some((event) => isCenter(event.hz)))
  const outro = leadGrid(song, song.sections[7])
  assert.deepEqual(outro.slice(-8), [0, 0, 0, 0, 0, 0, 0, 0])
  // Opening distribution is peaked: this is a trained net, not a flat coin flip.
  const cold = gruStep(Array(ENGINE_H).fill(0), ENGINE_START)
  const weights = tokenWeights(cold.logits)
  assert.ok(Math.max(...weights) > Math.min(...weights) * 2)
}

for (let seed = 0; seed < 12; seed++) {
  const song = composeSong(seed)
  assert.deepEqual(song, composeSong(seed))
  check(song)
}
assert.notDeepEqual(composeSong(1).motifs, composeSong(2).motifs)

const seeds = [0, 1, 7, 42, 99, 255, 1000, 4294967295]
const batch = spawnSync('python3', [py, '--batch', seeds.join(',')], { encoding: 'utf8' })
assert.equal(batch.status, 0, batch.stderr)
const fromPython = JSON.parse(batch.stdout)
for (let i = 0; i < seeds.length; i++) {
  assert.deepEqual(composeSong(seeds[i]), fromPython[i])
}

const emitted = path.join(tmpdir(), 'solfeggio-compose.emitted.mjs')
const emit = spawnSync('python3', [py, '--emit', emitted], { encoding: 'utf8' })
assert.equal(emit.status, 0, emit.stderr)
const committed = readFileSync(path.join(root, 'utils', 'solfeggio-compose.mjs'), 'utf8')
assert.equal(readFileSync(emitted, 'utf8'), committed)

const checked = spawnSync('python3', [py, '--check'], { encoding: 'utf8' })
assert.equal(checked.status, 0, checked.stderr || checked.stdout)

const sample = composeSong(1)
writeFileSync('/tmp/solfeggio-song.json', JSON.stringify(sample))
console.log('solfeggio-compose: pass')
console.log(`seed 1 bpm ${sample.bpm} pocket ${sample.pocket} bars ${sample.totalBars} duration ${sample.duration}s`)
console.log(`loss ${ENGINE_LOSS_START} -> ${ENGINE_LOSS_END} params ${ENGINE_PARAMS}`)
console.log(`motifs ${JSON.stringify(sample.motifs)}`)
console.log(`chorus ${leadGrid(sample, sample.sections[2]).join(' ')}`)
