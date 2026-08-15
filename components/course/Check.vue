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
const pickedText = reactive<Record<string, string>>({})
const submitted = reactive<Record<string, boolean>>({})

onMounted(() => {
  // Restore previous answers so a revisited lesson shows your working.
  for (const q of props.questions) {
    if (q.kind === 'fitb') {
      const prev = store.textAnswers[q.id]
      if (prev !== undefined) { pickedText[q.id] = prev; submitted[q.id] = true }
    } else {
      const prev = store.answers[q.id]
      if (prev) { picked[q.id] = [...prev]; submitted[q.id] = true }
    }
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
  if (q.kind === 'fitb') {
    if (!pickedText[q.id]?.trim()) return
    submitted[q.id] = true
    store.answerText(q.id, pickedText[q.id])
    return
  }
  if (!picked[q.id]?.length) return
  submitted[q.id] = true
  store.answer(q.id, picked[q.id])
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
const letter = (i: number) => String.fromCharCode(65 + i)

const isCorrect = (q: Question) => {
  if (q.kind === 'fitb') {
    const given = norm(pickedText[q.id] ?? '')
    return (q.blankAnswers ?? []).some(a => norm(a) === given)
  }
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

      <template v-if="q.kind === 'fitb'">
        <label class="sr-only" :for="`fitb-${q.id}`">Your answer</label>
        <input :id="`fitb-${q.id}`" v-model="pickedText[q.id]" type="text" class="glass-field ck__blank"
               :class="{ 'is-right': submitted[q.id] && isCorrect(q), 'is-wrong': submitted[q.id] && !isCorrect(q) }"
               :disabled="submitted[q.id]" placeholder="Type the word" autocomplete="off"
               @keydown.enter="submit(q)" />
      </template>
      <ul v-else class="ck__opts" :role="q.kind === 'mrq' ? 'group' : 'radiogroup'">
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
              <span v-else>{{ letter(i) }}</span>
            </span>
            <span>{{ o }}</span>
          </button>
        </li>
      </ul>

      <button v-if="!submitted[q.id]" type="button" class="ticket ticket--sm ck__submit"
              :disabled="q.kind === 'fitb' ? !pickedText[q.id]?.trim() : !picked[q.id]?.length" @click="submit(q)">
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
  border: none;
  border-radius: var(--radius-l);
  background: var(--co-surface, var(--paper));
  padding: clamp(20rem, 2.6vw, 28rem);
  box-shadow: var(--co-shadow, none);
}
.ck__kicker { margin: 0 0 18rem; color: var(--muted); }
.ck__q + .ck__q { margin-top: 30rem; padding-top: 26rem; border-top: var(--stroke) solid var(--line); }
.ck__stem { margin: 0 0 6rem; font-size: clamp(16rem, 1.5vw, 18.5rem); line-height: 1.45; font-weight: 600; }
.ck__hint { margin: 0 0 12rem; color: var(--muted); }

.ck__opts { list-style: none; margin: 12rem 0 0; padding: 0; display: grid; gap: 8rem; }
.ck__opt {
  display: flex; align-items: center; gap: 12rem; width: 100%; text-align: left;
  padding: 12rem 15rem; border-radius: var(--radius-m);
  border: var(--stroke) solid var(--line); background: var(--paper); color: var(--ink);
  font-family: inherit; font-size: 15rem; line-height: 1.45; cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .ck__opt:not(.is-locked):hover { border-color: var(--blue); background: var(--co-blue-tint); } }
.ck__opt.is-picked { border-color: var(--blue); background: var(--co-blue-tint); }
.ck__opt.is-picked .ck__box { background: var(--blue); color: #fff; border-color: var(--blue); }
.ck__opt.is-locked { cursor: default; }
.ck__opt.is-right { background: color-mix(in srgb, var(--green) 22%, var(--paper)); border-color: var(--green); }
.ck__opt.is-right .ck__box { background: var(--green); color: var(--on-green); border-color: var(--green); }
.ck__opt.is-wrong { background: color-mix(in srgb, var(--red) 16%, var(--paper)); border-color: var(--red); }
.ck__opt.is-wrong .ck__box { background: var(--red); color: var(--on-red); border-color: var(--red); }

.ck__box {
  flex: none; width: 26rem; height: 26rem;
  border: var(--stroke) solid var(--line); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Lato', var(--font-ui), sans-serif; font-size: 12rem; font-weight: 700; color: var(--muted);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}

.ck__blank { margin: 12rem 0 0; max-width: 320rem; font-size: 15rem; }
.ck__blank.is-right { border-color: var(--green); background: color-mix(in srgb, var(--green) 20%, var(--paper)); }
.ck__blank.is-wrong { border-color: var(--red); background: color-mix(in srgb, var(--red) 16%, var(--paper)); }

.ck__submit { margin-top: 14rem; }

.ck__fb {
  margin-top: 14rem; padding: 15rem 16rem;
  border-radius: var(--radius-m); border: none;
  border-left: 5rem solid var(--green);
  background: var(--co-surface, var(--paper));
  box-shadow: var(--co-shadow, none);
}
.ck__fb.is-wrong { border-left-color: var(--red); }
.ck__verdict { margin: 0 0 8rem; }
.ck__rationale { margin: 0; font-size: 14.5rem; line-height: 1.6; }
.ck__distractor { margin: 10rem 0 0; font-size: 13.5rem; line-height: 1.55; color: var(--muted); }
.ck__distractor b { color: var(--ink); }
.ck__tag { margin: 12rem 0 0; color: var(--muted); opacity: 0.75; }
</style>
