// Payouts. Contract from the B3 dev notes:
//   POST /withdrawals {amount, upi_id | upi_qr_image} → status Requested
//   GET  /withdrawals/{id} → status, UTR, proof url, reason
// Payouts are manual (UPI / QR) by GoMax finance in 24–48 hrs.

export type WithdrawalStatus = 'requested' | 'approved' | 'paid' | 'rejected';

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

let rows: Withdrawal[] = [
  {
    id: 'W-3001',
    amount: 1000,
    upiId: 'ram@ybl',
    upiName: 'RAM KUMAR',
    status: 'paid',
    requestedAt: '2 Oct, 11:20 am',
    approvedAt: '2 Oct, 5:10 pm',
    paidAt: '3 Oct, 6:42 pm',
    utr: '4271 8836 5520',
  },
  {
    id: 'W-2990',
    amount: 1000,
    upiId: 'ram@ybl',
    upiName: 'RAM KUMR',
    status: 'rejected',
    requestedAt: '28 Sep, 9:05 am',
    reason: 'UPI name does not match your PAN name.',
  },
];

export const withdrawalById = (id: string) => rows.find((r) => r.id === id) ?? rows[0];

export async function requestWithdrawal(amount: number, upiId: string, upiName: string) {
  await new Promise((r) => setTimeout(r, 500));
  const now = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
  const w: Withdrawal = { id: `W-${3002 + rows.length}`, amount, upiId, upiName, status: 'requested', requestedAt: now };
  rows = [w, ...rows];
  return w;
}
