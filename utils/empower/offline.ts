import { ocrPackSizeLabel } from './bytes'
import { kvGet, kvSet } from './db'

export type OfflinePhase = 'ready' | 'download' | 'limited'

export function offlineLabel(phase: OfflinePhase): string {
  if (phase === 'ready') return 'Ready offline'
  if (phase === 'limited') return 'Offline — limited'
  return `Needs download (${ocrPackSizeLabel()})`
}

export async function markOcrPack(): Promise<void> {
  await kvSet('ocr-pack', { ready: true, at: Date.now() })
}

export async function ocrPackInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const marked = await kvGet<{ ready?: boolean }>('ocr-pack')
  if (marked?.ready) return true
  if (!('caches' in window)) return false
  try {
    const names = await caches.keys()
    for (const name of names) {
      const cache = await caches.open(name)
      const hit = await cache.match('/tesseract/eng.traineddata.gz')
      if (hit) return true
    }
  } catch {
    /* Cache Storage can throw in private mode. */
  }
  return false
}

export async function offlinePhase(): Promise<OfflinePhase> {
  const installed = await ocrPackInstalled()
  if (installed) return 'ready'
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'limited'
  return 'download'
}
