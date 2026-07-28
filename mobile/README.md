# FitPath Mobile

Expo SDK 57 prototype for iPhone, Android, and web.

## Run

```bash
npm install
npm run ios
```

Use studio invite code `FIT2026`.

The app uses the live FitPath API by default:

```text
https://fitpath-api.hguencavdi.workers.dev
```

To use a local Cloudflare Worker instead:

```bash
EXPO_PUBLIC_FITPATH_API_URL=http://127.0.0.1:8787 npm run ios
```

## Included in this prototype

- Seven-step onboarding with safety gate
- E-mail/password account flow with secure native session storage
- Member, trainer, and studio-admin role foundation
- Trainer-approved starter plan or trainer review
- Five-machine route
- QR scanner with machine-list fallback
- Offline female and male machine videos
- Set, repetition, and weight logging
- Local progress dashboard
- German, Turkish, and English language foundation
- Trainer review and publish screen

Accounts, onboarding, plans, workout logs, and trainer reviews synchronize with
the Cloudflare Worker and D1 backend in `../api`. Set
`EXPO_PUBLIC_FITPATH_API_URL` only when a different API endpoint is required.

Real push delivery still requires a production notification setup.
