/** Public capability ping for Dialogue — no env / key / provider leakage. */
export default defineEventHandler(() => ({
  ok: true,
  service: 'dialogue-canon',
  version: 3
}))
