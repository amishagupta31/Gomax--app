import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../../components/Toast';
import { errorText } from '../../api/client';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  CircleCheck,
  Lock,
  QrCode,
  ShieldCheck,
  Ticket,
  X,
  Zap,
  ZapOff,
} from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3, img } from '../../assets';
import { Button } from '../../components/Button';
import { RedeemResult, redeemCoupon, ScanSource } from '../../api/coupons';
import { fmt, useV3 } from '../../state/Store';
import { useV3Nav } from '../../navigation/types';

// B1-00a ask · B1-00b blocked · B1-01 camera · B1-02 code typed
// (17:12578 / 12601 / 11985 / 12040). Results open as ScanResult sheets.
export function ScanScreen() {
  const [perm, requestPerm] = useCameraPermissions();
  const route = useRoute<any>();
  const [manualOnly, setManualOnly] = useState(false);

  useEffect(() => {
    if (route.params?.manual) setManualOnly(true);
  }, [route.params?.manual]);

  if (!perm) return <View style={{ flex: 1, backgroundColor: '#05070d' }} />;
  if (!perm.granted && !manualOnly) {
    return perm.canAskAgain ? (
      <PermissionAsk onAllow={requestPerm} />
    ) : (
      <PermissionBlocked onTypeCode={() => setManualOnly(true)} />
    );
  }
  return <ScanCamera cameraOn={perm.granted} focusManual={manualOnly} />;
}

function ScanCamera({ cameraOn, focusManual }: { cameraOn: boolean; focusManual?: boolean }) {
  const insets = useSafeAreaInsets();
  const nav = useV3Nav();
  const tabNav = useNavigation<any>();
  const { account, patchAccount } = useV3();
  const toast = useToast();
  const [torch, setTorch] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(true);
  const inputRef = useRef<TextInput>(null);
  const lock = useRef(false);

  // pause the camera while another screen/sheet is on top
  useFocusEffect(
    React.useCallback(() => {
      setActive(true);
      lock.current = false;
      return () => setActive(false);
    }, []),
  );
  useEffect(() => {
    if (focusManual) setTimeout(() => inputRef.current?.focus(), 300);
  }, [focusManual]);

  const submit = async (raw: string, source: ScanSource) => {
    if (lock.current || !raw.trim()) return;
    lock.current = true;
    setBusy(true);
    let res: RedeemResult;
    try {
      res = await redeemCoupon(raw, source);
    } catch (e) {
      lock.current = false;
      setBusy(false);
      toast(errorText(e), 'error');
      return;
    }
    setBusy(false);
    if (res.kind === 'added') {
      const firstEver = res.bonus > 0 || !account.firstCouponCelebrated;
      const scratch = res.reward?.kind === 'scratch';
      const gift = res.reward?.kind === 'gift' ? res.reward.gift : undefined;
      patchAccount({
        points: res.balance.points,
        runs: res.balance.runs,
        lifetimePoints: account.lifetimePoints + res.value + res.bonus,
        todayCoupons: res.today.count,
        firstCouponCelebrated: true,
        scratchCardsReady: account.scratchCardsReady + (scratch ? 1 : 0),
      });
      setCode('');
      if (firstEver) return nav.navigate('FirstCoupon', { value: res.value, bonus: res.bonus });
      return nav.navigate('ScanResult', {
        outcome: scratch ? 'scratch' : gift ? 'gift' : 'added',
        code: raw,
        value: res.value,
        giftId: gift?.id,
        giftName: gift?.name,
      });
    }
    if (res.kind === 'offline') {
      setCode('');
      return nav.navigate('ScanResult', { outcome: 'offline', code: raw, value: res.value });
    }
    nav.navigate('ScanResult', {
      outcome: res.kind,
      code: raw,
      usedAt: res.kind === 'used' ? String(res.usedAt) : undefined,
      reason: res.kind === 'invalid' ? res.reason : undefined,
    });
  };

  // scan line sweeping the viewfinder
  const sweep = useSharedValue(0);
  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [sweep]);
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: 20 + sweep.value * 200 }] }));

  const pts = account.todayCoupons * 20;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0f2a4e', '#05070d']} locations={[0, 0.6]} style={StyleSheet.absoluteFill} />
      {cameraOn && active ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={busy ? undefined : ({ data }) => submit(data, 'scan')}
        />
      ) : null}
      {cameraOn ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,7,13,0.35)' }]} /> : null}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }} keyboardShouldPersistTaps="handled" bounces={false}>
          <View style={styles.top}>
            <Pressable style={styles.glassBtn} onPress={() => tabNav.navigate('Home')} accessibilityLabel="Back">
              <ArrowLeft size={20} color="#fff" strokeWidth={2} />
            </Pressable>
            <View style={styles.seg}>
              <View style={[styles.segItem, { backgroundColor: c.primary700 }]}>
                <Text style={[t.sec13Semibold, { color: '#fff' }]}>Scan</Text>
              </View>
              <Pressable style={styles.segItem} onPress={() => nav.navigate('MyScans')}>
                <Text style={[t.sec13Semibold, { color: '#fff' }]}>My scans</Text>
              </Pressable>
            </View>
            <Pressable style={styles.glassBtn} onPress={() => setTorch((v) => !v)} accessibilityLabel="Torch">
              {torch ? <ZapOff size={20} color="#fff" strokeWidth={2} /> : <Zap size={20} color="#fff" strokeWidth={2} />}
            </Pressable>
          </View>

          <View style={styles.hint}>
            <Ticket size={16} color="#fff" strokeWidth={2} />
            <Text style={[t.sec13Medium, { color: '#fff' }]}>Keep the coupon QR inside the box</Text>
          </View>

          <View style={styles.finder}>
            {CORNERS.map((s, i) => (
              <View key={i} style={[styles.corner, s]} />
            ))}
            {!cameraOn || busy ? (
              <QrCode size={90} color="rgba(255,255,255,0.35)" strokeWidth={1} style={{ alignSelf: 'center', marginTop: 75 }} />
            ) : null}
            <Animated.View style={[styles.line, lineStyle]} />
          </View>

          <Pressable style={styles.today} onPress={() => nav.navigate('MyScans')}>
            <CircleCheck size={16} color={c.success} strokeWidth={2} />
            <Text style={[t.sec13Medium, { color: '#fff' }]}>
              Today: {account.todayCoupons} coupons · +{fmt(pts)} pts
            </Text>
            <ChevronRight size={16} color="#fff" strokeWidth={2} />
          </Pressable>

          <View style={{ flex: 1, minHeight: 36 }} />

          <View style={[styles.sheet, { paddingBottom: 116 + Math.max(insets.bottom - 24, 0) }]}>
            <Text style={styles.manualTitle}>OR ENTER CODE MANUALLY</Text>
            <View style={styles.manualRow}>
              <View style={styles.manualInput}>
                <TextInput
                  ref={inputRef}
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter code…"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="go"
                  onSubmitEditing={() => submit(code, 'typed')}
                  style={styles.manualText}
                />
              </View>
              <Pressable
                style={[styles.submit, (!code.trim() || busy) && { opacity: 0.6 }]}
                disabled={!code.trim() || busy}
                onPress={() => submit(code, 'typed')}
                accessibilityLabel="Submit code"
              >
                <ArrowRight size={20} color="#fff" strokeWidth={2} />
              </Pressable>
            </View>
            <Text style={[t.cap12, { color: c.textMuted, textAlign: 'center' }]}>
              If the coupon code is damaged or destroyed, GoMax is not responsible.{' '}
              <Text style={{ color: c.primary700, textDecorationLine: 'underline' }} onPress={() => nav.navigate('ScanTerms')}>
                Terms & conditions
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const CORNERS = [
  { left: 0, top: 0, width: 36, height: 5 },
  { left: 0, top: 0, width: 5, height: 36 },
  { right: 0, top: 0, width: 36, height: 5 },
  { right: 0, top: 0, width: 5, height: 36 },
  { left: 0, bottom: 0, width: 36, height: 5 },
  { left: 0, bottom: 0, width: 5, height: 36 },
  { right: 0, bottom: 0, width: 36, height: 5 },
  { right: 0, bottom: 0, width: 5, height: 36 },
] as const;

// ---------- permission states ----------

function PermArt({ blocked }: { blocked?: boolean }) {
  return (
    <View style={[styles.permArt, blocked && { opacity: 0.45 }]}>
      <View style={styles.permCircle} />
      <View style={styles.phone}>
        <View style={styles.phoneScreen}>
          <View style={styles.phoneFrame} />
          <QrCode size={44} color="#fff" strokeWidth={1.5} style={{ position: 'absolute', left: 35, top: 66 }} />
        </View>
      </View>
      <Image source={img.pureTileP10} style={styles.pack} resizeMode="contain" />
      <Image source={d3.coin} style={{ position: 'absolute', left: 220, top: 40, width: 60, height: 60 }} />
      <Image source={d3.sparkles} style={{ position: 'absolute', left: 40, top: 40, width: 44, height: 44 }} />
      {blocked ? (
        <View style={styles.lock}>
          <Lock size={30} color="#fff" strokeWidth={2} />
        </View>
      ) : null}
    </View>
  );
}

function PermShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const tabNav = useNavigation<any>();
  return (
    <View style={[styles.permRoot, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.permBody}>
        <Pressable style={styles.close} onPress={() => tabNav.navigate('Home')} accessibilityLabel="Close">
          <X size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        {children}
      </ScrollView>
      <View style={[styles.permFooter, { paddingBottom: 108 + Math.max(insets.bottom - 24, 0) }]}>{footer}</View>
    </View>
  );
}

// B1-00a Scan · camera permission · ask (17:12578)
function PermissionAsk({ onAllow }: { onAllow: () => void }) {
  return (
    <PermShell footer={<Button label="Allow camera" icon={QrCode} onPress={onAllow} />}>
      <View style={{ height: 300, alignItems: 'center', justifyContent: 'center' }}>
        <PermArt />
      </View>
      <Text style={styles.permTitle}>Open camera to scan</Text>
      <Text style={[t.body15, styles.permSub]}>Point at the QR code on the coupon. Points come in 2 seconds.</Text>
      <View style={styles.safePill}>
        <ShieldCheck size={14} color={c.successText} strokeWidth={2} />
        <Text style={[t.sec13Medium, { color: c.successText }]}>We use the camera only for scanning</Text>
      </View>
    </PermShell>
  );
}

// B1-00b Scan · camera permission · blocked (17:12601)
function PermissionBlocked({ onTypeCode }: { onTypeCode: () => void }) {
  return (
    <PermShell
      footer={
        <View style={{ gap: 12, alignSelf: 'stretch' }}>
          <Button label="Open Settings" arrow onPress={() => Linking.openSettings()} />
          <Button label="Type the code" variant="primaryOutline" onPress={onTypeCode} />
        </View>
      }
    >
      <View style={{ height: 260, alignItems: 'center', justifyContent: 'center' }}>
        <PermArt blocked />
      </View>
      <Text style={styles.permTitle}>Camera is turned off</Text>
      <Text style={[t.body15, styles.permSub]}>Turn it on in phone Settings, or type the code.</Text>
      <View style={styles.howTo}>
        {['Open Settings', 'Tap Permissions → Camera', 'Choose “Allow”'].map((s, i) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.num}>
              <Text style={[t.cap12Medium, { color: '#fff' }]}>{i + 1}</Text>
            </View>
            <Text style={[t.body15Medium, { color: c.textPrimary }]}>{s}</Text>
          </View>
        ))}
      </View>
    </PermShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070d' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  glassBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', padding: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  segItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9 },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  finder: {
    width: 240,
    height: 240,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  corner: { position: 'absolute', borderRadius: 3, backgroundColor: c.primary500 },
  line: { position: 'absolute', left: 20, width: 200, height: 2, backgroundColor: c.primary500 },
  today: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sheet: {
    backgroundColor: c.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 16,
    alignItems: 'center',
  },
  manualTitle: { fontFamily: 'Roboto_500Medium', fontSize: 16, lineHeight: 36, letterSpacing: 0.09, color: '#0f2a4e' },
  manualRow: { flexDirection: 'row', gap: 12, alignSelf: 'stretch', marginTop: -4 },
  manualInput: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(5,5,5,0.05)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  manualText: { fontFamily: 'Roboto_400Regular', fontSize: 14, letterSpacing: -0.3, color: c.textPrimary, paddingVertical: 0, outlineStyle: 'none' } as object,
  submit: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#cf4b29', alignItems: 'center', justifyContent: 'center' },

  permRoot: { flex: 1, backgroundColor: c.surfaceCard },
  permBody: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, gap: 16, alignItems: 'center' },
  close: {
    position: 'absolute',
    left: 20,
    top: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: c.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permArt: { width: 300, height: 300 },
  permCircle: { position: 'absolute', left: 20, top: 20, width: 260, height: 260, borderRadius: 130, backgroundColor: c.primary100 },
  phone: { position: 'absolute', left: 85, top: 45, width: 130, height: 220, borderRadius: 24, backgroundColor: c.navy900 },
  phoneScreen: { position: 'absolute', left: 8, top: 15, width: 114, height: 190, borderRadius: 16, backgroundColor: '#1e293b' },
  phoneFrame: { position: 'absolute', left: 19, top: 50, width: 76, height: 76, borderRadius: 8, borderWidth: 3, borderColor: c.primary500 },
  pack: { position: 'absolute', left: 20, top: 143, width: 90, height: 145, transform: [{ rotate: '-8deg' }] },
  lock: {
    position: 'absolute',
    left: 118,
    top: 118,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: c.navyBrand, textAlign: 'center' },
  permSub: { color: c.textSecondary, textAlign: 'center' },
  safePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.success50 },
  howTo: { alignSelf: 'stretch', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  num: { width: 26, height: 26, borderRadius: 13, backgroundColor: c.navy900, alignItems: 'center', justifyContent: 'center' },
  permFooter: { paddingHorizontal: 20, paddingTop: 12, alignItems: 'center' },
});
