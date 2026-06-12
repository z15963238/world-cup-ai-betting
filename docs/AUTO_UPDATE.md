# Auto Update

## Current Architecture

GitHub Actions can run `scripts/update-worldcup-data.mjs` on a schedule. The script updates JSON data files, then tests and builds the site. If data changes, GitHub Actions commits back to `main`; Vercel can then deploy from that push.

## Schedule

The workflow runs at:

- 08:00 Taiwan time
- 12:00 Taiwan time
- Manual `workflow_dispatch`

## Data Provider Scope

The current script uses public read-only provider attempts:

- FIFA official scores fixtures
- ESPN fixtures/results

It does not call paid APIs, does not need API keys, and does not log in anywhere.

If data cannot be verified, it must be marked `low` or `unverified`, and the UI should show it as pending. The script must not promote unverified data to `high`.

Provider failures are non-fatal. If FIFA or ESPN is temporarily unavailable, existing JSON is preserved and the site should continue to build.

## Conservative AI Advice

For today's remaining matches, all tomorrow matches, and matches in the next 48 hours, the update script can add or normalize a conservative AI advice placeholder if one does not already exist.

Rules:

- Confidence stays low.
- The reasoning explicitly says odds data is pending.
- Starting lineup and injury information are marked pending.
- No stake guidance.
- No automatic wagering.
- Existing recommendations are not overwritten.

## Safety

- No paid API.
- No API key.
- No bookmaker login.
- No automatic betting.
- No token output.
- Existing high-confidence verified records are not deleted.

## Future Provider Swap

Future read-only providers such as API-Football or Sportmonks can replace `scripts/providers/*.mjs`. Keep validation and confidence downgrades in place.
