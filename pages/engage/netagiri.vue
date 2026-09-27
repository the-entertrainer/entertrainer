<script setup lang="ts">
definePageMeta({ layout: false })

import { useThemeStore } from '~/stores/theme'

useSeoMeta({
  title: 'NETAGIRI · Engage',
  description: 'Balance the pillars. Survive your term.',
  ogUrl: 'https://entertrainer.in/engage/netagiri'
})

type Side = { text: string; impact: number[] }
type Card = { id: string; character: string; title: string; text: string; left: Side; right: Side }

const DECK: Card[] = [
  { id: 'media_inflation_1', character: 'Nandini', title: 'Prime-Time Anchor', text: "Inflation hit double digits this morning, Prime Minister. I can bury the story under a debate about the opposition's historical blunders, but my network needs the exclusive broadcast rights for the cricket league.", left: { text: 'Report the actual inflation numbers.', impact: [10, 0, -15, 5] }, right: { text: 'Give her the cricket rights. Start the debate.', impact: [-10, -15, 15, -10] } },
  { id: 'bureau_files_1', character: 'Hakim', title: 'Cabinet Secretary', text: "The Supreme Court has demanded the original files on the telecom spectrum allocation. Unfortunately, the archives 'flooded' last night and the files are pulp. Do I send the wet pulp, or inform them of a tragic electrical fire?", left: { text: 'Send the wet pulp. We hide nothing.', impact: [5, 0, -15, 15] }, right: { text: 'Electrical fire. Draft a condolence tweet for the files.', impact: [-5, 0, 15, -20] } },
  { id: 'party_rally_1', character: 'Pinky', title: 'General Secretary', text: 'The rally crowd is thinning out, boss. The opposition is distributing free pressure cookers across the street. We can send the local police to seize their trucks, or announce a spontaneous cash handout right now.', left: { text: 'Send the police to seize the cookers.', impact: [-10, 0, 15, -15] }, right: { text: 'Open the treasury. Hand out cash.', impact: [15, -20, 10, -10] } },
  { id: 'coalition_budget_1', character: 'Netaji', title: 'Coalition Partner', text: 'My state needs a special economic development package of ten thousand crores. Issue the funds by tomorrow morning, or my twelve MPs are walking out of the monsoon session.', left: { text: 'Walk out. We do not negotiate with blackmailers.', impact: [10, 15, -30, 5] }, right: { text: 'Sign the package. Save the majority.', impact: [-5, -20, 20, -5] } },
  { id: 'religion_land_1', character: 'Swami Anandeshwar', title: 'Godman', text: "My ashram's tax exemption expires this week. Renew it for a decade, and my disciples will vote en masse. Let it expire, and I will declare your government cursed on live television.", left: { text: 'Pay your taxes like everyone else.', impact: [5, 10, -20, 15] }, right: { text: 'Stamp the renewal. Keep the blessing.', impact: [-5, -15, 15, -10] } },
  { id: 'tycoon_tender_1', character: 'Aditya', title: 'Industrialist', text: 'My conglomerate is bidding for the new international airport. We are quoting double the market rate, but we also fully funded your last election campaign. I expect the envelope to be opened in my favor.', left: { text: 'Award the contract to the lowest valid bidder.', impact: [10, 15, -25, 10] }, right: { text: 'Award it to Aditya. Adjust the budget.', impact: [-15, -20, 20, -15] } },
  { id: 'law_protest_1', character: 'DGP Sharma', title: 'Director General of Police', text: 'The student unions are blocking the national highway demanding employment. I have water cannons and tear gas on standby. Give the word, and the highway will be clear in twenty minutes.', left: { text: 'Let them protest peacefully. Divert traffic.', impact: [15, -5, -10, 5] }, right: { text: 'Clear the highway. Use the cannons.', impact: [-20, 5, 10, -10] } },
  { id: 'foreign_envoy_1', character: 'The Envoy', title: 'Foreign Diplomat', text: 'Prime Minister, my government is willing to lower tariffs on your agricultural exports. In return, we require you to abstain from the UN vote condemning our recent military exercises.', left: { text: 'We stand by international law. We will vote to condemn.', impact: [10, -15, -5, 15] }, right: { text: 'Abstain from the vote. Secure the tariffs.', impact: [-10, 20, 10, -5] } },
  { id: 'party_nepotism_1', character: 'Aunty', title: 'Party Treasurer', text: "Your sister's boy failed his civil services preliminary for the third time. The State Mining Corporation needs a new Managing Director anyway. I already have the rubber stamp.", left: { text: 'Tell him to study for the fourth attempt.', impact: [5, 0, -15, 10] }, right: { text: 'Appoint him. Tell him not to speak to reporters.', impact: [-10, -10, 15, -15] } },
  { id: 'bureau_bridge_1', character: 'Hakim', title: 'Cabinet Secretary', text: "The new suspension bridge collapsed before the inauguration. The contractor used inferior steel. I can arrest the contractor, but he is Netaji's brother-in-law.", left: { text: 'Arrest the contractor immediately.', impact: [15, 10, -25, 15] }, right: { text: 'Blame an unprecedented seismic event.', impact: [-20, -15, 15, -20] } },
  { id: 'media_leak_1', character: 'Nandini', title: 'Prime-Time Anchor', text: 'I received a leaked audio tape of your Defense Minister negotiating kickbacks. I can destroy the tape, but I want the first exclusive interview with you before the national elections.', left: { text: 'Run the tape. I will fire the Minister tonight.', impact: [20, 0, -25, 15] }, right: { text: 'Destroy it. You have your exclusive interview.', impact: [-15, 0, 15, -15] } },
  { id: 'tycoon_bailout_1', character: 'Aditya', title: 'Industrialist', text: "My telecom company owes the government fifty thousand crores in licensing fees. If you don't convert this debt into equity by midnight, I will declare bankruptcy and fire fifty thousand employees.", left: { text: 'Let it fail. Seize the assets.', impact: [15, 20, -20, 10] }, right: { text: 'Bail him out. Convert the debt.', impact: [-20, -25, 15, -10] } },
  { id: 'party_statue_1', character: 'Pinky', title: 'General Secretary', text: "The municipal budget has a surplus. We can upgrade the district hospital's ICU, or build a 150-foot bronze statue of our party founder right in the city center.", left: { text: 'Upgrade the ICU. Save lives.', impact: [20, -15, -10, 0] }, right: { text: 'Build the statue. Secure the legacy.', impact: [-10, -15, 20, 0] } },
  { id: 'religion_curriculum_1', character: 'Swami Anandeshwar', title: 'Godman', text: "The central education board is revising the history textbooks. Ensure my ashram's teachings are included in the mandatory syllabus, or my followers will burn the textbooks in the streets.", left: { text: 'Keep education secular. Reject the demand.', impact: [10, 0, -20, 15] }, right: { text: 'Rewrite the syllabus. Include the teachings.', impact: [-15, -5, 15, -15] } },
  { id: 'law_pil_1', character: 'Chief Justice', title: 'Supreme Court', text: 'A Public Interest Litigation challenges your new executive order bypassing parliament. Withdraw the order, or we will strike it down and hold you in contempt.', left: { text: 'Withdraw the order. Respect the court.', impact: [5, 0, -15, 20] }, right: { text: 'Ignore them. The mandate is mine.', impact: [-10, 0, 20, -25] } }
]

const GAMEOVER: Record<string, string> = {
  janta_0: 'The streets are burning. A nationwide strike has paralyzed the capital. You have been forced to resign and flee via helicopter.',
  janta_100: "You gave them everything. The state is a populist utopia, but the institutions have collapsed under mob rule. The military has stepped in 'to restore order.'",
  khazana_0: 'The treasury is empty. The IMF has taken over the national budget, and your government has defaulted. You are ousted in a vote of no confidence.',
  khazana_100: 'You hoarded wealth like a medieval king while the country starved. A massive anti-corruption crusade has thrown you into federal prison.',
  kursi_0: 'Your coalition partners walked out. Your own party members passed a leadership challenge while you were sleeping. You are a backbencher now.',
  kursi_100: "You became a tyrant. The High Command realized you were too powerful to control and orchestrated an internal coup. You have been 'retired' for health reasons.",
  kanoon_0: 'The Supreme Court has struck down your government as unconstitutional. You are facing twenty-four separate CBI probes and a lifetime ban from politics.',
  kanoon_100: 'You followed the rulebook so strictly that nothing got done. Bureaucratic gridlock paralyzed the nation, and you were historically defeated in a snap election.'
}

const FACE: Record<string, string> = {
  Nandini: '/netagiri/cast/nandini-scheme.png',
  Hakim: '/netagiri/cast/hakim-scheme.png',
  Pinky: '/netagiri/cast/pinky-scheme.png',
  Netaji: '/netagiri/cast/netaji-scheme.png',
  'Swami Anandeshwar': '/netagiri/cast/baba-scheme.png',
  Aditya: '/netagiri/cast/lalaji-scheme.png',
  'DGP Sharma': '/netagiri/cast/captain-scheme.png',
  'The Envoy': '/netagiri/cast/envoy-scheme.png',
  Aunty: '/netagiri/cast/mausi-scheme.png',
  'Chief Justice': '/netagiri/cast/justice-scheme.png'
}

const KEYS = ['Janta', 'Khazana', 'Kursi', 'Kanoon'] as const
const KEYLOW = ['janta', 'khazana', 'kursi', 'kanoon'] as const

const theme = useThemeStore()
const screen = ref<'start' | 'game' | 'over'>('start')
const stats = ref({ Janta: 50, Khazana: 50, Kursi: 50, Kanoon: 50 })
const year = ref(1)
const cur = ref<Card | null>(null)
const queue = ref<Card[]>([])
const overStory = ref('')
const drag = ref(0)
const flying = ref(0)
let dragging = false
let startX = 0

function shuffle(arr: Card[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

function meterColor(v: number) {
  if (v <= 20 || v >= 80) return 'var(--ng-red)'
  if (v <= 35 || v >= 65) return 'var(--accent)'
  return 'var(--ng-green)'
}

function drawCard() {
  if (!queue.value.length) queue.value = shuffle(DECK)
  cur.value = queue.value.pop() ?? null
  drag.value = 0
  flying.value = 0
}

function newGame() {
  stats.value = { Janta: 50, Khazana: 50, Kursi: 50, Kanoon: 50 }
  queue.value = shuffle(DECK)
  year.value = 1
  drag.value = 0
  flying.value = 0
  screen.value = 'game'
  drawCard()
}

function checkOver() {
  for (let i = 0; i < KEYS.length; i++) {
    const v = stats.value[KEYS[i]]
    if (v <= 0) return GAMEOVER[KEYLOW[i] + '_0']
    if (v >= 100) return GAMEOVER[KEYLOW[i] + '_100']
  }
  return null
}

function resolve(approve: boolean) {
  if (!cur.value || flying.value) return
  flying.value = approve ? 1 : -1
  const choice = approve ? cur.value.right : cur.value.left
  const next = { ...stats.value }
  KEYS.forEach((k, i) => {
    next[k] = Math.max(0, Math.min(100, next[k] + choice.impact[i]))
  })
  stats.value = next
  const ended = checkOver()
  window.setTimeout(() => {
    if (ended) {
      overStory.value = ended
      screen.value = 'over'
    } else {
      year.value += 1
      drawCard()
    }
  }, 280)
}

function onDown(e: PointerEvent) {
  if (flying.value) return
  dragging = true
  startX = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!dragging) return
  drag.value = e.clientX - startX
}
function onUp() {
  if (!dragging) return
  dragging = false
  if (drag.value > 90) resolve(true)
  else if (drag.value < -90) resolve(false)
  else drag.value = 0
}

const hint = computed(() => {
  const t = Math.min(Math.abs(drag.value) / 100, 1)
  return { l: drag.value < 0 ? t : 0, r: drag.value > 0 ? t : 0 }
})
const cardStyle = computed(() => {
  if (flying.value) {
    return {
      transform: `translate(${flying.value * 500}px, -40px) rotate(${flying.value * 30}deg)`,
      opacity: '0',
      transition: 'transform .35s ease, opacity .35s ease'
    }
  }
  return {
    transform: `translate(${drag.value}px, 0) rotate(${drag.value / 18}deg)`,
    transition: dragging ? 'none' : 'transform .3s ease'
  }
})
</script>

<template>
  <div class="ng" :data-theme="theme.theme">
    <NuxtLink to="/engage" class="ng__icon ng__back" aria-label="Back to Engage">
      <svg viewBox="0 0 24 24"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>
    <button type="button" class="ng__icon ng__theme" :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`" @click="theme.toggle()">
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <section v-if="screen === 'start'" class="screen">
      <h1 class="brand">NETAGIRI</h1>
      <p class="subtitle">Balance the pillars. Survive your term.</p>
      <p class="lede">You are the <b>Prime Minister</b>. Everyone wants something from you — the media, the police, the businessmen, the godmen, even your own party.<br><br>
      Swipe <b>left</b> to reject a demand. Swipe <b>right</b> to approve it. Every choice moves the country. Keep all four pillars out of the red — or your term ends, badly.</p>
      <div class="pillars">
        <span>Janta (People)</span>
        <span>Khazana (Treasury)</span>
        <span>Kursi (Power)</span>
        <span>Kanoon (Law)</span>
      </div>
      <button class="primary" type="button" @click="newGame">Take the Oath</button>
    </section>

    <section v-else-if="screen === 'game' && cur" class="screen game">
      <div class="topbar">
        <div class="year">Year {{ year }}</div>
        <div class="year mute">NETAGIRI</div>
      </div>
      <div class="meters">
        <div v-for="k in KEYS" :key="k" class="meter">
          <div class="meter-label"><span>{{ k }}</span><span>{{ stats[k] }}</span></div>
          <div class="track"><i :style="{ width: stats[k] + '%', background: meterColor(stats[k]) }" /></div>
        </div>
      </div>
      <div class="stage">
        <article class="card" :style="cardStyle" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
          <span class="hint left" :style="{ opacity: hint.l }">REJECT</span>
          <span class="hint right" :style="{ opacity: hint.r }">APPROVE</span>
          <header>
            <img class="portrait" :src="FACE[cur.character]" :alt="cur.character" />
            <strong>{{ cur.character }}</strong>
            <em>{{ cur.title }}</em>
          </header>
          <p>{{ cur.text }}</p>
        </article>
      </div>
      <div class="choices">
        <div class="side l">{{ cur.left.text }}</div>
        <div class="side r">{{ cur.right.text }}</div>
      </div>
      <div class="btns">
        <button class="swipe no" type="button" aria-label="Reject" @click="resolve(false)">✕</button>
        <button class="swipe yes" type="button" aria-label="Approve" @click="resolve(true)">✓</button>
      </div>
    </section>

    <section v-else class="screen">
      <h2 class="brand over">TERM ENDED</h2>
      <p class="cause">How it ended</p>
      <p class="story">{{ overStory }}</p>
      <p class="years">You survived {{ year }} {{ year === 1 ? 'year' : 'years' }} in power.</p>
      <button class="primary" type="button" @click="newGame">Face the Next Election</button>
    </section>
  </div>
</template>

<style scoped>
.ng {
  --ng-red: var(--danger, #C0392B);
  --ng-green: var(--green, #1FD07A);
  min-height: 100svh;
  min-height: 100dvh;
  background: radial-gradient(circle at 50% -10%, var(--paper-2), var(--paper));
  color: var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  touch-action: manipulation;
}
.ng[data-theme='dark'] {
  --ng-red: #FF6B55;
  --ng-green: #2AD98A;
}
.ng__icon {
  position: absolute; z-index: 4;
  top: max(10rem, env(safe-area-inset-top));
  width: 44rem; height: 44rem;
  display: inline-flex; align-items: center; justify-content: center;
  border: none; border-radius: 3rem;
  background: color-mix(in srgb, var(--paper) 70%, transparent);
  color: var(--ink); text-decoration: none;
}
.ng__back { left: max(10rem, env(safe-area-inset-left)); }
.ng__back svg { width: 20rem; height: 20rem; fill: none; stroke: currentColor; stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round; }
.ng__theme { right: max(10rem, env(safe-area-inset-right)); }
.ng__theme :deep(svg) { width: 18rem; height: 18rem; fill: none; stroke: currentColor; stroke-width: 1.75; }
.screen {
  width: 100%; max-width: 480rem; min-height: 100dvh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 56rem 20rem 24rem; text-align: center; gap: 16rem;
}
.screen.game { justify-content: flex-start; padding-top: calc(52rem + env(safe-area-inset-top)); }
.brand { margin: 0; font: 800 48rem/1 var(--font-display, Inter, sans-serif); letter-spacing: 0.04em; color: var(--ink); }
.brand.over { font-size: 34rem; color: var(--ng-red); }
.subtitle { margin: -8rem 0 4rem; font-size: 16rem; font-weight: 500; color: var(--muted); }
.lede { margin: 0; font-size: 15rem; line-height: 1.55; max-width: 380rem; color: var(--ink); }
.lede b { color: var(--ink); }
.pillars { display: flex; flex-wrap: wrap; gap: 8rem; justify-content: center; }
.pillars span { background: var(--paper-3); border: 1px solid var(--line); padding: 8rem 12rem; border-radius: 3rem; font-size: 13rem; }
.primary {
  margin-top: 8rem; background: var(--accent); color: var(--accent-ink);
  border: none; padding: 16rem 38rem; font: 800 16rem/1 var(--font-sans);
  letter-spacing: 0.04em; border-radius: 3rem; cursor: pointer;
}
.topbar { width: 100%; display: flex; justify-content: space-between; }
.year { font-size: 13rem; font-weight: 700; color: var(--ink); background: var(--paper-3); border: 1px solid var(--line); padding: 6rem 14rem; border-radius: 3rem; }
.year.mute { color: var(--muted); }
.meters { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8rem 12rem; }
.meter { background: var(--paper-3); border-radius: 3rem; padding: 7rem 9rem; border: 1px solid var(--line); }
.meter-label { display: flex; justify-content: space-between; font-size: 11.5rem; font-weight: 700; margin-bottom: 4rem; }
.track { height: 8rem; border-radius: 3rem; background: var(--line); overflow: hidden; }
.track i { display: block; height: 100%; transition: width .35s ease, background .35s ease; }
.stage { position: relative; width: 100%; max-width: 340rem; aspect-ratio: 3/4; margin: 6rem auto 8rem; flex: 1; }
.card {
  position: absolute; inset: 0; background: var(--paper); color: var(--ink);
  border-radius: 6rem; border: 1px solid var(--line);
  box-shadow: 0 14px 30px color-mix(in srgb, var(--ink) 12%, transparent);
  display: flex; flex-direction: column; padding: 18rem 16rem; touch-action: none; cursor: grab;
}
.card header { display: flex; flex-direction: column; align-items: center; gap: 4rem; border-bottom: 1px solid var(--line); padding-bottom: 10rem; margin-bottom: 12rem; }
.portrait { width: 88rem; height: 88rem; object-fit: cover; object-position: center top; border-radius: 3rem; background: var(--paper-3); }
.card strong { font-size: 18rem; }
.card em { font-size: 12rem; color: var(--muted); font-style: normal; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.card p { margin: 0; flex: 1; font-size: 16rem; line-height: 1.5; font-weight: 500; display: flex; align-items: center; text-align: left; }
.hint { position: absolute; top: 16rem; padding: 4rem 12rem; border: 2px solid; border-radius: 3rem; font-size: 14rem; font-weight: 800; letter-spacing: 0.08em; pointer-events: none; }
.hint.left { left: 12rem; color: var(--ng-red); border-color: var(--ng-red); transform: rotate(-12deg); }
.hint.right { right: 12rem; color: var(--ng-green); border-color: var(--ng-green); transform: rotate(12deg); }
.choices { width: 100%; display: flex; gap: 10rem; font-size: 12.5rem; font-weight: 600; color: var(--muted); }
.side { flex: 1; padding: 8rem 10rem; border-radius: 3rem; background: var(--paper-3); line-height: 1.35; }
.side.l { text-align: left; border-left: 3px solid var(--ng-red); }
.side.r { text-align: right; border-right: 3px solid var(--ng-green); }
.btns { display: flex; gap: 26rem; margin: 8rem 0; }
.swipe { width: 56rem; height: 56rem; border-radius: 3rem; border: none; font-size: 22rem; cursor: pointer; color: #fff; }
.swipe.no { background: var(--ng-red); }
.swipe.yes { background: var(--ng-green); }
.cause { margin: 0; font-size: 13rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ng-red); }
.story { margin: 0; font-size: 16rem; line-height: 1.6; max-width: 380rem; text-align: left; background: var(--paper-3); padding: 16rem 18rem; border-radius: 3rem; border: 1px solid var(--line); }
.years { margin: 0; font-size: 15rem; color: var(--muted); }
</style>
