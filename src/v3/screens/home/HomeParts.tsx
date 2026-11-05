import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  Banknote,
  Bell,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Clock,
  Gift,
  History,
  IdCard,
  IndianRupee,
  Lock,
  LucideIcon,
  RotateCw,
  ScanLine,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3, img } from '../../assets';
import { RANKS, RANK_ORDER, RankId, nextRank, rankFor } from '../../data/ranks';
import { Account, WITHDRAW_MIN, fmt, initials } from '../../state/Store';
import { MiniWheel, SpinWheel } from '../../components/SpinWheel';
import { PressableScale } from '../../../components/animations';

// ---------- header (avatar · greeting · bell) ----------

export function HomeHeader({
  name,
  onAvatar,
  onBell,
  unread,
  onAvatarLongPress,
}: {
  name: string;
  onAvatar: () => void;
  onBell: () => void;
  unread?: boolean;
  onAvatarLongPress?: () => void;
}) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <View style={styles.header}>
      <Pressable onPress={onAvatar} onLongPress={onAvatarLongPress} style={styles.avatar}>
        <Text style={[t.sec13Semibold, { color: c.primary700 }]}>{initials(name)}</Text>
      </Pressable>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.title18, { color: c.textInverse }]} numberOfLines={1}>
          Namaste, {name.split(' ')[0]} 👋
        </Text>
        <Text style={[t.cap12, { color: '#c9d3e3' }]}>{today}</Text>
      </View>
      <Pressable onPress={onBell} style={styles.bell} accessibilityLabel="Notifications">
        <Bell size={22} color="#fff" strokeWidth={1.75} />
        {unread ? <View style={styles.bellDot} /> : null}
      </Pressable>
    </View>
  );
}

// ---------- rank path ----------

// Track x-positions of each rank dot centre within the 320-wide path.
const KNOTS: Record<RankId, number> = { 'naya-saathi': 8, kaarigar: 100, ustaad: 196, legend: 312 };

function progressX(points: number) {
  for (let i = 0; i < RANK_ORDER.length - 1; i++) {
    const a = RANKS[RANK_ORDER[i]];
    const b = RANKS[RANK_ORDER[i + 1]];
    if (points < b.min) {
      const f = (points - a.min) / (b.min - a.min);
      return KNOTS[a.id] + f * (KNOTS[b.id] - KNOTS[a.id]);
    }
  }
  return KNOTS.legend;
}

export function RankPath({ lifetimePoints, onPress }: { lifetimePoints: number; onPress: () => void }) {
  const current = rankFor(lifetimePoints);
  const next = nextRank(current);
  const x = progressX(lifetimePoints);
  const labelX: Record<RankId, number> = { 'naya-saathi': 0, kaarigar: 75.5, ustaad: 175.5, legend: 233 };
  const reached = (id: RankId) => lifetimePoints >= RANKS[id].min;

  return (
    <Pressable onPress={onPress} style={{ gap: 10 }}>
      <View style={styles.path}>
        <View style={[styles.track, { width: 304 }]} />
        <View style={[styles.track, { width: Math.max(1, x - 8), backgroundColor: c.primary500 }]} />
        {(['naya-saathi', 'kaarigar', 'ustaad'] as RankId[]).map((id) => (
          <View
            key={id}
            style={[styles.rankDot, { left: KNOTS[id] - 6, backgroundColor: reached(id) ? c.primary500 : '#3a4e6e' }]}
          />
        ))}
        <Image source={d3.gemStone} style={styles.gem} />
        {RANK_ORDER.map((id) => (
          <Text
            key={id}
            style={[t.cap12Medium, styles.rankLabel, { left: labelX[id], color: id === current ? '#fff' : '#9fb0c8' }]}
          >
            {RANKS[id].name}
          </Text>
        ))}
        <View style={[styles.marker, { left: x - 9 }]} />
        <View style={[styles.herePill, { left: Math.min(Math.max(0, x - 46), 320 - 92) }]}>
          <Text style={[t.cap12Medium, { color: '#fff' }]}>You are here</Text>
        </View>
      </View>
      <View style={styles.nextRow}>
        <Text style={[t.sec13Medium, { color: '#fff', flex: 1 }]}>
          {next
            ? `${fmt(RANKS[next].min - lifetimePoints)} more points to become ${RANKS[next].name}`
            : `You are a ${RANKS[current].name}`}
        </Text>
        <View style={styles.link}>
          <Text style={[t.sec13Semibold, { color: c.primary500 }]}>Benefits</Text>
          <ChevronRight size={16} color={c.primary500} strokeWidth={2} />
        </View>
      </View>
    </Pressable>
  );
}

// ---------- points & runs card with 4 quick actions ----------

export function PointsRunsCard({
  account,
  onPoints,
  onRuns,
  onMyScans,
  onWithdraw,
  onGifts,
  onHistory,
}: {
  account: Account;
  onPoints: () => void;
  onRuns: () => void;
  onMyScans: () => void;
  onWithdraw: () => void;
  onGifts: () => void;
  onHistory: () => void;
}) {
  const ready = account.points >= WITHDRAW_MIN;
  return (
    <View style={[styles.prCard, styles.prShadow]}>
      <View style={styles.prTop}>
        <Pressable onPress={onPoints} style={[styles.prCol, ready && { backgroundColor: c.success50, borderTopLeftRadius: 20 }]}>
          <View style={styles.prLabel}>
            <Image source={d3.coin} style={{ width: 20, height: 20 }} />
            <Text style={[t.cap12Semibold, { color: c.primary700, letterSpacing: 2.16 }]}>POINTS</Text>
          </View>
          <View style={styles.prValue}>
            <Text style={styles.prNum}>{fmt(account.points)}</Text>
            <Text style={[t.sec13, { color: c.textSecondary }]}>pts</Text>
          </View>
          <View style={styles.prSub}>
            {ready ? (
              <>
                <CircleCheck size={14} color={c.successText} strokeWidth={2} />
                <Text style={[t.cap12Medium, { color: c.successText }]}>Ready to withdraw</Text>
              </>
            ) : (
              <>
                <Lock size={14} color={c.textSecondary} strokeWidth={2} />
                <Text style={[t.cap12Medium, { color: c.textSecondary }]}>
                  {fmt(WITHDRAW_MIN - account.points)} pts to withdraw
                </Text>
              </>
            )}
          </View>
        </Pressable>
        <View style={styles.vDivider} />
        <Pressable onPress={onRuns} style={styles.prCol}>
          <View style={styles.prLabel}>
            <Image source={d3.wrappedGift} style={{ width: 20, height: 20 }} />
            <Text style={[t.cap12Semibold, { color: c.runs, letterSpacing: 2.16 }]}>RUNS</Text>
          </View>
          <View style={styles.prValue}>
            <Text style={styles.prNum}>{fmt(account.runs)}</Text>
            <Text style={[t.sec13, { color: c.textSecondary }]}>runs</Text>
          </View>
          <View style={styles.prSub}>
            <Gift size={14} color={c.textSecondary} strokeWidth={2} />
            <Text style={[t.cap12Medium, { color: c.textSecondary }]}>Use runs for gifts</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.hDivider} />
      <View style={styles.qaRow}>
        <QuickAction icon={ScanLine} label="My scans" onPress={onMyScans} />
        <QuickAction
          icon={Banknote}
          label="Withdraw"
          onPress={onWithdraw}
          tone={ready ? 'success' : 'muted'}
        />
        <QuickAction icon={Gift} label="Gifts" onPress={onGifts} />
        <QuickAction icon={History} label="History" onPress={onHistory} />
      </View>
    </View>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onPress,
  tone = 'primary',
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'muted' | 'success';
}) {
  const bg = tone === 'success' ? c.success : tone === 'muted' ? c.surfaceMuted : c.primary50;
  const ink = tone === 'success' ? '#fff' : tone === 'muted' ? c.textMuted : c.primary700;
  return (
    <PressableScale onPress={onPress} style={styles.qa}>
      <View style={[styles.qaIcon, { backgroundColor: bg }]}>
        <Icon size={20} color={ink} strokeWidth={1.75} />
      </View>
      <Text style={[t.cap12Medium, { color: tone === 'muted' ? c.textMuted : c.textPrimary }]}>{label}</Text>
    </PressableScale>
  );
}

// ---------- hero cards (navy, terracotta button) ----------

function HeroShell({ height, children, onPress }: { height: number; children: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.hero, { height }]}>
      <LinearGradient
        colors={['#12305a', '#1d4a7a']}
        locations={[0.146, 0.854]}
        start={{ x: 0.77, y: 0 }}
        end={{ x: 0.23, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </Pressable>
  );
}

function HeroText({
  pillIcon: PillIcon,
  pill,
  title,
  sub,
  subColor = '#fff',
  cta,
  ctaIcon: CtaIcon,
  onCta,
  width = 186,
  bigCta,
}: {
  pillIcon: LucideIcon;
  pill: string;
  title: string;
  sub: string;
  subColor?: string;
  cta: string;
  ctaIcon: LucideIcon;
  onCta: () => void;
  width?: number;
  bigCta?: boolean;
}) {
  return (
    <View style={{ width, gap: 8 }}>
      <View style={styles.heroPill}>
        <PillIcon size={14} color="#fff" strokeWidth={2} />
        <Text style={[t.cap12Medium, { color: '#fff' }]}>{pill}</Text>
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={[t.cap12, { color: subColor, width: width - 6 }]}>{sub}</Text>
      <PressableScale onPress={onCta} style={[styles.heroBtn, bigCta && { paddingHorizontal: 16 }]}>
        <CtaIcon size={bigCta ? 18 : 16} color="#fff" strokeWidth={2} />
        <Text style={[bigCta ? t.button15 : t.sec13Semibold, { color: '#fff' }]}>{cta}</Text>
      </PressableScale>
    </View>
  );
}

export function FirstTimeHero({ index, onCta }: { index: number; onCta: (i: number) => void }) {
  if (index === 0) {
    return (
      <HeroShell height={184}>
        <HeroText
          pillIcon={Gift}
          pill="Welcome gift"
          title="First coupon = +25 bonus points"
          sub="Scan the coupon from any GoMax pack"
          cta="Scan first coupon"
          ctaIcon={ScanLine}
          onCta={() => onCta(0)}
        />
        <Image source={img.workerScan} style={styles.heroWorker} resizeMode="contain" />
      </HeroShell>
    );
  }
  if (index === 1) {
    return (
      <HeroShell height={184}>
        <HeroText
          pillIcon={Sparkles}
          pill="First spin is free"
          title="Spin the wheel, win runs"
          sub="Runs = gifts like a smart watch or tool kit"
          cta="Spin now"
          ctaIcon={RotateCw}
          onCta={() => onCta(1)}
        />
        <View style={[styles.heroWheel, { left: 188, top: 5 }]}>
          <SpinWheel />
        </View>
      </HeroShell>
    );
  }
  return (
    <HeroShell height={184}>
      <HeroText
        pillIcon={Trophy}
        pill="New challenge"
        title="Scan 5 coupons this week"
        sub="Finish it and win 50 runs"
        cta="Start challenge"
        ctaIcon={Target}
        onCta={() => onCta(2)}
      />
      <Image source={img.workerTrophy} style={styles.heroWorker} resizeMode="contain" />
    </HeroShell>
  );
}

export function PagerDots({ index, total = 3, onPress }: { index: number; total?: number; onPress?: (i: number) => void }) {
  return (
    <View style={styles.pager}>
      {Array.from({ length: total }, (_, i) => (
        <Pressable key={i} onPress={() => onPress?.(i)} hitSlop={8}>
          <View style={[styles.pagerDot, i === index && styles.pagerDotActive]} />
        </Pressable>
      ))}
    </View>
  );
}

export function SpinHero({ onPress }: { onPress: () => void }) {
  return (
    <HeroShell height={164} onPress={onPress}>
      <HeroText
        pillIcon={Sparkles}
        pill="Free today"
        title="1 free spin is waiting"
        sub="Spin once a day, win runs"
        subColor="#c9d3e3"
        cta="Spin now"
        ctaIcon={RotateCw}
        onCta={onPress}
        width={176}
      />
      <View style={[styles.heroWheel, { left: 184, top: 4 }]}>
        <SpinWheel />
      </View>
    </HeroShell>
  );
}

export function WithdrawHero({ amount, upiId, onPress }: { amount: number; upiId: string; onPress: () => void }) {
  return (
    <HeroShell height={172} onPress={onPress}>
      <HeroText
        pillIcon={IndianRupee}
        pill={`₹${fmt(amount)} ready`}
        title="Send money to your UPI"
        sub={`${upiId} · paid in 24–48 hrs`}
        subColor="#e8fbe9"
        cta="Withdraw now"
        ctaIcon={Banknote}
        onCta={onPress}
        width={190}
        bigCta
      />
      <Image source={d3.creditCard} style={styles.heroCard} />
    </HeroShell>
  );
}

export function ChallengeHero({
  title,
  progress,
  goal,
  prize,
  onPress,
}: {
  title: string;
  progress: number;
  goal: number;
  prize: number;
  onPress: () => void;
}) {
  return (
    <HeroShell height={164} onPress={onPress}>
      <HeroText
        pillIcon={Trophy}
        pill={`${progress} of ${goal} done`}
        title={title}
        sub={`Finish it and win ${prize} runs`}
        subColor="#c9d3e3"
        cta="Keep going"
        ctaIcon={Target}
        onCta={onPress}
      />
      <Image source={img.workerTrophy} style={[styles.heroWorker, { top: 8 }]} resizeMode="contain" />
    </HeroShell>
  );
}

export function ScanHero({ onPress }: { onPress: () => void }) {
  return (
    <HeroShell height={164} onPress={onPress}>
      <HeroText
        pillIcon={ScanLine}
        pill="Earn points"
        title="Scan a coupon now"
        sub="Every GoMax pack has a coupon inside"
        subColor="#c9d3e3"
        cta="Scan coupon"
        ctaIcon={ScanLine}
        onCta={onPress}
      />
      <Image source={img.workerScan} style={[styles.heroWorker, { top: 8 }]} resizeMode="contain" />
    </HeroShell>
  );
}

// ---------- today's coupons ----------

export function TodaysCoupons({ count, onPress }: { count: number; onPress: () => void }) {
  const done = count >= 10;
  return (
    <Pressable onPress={onPress} style={styles.coupons}>
      <LinearGradient
        colors={['#fff3ea', '#ffd6c0']}
        locations={[0.146, 0.854]}
        start={{ x: 0.75, y: 0 }}
        end={{ x: 0.25, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.couponGlow} />
      <Image
        source={done ? d3.wrappedGift : d3.ticket}
        style={[styles.couponArt, { transform: [{ rotate: '12deg' }] }]}
      />
      <View style={[styles.notch, { left: -12 }]} />
      <View style={[styles.notch, { right: -12 }]} />
      <View style={styles.couponTop}>
        <Text style={[t.cap12Semibold, { color: c.primary700, letterSpacing: 2.16, flex: 1 }]}>TODAY'S COUPONS</Text>
        <View style={styles.resets}>
          <Clock size={12} color={c.textSecondary} strokeWidth={2} />
          <Text style={[t.cap12Medium, { color: c.textSecondary }]}>Resets 12 am</Text>
        </View>
      </View>
      <View style={styles.couponCount}>
        <Text style={[t.display36, { color: c.navy900 }]}>{Math.min(count, 10)}</Text>
        <Text style={[t.sec13Medium, { color: c.textSecondary }]}>/ 10 scanned</Text>
      </View>
      <Text style={[t.sec13Semibold, { color: done ? c.successText : c.primary700, width: 190 }]}>
        {done ? 'Scratch card won! Tap to scratch' : `${10 - count} more = 1 free scratch card`}
      </Text>
      <View style={styles.segs}>
        {Array.from({ length: 10 }, (_, i) => (
          <View key={i} style={[styles.seg, i < count && styles.segOn]} />
        ))}
      </View>
    </Pressable>
  );
}

// ---------- slim rows & tiles ----------

export function StreakRow({ day, onPress }: { day: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Image source={d3.fire} style={{ width: 30, height: 30 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.sec13Semibold, { color: c.textPrimary }]}>Photo streak · Day {day} of 15</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>Add today's work photo</Text>
      </View>
      <Image source={d3.framedPicture} style={{ width: 28, height: 28 }} />
      <ChevronRight size={18} color={c.textSecondary} strokeWidth={2} />
    </Pressable>
  );
}

export function LinkPanUpiCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.kyc}>
      <View style={styles.kycTop}>
        <Image source={d3.locked} style={{ width: 36, height: 36 }} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[t.section15, { color: c.textPrimary }]}>Link PAN & UPI</Text>
          <Text style={[t.cap12, { color: c.textSecondary }]}>Needed to take your money out</Text>
        </View>
        <ChevronRight size={20} color={c.textSecondary} strokeWidth={2} />
      </View>
      <View style={styles.kycSteps}>
        <View style={styles.whitePill}>
          <IdCard size={14} color={c.textSecondary} strokeWidth={2} />
          <Text style={[t.cap12Medium, { color: c.textSecondary }]}>1 PAN</Text>
        </View>
        <View style={styles.whitePill}>
          <Smartphone size={14} color={c.textSecondary} strokeWidth={2} />
          <Text style={[t.cap12Medium, { color: c.textSecondary }]}>2 UPI</Text>
        </View>
        <Text style={[t.cap12, { color: c.textSecondary }]}>· 2 min</Text>
      </View>
    </Pressable>
  );
}

export function EarnFlowCard({ onPress }: { onPress: () => void }) {
  const Step = ({ src, label }: { src: ImageSourcePropType; label: string }) => (
    <View style={styles.flowStep}>
      <View style={styles.flowBubble}>
        <Image source={src} style={{ width: 32, height: 32 }} />
      </View>
      <Text style={[t.cap12Medium, { color: c.textPrimary }]}>{label}</Text>
    </View>
  );
  return (
    <Pressable onPress={onPress} style={styles.flowCard}>
      <Text style={[t.section15, { color: c.textPrimary }]}>What you can do in GoMax</Text>
      <View style={styles.flowRow}>
        <Step src={d3.ticket} label="Scan coupon" />
        <ArrowRight size={18} color={c.textMuted} strokeWidth={2} />
        <Step src={d3.coin} label="Get points" />
        <ArrowRight size={18} color={c.textMuted} strokeWidth={2} />
        <Step src={d3.creditCard} label="Cash in UPI" />
      </View>
      <Text style={[t.cap12, { color: c.textSecondary, textAlign: 'center' }]}>
        1 point = ₹1 · take money out from 500 points
      </Text>
    </Pressable>
  );
}

export function MoreWaysTiles({
  onSpin,
  onChallenges,
  onInvite,
}: {
  onSpin: () => void;
  onChallenges: () => void;
  onInvite: () => void;
}) {
  return (
    <View style={styles.tiles}>
      <PressableScale onPress={onSpin} style={[styles.tile, { overflow: 'hidden' }]}>
        <View style={{ height: 32 }} />
        <View style={styles.tileWheel} pointerEvents="none">
          <MiniWheel size={66} />
        </View>
        <Image source={d3.ticket} style={styles.tileTicket} />
        <Text style={[t.cap12Medium, { color: c.textPrimary }]}>Spin & scratch</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>Win runs daily</Text>
      </PressableScale>
      <PressableScale onPress={onChallenges} style={styles.tile}>
        <Image source={d3.trophy} style={{ width: 32, height: 32 }} />
        <Text style={[t.cap12Medium, { color: c.textPrimary }]}>{'Challenges\nfor you'}</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>Big run prizes</Text>
      </PressableScale>
      <PressableScale onPress={onInvite} style={styles.tile}>
        <Image source={d3.handshake} style={{ width: 32, height: 32 }} />
        <Text style={[t.cap12Medium, { color: c.textPrimary }]}>Invite applicators</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>Runs for each</Text>
      </PressableScale>
    </View>
  );
}

export function HowItWorksRow({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, { paddingVertical: 8 }]}>
      <View style={styles.helpIcon}>
        <CircleHelp size={20} color={c.navy700} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.body15Semibold, { color: c.textPrimary }]}>How GoMax works</Text>
        <Text style={[t.cap12, { color: c.textSecondary }]}>Simple steps & rules</Text>
      </View>
      <Image source={img.workerScan} style={{ width: 44, height: 59 }} resizeMode="contain" />
      <ChevronRight size={18} color={c.textSecondary} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.primary100,
    borderWidth: 2,
    borderColor: c.primary500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: { position: 'absolute', left: 28, top: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: c.primary500 },

  path: { height: 70, width: 320, alignSelf: 'center' },
  track: { position: 'absolute', left: 8, top: 34, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  rankDot: { position: 'absolute', top: 30, width: 12, height: 12, borderRadius: 6 },
  gem: { position: 'absolute', left: 302, top: 26, width: 20, height: 20 },
  rankLabel: { position: 'absolute', top: 50 },
  marker: {
    position: 'absolute',
    top: 27,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: c.primary500,
  },
  herePill: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  prCard: { backgroundColor: c.surfaceCard, borderRadius: 20, borderWidth: 1, borderColor: c.border },
  prShadow: { shadowColor: '#0a1729', shadowOpacity: 0.1, shadowRadius: 9, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  prTop: { flexDirection: 'row' },
  prCol: { flex: 1, paddingTop: 16, paddingBottom: 14, paddingHorizontal: 16, gap: 6 },
  prLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prValue: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  prNum: { fontFamily: 'Inter_700Bold', fontSize: 30, lineHeight: 30, letterSpacing: -0.3, color: c.textPrimary },
  prSub: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vDivider: { width: 1, backgroundColor: c.border },
  hDivider: { height: 1, backgroundColor: c.border },
  qaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 14, paddingHorizontal: 8 },
  qa: { width: 72, alignItems: 'center', gap: 6 },
  qaIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  hero: { borderRadius: 20, overflow: 'hidden', paddingLeft: 18, justifyContent: 'center' },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 24, letterSpacing: -0.1, color: '#fff', width: 180 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: c.primary700,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroWorker: { position: 'absolute', left: 196, top: 16, width: 130, height: 174 },
  heroWheel: { position: 'absolute' },
  heroCard: { position: 'absolute', left: 206, top: 32, width: 110, height: 110 },
  pager: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  pagerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.borderStrong },
  pagerDotActive: { width: 20, backgroundColor: c.primary700 },

  coupons: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#bf5436',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  couponGlow: { position: 'absolute', left: 205, top: 39, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.45)' },
  couponArt: { position: 'absolute', left: 208, top: 56, width: 78, height: 78 },
  notch: { position: 'absolute', top: 74, width: 22, height: 22, borderRadius: 11, backgroundColor: c.surfacePage },
  couponTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resets: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  couponCount: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  segs: { flexDirection: 'row', gap: 3 },
  seg: { width: 17, height: 10, borderRadius: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0b49c' },
  segOn: { backgroundColor: c.primary500, borderWidth: 0 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.surfaceCard,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  helpIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.info50, alignItems: 'center', justifyContent: 'center' },
  kyc: { backgroundColor: c.warning50, borderWidth: 1, borderColor: c.warning, borderRadius: 16, padding: 16, gap: 12 },
  kycTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kycSteps: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.surfaceCard,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  flowCard: {
    backgroundColor: c.surfaceCard,
    borderWidth: 0.8,
    borderColor: c.textMuted,
    borderStyle: 'dashed',
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 16,
    gap: 8,
  },
  flowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 288 },
  flowStep: { width: 76, alignItems: 'center', gap: 6 },
  flowBubble: { width: 52, height: 52, borderRadius: 26, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    height: 116,
    backgroundColor: c.surfaceCard,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },
  tileWheel: { position: 'absolute', left: 42, top: -18 },
  tileTicket: { position: 'absolute', left: 34, top: 24, width: 22, height: 22, transform: [{ rotate: '-14deg' }] },
});

