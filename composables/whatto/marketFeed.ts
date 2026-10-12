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
 * Streams: 3 per coin (aggTrade, depth20@100ms, kline_1m) on ONE combined connection.
 * Coins = watchlist + at most one on-demand coin being viewed, capped at MAX_FEED_COINS
 * (39 streams, far under Binance's 1024-per-connection limit). Viewing another coin
 * sends SUBSCRIBE/UNSUBSCRIBE on the open socket (throttled well under 5 msgs/s) and
 * drops that coin's state when you leave, so memory stays bounded.
 *
 * Reliability: exponential backoff with jitter, 12 s staleness watchdog,
 * navigator.onLine handling, REST backfill of missed closed bars after every
 * reconnect so the feature engine never sees a gap it didn't know about.
 */
import { FeatureEngine, barFromKlineRow, type Bar, type FeatureSnapshot } from '~/utils/whatto/features'
import { eligibility, evaluate, type BookStats, type Eligibility, type ModelReading } from '~/utils/whatto/model'
import { pairOf } from '~/utils/whatto/coins'

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
  /** odds eligibility (history + liquidity tier); null until 24h volume is known */
  elig: Eligibility | null
  historyLoaded: boolean
  error: string | null
}

export interface FeedEvents {
  onTick?: () => void
  onBarClose?: (coin: string, reading: ModelReading | null) => void
  onStatus?: (s: FeedStatus) => void
  /** live 24h quote volume for a coin (from the all-market ticker) */
  quoteVol?: (coin: string) => number | undefined
}

export const MAX_WATCH = 12
export const MAX_FEED_COINS = MAX_WATCH + 1

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
  private focus: string | null = null
  private watch: string[] = []
  private subscribed = new Set<string>()
  private ctlQueue: string[] = []
  private ctlTimer: ReturnType<typeof setTimeout> | null = null
  private ctlId = 1

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
    this.watch = coins.slice(0, MAX_WATCH)
    coins = this.wanted()
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
    if (this.ctlTimer) clearTimeout(this.ctlTimer)
    this.ctlTimer = null
    this.ctlQueue = []
    this.closeSocket()
    this.setStatus('idle')
  }

  private wanted(): string[] {
    const w = [...this.watch]
    if (this.focus && !w.includes(this.focus)) w.push(this.focus)
    return w.slice(0, MAX_FEED_COINS)
  }

  /** Change the watchlist without losing state for coins that stay. */
  async setCoins(coins: string[]) {
    this.watch = coins.slice(0, MAX_WATCH)
    await this.sync()
  }

  /** Stream one more coin on demand (the coin being viewed); null releases it. */
  async setFocus(coin: string | null) {
    if (this.focus === coin) return
    this.focus = coin
    await this.sync()
  }

  private async sync() {
    const want = this.wanted()
    for (const c of Object.keys(this.coins)) if (!want.includes(c)) { delete this.coins[c]; delete this.engines[c]; delete this.newsScores[c] }
    const added = want.filter(c => !this.coins[c])
    for (const c of added) this.ensureCoin(c)
    this.ev.onTick?.()
    if (this.stopped) return
    if (this.source === 'binance' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      // live re-subscription on the same connection
      const want3 = new Set(want.flatMap(c => this.streamsFor(c)))
      const unsub = [...this.subscribed].filter(s => !want3.has(s))
      const sub = [...want3].filter(s => !this.subscribed.has(s))
      if (unsub.length) this.control('UNSUBSCRIBE', unsub)
      if (sub.length) this.control('SUBSCRIBE', sub)
      if (added.length) await this.loadHistory(added)
    } else {
      if (added.length) await this.loadHistory(added)
      this.closeSocket()
      this.connect()
    }
  }

  private streamsFor(coin: string): string[] {
    const s = pairOf(coin).toLowerCase()
    return [`${s}@aggTrade`, `${s}@depth20@100ms`, `${s}@kline_1m`]
  }

  /** Binance allows 5 incoming control messages per second per connection; we send at most ~3. */
  private control(method: 'SUBSCRIBE' | 'UNSUBSCRIBE', params: string[]) {
    for (const p of params) { if (method === 'SUBSCRIBE') this.subscribed.add(p); else this.subscribed.delete(p) }
    this.ctlQueue.push(JSON.stringify({ method, params, id: this.ctlId++ }))
    this.pumpControl()
  }
  private pumpControl() {
    if (this.ctlTimer || !this.ctlQueue.length) return
    const msg = this.ctlQueue.shift()!
    try { this.ws?.send(msg) } catch { /* reconnect will resubscribe from scratch */ }
    this.ctlTimer = setTimeout(() => { this.ctlTimer = null; this.pumpControl() }, 350)
  }

  /** Streams currently open on the socket (for QA / debugging). */
  get streamCount() { return this.source === 'binance' ? this.subscribed.size : Object.keys(this.coins).length }

  private ensureCoin(coin: string) {
    if (this.coins[coin]) return
    this.coins[coin] = {
      coin, bars: [], forming: null, lastPrice: NaN, lastTradeAt: 0, trades: [], bids: [], asks: [],
      book: null, snapshot: null, reading: null, elig: null, historyLoaded: false, error: null,
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
    const sym = encodeURIComponent(pairOf(coin))
    const url = `${BINANCE_REST}/klines?symbol=${sym}&interval=1m&limit=1000${startTime ? `&startTime=${startTime}` : ''}`
    const rows = await fetchJson<(string | number)[][]>(url)
    return rows.map(barFromKlineRow)
  }

  private async coinbaseCandles(coin: string): Promise<Bar[]> {
    const prod = `${coin}-USD`
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
        const streams = coins.flatMap(c => this.streamsFor(c))
        this.subscribed = new Set(streams)
        this.ctlQueue = []
        ws = new WebSocket(BINANCE_WS + streams.map(encodeURIComponent).join('/'))
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
        ws.send(JSON.stringify({ type: 'subscribe', product_ids: coins.map(c => `${c}-USD`), channels: ['matches', 'heartbeat'] }))
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
    for (const c of Object.keys(this.coins)) if (pairOf(c).toLowerCase() === sym) return c
    return null
  }

  private onBinance(msg: { stream: string; data: Record<string, unknown> }) {
    if (!msg.stream) return // SUBSCRIBE/UNSUBSCRIBE acks: { result: null, id }
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
    const coin = Object.keys(this.coins).find(c => `${c}-USD` === msg.product_id)
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
    st.elig = eligibility(coin, this.ev.quoteVol?.(coin))
    // No odds for coins outside the eligible history/liquidity tiers: never a made-up number.
    if (this.source !== 'binance' || !st.snapshot || !st.elig.eligible) { st.reading = null; return }
    st.reading = evaluate(coin, st.snapshot, st.book, this.newsScores[coin] ?? null, st.elig)
  }
}
