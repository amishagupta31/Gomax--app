import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, radius } from '../../theme';
import { Screen } from '../../components/Screen';
import { AppNotification, NotificationType, listMyNotifications } from '../../services/notifications';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type Filter = 'all' | NotificationType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'money', label: 'Money' },
  { key: 'gifts', label: 'Gifts' },
  { key: 'games', label: 'Games' },
  { key: 'invite', label: 'Invite' },
];

const SECTIONS: AppNotification['section'][] = ['Today', 'Earlier'];

export function NotificationsScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    listMyNotifications().then(setItems);
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((n) => n.type === filter)),
    [filter, items]
  );

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  return (
    <Screen backgroundColor={colors.white}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.settingsButton} accessibilityLabel="Notification settings">
          <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroller}
        >
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {SECTIONS.map((section) => {
          const rows = visible.filter((n) => n.section === section);
          if (rows.length === 0) return null;
          return (
            <View key={section}>
              <Text style={styles.sectionLabel}>{section}</Text>
              {rows.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => markRead(n.id)}
                  style={[styles.card, n.unread ? styles.cardUnread : styles.cardRead]}
                >
                  <View style={styles.iconTile}>
                    <Text style={styles.iconEmoji}>{n.icon}</Text>
                  </View>
                  <View style={styles.textCol}>
                    <Text style={styles.cardTitle}>{n.title}</Text>
                    <Text style={styles.cardBody}>{n.body}</Text>
                    <Text style={styles.cardTime}>{n.timeLabel}</Text>
                  </View>
                  {n.unread ? <View style={styles.unreadDot} /> : null}
                </Pressable>
              ))}
            </View>
          );
        })}

        {visible.length === 0 ? <Text style={styles.empty}>No notifications here yet</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 21,
    paddingTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: fontFamily.interBold,
    fontSize: 19,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  settingsButton: {
    width: 42,
    height: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 21,
    paddingBottom: 32,
  },
  chipScroller: {
    marginTop: 17,
    marginBottom: 14,
    marginHorizontal: -21,
  },
  chipRow: {
    paddingHorizontal: 21,
    gap: 6,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    fontFamily: fontFamily.interMedium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.white,
  },
  sectionLabel: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral500,
    marginTop: 4,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 13,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  cardRead: {
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  textCol: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 12,
  },
  cardTitle: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  cardBody: {
    fontFamily: fontFamily.interRegular,
    fontSize: 13,
    lineHeight: 17,
    color: colors.neutral500,
    marginTop: 2,
  },
  cardTime: {
    fontFamily: fontFamily.interRegular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral400,
    marginTop: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary700,
  },
  empty: {
    fontFamily: fontFamily.interRegular,
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    marginTop: 48,
  },
});
