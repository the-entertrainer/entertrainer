<script setup lang="ts">
import Sequencer from './Sequencer.vue'
import { BACKBEATS, DOWNBEATS, GROOVES, clonePattern, emptyPattern, emptyRow } from '~/utils/groove/patterns'

const store = useGrooveStore()
const emit = defineEmits<{ back: []; continue: [] }>()

// Segment 1: place the pulse on the kick lane.
const seg1 = ref(emptyPattern())
const seg1ok = computed(() => DOWNBEATS.every(i => seg1.value.kick[i]))

// Segment 2: kick locked to four-on-the-floor, add the backbeat on snare.
const seg2 = ref({ kick: [...GROOVES.house.kick], snare: emptyRow(), hat: emptyRow() })
const seg2ok = computed(() => BACKBEATS.every(i => seg2.value.snare[i]))

// Segment 3: kick and snare locked, add hats for drive.
const seg3 = ref({ kick: [...GROOVES.house.kick], snare: [...GROOVES.house.snare], hat: emptyRow() })
const seg3hats = computed(() => seg3.value.hat.filter(Boolean).length)

// Segment 4 (signature): the same grid morphs between genres.
const morph = ref(clonePattern(GROOVES.rock))
const genre = ref<'rock' | 'house' | 'break'>('rock')
const morphSeq = ref<InstanceType<typeof Sequencer> | null>(null)
const GENRES = [
  { id: 'rock' as const, label: 'Rock' },
  { id: 'house' as const, label: 'House' },
  { id: 'break' as const, label: 'Breakbeat' }
]
function setGenre(g: 'rock' | 'house' | 'break') {
  genre.value = g
  morph.value = clonePattern(GROOVES[g])
}

onMounted(() => store.markLessonComplete())
</script>

<template>
  <section class="gv-screen gv-lesson">
    <button type="button" class="gv-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Menu
    </button>
    <p class="gv-eyebrow">Lesson</p>
    <h2 class="gv-h2 gv-lesson__title">How a groove is built</h2>

    <!-- 1: the pulse -->
    <article class="gv-seg">
      <div class="gv-seg__num">01</div>
      <div class="gv-seg__body">
        <h3 class="gv-seg__h">Start with the pulse</h3>
        <p class="gv-body">
          A bar splits into 16 steps. The four steps you would tap your foot to are the beats,
          shown as 1, 2, 3, and 4 above the grid. Put a kick on each beat. That steady thump is
          called four-on-the-floor.
        </p>
        <div class="gv-seg__seq">
          <Sequencer v-model="seg1" :lanes="['kick']" :bpm="112" />
          <p class="gv-seg__status" :class="{ 'is-ok': seg1ok }" role="status">
            {{ seg1ok ? 'Four-on-the-floor. Press play and you have a pulse.' : `Kicks on beats: ${DOWNBEATS.filter(i => seg1.kick[i]).length} of 4.` }}
          </p>
        </div>
      </div>
    </article>

    <!-- 2: the backbeat -->
    <article class="gv-seg">
      <div class="gv-seg__num">02</div>
      <div class="gv-seg__body">
        <h3 class="gv-seg__h">Add the backbeat</h3>
        <p class="gv-body">
          The kick is locked in now. The snare on beats 2 and 4 is the backbeat, the hit that makes
          people nod. Place a snare on the second and fourth beats and play it.
        </p>
        <div class="gv-seg__seq">
          <Sequencer v-model="seg2" :lanes="['kick', 'snare']" :editable-lanes="['snare']" :bpm="112" />
          <p class="gv-seg__status" :class="{ 'is-ok': seg2ok }" role="status">
            {{ seg2ok ? 'That is a backbeat. Kick and snare already sound like a song.' : 'Place a snare on beat 2 and beat 4.' }}
          </p>
        </div>
      </div>
    </article>

    <!-- 3: the hats -->
    <article class="gv-seg">
      <div class="gv-seg__num">03</div>
      <div class="gv-seg__body">
        <h3 class="gv-seg__h">Fill in the hats</h3>
        <p class="gv-body">
          Hats sit between the beats and set the speed you feel. Sparse hats feel loose; hats on
          every step feel driving. Add a few and hear the groove push forward.
        </p>
        <div class="gv-seg__seq">
          <Sequencer v-model="seg3" :editable-lanes="['hat']" :bpm="112" />
          <p class="gv-seg__status" :class="{ 'is-ok': seg3hats >= 8 }" role="status">
            {{ seg3hats === 0 ? 'Add hats to the top lane.' : seg3hats >= 8 ? 'Busy hats, plenty of drive. That is a full groove.' : `${seg3hats} hats placed. Keep going for more drive.` }}
          </p>
        </div>
      </div>
    </article>

    <!-- 4: placement is everything (signature) -->
    <article class="gv-seg gv-seg--signature">
      <div class="gv-seg__num">04</div>
      <div class="gv-seg__body">
        <h3 class="gv-seg__h">Placement is the whole trick</h3>
        <p class="gv-body">
          Here is the idea the rest of music production is built on. These three genres use the same
          kick, snare, and hat. Nothing changes but where the hits land. Switch between them and
          play each one.
        </p>
        <div class="gv-morph">
          <div class="gv-morph__tabs" role="tablist" aria-label="Genre">
            <button
              v-for="g in GENRES"
              :key="g.id"
              type="button"
              role="tab"
              :aria-selected="genre === g.id"
              class="gv-morph__tab"
              :class="{ 'is-active': genre === g.id }"
              @click="setGenre(g.id)"
            >{{ g.label }}</button>
          </div>
          <Sequencer ref="morphSeq" v-model="morph" :editable="false" :bpm="120" :label="genre + ': same sounds, moved'" />
        </div>
      </div>
    </article>

    <div class="gv-lesson__actions">
      <button type="button" class="gv-btn gv-btn--primary" @click="emit('continue')">
        Build one yourself
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.gv-lesson__title { max-width: 20ch; margin-bottom: 12rem; }
.gv-seg { display: grid; grid-template-columns: 44rem 1fr; gap: 12rem; padding: 34rem 0; border-top: 1px solid var(--gv-line); }
.gv-seg:first-of-type { border-top: none; }
.gv-seg__num { font-family: var(--gv-mono); font-size: 14rem; color: var(--gv-accent); padding-top: 4rem; }
.gv-seg__h { font-family: var(--gv-display); font-weight: 800; font-size: 21rem; margin-bottom: 12rem; }
.gv-body { max-width: 62ch; margin-bottom: 4rem; }
.gv-seg__seq {
  margin-top: 20rem;
  background: var(--gv-panel);
  border: 1px solid var(--gv-line);
  border-radius: 14rem;
  padding: 20rem;
}
.gv-seg__status { margin-top: 16rem; font-family: var(--gv-mono); font-size: 12.5rem; color: var(--gv-muted); }
.gv-seg__status.is-ok { color: var(--gv-hat); }

.gv-seg--signature .gv-seg__seq,
.gv-morph { }
.gv-morph {
  margin-top: 20rem;
  background: var(--gv-panel);
  border: 1px solid var(--gv-line-strong);
  border-radius: 14rem;
  padding: 20rem;
}
.gv-morph__tabs { display: inline-flex; gap: 6rem; margin-bottom: 18rem; padding: 4rem; background: var(--gv-slot); border-radius: 999rem; }
.gv-morph__tab {
  padding: 8rem 18rem; border-radius: 999rem;
  font-family: var(--gv-display); font-weight: 700; font-size: 13.5rem;
  color: var(--gv-muted); transition: color 0.14s ease, background 0.14s ease;
}
.gv-morph__tab.is-active { background: var(--gv-accent); color: var(--gv-bg); }
.gv-morph__tab:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; }

.gv-lesson__actions { margin-top: 24rem; padding-top: 30rem; border-top: 1px solid var(--gv-line); }

@media (max-width: 640px) {
  .gv-seg { grid-template-columns: 1fr; gap: 4rem; }
  .gv-seg__num { padding-top: 0; }
  .gv-seg__seq, .gv-morph { padding: 16rem; }
}
</style>
