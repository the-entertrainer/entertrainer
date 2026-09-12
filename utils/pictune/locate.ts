import { FINDER, MAX_GRID, MIN_GRID, nearestPalette, QUIET } from "./protocol";
import { PicTuneError } from "./protocol";
import { finderColor } from "./grid";

export interface Finder {
  x: number;
  y: number;
  size: number;
}

function lum(rgba: Uint8ClampedArray, w: number, x: number, y: number): number {
  const o = (y * w + x) * 4;
  return 0.299 * rgba[o]! + 0.587 * rgba[o + 1]! + 0.114 * rgba[o + 2]!;
}

function dark(rgba: Uint8ClampedArray, w: number, x: number, y: number): boolean {
  return lum(rgba, w, x, y) < 96;
}

function ratioOk(runs: number[]): boolean {
  const total = runs[0]! + runs[1]! + runs[2]! + runs[3]! + runs[4]!;
  if (total < 7) return false;
  const m = total / 7;
  const tol = m * 0.7;
  return (
    Math.abs(runs[0]! - m) < tol &&
    Math.abs(runs[1]! - m) < tol &&
    Math.abs(runs[2]! - 3 * m) < tol * 2 &&
    Math.abs(runs[3]! - m) < tol &&
    Math.abs(runs[4]! - m) < tol
  );
}

function crossCheck(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  cx: number,
  y: number,
  runs: number[],
): Finder | null {
  const total = runs[0]! + runs[1]! + runs[2]! + runs[3]! + runs[4]!;
  const module = total / 7;
  const max = Math.round(module * 12);
  const col: number[] = [];
  let last = dark(rgba, w, Math.round(cx), y);
  let count = 1;
  for (let yy = y - 1; yy >= Math.max(0, y - max); yy--) {
    const d = dark(rgba, w, Math.round(cx), yy);
    if (d === last) count++;
    else {
      col.unshift(count);
      last = d;
      count = 1;
    }
  }
  col.unshift(count);
  last = dark(rgba, w, Math.round(cx), y);
  count = 0;
  for (let yy = y; yy < Math.min(h, y + max); yy++) {
    const d = dark(rgba, w, Math.round(cx), yy);
    if (d === last) count++;
    else {
      col.push(count);
      last = d;
      count = 1;
    }
  }
  col.push(count);
  for (let i = 0; i + 4 < col.length; i++) {
    const slice = col.slice(i, i + 5);
    if (!ratioOk(slice)) continue;
    const t = slice[0]! + slice[1]! + slice[2]! + slice[3]! + slice[4]!;
    const centerY = (() => {
      let acc = 0;
      for (let k = 0; k < i; k++) acc += col[k]!;
      const origin = y - Math.min(y, max);
      return origin + acc + slice[0]! + slice[1]! + slice[2]! / 2;
    })();
    return { x: cx, y: centerY, size: t };
  }
  return null;
}

function cluster(finders: Finder[]): Finder[] {
  const out: Finder[] = [];
  for (const f of finders) {
    const hit = out.find((o) => Math.hypot(o.x - f.x, o.y - f.y) < f.size * 0.6);
    if (hit) {
      hit.x = (hit.x + f.x) / 2;
      hit.y = (hit.y + f.y) / 2;
      hit.size = (hit.size + f.size) / 2;
    } else out.push({ ...f });
  }
  return out;
}

function orderFinders(a: Finder, b: Finder, c: Finder): [Finder, Finder, Finder] {
  const d = (p: Finder, q: Finder) => Math.hypot(p.x - q.x, p.y - q.y);
  const ab = d(a, b),
    ac = d(a, c),
    bc = d(b, c);
  let tl: Finder, other1: Finder, other2: Finder;
  if (ab >= ac && ab >= bc) {
    tl = c;
    other1 = a;
    other2 = b;
  } else if (ac >= ab && ac >= bc) {
    tl = b;
    other1 = a;
    other2 = c;
  } else {
    tl = a;
    other1 = b;
    other2 = c;
  }
  // Screen-space (y down): TL→right × TL→down is positive, so the right-hand
  // finder is the one whose TL→vec has a positive cross with the other.
  const cross = (other1.x - tl.x) * (other2.y - tl.y) - (other1.y - tl.y) * (other2.x - tl.x);
  const tr = cross > 0 ? other1 : other2;
  const bl = cross > 0 ? other2 : other1;
  return [tl, tr, bl];
}

function scoreFinder(rgba: Uint8ClampedArray, w: number, h: number, f: Finder): number {
  const m = f.size / 7;
  const x0 = f.x - 3.5 * m;
  const y0 = f.y - 3.5 * m;
  let ok = 0;
  for (let ly = 0; ly < 7; ly++) {
    for (let lx = 0; lx < 7; lx++) {
      const xx = Math.round(x0 + (lx + 0.5) * m);
      const yy = Math.round(y0 + (ly + 0.5) * m);
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const expectDark = finderColor(lx, ly) === 0;
      if (dark(rgba, w, xx, yy) === expectDark) ok++;
    }
  }
  return ok / 49;
}

function refineFinder(rgba: Uint8ClampedArray, w: number, h: number, f: Finder, size = f.size): Finder {
  let best: Finder = { x: f.x, y: f.y, size };
  let bestS = scoreFinder(rgba, w, h, best);
  const coarse = Math.max(2, Math.round(size / 18));
  for (let dy = -10; dy <= 10; dy += coarse) {
    for (let dx = -10; dx <= 10; dx += coarse) {
      const cand = { x: f.x + dx, y: f.y + dy, size };
      const s = scoreFinder(rgba, w, h, cand);
      if (s > bestS) {
        bestS = s;
        best = cand;
      }
    }
  }
  for (let dy = -2; dy <= 2; dy += 0.5) {
    for (let dx = -2; dx <= 2; dx += 0.5) {
      const cand = { x: best.x + dx, y: best.y + dy, size };
      const s = scoreFinder(rgba, w, h, cand);
      if (s > bestS) {
        bestS = s;
        best = cand;
      }
    }
  }
  return best;
}

function sampleRgb(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  x: number,
  y: number,
): [number, number, number] {
  if (x < 0 || y < 0 || x >= w - 1 || y >= h - 1) {
    const xx = Math.max(0, Math.min(w - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(h - 1, Math.round(y)));
    const o = (yy * w + xx) * 4;
    return [rgba[o]!, rgba[o + 1]!, rgba[o + 2]!];
  }
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const at = (xx: number, yy: number) => {
    const o = (yy * w + xx) * 4;
    return [rgba[o]!, rgba[o + 1]!, rgba[o + 2]!] as const;
  };
  const p00 = at(x0, y0);
  const p10 = at(x0 + 1, y0);
  const p01 = at(x0, y0 + 1);
  const p11 = at(x0 + 1, y0 + 1);
  const mix = (a: number, b: number, t: number) => a * (1 - t) + b * t;
  return [
    mix(mix(p00[0], p10[0], fx), mix(p01[0], p11[0], fx), fy),
    mix(mix(p00[1], p10[1], fx), mix(p01[1], p11[1], fx), fy),
    mix(mix(p00[2], p10[2], fx), mix(p01[2], p11[2], fx), fy),
  ];
}

export function findFinders(rgba: Uint8ClampedArray, w: number, h: number): Finder[] {
  const raw: Finder[] = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 400));
  for (let y = 0; y < h; y += step) {
    const runs = [0, 0, 0, 0, 0];
    let state = 0;
    let last = dark(rgba, w, 0, y);
    for (let x = 0; x < w; x++) {
      const d = dark(rgba, w, x, y);
      if (d === last) {
        runs[state]!++;
        continue;
      }
      if (state === 4) {
        if (ratioOk(runs)) {
          const total = runs[0]! + runs[1]! + runs[2]! + runs[3]! + runs[4]!;
          const cx = x - total + runs[0]! + runs[1]! + runs[2]! / 2;
          const hit = crossCheck(rgba, w, h, cx, y, runs);
          if (hit) raw.push(hit);
        }
        runs[0] = runs[1]!;
        runs[1] = runs[2]!;
        runs[2] = runs[3]!;
        runs[3] = runs[4]!;
        runs[4] = 1;
        last = d;
        continue;
      } else {
        state++;
        runs[state] = 1;
      }
      last = d;
    }
  }

  const grouped = cluster(raw)
    .map((f) => ({ ...f, s: scoreFinder(rgba, w, h, f) }))
    .filter((f) => f.size > 14 && f.s > 0.78)
    .sort((a, b) => b.s - a.s || b.size - a.size);

  const pickTriple = (list: Finder[]): Finder[] | null => {
    if (list.length < 3) return null;
    let best: Finder[] | null = null;
    let bestScore = 0.4;
    const top = list.slice(0, 8);
    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        for (let k = j + 1; k < top.length; k++) {
          const [tl, tr, bl] = orderFinders(top[i]!, top[j]!, top[k]!);
          const dx = Math.hypot(tr.x - tl.x, tr.y - tl.y);
          const dy = Math.hypot(bl.x - tl.x, bl.y - tl.y);
          const angle =
            ((tr.x - tl.x) * (bl.x - tl.x) + (tr.y - tl.y) * (bl.y - tl.y)) / (dx * dy || 1);
          const ratio = dx / (dy || 1);
          const score = Math.abs(angle) * 4 + Math.abs(1 - ratio);
          if (score < bestScore) {
            bestScore = score;
            best = [tl, tr, bl];
          }
        }
      }
    }
    return best;
  };

  const completePair = (a: Finder, b: Finder): Finder[] | null => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (Math.hypot(dx, dy) < 40) return null;
    const size = (a.size + b.size) / 2;
    const guesses: Finder[] = [
      { x: a.x - dy, y: a.y + dx, size },
      { x: a.x + dy, y: a.y - dx, size },
      { x: b.x - dy, y: b.y + dx, size },
      { x: b.x + dy, y: b.y - dx, size },
    ];
    let best: Finder | null = null;
    let bestS = 0.58;
    for (const g of guesses) {
      if (g.x < 8 || g.y < 8 || g.x >= w - 8 || g.y >= h - 8) continue;
      if (Math.hypot(g.x - a.x, g.y - a.y) < size || Math.hypot(g.x - b.x, g.y - b.y) < size) continue;
      const s = scoreFinder(rgba, w, h, g);
      if (s > bestS) {
        bestS = s;
        best = g;
      }
    }
    return best ? orderFinders(a, b, best) : null;
  };

  const triple = pickTriple(grouped);
  if (triple) return triple;

  let pair: [Finder, Finder] | null = null;
  let far = 0;
  const top = grouped.slice(0, 6);
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const d = Math.hypot(top[i]!.x - top[j]!.x, top[i]!.y - top[j]!.y);
      if (d > far) {
        far = d;
        pair = [top[i]!, top[j]!];
      }
    }
  }
  if (pair) {
    const done = completePair(pair[0], pair[1]);
    if (done) return done;
  }
  return grouped.slice(0, 3);
}

export function sampleGrid(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  finders: Finder[],
): { grid: Uint8Array; n: number } {
  if (finders.length < 3) throw new PicTuneError("couldn't read this pictune. try a clearer photo.");
  const [tl0, tr0, bl0] = orderFinders(finders[0]!, finders[1]!, finders[2]!);
  const side = Math.hypot(tr0.x - tl0.x, tr0.y - tl0.y);
  let bestN = 0;
  let bestScore = 0;
  for (let cand = MIN_GRID; cand <= MAX_GRID; cand += 8) {
    const module = side / (cand - FINDER);
    const size = module * FINDER;
    const s =
      scoreFinder(rgba, w, h, { x: tl0.x, y: tl0.y, size }) +
      scoreFinder(rgba, w, h, { x: tr0.x, y: tr0.y, size }) +
      scoreFinder(rgba, w, h, { x: bl0.x, y: bl0.y, size });
    if (s > bestScore) {
      bestScore = s;
      bestN = cand;
    }
  }
  if (!bestN || bestScore < 2.2) throw new PicTuneError("couldn't lock onto this pictune.");
  const gridN = bestN;
  const module = side / (gridN - FINDER);
  const size = module * FINDER;
  const tl = refineFinder(rgba, w, h, tl0, size);
  const tr = refineFinder(rgba, w, h, tr0, size);
  const bl = refineFinder(rgba, w, h, bl0, size);
  const br = { x: tr.x + (bl.x - tl.x), y: tr.y + (bl.y - tl.y) };

  const grid = new Uint8Array(gridN * gridN);
  const originOff = (FINDER - 1) / 2;
  const map = (mx: number, my: number) => {
    const u = (mx - originOff) / (gridN - FINDER);
    const v = (my - originOff) / (gridN - FINDER);
    const x = (1 - v) * ((1 - u) * tl.x + u * tr.x) + v * ((1 - u) * bl.x + u * br.x);
    const y = (1 - v) * ((1 - u) * tl.y + u * tr.y) + v * ((1 - u) * bl.y + u * br.y);
    return [x, y] as const;
  };

  for (let my = 0; my < gridN; my++) {
    for (let mx = 0; mx < gridN; mx++) {
      const [cx, cy] = map(mx, my);
      const votes = new Uint8Array(8);
      const pts = [
        [cx, cy],
        [cx - module * 0.18, cy],
        [cx + module * 0.18, cy],
        [cx, cy - module * 0.18],
        [cx, cy + module * 0.18],
      ];
      for (const [sx, sy] of pts) {
        const [r, g, b] = sampleRgb(rgba, w, h, sx, sy);
        votes[nearestPalette(r, g, b)]++;
      }
      let best = 0;
      let bestV = -1;
      for (let i = 0; i < 8; i++) {
        if (votes[i]! > bestV) {
          bestV = votes[i]!;
          best = i;
        }
      }
      grid[my * gridN + mx] = best;
    }
  }
  void QUIET;
  return { grid, n: gridN };
}
