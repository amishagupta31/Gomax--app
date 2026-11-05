export type OnboardingStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// One shared tab set for Dealer / Contractor / Applicator — content inside
// each tab adapts by role (e.g. Scan is Applicator-only), rather than
// forking into three near-identical navigators.
export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Wallet: undefined;
  Gifts: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Challenges: undefined;
  ScratchCards: undefined;
  SpinWheel: undefined;
  Team: undefined;
  Ledger: undefined;
  Notifications: undefined;
  InviteEarn: undefined;
  MyQrCode: undefined;
  RankBenefits: undefined;
  Products: undefined;
  ProductDetail: { productId: string };
  DataSheet: { productId: string };
  CompareProducts: undefined;
  GiftDetail: { giftId: string };
  GiftAddress: { giftId: string };
  GiftBooked: { redemptionId: string; giftName: string; runsSpent: number; imageUrl?: string };
  MyGifts: undefined;
  MyGiftDetail: { redemptionId: string };
  History: { tab?: 'points' | 'runs' } | undefined;
  DesignSystem: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
