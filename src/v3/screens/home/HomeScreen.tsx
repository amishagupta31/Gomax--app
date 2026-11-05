import React, { useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { c, t } from '../../theme';
import { WITHDRAW_MIN, useV3 } from '../../state/Store';
import { useV3Nav } from '../../navigation/types';
import {
  ChallengeHero,
  EarnFlowCard,
  FirstTimeHero,
  HomeHeader,
  HowItWorksRow,
  LinkPanUpiCard,
  MoreWaysTiles,
  PagerDots,
  PointsRunsCard,
  RankPath,
  ScanHero,
  SpinHero,
  StreakRow,
  TodaysCoupons,
  WithdrawHero,
} from './HomeParts';

// A2-02…A2-07 + A3-01 (17:15682 / 15870 / 16057 / 16244 / 16416 / 16604 / 16826).
// One screen; the variant comes from account state:
//  • first time → 3-card hero pager on top, earn-flow card, then money card
//  • otherwise → money card, [Link PAN & UPI from 2nd open], ONE hero card,
//    today's coupons, photo streak, more ways to earn, how GoMax works.
// Hero priority: first-time → withdraw ready → free spin → challenge → scan.
export function HomeScreen() {
  const nav = useV3Nav();
  const tabNav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, account, patchAccount, refreshAccount } = useV3();
  const name = user?.name ?? '';
  useFocusEffect(
    React.useCallback(() => {
      refreshAccount();
    }, [refreshAccount]),
  );

  const firstTime = !account.firstTimeDone;
  const kycDone = !!account.pan && !!account.upi;
  const withdrawReady = account.points >= WITHDRAW_MIN && !!account.upi;
  const showKyc = !firstTime && !kycDone && account.appOpens >= 2;

  // Nav targets from the "what each tap opens" map
  const go = {
    notifications: () => nav.navigate('Notifications'),
    profile: () => tabNav.navigate('Profile'),
    rank: () => nav.navigate('RankSheet'),
    walletPoints: () => tabNav.navigate('Wallet', { tab: 'points' }),
    walletRuns: () => tabNav.navigate('Wallet', { tab: 'runs' }),
    myScans: () => nav.navigate('MyScans'),
    withdraw: () => (withdrawReady ? nav.navigate('Withdraw') : nav.navigate('WithdrawInfoSheet')),
    history: () => nav.navigate('HistoryAll'),
    spin: () => (account.spinsLeft > 0 ? nav.navigate('SpinWheel') : nav.navigate('SpinNoneLeft')),
    scan: () => tabNav.navigate('Scan'),
    scratch: () => nav.navigate('ScratchCards'),
    challenges: () => nav.navigate('ChallengesHome'),
    streak: () => nav.navigate('PhotoStreak'),
    invite: () => nav.navigate('InviteEarn'),
    how: () => nav.navigate('HowItWorksSheet'),
    kyc: () => nav.navigate('PanUpiOverview'),
  };

  const [page, setPage] = useState(account.firstTimeCard);
  const pagerRef = useRef<ScrollView>(null);
  const cardW = width - 40;
  const onPage = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (cardW + 12));
    if (i !== page) {
      setPage(i);
      patchAccount({ firstTimeCard: i });
    }
  };
  const goPage = (i: number) => {
    pagerRef.current?.scrollTo({ x: i * (cardW + 12), animated: true });
    setPage(i);
  };
  const onFirstCta = (i: number) => {
    if (i === 0) go.scan();
    else if (i === 1) go.spin();
    else {
      patchAccount({ firstTimeDone: true });
      go.challenges();
    }
  };

  const hero = withdrawReady ? (
    <WithdrawHero amount={account.points} upiId={account.upi!.id} onPress={() => nav.navigate('Withdraw')} />
  ) : account.spinsLeft > 0 ? (
    <SpinHero onPress={go.spin} />
  ) : account.activeChallenge ? (
    <ChallengeHero {...account.activeChallenge} onPress={go.challenges} />
  ) : (
    <ScanHero onPress={go.scan} />
  );

  const money = (
    <PointsRunsCard
      account={account}
      onPoints={go.walletPoints}
      onRuns={go.walletRuns}
      onMyScans={go.myScans}
      onWithdraw={go.withdraw}
      onGifts={go.walletRuns}
      onHistory={go.history}
    />
  );
  const coupons = (
    <TodaysCoupons count={account.todayCoupons} onPress={account.todayCoupons >= 10 ? go.scratch : go.scan} />
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[c.navy700, c.navy900]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.navyTop, { height: (firstTime ? 324 : 290) + insets.top - 44 }]}
        />
        <HomeHeader
          name={name}
          unread
          onAvatar={go.profile}
          onBell={go.notifications}
          onAvatarLongPress={() => nav.navigate('DemoStates')}
        />
        <RankPath lifetimePoints={account.lifetimePoints} onPress={go.rank} />

        {firstTime ? (
          <>
            <ScrollView
              ref={pagerRef}
              horizontal
              pagingEnabled={false}
              snapToInterval={cardW + 12}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onPage}
              style={{ marginHorizontal: -20 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              contentOffset={{ x: page * (cardW + 12), y: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: cardW }}>
                  <FirstTimeHero index={i} onCta={onFirstCta} />
                </View>
              ))}
            </ScrollView>
            <PagerDots index={page} onPress={goPage} />
            <View style={{ gap: 16 }}>
              <EarnFlowCard onPress={go.how} />
              <MoreWaysTiles onSpin={go.spin} onChallenges={go.challenges} onInvite={go.invite} />
            </View>
            {money}
            {coupons}
            <HowItWorksRow onPress={go.how} />
          </>
        ) : (
          <>
            {money}
            {showKyc ? <LinkPanUpiCard onPress={go.kyc} /> : null}
            {hero}
            {coupons}
            <StreakRow day={account.streakDay} onPress={go.streak} />
            {withdrawReady ? (
              <View style={{ gap: 16 }}>
                <EarnFlowCard onPress={go.how} />
                <MoreWaysTiles onSpin={go.spin} onChallenges={go.challenges} onInvite={go.invite} />
              </View>
            ) : (
              <View style={{ gap: 10, paddingTop: 8 }}>
                <Text style={[t.section15, { color: c.textPrimary }]}>More ways to earn</Text>
                <MoreWaysTiles onSpin={go.spin} onChallenges={go.challenges} onInvite={go.invite} />
              </View>
            )}
            <HowItWorksRow onPress={go.how} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.surfacePage },
  body: { paddingHorizontal: 20, paddingBottom: 110, gap: 20 },
  navyTop: { position: 'absolute', top: 0, left: 0, right: 0 },
});
