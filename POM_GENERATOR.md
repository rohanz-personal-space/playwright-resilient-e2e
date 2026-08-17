# Deterministic Playwright POM Generator — Usage

This is a development-time, non-AI tool that traverses a running page and generates a
TypeScript Page Object aligned to this repository's conventions.

**Policy note:** the generator's locator priority, POM responsibilities, and layering rules
are defined once, in [`POM_CONTRACT.md`](./POM_CONTRACT.md). This file only covers usage —
it deliberately does not restate the policy, so the two documents cannot drift out of sync.
For architecture, see [`docs/POM_GENERATOR_ARCHITECTURE.md`](./docs/POM_GENERATOR_ARCHITECTURE.md).

## Usage

```bash
npm run pom:generate -- \
  --url http://localhost:3000/login \
  --name LoginPage \
  --output-dir generated-poms
```

Optional arguments:

```text
--output-dir <dir>            Generated POM directory (default: generated-poms)
--components-dir <dir>        Generated components directory (default: generated-poms/components)
--storage-state <file>        Use an authenticated browser state
--headless <true|false>       Default: true
--base-url <url>              Set Playwright context baseURL
--executable-path <path>      Browser path for CI/container environments
--extends-base-page           Generate a BasePage subclass
--base-page-import <path>     Import path used with --extends-base-page (default: ../src/core/BasePage.js)
--strict                      Fail when an actionable element has no strong unique locator
--dry-run                     Print the intermediate POM model only; write nothing
```

Example for an authenticated page:

```bash
npm run pom:generate -- \
  --url https://example.test/person \
  --name PersonPage \
  --storage-state .auth/standard-user.json
```

## Output

```text
generated-poms/<Name>.generated.ts              # Page Object
generated-poms/<name>.pom.json                  # Machine-readable manifest of the intermediate model
generated-poms/components/<name>-component.generated.ts   # One file per detected component candidate
```

The manifest records discovered elements, chosen locator strategy per element, and detected
component regions. `.generated.ts` files are never overwritten with business logic; add
human-maintained behavior in a hand-written wrapper class or a workflow, per `POM_CONTRACT.md`.

## Scope note: state vs. action elements

The generator's locator engine targets **actionable** elements (buttons, links, inputs,
etc. — see `ACTIONABLE_ROLES` in `tools/pom-generator/pom-generator.mjs`) plus a small set of
**observable-state** roles (`status`, `alert`, `list`, `region`) that tests routinely assert
on even though they aren't clickable. State locators are written to the generated file as
plain read-only `Locator` properties, separate from action locators, and are not counted
toward `--strict` mode's "no strong locator" failures.

## Important limitations

- Does not infer business workflows from the DOM (no `createClaim()`-style guessing).
- Skips ambiguous/duplicate actionable elements rather than inventing fragile positional
  selectors — fewer correct locators is preferable to fragile ones at 50K-test scale.
- Component detection identifies *candidate* regions; human review before adoption is required.

## 50K-test direction

- production-grade component detection and duplicate-component detection;
- DOM-change diffing and locator impact analysis;
- generator unit/integration test coverage;
- POM quality gates in CI (see the `pom-contract-check` job in `.github/workflows/ci.yml`).
