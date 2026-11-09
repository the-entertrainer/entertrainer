<script setup lang="ts">
import { useContentStore } from '~/stores/content'
import { WORLD_ZONE_LINKS, type WorldZoneId } from '~/content/zone-links'

const store = useContentStore()
const year = new Date().getFullYear()

const PRIMARY_ZONE_IDS = ['elevate', 'empower', 'engage', 'learn', 'story'] as const satisfies readonly WorldZoneId[]
const SECONDARY_ZONE_IDS = ['work', 'dialogue', 'archive'] as const satisfies readonly WorldZoneId[]

function linksFor(ids: readonly WorldZoneId[]) {
  return ids.map((id) => {
    const link = WORLD_ZONE_LINKS.find((item) => item.id === id)
    if (!link) throw new Error(`Missing zone ${id}`)
    return link
  })
}

const sectionLinks = linksFor(PRIMARY_ZONE_IDS)
const moreLinks = [
  ...linksFor(SECONDARY_ZONE_IDS),
  { id: 'colophon', label: 'Colophon', route: '/colophon' },
]
</script>

<template>
  <footer class="ft">
    <div class="ft__inner">
      <div class="ft__brand">
        <EdWordmark :size="34" />
        <a class="ticket ticket--sm" :href="`mailto:${store.email}`">Write to me</a>
      </div>

      <nav class="ft__col" aria-labelledby="ft-sections">
        <h2 id="ft-sections" class="t-mono ft__h">On this site</h2>
        <NuxtLink v-for="link in sectionLinks" :key="link.route" class="ft__link u-underline" :to="link.route">{{ link.label }}</NuxtLink>
      </nav>

      <nav class="ft__col" aria-labelledby="ft-more">
        <h2 id="ft-more" class="t-mono ft__h">Also</h2>
        <NuxtLink v-for="link in moreLinks" :key="link.route" class="ft__link u-underline" :to="link.route">{{ link.label }}</NuxtLink>
      </nav>

      <div class="ft__col">
        <h2 class="t-mono ft__h">Privacy</h2>
        <p class="ft__fine">
          This site uses open-source type and original artwork. Read
          <NuxtLink to="/colophon" class="u-underline">How this site works</NuxtLink> for technical details.
        </p>
        <p class="ft__fine">This site has no database or analytics. StoryGen projects stay in your browser.</p>
      </div>
    </div>

    <div class="ft__base">
      <p class="t-mono">© {{ year }} {{ store.name }} · Entertrainer</p>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  border-top: var(--stroke) solid var(--ink);
  background: var(--paper);
  margin-top: var(--space-89);
}
.ft__inner {
  max-width: var(--shell-max); margin: 0 auto;
  padding: var(--space-55) var(--shell-gutter);
  display: grid; gap: var(--space-34);
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr);
}
@media (max-width: 900px) { .ft__inner { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .ft__inner { grid-template-columns: minmax(0, 1fr); } }

.ft__brand { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-21); }

.ft__col { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-13); }
.ft__h { color: var(--muted); margin: 0 0 0.125rem; }
.ft__link { display:inline-flex; align-items:center; min-height:var(--space-34); font-size:var(--type-body); font-weight:500; }
.ft__fine { font-size: var(--type-meta); line-height: 1.45; color: var(--muted); margin: 0; }
.ft__fine code { font-family: var(--font-mono); font-size: var(--type-meta); }

.ft__base {
  border-top: var(--stroke) solid var(--line);
  max-width: var(--shell-max); margin: 0 auto;
  padding: var(--space-21) var(--shell-gutter) calc(var(--space-21) + var(--safe-bottom));
  display: flex; flex-wrap: wrap; gap: var(--space-13) var(--space-21); justify-content: space-between;
  color: var(--muted);
}
.ft__base p { margin: 0; }
</style>
