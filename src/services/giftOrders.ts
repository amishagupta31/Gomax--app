import { GiftRedemptionRow, GiftRow, listGiftCatalogue, listMyGiftRedemptions, redeemGift } from './gifts';
import { updateMyProfile } from './profile';

export type GiftOrder = GiftRedemptionRow & { gift: GiftRow | null };
export type GiftOrderStatus = 'booked' | 'shipped' | 'delivered';

export const GIFT_HELPLINE = '9215844410';

export function orderCode(id: string) {
  return `G-${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

export function orderStatus(order: GiftRedemptionRow): GiftOrderStatus {
  if (order.status === 'delivered') return 'delivered';
  if (order.status === 'shipped') return 'shipped';
  return 'booked';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function dayMonth(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function shortDate(iso: string | null | undefined) {
  return iso ? dayMonth(new Date(iso)) : '';
}

export function dateTime(iso: string) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  return `${shortDate(iso)}, ${time}`;
}

export async function getGift(giftId: string): Promise<GiftRow | null> {
  const gifts = await listGiftCatalogue();
  return gifts.find((g) => g.id === giftId) ?? null;
}

export async function getGiftOrder(redemptionId: string): Promise<GiftOrder | null> {
  const orders = await listMyGiftRedemptions();
  return orders.find((o) => o.id === redemptionId) ?? null;
}

const PIN_SUFFIX = /,?\s*PIN\s*(\d{6})\s*$/i;

// profiles has no pin_code column, so the PIN rides at the end of the address line.
export function splitAddress(address: string): { street: string; pin: string } {
  const match = address.match(PIN_SUFFIX);
  return match ? { street: address.replace(PIN_SUFFIX, '').trim(), pin: match[1] } : { street: address.trim(), pin: '' };
}

export type DeliveryAddress = { street: string; city: string; pin: string };

export type BookGiftResult = { ok: true; redemptionId: string } | { ok: false; message: string };

const BOOK_ERRORS: Record<string, string> = {
  insufficient_runs: 'You do not have enough runs for this gift yet.',
  out_of_stock: 'This gift just went out of stock.',
  gift_not_found: 'This gift is no longer available.',
};

export async function bookGift(giftId: string, address: DeliveryAddress): Promise<BookGiftResult> {
  await updateMyProfile({ address: `${address.street.trim()}, PIN ${address.pin}`, city: address.city.trim() });
  const result = await redeemGift(giftId);
  if (!result.success) return { ok: false, message: BOOK_ERRORS[result.error] ?? 'Could not book this gift. Please try again.' };
  return { ok: true, redemptionId: result.redemptionId };
}
