import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { useStorage } from '#imports'

const cache = new Map<number, ArrayBuffer>()

/** Self-hosted DM Sans for Cadence exports. No Google Fonts request. */
export async function loadDmSans(weight: 400 | 700): Promise<ArrayBuffer> {
  const hit = cache.get(weight)
  if (hit) return hit
  const name = `dm-sans-${weight}.ttf`
  let bytes: Uint8Array | null = null
  try {
    const raw = await useStorage('assets:server').getItemRaw(`fonts/${name}`)
    if (raw) bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw as ArrayBuffer)
  } catch {
    bytes = null
  }
  if (!bytes) {
    bytes = await readFile(join(process.cwd(), 'public', 'fonts', 'webfonts', name))
  }
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  cache.set(weight, copy.buffer)
  return copy.buffer
}
