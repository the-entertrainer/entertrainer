/**
 * Slashless destination for a path that already has no trailing slash.
 * Mirrors the §5.2 matrix so a slashed URL jumps straight to the final
 * target instead of bouncing through the slashless path first.
 */
import matrix from '../../content/redirects.json'

type Exact = { from: string; to: string }
type Prefix = { from: string; to: string; fixed?: boolean }

const data = matrix as { exact: Exact[]; prefix: Prefix[] }
const EXACT = new Map(data.exact.map((row) => [row.from, row.to]))

export function slashlessTarget(path: string): string {
  const exact = EXACT.get(path)
  if (exact) return exact
  for (const row of data.prefix) {
    if (!path.startsWith(row.from)) continue
    const rest = path.slice(row.from.length)
    // Public files live beside these routes (`/about/naveen-portrait.jpg`).
    // Only extensionless slugs are redirects.
    if (rest.includes('.')) continue
    if (row.fixed) return row.to
    return row.to + rest
  }
  return path
}
