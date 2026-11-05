import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronDown, Sparkles, Trophy } from 'lucide-react-native';
import { c, t } from '../../theme';
import { CenterBar } from '../../components/Layout';
import { Chips } from '../../components/Chips';
import { GameKind, GameRow, gamesHistory } from '../../api/games';
import { fmt } from '../../state/Store';

const KINDS: { key: GameKind | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'spin', label: 'Spin' },
  { key: 'scratch', label: 'Scratch' },
  { key: 'challenge', label: 'Challenges' },
];
const RANGES = ['Last 7 days', 'This month', 'Last month'];
const RANGE_KEYS = ['7d', 'month', 'lastMonth'] as const;

// C2-16 Games history · runs won (17:14321)
export function GamesHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<GameKind | 'all'>('all');
  const [range, setRange] = useState(0);
  const [rows, setRows] = useState<GameRow[]>([]);
  useFocusEffect(
    useCallback(() => {
      let on = true;
      gamesHistory(kind, RANGE_KEYS[range]).then((r) => on && setRows(r));
      return () => {
        on = false;
      };
    }, [kind, range]),
  );
  const runs = rows.filter((r) => r.prize.kind === 'runs').reduce((s, r) => s + r.prize.amount, 0);
  const pts = rows.filter((r) => r.prize.kind === 'points').reduce((s, r) => s + r.prize.amount, 0);
  const groups = useMemo(() => {
    const out: { day: string; rows: GameRow[] }[] = [];
    rows.forEach((r) => {
      const g = out.find((x) => x.day === r.day);
      if (g) g.rows.push(r);
      else out.push({ day: r.day, rows: [r] });
    });
    return out;
  }, [rows]);

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 40 }}>
        <CenterBar title="Games history" />
        <View style={{ gap: 14, paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={styles.stat}>
              <Text style={[t.sec13, { color: c.textSecondary }]}>Runs won</Text>
              <Text style={[t.title20, { color: c.runs }]}>+{fmt(runs)} runs</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[t.sec13, { color: c.textSecondary }]}>Points won</Text>
              <Text style={[t.title20, { color: c.successText }]}>+{fmt(pts)} pts</Text>
            </View>
          </View>
          <Pressable style={styles.dateChip} onPress={() => setRange((r) => (r + 1) % RANGES.length)}>
            <Calendar size={15} color={c.textPrimary} strokeWidth={1.75} />
            <Text style={[t.sec13Medium, { color: c.textPrimary }]}>{RANGES[range]}</Text>
            <ChevronDown size={15} color={c.textPrimary} strokeWidth={1.75} />
          </Pressable>
          <Chips options={KINDS} value={kind} onChange={setKind} />
          {groups.map((g) => (
            <View key={g.day} style={{ gap: 8 }}>
              <Text style={[t.cap12Semibold, { color: c.textSecondary, letterSpacing: 1.8 }]}>{g.day}</Text>
              <View style={styles.list}>
                {g.rows.map((r, i) => {
                  const ch = r.kind === 'challenge';
                  return (
                    <View key={r.id}>
                      {i > 0 ? <View style={styles.div} /> : null}
                      <View style={styles.row}>
                        <View style={[styles.av, { backgroundColor: ch ? c.warning50 : c.runs50 }]}>
                          {ch ? <Trophy size={20} color={c.warningText} strokeWidth={1.75} /> : <Sparkles size={20} color={c.runs} strokeWidth={1.75} />}
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={[t.body15Medium, { color: c.textPrimary }]}>{r.title}</Text>
                          <Text style={[t.cap12, { color: c.textSecondary }]}>{r.sub}</Text>
                        </View>
                        <Text style={[t.body15Semibold, { color: r.prize.kind === 'points' ? c.successText : c.runs }]}>
                          +{fmt(r.prize.amount)} {r.prize.kind === 'points' ? 'pts' : 'runs'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
          {rows.length === 0 ? (
            <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center', paddingVertical: 40 }]}>Nothing won here yet.</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, backgroundColor: c.surfaceMuted, borderRadius: 16, padding: 14, gap: 4 },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.borderStrong,
  },
  list: { backgroundColor: c.surfaceCard, borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 4 },
  div: { height: 1, backgroundColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  av: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
