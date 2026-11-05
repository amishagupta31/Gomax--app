import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { V3StoreProvider, useV3 } from './state/Store';
import { ToastProvider } from './components/Toast';
import { V3Navigator } from './navigation/V3Navigator';
import { V3StackParamList } from './navigation/types';
import { c } from './theme';

const navRef = createNavigationContainerRef<V3StackParamList>();

// Test-only bridge (EXPO_PUBLIC_E2E=1): lets the screen-by-screen browser
// test open any route and set demo state. Never active in normal builds.
function E2EBridge() {
  const store = useV3();
  if (process.env.EXPO_PUBLIC_E2E === '1' && typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__v3 = { nav: navRef, store };
  }
  return null;
}

// Root of the final Applicator app built from the GOMAX – DEV Figma file.
// Mounted by App.tsx when EXPO_PUBLIC_UI=v3 (Inter/Roboto are loaded there;
// Bebas Neue is only used for the product-detail watermark, C1-02).
export function V3App() {
  const [ready] = useFonts({ BebasNeue_400Regular });
  if (!ready) return <View style={{ flex: 1, backgroundColor: c.navy900 }} />;
  return (
    <V3StoreProvider>
      <E2EBridge />
      <ToastProvider>
        <NavigationContainer ref={navRef}>
          <V3Navigator />
        </NavigationContainer>
      </ToastProvider>
    </V3StoreProvider>
  );
}
