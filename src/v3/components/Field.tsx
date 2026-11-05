import React, { forwardRef, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { CircleAlert, Eye, EyeOff } from 'lucide-react-native';
import { c, t } from '../theme';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  /** Left-docked prefix block, e.g. "+91" for mobile numbers. */
  prefix?: string;
  password?: boolean;
  /** Error helper text; also turns the border red. */
  error?: string;
  /** Wrong-password look: red-tinted fill as well as red border. */
  errorFill?: boolean;
  helper?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Figma "Text Field" component (5:869 / 5:916): 12 label, 48h field,
// 10 radius, #e0e0e0 border; error = 1.5 danger border + helper row.
export const Field = forwardRef<TextInput, Props>(function Field({
  label,
  prefix,
  password,
  error,
  errorFill,
  helper,
  right,
  style,
  ...input
}, ref) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const hasError = !!error || !!errorFill;

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          !prefix && styles.fieldPadLeft,
          focused && !hasError && styles.fieldFocus,
          hasError && styles.fieldError,
          errorFill && styles.fieldErrorFill,
        ]}
      >
        {prefix ? (
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={c.textMuted}
          secureTextEntry={password && hidden}
          style={styles.input}
          {...input}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
        />
        {password ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            {hidden ? (
              <Eye size={20} color={c.textSecondary} strokeWidth={1.75} />
            ) : (
              <EyeOff size={20} color={c.textSecondary} strokeWidth={1.75} />
            )}
          </Pressable>
        ) : null}
        {right}
      </View>
      {error ? <FieldError text={error} /> : null}
      {!error && helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
});

export function FieldError({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.errorRow, style]}>
      <CircleAlert size={14} color={c.dangerText} strokeWidth={2} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, alignSelf: 'stretch' },
  label: { ...t.cap12Medium, color: c.textSecondary },
  field: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.borderStrong,
    backgroundColor: c.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 14,
    overflow: 'hidden',
  },
  fieldPadLeft: { paddingLeft: 14 },
  // Focused (A1-07 "New password"): primary/50 fill, 1.5 primary/700 border
  fieldFocus: { borderWidth: 1.5, borderColor: c.primary700, backgroundColor: c.primary50 },
  fieldError: { borderWidth: 1.5, borderColor: c.danger },
  fieldErrorFill: { backgroundColor: c.danger50 },
  prefix: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: c.surfaceMuted,
    borderRightWidth: 1,
    borderRightColor: c.borderStrong,
  },
  prefixText: { ...t.body15Medium, color: c.textPrimary },
  input: {
    flex: 1,
    ...t.body15Medium,
    color: c.textPrimary,
    paddingVertical: 0,
    outlineStyle: 'none',
  } as object,
  helper: { ...t.cap12, color: c.textSecondary },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { ...t.cap12Medium, color: c.dangerText, flexShrink: 1 },
});
