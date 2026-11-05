import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CircleHelp, Clock, History, QrCode, Sparkles } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3 } from '../../assets';
import { Button } from '../../components/Button';
import { LinkText } from '../../components/Layout';
import { Sheet } from '../../components/Sheet';
import { SpinWheel, WHEEL_SEGMENTS, WheelSegment } from '../../components/SpinWheel';
import { SPINS_BY_RANK, hms, logGame, secondsToMidnight, segmentFor, spin } from '../../api/games';
import { rankFor } from '../../data/ranks';
import { fmt, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// C2-01 wheel: same component as the Home tile, but the "Scratch card"
// segment reads "20 runs" (clockwise: 10 · 20 · 5 · 50 · 10 · 100 · 5 · 20).
const BIG_SEGMENTS: WheelSegment[] = WHEEL_SEGMENTS.map((s, i) => (i === 7 ? { ...s, value: '20', unit: 'runs' } : s));
const BASE = 138.889;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

export function useCountdown() {
  const [left, setLeft] = useState(secondsToMidnight());
  useEffect(() => {
    const id = setInterval(() => setLeft(secondsToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  return hms(left);
}

// C2-01 Spin the wheel · C2-03 No spins left (17:13467 / 17:13528)
export function SpinWheelScreen({ navigation, route }: V3ScreenProps<'SpinWheel' | 'SpinNoneLeft'>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { account, patchAccount } = useV3();
  const total = SPINS_BY_RANK[rankFor(account.lifetimePoints)];
  const left = Math.min(account.spinsLeft, total);
  const locked = route.name === 'SpinNoneLeft' || left <= 0;
  const countdown = useCountdown();

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const raf = useRef<number | null>(null);
  useEffect(() => () => void (raf.current != null && cancelAnimationFrame(raf.current)), []);

  // Wheel frame is 324 wide in Figma (rim + 12px pad each side).
  const wheelW = Math.min(324, width - 36);
  const size = (wheelW / 170.296) * BASE;
  const s = size / BASE;
  const rimR = 73.148 * s;

  const onSpin = async () => {
    if (spinning) return;
    if (left <= 0) return navigation.replace('SpinNoneLeft');
    setSpinning(true);
    const prize = await spin(); // server decides — the wheel only lands on it
    const idx = segmentFor(prize);
    const from = rotation % 360;
    const target = 360 * 5 + ((((-idx * 45 - from) % 360) + 360) % 360);
    const start = Date.now();
    const dur = 4200;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setRotation(from + target * easeOut(p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else {
        setSpinning(false);
        patchAccount({ spinsLeft: left - 1, runs: account.runs + prize.amount });
        logGame({ kind: 'spin', title: 'Spin the wheel', sub: 'Just now', prize });
        navigation.navigate('SpinResult', { prize: String(prize.amount) });
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#05080f', c.navy900, '#0f2a4e']} locations={[0, 0.35, 0.6]} style={StyleSheet.absoluteFill} />
      <View style={{ paddingTop: insets.top }}>
        <View style={styles.bar}>
          <Pressable style={styles.glass} onPress={() => navigation.goBack()} accessibilityLabel="Back">
            <ArrowLeft size={20} color="#fff" strokeWidth={2} />
          </Pressable>
          <Text style={[t.title18, styles.barTitle]}>Spin the wheel</Text>
          {locked ? (
            <View style={styles.glass0} />
          ) : (
            <Pressable style={styles.glass} onPress={() => navigation.navigate('GamesHistory')} accessibilityLabel="Games history">
              <History size={20} color="#fff" strokeWidth={2} />
            </Pressable>
          )}
          <Pressable style={styles.glass} onPress={() => navigation.navigate('GameRules', { kind: 'spin' })} accessibilityLabel="Rules">
            <CircleHelp size={20} color="#fff" strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.spins}>
          <Text style={[t.cap12Semibold, { color: c.primary500, letterSpacing: 2.16 }]}>TODAY&apos;S SPINS</Text>
          <View style={styles.pips}>
            {Array.from({ length: total }, (_, i) => {
              const used = !locked && i < total - left;
              return <View key={i} style={[styles.pip, used ? styles.pipUsed : styles.pipLeft]} />;
            })}
          </View>
          <Text style={[t.title18, { color: '#fff' }]}>{locked ? 'No spins left today' : `${left} of ${total} spins left`}</Text>
        </View>
      </View>

      <View style={[styles.wheelWrap, { marginTop: 22 }]}>
        <SpinWheel size={size} rotation={rotation} segments={BIG_SEGMENTS} hideHub={locked} />
        {locked ? (
          <>
            <View
              pointerEvents="none"
              style={[styles.dim, { width: rimR * 2, height: rimR * 2, borderRadius: rimR, top: wheelW / 2 - rimR, left: wheelW / 2 - rimR }]}
            />
            <View style={[styles.lockHub, { top: wheelW / 2 - 34, left: wheelW / 2 - 34 }]}>
              <Image source={d3.locked} style={{ width: 52, height: 52 }} />
            </View>
          </>
        ) : (
          <Pressable
            onPress={onSpin}
            accessibilityLabel="Spin"
            style={{ position: 'absolute', width: 70, height: 70, top: wheelW / 2 - 35, left: wheelW / 2 - 35, borderRadius: 35 }}
          />
        )}
      </View>

      <View style={[styles.sheet, { marginTop: -(wheelW * 0.205), paddingTop: wheelW * 0.205 + 20, paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        {locked ? (
          <>
            <View style={[styles.proof, { backgroundColor: c.surfaceMuted }]}>
              <Clock size={14} color={c.textSecondary} strokeWidth={2} />
              <Text style={[t.cap12Medium, { color: c.textSecondary }]}>New spins in {countdown}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.meanwhile}>
              <Image source={d3.coin} style={{ width: 40, height: 40 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[t.body15Semibold, { color: c.textPrimary }]}>Meanwhile, scan a coupon</Text>
                <Text style={[t.cap12, { color: c.textSecondary }]}>Earn points and finish your challenges</Text>
              </View>
            </View>
            <View style={{ gap: 4, marginTop: 16 }}>
              <Button label="Scan now" icon={QrCode} onPress={() => navigation.navigate('Tabs', { screen: 'Scan' })} />
              <LinkText onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>Back to Home</LinkText>
            </View>
          </>
        ) : (
          <>
            <View style={styles.proof}>
              <Sparkles size={14} color={c.primary700} strokeWidth={2} />
              <Text style={[t.cap12Medium, { color: c.textSecondary }]}>Most spins win 5 or 10 runs</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ gap: 4 }}>
              <Button label="Spin now" arrow loading={spinning} onPress={onSpin} />
              <LinkText onPress={() => navigation.navigate('GameRules', { kind: 'spin' })}>See rules</LinkText>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// C2-02 Spin · result (17:13494) — result sheet over the wheel.
export function SpinResultSheet({ navigation, route }: V3ScreenProps<'SpinResult'>) {
  const { account } = useV3();
  const amount = Number(route.params.prize) || 0;
  const more = account.spinsLeft > 0;
  return (
    <Sheet
      result
      scroll={false}
      footer={
        <>
          {more ? (
            <Button label={`Spin again (${account.spinsLeft} left)`} onPress={() => navigation.goBack()} />
          ) : (
            <Button label="See gifts" arrow onPress={() => navigation.navigate('Tabs', { screen: 'Wallet', params: { tab: 'runs' } })} />
          )}
          <LinkText onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>Back to Home</LinkText>
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Image source={d3.partyPopper} style={styles.popper} />
        <View style={styles.starCircle}>
          <Image source={d3.glowingStar} style={{ width: 64, height: 64 }} />
        </View>
        <Text style={[t.display36, { color: c.runs }]}>+{amount} runs</Text>
        <Text style={[t.title20, { color: c.textPrimary }]}>You won {amount} runs!</Text>
        <Text style={[t.body15, { color: c.textSecondary }]}>Total runs: {fmt(account.runs)} · use them for gifts</Text>
      </View>
    </Sheet>
  );
}

const RULES: Record<string, { title: string; lines: string[] }> = {
  spin: {
    title: 'Spin rules',
    lines: [
      'Free spins every day by rank: Naya Saathi 3 · Kaarigar 4 · Ustaad & Legend 5.',
      'Spins reset at 12 am.',
      'The prize is decided by GoMax when you spin — most spins win 5 or 10 runs.',
      'Runs are added to your runs wallet right away. Use them for gifts.',
    ],
  },
  scratch: {
    title: 'Scratch card rules',
    lines: [
      'Scan 10 coupons in one day (12 am to 12 am) = 1 scratch card.',
      'Scratch it to win runs or points. The prize is fixed when the card is made.',
      'Cards not opened in 7 days expire.',
    ],
  },
  challenges: {
    title: 'How challenges work',
    lines: [
      'Finish the goal before the timer ends to win the reward.',
      'Weekly challenges reset every Monday 12 am.',
      'Daily quests reset at 12 am.',
      'Rewards land in your runs wallet when you tap Collect.',
    ],
  },
  streak: {
    title: 'Photo streak rules',
    lines: [
      'Upload 1 work photo every day, from the camera only — the photo is time-stamped.',
      '1 photo a day (12 am to 12 am).',
      'Miss a day and the streak starts again.',
      'GoMax checks every photo within 24 h.',
    ],
  },
};

export function GameRulesSheet({ route }: V3ScreenProps<'GameRules'>) {
  const r = RULES[route.params.kind];
  return (
    <Sheet title={r.title}>
      {r.lines.map((l, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          <View style={styles.ruleNum}>
            <Text style={[t.cap12Semibold, { color: c.primary700 }]}>{i + 1}</Text>
          </View>
          <Text style={[t.body15, { color: c.textPrimary, flex: 1 }]}>{l}</Text>
        </View>
      ))}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.navy900 },
  bar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  barTitle: { flex: 1, color: '#fff', textAlign: 'center', marginLeft: 48 },
  glass: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  glass0: { width: 40, height: 40 },
  spins: { alignItems: 'center', gap: 8, paddingTop: 10 },
  pips: { flexDirection: 'row', gap: 6, height: 8 },
  pip: { height: 8, borderRadius: 4 },
  pipUsed: { width: 24, backgroundColor: c.primary500 },
  pipLeft: { width: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  wheelWrap: { alignSelf: 'center', zIndex: 2 },
  dim: { position: 'absolute', backgroundColor: 'rgba(10,22,40,0.6)' },
  lockHub: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: c.navy900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: c.surfaceCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  proof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: c.surfaceMuted,
  },
  meanwhile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: c.primary50,
    borderWidth: 1,
    borderColor: c.primary100,
  },
  starCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: c.runs50, alignItems: 'center', justifyContent: 'center' },
  popper: { position: 'absolute', right: 10, top: -6, width: 56, height: 56 },
  ruleNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: c.primary50, alignItems: 'center', justifyContent: 'center' },
});
