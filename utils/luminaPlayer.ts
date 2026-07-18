import type { LuminaBlock, LuminaCourse } from '~/types/lumina'
import { parseVideoEmbed } from '~/utils/luminaAudit'
import { courseReadingMinutes, LUMINA_CANVASES, LUMINA_CORNERS, LUMINA_FONTS, LUMINA_SCALES } from '~/utils/luminaBlocks'

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

// Single-answer question, shared by the knowledge check and true/false.
function renderQuiz(block: LuminaBlock, tag: string): string {
  const qid = `q${++quizCounter}`
  const opts = block.options.map((o, i) => ({ text: o.trim(), i })).filter(o => o.text)
  return `<div class="blk quiz" data-quiz="${qid}" data-correct="${block.correctIndex}">
    <span class="quiz__tag">${esc(tag)}</span>
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
      return `<figure class="blk quote"><blockquote>${paras(block.body)}</blockquote>${block.caption.trim() ? `<figcaption>${esc(block.caption.trim())}</figcaption>` : ''}</figure>`
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
        <button class="card" data-flip aria-label="Flashcard. Activate to flip.">
          <span class="card__face card__front">${esc(p.title.trim())}</span>
          <span class="card__face card__back">${esc(p.body.trim())}</span>
        </button>`).join('')}</div>`
    }
    case 'stat':
      return `<div class="blk stat stat--${esc(block.variant || 'accent')}">
        <span class="stat__num">${esc(block.title.trim())}</span>
        ${block.body.trim() ? `<span class="stat__label">${esc(block.body.trim())}</span>` : ''}
        ${block.caption.trim() ? `<span class="stat__note">${esc(block.caption.trim())}</span>` : ''}
      </div>`
    case 'steps': {
      const pairs = block.pairs.filter(p => p.title.trim() || p.body.trim())
      return `<ol class="blk steps steps--${esc(block.variant || 'number')}">${pairs.map((p, i) => `
        <li class="steps__item"><span class="steps__num">${i + 1}</span><div class="steps__body"><strong>${esc(p.title.trim() || `Step ${i + 1}`)}</strong>${p.body.trim() ? `<p>${esc(p.body.trim())}</p>` : ''}</div></li>`).join('')}</ol>`
    }
    case 'cardgrid': {
      const pairs = block.pairs.filter(p => p.title.trim() || p.body.trim())
      return `<div class="blk cgrid">${pairs.map(p => `
        <div class="cgrid__card"><strong>${esc(p.title.trim())}</strong>${p.body.trim() ? `<p>${esc(p.body.trim())}</p>` : ''}</div>`).join('')}</div>`
    }
    case 'table': {
      const rows = block.grid.filter(r => r.some(c => c.trim()))
      if (rows.length < 1) return ''
      const [head, ...body] = rows
      return `<div class="blk tablewrap"><table class="ltable">
        <thead><tr>${head.map(c => `<th>${esc(c.trim())}</th>`).join('')}</tr></thead>
        <tbody>${body.map(r => `<tr>${head.map((_, ci) => `<td>${esc((r[ci] || '').trim())}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`
    }
    case 'imagetext': {
      if (!block.src.trim()) return ''
      return `<div class="blk imgtext imgtext--${esc(block.variant || 'left')}">
        <figure class="imgtext__fig"><img src="${esc(block.src.trim())}" alt="${esc(block.alt.trim())}" loading="lazy">${block.caption.trim() ? `<figcaption>${esc(block.caption.trim())}</figcaption>` : ''}</figure>
        <div class="imgtext__body">${paras(block.body)}</div>
      </div>`
    }
    case 'audio': {
      if (!block.src.trim()) return ''
      return `<figure class="blk audio">
        ${block.caption.trim() ? `<figcaption class="audio__cap">${esc(block.caption.trim())}</figcaption>` : ''}
        <audio controls preload="metadata" src="${esc(block.src.trim())}"></audio>
        ${block.body.trim() ? `<details class="audio__tx"><summary>Transcript</summary><div>${paras(block.body)}</div></details>` : ''}
      </figure>`
    }
    case 'reveal': {
      const pairs = block.pairs.filter(p => p.title.trim() || p.body.trim())
      return `<div class="blk reveal">${block.title.trim() ? `<h3 class="reveal__q">${esc(block.title.trim())}</h3>` : ''}${pairs.map(p => `
        <button class="reveal__item" data-reveal aria-expanded="false">
          <span class="reveal__cue">${esc(p.title.trim() || 'Reveal')}</span>
          <span class="reveal__ans" hidden>${esc(p.body.trim())}</span>
          <span class="reveal__hint" aria-hidden="true">Tap to reveal</span>
        </button>`).join('')}</div>`
    }
    case 'reflection': {
      const rid = `r${++quizCounter}`
      return `<div class="blk reflection" data-reflect="${rid}">
        <span class="quiz__tag">Your turn</span>
        <h3 class="quiz__q">${esc(block.title.trim())}</h3>
        ${block.body.trim() ? `<p class="reflection__hint">${esc(block.body.trim())}</p>` : ''}
        <textarea class="reflection__input" rows="4" placeholder="Write your thoughts. They stay on this device."></textarea>
        <span class="reflection__saved" hidden>Saved on this device</span>
      </div>`
    }
    case 'quiz':
      return renderQuiz(block, 'Knowledge check')
    case 'truefalse':
      return renderQuiz(block, 'True or false')
    case 'multiquiz': {
      const qid = `m${++quizCounter}`
      const opts = block.options.map((o, i) => ({ text: o.trim(), i })).filter(o => o.text)
      const correct = opts.filter(o => block.correctSet.includes(o.i)).map(o => o.i)
      return `<div class="blk quiz mq" data-mq="${qid}" data-correct="${correct.join(',')}">
        <span class="quiz__tag">Select all that apply</span>
        <h3 class="quiz__q">${esc(block.title.trim())}</h3>
        <div class="mq__opts" role="group" aria-label="${esc(block.title.trim())}">
          ${opts.map(o => `<button class="mq__opt" role="checkbox" aria-checked="false" data-i="${o.i}"><span class="mq__box" aria-hidden="true"></span><span>${esc(o.text)}</span></button>`).join('')}
        </div>
        <button class="quiz__submit" disabled>Check answer</button>
        <div class="quiz__result" hidden><strong class="quiz__verdict"></strong>${block.feedback.trim() ? `<p>${esc(block.feedback.trim())}</p>` : ''}</div>
      </div>`
    }
    case 'fillblank': {
      const qid = `f${++quizCounter}`
      const answers = block.options.map(o => o.trim()).filter(Boolean)
      const sentence = esc(block.body.trim()).replace('___', '<input class="fib__input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer">')
      return `<div class="blk quiz fib" data-fib="${qid}" data-answers="${esc(JSON.stringify(answers))}">
        <span class="quiz__tag">Fill the blank</span>
        ${block.title.trim() ? `<h3 class="quiz__q">${esc(block.title.trim())}</h3>` : ''}
        <p class="fib__sentence">${sentence}</p>
        <button class="quiz__submit">Check answer</button>
        <div class="quiz__result" hidden><strong class="quiz__verdict"></strong>${block.feedback.trim() ? `<p>${esc(block.feedback.trim())}</p>` : ''}</div>
      </div>`
    }
    case 'poll': {
      const pid = `p${++quizCounter}`
      const opts = block.options.map((o, i) => ({ text: o.trim(), i })).filter(o => o.text)
      return `<div class="blk quiz poll" data-poll="${pid}">
        <span class="quiz__tag">Poll</span>
        <h3 class="quiz__q">${esc(block.title.trim())}</h3>
        <div class="poll__opts">${opts.map(o => `
          <button class="poll__opt" data-i="${o.i}"><span class="poll__row"><span class="poll__label">${esc(o.text)}</span><span class="poll__pct"></span></span><span class="poll__bar" aria-hidden="true"><i></i></span></button>`).join('')}</div>
        ${block.feedback.trim() ? `<p class="poll__note" hidden>${esc(block.feedback.trim())}</p>` : ''}
      </div>`
    }
    case 'scenario': {
      const sid = `s${++quizCounter}`
      const choices = block.options.map((o, i) => ({ text: o.trim(), out: (block.outcomes[i] || '').trim(), i })).filter(c => c.text)
      return `<div class="blk quiz scenario" data-scenario="${sid}" data-best="${block.correctIndex}">
        <span class="quiz__tag">Scenario</span>
        <h3 class="quiz__q">${esc(block.title.trim())}</h3>
        ${block.body.trim() ? `<div class="scenario__setup">${paras(block.body)}</div>` : ''}
        <div class="scenario__choices">${choices.map(c => `<button class="scenario__choice" data-i="${c.i}" data-outcome="${esc(c.out)}">${esc(c.text)}</button>`).join('')}</div>
        <div class="scenario__outcome" hidden><strong class="scenario__label"></strong><p class="scenario__text"></p></div>
        ${block.feedback.trim() ? `<p class="scenario__debrief" hidden>${esc(block.feedback.trim())}</p>` : ''}
        <button class="scenario__retry" hidden>Try a different choice</button>
      </div>`
    }
    case 'ordering': {
      const oid = `o${++quizCounter}`
      const items = block.items.map((t, i) => ({ text: t.trim(), i })).filter(x => x.text)
      return `<div class="blk quiz order" data-order="${oid}">
        <span class="quiz__tag">Put in order</span>
        ${block.title.trim() ? `<h3 class="quiz__q">${esc(block.title.trim())}</h3>` : ''}
        <ul class="order__list">${items.map(x => `
          <li class="order__item" data-key="${x.i}"><span class="order__grip" aria-hidden="true"></span><span class="order__text">${esc(x.text)}</span><span class="order__moves"><button class="order__up" aria-label="Move up">↑</button><button class="order__down" aria-label="Move down">↓</button></span></li>`).join('')}</ul>
        <button class="quiz__submit">Check order</button>
        <div class="quiz__result" hidden><strong class="quiz__verdict"></strong>${block.feedback.trim() ? `<p>${esc(block.feedback.trim())}</p>` : ''}</div>
      </div>`
    }
    case 'matching': {
      const mid = `x${++quizCounter}`
      const pairs = block.pairs.filter(p => p.title.trim() && p.body.trim())
      return `<div class="blk quiz match" data-match="${mid}">
        <span class="quiz__tag">Matching</span>
        ${block.title.trim() ? `<h3 class="quiz__q">${esc(block.title.trim())}</h3>` : ''}
        <div class="match__cols">
          <div class="match__col match__left">${pairs.map((p, i) => `<button class="match__item" data-side="l" data-key="${i}">${esc(p.title.trim())}</button>`).join('')}</div>
          <div class="match__col match__right">${pairs.map((p, i) => `<button class="match__item" data-side="r" data-key="${i}">${esc(p.body.trim())}</button>`).join('')}</div>
        </div>
        <button class="quiz__submit" disabled>Check matches</button>
        <div class="quiz__result" hidden><strong class="quiz__verdict"></strong>${block.feedback.trim() ? `<p>${esc(block.feedback.trim())}</p>` : ''}</div>
      </div>`
    }
    case 'sortgame': {
      const gid = `g${++quizCounter}`
      const buckets = block.options.map(o => o.trim()).filter(Boolean)
      const cards = block.pairs.filter(p => p.title.trim())
      return `<div class="blk quiz sort" data-sort="${gid}">
        <span class="quiz__tag">Sort it</span>
        ${block.title.trim() ? `<h3 class="quiz__q">${esc(block.title.trim())}</h3>` : ''}
        <div class="sort__cards">${cards.map(c => `
          <div class="sort__card" data-correct="${Math.min(buckets.length - 1, c.bucket || 0)}" data-pick="0">
            <span class="sort__text">${esc(c.title.trim())}</span>
            <span class="sort__chips">${buckets.map((b, bi) => `<button class="sort__chip${bi === 0 ? ' on' : ''}" data-b="${bi}">${esc(b)}</button>`).join('')}</span>
          </div>`).join('')}</div>
        <button class="quiz__submit">Check</button>
        <div class="quiz__result" hidden><strong class="quiz__verdict"></strong>${block.feedback.trim() ? `<p>${esc(block.feedback.trim())}</p>` : ''}</div>
      </div>`
    }
    case 'memory': {
      const yid = `y${++quizCounter}`
      const pairs = block.pairs.filter(p => p.title.trim() && p.body.trim())
      const faces = pairs.flatMap((p, i) => [
        { pair: i, text: p.title.trim() },
        { pair: i, text: p.body.trim() }
      ])
      return `<div class="blk quiz memory" data-memory="${yid}" data-faces="${esc(JSON.stringify(faces))}">
        <span class="quiz__tag">Memory match</span>
        ${block.title.trim() ? `<h3 class="quiz__q">${esc(block.title.trim())}</h3>` : ''}
        <div class="memory__grid"></div>
        <p class="memory__status" role="status"></p>
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
:root{--ink-soft:color-mix(in srgb,var(--ink) 65%,transparent);--line:color-mix(in srgb,var(--ink) 14%,transparent)}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--paper);color:var(--ink);line-height:1.6;font-size:var(--fs);-webkit-font-smoothing:antialiased}
h1,h2,h3,.cover h1{font-family:var(--font-head)}
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

/* Statistic */
.stat{text-align:center;padding:14px 0}
.stat__num{display:block;font-family:var(--font-head);font-size:clamp(46px,10vw,72px);font-weight:800;line-height:1;letter-spacing:-.03em}
.stat--accent .stat__num{color:var(--accent)}
.stat__label{display:block;margin-top:10px;font-size:16px;font-weight:600}
.stat__note{display:block;margin-top:6px;font-size:13.5px;color:var(--ink-soft)}
/* Steps */
.steps{list-style:none;counter-reset:step}
.steps__item{display:flex;gap:16px;padding:0 0 22px;position:relative}
.steps__num{flex-shrink:0;width:34px;height:34px;border-radius:999px;display:grid;place-items:center;font-weight:800;font-size:15px;background:var(--accent);color:#fff}
.steps--timeline .steps__item::before{content:"";position:absolute;left:16px;top:34px;bottom:0;width:2px;background:color-mix(in srgb,var(--accent) 30%,transparent)}
.steps__item:last-child{padding-bottom:0}
.steps__item:last-child::before{display:none}
.steps__body strong{display:block;font-size:16.5px;letter-spacing:-.01em}
.steps__body p{margin-top:4px;color:var(--ink-soft);font-size:15px}
/* Card grid */
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.cgrid__card{padding:18px;border-radius:var(--r);background:var(--panel);border:1px solid var(--line);box-shadow:0 12px 30px -22px rgba(0,0,0,.35)}
.cgrid__card strong{display:block;font-size:16px;letter-spacing:-.01em}
.cgrid__card p{margin-top:6px;color:var(--ink-soft);font-size:14.5px;line-height:1.5}
/* Table */
.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--r);-webkit-overflow-scrolling:touch}
.ltable{border-collapse:collapse;width:100%;font-size:14.5px}
.ltable th,.ltable td{padding:12px 16px;text-align:left;border-bottom:1px solid var(--line);white-space:nowrap}
.ltable thead th{background:color-mix(in srgb,var(--accent) 10%,var(--panel));font-weight:700;color:var(--ink)}
.ltable tbody tr:last-child td{border-bottom:0}
.ltable tbody tr:nth-child(even) td{background:color-mix(in srgb,var(--ink) 3%,transparent)}
/* Image + text */
.imgtext{display:grid;gap:20px;align-items:center;grid-template-columns:1fr}
@media(min-width:640px){.imgtext{grid-template-columns:1fr 1fr}.imgtext--right .imgtext__fig{order:2}}
.imgtext__fig img{width:100%;border-radius:var(--r)}
.imgtext__fig figcaption{margin-top:8px;font-size:13px;color:var(--ink-soft)}
.imgtext__body p+p{margin-top:12px}
/* Audio */
.audio{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:16px 18px}
.audio__cap{font-weight:600;margin-bottom:10px}
.audio audio{width:100%}
.audio__tx{margin-top:12px;font-size:14px;color:var(--ink-soft)}
.audio__tx summary{cursor:pointer;font-weight:600;color:var(--ink)}
.audio__tx div{margin-top:8px}
/* Reveal */
.reveal__q{font-size:18px;margin-bottom:12px;letter-spacing:-.01em}
.reveal__item{display:block;width:100%;text-align:left;padding:16px 18px;border:1.5px solid var(--line);border-radius:var(--r-s);background:var(--panel);margin:8px 0;transition:border-color .15s ease,transform .1s ease}
.reveal__item:hover{border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
.reveal__item:active{transform:scale(.995)}
.reveal__cue{display:block;font-weight:600;font-size:16px}
.reveal__ans{display:block;margin-top:10px;color:var(--ink-soft);font-size:15px;line-height:1.55}
.reveal__hint{display:inline-block;margin-top:8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.reveal__item.open{border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
/* Reflection */
.reflection{border:1px solid var(--line);border-radius:var(--r);background:var(--panel);padding:22px}
.reflection__hint{margin:6px 0 12px;color:var(--ink-soft);font-size:14.5px}
.reflection__input{width:100%;resize:vertical;min-height:100px;padding:13px 15px;border:1.5px solid var(--line);border-radius:var(--r-s);background:var(--paper);color:var(--ink);font:inherit;font-size:15px;line-height:1.55}
.reflection__input:focus{outline:none;border-color:var(--accent)}
.reflection__saved{display:inline-block;margin-top:8px;font-size:12px;font-weight:600;color:#2f9e6e}
/* Multi-select */
.mq__opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 14px;border:1.5px solid var(--line);border-radius:var(--r-s);margin:8px 0;font-size:15.5px;transition:border-color .15s ease,background .15s ease}
.mq__opt:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line))}
.mq__box{width:20px;height:20px;border-radius:6px;border:2px solid var(--line);flex-shrink:0;position:relative}
.mq__opt[aria-checked=true]{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent)}
.mq__opt[aria-checked=true] .mq__box{border-color:var(--accent);background:var(--accent)}
.mq__opt[aria-checked=true] .mq__box::after{content:"";position:absolute;left:5px;top:2px;width:6px;height:10px;border-right:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(45deg)}
.mq.locked .mq__opt{pointer-events:none}
.mq__opt.good{border-color:#2f9e6e;background:rgba(47,158,110,.1)}
.mq__opt.bad{border-color:#d64550;background:rgba(214,69,80,.08)}
/* Fill the blank */
.fib__sentence{font-size:17px;line-height:2.1}
.fib__input{display:inline-block;min-width:120px;padding:4px 10px;border:0;border-bottom:2.5px solid var(--accent);background:color-mix(in srgb,var(--accent) 7%,transparent);color:var(--ink);font:inherit;font-weight:600;text-align:center;border-radius:6px 6px 0 0}
.fib__input:focus{outline:none;background:color-mix(in srgb,var(--accent) 12%,transparent)}
.fib.locked .fib__input{pointer-events:none}
.fib__input.good{border-color:#2f9e6e;background:rgba(47,158,110,.12)}
.fib__input.bad{border-color:#d64550;background:rgba(214,69,80,.1)}
/* Poll */
.poll__opt{display:block;width:100%;text-align:left;padding:12px 14px;border:1.5px solid var(--line);border-radius:var(--r-s);margin:8px 0;transition:border-color .15s ease}
.poll__opt:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line))}
.poll__row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;font-size:15px}
.poll__pct{font-weight:700;color:var(--accent);opacity:0;transition:opacity .3s ease}
.poll__bar{display:block;height:8px;margin-top:9px;border-radius:999px;background:var(--line);overflow:hidden}
.poll__bar i{display:block;height:100%;width:0;border-radius:999px;background:var(--accent);transition:width .5s cubic-bezier(.2,.7,.3,1)}
.poll.voted .poll__pct{opacity:1}
.poll.voted .poll__opt{pointer-events:none}
.poll.voted .poll__opt.mine{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 6%,transparent)}
.poll__note{margin-top:12px;padding:12px 14px;border-radius:var(--r-s);background:color-mix(in srgb,var(--accent) 8%,transparent);color:var(--ink-soft);font-size:14px}
/* Scenario */
.scenario__setup{margin-bottom:16px;color:var(--ink-soft)}
.scenario__setup p+p{margin-top:10px}
.scenario__choice{display:block;width:100%;text-align:left;padding:14px 16px;border:1.5px solid var(--line);border-radius:var(--r-s);background:var(--panel);margin:8px 0;font-size:15.5px;font-weight:500;transition:border-color .15s ease,transform .1s ease}
.scenario__choice:hover{border-color:var(--accent);transform:translateX(2px)}
.scenario.done .scenario__choice{pointer-events:none;opacity:.5}
.scenario.done .scenario__choice.picked{opacity:1;border-color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent)}
.scenario__outcome{margin-top:16px;padding:16px 18px;border-radius:var(--r-s);border-left:4px solid var(--accent);background:color-mix(in srgb,var(--accent) 7%,transparent)}
.scenario__outcome.good{border-left-color:#2f9e6e;background:rgba(47,158,110,.08)}
.scenario__outcome.bad{border-left-color:#d64550;background:rgba(214,69,80,.06)}
.scenario__label{display:block;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
.scenario__text{color:var(--ink-soft);font-size:15px;line-height:1.55}
.scenario__debrief{margin-top:12px;color:var(--ink-soft);font-size:14px;font-style:italic}
.scenario__retry{margin-top:14px;padding:10px 20px;border-radius:999px;border:1.5px solid var(--line);font-weight:600;font-size:14px}
.scenario__retry:hover{border-color:var(--accent)}
/* Ordering */
.order__list{list-style:none}
.order__item{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid var(--line);border-radius:var(--r-s);background:var(--panel);margin:8px 0}
.order__grip{width:16px;height:16px;flex-shrink:0;background-image:radial-gradient(currentColor 1.4px,transparent 1.4px);background-size:6px 6px;color:color-mix(in srgb,var(--ink) 30%,transparent)}
.order__text{flex:1;font-size:15.5px}
.order__moves{display:flex;flex-direction:column;gap:2px;flex-shrink:0}
.order__moves button{width:30px;height:22px;border:1px solid var(--line);border-radius:6px;font-size:13px;line-height:1;color:var(--ink-soft)}
.order__moves button:hover{border-color:var(--accent);color:var(--accent)}
.order.locked .order__moves{display:none}
.order__item.good{border-color:#2f9e6e;background:rgba(47,158,110,.08)}
.order__item.bad{border-color:#d64550;background:rgba(214,69,80,.06)}
/* Matching */
.match__cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.match__col{display:flex;flex-direction:column;gap:8px}
.match__item{padding:13px 14px;border:1.5px solid var(--line);border-radius:var(--r-s);background:var(--panel);font-size:14.5px;text-align:left;transition:border-color .12s ease,box-shadow .12s ease}
.match__item:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line))}
.match__item.sel{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent)}
.match__item.paired{border-color:var(--mc,#888);background:color-mix(in srgb,var(--mc,#888) 12%,transparent)}
.match.locked .match__item{pointer-events:none}
.match__item.good{border-color:#2f9e6e!important;background:rgba(47,158,110,.1)!important}
.match__item.bad{border-color:#d64550!important;background:rgba(214,69,80,.08)!important}
/* Sort */
.sort__card{padding:12px 14px;border:1.5px solid var(--line);border-radius:var(--r-s);background:var(--panel);margin:8px 0}
.sort__text{display:block;font-size:15px;font-weight:500;margin-bottom:9px}
.sort__chips{display:flex;flex-wrap:wrap;gap:6px}
.sort__chip{padding:7px 13px;border-radius:999px;border:1.5px solid var(--line);font-size:13px;font-weight:600;color:var(--ink-soft)}
.sort__chip.on{border-color:var(--accent);background:var(--accent);color:#fff}
.sort.locked .sort__chips{pointer-events:none}
.sort__card.good{border-color:#2f9e6e;background:rgba(47,158,110,.07)}
.sort__card.bad{border-color:#d64550;background:rgba(214,69,80,.06)}
/* Memory */
.memory__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}
.memory__card{aspect-ratio:3/4;border-radius:var(--r-s);border:0;position:relative;perspective:700px;background:none;padding:0}
.memory__face{position:absolute;inset:0;display:grid;place-items:center;padding:8px;text-align:center;font-size:13px;font-weight:600;line-height:1.3;border-radius:var(--r-s);backface-visibility:hidden;transition:transform .4s cubic-bezier(.2,.7,.3,1)}
.memory__front{background:var(--panel);border:1px solid var(--line);color:var(--ink);transform:rotateY(180deg)}
.memory__back{background:linear-gradient(140deg,var(--accent),color-mix(in srgb,var(--accent) 60%,#000));color:transparent}
.memory__back::after{content:"?";color:#fff;font-size:24px;font-weight:800;opacity:.85}
.memory__card.up .memory__front,.memory__card.done .memory__front{transform:rotateY(0)}
.memory__card.up .memory__back,.memory__card.done .memory__back{transform:rotateY(-180deg)}
.memory__card.done .memory__front{border-color:#2f9e6e;box-shadow:0 0 0 2px rgba(47,158,110,.3)}
.memory__status{margin-top:12px;font-size:14px;font-weight:600;color:var(--ink-soft);text-align:center}

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
/* Motion is a course setting: lively blocks rise in as you scroll, calm
   ones only fade, still means no movement at all. */
body[data-motion=lively] main .blk{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.7,.3,1)}
body[data-motion=calm] main .blk{opacity:0;transition:opacity .6s ease}
body[data-motion] main .blk.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}html{scroll-behavior:auto}main .blk{opacity:1!important;transform:none!important}}
@media print{.topbar,.menu,.lesson__nav{display:none}.lesson{display:block!important}main .blk{opacity:1!important;transform:none!important}}
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
/* Standalone courses remember progress in the browser, so a learner who
   closes the tab can pick up where they left off. */
var storeKey='lumina-resume:'+(document.title||'course').toLowerCase().replace(/[^a-z0-9]+/g,'-');
if(!scorm.on){
  try{
    var localRaw=localStorage.getItem(storeKey);
    if(localRaw){
      var localSaved=JSON.parse(localRaw);
      if(localSaved&&typeof localSaved.i==='number'&&(Object.keys(localSaved.seen||{}).length||Object.keys(localSaved.quiz||{}).length)){
        state=localSaved;
        var sb=document.getElementById('start');
        if(sb)sb.textContent='Pick up where you left off';
      }
    }
  }catch(e){}
}
function persist(){
  if(scorm.api){
    sset('cmi.suspend_data',JSON.stringify(state));
    var qs=Object.keys(state.quiz),right=0;
    qs.forEach(function(k){if(state.quiz[k].ok)right++});
    if(qs.length){sset('cmi.core.score.min',0);sset('cmi.core.score.max',100);sset('cmi.core.score.raw',Math.round(100*right/qs.length))}
    scommit();
  }else{
    try{localStorage.setItem(storeKey,JSON.stringify(state))}catch(e){}
  }
}

/* ── Progress + navigation ── */
/* Every scored or participatory interaction counts toward completion. */
var totalQuiz=document.querySelectorAll('[data-quiz],[data-mq],[data-fib],[data-poll],[data-scenario],[data-order],[data-match],[data-sort],[data-memory]').length;
function progress(){
  var seen=Object.keys(state.seen).length,answered=Object.keys(state.quiz).length;
  var p=(seen+answered)/(lessons.length+totalQuiz);
  if(bar)bar.style.transform='scaleX('+p+')';
  if(pct)pct.textContent=Math.round(p*100)+'%';
  menuItems.forEach(function(m){m.classList.toggle('done',!!state.seen[m.dataset.i])});
  if(p>=1)sset('cmi.core.lesson_status','completed');
  persist();
}
function show(i,scroll){
  state.i=i;state.seen[i]=true;
  lessons.forEach(function(l,j){l.classList.toggle('on',j===i)});
  menuItems.forEach(function(m){
    var on=+m.dataset.i===i;
    m.classList.toggle('on',on);
    if(on)m.setAttribute('aria-current','true');else m.removeAttribute('aria-current');
  });
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

/* ── Shared game helpers ── */
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function norm(s){return String(s).toLowerCase().replace(/\\s+/g,' ').trim()}
var MATCH_COLORS=['#5B8DEF','#E15B8F','#2DD4BF','#F5A623','#8B7CF6','#FF7A6B','#34A853','#C084FC'];
/* Record a scored interaction; drives progress bar + SCORM score. */
function record(id,ok,resp){
  state.quiz[id]={ok:!!ok,done:true};
  if(scorm.api){
    var n=Object.keys(state.quiz).length-1;
    sset('cmi.interactions.'+n+'.id',id);
    sset('cmi.interactions.'+n+'.type','other');
    if(resp!=null)sset('cmi.interactions.'+n+'.student_response',String(resp).slice(0,255));
    sset('cmi.interactions.'+n+'.result',ok?'correct':'wrong');
  }
  progress();
}
function verdictText(el,ok){var v=el.querySelector('.quiz__verdict');if(v)v.textContent=ok?'Correct!':'Not quite.';var r=el.querySelector('.quiz__result');if(r)r.hidden=false;}

/* ── Reveal (think, then uncover) ── */
document.querySelectorAll('[data-reveal]').forEach(function(b){
  b.addEventListener('click',function(){
    var open=b.classList.toggle('open');
    b.setAttribute('aria-expanded',open?'true':'false');
    var ans=b.querySelector('.reveal__ans'),hint=b.querySelector('.reveal__hint');
    if(ans)ans.hidden=!open;if(hint)hint.textContent=open?'Tap to hide':'Tap to reveal';
  });
});

/* ── Reflection (private notes, saved on device) ── */
document.querySelectorAll('[data-reflect]').forEach(function(el){
  var id=el.getAttribute('data-reflect'),ta=el.querySelector('.reflection__input'),saved=el.querySelector('.reflection__saved');
  if(state.reflect&&state.reflect[id])ta.value=state.reflect[id];
  var t;
  ta.addEventListener('input',function(){
    if(!state.reflect)state.reflect={};
    state.reflect[id]=ta.value;
    if(saved){saved.hidden=false}
    clearTimeout(t);t=setTimeout(persist,400);
  });
});

/* ── Multi-select ── */
document.querySelectorAll('[data-mq]').forEach(function(el){
  var id=el.getAttribute('data-mq');
  var correct=(el.getAttribute('data-correct')||'').split(',').filter(function(s){return s!==''}).map(Number);
  var opts=[].slice.call(el.querySelectorAll('.mq__opt')),submit=el.querySelector('.quiz__submit');
  function sync(){submit.disabled=!opts.some(function(o){return o.getAttribute('aria-checked')==='true'})}
  function lock(){
    el.classList.add('locked');
    opts.forEach(function(o){
      var i=+o.getAttribute('data-i'),picked=o.getAttribute('aria-checked')==='true',right=correct.indexOf(i)>-1;
      if(right)o.classList.add('good');else if(picked)o.classList.add('bad');
    });
  }
  opts.forEach(function(o){o.addEventListener('click',function(){o.setAttribute('aria-checked',o.getAttribute('aria-checked')==='true'?'false':'true');sync()})});
  submit.addEventListener('click',function(){
    var picked=opts.filter(function(o){return o.getAttribute('aria-checked')==='true'}).map(function(o){return +o.getAttribute('data-i')});
    var ok=picked.length===correct.length&&picked.every(function(i){return correct.indexOf(i)>-1});
    lock();verdictText(el,ok);record(id,ok,picked.join(','));
  });
  if(state.quiz[id]){el.classList.add('locked');verdictText(el,state.quiz[id].ok);submit.style.display='none'}
});

/* ── Fill the blank ── */
document.querySelectorAll('[data-fib]').forEach(function(el){
  var id=el.getAttribute('data-fib'),input=el.querySelector('.fib__input'),submit=el.querySelector('.quiz__submit');
  var answers=[];try{answers=JSON.parse(el.getAttribute('data-answers')||'[]')}catch(e){}
  var accepted=answers.map(norm);
  function check(){
    var ok=accepted.indexOf(norm(input.value))>-1;
    el.classList.add('locked');input.classList.add(ok?'good':'bad');
    verdictText(el,ok);record(id,ok,input.value);
  }
  submit.addEventListener('click',check);
  input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();if(!el.classList.contains('locked'))check()}});
  if(state.quiz[id]){el.classList.add('locked');input.classList.add(state.quiz[id].ok?'good':'bad');verdictText(el,state.quiz[id].ok);submit.style.display='none';input.disabled=true}
});

/* ── Poll (local tally on this device) ── */
document.querySelectorAll('[data-poll]').forEach(function(el){
  var id=el.getAttribute('data-poll'),opts=[].slice.call(el.querySelectorAll('.poll__opt')),note=el.querySelector('.poll__note');
  var key='lumina-poll:'+id;
  function counts(){try{var c=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(c)?c:[]}catch(e){return[]}}
  function render(mine){
    var c=counts(),total=c.reduce(function(a,b){return a+(b||0)},0)||1;
    el.classList.add('voted');
    opts.forEach(function(o,i){
      var pct=Math.round(100*(c[i]||0)/total);
      o.querySelector('.poll__pct').textContent=pct+'%';
      o.querySelector('.poll__bar i').style.width=pct+'%';
      if(i===mine)o.classList.add('mine');
    });
    if(note)note.hidden=false;
  }
  opts.forEach(function(o,i){o.addEventListener('click',function(){
    var c=counts();while(c.length<opts.length)c.push(0);c[i]=(c[i]||0)+1;
    try{localStorage.setItem(key,JSON.stringify(c))}catch(e){}
    render(i);record(id,true,String(i));
  })});
  if(state.quiz[id])render(-1);
});

/* ── Scenario (branching outcomes) ── */
document.querySelectorAll('[data-scenario]').forEach(function(el){
  var id=el.getAttribute('data-scenario'),best=+el.getAttribute('data-best');
  var choices=[].slice.call(el.querySelectorAll('.scenario__choice'));
  var out=el.querySelector('.scenario__outcome'),label=el.querySelector('.scenario__label'),text=el.querySelector('.scenario__text');
  var debrief=el.querySelector('.scenario__debrief'),retry=el.querySelector('.scenario__retry');
  function choose(btn,save){
    var i=+btn.getAttribute('data-i'),ok=i===best;
    el.classList.add('done');choices.forEach(function(c){c.classList.remove('picked')});btn.classList.add('picked');
    out.hidden=false;out.className='scenario__outcome '+(ok?'good':'bad');
    label.textContent=ok?'Good call':'Consider this';
    text.textContent=btn.getAttribute('data-outcome')||'';
    if(debrief)debrief.hidden=false;
    if(retry)retry.hidden=false;
    if(save)record(id,ok,String(i));
  }
  choices.forEach(function(c){c.addEventListener('click',function(){choose(c,true)})});
  if(retry)retry.addEventListener('click',function(){el.classList.remove('done');out.hidden=true;if(debrief)debrief.hidden=true;retry.hidden=true;choices.forEach(function(c){c.classList.remove('picked')})});
});

/* ── Ordering (arrange the steps) ── */
document.querySelectorAll('[data-order]').forEach(function(el){
  var id=el.getAttribute('data-order'),list=el.querySelector('.order__list');
  var items=[].slice.call(list.children);
  shuffle(items).forEach(function(li){list.appendChild(li)});
  list.addEventListener('click',function(e){
    var up=e.target.closest('.order__up'),down=e.target.closest('.order__down');
    if(el.classList.contains('locked'))return;
    var li=e.target.closest('.order__item');if(!li)return;
    if(up&&li.previousElementSibling)list.insertBefore(li,li.previousElementSibling);
    else if(down&&li.nextElementSibling)list.insertBefore(li.nextElementSibling,li);
  });
  el.querySelector('.quiz__submit').addEventListener('click',function(){
    var cur=[].slice.call(list.children),ok=true;
    cur.forEach(function(li,idx){var right=+li.getAttribute('data-key')===idx;li.classList.add(right?'good':'bad');if(!right)ok=false});
    el.classList.add('locked');verdictText(el,ok);record(id,ok);
  });
  if(state.quiz[id]){el.classList.add('locked');verdictText(el,state.quiz[id].ok);el.querySelector('.quiz__submit').style.display='none'}
});

/* ── Matching (tap left, tap right) ── */
document.querySelectorAll('[data-match]').forEach(function(el){
  var id=el.getAttribute('data-match');
  var rights=[].slice.call(el.querySelectorAll('.match__right .match__item'));
  shuffle(rights).forEach(function(b){b.parentNode.appendChild(b)});
  var items=[].slice.call(el.querySelectorAll('.match__item')),submit=el.querySelector('.quiz__submit');
  var sel=null,links={},cn=0;
  function keyOf(b){return b.getAttribute('data-side')+b.getAttribute('data-key')}
  function clearPair(b){
    var lk=keyOf(b),partner=links[lk];if(!partner)return;
    [b,partner].forEach(function(x){x.classList.remove('paired');x.style.removeProperty('--mc');delete links[keyOf(x)]});
  }
  items.forEach(function(b){b.addEventListener('click',function(){
    if(el.classList.contains('locked'))return;
    if(links[keyOf(b)]){clearPair(b);sync();return}
    if(!sel){sel=b;b.classList.add('sel');return}
    if(sel===b){sel.classList.remove('sel');sel=null;return}
    if(sel.getAttribute('data-side')===b.getAttribute('data-side')){sel.classList.remove('sel');sel=b;b.classList.add('sel');return}
    var color=MATCH_COLORS[cn++%MATCH_COLORS.length];
    [sel,b].forEach(function(x){x.classList.remove('sel');x.classList.add('paired');x.style.setProperty('--mc',color)});
    links[keyOf(sel)]=b;links[keyOf(b)]=sel;sel=null;sync();
  })});
  function sync(){submit.disabled=[].slice.call(el.querySelectorAll('.match__left .match__item')).some(function(b){return !links[keyOf(b)]})}
  submit.addEventListener('click',function(){
    var ok=true;
    el.querySelectorAll('.match__left .match__item').forEach(function(l){
      var partner=links[keyOf(l)],right=partner&&partner.getAttribute('data-key')===l.getAttribute('data-key');
      l.classList.add(right?'good':'bad');if(partner)partner.classList.add(right?'good':'bad');if(!right)ok=false;
    });
    el.classList.add('locked');verdictText(el,ok);record(id,ok);
  });
  if(state.quiz[id]){el.classList.add('locked');verdictText(el,state.quiz[id].ok);submit.style.display='none'}
});

/* ── Sort it (assign each card to a bucket) ── */
document.querySelectorAll('[data-sort]').forEach(function(el){
  var id=el.getAttribute('data-sort'),cards=[].slice.call(el.querySelectorAll('.sort__card'));
  cards.forEach(function(card){
    card.querySelectorAll('.sort__chip').forEach(function(chip){chip.addEventListener('click',function(){
      if(el.classList.contains('locked'))return;
      card.querySelectorAll('.sort__chip').forEach(function(c){c.classList.remove('on')});
      chip.classList.add('on');card.setAttribute('data-pick',chip.getAttribute('data-b'));
    })});
  });
  el.querySelector('.quiz__submit').addEventListener('click',function(){
    var ok=true;
    cards.forEach(function(card){var right=card.getAttribute('data-pick')===card.getAttribute('data-correct');card.classList.add(right?'good':'bad');if(!right)ok=false});
    el.classList.add('locked');verdictText(el,ok);record(id,ok);
  });
  if(state.quiz[id]){el.classList.add('locked');verdictText(el,state.quiz[id].ok);el.querySelector('.quiz__submit').style.display='none'}
});

/* ── Memory match ── */
document.querySelectorAll('[data-memory]').forEach(function(el){
  var id=el.getAttribute('data-memory'),grid=el.querySelector('.memory__grid'),status=el.querySelector('.memory__status');
  var faces=[];try{faces=JSON.parse(el.getAttribute('data-faces')||'[]')}catch(e){}
  var already=state.quiz[id]&&state.quiz[id].done;
  shuffle(faces.slice()).forEach(function(f){
    var b=document.createElement('button');b.className='memory__card';b.setAttribute('data-pair',f.pair);
    b.innerHTML='<span class="memory__face memory__front">'+f.text.replace(/[&<>]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':'&gt;'})+'</span><span class="memory__face memory__back" aria-hidden="true"></span>';
    grid.appendChild(b);
  });
  var cards=[].slice.call(grid.children),open=[],matched=0,moves=0,pairs=faces.length/2;
  if(already){cards.forEach(function(c){c.classList.add('done')});status.textContent='Solved';return}
  function tap(c){
    if(c.classList.contains('up')||c.classList.contains('done')||open.length>=2)return;
    c.classList.add('up');open.push(c);
    if(open.length===2){
      moves++;
      var a=open[0],b=open[1];
      if(a.getAttribute('data-pair')===b.getAttribute('data-pair')){
        setTimeout(function(){a.classList.add('done');b.classList.add('done');a.classList.remove('up');b.classList.remove('up');open=[];matched++;
          status.textContent=matched+' of '+pairs+' pairs';
          if(matched===pairs){status.textContent='Solved in '+moves+' moves!';record(id,true)}
        },380);
      }else{
        setTimeout(function(){a.classList.remove('up');b.classList.remove('up');open=[]},760);
      }
    }
  }
  cards.forEach(function(c){c.addEventListener('click',function(){tap(c)})});
  status.textContent='0 of '+pairs+' pairs';
});

/* ── Scroll reveal (per the course's motion setting) ── */
(function(){
  var motion=document.body.getAttribute('data-motion');
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var blocks=[].slice.call(document.querySelectorAll('main .blk'));
  if(motion&&!reduced&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
    },{threshold:0.06,rootMargin:'0px 0px -8% 0px'});
    blocks.forEach(function(b){io.observe(b)});
  }else{
    blocks.forEach(function(b){b.classList.add('in')});
  }
})();

progress();
})();
`

export function renderPlayerHtml(course: LuminaCourse, options: PlayerOptions = {}): string {
  quizCounter = 0
  const lessons = course.lessons.filter(l => l.blocks.length)
  const theme = course.theme
  const accent = theme.accent
  const canvas = LUMINA_CANVASES[theme.canvas]
  const corners = LUMINA_CORNERS[theme.corners]
  const scale = LUMINA_SCALES[theme.scale]
  const bodyFont = LUMINA_FONTS[theme.bodyFont].stack
  const headFont = LUMINA_FONTS[theme.headingFont].stack
  const minutes = courseReadingMinutes(course)

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
<meta name="generator" content="Lumina (entertrainer.in)">
<style>:root{--accent:${esc(accent)};--paper:${esc(canvas.paper)};--panel:${esc(canvas.panel)};--ink:${esc(canvas.ink)};--r:${corners.r}px;--r-s:${corners.rs}px;--fs:${scale.px}px;--font-body:${bodyFont};--font-head:${headFont}}${PLAYER_CSS}</style>
</head>
<body${theme.motion === 'off' ? '' : ` data-motion="${esc(theme.motion)}"`}>

<div class="cover" id="cover">
  <span class="cover__kicker">Interactive course</span>
  <h1>${esc(course.title || 'Untitled Course')}</h1>
  ${course.description.trim() ? `<p class="cover__desc">${esc(course.description.trim())}</p>` : ''}
  <p class="cover__meta">${lessons.length} lesson${lessons.length === 1 ? '' : 's'} · about ${minutes} min</p>
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
      <p>You made it to the end of “${esc(course.title || 'this course')}”.</p>
    </section>
  </main>
</div>

<script>${options.scorm ? 'window.LUMINA_SCORM=true;' : ''}${PLAYER_JS}</script>
</body>
</html>`
}
