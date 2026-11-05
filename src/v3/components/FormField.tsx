import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { CircleCheck, LucideIcon } from 'lucide-react-native';
import { c, t } from '../theme';
import { FieldError } from './Field';

// Page-form input used on cream pages (A3-06/07, B2-06, B3-01): r12, label
// with red "*" for required, optional leading icon, focus = 1.5 primary-500.
export function FormField({
  label,
  required,
  icon: Icon,
  helper,
  error,
  multiline,
  ...input
}: TextInputProps & {
  label: string;
  required?: boolean;
  icon?: LucideIcon;
  helper?: string;
  error?: string;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 6, alignSelf: 'stretch' }}>
      <View style={styles.labelRow}>
        <Text style={[t.cap12Medium, { color: c.textSecondary }]}>{label}</Text>
        {required ? <Text style={[t.cap12Medium, { color: c.danger }]}>*</Text> : null}
      </View>
      <View
        style={[
          styles.input,
          multiline && { height: undefined, minHeight: 88, alignItems: 'flex-start', paddingVertical: 12 },
          focus && { borderWidth: 1.5, borderColor: c.primary500 },
          !!error && { borderWidth: 1.5, borderColor: c.danger },
        ]}
      >
        {Icon ? <Icon size={18} color={c.textSecondary} strokeWidth={1.75} /> : null}
        <TextInput
          placeholderTextColor={c.textMuted}
          style={[styles.text, multiline && { textAlignVertical: 'top' }]}
          multiline={multiline}
          {...input}
          onFocus={(e) => {
            setFocus(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            input.onBlur?.(e);
          }}
        />
      </View>
      {error ? <FieldError text={error} /> : helper ? <Text style={[t.cap12, { color: c.textSecondary }]}>{helper}</Text> : null}
    </View>
  );
}

export function OkNote({ text }: { text: string }) {
  return (
    <View style={styles.ok}>
      <CircleCheck size={18} color={c.success} strokeWidth={2} />
      <Text style={[t.sec13Medium, { color: c.successText, flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', gap: 4 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.borderStrong,
    backgroundColor: c.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  text: { flex: 1, ...t.body15, color: c.textPrimary, paddingVertical: 0, outlineStyle: 'none' } as object,
  ok: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: c.success50 },
});
