# Data Accuracy

## Principle

World Cup schedules and final scores must not be invented or casually mocked. Incorrect scores directly damage user trust and can mislead betting analysis.

## Source Priority

1. FIFA official schedule and scores fixtures.
2. Reliable sports media such as ESPN, Reuters, Guardian, or Sky Sports.
3. Other sources may only support manual review and must not override official data.

## Required Metadata

Every schedule record must include:

- `sourceName`
- `sourceUrl`
- `lastVerifiedAt`
- `dataConfidence`

If a record is not verified, set `dataConfidence` to `pending`. The UI must show that data as pending or unconfirmed instead of pretending it is confirmed.

## Finished Matches

Finished matches must have a final score. The score must be cross-checked before being marked as high confidence.

For v1.4.3:

- Mexico vs South Africa: `2 - 0`
- South Korea vs Czechia: `2 - 1`

For v1.4.5, the next verified fixtures were corrected to:

- Canada vs Bosnia and Herzegovina
- USA vs Paraguay
- Qatar vs Switzerland
- Brazil vs Morocco
- Haiti vs Scotland
- Australia vs Turkiye

The incorrect placeholder fixtures `Canada vs Japan` and `USA vs Ghana` must not be reintroduced unless a high-confidence official FIFA source explicitly supports them.

## Upcoming Matches

Upcoming matches must not include a final score. If a future fixture is manually maintained before official verification, it should remain `pending`.

## Validation

Keep schedule validation even before connecting a real API. The validator checks duplicate ids, missing kickoff time, invalid Taiwan time formatting, finished matches without scores, unfinished matches with final scores, recommendation references, and score/status mismatches where match data exists.

## Future API Integration

When official API ingestion is added, keep the same validation step after ingestion and before rendering the UI.
