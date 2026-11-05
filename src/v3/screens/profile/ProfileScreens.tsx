import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  BadgeCheck,
  Camera,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  ExternalLink,
  History,
  IdCard,
  IndianRupee,
  Languages,
  LogOut,
  LucideIcon,
  MessageCircle,
  Ellipsis,
  Pencil,
  Phone,
  SendHorizontal,
  Settings,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { c, t, HELPLINE_TEL } from '../../theme';
import { d3, img } from '../../assets';
import { CenterBar } from '../../components/Layout';
import { Chips } from '../../components/Chips';
import { Bar, Pill } from '../../components/GameArt';
import { RANKS, nextRank, rankFor } from '../../data/ranks';
import { inviteCode } from '../../api/invite';
import { formatMobile } from '../../api/auth';
import { WA_TEMPLATES, waTemplate } from '../../data/waTemplates';
import { fmt, useV3 } from '../../state/Store';
import { V3ScreenProps, useV3Nav } from '../../navigation/types';

const LANGS = [
  { key: 'hi', label: 'हिंदी' },
  { key: 'en', label: 'English' },
  { key: 'pa', label: 'ਪੰਜਾਬੀ' },
] as const;

function Row({ icon: Icon, title, sub, onPress, last }: { icon: LucideIcon; title: string; sub?: string; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable style={[styles.row, !last && styles.rowDiv]} onPress={onPress}>
      <View style={styles.rowIc}>
        <Icon size={18} color={c.primary700} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.body15Medium, { color: c.textPrimary }]}>{title}</Text>
        {sub ? <Text style={[t.cap12, { color: c.textSecondary }]}>{sub}</Text> : null}
      </View>
      <ChevronRight size={18} color={c.textSecondary} strokeWidth={2} />
    </Pressable>
  );
}

// C4-01 Profile (17:14805) — the Profile tab.
export function ProfileScreen() {
  const nav = useV3Nav();
  const insets = useSafeAreaInsets();
  const { user, setUser, account, patchAccount } = useV3();
  const name = user?.name ?? 'Ram Kumar';
  const mobile = user?.mobile ?? '9876543210';
  const lp = account.lifetimePoints;
  const rank = rankFor(lp);
  const next = nextRank(rank);
  const from = RANKS[rank].min;
  const to = next ? RANKS[next].min : from;
  const lang = account.language ?? 'hi';
  const wa = account.whatsappUpdates ?? true;
  const code = inviteCode(user?.name);

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top }]}>
          <LinearGradient colors={[c.navy900, '#0f2a4e', '#163a66']} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroBar}>
            <Text style={[t.title20, { color: '#fff', flex: 1 }]}>Profile</Text>
            <Pressable style={styles.glass} onPress={() => nav.navigate('Notifications')} accessibilityLabel="Notifications">
              <Bell size={20} color="#fff" strokeWidth={2} />
              <View style={styles.bellDot} />
            </Pressable>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <View style={styles.avatar}>
              <Image source={img.workerApplicator} style={{ width: 84, height: 99, marginTop: 14 }} resizeMode="contain" />
            </View>
            <View style={styles.camBadge}>
              <Camera size={14} color="#fff" strokeWidth={2} />
            </View>
            <Text style={[t.title20, { color: '#fff', marginTop: 6 }]}>{name}</Text>
            <Text style={[t.cap12, { color: 'rgba(255,255,255,0.8)' }]}>+91 {formatMobile(mobile)} · Amritsar</Text>
          </View>
          <Pressable style={styles.rankCard} onPress={() => nav.navigate('RankBenefits')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={d3.crown} style={{ width: 20, height: 20 }} />
              <Text style={[t.body15Semibold, { color: '#fff', flex: 1 }]}>{RANKS[rank].name}</Text>
              <Text style={[t.cap12Medium, { color: c.primary500 }]}>
                {next ? `${fmt(to - lp)} pts to ${RANKS[next].name} ›` : 'Top rank ›'}
              </Text>
            </View>
            <Bar value={next ? (lp - from) / (to - from) : 1} color={c.primary500} track="rgba(255,255,255,0.15)" height={6} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 18, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={styles.kyc} onPress={() => nav.navigate(account.pan ? 'PanUpiOverview' : 'AddPan')}>
              <View style={styles.kycHead}>
                <IdCard size={16} color={c.textPrimary} strokeWidth={1.75} />
                <Text style={[t.body15Semibold, { color: c.textPrimary }]}>PAN</Text>
              </View>
              {account.pan ? (
                <Pill icon={CircleCheck} label="Verified" bg={c.success50} ink={c.successText} />
              ) : (
                <Pill icon={CircleAlert} label="Add PAN" bg={c.warning50} ink={c.warningText} />
              )}
            </Pressable>
            <Pressable style={styles.kyc} onPress={() => nav.navigate(account.upi ? 'PanUpiOverview' : 'AddUpi')}>
              <View style={styles.kycHead}>
                <IndianRupee size={16} color={c.textPrimary} strokeWidth={1.75} />
                <Text style={[t.body15Semibold, { color: c.textPrimary }]}>UPI</Text>
              </View>
              {account.upi ? (
                <Pill icon={CircleCheck} label={`${account.upi.id} · Verified`} bg={c.success50} ink={c.successText} />
              ) : (
                <Pill icon={CircleAlert} label="Add UPI" bg={c.warning50} ink={c.warningText} />
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.kycHead}>
              <Languages size={16} color={c.textPrimary} strokeWidth={1.75} />
              <Text style={[t.body15Semibold, { color: c.textPrimary }]}>App language</Text>
            </View>
            <View style={styles.switch}>
              {LANGS.map((l) => (
                <Pressable key={l.key} style={[styles.seg, lang === l.key && styles.segOn]} onPress={() => patchAccount({ language: l.key })}>
                  <Text style={[lang === l.key ? t.sec13Semibold : t.sec13Medium, { color: lang === l.key ? c.textPrimary : c.textSecondary }]}>{l.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.group}>
            <Row icon={Users} title="Joined with your code" sub="12 people · 4,250 runs" onPress={() => nav.navigate('InviteEarn')} />
            <Row icon={UserPlus} title="Invite & earn" sub={`Code ${code}`} onPress={() => nav.navigate('InviteEarn')} />
            <Row icon={History} title="My scans" sub="All coupons you scanned" onPress={() => nav.navigate('MyScans')} />
            <Row icon={Pencil} title="Edit details" sub="Name, city, birthday" onPress={() => nav.navigate('PanUpiOverview')} last />
          </View>

          <View style={styles.group}>
            <Pressable style={[styles.row, styles.rowDiv]} onPress={() => nav.navigate('WhatsAppMessages')}>
              <View style={styles.rowIc}>
                <MessageCircle size={18} color={c.primary700} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[t.body15Medium, { color: c.textPrimary }]}>WhatsApp updates</Text>
                <Text style={[t.cap12, { color: c.textSecondary }]}>
                  {wa ? 'On' : 'Off'} · +91 {formatMobile(mobile)}
                </Text>
              </View>
              <ChevronRight size={18} color={c.textSecondary} strokeWidth={2} />
            </Pressable>
            <Row icon={CircleHelp} title="Help" sub="Call GoMax helpline" onPress={() => Linking.openURL(`tel:${HELPLINE_TEL}`).catch(() => undefined)} />
            <Row
              icon={LogOut}
              title="Log out"
              onPress={() => {
                setUser(null);
                nav.reset({ index: 0, routes: [{ name: 'Login' }] });
              }}
              last
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── C4-02 Notifications (17:14933) ───────────────────────────────────────

type NoteKind = 'money' | 'gifts' | 'games' | 'invite';
type Note = { id: string; kind: NoteKind; art: number; title: string; sub: string; time: string; day: 'Today' | 'Earlier'; unread?: boolean; open: () => void };

const FILTERS: { key: NoteKind | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'money', label: 'Money' },
  { key: 'gifts', label: 'Gifts' },
  { key: 'games', label: 'Games' },
  { key: 'invite', label: 'Invite' },
];

export function NotificationsScreen({ navigation }: V3ScreenProps<'Notifications'>) {
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<NoteKind | 'all'>('all');
  const [read, setRead] = useState<Record<string, boolean>>({});
  const notes: Note[] = [
    { id: 'n1', kind: 'money', art: d3.creditCard, title: '₹500 sent to your UPI', sub: 'UTR 4290 1188 7765 · ram@ybl', time: '10:42 am', day: 'Today', unread: true, open: () => navigation.navigate('WithdrawPaid', { id: 'W-3001' }) },
    { id: 'n2', kind: 'games', art: d3.ticket, title: 'You got a scratch card', sub: '10 coupons scanned today', time: '9:15 am', day: 'Today', unread: true, open: () => navigation.navigate('ScratchCards') },
    { id: 'n3', kind: 'money', art: d3.coin, title: '7 coupons added · +140 pts', sub: 'Daily summary', time: 'Yesterday 9 pm', day: 'Today', open: () => navigation.navigate('MyScans') },
    { id: 'n4', kind: 'gifts', art: d3.deliveryTruck, title: 'Your gift is on the way', sub: 'Pressure cooker · AWB 1Z98 2211 · Delhivery', time: '28 Sep', day: 'Earlier', open: () => navigation.navigate('MyGiftDetail', { orderId: 'G-1042' }) },
    { id: 'n5', kind: 'games', art: d3.crown, title: 'You are now Kaarigar!', sub: '4 spins a day + 10% more runs', time: '25 Sep', day: 'Earlier', open: () => navigation.navigate('RankBenefits') },
    { id: 'n6', kind: 'games', art: d3.trophy, title: 'Challenge won · +100 runs', sub: 'Scan 20 coupons this week', time: '22 Sep', day: 'Earlier', open: () => navigation.navigate('ChallengeCompleted', { challengeId: 'd1' }) },
    { id: 'n7', kind: 'money', art: d3.warning, title: 'Add your UPI to get cash', sub: 'Takes 1 minute', time: '20 Sep', day: 'Earlier', open: () => navigation.navigate('AddUpi') },
  ];
  const rows = notes.filter((n) => kind === 'all' || n.kind === kind);

  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 40 }}>
        <CenterBar
          title="Notifications"
          right={
            <Pressable onPress={() => navigation.navigate('WhatsAppMessages')} hitSlop={8} accessibilityLabel="Notification settings">
              <Settings size={20} color={c.textPrimary} strokeWidth={1.75} />
            </Pressable>
          }
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 8 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <View style={{ flexWrap: 'nowrap' }}>
            <Chips options={FILTERS} value={kind} onChange={setKind} />
          </View>
        </ScrollView>
        {(['Today', 'Earlier'] as const).map((d) => {
          const list = rows.filter((n) => n.day === d);
          if (!list.length) return null;
          return (
            <View key={d} style={{ gap: 10, marginTop: 16 }}>
              <Text style={[t.sec13Semibold, { color: c.textSecondary }]}>{d}</Text>
              {list.map((n) => (
                <Pressable
                  key={n.id}
                  style={styles.note}
                  onPress={() => {
                    setRead((r) => ({ ...r, [n.id]: true }));
                    n.open();
                  }}
                >
                  <View style={styles.noteIc}>
                    <Image source={n.art} style={{ width: 28, height: 28 }} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[t.body15Semibold, { color: c.textPrimary }]}>{n.title}</Text>
                    <Text style={[t.cap12, { color: c.textSecondary }]}>{n.sub}</Text>
                    <Text style={[t.cap12, { color: c.textMuted }]}>{n.time}</Text>
                  </View>
                  {n.unread && !read[n.id] ? <View style={styles.unread} /> : null}
                </Pressable>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── WhatsApp updates: opt-in + every template (C4-03 … C4-14) ───────────

export function WhatsAppMessagesScreen({ navigation }: V3ScreenProps<'WhatsAppMessages'>) {
  const insets = useSafeAreaInsets();
  const { user, account, patchAccount } = useV3();
  const on = account.whatsappUpdates ?? true;
  return (
    <View style={{ flex: 1, backgroundColor: c.surfaceCard }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 40 }}>
        <CenterBar title="WhatsApp updates" />
        <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', marginTop: 8 }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[t.body15Semibold, { color: c.textPrimary }]}>Send me updates on WhatsApp</Text>
            <Text style={[t.cap12, { color: c.textSecondary }]}>+91 {formatMobile(user?.mobile ?? '9876543210')}</Text>
          </View>
          <Switch
            value={on}
            onValueChange={(v) => patchAccount({ whatsappUpdates: v })}
            trackColor={{ true: c.whatsapp, false: c.borderStrong }}
            thumbColor="#fff"
          />
        </View>
        <Text style={[t.sec13Semibold, { color: c.textSecondary, marginTop: 20, marginBottom: 10 }]}>Messages you get</Text>
        <View style={styles.group}>
          {WA_TEMPLATES.map((m, i) => (
            <Pressable key={m.id} style={[styles.row, i < WA_TEMPLATES.length - 1 && styles.rowDiv]} onPress={() => navigation.navigate('WhatsAppMessage', { templateId: m.id })}>
              <View style={[styles.rowIc, { backgroundColor: m.bubbles[0].tint }]}>
                {m.bubbles[0].art ? <Image source={m.bubbles[0].art} style={{ width: 22, height: 22 }} /> : null}
              </View>
              <Text style={[t.body15Medium, { color: c.textPrimary, flex: 1 }]}>{m.label}</Text>
              <ChevronRight size={18} color={c.textSecondary} strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const WA = { green: '#008069', wall: '#efeae2', ink: '#111b21', time: '#667781', link: '#027eb5', div: '#e9edef', send: '#00a884', chip: '#54656f' };

// C4-03 … C4-14 WhatsApp message (17:15008 – 17:15447)
export function WhatsAppMessageScreen({ navigation, route }: V3ScreenProps<'WhatsAppMessage'>) {
  const insets = useSafeAreaInsets();
  const { user } = useV3();
  const tpl = waTemplate(route.params.templateId);
  const fill = (s: string) =>
    s
      .replace('{name}', (user?.name ?? 'Ram').split(' ')[0])
      .replace('{mobile}', formatMobile(user?.mobile ?? '9876543210'))
      .replace('{code}', inviteCode(user?.name));

  return (
    <View style={{ flex: 1, backgroundColor: WA.wall }}>
      <StatusBar style="light" />
      <View style={{ backgroundColor: WA.green, paddingTop: insets.top }}>
        <View style={styles.waHeader}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Back">
            <ArrowLeft size={22} color="#fff" strokeWidth={2} />
          </Pressable>
          <Pressable style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }} onPress={() => navigation.setParams({ templateId: tpl.next })}>
            <View style={styles.waAv}>
              <Image source={img.markOrange} style={{ width: 26, height: 21.5 }} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[t.body15Semibold, { color: '#fff' }]}>GoMax</Text>
                <BadgeCheck size={16} color="#25d366" strokeWidth={2} />
              </View>
              <Text style={[t.cap12, { color: '#fff' }]}>Business account</Text>
            </View>
          </Pressable>
          <Phone size={20} color="#fff" strokeWidth={2} />
          <Ellipsis size={20} color="#fff" strokeWidth={2} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
        <View style={styles.dateChip}>
          <Text style={[t.cap12Medium, { color: WA.chip }]}>{tpl.date}</Text>
        </View>
        {tpl.bubbles.map((b, i) => {
          const CtaIcon = b.cta.external ? ExternalLink : MessageCircle;
          return (
            <View key={i} style={styles.bubble}>
              {b.art ? (
                <View style={[styles.media, { backgroundColor: b.tint }]}>
                  <Image source={b.art} style={{ width: 72, height: 72 }} />
                </View>
              ) : null}
              <View style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 2, gap: 4 }}>
                <Text style={[t.body15Semibold, { color: WA.ink }]}>{fill(b.title)}</Text>
                <Text style={[t.sec13, { color: WA.ink, lineHeight: 19 }]}>{b.lines.map(fill).join('\n')}</Text>
              </View>
              <Text style={[t.cap12, { color: WA.time, alignSelf: 'flex-end', paddingHorizontal: 8 }]}>{b.time}</Text>
              <View style={{ height: 1, backgroundColor: WA.div, marginTop: 2 }} />
              <Pressable
                style={styles.waBtn}
                onPress={() => (navigation.navigate as (...a: unknown[]) => void)(...(b.cta.to as unknown[]))}
              >
                <CtaIcon size={16} color={WA.link} strokeWidth={2} />
                <Text style={[t.sec13Semibold, { color: WA.link }]}>{b.cta.label}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
      <View style={[styles.waInput, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.waField}>
          <Sparkles size={18} color="#8696a0" strokeWidth={1.75} />
          <Text style={[t.body15, { color: '#8696a0' }]}>Message</Text>
        </View>
        <View style={styles.waSend}>
          <SendHorizontal size={18} color="#fff" strokeWidth={2} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 18, overflow: 'hidden' },
  heroBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  glass: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary500, borderWidth: 1.5, borderColor: c.navy900 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: c.primary500,
    backgroundColor: c.primary100,
    overflow: 'hidden',
    alignItems: 'center',
  },
  camBadge: {
    position: 'absolute',
    top: 68,
    left: '50%',
    marginLeft: 22,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.primary700,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCard: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 14,
    gap: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  kyc: { flex: 1, padding: 12, gap: 10, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  kycHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: { padding: 14, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  switch: { flexDirection: 'row', backgroundColor: c.surfaceMuted, borderRadius: 12, padding: 4 },
  seg: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: c.surfaceCard },
  group: { borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowDiv: { borderBottomWidth: 1, borderBottomColor: c.border },
  rowIc: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary100, alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: c.border },
  noteIc: { width: 44, height: 44, borderRadius: 12, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  unread: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary700, marginTop: 6 },
  waHeader: { height: 60, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  waAv: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dateChip: { alignSelf: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  bubble: { width: 290, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 4, paddingTop: 4, paddingBottom: 0 },
  media: { height: 110, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  waBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  waInput: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingTop: 8 },
  waField: { flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#fff' },
  waSend: { width: 44, height: 44, borderRadius: 22, backgroundColor: WA.send, alignItems: 'center', justifyContent: 'center' },
});
