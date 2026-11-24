/**
 * Whatto model training + walk-forward evaluation.
 *
 *   node --experimental-strip-types scripts/whatto-train.ts <dataDir> [outJson]
 *
 * <dataDir> holds unzipped Binance public monthly 1m klines, e.g.
 *   https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1m/BTCUSDT-1m-2026-09.zip
 * (see docs/whatto/MODEL.md for the exact download list). Raw data is never committed.
 *
 * Uses the SAME FeatureEngine as the live app (utils/whatto/features.ts).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  FeatureEngine, FEATURE_NAMES, HORIZON_MIN, REBOUND_K, SETUP_Z60, barFromKlineRow, type Bar,
} from '../utils/whatto/features.ts'

const dataDir = process.argv[2] ?? '/workspace/whatto-research/data'
const outPath = process.argv[3] ?? 'utils/whatto/model-v1.json'
const STOP_K = 1.0
const COOLDOWN = HORIZON_MIN

interface Row { coin: string; month: string; t: number; x: number[]; y: number; stopFirst: number; fwd: number; close: number; rebound: number }

const files = readdirSync(dataDir).filter(f => f.endsWith('.csv')).sort()
const coins = [...new Set(files.map(f => f.split('USDT')[0]))]
const months = [...new Set(files.map(f => f.match(/(\d{4}-\d{2})\.csv$/)![1]))].sort()
console.error('coins', coins.join(','), 'months', months.join(','))

const rows: Row[] = []
const setupCounts: Record<string, number> = {}
let totalBars = 0
for (const coin of coins) {
  const bars: Bar[] = []
  for (const m of months) {
    const f = join(dataDir, `${coin}USDT-1m-${m}.csv`)
    let txt: string
    try { txt = readFileSync(f, 'utf8') } catch { continue }
    for (const line of txt.split('\n')) {
      if (!line || !/^\d/.test(line)) continue
      bars.push(barFromKlineRow(line.split(',')))
    }
  }
  bars.sort((a, b) => a.t - b.t)
  totalBars += bars.length
  const eng = new FeatureEngine(400)
  for (let i = 0; i < bars.length; i++) {
    const snap = eng.push(bars[i])
    if (!snap || !snap.setup) continue
    if (i + HORIZON_MIN >= bars.length) break
    // require contiguous future (no gaps)
    if (bars[i + HORIZON_MIN].t - bars[i].t !== HORIZON_MIN * 60000) continue
    const c = snap.close
    const target = c * Math.exp(REBOUND_K * snap.sigmaL * Math.sqrt(HORIZON_MIN))
    const stop = c * Math.exp(-STOP_K * snap.sigmaL * Math.sqrt(HORIZON_MIN))
    let y = 0, stopFirst = 0
    for (let j = i + 1; j <= i + HORIZON_MIN; j++) {
      const hitT = bars[j].h >= target, hitS = bars[j].l <= stop
      if (hitS && !hitT) { stopFirst = 1; break }
      if (hitT) { y = 1; if (hitS) stopFirst = 1; break } // same bar: ambiguous, count stop as touched
    }
    // y is "target reached within H" regardless of stop; recompute without stop break
    y = 0
    for (let j = i + 1; j <= i + HORIZON_MIN; j++) if (bars[j].h >= target) { y = 1; break }
    const d = new Date(bars[i].t)
    const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    rows.push({ coin, month, t: bars[i].t, x: snap.vector, y, stopFirst, fwd: Math.log(bars[i + HORIZON_MIN].c / c), close: c, rebound: snap.reboundFrac })
    setupCounts[coin] = (setupCounts[coin] ?? 0) + 1
  }
}
console.error('bars', totalBars, 'setup rows', rows.length, setupCounts)

/* ---------------- logistic regression (IRLS, L2) ---------------- */
function standardize(X: number[][]) {
  const d = X[0].length
  const mean = new Array(d).fill(0), std = new Array(d).fill(0)
  for (const x of X) for (let k = 0; k < d; k++) mean[k] += x[k] / X.length
  for (const x of X) for (let k = 0; k < d; k++) std[k] += (x[k] - mean[k]) ** 2 / X.length
  for (let k = 0; k < d; k++) std[k] = Math.sqrt(std[k]) || 1
  return { mean, std }
}
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((r, i) => [...r, b[i]])
  for (let i = 0; i < n; i++) {
    let p = i
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r
    ;[M[i], M[p]] = [M[p], M[i]]
    for (let r = 0; r < n; r++) {
      if (r === i) continue
      const f = M[r][i] / M[i][i]
      for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]
    }
  }
  return M.map((r, i) => r[n] / r[i])
}
function fitLogit(X: number[][], y: number[], l2 = 1.0, iters = 25): number[] {
  const d = X[0].length + 1
  let w = new Array(d).fill(0)
  for (let it = 0; it < iters; it++) {
    const H = Array.from({ length: d }, () => new Array(d).fill(0))
    const g = new Array(d).fill(0)
    for (let i = 0; i < X.length; i++) {
      const xi = [1, ...X[i]]
      let z = 0; for (let k = 0; k < d; k++) z += w[k] * xi[k]
      const p = sigmoid(z), s = Math.max(p * (1 - p), 1e-9)
      for (let a = 0; a < d; a++) {
        g[a] += (p - y[i]) * xi[a]
        for (let b = a; b < d; b++) H[a][b] += s * xi[a] * xi[b]
      }
    }
    for (let a = 1; a < d; a++) { g[a] += l2 * w[a]; H[a][a] += l2 }
    for (let a = 0; a < d; a++) for (let b = 0; b < a; b++) H[a][b] = H[b][a]
    const step = solve(H, g)
    let maxStep = 0
    w = w.map((v, k) => { maxStep = Math.max(maxStep, Math.abs(step[k])); return v - step[k] })
    if (maxStep < 1e-7) break
  }
  return w
}
const score = (w: number[], x: number[]) => { let z = w[0]; for (let k = 0; k < x.length; k++) z += w[k + 1] * x[k]; return z }
const zs = (x: number[], m: number[], s: number[]) => x.map((v, k) => (v - m[k]) / s[k])

function auc(scores: number[], y: number[]): number {
  const idx = scores.map((s, i) => i).sort((a, b) => scores[a] - scores[b])
  let rank = 0, sumPos = 0, nPos = 0
  for (let i = 0; i < idx.length;) {
    let j = i; while (j < idx.length && scores[idx[j]] === scores[idx[i]]) j++
    const avg = (i + j + 1) / 2
    for (let k = i; k < j; k++) if (y[idx[k]]) { sumPos += avg; nPos++ }
    rank = j; i = j
  }
  const nNeg = y.length - nPos
  return nPos && nNeg ? (sumPos - nPos * (nPos + 1) / 2) / (nPos * nNeg) : NaN
}
const brier = (p: number[], y: number[]) => p.reduce((s, v, i) => s + (v - y[i]) ** 2, 0) / p.length
function wilson(k: number, n: number, z = 1.96) {
  if (!n) return [0, 0]
  const ph = k / n, den = 1 + z * z / n
  const c = (ph + z * z / (2 * n)) / den, h = z * Math.sqrt(ph * (1 - ph) / n + z * z / (4 * n * n)) / den
  return [c - h, c + h]
}

interface Fitted { mean: number[]; std: number[]; w: number[]; platt: { a: number; b: number }; threshold: number }
const TOP_FRACTION = 0.1
function fitAll(train: Row[], calib: Row[]): Fitted {
  const { mean, std } = standardize(train.map(r => r.x))
  const w = fitLogit(train.map(r => zs(r.x, mean, std)), train.map(r => r.y))
  // Platt scaling on the held-out calibration month: p = sigmoid(a * z + b)
  const zc = calib.map(r => score(w, zs(r.x, mean, std)))
  const pw = fitLogit(zc.map(z => [z]), calib.map(r => r.y), 1e-6)
  const platt = { a: pw[1], b: pw[0] }
  const pc = zc.map(z => sigmoid(platt.a * z + platt.b)).sort((a, b) => b - a)
  const threshold = pc[Math.max(0, Math.floor(pc.length * TOP_FRACTION) - 1)]
  return { mean, std, w, platt, threshold }
}
const predict = (f: Fitted, x: number[]) => sigmoid(f.platt.a * score(f.w, zs(x, f.mean, f.std)) + f.platt.b)

/** De-cluster: first bar crossing threshold, then a cooldown of H bars per coin (what the app does). */
function signals(rs: { r: Row; p: number }[], thr: number) {
  const out: { r: Row; p: number }[] = []
  const last: Record<string, number> = {}
  for (const e of [...rs].sort((a, b) => a.r.t - b.r.t)) {
    if (e.p < thr) continue
    if (last[e.r.coin] !== undefined && e.r.t - last[e.r.coin] < COOLDOWN * 60000) continue
    last[e.r.coin] = e.r.t
    out.push(e)
  }
  return out
}
function declusterSetups(rs: Row[]) {
  const out: Row[] = []
  const last: Record<string, number> = {}
  for (const r of [...rs].sort((a, b) => a.t - b.t)) {
    if (last[r.coin] !== undefined && r.t - last[r.coin] < COOLDOWN * 60000) continue
    last[r.coin] = r.t; out.push(r)
  }
  return out
}

/* ---------------- walk-forward ---------------- */
const oos: { r: Row; p: number; thr: number }[] = []
const folds: unknown[] = []
for (let m = 3; m < months.length; m++) {
  const trainRows = rows.filter(r => months.indexOf(r.month) < m - 1)
  const calibRows = rows.filter(r => r.month === months[m - 1])
  const testRows = rows.filter(r => r.month === months[m])
  if (!trainRows.length || !calibRows.length || !testRows.length) continue
  const f = fitAll(trainRows, calibRows)
  const p = testRows.map(r => predict(f, r.x))
  const y = testRows.map(r => r.y)
  const sig = signals(testRows.map((r, i) => ({ r, p: p[i] })), f.threshold)
  const dSet = declusterSetups(testRows)
  const fold = {
    test: months[m], trainMonths: months.slice(0, m - 1), calibMonth: months[m - 1],
    n: testRows.length, auc: auc(p, y), brier: brier(p, y), brierBase: brier(y.map(() => y.reduce((a, b) => a + b, 0) / y.length), y),
    baseRate: y.reduce((a, b) => a + b, 0) / y.length,
    threshold: f.threshold,
    signals: sig.length, hitRate: sig.length ? sig.filter(s => s.r.y).length / sig.length : NaN,
    baseRateDeclustered: dSet.length ? dSet.filter(r => r.y).length / dSet.length : NaN,
  }
  folds.push(fold)
  console.error(JSON.stringify(fold))
  testRows.forEach((r, i) => oos.push({ r, p: p[i], thr: f.threshold }))
}

function summarize(sub: { r: Row; p: number; thr: number }[]) {
  const p = sub.map(s => s.p), y = sub.map(s => s.r.y)
  // signals per fold threshold
  const sig: { r: Row; p: number }[] = []
  const byMonth = new Map<string, { r: Row; p: number; thr: number }[]>()
  for (const s of sub) { if (!byMonth.has(s.r.month)) byMonth.set(s.r.month, []); byMonth.get(s.r.month)!.push(s) }
  for (const arr of byMonth.values()) sig.push(...signals(arr, arr[0].thr))
  const hits = sig.filter(s => s.r.y).length
  const dSet = declusterSetups(sub.map(s => s.r))
  const baseD = dSet.length ? dSet.filter(r => r.y).length / dSet.length : NaN
  const [lo, hi] = wilson(hits, sig.length)
  const meanY = y.reduce((a, b) => a + b, 0) / (y.length || 1)
  return {
    setups: sub.length,
    setupsDeclustered: dSet.length,
    auc: auc(p, y),
    brier: brier(p, y),
    brierBase: brier(y.map(() => meanY), y),
    baseRate: meanY,
    baseRateDeclustered: baseD,
    signals: sig.length,
    hits,
    hitRate: sig.length ? hits / sig.length : NaN,
    hitRateCI95: [lo, hi],
    stopFirstRate: sig.length ? sig.filter(s => s.r.stopFirst).length / sig.length : NaN,
    meanFwdReturnSignals: sig.length ? sig.reduce((a, s) => a + s.r.fwd, 0) / sig.length : NaN,
    meanFwdReturnSetups: dSet.length ? dSet.reduce((a, r) => a + r.fwd, 0) / dSet.length : NaN,
    medianReboundTarget: (() => { const v = sig.map(s => s.r.rebound).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : NaN })(),
    sigList: sig,
  }
}
const pooled = summarize(oos)
const perCoin: Record<string, unknown> = {}
const history: unknown[] = []
for (const coin of coins) {
  const s = summarize(oos.filter(o => o.r.coin === coin))
  // Edge rule: enough signals, AUC above chance, and the 95% Wilson lower bound beats the declustered base rate.
  const edge = s.signals >= 30 && s.auc >= 0.55 && s.hitRateCI95[0] > s.baseRateDeclustered
  const { sigList, ...rest } = s
  perCoin[coin] = { ...rest, edge }
  for (const e of sigList.slice(-12)) history.push({ coin, t: e.r.t, close: e.r.close, p: +e.p.toFixed(4), rebounded: !!e.r.y, reboundFrac: +e.r.rebound.toFixed(5), fwd30: +e.r.fwd.toFixed(5) })
  console.error(coin, JSON.stringify({ ...rest, edge }))
}

// reliability (pooled OOS), 10 equal-count bins
const sorted = [...oos].sort((a, b) => a.p - b.p)
const reliability = []
for (let b = 0; b < 10; b++) {
  const part = sorted.slice(Math.floor(b * sorted.length / 10), Math.floor((b + 1) * sorted.length / 10))
  if (!part.length) continue
  reliability.push({ meanP: part.reduce((a, s) => a + s.p, 0) / part.length, observed: part.reduce((a, s) => a + s.r.y, 0) / part.length, n: part.length })
}

// Final shipped model: train on all months but the last, Platt + threshold on the last month.
const final = fitAll(rows.filter(r => r.month !== months[months.length - 1]), rows.filter(r => r.month === months[months.length - 1]))
const { sigList: _drop, ...pooledRest } = pooled
const model = {
  name: 'whatto-rebound-logit',
  version: 1,
  trainedAt: new Date().toISOString(),
  source: 'Binance spot public 1m klines, data.binance.vision',
  symbols: coins.map(c => `${c}USDT`),
  months,
  horizonMin: HORIZON_MIN,
  reboundK: REBOUND_K,
  stopK: STOP_K,
  setupZ60: SETUP_Z60,
  cooldownMin: COOLDOWN,
  label: `max(high over next ${HORIZON_MIN} 1m bars) >= close * exp(${REBOUND_K} * sigmaL * sqrt(${HORIZON_MIN}))`,
  features: FEATURE_NAMES,
  mean: final.mean,
  std: final.std,
  intercept: final.w[0],
  coef: final.w.slice(1),
  platt: final.platt,
  threshold: final.threshold,
  topFraction: TOP_FRACTION,
  evaluation: { method: 'expanding walk-forward by calendar month; train <m-1, Platt+threshold on m-1, test on m', folds, pooled: pooledRest, perCoin, reliability },
  historicalSignals: history,
}
writeFileSync(outPath, JSON.stringify(model, (k, v) => typeof v === 'number' ? +v.toPrecision(6) : v, 1))
console.error('wrote', outPath, 'pooled', JSON.stringify(pooledRest))
