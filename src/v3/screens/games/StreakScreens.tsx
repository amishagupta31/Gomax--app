import React, { useRef, useState } from 'react';
import { useToast } from '../../components/Toast';
import { ApiError, errorText } from '../../api/client';
import { useFocusEffect } from '@react-navigation/native';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { ArrowLeft, Camera, Check, CircleCheck, CircleHelp, Lock, RefreshCw, ShieldCheck, X } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3 } from '../../assets';
import { Button } from '../../components/Button';
import { LinkText } from '../../components/Layout';
import { Bar, Pill } from '../../components/GameArt';
import { STREAK_REWARDS, loadStreakRewards, uploadStreakPhoto } from '../../api/games';
import { useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
const clock = (d: Date) => `${pad(((d.getHours() + 11) % 12) + 1)}:${pad(d.getMinutes())} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
export const stamp = (d: Date, year = true) => `${pad(d.getDate())} ${MONTHS[d.getMonth()]}${year ? ` ${d.getFullYear()}` : ''} · ${clock(d)}`;

const nextReward = (done: number) => STREAK_REWARDS.find((r) => r.days > done) ?? STREAK_REWARDS[STREAK_REWARDS.length - 1];

// C2-13 Photo streak (17:14163)
export function PhotoStreakScreen({ navigation }: V3ScreenProps<'PhotoStreak'>) {
  const insets = useSafeAreaInsets();
  const { account, patchAccount } = useV3();
  useFocusEffect(
    React.useCallback(() => {
      loadStreakRewards().then((s) => s && patchAccount({ streakDay: s.day, streakDoneToday: s.doneToday }));
    }, [patchAccount]),
  );
  const done = account.streakDay;
  const today = account.streakDoneToday;
  const dayNo = today ? done : done + 1;
  const next = nextReward(done);
  const todayIdx = (new Date().getDay() + 6) % 7;
  // Days before today that belong to the current streak.
  const before = Math.min(todayIdx, today ? done - 1 : done);

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.top, { paddingTop: insets.top }]}>
          <LinearGradient colors={[c.navy900, '#0f2a4e']} style={StyleSheet.absoluteFill} />
          <View style={styles.darkBar}>
            <Pressable style={styles.glass} onPress={() => navigation.goBack()} accessibilityLabel="Back">
              <ArrowLeft size={20} color="#fff" strokeWidth={2} />
            </Pressable>
            <Text style={[t.title18, { flex: 1, color: '#fff', textAlign: 'center' }]}>Photo streak</Text>
            <Pressable style={styles.glass} onPress={() => navigation.navigate('GameRules', { kind: 'streak' })} accessibilityLabel="Rules">
              <CircleHelp size={20} color="#fff" strokeWidth={2} />
            </Pressable>
          </View>
          <View style={{ alignItems: 'center', gap: 4, paddingTop: 6 }}>
            <Image source={d3.fire} style={{ width: 64, height: 64 }} />
            <Text style={[t.display36, { color: '#fff' }]}>Day {Math.max(1, dayNo)}</Text>
            <Text style={[t.sec13, { color: 'rgba(255,255,255,0.85)' }]}>Upload 1 work photo every day</Text>
          </View>
          <View style={styles.week}>
            {WEEK.map((d, i) => {
              const isToday = i === todayIdx;
              const ok = (i < todayIdx && i >= todayIdx - before) || (isToday && today);
              return (
                <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                  <View style={[styles.dot, ok ? styles.dotDone : isToday ? styles.dotToday : styles.dotIdle]}>
                    {ok ? <Check size={16} color="#fff" strokeWidth={2.5} /> : isToday ? <Camera size={16} color={c.primary700} strokeWidth={2} /> : null}
                  </View>
                  <Text style={[t.cap12Medium, { color: 'rgba(255,255,255,0.85)' }]}>{d}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 14, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[t.section15, { color: c.textPrimary }]}>Streak rewards</Text>
            <Text style={[t.sec13Semibold, { color: c.primary700 }]}>{next.days - done} days to next</Text>
          </View>
          <View style={styles.rewards}>
            {STREAK_REWARDS.map((r, i) => {
              const current = r.days === next.days;
              const got = done >= r.days;
              return (
                <View key={r.days}>
                  {i > 0 ? <View style={styles.div} /> : null}
                  <View style={styles.rRow}>
                    <View style={[styles.rIc, current && { backgroundColor: c.primary700 }, got && { backgroundColor: c.success50 }]}>
                      {current ? (
                        <Image source={d3.fire} style={{ width: 20, height: 20 }} />
                      ) : got ? (
                        <Check size={18} color={c.successText} strokeWidth={2.5} />
                      ) : (
                        <Lock size={18} color={c.textMuted} strokeWidth={2} />
                      )}
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{r.days} days</Text>
                      {current ? <Bar value={done / r.days} color={c.primary700} track={c.surfaceMuted} width={130} /> : null}
                    </View>
                    <Pill label={r.reward} bg={c.runs50} ink={c.runs} />
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.info}>
            {['Camera only — photo is time-stamped', '1 photo a day (12 am to 12 am)', 'Miss a day = streak starts again'].map((l) => (
              <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CircleCheck size={16} color={c.warningText} strokeWidth={2} />
                <Text style={[t.sec13, { color: c.textPrimary }]}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {today ? (
          <Button label="Done for today · come back tomorrow" disabled />
        ) : (
          <Button label="Take today's photo" icon={Camera} onPress={() => navigation.navigate('PhotoStreakCamera')} />
        )}
      </View>
    </View>
  );
}

// C2-14 Photo streak · camera (17:14265). Camera only — no gallery picker.
export function PhotoStreakCameraScreen({ navigation }: V3ScreenProps<'PhotoStreakCamera'>) {
  const insets = useSafeAreaInsets();
  const { patchAccount } = useV3();
  const toast = useToast();
  const [perm, requestPerm] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [busy, setBusy] = useState(false);
  const cam = useRef<CameraView>(null);
  const now = new Date();
  const live = perm?.granted;

  const shoot = async () => {
    if (busy) return;
    if (!live && perm?.canAskAgain !== false) {
      await requestPerm(); // first tap asks; the next tap takes the photo
      return;
    }
    setBusy(true);
    let uri: string | undefined;
    try {
      uri = (await cam.current?.takePictureAsync({ quality: 0.6 }))?.uri;
    } catch {
      uri = undefined; // web / simulator: continue with the placeholder
    }
    const takenAt = new Date();
    try {
      const res = await uploadStreakPhoto(uri ?? null, takenAt);
      patchAccount({ streakDay: res.day, streakDoneToday: res.doneToday });
    } catch (e) {
      setBusy(false);
      toast(errorText(e), e instanceof ApiError && e.status === 0 ? 'offline' : 'error');
      return;
    }
    setBusy(false);
    navigation.replace('PhotoStreakUploaded', { uri, takenAt: takenAt.toISOString() });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.navy900 }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a1628', '#2b3a4f']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      {live ? <CameraView ref={cam} style={StyleSheet.absoluteFill} facing={facing} /> : null}
      {live ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,22,40,0.25)' }]} /> : null}
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <View style={styles.darkBar}>
          <Pressable style={styles.glass} onPress={() => navigation.goBack()} accessibilityLabel="Close">
            <X size={20} color="#fff" strokeWidth={2} />
          </Pressable>
          <Text style={[t.title18, { flex: 1, color: '#fff', textAlign: 'center' }]}>Today&apos;s photo</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={styles.camHint}>
            <Text style={t.body15}>📦</Text>
            <Text style={[t.sec13Medium, { color: '#fff' }]}>Keep your work in the box</Text>
          </View>
          <View style={styles.frame}>
            <Svg width={280} height={336} style={StyleSheet.absoluteFill}>
              <Rect x={1.5} y={1.5} width={277} height={333} rx={26} stroke="#fff" strokeWidth={3} strokeDasharray="14 10" fill="none" />
            </Svg>
            {!live ? <Camera size={32} color="#fff" strokeWidth={1.75} /> : null}
            <View style={styles.stampChip}>
              <Text style={[t.sec13Semibold, { color: '#fff' }]}>{stamp(now)}</Text>
            </View>
          </View>
          <View style={[styles.camHint, { backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 52 }]}>
            <Lock size={14} color="#fff" strokeWidth={2} />
            <Text style={[t.sec13Medium, { color: '#fff' }]}>
              {perm && !perm.granted && !perm.canAskAgain ? 'Allow camera in Settings to continue' : 'Camera only · gallery is off'}
            </Text>
          </View>
        </View>
        <View style={[styles.shutterRow, { paddingBottom: Math.max(insets.bottom, 24) + 12 }]}>
          <View style={{ width: 48 }} />
          <Pressable onPress={shoot} style={styles.shutter} accessibilityLabel="Take photo" disabled={busy}>
            <View style={[styles.shutterIn, busy && { opacity: 0.6 }]} />
          </Pressable>
          <Pressable
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            style={styles.flip}
            accessibilityLabel="Flip camera"
            disabled={Platform.OS === 'web'}
          >
            <RefreshCw size={22} color="#fff" strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// C2-15 Photo streak · uploaded (17:14292)
export function PhotoStreakUploadedScreen({ navigation, route }: V3ScreenProps<'PhotoStreakUploaded'>) {
  const insets = useSafeAreaInsets();
  const { account } = useV3();
  const day = account.streakDay;
  const next = nextReward(day);
  const takenAt = route.params?.takenAt ? new Date(route.params.takenAt) : new Date();
  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard, paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <Pressable style={styles.closeTile} onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} accessibilityLabel="Close">
          <X size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.photo}>
          {route.params?.uri ? (
            <Image source={{ uri: route.params.uri }} style={StyleSheet.absoluteFill} />
          ) : (
            <>
              <LinearGradient colors={['#0a1628', '#2b3a4f']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              <Camera size={24} color="#fff" strokeWidth={1.75} />
              <Text style={[t.cap12Medium, { color: '#fff', marginTop: 8 }]}>Your photo</Text>
            </>
          )}
          <View style={[styles.stampChip, { left: 10, bottom: 10, paddingVertical: 4, paddingHorizontal: 8 }]}>
            <Text style={[t.cap12Medium, { color: '#fff' }]}>{stamp(takenAt, false)}</Text>
          </View>
        </Animated.View>
        <Image source={d3.fire} style={{ position: 'absolute', left: '50%', marginLeft: 70, top: -6, width: 44, height: 50 }} resizeMode="contain" />
      </View>
      <View style={{ alignItems: 'center', gap: 10, paddingHorizontal: 20, marginTop: 28 }}>
        <Text style={styles.big}>Day {day} done!</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>Photo saved. Come back tomorrow for day {day + 1}.</Text>
        <View style={styles.progress}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[t.body15Semibold, { color: c.textPrimary }]}>
              {next.days - day} days to {next.reward.split(' · ')[0]}
            </Text>
            <Text style={[t.sec13Semibold, { color: c.primary700 }]}>
              {day}/{next.days}
            </Text>
          </View>
          <Bar value={day / next.days} color={c.primary700} track={c.surfaceMuted} height={8} />
        </View>
        <Pill icon={ShieldCheck} label="Checked by GoMax within 24 h" bg={c.surfaceMuted} ink={c.textSecondary} style={{ alignSelf: 'center' }} />
      </View>
      <View style={{ flex: 1 }} />
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button label="Back to Home" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} />
        <LinkText onPress={() => navigation.replace('PhotoStreak')}>See my streak</LinkText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { paddingBottom: 24, overflow: 'hidden' },
  darkBar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  glass: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 28, marginTop: 18 },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: c.primary500 },
  dotToday: { backgroundColor: '#fff' },
  dotIdle: { backgroundColor: 'rgba(255,255,255,0.15)' },
  rewards: { borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 4 },
  rRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rIc: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  div: { height: 1, backgroundColor: c.border },
  info: { backgroundColor: c.warning50, borderRadius: 14, padding: 14, gap: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 4, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surfaceCard },
  camHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 26,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(10,22,40,0.7)',
  },
  frame: { width: 280, height: 336, marginTop: 10, alignItems: 'center', justifyContent: 'center' },
  stampChip: { position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(10,22,40,0.8)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, gap: 2 },
  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 50 },
  shutter: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterIn: { width: 62, height: 62, borderRadius: 31, backgroundColor: c.primary700 },
  flip: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  closeTile: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  photo: { width: 200, height: 240, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  big: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 32, letterSpacing: -0.26, color: c.navyBrand, textAlign: 'center' },
  progress: { alignSelf: 'stretch', borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16, gap: 12, marginTop: 6 },
});
