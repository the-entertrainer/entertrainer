<script setup lang="ts">
// The Cadence mark: three session pills stepping diagonally down a month
// grid — the "beat" of trainings falling into place across the weeks. On a
// gradient tile drawn from the same violet→blue→teal family as StoryGen, so
// the two tools read as siblings. `animated` turns it into a self-drawing
// preloader: the column guides fade in, the pills drop in sequence (the
// cadence), then the whole mark breathes — pure CSS/SMIL, no JS timers.
defineProps<{ size?: number; animated?: boolean }>()
</script>

<template>
  <svg
    :width="size || 24" :height="size || 24" viewBox="0 0 512 512" aria-hidden="true"
    :class="{ 'cg-mark--animated': animated }" class="cg-mark"
  >
    <defs>
      <linearGradient id="cg-mark-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8B7CF6" />
        <stop offset="0.55" stop-color="#5B8DEF" />
        <stop offset="1" stop-color="#2DD4BF" />
      </linearGradient>
    </defs>

    <rect width="512" height="512" rx="116" fill="url(#cg-mark-g)" />

    <!-- Day-column guides: the grid the sessions land on -->
    <g class="cg-mark__grid" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.16">
      <line x1="176" y1="150" x2="176" y2="384" />
      <line x1="336" y1="150" x2="336" y2="384" />
    </g>

    <!-- Three sessions, stepping down and to the right — the cadence -->
    <g class="cg-mark__pill cg-mark__pill--a">
      <rect x="72"  y="152" width="200" height="58" rx="18" fill="#fff" opacity="0.98" />
      <circle cx="102" cy="181" r="12" fill="#8B5CF6" />
      <rect x="126" y="175" width="112" height="12" rx="6" fill="#0D0C0A" opacity="0.18" />
    </g>
    <g class="cg-mark__pill cg-mark__pill--b">
      <rect x="156" y="234" width="200" height="58" rx="18" fill="#fff" opacity="0.98" />
      <circle cx="186" cy="263" r="12" fill="#3B82F6" />
      <rect x="210" y="257" width="112" height="12" rx="6" fill="#0D0C0A" opacity="0.18" />
    </g>
    <g class="cg-mark__pill cg-mark__pill--c">
      <rect x="240" y="316" width="200" height="58" rx="18" fill="#fff" opacity="0.98" />
      <circle cx="270" cy="345" r="12" fill="#14B8A6" />
      <rect x="294" y="339" width="112" height="12" rx="6" fill="#0D0C0A" opacity="0.18" />
    </g>
  </svg>
</template>

<style scoped>
.cg-mark--animated .cg-mark__pill {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: cg-mark-drop 0.5s var(--ease-spring, cubic-bezier(0.2, 0.9, 0.3, 1.3)) both;
}
.cg-mark--animated .cg-mark__pill--a { animation-delay: 0.08s; }
.cg-mark--animated .cg-mark__pill--b { animation-delay: 0.22s; }
.cg-mark--animated .cg-mark__pill--c { animation-delay: 0.36s; }
.cg-mark--animated .cg-mark__grid { opacity: 0; animation: cg-mark-fade 0.5s 0.02s ease-out both; }
.cg-mark--animated {
  animation: cg-mark-breathe 2.6s 1.3s ease-in-out infinite;
  transform-box: fill-box; transform-origin: center;
}

@keyframes cg-mark-drop {
  from { opacity: 0; transform: translateY(-14px) scale(0.7); }
  to   { opacity: 1; transform: none; }
}
@keyframes cg-mark-fade {
  from { opacity: 0; }
  to   { opacity: 0.16; }
}
@keyframes cg-mark-breathe {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(139, 124, 246, 0)); }
  50%      { transform: scale(1.025); filter: drop-shadow(0 6rem 22rem rgba(139, 124, 246, 0.45)); }
}
@media (prefers-reduced-motion: reduce) {
  .cg-mark--animated,
  .cg-mark--animated .cg-mark__pill,
  .cg-mark--animated .cg-mark__grid {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
  .cg-mark--animated .cg-mark__grid { opacity: 0.16 !important; }
}
</style>
