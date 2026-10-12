<script setup lang="ts">
import type { WhattoApi } from '~/composables/whatto/useWhatto'
import { coinNewsScore, mentions, scoreText, COIN_ALIASES } from '~/utils/whatto/sentiment'
import { fmtAgo } from '~/utils/whatto/coins'

const api = inject<WhattoApi>('whatto')!
const filter = ref<string>('all')

const items = computed(() => api.news.value.map((n) => {
  const s = scoreText(n.title, n.summary)
  const coins = Object.keys(COIN_ALIASES).filter(c => mentions(c, `${n.title} ${n.summary}`) === 'coin')
  return { ...n, score: s.score, words: s.words, coins }
}).filter(n => filter.value === 'all' || n.coins.includes(filter.value)).slice(0, 40))

const perCoin = computed(() => api.prefs.value.coins.map(c => ({ coin: c, ...coinNewsScore(c, api.news.value, api.now.value) })))
</script>

<template>
  <div class="nw">
    <section class="nw__intro wt-enter">
      <p class="wt-kicker">News, scored as numbers</p>
      <h1 class="nw__title">Headline pulse</h1>
      <p class="wt-muted wt-small">Every headline gets a score from a fixed word list (−1 to +1). Coin scores are time-weighted, fading with a 6-hour time constant. They can nudge a reading by 0.1 log-odds at most.</p>
    </section>

    <div class="nw__pulse">
      <div v-for="p in perCoin" :key="p.coin" class="nw__chipcard">
        <strong>{{ p.coin }}</strong>
        <span class="num" :class="p.score > 0.02 ? 'pos' : p.score < -0.02 ? 'neg' : ''">{{ p.score >= 0 ? '+' : '' }}{{ p.score.toFixed(2) }}</span>
        <span class="wt-tiny wt-muted">{{ p.coinItems }} items</span>
      </div>
    </div>

    <div class="wt-choices nw__filter" role="group" aria-label="Filter headlines">
      <button type="button" class="wt-choice" :aria-pressed="filter === 'all'" @click="filter = 'all'">All</button>
      <button v-for="c in api.prefs.value.coins" :key="c" type="button" class="wt-choice" :aria-pressed="filter === c" @click="filter = c">{{ c }}</button>
    </div>

    <p v-if="api.newsState.value.error && !api.news.value.length" class="wt-banner wt-banner--warn" role="alert">
      News feeds did not answer ({{ api.newsState.value.error }}). Readings run without the news nudge until they come back.
      <button type="button" class="wt-btn wt-btn--sm wt-btn--ghost" @click="api.loadNews()">Try again</button>
    </p>
    <div v-else-if="api.newsState.value.loading && !api.news.value.length" class="nw__list">
      <div v-for="i in 4" :key="i" class="wt-skeleton" style="height: 84px" />
    </div>
    <p v-else-if="!items.length" class="wt-muted wt-small">No headlines name this coin in the last 48 hours.</p>

    <ul class="nw__list">
      <li v-for="n in items" :key="n.id" class="wt-card nw__item">
        <div class="nw__meta wt-tiny">
          <span class="wt-chip">{{ n.source }}</span>
          <span class="wt-muted">{{ fmtAgo(n.publishedAt, api.now.value) }}</span>
          <span v-for="c in n.coins" :key="c" class="wt-chip wt-chip--blue">{{ c }}</span>
          <span class="nw__score num" :class="n.score > 0.02 ? 'pos' : n.score < -0.02 ? 'neg' : ''">{{ n.score >= 0 ? '+' : '' }}{{ n.score.toFixed(2) }}</span>
        </div>
        <a v-if="n.url" :href="n.url" target="_blank" rel="noopener noreferrer" class="nw__headline">{{ n.title }}</a>
        <p v-else class="nw__headline">{{ n.title }}</p>
        <p v-if="n.words.length" class="wt-tiny wt-muted">Scored words: <span v-for="(w, i) in n.words" :key="i" class="num">{{ w.word }} {{ w.weight > 0 ? '+' : '' }}{{ w.weight }}{{ i < n.words.length - 1 ? ', ' : '' }}</span></p>
        <p v-else class="wt-tiny wt-muted">No scored words: neutral.</p>
      </li>
    </ul>
    <p v-if="api.newsState.value.fetchedAt" class="wt-tiny wt-muted nw__src">
      Sources: {{ api.newsState.value.sources.map(s => `${s.source}${s.ok ? '' : ' (down)'}`).join(', ') }} · updated {{ fmtAgo(api.newsState.value.fetchedAt, api.now.value) }}
    </p>
  </div>
</template>

<style scoped>
.nw__intro { padding: 18px 4px 8px; }
.nw__title { font-size: 28px; font-weight: 800; margin: 2px 0 6px; }
.nw__pulse { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 10px; scrollbar-width: none; }
.nw__chipcard { flex: 0 0 auto; display: grid; justify-items: start; gap: 2px; padding: 10px 14px; border-radius: 20px; background: #fff; border: 1px solid var(--wt-line); min-width: 92px; }
.nw__chipcard .num { font-size: 18px; font-weight: 800; }
.pos { color: var(--wt-blue-deep); }
.neg { color: var(--wt-pink-deep); }
.nw__filter { margin: 4px 0 12px; }
.nw__filter .wt-choice { min-height: 38px; padding: 6px 14px; }
.nw__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.nw__item { display: grid; gap: 6px; margin: 0 !important; }
.nw__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.nw__score { margin-left: auto; font-weight: 800; font-size: 13px; }
.nw__headline { font-weight: 700; font-size: 15px; line-height: 1.35; color: var(--wt-ink) !important; text-decoration: none; }
.nw__headline:hover { text-decoration: underline; }
.nw__src { margin: 14px 4px; }
</style>
