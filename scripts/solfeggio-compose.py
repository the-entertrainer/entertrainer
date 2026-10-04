#!/usr/bin/env python3
"""Seeded Solfeggio piece. Python is the numeric source of truth.

Running this file rewrites utils/solfeggio-compose.mjs. The page imports that
module. Do not edit the .mjs by hand.

The nine pitches are a modern numerological list, not a tuning system and not
a therapy. 528 is the tonal center because 528/396 is exactly 4/3. 852/639 is
the other exact fourth. 963/639 sits a few cents sharp of 3/2, so 963 is a
color tone. 741 is only a short passing tone. 174 and 285 are the low
foundation, never a melody note.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

PITCHES = [174, 285, 396, 417, 528, 639, 741, 852, 963]
CENTER = 528
PULSE_MS = [1200, 1280, 1360, 1440, 1520, 1600]

# (hz, length in quarter-pulses, rest in quarter-pulses). Lengths differ.
# Home motifs stay on the 396–528 fourth, with 417 as the neighbor and an
# occasional reach to 639. Every motif ends on the center.
MOTIFS = [
    [(396, 4, 1), (417, 2, 2), (528, 6, 0), (396, 4, 2), (528, 8, 0)],
    [(417, 3, 1), (396, 4, 2), (528, 6, 1), (639, 3, 2), (417, 2, 1), (528, 8, 0)],
    [(396, 6, 2), (528, 4, 1), (417, 3, 2), (528, 8, 0)],
    [(528, 4, 1), (417, 2, 1), (396, 4, 2), (417, 3, 1), (528, 8, 0)],
    [(396, 4, 2), (417, 2, 1), (396, 3, 2), (417, 4, 1), (528, 8, 0)],
]

# Answering phrases inside A. Not the motif, so the motif stays a repeated span.
VARIATIONS = [
    [(417, 3, 2), (396, 4, 1), (639, 3, 2), (528, 8, 0)],
    [(417, 2, 2), (528, 4, 1), (396, 4, 2), (528, 6, 0)],
    [(396, 4, 1), (417, 2, 2), (639, 3, 2), (528, 8, 0)],
]

# B moves to the other fourth. 741 passes between 639 and 852. 963 is short.
B_PHRASES = [
    [(639, 4, 1), (741, 2, 1), (852, 6, 2), (963, 3, 2), (852, 4, 1), (639, 8, 0)],
    [(852, 4, 1), (741, 2, 1), (639, 4, 2), (741, 2, 1), (852, 6, 2), (963, 3, 1), (852, 8, 0)],
    [(639, 6, 2), (741, 2, 1), (852, 4, 2), (963, 3, 2), (741, 2, 1), (852, 8, 0)],
]

CADENCES = [
    [(417, 3, 2), (396, 4, 3), (528, 12, 0)],
    [(396, 4, 2), (417, 3, 2), (528, 14, 0)],
    [(417, 2, 2), (396, 3, 3), (417, 3, 2), (528, 12, 0)],
]

GAINS = {
    "foundation": 400,
    "chordLow": 200,
    "chordHigh": 160,
    "chordOct": 120,
    "melody": 340,
    "pulse": 150,
    "fadeFoundation": 220,
    "fadeCenter": 170,
    "cadenceLow": 180,
    "cadenceHigh": 240,
}

ROOT = Path(__file__).resolve().parents[1]
MJS_PATH = ROOT / "utils" / "solfeggio-compose.mjs"


def to_i32(x: int) -> int:
    x &= 0xFFFFFFFF
    if x >= 0x80000000:
        x -= 0x100000000
    return x


def to_u32(x: int) -> int:
    return x & 0xFFFFFFFF


def imul(a: int, b: int) -> int:
    return to_i32(to_i32(a) * to_i32(b))


class Rng:
    """Same integer stream as the generated module's mulberry32."""

    def __init__(self, seed: int) -> None:
        self.a = seed & 0xFFFFFFFF

    def next_u32(self) -> int:
        self.a = to_i32(self.a + 0x6D2B79F5)
        ua = to_u32(self.a)
        t = imul(ua ^ (ua >> 15), to_u32(1 | self.a))
        ut = to_u32(t)
        prod = imul(ut ^ (ut >> 7), to_u32(61 | t))
        summed = to_i32(t + prod)
        t2 = to_u32(summed) ^ to_u32(t)
        ut2 = to_u32(t2)
        return to_u32(ut2 ^ (ut2 >> 14))

    def below(self, n: int) -> int:
        return self.next_u32() % n


def cents(ratio: float) -> float:
    return 1200 * math.log2(ratio)


def phrase_ms(phrase, step: int) -> int:
    total = 0
    for _hz, steps, rest in phrase:
        total += (steps + rest) * step
    return total


def decorate(phrase, lift: bool):
    out = []
    for hz, steps, rest in phrase:
        if lift and hz == 528:
            hz = 1056
        out.append((hz, steps, rest))
    return out


def tick_on(i: int, pattern: int) -> bool:
    if pattern == 0:
        return (i % 4) != 3
    if pattern == 1:
        return (i % 5) != 4
    return (i % 4) == 0 or (i % 4) == 2


def oct_down(hz: int):
    v = hz / 2
    return int(v) if float(v).is_integer() else v


def compose_piece(seed: int) -> dict:
    seed = seed & 0xFFFFFFFF
    rng = Rng(seed)
    # Random draws stay in this order. The generated JS must match it.
    pulse = PULSE_MS[rng.below(len(PULSE_MS))]
    foundation = 174 if rng.below(2) == 0 else 285
    motif = decorate(MOTIFS[rng.below(len(MOTIFS))], rng.below(2) == 1)
    variation = VARIATIONS[rng.below(len(VARIATIONS))]
    b_phrase = B_PHRASES[rng.below(len(B_PHRASES))]
    cadence = CADENCES[rng.below(len(CADENCES))]
    pattern = rng.below(3)
    intro_ms = (8 + rng.below(4)) * pulse
    a_gap = (2 + rng.below(2)) * pulse
    fade_pulses = 6 + rng.below(3)
    target = 104000 + rng.below(21000)

    step = pulse // 4
    a_lead = pulse
    a_tail = 2 * pulse
    a_ms = a_lead + phrase_ms(motif, step) + a_gap + phrase_ms(variation, step) + a_tail
    b_lead = pulse
    b_tail = 2 * pulse
    b_ms = b_lead + phrase_ms(b_phrase, step) + b_tail
    r_lead = pulse
    r_tail = 2 * pulse
    r_ms = r_lead + phrase_ms(motif, step) + r_tail
    c_tail = pulse
    c_ms = phrase_ms(cadence, step) + c_tail
    f_ms = fade_pulses * pulse
    total_ms = intro_ms + a_ms + b_ms + r_ms + c_ms + f_ms

    guard = 0
    while total_ms < target and total_ms + pulse <= 136000 and guard < 80:
        which = guard % 5
        if which == 0:
            intro_ms += pulse
        elif which == 1:
            a_gap += pulse
            a_ms += pulse
        elif which == 2:
            b_tail += pulse
            b_ms += pulse
        elif which == 3:
            r_tail += pulse
            r_ms += pulse
        else:
            f_ms += pulse
        total_ms += pulse
        guard += 1

    specs = [
        ("intro", intro_ms),
        ("A", a_ms),
        ("B", b_ms),
        ("return", r_ms),
        ("cadence", c_ms),
        ("fade", f_ms),
    ]
    sections = []
    sec = {}
    cursor = 0
    for name, dur in specs:
        sections.append({"name": name, "t": cursor, "dur": dur})
        sec[name] = (cursor, cursor + dur)
        cursor += dur
    duration_ms = cursor

    events = []

    def add(t: int, dur: int, hz, voice: str, milli: int) -> None:
        if dur < 50 or t < 0 or t >= duration_ms:
            return
        if t + dur > duration_ms:
            dur = duration_ms - t
        if dur < 50:
            return
        if isinstance(hz, float) and hz.is_integer():
            hz = int(hz)
        events.append({
            "t": int(t),
            "dur": int(dur),
            "hz": hz,
            "voice": voice,
            "gain": int(milli),
        })

    def lay_bed(t0: int, t1: int, hz, voice: str, milli: int, hold: int, overlap: int) -> None:
        if t1 - t0 < 80:
            return
        t = t0
        while t < t1:
            dur = hold if t + hold <= t1 else t1 - t
            if dur >= 50:
                add(t, dur, hz, voice, milli)
            if t + hold >= t1:
                break
            advance = hold - overlap
            if advance <= 0:
                break
            t += advance

    def place(phrase, start: int) -> None:
        t = start
        for hz, steps, rest in phrase:
            dur = steps * step
            add(t, dur, hz, "melody", GAINS["melody"])
            t += dur + rest * step

    def fits(phrase, start: int, t0: int, t1: int, label: str) -> None:
        t = start
        for _hz, steps, rest in phrase:
            dur = steps * step
            if t < t0 or t + dur > t1:
                raise AssertionError(f"{label} spills {t}:{dur} outside {t0}:{t1} seed {seed}")
            t += dur + rest * step

    fade_t, fade_end = sec["fade"]
    lay_bed(
        0,
        min(duration_ms, fade_t + pulse // 2),
        foundation,
        "foundation",
        GAINS["foundation"],
        6 * pulse,
        pulse,
    )
    add(fade_t, fade_end - fade_t, foundation, "foundation", GAINS["fadeFoundation"])
    add(fade_t, fade_end - fade_t, CENTER, "chord", GAINS["fadeCenter"])

    def lay_chord(name: str, low: int, high: int) -> None:
        t0, t1 = sec[name]
        breath = min(pulse // 2, (t1 - t0) // 5)
        end = t1 - breath
        lay_bed(t0, end, low, "chord", GAINS["chordLow"], 4 * pulse, pulse)
        lay_bed(t0 + pulse, end, high, "chord", GAINS["chordHigh"], 4 * pulse, pulse)
        lay_bed(t0, end, oct_down(low), "chord", GAINS["chordOct"], 5 * pulse, pulse)

    lay_chord("A", 396, 528)
    lay_chord("B", 639, 852)
    lay_chord("return", 396, 528)

    ct0, ct1 = sec["cadence"]
    half = (ct1 - ct0) // 2
    add(ct0, half, 396, "chord", GAINS["cadenceLow"])
    add(ct0, ct1 - ct0, CENTER, "chord", GAINS["cadenceHigh"])

    at0, at1 = sec["A"]
    fits(motif, at0 + a_lead, at0, at1, "motif A")
    place(motif, at0 + a_lead)
    fits(variation, at0 + a_lead + phrase_ms(motif, step) + a_gap, at0, at1, "variation")
    place(variation, at0 + a_lead + phrase_ms(motif, step) + a_gap)

    bt0, bt1 = sec["B"]
    fits(b_phrase, bt0 + b_lead, bt0, bt1, "B")
    place(b_phrase, bt0 + b_lead)

    rt0, rt1 = sec["return"]
    fits(motif, rt0 + r_lead, rt0, rt1, "return")
    place(motif, rt0 + r_lead)

    fits(cadence, ct0, ct0, ct1, "cadence")
    place(cadence, ct0)

    i = 0
    t = 0
    while t < fade_t:
        if tick_on(i, pattern):
            add(t, 70, foundation, "pulse", GAINS["pulse"])
        i += 1
        t += pulse

    events.sort(key=lambda e: (e["t"], e["voice"], float(e["hz"]), e["dur"], e["gain"]))

    def sec_out(ms: int):
        return ms / 1000

    return {
        "seed": seed,
        "centerHz": CENTER,
        "foundationHz": foundation,
        "pulseMs": pulse,
        "duration": sec_out(duration_ms),
        "motif": [hz for hz, _steps, _rest in motif],
        "sections": [
            {"name": s["name"], "t": sec_out(s["t"]), "dur": sec_out(s["dur"])}
            for s in sections
        ],
        "events": [
            {
                "t": sec_out(e["t"]),
                "dur": sec_out(e["dur"]),
                "hz": e["hz"],
                "voice": e["voice"],
                "gain": e["gain"] / 1000,
            }
            for e in events
        ],
    }


def allowed_hz(hz: float) -> bool:
    for pitch in PITCHES:
        ratio = hz / pitch
        if ratio <= 0:
            continue
        k = round(math.log2(ratio))
        if -1 <= k <= 2 and abs(ratio - (2 ** k)) < 1e-9:
            return True
    return False


def max_overlap(events) -> int:
    points = []
    for event in events:
        start = round(event["t"] * 1000)
        end = round((event["t"] + event["dur"]) * 1000)
        points.append((start, 1))
        points.append((end, -1))
    points.sort(key=lambda item: (item[0], item[1]))
    current = 0
    best = 0
    for _t, delta in points:
        current += delta
        if current > best:
            best = current
    return best


def melody_events(piece) -> list:
    return [event for event in piece["events"] if event["voice"] == "melody"]


def count_span(hay, needle) -> int:
    found = 0
    n = len(needle)
    if n == 0:
        return 0
    for i in range(len(hay) - n + 1):
        if hay[i:i + n] == needle:
            found += 1
    return found


def check_piece(piece) -> None:
    dur = piece["duration"]
    if not 90 <= dur <= 140:
        raise AssertionError(f"duration {dur} seed {piece['seed']}")
    if max_overlap(piece["events"]) < 3:
        raise AssertionError(f"polyphony seed {piece['seed']}")
    motif = piece["motif"]
    if not 4 <= len(motif) <= 6:
        raise AssertionError(f"motif length {motif}")
    hz = [event["hz"] for event in melody_events(piece)]
    if count_span(hz, motif) < 2:
        raise AssertionError(f"motif not repeated seed {piece['seed']} {motif}")
    if hz[-1] != CENTER:
        raise AssertionError(f"does not end on center seed {piece['seed']} {hz[-1]}")
    durs = {event["dur"] for event in melody_events(piece)}
    if len(durs) < 3:
        raise AssertionError("melody lengths do not vary")
    rests = 0
    notes = melody_events(piece)
    for i in range(1, len(notes)):
        if notes[i]["t"] > notes[i - 1]["t"] + notes[i - 1]["dur"] + 0.02:
            rests += 1
    if rests < 3:
        raise AssertionError("no rests")
    names = [section["name"] for section in piece["sections"]]
    if names != ["intro", "A", "B", "return", "cadence", "fade"]:
        raise AssertionError(names)
    cursor = 0.0
    for section in piece["sections"]:
        if abs(section["t"] - cursor) > 1e-9:
            raise AssertionError("sections gap")
        cursor += section["dur"]
    if abs(cursor - dur) > 1e-9:
        raise AssertionError("sections do not cover the piece")
    for event in piece["events"]:
        if not allowed_hz(event["hz"]):
            raise AssertionError(f"bad hz {event['hz']}")
        if event["gain"] <= 0:
            raise AssertionError("silent event")
    intro = piece["sections"][0]
    for event in piece["events"]:
        if intro["t"] <= event["t"] < intro["t"] + intro["dur"]:
            if event["voice"] not in ("foundation", "pulse"):
                raise AssertionError(f"intro voice {event['voice']}")
    chord = {}
    for section in piece["sections"]:
        if section["name"] not in ("A", "B", "return"):
            continue
        found = set()
        for event in piece["events"]:
            if event["voice"] != "chord":
                continue
            if section["t"] <= event["t"] < section["t"] + section["dur"]:
                found.add(event["hz"])
        chord[section["name"]] = found
    if not {396, 528} <= chord["A"] or not {396, 528} <= chord["return"]:
        raise AssertionError(chord)
    if not {639, 852} <= chord["B"]:
        raise AssertionError(chord)
    b = piece["sections"][2]
    b_melody = {
        event["hz"]
        for event in notes
        if b["t"] <= event["t"] < b["t"] + b["dur"]
    }
    if 741 not in b_melody or 963 not in b_melody:
        raise AssertionError(f"B melody {b_melody}")
    ending = [
        event for event in piece["events"]
        if event["t"] <= dur - 0.05 < event["t"] + event["dur"]
    ]
    if not any(event["hz"] == CENTER for event in ending):
        raise AssertionError("center is not sounding at the end")
    if piece["foundationHz"] not in (174, 285):
        raise AssertionError("foundation")
    if piece["centerHz"] != CENTER:
        raise AssertionError("center")


def self_test() -> None:
    fourth = cents(4 / 3)
    fifth = cents(3 / 2)
    near = cents(963 / 639)
    sharp = near - fifth
    if 528 / 396 != 4 / 3 or 852 / 639 != 4 / 3:
        raise AssertionError("fourths are not exact")
    if not 8 < sharp < 8.2:
        raise AssertionError(sharp)
    durations = []
    overlaps = []
    for seed in range(256):
        piece = compose_piece(seed)
        again = compose_piece(seed)
        if piece != again:
            raise AssertionError(f"unstable {seed}")
        check_piece(piece)
        durations.append(piece["duration"])
        overlaps.append(max_overlap(piece["events"]))
    other = compose_piece(1)
    if other == compose_piece(2):
        raise AssertionError("seed ignored")
    print("solfeggio-compose.py: pass")
    print(f"fourth {fourth:.6f} cents")
    print(f"fifth {fifth:.6f} cents")
    print(f"963/639 {near:.6f} cents, {sharp:.6f} cents sharp of 3/2")
    print(
        f"seeds 0-255 duration {min(durations):.3f}-{max(durations):.3f}s "
        f"overlap {min(overlaps)}-{max(overlaps)}"
    )


def report(piece) -> None:
    print(f"seed {piece['seed']} center {piece['centerHz']} foundation {piece['foundationHz']}")
    print(f"duration {piece['duration']:.3f}s pulse {piece['pulseMs']} ms")
    print(f"motif {piece['motif']}")
    for section in piece["sections"]:
        print(f"  {section['name']:8} t={section['t']:.3f} dur={section['dur']:.3f}")
    print(f"events {len(piece['events'])} max overlap {max_overlap(piece['events'])}")
    notes = melody_events(piece)
    print(f"melody {len(notes)} last {notes[-1]['hz']} dur {notes[-1]['dur']}")


JS_TEMPLATE = r"""/**
 * Generated by scripts/solfeggio-compose.py — do not edit by hand.
 * Python is the generator. The cent values and the phrase tables below are
 * baked from that run. composePiece is the same integer score as the script:
 * same seed, same events. This is a listening piece from a modern pitch list,
 * not a therapy.
 *
 * 528/396 and 852/639 are exactly 4/3.
 * 963/639 is __SHARP__ cents sharp of 3/2.
 */

export const CENTER_HZ = 528
// Unique names so Nuxt auto-import does not collide with utils/solfeggio-math.mjs.
export const PIECE_FOURTH_CENTS = __FOURTH__
export const PIECE_FIFTH_CENTS = __FIFTH__
export const PIECE_NEAR_FIFTH_CENTS = __NEAR__
export const PIECE_NEAR_FIFTH_SHARP_CENTS = __SHARP__

const PULSE_MS = Object.freeze(__PULSE__)
const MOTIFS = Object.freeze(__MOTIFS__)
const VARIATIONS = Object.freeze(__VARIATIONS__)
const B_PHRASES = Object.freeze(__B_PHRASES__)
const CADENCES = Object.freeze(__CADENCES__)
const GAINS = Object.freeze(__GAINS__)

function toGain(milli) {
  return milli / 1000
}

function makeRng(seed) {
  let a = seed >>> 0
  function nextU32() {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return (t ^ (t >>> 14)) >>> 0
  }
  return {
    below(n) {
      return nextU32() % n
    },
  }
}

function phraseMs(phrase, step) {
  let total = 0
  for (let i = 0; i < phrase.length; i++) total += (phrase[i][1] + phrase[i][2]) * step
  return total
}

function decorate(phrase, lift) {
  const out = []
  for (let i = 0; i < phrase.length; i++) {
    const hz = lift && phrase[i][0] === 528 ? 1056 : phrase[i][0]
    out.push([hz, phrase[i][1], phrase[i][2]])
  }
  return out
}

function tickOn(i, pattern) {
  if (pattern === 0) return i % 4 !== 3
  if (pattern === 1) return i % 5 !== 4
  return i % 4 === 0 || i % 4 === 2
}

function octDown(hz) {
  return hz / 2
}

/**
 * @param {number} seed
 * @returns {{
 *   seed: number,
 *   centerHz: number,
 *   foundationHz: number,
 *   pulseMs: number,
 *   duration: number,
 *   motif: number[],
 *   sections: { name: string, t: number, dur: number }[],
 *   events: { t: number, dur: number, hz: number, voice: string, gain: number }[],
 * }}
 */
export function composePiece(seed) {
  const seed32 = seed >>> 0
  const rng = makeRng(seed32)
  const pulse = PULSE_MS[rng.below(PULSE_MS.length)]
  const foundation = rng.below(2) === 0 ? 174 : 285
  const motif = decorate(MOTIFS[rng.below(MOTIFS.length)], rng.below(2) === 1)
  const variation = VARIATIONS[rng.below(VARIATIONS.length)]
  const bPhrase = B_PHRASES[rng.below(B_PHRASES.length)]
  const cadence = CADENCES[rng.below(CADENCES.length)]
  const pattern = rng.below(3)
  let introMs = (8 + rng.below(4)) * pulse
  let aGap = (2 + rng.below(2)) * pulse
  const fadePulses = 6 + rng.below(3)
  const target = 104000 + rng.below(21000)

  const step = Math.floor(pulse / 4)
  const aLead = pulse
  const aTail = 2 * pulse
  let aMs = aLead + phraseMs(motif, step) + aGap + phraseMs(variation, step) + aTail
  const bLead = pulse
  let bTail = 2 * pulse
  let bMs = bLead + phraseMs(bPhrase, step) + bTail
  const rLead = pulse
  let rTail = 2 * pulse
  let rMs = rLead + phraseMs(motif, step) + rTail
  const cTail = pulse
  const cMs = phraseMs(cadence, step) + cTail
  let fMs = fadePulses * pulse
  let totalMs = introMs + aMs + bMs + rMs + cMs + fMs

  let guard = 0
  while (totalMs < target && totalMs + pulse <= 136000 && guard < 80) {
    const which = guard % 5
    if (which === 0) introMs += pulse
    else if (which === 1) {
      aGap += pulse
      aMs += pulse
    } else if (which === 2) {
      bTail += pulse
      bMs += pulse
    } else if (which === 3) {
      rTail += pulse
      rMs += pulse
    } else {
      fMs += pulse
    }
    totalMs += pulse
    guard += 1
  }

  const specs = [
    ['intro', introMs],
    ['A', aMs],
    ['B', bMs],
    ['return', rMs],
    ['cadence', cMs],
    ['fade', fMs],
  ]
  const sections = []
  const sec = {}
  let cursor = 0
  for (let i = 0; i < specs.length; i++) {
    const name = specs[i][0]
    const dur = specs[i][1]
    sections.push({ name, t: cursor, dur })
    sec[name] = [cursor, cursor + dur]
    cursor += dur
  }
  const durationMs = cursor
  const events = []

  function add(t, dur, hz, voice, milli) {
    if (dur < 50 || t < 0 || t >= durationMs) return
    let length = dur
    if (t + length > durationMs) length = durationMs - t
    if (length < 50) return
    events.push({
      t: t | 0,
      dur: length | 0,
      hz,
      voice,
      gain: milli | 0,
    })
  }

  function layBed(t0, t1, hz, voice, milli, hold, overlap) {
    if (t1 - t0 < 80) return
    let t = t0
    while (t < t1) {
      const dur = t + hold <= t1 ? hold : t1 - t
      if (dur >= 50) add(t, dur, hz, voice, milli)
      if (t + hold >= t1) break
      const advance = hold - overlap
      if (advance <= 0) break
      t += advance
    }
  }

  function place(phrase, start) {
    let t = start
    for (let i = 0; i < phrase.length; i++) {
      const dur = phrase[i][1] * step
      add(t, dur, phrase[i][0], 'melody', GAINS.melody)
      t += dur + phrase[i][2] * step
    }
  }

  const fadeT = sec.fade[0]
  const fadeEnd = sec.fade[1]
  layBed(
    0,
    Math.min(durationMs, fadeT + Math.floor(pulse / 2)),
    foundation,
    'foundation',
    GAINS.foundation,
    6 * pulse,
    pulse,
  )
  add(fadeT, fadeEnd - fadeT, foundation, 'foundation', GAINS.fadeFoundation)
  add(fadeT, fadeEnd - fadeT, CENTER_HZ, 'chord', GAINS.fadeCenter)

  function layChord(name, low, high) {
    const t0 = sec[name][0]
    const t1 = sec[name][1]
    const breath = Math.min(Math.floor(pulse / 2), Math.floor((t1 - t0) / 5))
    const end = t1 - breath
    layBed(t0, end, low, 'chord', GAINS.chordLow, 4 * pulse, pulse)
    layBed(t0 + pulse, end, high, 'chord', GAINS.chordHigh, 4 * pulse, pulse)
    layBed(t0, end, octDown(low), 'chord', GAINS.chordOct, 5 * pulse, pulse)
  }

  layChord('A', 396, 528)
  layChord('B', 639, 852)
  layChord('return', 396, 528)

  const ct0 = sec.cadence[0]
  const ct1 = sec.cadence[1]
  const half = Math.floor((ct1 - ct0) / 2)
  add(ct0, half, 396, 'chord', GAINS.cadenceLow)
  add(ct0, ct1 - ct0, CENTER_HZ, 'chord', GAINS.cadenceHigh)

  const at0 = sec.A[0]
  place(motif, at0 + aLead)
  place(variation, at0 + aLead + phraseMs(motif, step) + aGap)
  const bt0 = sec.B[0]
  place(bPhrase, bt0 + bLead)
  const rt0 = sec.return[0]
  place(motif, rt0 + rLead)
  place(cadence, ct0)

  let tick = 0
  let pulseAt = 0
  while (pulseAt < fadeT) {
    if (tickOn(tick, pattern)) add(pulseAt, 70, foundation, 'pulse', GAINS.pulse)
    tick += 1
    pulseAt += pulse
  }

  events.sort((a, b) => (
    a.t - b.t
    || (a.voice < b.voice ? -1 : a.voice > b.voice ? 1 : 0)
    || a.hz - b.hz
    || a.dur - b.dur
    || a.gain - b.gain
  ))

  const seconds = (ms) => ms / 1000
  return {
    seed: seed32,
    centerHz: CENTER_HZ,
    foundationHz: foundation,
    pulseMs: pulse,
    duration: seconds(durationMs),
    motif: motif.map((note) => note[0]),
    sections: sections.map((section) => ({
      name: section.name,
      t: seconds(section.t),
      dur: seconds(section.dur),
    })),
    events: events.map((event) => ({
      t: seconds(event.t),
      dur: seconds(event.dur),
      hz: event.hz,
      voice: event.voice,
      gain: toGain(event.gain),
    })),
  }
}
"""


def render_mjs() -> str:
    fourth = cents(4 / 3)
    fifth = cents(3 / 2)
    near = cents(963 / 639)
    sharp = near - fifth

    def bake(value: float) -> str:
        return format(value, ".17g")

    text = JS_TEMPLATE
    text = text.replace("__FOURTH__", bake(fourth))
    text = text.replace("__FIFTH__", bake(fifth))
    text = text.replace("__NEAR__", bake(near))
    text = text.replace("__SHARP__", bake(sharp))
    text = text.replace("__PULSE__", json.dumps(PULSE_MS))
    text = text.replace("__MOTIFS__", json.dumps(MOTIFS))
    text = text.replace("__VARIATIONS__", json.dumps(VARIATIONS))
    text = text.replace("__B_PHRASES__", json.dumps(B_PHRASES))
    text = text.replace("__CADENCES__", json.dumps(CADENCES))
    text = text.replace("__GAINS__", json.dumps(GAINS, indent=2))
    if not text.endswith("\n"):
        text += "\n"
    return text


def emit(path: Path) -> None:
    path.write_text(render_mjs(), encoding="utf-8")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Compose a Solfeggio piece from a seed.")
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--json", dest="json_path")
    parser.add_argument("--emit", dest="emit_path")
    parser.add_argument("--batch", help="Comma-separated seeds. Prints a JSON array.")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--no-emit", action="store_true")
    args = parser.parse_args(argv)

    if args.check:
        self_test()
        return 0
    if args.batch:
        seeds = [int(part, 10) for part in args.batch.split(",") if part != ""]
        json.dump([compose_piece(seed) for seed in seeds], sys.stdout)
        sys.stdout.write("\n")
        return 0
    if args.emit_path:
        emit(Path(args.emit_path))
        return 0
    if args.json_path or args.no_emit:
        piece = compose_piece(args.seed)
        report(piece)
        if args.json_path:
            Path(args.json_path).write_text(json.dumps(piece), encoding="utf-8")
            print(f"wrote {args.json_path}")
        return 0
    self_test()
    emit(MJS_PATH)
    piece = compose_piece(7)
    report(piece)
    print(f"wrote {MJS_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
