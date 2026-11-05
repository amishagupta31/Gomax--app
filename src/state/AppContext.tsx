import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as authService from '../services/auth';
import * as profileService from '../services/profile';
import type { SignupInput } from '../services/auth';

export type Role = 'dealer' | 'contractor' | 'applicator' | 'admin';

export const ADMIN_ON_WEBSITE = 'Admin accounts use the GoMax Admin website (admin.gomax.in), not the app.';

type AppState = {
  isAuthenticated: boolean;
  sessionLoading: boolean;
  role: Role | null;
  fullName: string;
  mobileNumber: string;
  city: string;
  address: string;
  bankAccountNumber: string;
  bankIfsc: string;
  upiId: string;
  panNumber: string;
  aadhaarNumber: string;
  points: number;
  runs: number;
  referralCode: string;
};

type AppContextValue = AppState & {
  signUp: (input: SignupInput) => Promise<void>;
  logIn: (mobileNumber: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const initialState: AppState = {
  isAuthenticated: false,
  sessionLoading: true,
  role: null,
  fullName: '',
  mobileNumber: '',
  city: '',
  address: '',
  bankAccountNumber: '',
  bankIfsc: '',
  upiId: '',
  panNumber: '',
  aadhaarNumber: '',
  points: 0,
  runs: 0,
  referralCode: '',
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const hydrateFromProfile = useCallback(async () => {
    const profile = await profileService.getMyProfile();
    // The admin panel is website-only (admin-web / admin.gomax.in): admin
    // accounts are never signed in to the app.
    if (profile?.role === 'admin') {
      await supabase.auth.signOut();
      setState({ ...initialState, sessionLoading: false });
      throw new Error(ADMIN_ON_WEBSITE);
    }
    if (!profile) {
      setState((s) => ({ ...s, isAuthenticated: true, sessionLoading: false }));
      return;
    }
    setState((s) => ({
      ...s,
      isAuthenticated: true,
      sessionLoading: false,
      role: (profile.role as Role) ?? null,
      fullName: profile.full_name,
      mobileNumber: profile.mobile_number ?? '',
      city: profile.city,
      address: profile.address ?? '',
      bankAccountNumber: profile.bank_account_number ?? '',
      bankIfsc: profile.bank_ifsc ?? '',
      upiId: profile.upi_id ?? '',
      panNumber: profile.pan_number ?? '',
      aadhaarNumber: profile.aadhaar_number ?? '',
      points: profile.points,
      runs: profile.runs,
      referralCode: profile.referral_code ?? '',
    }));
  }, []);

  useEffect(() => {
    let mounted = true;
    authService.getSession().then((session) => {
      if (!mounted) return;
      if (session) hydrateFromProfile().catch(() => {});
      else setState((s) => ({ ...s, sessionLoading: false }));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) hydrateFromProfile().catch(() => {});
      else setState({ ...initialState, sessionLoading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrateFromProfile]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,

      signUp: async (input) => {
        await authService.signUp(input);
        await hydrateFromProfile();
      },

      logIn: async (mobileNumber, password) => {
        await authService.signIn(mobileNumber, password);
        await hydrateFromProfile();
      },

      logOut: async () => {
        await authService.signOut();
        setState({ ...initialState, sessionLoading: false });
      },

      refreshProfile: hydrateFromProfile,
    }),
    [state, hydrateFromProfile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
