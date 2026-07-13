import type { ButtonConfig, ButtonTemplate } from '~/types/buttoncraft'
import { defaultButtonConfig, defaultStateGenSettings, emptyStates, newId } from './buttonDefaults'

function base(overrides: Partial<ButtonConfig>): ButtonConfig {
  return { ...defaultButtonConfig(), states: emptyStates(), ...overrides }
}

export const BUTTON_TEMPLATES: ButtonTemplate[] = [
  {
    id: 'aurora-gradient',
    name: 'Aurora Gradient',
    description: 'Violet → blue → teal, the confident default CTA.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.5 },
    button: base({
      label: 'Continue',
      fillType: 'linear-gradient',
      gradient: { angle: 135, stops: [{ color: '#8B7CF6', pos: 0 }, { color: '#5B8DEF', pos: 55 }, { color: '#2DD4BF', pos: 100 }] },
      borderRadius: 14,
      shadows: [{ id: newId(), x: 0, y: 14, blur: 32, spread: -18, color: '#5B8DEF', opacity: 0.55, inset: false }]
    })
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    description: 'Warm orange-to-pink, great for energetic prompts.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.55 },
    button: base({
      label: 'Get started',
      fillType: 'linear-gradient',
      gradient: { angle: 100, stops: [{ color: '#FF8A3D', pos: 0 }, { color: '#FF5E7E', pos: 60 }, { color: '#C2409B', pos: 100 }] },
      borderRadius: 16,
      shadows: [{ id: newId(), x: 0, y: 12, blur: 30, spread: -16, color: '#FF5E7E', opacity: 0.5, inset: false }]
    })
  },
  {
    id: 'midnight-glass',
    name: 'Midnight Glass',
    description: 'Frosted glass tile over dark scenes — check on Storyline background.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.4 },
    button: base({
      label: 'Next',
      fillType: 'glassmorphism',
      glassConfig: { tint: '#FFFFFF', tintOpacity: 0.12, blur: 18, borderOpacity: 0.32 },
      typography: { ...defaultButtonConfig().typography, textColor: '#FFFFFF' },
      borderRadius: 16,
      shadows: [{ id: newId(), x: 0, y: 10, blur: 26, spread: -14, color: '#000000', opacity: 0.35, inset: false }]
    })
  },
  {
    id: 'sky-glass',
    name: 'Sky Glass',
    description: 'A cool, light glass tile for bright, airy scenes.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.4 },
    button: base({
      label: 'Next',
      fillType: 'glassmorphism',
      glassConfig: { tint: '#5B8DEF', tintOpacity: 0.18, blur: 16, borderOpacity: 0.4 },
      typography: { ...defaultButtonConfig().typography, textColor: '#0D2A55' },
      borderRadius: 16,
      shadows: [{ id: newId(), x: 0, y: 8, blur: 22, spread: -12, color: '#5B8DEF', opacity: 0.3, inset: false }]
    })
  },
  {
    id: 'soft-clay',
    name: 'Soft Clay',
    description: 'Raised neumorphism — a soft, tactile push-button feel.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.5 },
    button: base({
      label: 'Continue',
      fillType: 'neumorphism',
      neumorphismConfig: { baseColor: '#E7E4DE', distance: 8, intensity: 0.5, blur: 18, inset: false },
      typography: { ...defaultButtonConfig().typography, textColor: '#3A362E' },
      borderRadius: 18,
      border: { width: 0, color: '#FFFFFF', style: 'none' }
    })
  },
  {
    id: 'pressed-clay',
    name: 'Pressed Clay',
    description: 'Inset neumorphism — reads as already-pressed into the surface.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.35 },
    button: base({
      label: 'Select',
      fillType: 'neumorphism',
      neumorphismConfig: { baseColor: '#22252B', distance: 6, intensity: 0.55, blur: 14, inset: true },
      typography: { ...defaultButtonConfig().typography, textColor: '#DCE0E6' },
      borderRadius: 14,
      border: { width: 0, color: '#FFFFFF', style: 'none' }
    })
  },
  {
    id: 'solid-coral',
    name: 'Solid Coral',
    description: 'Flat, high-contrast solid fill for urgent or destructive actions.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.6 },
    button: base({
      label: 'Delete',
      fillType: 'solid',
      fillColor: '#EF5B5B',
      borderRadius: 10,
      shadows: [{ id: newId(), x: 0, y: 8, blur: 18, spread: -10, color: '#EF5B5B', opacity: 0.4, inset: false }]
    })
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'Flat, borderless, no-shadow — for dense UI where restraint wins.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.3 },
    button: base({
      label: 'Continue',
      fillType: 'solid',
      fillColor: '#0D0C0A',
      borderRadius: 8,
      shadows: []
    })
  },
  {
    id: 'outline-ghost',
    name: 'Outline Ghost',
    description: 'Transparent fill, visible border only — a secondary action.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.35 },
    button: base({
      label: 'Cancel',
      fillType: 'solid',
      fillColor: 'rgba(91,141,239,0.06)',
      border: { width: 2, color: '#5B8DEF', style: 'solid' },
      typography: { ...defaultButtonConfig().typography, textColor: '#5B8DEF' },
      borderRadius: 14,
      shadows: []
    })
  },
  {
    id: 'teal-pill',
    name: 'Teal Pill',
    description: 'Fully rounded solid pill — friendly, compact secondary CTA.',
    stateGen: { ...defaultStateGenSettings(), intensity: 0.45 },
    button: base({
      label: 'Submit',
      fillType: 'solid',
      fillColor: '#2DD4BF',
      borderRadius: 999,
      width: 160,
      height: 46,
      typography: { ...defaultButtonConfig().typography, textColor: '#083832' },
      shadows: [{ id: newId(), x: 0, y: 10, blur: 22, spread: -12, color: '#2DD4BF', opacity: 0.45, inset: false }]
    })
  }
]

export function findTemplate(id: string): ButtonTemplate | undefined {
  return BUTTON_TEMPLATES.find(t => t.id === id)
}
