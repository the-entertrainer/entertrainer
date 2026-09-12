import { crc32 } from "./crc32";

const CHUNK = 32;
const UNIT = CHUNK + 4;

function tryUnit(u: Uint8Array): Uint8Array | null {
  if (u.length < UNIT) return null;
  const sum = new DataView(u.buffer, u.byteOffset, u.byteLength).getUint32(0, true);
  const slice = u.subarray(4, UNIT);
  if (crc32(slice) !== sum) return null;
  return slice;
}

function readLen(unit: Uint8Array | null): number | null {
  if (!unit || unit.length < 4) return null;
  const L = new DataView(unit.buffer, unit.byteOffset, unit.byteLength).getUint32(0, true);
  if (L <= 0 || L > 2_000_000) return null;
  return L;
}

/** Two far-apart copies of CRC'd 32-byte chunks. Local print/JPEG scars hit one side. */
export function protect(bytes: Uint8Array): Uint8Array {
  const inner = new Uint8Array(8 + bytes.length);
  const view = new DataView(inner.buffer);
  view.setUint32(0, bytes.length, true);
  view.setUint32(4, crc32(bytes), true);
  inner.set(bytes, 8);
  const paddedLen = Math.ceil(inner.length / CHUNK) * CHUNK;
  const padded = new Uint8Array(paddedLen);
  padded.set(inner);
  const n = paddedLen / CHUNK;
  const one = new Uint8Array(n * UNIT);
  for (let i = 0; i < n; i++) {
    const slice = padded.subarray(i * CHUNK, (i + 1) * CHUNK);
    new DataView(one.buffer).setUint32(i * UNIT, crc32(slice), true);
    one.set(slice, i * UNIT + 4);
  }
  const out = new Uint8Array(one.length * 2);
  out.set(one, 0);
  out.set(one, one.length);
  return out;
}

export function recover(bytes: Uint8Array): Uint8Array | null {
  if (bytes.length < UNIT * 2) return null;
  let L = readLen(tryUnit(bytes.subarray(0, UNIT)));
  let n = L != null ? Math.ceil((8 + L) / CHUNK) : 0;
  if (L == null || bytes.length < n * UNIT * 2) {
    L = null;
    n = 0;
    const maxN = Math.floor(bytes.length / (UNIT * 2));
    for (let cand = 1; cand <= maxN; cand++) {
      const guessed = readLen(tryUnit(bytes.subarray(cand * UNIT, cand * UNIT + UNIT)));
      if (guessed != null && Math.ceil((8 + guessed) / CHUNK) === cand) {
        L = guessed;
        n = cand;
        break;
      }
    }
  }
  if (L == null || !n || bytes.length < n * UNIT * 2) return null;
  const bOff = n * UNIT;
  const inner = new Uint8Array(n * CHUNK);
  for (let i = 0; i < n; i++) {
    const ua = tryUnit(bytes.subarray(i * UNIT, (i + 1) * UNIT));
    const ub = tryUnit(bytes.subarray(bOff + i * UNIT, bOff + (i + 1) * UNIT));
    const u = ua ?? ub;
    if (!u) return null;
    inner.set(u, i * CHUNK);
  }
  const view = new DataView(inner.buffer);
  if (view.getUint32(0, true) !== L) return null;
  const payload = inner.subarray(8, 8 + L);
  if (crc32(payload) !== view.getUint32(4, true)) return null;
  return payload.slice();
}
