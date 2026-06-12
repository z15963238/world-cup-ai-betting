# Manual Input Guide

## Purpose

The manual input workflow lets a user enter a match, team metrics, odds, and market movement by hand. The browser then generates analysis-only market rankings. It does not connect to betting accounts and does not execute wagers.

## How To Enter A Match

1. Open `/manual-input`.
2. Fill in match information: match name, competition, kickoff time, venue, home team, and away team.
3. Fill in home and away team metrics.
4. Enter current market odds for 1X2, Asian handicap, total goals, BTTS, and corner total.
5. Enter opening and current market movement values.
6. Review the analysis preview.
7. Save the analysis preview if you want it stored in localStorage.

## How To Read Edge

`edge = modelProbability - marketImpliedProbability`.

Positive edge means the model estimate is higher than the market-implied probability. In this MVP, edge below `0.02` is marked as `No edge`.

Edge is not a guarantee. It is only one analysis signal.

## How To Read Confidence Score

`confidenceScore` is a heuristic score from 0 to 100. It considers edge, model probability, and risk score.

Higher confidence means the market is more attractive under the current inputs. It does not mean the outcome is certain.

## How To Read Risk Level

Risk is shown as `Low`, `Medium`, `High`, or `Avoid`.

High-risk or Avoid markets are not placed in the recommended section even if the raw edge is positive. They appear in watchlist or avoid sections so the user can review them manually.

## Why The System Does Not Execute Wagers

This product is an analysis and decision-support tool. It intentionally avoids automatic betting, account login, credential storage, order execution APIs, one-click betting, and staking bots.

The final decision must remain manual because sports markets are uncertain, data can be incomplete, and no model can guarantee profit.

## Why Re-Evaluate After Lineups

Lineups can materially change player availability, tactical fit, injury impact, fatigue risk, and market movement. Re-run the analysis after confirmed lineups, late injury reports, weather updates, and major odds movement.
