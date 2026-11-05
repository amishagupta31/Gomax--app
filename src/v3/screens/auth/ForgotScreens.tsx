import React, { useState } from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Clock, LockOpen, MessageCircle, Phone, Send, UserCheck, LucideIcon } from 'lucide-react-native';
import { c, t, HELPLINE, HELPLINE_TEL } from '../../theme';
import { d3, img } from '../../assets';
import { Page, TopBar, StepDots, Heading, SectionLabel, LinkText } from '../../components/Layout';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { PasswordRules, rulesOk } from '../../components/PasswordRules';
import { WhatsAppChat } from '../../components/WhatsAppChat';
import { digits, formatMobile, isRegistered, requestHelplineReset, setNewPassword } from '../../api/auth';
import { firstName, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

const WA_BUSINESS = '919215844410'; // TODO(client): WhatsApp Business number

const openTel = () => Linking.openURL(`tel:${HELPLINE_TEL}`);
const openHelplineWa = () => Linking.openURL(`https://wa.me/${HELPLINE_TEL.replace('+', '')}`);

// A1-10 Forgot · mobile (17:11539)
export function ForgotMobileScreen({ navigation, route }: V3ScreenProps<'ForgotMobile'>) {
  const [mobile, setMobile] = useState(formatMobile(route.params?.mobile ?? ''));
  const [error, setError] = useState<string>();
  const valid = digits(mobile).length === 10;

  const next = async () => {
    if (!(await isRegistered(mobile))) {
      setError('This number is not registered');
      return;
    }
    navigation.navigate('ForgotVerify', { mobile: digits(mobile) });
  };

  return (
    <Page footer={<Button label="Continue" arrow disabled={!valid} onPress={next} />}>
      <TopBar />
      <View style={{ marginTop: 4 }}>
        <StepDots step={1} />
      </View>
      <View style={{ height: 14 }} />
      <Heading title="Forgot password?" subtitle="Enter the mobile number you signed up with" />
      <View style={{ marginTop: 40 }}>
        <Field
          label="Registered mobile number"
          prefix="+91"
          placeholder="Enter mobile number"
          keyboardType="number-pad"
          maxLength={11}
          autoFocus
          value={mobile}
          onChangeText={(v) => {
            setMobile(formatMobile(v));
            setError(undefined);
          }}
          error={error}
        />
      </View>
    </Page>
  );
}

// A1-11 Forgot · verify WhatsApp (17:11556)
export function ForgotVerifyScreen({ navigation, route }: V3ScreenProps<'ForgotVerify'>) {
  const m = formatMobile(route.params.mobile);
  const message = `RESET ${m}`;

  const openWhatsApp = async () => {
    const url = `https://wa.me/${WA_BUSINESS}?text=${encodeURIComponent(message)}`;
    // In production the reply link deep-links back into A1-13. Until the
    // WhatsApp Business bot is live, show the in-app mock of that chat (A1-12).
    if (process.env.EXPO_PUBLIC_WA_LIVE === '1') await Linking.openURL(url);
    else navigation.navigate('ForgotChat', { mobile: route.params.mobile });
  };

  return (
    <Page
      footer={
        <View style={{ gap: 12 }}>
          <Button label="Open WhatsApp" variant="whatsapp" icon={MessageCircle} onPress={openWhatsApp} />
          <LinkText onPress={() => navigation.navigate('ForgotHelpline', { mobile: route.params.mobile })}>
            No WhatsApp on this number?
          </LinkText>
        </View>
      }
    >
      <View style={styles.leftCol}>
        <TopBar style={{ height: 48 }} />
        <StepDots step={2} />
        <View style={styles.art}>
          <Animated.Image entering={ZoomIn} source={d3.speechBalloon} style={{ width: 120, height: 120 }} />
        </View>
        <Text style={styles.bigTitle}>Verify on WhatsApp</Text>
        <Text style={[t.body15, { color: c.textSecondary }]}>
          Send one message from {m}. We will reply with a link to set a new password.
        </Text>
        <View style={styles.msgPreview}>
          <Text style={[t.cap12Semibold, { color: c.textSecondary, letterSpacing: 0.48 }]}>YOUR MESSAGE (READY TO SEND)</Text>
          <View style={styles.waBubble}>
            <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{message}</Text>
          </View>
        </View>
        <View style={{ gap: 14 }}>
          <HowStep icon={MessageCircle} text="Tap the green button — WhatsApp opens" />
          <HowStep icon={Send} text="Press send. Don’t change the message" />
          <HowStep icon={LockOpen} text="Tap the link we reply with" />
        </View>
      </View>
    </Page>
  );
}

function HowStep({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <View style={styles.howRow}>
      <View style={styles.howIcon}>
        <Icon size={18} color={c.whatsapp} strokeWidth={2} />
      </View>
      <Text style={[t.body15Medium, { color: c.textPrimary, flex: 1 }]}>{text}</Text>
    </View>
  );
}

// A1-12 Forgot · WhatsApp chat (17:11593) — mock of the bot reply.
export function ForgotChatScreen({ navigation, route }: V3ScreenProps<'ForgotChat'>) {
  const { user } = useV3();
  const name = firstName(user?.name) || 'Ram';
  return (
    <WhatsAppChat
      onBack={() => navigation.goBack()}
      messages={[
        { from: 'me', text: `RESET ${formatMobile(route.params.mobile)}` },
        {
          from: 'gomax',
          lines: [`Namaste ${name} 👋`, 'Tap the link to set a new password. It works once and expires in 15 minutes.'],
          link: 'gomax.app/r/8KQ2-X7',
          footnote: 'Didn’t ask for this? Ignore this message.',
        },
        {
          from: 'cta',
          label: 'Set new password',
          onPress: () => navigation.navigate('ForgotNewPassword', { mobile: route.params.mobile }),
        },
      ]}
    />
  );
}

// A1-13 Forgot · new password (17:11615)
export function ForgotNewPasswordScreen({ navigation, route }: V3ScreenProps<'ForgotNewPassword'>) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    await setNewPassword(route.params.mobile, pw);
    setBusy(false);
    navigation.reset({ index: 0, routes: [{ name: 'ForgotSuccess' }] });
  };
  return (
    <Page footer={<Button label="Save password" arrow disabled={!rulesOk(pw, confirm)} loading={busy} onPress={save} />}>
      <TopBar />
      <View style={{ marginTop: 4 }}>
        <StepDots step={3} />
      </View>
      <View style={{ height: 14 }} />
      <Heading title="Set a new password" subtitle="You'll use this to log in from now on" />
      <View style={{ marginTop: 40, gap: 16 }}>
        <Field label="New password" password autoFocus placeholder="Create a password" value={pw} onChangeText={setPw} />
        <Field label="Confirm password" password placeholder="Type it again" value={confirm} onChangeText={setConfirm} />
        <PasswordRules pw={pw} confirm={confirm} />
      </View>
    </Page>
  );
}

// A1-14 Forgot · success (17:11643)
export function ForgotSuccessScreen({ navigation }: V3ScreenProps<'ForgotSuccess'>) {
  return (
    <Page footer={<Button label="Log in" arrow onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} />}>
      <View style={styles.centerCol}>
        <Animated.Image entering={ZoomIn.springify().damping(10)} source={d3.checkMarkButton} style={{ width: 102, height: 102 }} />
        <View style={{ height: 20 }} />
        <Heading title="Password changed" subtitle="Log in with your mobile number and new password" />
      </View>
    </Page>
  );
}

// A1-15 Forgot · other ways (helpline) (17:11651)
export function ForgotHelplineScreen({ navigation, route }: V3ScreenProps<'ForgotHelpline'>) {
  const [busy, setBusy] = useState(false);
  const request = async () => {
    setBusy(true);
    await requestHelplineReset(route.params?.mobile ?? '');
    setBusy(false);
    navigation.navigate('ForgotHelplineSent');
  };
  return (
    <Page
      footerBordered
      footer={
        <>
          <Button label="Request a reset" loading={busy} onPress={request} />
          <LinkText onPress={() => navigation.navigate('Login')}>Back to login</LinkText>
        </>
      }
    >
      <View style={styles.leftCol}>
        <TopBar style={{ height: 48 }} />
        <Text style={styles.bigTitle}>Other ways to reset</Text>
        <Text style={[t.body15, { color: c.textSecondary }]}>
          No WhatsApp? No problem. Call or WhatsApp the GoMax helpline — they will reset it for you. Your points are safe.
        </Text>
        <View style={styles.card}>
          <View style={styles.helpTop}>
            <View style={styles.helpAvatar}>
              <Image source={d3.telephoneReceiver} style={{ width: 30, height: 30 }} />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={[t.section15, { color: c.textPrimary }]}>GoMax helpline</Text>
              <Text style={[t.cap12, { color: c.textSecondary }]}>Call or WhatsApp the helpline</Text>
              <Text style={[t.sec13Medium, { color: c.navyBrand }]}>+91 {HELPLINE}</Text>
            </View>
          </View>
          <View style={styles.helpBtns}>
            <Button label="Call" variant="primaryOutline" onPress={openTel} style={styles.flex} />
            <Button label="WhatsApp" variant="whatsapp" icon={MessageCircle} onPress={openHelplineWa} style={styles.flex} />
          </View>
        </View>
        <SectionLabel>HOW IT WORKS</SectionLabel>
        <View style={[styles.card, { gap: 12 }]}>
          <HelpStep icon={Phone} text="Call or WhatsApp the GoMax helpline" />
          <HelpStep icon={UserCheck} text="The helpline checks it is really you" />
          <HelpStep icon={LockOpen} text="We send you a new temporary password. Log in and set your own." />
        </View>
      </View>
    </Page>
  );
}

function HelpStep({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <View style={styles.howRow}>
      <View style={[styles.howIcon, { backgroundColor: c.surfaceMuted }]}>
        <Icon size={18} color={c.navyBrand} strokeWidth={1.75} />
      </View>
      <Text style={[t.sec13, { color: c.textPrimary, flex: 1 }]}>{text}</Text>
    </View>
  );
}

// A1-16 Forgot · helpline request sent (17:11690)
export function ForgotHelplineSentScreen({ navigation }: V3ScreenProps<'ForgotHelplineSent'>) {
  return (
    <Page
      footerBordered
      footer={
        <>
          <Button label="Back to login" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} />
          <LinkText onPress={openTel}>{`Call helpline ${HELPLINE}`}</LinkText>
        </>
      }
    >
      <View style={[styles.centerCol, { justifyContent: 'flex-start', paddingTop: 8, gap: 16 }]}>
        <Animated.Image entering={ZoomIn} source={img.workerHelpline} style={{ width: 176, height: 235 }} resizeMode="contain" />
        <Text style={[styles.bigTitle, { textAlign: 'center' }]}>Request sent to GoMax helpline</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>
          The GoMax helpline will call you soon with a temporary password. Log in with it, then set your own password.
        </Text>
        <View style={styles.pill}>
          <Clock size={14} color={c.textSecondary} strokeWidth={2} />
          <Text style={[t.cap12Medium, { color: c.textSecondary }]}>Usually within 1 working day</Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  leftCol: { gap: 16, paddingTop: 8 },
  centerCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  art: { height: 140, alignItems: 'center', justifyContent: 'center' },
  bigTitle: { ...t.hero24, fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: c.navyBrand },
  msgPreview: { backgroundColor: c.surfaceMuted, borderRadius: 16, padding: 16, gap: 10 },
  waBubble: { backgroundColor: c.whatsappBubble, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start' },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  howIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.success50, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16, gap: 14, backgroundColor: c.surfaceCard },
  helpTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: c.primary100, alignItems: 'center', justifyContent: 'center' },
  helpBtns: { flexDirection: 'row', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: c.surfaceMuted,
  },
});
