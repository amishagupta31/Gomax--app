import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, CircleCheck } from 'lucide-react-native';
import { passwordRules } from '../api/auth';
import { c, t } from '../theme';

// "rules" card from A1-07 / A1-13: optional 3-segment strength bar + checklist.
export function PasswordRules({ pw, confirm, showStrength }: { pw: string; confirm: string; showStrength?: boolean }) {
  const r = passwordRules(pw, confirm);
  const met = [r.length, r.number, r.match].filter(Boolean).length;
  return (
    <View style={styles.card}>
      {showStrength ? (
        <View style={styles.strength}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.seg, { backgroundColor: i < met ? c.success : c.borderStrong }]} />
          ))}
        </View>
      ) : null}
      <Rule ok={r.length} text="At least 8 characters" />
      <Rule ok={r.number} text="One number (0–9)" />
      <Rule ok={r.match} text="Both passwords match" />
    </View>
  );
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.rule}>
      {ok ? (
        <CircleCheck size={16} color={c.successText} strokeWidth={2} />
      ) : (
        <Circle size={16} color={c.textMuted} strokeWidth={2} />
      )}
      <Text style={[t.cap12Medium, { color: ok ? c.successText : c.textSecondary }]}>{text}</Text>
    </View>
  );
}

export function rulesOk(pw: string, confirm: string) {
  const r = passwordRules(pw, confirm);
  return r.length && r.number && r.match;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignSelf: 'stretch',
  },
  strength: { flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 4, borderRadius: 999 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
