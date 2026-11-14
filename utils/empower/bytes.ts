/** Bytes measured from `public/tesseract` (2026-11-09). Display strings are derived from these, not guessed. */
export const OCR_PACK_FILES = {
  'eng.traineddata.gz': 12_821_300,
  'tesseract-core-lstm.wasm': 2_855_361,
  'tesseract-core-lstm.wasm.js': 3_896_484,
  'worker.min.js': 111_307,
} as const

export const OCR_PACK_BYTES = Object.values(OCR_PACK_FILES).reduce((sum, n) => sum + n, 0)

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ocrPackSizeLabel(): string {
  return formatBytes(OCR_PACK_BYTES)
}
