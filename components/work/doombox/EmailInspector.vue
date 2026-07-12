<script setup lang="ts">
import type { Specimen } from '~/utils/doombox/emails'

// The point-and-click layer — the actual eLearning. On a hit the game
// freezes and this opens: the learner reads the rendered email, then answers
// "what gave it away?". Correct neutralises the threat; wrong gives feedback
// and lets them try again (no soft-lock). Closing without solving lets them
// walk away and come back.
const props = defineProps<{ specimen: Specimen }>()
const emit = defineEmits<{ (e: 'correct'): void; (e: 'wrong'): void; (e: 'close'): void }>()

const picked = ref<number | null>(null)
const solved = ref(false)

function choose(i: number) {
  if (solved.value) return
  picked.value = i
  if (i === props.specimen.answer) {
    solved.value = true
    emit('correct')
  } else {
    emit('wrong')
  }
}

const wrong = computed(() => picked.value !== null && !solved.value)
</script>

<template>
  <div class="db-inspect" role="dialog" aria-modal="true" aria-label="Inspect threat">
    <div class="db-inspect__panel">
      <header class="db-inspect__scanhead">
        <span class="db-inspect__tag" :class="`db-inspect__tag--${specimen.kind}`">
          {{ specimen.kind === 'virus' ? 'VIRUS' : 'SPAM' }} DETECTED
        </span>
        <button class="db-inspect__x" type="button" aria-label="Back to server" @click="emit('close')">✕</button>
      </header>

      <!-- the rendered email under inspection -->
      <article class="db-mail">
        <div class="db-mail__row">
          <span class="db-mail__label">From</span>
          <span class="db-mail__val">
            {{ specimen.from }} <span class="db-mail__addr">&lt;{{ specimen.fromAddr }}&gt;</span>
          </span>
        </div>
        <div class="db-mail__row">
          <span class="db-mail__label">Subject</span>
          <span class="db-mail__val db-mail__val--subject">{{ specimen.subject }}</span>
        </div>
        <div class="db-mail__body">
          <p v-for="(p, i) in specimen.body" :key="i">{{ p }}</p>
          <a v-if="specimen.cta" class="db-mail__cta" href="#" @click.prevent>
            {{ specimen.cta.text }}
            <span class="db-mail__href">→ {{ specimen.cta.href }}</span>
          </a>
          <div v-if="specimen.attachment" class="db-mail__attach">
            📎 {{ specimen.attachment.name }}
          </div>
        </div>
      </article>

      <!-- the puzzle -->
      <div class="db-quiz">
        <p class="db-quiz__q">{{ specimen.question }}</p>
        <button
          v-for="(c, i) in specimen.choices"
          :key="i"
          class="db-quiz__opt"
          :class="{
            'db-quiz__opt--right': solved && i === specimen.answer,
            'db-quiz__opt--wrong': picked === i && i !== specimen.answer
          }"
          :disabled="solved"
          type="button"
          @click="choose(i)"
        >
          {{ c }}
        </button>

        <p v-if="wrong" class="db-quiz__fb db-quiz__fb--no">Not the clearest tell — look again and try another.</p>
        <transition name="db-fade">
          <div v-if="solved" class="db-quiz__solved">
            <p class="db-quiz__fb db-quiz__fb--yes">Neutralised.</p>
            <p class="db-quiz__lesson">{{ specimen.giveaway }}</p>
            <button class="db-quiz__go" type="button" @click="emit('close')">Back to the server ▸</button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.db-inspect {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 6, 11, 0.82);
  backdrop-filter: blur(3px);
  font-family: 'Space Grotesk', sans-serif;
}
.db-inspect__panel {
  width: min(560px, 100%);
  max-height: 92%;
  overflow-y: auto;
  background: #0d1322;
  border: 1px solid rgba(124, 77, 255, 0.4);
  border-radius: 8px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(124, 77, 255, 0.15);
}
.db-inspect__scanhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(124, 77, 255, 0.2);
}
.db-inspect__tag {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  padding: 6px 9px;
  border-radius: 3px;
}
.db-inspect__tag--spam {
  color: #39ff88;
  background: rgba(57, 255, 136, 0.12);
}
.db-inspect__tag--virus {
  color: #ff3b5c;
  background: rgba(255, 59, 92, 0.12);
}
.db-inspect__x {
  background: transparent;
  border: 0;
  color: #8792ab;
  font-size: 16px;
  cursor: pointer;
}

/* the email */
.db-mail {
  margin: 16px;
  background: #f6f4ee;
  color: #1d2333;
  border-radius: 6px;
  padding: 14px 16px;
}
.db-mail__row {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px solid #e3ded2;
  font-size: 13.5px;
}
.db-mail__label {
  flex: 0 0 58px;
  color: #8a8676;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding-top: 2px;
}
.db-mail__val {
  color: #2a3040;
}
.db-mail__addr {
  color: #9a5522;
  font-family: monospace;
  font-size: 12px;
}
.db-mail__val--subject {
  font-weight: 600;
}
.db-mail__body {
  padding-top: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #333a4a;
}
.db-mail__body p {
  margin: 0 0 10px;
}
.db-mail__cta {
  display: inline-block;
  margin: 4px 0 6px;
  padding: 9px 16px;
  background: #2f6fed;
  color: #fff;
  border-radius: 5px;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}
.db-mail__href {
  display: block;
  margin-top: 4px;
  font-family: monospace;
  font-size: 11px;
  color: #cfe0ff;
  font-weight: 400;
}
.db-mail__attach {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 12px;
  background: #ece7d8;
  border: 1px solid #cfc7b2;
  border-radius: 5px;
  font-family: monospace;
  font-size: 13px;
  color: #5a4a2a;
}

/* the quiz */
.db-quiz {
  padding: 4px 16px 18px;
}
.db-quiz__q {
  margin: 0 0 12px;
  font-size: 14.5px;
  color: #e8ecf5;
  font-weight: 500;
}
.db-quiz__opt {
  display: block;
  width: 100%;
  text-align: left;
  margin: 0 0 8px;
  padding: 11px 13px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(135, 146, 171, 0.28);
  border-radius: 5px;
  color: #c3cadb;
  font-size: 13.5px;
  line-height: 1.4;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.db-quiz__opt:hover:not(:disabled) {
  border-color: rgba(124, 77, 255, 0.7);
  background: rgba(124, 77, 255, 0.08);
}
.db-quiz__opt--right {
  border-color: #39ff88;
  background: rgba(57, 255, 136, 0.12);
  color: #d6ffe7;
}
.db-quiz__opt--wrong {
  border-color: #ff3b5c;
  background: rgba(255, 59, 92, 0.1);
  color: #ffd6dd;
}
.db-quiz__fb {
  margin: 6px 0 0;
  font-size: 13px;
}
.db-quiz__fb--no {
  color: #ff8ea0;
}
.db-quiz__fb--yes {
  color: #39ff88;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
}
.db-quiz__solved {
  margin-top: 10px;
  padding: 12px;
  border: 1px solid rgba(57, 255, 136, 0.3);
  border-radius: 6px;
  background: rgba(57, 255, 136, 0.05);
}
.db-quiz__lesson {
  margin: 8px 0 12px;
  font-size: 13.5px;
  line-height: 1.55;
  color: #b9c2d6;
}
.db-quiz__go {
  padding: 9px 16px;
  background: #39ff88;
  color: #05221a;
  border: 0;
  border-radius: 5px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
.db-fade-enter-active {
  transition: opacity 0.3s ease;
}
.db-fade-enter-from {
  opacity: 0;
}
</style>
