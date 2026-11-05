import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ADHESIVE_IDS, COMPARE_ROWS, EASY_RULES, Product, getProduct } from '../../services/products';

type Props = NativeStackScreenProps<RootStackParamList, 'CompareProducts'>;

const NAVY = '#0B1526';

export function CompareProductsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const adhesives = ADHESIVE_IDS.map(getProduct).filter((p): p is Product => !!p);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader title="Compare adhesives" align="left" backVariant="filled" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.thumbs}>
          {adhesives.map((p) => (
            <Pressable key={p.id} style={styles.thumb} onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}>
              <Image source={p.image} style={styles.thumbImage} resizeMode="contain" />
              <Text style={styles.thumbName} numberOfLines={1} adjustsFontSizeToFit>
                {p.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.table}>
          {COMPARE_ROWS.map((row, i) => (
            <View key={row.label} style={[styles.tableRow, i > 0 && styles.tableDivider]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <View style={styles.values}>
                {row.values.map((v, j) => (
                  <Text key={j} style={[styles.value, row.highlightYes && v === 'Yes' && styles.valueYes]}>
                    {v}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>Easy rule</Text>
          {EASY_RULES.map(([when, use]) => (
            <View key={when} style={styles.ruleRow}>
              <Text style={styles.ruleWhen}>{when}</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary600} />
              <Text style={styles.ruleUse}>{use}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.allSheets} onPress={() => navigation.navigate('DataSheet', { productId: adhesives[0].id })}>
          <View style={styles.docIcon}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.allTitle}>Data sheets of all 3</Text>
            <Text style={styles.allSub}>3 PDFs · download one by one</Text>
          </View>
          <Ionicons name="download-outline" size={22} color={colors.textPrimary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 18, paddingTop: 12 },
  thumbs: { flexDirection: 'row', gap: 9 },
  thumb: {
    flex: 1,
    height: 156,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  thumbImage: { width: 80, height: 108 },
  thumbName: { fontFamily: fontFamily.interMedium, fontSize: 13, color: colors.textPrimary, marginTop: 10 },
  table: { marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.neutral200 },
  tableRow: { paddingHorizontal: 13, paddingVertical: 13 },
  tableDivider: { borderTopWidth: 1, borderTopColor: colors.neutral200 },
  rowLabel: { fontFamily: fontFamily.interSemiBold, fontSize: 11, letterSpacing: 2.4, color: colors.neutral500 },
  values: { flexDirection: 'row', marginTop: 8 },
  value: { flex: 1, fontFamily: fontFamily.interSemiBold, fontSize: 13, lineHeight: 19, color: colors.textPrimary, paddingRight: 8 },
  valueYes: { color: colors.successText },
  rules: { marginTop: 16, borderRadius: 16, backgroundColor: NAVY, paddingHorizontal: 17, paddingTop: 18, paddingBottom: 14 },
  rulesTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 13, letterSpacing: 2, color: colors.white, marginBottom: 6 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  ruleWhen: { flex: 1, fontFamily: fontFamily.interRegular, fontSize: 13, lineHeight: 18, color: colors.white },
  ruleUse: { fontFamily: fontFamily.interSemiBold, fontSize: 13, color: colors.white },
  allSheets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 16,
    marginHorizontal: 4,
    padding: 17,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  docIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#FFF5F1', alignItems: 'center', justifyContent: 'center' },
  allTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.textPrimary },
  allSub: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 3 },
});
