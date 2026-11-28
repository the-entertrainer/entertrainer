<script setup lang="ts">
/**
 * The Index: a command palette for the whole publication.
 * Ctrl/Cmd+K anywhere (except the studios that own that shortcut), or "/"
 * on chrome pages when no field has focus. Accessible combobox: the input
 * owns focus, arrow keys move aria-activedescendant, Enter opens, Escape
 * closes and returns focus to whatever opened it.
 */
import { siteIndex, scoreEntry, type IndexEntry } from '~/content/site-index'

const open = useState<boolean>('dp-index-open', () => false)
const route = useRoute()
const router = useRouter()
const query = ref('')
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)
const listEl = ref<HTMLElement | null>(null)
let opener: HTMLElement | null = null

const all = siteIndex()
const results = computed<IndexEntry[]>(() => {
  const q = query.value
  if (!q.trim()) return all.filter(e => e.kind !== 'Essay').concat(all.filter(e => e.kind === 'Essay').slice(0, 4))
  return all
    .map(e => ({ e, s: scoreEntry(e, q) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map(x => x.e)
})

watch(results, () => { active.value = 0 })

/** Routes whose own tools use Ctrl/Cmd+K or "/". */
const ownsShortcut = computed(() =>
  route.path.startsWith('/tools/storygen') || route.path.startsWith('/dialogue') || route.path.startsWith('/compose'))
const isBare = computed(() => /^\/(lab\/|glass-lab|my-work\/(strong|sewa)|courses\/|instructional-design|engage\/(stack|read-my-mind|astroclock|whatto))/.test(route.path))

function isTyping(el: Element | null) {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable
}

async function show() {
  opener = document.activeElement as HTMLElement | null
  query.value = ''
  open.value = true
  playPress('tap')
  await nextTick()
  input.value?.focus()
}
function hide(restore = true) {
  open.value = false
  if (restore) opener?.focus?.()
  opener = null
}

function onGlobalKey(e: KeyboardEvent) {
  if (open.value) return
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey) && !e.altKey) {
    if (ownsShortcut.value) return
    e.preventDefault()
    void show()
  } else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isBare.value && !ownsShortcut.value && !isTyping(document.activeElement)) {
    e.preventDefault()
    void show()
  }
}

function onInputKey(e: KeyboardEvent) {
  const n = results.value.length
  if (e.key === 'ArrowDown') { e.preventDefault(); if (n) active.value = (active.value + 1) % n; scrollActive() }
  else if (e.key === 'ArrowUp') { e.preventDefault(); if (n) active.value = (active.value - 1 + n) % n; scrollActive() }
  else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); active.value = 0; scrollActive() }
  else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); active.value = Math.max(0, n - 1); scrollActive() }
  else if (e.key === 'Enter') { e.preventDefault(); const r = results.value[active.value]; if (r) go(r) }
  else if (e.key === 'Escape') { e.preventDefault(); hide() }
  else if (e.key === 'Tab') { e.preventDefault() }
}

function scrollActive() {
  nextTick(() => listEl.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }))
}

function go(entry: IndexEntry) {
  hide(false)
  playPress('page')
  if (entry.href.startsWith('/dialogue')) window.location.assign(entry.href)
  else void router.push(entry.href)
}

watch(() => route.fullPath, () => { if (open.value) hide(false) })

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKey))

const optId = (e: IndexEntry) => `dp-index-opt-${e.id}`
</script>

<template>
  <Teleport to="body">
    <Transition name="dp-index">
      <div v-if="open" class="dpx" role="presentation" @click.self="hide()">
        <div class="dpx__panel" role="dialog" aria-modal="true" aria-labelledby="dpx-title">
          <h2 id="dpx-title" class="dp-sr">Search Entertrainer</h2>
          <div class="dpx__field">
            <EdSignalIcon name="search" />
            <input
              ref="input"
              v-model="query"
              class="dpx__input"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls="dpx-list"
              :aria-activedescendant="results[active] ? optId(results[active]) : undefined"
              placeholder="Search essays, tools, games, courses"
              autocomplete="off"
              spellcheck="false"
              @keydown="onInputKey"
            >
            <kbd class="dpx__esc">Esc</kbd>
          </div>
          <ul id="dpx-list" ref="listEl" class="dpx__list" role="listbox" aria-label="Results">
            <li
              v-for="(r, i) in results"
              :id="optId(r)"
              :key="r.id"
              role="option"
              class="dpx__opt"
              :aria-selected="i === active"
              @mousemove="active = i"
              @click="go(r)"
            >
              <span class="dpx__kind">{{ r.kind }}</span>
              <span class="dpx__text">
                <strong class="dpx__title">{{ r.title }}</strong>
                <span class="dpx__hint">{{ r.hint }}</span>
              </span>
              <span class="dpx__go" aria-hidden="true">Open</span>
            </li>
          </ul>
          <p v-if="!results.length" class="dpx__empty" role="status">
            Nothing matches “{{ query }}”. Try a topic like <em>moon</em>, <em>quiz</em> or <em>game</em>.
          </p>
          <p class="dpx__foot" aria-hidden="true">
            <span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Ctrl</kbd><kbd>K</kbd> or <kbd>/</kbd> anywhere</span>
          </p>
          <p class="dp-sr" role="status" aria-live="polite">{{ results.length }} results</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dpx {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-overlay) + 30);
  display: grid;
  justify-items: center;
  align-items: start;
  padding: max(10vh, 56rem) var(--space-13) var(--space-21);
  background: color-mix(in srgb, var(--ink) 34%, transparent);
}
.dpx__panel {
  width: min(640rem, 100%);
  max-height: min(560rem, 78dvh);
  display: flex;
  flex-direction: column;
  background: var(--paper);
  color: var(--ink);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  box-shadow: 8rem 8rem 0 var(--accent), 8rem 8rem 0 1px var(--ink), var(--shadow-overlay);
  overflow: hidden;
}
.dpx__field {
  display: flex;
  align-items: center;
  gap: var(--space-13);
  padding: var(--space-13) var(--space-21);
  border-bottom: var(--stroke) solid var(--ink);
}
.dpx__field :deep(.ps-icon) { width: 22rem; height: 22rem; flex: none; }
.dpx__input {
  flex: 1;
  min-width: 0;
  min-height: 44rem;
  border: 0;
  background: transparent;
  color: var(--ink);
  font: 500 22px/1.2 var(--font-display);
  letter-spacing: -.01em;
}
.dpx__input::placeholder { color: var(--muted); }
.dpx__input:focus-visible { outline: none; box-shadow: none; }
.dpx__esc, .dpx__foot kbd {
  font: 500 var(--type-meta)/1 var(--font-mono);
  padding: 4rem 6rem;
  border: var(--stroke) solid var(--line-strong);
  border-radius: 3rem;
  color: var(--muted);
  background: var(--paper-2);
}
.dpx__list { list-style: none; margin: 0; padding: var(--space-8); overflow-y: auto; }
.dpx__opt {
  display: grid;
  grid-template-columns: 72rem minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-13);
  min-height: 52rem;
  padding: var(--space-8) var(--space-13);
  border-radius: var(--radius-s);
  cursor: pointer;
}
.dpx__opt[aria-selected="true"] { background: var(--accent); color: var(--accent-ink); }
.dpx__kind {
  justify-self: start;
  font: 500 10px/1 var(--font-mono);
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: 4rem 6rem;
  border: var(--stroke) solid currentColor;
  border-radius: 3rem;
}
.dpx__text { display: grid; gap: 2rem; min-width: 0; }
.dpx__title { font: 500 17px/1.2 var(--font-display); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dpx__hint { font-size: 13px; line-height: 1.3; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dpx__opt[aria-selected="true"] .dpx__hint { color: color-mix(in srgb, var(--accent-ink) 80%, transparent); }
.dpx__go { font: 500 var(--type-meta)/1 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; opacity: 0; }
.dpx__opt[aria-selected="true"] .dpx__go { opacity: 1; }
.dpx__empty { margin: 0; padding: var(--space-21); color: var(--muted); }
.dpx__foot {
  display: flex; flex-wrap: wrap; gap: var(--space-8) var(--space-21);
  margin: 0; padding: var(--space-8) var(--space-21);
  border-top: var(--stroke) solid var(--line);
  font: 500 var(--type-meta)/1.6 var(--font-mono); color: var(--muted);
}
.dpx__foot kbd { padding: 2rem 5rem; margin-right: 3rem; }
@media (max-width: 560px) {
  .dpx { padding-top: var(--space-21); }
  .dpx__opt { grid-template-columns: minmax(0, 1fr); gap: 4rem; }
  .dpx__go { display: none; }
  .dpx__foot { display: none; }
}

.dp-index-enter-active { transition: opacity 180ms var(--ease-out); }
.dp-index-enter-active .dpx__panel { transition: transform 320ms var(--ease-stamp), opacity 180ms var(--ease-out); }
.dp-index-leave-active { transition: opacity 120ms var(--ease-exit); }
.dp-index-enter-from { opacity: 0; }
.dp-index-enter-from .dpx__panel { transform: translateY(-8rem) scale(.98); opacity: 0; }
.dp-index-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .dp-index-enter-active, .dp-index-enter-active .dpx__panel, .dp-index-leave-active { transition: opacity 100ms linear; }
  .dp-index-enter-from .dpx__panel { transform: none; }
}
html[data-reduce-motion="on"] .dp-index-enter-from .dpx__panel { transform: none; }
</style>
