/**
 * Applies the offline-fitted logistic model (model-v2.json) to a live
 * FeatureSnapshot and adds the two documented live-only adjustments:
 *   1. liquidity / order-book layer: can only SHRINK toward the base rate
 *   2. news sentiment: bounded logit nudge, |delta| <= NEWS_MAX_LOGIT
 * Neither adjustment can create a signal on its own: a signal needs the
 * backtested model probability AND the adjusted probability over threshold.
 */
import modelJson from './model-v2.json'
import { FEATURE_NAMES, type FeatureSnapshot } from './features'
import { tierOf, type Tier } from './tiers'

export interface CoinEval {
  setups: number
  setupsDeclustered: number
  auc: number
  brier: number
  brierBase: number
  baseRate: number
  baseRateDeclustered: number
  signals: number
  hits: number
  hitRate: number
  hitRateCI95: [number, number]
  stopFirstRate: number
  meanFwdReturnSignals: number
  meanFwdReturnSetups: number
  medianReboundTarget: number
  edge: boolean
}

export interface TierEval extends CoinEval { coins: number }
export interface CoinBrief { n: number; auc: number; brier: number; brierBase: number; signals: number; hitRate: number; baseRateDeclustered: number }

export interface HistoricalSignal { coin: string; tier?: string; t: number; close: number; p: number; rebounded: boolean; reboundFrac: number; fwd30: number }

export interface WhattoModel {
  name: string
  version: number
  trainedAt: string
  source: string
  symbols: string[]
  months: string[]
  horizonMin: number
  reboundK: number
  stopK: number
  setupZ60: number
  cooldownMin: number
  label: string
  features: string[]
  mean: number[]
  std: number[]
  intercept: number
  coef: number[]
  platt: { a: number; b: number }
  threshold: number
  tiers: Tier[]
  evaluation: {
    method: string
    folds: { test: string; n: number; auc: number; brier: number; baseRate: number; signals: number; hitRate: number; threshold: number }[]
    pooled: Omit<CoinEval, 'edge'>
    perTier: Record<string, TierEval>
    perCoin: Record<string, CoinBrief>
    reliability: { meanP: number; observed: number; n: number }[]
  }
  historicalSignals: HistoricalSignal[]
}

export const MODEL = modelJson as unknown as WhattoModel
const TRAINED = new Set(MODEL.symbols)

export interface Eligibility {
  eligible: boolean
  tier: string
  tierLabel: string
  /** why there are no odds, in plain words (empty when eligible) */
  why: string
  eval: TierEval | undefined
}

/**
 * Odds are shown only when BOTH hold:
 *  - history: the pair was in the training universe (full 1m history over every training month);
 *  - liquidity: its live 24h quote volume puts it in a tier that passed the edge rule out of sample.
 * Everything else gets live data and an honest "no odds" state, never a number.
 */
export function eligibility(coin: string, quoteVol24h: number | null | undefined): Eligibility {
  const qv = Number.isFinite(quoteVol24h as number) ? quoteVol24h as number : 0
  const tier = tierOf(qv)
  const t = MODEL.tiers.find(x => x.id === tier)
  const ev = MODEL.evaluation.perTier[tier]
  const base = { tier, tierLabel: t?.label ?? '', eval: ev?.setups ? ev : undefined }
  if (!TRAINED.has(`${coin}USDT`)) {
    return { ...base, eligible: false, why: `${coin} was not in the ${MODEL.symbols.length} pairs the model was trained and tested on (it needed full 1-minute history from ${MODEL.months[0]} and enough volume), so there is not enough history for odds.` }
  }
  if (!quoteVol24h) return { ...base, eligible: false, why: 'Waiting for 24-hour volume to place this coin in a liquidity tier.' }
  if (!ev?.edge) {
    return { ...base, eligible: false, why: `Right now ${coin} trades ${t?.label ?? ''}, and coins at that liquidity showed no reliable edge out of sample, so there is not enough liquidity for odds.` }
  }
  return { ...base, eligible: true, why: '' }
}

export const NEWS_MAX_LOGIT = 0.1
export const NEWS_WEIGHT = 0.1

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
const logit = (p: number) => Math.log(p / (1 - p))

export interface BookStats {
  /** (bidQty - askQty)/(bidQty + askQty) over the top N levels, quote-weighted. */
  imbalance: number
  /** relative spread, e.g. 0.0001 = 1 bp */
  spread: number
  /** quote value within 0.1% of mid on each side (sum) */
  depthQuote: number
  levels: number
}

export interface Contribution { name: string; label: string; value: number; logit: number }

export interface ModelReading {
  coin: string
  t: number
  close: number
  setup: boolean
  /** calibrated model probability, from backtested features only */
  pModel: number
  /** after liquidity shrink + news nudge */
  pFinal: number
  liquidityFactor: number
  bookNote: string
  newsLogit: number
  contributions: Contribution[]
  threshold: number
  edge: boolean
  eval: CoinEval | undefined
  tier: string
  isSignal: boolean
  reboundFrac: number
  stopFrac: number
  targetPrice: number
  stopPrice: number
  reason: 'signal' | 'not-falling' | 'below-threshold' | 'no-edge' | 'thin-liquidity'
}

export const FEATURE_LABELS: Record<string, string> = {
  z15: '15-min move (σ)',
  z60: '60-min move (σ)',
  dd120: 'Drawdown from 2h high (σ)',
  rsi14: 'RSI 14 (centred)',
  volRatio: 'Short/long volatility',
  flow5: 'Buyer share, 5 min',
  dflow: 'Buyer share shift',
  vwapDev: 'Distance from VWAP (σ)',
  volSpike: 'Volume spike',
  wick3: 'Lower wicks',
  cusumUp: 'CUSUM up-shift',
  cpProb: 'Change-point prob.',
  regimeDrift: 'Regime drift',
}

export function evaluate(coin: string, snap: FeatureSnapshot, book: BookStats | null, newsScore: number | null, elig: Eligibility): ModelReading {
  const m = MODEL
  let z = m.intercept
  const contributions: Contribution[] = []
  for (let k = 0; k < FEATURE_NAMES.length; k++) {
    const zx = (snap.vector[k] - m.mean[k]) / m.std[k]
    const c = m.coef[k] * zx * m.platt.a
    z += m.coef[k] * zx
    contributions.push({ name: FEATURE_NAMES[k], label: FEATURE_LABELS[FEATURE_NAMES[k]], value: snap.vector[k], logit: c })
  }
  const pModel = sigmoid(m.platt.a * z + m.platt.b)
  const ev = elig.eval
  const base = ev?.baseRateDeclustered ?? m.evaluation.pooled.baseRateDeclustered

  // Liquidity layer: shrink toward base rate when the book is thin / wide or leaning against the bounce.
  let liquidityFactor = 1
  let bookNote = 'Order book not available on this feed; no liquidity adjustment.'
  if (book && book.levels > 0) {
    const spreadPenalty = book.spread > 0.0005 ? Math.min(1, (book.spread - 0.0005) / 0.002) : 0
    const askHeavy = book.imbalance < -0.3 ? Math.min(1, (-book.imbalance - 0.3) / 0.5) : 0
    liquidityFactor = 1 - 0.5 * spreadPenalty - 0.3 * askHeavy
    bookNote = askHeavy > 0
      ? 'Sellers stack the top of the book, so the reading is pulled toward the base rate.'
      : spreadPenalty > 0 ? 'Spread is wide, so the reading is pulled toward the base rate.' : 'Book depth and spread look normal; no adjustment.'
  }
  let p = base + (pModel - base) * liquidityFactor

  let newsLogit = 0
  if (newsScore !== null && Number.isFinite(newsScore)) {
    newsLogit = Math.max(-NEWS_MAX_LOGIT, Math.min(NEWS_MAX_LOGIT, NEWS_WEIGHT * newsScore))
    p = sigmoid(logit(Math.min(0.999, Math.max(0.001, p))) + newsLogit)
  }
  contributions.sort((a, b) => Math.abs(b.logit) - Math.abs(a.logit))

  const reboundFrac = snap.reboundFrac
  const stopFrac = 1 - Math.exp(-m.stopK * snap.sigmaL * Math.sqrt(m.horizonMin))
  const edge = elig.eligible
  let reason: ModelReading['reason'] = 'signal'
  if (!snap.setup) reason = 'not-falling'
  else if (!edge) reason = 'no-edge'
  else if (pModel < m.threshold) reason = 'below-threshold'
  else if (p < m.threshold) reason = liquidityFactor < 1 ? 'thin-liquidity' : 'below-threshold'

  return {
    coin, t: snap.t, close: snap.close, setup: snap.setup,
    pModel, pFinal: p, liquidityFactor, bookNote, newsLogit, contributions,
    threshold: m.threshold, edge, eval: ev, tier: elig.tier, isSignal: reason === 'signal',
    reboundFrac, stopFrac,
    targetPrice: snap.close * (1 + reboundFrac),
    stopPrice: snap.close * (1 - stopFrac),
    reason,
  }
}

export type RiskLevel = 'careful' | 'balanced' | 'bold'
export const RISK_PCT: Record<RiskLevel, number> = { careful: 0.0025, balanced: 0.005, bold: 0.01 }

/** Fixed-fractional sizing: position = (account * risk%) / stop distance. Capped at 100% of account. */
export function positionSize(risk: RiskLevel, stopFrac: number, account?: number) {
  const riskPct = RISK_PCT[risk]
  const fraction = Math.min(1, riskPct / Math.max(stopFrac, 1e-6))
  return { riskPct, fraction, amount: account && account > 0 ? account * fraction : undefined }
}
