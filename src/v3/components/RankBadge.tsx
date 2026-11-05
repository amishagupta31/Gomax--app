import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HardHat } from 'lucide-react-native';
import { RANKS, RankId } from '../data/ranks';
import { t } from '../theme';

// Figma "Rank Badge" (1:4430): pill with a 20px coloured icon disc.
export function RankBadge({ rank, dark }: { rank: RankId; dark?: boolean }) {
  const r = RANKS[rank];
  const Icon = r.icon ?? HardHat;
  return (
    <View style={[styles.pill, { backgroundColor: dark ? r.color : r.tint }]}>
      <View style={[styles.disc, { backgroundColor: dark ? 'rgba(255,255,255,0.22)' : r.color }]}>
        <Icon size={12} color="#fff" strokeWidth={2.25} />
      </View>
      <Text style={[t.cap12Medium, { color: dark ? '#fff' : r.color }]}>{r.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  disc: { width: 20, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
