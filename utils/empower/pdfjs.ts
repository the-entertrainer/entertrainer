let loading: Promise<any> | null = null

export function loadPdfjs(): Promise<any> {
  if (loading) return loading
  loading = (async () => {
    if (typeof Promise.withResolvers !== 'function') {
      ;(Promise as any).withResolvers = function withResolvers() {
        let resolve!: (value: unknown) => void
        let reject!: (reason?: unknown) => void
        const promise = new Promise((res, rej) => {
          resolve = res
          reject = rej
        })
        return { promise, resolve, reject }
      }
    }
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
    return pdfjs
  })()
  loading.catch(() => {
    loading = null
  })
  return loading
}
