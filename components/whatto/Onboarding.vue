<script setup lang="ts">
import type { WhattoApi } from '~/composables/whatto/useWhatto'
import { COINS } from '~/utils/whatto/coins'
import { MODEL, RISK_PCT, type RiskLevel } from '~/utils/whatto/model'

const emit = defineEmits<{ done: [] }>()
const api = inject<WhattoApi>('whatto')!

const step = ref(0)
const name = ref(api.prefs.value.name)
const coins = ref<string[]>([...api.prefs.value.coins])
const risk = ref<RiskLevel>(api.prefs.value.risk)
const ack = ref(false)
const wantNotify = ref(false)

const nameOk = computed(() => name.value.trim().length > 0 && name.value.trim().length <= 24)
function toggleCoin(id: string) {
  coins.value = coins.value.includes(id) ? coins.value.filter(c => c !== id) : [...coins.value, id]
}
const RISKS: { id: RiskLevel; label: string; blurb: string }[] = [
  { id: 'careful', label: 'Careful', blurb: 'Risk 0.25% of your pot per idea' },
  { id: 'balanced', label: 'Balanced', blurb: 'Risk 0.5% of your pot per idea' },
  { id: 'bold', label: 'Bold', blurb: 'Risk 1% of your pot per idea' },
]
const pooled = MODEL.evaluation.pooled

async function finish() {
  if (wantNotify.value) await api.requestNotifications()
  await api.savePrefs({ name: name.value.trim(), coins: coins.value, risk: risk.value, acknowledged: true, notify: wantNotify.value && api.notifPermission.value === 'granted', onboarded: true })
  emit('done')
}
</script>

<template>
  <main class="wt-shell ob">
    <div class="ob__dots" aria-hidden="true"><i v-for="i in 3" :key="i" :class="{ on: step >= i - 1 }" /></div>

    <section v-if="step === 0" class="wt-card ob__card wt-enter" aria-labelledby="ob-0">
      <WhattoLogo class="ob__logo" />
      <p class="wt-kicker">Hello there</p>
      <h1 id="ob-0" class="ob__title">What should we call you?</h1>
      <p class="wt-muted">Whatto watches falling coins live and tells you, by name, when the odds of a quick bounce look unusually good. With the numbers, every time.</p>
      <label class="wt-sr" for="ob-name">Your first name</label>
      <input id="ob-name" v-model="name" class="wt-input" maxlength="24" autocomplete="given-name" placeholder="Your first name" @keydown.enter="nameOk && (step = 1)">
      <button type="button" class="wt-btn wt-btn--block" :disabled="!nameOk" @click="step = 1">Nice to meet you</button>
    </section>

    <section v-else-if="step === 1" class="wt-card ob__card wt-enter" aria-labelledby="ob-1">
      <p class="wt-kicker">Step 2 of 3</p>
      <h1 id="ob-1" class="ob__title">Pick your coins, {{ name.trim() }}</h1>
      <p class="wt-muted wt-small">These six are the ones our model was trained and tested on. We'd rather say nothing than guess on coins we never tested.</p>
      <div class="wt-choices" role="group" aria-label="Coins to watch">
        <button v-for="c in COINS" :key="c.id" type="button" class="wt-choice" :aria-pressed="coins.includes(c.id)" @click="toggleCoin(c.id)">
          <strong>{{ c.id }}</strong><span class="wt-muted wt-small">{{ c.name }}</span>
        </button>
      </div>
      <h2 class="ob__sub">How much risk per idea?</h2>
      <div class="ob__risks" role="radiogroup" aria-label="Risk preference">
        <button v-for="r in RISKS" :key="r.id" type="button" role="radio" class="wt-choice ob__risk" :aria-checked="risk === r.id" @click="risk = r.id">
          <strong>{{ r.label }}</strong><span class="wt-muted wt-small">{{ r.blurb }}</span>
        </button>
      </div>
      <p class="wt-tiny wt-muted">We use this to size suggestions: position = {{ (RISK_PCT[risk] * 100).toFixed(2) }}% of your pot divided by the distance to the stop.</p>
      <div class="ob__row">
        <button type="button" class="wt-btn wt-btn--ghost" @click="step = 0">Back</button>
        <button type="button" class="wt-btn wt-btn--blue" :disabled="!coins.length" @click="step = 2">Next</button>
      </div>
    </section>

    <section v-else class="wt-card ob__card wt-enter" aria-labelledby="ob-2">
      <p class="wt-kicker">Step 3 of 3</p>
      <h1 id="ob-2" class="ob__title">The honest bit</h1>
      <ul class="ob__facts">
        <li>Signals are <strong>odds, not promises</strong>. Out of sample, {{ Math.round(pooled.hitRate * 100) }}% of our signals hit the bounce target within {{ MODEL.horizonMin }} minutes (n = {{ pooled.signals }}), against {{ Math.round(pooled.baseRateDeclustered * 100) }}% for any falling setup.</li>
        <li>In {{ Math.round(pooled.stopFirstRate * 100) }}% of signals the price touched the stop level first. The average 30-minute move after a signal was +{{ (pooled.meanFwdReturnSignals * 100).toFixed(2) }}%, which is <strong>smaller than typical trading fees</strong>.</li>
        <li>No trading, no keys, no accounts. Everything you enter stays on this device.</li>
        <li>This is not financial advice. You decide, and you can lose money.</li>
      </ul>
      <label class="ob__check">
        <input v-model="ack" type="checkbox">
        <span>I understand these are probabilities, not advice.</span>
      </label>
      <label class="ob__check">
        <input v-model="wantNotify" type="checkbox">
        <span>Notify me about high-confidence signals while Whatto is open. We ask the browser once and never spam: one alert per coin per 30 minutes, at most.</span>
      </label>
      <div class="ob__row">
        <button type="button" class="wt-btn wt-btn--ghost" @click="step = 1">Back</button>
        <button type="button" class="wt-btn" :disabled="!ack" @click="finish">Start watching</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.ob { max-width: 520px; padding-top: 20px; }
.ob__dots { display: flex; gap: 6px; justify-content: center; margin: 4px 0 16px; }
.ob__dots i { width: 8px; height: 8px; border-radius: 999px; background: #EBDDF0; transition: width .4s var(--wt-bounce), background .2s; }
.ob__dots i.on { width: 26px; background: var(--wt-pink); }
.ob__card { display: grid; gap: 16px; padding: 24px 20px; }
.ob__logo { width: 72px; height: 72px; animation: ob-bob 3s ease-in-out infinite; }
@keyframes ob-bob { 50% { transform: translateY(-6px) rotate(-4deg); } }
.ob__title { font-size: 28px; line-height: 1.12; font-weight: 800; }
.ob__sub { font-size: 17px; font-weight: 800; margin-top: 4px; }
.ob__risks { display: grid; gap: 8px; }
.ob__risk { justify-content: space-between; border-radius: 18px; }
.ob__row { display: flex; gap: 10px; }
.ob__row .wt-btn:last-child { flex: 1; }
.ob__facts { margin: 0; padding-left: 20px; display: grid; gap: 10px; font-size: 14px; }
.ob__check { display: flex; gap: 12px; align-items: flex-start; font-size: 14px; font-weight: 600; cursor: pointer; }
.ob__check input { width: 22px; height: 22px; margin: 0; flex: 0 0 22px; accent-color: #FF69B4; }
</style>
