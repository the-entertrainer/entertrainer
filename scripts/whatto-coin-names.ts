/**
 * Build utils/whatto/coin-ids.json: Binance base asset -> CoinGecko coin id + name.
 *
 *   node --experimental-strip-types scripts/whatto-coin-names.ts
 *
 * Source: CoinGecko keyless public API, /exchanges/binance/tickers (which tags
 * every Binance market with CoinGecko's own coin_id, so there is no guessing by
 * ticker symbol) and /coins/list for the display name. Only bases CoinGecko
 * itself mapped are written; anything else shows as a bare ticker in the app.
 * Market-cap ranks are NOT stored here; the server route fetches them live.
 */
import { writeFileSync } from 'node:fs'

const out = process.argv[2] ?? 'utils/whatto/coin-ids.json'
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
async function get(url: string): Promise<any> {
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (res.ok) return res.json()
    console.error(res.status, url, 'retrying')
    await sleep(15_000 * (i + 1)) // keyless tier: back off hard on 429
  }
  throw new Error(`failed ${url}`)
}

const ids: Record<string, string> = {}
for (let page = 1; page < 40; page++) {
  const d = await get(`https://api.coingecko.com/api/v3/exchanges/binance/tickers?page=${page}`)
  const t = d.tickers as { base: string; coin_id: string }[]
  if (!t.length) break
  for (const x of t) if (x.coin_id && !ids[x.base]) ids[x.base] = x.coin_id
  console.error('page', page, t.length, Object.keys(ids).length)
  await sleep(6_000)
}
const list = await get('https://api.coingecko.com/api/v3/coins/list') as { id: string; name: string }[]
const name = Object.fromEntries(list.map(c => [c.id, c.name]))
const rows: Record<string, [string, string]> = {}
for (const base of Object.keys(ids).sort()) if (name[ids[base]]) rows[base] = [ids[base], name[ids[base]]]
writeFileSync(out, JSON.stringify({ source: 'CoinGecko /exchanges/binance/tickers + /coins/list', builtAt: new Date().toISOString().slice(0, 10), coins: rows }))
console.error('wrote', out, Object.keys(rows).length)
