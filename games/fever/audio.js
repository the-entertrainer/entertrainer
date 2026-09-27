// Local CC0 recordings. Autoplay is unlocked only by a deliberate player gesture.
export function createAudio(onError = () => {}) {
  let context, master, filter, ready, running = false, musicOn = true, sfxOn = true;
  let loaded = 0, failures = 0, plays = 0;
  const buffers = new Map(), voices = new Set();
  const music = new Audio('./audio/clocktower.mp3');
  music.loop = true; music.preload = 'none';
  music.addEventListener('error', () => { failures++; onError('Music could not load. Effects and gameplay still work.'); });
  function sync() {
    if (!context) return;
    if (running && musicOn && !document.hidden) {
      music.play().catch(() => {});
    } else music.pause();
  }
  function unlock() {
    try {
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        master = context.createGain(); master.gain.value = .72;
        const limiter = context.createDynamicsCompressor();limiter.threshold.value=-12;limiter.ratio.value=6;
        master.connect(limiter);limiter.connect(context.destination);
        filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=18000;
        const musicGain=context.createGain();musicGain.gain.value=.3;
        context.createMediaElementSource(music).connect(filter);filter.connect(musicGain);musicGain.connect(master);
        ready=Promise.all(['dry-1','dry-2','wet-1','wet-2'].map(async name=>{
          try{const response=await fetch(`./audio/${name}.wav`);if(!response.ok)throw Error(response.status);buffers.set(name,await context.decodeAudioData(await response.arrayBuffer()));loaded++;}
          catch{failures++;onError('A crunch sample could not load. Gameplay still works.');}
        }));
      }
      if(running)context.resume().then(sync).catch(()=>{});
      return ready;
    } catch { onError('Audio is unavailable in this browser.'); return Promise.resolve(); }
  }
  function stopVoices(){for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
  function setRunning(value){running=value;if(value){unlock();sync();}else{music.pause();stopVoices();context?.suspend().catch(()=>{});}}
  function sample(name,volume=1,rate=1,pan=0){
    if(!running||!sfxOn||!context||context.state!=='running'||!buffers.has(name)||voices.size>=12)return;
    const source=context.createBufferSource(),gain=context.createGain(),panner=context.createStereoPanner();
    source.buffer=buffers.get(name);source.playbackRate.value=rate;gain.gain.value=volume;panner.pan.value=Math.max(-.8,Math.min(.8,pan));
    source.connect(gain);gain.connect(panner);panner.connect(master);voices.add(source);plays++;
    source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();panner.disconnect();};source.start();
  }
  let alternate=0;
  return {
    unlock,setRunning,
    crunch(kill=false,pan=0){const index=++alternate%2+1;sample(`dry-${index}`,kill?.7:.38,.88+Math.random()*.2,pan);if(kill)sample(`wet-${index}`,.65,.8+Math.random()*.2,pan);},
    effect(kind){if(kind==='bite')sample('wet-1',.55,.65);else if(kind==='zap')sample('dry-2',.18,1.8);},
    setMusic(value){musicOn=value;unlock();sync();},setSfx(value){sfxOn=value;if(!value)stopVoices();else unlock();},
    update(slow){if(!context)return;filter.frequency.setTargetAtTime(slow?1800:18000,context.currentTime,.12);music.playbackRate=slow?.86:1;},
    snapshot:()=>({loaded,failures,plays,musicOn,sfxOn,running,voices:voices.size,musicPlaying:!music.paused,context:context?.state||'locked'}),
    dispose(){running=false;music.pause();music.removeAttribute('src');music.load();stopVoices();context?.close();}
  };
}
