<script setup lang="ts">
import { useZeroDayStore } from '~/stores/zeroday'

// ZERO DAY — a Contra-style run-and-gun (cyber-safety reskin) played on the
// photo-real handheld. This page maps the console pad to the engine and
// switches screens inside the LCD.
definePageMeta({ layout: false })

useHead({
  title: 'Zero Day — Entertrainer',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@300..600&display=swap'
    }
  ]
})

type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start'
const store = useZeroDayStore()
const game = ref<{
  setMove: (d: number) => void
  setUp: (v: boolean) => void
  setDown: (v: boolean) => void
  setFire: (v: boolean) => void
  jump: () => void
} | null>(null)
const gameKey = ref(0)
const held = reactive(new Set<Btn>())

onMounted(() => store.reset())
onBeforeUnmount(() => store.reset())

function startRun() {
  held.clear()
  store.startRun()
  gameKey.value++
}
function applyMove() {
  game.value?.setMove((held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0))
}

function onPress(b: Btn) {
  held.add(b)
  if (store.screen === 'title' || store.screen === 'gameover' || store.screen === 'debrief') {
    if (b === 'a' || b === 'start') startRun()
    return
  }
  // playing
  if (b === 'a') game.value?.jump()
  else if (b === 'b') game.value?.setFire(true)
  else if (b === 'up') game.value?.setUp(true)
  else if (b === 'down') game.value?.setDown(true)
  else if (b === 'left' || b === 'right') applyMove()
  else if (b === 'start') exitToTitle()
}
function onRelease(b: Btn) {
  held.delete(b)
  if (store.screen !== 'playing') return
  if (b === 'b') game.value?.setFire(false)
  else if (b === 'up') game.value?.setUp(false)
  else if (b === 'down') game.value?.setDown(false)
  else if (b === 'left' || b === 'right') applyMove()
}
function exitToTitle() {
  held.clear()
  store.goTitle()
}
</script>

<template>
  <div class="zd-module">
    <WorkZerodayPhotoConsole @press="onPress" @release="onRelease">
      <WorkZerodayTitleScreen v-if="store.screen === 'title'" @start="startRun" />

      <div v-else-if="store.screen === 'playing'" class="zd-screen">
        <WorkZerodayGameCanvas :key="gameKey" ref="game" />
        <WorkZerodayHud />
      </div>

      <WorkZerodayDebrief v-else-if="store.screen === 'debrief'" @replay="startRun" @exit="exitToTitle" />
      <WorkZerodayGameOver v-else-if="store.screen === 'gameover'" @retry="startRun" @exit="exitToTitle" />
    </WorkZerodayPhotoConsole>
  </div>
</template>

<style scoped>
.zd-module {
  position: relative;
  min-height: 100dvh;
  background: #050506;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}
.zd-screen { position: relative; width: 100%; height: 100%; }
</style>
