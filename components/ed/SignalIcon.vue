<!-- Paper Signal line icon: use named geometric icons instead of emoji or miscellaneous glyphs. -->
<script setup lang="ts">
/** Design reminder — one-weight black line geometry, cobalt colour supplied by the parent when active. */
withDefaults(defineProps<{ name: 'arrow' | 'external' | 'check' | 'menu' | 'close' | 'sun' | 'moon' | 'settings' }>(), {})
</script>

<template>
  <span class="ps-icon" aria-hidden="true">
    <svg v-if="name === 'arrow'" viewBox="0 0 24 24"><path d="M4 12h15M14 6l6 6-6 6" /></svg>
    <svg v-else-if="name === 'external'" viewBox="0 0 24 24"><path d="M8 5h11v11M19 5 8 16M18 19H5V6" /></svg>
    <svg v-else-if="name === 'check'" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
    <svg v-else-if="name === 'menu'" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
    <svg v-else-if="name === 'close'" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
    <svg v-else-if="name === 'sun'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></svg>
    <svg v-else-if="name === 'settings'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" /><circle cx="12" cy="12" r="7.2" /></svg>
    <svg v-else viewBox="0 0 24 24"><path d="M20 15.2A8.4 8.4 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z" /></svg>
  </span>
</template>
