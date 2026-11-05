import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../theme';

export const WHATSAPP_TEAL = '#128C7E';

export function WhatsAppButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]} accessibilityRole="button">
      <Ionicons name="chatbubble-outline" size={20} color={colors.white} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 10,
    backgroundColor: WHATSAPP_TEAL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pressed: { opacity: 0.85 },
  label: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.white },
});
