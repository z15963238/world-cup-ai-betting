# World Cup AI Pre-Match Advice

World Cup football betting analysis and decision-support tool. The system provides match analysis, confidence, risk, reasons, and options to avoid. It does not execute wagers, connect betting accounts, store bookmaker credentials, or place orders.

## Install

```bash
npm install
```

## How To Open The Site Locally

Use the Windows launcher. It detects bundled Node/npm when PATH is missing, removes stale `.next`, and starts the Next dev server.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

Keep the PowerShell window open. Closing it stops the site.

If port `3000` is occupied, Next may use `3001` or another port. Always use the `Local:` URL printed in the terminal.

## How To Stop An Old Dev Server

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-dev.ps1
```

The stop script checks ports `3000`, `3001`, and `3002`, shows process ids, and only stops confirmed `node` / `next` related processes after you type `YES`.

## Dev Server Troubleshooting

If you see errors like:

- `missing required error components`
- `MODULE_NOT_FOUND .next/server/webpack-runtime.js`
- `GET / 500`

Press `Ctrl+C`, then rerun:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

More details: `docs/DEV_SERVER_TROUBLESHOOTING.md`.

## Verification

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

One-command verification:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```

## Data Update

Dry run:

```bash
node scripts/update-worldcup-data.mjs --dry-run
```

Write JSON data updates:

```bash
node scripts/update-worldcup-data.mjs --write
```

GitHub Actions can run this update script twice per day and commit changed JSON data. Vercel can redeploy after the GitHub push. The script attempts public read-only FIFA/ESPN fetches and falls back to existing JSON if sources fail. Details: `docs/AUTO_UPDATE.md`.

## Data Scope

The MVP uses maintained frontend schedule/advice data with source metadata and validation. Future work should connect official read-only data APIs while preserving validation.

## Deployment Sharing

`localhost` only works on your own computer. To share with friends, deploy to Vercel and share the Vercel URL. Do not publish tokens, secrets, API keys, chat ids, or betting account credentials.

Deployment guide: `docs/DEPLOYMENT.md`.

Current public demo scope:

- Static frontend schedule and AI advice data.
- Schedule and recommendation data stored in JSON for automated maintenance.
- No player API.
- No odds API.
- No betting platform connection.
- No secrets or login required.

## Safety Statement

- This system does not execute wagers.
- This system does not connect to betting accounts.
- All probabilities are estimates.
- No model can guarantee profit.
- Final betting decisions are manual user decisions.
