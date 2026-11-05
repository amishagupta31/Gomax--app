import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, fontFamily } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { InviteStats, RUNS_PER_INVITE, getMyInviteStats, inviteMessage, shareOnWhatsApp } from '../../services/invite';

type Props = NativeStackScreenProps<RootStackParamList, 'InviteEarn'>;

const STEPS = [
  { icon: '💬', text: 'Send code on WhatsApp' },
  { icon: '📱', text: 'Friend signs up with code' },
  { icon: '🎁', text: 'Friend scans 1st coupon → you get runs' },
];

export function InviteEarnScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { referralCode } = useApp();
  const [stats, setStats] = useState<InviteStats>({ joinedCount: 0, runsEarned: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMyInviteStats().then(setStats).catch(() => {});
  }, []);

  const copy = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LinearGradient
          colors={['#163762', '#0B1628']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
          style={[styles.hero, { paddingTop: insets.top }]}
        >
          <View style={styles.headerWrap}>
            <ScreenHeader title="Invite & earn" tone="dark" onBack={() => navigation.goBack()} />
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <Text style={styles.headline}>Bring applicators, earn runs</Text>
              <View style={styles.rewardPill}>
                <Text style={styles.rewardEmoji}>🎁</Text>
                <Text style={styles.rewardText}>You get +{RUNS_PER_INVITE} runs each</Text>
              </View>
            </View>
            <Text style={styles.handshake}>🤝</Text>
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>YOUR CODE</Text>
            <View style={styles.codeRow}>
              <Text style={styles.code}>{referralCode || '—'}</Text>
              <Pressable onPress={copy} style={styles.copyButton} accessibilityRole="button" disabled={!referralCode}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={colors.textPrimary} />
                <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.steps}>
            {STEPS.map((s) => (
              <View key={s.text} style={styles.stepCard}>
                <Text style={styles.stepIcon}>{s.icon}</Text>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.joinedCard}>
            <Text style={styles.joinedIcon}>👥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.joinedTitle}>
                {stats.joinedCount} {stats.joinedCount === 1 ? 'person' : 'people'} joined with your code
              </Text>
              <Text style={styles.joinedSub}>You got {stats.runsEarned.toLocaleString('en-IN')} runs from them</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <WhatsAppButton label="Share on WhatsApp" onPress={() => shareOnWhatsApp(inviteMessage(referralCode))} />
        <Pressable onPress={() => navigation.navigate('MyQrCode')} style={styles.linkButton} accessibilityRole="button">
          <Text style={styles.linkText}>Show my QR code</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  hero: { paddingBottom: 13 },
  headerWrap: { marginHorizontal: 0 },
  heroRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 21, marginTop: 18 },
  heroText: { flex: 1 },
  headline: { fontFamily: fontFamily.interBold, fontSize: 22, lineHeight: 29, color: colors.white, maxWidth: 190 },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
    height: 25,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  rewardEmoji: { fontSize: 12 },
  rewardText: { fontFamily: fontFamily.interMedium, fontSize: 12, color: colors.white },
  handshake: { fontSize: 76, marginLeft: 8 },
  codeBox: {
    marginHorizontal: 21,
    marginTop: 16,
    paddingVertical: 18,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  codeLabel: { fontFamily: fontFamily.interMedium, fontSize: 11, letterSpacing: 2.5, color: 'rgba(255,255,255,0.85)' },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 14 },
  code: { fontFamily: fontFamily.interBold, fontSize: 34, letterSpacing: 1, color: colors.white },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 35,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  copyText: { fontFamily: fontFamily.interSemiBold, fontSize: 14, color: colors.textPrimary },
  body: { paddingHorizontal: 21, paddingTop: 34 },
  sectionTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: 12 },
  steps: { flexDirection: 'row', gap: 9 },
  stepCard: {
    flex: 1,
    minHeight: 116,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 6,
    paddingBottom: 10,
  },
  stepIcon: { fontSize: 28, lineHeight: 36 },
  stepText: {
    fontFamily: fontFamily.interRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 6,
  },
  joinedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
    paddingHorizontal: 18,
    minHeight: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  joinedIcon: { fontSize: 30 },
  joinedTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 15, lineHeight: 20, color: colors.textPrimary },
  joinedSub: { fontFamily: fontFamily.interRegular, fontSize: 12, lineHeight: 17, color: colors.neutral500, marginTop: 2 },
  bottomBar: {
    paddingHorizontal: 21,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  linkButton: { alignItems: 'center', paddingVertical: 12 },
  linkText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.secondary700 },
});
