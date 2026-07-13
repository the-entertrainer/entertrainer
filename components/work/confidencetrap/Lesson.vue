<script setup lang="ts">
import { LESSON_SECTIONS } from '~/utils/confidenceTrap/content'
import RatingDots from './RatingDots.vue'

const store = useConfidenceTrapStore()
const emit = defineEmits<{ back: []; continue: [] }>()

function ratingFor(sectionId: string): number | null {
  return store.lessonRatings.find(r => r.sectionId === sectionId)?.rating ?? null
}

function setRating(sectionId: string, value: number) {
  store.logLessonRating(sectionId, value)
}
</script>

<template>
  <section class="ct-lesson">
    <button type="button" class="ct-back" @click="emit('back')">Back to menu</button>
    <p class="ct-lesson__kicker">Lesson</p>
    <h2 class="ct-lesson__heading">Why your brain lies to you about you</h2>

    <article v-for="section in LESSON_SECTIONS" :key="section.id" class="ct-lesson__section">
      <h3 class="ct-lesson__section-heading">{{ section.heading }}</h3>
      <p v-for="(p, i) in section.paragraphs" :key="i" class="ct-lesson__p">{{ p }}</p>
      <RatingDots
        class="ct-lesson__rating"
        :name="`rating-${section.id}`"
        :model-value="ratingFor(section.id)"
        label="How confident are you that you understood that?"
        @update:model-value="(v) => setRating(section.id, v)"
      />
    </article>

    <button type="button" class="ct-btn ct-btn--primary" @click="emit('continue')">Continue to Hands On</button>
  </section>
</template>

<style scoped>
.ct-lesson { max-width: 640rem; padding: 60rem 0; }
.ct-lesson__kicker {
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary);
  margin: 24rem 0 14rem;
}
.ct-lesson__heading {
  font-family: var(--ct-serif);
  font-size: clamp(26rem, 4vw, 34rem);
  font-weight: 600;
  color: var(--ct-graphite);
  margin-bottom: 20rem;
  max-width: 20ch;
}
.ct-lesson__section {
  padding: 36rem 0;
  border-top: 1px solid var(--ct-border);
}
.ct-lesson__section:first-of-type { border-top: none; padding-top: 8rem; }
.ct-lesson__section-heading {
  font-family: var(--ct-serif);
  font-size: 21rem;
  font-weight: 600;
  color: var(--ct-graphite);
  margin-bottom: 16rem;
}
.ct-lesson__p {
  font-family: var(--ct-sans);
  font-size: 16.5rem;
  line-height: 1.75;
  color: var(--ct-graphite);
  margin-bottom: 16rem;
  max-width: 60ch;
}
.ct-lesson__rating { margin-top: 24rem; max-width: 360rem; }
.ct-lesson .ct-btn { margin-top: 30rem; }
</style>
