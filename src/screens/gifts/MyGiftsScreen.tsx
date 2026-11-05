import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { FilterChips } from '../../components/FilterChips';
import { GiftTimeline } from '../../components/GiftTimeline';
import { TruckIcon } from '../../components/SurfaceIcons';
import { listMyGiftRedemptions } from '../../services/gifts';
import { GiftOrder, GiftOrderStatus, orderCode, orderStatus, shortDate } from '../../services/giftOrders';
import { RUNS_TINT } from './GiftDetailScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'MyGifts'>;
type Filter = 'all' | 'on_the_way' | 'delivered';

const DONE_GREEN = '#1DBF73';

export function StatusBadge({ status }: { status: GiftOrderStatus }) {
  if (status === 'delivered') {
    return (
      <View style={[styles.badge, { backgroundColor: '#E6F6EC' }]}>
        <Text style={[styles.badgeText, { color: colors.successText }]}>Delivered</Text>
      </View>
    );
  }
  if (status === 'shipped') {
    return (
      <View style={[styles.badge, { backgroundColor: '#FCE3D9' }]}>
        <TruckIcon size={15} color={colors.primary700} />
        <Text style={[styles.badgeText, { color: colors.primary700 }]}>Shipped</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: colors.secondary50 }]}>
      <Text style={[styles.badgeText, { color: colors.secondary700 }]}>Booked</Text>
    </View>
  );
}

export function GiftThumb({ order, size = 46 }: { order: GiftOrder; size?: number }) {
  return (
    <View style={[styles.thumb, { width: size, height: size }]}>
      {order.gift?.image_url ? (
        <Image source={{ uri: order.gift.image_url }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text style={{ fontSize: size * 0.55 }}>🎁</Text>
      )}
    </View>
  );
}

export function MyGiftsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');
  const [orders, setOrders] = useState<GiftOrder[] | null>(null);

  useEffect(() => {
    listMyGiftRedemptions()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const visible = useMemo(
    () =>
      (orders ?? []).filter((o) => {
        const s = orderStatus(o);
        if (filter === 'delivered') return s === 'delivered';
        if (filter === 'on_the_way') return s !== 'delivered';
        return true;
      }),
    [orders, filter]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader title="My gifts" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <FilterChips
          options={[
            { key: 'all', label: 'All' },
            { key: 'on_the_way', label: 'On the way' },
            { key: 'delivered', label: 'Delivered' },
          ]}
          value={filter}
          onChange={setFilter}
        />

        {visible.map((o) => {
          const status = orderStatus(o);
          const delivered = status === 'delivered';
          return (
            <Pressable key={o.id} style={styles.card} onPress={() => navigation.navigate('MyGiftDetail', { redemptionId: o.id })}>
              <View style={styles.cardHead}>
                <GiftThumb order={o} size={delivered ? 62 : 46} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{o.gift?.name ?? 'Gift'}</Text>
                  <Text style={styles.meta}>
                    {orderCode(o.id)} · {delivered ? shortDate(o.delivered_at) : `${o.runs_spent.toLocaleString('en-IN')} runs`}
                  </Text>
                </View>
                <StatusBadge status={status} />
              </View>

              {delivered ? (
                <>
                  <View style={styles.segments}>
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={styles.segment} />
                    ))}
                  </View>
                  {o.proof_url ? (
                    <View style={styles.photoRow}>
                      <Ionicons name="image-outline" size={16} color={colors.successText} />
                      <Text style={styles.photoText}>Delivery photo · tap to see</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.successText} />
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.timeline}>
                  <GiftTimeline order={o} />
                </View>
              )}
            </Pressable>
          );
        })}

        {orders && visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎁</Text>
            <Text style={styles.emptyTitle}>{orders.length === 0 ? 'No gifts yet' : 'Nothing here'}</Text>
            <Text style={styles.emptySub}>
              {orders.length === 0 ? 'Collect runs and pick a gift you like' : 'Try a different filter'}
            </Text>
            {orders.length === 0 ? (
              <Pressable style={styles.emptyButton} onPress={() => navigation.navigate('Main', { screen: 'Gifts' } as never)}>
                <Text style={styles.emptyButtonText}>See gifts</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 21, paddingTop: 17 },
  card: { marginTop: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.neutral200, padding: 17 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  thumb: { borderRadius: 10, backgroundColor: RUNS_TINT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  name: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.textPrimary },
  meta: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 3 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 24, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { fontFamily: fontFamily.interMedium, fontSize: 12 },
  timeline: { marginTop: 14 },
  segments: { flexDirection: 'row', gap: 4, marginTop: 14 },
  segment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: DONE_GREEN },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    height: 33,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: '#E6F6EC',
  },
  photoText: { flex: 1, fontFamily: fontFamily.interMedium, fontSize: 12, color: colors.successText },
  empty: { alignItems: 'center', marginTop: 70, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 18, color: colors.textPrimary, marginTop: 12 },
  emptySub: { fontFamily: fontFamily.interRegular, fontSize: 13, color: colors.neutral500, marginTop: 6, textAlign: 'center' },
  emptyButton: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.white },
});
