import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { brand } from '../../assets/images';
import { downloadDataSheet, getProduct, shareDataSheet } from '../../services/products';

type Props = NativeStackScreenProps<RootStackParamList, 'DataSheet'>;

const SKELETON_WIDTHS = ['100%', '89%', '95%', '64%'] as const;

export function DataSheetScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const product = getProduct(route.params.productId);
  if (!product?.tds) return null;
  const { tds } = product;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Data sheet"
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={() => shareDataSheet(product)} hitSlop={10} accessibilityLabel="Share data sheet">
            <Ionicons name="share-social-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{product.name} · Technical data sheet</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="document-text-outline" size={13} color={colors.neutral500} />
            <Text style={styles.metaText}>{tds.sizeLabel}</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="time-outline" size={13} color={colors.neutral500} />
            <Text style={styles.metaText}>Updated {tds.updated}</Text>
          </View>
        </View>

        <View style={styles.paper}>
          <View style={styles.paperHead}>
            <Image source={brand.logoFullNavy} style={styles.logo} resizeMode="contain" />
            <Text style={styles.paperCode}>TDS · {product.shortName}</Text>
          </View>
          <View style={styles.rule} />
          <Text style={styles.paperHeadline}>{tds.headline}</Text>
          {tds.rows.map(([label, value], i) => (
            <View key={label} style={[styles.paperRow, i < tds.rows.length - 1 && styles.paperDivider]}>
              <Text style={styles.paperLabel}>{label}</Text>
              <Text style={styles.paperValue}>{value}</Text>
            </View>
          ))}
          <View style={styles.skeletonBlock}>
            {SKELETON_WIDTHS.map((w) => (
              <View key={w} style={[styles.skeleton, { width: w }]} />
            ))}
          </View>
        </View>
        <Text style={styles.pageHint}>Page 1 of 2 · pinch to zoom</Text>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable style={styles.downloadButton} onPress={() => downloadDataSheet(product)}>
          <Ionicons name="download-outline" size={20} color={colors.white} />
          <Text style={styles.downloadText}>Download PDF</Text>
        </Pressable>
        <WhatsAppButton label="Send on WhatsApp" onPress={() => shareDataSheet(product)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 21, paddingTop: 18, paddingBottom: 24 },
  title: { fontFamily: fontFamily.interSemiBold, fontSize: 18, lineHeight: 24, color: colors.textPrimary },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  metaText: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500 },
  paper: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: 21,
    paddingTop: 20,
    paddingBottom: 20,
  },
  paperHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 74, height: 18 },
  paperCode: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral400 },
  rule: { height: 3, backgroundColor: colors.primary700, marginTop: 10 },
  paperHeadline: { fontFamily: fontFamily.interSemiBold, fontSize: 13, lineHeight: 19, color: colors.textPrimary, marginTop: 12 },
  paperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50 },
  paperDivider: { borderBottomWidth: 1, borderBottomColor: colors.neutral200 },
  paperLabel: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500 },
  paperValue: { fontFamily: fontFamily.interMedium, fontSize: 12, color: colors.textPrimary },
  skeletonBlock: { borderTopWidth: 1, borderTopColor: colors.neutral200, paddingTop: 11, gap: 11 },
  skeleton: { height: 8, borderRadius: 4, backgroundColor: '#F3F4F6' },
  pageHint: { textAlign: 'center', marginTop: 12, fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral400 },
  bottomBar: {
    gap: 10,
    paddingHorizontal: 21,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  downloadButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primary700,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  downloadText: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.white },
});
