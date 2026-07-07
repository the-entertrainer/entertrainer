<script setup lang="ts">
// The EasyMCQ mark: three answer options on the gradient tile, the middle
// one marked correct — the question shape the tool works on. Same
// violet→blue→teal tile as StoryGen and Cadence so all three tools read as
// one family. `animated` pops the options in, then checks the answer.
defineProps<{ size?: number; animated?: boolean }>()
</script>

<template>
  <svg
    :width="size || 24" :height="size || 24" viewBox="0 0 512 512" aria-hidden="true"
    :class="{ 'mq-mark--animated': animated }" class="mq-mark"
  >
    <defs>
      <linearGradient id="mq-mark-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8B7CF6" />
        <stop offset="0.55" stop-color="#5B8DEF" />
        <stop offset="1" stop-color="#2DD4BF" />
      </linearGradient>
    </defs>

    <rect width="512" height="512" rx="116" fill="url(#mq-mark-g)" />

    <!-- Option A -->
    <g class="mq-mark__opt mq-mark__opt--a">
      <rect x="96" y="140" width="320" height="64" rx="20" fill="#fff" opacity="0.98" />
      <circle cx="130" cy="172" r="17" fill="none" stroke="#8B5CF6" stroke-width="7" />
      <rect x="168" y="166" width="176" height="12" rx="6" fill="#0D0C0A" opacity="0.16" />
    </g>

    <!-- Option B — the correct answer -->
    <g class="mq-mark__opt mq-mark__opt--b">
      <rect x="96" y="224" width="320" height="64" rx="20" fill="#fff" opacity="0.98" />
      <circle cx="130" cy="256" r="18" fill="#14B8A6" />
      <path class="mq-mark__check" d="M120,256 l7,8 l14,-16" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" pathLength="1" />
      <rect x="168" y="250" width="150" height="12" rx="6" fill="#0D0C0A" opacity="0.16" />
    </g>

    <!-- Option C -->
    <g class="mq-mark__opt mq-mark__opt--c">
      <rect x="96" y="308" width="320" height="64" rx="20" fill="#fff" opacity="0.98" />
      <circle cx="130" cy="340" r="17" fill="none" stroke="#3B82F6" stroke-width="7" />
      <rect x="168" y="334" width="196" height="12" rx="6" fill="#0D0C0A" opacity="0.16" />
    </g>
  </svg>
</template>

<style scoped>
.mq-mark--animated .mq-mark__opt {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: mq-mark-pop 0.45s var(--ease-spring, cubic-bezier(0.2, 0.9, 0.3, 1.3)) both;
}
.mq-mark--animated .mq-mark__opt--a { animation-delay: 0.06s; }
.mq-mark--animated .mq-mark__opt--b { animation-delay: 0.18s; }
.mq-mark--animated .mq-mark__opt--c { animation-delay: 0.3s; }
.mq-mark--animated .mq-mark__check {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: mq-mark-draw 0.4s 0.5s ease-out both;
}
.mq-mark--animated {
  animation: mq-mark-breathe 2.6s 1.3s ease-in-out infinite;
  transform-box: fill-box; transform-origin: center;
}

@keyframes mq-mark-pop {
  from { opacity: 0; transform: translateX(-14px) scale(0.85); }
  to   { opacity: 1; transform: none; }
}
@keyframes mq-mark-draw {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}
@keyframes mq-mark-breathe {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(139, 124, 246, 0)); }
  50%      { transform: scale(1.025); filter: drop-shadow(0 6rem 22rem rgba(139, 124, 246, 0.45)); }
}
@media (prefers-reduced-motion: reduce) {
  .mq-mark--animated,
  .mq-mark--animated .mq-mark__opt,
  .mq-mark--animated .mq-mark__check {
    animation: none !important; opacity: 1 !important; transform: none !important; stroke-dashoffset: 0 !important;
  }
}
</style>
