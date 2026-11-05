import React, { useCallback, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, MessageCircle, QrCode, Ticket } from 'lucide-react-native';
import { c, t, HELPLINE, HELPLINE_TEL } from '../../theme';
import { d3, img } from '../../assets';
import { CenterBar } from '../../components/Layout';
import { Chips } from '../../components/Chips';
import { Button } from '../../components/Button';
import { StaticTabBar } from '../../components/TabBar';
import { ScanRow, ScanStatus, fmtDayTime, fmtTime, last4, listScans } from '../../api/coupons';
import { fmt } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

type Range = 'today' | 'week' | 'month';
type Status = 'all' | ScanStatus;

// B1-07 today · B1-08 week · failed · B1-09 empty (17:12358 / 12463 / 12538)
export function MyScansScreen({ navigation, route }: V3ScreenProps<'MyScans'>) {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>(route.params?.range ?? 'today');
  const [status, setStatus] = useState<Status>(route.params?.status ?? 'all');
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [all, setAll] = useState<ScanRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      Promise.all([listScans(range, status), listScans(range, 'all')]).then(([r, a]) => {
        if (!live) return;
        setRows(r);
        setAll(a);
      });
      return () => {
        live = false;
      };
    }, [range, status]),
  );

  const added = all.filter((r) => r.status === 'added');
  const waiting = all.filter((r) => r.status === 'waiting').length;
  const points = added.reduce((s, r) => s + r.value, 0);
  const failed = rows.filter((r) => r.status === 'failed').length;
  const rangeLabel = range === 'today' ? 'TODAY' : range === 'week' ? 'THIS WEEK' : 'THIS MONTH';
  const empty = all.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.surfacePage }}>
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top }]}>
        <CenterBar
          title="My scans"
          right={
            <Pressable style={styles.calBtn} onPress={() => setRange(range === 'month' ? 'today' : 'month')} accessibilityLabel="Date range">
              <Calendar size={20} color={c.textPrimary} strokeWidth={1.75} />
            </Pressable>
          }
        />
        <View style={{ gap: 14, paddingTop: 8 }}>
          {empty ? null : (
            <LinearGradient
              colors={[c.navy900, c.navy500]}
              locations={[0.146, 0.854]}
              start={{ x: 0.66, y: 0 }}
              end={{ x: 0.34, y: 1 }}
              style={styles.summary}
            >
              <Cell art={d3.checkMarkButton} value={range === 'today' ? added.length : all.length} label={range === 'today' ? 'Added' : 'Scans'} />
              <Cell art={d3.coin} value={points} label="Points" />
              <Cell art={d3.hourglass} value={waiting} label="Waiting" />
            </LinearGradient>
          )}
          <View style={{ gap: 8 }}>
            <Chips
              options={[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This week' },
                { key: 'month', label: 'This month' },
              ]}
              value={range}
              onChange={setRange}
              icons={{ today: Calendar }}
            />
            <Chips
              options={[
                { key: 'all', label: 'All' },
                { key: 'added', label: 'Added' },
                { key: 'waiting', label: 'Waiting' },
                { key: 'failed', label: 'Failed' },
              ]}
              value={status}
              onChange={setStatus}
            />
          </View>

          {empty ? (
            <View style={styles.empty}>
              <Image source={img.workerEmpty} style={{ width: 150, height: 200 }} resizeMode="contain" />
              <Text style={[t.title18, { color: c.textPrimary }]}>
                {range === 'today' ? 'No scans today' : range === 'week' ? 'No scans this week' : 'No scans this month'}
              </Text>
              <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center', width: 280 }]}>
                Every GoMax coupon has a QR code. Scan it to earn points.
              </Text>
              <Button
                label="Scan a coupon"
                icon={QrCode}
                style={{ width: 220, alignSelf: 'center' }}
                onPress={() => navigation.navigate('Tabs', { screen: 'Scan' })}
              />
            </View>
          ) : (
            <>
              <Text style={[t.cap12Semibold, { color: c.textSecondary, letterSpacing: 2.16 }]}>
                {rangeLabel}
                {status === 'failed' ? ` · ${failed} FAILED` : ''}
              </Text>
              {rows.length ? (
                <View style={styles.list}>
                  {rows.map((r, i) => (
                    <View key={r.id}>
                      {i > 0 ? <View style={styles.div} /> : null}
                      <Row r={r} withDay={range !== 'today'} />
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[t.sec13, { color: c.textSecondary, textAlign: 'center', paddingVertical: 24 }]}>
                  Nothing here for this filter.
                </Text>
              )}
              {status === 'failed' || failed > 0 ? (
                <Pressable style={styles.help} onPress={() => Linking.openURL(`tel:${HELPLINE_TEL}`)}>
                  <MessageCircle size={20} color={c.navy900} strokeWidth={1.75} />
                  <Text style={[t.sec13Medium, { color: c.textPrimary, flex: 1 }]}>
                    Coupon problem? Call GoMax helpline {HELPLINE}.
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
      <StaticTabBar active="Scan" />
    </View>
  );
}

function Cell({ art, value, label }: { art: number; value: number; label: string }) {
  return (
    <View style={styles.cell}>
      <Image source={art} style={{ width: 30, height: 30 }} />
      <Text style={styles.cellNum}>{fmt(value)}</Text>
      <Text style={[t.cap12, { color: '#fff' }]}>{label}</Text>
    </View>
  );
}

const TONE: Record<ScanStatus, { bg: string; ink: string; label: string }> = {
  added: { bg: c.success50, ink: c.successText, label: 'Added' },
  waiting: { bg: c.warning50, ink: c.warningText, label: 'Waiting' },
  failed: { bg: c.danger50, ink: c.dangerText, label: 'Failed' },
};

function Row({ r, withDay }: { r: ScanRow; withDay: boolean }) {
  const tone = TONE[r.status];
  const how = r.reason ?? (r.source === 'scan' ? 'Scan' : 'Typed code');
  return (
    <View style={styles.row}>
      <View style={[styles.av, { backgroundColor: tone.bg }]}>
        <Ticket size={20} color={tone.ink} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.body15Medium, { color: c.textPrimary }]}>Coupon {last4(r.code)}</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>
          {withDay ? fmtDayTime(r.at) : fmtTime(r.at)} · {how}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={[t.body15Semibold, { color: r.status === 'failed' ? c.textMuted : tone.ink }]}>
          {r.status === 'failed' ? '0' : `+${r.value}`}
        </Text>
        <View style={[styles.pill, { backgroundColor: tone.bg }]}>
          <Text style={[t.cap12Medium, { color: tone.ink }]}>{tone.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingBottom: 120 },
  calBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  summary: { height: 110, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 8 },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  cellNum: { fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 24, letterSpacing: -0.1, color: '#fff' },
  list: { backgroundColor: c.surfaceCard, borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 4 },
  div: { height: 1, backgroundColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  av: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  help: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, backgroundColor: c.info50 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 40 },
});
