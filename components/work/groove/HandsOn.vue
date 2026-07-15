<script setup lang="ts">
import Sequencer from './Sequencer.vue'
import { MATCH_PASS, TARGET_GROOVE, clonePattern, diffPattern, matchScore } from '~/utils/groove/patterns'

const store = useGrooveStore()
const emit = defineEmits<{ back: []; continue: [] }>()

const target = clonePattern(TARGET_GROOVE)
const user = ref(clonePattern(store.userPattern))
const checked = ref(false)

const liveMatch = computed(() => matchScore(user.value, target))
const livePct = computed(() => Math.round(liveMatch.value * 100))
const passed = computed(() => liveMatch.value >= MATCH_PASS)
const diff = computed(() => (checked.value ? diffPattern(user.value, target) : null))

const userSeq = ref<InstanceType<typeof Sequencer> | null>(null)

function check() {
  userSeq.value?.stop()
  checked.value = true
  store.saveGroove({ pattern: clonePattern(user.value), matchScore: liveMatch.value })
}
function keepBuilding() { checked.value = false }
</script>

<template>
  <section class="gv-screen gv-hands">
    <button type="button" class="gv-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Menu
    </button>
    <p class="gv-eyebrow">Hands on</p>
    <h2 class="gv-h2">Recreate this groove</h2>
    <p class="gv-lead gv-hands__intro">
      Here is a target beat. Play it, listen for where each drum lands, then build the same pattern
      on your own grid below. Match it closely to lock it in.
    </p>

    <div class="gv-hands__target">
      <Sequencer :model-value="target" :editable="false" :bpm="94" label="Target groove. Press play to hear it" />
    </div>

    <div class="gv-hands__yours">
      <div class="gv-hands__yours-head">
        <span class="gv-hands__yours-label">Your grid</span>
        <div class="gv-hands__meter" role="img" :aria-label="`Match: ${livePct} percent`">
          <span class="gv-hands__meter-track"><span class="gv-hands__meter-fill" :class="{ 'is-pass': passed }" :style="{ width: livePct + '%' }" /></span>
          <span class="gv-hands__meter-val" :class="{ 'is-pass': passed }">{{ livePct }}%<small>match</small></span>
        </div>
      </div>

      <Sequencer ref="userSeq" v-model="user" :bpm="94" :diff="diff" />

      <div class="gv-hands__foot">
        <template v-if="!checked">
          <button type="button" class="gv-btn gv-btn--primary" @click="check">Check my groove</button>
          <p class="gv-note">Build it by ear, or match the target grid above cell for cell.</p>
        </template>
        <template v-else-if="passed">
          <p class="gv-hands__result is-pass">Locked in at {{ livePct }} percent. Your groove matches the target.</p>
          <button type="button" class="gv-btn gv-btn--primary" @click="emit('continue')">
            Continue to Assessment
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
        </template>
        <template v-else>
          <p class="gv-hands__result">
            {{ livePct }} percent. The dashed cells are hits the target has that yours is missing;
            the faded cells are extra hits to remove.
          </p>
          <button type="button" class="gv-btn gv-btn--ghost" @click="keepBuilding">Keep building</button>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gv-hands__intro { max-width: 58ch; margin-bottom: 26rem; }
.gv-hands__target {
  background: var(--gv-panel);
  border: 1px solid var(--gv-line);
  border-radius: 14rem;
  padding: 20rem;
  margin-bottom: 22rem;
}
.gv-hands__yours {
  background: var(--gv-panel);
  border: 1px solid var(--gv-line-strong);
  border-radius: 14rem;
  padding: 20rem;
  box-shadow: 0 30rem 60rem -44rem #000;
}
.gv-hands__yours-head { display: flex; align-items: center; justify-content: space-between; gap: 16rem; margin-bottom: 16rem; }
.gv-hands__yours-label { font-family: var(--gv-display); font-weight: 700; font-size: 15rem; }
.gv-hands__meter { display: flex; align-items: center; gap: 10rem; }
.gv-hands__meter-track { width: 120rem; height: 7rem; border-radius: 999rem; background: var(--gv-slot); overflow: hidden; }
.gv-hands__meter-fill { display: block; height: 100%; border-radius: 999rem; background: var(--gv-muted); transition: width 0.25s ease, background 0.25s ease; }
.gv-hands__meter-fill.is-pass { background: var(--gv-hat); }
.gv-hands__meter-val { font-family: var(--gv-mono); font-size: 14rem; font-weight: 700; color: var(--gv-muted-strong); }
.gv-hands__meter-val small { font-size: 10rem; color: var(--gv-muted); margin-left: 3rem; }
.gv-hands__meter-val.is-pass { color: var(--gv-hat); }

.gv-hands__foot { margin-top: 20rem; display: flex; flex-direction: column; gap: 12rem; align-items: flex-start; }
.gv-hands__result { font-size: 15rem; color: var(--gv-muted-strong); max-width: 58ch; line-height: 1.5; }
.gv-hands__result.is-pass { color: var(--gv-hat); font-weight: 500; }
</style>
