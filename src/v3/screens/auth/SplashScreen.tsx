import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { img } from '../../assets';
import { c } from '../../theme';
import { V3ScreenProps } from '../../navigation/types';

// A1-01 Splash (17:11436). Tap anywhere, or wait, → A1-02 Login.
export function SplashScreen({ navigation }: V3ScreenProps<'Splash'>) {
  useEffect(() => {
    const id = setTimeout(() => navigation.replace('Login'), 1800);
    return () => clearTimeout(id);
  }, [navigation]);

  return (
    <Pressable style={styles.flex} onPress={() => navigation.replace('Login')}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', c.navyDeep]}
        locations={[0.019, 0.749]}
        start={{ x: 0.34, y: 0 }}
        end={{ x: 0.66, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* soft-glow: #C05336 @16%, 230 radius, heavy blur */}
      <View style={styles.glow} pointerEvents="none">
        <Svg width={641} height={641}>
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#C05336" stopOpacity={0.16} />
              <Stop offset="0.62" stopColor="#C05336" stopOpacity={0.12} />
              <Stop offset="1" stopColor="#C05336" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={320.5} cy={320.5} r={320.5} fill="url(#g)" />
        </Svg>
      </View>
      <View style={styles.center}>
        <View style={{ flex: 300 }} />
        <Animated.Image
          entering={FadeIn.duration(600)}
          source={img.logoFullOrange}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={{ flex: 410 }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
  glow: { position: 'absolute', top: '4%', left: '50%', marginLeft: -320.5 },
  center: { flex: 1, alignItems: 'center' },
  logo: { width: 240, height: 90 },
});
