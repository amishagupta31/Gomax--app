import { d3 } from '../assets';
import { RankId } from '../data/ranks';
import { c } from '../theme';

// C2 Games & Challenges — local stand-ins for the endpoints in the C2 dev
// notes (17:13427). Swap the bodies for real calls; the shapes match:
//   POST /spins              → { prize }      (server decides, never client)
//   GET  /scratch-cards      → ScratchCard[]
//   POST /scratch-cards/:id/reveal → { prize }
//   GET  /challenges         → Challenge[]
//   POST /streak/photo       → { day }
//   GET  /games/history      → GameRow[]

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/** Free spins a day by rank (resets at 12 am). */
export const SPINS_BY_RANK: Record<RankId, number> = { 'naya-saathi': 3, kaarigar: 4, ustaad: 5, legend: 5 };

export type Prize = { kind: 'runs' | 'points' | 'scratch'; amount: number };

/** Index into BIG_WHEEL for each prize the server can return. */
export function segmentFor(p: Prize) {
  const idx = BIG_WHEEL_VALUES.map((v, i) => [v, i] as const).filter(([v]) => v === p.amount);
  return idx.length ? idx[Math.floor(Math.random() * idx.length)][1] : 0;
}

/** C2-01 wheel, clockwise from the pointer. */
export const BIG_WHEEL_VALUES = [10, 20, 5, 50, 10, 100, 5, 20];

/** POST /spins — most spins win 5 or 10 runs; 100 is shown but never drawn. */
export async function spin(): Promise<Prize> {
  await wait(250);
  const r = Math.random();
  const amount = r < 0.45 ? 5 : r < 0.85 ? 10 : r < 0.97 ? 20 : 50;
  return { kind: 'runs', amount };
}

/** Seconds until the next 12 am reset. */
export function secondsToMidnight(now = new Date()) {
  const m = new Date(now);
  m.setHours(24, 0, 0, 0);
  return Math.max(0, Math.round((m.getTime() - now.getTime()) / 1000));
}

export const hms = (s: number) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');

// ── Scratch cards ────────────────────────────────────────────────────────

export type ScratchCard =
  | { id: string; state: 'new'; earned: string }
  | { id: string; state: 'won'; prize: Prize; earned: string }
  | { id: string; state: 'locked'; progress: number }
  | { id: string; state: 'expired'; ended: string };

let CARDS: ScratchCard[] = [
  { id: 'sc-5', state: 'new', earned: '10 coupons today' },
  { id: 'sc-4', state: 'new', earned: '10 coupons today' },
  { id: 'sc-3', state: 'won', prize: { kind: 'runs', amount: 30 }, earned: '10 coupons · 1 Oct' },
  { id: 'sc-2', state: 'won', prize: { kind: 'points', amount: 40 }, earned: '10 coupons · 30 Sep' },
  { id: 'today', state: 'locked', progress: 6 },
  { id: 'sc-1', state: 'expired', ended: 'Ended 20 Sep' },
];

export async function listScratchCards(todayCoupons: number): Promise<ScratchCard[]> {
  await wait(120);
  return CARDS.map((card) => (card.state === 'locked' ? { ...card, progress: todayCoupons % 10 || card.progress } : card));
}

export function scratchCard(id: string) {
  return CARDS.find((x) => x.id === id);
}

/** Adds the card earned by the 10th coupon of the day (B1-04). */
export function grantScratchCard() {
  const id = `sc-${Date.now()}`;
  CARDS = [{ id, state: 'new', earned: '10 coupons today' }, ...CARDS];
  return id;
}

export function firstNewCard() {
  return CARDS.find((x) => x.state === 'new')?.id;
}

const PENDING: Record<string, Prize> = {};

/** POST /scratch-cards/:id/reveal — the prize is fixed server-side. */
export async function revealScratchCard(id: string): Promise<Prize> {
  await wait(150);
  const card = CARDS.find((x) => x.id === id);
  if (card?.state === 'won') return card.prize;
  PENDING[id] ??= { kind: 'runs', amount: [10, 20, 20, 30][Math.floor(Math.random() * 4)] };
  return PENDING[id];
}

/** Marks the card opened once the user has scratched it (or tapped open). */
export function claimScratchCard(id: string) {
  const prize = PENDING[id];
  if (!prize) return;
  CARDS = CARDS.map((x) => (x.id === id ? { id, state: 'won', prize, earned: '10 coupons · today' } : x));
}

export const scratchWon = () =>
  CARDS.reduce(
    (s, x) => (x.state === 'won' ? { ...s, [x.prize.kind]: (s[x.prize.kind as 'runs' | 'points'] ?? 0) + x.prize.amount } : s),
    { runs: 0, points: 0 } as { runs: number; points: number },
  );

// ── Challenges ───────────────────────────────────────────────────────────

export type ChallengeTone = 'runs' | 'primary' | 'warning' | 'success' | 'danger';

export const TONE: Record<ChallengeTone, { bg: string; ink: string; bar: string; track: string }> = {
  runs: { bg: c.runs50, ink: c.runs, bar: c.runs, track: c.runs50 },
  primary: { bg: c.primary100, ink: c.primary700, bar: c.primary700, track: c.primary100 },
  warning: { bg: c.warning50, ink: c.warningText, bar: c.warning, track: c.warning50 },
  success: { bg: c.success50, ink: c.successText, bar: c.success, track: c.success50 },
  danger: { bg: c.danger50, ink: c.dangerText, bar: c.danger, track: c.danger50 },
};

export type Challenge = {
  id: string;
  tag: string;
  tone: ChallengeTone;
  title: string;
  short: string;
  art: number;
  progress: number;
  goal: number;
  /** "12/20" or "Day 6/15" */
  unit?: 'day';
  reward: string;
  ends: string;
  done?: boolean;
  /** Milestone steps on the detail page (C2-10). */
  steps?: { at: number; title: string; sub: string }[];
  /** C2-10 extras: page title, ring caption, bonus line, long end time. */
  page?: string;
  ringSub?: string;
  bonus?: string;
  endsLong?: string;
  joined?: string;
};

export const CHALLENGES: Challenge[] = [
  {
    id: 'weekly', tag: 'Weekly', tone: 'runs', title: 'Scan 20 coupons this week', short: 'Scan 20 coupons', art: d3.bullseye,
    progress: 12, goal: 20, reward: '+100 runs', ends: 'Ends Sun 11:59 pm',
    page: 'Weekly challenge', ringSub: 'coupons this week', bonus: '+ “Hafte ka Hero” badge', endsLong: 'Ends Sunday 11:59 PM',
    joined: '34 applicators in Amritsar are on it',
    steps: [
      { at: 5, title: 'Scan 5 coupons', sub: 'Done Mon' },
      { at: 10, title: 'Scan 10 coupons', sub: 'Done Thu · +1 scratch card' },
      { at: 20, title: 'Scan 20 coupons', sub: '' },
    ],
  },
  {
    id: 'streak', tag: 'Daily streak', tone: 'primary', title: 'Work photo every day', short: 'Daily work photo streak', art: d3.fire,
    progress: 6, goal: 15, unit: 'day', reward: '+50 runs at 15 days', ends: 'Upload today',
  },
  {
    id: 'ultra', tag: 'Ultra coupons', tone: 'warning', title: 'Scan 5 Ultra (premium) coupons', short: 'Scan 5 Ultra coupons', art: d3.gemStone,
    progress: 2, goal: 5, reward: '+150 runs', ends: 'Ends 31 Oct',
    page: 'Ultra challenge', ringSub: 'Ultra coupons', endsLong: 'Ends 31 Oct 11:59 PM', joined: '12 applicators in Amritsar are on it',
    steps: [
      { at: 1, title: 'Scan 1 Ultra coupon', sub: 'Done 3 Oct' },
      { at: 3, title: 'Scan 3 Ultra coupons', sub: '' },
      { at: 5, title: 'Scan 5 Ultra coupons', sub: '' },
    ],
  },
  {
    id: 'invite', tag: 'Invite', tone: 'success', title: 'Invite 2 applicators who scan', short: 'Invite 2 applicators', art: d3.handshake,
    progress: 1, goal: 2, reward: '+100 runs', ends: 'No end date',
  },
  {
    id: 'diwali', tag: 'Diwali special', tone: 'danger', title: 'Scan 50 coupons before Diwali', short: 'Diwali: 50 coupons', art: d3.partyPopper,
    progress: 18, goal: 50, reward: '+300 runs + 2 scratch cards', ends: '12 days left',
    page: 'Diwali special', ringSub: 'coupons before Diwali', bonus: '+ 2 scratch cards', endsLong: '12 days left',
    joined: '58 applicators in Amritsar are on it',
    steps: [
      { at: 10, title: 'Scan 10 coupons', sub: 'Done 2 Oct' },
      { at: 25, title: 'Scan 25 coupons', sub: '+1 scratch card' },
      { at: 50, title: 'Scan 50 coupons', sub: '' },
    ],
  },
];

export const DONE_CHALLENGES: Challenge[] = [
  { id: 'd1', tag: 'Weekly', tone: 'runs', title: 'Scan 15 coupons this week', short: 'Scan 15 coupons', art: d3.bullseye, progress: 15, goal: 15, reward: '+80 runs', ends: 'Won 28 Sep', done: true },
  { id: 'd2', tag: 'Invite', tone: 'success', title: 'Invite 1 applicator who scans', short: 'Invite 1 applicator', art: d3.handshake, progress: 1, goal: 1, reward: '+50 runs', ends: 'Won 21 Sep', done: true },
  { id: 'd3', tag: 'Weekly', tone: 'runs', title: 'Scan 10 coupons this week', short: 'Scan 10 coupons', art: d3.bullseye, progress: 10, goal: 10, reward: '+50 runs', ends: 'Won 14 Sep', done: true },
];

export const challengeById = (id: string) => [...CHALLENGES, ...DONE_CHALLENGES].find((x) => x.id === id) ?? CHALLENGES[0];

export async function listChallenges() {
  await wait(120);
  return { live: CHALLENGES, done: DONE_CHALLENGES };
}

export type Quest = { id: string; title: string; art: number; reward: number; progress: number; goal: number };
export const QUESTS: Quest[] = [
  { id: 'q-scan', title: 'Scan 1 coupon', art: d3.coin, reward: 10, progress: 1, goal: 1 },
  { id: 'q-invite', title: 'Invite 1 applicator', art: d3.bustsInSilhouette, reward: 50, progress: 0, goal: 1 },
  { id: 'q-photo', title: 'Today’s work photo', art: d3.fire, reward: 5, progress: 0, goal: 1 },
];

export const BADGES = [
  { id: 'first', label: 'First scan', art: d3.firstPlaceMedal, tint: c.primary100, got: true },
  { id: 'streak7', label: '7-day streak', art: d3.fire, tint: c.warning50, got: true },
  { id: 'team5', label: '5 joined', art: d3.handshake, tint: c.primary100, got: true },
  { id: 'kaarigar', label: 'Kaarigar', art: d3.crown, tint: c.warning50, got: true },
  { id: 'ustaad', label: 'Ustaad', art: d3.gemStone, tint: c.surfaceMuted, got: false },
];

// ── Photo streak ─────────────────────────────────────────────────────────

export const STREAK_REWARDS = [
  { days: 15, reward: '+50 runs' },
  { days: 30, reward: '+120 runs' },
  { days: 45, reward: '+200 runs' },
  { days: 90, reward: '+500 runs · badge' },
  { days: 120, reward: '+800 runs · Streak Star' },
];

/** POST /streak/photo — one camera photo a day, time-stamped; checked within 24 h. */
export async function uploadStreakPhoto(_uri: string | null, day: number) {
  await wait(600);
  return { day: day + 1 };
}

// ── Games history (C2-16) ────────────────────────────────────────────────

export type GameKind = 'spin' | 'scratch' | 'challenge';
export type GameRow = { id: string; kind: GameKind; title: string; sub: string; prize: Prize; day: string };

const HISTORY: GameRow[] = [
  { id: 'g1', kind: 'spin', title: 'Spin the wheel', sub: '10:05 am', prize: { kind: 'runs', amount: 10 }, day: 'TODAY' },
  { id: 'g2', kind: 'scratch', title: 'Scratch card', sub: '9:00 am', prize: { kind: 'runs', amount: 20 }, day: 'TODAY' },
  { id: 'g3', kind: 'challenge', title: 'Weekly challenge won', sub: 'Scan 20 coupons', prize: { kind: 'runs', amount: 100 }, day: 'YESTERDAY' },
  { id: 'g4', kind: 'scratch', title: 'Scratch card', sub: '10 coupons', prize: { kind: 'runs', amount: 30 }, day: 'YESTERDAY' },
  { id: 'g5', kind: 'scratch', title: 'Scratch card', sub: '10 coupons', prize: { kind: 'points', amount: 40 }, day: '30 SEP' },
];

export async function gamesHistory(kind: GameKind | 'all') {
  await wait(120);
  return HISTORY.filter((r) => kind === 'all' || r.kind === kind);
}

export function logGame(row: Omit<GameRow, 'id' | 'day'>) {
  HISTORY.unshift({ ...row, id: `g${Date.now()}`, day: 'TODAY' });
}
