<script setup lang="ts">
import Experience from '~/experience/spiral-lab/s03/Experience'
import { SPIRAL_ITEMS, SPIRAL_ERAS } from '~/utils/spiralLabNav'
const era = SPIRAL_ERAS[2]
definePageMeta({ layout: false })
useSeoMeta({ title: `S03 — ${era.name}`, robots: 'noindex' })
</script>

<template>
  <LabFrame n="S03" :name="era.name" hint="scroll to spin">
    <LabSpiralStage :experience-class="Experience" :items="SPIRAL_ITEMS">
      <p class="note">{{ era.note }}</p>
    </LabSpiralStage>
  </LabFrame>
</template>

<style scoped>
.note {
  position: fixed;
  bottom: calc(28rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  max-width: 46ch;
  margin: 0;
  padding: 0 20rem;
  text-align: center;
  font-size: 12rem;
  line-height: 1.5;
  color: #F5EFE8;
  opacity: 0.55;
  text-shadow: 0 0 10px rgba(0,0,0,0.6);
}
</style>
