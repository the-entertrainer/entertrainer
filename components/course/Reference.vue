<script setup lang="ts">
import { GLOSSARY, RESOURCES, VIDEOS, SOURCES, MODULES } from '~/content/course/ai'

/**
 * The reference shelf: glossary, resource library, video library and source
 * register, behind one search box.
 *
 * The brief asked for a searchable glossary and a resource library as separate
 * features. They are one feature: at the moment a learner needs any of this,
 * they have a word or a half-remembered link in mind and no idea which of four
 * lists it lives in. One box searches all four.
 */
const tab = ref<'glossary' | 'resources' | 'videos' | 'sources'>('glossary')
const q = ref('')

const needle = computed(() => q.value.trim().toLowerCase())
const match = (...fields: (string | undefined)[]) =>
  !needle.value || fields.some(f => f?.toLowerCase().includes(needle.value))

const terms = computed(() => GLOSSARY.filter(t => match(t.term, t.short, t.full)))
const resources = computed(() => RESOURCES.filter(r => match(r.title, r.purpose, r.kind)))
const videos = computed(() => VIDEOS.filter(v => match(v.title, v.channel, v.purpose)))
const sources = computed(() => SOURCES.filter(s => match(s.title, s.publisher, s.supports)))

const moduleTitle = (id: string) => MODULES.find(m => m.id === id)?.title ?? id
const openTerm = reactive<Record<string, boolean>>({})

const counts = computed(() => ({
  glossary: terms.value.length, resources: resources.value.length,
  videos: videos.value.length, sources: sources.value.length
}))
</script>

<template>
  <div class="ref">
    <div class="ref__search">
      <label class="sr-only" for="ref-q">Search the reference shelf</label>
      <input id="ref-q" v-model="q" class="glass-field" type="search"
             placeholder="Search terms, resources, videos and sources…" />
    </div>

    <div class="ref__tabs" role="tablist">
      <button v-for="t in (['glossary', 'resources', 'videos', 'sources'] as const)" :key="t"
              type="button" role="tab" class="ref__tab" :class="{ 'is-on': tab === t }"
              :aria-selected="tab === t" @click="tab = t">
        {{ t }} <span class="ref__n">{{ counts[t] }}</span>
      </button>
    </div>

    <!-- Glossary -->
    <div v-if="tab === 'glossary'" class="ref__list">
      <p v-if="!terms.length" class="ref__empty">No terms match “{{ q }}”.</p>
      <div v-for="t in terms" :key="t.term" class="gl">
        <button type="button" class="gl__head" :aria-expanded="!!openTerm[t.term]" @click="openTerm[t.term] = !openTerm[t.term]">
          <span class="gl__term">{{ t.term }}</span>
          <span class="gl__short">{{ t.short }}</span>
          <span class="gl__sign" aria-hidden="true">{{ openTerm[t.term] ? '–' : '+' }}</span>
        </button>
        <div v-if="openTerm[t.term]" class="gl__full">
          <p>{{ t.full }}</p>
          <p class="t-mono gl__where">Used in: {{ t.seenIn.map(moduleTitle).join(' · ') }}</p>
        </div>
      </div>
    </div>

    <!-- Resources -->
    <div v-else-if="tab === 'resources'" class="ref__list">
      <p v-if="!resources.length" class="ref__empty">No resources match “{{ q }}”.</p>
      <article v-for="r in resources" :key="r.id" class="rw">
        <a class="rw__title" :href="r.url" target="_blank" rel="noopener noreferrer">{{ r.title }} ↗</a>
        <p class="rw__purpose">{{ r.purpose }}</p>
        <p class="t-mono rw__meta">
          {{ r.kind }} · {{ r.minutes }} min · {{ r.level }}
          <template v-if="r.optional"> · optional</template>
          <template v-if="r.access !== 'open'"> · {{ r.access === 'account' ? 'free account' : 'partly paywalled' }}</template>
          · checked {{ r.checked }}
        </p>
      </article>
    </div>

    <!-- Videos -->
    <div v-else-if="tab === 'videos'" class="ref__list">
      <p v-if="!videos.length" class="ref__empty">No videos match “{{ q }}”.</p>
      <article v-for="v in videos" :key="v.id" class="rw">
        <a class="rw__title" :href="`https://www.youtube.com/watch?v=${v.yt}${v.start ? `&t=${v.start}s` : ''}`"
           target="_blank" rel="noopener noreferrer">{{ v.title }} ↗</a>
        <p class="rw__purpose">{{ v.purpose }}</p>
        <p class="t-mono rw__meta">{{ v.channel }} · {{ v.length }} · checked {{ v.checked }}</p>
        <p class="rw__access">{{ v.access }}</p>
      </article>
    </div>

    <!-- Sources -->
    <div v-else class="ref__list">
      <p class="ref__note">
        Every claim in this course that a reasonable person might want to check is wrapped in an
        evidence block naming its confidence level. These are the sources those blocks point at.
      </p>
      <p v-if="!sources.length" class="ref__empty">No sources match “{{ q }}”.</p>
      <article v-for="s in sources" :key="s.id" class="rw">
        <a v-if="s.url" class="rw__title" :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.title }} ↗</a>
        <span v-else class="rw__title">{{ s.title }}</span>
        <p class="rw__purpose"><b>Supports:</b> {{ s.supports }}</p>
        <p class="t-mono rw__meta">
          {{ s.publisher }} · {{ s.kind }}<template v-if="s.published"> · {{ s.published }}</template>
          · {{ s.confidence }} confidence · checked {{ s.checked }}
        </p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.ref { display: grid; gap: 18rem; }
.ref__search input { max-width: 520rem; }

.ref__tabs { display: flex; flex-wrap: wrap; gap: 8rem; border-bottom: var(--stroke) solid var(--line); padding-bottom: 12rem; }
.ref__tab {
  padding: 8rem 14rem; border-radius: var(--radius-full);
  border: var(--stroke) solid var(--blue); background: var(--paper); color: var(--blue);
  font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-size: 12.5rem; font-weight: 700;
  letter-spacing: 0.02em; text-transform: none; cursor: pointer;
}
.ref__tab.is-on { background: var(--blue); color: #fff; }
.ref__n { opacity: 0.6; }

.ref__list { display: grid; gap: 12rem; }
.ref__empty, .ref__note { font-size: 14.5rem; color: var(--muted); line-height: 1.6; max-width: 62ch; margin: 0; }

/* Glossary */
.gl { border: none; border-radius: var(--radius-m); background: var(--co-surface, var(--paper)); overflow: hidden; box-shadow: var(--co-shadow, none); }
.gl__head {
  display: grid; grid-template-columns: 190rem minmax(0, 1fr) 20rem; gap: 16rem; align-items: baseline;
  width: 100%; text-align: left; padding: 14rem 16rem;
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .gl__head:hover { background: var(--paper-2); } }
.gl__term { font-size: 15.5rem; font-weight: 700; }
.gl__short { font-size: 14rem; color: var(--muted); line-height: 1.5; }
.gl__sign { font-family: var(--font-mono); color: var(--muted); }
.gl__full { padding: 0 16rem 16rem; }
.gl__full p { margin: 0 0 8rem; font-family: 'Nunito Sans', var(--font-reading); font-size: 15rem; line-height: 1.65; max-width: 70ch; }
.gl__where { margin: 0; color: var(--muted); }
@media (max-width: 640px) { .gl__head { grid-template-columns: minmax(0, 1fr) 20rem; } .gl__short { grid-column: 1 / -1; } }

/* Rows */
.rw { padding: 14rem 16rem; border: none; border-radius: var(--radius-m); background: var(--co-surface, var(--paper)); box-shadow: var(--co-shadow, none); }
.rw__title { font-size: 15.5rem; font-weight: 700; color: var(--blue); text-decoration: underline; text-underline-offset: 3px; }
.rw__purpose { margin: 6rem 0 6rem; font-size: 14rem; line-height: 1.55; color: var(--muted); max-width: 68ch; }
.rw__purpose b { color: var(--ink); }
.rw__meta { margin: 0; color: var(--muted); opacity: 0.85; }
.rw__access { margin: 6rem 0 0; font-size: 13rem; line-height: 1.5; color: var(--muted); }
</style>
