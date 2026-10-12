<script setup lang="ts">
/**
 * Every USDT pair on Binance: search, sort, add to watchlist, open any coin.
 * The list is windowed against the page scroll (fixed 64 px rows), so ~500 rows
 * cost about 20 DOM nodes on a phone.
 */
import type { WhattoApi } from '~/composables/whatto/useWhatto'
import type { UniCoin } from '~/composables/whatto/useUniverse'
import { useScanner } from '~/composables/whatto/useScanner'
import { MAX_WATCH } from '~/composables/whatto/marketFeed'
import { eligibility } from '~/utils/whatto/model'
import { coinName, coinRank, fmtPrice, fmtSignedPct, fmtUsdCompact, fmtAgo } from '~/utils/whatto/coins'

const api = inject<WhattoApi>('whatto')!
const nav = inject<{ openCoin: (c: string) => void }>('whattoNav')!
const view = inject<Ref<'browse' | 'falling'>>('whattoCoinsView')!
const uni = api.uni
const scanner = useScanner()

type Sort = 'volume' | 'change' | 'gainers' | 'rank'
const q = ref('')
const sort = ref<Sort>('volume')
const oddsOnly = ref(false)
const SORTS: { id: Sort; label: string }[] = [
  { id: 'volume', label: '24h volume' },
  { id: 'change', label: 'Biggest drop' },
  { id: 'gainers', label: 'Biggest gain' },
  { id: 'rank', label: 'Market cap' },
]

const all = computed<UniCoin[]>(() => { void uni.version.value; return [...uni.rows.values()] })
const eligible = (c: UniCoin) => eligibility(c.coin, c.qv24).eligible
const oddsCount = computed(() => all.value.filter(eligible).length)

const list = computed(() => {
  const needle = q.value.trim().toLowerCase()
  let r = all.value
  if (needle) {
    r = r.filter(c => c.coin.toLowerCase().includes(needle) || (coinName(c.coin) ?? '').toLowerCase().includes(needle))
  }
  if (oddsOnly.value) r = r.filter(eligible)
  const key: Record<Sort, (c: UniCoin) => number> = {
    volume: c => -c.qv24,
    change: c => c.pct24,
    gainers: c => -c.pct24,
    rank: c => coinRank(c.coin) ?? 1e9,
  }
  const k = key[sort.value]
  const exact = needle ? (c: UniCoin) => (c.coin.toLowerCase() === needle ? -1 : c.coin.toLowerCase().startsWith(needle) ? 0 : 1) : () => 0
  return [...r].sort((a, b) => exact(a) - exact(b) || k(a) - k(b) || b.qv24 - a.qv24)
})

/* ---------- windowing ---------- */
const ROW = 64
const host = ref<HTMLElement | null>(null)
const range = ref({ from: 0, to: 30 })
let raf = 0
function measure() {
  raf = 0
  const el = host.value
  if (!el) return
  const top = el.getBoundingClientRect().top
  const from = Math.max(0, Math.floor(-top / ROW) - 6)
  const to = Math.min(list.value.length, Math.ceil((window.innerHeight - top) / ROW) + 6)
  if (from !== range.value.from || to !== range.value.to) range.value = { from, to: Math.max(to, from) }
}
const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
const visible = computed(() => list.value.slice(range.value.from, range.value.to))
watch(() => list.value.length, () => nextTick(measure))
watch(view, () => nextTick(measure))

let scanTimer: ReturnType<typeof setInterval> | null = null
function startScan() {
  if (scanTimer) return
  void scanner.run()
  scanTimer = setInterval(() => void scanner.run(), 60_000)
}
function stopScan() { if (scanTimer) clearInterval(scanTimer); scanTimer = null }
watch(view, v => (v === 'falling' ? startScan() : stopScan()), { immediate: false })

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  nextTick(measure)
  if (view.value === 'falling') startScan()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (raf) cancelAnimationFrame(raf)
  stopScan()
})

const watching = (c: string) => api.prefs.value.coins.includes(c)
const pct = (x: number) => `${Math.round(x * 100)}%`
const basisLabel = computed(() => ({ '60m': '60-minute move', '15m': '15-minute move (we have watched for under an hour)', '24h': '24-hour move (warming up: minute samples start now)', '': '…' }[scanner.scan.stage1Basis]))
</script>

<template>
  <div class="co">
    <section class="co__intro wt-enter">
      <p class="wt-kicker">Every coin</p>
      <h1 class="co__title">{{ uni.state.loaded ? `${all.length} coins` : 'Coins' }}</h1>
      <p class="wt-muted wt-small">
        Every Binance spot pair trading against USDT, live. Odds show on <strong>{{ oddsCount }}</strong> of them;
        the rest get live charts with an honest "no odds".
      </p>
    </section>

    <div class="wt-choices co__seg" role="tablist" aria-label="Coin views">
      <button type="button" role="tab" class="wt-choice" :aria-selected="view === 'browse'" :aria-pressed="view === 'browse'" @click="view = 'browse'">Browse</button>
      <button type="button" role="tab" class="wt-choice" :aria-selected="view === 'falling'" :aria-pressed="view === 'falling'" @click="view = 'falling'">Falling now</button>
    </div>

    <p v-if="uni.state.error" class="wt-banner wt-banner--warn">{{ uni.state.error }}</p>

    <template v-if="view === 'browse'">
      <div class="co__tools">
        <label class="wt-sr" for="co-q">Search coins</label>
        <div class="co__search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" /></svg>
          <input id="co-q" v-model="q" class="wt-input" type="search" inputmode="search" autocomplete="off" placeholder="Search ticker or name" @input="nextTick(measure)">
        </div>
        <div class="wt-choices co__sorts" role="radiogroup" aria-label="Sort by">
          <button v-for="s in SORTS" :key="s.id" type="button" role="radio" class="wt-choice" :aria-checked="sort === s.id" @click="sort = s.id">{{ s.label }}</button>
          <button type="button" class="wt-choice" :aria-pressed="oddsOnly" @click="oddsOnly = !oddsOnly">Odds only</button>
        </div>
        <p class="wt-tiny wt-muted">{{ list.length }} shown<template v-if="uni.state.live"> · live</template><template v-else-if="uni.state.fetchedAt"> · list from {{ fmtAgo(uni.state.fetchedAt, api.now.value) }}</template> · {{ api.prefs.value.coins.length }}/{{ MAX_WATCH }} on your watchlist</p>
      </div>

      <div v-if="!uni.state.loaded" class="wt-card co__empty"><span class="wt-skeleton" /> Loading every pair…</div>
      <p v-else-if="!list.length" class="wt-card co__empty">No coin matches "{{ q }}".</p>
      <div v-else ref="host" class="co__list" :style="{ height: `${list.length * ROW}px` }" role="list" aria-label="Coins">
        <div v-for="(c, i) in visible" :key="c.coin" class="co__row" role="listitem" :style="{ transform: `translateY(${(range.from + i) * ROW}px)` }">
          <button type="button" class="co__main" @click="nav.openCoin(c.coin)">
            <span class="co__id">
              <strong>{{ c.coin }}</strong>
              <span class="wt-tiny wt-muted co__name">
                <template v-if="coinRank(c.coin)">#{{ coinRank(c.coin) }} · </template>{{ coinName(c.coin) ?? 'ticker only' }}
              </span>
            </span>
            <span class="co__px">
              <strong class="num">{{ fmtPrice(c.coin, c.last) }}</strong>
              <span class="num wt-tiny" :class="c.pct24 >= 0 ? 'up' : 'down'">{{ fmtSignedPct(c.pct24) }} · {{ fmtUsdCompact(c.qv24) }}</span>
            </span>
            <span class="co__badge wt-tiny" :class="{ on: eligible(c) }">{{ eligible(c) ? 'odds' : 'live' }}</span>
          </button>
          <button type="button" class="co__star" :aria-pressed="watching(c.coin)" :aria-label="watching(c.coin) ? `Remove ${c.coin} from watchlist` : `Add ${c.coin} to watchlist`" @click="api.toggleWatch(c.coin)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" /></svg>
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <section class="wt-card co__scan">
        <header class="co__scanhead">
          <div>
            <h2 class="co__h2">Falling now</h2>
            <p class="wt-tiny wt-muted">Scanned {{ scanner.scan.scanned }} pairs over $1M/24h by {{ basisLabel }}; the steepest {{ 12 }} get real 1-minute candles. Rescans every minute.</p>
          </div>
          <button type="button" class="wt-btn wt-btn--sm" :disabled="scanner.scan.running" @click="scanner.run()">{{ scanner.scan.running ? 'Scanning…' : 'Scan now' }}</button>
        </header>
        <p v-if="scanner.scan.pausedUntil > api.now.value" class="wt-tiny wt-banner wt-banner--warn">Binance asked us to slow down; pausing until {{ new Date(scanner.scan.pausedUntil).toLocaleTimeString() }}.</p>
        <p v-if="!scanner.hits.value.length" class="wt-small wt-muted co__empty">{{ scanner.scan.running ? 'Reading candles…' : scanner.scan.lastAt ? 'Nothing is falling hard right now.' : 'Starting the scan…' }}</p>
        <ul v-else class="co__hits">
          <li v-for="h in scanner.hits.value" :key="h.coin">
            <button type="button" class="co__hit" @click="nav.openCoin(h.coin)">
              <span class="co__id"><strong>{{ h.coin }}</strong><span class="wt-tiny wt-muted co__name">{{ coinName(h.coin) ?? 'ticker only' }}</span></span>
              <span class="co__px">
                <strong class="num down">{{ fmtSignedPct(h.move60) }}</strong>
                <span class="num wt-tiny wt-muted">{{ Number.isFinite(h.z60) ? `${h.z60.toFixed(1)}σ / 60 min` : '—' }}</span>
              </span>
              <span class="co__odds">
                <span v-if="h.setup" class="wt-chip wt-chip--pink">setup</span>
                <span v-else class="wt-chip">dipping</span>
                <span class="wt-tiny num">{{ h.p !== null ? `odds ${pct(h.p)}` : h.elig.eligible ? 'odds when falling' : 'no odds' }}</span>
              </span>
            </button>
          </li>
        </ul>
        <p class="wt-tiny wt-muted">"Setup" = the model's rule: down at least {{ 1.5 }}σ over 60 minutes and still sliding. Odds are the calibrated model reading before the order-book and news layers, and only for coins in a tier that passed out of sample. Last scan {{ scanner.scan.lastAt ? fmtAgo(scanner.scan.lastAt, api.now.value) : '—' }} · {{ scanner.scan.requests }} candle requests this session.</p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.co { max-width: 760px; margin: 0 auto; }
.co__intro { margin: 18px 0 12px; }
.co__title { font-size: 28px; font-weight: 800; margin: 2px 0 4px; }
.co__seg { margin-bottom: 12px; }
.co__seg .wt-choice { flex: 1 1 0; justify-content: center; }
.co__tools { position: sticky; top: calc(61px + env(safe-area-inset-top)); z-index: 5; margin: 0 -16px 8px; padding: 8px 16px 8px; background: rgba(255, 247, 251, 0.94); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: grid; gap: 8px; }
.co__search { position: relative; }
.co__search svg { position: absolute; left: 14px; top: 50%; width: 18px; height: 18px; transform: translateY(-50%); fill: none; stroke: var(--wt-muted); stroke-width: 2.2; stroke-linecap: round; }
.co__search .wt-input { padding-left: 40px; width: 100%; }
.co__sorts { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 0 16px 2px; }
.co__sorts::-webkit-scrollbar { display: none; }
.co__sorts .wt-choice { flex: 0 0 auto; min-height: 36px; padding: 6px 12px; font-size: 13px; }
.co__empty { padding: 18px; display: flex; gap: 10px; align-items: center; }
.co__list { position: relative; contain: strict; width: 100%; }
.co__row { position: absolute; left: 0; right: 0; top: 0; height: 64px; display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--wt-line); will-change: transform; }
.co__main, .co__hit { flex: 1; min-width: 0; height: 100%; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 10px; padding: 0 4px; border: 0; background: none; text-align: left; cursor: pointer; border-radius: 14px; }
.co__main:active, .co__hit:active { background: #FBEFF6; }
.co__id { display: grid; min-width: 0; }
.co__id strong { font-size: 16px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.co__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.co__px { display: grid; justify-items: end; text-align: right; }
.co__px strong { font-size: 14px; }
.co__badge { min-width: 40px; text-align: center; padding: 3px 8px; border-radius: 999px; font-weight: 800; background: #F3ECF3; color: var(--wt-muted); }
.co__badge.on { background: #E3F4FF; color: var(--wt-blue-deep); }
.co__star { flex: 0 0 auto; width: 40px; height: 40px; border-radius: 999px; border: 1px solid var(--wt-line); background: #fff; display: grid; place-items: center; cursor: pointer; transition: transform .25s var(--wt-bounce); }
.co__star:active { transform: scale(.88); }
.co__star svg { width: 20px; height: 20px; fill: none; stroke: var(--wt-muted); stroke-width: 2; stroke-linejoin: round; }
.co__star[aria-pressed="true"] { background: #FFE1F0; border-color: var(--wt-pink-soft); }
.co__star[aria-pressed="true"] svg { fill: var(--wt-pink); stroke: var(--wt-pink-deep); }
.up { color: var(--wt-blue-deep); } .down { color: var(--wt-pink-deep); }
.co__scan { display: grid; gap: 10px; }
.co__scanhead .wt-btn { flex: 0 0 auto; white-space: nowrap; }
.co__scanhead { display: flex; gap: 10px; justify-content: space-between; align-items: flex-start; }
.co__h2 { font-size: 18px; font-weight: 800; }
.co__hits { list-style: none; margin: 0; padding: 0; display: grid; }
.co__hits li { border-bottom: 1px solid var(--wt-line); }
.co__hit { height: 60px; }
.co__odds { display: grid; justify-items: end; gap: 2px; }
</style>
