// C3 Invite & earn — stand-ins for GET /me/referrals and the invite code.
// Share link / QR payload carries the invite code only (C3 dev notes).

const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/** Runs per friend who scans their 1st coupon (admin-set; CLIENT to confirm 50). */
export const RUNS_PER_INVITE = 50;

export function inviteCode(name?: string) {
  const letters = (name ?? 'Ram').replace(/[^a-z]/gi, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
  return `${letters}245`;
}

export const inviteLink = (code: string) => `https://gomax.app/i/${code}`;

export const inviteMessage = (code: string) =>
  `Join me on GoMax! Scan the coupon in every GoMax pack and get cash + gifts. Use my code ${code} when you sign up: ${inviteLink(code)}`;

export type Referrals = { count: number; runsEarned: number };

export async function referrals(isNew: boolean): Promise<Referrals> {
  await wait();
  return isNew ? { count: 0, runsEarned: 0 } : { count: 12, runsEarned: 4250 };
}
