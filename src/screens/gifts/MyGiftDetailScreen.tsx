import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { GiftTimeline } from '../../components/GiftTimeline';
import { GIFT_HELPLINE, GiftOrder, dateTime, getGiftOrder, orderCode, orderStatus } from '../../services/giftOrders';
import { StatusBadge } from './MyGiftsScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'MyGiftDetail'>;

export function MyGiftDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<GiftOrder | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getGiftOrder(route.params.redemptionId).then(setOrder).catch(() => {});
  }, [route.params.redemptionId]);

  if (!order) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScreenHeader title="My gift" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const status = orderStatus(order);
  const delivered = status === 'delivered';

  const reportProblem = () =>
    Linking.openURL(
      `https://wa.me/91${GIFT_HELPLINE}?text=${encodeURIComponent(`Problem with my gift order ${orderCode(order.id)} (${order.gift?.name ?? 'gift'})`)}`
    );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader title={order.gift?.name ?? 'My gift'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {delivered && order.delivered_at ? (
          <View style={styles.deliveredPill}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.successText} />
            <Text style={styles.deliveredText}>Delivered on {dateTime(order.delivered_at)}</Text>
          </View>
        ) : (
          <View style={{ alignSelf: 'flex-start' }}>
            <StatusBadge status={status} />
          </View>
        )}

        {delivered ? (
          order.proof_url ? (
            <Image source={{ uri: order.proof_url }} style={styles.photo} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#0F172A', '#334155']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.photo}>
              <Ionicons name="camera-outline" size={28} color={colors.white} />
              <Text style={styles.photoText}>Delivery photo (from courier / GoMax)</Text>
            </LinearGradient>
          )
        ) : null}

        <View style={styles.card}>
          <GiftTimeline order={order} />
        </View>

        {delivered ? (
          <View style={styles.card}>
            {confirmed ? (
              <Text style={styles.question}>Thanks for confirming! Enjoy your gift.</Text>
            ) : (
              <>
                <Text style={styles.question}>Did you get your gift?</Text>
                <View style={styles.answerRow}>
                  <Pressable style={[styles.answer, styles.answerYes]} onPress={() => setConfirmed(true)}>
                    <Text style={styles.answerYesText}>Yes, got it</Text>
                  </Pressable>
                  <Pressable style={[styles.answer, styles.answerNo]} onPress={reportProblem}>
                    <Text style={styles.answerNoText}>Problem</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 21, paddingTop: 17 },
  deliveredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    height: 27,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: '#E6F6EC',
  },
  deliveredText: { fontFamily: fontFamily.interSemiBold, fontSize: 13, color: colors.successText },
  photo: { marginTop: 13, height: 229, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 12, overflow: 'hidden' },
  photoText: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.white },
  card: { marginTop: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.neutral200, padding: 16 },
  question: { fontFamily: fontFamily.interSemiBold, fontSize: 14, color: colors.textPrimary },
  answerRow: { flexDirection: 'row', gap: 9, marginTop: 11 },
  answer: { flex: 1, height: 49, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  answerYes: { backgroundColor: colors.primary700 },
  answerNo: { borderWidth: 1.5, borderColor: colors.primary700 },
  answerYesText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.white },
  answerNoText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.primary700 },
});
