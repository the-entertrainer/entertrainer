/**
 * Whatto model v2: one pooled model across a broad coin universe, with
 * walk-forward evaluation per liquidity tier.
 *
 *   node --experimental-strip-types scripts/whatto-train.ts <zipDir> [outJson] [cacheDir]
 *
 * <zipDir> holds Binance public monthly 1m kline zips named <PAIR>-1m-<YYYY-MM>.zip, e.g.
 *   https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1m/BTCUSDT-1m-2026-09.zip
 * (see docs/whatto/MODEL.md for the download list). A pair is used only if EVERY month is
 * present (history requirement). Raw data and the per-pair feature cache are never committed.
 *
 * Uses the SAME FeatureEngine as the live app (utils/whatto/features.ts). Feature extraction
 * runs one child process per pair (8 in parallel) and caches rows as Float64 binaries.
 */
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  FeatureEngine, FEATURE_NAMES, HORIZON_MIN, REBOUND_K, SETUP_Z60, barFromKlineRow, type Bar,
} from '../utils/whatto/features.ts'
import { TIERS, tierOf } from '../utils/whatto/tiers.ts'

const STOP_K = 1.0
const COOLDOWN = HORIZON_MIN
const NF = FEATURE_NAMES.length
/** row layout: t, y, stopFirst, fwd, close, rebound, qv24, x[NF] */
const W = 7 + NF

interface Row { coin: string; month: string; t: number; x: number[]; y: number; stopFirst: number; fwd: number; close: number; rebound: number; qv24: number; tier: string }

function monthOf(t: number) { const d = new Date(t); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}` }

/* ---------------- extraction (child mode) ---------------- */
function extract(zipDir: string, pair: string, months: string[], out: string) {
  const bars: Bar[] = []
  for (const m of months) {
    const txt = execFileSync('unzip', ['-p', join(zipDir, `${pair}-1m-${m}.zip`)], { maxBuffer: 1 << 30 }).toString('utf8')
    for (const line of txt.split('\n')) if (line && /^\d/.test(line)) bars.push(barFromKlineRow(line.split(',')))
  }
  bars.sort((a, b) => a.t - b.t)
  const vals: number[] = []
  const eng = new FeatureEngine(400)
  // rolling 24h quote volume (same quantity as the live 24h ticker), contiguous-bar aware
  let qvSum = 0, lo = 0
  for (let i = 0; i < bars.length; i++) {
    qvSum += bars[i].qv
    while (bars[lo].t <= bars[i].t - 86_400_000) qvSum -= bars[lo++].qv
    const snap = eng.push(bars[i])
    if (!snap || !snap.setup) continue
    if (i + HORIZON_MIN >= bars.length) break
    if (bars[i + HORIZON_MIN].t - bars[i].t !== HORIZON_MIN * 60000) continue
    if (bars[i].t - bars[0].t < 86_400_000) continue // need a full day for qv24
    const c = snap.close
    const target = c * Math.exp(REBOUND_K * snap.sigmaL * Math.sqrt(HORIZON_MIN))
    const stop = c * Math.exp(-STOP_K * snap.sigmaL * Math.sqrt(HORIZON_MIN))
    let y = 0, stopFirst = 0
    for (let j = i + 1; j <= i + HORIZON_MIN; j++) {
      const hitT = bars[j].h >= target, hitS = bars[j].l <= stop
      if (hitS && !hitT) { stopFirst = 1; break }
      if (hitT) { if (hitS) stopFirst = 1; break } // same bar: ambiguous, count stop as touched
    }
    for (let j = i + 1; j <= i + HORIZON_MIN; j++) if (bars[j].h >= target) { y = 1; break }
    vals.push(bars[i].t, y, stopFirst, Math.log(bars[i + HORIZON_MIN].c / c), c, snap.reboundFrac, qvSum, ...snap.vector)
  }
  writeFileSync(out, Buffer.from(new Float64Array(vals).buffer))
  console.error(pair, 'bars', bars.length, 'rows', vals.length / W)
}

if (process.argv[2] === '--extract') {
  extract(process.argv[3], process.argv[4], process.argv[5].split(','), process.argv[6])
  process.exit(0)
}

const zipDir = process.argv[2] ?? '/workspace/whatto-research/data100'
const outPath = process.argv[3] ?? 'utils/whatto/model-v2.json'
const cacheDir = process.argv[4] ?? '/workspace/whatto-research/rows-v2'
mkdirSync(cacheDir, { recursive: true })

const files = readdirSync(zipDir).filter(f => f.endsWith('.zip'))
const months = [...new Set(files.map(f => f.match(/(\d{4}-\d{2})\.zip$/)![1]))].sort()
const pairsAll = [...new Set(files.map(f => f.split('-1m-')[0]))].sort()
const pairs = pairsAll.filter(p => months.every(m => existsSync(join(zipDir, `${p}-1m-${m}.zip`))))
console.error('pairs with full history', pairs.length, 'of', pairsAll.length, 'months', months.join(','))

async function runPool() {
  const todo = pairs.filter(p => !existsSync(join(cacheDir, `${p}.f64`)))
  let next = 0
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < todo.length) {
      const p = todo[next++]
      await new Promise<void>((resolve, reject) => {
        const ch = spawn(process.execPath, ['--experimental-strip-types', '--max-old-space-size=1200', process.argv[1], '--extract', zipDir, p, months.join(','), join(cacheDir, `${p}.f64`)], { stdio: ['ignore', 'inherit', 'inherit'] })
        ch.on('exit', code => (code === 0 ? resolve() : reject(new Error(`${p} exit ${code}`))))
      })
    }
  }))
}
await runPool()

const rows: Row[] = []
const setupCounts: Record<string, number> = {}
for (const pair of pairs) {
  const buf = readFileSync(join(cacheDir, `${pair}.f64`))
  const a = new Float64Array(buf.buffer, buf.byteOffset, buf.byteLength / 8)
  const coin = pair.replace(/USDT$/, '')
  for (let o = 0; o < a.length; o += W) {
    const qv24 = a[o + 6]
    rows.push({ coin, month: monthOf(a[o]), t: a[o], y: a[o + 1], stopFirst: a[o + 2], fwd: a[o + 3], close: a[o + 4], rebound: a[o + 5], qv24, tier: tierOf(qv24), x: Array.from(a.subarray(o + 7, o + W)) })
  }
  setupCounts[coin] = a.length / W
}
const coins = pairs.map(p => p.replace(/USDT$/, ''))
console.error('setup rows', rows.length)

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
const strip = (s: ReturnType<typeof summarize>) => { const { sigList: _s, ...rest } = s; return rest }
// Edge rule (unchanged from v1, fixed before the run): enough signals, AUC above chance,
// and the 95% Wilson lower bound of the hit rate beats the de-clustered base rate.
const edgeOf = (s: ReturnType<typeof summarize>) => s.signals >= 30 && s.auc >= 0.55 && s.hitRateCI95[0] > s.baseRateDeclustered

const perTier: Record<string, unknown> = {}
for (const t of TIERS) {
  const sub = oos.filter(o => o.r.tier === t.id)
  if (!sub.length) { perTier[t.id] = { setups: 0, edge: false, coins: 0 }; continue }
  const s = summarize(sub)
  // Stability check (stricter, never looser): the tier must also beat its own base rate in at
  // least 3 of the 4 test months, so one lucky month cannot carry a tier.
  const byMonth = months.filter(m => sub.some(o => o.r.month === m)).map((m) => {
    const ms = summarize(sub.filter(o => o.r.month === m))
    return { month: m, signals: ms.signals, hitRate: ms.hitRate, baseRateDeclustered: ms.baseRateDeclustered, auc: ms.auc }
  })
  const stableMonths = byMonth.filter(x => x.hitRate > x.baseRateDeclustered).length
  perTier[t.id] = { ...strip(s), coins: new Set(sub.map(o => o.r.coin)).size, byMonth, stableMonths, edge: edgeOf(s) && stableMonths >= Math.min(3, byMonth.length) }
  console.error('tier', t.id, JSON.stringify(perTier[t.id]))
}
// Combined numbers for the tiers that get odds (note: the tiers were chosen on this same
// out-of-sample period, so this summary is mildly optimistic; MODEL.md says so).
const okTiers = new Set(TIERS.filter(t => (perTier[t.id] as { edge?: boolean }).edge).map(t => t.id))
const eligibleSummary = strip(summarize(oos.filter(o => okTiers.has(o.r.tier))))
// Per-coin numbers are informational only (n is small per coin); eligibility is by tier.
const perCoin: Record<string, unknown> = {}
const history: unknown[] = []
for (const coin of coins) {
  const sub = oos.filter(o => o.r.coin === coin)
  if (!sub.length) continue
  const s = summarize(sub)
  const r = strip(s)
  perCoin[coin] = { n: r.setups, auc: r.auc, brier: r.brier, brierBase: r.brierBase, signals: r.signals, hitRate: r.hitRate, baseRateDeclustered: r.baseRateDeclustered }
}
const allSig = summarize(oos).sigList.sort((a, b) => b.r.t - a.r.t).slice(0, 40)
for (const e of allSig) history.push({ coin: e.r.coin, tier: e.r.tier, t: e.r.t, close: e.r.close, p: +e.p.toFixed(4), rebounded: !!e.r.y, reboundFrac: +e.r.rebound.toFixed(5), fwd30: +e.r.fwd.toFixed(5) })

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
const model = {
  name: 'whatto-rebound-logit',
  version: 2,
  trainedAt: new Date().toISOString(),
  source: 'Binance spot public 1m klines, data.binance.vision',
  symbols: pairs,
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
  tiers: TIERS,
  evaluation: { method: 'expanding walk-forward by calendar month; train <m-1, Platt+threshold on m-1, test on m; pooled across pairs, scored per 24h-quote-volume tier', folds, pooled: strip(pooled), eligible: { tiers: [...okTiers], ...eligibleSummary }, perTier, perCoin, reliability },
  historicalSignals: history,
}
writeFileSync(outPath, JSON.stringify(model, (k, v) => typeof v === 'number' ? +v.toPrecision(5) : v))
console.error('wrote', outPath, 'pooled', JSON.stringify(strip(pooled)))
