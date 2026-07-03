<script setup lang="ts">
// The StoryGen mark: two storyboard cards wired by a curve on a gradient
// tile — the app's own identity, scoped to the tool (never replacing the
// site's Entertrainer chrome).
defineProps<{ size?: number }>()
</script>

<template>
  <svg :width="size || 24" :height="size || 24" viewBox="0 0 512 512" aria-hidden="true">
    <defs>
      <linearGradient id="sg-mark-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8B7CF6" />
        <stop offset="0.55" stop-color="#5B8DEF" />
        <stop offset="1" stop-color="#2DD4BF" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="116" fill="url(#sg-mark-g)" />
    <rect x="84" y="118" width="152" height="110" rx="26" fill="#fff" opacity="0.97" />
    <rect x="104" y="144" width="76" height="13" rx="6.5" fill="#8B7CF6" opacity="0.55" />
    <rect x="104" y="170" width="102" height="9" rx="4.5" fill="#0D0C0A" opacity="0.16" />
    <rect x="104" y="188" width="88" height="9" rx="4.5" fill="#0D0C0A" opacity="0.16" />
    <rect x="276" y="284" width="152" height="110" rx="26" fill="#fff" opacity="0.97" />
    <rect x="296" y="310" width="76" height="13" rx="6.5" fill="#2DD4BF" opacity="0.7" />
    <rect x="296" y="336" width="102" height="9" rx="4.5" fill="#0D0C0A" opacity="0.16" />
    <rect x="296" y="354" width="88" height="9" rx="4.5" fill="#0D0C0A" opacity="0.16" />
    <path d="M236,173 C318,173 194,339 276,339" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.95" />
    <circle cx="236" cy="173" r="17" fill="#fff" />
    <circle cx="276" cy="339" r="17" fill="#fff" />
  </svg>
</template>
