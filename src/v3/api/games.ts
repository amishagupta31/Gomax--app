import { d3 } from '../assets';
import { c } from '../theme';
import { ApiError, api, dayMonth, daysAgo, read } from './client';
import { artFor } from './art';

// C2 Games & Challenges. The server decides every prize and owns all progress:
//   POST /spins · GET /scratch-cards · POST /scratch-cards/:id/reveal
//   GET /challenges · POST /challenges/:id/claim · GET /quests
//   GET /streak · POST /uploads + POST /streak/photo · GET /games/history

export type Prize = { kind: 'runs' | 'points' | 'scratch'; amount: number };

/** C2-01 wheel, clockwise from the pointer. */
export const BIG_WHEEL_VALUES = [10, 20, 5, 50, 10, 100, 5, 20];

/** Index into BIG_WHEEL for each prize the server can return. */
export function segmentFor(p: Prize) {
  const idx = BIG_WHEEL_VALUES.map((v, i) => [v, i] as const).filter(([v]) => v === p.amount);
  return idx.length ? idx[Math.floor(Math.random() * idx.length)][1] : 0;
}

/** Throws ApiError `no_spins_left` when today's spins are used. */
export async function spin() {
  const r = await api<{ prizeRuns: number; spinsLeft: number; spinsTotal: number; runs: number }>('/spins', { method: 'POST' });
  return { prize: { kind: 'runs', amount: r.prizeRuns } as Prize, spinsLeft: r.spinsLeft, runs: r.runs };
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

type ServerCard = { id: string; state: 'new' | 'won' | 'expired'; earnedDay: string; source: string; expiresAt: string; prize: Prize | null };

let cards: ScratchCard[] = [];
let won = { runs: 0, points: 0 };

const earnedText = (x: ServerCard) => {
  const how = x.source === 'coupons' ? '10 coupons' : 'Challenge reward';
  return daysAgo(x.earnedDay) === 0 ? `${how} today` : `${how} · ${dayMonth(x.earnedDay)}`;
};

export async function listScratchCards(): Promise<ScratchCard[]> {
  return read(async () => {
    const r = await api<{ cards: ServerCard[]; today: { coupons: number; perCard: number; earned: boolean }; won: typeof won }>('/scratch-cards');
    const rows: ScratchCard[] = r.cards.map((x) =>
      x.state === 'won'
        ? { id: x.id, state: 'won', prize: x.prize!, earned: earnedText(x) }
        : x.state === 'expired'
          ? { id: x.id, state: 'expired', ended: `Ended ${dayMonth(x.expiresAt)}` }
          : { id: x.id, state: 'new', earned: earnedText(x) },
    );
    // Today's card, while it is still being earned.
    if (!r.today.earned) rows.push({ id: 'today', state: 'locked', progress: r.today.coupons });
    const order = { new: 0, locked: 1, won: 2, expired: 3 };
    cards = rows.sort((a, b) => order[a.state] - order[b.state]);
    won = r.won;
    return cards;
  }, cards);
}

export const scratchCard = (id: string) => cards.find((x) => x.id === id);

export async function firstNewCard() {
  return (await listScratchCards()).find((x) => x.state === 'new')?.id;
}

/** The server fixes the prize and adds it to the wallet. Safe to call twice. */
export async function revealScratchCard(id: string): Promise<Prize> {
  return (await api<{ prize: Prize }>(`/scratch-cards/${id}/reveal`, { method: 'POST' })).prize;
}

export const scratchWon = () => won;

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
  rewardRuns: number;
  rewardScratchCards: number;
  ends: string;
  /** Whole days left; undefined when it has no end date. */
  daysLeft?: number;
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

type ServerChallenge = {
  id: string;
  kind: string;
  tag: string;
  tone: ChallengeTone;
  title: string;
  shortTitle: string;
  art: string;
  goal: number;
  progress: number;
  rewardRuns: number;
  rewardScratchCards: number;
  bonusText: string | null;
  milestones: { at: number; title: string; sub?: string }[];
  endsAt: string | null;
  wonAt?: string;
  runsWon?: number;
  participants?: number;
};

const RING_SUB: Record<string, string> = {
  scan_count: 'coupons',
  ultra_scan_count: 'Ultra coupons',
  streak_days: 'days',
  invite_count: 'joined',
};

function toChallenge(x: ServerChallenge): Challenge {
  const runs = x.runsWon ?? x.rewardRuns;
  const cardsText = x.rewardScratchCards ? ` + ${x.rewardScratchCards} scratch card${x.rewardScratchCards > 1 ? 's' : ''}` : '';
  const end = x.endsAt ? new Date(x.endsAt) : null;
  const left = end ? Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000)) : undefined;
  const ends = x.wonAt ? `Won ${dayMonth(x.wonAt)}` : end ? `Ends ${dayMonth(x.endsAt!)}` : 'No end date';
  return {
    id: x.id,
    tag: x.tag,
    tone: x.tone,
    title: x.title,
    short: x.shortTitle,
    art: artFor(x.art),
    progress: x.progress,
    goal: x.goal,
    unit: x.kind === 'streak_days' ? 'day' : undefined,
    reward: `+${runs} runs${cardsText}`,
    rewardRuns: runs,
    rewardScratchCards: x.rewardScratchCards,
    ends,
    daysLeft: left,
    done: Boolean(x.wonAt),
    steps: x.milestones.map((m) => ({ at: m.at, title: m.title, sub: m.sub ?? '' })),
    page: `${x.tag} challenge`,
    ringSub: RING_SUB[x.kind],
    bonus: x.bonusText ?? undefined,
    endsLong: end ? `${left} day${left === 1 ? '' : 's'} left` : ends,
    joined: x.participants ? `${x.participants} applicator${x.participants > 1 ? 's are' : ' is'} on it` : undefined,
  };
}

let liveChallenges: Challenge[] = [];
let doneChallenges: Challenge[] = [];

export async function listChallenges() {
  return read(async () => {
    const r = await api<{ live: ServerChallenge[]; done: ServerChallenge[] }>('/challenges');
    liveChallenges = r.live.map(toChallenge);
    doneChallenges = r.done.map(toChallenge);
    return { live: liveChallenges, done: doneChallenges };
  }, { live: liveChallenges, done: doneChallenges });
}

const UNKNOWN_CHALLENGE: Challenge = {
  id: '', tag: '', tone: 'runs', title: '', short: '', art: d3.bullseye, progress: 0, goal: 1,
  reward: '', rewardRuns: 0, rewardScratchCards: 0, ends: '',
};

export const challengeById = (id: string) =>
  liveChallenges.find((x) => x.id === id) ?? doneChallenges.find((x) => x.id === id) ?? UNKNOWN_CHALLENGE;

/** Fresh progress and the "N applicators are on it" count for the detail page. */
export async function loadChallenge(id: string) {
  return read(async () => toChallenge(await api<ServerChallenge>(`/challenges/${encodeURIComponent(id)}`)), challengeById(id));
}

/** Adds the reward. Throws ApiError `not_complete` / `already_claimed`. */
export const claimChallenge = (id: string) =>
  api<{ runs: number; scratchCards: string[] }>(`/challenges/${encodeURIComponent(id)}/claim`, { method: 'POST' });

export type Quest = { id: string; title: string; art: number; reward: number; progress: number; goal: number };

const QUEST_ART: Record<string, number> = { scan: d3.coin, invite: d3.bustsInSilhouette, photo: d3.fire };

export async function listQuests(): Promise<Quest[]> {
  return read(async () => {
    const r = await api<{ quests: { id: string; title: string; reward: number; done: boolean }[] }>('/quests');
    return r.quests.map((q) => ({
      id: `q-${q.id}`,
      title: q.title,
      art: QUEST_ART[q.id] ?? d3.coin,
      reward: q.reward,
      progress: q.done ? 1 : 0,
      goal: 1,
    }));
  }, []);
}

/** Worked out from the account: the API has no badge list yet. */
export function badgesFor(a: { lifetimePoints: number; streakDay: number; joined: number; rankIndex: number }) {
  return [
    { id: 'first', label: 'First scan', art: d3.firstPlaceMedal, tint: c.primary100, got: a.lifetimePoints > 0 },
    { id: 'streak7', label: '7-day streak', art: d3.fire, tint: c.warning50, got: a.streakDay >= 7 },
    { id: 'team5', label: '5 joined', art: d3.handshake, tint: c.primary100, got: a.joined >= 5 },
    { id: 'kaarigar', label: 'Kaarigar', art: d3.crown, tint: c.warning50, got: a.rankIndex >= 1 },
    { id: 'ustaad', label: 'Ustaad', art: d3.gemStone, tint: c.surfaceMuted, got: a.rankIndex >= 2 },
  ];
}

// ── Photo streak ─────────────────────────────────────────────────────────

export type StreakReward = { days: number; reward: string };

/** Admin-set. Refreshed by loadStreakRewards(). */
export let STREAK_REWARDS: StreakReward[] = [
  { days: 15, reward: '+50 runs' },
  { days: 30, reward: '+120 runs' },
  { days: 45, reward: '+200 runs' },
  { days: 90, reward: '+500 runs · badge' },
  { days: 120, reward: '+800 runs · Streak Star' },
];

type StreakView = { completed: number; doneToday: boolean; rewards: { days: number; runs: number }[] };

function applyRewards(s: StreakView) {
  if (s.rewards.length) STREAK_REWARDS = s.rewards.map((r) => ({ days: r.days, reward: `+${r.runs} runs` }));
  return { day: s.completed, doneToday: s.doneToday };
}

export const loadStreakRewards = () => read(async () => applyRewards(await api<StreakView>('/streak')), null);

/**
 * One camera photo a day: gets a signed URL, uploads the file, then records
 * it. Local dev has no bucket (a `memory://` URL), so that upload is skipped.
 */
export async function uploadStreakPhoto(uri: string | null, takenAt: Date) {
  const up = await api<{ object: string; url: string; headers: Record<string, string> }>('/uploads', {
    method: 'POST',
    body: { purpose: 'streak', contentType: 'image/jpeg' },
  });
  if (!up.url.startsWith('memory://')) {
    if (!uri) throw new ApiError(400, 'no_photo', 'Could not take the photo. Try again.');
    let ok = false;
    try {
      const file = await (await fetch(uri)).blob();
      ok = (await fetch(up.url, { method: 'PUT', headers: up.headers, body: file })).ok;
    } catch {
      throw new ApiError(0, 'network', 'No internet. Check your connection and try again.');
    }
    if (!ok) throw new ApiError(500, 'upload_failed', 'Photo upload failed. Try again.');
  }
  const s = await api<StreakView>('/streak/photo', { method: 'POST', body: { object: up.object, takenAt: takenAt.toISOString() } });
  return applyRewards(s);
}

// ── Games history (C2-16) ────────────────────────────────────────────────

export type GameKind = 'spin' | 'scratch' | 'challenge';
export type GameRow = { id: string; kind: GameKind; title: string; sub: string; prize: Prize; day: string };

const dayLabel = (iso: string) => {
  const ago = daysAgo(iso);
  return ago <= 0 ? 'TODAY' : ago === 1 ? 'YESTERDAY' : dayMonth(iso).toUpperCase();
};

export async function gamesHistory(kind: GameKind | 'all', range: '7d' | 'month' | 'lastMonth' = '7d'): Promise<GameRow[]> {
  return read(async () => {
    type Row = { id: string; kind: GameKind; title: string; sub: string | null; wallet: 'runs' | 'points'; amount: number; at: string };
    const r = await api<{ rows: Row[] }>('/games/history', { query: { kind, range, limit: 100 } });
    return r.rows.map((x) => ({
      id: x.id,
      kind: x.kind,
      title: x.title,
      sub: x.sub ?? '',
      prize: { kind: x.wallet, amount: x.amount },
      day: dayLabel(x.at),
    }));
  }, []);
}
