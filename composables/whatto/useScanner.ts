/**
 * "Falling now": a market-wide scan of every USDT pair, in two stages.
 *
 *  Stage 1: pairs are ranked by their 60-minute move. Once the page has watched the all-market
 *  miniTicker stream for an hour, that move is free (useUniverse samples every pair once a
 *  minute). Before that, ONE bootstrap call to the rolling-window ticker (windowSize=1h, weight 4
 *  per pair capped at 200 per request: the 200 most liquid pairs in two requests, ~400 weight) supplies it, reused for
 *  5 minutes; smaller pairs use the 15-minute sample move, or the 24h move at the very start.
 *  Pairs under $1M of 24h volume are skipped: their 1-minute candles are mostly empty, so
 *  "falling" there is noise.
 *  Stage 2 (on demand): only the top CANDIDATES get real 1-minute klines (weight 2 each) and run
 *  through the same FeatureEngine as the app, so "falling" means the model's setup rule
 *  (60-min move <= -1.5 sigma, still sliding). Odds are attached only for eligible coins.
 *
 * Rate limits: Binance allows 6000 request weight per minute per IP; a full scan costs at most
 * CANDIDATES x 2 = 24. Requests run one at a time, 250 ms apart; any 429/418 pauses the queue for
 * Retry-After (or exponential backoff), and results are reused for 60 s.
 */
import { BINANCE_REST } from './marketFeed'
import { priceAgo, useUniverse } from './useUniverse'
import { FeatureEngine, barFromKlineRow, type FeatureSnapshot } from '~/utils/whatto/features'
import { MODEL, eligibility, evaluate, type Eligibility } from '~/utils/whatto/model'
import { pairOf } from '~/utils/whatto/coins'

export interface ScanHit {
  coin: string
  move60: number
  z60: number
  z15: number
  setup: boolean
  elig: Eligibility
  /** calibrated model probability before the live order-book and news layers; null when not eligible */
  p: number | null
  at: number
}

const CANDIDATES = 12
const MIN_QV = 1e6
const REUSE_MS = 60_000
const GAP_MS = 250
const BOOT_TOP = 200
const BOOT_TTL = 5 * 60_000
let boot: { at: number; move: Map<string, number> } | null = null

const hits = ref<ScanHit[]>([])
const scan = reactive({ running: false, lastAt: 0, stage1Basis: '' as '' | '60m' | '15m' | '24h', scanned: 0, requests: 0, pausedUntil: 0, error: null as string | null })
const cache = new Map<string, ScanHit>()
let backoff = 0

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function klines(coin: string, limit: number): Promise<(string | number)[][] | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const wait = scan.pausedUntil - Date.now()
    if (wait > 0) await sleep(wait)
    scan.requests++
    const res = await fetch(`${BINANCE_REST}/klines?symbol=${encodeURIComponent(pairOf(coin))}&interval=1m&limit=${limit}`)
    if (res.status === 429 || res.status === 418) {
      const ra = Number(res.headers.get('retry-after'))
      backoff = Math.min(120_000, backoff ? backoff * 2 : 5_000)
      scan.pausedUntil = Date.now() + (ra > 0 ? ra * 1000 : backoff)
      continue
    }
    if (!res.ok) return null
    backoff = 0
    return await res.json() as (string | number)[][]
  }
  return null
}

export function useScanner() {
  const uni = useUniverse()

  /** One-off 1h rolling-window moves for the most liquid pairs (only before we have an hour of samples). */
  async function bootstrap(all: { coin: string; qv24: number }[]) {
    if (boot && Date.now() - boot.at < BOOT_TTL) return
    const top = [...all].sort((a, b) => b.qv24 - a.qv24).slice(0, BOOT_TOP).filter(r => /^[A-Z0-9]+$/.test(r.coin))
    const move = new Map<string, number>()
    for (let i = 0; i < top.length; i += 100) {
      const wait = scan.pausedUntil - Date.now()
      if (wait > 0) await sleep(wait)
      const syms = JSON.stringify(top.slice(i, i + 100).map(r => pairOf(r.coin)))
      scan.requests++
      const res = await fetch(`${BINANCE_REST}/ticker?type=MINI&windowSize=1h&symbols=${encodeURIComponent(syms)}`)
      if (res.status === 429 || res.status === 418) {
        const ra = Number(res.headers.get('retry-after'))
        scan.pausedUntil = Date.now() + (ra > 0 ? ra * 1000 : 30_000)
        break
      }
      if (!res.ok) break
      for (const t of await res.json() as { symbol: string; openPrice: string; lastPrice: string }[]) {
        const o = +t.openPrice, c = +t.lastPrice
        if (o > 0) move.set(t.symbol.slice(0, -4), c / o - 1)
      }
      await sleep(GAP_MS)
    }
    if (move.size) boot = { at: Date.now(), move }
  }

  async function stage1(): Promise<{ coin: string; move: number }[]> {
    const all = [...uni.rows.values()].filter(r => r.qv24 >= MIN_QV && r.last > 0)
    const n = all.reduce((m, r) => Math.max(m, r.samples.length), 0)
    if (n < 61) await bootstrap(all)
    const basis = n >= 61 ? '60m' : boot ? '60m' : n >= 16 ? '15m' : '24h'
    scan.stage1Basis = basis
    scan.scanned = all.length
    const move = (r: typeof all[number]) => {
      if (n >= 61) { const p = priceAgo(r, 60); return Number.isFinite(p) && p > 0 ? r.last / p - 1 : NaN }
      const b = boot?.move.get(r.coin)
      if (b !== undefined) return b
      if (n >= 16) { const p = priceAgo(r, 15); return Number.isFinite(p) && p > 0 ? r.last / p - 1 : NaN }
      return r.pct24
    }
    return all.map(r => ({ coin: r.coin, move: move(r) })).filter(x => Number.isFinite(x.move) && x.move < 0)
      .sort((a, b) => a.move - b.move).slice(0, CANDIDATES)
  }

  async function run() {
    if (scan.running || !uni.rows.size) return
    scan.running = true
    scan.error = null
    try {
      const cands = await stage1()
      const out: ScanHit[] = []
      for (const c of cands) {
        const qv = uni.get(c.coin)?.qv24
        const elig = eligibility(c.coin, qv)
        const prev = cache.get(c.coin)
        if (prev && Date.now() - prev.at < REUSE_MS) { out.push({ ...prev, elig }); continue }
        // Eligible coins need the model's full warm-up; the rest only need the 60-min move.
        const rows = await klines(c.coin, elig.eligible ? 1000 : 300)
        await sleep(GAP_MS)
        if (!rows || rows.length < 70) continue
        const now = Date.now()
        const eng = new FeatureEngine(400)
        let snap: FeatureSnapshot | null = null
        for (const b of rows.map(barFromKlineRow)) if (b.t + 60_000 <= now) snap = eng.push(b) ?? snap
        const bars = eng.bars
        const last = bars[bars.length - 1]
        const ago = bars[bars.length - 61]
        const hit: ScanHit = {
          coin: c.coin,
          move60: last && ago ? last.c / ago.c - 1 : c.move,
          z60: snap?.values.z60 ?? NaN,
          z15: snap?.values.z15 ?? NaN,
          setup: !!snap?.setup,
          elig,
          // the model only scores falling setups; no number for anything else
          p: snap && snap.setup && elig.eligible ? evaluate(c.coin, snap, null, null, elig).pModel : null,
          at: now,
        }
        cache.set(c.coin, hit)
        out.push(hit)
      }
      for (const [k, v] of cache) if (Date.now() - v.at > 10 * REUSE_MS) cache.delete(k)
      hits.value = out.sort((a, b) => (Number(b.setup) - Number(a.setup)) || (a.z60 - b.z60))
      scan.lastAt = Date.now()
    } catch (e) {
      scan.error = (e as Error).message
    } finally {
      scan.running = false
    }
  }

  return { hits, scan, run, threshold: MODEL.threshold }
}
