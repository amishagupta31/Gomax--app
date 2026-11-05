import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../theme';

type Props = {
  title?: string;
  onBack: () => void;
  right?: React.ReactNode;
  tone?: 'light' | 'dark';
  align?: 'center' | 'left';
  backVariant?: 'outline' | 'filled';
};

export function ScreenHeader({ title, onBack, right, tone = 'light', align = 'center', backVariant = 'outline' }: Props) {
  const dark = tone === 'dark';
  const backStyle = dark ? styles.backDark : backVariant === 'filled' ? styles.backFilled : styles.backLight;
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack}
        style={[styles.back, backStyle]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={20} color={dark ? colors.white : colors.textPrimary} />
      </Pressable>
      {title ? (
        <Text
          numberOfLines={1}
          style={[styles.title, dark && styles.titleDark, align === 'left' ? styles.titleLeft : styles.titleCenter]}
        >
          {title}
        </Text>
      ) : (
        <View style={styles.flex} />
      )}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 21, paddingTop: 8, height: 50 },
  back: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backLight: { borderWidth: 1, borderColor: colors.neutral200, backgroundColor: colors.white },
  backDark: { backgroundColor: 'rgba(255,255,255,0.12)' },
  backFilled: { backgroundColor: '#F3F4F6' },
  title: { flex: 1, fontFamily: fontFamily.interSemiBold, fontSize: 18, lineHeight: 24, color: colors.textPrimary },
  titleDark: { color: colors.white, fontFamily: fontFamily.interMedium },
  titleCenter: { textAlign: 'center' },
  titleLeft: { marginLeft: 16 },
  right: { width: 42, alignItems: 'flex-end' },
  flex: { flex: 1 },
});
