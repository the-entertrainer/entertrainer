# Whatto · Model

Model `whatto-rebound-logit` **v2**, file `utils/whatto/model-v2.json` (24 KB: coefficients, calibration, tiers and evaluation only), fitted by `scripts/whatto-train.ts`.

v1 (six coins) is retired. v2 keeps the exact question, features and event definition, and refits one pooled model on 100 USDT pairs so odds can be offered beyond the original six, with eligibility decided per liquidity tier.

## 1. The question
At the close of a 1-minute candle on a coin that is **steadily falling**, what is the probability that price **rebounds by at least one 30-minute volatility unit within the next 30 minutes**?

- σ_L: EWMA volatility of 1-minute log returns, λ = 0.995 (RiskMetrics form `σ²_t = λσ²_{t−1} + (1−λ)r²_t`).
- Setup (falling): `z60 = ln(C_t / C_{t−60}) / (σ_L √60) ≤ −1.5` and `z15 < 0`.
- Label: `y = 1` if `max(H_{t+1..t+30}) ≥ C_t · exp(1.0 · σ_L · √30)`.
- Stop level shown on cards: `C_t · exp(−1.0 · σ_L · √30)`.
- Typical target: median +0.64% across signals (tier A +0.43%, tiers B–C +0.71%).

## 2. Features (all from closed 1-minute klines)
Code: `utils/whatto/features.ts`. Identical code runs live and in training.

| Name | Definition |
|---|---|
| z15 | `ln(C_t/C_{t−15}) / (σ_L √15)` |
| z60 | `ln(C_t/C_{t−60}) / (σ_L √60)` |
| dd120 | `ln(C_t / max H_{t−119..t}) / (σ_L √120)` |
| rsi14 | `(RSI_Wilder(14) − 50) / 50` |
| volRatio | `ln(σ_S / σ_L)`, σ_S EWMA with λ = 0.94 |
| flow5 | `Σ takerBuyVol / Σ vol` over 5 bars − 0.5 (aggressor imbalance) |
| dflow | flow5 − flow30 |
| vwapDev | `ln(C_t / VWAP_60) / (σ_L √60)`, VWAP_60 = Σ quoteVol / Σ vol |
| volSpike | `ln(mean vol_5 / mean vol_120)` (volume climax) |
| wick3 | mean over 3 bars of `(min(O,C) − L)/(H − L)` |
| cusumUp | `S_k = max(0, S_{k−1} + u_k − 0.25)` over the last 30 standardised returns `u = r/σ_L` |
| cpProb | BOCPD posterior `P(run length ≤ 5)` |
| regimeDrift | BOCPD posterior-weighted mean of `u` in the current regime |

Winsorised: z15, z60, vwapDev to ±8; dd120 to [−8, 0]; volRatio ±3; volSpike ±5; cusumUp [0, 20]; regimeDrift ±5.

### Bayesian online change-point detection
Adams & MacKay (2007). Observations `u_t` (clamped to ±8). Normal-Gamma prior μ₀ = 0, κ₀ = 1, α₀ = 2, β₀ = 2; Student-t predictive with ν = 2α, scale² = β(κ+1)/(ακ). Constant hazard H = 1/60. Run length truncated at 120.
```
growth:     P(r_t = r+1, u_1:t) ∝ P(r_{t−1}=r) · π_r(u_t) · (1 − H)
changepoint: P(r_t = 0, u_1:t)  ∝ Σ_r P(r_{t−1}=r) · π_r(u_t) · H
update:      κ' = κ+1, μ' = (κμ+u)/(κ+1), α' = α+½, β' = β + κ(u−μ)²/(2(κ+1))
```

## 3. Model
- Standardise each feature with training mean/std.
- Logistic regression `z = b₀ + Σ βᵢ xᵢ`, L2 penalty λ = 1 on β (not the intercept), fitted by Newton/IRLS, **pooled across all 100 pairs** (one coefficient set; no per-coin terms).
- Platt calibration on a held-out month: `p = σ(a·z + b)`. v2: a = 0.9807, b = 0.1621, intercept −0.8224.
- Threshold: the calibrated probability at the top 10% of the calibration month's setups. v2: **0.441**.

| Feature | mean | std | β |
|---|---|---|---|
| z15 | −1.4017 | 1.0052 | −0.0631 |
| z60 | −1.9663 | 0.4495 | 0.0005 |
| dd120 | −1.8663 | 0.4670 | −0.1102 |
| rsi14 | −0.3809 | 0.1854 | 0.0105 |
| volRatio | 0.1664 | 0.2798 | 0.1087 |
| flow5 | −0.0668 | 0.2157 | 0.0038 |
| dflow | 0.0138 | 0.2048 | −0.0277 |
| vwapDev | −0.8174 | 0.3490 | −0.0514 |
| volSpike | 0.0554 | 1.2156 | 0.0944 |
| wick3 | 0.1755 | 0.1702 | 0.0227 |
| cusumUp | 0.5222 | 1.0050 | 0.0205 |
| cpProb | 0.1420 | 0.1739 | −0.0755 |
| regimeDrift | −0.3448 | 0.4419 | −0.0915 |

Reading: as in v1, **short-term vol above long-term vol** and a **volume spike** push toward a rebound; deeper drawdown from the 2-hour high pushes against. Across many coins the BOCPD terms (recent change point, negative regime drift) matter more than on the six majors.

## 4. Data and universe
- Binance spot public 1-minute klines, `https://data.binance.vision/data/spot/monthly/klines/<PAIR>/1m/<PAIR>-1m-<YYYY-MM>.zip`, months 2026-03 to 2026-09.
- **Universe:** the 140 USDT pairs with the highest 24h quote volume on 2026-10-12 (stablecoin and fiat bases removed), keeping the first **100 that have every month** from 2026-03 (the history rule: at least 7 full months of 1-minute data). 30.8M candles, 933,540 setup rows. The list is `symbols` in the JSON.
- **Liquidity tier** per setup row = rolling 24-hour quote volume (USDT) at that bar, the same number the live 24h ticker reports:

| Tier | 24h quote volume |
|---|---|
| A | ≥ $100M |
| B | $20M–100M |
| C | $5M–20M |
| D | $1M–5M |
| E | < $1M |

A coin moves between tiers over time; each row is scored in the tier it was in at that minute.
- Raw data and the per-pair feature cache stay outside git (`/workspace/whatto-research/`). To reproduce:
```bash
mkdir -p /tmp/whatto-zips && cd /tmp/whatto-zips
for s in $(node -p "require('<repo>/utils/whatto/model-v2.json').symbols.join(' ')"); do
  for m in 2026-03 2026-04 2026-05 2026-06 2026-07 2026-08 2026-09; do
    curl -sfO https://data.binance.vision/data/spot/monthly/klines/$s/1m/$s-1m-$m.zip; done; done
cd <repo> && node --experimental-strip-types --max-old-space-size=3500 scripts/whatto-train.ts /tmp/whatto-zips utils/whatto/model-v2.json /tmp/whatto-rows
```
About 1.1 GB of zips. Feature extraction runs 8 pairs in parallel (~3 min on 8 cores); the fit and walk-forward take ~1 min on cached rows. Node 22.

## 5. Evaluation (out of sample)
Expanding walk-forward by calendar month: for test month m, train on months < m−1, calibrate and pick the threshold on m−1, predict m. Test months 2026-06 to 2026-09. Signals are de-clustered like the app (first crossing per coin, then 30-minute cooldown); base rates use setups de-clustered the same way.

**Pooled (4 test months, 100 pairs)**
| Metric | Value |
|---|---|
| AUC (all setup bars, n = 547,700) | **0.580** |
| Brier | **0.2147** vs 0.2187 for the base-rate forecast |
| Signals | **9,060** |
| Hit rate at threshold | **46.7%** (95% Wilson CI 45.7–47.8%) |
| Base rate, de-clustered falling setups (n = 52,679) | **31.8%** |
| Stop touched before target (or same candle) | 39.9% of signals |
| Mean 30-min log return after a signal | +0.157% (setups: +0.075%) |

**By month**
| Test month | AUC | Brier | Brier (base) | Signals | Hit rate | Base rate (de-clustered) | Threshold |
|---|---|---|---|---|---|---|---|
| 2026-06 | 0.596 | 0.2193 | 0.2251 | 2,568 | 47.1% | 32.4% | 0.409 |
| 2026-07 | 0.588 | 0.2013 | 0.2026 | 2,034 | 44.8% | 29.2% | 0.449 |
| 2026-08 | 0.569 | 0.2143 | 0.2163 | 2,278 | 43.7% | 30.8% | 0.362 |
| 2026-09 | 0.588 | 0.2228 | 0.2268 | 2,180 | 51.2% | 34.6% | 0.392 |

**By liquidity tier** (this decides eligibility)
| Tier | Pairs seen | Setup bars | AUC | Brier | Brier (base) | Signals | Hit rate | 95% CI | Base rate (n) | Stop first | Mean fwd 30m | Median target | Months beating base | Edge |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 34 | 32,668 | 0.590 | 0.2287 | 0.2327 | 632 | 54.6% | 50.7–58.4% | 35.9% (3,101) | 41.5% | +0.200% | 0.43% | 4/4 | yes |
| B | 63 | 68,680 | 0.569 | 0.2207 | 0.2234 | 1,132 | 48.2% | 45.3–51.1% | 33.6% (6,651) | 41.1% | +0.261% | 0.71% | 4/4 | yes |
| C | 85 | 129,690 | 0.588 | 0.2161 | 0.2208 | 2,098 | 47.9% | 45.8–50.1% | 32.2% (12,233) | 41.1% | +0.180% | 0.71% | 4/4 | yes |
| D | 89 | 181,620 | 0.575 | 0.2108 | 0.2144 | 2,916 | 45.0% | 43.2–46.8% | 31.2% (17,509) | 39.4% | +0.154% | 0.67% | 4/4 | yes |
| E | 61 | 135,040 | 0.579 | 0.2120 | 0.2158 | 2,391 | 45.5% | 43.6–47.5% | 30.7% (13,530) | 38.4% | +0.102% | 0.60% | 4/4 | yes |

**Edge rule per tier** (v1's rule, fixed before the run, plus one stricter stability check): ≥ 30 signals, AUC ≥ 0.55, Wilson 95% lower bound of the hit rate > de-clustered base rate, **and** hit rate > base rate in at least 3 of the 4 test months. All five tiers pass.

**The original six under v2** (per-coin, informational; small n): BTC AUC 0.597, 52.8% hit vs 34.2% base (144 signals); ETH 0.583, 51.4% vs 38.1% (142); SOL 0.580, 56.6% vs 36.7% (122); BNB 0.605, 50.3% vs 35.6% (149); XRP 0.616, 54.3% vs 35.8% (129); DOGE 0.575, 52.2% vs 36.5% (138). Comparable to v1's per-coin results. Across all 100 pairs the median per-coin AUC is 0.583; 9 pairs are under 0.55 on their own (BCH, ETHFI, FLOW, JST, JTO, RAY, SENT, STRK, ZEC), median 90 signals per pair.

**Reliability** (pooled, 10 equal-count bins of ~54,770): predicted → observed 0.211→0.234, 0.244→0.264, 0.263→0.275, 0.278→0.289, 0.293→0.305, 0.308→0.322, 0.326→0.340, 0.348→0.356, 0.380→0.387, 0.460→0.459. Slightly under-confident at the low end, well calibrated where signals live.

### Who gets odds in the app
`eligibility()` in `utils/whatto/model.ts`. A coin shows a probability only if **both**:
1. **History:** its pair is one of the 100 in the training universe (7+ months of 1-minute history, tested out of sample), and
2. **Liquidity:** its live 24h quote volume falls in a tier whose edge flag is `yes` (today all five).

Every other pair (about 400 of the ~500 USDT pairs) streams live candles, book and trades but shows **"not enough history/liquidity for odds"**. No probability is ever extrapolated to a pair the model was not tested on. The tier's numbers (not the single coin's) are what the reading card quotes, because per-coin samples are too small.

## 6. Live-only layers (not backtested, bounded)
**Liquidity / order book** (top 20 levels, `depth20@100ms`):
- `spreadPenalty = clip((spread − 5 bp) / 20 bp, 0, 1)`
- `askHeavy = clip((−imbalance − 0.3) / 0.5, 0, 1)`, imbalance = (bid quote − ask quote)/(sum) over top 10 levels
- `factor = 1 − 0.5·spreadPenalty − 0.3·askHeavy`; `p ← base + (p_model − base)·factor`. It can only pull toward the base rate.

**News** (`utils/whatto/sentiment.ts`): fixed lexicon of ~150 finance words weighted −3…+3; negator in the previous 3 tokens multiplies by −0.74; headline score `raw/√(raw²+15)`; summary words count half. Coin score = `Σ sᵢwᵢ / (Σwᵢ + 1)` with `wᵢ = relevance · exp(−age/6h)`, relevance 1 if the coin is named and 0.3 for market-wide items. Applied as a logit nudge `clip(0.1 · score, −0.1, +0.1)`. At p ≈ 0.5 that is at most ±2.5 percentage points.

A signal needs **both** the model probability and the adjusted probability over the threshold, so neither layer can create a signal.

**On-chain:** mempool.space (BTC mempool size and fee rates) is shown for context and not used, because no free history exists to test it.

## 7. Position size
Fixed-fractional: `fraction of pot = risk% / stopDistance%`, capped at 100%. Risk% = 0.25% (careful), 0.5% (balanced), 1% (bold). Example: stop 0.35% away, balanced → 0.5/0.35 = 143% → capped to 100%. Fees and slippage are not included. With tight volatility-scaled stops, the cap often binds; the card states the number plainly.

## 8. Limitations (read these)
- **The edge is modest.** Pooled AUC 0.58. A signal lifts the odds of touching the target from about 32% to about 47% (tier A: 36% → 55%).
- **Touching a target is not profit.** About 40% of signals touched the stop first. The mean 30-minute return after a signal is +0.10% to +0.26% depending on tier, at or below a typical round-trip taker fee (~0.20%) plus spread and slippage, which are larger on thin coins. **Fees are not modelled.** Read Whatto as a probability display, not a trading system.
- **Survivorship / selection.** The universe is today's 100 most traded pairs that already had 7 months of history. Coins that faded or were delisted before October are absent, which can flatter results. Tiers use the volume at the time, which limits but does not remove this.
- **Tier choice and reported numbers share a period.** Eligibility per tier was decided on the same out-of-sample months that are reported. All five tiers passed, so nothing was dropped after the fact, but the "eligible" summary is not an independent test. The event definition, features, thresholds rule, edge rule and tier cut-offs were fixed before the first v2 run; the 3-of-4-month stability check was added after seeing v1-style results and can only remove tiers, never add them.
- **Tier E (< $1M/24h)** passed, but only covers moments when one of the 100 trained pairs went quiet. Thin pairs never in the universe get no odds. Live spreads on such moments are wide; the liquidity layer pulls the reading toward the base rate when the spread exceeds 5 bp.
- **Seven months of history**, one market regime family. Edges like this decay; the live track record on the Record tab is the real test.
- **The shipped model** (trained through August, calibrated on September) has no out-of-sample evaluation of its own; the metrics above come from the walk-forward fold models built the same way.
- **Signals cluster across coins.** Market-wide drops trigger many coins in the same minute, so 9,060 pooled signals are far from independent trials; pooled CIs are optimistic. Tier CIs are also optimistic for the same reason.
- **Scanner odds** use the calibrated model reading without the order-book and news layers (the scanner does not open book streams for every candidate); the coin page shows the full reading.
- Order-book and news layers are untested by construction (see §6). For coins outside the hand-picked six, news matching uses the CoinGecko name and tickers of 4+ characters only.
- Exchange data can be wrong or delayed; the app shows staleness but cannot detect a bad print beyond the winsorising.
- Binance-only model. On the Coinbase fallback the model pauses (and many small pairs have no Coinbase market at all).
