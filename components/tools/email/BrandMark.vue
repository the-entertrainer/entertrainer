<script setup lang="ts">
// The Draftly mark: an envelope with a burst of polish sparkles — a rough
// draft coming out clean. Same violet→blue→teal tile as StoryGen, Cadence
// and EasyMCQ so all four tools read as one family. `animated` pops the
// envelope in, draws the flap, then twinkles the sparkles.
defineProps<{ size?: number; animated?: boolean }>()
</script>

<template>
  <svg
    :width="size || 24" :height="size || 24" viewBox="0 0 512 512" aria-hidden="true"
    :class="{ 'df-mark--animated': animated }" class="df-mark"
  >
    <defs>
      <linearGradient id="df-mark-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8B7CF6" />
        <stop offset="0.55" stop-color="#5B8DEF" />
        <stop offset="1" stop-color="#2DD4BF" />
      </linearGradient>
    </defs>

    <rect width="512" height="512" rx="116" fill="url(#df-mark-g)" />

    <!-- Envelope -->
    <g class="df-mark__env">
      <rect x="88" y="188" width="300" height="196" rx="30" fill="#fff" opacity="0.98" />
      <path class="df-mark__flap" d="M114,212 L238,300 L362,212"
            fill="none" stroke="#0D0C0A" stroke-opacity="0.18" stroke-width="11"
            stroke-linecap="round" stroke-linejoin="round" pathLength="1" />
    </g>

    <!-- Polish sparkles -->
    <g class="df-mark__spark df-mark__spark--a" transform="translate(378,158)">
      <path d="M0,-52 C6,-6 6,-6 52,0 C6,6 6,6 0,52 C-6,6 -6,6 -52,0 C-6,-6 -6,-6 0,-52 Z" fill="#14B8A6" />
    </g>
    <g class="df-mark__spark df-mark__spark--b" transform="translate(430,232)">
      <path d="M0,-22 C2.4,-2.4 2.4,-2.4 22,0 C2.4,2.4 2.4,2.4 0,22 C-2.4,2.4 -2.4,2.4 -22,0 C-2.4,-2.4 -2.4,-2.4 0,-22 Z" fill="#8B5CF6" />
    </g>
  </svg>
</template>

<style scoped>
.df-mark--animated .df-mark__env {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: df-mark-pop 0.5s var(--ease-spring, cubic-bezier(0.2, 0.9, 0.3, 1.3)) both;
  animation-delay: 0.05s;
}
.df-mark--animated .df-mark__flap {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: df-mark-draw 0.45s 0.42s ease-out both;
}
.df-mark--animated .df-mark__spark {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: df-mark-twinkle 0.5s var(--ease-spring, cubic-bezier(0.2, 0.9, 0.3, 1.3)) both;
}
.df-mark--animated .df-mark__spark--a { animation-delay: 0.6s; }
.df-mark--animated .df-mark__spark--b { animation-delay: 0.78s; }
.df-mark--animated {
  animation: df-mark-breathe 2.6s 1.3s ease-in-out infinite;
  transform-box: fill-box; transform-origin: center;
}

@keyframes df-mark-pop {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes df-mark-draw {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}
@keyframes df-mark-twinkle {
  0%   { opacity: 0; transform: scale(0) rotate(-40deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes df-mark-breathe {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(139, 124, 246, 0)); }
  50%      { transform: scale(1.025); filter: drop-shadow(0 6rem 22rem rgba(139, 124, 246, 0.45)); }
}
@media (prefers-reduced-motion: reduce) {
  .df-mark--animated,
  .df-mark--animated .df-mark__env,
  .df-mark--animated .df-mark__flap,
  .df-mark--animated .df-mark__spark {
    animation: none !important; opacity: 1 !important; transform: none !important; stroke-dashoffset: 0 !important;
  }
}
</style>
