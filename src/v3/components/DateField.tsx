import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { c, t } from '../theme';

// Muted, borderless date field from A1-08 ("DD / MM / YYYY" + calendar icon).
// Typed entry with auto-inserted separators — works the same on every platform.
export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const onText = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    const parts = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean);
    onChange(parts.join(' / '));
  };
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onText}
          placeholder="DD / MM / YYYY"
          placeholderTextColor={c.textMuted}
          keyboardType="number-pad"
          maxLength={14}
          style={styles.input}
        />
        <Calendar size={18} color={c.textSecondary} strokeWidth={1.75} />
      </View>
    </View>
  );
}

/** "DD / MM / YYYY" → ISO date, or undefined when incomplete/invalid. */
export function toIsoDate(v: string) {
  const m = v.match(/^(\d{2}) \/ (\d{2}) \/ (\d{4})$/);
  if (!m) return undefined;
  const [, dd, mm, yyyy] = m;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (date.getDate() !== Number(dd) || date.getMonth() !== Number(mm) - 1) return undefined;
  return `${yyyy}-${mm}-${dd}`;
}

const styles = StyleSheet.create({
  wrap: { gap: 6, alignSelf: 'stretch' },
  label: { ...t.cap12Medium, color: c.textSecondary },
  field: {
    height: 48,
    borderRadius: 10,
    backgroundColor: c.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  input: { flex: 1, ...t.body15, color: c.textPrimary, paddingVertical: 0, outlineStyle: 'none' } as object,
});
