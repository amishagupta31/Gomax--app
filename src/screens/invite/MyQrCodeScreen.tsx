import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { colors, fontFamily } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { getMyRank } from '../../services/rank';
import { inviteMessage, shareOnWhatsApp } from '../../services/invite';

type Props = NativeStackScreenProps<RootStackParamList, 'MyQrCode'>;

const QR_INK = '#0B1526';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? 'G') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function MyQrCodeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { fullName, referralCode } = useApp();
  const [rankName, setRankName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMyRank()
      .then((r) => setRankName(r.current.name))
      .catch(() => {});
  }, []);

  const copy = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader title="My QR code" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(fullName)}</Text>
            </View>
            <View>
              <Text style={styles.name}>{fullName || 'GoMax User'}</Text>
              {rankName ? (
                <View style={styles.rankPill}>
                  <Ionicons name="ribbon-outline" size={14} color={colors.primary700} />
                  <Text style={styles.rankText}>{rankName}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.qrBox}>
            {referralCode ? <QRCode value={referralCode} size={208} color={QR_INK} backgroundColor={colors.white} /> : <View style={styles.qrEmpty} />}
          </View>

          <Text style={styles.codeLabel}>YOUR CODE</Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{referralCode || '—'}</Text>
            <Pressable onPress={copy} style={styles.copyPill} accessibilityRole="button" disabled={!referralCode}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={colors.neutral500} />
              <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.hint}>Ask your friend to scan this</Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <WhatsAppButton label="Share on WhatsApp" onPress={() => shareOnWhatsApp(inviteMessage(referralCode))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary50 },
  content: { flex: 1, paddingHorizontal: 21, paddingTop: 18 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1E8E4',
    alignItems: 'center',
    paddingTop: 13,
    paddingBottom: 14,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.orange100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.interMedium, fontSize: 15, color: colors.primary700 },
  name: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.textPrimary },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 4,
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: colors.orange100,
  },
  rankText: { fontFamily: fontFamily.interMedium, fontSize: 12, color: colors.primary700 },
  qrBox: {
    marginTop: 18,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  qrEmpty: { width: 208, height: 208 },
  codeLabel: { marginTop: 10, fontFamily: fontFamily.interMedium, fontSize: 11, letterSpacing: 2.5, color: colors.neutral400 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  code: { fontFamily: fontFamily.interBold, fontSize: 20, letterSpacing: 0.5, color: colors.textPrimary },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  copyText: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500 },
  hint: { marginTop: 22, textAlign: 'center', fontFamily: fontFamily.interRegular, fontSize: 14, color: colors.neutral500 },
  bottomBar: {
    paddingHorizontal: 21,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.white,
  },
});
