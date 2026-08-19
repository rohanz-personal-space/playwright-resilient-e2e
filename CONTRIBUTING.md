# Contributing

## Development workflow

1. Install dependencies with `npm ci`.
2. Run `npm run typecheck` before submitting changes.
3. Run the relevant suite for the area you changed.
4. Add test IDs and requirement linkage for new tests whenever applicable.
5. Update quarantine entries when a test is intentionally skipped.

## Coding standards

- TypeScript is required for framework code.
- Follow the repository POM contract in `POM_CONTRACT.md`.
- Keep selectors in the POM layer, not in tests.
- Prefer named constants over magic strings.

## PR requirements

- Include traceability metadata when a test maps to a requirement or Jira item.
- Include a reason for any quarantine change.
- Ensure snapshots are regenerated only on the project-approved browser image.
