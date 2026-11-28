<script setup lang="ts">
import { LEVELS, VERBS, FUZZY, levelOf } from '~/utils/bloom'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const AUDIENCES = ['New joiners', 'Front desk associates', 'Team leads', 'Sales staff', 'Nurses']
const who = ref('')
const verb = ref('')
const what = ref('')
const condition = ref('')
const bar = ref('')
const copied = ref(false)
const saved = ref<string[]>([])

const level = computed(() => levelOf(verb.value))
const fuzzy = computed(() => FUZZY.some((f) => verb.value.trim().toLowerCase() === f || verb.value.trim().toLowerCase().startsWith(f + ' ')))
const doubleVerb = computed(() => what.value.split(/\s(?:and|&|then)\s/).slice(1).some((p) => !!levelOf(p.trim().split(' ')[0] || '')))

const sentence = computed(() => {
  const parts: string[] = []
  if (condition.value.trim()) parts.push(condition.value.trim().replace(/[.,]$/, '') + ',')
  parts.push(`${who.value.trim() || '[who]'} will be able to`)
  parts.push(verb.value.trim() || '[verb]')
  parts.push(what.value.trim() || '[what]')
  let s = parts.join(' ')
  if (bar.value.trim()) s += `, ${bar.value.trim().replace(/[.]$/, '')}`
  s = s.charAt(0).toUpperCase() + s.slice(1) + '.'
  return s
})

const checks = computed(() => [
  { ok: !!who.value.trim(), label: 'Says who it is for', tip: 'Name the people, not “learners”.' },
  { ok: !!verb.value.trim() && !fuzzy.value, label: fuzzy.value ? `“${verb.value.trim()}” cannot be observed` : 'Uses a verb you can watch someone do', tip: 'Swap it for something you could see: explain, sort, fix, choose.' },
  { ok: !!what.value.trim() && !doubleVerb.value, label: doubleVerb.value ? 'Two things hiding in one objective' : 'Names one thing to do', tip: 'Split it in two. One verb per objective keeps the test honest.' },
  { ok: !!condition.value.trim(), label: 'Sets the condition', tip: 'Given what? “Given the escalation matrix”, “Without notes”.' },
  { ok: !!bar.value.trim(), label: 'Sets the bar', tip: 'How good is good enough? “9 out of 10”, “within 3 minutes”.' }
])
const score = computed(() => checks.value.filter((c) => c.ok).length)
const ready = computed(() => score.value === 5)

function example() {
  who.value = 'New front desk associates'
  verb.value = 'prioritise'
  what.value = 'guest complaints by urgency'
  condition.value = 'Given five real complaint emails'
  bar.value = 'matching the duty manager’s order for at least four of them'
}
function clear() { who.value = verb.value = what.value = condition.value = bar.value = '' }
async function copy() {
  try { await navigator.clipboard.writeText(sentence.value); copied.value = true; setTimeout(() => (copied.value = false), 1600) } catch { /* ignore */ }
}
function keep() {
  if (!saved.value.includes(sentence.value)) saved.value.unshift(sentence.value)
  saved.value = saved.value.slice(0, 12)
  localStorage.setItem('et-aim', JSON.stringify(saved.value))
}
function drop(i: number) { saved.value.splice(i, 1); localStorage.setItem('et-aim', JSON.stringify(saved.value)) }
onMounted(() => { try { saved.value = JSON.parse(localStorage.getItem('et-aim') || '[]') } catch { /* ignore */ } })
</script>

<template>
  <BrandAppShell id="aim">
    <div class="fx-grid fx-grid--split">
      <form class="fx-panel" @submit.prevent="keep">
        <div class="fx-field">
          <label class="fx-label" for="aim-who">01 · Who is it for</label>
          <input id="aim-who" v-model="who" class="fx-input" placeholder="New joiners in housekeeping" autocomplete="off">
          <div class="fx-chips aim__presets">
            <button v-for="a in AUDIENCES" :key="a" type="button" class="fx-chip" :aria-pressed="who === a" @click="who = a">{{ a }}</button>
          </div>
        </div>
        <div class="fx-field">
          <span id="aim-verb-l" class="fx-label">02 · The verb (pick one, or type your own)</span>
          <div class="aim__ladder" role="group" aria-labelledby="aim-verb-l">
            <div v-for="(l, i) in [...LEVELS].reverse()" :key="l" class="aim__rung" :class="{ 'is-on': level === l }">
              <span class="aim__rung-name br-meta">{{ 6 - i }} {{ l }}</span>
              <div class="fx-chips">
                <button v-for="v in VERBS[l]" :key="v" type="button" class="fx-chip fx-chip--s" :aria-pressed="verb === v" @click="verb = v">{{ v }}</button>
              </div>
            </div>
          </div>
          <input v-model="verb" class="fx-input" aria-label="Verb" placeholder="or type a verb">
        </div>
        <div class="fx-field">
          <label class="fx-label" for="aim-what">03 · Do what</label>
          <input id="aim-what" v-model="what" class="fx-input" placeholder="guest complaints by urgency">
        </div>
        <div class="fx-field">
          <label class="fx-label" for="aim-cond">04 · Under what condition</label>
          <input id="aim-cond" v-model="condition" class="fx-input" placeholder="Given five real complaint emails">
        </div>
        <div class="fx-field">
          <label class="fx-label" for="aim-bar">05 · How well</label>
          <input id="aim-bar" v-model="bar" class="fx-input" placeholder="with at least four in the right order">
        </div>
        <div class="fx-row">
          <button type="button" class="fx-btn fx-btn--ghost" @click="example">Try an example</button>
          <button type="button" class="fx-btn fx-btn--ghost" @click="clear">Clear</button>
        </div>
      </form>

      <div class="fx-panel--sticky">
        <div class="fx-stage aim__out" :class="{ 'is-ready': ready }">
          <div class="aim__meter br-meta" aria-live="polite">
            <span>{{ score }}/5 checks</span>
            <span v-if="level">Bloom · {{ level }}</span>
            <span v-else-if="fuzzy" class="aim__warn">Not measurable</span>
          </div>
          <div class="aim__bar"><i v-for="n in 5" :key="n" :class="{ on: n <= score }" /></div>
          <p class="aim__sentence">{{ sentence }}</p>
          <ul class="aim__checks">
            <li v-for="c in checks" :key="c.label" :class="{ ok: c.ok }">
              <span class="aim__tick" aria-hidden="true">{{ c.ok ? '✓' : '·' }}</span>
              <span><b>{{ c.label }}</b><small v-if="!c.ok">{{ c.tip }}</small></span>
            </li>
          </ul>
          <div class="fx-row">
            <button type="button" class="fx-btn fx-btn--sun" :disabled="!ready" @click="copy">{{ copied ? 'Copied' : 'Copy objective' }}</button>
            <button type="button" class="fx-btn fx-btn--ghost" :disabled="!ready" @click="keep">Keep it</button>
          </div>
        </div>
        <div class="aim__saved">
          <h2 class="fx-label">Kept objectives · stays in this browser</h2>
          <p v-if="!saved.length" class="fx-empty">Nothing kept yet. Write one that passes all five checks, then keep it here.</p>
          <ol v-else>
            <li v-for="(s, i) in saved" :key="s"><span>{{ s }}</span><button type="button" class="aim__drop" :aria-label="`Remove objective ${i + 1}`" @click="drop(i)">×</button></li>
          </ol>
        </div>
      </div>
    </div>
  </BrandAppShell>
</template>

<style scoped>
.aim__presets { margin-top: 10px; }
.aim__ladder { display: grid; gap: 4px; margin-bottom: 10px; }
.aim__rung { display: grid; grid-template-columns: 110px 1fr; gap: 10px; align-items: start; padding: 8px 10px; border-radius: 10px; transition: background-color .3s; }
.aim__rung.is-on { background: color-mix(in srgb, var(--br-sun) 45%, transparent); }
.aim__rung-name { padding-top: 10px; color: var(--gray-500); }
.aim__rung.is-on .aim__rung-name { color: var(--ink); }
.fx-chip--s { font-size: 13px; padding: 7px 10px; min-height: 32px; }
@media (max-width: 560px) { .aim__rung { grid-template-columns: 1fr; gap: 4px; } .aim__rung-name { padding-top: 0; } }
.aim__out { min-height: 420px; transition: background-color .6s var(--br-ease), color .6s; }
.aim__out.is-ready { background: var(--br-sun); color: var(--br-ink); }
.aim__meter { display: flex; gap: 18px; flex-wrap: wrap; }
.aim__warn { color: var(--br-ember); }
.aim__bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin: 12px 0 28px; }
.aim__bar i { height: 4px; border-radius: 2px; background: color-mix(in srgb, currentColor 22%, transparent); transition: background-color .4s; }
.aim__bar i.on { background: var(--br-sun); }
.aim__out.is-ready .aim__bar i.on { background: var(--br-ink); }
.aim__sentence { font: 400 clamp(26px, 2.8vw, 42px)/1.15 var(--font-display); font-variation-settings: "opsz" 144, "SOFT" 30; letter-spacing: -.02em; margin: 0 0 28px; min-height: 3.5em; }
.aim__checks { list-style: none; padding: 0; margin: 0 0 28px; display: grid; gap: 10px; }
.aim__checks li { display: flex; gap: 12px; opacity: .75; }
.aim__checks li.ok { opacity: 1; }
.aim__checks b { font-weight: 500; display: block; }
.aim__checks small { display: block; font-size: 14px; opacity: .75; margin-top: 2px; }
.aim__tick { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; flex: none; border: 1px solid currentColor; font-size: 12px; }
.aim__checks li.ok .aim__tick { background: var(--br-sun); color: var(--br-ink); border-color: var(--br-sun); }
.aim__out.is-ready .aim__checks li.ok .aim__tick { background: var(--br-ink); color: var(--br-sun); border-color: var(--br-ink); }
.aim__saved { margin-top: 28px; }
.aim__saved ol { padding: 0; margin: 0; list-style: none; counter-reset: k; }
.aim__saved li { counter-increment: k; display: grid; grid-template-columns: 32px 1fr auto; gap: 8px; padding: 12px 0; border-bottom: 1px solid var(--line); font-family: var(--font-display); font-size: 18px; line-height: 1.35; }
.aim__saved li::before { content: counter(k, decimal-leading-zero); font: 500 11px/2 var(--font-mono); color: var(--gray-500); }
.aim__drop { background: none; border: 0; font-size: 22px; cursor: pointer; color: var(--gray-500); width: 36px; height: 36px; }
.aim__drop:hover { color: var(--ink); }
</style>
