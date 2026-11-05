// GET /me + GET /home → the Store's user and account. PATCH /me for settings.
import { api } from './client';
import type { Account, User } from '../state/Store';

type Me = { name: string; mobile: string; inviteCode: string; city: string | null; language: 'hi' | 'en' | 'pa'; whatsappOptIn: boolean };

type Home = {
  points: number;
  runs: number;
  lifetimePoints: number;
  today: { coupons: number };
  spins: { total: number; left: number };
  streak: { completed: number; doneToday: boolean };
  scratchCardsReady: number;
  kyc: { pan: { masked: string; name: string } | null; upi: { id: string; name: string } | null };
  withdraw: { minPoints: number };
  firstCouponDone: boolean;
  activeChallenge: { title: string; progress: number; goal: number; rewardRuns: number } | null;
};

/** The server-owned part of Account. appOpens and first-time flags stay on the phone. */
export async function fetchAccount() {
  const [me, home] = await Promise.all([api<Me>('/me'), api<Home>('/home')]);
  const user: User = { name: me.name, mobile: me.mobile, inviteCode: me.inviteCode, city: me.city };
  const account: Partial<Account> = {
    points: home.points,
    runs: home.runs,
    lifetimePoints: home.lifetimePoints,
    todayCoupons: home.today.coupons,
    spinsLeft: home.spins.left,
    spinsTotal: home.spins.total,
    streakDay: home.streak.completed,
    streakDoneToday: home.streak.doneToday,
    language: me.language,
    whatsappUpdates: me.whatsappOptIn,
    pan: home.kyc.pan ?? undefined,
    upi: home.kyc.upi ? { id: home.kyc.upi.id, name: home.kyc.upi.name } : undefined,
    firstCouponCelebrated: home.firstCouponDone,
    activeChallenge: home.activeChallenge
      ? {
          title: home.activeChallenge.title,
          progress: home.activeChallenge.progress,
          goal: home.activeChallenge.goal,
          prize: home.activeChallenge.rewardRuns,
        }
      : undefined,
    scratchCardsReady: home.scratchCardsReady,
  };
  return { user, account, withdrawMin: home.withdraw.minPoints, firstCouponDone: home.firstCouponDone };
}

export const saveSettings = (p: { language?: 'hi' | 'en' | 'pa'; whatsappOptIn?: boolean }) =>
  api<{ ok: true }>('/me', { method: 'PATCH', body: p });
