import matrix from '../content/redirects.json'

type Exact = { from: string; to: string }
type Prefix = { from: string; to: string; fixed?: boolean }

const data = matrix as { exact: Exact[]; prefix: Prefix[] }

/** Nitro routeRules for spec §5.2. Every path redirect is statusCode 301. */
export function buildRedirectRules(): Record<string, { redirect: { to: string; statusCode: 301 } }> {
  const rules: Record<string, { redirect: { to: string; statusCode: 301 } }> = {}
  for (const row of data.exact) {
    rules[row.from] = { redirect: { to: row.to, statusCode: 301 } }
  }
  for (const row of data.prefix) {
    // `/about/**` also matches `/about` in Nitro and 301s it to itself.
    // Child slugs are redirected by the slashless middleware instead.
    if (row.from === '/about/') continue
    const source = `${row.from.replace(/\/$/, '')}/**`
    const destination = row.fixed ? row.to : `${row.to.replace(/\/$/, '')}/**`
    rules[source] = { redirect: { to: destination, statusCode: 301 } }
  }
  return rules
}
