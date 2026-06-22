<script setup lang="ts">
import gsap from 'gsap'
import { useMenuStore }       from '~/stores/menu'
import { useContentStore }    from '~/stores/content'
import { useThemeStore }      from '~/stores/theme'
import { useHomeViewStore }   from '~/stores/homeview'
import { useExperienceStore } from '~/stores/experience'
import SoundEngine from '~/experience/SoundEngine'

const route           = useRoute()
const router          = useRouter()
const menuStore       = useMenuStore()
const contentStore    = useContentStore()
const themeStore      = useThemeStore()
const homeViewStore   = useHomeViewStore()
const experienceStore = useExperienceStore()
const isOpened        = computed(() => menuStore.isOpened)
const showViewToggle  = computed(() => homeViewStore.isHome && experienceStore.hasEntered)

// ── Sound ─────────────────────────────────────────────────────
const MUTE_KEY = 'et-muted'
const muted = ref(true)

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  try {
    const s = localStorage.getItem(MUTE_KEY)
    if (s !== null) muted.value = s === '1'
  } catch {}
  gsap.set(itemEls.value.filter(Boolean), reduceMotion ? { opacity: 0 } : { y: -20, x: 20, opacity: 0 })
})

function toggleSound() {
  const engine = SoundEngine.getInstance() ?? SoundEngine.init()
  const next = !muted.value
  muted.value = next
  engine.setMuted(next)
  try { localStorage.setItem(MUTE_KEY, next ? '1' : '0') } catch {}
}

// ── Links ─────────────────────────────────────────────────────
const links = [
  { label: 'home',     to: '/',                                          external: false },
  { label: 'linkedin', to: 'https://www.linkedin.com/in/entertrainer/', external: true  },
  { label: 'contact',  to: `mailto:${contentStore.email}`,              external: true  }
]
const itemEls = ref<HTMLElement[]>([])

watch(isOpened, (open) => {
  SoundEngine.getInstance()?.onMenuChange(open)
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

function setTheme(dark: boolean) {
  SoundEngine.getInstance()?.onThemeChange(dark)
  themeStore.set(dark ? 'dark' : 'light')
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

        <div class="e-controls">
          <!-- View mode toggle — home page only, after loader completes -->
          <button
            v-if="showViewToggle"
            class="e-item e-view"
            :ref="(el: any) => setItemEl(el, links.length + 1)"
            @click="homeViewStore.toggle(); menuStore.close()"
            :aria-label="homeViewStore.mode === 'spiral' ? 'Switch to list view' : 'Switch to spiral view'"
          >
            <svg v-if="homeViewStore.mode === 'spiral'" class="ev-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <line x1="4" y1="7"  x2="20" y2="7"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
            </svg>
            <svg v-else class="ev-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 12a1 1 0 1 1 2 0 2 2 0 1 1-4 0 3 3 0 1 1 6 0 4 4 0 1 1-8 0"/>
            </svg>
            {{ homeViewStore.mode === 'spiral' ? 'list' : 'spiral' }}
          </button>

          <div class="e-item e-theme" :ref="(el: any) => setItemEl(el, links.length + 2)">
            <button class="et-opt" :class="{ active: themeStore.isDark }"  @click="setTheme(true)">dark</button>
            <button class="et-opt" :class="{ active: !themeStore.isDark }" @click="setTheme(false)">light</button>
          </div>

          <button
            class="e-item e-sound"
            :ref="(el: any) => setItemEl(el, links.length + 3)"
            @click="toggleSound"
          >
            <span class="es-icon" :class="{ muted }">
              <span class="es-bar"></span>
              <span class="es-bar"></span>
              <span class="es-bar"></span>
            </span>
            {{ muted ? 'sound off' : 'sound on' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ET mark button — sits on top of the panel -->
    <button
      class="e-btn"
      :class="{ open: isOpened }"
      @click="menuStore.toggle"
      aria-label="menu"
    >
      <img src="/et-mark.svg" class="et-mark" alt="" aria-hidden="true" />
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

/* ── ET mark button ── */
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
  border-radius: 50%;
}
.et-mark {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  /* Adapt to theme: invert makes the black SVG white on dark bg / dark panel */
  filter: var(--et-mark-filter, none);
  transition: filter 0.3s ease, transform 0.4s var(--ease-spring);
}
/* When panel is open, un-invert so the mark reads correctly on the panel surface */
.panel-open .et-mark {
  filter: var(--et-mark-filter-on-panel, none);
}

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
  width: calc(var(--grid-column) * 4 + var(--grid-gutter) * 3);
  min-width: 340rem;
  /* Panel top is (offset + safe-top); leave a matching (offset + safe-bottom)
     gap below so the panel never runs under a notch or home indicator. */
  height: calc(100dvh - var(--safe-top) - var(--safe-bottom) - var(--chrome-offset) * 2);
  border-radius: 16rem;
  /* Open: fully opaque solid panel */
  background: var(--color-white);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* ── Panel inner ── */
.e-panel-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0;
  padding: 72rem 40rem 48rem;
  color: var(--color-black);
}

/* ── Nav group (back + links) — fills remaining space, centres content ── */
.e-nav-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  font-size: 13rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  opacity: 0.38;
  padding-left: 0;
  margin-bottom: 32rem;
  transition: padding-left 0.4s var(--ease-spring), opacity 0.2s ease;
}
.e-back:hover { opacity: 1; padding-left: 6rem; }

.e-link {
  position: relative;
  display: inline-block;
  width: max-content;
  font-size: 54rem;
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 1.05;
  padding-left: 0;
  transition: padding-left 0.5s var(--ease-spring);
}
.e-link::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  background: var(--color-black);
  transform: translateY(-50%) scale(0);
  opacity: 0;
  transition: transform 0.5s var(--ease-spring), opacity 0.5s var(--ease-spring);
}
.e-link:hover { padding-left: 30rem; }
.e-link:hover::before { transform: translateY(-50%) scale(1); opacity: 1; }

/* ── Controls — anchored to bottom ── */
.e-controls {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-top: 20rem;
  border-top: 1px solid color-mix(in srgb, var(--color-black) 10%, transparent);
}

/* ── View mode toggle ── */
.e-view {
  display: flex;
  align-items: center;
  gap: 10rem;
  font-size: 16rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  padding-left: 0;
  opacity: 0.4;
  margin-bottom: 16rem;
  transition: padding-left 0.5s var(--ease-spring), opacity 0.2s ease;
}
.e-view:hover { opacity: 1; padding-left: 10rem; }
.ev-icon {
  width: 16rem;
  height: 16rem;
  flex-shrink: 0;
}

.e-theme {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 16rem;
}
.et-opt {
  position: relative;
  padding-left: 0;
  font-size: 24rem;
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.2;
  color: var(--color-black);
  background: none;
  border: none;
  font-family: var(--main-font);
  cursor: pointer;
  opacity: 0.25;
  text-align: left;
  transition: padding-left 0.5s var(--ease-spring), opacity 0.35s ease;
}
.et-opt::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  background: var(--color-black);
  transform: translateY(-50%) scale(0);
  transition: transform 0.45s var(--ease-spring);
}
.et-opt.active { opacity: 1; padding-left: 22rem; }
.et-opt.active::before { transform: translateY(-50%) scale(1); }

.e-sound {
  display: flex;
  align-items: center;
  gap: 10rem;
  font-size: 13rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  opacity: 0.4;
  transition: opacity 0.2s ease;
  color: var(--color-black);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--main-font);
  text-align: left;
}
.e-sound:hover { opacity: 1; }

.es-icon {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}
.es-bar {
  width: 3rem;
  height: 12rem;
  border-radius: 2rem;
  background: var(--color-black);
  animation: es-bounce 1s ease-in-out infinite;
}
.es-bar:nth-child(2) { animation-delay: 0.15s; }
.es-bar:nth-child(3) { animation-delay: 0.3s; }
.es-icon.muted .es-bar { animation-play-state: paused; height: 4rem; }
@keyframes es-bounce {
  0%, 100% { height: 6rem; }
  50% { height: 14rem; }
}

@media (max-width: 600px) {
  .e-panel.open {
    width: calc(100vw - var(--safe-left) - var(--safe-right) - var(--chrome-offset) * 2);
    min-width: unset;
  }
  .e-link { font-size: 44rem; }
  .et-opt { font-size: 20rem; }
  .e-panel-inner { padding: 72rem 28rem 44rem; }
}
</style>
