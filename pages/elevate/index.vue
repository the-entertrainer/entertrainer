<script setup lang="ts">
import { BLOG_POSTS, type BlogPost } from '~/content/blogs'
import { composedToBlogPost, getPublishedComposedPosts } from '~/content/composed'
import {
  ELEVATE_CATEGORIES,
  normalizeElevateCategory,
  type ElevateCategory
} from '~/content/elevate-categories'
import type { ComposedPost } from '~/types/composed'

useSeoMeta({
  title: 'Elevate · The Entertrainer Blogs',
  description: 'Mind, Universe, Science, Technology — curious pieces about questions that stay with you.',
  ogTitle: 'Elevate · MUST',
  ogDescription: 'Mind · Universe · Science · Technology.',
  ogUrl: 'https://entertrainer.in/elevate',
  ogImage: 'https://entertrainer.in/og-card.png'
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

type SortMode = 'newest' | 'oldest' | 'title'

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
  if (raw === 'oldest' || raw === 'title' || raw === 'newest') return raw
  if (!hydrated.value) return 'newest'
  return settings.value.elevateSort || 'newest'
})

const categories = computed(() => {
  const counts = new Map<ElevateCategory, number>()
  for (const id of ELEVATE_CATEGORIES) counts.set(id, 0)
  for (const post of posts.value) {
    const id = normalizeElevateCategory(post.category)
    counts.set(id, (counts.get(id) || 0) + 1)
  }
  return ELEVATE_CATEGORIES.map((id) => ({ id, count: counts.get(id) || 0 }))
})

const filteredPosts = computed(() => {
  let list = posts.value.slice()
  if (category.value !== 'all') {
    list = list.filter((post) => normalizeElevateCategory(post.category) === category.value)
  }
  if (sort.value === 'oldest') {
    list.sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt))
  } else if (sort.value === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    list.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
  }
  return list
})

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(+d)) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function setQuery(next: { category?: string; sort?: SortMode }) {
  const query: Record<string, string> = {}
  const cat = next.category ?? category.value
  const s = next.sort ?? sort.value
  const preferred = settings.value.elevateSort || 'newest'
  if (cat && cat !== 'all') query.category = cat
  if (s && s !== preferred) query.sort = s
  router.replace({ query })
}

const filtersOpen = ref(false)

const sortLabel = computed(() => {
  if (sort.value === 'oldest') return 'Oldest'
  if (sort.value === 'title') return 'A–Z'
  return 'Newest'
})

const categoryLabel = computed(() => (category.value === 'all' ? 'All' : category.value))

const filterSummary = computed(() => `${categoryLabel.value} · ${sortLabel.value}`)

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value
}

function filterByMust(cat: ElevateCategory) {
  setQuery({ category: cat })
  filtersOpen.value = true
}
</script>

<template>
  <main id="main" class="elevate">
    <header class="elevate__hero" aria-labelledby="elevate-title">
      <div class="elevate__hero-top">
        <p class="elevate__eyebrow">The Entertrainer blogs</p>
        <EdNewsletter
          variant="bubble"
          class="elevate__hero-bubble"
          :active-category="category"
          @select-category="filterByMust"
        />
      </div>
      <div class="elevate__hero-copy">
        <h1 id="elevate-title">Elevate</h1>
        <p class="elevate__deck">
          Questions that keep returning — curious pieces that stay with you.
        </p>
      </div>
    </header>

    <section class="elevate__entry" aria-labelledby="articles-title">
      <div class="elevate__toolbar">
        <div class="elevate__toolbar-lead">
          <h2 id="articles-title" class="elevate__section-label">Articles</h2>
          <p class="elevate__filter-summary" aria-live="polite">{{ filterSummary }}</p>
        </div>
        <button
          type="button"
          class="elevate__filters-toggle"
          :aria-expanded="filtersOpen"
          aria-controls="elevate-filters"
          @click="toggleFilters"
        >
          <span class="elevate__filters-toggle-label">{{ filtersOpen ? 'Hide filters' : 'Filters' }}</span>
          <span class="elevate__filters-toggle-icon" aria-hidden="true">{{ filtersOpen ? '−' : '+' }}</span>
        </button>
      </div>

      <div
        v-show="filtersOpen"
        id="elevate-filters"
        class="elevate__filters-panel"
      >
        <div class="elevate__sort" role="group" aria-label="Sort articles">
          <button type="button" class="elevate__sort-btn" :aria-pressed="sort === 'newest'" @click="setQuery({ sort: 'newest' })">Newest</button>
          <button type="button" class="elevate__sort-btn" :aria-pressed="sort === 'oldest'" @click="setQuery({ sort: 'oldest' })">Oldest</button>
          <button type="button" class="elevate__sort-btn" :aria-pressed="sort === 'title'" @click="setQuery({ sort: 'title' })">Title A–Z</button>
        </div>

        <div class="elevate__filters" role="radiogroup" aria-label="Filter by category">
          <button
            type="button"
            class="elevate__chip"
            role="radio"
            :aria-checked="category === 'all'"
            @click="setQuery({ category: 'all' })"
          >
            <span class="elevate__chip-dot" aria-hidden="true" />
            All
            <span class="elevate__chip-n">{{ posts.length }}</span>
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="elevate__chip"
            role="radio"
            :aria-checked="category === cat.id"
            @click="setQuery({ category: cat.id })"
          >
            <span class="elevate__chip-dot" aria-hidden="true" />
            {{ cat.id }}
            <span class="elevate__chip-n">{{ cat.count }}</span>
          </button>
        </div>
      </div>

      <ul
        class="elevate__list"
        :class="{ 'elevate__list--compact': hydrated && settings.hideElevateExcerpts }"
        aria-live="polite"
      >
        <li v-for="post in filteredPosts" :key="post.slug">
          <NuxtLink :to="`/elevate/${post.slug}`" class="elevate__row" :aria-labelledby="`article-${post.slug}`">
            <figure class="elevate__thumb">
              <EdEditorialImage :src="post.hero" :alt="post.heroAlt" />
            </figure>
            <div class="elevate__row-copy">
              <div class="elevate__row-meta">
                <span class="elevate__cat">{{ post.category }}</span>
                <span v-if="formatDate(post.publishedAt)" class="elevate__date">{{ formatDate(post.publishedAt) }}</span>
                <span class="elevate__mins">{{ post.minutes }} min</span>
              </div>
              <h3 :id="`article-${post.slug}`" class="elevate__row-title">{{ post.title }}</h3>
              <p v-if="!(hydrated && settings.hideElevateExcerpts)" class="elevate__row-dek">{{ post.dek }}</p>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <p v-if="!filteredPosts.length" class="elevate__empty">Nothing in this shelf yet. Try another letter.</p>
    </section>
  </main>
</template>

<style scoped>
.elevate {
  max-width: var(--shell-wide);
  margin: 0 auto;
  padding: clamp(22rem, 4vw, 56rem) var(--shell-gutter) 110rem;
}

.elevate__hero {
  position: relative;
  display: grid;
  gap: clamp(10rem, 2vw, 18rem);
  padding: clamp(8rem, 2vw, 18rem) 0 clamp(28rem, 5vw, 52rem);
  border-bottom: var(--stroke) solid var(--ink);
}

.elevate__hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rem;
  min-height: 56rem;
}

.elevate__eyebrow {
  margin: 0;
  padding-top: 18rem;
  color: var(--ink-soft);
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .1em;
  text-transform: uppercase;
}

.elevate__hero-bubble {
  flex: none;
  margin-left: auto;
}

.elevate__hero-copy { min-width: 0; }

.elevate__hero h1 {
  margin: 0;
  font: 500 clamp(72rem, 14vw, 168rem)/.78 var(--font-display);
  letter-spacing: -.08em;
}

.elevate__deck {
  max-width: 36ch;
  margin: 18rem 0 0;
  font: 400 clamp(17rem, 2vw, 22rem)/1.4 var(--font-reading);
  color: var(--ink);
}

.elevate__entry { padding: clamp(40rem, 7vw, 88rem) 0 0; }
.elevate__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10rem 16rem;
  margin-bottom: 0;
  padding: 0 0 14rem;
  border-bottom: var(--stroke) solid var(--line);
}
.elevate__toolbar-lead {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8rem 12rem;
  min-width: 0;
}
.elevate__section-label {
  margin: 0;
  color: var(--ink);
  font: 700 12rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
}
.elevate__section-label::before {
  content: '';
  display: inline-block;
  width: 8rem;
  height: 8rem;
  margin-right: 8rem;
  border-radius: 50%;
  background: var(--accent);
  border: 1px solid var(--ink);
  vertical-align: 0;
}
.elevate__filter-summary {
  margin: 0;
  color: var(--ink-soft);
  font: 600 12rem/1.2 var(--font-mono);
  letter-spacing: .04em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(48ch, 70vw);
}
.elevate__filters-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  min-height: 36rem;
  padding: 6rem 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink);
  font: 600 11rem/1 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  cursor: pointer;
}
.elevate__filters-toggle[aria-expanded="true"] {
  background: var(--accent);
  color: var(--accent-ink, #161618);
}
.elevate__filters-toggle-icon { font-size: 14rem; line-height: 1; font-weight: 700; }
.elevate__filters-toggle:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 3rem;
}

.elevate__filters-panel {
  display: grid;
  gap: 12rem;
  padding: 14rem 0 18rem;
  border-bottom: var(--stroke) solid var(--line);
  margin-bottom: 6rem;
}
.elevate__sort { display: inline-flex; flex-wrap: wrap; gap: 6rem; }
.elevate__sort-btn {
  min-height: 32rem;
  padding: 6rem 12rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink-soft);
  font: 600 11rem/1 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
}
.elevate__sort-btn[aria-pressed="true"] {
  border-color: var(--ink);
  background: var(--accent);
  color: var(--accent-ink, #161618);
}
.elevate__filters { display: flex; flex-wrap: wrap; gap: 8rem; }
.elevate__chip {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  min-height: 34rem;
  padding: 6rem 12rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink-soft);
  font: 600 12rem/1 var(--font-ui);
  cursor: pointer;
}
.elevate__chip[aria-checked="true"] {
  border-color: var(--ink);
  background: var(--accent);
  color: var(--accent-ink, #161618);
}
.elevate__chip-dot {
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  background: currentColor;
  opacity: .35;
}
.elevate__chip[aria-checked="true"] .elevate__chip-dot {
  background: var(--accent-ink, #161618);
  opacity: 1;
}
.elevate__chip-n {
  font: 700 10rem/1 var(--font-mono);
  opacity: .7;
}

.elevate__list {
  list-style: none;
  margin: 8rem 0 0;
  padding: 0;
}
.elevate__row {
  display: grid;
  grid-template-columns: 112rem minmax(0, 1fr);
  gap: 18rem;
  padding: 18rem 4rem;
  border-bottom: var(--stroke) solid var(--line);
  color: var(--ink);
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) {
  .elevate__row:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); }
  .elevate__row:hover .elevate__thumb :deep(.ed-editorial-image) { transform: scale(1.04); }
}
.elevate__row:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 3rem;
}
.elevate__thumb {
  margin: 0;
  width: 112rem;
  height: 72rem;
  overflow: hidden;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper-2);
}
.elevate__thumb :deep(.ed-editorial-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms var(--ease-out);
}
.elevate__row-copy { min-width: 0; padding-top: 2rem; }
.elevate__row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6rem 10rem;
  align-items: center;
  margin: 0 0 6rem;
  font: 600 11rem/1.2 var(--font-mono);
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.elevate__cat {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 3rem 8rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink);
}
.elevate__cat::before {
  content: '';
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  background: var(--accent);
  border: 1px solid var(--ink);
}
.elevate__date, .elevate__mins { color: var(--muted); }
.elevate__row-title {
  margin: 0;
  max-width: 52ch;
  font: 500 clamp(20rem, 2.4vw, 28rem)/1.15 var(--font-display);
  letter-spacing: -.03em;
}
.elevate__row-dek {
  margin: 6rem 0 0;
  max-width: 62ch;
  font-size: 15rem;
  line-height: 1.45;
  color: var(--ink-soft);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.elevate__empty {
  margin: 28rem 0 0;
  color: var(--muted);
  font-size: 16rem;
}

.elevate__list--compact .elevate__row {
  padding-top: 14rem;
  padding-bottom: 14rem;
  align-items: center;
}
.elevate__list--compact .elevate__thumb { width: 72rem; height: 48rem; }
.elevate__list--compact .elevate__row-title { font-size: clamp(17rem, 2vw, 22rem); }

@media (max-width: 640px) {
  .elevate { padding-top: 18rem; }
  .elevate__hero-top { align-items: center; }
  .elevate__eyebrow { padding-top: 0; }
  .elevate__hero h1 { font-size: clamp(64rem, 22vw, 120rem); }
  .elevate__toolbar { gap: 8rem 12rem; }
  .elevate__filters-toggle { min-height: 40rem; }
  .elevate__row { grid-template-columns: 88rem minmax(0, 1fr); gap: 12rem; }
  .elevate__thumb { width: 88rem; height: 60rem; }
  .elevate__row-dek { -webkit-line-clamp: 3; }
}

@media (prefers-reduced-motion: reduce) {
  .elevate__thumb :deep(.ed-editorial-image),
  .elevate__row { transition: none; }
  .elevate__row:hover .elevate__thumb :deep(.ed-editorial-image) { transform: none; }
}
:global(html[data-reduce-motion="on"]) .elevate__thumb :deep(.ed-editorial-image),
:global(html[data-reduce-motion="on"]) .elevate__row { transition: none; }
</style>
