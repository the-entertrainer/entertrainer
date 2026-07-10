<script setup lang="ts">
// Scene 6 — THE TAKEAWAY. No demo, no quiz, no score. The idea has been
// felt, measured, explained and spotted in the wild; all that's left is to
// hand it a bigger coat. Three lines, generously spaced, and the door.
const emit = defineEmits<{ (e: 'replay'): void }>()
</script>

<template>
  <div class="takeaway">
    <p class="tn-overline">06 · The takeaway</p>

    <div class="takeaway__lines">
      <p>The same idea sounds average in one meeting and sharp in another.</p>
      <p>The same person is invisible on one team and unstoppable on the next.</p>
      <p class="takeaway__last">Before you judge the thread, look at the rug.</p>
    </div>

    <p class="tn-note takeaway__credit">
      — after Wilhelm von Bezold, who found it in actual rugs.
    </p>

    <button class="tn-btn takeaway__replay" type="button" @click="emit('replay')">
      Run it again
    </button>
  </div>
</template>

<style scoped>
.takeaway {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(28px, 6vh, 52px);
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}
.takeaway__lines {
  display: flex;
  flex-direction: column;
  gap: clamp(26px, 5.5vh, 46px);
}
.takeaway__lines p {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-weight: 350;
  font-size: clamp(19px, 2.6vw, 26px);
  line-height: 1.45;
  color: #b9b4ae;
}
.takeaway__last {
  font-style: italic;
  color: #f1ece6 !important;
}
.takeaway__credit { margin-top: -10px; }
.takeaway__replay { margin-top: 4px; }
</style>
