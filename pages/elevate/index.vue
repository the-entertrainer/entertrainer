<script setup lang="ts">
import { BLOG_POSTS, type BlogPost } from '~/content/blogs'
import { composedToBlogPost, getPublishedComposedPosts } from '~/content/composed'
import {
  MUST_LETTERS,
  normalizeElevateCategory,
  type ElevateCategory
} from '~/content/elevate-categories'
import type { ComposedPost } from '~/types/composed'

useSeoMeta({
  title: 'Elevate · The Entertrainer Blogs',
  description: 'Mind, Universe, Science, Technology — pieces that start in a room and refuse the tidy story.',
  ogTitle: 'Elevate · MUST',
  ogDescription: 'Mind · Universe · Science · Technology.',
  ogUrl: 'https://entertrainer.in/elevate',
  ogImage: 'https://entertrainer.in/og-card-2026d.png'
})

useHead({
  link: [{ rel: 'alternate', type: 'application/rss+xml', title: 'Elevate · The Entertrainer Blogs', href: 'https://entertrainer.in/elevate.xml' }]
})

const { data: liveComposed } = await useAsyncData('elevate-composed-listing', async () => {
  try {
    const res = await $fetch<{ posts: ComposedPost[] }>('/api/composed')
    return res.posts ?? []
  } catch {
    return getPublishedComposedPosts()
  }
})

function withMustCategory(post: BlogPost): BlogPost {
  return { ...post, category: normalizeElevateCategory(post.category) }
}

const posts = computed<BlogPost[]>(() => {
  const seen = new Set(BLOG_POSTS.map((post) => post.slug))
  const extras = (liveComposed.value ?? [])
    .filter((post) => post.status === 'published' && !seen.has(post.slug))
    .map(composedToBlogPost)
    .map(withMustCategory)
  return [...BLOG_POSTS.map(withMustCategory), ...extras]
})

type SortMode = 'newest' | 'oldest'

const route = useRoute()
const router = useRouter()
const { settings, hydrated, hydrate } = useSiteSettings()
onMounted(() => hydrate())

const category = computed(() => {
  const raw = String(route.query.category || 'all').trim()
  if (raw === 'all' || !raw) return 'all'
  return normalizeElevateCategory(raw)
})

const sort = computed<SortMode>(() => {
  const raw = String(route.query.sort || '').trim()
  if (raw === 'oldest') return 'oldest'
  if (raw === 'newest') return 'newest'
  if (!hydrated.value) return 'newest'
  // Legacy "title" pref maps to newest for the single toggle.
  return settings.value.elevateSort === 'oldest' ? 'oldest' : 'newest'
})

const filteredPosts = computed(() => {
  let list = posts.value.slice()
  if (category.value !== 'all') {
    list = list.filter((post) => normalizeElevateCategory(post.category) === category.value)
  }
  if (sort.value === 'oldest') {
    list.sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt))
  } else {
    list.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
  }
  return list
})

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(+d)) return ''
  // Fixed zone so the server and the browser print the same day (a hydration
  // mismatch otherwise appears for readers west or east of the server).
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

function setQuery(next: { category?: string; sort?: SortMode }) {
  const query: Record<string, string> = {}
  const cat = next.category ?? category.value
  const s = next.sort ?? sort.value
  const preferred = settings.value.elevateSort === 'oldest' ? 'oldest' : 'newest'
  if (cat && cat !== 'all') query.category = cat
  if (s && s !== preferred) query.sort = s
  router.replace({ query })
}

const sortLabel = computed(() => (sort.value === 'oldest' ? 'Oldest first' : 'Newest first'))

function cycleSort() {
  const next: SortMode = sort.value === 'newest' ? 'oldest' : 'newest'
  setQuery({ sort: next })
}

/* Sunrise rays, rounded so server and browser print identical attributes. */
const r2 = (n: number) => Math.round(n * 100) / 100
const RAYS = Array.from({ length: 13 }, (_, i) => {
  const a = Math.PI + (i * Math.PI) / 12
  const len = i % 2 ? 186 : 228
  return { k: i, x1: r2(240 + Math.cos(a) * 118), y1: r2(240 + Math.sin(a) * 118), x2: r2(240 + Math.cos(a) * len), y2: r2(240 + Math.sin(a) * len) }
})

/* Issue numbers: No. 01 is the first essay ever published, so a number
   never changes when a new piece lands. */
const issueNo = computed(() => {
  const order = posts.value.slice().sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt))
  return new Map(order.map((p, i) => [p.slug, String(i + 1).padStart(2, '0')]))
})
const countFor = (cat: ElevateCategory) => posts.value.filter(p => normalizeElevateCategory(p.category) === cat).length

/* Filters reorder with Flip: capture the rows, change the query, animate. */
const listEl = ref<HTMLElement | null>(null)
const pageRoot = ref<HTMLElement | null>(null)
const { run } = useMotion(pageRoot)
let flipKit: Awaited<ReturnType<typeof loadGsap>> | null = null
async function withFlip(change: () => void) {
  if (motionLevel() === 'off' || !listEl.value) { change(); return }
  flipKit = flipKit ?? await loadGsap()
  const rows = listEl.value.querySelectorAll('.elevate__item')
  const state = flipKit.Flip.getState(rows)
  change()
  await nextTick(); await nextTick()
  if (!listEl.value) return
  flipKit.Flip.from(state, {
    targets: listEl.value.querySelectorAll('.elevate__item'),
    duration: motionLevel() === 'calm' ? 0.3 : 0.6,
    ease: 'ink',
    absolute: true,
    stagger: 0.03,
    onEnter: els => flipKit!.gsap.fromTo(els, { autoAlpha: 0, y: 13 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'ink' }),
    onLeave: els => flipKit!.gsap.to(els, { autoAlpha: 0, duration: 0.2, ease: 'exit' })
  })
}

function toggleLetter(cat: ElevateCategory) {
  void withFlip(() => {
    if (category.value === cat) setQuery({ category: 'all' })
    else setQuery({ category: cat })
  })
}

function clearCategory() {
  void withFlip(() => setQuery({ category: 'all' }))
}

onMounted(() => {
  void run((m) => {
    m.ScrollTrigger.batch('.elevate__item', {
      start: 'top 88%',
      once: true,
      onEnter: (els) => {
        m.inkReveal(els, { y: 21 * m.d, stagger: 0.06 * m.k })
        m.drawRule(els.map(e => e.querySelector('.elevate__item-rule')).filter(Boolean) as Element[], { stagger: 0.06 * m.k })
      }
    })
    if (!m.late) m.gsap.from('.elevate__sun', { yPercent: 70 * m.d, duration: 1.8 * m.k, ease: 'sun', clearProps: 'transform' })
    m.drawPath('.elevate__ray', { duration: 1.1 * m.k, stagger: 0.05 * m.k, delay: 0.5 * m.k })
  })
})

</script>

<template>
  <div ref="pageRoot" class="elevate">
    <EdHubHero
      title="Elevate"
      title-id="elevate-title"
      no="01"
      :kicker="`${posts.length} essays · Mind, Universe, Science, Technology`"
      deck="Essays that start in a room and refuse the tidy story."
    >
      <EdNewsletter variant="inline" />
      <template #art>
        <svg class="elevate__sunrise" viewBox="0 0 480 300" preserveAspectRatio="xMidYMax meet">
          <defs>
            <clipPath id="elevate-horizon"><rect x="0" y="0" width="480" height="240" /></clipPath>
          </defs>
          <g class="elevate__rays" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
            <line v-for="r in RAYS" :key="r.k" class="elevate__ray" :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2" />
          </g>
          <g clip-path="url(#elevate-horizon)">
            <g class="elevate__sun">
              <circle cx="240" cy="240" r="96" class="elevate__sun-disc" />
              <circle cx="240" cy="240" r="96" fill="none" stroke="currentColor" stroke-width="1.5" />
            </g>
          </g>
          <line x1="0" y1="240" x2="480" y2="240" stroke="currentColor" stroke-width="2" />
          <g stroke="currentColor" stroke-width="1" opacity=".55">
            <line v-for="n in 5" :key="n" :x1="24 + n * 6" :y1="250 + n * 9" :x2="456 - n * 6" :y2="250 + n * 9" :stroke-dasharray="`${30 - n * 4} ${8 + n * 3}`" />
          </g>
        </svg>
      </template>
    </EdHubHero>

    <section class="elevate__entry" aria-labelledby="articles-title">
      <div class="elevate__toolbar">
        <h2 id="articles-title" class="dp-kicker">Contents</h2>

        <div class="elevate__controls">
          <div class="elevate__must" role="group" aria-label="Filter by MUST: Mind, Universe, Science, Technology">
            <button
              v-for="item in MUST_LETTERS"
              :key="item.letter"
              type="button"
              class="elevate__must-tile"
              :aria-pressed="category === item.category"
              :aria-label="`${item.category}, ${countFor(item.category)} essays${category === item.category ? ', selected. Press again to show all' : ''}`"
              @click="toggleLetter(item.category)"
            >
              <span class="elevate__must-letter" aria-hidden="true">{{ item.letter }}</span>
              <span class="elevate__must-name" aria-hidden="true">{{ item.category }}</span>
              <span class="elevate__must-count" aria-hidden="true">{{ countFor(item.category) }}</span>
            </button>
            <button
              v-if="category !== 'all'"
              type="button"
              class="elevate__must-all"
              aria-label="Show all categories"
              @click="clearCategory"
            >
              All
            </button>
          </div>

          <button
            type="button"
            class="elevate__sort-toggle"
            :aria-pressed="sort === 'oldest'"
            :aria-label="`Sort order: ${sortLabel}. Activate to switch`"
            @click="cycleSort"
          >
            {{ sortLabel }}
          </button>
        </div>
      </div>

      <p class="dp-sr" role="status" aria-live="polite">{{ filteredPosts.length }} {{ filteredPosts.length === 1 ? 'essay' : 'essays' }}{{ category !== 'all' ? ` in ${category}` : '' }}</p>

      <ul
        ref="listEl"
        class="elevate__list"
        :class="{ 'elevate__list--compact': hydrated && settings.hideElevateExcerpts }"
      >
        <li v-for="post in filteredPosts" :key="post.slug" class="elevate__item" :data-flip-id="post.slug">
          <NuxtLink :to="`/elevate/${post.slug}`" class="elevate__row" :aria-labelledby="`article-${post.slug}`">
            <span class="elevate__no" aria-hidden="true">{{ issueNo.get(post.slug) }}</span>
            <div class="elevate__row-copy">
              <div class="elevate__row-meta">
                <span class="elevate__cat">{{ post.category }}</span>
                <span v-if="formatDate(post.publishedAt)" class="elevate__date">{{ formatDate(post.publishedAt) }}</span>
                <span class="elevate__mins">{{ post.minutes }} min</span>
              </div>
              <h3 :id="`article-${post.slug}`" class="elevate__row-title">{{ post.title }}</h3>
              <p v-if="!(hydrated && settings.hideElevateExcerpts)" class="elevate__row-dek">{{ post.dek }}</p>
            </div>
            <figure class="elevate__thumb">
              <EdEditorialImage :src="post.hero" :alt="post.heroAlt" />
            </figure>
          </NuxtLink>
          <span class="elevate__item-rule dp-rule" aria-hidden="true" />
        </li>
      </ul>

      <div v-if="!filteredPosts.length" class="elevate__empty" role="status">
        <svg class="elevate__empty-art" viewBox="0 0 120 70" aria-hidden="true">
          <line x1="4" y1="56" x2="116" y2="56" stroke="currentColor" stroke-width="1.5" />
          <path d="M34 56a26 26 0 0 1 52 0" fill="var(--accent)" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <p class="elevate__empty-line">Nothing in this filter yet.</p>
        <p class="elevate__empty-soon">Try another letter, or show all essays.</p>
        <button type="button" class="ticket ticket--sm" @click="clearCategory">Show all essays</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.elevate {
  max-width: var(--shell-max);
  margin: 0 auto;
  padding: var(--space-13) var(--hub-gutter) var(--space-89);
}

/* Sunrise over the section name. */
.elevate__sunrise { position: absolute; right: 0; bottom: 0; width: 100%; max-width: 520rem; height: 100%; color: var(--ink); overflow: visible; }
.elevate__sun-disc { fill: var(--accent); }
.elevate__rays { opacity: .6; }
@media (max-width: 899px) { .elevate__sunrise { left: 50%; right: auto; transform: translateX(-50%); } }

.elevate__entry { padding: var(--space-34) 0 0; }

.elevate__toolbar {
  position: sticky;
  top: calc(var(--nav-h) + var(--safe-top));
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14rem 20rem;
  padding: var(--space-13) 0;
  background: color-mix(in srgb, var(--paper) 94%, transparent);
  border-bottom: 2px solid var(--ink);
}

.elevate__controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10rem 14rem; min-width: 0; }
.elevate__must { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6rem; }

.elevate__must-tile {
  position: relative;
  display: inline-grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 2rem 8rem;
  min-height: 44rem;
  padding: 6rem 12rem 6rem 10rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), transform var(--dur-tap) var(--ease-out);
}
.elevate__must-letter {
  grid-row: span 2;
  display: grid; place-items: center;
  width: 26rem; height: 26rem; border-radius: 50%;
  border: var(--stroke) solid var(--ink);
  font: 600 14px/1 var(--font-display);
}
.elevate__must-name { font: 600 10px/1 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.elevate__must-count { font: 500 10px/1 var(--font-mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.elevate__must-tile[aria-pressed="true"] { background: var(--ink); color: var(--paper); }
.elevate__must-tile[aria-pressed="true"] .elevate__must-letter { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.elevate__must-tile[aria-pressed="true"] .elevate__must-count { color: color-mix(in srgb, var(--paper) 75%, transparent); }
@media (hover: hover) { .elevate__must-tile:not([aria-pressed="true"]):hover { background: var(--signal-field); } }
.elevate__must-tile:active { transform: scale(.97); }

.elevate__must-all, .elevate__sort-toggle {
  min-height: 44rem;
  padding: 6rem 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--ink);
  font: 600 11px/1 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
}
.elevate__must-all { border-style: dashed; }
.elevate__sort-toggle[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); }

.elevate__list { position: relative; list-style: none; margin: 0; padding: 0; }
.elevate__item { position: relative; }
.elevate__item-rule { position: absolute; left: 0; right: 0; bottom: 0; border-top-color: var(--ink); }

.elevate__row {
  display: grid;
  grid-template-columns: 120rem minmax(0, 1fr) 260rem;
  align-items: center;
  gap: var(--space-21) var(--space-34);
  padding: var(--space-21) 0;
  color: var(--ink);
}
.elevate__no {
  align-self: start;
  font: 400 clamp(48px, 5.4vw, 84px)/.85 var(--font-mono);
  letter-spacing: -.06em;
  color: color-mix(in srgb, var(--ink) 22%, transparent);
  font-variant-numeric: tabular-nums;
  transition: color var(--dur-mid) var(--ease-ink);
}
.elevate__row-copy { min-width: 0; }
.elevate__row-meta {
  display: flex; flex-wrap: wrap; gap: 6rem 14rem; align-items: center;
  margin: 0 0 var(--space-8);
  font: 500 var(--type-meta)/1.2 var(--font-mono);
  letter-spacing: .08em; text-transform: uppercase;
}
.elevate__cat { display: inline-flex; align-items: center; gap: 6rem; color: var(--ink); }
.elevate__cat::before { content: ''; width: 8rem; height: 8rem; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 1px var(--ink); }
.elevate__date, .elevate__mins { color: var(--muted); }
.elevate__mins { font-variant-numeric: tabular-nums; }
.elevate__row-title {
  margin: 0;
  font: 400 clamp(28px, 3vw, 44px)/1.02 var(--font-display);
  font-variation-settings: "opsz" 96, "SOFT" 30;
  letter-spacing: -.025em;
  text-wrap: balance;
}
.elevate__row-dek { margin: var(--space-8) 0 0; max-width: 56ch; font: 400 17px/1.5 var(--font-reading); color: var(--muted); }

/* The hero illustration waits inside a sun-shaped mask and opens on hover or
   focus, like ink spreading. Fully open on touch and narrow screens. */
.elevate__thumb {
  margin: 0;
  aspect-ratio: var(--crop);
  overflow: hidden;
  border-radius: var(--radius-s);
  background: var(--paper-2);
  clip-path: circle(32% at 50% 50%);
  transition: clip-path var(--dur-slow) var(--ease-ink);
}
.elevate__thumb :deep(.ed-editorial-image) { width: 100%; height: 100%; }
.elevate__thumb :deep(img) { object-fit: cover; transform: scale(1.12); transition: transform var(--dur-slow) var(--ease-ink); }
@media (hover: hover) {
  .elevate__row:hover .elevate__thumb { clip-path: circle(75% at 50% 50%); }
  .elevate__row:hover .elevate__thumb :deep(img) { transform: scale(1); }
  .elevate__row:hover .elevate__no { color: var(--ink); }
  .elevate__row:hover .elevate__row-title { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .12em; }
}
.elevate__row:focus-visible .elevate__thumb { clip-path: circle(75% at 50% 50%); }
.elevate__row:focus-visible .elevate__thumb :deep(img) { transform: none; }
.elevate__row:focus-visible .elevate__no { color: var(--ink); }
.elevate__row:focus-visible { outline: 2px solid var(--focus); outline-offset: 4px; }
@media (hover: none) { .elevate__thumb { clip-path: none; } .elevate__thumb :deep(img) { transform: none; } }

.elevate__list--compact .elevate__row { grid-template-columns: 72rem minmax(0, 1fr) 120rem; padding: var(--space-13) 0; }
.elevate__list--compact .elevate__no { font-size: 34px; }
.elevate__list--compact .elevate__row-title { font-size: 24px; }

.elevate__empty { display: grid; justify-items: center; gap: var(--space-8); padding: var(--space-55) 0; text-align: center; }
.elevate__empty-art { width: 140rem; color: var(--ink); }
.elevate__empty-line { margin: 0; font: 500 26px/1.2 var(--font-display); }
.elevate__empty-soon { margin: 0 0 var(--space-8); color: var(--muted); }

@media (max-width: 899px) {
  .elevate__row { grid-template-columns: 56rem minmax(0, 1fr); gap: var(--space-13); }
  .elevate__no { font-size: 34px; }
  .elevate__thumb { grid-column: 2; grid-row: 1; clip-path: none; }
  .elevate__thumb :deep(img) { transform: none; }
  .elevate__row-copy { grid-column: 2; }
  .elevate__toolbar { position: static; }
}
@media (max-width: 520px) {
  .elevate__row { grid-template-columns: minmax(0, 1fr); }
  .elevate__no { display: none; }
  .elevate__thumb, .elevate__row-copy { grid-column: 1; }
  .elevate__must-name { display: none; }
  .elevate__must-tile { grid-template-columns: auto auto; padding: 6rem 10rem 6rem 6rem; }
  .elevate__must-letter { grid-row: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .elevate__thumb, .elevate__thumb :deep(img), .elevate__no, .elevate__must-tile { transition: none; }
}
:global(html[data-reduce-motion="on"]) .elevate__thumb,
:global(html[data-reduce-motion="on"]) .elevate__thumb img { transition: none !important; }
</style>
