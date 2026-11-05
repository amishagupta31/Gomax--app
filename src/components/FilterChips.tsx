import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fontFamily, radius } from '../theme';

type Props<K extends string> = {
  options: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  inset?: number;
};

export function FilterChips<K extends string>({ options, value, onChange, inset = 21 }: Props<K>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -inset }}
      contentContainerStyle={[styles.row, { paddingHorizontal: inset }]}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  text: { fontFamily: fontFamily.interMedium, fontSize: 14, color: colors.textPrimary },
  textActive: { color: colors.white },
});
