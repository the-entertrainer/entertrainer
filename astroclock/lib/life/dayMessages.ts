/**
 * Day message bank keyed by ClimateLabel (+ optional stretch overlay).
 * Pick deterministically from date + climate — never Math.random on render.
 */
import type { ClimateLabel } from '@astroclock/lib/astro/insights';
import type { DayStretch } from '@astroclock/lib/astro/hourQuality';
import { hashString, utcDayKey } from './lifeFacts';

export type DayMessageCategory =
  | ClimateLabel
  | 'good'
  | 'mid'
  | 'hard';

/** Maps climate → primary message category (stretch can soft-override). */
export function categoryFromClimate(
  climate: ClimateLabel,
  stretch?: DayStretch,
): DayMessageCategory {
  // Prefer climate axes; stretch only tips peak/fluid toward good tone when set.
  if (stretch === 'good' && (climate === 'peak' || climate === 'fluid')) {
    return 'good';
  }
  if (stretch === 'hard' && (climate === 'tense' || climate === 'volatile')) {
    return 'hard';
  }
  if (stretch === 'mid' && climate === 'quiet') {
    return 'mid';
  }
  return climate;
}

const TENSE: string[] = [
  'Day feels tight. Pick one next step and do only that.',
  'If it’s stressful, shrink the goal and finish the smaller version.',
  'You don’t have to win the whole day. Just the next hour.',
  'Name what you can control. Leave the rest alone for now.',
  'Breathe once, then move. Don’t sit and spiral.',
  'Mute one noisy chat. Do the next small thing.',
  'Take a short walk. Drink water. Then come back.',
  'Say the hard thing kindly, then stop explaining.',
  'You’re allowed to do less today and still be fine.',
  'Fix one annoying thing. Ignore the pile for now.',
];

const FLUID: string[] = [
  'Things feel easier today. Finish one open thread first.',
  'Good day to close something before you start three new things.',
  'Timing’s friendly. Use it on a real send or a real ask.',
  'Talk to people, then write down what you decided.',
  'Have the chat, then note the decision so it sticks.',
  'Give yourself one finish line by evening.',
  'Ask someone for help. They’re freer than you think.',
  'Stay light, but keep the promise you already made.',
  'Ideas are flowing. Send a small version today.',
  'Say yes to the useful invite. Soft-no the shiny distraction.',
];

const PEAK: string[] = [
  'Energy’s high. Point it at one real target.',
  'You’re on. Don’t overdo it — one solid push is enough.',
  'People can see you today. Put your name on work you care about.',
  'Be warm, not loud. One clear message beats a rant.',
  'Good day to ask. Send the message in the next hour.',
  'Say one small win out loud, then move on.',
  'Use the energy on the work, not on proving a point in chat.',
  'Start before you feel ready. The rest follows.',
  'Make the call you’ve been rehearsing in your head.',
  'Drink water, eat something, and set an end time.',
];

const QUIET: string[] = [
  'Soft day. Go gentle, but do one real thing.',
  'Quiet isn’t empty. It’s space to hear yourself.',
  'Do the boring maintenance your future self needs.',
  'Rest if you need it. Stop apologising for that.',
  'One calm hour of focus beats a loud day of half-starts.',
  'Send one short, honest check-in to someone you care about.',
  'Let the inbox wait. Clear one private corner first.',
  'Keep volume low. Care about what you touch.',
  'Read, walk, or cook something simple.',
  'You don’t need a breakthrough. You need a steady next page.',
];

const VOLATILE: string[] = [
  'Things feel jumpy. Don’t reply angry. Wait a bit.',
  'Expect a wobble. Keep your values; change the steps.',
  'If plans flip, rewrite the next hour — not your whole life.',
  'Don’t text angry. Draft it, wait an hour, then decide.',
  'Stick with calm people today. Skip the drama circle.',
  'Eat, stretch, or rest first. Then make the call.',
  'You’re not the mess around you. Take one step through it.',
  'Keep a small routine when the day gets messy.',
  'Say “not now” to drama that isn’t yours.',
  'Get through this hour clean. Optimise later.',
];

const GOOD: string[] = [
  'Good stretch. Push the thing you’ve been ready for.',
  'Easier hours ahead. Book the hard conversation inside them.',
  'You’re prepared and the timing helps — use both.',
  'Do the generous thing while it’s easy.',
  'Teach someone one thing you already know.',
];

const MID: string[] = [
  'Steady day. Keep going; skip the drama.',
  'Middle gear is fine. Hold the rhythm.',
  'Not a peak, not a pit — a normal work day. Honour it.',
  'Do the boring important thing. That’s enough.',
  'Split time fairly between people and tasks.',
];

const HARD: string[] = [
  'Rough stretch. Lower the bar; keep your word.',
  'Hard hours pass. Don’t make big permanent choices right now.',
  'Ask for help sooner than pride wants.',
  'Be kind to yourself once. It still counts.',
  'Get through clean. Don’t wreck tomorrow’s options today.',
];

export const DAY_MESSAGES: Record<DayMessageCategory, string[]> = {
  tense: TENSE,
  fluid: FLUID,
  peak: PEAK,
  quiet: QUIET,
  volatile: VOLATILE,
  good: GOOD,
  mid: MID,
  hard: HARD,
};

export interface DayMessagePick {
  category: DayMessageCategory;
  text: string;
  climate: ClimateLabel;
  stretch?: DayStretch;
}

export function pickDayMessage(
  climate: ClimateLabel,
  day: Date = new Date(),
  stretch?: DayStretch,
): DayMessagePick {
  const category = categoryFromClimate(climate, stretch);
  const bank = DAY_MESSAGES[category];
  const key = `${utcDayKey(day)}|${category}|${climate}`;
  const idx = hashString(key) % bank.length;
  return {
    category,
    text: bank[idx],
    climate,
    stretch,
  };
}

/** All visitor-visible day-message lines (for PR / copy gate) */
export function allDayMessageStrings(): string[] {
  return (Object.keys(DAY_MESSAGES) as DayMessageCategory[]).flatMap(
    (k) => DAY_MESSAGES[k],
  );
}

export function dayMessageBankSize(): number {
  return allDayMessageStrings().length;
}
