import { d3 } from '../assets';
import type { V3StackParamList } from '../navigation/types';

// C4-03 … C4-14: approved WhatsApp utility templates sent from the GoMax
// WhatsApp Business number (17:15008 – 17:15447). Copy is per the Figma
// frames; {name}/{mobile}/{code} are filled from the signed-in user.

/** [route, params] — params typed loosely; each entry is checked by hand. */
type Route = [keyof V3StackParamList, object?];

export type WaBubble = {
  art?: number;
  tint?: string;
  title: string;
  lines: string[];
  time: string;
  cta: { label: string; external?: boolean; to: Route };
};

export type WaTemplate = {
  id: string;
  frame: string;
  label: string;
  date: string;
  bubbles: WaBubble[];
  /** Tapping the chat header steps to the next template (Figma hotspot). */
  next: string;
};

const TINT = {
  peach: '#fdebe4',
  amber: '#fdf3d6',
  teal: '#e1f3f1',
  green: '#e6f7ec',
  blue: '#e8edf8',
};

export const WA_TEMPLATES: WaTemplate[] = [
  {
    id: 'welcome', frame: 'C4-03', label: 'Welcome after sign up', date: 'Today', next: 'summary',
    bubbles: [{
      art: d3.partyPopper, tint: TINT.peach, title: 'Welcome to GoMax, {name}! 🎉', time: '10:42 am',
      lines: ['Your account is ready.', 'Login ID: {mobile}', '', '1. Find the coupon in every GoMax pack', '2. Scan it in the app', '3. Get points (cash) and runs (gifts)', '', 'First coupon = +25 bonus points.'],
      cta: { label: 'Open GoMax app', external: true, to: ['Tabs', { screen: 'Home' }] },
    }],
  },
  {
    id: 'summary', frame: 'C4-04', label: 'Daily coupon summary', date: 'Today', next: 'scratch',
    bubbles: [{
      art: d3.coin, tint: TINT.amber, title: 'Today: 7 coupons scanned ✅', time: '9:00 pm',
      lines: ['+140 points added.', 'Points balance: 460', 'Runs balance: 140', '', 'Scan 3 more today to get a scratch card.'],
      cta: { label: 'Open GoMax app', external: true, to: ['MyScans'] },
    }],
  },
  {
    id: 'scratch', frame: 'C4-05', label: 'Scratch card won', date: 'Today', next: 'paid',
    bubbles: [{
      art: d3.ticket, tint: TINT.teal, title: 'You won a scratch card! 🎁', time: '6:15 pm',
      lines: ['You scanned 10 coupons today.', 'Open the app and scratch it to win runs.'],
      cta: { label: 'Scratch now', to: ['ScratchCards'] },
    }],
  },
  {
    id: 'paid', frame: 'C4-06', label: 'Withdrawal paid', date: 'Today', next: 'gift',
    bubbles: [{
      art: d3.creditCard, tint: TINT.green, title: '₹500 sent to your UPI 💰', time: '10:42 am',
      lines: ['UPI: ram@ybl', 'UTR: 4290 1188 7765', 'Date: 02 Oct 2026, 10:42 am', '', 'Money not in your bank in 48 hours? Reply HELP.'],
      cta: { label: 'See history', to: ['WithdrawPaid', { id: 'W-3001' }] },
    }],
  },
  {
    id: 'gift', frame: 'C4-07', label: 'Gift shipped & delivered', date: '28 Sep', next: 'rank',
    bubbles: [
      {
        art: d3.deliveryTruck, tint: TINT.blue, title: 'Your gift is on the way 🚚', time: '28 Sep',
        lines: ['Gift: Pressure cooker (3 L)', 'Courier: Delhivery', 'AWB: 1Z98 2211 4433', 'Reaches in 3–5 days.'],
        cta: { label: 'Track parcel', external: true, to: ['MyGiftDetail', { orderId: 'G-1042' }] },
      },
      {
        title: 'Gift delivered ✅', time: '01 Oct',
        lines: ['Your Pressure cooker was delivered on 01 Oct.', 'Not received? Reply HELP.'],
        cta: { label: 'Rate your gift', to: ['MyGiftDetail', { orderId: 'G-2104' }] },
      },
    ],
  },
  {
    id: 'rank', frame: 'C4-08', label: 'Rank up', date: 'Today', next: 'challenge',
    bubbles: [{
      art: d3.crown, tint: TINT.amber, title: 'You are now Kaarigar! 👑', time: '10:42 am',
      lines: ['Well done, {name}.', 'New benefits:', '• 4 spins a day', '• 10% more runs', '', 'Next rank: Ustaad at 2,000 points.'],
      cta: { label: 'See my rank', to: ['RankBenefits'] },
    }],
  },
  {
    id: 'challenge', frame: 'C4-09', label: 'Challenge won', date: 'Today', next: 'kyc',
    bubbles: [{
      art: d3.trophy, tint: TINT.peach, title: 'Challenge won! 🏆', time: '10:42 am',
      lines: ['Scan 20 coupons this week — done.', '+100 runs added to your gifts wallet.', 'New challenge starts Monday.'],
      cta: { label: 'See challenges', to: ['ChallengeCompleted', { challengeId: 'd1' }] },
    }],
  },
  {
    id: 'kyc', frame: 'C4-10', label: 'PAN / UPI reminder', date: 'Today', next: 'reset',
    bubbles: [{
      art: d3.warning, tint: TINT.amber, title: 'Add UPI to get your cash', time: '10:42 am',
      lines: ['You have 520 points = ₹520.', 'Add your UPI ID and PAN in the app to withdraw. It takes 1 minute.'],
      cta: { label: 'Add UPI now', to: ['PanUpiOverview'] },
    }],
  },
  {
    id: 'reset', frame: 'C4-11', label: 'Password reset link', date: 'Today', next: 'friend',
    bubbles: [{
      art: d3.locked, tint: TINT.blue, title: 'Reset your GoMax password', time: '10:42 am',
      lines: ['Tap the button to set a new password.', 'This link works for 15 minutes.', '', 'Did not ask for this? Ignore this message.'],
      cta: { label: 'Reset password', external: true, to: ['ForgotNewPassword', { mobile: '9876543210' }] },
    }],
  },
  {
    id: 'friend', frame: 'C4-12', label: 'Friend joined (+runs)', date: 'Today', next: 'failed',
    bubbles: [{
      art: d3.handshake, tint: TINT.peach, title: 'Friend joined! 🤝', time: '10:42 am',
      lines: ['Suresh joined GoMax with your code {code}.', '+50 runs added to your gifts wallet.', 'You also get runs when he scans.'],
      cta: { label: 'See Invite & earn', to: ['InviteEarn'] },
    }],
  },
  {
    id: 'failed', frame: 'C4-13', label: 'Withdrawal failed', date: 'Today', next: 'streak',
    bubbles: [{
      art: d3.warning, tint: TINT.peach, title: 'Money not sent ⚠', time: '10:42 am',
      lines: ['₹500 could not be sent to ram@ybl.', 'Your 500 points are back in your wallet.', 'Please check your UPI ID in the app.'],
      cta: { label: 'Check my UPI', to: ['WithdrawRejected', { id: 'W-2990' }] },
    }],
  },
  {
    id: 'streak', frame: 'C4-14', label: 'Streak missed', date: 'Today', next: 'welcome',
    bubbles: [{
      art: d3.fire, tint: TINT.peach, title: 'Photo streak missed 🔥', time: '10:42 am',
      lines: ["You did not add yesterday's work photo.", 'Your streak is back to day 0.', 'Start again today — 15 days = bonus runs.'],
      cta: { label: 'Upload photo', to: ['PhotoStreak'] },
    }],
  },
];

export const waTemplate = (id: string) => WA_TEMPLATES.find((x) => x.id === id) ?? WA_TEMPLATES[0];
