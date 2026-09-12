import { TARGET_RATE } from "./protocol";

export function mixToMono(pcm: Float32Array, channels: number): Float32Array {
  if (channels === 1) return pcm;
  const frames = Math.floor(pcm.length / channels);
  const out = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let acc = 0;
    for (let c = 0; c < channels; c++) acc += pcm[i * channels + c]!;
    out[i] = acc / channels;
  }
  return out;
}

export function resample(pcm: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return pcm;
  const n = Math.max(1, Math.round((pcm.length * toRate) / fromRate));
  const out = new Float32Array(n);
  const ratio = (pcm.length - 1) / Math.max(1, n - 1);
  for (let i = 0; i < n; i++) {
    const x = i * ratio;
    const i0 = Math.floor(x);
    const i1 = Math.min(pcm.length - 1, i0 + 1);
    const t = x - i0;
    out[i] = pcm[i0]! * (1 - t) + pcm[i1]! * t;
  }
  return out;
}

export function fadeEdges(pcm: Float32Array, rate: number, ms = 12): Float32Array {
  const n = Math.max(1, Math.round((ms / 1000) * rate));
  const out = pcm.slice();
  for (let i = 0; i < n && i < out.length; i++) {
    const w = 0.5 * (1 - Math.cos((Math.PI * i) / n));
    out[i]! *= w;
    out[out.length - 1 - i]! *= w;
  }
  return out;
}

export function floatToInt16(pcm: Float32Array): Int16Array {
  const out = new Int16Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    const x = Math.max(-1, Math.min(1, pcm[i]!));
    out[i] = Math.round(x * 32767);
  }
  return out;
}

export function int16ToFloat(pcm: Int16Array): Float32Array {
  const out = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) out[i] = pcm[i]! / 32768;
  return out;
}

export function prepareVoice(
  pcm: Float32Array,
  sampleRate: number,
  channels: number,
): {
  pcm: Int16Array;
  sampleRate: number;
  durationMs: number;
} {
  const mono = mixToMono(pcm, channels);
  const resampled = fadeEdges(resample(mono, sampleRate, TARGET_RATE), TARGET_RATE);
  const i16 = floatToInt16(resampled);
  return {
    pcm: i16,
    sampleRate: TARGET_RATE,
    durationMs: Math.round((i16.length / TARGET_RATE) * 1000),
  };
}

export function synthJingle(seconds = 4, rate = TARGET_RATE): Int16Array {
  const n = Math.round(seconds * rate);
  const out = new Float32Array(n);
  const notes = [392, 494, 587, 659, 587, 494, 392, 330];
  const beat = seconds / notes.length;
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const k = Math.min(notes.length - 1, Math.floor(t / beat));
    const f = notes[k]!;
    const env = Math.exp(-3.2 * (t - k * beat));
    const kick = Math.max(0, 1 - ((t % beat) / beat) * 4) * Math.sin(2 * Math.PI * 70 * t);
    out[i] = 0.42 * env * Math.sin(2 * Math.PI * f * t) + 0.18 * kick;
  }
  return floatToInt16(fadeEdges(out, rate, 20));
}

export async function decodeAudioFile(
  bytes: Uint8Array,
  filename: string,
  decodeAudioData: (buf: ArrayBuffer) => Promise<AudioBuffer>,
): Promise<{ pcm: Float32Array; sampleRate: number; channels: number; name: string }> {
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const buf = await decodeAudioData(copy as ArrayBuffer);
  const channels = buf.numberOfChannels >= 2 ? 2 : 1;
  const frames = buf.length;
  const interleaved = new Float32Array(frames * channels);
  const ch0 = buf.getChannelData(0);
  if (channels === 1) interleaved.set(ch0);
  else {
    const ch1 = buf.getChannelData(1);
    for (let i = 0; i < frames; i++) {
      interleaved[i * 2] = ch0[i]!;
      interleaved[i * 2 + 1] = ch1[i]!;
    }
  }
  void filename;
  return { pcm: interleaved, sampleRate: buf.sampleRate, channels, name: filename };
}
