<script setup lang="ts">
import { NAV } from '~/content/editorial'
import { useThemeStore } from '~/stores/theme'

/**
 * The masthead.
 *
 * What replaced the old floating hamburger. That control hid the entire
 * structure of the site behind one 48px circle: every route was one tap away
 * only if you already knew the tap existed, and three of five sections were
 * never named anywhere in the chrome. A publication puts its sections along
 * the top, in words, and lets you see where you are without opening anything.
 *
 * Below 860px the links move into a disclosure — but it is a labelled one,
 * it names the sections when open, and it marks the current page.
 */
const route = useRoute()
const theme = useThemeStore()
const { panelOpen, togglePanel, openPanel } = useSiteSettings()
const {
  featureEnabled: wotdEnabled,
  hasNotification: wotdDot,
  openGame: openWotd,
  refresh: refreshWotd
} = useDailyWord()
const open = ref(false)

const isCurrent = (href: string) =>
  href === '/' ? route.path === '/' : route.path.startsWith(href)

// Closing on navigation is the whole job of a nav sheet; keeping it open
// across a route change is how you end up covering the page you asked for.
watch(() => route.fullPath, () => { open.value = false })

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) { open.value = false; btn.value?.focus() }
}
const btn = ref<HTMLButtonElement | null>(null)
function openSettingsFromSheet() {
  open.value = false
  openPanel()
}

onMounted(() => {
  refreshWotd()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <header class="mh">
    <a class="mh__skip" href="#main">Skip to content</a>

    <div class="mh__bar">
      <NuxtLink to="/" class="mh__brand" aria-label="Entertrainer — home">
        <EdWordmark variant="full" :size="30" />
      </NuxtLink>

      <nav class="mh__nav" aria-label="Main navigation">
        <NuxtLink v-for="l in NAV" :key="l.href" :to="l.href" class="mh__link"
                  :aria-current="isCurrent(l.href) ? 'page' : undefined">{{ l.label }}</NuxtLink>
      </nav>

      <div class="mh__end">
        <button
          v-if="wotdEnabled"
          type="button"
          class="mh__icon mh__icon--wotd u-icon-btn"
          aria-haspopup="dialog"
          :aria-label="wotdDot ? 'WOTD — new for today' : 'WOTD'"
          @click="openWotd()"
        >
          <span class="mh__wotd" aria-hidden="true">
            <span class="mh__wotd-tile mh__wotd-tile--a">W</span>
            <span class="mh__wotd-tile mh__wotd-tile--b">O</span>
            <span class="mh__wotd-tile mh__wotd-tile--c">D</span>
          </span>
          <span v-if="wotdDot" class="mh__dot" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="mh__icon mh__icon--settings u-icon-btn"
          :aria-expanded="panelOpen"
          aria-controls="site-settings-panel"
          aria-haspopup="dialog"
          :aria-label="panelOpen ? 'Close settings' : 'Open settings'"
          @click="togglePanel()"
        >
          <EdSignalIcon name="settings" />
        </button>

        <button type="button" class="mh__icon mh__icon--theme u-icon-btn" @click="theme.toggle()"
                :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`">
          <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
        </button>

        <button ref="btn" type="button" class="mh__icon mh__icon--menu u-icon-btn" @click="open = !open"
                :aria-expanded="open" aria-controls="mh-sheet"
                :aria-label="open ? 'Close menu' : 'Open menu'">
          <EdSignalIcon :name="open ? 'close' : 'menu'" />
        </button>
      </div>
    </div>

    <!-- The links live inside a single wrapper because the sheet animates with
         `grid-template-rows: 0fr → 1fr`, and that trick collapses exactly one
         row: with five children the first link closed and the other four
         stayed open on every phone. -->
    <div id="mh-sheet" class="mh__sheet" :class="{ 'is-open': open }" :inert="!open">
      <div class="mh__sheet-inner">
        <NuxtLink v-for="l in NAV" :key="l.href" :to="l.href" class="mh__sheet-link"
                  :aria-current="isCurrent(l.href) ? 'page' : undefined">
          <span>{{ l.label }}</span>
          <EdSignalIcon name="external" />
        </NuxtLink>
        <button
          v-if="wotdEnabled"
          type="button"
          class="mh__sheet-link mh__sheet-wotd"
          @click="open = false; openWotd()"
        >
          <span>{{ wotdDot ? 'WOTD · new' : 'WOTD' }}</span>
          <EdSignalIcon name="word" />
        </button>
        <button type="button" class="mh__sheet-link mh__sheet-settings" @click="openSettingsFromSheet">
          <span>Settings</span>
          <EdSignalIcon name="settings" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.mh {
  position: sticky; top: 0; z-index: var(--z-chrome);
  background: var(--paper);
  border-bottom: var(--stroke) solid var(--line);
  padding-top: var(--safe-top);
}

.mh__skip {
  position: absolute; left: 12rem; top: 12rem; z-index: 2;
  transform: translateY(-200%);
  background: var(--ink); color: var(--paper);
  padding: 10rem 16rem; border-radius: var(--radius-s);
  font-size: 14rem; font-weight: 700;
}
.mh__skip:focus-visible { transform: none; }

.mh__bar {
  max-width: var(--shell-wide); margin: 0 auto;
  padding: 12rem var(--shell-gutter);
  display: flex; align-items: center; gap: clamp(14rem, 2.5vw, 32rem);
}

.mh__brand { display: inline-flex; flex: none; }
.mh__brand :deep(svg) { transition: transform var(--dur-mid) var(--ease-spring); }
@media (hover: hover) { .mh__brand:hover :deep(svg) { transform: translateY(-1rem); } }

.mh__nav { margin-left: auto; display: flex; align-items: center; gap: clamp(4rem, 1.2vw, 14rem); }
.mh__link {
  position: relative;
  padding: 8rem 10rem;
  font-size: 15rem; font-weight: 600;
  color: var(--ink);
  border-radius: var(--radius-s);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .mh__link:hover { background: var(--signal-field); color: var(--ink); } }
/* The active section receives a short section of the same route line used in
   the Home atlas; it orients without adding a badge or a second label. */
.mh__link[aria-current="page"]::after {
  content: ''; position: absolute; left: 10rem; right: 10rem; bottom: 2rem;
  width: 8rem; right: auto; height: 8rem; background: var(--signal-cobalt); border-radius: 50%;
  transform-origin: left; animation: nav-route 280ms var(--ease-out) both;
}
@keyframes nav-route { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.mh__end { display: flex; align-items: center; gap: 6rem; margin-left: 4rem; }
.mh__icon {
  width: 40rem; height: 40rem; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper); color: var(--ink);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring);
}
@media (hover: hover) { .mh__icon:hover { background: var(--signal-field); color: var(--ink); } }
.mh__icon:active { transform: scale(.94); }
.mh__icon[aria-expanded="true"] { background: var(--accent); color: var(--accent-ink); }
.mh__icon--wotd { position: relative; overflow: hidden; }
.mh__wotd {
  position: relative;
  display: grid;
  width: 22rem;
  height: 18rem;
  place-items: center;
}
.mh__wotd-tile {
  position: absolute;
  display: grid;
  place-items: center;
  width: 11rem;
  height: 12rem;
  border: 1.5rem solid var(--ink);
  border-radius: 2rem;
  background: var(--accent);
  color: var(--accent-ink);
  font: 900 8rem/1 var(--font-mono);
  box-shadow: 1rem 1rem 0 color-mix(in srgb, var(--ink) 25%, transparent);
}
.mh__wotd-tile--a { left: 0; top: 0; animation: mh-wotd-flip 2.2s ease-in-out infinite; }
.mh__wotd-tile--b { left: 5rem; top: 3rem; background: var(--paper); animation: mh-wotd-flip 2.2s ease-in-out .2s infinite; }
.mh__wotd-tile--c { left: 10rem; top: 6rem; animation: mh-wotd-flip 2.2s ease-in-out .4s infinite; }
@keyframes mh-wotd-flip {
  0%, 12% { transform: translateY(0) rotate(0deg); }
  28% { transform: translateY(-4rem) rotate(-12deg); }
  42% { transform: translateY(1rem) rotate(6deg); }
  55%, 100% { transform: translateY(0) rotate(0deg); }
}

/*
 * Idle micro-animations target `.ps-icon` (HTML span), not SVG paths —
 * path/SVG transforms are unreliable on mobile Safari. Motion is visible
 * at phone icon size (~36px), still calm. OS reduce-motion still wins.
 */
.mh__icon :deep(.ps-icon) {
  display: inline-grid;
  place-items: center;
  transform-origin: center center;
  will-change: transform;
}
.mh__icon--settings :deep(.ps-icon) {
  animation: mh-gear-tick 2.4s ease-in-out infinite;
}
.mh__icon--settings[aria-expanded="true"] :deep(.ps-icon) { animation: none; }
@keyframes mh-gear-tick {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(22deg); }
  35% { transform: rotate(-8deg); }
  50% { transform: rotate(16deg); }
  65% { transform: rotate(0deg); }
}

.mh__icon--theme :deep(.ps-icon) {
  animation: mh-theme-rock 2.2s ease-in-out infinite;
}
@keyframes mh-theme-rock {
  0%, 100% { transform: rotate(0deg) scale(1); }
  30% { transform: rotate(-16deg) scale(1.14); }
  60% { transform: rotate(12deg) scale(1.08); }
}

.mh__icon--menu :deep(.ps-icon) {
  animation: mh-menu-pulse 1.8s ease-in-out infinite;
}
.mh__icon--menu[aria-expanded="true"] :deep(.ps-icon) { animation: none; }
@keyframes mh-menu-pulse {
  0%, 100% { transform: scaleY(1); }
  40% { transform: scaleY(0.78); }
  55% { transform: scaleY(1.06); }
  70% { transform: scaleY(1); }
}

/* Stagger the three menu bars when closed (extra readable cue) */
.mh__icon--menu :deep(.ps-icon__bar) {
  transform-box: fill-box;
  transform-origin: center;
}
.mh__icon--menu:not([aria-expanded="true"]) :deep(.ps-icon__bar--1) {
  animation: mh-menu-bar 2.6s ease-in-out infinite;
}
.mh__icon--menu:not([aria-expanded="true"]) :deep(.ps-icon__bar--2) {
  animation: mh-menu-bar 2.6s ease-in-out .12s infinite;
}
.mh__icon--menu:not([aria-expanded="true"]) :deep(.ps-icon__bar--3) {
  animation: mh-menu-bar 2.6s ease-in-out .24s infinite;
}
@keyframes mh-menu-bar {
  0%, 100% { transform: translateX(0); opacity: 1; }
  40% { transform: translateX(2px); opacity: 0.75; }
  55% { transform: translateX(-1px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .mh__wotd-tile,
  .mh__icon :deep(.ps-icon),
  .mh__icon--menu :deep(.ps-icon__bar) { animation: none !important; }
}
/* One :global() per rule — Vue scoped was collapsing multi-selector globals to bare html{} */
:global(html[data-reduce-motion="on"] .mh__wotd-tile) { animation: none !important; }
:global(html[data-reduce-motion="on"] .mh__icon .ps-icon) { animation: none !important; }
:global(html[data-reduce-motion="on"] .mh__icon--menu .ps-icon__bar) { animation: none !important; }

.mh__dot {
  position: absolute; top: 5rem; right: 5rem;
  width: 8rem; height: 8rem; border-radius: 50%;
  background: var(--accent); border: 1.5rem solid var(--ink);
  pointer-events: none;
}
.mh__sheet-wotd { width: 100%; border: 0; cursor: pointer; font: inherit; text-align: left; color: inherit; background: var(--paper); }
.mh__icon :deep(.ps-icon) { transition: opacity var(--dur-fast) var(--ease-out); }
.mh__icon--menu[aria-expanded="true"] :deep(.ps-icon) { transform: rotate(90deg) scale(.88); }
.mh__icon--menu { display: none; }

.mh__sheet { display: none; }
.mh__sheet-settings {
  width: 100%;
  border: 0;
  cursor: pointer;
  font: inherit;
  text-align: left;
  color: inherit;
  background: var(--paper);
}

@media (max-width: 860px) {
  .mh__bar { min-height: 54rem; padding-top: 6rem; padding-bottom: 6rem; gap: 12rem; }
  .mh__brand { min-width: 166rem; }
  .mh__brand :deep(.wm) { gap: 7rem; white-space: nowrap; }
  .mh__brand :deep(.wm__word) { display: inline-block; opacity: 1 !important; transform: none !important; font-size: 26rem; animation: none !important; }
  .mh__brand :deep(.wm__mark) { width: 25rem; height: 25rem; }
  .mh__nav { display: none; }
  .mh__icon--menu { display: inline-flex; }
  .mh__end { margin-left: auto; }
  .mh__icon { width: 36rem; height: 36rem; border-radius: var(--radius-m); }

  .mh__sheet {
    display: grid;
    grid-template-rows: 0fr;
    border-top: 0 solid var(--ink);
    transition: grid-template-rows var(--dur-mid) var(--ease-out);
    overflow: hidden;
  }
  .mh__sheet.is-open { grid-template-rows: 1fr; border-top-width: var(--stroke); }
  .mh__sheet-inner { min-height: 0; overflow: hidden; }
  .mh__sheet-link {
    display: flex; align-items: center; justify-content: space-between;
    padding: 15rem var(--shell-gutter);
    font-size: 19rem; font-weight: 600;
    border-bottom: var(--stroke) solid var(--line);
    background: var(--paper);
  }
  .mh__sheet-link[aria-current="page"] { background: linear-gradient(90deg, color-mix(in srgb, var(--signal-cobalt) 10%, var(--paper)), var(--paper-2)); box-shadow: inset 4rem 0 0 var(--signal-cobalt); }
  .mh__sheet-link svg { opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  .mh__sheet { transition-duration: 1ms; }
  .mh__link[aria-current="page"]::after { animation: none; }
  .mh__brand :deep(svg), .mh__icon, .mh__icon svg { transition: none; }
}
</style>
