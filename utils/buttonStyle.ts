import type { ButtonConfig, ButtonState, ShadowLayer } from '~/types/buttoncraft'
import { adjustBrightness, adjustSaturation, darken, lighten, rotateHue, toRgba } from './buttonColor'

export interface ComputedButtonStyle {
  style: Record<string, string | number>
  disabled: boolean
  showCheckIcon: boolean
}

// State color adjustments (brightness/saturate/hueRotate) are baked directly
// into every color below rather than applied as a CSS `filter`. html2canvas
// — used for the PNG export — does not support `filter`, so relying on it
// would make exported states look identical to Normal. Baking the math in
// keeps the live preview and the export pixel-identical everywhere.
function adjust(hex: string, brightness: number, saturate: number, hueRotate: number): string {
  let c = hex
  if (hueRotate) c = rotateHue(c, hueRotate)
  if (saturate !== 1) c = adjustSaturation(c, saturate)
  if (brightness !== 1) c = adjustBrightness(c, brightness)
  return c
}

function buildShadowCss(shadows: ShadowLayer[], lift: number, soften: number, brightness: number, saturate: number, hueRotate: number): string {
  if (!shadows.length) return 'none'
  return shadows
    .map(s => {
      const blur = Math.max(0, (s.blur + lift) * (1 - soften * 0.6))
      const opacity = s.opacity * (1 - soften * 0.5)
      const color = adjust(s.color, brightness, saturate, hueRotate)
      return `${s.inset ? 'inset ' : ''}${s.x}px ${s.y + lift}px ${blur}px ${s.spread}px ${toRgba(color, opacity)}`
    })
    .join(', ')
}

function buildNeumorphismShadow(base: string, distance: number, intensity: number, blur: number, inset: boolean, lift: number): string {
  const light = lighten(base, 0.25 + intensity * 0.4)
  const dark = darken(base, 0.2 + intensity * 0.45)
  const d = distance + lift
  const pre = inset ? 'inset ' : ''
  return [
    `${pre}${-d}px ${-d}px ${blur}px ${toRgba(light, 0.9)}`,
    `${pre}${d}px ${d}px ${blur}px ${toRgba(dark, 0.55)}`
  ].join(', ')
}

function buildGradientCss(config: ButtonConfig, brightness: number, saturate: number, hueRotate: number): string {
  const stops = [...config.gradient.stops]
    .sort((a, b) => a.pos - b.pos)
    .map(s => `${adjust(s.color, brightness, saturate, hueRotate)} ${s.pos}%`)
    .join(', ')
  return `linear-gradient(${config.gradient.angle}deg, ${stops})`
}

/**
 * Turns a ButtonConfig + which state is being rendered into a plain style
 * object for `:style`. Used identically by the live preview and the
 * offscreen export renderer, so what you design is exactly what you export.
 */
export function buildButtonStyle(config: ButtonConfig, state: ButtonState): ComputedButtonStyle {
  const o = config.states[state] || {}
  const disabled = state === 'disabled'

  const brightness = o.brightness ?? 1
  const saturate = o.saturate ?? 1
  const hueRotate = o.hueRotate ?? 0
  const lift = o.shadowLift ?? 0
  const soften = o.shadowSoften ?? 0

  let background = ''
  let backdropFilter = 'none'
  let boxShadow: string

  if (o.fillColor) {
    // Manual pin always wins, regardless of the base fill type.
    background = o.fillColor
    boxShadow = buildShadowCss(config.shadows, lift, soften, brightness, saturate, hueRotate)
  } else if (config.fillType === 'linear-gradient') {
    background = buildGradientCss(config, brightness, saturate, hueRotate)
    boxShadow = buildShadowCss(config.shadows, lift, soften, brightness, saturate, hueRotate)
  } else if (config.fillType === 'glassmorphism') {
    const g = config.glassConfig
    const tint = adjust(g.tint, brightness, saturate, hueRotate)
    background = `linear-gradient(180deg, ${toRgba(lighten(tint, 0.4), g.tintOpacity * 1.15)}, ${toRgba(tint, g.tintOpacity)})`
    backdropFilter = `blur(${g.blur}px) saturate(1.4)`
    boxShadow = buildShadowCss(config.shadows, lift, soften, brightness, saturate, hueRotate)
  } else if (config.fillType === 'neumorphism') {
    const n = config.neumorphismConfig
    const base = adjust(n.baseColor, brightness, saturate, hueRotate)
    background = base
    boxShadow = buildNeumorphismShadow(base, n.distance, n.intensity, n.blur, n.inset || !!o.shadowPress, lift)
  } else {
    background = adjust(config.fillColor, brightness, saturate, hueRotate)
    boxShadow = buildShadowCss(config.shadows, lift, soften, brightness, saturate, hueRotate)
  }

  if (o.shadowPress && config.fillType !== 'neumorphism') {
    boxShadow += `, inset 0 2px 6px ${toRgba('#000000', 0.35)}`
  }

  const borderWidth = o.borderWidth ?? config.border.width
  const borderColor = adjust(o.borderColor ?? config.border.color, brightness, saturate, hueRotate)
  const border = config.fillType === 'glassmorphism'
    ? `${borderWidth}px ${config.border.style} ${toRgba('#ffffff', config.glassConfig.borderOpacity)}`
    : (config.border.style === 'none' ? 'none' : `${borderWidth}px ${config.border.style} ${borderColor}`)

  const transform = `scale(${o.scale ?? 1}) translateY(${o.translateY ?? 0}px)`

  const t = config.typography
  const style: Record<string, string | number> = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: config.icon && config.iconPosition === 'only' ? `${config.height}px` : `${config.width}px`,
    height: `${config.height}px`,
    padding: `${config.paddingY}px ${config.paddingX}px`,
    borderRadius: `${config.borderRadius}px`,
    background,
    backdropFilter,
    border,
    boxShadow,
    color: o.textColor ?? t.textColor,
    fontFamily: t.fontFamily,
    fontSize: `${t.fontSize}px`,
    fontWeight: t.fontWeight,
    letterSpacing: `${t.letterSpacing}px`,
    textTransform: t.textTransform,
    opacity: o.opacity ?? 1,
    transform,
    cursor: o.cursor ?? (disabled ? 'not-allowed' : 'pointer'),
    transition: 'background 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease, opacity 0.18s ease',
    boxSizing: 'border-box',
    userSelect: 'none'
  }

  return { style, disabled, showCheckIcon: !!o.showCheckIcon }
}
