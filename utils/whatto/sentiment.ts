/**
 * Quantitative headline scoring for Whatto. Not a narrative: every headline
 * gets a number from a fixed, published lexicon; the coin score is a
 * time-decayed average of those numbers. See docs/whatto/MODEL.md section 6.
 *
 * Method (VADER-style, simplified):
 *   raw  = sum of word weights in title (x1) and summary (x0.5), with
 *          a negator in the 3 preceding tokens flipping the sign (x -0.74)
 *   item = raw / sqrt(raw^2 + 15)            -> (-1, 1)
 *   coin = sum(item * w) / (sum(w) + 1),  w = relevance * exp(-age / 6h)
 *          relevance = 1 when the coin is named, 0.3 for market-wide items
 */

export const LEXICON: Record<string, number> = {
  // positive
  surge: 2.5, surges: 2.5, soar: 2.5, soars: 2.5, rally: 2.2, rallies: 2.2, rebound: 1.8, rebounds: 1.8,
  recover: 1.6, recovers: 1.6, recovery: 1.6, gain: 1.4, gains: 1.4, jump: 1.8, jumps: 1.8, climbs: 1.6, climb: 1.6,
  bullish: 2.2, bull: 1.2, breakout: 1.8, record: 1.2, high: 0.6, highs: 0.8, approve: 2.0, approves: 2.0, approved: 2.0,
  approval: 1.8, inflow: 1.6, inflows: 1.6, adoption: 1.4, partnership: 1.2, launch: 0.8, launches: 0.8, upgrade: 1.0,
  buy: 0.8, buys: 0.9, buying: 0.9, accumulate: 1.2, accumulation: 1.2, support: 0.6, optimism: 1.6, upbeat: 1.6,
  boost: 1.4, boosts: 1.4, win: 1.4, wins: 1.4, etf: 0.4, rise: 1.4, rises: 1.4, rising: 1.2, up: 0.4,
  // negative
  crash: -3.0, crashes: -3.0, plunge: -2.6, plunges: -2.6, plummet: -2.6, plummets: -2.6, tumble: -2.2, tumbles: -2.2,
  slump: -2.0, slumps: -2.0, drop: -1.4, drops: -1.4, fall: -1.4, falls: -1.4, falling: -1.3, decline: -1.4, declines: -1.4,
  slide: -1.4, slides: -1.4, sink: -1.6, sinks: -1.6, dump: -2.0, dumps: -2.0, selloff: -2.2, 'sell-off': -2.2,
  bearish: -2.2, bear: -1.2, liquidation: -1.8, liquidations: -1.8, liquidated: -1.8, hack: -2.8, hacked: -2.8,
  exploit: -2.6, exploited: -2.6, breach: -2.4, stolen: -2.6, scam: -2.6, fraud: -2.8, lawsuit: -1.8, sues: -1.8,
  sued: -1.8, ban: -2.2, bans: -2.2, banned: -2.2, crackdown: -2.0, probe: -1.4, investigation: -1.4, charges: -1.6,
  outflow: -1.6, outflows: -1.6, fear: -1.8, panic: -2.4, risk: -0.6, warning: -1.4, warns: -1.4, delay: -1.0,
  delays: -1.0, reject: -2.0, rejects: -2.0, rejected: -2.0, loss: -1.4, losses: -1.6, down: -0.4, low: -0.6, lows: -0.8,
  bankrupt: -3.0, bankruptcy: -3.0, insolvent: -2.8, collapse: -3.0, collapses: -3.0, sell: -0.8, selling: -1.0,
}

const NEGATORS = new Set(['not', 'no', 'never', "isn't", "aren't", "wasn't", "won't", "doesn't", "didn't", 'without', 'despite'])

export const COIN_ALIASES: Record<string, string[]> = {
  BTC: ['bitcoin', 'btc'],
  ETH: ['ethereum', 'eth', 'ether'],
  SOL: ['solana', 'sol'],
  BNB: ['bnb', 'binance coin', 'bnb chain'],
  XRP: ['xrp', 'ripple'],
  DOGE: ['dogecoin', 'doge'],
}

const MARKET_WORDS = ['crypto', 'cryptocurrency', 'market', 'markets', 'altcoin', 'altcoins', 'stablecoin', 'fed', 'sec']

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9'\- ]+/g, ' ').split(/\s+/).filter(Boolean)
}

export interface ScoredWord { word: string; weight: number }
export interface ScoredItem { score: number; words: ScoredWord[] }

export function scoreText(title: string, summary = ''): ScoredItem {
  let raw = 0
  const words: ScoredWord[] = []
  const run = (text: string, mult: number) => {
    const t = tokens(text)
    for (let i = 0; i < t.length; i++) {
      const w = LEXICON[t[i]]
      if (w === undefined) continue
      let v = w * mult
      for (let j = Math.max(0, i - 3); j < i; j++) if (NEGATORS.has(t[j])) { v *= -0.74; break }
      raw += v
      words.push({ word: t[i], weight: +v.toFixed(2) })
    }
  }
  run(title, 1)
  run(summary, 0.5)
  return { score: raw / Math.sqrt(raw * raw + 15), words }
}

export function mentions(coin: string, text: string): 'coin' | 'market' | null {
  const low = ` ${text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')} `
  if ((COIN_ALIASES[coin] ?? [coin.toLowerCase()]).some(a => low.includes(` ${a} `))) return 'coin'
  if (MARKET_WORDS.some(a => low.includes(` ${a} `)) || Object.values(COIN_ALIASES).some(al => al.some(a => low.includes(` ${a} `)))) return 'market'
  return null
}

export const NEWS_TAU_MS = 6 * 3600_000

export interface NewsItem { id: string; source: string; title: string; summary: string; url: string; publishedAt: number }

export function coinNewsScore(coin: string, items: NewsItem[], now = Date.now()) {
  let num = 0, den = 0, n = 0
  for (const it of items) {
    const rel = mentions(coin, `${it.title} ${it.summary}`)
    if (!rel) continue
    const w = (rel === 'coin' ? 1 : 0.3) * Math.exp(-Math.max(0, now - it.publishedAt) / NEWS_TAU_MS)
    num += scoreText(it.title, it.summary).score * w
    den += w
    if (rel === 'coin') n++
  }
  return { score: num / (den + 1), weight: den, coinItems: n }
}
