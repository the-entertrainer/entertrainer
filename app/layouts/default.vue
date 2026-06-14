<script setup lang="ts">
import { useContent } from '~/composables/useContent'

const site = useContent()
</script>

<template>
  <div class="app-shell">
    <a href="#main" class="skip-link">Skip to content</a>

    <!-- Custom cursor (desktop only) -->
    <ClientOnly>
      <CustomCursor />
    </ClientOnly>

    <header class="topbar">
      <a href="/" class="topbar__logo" aria-label="Entertrainer — home">
        Enter<span class="logo-accent">trainer</span>
      </a>
      <p class="topbar__tag" aria-hidden="true">{{ site.tagline }}</p>
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
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f0f0f0;
  pointer-events: auto;
}

.logo-accent {
  color: #555;
}

.topbar__tag {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #282828;
  max-width: 40ch;
  text-align: right;
}

@media (max-width: 640px) {
  .topbar__tag { display: none; }
}
</style>
