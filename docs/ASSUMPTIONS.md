# Assumptions

## Data

- This MVP uses mock football, player, odds provider, odds snapshot, and review data only.
- Match odds are decimal odds and are generated as snapshots from 24h, 12h, 6h, 3h, 1h, and 30m before kickoff.
- The initial two fixtures are Argentina vs France and Brazil vs France.
- Provider sharpness is a data-source assumption for demonstration, not a real-time rating or account integration.

## Model

- `edge = modelProbability - marketImpliedProbability`.
- `impliedProbability = 1 / decimalOdds`.
- Overround-adjusted market probability is calculated by normalizing all raw implied probabilities inside a market.
- Stake guidance is capped and conservative:
  - Strong edge: analysis cap of 1.5% to 2.0% bankroll
  - Edge: analysis cap of 0.75% to 1.0% bankroll
  - Small edge: analysis cap of 0.25% to 0.5% bankroll
  - No edge: analysis cap of 0%
- Recommendation output is analysis-only decision support. It does not execute wagers, does not connect to betting accounts, and does not guarantee profit.

## Product Scope

- P0 and P1 are implemented with mock data:
  - Dashboard
  - Match analysis
  - Recommendation engine
  - Odds math
  - Risk warning
  - Odds movement chart
  - Player position fit
  - Review page
  - Settings weights page
- Prisma schema is included for future persistence, but the UI currently reads TypeScript mock data.
- Settings inputs are presentational in the MVP. Persisted user overrides can be wired through Zustand or an API route next.
- Odds provider config represents read-only data sources, not betting-platform account integrations.

## Environment

- The current Codex desktop environment exposes `node.exe` through bundled dependencies, but npm/pnpm are not available on PATH.
- Standard `npm run dev`, `npm run build`, `npm run lint`, and `npm run typecheck` scripts are defined for a normal Node.js/npm setup.
