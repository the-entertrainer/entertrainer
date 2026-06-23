<script setup lang="ts">
import gsap from 'gsap'
import { useMenuStore }       from '~/stores/menu'
import { useContentStore }    from '~/stores/content'
import { useThemeStore }      from '~/stores/theme'
import { useHomeViewStore }   from '~/stores/homeview'
import { useExperienceStore } from '~/stores/experience'

const route           = useRoute()
const router          = useRouter()
const menuStore       = useMenuStore()
const contentStore    = useContentStore()
const themeStore      = useThemeStore()
const homeViewStore   = useHomeViewStore()
const experienceStore = useExperienceStore()
const isOpened        = computed(() => menuStore.isOpened)
const showViewToggle  = computed(() => homeViewStore.isHome && experienceStore.hasEntered)

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
      duration: 0.5, delay: 0.2, ease: 'power2.out', stagger: 0.08
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

function toggleTheme() {
  themeStore.set(themeStore.isDark ? 'light' : 'dark')
}

function toggleView() {
  homeViewStore.toggle()
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
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpened" class="e-backdrop" @click="menuStore.close()" />
  </Teleport>

  <div class="e-nav" :class="{ 'panel-open': isOpened }">
    <!-- Panel renders behind the button (DOM order = visual z-order) -->
    <div class="e-panel" :class="{ open: isOpened }">
      <div class="e-panel-inner">
        <div class="e-nav-group">
          <button
            class="e-item e-back"
            :ref="(el: any) => setItemEl(el, 0)"
            @click="handleBack"
          >← back</button>

          <template v-for="(link, i) in links" :key="link.label">
            <a
              v-if="link.external"
              :href="link.to"
              target="_blank"
              rel="noopener noreferrer"
              class="e-item e-link"
              :ref="(el: any) => setItemEl(el, i + 1)"
            >{{ link.label }}</a>
            <NuxtLink
              v-else
              :to="link.to"
              class="e-item e-link"
              :ref="(el: any) => setItemEl(el, i + 1)"
              @click="menuStore.close()"
            >{{ link.label }}</NuxtLink>
          </template>
        </div>

        <div class="e-controls" :ref="(el: any) => setItemEl(el, links.length + 1)">
          <!-- Theme toggle — sun ↔ moon morph -->
          <button
            class="e-ctl"
            :class="{ alt: themeStore.isDark }"
            @click="toggleTheme"
            :aria-label="themeStore.isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          >
            <span class="ic-wrap">
              <svg class="ic ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" />
                <line x1="12" y1="1.6" x2="12" y2="3.6" />
                <line x1="12" y1="20.4" x2="12" y2="22.4" />
                <line x1="1.6" y1="12" x2="3.6" y2="12" />
                <line x1="20.4" y1="12" x2="22.4" y2="12" />
                <line x1="4.6" y1="4.6" x2="6" y2="6" />
                <line x1="18" y1="18" x2="19.4" y2="19.4" />
                <line x1="4.6" y1="19.4" x2="6" y2="18" />
                <line x1="18" y1="6" x2="19.4" y2="4.6" />
              </svg>
              <svg class="ic ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </span>
            <span class="e-ctl-label">{{ themeStore.isDark ? 'dark' : 'light' }}</span>
          </button>

          <!-- View mode toggle — list ↔ spiral (home only, after loader) -->
          <button
            v-if="showViewToggle"
            class="e-ctl e-view-ctl"
            :class="{ alt: homeViewStore.mode === 'list' }"
            @click="toggleView"
            :aria-label="homeViewStore.mode === 'spiral' ? 'Switch to list view' : 'Switch to spiral view'"
          >
            <span class="ic-wrap">
              <svg class="ic ic-list" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
              <svg class="ic ic-spiral" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 12a1 1 0 1 1 2 0 2 2 0 1 1-4 0 3 3 0 1 1 6 0 4 4 0 1 1-8 0" />
              </svg>
            </span>
            <span class="e-ctl-label">{{ homeViewStore.mode === 'spiral' ? 'list' : 'spiral' }}</span>
          </button>
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
/* ── Backdrop ── */
.e-backdrop {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: transparent;
}

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
  top: 0;
  right: 0;
  width: var(--chrome-size);
  height: var(--chrome-size);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  transition: color 0.3s ease;
}
.panel-open .e-btn { color: var(--color-black); }

/* ── Hamburger / close icon ── */
.hb-wrap {
  width: 22rem;
  height: 22rem;
}
.ic-hb { opacity: 1; transform: rotate(0deg) scale(1); }
.ic-x  { opacity: 0; transform: rotate(-45deg) scale(0.6); }
.e-btn.open .ic-hb { opacity: 0; transform: rotate(45deg) scale(0.6); }
.e-btn.open .ic-x  { opacity: 1; transform: rotate(0deg) scale(1); }

/* ── Panel ── */
.e-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: var(--chrome-size);
  height: var(--chrome-size);
  border-radius: calc(var(--chrome-size) / 2);
  /* Closed: glass pill — present but unobtrusive over any background */
  background: color-mix(in srgb, var(--color-white) 22%, transparent);
  backdrop-filter: blur(10px) saturate(1.4);
  -webkit-backdrop-filter: blur(10px) saturate(1.4);
  overflow: hidden;
  transition:
    width 0.9s var(--ease-spring),
    height 1s var(--ease-spring),
    border-radius 0.9s ease,
    background 0.4s ease;
}
.e-panel.open {
  /* Compact dropdown card — anchored under the ET button */
  width: 264rem;
  height: 326rem;
  border-radius: 22rem;
  /* Open: fully opaque solid panel */
  background: var(--color-white);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: 0 24rem 60rem -20rem rgba(0, 0, 0, 0.28);
  transition:
    width 0.55s var(--ease-spring),
    height 0.6s var(--ease-spring),
    border-radius 0.5s ease,
    background 0.35s ease,
    box-shadow 0.5s ease;
}

/* ── Panel inner ── */
.e-panel-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0;
  padding: 58rem 26rem 22rem;
  color: var(--color-black);
}

/* ── Nav group (back + links) — fills space so controls sit at the bottom ── */
.e-nav-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.e-panel-inner :focus-visible { outline-color: var(--color-black); }

/* ── Items ── */
.e-item {
  text-align: left;
  background: none;
  border: none;
  font-family: var(--main-font);
  color: var(--color-black);
  cursor: pointer;
}

.e-back {
  font-size: 12rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  opacity: 0.38;
  padding-left: 0;
  margin-bottom: 14rem;
  transition: padding-left 0.4s var(--ease-spring), opacity 0.2s ease;
}
.e-back:hover { opacity: 1; padding-left: 6rem; }

.e-link {
  position: relative;
  display: inline-block;
  width: max-content;
  font-size: 28rem;
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.32;
  padding-left: 0;
  transition: padding-left 0.5s var(--ease-spring);
}
.e-link::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: var(--color-black);
  transform: translateY(-50%) scale(0);
  opacity: 0;
  transition: transform 0.5s var(--ease-spring), opacity 0.5s var(--ease-spring);
}
.e-link:hover { padding-left: 20rem; }
.e-link:hover::before { transform: translateY(-50%) scale(1); opacity: 1; }

/* ── Controls — compact icon toggle row ── */
.e-controls {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 10rem;
  margin-top: 18rem;
  padding-top: 16rem;
  border-top: 1px solid color-mix(in srgb, var(--color-black) 10%, transparent);
}

.e-ctl {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7rem;
  padding: 12rem 6rem 10rem;
  border: 1px solid color-mix(in srgb, var(--color-black) 12%, transparent);
  border-radius: 13rem;
  background: color-mix(in srgb, var(--color-black) 3%, transparent);
  color: var(--color-black);
  font-family: var(--main-font);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s var(--ease-spring);
}
.e-ctl:hover { background: color-mix(in srgb, var(--color-black) 7%, transparent); }
.e-ctl:active { transform: scale(0.96); }

.e-ctl .ic {
  width: 22rem;
  height: 22rem;
  display: block;
}
.e-ctl-label {
  font-size: 11rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: lowercase;
  opacity: 0.55;
}

/* ── Stacked icons that cross-fade + rotate between two states ── */
.ic-wrap {
  position: relative;
  width: 22rem;
  height: 22rem;
  transform-origin: 50% 50%;
}
.ic-wrap .ic {
  position: absolute;
  inset: 0;
  transform-origin: 50% 50%;
  transition: opacity 0.35s ease, transform 0.45s var(--ease-spring);
}

/* Theme: sun (light) ↔ moon (dark, .alt) */
.ic-sun  { opacity: 1; transform: rotate(0deg) scale(1); }
.ic-moon { opacity: 0; transform: rotate(80deg) scale(0.6); }
.e-ctl.alt .ic-sun  { opacity: 0; transform: rotate(-80deg) scale(0.6); }
.e-ctl.alt .ic-moon { opacity: 1; transform: rotate(0deg) scale(1); }

/* View: list (spiral mode) ↔ spiral (list mode, .alt) */
.ic-list   { opacity: 1; transform: rotate(0deg); }
.ic-spiral { opacity: 0; transform: rotate(90deg); }
.e-view-ctl.alt .ic-list   { opacity: 0; transform: rotate(-90deg); }
.e-view-ctl.alt .ic-spiral { opacity: 1; transform: rotate(0deg); }

@media (max-width: 600px) {
  .e-panel.open {
    width: min(264rem, calc(100vw - var(--safe-left) - var(--safe-right) - var(--chrome-offset) * 2));
  }
}
</style>
