# MVP Status

## Completed

- Next.js App Router project skeleton with TypeScript and Tailwind CSS.
- shadcn-style local UI primitives for cards, badges, and progress bars.
- Dashboard at `/`.
- Match analysis page at `/matches/[id]`.
- Odds movement page at `/odds` with Recharts line charts.
- Player analysis page at `/players`.
- Match review page at `/reviews`.
- Settings and model weight page at `/settings`.
- Manual input page at `/manual-input`.
- Manual analysis detail page at `/manual-input/[id]`.
- Mock data for teams, players, matches, odds snapshots, and odds data providers.
- Manual analysis storage in browser localStorage, capped at the latest 10 records.
- Betting recommendation engine with edge, confidence, risk score, warnings, and bankroll stake guidance.
- Odds math utilities for implied probability, normalized probability, two-way and 1X2 normalization, overround, edge, odds validation, and formatting.
- Market evaluation engine for manual input that ranks 1X2, Asian handicap, total goals, BTTS, and corner total markets.
- Odds movement analyzer with sharp money, fake move, public favorite, over trap, under support, and late shock signals.
- Position fit analyzer with injury, fatigue, form, tactical fit, and mismatch adjustments.
- Prisma schema with Team, Player, Match, OddsProvider, OddsSnapshot, Market, BettingOption, Recommendation, InjuryReport, Lineup, PlayerPositionHistory, MatchReview, and TacticalProfile.
- README with project positioning, install, run, verification, routes, mock-data status, future API scope, and risk statement.
- Data source plan defining current mock data, allowed read-only data inputs, and out-of-scope execution features.
- Manual input guide covering data entry, edge, confidence score, risk level, analysis-only scope, and lineup re-evaluation.
- Windows PowerShell verification entrypoint at `scripts/verify.ps1`, including npm fallback for environments where npm is missing from PATH.
- Manual workflow guide covering pre-match input, ranking interpretation, lineup recalculation, and post-match review.
- v1.3 manual input UX pass: required field markers, odds validation for decimal odds <= 1, NaN-safe numeric parsing, clearer ranking sections, and localStorage review result capture.
- v1.3.1 focused tests added for manual input validation, recommendation ranking, edge labels, and review result storage behavior.
- v1.3.2 Traditional Chinese UI pass completed for visible app text, while preserving English route paths and code identifiers.
- Added `docs/I18N_NOTES.md` to document Traditional Chinese UI scope and English code naming.
- v1.4 simplified the primary UI into a single homepage flow: choose match, generate AI advice, review pick, confidence, reason, avoid list, and pre-bet checklist. Advanced pages remain in the codebase but are no longer exposed in the main navigation.
- v1.4.1 added `scripts/dev.ps1` as a one-command Windows launcher that detects Node/npm like `scripts/verify.ps1`, opens `http://localhost:3000`, and warns when port 3000 is already occupied.
- v1.4.2 refined the homepage into a user-facing AI pre-match advice page, added Taiwan-time schedule formatting, completed-match display, a future schedule section, and deployment guidance.
- v1.4.3 corrected the verified Group A scores, added schedule source metadata, added schedule validation, and documented data accuracy rules.
- v1.4.5 improved dev server stability by clearing stale `.next`, added a safe `scripts/stop-dev.ps1`, corrected upcoming fixtures, and added conservative AI advice for Canada vs Bosnia and Herzegovina and USA vs Paraguay.
- v1.5 prepared the project for public Vercel demo deployment: static frontend data only, no APIs, no secrets, no login, no betting platform integration.
- v1.6 added an automated data update scaffold: JSON schedule/recommendation files, dry-run/write update script, GitHub Actions schedule, and auto-update documentation.

## Bug Fix Pass

- Fixed corrupted JSX text that broke `src/app/page.tsx`, `src/app/reviews/page.tsx`, and `src/app/settings/page.tsx`.
- Replaced corrupted separators and player position arrows in UI output with ASCII-safe text.
- Confirmed the recommendation engine is used by the dashboard and match analysis pages.
- Confirmed the odds chart is used by the odds page and match analysis page.
- Confirmed mock match, team, player, odds snapshot, and provider identifiers line up across UI and engine code.
- Repositioned the MVP as a football betting analysis and decision-support tool that does not execute wagers or connect betting accounts.
- Renamed recommendation output fields from execution-like wording to `suggestedMarket`, `decisionSupport`, and `stakeGuidance`.
- Added a global UI disclaimer: the system does not execute wagers, does not connect betting accounts, provides analysis only, leaves final decisions to the user, and cannot guarantee profit.
- Updated Prisma Recommendation fields to match the decision-support wording.

## Verification

- `npm install`: Passed using a temporary npm CLI with the bundled Codex Node.js runtime.
- `npm run test`: Passed. Smoke test checks forbidden execution-oriented naming, mock data ids, recommendation output fields, odds math source, market evaluation source, normalized probability totals, invalid odds behavior, and overround calculation.
- `npm run lint`: Passed with no ESLint warnings or errors.
- `npm run typecheck`: Passed with `tsc --noEmit`.
- `npm run build`: Passed. Next.js generated `/`, `/_not-found`, `/manual-input`, `/manual-input/[id]`, `/matches/[id]`, `/odds`, `/players`, `/reviews`, and `/settings`.
- `scripts/verify.ps1`: Passed. It ran install, test, lint, typecheck, and build successfully. The npm fallback now extracts npm in `%TEMP%` before copying into repo-local `.cache/`, avoiding Windows `tar.exe` failures in non-ASCII project paths.
- `scripts/verify.ps1`: Cleans stale `.next` output before production build to avoid invalid incremental artifacts.
- `scripts/dev.ps1`: Uses the same Node/npm fallback path as verification, prepends the detected Node.js directory to PATH, starts Next in the foreground, and opens the default local preview URL when port 3000 is available.
- `scripts/focused-tests.mjs`: Covered required field validation, invalid odds, valid odds, NaN-safe numeric parsing, ranking tie-breakers, High/Avoid exclusion, edge labels, and review result save/read/update/clear behavior.
- `scripts/focused-tests.mjs`: Covers UTC to Taiwan-time formatting for the homepage schedule.
- `scripts/smoke-test.mjs`: Validates schedule source metadata, score corrections for Mexico vs South Africa and South Korea vs Czechia, prevents the stale draw score, and checks finished/upcoming score rules.
- `scripts/smoke-test.mjs`: Prevents the incorrect Canada vs Japan and USA vs Ghana fixtures from returning, and verifies Canada vs Bosnia and Herzegovina plus USA vs Paraguay have homepage AI recommendations.
- `npm run build`: Confirms the app can build with the standard Next.js build path used by Vercel.
- `node scripts/update-worldcup-data.mjs --dry-run`: Checks the update path without writing files or contacting paid APIs.
- `npm audit`: Reports 5 dependency-chain vulnerabilities, 1 moderate and 4 high. No automatic `audit fix --force` was applied because it may introduce breaking dependency upgrades outside this bug-fix pass.
- `npm run dev`: Not run during this pass because the request asked for lint, typecheck, and build.

## Manual Acceptance Coverage

- Dashboard shows the mock fixtures and recommendation summaries.
- Argentina vs France and Brazil vs France have match analysis data.
- Recommendations show suggested market, edge, confidence, risk level, stake guidance, reasoning, and warnings.
- Odds page shows movement charts and provider snapshots.
- Players page shows position fit, injury, fatigue, position mismatch, and recent production fields.
- Reviews page shows mock prediction review, CLV, hit status, and model lesson.
- Manual input page allows browser-only match, team, odds, and movement input, then ranks market evaluations.
- Manual analysis detail page reads saved localStorage records and displays original input, rankings, risks, reasoning, and warnings.
- Manual analysis detail page supports local review result fields: finalScore, hit/miss, and notes.
- Settings page shows default weights, total validation, and reset control.

## Next Milestone

- Add unit tests for odds math, position fit, risk scoring, and recommendation thresholds.
- Promote smoke checks into a dedicated test runner when the project grows.
- Replace mock data with API ingestion and a Prisma seed script.
- Review and update dependency versions to address npm audit findings without a forced breaking upgrade.
- Keep all future data integrations read-only unless the product scope is explicitly changed.
- Replace manually maintained schedule data with official API ingestion while preserving validation.

## Known Limitations

- World Cup schedule data is still manually maintained and has not been connected to the FIFA official API.
- Future fixtures marked `pending` must be re-verified before being treated as confirmed.
- Public demo deployment still depends on manually maintained frontend data until official read-only APIs are integrated.
- Auto-update currently uses a provider scaffold and JSON validation; it does not yet fetch live official data.
