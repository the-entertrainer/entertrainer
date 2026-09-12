import {
  HEADER_BYTES,
  PicTuneError,
  WATERMARK_H,
  packHeader,
  payloadCrc,
  unpackHeader,
  type PicTuneHeader,
} from "./protocol";
import { bilinearResize, fitCanvas, psnrRgb } from "./image";
import { encodePngRgb } from "./png";
import { decodeRvq, encodeRvq, rvqDurationMs } from "./rvq";
import { capacityBytes, embedPayload, extractPayload } from "./stego";

export interface EncodeInput {
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  pcm: Int16Array;
  sampleRate: number;
  stampWatermark?: boolean;
}

export interface EncodeOutput {
  png: Uint8Array;
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  header: PicTuneHeader;
  psnr: number;
}

export interface DecodeOutput {
  pcm: Int16Array;
  header: PicTuneHeader;
  width: number;
  height: number;
  crcOk: boolean;
  rgba: Uint8ClampedArray;
}

function dimWatermarkBand(rgba: Uint8ClampedArray, width: number, height: number): void {
  const y0 = Math.max(0, height - WATERMARK_H);
  for (let y = y0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      rgba[o] = Math.round(rgba[o]! * 0.18);
      rgba[o + 1] = Math.round(rgba[o + 1]! * 0.18);
      rgba[o + 2] = Math.round(rgba[o + 2]! * 0.18);
      rgba[o + 3] = 255;
    }
  }
}

export function pngFromRgba(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): Uint8Array {
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i]!;
    rgb[j + 1] = rgba[i + 1]!;
    rgb[j + 2] = rgba[i + 2]!;
  }
  return encodePngRgb(width, height, rgb, { Software: "PicTune", "PT-Magic": "PICTUNE2" });
}

export function encodePicTune(input: EncodeInput): EncodeOutput {
  const rvq = encodeRvq(input.pcm, input.sampleRate);
  const header = packHeader({
    sampleRate: input.sampleRate,
    frameCount: input.pcm.length,
    crc32: payloadCrc(rvq),
    durationMs: rvqDurationMs(rvq),
    payloadBytes: rvq.length,
  });
  const blob = new Uint8Array(HEADER_BYTES + rvq.length);
  blob.set(header, 0);
  blob.set(rvq, HEADER_BYTES);

  const fitted = fitCanvas(input.width, input.height, blob.length);
  let rgba =
    fitted.width === input.width && fitted.height === input.height
      ? input.rgba.slice()
      : bilinearResize(input.rgba, input.width, input.height, fitted.width, fitted.height);
  const original = rgba.slice();
  if (capacityBytes(fitted.width, fitted.height) < blob.length) {
    throw new PicTuneError("this take is too long for that photo.");
  }
  embedPayload(rgba, fitted.width, fitted.height, blob);
  if (input.stampWatermark !== false) dimWatermarkBand(rgba, fitted.width, fitted.height);
  const parsed = unpackHeader(header);
  const psnr = psnrRgb(original, rgba, fitted.width, fitted.height);
  const png = pngFromRgba(rgba, fitted.width, fitted.height);
  return { png, rgba, width: fitted.width, height: fitted.height, header: parsed, psnr };
}

export function decodePicTune(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
): DecodeOutput {
  const all = extractPayload(rgba, width, height);
  if (all.length < HEADER_BYTES) throw new PicTuneError("this pictune looks cropped.");
  const header = unpackHeader(all.subarray(0, HEADER_BYTES));
  const rvq = all.subarray(HEADER_BYTES, HEADER_BYTES + header.payloadBytes);
  const crcOk = payloadCrc(rvq) === header.crc32;
  const { pcm } = decodeRvq(rvq);
  const copy = rgba instanceof Uint8ClampedArray ? rgba : new Uint8ClampedArray(rgba);
  return { pcm, header, width, height, crcOk, rgba: copy };
}

export function rgbaFromRgb(rgb: Uint8Array, width: number, height: number): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
    rgba[j] = rgb[i]!;
    rgba[j + 1] = rgb[i + 1]!;
    rgba[j + 2] = rgb[i + 2]!;
    rgba[j + 3] = 255;
  }
  return rgba;
}
