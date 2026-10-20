/**
 * AstroClock accuracy audit.
 *   npx tsx scripts/astroclock-audit/verify.ts
 * Compares the legacy (main@b398966) math and the current lib against
 *   - JPL Horizons apparent geocentric ecliptic-of-date longitudes (cached in horizons-cache.json)
 *   - an independent horizon-scan Ascendant (altitude root of the rising ecliptic point)
 *   - Drik Panchang published values for Kochi, 20 Oct 2026 (Lahiri ayanamsha, panchanga).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as A from 'astronomy-engine';
import * as OLD_M from './legacy/math';
import * as OLD_P from './legacy/planets';
import * as NEW from '../../astroclock/lib/astro/index';
import { computeKarana, computeYoga, weekdayFromDate } from '../../astroclock/lib/astro/rules/moment';

const here = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(here, 'horizons-cache.json');

const full = A.SearchMoonPhase(180, A.MakeTime(new Date('2026-10-20T00:00:00Z')), 30)!.date;
const equinox = A.Seasons(2026).mar_equinox.date;
const solstice = A.Seasons(2026).jun_solstice.date;
const NOW = new Date('2026-10-20T08:41:00Z'); // 14:11 IST

const CASES = [
  { id: 'kochi-now', label: 'Kochi, 20 Oct 2026 14:11 IST', date: NOW, lat: 9.9312, lon: 76.2673 },
  { id: 'delhi-now', label: 'Delhi, 20 Oct 2026 14:11 IST', date: NOW, lat: 28.6139, lon: 77.209 },
  { id: 'equinox', label: 'Delhi, March equinox 2026', date: equinox, lat: 28.6139, lon: 77.209 },
  { id: 'solstice', label: 'Kochi, June solstice 2026', date: solstice, lat: 9.9312, lon: 76.2673 },
  { id: 'fullmoon', label: 'Delhi, full moon Oct 2026', date: full, lat: 28.6139, lon: 77.209 },
  { id: 'tromso', label: 'Tromsø 69.6°N, 20 Oct 2026 08:41 UTC', date: NOW, lat: 69.6492, lon: 18.9553 },
];

const BODIES: [NEW.GrahaId, string][] = [
  ['Sun', '10'], ['Moon', '301'], ['Mercury', '199'], ['Venus', '299'],
  ['Mars', '499'], ['Jupiter', '599'], ['Saturn', '699'],
];

const jdOf = (d: Date) => d.getTime() / 86400000 + 2440587.5;

async function horizons(cmd: string, jd: number): Promise<number> {
  const url =
    'https://ssd.jpl.nasa.gov/api/horizons.api?format=json&MAKE_EPHEM=YES&OBJ_DATA=NO' +
    `&COMMAND='${cmd}'&CENTER='500@399'&EPHEM_TYPE=OBSERVER&TLIST='${jd}'&TLIST_TYPE=JD&TIME_TYPE=UT&QUANTITIES='31'`;
  const r = (await (await fetch(url)).json()) as { result: string };
  const m = r.result.split('$$SOE')[1].trim().split(/\s+/);
  return Number(m[2]);
}

function scanAscendant(jd: number, lat: number, lon: number): number {
  const eps = NEW.obliquity(jd) * NEW.DEG;
  const lstDeg = NEW.lst(jd, lon) * 15;
  const phi = lat * NEW.DEG;
  const alt = (lam: number) => {
    const l = lam * NEW.DEG;
    const ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l));
    const dec = Math.asin(Math.sin(eps) * Math.sin(l));
    const H = (lstDeg * NEW.DEG) - ra;
    return {
      alt: Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H),
      east: Math.sin(H) < 0,
    };
  };
  let best = 0;
  let bestV = Infinity;
  // ecliptic meets the horizon at two points; the eastern one is the Ascendant
  for (let i = 0; i < 360 * 1000; i++) {
    const lam = i / 1000;
    const a = alt(lam);
    if (a.east && Math.abs(a.alt) < bestV) {
      bestV = Math.abs(a.alt);
      best = lam;
    }
  }
  return best;
}

const fmt = (x: number) => (Math.abs(x) >= 10 ? x.toFixed(1) : Math.abs(x) >= 0.1 ? x.toFixed(2) : x.toFixed(3));
const d = (a: number, b: number) => OLD_M.shortestArc(a, b);

async function main() {
  const cache: Record<string, number> = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
  const rows: string[] = [];
  const signRows: string[] = [];
  let worstOld = 0;
  let worstNew = 0;
  rows.push('| Case | Value | Reference | Before (error) | After (error) |');
  rows.push('|---|---|---|---|---|');
  for (const c of CASES) {
    const jd = jdOf(c.date);
    const oldPl = OLD_P.computePlanets(jd);
    const newPl = NEW.computePlanets(jd);
    for (const [g, cmd] of BODIES) {
      const key = `${cmd}@${jd.toFixed(6)}`;
      if (cache[key] === undefined) cache[key] = await horizons(cmd, jd);
      const ref = cache[key];
      const eo = d(oldPl[g].tropical, ref);
      const en = d(newPl[g].tropical, ref);
      worstOld = Math.max(worstOld, Math.abs(eo));
      worstNew = Math.max(worstNew, Math.abs(en));
      rows.push(`| ${c.label} | ${g} longitude | ${ref.toFixed(3)}° (JPL) | ${oldPl[g].tropical.toFixed(3)}° (${fmt(eo)}°) | ${newPl[g].tropical.toFixed(3)}° (${fmt(en)}°) |`);
      const refSid = OLD_M.norm360(ref - NEW.lahiriAyanamsha(jd));
      const sOld = OLD_P.rashiName(oldPl[g].sidereal);
      const sNew = NEW.rashiName(newPl[g].sidereal);
      const sRef = NEW.rashiName(refSid);
      const nOld = OLD_P.nakshatraInfo(oldPl[g].sidereal).name;
      const nNew = NEW.nakshatraInfo(newPl[g].sidereal).name;
      const nRef = NEW.nakshatraInfo(refSid).name;
      signRows.push(`| ${c.id} | ${g} | ${sRef} / ${nRef} | ${sOld === sRef ? 'ok' : sOld} / ${nOld === nRef ? 'ok' : nOld} | ${sNew === sRef ? 'ok' : sNew} / ${nNew === nRef ? 'ok' : nNew} |`);
    }
    const refAsc = scanAscendant(jd, c.lat, c.lon);
    const oldAsc = OLD_M.ascendant(OLD_M.lst(jd, c.lon), c.lat, jd).tropical;
    const newAsc = NEW.ascendant(NEW.lst(jd, c.lon), c.lat, jd).tropical;
    rows.push(`| ${c.label} | Lagna (ascendant) | ${refAsc.toFixed(2)}° (horizon scan) | ${oldAsc.toFixed(2)}° (${fmt(d(oldAsc, refAsc))}°) | ${newAsc.toFixed(2)}° (${fmt(d(newAsc, refAsc))}°) |`);
    const refLagna = NEW.rashiName(OLD_M.norm360(refAsc - NEW.lahiriAyanamsha(jd)));
    signRows.push(`| ${c.id} | Lagna | ${refLagna} | ${OLD_P.rashiName(OLD_M.ascendant(OLD_M.lst(jd, c.lon), c.lat, jd).sidereal) === refLagna ? 'ok' : OLD_P.rashiName(OLD_M.ascendant(OLD_M.lst(jd, c.lon), c.lat, jd).sidereal)} | ${NEW.rashiName(NEW.ascendant(NEW.lst(jd, c.lon), c.lat, jd).sidereal) === refLagna ? 'ok' : NEW.rashiName(NEW.ascendant(NEW.lst(jd, c.lon), c.lat, jd).sidereal)} |`);
    // retrograde flags
    const so = OLD_P.computeSpeeds(jd);
    const sn = NEW.computeSpeeds(jd);
    const retroRef = BODIES.filter(([g]) => g !== 'Sun' && g !== 'Moon').filter(([, cmd]) => {
      const t = A.MakeTime(c.date);
      const body = ({ '199': A.Body.Mercury, '299': A.Body.Venus, '499': A.Body.Mars, '599': A.Body.Jupiter, '699': A.Body.Saturn } as Record<string, A.Body>)[cmd];
      const l0 = A.Ecliptic(A.GeoVector(body, t, true)).elon;
      const l1 = A.Ecliptic(A.GeoVector(body, t.AddDays(1), true)).elon;
      return d(l1, l0) < 0;
    }).map(([g]) => g);
    const fl = (s: NEW.SpeedMap) => (['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as NEW.GrahaId[]).filter((g) => s[g] < -0.01);
    signRows.push(`| ${c.id} | Retrograde | ${retroRef.join(', ') || 'none'} | ${fl(so).join(', ') || 'none'} | ${fl(sn).join(', ') || 'none'} |`);
  }
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));

  // Drik Panchang, Kochi, 20 Oct 2026 14:11 IST
  const jd = jdOf(NOW);
  const drikJd = jdOf(new Date('2026-10-20T00:44:00Z')); // Kochi sunrise 06:14 IST
  const oldA = OLD_M.lahiriAyanamsha(drikJd);
  const newA = NEW.lahiriAyanamsha(drikJd);
  const panch = (pl: NEW.PlanetMap, lagSid: number, weekday: string) => ({
    tithi: NEW.computeTithi(pl.Moon.sidereal, pl.Sun.sidereal).name,
    nak: NEW.nakshatraInfo(pl.Moon.sidereal).name,
    yoga: computeYoga(pl.Sun.sidereal, pl.Moon.sidereal).name,
    karana: computeKarana(pl.Moon.sidereal, pl.Sun.sidereal).name,
    moon: NEW.rashiName(pl.Moon.sidereal),
    sun: NEW.rashiName(pl.Sun.sidereal),
    lagna: NEW.rashiName(lagSid),
    weekday,
  });
  const oldPl = OLD_P.computePlanets(jd);
  const newPl = NEW.computePlanets(jd);
  const nowIstMidnight = new Date('2026-10-20T20:00:00Z'); // 01:30 IST Wed
  const oldP = panch(oldPl, OLD_M.ascendant(OLD_M.lst(jd, 76.2673), 9.9312, jd).sidereal, 'Tuesday');
  const newP = panch(newPl, NEW.ascendant(NEW.lst(jd, 76.2673), 9.9312, jd).sidereal, 'Tuesday');
  const drik = { tithi: 'Dashami', nak: 'Shravana', yoga: 'Shula', karana: 'Taitila', moon: 'Makara', sun: 'Tula', lagna: 'Makara', weekday: 'Tuesday' };
  const out: string[] = [];
  out.push('\n## Drik Panchang check — Kochi 20 Oct 2026 14:11 IST\n');
  out.push('| Value | Drik Panchang | Before | After |');
  out.push('|---|---|---|---|');
  out.push(`| Lahiri ayanamsha (sunrise) | 24.238202° | ${oldA.toFixed(6)}° (${fmt(oldA - 24.238202)}°) | ${newA.toFixed(6)}° (${fmt(newA - 24.238202)}°) |`);
  for (const k of Object.keys(drik) as (keyof typeof drik)[]) {
    out.push(`| ${k} | ${drik[k]} | ${oldP[k]}${oldP[k] === drik[k] ? '' : ' ✗'} | ${newP[k]}${newP[k] === drik[k] ? '' : ' ✗'} |`);
  }
  // weekday at 01:30 IST Wednesday
  const oldWd = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nowIstMidnight.getUTCDay()];
  out.push(`| weekday at 01:30 IST Wed 21 Oct | Wednesday (civil) | ${oldWd}${oldWd === 'Wednesday' ? '' : ' ✗'} | ${weekdayFromDate(nowIstMidnight, 'Asia/Kolkata')} |`);

  // Birth-time handling: 1990-01-01 12:00 IST, Delhi
  const b = { date: '1990-01-01', h: 12, m: 0, s: 0, tz: 'Asia/Kolkata' };
  const oldBirth = new Date(Date.UTC(1990, 0, 1, 12, 0, 0));
  const newBirth = NEW.birthInstant(b);
  const refBirth = new Date('1990-01-01T06:30:00Z');
  const bj = (x: Date) => jdOf(x);
  const lag = (x: Date, mod: typeof NEW | typeof OLD_M) => NEW.rashiName(mod.ascendant(mod.lst(bj(x), 77.209), 28.6139, bj(x)).sidereal);
  out.push('\n## Birth-time handling — born Delhi 1 Jan 1990 12:00 IST\n');
  out.push('| Value | Reference | Before | After |');
  out.push('|---|---|---|---|');
  out.push(`| UTC instant used | ${refBirth.toISOString()} | ${oldBirth.toISOString()} (+5.5 h) | ${newBirth.toISOString()} |`);
  out.push(`| Lagna | ${lag(refBirth, NEW)} | ${lag(oldBirth, OLD_M)} | ${lag(newBirth, NEW)} |`);
  out.push(`| Moon | ${NEW.nakshatraInfo(NEW.computePlanets(bj(refBirth)).Moon.sidereal).name} | ${OLD_P.nakshatraInfo(OLD_P.computePlanets(bj(oldBirth)).Moon.sidereal).name} | ${NEW.nakshatraInfo(NEW.computePlanets(bj(newBirth)).Moon.sidereal).name} |`);
  out.push(`| Vimshottari now (maha/antar) | ${(() => { const v = NEW.vimshottari(refBirth, NOW); return v.maha + '/' + v.antar; })()} | (legacy: Moon from ${oldBirth.toISOString()}) | ${(() => { const v = NEW.vimshottari(newBirth, NOW); return v.maha + '/' + v.antar; })()} |`);

  const report = [
    '# AstroClock accuracy audit (generated by verify.ts)\n',
    `Worst planet longitude error — before: ${worstOld.toFixed(2)}°, after: ${worstNew.toFixed(4)}°\n`,
    '## Tropical longitudes vs JPL Horizons, Lagna vs horizon scan\n',
    ...rows,
    '\n## Sidereal sign / nakshatra (Lahiri) and retrograde flags\n',
    '| Case | Body | Reference | Before | After |',
    '|---|---|---|---|---|',
    ...signRows,
    ...out,
  ].join('\n');
  fs.writeFileSync(path.join(here, 'REPORT.md'), report + '\n');
  console.log(report);
  if (worstNew > 0.05) {
    console.error('FAIL: after-error exceeds 0.05°');
    process.exit(1);
  }
}
main();
