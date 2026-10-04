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
  composePiece,
} from '../utils/solfeggio-compose.mjs'

const PITCHES = [174, 285, 396, 417, 528, 639, 741, 852, 963]
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const py = path.join(root, 'scripts', 'solfeggio-compose.py')

assert.deepEqual(PITCHES, [174, 285, 396, 417, 528, 639, 741, 852, 963])
assert.equal(CENTER_HZ, 528)
assert.equal(528 / 396, 4 / 3)
assert.equal(852 / 639, 4 / 3)
assert.ok(Math.abs(PIECE_FOURTH_CENTS - 1200 * Math.log2(4 / 3)) < 1e-9)
assert.ok(Math.abs(PIECE_FIFTH_CENTS - 1200 * Math.log2(3 / 2)) < 1e-9)
assert.ok(Math.abs(PIECE_NEAR_FIFTH_CENTS - 1200 * Math.log2(963 / 639)) < 1e-9)
assert.ok(Math.abs(PIECE_NEAR_FIFTH_SHARP_CENTS - (PIECE_NEAR_FIFTH_CENTS - PIECE_FIFTH_CENTS)) < 1e-12)
assert.ok(PIECE_NEAR_FIFTH_SHARP_CENTS > 8 && PIECE_NEAR_FIFTH_SHARP_CENTS < 8.2)


function allowed(hz) {
  for (const pitch of PITCHES) {
    const ratio = hz / pitch
    if (ratio <= 0) continue
    const k = Math.round(Math.log2(ratio))
    if (k >= -1 && k <= 2 && Math.abs(ratio - 2 ** k) < 1e-9) return true
  }
  return false
}

function maxOverlap(events) {
  const points = []
  for (const event of events) {
    const start = Math.round(event.t * 1000)
    const end = Math.round((event.t + event.dur) * 1000)
    points.push([start, 1], [end, -1])
  }
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  let current = 0
  let best = 0
  for (const [, delta] of points) {
    current += delta
    if (current > best) best = current
  }
  return best
}

function countSpan(hay, needle) {
  let found = 0
  for (let i = 0; i + needle.length <= hay.length; i++) {
    let ok = true
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) ok = false
    }
    if (ok) found += 1
  }
  return found
}

function check(piece) {
  assert.ok(piece.duration >= 90 && piece.duration <= 140, `duration ${piece.duration}`)
  assert.ok(maxOverlap(piece.events) >= 3, 'need at least three notes at once')
  assert.ok(piece.motif.length >= 4 && piece.motif.length <= 6)
  const melody = piece.events.filter((event) => event.voice === 'melody')
  const hz = melody.map((event) => event.hz)
  assert.ok(countSpan(hz, piece.motif) >= 2, 'motif should return')
  assert.equal(hz[hz.length - 1], piece.centerHz)
  assert.equal(piece.centerHz, 528)
  assert.ok(new Set(melody.map((event) => event.dur)).size >= 3, 'melody lengths')
  let rests = 0
  for (let i = 1; i < melody.length; i++) {
    if (melody[i].t > melody[i - 1].t + melody[i - 1].dur + 0.02) rests += 1
  }
  assert.ok(rests >= 3, 'rests')
  assert.deepEqual(piece.sections.map((section) => section.name), [
    'intro', 'A', 'B', 'return', 'cadence', 'fade',
  ])
  let cursor = 0
  for (const section of piece.sections) {
    assert.ok(Math.abs(section.t - cursor) < 1e-9)
    cursor += section.dur
  }
  assert.ok(Math.abs(cursor - piece.duration) < 1e-9)
  for (const event of piece.events) {
    assert.ok(allowed(event.hz), `hz ${event.hz}`)
    assert.ok(event.gain > 0)
    assert.ok(event.dur > 0)
  }
  const intro = piece.sections[0]
  for (const event of piece.events) {
    if (event.t >= intro.t && event.t < intro.t + intro.dur) {
      assert.ok(event.voice === 'foundation' || event.voice === 'pulse')
    }
  }
  for (const name of ['A', 'return']) {
    const section = piece.sections.find((item) => item.name === name)
    const chord = new Set(
      piece.events
        .filter((event) => event.voice === 'chord' && event.t >= section.t && event.t < section.t + section.dur)
        .map((event) => event.hz),
    )
    assert.ok(chord.has(396) && chord.has(528), `${name} chord`)
  }
  const b = piece.sections.find((item) => item.name === 'B')
  const bChord = new Set(
    piece.events
      .filter((event) => event.voice === 'chord' && event.t >= b.t && event.t < b.t + b.dur)
      .map((event) => event.hz),
  )
  assert.ok(bChord.has(639) && bChord.has(852))
  const bMelody = new Set(
    melody.filter((event) => event.t >= b.t && event.t < b.t + b.dur).map((event) => event.hz),
  )
  assert.ok(bMelody.has(741) && bMelody.has(963))
  const ending = piece.events.filter((event) => event.t <= piece.duration - 0.05 && event.t + event.dur > piece.duration - 0.05)
  assert.ok(ending.some((event) => event.hz === 528))
  assert.ok(piece.foundationHz === 174 || piece.foundationHz === 285)
  assert.ok(piece.pulseMs >= 1200 && piece.pulseMs <= 1600)
}

for (let seed = 0; seed < 48; seed++) {
  const piece = composePiece(seed)
  assert.deepEqual(piece, composePiece(seed))
  check(piece)
}
assert.notDeepEqual(composePiece(1).events, composePiece(2).events)

const seeds = [0, 1, 7, 42, 99, 255, 1000, 4294967295]
const batch = spawnSync('python3', [py, '--batch', seeds.join(',')], { encoding: 'utf8' })
assert.equal(batch.status, 0, batch.stderr)
const fromPython = JSON.parse(batch.stdout)
for (let i = 0; i < seeds.length; i++) {
  assert.deepEqual(composePiece(seeds[i]), fromPython[i])
}

const emitted = path.join(tmpdir(), 'solfeggio-compose.emitted.mjs')
const emit = spawnSync('python3', [py, '--emit', emitted], { encoding: 'utf8' })
assert.equal(emit.status, 0, emit.stderr)
const committed = readFileSync(path.join(root, 'utils', 'solfeggio-compose.mjs'), 'utf8')
assert.equal(readFileSync(emitted, 'utf8'), committed)

const sample = composePiece(7)
const example = path.join(tmpdir(), 'solfeggio-piece.json')
writeFileSync('/tmp/solfeggio-piece.json', JSON.stringify(sample))
writeFileSync(example, JSON.stringify(sample))
console.log('solfeggio-compose: pass')
console.log(`fourth ${PIECE_FOURTH_CENTS} cents, near fifth sharp ${PIECE_NEAR_FIFTH_SHARP_CENTS}`)
console.log(`seed 7 duration ${sample.duration}s overlap ${maxOverlap(sample.events)} motif ${sample.motif.join(' ')}`)
for (const section of sample.sections) {
  console.log(`  ${section.name} t=${section.t} dur=${section.dur}`)
}
