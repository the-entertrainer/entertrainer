/**
 * Whatto app state: preferences (localStorage), the live MarketFeed, signal
 * history with automatic grading against real prices, news polling and
 * notifications. One instance per page mount.
 */
import { MarketFeed, BINANCE_REST, MAX_WATCH, type FeedStatus } from './marketFeed'
import { useUniverse } from './useUniverse'
import { MODEL, positionSize, type ModelReading, type RiskLevel } from '~/utils/whatto/model'
import { coinNewsScore, type NewsItem } from '~/utils/whatto/sentiment'
import { fmtPct, fmtPrice, isCoinId, pairOf } from '~/utils/whatto/coins'
import { barFromKlineRow } from '~/utils/whatto/features'

export const STORAGE_KEY = 'entertrainer.whatto.v1'

export interface Prefs {
  name: string
  coins: string[]
  risk: RiskLevel
  account: number | null
  notify: boolean
  acknowledged: boolean
  onboarded: boolean
}

export interface HistoryEntry {
  id: string
  coin: string
  t: number
  /** bar-close time when the signal fired (ms) */
  close: number
  pModel: number
  pFinal: number
  target: number
  stop: number
  reboundFrac: number
  hitRate: number
  n: number
  outcome: 'pending' | 'rebounded' | 'missed'
  stopTouchedFirst?: boolean
  maxUp?: number
  gradedAt?: number
}

export interface Toast { id: number; title: string; body: string; tone: 'signal' | 'info' | 'warn' }

const DEFAULT_PREFS: Prefs = { name: '', coins: ['BTC', 'ETH', 'SOL'], risk: 'balanced', account: null, notify: false, acknowledged: false, onboarded: false }

function loadPrefs(): { prefs: Prefs; history: HistoryEntry[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { prefs: { ...DEFAULT_PREFS }, history: [] }
    const p = JSON.parse(raw)
    const coins = Array.isArray(p.prefs?.coins) ? [...new Set(p.prefs.coins.filter(isCoinId) as string[])].slice(0, MAX_WATCH) : DEFAULT_PREFS.coins
    return {
      prefs: { ...DEFAULT_PREFS, ...p.prefs, coins: coins.length ? coins : DEFAULT_PREFS.coins },
      history: Array.isArray(p.history) ? p.history.slice(-200) : [],
    }
  } catch {
    return { prefs: { ...DEFAULT_PREFS }, history: [] }
  }
}

export function signalSentence(name: string, r: ModelReading): string {
  const coin = r.coin
  const ev = r.eval
  const who = name ? `${name}, ` : ''
  if (r.reason === 'signal' && ev) {
    return `${who}${coin} is still falling, but on past data ${Math.round(ev.hitRate * 100)}% of signals like this, on coins with similar 24h volume (tier ${r.tier}), rebounded at least ${fmtPct(r.reboundFrac, 2)} within ${MODEL.horizonMin} minutes (n = ${ev.signals}). For all falling setups in that tier the base rate was ${Math.round(ev.baseRateDeclustered * 100)}%.`
  }
  if (r.reason === 'not-falling') return `${who}${coin} is not in a falling setup right now, so there is nothing to score.`
  if (r.reason === 'no-edge') return `${who}${coin} is falling, but our backtest found no reliable edge for coins at its liquidity, so we stay quiet.`
  if (r.reason === 'thin-liquidity') return `${who}${coin} is falling and the model leans to a bounce, but the order book is thin or seller-heavy, so it stays under our bar.`
  return `${who}${coin} is falling. The model's rebound reading is ${Math.round(r.pFinal * 100)}%, under our ${Math.round(r.threshold * 100)}% bar, so no signal yet.`
}

export function useWhatto() {
  const prefs = ref<Prefs>({ ...DEFAULT_PREFS })
  const history = ref<HistoryEntry[]>([])
  const hydrated = ref(false)
  const status = ref<FeedStatus>('idle')
  const source = ref<'binance' | 'coinbase'>('binance')
  const tick = ref(0)
  const now = ref(Date.now())
  const toasts = ref<Toast[]>([])
  const news = ref<NewsItem[]>([])
  const newsState = ref<{ loading: boolean; error: string | null; fetchedAt: number; sources: { source: string; ok: boolean; count: number }[] }>({ loading: false, error: null, fetchedAt: 0, sources: [] })
  const mempool = ref<{ count: number; vsizeMB: number; fastestFee: number; halfHourFee: number; at: number } | null>(null)
  const notifPermission = ref<NotificationPermission | 'unsupported'>('default')

  const feed = shallowRef<MarketFeed | null>(null)
  const uni = useUniverse()
  let uniHeld = false
  /** OS notifications: at most one per NOTIFY_GAP_MS across all coins (toasts still show). */
  const NOTIFY_GAP_MS = 120_000
  let lastOsNotify = 0
  let tickRaf = 0
  let lastReeval = 0
  const timers: ReturnType<typeof setInterval>[] = []
  let toastId = 0

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ prefs: prefs.value, history: history.value.slice(-200) })) } catch { /* quota / private mode */ }
  }

  function toast(t: Omit<Toast, 'id'>, ms = 7000) {
    const id = ++toastId
    toasts.value = [...toasts.value.slice(-2), { ...t, id }]
    setTimeout(() => { toasts.value = toasts.value.filter(x => x.id !== id) }, ms)
  }

  function scheduleTick() {
    if (tickRaf) return
    tickRaf = requestAnimationFrame(() => {
      tickRaf = 0
      tick.value++
      const f = feed.value
      // Re-apply the live liquidity/news layer every 2 s (model features only change at bar close).
      if (f && Date.now() - lastReeval > 2000) {
        lastReeval = Date.now()
        for (const c of Object.keys(f.coins)) f.reevaluate(c)
      }
    })
  }

  function onBarClose(coin: string, r: ModelReading | null) {
    gradePending()
    if (!r || !r.isSignal || !r.eval) return
    if (!prefs.value.coins.includes(coin)) return // signals, history and alerts are for the watchlist only
    const last = [...history.value].reverse().find(h => h.coin === coin)
    if (last && r.t - last.t < MODEL.cooldownMin * 60_000) return // dedupe: one signal per coin per horizon
    const entry: HistoryEntry = {
      id: `${coin}-${r.t}`, coin, t: r.t + 60_000, close: r.close, pModel: r.pModel, pFinal: r.pFinal,
      target: r.targetPrice, stop: r.stopPrice, reboundFrac: r.reboundFrac,
      hitRate: r.eval.hitRate, n: r.eval.signals, outcome: 'pending',
    }
    history.value = [...history.value, entry]
    persist()
    const body = signalSentence(prefs.value.name, r)
    toast({ title: `${coin} rebound signal`, body, tone: 'signal' }, 12000)
    if (prefs.value.notify && notifPermission.value === 'granted' && Date.now() - lastOsNotify > NOTIFY_GAP_MS) {
      lastOsNotify = Date.now()
      try {
        // tag dedupes at the OS level too
        new Notification(`Whatto · ${coin} rebound signal`, { body, tag: `whatto-${coin}`, icon: '/whatto-icon-192.png' })
      } catch { /* some mobile browsers require a service worker; the in-app toast still shows */ }
    }
  }

  /** Grade pending signals once their horizon has passed, using real 1m klines. */
  async function gradePending() {
    const due = history.value.filter(h => h.outcome === 'pending' && Date.now() > h.t + MODEL.horizonMin * 60_000 + 30_000)
    for (const h of due) {
      try {
        const res = await fetch(`${BINANCE_REST}/klines?symbol=${encodeURIComponent(pairOf(h.coin))}&interval=1m&startTime=${h.t}&limit=${MODEL.horizonMin}`)
        if (!res.ok) continue
        const bars = (await res.json() as (string | number)[][]).map(barFromKlineRow)
        if (bars.length < MODEL.horizonMin) continue
        let maxH = -Infinity, rebounded = false, stopFirst = false
        for (const b of bars) {
          if (!rebounded && b.l <= h.stop) stopFirst = true
          if (b.h >= h.target) rebounded = true
          maxH = Math.max(maxH, b.h)
        }
        history.value = history.value.map(x => x.id === h.id
          ? { ...x, outcome: rebounded ? 'rebounded' : 'missed', maxUp: maxH / x.close - 1, stopTouchedFirst: stopFirst, gradedAt: Date.now() }
          : x)
        persist()
      } catch { /* retry next minute */ }
    }
  }

  async function loadNews() {
    newsState.value = { ...newsState.value, loading: true }
    try {
      const res = await fetch('/api/whatto/news')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { fetchedAt: number; items: NewsItem[]; sources: { source: string; ok: boolean; count: number }[] }
      news.value = data.items
      newsState.value = { loading: false, error: null, fetchedAt: data.fetchedAt, sources: data.sources }
      applyNews()
    } catch (e) {
      newsState.value = { ...newsState.value, loading: false, error: (e as Error).message }
    }
  }

  function applyNews() {
    const f = feed.value
    if (!f) return
    for (const c of Object.keys(f.coins)) {
      const s = coinNewsScore(c, news.value)
      f.newsScores[c] = s.weight > 0 ? s.score : null
      f.reevaluate(c)
    }
    scheduleTick()
  }

  async function loadMempool() {
    if (!prefs.value.coins.includes('BTC')) return
    try {
      const [mp, fees] = await Promise.all([
        fetch('https://mempool.space/api/mempool').then(r => r.json()),
        fetch('https://mempool.space/api/v1/fees/recommended').then(r => r.json()),
      ])
      mempool.value = { count: mp.count, vsizeMB: mp.vsize / 1e6, fastestFee: fees.fastestFee, halfHourFee: fees.halfHourFee, at: Date.now() }
    } catch { /* optional context only */ }
  }

  async function start() {
    if (!uniHeld) { uni.acquire(); uniHeld = true }
    const f = new MarketFeed({
      quoteVol: c => uni.get(c)?.qv24,
      onTick: scheduleTick,
      onStatus: (s) => {
        const prev = status.value
        status.value = s
        source.value = f.source
        if (s === 'live' && (prev === 'reconnecting' || prev === 'offline' || prev === 'stale')) toast({ title: 'Back live', body: 'Missed minutes were backfilled from Binance.', tone: 'info' }, 4000)
        scheduleTick()
      },
      onBarClose,
    })
    feed.value = f
    await f.start(prefs.value.coins)
    source.value = f.source
    void loadNews()
    void loadMempool()
    void gradePending()
    timers.push(setInterval(() => { now.value = Date.now() }, 1000))
    timers.push(setInterval(loadNews, 120_000))
    timers.push(setInterval(loadMempool, 60_000))
    timers.push(setInterval(gradePending, 60_000))
    scheduleTick()
  }

  function stop() {
    feed.value?.stop()
    if (uniHeld) { uni.release(); uniHeld = false }
    for (const t of timers) clearInterval(t)
    timers.length = 0
    if (tickRaf) cancelAnimationFrame(tickRaf)
  }

  function hydrate() {
    const loaded = loadPrefs()
    prefs.value = loaded.prefs
    history.value = loaded.history
    notifPermission.value = typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
    hydrated.value = true
  }

  async function savePrefs(patch: Partial<Prefs>) {
    if (patch.coins) patch = { ...patch, coins: [...new Set(patch.coins)].slice(0, MAX_WATCH) }
    const coinsChanged = patch.coins && patch.coins.join() !== prefs.value.coins.join()
    prefs.value = { ...prefs.value, ...patch }
    persist()
    if (coinsChanged && feed.value) {
      await feed.value.setCoins(prefs.value.coins)
      applyNews()
      void loadMempool()
    }
  }

  async function requestNotifications(): Promise<boolean> {
    if (typeof Notification === 'undefined') { notifPermission.value = 'unsupported'; return false }
    const p = await Notification.requestPermission()
    notifPermission.value = p
    return p === 'granted'
  }

  function clearHistory() { history.value = []; persist() }
  function resetAll() {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    prefs.value = { ...DEFAULT_PREFS }
    history.value = []
  }

  /** View any coin: streams it on demand (released when you view another or leave). */
  async function viewCoin(coin: string | null) {
    const f = feed.value
    if (!f) return
    await f.setFocus(coin && !prefs.value.coins.includes(coin) ? coin : null)
    applyNews()
  }
  function toggleWatch(coin: string): boolean {
    const cur = prefs.value.coins
    if (cur.includes(coin)) {
      if (cur.length <= 1) { toast({ title: 'Keep one coin', body: 'Your watchlist needs at least one coin.', tone: 'info' }, 3500); return false }
      void savePrefs({ coins: cur.filter(c => c !== coin) })
      return true
    }
    if (cur.length >= MAX_WATCH) { toast({ title: 'Watchlist is full', body: `Up to ${MAX_WATCH} coins stream live at once. Remove one first.`, tone: 'warn' }, 4500); return false }
    void savePrefs({ coins: [...cur, coin] })
    return true
  }

  const sizing = (r: ModelReading) => positionSize(prefs.value.risk, r.stopFrac, prefs.value.account ?? undefined)

  return {
    prefs, history, hydrated, status, source, tick, now, toasts, news, newsState, mempool, notifPermission, feed,
    hydrate, start, stop, savePrefs, viewCoin, toggleWatch, uni, requestNotifications, clearHistory, resetAll, loadNews, toast, sizing, fmtPrice,
  }
}

export type WhattoApi = ReturnType<typeof useWhatto>
