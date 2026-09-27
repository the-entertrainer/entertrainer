// Local CC0 recordings plus a large bank of short generated combat voices.
export function createAudio(onError = () => {}) {
  let context, master, filter, ready, running = false, musicOn = true, sfxOn = true;
  let loaded = 0, failures = 0, plays = 0;
  const buffers = new Map(), banks = { crunch: [], swish: [], slash: [], gun: [], ricochet: [], spark: [] };
  const voices = new Set();
  const music = new Audio('./audio/clocktower.mp3');
  music.loop = true; music.preload = 'none';
  music.addEventListener('error', () => { failures++; onError('Music could not load. Effects and gameplay still work.'); });

  function sync() {
    if (!context) return;
    if (running && musicOn && !document.hidden) music.play().catch(() => {});
    else music.pause();
  }

  function noise(n, color = 'brown') {
    const data = new Float32Array(n);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const white = Math.random() * 2 - 1;
      if (color === 'white') data[i] = white;
      else if (color === 'pink') {
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.57 * b2 + white * 1.052691;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
      } else {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
    }
    return data;
  }

  function bufferFrom(data) {
    const buffer = context.createBuffer(1, data.length, context.sampleRate);
    buffer.getChannelData(0).set(data);
    return buffer;
  }

  function env(i, n, a, p) {
    const t = i / n;
    return Math.min(1, t / Math.max(0.002, a)) * Math.pow(1 - t, p);
  }

  function buildBanks() {
    const rate = context.sampleRate;
    for (let k = 0; k < 48; k++) {
      const n = Math.floor(rate * (0.034 + Math.random() * 0.055));
      const out = new Float32Array(n);
      const body = noise(n, 'brown');
      const shell = noise(n, 'pink');
      const click = noise(n, 'white');
      const snap = 0.55 + Math.random() * 0.5;
      const crackle = 9 + (k % 7);
      for (let i = 0; i < n; i++) {
        const gate = env(i, n, 0.003, 2.8 + (k % 5) * 0.15);
        const pop = Math.sin(i / rate * (420 + k * 11)) * Math.exp(-i / n * 14);
        const grit = (i % crackle === 0 ? click[i] * 1.8 : 0);
        out[i] = (body[i] * 0.7 + shell[i] * 0.45 + grit * 0.35 + pop * 0.2) * gate * snap;
      }
      banks.crunch.push(bufferFrom(out));
    }
    for (let k = 0; k < 24; k++) {
      const n = Math.floor(rate * (0.08 + Math.random() * 0.09));
      const air = noise(n, 'pink');
      const out = new Float32Array(n);
      const start = 180 + k * 17, end = 980 + k * 30;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const freq = start + (end - start) * t;
        const sweep = Math.sin(Math.PI * t) * (t < 0.18 ? t / 0.18 : Math.pow(1 - t, 1.1));
        const tone = Math.sin(i / rate * freq * Math.PI * 2);
        out[i] = (air[i] * 0.7 + tone * 0.22) * sweep * (0.42 + Math.random() * 0.16);
      }
      banks.swish.push(bufferFrom(out));
    }
    for (let k = 0; k < 20; k++) {
      const n = Math.floor(rate * (0.038 + Math.random() * 0.04));
      const src = noise(n, 'white');
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const metal = Math.sin(i * (0.19 + k * 0.008)) * Math.exp(-i / n * 8);
        out[i] = (src[i] * env(i, n, 0.0018, 3.4) + metal * 0.32) * 0.72;
      }
      banks.slash.push(bufferFrom(out));
    }
    for (let k = 0; k < 16; k++) {
      const n = Math.floor(rate * (0.042 + Math.random() * 0.03));
      const src = noise(n, 'white');
      const body = noise(n, 'brown');
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const punch = env(i, n, 0.0012, 5.8);
        const thump = Math.sin(i * (0.07 + (k % 4) * 0.004)) * env(i, n, 0.002, 4.2);
        out[i] = src[i] * punch * 0.85 + body[i] * punch * 0.4 + thump * 0.45;
      }
      banks.gun.push(bufferFrom(out));
    }
    for (let k = 0; k < 12; k++) {
      const n = Math.floor(rate * (0.05 + Math.random() * 0.04));
      const out = new Float32Array(n);
      const f = 0.28 + Math.random() * 0.2;
      for (let i = 0; i < n; i++) {
        out[i] = Math.sin(i * f) * Math.exp(-i / n * (4.6 + Math.random() * 3)) * (0.38 + Math.random() * 0.22);
        if (i < n * 0.08) out[i] += (Math.random() * 2 - 1) * 0.12;
      }
      banks.ricochet.push(bufferFrom(out));
    }
    for (let k = 0; k < 10; k++) {
      const n = Math.floor(rate * (0.024 + Math.random() * 0.02));
      const src = noise(n, 'white');
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = src[i] * env(i, n, 0.001, 4.4) * 0.32;
      banks.spark.push(bufferFrom(out));
    }
  }

  function unlock() {
    try {
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        master = context.createGain(); master.gain.value = 0.72;
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -12; limiter.ratio.value = 6;
        master.connect(limiter); limiter.connect(context.destination);
        filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 18000;
        const musicGain = context.createGain(); musicGain.gain.value = 0.3;
        context.createMediaElementSource(music).connect(filter); filter.connect(musicGain); musicGain.connect(master);
        buildBanks();
        ready = Promise.all(['dry-1', 'dry-2', 'wet-1', 'wet-2'].map(async name => {
          try {
            const response = await fetch(`./audio/${name}.wav`);
            if (!response.ok) throw Error(response.status);
            buffers.set(name, await context.decodeAudioData(await response.arrayBuffer()));
            loaded++;
          } catch { failures++; onError('A crunch sample could not load. Gameplay still works.'); }
        }));
      }
      if (running) context.resume().then(sync).catch(() => {});
      return ready;
    } catch { onError('Audio is unavailable in this browser.'); return Promise.resolve(); }
  }

  function stopVoices() {
    for (const voice of voices) { try { voice.stop(); } catch {} }
    voices.clear();
  }

  function setRunning(value) {
    running = value;
    if (value) { unlock(); sync(); }
    else { music.pause(); stopVoices(); context?.suspend().catch(() => {}); }
  }

  function playBuffer(buffer, volume = 1, rate = 1, pan = 0, offset = 0, duration) {
    if (!running || !sfxOn || !context || context.state !== 'running' || !buffer || voices.size >= 18) return;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    gain.gain.value = volume;
    source.connect(gain);
    if (context.createStereoPanner) {
      const panner = context.createStereoPanner();
      panner.pan.value = Math.max(-0.8, Math.min(0.8, pan));
      gain.connect(panner); panner.connect(master);
      source.onended = () => { voices.delete(source); source.disconnect(); gain.disconnect(); panner.disconnect(); };
    } else {
      gain.connect(master);
      source.onended = () => { voices.delete(source); source.disconnect(); gain.disconnect(); };
    }
    voices.add(source); plays++;
    if (duration) source.start(0, offset, duration); else source.start(0, offset);
  }

  function fromBank(name, volume, rate, pan) {
    const bank = banks[name];
    if (!bank?.length) return;
    playBuffer(bank[(Math.random() * bank.length) | 0], volume, rate, pan);
  }

  function cropRecorded(name, volume, rate, pan, maxDur) {
    const recorded = buffers.get(name);
    if (!recorded) return;
    const start = Math.random() * Math.max(0, recorded.duration - maxDur);
    playBuffer(recorded, volume, rate, pan, start, maxDur);
  }

  let alternate = 0;
  return {
    unlock, setRunning,
    crunch(kill = false, pan = 0) {
      fromBank('crunch', kill ? 0.76 : 0.48, 0.9 + Math.random() * 0.3, pan);
      const index = ++alternate % 2 + 1;
      cropRecorded(`dry-${index}`, kill ? 0.28 : 0.14, 1.2 + Math.random() * 0.35, pan, 0.09 + Math.random() * 0.05);
      if (kill) {
        fromBank('slash', 0.38, 0.95 + Math.random() * 0.2, pan);
        cropRecorded(`wet-${index}`, 0.2, 1.25 + Math.random() * 0.22, pan, 0.08);
      }
    },
    swipe(pan = 0) { fromBank('swish', 0.44 + Math.random() * 0.16, 0.86 + Math.random() * 0.36, pan); },
    slash(pan = 0) { fromBank('slash', 0.6, 0.9 + Math.random() * 0.28, pan); fromBank('crunch', 0.34, 1.08 + Math.random() * 0.2, pan); },
    gun(pan = 0) { fromBank('gun', 0.46, 0.88 + Math.random() * 0.28, pan); },
    ricochet(pan = 0) { fromBank('ricochet', 0.36, 0.9 + Math.random() * 0.32, pan); fromBank('spark', 0.2, 1, pan); },
    spark(pan = 0) { fromBank('spark', 0.28, 1 + Math.random() * 0.35, pan); },
    effect(kind) { if (kind === 'bite') fromBank('crunch', 0.4, 0.52); else if (kind === 'zap') fromBank('gun', 0.3, 1.3); },
    setMusic(value) { musicOn = value; unlock(); sync(); },
    setSfx(value) { sfxOn = value; if (!value) stopVoices(); else unlock(); },
    update(slow) { if (!context) return; filter.frequency.setTargetAtTime(slow ? 1800 : 18000, context.currentTime, 0.12); music.playbackRate = slow ? 0.86 : 1; },
    snapshot: () => ({ loaded, failures, plays, musicOn, sfxOn, running, voices: voices.size, musicPlaying: !music.paused, context: context?.state || 'locked', banks: Object.fromEntries(Object.entries(banks).map(([k, v]) => [k, v.length])) }),
    dispose() { running = false; music.pause(); music.removeAttribute('src'); music.load(); stopVoices(); context?.close(); }
  };
}
