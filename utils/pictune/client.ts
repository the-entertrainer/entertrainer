import { decodePngRgb, isPng } from "./png";
import { decodePicTune, encodePicTune, pngFromRgba, rgbaFromRgb, type DecodeOutput, type EncodeOutput } from "./codec";
import { PicTuneError } from "./protocol";

function blobUrl(bytes: Uint8Array, mime: string): string {
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return URL.createObjectURL(new Blob([copy], { type: mime }));
}

async function rasterize(file: Blob): Promise<{ rgba: Uint8ClampedArray; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new PicTuneError("couldn't open that image.");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { rgba: data.data, width: canvas.width, height: canvas.height };
}

export async function makePicTune(input: { pcm: Int16Array; sampleRate: number }): Promise<EncodeOutput> {
  return encodePicTune(input);
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
      throw new PicTuneError("this isn't a pictune.");
    }
  } else {
    const raster = await rasterize(file);
    rgba = raster.rgba;
    width = raster.width;
    height = raster.height;
  }
  const dec = decodePicTune(rgba, width, height);
  const mime = file.type || "image/png";
  return { ...dec, url: blobUrl(bytes, mime) };
}

export function pngBlobUrl(png: Uint8Array): string {
  return blobUrl(png, "image/png");
}

export { pngFromRgba };
