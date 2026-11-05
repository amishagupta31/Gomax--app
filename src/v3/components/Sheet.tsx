import React from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { c, t } from '../theme';

// Bottom sheet per the A2/A3 notes: drag handle + X, navy scrim 55%, tap
// outside closes, max 85% height. Mounted as a transparentModal route.
export function Sheet({
  title,
  children,
  footer,
  onClose,
  dark,
  style,
  scroll = true,
  result,
}: {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  scroll?: boolean;
  /** Result-sheet layout (B1-03…06): handle floats at 12, content from 36, 24 gaps. */
  result?: boolean;
}) {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const close = onClose ?? (() => nav.goBack());
  const Body = scroll ? ScrollView : View;

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
        <Pressable style={styles.scrim} onPress={close} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(180)}
        style={[
          styles.sheet,
          dark && { backgroundColor: c.navy900 },
          { maxHeight: height * 0.85, paddingBottom: Math.max(insets.bottom, 16) + 12 },
          result && { paddingTop: 36, gap: 24 },
          style,
        ]}
      >
        <View style={[styles.handle, result && styles.handleFloat]} />
        {title ? (
          <View style={styles.titleRow}>
            <Text style={[t.title18, { color: dark ? '#fff' : c.textPrimary, flex: 1 }]}>{title}</Text>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
              <X size={22} color={dark ? '#fff' : c.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>
        ) : null}
        <Body
          style={{ flexGrow: 0, alignSelf: 'stretch' }}
          {...(scroll ? { contentContainerStyle: [styles.body, result && { gap: 24 }], showsVerticalScrollIndicator: false } : {})}
        >
          {scroll ? children : <View style={[styles.body, result && { gap: 24 }]}>{children}</View>}
        </Body>
        {footer ? <View style={[styles.footer, result && { gap: 12 }]}>{footer}</View> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { flex: 1, backgroundColor: 'rgba(10,23,41,0.55)' },
  sheet: {
    backgroundColor: c.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 14,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.borderStrong },
  handleFloat: { position: 'absolute', top: 12, alignSelf: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  body: { gap: 14, alignSelf: 'stretch' },
  footer: { alignSelf: 'stretch', gap: 4, alignItems: 'center' },
});
