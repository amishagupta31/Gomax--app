import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { useApp } from '../../state/AppContext';
import { GiftRow } from '../../services/gifts';
import { getGift } from '../../services/giftOrders';
import { TruckIcon } from '../../components/SurfaceIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'GiftDetail'>;

export const RUNS_TEAL = '#1B8AA6';
export const RUNS_TINT = '#E3F2F7';

export function GiftDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { runs } = useApp();
  const [gift, setGift] = useState<GiftRow | null>(null);

  useEffect(() => {
    getGift(route.params.giftId).then(setGift).catch(() => {});
  }, [route.params.giftId]);

  if (!gift) return <View style={styles.root} />;

  const cost = gift.runs_cost;
  const enough = runs >= cost;
  const missing = cost - runs;
  const outOfStock = gift.stock <= 0;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.hero}>
          {gift.image_url ? (
            <Image source={{ uri: gift.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <Text style={styles.heroEmoji}>🎁</Text>
          )}
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.back, { top: insets.top + 12 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={[styles.balancePill, { top: insets.top + 16 }]}>
            <Text style={styles.pillEmoji}>🎁</Text>
            <Text style={styles.balanceText}>{runs.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{gift.name}</Text>
            <View style={styles.pricePill}>
              <Text style={styles.priceEmoji}>🎁</Text>
              <Text style={styles.priceText}>{cost.toLocaleString('en-IN')} runs</Text>
            </View>
          </View>

          {enough ? (
            <View style={styles.enoughBox}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>You have</Text>
                <Text style={styles.balanceValue}>{runs.toLocaleString('en-IN')} runs</Text>
              </View>
              <View style={[styles.balanceRow, { marginTop: 10 }]}>
                <Text style={styles.balanceLabel}>After this gift</Text>
                <Text style={styles.balanceValue}>{(runs - cost).toLocaleString('en-IN')} runs</Text>
              </View>
            </View>
          ) : (
            <View style={styles.needBox}>
              <View style={styles.balanceRow}>
                <Text style={styles.needTitle}>{missing.toLocaleString('en-IN')} more runs needed</Text>
                <Text style={styles.needCount}>
                  {runs} / {cost}
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.min(100, Math.round((runs / cost) * 100))}%` }]} />
              </View>
              <View style={styles.earnRow}>
                {[
                  { label: 'Spin', emoji: '⭐', to: 'SpinWheel' as const },
                  { label: 'Challenge', emoji: '🏆', to: 'Challenges' as const },
                  { label: 'Invite', emoji: '🤝', to: 'InviteEarn' as const },
                ].map((e) => (
                  <Pressable key={e.label} style={styles.earnChip} onPress={() => navigation.navigate(e.to)}>
                    <Text style={styles.earnEmoji}>{e.emoji}</Text>
                    <Text style={styles.earnText}>{e.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="cube-outline" size={20} color={colors.primary700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>What's inside</Text>
                <Text style={styles.infoSub}>{gift.description || 'Item details coming soon'}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.infoDivider]}>
              <View style={styles.infoIcon}>
                <TruckIcon size={20} color={colors.primary700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Free delivery</Text>
                <Text style={styles.infoSub}>Reaches in 7–10 days</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        {enough && !outOfStock ? (
          <Pressable style={styles.primary} onPress={() => navigation.navigate('GiftAddress', { giftId: gift.id })}>
            <Text style={styles.primaryText}>Get this gift</Text>
          </Pressable>
        ) : (
          <View style={[styles.primary, styles.disabled]}>
            <Text style={[styles.primaryText, styles.disabledText]}>
              {outOfStock ? 'Out of stock' : `Need ${missing.toLocaleString('en-IN')} more runs`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  hero: { height: 347, backgroundColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroEmoji: { fontSize: 110 },
  back: {
    position: 'absolute',
    left: 21,
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balancePill: {
    position: 'absolute',
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(230,243,247,0.95)',
  },
  pillEmoji: { fontSize: 16 },
  balanceText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: RUNS_TEAL },
  body: { paddingHorizontal: 21, paddingTop: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1, fontFamily: fontFamily.interBold, fontSize: 22, color: colors.textPrimary },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 31,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: RUNS_TINT,
  },
  priceEmoji: { fontSize: 13 },
  priceText: { fontFamily: fontFamily.interSemiBold, fontSize: 13, color: RUNS_TEAL },
  enoughBox: { marginTop: 14, borderRadius: 14, backgroundColor: '#E6F6EC', padding: 15 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { fontFamily: fontFamily.interRegular, fontSize: 13, color: colors.neutral500 },
  balanceValue: { fontFamily: fontFamily.interSemiBold, fontSize: 13, color: colors.textPrimary },
  needBox: { marginTop: 14, borderRadius: 14, backgroundColor: '#FFF3DF', padding: 15 },
  needTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 14, color: '#A3540A' },
  needCount: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.white, marginTop: 12, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#D97706' },
  earnRow: { flexDirection: 'row', gap: 7, marginTop: 9 },
  earnChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F1F2F4',
  },
  earnEmoji: { fontSize: 11 },
  earnText: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral600 },
  infoCard: { marginTop: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.neutral200, paddingHorizontal: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14 },
  infoDivider: { borderTopWidth: 1, borderTopColor: colors.neutral200 },
  infoIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FCE3D9', alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontFamily: fontFamily.interMedium, fontSize: 15, color: colors.textPrimary },
  infoSub: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 3 },
  bottomBar: { paddingHorizontal: 21, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.neutral200, backgroundColor: colors.white },
  primary: { height: 50, borderRadius: 12, backgroundColor: colors.primary700, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.white },
  disabled: { backgroundColor: colors.neutral200 },
  disabledText: { color: colors.neutral400 },
});
