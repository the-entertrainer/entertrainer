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
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <header class="mh">
    <a class="mh__skip" href="#main">Skip to content</a>

    <div class="mh__bar">
      <NuxtLink to="/" class="mh__brand" aria-label="Entertrainer — home">
        <EdWordmark :size="30" sticker />
      </NuxtLink>

      <nav class="mh__nav" aria-label="Main navigation">
        <NuxtLink v-for="l in NAV" :key="l.href" :to="l.href" class="mh__link"
                  :aria-current="isCurrent(l.href) ? 'page' : undefined">{{ l.label }}</NuxtLink>
      </nav>

      <div class="mh__end">
        <button type="button" class="mh__icon" @click="theme.toggle()"
                :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`">
          <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
        </button>

        <button ref="btn" type="button" class="mh__icon mh__icon--menu" @click="open = !open"
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
.mh__icon svg { transition: transform var(--dur-mid) var(--ease-spring), opacity var(--dur-fast) var(--ease-out); }
.mh__icon--menu[aria-expanded="true"] svg { transform: rotate(90deg) scale(.88); }
.mh__icon--menu { display: none; }

.mh__sheet { display: none; }

@media (max-width: 860px) {
  .mh__bar { min-height: 58rem; padding-top: 8rem; padding-bottom: 8rem; }
  .mh__nav { display: none; }
  .mh__icon--menu { display: inline-flex; }
  .mh__end { margin-left: auto; }

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
