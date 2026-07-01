import type {
  DevelopmentTool,
  StoryForgeAiAction,
  StoryForgeChatMessage,
  ReadabilityStandard,
  StoryForgeProjectContext,
  StoryForgeScreen,
  StoryForgeSuggestion
} from '~/stores/storyforgeAi'
import { useStoryforgeAiStore } from '~/stores/storyforgeAi'

type StoryForgeAiRequest = {
  action: StoryForgeAiAction
  prompt?: string
  project: StoryForgeProjectContext
  screen?: StoryForgeScreen | null
  screens?: StoryForgeScreen[]
  targetField?: keyof StoryForgeScreen | 'all'
  customInstruction?: string
  standard?: ReadabilityStandard
  standardLabel?: string
  scope?: 'field' | 'screen' | 'project'
  chatHistory?: StoryForgeChatMessage[]
}

type StoryForgeAiResponse = {
  suggestions?: StoryForgeSuggestion[]
  assistantMessage?: string
}

function stableScreenDigest(screen?: StoryForgeScreen | null) {
  if (!screen) return 'no-screen'
  return [screen.id, screen.title, screen.visualDescription, screen.narration, screen.interactions, screen.navigation, screen.developmentTool].join('|').slice(0, 600)
}

function makeCacheKey(request: StoryForgeAiRequest) {
  return JSON.stringify({
    action: request.action,
    prompt: request.prompt?.slice(0, 500),
    targetField: request.targetField,
    customInstruction: request.customInstruction?.slice(0, 500),
    standard: request.standard,
    scope: request.scope,
    project: {
      title: request.project.title,
      tool: request.project.primaryTool,
      customTool: request.project.customTool,
      objectives: request.project.objectives.slice(0, 4),
      tone: request.project.tone,
      audience: request.project.audience
    },
    screen: stableScreenDigest(request.screen),
    screenCount: request.screens?.length ?? 0
  })
}

/**
 * Thin StoryForge-specific Groq client.
 * - Keeps Groq calls server-side via /api/storyforge.
 * - Adds tiny client-side caching for repeated proactive suggestions.
 * - Writes pending/error/suggestion state into Pinia so the page stays simple.
 */
export function useGroqAI() {
  const aiStore = useStoryforgeAiStore()

  async function ask(request: StoryForgeAiRequest) {
    const cacheKey = makeCacheKey(request)
    const canCache = request.action === 'proactive' || request.action === 'toolBuild'
    const cached = canCache ? aiStore.cached(cacheKey) : undefined
    if (cached?.length) {
      aiStore.addSuggestions(cached)
      return { suggestions: cached } satisfies StoryForgeAiResponse
    }

    aiStore.setPending(request.action)
    try {
      const response = await $fetch<StoryForgeAiResponse>('/api/storyforge', {
        method: 'POST',
        body: request
      })
      const suggestions = response.suggestions || []
      if (suggestions.length) {
        aiStore.addSuggestions(suggestions)
        if (canCache) aiStore.remember(cacheKey, suggestions)
      }
      if (request.action === 'chat' && response.assistantMessage) {
        aiStore.addChat('assistant', response.assistantMessage)
      }
      aiStore.setPending(null)
      return response
    } catch (error: any) {
      aiStore.setError(error?.data?.message ?? 'StoryForge AI could not complete that request. Try a smaller prompt or a more specific instruction.')
      return { suggestions: [] } satisfies StoryForgeAiResponse
    }
  }

  function effectiveTool(projectTool: DevelopmentTool, screen?: StoryForgeScreen | null) {
    return screen?.developmentTool || projectTool
  }

  async function rewriteToStandard(request: Omit<StoryForgeAiRequest, 'action'>) {
    return ask({ ...request, action: 'standardsRewrite' })
  }

  async function estimateReadability(request: Omit<StoryForgeAiRequest, 'action'>) {
    return ask({ ...request, action: 'readability' })
  }

  return { ask, rewriteToStandard, estimateReadability, effectiveTool }
}
