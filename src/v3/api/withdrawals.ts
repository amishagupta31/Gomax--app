// Payouts (B3). POST /withdrawals · GET /withdrawals/{id} · GET /wallet.
import { api, dayMonthTime, read } from './client';

export type WithdrawalStatus = 'requested' | 'approved' | 'held' | 'processing' | 'paid' | 'rejected' | 'failed';

export type Withdrawal = {
  id: string;
  amount: number;
  upiId: string;
  upiName: string;
  status: WithdrawalStatus;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
  utr?: string;
  reason?: string;
};

type ServerWithdrawal = {
  id: string;
  amount: number;
  upiId: string;
  upiName: string | null;
  status: WithdrawalStatus;
  reason: string | null;
  requestedAt: string;
  approvedAt: string | null;
  paidAt: string | null;
  utr: string | null;
};

const toWithdrawal = (w: ServerWithdrawal): Withdrawal => ({
  id: w.id,
  amount: w.amount,
  upiId: w.upiId,
  upiName: w.upiName ?? '',
  status: w.status,
  requestedAt: dayMonthTime(w.requestedAt),
  approvedAt: w.approvedAt ? dayMonthTime(w.approvedAt) : undefined,
  paidAt: w.paidAt ? dayMonthTime(w.paidAt) : undefined,
  utr: w.utr ?? undefined,
  reason: w.reason ?? undefined,
});

const seen = new Map<string, Withdrawal>();
const EMPTY: Withdrawal = { id: '', amount: 0, upiId: '', upiName: '', status: 'requested', requestedAt: '' };

/** Reads a withdrawal already loaded with loadWithdrawal. */
export const withdrawalById = (id: string) => seen.get(id) ?? EMPTY;

export async function loadWithdrawal(id: string) {
  const w = toWithdrawal(await api<ServerWithdrawal>(`/withdrawals/${encodeURIComponent(id)}`));
  seen.set(w.id, w);
  return w;
}

/** Points go on hold on the server. Throws ApiError with the reason it was refused. */
export async function requestWithdrawal(amount: number, upiId: string) {
  const w = toWithdrawal(await api<ServerWithdrawal>('/withdrawals', { method: 'POST', body: { amount, upiId } }));
  seen.set(w.id, w);
  return w;
}

export type WithdrawLimits = { minPoints: number; maxPerRequest: number; maxPerMonth: number };

export async function withdrawLimits(): Promise<WithdrawLimits | null> {
  return read(async () => (await api<{ withdraw: WithdrawLimits }>('/wallet')).withdraw, null);
}

type Nav = { navigate: (...args: never[]) => void };

/** Opens the right screen for a withdraw row in the history (its sub is "W-12"). */
export async function openWithdrawal(nav: Nav, sub: string) {
  const id = sub.match(/W-\d+/)?.[0];
  if (!id) return;
  const w = await read(() => loadWithdrawal(id), null);
  if (!w) return;
  const go = nav.navigate as (route: string, params: object) => void;
  if (w.status === 'paid') go('WithdrawPaid', { id });
  else if (w.status === 'rejected' || w.status === 'failed') go('WithdrawRejected', { id });
  else go('WithdrawDone', { amount: w.amount });
}
