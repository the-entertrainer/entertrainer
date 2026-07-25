<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '15 Calm & Keyboard', robots: 'noindex' })
const C = CONCEPTS[14]

/**
 * Vestibular disorders affect tens of millions of people, and the specific
 * triggers are well documented: parallax, layered elements moving at different
 * speeds, large-area transforms, bounce. This concept simply refuses all of
 * them — there is no non-essential motion anywhere on the page, at any setting.
 *
 * In exchange it invests everything in the other axis: a command palette,
 * complete keyboard control, visible focus, and a skip link. Accessible by
 * default is a credential for an instructional designer, not a checkbox.
 */
const query = ref('')
const paletteOpen = ref(false)
const cursor = ref(0)
const input = ref<HTMLInputElement | null>(null)
const router = useRouter()

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return LAB_NAV
  return LAB_NAV.filter(i => (i.label + ' ' + i.desc).toLowerCase().includes(q))
})

async function openPalette() {
  paletteOpen.value = true; cursor.value = 0
  await nextTick(); input.value?.focus()
}
function closePalette() { paletteOpen.value = false; query.value = '' }
function commit() {
  const r = results.value[cursor.value]
  if (r) { closePalette(); router.push(r.href) }
}
function onKey(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); paletteOpen.value ? closePalette() : openPalette(); return }
  if (!paletteOpen.value) {
    if (e.key === '/') { e.preventDefault(); openPalette() }
    return
  }
  if (e.key === 'Escape') { e.preventDefault(); closePalette() }
  else if (e.key === 'ArrowDown') { e.preventDefault(); cursor.value = (cursor.value + 1) % Math.max(1, results.value.length) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); cursor.value = (cursor.value - 1 + results.value.length) % Math.max(1, results.value.length) }
  else if (e.key === 'Enter') { e.preventDefault(); commit() }
}
onMounted(() => addEventListener('keydown', onKey))
onBeforeUnmount(() => removeEventListener('keydown', onKey))
</script>

<template>
  <LabShell bg="#FBFBF9" ink="#17181A" pop="#1F5EFF" :law="C.law">
    <a href="#main" class="c__skip">Skip to content</a>

    <div class="c">
      <header class="c__head">
        <p class="c__kick">Naveen Jose · Instructional Design</p>
        <h1 class="c__h1">No motion. No surprises.<br>Everything reachable.</h1>
        <p class="c__sub">
          Around seventy million people live with a vestibular disorder, and the triggers are
          well documented — parallax, layered motion, bounce. This page contains none of them,
          at any setting. What it has instead is a keyboard.
        </p>
      </header>

      <main id="main" class="c__main">
        <nav aria-label="Sections">
          <ul class="c__list">
            <li v-for="(it, i) in LAB_NAV" :key="it.href">
              <NuxtLink :to="it.href" class="c__link">
                <span class="c__n">{{ it.n }}</span>
                <span class="c__l">{{ it.label }}</span>
                <span class="c__d">{{ it.desc }}</span>
                <kbd class="c__kbd">{{ i + 1 }}</kbd>
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <button class="c__cmd" @click="openPalette">
          Search everything <kbd>⌘K</kbd> <span aria-hidden="true">or</span> <kbd>/</kbd>
        </button>
      </main>
    </div>

    <!-- Palette: opacity only. No transform, no scale, no slide. -->
    <div v-if="paletteOpen" class="c__scrim" @click="closePalette">
      <div class="c__palette" role="dialog" aria-modal="true" aria-label="Command palette" @click.stop>
        <input ref="input" v-model="query" class="c__input" type="text"
               placeholder="Type to filter, ↑↓ to move, Enter to open, Esc to close"
               :aria-activedescendant="`opt-${cursor}`" role="combobox" aria-expanded="true" aria-controls="opts">
        <ul id="opts" class="c__opts" role="listbox">
          <li v-for="(r, i) in results" :id="`opt-${i}`" :key="r.href" role="option"
              :aria-selected="i === cursor" class="c__opt" :class="{ on: i === cursor }"
              @mouseenter="cursor = i" @click="commit">
            <span class="c__ol">{{ r.label }}</span>
            <span class="c__od">{{ r.desc }}</span>
          </li>
          <li v-if="!results.length" class="c__none">Nothing matches “{{ query }}”.</li>
        </ul>
      </div>
    </div>
  </LabShell>
</template>

<style scoped>
.c__skip { position: fixed; top: -60rem; left: 16rem; z-index: 200; background: var(--pop); color: #fff; padding: 10rem 16rem; border-radius: 0 0 8rem 8rem; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 13rem; }
.c__skip:focus { top: 0; }

.c { position: absolute; inset: 0; overflow-y: auto; padding: 62rem clamp(18rem, 4vw, 56rem) 76rem; display: grid; align-content: center; gap: 30rem; }
.c__head { max-width: 58ch; }
.c__kick { margin: 0 0 12rem; font-size: 10.5rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-45); }
.c__h1 { margin: 0; font-family: 'Fraunces', Georgia, serif; font-weight: 400; font-size: clamp(28rem, 4.6vw, 52rem); line-height: 1.06; letter-spacing: -0.025em; }
.c__sub { margin: 14rem 0 0; font-size: 13.5rem; line-height: 1.65; color: var(--ink-70); }

.c__main { display: grid; gap: 22rem; max-width: 760rem; }
.c__list { list-style: none; margin: 0; padding: 0; display: grid; }
.c__link { display: grid; grid-template-columns: 34rem 1fr auto; grid-template-areas: 'n l k' '. d .'; gap: 2rem 12rem; padding: 15rem 6rem; border-top: 1px solid var(--ink-15); text-decoration: none; color: var(--ink); }
.c__list li:last-child .c__link { border-bottom: 1px solid var(--ink-15); }
.c__link:hover { background: rgba(31,94,255,0.05); }
.c__link:focus-visible { outline: 2px solid var(--pop); outline-offset: -2px; }
.c__n { grid-area: n; font-size: 10.5rem; letter-spacing: 0.1em; color: var(--pop); padding-top: 5rem; }
.c__l { grid-area: l; font-size: 20rem; font-weight: 600; }
.c__d { grid-area: d; font-size: 12rem; color: var(--ink-45); }
.c__kbd, kbd { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 10.5rem; border: 1px solid var(--ink-15); border-radius: 5rem; padding: 2rem 6rem; color: var(--ink-45); }
.c__kbd { grid-area: k; align-self: center; }

.c__cmd { justify-self: start; display: inline-flex; align-items: center; gap: 8rem; font-family: inherit; font-size: 13rem; color: var(--ink); background: #fff; border: 1px solid var(--ink-15); border-radius: 10rem; padding: 12rem 16rem; cursor: pointer; }
.c__cmd:hover { border-color: var(--pop); }
.c__cmd:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }

.c__scrim { position: fixed; inset: 0; z-index: 150; background: rgba(20,22,26,0.42); display: grid; align-items: start; justify-items: center; padding: 12vh 18rem 0; }
.c__palette { width: min(560rem, 100%); background: #fff; border: 1px solid var(--ink-15); border-radius: 14rem; overflow: hidden; box-shadow: 0 30rem 70rem -30rem rgba(0,0,0,0.5); }
.c__input { width: 100%; border: 0; border-bottom: 1px solid var(--ink-15); padding: 17rem 18rem; font-family: inherit; font-size: 14rem; color: var(--ink); }
.c__input:focus { outline: none; }
.c__opts { list-style: none; margin: 0; padding: 6rem; display: grid; gap: 2rem; max-height: 46vh; overflow-y: auto; }
.c__opt { display: grid; gap: 2rem; padding: 11rem 12rem; border-radius: 9rem; cursor: pointer; }
.c__opt.on { background: var(--pop); color: #fff; }
.c__ol { font-size: 15rem; font-weight: 600; }
.c__od { font-size: 11.5rem; opacity: 0.7; }
.c__none { padding: 14rem 12rem; font-size: 13rem; color: var(--ink-45); }

/* Deliberately absent: every transition, transform and animation. */
</style>
