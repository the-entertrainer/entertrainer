import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CENTER_HZ,
  PIECE_FOURTH_CENTS,
  PIECE_FIFTH_CENTS,
  PIECE_NEAR_FIFTH_CENTS,
  PIECE_NEAR_FIFTH_SHARP_CENTS,
  TITLE,
  composeSong,
} from '../utils/solfeggio-compose.mjs'

const PITCHES = [174, 285, 396, 417, 528, 639, 741, 852, 963]
const LEAD = [528, 570, 639, 741, 792, 852, 963, 1056]
const MELODY = ['supersaw', 'sitar']
const DRUMS = ['kick', 'snare', 'hat', '808', 'cowbell', 'tablaBayan', 'tablaDayan', 'mridangam']
const VOICES = [
  'kick', 'snare', 'hat', '808', 'cowbell', 'tablaBayan', 'tablaDayan', 'mridangam',
  'tanpura', 'pad', 'choir', 'bass', 'acid', 'cello', 'piano', 'guitar', 'pluck',
  'oud', 'koto', 'harp', 'supersaw', 'sitar', 'violin', 'veena', 'bansuri', 'dizi',
  'erhu', 'trumpet', 'saxophone', 'clarinet', 'shakuhachi', 'bells',
]
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const py = path.join(root, 'scripts', 'solfeggio-compose.py')

assert.equal(CENTER_HZ, 528)
assert.equal(TITLE, 'Soul of the Universe')
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

function melodyOf(song, section) {
  return song.events
    .filter((event) => MELODY.includes(event.voice) && event.bar >= section.bar && event.bar < section.bar + section.bars)
    .map((event) => [event.bar - section.bar, event.beat, event.durBeats, event.hz, event.voice])
}

function check(song) {
  assert.equal(song.meter, '4/4')
  assert.equal(song.title, 'Soul of the Universe')
  assert.equal(song.pocket, 'backbeat')
  assert.ok(song.bpm >= 78 && song.bpm <= 100)
  assert.equal(song.totalBars, 56)
  assert.ok(Math.abs(song.duration - song.totalBars * 4 * 60 / song.bpm) < 1e-9)
  assert.deepEqual(song.sections.map((section) => section.name), [
    'intro', 'theme', 'chorus', 'theme', 'chorus', 'development', 'chorus', 'coda',
  ])
  assert.deepEqual(song.sections.map((section) => section.bars), [4, 8, 8, 8, 8, 8, 8, 4])
  const voices = new Set(song.events.map((event) => event.voice))
  assert.deepEqual([...voices].sort(), [...VOICES].sort())
  for (const event of song.events) {
    assert.ok(allowed(event.hz), `hz ${event.hz} ${event.voice}`)
    assert.ok(onGrid(event.beat) && onGrid(event.durBeats), `${event.voice} ${event.beat}`)
  }
  const melody = song.events.filter((event) => MELODY.includes(event.voice))
  let steps = 0
  let big = 0
  for (const section of song.sections) {
    assert.equal(section.bars % 4, 0)
    for (let phrase = 0; phrase < section.bars / 4; phrase++) {
      const start = section.bar + phrase * 4
      const notes = melody.filter((event) => event.bar >= start && event.bar < start + 4)
      assert.ok(notes.length >= 4, `phrase ${start}`)
      const last = notes.reduce((best, event) => (
        event.bar + event.beat / 4 + event.durBeats / 4 > best.bar + best.beat / 4 + best.durBeats / 4 ? event : best
      ))
      assert.ok(isCenter(last.hz), `cadence ${start} ${last.hz}`)
      const ordered = notes.slice().sort((a, b) => a.bar - b.bar || a.beat - b.beat || a.hz - b.hz)
      for (let i = 1; i < ordered.length; i++) {
        const prev = LEAD.indexOf(ordered[i - 1].hz)
        const deg = LEAD.indexOf(ordered[i].hz)
        assert.ok(prev >= 0 && deg >= 0)
        const leap = Math.abs(deg - prev) > 1
        const atStart = ordered[i].bar === start && ordered[i].beat === 0
        if (leap) {
          assert.ok(atStart, `leap inside phrase bar ${ordered[i].bar}`)
          big += 1
        } else {
          steps += 1
        }
      }
      const firstHalf = notes.filter((event) => event.bar < start + 2)
      const secondHalf = notes.filter((event) => event.bar >= start + 2)
      assert.ok(firstHalf.length && secondHalf.length, `answer ${start}`)
    }
  }
  assert.ok(steps / (steps + big) > 0.85, `stepwise ${steps} ${big}`)
  const choruses = song.sections.filter((section) => section.name === 'chorus')
  const hook = melodyOf(song, choruses[0])
  assert.deepEqual(melodyOf(song, choruses[1]), hook)
  assert.deepEqual(melodyOf(song, choruses[2]), hook)
  const half = hook.filter((event) => event[0] < 4)
  const rest = hook.filter((event) => event[0] >= 4).map((event) => [event[0] - 4, event[1], event[2], event[3], event[4]])
  assert.deepEqual(rest, half, 'chorus is a repeated 4-bar sentence')
  const theme = song.sections[1]
  const pocket = song.events.filter((event) => event.bar === theme.bar)
  assert.deepEqual(pocket.filter((event) => event.voice === 'kick').map((event) => event.beat), [0, 2])
  assert.deepEqual(pocket.filter((event) => event.voice === '808').map((event) => event.beat), [0, 2])
  assert.deepEqual(pocket.filter((event) => event.voice === 'snare').map((event) => event.beat), [1, 3])
  assert.ok(pocket.some((event) => event.voice === 'hat'))
  assert.ok(pocket.some((event) => event.voice === 'cowbell'))
  const dev = song.sections[5]
  const breath = dev.bar + 2
  assert.equal(song.events.filter((event) => event.bar === breath && DRUMS.includes(event.voice)).length, 0)
  assert.ok(song.events.some((event) => event.bar === breath && event.voice === 'acid'))
  assert.ok(song.events.some((event) => event.bar === breath && event.voice === 'pad'))
  const names = new Set(song.sections.map((section) => section.name))
  for (const name of names) {
    const section = song.sections.find((item) => item.name === name)
    const slice = song.events.filter((event) => event.bar >= section.bar && event.bar < section.bar + section.bars)
    assert.ok(slice.some((event) => event.voice === 'acid'), name)
    assert.ok(slice.some((event) => event.voice === 'bass'), name)
    assert.ok(slice.some((event) => event.voice === 'pad'), name)
    assert.ok(slice.some((event) => event.voice === 'tanpura'), name)
    assert.ok(slice.some((event) => event.voice === 'supersaw'), name)
    assert.ok(slice.some((event) => event.voice === 'sitar'), name)
  }
  const fillBar = theme.bar + 3
  const fillSnares = song.events.filter((event) => event.bar === fillBar && event.voice === 'snare')
  assert.ok(fillSnares.length >= 4, 'phrase-end fill')
  const lastBar = song.events.filter((event) => event.bar === song.totalBars - 1 && MELODY.includes(event.voice))
  assert.ok(lastBar.some((event) => isCenter(event.hz)))
}

for (let seed = 0; seed < 8; seed++) {
  const song = composeSong(seed)
  assert.deepEqual(song, composeSong(seed))
  check(song)
}
assert.notDeepEqual(composeSong(1), composeSong(2))

const seeds = [0, 1, 7, 42, 99, 255, 1000, 4294967295]
const batch = spawnSync('python3', [py, '--batch', seeds.join(',')], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
assert.equal(batch.status, 0, batch.stderr)
const fromPython = JSON.parse(batch.stdout)
for (let i = 0; i < seeds.length; i++) {
  assert.deepEqual(composeSong(seeds[i]), fromPython[i])
}

const emitted = path.join(tmpdir(), 'solfeggio-compose.emitted.mjs')
const emit = spawnSync('python3', [py, '--emit', emitted], { encoding: 'utf8' })
assert.equal(emit.status, 0, emit.stderr)
assert.equal(readFileSync(emitted, 'utf8'), readFileSync(path.join(root, 'utils', 'solfeggio-compose.mjs'), 'utf8'))

const checked = spawnSync('python3', [py, '--check'], { encoding: 'utf8' })
assert.equal(checked.status, 0, checked.stderr || checked.stdout)

const sample = composeSong(1)
console.log('solfeggio-compose: pass')
console.log(`seed 1 bpm ${sample.bpm} variation ${sample.variation} bars ${sample.totalBars} duration ${sample.duration}s`)
console.log(`chorus ${melodyOf(sample, sample.sections[2]).map((event) => event[3]).join(' ')}`)
