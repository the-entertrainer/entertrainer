# Whatto · Phase 1 brainstorm

Written before the architecture was locked. Each role argued for what it needed; the decisions it led to are in [ARCHITECTURE.md](ARCHITECTURE.md).

## Product & Narrative
- The one moment Whatto exists for: *a coin has been sliding for an hour, and the order flow starts to look like sellers are running out.* Everything else serves that moment.
- Speak to the person by name, in one sentence, with the evidence inside the sentence: "Naveen, BTC is still falling, but on past data 54% of setups like this rebounded at least 0.35% within 30 minutes (n = 111). For all falling BTC setups the base rate was 34%."
- Silence is a feature. Most of the time the honest answer is "no signal right now", and the screen should say so and still show the live odds.
- The track record is part of the product, not a footnote: every live signal is graded later against real candles.

## Quant Research
- Define the event first. "Falling" = 60-minute log return at or below −1.5σ (σ = EWMA 1-minute vol), and still down over 15 minutes. "Rebound" = the high touches close × exp(1σ·√30) within 30 minutes. Both scale with volatility, so one rule works for BTC and DOGE.
- Features must be computable identically live and offline, so they come from 1-minute klines only; Binance klines carry taker-buy volume, which gives real aggressor flow history for free.
- Regime and change-point: EWMA vol ratio, one-sided CUSUM for an upward shift, and Bayesian online change-point detection (Adams & MacKay 2007) on standardised returns.
- Model: L2 logistic regression (transparent, every coefficient readable), Platt calibration on a held-out month, walk-forward by calendar month. No hyperparameter search beyond that, to avoid fooling ourselves.
- Report AUC, Brier vs base-rate Brier, hit rate at threshold with a Wilson CI, de-clustered n, stop-first rate and mean forward return. If a coin's CI does not clear its base rate, that coin gets "no edge" and no signals.

## Data / Realtime Infra
- Verified from the build box (2026-10-12): `api.binance.com` and `stream.binance.com` answer 451 (geo-blocked here); `data-api.binance.vision` (REST) and `data-stream.binance.vision` (WS) work, keyless, `Access-Control-Allow-Origin: *`. Coinbase Exchange REST + WS and Kraken WS v2 also work.
- One combined Binance stream per watchlist: `aggTrade`, `depth20@100ms` (partial book snapshots, so no diff-sequence bookkeeping), `kline_1m`.
- Reconnect with exponential backoff and jitter, a 12-second staleness watchdog, `online`/`offline` events, and REST backfill of missed closed candles before resuming.
- Fallback to Coinbase for prices when Binance fails three times in a row; the model pauses there because Coinbase candles have no taker-buy volume.
- News: CryptoCompare/CoinDesk data APIs now need keys (401), Reddit JSON 403s, GDELT rate-limits to 1 request per 5 s. Public RSS from CoinDesk, Cointelegraph, Decrypt and The Block all answer, but browsers cannot read them (no CORS), so a small Nuxt server route merges them, cached 2 minutes.
- On-chain: mempool.space is keyless and CORS-open for Bitcoin mempool size and fees. No free history exists to test it, so it is shown as context and not used by the model.

## Mobile Engineering
- A single client-only Nuxt page (`/engage/whatto`) with bottom tabs; no new dependencies. Canvas charts drawn by hand (candles, depth, flow, sparklines) at devicePixelRatio, redrawn once per animation frame at most.
- Shallow state: the feed mutates plain objects and bumps one `tick` ref per frame, so 100 ms depth updates for six coins do not thrash Vue reactivity.
- 390 px first; two columns from 900 px.

## Bubblegum UI
- Hot pink #FF69B4 / soft pink #FFB6C1 / electric blue #00BFFF / dodger blue #1E90FF on a near-white pink paper.
- Glossy bubble buttons (top highlight, inner bottom shade, coloured drop shadow), rounded 24 px cards, bouncy springs (`cubic-bezier(.34,1.56,.64,1)`), all disabled under `prefers-reduced-motion` and the site's reduce-motion switch.
- Text never sits in white on the pinks or blues: ink #1F1033 on pink is 6.7:1. Pink-tinted text uses #B5175E (6.5:1 on white), blue text #0B5CAD (6.7:1).
- Up candles blue, down candles pink, with a legend, so the palette is consistent and colour is never the only cue (labels and signs carry it too).

## Security / Compliance / Risk
- No trading, no exchange keys, no accounts, no custody. Name, settings and history live in localStorage only.
- Never "buy now". Cards show a probability, its sample size, the base rate, a stop level, a fixed-fractional size and "Not financial advice."
- Show the uncomfortable numbers: in the backtest 43% of signals touched the stop first, and the mean 30-minute return after a signal (+0.11%) is smaller than a typical round-trip taker fee (about 0.2%).
- News links open with `rel="noopener noreferrer"`. The news route only fetches four fixed URLs (no user-controlled fetches, so no SSRF surface).

## Entertrainer Integration
- Engage registers apps in four places: the Engage index card list, `content/social-previews.ts` (OG title/description, social card by key), `public/sitemap.xml`, and the `bare` route list in `app.vue` (full-screen apps without masthead/footer). AstroClock also has a PWA shortcut in `nuxt.config.ts`. Whatto follows all five.
- Keep the sitewide bare-page seed mark visible; the header leaves room for it.
- The sitewide art direction (cream/ink/cobalt) is deliberately overridden inside the app because the owner asked for a bubblegum look for Whatto; the Engage card itself stays in the site's card style with a small pink icon.

## QA
- Headless Chrome against `nuxt dev` on port 3040 for several minutes: ticks arrive, charts redraw, a forced websocket drop reconnects, offline shows the banner and recovers, onboarding completes, zero console errors.
- Screenshots at 390×844 and 1280×800 for every screen; review for overlap and clipping before shipping.
- Production build and the repo's `npm run check` must pass.

## v2: every coin (October 2026)
- Ask: cover all coins, not just six, without inventing numbers.
- Options weighed: (a) apply the six-coin model to everything, rejected: untested extrapolation, especially on thin books; (b) one model per coin, rejected: most pairs have ~100 signals in 4 test months, far too few; (c) **one pooled model on a broad universe, judged per liquidity tier**, chosen. It shares strength across coins, and the tier is something the app can observe live (24h quote volume).
- Universe: every TRADING USDT pair for browsing (~500); 100 pairs with 7 full months of history for the model. Odds only where both history and a passing tier hold; everything else is live data with an explicit "no odds".
- Names: CoinGecko's own Binance mapping, never a symbol lookup (tickers collide). Ranks from CoinGecko, cached server-side.
- Market-wide "falling now" without hammering: the all-market miniTicker stream (free) for ranking, klines only for 12 candidates per minute.
