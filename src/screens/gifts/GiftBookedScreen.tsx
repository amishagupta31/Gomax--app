import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { orderCode } from '../../services/giftOrders';
import { RUNS_TEAL, RUNS_TINT } from './GiftDetailScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'GiftBooked'>;

export function GiftBookedScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { redemptionId, giftName, runsSpent, imageUrl } = route.params;

  const giftVisual = (size: number) =>
    imageUrl ? (
      <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 6 }} />
    ) : (
      <Text style={{ fontSize: size * 0.8 }}>🎁</Text>
    );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.celebration}>
          <View style={styles.glow} />
          <View style={styles.ring}>{giftVisual(84)}</View>
          <Text style={[styles.deco, styles.sparkles]}>✨</Text>
          <Text style={[styles.deco, styles.popper]}>🎉</Text>
        </View>

        <Text style={styles.title}>Gift booked!</Text>
        <Text style={styles.body}>We will pack and send it in 2–3 days. You will get updates on WhatsApp.</Text>

        <View style={styles.summary}>
          <View style={styles.tile}>{giftVisual(32)}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.giftName}>{giftName}</Text>
            <Text style={styles.order}>Order {orderCode(redemptionId)}</Text>
          </View>
          <Text style={styles.runs}>−{runsSpent.toLocaleString('en-IN')} runs</Text>
        </View>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.primary} onPress={() => navigation.replace('MyGifts')}>
          <Text style={styles.primaryText}>Track my gift</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => navigation.navigate('Main', { screen: 'Gifts' } as never)}>
          <Text style={styles.linkText}>Back to Gifts</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: 21 },
  celebration: { height: 320, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 270, height: 270, borderRadius: 135, backgroundColor: '#FFF4F0' },
  ring: {
    width: 198,
    height: 198,
    borderRadius: 99,
    borderWidth: 6,
    borderColor: colors.white,
    backgroundColor: '#FFF6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deco: { position: 'absolute', fontSize: 44 },
  sparkles: { left: 34, top: 54 },
  popper: { right: 30, top: 38, fontSize: 56 },
  title: { textAlign: 'center', fontFamily: fontFamily.interBold, fontSize: 29, color: '#0A1C37', marginTop: 12 },
  body: { textAlign: 'center', fontFamily: fontFamily.interRegular, fontSize: 14, lineHeight: 22, color: colors.neutral500, marginTop: 10 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 18,
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  tile: { width: 50, height: 50, borderRadius: 10, backgroundColor: RUNS_TINT, alignItems: 'center', justifyContent: 'center' },
  giftName: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.textPrimary },
  order: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 3 },
  runs: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: RUNS_TEAL },
  bottomBar: { paddingHorizontal: 21, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.neutral200 },
  primary: { height: 50, borderRadius: 12, backgroundColor: colors.primary700, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.white },
  link: { alignItems: 'center', paddingVertical: 12 },
  linkText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: '#0A1C37' },
});
