<script setup lang="ts">
import { useContent } from '~/composables/useContent'

const site = useContent()
</script>

<template>
  <div class="app-shell">
    <a href="#main" class="skip-link">Skip to content</a>

    <!-- Lazy, client-only neon depth field behind everything -->
    <ClientOnly>
      <ThreeBackground />
    </ClientOnly>

    <!-- Custom cursor (desktop fine-pointer only; component self-guards) -->
    <ClientOnly>
      <CustomCursor />
    </ClientOnly>

    <header class="topbar">
      <a href="#hero" class="topbar__logo">
        Enter<span class="gradient-text">trainer</span>
      </a>
      <p class="topbar__tag">{{ site.tagline }}</p>
    </header>

    <main id="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100dvh;
  isolation: isolate;
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-h);
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sz-4);
  padding-inline: clamp(var(--sz-4), 5vw, var(--sz-8));
  pointer-events: none;
}

.topbar__logo {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  pointer-events: auto;
}

.topbar__tag {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  max-width: 40ch;
  text-align: right;
}

@media (max-width: 640px) {
  .topbar__tag { display: none; }
}
</style>
