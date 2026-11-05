import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { c, t } from '../theme';

type ScreenProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Footer with a hairline top border on white (A1-15 / A1-16 style). */
  footerBordered?: boolean;
  bg?: string;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom')[];
};

// Page shell: safe-area top, scrollable body, pinned footer that sits above
// the home indicator. Matches the 360-wide Figma frames with 20px gutters.
export function Page({
  children,
  footer,
  footerBordered,
  bg = c.surfaceCard,
  scroll = true,
  contentStyle,
  edges = ['top'],
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: bg }]} edges={edges}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Body
          style={styles.flex}
          {...(scroll
            ? {
                contentContainerStyle: [styles.content, contentStyle],
                keyboardShouldPersistTaps: 'handled' as const,
                showsVerticalScrollIndicator: false,
              }
            : { style: [styles.flex, styles.content, contentStyle] })}
        >
          {children}
        </Body>
        {footer ? (
          <View
            style={[
              styles.footer,
              footerBordered && styles.footerBordered,
              { paddingBottom: Math.max(insets.bottom, footerBordered ? 24 : 24), backgroundColor: bg },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Figma "Top App Bar" (5:1358): 56h, 40×40 muted back tile, r12.
export function TopBar({
  onBack,
  title,
  right,
  style,
  dark,
}: {
  onBack?: () => void;
  title?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  dark?: boolean;
}) {
  const nav = useNavigation();
  return (
    <View style={[styles.topBar, style]}>
      <BackButton onPress={onBack ?? (() => nav.goBack())} dark={dark} />
      {title ? (
        <Text style={[styles.topTitle, dark && { color: c.textInverse }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.flex} />
      )}
      <View style={styles.topRight}>{right}</View>
    </View>
  );
}

// Cream-page header (A3-05…, B-section pages): white bordered back tile,
// centred 18 title, 40px spacer/action on the right.
export function CenterBar({
  title,
  onBack,
  right,
  dark,
  style,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const nav = useNavigation();
  return (
    <View style={[styles.centerBar, style]}>
      <BackButton onPress={onBack ?? (() => nav.goBack())} bordered={!dark} dark={dark} />
      <Text style={[t.title18, { flex: 1, textAlign: 'center', color: dark ? c.textInverse : c.textPrimary }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function BackButton({ onPress, dark, bordered }: { onPress: () => void; dark?: boolean; bordered?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[
        styles.back,
        bordered && { backgroundColor: c.surfaceCard, borderWidth: 1, borderColor: c.border },
        dark && { backgroundColor: 'rgba(255,255,255,0.12)' },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <ArrowLeft size={20} color={dark ? c.textInverse : c.textPrimary} strokeWidth={2} />
    </Pressable>
  );
}

// Forgot-password progress: active dot is a 20×6 pill, others 6×6.
export function StepDots({ step, total = 3, label }: { step: number; total?: number; label?: string }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < step && { backgroundColor: c.navy700 },
            i === step - 1 && styles.dotActive,
          ]}
        />
      ))}
      <Text style={styles.dotsLabel}>{label ?? `Step ${step} of ${total}`}</Text>
    </View>
  );
}

// Sign-up stepper (6:4069): full-bleed track with a numbered navy dot.
export function Stepper({ step, label, total = 2 }: { step: number; label: string; total?: number }) {
  return (
    <View style={styles.stepper}>
      <View style={styles.track}>
        <View style={[styles.line, { backgroundColor: c.navy700 }]} />
        <View style={styles.stepDot}>
          <Text style={styles.stepDotText}>{step}</Text>
        </View>
        <View style={[styles.line, { backgroundColor: step >= total ? 'transparent' : c.stepperIdle }]} />
      </View>
      <View style={styles.stepLabelRow}>
        <Text style={styles.stepLabel}>{label}</Text>
        <Text style={styles.stepCount}>
          {step}/{total}
        </Text>
      </View>
    </View>
  );
}

export function Heading({ title, subtitle, align = 'center' }: { title: string; subtitle?: string; align?: 'center' | 'left' }) {
  return (
    <View style={[styles.heading, { alignItems: align === 'center' ? 'center' : 'flex-start' }]}>
      <Text style={[styles.headingTitle, { textAlign: align }]}>{title}</Text>
      {subtitle ? <Text style={[styles.headingSub, { textAlign: align }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionLabel({ children, style }: { children: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      <Text style={styles.sectionLabel}>{children}</Text>
    </View>
  );
}

export function LinkText({ children, onPress, color = c.navyBrand }: { children: string; onPress?: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.link}>
      <Text style={[t.button15, { color, textAlign: 'center' }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 4 },
  footerBordered: { borderTopWidth: 1, borderTopColor: c.border, gap: 10 },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: -20, paddingHorizontal: 20 },
  topTitle: { ...t.title18, color: c.textPrimary, flex: 1 },
  topRight: { minWidth: 40, alignItems: 'flex-end' },
  centerBar: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: c.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: c.borderStrong },
  dotActive: { width: 20 },
  dotsLabel: { ...t.cap12Medium, color: c.textSecondary, marginLeft: 8 },
  stepper: { alignItems: 'center', gap: 8, marginHorizontal: -20 },
  track: { height: 28, flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  line: { flex: 1, height: 2 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: c.navy700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: { ...t.cap12Medium, color: c.textInverse },
  stepLabelRow: { flexDirection: 'row', gap: 6 },
  stepLabel: { ...t.cap12Medium, color: c.navy700 },
  stepCount: { ...t.cap12, color: c.textMuted },
  heading: { gap: 8 },
  headingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 28, lineHeight: 34, letterSpacing: -0.56, color: c.navy700 },
  headingSub: { ...t.subtitle14, color: c.textSecondary },
  sectionLabel: { ...t.cap12Semibold, color: c.textSecondary, letterSpacing: 2.16 },
  link: { height: 48, alignItems: 'center', justifyContent: 'center' },
});
