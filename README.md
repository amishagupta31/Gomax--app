# GoMax Android app (mobile-app)

The applicator app is built with Expo (React Native). The final screens are in `src/v3` (Figma “GOMAX – DEV”, page 02). This folder deploys on its own: it doesn't share code with `../admin-web` (the office website) or `../backend` (the API). It only talks to the API over HTTPS.

## Run locally

```bash
npm install
EXPO_PUBLIC_UI=v3 npx expo start          # scan the QR with Expo Go on an Android phone
```

Settings live in `.env` (copy `.env.example`):
- `EXPO_PUBLIC_API_URL`: the API's address. Locally that's `http://<your PC's IP>:8080`, after starting `cd ../backend && npm run dev:local`.
- `EXPO_PUBLIC_UI=v3`: the final app. Leave it unset for the older screens.

## Build and release (Android)

Builds use EAS (Expo Application Services). The profiles are in `eas.json`.

```bash
npm install -g eas-cli && eas login
eas build -p android --profile preview      # APK to install and test on phones
eas build -p android --profile production   # AAB for the Play Store
eas submit -p android --profile production  # uploads to the Play Console (internal track)
```

Before the first build:
- In `eas.json`, replace `https://REPLACE-with-staging-api-url` with the staging API URL (`terraform output api_url` in `../backend/infra/terraform`). Production already points at `https://api.gomax.app`.
- The Android package is `com.gomax.app` (`app.json`). Create the app with that package name in the Play Console.
