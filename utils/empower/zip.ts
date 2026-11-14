/**
 * PPTX and DOCX are zip archives. JSZip is what the spec names, and it is
 * already vendored for Dialogue, but it is not a direct dependency. Reading
 * uses the platform DecompressionStream (deflate). Writing split-PDF bundles
 * uses the STORE method so no extra library is required.
 */

function crc32(data: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    c ^= data[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (~c) >>> 0
}

function concat(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(size)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

async function inflateRaw(comp: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('This browser cannot unpack the file.')
  }
  const stream = new Blob([comp]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  const buf = await new Response(stream).arrayBuffer()
  return new Uint8Array(buf)
}

export async function unzip(buffer: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  let eocd = -1
  const start = Math.max(0, bytes.length - 22 - 0xffff)
  for (let i = bytes.length - 22; i >= start; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('That file is not a zip archive.')
  const count = view.getUint16(eocd + 10, true)
  let offset = view.getUint32(eocd + 16, true)
  if (offset === 0xffffffff) throw new Error('This archive uses ZIP64, which this tool does not read.')
  const files = new Map<string, Uint8Array>()
  const decoder = new TextDecoder()
  for (let n = 0; n < count; n++) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error('This archive is damaged.')
    }
    const method = view.getUint16(offset + 10, true)
    const compSize = view.getUint32(offset + 20, true)
    const nameLen = view.getUint16(offset + 28, true)
    const extraLen = view.getUint16(offset + 30, true)
    const commentLen = view.getUint16(offset + 32, true)
    const localOffset = view.getUint32(offset + 42, true)
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLen))
    offset += 46 + nameLen + extraLen + commentLen
    if (name.endsWith('/')) continue
    if (localOffset + 30 > bytes.length) throw new Error('This archive is incomplete.')
    const nameLenL = view.getUint16(localOffset + 26, true)
    const extraLenL = view.getUint16(localOffset + 28, true)
    const dataStart = localOffset + 30 + nameLenL + extraLenL
    const comp = bytes.subarray(dataStart, dataStart + compSize)
    if (method === 0) files.set(name, new Uint8Array(comp))
    else if (method === 8) files.set(name, await inflateRaw(comp))
    else throw new Error('This archive uses a compression method this tool cannot read.')
  }
  return files
}

export function zipStore(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  for (const file of files) {
    const name = encoder.encode(file.name)
    const crc = crc32(file.data)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(8, 0, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, file.data.length, true)
    local.setUint32(22, file.data.length, true)
    local.setUint16(26, name.length, true)
    const localBytes = new Uint8Array(local.buffer)
    locals.push(localBytes, name, file.data)
    const cen = new DataView(new ArrayBuffer(46))
    cen.setUint32(0, 0x02014b50, true)
    cen.setUint16(4, 20, true)
    cen.setUint16(6, 20, true)
    cen.setUint32(16, crc, true)
    cen.setUint32(20, file.data.length, true)
    cen.setUint32(24, file.data.length, true)
    cen.setUint16(28, name.length, true)
    cen.setUint32(42, offset, true)
    central.push(new Uint8Array(cen.buffer), name)
    offset += localBytes.length + name.length + file.data.length
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0)
  const eocd = new DataView(new ArrayBuffer(22))
  eocd.setUint32(0, 0x06054b50, true)
  eocd.setUint16(8, files.length, true)
  eocd.setUint16(10, files.length, true)
  eocd.setUint32(12, centralSize, true)
  eocd.setUint32(16, offset, true)
  return concat([...locals, ...central, new Uint8Array(eocd.buffer)])
}

export function zipText(files: Map<string, Uint8Array>, path: string): string {
  const bytes = files.get(path)
  if (!bytes) return ''
  return new TextDecoder().decode(bytes).replace(/^\uFEFF/, '')
}
