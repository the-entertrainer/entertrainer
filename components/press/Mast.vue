<script setup lang="ts">
/**
 * The masthead every Press page opens with — the one piece of chrome that
 * makes five separately-written pages read as one publication. A control-row
 * of butted, hairline-divided cells: mark, dateline, section nav. Nothing
 * floats, nothing is rounded; the whole thing reads as print, not UI.
 *
 * Below 560px the section nav collapses behind a hamburger disclosure —
 * four links wrapping to two cramped rows ate a third of a phone screen
 * before a reader saw anything else.
 */
import { useContentStore } from '~/stores/content'

const props = defineProps<{ section: string }>()
const route = useRoute()
const content = useContentStore()

const NAV = [
  { label: 'About', to: '/about' },
  { label: 'Instructional Design', to: '/instructional-design' },
  { label: 'My Work', to: '/my-work' },
  { label: 'Web Apps', to: '/tools' }
]

const edition = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
void props.section

const open = ref(false)
watch(() => route.path, () => { open.value = false })
</script>

<template>
  <header class="pm">
    <div class="pm__row">
      <NuxtLink to="/" class="pm__mark" aria-label="Entertrainer — home">
        <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 6h28v7H18v10h17v7H18v11h20v7H10z" fill="currentColor" /></svg>
      </NuxtLink>
      <span class="pm__brand">Entertrainer</span>
      <span class="pm__edition">Gurugram Edition &middot; {{ edition }}</span>
      <a :href="`mailto:${content.email}`" class="pm__mail">{{ content.email }}</a>
      <button type="button" class="pm__burger" :class="{ 'is-open': open }" :aria-expanded="open" aria-controls="pm-nav" aria-label="Sections menu" @click="open = !open">
        <span /><span /><span />
      </button>
    </div>
    <nav id="pm-nav" class="pm__nav" :class="{ 'is-open': open }" aria-label="Sections">
      <NuxtLink v-for="n in NAV" :key="n.to" :to="n.to" class="pm__link" :class="{ 'is-current': route.path.startsWith(n.to) }">
        {{ n.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.pm {
  position: relative; z-index: 5;
  font-family: var(--press-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--press-ink);
  border-bottom: 2px solid var(--press-ink);
}
.pm__row {
  display: flex; align-items: stretch;
  border-bottom: 1px solid var(--press-rule);
}
.pm__mark {
  display: grid; place-items: center;
  flex: 0 0 auto; width: var(--press-mast-h);
  padding: 16px; border-right: 1px solid var(--press-rule);
  color: var(--press-ink);
  transition: background 0.2s ease, color 0.2s ease;
}
.pm__mark svg { width: 26px; height: 26px; }
.pm__mark:hover { background: var(--press-ink); color: var(--press-paper); }

.pm__brand {
  display: flex; align-items: center;
  padding: 0 20px; font-weight: 700;
  border-right: 1px solid var(--press-rule);
}
.pm__edition {
  display: flex; align-items: center;
  flex: 1 1 auto; padding: 0 20px;
  color: var(--press-ink-62); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pm__mail {
  display: flex; align-items: center;
  padding: 0 20px; border-left: 1px solid var(--press-rule);
  color: var(--press-ink); font-weight: 500;
  text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px;
}

.pm__nav { display: flex; flex-wrap: wrap; }
.pm__link {
  padding: 12px 20px;
  color: var(--press-ink-62);
  font-weight: 600;
  border-right: 1px solid var(--press-rule);
  transition: background 0.2s ease, color 0.2s ease;
}
.pm__link:last-child { border-right: 0; }
.pm__link:hover { color: var(--press-ink); }
.pm__link.is-current { color: var(--press-paper); background: var(--press-ink); }
.pm__link:focus-visible { outline: 2px solid var(--press-ink); outline-offset: -2px; }

.pm__burger {
  display: none;
  flex: 0 0 auto;
  width: 48px;
  align-items: center; justify-content: center;
  gap: 5px;
  border: 0; border-left: 1px solid var(--press-rule);
  background: none; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.pm__burger span { display: block; width: 18px; height: 2px; background: var(--press-ink); transition: transform 0.2s ease, opacity 0.2s ease; }
.pm__burger.is-open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.pm__burger.is-open span:nth-child(2) { opacity: 0; }
.pm__burger.is-open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
.pm__burger:focus-visible { outline: 2px solid var(--press-ink); outline-offset: -2px; }

@media (max-width: 860px) { .pm__brand, .pm__edition { display: none; } }
@media (max-width: 560px) {
  .pm__mail { display: none; }
  .pm__burger { display: flex; }
  .pm__nav {
    display: none; flex-direction: column; flex-wrap: nowrap;
    position: absolute; top: 100%; left: 0; right: 0; z-index: 20;
    background: var(--press-paper);
    border-bottom: 2px solid var(--press-ink);
    box-shadow: 0 12px 24px rgba(14, 13, 12, 0.14);
  }
  .pm__nav.is-open { display: flex; }
  .pm__link { border-right: 0; border-top: 1px solid var(--press-rule); padding: 15px 20px; }
  .pm__link:first-child { border-top: 0; }
}
</style>
