<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
import { oneEqualsTwoLesson } from '~/content/oneEqualsTwoLesson'
import LessonPlayer from '~/components/elearn/LessonPlayer.vue'

useSeoMeta({
  title: `${oneEqualsTwoLesson.title} · Lesson · Elevate`,
  description: oneEqualsTwoLesson.objective,
  ogTitle: oneEqualsTwoLesson.title,
  ogDescription: oneEqualsTwoLesson.dek,
  ogUrl: absoluteUrl('/learn/one-equals-two')
})
</script>

<template>
  <LessonPlayer :lesson="oneEqualsTwoLesson" />
</template>
