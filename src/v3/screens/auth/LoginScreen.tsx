import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../../components/Toast';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock } from 'lucide-react-native';
import { c, t, HELPLINE, HELPLINE_TEL } from '../../theme';
import { img, d3 } from '../../assets';
import { Field, FieldError } from '../../components/Field';
import { Button } from '../../components/Button';
import { digits, formatMobile, login } from '../../api/auth';
import { useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

type Status =
  | { kind: 'idle' }
  | { kind: 'wrong_password'; triesLeft: number }
  | { kind: 'not_registered' }
  | { kind: 'paused'; until: number };

// A1-02 Login · A1-03 filled · A1-04 wrong password · A1-05 number not
// registered · A1-06 paused (17:11441 / 11704 / 11730 / 11759 / 11784).
export function LoginScreen({ navigation, route }: V3ScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const { setUser, refreshAccount } = useV3();
  const toast = useToast();
  const [mobile, setMobile] = useState(formatMobile(route.params?.mobile ?? ''));
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);
  const mobileRef = useRef<TextInput>(null);

  const filled = digits(mobile).length === 10 && password.length > 0;

  const submit = async () => {
    setBusy(true);
    const res = await login(mobile, password);
    if (res.ok) {
      setUser({ name: res.name, mobile: digits(mobile) });
      await refreshAccount();
      setBusy(false);
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      return;
    }
    setBusy(false);
    if (res.reason === 'error') {
      toast(res.message, 'error');
      return;
    }
    setStatus(
      res.reason === 'wrong_password'
        ? { kind: 'wrong_password', triesLeft: res.triesLeft }
        : res.reason === 'paused'
          ? { kind: 'paused', until: res.until }
          : { kind: 'not_registered' },
    );
  };

  const onMobile = (v: string) => {
    setMobile(formatMobile(v));
    if (status.kind === 'not_registered') setStatus({ kind: 'idle' });
  };
  const onPassword = (v: string) => {
    setPassword(v);
    if (status.kind === 'wrong_password') setStatus({ kind: 'idle' });
  };

  const forgot = () => navigation.navigate('ForgotMobile', { mobile: digits(mobile) });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[c.authGradientTop, c.authGradientBottom]} style={StyleSheet.absoluteFill} />
      <View style={styles.hero} pointerEvents="none">
        <Image source={img.loginHero} style={styles.heroImg} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,32,64,0.8)']}
          locations={[0.2249, 0.8832]}
          style={styles.heroShade}
        />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.sheet}>
            <Text style={[t.hero32, { color: c.primary700 }]}>Welcome to</Text>
            <Text style={[t.hero32, { color: c.textPrimary }]}>GoMax! 👋</Text>
            <Text style={[t.subtitle14, styles.sub]}>Log in with your mobile number and password</Text>

            <View style={{ height: status.kind === 'paused' ? 16 : 24 }} />
            <Field
              ref={mobileRef}
              label="Mobile number (Login ID)"
              prefix="+91"
              placeholder="Enter mobile number"
              keyboardType="number-pad"
              maxLength={11}
              value={mobile}
              onChangeText={onMobile}
              error={status.kind === 'not_registered' ? 'This number is not registered' : undefined}
              textContentType="telephoneNumber"
            />
            <View style={{ height: 16 }} />
            <Field
              label="Password"
              password
              placeholder="Enter password"
              value={password}
              onChangeText={onPassword}
              errorFill={status.kind === 'wrong_password'}
              editable={status.kind !== 'paused'}
              textContentType="password"
              onSubmitEditing={filled ? submit : undefined}
            />

            {status.kind === 'paused' ? (
              <PausedCard until={status.until} onDone={() => setStatus({ kind: 'idle' })} />
            ) : status.kind !== 'not_registered' ? (
              <View style={[styles.forgotRow, status.kind === 'wrong_password' && styles.forgotRowSplit]}>
                {status.kind === 'wrong_password' ? (
                  <FieldError
                    text={`Wrong password — ${status.triesLeft} ${status.triesLeft === 1 ? 'try' : 'tries'} left`}
                  />
                ) : null}
                <Pressable onPress={forgot} hitSlop={8}>
                  <Text style={[t.sec13Semibold, { color: c.primary700 }]}>Forgot password?</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.spacer} />

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              {status.kind === 'paused' ? (
                <>
                  <Button label="Reset password" arrow onPress={forgot} />
                  <InlineLink lead="Need help? Call" link={HELPLINE} onPress={() => navigation.navigate('ForgotHelpline', { mobile: digits(mobile) })} onLongPress={() => Linking.openURL(`tel:${HELPLINE_TEL}`)} />
                </>
              ) : status.kind === 'not_registered' ? (
                <>
                  <Button
                    label="Sign up with this number"
                    arrow
                    onPress={() => navigation.navigate('SignupAccount', { mobile: digits(mobile) })}
                  />
                  <InlineLink
                    lead="Wrong number?"
                    link="Edit number"
                    onPress={() => {
                      setStatus({ kind: 'idle' });
                      mobileRef.current?.focus();
                    }}
                  />
                </>
              ) : (
                <>
                  <Button label="Log in" arrow disabled={!filled} loading={busy} onPress={submit} />
                  <InlineLink lead="New here?" link="Sign up" onPress={() => navigation.navigate('SignupAccount')} />
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function PausedCard({ until, onDone }: { until: number; onDone: () => void }) {
  const [left, setLeft] = useState(Math.max(0, until - Date.now()));
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const id = setInterval(() => {
      const l = Math.max(0, until - Date.now());
      setLeft(l);
      if (l === 0) done.current();
    }, 1000);
    return () => clearInterval(id);
  }, [until]);
  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);
  return (
    <View style={styles.paused}>
      <Image source={d3.locked} style={{ width: 36, height: 36 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>Login paused for 30 min after 3 wrong tries</Text>
        <View style={styles.timer}>
          <Clock size={14} color={c.warningText} strokeWidth={2} />
          <Text style={[t.cap12Medium, { color: c.warningText }]}>
            Try again in {mm}:{String(ss).padStart(2, '0')}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function InlineLink({
  lead,
  link,
  onPress,
  onLongPress,
}: {
  lead: string;
  link: string;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} hitSlop={10} style={styles.inline}>
      <Text style={[t.sec13, { color: c.textSecondary }]}>{lead}</Text>
      <Text style={[t.sec13Semibold, { color: c.primary700 }]}>{link}</Text>
    </Pressable>
  );
}

const HERO_SHEET_TOP = 280;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: 320, overflow: 'hidden' },
  heroImg: { position: 'absolute', width: 727, height: 486, top: -62, left: '50%', marginLeft: -375.5 },
  heroShade: { position: 'absolute', width: 524, height: 350, top: 30, left: '50%', marginLeft: -215 },
  scroll: { flexGrow: 1, paddingTop: HERO_SHEET_TOP },
  sheet: {
    flexGrow: 1,
    backgroundColor: c.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 40,
    paddingHorizontal: 20,
    minHeight: 520,
  },
  sub: { color: c.textSecondary, marginTop: 8 },
  forgotRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 12 },
  forgotRowSplit: { justifyContent: 'space-between' },
  paused: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.warning,
    backgroundColor: c.warning50,
  },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  spacer: { flexGrow: 1, minHeight: 24 },
  footer: { gap: 14, alignItems: 'center' },
  inline: { flexDirection: 'row', gap: 4, alignItems: 'center' },
});
