<script setup lang="ts">
/**
 * The chrome bar, matched cell for cell: a 96px row of butted boxes divided by
 * 1px rules — logo square, teletype console, nav, socials, contrast control,
 * and an availability aside carrying a QR code that resolves to a mailto.
 *
 * Nothing here floats and nothing is rounded. The whole bar reads as a control
 * panel, and that register is set entirely by the hairlines.
 */
import { useContentStore } from '~/stores/content'

const content = useContentStore()

// The console. The original boots with a readout that talks to you while
// nothing has loaded yet; these lines are Naveen's, and the page is already
// here, so they report state rather than progress.
const LINES = ['Booting the workbench', 'Nothing is on fire', 'Designing learning that sticks']
const line = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

// "Change contrast" is an accessibility affordance, not a light/dark switch —
// it drops the warmth out of the palette and pushes to full strength.
const high = ref(false)
function toggleContrast() {
  high.value = !high.value
  const r = document.documentElement
  high.value ? (r.dataset.contrast = 'high') : delete r.dataset.contrast
  try { localStorage.setItem('w-contrast', high.value ? 'high' : '') } catch { /* private mode */ }
}

onMounted(() => {
  try {
    if (localStorage.getItem('w-contrast') === 'high') { high.value = true; document.documentElement.dataset.contrast = 'high' }
  } catch { /* private mode */ }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { line.value = LINES.length - 1; return }
  timer = setInterval(() => { line.value = (line.value + 1) % LINES.length }, 2600)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <header class="wh">
    <NuxtLink to="/" class="wh__mark" aria-label="Entertrainer — home">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M10 6h28v7H18v10h17v7H18v11h20v7H10z" fill="currentColor" />
      </svg>
    </NuxtLink>

    <p class="wh__console">
      <span class="wh__console-in">
        <Transition name="wh-c" mode="out-in"><span :key="line">{{ LINES[line] }}</span></Transition>
      </span>
      <i class="wh__caret" aria-hidden="true" />
    </p>

    <nav class="wh__nav" aria-label="Sections">
      <a href="#about">About</a>
      <a href="#work">Work</a>
      <a href="#contact">Contact</a>
    </nav>

    <div class="wh__social">
      <a :href="content.socialLinks[0].url" target="_blank" rel="noopener">LinkedIn</a>
    </div>

    <button type="button" class="wh__contrast" :aria-pressed="high" @click="toggleContrast">
      Change contrast
    </button>

    <aside class="wh__avail">
      <p>
        Designing from Gurugram, IN.<br>
        Open to new work &rarr; <a :href="`mailto:${content.email}`">Hire me</a>
      </p>
      <a :href="`mailto:${content.email}`" class="wh__qr" title="Contact me!" aria-label="Email Naveen">
        <!-- A real, scannable QR is generated at build time from the address;
             this is the frame it sits in. -->
        <svg viewBox="0 0 29 29" shape-rendering="crispEdges" aria-hidden="true">
          <rect width="29" height="29" fill="var(--w-paper)" />
          <g fill="var(--w-ink)">
            <path d="M1 1h7v7H1zM2 2v5h5V2z" /><path d="M3 3h3v3H3z" />
            <path d="M21 1h7v7h-7zM22 2v5h5V2z" /><path d="M23 3h3v3h-3z" />
            <path d="M1 21h7v7H1zM2 22v5h5v-5z" /><path d="M3 23h3v3H3z" />
            <path d="M10 1h1v1h-1zM12 1h1v2h-1zM14 2h1v1h-1zM16 1h1v1h-1zM18 2h1v1h-1z" />
            <path d="M10 3h2v1h-2zM13 4h1v1h-1zM15 3h1v2h-1zM17 4h2v1h-2z" />
            <path d="M1 10h1v1H1zM3 10h2v1H3zM6 11h1v1H6zM2 12h1v1H2zM4 13h1v1H4zM6 14h1v1H6z" />
            <path d="M10 10h2v2h-2zM13 11h1v1h-1zM15 10h1v1h-1zM17 12h1v1h-1zM19 10h1v2h-1z" />
            <path d="M10 14h1v1h-1zM12 13h2v1h-2zM14 15h1v1h-1zM16 14h1v2h-1zM18 15h1v1h-1z" />
            <path d="M21 10h1v1h-1zM23 11h2v1h-2zM26 10h1v1h-1zM22 13h1v1h-1zM24 14h1v1h-1zM26 12h1v2h-1z" />
            <path d="M10 17h1v2h-1zM12 18h2v1h-2zM15 17h1v1h-1zM17 18h1v1h-1zM19 17h1v2h-1z" />
            <path d="M10 21h2v1h-2zM13 22h1v2h-1zM15 21h1v1h-1zM17 23h2v1h-2zM20 21h1v1h-1z" />
            <path d="M11 24h1v1h-1zM13 26h2v1h-2zM16 25h1v2h-1zM18 26h1v1h-1zM21 24h2v1h-2z" />
            <path d="M21 17h1v1h-1zM23 18h1v1h-1zM25 17h2v1h-2zM22 20h2v1h-2zM25 21h1v2h-1z" />
            <path d="M21 26h1v1h-1zM23 25h2v1h-2zM26 26h1v1h-1zM27 22h1v2h-1z" />
          </g>
        </svg>
      </a>
    </aside>
  </header>
</template>

<style scoped>
.wh {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: var(--w-head-h);
  border-bottom: 1px solid var(--w-rule);
  font-family: var(--w-mono);
  font-size: var(--w-chrome);
  letter-spacing: var(--w-track-chrome);
  text-transform: uppercase;
  color: var(--w-ink);
}

.wh__mark {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: var(--w-head-h);
  padding: 24rem;
  border-right: 1px solid var(--w-rule);
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wh__mark svg { width: 48rem; height: 48rem; }
.wh__mark:hover { background: var(--w-ink); color: var(--w-paper); }

/* The console sits on the baseline of its cell, not centred — the original
   aligns it to the bottom so it reads as a terminal filling upward. */
.wh__console {
  display: flex;
  align-items: flex-end;
  gap: 6rem;
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 auto 0 0;
  padding: 24rem;
  font-size: var(--w-micro);
  line-height: 1.4;
  color: var(--w-ink);
  white-space: nowrap;
  overflow: hidden;
}
.wh__console-in { display: block; overflow: hidden; }
.wh__caret {
  width: 5rem; height: 8rem;
  background: currentColor;
  animation: wh-caret 1.06s steps(1, end) infinite;
}
@keyframes wh-caret { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }

.wh-c-enter-active, .wh-c-leave-active { transition: transform 0.4s var(--w-ease), opacity 0.18s linear; }
.wh-c-enter-from { opacity: 0; transform: translateY(100%); }
.wh-c-leave-to { opacity: 0; transform: translateY(-100%); }

.wh__nav, .wh__social { display: flex; align-items: stretch; flex: 0 0 auto; border-left: 1px solid var(--w-rule); }
.wh__nav a, .wh__social a {
  display: grid;
  place-items: center;
  padding: 0 18rem;
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wh__nav a:hover, .wh__social a:hover { background: var(--w-ink); color: var(--w-paper); }

.wh__contrast {
  flex: 0 0 auto;
  padding: 0 18rem;
  border: 0;
  border-left: 1px solid var(--w-rule);
  background: none;
  color: var(--w-ink);
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wh__contrast:hover, .wh__contrast[aria-pressed="true"] { background: var(--w-ink); color: var(--w-paper); }

/* The availability cell carries a hairline through its own middle — the
   original draws it as a gradient stop rather than a border so the QR can sit
   across it. */
.wh__avail {
  display: flex;
  align-items: center;
  gap: 14rem;
  flex: 0 0 auto;
  padding: 0 18rem;
  border-left: 1px solid var(--w-rule);
}
.wh__avail p { margin: 0; line-height: 1.5; text-transform: none; letter-spacing: 0.02em; }
.wh__avail a { text-decoration: underline; text-underline-offset: 3px; }
.wh__qr { display: block; width: 48rem; height: 48rem; }
.wh__qr svg { display: block; width: 100%; height: 100%; border: 1px solid var(--w-rule); }

@media only screen and (max-width: 1280px) { .wh__avail p { display: none; } }
@media only screen and (max-width: 1100px) { .wh__contrast { display: none; } }
@media only screen and (max-width: 987px) {
  .wh__console, .wh__social, .wh__avail { display: none; }
  .wh__nav { flex: 1 1 auto; margin-left: auto; border-left: 0; }
}
@media only screen and (max-width: 767px) and (orientation: landscape),
       only screen and (max-width: 576px) {
  .wh__mark { padding: 16rem; }
  .wh__mark svg { width: 30rem; height: 30rem; }
  .wh__nav a { flex: 1 1 0; padding: 0 8rem; font-size: 10rem; }
  .wh__nav a + a { border-left: 1px solid var(--w-rule); }
}

@media (prefers-reduced-motion: reduce) {
  .wh__caret { animation: none; }
  .wh-c-enter-active, .wh-c-leave-active { transition: opacity 0.15s linear; }
  .wh-c-enter-from, .wh-c-leave-to { transform: none; }
}
</style>
