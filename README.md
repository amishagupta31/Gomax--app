# GoMax Android app (mobile-app)

The applicator app is built with Expo (React Native). The final screens are in `src/v3` (Figma “GOMAX – DEV”, page 02). This folder deploys on its own: it doesn't share code with `../admin-web` (the office website) or `../backend` (the API). It only talks to the API over HTTPS.

## Run locally

```bash
cd ../backend && npm run dev:local        # API with local demo data, in its own terminal
npx expo start                            # press a for the Android emulator, or scan the QR with Expo Go
```

Demo login: `98765 43210` / `gomax123`. The API prints a few demo coupon codes when it first creates its data.

Settings live in `.env` (copy `.env.example`):
- `EXPO_PUBLIC_API_URL`: the API's address. In a dev run, `localhost` is switched automatically to the PC running Expo, so a phone or emulator can reach it. The phone must be on the same Wi-Fi, and Windows Firewall must allow port 8080.
- `EXPO_PUBLIC_UI=v3`: the final app. Leave it unset for the older screens.

The v3 app's calls are in `src/v3/api/`; `client.ts` holds the session and token refresh. Scans made with no internet wait on the phone and are sent on the next refresh.

Not connected to the API yet: the product catalogue (`src/v3/data/products.ts`), the "My journey" level map, the WhatsApp message previews, sign-up OTP, and the WhatsApp password-reset link (reset goes through the helpline for now).

## Build and release (Android)

Builds use EAS (Expo Application Services). The profiles are in `eas.json`.

```bash
npm install -g eas-cli && eas login
eas build -p android --profile preview      # APK to install and test on phones
eas build -p android --profile production   # AAB for the Play Store
eas submit -p android --profile production  # uploads to the Play Console (internal track)
```

Before the first build:
- Testers' phones can't reach your PC, and installed builds block plain `http://`. A build needs the API deployed on an `https://` URL.
- In `eas.json`, replace `https://REPLACE-with-staging-api-url` with the staging API URL (`terraform output api_url` in `../backend/infra/terraform`). Production already points at `https://api.gomax.app`.
- The Android package is `com.gomax.app` (`app.json`). Create the app with that package name in the Play Console.
