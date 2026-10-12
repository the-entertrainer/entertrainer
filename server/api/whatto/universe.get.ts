/**
 * Whatto coin universe: every TRADING Binance spot pair quoted in USDT, with
 * 24h stats, price decimals, CoinGecko names (from utils/whatto/coin-ids.json)
 * and live CoinGecko market-cap ranks.
 *
 * Why a server route: Binance exchangeInfo is ~6 MB and CoinGecko's keyless tier is
 * tightly rate-limited. Here both are fetched once, compacted to ~40 KB, and cached
 * (in memory for 10 min, at the Vercel edge via s-maxage + stale-while-revalidate).
 * Ranks are cached for 6 h. If Binance is unreachable from the server region the route
 * answers { binance: false } and the browser falls back to fetching ticker/24hr itself.
 */
import coinIds from '~/utils/whatto/coin-ids.json'

const BINANCE = 'https://data-api.binance.vision/api/v3'
const GECKO = 'https://api.coingecko.com/api/v3'
const QUOTE = 'USDT'
const TTL_MS = 10 * 60_000
const RANK_TTL_MS = 6 * 3600_000
const UA = 'Entertrainer-Whatto/1.0 (+https://entertrainer.in/engage/whatto)'

/** [base, decimals, quoteVol24h, pctChange24h, lastPrice] */
type Row = [string, number, number, number, number]
interface Universe { at: number; binance: boolean; rows: Row[]; ranks: Record<string, number>; ranksAt: number }

let cache: Universe | null = null
let rankCache: { at: number; ranks: Record<string, number> } | null = null

async function getJson<T>(url: string, ms = 12_000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': UA, accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as T
  } finally { clearTimeout(timer) }
}

function decimalsFromTick(tick: string): number {
  const t = tick.replace(/0+$/, '')
  const i = t.indexOf('.')
  return i < 0 ? 0 : Math.min(10, t.length - i - 1)
}

async function binanceRows(): Promise<Row[]> {
  const [info, tick] = await Promise.all([
    getJson<{ symbols: { symbol: string; status: string; baseAsset: string; quoteAsset: string; filters: { filterType: string; tickSize?: string }[] }[] }>(`${BINANCE}/exchangeInfo?permissions=SPOT&symbolStatus=TRADING`),
    getJson<{ symbol: string; quoteVolume: string; priceChangePercent: string; lastPrice: string }[]>(`${BINANCE}/ticker/24hr`),
  ])
  const t = new Map(tick.map(x => [x.symbol, x]))
  const rows: Row[] = []
  for (const s of info.symbols) {
    if (s.status !== 'TRADING' || s.quoteAsset !== QUOTE) continue
    const x = t.get(s.symbol)
    const tickSize = s.filters.find(f => f.filterType === 'PRICE_FILTER')?.tickSize ?? '0.01'
    rows.push([s.baseAsset, decimalsFromTick(tickSize), x ? +(+x.quoteVolume).toFixed(0) : 0, x ? +x.priceChangePercent : 0, x ? +x.lastPrice : 0])
  }
  return rows.sort((a, b) => b[2] - a[2])
}

/** Market-cap ranks from CoinGecko for the ids CoinGecko itself mapped to Binance bases. */
async function geckoRanks(bases: string[]): Promise<Record<string, number>> {
  if (rankCache && Date.now() - rankCache.at < RANK_TTL_MS) return rankCache.ranks
  const map = (coinIds as { coins: Record<string, [string, string]> }).coins
  const byId = new Map<string, string[]>()
  for (const b of bases) { const id = map[b]?.[0]; if (id) byId.set(id, [...(byId.get(id) ?? []), b]) }
  const ids = [...byId.keys()]
  const ranks: Record<string, number> = {}
  for (let i = 0; i < ids.length; i += 250) {
    const page = await getJson<{ id: string; market_cap_rank: number | null }[]>(`${GECKO}/coins/markets?vs_currency=usd&per_page=250&ids=${encodeURIComponent(ids.slice(i, i + 250).join(','))}`)
    for (const c of page) if (c.market_cap_rank) for (const b of byId.get(c.id) ?? []) ranks[b] = c.market_cap_rank
  }
  rankCache = { at: Date.now(), ranks }
  return ranks
}

export default defineEventHandler(async (event) => {
  event.node.res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=3600')
  if (cache && Date.now() - cache.at < TTL_MS) return cache
  let rows: Row[] = []
  let binance = true
  try { rows = await binanceRows() } catch { binance = false; rows = cache?.rows ?? [] }
  let ranks = rankCache?.ranks ?? {}
  try { ranks = await geckoRanks(rows.length ? rows.map(r => r[0]) : Object.keys((coinIds as { coins: Record<string, unknown> }).coins)) } catch { /* names still work; ranks stay unknown */ }
  const out: Universe = { at: Date.now(), binance: binance && rows.length > 0, rows, ranks, ranksAt: rankCache?.at ?? 0 }
  if (out.binance) cache = out
  return out
})
