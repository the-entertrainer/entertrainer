import type { LuminaBlock, LuminaCourse } from '~/types/lumina'
import { parseVideoEmbed } from '~/utils/luminaAudit'

// Renders a LuminaCourse into ONE self-contained HTML document: no CDN, no
// fonts to fetch, works from a file:// double-click or inside an LMS
// iframe. The same document powers both the standalone export and the
// SCORM package — `scorm: true` compiles in a SCORM 1.2 API runtime
// (Initialize / SetValue / Commit / Terminate + suspend/resume).

export interface PlayerOptions {
  scorm?: boolean
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Blank-line separated prose → <p> tags, single newlines → <br>.
function paras(s: string): string {
  return s.trim().split(/\n{2,}/).filter(Boolean)
    .map(p => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('')
}

let quizCounter = 0

function renderBlock(block: LuminaBlock): string {
  switch (block.kind) {
    case 'hero':
      return `<header class="blk hero hero--${esc(block.variant || 'accent')}">
        <h2>${esc(block.title)}</h2>${block.body.trim() ? `<p class="hero__sub">${esc(block.body.trim().split('\n')[0])}</p>` : ''}
      </header>`
    case 'text':
      return `<div class="blk text">${paras(block.body)}</div>`
    case 'list': {
      const items = block.items.filter(i => i.trim())
      const tag = block.variant === 'number' ? 'ol' : 'ul'
      return `<div class="blk list list--${esc(block.variant || 'bullet')}"><${tag}>${items.map(i => `<li>${esc(i.trim())}</li>`).join('')}</${tag}></div>`
    }
    case 'quote':
      return `<figure class="blk quote"><blockquote>${paras(block.body)}</blockquote>${block.caption.trim() ? `<figcaption>— ${esc(block.caption.trim())}</figcaption>` : ''}</figure>`
    case 'callout':
      return `<aside class="blk callout callout--${esc(block.variant || 'note')}">
        ${block.title.trim() ? `<strong class="callout__title">${esc(block.title.trim())}</strong>` : ''}
        ${block.body.trim() ? paras(block.body) : ''}
      </aside>`
    case 'divider':
      return block.variant === 'space' ? '<div class="blk gap" aria-hidden="true"></div>'
        : block.variant === 'dots' ? '<div class="blk dots" aria-hidden="true"><i></i><i></i><i></i></div>'
        : '<hr class="blk rule">'
    case 'image':
      if (!block.src.trim()) return ''
      return `<figure class="blk img img--${esc(block.variant || 'inset')}">
        <img src="${esc(block.src.trim())}" alt="${esc(block.alt.trim())}" loading="lazy">
        ${block.caption.trim() ? `<figcaption>${esc(block.caption.trim())}</figcaption>` : ''}
      </figure>`
    case 'video': {
      const embed = parseVideoEmbed(block.src)
      if (!embed) return ''
      const media = embed.kind === 'file'
        ? `<video controls preload="metadata" src="${esc(embed.src)}"></video>`
        : `<iframe src="${esc(embed.src)}" title="${esc(block.caption.trim() || 'Video')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      return `<figure class="blk video"><div class="video__frame">${media}</div>${block.caption.trim() ? `<figcaption>${esc(block.caption.trim())}</figcaption>` : ''}</figure>`
    }
    case 'accordion': {
      const pairs = block.pairs.filter(p => p.title.trim() || p.body.trim())
      return `<div class="blk acc">${pairs.map(p => `
        <details class="acc__item"><summary>${esc(p.title.trim() || 'Untitled')}<span class="acc__chev" aria-hidden="true"></span></summary><div class="acc__body">${paras(p.body)}</div></details>`).join('')}</div>`
    }
    case 'tabs': {
      const pairs = block.pairs.filter(p => p.title.trim() || p.body.trim())
      const gid = `tabs-${block.id}`
      return `<div class="blk tabs" data-tabs>
        <div class="tabs__bar" role="tablist">${pairs.map((p, i) =>
          `<button role="tab" id="${gid}-t${i}" aria-controls="${gid}-p${i}" aria-selected="${i === 0}" ${i === 0 ? 'class="on"' : 'tabindex="-1"'}>${esc(p.title.trim() || `Tab ${i + 1}`)}</button>`).join('')}</div>
        ${pairs.map((p, i) => `<div role="tabpanel" id="${gid}-p${i}" aria-labelledby="${gid}-t${i}" class="tabs__pane${i === 0 ? ' on' : ''}"${i === 0 ? '' : ' hidden'}>${paras(p.body)}</div>`).join('')}
      </div>`
    }
    case 'flashcards': {
      const pairs = block.pairs.filter(p => p.title.trim() || p.body.trim())
      return `<div class="blk cards">${pairs.map(p => `
        <button class="card" data-flip aria-label="Flashcard — activate to flip">
          <span class="card__face card__front">${esc(p.title.trim())}</span>
          <span class="card__face card__back">${esc(p.body.trim())}</span>
        </button>`).join('')}</div>`
    }
    case 'quiz': {
      const qid = `q${++quizCounter}`
      const opts = block.options.map((o, i) => ({ text: o.trim(), i })).filter(o => o.text)
      return `<div class="blk quiz" data-quiz="${qid}" data-correct="${block.correctIndex}">
        <span class="quiz__tag">Knowledge check</span>
        <h3 class="quiz__q">${esc(block.title.trim())}</h3>
        <div class="quiz__opts" role="radiogroup" aria-label="${esc(block.title.trim())}">
          ${opts.map(o => `<button class="quiz__opt" role="radio" aria-checked="false" data-i="${o.i}"><i class="quiz__dot" aria-hidden="true"></i><span>${esc(o.text)}</span></button>`).join('')}
        </div>
        <button class="quiz__submit" disabled>Check answer</button>
        <div class="quiz__result" hidden>
          <strong class="quiz__verdict"></strong>
          ${block.feedback.trim() ? `<p>${esc(block.feedback.trim())}</p>` : ''}
        </div>
      </div>`
    }
    case 'cta': {
      const href = block.src.trim()
      const inner = `${esc(block.title.trim() || 'Continue')}`
      return `<div class="blk cta">${href
        ? `<a class="cta__btn cta__btn--${esc(block.variant || 'accent')}" href="${esc(href)}" target="_blank" rel="noopener">${inner}</a>`
        : `<button class="cta__btn cta__btn--${esc(block.variant || 'accent')}" data-milestone>${inner}</button>`}
        ${block.body.trim() ? `<p class="cta__sub">${esc(block.body.trim())}</p>` : ''}
      </div>`
    }
  }
}

const PLAYER_CSS = `
:root{--ink:#221d16;--ink-soft:rgba(34,29,22,.62);--paper:#faf7f2;--panel:#ffffff;--line:rgba(34,29,22,.12);--r:18px;--r-s:12px}
.corners-sharp{--r:6px;--r-s:4px}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--paper);color:var(--ink);line-height:1.6;font-size:17px;-webkit-font-smoothing:antialiased}
.font-sans{--font-body:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
.font-serif{--font-body:"Iowan Old Style",Georgia,"Times New Roman",serif}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
/* The cover/shell swap relies on [hidden]; author display rules must not beat it */
[hidden]{display:none!important}
img,video,iframe{max-width:100%;display:block}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}

/* Cover */
.cover{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;background:
 radial-gradient(90% 60% at 50% 0%,color-mix(in srgb,var(--accent) 16%,transparent),transparent 70%),var(--paper)}
.cover__kicker{font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);margin-bottom:18px}
.cover h1{font-size:clamp(30px,6vw,52px);line-height:1.12;letter-spacing:-.02em;max-width:16em}
.cover__desc{margin-top:16px;max-width:34em;color:var(--ink-soft);font-size:18px}
.cover__meta{margin-top:22px;font-size:13px;font-weight:600;color:var(--ink-soft);letter-spacing:.04em}
.cover__start{margin-top:34px;padding:16px 44px;border-radius:999px;background:var(--accent);color:#fff;font-weight:700;font-size:17px;box-shadow:0 18px 40px -18px var(--accent);transition:transform .15s ease}
.cover__start:hover{transform:translateY(-2px)}

/* Shell */
.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:14px;padding:12px clamp(16px,4vw,28px);background:color-mix(in srgb,var(--paper) 86%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.topbar__title{font-weight:700;font-size:15px;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.burger{width:38px;height:38px;border-radius:var(--r-s);border:1px solid var(--line);display:grid;place-items:center;flex-shrink:0}
.burger span{display:block;width:16px;height:2px;background:var(--ink);border-radius:2px;box-shadow:0 -5px 0 var(--ink),0 5px 0 var(--ink)}
.progress{position:relative;width:120px;max-width:26vw;height:6px;border-radius:999px;background:var(--line);overflow:hidden;flex-shrink:0}
.progress i{position:absolute;inset:0;transform-origin:left;transform:scaleX(0);background:var(--accent);transition:transform .4s ease;border-radius:999px}
.progress__pct{font-size:12px;font-weight:700;color:var(--ink-soft);min-width:34px;text-align:right;flex-shrink:0}

/* Menu drawer */
.menu{position:fixed;inset:0;z-index:40;display:none}
.menu.on{display:block}
.menu__scrim{position:absolute;inset:0;background:rgba(20,16,10,.4)}
.menu__panel{position:absolute;top:0;bottom:0;left:0;width:min(320px,86vw);background:var(--panel);padding:22px 16px;overflow-y:auto;box-shadow:24px 0 60px -30px rgba(0,0,0,.35);animation:menu-in .25s ease}
@keyframes menu-in{from{transform:translateX(-40px);opacity:0}to{transform:none;opacity:1}}
.menu__head{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);padding:0 12px 12px}
.menu__item{display:flex;align-items:center;gap:12px;width:100%;padding:13px 12px;border-radius:var(--r-s);text-align:left;font-weight:600;font-size:15px}
.menu__item:hover{background:color-mix(in srgb,var(--accent) 9%,transparent)}
.menu__item.on{background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}
.menu__num{width:26px;height:26px;border-radius:999px;border:1.5px solid var(--line);display:grid;place-items:center;font-size:12px;font-weight:700;flex-shrink:0}
.menu__item.done .menu__num{background:var(--accent);border-color:var(--accent);color:#fff}

/* Lesson column */
main{max-width:760px;margin:0 auto;padding:clamp(24px,5vw,56px) clamp(18px,5vw,28px) 80px}
.lesson{display:none}
.lesson.on{display:block;animation:lesson-in .35s ease}
@keyframes lesson-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.lesson__kicker{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--accent)}
.lesson>h1{font-size:clamp(26px,4.6vw,38px);letter-spacing:-.02em;line-height:1.15;margin:8px 0 34px}
.blk{margin:26px 0}
.hero h2{font-size:clamp(22px,3.6vw,30px);letter-spacing:-.02em;line-height:1.2}
.hero--accent h2{color:var(--accent)}
.hero__sub{margin-top:8px;color:var(--ink-soft);font-size:18px}
.text p+p{margin-top:14px}
.list li{margin:9px 0 9px 4px}
.list ul,.list ol{padding-left:24px}
.list--check ul{list-style:none;padding-left:0}
.list--check li{padding-left:32px;position:relative}
.list--check li::before{content:"";position:absolute;left:0;top:3px;width:20px;height:20px;border-radius:7px;background:color-mix(in srgb,var(--accent) 16%,transparent)}
.list--check li::after{content:"";position:absolute;left:5px;top:8px;width:10px;height:6px;border-left:2.4px solid var(--accent);border-bottom:2.4px solid var(--accent);transform:rotate(-45deg)}
.quote{border-left:4px solid var(--accent);padding:6px 0 6px 24px}
.quote blockquote p{font-size:21px;line-height:1.45;letter-spacing:-.01em;font-weight:500}
.quote figcaption{margin-top:10px;color:var(--ink-soft);font-size:14px;font-weight:600}
.callout{border-radius:var(--r);padding:20px 22px;background:var(--panel);border:1px solid var(--line);border-left-width:5px}
.callout--note{border-left-color:#5B8DEF}
.callout--tip{border-left-color:#34C3A2}
.callout--warning{border-left-color:#F08C4A;background:color-mix(in srgb,#F08C4A 7%,var(--panel))}
.callout__title{display:block;margin-bottom:6px;font-size:15px}
.callout p{color:var(--ink-soft);font-size:15.5px}
.rule{border:0;border-top:1px solid var(--line);margin:40px 0}
.gap{height:44px;margin:0}
.dots{display:flex;justify-content:center;gap:10px;margin:40px 0}
.dots i{width:6px;height:6px;border-radius:999px;background:var(--accent);opacity:.5}
.img img{width:100%;border-radius:var(--r)}
.img--full{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw)}
.img--full img{border-radius:0}
.img figcaption,.video figcaption{margin-top:10px;font-size:13.5px;color:var(--ink-soft);text-align:center}
.video__frame{position:relative;border-radius:var(--r);overflow:hidden;background:#000;aspect-ratio:16/9}
.video__frame iframe,.video__frame video{position:absolute;inset:0;width:100%;height:100%;border:0}
.acc__item{border:1px solid var(--line);border-radius:var(--r-s);background:var(--panel);margin:10px 0;overflow:hidden}
.acc__item summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:17px 20px;font-weight:600;cursor:pointer}
.acc__item summary::-webkit-details-marker{display:none}
.acc__chev{width:10px;height:10px;border-right:2px solid var(--ink-soft);border-bottom:2px solid var(--ink-soft);transform:rotate(45deg);transition:transform .2s ease;flex-shrink:0}
.acc__item[open] .acc__chev{transform:rotate(225deg)}
.acc__body{padding:0 20px 18px;color:var(--ink-soft)}
.acc__body p+p{margin-top:10px}
.tabs__bar{display:flex;gap:6px;overflow-x:auto;border-bottom:1px solid var(--line);scrollbar-width:none}
.tabs__bar::-webkit-scrollbar{display:none}
.tabs__bar [role=tab]{padding:11px 16px;font-weight:600;font-size:15px;color:var(--ink-soft);border-bottom:2.5px solid transparent;margin-bottom:-1px;white-space:nowrap}
.tabs__bar [role=tab].on{color:var(--accent);border-bottom-color:var(--accent)}
.tabs__pane{padding:20px 2px;color:var(--ink-soft)}
.tabs__pane p+p{margin-top:12px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.card{position:relative;aspect-ratio:5/3.4;perspective:900px;text-align:center}
.card__face{position:absolute;inset:0;display:grid;place-items:center;padding:18px;border-radius:var(--r);backface-visibility:hidden;transition:transform .5s cubic-bezier(.2,.7,.3,1);font-weight:600;font-size:16px;line-height:1.4}
.card__front{background:var(--panel);border:1px solid var(--line);box-shadow:0 12px 30px -18px rgba(0,0,0,.25)}
.card__back{background:var(--accent);color:#fff;transform:rotateY(180deg);font-weight:500;font-size:14.5px}
.card.flip .card__front{transform:rotateY(180deg)}
.card.flip .card__back{transform:rotateY(360deg)}
.quiz{border:1px solid var(--line);border-radius:var(--r);background:var(--panel);padding:24px;box-shadow:0 20px 50px -34px rgba(0,0,0,.3)}
.quiz__tag{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--accent)}
.quiz__q{margin:10px 0 18px;font-size:19px;line-height:1.35;letter-spacing:-.01em}
.quiz__opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 14px;border:1.5px solid var(--line);border-radius:var(--r-s);margin:8px 0;font-size:15.5px;transition:border-color .15s ease,background .15s ease}
.quiz__opt:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line))}
.quiz__opt[aria-checked=true]{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent)}
.quiz__dot{width:18px;height:18px;border-radius:999px;border:2px solid var(--line);flex-shrink:0;position:relative}
.quiz__opt[aria-checked=true] .quiz__dot{border-color:var(--accent)}
.quiz__opt[aria-checked=true] .quiz__dot::after{content:"";position:absolute;inset:3px;border-radius:999px;background:var(--accent)}
.quiz.locked .quiz__opt{pointer-events:none}
.quiz__opt.good{border-color:#2f9e6e;background:rgba(47,158,110,.1)}
.quiz__opt.bad{border-color:#d64550;background:rgba(214,69,80,.08)}
.quiz__submit{margin-top:14px;padding:12px 26px;border-radius:999px;background:var(--accent);color:#fff;font-weight:700;font-size:14.5px}
.quiz__submit:disabled{opacity:.35;cursor:default}
.quiz.locked .quiz__submit{display:none}
.quiz__result{margin-top:16px;padding:14px 16px;border-radius:var(--r-s);background:color-mix(in srgb,var(--accent) 8%,transparent)}
.quiz__result p{margin-top:6px;color:var(--ink-soft);font-size:14.5px}
.cta{text-align:center;padding:8px 0}
.cta__btn{display:inline-block;padding:14px 34px;border-radius:999px;font-weight:700;font-size:16px;text-decoration:none;transition:transform .15s ease}
.cta__btn:hover{transform:translateY(-2px)}
.cta__btn--accent{background:var(--accent);color:#fff;box-shadow:0 16px 34px -18px var(--accent)}
.cta__btn--outline{border:2px solid var(--accent);color:var(--accent)}
.cta__sub{margin-top:10px;font-size:13.5px;color:var(--ink-soft)}

/* Lesson footer nav */
.lesson__nav{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:56px;padding-top:26px;border-top:1px solid var(--line)}
.lesson__btn{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:999px;font-weight:700;font-size:15px;background:var(--accent);color:#fff}
.lesson__btn--ghost{background:none;color:var(--ink-soft);border:1.5px solid var(--line)}
.lesson__btn:disabled{visibility:hidden}
.finish{display:none;text-align:center;padding:60px 24px 80px}
.finish.on{display:block;animation:lesson-in .4s ease}
.finish__ring{width:86px;height:86px;margin:0 auto 22px;border-radius:999px;background:var(--accent);display:grid;place-items:center;box-shadow:0 24px 60px -24px var(--accent)}
.finish__ring::after{content:"";width:30px;height:16px;border-left:4px solid #fff;border-bottom:4px solid #fff;transform:rotate(-45deg) translate(2px,-2px)}
.finish h2{font-size:clamp(24px,4vw,34px);letter-spacing:-.02em}
.finish p{margin-top:10px;color:var(--ink-soft)}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}html{scroll-behavior:auto}}
@media print{.topbar,.menu,.lesson__nav{display:none}.lesson{display:block!important}}
`

const PLAYER_JS = `
(function(){
"use strict";
var lessons=[].slice.call(document.querySelectorAll('.lesson'));
var menuItems=[].slice.call(document.querySelectorAll('.menu__item[data-i]'));
var cover=document.getElementById('cover'),shell=document.getElementById('shell');
var menu=document.getElementById('menu'),bar=document.querySelector('.progress i'),pct=document.querySelector('.progress__pct');
var finish=document.getElementById('finish');
var state={i:0,seen:{},quiz:{}};

/* ── SCORM 1.2 runtime (compiled in only for LMS packages) ── */
var scorm={api:null,on:!!window.LUMINA_SCORM};
/* Walking parent frames can throw on cross-origin boundaries — never let
   API discovery take down the player. */
function findAPI(w){try{var n=0;while(w&&n<12){if(w.API)return w.API;if(w===w.parent)break;w=w.parent;n++}if(window.opener)return findAPI(window.opener)}catch(e){}return null}
function sset(k,v){if(scorm.api)try{scorm.api.LMSSetValue(k,String(v))}catch(e){}}
function scommit(){if(scorm.api)try{scorm.api.LMSCommit('')}catch(e){}}
if(scorm.on){
  scorm.api=findAPI(window);
  if(scorm.api){
    try{scorm.api.LMSInitialize('')}catch(e){}
    try{
      var sus=scorm.api.LMSGetValue('cmi.suspend_data');
      if(sus){var saved=JSON.parse(sus);if(saved&&typeof saved.i==='number'){state=saved}}
    }catch(e){}
    var st;try{st=scorm.api.LMSGetValue('cmi.core.lesson_status')}catch(e){}
    if(st==='not attempted'||st==='')sset('cmi.core.lesson_status','incomplete');
    window.addEventListener('beforeunload',function(){persist();try{scorm.api.LMSFinish('')}catch(e){}});
  }
}
function persist(){
  if(!scorm.api)return;
  sset('cmi.suspend_data',JSON.stringify(state));
  var qs=Object.keys(state.quiz),right=0;
  qs.forEach(function(k){if(state.quiz[k].ok)right++});
  if(qs.length){sset('cmi.core.score.min',0);sset('cmi.core.score.max',100);sset('cmi.core.score.raw',Math.round(100*right/qs.length))}
  scommit();
}

/* ── Progress + navigation ── */
var totalQuiz=document.querySelectorAll('[data-quiz]').length;
function progress(){
  var seen=Object.keys(state.seen).length,answered=Object.keys(state.quiz).length;
  var p=(seen+answered)/(lessons.length+totalQuiz);
  if(bar)bar.style.transform='scaleX('+p+')';
  if(pct)pct.textContent=Math.round(p*100)+'%';
  menuItems.forEach(function(m){m.classList.toggle('done',!!state.seen[m.dataset.i])});
  if(p>=1){sset('cmi.core.lesson_status','completed');persist()}
  else if(scorm.api)persist();
}
function show(i,scroll){
  state.i=i;state.seen[i]=true;
  lessons.forEach(function(l,j){l.classList.toggle('on',j===i)});
  menuItems.forEach(function(m){m.classList.toggle('on',+m.dataset.i===i)});
  if(finish)finish.classList.remove('on');
  if(scroll!==false)window.scrollTo({top:0,behavior:'auto'});
  progress();
}
function openMenu(open){if(menu)menu.classList.toggle('on',open)}
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-nav]');
  if(t){
    var v=t.getAttribute('data-nav');
    if(v==='menu')openMenu(true);
    else if(v==='close')openMenu(false);
    else if(v==='finish'){lessons.forEach(function(l){l.classList.remove('on')});if(finish)finish.classList.add('on');window.scrollTo({top:0});}
    else{show(+v);openMenu(false)}
  }
});
if(cover){
  document.getElementById('start').addEventListener('click',function(){
    cover.hidden=true;shell.hidden=false;show(state.i||0);
  });
}

/* ── Tabs ── */
document.querySelectorAll('[data-tabs]').forEach(function(tabs){
  var btns=[].slice.call(tabs.querySelectorAll('[role=tab]'));
  var panes=[].slice.call(tabs.querySelectorAll('[role=tabpanel]'));
  function pick(i){
    btns.forEach(function(b,j){b.classList.toggle('on',j===i);b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1});
    panes.forEach(function(p,j){p.classList.toggle('on',j===i);p.hidden=j!==i});
  }
  btns.forEach(function(b,i){
    b.addEventListener('click',function(){pick(i)});
    b.addEventListener('keydown',function(e){
      var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
      if(d){e.preventDefault();var n=(i+d+btns.length)%btns.length;pick(n);btns[n].focus()}
    });
  });
});

/* ── Flashcards ── */
document.querySelectorAll('[data-flip]').forEach(function(c){
  c.addEventListener('click',function(){c.classList.toggle('flip')});
});

/* ── Quizzes ── */
document.querySelectorAll('[data-quiz]').forEach(function(q){
  var qid=q.getAttribute('data-quiz'),correct=+q.getAttribute('data-correct');
  var opts=[].slice.call(q.querySelectorAll('.quiz__opt'));
  var submit=q.querySelector('.quiz__submit'),result=q.querySelector('.quiz__result'),verdict=q.querySelector('.quiz__verdict');
  var choice=-1;
  function lock(chosen,ok){
    q.classList.add('locked');
    opts.forEach(function(o){
      var i=+o.getAttribute('data-i');
      if(i===correct)o.classList.add('good');
      else if(i===chosen)o.classList.add('bad');
    });
    result.hidden=false;
    verdict.textContent=ok?'Correct!':'Not quite.';
  }
  opts.forEach(function(o){
    o.addEventListener('click',function(){
      choice=+o.getAttribute('data-i');
      opts.forEach(function(x){x.setAttribute('aria-checked',x===o)});
      submit.disabled=false;
    });
  });
  submit.addEventListener('click',function(){
    if(choice<0)return;
    var ok=choice===correct;
    state.quiz[qid]={c:choice,ok:ok};
    lock(choice,ok);
    if(scorm.api){
      var n=Object.keys(state.quiz).length-1;
      sset('cmi.interactions.'+n+'.id',qid);
      sset('cmi.interactions.'+n+'.type','choice');
      sset('cmi.interactions.'+n+'.student_response',String(choice));
      sset('cmi.interactions.'+n+'.result',ok?'correct':'wrong');
    }
    progress();
  });
  /* Resume: replay a previously saved answer */
  if(state.quiz[qid]){
    var s=state.quiz[qid];
    opts.forEach(function(x){x.setAttribute('aria-checked',+x.getAttribute('data-i')===s.c)});
    lock(s.c,s.ok);
  }
});

progress();
})();
`

export function renderPlayerHtml(course: LuminaCourse, options: PlayerOptions = {}): string {
  quizCounter = 0
  const lessons = course.lessons.filter(l => l.blocks.length)
  const accent = course.theme.accent

  const lessonHtml = lessons.map((lesson, i) => `
    <section class="lesson" aria-label="${esc(lesson.title)}">
      <span class="lesson__kicker">Lesson ${i + 1} of ${lessons.length}</span>
      <h1>${esc(lesson.title)}</h1>
      ${lesson.blocks.map(renderBlock).join('\n')}
      <footer class="lesson__nav">
        <button class="lesson__btn lesson__btn--ghost" data-nav="${i - 1}" ${i === 0 ? 'disabled' : ''}>&larr; Previous</button>
        ${i < lessons.length - 1
          ? `<button class="lesson__btn" data-nav="${i + 1}">Next lesson &rarr;</button>`
          : `<button class="lesson__btn" data-nav="finish">Finish course</button>`}
      </footer>
    </section>`).join('\n')

  const menuHtml = lessons.map((lesson, i) =>
    `<button class="menu__item" data-nav="${i}" data-i="${i}"><span class="menu__num">${i + 1}</span><span>${esc(lesson.title)}</span></button>`).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(course.title || 'Course')}</title>
<meta name="generator" content="Lumina — entertrainer.in">
<style>:root{--accent:${esc(accent)}}${PLAYER_CSS}</style>
</head>
<body class="font-${esc(course.theme.font)} corners-${esc(course.theme.corners)}">

<div class="cover" id="cover">
  <span class="cover__kicker">Interactive course</span>
  <h1>${esc(course.title || 'Untitled Course')}</h1>
  ${course.description.trim() ? `<p class="cover__desc">${esc(course.description.trim())}</p>` : ''}
  <p class="cover__meta">${lessons.length} lesson${lessons.length === 1 ? '' : 's'}</p>
  <button class="cover__start" id="start">Start learning</button>
</div>

<div id="shell" hidden>
  <div class="topbar">
    <button class="burger" data-nav="menu" aria-label="Course menu"><span></span></button>
    <span class="topbar__title">${esc(course.title || 'Untitled Course')}</span>
    <span class="progress" aria-hidden="true"><i></i></span>
    <span class="progress__pct">0%</span>
  </div>
  <div class="menu" id="menu">
    <div class="menu__scrim" data-nav="close"></div>
    <nav class="menu__panel" aria-label="Lessons">
      <p class="menu__head">Contents</p>
      ${menuHtml}
    </nav>
  </div>
  <main>
    ${lessonHtml}
    <section class="finish" id="finish">
      <div class="finish__ring" aria-hidden="true"></div>
      <h2>Course complete</h2>
      <p>Nice work — you reached the end of “${esc(course.title || 'this course')}”.</p>
    </section>
  </main>
</div>

<script>${options.scorm ? 'window.LUMINA_SCORM=true;' : ''}${PLAYER_JS}</script>
</body>
</html>`
}
