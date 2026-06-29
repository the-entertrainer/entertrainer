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
const showViewToggle  = computed(() => homeViewStore.isHome && experienceStore.hasEntered)
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

function setView(mode: 'spiral' | 'list') {
  homeViewStore.setMode(mode)
  menuStore.close()
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

        <div v-if="showViewToggle" class="e-controls" :ref="(el: any) => setItemEl(el, links.length)">
          <span class="e-controls-label">View</span>
          <!-- Liquid-glass segmented toggle: spiral ↔ list -->
          <div class="e-seg" role="group" aria-label="View mode">
            <button class="e-seg-btn" :class="{ on: homeViewStore.mode === 'spiral' }" @click="setView('spiral')">
              <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 12a1 1 0 1 1 2 0 2 2 0 1 1-4 0 3 3 0 1 1 6 0 4 4 0 1 1-8 0" />
              </svg>
              <span>Spiral</span>
            </button>
            <button class="e-seg-btn" :class="{ on: homeViewStore.mode === 'list' }" @click="setView('list')">
              <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
              <span>List</span>
            </button>
          </div>
        </div>
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

/* ── Shared liquid-glass surface ───────────────────────────────────────────── */
.lg-surface {
  background: rgba(28, 30, 40, 0.26);
  backdrop-filter: blur(9px) saturate(1.7) brightness(1.06) url(#liquidGlass);
  -webkit-backdrop-filter: blur(11px) saturate(1.7) brightness(1.06);
  border: 1px solid rgba(255, 255, 255, 0.22);
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
  mix-blend-mode: screen;
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
  color: #fff;
  transition: transform 0.25s var(--ease-spring), background 0.3s ease;
}
.e-back-fab svg { width: 20rem; height: 20rem; position: relative; z-index: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4)); transition: transform 0.3s var(--ease-spring); }
.e-back-fab:hover { background: rgba(40, 42, 54, 0.34); }
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
  color: #fff;
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
  background: rgba(18, 20, 28, 0.42);
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
  color: #fff;
  z-index: 1;
}
.e-nav-group { flex: 1; display: flex; flex-direction: column; gap: 2rem; }
.e-panel-inner :focus-visible { outline: 2px solid rgba(255, 255, 255, 0.85); outline-offset: 2px; border-radius: 8rem; }

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
  color: #fff;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
  text-decoration: none;
  transition: background 0.22s ease, padding-left 0.3s var(--ease-spring);
}
.e-link-dot {
  width: 7rem; height: 7rem; border-radius: 50%;
  background: #fff; box-shadow: 0 0 10rem rgba(255,255,255,0.85);
  transform: scale(0); opacity: 0;
  transition: transform 0.35s var(--ease-spring), opacity 0.3s ease;
}
.e-link-label { transition: transform 0.3s var(--ease-spring); }
.e-link:hover { background: rgba(255, 255, 255, 0.12); }
.e-link:hover .e-link-dot { transform: scale(1); opacity: 1; }

/* ── View toggle — visible segmented glass control ── */
.e-controls {
  margin-top: 14rem;
  padding-top: 14rem;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
}
.e-controls-label {
  display: block;
  font-size: 10rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
  margin: 0 4rem 8rem;
}
.e-seg {
  display: flex;
  gap: 4rem;
  padding: 4rem;
  border-radius: 14rem;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}
.e-seg-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7rem;
  padding: 9rem 6rem;
  border: none;
  border-radius: 10rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--main-font);
  font-size: 13rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
}
.e-seg-btn .ic { width: 17rem; height: 17rem; }
.e-seg-btn:hover { color: #fff; }
.e-seg-btn.on {
  color: #fff;
  background: rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.5),
    0 2rem 8rem -2rem rgba(0, 0, 0, 0.4);
}

/* ── Stacked icons that cross-fade + rotate between two states ── */
.ic-wrap { position: relative; width: 22rem; height: 22rem; transform-origin: 50% 50%; }
.ic-wrap .ic { position: absolute; inset: 0; transform-origin: 50% 50%; transition: opacity 0.35s ease, transform 0.45s var(--ease-spring); }

@media (max-width: 600px) {
  .e-panel.open {
    width: min(272rem, calc(100vw - var(--safe-left) - var(--safe-right) - var(--chrome-offset) * 2));
  }
}
</style>
