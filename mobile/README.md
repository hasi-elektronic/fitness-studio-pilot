# FitPath Mobile

Expo SDK 57 prototype for iPhone, Android, and web.

## Run

```bash
npm install
npm run ios
```

Use studio invite code `FIT2026`.

To connect the mobile app to the local Cloudflare Worker:

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

Without `EXPO_PUBLIC_FITPATH_API_URL`, the app remains usable in local demo
mode and does not store the entered password. With the API URL configured,
accounts, onboarding, plans, workout logs, and trainer reviews synchronize with
the Cloudflare Worker and D1 backend in `../api`.

Real push delivery and production Cloudflare resources still require a
production environment setup.
