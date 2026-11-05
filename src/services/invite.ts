import { Linking } from 'react-native';
import { getMyDownline } from './downline';

// Design value ("You get +50 runs each"); admin-configurable once the backend awards it.
export const RUNS_PER_INVITE = 50;

export type InviteStats = { joinedCount: number; runsEarned: number };

export async function getMyInviteStats(): Promise<InviteStats> {
  const downline = await getMyDownline();
  const joinedCount = downline.filter((m) => m.isDirectReport).length;
  return { joinedCount, runsEarned: joinedCount * RUNS_PER_INVITE };
}

export function inviteMessage(code: string) {
  return `Join GoMax with my code ${code} and start earning points on every bag you use.`;
}

export function shareOnWhatsApp(text: string) {
  return Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
}
