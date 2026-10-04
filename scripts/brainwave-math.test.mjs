import assert from 'node:assert/strict'
import {
  CARRIER_HZ,
  BEAT_MIN,
  BEAT_MAX,
  DEFAULT_BEAT,
  RAMP_FLOOR,
  clampBeat,
  rightFrequency,
  bandLabel,
  safeRamp,
} from '../utils/brainwave-math.mjs'

assert.equal(CARRIER_HZ, 200)
assert.equal(BEAT_MIN, 0.5)
assert.equal(BEAT_MAX, 40)
assert.equal(DEFAULT_BEAT, 10)

assert.equal(clampBeat(10), 10)
assert.equal(clampBeat(10.2), 10)
assert.equal(clampBeat(10.25), 10.5)
assert.equal(clampBeat(10.5), 10.5)
assert.equal(clampBeat(0), 0.5)
assert.equal(clampBeat(0.2), 0.5)
assert.equal(clampBeat(0.24), 0.5)
assert.equal(clampBeat(0.5), 0.5)
assert.equal(clampBeat(40), 40)
assert.equal(clampBeat(40.4), 40)
assert.equal(clampBeat(80), 40)
assert.equal(clampBeat(-4), 0.5)
assert.equal(clampBeat(Number.NaN), 10)
assert.equal(clampBeat('nope'), 10)

for (let i = 0; i <= 80; i++) {
  const raw = i / 2 - 5
  const beat = clampBeat(raw)
  assert.ok(beat >= 0.5 && beat <= 40, `clamped ${raw} -> ${beat}`)
  assert.equal(beat * 2, Math.round(beat * 2), `snap ${beat}`)
}

assert.equal(rightFrequency(10), 210)
assert.equal(rightFrequency(0.5), 200.5)
assert.equal(rightFrequency(40), 240)
assert.equal(rightFrequency(10.2), 210)
assert.equal(rightFrequency(80), 240)
assert.equal(rightFrequency(6, 200), 206)

assert.equal(bandLabel(2), 'delta')
assert.equal(bandLabel(3.5), 'delta')
assert.equal(bandLabel(6), 'theta')
assert.equal(bandLabel(4), 'theta')
assert.equal(bandLabel(7.5), 'theta')
assert.equal(bandLabel(10), 'alpha')
assert.equal(bandLabel(8), 'alpha')
assert.equal(bandLabel(12.5), 'alpha')
assert.equal(bandLabel(20), 'beta')
assert.equal(bandLabel(13), 'beta')
assert.equal(bandLabel(30), 'beta')
assert.equal(bandLabel(40), 'gamma')
assert.equal(bandLabel(30.5), 'gamma')

const samples = [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 0.0001, RAMP_FLOOR, 200, 240, rightFrequency(10)]
for (const value of samples) {
  const target = safeRamp(value)
  assert.ok(target > 0, `ramp of ${value} was ${target}`)
  assert.notEqual(target, 0)
}
assert.equal(safeRamp(0), RAMP_FLOOR)
assert.equal(safeRamp(200), 200)

console.log('brainwave-math: pass')
