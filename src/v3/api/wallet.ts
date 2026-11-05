// Wallet, gifts and ledger (B2, B4). GET /gifts · POST /gift-orders ·
// GET /gift-orders · GET /ledger. Runs prices and stock come from the server.
import type { ImageSourcePropType } from 'react-native';
import { d3, gifts as photos } from '../assets';
import { api, dayMonth, daysAgo, read } from './client';

export type Gift = {
  id: string;
  name: string;
  runs: number;
  photo?: ImageSourcePropType;
  art?: number;
  inStock: boolean;
  sizes?: string[];
};

/** Pictures bundled with the app, used until admin uploads a photo for that gift. */
const LOCAL_ART: Record<string, Pick<Gift, 'photo' | 'art'>> = {
  watch: { photo: photos.watch },
  tshirt: { photo: photos.tshirt },
  headphones: { photo: photos.headphones },
  powerbank: { photo: photos.powerbank },
  speaker: { photo: photos.speaker },
  cooker: { photo: photos.cooker },
  toolkit: { art: d3.toolbox },
};

type ServerGift = { id: string; name: string; runs: number; inStock: boolean; photos: string[]; sizes: string[] };

const toGift = (g: ServerGift): Gift => {
  const url = g.photos.find((p) => p.startsWith('http'));
  return {
    id: g.id,
    name: g.name,
    runs: g.runs,
    inStock: g.inStock,
    sizes: g.sizes,
    ...(url ? { photo: { uri: url } } : (LOCAL_ART[g.id] ?? { art: d3.wrappedGift })),
  };
};

let gifts: Gift[] = [];

/** Latest list read from the server. Load it with listGifts(). */
export const cachedGifts = () => gifts;

export async function listGifts() {
  gifts = await read(async () => (await api<{ gifts: ServerGift[] }>('/gifts')).gifts.map(toGift), gifts);
  return gifts;
}

const UNKNOWN_GIFT: Gift = { id: '', name: 'Gift', runs: 0, inStock: false, art: d3.wrappedGift };
export const giftById = (id: string) => gifts.find((g) => g.id === id) ?? UNKNOWN_GIFT;

export type OrderStep = 'booked' | 'packed' | 'shipped' | 'delivered';
export const ORDER_STEPS: OrderStep[] = ['booked', 'packed', 'shipped', 'delivered'];

export type GiftOrder = {
  id: string;
  giftId: string;
  giftName: string;
  runs: number;
  step: OrderStep | 'cancelled';
  dates: Partial<Record<OrderStep, string>>;
  eta?: string;
  courier?: { name: string; awb: string; url: string };
  receivedBy?: string;
  deliveryPhotoUrl?: string;
};

export type Address = { name: string; mobile: string; street: string; city: string; pin: string };

type ServerOrder = Omit<GiftOrder, 'dates' | 'eta' | 'courier' | 'receivedBy' | 'deliveryPhotoUrl'> & {
  dates: Record<OrderStep, string | null>;
  eta: string | null;
  courier: { name: string; awb: string; url: string } | null;
  receivedBy: string | null;
  deliveryPhotoUrl: string | null;
};

const toOrder = (o: ServerOrder): GiftOrder => {
  const dates: GiftOrder['dates'] = {};
  for (const s of ORDER_STEPS) {
    const iso = o.dates[s];
    if (iso) dates[s] = dayMonth(iso);
  }
  return {
    ...o,
    dates,
    eta: o.eta ?? undefined,
    courier: o.courier ?? undefined,
    receivedBy: o.receivedBy ?? undefined,
    deliveryPhotoUrl: o.deliveryPhotoUrl ?? undefined,
  };
};

let orders: GiftOrder[] = [];

export async function listOrders() {
  orders = await read(async () => (await api<{ orders: ServerOrder[] }>('/gift-orders')).orders.map(toOrder), orders);
  return orders;
}

export const orderById = (id: string) => orders.find((o) => o.id === id);

/** Takes the runs on the server. Throws ApiError (out of stock, not enough runs…). */
export async function bookGift(giftId: string, address: Address, size?: string): Promise<GiftOrder> {
  const o = toOrder(
    await api<ServerOrder>('/gift-orders', {
      method: 'POST',
      body: { giftId, size, address: { ...address, mobile: address.mobile.replace(/\D/g, '') } },
    }),
  );
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

export type DateRange = 'today' | '7d' | 'month' | 'lastMonth' | 'custom';
export const RANGE_LABEL: Record<DateRange, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  month: 'This month',
  lastMonth: 'Last month',
  custom: 'Pick dates',
};

const LEDGER_ICON: Record<LedgerKind, LedgerRow['icon']> = {
  scan: 'ticket',
  withdraw: 'landmark',
  bonus: 'gift',
  games: 'sparkles',
  invite: 'users',
  gifts: 'gift',
};

type ServerLedgerRow = { id: string; wallet: 'points' | 'runs'; kind: LedgerKind; title: string; sub: string | null; amount: number; at: string };

export async function listLedger(wallet: 'points' | 'runs', range: DateRange, kind: LedgerKind | 'all', limit = 100): Promise<LedgerRow[]> {
  return read(async () => {
    const res = await api<{ rows: ServerLedgerRow[] }>('/ledger', { query: { wallet, range, kind, limit } });
    return res.rows.map((r) => {
      const ago = daysAgo(r.at);
      return {
        ...r,
        sub: r.sub ?? dayMonth(r.at),
        day: ago <= 0 ? ('today' as const) : ago === 1 ? ('yesterday' as const) : ('earlier' as const),
        icon: r.title.toLowerCase().includes('challenge') ? ('trophy' as const) : LEDGER_ICON[r.kind],
      };
    });
  }, []);
}
