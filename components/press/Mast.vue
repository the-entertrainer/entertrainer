<script setup lang="ts">
/**
 * The masthead every Press page opens with. Used to be a permanent two-row
 * control strip — mark, dateline, email, then a full tab row of section
 * links — visible on every single page, all the time. That's the "headers
 * and tabs everywhere" the redesign was asked to remove: four links you
 * don't need are chrome competing with the one thing you came to read.
 *
 * Now it's one hairline-thin bar — mark, the section you're actually on,
 * a hamburger — at every viewport size, no breakpoint-specific behaviour.
 * Everything the old permanent row carried (brand, dateline, email, the
 * four section links) lives inside the disclosure the hamburger opens.
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

const open = ref(false)
watch(() => route.path, () => { open.value = false })
</script>

<template>
  <header class="pm">
    <div class="pm__row">
      <NuxtLink to="/" class="pm__mark" aria-label="Entertrainer — home">
        <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 6h28v7H18v10h17v7H18v11h20v7H10z" fill="currentColor" /></svg>
      </NuxtLink>
      <span class="pm__section">{{ props.section }}</span>
      <button type="button" class="pm__burger" :class="{ 'is-open': open }" :aria-expanded="open" aria-controls="pm-nav" aria-label="Menu" @click="open = !open">
        <span /><span /><span />
      </button>
    </div>

    <button v-if="open" type="button" class="pm__scrim" aria-label="Close menu" @click="open = false" />

    <nav id="pm-nav" class="pm__nav" :class="{ 'is-open': open }" aria-label="Sections">
      <div class="pm__nav-head">
        <span class="pm__nav-brand">Entertrainer</span>
        <span class="pm__nav-edition">Gurugram Edition &middot; {{ edition }}</span>
        <a :href="`mailto:${content.email}`" class="pm__nav-mail" @click="open = false">{{ content.email }}</a>
      </div>
      <ul class="pm__nav-list">
        <li v-for="n in NAV" :key="n.to">
          <NuxtLink :to="n.to" class="pm__link" :class="{ 'is-current': route.path.startsWith(n.to) }" @click="open = false">
            {{ n.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.pm {
  position: relative; z-index: 30;
  font-family: var(--press-mono);
  font-size: var(--press-label);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--press-ink);
  border-bottom: 2px solid var(--press-rule-strong);
}
.pm__row {
  display: flex; align-items: stretch;
}
.pm__mark {
  display: grid; place-items: center;
  flex: 0 0 auto; width: var(--press-mast-h);
  padding: 16px; border-right: 1px solid var(--press-rule);
  color: var(--press-ink);
  transition: background var(--press-dur) var(--press-ease), color var(--press-dur) var(--press-ease);
}
.pm__mark svg { width: 26px; height: 26px; }
.pm__mark:hover { background: var(--press-ink); color: var(--press-paper); }

.pm__section {
  display: flex; align-items: center;
  flex: 1 1 auto; min-width: 0; padding: 0 20px;
  font-weight: 600; color: var(--press-ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.pm__burger {
  display: flex;
  flex: 0 0 auto; width: var(--press-mast-h);
  align-items: center; justify-content: center;
  gap: 5px;
  border: 0; border-left: 1px solid var(--press-rule);
  background: none; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.pm__burger span { display: block; width: 18px; height: 2px; background: var(--press-ink); transition: transform var(--press-dur) var(--press-ease), opacity var(--press-dur) var(--press-ease); }
.pm__burger.is-open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.pm__burger.is-open span:nth-child(2) { opacity: 0; }
.pm__burger.is-open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
.pm__burger:focus-visible { outline: 2px solid var(--press-ink); outline-offset: -2px; }

/* A click anywhere outside the disclosure closes it — the menu now covers
   real content at every size, not just a cramped mobile drawer, so it needs
   the same dismiss affordance a full overlay gets everywhere else. Ink, not
   black — the only tint this system uses, at just enough opacity to read as
   "the page is behind this," never a drop shadow. */
.pm__scrim {
  position: fixed; inset: 0; z-index: 25;
  border: 0; padding: 0; margin: 0;
  background: rgba(14, 13, 13, 0.32);
  cursor: default;
}

.pm__nav {
  display: none; flex-direction: column;
  position: absolute; top: 100%; left: 0; right: 0; z-index: 30;
  background: var(--press-paper);
  border-bottom: 2px solid var(--press-rule-strong);
  max-height: calc(100dvh - var(--press-mast-h));
  overflow-y: auto;
}
.pm__nav.is-open { display: flex; }

.pm__nav-head {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px 0;
  border-bottom: 1px solid var(--press-rule);
}
.pm__nav-brand, .pm__nav-edition, .pm__nav-mail {
  padding: 14px 20px;
  font-family: var(--press-mono); font-size: var(--press-label); letter-spacing: 0.1em; text-transform: uppercase;
}
.pm__nav-brand { font-weight: 700; border-right: 1px solid var(--press-rule); }
.pm__nav-edition { flex: 1 1 auto; color: var(--press-ink-62); font-weight: 500; }
.pm__nav-mail { color: var(--press-ink); font-weight: 500; border-left: 1px solid var(--press-rule); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }

.pm__nav-list { list-style: none; margin: 0; padding: 0; }
.pm__link {
  display: block;
  padding: 20px clamp(20px, 4vw, 40px);
  border-top: 1px solid var(--press-rule);
  font-family: var(--press-serif); font-weight: 600;
  font-size: var(--press-h3); letter-spacing: -0.01em; text-transform: none;
  color: var(--press-ink-62);
  transition: background var(--press-dur) var(--press-ease), color var(--press-dur) var(--press-ease);
}
.pm__nav-list li:first-child .pm__link { border-top: 0; }
.pm__link:hover { color: var(--press-ink); }
.pm__link.is-current { color: var(--press-paper); background: var(--press-ink); }
.pm__link:focus-visible { outline: 2px solid var(--press-ink); outline-offset: -2px; }

@media (max-width: 560px) {
  .pm__nav-edition { display: none; }
}
</style>
