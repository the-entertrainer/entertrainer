<template>
  <div class="storyforge min-h-screen bg-[#0a0a0a] text-white">
    <!-- Top Toolbar -->
    <div class="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
      <div class="flex items-center justify-between px-8 py-4">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-semibold tracking-tight">StoryForge ID</h1>
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs">Beta</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Import -->
          <label class="cursor-pointer rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            Import .sbf / Excel
            <input type="file" accept=".sbf,.json,.xlsx" class="hidden" @change="importProject">
          </label>

          <!-- Export Dropdown -->
          <div class="relative">
            <button 
              @click="showExportMenu = !showExportMenu"
              class="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-medium text-black hover:bg-white/90"
            >
              Export
              <span class="text-xs">↓</span>
            </button>
            
            <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#111] py-1 shadow-2xl">
              <button @click="exportSBF" class="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">Download .sbf (Project File)</button>
              <button @click="exportPPTX" class="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">Export as PPTX (Editable)</button>
              <button @click="exportPDF" class="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">Export as PDF</button>
              <div class="my-1 border-t border-white/10" />
              <button @click="exportXLSX" class="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">Export as XLSX (Template)</button>
            </div>
          </div>

          <button @click="newProject" class="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            New Project
          </button>
        </div>
      </div>
    </div>

    <div class="flex h-[calc(100vh-73px)]">
      <!-- Canvas -->
      <div class="flex-1 overflow-auto p-8">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <input 
              v-model="projectTitle" 
              class="bg-transparent text-3xl font-semibold outline-none placeholder:text-white/40"
              placeholder="Untitled Storyboard"
            />
            <p class="text-sm text-white/50">{{ screens.length }} screens • Est. {{ totalDuration }} min</p>
          </div>
          
          <button @click="addScreen" class="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
            + Add Screen
          </button>
        </div>

        <!-- Draggable Canvas -->
        <div class="flex gap-4 overflow-x-auto pb-8" style="min-height: 420px">
          <div 
            v-for="(screen, index) in screens" 
            :key="screen.id"
            draggable="true"
            @dragstart="dragStart($event, index)"
            @dragover.prevent
            @drop="drop($event, index)"
            @click="selectScreen(screen)"
            class="w-72 flex-shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-[#111] p-5 transition-all hover:border-white/30"
            :class="{ 'ring-2 ring-white/60': selectedScreen?.id === screen.id }"
          >
            <div class="mb-3 flex items-center justify-between">
              <div class="text-xs text-white/50">SCREEN {{ String(index + 1).padStart(2, '0') }}</div>
              <div class="text-[10px] text-white/40">{{ screen.duration }}s</div>
            </div>
            
            <div class="mb-4 text-lg font-medium leading-tight">{{ screen.title || 'Untitled Screen' }}</div>
            
            <div class="text-xs text-white/60 line-clamp-3">
              {{ screen.visualDescription?.slice(0, 120) || 'No visual description yet' }}...
            </div>
            
            <div class="mt-4 flex items-center gap-2 text-[10px]">
              <div class="rounded bg-white/10 px-2 py-0.5">{{ screen.status || 'Draft' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor Sidebar -->
      <div v-if="selectedScreen" class="w-96 border-l border-white/10 bg-[#0a0a0a] p-6 overflow-y-auto">
        <div class="mb-6 flex items-center justify-between">
          <div class="font-semibold">Edit Screen</div>
          <button @click="deleteScreen" class="text-red-400 hover:text-red-500">Delete</button>
        </div>

        <div class="space-y-6">
          <!-- Title -->
          <div>
            <label class="mb-1.5 block text-xs text-white/60">Screen Title</label>
            <input v-model="selectedScreen.title" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" />
          </div>

          <!-- Visual + On-Screen Text -->
          <div>
            <label class="mb-1.5 block text-xs text-white/60">Visual Description & On-Screen Text</label>
            <textarea v-model="selectedScreen.visualDescription" rows="5" class="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm outline-none"></textarea>
          </div>

          <!-- Narration -->
          <div>
            <label class="mb-1.5 block text-xs text-white/60">Narration / Audio Script</label>
            <textarea v-model="selectedScreen.narration" rows="4" class="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm outline-none"></textarea>
          </div>

          <!-- Interactions -->
          <div>
            <label class="mb-1.5 block text-xs text-white/60">Learner Interactions & Feedback</label>
            <textarea v-model="selectedScreen.interactions" rows="3" class="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm outline-none"></textarea>
          </div>

          <!-- Navigation -->
          <div>
            <label class="mb-1.5 block text-xs text-white/60">Navigation & Branching</label>
            <textarea v-model="selectedScreen.navigation" rows="2" class="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm outline-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-xs text-white/60">Duration (seconds)</label>
              <input v-model.number="selectedScreen.duration" type="number" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-white/60">Status</label>
              <select v-model="selectedScreen.status" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <option>Draft</option>
                <option>SME Review</option>
                <option>Approved</option>
                <option>Final</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import PptxGenJS from 'pptxgenjs'
import jsPDF from 'jspdf'

// State
const projectTitle = ref('New Instructional Storyboard')
const screens = ref([])
const selectedScreen = ref(null)
const showExportMenu = ref(false)

const totalDuration = computed(() => {
  return Math.round(screens.value.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)
})

// Load demo data on first load
onMounted(() => {
  if (screens.value.length === 0) {
    screens.value = [
      {
        id: 's1',
        title: 'Welcome & Objectives',
        visualDescription: 'Clean modern layout with diverse team on video call. Large title and 3 learning objectives.',
        narration: 'Welcome to this module on effective remote communication...',
        interactions: 'Click Start to begin',
        navigation: 'Standard Next button',
        duration: 45,
        status: 'Approved'
      }
    ]
    selectScreen(screens.value[0])
  }
})

function selectScreen(screen) {
  selectedScreen.value = screen
}

function addScreen() {
  const newScreen = {
    id: 's' + Date.now(),
    title: 'New Screen',
    visualDescription: '',
    narration: '',
    interactions: '',
    navigation: 'Standard Next',
    duration: 60,
    status: 'Draft'
  }
  screens.value.push(newScreen)
  selectScreen(newScreen)
}

function deleteScreen() {
  if (!selectedScreen.value) return
  screens.value = screens.value.filter(s => s.id !== selectedScreen.value.id)
  selectedScreen.value = null
}

// Drag and drop reordering
let draggedIndex = null
function dragStart(e, index) {
  draggedIndex = index
}
function drop(e, dropIndex) {
  if (draggedIndex === null) return
  const draggedScreen = screens.value[draggedIndex]
  screens.value.splice(draggedIndex, 1)
  screens.value.splice(dropIndex, 0, draggedScreen)
  draggedIndex = null
}

// .sbf Export
async function exportSBF() {
  const project = {
    version: '1.0',
    title: projectTitle.value,
    created: new Date().toISOString(),
    screens: screens.value
  }
  
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  saveAs(blob, `${projectTitle.value.replace(/\s+/g, '-')}.sbf`)
  showExportMenu.value = false
}

// Import .sbf or Excel (basic .sbf support for now)
async function importProject(e) {
  const file = e.target.files[0]
  if (!file) return

  if (file.name.endsWith('.sbf') || file.name.endsWith('.json')) {
    const text = await file.text()
    const data = JSON.parse(text)
    projectTitle.value = data.title || 'Imported Project'
    screens.value = data.screens || []
    if (screens.value.length > 0) selectScreen(screens.value[0])
  } else {
    alert('Excel import coming soon. For now, use the .sbf format.')
  }
  e.target.value = ''
}

// PPTX Export (using your existing pptxgenjs)
async function exportPPTX() {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.title = projectTitle.value

  screens.value.forEach((screen, i) => {
    const slide = pptx.addSlide()
    slide.addText(`Screen ${i + 1}: ${screen.title}`, { x: 0.5, y: 0.3, fontSize: 24, bold: true })
    slide.addText(screen.visualDescription || '', { x: 0.5, y: 1.0, fontSize: 14, color: '666666' })
    if (screen.narration) {
      slide.addText('Narration:', { x: 0.5, y: 3.5, fontSize: 12, bold: true })
      slide.addText(screen.narration, { x: 0.5, y: 3.9, fontSize: 12 })
    }
  })

  await pptx.writeFile({ fileName: `${projectTitle.value}.pptx` })
  showExportMenu.value = false
}

// PDF Export
function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(projectTitle.value, 20, 20)
  
  screens.value.forEach((screen, i) => {
    const y = 40 + (i * 55)
    doc.setFontSize(14)
    doc.text(`Screen ${i + 1}: ${screen.title}`, 20, y)
    doc.setFontSize(11)
    doc.text(screen.visualDescription?.slice(0, 150) || '', 20, y + 8)
  })
  
  doc.save(`${projectTitle.value}.pdf`)
  showExportMenu.value = false
}

// Placeholder for XLSX (you can expand using xlsx lib later)
function exportXLSX() {
  alert('XLSX export will be added in the next update. Use .sbf or PPTX for now.')
  showExportMenu.value = false
}

function newProject() {
  if (confirm('Create new project? Unsaved changes will be lost.')) {
    projectTitle.value = 'New Instructional Storyboard'
    screens.value = []
    selectedScreen.value = null
    addScreen()
  }
}
</script>

<style scoped>
.storyforge {
  font-family: 'DM Sans', system-ui, sans-serif;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>