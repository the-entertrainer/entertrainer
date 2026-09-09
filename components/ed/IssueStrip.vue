<script setup lang="ts">
/**
 * Quiet date stamp for pages that want a "when" without inventing an issue number.
 */
defineProps<{ note?: string }>()

const stamp = ref('')
onMounted(() => {
  stamp.value = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="strip">
    <span class="t-mono strip__edition">
      <span class="strip__dot" aria-hidden="true" />
      <template v-if="stamp">{{ stamp }}</template>
    </span>
    <p v-if="note" class="strip__note t-hand">{{ note }}</p>
    <slot />
  </div>
</template>

<style scoped>
.strip {
  display: flex; align-items: center; flex-wrap: wrap; gap: 10rem 18rem;
  padding: 10rem 0;
  border-bottom: var(--stroke) solid var(--line);
}
.strip__edition { display: inline-flex; align-items: center; gap: 8rem; color: var(--muted); }
.strip__dot {
  width: 8rem; height: 8rem; border-radius: 50%;
  background: var(--red); border: 1px solid var(--ink); flex: none;
}
.strip__note { margin: 0; font-size: 16rem; color: var(--ink); }
</style>
