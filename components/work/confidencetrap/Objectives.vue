<script setup lang="ts">
const emit = defineEmits<{ continue: [] }>()
</script>

<template>
  <section class="ct-objectives">
    <p class="ct-objectives__kicker">Learning objectives</p>
    <h2 class="ct-objectives__heading">What this covers, and what it does with you</h2>
    <p class="ct-objectives__body">
      By the end of this module you will be able to explain the real mechanism behind the
      Dunning-Kruger effect, describe why expertise can lower stated confidence rather than
      raise it, and state the main scientific critique of the effect. You will also complete
      a short exercise in an unfamiliar subject that pairs a confidence estimate with a
      right-or-wrong answer.
    </p>

    <div class="ct-objectives__callout">
      <p class="ct-objectives__callout-label">How this module measures you</p>
      <p class="ct-objectives__callout-body">
        Every time you rate your own confidence in this module, that number is logged along
        with whether you were actually correct. At the end, you will see your own
        confidence-versus-accuracy plotted as a single point against the pattern researchers
        have reported. Nothing about that measurement is hidden. This paragraph is the only
        place it needs explaining, because it is the whole mechanism.
      </p>
    </div>

    <button type="button" class="ct-btn ct-btn--primary" @click="emit('continue')">Continue</button>
  </section>
</template>

<style scoped>
.ct-objectives { max-width: 640rem; padding: 90rem 0 60rem; }
.ct-objectives__kicker {
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary);
  margin-bottom: 16rem;
}
.ct-objectives__heading {
  font-family: var(--ct-serif);
  font-size: clamp(26rem, 4vw, 34rem);
  font-weight: 600;
  line-height: 1.2;
  color: var(--ct-graphite);
  margin-bottom: 24rem;
  max-width: 20ch;
}
.ct-objectives__body {
  font-family: var(--ct-sans);
  font-size: 16.5rem;
  line-height: 1.7;
  color: var(--ct-graphite);
  max-width: 58ch;
}
.ct-objectives__callout {
  margin-top: 40rem;
  padding: 26rem 28rem;
  background: var(--ct-sand);
  border: 1px solid var(--ct-border);
  border-radius: 4rem;
  max-width: 58ch;
}
.ct-objectives__callout-label {
  font-family: var(--ct-sans);
  font-weight: 600;
  font-size: 14rem;
  color: var(--ct-graphite);
  margin-bottom: 10rem;
}
.ct-objectives__callout-body {
  font-family: var(--ct-sans);
  font-size: 15rem;
  line-height: 1.65;
  color: var(--ct-secondary-on-card);
}
.ct-objectives .ct-btn { margin-top: 44rem; }
</style>
