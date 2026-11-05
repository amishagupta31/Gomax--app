// Coupon redemption + scan history (B1). POST /coupons/redeem · GET /me/scans.
// Points per coupon are set by GoMax admin — never hard-code them in UI.
// With no internet the code waits on the phone and is sent on the next refresh,
// with the time it was scanned (the server takes offline scans up to 7 days old).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getDeviceId, isNetworkError, read } from './client';

export type ScanSource = 'scan' | 'typed' | 'offline';
export type ScanStatus = 'added' | 'waiting' | 'failed';

export type ScanRow = {
  id: string;
  code: string;
  at: number; // epoch ms
  source: ScanSource;
  value: number;
  status: ScanStatus;
  reason?: string;
};

export type RedeemResult =
  | {
      kind: 'added';
      value: number;
      bonus: number;
      balance: { points: number; runs: number };
      today: { count: number; points: number; perCard: number };
      reward: { kind: 'scratch'; scratchCardId: string } | { kind: 'gift'; gift: { id: string; name: string } } | null;
    }
  | { kind: 'used'; usedAt: number }
  | { kind: 'invalid'; reason?: string }
  | { kind: 'offline'; value: number };

type RedeemResponse =
  | (Extract<RedeemResult, { kind: 'added' }> & { rankUp: string | null })
  | { kind: 'used'; reason: string; usedAt: string | null; byYou: boolean }
  | { kind: 'invalid' | 'expired' | 'not_active' | 'blocked'; reason: string };

const DAY = 24 * 60 * 60 * 1000;

/** The server keeps the bare 8 characters; coupons print as GMX-XXXX-XXXX. */
export const normalizeCode = (raw: string) => {
  const s = raw.trim().toUpperCase().replace(/^.*(?:[?&]C(?:ODE)?=|\/C\/)/, '');
  const d = s.replace(/[^A-Z0-9]/g, '');
  const body = d.length === 11 && d.startsWith('GMX') ? d.slice(3) : d;
  return body.length === 8 ? `GMX-${body.slice(0, 4)}-${body.slice(4)}` : s;
};

const send = async (code: string, source: ScanSource, scannedAt?: string) =>
  api<RedeemResponse>('/coupons/redeem', {
    method: 'POST',
    body: { code, source, scannedAt, deviceId: await getDeviceId() },
  });

// ── Offline queue ───────────────────────────────────────────────────────

const QUEUE_KEY = 'gomax.offlineScans';
type Queued = { code: string; at: number };

async function readQueue(): Promise<Queued[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? (JSON.parse(raw) as Queued[]) : [];
}
const writeQueue = (q: Queued[]) => AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q));

export const clearOfflineScans = () => AsyncStorage.removeItem(QUEUE_KEY);

/** Sends waiting scans, oldest first. Stops at the first network failure. */
let flushing = false;
export async function flushOfflineScans() {
  if (flushing) return;
  flushing = true;
  try {
    const queue = await readQueue();
    while (queue.length) {
      try {
        await send(queue[0].code, 'offline', new Date(queue[0].at).toISOString());
      } catch (e) {
        if (isNetworkError(e)) break;
        // Any other refusal is final (e.g. older than 7 days): drop it.
      }
      queue.shift();
      await writeQueue(queue);
    }
  } finally {
    flushing = false;
  }
}

// ── Calls ───────────────────────────────────────────────────────────────

export async function redeemCoupon(raw: string, source: ScanSource): Promise<RedeemResult> {
  let r: RedeemResponse;
  try {
    r = await send(raw, source);
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    await writeQueue([...(await readQueue()), { code: raw, at: Date.now() }]);
    return { kind: 'offline', value: 0 };
  }
  if (r.kind === 'added') return r;
  if (r.kind === 'used') return { kind: 'used', usedAt: r.usedAt ? new Date(r.usedAt).getTime() : Date.now() };
  return { kind: 'invalid', reason: r.kind === 'invalid' ? undefined : r.reason };
}

export async function listScans(range: 'today' | 'week' | 'month', status: 'all' | ScanStatus): Promise<ScanRow[]> {
  const waiting: ScanRow[] =
    status === 'all' || status === 'waiting'
      ? (await readQueue()).map((q) => ({
          id: `q${q.at}`,
          code: normalizeCode(q.code),
          at: q.at,
          source: 'offline',
          value: 0,
          status: 'waiting',
          reason: 'No internet',
        }))
      : [];
  if (status === 'waiting') return waiting;
  type Row = Omit<ScanRow, 'at'> & { at: string };
  const res = await read(() => api<{ rows: Row[] }>('/me/scans', { query: { range, status, limit: 200 } }), { rows: [] as Row[] });
  const rows = res.rows.map((r) => ({ ...r, at: new Date(r.at).getTime(), code: normalizeCode(r.code) }));
  return [...waiting, ...rows].sort((a, b) => b.at - a.at);
}

export const last4 = (code: string) => `…${code.replace(/[^A-Z0-9]/gi, '').slice(-4)}`;

export function fmtTime(ms: number) {
  return new Date(ms).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
}

export function fmtDayTime(ms: number) {
  const d = new Date(ms);
  const t0 = new Date();
  t0.setHours(0, 0, 0, 0);
  if (ms >= t0.getTime()) return `Today, ${fmtTime(ms)}`;
  if (ms >= t0.getTime() - DAY) return `Yesterday, ${fmtTime(ms)}`;
  if (ms >= t0.getTime() - 6 * DAY) return `${d.toLocaleDateString('en-IN', { weekday: 'short' })}, ${fmtTime(ms)}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${fmtTime(ms)}`;
}
