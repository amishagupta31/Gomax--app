import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { c, t } from '../../theme';
import { Page, CenterBar, SectionLabel } from '../../components/Layout';
import { DEMO_PRESETS, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

type Nav = V3ScreenProps<'DemoStates'>['navigation'];

// Screens that normally need a specific moment (10th coupon, last spin, …).
const FLOWS: [string, (n: Nav) => void][] = [
  ['C2-03 · no spins left', (n) => n.navigate('SpinNoneLeft')],
  ['C2-04 · scratch card earned', (n) => n.navigate('ScratchEarned')],
  ['C2-11 · challenge completed', (n) => n.navigate('ChallengeCompleted', { challengeId: 'weekly' })],
  ['C2-12 · new challenge popup', (n) => n.navigate('NewChallenge')],
  ['C2-15 · photo uploaded', (n) => n.navigate('PhotoStreakUploaded')],
  ['C4-03…14 · WhatsApp messages', (n) => n.navigate('WhatsAppMessages')],
];

// Dev-only: long-press the avatar on Home. Switches the demo account into
// the state behind each Figma Home frame, so every variant can be reviewed.
export function DemoStatesScreen({ navigation }: V3ScreenProps<'DemoStates'>) {
  const { applyPreset } = useV3();
  return (
    <Page bg={c.surfacePage}>
      <CenterBar title="Demo states" />
      <SectionLabel style={{ marginTop: 8, marginBottom: 8 }}>HOME VARIANTS</SectionLabel>
      <View style={styles.card}>
        {Object.entries(DEMO_PRESETS).map(([key, p], i) => (
          <Pressable
            key={key}
            onPress={() => {
              applyPreset(key as keyof typeof DEMO_PRESETS);
              navigation.navigate('Tabs', { screen: 'Home' });
            }}
            style={[styles.row, i > 0 && styles.divider]}
          >
            <Text style={[t.body15Medium, { color: c.textPrimary, flex: 1 }]}>{p.label}</Text>
            <ChevronRight size={18} color={c.textSecondary} strokeWidth={2} />
          </Pressable>
        ))}
      </View>
      <SectionLabel style={{ marginTop: 20, marginBottom: 8 }}>OTHER STATES</SectionLabel>
      <View style={styles.card}>
        {FLOWS.map(([label, go], i) => (
          <Pressable key={label} onPress={() => go(navigation)} style={[styles.row, i > 0 && styles.divider]}>
            <Text style={[t.body15Medium, { color: c.textPrimary, flex: 1 }]}>{label}</Text>
            <ChevronRight size={18} color={c.textSecondary} strokeWidth={2} />
          </Pressable>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: c.surfaceCard, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: c.border },
});
