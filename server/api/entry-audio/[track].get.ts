import { createError, defineEventHandler, getRouterParam } from 'h3'

const tracks: Record<string, string> = {
  narration: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/stdGqWjSCMGhhsZs.mp3',
  ambient: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/sjbGflQLyvJrZlWl.mp3'
}

export default defineEventHandler(async (event) => {
  const track = getRouterParam(event, 'track')
  const source = track ? tracks[track] : undefined
  if (!source) throw createError({ statusCode: 404, statusMessage: 'Entry audio track not found' })

  const response = await fetch(source)
  if (!response.ok) throw createError({ statusCode: 502, statusMessage: 'Entry audio unavailable' })

  return new Response(await response.arrayBuffer(), {
    headers: {
      'content-type': response.headers.get('content-type') || 'audio/mpeg',
      'cache-control': 'public, max-age=31536000, immutable'
    }
  })
})
