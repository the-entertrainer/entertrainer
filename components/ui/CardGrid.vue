<script setup lang="ts">
import type { NavItem } from '~/types/nav'

/**
 * A section landing page: masthead plus the deck of what's inside.
 * Used by /tools and /my-work so those routes are real, crawlable
 * destinations rather than redirects back into the spiral.
 *
 * This used to render a numbered index — full-width rows on hairlines. Rows
 * read well, but they are still a list you scroll, and the brief was to
 * carry the home spiral's actual *interaction* everywhere, not just its
 * palette. So the entries now live in a UiSpatialDeck: the same drag,
 * momentum and spring-detent as the tower, with the front card the one
 * that's readable and everything else a receding preview you swipe through
 * to reach. The name is kept because several routes still import it.
 */
const props = defineProps<{
  eyebrow?: string
  title: string
  deck?: string
  intro?: string
  items: NavItem[]
  /** Overrides the auto "N projects" counter in the masthead. */
  meta?: string
  empty?: string
}>()

const count = computed(() =>
  props.meta ?? (props.items.length
    ? `${String(props.items.length).padStart(2, '0')} ${props.items.length === 1 ? 'entry' : 'entries'}`
    : undefined))

const pad = (i: number) => String(i + 1).padStart(2, '0')
</script>

<template>
  <div class="cg-page">
    <UiGlassBackdrop calm />

    <div class="cg-inner">
      <UiPageHead :eyebrow="eyebrow" :title="title" :deck="deck" :intro="intro" :meta="count" />

      <UiSpatialDeck v-if="items.length" :items="items" :aria-label="title">
        <template #default="{ item, index, active }">
          <NuxtLink :to="item.href" class="gd-card" :tabindex="active ? 0 : -1">
            <span class="gd-card__art" v-if="item.img">
              <UiCard3D :src="item.img" :alt="`Preview of ${item.label}`" ratio="fill" :strength="10" radius="0" />
            </span>
            <span class="gd-card__body">
              <span class="t-mono gd-card__n">{{ pad(index) }}</span>
              <span class="t-display gd-card__title">{{ item.label }}</span>
              <span class="gd-card__desc">{{ item.description }}</span>
              <span class="gd-card__go" aria-hidden="true">
                Open
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
            </span>
          </NuxtLink>
        </template>
      </UiSpatialDeck>
      <p v-else class="cg-empty">{{ empty || 'More is on the way. Check back soon.' }}</p>

      <slot />
    </div>
  </div>
</template>

<style scoped>
.cg-page { position: fixed; inset: 0; overflow-y: auto; z-index: 1; }
.cg-inner {
  max-width: 1180rem;
  margin: 0 auto;
  padding: calc(var(--page-top) + 20rem) clamp(20rem, 5vw, 60rem) calc(90rem + var(--safe-bottom));
}
@media (max-width: 640px) {
  .cg-inner { padding: calc(var(--page-top)) 18rem calc(60rem + var(--safe-bottom)); }
}

.cg-empty { font-size: var(--text-body); opacity: 0.55; }

/* ── The card itself ──────────────────────────────────────────────────────
   Full-bleed artwork on top, the glass surface's own blur and rim underneath
   the text — one lit object, not a photo with a caption stapled beneath it. */
.gd-card {
  display: flex; flex-direction: column;
  width: 100%; height: 100%;
  border-radius: 20rem;
  overflow: hidden;
  text-decoration: none; color: var(--color-text);
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px) saturate(1.3) brightness(1.08);
  -webkit-backdrop-filter: blur(20px) saturate(1.3) brightness(1.08);
  box-shadow: inset 0 1px 0 var(--glow-rim), inset 0 0 0 1px var(--color-glass-border);
}
.gd-card__art { display: block; flex: 1 1 auto; min-height: 0; }
.gd-card__art :deep(.c3) { height: 100%; }
.gd-card__art :deep(.c3__plate) { border-radius: 0; box-shadow: none; height: 100%; }
.gd-card__art :deep(.c3__img) { height: 100%; }

.gd-card__body { display: flex; flex-direction: column; gap: 5rem; padding: 20rem 22rem 22rem; flex-shrink: 0; }
.gd-card__n { opacity: 0.4; }
.gd-card__title { font-size: var(--text-h2); line-height: 1; }
.gd-card__desc {
  font-size: var(--text-sm); line-height: 1.5; opacity: 0.6; margin-top: 2rem;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.gd-card__go {
  display: inline-flex; align-items: center; gap: 6rem; margin-top: 10rem;
  font-family: var(--display-font); font-weight: 700; font-size: 12.5rem;
  letter-spacing: 0.02em; opacity: 0.85;
}
</style>
