<script setup lang="ts">
/**
 * The chrome bar: a row of butted boxes divided by hairlines, which is what
 * gives the top of the page its technical-drawing register. Nothing here is
 * floating or rounded — every element is a cell in a rule grid.
 *
 * The console is the one piece of theatre. The reference boots with a teletype
 * readout that talks to you while nothing has loaded yet; it costs almost
 * nothing and it sets the voice before a single real word is read. These lines
 * are Naveen's, not a loading state — the page is already here.
 */
const LINES = [
  'Booting the workbench',
  'Nothing is on fire',
  'Designing learning that sticks'
]

const line = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Pin to the line that actually says something. A cycling readout is
    // decoration; for anyone who asked for less motion it should settle on the
    // sentence worth reading.
    line.value = LINES.length - 1
    return
  }
  timer = setInterval(() => { line.value = (line.value + 1) % LINES.length }, 2600)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <header class="wh">
    <NuxtLink to="/" class="wh__mark" aria-label="Entertrainer — home">
      <span aria-hidden="true">E</span>
    </NuxtLink>

    <p class="wh__console" aria-live="off">
      <Transition name="wh-c" mode="out-in">
        <span :key="line">{{ LINES[line] }}</span>
      </Transition>
      <i class="wh__caret" aria-hidden="true" />
    </p>

    <nav class="wh__nav" aria-label="Sections">
      <a href="#about">About</a>
      <a href="#work">Work</a>
      <a href="#apps">Apps</a>
      <a href="#contact">Contact</a>
    </nav>

    <aside class="wh__status">
      <span class="wh__dot" aria-hidden="true" />
      <span>Designing from Gurugram, IN.</span>
      <a href="#contact">Open to work →</a>
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
  border-bottom: 1px solid var(--w-rule);
  font-family: var(--w-mono);
  font-size: var(--w-chrome);
  letter-spacing: var(--w-track-chrome);
  text-transform: uppercase;
}

.wh__mark {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 76rem;
  border-right: 1px solid var(--w-rule);
  font-family: var(--w-face);
  font-size: 30rem;
  font-weight: 900;
  font-stretch: 112%;
  line-height: 1;
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wh__mark:hover { background: var(--w-accent); color: var(--w-on-accent); }

.wh__console {
  display: flex;
  align-items: center;
  gap: 6rem;
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 0 18rem;
  color: var(--w-ink-55);
  white-space: nowrap;
  overflow: hidden;
}
.wh__caret {
  flex: 0 0 auto;
  width: 6rem;
  height: 12rem;
  background: currentColor;
  animation: wh-blink 1.1s steps(1, end) infinite;
}
@keyframes wh-blink { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }

.wh-c-enter-active, .wh-c-leave-active { transition: opacity 0.18s var(--w-ease), transform 0.28s var(--w-ease); }
.wh-c-enter-from { opacity: 0; transform: translateY(100%); }
.wh-c-leave-to { opacity: 0; transform: translateY(-100%); }

.wh__nav {
  display: flex;
  align-items: stretch;
  flex: 0 0 auto;
  border-left: 1px solid var(--w-rule);
}
.wh__nav a {
  display: grid;
  place-items: center;
  padding: 0 18rem;
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.wh__nav a:hover { background: var(--w-accent); color: var(--w-on-accent); }

.wh__status {
  display: flex;
  align-items: center;
  gap: 10rem;
  flex: 0 0 auto;
  padding: 0 18rem;
  border-left: 1px solid var(--w-rule);
  color: var(--w-ink-55);
  white-space: nowrap;
}
.wh__status a { color: var(--w-ink); }
.wh__status a:hover { text-decoration: underline; text-underline-offset: 3px; }
.wh__dot {
  width: 7rem; height: 7rem; border-radius: 50%;
  background: var(--w-accent);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--w-accent) 70%, transparent);
  animation: wh-pulse 2.4s var(--w-ease-out) infinite;
}
@keyframes wh-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--w-accent) 70%, transparent); }
  70%, 100% { box-shadow: 0 0 0 7rem transparent; }
}

/* The status line is the first thing to go: it is the only cell that is pure
   nicety, and the nav has to survive to the narrowest width. */
@media (max-width: 1080px) { .wh__status { display: none; } }
@media (max-width: 720px) {
  .wh__console { display: none; }
  .wh__mark { width: 54rem; font-size: 22rem; }
  .wh__nav { flex: 1 1 auto; border-left: 0; }
  .wh__nav a { flex: 1 1 0; padding: 16rem 6rem; font-size: 10rem; letter-spacing: 0.08em; }
  .wh__nav a + a { border-left: 1px solid var(--w-rule); }
}

@media (prefers-reduced-motion: reduce) {
  .wh__caret, .wh__dot { animation: none; }
  .wh-c-enter-active, .wh-c-leave-active { transition: opacity 0.15s linear; }
  .wh-c-enter-from, .wh-c-leave-to { transform: none; }
}
</style>
