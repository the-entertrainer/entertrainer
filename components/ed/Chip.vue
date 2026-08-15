<script setup lang="ts">
import { categoryMeta, type Category, type Media } from '~/content/editorial'

/**
 * A category label. Always a word plus a colour, never a colour alone — the
 * page has to survive being read by someone who cannot tell coral from orange,
 * and by anyone whose images or CSS did not arrive.
 */
const props = withDefaults(defineProps<{
  category: Category
  media?: Media
  /** `solid` fills with the accent; `outline` keeps paper and dots the accent. */
  tone?: 'solid' | 'outline'
  /**
   * Which halves to print. On a section index the category is already the
   * page's own title, so repeating it on every card ("WEB APPS / WEB APP")
   * is noise — those cards ask for `media` and keep the accent dot, which is
   * what was carrying the category anyway.
   */
  show?: 'both' | 'category' | 'media'
}>(), { tone: 'outline', show: 'both' })

const meta = computed(() => categoryMeta(props.category))
const showCategory = computed(() => props.show !== 'media' || !props.media)
const showMedia = computed(() => !!props.media && props.show !== 'category')
</script>

<template>
  <span class="cat" :class="`cat--${tone}`"
        :style="{ '--accent': meta.accent, '--on-accent': meta.onAccent }">
    <span v-if="tone === 'outline'" class="cat__dot" aria-hidden="true" />
    <span v-if="showCategory" class="cat__label">{{ meta.label }}</span>
    <span v-if="showCategory && showMedia" class="cat__sep" aria-hidden="true">/</span>
    <span v-if="showMedia" class="cat__media">{{ media }}</span>
  </span>
</template>

<style scoped>
.cat {
  display: inline-flex; align-items: center; gap: 6rem;
  padding: 4rem 10rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: var(--type-meta); font-weight: 600;
  letter-spacing: var(--tracking-meta); text-transform: uppercase;
  line-height: 1.6;
  white-space: nowrap;
}
.cat--outline { background: var(--paper); color: var(--ink); }
.cat--solid { background: var(--accent); color: var(--on-accent); border-color: var(--ink); }
.cat__dot { width: 8rem; height: 8rem; border-radius: 50%; background: var(--accent); border: 1px solid var(--ink); flex: none; }
.cat__sep { opacity: 0.4; }
.cat__media { opacity: 0.72; }
</style>
