import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  useFonts as useRoboto,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { colors } from './src/theme';
import { AppProvider } from './src/state/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GoMaxLogo } from './src/components/GoMaxLogo';
import { V3App } from './src/v3/V3App';

export default function App() {
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [robotoLoaded] = useRoboto({ Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold });

  if (!interLoaded || !robotoLoaded) {
    return (
      <View style={styles.loading}>
        <GoMaxLogo variant="full-orange" width={180} />
      </View>
    );
  }

  // Final Applicator app from the GOMAX – DEV Figma file (src/v3).
  if (process.env.EXPO_PUBLIC_UI === 'v3') {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <V3App />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy900 },
});
