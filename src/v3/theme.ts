// Design tokens for the final Applicator app ("GOMAX – DEV" Figma file,
// fileKey g4rfWu271bsemo0qIp64Zf, page "02 · Applicator design + dealer").
// Values are copied from the file's variables — do not approximate; if a new
// screen needs a value not listed here, pull it from Figma and add it.
import { TextStyle, ViewStyle } from 'react-native';

export const c = {
  navy900: '#0a1628',
  navy700: '#0f2a4e',
  navyBrand: '#001e42',
  navy50: '#f0f4fa',
  navy800: '#0d1f3c',
  navy500: '#1e508c',
  navyDeep: '#002040',

  primary700: '#c05336',
  primary500: '#e07a62',
  primary100: '#fbe7dd',
  primary50: '#fff8f5',

  textPrimary: '#0a1628',
  textSecondary: '#71717a',
  textMuted: '#a1a1aa',
  textInverse: '#ffffff',

  border: '#ededed',
  borderStrong: '#e0e0e0',

  surfaceCard: '#ffffff',
  surfaceMuted: '#f4f5f7',
  surfacePage: '#fff8f5',

  /** Points amounts on game prizes (color/points). */
  points: '#c1440e',
  runs: '#2a8fa8',
  runs50: '#e8f4f7',
  info50: '#eaf1fb',
  navIdle: '#474d6a',

  danger: '#dc2626',
  danger50: '#fdeaea',
  dangerText: '#b91c1c',
  warning: '#d97706',
  warning50: '#fff4e0',
  warningText: '#a3540a',
  success: '#14c87c',
  success50: '#e6f7ec',
  successText: '#137a3d',
  whatsapp: '#128c7e',
  whatsappBubble: '#d9fdd3',
  stepperIdle: '#d4d4d8',

  disabledBg: '#e4e4e7',

  // Rank colours (color/rank/*) — solid + 50 tint.
  rankNayaSaathi: '#8b5a2b',
  rankNayaSaathi50: '#f5ede4',
  rankKaarigar: '#2e9e5b',
  rankKaarigar50: '#e7f5ec',
  rankUstaad: '#2f6fd6',
  rankUstaad50: '#e8f0fc',
  rankStar: '#d99a00',
  rankStar50: '#fff6db',
  rankLegend: '#d93a2b',
  rankLegend50: '#fce9e7',

  // Dark auth/splash backdrop
  authGradientTop: '#000000',
  authGradientBottom: '#041f61',
  splashGradientEnd: '#002040',
} as const;

const inter = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const font = inter;

// Figma text styles. letterSpacing in Figma is a % of size; converted to px.
export const t = {
  hero32: { fontFamily: inter.bold, fontSize: 32, lineHeight: 38, letterSpacing: -0.64 },
  display36: { fontFamily: inter.bold, fontSize: 36, lineHeight: 40, letterSpacing: -0.54 },
  hero24: { fontFamily: inter.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.48 },
  title20: { fontFamily: inter.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  title18: { fontFamily: inter.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.09 },
  section15: { fontFamily: inter.bold, fontSize: 15, lineHeight: 22, letterSpacing: -0.075 },
  body15: { fontFamily: inter.regular, fontSize: 15, lineHeight: 22 },
  body15Medium: { fontFamily: inter.medium, fontSize: 15, lineHeight: 22 },
  body15Semibold: { fontFamily: inter.semibold, fontSize: 15, lineHeight: 22 },
  button15: { fontFamily: inter.semibold, fontSize: 15, lineHeight: 20 },
  subtitle14: { fontFamily: inter.medium, fontSize: 14, lineHeight: 20 },
  body14: { fontFamily: inter.regular, fontSize: 14, lineHeight: 20 },
  sec13: { fontFamily: inter.regular, fontSize: 13, lineHeight: 18 },
  sec13Medium: { fontFamily: inter.medium, fontSize: 13, lineHeight: 18 },
  sec13Semibold: { fontFamily: inter.semibold, fontSize: 13, lineHeight: 18 },
  cap12: { fontFamily: inter.regular, fontSize: 12, lineHeight: 16 },
  cap12Medium: { fontFamily: inter.medium, fontSize: 12, lineHeight: 16 },
  cap12Semibold: { fontFamily: inter.semibold, fontSize: 12, lineHeight: 16 },
  labelSpaced12: { fontFamily: inter.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.72 },
  micro11: { fontFamily: inter.medium, fontSize: 11, lineHeight: 14 },
  micro11Semibold: { fontFamily: inter.semibold, fontSize: 11, lineHeight: 14 },
  micro10: { fontFamily: inter.semibold, fontSize: 10, lineHeight: 12 },
} satisfies Record<string, TextStyle>;

export const shadow = {
  // Glow/Points card
  pointsGlow: {
    shadowColor: '#c1440e',
    shadowOpacity: 0.27,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  // Shadow/Sheet
  sheet: {
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  // Glow/Scan button
  scanButton: {
    shadowColor: '#c05336',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  card: {
    shadowColor: '#0a1628',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} satisfies Record<string, ViewStyle>;

export const HELPLINE = '92158 44410';
export const HELPLINE_TEL = '+919215844410';
