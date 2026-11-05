import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, LucideIcon } from 'lucide-react-native';
import { c, t } from '../theme';

export type TimelineStep = {
  title: string;
  sub?: string;
  state: 'done' | 'current' | 'todo';
  icon?: LucideIcon; // shown on the current step (e.g. truck)
  extra?: React.ReactNode;
};

// Order / payout timeline (B2-08, B2-09, B3-04): 24px dots, 2px rail,
// green for done, terracotta for the current step, grey ring for todo.
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const Icon = s.icon;
        const nextDone = steps[i + 1]?.state === 'done' || steps[i + 1]?.state === 'current';
        return (
          <View key={s.title} style={styles.step}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  s.state === 'done' && { backgroundColor: c.success },
                  s.state === 'current' && { backgroundColor: c.primary700 },
                  s.state === 'todo' && styles.todo,
                ]}
              >
                {s.state === 'done' ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
                {s.state === 'current' && Icon ? <Icon size={14} color="#fff" strokeWidth={2} /> : null}
              </View>
              {last ? null : (
                <View style={[styles.line, { backgroundColor: s.state === 'done' && nextDone ? c.success : c.borderStrong }]} />
              )}
            </View>
            <View style={styles.tx}>
              <Text style={[t.body15Semibold, { color: s.state === 'todo' ? c.textMuted : c.textPrimary }]}>{s.title}</Text>
              {s.sub ? <Text style={[t.cap12, { color: c.textSecondary }]}>{s.sub}</Text> : null}
              {s.extra}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: 12 },
  rail: { width: 24, alignItems: 'center' },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  todo: { backgroundColor: c.surfaceMuted, borderWidth: 1, borderColor: c.borderStrong },
  line: { width: 2, flex: 1, minHeight: 34 },
  tx: { flex: 1, gap: 2, paddingTop: 2, paddingBottom: 10 },
});
