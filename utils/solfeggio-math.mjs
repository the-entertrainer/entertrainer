/**
 * Solfeggio pitches, the real consonances in that list, and a seeded scheduler.
 * No Web Audio here. Healing labels are intentionally absent.
 *
 * 417–963 is not a uniform +111 Hz ladder: 741 - 639 = 102.
 * The consonances the scheduler uses are the two exact 4/3 fourths
 * (528/396 and 852/639) and the near fifth 963/639.
 */

export const PITCHES = Object.freeze([174, 285, 396, 417, 528, 639, 741, 852, 963])
export const MIN_GAP_SEC = 2
export const NOTE_LENGTHS = Object.freeze([3, 5, 8])
export const MELODY_PITCHES = Object.freeze(PITCHES.filter((hz) => hz >= 396))
/** 198 is 396/2, a low drone under the set, not an extra "solfeggio" pitch. */
export const DRONE_PITCHES = Object.freeze([174, 285, 198])

export const FOURTH_PAIRS = Object.freeze([
  Object.freeze({ lower: 396, upper: 528 }),
  Object.freeze({ lower: 639, upper: 852 }),
])

export const NEAR_FIFTH = Object.freeze({ lower: 639, upper: 963 })

/** @param {number} ratio */
export function cents(ratio) {
  return 1200 * Math.log2(ratio)
}

export const FOURTH_CENTS = cents(4 / 3)
export const FIFTH_CENTS = cents(3 / 2)
export const NEAR_FIFTH_CENTS = cents(963 / 639)
export const NEAR_FIFTH_SHARP_CENTS = NEAR_FIFTH_CENTS - FIFTH_CENTS

/**
 * Upper pitches a just fourth, or the near fifth, above hz.
 * Octave doubles are not treated as this partner.
 * @param {number} hz
 * @returns {number[]}
 */
export function partnersAbove(hz) {
  const found = []
  for (const pair of FOURTH_PAIRS) {
    if (pair.lower === hz) found.push(pair.upper)
  }
  if (NEAR_FIFTH.lower === hz) found.push(NEAR_FIFTH.upper)
  return found
}

/**
 * Consonant partners of a drone. 174 and 285 have none in the set.
 * 198 (396/2) borrows the fourth above its octave, which is 528.
 * @param {number} droneHz
 * @returns {number[]}
 */
export function dronePartners(droneHz) {
  const direct = partnersAbove(droneHz)
  if (direct.length) return direct
  return partnersAbove(droneHz * 2)
}

/** @param {number} seed */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function rand() {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * @param {() => number} rand
 * @param {readonly number[]} list
 */
function pick(rand, list) {
  return list[Math.floor(rand() * list.length)]
}

const GAP_TABLE = Object.freeze([3, 3, 5, 5, 5, 8, 8, 2])
const COLOR_PARTNERS = Object.freeze([528, 852, 963])

/**
 * @param {number} seed
 * @returns {{
 *   seed: number,
 *   droneHz: number,
 *   partnerHz: number,
 *   events: { t: number, dur: number, voice: 'drone' | 'partner' | 'melody' | 'upper', hz: number }[],
 * }}
 */
export function schedulePiece(seed) {
  const seed32 = seed >>> 0
  const rand = mulberry32(seed32)
  const droneHz = pick(rand, DRONE_PITCHES)
  const acoustic = dronePartners(droneHz)
  const partnerHz = acoustic.length ? acoustic[0] : pick(rand, COLOR_PARTNERS)

  /** @type {{ t: number, dur: number, voice: 'drone' | 'partner' | 'melody' | 'upper', hz: number }[]} */
  const events = []
  const end = 132 + Math.floor(rand() * 37)
  let t = 0
  let melodyIndex = 0
  let sinceMelody = 0
  let i = 0

  while (t < end && i < 96) {
    /** @type {'drone' | 'partner' | 'melody' | 'upper'} */
    let voice
    let hz
    /** @type {number} */
    let dur

    if (i % 6 === 0) {
      voice = 'drone'
      hz = droneHz
      dur = 8
    } else if (i % 6 === 3) {
      voice = 'partner'
      hz = partnerHz
      dur = rand() < 0.5 ? 5 : 8
    } else if (sinceMelody >= 10 && rand() < 0.55) {
      voice = 'upper'
      hz = rand() < 0.7 ? 963 : 852
      dur = 5
      sinceMelody = 0
    } else {
      voice = 'melody'
      sinceMelody += 1
      const melodySoFar = events.reduce((n, event) => n + (event.voice === 'melody' ? 1 : 0), 0)
      const land = melodySoFar % 4 !== 3
      if (land) {
        hz = partnerHz
        const idx = MELODY_PITCHES.indexOf(hz)
        if (idx >= 0) melodyIndex = idx
      } else {
        const roll = rand()
        const step = roll < 0.25 ? -1 : roll < 0.5 ? 0 : 1
        melodyIndex = Math.min(MELODY_PITCHES.length - 1, Math.max(0, melodyIndex + step))
        hz = MELODY_PITCHES[melodyIndex]
      }
      dur = pick(rand, NOTE_LENGTHS)
    }

    events.push({ t, dur, voice, hz })
    t += pick(rand, GAP_TABLE)
    i += 1
  }

  return { seed: seed32, droneHz, partnerHz, events }
}

/** @param {{ partnerHz: number, events: { voice: string, hz: number }[] }} piece */
export function melodyLandingRate(piece) {
  const notes = piece.events.filter((event) => event.voice === 'melody')
  if (!notes.length) return 1
  const hits = notes.filter((event) => event.hz === piece.partnerHz).length
  return hits / notes.length
}

/** @param {{ t: number }[]} events */
export function minOnsetGap(events) {
  let min = Infinity
  for (let i = 1; i < events.length; i++) {
    min = Math.min(min, events[i].t - events[i - 1].t)
  }
  return min
}
