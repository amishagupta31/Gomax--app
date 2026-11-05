import React, { useCallback, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  CircleCheck,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from 'lucide-react-native';
import { c, t, HELPLINE_TEL } from '../../theme';
import { d3 } from '../../assets';
import { Page, CenterBar, LinkText } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { FormField } from '../../components/FormField';
import { Chips } from '../../components/Chips';
import { Timeline, TimelineStep } from '../../components/Timeline';
import { StaticTabBar } from '../../components/TabBar';
import { formatMobile } from '../../api/auth';
import { GiftOrder, ORDER_STEPS, bookGift, giftById, listOrders, orderById, Gift } from '../../api/wallet';
import { fmt, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

function GiftArt({ gift, size }: { gift: Gift; size: number }) {
  return gift.photo ? (
    <Image source={gift.photo} style={{ width: size, height: size, borderRadius: 12 }} resizeMode="cover" />
  ) : (
    <Image source={gift.art} style={{ width: size * 0.66, height: size * 0.66 }} />
  );
}

function GiftThumb({ gift, size = 48 }: { gift: Gift; size?: number }) {
  return (
    <View style={[styles.thumb, { width: size, height: size }]}>
      {gift.photo ? (
        <Image source={gift.photo} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Image source={gift.art} style={{ width: size * 0.66, height: size * 0.66 }} />
      )}
    </View>
  );
}

// B2-05a enough runs · B2-05b not enough runs (17:18218 / 18263)
export function GiftDetailScreen({ navigation, route }: V3ScreenProps<'GiftDetail'>) {
  const insets = useSafeAreaInsets();
  const { account } = useV3();
  const gift = giftById(route.params.giftId);
  const enough = account.runs >= gift.runs;
  const short = gift.runs - account.runs;

  return (
    <Page
      edges={[]}
      footerBordered
      contentStyle={{ paddingHorizontal: 0 }}
      footer={
        enough ? (
          <Button label="Get this gift" onPress={() => navigation.navigate('GiftAddress', { giftId: gift.id })} />
        ) : (
          <Button label={`Need ${fmt(short)} more runs`} disabled />
        )
      }
    >
      <View style={styles.photo}>
        {gift.photo ? (
          <Image source={gift.photo} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: c.primary50 }]}>
            <Image source={gift.art} style={{ width: 160, height: 160 }} />
          </View>
        )}
        <View style={[styles.photoTop, { top: insets.top + 8 }]}>
          <Pressable style={styles.whiteBack} onPress={() => navigation.goBack()} accessibilityLabel="Back">
            <ArrowLeft size={20} color={c.textPrimary} strokeWidth={2} />
          </Pressable>
          <View style={styles.balance}>
            <Image source={d3.wrappedGift} style={{ width: 20, height: 20 }} />
            <Text style={[t.body15Semibold, { color: c.runs, fontFamily: 'Inter_700Bold' }]}>{fmt(account.runs)}</Text>
          </View>
        </View>
        <View style={styles.dots}>
          <View style={[styles.dot, { width: 16 }]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{gift.name}</Text>
          <View style={styles.runsPill}>
            <Image source={d3.wrappedGift} style={{ width: 16, height: 16 }} />
            <Text style={[t.body15Semibold, { color: c.runs }]}>{fmt(gift.runs)} runs</Text>
          </View>
        </View>

        {enough ? (
          <View style={[styles.box, { backgroundColor: c.success50 }]}>
            <Row label="You have" value={`${fmt(account.runs)} runs`} />
            <Row label="After this gift" value={`${fmt(account.runs - gift.runs)} runs`} />
          </View>
        ) : (
          <View style={[styles.box, { backgroundColor: c.warning50 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[t.body15Semibold, { color: c.warningText, flex: 1 }]}>{fmt(short)} more runs needed</Text>
              <Text style={[t.cap12Medium, { color: c.textSecondary }]}>
                {fmt(account.runs)} / {fmt(gift.runs)}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${(account.runs / gift.runs) * 100}%` }]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <WayPill art={d3.star} label="Spin" onPress={() => navigation.navigate('SpinWheel')} />
              <WayPill art={d3.trophy} label="Challenge" onPress={() => navigation.navigate('ChallengesHome')} />
              <WayPill art={d3.handshake} label="Invite" onPress={() => navigation.navigate('InviteEarn')} />
            </View>
          </View>
        )}

        <View style={styles.list}>
          <InfoRow icon={Package} title="What's inside" sub="CLIENT to share item list" />
          <View style={styles.div} />
          <InfoRow icon={Truck} title="Free delivery" sub="Reaches in 7–10 days" />
        </View>
      </View>
    </Page>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}>
      <Text style={[t.sec13, { color: c.textSecondary, flex: 1 }]}>{label}</Text>
      <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>{value}</Text>
    </View>
  );
}

function WayPill({ art, label, onPress }: { art: number; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.way}>
      <Image source={art} style={{ width: 14, height: 14 }} />
      <Text style={[t.cap12Medium, { color: c.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function InfoRow({ icon: Icon, title, sub }: { icon: typeof Package; title: string; sub: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon size={20} color={c.primary700} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.body15Medium, { color: c.textPrimary }]}>{title}</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>{sub}</Text>
      </View>
    </View>
  );
}

// B2-06 Gift · confirm address (17:18316)
export function GiftAddressScreen({ navigation, route }: V3ScreenProps<'GiftAddress'>) {
  const { user, account, patchAccount } = useV3();
  const gift = giftById(route.params.giftId);
  const [name, setName] = useState(user?.name ?? 'Ram Kumar');
  const [mobile, setMobile] = useState(formatMobile(user?.mobile ?? '9876543210'));
  const [street, setStreet] = useState('H.No 214, Gali 3, Gandhi Nagar');
  const [city, setCity] = useState('Amritsar');
  const [pin, setPin] = useState('143001');
  const [busy, setBusy] = useState(false);
  const valid = name.trim() && mobile.replace(/\D/g, '').length === 10 && street.trim() && city.trim() && /^\d{6}$/.test(pin);

  const book = async () => {
    setBusy(true);
    const order = await bookGift(gift.id, { name, mobile, street, city, pin });
    patchAccount({ runs: account.runs - gift.runs }); // runs locked on booking
    setBusy(false);
    navigation.replace('GiftBooked', { giftId: gift.id, orderId: order.id });
  };

  return (
    <Page footerBordered footer={<Button label={`Book gift · ${fmt(gift.runs)} runs`} disabled={!valid} loading={busy} onPress={book} />}>
      <CenterBar title="Where to send?" />
      <View style={{ gap: 14, paddingTop: 8 }}>
        <View style={styles.summary}>
          <View style={[styles.thumb, { backgroundColor: c.runs50 }]}>
            {gift.photo ? <Image source={gift.photo} style={{ width: 48, height: 48 }} /> : <Image source={gift.art} style={{ width: 32, height: 32 }} />}
          </View>
          <View style={{ gap: 2 }}>
            <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{gift.name}</Text>
            <Text style={[t.cap12Medium, { color: c.runs }]}>{fmt(gift.runs)} runs</Text>
          </View>
        </View>
        <FormField label="Name" icon={User} value={name} onChangeText={setName} autoCapitalize="words" />
        <FormField label="Mobile" icon={Phone} value={mobile} onChangeText={(v) => setMobile(formatMobile(v))} keyboardType="number-pad" maxLength={11} />
        <FormField label="House / street" icon={MapPin} value={street} onChangeText={setStreet} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FormField label="City" value={city} onChangeText={setCity} />
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="PIN code" value={pin} onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" />
          </View>
        </View>
        <Text style={[t.cap12, { color: c.textSecondary }]}>We fill this from your profile. Change if needed.</Text>
      </View>
    </Page>
  );
}

// B2-07 Gift booked (17:18364)
export function GiftBookedScreen({ navigation, route }: V3ScreenProps<'GiftBooked'>) {
  const gift = giftById(route.params.giftId);
  return (
    <Page
      footer={
        <>
          <Button label="Track my gift" onPress={() => navigation.replace('MyGifts')} />
          <LinkText onPress={() => navigation.navigate('Tabs', { screen: 'Wallet', params: { tab: 'runs' } })}>Back to Gifts</LinkText>
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 8 }}>
        <View style={{ width: 300, height: 300 }}>
          <Svg width={300} height={300} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="bg" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#e07a62" stopOpacity={1} />
                <Stop offset="0.25" stopColor="#e89b89" stopOpacity={0.75} />
                <Stop offset="0.5" stopColor="#f0bdb1" stopOpacity={0.5} />
                <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={300} height={300} rx={150} fill="url(#bg)" opacity={0.25} />
          </Svg>
          <View style={styles.giftCircle}>
            <Animated.View entering={ZoomIn.springify().damping(10)}>
              <GiftArt gift={gift} size={gift.photo ? 150 : 165} />
            </Animated.View>
          </View>
          <Animated.Image entering={ZoomIn.delay(250)} source={d3.partyPopper} style={{ position: 'absolute', left: 220, top: 20, width: 72, height: 72 }} />
          <Animated.Image entering={ZoomIn.delay(350)} source={d3.sparkles} style={{ position: 'absolute', left: 20, top: 40, width: 48, height: 48 }} />
        </View>
        <Text style={styles.booked}>Gift booked!</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>
          We will pack and send it in 2–3 days. You will get updates on WhatsApp.
        </Text>
        <View style={[styles.summary, { alignSelf: 'stretch', padding: 14 }]}>
          <View style={[styles.thumb, { backgroundColor: c.runs50 }]}>
            {gift.photo ? <Image source={gift.photo} style={{ width: 48, height: 48 }} /> : <Image source={gift.art} style={{ width: 32, height: 32 }} />}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{gift.name}</Text>
            <Text style={[t.cap12, { color: c.textSecondary }]}>Order {route.params.orderId}</Text>
          </View>
          <Text style={[t.body15Semibold, { color: c.runs }]}>−{fmt(gift.runs)} runs</Text>
        </View>
      </View>
    </Page>
  );
}

const STEP_LABEL = { booked: 'Booked', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered' } as const;

function orderSteps(o: GiftOrder, withCourier: boolean): TimelineStep[] {
  const idx = ORDER_STEPS.indexOf(o.step);
  return ORDER_STEPS.map((s, i) => {
    const state: TimelineStep['state'] = i < idx || o.step === 'delivered' ? 'done' : i === idx ? 'current' : 'todo';
    let sub = o.dates[s] ?? '';
    if (s === 'shipped' && o.dates.shipped) sub = o.step === 'delivered' && o.courier ? `${o.dates.shipped} · ${o.courier.name} ${o.courier.awb}` : `${o.dates.shipped}${o.eta ? ` · reaches by ${o.eta}` : ''}`;
    if (s === 'delivered') sub = o.step === 'delivered' ? `${o.dates.delivered} · received by ${o.receivedBy ?? 'you'}` : 'We will share a photo';
    if (state === 'current' && i === 0) sub = sub || 'Today';
    return {
      title: STEP_LABEL[s],
      sub,
      state,
      icon: s === 'shipped' ? Truck : s === 'packed' ? Package : undefined,
      extra: withCourier && s === 'shipped' && state === 'current' && o.courier ? <Awb o={o} /> : undefined,
    };
  });
}

function Awb({ o }: { o: GiftOrder }) {
  const toast = useToast();
  return (
    <View style={styles.awb}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[t.sec13Semibold, { color: c.textPrimary, flex: 1 }]}>
          {o.courier!.name} · AWB {o.courier!.awb}
        </Text>
        <Pressable onPress={() => Clipboard.setStringAsync(o.courier!.awb).then(() => toast('AWB copied', 'info'))} hitSlop={8} accessibilityLabel="Copy AWB">
          <Copy size={16} color={c.textSecondary} strokeWidth={1.75} />
        </Pressable>
      </View>
      <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => Linking.openURL(o.courier!.url)}>
        <Text style={[t.cap12Medium, { color: c.primary700 }]}>Track on courier site</Text>
        <ExternalLink size={12} color={c.primary700} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

// B2-08 My gifts · tracking (17:18387)
export function MyGiftsScreen({ navigation }: V3ScreenProps<'MyGifts'>) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<GiftOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'way' | 'delivered'>('all');
  useFocusEffect(
    useCallback(() => {
      listOrders().then(setOrders);
    }, []),
  );
  const shown = orders.filter((o) => (filter === 'all' ? true : filter === 'delivered' ? o.step === 'delivered' : o.step !== 'delivered'));

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 120 }}>
        <CenterBar title="My gifts" />
        <View style={{ gap: 14, paddingTop: 8 }}>
          <Chips
            options={[
              { key: 'all', label: 'All' },
              { key: 'way', label: 'On the way' },
              { key: 'delivered', label: 'Delivered' },
            ]}
            value={filter}
            onChange={setFilter}
          />
          {shown.length === 0 ? (
            <Text style={[t.sec13, { color: c.textSecondary, textAlign: 'center', paddingVertical: 32 }]}>No gifts here yet.</Text>
          ) : null}
          {shown.map((o) => {
            const g = giftById(o.giftId);
            if (o.step === 'delivered') {
              return (
                <Pressable key={o.id} style={[styles.order, { gap: 12 }]} onPress={() => navigation.navigate('MyGiftDetail', { orderId: o.id })}>
                  <View style={styles.orderHead}>
                    {g.photo ? (
                      <Image source={g.photo} style={{ width: 60, height: 60, borderRadius: 12 }} />
                    ) : (
                      <GiftThumb gift={g} size={60} />
                    )}
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{g.name}</Text>
                      <Text style={[t.cap12, { color: c.textSecondary }]}>
                        {o.id} · {o.dates.delivered}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: c.success50 }]}>
                      <Text style={[t.cap12Medium, { color: c.successText }]}>Delivered</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={styles.seg} />
                    ))}
                  </View>
                  <View style={styles.proof}>
                    <ImageIcon size={16} color={c.successText} strokeWidth={2} />
                    <Text style={[t.cap12Medium, { color: c.successText, flex: 1 }]}>Delivery photo · tap to see</Text>
                    <ChevronRight size={16} color={c.successText} strokeWidth={2} />
                  </View>
                </Pressable>
              );
            }
            const statusLabel = STEP_LABEL[o.step];
            return (
              <View key={o.id} style={[styles.order, { gap: 14 }]}>
                <View style={styles.orderHead}>
                  <View style={[styles.thumb, { width: 44, height: 44, backgroundColor: c.runs50 }]}>
                    {g.photo ? <Image source={g.photo} style={{ width: 44, height: 44 }} /> : <Image source={g.art} style={{ width: 30, height: 30 }} />}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{g.name}</Text>
                    <Text style={[t.cap12, { color: c.textSecondary }]}>
                      {o.id} · {fmt(o.runs)} runs
                    </Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: c.primary100 }]}>
                    {o.step === 'shipped' ? <Truck size={14} color={c.primary700} strokeWidth={2} /> : null}
                    <Text style={[t.cap12Medium, { color: c.primary700 }]}>{statusLabel}</Text>
                  </View>
                </View>
                <Timeline steps={orderSteps(o, true)} />
              </View>
            );
          })}
        </View>
      </ScrollView>
      <StaticTabBar active="Wallet" />
    </View>
  );
}

// B2-09 My gift · delivered with photo (17:18474)
export function MyGiftDetailScreen({ navigation, route }: V3ScreenProps<'MyGiftDetail'>) {
  const insets = useSafeAreaInsets();
  const o = orderById(route.params.orderId);
  const [answered, setAnswered] = useState<null | 'yes'>(null);
  if (!o) return null;
  const g = giftById(o.giftId);
  const delivered = o.step === 'delivered';
  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 120 }}>
        <CenterBar title={g.name} />
        <View style={{ gap: 14, paddingTop: 8 }}>
          {delivered ? (
            <>
              <View style={[styles.pill, { backgroundColor: c.success50, alignSelf: 'flex-start' }]}>
                <CircleCheck size={14} color={c.successText} strokeWidth={2} />
                <Text style={[t.sec13Semibold, { color: c.successText }]}>Delivered on {o.deliveredAt}</Text>
              </View>
              <View style={styles.deliveryPhoto}>
                <Camera size={28} color="#fff" strokeWidth={1.75} />
                <Text style={[t.cap12Medium, { color: '#fff' }]}>Delivery photo (from courier / GoMax)</Text>
              </View>
            </>
          ) : (
            // Opened from a "gift on the way" notification / WhatsApp link.
            <View style={[styles.pill, { backgroundColor: c.warning50, alignSelf: 'flex-start' }]}>
              <Truck size={14} color={c.warningText} strokeWidth={2} />
              <Text style={[t.sec13Semibold, { color: c.warningText }]}>On the way{o.eta ? ` · reaches by ${o.eta}` : ''}</Text>
            </View>
          )}
          <View style={[styles.order, { padding: 16 }]}>
            <Timeline steps={orderSteps(o, false)} />
          </View>
          {delivered ? (
          <View style={[styles.order, { padding: 14, gap: 10 }]}>
            {answered ? (
              <Text style={[t.body15Semibold, { color: c.successText }]}>Thanks! Enjoy your gift 🎉</Text>
            ) : (
              <>
                <Text style={[t.body15Semibold, { color: c.textPrimary }]}>Did you get your gift?</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button label="Yes, got it" style={{ flex: 1 }} onPress={() => setAnswered('yes')} />
                  <Button label="Problem" variant="primaryOutline" style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:${HELPLINE_TEL}`)} />
                </View>
              </>
            )}
          </View>
          ) : o.courier ? (
            <Button label={`Track on ${o.courier.name}`} variant="primaryOutline" onPress={() => Linking.openURL(o.courier!.url)} />
          ) : null}
        </View>
      </ScrollView>
      <StaticTabBar active="Wallet" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  photo: { height: 330, backgroundColor: c.surfaceMuted, overflow: 'hidden' },
  photoTop: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  whiteBack: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 8, paddingRight: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: c.runs50 },
  dots: { position: 'absolute', bottom: 18, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.navy900 },
  body: { paddingHorizontal: 20, paddingTop: 23, gap: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  name: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 28, letterSpacing: -0.24, color: c.textPrimary, flex: 1 },
  runsPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.runs50 },
  box: { borderRadius: 14, padding: 14, gap: 8 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#fff', overflow: 'hidden' },
  trackFill: { height: 8, borderRadius: 4, backgroundColor: c.warning },
  way: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.surfaceMuted },
  list: { borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 4 },
  div: { height: 1, backgroundColor: c.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  infoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary100, alignItems: 'center', justifyContent: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard },
  thumb: { width: 48, height: 48, borderRadius: 12, overflow: 'hidden', backgroundColor: c.runs50, alignItems: 'center', justifyContent: 'center' },
  giftCircle: {
    position: 'absolute',
    left: 55,
    top: 55,
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 6,
    borderColor: '#fff',
    backgroundColor: c.primary50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  booked: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: c.navyBrand, textAlign: 'center' },
  order: { borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceCard, padding: 16 },
  orderHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  seg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: c.success },
  proof: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: c.success50 },
  awb: { marginTop: 6, gap: 6, padding: 10, borderRadius: 10, backgroundColor: c.surfaceMuted },
  deliveryPhoto: { height: 220, borderRadius: 12, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
