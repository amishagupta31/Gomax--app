export type NotificationType = 'money' | 'gifts' | 'games' | 'invite';

export type AppNotification = {
  id: string;
  type: NotificationType;
  section: 'Today' | 'Earlier';
  icon: string;
  title: string;
  body: string;
  timeLabel: string;
  unread: boolean;
};

// No notifications table/RPC exists yet (C4 dev notes: GET /notifications?type, mark read).
const SAMPLE: AppNotification[] = [
  { id: '1', type: 'money', section: 'Today', icon: '💳', title: '₹500 sent to your UPI', body: 'UTR 4290 1188 7765 · ram@ybl', timeLabel: '10:42 am', unread: true },
  { id: '2', type: 'games', section: 'Today', icon: '🎫', title: 'You got a scratch card', body: '10 coupons scanned today', timeLabel: '9:15 am', unread: true },
  { id: '3', type: 'money', section: 'Today', icon: '🪙', title: '7 coupons added · +140 pts', body: 'Daily summary', timeLabel: 'Yesterday 9 pm', unread: false },
  { id: '4', type: 'gifts', section: 'Earlier', icon: '🚚', title: 'Your gift is on the way', body: 'Pressure cooker · AWB 1Z98 2211 · Delhivery', timeLabel: '28 Sep', unread: false },
  { id: '5', type: 'games', section: 'Earlier', icon: '👑', title: 'You are now Kaarigar!', body: '4 spins a day + 10% more runs', timeLabel: '25 Sep', unread: false },
  { id: '6', type: 'games', section: 'Earlier', icon: '🏆', title: 'Challenge won · +100 runs', body: 'Scan 20 coupons this week', timeLabel: '22 Sep', unread: false },
  { id: '7', type: 'money', section: 'Earlier', icon: '⚠️', title: 'Add your UPI to get cash', body: 'Takes 1 minute', timeLabel: '20 Sep', unread: false },
];

export async function listMyNotifications(): Promise<AppNotification[]> {
  return SAMPLE;
}
