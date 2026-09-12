export interface CaptureResult {
  pcm: Float32Array;
  sampleRate: number;
  channels: 1;
  durationMs: number;
}

export interface VoiceCapture {
  stop: () => Promise<CaptureResult>;
}

function concatFloat(chunks: Float32Array[]): Float32Array {
  let n = 0;
  for (const c of chunks) n += c.length;
  const out = new Float32Array(n);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

export async function startVoiceCapture(opts: {
  onLevel?: (rms: number) => void;
  onTick?: (elapsedMs: number) => void;
}): Promise<VoiceCapture> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("this browser can't record. use a clip instead.");
  }
  const ctx = new AudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });
  if (ctx.state === "suspended") await ctx.resume();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);

  const chunks: Float32Array[] = [];
  const started = performance.now();
  let stopped = false;
  let proc: ScriptProcessorNode | null = null;

  const mute = ctx.createGain();
  mute.gain.value = 0;

  if (typeof ctx.createScriptProcessor === "function") {
    proc = ctx.createScriptProcessor(4096, 1, 1);
    proc.onaudioprocess = (ev) => {
      if (stopped) return;
      chunks.push(ev.inputBuffer.getChannelData(0).slice());
    };
    analyser.connect(proc);
    proc.connect(mute);
    mute.connect(ctx.destination);
  } else {
    const tap = new Float32Array(analyser.fftSize);
    const pump = () => {
      if (stopped) return;
      analyser.getFloatTimeDomainData(tap);
      chunks.push(tap.slice());
      requestAnimationFrame(pump);
    };
    requestAnimationFrame(pump);
  }

  const levelBuf = new Uint8Array(analyser.frequencyBinCount);
  let raf = 0;
  const tick = () => {
    if (stopped) return;
    analyser.getByteTimeDomainData(levelBuf);
    let acc = 0;
    for (let i = 0; i < levelBuf.length; i++) {
      const v = (levelBuf[i]! - 128) / 128;
      acc += v * v;
    }
    opts.onLevel?.(Math.sqrt(acc / levelBuf.length));
    opts.onTick?.(performance.now() - started);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const handle: VoiceCapture = {
    async stop() {
      if (stopped) {
        return { pcm: concatFloat(chunks), sampleRate: ctx.sampleRate, channels: 1, durationMs: 0 };
      }
      stopped = true;
      cancelAnimationFrame(raf);
      try {
        proc?.disconnect();
      } catch {
        /* already down */
      }
      try {
        analyser.disconnect();
        source.disconnect();
        mute.disconnect();
      } catch {
        /* already down */
      }
      for (const t of stream.getTracks()) t.stop();
      const pcm = concatFloat(chunks);
      const durationMs = Math.round((pcm.length / ctx.sampleRate) * 1000);
      try {
        await ctx.close();
      } catch {
        /* closed */
      }
      return { pcm, sampleRate: ctx.sampleRate, channels: 1, durationMs };
    },
  };
  return handle;
}
