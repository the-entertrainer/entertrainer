/**
 * Token contrast gate.
 *
 * Reads the real token values out of assets/css/main.css and asserts every
 * foreground/background pair the site actually renders. This exists because
 * `--color-accent` shipped identical in both themes for a long time, measuring
 * 1.86:1 on the dark ground — the instructional-design load meter was a dark bar
 * on a dark track and nothing caught it.
 *
 * Usage: node scripts/check-contrast.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const css = readFileSync(join(root, 'assets/css/main.css'), 'utf8')

/** Pull `--name: #hex;` out of a `[data-theme="x"] { … }` block. */
function token(theme, name) {
  const block = css.match(new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`))
  if (!block) throw new Error(`no ${theme} theme block`)
  const m = block[1].match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))
  if (!m) throw new Error(`--${name} not a literal hex in ${theme}`)
  return m[1]
}

const chan = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const lum = hex => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * chan((n >> 16) & 255) + 0.7152 * chan((n >> 8) & 255) + 0.0722 * chan(n & 255)
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [label, foreground, background, floor]. 4.5 = body/UI text, 3.0 = large text
// and non-text indicators (meter fills, active borders) per WCAG 1.4.11.
const CASES = []
for (const theme of ['dark', 'light']) {
  const bg = token(theme, 'color-bg')
  const text = token(theme, 'color-text')
  const accent = token(theme, 'color-accent')
  const ink = token(theme, 'color-accent-ink')
  CASES.push(
    [`${theme}: body text on bg`,          text,   bg,     4.5],
    [`${theme}: accent on bg (links)`,     accent, bg,     4.5],
    [`${theme}: ink on accent fill`,       ink,    accent, 4.5],
  )
}

let failed = 0
for (const [label, fg, bg, floor] of CASES) {
  const r = ratio(fg, bg)
  const ok = r >= floor
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(32)} ${fg} on ${bg}  ${r.toFixed(2)}:1 (need ${floor})`)
}
console.log(failed ? `\n${failed} pair(s) below floor` : '\nall pairs clear their floor')
process.exit(failed ? 1 : 0)
