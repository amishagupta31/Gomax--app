import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../theme';
import { TruckIcon } from './SurfaceIcons';
import { GiftOrder, orderStatus, shortDate } from '../services/giftOrders';

const DONE_GREEN = '#1DBF73';

type Step = { title: string; sub: string; state: 'done' | 'current' | 'todo' };

function stepsFor(order: GiftOrder): Step[] {
  const status = orderStatus(order);
  const shipped = status === 'shipped' || status === 'delivered';
  const delivered = status === 'delivered';
  return [
    { title: 'Booked', sub: shortDate(order.requested_at), state: 'done' },
    { title: 'Packed', sub: shipped ? 'Ready to ship' : 'We pack it in 2–3 days', state: shipped ? 'done' : 'current' },
    {
      title: 'Shipped',
      sub: shipped ? shortDate(order.shipped_at) : 'On the way soon',
      state: delivered ? 'done' : shipped ? 'current' : 'todo',
    },
    { title: 'Delivered', sub: delivered ? shortDate(order.delivered_at) : 'We will share a photo', state: delivered ? 'done' : 'todo' },
  ];
}

export function GiftTimeline({ order }: { order: GiftOrder }) {
  const steps = stepsFor(order);
  return (
    <View>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const lineDone = s.state === 'done' && steps[i + 1]?.state !== 'todo';
        return (
          <View key={s.title} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, s.state === 'done' ? styles.dotDone : s.state === 'current' ? styles.dotCurrent : styles.dotTodo]}>
                {s.state === 'done' ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                {s.state === 'current' && s.title === 'Shipped' ? <TruckIcon size={14} color={colors.white} /> : null}
                {s.state === 'current' && s.title !== 'Shipped' ? <Ionicons name="cube-outline" size={13} color={colors.white} /> : null}
              </View>
              {!last ? <View style={[styles.line, lineDone ? styles.lineDone : styles.lineTodo]} /> : null}
            </View>
            <View style={[styles.text, !last && styles.textGap]}>
              <Text style={[styles.title, s.state === 'todo' && styles.titleTodo]}>{s.title}</Text>
              <Text style={styles.sub}>{s.sub}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 13 },
  rail: { alignItems: 'center', width: 25 },
  dot: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: DONE_GREEN },
  dotCurrent: { backgroundColor: colors.primary700 },
  dotTodo: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: colors.neutral300 },
  line: { width: 2, flex: 1 },
  lineDone: { backgroundColor: DONE_GREEN },
  lineTodo: { backgroundColor: colors.neutral300 },
  text: { flex: 1, paddingTop: 1 },
  textGap: { paddingBottom: 16 },
  title: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.textPrimary },
  titleTodo: { color: colors.neutral400 },
  sub: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 3 },
});
