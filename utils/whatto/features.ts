/**
 * Whatto feature engine. Pure TypeScript, no DOM and no Nuxt imports, so the
 * exact same code runs in the browser (live) and in Node (scripts/whatto-train.ts).
 * Every number the live model sees is produced here; see docs/whatto/MODEL.md.
 *
 * Input is a stream of CLOSED 1-minute bars (Binance kline layout).
 */

export interface Bar {
  /** Open time, ms since epoch (UTC). */
  t: number
  o: number
  h: number
  l: number
  c: number
  /** Base-asset volume. */
  v: number
  /** Quote-asset volume. */
  qv: number
  /** Taker-buy base volume (aggressor = buyer). */
  tbv: number
}

export const FEATURE_NAMES = [
  'z15', // 15-min log return / (sigmaL * sqrt 15)
  'z60', // 60-min log return / (sigmaL * sqrt 60)
  'dd120', // drawdown from 120-min high / (sigmaL * sqrt 120)
  'rsi14', // (Wilder RSI14 - 50) / 50
  'volRatio', // ln(sigmaS / sigmaL)
  'flow5', // taker-buy share of volume over 5 bars - 0.5
  'dflow', // flow5 - flow30
  'vwapDev', // ln(close / VWAP60) / (sigmaL * sqrt 60)
  'volSpike', // ln(mean volume 5 / mean volume 120)
  'wick3', // mean lower-wick share of range, last 3 bars
  'cusumUp', // one-sided upward CUSUM of standardized returns over last 30 bars
  'cpProb', // BOCPD: P(run length <= 5) - a change point in the last 5 bars
  'regimeDrift', // BOCPD: posterior mean drift of the current regime (standardized units)
] as const
export type FeatureName = (typeof FEATURE_NAMES)[number]

export const LAMBDA_LONG = 0.995
export const LAMBDA_SHORT = 0.94
export const WARMUP_BARS = 240
export const HORIZON_MIN = 30
export const REBOUND_K = 1.0
/** Setup gate: "steadily falling" = 60-min move at or below this many sigmas, still falling over 15 min. */
export const SETUP_Z60 = -1.5

/* ------------------------------------------------------------------ */
/* Bayesian online change-point detection (Adams & MacKay, 2007).      */
/* Gaussian observations with unknown mean and precision (Normal-Gamma */
/* conjugate prior), constant hazard, run length truncated at R_MAX.   */
/* ------------------------------------------------------------------ */
const HAZARD = 1 / 60
const R_MAX = 120
const PRIOR = { mu: 0, kappa: 1, alpha: 2, beta: 2 }

function lgamma(x: number): number {
  // Lanczos approximation
  const g = 7
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x)
  x -= 1
  let a = c[0]
  const t = x + g + 0.5
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i)
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

/** Student-t log density (predictive of the Normal-Gamma model). */
function studentLogPdf(x: number, mu: number, kappa: number, alpha: number, beta: number): number {
  const nu = 2 * alpha
  const scale2 = (beta * (kappa + 1)) / (alpha * kappa)
  const z = (x - mu) * (x - mu) / scale2
  return lgamma((nu + 1) / 2) - lgamma(nu / 2) - 0.5 * Math.log(nu * Math.PI * scale2) - ((nu + 1) / 2) * Math.log1p(z / nu)
}

export class Bocpd {
  /** run-length posterior; index r = run length r. */
  private p: Float64Array = new Float64Array([1])
  private mu: Float64Array = new Float64Array([PRIOR.mu])
  private kappa: Float64Array = new Float64Array([PRIOR.kappa])
  private alpha: Float64Array = new Float64Array([PRIOR.alpha])
  private beta: Float64Array = new Float64Array([PRIOR.beta])

  update(x: number): void {
    // Clamp extreme standardized returns so a single print cannot dominate.
    x = Math.max(-8, Math.min(8, x))
    const n = this.p.length
    const m = Math.min(n + 1, R_MAX)
    const np = new Float64Array(m)
    let cp = 0
    for (let r = 0; r < n; r++) {
      const pred = Math.exp(studentLogPdf(x, this.mu[r], this.kappa[r], this.alpha[r], this.beta[r]))
      const w = this.p[r] * pred
      cp += w * HAZARD
      const nr = r + 1 < m ? r + 1 : m - 1
      np[nr] += w * (1 - HAZARD)
    }
    np[0] += cp
    let s = 0
    for (let r = 0; r < m; r++) s += np[r]
    if (!(s > 0) || !Number.isFinite(s)) { this.reset(); return }
    for (let r = 0; r < m; r++) np[r] /= s
    // Posterior parameter update: index r+1 gets old r updated with x; index 0 = prior.
    const mu = new Float64Array(m), ka = new Float64Array(m), al = new Float64Array(m), be = new Float64Array(m)
    mu[0] = PRIOR.mu; ka[0] = PRIOR.kappa; al[0] = PRIOR.alpha; be[0] = PRIOR.beta
    for (let r = 0; r < n; r++) {
      const nr = r + 1 < m ? r + 1 : m - 1
      if (nr !== r + 1) continue // truncated: the oldest run's mass merged above; keep the younger run's stats
      const k0 = this.kappa[r]
      ka[nr] = k0 + 1
      mu[nr] = (k0 * this.mu[r] + x) / (k0 + 1)
      al[nr] = this.alpha[r] + 0.5
      be[nr] = this.beta[r] + (k0 * (x - this.mu[r]) ** 2) / (2 * (k0 + 1))
    }
    this.p = np; this.mu = mu; this.kappa = ka; this.alpha = al; this.beta = be
  }

  reset(): void {
    this.p = new Float64Array([1])
    this.mu = new Float64Array([PRIOR.mu]); this.kappa = new Float64Array([PRIOR.kappa])
    this.alpha = new Float64Array([PRIOR.alpha]); this.beta = new Float64Array([PRIOR.beta])
  }

  /** P(run length <= k). */
  recentChangeProb(k = 5): number {
    let s = 0
    for (let r = 0; r <= k && r < this.p.length; r++) s += this.p[r]
    return s
  }

  /** Posterior-weighted mean drift across run lengths. */
  drift(): number {
    let s = 0
    for (let r = 0; r < this.p.length; r++) s += this.p[r] * this.mu[r]
    return s
  }

  /** Most likely current run length (MAP). */
  mapRunLength(): number {
    let best = 0
    for (let r = 1; r < this.p.length; r++) if (this.p[r] > this.p[best]) best = r
    return best
  }
}

/* ------------------------------------------------------------------ */
/* Streaming engine                                                     */
/* ------------------------------------------------------------------ */

export interface FeatureSnapshot {
  t: number
  close: number
  sigmaL: number
  sigmaS: number
  rsi: number
  /** true when the bar is a "falling setup" the model is allowed to score. */
  setup: boolean
  values: Record<FeatureName, number>
  vector: number[]
  /** rebound target as a fraction (e.g. 0.004 = +0.4%) for the horizon */
  reboundFrac: number
  bocpdRunLength: number
}

export class FeatureEngine {
  readonly bars: Bar[] = []
  private varL = NaN
  private varS = NaN
  private avgGain = NaN
  private avgLoss = NaN
  private rsiCount = 0
  private gainSeed = 0
  private lossSeed = 0
  readonly bocpd = new Bocpd()
  private stdRets: number[] = []
  private maxKeep: number

  constructor(maxKeep = 1500) {
    this.maxKeep = maxKeep
  }

  get sigmaL(): number { return Math.sqrt(this.varL) }
  get sigmaS(): number { return Math.sqrt(this.varS) }
  get ready(): boolean { return this.bars.length >= WARMUP_BARS && Number.isFinite(this.varL) && this.varL > 0 }

  /** Push one CLOSED bar. Returns a snapshot once warmed up. */
  push(bar: Bar): FeatureSnapshot | null {
    const prev = this.bars[this.bars.length - 1]
    if (prev && bar.t <= prev.t) return null
    this.bars.push(bar)
    if (this.bars.length > this.maxKeep) this.bars.splice(0, this.bars.length - this.maxKeep)
    if (!prev || !(prev.c > 0) || !(bar.c > 0)) return null
    const r = Math.log(bar.c / prev.c)

    // EWMA variance (RiskMetrics). Seed with a floor so flat stretches don't divide by zero.
    const floor = 1e-10
    if (!Number.isFinite(this.varL)) { this.varL = Math.max(r * r, floor); this.varS = this.varL }
    else {
      this.varL = Math.max(LAMBDA_LONG * this.varL + (1 - LAMBDA_LONG) * r * r, floor)
      this.varS = Math.max(LAMBDA_SHORT * this.varS + (1 - LAMBDA_SHORT) * r * r, floor)
    }

    // Wilder RSI(14)
    const gain = Math.max(0, bar.c - prev.c), loss = Math.max(0, prev.c - bar.c)
    if (this.rsiCount < 14) {
      this.gainSeed += gain; this.lossSeed += loss; this.rsiCount++
      if (this.rsiCount === 14) { this.avgGain = this.gainSeed / 14; this.avgLoss = this.lossSeed / 14 }
    } else {
      this.avgGain = (this.avgGain * 13 + gain) / 14
      this.avgLoss = (this.avgLoss * 13 + loss) / 14
    }

    // Standardize with the PRE-update long vol would be ideal; we use the
    // updated one consistently in training and live, so it is the same model.
    const u = r / this.sigmaL
    this.bocpd.update(u)
    this.stdRets.push(u)
    if (this.stdRets.length > 64) this.stdRets.shift()

    if (!this.ready) return null
    return this.snapshot()
  }

  snapshot(): FeatureSnapshot | null {
    const b = this.bars
    const n = b.length
    if (n < WARMUP_BARS) return null
    const i = n - 1
    const c = b[i].c
    const sL = this.sigmaL
    const sS = this.sigmaS
    const lr = (k: number) => Math.log(c / b[i - k].c)

    let hi120 = -Infinity
    for (let j = n - 120; j < n; j++) hi120 = Math.max(hi120, b[j].h)

    const sum = (from: number, f: (x: Bar) => number) => { let s = 0; for (let j = from; j < n; j++) s += f(b[j]); return s }
    const v5 = sum(n - 5, x => x.v), tb5 = sum(n - 5, x => x.tbv)
    const v30 = sum(n - 30, x => x.v), tb30 = sum(n - 30, x => x.tbv)
    const v60 = sum(n - 60, x => x.v), qv60 = sum(n - 60, x => x.qv)
    const v120 = sum(n - 120, x => x.v)
    const flow5 = v5 > 0 ? tb5 / v5 - 0.5 : 0
    const flow30 = v30 > 0 ? tb30 / v30 - 0.5 : 0
    const vwap = v60 > 0 ? qv60 / v60 : c

    let wick = 0
    for (let j = n - 3; j < n; j++) {
      const range = b[j].h - b[j].l
      wick += range > 0 ? (Math.min(b[j].o, b[j].c) - b[j].l) / range : 0
    }
    wick /= 3

    let cus = 0
    const rets = this.stdRets
    for (let j = Math.max(0, rets.length - 30); j < rets.length; j++) cus = Math.max(0, cus + rets[j] - 0.25)

    const rsi = this.avgLoss === 0 ? 100 : 100 - 100 / (1 + this.avgGain / this.avgLoss)

    const values: Record<FeatureName, number> = {
      z15: lr(15) / (sL * Math.sqrt(15)),
      z60: lr(60) / (sL * Math.sqrt(60)),
      dd120: Math.log(c / hi120) / (sL * Math.sqrt(120)),
      rsi14: (rsi - 50) / 50,
      volRatio: Math.log(sS / sL),
      flow5,
      dflow: flow5 - flow30,
      vwapDev: Math.log(c / vwap) / (sL * Math.sqrt(60)),
      volSpike: Math.log(((v5 / 5) + 1e-12) / ((v120 / 120) + 1e-12)),
      wick3: wick,
      cusumUp: cus,
      cpProb: this.bocpd.recentChangeProb(5),
      regimeDrift: this.bocpd.drift(),
    }
    for (const k of FEATURE_NAMES) if (!Number.isFinite(values[k])) values[k] = 0
    // Winsorize so a broken print can't explode the logit.
    values.z15 = clamp(values.z15, -8, 8); values.z60 = clamp(values.z60, -8, 8)
    values.dd120 = clamp(values.dd120, -8, 0); values.vwapDev = clamp(values.vwapDev, -8, 8)
    values.volRatio = clamp(values.volRatio, -3, 3); values.volSpike = clamp(values.volSpike, -5, 5)
    values.cusumUp = clamp(values.cusumUp, 0, 20); values.regimeDrift = clamp(values.regimeDrift, -5, 5)

    return {
      t: b[i].t,
      close: c,
      sigmaL: sL,
      sigmaS: sS,
      rsi,
      setup: values.z60 <= SETUP_Z60 && values.z15 < 0,
      values,
      vector: FEATURE_NAMES.map(k => values[k]),
      reboundFrac: Math.exp(REBOUND_K * sL * Math.sqrt(HORIZON_MIN)) - 1,
      bocpdRunLength: this.bocpd.mapRunLength(),
    }
  }
}

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x
}

/** Parse a Binance kline row (REST array or CSV split). Handles ms and µs timestamps. */
export function barFromKlineRow(row: (string | number)[]): Bar {
  let t = Number(row[0])
  if (t > 1e14) t = Math.floor(t / 1000)
  return { t, o: +row[1], h: +row[2], l: +row[3], c: +row[4], v: +row[5], qv: +row[7], tbv: +row[9] }
}
