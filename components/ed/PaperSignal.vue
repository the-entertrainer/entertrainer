<!-- Paper Signal illustration: pale field, white paper, black rules, blue offset sheet, one cobalt signal. -->
<script setup lang="ts">
/**
 * Design reminder — Every non-brand illustration uses the same spare grammar
 * as the approved reference: rectangular paper, a thin rule, one cobalt cue.
 */
withDefaults(defineProps<{
  variant?: 'route' | 'lesson' | 'project' | 'tool' | 'process' | 'evidence'
  label?: string
}>(), { variant: 'route', label: '' })
</script>

<template>
  <figure class="ps-art" :class="`ps-art--${variant}`" :aria-label="label || undefined">
    <div class="ps-art__paper">
      <span class="ps-art__rule ps-art__rule--one" /><span class="ps-art__rule ps-art__rule--two" /><span class="ps-art__rule ps-art__rule--three" />
      <span class="ps-art__signal" />
      <span v-if="variant === 'process' || variant === 'evidence'" class="ps-art__rule ps-art__rule--four" />
    </div>
  </figure>
</template>

<style scoped>
/* Paper Signal visual: quiet pale field, one paper panel, one cobalt meaning cue. */
.ps-art { position: relative; display: grid; place-items: center; min-height: 210rem; margin: 0; overflow: hidden; background: var(--signal-field); }.ps-art__paper { position: relative; width: min(74%, 420rem); min-height: 118rem; padding: 30rem 34rem; background: var(--paper); border: var(--stroke) solid var(--signal-rule); box-shadow: 13rem 13rem 0 var(--signal-sheet); }.ps-art__rule { position: absolute; left: 34rem; height: 2rem; background: var(--signal-rule); }.ps-art__rule--one { top: 36rem; width: 58%; }.ps-art__rule--two { top: 63rem; width: 45%; }.ps-art__rule--three { top: 90rem; width: 33%; }.ps-art__signal { position: absolute; right: 34rem; bottom: 31rem; display: block; width: 34rem; height: 34rem; border-radius: 50%; background: var(--signal-cobalt); }.ps-art__rule--four { top: auto; bottom: 32rem; width: 50%; }.ps-art--lesson .ps-art__signal { top: 30rem; bottom: auto; }.ps-art--project .ps-art__paper { transform: translateX(-5%); }.ps-art--project .ps-art__signal { border-radius: 0; }.ps-art--tool .ps-art__paper { width: min(66%, 360rem); }.ps-art--tool .ps-art__signal { right: 28rem; top: 30rem; bottom: auto; width: 28rem; height: 28rem; }.ps-art--process .ps-art__paper, .ps-art--evidence .ps-art__paper { min-height: 144rem; }.ps-art--evidence .ps-art__signal { width: 24rem; height: 24rem; right: 31rem; bottom: 38rem; }
@media (max-width: 560px) { .ps-art { min-height: 174rem; }.ps-art__paper { width: min(74%, 290rem); min-height: 102rem; padding: 22rem 24rem; box-shadow: 9rem 9rem 0 var(--signal-sheet); }.ps-art__rule { left: 24rem; }.ps-art__rule--one { top: 28rem; }.ps-art__rule--two { top: 52rem; }.ps-art__rule--three { top: 76rem; }.ps-art__signal { right: 24rem; bottom: 23rem; width: 28rem; height: 28rem; } }
</style>
