// C3 Invite & earn. GET /me/referrals. The invite code is on the signed-in user.
// Share link / QR payload carries the invite code only (C3 dev notes).
import { api, read } from './client';

/** Runs per friend who scans their 1st coupon (admin-set; refreshed by referrals()). */
export let RUNS_PER_INVITE = 50;

export const inviteLink = (code: string) => `https://gomax.app/i/${code}`;

export const inviteMessage = (code: string) =>
  `Join me on GoMax! Scan the coupon in every GoMax pack and get cash + gifts. Use my code ${code} when you sign up: ${inviteLink(code)}`;

export type Referrals = { count: number; runsEarned: number };

export async function referrals(): Promise<Referrals> {
  return read(async () => {
    const r = await api<{ joined: number; runsEarned: number; runsPerInvite: number }>('/me/referrals');
    RUNS_PER_INVITE = r.runsPerInvite;
    return { count: r.joined, runsEarned: r.runsEarned };
  }, { count: 0, runsEarned: 0 });
}
