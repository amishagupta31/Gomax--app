import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { c, t } from '../theme';

// Filter chip row (B1-07, B4-01…): active = navy pill, idle = white + border.
export function Chips<T extends string>({
  options,
  value,
  onChange,
  icons,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
  icons?: Partial<Record<T, LucideIcon>>;
}) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const on = o.key === value;
        const Icon: LucideIcon | undefined = on ? icons?.[o.key] : undefined;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[styles.chip, on ? styles.on : styles.off]}>
            {Icon ? <Icon size={15} color="#fff" strokeWidth={2} /> : null}
            <Text style={[t.sec13Medium, { color: on ? '#fff' : c.textPrimary }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  on: { backgroundColor: c.navy900 },
  off: { backgroundColor: c.surfaceCard, borderWidth: 1, borderColor: c.borderStrong, paddingVertical: 7 },
});
