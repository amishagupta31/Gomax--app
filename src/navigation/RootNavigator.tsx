import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ChallengesScreen } from '../screens/engagement/ChallengesScreen';
import { ScratchCardScreen } from '../screens/engagement/ScratchCardScreen';
import { SpinWheelScreen } from '../screens/engagement/SpinWheelScreen';
import { TeamScreen } from '../screens/team/TeamScreen';
import { LedgerScreen } from '../screens/ledger/LedgerScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { InviteEarnScreen } from '../screens/invite/InviteEarnScreen';
import { MyQrCodeScreen } from '../screens/invite/MyQrCodeScreen';
import { RankBenefitsSheet } from '../screens/invite/RankBenefitsSheet';
import { ProductsScreen } from '../screens/products/ProductsScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import { DataSheetScreen } from '../screens/products/DataSheetScreen';
import { CompareProductsScreen } from '../screens/products/CompareProductsScreen';
import { GiftDetailScreen } from '../screens/gifts/GiftDetailScreen';
import { GiftAddressScreen } from '../screens/gifts/GiftAddressScreen';
import { GiftBookedScreen } from '../screens/gifts/GiftBookedScreen';
import { MyGiftsScreen } from '../screens/gifts/MyGiftsScreen';
import { MyGiftDetailScreen } from '../screens/gifts/MyGiftDetailScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { DesignSystemScreen } from '../screens/dev/DesignSystemScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ScratchCards" component={ScratchCardScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SpinWheel" component={SpinWheelScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Team" component={TeamScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Ledger" component={LedgerScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="InviteEarn" component={InviteEarnScreen} />
      <Stack.Screen name="MyQrCode" component={MyQrCodeScreen} />
      <Stack.Screen
        name="RankBenefits"
        component={RankBenefitsSheet}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="DataSheet" component={DataSheetScreen} />
      <Stack.Screen name="CompareProducts" component={CompareProductsScreen} />
      <Stack.Screen name="GiftDetail" component={GiftDetailScreen} />
      <Stack.Screen name="GiftAddress" component={GiftAddressScreen} />
      <Stack.Screen name="GiftBooked" component={GiftBookedScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="MyGifts" component={MyGiftsScreen} />
      <Stack.Screen name="MyGiftDetail" component={MyGiftDetailScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="DesignSystem" component={DesignSystemScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
