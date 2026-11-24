<script setup lang="ts">
import { useContentStore } from '~/stores/content'

const store = useContentStore()
const year = new Date().getFullYear()
const sectionLinks = [
  { label: 'Elevate', href: '/elevate' },
  { label: 'Empower', href: '/empower' },
  { label: 'Engage', href: '/engage' },
  { label: 'About me', href: '/about' }
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
        <NuxtLink v-for="link in sectionLinks" :key="link.href" class="ft__link u-underline" :to="link.href">{{ link.label }}</NuxtLink>
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
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1.2fr);
}
@media (max-width: 900px) { .ft__inner { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .ft__inner { grid-template-columns: minmax(0, 1fr); } }

.ft__brand { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-21); }

.ft__col { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-13); }
.ft__h { color: var(--muted); margin: 0 0 2rem; }
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
