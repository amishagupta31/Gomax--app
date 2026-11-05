import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Info } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3 } from '../../assets';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { RANKS, RANK_ORDER, nextRank, rankFor } from '../../data/ranks';
import { fmt, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// A3-02 Sheet · rank & benefits (17:17192). Same content as C3-02.
export function RankList() {
  const { account } = useV3();
  const lp = account.lifetimePoints;
  const current = rankFor(lp);
  const next = nextRank(current);
  const target = next ? RANKS[next].min : RANKS[current].min;
  const pct = next ? Math.min(1, lp / target) : 1;

  return (
    <>
      <View style={{ gap: 6 }}>
        <Text style={[t.sec13Medium, { color: c.textPrimary }]}>
          {next
            ? `${fmt(lp)} of ${fmt(target)} points · ${fmt(target - lp)} more to become ${RANKS[next].name}`
            : `${fmt(lp)} points · top rank reached`}
        </Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
        <Text style={[t.cap12, { color: c.textSecondary }]}>Ranks never go down. Points earned from coupons count.</Text>
      </View>
      {RANK_ORDER.map((id) => {
        const r = RANKS[id];
        const isYou = id === current;
        const isNext = id === next;
        return (
          <View key={id} style={[styles.rank, isYou && styles.rankYou]}>
            <Image source={r.art} style={{ width: 32, height: 32 }} />
            <View style={{ gap: 3, flex: 1 }}>
              <View style={styles.rankHead}>
                <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{r.name}</Text>
                <Text style={[t.cap12, { color: c.textSecondary }]}>{fmt(r.min)} pts</Text>
                {isYou ? (
                  <View style={[styles.pill, { backgroundColor: c.primary100 }]}>
                    <Text style={[t.cap12Medium, { color: c.primary700 }]}>You</Text>
                  </View>
                ) : isNext ? (
                  <View style={[styles.pill, { backgroundColor: c.surfaceMuted }]}>
                    <Text style={[t.cap12Medium, { color: c.textSecondary }]}>Next</Text>
                  </View>
                ) : null}
              </View>
              {r.benefits.map((b) => (
                <Text key={b} style={[t.cap12, { color: c.textSecondary }]}>
                  ✓  {b}
                </Text>
              ))}
            </View>
          </View>
        );
      })}
      <View style={styles.warn}>
        <Info size={14} color={c.warningText} strokeWidth={2} />
        <Text style={[t.cap12Medium, { color: c.warningText }]}>Legend benefits & limit: CLIENT to confirm</Text>
      </View>
    </>
  );
}

export function RankSheet(_: V3ScreenProps<'RankSheet'>) {
  return (
    <Sheet title="Your rank & benefits">
      <RankList />
    </Sheet>
  );
}

// A3-03 Sheet · how GoMax works (17:17416)
const STEPS: { art: number; text: string; sub?: string; done?: boolean }[] = [
  { art: d3.mobilePhone, text: 'Sign up with your mobile number', sub: 'Done ✓', done: true },
  { art: d3.ticket, text: 'Find the coupon in your GoMax pack' },
  { art: d3.checkMarkButton, text: 'Scan it with the app camera', sub: 'Each coupon works once' },
  { art: d3.coin, text: 'Get points · 1 point = ₹1' },
  { art: d3.creditCard, text: 'Take cash to UPI from 500 points' },
  { art: d3.wrappedGift, text: 'Win runs in games → get gifts' },
];

export function HowItWorksSheet({ navigation }: V3ScreenProps<'HowItWorksSheet'>) {
  return (
    <Sheet
      title="How GoMax works"
      footer={
        <>
          <Button label="Got it" onPress={() => navigation.goBack()} />
          <Pressable hitSlop={10} onPress={() => navigation.navigate('ScanTerms')} style={{ paddingVertical: 10 }}>
            <Text style={[t.sec13Semibold, { color: c.navyBrand }]}>Read full T&C</Text>
          </Pressable>
        </>
      }
    >
      <View style={{ gap: 10 }}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.num}>
              <Text style={[t.cap12Medium, { color: '#fff' }]}>{i + 1}</Text>
            </View>
            <View style={styles.stepArt}>
              <Image source={s.art} style={{ width: 26, height: 26 }} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[t.sec13Medium, { color: c.textPrimary }]}>{s.text}</Text>
              {s.sub ? <Text style={[t.cap12, { color: s.done ? c.successText : c.textSecondary }]}>{s.sub}</Text> : null}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.tnc}>
        <View style={styles.tncHead}>
          <Text style={[t.sec13Semibold, { color: c.textPrimary, flex: 1 }]}>Terms & conditions</Text>
          <View style={[styles.pill, { backgroundColor: c.warning50 }]}>
            <Text style={[t.cap12Medium, { color: c.warningText }]}>CLIENT to share</Text>
          </View>
        </View>
        {[
          'Each coupon can be scanned only once.',
          'Damaged or unreadable code: GoMax is not responsible.',
          'Points and gifts can change. Final T&C from GoMax.',
        ].map((l) => (
          <Text key={l} style={[t.cap12, { color: c.textSecondary }]}>
            •  {l}
          </Text>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  bar: { height: 8, borderRadius: 4, backgroundColor: c.surfaceMuted, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: c.primary500 },
  rank: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceCard,
  },
  rankYou: { backgroundColor: c.primary50, borderColor: c.primary500 },
  rankHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  warn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    backgroundColor: c.warning50,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: { width: 22, height: 22, borderRadius: 11, backgroundColor: c.navy900, alignItems: 'center', justifyContent: 'center' },
  stepArt: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.primary50, alignItems: 'center', justifyContent: 'center' },
  tnc: { backgroundColor: c.surfaceMuted, borderRadius: 14, padding: 14, gap: 6 },
  tncHead: { flexDirection: 'row', alignItems: 'center' },
});
