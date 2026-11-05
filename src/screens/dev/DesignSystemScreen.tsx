import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GoMaxLogo } from '../../components/GoMaxLogo';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { SelectModal } from '../../components/SelectModal';
import { StatTile } from '../../components/StatTile';
import { TextField } from '../../components/TextField';
import { GlowBorder, PressableScale, RewardBurst, UnlockReveal } from '../../components/animations';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DesignSystem'>;

// Live, always-in-sync reference for every design-system building block —
// see DESIGN_SYSTEM.md at the repo root for the full write-up (palette
// rationale, when to use which type scale, animation guidance). This
// screen renders the *real* components with their *real* props so it can
// never drift from what's actually in `src/theme` and `src/components` the
// way a markdown doc can. Dev-only: reached via the small "Design system"
// link on the Splash screen, same low-friction pattern as "Staff / Admin
// login" — not shown anywhere in the normal signed-in app.

type ColorToken = { name: string; hex: string };
type ColorGroup = { title: string; tokens: ColorToken[] };

const COLOR_GROUPS: ColorGroup[] = [
  {
    title: 'Brand',
    tokens: [
      { name: 'brandNavy', hex: colors.brandNavy },
      { name: 'brandOrange', hex: colors.brandOrange },
    ],
  },
  {
    title: 'M3 Primary scale (buttons, links, accents)',
    tokens: [
      { name: 'primary700', hex: colors.primary700 },
      { name: 'primary600', hex: colors.primary600 },
      { name: 'primary50', hex: colors.primary50 },
    ],
  },
  {
    title: 'M3 Secondary scale (headings, step indicators)',
    tokens: [
      { name: 'secondary800', hex: colors.secondary800 },
      { name: 'secondary700', hex: colors.secondary700 },
      { name: 'secondary500', hex: colors.secondary500 },
      { name: 'secondary50', hex: colors.secondary50 },
    ],
  },
  {
    title: 'M3 Neutral scale',
    tokens: [
      { name: 'neutral0', hex: colors.neutral0 },
      { name: 'neutral200', hex: colors.neutral200 },
      { name: 'neutral300', hex: colors.neutral300 },
      { name: 'neutral400', hex: colors.neutral400 },
      { name: 'neutral500', hex: colors.neutral500 },
      { name: 'neutral600', hex: colors.neutral600 },
      { name: 'neutral950', hex: colors.neutral950 },
    ],
  },
  {
    title: 'Raw one-off hex (screen-specific, not Figma variables)',
    tokens: [
      { name: 'labelGray', hex: colors.labelGray },
      { name: 'inputBorder', hex: colors.inputBorder },
      { name: 'inputPrefixBg', hex: colors.inputPrefixBg },
      { name: 'skipGray', hex: colors.skipGray },
      { name: 'gradientNavyDeep', hex: colors.gradientNavyDeep },
      { name: 'gradientNavyIndigo', hex: colors.gradientNavyIndigo },
      { name: 'scanSuccessGreen', hex: colors.scanSuccessGreen },
      { name: 'scanActiveTabText', hex: colors.scanActiveTabText },
      { name: 'scanCaptionLight', hex: colors.scanCaptionLight },
      { name: 'warningBg', hex: colors.warningBg },
    ],
  },
  {
    title: 'Dark "Light/Neutral" collection (Scan + Wallet)',
    tokens: [
      { name: 'darkNeutral700', hex: colors.darkNeutral700 },
      { name: 'darkNeutral800', hex: colors.darkNeutral800 },
    ],
  },
  {
    title: 'Scan/Wallet screen-specific (Inter-typeset dark UI)',
    tokens: [
      { name: 'walletBg', hex: colors.walletBg },
      { name: 'walletCard', hex: colors.walletCard },
      { name: 'walletPointsAccent', hex: colors.walletPointsAccent },
      { name: 'walletRunsAccent', hex: colors.walletRunsAccent },
      { name: 'scanSubmitOrange', hex: colors.scanSubmitOrange },
      { name: 'scanHintBlue', hex: colors.scanHintBlue },
    ],
  },
  {
    title: 'Generic semantic aliases (Home/Profile/KYC/no-Figma screens)',
    tokens: [
      { name: 'navy900', hex: colors.navy900 },
      { name: 'navy800', hex: colors.navy800 },
      { name: 'navy700', hex: colors.navy700 },
      { name: 'orange500', hex: colors.orange500 },
      { name: 'orange600', hex: colors.orange600 },
      { name: 'orange100', hex: colors.orange100 },
      { name: 'orange50', hex: colors.orange50 },
      { name: 'textPrimary', hex: colors.textPrimary },
      { name: 'textSecondary', hex: colors.textSecondary },
      { name: 'textMuted', hex: colors.textMuted },
      { name: 'surface', hex: colors.surface },
      { name: 'surfaceMuted', hex: colors.surfaceMuted },
      { name: 'border', hex: colors.border },
      { name: 'borderFocus', hex: colors.borderFocus },
    ],
  },
  {
    title: 'Base + semantic status',
    tokens: [
      { name: 'white', hex: colors.white },
      { name: 'black', hex: colors.black },
      { name: 'success', hex: colors.success },
      { name: 'whatsapp', hex: colors.whatsapp },
      { name: 'danger', hex: colors.danger },
      { name: 'warning', hex: colors.warning },
    ],
  },
  {
    title: 'AA-contrast text/icon variants (use on light tints/white)',
    tokens: [
      { name: 'successText', hex: colors.successText },
      { name: 'warningText', hex: colors.warningText },
      { name: 'dangerText', hex: colors.dangerText },
    ],
  },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function Swatch({ token }: { token: ColorToken }) {
  const isLight = /^#(f|e|d)/i.test(token.hex);
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: token.hex }, isLight && styles.swatchColorBorder]} />
      <Text style={styles.swatchName}>{token.name}</Text>
      <Text style={styles.swatchHex}>{token.hex}</Text>
    </View>
  );
}

const PILL_TONES = ['success', 'warning', 'danger', 'neutral', 'primary', 'info'] as const;
const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'whatsapp', 'neutralDisabled'] as const;
const LOGO_VARIANTS = ['full-orange', 'full-navy', 'mark-orange', 'mark-navy'] as const;

export function DesignSystemScreen({ navigation }: Props) {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState('GOMAX-ABC123');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Option A');
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Design System</Text>
          <Text style={styles.subtitle}>Live reference — see DESIGN_SYSTEM.md for the full write-up</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* --- Brand mandate --- */}
        <Card>
          <Text style={styles.quote}>
            "Make very premium UI... I don't want text-heavy things. I want everything to be iconographic,
            everything to be graphics, everything to be in pills."
          </Text>
          <Text style={styles.quoteAttribution}>— founder brief, driving every decision below</Text>
        </Card>

        {/* --- Colors --- */}
        <SectionHeader title="Colors" subtitle="src/theme/colors.ts — every token, grouped as documented there" />
        {COLOR_GROUPS.map((group) => (
          <View key={group.title} style={styles.groupBlock}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.swatchGrid}>
              {group.tokens.map((t) => (
                <Swatch key={t.name} token={t} />
              ))}
            </View>
          </View>
        ))}

        {/* --- Typography --- */}
        <SectionHeader
          title="Typography — typography scale"
          subtitle="Inter-based. Use on Scan/Wallet + generic/no-Figma screens (Home, Profile, Team, Ledger, Admin)."
        />
        <Card style={styles.typeCard}>
          {(Object.keys(typography) as (keyof typeof typography)[]).map((key) => (
            <View key={key} style={styles.typeRow}>
              <Text style={styles.typeKey}>{key}</Text>
              <Text style={[typography[key], styles.typeSample]}>The quick brown fox</Text>
            </View>
          ))}
        </Card>

        <SectionHeader
          title="Typography — m3Type scale"
          subtitle="Roboto-based Material 3 static scale. Use on onboarding-style screens (Login, Signup, Splash) and any component built to the Figma-exact spec (Pill, TextField, StatTile)."
        />
        <Card style={styles.typeCard}>
          {(Object.keys(m3Type) as (keyof typeof m3Type)[]).map((key) => (
            <View key={key} style={styles.typeRow}>
              <Text style={styles.typeKey}>{key}</Text>
              <Text style={[m3Type[key], styles.typeSample]}>The quick brown fox</Text>
            </View>
          ))}
        </Card>

        {/* --- Spacing & radius --- */}
        <SectionHeader title="Spacing" subtitle="src/theme/spacing.ts" />
        <Card style={styles.scaleCard}>
          {(Object.keys(spacing) as (keyof typeof spacing)[]).map((key) => (
            <View key={key} style={styles.scaleRow}>
              <Text style={styles.scaleKey}>spacing.{key}</Text>
              <View style={[styles.spacingBar, { width: spacing[key] }]} />
              <Text style={styles.scaleValue}>{spacing[key]}px</Text>
            </View>
          ))}
        </Card>

        <SectionHeader title="Radius" subtitle="src/theme/spacing.ts (also exports radius)" />
        <Card style={styles.scaleCard}>
          {(Object.keys(radius) as (keyof typeof radius)[]).map((key) => (
            <View key={key} style={styles.scaleRow}>
              <Text style={styles.scaleKey}>radius.{key}</Text>
              <View
                style={[
                  styles.radiusBox,
                  { borderRadius: key === 'pill' ? 18 : radius[key] },
                ]}
              />
              <Text style={styles.scaleValue}>{radius[key]}px</Text>
            </View>
          ))}
        </Card>

        {/* --- Button --- */}
        <SectionHeader title="Button" subtitle="variant: primary | secondary | ghost | whatsapp | neutralDisabled" />
        <Card style={{ gap: spacing.md }}>
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} label={v} variant={v} onPress={() => {}} />
          ))}
          <Button
            label={buttonLoading ? 'Loading…' : 'Tap to toggle loading'}
            loading={buttonLoading}
            onPress={() => {
              setButtonLoading(true);
              setTimeout(() => setButtonLoading(false), 1200);
            }}
          />
          <Button label="Roboto label (onboarding screens)" roboto onPress={() => {}} />
        </Card>

        {/* --- Pill --- */}
        <SectionHeader title="Pill" subtitle="tone: success | warning | danger | neutral | primary | info · size: sm | md" />
        <Card style={styles.pillWrap}>
          {PILL_TONES.map((tone) => (
            <Pill key={`${tone}-md`} label={tone} tone={tone} size="md" />
          ))}
        </Card>
        <Card style={styles.pillWrap}>
          {PILL_TONES.map((tone) => (
            <Pill key={`${tone}-sm`} label={tone} tone={tone} icon="checkmark-circle" size="sm" />
          ))}
        </Card>

        {/* --- StatTile --- */}
        <SectionHeader title="StatTile" subtitle="icon + big number + one short label — no sentences" />
        <View style={styles.statRow}>
          <StatTile icon="people-outline" value="128" label="Applicators" />
          <StatTile icon="scan-outline" value="42" label="Scans today" iconColor={colors.secondary500} iconBg={colors.secondary50} />
        </View>
        <View style={styles.statRow}>
          <StatTile icon="cash-outline" value="7" label="Redemptions due" iconColor={colors.warning} iconBg={colors.warningBg} />
          <StatTile icon="trending-up-outline" value="₹52,400" label="Points issued" iconColor={colors.success} iconBg="#e6f7ec" />
        </View>

        {/* --- Card --- */}
        <SectionHeader title="Card" subtitle="padded (default) vs unpadded" />
        <Card>
          <Text style={styles.bodyText}>padded=true (default) — white surface, radius.lg, 1px border, spacing.lg padding.</Text>
        </Card>

        {/* --- TextField --- */}
        <SectionHeader title="TextField" subtitle="variant: outline (default, Figma inputs) | filled (dropdown-style)" />
        <Card style={{ gap: spacing.lg }}>
          <TextField
            label="REFERRAL CODE"
            placeholder="GOMAX-XXXXXX"
            value={textFieldValue}
            onChangeText={setTextFieldValue}
            rightIcon="close-circle-outline"
            onRightIconPress={() => setTextFieldValue('')}
            rightIconAccessibilityLabel="Clear referral code"
          />
          <TextField label="FILLED VARIANT" placeholder="Dropdown-style field" variant="filled" leftIcon="location-outline" editable={false} />
          <TextField label="WITH ERROR" placeholder="Confirm password" secureTextEntry error="Passwords do not match" />
        </Card>

        {/* --- SelectModal --- */}
        <SectionHeader title="SelectModal" subtitle="Bottom-sheet single-select list (used by Signup's security question picker)" />
        <Card>
          <Button label={`Selected: ${selectedOption}`} icon="chevron-down" onPress={() => setModalVisible(true)} />
        </Card>
        <SelectModal
          visible={modalVisible}
          title="Pick an option"
          options={['Option A', 'Option B', 'Option C']}
          selected={selectedOption}
          onSelect={setSelectedOption}
          onClose={() => setModalVisible(false)}
        />

        {/* --- GoMaxLogo --- */}
        <SectionHeader title="GoMaxLogo" subtitle="variant: full-orange | full-navy | mark-orange | mark-navy" />
        <Card style={styles.logoWrap}>
          {LOGO_VARIANTS.map((v) => (
            <View key={v} style={[styles.logoTile, v.includes('navy') && styles.logoTileDark]}>
              <GoMaxLogo variant={v} width={v.startsWith('full') ? 100 : 44} />
              <Text style={[styles.logoLabel, v.includes('navy') && styles.logoLabelLight]}>{v}</Text>
            </View>
          ))}
        </Card>

        {/* --- Animations --- */}
        <SectionHeader
          title="Animations"
          subtitle="Reward/premium micro-interactions — pick one, don't invent a fifth primitive that does the same thing"
        />

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.animLabel}>PressableScale — press feedback for any tappable element</Text>
          <PressableScale style={styles.animDemoButton} onPress={() => {}}>
            <Text style={styles.animDemoButtonText}>Press me</Text>
          </PressableScale>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.animLabel}>GlowBorder — ambient premium touch, wraps a persistent high-value CTA</Text>
          <GlowBorder cornerRadius={radius.md} borderWidth={2} backgroundColor={colors.white}>
            <View style={styles.glowDemoInner}>
              <Ionicons name="qr-code-outline" size={20} color={colors.orange500} />
              <Text style={styles.glowDemoText}>Scan a Coupon</Text>
            </View>
          </GlowBorder>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.animLabel}>RewardBurst + UnlockReveal — unlock moments (spin win, scratch reveal, claim, redemption success)</Text>
          <View style={styles.unlockDemoWrap}>
            <RewardBurst trigger={burstTrigger} count={18} />
            <UnlockReveal visible={unlocked} glow glowColor={colors.success}>
              <View style={styles.unlockIcon}>
                <Ionicons name="checkmark" size={28} color={colors.white} />
              </View>
            </UnlockReveal>
          </View>
          <Button
            label={unlocked ? 'Reset' : 'Trigger unlock'}
            onPress={() => {
              if (unlocked) {
                setUnlocked(false);
              } else {
                setUnlocked(true);
                setBurstTrigger(Date.now());
              }
            }}
          />
        </Card>

        <Card>
          <Text style={styles.bodyText}>
            BottomNav isn&apos;t mounted standalone here — it requires live React Navigation tab state
            (BottomTabBarProps) rather than props you&apos;d fake in isolation. See it live as the tab bar on
            MainTabNavigator, or read its source at src/components/BottomNav.tsx.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.neutral500, marginTop: 2 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xl },
  quote: { ...typography.bodyMedium, color: colors.textPrimary, fontStyle: 'italic' },
  quoteAttribution: { ...typography.caption, color: colors.neutral500, marginTop: spacing.sm },
  sectionHeader: { marginTop: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  sectionSubtitle: { ...typography.caption, color: colors.neutral500, marginTop: 2 },
  groupBlock: { gap: spacing.sm },
  groupTitle: { ...typography.label, color: colors.neutral600 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 92, gap: 2 },
  swatchColor: { width: 92, height: 48, borderRadius: radius.sm },
  swatchColorBorder: { borderWidth: 1, borderColor: colors.border },
  swatchName: { ...typography.caption, fontSize: 11, color: colors.textPrimary, fontWeight: '600' },
  swatchHex: { ...typography.caption, fontSize: 10, color: colors.neutral500 },
  typeCard: { gap: spacing.md },
  typeRow: { gap: 2 },
  typeKey: { ...typography.caption, color: colors.neutral500 },
  typeSample: { color: colors.textPrimary },
  scaleCard: { gap: spacing.md },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scaleKey: { ...typography.caption, width: 90, color: colors.neutral600 },
  scaleValue: { ...typography.caption, color: colors.neutral500 },
  spacingBar: { height: 14, backgroundColor: colors.orange500, borderRadius: radius.sm },
  radiusBox: { width: 36, height: 36, backgroundColor: colors.orange50, borderWidth: 1.5, borderColor: colors.orange500 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statRow: { flexDirection: 'row', gap: spacing.md },
  bodyText: { ...typography.body, color: colors.textSecondary },
  logoWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  logoTile: {
    width: 120,
    height: 100,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logoTileDark: { backgroundColor: colors.brandNavy, borderColor: colors.brandNavy },
  logoLabel: { ...typography.caption, fontSize: 10, color: colors.neutral500 },
  logoLabelLight: { color: 'rgba(255,255,255,0.6)' },
  animLabel: { ...typography.caption, color: colors.neutral600 },
  animDemoButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orange500,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  animDemoButtonText: { ...typography.button, color: colors.white },
  glowDemoInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  glowDemoText: { ...typography.bodyMedium, color: colors.textPrimary },
  unlockDemoWrap: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
