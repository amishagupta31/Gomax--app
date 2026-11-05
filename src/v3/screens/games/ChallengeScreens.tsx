import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ArrowLeft, Check, ChevronRight, CircleCheck, CircleHelp, Clock, Lock, QrCode, Sparkles } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3, img } from '../../assets';
import { Button } from '../../components/Button';
import { CenterBar, LinkText } from '../../components/Layout';
import { StaticTabBar } from '../../components/TabBar';
import { Glow } from '../../components/Glow';
import { Bar, Pill, ProgressRing } from '../../components/GameArt';
import { BADGES, CHALLENGES, Challenge, QUESTS, TONE, challengeById, listChallenges, logGame } from '../../api/games';
import { useV3 } from '../../state/Store';
import { V3Nav, V3ScreenProps } from '../../navigation/types';

/** Where a challenge card leads (Figma hotspots on C2-08 / C2-09). */
function openChallenge(nav: Pick<V3Nav, 'navigate'>, ch: Challenge) {
  if (ch.done) return nav.navigate('ChallengeCompleted', { challengeId: ch.id });
  if (ch.id === 'streak') return nav.navigate('PhotoStreak');
  if (ch.id === 'invite') return nav.navigate('InviteEarn');
  if (ch.id === 'diwali') return nav.navigate('NewChallenge');
  return nav.navigate('ChallengeDetail', { challengeId: ch.id });
}

const progressLabel = (ch: Challenge) => (ch.unit === 'day' ? `Day ${ch.progress}/${ch.goal}` : `${ch.progress}/${ch.goal}`);

// Milestone track: nodes evenly spaced, fill interpolated between them.
function milestoneFill(ch: Challenge) {
  const at = ch.steps?.map((s) => s.at) ?? [ch.goal];
  if (at.length < 2) return ch.progress / ch.goal;
  if (ch.progress <= at[0]) return 0;
  for (let i = 1; i < at.length; i++) {
    if (ch.progress <= at[i]) return (i - 1 + (ch.progress - at[i - 1]) / (at[i] - at[i - 1])) / (at.length - 1);
  }
  return 1;
}

// C2-08 Challenges home (17:13757)
export function ChallengesHomeScreen({ navigation }: V3ScreenProps<'ChallengesHome'>) {
  const insets = useSafeAreaInsets();
  const [live, setLive] = useState<Challenge[]>(CHALLENGES);
  useFocusEffect(
    useCallback(() => {
      let on = true;
      listChallenges().then((r) => on && setLive(r.live));
      return () => {
        on = false;
      };
    }, []),
  );
  const active = live.find((x) => x.id === 'weekly') ?? live[0];
  const fill = milestoneFill(active);
  const steps = active.steps ?? [];
  const tone = (q: (typeof QUESTS)[number]) => q.progress >= q.goal;

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.navyTop, { paddingTop: insets.top }]}>
          <View style={styles.darkBar}>
            <Pressable style={styles.glass} onPress={() => navigation.goBack()} accessibilityLabel="Back">
              <ArrowLeft size={20} color="#fff" strokeWidth={2} />
            </Pressable>
            <Text style={[t.title18, styles.darkTitle]}>Challenges</Text>
            <Pressable style={styles.glass} onPress={() => navigation.navigate('GameRules', { kind: 'challenges' })} accessibilityLabel="Help">
              <CircleHelp size={20} color="#fff" strokeWidth={2} />
            </Pressable>
          </View>

          <Pressable style={styles.active} onPress={() => openChallenge(navigation, active)}>
            <LinearGradient colors={[c.runs, c.navy500]} start={{ x: 0.85, y: 0 }} end={{ x: 0.15, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={styles.activeGlow} />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, gap: 10 }}>
                <Pill icon={Clock} label={`${active.tag} · 3 days left`} bg="rgba(255,255,255,0.14)" ink="#fff" />
                <Text style={[t.hero24, { color: '#fff', lineHeight: 28 }]}>{active.short}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Image source={d3.wrappedGift} style={{ width: 20, height: 20 }} />
                  <Text style={[t.body15Semibold, { color: '#fff' }]}>Win {active.reward.replace('+', '')}</Text>
                </View>
              </View>
              <ProgressRing size={112} stroke={10} value={active.progress / active.goal} style={{ marginTop: 28 }}>
                <Text style={styles.ringBig}>{progressLabel(active)}</Text>
                <Text style={[t.cap12, { color: '#fff' }]}>coupons</Text>
              </ProgressRing>
            </View>
            <View style={styles.milestones}>
              <View style={styles.mTrack}>
                <View style={[styles.mFill, { width: `${fill * 100}%` }]} />
              </View>
              <View style={styles.mNodes}>
                {steps.map((s, i) => {
                  const reached = active.progress >= s.at;
                  const last = i === steps.length - 1;
                  return (
                    <View key={s.at} style={{ alignItems: 'center', width: 30 }}>
                      <View style={[styles.mNode, last ? { backgroundColor: '#fff' } : !reached && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        {last ? <Image source={d3.wrappedGift} style={{ width: 20, height: 20 }} /> : reached ? <Check size={16} color="#fff" strokeWidth={2.5} /> : null}
                      </View>
                      <Text style={[t.cap12Medium, { color: '#fff', marginTop: 3 }]}>{s.at}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </View>

        <View style={styles.sheet}>
          <View style={styles.h}>
            <Text style={[t.section15, { color: c.textPrimary }]}>All challenges · {live.length} live</Text>
            <Pressable style={styles.seeAll} onPress={() => navigation.navigate('AllChallenges')} hitSlop={8}>
              <Text style={[t.sec13Semibold, { color: c.primary700 }]}>See all</Text>
              <ChevronRight size={14} color={c.primary700} strokeWidth={2} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {live
              .filter((x) => x.id !== active.id)
              .map((ch) => (
                <Pressable key={ch.id} style={styles.mini} onPress={() => openChallenge(navigation, ch)}>
                  <Image source={ch.art} style={{ width: 28, height: 28 }} />
                  <Text style={[t.sec13Semibold, { color: c.textPrimary, height: 36 }]} numberOfLines={2}>
                    {ch.short}
                  </Text>
                  <Bar value={ch.progress / ch.goal} color={c.primary700} track={c.surfaceMuted} width={108} />
                  <Text style={[t.cap12, { color: c.textSecondary }]}>{ch.unit === 'day' ? `Day ${ch.progress} of ${ch.goal}` : `${ch.progress} of ${ch.goal}`}</Text>
                </Pressable>
              ))}
          </ScrollView>

          <View style={styles.h}>
            <Text style={[t.section15, { color: c.textPrimary }]}>Today’s quests</Text>
            <Pill icon={Clock} label="Resets in 6h" bg={c.surfaceMuted} ink={c.textSecondary} />
          </View>
          {QUESTS.map((q) => {
            const done = tone(q);
            return (
              <Pressable
                key={q.id}
                style={[styles.quest, done && { backgroundColor: c.success50, borderColor: c.success }]}
                onPress={() =>
                  q.id === 'q-invite'
                    ? navigation.navigate('InviteEarn')
                    : q.id === 'q-photo'
                      ? navigation.navigate('PhotoStreakCamera')
                      : navigation.navigate('Tabs', { screen: 'Scan' })
                }
              >
                <View style={[styles.questIc, { backgroundColor: done ? c.surfaceCard : c.primary50 }]}>
                  <Image source={q.art} style={{ width: 30, height: 30 }} />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{q.title}</Text>
                  <Bar
                    value={Math.max(0.04, q.progress / q.goal)}
                    color={done ? c.success : c.primary700}
                    track={done ? '#fff' : c.surfaceMuted}
                    width={150}
                  />
                </View>
                {done ? (
                  <Pill icon={Check} label="Done" bg={c.success50} ink={c.successText} />
                ) : (
                  <Pill art={d3.wrappedGift} label={`+${q.reward}`} bg={c.runs50} ink={c.runs} />
                )}
              </Pressable>
            );
          })}

          <View style={styles.h}>
            <Text style={[t.section15, { color: c.textPrimary }]}>My journey</Text>
            <Text style={[t.sec13Semibold, { color: c.primary700 }]}>Level 4</Text>
          </View>
          <LevelMap />

          <View style={styles.h}>
            <Text style={[t.section15, { color: c.textPrimary }]}>My badges</Text>
            <Text style={[t.sec13, { color: c.textSecondary }]}>4 of 12</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {BADGES.map((b) => (
              <View key={b.id} style={{ width: 56, alignItems: 'center', gap: 4, opacity: b.got ? 1 : 0.4 }}>
                <View style={[styles.badge, { backgroundColor: b.tint }]}>
                  <Image source={b.art} style={{ width: 34, height: 34 }} />
                </View>
                <Text style={[t.cap12, { color: b.got ? c.textPrimary : c.textMuted, textAlign: 'center' }]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <StaticTabBar active="Home" />
    </View>
  );
}

// "level-map" (17:13863): 320×380 runs-50 card, dotted path through the levels.
function LevelMap() {
  const done = [
    [130, 320],
    [210, 262],
    [150, 204],
  ];
  return (
    <View style={styles.map}>
      <Svg width={158} height={292} style={{ position: 'absolute', left: 95, top: 61 }}>
        <Path
          d="M64.9984 289L144.998 231L84.9984 173L4.99841 119L74.9984 61.0002L154.998 3.00022"
          stroke={c.runs}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="2 12"
          fill="none"
        />
      </Svg>
      {done.map(([x, y], i) => (
        <View key={i} style={[styles.lvl, { left: x, top: y, backgroundColor: c.runs }]}>
          <Check size={26} color="#fff" strokeWidth={2.5} />
        </View>
      ))}
      <View style={[styles.halo, { left: 60, top: 140 }]} />
      <View style={[styles.lvl, { left: 70, top: 150, backgroundColor: c.primary700 }]}>
        <Text style={[t.title20, { color: '#fff', fontSize: 22 }]}>4</Text>
      </View>
      <View style={[styles.lvl, styles.lvlLocked, { left: 140, top: 92 }]}>
        <Lock size={20} color={c.textMuted} strokeWidth={2} />
      </View>
      <View style={[styles.lvl, styles.lvlLocked, { left: 220, top: 34 }]}>
        <Image source={d3.wrappedGift} style={{ width: 34, height: 34 }} />
      </View>
      <View style={styles.tip}>
        <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>Level 4</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>150 coupons · +100 runs</Text>
      </View>
      <Image source={img.workerCheer} style={{ position: 'absolute', left: 248, top: 136, width: 70, height: 93.5 }} resizeMode="contain" />
    </View>
  );
}

// C2-09 All challenges (17:13922)
export function AllChallengesScreen({ navigation }: V3ScreenProps<'AllChallenges'>) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'live' | 'done'>('live');
  const [data, setData] = useState<{ live: Challenge[]; done: Challenge[] }>({ live: CHALLENGES, done: [] });
  useFocusEffect(
    useCallback(() => {
      let on = true;
      listChallenges().then((r) => on && setData(r));
      return () => {
        on = false;
      };
    }, []),
  );
  const rows = tab === 'live' ? data.live : data.done;
  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 40 }}>
        <CenterBar
          title="Challenges"
          right={
            <Pressable onPress={() => navigation.navigate('GameRules', { kind: 'challenges' })} hitSlop={8} accessibilityLabel="Help">
              <CircleHelp size={20} color={c.textPrimary} strokeWidth={2} />
            </Pressable>
          }
        />
        <View style={styles.switch}>
          {(['live', 'done'] as const).map((k) => (
            <Pressable key={k} style={[styles.seg, tab === k && styles.segOn]} onPress={() => setTab(k)}>
              <Text style={[tab === k ? t.sec13Semibold : t.sec13Medium, { color: tab === k ? c.textPrimary : c.textSecondary }]}>
                {k === 'live' ? `Live (${data.live.length})` : `Done (${data.done.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ gap: 14, marginTop: 14 }}>
          {rows.map((ch) => (
            <ChallengeCard key={ch.id} ch={ch} onPress={() => openChallenge(navigation, ch)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ChallengeCard({ ch, onPress }: { ch: Challenge; onPress: () => void }) {
  const tone = TONE[ch.tone];
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={styles.cardIc}>
          <Image source={ch.art} style={{ width: 34, height: 34 }} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Pill label={ch.tag} bg={tone.bg} ink={tone.ink} />
          <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{ch.title}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Bar value={ch.progress / ch.goal} color={ch.done ? c.success : tone.bar} track={tone.track} height={8} style={{ flex: 1, maxWidth: 200 }} />
        <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>{progressLabel(ch)}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
          <Image source={d3.wrappedGift} style={{ width: 18, height: 18 }} />
          <Text style={[t.sec13Semibold, { color: c.runs, flexShrink: 1 }]}>{ch.reward}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {ch.done ? <CircleCheck size={14} color={c.successText} strokeWidth={2} /> : <Clock size={14} color={c.textSecondary} strokeWidth={2} />}
          <Text style={[t.cap12, { color: ch.done ? c.successText : c.textSecondary }]}>{ch.ends}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// C2-10 Challenge detail · weekly (17:14042)
export function ChallengeDetailScreen({ navigation, route }: V3ScreenProps<'ChallengeDetail'>) {
  const insets = useSafeAreaInsets();
  const ch = challengeById(route.params.challengeId);
  const steps = ch.steps ?? [{ at: ch.goal, title: ch.title, sub: '' }];
  const current = steps.findIndex((s) => ch.progress < s.at);
  const complete = ch.progress >= ch.goal;
  const avs = ['SK', 'AK', 'MS'];

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={[styles.detailTop, { paddingTop: insets.top }]}>
          <LinearGradient colors={[c.navy900, c.navy500, c.runs]} locations={[0, 0.6, 1]} start={{ x: 0, y: 0.8 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          <View style={styles.darkBar}>
            <Pressable style={styles.glass} onPress={() => navigation.goBack()} accessibilityLabel="Back">
              <ArrowLeft size={20} color="#fff" strokeWidth={2} />
            </Pressable>
            <Text style={[t.title18, styles.darkTitle]}>{ch.page ?? 'Challenge'}</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={{ height: 220 }}>
            <Pressable onPress={() => complete && navigation.navigate('ChallengeCompleted', { challengeId: ch.id })} style={{ position: 'absolute', left: 24, top: 10 }}>
              <ProgressRing size={190} stroke={20} value={ch.progress / ch.goal}>
                <Text style={styles.detailBig}>{progressLabel(ch)}</Text>
                <Text style={[t.cap12, { color: '#fff' }]}>{ch.ringSub ?? 'done'}</Text>
              </ProgressRing>
            </Pressable>
            <Image source={img.workerScan} style={{ position: 'absolute', left: 210, top: 40, width: 130, height: 173.6 }} resizeMode="contain" />
          </View>
          <Pill icon={Clock} label={ch.endsLong ?? ch.ends} bg="rgba(255,255,255,0.14)" ink="#fff" style={{ marginLeft: 24, marginTop: 8 }} />
        </View>

        <View style={styles.detailSheet}>
          <Pressable style={styles.reward} onPress={() => complete && navigation.navigate('ChallengeCompleted', { challengeId: ch.id })}>
            <Image source={d3.wrappedGift} style={{ width: 40, height: 40 }} />
            <View style={{ gap: 2 }}>
              <Text style={[t.title18, { color: c.runs, fontFamily: 'Inter_600SemiBold', fontSize: 20 }]}>Win {ch.reward.replace('+', '')}</Text>
              {ch.bonus ? <Text style={[t.cap12, { color: c.textSecondary }]}>{ch.bonus}</Text> : null}
            </View>
          </Pressable>

          <View>
            {steps.map((s, i) => {
              const state = ch.progress >= s.at ? 'done' : i === current ? 'current' : 'todo';
              const last = i === steps.length - 1;
              return (
                <View key={s.at} style={{ flexDirection: 'row', gap: 12, minHeight: last ? 40 : 54 }}>
                  <View style={{ width: 28, alignItems: 'center' }}>
                    <View
                      style={[
                        styles.stepN,
                        state === 'done' && { backgroundColor: c.success },
                        state === 'current' && { backgroundColor: c.primary700 },
                      ]}
                    >
                      {state === 'done' ? (
                        <Check size={16} color="#fff" strokeWidth={2.5} />
                      ) : (
                        <Text style={[t.cap12Semibold, { color: state === 'current' ? '#fff' : c.textSecondary }]}>{i + 1}</Text>
                      )}
                    </View>
                    {!last ? <View style={[styles.stepLine, { backgroundColor: state === 'done' ? c.success : c.border }]} /> : null}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{s.title}</Text>
                    <Text style={[t.cap12, { color: c.textSecondary }]}>
                      {state === 'current' ? `${s.at - ch.progress} more to go` : s.sub || (state === 'todo' ? 'Not started' : 'Done')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {ch.joined ? (
            <View style={styles.social}>
              <View style={{ flexDirection: 'row' }}>
                {avs.map((a, i) => (
                  <View key={a} style={[styles.av, { marginLeft: i ? -8 : 0 }]}>
                    <Text style={[t.cap12Medium, { color: c.primary700 }]}>{a}</Text>
                  </View>
                ))}
              </View>
              <Text style={[t.sec13, { color: c.textSecondary, flex: 1 }]}>{ch.joined}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {complete ? (
          <Button label="Collect reward" onPress={() => navigation.navigate('ChallengeCompleted', { challengeId: ch.id })} />
        ) : (
          <Button label="Scan now" icon={QrCode} onPress={() => navigation.navigate('Tabs', { screen: 'Scan' })} />
        )}
      </View>
    </View>
  );
}

const CONFETTI: [number, number, string, number][] = [
  [10, 70, '#e07a62', 0],
  [18, 132, '#2a8fa8', 20],
  [28, 136, '#14c87c', -15],
  [64, 162, '#2a8fa8', 30],
  [76, 238, '#e07a62', -25],
  [118, 254, '#f5b301', 20],
  [220, 145, '#e07a62', -20],
  [244, 238, '#14c87c', 25],
  [266, 236, '#2a8fa8', -30],
  [300, 336, '#e07a62', 30],
  [320, 338, '#f5b301', 15],
  [172, 350, '#14c87c', 10],
];

// C2-11 Challenge completed (17:14105)
export function ChallengeCompletedScreen({ navigation, route }: V3ScreenProps<'ChallengeCompleted'>) {
  const insets = useSafeAreaInsets();
  const { account, patchAccount } = useV3();
  const ch = challengeById(route.params.challengeId);
  const amount = Number(ch.reward.match(/\d+/)?.[0] ?? 0);
  const collect = () => {
    if (!ch.done) {
      patchAccount({ runs: account.runs + amount, scratchCardsReady: account.scratchCardsReady + 1 });
      logGame({ kind: 'challenge', title: `${ch.tag} challenge won`, sub: ch.short, prize: { kind: 'runs', amount } });
    }
    navigation.navigate('ChallengesHome');
  };
  const share = () =>
    Share.share({ message: `I just won ${amount} runs on GoMax — ${ch.title}! Join me: https://gomax.app/invite` }).catch(() => undefined);

  const stats = [
    { art: d3.wrappedGift, big: `+${amount}`, small: 'runs' },
    { art: d3.sportsMedal, big: 'New', small: 'badge' },
    { art: d3.ticket, big: '+1', small: 'scratch card' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: c.navy900, paddingTop: insets.top }}>
      <StatusBar style="light" />
      {CONFETTI.map(([x, y, col, r], i) => (
        <Animated.View
          key={i}
          entering={FadeIn.delay(i * 40)}
          style={{ position: 'absolute', left: x, top: y, width: 14, height: 14, borderRadius: 3, backgroundColor: col, transform: [{ rotate: `${r}deg` }], opacity: 0.9 }}
        />
      ))}
      <View style={{ alignItems: 'center', paddingTop: 30 }}>
        <Glow width={280} color="#f6c344" opacity={0.35} style={{ position: 'absolute', top: 20 }} />
        <Animated.Image entering={ZoomIn.springify().damping(12)} source={img.workerTrophy} style={{ width: 150, height: 200 }} resizeMode="contain" />
        <Text style={[t.hero32, { color: '#fff', marginTop: 20 }]}>Challenge won!</Text>
        <Text style={[t.body15, { color: 'rgba(255,255,255,0.85)', marginTop: 6 }]}>
          {ch.goal} of {ch.goal} {ch.ringSub ?? 'done'}
        </Text>
      </View>
      <View style={styles.stats}>
        {stats.map((s) => (
          <View key={s.small} style={styles.stat}>
            <Image source={s.art} style={{ width: 34, height: 34 }} />
            <Text style={[t.title20, { color: '#fff' }]}>{s.big}</Text>
            <Text style={[t.cap12, { color: 'rgba(255,255,255,0.8)' }]}>{s.small}</Text>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <View style={[styles.footer, { backgroundColor: 'transparent', paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button label={ch.done ? 'Back to challenges' : 'Collect'} onPress={collect} />
        <LinkText color="#fff" onPress={share}>
          Share on WhatsApp
        </LinkText>
      </View>
    </View>
  );
}

// C2-12 New challenge · popup (17:14143)
export function NewChallengeScreen({ navigation }: V3ScreenProps<'NewChallenge'>) {
  return (
    <View style={styles.popRoot}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} accessibilityLabel="Close" />
      <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.popup}>
        <View style={styles.popArt}>
          <LinearGradient colors={['#f59e0b', c.primary700]} start={{ x: 0.8, y: 0 }} end={{ x: 0.2, y: 1 }} style={StyleSheet.absoluteFill} />
          <Image source={d3.fire} style={{ position: 'absolute', left: 30, top: 50, width: 90, height: 90 }} />
          <Image source={d3.wrappedGift} style={{ position: 'absolute', left: 180, top: 40, width: 100, height: 100 }} />
          <Pill icon={Sparkles} label="Diwali special" bg="rgba(255,255,255,0.14)" ink="#fff" style={{ alignSelf: 'center', marginTop: 16 }} />
        </View>
        <Text style={[t.title20, { color: c.textPrimary, fontSize: 22, lineHeight: 28 }]}>New challenge!</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center', width: 270 }]}>
          Scan 50 coupons before Diwali and win 300 runs + 2 scratch cards
        </Text>
        <Pill icon={Clock} label="12 days left" bg={c.warning50} ink={c.warningText} style={{ alignSelf: 'center' }} />
        <View style={{ alignSelf: 'stretch', paddingHorizontal: 20 }}>
          <Button label="Join now" arrow onPress={() => navigation.replace('ChallengeDetail', { challengeId: 'diwali' })} />
          <LinkText onPress={() => navigation.goBack()}>Later</LinkText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  navyTop: { backgroundColor: c.navy900, paddingBottom: 54 },
  darkBar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  darkTitle: { flex: 1, color: '#fff', textAlign: 'center' },
  glass: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  active: { marginHorizontal: 20, marginTop: 4, height: 250, borderRadius: 24, overflow: 'hidden', padding: 18 },
  activeGlow: { position: 'absolute', left: 170, top: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' },
  ringBig: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: '#fff' },
  milestones: { marginTop: 'auto', height: 50 },
  mTrack: { position: 'absolute', left: 8, right: 6, top: 14, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  mFill: { height: 8, borderRadius: 4, backgroundColor: c.primary500 },
  mNodes: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 3 },
  mNode: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.primary500, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    marginTop: -28,
    backgroundColor: c.surfaceCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 16,
  },
  h: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mini: { width: 132, height: 130, padding: 12, gap: 6, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: '#fff' },
  quest: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  questIc: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  map: { width: 320, height: 380, alignSelf: 'center', borderRadius: 20, backgroundColor: c.runs50, overflow: 'hidden' },
  lvl: { position: 'absolute', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  lvlLocked: { backgroundColor: c.surfaceCard, borderWidth: 2, borderColor: c.borderStrong },
  halo: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: c.primary500, opacity: 0.35 },
  tip: { position: 'absolute', left: 8, top: 222, backgroundColor: c.surfaceCard, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  badge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  switch: { flexDirection: 'row', backgroundColor: c.surfaceMuted, borderRadius: 12, padding: 4, marginTop: 8 },
  seg: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: c.surfaceCard },
  card: { padding: 14, gap: 10, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  cardIc: { width: 48, height: 48, borderRadius: 14, backgroundColor: c.surfacePage, alignItems: 'center', justifyContent: 'center' },
  detailTop: { height: 400, overflow: 'hidden' },
  detailBig: { fontFamily: 'Inter_700Bold', fontSize: 48, lineHeight: 56, letterSpacing: -0.96, color: '#fff' },
  detailSheet: {
    marginTop: -36,
    backgroundColor: c.surfaceCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 14,
  },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 70, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.runs50 },
  stepN: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1 },
  social: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, paddingHorizontal: 13, borderRadius: 14, borderWidth: 1, borderColor: c.border },
  av: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.primary100, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 4, backgroundColor: c.surfaceCard },
  stats: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 20 },
  stat: { flex: 1, height: 108, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', gap: 2 },
  popRoot: { flex: 1, backgroundColor: 'rgba(10,22,40,0.94)', justifyContent: 'center', paddingHorizontal: 20 },
  popup: { backgroundColor: c.surfaceCard, borderRadius: 28, overflow: 'hidden', alignItems: 'center', gap: 12, paddingBottom: 20 },
  popArt: { height: 180, alignSelf: 'stretch' },
});
