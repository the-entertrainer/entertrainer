<script setup lang="ts">
import { FAMILY, type FamilyMember } from '~/content/family'

const props = defineProps<{ id: string }>()
const me = computed(() => FAMILY.find((m) => m.id === props.id) as FamilyMember)
const kin = computed(() => FAMILY.filter((m) => m.kind === me.value.kind && m.id !== props.id))
const hub = computed(() => me.value.kind === 'app' ? { label: 'Empower', href: '/empower' } : { label: 'Engage', href: '/engage' })

useSeoMeta({
  title: () => `${me.value.name} · Entertrainer`,
  description: () => me.value.dek,
  ogTitle: () => `${me.value.name} · Entertrainer`,
  ogDescription: () => me.value.line
})

const root = ref<HTMLElement | null>(null)
const { run } = useMotion(root)
onMounted(() => {
  void run((m) => {
    if (m.late) return
    m.gsap.from('.as__rise > *', { yPercent: 105 * m.d, duration: 1 * m.k, ease: 'ink', clearProps: 'transform' })
    m.gsap.from('.as__sun', { scale: 0.2, rotate: -90 * m.d, duration: 1.2 * m.k, ease: 'sun', clearProps: 'transform' })
  })
})
</script>

<template>
  <div ref="root" class="as" :class="`as--${me.kind}`">
    <header class="as__head">
      <div class="as__top br-meta">
        <NuxtLink :to="hub.href" class="as__back">← {{ hub.label }}</NuxtLink>
        <span>Entertrainer {{ me.kind === 'app' ? 'app' : 'game' }} · {{ me.meta }}</span>
      </div>
      <div class="as__title">
        <BrandMark :id="me.id" :size="112" class="as__sun" />
        <h1 class="br-display as__name"><span class="br-mask as__rise"><span>{{ me.name }}</span></span></h1>
      </div>
      <p class="as__line">{{ me.line }}</p>
      <ol class="as__steps br-meta">
        <li v-for="(s, i) in me.steps" :key="s"><b>0{{ i + 1 }}</b> {{ s }}</li>
      </ol>
    </header>

    <section class="as__body" :aria-label="me.name">
      <slot />
    </section>

    <aside class="as__kin" aria-labelledby="as-kin">
      <h2 id="as-kin" class="br-meta">More from the family</h2>
      <NuxtLink v-for="k in kin" :key="k.id" :to="k.href" class="as__kin-row" :data-cursor="k.kind === 'game' ? 'Play' : 'Open'">
        <BrandMark :id="k.id" :size="44" />
        <span class="as__kin-name br-display">{{ k.name }}</span>
        <span class="as__kin-line">{{ k.line }}</span>
        <span aria-hidden="true" class="as__kin-arrow">→</span>
      </NuxtLink>
    </aside>
  </div>
</template>

<style scoped>
.as { padding: var(--space-34) var(--hub-gutter) var(--space-55); max-width: 1440px; margin: 0 auto; }
.as__top { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--gray-500); border-top: 3px solid var(--ink); padding-top: 10px; }
.as__back { color: var(--ink); text-decoration: none; }
.as__back:hover { text-decoration: underline; }
.as__title { display: flex; align-items: flex-end; gap: clamp(16px, 3vw, 40px); margin-top: clamp(28px, 5vw, 64px); }
.as__sun { width: clamp(64px, 9vw, 128px); height: auto; }
.as__name { font-size: var(--br-giant); margin: 0; }
.as__line { font: 400 clamp(20px, 2.2vw, 30px)/1.25 var(--font-display); max-width: 30ch; margin: 24px 0 0; }
.as__steps { list-style: none; padding: 0; margin: 28px 0 0; display: flex; flex-wrap: wrap; gap: 8px 28px; color: var(--ink); }
.as__steps b { color: var(--br-sun-deep); font-weight: 600; margin-right: 4px; }
.as__body { margin-top: clamp(32px, 5vw, 64px); }
.as__kin { margin-top: clamp(48px, 8vw, 120px); border-top: 1px solid var(--ink); padding-top: 14px; }
.as__kin h2 { margin: 0 0 8px; color: var(--gray-500); }
.as__kin-row { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: 20px; padding: 18px 0; border-bottom: 1px solid var(--line); color: var(--ink); text-decoration: none; }
.as__kin-name { font-size: clamp(36px, 5vw, 72px); }
.as__kin-line { color: var(--gray-500); max-width: 40ch; }
.as__kin-arrow { font-size: 28px; transition: transform .4s var(--br-ease); }
.as__kin-row:hover .as__kin-arrow { transform: translateX(8px); }
@media (max-width: 640px) {
  .as__kin-row { grid-template-columns: auto 1fr auto; }
  .as__kin-line { grid-column: 2 / 4; grid-row: 2; }
}
</style>
