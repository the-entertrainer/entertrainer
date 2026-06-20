// Reusable GIF content engine.
//
// GIFs in this experience represent thoughts / memories / curiosity — not
// decoration. Each scene declares keywords; this engine resolves them to actual
// Giphy results (via the /api/giphy proxy) and caches per-keyword so repeated
// scenes never refetch. When the proxy reports `fallback`, callers should render
// a stylised "thought" placeholder instead.

export interface Gif {
  id: string
  url: string
  still: string
  width: number
  height: number
  title: string
}

export interface GifResult {
  items: Gif[]
  fallback: boolean
}

const _cache = new Map<string, GifResult>()
const _inflight = new Map<string, Promise<GifResult>>()

export function useGiphy() {
  async function fetchGifs(keyword: string, limit = 6): Promise<GifResult> {
    const key = `${keyword}::${limit}`
    if (_cache.has(key)) return _cache.get(key)!
    if (_inflight.has(key)) return _inflight.get(key)!

    const p = (async (): Promise<GifResult> => {
      try {
        const res = await $fetch<GifResult>('/api/giphy', {
          params: { q: keyword, limit },
        })
        const result: GifResult = {
          items: res?.items ?? [],
          fallback: res?.fallback ?? (res?.items?.length ?? 0) === 0,
        }
        _cache.set(key, result)
        return result
      } catch {
        const result: GifResult = { items: [], fallback: true }
        _cache.set(key, result)
        return result
      } finally {
        _inflight.delete(key)
      }
    })()

    _inflight.set(key, p)
    return p
  }

  // Resolve several keywords at once, flattening into one pool. Useful when a
  // scene wants a small constellation of thoughts from related search terms.
  async function fetchPool(keywords: string[], perKeyword = 2): Promise<GifResult> {
    const results = await Promise.all(keywords.map(k => fetchGifs(k, perKeyword)))
    const items = results.flatMap(r => r.items)
    return { items, fallback: items.length === 0 }
  }

  return { fetchGifs, fetchPool }
}
