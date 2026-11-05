import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleCheck, CircleX, Copy, LucideIcon, WifiOff } from 'lucide-react-native';
import { c, t } from '../theme';

// Figma "Toast" (17:8193): navy-900 card, r14, 16/12 padding, 20px icon,
// Secondary/Medium 13 white text, drop shadow 0 8 12 rgba(0,0,0,.2).
export type ToastType = 'success' | 'error' | 'offline' | 'info';

const ICON: Record<ToastType, { Icon: LucideIcon; color: string }> = {
  success: { Icon: CircleCheck, color: c.success },
  error: { Icon: CircleX, color: '#f87171' },
  offline: { Icon: WifiOff, color: '#fbbf24' },
  info: { Icon: Copy, color: '#ffffff' },
};

type Show = (text: string, type?: ToastType) => void;
const Ctx = createContext<Show>(() => undefined);

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ id: number; text: string; type: ToastType } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<Show>((text, type = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), text, type });
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const meta = toast ? ICON[toast.type] : null;
  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && meta ? (
        <View pointerEvents="none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 24) + 84 }]}>
          <Animated.View key={toast.id} entering={FadeInDown.duration(180)} exiting={FadeOutDown.duration(160)} style={styles.toast} accessibilityLiveRegion="polite">
            <meta.Icon size={20} color={meta.color} strokeWidth={2} />
            <Text style={[t.sec13Medium, { color: '#fff', flex: 1 }]}>{toast.text}</Text>
          </Animated.View>
        </View>
      ) : null}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: c.navy900,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});
