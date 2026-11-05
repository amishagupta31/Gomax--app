import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { PressableScale } from '../../components/animations';
import { SpinWheelPromoCard } from '../../components/SpinWheelPromoCard';
import { useApp } from '../../state/AppContext';
import { useMyScans } from '../../hooks/useAppData';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { softHaptic } from '../../utils/haptics';

// The Mason/Applicator role's home tab. Styled after the founder's
// tools-marketplace reference screenshot (greeting+avatar header, search
// row, gradient promo carousel with dot pagination, icon-over-label quick
// actions, icon-tile Categories row) — adapted into GoMax's own
// orange/navy palette, per the founder's standing "everything iconographic,
// everything in pills, no text-heavy things" brand mandate.
//
// Two things the reference/spec assumed that don't exist in this codebase's
// current (post-Supabase-rewrite) state, so they were adapted rather than
// faked — see the two comments below marked "NOTE:".
type Nav = BottomTabNavigationProp<MainTabParamList> & NativeStackNavigationProp<RootStackParamList>;

type CategoryTile = { key: string; icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string };

// NOTE: `src/data/productsMock.ts` / a "Products" tab / `ProductCategory`
// don't exist in the current app (backend/BACKEND_NOTES.md documents the old
// products/marketplace browsing flow as an intentional "hard cut" during the
// Supabase rewrite — the `products` table still exists in Supabase but is
// unused). Rather than reviving that surface or adding a new shared data
// file two other in-flight efforts might also be touching, this keeps the
// same five real GoMax material categories as a small local, display-only
// list. Colors reuse existing tokens: Pill's own success/info tone
// backgrounds (`#e6f7ec` / matches Pill.tsx) plus colors.ts's
// orange100/orange600, secondary50/secondary500, surfaceMuted/neutral600,
// and warningBg/warningText — nothing new invented.
const CATEGORIES: CategoryTile[] = [
  { key: 'Adhesive', icon: 'grid-outline', bg: colors.orange100, fg: colors.orange600 },
  { key: 'Waterproofing', icon: 'water-outline', bg: colors.secondary50, fg: colors.secondary500 },
  { key: 'Putty', icon: 'brush-outline', bg: '#e6f7ec', fg: colors.successText },
  { key: 'Cement', icon: 'cube-outline', bg: colors.surfaceMuted, fg: colors.neutral600 },
  { key: 'Mortar', icon: 'layers-outline', bg: colors.warningBg, fg: colors.warningText },
];

const QUICK_ACTIONS: {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
}[] = [
  { key: 'spin', label: 'Spin Wheel', icon: 'sync-circle-outline', bg: colors.orange500 },
  { key: 'scratch', label: 'Scratch Card', icon: 'ticket-outline', bg: colors.navy800 },
  { key: 'challenges', label: 'Challenges', icon: 'trophy-outline', bg: colors.success },
  { key: 'refer', label: 'Refer Friends', icon: 'people-outline', bg: colors.secondary500 },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = spacing.md;
const CARD_WIDTH = SCREEN_WIDTH - spacing.xxl * 2;
const SLIDE_COUNT = 2; // Scan promo + Spin Wheel promo (see NOTE below on the dropped 3rd slide)

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'G';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MasonHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { fullName } = useApp();
  const { data: scanHistory } = useMyScans();
  const [activeSlide, setActiveSlide] = useState(0);

  const greeting = getGreeting(new Date().getHours());
  const firstName = fullName?.trim().split(/\s+/)[0] || 'Mason';

  const onQuickAction = (key: string) => {
    if (key === 'spin') return navigation.navigate('SpinWheel');
    if (key === 'scratch') return navigation.navigate('ScratchCards');
    if (key === 'challenges') return navigation.navigate('Challenges');
    // "Refer Friends" -> Team: there's no separate Referral screen in this
    // build; My Team (downline + per-person commission) is the real,
    // already-shipped surface for referral activity — HomeScreen's own
    // referral-code card already treats it the same way.
    if (key === 'refer') return navigation.navigate('Team');
  };

  const onSlideScrollEnd = (offsetX: number) => {
    const idx = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    setActiveSlide(Math.max(0, Math.min(SLIDE_COUNT - 1, idx)));
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(fullName || 'Mason')}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            {greeting}, {firstName}
          </Text>
          <Text style={styles.greetingSub}>Let&apos;s make today count</Text>
        </View>
        {/* Decorative header icons: no real notifications/help feature exists
            yet, so these mirror the exact "unbuilt feature" pattern already
            used elsewhere in this app (e.g. SpinWheelScreen's dropped
            placeholder tabs) — a soft haptic on tap, no dead navigation. */}
        <PressableScale style={styles.iconButton} onPress={softHaptic} accessibilityRole="button" accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={18} color={colors.navy800} />
        </PressableScale>
        <PressableScale style={styles.iconButton} onPress={softHaptic} accessibilityRole="button" accessibilityLabel="Help">
          <Ionicons name="help-circle-outline" size={18} color={colors.navy800} />
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search row: a real navigation, not a fake input — but there is no
            Products tab / product-browsing screen in this codebase (see the
            NOTE above), so rather than invent a misleading destination this
            mirrors the same "decorative, soft haptic, no dead nav" rule.
            "Search products" reads as an evergreen prompt, not a promise of
            a working search feature that doesn't exist yet. */}
        <PressableScale style={styles.searchBar} onPress={softHaptic} accessibilityRole="button" accessibilityLabel="Search products">
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search products</Text>
        </PressableScale>

        <View style={styles.carouselWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onMomentumScrollEnd={(e) => onSlideScrollEnd(e.nativeEvent.contentOffset.x)}
          >
            <PressableScale style={{ width: CARD_WIDTH }} onPress={() => navigation.navigate('Scan')}>
              <LinearGradient
                colors={[colors.navy900, colors.navy700]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoCard}
              >
                <View style={styles.promoIcon}>
                  <Ionicons name="qr-code-outline" size={26} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>Scan a Product</Text>
                  <Text style={styles.promoSubtitle}>Earn Points instantly</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={26} color={colors.white} />
              </LinearGradient>
            </PressableScale>

            <SpinWheelPromoCard style={{ width: CARD_WIDTH }} />
          </ScrollView>

          <View style={styles.dotsRow}>
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <View key={i} style={[styles.dot, activeSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((action) => (
            <PressableScale key={action.key} style={styles.quickItem} onPress={() => onQuickAction(action.key)}>
              <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={22} color={colors.white} />
              </View>
              <Text style={styles.quickLabel} numberOfLines={1}>
                {action.label}
              </Text>
            </PressableScale>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <PressableScale onPress={softHaptic} accessibilityRole="button" accessibilityLabel="See all categories">
            <Text style={styles.seeAll}>See all</Text>
          </PressableScale>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <PressableScale key={cat.key} style={styles.categoryItem} onPress={softHaptic}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                <Ionicons name={cat.icon} size={28} color={cat.fg} />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {cat.key}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Recent activity</Text>
        {scanHistory.length === 0 ? (
          <Text style={styles.emptyText}>No scans yet — scan a product to start earning.</Text>
        ) : (
          <View style={{ gap: spacing.md }}>
            {scanHistory.slice(0, 5).map((item) => (
              <Card key={item.id} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons name="cube-outline" size={18} color={colors.navy700} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>Product scanned</Text>
                  <Text style={styles.activityTime}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>
                <Text style={styles.activityPoints}>+{item.points_awarded} pts</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.orange500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodyMedium, color: colors.white, fontWeight: '700' },
  headerText: { flex: 1 },
  greeting: { ...typography.h3, color: colors.textPrimary },
  greetingSub: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchPlaceholder: { ...typography.body, color: colors.textMuted },
  carouselWrap: { marginHorizontal: -spacing.xxl, gap: spacing.sm },
  carouselContent: { paddingHorizontal: spacing.xxl, gap: CARD_GAP },
  promoCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 152,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  promoIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTitle: { ...typography.h3, color: colors.white },
  promoSubtitle: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: colors.neutral300 },
  dotActive: { width: 18, backgroundColor: colors.orange500 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.sm },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  seeAll: { ...typography.bodyMedium, color: colors.orange600 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  quickItem: { flex: 1, alignItems: 'center', gap: spacing.sm },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { ...typography.caption, color: colors.textPrimary, textAlign: 'center' },
  categoryRow: { gap: spacing.md, paddingRight: spacing.xxl },
  categoryItem: { alignItems: 'center', gap: spacing.sm, width: 76 },
  categoryIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { ...typography.caption, color: colors.textPrimary, textAlign: 'center' },
  emptyText: { ...typography.caption, color: colors.textSecondary },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  activityTime: { ...typography.caption, color: colors.textSecondary },
  activityPoints: { ...typography.bodyMedium, color: colors.successText },
});
