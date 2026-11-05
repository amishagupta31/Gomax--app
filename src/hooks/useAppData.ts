import { useCallback, useEffect, useState } from 'react';
import * as coupon from '../services/coupon';
import * as wallet from '../services/wallet';
import * as gifts from '../services/gifts';
import * as engagement from '../services/engagement';
import * as spin from '../services/spin';

function useAsync<T>(fetcher: () => Promise<T>, initial: T, deps: unknown[] = []) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => reload(), [reload]);

  return { data, loading, error, reload };
}

export const useMyScans = () => useAsync<coupon.ScanTransactionRow[]>(coupon.listMyScans, []);
export const useMyRedemptions = () => useAsync<wallet.RedemptionRequestRow[]>(wallet.listMyRedemptions, []);
export const useMyPointsLedger = () => useAsync<wallet.PointsLedgerRow[]>(wallet.listMyPointsLedger, []);
export const useMyCommissionEarnings = () =>
  useAsync<wallet.CommissionLedgerRow[]>(wallet.listMyCommissionEarnings, []);
export const useRedeemedThisMonth = () => useAsync<number>(wallet.getRedeemedThisMonth, 0);
export const useGiftCatalogue = () => useAsync<gifts.GiftRow[]>(gifts.listGiftCatalogue, []);
export const useMyGiftRedemptions = () =>
  useAsync<Awaited<ReturnType<typeof gifts.listMyGiftRedemptions>>>(gifts.listMyGiftRedemptions, []);
export const useChallenges = () => useAsync<engagement.ChallengeRow[]>(engagement.listChallenges, []);
export const useLeaderboard = () =>
  useAsync<Awaited<ReturnType<typeof engagement.listLeaderboard>>>(() => engagement.listLeaderboard(), []);
export const useMyChallengeProgress = () =>
  useAsync<engagement.ChallengeProgressRow[]>(engagement.listMyChallengeProgress, []);
export const useBadges = () => useAsync<engagement.BadgeRow[]>(engagement.listBadges, []);
export const useMyUnlockedBadges = () => useAsync<engagement.UserBadgeRow[]>(engagement.listMyUnlockedBadges, []);
export const useScratchCards = () => useAsync<engagement.MyScratchCard[]>(engagement.ensureMyScratchCards, []);
export const useSpinsUsedToday = () => useAsync<number>(spin.getSpinsUsedToday, 0);
