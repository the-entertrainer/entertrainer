import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = {
  game: await readFile('games/fever/game.js', 'utf8'),
  battle: await readFile('games/fever/battle.js', 'utf8'),
  camera: await readFile('games/fever/camera.js', 'utf8'),
  cinematic: await readFile('games/fever/cinematic.js', 'utf8'),
  audio: await readFile('games/fever/audio.js', 'utf8'),
  art: await readFile('games/fever/art.js', 'utf8'),
  html: await readFile('public/fever/index.html', 'utf8'),
  css: await readFile('public/fever/fever.css', 'utf8'),
};

const punches = [];
const fail = (id, detail) => punches.push({ id, detail, ok: false });
const pass = (id, detail) => punches.push({ id, detail, ok: true });

if (/camBlend/.test(files.battle) || /camBlend/.test(files.camera)) fail('CAM_BLEND', 'Undeclared camBlend leftover');
else pass('CAM_BLEND', 'No undeclared camBlend');

if (/01 \/ THE DROP|02 \/ BAD OMEN|03 \/ IMPACT/.test(files.html + files.cinematic)) fail('SHOT_LABELS', 'Numbered shot cards are title-card slop');
else pass('SHOT_LABELS', 'No numbered intro shot cards');

if (/EVERY NIGHT/.test(files.html)) fail('CINEMA_COPY', 'Padded cinema manifesto still in the overlay');
else pass('CINEMA_COPY', 'Cinema copy is a single short line');

if (/Turret hired|No lunch break|SWIPE \/ FEVER/.test(files.game + files.html)) fail('SLOP_COPY', 'Joke / debug chrome still ships');
else pass('SLOP_COPY', 'No joke toast or debug combo chrome');

if (!/min-width:44px/.test(files.css) || /min-width:40px/.test(files.css)) fail('TOUCH', 'Toolbar dropped below 44px');
else pass('TOUCH', 'Toolbar stays 44px');

if (!/grout|tileWear/.test(files.art)) fail('TILES', 'Floor is still raw noise with no grout');
else pass('TILES', 'Tile materials carry grout / wear');

if (!/bandPass|whoosh/.test(files.audio)) fail('BLADE', 'Blade bank is still a raw sine sweep');
else pass('BLADE', 'Swipe bank uses filtered whoosh layers');

if (!/composeShot|easeOut/.test(files.camera)) fail('CAMERA', 'No directed ease-in/out shot grammar');
else pass('CAMERA', 'Camera director has composed shots');

if (!/playCam|gameplay camera|copy\(home\)/.test(files.camera + files.game)) fail('PICKS', 'Gameplay picks are not isolated from cutscene camera');
else pass('PICKS', 'Picks stay on the gameplay camera');

const failed = punches.filter(p => !p.ok);
for (const p of punches) console.log(`${p.ok ? 'PASS' : 'FAIL'} ${p.id} — ${p.detail}`);
assert.equal(failed.length, 0, failed.map(p => p.id + ': ' + p.detail).join('; '));
console.log('PASS: Fever Art Director punch list clear');
