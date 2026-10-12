<script setup lang="ts">
import type { WhattoApi } from '~/composables/whatto/useWhatto'
import { MODEL } from '~/utils/whatto/model'
import { fmtDateTime, fmtPct, fmtPrice, fmtSignedPct } from '~/utils/whatto/coins'

const api = inject<WhattoApi>('whatto')!
const mine = computed(() => [...api.history.value].reverse())
const graded = computed(() => api.history.value.filter(h => h.outcome !== 'pending'))
const hits = computed(() => graded.value.filter(h => h.outcome === 'rebounded').length)
const pooled = MODEL.evaluation.pooled
const folds = MODEL.evaluation.folds
const past = computed(() => [...MODEL.historicalSignals].sort((a, b) => b.t - a.t).slice(0, 24))
const rel = MODEL.evaluation.reliability
</script>

<template>
  <div class="hi">
    <section class="hi__intro wt-enter">
      <p class="wt-kicker">Track record</p>
      <h1 class="hi__title">Did the bounces happen?</h1>
      <p class="wt-muted wt-small">Every live signal is graded {{ MODEL.horizonMin }} minutes later against real Binance candles. Nothing is edited after the fact.</p>
    </section>

    <section class="wt-card">
      <h2 class="hi__h2">On this device</h2>
      <p v-if="graded.length" class="hi__big num">{{ hits }} / {{ graded.length }} <span class="wt-small wt-muted">rebounded ({{ Math.round(hits / graded.length * 100) }}%)</span></p>
      <p v-if="!mine.length" class="wt-muted wt-small">No live signals yet. They are rare by design: in testing, about {{ (pooled.signals / pooled.setupsDeclustered * 100).toFixed(0) }}% of falling setups qualified.</p>
      <ul v-else class="hi__list">
        <li v-for="h in mine" :key="h.id" class="hi__row" :class="h.outcome">
          <span class="hi__coin"><strong>{{ h.coin }}</strong><span class="wt-tiny wt-muted">{{ fmtDateTime(h.t) }}</span></span>
          <span class="num wt-small">{{ fmtPrice(h.coin, h.close) }} → {{ fmtPrice(h.coin, h.target) }}</span>
          <span class="wt-chip" :class="h.outcome === 'rebounded' ? 'wt-chip--blue' : h.outcome === 'missed' ? 'wt-chip--pink' : ''">
            {{ h.outcome === 'pending' ? 'in play' : h.outcome === 'rebounded' ? `bounced ${fmtSignedPct(h.maxUp ?? 0)}` : `missed, best ${fmtSignedPct(h.maxUp ?? 0)}` }}
          </span>
        </li>
      </ul>
      <button v-if="mine.length" type="button" class="wt-btn wt-btn--ghost wt-btn--sm hi__clear" @click="api.clearHistory()">Clear this list</button>
    </section>

    <section class="wt-card">
      <h2 class="hi__h2">Backtest, out of sample</h2>
      <dl class="hi__stats">
        <div><dt>Signals</dt><dd class="num">{{ pooled.signals }}</dd></div>
        <div><dt>Hit rate</dt><dd class="num">{{ fmtPct(pooled.hitRate) }}</dd></div>
        <div><dt>Base rate</dt><dd class="num">{{ fmtPct(pooled.baseRateDeclustered) }}</dd></div>
        <div><dt>AUC</dt><dd class="num">{{ pooled.auc.toFixed(3) }}</dd></div>
        <div><dt>Brier</dt><dd class="num">{{ pooled.brier.toFixed(4) }}</dd></div>
        <div><dt>Brier, base only</dt><dd class="num">{{ pooled.brierBase.toFixed(4) }}</dd></div>
      </dl>
      <p class="wt-tiny wt-muted">{{ MODEL.symbols.length }} USDT pairs (one pooled model), {{ MODEL.months[0] }} to {{ MODEL.months[MODEL.months.length - 1] }} 1-minute Binance data. Each month was predicted by a model that never saw it. A hit means the high touched +{{ MODEL.reboundK }}σ within {{ MODEL.horizonMin }} minutes; {{ fmtPct(pooled.stopFirstRate, 0) }} of signals touched the stop first, and the mean 30-minute return after a signal was {{ fmtSignedPct(pooled.meanFwdReturnSignals) }}, before fees.</p>

      <h3 class="hi__h3">By liquidity tier (24h volume at the time)</h3>
      <ul class="hi__folds num wt-small">
        <li v-for="t in MODEL.tiers" :key="t.id"><strong>{{ t.id }} <span class="wt-tiny wt-muted">{{ t.label }}</span></strong><span>AUC {{ MODEL.evaluation.perTier[t.id].auc.toFixed(3) }}</span><span>{{ MODEL.evaluation.perTier[t.id].signals }} signals, {{ fmtPct(MODEL.evaluation.perTier[t.id].hitRate, 0) }} hit</span><span class="wt-muted">base {{ fmtPct(MODEL.evaluation.perTier[t.id].baseRateDeclustered, 0) }} · {{ MODEL.evaluation.perTier[t.id].edge ? 'odds on' : 'no odds' }}</span></li>
      </ul>

      <h3 class="hi__h3">By month</h3>
      <ul class="hi__folds num wt-small">
        <li v-for="f in folds" :key="f.test"><strong>{{ f.test }}</strong><span>AUC {{ f.auc.toFixed(3) }}</span><span>{{ f.signals }} signals, {{ fmtPct(f.hitRate, 0) }} hit</span><span class="wt-muted">base rate {{ fmtPct(f.baseRate, 0) }}</span></li>
      </ul>

      <h3 class="hi__h3">Calibration</h3>
      <p class="wt-tiny wt-muted">Predicted vs observed rebound rate in ten equal-size groups. Closer to the diagonal is better.</p>
      <svg class="hi__rel" viewBox="0 0 200 200" role="img" aria-label="Reliability diagram">
        <rect x="0" y="0" width="200" height="200" rx="14" fill="#FBF5FA" />
        <line x1="20" y1="180" x2="180" y2="20" stroke="#5B4A6B" stroke-dasharray="4 4" />
        <circle v-for="(b, i) in rel" :key="i" :cx="20 + b.meanP * 160 / 0.8" :cy="180 - b.observed * 160 / 0.8" r="5" fill="#FF69B4" stroke="#1F1033" stroke-width="1.5" />
        <text x="100" y="196" text-anchor="middle" font-size="10" fill="#5B4A6B">predicted (0 to 80%)</text>
        <text x="8" y="100" text-anchor="middle" font-size="10" fill="#5B4A6B" transform="rotate(-90 8 100)">observed</text>
      </svg>
    </section>

    <section class="wt-card">
      <h2 class="hi__h2">Historical signals from the backtest</h2>
      <p class="wt-tiny wt-muted">Labelled clearly: these are past out-of-sample signals from the test months, not live ones. Each month used its own fold model and threshold ({{ folds.map(f => Math.round(f.threshold * 100) + '%').join(', ') }}), so p can sit under today's bar. Coins often fire together on market-wide drops.</p>
      <ul class="hi__list">
        <li v-for="h in past" :key="`${h.coin}-${h.t}`" class="hi__row" :class="h.rebounded ? 'rebounded' : 'missed'">
          <span class="hi__coin"><strong>{{ h.coin }}</strong><span class="wt-tiny wt-muted">{{ fmtDateTime(h.t + 60000) }}</span></span>
          <span class="num wt-small">p {{ Math.round(h.p * 100) }}% · target +{{ fmtPct(h.reboundFrac, 2) }}</span>
          <span class="wt-chip" :class="h.rebounded ? 'wt-chip--blue' : 'wt-chip--pink'">{{ h.rebounded ? 'bounced' : 'missed' }} · 30m {{ fmtSignedPct(h.fwd30) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.hi__intro { padding: 18px 4px 8px; }
.hi__title { font-size: 28px; font-weight: 800; margin: 2px 0 6px; }
.hi__h2 { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
.hi__h3 { font-size: 14px; font-weight: 800; margin: 14px 0 6px; }
.hi__big { font-size: 30px; font-weight: 800; }
.hi__list { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 6px; }
.hi__row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; align-items: center; padding: 10px 12px; border-radius: 16px; background: #FBF5FA; }
.hi__row .wt-chip { grid-column: 1 / -1; justify-self: start; }
@media (min-width: 600px) { .hi__row { grid-template-columns: 140px 1fr auto; } .hi__row .wt-chip { grid-column: auto; justify-self: end; } }
.hi__coin { display: grid; }
.hi__clear { margin-top: 12px; }
.hi__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 0 0 10px; }
.hi__stats div { padding: 8px 10px; border-radius: 14px; background: #FBF5FA; }
.hi__stats dt { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--wt-muted); }
.hi__stats dd { margin: 2px 0 0; font-weight: 800; font-size: 17px; }
.hi__folds { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.hi__folds li { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px; padding: 8px 10px; border-radius: 12px; background: #FBF5FA; }
.hi__folds li span:nth-child(2) { justify-self: end; }
.hi__folds li span:nth-child(4) { justify-self: end; }
.hi__rel { width: 200px; height: 200px; display: block; margin: 6px 0; }
</style>
