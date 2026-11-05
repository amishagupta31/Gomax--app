import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { c, t } from '../../theme';
import { Page, TopBar, StepDots, Heading } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { V3ScreenProps } from '../../navigation/types';
import { errorText } from '../../api/client';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

// A1-OTP: 6-digit Firebase OTP input for password reset.
export function OtpResetScreen({ navigation, route }: V3ScreenProps<'ForgotOtp'>) {
  const { mobile, verificationId } = route.params;
  const toast = useToast();

  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendLeft, setResendLeft] = useState(RESEND_SECONDS);
  const [currentVerificationId, setCurrentVerificationId] = useState(verificationId);
  const inputRef = useRef<TextInput>(null);

  const maskedMobile = `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
  const filled = otp.length === OTP_LENGTH;

  // Countdown timer for resend
  useEffect(() => {
    if (resendLeft <= 0) return;
    const id = setInterval(() => setResendLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [resendLeft]);

  const resend = async () => {
    try {
      const confirmation = await auth().signInWithPhoneNumber('+91' + mobile);
      setCurrentVerificationId(confirmation.verificationId);
      setOtp('');
      setResendLeft(RESEND_SECONDS);
      toast('New code sent', 'success');
    } catch (e) {
      toast(errorText(e), 'error');
    }
  };

  const verify = async () => {
    if (!filled) return;
    setBusy(true);
    try {
      const credential = auth.PhoneAuthProvider.credential(currentVerificationId, otp);
      const result = await auth().signInWithCredential(credential);
      const firebaseToken = await result.user.getIdToken();
      navigation.navigate('ForgotNewPassword', { mobile, firebaseToken });
    } catch (e: any) {
      const msg =
        e?.code === 'auth/invalid-verification-code'
          ? 'Wrong code — check the SMS and try again'
          : e?.code === 'auth/code-expired'
          ? 'Code expired — tap Resend to get a new one'
          : errorText(e);
      toast(msg, 'error');
      setOtp('');
    } finally {
      setBusy(false);
    }
  };

  const onChangeOtp = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
  };

  return (
    <Page footer={<Button label="Verify" arrow disabled={!filled} loading={busy} onPress={verify} />}>
      <TopBar />
      <View style={{ marginTop: 4 }}>
        <StepDots step={2} />
      </View>
      <View style={{ height: 14 }} />
      <Heading
        title="Enter the OTP"
        subtitle={`We sent a 6-digit code to ${maskedMobile}`}
      />

      <View style={styles.otpRow}>
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.otpBox, otp.length === i && styles.otpBoxActive, otp[i] && styles.otpBoxFilled]}
            activeOpacity={0.8}
            onPress={() => inputRef.current?.focus()}
          >
            <Text style={styles.otpDigit}>{otp[i] ?? ''}</Text>
          </TouchableOpacity>
        ))}
        {/* Hidden input that captures keyboard */}
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={onChangeOtp}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          style={styles.hiddenInput}
          autoFocus
          caretHidden
        />
      </View>

      <View style={styles.resendRow}>
        {resendLeft > 0 ? (
          <Text style={[t.sec13, { color: c.textSecondary }]}>
            Resend code in{' '}
            <Text style={{ color: c.textPrimary }}>{resendLeft}s</Text>
          </Text>
        ) : (
          <TouchableOpacity onPress={resend} hitSlop={8}>
            <Text style={[t.sec13Semibold, { color: c.primary700 }]}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 24 }} />
      <Text style={[t.cap12, { color: c.textMuted, textAlign: 'center' }]}>
        Didn't get it? Check your SMS inbox or tap Resend after {RESEND_SECONDS}s.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: c.borderStrong,
    backgroundColor: c.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: c.primary700,
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: c.navyBrand,
    backgroundColor: c.navy50,
  },
  otpDigit: {
    ...t.hero24,
    fontSize: 22,
    color: c.navyBrand,
    letterSpacing: 0,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendRow: {
    marginTop: 20,
    alignItems: 'center',
  },
});
