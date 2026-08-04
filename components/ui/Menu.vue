<script setup lang="ts">
import gsap from 'gsap'
import { useMenuStore }       from '~/stores/menu'
import { useContentStore }    from '~/stores/content'
import { useHomeViewStore }   from '~/stores/homeview'
import { useExperienceStore } from '~/stores/experience'

const route           = useRoute()
const router          = useRouter()
const menuStore       = useMenuStore()
const contentStore    = useContentStore()
const homeViewStore   = useHomeViewStore()
const experienceStore = useExperienceStore()
const isOpened        = computed(() => menuStore.isOpened)
// Standalone back button shows when there's somewhere to go back to: any real
// page, or an open sub-section on the home route.
const showBack        = computed(() => route.path !== '/' || !homeViewStore.isHome)

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  gsap.set(itemEls.value.filter(Boolean), reduceMotion ? { opacity: 0 } : { y: -20, x: 20, opacity: 0 })
})

// ── Links ─────────────────────────────────────────────────────
const links = [
  { label: 'home',     to: '/',                                          external: false },
  { label: 'linkedin', to: 'https://www.linkedin.com/in/entertrainer/', external: true  },
  { label: 'contact',  to: `mailto:${contentStore.email}`,              external: true  }
]
const itemEls = ref<HTMLElement[]>([])

watch(isOpened, (open) => {
  const items = itemEls.value.filter(Boolean)
  gsap.killTweensOf(items)
  if (reduceMotion) {
    gsap.to(items, { opacity: open ? 1 : 0, duration: 0.2, delay: open ? 0.2 : 0 })
    return
  }
  if (open) {
    gsap.to(items, {
      y: 0, x: 0, opacity: 1,
      duration: 0.5, delay: 0.18, ease: 'power2.out', stagger: 0.07
    })
  } else {
    gsap.to(items, {
      y: -20, x: 20, opacity: 0,
      duration: 0.2, ease: 'power4.out', stagger: -0.05
    })
  }
})

function setItemEl(el: any, i: number) {
  if (!el) return
  itemEls.value[i] = el.$el ?? el
}

function handleBack() {
  menuStore.close()
  if (route.path === '/') {
    homeViewStore.triggerBack()
  } else {
    router.back()
  }
}

function handleHomeClick() {
  menuStore.close()
  if (route.path === '/') {
    homeViewStore.triggerHome()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpened" class="e-backdrop" @click="menuStore.close()" />

    <!-- Liquid-glass displacement filter (refracts the backdrop with a slow wobble) -->
    <svg class="lg-defs" aria-hidden="true" focusable="false">
      <filter id="liquidGlass" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="2" seed="7" result="noise">
          <animate attributeName="baseFrequency" dur="22s" values="0.009 0.013; 0.013 0.008; 0.009 0.013" repeatCount="indefinite" />
        </feTurbulence>
        <feGaussianBlur in="noise" stdDeviation="1.1" result="sn" />
        <feDisplacementMap in="SourceGraphic" in2="sn" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>

    <!-- Liquid-glass back button (top-left) -->
    <Transition name="back-pop">
      <button v-if="showBack" class="e-back-fab lg-surface" @click="handleBack" aria-label="back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="19" y1="12" x2="6" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
    </Transition>
  </Teleport>

  <div class="e-nav" :class="{ 'panel-open': isOpened }">
    <!-- Panel renders behind the button (DOM order = visual z-order) -->
    <div class="e-panel lg-surface" :class="{ open: isOpened }">
      <div class="e-panel-inner">
        <nav class="e-nav-group">
          <template v-for="(link, i) in links" :key="link.label">
            <a
              v-if="link.external"
              :href="link.to"
              target="_blank"
              rel="noopener noreferrer"
              class="e-item e-link"
              :ref="(el: any) => setItemEl(el, i)"
            ><span class="e-link-dot" /><span class="e-link-label">{{ link.label }}</span></a>
            <NuxtLink
              v-else
              :to="link.to"
              class="e-item e-link"
              :ref="(el: any) => setItemEl(el, i)"
              @click="link.to === '/' ? handleHomeClick() : menuStore.close()"
            ><span class="e-link-dot" /><span class="e-link-label">{{ link.label }}</span></NuxtLink>
          </template>
        </nav>

      </div>
    </div>

    <!-- Menu button — hamburger ↔ close icon -->
    <button
      class="e-btn"
      :class="{ open: isOpened }"
      @click="menuStore.toggle"
      aria-label="menu"
    >
      <span class="ic-wrap hb-wrap">
        <svg class="ic ic-hb" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <line x1="4" y1="7.5" x2="20" y2="7.5" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="16.5" x2="20" y2="16.5" />
        </svg>
        <svg class="ic ic-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
          <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
        </svg>
      </span>
    </button>
  </div>
</template>

<style scoped>
.e-backdrop { position: fixed; inset: 0; z-index: 39; background: transparent; }
.lg-defs { position: absolute; width: 0; height: 0; overflow: hidden; }

/* ── Theme-aware chrome ink ────────────────────────────────────────────────
   This whole component used to be dark-only: a 26%-opacity dark tint carrying
   hardcoded #fff glyphs. On the dark theme that is correct and handsome. On the
   light theme it composited to roughly #BCBBB9 behind white icons — about
   1.4:1, held together entirely by a drop-shadow — and it rendered on every
   tool page, every case study and the light-theme spiral.

   Rather than force one surface to work against both grounds, the glass flips:
   dark glass with light ink at night, light glass with dark ink by day. Both
   sit above 13:1 even over the spiral's most saturated palette roll. */
.e-nav, .e-back-fab, .e-backdrop {
  --chrome-ink: #fff;
  --chrome-ink-dim: rgba(255, 255, 255, 0.7);
  --chrome-tint: rgba(28, 30, 40, 0.26);
  --chrome-tint-strong: rgba(18, 20, 28, 0.42);
  --chrome-tint-hover: rgba(40, 42, 54, 0.34);
  --chrome-edge: rgba(255, 255, 255, 0.22);
  --chrome-shadow: rgba(0, 0, 0, 0.4);
  --chrome-sheen: screen;
}
/* Written out rather than wrapped in :is() — Vue's scoped-CSS transform appends
   the scope attribute to the last compound selector, and it does not survive
   that grouping. */
:root[data-theme="light"] .e-nav,
:root[data-theme="light"] .e-back-fab,
:root[data-theme="light"] .e-backdrop {
  --chrome-ink: #0D0C0A;
  --chrome-ink-dim: rgba(13, 12, 10, 0.66);
  --chrome-tint: rgba(255, 255, 255, 0.58);
  --chrome-tint-strong: rgba(255, 255, 255, 0.72);
  --chrome-tint-hover: rgba(255, 255, 255, 0.74);
  --chrome-edge: rgba(255, 255, 255, 0.85);
  --chrome-shadow: rgba(0, 0, 0, 0.18);
  --chrome-sheen: overlay;
}

/* ── Shared liquid-glass surface ───────────────────────────────────────────── */
.lg-surface {
  background: var(--chrome-tint);
  backdrop-filter: blur(9px) saturate(1.7) brightness(1.06) url(#liquidGlass);
  -webkit-backdrop-filter: blur(11px) saturate(1.7) brightness(1.06);
  border: 1px solid var(--chrome-edge);
  box-shadow:
    0 8rem 26rem -10rem rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.55),
    inset 0 -2px 3px rgba(255, 255, 255, 0.10),
    inset 0 0 22rem rgba(255, 255, 255, 0.06);
}
/* Specular sheen for every glass surface */
.lg-surface::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(133deg,
    rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 20%,
    transparent 44%, transparent 72%, rgba(255,255,255,0.14) 100%);
  mix-blend-mode: var(--chrome-sheen);
  opacity: 0.85;
  z-index: 0;
}

/* ── Standalone back button (top-left) ─────────────────────────────────────── */
.e-back-fab {
  position: fixed;
  top: calc(var(--chrome-offset) + var(--safe-top));
  left: calc(var(--chrome-offset) + var(--safe-left));
  z-index: var(--z-menu);
  width: var(--chrome-size);
  height: var(--chrome-size);
  border-radius: calc(var(--chrome-size) / 2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  color: var(--chrome-ink);
  transition: transform 0.25s var(--ease-spring), background 0.3s ease;
}
.e-back-fab svg { width: 20rem; height: 20rem; position: relative; z-index: 1; filter: drop-shadow(0 1px 2px var(--chrome-shadow)); transition: transform 0.3s var(--ease-spring); }
.e-back-fab:hover { background: var(--chrome-tint-hover); }
.e-back-fab:hover svg { transform: translateX(-3px); }
.e-back-fab:active { transform: scale(0.94); }
.back-pop-enter-active, .back-pop-leave-active { transition: opacity 0.3s ease, transform 0.4s var(--ease-spring); }
.back-pop-enter-from, .back-pop-leave-to { opacity: 0; transform: scale(0.6) translateX(-6px); }

/* ── Wrapper ── */
.e-nav {
  position: fixed;
  top: calc(var(--chrome-offset) + var(--safe-top));
  right: calc(var(--chrome-offset) + var(--safe-right));
  z-index: var(--z-menu);
}

/* ── Menu button ── */
.e-btn {
  position: absolute;
  top: 0; right: 0;
  width: var(--chrome-size); height: var(--chrome-size);
  z-index: 2;
  display: flex; align-items: center; justify-content: center;
  padding: 0; background: none; border: none; cursor: pointer;
  color: var(--chrome-ink);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
}
.hb-wrap { width: 22rem; height: 22rem; }
.ic-hb { opacity: 1; transform: rotate(0deg) scale(1); }
.ic-x  { opacity: 0; transform: rotate(-45deg) scale(0.6); }
.e-btn.open .ic-hb { opacity: 0; transform: rotate(45deg) scale(0.6); }
.e-btn.open .ic-x  { opacity: 1; transform: rotate(0deg) scale(1); }

/* ── Liquid-glass panel ── */
.e-panel {
  position: absolute;
  top: 0; right: 0;
  width: var(--chrome-size); height: var(--chrome-size);
  border-radius: calc(var(--chrome-size) / 2);
  overflow: hidden;
  transition:
    width 0.85s var(--ease-spring),
    height 0.95s var(--ease-spring),
    border-radius 0.85s ease,
    background 0.4s ease;
}
.e-panel.open {
  width: 272rem; height: 232rem;
  border-radius: 28rem;
  background: var(--chrome-tint-strong);
  backdrop-filter: blur(16px) saturate(1.9) brightness(1.04) url(#liquidGlass);
  -webkit-backdrop-filter: blur(18px) saturate(1.9) brightness(1.04);
  box-shadow:
    0 26rem 64rem -20rem rgba(0, 0, 0, 0.6),
    inset 0 1px 1.5px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(255, 255, 255, 0.12),
    inset 0 0 50rem rgba(255, 255, 255, 0.05);
  transition:
    width 0.55s var(--ease-spring),
    height 0.6s var(--ease-spring),
    border-radius 0.5s ease, background 0.35s ease, box-shadow 0.5s ease;
}

/* ── Panel inner ── */
.e-panel-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 56rem 20rem 18rem;
  color: var(--chrome-ink);
  z-index: 1;
}
.e-nav-group { flex: 1; display: flex; flex-direction: column; gap: 2rem; }
.e-panel-inner :focus-visible { outline: 2px solid color-mix(in srgb, var(--chrome-ink) 85%, transparent); outline-offset: 2px; border-radius: 8rem; }

/* ── Link items — glass rows ── */
.e-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12rem;
  padding: 9rem 12rem;
  border-radius: 12rem;
  font-size: 24rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--chrome-ink);
  text-shadow: 0 1px 8px var(--chrome-shadow);
  text-decoration: none;
  transition: background 0.22s ease, padding-left 0.3s var(--ease-spring);
}
.e-link-dot {
  width: 7rem; height: 7rem; border-radius: 50%;
  background: var(--chrome-ink); box-shadow: 0 0 10rem color-mix(in srgb, var(--chrome-ink) 85%, transparent);
  transform: scale(0); opacity: 0;
  transition: transform 0.35s var(--ease-spring), opacity 0.3s ease;
}
.e-link-label { transition: transform 0.3s var(--ease-spring); }
.e-link:hover { background: color-mix(in srgb, var(--chrome-ink) 12%, transparent); }
.e-link:hover .e-link-dot { transform: scale(1); opacity: 1; }


/* ── Stacked icons that cross-fade + rotate between two states ── */
.ic-wrap { position: relative; width: 22rem; height: 22rem; transform-origin: 50% 50%; }
.ic-wrap .ic { position: absolute; inset: 0; transform-origin: 50% 50%; transition: opacity 0.35s ease, transform 0.45s var(--ease-spring); }

@media (max-width: 600px) {
  .e-panel.open {
    width: min(272rem, calc(100vw - var(--safe-left) - var(--safe-right) - var(--chrome-offset) * 2));
  }
}
</style>
