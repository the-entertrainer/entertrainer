<script setup lang="ts">
import { useDoomboxStore } from '~/stores/doombox'
import { specimenById, type Specimen } from '~/utils/doombox/emails'

// DOOMBOX — a Doom-style FPS + point-and-click eLearning game. The learner is
// a purple antispam/antivirus officer clearing 10 threats from a live email
// server; every hit opens a spot-the-giveaway puzzle. This page is the shell:
// it switches between title / playing / debrief and bridges the engine's
// "hit" events to the inspector, pausing the game while a puzzle is open.
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

const store = useDoomboxStore()
const game = ref<{ resume: () => void; kill: (id: number) => void } | null>(null)
const gameKey = ref(0) // bump to fully remount the engine on replay
const active = ref<Specimen | null>(null) // the specimen under inspection

onMounted(() => store.reset())
onBeforeUnmount(() => store.reset())

function startSolo() {
  store.startRun('solo')
  gameKey.value++
}

function onHit(id: number) {
  // ignore a re-hit on an already-cleared threat
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

function replay() {
  store.startRun('solo')
  active.value = null
  gameKey.value++
}

function exitToTitle() {
  active.value = null
  store.goTitle()
}
</script>

<template>
  <div class="db-module">
    <!-- title -->
    <WorkDoomboxTitleScreen v-if="store.screen === 'title'" @solo="startSolo" />

    <!-- playing -->
    <div v-else-if="store.screen === 'playing'" class="db-play">
      <WorkDoomboxGameCanvas
        :key="gameKey"
        ref="game"
        @hit="onHit"
        @shoot="store.registerShot()"
      />
      <WorkDoomboxHud />
      <WorkDoomboxEmailInspector
        v-if="active"
        :specimen="active"
        @correct="onCorrect"
        @wrong="store.registerWrong()"
        @close="closeInspector"
      />
    </div>

    <!-- debrief -->
    <WorkDoomboxDebrief v-else-if="store.screen === 'debrief'" @replay="replay" @exit="exitToTitle" />
  </div>
</template>

<style scoped>
.db-module {
  position: relative;
  min-height: 100dvh;
  background: #05060b;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}
.db-play {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
}
</style>
