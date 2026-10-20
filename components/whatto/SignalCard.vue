<script setup lang="ts">
import { signalSentence, type WhattoApi } from '~/composables/whatto/useWhatto'
import type { CoinState } from '~/composables/whatto/marketFeed'
import { MODEL } from '~/utils/whatto/model'
import { coinName, fmtPct, fmtPrice, fmtTime } from '~/utils/whatto/coins'

const props = defineProps<{ state: CoinState; tick: number; compact?: boolean }>()
const api = inject<WhattoApi>('whatto')!

const r = computed(() => { void props.tick; return props.state.reading })
const chip = computed(() => {
  void props.tick
  const x = r.value
  if (!x) return props.state.elig && !props.state.elig.eligible && props.state.elig.why.indexOf('Waiting') !== 0 ? { label: 'No odds', cls: '' } : { label: 'Warming up', cls: '' }
  return {
    signal: { label: 'Rebound signal', cls: 'wt-chip--blue' },
    'below-threshold': { label: 'Falling · watching', cls: 'wt-chip--pink' },
    'thin-liquidity': { label: 'Falling · thin book', cls: 'wt-chip--pink' },
    'no-edge': { label: 'No edge here', cls: '' },
    'not-falling': { label: 'Not falling', cls: '' },
  }[x.reason]
})
const sizing = computed(() => (r.value ? api.sizing(r.value) : null))
const testMonths = computed(() => {
  const f = MODEL.evaluation.folds
  return f.length ? `${f[0].test} to ${f[f.length - 1].test}` : ''
})
const pct = (x: number) => `${Math.round(x * 100)}%`
</script>

<template>
  <article class="wt-card sc" :class="{ 'sc--signal': r?.isSignal, 'sc--compact': compact }" :aria-label="`${state.coin} reading`">
    <header class="sc__head">
      <div>
        <h3 class="sc__coin">{{ state.coin }} <span class="wt-muted sc__name">{{ coinName(state.coin) ?? '' }}</span></h3>
        <p class="num sc__price"><WhattoTicker :text="fmtPrice(state.coin, state.lastPrice)" :value="state.lastPrice" /> <span class="wt-muted wt-tiny">USDT</span></p>
      </div>
      <span class="wt-chip" :class="chip.cls">{{ chip.label }}</span>
    </header>

    <template v-if="r">
      <p class="sc__say">{{ signalSentence(api.prefs.value.name, r) }}</p>

      <div v-if="r.setup && r.eval" class="sc__meter">
        <div class="sc__meter-row wt-tiny">
          <span>Rebound odds now <strong class="num">{{ pct(r.pFinal) }}</strong></span>
          <span class="wt-muted">bar {{ pct(r.threshold) }} · base {{ pct(r.eval.baseRateDeclustered) }}</span>
        </div>
        <div class="wt-meter" role="meter" :aria-valuenow="Math.round(r.pFinal * 100)" aria-valuemin="0" aria-valuemax="100" :aria-label="`Rebound probability ${pct(r.pFinal)}`">
          <div class="wt-meter__fill" :style="{ width: `${Math.min(100, r.pFinal * 100)}%` }" />
          <span class="wt-meter__base" :style="{ left: `${r.eval.baseRateDeclustered * 100}%` }" />
          <span class="wt-meter__mark" :style="{ left: `${r.threshold * 100}%` }" />
        </div>
      </div>
      <p v-else-if="!r.setup && !compact" class="wt-tiny wt-muted">
        Model reading if it were a setup: {{ pct(r.pModel) }}. We only score coins that fell at least {{ Math.abs(MODEL.setupZ60) }}σ in the last hour and are still sliding.
      </p>

      <dl v-if="r.isSignal && r.eval && sizing" class="sc__facts">
        <div><dt>Bounce target</dt><dd class="num">{{ fmtPrice(state.coin, r.targetPrice) }} <small>+{{ fmtPct(r.reboundFrac, 2) }}</small></dd></div>
        <div><dt>Stop level</dt><dd class="num">{{ fmtPrice(state.coin, r.stopPrice) }} <small>−{{ fmtPct(r.stopFrac, 2) }}</small></dd></div>
        <div><dt>Suggested size</dt><dd class="num">{{ fmtPct(sizing.fraction, 0) }} of pot<small>{{ sizing.fraction >= 1 ? 'capped; ' : '' }}risks {{ fmtPct(sizing.riskPct, 2) }}<template v-if="sizing.amount"> · ≈ {{ sizing.amount.toLocaleString(undefined, { maximumFractionDigits: 0 }) }}</template></small></dd></div>
        <div><dt>Past hit rate</dt><dd class="num">{{ pct(r.eval.hitRate) }} <small>n = {{ r.eval.signals }}, 95% CI {{ pct(r.eval.hitRateCI95[0]) }}–{{ pct(r.eval.hitRateCI95[1]) }}</small></dd></div>
        <div><dt>Stop hit first</dt><dd class="num">{{ pct(r.eval.stopFirstRate) }} <small>of past signals</small></dd></div>
        <div><dt>Window</dt><dd class="num">{{ MODEL.horizonMin }} min <small>from {{ fmtTime(r.t + 60000) }}</small></dd></div>
      </dl>

      <p class="sc__foot wt-tiny wt-muted">
        Reading from the {{ fmtTime(r.t) }} candle close<template v-if="r.eval">; odds from out-of-sample tests {{ testMonths }}</template>.
        <strong>Not financial advice.</strong>
      </p>
    </template>
    <div v-else-if="state.error" class="wt-small" role="alert">{{ state.error }}</div>
    <div v-else-if="api.source.value === 'coinbase'" class="wt-small wt-muted">Model paused on the Coinbase fallback feed.</div>
    <p v-else-if="state.elig && !state.elig.eligible && state.historyLoaded && state.elig.why.indexOf('Waiting') !== 0" class="wt-small wt-muted">Live prices only: not enough history or liquidity for odds.</p>
    <div v-else class="sc__loading"><div class="wt-skeleton" style="height: 16px" /><div class="wt-skeleton" style="height: 16px; width: 70%" /></div>
  </article>
</template>

<style scoped>
.sc { display: grid; gap: 12px; }
.sc--signal { border: 2px solid var(--wt-blue); background: linear-gradient(180deg, #F0FAFF 0%, #FFFFFF 60%); animation: sc-bounce .7s var(--wt-bounce); }
@keyframes sc-bounce { 0% { transform: scale(.94); } 60% { transform: scale(1.02); } 100% { transform: none; } }
.sc__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.sc__coin { font-size: 20px; font-weight: 800; }
.sc__name { font-size: 13px; font-weight: 600; }
.sc__price { font-size: 22px; font-weight: 700; margin-top: 2px; }
.sc__say { font-size: 16px; line-height: 1.45; font-weight: 600; }
.sc--compact .sc__say { font-size: 14px; }
.sc__meter { display: grid; gap: 8px; }
.sc__meter-row { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.sc__facts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0; }
.sc__facts div { padding: 10px 12px; border-radius: 16px; background: #FBF5FA; }
.sc__facts dt { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--wt-muted); }
.sc__facts dd { margin: 2px 0 0; font-weight: 700; font-size: 15px; }
.sc__facts small { display: block; font-size: 11px; color: var(--wt-muted); font-weight: 600; }
.sc__foot { border-top: 1px dashed var(--wt-line); padding-top: 10px; }
.sc__loading { display: grid; gap: 8px; }
</style>
