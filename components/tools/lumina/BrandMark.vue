<script setup lang="ts">
// The Lumina mark: three course blocks rising toward a radiant sun on a
// saffron-to-rose tile — "light on your learning blocks". `animated` turns
// it into a self-drawing preloader like StoryGen's: rays sweep in, the
// blocks stack up, then the mark breathes. Pure CSS, no JS timers.
defineProps<{ size?: number; animated?: boolean }>()
</script>

<template>
  <svg
    :width="size || 24" :height="size || 24" viewBox="0 0 512 512" aria-hidden="true"
    :class="{ 'lm-mark--animated': animated }" class="lm-mark"
  >
    <defs>
      <linearGradient id="lm-mark-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F6C444" />
        <stop offset="0.55" stop-color="#F08C4A" />
        <stop offset="1" stop-color="#E15B8F" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="116" fill="url(#lm-mark-g)" />
    <g class="lm-mark__sun">
      <circle cx="256" cy="150" r="52" fill="#fff" opacity="0.97" />
      <g stroke="#fff" stroke-width="20" stroke-linecap="round" opacity="0.9">
        <path class="lm-mark__ray" d="M256 58v-14" />
        <path class="lm-mark__ray" d="M340 88l10-10" />
        <path class="lm-mark__ray" d="M172 88l-10-10" />
      </g>
    </g>
    <g class="lm-mark__blk lm-mark__blk--a">
      <rect x="116" y="238" width="280" height="56" rx="20" fill="#fff" opacity="0.97" />
      <rect x="140" y="258" width="120" height="16" rx="8" fill="#F08C4A" opacity="0.5" />
    </g>
    <g class="lm-mark__blk lm-mark__blk--b">
      <rect x="140" y="312" width="232" height="56" rx="20" fill="#fff" opacity="0.9" />
      <rect x="164" y="332" width="150" height="16" rx="8" fill="#0D0C0A" opacity="0.14" />
    </g>
    <g class="lm-mark__blk lm-mark__blk--c">
      <rect x="164" y="386" width="184" height="56" rx="20" fill="#fff" opacity="0.8" />
      <rect x="188" y="406" width="100" height="16" rx="8" fill="#0D0C0A" opacity="0.14" />
    </g>
  </svg>
</template>

<style scoped>
.lm-mark--animated .lm-mark__blk {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: lm-mark-rise 0.5s var(--ease-spring, cubic-bezier(0.2, 0.9, 0.3, 1.3)) both;
}
.lm-mark--animated .lm-mark__blk--c { animation-delay: 0.05s; }
.lm-mark--animated .lm-mark__blk--b { animation-delay: 0.18s; }
.lm-mark--animated .lm-mark__blk--a { animation-delay: 0.31s; }
.lm-mark--animated .lm-mark__sun {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: lm-mark-sun 0.55s 0.5s var(--ease-spring, cubic-bezier(0.2, 0.9, 0.3, 1.3)) both;
}
.lm-mark--animated { animation: lm-mark-breathe 2.6s 1.3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

@keyframes lm-mark-rise {
  from { opacity: 0; transform: translateY(26px) scale(0.85); }
  to   { opacity: 1; transform: none; }
}
@keyframes lm-mark-sun {
  from { opacity: 0; transform: scale(0.4); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes lm-mark-breathe {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(240, 140, 74, 0)); }
  50%      { transform: scale(1.025); filter: drop-shadow(0 6rem 22rem rgba(240, 140, 74, 0.45)); }
}
@media (prefers-reduced-motion: reduce) {
  .lm-mark--animated, .lm-mark--animated .lm-mark__blk, .lm-mark--animated .lm-mark__sun {
    animation: none !important; opacity: 1 !important;
  }
}
</style>
