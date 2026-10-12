/**
 * Whatto coin universe (client side, one shared instance per tab).
 *
 *  1. List: /api/whatto/universe (server-cached exchangeInfo + 24h ticker + CoinGecko ranks),
 *     kept in localStorage for 10 min. If the server cannot reach Binance, the browser fetches
 *     data-api.binance.vision/api/v3/ticker/24hr itself (weight 80, once per TTL) and treats
 *     pairs that traded in the last hour as live.
 *  2. Live: ONE websocket on the all-market `!miniTicker@arr` stream (about one frame per second,
 *     no REST weight) keeps price, 24h % and 24h quote volume fresh for every pair, and samples
 *     each pair's price once a minute so the scanner can read 15/60-minute moves for free.
 *
 * Rows live in a plain Map (not reactive): ~500 pairs updating every second would thrash Vue.
 * `version` bumps at most every 2 s and views recompute from it.
 */
import { BINANCE_REST } from './marketFeed'
import { QUOTE, coinOfPair, setCoinMeta } from '~/utils/whatto/coins'

export interface UniCoin {
  coin: string
  pair: string
  last: number
  open24: number
  pct24: number
  qv24: number
  decimals: number | null
  /** one close sample per minute, newest last: [minuteStartMs, price] */
  samples: [number, number][]
  updatedAt: number
}

const LS_KEY = 'entertrainer.whatto.universe.v1'
const TTL_MS = 10 * 60_000
const WS_URL = 'wss://data-stream.binance.vision/ws/!miniTicker@arr'
const MAX_SAMPLES = 75

type Row = [string, number, number, number, number]
interface Cached { at: number; rows: Row[]; ranks: Record<string, number>; source: 'server' | 'browser' }

const rows = new Map<string, UniCoin>()
const version = ref(0)
const state = reactive({ loading: false, loaded: false, error: null as string | null, source: '' as '' | 'server' | 'browser', fetchedAt: 0, live: false, liveAt: 0 })
let ws: WebSocket | null = null
let users = 0
let retry = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null
let bumpTimer: ReturnType<typeof setTimeout> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

function bump() {
  if (bumpTimer) return
  bumpTimer = setTimeout(() => { bumpTimer = null; version.value++ }, 2000)
}

function apply(c: Cached) {
  const seen = new Set<string>()
  for (const [coin, dec, qv, pct, last] of c.rows) {
    seen.add(coin)
    const prev = rows.get(coin)
    if (prev) { prev.decimals = dec; if (!state.live) { prev.qv24 = qv; prev.pct24 = pct / 100; prev.last = last } }
    else rows.set(coin, { coin, pair: coin + QUOTE, last, open24: last / (1 + pct / 100), pct24: pct / 100, qv24: qv, decimals: dec >= 0 ? dec : null, samples: [], updatedAt: c.at })
    setCoinMeta(coin, { ...(dec >= 0 ? { decimals: dec } : {}), rank: c.ranks[coin] ?? null })
  }
  for (const k of [...rows.keys()]) if (!seen.has(k)) rows.delete(k) // delisted / halted
  state.loaded = true
  state.source = c.source
  state.fetchedAt = c.at
  version.value++
}

async function fetchList(force = false) {
  if (state.loading) return
  if (!force) {
    try {
      const c = JSON.parse(localStorage.getItem(LS_KEY) || 'null') as Cached | null
      if (c && Date.now() - c.at < TTL_MS && c.rows?.length) { apply(c); return }
    } catch { /* ignore */ }
  }
  state.loading = true
  try {
    let c: Cached | null = null
    let ranks: Record<string, number> = {}
    try {
      const res = await fetch('/api/whatto/universe')
      if (res.ok) {
        const d = await res.json() as { at: number; binance: boolean; rows: Row[]; ranks: Record<string, number> }
        ranks = d.ranks ?? {}
        if (d.binance && d.rows.length) c = { at: d.at, rows: d.rows, ranks, source: 'server' }
      }
    } catch { /* fall through */ }
    if (!c) {
      // Browser fallback: one 24h ticker call (weight 80). Trading status = traded in the last hour.
      const res = await fetch(`${BINANCE_REST}/ticker/24hr`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const t = await res.json() as { symbol: string; quoteVolume: string; priceChangePercent: string; lastPrice: string; closeTime: number; count: number }[]
      const now = Date.now()
      const r: Row[] = []
      for (const x of t) {
        const coin = coinOfPair(x.symbol)
        if (!coin || x.count <= 0 || now - x.closeTime > 3600_000) continue
        r.push([coin, -1, +(+x.quoteVolume).toFixed(0), +x.priceChangePercent, +x.lastPrice])
      }
      c = { at: now, rows: r.sort((a, b) => b[2] - a[2]), ranks, source: 'browser' }
    }
    apply(c)
    try { localStorage.setItem(LS_KEY, JSON.stringify(c)) } catch { /* quota */ }
    state.error = null
  } catch (e) {
    state.error = `Could not load the coin list (${(e as Error).message}).`
  } finally {
    state.loading = false
  }
}

function onMini(arr: { s: string; c: string; o: string; q: string; E: number }[]) {
  const now = Date.now()
  const minute = Math.floor(now / 60_000) * 60_000
  for (const m of arr) {
    const coin = coinOfPair(m.s)
    if (!coin) continue
    const r = rows.get(coin)
    if (!r) continue
    const c = +m.c, o = +m.o
    r.last = c; r.open24 = o; r.pct24 = o > 0 ? c / o - 1 : 0; r.qv24 = +m.q; r.updatedAt = m.E
    const s = r.samples
    if (s.length && s[s.length - 1][0] === minute) s[s.length - 1][1] = c
    else { s.push([minute, c]); if (s.length > MAX_SAMPLES) s.shift() }
  }
  state.live = true
  state.liveAt = now
  bump()
}

function connect() {
  if (ws || users <= 0) return
  let sock: WebSocket
  try { sock = new WebSocket(WS_URL) } catch { schedule(); return }
  ws = sock
  sock.onmessage = (e) => { retry = 0; try { onMini(JSON.parse(e.data as string)) } catch { /* bad frame */ } }
  sock.onclose = () => { if (ws === sock) { ws = null; state.live = false; schedule() } }
  sock.onerror = () => { /* onclose follows */ }
}
function schedule() {
  if (retryTimer || users <= 0) return
  const delay = Math.min(30_000, 1000 * 2 ** retry++) * (0.7 + Math.random() * 0.6)
  retryTimer = setTimeout(() => { retryTimer = null; connect() }, delay)
}

/** Price n minutes ago from the per-minute samples, if we have watched that long. */
export function priceAgo(r: UniCoin, minutes: number): number {
  const s = r.samples
  if (s.length < minutes + 1) return NaN
  return s[s.length - 1 - minutes][1]
}

export function useUniverse() {
  function acquire() {
    users++
    if (users === 1) {
      void fetchList()
      connect()
      refreshTimer = setInterval(() => void fetchList(), TTL_MS)
    }
  }
  function release() {
    users = Math.max(0, users - 1)
    if (users === 0) {
      if (refreshTimer) clearInterval(refreshTimer)
      if (retryTimer) clearTimeout(retryTimer)
      refreshTimer = retryTimer = null
      const s = ws; ws = null
      if (s) { s.onclose = s.onmessage = s.onerror = null; try { s.close() } catch { /* ignore */ } }
      state.live = false
    }
  }
  return { rows, version, state, acquire, release, refresh: () => fetchList(true), get: (c: string) => rows.get(c) }
}
export type UniverseApi = ReturnType<typeof useUniverse>
