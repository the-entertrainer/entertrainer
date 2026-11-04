<script setup lang="ts">
import { WORLD_ZONE_LINKS } from '~/composables/world/worldRoutes'

defineProps<{
  /** First-paint failure, or the mid-session line from spec §10.5. */
  notice?: string
  tierLabel?: string
}>()
</script>

<template>
  <div class="fallback">
    <svg
      class="fallback__art"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="1200" height="800" fill="#07070A" />
      <g stroke="#2F5BD8" stroke-width="1" fill="none" opacity="0.28">
        <path d="M80 720 L1120 80" />
        <path d="M80 640 L1040 80" />
        <path d="M160 720 L1120 160" />
        <path d="M80 560 L920 80" />
      </g>
      <g fill="none" stroke="#7A9AE8" stroke-width="1.25" opacity="0.55">
        <ellipse cx="600" cy="390" rx="210" ry="78" />
        <ellipse cx="600" cy="390" rx="340" ry="128" />
        <path d="M600 210 A180 180 0 0 1 790 430" />
        <path d="M600 210 A180 180 0 0 0 410 430" />
        <path d="M470 520 A150 90 0 0 0 730 520" />
      </g>
      <g fill="#2F5BD8">
        <rect x="566" y="352" width="10" height="36" />
        <rect x="582" y="332" width="10" height="56" />
        <rect x="598" y="308" width="10" height="80" />
        <rect x="614" y="284" width="10" height="104" />
        <rect x="630" y="252" width="10" height="136" />
      </g>
      <g fill="#E8E4DC">
        <circle cx="600" cy="210" r="5" />
        <circle cx="790" cy="430" r="4" />
        <circle cx="410" cy="430" r="4" />
        <circle cx="690" cy="320" r="3" />
        <circle cx="548" cy="460" r="3" />
        <circle cx="860" cy="480" r="3" />
        <circle cx="600" cy="600" r="3" opacity="0.7" />
        <circle cx="500" cy="520" r="3" opacity="0.55" />
      </g>
    </svg>

    <div class="fallback__dock">
      <p v-if="notice" class="fallback__note">{{ notice }}</p>
      <nav id="zones" class="fallback__links" aria-label="Zones">
        <a
          v-for="link in WORLD_ZONE_LINKS"
          :key="link.id"
          :href="link.route"
          :data-zone-link="link.id"
        >{{ link.label }}</a>
      </nav>
      <p v-if="tierLabel" class="fallback__tier">{{ tierLabel }}</p>
    </div>
  </div>
</template>

<style scoped>
.fallback { position: absolute; inset: 0; }
.fallback__art { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

.fallback__dock {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: max(14px, env(safe-area-inset-bottom));
  z-index: 2;
  display: grid;
  gap: 8px;
  justify-items: start;
}

.fallback__note {
  margin: 0;
  max-width: 42ch;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: #7A9AE8;
}

.fallback__links { display: flex; flex-wrap: wrap; gap: 8px; }

.fallback__links a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid rgb(232 228 220 / 0.35);
  background: rgb(7 7 10 / 0.72);
  color: #E8E4DC;
  font-size: 15px;
  text-decoration: none;
}

.fallback__links a:focus-visible {
  outline: 3px solid #7A9AE8;
  outline-offset: 3px;
}

.fallback__tier {
  margin: 4px 0 0;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7A9AE8;
}
</style>
