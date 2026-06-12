# Deployment

## Local Preview

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

Use the `Local:` URL printed by Next.js. If port `3000` is occupied, Next may use `3001` or another port.

## Public Demo Goal

This version is prepared as a public demo that friends can open from a normal web URL.

Current scope:

- Static frontend schedule data.
- Static frontend AI advice data.
- No player API.
- No odds API.
- No betting platform integration.
- No login.
- No secrets or tokens required.
- No automatic wagering or order execution.

## Vercel Deployment

Recommended platform: Vercel.

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Framework preset: Next.js.
4. Install command: `npm install`
5. Build command: `npm run build`
6. Output directory: leave Vercel default.
7. Environment variables: none required for the current public demo.
8. Deploy and share the Vercel URL.

## Deployment Readiness Checklist

- `npm run build` passes.
- The app does not depend on local-only paths.
- The app does not depend on `.cache/npm-cli`.
- The app does not depend on Codex bundled Node.
- The app does not require secrets, tokens, API keys, or login.
- The app does not connect to bookmakers or betting accounts.
- The app does not execute wagers.
- Current data is in frontend static TypeScript data files.

## Localhost Is Not Shareable

`http://localhost:3000` only works on the computer running the dev server. Friends cannot open your localhost URL.

After Vercel deployment, share the Vercel public URL instead.

## Data Accuracy

Schedule data is still manually maintained. Every schedule record should keep source metadata:

- `sourceName`
- `sourceUrl`
- `lastVerifiedAt`
- `dataConfidence`

Do not present unverified data as confirmed. Keep validation active even after future API integration.

## Security Notes

Do not commit or publish:

- tokens
- secrets
- API keys
- chat ids
- betting account credentials

The current demo does not need backend secret keys.
