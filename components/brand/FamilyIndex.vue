<script setup lang="ts">
import type { FamilyMember } from '~/content/family'

/**
 * A hub's list of family members: one huge row each. Hover (or focus) lifts
 * the row into the hub colour and slides the longer description in.
 */
const props = defineProps<{ members: FamilyMember[]; tone: 'ink' | 'sun' }>()
const root = ref<HTMLElement | null>(null)
const { run } = useMotion(root)
onMounted(() => {
  void run((m) => {
    m.ScrollTrigger.batch(root.value!.querySelectorAll('.fi__row'), {
      start: 'top 92%', once: true,
      onEnter: (els) => { m.inkReveal(els, { y: 40 * m.d, stagger: 0.1 * m.k }) }
    })
  })
})
const verb = computed(() => props.members[0]?.kind === 'game' ? 'Play' : 'Open')
</script>

<template>
  <ol ref="root" class="fi" :class="`fi--${tone}`">
    <li v-for="(m, i) in members" :key="m.id" class="fi__row">
      <NuxtLink :to="m.href" class="fi__link" :data-cursor="verb">
        <span class="fi__no br-meta">0{{ i + 1 }}</span>
        <BrandMark :id="m.id" :size="88" :tone="tone === 'sun' ? 'ink' : 'sun'" class="fi__mark" />
        <span class="fi__name br-display">{{ m.name }}</span>
        <span class="fi__copy">
          <span class="fi__line">{{ m.line }}</span>
          <span class="fi__dek">{{ m.dek }}</span>
        </span>
        <span class="fi__meta br-meta">{{ m.meta }}<b aria-hidden="true">→</b></span>
      </NuxtLink>
    </li>
  </ol>
</template>

<style scoped>
.fi { list-style: none; padding: 0; margin: 0; border-top: 3px solid var(--ink); }
.fi__row { border-bottom: 1px solid var(--ink); }
.fi__link {
  position: relative; isolation: isolate;
  display: grid; grid-template-columns: 48px auto minmax(0, 1fr) minmax(0, 1.1fr) auto; gap: clamp(16px, 2.4vw, 40px);
  align-items: center; padding: clamp(20px, 3vw, 40px) clamp(8px, 1.4vw, 20px);
  color: var(--ink); text-decoration: none; overflow: hidden;
  transition: color .5s var(--br-ease);
}
.fi__link::before { content: ''; position: absolute; inset: 0; z-index: -1; transform: scaleY(0); transform-origin: 50% 100%; transition: transform .6s var(--br-ease); }
.fi--ink .fi__link::before { background: var(--br-ink); }
.fi--sun .fi__link::before { background: var(--br-sun); }
.fi__link:hover::before, .fi__link:focus-visible::before { transform: scaleY(1); }
.fi--ink .fi__link:hover, .fi--ink .fi__link:focus-visible { color: var(--br-paper); }
.fi__mark { width: clamp(56px, 6vw, 88px); height: auto; transition: transform .7s var(--br-ease); }
.fi__link:hover .fi__mark { transform: rotate(-20deg) scale(1.08); }
.fi__name { font-size: clamp(56px, 8.4vw, 148px); }
.fi__copy { display: grid; gap: 10px; }
.fi__line { font: 400 clamp(19px, 1.7vw, 26px)/1.2 var(--font-display); }
.fi__dek { font-size: 15px; line-height: 1.5; opacity: .75; max-width: 46ch; }
.fi__meta { display: grid; justify-items: end; gap: 14px; white-space: nowrap; }
.fi__meta b { font: 400 40px/1 var(--font-ui); transition: transform .5s var(--br-ease); }
.fi__link:hover .fi__meta b { transform: translateX(8px) rotate(-45deg); }
@media (max-width: 1100px) {
  .fi__link { grid-template-columns: 32px auto 1fr; }
  .fi__copy { grid-column: 2 / -1; }
  .fi__meta { grid-column: 2 / -1; justify-items: start; grid-auto-flow: column; justify-content: space-between; }
}
@media (max-width: 560px) {
  .fi__link { grid-template-columns: auto 1fr; }
  .fi__no { display: none; }
  .fi__copy, .fi__meta { grid-column: 1 / -1; }
}
</style>
