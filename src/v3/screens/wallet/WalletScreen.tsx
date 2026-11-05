import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { BadgeCheck, CircleCheck, CircleHelp, Coins, Gift, Info, Package, QrCode, Sparkles } from 'lucide-react-native';
import { c, t, HELPLINE_TEL } from '../../theme';
import { d3 } from '../../assets';
import { Button } from '../../components/Button';
import { Sheet } from '../../components/Sheet';
import { LinkText } from '../../components/Layout';
import { LedgerList } from '../../components/LedgerList';
import { GIFTS, Gift as GiftT, listOrders, recentPoints } from '../../api/wallet';
import { WITHDRAW_MIN, fmt, useV3 } from '../../state/Store';
import { V3ScreenProps, useV3Nav } from '../../navigation/types';

type Tab = 'points' | 'runs';

// B2-01 points · under 500 · B2-03 points · ready (500+) · B2-04 runs tab
// (17:17874 / 18024 / 18096). One screen, two tabs.
export function WalletScreen() {
  const nav = useV3Nav();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>(route.params?.tab ?? 'points');
  useEffect(() => {
    if (route.params?.tab) setTab(route.params.tab);
  }, [route.params?.tab]);

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[c.navy900, c.navy700]} style={[styles.navy, { paddingTop: insets.top }]}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.title}>Wallet</Text>
              <Text style={[t.sec13, { color: '#fff' }]}>Your points and money</Text>
            </View>
            <Pressable style={styles.glass} onPress={() => nav.navigate('WithdrawInfoSheet')} accessibilityLabel="Help">
              <CircleHelp size={20} color="#fff" strokeWidth={1.75} />
            </Pressable>
          </View>
          <View style={styles.tabs}>
            {(['points', 'runs'] as Tab[]).map((k) => {
              const on = tab === k;
              const Icon = k === 'points' ? Coins : Gift;
              return (
                <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, on && { backgroundColor: '#fff' }]}>
                  <Icon size={16} color={on ? c.navy900 : '#fff'} strokeWidth={2} />
                  <Text style={[t.sec13Semibold, { color: on ? c.navy900 : '#fff' }]}>{k === 'points' ? 'Points' : 'Runs'}</Text>
                </Pressable>
              );
            })}
          </View>
          {tab === 'points' ? <PointsCard /> : <RunsCard />}
          <View style={{ height: 50 }} />
        </LinearGradient>
        <View style={styles.sheet}>{tab === 'points' ? <PointsHistory /> : <GiftChart />}</View>
      </ScrollView>
    </View>
  );
}

function PointsCard() {
  const nav = useV3Nav();
  const { account } = useV3();
  const ready = account.points >= WITHDRAW_MIN;

  if (!ready) {
    return (
      <View style={styles.pointsCard}>
        <Text style={[t.cap12Semibold, { color: c.primary500, letterSpacing: 2.16 }]}>POINTS</Text>
        <Big value={account.points} unit={`pts = ₹${fmt(account.points)}`} />
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${(account.points / WITHDRAW_MIN) * 100}%` }]} />
        </View>
        <Text style={[t.sec13Medium, { color: '#fff' }]}>{fmt(WITHDRAW_MIN - account.points)} more pts to reach 500</Text>
        <Button label="Withdraw" disabled onPress={() => nav.navigate('WithdrawInfoSheet')} />
        <Pressable style={styles.inline} onPress={() => nav.navigate('WithdrawInfoSheet')}>
          <Info size={14} color="#fff" strokeWidth={2} />
          <Text style={[t.cap12Medium, { color: '#fff' }]}>Withdraw opens at 500 pts. Keep scanning!</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0b6b3a', '#16a35a']} locations={[0.146, 0.854]} start={{ x: 0.8, y: 0 }} end={{ x: 0.2, y: 1 }} style={styles.readyCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[t.cap12Semibold, { color: '#fff', letterSpacing: 2.16, flex: 1 }]}>POINTS</Text>
        <View style={styles.glassPill}>
          <CircleCheck size={14} color="#fff" strokeWidth={2} />
          <Text style={[t.cap12Medium, { color: '#fff' }]}>Ready to withdraw</Text>
        </View>
      </View>
      <Big value={account.points} unit={`pts = ₹${fmt(account.points)}`} />
      {account.upi ? (
        <View style={styles.upiRow}>
          <BadgeCheck size={18} color="#fff" strokeWidth={2} />
          <Text style={[t.sec13Semibold, { color: '#fff', flex: 1 }]} numberOfLines={1}>
            {account.upi.id} · {account.upi.name}
          </Text>
          <Pressable onPress={() => nav.navigate('AddUpi')} hitSlop={8}>
            <Text style={[t.cap12Medium, { color: '#fff' }]}>Change</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.upiRow} onPress={() => nav.navigate('PanUpiOverview')}>
          <Info size={18} color="#fff" strokeWidth={2} />
          <Text style={[t.sec13Semibold, { color: '#fff', flex: 1 }]}>Link PAN & UPI to withdraw</Text>
        </Pressable>
      )}
      <Pressable style={styles.whiteBtn} onPress={() => nav.navigate(account.upi ? 'Withdraw' : 'PanUpiOverview')}>
        <Text style={[t.button15, { color: c.successText }]}>Withdraw ₹{fmt(account.points)}</Text>
      </Pressable>
    </LinearGradient>
  );
}

function RunsCard() {
  const nav = useV3Nav();
  const { account } = useV3();
  const [orders, setOrders] = useState(0);
  useEffect(() => {
    listOrders().then((o) => setOrders(o.length));
  }, []);
  const affordable = GIFTS.filter((g) => g.runs <= account.runs).length;
  return (
    <LinearGradient colors={['#0b5560', '#0f8a8f']} locations={[0.146, 0.854]} start={{ x: 0.78, y: 0 }} end={{ x: 0.22, y: 1 }} style={styles.readyCard}>
      <Text style={[t.cap12Semibold, { color: '#fff', letterSpacing: 2.16 }]}>RUNS</Text>
      <Big value={account.runs} unit="runs" />
      <Text style={[t.sec13Medium, { color: '#fff' }]}>
        {affordable > 0 ? `You can get ${affordable} gift${affordable > 1 ? 's' : ''} now 🎉` : 'Earn runs from games to get gifts'}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable style={styles.glassBtn} onPress={() => nav.navigate('ChallengesHome')}>
          <Sparkles size={18} color="#fff" strokeWidth={2} />
          <Text style={[t.button15, { color: '#fff' }]}>Earn runs</Text>
        </Pressable>
        <Pressable style={styles.glassBtn} onPress={() => nav.navigate('MyGifts')}>
          <Package size={18} color="#fff" strokeWidth={2} />
          <Text style={[t.button15, { color: '#fff' }]}>My gifts · {orders}</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function Big({ value, unit }: { value: number; unit: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
      <Text style={styles.big}>{fmt(value)}</Text>
      <Text style={[t.body15Medium, { color: '#fff', marginBottom: 6 }]}>{unit}</Text>
    </View>
  );
}

function PointsHistory() {
  const nav = useV3Nav();
  return (
    <>
      <View style={styles.sheetHead}>
        <Text style={[t.section15, { color: c.textPrimary, flex: 1 }]}>History</Text>
        <Pressable onPress={() => nav.navigate('HistoryAll', { wallet: 'points' })} hitSlop={8}>
          <Text style={[t.sec13Semibold, { color: c.primary700 }]}>See all</Text>
        </Pressable>
      </View>
      <LedgerList rows={recentPoints()} round onRowPress={(r) => r.kind === 'withdraw' && nav.navigate('WithdrawPaid', { id: 'W-3001' })} />
    </>
  );
}

function GiftChart() {
  const { width } = useWindowDimensions();
  const cardW = (Math.min(width, 520) - 40 - 12) / 2;
  return (
    <>
      <View style={styles.sheetHead}>
        <Text style={[t.section15, { color: c.textPrimary, flex: 1 }]}>Gift chart</Text>
        <Text style={[t.sec13Semibold, { color: c.primary700 }]}>Low to high</Text>
      </View>
      <View style={styles.grid}>
        {[...GIFTS].sort((a, b) => a.runs - b.runs).map((g) => (
          <GiftCard key={g.id} gift={g} width={cardW} />
        ))}
      </View>
    </>
  );
}

export function GiftCard({ gift, width }: { gift: GiftT; width: number }) {
  const nav = useV3Nav();
  const { account } = useV3();
  const enough = account.runs >= gift.runs;
  const open = () => nav.navigate('GiftDetail', { giftId: gift.id });
  return (
    <Pressable onPress={open} style={[styles.gift, { width }, !gift.inStock && { opacity: 0.5 }]}>
      <View style={styles.giftPh}>
        {gift.photo ? (
          <Image source={gift.photo} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: c.primary50, alignItems: 'center', justifyContent: 'center' }]}>
            <Image source={gift.art} style={{ width: 90, height: 90 }} />
          </View>
        )}
      </View>
      <View style={styles.giftB}>
        <Text style={[t.body15Medium, { color: c.textPrimary }]}>{gift.name}</Text>
        <View style={styles.runsTag}>
          <Image source={d3.wrappedGift} style={{ width: 16, height: 16 }} />
          <Text style={[t.sec13Semibold, { color: c.runs }]}>{fmt(gift.runs)} runs</Text>
        </View>
        {!gift.inStock ? (
          <Text style={[t.cap12Medium, { color: c.textMuted }]}>Out of stock</Text>
        ) : enough ? (
          <Pressable style={styles.get} onPress={open}>
            <Text style={[t.button15, { color: '#fff' }]}>Get</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${(account.runs / gift.runs) * 100}%` }]} />
            </View>
            <Text style={[t.cap12Medium, { color: c.warningText }]}>{fmt(gift.runs - account.runs)} runs more</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

// B2-02 Wallet · why Withdraw is off (sheet) (17:18003)
export function WithdrawInfoSheet({ navigation }: V3ScreenProps<'WithdrawInfoSheet'>) {
  const { account } = useV3();
  const short = Math.max(0, WITHDRAW_MIN - account.points);
  return (
    <Sheet
      result
      scroll={false}
      footer={
        <>
          <Button label="Scan a coupon" icon={QrCode} onPress={() => navigation.navigate('Tabs', { screen: 'Scan' })} />
          <LinkText color={c.primary700} onPress={() => Linking.openURL(`tel:${HELPLINE_TEL}`)}>
            Call GoMax helpline
          </LinkText>
        </>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Image source={d3.locked} style={{ width: 36, height: 36 }} />
        <View style={{ gap: 2 }}>
          <Text style={[t.title18, { color: c.textPrimary }]}>{short > 0 ? 'Why is Withdraw off?' : 'Withdraw is on'}</Text>
          <Text style={[t.sec13, { color: c.textSecondary }]}>GoMax Help</Text>
        </View>
      </View>
      <View style={styles.bubble}>
        <Text style={[t.body15, { color: c.textPrimary }]}>
          You have {fmt(account.points)} pts. Withdraw opens at 500 pts (1 pt = ₹1).
        </Text>
      </View>
      <View style={styles.bubble}>
        <Text style={[t.body15, { color: c.textPrimary }]}>
          {short > 0
            ? `Scan ${fmt(short)} more pts of coupons. Your Withdraw button turns on by itself.`
            : 'You can withdraw now from the Wallet. Money reaches your UPI in 24–48 hrs.'}
        </Text>
      </View>
      <View style={{ gap: 6 }}>
        <View style={[styles.bar, { backgroundColor: c.border }]}>
          <View style={[styles.barFill, { backgroundColor: c.primary700, width: `${Math.min(1, account.points / WITHDRAW_MIN) * 100}%` }]} />
        </View>
        <Text style={[t.cap12Medium, { color: c.textSecondary }]}>
          {fmt(Math.min(account.points, WITHDRAW_MIN))} / 500 pts
        </Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  navy: { paddingHorizontal: 20, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: '#fff' },
  glass: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)' },
  tab: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 11 },
  pointsCard: { backgroundColor: '#13243d', borderWidth: 1.5, borderColor: c.primary500, borderRadius: 20, padding: 18, gap: 10 },
  readyCard: { borderRadius: 20, padding: 18, gap: 10 },
  big: { fontFamily: 'Inter_700Bold', fontSize: 52, lineHeight: 56, letterSpacing: -1.04, color: '#fff' },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: c.primary500 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  glassPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)' },
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.16)' },
  whiteBtn: { height: 48, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  glassBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  sheet: { marginTop: -33, backgroundColor: c.surfaceCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20, gap: 12 },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gift: { borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard, overflow: 'hidden', gap: 8 },
  giftPh: { height: 130, backgroundColor: c.surfaceMuted },
  giftB: { paddingHorizontal: 12, paddingBottom: 12, gap: 6 },
  runsTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  get: { height: 36, borderRadius: 10, backgroundColor: c.primary700, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: c.surfaceMuted, overflow: 'hidden' },
  trackFill: { height: 6, borderRadius: 3, backgroundColor: c.runs },
  bubble: { alignSelf: 'flex-start', maxWidth: 260, backgroundColor: c.surfaceMuted, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
});
