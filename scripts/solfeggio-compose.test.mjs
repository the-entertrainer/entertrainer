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
  composeSong,
} from '../utils/solfeggio-compose.mjs'

const PITCHES = [174, 285, 396, 417, 528, 639, 741, 852, 963]
const SCALE = [396, 417, 528, 639, 741, 792, 834, 852, 963, 1056]
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

function allowed(hz) {
  for (const pitch of PITCHES) {
    const ratio = hz / pitch
    if (ratio <= 0) continue
    const k = Math.round(Math.log2(ratio))
    if (k >= -1 && k <= 2 && Math.abs(ratio - 2 ** k) < 1e-9) return true
  }
  return false
}

function isCenter(hz) {
  const ratio = hz / 528
  if (ratio <= 0) return false
  const k = Math.round(Math.log2(ratio))
  return k >= -1 && k <= 2 && Math.abs(ratio - 2 ** k) < 1e-9
}

function isFoundation(hz) {
  for (const pitch of [174, 285]) {
    const ratio = hz / pitch
    if (ratio <= 0) continue
    const k = Math.round(Math.log2(ratio))
    if (k >= -1 && k <= 2 && Math.abs(ratio - 2 ** k) < 1e-9) return true
  }
  return false
}

function onEighth(value) {
  return Math.abs(value * 2 - Math.round(value * 2)) < 1e-9
}

function startBeat(event) {
  return event.bar * 4 + event.beat
}

function maxOverlap(events) {
  const points = []
  for (const event of events) {
    const start = Math.round(startBeat(event) * 2)
    const end = Math.round((startBeat(event) + event.durBeats) * 2)
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

function leadOf(song, section) {
  return song.events
    .filter((event) => event.voice === 'lead' && event.bar >= section.bar && event.bar < section.bar + section.bars)
    .map((event) => [event.bar - section.bar, event.beat, event.durBeats, event.hz])
}

function chordsOf(song, section) {
  return song.events
    .filter((event) => event.voice === 'chord' && event.bar >= section.bar && event.bar < section.bar + section.bars)
    .map((event) => [event.bar - section.bar, event.beat, event.durBeats, event.hz, event.gain])
}

function check(song) {
  assert.equal(song.meter, '4/4')
  assert.ok(song.bpm >= 72 && song.bpm <= 96, `bpm ${song.bpm}`)
  assert.equal(song.bpm, Math.round(song.bpm))
  assert.ok(song.duration >= 150 && song.duration <= 240, `duration ${song.duration}`)
  assert.ok(Math.abs(song.duration - song.totalBars * 4 * 60 / song.bpm) < 1e-9)
  assert.deepEqual(song.sections.map((section) => section.name), [
    'intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro',
  ])
  let cursor = 0
  for (const section of song.sections) {
    assert.equal(section.bar, cursor)
    cursor += section.bars
  }
  assert.equal(cursor, song.totalBars)
  assert.ok(song.sections[0].bars === 4 || song.sections[0].bars === 8)
  assert.ok(song.sections[7].bars === 4 || song.sections[7].bars === 8)
  const voices = new Set(song.events.map((event) => event.voice))
  for (const voice of ['kick', 'snare', 'bass', 'chord', 'lead']) {
    assert.ok(voices.has(voice), voice)
  }
  assert.ok(maxOverlap(song.events) >= 4, 'need four events at once')
  for (const event of song.events) {
    assert.ok(allowed(event.hz), `hz ${event.hz}`)
    assert.ok(event.gain > 0)
    assert.ok(event.beat >= 0 && event.beat < 4)
    assert.ok(event.durBeats > 0 && event.beat + event.durBeats <= 4 + 1e-9)
    assert.ok(onEighth(event.beat) && onEighth(event.durBeats))
    if (event.voice === 'bass') assert.ok(isFoundation(event.hz), `bass ${event.hz}`)
    if (event.voice === 'lead') assert.ok(event.hz >= 396)
  }
  const choruses = song.sections.filter((section) => section.name === 'chorus')
  assert.equal(choruses.length, 3)
  const hook = leadOf(song, choruses[0])
  assert.ok(hook.length >= 4)
  assert.deepEqual(leadOf(song, choruses[1]), hook)
  assert.deepEqual(leadOf(song, choruses[2]), hook)
  assert.ok(hook.some((note) => note[2] >= 2), 'resting note')
  const pitches = hook.map((note) => note[3])
  assert.ok(new Set(pitches).size < pitches.length, 'repetition')
  const verses = song.sections.filter((section) => section.name === 'verse')
  assert.deepEqual(chordsOf(song, verses[0]), chordsOf(song, verses[1]))
  assert.notDeepEqual(leadOf(song, verses[0]), leadOf(song, verses[1]))
  for (let i = 0; i < 2; i++) {
    const verseLead = leadOf(song, verses[i])
    const chorusLead = leadOf(song, choruses[i])
    const from = SCALE.indexOf(verseLead[verseLead.length - 1][3])
    const to = SCALE.indexOf(chorusLead[0][3])
    assert.ok(Math.abs(to - from) >= 4, `leap ${from}->${to}`)
  }
  const leads = song.events.filter((event) => event.voice === 'lead')
  const last = leads.reduce((best, event) => (
    startBeat(event) + event.durBeats > startBeat(best) + best.durBeats ? event : best
  ))
  assert.ok(isCenter(last.hz), `ending ${last.hz}`)
  const totalBeats = song.totalBars * 4
  const ending = song.events.filter((event) => startBeat(event) < totalBeats && startBeat(event) + event.durBeats >= totalBeats - 1e-9)
  assert.ok(ending.some((event) => isCenter(event.hz)))
  const sample = choruses[0].bar + 2
  const kicks = new Set(song.events.filter((event) => event.voice === 'kick' && event.bar === sample).map((event) => event.beat))
  const snares = new Set(song.events.filter((event) => event.voice === 'snare' && event.bar === sample).map((event) => event.beat))
  assert.ok(kicks.has(0) && kicks.has(2))
  assert.ok(snares.has(1) && snares.has(3))
  assert.equal(song.centerHz, 528)
}

for (let seed = 0; seed < 48; seed++) {
  const song = composeSong(seed)
  assert.deepEqual(song, composeSong(seed))
  check(song)
}
assert.notDeepEqual(composeSong(1).events, composeSong(2).events)

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
console.log(`seed 1 bpm ${sample.bpm} bars ${sample.totalBars} duration ${sample.duration}s overlap ${maxOverlap(sample.events)}`)
for (const section of sample.sections) {
  console.log(`  ${section.name} bar=${section.bar} bars=${section.bars}`)
}
const hook = leadOf(sample, sample.sections.find((section) => section.name === 'chorus')).map((note) => note[3])
console.log(`chorus lead ${hook.join(' ')}`)
