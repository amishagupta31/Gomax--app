import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupInput, logout } from '../api/auth';
import { fetchAccount } from '../api/account';
import { hasSession, loadSession, read } from '../api/client';
import { clearOfflineScans, flushOfflineScans } from '../api/coupons';

export type User = {
  name: string;
  mobile: string; // 10 digits
  inviteCode?: string;
  city?: string | null;
};

// Everything GET /home returns (A2/A3 dev notes) plus KYC flags.
export type Account = {
  points: number;
  runs: number;
  lifetimePoints: number;
  todayCoupons: number; // 12 am – 12 am IST; 10 = 1 scratch card
  spinsLeft: number;
  /** Spins a day at this rank. */
  spinsTotal?: number;
  streakDay: number; // photo streak: days completed (next reward at 15)
  /** Today's work photo already uploaded (C2-15). */
  streakDoneToday?: boolean;
  /** App language (C4-01). */
  language?: 'hi' | 'en' | 'pa';
  /** WhatsApp updates opt-in (C4-01). */
  whatsappUpdates?: boolean;
  pan?: { masked: string; name: string };
  upi?: { id: string; name: string };
  appOpens: number;
  firstTimeDone: boolean;
  /** Pager index while the 3 first-time hero cards are showing. */
  firstTimeCard: number;
  firstCouponCelebrated: boolean;
  activeChallenge?: { title: string; progress: number; goal: number; prize: number };
  scratchCardsReady: number;
};

/** Set by GoMax admin; refreshed from GET /home. */
export let WITHDRAW_MIN = 500;

const EMPTY_ACCOUNT: Account = {
  points: 0,
  runs: 0,
  lifetimePoints: 0,
  todayCoupons: 0,
  spinsLeft: 0,
  streakDay: 0,
  appOpens: 1,
  firstTimeDone: false,
  firstTimeCard: 0,
  firstCouponCelebrated: false,
  scratchCardsReady: 0,
};

const SAMPLE_ACCOUNT: Account = {
  ...EMPTY_ACCOUNT,
  points: 255,
  runs: 80,
  lifetimePoints: 255,
  spinsLeft: 1,
  streakDay: 4,
  appOpens: 3,
  firstTimeDone: true,
  firstCouponCelebrated: true,
  activeChallenge: { title: 'Scan 5 coupons this week', progress: 2, goal: 5, prize: 50 },
};

/** Named demo states that reproduce each Figma Home frame (dev screen only). */
export const DEMO_PRESETS: Record<string, { label: string; account: Partial<Account> }> = {
  firstTime: {
    label: 'A2-02 · first time',
    account: { points: 0, runs: 0, lifetimePoints: 0, appOpens: 1, firstTimeDone: false, firstTimeCard: 0, firstCouponCelebrated: false, pan: undefined, upi: undefined, streakDay: 0, scratchCardsReady: 0 },
  },
  default: { label: 'A2-05 · default', account: { ...SAMPLE_ACCOUNT, appOpens: 1 } },
  kyc: { label: 'A2-06 / A3-01 · PAN & UPI pending', account: { ...SAMPLE_ACCOUNT, appOpens: 2, pan: undefined, upi: undefined } },
  withdraw: {
    label: 'A2-07 · withdraw ready',
    account: {
      ...SAMPLE_ACCOUNT,
      points: 1240,
      runs: 140,
      lifetimePoints: 1240,
      todayCoupons: 10,
      scratchCardsReady: 1,
      pan: { masked: 'ABCDE••••F', name: 'RAM KUMAR' },
      upi: { id: 'ram@ybl', name: 'RAM KUMAR' },
    },
  },
};

type Store = {
  user: User | null;
  setUser: (u: User | null) => void;
  /** Sign-up data kept across A1-07 ↔ A1-08 so Back never loses typing. */
  signupDraft: Partial<SignupInput>;
  setSignupDraft: (d: Partial<SignupInput>) => void;
  account: Account;
  patchAccount: (p: Partial<Account>) => void;
  applyPreset: (key: keyof typeof DEMO_PRESETS) => void;
  /** Sends waiting offline scans, then reloads the balance and profile. */
  refreshAccount: () => Promise<void>;
  /** At app start: true if a saved session is still good. */
  restoreSession: () => Promise<boolean>;
  /** Forgets everything on this phone (log out, or session ended on the server). */
  clearLocal: () => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

const CACHE_KEY = 'gomax.account';
/** Don't hold the splash screen longer than this on a slow network. */
const RESTORE_WAIT_MS = 3000;

export function V3StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [signupDraft, setDraft] = useState<Partial<SignupInput>>({});
  const [account, setAccount] = useState<Account>(EMPTY_ACCOUNT);

  const patchAccount = useCallback((p: Partial<Account>) => setAccount((a) => ({ ...a, ...p })), []);
  const applyPreset = useCallback(
    (key: keyof typeof DEMO_PRESETS) => setAccount((a) => ({ ...a, ...DEMO_PRESETS[key].account })),
    [],
  );

  // Last known balance, so the app opens with numbers even with no internet.
  useEffect(() => {
    if (user) AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ user, account })).catch(() => undefined);
  }, [user, account]);

  const refreshAccount = useCallback(async () => {
    await flushOfflineScans();
    const r = await read(fetchAccount, null);
    if (!r) return;
    WITHDRAW_MIN = r.withdrawMin;
    setUser(r.user);
    setAccount((a) => ({
      ...a,
      // Clear fields the server no longer returns (e.g. challenge finished).
      pan: undefined,
      upi: undefined,
      activeChallenge: undefined,
      ...r.account,
      firstTimeDone: a.firstTimeDone || r.firstCouponDone,
    }));
  }, []);

  const restoreSession = useCallback(async () => {
    if (!(await loadSession())) return false;
    const raw = await AsyncStorage.getItem(CACHE_KEY).catch(() => null);
    if (raw) {
      const saved = JSON.parse(raw) as { user: User; account: Account };
      setUser(saved.user);
      setAccount({ ...saved.account, appOpens: saved.account.appOpens + 1 });
    }
    const refreshed = refreshAccount();
    await Promise.race([refreshed, new Promise((r) => setTimeout(r, RESTORE_WAIT_MS))]);
    return hasSession();
  }, [refreshAccount]);

  const clearLocal = useCallback(() => {
    setUser(null);
    setAccount(EMPTY_ACCOUNT);
    setDraft({});
    AsyncStorage.removeItem(CACHE_KEY).catch(() => undefined);
    clearOfflineScans().catch(() => undefined);
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    clearLocal();
  }, [clearLocal]);

  const value = useMemo<Store>(
    () => ({
      user,
      setUser,
      signupDraft,
      setSignupDraft: (d) => setDraft((prev) => ({ ...prev, ...d })),
      account,
      patchAccount,
      applyPreset,
      refreshAccount,
      restoreSession,
      clearLocal,
      signOut,
    }),
    [user, signupDraft, account, patchAccount, applyPreset, refreshAccount, restoreSession, clearLocal, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useV3() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useV3 must be used inside V3StoreProvider');
  return v;
}

export const firstName = (name?: string) => (name ?? '').trim().split(/\s+/)[0] ?? '';

export const initials = (name?: string) =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export const fmt = (n: number) => n.toLocaleString('en-IN');
