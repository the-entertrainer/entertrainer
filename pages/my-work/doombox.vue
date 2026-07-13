<script setup lang="ts">
import { useDoomboxStore } from '~/stores/doombox'
import { specimenById, type Specimen } from '~/utils/doombox/emails'

// DOOMBOX — a Doom-style FPS + point-and-click eLearning game, played on a
// simulated handheld console. The learner is a purple antispam/antivirus
// officer clearing 10 threats from a live email server while the threats hunt
// back. This page is the shell: it renders each screen inside the console
// LCD, maps the physical d-pad / A buttons to the engine, and bridges the
// engine's "hit" events to the point-and-click inspector.
definePageMeta({ layout: false })

useHead({
  title: 'DOOMBOX — Entertrainer',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@300..600&display=swap'
    }
  ]
})

type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start'

const store = useDoomboxStore()
const game = ref<{
  resume: () => void
  kill: (id: number) => void
  setMove: (f: number, s: number) => void
  setTurn: (t: number) => void
  fire: () => void
} | null>(null)
const gameKey = ref(0)
const active = ref<Specimen | null>(null)
const held = reactive(new Set<Btn>())

onMounted(() => store.reset())
onBeforeUnmount(() => store.reset())

function startSolo() {
  store.startRun()
  active.value = null
  held.clear()
  gameKey.value++
}

// ── console buttons → game ──
function applyDpad() {
  if (!game.value) return
  let f = 0
  if (held.has('up')) f += 1
  if (held.has('down')) f -= 1
  let t = 0
  if (held.has('left')) t -= 1
  if (held.has('right')) t += 1
  game.value.setMove(f, 0)
  game.value.setTurn(t)
}

function onPress(btn: Btn) {
  held.add(btn)
  if (store.screen === 'title') {
    if (btn === 'a' || btn === 'start') startSolo()
    return
  }
  if (store.screen === 'gameover') {
    if (btn === 'a' || btn === 'start') startSolo()
    return
  }
  if (store.screen === 'playing') {
    if (btn === 'a' || btn === 'b') game.value?.fire()
    else if (btn === 'start') exitToTitle()
    else applyDpad()
  }
}

function onRelease(btn: Btn) {
  held.delete(btn)
  if (store.screen === 'playing') applyDpad()
}

// ── engine hit → inspector ──
function onHit(id: number) {
  if (store.cleared.includes(id)) {
    game.value?.resume()
    return
  }
  active.value = specimenById(id) ?? null
  if (!active.value) game.value?.resume()
}

function onCorrect() {
  if (!active.value) return
  const id = active.value.id
  game.value?.kill(id)
  store.clearThreat(id) // flips to debrief automatically on the 10th
}

function closeInspector() {
  active.value = null
  game.value?.resume()
}

function exitToTitle() {
  active.value = null
  held.clear()
  store.goTitle()
}
</script>

<template>
  <div class="db-module">
    <!-- the debrief takes over the whole device -->
    <WorkDoomboxDebrief v-if="store.screen === 'debrief'" @replay="startSolo" @exit="exitToTitle" />

    <template v-else>
      <WorkDoomboxConsole @press="onPress" @release="onRelease">
        <!-- title -->
        <WorkDoomboxTitleScreen v-if="store.screen === 'title'" @start="startSolo" />

        <!-- playing -->
        <div v-else-if="store.screen === 'playing'" class="db-screen">
          <WorkDoomboxGameCanvas :key="gameKey" ref="game" @hit="onHit" @shoot="store.registerShot()" />
          <WorkDoomboxHud />
        </div>

        <!-- game over -->
        <WorkDoomboxGameOver v-else-if="store.screen === 'gameover'" @retry="startSolo" @exit="exitToTitle" />
      </WorkDoomboxConsole>

      <!-- the inspector overlays the whole device for readable learning -->
      <WorkDoomboxEmailInspector
        v-if="active"
        :specimen="active"
        @correct="onCorrect"
        @wrong="store.registerWrong()"
        @close="closeInspector"
      />
    </template>
  </div>
</template>

<style scoped>
.db-module {
  position: relative;
  min-height: 100dvh;
  background: #05060b;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}
.db-screen {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
