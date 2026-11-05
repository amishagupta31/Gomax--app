import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { MyRank, RANKS, getMyRank, rankForPoints } from '../../services/rank';

type Props = NativeStackScreenProps<RootStackParamList, 'RankBenefits'>;

const NAVY_CARD = '#0B1526';

export function RankBenefitsSheet({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [rank, setRank] = useState<MyRank>(rankForPoints(0));

  useEffect(() => {
    getMyRank().then(setRank).catch(() => {});
  }, []);

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.handle} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>Rank & benefits</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressText}>
              {rank.next
                ? `${rank.pointsToNext.toLocaleString('en-IN')} pts to become ${rank.next.name}`
                : `You are ${rank.current.name}`}
            </Text>
            <Text style={styles.crown}>👑</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(rank.progress * 100)}%` }]} />
          </View>
        </View>

        {RANKS.map((r, i) => {
          const achieved = i < rank.currentIndex;
          const current = i === rank.currentIndex;
          return (
            <View key={r.name} style={[styles.row, current && styles.rowCurrent]}>
              <View style={[styles.badge, achieved ? styles.badgeDone : current ? styles.badgeCurrent : styles.badgeLocked]}>
                <Ionicons
                  name={achieved ? 'checkmark' : current ? 'ribbon-outline' : 'lock-closed-outline'}
                  size={18}
                  color={achieved ? colors.success : current ? colors.white : colors.neutral400}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.rankName}>{r.name}</Text>
                  {current ? (
                    <View style={styles.herePill}>
                      <Text style={styles.hereText}>You are here</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.perks}>
                  From {r.minPoints.toLocaleString('en-IN')} pts · {r.perks}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,21,38,0.45)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 21,
    paddingTop: 8,
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.neutral200 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  title: { fontFamily: fontFamily.interSemiBold, fontSize: 18, color: colors.textPrimary },
  close: { width: 33, height: 33, borderRadius: 17, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  progressCard: { marginTop: 14, borderRadius: 12, backgroundColor: NAVY_CARD, paddingHorizontal: 15, paddingVertical: 14 },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { fontFamily: fontFamily.interSemiBold, fontSize: 14, color: colors.white },
  crown: { fontSize: 16 },
  track: { marginTop: 12, height: 8, borderRadius: 4, backgroundColor: '#33435A', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#E2765D' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 10, paddingHorizontal: 10, marginTop: 6, borderRadius: 12 },
  rowCurrent: { backgroundColor: '#FFF6F2' },
  badge: { width: 37, height: 37, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  badgeDone: { backgroundColor: '#E6F6EC' },
  badgeCurrent: { backgroundColor: colors.primary700 },
  badgeLocked: { backgroundColor: '#F3F4F6' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankName: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.textPrimary },
  herePill: { paddingHorizontal: 10, height: 22, borderRadius: 999, backgroundColor: '#FCE3D9', justifyContent: 'center' },
  hereText: { fontFamily: fontFamily.interMedium, fontSize: 12, color: colors.primary700 },
  perks: { fontFamily: fontFamily.interRegular, fontSize: 12, lineHeight: 17, color: colors.neutral500, marginTop: 2 },
});
