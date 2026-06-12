# I18N Notes

## UI Language

The visible web UI is localized to Traditional Chinese for v1.3.2.

Covered areas:

- Navigation
- Disclaimer
- Dashboard
- Match analysis
- Odds
- Players
- Reviews
- Manual input
- Manual analysis detail
- Settings
- Recommendation ranking
- Validation messages
- Empty states
- Buttons
- Table headers
- Badges and labels

## Code Naming

Routes, file names, functions, variables, and TypeScript types remain in English for maintainability.

Examples:

- `/manual-input`
- `/matches/[id]`
- `decisionSupport`
- `riskLevel`
- `confidenceScore`

## Encoding

Files should remain UTF-8. Avoid decorative arrows or unstable symbols in JSX. Use ASCII such as `->` when needed.
