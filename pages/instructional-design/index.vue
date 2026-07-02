<script setup lang="ts">
import { ref, computed } from 'vue'
// Inline SVG icon components — no external dependency needed
const ArrowRight  = { props: ['size'], template: `<svg :width="size||24" :height="size||24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>` }
const RotateCcw   = { props: ['size'], template: `<svg :width="size||24" :height="size||24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>` }
const Sparkles    = { props: ['size'], template: `<svg :width="size||24" :height="size||24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4M22 5h-4M15 3v2M16 4h-2"/></svg>` }
const AlertCircle = { props: ['size'], template: `<svg :width="size||24" :height="size||24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` }
const HelpCircle  = { props: ['size'], template: `<svg :width="size||24" :height="size||24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` }

definePageMeta({ layout: 'default' })

// ── Stage Management ────────────────────────────────────────────────────────
const stage = ref(0)

// ── Stage 0: Quiz Logic ────────────────────────────────────────────────────
const quizAnswer = ref<string | null>(null)
const shakeScreen = ref(false)

const triggerIncorrectFeed = () => {
  shakeScreen.value = true
  setTimeout(() => {
    shakeScreen.value = false
  }, 500)
}

// ── Stage 1: Card Flip States ──────────────────────────────────────────────
const flippedCards = ref([false, false, false])

const toggleCard = (index: number) => {
  flippedCards.value[index] = !flippedCards.value[index]
}

// ── Stage 2: Tactile Physics & Drag Logic ──────────────────────────────────
const leverY = ref(0)
const toasterState = ref<'idle' | 'cooking' | 'popped'>('idle')
const cookProgress = ref(0)
const leverLocked = ref(false)

const dragTrackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

const startDrag = (e: MouseEvent | TouchEvent) => {
  if (toasterState.value !== 'idle') return
  isDragging.value = true
  e.preventDefault()
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !dragTrackRef.value) return
  e.preventDefault()

  const clientY = (e as any).touches ? (e as any).touches[0].clientY : (e as any).clientY
  const trackRect = dragTrackRef.value.getBoundingClientRect()
  
  const relativeY = clientY - trackRect.top
  let percentage = Math.max(0, Math.min(100, (relativeY / trackRect.height) * 100))
  
  leverY.value = percentage

  if (percentage >= 95) {
    leverLocked.value = true
    triggerCooking()
    endDrag()
  }
}

const endDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
  
  if (leverY.value < 95 && !leverLocked.value) {
    leverY.value = 0
  }
}

let _cookTimer: ReturnType<typeof setInterval> | null = null
let _shakeTimer: ReturnType<typeof setTimeout> | null = null

const triggerCooking = () => {
  toasterState.value = 'cooking'
  shakeScreen.value = true
  _shakeTimer = setTimeout(() => {
    shakeScreen.value = false
  }, 300)

  let progress = 0
  _cookTimer = setInterval(() => {
    progress += 2
    cookProgress.value = progress
    if (progress >= 100) {
      if (_cookTimer) clearInterval(_cookTimer)
      _cookTimer = null
      toasterState.value = 'popped'
      leverY.value = 0
      leverLocked.value = false
    }
  }, 40)
}

onUnmounted(() => {
  if (isDragging.value) endDrag()
  if (_cookTimer) { clearInterval(_cookTimer); _cookTimer = null }
  if (_shakeTimer) { clearTimeout(_shakeTimer); _shakeTimer = null }
})

const restart = () => {
  stage.value = 0
  quizAnswer.value = null
  flippedCards.value = [false, false, false]
  leverY.value = 0
  toasterState.value = 'idle'
  cookProgress.value = 0
  leverLocked.value = false
}
</script>

<template>
  <UiGlassBackdrop />
  <div :class="`h-[100dvh] w-screen bg-[#FDFBF7] text-[#1E1C19] font-sans flex flex-col justify-between overflow-hidden select-none transition-transform duration-300 ${shakeScreen ? 'animate-shake' : ''}`">
    
    <!-- Modern Top Header / Nav-->
    <header class="glass-panel" style="position:fixed; top:0; left:0; right:0; z-index:30; padding:12rem 24rem; display:flex; justify-content:space-between; align-items:center; border-radius:0 0 12rem 12rem; --color-glass-bg: rgba(255,255,255,0.8); border-bottom:1px solid var(--color-glass-border);">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
        <span class="text-[10px] font-mono font-bold tracking-[0.2em] text-stone-400 uppercase">Clarity Engine</span>
      </div>
      <div class="flex gap-1.5">
        <div v-for="s in 4" :key="s" :class="`h-1.5 rounded-full transition-all duration-500 ${s - 1 === stage ? 'w-6 bg-amber-500' : 'w-1.5 bg-stone-200'}`"></div>
      </div>
    </header>

    <!-- Main Container - strictly locked to card content-->
    <div class="flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-6 overflow-hidden z-20">

      <!-- ================= STAGE 0: The Frustration Hook =================-->
      <div v-if="stage === 0" class="flex flex-col h-full justify-between py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="text-center">
          <span class="text-[10px] font-mono font-black text-rose-500 tracking-widest bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase">Let's try a quick test</span>
          <h1 class="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mt-3">Why does learning feel so hard?</h1>
          <p class="text-xs text-stone-500 mt-2">Before we start, read this real procedure and answer the check.</p>
        </div>

        <div class="glass-panel" style="background: rgba(255,255,255,0.9); border-color: rgba(0,0,0,0.1); --color-glass-border: rgba(0,0,0,0.1);">
          <div class="flex items-center gap-2 text-stone-400 font-mono text-[9px] uppercase tracking-wider mb-3">
            <AlertCircle :size="12" class="text-stone-400" /> Operational Protocol T-9
          </div>
          <h3 class="font-serif font-black text-stone-800 text-lg mb-3">Maillard Thermal Activation</h3>
          <p class="text-xs text-stone-500 font-serif leading-relaxed text-justify">
            "Prior to core operational ignition, the human agent must secure vertical orientation of the porous leavened starch substrate inside the primary receiving chamber. Apply continuous downward mechanical force to the side-mounted actuator until a dynamic latch activates the heating array."
          </p>
          
          <div class="mt-5 pt-4 border-t border-stone-100">
            <p class="text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
              <HelpCircle :size="14" class="text-amber-500" /> What are you supposed to do first?
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button 
                @click="() => { quizAnswer = 'wrong'; triggerIncorrectFeed(); }"
                :class="`p-3 rounded-xl border text-left text-[11px] font-bold transition-all ${quizAnswer === 'wrong' ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'}`"
              >
                Turn on the array.
              </button>
              <button 
                @click="() => quizAnswer = 'right'"
                :class="`p-3 rounded-xl border text-left text-[11px] font-bold transition-all ${quizAnswer === 'right' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'}`"
              >
                Put the bread in.
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <p v-if="quizAnswer" class="text-xs text-center text-stone-500 font-medium animate-in fade-in duration-300">
            {{ quizAnswer === 'right' 
              ? "Correct! But your brain had to translate every single robot word, didn't it?" 
              : "Exactly. It's written like a robot manual. You shouldn't need a dictionary to make breakfast." }}
          </p>
          <button 
            @click="() => stage = 1"
            class="glass-btn w-full" style="background:#1E1C19; color:white; border-radius:16rem; padding:14rem 0;"
          >
            Let's make this human <ArrowRight :size="16" />
          </button>
        </div>
      </div>

      <!-- ================= STAGE 1: The 3D Transformation Flip =================-->
      <div v-else-if="stage === 1" class="flex flex-col h-full justify-between py-4 animate-in fade-in duration-500">
        <div class="text-center">
          <span class="text-[10px] font-mono font-black text-amber-600 tracking-widest bg-amber-50 border border-amber-100 px-3 py-1 rounded-full uppercase">Step 1: The Translation</span>
          <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">Simplifying the Signal</h1>
          <p class="text-xs text-stone-500 mt-2">Tap each card below to flip it from "Robot Code" to "Plain Human Speak".</p>
        </div>

        <div class="glass-panel my-5" style="background:rgba(255,255,255,0.95);">
          <div 
            v-for="(card, idx) in [
              { id: 0, num: '1', tech: 'Secure vertical alignment of the leavened starch substrate inside the slot.', clear: 'Put your slice of bread into the toaster slot.' },
              { id: 1, num: '2', tech: 'Apply continuous downward mechanical force to the side actuator.', clear: 'Push the handle on the right down until it clicks.' },
              { id: 2, num: '3', tech: 'Verify automatic mechanical release upon optimum dehydration status.', clear: 'Wait. It pops up automatically when it\'s done.' }
            ]"
            :key="card.id" 
            @click="toggleCard(idx)"
            class="perspective-1000 h-20 cursor-pointer"
          >
            <div :class="`relative w-full h-full duration-500 transform-style-3d transition-transform ${flippedCards[idx] ? 'rotate-y-180' : ''}`">
              
              <!-- Front: Technical Jargon-->
              <div class="absolute inset-0 bg-white rounded-2xl border border-stone-200 px-5 flex items-center gap-4 backface-hidden shadow-sm">
                <div class="w-8 h-8 rounded-full bg-stone-100 font-extrabold text-xs flex items-center justify-center text-stone-400 shrink-0">
                  {{ card.num }}
                </div>
                <p class="text-[10.5px] font-mono text-stone-400 italic line-clamp-2">"{{ card.tech }}"</p>
              </div>

              <!-- Back: Clear Human Communication-->
              <div class="absolute inset-0 bg-amber-500 text-white rounded-2xl px-5 flex items-center gap-4 backface-hidden rotate-y-180 shadow-md">
                <div class="w-8 h-8 rounded-full bg-white/20 font-extrabold text-xs flex items-center justify-center shrink-0">
                  {{ card.num }}
                </div>
                <p class="text-[11.5px] font-bold leading-snug">{{ card.clear }}</p>
              </div>

            </div>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-[11px] text-center text-stone-400 font-medium italic">Flipped cards feel light, intuitive, and simple. Just like good teaching.</p>
          <button 
            @click="() => stage = 2"
            class="glass-btn w-full" style="background:#1E1C19; color:white; border-radius:16rem; padding:14rem 0;"
          >
            Let's practice doing it <ArrowRight :size="16" />
          </button>
        </div>
      </div>

      <!-- ================= STAGE 2: Tactile Playground (Toaster Physics) =================-->
      <div v-else-if="stage === 2" class="flex flex-col h-full justify-between py-4 animate-in fade-in duration-500">
        <div class="text-center">
          <span class="text-[10px] font-mono font-black text-emerald-600 tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase">Step 2: Real Action</span>
          <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">Learn by Doing</h1>
          <p class="text-xs text-stone-500 mt-2">Reading isn't enough. Grab the lever and drag it down to start.</p>
        </div>

        <!-- Tactile Toaster Canvas-->
        <div class="bg-stone-50 rounded-3xl border-2 border-stone-200/60 p-6 flex-1 my-5 flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
          
          <!-- Toaster & Physics Setup-->
          <div class="relative w-48 h-48 flex justify-center items-end select-none">
            
            <!-- Heat smoke waves rising when toasted-->
            <div v-if="toasterState === 'popped'" class="absolute top-0 left-0 w-full h-12 flex justify-center gap-5 z-0 pointer-events-none">
              <div class="w-1.5 h-6 bg-amber-400 rounded-full smoke-1"></div>
              <div class="w-1.5 h-10 bg-amber-400 rounded-full smoke-2"></div>
            </div>

            <!-- The Toast bread block-->
            <div 
              :class="`absolute w-28 h-28 rounded-t-[2.2rem] rounded-b-lg border-4 transition-all z-10 shadow-md
                ${toasterState === 'popped' ? 'animate-spring-pop' : 'duration-150'}`"
              :style="{
                backgroundColor: `rgb(${253 - (cookProgress * 1.1)}, ${224 - (cookProgress * 1.2)}, ${139 - (cookProgress * 1.1)})`,
                borderColor: `rgb(${212 - (cookProgress * 0.8)}, ${165 - (cookProgress * 0.6)}, ${116 - (cookProgress * 0.5)})`,
                bottom: toasterState === 'popped' ? '85px' : `${40 - (leverY * 0.4)}px`,
              }"
            >
              <!-- Happy face pops up on toast to trigger delight-->
              <div v-if="toasterState === 'popped'" class="absolute inset-0 flex items-center justify-center flex-col opacity-0 animate-in fade-in duration-500 delay-300">
                <div class="flex gap-2.5">
                  <div class="w-2 h-2 bg-stone-800 rounded-full"></div>
                  <div class="w-2 h-2 bg-stone-800 rounded-full"></div>
                </div>
                <div class="mt-2 w-4 h-2 border-b-4 border-stone-800 rounded-full"></div>
              </div>
            </div>

            <!-- The Sleek Chrome Toaster-->
            <div class="relative z-20 w-40 h-28 bg-[#1E1C19] rounded-t-3xl rounded-b-xl shadow-xl flex flex-col justify-between py-3 border-t-8 border-stone-800">
              <div class="w-28 h-2.5 bg-[#000000] rounded-full mx-auto relative overflow-hidden">
                <div :class="`absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-0 transition-opacity duration-1000
                  ${toasterState === 'cooking' ? 'opacity-90 animate-pulse' : ''}`"
                />
              </div>

              <div class="px-4 flex justify-between items-center">
                <div class="w-2 h-2 rounded-full bg-stone-700"></div>
                <div :class="`w-3 h-3 rounded-full transition-all duration-300
                  ${toasterState === 'cooking' ? 'bg-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-stone-700'}`"
                />
              </div>

              <!-- Drag Handle Track Slot-->
              <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-6.5 h-16 bg-[#121110] rounded border border-stone-800 shadow-inner flex justify-center py-0.5">
                <div ref="dragTrackRef" class="relative w-1 h-full bg-[#000000] rounded">
                  
                  <!-- Tactile Drag Lever-->
                  <div 
                    @mousedown="startDrag"
                    @touchstart="startDrag"
                    :class="`absolute left-1/2 -translate-x-1/2 w-7 h-5 bg-[#FAF8F5] border-2 border-stone-300 rounded shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center transition-all
                      ${toasterState !== 'idle' ? 'pointer-events-none opacity-55' : 'hover:scale-105'}`"
                    :style="{ top: `${leverY * 0.72}%` }"
                  >
                    <div class="w-3.5 h-0.5 bg-stone-400 rounded-full"></div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          <!-- Real-time tactile guide indicator-->
          <div class="mt-5 text-[11px] font-bold text-stone-500 h-6 flex items-center">
            <span v-if="toasterState === 'idle'" class="animate-pulse">👇 Slide the handle down to practice</span>
            <span v-else-if="toasterState === 'cooking'" class="text-amber-500 animate-pulse uppercase tracking-wider">Perfect Heat Flow: {{ Math.round(cookProgress) }}%</span>
            <span v-else-if="toasterState === 'popped'" class="text-emerald-600 flex items-center gap-1">Delicious! Practice makes perfect.</span>
          </div>
        </div>

        <div class="space-y-3">
          <button 
            @click="() => stage = 3"
            :disabled="toasterState !== 'popped'"
            class="glass-btn w-full" 
            :style="{ background: toasterState === 'popped' ? '#1E1C19' : '#d1d5db', color: 'white', borderRadius: '16rem', padding: '14rem 0', opacity: toasterState === 'popped' ? 1 : 0.5 }"
          >
            Let's look at what happened <ArrowRight :size="16" />
          </button>
        </div>
      </div>

      <!-- ================= STAGE 3: The Big Human-Centric Reveal =================-->
      <div v-else-if="stage === 3" class="flex flex-col h-full justify-between py-4 animate-in fade-in duration-500 text-center">
        <div>
          <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-3 shadow-inner">
            <Sparkles :size="24" />
          </div>
          <h1 class="text-3xl font-black tracking-tight text-stone-900 leading-none">That is Instructional Design.</h1>
          <p class="text-xs text-stone-500 mt-2">The art of stopping people from feeling stupid.</p>
        </div>

        <div class="bg-white rounded-3xl border border-stone-200 p-6 text-left my-5 flex flex-col justify-center gap-5 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="w-7 h-7 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full flex items-center justify-center shrink-0">1</div>
            <div>
              <h4 class="font-bold text-stone-800 text-xs uppercase tracking-wider">We delete the clutter</h4>
              <p class="text-xs text-stone-500 mt-1">Nobody reads thick manuals. We strip out information overload and give you only the clear, simple truth.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-7 h-7 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full flex items-center justify-center shrink-0">2</div>
            <div>
              <h4 class="font-bold text-stone-800 text-xs uppercase tracking-wider">We sequence logically</h4>
              <p class="text-xs text-stone-500 mt-1">We arrange actions exactly in the order your brain expects them to happen, reducing friction.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-7 h-7 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full flex items-center justify-center shrink-0">3</div>
            <div>
              <h4 class="font-bold text-stone-800 text-xs uppercase tracking-wider">We design doing</h4>
              <p class="text-xs text-stone-500 mt-1">We know that people learn by pulling levers, making choices, and practicing—not by reading slides.</p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <button 
            @click="restart"
            class="glass-btn glass-btn--ghost w-full" style="border-radius:16rem; padding:14rem 0;"
          >
            <RotateCcw :size="14" /> Play Again
          </button>
        </div>
      </div>

    </div>

    <!-- Premium Minimalist Footer-->
    <footer class="py-5 text-center border-t border-stone-200/50 bg-[#FDFBF7] shrink-0 z-10">
      <p class="text-[9px] text-stone-400 font-black tracking-widest uppercase">The Psychology of Experience Design</p>
    </footer>

  </div>
</template>

<style scoped>
/* Premium motion rules */
@keyframes springPop {
  0% { transform: translateY(60px) scaleY(0.8); }
  40% { transform: translateY(-25px) scaleY(1.1); }
  70% { transform: translateY(10px) scaleY(0.95); }
  100% { transform: translateY(0px) scaleY(1); }
}
@keyframes smokeFloat {
  0% { transform: translateY(0) scaleX(1); opacity: 0; }
  40% { opacity: 0.4; }
  100% { transform: translateY(-40px) scaleX(1.4); opacity: 0; }
}
@keyframes subtleShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.animate-spring-pop { animation: springPop 0.65s cubic-bezier(0.25, 0.8, 0.25, 1.2) forwards; }
.smoke-1 { animation: smokeFloat 1.6s infinite ease-out; }
.smoke-2 { animation: smokeFloat 1.6s infinite ease-out 0.5s; }
.animate-shake { animation: subtleShake 0.25s ease-in-out; }

/* 3D Card Flip Mechanics */
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }

/* Ensure proper animation and transition support */
* {
  box-sizing: border-box;
}

/* Smooth transitions for all interactive elements */
button {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Ensure text doesn't vanish during transitions */
.animate-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth fade for quiz feedback */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Ensure lever drag is smooth */
div[style*="top"] {
  will-change: transform;
}
</style>
