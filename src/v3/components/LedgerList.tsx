import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gift, Landmark, LucideIcon, Sparkles, Ticket, Trophy, Users } from 'lucide-react-native';
import { LedgerRow } from '../api/wallet';
import { fmt } from '../state/Store';
import { c, t } from '../theme';

const ICON: Record<LedgerRow['icon'], { Icon: LucideIcon; bg: string; ink: string }> = {
  ticket: { Icon: Ticket, bg: c.success50, ink: c.successText },
  landmark: { Icon: Landmark, bg: c.surfaceMuted, ink: c.textPrimary },
  gift: { Icon: Gift, bg: c.primary100, ink: c.primary700 },
  sparkles: { Icon: Sparkles, bg: c.runs50, ink: c.runs },
  users: { Icon: Users, bg: c.info50, ink: c.navy700 },
  trophy: { Icon: Trophy, bg: c.warning50, ink: c.warningText },
};

export function amountText(r: LedgerRow) {
  if (r.wallet === 'points') {
    if (r.kind === 'withdraw') return `−₹${fmt(Math.abs(r.amount))}`;
    return `${r.amount >= 0 ? '+' : '−'}${fmt(Math.abs(r.amount))} pts`;
  }
  return `${r.amount >= 0 ? '+' : '−'}${fmt(Math.abs(r.amount))} runs`;
}

// White bordered list card used by Wallet (B2-01) and History (B2-03a / B4).
export function LedgerList({ rows, round, onRowPress }: { rows: LedgerRow[]; round?: boolean; onRowPress?: (r: LedgerRow) => void }) {
  return (
    <View style={styles.list}>
      {rows.map((r, i) => {
        const { Icon, bg, ink } = ICON[r.icon];
        const earned = r.amount >= 0;
        return (
          <View key={r.id}>
            {i > 0 ? <View style={styles.div} /> : null}
            <Pressable style={styles.row} disabled={!onRowPress} onPress={() => onRowPress?.(r)}>
              <View style={[styles.av, { backgroundColor: bg, borderRadius: round ? 20 : 12 }]}>
                <Icon size={20} color={ink} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[t.body15Medium, { color: c.textPrimary }]}>{r.title}</Text>
                <Text style={[t.cap12, { color: c.textSecondary }]}>{r.sub}</Text>
              </View>
              <Text
                style={[
                  t.body15Semibold,
                  { color: !earned ? c.textPrimary : r.wallet === 'runs' ? c.runs : c.successText },
                ]}
              >
                {amountText(r)}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: c.surfaceCard, borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 4 },
  div: { height: 1, backgroundColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  av: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
