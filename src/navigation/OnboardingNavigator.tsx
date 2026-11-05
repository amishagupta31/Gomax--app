import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { LoginScreen } from '../screens/onboarding/LoginScreen';
import { SignupScreen } from '../screens/onboarding/SignupScreen';
import { ForgotPasswordScreen } from '../screens/onboarding/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
