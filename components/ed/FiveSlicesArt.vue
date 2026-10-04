<script setup lang="ts">
/**
 * Flat drawings for 5 Slices only.
 * Thick outlines, simple shapes, no type baked into the SVG.
 */
defineProps<{ name: string }>()
</script>

<template>
  <svg class="fs-art" viewBox="0 0 320 220" fill="none" aria-hidden="true">
    <!-- A region of space: bright rim, small world inside. -->
    <g v-if="name === 'shell'">
      <circle cx="160" cy="112" r="78" fill="#10284F" stroke="#F3E6C4" stroke-width="8" />
      <circle cx="160" cy="112" r="78" stroke="#3DDCFF" stroke-width="14" stroke-dasharray="18 16" />
      <circle cx="160" cy="108" r="16" fill="#FFE14A" stroke="#F3E6C4" stroke-width="6" />
      <path d="M138 132h44l-8 28h-28z" fill="#FF8C32" stroke="#F3E6C4" stroke-width="6" stroke-linejoin="round" />
      <circle cx="78" cy="48" r="10" fill="#FF6B6B" />
      <circle cx="248" cy="58" r="6" fill="#3DDCFF" />
      <circle cx="236" cy="168" r="8" fill="#FFE14A" />
    </g>

    <!-- Filled volume inside a louder outer surface. -->
    <g v-else-if="name === 'surface'">
      <circle cx="158" cy="110" r="70" fill="#10284F" stroke="#F3E6C4" stroke-width="8" />
      <g fill="#FF8C32">
        <circle cx="132" cy="86" r="9" />
        <circle cx="164" cy="78" r="8" />
        <circle cx="188" cy="98" r="9" />
        <circle cx="140" cy="116" r="8" />
        <circle cx="172" cy="122" r="9" />
        <circle cx="154" cy="146" r="7" />
      </g>
      <circle cx="158" cy="110" r="92" stroke="#FF6B6B" stroke-width="12" />
      <circle cx="250" cy="110" r="11" fill="#FFE14A" stroke="#F3E6C4" stroke-width="5" />
    </g>

    <!-- Data marks on the boundary, a simple world inside. -->
    <g v-else-if="name === 'boundary'">
      <circle cx="160" cy="112" r="84" fill="#10284F" stroke="#F3E6C4" stroke-width="8" />
      <circle cx="124" cy="86" r="16" fill="#FFE14A" stroke="#F3E6C4" stroke-width="6" />
      <path d="M92 158c28-40 52-40 72-18 16 18 36 22 64 8v22H92z" fill="#FF8C32" stroke="#F3E6C4" stroke-width="6" stroke-linejoin="round" />
      <g fill="#3DDCFF" stroke="#F3E6C4" stroke-width="4">
        <rect x="152" y="16" width="16" height="16" rx="3" />
        <rect x="228" y="40" width="16" height="16" rx="3" />
        <rect x="252" y="104" width="16" height="16" rx="3" />
        <rect x="220" y="168" width="16" height="16" rx="3" />
        <rect x="84" y="168" width="16" height="16" rx="3" />
        <rect x="52" y="104" width="16" height="16" rx="3" />
        <rect x="76" y="40" width="16" height="16" rx="3" />
      </g>
    </g>

    <!-- A screen crossed out, beside two equal descriptions. -->
    <g v-else-if="name === 'not-screen'">
      <rect x="28" y="48" width="104" height="124" rx="8" fill="#10284F" stroke="#F3E6C4" stroke-width="8" />
      <path d="M48 68l64 84M112 68L48 152" stroke="#FF6B6B" stroke-width="10" stroke-linecap="round" />
      <circle cx="196" cy="110" r="36" fill="#3DDCFF" stroke="#F3E6C4" stroke-width="8" />
      <circle cx="276" cy="110" r="36" fill="#FFE14A" stroke="#F3E6C4" stroke-width="8" />
      <path d="M196 110h80" stroke="#F3E6C4" stroke-width="8" stroke-linecap="round" />
    </g>

    <!-- A wave of quanta and a gravity well, joined. -->
    <g v-else-if="name === 'duality'">
      <path d="M28 78c16-22 24-22 40 0s24 22 40 0 24-22 40 0" stroke="#3DDCFF" stroke-width="8" stroke-linecap="round" />
      <g fill="#3DDCFF" stroke="#F3E6C4" stroke-width="4">
        <circle cx="48" cy="70" r="8" />
        <circle cx="88" cy="86" r="8" />
        <circle cx="128" cy="70" r="8" />
      </g>
      <path d="M176 64c36 8 52 36 52 72" stroke="#F3E6C4" stroke-width="8" stroke-linecap="round" />
      <path d="M168 150h128" stroke="#FF8C32" stroke-width="10" stroke-linecap="round" />
      <path d="M188 150c8-28 28-48 52-48s44 20 52 48" stroke="#FF8C32" stroke-width="8" fill="none" />
      <circle cx="240" cy="92" r="14" fill="#FFE14A" stroke="#F3E6C4" stroke-width="6" />
    </g>

    <!-- An unfinished ring: the question stays open. -->
    <g v-else-if="name === 'open-sky'">
      <path d="M92 112a68 68 0 1 1 96 60" stroke="#F3E6C4" stroke-width="12" stroke-linecap="round" />
      <path d="M188 172a68 68 0 0 1-12 8" stroke="#FF6B6B" stroke-width="12" stroke-linecap="round" />
      <circle cx="160" cy="112" r="22" fill="#3DDCFF" stroke="#F3E6C4" stroke-width="6" />
      <circle cx="64" cy="52" r="8" fill="#FFE14A" />
      <circle cx="250" cy="64" r="6" fill="#FF8C32" />
      <path d="M48 188h224" stroke="#F3E6C4" stroke-width="8" stroke-linecap="round" />
    </g>

    <!-- One head, a seam down the middle. -->
    <g v-else-if="name === 'split-head'">
      <path d="M160 36c-48 0-80 36-80 80 0 28 14 50 36 64v16h88v-16c22-14 36-36 36-64 0-44-32-80-80-80z" fill="#10284F" stroke="#F3E6C4" stroke-width="8" stroke-linejoin="round" />
      <path d="M160 36v160" stroke="#FFE14A" stroke-width="8" stroke-linecap="round" />
      <path d="M100 100h40" stroke="#3DDCFF" stroke-width="8" stroke-linecap="round" />
      <circle cx="204" cy="100" r="10" fill="#FF8C32" stroke="#F3E6C4" stroke-width="5" />
      <path d="M124 168c12 10 24 14 36 14s24-4 36-14" stroke="#F3E6C4" stroke-width="6" stroke-linecap="round" />
    </g>

    <!-- Claw one side, snow and a shovel the other, two hands. -->
    <g v-else-if="name === 'claw-shovel'">
      <path d="M36 150c20-8 36-8 52 0 14 8 28 8 44-2" stroke="#F7F7F5" stroke-width="8" stroke-linecap="round" />
      <path d="M48 150l8 28M78 146l4 32M108 150l-2 28" stroke="#F7F7F5" stroke-width="8" stroke-linecap="round" />
      <path d="M54 70c18 8 22 28 10 40" stroke="#FF6B6B" stroke-width="8" stroke-linecap="round" />
      <path d="M70 108c-16 6-28 2-34-8M78 112c8 14 6 26-4 34M86 104c16 4 28 0 34-12" stroke="#FF6B6B" stroke-width="8" stroke-linecap="round" />
      <path d="M210 48v92" stroke="#FFE14A" stroke-width="8" stroke-linecap="round" />
      <path d="M188 132h48l-8 16h-32z" fill="#FFE14A" stroke="#F3E6C4" stroke-width="6" stroke-linejoin="round" />
      <path d="M40 188c40-36 70-36 110-8 28 20 60 24 130 4" fill="#3DDCFF" stroke="#F3E6C4" stroke-width="6" stroke-linejoin="round" />
      <path d="M150 168c8-16 8-28 0-40" stroke="#F3E6C4" stroke-width="7" stroke-linecap="round" />
      <path d="M132 132c10 4 26 4 36 0" stroke="#F3E6C4" stroke-width="7" stroke-linecap="round" />
    </g>

    <!-- One skull, the bridge between halves cut. -->
    <g v-else-if="name === 'cut-bridge'">
      <path d="M64 110a96 70 0 0 1 192 0v28H64z" fill="#10284F" stroke="#F3E6C4" stroke-width="8" stroke-linejoin="round" />
      <rect x="142" y="96" width="36" height="22" rx="6" fill="#3DDCFF" stroke="#F3E6C4" stroke-width="6" />
      <path d="M148 90l28 36" stroke="#FF6B6B" stroke-width="10" stroke-linecap="round" />
      <circle cx="112" cy="108" r="16" stroke="#FFE14A" stroke-width="7" />
      <circle cx="208" cy="108" r="16" stroke="#FF8C32" stroke-width="7" />
    </g>

    <!-- The hand has already chosen. The mouth comes after. -->
    <g v-else-if="name === 'hand-mouth'">
      <path d="M40 120h36l8-20 16 28 14-36 18 48h28" stroke="#F3E6C4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="168" cy="112" r="14" fill="#FFE14A" stroke="#F3E6C4" stroke-width="6" />
      <path d="M196 96h70v48h-70z" fill="#10284F" stroke="#F3E6C4" stroke-width="8" stroke-linejoin="round" />
      <path d="M214 120h36" stroke="#FF6B6B" stroke-width="8" stroke-linecap="round" />
      <path d="M188 120h-16" stroke="#3DDCFF" stroke-width="8" stroke-linecap="round" />
      <path d="M40 168h120" stroke="#FF8C32" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 14" />
    </g>

    <!-- A scale that does not settle. -->
    <g v-else-if="name === 'unsettled'">
      <path d="M160 48v120" stroke="#F3E6C4" stroke-width="8" stroke-linecap="round" />
      <path d="M120 168h80" stroke="#F3E6C4" stroke-width="8" stroke-linecap="round" />
      <path d="M64 88h196" stroke="#F3E6C4" stroke-width="8" stroke-linecap="round" />
      <path d="M64 88l-28 36h56z" fill="#3DDCFF" stroke="#F3E6C4" stroke-width="6" stroke-linejoin="round" />
      <path d="M232 88l-28 48h64z" fill="#FF8C32" stroke="#F3E6C4" stroke-width="6" stroke-linejoin="round" />
      <circle cx="64" cy="78" r="8" fill="#FFE14A" />
      <path d="M248 64a16 16 0 1 1-8 28" stroke="#FF6B6B" stroke-width="7" stroke-linecap="round" />
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
