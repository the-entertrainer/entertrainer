// Optional, local-first AI: the user brings their own Groq key, it never
// leaves this browser (localStorage), and every request goes straight from
// the browser to Groq — no middleman. Everything is OFF by default; the
// whole tool works fully without it. The provider field keeps the door
// open for OpenAI/Gemini later without a storage migration.

export interface AiSettings {
  enabled: boolean
  provider: 'groq'
  key: string
  validatedAt: string | null
}

const AI_KEY = 'storygen-ai'

const defaults = (): AiSettings => ({ enabled: false, provider: 'groq', key: '', validatedAt: null })

export function useAiSettings() {
  const settings = useState<AiSettings>('sg-ai-settings', () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem(AI_KEY)
        if (raw) return { ...defaults(), ...JSON.parse(raw) }
      } catch {}
    }
    return defaults()
  })

  const aiReady = computed(() =>
    settings.value.enabled && !!settings.value.key && !!settings.value.validatedAt
  )

  function save() {
    try { localStorage.setItem(AI_KEY, JSON.stringify(settings.value)) } catch {}
  }

  // A cheap authenticated call proves the key works before we enable
  // anything. Returns an error message, or null on success.
  async function validateAndEnable(key: string): Promise<string | null> {
    const trimmed = key.trim()
    if (!trimmed) return 'Paste your Groq API key first.'
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${trimmed}` }
      })
      if (res.status === 401 || res.status === 403) return 'Groq rejected this key — double-check it and try again.'
      if (!res.ok) return `Groq responded with ${res.status}. Try again in a moment.`
      settings.value = { enabled: true, provider: 'groq', key: trimmed, validatedAt: new Date().toISOString() }
      save()
      return null
    } catch {
      return 'Could not reach Groq from this browser. Check your connection and try again.'
    }
  }

  function disable(forgetKey = false) {
    settings.value = forgetKey
      ? defaults()
      : { ...settings.value, enabled: false }
    save()
  }

  function reenable() {
    if (settings.value.key && settings.value.validatedAt) {
      settings.value = { ...settings.value, enabled: true }
      save()
    }
  }

  return { settings, aiReady, validateAndEnable, disable, reenable }
}
