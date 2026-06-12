# Data Source Plan

## Current MVP

- All data is mock TypeScript data stored under `src/lib/data`.
- Odds provider records represent data-source labels only.
- Odds snapshots represent observed or manually entered odds records only.
- The application does not connect to betting accounts and does not execute wagers.

## Allowed Future Inputs

- Manual odds input from Taiwan Sports Lottery, Bet365, Pinnacle, Betfair, or other odds data providers.
- Public fixture data.
- Public team and player data.
- Public injury and availability reports.
- Public or licensed odds feeds, if legally available and permitted by terms.

## Explicitly Out of Scope

- Automatic betting.
- Bookmaker account login.
- Storing usernames or passwords for betting platforms.
- Order execution APIs.
- One-click betting.
- Staking bots or progression systems.

## Integration Principles

- Treat every external source as read-only data.
- Keep provider configuration separate from account credentials.
- Store observed odds snapshots as analysis inputs, not executable orders.
- Display confidence, risk, edge, and reasoning so the user can make a manual decision.
- Preserve a clear statement that no model can guarantee profit.
