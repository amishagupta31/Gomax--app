import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleCheck } from 'lucide-react-native';
import { c, t } from '../../theme';
import { Page, TopBar, Stepper, Heading } from '../../components/Layout';
import { Field, FieldError } from '../../components/Field';
import { Button } from '../../components/Button';
import { PasswordRules, rulesOk } from '../../components/PasswordRules';
import { digits, formatMobile, isRegistered, lookupReferral } from '../../api/auth';
import { useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// A1-07 Sign up · account (17:11467). Name, mobile (= Login ID), password ×2
// with live rules, optional referral code that resolves to the inviter.
export function SignupAccountScreen({ navigation, route }: V3ScreenProps<'SignupAccount'>) {
  const { signupDraft, setSignupDraft } = useV3();
  const [name, setName] = useState(signupDraft.name ?? '');
  const [mobile, setMobile] = useState(formatMobile(route.params?.mobile ?? signupDraft.mobile ?? ''));
  const [pw, setPw] = useState(signupDraft.password ?? '');
  const [confirm, setConfirm] = useState(signupDraft.password ?? '');
  const [ref, setRef] = useState(signupDraft.referralCode ?? '');
  const [inviter, setInviter] = useState<string | null>(null);
  const [refChecked, setRefChecked] = useState(false);
  const [taken, setTaken] = useState(false);

  useEffect(() => {
    let live = true;
    setRefChecked(false);
    if (ref.trim().length < 4) {
      setInviter(null);
      return;
    }
    lookupReferral(ref).then((n) => {
      if (!live) return;
      setInviter(n);
      setRefChecked(true);
    });
    return () => {
      live = false;
    };
  }, [ref]);

  const valid = name.trim().length > 1 && digits(mobile).length === 10 && rulesOk(pw, confirm);

  const next = async () => {
    if (await isRegistered(mobile)) {
      setTaken(true);
      return;
    }
    setSignupDraft({ name: name.trim(), mobile: digits(mobile), password: pw, referralCode: inviter ? ref.trim().toUpperCase() : undefined });
    navigation.navigate('SignupBirthday');
  };

  return (
    <Page footer={<Button label="Continue" arrow disabled={!valid} onPress={next} />}>
      <TopBar />
      <Stepper step={1} label="Account" />
      <View style={{ height: 28 }} />
      <Heading title="Create your account" subtitle="Takes less than a minute" />
      <View style={styles.body}>
        <Field label="Full name *" placeholder="Enter your full name" value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" />
        <Field
          label="Mobile number (your Login ID) *"
          prefix="+91"
          placeholder="Enter mobile number"
          keyboardType="number-pad"
          maxLength={11}
          value={mobile}
          onChangeText={(v) => {
            setMobile(formatMobile(v));
            setTaken(false);
          }}
          error={taken ? 'This number is already registered — log in instead' : undefined}
        />
        <View style={{ gap: 16 }}>
          <Field label="New password *" password placeholder="Create a password" value={pw} onChangeText={setPw} textContentType="newPassword" />
          <Field label="Confirm password *" password placeholder="Type it again" value={confirm} onChangeText={setConfirm} textContentType="newPassword" />
          <PasswordRules pw={pw} confirm={confirm} showStrength />
        </View>
        <View style={{ gap: 6 }}>
          <Field label="Referral code (If any)" placeholder="e.g. RAMESH25" autoCapitalize="characters" value={ref} onChangeText={setRef} />
          {inviter ? (
            <View style={styles.ok}>
              <CircleCheck size={14} color={c.successText} strokeWidth={2} />
              <Text style={[t.cap12Medium, { color: c.successText }]}>Invited by {inviter}</Text>
            </View>
          ) : refChecked ? (
            <FieldError text="Code not found — check and try again" />
          ) : null}
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 14 },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
