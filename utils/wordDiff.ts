/**
 * Word-level diff for Draftly's "what changed" view. Classic LCS over
 * whitespace-separated tokens, keeping the whitespace with each token so the
 * output reads as normal text. Inputs are emails, so O(n·m) is fine; very long
 * drafts fall back to a single replace block.
 */
export interface DiffPart { kind: 'same' | 'add' | 'del'; text: string }

export function wordDiff(before: string, after: string): DiffPart[] {
  const a = before.match(/\S+\s*/g) ?? []
  const b = after.match(/\S+\s*/g) ?? []
  if (a.length * b.length > 400_000) return [{ kind: 'del', text: before }, { kind: 'add', text: after }]
  const key = (t: string) => t.trim().toLowerCase()
  const n = a.length, m = b.length
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = key(a[i]!) === key(b[j]!) ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
    }
  }
  const out: DiffPart[] = []
  const push = (kind: DiffPart['kind'], text: string) => {
    const last = out[out.length - 1]
    if (last && last.kind === kind) last.text += text
    else out.push({ kind, text })
  }
  let i = 0, j = 0
  while (i < n && j < m) {
    if (key(a[i]!) === key(b[j]!)) { push('same', b[j]!); i++; j++ }
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) { push('del', a[i]!); i++ }
    else { push('add', b[j]!); j++ }
  }
  while (i < n) push('del', a[i++]!)
  while (j < m) push('add', b[j++]!)
  return out
}
