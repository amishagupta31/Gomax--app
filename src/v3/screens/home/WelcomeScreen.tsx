import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { ArrowRight } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3, img } from '../../assets';
import { Glow } from '../../components/Glow';
import { Button } from '../../components/Button';
import { firstName, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// A2-01a K1 fade in → A2-01b K2 worker pops → A2-01c K3 settle
// (17:16784 / 16790 / 15634). Shown on first open only; then → A2-02.
const CONFETTI = [
  { x: 13, y: 83, w: 10.4, h: 6.3, r: 0, c: 'rgba(246,195,68,0.9)' },
  { x: 6, y: 265, w: 6.3, h: 12.5, r: -37, c: 'rgba(224,113,77,0.9)' },
  { x: 110, y: 287, w: 6.3, h: 12.5, r: -74, c: 'rgba(255,255,255,0.9)' },
  { x: 344, y: 245, w: 10.4, h: 6.3, r: -42, c: 'rgba(224,113,77,0.9)' },
  { x: 146, y: 107, w: 10.4, h: 6.3, r: -153, c: 'rgba(255,154,118,0.9)' },
  { x: 282, y: 150, w: 6.3, h: 12.5, r: -10, c: 'rgba(246,195,68,0.9)' },
  { x: 266, y: 315, w: 6.3, h: 12.5, r: -47, c: 'rgba(224,113,77,0.9)' },
  { x: 19, y: 72, w: 6.3, h: 12.5, r: -121, c: 'rgba(15,139,126,0.9)' },
  { x: 10, y: 256, w: 6.3, h: 12.5, r: -158, c: 'rgba(255,154,118,0.9)' },
  { x: 119, y: 291, w: 10.4, h: 6.3, r: -15, c: 'rgba(246,195,68,0.9)' },
];

export function WelcomeScreen({ navigation }: V3ScreenProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
  const { user, patchAccount } = useV3();
  const name = firstName(user?.name) || 'Ram';

  // K2: worker pops up from the podium, K3: settles with a gentle bob
  const pop = useSharedValue(0);
  const bob = useSharedValue(0);
  useEffect(() => {
    pop.value = withDelay(350, withSpring(1, { damping: 9, stiffness: 120 }));
    bob.value = withDelay(
      1400,
      withRepeat(withSequence(withTiming(-6, { duration: 1200, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })), -1),
    );
  }, [pop, bob]);
  const worker = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.5),
    transform: [{ translateY: (1 - pop.value) * 80 + bob.value }, { scale: 0.7 + pop.value * 0.3 }],
  }));

  const start = () => {
    patchAccount({ firstTimeDone: false, firstTimeCard: 0 });
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  const top = insets.top - 44; // Figma frames include a 44px status bar

  return (
    <Pressable style={styles.root} onPress={start}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1b3560', '#0a1628']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />

      <Animated.View entering={FadeIn.duration(500)} style={[StyleSheet.absoluteFill, { top }]}>
        <Glow width={480} height={480} opacity={0.2} style={{ position: 'absolute', left: '50%', marginLeft: -240, top: 50 }} />
        {/* glass podium + gold ring (Group 3) */}
        <View style={[styles.podium]}>
          <Svg width={300} height={88} viewBox="0 0 300 88">
            <Ellipse cx={150} cy={54} rx={110} ry={20} fill="black" fillOpacity={0.3} />
            <Ellipse cx={150} cy={40} rx={120} ry={28} fill="white" fillOpacity={0.12} />
            <Ellipse cx={150} cy={40} rx={119} ry={27} stroke="white" strokeOpacity={0.5} strokeWidth={1.5} fill="none" />
            <Path
              d="M150 1C191.36 1 228.77 5.47 255.81 12.68C269.34 16.29 280.21 20.57 287.68 25.28C295.2 30.02 299 35.02 299 40C299 44.98 295.2 49.98 287.68 54.72C280.21 59.43 269.34 63.71 255.81 67.32C228.77 74.53 191.36 79 150 79C108.64 79 71.23 74.53 44.19 67.32C30.66 63.71 19.79 59.43 12.32 54.72C4.8 49.98 1 44.98 1 40C1 35.02 4.8 30.02 12.32 25.28C19.79 20.57 30.66 16.29 44.19 12.68C71.23 5.47 108.64 1 150 1Z"
              stroke="#F6C344"
              strokeOpacity={0.25}
              strokeWidth={2}
              fill="none"
            />
          </Svg>
        </View>
        <Glow width={190} height={46} color="#000000" opacity={0.35} style={styles.floor} />

        <Animated.View style={[styles.worker, worker]}>
          <Image source={img.worker3d} style={{ width: 230, height: 307 }} resizeMode="contain" />
        </Animated.View>

        <Animated.Image entering={ZoomIn.delay(700)} source={d3.partyPopper} style={[styles.abs, { left: 29, top: 110, width: 40, height: 40 }]} />
        <Animated.Image entering={ZoomIn.delay(800)} source={d3.sparkles} style={[styles.abs, { right: 46, top: 96, width: 34, height: 34 }]} />
        <Animated.Image entering={ZoomIn.delay(850)} source={d3.coin} style={[styles.abs, { right: 32, top: 300, width: 28, height: 28 }]} />
        <Animated.Image entering={ZoomIn.delay(900)} source={d3.ticket} style={[styles.abs, { right: 64, top: 420, width: 34, height: 34 }]} />
        <Animated.Image entering={ZoomIn.delay(750)} source={d3.coin} style={[styles.abs, { left: 88, top: 90, width: 22, height: 22 }]} />
        <Animated.Image entering={ZoomIn.delay(950)} source={d3.sparkles} style={[styles.abs, { left: 44, top: 195, width: 26, height: 26 }]} />
        <Animated.Image entering={FadeIn.delay(900)} source={d3.coin} style={[styles.abs, { left: -12, top: 405, width: 49, height: 49, opacity: 0.85 }]} blurRadius={1.75} />
        {CONFETTI.map((p, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.delay(1000 + i * 40).springify()}
            style={[styles.abs, { left: p.x, top: p.y, width: p.w, height: p.h, borderRadius: 2, backgroundColor: p.c, transform: [{ rotate: `${p.r}deg` }] }]}
          />
        ))}
      </Animated.View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 20) + 15 }]}>
        <Animated.View entering={FadeInDown.delay(1100).duration(500)} style={styles.text}>
          <Text style={styles.title}>Welcome to GoMax, {name}!</Text>
          <Text style={[t.sec13, { color: '#c9d4e6', textAlign: 'center' }]}>Your journey starts here</Text>
          <View style={styles.steps}>
            <Step src={d3.ticket} label="Scan" />
            <ArrowRight size={14} color="#9fb0c8" strokeWidth={2} />
            <Step src={d3.coin} label="Points" />
            <ArrowRight size={14} color="#9fb0c8" strokeWidth={2} />
            <Step src={d3.creditCard} label="Cash" />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(1400)} style={{ alignSelf: 'stretch', marginTop: 56 }}>
          <Button label="Let's start" onPress={start} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

function Step({ src, label }: { src: number; label: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={styles.stepIcon}>
        <Image source={src} style={{ width: 28, height: 28 }} />
      </View>
      <Text style={[t.cap12Medium, { color: '#fff' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.navy900 },
  abs: { position: 'absolute' },
  podium: { position: 'absolute', top: 328, left: '50%', marginLeft: -150 },
  floor: { position: 'absolute', top: 408, left: '50%', marginLeft: -95 },
  worker: { position: 'absolute', top: 113, left: '50%', marginLeft: -115 },
  bottom: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20 },
  text: { gap: 8, alignItems: 'center', width: 320 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 28, letterSpacing: -0.22, color: '#fff', textAlign: 'center' },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 284, marginTop: 8 },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
