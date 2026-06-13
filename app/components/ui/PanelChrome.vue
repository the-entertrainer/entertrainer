<script setup lang="ts">
defineProps<{
  accent: 'cyan' | 'magenta' | 'violet' | 'yellow' | 'pink' | 'blue'
  tab: string
  index: number
}>()
</script>

<template>
  <div class="chrome glass neon-border" :data-accent="accent">
    <div class="chrome__bar">
      <span class="chrome__dot" />
      <span class="chrome__tab">{{ tab }}</span>
      <span class="chrome__idx">{{ String(index + 1).padStart(2, '0') }}</span>
    </div>
    <div class="chrome__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.chrome {
  --c: var(--neon-cyan);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
}
.chrome[data-accent='cyan'] { --c: var(--neon-cyan); }
.chrome[data-accent='magenta'] { --c: var(--neon-magenta); }
.chrome[data-accent='violet'] { --c: var(--neon-violet); }
.chrome[data-accent='yellow'] { --c: var(--neon-yellow); }
.chrome[data-accent='pink'] { --c: var(--neon-pink); }
.chrome[data-accent='blue'] { --c: var(--neon-blue); }

.chrome:hover {
  box-shadow: 0 0 30px color-mix(in srgb, var(--c) 40%, transparent),
              0 0 70px color-mix(in srgb, var(--c) 14%, transparent);
}

.chrome__bar {
  display: flex;
  align-items: center;
  gap: var(--sz-2);
  padding: var(--sz-3) var(--sz-4);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.chrome__dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 10px var(--c);
}
.chrome__tab {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text);
}
.chrome__idx {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}
.chrome__body {
  flex: 1;
  padding: var(--sz-6);
  overflow: auto;
}
</style>
