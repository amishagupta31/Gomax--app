// HTTP client for the GoMax API (backend/, /v1). Holds the session: the 15-min
// access token stays in memory; the refresh token is kept in SecureStore
// (AsyncStorage on web, where SecureStore does not exist).
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

function resolveBase() {
  const url = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
  const local = /localhost|127\.0\.0\.1/;
  if (!__DEV__ || Platform.OS === 'web' || !local.test(url)) return url;
  // A phone or emulator's "localhost" is itself: use the PC that serves the JS.
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? url.replace(local, host) : url;
}
export const API_BASE = resolveBase();

export class ApiError extends Error {
  constructor(
    public status: number, // 0 = could not reach the server
    public code: string,
    message: string,
    public extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export const isNetworkError = (e: unknown) => e instanceof ApiError && e.status === 0;
export const errorText = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong. Try again.');

// ── Stored values ───────────────────────────────────────────────────────

const REFRESH_KEY = 'gomax.refresh';
const DEVICE_KEY = 'gomax.device';

const secure = {
  get: (k: string) => (Platform.OS === 'web' ? AsyncStorage.getItem(k) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) => (Platform.OS === 'web' ? AsyncStorage.setItem(k, v) : SecureStore.setItemAsync(k, v)),
  del: (k: string) => (Platform.OS === 'web' ? AsyncStorage.removeItem(k) : SecureStore.deleteItemAsync(k)),
};

let accessToken: string | null = null;
let refreshToken: string | null = null;

export async function setSession(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  await secure.set(REFRESH_KEY, tokens.refreshToken);
}

export async function clearSession() {
  accessToken = null;
  refreshToken = null;
  await secure.del(REFRESH_KEY);
}

/** Loads the saved refresh token at app start. True if there is a session. */
export async function loadSession() {
  refreshToken = await secure.get(REFRESH_KEY);
  return Boolean(refreshToken);
}

export const currentRefreshToken = () => refreshToken;
export const hasSession = () => Boolean(refreshToken);

/** Stable random id for this install. The server uses it for fraud checks. */
let deviceId: string | null = null;
export async function getDeviceId() {
  if (deviceId) return deviceId;
  deviceId = await AsyncStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    await AsyncStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

// ── Listeners (wired up once in V3App) ──────────────────────────────────

let onExpired: () => void = () => undefined;
let onReadError: (message: string, offline: boolean) => void = () => undefined;

export function bindApiEvents(handlers: { expired: () => void; readError: (message: string, offline: boolean) => void }) {
  onExpired = handlers.expired;
  onReadError = handlers.readError;
}

/**
 * For data a screen is loading: shows the error once as a toast and returns
 * the fallback, so a screen never hangs on a failed request. Actions the user
 * tapped (redeem, withdraw…) call `api` directly and handle the error there.
 */
export async function read<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 401)) onReadError(errorText(e), isNetworkError(e));
    return fallback;
  }
}

// ── Requests ────────────────────────────────────────────────────────────

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  auth?: boolean; // default true
};

const TIMEOUT_MS = 20_000;

async function send(path: string, opts: Options) {
  const qs = Object.entries(opts.query ?? {})
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE}/v1${path}${qs ? `?${qs}` : ''}`, {
      method: opts.method ?? 'GET',
      signal: ctrl.signal,
      headers: {
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.auth !== false && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network', 'No internet. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (res.ok) return data as T;
  const { code = 'server_error', message = 'Something went wrong. Try again.', ...extra } = data?.error ?? {};
  throw new ApiError(res.status, code, message, extra);
}

// One refresh at a time: refresh tokens rotate, so a second parallel call
// would present an already-used token.
let refreshing: Promise<boolean> | null = null;

function refreshAccess() {
  refreshing ??= (async () => {
    if (!refreshToken) return false;
    try {
      const res = await send('/auth/refresh', { method: 'POST', auth: false, body: { refreshToken } });
      await setSession(await parse<{ accessToken: string; refreshToken: string }>(res));
      return true;
    } catch (e) {
      if (isNetworkError(e)) throw e; // no internet is not a logged-out user
      await clearSession();
      onExpired();
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  if (opts.auth === false) return parse<T>(await send(path, opts));
  if (!accessToken) await refreshAccess();
  let res = await send(path, opts);
  if (res.status === 401 && (await refreshAccess())) res = await send(path, opts);
  return parse<T>(res);
}

// ── Display helpers for the API's ISO dates ─────────────────────────────

const clock = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

/** "2 Oct" */
export const dayMonth = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
/** "2 Oct, 5:10 pm" */
export const dayMonthTime = (iso: string) => `${dayMonth(iso)}, ${clock(new Date(iso))}`;

/** Whole days between a time and today: 0 = today, 1 = yesterday… */
export function daysAgo(iso: string) {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(new Date()) - start(new Date(iso))) / 86_400_000);
}
