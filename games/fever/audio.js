// Local CC0 recordings plus a large bank of short generated combat voices.
export function createAudio(onError = () => {}) {
  let context, master, filter, ready, running = false, musicOn = true, sfxOn = true;
  let loaded = 0, failures = 0, plays = 0;
  const buffers = new Map(), banks = {crunch: [], swish: [], slash: [], gun: [], ricochet: [], spark: []};
  const voices = new Set();
  const music = new Audio('./audio/clocktower.mp3');
  music.loop = true; music.preload = 'none';
  music.addEventListener('error', () => { failures++; onError('Music could not load. Effects and gameplay still work.'); });
  function sync() {
    if (!context) return;
    if (running && musicOn && !document.hidden) music.play().catch(() => {});
    else music.pause();
  }
  function noise(n) {
    const data = new Float32Array(n); let b0=0,b1=0,b2=0;
    for (let i=0;i<n;i++){ const white=Math.random()*2-1; b0=.99886*b0+white*.0555179; b1=.99332*b1+white*.0750759; b2=.969*b2+white*.153852; data[i]=(b0+b1+b2+white*.2)*.25; }
    return data;
  }
  function bufferFrom(data){ const buffer=context.createBuffer(1,data.length,context.sampleRate); buffer.getChannelData(0).set(data); return buffer; }
  function env(i,n,a,p){ const t=i/n; return Math.min(1,t/Math.max(.004,a))*Math.pow(1-t,p); }
  function buildBanks(){
    const rate=context.sampleRate;
    for(let k=0;k<48;k++){ const n=Math.floor(rate*(.028+Math.random()*.07)), src=noise(n), out=new Float32Array(n), snap=.35+Math.random()*.7; for(let i=0;i<n;i++){ out[i]=src[i]*env(i,n,.004+Math.random()*.01,2.4+Math.random())*snap*(Math.random()<.035?1.8:1); } banks.crunch.push(bufferFrom(out)); }
    for(let k=0;k<24;k++){ const n=Math.floor(rate*(.09+Math.random()*.11)), src=noise(n), out=new Float32Array(n); for(let i=0;i<n;i++){ const t=i/n, sweep=Math.sin(t*Math.PI)*(t<.45?t/.45:1); out[i]=(src[i]*.85+Math.sin(i*(.018+t*.09+k*.002))*.18)*sweep*(.45+Math.random()*.2);} banks.swish.push(bufferFrom(out)); }
    for(let k=0;k<20;k++){ const n=Math.floor(rate*(.04+Math.random()*.05)), src=noise(n), out=new Float32Array(n); for(let i=0;i<n;i++){ out[i]=(src[i]*env(i,n,.002,3.2)+Math.sin(i*(.22+k*.01))*Math.exp(-i/n*7)*.35)*.7;} banks.slash.push(bufferFrom(out)); }
    for(let k=0;k<16;k++){ const n=Math.floor(rate*(.05+Math.random()*.04)), src=noise(n), out=new Float32Array(n); for(let i=0;i<n;i++){ out[i]=src[i]*env(i,n,.0015,5.5)*1.1+Math.sin(i*(.09+Math.random()*.02))*env(i,n,.002,4.8)*.55;} banks.gun.push(bufferFrom(out)); }
    for(let k=0;k<12;k++){ const n=Math.floor(rate*(.06+Math.random()*.05)), out=new Float32Array(n), f=.31+Math.random()*.22; for(let i=0;i<n;i++) out[i]=Math.sin(i*f)*Math.exp(-i/n*(5+Math.random()*4))*(.4+Math.random()*.25); banks.ricochet.push(bufferFrom(out)); }
    for(let k=0;k<10;k++){ const n=Math.floor(rate*(.03+Math.random()*.03)), src=noise(n), out=new Float32Array(n); for(let i=0;i<n;i++) out[i]=src[i]*env(i,n,.001,4)*.35; banks.spark.push(bufferFrom(out)); }
  }
  function unlock(){
    try{
      if(!context){
        context=new (window.AudioContext||window.webkitAudioContext)();
        master=context.createGain(); master.gain.value=.72;
        const limiter=context.createDynamicsCompressor(); limiter.threshold.value=-12; limiter.ratio.value=6;
        master.connect(limiter); limiter.connect(context.destination);
        filter=context.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=18000;
        const musicGain=context.createGain(); musicGain.gain.value=.3;
        context.createMediaElementSource(music).connect(filter); filter.connect(musicGain); musicGain.connect(master);
        buildBanks();
        ready=Promise.all(['dry-1','dry-2','wet-1','wet-2'].map(async name=>{
          try{const response=await fetch(`./audio/${name}.wav`); if(!response.ok) throw Error(response.status); buffers.set(name,await context.decodeAudioData(await response.arrayBuffer())); loaded++;}
          catch{failures++; onError('A crunch sample could not load. Gameplay still works.');}
        }));
      }
      if(running) context.resume().then(sync).catch(()=>{});
      return ready;
    }catch{ onError('Audio is unavailable in this browser.'); return Promise.resolve(); }
  }
  function stopVoices(){ for(const voice of voices){ try{voice.stop();}catch{} } voices.clear(); }
  function setRunning(value){ running=value; if(value){unlock();sync();} else {music.pause();stopVoices();context?.suspend().catch(()=>{});} }
  function playBuffer(buffer,volume=1,rate=1,pan=0,offset=0,duration){
    if(!running||!sfxOn||!context||context.state!=='running'||!buffer||voices.size>=18) return;
    const source=context.createBufferSource(), gain=context.createGain(), panner=context.createStereoPanner();
    source.buffer=buffer; source.playbackRate.value=rate; gain.gain.value=volume; panner.pan.value=Math.max(-.8,Math.min(.8,pan));
    source.connect(gain); gain.connect(panner); panner.connect(master); voices.add(source); plays++;
    source.onended=()=>{voices.delete(source); source.disconnect(); gain.disconnect(); panner.disconnect();};
    if(duration) source.start(0,offset,duration); else source.start(0,offset);
  }
  function fromBank(name,volume,rate,pan){ const bank=banks[name]; if(!bank?.length) return; playBuffer(bank[(Math.random()*bank.length)|0],volume,rate,pan); }
  let alternate=0;
  return {
    unlock,setRunning,
    crunch(kill=false,pan=0){
      fromBank('crunch',kill?.78:.5,.92+Math.random()*.28,pan);
      const index=++alternate%2+1, recorded=buffers.get(`dry-${index}`);
      if(recorded) playBuffer(recorded,kill?.22:.12,1.15+Math.random()*.35,pan,0,.11+Math.random()*.07);
      if(kill){ fromBank('slash',.42,.95+Math.random()*.2,pan); const wet=buffers.get(`wet-${index}`); if(wet) playBuffer(wet,.18,1.2+Math.random()*.25,pan,0,.09); }
    },
    swipe(pan=0){ fromBank('swish',.46+Math.random()*.18,.85+Math.random()*.4,pan); },
    slash(pan=0){ fromBank('slash',.62,.9+Math.random()*.3,pan); fromBank('crunch',.38,1.1+Math.random()*.2,pan); },
    gun(pan=0){ fromBank('gun',.48,.88+Math.random()*.3,pan); },
    ricochet(pan=0){ fromBank('ricochet',.38,.9+Math.random()*.35,pan); fromBank('spark',.22,1,pan); },
    spark(pan=0){ fromBank('spark',.3,1+Math.random()*.4,pan); },
    effect(kind){ if(kind==='bite') fromBank('crunch',.42,.55); else if(kind==='zap') fromBank('gun',.32,1.35); },
    setMusic(value){ musicOn=value; unlock(); sync(); },
    setSfx(value){ sfxOn=value; if(!value) stopVoices(); else unlock(); },
    update(slow){ if(!context) return; filter.frequency.setTargetAtTime(slow?1800:18000,context.currentTime,.12); music.playbackRate=slow?.86:1; },
    snapshot:()=>({loaded,failures,plays,musicOn,sfxOn,running,voices:voices.size,musicPlaying:!music.paused,context:context?.state||'locked',banks:Object.fromEntries(Object.entries(banks).map(([k,v])=>[k,v.length]))}),
    dispose(){ running=false; music.pause(); music.removeAttribute('src'); music.load(); stopVoices(); context?.close(); }
  };
}
