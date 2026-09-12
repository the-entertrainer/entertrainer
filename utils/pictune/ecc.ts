import { crc32 } from "./crc32";

/** Triple (or N-copy) interleaved repetition with CRC. Majority-vote recovers sparse JPEG bit flips. */

export function protect(bytes: Uint8Array, copies = 3): Uint8Array {
  const inner = new Uint8Array(4 + bytes.length);
  new DataView(inner.buffer).setUint32(0, crc32(bytes), true);
  inner.set(bytes, 4);
  const n = inner.length;
  const out = new Uint8Array(4 + n * copies);
  new DataView(out.buffer).setUint32(0, n, true);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < copies; c++) out[4 + i * copies + c] = inner[i]!;
  }
  return out;
}

export function recover(bytes: Uint8Array, copies = 3): Uint8Array | null {
  if (bytes.length < 8) return null;
  const n = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
  if (n <= 4 || 4 + n * copies > bytes.length) return null;
  const inner = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const votes = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let c = 0; c < copies; c++) {
      const v = bytes[4 + i * copies + c]!;
      for (let b = 0; b < 8; b++) if (v & (1 << b)) votes[b]!++;
    }
    let byte = 0;
    for (let b = 0; b < 8; b++) if (votes[b]! * 2 >= copies) byte |= 1 << b;
    inner[i] = byte;
  }
  const sum = new DataView(inner.buffer).getUint32(0, true);
  const payload = inner.subarray(4);
  if (crc32(payload) !== sum) return null;
  return payload;
}

export function barker16(): Uint8Array {
  // 16-chip Barker-like sync so the decoder can lock onto a PicTune grid.
  return new Uint8Array([1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1]);
}
