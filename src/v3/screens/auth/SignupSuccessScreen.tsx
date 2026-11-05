import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { QrCode, Smartphone } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3, img } from '../../assets';
import { Page } from '../../components/Layout';
import { Button } from '../../components/Button';
import { RankBadge } from '../../components/RankBadge';
import { formatMobile } from '../../api/auth';
import { firstName, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// A1-09 Sign up · success (17:11520) → B1-01 Scan, or A2-01a welcome.
export function SignupSuccessScreen({ navigation }: V3ScreenProps<'SignupSuccess'>) {
  const { user } = useV3();
  return (
    <Page
      footer={
        <>
          <Button
            label="Scan first coupon"
            icon={QrCode}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Tabs', params: { screen: 'Scan' } }] })}
          />
          <Button label="Go to Home" variant="plain" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })} />
        </>
      }
    >
      <View style={styles.art}>
        <View style={styles.glow} />
        <Animated.Image entering={ZoomIn.springify().damping(12)} source={img.workerCheer} style={styles.worker} resizeMode="contain" />
        <Animated.Image entering={ZoomIn.delay(250)} source={d3.partyPopper} style={styles.popper} />
      </View>
      <Animated.View entering={FadeInUp.delay(150)} style={styles.copy}>
        <Text style={styles.title}>You're all set, {firstName(user?.name) || 'friend'}!</Text>
        <Text style={[t.subtitle14, styles.center, { color: c.textSecondary }]}>
          Scan the coupon from a GoMax pack to start earning points
        </Text>
        <View style={{ alignSelf: 'center' }}>
          <RankBadge rank="naya-saathi" />
        </View>
      </Animated.View>
      <View style={styles.loginId}>
        <Smartphone size={20} color={c.textSecondary} strokeWidth={1.75} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[t.cap12, { color: c.textSecondary }]}>Your Login ID</Text>
          <Text style={[t.body15Semibold, { color: c.textPrimary }]}>+91 {formatMobile(user?.mobile ?? '')}</Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  art: { height: 300, marginTop: 22, alignItems: 'center' },
  glow: { position: 'absolute', top: 44, width: 260, height: 260, borderRadius: 999, backgroundColor: c.primary50 },
  worker: { position: 'absolute', top: 64, width: 170, height: 227, marginLeft: -10 },
  popper: { position: 'absolute', top: 54, width: 77, height: 77, marginLeft: 207 },
  copy: { gap: 10, marginTop: 18 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 28, lineHeight: 34, letterSpacing: -0.56, color: c.navy700, textAlign: 'center' },
  center: { textAlign: 'center' },
  loginId: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: c.surfaceMuted,
  },
});
