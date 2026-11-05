import { dayMonth, orderCode } from './giftOrders';
import { PointsLedgerRow, RunsLedgerRow } from './wallet';

export type HistoryTab = 'points' | 'runs';
export type RangeKey = 'today' | 'last7' | 'thisMonth' | 'lastMonth' | 'custom';
export type DateRange = { key: RangeKey; from?: Date; to?: Date };

export const DEFAULT_RANGE: DateRange = { key: 'thisMonth' };

export const TYPE_FILTERS: Record<HistoryTab, { key: string; label: string; types?: string[] }[]> = {
  points: [
    { key: 'all', label: 'All' },
    { key: 'scan', label: 'Scan', types: ['scan_credit'] },
    { key: 'withdraw', label: 'Withdraw', types: ['redemption_debit'] },
    { key: 'bonus', label: 'Bonus' },
  ],
  runs: [
    { key: 'all', label: 'All' },
    { key: 'games', label: 'Games', types: ['spin_credit', 'scratch_credit', 'challenge_credit'] },
    { key: 'invite', label: 'Invite', types: ['invite_credit', 'referral_credit'] },
    { key: 'gifts', label: 'Gifts', types: ['gift_redemption_debit'] },
  ],
};

export function matchesType(tab: HistoryTab, filterKey: string, entryType: string) {
  if (filterKey === 'all') return true;
  const filters = TYPE_FILTERS[tab];
  const filter = filters.find((f) => f.key === filterKey);
  if (filter?.types) return filter.types.includes(entryType);
  const known = filters.flatMap((f) => f.types ?? []);
  return !known.includes(entryType);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function rangeBounds(range: DateRange, now = new Date()): [Date, Date] {
  const today = startOfDay(now);
  const tomorrow = new Date(today.getTime() + 86400000);
  switch (range.key) {
    case 'today':
      return [today, tomorrow];
    case 'last7':
      return [new Date(today.getTime() - 6 * 86400000), tomorrow];
    case 'lastMonth':
      return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 1)];
    case 'custom':
      return [startOfDay(range.from ?? today), new Date(startOfDay(range.to ?? today).getTime() + 86400000)];
    default:
      return [new Date(now.getFullYear(), now.getMonth(), 1), tomorrow];
  }
}

const fmtDay = dayMonth;

export function rangeLabel(range: DateRange) {
  switch (range.key) {
    case 'today':
      return 'Today';
    case 'last7':
      return 'Last 7 days';
    case 'lastMonth':
      return 'Last month';
    case 'custom':
      return `${fmtDay(range.from ?? new Date())} – ${fmtDay(range.to ?? new Date())}`;
    default:
      return 'This month';
  }
}

export function rangePhrase(range: DateRange) {
  return range.key === 'custom' ? 'these dates' : rangeLabel(range).toLowerCase();
}

export type EntryVisual = { title: string; icon: string; tint: string; ink: string };

const VISUALS: Record<string, EntryVisual> = {
  scan_credit: { title: 'Coupon scan', icon: 'ticket-outline', tint: '#E6F6EC', ink: '#137a3d' },
  redemption_debit: { title: 'Withdrawn to UPI', icon: 'business-outline', tint: '#F3F4F6', ink: '#52525b' },
  commission_credit: { title: 'Team commission', icon: 'people-outline', tint: '#E8EEF8', ink: '#0f2a4e' },
  adjustment: { title: 'Bonus', icon: 'gift-outline', tint: '#FCE3D9', ink: '#c05336' },
  spin_credit: { title: 'Spin the wheel', icon: 'sparkles-outline', tint: '#E3F2F7', ink: '#1B8AA6' },
  scratch_credit: { title: 'Scratch card', icon: 'sparkles-outline', tint: '#E3F2F7', ink: '#1B8AA6' },
  challenge_credit: { title: 'Challenge won', icon: 'trophy-outline', tint: '#FFF3DF', ink: '#A3540A' },
  gift_redemption_debit: { title: 'Gift booked', icon: 'gift-outline', tint: '#FCE3D9', ink: '#c05336' },
  invite_credit: { title: 'Friend joined with your code', icon: 'people-outline', tint: '#E8EEF8', ink: '#0f2a4e' },
  referral_credit: { title: 'Friend joined with your code', icon: 'people-outline', tint: '#E8EEF8', ink: '#0f2a4e' },
};

export function entryVisual(entryType: string): EntryVisual {
  return (
    VISUALS[entryType] ?? {
      title: entryType.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
      icon: 'ellipse-outline',
      tint: '#F3F4F6',
      ink: '#52525b',
    }
  );
}

export type HistoryEntry = {
  id: string;
  entryType: string;
  createdAt: Date;
  value: number;
  debit: boolean;
  sub?: string;
};

export function toEntries(rows: (PointsLedgerRow | RunsLedgerRow)[]): HistoryEntry[] {
  return rows.map((r) => {
    const debit = r.amount < 0 || r.entry_type.endsWith('_debit');
    return {
      id: r.id,
      entryType: r.entry_type,
      createdAt: new Date(r.created_at),
      value: Math.abs(Number(r.amount)),
      debit,
      sub: r.entry_type === 'gift_redemption_debit' && r.ref_id ? `Order ${orderCode(r.ref_id)}` : undefined,
    };
  });
}

export function formatAmount(tab: HistoryTab, e: HistoryEntry) {
  const n = e.value.toLocaleString('en-IN');
  if (tab === 'points') {
    if (e.entryType === 'redemption_debit') return `−₹${n}`;
    return e.debit ? `−${n} pts` : `+${n} pts`;
  }
  return e.debit ? `−${n} runs` : `+${n} runs`;
}

export function sectionFor(d: Date, now = new Date()): 'TODAY' | 'YESTERDAY' | 'EARLIER' {
  const today = startOfDay(now).getTime();
  const day = startOfDay(d).getTime();
  if (day === today) return 'TODAY';
  if (day === today - 86400000) return 'YESTERDAY';
  return 'EARLIER';
}

export function timeOrDate(d: Date, section: string) {
  if (section === 'EARLIER') return fmtDay(d);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}

export function parseDayMonthYear(text: string): Date | undefined {
  const m = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return undefined;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? undefined : d;
}
