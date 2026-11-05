import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ArrowRight, LucideIcon } from 'lucide-react-native';
import { PressableScale } from '../../components/animations';
import { c, t } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'plain' | 'navy' | 'whatsapp' | 'dangerOutline' | 'primaryOutline';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Trailing arrow, as on most Figma CTAs. */
  arrow?: boolean;
  icon?: LucideIcon;
  /** Leading icon element (e.g. WhatsApp glyph). */
  leading?: React.ReactNode;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

const BG: Record<Variant, string> = {
  primary: c.primary700,
  secondary: c.primary50,
  outline: c.surfaceCard,
  ghost: 'transparent',
  plain: 'transparent',
  navy: c.navy900,
  whatsapp: c.whatsapp,
  dangerOutline: c.surfaceCard,
  primaryOutline: c.surfaceCard,
};

const FG: Record<Variant, string> = {
  primary: c.textInverse,
  secondary: c.primary700,
  outline: c.textPrimary,
  ghost: c.primary700,
  plain: c.textPrimary,
  navy: c.textInverse,
  whatsapp: c.textInverse,
  dangerOutline: c.dangerText,
  primaryOutline: c.primary700,
};

// Figma "Button" component (5:614 enabled / 5:664 disabled): 48h, 12 radius,
// Inter SemiBold 15, optional 20px trailing icon.
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  arrow,
  icon: Icon,
  leading,
  height = 48,
  style,
}: Props) {
  const fg = disabled ? c.textMuted : FG[variant];
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { height, backgroundColor: disabled && BG[variant] !== 'transparent' ? c.disabledBg : BG[variant] },
        variant === 'outline' && styles.outline,
        variant === 'dangerOutline' && styles.dangerOutline,
        variant === 'primaryOutline' && styles.primaryOutline,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {leading}
          {Icon ? <Icon size={20} color={fg} strokeWidth={2} /> : null}
          <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
            {label}
          </Text>
          {arrow ? <ArrowRight size={20} color={fg} strokeWidth={2} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  outline: { borderWidth: 1, borderColor: c.borderStrong },
  dangerOutline: { borderWidth: 1, borderColor: c.danger },
  primaryOutline: { borderWidth: 1.5, borderColor: c.primary700 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { ...t.button15 },
});
