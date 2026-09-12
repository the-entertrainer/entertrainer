import { decodePngRgb } from "./png"
import { decodePicTune, encodePicTune, pngFromRgba, rgbaFromRgb, type DecodeOutput, type EncodeOutput } from "./codec"
import { makeDemoPhoto } from "./image"
import { PicTuneError, MAX_SIDE } from "./protocol"
import { paintWatermark } from "./watermark"

export interface PhotoInput {
  rgba: Uint8ClampedArray
  width: number
  height: number
  url: string
  name: string
}

function blobUrl(bytes: Uint8Array, mime: string): string {
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  return URL.createObjectURL(new Blob([copy], { type: mime }))
}

export function demoPhoto(): PhotoInput {
  const width = 960
  const height = 720
  const rgba = makeDemoPhoto(width, height)
  return {
    rgba,
    width,
    height,
    url: blobUrl(pngFromRgba(rgba, width, height), "image/png"),
    name: "sample-dusk.png",
  }
}

export async function photoFromFile(file: File): Promise<PhotoInput> {
  const url = URL.createObjectURL(file)
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new PicTuneError("couldn't open that photo.")
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const data = ctx.getImageData(0, 0, width, height)
  return { rgba: data.data, width, height, url, name: file.name }
}

export function finalizeWithWatermark(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): { png: Uint8Array; rgba: Uint8ClampedArray } {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return { png: pngFromRgba(rgba, width, height), rgba }
  const img = ctx.createImageData(width, height)
  img.data.set(rgba)
  ctx.putImageData(img, 0, 0)
  paintWatermark(ctx, width, height)
  const stamped = ctx.getImageData(0, 0, width, height)
  return { png: pngFromRgba(stamped.data, width, height), rgba: stamped.data }
}

export async function etchPicTune(input: {
  rgba: Uint8ClampedArray
  width: number
  height: number
  pcm: Int16Array
  sampleRate: number
}): Promise<EncodeOutput> {
  const out = encodePicTune(input)
  const stamped = finalizeWithWatermark(out.rgba, out.width, out.height)
  return { ...out, png: stamped.png, rgba: stamped.rgba }
}

export async function openPicTuneFile(file: File): Promise<DecodeOutput & { url: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let png
  try {
    png = decodePngRgb(bytes)
  } catch {
    throw new PicTuneError("this photo isn't a pictune. send the original png, not a screenshot.")
  }
  const rgba = rgbaFromRgb(png.rgb, png.width, png.height)
  const dec = decodePicTune(rgba, png.width, png.height)
  return { ...dec, url: blobUrl(bytes, "image/png") }
}

export function pngBlobUrl(png: Uint8Array): string {
  return blobUrl(png, "image/png")
}
