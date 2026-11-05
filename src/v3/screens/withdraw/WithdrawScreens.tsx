import React, { useEffect, useState } from 'react';
import { errorText } from '../../api/client';
import { Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { CircleCheck, CircleX, Clock, Copy, Eye, Landmark, MessageCircle, QrCode, ShieldCheck, X } from 'lucide-react-native';
import { c, t, HELPLINE, HELPLINE_TEL } from '../../theme';
import { d3 } from '../../assets';
import { Page, CenterBar, LinkText, SectionLabel } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { FormField } from '../../components/FormField';
import { Sheet } from '../../components/Sheet';
import { Timeline } from '../../components/Timeline';
import { WithdrawLimits, requestWithdrawal, withdrawLimits, withdrawalById } from '../../api/withdrawals';
import { WITHDRAW_MIN, fmt, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// B3-01 Withdraw (17:19007)
export function WithdrawScreen({ navigation }: V3ScreenProps<'Withdraw'>) {
  const { account } = useV3();
  const [upi, setUpi] = useState(account.upi?.id ?? '');
  const [amount, setAmount] = useState(String(Math.min(1000, account.points)));
  const [focus, setFocus] = useState(false);
  const [limits, setLimits] = useState<WithdrawLimits | null>(null);
  useEffect(() => {
    withdrawLimits().then(setLimits);
  }, []);
  const min = limits?.minPoints ?? WITHDRAW_MIN;
  const n = Number(amount.replace(/\D/g, '')) || 0;
  const chips = [500, 1000, account.points].filter((v, i, a) => v <= account.points && a.indexOf(v) === i);
  const tooLow = n > 0 && n < min;
  const overBalance = n > account.points;
  const overLimit = limits ? n > limits.maxPerRequest : false;
  const tooHigh = overBalance || overLimit;
  const ok = /^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.trim()) && n >= min && !tooHigh;

  return (
    <Page
      bg={c.surfacePage}
      footerBordered
      footer={<Button label={`Withdraw ₹${fmt(n)}`} disabled={!ok} onPress={() => navigation.navigate('WithdrawConfirm', { amount: n, upiId: upi.trim() })} />}
    >
      <CenterBar title="Withdraw" />
      <View style={{ gap: 14, paddingTop: 8 }}>
        <View style={styles.balance}>
          <Image source={d3.coin} style={{ width: 28, height: 28 }} />
          <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{fmt(account.points)} pts available</Text>
        </View>
        <SectionLabel>PAY TO</SectionLabel>
        <View style={{ gap: 10 }}>
          <FormField label="UPI ID" placeholder="e.g. ram@ybl" autoCapitalize="none" keyboardType="email-address" value={upi} onChangeText={setUpi} />
          <Pressable style={styles.qrLink} onPress={() => navigation.navigate('AddUpi')}>
            <QrCode size={16} color={c.primary700} strokeWidth={2} />
            <Text style={[t.sec13Semibold, { color: c.primary700 }]}>or upload UPI QR</Text>
          </Pressable>
        </View>
        <SectionLabel>AMOUNT</SectionLabel>
        <View style={styles.chips}>
          {chips.map((v) => {
            const on = n === v;
            const label = v === account.points && v !== 500 && v !== 1000 ? `₹${fmt(v)} (all)` : `₹${fmt(v)}`;
            return (
              <Pressable key={v} onPress={() => setAmount(String(v))} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                <Text style={[t.sec13Medium, { color: on ? '#fff' : c.textPrimary }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.amount, focus && { borderColor: c.primary500 }, (tooLow || tooHigh) && { borderColor: c.danger }]}>
          <Text style={styles.rupee}>₹</Text>
          <TextInput
            value={n ? fmt(n) : ''}
            onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={c.textMuted}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            style={styles.amountText}
          />
        </View>
        <Text style={[t.cap12, { color: tooLow || tooHigh ? c.dangerText : c.textSecondary }]}>
          {overBalance
            ? `You have only ₹${fmt(account.points)}`
            : overLimit
              ? `Up to ₹${fmt(limits!.maxPerRequest)} at a time`
              : tooLow
                ? `Min ₹${fmt(min)}`
                : `Min ₹${fmt(min)}${limits ? ` · Max ₹${fmt(limits.maxPerRequest)} at a time, ₹${fmt(limits.maxPerMonth)} a month` : ''} · Paid to your UPI in 24–48 hrs`}
        </Text>
      </View>
    </Page>
  );
}

// B3-02 Withdraw · confirm (sheet) (17:19079)
export function WithdrawConfirmSheet({ navigation, route }: V3ScreenProps<'WithdrawConfirm'>) {
  const { account, refreshAccount } = useV3();
  const toast = useToast();
  const { amount, upiId } = route.params;
  const [busy, setBusy] = useState(false);
  // Only the UPI saved on the account has a checked name; a new one has none yet.
  const upiName = account.upi?.id === upiId ? account.upi.name : '';
  const go = async () => {
    setBusy(true);
    try {
      await requestWithdrawal(amount, upiId);
      await refreshAccount(); // points are locked on request
    } catch (e) {
      toast(errorText(e), 'error');
      setBusy(false);
      return;
    }
    setBusy(false);
    navigation.reset({ index: 1, routes: [{ name: 'Tabs', params: { screen: 'Wallet' } }, { name: 'WithdrawDone', params: { amount } }] });
  };
  return (
    <Sheet
      scroll={false}
      footer={
        <>
          <Button label="Yes, withdraw" loading={busy} onPress={go} />
          <Button label="Go back" variant="plain" onPress={() => navigation.goBack()} />
        </>
      }
    >
      <View style={{ alignItems: 'center', paddingTop: 6 }}>
        <View style={styles.statusIcon}>
          <Landmark size={36} color={c.primary700} strokeWidth={1.75} />
        </View>
        <Text style={[t.title18, { color: c.textPrimary, marginTop: 16 }]}>Withdraw ₹{fmt(amount)}?</Text>
        <Text style={[t.sec13, { color: c.textSecondary, marginTop: 6 }]}>GoMax will pay you in 24–48 hrs</Text>
      </View>
      <View style={styles.summary}>
        <SumRow label="Amount" value={`₹${fmt(amount)}`} />
        <SumRow label="Pay to" value={upiName ? `${upiId} · ${upiName}` : upiId} />
      </View>
      <View style={{ height: 10 }} />
    </Sheet>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={[t.sec13, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>{value}</Text>
    </View>
  );
}

// B3-03 Withdraw · done (17:19102)
export function WithdrawDoneScreen({ navigation, route }: V3ScreenProps<'WithdrawDone'>) {
  return (
    <Page
      footerBordered
      footer={
        <>
          <Button label="Back to Wallet" onPress={() => navigation.navigate('Tabs', { screen: 'Wallet', params: { tab: 'points' } })} />
          <LinkText onPress={() => navigation.replace('HistoryAll', { wallet: 'points' })}>See in History</LinkText>
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 30 }}>
        <Animated.Image entering={ZoomIn.springify().damping(10)} source={d3.checkMarkButton} style={{ width: 96, height: 96 }} />
        <Text style={styles.big}>Done!</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>GoMax will pay you in 24–48 hrs</Text>
        <View style={[styles.pill, { backgroundColor: c.warning50 }]}>
          <Clock size={14} color={c.warningText} strokeWidth={2} />
          <Text style={[t.sec13Semibold, { color: c.warningText }]}>{fmt(route.params.amount)} pts on hold</Text>
        </View>
      </View>
    </Page>
  );
}

const shareProof = (w: ReturnType<typeof withdrawalById>) =>
  Share.share({ message: `GoMax payout ₹${fmt(w.amount)} paid to ${w.upiId} on ${w.paidAt}. UTR ${w.utr}` });

// B3-04 Withdraw · paid · proof + UTR (17:19124)
export function WithdrawPaidScreen({ navigation, route }: V3ScreenProps<'WithdrawPaid'>) {
  const toast = useToast();
  const w = withdrawalById(route.params.id);
  const [copied, setCopied] = useState(false);
  return (
    <Page
      footerBordered
      footer={
        <>
          <Button label="Share on WhatsApp" variant="whatsapp" icon={MessageCircle} onPress={() => shareProof(w)} />
          <LinkText onPress={() => navigation.navigate('Tabs', { screen: 'Wallet', params: { tab: 'points' } })}>Back to Wallet</LinkText>
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 8 }}>
        <View style={{ height: 96, justifyContent: 'center' }}>
          <Animated.Image entering={ZoomIn.springify()} source={d3.checkMarkButton} style={{ width: 72, height: 72 }} />
        </View>
        <Text style={styles.big}>₹{fmt(w.amount)} paid!</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>
          GoMax sent it to {w.upiId} on {w.paidAt}.
        </Text>
        <Pressable style={styles.proofCard} onPress={() => navigation.navigate('WithdrawProof', { id: w.id })}>
          <View style={styles.shot}>
            <CircleCheck size={22} color={c.success} strokeWidth={2} />
            <Text style={[t.cap12Medium, { color: '#fff' }]}>₹{fmt(w.amount)}</Text>
            <Text style={[t.cap12, { color: '#cbd5e1' }]}>Paid</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[t.body15Semibold, { color: c.textPrimary }]}>Payment proof</Text>
            <Text style={[t.cap12, { color: c.textSecondary }]}>Screenshot uploaded by GoMax</Text>
            <View style={styles.view}>
              <Eye size={14} color={c.primary700} strokeWidth={2} />
              <Text style={[t.sec13Semibold, { color: c.primary700 }]}>View</Text>
            </View>
          </View>
        </Pressable>
        <View style={styles.utr}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[t.cap12, { color: c.textSecondary }]}>UTR / reference no.</Text>
            <Text style={[t.title18, { color: c.textPrimary }]}>{w.utr}</Text>
          </View>
          <Pressable
            style={styles.copy}
            onPress={async () => {
              await Clipboard.setStringAsync(w.utr ?? '');
              setCopied(true);
              toast('UTR copied', 'info');
            }}
          >
            <Copy size={16} color={c.successText} strokeWidth={2} />
            <Text style={[t.sec13Semibold, { color: c.successText }]}>{copied ? 'Copied' : 'Copy'}</Text>
          </Pressable>
        </View>
        <Text style={[t.cap12, { color: c.textSecondary, textAlign: 'center' }]}>Check this number in your bank or UPI app.</Text>
        <View style={styles.statusCard}>
          <Timeline
            steps={[
              { title: 'Requested', sub: w.requestedAt, state: 'done' },
              { title: 'GoMax is paying you', sub: w.approvedAt, state: 'done' },
              { title: 'Paid · proof added', sub: w.paidAt, state: 'done' },
            ]}
          />
        </View>
      </View>
    </Page>
  );
}

// B3-05 Withdraw · payment proof · full view (17:19182)
export function WithdrawProofScreen({ navigation, route }: V3ScreenProps<'WithdrawProof'>) {
  const insets = useSafeAreaInsets();
  const w = withdrawalById(route.params.id);
  return (
    <View style={{ flex: 1, backgroundColor: c.navy900 }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={styles.darkBar}>
          <Pressable style={styles.darkBack} onPress={() => navigation.goBack()} accessibilityLabel="Close">
            <X size={20} color="#fff" strokeWidth={2} />
          </Pressable>
          <Text style={[t.title18, { color: '#fff', flex: 1, textAlign: 'center' }]}>Payment proof</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.receipt}>
          <Text style={[t.cap12, { color: c.textMuted }]}>PhonePe · screenshot</Text>
          <Image source={d3.checkMarkButton} style={{ width: 48, height: 48 }} />
          <Text style={[t.body15Semibold, { color: c.successText }]}>Payment successful</Text>
          <Text style={styles.receiptAmt}>₹{fmt(w.amount)}</Text>
          <View style={styles.receiptDiv} />
          {[
            ['Paid to', w.upiName],
            ['UPI ID', w.upiId],
            ['UTR', w.utr ?? ''],
            ['Date', w.paidAt ?? ''],
          ].map(([k, v]) => (
            <View key={k} style={styles.receiptRow}>
              <Text style={[t.sec13, { color: c.textSecondary }]}>{k}</Text>
              <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>{v}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <ShieldCheck size={16} color="#9fb0c8" strokeWidth={1.75} />
          <Text style={[t.cap12, { color: '#9fb0c8' }]}>Uploaded by GoMax · {w.paidAt}</Text>
        </View>
      </ScrollView>
      <View style={[styles.lightFooter, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button label="Share on WhatsApp" variant="whatsapp" icon={MessageCircle} onPress={() => shareProof(w)} />
        <LinkText onPress={() => shareProof(w)}>Save to phone</LinkText>
      </View>
    </View>
  );
}

// B3-06 Withdraw · not approved (17:19217)
export function WithdrawRejectedScreen({ navigation, route }: V3ScreenProps<'WithdrawRejected'>) {
  const w = withdrawalById(route.params.id);
  return (
    <Page
      footerBordered
      footer={
        <>
          <Button label="Fix UPI details" onPress={() => navigation.replace('Withdraw')} />
          <LinkText onPress={() => Linking.openURL(`tel:${HELPLINE_TEL}`)}>{`Call GoMax helpline · ${HELPLINE}`}</LinkText>
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 20 }}>
        <Animated.Image entering={ZoomIn.springify()} source={d3.crossMark} style={{ width: 96, height: 96 }} />
        <Text style={styles.big}>Not approved</Text>
        <Text style={[t.body15, { color: c.textSecondary }]}>Your money was not sent.</Text>
        <View style={styles.reason}>
          <CircleX size={18} color={c.dangerText} strokeWidth={2} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[t.cap12, { color: c.textSecondary }]}>Reason</Text>
            <Text style={[t.body15Medium, { color: c.dangerText }]}>{w.reason}</Text>
          </View>
        </View>
        <View style={[styles.pill, { backgroundColor: c.success50 }]}>
          <CircleCheck size={14} color={c.successText} strokeWidth={2} />
          <Text style={[t.sec13Semibold, { color: c.successText }]}>{fmt(w.amount)} pts are back in your wallet</Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  balance: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.success50 },
  qrLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  chipOn: { backgroundColor: c.navy900 },
  chipOff: { backgroundColor: c.surfaceCard, borderWidth: 1, borderColor: c.borderStrong, paddingVertical: 7 },
  amount: { height: 64, borderRadius: 14, borderWidth: 2, borderColor: c.borderStrong, backgroundColor: c.surfaceCard, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16 },
  rupee: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: c.textSecondary },
  amountText: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.45, color: c.textPrimary, paddingVertical: 0, outlineStyle: 'none' } as object,
  statusIcon: { width: 72, height: 72, borderRadius: 999, backgroundColor: c.primary100, alignItems: 'center', justifyContent: 'center' },
  summary: { gap: 10, padding: 16, borderRadius: 12, backgroundColor: c.surfaceMuted },
  big: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: c.navyBrand, textAlign: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  proofCard: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  shot: { width: 72, height: 104, borderRadius: 10, backgroundColor: c.navy700, alignItems: 'center', justifyContent: 'center', gap: 4 },
  view: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: c.primary50 },
  utr: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.success50 },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff' },
  statusCard: { alignSelf: 'stretch', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  darkBar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  darkBack: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  receipt: { marginTop: 8, borderRadius: 16, backgroundColor: '#fff', padding: 18, alignItems: 'center', gap: 8 },
  receiptAmt: { fontFamily: 'Inter_700Bold', fontSize: 36, lineHeight: 40, letterSpacing: -0.54, color: c.textPrimary },
  receiptDiv: { alignSelf: 'stretch', height: 1, backgroundColor: c.border, marginVertical: 4 },
  receiptRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  lightFooter: { backgroundColor: c.surfaceCard, paddingHorizontal: 20, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: c.border },
  reason: { alignSelf: 'stretch', flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: c.danger50 },
});
