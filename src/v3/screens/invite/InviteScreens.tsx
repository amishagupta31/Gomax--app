import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { ArrowLeft, Award, Check, Copy, Lock, MessageCircle } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3 } from '../../assets';
import { Button } from '../../components/Button';
import { CenterBar, LinkText } from '../../components/Layout';
import { Sheet } from '../../components/Sheet';
import { useToast } from '../../components/Toast';
import { Bar, Pill } from '../../components/GameArt';
import { RANKS, RANK_ORDER, RankId, nextRank, rankFor } from '../../data/ranks';
import { RUNS_PER_INVITE, Referrals, inviteMessage, referrals } from '../../api/invite';
import { fmt, initials, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

export async function shareOnWhatsApp(text: string) {
  const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
  try {
    if (await Linking.canOpenURL(url)) return void (await Linking.openURL(url));
  } catch {
    // fall through to the system share sheet
  }
  Share.share({ message: text }).catch(() => undefined);
}

function useCopy(text: string) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await Clipboard.setStringAsync(text);
    toast('Invite code copied', 'info');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

const HOW = [
  { art: d3.speechBalloon, text: 'Send code on WhatsApp' },
  { art: d3.mobilePhone, text: 'Friend signs up with code' },
  { art: d3.wrappedGift, text: 'Friend scans 1st coupon → you get runs' },
];

// C3-01 Invite & earn · joined with your code (17:14565). With nobody
// joined yet the card shows 0 and the How-it-works steps stay.
export function InviteEarnScreen({ navigation }: V3ScreenProps<'InviteEarn'>) {
  const insets = useSafeAreaInsets();
  const { user, account } = useV3();
  const code = user?.inviteCode ?? '';
  const { copied, copy } = useCopy(code);
  const [refs, setRefs] = useState<Referrals | null>(null);
  useEffect(() => {
    referrals().then(setRefs);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top }]}>
          <LinearGradient colors={[c.navy900, c.navy500]} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.darkBar}>
            <Pressable style={styles.glass} onPress={() => navigation.goBack()} accessibilityLabel="Back">
              <ArrowLeft size={20} color="#fff" strokeWidth={2} />
            </Pressable>
            <Text style={[t.title18, { flex: 1, color: '#fff', textAlign: 'center' }]}>Invite &amp; earn</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 4 }}>
            <View style={{ flex: 1, gap: 10 }}>
              <Text style={[t.title20, { color: '#fff', fontSize: 22, lineHeight: 28, width: 200 }]}>Bring applicators, earn runs</Text>
              <Pill art={d3.wrappedGift} label={`You get +${RUNS_PER_INVITE} runs each`} bg="rgba(255,255,255,0.12)" ink="#fff" />
            </View>
            <Image source={d3.handshake} style={{ width: 90, height: 90, marginTop: 6 }} />
          </View>
          <View style={styles.codeBox}>
            <Text style={[t.cap12Semibold, { color: 'rgba(255,255,255,0.7)', letterSpacing: 2.16 }]}>YOUR CODE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={styles.code}>{code}</Text>
              <Pressable style={styles.copyBtn} onPress={copy} accessibilityLabel="Copy code">
                {copied ? <Check size={16} color={c.navy900} strokeWidth={2.25} /> : <Copy size={16} color={c.navy900} strokeWidth={2} />}
                <Text style={[t.sec13Semibold, { color: c.navy900 }]}>{copied ? 'Copied' : 'Copy'}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 14 }}>
          <Text style={[t.section15, { color: c.textPrimary }]}>How it works</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {HOW.map((h) => (
              <View key={h.text} style={styles.how}>
                <Image source={h.art} style={{ width: 32, height: 32 }} />
                <Text style={[t.sec13, { color: c.textPrimary, textAlign: 'center' }]}>{h.text}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.joined} onPress={() => navigation.navigate('WhatsAppMessage', { templateId: 'friend' })} disabled={!refs?.count}>
            <Image source={d3.bustsInSilhouette} style={{ width: 36, height: 36 }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[t.body15Semibold, { color: c.textPrimary }]}>
                {refs?.count ? `${refs.count} people joined with your code` : 'No one joined yet'}
              </Text>
              <Text style={[t.cap12, { color: c.textSecondary }]}>
                {refs?.count ? `You got ${fmt(refs.runsEarned)} runs from them` : `Share your code — +${RUNS_PER_INVITE} runs for each friend who scans`}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button variant="whatsapp" icon={MessageCircle} label="Share on WhatsApp" onPress={() => shareOnWhatsApp(inviteMessage(code))} />
        <LinkText onPress={() => navigation.navigate('MyInviteQr')}>Show my QR code</LinkText>
      </View>
    </View>
  );
}

const RANK_LINE: Record<RankId, string> = {
  'naya-saathi': 'From 0 pts · 3 spins a day',
  kaarigar: 'From 500 pts · 4 spins · +10% runs',
  ustaad: 'From 2,000 pts · 5 spins · +20% runs · gift first',
  legend: 'From 5,000 pts · benefits: CLIENT to confirm',
};

// C3-02 Rank & benefits (sheet) (17:14612)
export function RankBenefitsSheet(_: V3ScreenProps<'RankBenefits'>) {
  const { account } = useV3();
  const lp = account.lifetimePoints;
  const current = rankFor(lp);
  const next = nextRank(current);
  const from = RANKS[current].min;
  const to = next ? RANKS[next].min : from;
  const ci = RANK_ORDER.indexOf(current);
  return (
    <Sheet title="Rank & benefits">
      <View style={styles.rankCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[t.body15Semibold, { color: '#fff', flex: 1 }]}>
            {next ? `${fmt(to - lp)} pts to become ${RANKS[next].name}` : 'Top rank reached'}
          </Text>
          <Image source={d3.crown} style={{ width: 22, height: 22 }} />
        </View>
        <Bar value={next ? (lp - from) / (to - from) : 1} color={c.primary500} track="rgba(255,255,255,0.15)" height={8} />
      </View>
      <View style={{ gap: 4 }}>
        {RANK_ORDER.map((id, i) => {
          const state = i < ci ? 'done' : i === ci ? 'you' : 'locked';
          return (
            <View key={id} style={[styles.rankRow, state === 'you' && { backgroundColor: c.primary50 }]}>
              <View
                style={[
                  styles.rankIc,
                  state === 'done' && { backgroundColor: c.success50 },
                  state === 'you' && { backgroundColor: c.primary700 },
                ]}
              >
                {state === 'done' ? (
                  <Check size={18} color={c.successText} strokeWidth={2.5} />
                ) : state === 'you' ? (
                  <Award size={18} color="#fff" strokeWidth={2} />
                ) : (
                  <Lock size={18} color={c.textMuted} strokeWidth={2} />
                )}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{RANKS[id].name}</Text>
                  {state === 'you' ? <Pill label="You are here" bg={c.primary100} ink={c.primary700} /> : null}
                </View>
                <Text style={[t.cap12, { color: c.textSecondary }]}>{RANK_LINE[id]}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Sheet>
  );
}

// Rank pill used on Profile / QR (Figma: primary-100 pill, award icon).
export function RankPill({ rank }: { rank: RankId }) {
  return <Pill icon={Award} label={RANKS[rank].name} bg={c.primary100} ink={c.primary700} />;
}

// C3-03 My invite QR (17:14702)
export function MyInviteQrScreen() {
  const insets = useSafeAreaInsets();
  const { user, account } = useV3();
  const code = user?.inviteCode ?? '';
  const { copied, copy } = useCopy(code);
  const name = user?.name ?? '';
  return (
    <View style={{ flex: 1, backgroundColor: c.surfacePage }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 24 }}>
        <CenterBar title="My QR code" />
        <View style={styles.qrCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.avatar}>
              <Text style={[t.sec13Semibold, { color: c.primary700 }]}>{initials(name)}</Text>
            </View>
            <View style={{ gap: 4 }}>
              <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{name}</Text>
              <RankPill rank={rankFor(account.lifetimePoints)} />
            </View>
          </View>
          <View style={styles.qrBox}>
            <QRCode value={code} size={200} color={c.navy900} backgroundColor="#fff" />
          </View>
          <Text style={[t.cap12Semibold, { color: c.textMuted, letterSpacing: 2.16 }]}>YOUR CODE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[t.title20, { color: c.textPrimary, fontSize: 22, letterSpacing: 0.5 }]}>{code}</Text>
            <Pressable style={styles.copyPill} onPress={copy} accessibilityLabel="Copy code">
              {copied ? <Check size={14} color={c.textSecondary} strokeWidth={2.25} /> : <Copy size={14} color={c.textSecondary} strokeWidth={2} />}
              <Text style={[t.cap12Medium, { color: c.textSecondary }]}>{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
          </View>
        </View>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center', marginTop: 18 }]}>Ask your friend to scan this</Text>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button variant="whatsapp" icon={MessageCircle} label="Share on WhatsApp" onPress={() => shareOnWhatsApp(inviteMessage(code))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 14, overflow: 'hidden' },
  darkBar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  glass: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  codeBox: {
    marginHorizontal: 20,
    marginTop: 14,
    height: 96,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  code: { fontFamily: 'Inter_700Bold', fontSize: 36, lineHeight: 42, letterSpacing: 1.5, color: '#fff' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, height: 34 },
  how: {
    flex: 1,
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
  },
  joined: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 4, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surfaceCard },
  rankCard: { backgroundColor: c.navy900, borderRadius: 16, padding: 14, gap: 12 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 14 },
  rankIc: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  qrCard: { backgroundColor: c.surfaceCard, borderRadius: 20, borderWidth: 1, borderColor: c.border, padding: 20, alignItems: 'center', gap: 12, marginTop: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary100, alignItems: 'center', justifyContent: 'center' },
  qrBox: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: '#fff', marginVertical: 4 },
  copyPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.surfaceMuted, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
});
