import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, m3Type, spacing } from '../../theme';
import { GoMaxLogo } from '../../components/GoMaxLogo';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

const MIN_SPLASH_MS = 1200;

// Exact gradient from Figma node 1:98: linear-gradient(159.8deg, #000000 1.89%, #002040 74.93%)
export function SplashScreen({ navigation }: Props) {
  const { isAuthenticated, sessionLoading } = useApp();
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);
  const routedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // AppContext already restores a saved Supabase session on launch — a
    // returning user with a valid session goes straight into the app
    // instead of being shown the Login screen every time they open it.
    if (!minTimeElapsed || sessionLoading || routedRef.current) return;
    routedRef.current = true;
    if (isAuthenticated) {
      navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Main' }] });
    } else {
      navigation.replace('Login');
    }
  }, [navigation, isAuthenticated, sessionLoading, minTimeElapsed]);

  return (
    <LinearGradient
      colors={[colors.black, colors.gradientNavyDeep]}
      start={{ x: 0.18, y: 0 }}
      end={{ x: 0.82, y: 1 }}
      locations={[0.019, 0.75]}
      style={styles.container}
    >
      <GoMaxLogo variant="full-orange" width={260} />
      {__DEV__ ? (
        <Pressable
          style={styles.devLink}
          onPress={() => navigation.getParent()?.navigate('DesignSystem')}
          hitSlop={16}
        >
          <Text style={styles.devLinkText}>Design system</Text>
        </Pressable>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  devLink: { position: 'absolute', bottom: 12 },
  devLinkText: { ...m3Type.labelSmall, fontSize: 10, color: 'rgba(255,255,255,0.2)' },
});
