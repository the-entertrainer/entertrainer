/** Coins Whatto can watch: exactly the pairs the model was trained and evaluated on. */
export interface CoinInfo { id: string; symbol: string; name: string; decimals: number; coinbase: string }
export const COINS: CoinInfo[] = [
  { id: 'BTC', symbol: 'BTCUSDT', name: 'Bitcoin', decimals: 2, coinbase: 'BTC-USD' },
  { id: 'ETH', symbol: 'ETHUSDT', name: 'Ethereum', decimals: 2, coinbase: 'ETH-USD' },
  { id: 'SOL', symbol: 'SOLUSDT', name: 'Solana', decimals: 2, coinbase: 'SOL-USD' },
  { id: 'BNB', symbol: 'BNBUSDT', name: 'BNB', decimals: 2, coinbase: 'BNB-USD' },
  { id: 'XRP', symbol: 'XRPUSDT', name: 'XRP', decimals: 4, coinbase: 'XRP-USD' },
  { id: 'DOGE', symbol: 'DOGEUSDT', name: 'Dogecoin', decimals: 5, coinbase: 'DOGE-USD' },
]
export const COIN_BY_ID: Record<string, CoinInfo> = Object.fromEntries(COINS.map(c => [c.id, c]))

export function fmtPrice(coin: string, p: number | undefined | null): string {
  if (p === undefined || p === null || !Number.isFinite(p)) return '—'
  const d = COIN_BY_ID[coin]?.decimals ?? 2
  return p.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
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
