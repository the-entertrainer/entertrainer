<script setup lang="ts">
// The StoryGen mark: two storyboard cards wired by a curve on a gradient
// tile — the app's own identity, scoped to the tool (never replacing the
// site's Entertrainer chrome). `animated` turns it into a self-drawing
// preloader: the curve traces itself, the cards pop in, then the whole
// mark breathes gently — pure CSS/SMIL, no JS timers.
defineProps<{ size?: number; animated?: boolean }>()
</script>

<template>
  <svg
    :width="size || 24" :height="size || 24" viewBox="0 0 512 512" aria-hidden="true"
    :class="{ 'sg-mark--animated': animated }" class="sg-mark"
  >
    <defs>
      <linearGradient id="sg-mark-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8B7CF6" />
        <stop offset="0.55" stop-color="#5B8DEF" />
        <stop offset="1" stop-color="#2DD4BF" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="116" fill="url(#sg-mark-g)" />
    <g class="sg-mark__card sg-mark__card--a">
      <rect x="84" y="118" width="152" height="110" rx="26" fill="#fff" opacity="0.97" />
      <rect x="104" y="144" width="76" height="13" rx="6.5" fill="#8B7CF6" opacity="0.55" />
      <rect x="104" y="170" width="102" height="9" rx="4.5" fill="#0D0C0A" opacity="0.16" />
      <rect x="104" y="188" width="88" height="9" rx="4.5" fill="#0D0C0A" opacity="0.16" />
    </g>
    <g class="sg-mark__card sg-mark__card--b">
      <rect x="276" y="284" width="152" height="110" rx="26" fill="#fff" opacity="0.97" />
      <rect x="296" y="310" width="76" height="13" rx="6.5" fill="#2DD4BF" opacity="0.7" />
      <rect x="296" y="336" width="102" height="9" rx="4.5" fill="#0D0C0A" opacity="0.16" />
      <rect x="296" y="354" width="88" height="9" rx="4.5" fill="#0D0C0A" opacity="0.16" />
    </g>
    <path class="sg-mark__curve" d="M236,173 C318,173 194,339 276,339" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.95" pathLength="1" />
    <circle class="sg-mark__dot sg-mark__dot--a" cx="236" cy="173" r="17" fill="#fff" />
    <circle class="sg-mark__dot sg-mark__dot--b" cx="276" cy="339" r="17" fill="#fff" />
  </svg>
</template>

<style scoped>
.sg-mark--animated .sg-mark__card {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: sg-mark-pop 0.5s var(--ease-spring, cubic-bezier(0.2, 0.9, 0.3, 1.3)) both;
}
.sg-mark--animated .sg-mark__card--a { animation-delay: 0.05s; }
.sg-mark--animated .sg-mark__card--b { animation-delay: 0.2s; }
.sg-mark--animated .sg-mark__curve {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: sg-mark-draw 0.55s 0.42s ease-out both;
}
.sg-mark--animated .sg-mark__dot { opacity: 0; transform-box: fill-box; transform-origin: center; animation: sg-mark-dot 0.4s ease-out both; }
.sg-mark--animated .sg-mark__dot--a { animation-delay: 0.42s; }
.sg-mark--animated .sg-mark__dot--b { animation-delay: 0.92s; }
.sg-mark--animated { animation: sg-mark-breathe 2.6s 1.3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

@keyframes sg-mark-pop {
  from { opacity: 0; transform: scale(0.55); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes sg-mark-draw {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}
@keyframes sg-mark-dot {
  from { opacity: 0; transform: scale(0); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes sg-mark-breathe {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(139, 124, 246, 0)); }
  50%      { transform: scale(1.025); filter: drop-shadow(0 6rem 22rem rgba(139, 124, 246, 0.45)); }
}
@media (prefers-reduced-motion: reduce) {
  .sg-mark--animated, .sg-mark--animated .sg-mark__card, .sg-mark--animated .sg-mark__curve, .sg-mark--animated .sg-mark__dot {
    animation: none !important; opacity: 1 !important; stroke-dashoffset: 0 !important;
  }
}
</style>
