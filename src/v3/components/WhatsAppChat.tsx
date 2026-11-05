import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { img } from '../assets';
import { c, t } from '../theme';

export const WA = {
  header: '#075e54',
  wallpaper: '#efeae2',
  link: '#027eb5',
  mine: '#d9fdd3',
};

export type WaMessage =
  | { from: 'me'; text: string; time?: string }
  | {
      from: 'gomax';
      lines: string[];
      link?: string;
      footnote?: string;
      image?: number;
      time?: string;
    }
  | { from: 'cta'; label: string; onPress?: () => void };

// WhatsApp conversation mock used by A1-12 and the C4 message templates —
// the "GoMax Support" verified-business thread as the user will see it.
export function WhatsAppChat({ messages, onBack }: { messages: WaMessage[]; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={onBack} hitSlop={10}>
          <ArrowLeft size={20} color="#fff" strokeWidth={2} />
        </Pressable>
        <View style={styles.logo}>
          <Image source={img.markOrange} style={{ width: 26, height: 26 }} resizeMode="contain" />
        </View>
        <View style={{ gap: 2 }}>
          <Text style={[t.body15Semibold, { color: '#fff' }]}>GoMax Support</Text>
          <Text style={[t.cap12, { color: '#fff' }]}>Verified business</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.chat}>
        {messages.map((m, i) => {
          if (m.from === 'me') {
            return (
              <View key={i} style={[styles.bubble, styles.me]}>
                <Text style={[t.body15, { color: c.textPrimary }]}>{m.text}</Text>
                <Text style={[t.cap12, { color: c.textSecondary }]}>{m.time ?? '10:42'} ✓✓</Text>
              </View>
            );
          }
          if (m.from === 'cta') {
            return (
              <Pressable key={i} onPress={m.onPress} style={[styles.bubble, styles.cta]}>
                <ExternalLink size={16} color={WA.link} strokeWidth={2} />
                <Text style={[t.body15Semibold, { color: WA.link }]}>{m.label}</Text>
              </Pressable>
            );
          }
          return (
            <View key={i} style={[styles.bubble, styles.bot]}>
              {m.image ? <Image source={m.image} style={styles.photo} resizeMode="cover" /> : null}
              <Text style={[t.body15, { color: c.textPrimary }]}>{m.lines.join('\n')}</Text>
              {m.link ? <Text style={[t.body15Medium, { color: WA.link }]}>{m.link}</Text> : null}
              {m.footnote ? <Text style={[t.cap12, { color: c.textSecondary }]}>{m.footnote}</Text> : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WA.wallpaper },
  header: {
    backgroundColor: WA.header,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chat: { padding: 16, paddingTop: 26, gap: 10 },
  bubble: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  me: { backgroundColor: WA.mine, alignSelf: 'flex-start' },
  bot: { backgroundColor: '#fff', width: 270, gap: 8, paddingVertical: 10 },
  cta: {
    backgroundColor: '#fff',
    width: 270,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photo: { width: 246, height: 150, borderRadius: 8 },
});
