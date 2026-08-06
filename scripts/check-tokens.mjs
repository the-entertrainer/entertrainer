/**
 * Design-token gate.
 *
 * Fails when a token declared in assets/css/main.css has no `var()` consumer
 * anywhere in the source, and when a `var(--x)` names a token that is never
 * declared.
 *
 * This exists because the repo has now made the same mistake twice. POLISH_PLAN.md
 * records a pass that "established a named type scale" whose every rung was still
 * unused months later; the pass that cleaned that up then introduced --elev-4,
 * --ring-hairline, --text-h2 and --chrome-ink-dim and wired up none of them. A
 * token nobody consumes is worse than no token: it makes the file lie about what
 * the system is.
 *
 * Usage: node scripts/check-tokens.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKIP_DIRS = new Set(['node_modules', '.nuxt', '.vercel', '.git', 'Inspiration', '.output', '.sweep'])
const SELF = 'scripts/check-tokens.mjs'
const EXTS = /\.(vue|ts|js|mjs|css)$/

/** Tokens that are legitimately declared without a var() consumer. */
const ALLOWED_UNUSED = new Set([
  // Published imperatively onto documentElement by GlassBackdrop/Backdrop and
  // read through var() with fallbacks; declared nowhere, consumed everywhere.
])

/** Tokens set at runtime from JS rather than declared in CSS. */
const RUNTIME_DEFINED = new Set(['--accent-fog', '--grad-1', '--grad-2', '--grad-3'])

/**
 * Token names assembled at runtime, which no static reader can resolve.
 * `--st-t` is Strong's tier ramp, built as `var(--st-t${index})`
 * (components/work/strong/StrengthBar.vue:14) against the real --st-t0..t4.
 */
const DYNAMIC_PREFIXES = ['--st-t']

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (EXTS.test(name)) out.push(full)
  }
  return out
}

const files = walk(ROOT).filter(f => relative(ROOT, f) !== SELF)

// Declarations: only the global token file. Component-scoped custom properties
// (StoryGen's --sg-*, Strong's --st-*, Menu's --chrome-*) are local contracts and
// are checked as references, not as declarations.
const mainCss = readFileSync(join(ROOT, 'assets/css/main.css'), 'utf8')
const declared = new Map()
for (const m of mainCss.matchAll(/(?:^|[{;\s])(--[a-z0-9-]+)\s*:/gim)) {
  const line = mainCss.slice(0, m.index).split('\n').length
  if (!declared.has(m[1])) declared.set(m[1], line)
}

// References across the whole source tree, plus every locally-declared token so a
// component's own properties don't read as dangling.
const used = new Set()
const localDeclared = new Set()
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) used.add(m[1])
  for (const m of src.matchAll(/(?:^|[{;\s])(--[a-z0-9-]+)\s*:/gim)) localDeclared.add(m[1])
  // Inline style bindings:  :style="{ '--cg-cols': columns }"
  for (const m of src.matchAll(/['"](--[a-z0-9-]+)['"]\s*:/gi)) localDeclared.add(m[1])
  // Imperative:  root.setProperty('--accent-fog', …)
  for (const m of src.matchAll(/setProperty\(\s*['"`](--[a-z0-9-]+)/gi)) localDeclared.add(m[1])
}

const dead = [...declared].filter(([t]) => !used.has(t) && !ALLOWED_UNUSED.has(t))
const dangling = [...used].filter(t =>
  !localDeclared.has(t) &&
  !RUNTIME_DEFINED.has(t) &&
  !DYNAMIC_PREFIXES.includes(t))

if (dead.length) {
  console.log(`\nDEAD — declared in main.css, never consumed (${dead.length}):`)
  for (const [t, line] of dead) console.log(`  assets/css/main.css:${line}  ${t}`)
}
if (dangling.length) {
  console.log(`\nDANGLING — var() references a token nothing declares (${dangling.length}):`)
  for (const t of dangling) {
    const where = files.filter(f => readFileSync(f, 'utf8').includes(`var(${t}`))
      .map(f => relative(ROOT, f)).slice(0, 3).join(', ')
    console.log(`  ${t}  — used in ${where}`)
  }
}

const failed = dead.length + dangling.length
console.log(failed
  ? `\n${failed} token problem(s). Either wire it up or delete it.`
  : `\nall ${declared.size} tokens in main.css have consumers, and every var() resolves`)
process.exit(failed ? 1 : 0)
