# Assets

How images are organized in this repo, and how to add more.

## Folders

- `brand/` — logo lockups. Already populated (extracted from the client's logo PDFs):
  - `gomax-logo-full-orange.png` / `gomax-logo-full-navy.png` — full lockup (mark + "GoMax" + tagline), transparent background, for dark/light surfaces respectively.
  - `gomax-mark-orange.png` / `gomax-mark-navy.png` — the triangular mark on its own, transparent background.
- `photos/` — real photography used as screen headers (construction sites, workers). **Currently empty / placeholder graphics are used instead** — see below.
- `illustrations/` — 3D character illustrations (mason, dealer, salesman, birthday couple) and any other custom illustration. **Currently empty / placeholder graphics are used instead** — see below.
- Root `assets/` also holds the Expo app icon files (`icon.png`, `android-icon-*.png`, `favicon.png`) — leave those where they are, Expo's config (`app.json`) points at them directly.

## Why `photos/` and `illustrations/` are empty

Figma's MCP tools can render/screenshot a node, but the raw, full-resolution source image files behind a photo or illustration fill can only be fetched via a direct download URL — and this sandbox's network policy blocks direct requests to figma.com. There's no way around that from here (see `mcp__Figma__download_assets` in the chat for the specific URLs that were blocked).

**To add these assets:** in Figma, select the image layer → Export → PNG (2x or 3x) → save it here (or send it in chat with a `@path` file reference, not a pasted/inline image — inline pastes aren't accessible as files either). Suggested filenames, matching what the code already expects:

- `photos/onboarding-mobile-number.png` — crane/construction site photo (mobile number screen header)
- `photos/onboarding-otp.png` — rebar/workers photo (OTP screen header)
- `illustrations/role-mason.png`, `illustrations/role-dealer.png`, `illustrations/role-salesman.png` — the 3D character per role card
- `illustrations/birthday-couple.png` — the birthday/anniversary illustration

## How images are referenced in code

`src/assets/images.ts` is the single barrel file — it `require()`s everything and exports named constants. Screens import from there, never `require()` a path directly. When you drop a new file into `photos/` or `illustrations/`, add one line to that barrel file and the screen using a placeholder will pick it up — search for `PLACEHOLDER:` comments in `src/screens/onboarding/` to find exactly where.
