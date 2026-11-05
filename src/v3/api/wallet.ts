// Wallet, gifts and ledger. Contract from the B2 dev notes:
//   GET /wallet → points, runs, withdraw_min · GET /ledger?type&from&to
//   GET /gifts · POST /gift-orders {gift_id, address} · GET /gift-orders
// Gift list, prices and photos are placeholders — CLIENT to share the real list.
import { d3, gifts as photos } from '../assets';

export type Gift = { id: string; name: string; runs: number; photo?: number; art?: number; inStock: boolean };

export const GIFTS: Gift[] = [
  { id: 'watch', name: 'Smart watch', runs: 60, photo: photos.watch, inStock: true },
  { id: 'tshirt', name: 'GoMax T-shirt', runs: 80, photo: photos.tshirt, inStock: true },
  { id: 'headphones', name: 'Headphones', runs: 150, photo: photos.headphones, inStock: true },
  { id: 'powerbank', name: 'Power bank', runs: 200, photo: photos.powerbank, inStock: true },
  { id: 'speaker', name: 'Bluetooth speaker', runs: 450, photo: photos.speaker, inStock: true },
  { id: 'cooker', name: 'Pressure cooker', runs: 600, photo: photos.cooker, inStock: true },
  { id: 'toolkit', name: 'Tool kit', runs: 600, art: d3.toolbox, inStock: true },
];

export const giftById = (id: string) => GIFTS.find((g) => g.id === id) ?? GIFTS[0];

export type OrderStep = 'booked' | 'packed' | 'shipped' | 'delivered';
export const ORDER_STEPS: OrderStep[] = ['booked', 'packed', 'shipped', 'delivered'];

export type GiftOrder = {
  id: string;
  giftId: string;
  runs: number;
  step: OrderStep;
  dates: Partial<Record<OrderStep, string>>;
  eta?: string;
  courier?: { name: string; awb: string; url: string };
  deliveredAt?: string;
  receivedBy?: string;
};

export type Address = { name: string; mobile: string; street: string; city: string; pin: string };

let orders: GiftOrder[] = [
  {
    id: 'G-1042',
    giftId: 'toolkit',
    runs: 600,
    step: 'shipped',
    dates: { booked: '2 Oct', packed: '3 Oct', shipped: '4 Oct' },
    eta: '9 Oct',
    courier: { name: 'DTDC', awb: '7X2938475', url: 'https://www.dtdc.in/tracking.asp' },
  },
  {
    id: 'G-2104',
    giftId: 'tshirt',
    runs: 80,
    step: 'delivered',
    dates: { booked: '12 Sep', packed: '13 Sep', shipped: '14 Sep', delivered: '18 Sep' },
    courier: { name: 'DTDC', awb: '7X2911002', url: 'https://www.dtdc.in/tracking.asp' },
    deliveredAt: '18 Sep, 5:20 pm',
    receivedBy: 'Ram',
  },
];

export async function listOrders() {
  return orders;
}

export const orderById = (id: string) => orders.find((o) => o.id === id);

export async function bookGift(giftId: string, _address: Address): Promise<GiftOrder> {
  await new Promise((r) => setTimeout(r, 500));
  const g = giftById(giftId);
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const o: GiftOrder = { id: `G-${1043 + orders.length}`, giftId, runs: g.runs, step: 'booked', dates: { booked: today } };
  orders = [o, ...orders];
  return o;
}

// ---------- ledger ----------

export type LedgerKind = 'scan' | 'withdraw' | 'bonus' | 'games' | 'invite' | 'gifts';
export type LedgerRow = {
  id: string;
  wallet: 'points' | 'runs';
  kind: LedgerKind;
  title: string;
  sub: string;
  amount: number; // + earned / − spent
  day: 'today' | 'yesterday' | 'earlier';
  icon: 'ticket' | 'landmark' | 'gift' | 'sparkles' | 'users' | 'trophy';
};

export const LEDGER: LedgerRow[] = [
  { id: 'p1', wallet: 'points', kind: 'scan', title: 'Coupon scan', sub: '4:30 pm', amount: 20, day: 'today', icon: 'ticket' },
  { id: 'p2', wallet: 'points', kind: 'scan', title: 'Coupon scan', sub: '4:28 pm', amount: 20, day: 'today', icon: 'ticket' },
  { id: 'p3', wallet: 'points', kind: 'withdraw', title: 'Withdrawn to UPI', sub: 'UTR 4290…7765', amount: -500, day: 'today', icon: 'landmark' },
  { id: 'p4', wallet: 'points', kind: 'scan', title: 'Coupon scans × 6', sub: 'All day', amount: 120, day: 'yesterday', icon: 'ticket' },
  { id: 'p5', wallet: 'points', kind: 'bonus', title: 'Bonus: first scan', sub: 'Welcome gift', amount: 25, day: 'earlier', icon: 'gift' },
  { id: 'r1', wallet: 'runs', kind: 'games', title: 'Spin the wheel', sub: '10:05 am', amount: 10, day: 'today', icon: 'sparkles' },
  { id: 'r2', wallet: 'runs', kind: 'games', title: 'Scratch card', sub: '9:00 am', amount: 20, day: 'today', icon: 'sparkles' },
  { id: 'r3', wallet: 'runs', kind: 'gifts', title: 'Gift booked: Tool kit', sub: 'Order G-1042', amount: -600, day: 'today', icon: 'gift' },
  { id: 'r4', wallet: 'runs', kind: 'invite', title: 'Suresh joined with your code', sub: 'Invite bonus', amount: 50, day: 'yesterday', icon: 'users' },
  { id: 'r5', wallet: 'runs', kind: 'games', title: 'Weekly challenge won', sub: 'Scan 20 coupons', amount: 100, day: 'yesterday', icon: 'trophy' },
];

export type DateRange = 'today' | '7d' | 'month' | 'lastMonth' | 'custom';
export const RANGE_LABEL: Record<DateRange, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  month: 'This month',
  lastMonth: 'Last month',
  custom: 'Pick dates',
};

export async function listLedger(wallet: 'points' | 'runs', range: DateRange, kind: LedgerKind | 'all', isNewUser = false) {
  if (isNewUser) return [];
  return LEDGER.filter(
    (r) =>
      r.wallet === wallet &&
      (kind === 'all' || r.kind === kind) &&
      (range === 'today' ? r.day === 'today' : range === '7d' || range === 'month' ? true : range === 'lastMonth' ? r.day === 'earlier' : true),
  );
}

export function recentPoints() {
  return LEDGER.filter((r) => r.wallet === 'points').slice(0, 3);
}
