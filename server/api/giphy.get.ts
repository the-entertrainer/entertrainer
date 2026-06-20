// Server-side Giphy proxy.
//
// Keeps the API key off the client and normalises Giphy's payload down to the
// few fields the GIF engine needs. When GIPHY_API_KEY is not configured (or the
// upstream call fails) it responds with `{ fallback: true, items: [] }` so the
// client can render its own "thought" placeholders instead of breaking.
//
// Query params:
//   q      — search keyword(s)            (required)
//   limit  — max results, 1..12           (default 6)
//   rating — giphy content rating         (default 'pg-13')

interface GiphyItem {
  id: string
  url: string        // direct .gif url (fixed_height_small)
  still: string      // static preview frame
  width: number
  height: number
  title: string
}

export default defineEventHandler(async (event): Promise<{ items: GiphyItem[]; fallback: boolean }> => {
  const { giphyApiKey } = useRuntimeConfig(event)
  const query = getQuery(event)

  const q = String(query.q ?? '').trim()
  const limit = Math.min(Math.max(parseInt(String(query.limit ?? '6'), 10) || 6, 1), 12)
  const rating = String(query.rating ?? 'pg-13')

  if (!q) return { items: [], fallback: true }
  if (!giphyApiKey) return { items: [], fallback: true }

  try {
    const endpoint = 'https://api.giphy.com/v1/gifs/search'
    const url = `${endpoint}?api_key=${encodeURIComponent(giphyApiKey)}`
      + `&q=${encodeURIComponent(q)}`
      + `&limit=${limit}`
      + `&rating=${encodeURIComponent(rating)}`
      + `&bundle=fixed_height_small&lang=en`

    const res: any = await $fetch(url, { timeout: 6000 })

    const items: GiphyItem[] = (res?.data ?? [])
      .map((g: any) => {
        const img = g?.images?.fixed_height_small ?? g?.images?.fixed_height ?? {}
        const still = g?.images?.fixed_height_small_still ?? g?.images?.fixed_height_still ?? {}
        return {
          id: String(g?.id ?? ''),
          url: String(img?.url ?? ''),
          still: String(still?.url ?? ''),
          width: parseInt(img?.width ?? '0', 10) || 0,
          height: parseInt(img?.height ?? '0', 10) || 0,
          title: String(g?.title ?? q),
        }
      })
      .filter((g: GiphyItem) => g.url)

    return { items, fallback: items.length === 0 }
  } catch {
    return { items: [], fallback: true }
  }
})
