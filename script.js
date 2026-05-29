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

  let boost = 0, lastY = scrollY, pauseMarquee = false;
  let pausedPositions = {};
  addEventListener('scroll', ()=>{
    const dy = Math.abs(scrollY - lastY); lastY = scrollY;
    if(!pauseMarquee){
      boost = Math.min(boost + dy*0.6, 60);
    }
  }, {passive:true});

  if (!reduce){
    (function tick(){
      // If pausing, save current positions
      if(pauseMarquee && Object.keys(pausedPositions).length === 0) {
        tracks.forEach((t, idx) => {
          pausedPositions[idx] = t.x;
        });
      }

      // If paused, restore saved positions (hold steady)
      if(pauseMarquee) {
        tracks.forEach((t, idx) => {
          t.x = pausedPositions[idx];
          t.el.style.transform = `translateX(${t.x}px)`;
        });
        requestAnimationFrame(tick);
        return;
      }

      // Clear pause state when resuming
      if(!pauseMarquee && Object.keys(pausedPositions).length > 0) {
        pausedPositions = {};
      }

      const speed = 0.9 + boost*0.08;
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

  /* ---------- marquee tap-to-slowmo + icon morphing ---------- */
  const iconNames = {
    'articulate.png': 'Articulate',
    'canva.png': 'Synthesia',
    'adobe.png': 'Adobe',
    'html5.png': 'html5',
    'google-fonts.png': 'Gemini',
    'miro.png': 'Claude',
    'python.png': 'Python',
    'javascript.png': 'Javascript',
    'blender.png': 'Blender',
    'adobe-audition.png': 'Tailwind CSS',
    'figma.png': 'Ollama'
  };
  const iconSequence = ['articulate.png','canva.png','adobe.png','html5.png','google-fonts.png','miro.png','python.png','javascript.png','blender.png','adobe-audition.png','figma.png'];
  let activeLabelTimeout = null;
  let slowmoActive = false;
  let currentLabelAnimationId = null;
  const iconIntervals = [];

  document.querySelectorAll('.marquee__track img').forEach(img=>{
    img.addEventListener('click', (e)=>{
      // Cancel any existing label animation
      if(currentLabelAnimationId !== null) {
        cancelAnimationFrame(currentLabelAnimationId);
        currentLabelAnimationId = null;
      }

      // Remove any existing labels
      document.querySelectorAll('.marquee__icon-label').forEach(l=>l.remove());

      slowmoActive = true;
      pauseMarquee = true;
      const track = img.closest('.marquee__track');
      const allImgs = track.querySelectorAll('img');

      allImgs.forEach(i=>{
        i.style.animationPlayState = 'paused';
      });

      const name = img.dataset.name || 'Icon';
      const label = document.createElement('div');
      label.className = 'marquee__icon-label';
      label.textContent = name;
      document.body.appendChild(label);

      function updateLabelPos(){
        const rect = img.getBoundingClientRect();
        label.style.top = (rect.top - 40) + 'px';
        label.style.left = (rect.left + rect.width/2) + 'px';
        label.style.transform = 'translateX(-50%)';
        currentLabelAnimationId = requestAnimationFrame(updateLabelPos);
      }
      updateLabelPos();

      clearTimeout(activeLabelTimeout);
      activeLabelTimeout = setTimeout(()=>{
        if(currentLabelAnimationId !== null) {
          cancelAnimationFrame(currentLabelAnimationId);
          currentLabelAnimationId = null;
        }
        allImgs.forEach(i=>{
          i.style.animationPlayState = 'running';
          // Force animation restart to fix desync
          i.style.animation = 'none';
          void i.offsetWidth; // Trigger reflow
          i.style.animation = '';
        });
        label.remove();
        slowmoActive = false;
        pauseMarquee = false;
      }, 2500);

      e.stopPropagation();
    });

    const intervalId = setInterval(()=>{
      if(slowmoActive) return;
      if(Math.random() < 0.15){
        const newIcon = iconSequence[Math.floor(Math.random() * iconSequence.length)];
        img.src = 'images/icons/' + newIcon;
        img.dataset.name = iconNames[newIcon];
      }
    }, 2000 + Math.random() * 6000);

    iconIntervals.push(intervalId);
  });

  // Clean up intervals on page unload
  window.addEventListener('beforeunload', ()=>{
    iconIntervals.forEach(id => clearInterval(id));
  });

  document.addEventListener('click', ()=>{
    if(slowmoActive && activeLabelTimeout){
      clearTimeout(activeLabelTimeout);
      if(currentLabelAnimationId !== null) {
        cancelAnimationFrame(currentLabelAnimationId);
        currentLabelAnimationId = null;
      }
      const track = document.querySelector('.marquee__track');
      const allImgs = track.querySelectorAll('img');
      allImgs.forEach(i=>{
        i.style.animationPlayState = 'running';
      });
      document.querySelectorAll('.marquee__icon-label').forEach(l=>l.remove());
      slowmoActive = false;
      pauseMarquee = false;
    }
  });
})();
