/** Microphone in, features out. The buffer is not kept and is not played. */

export type EarFrame = {
  rms: number
  sub: number
  bass: number
  high: number
  flux: number
}

export type Ear = {
  stop: () => void
}

export async function openEar(onFrame: (frame: EarFrame) => void): Promise<Ear> {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new AudioCtx({ latencyHint: 'interactive' })
  await ctx.audioWorklet.addModule('/vybe/processor.js')
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    },
    video: false
  })
  const source = ctx.createMediaStreamSource(stream)
  const node = new AudioWorkletNode(ctx, 'vybe-ear')
  source.connect(node)
  node.port.onmessage = (event: MessageEvent<EarFrame>) => {
    onFrame(event.data)
  }
  if (ctx.state === 'suspended') await ctx.resume()

  return {
    stop() {
      node.port.onmessage = null
      try { source.disconnect() } catch { /* already gone */ }
      try { node.disconnect() } catch { /* already gone */ }
      for (const track of stream.getTracks()) track.stop()
      void ctx.close()
    }
  }
}
