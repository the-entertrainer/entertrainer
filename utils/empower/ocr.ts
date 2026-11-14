import { markOcrPack } from './offline'

export async function recognizeImage(image: Blob | HTMLCanvasElement): Promise<string> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng', 1, {
    workerPath: '/tesseract/worker.min.js',
    corePath: '/tesseract/tesseract-core-lstm.wasm.js',
    langPath: '/tesseract',
    workerBlobURL: false,
    gzip: true,
  })
  try {
    await markOcrPack()
    const result = await worker.recognize(image)
    return String(result?.data?.text || '').trim()
  } finally {
    await worker.terminate().catch(() => {})
  }
}
