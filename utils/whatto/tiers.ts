/**
 * Liquidity tiers for Whatto odds, by rolling 24-hour quote volume in USDT
 * (the same number the live 24h ticker reports, and the one the trainer
 * computes from 1-minute klines at every setup bar).
 * A tier only gets odds if it passed the edge rule out of sample (see MODEL.md).
 */
export interface Tier { id: string; label: string; min: number }
export const TIERS: Tier[] = [
  { id: 'A', label: '≥ $100M / 24h', min: 100e6 },
  { id: 'B', label: '$20M–100M / 24h', min: 20e6 },
  { id: 'C', label: '$5M–20M / 24h', min: 5e6 },
  { id: 'D', label: '$1M–5M / 24h', min: 1e6 },
  { id: 'E', label: '< $1M / 24h', min: 0 },
]
export function tierOf(quoteVol24h: number): string {
  for (const t of TIERS) if (quoteVol24h >= t.min) return t.id
  return 'E'
}
