import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Gift, House, LucideIcon, Package, QrCode, User } from 'lucide-react-native';
import { PressableScale } from '../../components/animations';
import { c, t, shadow } from '../theme';

const TABS: Record<string, { icon: LucideIcon; label: string }> = {
  Home: { icon: House, label: 'Home' },
  Products: { icon: Package, label: 'Products' },
  Scan: { icon: QrCode, label: 'Scan' },
  Wallet: { icon: Gift, label: 'Redeem' },
  Profile: { icon: User, label: 'Profile' },
};

// Figma "Bottom Nav" (9:2766): white, r20 top, 80h, centre gradient Scan
// button (52, 3px white ring, Glow/Scan button) lifted 19px above the bar.
export function V3TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 24), height: 56 + Math.max(insets.bottom, 24) }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const meta = TABS[route.name];
        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };
        if (route.name === 'Scan') {
          return (
            <View key={route.key} style={styles.tab}>
              <View style={{ width: 24, height: 24 }} />
              <Text style={[focused ? t.cap12Semibold : t.cap12Medium, { color: focused ? c.primary700 : c.navIdle }]}>Scan</Text>
              <PressableScale onPress={onPress} style={[styles.scan, shadow.scanButton]} scaleTo={0.92}>
                <LinearGradient
                  colors={[c.primary700, c.primary500]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.scanFill}
                >
                  <QrCode size={24} color="#fff" strokeWidth={2} />
                </LinearGradient>
              </PressableScale>
            </View>
          );
        }
        const Icon = meta.icon;
        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: focused }}>
            <Icon size={24} color={focused ? c.primary700 : c.navIdle} strokeWidth={1.75} />
            <Text style={[focused ? t.cap12Semibold : t.cap12Medium, { color: focused ? c.primary700 : c.navIdle }]}>
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: c.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: c.navy50,
    shadowColor: '#0a1729',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  tab: { width: 56, alignItems: 'center', gap: 4 },
  scan: {
    position: 'absolute',
    top: -31,
    width: 52,
    height: 52,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'visible',
  },
  scanFill: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});

// Same bar for stack screens that sit above the tabs but still show the
// bottom nav in Figma (My scans, History, Gift detail…).
export function StaticTabBar({ active }: { active: keyof typeof TABS }) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const go = (name: string) => nav.navigate('Tabs', { screen: name });
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 24), height: 56 + Math.max(insets.bottom, 24) }]}>
      {Object.entries(TABS).map(([name, meta]) => {
        const focused = name === active;
        if (name === 'Scan') {
          return (
            <View key={name} style={styles.tab}>
              <View style={{ width: 24, height: 24 }} />
              <Text style={[focused ? t.cap12Semibold : t.cap12Medium, { color: focused ? c.primary700 : c.navIdle }]}>Scan</Text>
              <PressableScale onPress={() => go(name)} style={[styles.scan, shadow.scanButton]} scaleTo={0.92}>
                <LinearGradient colors={[c.primary700, c.primary500]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.scanFill}>
                  <QrCode size={24} color="#fff" strokeWidth={2} />
                </LinearGradient>
              </PressableScale>
            </View>
          );
        }
        const Icon = meta.icon;
        return (
          <Pressable key={name} onPress={() => go(name)} style={styles.tab}>
            <Icon size={24} color={focused ? c.primary700 : c.navIdle} strokeWidth={1.75} />
            <Text style={[focused ? t.cap12Semibold : t.cap12Medium, { color: focused ? c.primary700 : c.navIdle }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
