import React, { useState } from 'react';
import { errorText } from '../../api/client';
import { useToast } from '../../components/Toast';
import { Image, StyleSheet, View } from 'react-native';
import { d3 } from '../../assets';
import { Page, TopBar, Stepper, Heading } from '../../components/Layout';
import { Button } from '../../components/Button';
import { DateField, toIsoDate } from '../../components/DateField';
import { signup } from '../../api/auth';
import { useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// A1-08 Sign up · birthday (17:11503). Both dates optional; Skip also finishes.
export function SignupBirthdayScreen({ navigation }: V3ScreenProps<'SignupBirthday'>) {
  const { signupDraft, setSignupDraft, setUser, refreshAccount } = useV3();
  const toast = useToast();
  const [dob, setDob] = useState('');
  const [anniv, setAnniv] = useState('');
  const [busy, setBusy] = useState(false);

  const finish = async (withDates: boolean) => {
    const birthday = withDates ? toIsoDate(dob) : undefined;
    const anniversary = withDates ? toIsoDate(anniv) : undefined;
    setSignupDraft({ birthday, anniversary });
    setBusy(true);
    try {
      const u = await signup({
        name: signupDraft.name ?? '',
        mobile: signupDraft.mobile ?? '',
        password: signupDraft.password ?? '',
        referralCode: signupDraft.referralCode,
        birthday,
        anniversary,
      });
      setUser({ name: u.name, mobile: u.mobile, inviteCode: u.inviteCode });
      await refreshAccount();
    } catch (e) {
      toast(errorText(e), 'error');
      return;
    } finally {
      setBusy(false);
    }
    navigation.reset({ index: 0, routes: [{ name: 'SignupSuccess' }] });
  };

  return (
    <Page
      footer={
        <>
          <Button label="Continue" arrow loading={busy} onPress={() => finish(true)} />
          <Button label="Skip" variant="plain" onPress={() => finish(false)} />
        </>
      }
    >
      <TopBar />
      <Stepper step={2} label="Almost done!" />
      <View style={{ height: 28 }} />
      <Heading title="Birthday & Anniversary bonus" subtitle="Earn 2x points on your special days" />
      <View style={styles.art}>
        <Image source={d3.birthdayCake} style={styles.cake} />
      </View>
      <View style={styles.body}>
        <DateField label="Date of birth" value={dob} onChange={setDob} />
        <DateField label="Wedding anniversary" value={anniv} onChange={setAnniv} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  art: { alignItems: 'center', marginTop: 32 },
  cake: { width: 128, height: 128 },
  body: { marginTop: 38, gap: 20 },
});
