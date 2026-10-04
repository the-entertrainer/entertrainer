import assert from 'node:assert/strict'
import {
  PITCHES,
  MIN_GAP_SEC,
  NOTE_LENGTHS,
  MELODY_PITCHES,
  DRONE_PITCHES,
  FOURTH_PAIRS,
  NEAR_FIFTH,
  FOURTH_CENTS,
  FIFTH_CENTS,
  NEAR_FIFTH_CENTS,
  NEAR_FIFTH_SHARP_CENTS,
  cents,
  dronePartners,
  schedulePiece,
  melodyLandingRate,
  minOnsetGap,
} from '../utils/solfeggio-math.mjs'

assert.deepEqual([...PITCHES], [174, 285, 396, 417, 528, 639, 741, 852, 963])
assert.deepEqual([...MELODY_PITCHES], [396, 417, 528, 639, 741, 852, 963])
assert.deepEqual([...DRONE_PITCHES], [174, 285, 198])
assert.equal(198 * 2, 396)
assert.equal(MIN_GAP_SEC, 2)
assert.deepEqual([...NOTE_LENGTHS], [3, 5, 8])

assert.equal(528 / 396, 4 / 3)
assert.equal(852 / 639, 4 / 3)
assert.deepEqual(FOURTH_PAIRS, [
  { lower: 396, upper: 528 },
  { lower: 639, upper: 852 },
])
assert.equal(FOURTH_CENTS, cents(4 / 3))
assert.ok(Math.abs(FOURTH_CENTS - 498.0449991346125) < 1e-9)

assert.deepEqual(NEAR_FIFTH, { lower: 639, upper: 963 })
assert.equal(963 / 639, 1.5070422535211268)
assert.ok(Math.abs(NEAR_FIFTH_CENTS - cents(963 / 639)) < 1e-12)
assert.ok(Math.abs(FIFTH_CENTS - cents(3 / 2)) < 1e-12)
assert.ok(NEAR_FIFTH_SHARP_CENTS > 8 && NEAR_FIFTH_SHARP_CENTS < 8.2)
assert.ok(Math.abs(NEAR_FIFTH_SHARP_CENTS - (NEAR_FIFTH_CENTS - FIFTH_CENTS)) < 1e-12)

const ladder = [417, 528, 639, 741, 852, 963]
const steps = ladder.slice(1).map((hz, i) => hz - ladder[i])
assert.deepEqual(steps, [111, 111, 102, 111, 111])

assert.deepEqual(dronePartners(198), [528])
assert.deepEqual(dronePartners(174), [])
assert.deepEqual(dronePartners(285), [])
assert.deepEqual(dronePartners(396), [528])
assert.deepEqual(dronePartners(639), [852, 963])

const again = schedulePiece(42)
assert.deepEqual(again, schedulePiece(42))
assert.notDeepEqual(again.events, schedulePiece(43).events)
assert.equal(again.seed, 42)

for (let seed = 0; seed < 48; seed++) {
  const piece = schedulePiece(seed)
  assert.equal(piece.seed, seed)
  assert.ok(DRONE_PITCHES.includes(piece.droneHz))
  assert.ok(piece.events.length >= 12)
  assert.ok(minOnsetGap(piece.events) >= MIN_GAP_SEC - 1e-9)
  assert.ok(melodyLandingRate(piece) > 0.5)

  if (piece.droneHz === 198) assert.equal(piece.partnerHz, 528)
  else assert.ok([528, 852, 963].includes(piece.partnerHz))

  let prevMelody = null
  for (let i = 0; i < piece.events.length; i++) {
    const event = piece.events[i]
    if (i > 0) {
      assert.ok(event.t > piece.events[i - 1].t)
      assert.ok(event.t - piece.events[i - 1].t >= MIN_GAP_SEC)
    }
    assert.ok(NOTE_LENGTHS.includes(event.dur))
    if (event.voice === 'drone') {
      assert.equal(event.hz, piece.droneHz)
    } else if (event.voice === 'partner') {
      assert.equal(event.hz, piece.partnerHz)
      assert.ok(PITCHES.includes(event.hz))
    } else if (event.voice === 'melody') {
      assert.ok(event.hz >= 396)
      assert.ok(MELODY_PITCHES.includes(event.hz))
      if (prevMelody && event.hz !== piece.partnerHz) {
        const a = MELODY_PITCHES.indexOf(prevMelody.hz)
        const b = MELODY_PITCHES.indexOf(event.hz)
        assert.ok(Math.abs(a - b) <= 1)
      }
      prevMelody = event
    } else if (event.voice === 'upper') {
      assert.ok(event.hz === 852 || event.hz === 963)
    } else {
      assert.fail(`unknown voice ${event.voice}`)
    }
  }
}

const sample = schedulePiece(7)
console.log('solfeggio-math: pass')
console.log(`fourth ${FOURTH_CENTS} cents`)
console.log(`near fifth ${NEAR_FIFTH_CENTS} cents, ${NEAR_FIFTH_SHARP_CENTS} cents sharp of 3/2`)
console.log(`seed 7 drone ${sample.droneHz} partner ${sample.partnerHz} events ${sample.events.length} min gap ${minOnsetGap(sample.events)} land ${melodyLandingRate(sample).toFixed(3)}`)
