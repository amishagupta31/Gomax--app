import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SignupInput } from '../api/auth';

export type User = {
  name: string;
  mobile: string; // 10 digits
};

// Everything GET /home returns (A2/A3 dev notes) plus KYC flags.
export type Account = {
  points: number;
  runs: number;
  lifetimePoints: number;
  todayCoupons: number; // 12 am – 12 am IST; 10 = 1 scratch card
  spinsLeft: number;
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

export const WITHDRAW_MIN = 500;

const DEMO_ACCOUNT: Account = {
  points: 255,
  runs: 80,
  lifetimePoints: 255,
  todayCoupons: 0,
  spinsLeft: 1,
  streakDay: 4,
  appOpens: 3,
  firstTimeDone: true,
  firstTimeCard: 0,
  firstCouponCelebrated: true,
  activeChallenge: { title: 'Scan 5 coupons this week', progress: 2, goal: 5, prize: 50 },
  scratchCardsReady: 0,
};

/** Named demo states that reproduce each Figma Home frame. */
export const DEMO_PRESETS: Record<string, { label: string; account: Partial<Account> }> = {
  firstTime: {
    label: 'A2-02 · first time',
    account: { points: 0, runs: 0, lifetimePoints: 0, appOpens: 1, firstTimeDone: false, firstTimeCard: 0, firstCouponCelebrated: false, pan: undefined, upi: undefined, streakDay: 0, scratchCardsReady: 0 },
  },
  default: { label: 'A2-05 · default', account: { ...DEMO_ACCOUNT, appOpens: 1 } },
  kyc: { label: 'A2-06 / A3-01 · PAN & UPI pending', account: { ...DEMO_ACCOUNT, appOpens: 2, pan: undefined, upi: undefined } },
  withdraw: {
    label: 'A2-07 · withdraw ready',
    account: {
      ...DEMO_ACCOUNT,
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
};

const Ctx = createContext<Store | null>(null);

export function V3StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [signupDraft, setDraft] = useState<Partial<SignupInput>>({});
  const [account, setAccount] = useState<Account>(DEMO_ACCOUNT);

  const patchAccount = useCallback((p: Partial<Account>) => setAccount((a) => ({ ...a, ...p })), []);
  const applyPreset = useCallback(
    (key: keyof typeof DEMO_PRESETS) => setAccount((a) => ({ ...a, ...DEMO_PRESETS[key].account })),
    [],
  );

  const value = useMemo<Store>(
    () => ({
      user,
      setUser,
      signupDraft,
      setSignupDraft: (d) => setDraft((prev) => ({ ...prev, ...d })),
      account,
      patchAccount,
      applyPreset,
    }),
    [user, signupDraft, account, patchAccount, applyPreset],
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
