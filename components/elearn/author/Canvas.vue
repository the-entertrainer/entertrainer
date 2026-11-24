<script setup lang="ts">
import BlockCard from './BlockCard.vue'

const { lesson } = useCourseStudio()
</script>

<template>
  <div class="cs-canvas">
    <div class="cs-scroll">
      <div class="cs-lesson" data-lesson-field>
        <div class="cs-row">
          <label class="cs-label" for="lesson-title">Lesson title</label>
          <input id="lesson-title" v-model="lesson.title" class="cs-title" type="text" autocomplete="off">
        </div>
        <div class="cs-row">
          <label class="cs-label" for="lesson-objective">Learning objective</label>
          <textarea id="lesson-objective" v-model="lesson.objective" class="cs-area" rows="2" />
        </div>
        <div class="cs-row">
          <label class="cs-label" for="lesson-summary">Summary</label>
          <textarea id="lesson-summary" v-model="lesson.dek" class="cs-area" rows="2" />
        </div>
      </div>
      <p v-if="!lesson.blocks.length" class="cs-empty">This lesson has no blocks yet. Use Add block.</p>
      <BlockCard v-for="(block, index) in lesson.blocks" :key="block.id" :block="block" :index="index" />
    </div>
  </div>
</template>
