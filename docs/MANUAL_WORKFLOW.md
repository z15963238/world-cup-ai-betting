# Manual Workflow

## Pre-Match Input

1. Open `/manual-input`.
2. Fill required match fields: match name, competition, kickoff time, home team, and away team.
3. Enter both teams' recent form, xG, xGA, tactical metrics, injury impact, fatigue risk, motivation, and lineup stability.
4. Enter current odds for 1X2, Asian handicap, total goals, BTTS, and corner totals.
5. Enter opening/current movement data and notes.
6. Fix any odds warnings before saving. Decimal odds must be greater than 1.

## Reading The Ranking

- `推薦`: markets with edge >= 0.02 and not High/Avoid risk.
- `觀察`: no-edge, small-edge, or High-risk markets that need manual review.
- `避開`: markets marked Avoid.

Ranking priority is edge high to low, then confidence high to low, then risk low to high.

## Edge, Confidence, And Risk

- Edge compares model probability against market implied probability.
- Confidence is a heuristic quality score, not a guarantee.
- Risk reflects injury, fatigue, uncertainty, negative edge, and warnings.
- High or Avoid risk should not be treated as a primary recommendation.

## Recalculate After Lineups

After confirmed lineups, update injury impact, lineup stability, fatigue risk, tactical fit, and market movement. Re-save the analysis so rankings reflect the latest information.

## Post-Match Review

Open `/manual-input/[id]` from recent analyses and fill:

- finalScore
- hit/miss
- notes

The review result is stored only in browser localStorage.

## Scope Reminder

This workflow is analysis-only. The app does not execute wagers, log in to betting platforms, store betting credentials, or guarantee profit.
