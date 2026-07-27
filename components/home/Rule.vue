<script setup lang="ts">
/**
 * The binary strip that divides every section.
 *
 * Texture masquerading as data — it says nothing, and that is the point: it
 * gives the eye something machined to rest on between two enormous blocks of
 * whitespace, and it costs one line of DOM. Purely decorative, so it is hidden
 * from assistive tech entirely.
 *
 * Seeded rather than `Math.random()` so the pattern is stable across renders
 * and every strip on the page is visibly *different* from its neighbours
 * instead of accidentally identical.
 */
const props = withDefaults(defineProps<{ seed?: number; count?: number }>(), {
  seed: 1, count: 104
})

// A small LCG. Deterministic, and cheap enough to run inline at setup.
const bits = computed(() => {
  let s = (props.seed * 9301 + 49297) % 233280
  return Array.from({ length: props.count }, () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280 > 0.42 ? '1' : '0'
  })
})
</script>

<template>
  <div class="wr" aria-hidden="true">
    <span v-for="(b, i) in bits" :key="i" class="wr__b">{{ b }}</span>
  </div>
</template>

<style scoped>
.wr {
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  width: 100%;
  padding: 8rem var(--w-edge);
  border-block: 1px solid var(--w-rule);
  font-family: var(--w-mono);
  font-size: var(--w-micro);
  line-height: 1.4;
  color: var(--w-ink);
  opacity: 0.55;
  user-select: none;
}
/* The strip must never wrap or scroll — it is a rule, not content. Letting the
   glyphs shrink out of the flow is how it stays one line at every width. */
.wr__b { flex: 0 1 auto; min-width: 0; }
</style>
