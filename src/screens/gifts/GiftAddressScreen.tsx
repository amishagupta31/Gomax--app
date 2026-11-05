import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useApp } from '../../state/AppContext';
import { GiftRow } from '../../services/gifts';
import { bookGift, getGift, splitAddress } from '../../services/giftOrders';
import { RUNS_TEAL, RUNS_TINT } from './GiftDetailScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'GiftAddress'>;

const FOCUS_BORDER = '#E2765D';

function formatMobile(m: string) {
  return m.length === 10 ? `${m.slice(0, 5)} ${m.slice(5)}` : m;
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  editable?: boolean;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
};

function Field({ label, value, onChangeText, icon, editable = true, keyboardType, maxLength }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, focused && styles.inputFocused]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.neutral500} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.inputText, !editable && styles.inputReadOnly]}
          placeholderTextColor={colors.neutral400}
        />
      </View>
    </View>
  );
}

export function GiftAddressScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { fullName, mobileNumber, address, city: profileCity, refreshProfile } = useApp();
  const [gift, setGift] = useState<GiftRow | null>(null);
  const initial = splitAddress(address);
  const [street, setStreet] = useState(initial.street);
  const [city, setCity] = useState(profileCity);
  const [pin, setPin] = useState(initial.pin);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getGift(route.params.giftId).then(setGift).catch(() => {});
  }, [route.params.giftId]);

  const valid = street.trim().length > 3 && city.trim().length > 1 && /^\d{6}$/.test(pin);

  const book = async () => {
    if (!gift || !valid) {
      setError('Fill house/street, city and a 6-digit PIN code.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await bookGift(gift.id, { street, city, pin });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      await refreshProfile();
      navigation.replace('GiftBooked', {
        redemptionId: result.redemptionId,
        giftName: gift.name,
        runsSpent: gift.runs_cost,
        imageUrl: gift.image_url ?? undefined,
      });
    } catch {
      setError('Could not book this gift. Check your internet and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Where to send?" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {gift ? (
          <View style={styles.giftCard}>
            <View style={styles.giftTile}>
              {gift.image_url ? <Image source={{ uri: gift.image_url }} style={styles.giftImage} /> : <Text style={styles.giftEmoji}>🎁</Text>}
            </View>
            <View>
              <Text style={styles.giftName}>{gift.name}</Text>
              <Text style={styles.giftRuns}>{gift.runs_cost.toLocaleString('en-IN')} runs</Text>
            </View>
          </View>
        ) : null}

        <Field label="Name" value={fullName} icon="person-outline" editable={false} />
        <Field label="Mobile" value={formatMobile(mobileNumber)} icon="call-outline" editable={false} />
        <Field label="House / street" value={street} onChangeText={setStreet} icon="location-outline" />
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Field label="City" value={city} onChangeText={setCity} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="PIN code" value={pin} onChangeText={(v) => setPin(v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={6} />
          </View>
        </View>
        <Text style={styles.hint}>We fill this from your profile. Change if needed.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable style={[styles.primary, busy && { opacity: 0.7 }]} onPress={book} disabled={busy || !gift}>
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryText}>Book gift · {gift ? gift.runs_cost.toLocaleString('en-IN') : '—'} runs</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 21, paddingTop: 18, paddingBottom: 24 },
  giftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral200,
    marginBottom: 6,
  },
  giftTile: { width: 50, height: 50, borderRadius: 10, backgroundColor: RUNS_TINT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  giftImage: { width: 50, height: 50 },
  giftEmoji: { fontSize: 26 },
  giftName: { fontFamily: fontFamily.interSemiBold, fontSize: 15, color: colors.textPrimary },
  giftRuns: { fontFamily: fontFamily.interRegular, fontSize: 13, color: RUNS_TEAL, marginTop: 3 },
  field: { marginTop: 12 },
  label: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginBottom: 6 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: 15,
  },
  inputFocused: { borderColor: FOCUS_BORDER },
  inputText: { flex: 1, fontFamily: fontFamily.interRegular, fontSize: 15, color: colors.textPrimary, height: '100%' },
  inputReadOnly: { color: colors.textPrimary },
  twoCol: { flexDirection: 'row', gap: 12 },
  hint: { fontFamily: fontFamily.interRegular, fontSize: 12, color: colors.neutral500, marginTop: 12 },
  error: { fontFamily: fontFamily.interMedium, fontSize: 13, color: colors.dangerText, marginTop: 12 },
  bottomBar: { paddingHorizontal: 21, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.neutral200, backgroundColor: colors.white },
  primary: { height: 50, borderRadius: 12, backgroundColor: colors.primary700, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fontFamily.interSemiBold, fontSize: 16, color: colors.white },
});
