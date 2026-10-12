<script setup lang="ts">
import type { WhattoApi } from '~/composables/whatto/useWhatto'
import { POPULAR } from '~/utils/whatto/coins'
import { MAX_WATCH } from '~/composables/whatto/marketFeed'
import { MODEL, RISK_PCT, type RiskLevel } from '~/utils/whatto/model'

const api = inject<WhattoApi>('whatto')!
const name = ref(api.prefs.value.name)
const account = ref<string>(api.prefs.value.account ? String(api.prefs.value.account) : '')
const confirmReset = ref(false)

function saveName() { if (name.value.trim()) void api.savePrefs({ name: name.value.trim().slice(0, 24) }) }
function saveAccount() {
  const v = Number(account.value.replace(/[^0-9.]/g, ''))
  void api.savePrefs({ account: v > 0 ? v : null })
}
const nav = inject<{ coins: () => void }>('whattoNav')!
const extras = computed(() => POPULAR.filter(c => !api.prefs.value.coins.includes(c)))
async function toggleNotify() {
  if (api.prefs.value.notify) { void api.savePrefs({ notify: false }); return }
  const ok = api.notifPermission.value === 'granted' || await api.requestNotifications()
  void api.savePrefs({ notify: ok })
  if (!ok) api.toast({ title: 'Notifications are blocked', body: 'Your browser said no. In-app alerts still work while Whatto is open.', tone: 'warn' })
}
function reset() {
  api.stop()
  api.resetAll()
  location.reload()
}
const RISKS: RiskLevel[] = ['careful', 'balanced', 'bold']
</script>

<template>
  <div class="se">
    <section class="se__intro wt-enter">
      <p class="wt-kicker">You</p>
      <h1 class="se__title">Settings</h1>
      <p class="wt-muted wt-small">Saved on this device only. Nothing is sent anywhere.</p>
    </section>

    <section class="wt-card se__block">
      <label class="se__label" for="se-name">Name</label>
      <div class="se__inline">
        <input id="se-name" v-model="name" class="wt-input" maxlength="24" @change="saveName">
        <button type="button" class="wt-btn wt-btn--sm" @click="saveName">Save</button>
      </div>
    </section>

    <section class="wt-card se__block">
      <h2 class="se__label">Watchlist</h2>
      <div class="wt-choices">
        <button v-for="c in api.prefs.value.coins" :key="c" type="button" class="wt-choice" aria-pressed="true" :aria-label="`Remove ${c}`" @click="api.toggleWatch(c)">{{ c }} <span aria-hidden="true">×</span></button>
        <button v-for="c in extras" :key="c" type="button" class="wt-choice" aria-pressed="false" @click="api.toggleWatch(c)">+ {{ c }}</button>
      </div>
      <button type="button" class="wt-btn wt-btn--sm wt-btn--ghost" @click="nav.coins()">Find any coin…</button>
      <p class="wt-tiny wt-muted">Up to {{ MAX_WATCH }} coins stream live; keep at least one. Signals and alerts run only for watchlisted coins that have odds.</p>
    </section>

    <section class="wt-card se__block">
      <h2 class="se__label">Risk per idea</h2>
      <div class="wt-choices" role="radiogroup" aria-label="Risk preference">
        <button v-for="r in RISKS" :key="r" type="button" role="radio" class="wt-choice" :aria-checked="api.prefs.value.risk === r" @click="api.savePrefs({ risk: r })">
          {{ r[0].toUpperCase() + r.slice(1) }} <span class="wt-muted wt-tiny">{{ (RISK_PCT[r] * 100).toFixed(2) }}%</span>
        </button>
      </div>
      <label class="se__label se__label--sub" for="se-acct">Pot size (optional, any currency)</label>
      <div class="se__inline">
        <input id="se-acct" v-model="account" class="wt-input" inputmode="decimal" placeholder="e.g. 50000" @change="saveAccount">
        <button type="button" class="wt-btn wt-btn--sm" @click="saveAccount">Save</button>
      </div>
      <p class="wt-tiny wt-muted">Size = pot × risk% ÷ distance to stop, capped at 100% of the pot. Fees and slippage are not included.</p>
    </section>

    <section class="wt-card se__block">
      <div class="se__row">
        <div>
          <h2 class="se__label">High-confidence alerts</h2>
          <p class="wt-tiny wt-muted">Browser notification plus an in-app bubble, at most one per coin per {{ MODEL.cooldownMin }} min, only while Whatto is open. Permission: {{ api.notifPermission.value }}.</p>
        </div>
        <button type="button" class="se__switch" role="switch" :aria-checked="api.prefs.value.notify" aria-label="High-confidence alerts" @click="toggleNotify"><span /></button>
      </div>
    </section>

    <section class="wt-card se__block">
      <h2 class="se__label">The model in one card</h2>
      <ul class="se__facts wt-small">
        <li>Logistic regression on {{ MODEL.features.length }} live features, calibrated with Platt scaling.</li>
        <li>Trained on Binance 1-minute candles, {{ MODEL.months[0] }} to {{ MODEL.months[MODEL.months.length - 1] }}, one pooled model over {{ MODEL.symbols.length }} USDT pairs. Odds only for those pairs, in liquidity tiers that passed out of sample.</li>
        <li>Signal bar: {{ Math.round(MODEL.threshold * 100) }}% calibrated probability (top {{ 10 }}% of the calibration month).</li>
        <li>Order book and news only nudge a reading; they cannot create a signal.</li>
      </ul>
      <p class="wt-tiny wt-muted">Full maths: docs/whatto/MODEL.md in the Entertrainer repo.</p>
    </section>

    <section class="wt-card se__block">
      <h2 class="se__label">Not financial advice</h2>
      <p class="wt-small">Whatto shows probabilities from past data. Markets change, past hit rates can fade, and you can lose money. No trading, no exchange keys, no custody.</p>
      <div class="se__inline se__reset">
        <button v-if="!confirmReset" type="button" class="wt-btn wt-btn--ghost wt-btn--sm" @click="confirmReset = true">Reset Whatto</button>
        <template v-else>
          <span class="wt-small">Erase name, settings and history?</span>
          <button type="button" class="wt-btn wt-btn--sm" @click="reset">Yes, erase</button>
          <button type="button" class="wt-btn wt-btn--ghost wt-btn--sm" @click="confirmReset = false">Keep</button>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.se__intro { padding: 18px 4px 8px; }
.se__title { font-size: 28px; font-weight: 800; margin: 2px 0 6px; }
.se__block { display: grid; gap: 10px; }
.se__label { font-size: 15px; font-weight: 800; }
.se__label--sub { margin-top: 6px; }
.se__inline { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.se__inline .wt-input { flex: 1; min-width: 0; min-height: 46px; font-size: 16px; }
.se__row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.se__switch { flex: 0 0 auto; position: relative; width: 58px; height: 34px; border-radius: 999px; border: 0; background: #E9DDEF; cursor: pointer; transition: background .2s; }
.se__switch span { position: absolute; top: 3px; left: 3px; width: 28px; height: 28px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(31,16,51,.25); transition: transform .35s var(--wt-bounce); }
.se__switch[aria-checked="true"] { background: linear-gradient(180deg, #7FE0FF, #1E90FF); }
.se__switch[aria-checked="true"] span { transform: translateX(24px); }
.se__facts { margin: 0; padding-left: 18px; display: grid; gap: 4px; }
.se__reset { margin-top: 4px; }
</style>
