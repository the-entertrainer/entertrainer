<script setup lang="ts">
import { useWhatto } from '~/composables/whatto/useWhatto'
import { isCoinId } from '~/utils/whatto/coins'

const api = useWhatto()
provide('whatto', api)

type Tab = 'home' | 'coins' | 'coin' | 'news' | 'history' | 'settings'
const tab = ref<Tab>('home')
const focusCoin = ref('BTC')
const coinsView = ref<'browse' | 'falling'>('browse')
provide('whattoCoinsView', coinsView)
provide('whattoNav', {
  openCoin: (c: string) => { focusCoin.value = c; tab.value = 'coin'; window.scrollTo({ top: 0 }) },
  coins: (v: 'browse' | 'falling' = 'browse') => { coinsView.value = v; tab.value = 'coins'; window.scrollTo({ top: 0 }) },
  go: (t: Tab) => { tab.value = t; window.scrollTo({ top: 0 }) },
})
provide('whattoFocusCoin', focusCoin)

const started = ref(false)
async function boot() {
  if (started.value) return
  started.value = true
  const q = new URLSearchParams(location.search)
  if (!q.get('coin') && !api.prefs.value.coins.includes(focusCoin.value)) focusCoin.value = api.prefs.value.coins[0]
  await api.start()
  syncFocus()
}

onMounted(async () => {
  api.hydrate()
  const q = new URLSearchParams(location.search)
  const t = q.get('tab') as Tab | null
  if (t && ['home', 'coins', 'coin', 'news', 'history', 'settings'].includes(t)) tab.value = t
  if (q.get('view') === 'falling') coinsView.value = 'falling'
  const c = q.get('coin')?.toUpperCase()
  if (c && isCoinId(c)) focusCoin.value = c
  if (api.prefs.value.onboarded) await boot()
})
onBeforeUnmount(() => api.stop())

// Onboarding unmounts itself the moment prefs.onboarded flips, so boot from a watcher
// rather than relying on its 'done' event.
watch(() => api.prefs.value.onboarded, (v) => { if (v && api.hydrated.value) void boot() })
function finishOnboarding() { void boot() }

const statusLabel = computed(() => ({
  idle: 'Starting', connecting: 'Connecting', live: 'Live', stale: 'Checking', reconnecting: 'Reconnecting', offline: 'Offline',
}[api.status.value]))

function selectTab(t: Tab) { tab.value = t; window.scrollTo({ top: 0 }) }

// Stream the viewed coin on demand only while the Chart tab shows it; release it otherwise.
function syncFocus() {
  if (!started.value || !api.feed.value) return
  void api.viewCoin(tab.value === 'coin' ? focusCoin.value : null)
}
watch([tab, focusCoin, () => api.prefs.value.coins.join()], syncFocus)

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z' },
  { id: 'coins', label: 'Coins', icon: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4' },
  { id: 'coin', label: 'Chart', icon: 'M4 19V5M4 19h16M8 15l3-4 3 2 5-6' },
  { id: 'news', label: 'News', icon: 'M5 5h11v14H6a1 1 0 0 1-1-1zM16 9h3v9a1 1 0 0 1-1 1h-2M8 9h5M8 13h5' },
  { id: 'history', label: 'Record', icon: 'M12 8v4l3 2M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4' },
  { id: 'settings', label: 'You', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0' },
]
</script>

<template>
  <div class="wt">
    <header class="wt-top">
      <div class="wt-top__inner">
        <NuxtLink to="/engage" class="wt-iconbtn" aria-label="Back to Engage">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
        </NuxtLink>
        <div class="wt-brand"><WhattoLogo class="wt-brand__mark" /><span>Whatto</span></div>
        <span v-if="api.prefs.value.onboarded" class="wt-pill" :class="`wt-pill--${api.status.value}`" role="status" aria-live="polite">
          <span class="wt-pill__dot" aria-hidden="true" />
          {{ statusLabel }}<template v-if="api.source.value === 'coinbase' && api.status.value === 'live'"> · Coinbase</template>
        </span>
      </div>
    </header>

    <WhattoOnboarding v-if="!api.prefs.value.onboarded" @done="finishOnboarding" />

    <template v-else>
      <main class="wt-shell">
        <div v-if="api.status.value === 'offline'" class="wt-banner wt-banner--offline" role="alert">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" /></svg>
          <span>You are offline. Prices are frozen at the last tick and no signals can fire. We reconnect and backfill on our own.</span>
        </div>
        <div v-else-if="api.status.value === 'reconnecting' || api.status.value === 'stale'" class="wt-banner wt-banner--warn" role="status">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
          <span>The live feed went quiet. Reconnecting with backoff; nothing on screen is newer than {{ api.feed.value?.lastMessageAt ? new Date(api.feed.value.lastMessageAt).toLocaleTimeString() : 'the last tick' }}.</span>
        </div>
        <div v-else-if="api.source.value === 'coinbase'" class="wt-banner wt-banner--warn" role="status">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
          <span>Binance data is unreachable from here, so prices come from Coinbase (USD). The model is paused: it was trained on Binance taker-flow data that Coinbase does not provide.</span>
        </div>

        <WhattoHome v-if="tab === 'home'" />
        <WhattoCoins v-else-if="tab === 'coins'" />
        <WhattoCoin v-else-if="tab === 'coin'" />
        <WhattoNews v-else-if="tab === 'news'" />
        <WhattoHistory v-else-if="tab === 'history'" />
        <WhattoSettings v-else-if="tab === 'settings'" />
      </main>

      <nav class="wt-tabs" aria-label="Whatto sections">
        <button v-for="t in TABS" :key="t.id" type="button" class="wt-tab" :aria-current="tab === t.id ? 'page' : undefined" @click="selectTab(t.id)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="t.icon" /></svg>
          {{ t.label }}
        </button>
      </nav>
    </template>

    <div class="wt-toasts" aria-live="assertive">
      <div v-for="t in api.toasts.value" :key="t.id" class="wt-toast" :class="`wt-toast--${t.tone}`">
        <strong>{{ t.title }}</strong>
        <p>{{ t.body }}</p>
      </div>
    </div>
  </div>
</template>
