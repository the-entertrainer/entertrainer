<script setup lang="ts">
// One small, hand-drawn icon set for the whole tool — Feather/Lucide-style
// (24×24, rounded stroke), authored directly as inline SVG paths so there
// is no external asset, no license question, and every icon inherits
// currentColor and animates like any other DOM node. No emoji, anywhere.
export type StoryIconName =
  | 'close' | 'trash' | 'edit' | 'duplicate' | 'sparkle' | 'undo' | 'redo'
  | 'check' | 'chevron-down' | 'more-horizontal' | 'plus' | 'spinner'
  | 'upload' | 'folder-open' | 'home' | 'grid' | 'link'

withDefaults(defineProps<{ name: StoryIconName; size?: number }>(), { size: 16 })
</script>

<template>
  <svg
    :width="size" :height="size" viewBox="0 0 24 24"
    class="story-icon" :class="`story-icon--${name}`"
    aria-hidden="true" focusable="false"
  >
    <g v-if="name === 'close'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </g>

    <g v-else-if="name === 'trash'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16" />
      <path d="M9 7V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V7" />
      <path d="M18.3 7 17.5 19.2A2 2 0 0 1 15.5 21h-7a2 2 0 0 1-2-1.8L5.7 7" />
      <path d="M10.2 11v6M13.8 11v6" />
    </g>

    <g v-else-if="name === 'edit'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.1 3.3a2.5 2.5 0 0 1 3.6 3.6L8.4 19.2 3 21l1.8-5.4L17.1 3.3Z" />
      <path d="M14.8 5.6l3.6 3.6" />
    </g>

    <g v-else-if="name === 'duplicate'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M5.5 15H4.8A1.8 1.8 0 0 1 3 13.2V4.8A1.8 1.8 0 0 1 4.8 3h8.4A1.8 1.8 0 0 1 15 4.8v.7" />
    </g>

    <!-- A single 4-point sparkle reads cleanly at button size — the tool's
         one recurring "this is AI-assisted" mark. -->
    <path
      v-else-if="name === 'sparkle'" fill="currentColor" stroke="none"
      d="M12 2.4c.55 3.1 1.15 4.72 2.32 5.9 1.18 1.17 2.8 1.77 5.9 2.32-3.1.55-4.72 1.15-5.9 2.32-1.17 1.18-1.77 2.8-2.32 5.9-.55-3.1-1.15-4.72-2.32-5.9-1.18-1.17-2.8-1.77-5.9-2.32 3.1-.55 4.72-1.15 5.9-2.32C10.85 7.12 11.45 5.5 12 2.4Z"
    />

    <g v-else-if="name === 'undo'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.5 15 4 10.5 8.5 6" />
      <path d="M4 10.5h10.5a5.5 5.5 0 0 1 0 11H11" />
    </g>

    <g v-else-if="name === 'redo'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15.5 15 20 10.5 15.5 6" />
      <path d="M20 10.5H9.5a5.5 5.5 0 0 0 0 11H13" />
    </g>

    <path v-else-if="name === 'check'" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M20 6.5 9.5 17 4 11.5" />

    <path v-else-if="name === 'chevron-down'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M6 9.5 12 15.5 18 9.5" />

    <g v-else-if="name === 'more-horizontal'" fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="19" cy="12" r="1.9" />
    </g>

    <path v-else-if="name === 'plus'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M12 5v14M5 12h14" />

    <g v-else-if="name === 'spinner'" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
      <path d="M12 3v4" opacity="1" />
      <path d="M12 17v4" opacity=".25" />
      <path d="M4.9 4.9l2.8 2.8" opacity=".4" />
      <path d="M16.3 16.3l2.8 2.8" opacity=".85" />
      <path d="M3 12h4" opacity=".55" />
      <path d="M17 12h4" opacity=".7" />
      <path d="M4.9 19.1l2.8-2.8" opacity=".1" />
      <path d="M16.3 7.7l2.8-2.8" opacity=".7" />
    </g>

    <g v-else-if="name === 'upload'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 15V4M12 4 7.5 8.5M12 4l4.5 4.5" />
      <path d="M4.5 15v3A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
    </g>

    <g v-else-if="name === 'folder-open'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3.5 8V6a1.5 1.5 0 0 1 1.5-1.5h4l2 2H19A1.5 1.5 0 0 1 20.5 8" />
      <path d="M3.5 8h17l-1.7 9.4a2 2 0 0 1-2 1.6H7.2a2 2 0 0 1-2-1.6L3.5 8Z" />
    </g>

    <g v-else-if="name === 'home'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v8.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V10" />
    </g>

    <g v-else-if="name === 'grid'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
    </g>

    <g v-else-if="name === 'link'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="7" cy="7" r="4.2" />
      <circle cx="17" cy="17" r="4.2" />
      <path d="M9.7 9.7 14.3 14.3" />
    </g>
  </svg>
</template>

<style scoped>
.story-icon { display: inline-block; vertical-align: middle; flex-shrink: 0; }
.story-icon--spinner { animation: story-icon-spin 0.9s linear infinite; }
@keyframes story-icon-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .story-icon--spinner { animation-duration: 1.8s; }
}
</style>
