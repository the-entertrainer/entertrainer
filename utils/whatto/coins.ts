/**
 * Coin registry. Whatto covers every TRADING Binance spot pair quoted in USDT;
 * the list arrives at runtime (see composables/whatto/useUniverse.ts). Coin id =
 * Binance base asset (e.g. "PEPE"), pair = base + "USDT".
 *
 * Names come from CoinGecko's own Binance market mapping (coin-ids.json, built by
 * scripts/whatto-coin-names.ts). Ranks come from CoinGecko at runtime. If either is
 * unknown we show the ticker only; nothing is guessed.
 */
import coinIds from './coin-ids.json'

export const QUOTE = 'USDT'
export interface CoinMeta { decimals?: number; name?: string | null; rank?: number | null }

const IDS = (coinIds as { coins: Record<string, [string, string]> }).coins
const META: Record<string, CoinMeta> = {}

/** The six original coins, offered as quick picks during onboarding. */
export const POPULAR = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE']

export function pairOf(coin: string): string { return `${coin}${QUOTE}` }
export function coinOfPair(pair: string): string | null { return pair.endsWith(QUOTE) ? pair.slice(0, -QUOTE.length) : null }
export function geckoId(coin: string): string | null { return IDS[coin]?.[0] ?? null }
export function coinName(coin: string): string | null { return META[coin]?.name ?? IDS[coin]?.[1] ?? null }
export function coinRank(coin: string): number | null { return META[coin]?.rank ?? null }
export function setCoinMeta(coin: string, m: CoinMeta) { META[coin] = { ...META[coin], ...m } }
/** Plausible Binance base asset (they include digits and, rarely, CJK characters). */
export function isCoinId(x: unknown): x is string { return typeof x === 'string' && x.length > 0 && x.length <= 20 && !/[\s/?#&%]/.test(x) }

function autoDecimals(p: number): number {
  const a = Math.abs(p)
  if (a >= 1000) return 2
  if (a >= 1) return 4
  if (a === 0) return 2
  // keep ~4 significant digits for sub-dollar coins
  return Math.min(10, Math.max(4, 3 - Math.floor(Math.log10(a))))
}

export function fmtPrice(coin: string, p: number | undefined | null): string {
  if (p === undefined || p === null || !Number.isFinite(p)) return '—'
  const d = META[coin]?.decimals ?? autoDecimals(p)
  return p.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}
export function fmtUsdCompact(x: number): string {
  if (!Number.isFinite(x)) return '—'
  if (x >= 1e9) return `$${(x / 1e9).toFixed(1)}B`
  if (x >= 1e6) return `$${(x / 1e6).toFixed(1)}M`
  if (x >= 1e3) return `$${(x / 1e3).toFixed(0)}k`
  return `$${x.toFixed(0)}`
}
export function fmtPct(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return '—'
  return `${(x * 100).toFixed(digits)}%`
}
export function fmtSignedPct(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return '—'
  return `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(digits)}%`
}
export function fmtTime(t: number, seconds = false): string {
  return new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}) })
}
export function fmtDateTime(t: number): string {
  return new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
export function fmtAgo(t: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - t) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} d ago`
}
