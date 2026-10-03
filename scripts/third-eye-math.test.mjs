import assert from 'node:assert/strict'
import {
  BREATH_IN_MS,
  BREATH_OUT_MS,
  CYCLES,
  HOLD_CAP_MS,
  IGNITION_LEFT,
  IGNITION_RIGHT,
  THETA_LEFT,
  THETA_RIGHT,
  STROBE_FRAME_MS,
  breathPhase,
  strobeOn,
  frameCanSampleStrobe,
} from '../utils/third-eye-math.mjs'

const cycle = BREATH_IN_MS + BREATH_OUT_MS
assert.equal(cycle, 10000)
assert.equal(CYCLES, 12)
assert.equal(HOLD_CAP_MS, 40000)
assert.equal(IGNITION_LEFT, 963)
assert.equal(IGNITION_RIGHT, 1003)
assert.equal(THETA_LEFT, 100)
assert.equal(THETA_RIGHT, 106)
assert.equal(STROBE_FRAME_MS, 10.5)

assert.deepEqual(breathPhase(0), { index: 0, inhale: true, done: false })
assert.deepEqual(breathPhase(3999), { index: 0, inhale: true, done: false })
assert.deepEqual(breathPhase(4000), { index: 0, inhale: false, done: false })
assert.deepEqual(breathPhase(9999), { index: 0, inhale: false, done: false })
assert.deepEqual(breathPhase(10000), { index: 1, inhale: true, done: false })

assert.equal(breathPhase(110000).index, 11)
assert.equal(breathPhase(110000).inhale, true)
assert.equal(breathPhase(110000).done, false)
assert.equal(breathPhase(114000).inhale, false)
assert.equal(breathPhase(119999).index, 11)
assert.equal(breathPhase(119999).done, false)
assert.deepEqual(breathPhase(120000), { index: 11, inhale: false, done: true })
assert.equal(breathPhase(130000).done, true)
assert.equal(breathPhase(130000).index, 11)

assert.equal(strobeOn(0), true)
assert.equal(strobeOn(0.0125), false)
assert.equal(strobeOn(0.025), true)
assert.equal(strobeOn(1.000), true)
assert.equal(strobeOn(0.012499), true)
assert.equal(strobeOn(0.02), false)

let prev = false
let edges = 0
const steps = 40000
for (let i = 0; i < steps; i++) {
  const t = i / steps
  const on = strobeOn(t)
  if (on && !prev) edges += 1
  prev = on
}
assert.equal(edges, 40)

assert.equal(frameCanSampleStrobe(8), true)
assert.equal(frameCanSampleStrobe(10.5), true)
assert.equal(frameCanSampleStrobe(10.51), false)
assert.equal(frameCanSampleStrobe(16.7), false)

console.log('third-eye-math: pass')
console.log(`cycle ${cycle} ms, 40 Hz on-edges in 1s: ${edges}`)
