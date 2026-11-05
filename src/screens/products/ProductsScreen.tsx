import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BigTileIcon, FloorIcon, GridIcon, WallIcon } from '../../components/SurfaceIcons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { products as productImages } from '../../assets/images';
import { PRODUCTS, Product, ProductFilter } from '../../services/products';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

const NAVY = '#0B1526';

const FILTERS: { key: ProductFilter; label: string; Icon: (p: { size?: number; color: string }) => React.ReactElement }[] = [
  { key: 'all', label: 'All', Icon: GridIcon },
  { key: 'floor', label: 'Floor', Icon: FloorIcon },
  { key: 'wall', label: 'Wall', Icon: WallIcon },
  { key: 'big', label: 'Big tiles', Icon: BigTileIcon },
  { key: 'waterproof', label: 'Waterproof', Icon: ({ size, color }) => <Ionicons name="water-outline" size={size} color={color} /> },
];

export function ProductsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        (filter === 'all' || p.filters.includes(filter)) &&
        (!q || p.name.toLowerCase().includes(q) || p.cardSubtitle.toLowerCase().includes(q))
    );
  }, [filter, query]);

  const adhesives = visible.filter((p) => p.group === 'adhesive');
  const others = visible.filter((p) => p.group === 'grout_waterproofing');
  const showCompareCard = filter === 'all' && !query;
  const open = (p: Product) => navigation.navigate('ProductDetail', { productId: p.id });

  const gridItems: (Product | 'compare')[] = showCompareCard ? [...adhesives, 'compare'] : adhesives;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Products</Text>
            <Text style={styles.subtitle}>{PRODUCTS.length} products · tap one to see how to use it</Text>
          </View>
          <Pressable
            onPress={() => setSearchOpen((v) => !v)}
            style={styles.searchButton}
            accessibilityRole="button"
            accessibilityLabel="Search products"
          >
            <Ionicons name={searchOpen ? 'close' : 'search-outline'} size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {searchOpen ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products"
            placeholderTextColor={colors.neutral400}
            style={styles.search}
            autoFocus
          />
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipScroller}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <f.Icon size={20} color={active ? colors.white : colors.textPrimary} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {adhesives.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tile adhesives</Text>
              <Pressable onPress={() => navigation.navigate('CompareProducts')} hitSlop={8}>
                <Text style={styles.compareLink}>Compare</Text>
              </Pressable>
            </View>
            <View style={styles.grid}>
              {gridItems.map((item) =>
                item === 'compare' ? (
                  <Pressable key="compare" style={[styles.gridCard, styles.compareCard]} onPress={() => navigation.navigate('CompareProducts')}>
                    <Image source={productImages.adhesivesGroup} style={styles.groupImage} resizeMode="contain" />
                    <Text style={styles.compareTitle}>Which one should I use?</Text>
                    <View style={styles.compareButton}>
                      <Text style={styles.compareButtonText}>Compare</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.white} />
                    </View>
                  </Pressable>
                ) : (
                  <Pressable key={item.id} style={styles.gridCard} onPress={() => open(item)}>
                    <View style={styles.gridImageWrap}>
                      <Image source={item.image} style={styles.gridImage} resizeMode="contain" />
                    </View>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardSub}>{item.cardSubtitle}</Text>
                    <View style={styles.packPill}>
                      <Text style={[styles.packText, { color: item.packColor }]}>{item.pack}</Text>
                    </View>
                  </Pressable>
                )
              )}
            </View>
          </View>
        ) : null}

        {others.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.sectionHeader]}>Grout & waterproofing</Text>
            {others.map((p) => (
              <Pressable key={p.id} style={styles.rowCard} onPress={() => open(p)}>
                <Image source={p.image} style={styles.rowImage} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eyebrow, { color: p.eyebrowColor }]}>{p.eyebrow}</Text>
                  <Text style={styles.cardName}>{p.name}</Text>
                  <Text style={styles.cardSub}>{p.cardSubtitle}</Text>
                  <View style={styles.packPill}>
                    <Text style={[styles.packText, { color: p.packColor }]}>{p.pack}</Text>
                  </View>
                </View>
                <View style={styles.chevron}>
                  <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {visible.length === 0 ? <Text style={styles.empty}>No products match</Text> : null}

        <View style={styles.tdsBanner}>
          <Text style={styles.tdsEmoji}>📑</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tdsTitle}>Need the data sheet (TDS)?</Text>
            <Text style={styles.tdsSub}>Open any product → Download PDF</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 22 },
  title: { fontFamily: fontFamily.interBold, fontSize: 28, lineHeight: 34, color: colors.textPrimary },
  subtitle: { fontFamily: fontFamily.interRegular, fontSize: 13, color: colors.neutral500, marginTop: 6 },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.neutral200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: 18,
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: 14,
    fontFamily: fontFamily.interRegular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chipScroller: { marginTop: 18 },
  chips: { paddingHorizontal: 18, gap: 9 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 49,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: NAVY, borderColor: NAVY },
  chipText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.textPrimary },
  chipTextActive: { color: colors.white },
  section: { paddingHorizontal: 18, marginTop: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 18, color: colors.textPrimary },
  compareLink: { fontFamily: fontFamily.interSemiBold, fontSize: 14, color: colors.primary700 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  gridCard: {
    width: '48.5%',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.neutral200,
    padding: 12,
    backgroundColor: colors.white,
  },
  gridImageWrap: { height: 140, alignItems: 'center', justifyContent: 'center' },
  gridImage: { width: 120, height: 140 },
  cardName: { fontFamily: fontFamily.interSemiBold, fontSize: 16, lineHeight: 22, color: colors.textPrimary, marginTop: 8 },
  cardSub: { fontFamily: fontFamily.interRegular, fontSize: 12, lineHeight: 16, color: colors.neutral500, marginTop: 2 },
  packPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
  },
  packText: { fontFamily: fontFamily.interMedium, fontSize: 12 },
  compareCard: { backgroundColor: NAVY, borderColor: NAVY, justifyContent: 'space-between' },
  groupImage: { width: '100%', height: 125 },
  compareTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 16, lineHeight: 24, color: colors.white, marginTop: 10 },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 14,
    height: 33,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: colors.primary700,
  },
  compareButtonText: { fontFamily: fontFamily.interMedium, fontSize: 13, color: colors.white },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
    marginBottom: 12,
  },
  rowImage: { width: 88, height: 108 },
  eyebrow: { fontFamily: fontFamily.interSemiBold, fontSize: 11, letterSpacing: 2.2 },
  chevron: { width: 33, height: 33, borderRadius: 17, backgroundColor: '#FFF5F1', alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 40, fontFamily: fontFamily.interRegular, fontSize: 14, color: colors.neutral500 },
  tdsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 18,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: NAVY,
  },
  tdsEmoji: { fontSize: 36 },
  tdsTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.white },
  tdsSub: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.white, marginTop: 4 },
});
