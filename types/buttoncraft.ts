// Data model for ButtonCraft (/tools/buttoncraft). A project holds one
// button design; the button's "normal" state is the source of truth and
// every other state is either auto-generated (useStateGeneration) or
// manually overridden by the user.

export type ButtonState = 'normal' | 'hover' | 'down' | 'visited' | 'disabled' | 'selected'

export const BUTTON_STATES: ButtonState[] = ['normal', 'hover', 'down', 'visited', 'disabled', 'selected']

export type FillType = 'solid' | 'linear-gradient' | 'glassmorphism' | 'neumorphism'
export type IconPosition = 'left' | 'right' | 'only'

export interface GradientStop {
  color: string
  pos: number // 0-100
}

export interface GradientConfig {
  angle: number // degrees
  stops: GradientStop[]
}

export interface GlassConfig {
  tint: string
  tintOpacity: number   // 0-1
  blur: number          // px
  borderOpacity: number // 0-1
}

export interface NeumorphismConfig {
  baseColor: string
  distance: number   // px offset of the light/dark shadow pair
  intensity: number  // 0-1, how dark/light the shadow pair gets
  blur: number        // px
  inset: boolean       // pressed / inset look vs raised
}

export interface BorderConfig {
  width: number
  color: string
  style: 'solid' | 'dashed' | 'none'
}

export interface ShadowLayer {
  id: string
  x: number
  y: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

export interface TypographyConfig {
  fontFamily: string
  fontSize: number
  fontWeight: number
  letterSpacing: number
  textColor: string
  textTransform: 'none' | 'uppercase' | 'capitalize'
}

// Per-state overrides, layered on top of the Normal state at render time.
// `brightness` / `saturate` / `hueRotate` / `shadowLift` / `shadowPress` are
// the knobs useStateGeneration writes automatically — a single color +
// shadow nudge (baked into every color by buildButtonStyle, not applied as
// a CSS filter — see utils/buttonStyle.ts) reads correctly no matter which
// fillType Normal uses, so the generator never has to understand
// gradients/glass/neumorphism internals.
// `fillColor` / `textColor` / `borderColor` / `borderWidth` are manual pins:
// once a user sets one, it replaces the generated look for that field.
export interface StateOverride {
  brightness?: number   // 1 = unchanged — mirrors CSS brightness(), baked into colors
  saturate?: number     // 1 = unchanged — mirrors CSS saturate(), baked into colors
  hueRotate?: number    // degrees, 0 = unchanged — the "visited" accent shift
  opacity?: number      // 0-1
  scale?: number        // 1 = unchanged
  translateY?: number   // px
  shadowLift?: number   // px added to each shadow layer's y and blur (+lift/-tuck)
  shadowSoften?: number // 0-1, reduces shadow blur + opacity (disabled)
  shadowPress?: boolean // adds an inset pressed shadow (down state)
  fillColor?: string    // manual pin — solid override of the background
  textColor?: string
  borderColor?: string
  borderWidth?: number
  showCheckIcon?: boolean
  cursor?: string
}

export interface ButtonConfig {
  label: string
  icon?: string
  iconPosition: IconPosition

  width: number
  height: number
  paddingX: number
  paddingY: number
  borderRadius: number

  fillType: FillType
  fillColor: string
  gradient: GradientConfig
  glassConfig: GlassConfig
  neumorphismConfig: NeumorphismConfig

  border: BorderConfig
  shadows: ShadowLayer[]

  typography: TypographyConfig

  states: Record<ButtonState, StateOverride>
}

export interface StateGenSettings {
  intensity: number // 0-1
  disabledOpacity: number // 0-1
  visitedEnabled: boolean
  selectedEnabled: boolean
}

export interface ButtonProject {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  button: ButtonConfig
  stateGen: StateGenSettings
  templateId?: string
}

export interface ButtonTemplate {
  id: string
  name: string
  description: string
  button: ButtonConfig
  stateGen: StateGenSettings
}
