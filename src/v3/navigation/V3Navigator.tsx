import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { V3StackParamList, V3TabParamList } from './types';
import { V3TabBar } from '../components/TabBar';
import { c } from '../theme';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupAccountScreen } from '../screens/auth/SignupAccountScreen';
import { SignupBirthdayScreen } from '../screens/auth/SignupBirthdayScreen';
import { SignupSuccessScreen } from '../screens/auth/SignupSuccessScreen';
import {
  ForgotChatScreen,
  ForgotHelplineScreen,
  ForgotHelplineSentScreen,
  ForgotMobileScreen,
  ForgotNewPasswordScreen,
  ForgotSuccessScreen,
  ForgotVerifyScreen,
} from '../screens/auth/ForgotScreens';
import { WelcomeScreen } from '../screens/home/WelcomeScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { HowItWorksSheet, RankSheet } from '../screens/home/HomeSheets';
import {
  AddPanScreen,
  AddUpiScreen,
  FirstCouponScreen,
  PanUpiDoneScreen,
  PanUpiOverviewScreen,
} from '../screens/home/KycScreens';
import { DemoStatesScreen } from '../screens/dev/DemoStatesScreen';
import { SCREENS } from './registry';

const Stack = createNativeStackNavigator<V3StackParamList>();
const Tab = createBottomTabNavigator<V3TabParamList>();

const sheet: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  animation: 'fade',
  contentStyle: { backgroundColor: 'transparent' },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.surfacePage } }}
      tabBar={(p) => <V3TabBar {...p} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={SCREENS.ProductsTab} />
      <Tab.Screen name="Scan" component={SCREENS.ScanTab} />
      <Tab.Screen name="Wallet" component={SCREENS.WalletTab} />
      <Tab.Screen name="Profile" component={SCREENS.ProfileTab} />
    </Tab.Navigator>
  );
}

export function V3Navigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }} initialRouteName="Splash">
      {/* A1 */}
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="SignupAccount" component={SignupAccountScreen} />
      <Stack.Screen name="SignupBirthday" component={SignupBirthdayScreen} />
      <Stack.Screen name="SignupSuccess" component={SignupSuccessScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="ForgotMobile" component={ForgotMobileScreen} />
      <Stack.Screen name="ForgotVerify" component={ForgotVerifyScreen} />
      <Stack.Screen name="ForgotChat" component={ForgotChatScreen} />
      <Stack.Screen name="ForgotNewPassword" component={ForgotNewPasswordScreen} />
      <Stack.Screen name="ForgotSuccess" component={ForgotSuccessScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="ForgotHelpline" component={ForgotHelplineScreen} />
      <Stack.Screen name="ForgotHelplineSent" component={ForgotHelplineSentScreen} />

      {/* A2 / A3 */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Tabs" component={Tabs} options={{ animation: 'fade' }} />
      <Stack.Screen name="RankSheet" component={RankSheet} options={sheet} />
      <Stack.Screen name="HowItWorksSheet" component={HowItWorksSheet} options={sheet} />
      <Stack.Screen name="FirstCoupon" component={FirstCouponScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="PanUpiOverview" component={PanUpiOverviewScreen} />
      <Stack.Screen name="AddPan" component={AddPanScreen} />
      <Stack.Screen name="AddUpi" component={AddUpiScreen} />
      <Stack.Screen name="PanUpiDone" component={PanUpiDoneScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="DemoStates" component={DemoStatesScreen} />

      {/* B / C sections */}
      {SCREENS.stack.map(({ name, component, options }) => (
        <Stack.Screen key={name} name={name} component={component} options={options === 'sheet' ? sheet : options} />
      ))}
    </Stack.Navigator>
  );
}
