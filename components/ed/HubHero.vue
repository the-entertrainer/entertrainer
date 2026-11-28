<script setup lang="ts">
/**
 * Dawn Press section masthead for the three hubs.
 *
 * A broadsheet section front: a heavy rule, a mono kicker line, the section
 * name in display type at full width, a deck, and an art slot where each hub
 * places its own signature moment (sunrise, workbench, orrery). Visible and
 * complete without JS; `useMotion` only adds the entrance.
 */
const props = withDefaults(defineProps<{
  title: string
  titleId?: string
  no?: string
  kicker?: string
  deck?: string
}>(), { titleId: 'hub-title', no: '', kicker: '', deck: '' })

const root = ref<HTMLElement | null>(null)
const { run } = useMotion(root)
onMounted(() => {
  void run((m) => {
    const tl = m.gsap.timeline()
    tl.add(m.drawRule(root.value!.querySelectorAll('.hub__rule')), 0)
    tl.add(m.inkReveal(root.value!.querySelectorAll('.hub__kicker > *'), { y: 8 * m.d }), 0.1 * m.k)
    const letters = root.value!.querySelectorAll('.hub__title-ch')
    if (!m.late) tl.add(m.gsap.from(letters, { yPercent: 105 * m.d, duration: 0.9 * m.k, ease: 'ink', stagger: 0.035 * m.k, clearProps: 'transform' }), 0.12 * m.k)
    tl.add(m.inkReveal(root.value!.querySelectorAll('.hub__deck, .hub__extra'), { y: 13 * m.d }), 0.45 * m.k)
  })
})
const chars = computed(() => [...props.title])
</script>

<template>
  <section ref="root" class="hub" :aria-labelledby="titleId">
    <span class="hub__rule hub__rule--top dp-rule" aria-hidden="true" />
    <p class="hub__kicker">
      <span v-if="no" class="hub__no">Section {{ no }}</span>
      <span v-if="kicker" class="hub__kick">{{ kicker }}</span>
    </p>
    <div class="hub__body">
      <div class="hub__copy">
        <h1 :id="titleId" class="hub__title" :aria-label="title">
          <span class="hub__title-mask" aria-hidden="true"><span v-for="(c, i) in chars" :key="i" class="hub__title-ch">{{ c }}</span></span>
        </h1>
        <p v-if="deck" class="hub__deck">{{ deck }}</p>
        <div v-if="$slots.default" class="hub__extra"><slot /></div>
      </div>
      <div v-if="$slots.art" class="hub__art" aria-hidden="true"><slot name="art" /></div>
    </div>
    <span class="hub__rule dp-rule" aria-hidden="true" />
  </section>
</template>

<style scoped>
.hub { position: relative; padding-top: var(--space-21); container-type: inline-size; }
.hub__rule--top { border-top-width: 3px; }
.hub__kicker {
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-8) var(--space-21);
  margin: 0; padding: var(--space-8) 0;
  border-bottom: var(--stroke) solid var(--ink);
  font: 500 var(--type-meta)/1.3 var(--font-mono);
  letter-spacing: var(--tracking-meta); text-transform: uppercase;
}
.hub__no { color: var(--ink); }
.hub__kick { color: var(--muted); }
.hub__body {
  position: relative;
  display: grid;
  gap: var(--space-21);
  padding: var(--space-21) 0 var(--space-34);
}
@media (min-width: 900px) {
  .hub__body { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: end; min-height: 340rem; }
}
.hub__copy { position: relative; z-index: 1; min-width: 0; }
.hub__title {
  margin: 0;
  font: 400 min(var(--type-hub), 15cqi)/.82 var(--font-display);
  font-variation-settings: "opsz" 144, "SOFT" 50, "WONK" 1;
  letter-spacing: -.05em;
  color: var(--ink);
  white-space: nowrap;
}
.hub__title-mask { display: inline-block; overflow: hidden; padding: .06em .04em .12em 0; margin-bottom: -.12em; }
.hub__title-ch { display: inline-block; }
.hub__deck {
  max-width: 30ch;
  margin: var(--space-21) 0 0;
  font: 400 clamp(19px, 1.8vw, 24px)/1.4 var(--font-reading);
  color: var(--ink);
}
.hub__extra { margin-top: var(--space-21); }
.hub__art { position: relative; min-width: 0; align-self: stretch; }
@media (max-width: 899px) {
  .hub__art { order: -1; height: 200rem; }
  .hub__title { font-size: clamp(64px, 19vw, 120px); }
}
</style>
