/**
 * Engage app icons: one source of truth for the in-page tiles and the
 * favicon / touch-icon files (scripts/build-app-icons.mjs mirrors this).
 * Tile: logo yellow #FFD43B squircle, ink #161618 glyph, glyph kept inside
 * the 24–76 safe box of a 100-unit canvas.
 */
export const APP_ICON_YELLOW = '#FFD43B'
export const APP_ICON_INK = '#161618'

/** Superellipse-like squircle (continuous curvature corners). */
export const SQUIRCLE = 'M50 0C86 0 100 14 100 50S86 100 50 100 0 86 0 50 14 0 50 0Z'

export type AppIconId = 'stack' | 'mind-reader' | 'astroclock' | 'whatto'

/** Inner SVG markup of each glyph, ink only. */
export const APP_GLYPHS: Record<AppIconId, string> = {
  // Three blocks, the top one slightly off-centre: the overlap game.
  stack:
    '<rect x="24" y="62" width="52" height="12" rx="2.5"/>' +
    '<rect x="29" y="46" width="42" height="12" rx="2.5"/>' +
    '<rect x="38" y="30" width="30" height="12" rx="2.5"/>',
  // An eye with a lit pupil: the mind being read.
  'mind-reader':
    '<path d="M22 50C30 36 40 30 50 30S70 36 78 50C70 64 60 70 50 70S30 64 22 50Z" fill="none" stroke="#161618" stroke-width="6" stroke-linejoin="round"/>' +
    '<circle cx="50" cy="50" r="10"/><circle cx="46" cy="46" r="3" fill="#FFD43B"/>',
  // A dial with hands and one planet on the rim.
  astroclock:
    '<circle cx="50" cy="50" r="24" fill="none" stroke="#161618" stroke-width="6"/>' +
    '<path d="M50 50V36M50 50L60 56" fill="none" stroke="#161618" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="50" cy="50" r="3.5"/><circle cx="71" cy="29" r="6.5" stroke="#FFD43B" stroke-width="3"/>',
  // A question mark: what to do next.
  whatto:
    '<path d="M38 40C38 32 43.5 27 50.5 27S62 31.5 62 38.5C62 47 50 48 50 58" fill="none" stroke="#161618" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="50" cy="71" r="5.5"/>'
}

export function appIconSvg(id: AppIconId, title = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${title ? `<title>${title}</title>` : ''}` +
    `<path d="${SQUIRCLE}" fill="${APP_ICON_YELLOW}"/><g fill="${APP_ICON_INK}">${APP_GLYPHS[id]}</g></svg>`
}
