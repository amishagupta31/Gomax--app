import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { FilterChips } from '../../components/FilterChips';
import { listMyPointsLedger, listMyRunsLedger } from '../../services/wallet';
import {
  DEFAULT_RANGE,
  DateRange,
  HistoryEntry,
  HistoryTab,
  RangeKey,
  TYPE_FILTERS,
  entryVisual,
  formatAmount,
  matchesType,
  parseDayMonthYear,
  rangeBounds,
  rangeLabel,
  rangePhrase,
  sectionFor,
  timeOrDate,
  toEntries,
} from '../../services/history';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

const RUNS_TEAL = '#1B8AA6';
const SECTIONS = ['TODAY', 'YESTERDAY', 'EARLIER'] as const;
const SHEET_OPTIONS: { key: Exclude<RangeKey, 'custom'>; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
];

export function HistoryScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<HistoryTab>(route.params?.tab ?? 'points');
  const [range, setRange] = useState<DateRange>(DEFAULT_RANGE);
  const [typeKey, setTypeKey] = useState('all');
  const [ledgers, setLedgers] = useState<Record<HistoryTab, HistoryEntry[]> | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    Promise.all([listMyPointsLedger(), listMyRunsLedger()])
      .then(([p, r]) => setLedgers({ points: toEntries(p), runs: toEntries(r) }))
      .catch(() => setLedgers({ points: [], runs: [] }));
  }, []);

  const all = ledgers?.[tab] ?? [];
  const [from, to] = rangeBounds(range);
  const inRange = useMemo(() => all.filter((e) => e.createdAt >= from && e.createdAt < to), [all, from.getTime(), to.getTime()]);
  const visible = inRange.filter((e) => matchesType(tab, typeKey, e.entryType));
  const earned = inRange.filter((e) => !e.debit).reduce((s, e) => s + e.value, 0);
  const spent = inRange.filter((e) => e.debit).reduce((s, e) => s + e.value, 0);
  const filtersActive = range.key !== DEFAULT_RANGE.key || typeKey !== 'all';
  const typeLabel = TYPE_FILTERS[tab].find((f) => f.key === typeKey)?.label.toLowerCase();

  const switchTab = (t: HistoryTab) => {
    setTab(t);
    setTypeKey('all');
  };
  const clearAll = () => {
    setRange(DEFAULT_RANGE);
    setTypeKey('all');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader title="History" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.segment}>
          {(['points', 'runs'] as const).map((t) => (
            <Pressable key={t} style={[styles.segmentItem, tab === t && styles.segmentActive]} onPress={() => switchTab(t)}>
              <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>{t === 'points' ? 'Points' : 'Runs'}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.rangeRow}>
          <Pressable style={styles.rangeChip} onPress={() => setSheetOpen(true)} accessibilityRole="button">
            <Ionicons name="calendar-outline" size={17} color={colors.neutral600} />
            <Text style={styles.rangeText}>{rangeLabel(range)}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.neutral600} />
          </Pressable>
          {filtersActive ? (
            <Pressable onPress={clearAll} hitSlop={8}>
              <Text style={styles.clearAll}>Clear all</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ marginTop: 15 }}>
          <FilterChips options={TYPE_FILTERS[tab]} value={typeKey} onChange={setTypeKey} />
        </View>

        {ledgers && all.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👷</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySub}>
              {tab === 'points' ? 'Scan your first coupon to earn points' : 'Spin the wheel or win a challenge to earn runs'}
            </Text>
            <Pressable
              style={styles.emptyPrimary}
              onPress={() =>
                tab === 'points' ? navigation.navigate('Main', { screen: 'Scan' } as never) : navigation.navigate('SpinWheel')
              }
            >
              <Ionicons name={tab === 'points' ? 'qr-code-outline' : 'sparkles-outline'} size={17} color={colors.white} />
              <Text style={styles.emptyPrimaryText}>{tab === 'points' ? 'Scan now' : 'Spin now'}</Text>
            </Pressable>
          </View>
        ) : null}

        {ledgers && all.length > 0 && visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📑</Text>
            <Text style={styles.emptyTitle}>Nothing here</Text>
            <Text style={styles.emptySub}>
              No {typeKey === 'all' ? '' : `${typeLabel} `}entries {rangePhrase(range)}. Try a different date or type.
            </Text>
            <Pressable style={styles.emptyOutline} onPress={clearAll}>
              <Text style={styles.emptyOutlineText}>Clear filters</Text>
            </Pressable>
          </View>
        ) : null}

        {visible.length > 0 ? (
          <>
            <View style={[styles.summary, { backgroundColor: tab === 'points' ? '#E6F6EC' : '#E6F3F7' }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryValue}>
                  +{earned.toLocaleString('en-IN')} {tab === 'points' ? 'pts' : 'runs'}
                </Text>
                <Text style={styles.summaryLabel}>Earned · {rangePhrase(range)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryValue}>
                  {tab === 'points' ? `−₹${spent.toLocaleString('en-IN')}` : `−${spent.toLocaleString('en-IN')} runs`}
                </Text>
                <Text style={styles.summaryLabel}>
                  {tab === 'points' ? 'Withdrawn' : 'Spent'} · {rangePhrase(range)}
                </Text>
              </View>
            </View>

            {SECTIONS.map((section) => {
              const rows = visible.filter((e) => sectionFor(e.createdAt) === section);
              if (rows.length === 0) return null;
              return (
                <View key={section}>
                  <Text style={styles.sectionLabel}>{section}</Text>
                  <View style={styles.card}>
                    {rows.map((e, i) => {
                      const v = entryVisual(e.entryType);
                      return (
                        <View key={e.id} style={[styles.row, i > 0 && styles.rowDivider]}>
                          <View style={[styles.icon, { backgroundColor: v.tint }]}>
                            <Ionicons name={v.icon as keyof typeof Ionicons.glyphMap} size={20} color={v.ink} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.rowTitle}>{v.title}</Text>
                            <Text style={styles.rowSub}>{e.sub ?? timeOrDate(e.createdAt, section)}</Text>
                          </View>
                          <Text
                            style={[
                              styles.amount,
                              { color: e.debit ? colors.textPrimary : tab === 'points' ? colors.successText : RUNS_TEAL },
                            ]}
                          >
                            {formatAmount(tab, e)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
        ) : null}
      </ScrollView>

      <RangeSheet
        visible={sheetOpen}
        initial={range}
        onClose={() => setSheetOpen(false)}
        onApply={(r) => {
          setRange(r);
          setSheetOpen(false);
        }}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

type SheetProps = {
  visible: boolean;
  initial: DateRange;
  onClose: () => void;
  onApply: (r: DateRange) => void;
  bottomInset: number;
};

function RangeSheet({ visible, initial, onClose, onApply, bottomInset }: SheetProps) {
  const [selected, setSelected] = useState<RangeKey>(initial.key);
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelected(initial.key);
      setError(null);
    }
  }, [visible, initial.key]);

  const apply = () => {
    if (selected !== 'custom') return onApply({ key: selected });
    const from = parseDayMonthYear(fromText);
    const to = parseDayMonthYear(toText);
    if (!from || !to || from > to) {
      setError('Enter dates as DD/MM/YYYY, with "from" before "to".');
      return;
    }
    onApply({ key: 'custom', from, to });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(bottomInset, 20) }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Show history for</Text>
          {SHEET_OPTIONS.map((o) => {
            const active = selected === o.key;
            return (
              <Pressable key={o.key} style={[styles.option, active && styles.optionActive]} onPress={() => setSelected(o.key)}>
                <Text style={styles.optionText}>{o.label}</Text>
                {active ? <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary700} /> : null}
              </Pressable>
            );
          })}
          <Pressable style={[styles.option, selected === 'custom' && styles.optionActive]} onPress={() => setSelected('custom')}>
            <Ionicons name="calendar-outline" size={18} color={colors.neutral500} />
            <Text style={[styles.optionText, { flex: 1, marginLeft: 10 }]}>Pick dates (from – to)</Text>
            <Ionicons name={selected === 'custom' ? 'chevron-down' : 'chevron-forward'} size={16} color={colors.neutral500} />
          </Pressable>
          {selected === 'custom' ? (
            <View style={styles.dateRow}>
              <TextInput value={fromText} onChangeText={setFromText} placeholder="From DD/MM/YYYY" placeholderTextColor={colors.neutral400} style={styles.dateInput} />
              <TextInput value={toText} onChangeText={setToText} placeholder="To DD/MM/YYYY" placeholderTextColor={colors.neutral400} style={styles.dateInput} />
            </View>
          ) : null}
          {error ? <Text style={styles.sheetError}>{error}</Text> : null}
          <Pressable style={styles.showButton} onPress={apply}>
            <Text style={styles.showText}>Show</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 21, paddingTop: 18 },
  segment: { flexDirection: 'row', height: 45, borderRadius: 12, backgroundColor: '#F3F4F6', padding: 4 },
  segmentItem: { flex: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.white },
  segmentText: { fontFamily: fontFamily.interMedium, fontSize: 14, color: colors.neutral500 },
  segmentTextActive: { fontFamily: fontFamily.interSemiBold, color: colors.textPrimary },
  rangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 },
  rangeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 37,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  rangeText: { fontFamily: fontFamily.interRegular, fontSize: 14, color: colors.textPrimary },
  clearAll: { fontFamily: fontFamily.interSemiBold, fontSize: 14, color: colors.primary700 },
  summary: { flexDirection: 'row', marginTop: 15, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 15 },
  summaryValue: { fontFamily: fontFamily.interBold, fontSize: 17, color: colors.textPrimary },
  summaryLabel: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 3 },
  sectionLabel: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 11,
    letterSpacing: 2.2,
    color: colors.neutral500,
    marginTop: 18,
    marginBottom: 10,
  },
  card: { borderRadius: 14, borderWidth: 1, borderColor: colors.neutral200, paddingHorizontal: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12 },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.neutral200 },
  icon: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fontFamily.interMedium, fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  rowSub: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  amount: { fontFamily: fontFamily.interSemiBold, fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 80 },
  emptyTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 18, color: colors.textPrimary, marginTop: 14 },
  emptySub: { fontFamily: fontFamily.interRegular, fontSize: 13, lineHeight: 20, color: colors.neutral500, marginTop: 6, textAlign: 'center' },
  emptyPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    alignSelf: 'stretch',
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.primary700,
    justifyContent: 'center',
  },
  emptyPrimaryText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.white },
  emptyOutline: {
    marginTop: 16,
    height: 46,
    paddingHorizontal: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOutlineText: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.primary700 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,21,38,0.45)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 21, paddingTop: 8 },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.neutral200 },
  sheetTitle: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.textPrimary, marginTop: 14, marginBottom: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 15,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  optionActive: { borderColor: '#E2765D', backgroundColor: '#FFF6F2' },
  optionText: { fontFamily: fontFamily.interRegular, fontSize: 14, color: colors.textPrimary },
  dateRow: { flexDirection: 'row', gap: 9, marginTop: 9 },
  dateInput: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: 12,
    fontFamily: fontFamily.interRegular,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sheetError: { fontFamily: fontFamily.interMedium, fontSize: 12, color: colors.dangerText, marginTop: 8 },
  showButton: { marginTop: 16, height: 50, borderRadius: 12, backgroundColor: colors.primary700, alignItems: 'center', justifyContent: 'center' },
  showText: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.white },
});
