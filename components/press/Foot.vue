<script setup lang="ts">
/**
 * The close, on every Press page — a four-cell index of the rest of the site,
 * then a byline bar. The mirror of PressMast: same hairlines, same restraint.
 */
import { useContentStore } from '~/stores/content'

const content = useContentStore()
const year = new Date().getFullYear()

const INDEX = [
  { label: 'About', desc: 'The story behind Entertrainer', to: '/about' },
  { label: 'Instructional Design', desc: 'What gets designed when no one’s watching', to: '/instructional-design' },
  { label: 'My Work', desc: 'Proof it wasn’t all talk', to: '/my-work' },
  { label: 'Web Apps', desc: 'The toolkit that powers impactful learning', to: '/tools' }
]
</script>

<template>
  <footer class="pf">
    <nav class="pf__index" aria-label="Elsewhere on the site">
      <NuxtLink v-for="i in INDEX" :key="i.to" :to="i.to" class="press-cell pf__cell">
        <span class="pf__cell-label">{{ i.label }}</span>
        <span class="pf__cell-desc">{{ i.desc }}</span>
        <span class="pf__cell-go" aria-hidden="true">&rarr;</span>
      </NuxtLink>
    </nav>

    <div class="pf__bar">
      <span>{{ content.brand }} &mdash; {{ content.name }}</span>
      <span class="pf__mid">{{ content.tagline }}</span>
      <span class="pf__links">
        <a href="https://www.linkedin.com/in/entertrainer/" target="_blank" rel="noopener">LinkedIn</a>
        <a :href="`mailto:${content.email}`">Email</a>
        <span>&copy; {{ year }}</span>
      </span>
    </div>
  </footer>
</template>

<style scoped>
.pf {
  position: relative; z-index: 1;
  border-top: 2px solid var(--press-rule-strong);
  font-family: var(--press-mono);
  font-size: var(--press-label);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--press-ink);
}

.pf__index { display: grid; grid-template-columns: repeat(4, 1fr); }
/* A flush 4-across grid, so these use `.press-cell` (darken in place) rather
   than `.press-card` (scale up) — scaling a cell whose edges butt against its
   neighbours would tear the grid. The full ink inversion is this component's
   own louder register; timing, press and focus come from the shared class. */
.pf__cell {
  display: flex; flex-direction: column; gap: 8px;
  position: relative;
  padding: 28px 22px 40px;
  border-right: 1px solid var(--press-rule);
}
.pf__index .pf__cell:last-child { border-right: 0; }
@media (hover: hover) {
  .pf__cell:hover { background: var(--press-ink); color: var(--press-paper); }
  .pf__cell:hover .pf__cell-go { transform: translate(3px, -3px); opacity: 1; }
}
.pf__cell-desc { font-family: var(--press-serif); text-transform: none; letter-spacing: 0; font-size: var(--press-small); opacity: 0.72; }
.pf__cell-go { position: absolute; top: 28px; right: 22px; opacity: 0.4; transition: transform var(--press-dur) var(--press-ease), opacity var(--press-dur) var(--press-ease); }

.pf__bar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  padding: 16px var(--press-edge);
  border-top: 1px solid var(--press-rule);
  color: var(--press-ink-62);
}
.pf__mid { text-align: center; }
.pf__links { display: flex; align-items: center; gap: 16px; }
.pf__links a { color: var(--press-ink); }
.pf__links a:hover { text-decoration: underline; text-underline-offset: 3px; }

@media (max-width: 900px) {
  .pf__index { grid-template-columns: repeat(2, 1fr); }
  .pf__index .pf__cell:nth-child(2) { border-right: 0; }
  .pf__index .pf__cell:nth-child(n+3) { border-top: 1px solid var(--press-rule); }
}
@media (max-width: 620px) {
  .pf__index { grid-template-columns: 1fr; }
  .pf__cell { border-right: 0 !important; border-top: 1px solid var(--press-rule); }
  .pf__index .pf__cell:first-child { border-top: 0; }
  .pf__bar { flex-direction: column; align-items: flex-start; gap: 8px; }
  .pf__mid { text-align: left; }
}
</style>
