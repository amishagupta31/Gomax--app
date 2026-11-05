import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronDown, ChevronRight, CircleCheck, QrCode } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3, img } from '../../assets';
import { CenterBar } from '../../components/Layout';
import { Chips } from '../../components/Chips';
import { Button } from '../../components/Button';
import { Sheet } from '../../components/Sheet';
import { LedgerList } from '../../components/LedgerList';
import { DateRange, LedgerKind, LedgerRow, RANGE_LABEL, listLedger } from '../../api/wallet';
import { fmt, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

const KINDS: Record<'points' | 'runs', { key: LedgerKind | 'all'; label: string }[]> = {
  points: [
    { key: 'all', label: 'All' },
    { key: 'scan', label: 'Scan' },
    { key: 'withdraw', label: 'Withdraw' },
    { key: 'bonus', label: 'Bonus' },
  ],
  runs: [
    { key: 'all', label: 'All' },
    { key: 'games', label: 'Games' },
    { key: 'invite', label: 'Invite' },
    { key: 'gifts', label: 'Gifts' },
  ],
};

const DAY_LABEL = { today: 'TODAY', yesterday: 'YESTERDAY', earlier: 'EARLIER' } as const;

// B2-03a History · all · B4-01 runs tab · B4-03 empty (filter) · B4-04 empty
// (new user) (17:18772 / 18541 / 18698 / 18738)
export function HistoryScreen({ navigation, route }: V3ScreenProps<'HistoryAll'>) {
  const insets = useSafeAreaInsets();
  const { account } = useV3();
  const [wallet, setWallet] = useState<'points' | 'runs'>(route.params?.wallet ?? 'points');
  const [range, setRange] = useState<DateRange>(route.params?.range ?? 'month');
  const [kind, setKind] = useState<LedgerKind | 'all'>('all');
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const isNew = account.lifetimePoints === 0 && account.runs === 0;

  useEffect(() => {
    if (route.params?.range) setRange(route.params.range);
  }, [route.params?.range]);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      listLedger(wallet, range, kind, isNew).then((r) => live && setRows(r));
      return () => {
        live = false;
      };
    }, [wallet, range, kind, isNew]),
  );

  const filtered = range !== 'month' || kind !== 'all';
  const clear = () => {
    setRange('month');
    setKind('all');
  };
  const earned = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const spent = rows.filter((r) => r.amount < 0).reduce((s, r) => s - r.amount, 0);
  const groups = useMemo(
    () => (['today', 'yesterday', 'earlier'] as const).map((d) => ({ d, rows: rows.filter((r) => r.day === d) })).filter((g) => g.rows.length),
    [rows],
  );
  const rangeWord = RANGE_LABEL[range].toLowerCase();

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 40 }}>
        <CenterBar title="History" />
        <View style={{ gap: 14, paddingTop: 8 }}>
          <View style={styles.switch}>
            {(['points', 'runs'] as const).map((w) => (
              <Pressable
                key={w}
                style={[styles.seg, wallet === w && styles.segOn]}
                onPress={() => {
                  setWallet(w);
                  setKind('all');
                }}
              >
                <Text style={[wallet === w ? t.sec13Semibold : t.sec13Medium, { color: wallet === w ? c.textPrimary : c.textSecondary }]}>
                  {w === 'points' ? 'Points' : 'Runs'}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.filterRow}>
            <Pressable style={styles.dateChip} onPress={() => navigation.navigate('HistoryFilterSheet', { range })}>
              <Calendar size={15} color={c.textPrimary} strokeWidth={1.75} />
              <Text style={[t.sec13Medium, { color: c.textPrimary }]}>{RANGE_LABEL[range]}</Text>
              <ChevronDown size={15} color={c.textPrimary} strokeWidth={1.75} />
            </Pressable>
            <View style={{ flex: 1 }} />
            {filtered && !isNew ? (
              <Pressable onPress={clear} hitSlop={8}>
                <Text style={[t.sec13Semibold, { color: c.primary700 }]}>Clear all</Text>
              </Pressable>
            ) : null}
          </View>
          <Chips options={KINDS[wallet]} value={kind} onChange={setKind} />

          {isNew ? (
            <View style={styles.empty}>
              <Image source={img.workerEmpty} style={{ width: 120, height: 160 }} resizeMode="contain" />
              <Text style={[t.title18, { color: c.textPrimary }]}>No entries yet</Text>
              <Text style={[t.sec13, { color: c.textSecondary }]}>Scan your first coupon to earn points</Text>
              <Button label="Scan now" icon={QrCode} onPress={() => navigation.navigate('Tabs', { screen: 'Scan' })} />
            </View>
          ) : rows.length === 0 ? (
            <View style={styles.empty}>
              <Image source={d3.bookmarkTabs} style={{ width: 88, height: 88 }} />
              <Text style={[t.title18, { color: c.textPrimary }]}>Nothing here</Text>
              <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center', width: 260 }]}>
                No {kind === 'all' ? '' : `${KINDS[wallet].find((k) => k.key === kind)?.label.toLowerCase()} `}entries {range === 'today' ? 'today' : `for ${rangeWord}`}. Try a different date or type.
              </Text>
              <Button label="Clear filters" variant="primaryOutline" style={{ width: 220, alignSelf: 'center' }} onPress={clear} />
            </View>
          ) : (
            <>
              <View style={[styles.summary, { backgroundColor: wallet === 'points' ? c.success50 : c.runs50 }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[t.title18, { color: c.textPrimary }]}>
                    +{fmt(earned)} {wallet === 'points' ? 'pts' : 'runs'}
                  </Text>
                  <Text style={[t.cap12, { color: c.textSecondary }]}>Earned · {rangeWord}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[t.title18, { color: c.textPrimary }]}>
                    {wallet === 'points' ? `−₹${fmt(spent)}` : `−${fmt(spent)} runs`}
                  </Text>
                  <Text style={[t.cap12, { color: c.textSecondary }]}>
                    {wallet === 'points' ? 'Withdrawn' : 'Spent'} · {rangeWord}
                  </Text>
                </View>
              </View>
              {groups.map((g) => (
                <View key={g.d} style={{ gap: 14 }}>
                  <Text style={[t.cap12Semibold, { color: c.textSecondary, letterSpacing: 2.16 }]}>{DAY_LABEL[g.d]}</Text>
                  <LedgerList rows={g.rows} onRowPress={(r) => r.kind === 'withdraw' && navigation.navigate('WithdrawPaid', { id: 'W-3001' })} />
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// B4-02 History · date filter (sheet) (17:18675)
export function HistoryFilterSheet({ navigation, route }: V3ScreenProps<'HistoryFilterSheet'>) {
  const [pick, setPick] = useState<DateRange>(route.params.range);
  const opts: DateRange[] = ['today', '7d', 'month', 'lastMonth'];
  const show = () => navigation.navigate({ name: 'HistoryAll', params: { range: pick }, merge: true });
  return (
    <Sheet result scroll={false} footer={<Button label="Show" onPress={show} />}>
      <Text style={[t.title18, { color: c.textPrimary }]}>Show history for</Text>
      <View style={{ gap: 8 }}>
        {opts.map((o) => {
          const on = pick === o;
          return (
            <Pressable key={o} onPress={() => setPick(o)} style={[styles.opt, on && styles.optOn]}>
              <Text style={[t.body15Medium, { color: c.textPrimary, flex: 1 }]}>{RANGE_LABEL[o]}</Text>
              {on ? <CircleCheck size={20} color={c.primary700} strokeWidth={2} /> : null}
            </Pressable>
          );
        })}
        <Pressable onPress={() => setPick('custom')} style={[styles.opt, { gap: 10 }, pick === 'custom' && styles.optOn]}>
          <Calendar size={18} color={c.textSecondary} strokeWidth={1.75} />
          <Text style={[t.body15Medium, { color: c.textPrimary, flex: 1 }]}>Pick dates (from – to)</Text>
          <ChevronRight size={18} color={c.textSecondary} strokeWidth={1.75} />
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', padding: 4, borderRadius: 12, backgroundColor: c.surfaceMuted },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  segOn: { backgroundColor: c.surfaceCard },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.borderStrong,
    backgroundColor: c.surfaceCard,
  },
  summary: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  opt: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  optOn: { backgroundColor: c.primary50, borderWidth: 1.5, borderColor: c.primary500 },
});
