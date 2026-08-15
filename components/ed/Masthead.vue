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

      <p class="mh__tag">Instructional design, published in the open</p>

      <nav class="mh__nav" aria-label="Sections">
        <NuxtLink v-for="l in NAV" :key="l.href" :to="l.href" class="mh__link"
                  :aria-current="isCurrent(l.href) ? 'page' : undefined">{{ l.label }}</NuxtLink>
      </nav>

      <div class="mh__end">
        <button type="button" class="mh__icon" @click="theme.toggle()"
                :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`">
          <svg v-if="theme.theme === 'dark'" viewBox="0 0 24 24" width="17" height="17" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
          </svg>
        </button>

        <button ref="btn" type="button" class="mh__icon mh__icon--menu" @click="open = !open"
                :aria-expanded="open" aria-controls="mh-sheet"
                :aria-label="open ? 'Close sections' : 'Open sections'">
          <svg v-if="!open" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
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
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.mh {
  position: sticky; top: 0; z-index: var(--z-chrome);
  background: var(--paper);
  border-bottom: var(--stroke) solid var(--ink);
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

/* The compact description the spec asks the masthead row to carry. It is the
   first thing that goes when the bar gets tight — the sections matter more. */
.mh__tag {
  font-family: var(--font-mono);
  font-size: 10.5rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--muted); margin: 0;
  padding-left: clamp(12rem, 1.6vw, 20rem);
  border-left: var(--stroke-hair) solid var(--line);
  /* Two lines, always. Left to wrap freely it made a four-line paragraph out
     of a six-word standfirst and pushed the bar to 90px tall. */
  max-width: 28ch; line-height: 1.4;
}

.mh__nav { margin-left: auto; display: flex; align-items: center; gap: clamp(4rem, 1.2vw, 14rem); }
.mh__link {
  position: relative;
  padding: 8rem 10rem;
  font-size: 15rem; font-weight: 600;
  color: var(--ink);
  border-radius: var(--radius-s);
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .mh__link:hover { background: var(--paper-2); } }
/* Current section gets a printed underline, not just a colour shift. */
.mh__link[aria-current="page"]::after {
  content: ''; position: absolute; left: 10rem; right: 10rem; bottom: 2rem;
  height: 3rem; background: var(--coral); border-radius: 2rem;
}

.mh__end { display: flex; align-items: center; gap: 6rem; margin-left: 4rem; }
.mh__icon {
  width: 40rem; height: 40rem; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  border: var(--stroke-hair) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--paper); color: var(--ink);
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .mh__icon:hover { background: var(--sun); color: var(--on-sun); } }
.mh__icon--menu { display: none; }

.mh__sheet { display: none; }

@media (max-width: 1080px) {
  .mh__tag { display: none; }
}

@media (max-width: 860px) {
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
  .mh__sheet.is-open { grid-template-rows: 1fr; border-top-width: var(--stroke-hair); }
  .mh__sheet-inner { min-height: 0; overflow: hidden; }
  .mh__sheet-link {
    display: flex; align-items: center; justify-content: space-between;
    padding: 15rem var(--shell-gutter);
    font-size: 19rem; font-weight: 600;
    border-bottom: var(--stroke-hair) solid var(--line);
    background: var(--paper);
  }
  .mh__sheet-link[aria-current="page"] { background: var(--paper-2); }
  .mh__sheet-link svg { opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  .mh__sheet { transition-duration: 1ms; }
}
</style>
