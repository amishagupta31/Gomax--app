import React from 'react';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { V3StackParamList } from './types';
import { ScanScreen } from '../screens/scan/ScanScreen';
import { ScanResultSheet, ScanTermsSheet } from '../screens/scan/ScanSheets';
import { MyScansScreen } from '../screens/scan/MyScansScreen';
import { WalletScreen, WithdrawInfoSheet } from '../screens/wallet/WalletScreen';
import {
  GiftAddressScreen,
  GiftBookedScreen,
  GiftDetailScreen,
  MyGiftDetailScreen,
  MyGiftsScreen,
} from '../screens/wallet/GiftScreens';
import { HistoryFilterSheet, HistoryScreen } from '../screens/wallet/HistoryScreen';
import {
  WithdrawConfirmSheet,
  WithdrawDoneScreen,
  WithdrawPaidScreen,
  WithdrawProofScreen,
  WithdrawRejectedScreen,
  WithdrawScreen,
} from '../screens/withdraw/WithdrawScreens';
import {
  ProductCompareScreen,
  ProductDetailScreen,
  ProductsScreen,
  TdsViewerScreen,
} from '../screens/products/ProductScreens';
import { GameRulesSheet, SpinResultSheet, SpinWheelScreen } from '../screens/games/SpinScreens';
import { ScratchCardScreen, ScratchCardsScreen, ScratchEarnedScreen } from '../screens/games/ScratchScreens';
import {
  AllChallengesScreen,
  ChallengeCompletedScreen,
  ChallengeDetailScreen,
  ChallengesHomeScreen,
  NewChallengeScreen,
} from '../screens/games/ChallengeScreens';
import { PhotoStreakCameraScreen, PhotoStreakScreen, PhotoStreakUploadedScreen } from '../screens/games/StreakScreens';
import { GamesHistoryScreen } from '../screens/games/GamesHistoryScreen';
import { InviteEarnScreen, MyInviteQrScreen, RankBenefitsSheet } from '../screens/invite/InviteScreens';
import {
  NotificationsScreen,
  ProfileScreen,
  WhatsAppMessageScreen,
  WhatsAppMessagesScreen,
} from '../screens/profile/ProfileScreens';

// Screens for sections B1–C4, mounted by V3Navigator.
type Entry = {
  name: keyof V3StackParamList;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions | 'sheet';
};

export const SCREENS: {
  ProductsTab: React.ComponentType<any>;
  ScanTab: React.ComponentType<any>;
  WalletTab: React.ComponentType<any>;
  ProfileTab: React.ComponentType<any>;
  stack: Entry[];
} = {
  ProductsTab: ProductsScreen,
  ScanTab: ScanScreen,
  WalletTab: WalletScreen,
  ProfileTab: ProfileScreen,
  stack: [
    // B1
    { name: 'ScanResult', component: ScanResultSheet, options: 'sheet' },
    { name: 'ScanTerms', component: ScanTermsSheet, options: 'sheet' },
    { name: 'MyScans', component: MyScansScreen },
    // B2 / B4
    { name: 'WithdrawInfoSheet', component: WithdrawInfoSheet, options: 'sheet' },
    { name: 'GiftDetail', component: GiftDetailScreen },
    { name: 'GiftAddress', component: GiftAddressScreen },
    { name: 'GiftBooked', component: GiftBookedScreen, options: { animation: 'fade', gestureEnabled: false } },
    { name: 'MyGifts', component: MyGiftsScreen },
    { name: 'MyGiftDetail', component: MyGiftDetailScreen },
    { name: 'HistoryAll', component: HistoryScreen },
    { name: 'HistoryFilterSheet', component: HistoryFilterSheet, options: 'sheet' },
    // B3
    { name: 'Withdraw', component: WithdrawScreen },
    { name: 'WithdrawConfirm', component: WithdrawConfirmSheet, options: 'sheet' },
    { name: 'WithdrawDone', component: WithdrawDoneScreen, options: { animation: 'fade', gestureEnabled: false } },
    { name: 'WithdrawPaid', component: WithdrawPaidScreen },
    { name: 'WithdrawProof', component: WithdrawProofScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'WithdrawRejected', component: WithdrawRejectedScreen },
    // C1
    { name: 'ProductDetail', component: ProductDetailScreen },
    { name: 'TdsViewer', component: TdsViewerScreen },
    { name: 'ProductCompare', component: ProductCompareScreen },
    // C2
    { name: 'SpinWheel', component: SpinWheelScreen },
    { name: 'SpinNoneLeft', component: SpinWheelScreen },
    { name: 'SpinResult', component: SpinResultSheet, options: 'sheet' },
    { name: 'GameRules', component: GameRulesSheet, options: 'sheet' },
    { name: 'ScratchEarned', component: ScratchEarnedScreen, options: { animation: 'fade' } },
    { name: 'ScratchCards', component: ScratchCardsScreen },
    { name: 'ScratchCard', component: ScratchCardScreen, options: { animation: 'fade', gestureEnabled: false } },
    { name: 'ChallengesHome', component: ChallengesHomeScreen },
    { name: 'AllChallenges', component: AllChallengesScreen },
    { name: 'ChallengeDetail', component: ChallengeDetailScreen },
    { name: 'ChallengeCompleted', component: ChallengeCompletedScreen, options: { animation: 'fade', gestureEnabled: false } },
    {
      name: 'NewChallenge',
      component: NewChallengeScreen,
      options: { presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } },
    },
    { name: 'PhotoStreak', component: PhotoStreakScreen },
    { name: 'PhotoStreakCamera', component: PhotoStreakCameraScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'PhotoStreakUploaded', component: PhotoStreakUploadedScreen, options: { animation: 'fade', gestureEnabled: false } },
    { name: 'GamesHistory', component: GamesHistoryScreen },
    // C3
    { name: 'InviteEarn', component: InviteEarnScreen },
    { name: 'RankBenefits', component: RankBenefitsSheet, options: 'sheet' },
    { name: 'MyInviteQr', component: MyInviteQrScreen },
    // C4
    { name: 'Notifications', component: NotificationsScreen },
    { name: 'WhatsAppMessages', component: WhatsAppMessagesScreen },
    { name: 'WhatsAppMessage', component: WhatsAppMessageScreen },
  ],
};
