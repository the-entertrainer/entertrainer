<script setup lang="ts">
import { CATEGORIES } from '~/content/editorial'
import { useContentStore } from '~/stores/content'

const store = useContentStore()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="ft">
    <div class="ft__inner">
      <div class="ft__brand">
        <EdWordmark :size="32" />
        <p class="ft__blurb">
          The portfolio of {{ store.name }} — a certified instructional designer who designs learning,
          builds the tools that deliver it, and keeps daring to try the thing he has not tried yet.
        </p>
        <a class="ticket ticket--sm" :href="`mailto:${store.email}`">Start a conversation</a>
      </div>

      <nav class="ft__col" aria-labelledby="ft-sections">
        <h2 id="ft-sections" class="t-mono ft__h">Sections</h2>
        <NuxtLink v-for="c in CATEGORIES" :key="c.id" class="ft__link u-underline"
                  :to="c.id === 'practice' ? '/instructional-design'
                     : c.id === 'projects' ? '/my-work'
                     : c.id === 'tools' ? '/tools'
                     : c.id === 'story' ? '/about'
                     : c.id === 'lab' ? '/lab' : '/colophon'">{{ c.label }}</NuxtLink>
      </nav>

      <nav class="ft__col" aria-labelledby="ft-elsewhere">
        <h2 id="ft-elsewhere" class="t-mono ft__h">Elsewhere</h2>
        <a v-for="s in store.socialLinks" :key="s.platform" class="ft__link u-underline"
           :href="s.url" :target="s.platform === 'email' ? undefined : '_blank'"
           :rel="s.platform === 'email' ? undefined : 'noopener noreferrer'">{{ s.label }}</a>
        <NuxtLink class="ft__link u-underline" to="/colophon">How it is built</NuxtLink>
      </nav>

      <div class="ft__col">
        <h2 class="t-mono ft__h">Credits</h2>
        <p class="ft__fine">
          Type is Bangers, Space Grotesk, Source Serif&nbsp;4, Kalam and IBM Plex Mono, all open-source.
          Artwork, marks and icons are original to this site. Asset provenance is recorded in
          <code>docs/asset_licenses.md</code>.
        </p>
        <p class="ft__fine">No analytics, no cookies, no database. Nothing you type in a tool leaves your browser.</p>
      </div>
    </div>

    <div class="ft__base">
      <p class="t-mono">© {{ year }} {{ store.name }} · Entertrainer</p>
      <p class="t-mono">Built by hand, mostly in the evenings</p>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  border-top: var(--stroke) solid var(--ink);
  background: var(--paper-2);
  margin-top: clamp(60rem, 10vh, 120rem);
}
.ft__inner {
  max-width: var(--shell-wide); margin: 0 auto;
  padding: clamp(36rem, 6vw, 64rem) var(--shell-gutter);
  display: grid; gap: clamp(28rem, 4vw, 48rem);
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
}
@media (max-width: 900px) { .ft__inner { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .ft__inner { grid-template-columns: minmax(0, 1fr); } }

.ft__brand { display: flex; flex-direction: column; align-items: flex-start; gap: 16rem; }
.ft__blurb {
  font-family: var(--font-reading);
  font-size: 16rem; line-height: 1.6; color: var(--muted); max-width: 40ch; margin: 0;
}

.ft__col { display: flex; flex-direction: column; align-items: flex-start; gap: 10rem; }
.ft__h { color: var(--muted); margin: 0 0 2rem; }
.ft__link { font-size: 15.5rem; font-weight: 600; }
.ft__fine { font-size: 13.5rem; line-height: 1.6; color: var(--muted); margin: 0; }
.ft__fine code { font-family: var(--font-mono); font-size: 12.5rem; }

.ft__base {
  border-top: var(--stroke-hair) solid var(--line);
  max-width: var(--shell-wide); margin: 0 auto;
  padding: 18rem var(--shell-gutter) calc(18rem + var(--safe-bottom));
  display: flex; flex-wrap: wrap; gap: 10rem 24rem; justify-content: space-between;
  color: var(--muted);
}
.ft__base p { margin: 0; }
</style>
