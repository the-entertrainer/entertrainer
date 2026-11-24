/**
 * Whatto live market feed.
 *
 * Primary: Binance public market-data endpoints (keyless, CORS-open):
 *   REST  https://data-api.binance.vision/api/v3/klines   (history + gap backfill)
 *   WS    wss://data-stream.binance.vision/stream?streams=  (aggTrade, depth20@100ms, kline_1m)
 * Fallback: Coinbase Exchange public feed (REST candles + WS ticker/matches).
 *   Coinbase has no taker-buy volume history, so the model pauses on fallback
 *   and the UI says so instead of guessing.
 *
 * Reliability: exponential backoff with jitter, 12 s staleness watchdog,
 * navigator.onLine handling, REST backfill of missed closed bars after every
 * reconnect so the feature engine never sees a gap it didn't know about.
 */
import { FeatureEngine, barFromKlineRow, type Bar, type FeatureSnapshot } from '~/utils/whatto/features'
import { evaluate, type BookStats, type ModelReading } from '~/utils/whatto/model'
import { COIN_BY_ID } from '~/utils/whatto/coins'

export type FeedStatus = 'idle' | 'connecting' | 'live' | 'stale' | 'reconnecting' | 'offline'
export type FeedSource = 'binance' | 'coinbase'

export const BINANCE_REST = 'https://data-api.binance.vision/api/v3'
export const BINANCE_WS = 'wss://data-stream.binance.vision/stream?streams='
export const COINBASE_REST = 'https://api.exchange.coinbase.com'
export const COINBASE_WS = 'wss://ws-feed.exchange.coinbase.com'

export interface Trade { t: number; p: number; q: number; buy: boolean }
export interface Level { p: number; q: number }

export interface CoinState {
  coin: string
  bars: Bar[]
  forming: Bar | null
  lastPrice: number
  lastTradeAt: number
  trades: Trade[]
  bids: Level[]
  asks: Level[]
  book: BookStats | null
  snapshot: FeatureSnapshot | null
  reading: ModelReading | null
  historyLoaded: boolean
  error: string | null
}

export interface FeedEvents {
  onTick?: () => void
  onBarClose?: (coin: string, reading: ModelReading | null) => void
  onStatus?: (s: FeedStatus) => void
}

const STALE_MS = 12_000
const MAX_BACKOFF = 30_000
const KEEP_BARS = 1500

async function fetchJson<T>(url: string, timeoutMs = 10_000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as T
  } finally {
    clearTimeout(timer)
  }
}

export function bookStats(bids: Level[], asks: Level[], topN = 10): BookStats | null {
  if (!bids.length || !asks.length) return null
  const mid = (bids[0].p + asks[0].p) / 2
  let bq = 0, aq = 0, depth = 0
  for (const l of bids.slice(0, topN)) bq += l.p * l.q
  for (const l of asks.slice(0, topN)) aq += l.p * l.q
  for (const l of bids) if (l.p >= mid * 0.999) depth += l.p * l.q
  for (const l of asks) if (l.p <= mid * 1.001) depth += l.p * l.q
  return { imbalance: (bq - aq) / (bq + aq || 1), spread: (asks[0].p - bids[0].p) / mid, depthQuote: depth, levels: Math.min(bids.length, asks.length) }
}

export class MarketFeed {
  coins: Record<string, CoinState> = {}
  status: FeedStatus = 'idle'
  source: FeedSource = 'binance'
  lastMessageAt = 0
  reconnects = 0
  newsScores: Record<string, number | null> = {}
  private ws: WebSocket | null = null
  private attempt = 0
  private binanceFailures = 0
  private watchdog: ReturnType<typeof setInterval> | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private engines: Record<string, FeatureEngine> = {}
  private stopped = false
  private ev: FeedEvents

  constructor(ev: FeedEvents = {}) {
    this.ev = ev
  }

  private setStatus(s: FeedStatus) {
    if (this.status === s) return
    this.status = s
    this.ev.onStatus?.(s)
  }

  async start(coins: string[]) {
    this.stopped = false
    for (const c of coins) this.ensureCoin(c)
    window.addEventListener('online', this.onOnline)
    window.addEventListener('offline', this.onOffline)
    if (!navigator.onLine) { this.setStatus('offline'); return }
    await this.loadHistory(coins)
    this.connect()
    this.watchdog = setInterval(this.checkStale, 2000)
  }

  stop() {
    this.stopped = true
    window.removeEventListener('online', this.onOnline)
    window.removeEventListener('offline', this.onOffline)
    if (this.watchdog) clearInterval(this.watchdog)
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.closeSocket()
    this.setStatus('idle')
  }

  /** Change the watchlist without losing state for coins that stay. */
  async setCoins(coins: string[]) {
    for (const c of Object.keys(this.coins)) if (!coins.includes(c)) { delete this.coins[c]; delete this.engines[c] }
    const added = coins.filter(c => !this.coins[c])
    for (const c of added) this.ensureCoin(c)
    if (added.length) await this.loadHistory(added)
    this.closeSocket()
    this.connect()
  }

  private ensureCoin(coin: string) {
    if (this.coins[coin]) return
    this.coins[coin] = {
      coin, bars: [], forming: null, lastPrice: NaN, lastTradeAt: 0, trades: [], bids: [], asks: [],
      book: null, snapshot: null, reading: null, historyLoaded: false, error: null,
    }
    this.engines[coin] = new FeatureEngine(KEEP_BARS)
  }

  private onOnline = () => { this.attempt = 0; this.backfillAndReconnect() }
  private onOffline = () => { this.closeSocket(); this.setStatus('offline') }

  private checkStale = () => {
    if (this.stopped || this.status === 'offline') return
    if (!navigator.onLine) { this.onOffline(); return }
    if (this.status === 'live' && Date.now() - this.lastMessageAt > STALE_MS) {
      this.setStatus('stale')
      this.closeSocket()
      this.scheduleReconnect()
    }
  }

  /* ---------------- history ---------------- */

  async loadHistory(coins: string[]) {
    await Promise.all(coins.map(async (coin) => {
      const st = this.coins[coin]
      try {
        const bars = this.source === 'binance' ? await this.binanceKlines(coin) : await this.coinbaseCandles(coin)
        const now = Date.now()
        // keep closed bars only; the still-forming bar comes from the live stream
        const closed = bars.filter(b => b.t + 60_000 <= now)
        const eng = new FeatureEngine(KEEP_BARS)
        let snap: FeatureSnapshot | null = null
        for (const b of closed) snap = eng.push(b) ?? snap
        this.engines[coin] = eng
        st.bars = eng.bars
        st.snapshot = snap
        st.lastPrice = closed.length ? closed[closed.length - 1].c : NaN
        st.historyLoaded = true
        st.error = null
        this.reevaluate(coin)
      } catch (e) {
        st.error = `Could not load price history (${(e as Error).message}).`
      }
    }))
    this.ev.onTick?.()
  }

  private async binanceKlines(coin: string, startTime?: number): Promise<Bar[]> {
    const sym = COIN_BY_ID[coin].symbol
    const url = `${BINANCE_REST}/klines?symbol=${sym}&interval=1m&limit=1000${startTime ? `&startTime=${startTime}` : ''}`
    const rows = await fetchJson<(string | number)[][]>(url)
    return rows.map(barFromKlineRow)
  }

  private async coinbaseCandles(coin: string): Promise<Bar[]> {
    const prod = COIN_BY_ID[coin].coinbase
    // Coinbase returns [time(s), low, high, open, close, volume], newest first, max 300.
    const rows = await fetchJson<number[][]>(`${COINBASE_REST}/products/${prod}/candles?granularity=60`)
    return rows.map(r => ({ t: r[0] * 1000, l: r[1], h: r[2], o: r[3], c: r[4], v: r[5], qv: r[5] * r[4], tbv: NaN })).sort((a, b) => a.t - b.t)
  }

  private async backfill() {
    if (this.source !== 'binance') return
    await Promise.all(Object.keys(this.coins).map(async (coin) => {
      const eng = this.engines[coin]
      const last = eng.bars[eng.bars.length - 1]
      if (!last) return
      try {
        const bars = await this.binanceKlines(coin, last.t + 60_000)
        const now = Date.now()
        let pushed = false
        for (const b of bars) if (b.t + 60_000 <= now) { eng.push(b); pushed = true }
        if (pushed) { this.coins[coin].snapshot = eng.snapshot(); this.reevaluate(coin) }
      } catch { /* next reconnect tries again */ }
    }))
  }

  private async backfillAndReconnect() {
    if (this.stopped) return
    this.setStatus('reconnecting')
    await this.backfill()
    this.connect()
  }

  /* ---------------- websocket ---------------- */

  private closeSocket() {
    if (!this.ws) return
    const ws = this.ws
    this.ws = null
    ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null
    try { ws.close() } catch { /* ignore */ }
  }

  private scheduleReconnect() {
    if (this.stopped || this.retryTimer) return
    if (!navigator.onLine) { this.setStatus('offline'); return }
    this.setStatus('reconnecting')
    const delay = Math.min(MAX_BACKOFF, 1000 * 2 ** this.attempt) * (0.7 + Math.random() * 0.6)
    this.attempt++
    this.reconnects++
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      // After 3 straight Binance failures without a single message, try Coinbase.
      if (this.source === 'binance' && this.binanceFailures >= 3) void this.switchSource('coinbase')
      else if (this.source === 'coinbase' && this.attempt % 4 === 0) void this.switchSource('binance')
      else void this.backfillAndReconnect()
    }, delay)
  }

  private async switchSource(src: FeedSource) {
    this.source = src
    this.binanceFailures = 0
    for (const c of Object.values(this.coins)) { c.bids = []; c.asks = []; c.book = null; c.trades = []; c.forming = null }
    await this.loadHistory(Object.keys(this.coins))
    this.connect()
  }

  connect() {
    if (this.stopped) return
    this.closeSocket()
    const coins = Object.keys(this.coins)
    if (!coins.length) return
    if (this.status !== 'reconnecting') this.setStatus('connecting')
    let gotMessage = false
    let ws: WebSocket
    try {
      if (this.source === 'binance') {
        const streams = coins.flatMap((c) => {
          const s = COIN_BY_ID[c].symbol.toLowerCase()
          return [`${s}@aggTrade`, `${s}@depth20@100ms`, `${s}@kline_1m`]
        })
        ws = new WebSocket(BINANCE_WS + streams.join('/'))
      } else {
        ws = new WebSocket(COINBASE_WS)
      }
    } catch {
      this.scheduleReconnect()
      return
    }
    this.ws = ws
    ws.onopen = () => {
      if (this.source === 'coinbase') {
        ws.send(JSON.stringify({ type: 'subscribe', product_ids: coins.map(c => COIN_BY_ID[c].coinbase), channels: ['matches', 'heartbeat'] }))
      }
    }
    ws.onmessage = (e) => {
      if (!gotMessage) {
        gotMessage = true
        this.attempt = 0
        if (this.source === 'binance') this.binanceFailures = 0
      }
      this.lastMessageAt = Date.now()
      if (this.status !== 'live') this.setStatus('live')
      try {
        if (this.source === 'binance') this.onBinance(JSON.parse(e.data as string))
        else this.onCoinbase(JSON.parse(e.data as string))
      } catch { /* malformed frame: ignore */ }
    }
    ws.onerror = () => { /* onclose follows */ }
    ws.onclose = () => {
      if (this.ws !== ws) return
      this.ws = null
      if (!gotMessage && this.source === 'binance') this.binanceFailures++
      this.scheduleReconnect()
    }
  }

  private coinFromSymbol(sym: string): string | null {
    for (const c of Object.keys(this.coins)) if (COIN_BY_ID[c].symbol === sym.toUpperCase()) return c
    return null
  }

  private onBinance(msg: { stream: string; data: Record<string, unknown> }) {
    const [symLower, kind] = msg.stream.split('@')
    const coin = this.coinFromSymbol(symLower)
    if (!coin) return
    const st = this.coins[coin]
    const d = msg.data as Record<string, any>
    if (kind === 'aggTrade') {
      const tr: Trade = { t: d.T, p: +d.p, q: +d.q, buy: !d.m }
      st.trades.push(tr)
      if (st.trades.length > 4000) st.trades.splice(0, st.trades.length - 3000)
      st.lastPrice = tr.p
      st.lastTradeAt = tr.t
    } else if (kind.startsWith('depth')) {
      st.bids = (d.bids as string[][]).map(l => ({ p: +l[0], q: +l[1] }))
      st.asks = (d.asks as string[][]).map(l => ({ p: +l[0], q: +l[1] }))
      st.book = bookStats(st.bids, st.asks)
    } else if (kind === 'kline_1m') {
      const k = d.k
      const bar: Bar = { t: k.t, o: +k.o, h: +k.h, l: +k.l, c: +k.c, v: +k.v, qv: +k.q, tbv: +k.V }
      if (k.x) {
        st.forming = null
        this.closeBar(coin, bar)
      } else {
        const eng = this.engines[coin]
        const last = eng.bars[eng.bars.length - 1]
        // If we missed a close (e.g. tab asleep), backfill before showing the new bar.
        if (last && bar.t - last.t > 60_000) void this.backfill()
        st.forming = bar
        if (!st.lastTradeAt) st.lastPrice = bar.c
      }
    }
    this.ev.onTick?.()
  }

  private onCoinbase(msg: Record<string, any>) {
    if (msg.type !== 'match' && msg.type !== 'last_match') return
    const coin = Object.keys(this.coins).find(c => COIN_BY_ID[c].coinbase === msg.product_id)
    if (!coin) return
    const st = this.coins[coin]
    const t = Date.parse(msg.time)
    const p = +msg.price, q = +msg.size
    // Coinbase "side" is the maker side; taker bought when maker side is "sell".
    st.trades.push({ t, p, q, buy: msg.side === 'sell' })
    if (st.trades.length > 4000) st.trades.splice(0, st.trades.length - 3000)
    st.lastPrice = p
    st.lastTradeAt = t
    const bt = Math.floor(t / 60_000) * 60_000
    const f = st.forming
    if (f && f.t === bt) {
      f.h = Math.max(f.h, p); f.l = Math.min(f.l, p); f.c = p; f.v += q; f.qv += p * q
    } else {
      if (f && bt > f.t) this.closeBar(coin, { ...f })
      st.forming = { t: bt, o: p, h: p, l: p, c: p, v: q, qv: p * q, tbv: NaN }
    }
    this.ev.onTick?.()
  }

  private closeBar(coin: string, bar: Bar) {
    const eng = this.engines[coin]
    const snap = eng.push(bar)
    const st = this.coins[coin]
    st.bars = eng.bars
    if (snap) st.snapshot = snap
    this.reevaluate(coin)
    this.ev.onBarClose?.(coin, st.reading)
  }

  reevaluate(coin: string) {
    const st = this.coins[coin]
    if (!st) return
    // Model only runs on Binance data (it needs taker-buy volume, which is what it was trained on).
    if (this.source !== 'binance' || !st.snapshot) { st.reading = null; return }
    st.reading = evaluate(coin, st.snapshot, st.book, this.newsScores[coin] ?? null)
  }
}
