// Sign in, sign up and password reset (A1). POST /v1/auth/*.
import { ApiError, api, clearSession, currentRefreshToken, errorText, getDeviceId, setSession } from './client';

export type LoginResult =
  | { ok: true; name: string }
  | { ok: false; reason: 'wrong_password'; triesLeft: number }
  | { ok: false; reason: 'not_registered' }
  | { ok: false; reason: 'paused'; until: number }
  | { ok: false; reason: 'error'; message: string };

type Session = {
  user: { id: string; name: string; mobile: string; inviteCode: string };
  accessToken: string;
  refreshToken: string;
};

export const digits = (s: string) => s.replace(/\D/g, '').slice(-10);

export function formatMobile(s: string) {
  const d = digits(s);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

export async function login(mobile: string, password: string): Promise<LoginResult> {
  try {
    const s = await api<Session>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { mobile: digits(mobile), password, deviceId: await getDeviceId() },
    });
    await setSession(s);
    return { ok: true, name: s.user.name };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.code === 'not_registered') return { ok: false, reason: 'not_registered' };
      if (e.code === 'wrong_password') return { ok: false, reason: 'wrong_password', triesLeft: Number(e.extra.triesLeft ?? 0) };
      if (e.code === 'paused') return { ok: false, reason: 'paused', until: new Date(String(e.extra.until)).getTime() };
    }
    return { ok: false, reason: 'error', message: errorText(e) };
  }
}

export type SignupInput = {
  name: string;
  mobile: string;
  password: string;
  referralCode?: string;
  birthday?: string;
  anniversary?: string;
};

/** Creates the account and signs in. Throws ApiError if the server refuses it. */
export async function signup(input: SignupInput) {
  const s = await api<Session>('/auth/signup', {
    method: 'POST',
    auth: false,
    body: { ...input, mobile: digits(input.mobile), deviceId: await getDeviceId() },
  });
  await setSession(s);
  return s.user;
}

/** Resolves a referral code to the inviter's display name, or null. */
export async function lookupReferral(code: string): Promise<string | null> {
  try {
    const r = await api<{ name: string }>(`/auth/referral/${encodeURIComponent(code.trim().toUpperCase())}`, { auth: false });
    return r.name;
  } catch {
    return null;
  }
}

export async function isRegistered(mobile: string) {
  const r = await api<{ registered: boolean }>('/auth/registered', { auth: false, query: { mobile: digits(mobile) } });
  return r.registered;
}

/** A1-13: `token` comes from the WhatsApp reset link. */
export async function setNewPassword(token: string, password: string) {
  return api<{ ok: true; mobile: string }>('/auth/reset-password', { method: 'POST', auth: false, body: { token, password } });
}

/** OTP reset: `firebaseToken` is a Firebase ID token proving phone ownership. */
export async function resetWithOtp(firebaseToken: string, newPassword: string) {
  return api<{ ok: true; mobile: string }>('/auth/reset-otp', { method: 'POST', auth: false, body: { firebaseToken, newPassword } });
}

export async function requestHelplineReset(mobile: string) {
  return api<{ ok: true; channel: 'helpline' }>('/auth/reset-request', { method: 'POST', auth: false, body: { mobile: digits(mobile) } });
}

/** Ends the session on the server (best effort) and on this phone. */
export async function logout() {
  const refreshToken = currentRefreshToken();
  await clearSession();
  if (refreshToken) await api('/auth/logout', { method: 'POST', auth: false, body: { refreshToken } }).catch(() => undefined);
}

export function passwordRules(pw: string, confirm: string) {
  return {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    match: pw.length > 0 && pw === confirm,
  };
}
