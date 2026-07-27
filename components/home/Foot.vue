<script setup lang="ts">
/**
 * The footer does more work here than in the original, and it has to.
 *
 * That site is one page with three anchors, so its footer is a centred mark and
 * nothing else. This one is the front door to a Lab, a Downloads library, an
 * Instructional Design page and a long-form About — none of which earned a
 * section, and all of which have to be one click away. So the centred,
 * hairline-topped mark is kept exactly, and an index sits above it.
 */
import { ELSEWHERE } from '~/utils/homeIndex'
import { useContentStore } from '~/stores/content'

const content = useContentStore()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="wf">
    <nav class="wf__index" aria-label="Elsewhere on the site">
      <NuxtLink v-for="e in ELSEWHERE" :key="e.href" :to="e.href" class="wf__cell">
        <span class="wf__cell-label">{{ e.label }}</span>
        <span class="w-base wf__cell-desc">{{ e.desc }}</span>
        <span class="wf__cell-go" aria-hidden="true">&rarr;</span>
      </NuxtLink>
    </nav>

    <div class="wf__bar">
      <span>{{ content.brand }} — {{ content.name }}</span>
      <span class="wf__mid">{{ content.tagline }}</span>
      <span class="wf__links">
        <a v-for="s in content.socialLinks" :key="s.platform" :href="s.url"
           :target="s.platform === 'linkedin' ? '_blank' : undefined"
           :rel="s.platform === 'linkedin' ? 'noopener' : undefined">{{ s.label }}</a>
        <span>© {{ year }}</span>
      </span>
    </div>

    <NuxtLink to="/" class="wf__mark" aria-label="Entertrainer — home">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M10 6h28v7H18v10h17v7H18v11h20v7H10z" fill="currentColor" />
      </svg>
    </NuxtLink>
  </footer>
</template>

<style scoped>
.wf {
  position: relative;
  z-index: 3;
  border-top: 1px solid var(--w-rule);
  font-family: var(--w-mono);
  font-size: var(--w-chrome);
  letter-spacing: var(--w-track-chrome);
  text-transform: uppercase;
  color: var(--w-ink);
}

.wf__index { display: grid; grid-template-columns: repeat(4, 1fr); }
.wf__cell {
  display: flex;
  flex-direction: column;
  gap: 10rem;
  position: relative;
  padding: 40rem 24rem 52rem;
  color: var(--w-ink);
  transition: background 0.4s var(--w-ease), color 0.4s var(--w-ease);
}
.wf__cell + .wf__cell { border-left: 1px solid var(--w-rule); }
@media (hover: hover) {
  .wf__cell:hover { background: var(--w-red); color: var(--w-paper); }
  .wf__cell:hover .wf__cell-go { transform: translate(4rem, -4rem); opacity: 1; }
}
.wf__cell-desc { text-transform: none; letter-spacing: -0.025em; font-size: 15rem; opacity: 0.72; }
.wf__cell-go {
  position: absolute;
  top: 40rem;
  right: 24rem;
  opacity: 0.4;
  transition: transform 0.4s var(--w-ease), opacity 0.4s var(--w-ease);
}

.wf__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rem;
  padding: 18rem var(--w-edge);
  border-top: 1px solid var(--w-rule);
  color: var(--w-ink-55);
}
.wf__mid { text-align: center; }
.wf__links { display: flex; align-items: center; gap: 18rem; }
.wf__links a { color: var(--w-ink); }
.wf__links a:hover { text-decoration: underline; text-underline-offset: 3px; }

/* Centred, hairline-topped, 48px mark — the original's footer, kept. */
.wf__mark {
  display: grid;
  place-items: center;
  padding: 24rem;
  border-top: 1px solid var(--w-rule);
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wf__mark svg { display: block; width: 48rem; height: 48rem; }
.wf__mark:hover { background: var(--w-ink); color: var(--w-paper); }

@media only screen and (max-width: 900px) {
  .wf__index { grid-template-columns: repeat(2, 1fr); }
  .wf__cell:nth-child(3) { border-left: 0; }
  .wf__cell:nth-child(n + 3) { border-top: 1px solid var(--w-rule); }
}
@media only screen and (max-width: 620px) {
  .wf__index { grid-template-columns: 1fr; }
  .wf__cell + .wf__cell { border-left: 0; border-top: 1px solid var(--w-rule); }
  .wf__bar { flex-direction: column; align-items: flex-start; gap: 10rem; }
  .wf__mid { text-align: left; }
  .wf__mark svg { width: 30rem; height: 30rem; }
}
</style>
