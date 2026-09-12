import { decodePngRgb, isPng } from "./png";
import { decodePicTune, encodePicTune, pngFromRgba, rgbaFromRgb, type DecodeOutput, type EncodeOutput } from "./codec";
import { bilinearResize, makeDemoPhoto } from "./image";
import { PicTuneError, MAX_SIDE } from "./protocol";
import { paintWatermark, readSizeBarcode } from "./watermark";

export interface PhotoInput {
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  url: string;
  name: string;
}

function blobUrl(bytes: Uint8Array, mime: string): string {
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return URL.createObjectURL(new Blob([copy], { type: mime }));
}

export function demoPhoto(): PhotoInput {
  const width = 960;
  const height = 720;
  const rgba = makeDemoPhoto(width, height);
  return {
    rgba,
    width,
    height,
    url: blobUrl(pngFromRgba(rgba, width, height), "image/png"),
    name: "sample-dusk.png",
  };
}

async function rasterize(file: Blob): Promise<{ rgba: Uint8ClampedArray; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(8, Math.round(bitmap.width * scale));
  const height = Math.max(8, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new PicTuneError("couldn't open that photo.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const data = ctx.getImageData(0, 0, width, height);
  return { rgba: data.data, width, height };
}

export async function photoFromFile(file: File): Promise<PhotoInput> {
  const url = URL.createObjectURL(file);
  const next = await rasterize(file);
  return { ...next, url, name: file.name };
}

export function finalizeWithWatermark(rgba: Uint8ClampedArray, width: number, height: number): {
  png: Uint8Array;
  rgba: Uint8ClampedArray;
} {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { png: pngFromRgba(rgba, width, height), rgba };
  const img = ctx.createImageData(width, height);
  img.data.set(rgba);
  ctx.putImageData(img, 0, 0);
  paintWatermark(ctx, width, height);
  const stamped = ctx.getImageData(0, 0, width, height);
  return { png: pngFromRgba(stamped.data, width, height), rgba: stamped.data };
}

export async function etchPicTune(input: {
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  pcm: Int16Array;
  sampleRate: number;
}): Promise<EncodeOutput> {
  const out = encodePicTune(input);
  const stamped = finalizeWithWatermark(out.rgba, out.width, out.height);
  return { ...out, png: stamped.png, rgba: stamped.rgba };
}

function tryDecode(rgba: Uint8ClampedArray, width: number, height: number): DecodeOutput {
  try {
    return decodePicTune(rgba, width, height);
  } catch {
    const tagged = readSizeBarcode(rgba, width, height);
    if (tagged && (tagged.width !== width || tagged.height !== height)) {
      const resized = bilinearResize(rgba, width, height, tagged.width, tagged.height);
      return decodePicTune(resized, tagged.width, tagged.height);
    }
    throw new PicTuneError("this photo isn't a pictune. send the original file, or a screenshot of it.");
  }
}

export async function openPicTuneFile(file: File): Promise<DecodeOutput & { url: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let rgba: Uint8ClampedArray;
  let width: number;
  let height: number;
  if (isPng(bytes)) {
    try {
      const png = decodePngRgb(bytes);
      rgba = rgbaFromRgb(png.rgb, png.width, png.height);
      width = png.width;
      height = png.height;
    } catch {
      throw new PicTuneError("this photo isn't a pictune. send the original file, or a screenshot of it.");
    }
  } else {
    const raster = await rasterize(file);
    rgba = raster.rgba;
    width = raster.width;
    height = raster.height;
  }
  const dec = tryDecode(rgba, width, height);
  const mime = file.type || "image/png";
  return { ...dec, url: blobUrl(bytes, mime) };
}

export function pngBlobUrl(png: Uint8Array): string {
  return blobUrl(png, "image/png");
}
