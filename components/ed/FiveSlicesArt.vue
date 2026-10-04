<script setup lang="ts">
/**
 * 5 Slices drawings. Flat Kurzgesagt-like scenes: thick outlines,
 * navy starfield, cute characters. No type in the SVG.
 */
defineProps<{ name: string }>()
</script>

<template>
  <svg class="fs-art" viewBox="0 0 360 250" fill="none" aria-hidden="true">
    <defs>
      <clipPath id="fs-shell-clip"><circle cx="148" cy="104" r="72" /></clipPath>
      <clipPath id="fs-bowl-clip"><rect x="64" y="128" width="232" height="100" /></clipPath>
      <radialGradient id="fs-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#3DDCFF" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#3DDCFF" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- 1 · a universe in a sphere, beamed onto a grid, watched by an eye -->
    <g v-if="name === 'shell'">
      <g fill="#FFE14A">
        <circle cx="28" cy="36" r="2.2" />
        <circle cx="70" cy="22" r="1.6" />
        <circle cx="318" cy="28" r="2" />
        <circle cx="336" cy="78" r="1.5" />
        <circle cx="24" cy="200" r="1.6" />
        <circle cx="340" cy="210" r="2" />
      </g>
      <path d="M46 48l2.2 6.2 6.4.2-5 3.8 1.8 6.2L46 61l-5.4 3.4 1.8-6.2-5-3.8 6.4-.2z" fill="#FFE14A" />
      <path d="M300 188l1.6 4.4 4.6.1-3.6 2.8 1.3 4.4L300 197l-3.9 2.6 1.3-4.4-3.6-2.8 4.6-.1z" fill="#3DDCFF" />

      <g stroke="#1E4D86" stroke-width="1.6">
        <path d="M48 214 L180 168 L312 214" />
        <path d="M78 214 L180 174" />
        <path d="M122 214 L180 180" />
        <path d="M238 214 L180 180" />
        <path d="M282 214 L180 174" />
        <path d="M70 196 H290" />
        <path d="M92 206 H268" />
        <path d="M112 188 H248" />
      </g>
      <ellipse cx="180" cy="214" rx="46" ry="10" fill="url(#fs-glow)" />
      <path d="M148 168 L166 206 H194 L176 168" fill="#3DDCFF" opacity="0.35" />
      <circle cx="180" cy="206" r="7" fill="#7AEEFF" />

      <circle cx="148" cy="104" r="76" fill="#071833" stroke="#3DDCFF" stroke-width="7" />
      <circle cx="148" cy="104" r="68" stroke="#7AEEFF" stroke-width="2" opacity="0.7" />
      <g clip-path="url(#fs-shell-clip)">
        <g transform="translate(128 92) rotate(-28)">
          <ellipse rx="26" ry="10" stroke="#FF8A1E" stroke-width="5" />
          <ellipse rx="16" ry="6" stroke="#FFE14A" stroke-width="3.5" />
          <circle r="4.5" fill="#FFE14A" />
        </g>
        <g transform="translate(176 78)">
          <ellipse rx="16" ry="6" stroke="#FF8A1E" stroke-width="3.5" transform="rotate(-18)" />
          <circle r="5" fill="#E8A04A" stroke="#F4E7C8" stroke-width="2" />
        </g>
        <circle cx="112" cy="128" r="9" fill="#2F6BFF" stroke="#F4E7C8" stroke-width="2.5" />
        <circle cx="168" cy="132" r="7" fill="#FF5A6A" stroke="#F4E7C8" stroke-width="2.5" />
        <circle cx="150" cy="112" r="4" fill="#7AEEFF" />
        <path d="M96 78l22 8" stroke="#FFE14A" stroke-width="3" stroke-linecap="round" />
        <circle cx="186" cy="118" r="3" fill="#FFE14A" />
        <path d="M138 70l1.4 4 4.2.1-3.3 2.5 1.2 4L138 78l-3.5 2.4 1.2-4-3.3-2.5 4.2-.1z" fill="#F7F4EE" />
      </g>

      <g transform="translate(292 154)">
        <ellipse cx="0" cy="6" rx="26" ry="18" fill="#F7F4EE" stroke="#F4E7C8" stroke-width="3.5" />
        <circle cx="4" cy="6" r="9" fill="#10203A" />
        <circle cx="7" cy="3" r="3.2" fill="#F7F4EE" />
        <path d="M22 -8c10 -12 22 -2 12 10" stroke="#FF5A6A" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="32" cy="6" r="2.4" fill="#FF5A6A" />
      </g>
    </g>

    <!-- 2 · smiling black hole, solid cube beside a hollow one -->
    <g v-else-if="name === 'surface'">
      <g fill="#FFE14A">
        <circle cx="30" cy="28" r="2" />
        <circle cx="330" cy="24" r="1.6" />
        <circle cx="346" cy="96" r="1.8" />
        <circle cx="22" cy="150" r="1.5" />
      </g>
      <path d="M48 46l2 5.4 5.6.2-4.4 3.4 1.6 5.4L48 57.2 43.4 61l1.6-5.4-4.4-3.4 5.6-.2z" fill="#FF8A1E" />

      <ellipse cx="180" cy="78" rx="108" ry="34" stroke="#FF5A1E" stroke-width="14" />
      <ellipse cx="180" cy="78" rx="86" ry="24" stroke="#FF8A1E" stroke-width="8" />
      <ellipse cx="180" cy="74" rx="64" ry="16" stroke="#FFE14A" stroke-width="5" />
      <circle cx="180" cy="78" r="34" fill="#07070E" stroke="#F4E7C8" stroke-width="3.5" />
      <circle cx="168" cy="72" r="4" fill="#F7F4EE" />
      <circle cx="192" cy="72" r="4" fill="#F7F4EE" />
      <path d="M170 88q10 8 20 0" stroke="#FF5A6A" stroke-width="3" stroke-linecap="round" />

      <g transform="translate(36 168)">
        <path d="M46 0 L78 16 L46 32 L14 16 Z" fill="#8EE7FF" stroke="#F4E7C8" stroke-width="3" />
        <path d="M14 16 L46 32 L46 64 L14 48 Z" fill="#1F6FE5" stroke="#F4E7C8" stroke-width="3" />
        <path d="M46 32 L78 16 L78 48 L46 64 Z" fill="#3D8BFF" stroke="#F4E7C8" stroke-width="3" />
      </g>
      <path d="M148 196h36" stroke="#FFE14A" stroke-width="6" stroke-linecap="round" />
      <path d="M176 186l12 10-12 10" stroke="#FFE14A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
      <g transform="translate(214 168)" stroke="#FFE14A" stroke-width="3" fill="none">
        <path d="M46 0 L78 16 L46 32 L14 16 Z" />
        <path d="M14 16 L46 32 L46 64 L14 48 Z" />
        <path d="M46 32 L78 16 L78 48 L46 64 Z" />
        <path d="M46 32 V64 M14 16 V48 M78 16 V48" opacity="0.85" />
      </g>

      <g transform="translate(18 196)">
        <circle cx="18" cy="18" r="16" stroke="#3DDCFF" stroke-width="4" />
        <circle cx="18" cy="18" r="7" fill="#10284F" />
        <circle cx="16" cy="16" r="1.6" fill="#F7F4EE" />
        <circle cx="21" cy="16" r="1.6" fill="#F7F4EE" />
        <path d="M15 21q3 3 7 0" stroke="#FF5A6A" stroke-width="1.6" stroke-linecap="round" />
        <path d="M30 30l14 16" stroke="#3DDCFF" stroke-width="5" stroke-linecap="round" />
      </g>
    </g>

    <!-- 3 · a bowl of worlds, data marks on the rim, characters pointing in -->
    <g v-else-if="name === 'boundary'">
      <g fill="#FFE14A">
        <circle cx="24" cy="30" r="1.8" />
        <circle cx="340" cy="26" r="2" />
        <circle cx="40" cy="70" r="1.4" />
        <circle cx="330" cy="64" r="1.5" />
      </g>
      <path d="M60 40l1.8 5 5.2.2-4 3.2 1.5 5L60 50.6 55.5 54l1.5-5-4-3.2 5.2-.2z" fill="#3DDCFF" />

      <g clip-path="url(#fs-bowl-clip)">
        <ellipse cx="180" cy="128" rx="116" ry="84" fill="#0A1C3C" />
        <g transform="translate(156 176) rotate(-22)">
          <ellipse rx="26" ry="10" stroke="#3DDCFF" stroke-width="4" />
          <ellipse rx="14" ry="5" stroke="#7AEEFF" stroke-width="3" />
          <circle r="5" fill="#2F6BFF" />
        </g>
        <g transform="translate(230 170)">
          <ellipse rx="14" ry="5" stroke="#FF8A1E" stroke-width="3" transform="rotate(-18)" />
          <circle r="6" fill="#E8A04A" stroke="#F4E7C8" stroke-width="2" />
        </g>
        <circle cx="118" cy="188" r="9" fill="#FF8A1E" stroke="#F4E7C8" stroke-width="2.5" />
        <circle cx="196" cy="198" r="6" fill="#FF5A6A" />
        <circle cx="150" cy="156" r="3.5" fill="#FFE14A" />
        <circle cx="214" cy="150" r="3" fill="#7AEEFF" />
      </g>
      <ellipse cx="180" cy="128" rx="116" ry="26" fill="none" stroke="#7AEEFF" stroke-width="6" />
      <ellipse cx="180" cy="128" rx="100" ry="18" fill="none" stroke="#3DDCFF" stroke-width="3" stroke-dasharray="6 5" />
      <g fill="#7AEEFF">
        <rect x="86" y="118" width="8" height="8" rx="1.5" />
        <rect x="122" y="108" width="8" height="8" rx="1.5" />
        <rect x="164" y="102" width="8" height="8" rx="1.5" />
        <rect x="206" y="108" width="8" height="8" rx="1.5" />
        <rect x="246" y="118" width="8" height="8" rx="1.5" />
      </g>
      <path d="M100 122v16M170 108v18M236 120v16" stroke="#3DDCFF" stroke-width="2" stroke-dasharray="2 3" />

      <g transform="translate(46 118)">
        <circle r="16" fill="#3DDCFF" stroke="#F4E7C8" stroke-width="3" />
        <circle cx="-5" cy="-2" r="2" fill="#10203A" />
        <circle cx="5" cy="-2" r="2" fill="#10203A" />
        <path d="M-5 6q5 5 10 0" stroke="#10203A" stroke-width="2" stroke-linecap="round" />
        <path d="M14 4l22 18" stroke="#3DDCFF" stroke-width="4" stroke-linecap="round" />
      </g>
      <g transform="translate(300 108)">
        <circle r="15" fill="#FFE14A" stroke="#F4E7C8" stroke-width="3" />
        <circle cx="-4" cy="-2" r="2" fill="#10203A" />
        <circle cx="4" cy="-2" r="2" fill="#10203A" />
        <path d="M-4 5q4 4 8 0" stroke="#10203A" stroke-width="2" stroke-linecap="round" />
        <path d="M-12 6l-20 16" stroke="#FFE14A" stroke-width="4" stroke-linecap="round" />
      </g>
      <g transform="translate(78 196)">
        <circle r="14" fill="#FF5A6A" stroke="#F4E7C8" stroke-width="3" />
        <circle cx="-4" cy="-1" r="1.8" fill="#F7F4EE" />
        <circle cx="4" cy="-1" r="1.8" fill="#F7F4EE" />
        <path d="M12 -2l16-14" stroke="#FF5A6A" stroke-width="4" stroke-linecap="round" />
      </g>
      <g transform="translate(168 214)">
        <circle r="18" fill="#2F6BFF" stroke="#F4E7C8" stroke-width="3" />
        <circle cx="-5" cy="-2" r="2.2" fill="#F7F4EE" />
        <circle cx="5" cy="-2" r="2.2" fill="#F7F4EE" />
        <path d="M-4 6q4 4 9 0" stroke="#F7F4EE" stroke-width="2" stroke-linecap="round" />
        <path d="M6 -16v-14" stroke="#2F6BFF" stroke-width="4" stroke-linecap="round" />
        <path d="M6 -30l-4 6h8z" fill="#2F6BFF" />
      </g>
      <g transform="translate(214 214)">
        <path d="M0-12l2.4 6.6 7 .2-5.4 4.2 2 6.6L0-1.2l-6 4.4 2-6.6-5.4-4.2 7-.2z" fill="#FFE14A" stroke="#F4E7C8" stroke-width="2" />
        <circle cx="-2" cy="-2" r="1.2" fill="#10203A" />
        <circle cx="3" cy="-2" r="1.2" fill="#10203A" />
      </g>
    </g>

    <!-- 4 · astronaut between a room of galaxies and a flat diagram -->
    <g v-else-if="name === 'not-screen'">
      <g fill="#FFE14A">
        <circle cx="18" cy="24" r="1.6" />
        <circle cx="344" cy="20" r="2" />
        <circle cx="348" cy="120" r="1.4" />
      </g>
      <path d="M40 148 L120 112 L200 148 L120 184 Z" fill="#0C2348" stroke="#3DDCFF" stroke-width="3.5" />
      <path d="M40 148 V86 L120 50 V112 Z" fill="#102A55" stroke="#3DDCFF" stroke-width="3.5" />
      <path d="M120 112 V50 L200 86 V148 Z" fill="#16325F" stroke="#3DDCFF" stroke-width="3.5" />
      <g transform="translate(86 96) rotate(-18)">
        <ellipse rx="16" ry="6" stroke="#FF8A1E" stroke-width="3" />
        <circle r="3.5" fill="#FFE14A" />
      </g>
      <circle cx="150" cy="92" r="7" fill="#2F6BFF" stroke="#F4E7C8" stroke-width="2" />
      <g transform="translate(156 128)">
        <ellipse rx="12" ry="4.5" stroke="#FF8A1E" stroke-width="2.5" transform="rotate(-20)" />
        <circle r="4" fill="#E8A04A" stroke="#F4E7C8" stroke-width="1.5" />
      </g>
      <path d="M128 156c8 10 16 10 22 0" stroke="#7AEEFF" stroke-width="2" />

      <g transform="translate(118 168)">
        <rect x="-6" y="-34" width="8" height="16" rx="2" fill="#3DDCFF" stroke="#F4E7C8" stroke-width="2" />
        <rect x="-10" y="-36" width="20" height="22" rx="5" fill="#F7F4EE" stroke="#F4E7C8" stroke-width="2.5" />
        <rect x="-9" y="-16" width="7" height="14" rx="2" fill="#E7E2D6" stroke="#F4E7C8" stroke-width="2" />
        <rect x="2" y="-16" width="7" height="14" rx="2" fill="#E7E2D6" stroke="#F4E7C8" stroke-width="2" />
        <circle cy="-48" r="12" fill="#F7F4EE" stroke="#F4E7C8" stroke-width="2.5" />
        <ellipse cy="-48" rx="7" ry="6" fill="#16324F" />
        <circle cx="2" cy="-50" r="1.8" fill="#7AEEFF" />
        <path d="M8 -30l16-22" stroke="#F7F4EE" stroke-width="4" stroke-linecap="round" />
        <circle cx="26" cy="-54" r="3" fill="#F7F4EE" stroke="#F4E7C8" stroke-width="1.5" />
      </g>

      <path d="M196 58c18-16 36-14 48 0" stroke="#FFE14A" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M240 62l8-2 2 8" stroke="#FFE14A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />

      <rect x="236" y="70" width="96" height="140" rx="16" fill="#0C2348" stroke="#3DDCFF" stroke-width="5" transform="rotate(7 284 140)" />
      <g transform="rotate(7 284 140)">
        <g transform="translate(268 104)">
          <ellipse rx="14" ry="5" stroke="#FF8A1E" stroke-width="3" transform="rotate(-24)" />
          <circle r="4" fill="#FFE14A" />
        </g>
        <circle cx="304" cy="122" r="8" fill="#2F6BFF" stroke="#F4E7C8" stroke-width="2" />
        <g transform="translate(286 156)">
          <ellipse rx="12" ry="4" stroke="#E8A04A" stroke-width="2.5" transform="rotate(-18)" />
          <circle r="5" fill="#FF8A1E" stroke="#F4E7C8" stroke-width="2" />
        </g>
        <path d="M258 186h40l-14 22h-12z" fill="none" stroke="#7AEEFF" stroke-width="2.5" />
        <path d="M266 192h24M272 198h12" stroke="#7AEEFF" stroke-width="1.6" />
      </g>
    </g>

    <!-- 5 · two faced puzzle pieces and a thinking scientist -->
    <g v-else-if="name === 'duality'">
      <g fill="#FFE14A">
        <circle cx="28" cy="30" r="1.8" />
        <circle cx="200" cy="28" r="1.5" />
        <circle cx="340" cy="36" r="2" />
        <circle cx="40" cy="200" r="1.4" />
      </g>
      <g transform="translate(300 48) rotate(18)">
        <ellipse rx="16" ry="6" stroke="#FF5A6A" stroke-width="3" />
        <circle r="3" fill="#FF8A1E" />
      </g>
      <ellipse cx="70" cy="46" rx="18" ry="8" stroke="#3DDCFF" stroke-width="3" opacity="0.8" />

      <path d="M28 70h92v22a16 16 0 0 1 0 32v24H28z" fill="#2F6BFF" stroke="#F4E7C8" stroke-width="4" />
      <path d="M136 70h96v78H136v-24a16 16 0 0 1 0-32z" fill="#FF5A6A" stroke="#F4E7C8" stroke-width="4" />
      <circle cx="62" cy="96" r="3" fill="#F7F4EE" />
      <circle cx="80" cy="96" r="3" fill="#F7F4EE" />
      <path d="M62 108q9 7 18 0" stroke="#F7F4EE" stroke-width="2.5" stroke-linecap="round" />
      <path d="M48 128c8-8 14-8 22 0s14 8 22 0 12-8 18 0" stroke="#7AEEFF" stroke-width="3" stroke-linecap="round" />
      <circle cx="168" cy="98" r="3" fill="#10203A" />
      <circle cx="186" cy="98" r="3" fill="#10203A" />
      <path d="M168 110q9 7 18 0" stroke="#10203A" stroke-width="2.5" stroke-linecap="round" />
      <path d="M160 128h36l-12 18h-12z" fill="none" stroke="#FFE14A" stroke-width="3" />
      <path d="M166 133h24M170 138h16M174 143h8" stroke="#FFE14A" stroke-width="1.6" />
      <circle cx="178" cy="154" r="3.5" fill="#FFE14A" />

      <g transform="translate(286 168)">
        <path d="M-28 -8c8-20 36-22 44-4 6 12-2 20-14 22v10h-22v-8c-12-2-20-8-8-20z" fill="#3A2418" />
        <circle cy="-6" r="16" fill="#F3C7A0" stroke="#F4E7C8" stroke-width="2.5" />
        <circle cx="-6" cy="-8" r="5" stroke="#10203A" stroke-width="2" />
        <circle cx="7" cy="-8" r="5" stroke="#10203A" stroke-width="2" />
        <circle cx="-5" cy="-8" r="1.6" fill="#10203A" />
        <circle cx="8" cy="-8" r="1.6" fill="#10203A" />
        <path d="M-14 -6h-6M12 -6h6" stroke="#10203A" stroke-width="2" stroke-linecap="round" />
        <path d="M-4 2q4 4 8 0" stroke="#10203A" stroke-width="2" stroke-linecap="round" />
        <path d="M-20 18h40v36c0 6-6 8-12 8h-16c-6 0-12-2-12-8z" fill="#F7F4EE" stroke="#F4E7C8" stroke-width="2.5" />
        <path d="M-6 18v36" stroke="#2F6BFF" stroke-width="6" />
        <path d="M8 28c6 2 8 10 4 14" stroke="#F3C7A0" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>

    <!-- 6 · a starry question over a balance -->
    <g v-else-if="name === 'open-sky'">
      <g fill="#FFE14A">
        <circle cx="22" cy="24" r="1.8" />
        <circle cx="70" cy="18" r="1.4" />
        <circle cx="340" cy="30" r="2" />
        <circle cx="20" cy="120" r="1.5" />
        <circle cx="346" cy="150" r="1.6" />
      </g>
      <path d="M214 34c32-6 58 8 58 36 0 22-16 34-32 44-8 6-12 12-12 24" stroke="#3DDCFF" stroke-width="10" stroke-linecap="round" fill="none" />
      <path d="M228 146v16" stroke="#3DDCFF" stroke-width="10" stroke-linecap="round" />
      <circle cx="228" cy="176" r="7" fill="#3DDCFF" />
      <g fill="#FFE14A">
        <circle cx="236" cy="28" r="2.4" />
        <circle cx="268" cy="42" r="2.2" />
        <circle cx="286" cy="64" r="2" />
        <circle cx="262" cy="78" r="2.4" />
        <circle cx="242" cy="96" r="1.8" />
        <circle cx="232" cy="118" r="2" />
        <circle cx="300" cy="52" r="1.6" />
      </g>
      <g transform="translate(262 70) rotate(-18)">
        <ellipse rx="16" ry="6" stroke="#FF8A1E" stroke-width="3" />
        <circle r="3.5" fill="#FFE14A" />
      </g>
      <path d="M312 40l1.6 4.4 4.6.1-3.6 2.8 1.3 4.4L312 49l-3.8 2.5 1.3-4.4-3.6-2.8 4.6-.1z" fill="#F7F4EE" />

      <g transform="translate(86 108)">
        <rect x="-4" y="-28" width="7" height="12" rx="2" fill="#3DDCFF" stroke="#F4E7C8" stroke-width="1.8" />
        <rect x="-8" y="-30" width="16" height="18" rx="4" fill="#F7F4EE" stroke="#F4E7C8" stroke-width="2" />
        <rect x="-7" y="-14" width="5" height="12" rx="1.5" fill="#E7E2D6" stroke="#F4E7C8" stroke-width="1.6" />
        <rect x="2" y="-14" width="5" height="12" rx="1.5" fill="#E7E2D6" stroke="#F4E7C8" stroke-width="1.6" />
        <circle cy="-40" r="10" fill="#F7F4EE" stroke="#F4E7C8" stroke-width="2" />
        <ellipse cy="-40" rx="6" ry="5" fill="#16324F" />
        <path d="M-16 -22l-8-22" stroke="#F7F4EE" stroke-width="3.5" stroke-linecap="round" />
        <rect x="-36" y="-52" width="20" height="14" rx="2" fill="#FF5A6A" stroke="#F4E7C8" stroke-width="2" />
      </g>
      <g transform="translate(52 132)">
        <rect width="22" height="28" rx="2" fill="#F7F4EE" stroke="#F4E7C8" stroke-width="2" />
        <path d="M4 8h14M4 14h14M4 20h10" stroke="#2F6BFF" stroke-width="1.6" />
      </g>
      <g transform="translate(78 146)">
        <path d="M0 6 L10 0 L20 6 L20 16 L10 22 L0 16 Z" fill="#7AEEFF" stroke="#F4E7C8" stroke-width="2" />
        <path d="M10 0 V22 M0 6 L20 16 M20 6 L0 16" stroke="#F4E7C8" stroke-width="1.2" />
      </g>

      <path d="M36 208h288" stroke="#2F6BFF" stroke-width="6" stroke-linecap="round" />
      <path d="M180 208l-16 26h32z" fill="#3DDCFF" stroke="#F4E7C8" stroke-width="2.5" />
      <path d="M78 200h52l-8 22H86z" fill="#0C2348" stroke="#7AEEFF" stroke-width="3" />
      <path d="M250 200h52l-8 22h-36z" fill="#0C2348" stroke="#FF8A1E" stroke-width="3" />
      <circle cx="180" cy="206" r="6" fill="#FFE14A" stroke="#F4E7C8" stroke-width="2" />

      <g transform="translate(292 168)">
        <circle r="14" fill="#2F6BFF" stroke="#F4E7C8" stroke-width="2.5" />
        <circle cx="-4" cy="-2" r="1.8" fill="#F7F4EE" />
        <circle cx="4" cy="-2" r="1.8" fill="#F7F4EE" />
        <path d="M10 -16c8-8 16 0 8 8" stroke="#FF5A6A" stroke-width="3" stroke-linecap="round" fill="none" />
        <circle cx="16" cy="-4" r="2" fill="#FF5A6A" />
      </g>
      <rect x="318" y="132" width="30" height="30" rx="4" fill="#071833" stroke="#3DDCFF" stroke-width="2.5" />
      <circle cx="333" cy="147" r="7" stroke="#FFE14A" stroke-width="1.8" fill="none" />
      <circle cx="333" cy="147" r="2.2" fill="#FF5A6A" />
      <path d="M333 132v30M318 147h30" stroke="#1E4D86" stroke-width="1.2" />
    </g>

    <!-- story 2 · one head, two halves, one body -->
    <g v-else-if="name === 'split-head'">
      <g fill="#FFE14A">
        <circle cx="30" cy="28" r="1.8" />
        <circle cx="330" cy="36" r="2" />
        <circle cx="48" cy="200" r="1.5" />
        <circle cx="320" cy="190" r="1.6" />
      </g>
      <path d="M300 60l2 5.6 5.8.2-4.6 3.5 1.7 5.6L300 72l-4.9 3.2 1.7-5.6-4.6-3.5 5.8-.2z" fill="#3DDCFF" />
      <g transform="translate(300 150)">
        <ellipse rx="18" ry="6" stroke="#FF8A1E" stroke-width="3" transform="rotate(-16)" />
        <circle r="5" fill="#E8A04A" stroke="#F4E7C8" stroke-width="2" />
      </g>

      <path d="M180 36c-52 0-88 40-88 88 0 30 16 54 40 68v22h96v-22c24-14 40-38 40-68 0-48-36-88-88-88z" fill="#10284F" stroke="#F4E7C8" stroke-width="4" />
      <path d="M180 40c-28 20-40 60-36 120" stroke="#3DDCFF" stroke-width="10" opacity="0.35" />
      <path d="M180 36v178" stroke="#FFE14A" stroke-width="5" stroke-linecap="round" />
      <circle cx="140" cy="110" r="10" fill="#F7F4EE" />
      <circle cx="144" cy="110" r="5" fill="#10203A" />
      <circle cx="214" cy="108" r="10" fill="#F7F4EE" />
      <circle cx="210" cy="108" r="5" fill="#FF5A6A" />
      <path d="M124 146q16 12 32 0" stroke="#3DDCFF" stroke-width="3" stroke-linecap="round" />
      <path d="M200 150q14 6 28-6" stroke="#FF8A1E" stroke-width="3" stroke-linecap="round" />
      <rect x="156" y="214" width="48" height="22" rx="6" fill="#16325F" stroke="#F4E7C8" stroke-width="3" />
      <path d="M120 228c10 8 22 10 36 4" stroke="#7AEEFF" stroke-width="4" stroke-linecap="round" />
      <path d="M204 230c12 6 24 4 36-6" stroke="#FF8A1E" stroke-width="4" stroke-linecap="round" />
    </g>

    <!-- story 2 · claw one side, snow and a shovel the other -->
    <g v-else-if="name === 'claw-shovel'">
      <g fill="#FFE14A">
        <circle cx="26" cy="26" r="1.7" />
        <circle cx="180" cy="22" r="1.5" />
        <circle cx="340" cy="30" r="2" />
      </g>
      <path d="M40 40l2 5.4 5.6.2-4.4 3.4 1.6 5.2L40 51l-4.6 3.2 1.6-5.2-4.4-3.4 5.6-.2z" fill="#FF5A6A" />

      <rect x="22" y="58" width="148" height="120" rx="16" fill="#10284F" stroke="#FF5A6A" stroke-width="4" />
      <path d="M96 78v28" stroke="#FF8A1E" stroke-width="6" stroke-linecap="round" />
      <path d="M96 106l-26 16M96 106v22M96 106l24 14" stroke="#FF5A6A" stroke-width="6" stroke-linecap="round" />
      <circle cx="70" cy="124" r="5" fill="#FF5A6A" stroke="#F4E7C8" stroke-width="2" />
      <circle cx="96" cy="130" r="5" fill="#FF5A6A" stroke="#F4E7C8" stroke-width="2" />
      <circle cx="120" cy="122" r="5" fill="#FF5A6A" stroke="#F4E7C8" stroke-width="2" />
      <ellipse cx="52" cy="108" rx="12" ry="16" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />
      <circle cx="42" cy="96" r="5" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />
      <circle cx="52" cy="90" r="4.5" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />

      <rect x="190" y="58" width="148" height="120" rx="16" fill="#10284F" stroke="#7AEEFF" stroke-width="4" />
      <path d="M206 150c28-30 52-32 80-8 16 14 28 16 40 6v22H206z" fill="#E7F6FF" stroke="#F4E7C8" stroke-width="3" />
      <path d="M250 78v58" stroke="#FFE14A" stroke-width="5" stroke-linecap="round" />
      <path d="M232 128h40l-6 14h-28z" fill="#FFE14A" stroke="#F4E7C8" stroke-width="2.5" />
      <ellipse cx="300" cy="112" rx="11" ry="15" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />
      <circle cx="312" cy="102" r="4.5" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />
      <circle cx="304" cy="96" r="4" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />

      <g transform="translate(180 200)">
        <circle r="18" fill="#FFE14A" stroke="#F4E7C8" stroke-width="3" />
        <circle cx="-6" cy="-3" r="2.2" fill="#10203A" />
        <circle cx="6" cy="-3" r="2.2" fill="#10203A" />
        <path d="M-6 6q6 6 12 0" stroke="#10203A" stroke-width="2.4" stroke-linecap="round" />
      </g>
    </g>

    <!-- story 2 · one skull, the bridge cut -->
    <g v-else-if="name === 'cut-bridge'">
      <g fill="#3DDCFF">
        <circle cx="32" cy="32" r="1.7" />
        <circle cx="328" cy="28" r="2" />
        <circle cx="40" cy="210" r="1.5" />
        <circle cx="330" cy="200" r="1.6" />
      </g>
      <path d="M300 52l2 5.5 5.6.2-4.4 3.4 1.6 5.4L300 63.4 295.4 67l1.6-5.4-4.4-3.4 5.6-.2z" fill="#FFE14A" />

      <path d="M70 120a110 78 0 0 1 220 0v36H70z" fill="#10284F" stroke="#F4E7C8" stroke-width="4" />
      <path d="M180 58v150" stroke="#071833" stroke-width="8" />
      <circle cx="124" cy="118" r="28" fill="#16325F" stroke="#3DDCFF" stroke-width="4" />
      <circle cx="236" cy="118" r="28" fill="#16325F" stroke="#FF8A1E" stroke-width="4" />
      <circle cx="114" cy="114" r="4" fill="#7AEEFF" />
      <circle cx="246" cy="114" r="4" fill="#FFE14A" />
      <rect x="156" y="108" width="48" height="20" rx="8" fill="#3DDCFF" stroke="#F4E7C8" stroke-width="3" />
      <g transform="translate(180 108) rotate(-38)" fill="none" stroke="#FF5A6A" stroke-width="3.5" stroke-linecap="round">
        <circle cx="-14" cy="10" r="8" />
        <circle cx="-14" cy="-10" r="8" />
        <path d="M-6 6 L26 -2" />
        <path d="M-6 -6 L26 2" />
      </g>
      <path d="M96 150h18M108 146v10" stroke="#FFE14A" stroke-width="3" stroke-linecap="round" />
      <path d="M250 154h14" stroke="#FF8A1E" stroke-width="3" stroke-linecap="round" opacity="0.4" />
    </g>

    <!-- story 2 · the hand has chosen; the mouth explains later -->
    <g v-else-if="name === 'hand-mouth'">
      <g fill="#FFE14A">
        <circle cx="24" cy="30" r="1.7" />
        <circle cx="340" cy="26" r="1.8" />
        <circle cx="180" cy="24" r="1.4" />
      </g>
      <ellipse cx="58" cy="108" rx="16" ry="22" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3.5" />
      <circle cx="44" cy="92" r="7" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />
      <circle cx="56" cy="82" r="6" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />
      <circle cx="68" cy="88" r="6" fill="#F7F4EE" stroke="#E7D7B0" stroke-width="3" />
      <circle cx="86" cy="112" r="14" fill="#FFE14A" stroke="#F4E7C8" stroke-width="3" />
      <circle cx="82" cy="108" r="2" fill="#10203A" />
      <circle cx="90" cy="108" r="2" fill="#10203A" />
      <path d="M82 116q4 4 8 0" stroke="#10203A" stroke-width="1.8" stroke-linecap="round" />

      <g fill="#3DDCFF">
        <circle cx="120" cy="130" r="3" />
        <circle cx="140" cy="122" r="3" />
        <circle cx="160" cy="116" r="3" />
        <circle cx="180" cy="112" r="3" />
      </g>

      <g transform="translate(250 120)">
        <circle r="28" fill="#2F6BFF" stroke="#F4E7C8" stroke-width="3.5" />
        <circle cx="-8" cy="-4" r="3" fill="#F7F4EE" />
        <circle cx="8" cy="-4" r="3" fill="#F7F4EE" />
        <ellipse cy="10" rx="8" ry="5" fill="#10203A" />
        <path d="M36 -10h46v36h-40l-10 10v-10h-6z" fill="#071833" stroke="#F4E7C8" stroke-width="3" />
      </g>
      <path d="M40 190h120" stroke="#FF8A1E" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10" />
    </g>

    <!-- story 2 · a scale that does not settle -->
    <g v-else-if="name === 'unsettled'">
      <g fill="#FFE14A">
        <circle cx="28" cy="26" r="1.8" />
        <circle cx="340" cy="32" r="2" />
        <circle cx="60" cy="48" r="1.4" />
        <circle cx="300" cy="56" r="1.5" />
      </g>
      <path d="M48 40l2 5.4 5.6.2-4.4 3.4 1.6 5.4L48 51.2 43.4 55l1.6-5.4-4.4-3.4 5.6-.2z" fill="#3DDCFF" />

      <path d="M168 70v110" stroke="#F4E7C8" stroke-width="6" stroke-linecap="round" />
      <path d="M136 180h64" stroke="#F4E7C8" stroke-width="6" stroke-linecap="round" />
      <path d="M48 118 L300 86" stroke="#3DDCFF" stroke-width="6" stroke-linecap="round" />
      <path d="M48 118l-18 26h36z" fill="#7AEEFF" stroke="#F4E7C8" stroke-width="3" />
      <path d="M300 86l-18 22h36z" fill="#FF8A1E" stroke="#F4E7C8" stroke-width="3" />
      <path d="M48 96v28" stroke="#FFE14A" stroke-width="5" stroke-linecap="round" />
      <path d="M34 118h28l-5 12H39z" fill="#FFE14A" stroke="#F4E7C8" stroke-width="2.5" />
      <path d="M292 70a14 14 0 1 1-6 24" stroke="#FF5A6A" stroke-width="4" stroke-linecap="round" />
      <circle cx="278" cy="98" r="2.2" fill="#FF5A6A" />

      <g transform="translate(168 150)">
        <circle r="16" fill="#FFE14A" stroke="#F4E7C8" stroke-width="3" />
        <circle cx="-5" cy="-2" r="2" fill="#10203A" />
        <circle cx="5" cy="-2" r="2" fill="#10203A" />
        <path d="M-4 5q4 3 8 0" stroke="#10203A" stroke-width="2" stroke-linecap="round" />
        <path d="M14 -4c10-2 14 6 8 12" stroke="#F4E7C8" stroke-width="3" stroke-linecap="round" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.fs-art {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
