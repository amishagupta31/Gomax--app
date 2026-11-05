import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloorIcon, WallIcon } from '../../components/SurfaceIcons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { ADHESIVE_IDS, PRODUCTS, UsePlace, downloadDataSheet, getProduct, shareDataSheet } from '../../services/products';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const HERO_BG = '#FBEDE6';
const NAVY = '#0B1526';
const USE_TINT = '#DDF0F6';
const USE_INK = '#146C84';

const USE_META: Record<UsePlace, { label: string; Icon: (p: { size?: number; color: string }) => React.ReactElement }> = {
  floor: { label: 'Floor', Icon: FloorIcon },
  wall: { label: 'Wall', Icon: WallIcon },
  bathroom: { label: 'Bathroom', Icon: ({ size, color }) => <Ionicons name="water-outline" size={size} color={color} /> },
  outside: { label: 'Outside', Icon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} /> },
};

export function ProductDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const product = getProduct(route.params.productId);
  if (!product) return null;

  const otherAdhesives = ADHESIVE_IDS.filter((id) => id !== product.id)
    .map((id) => PRODUCTS.find((p) => p.id === id)?.shortName)
    .join(' and ');
  const isAdhesive = product.group === 'adhesive';

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={[styles.hero, { paddingTop: insets.top }]}>
          <Text style={styles.watermark}>{product.shortName[0]}</Text>
          <Image source={product.image} style={styles.heroImage} resizeMode="contain" />
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.back, { top: insets.top + 12 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
          {product.heroChips ? (
            <>
              <View style={[styles.heroChip, { top: insets.top + 100, left: 18 }]}>
                <View style={styles.heroDot} />
                <Text style={styles.heroChipText}>{product.heroChips[0]}</Text>
              </View>
              <View style={[styles.heroChip, { top: insets.top + 170, right: 6 }]}>
                <View style={styles.heroDot} />
                <Text style={styles.heroChipText}>{product.heroChips[1]}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={[styles.eyebrow, { color: product.eyebrowColor }]}>{product.eyebrow}</Text>
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
            {product.name}
          </Text>
          <Text style={styles.description}>{product.description}</Text>

          {product.standards ? (
            <View style={styles.standards}>
              {product.standards.map((s) => (
                <View key={s} style={styles.standardChip}>
                  <Text style={styles.standardText}>{s}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {product.stats ? (
            <View style={styles.stats}>
              {product.stats.map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={styles.statValue}>
                    {s.value}
                    {s.unit ? <Text style={styles.statUnit}> {s.unit}</Text> : null}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {product.whereToUse ? (
            <>
              <Text style={styles.sectionTitle}>Where to use</Text>
              <View style={styles.useRow}>
                {product.whereToUse.map((u) => {
                  const { Icon, label } = USE_META[u];
                  return (
                    <View key={u} style={styles.useTile}>
                      <Icon size={26} color={USE_INK} />
                      <Text style={styles.useLabel}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}

          {product.benefits ? (
            <>
              <Text style={styles.sectionTitle}>Why masons like it</Text>
              {product.benefits.map((b) => (
                <View key={b} style={styles.benefitRow}>
                  <View style={styles.check}>
                    <Ionicons name="checkmark" size={14} color={colors.successText} />
                  </View>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </>
          ) : null}

          {product.steps ? (
            <>
              <Text style={styles.sectionTitle}>How to apply</Text>
              <View style={styles.stepsCard}>
                {product.steps.map((s, i) => (
                  <View key={s.title} style={[styles.stepRow, i > 0 && styles.stepDivider]}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepTitle}>{s.title}</Text>
                      <Text style={styles.stepSub}>{s.sub}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {product.tds ? (
            <Pressable style={styles.tdsRow} onPress={() => navigation.navigate('DataSheet', { productId: product.id })}>
              <View style={styles.tdsIcon}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Technical data sheet</Text>
                <Text style={styles.rowSub}>
                  {product.tds.sizeLabel} · updated {product.tds.updated}
                </Text>
              </View>
              <Pressable onPress={() => downloadDataSheet(product)} hitSlop={10} accessibilityLabel="Download data sheet">
                <Ionicons name="download-outline" size={22} color={colors.textPrimary} />
              </Pressable>
            </Pressable>
          ) : null}

          {isAdhesive ? (
            <Pressable style={styles.compareRow} onPress={() => navigation.navigate('CompareProducts')}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Compare with {otherAdhesives}</Text>
                <Text style={styles.rowSub}>See which adhesive fits your job</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.primary700} />
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      {product.tds ? (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Pressable style={styles.shareButton} onPress={() => shareDataSheet(product)} accessibilityLabel="Share">
            <Ionicons name="share-social-outline" size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => downloadDataSheet(product)}>
            <Text style={styles.primaryText}>Download data sheet (PDF)</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  hero: {
    height: 364,
    backgroundColor: HERO_BG,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  watermark: {
    position: 'absolute',
    top: 40,
    fontFamily: fontFamily.interBold,
    fontSize: 300,
    lineHeight: 320,
    color: 'rgba(255,255,255,0.55)',
  },
  heroImage: { width: 220, height: 300, marginBottom: -10 },
  back: {
    position: 'absolute',
    left: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroChip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 27,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2BB3D6' },
  heroChipText: { fontFamily: fontFamily.interMedium, fontSize: 12, color: colors.textPrimary },
  body: { paddingHorizontal: 18, paddingTop: 26 },
  eyebrow: { fontFamily: fontFamily.interSemiBold, fontSize: 11, letterSpacing: 2.6 },
  name: { fontFamily: fontFamily.interBold, fontSize: 44, lineHeight: 52, color: NAVY, marginTop: 6 },
  description: { fontFamily: fontFamily.interRegular, fontSize: 14, lineHeight: 22, color: colors.neutral500, marginTop: 6 },
  standards: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 12 },
  standardChip: {
    height: 30,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral200,
    justifyContent: 'center',
  },
  standardText: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.textPrimary },
  stats: { flexDirection: 'row', gap: 9, marginTop: 18 },
  statCard: {
    flex: 1,
    height: 75,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  statLabel: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500 },
  statValue: { fontFamily: fontFamily.interBold, fontSize: 17, color: colors.textPrimary, marginTop: 6 },
  statUnit: { fontFamily: fontFamily.interRegular, fontSize: 11, color: colors.neutral500 },
  sectionTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 17, color: colors.textPrimary, marginTop: 24, marginBottom: 12 },
  useRow: { flexDirection: 'row', gap: 8 },
  useTile: { flex: 1, height: 83, borderRadius: 12, backgroundColor: USE_TINT, alignItems: 'center', justifyContent: 'center', gap: 10 },
  useLabel: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.textPrimary },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 13 },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E6F6EC', alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, fontFamily: fontFamily.interRegular, fontSize: 14, color: colors.textPrimary },
  stepsCard: { borderRadius: 12, borderWidth: 1, borderColor: colors.neutral200, paddingHorizontal: 17 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 16, height: 72 },
  stepDivider: { borderTopWidth: 1, borderTopColor: colors.neutral200 },
  stepNumber: { width: 37, height: 37, borderRadius: 19, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontFamily: fontFamily.interSemiBold, fontSize: 14, color: colors.white },
  stepTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 14, color: colors.textPrimary },
  stepSub: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 3 },
  tdsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 19,
    padding: 17,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  tdsIcon: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#FCE3D9', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.textPrimary },
  rowSub: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 3 },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 19,
    paddingHorizontal: 17,
    paddingVertical: 17,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBE3D8',
    backgroundColor: '#FFF6F2',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 11,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  shareButton: {
    width: 53,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: { flex: 1, height: 52, borderRadius: 12, backgroundColor: colors.primary700, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.white },
});
