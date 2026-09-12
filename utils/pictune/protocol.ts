import { crc32 } from "./crc32";

export const MAGIC = "PICTUNE2";
export const VERSION = 2;
export const HEADER_BYTES = 48;
export const TARGET_RATE = 16000;
export const WATERMARK_H = 52;
export const MIN_SIDE = 640;
export const MAX_SIDE = 1600; // WhatsApp resizes anything larger
export const QIM_DELTA = 22;
export const ECC_COPIES = 3;
export const SYNC_BITS = 16;

export class PicTuneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PicTuneError";
  }
}

export interface PicTuneHeader {
  magic: string;
  version: number;
  sampleRate: number;
  channels: 1;
  frameCount: number;
  crc32: number;
  durationMs: number;
  payloadBytes: number;
}

export function packHeader(h: {
  sampleRate: number;
  frameCount: number;
  crc32: number;
  durationMs: number;
  payloadBytes: number;
}): Uint8Array {
  const buf = new Uint8Array(HEADER_BYTES);
  const view = new DataView(buf.buffer);
  for (let i = 0; i < 8; i++) buf[i] = MAGIC.charCodeAt(i);
  view.setUint8(8, VERSION);
  view.setUint8(9, 1);
  view.setUint16(10, h.sampleRate, true);
  view.setUint32(12, h.frameCount, true);
  view.setUint32(16, h.crc32, true);
  view.setUint32(20, h.durationMs, true);
  view.setUint32(24, h.payloadBytes, true);
  return buf;
}

export function unpackHeader(bytes: Uint8Array): PicTuneHeader {
  if (bytes.length < HEADER_BYTES) throw new PicTuneError("this photo isn't a pictune.");
  const magic = String.fromCharCode(...bytes.subarray(0, 8));
  if (magic === "PICTUNE1") throw new PicTuneError("this pictune is from an older studio — etch a new one.");
  if (magic !== MAGIC) throw new PicTuneError("this photo isn't a pictune.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint8(8);
  if (version !== VERSION) throw new PicTuneError("this pictune is from a newer studio.");
  const sampleRate = view.getUint16(10, true);
  const frameCount = view.getUint32(12, true);
  const sum = view.getUint32(16, true);
  const durationMs = view.getUint32(20, true);
  const payloadBytes = view.getUint32(24, true);
  if (!sampleRate || !payloadBytes) throw new PicTuneError("this pictune looks empty.");
  return {
    magic,
    version,
    sampleRate,
    channels: 1,
    frameCount,
    crc32: sum,
    durationMs,
    payloadBytes,
  };
}

export function payloadCrc(bytes: Uint8Array): number {
  return crc32(bytes);
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromSize(w: number, h: number): number {
  return (0x50494354 ^ (w * 73856093) ^ (h * 19349663)) >>> 0;
}
