// Auth calls for the v3 Applicator app. Contract from the A1 dev notes:
//   POST /auth/login {mobile, password} · POST /auth/signup · POST /auth/reset-request
// These are local stand-ins until the backend exposes those endpoints — keep
// the signatures and swap the bodies for real requests.

export type LoginResult =
  | { ok: true; name: string }
  | { ok: false; reason: 'wrong_password'; triesLeft: number }
  | { ok: false; reason: 'not_registered' }
  | { ok: false; reason: 'paused'; until: number };

const MAX_TRIES = 3;
const PAUSE_MS = 30 * 60 * 1000;

// Demo account: +91 98765 43210 / gomax123
const accounts = new Map<string, { name: string; password: string }>([
  ['9876543210', { name: 'Ram Kumar', password: 'gomax123' }],
]);
const failures = new Map<string, number>();
const pausedUntil = new Map<string, number>();

export const digits = (s: string) => s.replace(/\D/g, '').slice(-10);

export function formatMobile(s: string) {
  const d = digits(s);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

export async function login(mobile: string, password: string): Promise<LoginResult> {
  const id = digits(mobile);
  const until = pausedUntil.get(id);
  if (until && until > Date.now()) return { ok: false, reason: 'paused', until };

  const acct = accounts.get(id);
  if (!acct) return { ok: false, reason: 'not_registered' };

  if (acct.password !== password) {
    const n = (failures.get(id) ?? 0) + 1;
    failures.set(id, n);
    if (n >= MAX_TRIES) {
      failures.delete(id);
      const u = Date.now() + PAUSE_MS;
      pausedUntil.set(id, u);
      return { ok: false, reason: 'paused', until: u };
    }
    return { ok: false, reason: 'wrong_password', triesLeft: MAX_TRIES - n };
  }
  failures.delete(id);
  return { ok: true, name: acct.name };
}

export type SignupInput = {
  name: string;
  mobile: string;
  password: string;
  referralCode?: string;
  birthday?: string;
  anniversary?: string;
};

export async function signup(input: SignupInput) {
  accounts.set(digits(input.mobile), { name: input.name, password: input.password });
  return { ok: true as const };
}

/** Resolves a referral code to the inviter's display name, or null. */
export async function lookupReferral(code: string): Promise<string | null> {
  const known: Record<string, string> = { RAMESH25: 'Ramesh Traders' };
  return known[code.trim().toUpperCase()] ?? null;
}

export async function isRegistered(mobile: string) {
  return accounts.has(digits(mobile));
}

export async function setNewPassword(mobile: string, password: string) {
  const acct = accounts.get(digits(mobile));
  if (acct) acct.password = password;
  pausedUntil.delete(digits(mobile));
  return { ok: true as const };
}

export async function requestHelplineReset(mobile: string) {
  return { ok: true as const, channel: 'helpline' as const, mobile: digits(mobile) };
}

export function passwordRules(pw: string, confirm: string) {
  return {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    match: pw.length > 0 && pw === confirm,
  };
}
