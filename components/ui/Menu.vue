<script setup lang="ts">
import gsap from 'gsap'
import { useMenuStore }     from '~/stores/menu'
import { useContentStore }  from '~/stores/content'
import { useThemeStore }    from '~/stores/theme'
import { useHomeViewStore } from '~/stores/homeview'
import SoundEngine from '~/experience/SoundEngine'

const route         = useRoute()
const router        = useRouter()
const menuStore     = useMenuStore()
const contentStore  = useContentStore()
const themeStore    = useThemeStore()
const homeViewStore = useHomeViewStore()
const isOpened      = computed(() => menuStore.isOpened)

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
  gsap.set(itemEls.value, reduceMotion ? { opacity: 0 } : { y: -20, x: 20, opacity: 0 })
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
  gsap.killTweensOf(itemEls.value)
  if (reduceMotion) {
    gsap.to(itemEls.value, { opacity: open ? 1 : 0, duration: 0.2, delay: open ? 0.2 : 0 })
    return
  }
  if (open) {
    gsap.to(itemEls.value, {
      y: 0, x: 0, opacity: 1,
      duration: 0.5, delay: 0.2, ease: 'power2.out', stagger: 0.08
    })
  } else {
    gsap.to(itemEls.value, {
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

  <div class="e-nav">
    <!-- Panel renders behind the button (DOM order = visual z-order) -->
    <div class="e-panel" :class="{ open: isOpened }">
      <div class="e-panel-inner">
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

        <div class="e-item e-theme" :ref="(el: any) => setItemEl(el, links.length + 1)">
          <button class="et-opt" :class="{ active: themeStore.isDark }"  @click="setTheme(true)">dark</button>
          <button class="et-opt" :class="{ active: !themeStore.isDark }" @click="setTheme(false)">light</button>
        </div>

        <button
          class="e-item e-sound"
          :ref="(el: any) => setItemEl(el, links.length + 2)"
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

    <!-- E button — sits on top of the panel -->
    <button
      class="e-btn"
      :class="{ open: isOpened }"
      @click="menuStore.toggle"
      aria-label="menu"
    >
      <span class="e-bar e-bar-t"></span>
      <span class="e-bar e-bar-m"></span>
      <span class="e-bar e-bar-b"></span>
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
  left: calc(var(--chrome-offset) + var(--safe-left));
  z-index: var(--z-menu);
}

/* ── E button ── */
.e-btn {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--chrome-size);
  height: var(--chrome-size);
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 6rem;
  padding: 0 13rem;
  background: none;
  border: none;
  cursor: pointer;
}
.e-bar {
  display: block;
  height: 2.5rem;
  border-radius: 1.5rem;
  /* Dark bar on the white pill — contrasts in both themes (--color-black is
     the flipped alias, so it's always the pill's foreground). */
  background: var(--color-black);
  transition: transform 0.4s var(--ease-spring), width 0.3s ease, opacity 0.2s ease;
}
.e-bar-t { width: 22rem; }
.e-bar-m { width: 14rem; }
.e-bar-b { width: 22rem; }

/* Open → X */
.e-btn.open .e-bar-t { transform: translateY(8.5rem) rotate(45deg); }
.e-btn.open .e-bar-m { opacity: 0; transform: scaleX(0); }
.e-btn.open .e-bar-b { transform: translateY(-8.5rem) rotate(-45deg); }

/* ── Panel ── */
.e-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--chrome-size);
  height: var(--chrome-size);
  border-radius: calc(var(--chrome-size) / 2);
  background: var(--color-white);
  overflow: hidden;
  transition:
    width 0.9s var(--ease-spring),
    height 1s var(--ease-spring),
    border-radius 0.9s ease;
}
.e-panel.open {
  width: calc(var(--grid-column) * 4 + var(--grid-gutter) * 3);
  min-width: 340rem;
  height: calc(100dvh - var(--chrome-offset) * 2);
  border-radius: 16rem;
}

/* ── Panel inner ── */
.e-panel-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4rem;
  padding: 72rem 40rem 52rem;
  color: var(--color-black);
}
/* Panel sits on the white pill — the global cream focus ring would vanish,
   so keyboard focus inside the panel uses the dark foreground instead. */
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
  font-size: 17rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  opacity: 0.4;
  padding-left: 0;
  margin-bottom: 10rem;
  transition: padding-left 0.4s var(--ease-spring), opacity 0.2s ease;
}
.e-back:hover { opacity: 1; padding-left: 8rem; }

.e-link {
  position: relative;
  display: inline-block;
  width: max-content;
  font-size: 80rem;
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 100%;
  padding-left: 0;
  transition: padding-left 0.5s var(--ease-spring);
}
.e-link::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 16rem;
  height: 16rem;
  border-radius: 50%;
  background: var(--color-black);
  transform: translateY(-50%) scale(0);
  opacity: 0;
  transition: transform 0.5s var(--ease-spring), opacity 0.5s var(--ease-spring);
}
.e-link:hover { padding-left: 40rem; }
.e-link:hover::before { transform: translateY(-50%) scale(1); opacity: 1; }

.e-theme {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 10rem;
}
.et-opt {
  position: relative;
  padding-left: 0;
  font-size: 40rem;
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 100%;
  color: var(--color-black);
  background: none;
  border: none;
  font-family: var(--main-font);
  cursor: pointer;
  opacity: 0.28;
  text-align: left;
  transition: padding-left 0.5s var(--ease-spring), opacity 0.35s ease;
}
.et-opt::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 14rem;
  height: 14rem;
  border-radius: 50%;
  background: var(--color-black);
  transform: translateY(-50%) scale(0);
  transition: transform 0.45s var(--ease-spring);
}
.et-opt.active { opacity: 1; padding-left: 28rem; }
.et-opt.active::before { transform: translateY(-50%) scale(1); }

.e-sound {
  display: flex;
  align-items: center;
  gap: 12rem;
  font-size: 17rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  opacity: 0.5;
  margin-top: 14rem;
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
    width: calc(100vw - 36rem);
    min-width: unset;
  }
  .e-link { font-size: 58rem; }
  .et-opt { font-size: 30rem; }
  .e-panel-inner { padding: 72rem 28rem 52rem; }
}
</style>
