import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { CircleCheck, Coins, FileText, QrCode, ShieldCheck, Ticket, TriangleAlert, WifiOff, X } from 'lucide-react-native';
import { c, t, HELPLINE_TEL } from '../../theme';
import { d3 } from '../../assets';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { LinkText } from '../../components/Layout';
import { normalizeCode } from '../../api/coupons';
import { fmt, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// B1-03a/b success · B1-03c scratch card · B1-03d gift · B1-04 already used ·
// B1-05 not a GoMax coupon · B1-06 saved offline (sheets 17:12127 / 12186 /
// 12669 / 12724 / 12245 / 12297 / 12342).
export function ScanResultSheet({ navigation, route }: V3ScreenProps<'ScanResult'>) {
  const { outcome, code, value = 0, usedAt } = route.params;
  const { account } = useV3();
  const scanNext = () => navigation.goBack();
  const myScans = () => navigation.replace('MyScans');

  if (outcome === 'added') {
    const n = Math.min(account.todayCoupons, 10);
    return (
      <Sheet result scroll={false} footer={<><Button label="Scan next coupon" onPress={scanNext} /><LinkText onPress={myScans}>See My scans</LinkText></>}>
        <Head art={d3.partyPopper} artSize={44}>
          <Text style={[t.display36, { color: c.successText, textAlign: 'center' }]}>+{value} pts added</Text>
        </Head>
        <View style={{ gap: 16, alignItems: 'center' }}>
          <CouponCard big={`${value} pts`} small="Coupon value" />
          <Text style={[t.sec13, { color: c.textSecondary }]}>New balance: {fmt(account.points)} pts</Text>
          <View style={styles.progressRuns}>
            <View style={styles.progRow}>
              <Image source={d3.wrappedGift} style={{ width: 22, height: 22 }} />
              <Text style={[t.sec13Medium, { color: c.textPrimary, flex: 1 }]}>
                {n} of 10 coupons today. {10 - n} more for a scratch card!
              </Text>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${n * 10}%`, backgroundColor: c.runs }]} />
            </View>
          </View>
        </View>
      </Sheet>
    );
  }

  if (outcome === 'scratch' || outcome === 'gift') {
    const gift = outcome === 'gift';
    return (
      <Sheet
        result
        scroll={false}
        footer={
          <>
            <Button
              label={gift ? 'Get Tool kit' : 'Scratch now'}
              onPress={() => (gift ? navigation.replace('GiftDetail', { giftId: 'toolkit' }) : navigation.replace('ScratchEarned'))}
            />
            <LinkText onPress={scanNext}>Scan next coupon</LinkText>
          </>
        }
      >
        <Head art={d3.partyPopper} artSize={44}>
          <Text style={styles.h28}>{gift ? 'Gift unlocked!' : 'Scratch card unlocked!'}</Text>
          <Text style={[t.sec13Medium, { color: c.successText, textAlign: 'center' }]}>
            +{value} pts added · New balance: {fmt(account.points)} pts
          </Text>
        </Head>
        <View style={{ gap: 16 }}>
          <View style={styles.reward}>
            <Animated.Image entering={ZoomIn.springify().damping(10)} source={gift ? d3.toolbox : d3.wrappedGift} style={{ width: 64, height: 64 }} />
            <Text style={[t.section15, { color: c.textPrimary, textAlign: 'center' }]}>{gift ? 'You can now get Tool kit' : 'Scratch card'}</Text>
            <Text style={[t.sec13, { color: c.textSecondary, textAlign: 'center' }]}>
              {gift ? 'Your runs reached the Tool kit gift.' : 'You scanned 10 coupons today. Scratch to see your reward.'}
            </Text>
          </View>
          {gift ? null : (
            <View style={styles.progressDone}>
              <View style={styles.progRow}>
                <CircleCheck size={16} color={c.successText} strokeWidth={2} />
                <Text style={[t.sec13Medium, { color: c.successText }]}>10 of 10 coupons today</Text>
              </View>
              <View style={[styles.bar, { backgroundColor: c.success }]} />
            </View>
          )}
        </View>
      </Sheet>
    );
  }

  if (outcome === 'used') {
    const when = usedAt
      ? new Date(Number.isNaN(Number(usedAt)) ? usedAt : Number(usedAt)).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?(am|pm)/i, (m) => ` ${m.trim().toLowerCase()}`)
      : '';
    return (
      <Sheet
        result
        scroll={false}
        footer={
          <>
            <Button label="Scan next coupon" onPress={scanNext} />
            <LinkText onPress={() => Linking.openURL(`tel:${HELPLINE_TEL}`)}>Think this is wrong? Get help</LinkText>
          </>
        }
      >
        <Head art={d3.warning} artSize={56}>
          <Text style={styles.h22}>Coupon already used</Text>
          <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>
            Each coupon works only once. This one was scanned on {when}.
          </Text>
        </Head>
        <View style={{ alignItems: 'center' }}>
          <CouponCard big="Used" small={normalizeCode(code)} />
        </View>
      </Sheet>
    );
  }

  if (outcome === 'invalid') {
    return (
      <Sheet
        result
        scroll={false}
        footer={
          <>
            <Button label="Try again" onPress={scanNext} />
            <Button label="Type the code" variant="primaryOutline" onPress={() => navigation.navigate('Tabs', { screen: 'Scan', params: { manual: true } })} />
          </>
        }
      >
        <Head art={d3.crossMark} artSize={56}>
          <Text style={styles.h22}>Not a GoMax coupon</Text>
          <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>
            We could not find this code. Check the coupon and try again.
          </Text>
        </Head>
      </Sheet>
    );
  }

  // offline
  return (
    <Sheet result scroll={false} footer={<><Button label="Scan next coupon" onPress={scanNext} /><LinkText onPress={myScans}>See My scans</LinkText></>}>
      <Head art={d3.hourglass} artSize={56}>
        <Text style={styles.h22}>Coupon saved</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>
          No internet right now. Points will be added when you are back online.
        </Text>
      </Head>
      <View style={{ alignItems: 'center' }}>
        <View style={styles.warnPill}>
          <WifiOff size={14} color={c.warningText} strokeWidth={2} />
          <Text style={[t.sec13Semibold, { color: c.warningText }]}>1 coupon waiting</Text>
        </View>
      </View>
    </Sheet>
  );
}

function Head({ art, artSize, children }: { art: number; artSize: number; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8, alignItems: 'center' }}>
      <Animated.Image entering={ZoomIn.springify()} source={art} style={{ width: artSize, height: artSize }} />
      {children}
    </View>
  );
}

function CouponCard({ big, small }: { big: string; small: string }) {
  return (
    <View style={styles.coupon}>
      <View style={styles.couponL}>
        <QrCode size={40} color={c.navy900} strokeWidth={1.5} />
      </View>
      <View style={styles.couponR}>
        <Text style={[t.cap12Semibold, { color: c.primary700, letterSpacing: 2.16 }]}>COUPON</Text>
        <Text style={styles.couponBig}>{big}</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>{small}</Text>
      </View>
    </View>
  );
}

// B1-02b Scan · Terms & conditions sheet (17:12774)
export function ScanTermsSheet({ navigation }: V3ScreenProps<'ScanTerms'>) {
  const points = [
    { icon: Ticket, text: 'One coupon can be scanned only once.' },
    { icon: TriangleAlert, text: 'If the coupon code is damaged or destroyed, GoMax is not responsible.' },
    { icon: Coins, text: 'The points value of each coupon is set by GoMax.' },
    { icon: ShieldCheck, text: 'Misuse or fake scans will get your account blocked.' },
  ];
  return (
    <Sheet result scroll={false} footer={<Button label="OK, got it" onPress={() => navigation.goBack()} />}>
      <View style={styles.termsHead}>
        <FileText size={20} color={c.textPrimary} strokeWidth={1.75} />
        <Text style={[t.title18, { color: c.textPrimary, flex: 1 }]}>Terms & conditions</Text>
        <Pressable style={styles.closeDot} onPress={() => navigation.goBack()} accessibilityLabel="Close">
          <X size={16} color={c.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>
      <View style={styles.termsCard}>
        {points.map(({ icon: Icon, text }, i) => (
          <View key={text}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.termRow}>
              <View style={styles.termIcon}>
                <Icon size={16} color={c.primary700} strokeWidth={2} />
              </View>
              <Text style={[t.sec13, { color: c.textPrimary, flex: 1 }]}>{text}</Text>
            </View>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  h28: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34, letterSpacing: -0.42, color: c.navy900, textAlign: 'center' },
  h22: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 24, letterSpacing: -0.11, color: c.textPrimary, textAlign: 'center' },
  coupon: {
    width: 280,
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.primary500,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  couponL: { width: 96, backgroundColor: c.primary50, alignItems: 'center', justifyContent: 'center' },
  couponR: { flex: 1, padding: 16, gap: 2 },
  couponBig: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: c.navy900 },
  progressRuns: { alignSelf: 'stretch', gap: 8, padding: 12, borderRadius: 16, backgroundColor: c.runs50 },
  progressDone: { gap: 8, padding: 12, borderRadius: 12, backgroundColor: c.success50 },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#fff', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  reward: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.primary100,
    backgroundColor: c.primary50,
  },
  warnPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.warning50 },
  termsHead: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40 },
  closeDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  termsCard: { borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  termIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary50, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, marginHorizontal: 16, backgroundColor: c.border },
});
