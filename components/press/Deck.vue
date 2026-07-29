<script setup lang="ts">
import type { NavItem } from '~/types/nav'

/**
 * A section front — the masthead's headline block plus a grid of article
 * cards. The Press equivalent of UiCardGrid, built separately because
 * UiCardGrid is still load-bearing for /tools/index.vue and touching it would
 * reskin the tools' own directory page along with it.
 */
const props = defineProps<{
  eyebrow?: string
  title: string
  deck?: string
  intro?: string
  items: NavItem[]
  meta?: string
  empty?: string
}>()

const R = useReveal()

const count = computed(() =>
  props.meta ?? (props.items.length
    ? `${String(props.items.length).padStart(2, '0')} ${props.items.length === 1 ? 'story' : 'stories'}`
    : undefined))

const pad = (i: number) => String(i + 1).padStart(2, '0')
</script>

<template>
  <div class="pd">
    <PressHead :eyebrow="eyebrow" :title="title" :deck="deck" :intro="intro" :meta="count" />

    <ol v-if="items.length" class="pd__grid">
      <li v-for="(item, i) in items" :key="item.id" v-motion :initial="R.riseIn(i, 90).initial" :visible-once="R.riseIn(i, 90).visibleOnce">
        <NuxtLink :to="item.href" class="pd__card">
          <PressHalftone v-if="item.img" :src="item.img" :alt="item.label" ratio="16/10" class="pd__art" />
          <div class="pd__body">
            <span class="press-label pd__n">&numero;{{ pad(i) }}</span>
            <h2 class="pd__title">{{ item.label }}</h2>
            <p class="pd__desc">{{ item.description }}</p>
            <span class="pd__foot">
              <span v-if="item.meta" class="pd__tag">{{ item.meta }}</span>
              <span class="pd__go">Read &rarr;</span>
            </span>
          </div>
        </NuxtLink>
      </li>
    </ol>
    <p v-else class="pd__empty">{{ empty || 'More is on the way. Check back soon.' }}</p>

    <slot />
  </div>
</template>

<style scoped>
.pd { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: clamp(40px, 6vw, 72px) var(--press-edge) clamp(60px, 8vw, 100px); }

.pd__grid { list-style: none; margin: clamp(36px, 5vw, 56px) 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1px; background: var(--press-rule); border: 1px solid var(--press-rule); }

.pd__card { display: flex; flex-direction: column; height: 100%; background: var(--press-paper); color: var(--press-ink); text-decoration: none; }
.pd__art { width: 100%; border-bottom: 1px solid var(--press-rule); }
.pd__body { display: flex; flex-direction: column; gap: 8px; padding: 22px 22px 24px; flex: 1 1 auto; }
.pd__n { color: var(--press-ink-42); }
.pd__title { margin: 2px 0 0; font-family: var(--press-sans); font-weight: 800; font-size: 22px; line-height: 1.05; letter-spacing: -0.01em; }
.pd__desc { margin: 2px 0 0; font-family: var(--press-serif); font-size: 15px; line-height: 1.5; color: var(--press-ink-80); flex: 1 1 auto; }
.pd__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--press-rule); }
.pd__tag { font-family: var(--press-mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--press-ink-62); }
.pd__go { font-family: var(--press-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; transition: transform 0.2s ease; }
@media (hover: hover) { .pd__card:hover .pd__go { transform: translateX(3px); } }
.pd__card:focus-visible { outline: 2px solid var(--press-ink); outline-offset: -2px; }

.pd__empty { margin-top: 40px; font-family: var(--press-serif); font-size: var(--press-body); color: var(--press-ink-62); }
</style>
