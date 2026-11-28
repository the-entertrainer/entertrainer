<script setup lang="ts">
/**
 * The phone tab bar: Home and the four sections, thumb-reachable, always
 * there. The sun slides to the current tab. Below 861px only.
 */
const TABS = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/elevate', label: 'Elevate', icon: 'read' },
  { href: '/empower', label: 'Empower', icon: 'make' },
  { href: '/engage', label: 'Engage', icon: 'play' },
  { href: '/about', label: 'About', icon: 'me' }
]
const route = useRoute()
const active = computed(() => {
  const p = route.path
  if (p === '/') return 0
  if (p.startsWith('/elevate') || p.startsWith('/blogs')) return 1
  if (p.startsWith('/empower') || p.startsWith('/tools')) return 2
  if (p.startsWith('/engage') || p.startsWith('/games')) return 3
  if (p.startsWith('/about')) return 4
  return -1
})
function tap(i: number) {
  haptic(i === active.value ? [4, 30, 4] : 8)
  if (i === active.value) window.scrollTo({ top: 0, behavior: motionLevel() === 'off' ? 'auto' : 'smooth' })
}
</script>

<template>
  <nav class="tb" aria-label="Sections">
    <span class="tb__sun" :class="{ off: active < 0 }" :style="{ '--i': Math.max(active, 0) }" aria-hidden="true" />
    <NuxtLink
      v-for="(t, i) in TABS" :key="t.href" :to="t.href" class="tb__tab"
      :aria-current="active === i ? 'page' : undefined" @click="tap(i)"
    >
      <svg viewBox="0 0 24 24" class="tb__ico" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="t.icon === 'home'"><circle cx="12" cy="13" r="4.5" /><path d="M3 20h18M12 3.5v2M4.5 8l1.4 1.4M19.5 8l-1.4 1.4" /></template>
          <template v-else-if="t.icon === 'read'"><path d="M4 5.5c3-1 5.5-.6 8 1.2 2.5-1.8 5-2.2 8-1.2v13c-3-1-5.5-.6-8 1.2-2.5-1.8-5-2.2-8-1.2z" /><path d="M12 6.7v13" /></template>
          <template v-else-if="t.icon === 'make'"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M9 12h6M12 9v6" /></template>
          <template v-else-if="t.icon === 'play'"><rect x="3" y="7" width="18" height="11" rx="5.5" /><path d="M8 10.5v4M6 12.5h4" /><circle cx="15.5" cy="11.5" r=".6" fill="currentColor" /><circle cx="17" cy="13.8" r=".6" fill="currentColor" /></template>
          <template v-else><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1-3.8 4-5.6 7.5-5.6s6.5 1.8 7.5 5.6" /></template>
        </g>
      </svg>
      <span class="tb__label">{{ t.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.tb { display: none; }
@media (max-width: 860px) {
  .tb {
    position: fixed; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    z-index: 8000; display: grid; grid-template-columns: repeat(5, 1fr);
    height: 62px; padding: 0 4px;
    background: color-mix(in srgb, var(--br-ink) 92%, transparent);
    -webkit-backdrop-filter: blur(14px) saturate(1.4); backdrop-filter: blur(14px) saturate(1.4);
    border-radius: 22px; color: var(--br-paper);
    box-shadow: 0 10px 30px -10px rgba(0,0,0,.45);
    view-transition-name: tabbar;
  }
}
.tb__tab {
  position: relative; z-index: 1;
  display: grid; justify-items: center; align-content: center; gap: 3px;
  min-height: 48px; color: color-mix(in srgb, var(--br-paper) 70%, transparent); text-decoration: none;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  transition: color .3s, transform .2s;
}
.tb__tab:active { transform: scale(.92); }
.tb__tab[aria-current="page"] { color: var(--br-ink); }
.tb__ico { width: 24px; height: 24px; transition: transform .45s var(--br-ease); }
.tb__tab[aria-current="page"] .tb__ico { transform: translateY(-1px) scale(1.06); }
.tb__label { font: 600 10.5px/1 var(--font-ui); letter-spacing: .02em; }
.tb__sun {
  position: absolute; top: 6px; bottom: 6px; left: 4px;
  width: calc((100% - 8px) / 5);
  border-radius: 16px; background: var(--br-sun);
  transform: translateX(calc(var(--i) * 100%));
  transition: transform .5s cubic-bezier(.34, 1.4, .5, 1), opacity .3s;
}
.tb__sun.off { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .tb__sun, .tb__ico { transition: none; } }
html[data-reduce-motion="on"] .tb__sun { transition: none; }
html[data-theme="dark"] .tb { background: color-mix(in srgb, #2a2823 92%, transparent); }
</style>
