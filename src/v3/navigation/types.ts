import type { NavigatorScreenParams } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DateRange } from '../api/wallet';

export type V3TabParamList = {
  Home: undefined;
  Products: undefined;
  Scan: { manual?: boolean } | undefined;
  Wallet: { tab?: 'points' | 'runs' } | undefined;
  Profile: undefined;
};

export type ScanOutcome = 'added' | 'scratch' | 'gift' | 'used' | 'invalid' | 'offline';

export type V3StackParamList = {
  // A1 Onboarding
  Splash: undefined;
  Login: { mobile?: string } | undefined;
  SignupAccount: { mobile?: string } | undefined;
  SignupBirthday: undefined;
  SignupSuccess: undefined;
  ForgotMobile: { mobile?: string } | undefined;
  ForgotVerify: { mobile: string };
  ForgotChat: { mobile: string };
  ForgotNewPassword: { mobile: string };
  ForgotSuccess: undefined;
  ForgotHelpline: { mobile?: string } | undefined;
  ForgotHelplineSent: undefined;

  // A2 / A3 Home
  Welcome: undefined;
  Tabs: NavigatorScreenParams<V3TabParamList> | undefined;
  RankSheet: undefined;
  HowItWorksSheet: undefined;
  FirstCoupon: undefined;
  PanUpiOverview: undefined;
  AddPan: undefined;
  AddUpi: undefined;
  PanUpiDone: undefined;
  DemoStates: undefined;

  // B1 Scan
  ScanTerms: undefined;
  ScanResult: { outcome: ScanOutcome; code: string; value?: number; usedAt?: string };
  MyScans: { range?: 'today' | 'week' | 'month'; status?: 'all' | 'added' | 'waiting' | 'failed' } | undefined;

  // B2 Wallet & Gifts, B4 History
  WithdrawInfoSheet: undefined;
  HistoryAll: { wallet?: 'points' | 'runs'; range?: DateRange; kind?: string } | undefined;
  HistoryFilterSheet: { range: DateRange };
  GiftDetail: { giftId: string };
  GiftAddress: { giftId: string };
  GiftBooked: { giftId: string; orderId: string };
  MyGifts: undefined;
  MyGiftDetail: { orderId: string };

  // B3 Withdraw
  Withdraw: undefined;
  WithdrawConfirm: { amount: number };
  WithdrawDone: { amount: number };
  WithdrawPaid: { id: string };
  WithdrawProof: { id: string };
  WithdrawRejected: { id: string };

  // C1 Products
  ProductDetail: { productId: string };
  TdsViewer: { productId: string };
  ProductCompare: { ids?: string[] } | undefined;

  // C2 Games & Challenges
  SpinWheel: undefined;
  SpinResult: { prize: string };
  SpinNoneLeft: undefined;
  ScratchEarned: undefined;
  ScratchCards: undefined;
  ScratchCard: { cardId: string };
  ChallengesHome: undefined;
  AllChallenges: undefined;
  ChallengeDetail: { challengeId: string };
  ChallengeCompleted: { challengeId: string };
  NewChallenge: undefined;
  PhotoStreak: undefined;
  PhotoStreakCamera: undefined;
  PhotoStreakUploaded: { uri?: string; takenAt?: string } | undefined;
  GamesHistory: undefined;
  GameRules: { kind: 'spin' | 'scratch' | 'challenges' | 'streak' };

  // C3 Invite
  InviteEarn: undefined;
  RankBenefits: undefined;
  MyInviteQr: undefined;

  // C4 Profile
  Notifications: undefined;
  WhatsAppMessages: undefined;
  WhatsAppMessage: { templateId: string };
};

export type V3ScreenProps<K extends keyof V3StackParamList> = NativeStackScreenProps<V3StackParamList, K>;

export type V3Nav = NativeStackNavigationProp<V3StackParamList>;

export const useV3Nav = () => useNavigation<V3Nav>();
