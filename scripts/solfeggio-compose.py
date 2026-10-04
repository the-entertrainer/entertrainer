#!/usr/bin/env python3
"""Seeded Solfeggio song. Python is the numeric source of truth.

Running this file rewrites utils/solfeggio-compose.mjs. The page imports that
module. Do not edit the .mjs by hand.

Each seed is one finished 4/4 song: intro, verse, chorus, verse, chorus,
bridge, chorus, outro. The nine pitches are a modern numerological list, not
a tuning system and not a therapy. 528 is home because 528/396 is exactly 4/3.
852/639 is the other exact fourth. 963/639 sits about 8 cents sharp of 3/2,
so 963 is a color tone. 174 and 285 (and their octaves) are the bass, never
the tune.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

PITCHES = [174, 285, 396, 417, 528, 639, 741, 852, 963]
CENTER = 528
SCALE = [396, 417, 528, 639, 741, 792, 834, 852, 963, 1056]
EIGHTHS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]

# Two-bar hooks. Scale indices. Each chorus plays the chosen hook four times.
CHORUS = [
    [
        [0, 0, 1, 9],
        [0, 1, 0.5, 8],
        [0, 1.5, 0.5, 7],
        [0, 2, 1, 8],
        [0, 3, 1, 9],
        [1, 0, 0.5, 8],
        [1, 0.5, 0.5, 7],
        [1, 1, 1, 8],
        [1, 2, 2, 9],
    ],
    [
        [0, 0, 1, 7],
        [0, 1, 0.5, 8],
        [0, 1.5, 0.5, 7],
        [0, 2, 1, 6],
        [0, 3, 1, 5],
        [1, 0, 1, 6],
        [1, 1, 1, 7],
        [1, 2, 2, 7],
    ],
    [
        [0, 0, 1.5, 8],
        [0, 1.5, 0.5, 9],
        [0, 2, 1, 8],
        [0, 3, 1, 7],
        [1, 0, 1, 6],
        [1, 1, 1, 7],
        [1, 2, 2, 8],
    ],
]

# Verse pairs: [verse, verseTail, verse2, verse2Tail], each an 8-bar contour.
# Tail is used only when the verse is 16 bars. Verse 2 is a different contour
# on the same chords.
VERSES = [
    [
        [
            [0, 0, 2, 0],
            [0, 2, 2, 1],
            [1, 0, 2, 2],
            [1, 2, 2, 1],
            [2, 0, 1, 2],
            [2, 1, 1, 3],
            [2, 2, 2, 2],
            [3, 0, 2, 1],
            [3, 2, 2, 0],
            [4, 0, 2, 1],
            [4, 2, 2, 2],
            [5, 0, 1, 1],
            [5, 1, 1, 0],
            [5, 2, 2, 1],
            [6, 0, 2, 2],
            [6, 2, 2, 1],
            [7, 0, 4, 0],
        ],
        [
            [0, 0, 2, 0],
            [0, 2, 2, 1],
            [1, 0, 2, 2],
            [1, 2, 2, 1],
            [2, 0, 1, 0],
            [2, 1, 1, 1],
            [2, 2, 2, 2],
            [3, 0, 2, 1],
            [3, 2, 2, 0],
            [4, 0, 2, 1],
            [4, 2, 2, 2],
            [5, 0, 2, 3],
            [5, 2, 2, 2],
            [6, 0, 2, 1],
            [6, 2, 2, 0],
            [7, 0, 4, 0],
        ],
        [
            [0, 0, 2, 3],
            [0, 2, 2, 2],
            [1, 0, 2, 1],
            [1, 2, 2, 2],
            [2, 0, 2, 3],
            [2, 2, 2, 2],
            [3, 0, 1, 1],
            [3, 1, 1, 0],
            [3, 2, 2, 1],
            [4, 0, 2, 2],
            [4, 2, 2, 1],
            [5, 0, 2, 0],
            [5, 2, 2, 1],
            [6, 0, 1, 2],
            [6, 1, 1, 1],
            [6, 2, 2, 0],
            [7, 0, 4, 1],
        ],
        [
            [0, 0, 2, 1],
            [0, 2, 2, 0],
            [1, 0, 2, 1],
            [1, 2, 2, 2],
            [2, 0, 2, 3],
            [2, 2, 2, 2],
            [3, 0, 1, 1],
            [3, 1, 1, 0],
            [3, 2, 2, 1],
            [4, 0, 4, 2],
            [5, 0, 2, 1],
            [5, 2, 2, 0],
            [6, 0, 2, 1],
            [6, 2, 2, 0],
            [7, 0, 4, 0],
        ],
    ],
    [
        [
            [0, 0, 1, 1],
            [0, 1, 1, 2],
            [0, 2, 1, 1],
            [0, 3, 1, 0],
            [1, 0, 2, 1],
            [1, 2, 2, 2],
            [2, 0, 1, 3],
            [2, 1, 1, 2],
            [2, 2, 2, 1],
            [3, 0, 4, 0],
            [4, 0, 1, 1],
            [4, 1, 1, 2],
            [4, 2, 1, 3],
            [4, 3, 1, 2],
            [5, 0, 2, 1],
            [5, 2, 2, 0],
            [6, 0, 2, 1],
            [6, 2, 2, 2],
            [7, 0, 4, 1],
        ],
        [
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 2, 2, 1],
            [1, 0, 2, 2],
            [1, 2, 2, 1],
            [2, 0, 2, 0],
            [2, 2, 2, 1],
            [3, 0, 4, 2],
            [4, 0, 2, 1],
            [4, 2, 2, 0],
            [5, 0, 1, 1],
            [5, 1, 1, 2],
            [5, 2, 2, 1],
            [6, 0, 2, 0],
            [6, 2, 2, 1],
            [7, 0, 4, 0],
        ],
        [
            [0, 0, 2, 2],
            [0, 2, 1, 1],
            [0, 3, 1, 2],
            [1, 0, 2, 3],
            [1, 2, 2, 2],
            [2, 0, 1, 1],
            [2, 1, 1, 0],
            [2, 2, 2, 1],
            [3, 0, 2, 2],
            [3, 2, 2, 1],
            [4, 0, 4, 0],
            [5, 0, 1, 1],
            [5, 1, 1, 2],
            [5, 2, 2, 1],
            [6, 0, 2, 0],
            [6, 2, 2, 1],
            [7, 0, 4, 0],
        ],
        [
            [0, 0, 2, 0],
            [0, 2, 2, 1],
            [1, 0, 1, 2],
            [1, 1, 1, 1],
            [1, 2, 2, 0],
            [2, 0, 2, 1],
            [2, 2, 2, 2],
            [3, 0, 2, 3],
            [3, 2, 2, 2],
            [4, 0, 2, 1],
            [4, 2, 2, 0],
            [5, 0, 4, 1],
            [6, 0, 2, 0],
            [6, 2, 2, 1],
            [7, 0, 4, 0],
        ],
    ],
    [
        [
            [0, 0, 1.5, 0],
            [0, 1.5, 0.5, 1],
            [0, 2, 2, 2],
            [1, 0, 2, 3],
            [1, 2, 2, 2],
            [2, 0, 2, 1],
            [2, 2, 2, 0],
            [3, 0, 2, 1],
            [3, 2, 2, 2],
            [4, 0, 4, 1],
            [5, 0, 1, 2],
            [5, 1, 1, 3],
            [5, 2, 1, 2],
            [5, 3, 1, 1],
            [6, 0, 2, 0],
            [6, 2, 2, 1],
            [7, 0, 4, 0],
        ],
        [
            [0, 0, 4, 0],
            [1, 0, 2, 1],
            [1, 2, 2, 2],
            [2, 0, 2, 3],
            [2, 2, 2, 2],
            [3, 0, 1, 1],
            [3, 1, 1, 0],
            [3, 2, 2, 1],
            [4, 0, 2, 2],
            [4, 2, 2, 1],
            [5, 0, 2, 0],
            [5, 2, 2, 1],
            [6, 0, 1, 2],
            [6, 1, 1, 1],
            [6, 2, 2, 0],
            [7, 0, 4, 1],
        ],
        [
            [0, 0, 4, 3],
            [1, 0, 2, 2],
            [1, 2, 2, 1],
            [2, 0, 1, 2],
            [2, 1, 1, 3],
            [2, 2, 2, 2],
            [3, 0, 2, 1],
            [3, 2, 2, 0],
            [4, 0, 2, 1],
            [4, 2, 1, 2],
            [4, 3, 1, 1],
            [5, 0, 4, 0],
            [6, 0, 1, 1],
            [6, 1, 1, 0],
            [6, 2, 2, 1],
            [7, 0, 4, 0],
        ],
        [
            [0, 0, 2, 1],
            [0, 2, 2, 0],
            [1, 0, 2, 1],
            [1, 2, 1, 2],
            [1, 3, 1, 1],
            [2, 0, 2, 0],
            [2, 2, 2, 1],
            [3, 0, 4, 2],
            [4, 0, 2, 1],
            [4, 2, 2, 0],
            [5, 0, 2, 1],
            [5, 2, 2, 2],
            [6, 0, 2, 1],
            [6, 2, 2, 0],
            [7, 0, 4, 0],
        ],
    ],
]

# Bridge tune on the other fourth. 963 is a short color tone, not the bass.
BRIDGE = [
    [0, 0, 2, 639],
    [0, 2, 2, 741],
    [1, 0, 2, 852],
    [1, 2, 1, 963],
    [1, 3, 1, 852],
    [2, 0, 2, 741],
    [2, 2, 2, 852],
    [3, 0, 4, 852],
]

# Milli-gains. Chorus lead is the loudest single voice.
GAINS = {
    "kick": 500,
    "kickGhost": 280,
    "snare": 400,
    "hat": 80,
    "openhat": 120,
    "bass": 440,
    "chordIntro": 150,
    "chordVerse": 200,
    "chordChorus": 250,
    "chordBridge": 210,
    "chordOutro": 220,
    "leadIntro": 240,
    "leadVerse": 360,
    "leadChorus": 640,
    "leadBridge": 400,
    "leadOutro": 420,
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


def all_forms():
    forms = []
    for intro in (4, 8):
        for verse in (8, 16):
            for bridge in (4, 8):
                for outro in (4, 8):
                    total = intro + verse + 8 + verse + 8 + bridge + 8 + outro
                    forms.append({
                        "intro": intro,
                        "verse": verse,
                        "bridge": bridge,
                        "outro": outro,
                        "total": total,
                    })
    return forms


def song_seconds(total_bars: int, bpm: int) -> float:
    return total_bars * 4 * 60 / bpm


def valid_forms(bpm: int):
    good = []
    for form in all_forms():
        dur = song_seconds(form["total"], bpm)
        if dur >= 150 and dur <= 240:
            good.append(form)
    return good


def outro_indices(n: int):
    seq = []
    idx = 0
    direction = 1
    for _ in range(n - 1):
        seq.append(idx)
        nxt = idx + direction
        if nxt > 2 or nxt < 0:
            direction = -direction
            nxt = idx + direction
        idx = nxt
    seq.append(2)
    return seq


def compose_song(seed: int) -> dict:
    seed = seed & 0xFFFFFFFF
    rng = Rng(seed)
    # Draw order is part of the score. The generated module must match it.
    bpm = 72 + rng.below(25)
    forms = valid_forms(bpm)
    form = forms[rng.below(len(forms))]
    motif = CHORUS[rng.below(len(CHORUS))]
    pair = VERSES[rng.below(len(VERSES))]
    drum_style = rng.below(3)
    bridge_color = 741 if rng.below(2) == 0 else 963
    bass_low = rng.below(2) == 0

    intro = form["intro"]
    verse = form["verse"]
    bridge = form["bridge"]
    outro = form["outro"]
    chorus = 8

    sections = []
    bar = 0

    def add_sec(name: str, bars: int) -> None:
        nonlocal bar
        sections.append({"name": name, "bar": bar, "bars": bars})
        bar += bars

    add_sec("intro", intro)
    add_sec("verse", verse)
    add_sec("chorus", chorus)
    add_sec("verse", verse)
    add_sec("chorus", chorus)
    add_sec("bridge", bridge)
    add_sec("chorus", chorus)
    add_sec("outro", outro)
    total_bars = bar

    events = []

    def add(at: int, beat: float, dur: float, hz: int, voice: str, milli: int) -> None:
        events.append({
            "bar": at,
            "beat": beat,
            "durBeats": dur,
            "hz": hz,
            "voice": voice,
            "gain": milli / 1000,
        })

    def place_idx(start: int, notes, milli: int) -> None:
        for note in notes:
            add(start + note[0], note[1], note[2], SCALE[note[3]], "lead", milli)

    def place_hz(start: int, notes, milli: int) -> None:
        for note in notes:
            add(start + note[0], note[1], note[2], note[3], "lead", milli)

    def lay_drums(at: int, last: bool) -> None:
        if last:
            add(at, 0, 0.5, 87, "kick", GAINS["kick"])
            return
        add(at, 0, 0.5, 87, "kick", GAINS["kick"])
        add(at, 2, 0.5, 87, "kick", GAINS["kick"])
        if drum_style == 0 and at % 4 == 3:
            add(at, 3.5, 0.5, 87, "kick", GAINS["kickGhost"])
        elif drum_style == 1 and at % 2 == 1:
            add(at, 2.5, 0.5, 87, "kick", GAINS["kickGhost"])
        elif drum_style == 2 and at % 4 == 1:
            add(at, 3, 0.5, 87, "kick", GAINS["kickGhost"])
        add(at, 1, 0.5, 174, "snare", GAINS["snare"])
        add(at, 3, 0.5, 174, "snare", GAINS["snare"])
        for beat in EIGHTHS:
            if beat == 3.5 and at % 2 == 1:
                add(at, beat, 0.5, 285, "openhat", GAINS["openhat"])
            else:
                add(at, beat, 0.5, 285, "hat", GAINS["hat"])

    def lay_verse_bass(start: int, bars: int) -> None:
        for i in range(bars):
            group = (i // 4) % 2
            at = start + i
            if group == 0:
                add(at, 0, 2, 174, "bass", GAINS["bass"])
                add(at, 2, 2, 285, "bass", GAINS["bass"])
            else:
                add(at, 0, 2, 285, "bass", GAINS["bass"])
                add(at, 2, 2, 348, "bass", GAINS["bass"])

    def lay_chorus_bass(start: int) -> None:
        root = 87 if bass_low else 174
        passing = 174 if bass_low else 348
        for i in range(8):
            at = start + i
            add(at, 0, 1, root, "bass", GAINS["bass"])
            add(at, 1, 1, passing, "bass", GAINS["bass"])
            add(at, 2, 1, 285, "bass", GAINS["bass"])
            add(at, 3, 0.5, 570, "bass", GAINS["bass"])
            add(at, 3.5, 0.5, root, "bass", GAINS["bass"])

    def lay_bridge_bass(start: int, bars: int) -> None:
        for i in range(bars):
            at = start + i
            add(at, 0, 1, 285, "bass", GAINS["bass"])
            add(at, 1, 1, 174, "bass", GAINS["bass"])
            add(at, 2, 2, 570, "bass", GAINS["bass"])

    def lay_outro_bass(start: int, bars: int) -> None:
        for i in range(bars):
            at = start + i
            if i == bars - 1:
                add(at, 0, 4, 174, "bass", GAINS["bass"])
            else:
                add(at, 0, 2, 174, "bass", GAINS["bass"])
                add(at, 2, 2, 285, "bass", GAINS["bass"])

    def lay_verse_chords(start: int, bars: int) -> None:
        for i in range(bars):
            group = (i // 4) % 2
            at = start + i
            low = 396 if group == 0 else 417
            add(at, 0, 4, low, "chord", GAINS["chordVerse"])
            add(at, 0, 4, CENTER, "chord", GAINS["chordVerse"])
            if i % 4 == 3:
                color = 639 if group == 0 else 792
                add(at, 2, 2, color, "chord", GAINS["chordVerse"] - 40)

    def lay_chorus_chords(start: int) -> None:
        for i in range(8):
            at = start + i
            add(at, 0, 2, 396, "chord", GAINS["chordChorus"])
            add(at, 0, 2, CENTER, "chord", GAINS["chordChorus"])
            add(at, 2, 2, 417, "chord", GAINS["chordChorus"])
            add(at, 2, 2, CENTER, "chord", GAINS["chordChorus"])

    def lay_bridge_chords(start: int, bars: int) -> None:
        for i in range(bars):
            at = start + i
            if i % 4 == 1:
                add(at, 0, 2, 639, "chord", GAINS["chordBridge"])
                add(at, 0, 2, 852, "chord", GAINS["chordBridge"])
                add(at, 2, 2, 852, "chord", GAINS["chordBridge"])
                add(at, 2, 2, bridge_color, "chord", GAINS["chordBridge"])
            else:
                add(at, 0, 4, 639, "chord", GAINS["chordBridge"])
                add(at, 0, 4, 852, "chord", GAINS["chordBridge"])

    def lay_pad(start: int, bars: int, milli: int) -> None:
        for i in range(bars):
            at = start + i
            add(at, 0, 4, 396, "chord", milli)
            add(at, 0, 4, CENTER, "chord", milli)

    def lay_verse_lead(start: int, bars: int, phrase, tail) -> None:
        place_idx(start, phrase, GAINS["leadVerse"])
        if bars == 16:
            place_idx(start + 8, tail, GAINS["leadVerse"])

    for at in range(total_bars - 1):
        lay_drums(at, False)
    lay_drums(total_bars - 1, True)

    lay_pad(sections[0]["bar"], sections[0]["bars"], GAINS["chordIntro"])
    for i in range(sections[0]["bars"]):
        at = sections[0]["bar"] + i
        add(at, 0, 2, 174, "bass", GAINS["bass"])
        add(at, 2, 2, 285 if at % 2 else 348, "bass", GAINS["bass"])

    first = pair[0][0][3]
    neighbor = first + 1 if first == 0 else first - 1
    add(intro - 2, 2, 2, SCALE[neighbor], "lead", GAINS["leadIntro"])
    add(intro - 1, 2, 2, SCALE[first], "lead", GAINS["leadIntro"])

    lay_verse_bass(sections[1]["bar"], sections[1]["bars"])
    lay_verse_chords(sections[1]["bar"], sections[1]["bars"])
    lay_verse_lead(sections[1]["bar"], sections[1]["bars"], pair[0], pair[1])

    lay_chorus_bass(sections[2]["bar"])
    lay_chorus_chords(sections[2]["bar"])
    for rep in range(4):
        place_idx(sections[2]["bar"] + rep * 2, motif, GAINS["leadChorus"])

    lay_verse_bass(sections[3]["bar"], sections[3]["bars"])
    lay_verse_chords(sections[3]["bar"], sections[3]["bars"])
    lay_verse_lead(sections[3]["bar"], sections[3]["bars"], pair[2], pair[3])

    lay_chorus_bass(sections[4]["bar"])
    lay_chorus_chords(sections[4]["bar"])
    for rep in range(4):
        place_idx(sections[4]["bar"] + rep * 2, motif, GAINS["leadChorus"])

    lay_bridge_bass(sections[5]["bar"], sections[5]["bars"])
    lay_bridge_chords(sections[5]["bar"], sections[5]["bars"])
    place_hz(sections[5]["bar"], BRIDGE, GAINS["leadBridge"])
    if sections[5]["bars"] == 8:
        place_hz(sections[5]["bar"] + 4, BRIDGE, GAINS["leadBridge"])

    lay_chorus_bass(sections[6]["bar"])
    lay_chorus_chords(sections[6]["bar"])
    for rep in range(4):
        place_idx(sections[6]["bar"] + rep * 2, motif, GAINS["leadChorus"])

    lay_outro_bass(sections[7]["bar"], sections[7]["bars"])
    lay_pad(sections[7]["bar"], sections[7]["bars"], GAINS["chordOutro"])
    for i, idx in enumerate(outro_indices(sections[7]["bars"])):
        add(sections[7]["bar"] + i, 0, 4, SCALE[idx], "lead", GAINS["leadOutro"])

    events.sort(key=lambda e: (e["bar"], e["beat"], e["voice"], e["hz"], e["durBeats"], e["gain"]))

    return {
        "seed": seed,
        "bpm": bpm,
        "meter": "4/4",
        "totalBars": total_bars,
        "duration": song_seconds(total_bars, bpm),
        "centerHz": CENTER,
        "sections": sections,
        "events": events,
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


def is_foundation(hz: float) -> bool:
    for pitch in (174, 285):
        ratio = hz / pitch
        if ratio <= 0:
            continue
        k = round(math.log2(ratio))
        if -1 <= k <= 2 and abs(ratio - (2 ** k)) < 1e-9:
            return True
    return False


def is_center(hz: float) -> bool:
    ratio = hz / CENTER
    if ratio <= 0:
        return False
    k = round(math.log2(ratio))
    return -1 <= k <= 2 and abs(ratio - (2 ** k)) < 1e-9


def on_eighth(value: float) -> bool:
    return abs(value * 2 - round(value * 2)) < 1e-9


def start_beat(event) -> float:
    return event["bar"] * 4 + event["beat"]


def end_beat(event) -> float:
    return start_beat(event) + event["durBeats"]


def max_overlap(events) -> int:
    points = []
    for event in events:
        points.append((round(start_beat(event) * 2), 1))
        points.append((round(end_beat(event) * 2), -1))
    points.sort()
    current = 0
    best = 0
    for _t, delta in points:
        current += delta
        if current > best:
            best = current
    return best


def lead_in(song, section):
    notes = [
        event for event in song["events"]
        if event["voice"] == "lead"
        and section["bar"] <= event["bar"] < section["bar"] + section["bars"]
    ]
    notes.sort(key=start_beat)
    return notes


def rel_lead(song, section):
    return [
        [event["bar"] - section["bar"], event["beat"], event["durBeats"], event["hz"]]
        for event in lead_in(song, section)
    ]


def rel_chords(song, section):
    notes = [
        event for event in song["events"]
        if event["voice"] == "chord"
        and section["bar"] <= event["bar"] < section["bar"] + section["bars"]
    ]
    notes.sort(key=lambda event: (start_beat(event), event["hz"], event["durBeats"], event["gain"]))
    return [
        [event["bar"] - section["bar"], event["beat"], event["durBeats"], event["hz"], event["gain"]]
        for event in notes
    ]


def check_tables() -> None:
    def walk(notes, label: str) -> None:
        ordered = sorted(notes, key=lambda note: (note[0], note[1]))
        for i in range(1, len(ordered)):
            prev = ordered[i - 1]
            cur = ordered[i]
            prev_end = prev[0] * 4 + prev[1] + prev[2]
            cur_at = cur[0] * 4 + cur[1]
            if cur_at + 1e-9 < prev_end:
                raise AssertionError(f"overlap {label}")
            if abs(cur[3] - prev[3]) > 1:
                raise AssertionError(f"step {label} {prev[3]}->{cur[3]}")
        for note in notes:
            if note[1] < 0 or note[1] + note[2] > 4 + 1e-9:
                raise AssertionError(f"spill {label} {note}")
            if not on_eighth(note[1]) or not on_eighth(note[2]):
                raise AssertionError(f"grid {label}")

    for motif in CHORUS:
        walk(motif, "chorus")
        idxs = [note[3] for note in motif]
        if motif[0][3] < 7:
            raise AssertionError("chorus does not leap up")
        if not any(note[2] >= 2 for note in motif):
            raise AssertionError("chorus rest")
        if len(set(idxs)) == len(idxs):
            raise AssertionError("chorus repetition")
    for pair in VERSES:
        for part in pair:
            walk(part, "verse")
        for phrase, tail in ((pair[0], pair[1]), (pair[2], pair[3])):
            joined = list(phrase) + [[note[0] + 8, note[1], note[2], note[3]] for note in tail]
            walk(joined, "verse join")
        if [note[3] for note in pair[0]] == [note[3] for note in pair[2]]:
            raise AssertionError("verse contours match")


def check_song(song) -> None:
    if song["meter"] != "4/4":
        raise AssertionError("meter")
    if not 72 <= song["bpm"] <= 96:
        raise AssertionError(song["bpm"])
    dur = song["duration"]
    if not 150 <= dur <= 240:
        raise AssertionError(f"duration {dur}")
    if abs(dur - song_seconds(song["totalBars"], song["bpm"])) > 1e-9:
        raise AssertionError("duration math")
    names = [section["name"] for section in song["sections"]]
    if names != ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"]:
        raise AssertionError(names)
    cursor = 0
    for section in song["sections"]:
        if section["bar"] != cursor:
            raise AssertionError("section gap")
        if section["bars"] not in (4, 8, 16):
            raise AssertionError(section)
        cursor += section["bars"]
    if cursor != song["totalBars"]:
        raise AssertionError("sections")
    if song["sections"][0]["bars"] not in (4, 8) or song["sections"][7]["bars"] not in (4, 8):
        raise AssertionError("intro/outro")
    for section in song["sections"]:
        if section["name"] == "chorus" and section["bars"] != 8:
            raise AssertionError("chorus bars")
    if song["sections"][1]["bars"] != song["sections"][3]["bars"]:
        raise AssertionError("verse length")
    voices = {event["voice"] for event in song["events"]}
    for voice in ("kick", "snare", "hat", "bass", "chord", "lead"):
        if voice not in voices:
            raise AssertionError(voice)
    if max_overlap(song["events"]) < 4:
        raise AssertionError("overlap")
    total_beats = song["totalBars"] * 4
    for event in song["events"]:
        if not allowed_hz(event["hz"]):
            raise AssertionError(f"hz {event['hz']}")
        if event["gain"] <= 0:
            raise AssertionError("gain")
        if event["bar"] < 0 or event["bar"] >= song["totalBars"]:
            raise AssertionError("bar")
        if event["beat"] < 0 or event["beat"] >= 4:
            raise AssertionError("beat")
        if event["durBeats"] <= 0 or event["beat"] + event["durBeats"] > 4 + 1e-9:
            raise AssertionError("dur")
        if not on_eighth(event["beat"]) or not on_eighth(event["durBeats"]):
            raise AssertionError("grid")
        if event["voice"] == "bass" and not is_foundation(event["hz"]):
            raise AssertionError(f"bass {event['hz']}")
        if event["voice"] == "lead" and event["hz"] < 396:
            raise AssertionError("lead low")
        if end_beat(event) > total_beats + 1e-9:
            raise AssertionError("past the end")
    choruses = [section for section in song["sections"] if section["name"] == "chorus"]
    hook = rel_lead(song, choruses[0])
    if len(hook) < 4:
        raise AssertionError("hook")
    if rel_lead(song, choruses[1]) != hook or rel_lead(song, choruses[2]) != hook:
        raise AssertionError("chorus melody changed")
    if not any(note[2] >= 2 for note in hook):
        raise AssertionError("resting note")
    pitches = [note[3] for note in hook]
    if len(set(pitches)) == len(pitches):
        raise AssertionError("no repetition")
    verses = [section for section in song["sections"] if section["name"] == "verse"]
    if rel_chords(song, verses[0]) != rel_chords(song, verses[1]):
        raise AssertionError("verse harmony")
    if rel_lead(song, verses[0]) == rel_lead(song, verses[1]):
        raise AssertionError("verse melody")
    for verse, chorus in ((verses[0], choruses[0]), (verses[1], choruses[1])):
        last = lead_in(song, verse)[-1]["hz"]
        first = lead_in(song, chorus)[0]["hz"]
        leap = abs(SCALE.index(first) - SCALE.index(last))
        if leap < 4:
            raise AssertionError(f"leap {last}->{first}")
    leads = [event for event in song["events"] if event["voice"] == "lead"]
    last_lead = max(leads, key=end_beat)
    if not is_center(last_lead["hz"]):
        raise AssertionError(f"end {last_lead['hz']}")
    ending = [
        event for event in song["events"]
        if start_beat(event) < total_beats - 1e-9 and end_beat(event) >= total_beats - 1e-9
    ]
    if not any(is_center(event["hz"]) for event in ending):
        raise AssertionError("center is not sounding at the end")
    top = max(event["gain"] for event in song["events"])
    if abs(top - GAINS["leadChorus"] / 1000) > 1e-12:
        raise AssertionError("chorus is not the loudest")
    for event in song["events"]:
        if abs(event["gain"] - top) < 1e-12 and event["voice"] != "lead":
            raise AssertionError("loud voice")
        if abs(event["gain"] - top) < 1e-12:
            bar = event["bar"]
            if not any(section["name"] == "chorus" and section["bar"] <= bar < section["bar"] + section["bars"] for section in song["sections"]):
                raise AssertionError("loud note outside the chorus")
    bridge = song["sections"][5]
    bridge_hz = {
        event["hz"]
        for event in song["events"]
        if event["voice"] == "chord" and bridge["bar"] <= event["bar"] < bridge["bar"] + bridge["bars"]
    }
    if not {639, 852} <= bridge_hz:
        raise AssertionError(bridge_hz)
    if 741 not in bridge_hz and 963 not in bridge_hz:
        raise AssertionError(bridge_hz)
    chorus_hz = {
        event["hz"]
        for event in song["events"]
        if event["voice"] == "chord" and choruses[0]["bar"] <= event["bar"] < choruses[0]["bar"] + choruses[0]["bars"]
    }
    if not {396, 528} <= chorus_hz:
        raise AssertionError(chorus_hz)
    # A steady backbeat, not a drone: kick on 1 and 3, snare on 2 and 4.
    sample = song["sections"][2]["bar"] + 2
    kicks = {event["beat"] for event in song["events"] if event["voice"] == "kick" and event["bar"] == sample}
    snares = {event["beat"] for event in song["events"] if event["voice"] == "snare" and event["bar"] == sample}
    if not {0, 2} <= kicks or not {1, 3} <= snares:
        raise AssertionError(f"backbeat {kicks} {snares}")
    hats = {event["beat"] for event in song["events"] if event["voice"] in ("hat", "openhat") and event["bar"] == sample}
    if set(EIGHTHS) != hats:
        raise AssertionError("hats")
    if song["centerHz"] != CENTER:
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
    check_tables()
    if not valid_forms(72) or not valid_forms(96):
        raise AssertionError("no forms")
    durations = []
    for seed in range(256):
        song = compose_song(seed)
        if song != compose_song(seed):
            raise AssertionError(f"unstable {seed}")
        check_song(song)
        durations.append(song["duration"])
    if compose_song(1) == compose_song(2):
        raise AssertionError("seed ignored")
    check_song(compose_song(4294967295))
    print("solfeggio-compose.py: pass")
    print(f"fourth {fourth:.6f} cents")
    print(f"fifth {fifth:.6f} cents")
    print(f"963/639 {near:.6f} cents, {sharp:.6f} cents sharp of 3/2")
    print(f"seeds 0-255 duration {min(durations):.3f}-{max(durations):.3f}s")


def report(song) -> None:
    print(f"seed {song['seed']} bpm {song['bpm']} bars {song['totalBars']} duration {song['duration']:.3f}s")
    for section in song["sections"]:
        print(f"  {section['name']:8} bar {section['bar']:3} bars {section['bars']}")
    choruses = [section for section in song["sections"] if section["name"] == "chorus"]
    hook = [note[3] for note in rel_lead(song, choruses[0])]
    print(f"chorus lead {hook}")
    print(f"events {len(song['events'])} overlap {max_overlap(song['events'])}")


JS_TEMPLATE = r"""/**
 * Generated by scripts/solfeggio-compose.py — do not edit by hand.
 * Python is the generator. composeSong is the same score as the script:
 * same seed, same events. This is a listening song from a modern pitch list,
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

const SCALE = Object.freeze(__SCALE__)
const EIGHTHS = Object.freeze(__EIGHTHS__)
const CHORUS = Object.freeze(__CHORUS__)
const VERSES = Object.freeze(__VERSES__)
const BRIDGE = Object.freeze(__BRIDGE__)
const GAINS = Object.freeze(__GAINS__)

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

function allForms() {
  const forms = []
  const intros = [4, 8]
  const verses = [8, 16]
  const bridges = [4, 8]
  const outros = [4, 8]
  for (let i = 0; i < intros.length; i++) {
    for (let v = 0; v < verses.length; v++) {
      for (let b = 0; b < bridges.length; b++) {
        for (let o = 0; o < outros.length; o++) {
          const intro = intros[i]
          const verse = verses[v]
          const bridge = bridges[b]
          const outro = outros[o]
          const total = intro + verse + 8 + verse + 8 + bridge + 8 + outro
          forms.push({ intro, verse, bridge, outro, total })
        }
      }
    }
  }
  return forms
}

function songSeconds(totalBars, bpm) {
  return totalBars * 4 * 60 / bpm
}

function validForms(bpm) {
  const good = []
  const forms = allForms()
  for (let i = 0; i < forms.length; i++) {
    const dur = songSeconds(forms[i].total, bpm)
    if (dur >= 150 && dur <= 240) good.push(forms[i])
  }
  return good
}

function outroIndices(n) {
  const seq = []
  let idx = 0
  let direction = 1
  for (let i = 0; i < n - 1; i++) {
    seq.push(idx)
    let nxt = idx + direction
    if (nxt > 2 || nxt < 0) {
      direction = -direction
      nxt = idx + direction
    }
    idx = nxt
  }
  seq.push(2)
  return seq
}

/**
 * @param {number} seed
 * @returns {{
 *   seed: number,
 *   bpm: number,
 *   meter: string,
 *   totalBars: number,
 *   duration: number,
 *   centerHz: number,
 *   sections: { name: string, bar: number, bars: number }[],
 *   events: { bar: number, beat: number, durBeats: number, hz: number, voice: string, gain: number }[],
 * }}
 */
export function composeSong(seed) {
  const seed32 = seed >>> 0
  const rng = makeRng(seed32)
  const bpm = 72 + rng.below(25)
  const forms = validForms(bpm)
  const form = forms[rng.below(forms.length)]
  const motif = CHORUS[rng.below(CHORUS.length)]
  const pair = VERSES[rng.below(VERSES.length)]
  const drumStyle = rng.below(3)
  const bridgeColor = rng.below(2) === 0 ? 741 : 963
  const bassLow = rng.below(2) === 0

  const intro = form.intro
  const verse = form.verse
  const bridge = form.bridge
  const outro = form.outro
  const chorus = 8

  const sections = []
  let bar = 0
  function addSec(name, bars) {
    sections.push({ name, bar, bars })
    bar += bars
  }
  addSec('intro', intro)
  addSec('verse', verse)
  addSec('chorus', chorus)
  addSec('verse', verse)
  addSec('chorus', chorus)
  addSec('bridge', bridge)
  addSec('chorus', chorus)
  addSec('outro', outro)
  const totalBars = bar
  const events = []

  function add(at, beat, dur, hz, voice, milli) {
    events.push({
      bar: at,
      beat,
      durBeats: dur,
      hz,
      voice,
      gain: milli / 1000,
    })
  }

  function placeIdx(start, notes, milli) {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]
      add(start + note[0], note[1], note[2], SCALE[note[3]], 'lead', milli)
    }
  }

  function placeHz(start, notes, milli) {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]
      add(start + note[0], note[1], note[2], note[3], 'lead', milli)
    }
  }

  function layDrums(at, last) {
    if (last) {
      add(at, 0, 0.5, 87, 'kick', GAINS.kick)
      return
    }
    add(at, 0, 0.5, 87, 'kick', GAINS.kick)
    add(at, 2, 0.5, 87, 'kick', GAINS.kick)
    if (drumStyle === 0 && at % 4 === 3) add(at, 3.5, 0.5, 87, 'kick', GAINS.kickGhost)
    else if (drumStyle === 1 && at % 2 === 1) add(at, 2.5, 0.5, 87, 'kick', GAINS.kickGhost)
    else if (drumStyle === 2 && at % 4 === 1) add(at, 3, 0.5, 87, 'kick', GAINS.kickGhost)
    add(at, 1, 0.5, 174, 'snare', GAINS.snare)
    add(at, 3, 0.5, 174, 'snare', GAINS.snare)
    for (let i = 0; i < EIGHTHS.length; i++) {
      const beat = EIGHTHS[i]
      if (beat === 3.5 && at % 2 === 1) add(at, beat, 0.5, 285, 'openhat', GAINS.openhat)
      else add(at, beat, 0.5, 285, 'hat', GAINS.hat)
    }
  }

  function layVerseBass(start, bars) {
    for (let i = 0; i < bars; i++) {
      const group = Math.floor(i / 4) % 2
      const at = start + i
      if (group === 0) {
        add(at, 0, 2, 174, 'bass', GAINS.bass)
        add(at, 2, 2, 285, 'bass', GAINS.bass)
      } else {
        add(at, 0, 2, 285, 'bass', GAINS.bass)
        add(at, 2, 2, 348, 'bass', GAINS.bass)
      }
    }
  }

  function layChorusBass(start) {
    const root = bassLow ? 87 : 174
    const passing = bassLow ? 174 : 348
    for (let i = 0; i < 8; i++) {
      const at = start + i
      add(at, 0, 1, root, 'bass', GAINS.bass)
      add(at, 1, 1, passing, 'bass', GAINS.bass)
      add(at, 2, 1, 285, 'bass', GAINS.bass)
      add(at, 3, 0.5, 570, 'bass', GAINS.bass)
      add(at, 3.5, 0.5, root, 'bass', GAINS.bass)
    }
  }

  function layBridgeBass(start, bars) {
    for (let i = 0; i < bars; i++) {
      const at = start + i
      add(at, 0, 1, 285, 'bass', GAINS.bass)
      add(at, 1, 1, 174, 'bass', GAINS.bass)
      add(at, 2, 2, 570, 'bass', GAINS.bass)
    }
  }

  function layOutroBass(start, bars) {
    for (let i = 0; i < bars; i++) {
      const at = start + i
      if (i === bars - 1) add(at, 0, 4, 174, 'bass', GAINS.bass)
      else {
        add(at, 0, 2, 174, 'bass', GAINS.bass)
        add(at, 2, 2, 285, 'bass', GAINS.bass)
      }
    }
  }

  function layVerseChords(start, bars) {
    for (let i = 0; i < bars; i++) {
      const group = Math.floor(i / 4) % 2
      const at = start + i
      const low = group === 0 ? 396 : 417
      add(at, 0, 4, low, 'chord', GAINS.chordVerse)
      add(at, 0, 4, CENTER_HZ, 'chord', GAINS.chordVerse)
      if (i % 4 === 3) {
        const color = group === 0 ? 639 : 792
        add(at, 2, 2, color, 'chord', GAINS.chordVerse - 40)
      }
    }
  }

  function layChorusChords(start) {
    for (let i = 0; i < 8; i++) {
      const at = start + i
      add(at, 0, 2, 396, 'chord', GAINS.chordChorus)
      add(at, 0, 2, CENTER_HZ, 'chord', GAINS.chordChorus)
      add(at, 2, 2, 417, 'chord', GAINS.chordChorus)
      add(at, 2, 2, CENTER_HZ, 'chord', GAINS.chordChorus)
    }
  }

  function layBridgeChords(start, bars) {
    for (let i = 0; i < bars; i++) {
      const at = start + i
      if (i % 4 === 1) {
        add(at, 0, 2, 639, 'chord', GAINS.chordBridge)
        add(at, 0, 2, 852, 'chord', GAINS.chordBridge)
        add(at, 2, 2, 852, 'chord', GAINS.chordBridge)
        add(at, 2, 2, bridgeColor, 'chord', GAINS.chordBridge)
      } else {
        add(at, 0, 4, 639, 'chord', GAINS.chordBridge)
        add(at, 0, 4, 852, 'chord', GAINS.chordBridge)
      }
    }
  }

  function layPad(start, bars, milli) {
    for (let i = 0; i < bars; i++) {
      const at = start + i
      add(at, 0, 4, 396, 'chord', milli)
      add(at, 0, 4, CENTER_HZ, 'chord', milli)
    }
  }

  function layVerseLead(start, bars, phrase, tail) {
    placeIdx(start, phrase, GAINS.leadVerse)
    if (bars === 16) placeIdx(start + 8, tail, GAINS.leadVerse)
  }

  for (let at = 0; at < totalBars - 1; at++) layDrums(at, false)
  layDrums(totalBars - 1, true)

  layPad(sections[0].bar, sections[0].bars, GAINS.chordIntro)
  for (let i = 0; i < sections[0].bars; i++) {
    const at = sections[0].bar + i
    add(at, 0, 2, 174, 'bass', GAINS.bass)
    add(at, 2, 2, at % 2 ? 285 : 348, 'bass', GAINS.bass)
  }

  const first = pair[0][0][3]
  const neighbor = first === 0 ? first + 1 : first - 1
  add(intro - 2, 2, 2, SCALE[neighbor], 'lead', GAINS.leadIntro)
  add(intro - 1, 2, 2, SCALE[first], 'lead', GAINS.leadIntro)

  layVerseBass(sections[1].bar, sections[1].bars)
  layVerseChords(sections[1].bar, sections[1].bars)
  layVerseLead(sections[1].bar, sections[1].bars, pair[0], pair[1])

  layChorusBass(sections[2].bar)
  layChorusChords(sections[2].bar)
  for (let rep = 0; rep < 4; rep++) placeIdx(sections[2].bar + rep * 2, motif, GAINS.leadChorus)

  layVerseBass(sections[3].bar, sections[3].bars)
  layVerseChords(sections[3].bar, sections[3].bars)
  layVerseLead(sections[3].bar, sections[3].bars, pair[2], pair[3])

  layChorusBass(sections[4].bar)
  layChorusChords(sections[4].bar)
  for (let rep = 0; rep < 4; rep++) placeIdx(sections[4].bar + rep * 2, motif, GAINS.leadChorus)

  layBridgeBass(sections[5].bar, sections[5].bars)
  layBridgeChords(sections[5].bar, sections[5].bars)
  placeHz(sections[5].bar, BRIDGE, GAINS.leadBridge)
  if (sections[5].bars === 8) placeHz(sections[5].bar + 4, BRIDGE, GAINS.leadBridge)

  layChorusBass(sections[6].bar)
  layChorusChords(sections[6].bar)
  for (let rep = 0; rep < 4; rep++) placeIdx(sections[6].bar + rep * 2, motif, GAINS.leadChorus)

  layOutroBass(sections[7].bar, sections[7].bars)
  layPad(sections[7].bar, sections[7].bars, GAINS.chordOutro)
  const outroLine = outroIndices(sections[7].bars)
  for (let i = 0; i < outroLine.length; i++) {
    add(sections[7].bar + i, 0, 4, SCALE[outroLine[i]], 'lead', GAINS.leadOutro)
  }

  events.sort((a, b) => (
    a.bar - b.bar
    || a.beat - b.beat
    || (a.voice < b.voice ? -1 : a.voice > b.voice ? 1 : 0)
    || a.hz - b.hz
    || a.durBeats - b.durBeats
    || a.gain - b.gain
  ))

  return {
    seed: seed32,
    bpm,
    meter: '4/4',
    totalBars,
    duration: songSeconds(totalBars, bpm),
    centerHz: CENTER_HZ,
    sections,
    events,
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
    text = text.replace("__SCALE__", json.dumps(SCALE))
    text = text.replace("__EIGHTHS__", json.dumps(EIGHTHS))
    text = text.replace("__CHORUS__", json.dumps(CHORUS))
    text = text.replace("__VERSES__", json.dumps(VERSES))
    text = text.replace("__BRIDGE__", json.dumps(BRIDGE))
    text = text.replace("__GAINS__", json.dumps(GAINS, indent=2))
    if not text.endswith("\n"):
        text += "\n"
    return text


def emit(path: Path) -> None:
    path.write_text(render_mjs(), encoding="utf-8")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Compose a Solfeggio song from a seed.")
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--json", dest="json_path")
    parser.add_argument("--emit", dest="emit_path")
    parser.add_argument("--batch", help="Comma-separated seeds. Prints a JSON array.")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--no-emit", action="store_true")
    args = parser.parse_args(argv)

    if args.check:
        self_test()
        fresh = render_mjs()
        disk = MJS_PATH.read_text(encoding="utf-8") if MJS_PATH.exists() else ""
        if fresh != disk:
            raise SystemExit("utils/solfeggio-compose.mjs does not match a fresh emit")
        print("mjs matches emit")
        return 0
    if args.batch:
        seeds = [int(part, 10) for part in args.batch.split(",") if part != ""]
        json.dump([compose_song(seed) for seed in seeds], sys.stdout)
        sys.stdout.write("\n")
        return 0
    if args.emit_path:
        emit(Path(args.emit_path))
        return 0
    if args.json_path or args.no_emit:
        song = compose_song(args.seed)
        report(song)
        if args.json_path:
            Path(args.json_path).write_text(json.dumps(song), encoding="utf-8")
            print(f"wrote {args.json_path}")
        return 0
    self_test()
    emit(MJS_PATH)
    song = compose_song(1)
    report(song)
    print(f"wrote {MJS_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
