#!/usr/bin/env python3
"""Squash sprite set. One skeleton, rotated for headings. Burst cuts that same sprite apart."""

from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
SHEETS = ROOT / "sheets"
FRAMES = ROOT / "frames"
PREVIEW = ROOT / "preview"
for folder in (SHEETS, FRAMES, PREVIEW):
    folder.mkdir(parents=True, exist_ok=True)

CELL = 192
PIVOT = CELL // 2
CRAWL_FRAMES = 8
HEADINGS = 8

PAPER = (251, 248, 239, 255)
PAPER_DEEP = (240, 234, 216, 255)
INK = (22, 22, 24, 255)
YELLOW = (255, 212, 59, 255)
DARK_PAPER = (18, 18, 20, 255)
DARK_INK = (237, 230, 214, 255)
DARK_YELLOW = (232, 197, 71, 255)

SHELL = (88, 62, 40, 255)
SHELL_EDGE = (28, 20, 14, 255)
BELLY = (196, 164, 120, 255)
LEG = (28, 20, 14, 255)
EYE = (22, 22, 24, 255)

NEON = (198, 255, 58, 255)
NEON_DIM = (140, 210, 50, 255)
MAGENTA = (255, 45, 140, 255)
RADIO_BODY = (16, 22, 12, 255)
RADIO_EDGE = (210, 255, 90, 255)


def new_cell() -> Image.Image:
    return Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))


def to_px(x: float, y: float, bob: float = 0.0) -> tuple[float, float]:
    return (PIVOT + x, PIVOT - y + bob)


def ellipse(draw: ImageDraw.ImageDraw, cx, cy, rx, ry, fill) -> None:
    draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=fill)


def draw_leg(draw, hip, base_angle, frame, group, color, girth) -> None:
    swing = math.sin((frame / CRAWL_FRAMES) * math.tau + (0.0 if group == 0 else math.pi))
    angle = base_angle + swing * 0.7
    lift = max(0.0, swing)
    femur, tibia = 16, 13
    knee_a = angle + lift * 0.15
    foot_a = angle + 0.55 - lift * 0.35
    hx, hy = hip
    kx = hx + math.cos(knee_a) * femur
    ky = hy + math.sin(knee_a) * femur * (1 - lift * 0.15)
    fx = kx + math.cos(foot_a) * tibia
    fy = ky + math.sin(foot_a) * tibia
    hpx, hpy = to_px(hx, hy)
    kpx, kpy = to_px(kx, ky)
    fpx, fpy = to_px(fx, fy)
    draw.line((hpx, hpy, kpx, kpy), fill=color, width=girth)
    draw.line((kpx, kpy, fpx, fpy), fill=color, width=max(2, girth - 1))
    ellipse(draw, fpx, fpy, 2.2, 2.2, color)


def draw_bug(frame: int, kind: str) -> Image.Image:
    im = new_cell()
    scale = 0.62 if kind == "nymph" else 1.0
    bob = math.sin((frame / CRAWL_FRAMES) * math.tau) * 1.6 * scale
    radio = kind == "radio"
    layer = new_cell()
    d = ImageDraw.Draw(layer)

    shadow = to_px(0, 0, 6)
    ellipse(d, shadow[0], shadow[1], 28, 10, (22, 22, 24, 48))

    if radio:
        pulse = 0.55 + 0.45 * math.sin((frame / CRAWL_FRAMES) * math.tau)
        glow = new_cell()
        gd = ImageDraw.Draw(glow)
        gcx, gcy = to_px(0, 0, bob)
        ellipse(gd, gcx, gcy, 58, 40, (*NEON[:3], int(78 * pulse)))
        ellipse(gd, gcx, gcy, 40, 28, (*MAGENTA[:3], int(48 * pulse)))
        layer.alpha_composite(glow.filter(ImageFilter.GaussianBlur(5)))
        d = ImageDraw.Draw(layer)

    shell = RADIO_BODY if radio else SHELL
    edge = RADIO_EDGE if radio else SHELL_EDGE
    belly = NEON_DIM if radio else BELLY
    leg_c = NEON if radio else LEG
    eye = MAGENTA if radio else EYE
    girth = 4 if radio else 3

    hips = [
        (12, 9, math.radians(55), 0),
        (12, -9, math.radians(-55), 1),
        (1, 12, math.radians(100), 1),
        (1, -12, math.radians(-100), 0),
        (-10, 10, math.radians(145), 0),
        (-10, -10, math.radians(-145), 1),
    ]
    for hx, hy, ang, group in hips[2:]:
        draw_leg(d, (hx, hy), ang, frame, group, leg_c, girth)

    ax, ay = to_px(-6, 0, bob)
    ellipse(d, ax, ay, 22, 15, edge)
    ellipse(d, ax, ay, 19, 12, shell)
    seg = NEON if radio else edge
    d.line((to_px(-2, 0, bob), to_px(-24, 0, bob)), fill=seg, width=2)
    for sx in (-10, -16, -22):
        p1 = to_px(sx, 8, bob)
        p2 = to_px(sx, -8, bob)
        d.arc((min(p1[0], p2[0]), min(p1[1], p2[1]), max(p1[0], p2[0]) + 8, max(p1[1], p2[1])), 200, 340, fill=belly, width=2)

    if radio:
        for sx, sy in ((-8, 5), (-14, -4), (-20, 2)):
            sp = to_px(sx, sy, bob)
            ellipse(d, sp[0], sp[1], 2.4, 2.4, NEON)

    tx, ty = to_px(8, 0, bob)
    ellipse(d, tx, ty, 12, 11, edge)
    ellipse(d, tx, ty, 10, 9, shell)

    for hx, hy, ang, group in hips[:2]:
        draw_leg(d, (hx, hy), ang, frame, group, leg_c, girth)

    hx, hy = to_px(20, 0, bob)
    ellipse(d, hx, hy, 9, 8, edge)
    ellipse(d, hx, hy, 7.5, 6.5, shell)
    for sy in (3.2, -3.2):
        ex, ey = to_px(24, sy, bob)
        ellipse(d, ex, ey, 2.6 if radio else 2.2, 2.8, eye)

    sway = math.sin((frame / CRAWL_FRAMES) * math.tau) * 0.28
    for sign in (1, -1):
        base = to_px(26, sign * 2.5, bob)
        mid_a = sign * math.radians(28 + sway * 40)
        tip_a = sign * math.radians(16 + sway * 50)
        mid = (base[0] + math.cos(mid_a) * 14, base[1] - math.sin(mid_a) * 14)
        tip = (mid[0] + math.cos(tip_a) * 16, mid[1] - math.sin(tip_a) * 16)
        d.line((base, mid, tip), fill=leg_c, width=2)

    if radio:
        for sign in (1, -1):
            root = to_px(14, sign * 6, bob)
            tip = to_px(20, sign * 18, bob)
            d.line((root, tip), fill=NEON, width=3)
            ellipse(d, tip[0], tip[1], 2.6, 2.6, MAGENTA)

    if scale == 1:
        return layer
    scaled = layer.resize((int(CELL * scale), int(CELL * scale)), Image.Resampling.BICUBIC)
    out = new_cell()
    out.alpha_composite(scaled, ((CELL - scaled.width) // 2, (CELL - scaled.height) // 2))
    return out


def squash_layer(src: Image.Image, sx: float, sy: float) -> Image.Image:
    w = max(1, int(CELL * sx))
    h = max(1, int(CELL * sy))
    resized = src.resize((w, h), Image.Resampling.BICUBIC)
    out = new_cell()
    out.alpha_composite(resized, ((CELL - w) // 2, (CELL - h) // 2))
    return out


def shift(layer: Image.Image, ox: int, oy: int) -> Image.Image:
    if ox == 0 and oy == 0:
        return layer
    return layer.transform(
        layer.size,
        Image.Transform.AFFINE,
        (1, 0, -ox, 0, 1, -oy),
        resample=Image.Resampling.NEAREST,
    )


def explode_pixels(src: Image.Image, t: float, kind: str) -> Image.Image:
    """Cut the real sprite into head, abdomen, legs, and core, then move those pixels."""
    out = new_cell()
    d = ImageDraw.Draw(out)
    stain = YELLOW if kind != "radio" else NEON
    ellipse(d, PIVOT, PIVOT + 4, 18 + t * 30, 12 + t * 16, (*stain[:3], int(180 - t * 50)))
    ring = int(14 + t * 36)
    d.ellipse(
        (PIVOT - ring, PIVOT - ring, PIVOT + ring, PIVOT + ring),
        outline=(*stain[:3], int(200 - t * 140)),
        width=3,
    )
    dirs = {
        "head": (26, -2),
        "abdomen": (-24, 0),
        "up": (2, -26),
        "down": (2, 24),
        "core": (0, -6),
        "shadow": (0, 8),
    }
    buckets = {key: new_cell() for key in dirs}
    px = src.load()
    for y in range(CELL):
        for x in range(CELL):
            pixel = px[x, y]
            if pixel[3] < 16:
                continue
            if pixel[3] < 90 and y > PIVOT + 12 and abs(x - PIVOT) < 40:
                key = "shadow"
            elif x > PIVOT + 14:
                key = "head"
            elif x < PIVOT - 8:
                key = "abdomen"
            elif y < PIVOT - 10:
                key = "up"
            elif y > PIVOT + 10:
                key = "down"
            else:
                key = "core"
            buckets[key].putpixel((x, y), pixel)
    for key, layer in buckets.items():
        dx, dy = dirs[key]
        out.alpha_composite(shift(layer, int(round(dx * t)), int(round(dy * t))))
    return out


def burst_frame(i: int, kind: str) -> Image.Image:
    base = draw_bug(0, kind)
    if i == 0:
        return base
    if i == 1:
        return squash_layer(base, 1.2, 0.68)
    if i == 2:
        return squash_layer(base, 1.42, 0.36)
    return explode_pixels(base, (i - 2) / 5, kind)


def flare_frame(i: int) -> Image.Image:
    bug = draw_bug(0, "radio")
    glow = new_cell()
    d = ImageDraw.Draw(glow)
    radius = 20 + i * 5
    ellipse(d, PIVOT, PIVOT, radius, int(radius * 0.82), (*NEON[:3], min(170, 36 + i * 16)))
    if i >= 5:
        ellipse(d, PIVOT, PIVOT, 20 + i * 2, 16 + i * 2, (*YELLOW[:3], 190))
    out = new_cell()
    out.alpha_composite(glow.filter(ImageFilter.GaussianBlur(1.5)))
    if i < 6:
        out.alpha_composite(bug)
        return out
    blown = bug.copy()
    pix = blown.load()
    for y in range(CELL):
        for x in range(CELL):
            r, g, b, a = pix[x, y]
            if a:
                pix[x, y] = (255, 250, 220, a)
    out.alpha_composite(blown)
    return out


def ripple_frame(i: int, color) -> Image.Image:
    im = new_cell()
    d = ImageDraw.Draw(im)
    r = 10 + i * 16
    d.ellipse(
        (PIVOT - r, PIVOT - r, PIVOT + r, PIVOT + r),
        outline=(*color[:3], 230 - i * 45),
        width=max(2, 6 - i),
    )
    if i == 0:
        ellipse(d, PIVOT, PIVOT, 5, 5, (*color[:3], 240))
    return im


def wall_tile(mode: str, variant: str) -> Image.Image:
    size = 128
    im = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    if mode == "light":
        ceramic, grout, speck = (243, 237, 224, 255), (190, 178, 156, 255), (214, 202, 180, 255)
        crack, stain = (120, 104, 84, 255), (255, 212, 59, 100)
    else:
        ceramic, grout, speck = (26, 26, 30, 255), (54, 50, 44, 255), (12, 12, 14, 255)
        crack, stain = (214, 204, 184, 255), (232, 197, 71, 90)
    d.rectangle((0, 0, size - 1, size - 1), fill=ceramic)
    d.rectangle((size - 4, 0, size - 1, size - 1), fill=grout)
    d.rectangle((0, size - 4, size - 1, size - 1), fill=grout)
    rng = random.Random(11 if mode == "light" else 29)
    for _ in range(16):
        x, y = rng.randint(8, size - 18), rng.randint(8, size - 18)
        s = 2 if rng.random() > 0.7 else 1
        d.rectangle((x, y, x + s, y + s), fill=speck)
    if variant == "crack":
        d.line([(28, 36), (48, 44), (60, 70), (78, 74), (96, 98)], fill=crack, width=2)
        d.line([(60, 70), (52, 96)], fill=crack, width=1)
    if variant == "stain":
        ellipse(d, 70, 58, 26, 18, stain)
    return im


def ui_sheet(mode: str):
    if mode == "light":
        ink, yellow, panel = INK, YELLOW, (255, 252, 245, 255)
    else:
        ink, yellow, panel = DARK_INK, DARK_YELLOW, (28, 28, 32, 255)
    cols, rows, cell = 4, 3, 180
    im = Image.new("RGBA", (cols * cell, rows * cell), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    def pause(ox, oy):
        d.rounded_rectangle((ox + 30, oy + 30, ox + 150, oy + 150), 28, fill=panel, outline=ink, width=3)
        d.rounded_rectangle((ox + 62, oy + 58, ox + 82, oy + 122), 4, fill=ink)
        d.rounded_rectangle((ox + 98, oy + 58, ox + 118, oy + 122), 4, fill=ink)

    def play(ox, oy):
        d.rounded_rectangle((ox + 30, oy + 30, ox + 150, oy + 150), 28, fill=yellow, outline=ink, width=3)
        d.polygon([(ox + 72, oy + 52), (ox + 72, oy + 128), (ox + 122, oy + 90)], fill=ink)

    def retry(ox, oy):
        d.rounded_rectangle((ox + 30, oy + 30, ox + 150, oy + 150), 28, fill=panel, outline=ink, width=3)
        d.arc((ox + 58, oy + 52, ox + 122, oy + 116), 30, 300, fill=ink, width=6)
        d.polygon([(ox + 108, oy + 48), (ox + 128, oy + 58), (ox + 110, oy + 74)], fill=ink)

    def sound(ox, oy):
        d.rounded_rectangle((ox + 30, oy + 30, ox + 150, oy + 150), 28, fill=panel, outline=ink, width=3)
        d.polygon(
            [(ox + 58, oy + 74), (ox + 78, oy + 74), (ox + 100, oy + 56), (ox + 100, oy + 124), (ox + 78, oy + 106), (ox + 58, oy + 106)],
            fill=ink,
        )
        d.arc((ox + 104, oy + 68, ox + 132, oy + 112), 300, 60, fill=ink, width=4)

    def score(ox, oy):
        d.rounded_rectangle((ox + 16, oy + 48, ox + 164, oy + 132), 18, fill=panel, outline=ink, width=3)
        d.rectangle((ox + 16, oy + 48, ox + 164, oy + 62), fill=yellow)
        d.rectangle((ox + 32, oy + 84, ox + 92, oy + 96), fill=ink)
        d.rectangle((ox + 32, oy + 104, ox + 70, oy + 112), fill=(*ink[:3], 140))

    def best(ox, oy):
        d.rounded_rectangle((ox + 16, oy + 48, ox + 164, oy + 132), 18, fill=yellow, outline=ink, width=3)
        d.polygon(
            [(ox + 90, oy + 66), (ox + 96, oy + 82), (ox + 114, oy + 84), (ox + 100, oy + 96), (ox + 104, oy + 114),
             (ox + 90, oy + 104), (ox + 76, oy + 114), (ox + 80, oy + 96), (ox + 66, oy + 84), (ox + 84, oy + 82)],
            fill=ink,
        )

    def mark(ox, oy):
        d.rounded_rectangle((ox + 28, oy + 78, ox + 152, oy + 118), 6, fill=ink)
        d.rounded_rectangle((ox + 46, oy + 48, ox + 134, oy + 84), 6, fill=yellow, outline=ink, width=3)

    def danger(ox, oy):
        d.rounded_rectangle((ox + 30, oy + 30, ox + 150, oy + 150), 28, fill=(16, 22, 12, 255), outline=NEON, width=4)
        ellipse(d, ox + 90, oy + 92, 26, 16, RADIO_BODY)
        ellipse(d, ox + 108, oy + 88, 8, 7, NEON)
        ellipse(d, ox + 114, oy + 86, 3, 3, MAGENTA)

    def combo(ox, oy):
        ellipse(d, ox + 90, oy + 90, 22, 22, yellow)
        ellipse(d, ox + 90, oy + 90, 10, 10, ink)

    def tap(ox, oy):
        d.ellipse((ox + 48, oy + 48, ox + 132, oy + 132), outline=ink, width=4)
        ellipse(d, ox + 90, oy + 90, 6, 6, yellow)

    def over(ox, oy):
        d.rounded_rectangle((ox + 12, oy + 28, ox + 168, oy + 152), 16, fill=panel, outline=ink, width=3)
        d.rectangle((ox + 12, oy + 28, ox + 168, oy + 46), fill=ink)
        d.rectangle((ox + 36, oy + 70, ox + 144, oy + 84), fill=yellow)
        d.rectangle((ox + 52, oy + 100, ox + 128, oy + 112), fill=ink)
        d.rectangle((ox + 64, oy + 122, ox + 116, oy + 132), fill=(*ink[:3], 120))

    painters = [pause, play, retry, sound, score, best, mark, danger, combo, tap, over]
    names = ["pause", "play", "retry", "sound", "score", "best", "mark", "danger", "combo", "tap", "over"]
    rects = {}
    for i, paint in enumerate(painters):
        c, r = i % cols, i // cols
        ox, oy = c * cell, r * cell
        paint(ox, oy)
        rects[names[i]] = [ox, oy, cell, cell]
    return im, rects


def sheet_grid(frames: list[Image.Image], columns: int) -> Image.Image:
    rows = math.ceil(len(frames) / columns)
    out = Image.new("RGBA", (columns * CELL, rows * CELL), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        if frame.size != (CELL, CELL):
            raise SystemExit(f"bad cell {frame.size}")
        out.alpha_composite(frame, ((i % columns) * CELL, (i // columns) * CELL))
    return out


def headings_of(kind: str) -> list[Image.Image]:
    frames = []
    for h in range(HEADINGS):
        for f in range(CRAWL_FRAMES):
            bug = draw_bug(f, kind)
            frames.append(bug.rotate(-h * 45, resample=Image.Resampling.BICUBIC, center=(PIVOT, PIVOT)))
    return frames


def opaque_box(im: Image.Image, threshold=12):
    px = im.load()
    minx, miny, maxx, maxy = im.width, im.height, -1, -1
    for y in range(im.height):
        for x in range(im.width):
            if px[x, y][3] > threshold:
                minx, miny = min(minx, x), min(miny, y)
                maxx, maxy = max(maxx, x), max(maxy, y)
    return minx, miny, maxx, maxy


def assert_padding(im: Image.Image, name: str, pad=3):
    cols, rows = im.width // CELL, im.height // CELL
    for r in range(rows):
        for c in range(cols):
            box = opaque_box(im.crop((c * CELL, r * CELL, (c + 1) * CELL, (r + 1) * CELL)))
            if box[2] < 0:
                continue
            if box[0] < pad or box[1] < pad or box[2] > CELL - 1 - pad or box[3] > CELL - 1 - pad:
                raise SystemExit(f"{name} cell {c},{r} touches the crop: {box}")


def assert_centroid_stable(frames: list[Image.Image], name: str, limit=14):
    centers = []
    for im in frames:
        px = im.load()
        sx = sy = n = 0
        for y in range(CELL):
            for x in range(CELL):
                a = px[x, y][3]
                if a > 24:
                    sx += x * a
                    sy += y * a
                    n += a
        if not n:
            raise SystemExit(name + " empty")
        centers.append((sx / n, sy / n))
    for i in range(1, len(centers)):
        if abs(centers[i][0] - centers[i - 1][0]) > limit or abs(centers[i][1] - centers[i - 1][1]) > limit:
            raise SystemExit(f"{name} frame {i} jumped")


def save_east(name: str, frames: list[Image.Image]) -> None:
    folder = FRAMES / name
    folder.mkdir(parents=True, exist_ok=True)
    for i, frame in enumerate(frames):
        frame.save(folder / f"{i:02d}.png")


def main() -> None:
    atlas = {
        "name": "Squash",
        "cell": CELL,
        "pivot": [PIVOT, PIVOT],
        "crawlFps": 16,
        "burstFps": 22,
        "flareFps": 18,
        "headings": "Row is heading. Row 0 faces east. Each next row turns 45 degrees clockwise. Column is crawl frame 0-7. Rotate around the pivot. Do not rotate burst or flare.",
        "hitbox": {
            "body": {"cx": 0, "cy": 0, "rx": 36, "ry": 24, "space": "pixels from pivot, before game scale"},
            "clean": {"cx": 0, "cy": 0, "rx": 16, "ry": 12},
            "radio": {"cx": 0, "cy": 0, "rx": 42, "ry": 30}
        },
        "sheets": {},
    }

    for name, kind in (("roach_crawl", "normal"), ("radio_crawl", "radio"), ("nymph_crawl", "nymph")):
        frames = headings_of(kind)
        assert_centroid_stable(frames[:CRAWL_FRAMES], name)
        sheet = sheet_grid(frames, 8)
        assert_padding(sheet, name, pad=2)
        sheet.save(SHEETS / f"{name}.png")
        save_east(name, frames[:CRAWL_FRAMES])
        atlas["sheets"][name] = {
            "file": f"sheets/{name}.png",
            "columns": 8,
            "rows": 8,
            "framesPerHeading": 8,
            "frame": [CELL, CELL],
        }

    for kind, name in (("normal", "roach_burst"), ("nymph", "nymph_burst")):
        frames = [burst_frame(i, kind) for i in range(8)]
        # Frame 0 must match crawl frame 0 exactly.
        crawl0 = draw_bug(0, kind)
        if list(frames[0].getdata()) != list(crawl0.getdata()):
            raise SystemExit(name + " frame 0 is not crawl frame 0")
        sheet = sheet_grid(frames, 8)
        assert_padding(sheet, name, pad=2)
        sheet.save(SHEETS / f"{name}.png")
        save_east(name, frames)
        atlas["sheets"][name] = {
            "file": f"sheets/{name}.png",
            "columns": 8,
            "rows": 1,
            "frame": [CELL, CELL],
            "note": "0 is the east crawl pose. 1-2 squash that pose. 3-7 move those same pixels apart. Do not rotate.",
        }

    flare = [flare_frame(i) for i in range(8)]
    flare_sheet = sheet_grid(flare, 8)
    assert_padding(flare_sheet, "radio_flare", pad=2)
    flare_sheet.save(SHEETS / "radio_flare.png")
    save_east("radio_flare", flare)
    atlas["sheets"]["radio_flare"] = {
        "file": "sheets/radio_flare.png",
        "columns": 8,
        "rows": 1,
        "frame": [CELL, CELL],
        "note": "Touched a radioactive bug. Not a kill. The bug is not squashed.",
    }

    ripples = [ripple_frame(i, YELLOW) for i in range(4)]
    ripple_sheet = sheet_grid(ripples, 4)
    assert_padding(ripple_sheet, "tap_ripple", pad=4)
    ripple_sheet.save(SHEETS / "tap_ripple.png")
    atlas["sheets"]["tap_ripple"] = {"file": "sheets/tap_ripple.png", "columns": 4, "rows": 1, "frame": [CELL, CELL], "fps": 18}

    for mode in ("light", "dark"):
        for variant in ("plain", "crack", "stain"):
            tile = wall_tile(mode, variant)
            tile.save(SHEETS / f"wall_{mode}_{variant}.png")
            atlas["sheets"][f"wall_{mode}_{variant}"] = {
                "file": f"sheets/wall_{mode}_{variant}.png",
                "tile": [128, 128],
                "seamless": "Grout is the right 4 px and the bottom 4 px.",
            }
        tile = wall_tile(mode, "plain")
        proof = Image.new("RGBA", (128 * 3, 128 * 3), (0, 0, 0, 255))
        for y in range(3):
            for x in range(3):
                proof.alpha_composite(tile, (x * 128, y * 128))
        proof.save(PREVIEW / f"wall_{mode}_seam.png")
        ui, rects = ui_sheet(mode)
        ui.save(SHEETS / f"ui_{mode}.png")
        atlas["sheets"][f"ui_{mode}"] = {"file": f"sheets/ui_{mode}.png", "cell": [180, 180], "rects": rects}

    def strip(frames, label):
        gap = 6
        canvas = Image.new("RGBA", (len(frames) * CELL + gap * (len(frames) - 1), CELL + 22), PAPER)
        ImageDraw.Draw(canvas).text((4, 2), label, fill=INK)
        for i, fr in enumerate(frames):
            canvas.alpha_composite(fr, (i * (CELL + gap), 20))
        return canvas

    parts = [
        strip([draw_bug(i, "normal") for i in range(8)], "roach east 0-7"),
        strip([burst_frame(i, "normal") for i in range(8)], "burst 0-7"),
        strip([draw_bug(i, "radio") for i in range(8)], "radio east 0-7"),
        strip(flare, "flare 0-7"),
        strip([draw_bug(i, "nymph") for i in range(8)], "nymph east 0-7"),
    ]
    contact = Image.new("RGBA", (max(p.width for p in parts), sum(p.height + 8 for p in parts)), PAPER_DEEP)
    y = 0
    for part in parts:
        contact.alpha_composite(part, (0, y))
        y += part.height + 8
    contact.save(PREVIEW / "contact.png")

    row = Image.new("RGBA", (CELL * 8, CELL), (0, 0, 0, 0))
    pose = draw_bug(0, "normal")
    for h in range(8):
        row.alpha_composite(pose.rotate(-h * 45, resample=Image.Resampling.BICUBIC, center=(PIVOT, PIVOT)), (h * CELL, 0))
    row.save(PREVIEW / "headings.png")

    (ROOT / "atlas.json").write_text(json.dumps(atlas, indent=2))
    print("ok", SHEETS)


if __name__ == "__main__":
    main()
