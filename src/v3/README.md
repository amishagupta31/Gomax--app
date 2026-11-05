# v3 — final Applicator app (Figma "GOMAX – DEV")

Source: https://www.figma.com/design/g4rfWu271bsemo0qIp64Zf/GOMAX---DEV?node-id=1-4056
(page "02 · Applicator design + dealer"). Every screen here is built from that
page's frames; node ids are noted on each screen component.

This folder is **additive** — nothing under `src/screens`, `src/components`,
`src/navigation` etc. is modified. The v3 app is mounted from `App.tsx` only
when `EXPO_PUBLIC_UI=v3` (see `src/v3/V3App.tsx`).

- Tokens: `theme.ts` (Figma variables) · Icons: `lucide-react-native` (the
  file's `icon/*` set is Lucide) · 3D/illustrations: `assets/v3/**`.
- Data: `api/*` are local stand-ins with the endpoint contracts from the dev
  notes; swap bodies for real calls. `data/*` holds demo content.

## Screen map

| Section | Figma frames | File |
|---|---|---|
| A1 Onboarding | A1-01 … A1-16 | `screens/auth/*` |
| A2/A3 Home + sheets + PAN/UPI | A2-01a … A3-08 | `screens/home/*` |
| B1 Scan & My scans | B1-00a … B1-09 | `screens/scan/*` |
| B2 Wallet & Gifts, B4 History | B2-01 … B4-04 | `screens/wallet/*` |
| B3 Withdraw | B3-01 … B3-06 | `screens/withdraw/*` |
| C1 Products | C1-01 … C1-04 | `screens/products/*` |
| C2 Games & Challenges | C2-01 … C2-16 | `screens/games/*` |
| C3 Invite & earn | C3-01 … C3-03 | `screens/invite/*` |
| C4 Profile, notifications, WhatsApp | C4-01 … C4-14 | `screens/profile/*` |

## Progress
- [x] A1 Onboarding (16) — `screens/auth`
- [x] A2/A3 Home, sheets, PAN/UPI, first coupon (17) — `screens/home`
- [x] B1 Scan & My scans (15) — `screens/scan`
- [x] B2 Wallet & Gifts + B4 History (15) — `screens/wallet`
- [x] B3 Withdraw (6) — `screens/withdraw`
- [x] C1 Products (4) — `screens/products`
- [x] C2 Games & Challenges (16)
- [x] C3 Invite (3)
- [x] C4 Profile, notifications, WhatsApp (14)

Run: `EXPO_PUBLIC_UI=v3 npx expo start` (long-press the Home avatar → demo states).
