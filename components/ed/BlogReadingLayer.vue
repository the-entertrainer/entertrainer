<script setup lang="ts">
const route = useRoute()

const sections = ref<{ id: string; label: string; element: HTMLElement }[]>([])
const activeId = ref('')
const progress = ref(0)
const isOpen = ref(false)
const focusMode = ref(false)
const saved = ref(false)
const isArticle = computed(() => route.path.startsWith('/elevate/') && route.path !== '/elevate/')

let observer: IntersectionObserver | null = null
let raf = 0

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function collectSections() {
  observer?.disconnect()
  observer = null
  sections.value = []
  activeId.value = ''
  if (!isArticle.value || !import.meta.client) return

  const prose = document.querySelector<HTMLElement>('.feature__prose, .ca__prose')
  if (!prose) return
  const headings = Array.from(prose.querySelectorAll<HTMLElement>('h2'))
  sections.value = headings.map((element, index) => {
    const id = element.id || `reading-section-${index + 1}-${slugify(element.textContent || '')}`
    element.id = id
    return { id, label: element.textContent?.trim() || `Part ${index + 1}`, element }
  })

  if (!sections.value.length) return
  activeId.value = sections.value[0].id
  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible[0]?.target instanceof HTMLElement) activeId.value = visible[0].target.id
  }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, 1] })
  sections.value.forEach(({ element }) => observer?.observe(element))

  const storageKey = `entertrainer.reading.${route.path}`
  try {
    saved.value = localStorage.getItem(`${storageKey}.saved`) === '1'
  } catch {
    saved.value = false
  }
  updateProgress()
}

function updateProgress() {
  if (!import.meta.client) return
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const root = document.documentElement
    const max = root.scrollHeight - window.innerHeight
    progress.value = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0
  })
}

function scrollToSection(id: string) {
  const target = sections.value.find((section) => section.id === id)?.element
  target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  isOpen.value = false
}

function nextSection() {
  const index = sections.value.findIndex((section) => section.id === activeId.value)
  const next = sections.value[index + 1] || sections.value[0]
  if (next) scrollToSection(next.id)
}

function toggleSaved() {
  saved.value = !saved.value
  try {
    localStorage.setItem(`entertrainer.reading.${route.path}.saved`, saved.value ? '1' : '0')
  } catch {
    /* Private mode or blocked storage: the control still works for this session. */
  }
}

function toggleFocus() {
  focusMode.value = !focusMode.value
  document.documentElement.toggleAttribute('data-reading-focus', focusMode.value)
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  nextTick(collectSections)
})

watch(() => route.path, async () => {
  focusMode.value = false
  document.documentElement.removeAttribute('data-reading-focus')
  await nextTick()
  window.setTimeout(collectSections, 120)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(raf)
  window.removeEventListener('scroll', updateProgress)
  document.documentElement.removeAttribute('data-reading-focus')
})
</script>

<template>
  <div v-if="isArticle && sections.length" class="reading-layer" :class="{ 'reading-layer--open': isOpen }">
    <div class="reading-layer__progress" aria-hidden="true">
      <span :style="{ transform: `scaleX(${progress / 100})` }" />
    </div>

    <div class="reading-layer__rail" aria-label="Reading controls">
      <button
        type="button"
        class="reading-layer__toggle"
        :aria-expanded="isOpen"
        aria-controls="reading-map"
        @click="isOpen = !isOpen"
      >
        <span class="reading-layer__ring" aria-hidden="true"><span :style="{ transform: `rotate(${progress * 3.6}deg)` }" /></span>
        <span class="reading-layer__toggle-label">Read map</span>
        <span class="reading-layer__percent">{{ Math.round(progress) }}%</span>
      </button>

      <div v-if="isOpen" id="reading-map" class="reading-layer__panel">
        <p class="reading-layer__eyebrow">A lighter way through</p>
        <p class="reading-layer__hint">You are here. Jump, pause, or leave a small breadcrumb for later.</p>
        <nav aria-label="Article sections">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            class="reading-layer__section"
            :class="{ 'reading-layer__section--active': section.id === activeId }"
            @click="scrollToSection(section.id)"
          >
            <span class="reading-layer__dot" aria-hidden="true" />
            <span>{{ section.label }}</span>
          </button>
        </nav>
        <div class="reading-layer__actions">
          <button type="button" class="reading-layer__action" @click="nextSection">Next idea <span aria-hidden="true">↓</span></button>
          <button type="button" class="reading-layer__action" :aria-pressed="saved" @click="toggleSaved">
            {{ saved ? 'Spot saved' : 'Save this spot' }} <span aria-hidden="true">{{ saved ? '●' : '○' }}</span>
          </button>
          <button type="button" class="reading-layer__action" :aria-pressed="focusMode" @click="toggleFocus">
            {{ focusMode ? 'Exit focus' : 'Focus reading' }} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reading-layer__progress {
  position: fixed;
  z-index: 80;
  inset: 0 0 auto;
  height: 3px;
  pointer-events: none;
  background: color-mix(in srgb, var(--line) 45%, transparent);
}
.reading-layer__progress span {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: left center;
  background: var(--signal-cobalt);
  transition: transform 180ms linear;
}
.reading-layer__rail { position: fixed; z-index: 81; top: 88rem; right: max(18rem, calc((100vw - var(--shell-wide)) / 2)); width: min(280rem, calc(100vw - 36rem)); }
.reading-layer__toggle, .reading-layer__panel { border: var(--stroke) solid var(--ink); background: color-mix(in srgb, var(--paper) 93%, transparent); box-shadow: 6rem 6rem 0 var(--ink); }
.reading-layer__toggle { display: flex; align-items: center; gap: 9rem; width: 100%; padding: 9rem 11rem; color: var(--ink); cursor: pointer; text-align: left; font: 700 10rem/1.2 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; }
.reading-layer__toggle:hover, .reading-layer__toggle:focus-visible, .reading-layer__action:hover, .reading-layer__action:focus-visible { background: var(--signal-field); }
.reading-layer__ring { display: grid; place-items: center; width: 18rem; height: 18rem; border: 2px solid var(--ink); border-radius: 50%; }
.reading-layer__ring span { width: 5rem; height: 5rem; border-radius: 50%; background: var(--signal-cobalt); transform-origin: 9rem 9rem; }
.reading-layer__percent { margin-left: auto; color: var(--signal-cobalt); }
.reading-layer__panel { margin-top: 8rem; padding: 15rem; }
.reading-layer__eyebrow { margin: 0 0 5rem; color: var(--signal-cobalt); font: 700 10rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.reading-layer__hint { margin: 0 0 13rem; font: 400 14rem/1.35 var(--font-body); }
.reading-layer__section { display: flex; align-items: baseline; gap: 9rem; width: 100%; padding: 7rem 0; color: var(--ink-soft); border: 0; border-top: var(--stroke) solid var(--line); background: none; cursor: pointer; text-align: left; font: 600 12rem/1.25 var(--font-body); }
.reading-layer__section--active { color: var(--ink); }
.reading-layer__dot { flex: 0 0 auto; width: 6rem; height: 6rem; margin-top: 3rem; border: 1px solid currentColor; border-radius: 50%; }
.reading-layer__section--active .reading-layer__dot { background: var(--signal-cobalt); border-color: var(--signal-cobalt); }
.reading-layer__actions { display: grid; gap: 5rem; margin-top: 10rem; padding-top: 10rem; border-top: var(--stroke) solid var(--ink); }
.reading-layer__action { display: flex; justify-content: space-between; width: 100%; padding: 6rem 0; border: 0; background: none; color: var(--ink); cursor: pointer; text-align: left; font: 700 10rem/1.2 var(--font-mono); letter-spacing: .04em; text-transform: uppercase; }
@media (max-width: 1000px) { .reading-layer__rail { top: auto; right: 14rem; bottom: 14rem; width: min(280rem, calc(100vw - 28rem)); } }
@media (max-width: 560px) { .reading-layer__toggle { box-shadow: 4rem 4rem 0 var(--ink); } .reading-layer__panel { max-height: 70vh; overflow: auto; } }
@media (prefers-reduced-motion: reduce) { .reading-layer__progress span { transition: none; } }
html[data-reduce-motion="on"] .reading-layer__progress span { transition: none; }
:global(html[data-reading-focus] .feature__margin-note),
:global(html[data-reading-focus] .ca__margin-note),
:global(html[data-reading-focus] .feature__sources),
:global(html[data-reading-focus] .ca__sources),
:global(html[data-reading-focus] .feature__newsletter-wrap),
:global(html[data-reading-focus] .ca__newsletter-wrap) { opacity: .18; transition: opacity 240ms ease; }
:global(html[data-reading-focus] .feature__prose),
:global(html[data-reading-focus] .ca__prose) { max-width: 720rem; margin-inline: auto; }
@media (prefers-reduced-motion: reduce) {
  :global(html[data-reading-focus] .feature__margin-note),
  :global(html[data-reading-focus] .ca__margin-note),
  :global(html[data-reading-focus] .feature__sources),
  :global(html[data-reading-focus] .ca__sources),
  :global(html[data-reading-focus] .feature__newsletter-wrap),
  :global(html[data-reading-focus] .ca__newsletter-wrap) { transition: none; }
}
</style>
