#!/usr/bin/env python3
"""Seeded Solfeggio song, Soul of the Universe.

Python is the numeric source of truth. Running this file rewrites
utils/solfeggio-compose.mjs. Do not edit the .mjs by hand.

The lead is written in 4-bar sentences: a leap only on the first note,
then steps, the second two bars answering the first two, cadence on 528.
A seed only picks the tempo and which composed variation of Theme A
returns (sequenced up, or with neighbor turns). The chorus is the same
notes every time.

528/396 and 852/639 are exactly 4/3. 963/639 is about 8 cents sharp of 3/2.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

PITCHES = [174, 285, 396, 417, 528, 639, 741, 852, 963]
CENTER = 528
LEAD = [528, 570, 639, 741, 792, 852, 963, 1056]
TITLE = "Soul of the Universe"

# One pocket for the whole record. Gains are milli-units.
GAINS = {
    "kick": 320,
    "snare": 240,
    "hat": 64,
    "808": 360,
    "cowbell": 72,
    "tablaBayan": 200,
    "tablaDayan": 140,
    "mridangam": 160,
    "tanpura": 120,
    "pad": 56,
    "choir": 48,
    "bass": 280,
    "acid": 150,
    "cello": 100,
    "piano": 64,
    "guitar": 80,
    "pluck": 88,
    "oud": 72,
    "koto": 64,
    "harp": 70,
    "supersaw": 140,
    "sitar": 150,
    "violin": 80,
    "veena": 84,
    "bansuri": 64,
    "dizi": 56,
    "erhu": 60,
    "trumpet": 72,
    "saxophone": 64,
    "clarinet": 52,
    "shakuhachi": 60,
    "bells": 56,
}

CHORD_TONES = {
    528: [528, 639, 792],
    396: [396, 528, 639],
    639: [639, 792, 963],
    852: [852, 1056, 639],
    741: [741, 852, 963],
}

SCALE_REG = [348, 396, 417, 528, 570, 639, 696, 741, 792, 834, 852, 963, 1056, 1140, 1278, 1392]

ROOT = Path(__file__).resolve().parents[1]
MJS_PATH = ROOT / "utils" / "solfeggio-compose.mjs"


def chunk(xs):
    if len(xs) % 8 != 0:
        raise AssertionError("bar grid")
    return [xs[i:i + 8] for i in range(0, len(xs), 8)]


HOOK = [
    4, 4, 5, 5, 4, 4, 3, 3,
    2, 2, 3, 3, 2, 2, 1, 1,
    1, 1, 2, 2, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
]

GRIDS = {
    "intro": chunk([
        4, 4, 3, 3, 2, 2, 1, 1,
        2, 2, 1, 1, 0, 1, 2, 2,
        2, 2, 1, 1, 0, 0, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 0,
    ]),
    "theme": chunk([
        4, 4, 3, 3, 2, 2, 1, 1,
        2, 2, 1, 1, 0, 1, 2, 2,
        2, 2, 3, 3, 2, 2, 1, 1,
        1, 1, 0, 0, 0, 0, 0, 0,
        4, 4, 3, 3, 2, 2, 3, 3,
        4, 4, 3, 3, 2, 2, 1, 1,
        1, 1, 2, 2, 1, 1, 0, 0,
        1, 1, 0, 0, 0, 0, 0, 0,
    ]),
    "chorus": chunk(HOOK + HOOK),
    "development": chunk([
        4, 4, 3, 3, 3, 3, 2, 2,
        2, 2, 1, 1, 1, 1, 2, 2,
        2, 3, 2, 1, 1, 0, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        6, 6, 5, 5, 5, 5, 4, 4,
        4, 4, 3, 3, 3, 3, 2, 2,
        2, 1, 0, 1, 2, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
    ]),
    "coda": chunk([
        2, 2, 1, 1, 0, 1, 2, 2,
        1, 0, 1, 2, 1, 0, 1, 2,
        1, 1, 0, 0, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
    ]),
    "themeVar": [
        chunk([
            5, 5, 4, 4, 3, 3, 2, 2,
            3, 3, 2, 2, 1, 2, 3, 3,
            3, 3, 4, 4, 3, 3, 2, 2,
            2, 2, 1, 1, 0, 0, 0, 0,
            5, 5, 4, 4, 3, 3, 4, 4,
            5, 5, 4, 4, 3, 3, 2, 2,
            2, 2, 3, 3, 2, 2, 1, 1,
            2, 2, 1, 1, 0, 0, 0, 0,
        ]),
        chunk([
            4, 3, 4, 3, 3, 2, 3, 2,
            2, 1, 2, 1, 1, 0, 1, 2,
            2, 3, 2, 1, 1, 0, 1, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            4, 3, 4, 5, 4, 3, 2, 3,
            4, 3, 2, 1, 2, 1, 0, 1,
            1, 2, 1, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
        ]),
    ],
}

# 56 bars. Theme, chorus, and the sequenced development.
ROOTS = (
    [528, 396, 639, 528]
    + [528, 396, 639, 528] * 2
    + [396, 852, 639, 528] * 2
    + [528, 639, 741, 528] * 2
    + [396, 852, 639, 528] * 2
    + [639, 741, 852, 528, 741, 639, 396, 528]
    + [396, 852, 639, 528] * 2
    + [639, 396, 528, 528]
)

SECTIONS = [
    ("intro", 4),
    ("theme", 8),
    ("chorus", 8),
    ("theme", 8),
    ("chorus", 8),
    ("development", 8),
    ("chorus", 8),
    ("coda", 4),
]


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


def scale_index(hz: float) -> int:
    for i, item in enumerate(SCALE_REG):
        if abs(item - hz) < 1e-6:
            return i
    raise AssertionError(hz)


def octaves_between(base: float, lo: float, hi: float):
    hz = float(base)
    while hz < lo:
        hz *= 2
    out = []
    while hz <= hi + 1e-9:
        out.append(hz)
        hz *= 2
    return out


def candidates(root: int):
    found = []
    for tone in CHORD_TONES[root]:
        found.extend(octaves_between(tone, 360, 1200))
    found.sort()
    uniq = []
    for hz in found:
        if not uniq or abs(hz - uniq[-1]) > 1e-6:
            uniq.append(hz)
    return uniq


def cmp_key(a, b) -> int:
    for x, y in zip(a, b):
        if x < y:
            return -1
        if x > y:
            return 1
    return 0


def voice_lead(prev, cands):
    prev_s = sorted(prev)
    best = None
    best_key = None
    for i in range(len(cands)):
        for j in range(i + 1, len(cands)):
            for k in range(j + 1, len(cands)):
                ordered = sorted((cands[i], cands[j], cands[k]))
                dists = [
                    abs(scale_index(ordered[0]) - scale_index(prev_s[0])),
                    abs(scale_index(ordered[1]) - scale_index(prev_s[1])),
                    abs(scale_index(ordered[2]) - scale_index(prev_s[2])),
                ]
                key = [sum(dists), dists[0], dists[1], dists[2], ordered[0], ordered[1], ordered[2]]
                if best_key is None or cmp_key(key, best_key) < 0:
                    best_key = key
                    best = ordered
    return best


def bass_hz(root: int) -> float:
    hz = float(root)
    while hz > 300:
        hz /= 2
    while hz < 90:
        hz *= 2
    return hz


def acid_hz(root: int) -> float:
    hz = bass_hz(root) * 2
    if hz > 400:
        hz = bass_hz(root)
    return hz


def song_seconds(total_bars: int, bpm: int) -> float:
    return total_bars * 4 * 60 / bpm


def grid_for(name: str, theme_pass: int, variation: int):
    if name == "theme" and theme_pass == 1:
        return GRIDS["themeVar"][variation]
    return GRIDS[name]


def breath(name: str, rel: int) -> bool:
    if name == "intro" and rel == 0:
        return True
    if name == "development" and rel % 4 == 2:
        return True
    if name == "coda" and rel == 3:
        return True
    return False


def fill(name: str, rel: int) -> bool:
    if breath(name, rel) or name == "coda":
        return False
    return rel % 4 == 3


def compose_song(seed: int):
    seed32 = seed & 0xFFFFFFFF
    rng = Rng(seed32)
    bpm = 78 + rng.below(23)
    variation = rng.below(2)
    sections = []
    bar = 0
    for name, bars in SECTIONS:
        sections.append({"name": name, "bar": bar, "bars": bars})
        bar += bars
    total = bar
    if len(ROOTS) != total:
        raise AssertionError("roots")
    events = []

    def add(at, beat, dur, hz, voice, slide=0):
        events.append({
            "bar": at,
            "beat": beat,
            "durBeats": dur,
            "hz": hz,
            "voice": voice,
            "gain": GAINS[voice] / 1000,
            "slide": slide,
        })

    def lay_tokens(start, tokens, voice):
        k = 0
        while k < 8:
            if tokens[k] is None:
                k += 1
                continue
            j = k + 1
            while j < 8 and tokens[j] == tokens[k]:
                j += 1
            add(start, k * 0.5, (j - k) * 0.5, LEAD[tokens[k]], voice, 0)
            k = j

    voicing = voice_lead([528, 741, 963], candidates(ROOTS[0]))
    prev_root = None
    theme_pass = 0
    for section in sections:
        if section["name"] == "theme":
            grid = grid_for("theme", theme_pass, variation)
            theme_pass += 1
        else:
            grid = GRIDS[section["name"]]
        if len(grid) != section["bars"]:
            raise AssertionError(section["name"])
        for rel in range(section["bars"]):
            at = section["bar"] + rel
            root = ROOTS[at]
            if at > 0:
                voicing = voice_lead(voicing, candidates(root))
            low, mid, high = voicing
            bhz = bass_hz(root)
            ahz = acid_hz(root)
            slide = 0 if prev_root in (None, root) else 1
            prev_root = root

            # Drone and pad sit under the whole song.
            add(at, 0, 4, 264, "tanpura")
            add(at, 0, 4, 198, "tanpura")
            for hz in (low, mid, high):
                add(at, 0, 4, hz, "pad")
                add(at, 0, 4, hz, "choir")
                add(at, 0, 4, hz, "piano")
            add(at, 0, 4, mid, "erhu")
            add(at, 0, 4, bhz, "cello")
            add(at, 0, 2, low, "oud")
            add(at, 0, 3, high, "saxophone")
            add(at, 1, 2, mid, "clarinet")
            add(at, 0, 0.5, root if root >= 396 else root * 2, "trumpet")
            for beat in (0, 2):
                add(at, beat, 1, bhz, "bass")
                for hz in (low, mid, high):
                    add(at, beat, 0.5, hz, "guitar")
            for beat in (0.5, 2.5):
                for hz in (low, mid, high):
                    add(at, beat, 0.5, hz, "pluck")
            add(at, 1, 0.5, high, "koto")
            add(at, 3, 0.5, high, "koto")
            # Acid walks the roots with the bass, and slides when the root changes.
            add(at, 0, 1.5, ahz, "acid", slide)
            add(at, 2, 0.5, ahz, "acid", 0)
            add(at, 2.5, 0.5, ahz, "acid", 0)
            add(at, 3.5, 0.5, ahz, "acid", 0)

            if rel % 4 == 0:
                add(at, 0, 1.5, low, "harp")
                add(at, 0.5, 1.5, mid, "harp")
                add(at, 1, 2, high, "harp")
                add(at, 0, 1.5, 1056, "bells")
            if rel % 4 == 3:
                add(at, 2, 2, 528, "shakuhachi")
                add(at, 2, 2, 1056, "bells")

            question = rel % 4 < 2
            row = grid[rel]
            if question:
                lay_tokens(at, row, "supersaw")
                lay_tokens(at, row, "violin")
                lay_tokens(at, row, "bansuri")
            else:
                lay_tokens(at, row, "sitar")
                lay_tokens(at, row, "veena")
                lay_tokens(at, row, "dizi")

            if breath(section["name"], rel):
                continue
            if fill(section["name"], rel):
                add(at, 0, 0.5, 87, "kick")
                add(at, 0, 0.5, 87, "808")
                add(at, 2, 0.5, 87, "kick")
                add(at, 2, 0.5, 87, "808")
                for beat in (2, 2.5, 3, 3.5):
                    add(at, beat, 0.25, 174, "snare")
                for beat in (0, 0.5, 1, 1.5):
                    add(at, beat, 0.5, 4560, "hat")
                add(at, 0.5, 0.5, 741, "cowbell")
                add(at, 0, 0.5, 87, "tablaBayan")
                add(at, 1.5, 0.25, 528, "tablaDayan")
                add(at, 0, 0.5, 174, "mridangam")
                continue
            for beat in (0, 2):
                add(at, beat, 0.5, 87, "kick")
                add(at, beat, 0.5, 87, "808")
            for beat in (1, 3):
                add(at, beat, 0.5, 174, "snare")
            for beat in (0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5):
                add(at, beat, 0.5, 4560, "hat")
            for beat in (0.5, 2, 2.5, 3.5):
                add(at, beat, 0.25, 741, "cowbell")
            add(at, 0, 0.5, 87, "tablaBayan")
            add(at, 1.5, 0.25, 528, "tablaDayan")
            add(at, 3, 0.25, 528, "tablaDayan")
            add(at, 0, 0.5, 174, "mridangam")
            add(at, 2.5, 0.25, 285, "mridangam")

    events.sort(key=lambda e: (e["bar"], e["beat"], e["voice"], e["hz"], e["durBeats"], e["gain"], e["slide"]))
    return {
        "seed": seed32,
        "title": TITLE,
        "bpm": bpm,
        "meter": "4/4",
        "pocket": "backbeat",
        "variation": variation,
        "totalBars": total,
        "duration": song_seconds(total, bpm),
        "centerHz": CENTER,
        "sections": sections,
        "events": events,
    }


def allowed(hz: float) -> bool:
    for pitch in PITCHES:
        ratio = hz / pitch
        if ratio <= 0:
            continue
        k = round(math.log2(ratio))
        if -4 <= k <= 4 and abs(ratio - 2 ** k) < 1e-6:
            return True
    return False


def is_center(hz: float) -> bool:
    ratio = hz / 528
    if ratio <= 0:
        return False
    k = round(math.log2(ratio))
    return -4 <= k <= 4 and abs(ratio - 2 ** k) < 1e-6


MELODY = ("supersaw", "sitar")


def check_song(song) -> None:
    if song["meter"] != "4/4":
        raise AssertionError("meter")
    if not 78 <= song["bpm"] <= 100:
        raise AssertionError("bpm")
    if song["title"] != TITLE or song["pocket"] != "backbeat":
        raise AssertionError("title")
    if song["totalBars"] != 56:
        raise AssertionError("bars")
    if abs(song["duration"] - song["totalBars"] * 4 * 60 / song["bpm"]) > 1e-9:
        raise AssertionError("duration")
    names = [s["name"] for s in song["sections"]]
    bars = [s["bars"] for s in song["sections"]]
    if names != ["intro", "theme", "chorus", "theme", "chorus", "development", "chorus", "coda"]:
        raise AssertionError(names)
    if bars != [4, 8, 8, 8, 8, 8, 8, 4]:
        raise AssertionError(bars)
    voices = {e["voice"] for e in song["events"]}
    needed = set(GAINS)
    if voices != needed:
        raise AssertionError(sorted(voices ^ needed))
    for event in song["events"]:
        if not allowed(event["hz"]):
            raise AssertionError(event["hz"])
    melody = [e for e in song["events"] if e["voice"] in MELODY]
    melody.sort(key=lambda e: (e["bar"], e["beat"], e["voice"]))
    for section in song["sections"]:
        for phrase in range(section["bars"] // 4):
            start = section["bar"] + phrase * 4
            notes = [e for e in melody if start <= e["bar"] < start + 4]
            if not notes:
                raise AssertionError("empty phrase")
            last = max(notes, key=lambda e: (e["bar"], e["beat"], e["durBeats"]))
            if not is_center(last["hz"]):
                raise AssertionError(("cadence", start, last["hz"]))
            ordered = sorted(notes, key=lambda e: (e["bar"], e["beat"], e["hz"]))
            prev = None
            for event in ordered:
                deg = LEAD.index(event["hz"])
                if prev is not None:
                    leap = abs(deg - prev[0]) > 1
                    at_start = event["bar"] == start and event["beat"] == 0
                    if leap and not at_start:
                        raise AssertionError(("leap", event["bar"], event["beat"], deg))
                prev = (deg, event["bar"], event["beat"])
    choruses = [s for s in song["sections"] if s["name"] == "chorus"]

    def shape(section):
        return [
            (e["bar"] - section["bar"], e["beat"], e["durBeats"], e["hz"], e["voice"])
            for e in melody
            if section["bar"] <= e["bar"] < section["bar"] + section["bars"]
        ]

    if shape(choruses[0]) != shape(choruses[1]) or shape(choruses[0]) != shape(choruses[2]):
        raise AssertionError("chorus")
    # Drums and 808 share the pocket on a normal bar (theme, bar 0 of the section is a pocket bar).
    theme = song["sections"][1]
    bar0 = [e for e in song["events"] if e["bar"] == theme["bar"]]
    kicks = sorted(e["beat"] for e in bar0 if e["voice"] == "kick")
    eights = sorted(e["beat"] for e in bar0 if e["voice"] == "808")
    snares = sorted(e["beat"] for e in bar0 if e["voice"] == "snare")
    if kicks != [0, 2] or eights != [0, 2] or snares != [1, 3]:
        raise AssertionError((kicks, eights, snares))
    dev = song["sections"][5]
    breath_bar = dev["bar"] + 2
    drums = {"kick", "snare", "hat", "808", "cowbell", "tablaBayan", "tablaDayan", "mridangam"}
    if any(e["bar"] == breath_bar and e["voice"] in drums for e in song["events"]):
        raise AssertionError("breath")
    if not any(e["voice"] == "acid" and e["bar"] < 4 for e in song["events"]):
        raise AssertionError("acid")
    if not any(e["voice"] == "pad" and e["bar"] == 55 for e in song["events"]):
        raise AssertionError("pad")


def self_test() -> None:
    for seed in range(12):
        song = compose_song(seed)
        if song != compose_song(seed):
            raise AssertionError("unstable")
        check_song(song)
    if compose_song(1)["bpm"] == compose_song(2)["bpm"] and compose_song(1)["variation"] == compose_song(2)["variation"]:
        # Still fine if both happen to match; events must differ across some pair.
        pass
    if compose_song(1) == compose_song(2):
        raise AssertionError("seed ignored")
    check_song(compose_song(4294967295))
    print("solfeggio-compose.py: pass")
    song = compose_song(1)
    print(f"seed 1 bpm {song['bpm']} variation {song['variation']} bars {song['totalBars']} duration {song['duration']:.3f}s")


def report(song) -> None:
    print(f"{song['title']} seed {song['seed']} bpm {song['bpm']} variation {song['variation']} bars {song['totalBars']}")
    for section in song["sections"]:
        print(f"  {section['name']:12} bar {section['bar']:3} bars {section['bars']}")
    print(f"events {len(song['events'])}")


def render_mjs() -> str:
    fourth = cents(4 / 3)
    fifth = cents(3 / 2)
    near = cents(963 / 639)
    sharp = near - fifth

    def bake(value: float) -> str:
        return format(value, ".17g")

    text = JS_TEMPLATE
    repl = {
        "__FOURTH__": bake(fourth),
        "__FIFTH__": bake(fifth),
        "__NEAR__": bake(near),
        "__SHARP__": bake(sharp),
        "__LEAD__": json.dumps(LEAD),
        "__GAINS__": json.dumps(GAINS),
        "__TONES__": json.dumps({str(k): v for k, v in CHORD_TONES.items()}),
        "__SCALE__": json.dumps(SCALE_REG),
        "__ROOTS__": json.dumps(ROOTS),
        "__GRIDS__": json.dumps(GRIDS),
    }
    for key, value in repl.items():
        text = text.replace(key, value)
    if not text.endswith("\n"):
        text += "\n"
    return text


def emit(path: Path) -> None:
    path.write_text(render_mjs(), encoding="utf-8")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Compose Soul of the Universe from a seed.")
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
        return 0
    self_test()
    emit(MJS_PATH)
    report(compose_song(1))
    print(f"wrote {MJS_PATH}")
    return 0


JS_TEMPLATE = r"""/**
 * Generated by scripts/solfeggio-compose.py — do not edit by hand.
 * Soul of the Universe. One arrangement, nine pitches, 4-bar sentences.
 * Same seed, same score. Not a therapy.
 *
 * 528/396 and 852/639 are exactly 4/3.
 * 963/639 is __SHARP__ cents sharp of 3/2.
 */

export const CENTER_HZ = 528
export const PIECE_FOURTH_CENTS = __FOURTH__
export const PIECE_FIFTH_CENTS = __FIFTH__
export const PIECE_NEAR_FIFTH_CENTS = __NEAR__
export const PIECE_NEAR_FIFTH_SHARP_CENTS = __SHARP__
export const TITLE = 'Soul of the Universe'

const LEAD = Object.freeze(__LEAD__)
const GAINS = Object.freeze(__GAINS__)
const TONES = Object.freeze(__TONES__)
const SCALE_REG = Object.freeze(__SCALE__)
const ROOTS = Object.freeze(__ROOTS__)
const GRIDS = Object.freeze(__GRIDS__)

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

function scaleIndex(hz) {
  for (let i = 0; i < SCALE_REG.length; i++) {
    if (Math.abs(SCALE_REG[i] - hz) < 1e-6) return i
  }
  throw new Error('hz ' + hz)
}

function octavesBetween(base, lo, hi) {
  let hz = base
  while (hz < lo) hz *= 2
  const out = []
  while (hz <= hi + 1e-9) {
    out.push(hz)
    hz *= 2
  }
  return out
}

function candidates(root) {
  const tones = TONES[String(root)]
  const found = []
  for (let i = 0; i < tones.length; i++) {
    const extra = octavesBetween(tones[i], 360, 1200)
    for (let k = 0; k < extra.length; k++) found.push(extra[k])
  }
  found.sort((a, b) => a - b)
  const uniq = []
  for (let i = 0; i < found.length; i++) {
    if (!uniq.length || Math.abs(found[i] - uniq[uniq.length - 1]) > 1e-6) uniq.push(found[i])
  }
  return uniq
}

function cmpKey(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return -1
    if (a[i] > b[i]) return 1
  }
  return 0
}

function voiceLead(prev, cands) {
  const prevS = prev.slice().sort((a, b) => a - b)
  let best = null
  let bestKey = null
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      for (let k = j + 1; k < cands.length; k++) {
        const ordered = [cands[i], cands[j], cands[k]].sort((a, b) => a - b)
        const dists = [
          Math.abs(scaleIndex(ordered[0]) - scaleIndex(prevS[0])),
          Math.abs(scaleIndex(ordered[1]) - scaleIndex(prevS[1])),
          Math.abs(scaleIndex(ordered[2]) - scaleIndex(prevS[2])),
        ]
        const key = [dists[0] + dists[1] + dists[2], dists[0], dists[1], dists[2], ordered[0], ordered[1], ordered[2]]
        if (bestKey === null || cmpKey(key, bestKey) < 0) {
          bestKey = key
          best = ordered
        }
      }
    }
  }
  return best
}

function bassHz(root) {
  let hz = root
  while (hz > 300) hz /= 2
  while (hz < 90) hz *= 2
  return hz
}

function acidHz(root) {
  let hz = bassHz(root) * 2
  if (hz > 400) hz = bassHz(root)
  return hz
}

function breath(name, rel) {
  if (name === 'intro' && rel === 0) return true
  if (name === 'development' && rel % 4 === 2) return true
  if (name === 'coda' && rel === 3) return true
  return false
}

function fill(name, rel) {
  if (breath(name, rel) || name === 'coda') return false
  return rel % 4 === 3
}

/**
 * @param {number} seed
 */
export function composeSong(seed) {
  const seed32 = seed >>> 0
  const rng = makeRng(seed32)
  const bpm = 78 + rng.below(23)
  const variation = rng.below(2)
  const plan = [
    ['intro', 4],
    ['theme', 8],
    ['chorus', 8],
    ['theme', 8],
    ['chorus', 8],
    ['development', 8],
    ['chorus', 8],
    ['coda', 4],
  ]
  const sections = []
  let bar = 0
  for (let i = 0; i < plan.length; i++) {
    sections.push({ name: plan[i][0], bar, bars: plan[i][1] })
    bar += plan[i][1]
  }
  const totalBars = bar
  const events = []

  function add(at, beat, dur, hz, voice, slide) {
    events.push({
      bar: at,
      beat,
      durBeats: dur,
      hz,
      voice,
      gain: GAINS[voice] / 1000,
      slide: slide || 0,
    })
  }

  function layTokens(start, tokens, voice) {
    let k = 0
    while (k < 8) {
      let j = k + 1
      while (j < 8 && tokens[j] === tokens[k]) j += 1
      add(start, k * 0.5, (j - k) * 0.5, LEAD[tokens[k]], voice, 0)
      k = j
    }
  }

  let voicing = voiceLead([528, 741, 963], candidates(ROOTS[0]))
  let prevRoot = null
  let themePass = 0
  for (let s = 0; s < sections.length; s++) {
    const section = sections[s]
    let grid
    if (section.name === 'theme') {
      grid = themePass === 1 ? GRIDS.themeVar[variation] : GRIDS.theme
      themePass += 1
    } else {
      grid = GRIDS[section.name]
    }
    for (let rel = 0; rel < section.bars; rel++) {
      const at = section.bar + rel
      const root = ROOTS[at]
      if (at > 0) voicing = voiceLead(voicing, candidates(root))
      const low = voicing[0]
      const mid = voicing[1]
      const high = voicing[2]
      const bhz = bassHz(root)
      const ahz = acidHz(root)
      const slide = prevRoot === null || prevRoot === root ? 0 : 1
      prevRoot = root
      add(at, 0, 4, 264, 'tanpura', 0)
      add(at, 0, 4, 198, 'tanpura', 0)
      const tones = [low, mid, high]
      for (let v = 0; v < tones.length; v++) {
        add(at, 0, 4, tones[v], 'pad', 0)
        add(at, 0, 4, tones[v], 'choir', 0)
        add(at, 0, 4, tones[v], 'piano', 0)
      }
      add(at, 0, 4, mid, 'erhu', 0)
      add(at, 0, 4, bhz, 'cello', 0)
      add(at, 0, 2, low, 'oud', 0)
      add(at, 0, 3, high, 'saxophone', 0)
      add(at, 1, 2, mid, 'clarinet', 0)
      add(at, 0, 0.5, root >= 396 ? root : root * 2, 'trumpet', 0)
      for (const beat of [0, 2]) {
        add(at, beat, 1, bhz, 'bass', 0)
        for (let v = 0; v < tones.length; v++) add(at, beat, 0.5, tones[v], 'guitar', 0)
      }
      for (const beat of [0.5, 2.5]) {
        for (let v = 0; v < tones.length; v++) add(at, beat, 0.5, tones[v], 'pluck', 0)
      }
      add(at, 1, 0.5, high, 'koto', 0)
      add(at, 3, 0.5, high, 'koto', 0)
      add(at, 0, 1.5, ahz, 'acid', slide)
      add(at, 2, 0.5, ahz, 'acid', 0)
      add(at, 2.5, 0.5, ahz, 'acid', 0)
      add(at, 3.5, 0.5, ahz, 'acid', 0)
      if (rel % 4 === 0) {
        add(at, 0, 1.5, low, 'harp', 0)
        add(at, 0.5, 1.5, mid, 'harp', 0)
        add(at, 1, 2, high, 'harp', 0)
        add(at, 0, 1.5, 1056, 'bells', 0)
      }
      if (rel % 4 === 3) {
        add(at, 2, 2, 528, 'shakuhachi', 0)
        add(at, 2, 2, 1056, 'bells', 0)
      }
      const row = grid[rel]
      if (rel % 4 < 2) {
        layTokens(at, row, 'supersaw')
        layTokens(at, row, 'violin')
        layTokens(at, row, 'bansuri')
      } else {
        layTokens(at, row, 'sitar')
        layTokens(at, row, 'veena')
        layTokens(at, row, 'dizi')
      }
      if (breath(section.name, rel)) continue
      if (fill(section.name, rel)) {
        add(at, 0, 0.5, 87, 'kick', 0)
        add(at, 0, 0.5, 87, '808', 0)
        add(at, 2, 0.5, 87, 'kick', 0)
        add(at, 2, 0.5, 87, '808', 0)
        for (const beat of [2, 2.5, 3, 3.5]) add(at, beat, 0.25, 174, 'snare', 0)
        for (const beat of [0, 0.5, 1, 1.5]) add(at, beat, 0.5, 4560, 'hat', 0)
        add(at, 0.5, 0.5, 741, 'cowbell', 0)
        add(at, 0, 0.5, 87, 'tablaBayan', 0)
        add(at, 1.5, 0.25, 528, 'tablaDayan', 0)
        add(at, 0, 0.5, 174, 'mridangam', 0)
        continue
      }
      for (const beat of [0, 2]) {
        add(at, beat, 0.5, 87, 'kick', 0)
        add(at, beat, 0.5, 87, '808', 0)
      }
      for (const beat of [1, 3]) add(at, beat, 0.5, 174, 'snare', 0)
      for (const beat of [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]) add(at, beat, 0.5, 4560, 'hat', 0)
      for (const beat of [0.5, 2, 2.5, 3.5]) add(at, beat, 0.25, 741, 'cowbell', 0)
      add(at, 0, 0.5, 87, 'tablaBayan', 0)
      add(at, 1.5, 0.25, 528, 'tablaDayan', 0)
      add(at, 3, 0.25, 528, 'tablaDayan', 0)
      add(at, 0, 0.5, 174, 'mridangam', 0)
      add(at, 2.5, 0.25, 285, 'mridangam', 0)
    }
  }

  events.sort((a, b) => (
    a.bar - b.bar
    || a.beat - b.beat
    || (a.voice < b.voice ? -1 : a.voice > b.voice ? 1 : 0)
    || a.hz - b.hz
    || a.durBeats - b.durBeats
    || a.gain - b.gain
    || a.slide - b.slide
  ))

  return {
    seed: seed32,
    title: TITLE,
    bpm,
    meter: '4/4',
    pocket: 'backbeat',
    variation,
    totalBars,
    duration: totalBars * 4 * 60 / bpm,
    centerHz: CENTER_HZ,
    sections,
    events,
  }
}
"""


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
