import type { ButtonConfig, ButtonState, StateGenSettings } from '~/types/buttoncraft'
import { BUTTON_STATES } from '~/types/buttoncraft'

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function emptyStates(): ButtonConfig['states'] {
  return BUTTON_STATES.reduce((acc, s) => {
    acc[s] = {}
    return acc
  }, {} as ButtonConfig['states'])
}

export function defaultButtonConfig(): ButtonConfig {
  return {
    label: 'Continue',
    icon: undefined,
    iconPosition: 'left',
    width: 180,
    height: 52,
    paddingX: 24,
    paddingY: 14,
    borderRadius: 14,
    fillType: 'linear-gradient',
    fillColor: '#5B8DEF',
    gradient: { angle: 135, stops: [{ color: '#8B7CF6', pos: 0 }, { color: '#5B8DEF', pos: 55 }, { color: '#2DD4BF', pos: 100 }] },
    glassConfig: { tint: '#FFFFFF', tintOpacity: 0.14, blur: 18, borderOpacity: 0.28 },
    neumorphismConfig: { baseColor: '#E7E4DE', distance: 8, intensity: 0.5, blur: 18, inset: false },
    border: { width: 0, color: '#FFFFFF', style: 'none' },
    shadows: [
      { id: newId(), x: 0, y: 14, blur: 32, spread: -18, color: '#5B8DEF', opacity: 0.55, inset: false }
    ],
    typography: {
      fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: -0.2,
      textColor: '#FFFFFF',
      textTransform: 'none'
    },
    states: emptyStates()
  }
}

export function defaultStateGenSettings(): StateGenSettings {
  return { intensity: 0.5, disabledOpacity: 0.45, visitedEnabled: true, selectedEnabled: true }
}

export const STATE_LABELS: Record<ButtonState, string> = {
  normal: 'Normal',
  hover: 'Hover',
  down: 'Down',
  visited: 'Visited',
  disabled: 'Disabled',
  selected: 'Selected'
}
