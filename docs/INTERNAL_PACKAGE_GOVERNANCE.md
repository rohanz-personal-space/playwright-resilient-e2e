# Internal package governance

This framework is intended to be treated as a governed internal asset rather than a one-off repo-local utility.

## Versioning policy

- Use semantic versioning (`MAJOR.MINOR.PATCH`).
- Breaking changes require a major bump and a documented migration note.
- Test-framework changes that modify selector policy or contract behavior should be treated as potentially breaking.

## Release flow

1. Update the package version with `npm version <major|minor|patch>`.
2. Validate with `npm run validate`.
3. Publish only from a protected default branch.
4. Tag the release and attach release notes describing the traceability and quarantine impact.

## Consumer guidance

- Internal consumers should pin a compatible version range rather than `latest`.
- Each consuming repo should document the framework version it is using.
- Breaking changes should be reviewed at the portfolio level before adoption.

## Governance expectations

- Every released framework version should map to the tests or requirements it affects.
- Quarantine changes and traceability additions are part of the release note review.
- Security and dependency audit results should be retained with the release.
