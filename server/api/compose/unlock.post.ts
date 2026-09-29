import { assertComposeAccess } from '../../utils/compose-request'

/** Confirms the typed gate key without putting the expected value in the client bundle. */
export default defineEventHandler((event) => {
  assertComposeAccess(event)
  return { ok: true }
})
