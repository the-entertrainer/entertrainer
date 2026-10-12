# Whatto · Locked architecture

Status: **locked** for v2 (every coin, odds by tier). v1 covered six coins. Changes to the event definition, features or data sources need a new model version (see [MODEL.md](MODEL.md)).

## What it is
A client-only Engage app at `/engage/whatto`. It streams live Binance market data in the browser, computes 13 features per coin on every closed 1-minute candle, applies a logistic model fitted offline on real Binance history, and tells the user in plain words whether a falling coin's rebound odds have crossed a backtested threshold. It never trades.

## Files
| Path | Role |
|---|---|
| `pages/engage/whatto.vue` | Route, SEO, `<ClientOnly>` host, skeleton fallback |
| `components/whatto/App.vue` | Shell: header, connection pill, banners, tabs, toasts |
| `components/whatto/{Onboarding,Home,Coins,Coin,News,History,Settings}.vue` | Screens (`Coins` = searchable browser of every pair + Falling-now scanner) |
| `components/whatto/SignalCard.vue` | Conversational reading card (probability, evidence, target, stop, size) |
| `components/whatto/{CandleChart,DepthChart,FlowChart,Sparkline}.vue` | Canvas charts |
| `composables/whatto/marketFeed.ts` | WebSocket + REST client, reconnection, backfill, per-coin state |
| `composables/whatto/useUniverse.ts` | Coin universe: server list + localStorage TTL, all-market `!miniTicker@arr` stream, per-minute price samples |
| `composables/whatto/useScanner.ts` | Falling-now scan: stage 1 from the stream (or one 1h rolling-ticker bootstrap), stage 2 klines for 12 candidates, 429/418 backoff |
| `composables/whatto/useWhatto.ts` | App state, persistence, signal history + grading, news, notifications |
| `composables/whatto/canvas.ts` | HiDPI canvas helper and palette |
| `utils/whatto/features.ts` | Feature engine incl. BOCPD. Shared by app and training script |
| `utils/whatto/model.ts` | Applies `model-v2.json`, odds eligibility (history + liquidity tier), liquidity + news layers, sizing |
| `utils/whatto/tiers.ts` | 24h-quote-volume liquidity tiers, shared by app and trainer |
| `utils/whatto/model-v2.json` | Fitted coefficients, calibration, threshold, evaluation, historical signals |
| `utils/whatto/sentiment.ts` | Headline lexicon scoring and coin matching |
| `utils/whatto/coins.ts` | Coin id = Binance base asset; names, ranks, tick-size / magnitude price formatting, time formatting |
| `utils/whatto/coin-ids.json` | Base asset → CoinGecko id + name, from CoinGecko's own Binance market mapping (`scripts/whatto-coin-names.ts`) |
| `server/api/whatto/universe.get.ts` | Every TRADING USDT pair (exchangeInfo + 24h ticker, ~47 KB out of ~8 MB in) + CoinGecko market-cap ranks; 10-min memory cache, `s-maxage=600, stale-while-revalidate=3600`; ranks cached 6 h |
| `server/api/whatto/news.get.ts` | RSS merge (CoinDesk, Cointelegraph, Decrypt, The Block), 2-minute cache |
| `scripts/whatto-train.ts` | Reproducible pooled training + walk-forward evaluation per liquidity tier |
| `scripts/whatto-coin-names.ts` | Rebuilds `coin-ids.json` (keyless CoinGecko, throttled) |
| `assets/css/whatto.css` | Bubblegum skin, namespaced under `.wt` |
| `public/whatto-icon.svg`, `public/whatto-icon-192.png` | Icons |

Visibility: hidden since #65. Direct URL only: no Engage card, not in the sitemap, `noindex, nofollow` (meta + `X-Robots-Tag` via `routeRules`). `app.vue` (`bare` list) still applies.

## Data flow
```
data-api.binance.vision /api/v3/klines (1000 x 1m per coin)  ──► FeatureEngine (warm-up, BOCPD)
data-stream.binance.vision  aggTrade ─► trades ring buffer ─► flow chart, last price
                            depth20@100ms ─► book stats (spread, top-10 imbalance, ±0.1% depth) ─► liquidity layer
                            kline_1m (x=true) ─► FeatureEngine.push ─► evaluate() ─► reading ─► card / signal
/api/whatto/news (RSS) every 2 min ─► lexicon score per coin ─► bounded news nudge
mempool.space every 60 s (BTC only) ─► context panel (not in model)
/api/whatto/universe (10-min TTL) ─► coin list, decimals, names, ranks
data-stream.binance.vision !miniTicker@arr (1 socket) ─► price / 24h % / 24h volume for every pair ─► browser, tiers, scanner stage 1
```
**Stream budget.** Two sockets at most: the all-market miniTicker, and one combined socket with 3 streams per coin for the watchlist (≤ 12 coins) plus the one coin being viewed (≤ 39 streams; Binance allows 1024). Opening another coin sends `SUBSCRIBE`/`UNSUBSCRIBE` on the open socket (≥ 350 ms apart, under the 5 msgs/s limit) and drops the old coin's state. QA confirms the stream set returns to watchlist × 3 after browsing eight coins.
The model only runs on closed candles (as in training). The liquidity and news layers re-apply every 2 s.

## Signal rule
A signal fires on a closed candle when all hold:
1. The coin is in a falling setup (z60 ≤ −1.5 and z15 < 0).
2. The coin is **eligible**: one of the 100 trained pairs, and its live 24h quote volume is in a tier with `edge = true` (≥ 30 signals, AUC ≥ 0.55, Wilson 95% lower bound of hit rate > base rate, beats base in ≥ 3 of 4 test months). Ineligible coins get no number at all.
3. Calibrated model probability ≥ threshold (top 10% of the calibration month; 0.441 in v2).
3b. The coin is on the watchlist (viewing a coin streams it but never fires signals or alerts for it).
4. The probability after the liquidity shrink and news nudge is still ≥ threshold.
5. No signal for that coin in the previous 30 minutes (same de-clustering as the backtest).

Every signal is appended to local history and graded after 30 minutes with real Binance candles (target touched or not; whether the stop was touched first).

## Realtime reliability
- Backoff `min(30 s, 1 s · 2^attempt) × U(0.7, 1.3)`; reset after the first message of a new socket.
- Watchdog: no message for 12 s while "live" → `stale`, close, reconnect.
- `offline` event → close socket, show the offline banner; `online` → backfill and reconnect.
- After every reconnect, REST backfills missing closed candles from the last known bar, so features never skip a minute silently. A forming candle more than one minute ahead of the last closed bar also triggers backfill.
- Three straight Binance failures with no message → Coinbase fallback (prices and trades only, model paused, banner says why). Every fourth retry on Coinbase tries Binance again.
- States shown in the header pill: Starting, Connecting, Live, Checking, Reconnecting, Offline.

## Persistence and privacy
`localStorage["entertrainer.whatto.v1"]` = `{ prefs: { name, coins, risk, account, notify, acknowledged, onboarded }, history: [...last 200] }`. Nothing is sent to a server except the anonymous news request.

## Notifications
Asked for only from an explicit checkbox/toggle. Fire only for real signals on watchlisted, eligible coins, at most one per coin per 30 minutes and at most one OS notification per 2 minutes across all coins, `tag` per coin so the OS replaces rather than stacks. Always mirrored by an in-app toast. Works while the page is open; no push server (would need a backend and user identity, out of scope and not needed for honesty).

## Contrast (WCAG 2.2 AA)
| Text / background | Ratio |
|---|---|
| Ink #1F1033 on paper #FFF7FB | 16.9 |
| Muted #5B4A6B on white | 7.96 |
| Pink text #B5175E on white / on #FFE1EF | 6.46 / 5.32 |
| Blue text #0B5CAD on white / on #DDF3FF | 6.67 / 5.82 |
| Ink on button pink #FF69B4 / #F04FA3 | 6.72 / 5.38 |
| Ink on #00BFFF / #1E90FF | 8.39 / 5.50 |
| White on ink (offline banner) | 17.8 |

## Decisions and why
- **Client-side, no new deps.** Live data is keyless and CORS-open; a backend would add cost and a point of failure. Canvas drawing keeps the bundle small (no chart library) and lets the charts show exactly what the feed holds.
- **Partial-book depth stream** (`depth20@100ms`) instead of diff streams: every message is a full top-20 snapshot, so there is no sequence/gap logic to get wrong; deeper books are not needed for the liquidity layer.
- **Order book and news as live-only layers.** Binance has no free historical order-book data and the RSS feeds have no free archive, so neither can be backtested. They are therefore only allowed to move the reading by bounded, documented amounts, and cannot create a signal on their own.
- **Every coin, odds by tier (v2).** v1 offered only the six coins it was tested on. v2 lists every trading USDT pair, but a probability appears only for the 100 pairs in the pooled training set and only in liquidity tiers that passed out of sample. The rest show live data and say plainly that there is not enough history or liquidity for odds.
- **Names never guessed.** Tickers collide across chains (dozens of tokens share a symbol), so names come only from CoinGecko's own mapping of Binance markets to coin ids; anything unmapped shows the ticker alone. Ranks are CoinGecko market-cap ranks for those ids.
- **Windowed list, not a library.** Fixed 64 px rows positioned against the page scroll keep ~15–20 rows in the DOM for 500 coins.
- **Bubblegum override of the site art direction** is scoped to the app at the owner's request; the Engage index card stays in the site style.
