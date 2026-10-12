<script setup lang="ts">
import type { WhattoApi } from '~/composables/whatto/useWhatto'
import { MODEL } from '~/utils/whatto/model'
import { coinName, fmtPrice, fmtSignedPct, fmtAgo } from '~/utils/whatto/coins'

const api = inject<WhattoApi>('whatto')!
const nav = inject<{ openCoin: (c: string) => void; go: (t: 'history') => void; coins: (v?: 'browse' | 'falling') => void }>('whattoNav')!

const coins = computed(() => { void api.tick.value; const f = api.feed.value; return f ? api.prefs.value.coins.map(c => f.coins[c]).filter(Boolean) : [] })
const signals = computed(() => coins.value.filter(c => c.reading?.isSignal))
const falling = computed(() => coins.value.filter(c => c.reading?.setup))
const greeting = computed(() => {
  const h = new Date(api.now.value).getHours()
  return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
})
function change1h(c: typeof coins.value[number]) {
  const b = c.bars
  if (b.length < 61 || !Number.isFinite(c.lastPrice)) return NaN
  return c.lastPrice / b[b.length - 60].c - 1
}
const graded = computed(() => api.history.value.filter(h => h.outcome !== 'pending'))
const hits = computed(() => graded.value.filter(h => h.outcome === 'rebounded').length)
</script>

<template>
  <div class="hm">
    <section class="hm__hello wt-enter">
      <p class="wt-kicker">{{ greeting }}</p>
      <h1 class="hm__title">Hi {{ api.prefs.value.name }}.</h1>
      <p class="wt-muted">
        <template v-if="signals.length">{{ signals.length === 1 ? 'One coin' : `${signals.length} coins` }} crossed our high-confidence bar.</template>
        <template v-else-if="falling.length">{{ falling.map(c => c.coin).join(', ') }} {{ falling.length === 1 ? 'is' : 'are' }} falling. No signal right now; we show the live odds below.</template>
        <template v-else>Nothing on your list is in a falling setup. No signal right now, and that is the honest answer.</template>
      </p>
    </section>

    <div class="wt-grid2">
      <div>
        <h2 class="wt-section-title"><span>{{ signals.length ? 'Signals' : 'Readings' }}</span><span class="wt-tiny">{{ MODEL.horizonMin }}-min horizon</span></h2>
        <template v-if="signals.length">
          <WhattoSignalCard v-for="c in signals" :key="c.coin" :state="c" :tick="api.tick.value" />
        </template>
        <WhattoSignalCard v-for="c in (signals.length ? falling.filter(x => !x.reading?.isSignal) : falling)" :key="c.coin" :state="c" :tick="api.tick.value" />

        <section class="wt-card hm__board" aria-labelledby="hm-board">
          <h3 id="hm-board" class="hm__board-title">Live odds board</h3>
          <p class="wt-tiny wt-muted">Updated at every 1-minute close. A coin is scored once its last hour falls to {{ MODEL.setupZ60 }}σ; a signal needs {{ Math.round(MODEL.threshold * 100) }}%.</p>
          <ul class="hm__board-list">
            <li v-for="c in coins" :key="c.coin">
              <strong>{{ c.coin }}</strong>
              <span class="num wt-small" :title="'60-minute move in volatility units'">{{ c.snapshot ? `${c.snapshot.values.z60 >= 0 ? '+' : ''}${c.snapshot.values.z60.toFixed(2)}σ` : '…' }}</span>
              <span class="hm__board-bar" aria-hidden="true"><i :style="{ width: `${Math.min(100, (c.reading?.pFinal ?? 0) * 100)}%` }" /><b :style="{ left: `${MODEL.threshold * 100}%` }" /></span>
              <span class="num wt-small hm__board-p">{{ c.reading ? `${Math.round(c.reading.pFinal * 100)}%` : c.elig && !c.elig.eligible && c.historyLoaded ? '—' : '…' }}</span>
              <span class="wt-tiny hm__board-state">{{ !c.reading ? (c.elig && !c.elig.eligible && c.historyLoaded ? 'no odds' : 'warming up') : c.reading.isSignal ? 'signal' : c.reading.setup ? 'scored' : 'not falling' }}</span>
            </li>
          </ul>
          <p class="wt-tiny wt-muted">Percent = model reading right now. It only counts when the coin is falling ("scored").</p>
        </section>
      </div>

      <div>
        <div class="hm__browse">
          <button type="button" class="wt-btn wt-btn--sm wt-btn--blue" @click="nav.coins('browse')">Browse every coin</button>
          <button type="button" class="wt-btn wt-btn--sm wt-btn--ghost" @click="nav.coins('falling')">What is falling now?</button>
        </div>
        <h2 class="wt-section-title"><span>Watchlist</span><span class="wt-tiny">tap for chart</span></h2>
        <ul class="hm__list">
          <li v-for="c in coins" :key="c.coin">
            <button type="button" class="hm__row" @click="nav.openCoin(c.coin)">
              <span class="hm__id"><strong>{{ c.coin }}</strong><span class="wt-tiny wt-muted">{{ coinName(c.coin) ?? 'ticker only' }}</span></span>
              <span class="hm__spark"><WhattoSparkline :state="c" :tick="api.tick.value" /></span>
              <span class="hm__px">
                <strong class="num">{{ fmtPrice(c.coin, c.lastPrice) }}</strong>
                <span class="num wt-tiny" :class="change1h(c) >= 0 ? 'up' : 'down'">{{ fmtSignedPct(change1h(c)) }} 1h</span>
              </span>
              <span class="hm__odds wt-tiny">
                <template v-if="c.reading?.isSignal"><span class="wt-chip wt-chip--blue">signal</span></template>
                <template v-else-if="c.reading?.setup"><span class="wt-chip wt-chip--pink num">{{ Math.round(c.reading.pFinal * 100) }}%</span></template>
                <template v-else-if="c.reading"><span class="wt-chip">calm</span></template>
                <template v-else-if="c.elig && !c.elig.eligible && c.historyLoaded"><span class="wt-chip">no odds</span></template>
                <template v-else><span class="wt-chip">…</span></template>
              </span>
            </button>
          </li>
        </ul>
        <p class="wt-tiny wt-muted hm__live" v-if="api.feed.value?.lastMessageAt">Last live tick {{ fmtAgo(api.feed.value.lastMessageAt, api.now.value) }} · source {{ api.source.value === 'binance' ? 'Binance' : 'Coinbase' }}</p>

        <button type="button" class="wt-card hm__record" @click="nav.go('history')">
          <span class="wt-kicker">Your live track record</span>
          <strong v-if="graded.length" class="num">{{ hits }} of {{ graded.length }} rebounded</strong>
          <strong v-else>No graded signals on this device yet</strong>
          <span class="wt-tiny wt-muted">Backtest: {{ Math.round(MODEL.evaluation.pooled.hitRate * 100) }}% of {{ MODEL.evaluation.pooled.signals }} out-of-sample signals vs {{ Math.round(MODEL.evaluation.pooled.baseRateDeclustered * 100) }}% base rate</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hm__hello { padding: 18px 4px 4px; }
.hm__title { font-size: 32px; font-weight: 800; line-height: 1.1; margin: 2px 0 6px; }
.hm__board { display: grid; gap: 8px; margin-top: 14px; }
.hm__board:first-child { margin-top: 0; }
.hm__board-title { font-size: 17px; font-weight: 800; }
.hm__board-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.hm__board-list li { display: grid; grid-template-columns: 46px 62px minmax(0, 1fr) 40px 74px; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px dashed var(--wt-line); }
.hm__board-list li:last-child { border-bottom: 0; }
.hm__board-bar { position: relative; height: 10px; border-radius: 999px; background: #F4EEF8; }
.hm__board-bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: linear-gradient(90deg, #FFB6C1, #FF69B4 60%, #1E90FF); transition: width .6s var(--wt-bounce); }
.hm__board-bar b { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--wt-ink); }
.hm__board-p { text-align: right; font-weight: 700; }
.hm__board-state { color: var(--wt-muted); font-weight: 700; text-align: right; }
.hm__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.hm__row {
  width: 100%; display: grid; grid-template-columns: 74px minmax(0, 1fr) auto 52px; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 20px; border: 1px solid var(--wt-line); background: #fff; cursor: pointer; text-align: left;
  box-shadow: 0 6px 16px -12px rgba(181, 23, 94, .5);
  transition: transform .3s var(--wt-bounce);
}
.hm__row:hover { transform: translateY(-2px); }
.hm__row:active { transform: scale(.97); }
.hm__id { display: grid; }
.hm__id strong { font-size: 16px; }
.hm__spark { height: 34px; min-width: 0; }
.hm__px { display: grid; justify-items: end; }
.hm__px strong { font-size: 15px; }
.up { color: var(--wt-blue-deep); font-weight: 700; }
.down { color: var(--wt-pink-deep); font-weight: 700; }
.hm__odds { justify-self: end; }
.hm__live { margin: 8px 4px 0; }
.hm__record { display: grid; gap: 4px; width: 100%; margin-top: 14px; text-align: left; cursor: pointer; }
.hm__record strong { font-size: 18px; }
.hm__browse { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 16px; }
</style>
