<script setup lang="ts">
import { useInboxDefenderStore } from '~/stores/inboxDefender'
import type { ResolveEvent } from '~/utils/inboxdefender/engine'

// INBOX DEFENDER — a Missile-Command-style cyber-safety arcade, played on the
// DOOMBOX handheld. Mail rains toward the inbox; shoot the phishing/malware,
// spare the real mail. This page is the shell: it renders each screen inside
// the console LCD and maps the d-pad (aim) and A (fire) to the engine.
definePageMeta({ layout: false })

useHead({
  title: 'Inbox Defender — Entertrainer',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@300..600&display=swap'
    }
  ]
})

type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start'

const store = useInboxDefenderStore()
const game = ref<{ setDir: (d: number) => void; fire: () => void } | null>(null)
const gameKey = ref(0)
const held = reactive(new Set<Btn>())

const feedback = ref<{ detail: string; correct: boolean } | null>(null)
let fbTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => store.reset())
onBeforeUnmount(() => {
  store.reset()
  if (fbTimer) clearTimeout(fbTimer)
})

function startRun() {
  store.startRun()
  feedback.value = null
  held.clear()
  gameKey.value++
}

function applyAim() {
  if (!game.value) return
  const d = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0)
  game.value.setDir(d)
}

function onPress(btn: Btn) {
  held.add(btn)
  if (store.screen === 'title' || store.screen === 'gameover') {
    if (btn === 'a' || btn === 'start') startRun()
    return
  }
  if (store.screen === 'playing') {
    if (btn === 'a' || btn === 'b') game.value?.fire()
    else if (btn === 'start') exitToTitle()
    else if (btn === 'left' || btn === 'right') applyAim()
  }
}

function onRelease(btn: Btn) {
  held.delete(btn)
  if (store.screen === 'playing' && (btn === 'left' || btn === 'right')) applyAim()
}

function onFeedback(e: ResolveEvent) {
  feedback.value = { detail: e.item.detail, correct: e.correct }
  if (fbTimer) clearTimeout(fbTimer)
  fbTimer = setTimeout(() => (feedback.value = null), 1700)
}

function exitToTitle() {
  feedback.value = null
  held.clear()
  store.goTitle()
}
</script>

<template>
  <div class="id-module">
    <!-- debrief takes over the whole device -->
    <WorkInboxdefenderDebrief v-if="store.screen === 'debrief'" @replay="startRun" @exit="exitToTitle" />

    <template v-else>
      <WorkDoomboxConsole brand="INBOX DEFENDER" tagline="· mail security" @press="onPress" @release="onRelease">
        <WorkInboxdefenderTitleScreen v-if="store.screen === 'title'" @start="startRun" />

        <div v-else-if="store.screen === 'playing'" class="id-screen">
          <WorkInboxdefenderGameCanvas :key="gameKey" ref="game" @feedback="onFeedback" />
          <WorkInboxdefenderHud />
          <transition name="id-toast">
            <div
              v-if="feedback"
              class="id-fb"
              :class="feedback.correct ? 'id-fb--ok' : 'id-fb--no'"
            >
              <span class="id-fb__mark">{{ feedback.correct ? '✓' : '✗' }}</span>
              {{ feedback.detail }}
            </div>
          </transition>
        </div>

        <WorkInboxdefenderGameOver v-else-if="store.screen === 'gameover'" @retry="startRun" @exit="exitToTitle" />
      </WorkDoomboxConsole>
    </template>
  </div>
</template>

<style scoped>
.id-module {
  position: relative;
  min-height: 100dvh;
  background: #05060b;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}
.id-screen {
  position: relative;
  width: 100%;
  height: 100%;
}
.id-fb {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  z-index: 25;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px 10px;
  border-radius: 5px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11.5px;
  line-height: 1.35;
  backdrop-filter: blur(2px);
}
.id-fb--ok {
  background: rgba(10, 40, 26, 0.9);
  border: 1px solid rgba(57, 255, 136, 0.5);
  color: #d6ffe7;
}
.id-fb--no {
  background: rgba(45, 12, 20, 0.9);
  border: 1px solid rgba(255, 59, 92, 0.5);
  color: #ffd6dd;
}
.id-fb__mark { font-weight: 700; }
.id-toast-enter-active, .id-toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.id-toast-enter-from, .id-toast-leave-to { opacity: 0; transform: translateY(6px); }
</style>
