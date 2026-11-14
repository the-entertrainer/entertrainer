export function uid(prefix = 'id'): string {
  const cryptoObj = globalThis.crypto
  if (cryptoObj?.randomUUID) return `${prefix}-${cryptoObj.randomUUID()}`
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
