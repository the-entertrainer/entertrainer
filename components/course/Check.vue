<script setup lang="ts">
import type { Question } from '~/content/course/ai'
import { useCourseStore } from '~/stores/course'

/**
 * A knowledge check.
 *
 * Rules it follows, all of which are instructional rather than technical:
 *  - You commit before you see the answer. A check that reveals as you hover
 *    is a reading exercise.
 *  - Feedback explains the wrong answers too, specifically. "Incorrect" teaches
 *    nothing; "you probably picked this because X, and here is why X does not
 *    hold" teaches something.
 *  - You cannot retry into the right answer. Once submitted, the answer stands,
 *    because guessing until green is how people convince themselves they knew.
 *  - Nothing is scored against you and nothing is sent anywhere.
 */
const props = defineProps<{ questions: Question[]; title?: string }>()
const emit = defineEmits<{ answered: [boolean] }>()
const store = useCourseStore()

const picked = reactive<Record<string, number[]>>({})
const submitted = reactive<Record<string, boolean>>({})

onMounted(() => {
  // Restore previous answers so a revisited lesson shows your working.
  for (const q of props.questions) {
    const prev = store.answers[q.id]
    if (prev) { picked[q.id] = [...prev]; submitted[q.id] = true }
  }
})

function toggle(q: Question, i: number) {
  if (submitted[q.id]) return
  const cur = picked[q.id] ?? []
  if (q.kind === 'mrq') {
    picked[q.id] = cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i]
  } else {
    picked[q.id] = [i]
  }
}

function submit(q: Question) {
  if (!picked[q.id]?.length) return
  submitted[q.id] = true
  store.answer(q.id, picked[q.id])
}

const isCorrect = (q: Question) => {
  const p = [...(picked[q.id] ?? [])].sort()
  const a = [...q.answer].sort()
  return p.length === a.length && p.every((v, i) => v === a[i])
}

/** Emitted so the lesson can require every check to be attempted. */
const allAnswered = computed(() => props.questions.every(q => submitted[q.id]))
watch(allAnswered, v => emit('answered', v), { immediate: true })
</script>

<template>
  <section class="ck" :aria-label="title || 'Knowledge check'">
    <p class="t-mono ck__kicker">{{ title || 'Knowledge check' }}</p>

    <div v-for="q in questions" :key="q.id" class="ck__q">
      <p class="ck__stem">{{ q.stem }}</p>
      <p v-if="q.kind === 'mrq'" class="t-mono ck__hint">Select all that apply</p>

      <ul class="ck__opts" :role="q.kind === 'mrq' ? 'group' : 'radiogroup'">
        <li v-for="(o, i) in q.options" :key="i">
          <button
            type="button" class="ck__opt"
            :class="{
              'is-picked': picked[q.id]?.includes(i),
              'is-right': submitted[q.id] && q.answer.includes(i),
              'is-wrong': submitted[q.id] && picked[q.id]?.includes(i) && !q.answer.includes(i),
              'is-locked': submitted[q.id]
            }"
            :aria-pressed="picked[q.id]?.includes(i)"
            :disabled="submitted[q.id]"
            @click="toggle(q, i)"
          >
            <span class="ck__box" aria-hidden="true">
              <svg v-if="submitted[q.id] && q.answer.includes(i)" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              <svg v-else-if="submitted[q.id] && picked[q.id]?.includes(i)" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              <span v-else-if="picked[q.id]?.includes(i)" class="ck__dot" />
            </span>
            <span>{{ o }}</span>
          </button>
        </li>
      </ul>

      <button v-if="!submitted[q.id]" type="button" class="ticket ticket--sm ck__submit"
              :disabled="!picked[q.id]?.length" @click="submit(q)">
        Check my answer
      </button>

      <div v-else class="ck__fb" :class="isCorrect(q) ? 'is-right' : 'is-wrong'" role="status">
        <p class="t-mono ck__verdict">{{ isCorrect(q) ? 'Correct' : 'Not quite' }}</p>
        <p class="ck__rationale">{{ q.rationale }}</p>
        <template v-if="q.distractors">
          <p v-for="(text, idx) in q.distractors" :key="idx" class="ck__distractor">
            <b>“{{ q.options[Number(idx)] }}”</b> — {{ text }}
          </p>
        </template>
        <p class="t-mono ck__tag">{{ q.difficulty }} · {{ q.objective }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ck {
  margin: clamp(24rem, 3vw, 36rem) 0;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-l);
  background: var(--paper-2);
  padding: clamp(20rem, 2.6vw, 28rem);
}
.ck__kicker { margin: 0 0 18rem; color: var(--muted); }
.ck__q + .ck__q { margin-top: 30rem; padding-top: 26rem; border-top: var(--stroke) solid var(--line); }
.ck__stem { margin: 0 0 6rem; font-size: clamp(16rem, 1.5vw, 18.5rem); line-height: 1.45; font-weight: 600; }
.ck__hint { margin: 0 0 12rem; color: var(--muted); }

.ck__opts { list-style: none; margin: 12rem 0 0; padding: 0; display: grid; gap: 8rem; }
.ck__opt {
  display: flex; align-items: flex-start; gap: 12rem; width: 100%; text-align: left;
  padding: 13rem 15rem; border-radius: var(--radius-m);
  border: var(--stroke) solid var(--ink); background: var(--paper); color: var(--ink);
  font-family: inherit; font-size: 15rem; line-height: 1.45; cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .ck__opt:not(.is-locked):hover { background: var(--paper-3); } }
.ck__opt.is-picked { border-width: var(--stroke); }
.ck__opt.is-locked { cursor: default; }
.ck__opt.is-right { background: color-mix(in srgb, var(--green) 34%, var(--paper)); border-width: var(--stroke); }
.ck__opt.is-wrong { background: color-mix(in srgb, var(--red) 26%, var(--paper)); border-width: var(--stroke); }

.ck__box {
  flex: none; width: 22rem; height: 22rem; margin-top: 1rem;
  border: var(--stroke) solid var(--ink); border-radius: var(--radius-xs);
  display: flex; align-items: center; justify-content: center;
}
.ck__dot { width: 10rem; height: 10rem; border-radius: 2rem; background: var(--ink); }

.ck__submit { margin-top: 14rem; }

.ck__fb {
  margin-top: 14rem; padding: 15rem 16rem;
  border-radius: var(--radius-m); border: var(--stroke) solid var(--ink);
  border-left: 5rem solid var(--green);
  background: var(--paper);
}
.ck__fb.is-wrong { border-left-color: var(--red); }
.ck__verdict { margin: 0 0 8rem; }
.ck__rationale { margin: 0; font-size: 14.5rem; line-height: 1.6; }
.ck__distractor { margin: 10rem 0 0; font-size: 13.5rem; line-height: 1.55; color: var(--muted); }
.ck__distractor b { color: var(--ink); }
.ck__tag { margin: 12rem 0 0; color: var(--muted); opacity: 0.75; }
</style>
