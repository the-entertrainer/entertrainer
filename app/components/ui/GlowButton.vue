<script setup lang="ts">
withDefaults(defineProps<{
  as?: 'button' | 'a'
  href?: string
  variant?: 'solid' | 'ghost'
}>(), {
  as: 'button',
  variant: 'solid',
})
</script>

<template>
  <component
    :is="as"
    :href="href"
    class="glow-btn"
    :class="`glow-btn--${variant}`"
    data-hover
  >
    <span class="glow-btn__label"><slot /></span>
  </component>
</template>

<style scoped>
.glow-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sz-2);
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  transition: transform 0.2s var(--ease-spring), box-shadow 0.25s;
}
.glow-btn:hover { transform: translateY(-2px); }

.glow-btn--solid {
  background: var(--grad-cool);
  color: #02030a;
  box-shadow: var(--glow-cyan);
}
.glow-btn--solid:hover { box-shadow: 0 0 30px rgba(0, 240, 255, 0.7); }

.glow-btn--ghost {
  border: 1.5px solid var(--border);
  color: var(--text);
  background: rgba(255, 255, 255, 0.02);
}
.glow-btn--ghost:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}
</style>
