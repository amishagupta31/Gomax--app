// Coupon redemption + scan history. Contract from the B1 dev notes:
//   POST /coupons/redeem {code, source: scan|typed, gps, device_id}
//        → value, new balance, today count, reward unlocked
//   GET  /me/scans?from&to&status → grouped by day
// Points per coupon are set by GoMax admin — never hard-code them in UI.

export type ScanSource = 'scan' | 'typed';
export type ScanStatus = 'added' | 'waiting' | 'failed';

export type ScanRow = {
  id: string;
  code: string;
  at: number; // epoch ms
  source: ScanSource;
  value: number;
  status: ScanStatus;
  reason?: 'Already used' | 'Not a GoMax coupon' | 'No internet';
};

export type RedeemResult =
  | { kind: 'added'; value: number }
  | { kind: 'used'; usedAt: number }
  | { kind: 'invalid' }
  | { kind: 'offline'; value: number };

const DAY = 24 * 60 * 60 * 1000;
const today = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
};

let rows: ScanRow[] = [
  { id: '1', code: 'GMX-4821-7730', at: today(16, 30), source: 'scan', value: 20, status: 'added' },
  { id: '2', code: 'GMX-3310-1188', at: today(16, 28), source: 'typed', value: 20, status: 'added' },
  { id: '3', code: 'GMX-7712-5521', at: today(14, 10), source: 'scan', value: 10, status: 'waiting', reason: 'No internet' },
  { id: '4', code: 'GMX-2290-0932', at: today(13, 5), source: 'scan', value: 0, status: 'failed', reason: 'Already used' },
  { id: '5', code: 'GMX-6604-4410', at: today(11, 40), source: 'typed', value: 20, status: 'added' },
  { id: '6', code: 'XYZ-0000-8807', at: today(18, 15) - 4 * DAY, source: 'scan', value: 0, status: 'failed', reason: 'Not a GoMax coupon' },
];

const used = new Set(rows.filter((r) => r.status === 'added').map((r) => r.code));

export const normalizeCode = (raw: string) => {
  const s = raw.trim().toUpperCase().replace(/^.*[?&/]c(?:ode)?=/i, '');
  const d = s.replace(/[^A-Z0-9]/g, '');
  return d.length === 11 && d.startsWith('GMX') ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : s;
};

export async function redeemCoupon(raw: string, source: ScanSource, opts?: { offline?: boolean }): Promise<RedeemResult> {
  await new Promise((r) => setTimeout(r, 450));
  const code = normalizeCode(raw);
  const push = (r: Omit<ScanRow, 'id' | 'at' | 'code' | 'source'>) =>
    (rows = [{ id: String(Date.now()), code, at: Date.now(), source, ...r }, ...rows]);

  if (opts?.offline) {
    push({ value: 10, status: 'waiting', reason: 'No internet' });
    return { kind: 'offline', value: 10 };
  }
  if (!/^GMX-\d{4}-\d{4}$/.test(code)) {
    push({ value: 0, status: 'failed', reason: 'Not a GoMax coupon' });
    return { kind: 'invalid' };
  }
  if (used.has(code)) {
    const prev = rows.find((r) => r.code === code && r.status === 'added');
    push({ value: 0, status: 'failed', reason: 'Already used' });
    return { kind: 'used', usedAt: prev?.at ?? Date.now() - 3 * DAY };
  }
  used.add(code);
  const value = Number(code.slice(-1)) % 2 === 0 ? 20 : 10; // demo: batch value from admin
  push({ value, status: 'added' });
  return { kind: 'added', value };
}

export async function listScans(range: 'today' | 'week' | 'month', status: 'all' | ScanStatus) {
  const now = Date.now();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const from = range === 'today' ? start.getTime() : now - (range === 'week' ? 7 : 30) * DAY;
  return rows.filter((r) => r.at >= from && (status === 'all' || r.status === status)).sort((a, b) => b.at - a.at);
}

export const last4 = (code: string) => `…${code.replace(/\D/g, '').slice(-4)}`;

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
