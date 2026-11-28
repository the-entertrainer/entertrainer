// Generates the five static pages of the Entertrainer rebuild (tasteskill 2.5.1 kit) into root/v2.
import { writeFileSync } from 'node:fs';
const OUT = new URL('../public/v2/', import.meta.url);
const MAIL = 'mailto:mail@entertrainer.in?subject=Training%20project';
const ARROW = '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';
const MAIN = `<a class="btn btn--primary" href="${MAIL}">Email Naveen${ARROW}</a>`;

const ESSAYS = [
  { slug: 'you-are-not-lazy-you-are-helping-the-universe-extend-its-life', title: 'Why hot tea goes cold', min: 6, img: '/blog/entropy-laziness/hero.jpg', alt: 'Ink drawing of a teacup with blue arrows carrying the heat up and out of the cup', topic: 'Physics' },
  { slug: 'why-isnt-the-moon-moonly', title: 'Why isn’t the Moon moonly?', min: 5, img: '/blog/moonly/hero.jpg', alt: 'Ink drawing of a crescent moon joined by a line to a blue oil lamp', topic: 'Language' },
  { slug: 'tajjalan', title: 'The cup stays. The tea does not.', min: 6, img: '/blog/tajjalan/hero.jpg', alt: 'Ink drawing of three clay cups, one being filled with blue tea, one full and one empty', topic: 'Upanishads' },
  { slug: 'the-midpoint-of-your-life-isnt-40-its-18', title: 'The middle of your life is not 40', min: 5, img: '/blog/life-midpoint/hero.jpg', alt: 'Ink drawing of a time line with a young man at one end, an old man at the other and a blue mark near the start', topic: 'Mind' },
  { slug: 'you-only-find-out-when-you-have-to-explain-it', title: 'You find out when you have to explain it', min: 6, img: '/blog/feeling-of-knowing/hero.jpg', alt: 'Ink drawing of a zip pulled apart, its slider and teeth labelled', topic: 'Learning' },
  { slug: 'one-equals-two-lets-break-maths', title: 'How a school proof gets 2 equals 1', min: 7, img: '/blog/one-equals-two/hero.jpg', alt: 'Ink drawing of a circle, an equals sign and a blue stroke crossing it out', topic: 'Maths' },
];

const NAV = [
  ['elevate', 'Elevate', 'elevate.html'],
  ['empower', 'Empower', 'empower.html'],
  ['engage', 'Engage', 'engage.html'],
  ['about', 'About', 'about.html'],
];

function head({ title, desc, extraCss = '', moments = [], icons = false }) {
  return `<!doctype html>
<html lang="en" data-type="service" data-radius="soft" data-buttons="arrow" data-motion>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="/about/naveen-speaking-close.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#dfdedb">
<meta name="robots" content="noindex">
<!-- <link rel="canonical" href="https://entertrainer.in/"> once this build replaces the live site -->
<meta name="site-kind" content="other">
<meta name="page-type" content="service">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400..700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/system.css">
<link rel="stylesheet" href="assets/ui/cards.css">
<link rel="stylesheet" href="assets/motion/motion.css">
<link rel="stylesheet" href="assets/layout/layout.css">
${icons ? '<link rel="stylesheet" href="assets/icons/icon.css">\n' : ''}<style>
:root {
  --p-bg: #dfdedb; --p-surface: #d3d2ce; --p-ink: #26251e; --p-muted: #5a5850;
  --p-accent: #2456d6; --p-accent-ink: #ffffff; --p-action: #2456d6; --p-action-ink: #ffffff;
  --p-inv-bg: #26251e; --p-inv-surface: #313029; --p-inv-ink: #dfdedb; --p-inv-muted: #9e9d99;
  --p-inv-accent: #dfdedb; --p-inv-accent-ink: #26251e; --p-inv-action: #dfdedb; --p-inv-action-ink: #26251e;
  --font-display: "Hanken Grotesk", system-ui, sans-serif;
  --font-text: "Hanken Grotesk", system-ui, sans-serif;
  --display-weight: 400;
  --display-tracking: -0.03em;
  --display-tracking-xl: -0.038em;
}
.rows .rows__name small { display: block; font-weight: 400; color: var(--muted); font-size: var(--t-small); }
${extraCss}
</style>
<script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>
${moments.length ? `<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="assets/moments/moments.js">
<link rel="modulepreload" href="assets/moments/lib.js">
${moments.map(m => `<link rel="modulepreload" href="assets/moments/${m}/moment.js">`).join('\n')}` : ''}
</head>`;
}

function nav(current, deal) {
  const items = NAV.map(([id, word, href]) => {
    const cur = id === current ? ' aria-current="page"' : '';
    if (id === 'elevate') {
      return `      <div class="nav__item">
        <a class="nav__link" href="${href}"${cur}>${word} <svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <div class="nav__menu">
          <div class="wrap grid">
${ESSAYS.slice(0, 4).map(e => `            <a class="menu-card span-3" href="/elevate/${e.slug}">
              <div class="panel"><img class="frame__img" src="${e.img}" alt="${e.alt}" loading="lazy"></div>
              <span class="t-card">${e.title}</span>
              <span class="t-small muted">${e.topic}, ${e.min} minutes</span>
            </a>`).join('\n')}
          </div>
        </div>
      </div>`;
    }
    return `      <div class="nav__item"><a class="nav__link" href="${href}"${cur}>${word}</a></div>`;
  }).join('\n');
  return `<body>
<!-- type: service (Naveen Jose, instructional designer; brand Entertrainer)
     deal: ${deal}
     site: nav nav-split, close close-photo, footer footer-dark, rhythm surface-pairs, buttons arrow, mark wordmark,
     palette stone-blueprint (warm stone paper and a cobalt ink accent: the same paper and blue ink as the essay drawings),
     type hanken (Hanken Grotesk), radius soft, grounds none (kind other) -->
<header class="nav nav--split">
  <div class="wrap nav__bar">
    <a class="skip-link" href="#top">Skip to content</a>
    <nav class="nav__links" aria-label="Main">
${items}
    </nav>
    <a class="nav__logo" href="index.html">Entertrainer</a>
    <div class="nav__actions">
      <a class="btn btn--primary" href="${MAIL}">Email Naveen</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
  </div>
</header>
`;
}

function footer({ h2, line, img, alt, pos = '50% 40%' }) {
  return `
<footer class="footer closing footer--dark ground-inverse g2m" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--photo">
      <div class="section-head--split">
        <div><h2 id="close-h">${h2}</h2><p class="t-lead">${line}</p></div>
        ${MAIN}
      </div>
      <div class="close__media"><img src="${img}" alt="${alt}" loading="lazy" style="object-position: ${pos}" data-source="client" data-subject="${alt}"></div>
    </div>
    <div class="closing__links">
      <div class="grid">
        <div class="span-4 stack-4">
          <a class="nav__logo" href="index.html">Entertrainer</a>
          <p class="footer__lede">Training design, free apps for trainers, essays and learning games by Naveen Jose.</p>
        </div>
        <div class="span-2 footer__col"><h3>Writing</h3><ul><li><a href="elevate.html">Elevate</a></li><li><a href="/elevate/${ESSAYS[0].slug}">Latest essay</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Apps</h3><ul><li><a href="/empower/aim">Aim</a></li><li><a href="/empower/plain">Plain</a></li><li><a href="/empower/cue">Cue</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Games</h3><ul><li><a href="/engage/ladder">Ladder</a></li><li><a href="/engage/pairs">Pairs</a></li><li><a href="/engage/steps">Steps</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Naveen</h3><ul><li><a href="about.html">About</a></li><li><a href="https://www.linkedin.com/in/entertrainer">LinkedIn</a></li></ul></div>
      </div>
      <div class="footer__legal">
        <span>&copy; 2026 Entertrainer</span>
        <div class="socials"></div>
      </div>
    </div>
  </div>
</footer>

<nav class="actionbar" aria-label="Quick actions">
  <a class="btn btn--primary" href="${MAIL}">Email Naveen</a>
</nav>

<script type="module" src="assets/system.js"></script>
<script type="module" src="assets/motion/motion.js"></script>
<script type="module" src="assets/layout/layout.js"></script>
</body>
</html>
`;
}

const essayCard = (e, cls = 'span-4') => `          <a class="card card--open ${cls}" href="/elevate/${e.slug}">
            <div class="panel"><img class="frame__img" src="${e.img}" alt="${e.alt}" loading="lazy"></div>
            <h3>${e.title}</h3>
            <p class="t-small muted">${e.topic}, ${e.min} minutes</p>
          </a>`;

/* ---------- live HTML of the client's own apps and games (page CSS inside a visual) ---------- */
const UI_CSS = `
.app { position: absolute; inset: 0; display: grid; place-items: center; padding: 24px; }
.app__win { width: min(100%, 380px); background: var(--p-bg); color: var(--p-ink); border-radius: 14px; border: 1px solid color-mix(in oklab, var(--p-ink) 12%, transparent); padding: 16px; font-size: 14px; line-height: 1.4; display: grid; gap: 10px; }
.app__bar { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--p-muted); }
.app__name { font-weight: 600; color: var(--p-ink); font-size: 13px; }
.app__chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px; border-radius: 99px; background: var(--p-surface); font-size: 12px; }
.app__chip--on { background: var(--p-accent); color: var(--p-accent-ink); }
.app__chip--warn { background: #f3d9b8; color: #5b3a12; }
.app__row { display: flex; gap: 6px; flex-wrap: wrap; }
.app__line { background: #fff; border-radius: 8px; padding: 10px 12px; }
.app__line mark { background: #f3d9b8; color: inherit; border-radius: 3px; padding: 0 2px; }
.app__meter { height: 6px; border-radius: 99px; background: var(--p-surface); overflow: hidden; }
.app__meter i { display: block; height: 100%; width: 72%; background: var(--p-accent); border-radius: inherit; }
.app__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.app__list li { display: grid; grid-template-columns: 44px 1fr auto; gap: 8px; align-items: center; background: #fff; border-radius: 8px; padding: 8px 10px; }
.app__list b { font-weight: 600; font-variant-numeric: tabular-nums; color: var(--p-accent); }
.app__list span:last-child { color: var(--p-muted); font-size: 12px; }
.rungs { display: grid; gap: 5px; }
.rungs span { display: flex; justify-content: space-between; background: #fff; border-radius: 8px; padding: 5px 12px; font-size: 13px; }
.rungs span.is-hit { background: var(--p-accent); color: var(--p-accent-ink); }
.pairs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.pairs span { aspect-ratio: 3 / 4; border-radius: 8px; background: var(--p-ink); display: grid; place-items: center; text-align: center; font-size: 11px; line-height: 1.2; padding: 4px; color: var(--p-bg); }
.pairs span.is-up { background: #fff; color: var(--p-ink); }
.pairs span.is-match { background: var(--p-accent); color: var(--p-accent-ink); }
.app__verb { text-align: center; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; padding: 0; }
`;

const UI = {
  aim: `<div class="app" role="img" aria-label="The Aim app building the objective: new joiners will greet a guest by name within 30 seconds of arrival"><div class="app__win">
  <div class="app__bar"><span class="app__name">Aim</span><span>Bloom level: apply</span></div>
  <div class="app__row"><span class="app__chip">Who: new joiners</span><span class="app__chip app__chip--on">Verb: greet</span><span class="app__chip">Bar: 30 seconds</span></div>
  <div class="app__line">New joiners will <b>greet</b> a guest by name within 30 seconds of arrival.</div>
  <div class="app__row"><span class="app__chip app__chip--warn">“Understand” cannot be seen. Try “explain”.</span></div>
</div></div>`,
  plain: `<div class="app" role="img" aria-label="The Plain app flagging a long sentence and a passive verb in a pasted instruction"><div class="app__win">
  <div class="app__bar"><span class="app__name">Plain</span><span>Score 72</span></div>
  <div class="app__meter"><i></i></div>
  <div class="app__line">The form <mark>should be completed</mark> by the associate prior to the commencement of the shift <mark>in all cases where applicable</mark>.</div>
  <div class="app__row"><span class="app__chip app__chip--warn">Passive voice</span><span class="app__chip app__chip--warn">24 words</span><span class="app__chip">2 fixes</span></div>
</div></div>`,
  cue: `<div class="app" role="img" aria-label="The Cue app showing a 60-minute session plan with Gagné's events and their minutes"><div class="app__win">
  <div class="app__bar"><span class="app__name">Cue</span><span>Fire drill, 60 min</span></div>
  <ol class="app__list">
    <li><b>0:00</b><span>Gain attention</span><span>4 min</span></li>
    <li><b>0:04</b><span>State the objective</span><span>3 min</span></li>
    <li><b>0:07</b><span>Recall the last drill</span><span>6 min</span></li>
    <li><b>0:13</b><span>Walk the exit route</span><span>15 min</span></li>
  </ol>
</div></div>`,
  ladder: `<div class="app" role="img" aria-label="The Ladder game: the verb design waits to be placed on one of the six rungs of Bloom's ladder"><div class="app__win">
  <div class="app__bar"><span class="app__name">Ladder</span><span>0:42 left · streak 6</span></div>
  <div class="app__verb">design</div>
  <div class="rungs"><span class="is-hit">Create <small>tap</small></span><span>Evaluate</span><span>Analyse</span><span>Apply</span><span>Understand</span><span>Remember</span></div>
</div></div>`,
  pairs: `<div class="app" role="img" aria-label="The Pairs game: twelve cards, two matched terms turned up in blue"><div class="app__win">
  <div class="app__bar"><span class="app__name">Pairs</span><span>9 moves</span></div>
  <div class="pairs"><span class="is-match">Spacing</span><span></span><span class="is-up">Recall beats rereading</span><span></span><span></span><span class="is-match">Review over days</span><span></span><span></span><span class="is-up">Retrieval practice</span><span></span><span></span><span></span></div>
</div></div>`,
  steps: `<div class="app" role="img" aria-label="The Steps game: the steps of making chai being dragged back into order"><div class="app__win">
  <div class="app__bar"><span class="app__name">Steps</span><span>Making chai · 1 check</span></div>
  <ol class="app__list">
    <li><b>1</b><span>Boil water and tea leaves</span><span>✓</span></li>
    <li><b>2</b><span>Add ginger and cardamom</span><span>✓</span></li>
    <li><b>3</b><span>Pour in the milk</span><span>drag</span></li>
    <li><b>4</b><span>Strain into cups</span><span></span></li>
  </ol>
</div></div>`,
};

/* ---------------------------------- HOME ---------------------------------- */
const home = head({
  title: 'Entertrainer: instructional design by Naveen Jose',
  desc: 'Naveen Jose designs onboarding, e-learning and train-the-trainer programmes for hotel and service teams, and makes free apps and games for trainers.',
  moments: ['pinned-chapters'],
  extraCss: UI_CSS + `#free .panel { --p-h: 300px; background: var(--p-bg); position: relative; } @media (max-width: 639px) { #free .panel { --p-h: 240px; } }
@media (min-width: 1024px) { #services .frame { min-height: 600px; } }
/* pinned-chapters rests unpinned on a phone: hold it to its two phone screens so no neighbour shows */
@media (max-width: 639px) { main > #work[data-moment]:not(.is-live) { min-height: calc(2 * 100lvh); } #work .mo-pc__visual > img { aspect-ratio: 4 / 3; max-height: 34svh; } }`,
}) + nav('', 'hero split, moment pinned-chapters (#work)') + `
<main id="top">
  <section class="hero hero--split" data-enter aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text grid hero__grid">
      <div class="hero__text span-5">
        <p class="hero__kicker"><span class="dot" aria-hidden="true"></span>Ten essays, three apps and three games, all free</p>
        <h1 id="hero-h">Instructional design for service teams</h1>
        <p class="hero__lead">I’m Naveen Jose. I design onboarding, e-learning and trainer programmes in Storyline 360 and Vyond, after years on hotel floors at Club Mahindra and Marriott.</p>
        <div class="btn-row">${MAIN}<a class="btn btn--secondary" href="empower.html">See the free apps</a></div>
      </div>
      <div class="hero__media span-6 start-7">
        <img src="/about/naveen-speaking-close.jpg" alt="Naveen Jose speaking into a microphone during a training session at Courtyard by Marriott, Mahabaleshwar" style="--ly-pos: 50% 22%" fetchpriority="high" data-source="client" data-subject="Naveen Jose training">
        <div class="ly-float">
          <div class="ly-float__row"><span class="ly-live">Latest essay</span><span>6 minutes</span></div>
          <div class="ly-float__title">Why hot tea goes cold</div>
        </div>
      </div>
    </div></div>
  </section>

  <section class="section" id="work" style="--h: 2; --hm: 2" data-moment="pinned-chapters" aria-labelledby="work-h">
    <div class="wrap mo-pc__grid">
      <div class="mo-pc__text">
        <h2 id="work-h">Training programmes from Marriott and Club Mahindra</h2>
        <ol class="mo-pc__steps">
          <li class="mo-pc__step">
            <h3>Onboarding training for new hotel staff</h3>
            <p>Heroes on Board, a Gurukul workshop at Courtyard by Marriott, Mahabaleshwar, built around the first weeks on the job.</p>
            <figure class="mo-pc__visual"><img src="/about/about-onboarding.webp" alt="Collage of the Heroes on Board onboarding workshop, with new staff in a training room" width="1131" height="1600"></figure>
          </li>
          <li class="mo-pc__step">
            <h3>Masterclass training for departmental trainers</h3>
            <p>The CDT Masterclass taught department trainers to plan and run their own sessions, with a certificate at the end.</p>
            <figure class="mo-pc__visual"><img src="/about/about-cdt.webp" alt="Collage of the CDT Masterclass, trainers holding their certificates" width="1024" height="1280"></figure>
          </li>
          <li class="mo-pc__step">
            <h3>A training comic for resort housekeeping</h3>
            <p>The SEWA Chronicles told service, empathy, warmth and attentiveness as a printed comic for the team in Coorg.</p>
            <figure class="mo-pc__visual"><img src="/about/about-sewa-1.webp" alt="Printed SEWA Chronicles booklet and comic pages on a white table" width="1600" height="900"></figure>
          </li>
        </ol>
      </div>
      <div class="mo-pc__visuals frame"></div>
    </div>
  </section>

  <section class="section ground-surface" id="services" style="--hm: 2" aria-labelledby="services-h">
    <div class="wrap grid grid--top fill">
      <div class="span-6">
        <div class="section-head">
          <h2 id="services-h">Training services and formats</h2>
          <p>Each one quoted per project, for your LMS, your trainers or the floor.</p>
        </div>
        <ul class="rows">
          <li><span class="rows__name">E-learning modules<small>Built in Storyline 360, delivered as SCORM</small></span><span class="rows__value">SCORM</span></li>
          <li><span class="rows__name">Explainer videos<small>Animated in Vyond and After Effects</small></span><span class="rows__value">MP4</span></li>
          <li><span class="rows__name">Session plans<small>Minute-by-minute plans and trainer guides</small></span><span class="rows__value">PDF</span></li>
          <li><span class="rows__name">Learning games<small>Quizzes and card games for a team</small></span><span class="rows__value">Web</span></li>
          <li><span class="rows__name">Printed stories<small>Comics and booklets for staff who learn on the floor</small></span><span class="rows__value">Print</span></li>
        </ul>
      </div>
      <div class="frame frame--photo frame--fill span-6 start-7">
        <img class="frame__img" src="/about/naveen-speaking-projector.jpg" alt="Naveen Jose presenting to a room of trainees, a projector in the foreground" loading="lazy" style="object-position: 50% 30%" data-source="client" data-subject="Naveen Jose presenting">
      </div>
    </div>
  </section>

  <section class="section ground-surface" id="free" style="--hm: 2" aria-labelledby="free-h">
    <div class="wrap">
      <div class="section-head">
        <h2 id="free-h">Free training tools</h2>
        <p>Essays, apps and games you can use today, with no account.</p>
      </div>
      <div class="grid">
        <a class="card card--open span-4" href="elevate.html">
          <div class="panel"><img class="frame__img" src="${ESSAYS[4].img}" alt="${ESSAYS[4].alt}" loading="lazy"></div>
          <h3>10 essays on learning</h3>
          <p class="t-small muted">Learning, language and the mind, five to eight minutes each.</p>
        </a>
        <a class="card card--open span-4" href="empower.html">
          <div class="panel">${UI.aim}</div>
          <h3>3 apps for course writers</h3>
          <p class="t-small muted">Aim, Plain and Cue run in the browser. Nothing to install.</p>
        </a>
        <a class="card card--open span-4" href="engage.html">
          <div class="panel">${UI.ladder}</div>
          <h3>3 games for a team huddle</h3>
          <p class="t-small muted">Ladder, Pairs and Steps, about a minute a round.</p>
        </a>
      </div>
    </div>
  </section>
</main>
` + footer({ h2: 'Email Naveen about your training', line: 'Send the team, the topic and the date you need it by.', img: '/about/club-mahindra-resort.jpg', alt: 'The pool and tiered front of Courtyard by Marriott, Mahabaleshwar', pos: '50% 60%' });

/* ---------------------------------- ELEVATE ---------------------------------- */
const elevate = head({
  title: 'Elevate: essays on learning and the mind by Naveen Jose',
  desc: 'Ten short essays by Naveen Jose on learning, language, physics and the mind, each five to eight minutes long with its own ink drawing.',
  moments: ['word-highlight'],
  extraCss: `@media (max-width: 639px) { #essays .grid { grid-template-columns: 1fr 1fr; } #essays .card { grid-column: auto; } #essays .card h3 { font-size: 17px; } #essays .panel { --p-h: 120px; } }`,
}) + nav('elevate', 'hero photo, moment word-highlight (#why)') + `
<main id="top">
  <section class="hero hero--photo" data-enter data-calm="left" aria-labelledby="hero-h">
    <img class="hero__bg" src="/blog/life-midpoint/hero.jpg" alt="Ink drawing of a time line with a young man at one end, an old man at the other and a blue mark near the start" style="--ly-pos: 50% 50%; --ly-pos-phone: 62% 50%" fetchpriority="high" data-source="client" data-subject="essay drawing">
    <div class="wrap"><div class="hero-text">
      <div class="hero__text">
        <h1 id="hero-h">Essays on learning, language and the mind</h1>
        <p class="hero__lead">Ten short essays by Naveen Jose, five to eight minutes each, every one with its own ink drawing.</p>
        <div class="btn-row"><a class="btn btn--primary" href="/elevate/${ESSAYS[0].slug}">Read the latest essay${ARROW}</a><a class="btn btn--secondary" href="#essays">See all six</a></div>
      </div>
    </div></div>
  </section>

  <section class="section g2" id="essays" aria-labelledby="essays-h">
    <div class="wrap">
      <div class="group">
        <div class="section-head">
          <h2 id="essays-h">Six recent essays</h2>
          <p>Physics, language, the Upanishads, memory and maths, written for a reader with a cup of tea.</p>
        </div>
        <div class="grid">
${ESSAYS.slice(0, 3).map(e => essayCard(e)).join('\n')}
        </div>
      </div>
      <div class="grid">
${ESSAYS.slice(3, 6).map(e => essayCard(e)).join('\n')}
      </div>
    </div>
  </section>

  <section class="section statement ground-surface" id="why" data-moment="word-highlight" aria-label="How the essays are written">
    <div class="wrap">
      <p class="t-label">How they are written</p>
      <p class="mo-wh__text">Each essay takes one idea, one drawing that carries it, and a last line you could repeat to a friend at lunch. That is <strong>the same rule</strong> I use for a training module.</p>
    </div>
  </section>
</main>
` + footer({ h2: 'Email Naveen about an essay', line: 'Corrections, questions and topics are welcome.', img: '/blog/sacred-frequencies/hero.jpg', alt: 'Ink drawing of a tuning fork beside rows of waves, one row in blue', pos: '50% 50%' });

/* ---------------------------------- EMPOWER ---------------------------------- */
const empower = head({
  title: 'Empower: free apps for trainers by Naveen Jose',
  desc: 'Aim writes measurable learning objectives, Plain flags hard instructions and Cue plans a training session minute by minute. Free, in your browser.',
  moments: ['picture-develops'],
  extraCss: UI_CSS + `
#apps .panel { --p-h: 300px; background: var(--p-surface); position: relative; }
.develop { margin: 0; border-radius: var(--r-lg); overflow: hidden; height: min(560px, var(--ly-fit)); }
.develop > img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 25%; }
@media (max-width: 1023px) { .develop { height: auto; aspect-ratio: 4 / 3; margin-top: var(--s-7); } }
@media (max-width: 639px) { #apps .panel { --p-h: 240px; } }`,
}) + nav('empower', 'hero split (photo hero re-dealt: no wide photograph of the apps), moment picture-develops (#made)') + `
<main id="top">
  <section class="hero hero--split" data-enter aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text grid hero__grid">
      <div class="hero__text span-5">
        <h1 id="hero-h">Free apps for trainers and course writers</h1>
        <p class="hero__lead">Three browser apps: Aim writes measurable objectives, Plain flags hard instructions, Cue plans a session minute by minute. No sign-up.</p>
        <div class="btn-row"><a class="btn btn--primary" href="/empower/aim">Try Aim${ARROW}</a><a class="btn btn--secondary" href="#apps">See the three apps</a></div>
      </div>
      <div class="hero__media span-6 start-7">
        <img src="/about/naveen-speaking-projector.jpg" alt="Naveen Jose presenting to a room of trainees, a projector in the foreground" style="--ly-pos: 50% 30%" fetchpriority="high" data-source="client" data-subject="Naveen Jose presenting">
        <div class="ly-float">
          <div class="ly-float__row"><span class="ly-live">Aim</span><span>Free</span></div>
          <div class="ly-float__title">Checks each verb against Bloom’s six levels</div>
        </div>
      </div>
    </div></div>
  </section>

  <section class="section" id="apps" style="--hm: 2" aria-labelledby="apps-h">
    <div class="wrap">
      <div class="section-head">
        <h2 id="apps-h">Three apps for one course</h2>
        <p>Write the objective, check the words, then plan the hour.</p>
      </div>
      <div class="grid">
        <a class="card card--open span-4" href="/empower/aim"><div class="panel">${UI.aim}</div><h3>Writes an objective you can measure</h3><p class="t-small muted">Checks your verb against Bloom’s levels.</p></a>
        <a class="card card--open span-4" href="/empower/plain"><div class="panel">${UI.plain}</div><h3>Flags where readers will trip</h3><p class="t-small muted">Long sentences, passive voice, jargon.</p></a>
        <a class="card card--open span-4" href="/empower/cue"><div class="panel">${UI.cue}</div><h3>Plans a session by the minute</h3><p class="t-small muted">Gagné’s nine events as a run of show.</p></a>
      </div>
    </div>
  </section>

  <section class="section ground-surface" id="made" aria-labelledby="made-h">
    <div class="wrap grid grid--top">
      <div class="span-6">
        <div class="section-head">
          <h2 id="made-h">Made for training rooms</h2>
          <p>The apps answer questions trainers ask me in sessions like this one.</p>
        </div>
        <ul class="rows">
          <li><span class="rows__name">Runs in the browser<small>Your text stays on your device</small></span><span class="rows__value">Web</span></li>
          <li><span class="rows__name">No account<small>Open the link and start</small></span><span class="rows__value">Free</span></li>
          <li><span class="rows__name">Prints<small>Cue prints the run of show for the room</small></span><span class="rows__value">A4</span></li>
        </ul>
      </div>
      <figure class="develop span-6 start-7" data-moment="picture-develops"><img src="/about/naveen-speaking-stage.jpg" alt="Naveen Jose on stage with a microphone in a wood-panelled hall" width="933" height="1400" loading="lazy"></figure>
    </div>
  </section>
</main>
` + footer({ h2: 'Email Naveen about an app', line: 'Ask for a feature or report a bug.', img: '/about/club-mahindra-resort.jpg', alt: 'The pool and tiered front of Courtyard by Marriott, Mahabaleshwar', pos: '50% 60%' });

/* ---------------------------------- ENGAGE ---------------------------------- */
const engage = head({
  title: 'Engage: learning games for trainers by Naveen Jose',
  desc: 'Ladder, Pairs and Steps: three free browser games that practise Bloom’s verbs, learning-science terms and procedures, about a minute a round.',
  moments: ['word-highlight'],
  extraCss: UI_CSS + `
#games .panel { --p-h: 300px; background: var(--p-surface); position: relative; }
.hero__media.phone { background: var(--p-surface); border-radius: var(--r-lg); position: relative; }
.hero__media.phone .app__win { width: min(100%, 340px); padding: 20px; }
@media (max-width: 639px) { #games .panel { --p-h: 240px; } }`,
}) + nav('engage', 'hero split, moment word-highlight (#why)') + `
<main id="top">
  <section class="hero hero--split" data-enter aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text grid hero__grid">
      <div class="hero__text span-5">
        <h1 id="hero-h">Learning games for trainers and teams</h1>
        <p class="hero__lead">Three free browser games: Ladder runs 60 seconds, Pairs has 12 cards and Steps has 5 puzzles. Play one at the start of a session.</p>
        <div class="btn-row"><a class="btn btn--primary" href="/engage/ladder">Try Ladder${ARROW}</a><a class="btn btn--secondary" href="#games">See the three games</a></div>
      </div>
      <div class="hero__media phone span-6 start-7">${UI.ladder}</div>
    </div></div>
  </section>

  <section class="section" id="games" style="--hm: 2" aria-labelledby="games-h">
    <div class="wrap">
      <div class="section-head">
        <h2 id="games-h">Three games, one idea each</h2>
        <p>Each one practises a single idea from a training room.</p>
      </div>
      <div class="grid">
        <a class="card card--open span-4" href="/engage/ladder"><div class="panel">${UI.ladder.replace('design', 'compare').replace('class="is-hit">Create', '>Create').replace('<span>Analyse', '<span class="is-hit">Analyse')}</div><h3>Sorts verbs onto Bloom’s rungs</h3><p class="t-small muted">60 seconds, six rungs, one streak.</p></a>
        <a class="card card--open span-4" href="/engage/pairs"><div class="panel">${UI.pairs}</div><h3>Matches a term to its meaning</h3><p class="t-small muted">12 cards of learning science.</p></a>
        <a class="card card--open span-4" href="/engage/steps"><div class="panel">${UI.steps}</div><h3>Puts a procedure back in order</h3><p class="t-small muted">Chai, a fire drill, ADDIE.</p></a>
      </div>
    </div>
  </section>

  <section class="section statement ground-surface" id="why" data-moment="word-highlight" aria-label="Why the games are short">
    <div class="wrap">
      <p class="t-label">Why they are short</p>
      <p class="mo-wh__text">A team remembers what it had to pull out of its own head. Each game asks for that once a card, so a minute of play is <strong>a minute of recall</strong>, not a minute of reading.</p>
    </div>
  </section>
</main>
` + footer({ h2: 'Email Naveen about a game', line: 'Ask for a game built on your own procedure.', img: '/about/about-sewa-1.webp', alt: 'Printed SEWA Chronicles booklet and comic pages on a white table', pos: '50% 50%' });

/* ---------------------------------- ABOUT ---------------------------------- */
const TOOLS = `<ul class="rows">
          <li><span class="rows__name">Articulate Storyline 360<small>E-learning modules and quizzes</small></span><span class="rows__value">SCORM</span></li>
          <li><span class="rows__name"><img class="ic ic-24" src="assets/icons/after-effects.svg" alt="" width="24" height="23"> After Effects and <img class="ic ic-24" src="assets/icons/photoshop.svg" alt="" width="24" height="23"> Photoshop<small>Motion and still pictures</small></span><span class="rows__value">Adobe</span></li>
          <li><span class="rows__name"><img class="ic ic-24 ic-land" src="assets/icons/vyond.svg" alt="" width="24" height="17"> Vyond and Canva<small>Animated explainers and print</small></span><span class="rows__value">Video</span></li>
          <li><span class="rows__name">Bloom’s taxonomy and andragogy<small>How each objective and session is built</small></span><span class="rows__value">Method</span></li>
        </ul>`;
const about = head({
  title: 'About Naveen Jose, instructional designer in Kerala',
  desc: 'Naveen Jose grew up on a farm in central Kerala, worked housekeeping at Club Mahindra, trained staff at Marriott, and now designs learning as Entertrainer.',
  moments: ['photo-chapters'], icons: true,
  extraCss: `#tools .frame { --p-h: 100%; } .rows .ic { display: inline-block; vertical-align: -5px; margin-right: 4px; }`,
}) + nav('about', 'hero photo, moment photo-chapters (#story)') + `
<main id="top">
  <section class="hero hero--photo" data-enter data-calm="left" aria-labelledby="hero-h">
    <img class="hero__bg" src="/about/club-mahindra-resort.jpg" alt="The pool and tiered front of Courtyard by Marriott, Mahabaleshwar, under a grey sky" style="--ly-pos: 50% 55%; --ly-pos-phone: 60% 50%" fetchpriority="high" data-source="client" data-subject="the hotel where Naveen trained staff">
    <div class="wrap"><div class="hero-text">
      <div class="hero__text">
        <h1 id="hero-h">Naveen Jose, instructional designer in Kerala</h1>
        <p class="hero__lead">I worked housekeeping at Club Mahindra, trained staff at Marriott, and now design learning as Entertrainer.</p>
        <div class="btn-row">${MAIN}<a class="btn btn--secondary" href="#story">See the work history</a></div>
      </div>
    </div></div>
  </section>

  <section class="section" id="story" data-moment="photo-chapters" aria-labelledby="story-h">
    <div class="wrap mo-ph">
      <div class="mo-ph__head"><h2 id="story-h">From housekeeping to course design</h2><p>Four places, each one taught me something I now put into training.</p></div>
      <ol class="mo-ph__list">
        <li class="mo-ph__ch">
          <figure class="mo-ph__pic"><img src="/about/about-housekeeper-1.webp" alt="Naveen sketching on a whiteboard laid on a table at the Club Mahindra resort in Coorg" width="600" height="800" style="object-position: 50% 30%"></figure>
          <h3>Club Mahindra, Coorg: housekeeping</h3>
          <p>Cleaning rooms showed me what a new joiner has to learn in the first hour, and what gets skipped.</p>
        </li>
        <li class="mo-ph__ch">
          <figure class="mo-ph__pic"><img src="/about/about-sewa-2.webp" alt="Printed SEWA comic pages spread across a round white table" width="900" height="1600" style="object-position: 50% 55%"></figure>
          <h3>The SEWA Chronicles: a comic</h3>
          <p>Service lessons told as stories, checked line by line with the staff they were about.</p>
        </li>
        <li class="mo-ph__ch">
          <figure class="mo-ph__pic"><img src="/about/about-cdt.webp" alt="Collage of the CDT Masterclass, trainers holding their certificates" width="1024" height="1280" style="object-position: 50% 30%"></figure>
          <h3>Marriott, Mahabaleshwar: learning and development</h3>
          <p>Onboarding, the CDT Masterclass for department trainers, and the Ignite events.</p>
        </li>
        <li class="mo-ph__ch">
          <figure class="mo-ph__pic"><img src="/about/naveen-speaking-close.jpg" alt="Naveen Jose speaking into a microphone during a training session" width="1400" height="1400" style="object-position: 50% 20%"></figure>
          <h3>Concentrix, then Entertrainer</h3>
          <p>Contact-centre training, and now essays, apps and games for anyone who trains people.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="section ground-surface" id="tools" aria-labelledby="tools-h">
    <div class="wrap grid grid--top">
      <div class="span-6">
        <div class="section-head">
          <h2 id="tools-h">Tools and methods</h2>
          <p>What I build with, from the storyboard to the SCORM file.</p>
        </div>
        ${TOOLS}
      </div>
      <div class="frame frame--photo frame--fill span-6 start-7">
        <img class="frame__img" src="/about/about-housekeeper-2.webp" alt="Naveen Jose seated on a sofa in a hotel lounge with plants behind him" loading="lazy" style="object-position: 50% 60%" data-source="client" data-subject="Naveen Jose">
      </div>
    </div>
  </section>
</main>
` + footer({ h2: 'Email Naveen about working together', line: 'Freelance and full-time roles in learning design.', img: '/about/about-sewa-1.webp', alt: 'Printed SEWA Chronicles booklet and comic pages on a white table', pos: '50% 50%' });

for (const [f, html] of Object.entries({ 'index.html': home, 'elevate.html': elevate, 'empower.html': empower, 'engage.html': engage, 'about.html': about })) {
  writeFileSync(new URL(f, OUT), html);
}
console.log('ok');
