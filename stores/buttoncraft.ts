import { defineStore } from 'pinia'
import type { ButtonConfig, ButtonProject, ButtonState, ShadowLayer, StateOverride } from '~/types/buttoncraft'
import { BUTTON_STATES } from '~/types/buttoncraft'
import { defaultButtonConfig, defaultStateGenSettings, newId } from '~/utils/buttonDefaults'
import { findTemplate, BUTTON_TEMPLATES } from '~/utils/buttonTemplates'
import { useStateGeneration } from '~/composables/useStateGeneration'

const STORAGE_KEY = 'buttoncraft-project'

function loadFromStorage(): ButtonProject | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ButtonProject) : null
  } catch { return null }
}

function cloneTemplateInto(templateId: string, name: string): ButtonProject {
  const tpl = findTemplate(templateId) ?? BUTTON_TEMPLATES[0]
  const now = new Date().toISOString()
  return {
    id: newId(),
    name,
    createdAt: now,
    updatedAt: now,
    templateId: tpl.id,
    button: JSON.parse(JSON.stringify(tpl.button)) as ButtonConfig,
    stateGen: JSON.parse(JSON.stringify(tpl.stateGen))
  }
}

function setByPath(target: any, path: string, value: any) {
  const keys = path.split('.')
  let node = target
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (node[key] === undefined || node[key] === null) node[key] = {}
    node = node[key]
  }
  node[keys[keys.length - 1]] = value
}

export const useButtonCraftStore = defineStore('buttoncraft', () => {
  const currentProject = ref<ButtonProject | null>(loadFromStorage())
  const selectedState = ref<ButtonState>('normal')

  const buttonConfig = computed<ButtonConfig | undefined>(() => currentProject.value?.button)
  const hasProject = computed(() => !!currentProject.value)

  function persist() {
    if (!import.meta.client || !currentProject.value) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProject.value)) } catch {}
  }

  function touch() {
    if (currentProject.value) currentProject.value.updatedAt = new Date().toISOString()
    persist()
  }

  function createNewProject(name = 'Untitled Button') {
    const now = new Date().toISOString()
    currentProject.value = {
      id: newId(),
      name,
      createdAt: now,
      updatedAt: now,
      button: defaultButtonConfig(),
      stateGen: defaultStateGenSettings()
    }
    selectedState.value = 'normal'
    generateAllStates()
  }

  function loadTemplate(templateId: string) {
    const name = currentProject.value?.name && currentProject.value.name !== 'Untitled Button'
      ? currentProject.value.name
      : (findTemplate(templateId)?.name ?? 'Untitled Button')
    currentProject.value = cloneTemplateInto(templateId, name)
    selectedState.value = 'normal'
    generateAllStates()
  }

  function renameProject(name: string) {
    if (!currentProject.value) return
    currentProject.value.name = name.trim() || 'Untitled Button'
    touch()
  }

  function generateAllStates(intensity?: number) {
    if (!currentProject.value) return
    if (intensity !== undefined) currentProject.value.stateGen.intensity = intensity
    const { generateAllStates: generate } = useStateGeneration()
    currentProject.value.button.states = generate(currentProject.value.button, currentProject.value.stateGen)
    touch()
  }

  function updateStateGenSettings(patch: Partial<ButtonProject['stateGen']>) {
    if (!currentProject.value) return
    Object.assign(currentProject.value.stateGen, patch)
    generateAllStates()
  }

  /** Deep reactive update helper — path like "typography.fontSize" or "border.color". */
  function updateProperty(path: string, value: any) {
    if (!currentProject.value) return
    setByPath(currentProject.value.button, path, value)
    touch()
  }

  /** Manual per-state pin — e.g. updateStateOverride('hover', 'fillColor', '#fff'). */
  function updateStateOverride(state: ButtonState, key: keyof StateOverride, value: any) {
    if (!currentProject.value) return
    const overrides = currentProject.value.button.states[state]
    if (value === undefined) delete overrides[key]
    else (overrides as any)[key] = value
    touch()
  }

  function clearStateOverride(state: ButtonState, key: keyof StateOverride) {
    updateStateOverride(state, key, undefined)
  }

  function addShadowLayer() {
    if (!currentProject.value) return
    const layer: ShadowLayer = { id: newId(), x: 0, y: 8, blur: 20, spread: -10, color: '#000000', opacity: 0.3, inset: false }
    currentProject.value.button.shadows.push(layer)
    touch()
  }

  function updateShadowLayer(id: string, patch: Partial<ShadowLayer>) {
    if (!currentProject.value) return
    const layer = currentProject.value.button.shadows.find(s => s.id === id)
    if (layer) Object.assign(layer, patch)
    touch()
  }

  function removeShadowLayer(id: string) {
    if (!currentProject.value) return
    currentProject.value.button.shadows = currentProject.value.button.shadows.filter(s => s.id !== id)
    touch()
  }

  function addGradientStop() {
    if (!currentProject.value) return
    const stops = currentProject.value.button.gradient.stops
    const lastPos = stops.length ? stops[stops.length - 1].pos : 0
    stops.push({ color: '#FFFFFF', pos: Math.min(100, lastPos + 20) })
    touch()
  }

  function updateGradientStop(index: number, patch: Partial<{ color: string; pos: number }>) {
    if (!currentProject.value) return
    const stop = currentProject.value.button.gradient.stops[index]
    if (stop) Object.assign(stop, patch)
    touch()
  }

  function removeGradientStop(index: number) {
    if (!currentProject.value) return
    const stops = currentProject.value.button.gradient.stops
    if (stops.length <= 2) return // a gradient needs at least two stops
    stops.splice(index, 1)
    touch()
  }

  function setSelectedState(state: ButtonState) {
    selectedState.value = state
  }

  return {
    currentProject,
    selectedState,
    buttonConfig,
    hasProject,
    createNewProject,
    loadTemplate,
    renameProject,
    generateAllStates,
    updateStateGenSettings,
    updateProperty,
    updateStateOverride,
    clearStateOverride,
    addShadowLayer,
    updateShadowLayer,
    removeShadowLayer,
    addGradientStop,
    updateGradientStop,
    removeGradientStop,
    setSelectedState
  }
})

export { BUTTON_STATES }
