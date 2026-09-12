import { ALIGN, BITS, CENTER, FINDER, MAX_GRID, MIN_GRID, PALETTE } from "./protocol";

export function isFinder(x: number, y: number, n: number): boolean {
  const hit = (x0: number, y0: number) => x >= x0 && x < x0 + FINDER && y >= y0 && y < y0 + FINDER;
  return hit(0, 0) || hit(n - FINDER, 0) || hit(0, n - FINDER);
}

export function isSeparator(x: number, y: number, n: number): boolean {
  if (isFinder(x, y, n)) return false;
  const near = (x0: number, y0: number, s: number) => x >= x0 && x < x0 + s && y >= y0 && y < y0 + s;
  return near(0, 0, 8) || near(n - 8, 0, 8) || near(0, n - 8, 8);
}

export function isTiming(x: number, y: number, n: number): boolean {
  if (isFinder(x, y, n) || isSeparator(x, y, n)) return false;
  return x === 6 || y === 6;
}

export function isAlign(x: number, y: number, n: number): boolean {
  const a0 = n - ALIGN - 2;
  return x >= a0 && x < a0 + ALIGN && y >= a0 && y < a0 + ALIGN;
}

export function isCenter(x: number, y: number, n: number): boolean {
  const c0 = Math.floor((n - CENTER) / 2);
  return x >= c0 && x < c0 + CENTER && y >= c0 && y < c0 + CENTER;
}

export function isReserved(x: number, y: number, n: number): boolean {
  return isFinder(x, y, n) || isTiming(x, y, n) || isAlign(x, y, n) || isCenter(x, y, n);
}

export function dataCells(n: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!isReserved(x, y, n)) cells.push([x, y]);
    }
  }
  return cells;
}

export function dataCapacityBytes(n: number): number {
  return Math.floor((dataCells(n).length * BITS) / 8);
}

export function gridForBytes(need: number): number {
  for (let n = MIN_GRID; n <= MAX_GRID; n += 8) {
    if (dataCapacityBytes(n) >= need) return n;
  }
  return 0;
}

export function maskSymbol(raw: number, x: number, y: number): number {
  return (raw + x * 3 + y * 5) & 7;
}

export function unmaskSymbol(sym: number, x: number, y: number): number {
  return (sym - (x * 3 + y * 5) + 32) & 7;
}

export function bytesToSymbols(bytes: Uint8Array, n: number): Uint8Array {
  const cells = dataCells(n);
  const grid = new Uint8Array(n * n);
  let bit = 0;
  const totalBits = bytes.length * 8;
  for (const [x, y] of cells) {
    let raw = 0;
    for (let k = 0; k < BITS; k++) {
      const b = bit < totalBits ? (bytes[bit >> 3]! >> (7 - (bit & 7))) & 1 : 0;
      raw = (raw << 1) | b;
      bit++;
    }
    grid[y * n + x] = maskSymbol(raw, x, y);
  }
  return grid;
}

export function symbolsToBytes(grid: Uint8Array, n: number, byteLen: number): Uint8Array {
  const cells = dataCells(n);
  const out = new Uint8Array(byteLen);
  let acc = 0;
  let have = 0;
  let o = 0;
  for (const [x, y] of cells) {
    if (o >= byteLen) break;
    const raw = unmaskSymbol(grid[y * n + x]!, x, y);
    for (let k = BITS - 1; k >= 0; k--) {
      acc = (acc << 1) | ((raw >> k) & 1);
      have++;
      if (have === 8) {
        out[o++] = acc;
        acc = 0;
        have = 0;
        if (o >= byteLen) return out;
      }
    }
  }
  return out;
}

export function finderColor(lx: number, ly: number): number {
  if (lx === 0 || ly === 0 || lx === 6 || ly === 6) return 2;
  if (lx === 1 || ly === 1 || lx === 5 || ly === 5) return 0;
  return 2;
}

export function alignColor(lx: number, ly: number): number {
  if (lx === 0 || ly === 0 || lx === 4 || ly === 4) return 2;
  if (lx === 2 && ly === 2) return 2;
  return 0;
}

export { PALETTE };
