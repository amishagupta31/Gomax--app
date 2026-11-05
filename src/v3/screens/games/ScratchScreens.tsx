import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Image as SvgImage, LinearGradient as SvgGradient, Mask, Rect, Stop } from 'react-native-svg';
import { ArrowLeft, Check, ChevronRight, CircleAlert, CircleHelp, Clock, X } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3 } from '../../assets';
import { Button } from '../../components/Button';
import { LinkText } from '../../components/Layout';
import { StaticTabBar } from '../../components/TabBar';
import { Bar, Pill, Rays } from '../../components/GameArt';
import {
  Prize,
  ScratchCard,
  claimScratchCard,
  firstNewCard,
  listScratchCards,
  logGame,
  revealScratchCard,
  scratchCard,
  scratchWon,
} from '../../api/games';
import { fmt, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// C2-04 Scratch card earned (17:13556). The "CLIENT to share sample" pill is
// kept as in Figma (like A3-03's T&C pill) until the client sends the art.
export function ScratchEarnedScreen({ navigation }: V3ScreenProps<'ScratchEarned'>) {
  const insets = useSafeAreaInsets();
  const { account } = useV3();
  const open = () => {
    const id = firstNewCard();
    if (id) navigation.replace('ScratchCard', { cardId: id });
    else navigation.replace('ScratchCards');
  };
  return (
    <View style={[styles.white, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <Pressable style={styles.closeTile} onPress={() => navigation.goBack()} accessibilityLabel="Close">
          <X size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>
      <View style={styles.earnedArt}>
        <Animated.Image entering={ZoomIn.springify().damping(12)} source={d3.ticket} style={{ width: 150, height: 150 }} />
      </View>
      <View style={{ alignItems: 'center', gap: 12, paddingHorizontal: 20 }}>
        <Text style={styles.big}>You got a scratch card!</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>10 coupons scanned today. Scratch it to win runs.</Text>
        <Pill icon={Check} label={`Today: ${Math.min(account.todayCoupons, 10) || 10} / 10 coupons`} bg={c.success50} ink={c.successText} style={{ alignSelf: 'center' }} />
        <Pill icon={CircleAlert} label="Scratch card look & prizes: CLIENT to share sample" bg={c.warning50} ink={c.warningText} style={{ alignSelf: 'center' }} />
        <Text style={[t.cap12, { color: c.textMuted, textAlign: 'center', width: 260 }]}>Rule: 10 coupons in one day (12 am to 12 am) = 1 card.</Text>
      </View>
      <View style={{ flex: 1 }} />
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button label="Scratch now" onPress={open} />
        <LinkText onPress={() => navigation.replace('ScratchCards')}>Later — find it in Games</LinkText>
      </View>
    </View>
  );
}

// C2-05 Scratch cards (17:13577)
export function ScratchCardsScreen({ navigation }: V3ScreenProps<'ScratchCards'>) {
  const insets = useSafeAreaInsets();
  const { account } = useV3();
  const [cards, setCards] = useState<ScratchCard[]>([]);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      listScratchCards(account.todayCoupons).then((r) => live && setCards(r));
      return () => {
        live = false;
      };
    }, [account.todayCoupons]),
  );
  const fresh = cards.filter((x) => x.state === 'new').length;
  const won = scratchWon();

  return (
    <View style={{ flex: 1, backgroundColor: c.navy900 }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} style={{ backgroundColor: c.surfaceCard }}>
        <View style={[styles.banner, { paddingTop: insets.top }]}>
          <LinearGradient colors={[c.navy500, c.navy900]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.bannerCircle}>
            <View style={[styles.miniCard, { transform: [{ rotate: '-12deg' }], left: 34, top: 76 }]}>
              <Image source={d3.wrappedGift} style={{ width: 24, height: 24 }} />
            </View>
            <View style={[styles.miniCard, { transform: [{ rotate: '8deg' }], left: 64, top: 64 }]}>
              <Image source={d3.wrappedGift} style={{ width: 28, height: 28 }} />
            </View>
          </View>
          <View style={styles.darkBar}>
            <Pressable style={styles.glass} onPress={() => navigation.goBack()} accessibilityLabel="Back">
              <ArrowLeft size={20} color="#fff" strokeWidth={2} />
            </Pressable>
            <Text style={[t.title18, { flex: 1, color: '#fff', textAlign: 'center' }]}>Scratch cards</Text>
            <Pressable style={styles.glass} onPress={() => navigation.navigate('GameRules', { kind: 'scratch' })} accessibilityLabel="Rules">
              <CircleHelp size={20} color="#fff" strokeWidth={2} />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 20, gap: 4, paddingTop: 8 }}>
            <Text style={styles.bannerTitle}>{fresh ? `${fresh} new card${fresh > 1 ? 's' : ''}` : 'No new cards'}</Text>
            <Text style={[t.sec13, { color: 'rgba(255,255,255,0.85)' }]}>1 card for every 10 coupons in a day</Text>
            <Pressable style={styles.wonPill} onPress={() => navigation.navigate('GamesHistory')}>
              <Image source={d3.trophy} style={{ width: 16, height: 16 }} />
              <Text style={[t.sec13Semibold, { color: '#fff' }]}>
                Won: {fmt(won.runs)} runs + {fmt(won.points)} pts
              </Text>
              <ChevronRight size={14} color="#fff" strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sheet}>
          <Text style={[t.section15, { color: c.textPrimary }]}>My cards</Text>
          <View style={styles.grid}>
            {cards.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                left={10 - account.todayCoupons % 10}
                onPress={card.state === 'new' ? () => navigation.navigate('ScratchCard', { cardId: card.id }) : card.state === 'locked' ? () => navigation.navigate('Tabs', { screen: 'Scan' }) : undefined}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      <StaticTabBar active="Home" />
    </View>
  );
}

function CoverPattern({ size, radius = 140 }: { size: number; radius?: number }) {
  const k = size / 280;
  const spots = [
    [-28, -28],
    [84, -28],
    [196, -28],
    [-28, 112],
    [84, 112],
  ];
  return (
    <>
      {spots.map(([x, y], i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: x * k,
            top: y * k,
            width: radius * k,
            height: radius * k,
            borderRadius: radius,
            backgroundColor: 'rgba(255,255,255,0.07)',
          }}
        />
      ))}
    </>
  );
}

function CardTile({ card, left, onPress }: { card: ScratchCard; left: number; onPress?: () => void }) {
  if (card.state === 'new') {
    return (
      <Pressable onPress={onPress} style={[styles.tile, { overflow: 'hidden', borderWidth: 0 }]}>
        <LinearGradient colors={[c.primary500, c.primary700]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
        <CoverPattern size={154} />
        <View style={styles.newPill}>
          <Text style={[t.cap12Semibold, { color: c.primary700 }]}>New</Text>
        </View>
        <Image source={d3.wrappedGift} style={{ width: 65, height: 65, marginTop: 10 }} />
        <Text style={[t.sec13Semibold, { color: '#fff' }]}>Tap to scratch</Text>
      </Pressable>
    );
  }
  if (card.state === 'won') {
    const runs = card.prize.kind === 'runs';
    return (
      <View style={[styles.tile, { borderColor: c.runs, borderWidth: 1.5 }]}>
        <Image source={runs ? d3.star : d3.coin} style={{ width: 40, height: 40 }} />
        <Text style={[t.hero24, { color: runs ? c.runs : c.points }]}>+{card.prize.amount}</Text>
        <Text style={[t.cap12Medium, { color: c.textSecondary }]}>{runs ? 'runs' : 'points'}</Text>
        <Text style={[t.cap12, { color: c.textMuted }]}>{card.earned}</Text>
      </View>
    );
  }
  if (card.state === 'locked') {
    return (
      <Pressable onPress={onPress} style={[styles.tile, { borderStyle: 'dashed', borderColor: c.borderStrong, borderWidth: 1.5 }]}>
        <Image source={d3.locked} style={{ width: 40, height: 40 }} />
        <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>Scan {left} more coupons</Text>
        <Bar value={card.progress / 10} color={c.primary700} track={c.surfaceMuted} width={100} />
        <Text style={[t.cap12, { color: c.textSecondary }]}>{card.progress} of 10 today</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.tile, { backgroundColor: c.surfaceMuted, borderColor: c.surfaceMuted }]}>
      <Image source={d3.hourglass} style={{ width: 40, height: 40, opacity: 0.5 }} />
      <Pill icon={Clock} label="Expired" bg="transparent" ink={c.textSecondary} style={{ alignSelf: 'center' }} />
      <Text style={[t.cap12, { color: c.textMuted }]}>{card.ended}</Text>
    </View>
  );
}

// C2-06 Scratching · C2-07 Revealed (17:13668 / 17:13720)
const CARD = 280;
const CELL = 20;
const CELLS = CARD / CELL;
const BRUSH = 24;

export function ScratchCardScreen({ navigation, route }: V3ScreenProps<'ScratchCard'>) {
  const insets = useSafeAreaInsets();
  const { account, patchAccount } = useV3();
  const { cardId } = route.params;
  const existing = scratchCard(cardId);
  const [prize, setPrize] = useState<Prize | null>(existing?.state === 'won' ? existing.prize : null);
  const [revealed, setRevealed] = useState(existing?.state === 'won');
  const [pts, setPts] = useState<[number, number][]>([]);
  const hit = useRef(new Set<number>());
  const last = useRef<[number, number] | null>(null);
  const done = useRef(false);
  const [pct, setPct] = useState(0);
  const [total, setTotal] = useState(account.runs);

  // The prize is fixed server-side; fetch it before the first stroke so the
  // face under the cover is real.
  React.useEffect(() => {
    if (!prize) revealScratchCard(cardId).then(setPrize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(() => {
    if (done.current || !prize) return;
    done.current = true;
    claimScratchCard(cardId);
    const runs = prize.kind === 'runs';
    patchAccount({
      runs: account.runs + (runs ? prize.amount : 0),
      points: account.points + (runs ? 0 : prize.amount),
      lifetimePoints: account.lifetimePoints + (runs ? 0 : prize.amount),
      scratchCardsReady: Math.max(0, account.scratchCardsReady - 1),
    });
    setTotal(account.runs + (runs ? prize.amount : 0));
    logGame({ kind: 'scratch', title: 'Scratch card', sub: 'Just now', prize });
    setRevealed(true);
  }, [account, patchAccount, prize, cardId]);

  const add = (x: number, y: number) => {
    const l = last.current;
    if (l && Math.hypot(l[0] - x, l[1] - y) < 8) return;
    last.current = [x, y];
    setPts((p) => [...p, [x, y]]);
    for (let i = 0; i < CELLS; i++)
      for (let j = 0; j < CELLS; j++) {
        const cx = i * CELL + CELL / 2;
        const cy = j * CELL + CELL / 2;
        if (Math.hypot(cx - x, cy - y) <= BRUSH) hit.current.add(i * CELLS + j);
      }
    const p = hit.current.size / (CELLS * CELLS);
    setPct(p);
    if (p >= 0.55) finish();
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          last.current = null;
          add(e.nativeEvent.locationX, e.nativeEvent.locationY);
        },
        onPanResponderMove: (e) => add(e.nativeEvent.locationX, e.nativeEvent.locationY),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prize, finish],
  );

  const runs = prize?.kind !== 'points';
  const face = (
    <View style={[StyleSheet.absoluteFill, styles.face]}>
      <Image source={runs ? d3.star : d3.coin} style={{ width: 72.8, height: 72.8 }} />
      <Text style={[t.hero24, { color: runs ? c.runs : c.points, lineHeight: 28 }]}>{prize ? `+${prize.amount}` : ''}</Text>
      <Text style={[t.cap12Medium, { color: c.textSecondary }]}>{runs ? 'runs' : 'points'}</Text>
      <Text style={[t.cap12, { color: c.textMuted }]}>From: 10 coupons today</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.navy900, paddingTop: insets.top }}>
      <StatusBar style="light" />
      <Rays />
      <View style={styles.darkBar}>
        <Pressable style={styles.glass} onPress={() => navigation.goBack()} accessibilityLabel="Close">
          <X size={20} color="#fff" strokeWidth={2} />
        </Pressable>
        <Text style={[t.title18, { flex: 1, color: '#fff', textAlign: 'center' }]}>Scratch card</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {revealed ? (
          <Animated.View entering={FadeIn.duration(250)} style={{ alignItems: 'center' }}>
            <View style={{ width: 300, height: 300, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.wonCard}>
                {face}
              </Animated.View>
              <Image source={d3.sparkles} style={[styles.deco, { width: 40, height: 40, left: 0, top: 0 }]} />
              <Image source={d3.partyPopper} style={[styles.deco, { width: 56, height: 56, right: -6, top: -20 }]} />
              <Image source={d3.star} style={[styles.deco, { width: 40, height: 40, left: -10, bottom: 10 }]} />
              <Image source={d3.sparkles} style={[styles.deco, { width: 32, height: 32, right: 4, bottom: 0 }]} />
            </View>
            <Text style={[styles.big, { color: '#fff', marginTop: 28 }]}>
              You won {prize?.amount} {runs ? 'runs' : 'points'}!
            </Text>
            <Text style={[t.body15, { color: 'rgba(255,255,255,0.85)', marginTop: 8 }]}>
              {runs ? `Added to your runs · total ${fmt(total)}` : `Added to your points · total ${fmt(account.points)}`}
            </Text>
          </Animated.View>
        ) : (
          <>
            <View style={styles.scratchCard} {...pan.panHandlers}>
              {face}
              <Svg width={CARD} height={CARD} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Defs>
                  <SvgGradient id="cover" x1="1" y1="0" x2="0" y2="1">
                    <Stop offset="0.146" stopColor={c.primary500} />
                    <Stop offset="0.854" stopColor={c.primary700} />
                  </SvgGradient>
                  <Mask id="scratch" x="0" y="0" width={CARD} height={CARD} maskUnits="userSpaceOnUse">
                    <Rect x="0" y="0" width={CARD} height={CARD} fill="#fff" />
                    {pts.map(([x, y], i) => (
                      <Circle key={i} cx={x} cy={y} r={BRUSH} fill="#000" />
                    ))}
                  </Mask>
                </Defs>
                <G mask="url(#scratch)">
                  <Rect x="0" y="0" width={CARD} height={CARD} rx={18} fill="url(#cover)" />
                  {[
                    [-28, -28],
                    [84, -28],
                    [196, -28],
                    [-28, 112],
                    [84, 112],
                  ].map(([x, y], i) => (
                    <Circle key={i} cx={x + 70} cy={y + 70} r={70} fill="#fff" fillOpacity={0.07} />
                  ))}
                  <SvgImage href={d3.wrappedGift} x={81.2} y={44.8} width={117.6} height={117.6} />
                </G>
              </Svg>
            </View>
            <View style={styles.hint}>
              <Text style={t.body15}>👆</Text>
              <Text style={[t.sec13Semibold, { color: '#fff' }]}>Rub with your finger</Text>
            </View>
            <Text style={[t.sec13, { color: '#fff', marginTop: 12, opacity: pct > 0 ? 1 : 0 }]}>
              Keep going — {Math.min(99, Math.round((pct / 0.55) * 100))}% done
            </Text>
          </>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {revealed ? (
          <>
            <Button label="See gifts" arrow onPress={() => navigation.navigate('Tabs', { screen: 'Wallet', params: { tab: runs ? 'runs' : 'points' } })} />
            <LinkText color="#fff" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>
              Back to Home
            </LinkText>
          </>
        ) : (
          <Button label="Tap to open instead" variant="primaryOutline" disabled={!prize} onPress={finish} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  white: { flex: 1, backgroundColor: c.surfaceCard },
  closeTile: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  earnedArt: { height: 200, alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 24 },
  big: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 32, letterSpacing: -0.26, color: c.navyBrand, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 4 },
  banner: { height: 250, overflow: 'hidden' },
  bannerCircle: { position: 'absolute', left: 170, top: -30, width: 260, height: 260, borderRadius: 130, backgroundColor: c.primary500 },
  miniCard: {
    position: 'absolute',
    width: 64,
    height: 52,
    borderRadius: 10,
    backgroundColor: c.primary700,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkBar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  glass: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 32, letterSpacing: -0.26, color: '#fff' },
  wonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sheet: {
    marginTop: -14,
    backgroundColor: c.surfaceCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 14,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47.9%',
    height: 170,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
  },
  newPill: { position: 'absolute', left: 10, top: 10, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  // userSelect: rubbing with a mouse on web must not highlight the prize text.
  scratchCard: { width: CARD, height: CARD, borderRadius: 24, overflow: 'hidden', backgroundColor: c.surfaceCard, userSelect: 'none' },
  face: { backgroundColor: c.surfaceCard, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 4 },
  wonCard: { width: 260, height: 260, borderRadius: 24, borderWidth: 3, borderColor: c.primary500, backgroundColor: c.surfaceCard, overflow: 'hidden' },
  deco: { position: 'absolute' },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
