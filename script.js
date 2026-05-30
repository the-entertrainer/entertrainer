/* ============================================================
   ENTERTRAINER — interactions
   ============================================================ */
(function(){
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine   = matchMedia('(pointer: fine)').matches;

  /* ---------- custom cursor (lerp follow) ---------- */
  const cur = document.getElementById('cursor');
  if (cur && fine && !reduce){
    let mx=innerWidth/2, my=innerHeight/2, cx=mx, cy=my;
    addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; }, {passive:true});
    (function loop(){
      cx += (mx-cx)*0.18; cy += (my-cy)*0.18;
      cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const grow = (e)=>{ cur.classList.add('big'); cur.dataset.label = e.currentTarget.dataset.label||''; };
    const shrink = ()=>{ cur.classList.remove('big'); };
    document.querySelectorAll('[data-cursor]').forEach(el=>{
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
    addEventListener('mousedown', ()=>cur.classList.add('down'));
    addEventListener('mouseup',   ()=>cur.classList.remove('down'));
  } else if (cur){ cur.style.display='none'; }

  /* ---------- marquee (velocity-reactive) ---------- */
  const tracks = [...document.querySelectorAll('.marquee__track')].map(el=>({
    el,
    dir: el.dataset.dir==='right' ? 1 : -1,
    x: 0,
    w: 0
  }));
  function measure(){ tracks.forEach(t=>{ t.w = t.el.getBoundingClientRect().width / 2; }); }
  measure(); addEventListener('resize', measure);

  let boost = 0, lastY = scrollY;
  let beltPaused = false;  // frozen while an icon is spotlighted
  addEventListener('scroll', ()=>{
    const dy = Math.abs(scrollY - lastY); lastY = scrollY;
    boost = Math.min(boost + dy*0.6, 60);
  }, {passive:true});

  if (!reduce){
    (function tick(){
      if (beltPaused){ requestAnimationFrame(tick); return; }  // hold position during spotlight
      const baseSpeed = window.innerWidth > 1200 ? 1.2 : 0.9;  // Larger screens move faster
      const speed = baseSpeed + boost*0.08;
      boost *= 0.9;
      tracks.forEach(t=>{
        if(!t.w) return;
        t.x += t.dir*speed;
        if (t.x <= -t.w) t.x += t.w;
        if (t.x >= 0)    t.x -= t.w;
        t.el.style.transform = `translateX(${t.x}px)`;
      });
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.18, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rev').forEach(el=>io.observe(el));

  /* ---------- word reveal ---------- */
  document.querySelectorAll('[data-reveal-words]').forEach(host=>{
    const html = host.innerHTML;
    // split on spaces but keep <em>...</em> intact-ish: tokenize by word boundaries on text nodes
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const out = document.createDocumentFragment();
    let idx = 0;
    function wrapWord(word, emphasized){
      const span = document.createElement('span');
      span.className = 'wr' + (emphasized?' orange':'');
      const i = document.createElement('i'); i.textContent = word;
      i.style.transitionDelay = (idx*0.06)+'s'; idx++;
      span.appendChild(i);
      out.appendChild(span);
      out.appendChild(document.createTextNode(' '));
    }
    tmp.childNodes.forEach(node=>{
      const emph = node.nodeType===1 && node.tagName==='EM';
      const text = node.textContent.trim();
      if(!text) return;
      text.split(/\s+/).forEach(w=>wrapWord(w, emph));
    });
    host.innerHTML=''; host.appendChild(out);
    const words = [...host.querySelectorAll('.wr')];
    const wio = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{ if(e.isIntersecting){ words.forEach(w=>w.classList.add('in')); wio.disconnect(); } });
    }, {threshold:0.3});
    wio.observe(host);
    if(reduce) words.forEach(w=>w.classList.add('in'));
  });

  /* ---------- click randomizer (the "mash NEXT" gag) ---------- */
  const LINES = [
    'NEXT →','PLEASE DON\'T.','MODULE 8 / 14','STILL HERE?','NOT SAVED.','TRY AGAIN →',
    'A COMPLIANCE OFFICER FELT THAT','100%. ON VIBES.','LOADING WILL TO LIVE…','THERE IS ONLY NEXT',
    'YOU PASSED?','SKIP? NO.','AGAIN, HUH','CERTIFIED-ISH','NOW DO IT BLINDFOLDED','OK STOP NOW',
    'SEE? BORING.','THIS COULD BE A SANDBOX','IMAGINE LEARNING SOMETHING','NEXT → NEXT → NEXT'
  ];
  const btn = document.getElementById('mashBtn');
  const txt = document.getElementById('mashTxt');
  const cnt = document.getElementById('mashCount');
  const hint= document.getElementById('mashHint');
  if(btn && txt){
    let n=0, last=-1;
    btn.addEventListener('click', ()=>{
      n++;
      cnt.textContent = n + (n===1?' CLICK':' CLICKS');
      let i; do { i = Math.floor(Math.random()*LINES.length); } while(i===last && LINES.length>1);
      last=i;
      txt.classList.add('out');
      setTimeout(()=>{
        txt.textContent = LINES[i];
        txt.classList.remove('out'); txt.classList.add('in');
        void txt.offsetHeight;
        txt.classList.remove('in');
      },140);
      if(n===5)  hint.textContent='see how mind-numbing that is? exactly my point.';
      if(n===12) hint.textContent='ok you can stop. or don\'t. i built this to be clickable.';
      if(n===25) hint.textContent='alright, you win. you really like buttons.';
    });
  }

  /* ---------- hero peek chat bubble ---------- */
  const messages = [
    'Hey!',
    'Let\'s build something!',
    'Design nerd here',
    'Coffee + Code = Magic',
    'Ready to create?',
    'Let\'s go!',
    'Something awesome incoming',
    'You found me!'
  ];
  const chatBubble = document.querySelector('.hero__chat-bubble');
  const gifPeek = document.querySelector('.hero__peek');
  if(chatBubble && gifPeek) {
    gifPeek.addEventListener('click', (e) => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      chatBubble.textContent = randomMsg;
      chatBubble.style.animation = 'none';
      void chatBubble.offsetWidth;
      chatBubble.style.animation = 'chat-bubble-pop 2s ease-in-out forwards';
      e.stopPropagation();
    });
  }

  /* ---------- marquee tap-to-spotlight ---------- */
  // Source of truth for the spotlight caption, keyed by icon filename.
  const iconInfo = {
    'articulate.png':     { name:'Articulate Storyline', desc:'Builds branching, interactive e-learning courses and simulations.' },
    'canva.png':          { name:'Synthesia',            desc:'Generates lifelike AI presenter videos straight from a text script.' },
    'adobe.png':          { name:'Adobe Creative Suite', desc:'Industry-standard apps for design, video, and image editing.' },
    'html5.png':          { name:'HTML5',                desc:'The markup language that structures every modern web page.' },
    'google-fonts.png':   { name:'Google Gemini',        desc:'Google’s multimodal AI for reasoning across text, images, and code.' },
    'miro.png':           { name:'Claude',               desc:'Anthropic’s AI assistant for writing, analysis, and coding.' },
    'python.png':         { name:'Python',               desc:'A versatile language for scripting, data work, and automation.' },
    'javascript.png':     { name:'Javascript',           desc:'The language that makes web pages interactive and dynamic.' },
    'blender.png':        { name:'Blender',              desc:'Free 3D software for modeling, animation, and rendering.' },
    'adobe-audition.png': { name:'Tailwind CSS',         desc:'A utility-first CSS framework for styling UIs fast.' },
    'figma.png':          { name:'Ollama',               desc:'Runs open-source large language models locally on your machine.' }
  };
  const fileOf = (src)=> (src.split('/').pop()||'').split('?')[0];

  let spotlight = null;        // active overlay root, or null
  let spotlightTimer = null;   // auto-dismiss timer
  const beltImgs = [...document.querySelectorAll('.marquee__track img')];

  function freezeBelt(){
    beltPaused = true;
    beltImgs.forEach(i=> i.style.animationPlayState = 'paused');
  }
  function resumeBelt(){
    beltPaused = false;
    beltImgs.forEach(i=> i.style.animationPlayState = 'running');
  }

  function openSpotlight(img){
    if (spotlight) return;
    const info = iconInfo[fileOf(img.src)] || { name: img.dataset.name || 'Tool', desc:'' };
    freezeBelt();

    const rect = img.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;

    // overlay root
    const root = document.createElement('div');
    root.className = 'belt-spotlight';

    // glassy blur backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'belt-spotlight__backdrop';
    root.appendChild(backdrop);

    // lift wrapper holds position+scale; inner clone handles the Y-axis spin
    const lift = document.createElement('div');
    lift.className = 'belt-spotlight__lift';
    lift.style.left = rect.left + 'px';
    lift.style.top  = rect.top  + 'px';
    lift.style.width  = rect.width  + 'px';
    lift.style.height = rect.height + 'px';

    const clone = document.createElement('img');
    clone.className = 'belt-spotlight__icon';
    clone.src = img.src;
    clone.alt = info.name;
    lift.appendChild(clone);
    root.appendChild(lift);

    // caption card
    const card = document.createElement('div');
    card.className = 'belt-spotlight__card';
    const h = document.createElement('div');
    h.className = 'belt-spotlight__name';
    h.textContent = info.name;
    const p = document.createElement('div');
    p.className = 'belt-spotlight__desc';
    p.textContent = info.desc;
    card.appendChild(h); card.appendChild(p);
    root.appendChild(card);

    document.body.appendChild(root);
    spotlight = root;

    // target: lift the icon toward screen center-top, scaled up
    const scale = 2;
    const targetX = vw/2 - (rect.left + rect.width/2);
    const targetY = Math.min(vh*0.34, vh/2) - (rect.top + rect.height/2);

    // place caption under the lifted icon
    const liftedCenterY = rect.top + rect.height/2 + targetY;
    const liftedH = rect.height * scale;
    card.style.top = (liftedCenterY + liftedH/2 + 18) + 'px';

    // next frame -> animate in
    requestAnimationFrame(()=>{
      backdrop.classList.add('in');
      card.classList.add('in');
      lift.style.transform = `translate(${targetX}px, ${targetY}px) scale(${scale})`;
      if (!reduce) clone.classList.add('is-spinning');
    });

    clearTimeout(spotlightTimer);
    spotlightTimer = setTimeout(closeSpotlight, 2000);
  }

  function closeSpotlight(){
    if (!spotlight) return;
    clearTimeout(spotlightTimer); spotlightTimer = null;
    const root = spotlight;
    spotlight = null;

    const lift  = root.querySelector('.belt-spotlight__lift');
    const clone = root.querySelector('.belt-spotlight__icon');
    const backdrop = root.querySelector('.belt-spotlight__backdrop');
    const card = root.querySelector('.belt-spotlight__card');

    if (clone) clone.classList.remove('is-spinning');  // spin rotateY back to 0
    if (lift)  lift.style.transform = 'translate(0,0) scale(1)';  // land back in place
    if (backdrop) backdrop.classList.remove('in');
    if (card) card.classList.remove('in');

    setTimeout(()=>{
      root.remove();
      resumeBelt();
    }, 520);
  }

  beltImgs.forEach(img=>{
    img.addEventListener('click', (e)=>{
      e.stopPropagation();
      if (spotlight){ closeSpotlight(); return; }
      openSpotlight(img);
    });
  });

  // tap anywhere else closes the spotlight
  document.addEventListener('click', ()=>{ if (spotlight) closeSpotlight(); });
})();
