<script setup lang="ts">
import { readPlain, segments, KIND_LABEL, type FlagKind } from '~/utils/plain'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const SAMPLE = `In order to ensure that the guest is checked in properly, the registration card is to be filled and the ID is to be verified by the associate, after which the key card is encoded and then handed over and the guest is escorted to the lift as appropriate. Kindly do the needful prior to the arrival of the guest. Additional amenities are provided where applicable.`

const text = ref('')
const report = computed(() => readPlain(text.value))
const segs = computed(() => segments(text.value, report.value.flags))
const counts = computed(() => {
  const c: Partial<Record<FlagKind, number>> = {}
  for (const f of report.value.flags) c[f.kind] = (c[f.kind] || 0) + 1
  return c
})
const verdict = computed(() => {
  const s = report.value.score
  if (!report.value.words) return 'Waiting for text'
  if (s >= 80) return 'Clear. A new joiner will follow this.'
  if (s >= 60) return 'Mostly clear. A few snags.'
  if (s >= 40) return 'Readers will slow down here.'
  return 'People will read this twice.'
})
const focus = ref<FlagKind | null>(null)
onMounted(() => { const s = sessionStorage.getItem('et-plain'); if (s) text.value = s })
watch(text, (v) => sessionStorage.setItem('et-plain', v))
</script>

<template>
  <BrandAppShell id="plain">
    <div class="fx-grid fx-grid--split">
      <div class="fx-panel">
        <label class="fx-label" for="plain-in">Your instruction</label>
        <textarea id="plain-in" v-model="text" class="fx-text plain__in" placeholder="Paste an SOP step, an email to the team, a slide of instructions..." spellcheck="true" />
        <div class="fx-row plain__acts">
          <button type="button" class="fx-btn fx-btn--ghost" @click="text = SAMPLE; haptic(8)">Try a messy one</button>
          <button type="button" class="fx-btn fx-btn--ghost" :disabled="!text" @click="text = ''">Clear</button>
        </div>
        <p class="fx-note">Nothing is sent anywhere. Plain runs in this tab.</p>
      </div>

      <div class="fx-panel--sticky">
        <div class="fx-stage plain__stage">
          <div class="plain__score">
            <div>
              <span class="fx-label">Clarity</span>
              <span class="fx-num" aria-live="polite">{{ report.score }}</span>
            </div>
            <svg viewBox="0 0 120 64" class="plain__gauge" aria-hidden="true">
              <path d="M8 60 A52 52 0 0 1 112 60" class="plain__track" />
              <path d="M8 60 A52 52 0 0 1 112 60" class="plain__fill" pathLength="100" :style="{ strokeDashoffset: 100 - report.score }" />
            </svg>
          </div>
          <p class="plain__verdict">{{ verdict }}</p>
          <dl class="plain__stats br-meta">
            <div><dt>Words</dt><dd>{{ report.words }}</dd></div>
            <div><dt>Sentences</dt><dd>{{ report.sentences }}</dd></div>
            <div><dt>Avg length</dt><dd>{{ report.avg.toFixed(1) }}</dd></div>
            <div><dt>Reading ease</dt><dd>{{ report.ease }}</dd></div>
          </dl>
          <div class="fx-chips plain__legend">
            <button v-for="(label, k) in KIND_LABEL" :key="k" type="button" class="fx-chip plain__key" :class="`k-${k}`" :aria-pressed="focus === k" @click="focus = focus === k ? null : k">
              <i aria-hidden="true" />{{ label }} <b>{{ counts[k] || 0 }}</b>
            </button>
          </div>
        </div>

        <div class="plain__read" :class="focus ? `only-${focus}` : ''">
          <span class="fx-label">Marked up</span>
          <p v-if="!text.trim()" class="fx-empty">Paste something on the left. Flags show up here as you type.</p>
          <p v-else class="plain__text"><template v-for="(s, i) in segs" :key="i"><mark v-if="s.kind" :class="[`k-${s.kind}`, s.block ? `b-${s.block}` : '']" :title="s.note">{{ s.text }}</mark><span v-else-if="s.block" :class="`b-${s.block}`" :title="s.note">{{ s.text }}</span><template v-else>{{ s.text }}</template></template></p>
          <ol v-if="report.flags.length" class="plain__list">
            <li v-for="(f, i) in report.flags" :key="i" :class="`k-${f.kind}`">
              <span class="br-meta">{{ KIND_LABEL[f.kind] }}</span>
              <q>{{ text.slice(f.start, f.end).slice(0, 80) }}{{ f.end - f.start > 80 ? '…' : '' }}</q>
              <span>{{ f.note }}</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </BrandAppShell>
</template>

<style scoped>
.plain__in { min-height: 360px; }
.plain__acts { margin: 14px 0 10px; }
.plain__score { display: flex; justify-content: space-between; align-items: flex-end; }
.plain__score .fx-label { margin-bottom: 4px; }
.plain__gauge { width: 140px; }
.plain__track, .plain__fill { fill: none; stroke-width: 10; stroke-linecap: round; }
.plain__track { stroke: color-mix(in srgb, var(--br-paper) 15%, transparent); }
.plain__fill { stroke: var(--br-sun); stroke-dasharray: 100; transition: stroke-dashoffset .8s var(--br-ease); }
.plain__verdict { font: 400 clamp(22px, 2.2vw, 30px)/1.2 var(--font-display); margin: 14px 0 20px; }
.plain__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 0 0 20px; }
.plain__stats dt { opacity: .6; }
.plain__stats dd { margin: 4px 0 0; font: 400 24px/1 var(--font-display); letter-spacing: 0; text-transform: none; }
@media (max-width: 480px) { .plain__stats { grid-template-columns: repeat(2, 1fr); } }
.plain__key { color: var(--br-paper); border-color: color-mix(in srgb, var(--br-paper) 30%, transparent); display: inline-flex; gap: 8px; align-items: center; }
.plain__key b { font-weight: 600; }
.plain__key i { width: 10px; height: 10px; border-radius: 3px; background: var(--k); }
.plain__key[aria-pressed="true"] { background: var(--br-paper); color: var(--br-ink); }
.k-long, .k-steps { --k: #FFD43B; }
.k-passive { --k: #7FB8FF; }
.k-jargon { --k: #FF8E6B; }
.k-vague { --k: #C7A6FF; }
.plain__read { margin-top: 28px; }
.plain__text { font: 400 19px/1.75 var(--font-body, Georgia, serif); white-space: pre-wrap; margin: 0; }
.plain__text mark { background: color-mix(in srgb, var(--k) 45%, transparent); color: inherit; border-radius: 3px; padding: 0 2px; }
.plain__text .b-long, .plain__text .b-steps { text-decoration: underline wavy color-mix(in srgb, #C89200 70%, transparent); text-underline-offset: 5px; text-decoration-thickness: 1.5px; }
.plain__read[class*="only-"] mark { background: transparent; }
.only-passive mark.k-passive, .only-jargon mark.k-jargon, .only-vague mark.k-vague { background: color-mix(in srgb, var(--k) 60%, transparent) !important; }
.only-passive .b-long, .only-passive .b-steps, .only-jargon .b-long, .only-jargon .b-steps, .only-vague .b-long, .only-vague .b-steps { text-decoration: none; }
.only-long .b-steps, .only-steps .b-long { text-decoration: none; }
.plain__list { list-style: none; padding: 0; margin: 24px 0 0; counter-reset: f; }
.plain__list li { display: grid; gap: 4px; padding: 12px 0 12px 16px; border-bottom: 1px solid var(--line); border-left: 4px solid var(--k); margin-bottom: 4px; }
.plain__list q { font-family: var(--font-display); font-size: 17px; }
.plain__read.only-long .plain__list li:not(.k-long),
.plain__read.only-steps .plain__list li:not(.k-steps),
.plain__read.only-passive .plain__list li:not(.k-passive),
.plain__read.only-jargon .plain__list li:not(.k-jargon),
.plain__read.only-vague .plain__list li:not(.k-vague) { display: none; }
</style>
