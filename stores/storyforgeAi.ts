import { defineStore } from 'pinia'

export type DevelopmentTool =
  | 'storyline'
  | 'rise'
  | 'captivate'
  | 'vyond'
  | 'heygen'
  | 'synthesia'
  | 'other'

export type StoryForgeAiAction =
  | 'proactive'
  | 'quickDraft'
  | 'rewrite'
  | 'standardsRewrite'
  | 'readability'
  | 'toolBuild'
  | 'batch'
  | 'chat'

export type ReadabilityStandard =
  | 'cefr-a1'
  | 'cefr-a2'
  | 'cefr-b1'
  | 'cefr-b2'
  | 'cefr-c1'
  | 'cefr-c2'
  | 'plain-language'
  | 'flesch-kincaid'
  | 'wcag'
  | 'corporate'
  | 'blooms'

export type ReadabilityFieldMeta = {
  estimatedCefr?: string
  gradeLevel?: number
  standard?: ReadabilityStandard
  note?: string
  updatedAt?: string
}

export type StoryForgeScreen = {
  id: string
  title: string
  visualDescription: string
  narration: string
  interactions: string
  navigation: string
  duration: number
  status: string
  developmentTool?: DevelopmentTool
  customTool?: string
  readability?: {
    visualDescription?: ReadabilityFieldMeta
    narration?: ReadabilityFieldMeta
    interactions?: ReadabilityFieldMeta
    navigation?: ReadabilityFieldMeta
  }
}

export type StoryForgeProjectContext = {
  title: string
  summary: string
  objectives: string[]
  primaryTool: DevelopmentTool
  customTool: string
  tone: string
  audience: string
  screenTitles: string[]
}

export type StoryForgeSuggestion = {
  id: string
  action: StoryForgeAiAction
  label: string
  rationale: string
  target: 'project' | 'screen' | 'batch' | 'chat'
  screenId?: string
  patch?: Partial<StoryForgeScreen>
  projectPatch?: Partial<StoryForgeProjectContext>
  toolBuild?: string
  batchPatches?: Array<{ screenId: string; patch: Partial<StoryForgeScreen>; rationale?: string }>
  comparison?: { field: keyof StoryForgeScreen | 'screen'; original: string; rewritten: string; standardLabel: string }
  createdAt: string
}

export type StoryForgeChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export const READABILITY_STANDARD_OPTIONS: Array<{ value: ReadabilityStandard; label: string; helper: string }> = [
  { value: 'cefr-a1', label: 'CEFR A1', helper: 'Beginner: very short, familiar words' },
  { value: 'cefr-a2', label: 'CEFR A2', helper: 'Elementary: short everyday language' },
  { value: 'cefr-b1', label: 'CEFR B1', helper: 'Intermediate: clear common workplace language' },
  { value: 'cefr-b2', label: 'CEFR B2', helper: 'Upper-intermediate: nuanced but direct' },
  { value: 'cefr-c1', label: 'CEFR C1', helper: 'Advanced: precise, complex professional language' },
  { value: 'cefr-c2', label: 'CEFR C2', helper: 'Proficient: sophisticated native-like language' },
  { value: 'plain-language', label: 'Plain Language', helper: 'Simple English with direct structure' },
  { value: 'flesch-kincaid', label: 'Flesch-Kincaid', helper: 'Target lower grade-level readability' },
  { value: 'wcag', label: 'WCAG-friendly', helper: 'Accessible, explicit, easy to scan' },
  { value: 'corporate', label: 'Professional tone', helper: 'Polished workplace language' },
  { value: 'blooms', label: 'Bloom alignment', helper: 'Align with learning complexity and action verbs' }
]

export const DEVELOPMENT_TOOL_OPTIONS: Array<{ value: DevelopmentTool; label: string; aiHint: string }> = [
  { value: 'storyline', label: 'Articulate Storyline 360', aiHint: 'triggers, variables, states, slide layers, interactions, branching' },
  { value: 'rise', label: 'Articulate Rise', aiHint: 'Rise blocks, lessons, knowledge checks, scenarios, accordion/process blocks' },
  { value: 'captivate', label: 'Adobe Captivate', aiHint: 'advanced actions, variables, simulations, responsive projects, software demos' },
  { value: 'vyond', label: 'Vyond', aiHint: 'scene beats, character actions, camera movement, voiceover timing, visual storytelling' },
  { value: 'heygen', label: 'HeyGen', aiHint: 'avatar delivery, camera framing, voiceover pacing, visual prompts' },
  { value: 'synthesia', label: 'Synthesia', aiHint: 'avatar script, scene layouts, on-screen text, timing, pronunciation notes' },
  { value: 'other', label: 'Other (custom)', aiHint: 'custom production constraints and build notes' }
]

export const useStoryforgeAiStore = defineStore('storyforgeAi', {
  state: () => ({
    primaryTool: 'storyline' as DevelopmentTool,
    customTool: '',
    suggestions: [] as StoryForgeSuggestion[],
    chat: [] as StoryForgeChatMessage[],
    pendingAction: null as StoryForgeAiAction | null,
    error: '',
    cache: {} as Record<string, StoryForgeSuggestion[]>
  }),
  getters: {
    toolLabel: (state) => DEVELOPMENT_TOOL_OPTIONS.find(tool => tool.value === state.primaryTool)?.label || state.customTool || 'Selected tool',
    activeSuggestions: (state) => state.suggestions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  actions: {
    setProjectTool(tool: DevelopmentTool, customTool = '') {
      this.primaryTool = tool
      this.customTool = customTool
      this.suggestions = []
    },
    setPending(action: StoryForgeAiAction | null) {
      this.pendingAction = action
      if (action) this.error = ''
    },
    setError(message: string) {
      this.error = message
      this.pendingAction = null
    },
    remember(key: string, suggestions: StoryForgeSuggestion[]) {
      this.cache[key] = suggestions
    },
    cached(key: string) {
      return this.cache[key]
    },
    addSuggestions(suggestions: StoryForgeSuggestion[]) {
      this.suggestions = [...suggestions, ...this.suggestions].slice(0, 40)
    },
    clearSuggestions(screenId?: string) {
      this.suggestions = screenId
        ? this.suggestions.filter(suggestion => suggestion.screenId !== screenId)
        : []
    },
    dismissSuggestion(id: string) {
      this.suggestions = this.suggestions.filter(suggestion => suggestion.id !== id)
    },
    addChat(role: 'user' | 'assistant', content: string) {
      this.chat.push({ id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`, role, content, createdAt: new Date().toISOString() })
      this.chat = this.chat.slice(-12)
    }
  }
})
