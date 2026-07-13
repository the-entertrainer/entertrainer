import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ButtonConfig, ButtonState } from '~/types/buttoncraft'
import { STATE_LABELS } from './buttonDefaults'
import { buildButtonStyle } from './buttonStyle'
import { BUTTON_ICON_MARKUP } from './buttonIconMarkup'
import type { ButtonCraftIconName } from '~/components/tools/buttoncraft/Icon.vue'

// Transparent margin baked around every exported PNG so blurred/spread box
// -shadows (and the hover state's slight lift/scale) never get clipped by
// the canvas bounds. Kept identical across every state so the states stay
// pixel-aligned when swapped in as Storyline picture states.
const BLEED = 56

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '') || 'button'
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function styleToCss(style: Record<string, string | number>, overrides: Record<string, string> = {}): string {
  const merged: Record<string, string | number> = { ...style, ...overrides }
  return Object.entries(merged)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
    .join(';')
}

function iconSvg(name: string, size: number, color: string): string {
  const markup = BUTTON_ICON_MARKUP[name as ButtonCraftIconName]
  if (!markup) return ''
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="display:block;flex-shrink:0;color:${color}">${markup}</svg>`
}

/**
 * Renders one button state to a transparent PNG blob by serializing the
 * exact same style object the live preview uses (buttonStyle.ts) into a
 * self-contained SVG <foreignObject> — no external rasterizer involved, so
 * exported artwork can never drift from what the editor showed.
 */
async function renderStatePng(config: ButtonConfig, state: ButtonState, scale: number): Promise<Blob | null> {
  const { style, showCheckIcon } = buildButtonStyle(config, state)
  const w = parseFloat(String(style.width))
  const h = parseFloat(String(style.height))
  const svgW = w + BLEED * 2
  const svgH = h + BLEED * 2
  const color = String(style.color)
  const iconSize = Math.round(config.typography.fontSize * 1.1)

  const leftIcon = config.icon && config.iconPosition !== 'right' ? iconSvg(config.icon, iconSize, color) : ''
  const rightIcon = config.icon && config.iconPosition === 'right' ? iconSvg(config.icon, iconSize, color) : ''
  const label = config.iconPosition !== 'only'
    ? `<span style="line-height:1;white-space:nowrap;">${escapeHtml(config.label)}</span>`
    : ''
  const badge = showCheckIcon
    ? `<div style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:#14B8A6;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);">${iconSvg('check', 11, '#fff')}</div>`
    : ''

  // font-family values contain literal double quotes ("DM Sans", ...) —
  // escape them since buttonCss is embedded in a double-quoted attribute.
  const buttonCss = styleToCss(style, { position: 'absolute', left: `${BLEED}px`, top: `${BLEED}px` })
    .replace(/"/g, '&quot;')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}">` +
    `<foreignObject width="100%" height="100%">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${svgW}px;height:${svgH}px;position:relative;margin:0;padding:0;-webkit-font-smoothing:antialiased;">` +
    `<div style="${buttonCss}">${leftIcon}${label}${rightIcon}${badge}</div>` +
    `</div></foreignObject></svg>`

  const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Could not rasterize button artwork'))
    img.src = dataUri
  })

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(svgW * scale)
  canvas.height = Math.round(svgH * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0, svgW, svgH)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

function readme(name: string, states: ButtonState[], scales: number[]): string {
  return `ButtonCraft export — ${name}
================================

States exported: ${states.map(s => STATE_LABELS[s]).join(', ')}
Resolutions: ${scales.map(s => `${s}x`).join(', ')}
All PNGs have a transparent background, with a small transparent margin
kept around every state so shadows never get clipped and every state
lines up at the same size.

Importing into Articulate Storyline
------------------------------------
1. Insert the "_normal" image as your button and convert it to a button (or picture) object.
2. Right-click the object > States > add a state for each other export (Hover, Down,
   Visited, Disabled, Selected) and set that state's image to the matching PNG
   (e.g. the "_hover" file for the Hover state).
3. If you're publishing to a high-DPI/Retina display, use the @2x or @3x set;
   otherwise @1x matches the pixel size you designed at.
`
}

/** Renders every requested state and zips the resulting transparent PNGs. */
export async function exportButtonZip(
  config: ButtonConfig,
  projectName: string,
  states: ButtonState[],
  scales: number[]
): Promise<void> {
  if (!states.length || !scales.length) return

  const zip = new JSZip()
  const slug = slugify(projectName)

  for (const state of states) {
    for (const scale of scales) {
      const blob = await renderStatePng(config, state, scale)
      if (blob) zip.file(`${slug}_${state}@${scale}x.png`, blob)
    }
  }

  zip.file('README.txt', readme(projectName, states, scales))
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${slug}-buttoncraft.zip`)
}
