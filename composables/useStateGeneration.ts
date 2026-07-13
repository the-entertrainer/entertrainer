import type { ButtonConfig, ButtonState, StateGenSettings, StateOverride } from '~/types/buttoncraft'

// The auto-generated fields per state — a single filter/shadow/transform
// nudge that reads correctly no matter which fillType Normal uses. Manual
// pins (fillColor / textColor / borderColor / borderWidth) live outside
// this set, so re-running generation never clobbers a user's hand edits.
const AUTO_FIELDS = [
  'brightness', 'saturate', 'hueRotate', 'opacity', 'scale', 'translateY',
  'shadowLift', 'shadowSoften', 'shadowPress', 'showCheckIcon', 'cursor'
] as const

function autoOverride(partial: Partial<StateOverride>): Partial<StateOverride> {
  return partial
}

/**
 * Computes the auto-generated slice of every state's override from Normal +
 * the intensity/opacity controls, then merges it back in — preserving any
 * manual pins the user already set. Re-runnable: call again after tweaking
 * intensity and only the generated fields move.
 */
export function useStateGeneration() {
  function generateAllStates(config: ButtonConfig, settings: StateGenSettings): ButtonConfig['states'] {
    const t = settings.intensity

    const generated: Record<ButtonState, Partial<StateOverride>> = {
      normal: {},
      hover: autoOverride({
        brightness: 1 + 0.16 * t,
        saturate: 1 + 0.05 * t,
        scale: 1 + 0.015 * t,
        translateY: -(1 + 2 * t),
        shadowLift: 3 + 7 * t,
        cursor: 'pointer'
      }),
      down: autoOverride({
        brightness: 1 - 0.18 * t,
        scale: 1 - 0.03 * t,
        translateY: 1 + 1.5 * t,
        shadowLift: -(2 + 4 * t),
        shadowPress: true,
        cursor: 'pointer'
      }),
      disabled: autoOverride({
        opacity: settings.disabledOpacity,
        saturate: 1 - (0.45 + 0.25 * t),
        shadowSoften: 0.6 + 0.3 * t,
        cursor: 'not-allowed'
      }),
      visited: settings.visitedEnabled ? autoOverride({
        hueRotate: 18 + 22 * t,
        saturate: 1 - 0.1 * t,
        showCheckIcon: true,
        cursor: 'pointer'
      }) : {},
      selected: settings.selectedEnabled ? autoOverride({
        brightness: 1 + 0.06 * t,
        saturate: 1 + 0.15 * t,
        scale: 1 + 0.01 * t,
        showCheckIcon: true,
        cursor: 'pointer'
      }) : {}
    }

    const next = {} as ButtonConfig['states']
    for (const state of Object.keys(generated) as ButtonState[]) {
      const existing = config.states[state] || {}
      const manualPins: Partial<StateOverride> = {}
      for (const [key, value] of Object.entries(existing)) {
        if (!(AUTO_FIELDS as readonly string[]).includes(key)) {
          (manualPins as any)[key] = value
        }
      }
      next[state] = { ...generated[state], ...manualPins }
    }
    return next
  }

  return { generateAllStates }
}
