<script setup lang="ts">
export interface Crumb { label: string; href?: string; active?: boolean }

defineProps<{
  crumbs?: Crumb[]
  /** The index panel is showing — the plus reads as a minus and the corner is
   *  handed over to the panel's own close button. */
  open?: boolean
  /** The three nav links are revealed. */
  navOpen?: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const contentStore = useContentStore()

/* Revealed on a reverse stagger by .w-nav.is-open — the CSS owns the timing,
   this component only owns the flag. No section links here: the site does not
   group its pages, so the plus button and its flat index are the only way in. */
const links = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: `mailto:${contentStore.email}` }
]
</script>

<template>
  <header class="w-header">
    <NuxtLink to="/" class="w-logo">{{ contentStore.brand }}</NuxtLink>

    <nav v-if="crumbs?.length" class="w-breadcrumb" aria-label="Breadcrumb">
      <div v-for="c in crumbs" :key="c.label" class="w-breadcrumb-item">
        <NuxtLink v-if="c.href" :to="c.href" class="w-link" :class="{ 'is-active': c.active }">{{ c.label }}</NuxtLink>
        <span v-else>{{ c.label }}</span>
      </div>
    </nav>
    <span v-else />

    <div class="w-nav" :class="{ 'is-open': navOpen, 'is-yielded': open }">
      <div class="w-nav-links">
        <div v-for="l in links" :key="l.label" class="w-nav-item">
          <NuxtLink v-if="!l.href.startsWith('mailto:')" :to="l.href" class="w-link">{{ l.label }}</NuxtLink>
          <a v-else :href="l.href" class="w-link">{{ l.label }}</a>
        </div>
      </div>
      <WandaPlusButton :open="open" @click="emit('toggle')" />
    </div>
  </header>
</template>
