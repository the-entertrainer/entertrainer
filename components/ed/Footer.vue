<script setup lang="ts">
import { useContentStore } from '~/stores/content'

const store = useContentStore()
const year = new Date().getFullYear()
const sectionLinks = [
  { label: 'Lessons', href: '/lessons' },
  { label: 'Projects', href: '/my-work' },
  { label: 'Free tools', href: '/tools' },
  { label: 'About', href: '/about' }
]
const secondaryLinks = [
  { label: 'Homepage design experiments', href: '/lab' },
  { label: 'How this site works', href: '/colophon' }
]
</script>

<template>
  <footer class="ft">
    <div class="ft__inner">
      <div class="ft__brand">
        <EdWordmark :size="32" />
        <p class="ft__blurb">
          Lessons, projects, and tools.
        </p>
        <a class="ticket ticket--sm" :href="`mailto:${store.email}`">Start a conversation</a>
      </div>

      <nav class="ft__col" aria-labelledby="ft-sections">
        <h2 id="ft-sections" class="t-mono ft__h">Start here</h2>
        <NuxtLink v-for="link in sectionLinks" :key="link.href" class="ft__link u-underline" :to="link.href">{{ link.label }}</NuxtLink>
      </nav>

      <nav class="ft__col" aria-labelledby="ft-elsewhere">
        <h2 id="ft-elsewhere" class="t-mono ft__h">Links</h2>
        <a v-for="s in store.socialLinks" :key="s.platform" class="ft__link u-underline"
           :href="s.url" :target="s.platform === 'email' ? undefined : '_blank'"
           :rel="s.platform === 'email' ? undefined : 'noopener noreferrer'">{{ s.label }}</a>
        <NuxtLink v-for="link in secondaryLinks" :key="link.href" class="ft__link u-underline" :to="link.href">{{ link.label }}</NuxtLink>
      </nav>

      <div class="ft__col">
        <h2 class="t-mono ft__h">Privacy</h2>
        <p class="ft__fine">
          I use open-source type and original artwork. Read more about how the site is made in
          <NuxtLink to="/colophon" class="u-underline">How this site works</NuxtLink>.
        </p>
        <p class="ft__fine">This site has no database or analytics. Your StoryGen projects stay in your browser.</p>
      </div>
    </div>

    <div class="ft__base">
      <p class="t-mono">© {{ year }} {{ store.name }} · Entertrainer</p>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  border-top: var(--stroke) solid var(--line);
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
.ft__link { display:inline-flex; align-items:center; min-height:28rem; font-size:15.5rem; font-weight:600; }
.ft__fine { font-size: 13.5rem; line-height: 1.6; color: var(--muted); margin: 0; }
.ft__fine code { font-family: var(--font-mono); font-size: 12.5rem; }

.ft__base {
  border-top: var(--stroke) solid var(--line);
  max-width: var(--shell-wide); margin: 0 auto;
  padding: 18rem var(--shell-gutter) calc(18rem + var(--safe-bottom));
  display: flex; flex-wrap: wrap; gap: 10rem 24rem; justify-content: space-between;
  color: var(--muted);
}
.ft__base p { margin: 0; }
</style>
