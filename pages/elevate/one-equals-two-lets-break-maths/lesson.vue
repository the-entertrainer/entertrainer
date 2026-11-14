<script setup lang="ts">
import { oneEqualsTwoLesson } from '~/content/oneEqualsTwoLesson'
import LessonPlayer from '~/components/elearn/LessonPlayer.vue'

useSeoMeta({
  title: `${oneEqualsTwoLesson.title} · Lesson · Elevate`,
  description: oneEqualsTwoLesson.objective,
  ogTitle: oneEqualsTwoLesson.title,
  ogDescription: oneEqualsTwoLesson.dek,
  ogUrl: 'https://entertrainer.in/elevate/one-equals-two-lets-break-maths/lesson'
})
</script>

<template>
  <LessonPlayer :lesson="oneEqualsTwoLesson" />
</template>
