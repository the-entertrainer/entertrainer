# Whatto · Model

Model `whatto-rebound-logit` v1, file `utils/whatto/model-v1.json`, fitted by `scripts/whatto-train.ts`.

## 1. The question
At the close of a 1-minute candle on a coin that is **steadily falling**, what is the probability that price **rebounds by at least one 30-minute volatility unit within the next 30 minutes**?

- σ_L: EWMA volatility of 1-minute log returns, λ = 0.995 (RiskMetrics form `σ²_t = λσ²_{t−1} + (1−λ)r²_t`).
- Setup (falling): `z60 = ln(C_t / C_{t−60}) / (σ_L √60) ≤ −1.5` and `z15 < 0`.
- Label: `y = 1` if `max(H_{t+1..t+30}) ≥ C_t · exp(1.0 · σ_L · √30)`.
- Stop level shown on cards: `C_t · exp(−1.0 · σ_L · √30)`.
- Typical target: median +0.35% (BTC ≈ +0.26%, DOGE ≈ +0.46%).

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
- Logistic regression `z = b₀ + Σ βᵢ xᵢ`, L2 penalty λ = 1 on β (not the intercept), fitted by Newton/IRLS.
- Platt calibration on a held-out month: `p = σ(a·z + b)`. v1: a = 1.2578, b = 0.1186, intercept −0.6182.
- Threshold: the calibrated probability at the top 10% of the calibration month's setups. v1: **0.505**.

| Feature | mean | std | β |
|---|---|---|---|
| z15 | −1.4957 | 1.0952 | −0.0619 |
| z60 | −2.0176 | 0.4941 | 0.0322 |
| dd120 | −1.9353 | 0.4817 | −0.1208 |
| rsi14 | −0.3452 | 0.1710 | 0.0452 |
| volRatio | 0.2126 | 0.2746 | 0.1729 |
| flow5 | −0.0705 | 0.1370 | −0.0038 |
| dflow | 0.0083 | 0.1234 | −0.0311 |
| vwapDev | −0.8422 | 0.3541 | −0.0727 |
| volSpike | 0.3452 | 0.7784 | 0.1946 |
| wick3 | 0.2429 | 0.1449 | −0.0236 |
| cusumUp | 0.6707 | 1.1752 | −0.0569 |
| cpProb | 0.1415 | 0.1631 | −0.0479 |
| regimeDrift | −0.3633 | 0.4615 | 0.0103 |

Reading: the biggest pushes toward a rebound are a **volume spike** and **short-term vol above long-term vol** (capitulation-like conditions); deeper drawdowns and further distance below VWAP push the other way. The aggressor-flow features carry little weight once volume and volatility are in the model.

## 4. Data
- Binance spot public 1-minute klines from `https://data.binance.vision/data/spot/monthly/klines/<PAIR>/1m/<PAIR>-1m-<YYYY-MM>.zip`.
- Pairs: BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT, XRPUSDT, DOGEUSDT. Months 2026-03 to 2026-09 (7 months, 1,848,960 candles, 70,998 setup rows).
- Kline column 10 (taker-buy base volume) gives real aggressor flow. Timestamps in 2025+ files are microseconds; the parser handles both.
- Raw data is not in git. To reproduce:
```bash
mkdir -p /tmp/whatto-data && cd /tmp/whatto-data
for s in BTC ETH SOL BNB XRP DOGE; do for m in 2026-03 2026-04 2026-05 2026-06 2026-07 2026-08 2026-09; do
  curl -sfO https://data.binance.vision/data/spot/monthly/klines/${s}USDT/1m/${s}USDT-1m-$m.zip && unzip -oq ${s}USDT-1m-$m.zip; done; done
cd - && node --experimental-strip-types scripts/whatto-train.ts /tmp/whatto-data utils/whatto/model-v1.json
```
Runs in about 40 s on Node 22.

## 5. Evaluation (out of sample)
Expanding walk-forward by calendar month: for test month m, train on months < m−1, calibrate and pick the threshold on m−1, predict m. Test months 2026-06 to 2026-09.

Signals are de-clustered like the app: first crossing per coin, then a 30-minute cooldown. The base rate is computed on setups de-clustered the same way.

**Pooled (4 test months, 6 coins)**
| Metric | Value |
|---|---|
| AUC (all setup bars, n = 40,834) | **0.597** |
| Brier | **0.2237** vs 0.2297 for the base-rate forecast |
| Signals | **612** |
| Hit rate at threshold | **54.2%** (95% Wilson CI 50.3–58.2%) |
| Base rate, de-clustered falling setups (n = 3,759) | **36.1%** |
| Stop touched before target (or same candle) | 42.8% of signals |
| Mean 30-min log return after a signal | +0.114% (setups: +0.046%) |

**By month**
| Test month | AUC | Brier | Signals | Hit rate | Base rate (all setup bars) |
|---|---|---|---|---|---|
| 2026-06 | 0.588 | 0.2301 | 180 | 52.8% | 38.0% |
| 2026-07 | 0.602 | 0.2181 | 135 | 48.1% | 33.5% |
| 2026-08 | 0.575 | 0.2261 | 118 | 58.5% | 35.7% |
| 2026-09 | 0.632 | 0.2195 | 179 | 57.5% | 35.5% |

**By coin**
| Coin | AUC | Brier | Brier (base) | Signals | Hit rate | 95% CI | Base rate | Stop first | Mean fwd 30m | Edge |
|---|---|---|---|---|---|---|---|---|---|---|
| BNB | 0.606 | 0.2200 | 0.2270 | 103 | 55.3% | 45.7–64.6% | 35.6% | 42% | +0.084% | yes |
| BTC | 0.602 | 0.2269 | 0.2340 | 111 | 51.4% | 42.2–60.4% | 34.2% | 47% | +0.061% | yes |
| DOGE | 0.582 | 0.2258 | 0.2299 | 111 | 58.6% | 49.3–67.3% | 36.5% | 44% | +0.122% | yes |
| ETH | 0.590 | 0.2266 | 0.2322 | 111 | 54.1% | 44.8–63.0% | 38.1% | 38% | +0.112% | yes |
| SOL | 0.586 | 0.2299 | 0.2346 | 87 | 52.9% | 42.5–63.0% | 36.7% | 43% | +0.207% | yes |
| XRP | 0.608 | 0.2141 | 0.2199 | 89 | 52.8% | 42.5–62.8% | 35.8% | 44% | +0.114% | yes |

**Reliability** (pooled, 10 equal-count bins, ~4,083 each): predicted → observed 0.245→0.252, 0.283→0.259, 0.305→0.296, 0.324→0.312, 0.342→0.358, 0.360→0.356, 0.380→0.379, 0.404→0.405, 0.437→0.454, 0.510→0.506. Calibration is close; discrimination is modest.

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
- **The edge is modest.** AUC ≈ 0.60. A signal lifts the odds of touching the target from about 36% to about 54%, but the CI is wide per coin (n ≈ 90–110).
- **Touching a target is not profit.** 43% of signals touched the stop first. The mean 30-minute return after a signal, +0.11%, is below a typical round-trip taker fee (~0.20%). Read Whatto as a probability display, not a trading system.
- **Seven months of history**, one market regime family. Edges like this decay; the live track record on the History tab is the real test.
- **The shipped model** (trained through August, calibrated on September) has no out-of-sample evaluation of its own yet; the metrics above come from the walk-forward fold models built the same way.
- The per-coin edge flag is decided on the same out-of-sample period that is reported; all six passed, so no coin was dropped after the fact. The event definition (−1.5σ setup, +1σ target, 30 minutes) and the top-10% threshold rule were fixed before the first run and not tuned on test results.
- **Signals cluster across coins.** Market-wide drops trigger several coins in the same minute, so the 612 pooled signals are not 612 independent trials; the effective sample is smaller and the pooled CI is optimistic. Per-coin CIs are the safer read.
- Order-book and news layers are untested by construction (see §6).
- Exchange data can be wrong or delayed; the app shows staleness but cannot detect a bad print beyond the winsorising.
- Binance-only model. On the Coinbase fallback the model pauses.
