<script setup lang="ts">
import type { WhattoApi } from '~/composables/whatto/useWhatto'
import { MODEL } from '~/utils/whatto/model'
import { coinNewsScore } from '~/utils/whatto/sentiment'
import { COIN_BY_ID, fmtPrice, fmtTime } from '~/utils/whatto/coins'

const api = inject<WhattoApi>('whatto')!
const focus = inject<Ref<string>>('whattoFocusCoin')!

const coin = computed(() => (api.prefs.value.coins.includes(focus.value) ? focus.value : api.prefs.value.coins[0]))
const st = computed(() => { void api.tick.value; return api.feed.value?.coins[coin.value] })
const r = computed(() => { void api.tick.value; return st.value?.reading ?? null })
const ev = computed(() => MODEL.evaluation.perCoin[coin.value])
const news = computed(() => coinNewsScore(coin.value, api.news.value, api.now.value))
const bp = (x: number) => `${(x * 10000).toPrecision(2)} bp`
const maxContrib = computed(() => Math.max(0.05, ...(r.value?.contributions.map(c => Math.abs(c.logit)) ?? [0])))
const lastTrades = computed(() => { void api.tick.value; return (st.value?.trades ?? []).slice(-6).reverse() })
</script>

<template>
  <div class="cd">
    <div class="wt-choices cd__pick" role="tablist" aria-label="Coin">
      <button v-for="c in api.prefs.value.coins" :key="c" type="button" role="tab" class="wt-choice" :aria-selected="c === coin" :aria-pressed="c === coin" @click="focus = c">{{ c }}</button>
    </div>

    <template v-if="st">
      <section class="wt-card cd__chartcard wt-enter">
        <header class="cd__head">
          <div>
            <h1 class="cd__title">{{ coin }}<span class="wt-muted">/USDT</span></h1>
            <p class="num cd__px">{{ fmtPrice(coin, st.lastPrice) }}</p>
          </div>
          <div class="cd__legend wt-tiny">
            <span><i class="sw sw--up" />up candle</span>
            <span><i class="sw sw--down" />down candle</span>
            <span v-if="r?.setup"><i class="sw sw--line" />target / stop</span>
          </div>
        </header>
        <div class="cd__chart"><WhattoCandleChart :state="st" :tick="api.tick.value" :history="api.history.value" /></div>
        <p class="wt-tiny wt-muted">1-minute candles, your local time. The faded candle is still forming. Last trade {{ st.lastTradeAt ? fmtTime(st.lastTradeAt, true) : '—' }}.</p>
      </section>

      <div class="wt-grid2 cd__grid">
        <div>
          <WhattoSignalCard :state="st" :tick="api.tick.value" />

          <section class="wt-card" v-if="r">
            <h2 class="cd__h2">Why the model says {{ Math.round(r.pModel * 100) }}%</h2>
            <p class="wt-tiny wt-muted">Each bar is that feature's push on the log-odds compared with a typical falling setup, after calibration. Pink pulls toward "keeps falling", blue toward "bounces".</p>
            <ul class="cd__contrib">
              <li v-for="c in r.contributions.slice(0, 8)" :key="c.name">
                <span class="cd__clabel">{{ c.label }} <span class="num wt-muted">{{ c.value.toFixed(2) }}</span></span>
                <span class="cd__cbar"><i :class="c.logit >= 0 ? 'pos' : 'neg'" :style="{ width: `${Math.abs(c.logit) / maxContrib * 50}%` }" /></span>
              </li>
            </ul>
            <dl class="cd__mini">
              <div><dt>Liquidity factor</dt><dd class="num">×{{ r.liquidityFactor.toFixed(2) }}</dd></div>
              <div><dt>News nudge</dt><dd class="num">{{ r.newsLogit >= 0 ? '+' : '' }}{{ r.newsLogit.toFixed(3) }} logit</dd></div>
              <div><dt>Regime age</dt><dd class="num">{{ st.snapshot?.bocpdRunLength ?? '—' }} min</dd></div>
              <div><dt>RSI 14</dt><dd class="num">{{ st.snapshot?.rsi.toFixed(1) ?? '—' }}</dd></div>
            </dl>
            <p class="wt-tiny wt-muted">{{ r.bookNote }}</p>
          </section>
        </div>

        <div>
          <section class="wt-card">
            <h2 class="cd__h2">Order book</h2>
            <dl class="cd__mini" v-if="st.book">
              <div><dt>Spread</dt><dd class="num">{{ bp(st.book.spread) }}</dd></div>
              <div><dt>Top-10 imbalance</dt><dd class="num">{{ (st.book.imbalance * 100).toFixed(0) }}%</dd></div>
              <div><dt>Depth ±0.1%</dt><dd class="num">{{ (st.book.depthQuote / 1000).toFixed(0) }}k</dd></div>
              <div><dt>Best bid / ask</dt><dd class="num cd__ba">{{ fmtPrice(coin, st.bids[0]?.p) }} / {{ fmtPrice(coin, st.asks[0]?.p) }}</dd></div>
            </dl>
            <div class="cd__depth"><WhattoDepthChart :state="st" :tick="api.tick.value" /></div>
          </section>

          <section class="wt-card">
            <h2 class="cd__h2">Who is hitting the market</h2>
            <p class="wt-tiny wt-muted">Aggressive buys (blue, up) and sells (pink, down) in 10-second buckets.</p>
            <div class="cd__flow"><WhattoFlowChart :state="st" :tick="api.tick.value" :now="api.now.value" /></div>
            <ul class="cd__trades num wt-tiny">
              <li v-for="(t, i) in lastTrades" :key="i" :class="t.buy ? 'b' : 's'">
                <span>{{ fmtTime(t.t, true) }}</span><span>{{ t.buy ? 'buy' : 'sell' }}</span><span>{{ fmtPrice(coin, t.p) }}</span><span>{{ t.q.toPrecision(4) }}</span>
              </li>
            </ul>
          </section>

          <section class="wt-card" v-if="ev">
            <h2 class="cd__h2">How the model did on {{ coin }}</h2>
            <dl class="cd__mini">
              <div><dt>AUC</dt><dd class="num">{{ ev.auc.toFixed(3) }}</dd></div>
              <div><dt>Brier (vs base)</dt><dd class="num">{{ ev.brier.toFixed(4) }} <small>({{ ev.brierBase.toFixed(4) }})</small></dd></div>
              <div><dt>Signal hit rate</dt><dd class="num">{{ Math.round(ev.hitRate * 100) }}% <small>n = {{ ev.signals }}</small></dd></div>
              <div><dt>Base rate</dt><dd class="num">{{ Math.round(ev.baseRateDeclustered * 100) }}% <small>n = {{ ev.setupsDeclustered }}</small></dd></div>
            </dl>
            <p class="wt-tiny wt-muted">Out of sample, walk-forward by month. Edge flag: {{ ev.edge ? 'yes' : 'no, so signals stay off' }}.</p>
          </section>

          <section class="wt-card">
            <h2 class="cd__h2">News pulse for {{ coin }}</h2>
            <p class="wt-small"><strong class="num">{{ news.score >= 0 ? '+' : '' }}{{ news.score.toFixed(2) }}</strong> on a −1 to +1 scale from {{ news.coinItems }} headline{{ news.coinItems === 1 ? '' : 's' }} naming {{ coin }} (6-hour decay).</p>
            <p class="wt-tiny wt-muted">Capped at ±0.1 log-odds in the reading. Untested, so it can nudge but never create a signal.</p>
          </section>

          <section v-if="coin === 'BTC' && api.mempool.value" class="wt-card">
            <h2 class="cd__h2">Bitcoin network right now</h2>
            <dl class="cd__mini">
              <div><dt>Mempool</dt><dd class="num">{{ api.mempool.value.count.toLocaleString() }} tx</dd></div>
              <div><dt>Size</dt><dd class="num">{{ api.mempool.value.vsizeMB.toFixed(1) }} vMB</dd></div>
              <div><dt>Next-block fee</dt><dd class="num">{{ api.mempool.value.fastestFee }} sat/vB</dd></div>
              <div><dt>30-min fee</dt><dd class="num">{{ api.mempool.value.halfHourFee }} sat/vB</dd></div>
            </dl>
            <p class="wt-tiny wt-muted">From mempool.space. Shown for context only, not used by the model (no free history to test it on).</p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cd__pick { margin: 16px -16px 12px; padding: 2px 16px 4px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
.cd__pick::-webkit-scrollbar { display: none; }
.cd__pick .wt-choice { flex: 0 0 auto; }
.cd__pick .wt-choice { min-height: 40px; padding: 8px 14px; }
.cd__chartcard { padding: 14px 12px 10px; }
.cd__head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; margin-bottom: 6px; }
.cd__title { font-size: 22px; font-weight: 800; }
.cd__px { font-size: 26px; font-weight: 700; }
.cd__legend { display: grid; gap: 2px; justify-items: start; color: var(--wt-muted); font-weight: 600; }
.sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
.sw--up { background: #1E90FF; } .sw--down { background: #FF69B4; } .sw--line { height: 2px; background: #1F1033; }
.cd__chart { height: 300px; margin: 4px -4px 6px; }
@media (min-width: 900px) { .cd__chart { height: 380px; } }
.cd__grid { margin-top: 14px; }
.cd__grid > div > .wt-card + .wt-card, .cd__grid > div > * + .wt-card { margin-top: 14px; }
.cd__h2 { font-size: 17px; font-weight: 800; margin-bottom: 6px; }
.cd__contrib { list-style: none; margin: 10px 0; padding: 0; display: grid; gap: 7px; }
.cd__contrib li { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 8px; align-items: center; font-size: 13px; font-weight: 600; }
.cd__cbar { position: relative; height: 12px; border-radius: 999px; background: #F6EEF6; }
.cd__cbar::before { content: ""; position: absolute; left: 50%; top: -2px; bottom: -2px; width: 1px; background: var(--wt-muted); }
.cd__cbar i { position: absolute; top: 0; bottom: 0; border-radius: 999px; }
.cd__cbar i.pos { left: 50%; background: linear-gradient(90deg, #7FE0FF, #1E90FF); }
.cd__cbar i.neg { right: 50%; background: linear-gradient(270deg, #FFB6C1, #FF69B4); }
.cd__mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; }
.cd__mini div { padding: 8px 10px; border-radius: 14px; background: #FBF5FA; min-width: 0; }
.cd__mini dt { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--wt-muted); }
.cd__mini dd { margin: 2px 0 0; font-weight: 700; overflow-wrap: anywhere; }
.cd__mini small { color: var(--wt-muted); font-weight: 600; }
.cd__ba { font-size: 13px; }
.cd__depth { height: 150px; margin-top: 6px; }
.cd__flow { height: 120px; margin: 8px 0; }
.cd__trades { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.cd__trades li { display: grid; grid-template-columns: 1.2fr .6fr 1.3fr 1fr; gap: 6px; padding: 3px 6px; border-radius: 8px; }
.cd__trades li.b { background: #EEF8FF; color: var(--wt-blue-deep); }
.cd__trades li.s { background: #FFF0F6; color: var(--wt-pink-deep); }
</style>
