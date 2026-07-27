<script setup lang="ts">
/**
 * The footer does more work here than in the reference, and it has to.
 *
 * That site is one page with three anchors, so its footer is a centred logo and
 * nothing else. This one is the front door to a Lab, a Downloads library, an
 * Instructional Design practice page and a long-form About — none of which
 * earned a section on the home page, and all of which have to be one click
 * away. So the mark keeps the reference's centred, hairline-topped treatment,
 * and an index sits above it.
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
        <span class="w-mono wf__cell-label">{{ e.label }}</span>
        <span class="w-prose wf__cell-desc">{{ e.desc }}</span>
        <span class="wf__cell-go" aria-hidden="true">→</span>
      </NuxtLink>
    </nav>

    <div class="wf__bar">
      <span class="w-mono wf__name">{{ content.brand }} — {{ content.name }}</span>
      <span class="w-mono wf__mid">{{ content.tagline }}</span>
      <span class="wf__links">
        <a v-for="s in content.socialLinks" :key="s.platform" :href="s.url" class="w-mono"
           :target="s.platform === 'linkedin' ? '_blank' : undefined"
           :rel="s.platform === 'linkedin' ? 'noopener' : undefined">{{ s.label }}</a>
        <span class="w-mono wf__year">© {{ year }}</span>
      </span>
    </div>
  </footer>
</template>

<style scoped>
.wf { position: relative; z-index: 3; border-top: 1px solid var(--w-rule); }

.wf__index {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.wf__cell {
  display: flex;
  flex-direction: column;
  gap: 10rem;
  position: relative;
  padding: clamp(26px, 4vh, 52px) clamp(16px, 2vw, 30px) clamp(34px, 5vh, 66px);
  color: var(--w-ink);
  transition: background 0.4s var(--w-ease), color 0.4s var(--w-ease);
}
.wf__cell + .wf__cell { border-left: 1px solid var(--w-rule); }
@media (hover: hover) {
  .wf__cell:hover { background: var(--w-accent); color: var(--w-on-accent); }
  .wf__cell:hover .wf__cell-desc { color: inherit; opacity: 0.8; }
  .wf__cell:hover .wf__cell-go { transform: translate(4rem, -4rem); opacity: 1; }
}
.wf__cell-label { color: inherit; }
.wf__cell-desc { font-size: 15rem; line-height: 1.4; color: var(--w-ink-55); }
.wf__cell-go {
  position: absolute;
  top: clamp(26px, 4vh, 52px);
  right: clamp(16px, 2vw, 30px);
  opacity: 0.35;
  transition: transform 0.4s var(--w-ease), opacity 0.4s var(--w-ease);
}

.wf__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rem;
  padding: 18rem var(--w-edge);
  border-top: 1px solid var(--w-rule);
  color: var(--w-ink-35);
}
.wf__mid { text-align: center; }
.wf__links { display: flex; align-items: center; gap: 18rem; }
.wf__links a { color: var(--w-ink-55); transition: color 0.3s var(--w-ease); }
.wf__links a:hover { color: var(--w-ink); }

@media (max-width: 900px) {
  .wf__index { grid-template-columns: repeat(2, 1fr); }
  .wf__cell:nth-child(3) { border-left: 0; }
  .wf__cell:nth-child(n + 3) { border-top: 1px solid var(--w-rule); }
}
@media (max-width: 620px) {
  .wf__index { grid-template-columns: 1fr; }
  .wf__cell + .wf__cell { border-left: 0; border-top: 1px solid var(--w-rule); }
  .wf__bar { flex-direction: column; align-items: flex-start; gap: 10rem; }
  .wf__mid { text-align: left; }
}
</style>
