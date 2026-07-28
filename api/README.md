# FitPath Cloudflare API

Cloudflare Worker and D1 backend for FitPath accounts, studio membership,
onboarding, approved plan matching, workout logs, and trainer review.

## Local development

```bash
npm install
npm run db:migrate:local
npm run dev
```

The local API runs at `http://127.0.0.1:8787`. The seeded studio invite code is
`FIT2026`.

## Safety and privacy

- Passwords use salted PBKDF2-SHA-256 hashes.
- Session tokens are returned once; D1 stores only their SHA-256 digests.
- Studio invite codes are stored as digests.
- Login throttling stores a temporary digest, not a raw IP address.
- Onboarding stores only the trainer-review safety flag, never a diagnosis.
- All SQL input uses prepared statements.

## Production

The production Worker is deployed at:

```text
https://fitpath-api.hguencavdi.workers.dev
```

`wrangler.jsonc` is connected to the production `fitpath-db` D1 database.
Apply future migrations before deploying:

```bash
npm run db:migrate:remote
npx wrangler deploy
```
