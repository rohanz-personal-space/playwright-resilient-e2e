# playwright-resilient-e2e

A production-grade Playwright TypeScript framework focused on reliable E2E testing, controlled failure injection, and actionable diagnostics.

## Why this project exists

| Industry pain point | What breaks in practice | How this framework addresses it |
|---|---|---|
| **Maintenance trap** | Selectors hardcoded in tests; one UI change breaks 50 tests | Page Object Model — every locator lives in one class; tests never contain raw selectors |
| **Flaky tests** | Tests fail intermittently due to timing races, bad waits, or environment noise | `actionability` auto-waits built into every Playwright interaction; `retries: 2` on CI; `trace`+`video` on first retry for instant diagnosis |
| **Test data management** | Tests share static fixtures that corrupt each other; brittle after DB resets | `@faker-js/faker` generates unique data per test run; no shared state between tests |
| **Speed vs quality** | Full suites become slow enough that teams stop running them | Tag-selectable `@smoke` and `@regression` suites plus a three-shard Chromium CI run |
| **Untested failure paths** | Happy-path suites miss slow, unavailable, or malformed dependencies | A deterministic local resilience lab injects latency, HTTP failures, bad payloads, and transient recovery |

---

## Stack

| Layer | Choice |
|---|---|
| Test runner | Playwright 1.49 |
| Language | TypeScript 5.7 |
| Test data | @faker-js/faker 9 |
| CI | GitHub Actions (typecheck + 3-shard Chromium matrix) |
| Target apps | SauceDemo (UI), JSONPlaceholder (API), local resilience lab (fault injection) |

---

## Project structure

```
src/
  config/constants.ts       # Single source of truth — all URLs, routes, credentials
  config/environment.ts     # Zod-validated runtime configuration
  api/TestOrdersClient.ts   # Typed API operations with response validation
  contracts/testOrder.ts    # Runtime API contracts and inferred TypeScript types
  fixtures/api.ts           # API-created test data with automatic cleanup
  pages/                    # Page Object Model — LoginPage, InventoryPage, CartPage, CheckoutPage
  fixtures/index.ts         # Custom Playwright fixtures — auto-instantiates POMs per test
  utils/dataFactory.ts      # Faker-based random test data generation
  resilience/faultProfiles.ts  # Reusable deterministic network failure profiles
  tools/pom-generator/         # Deterministic, non-AI POM generation utility
  generated-poms/              # Example generated POM output

tests/
  setup/auth.setup.ts       # Creates reusable authenticated browser state
  authenticated/            # Tests that consume saved state without UI login
  smoke/login.spec.ts       # @smoke — login happy path + locked-out user error
  regression/checkout.spec.ts  # @regression — full checkout flow + inventory load
  api/users.spec.ts         # @smoke + @regression — JSONPlaceholder CRUD assertions
  resilience/               # @resilience — latency, 503, malformed data, recovery

test-app/                   # Local dependency target used for controlled fault injection

.github/workflows/ci.yml   # Typecheck and 3-shard Chromium matrix with merged report
```

---

## Deterministic POM generation

The repository includes a non-AI POM generator that traverses a page with Playwright and generates a TypeScript Page Object using the repository's `data-test` convention and a deterministic locator priority. See [POM_GENERATOR.md](POM_GENERATOR.md) for the contract, usage, and limitations.

```bash
npm run pom:generate -- --url https://example.test/login --name LoginPage --output src/pages/generated/LoginPage.generated.ts
```

The generator is deliberately conservative: it does not guess business workflows or create fragile selectors when uniqueness cannot be established.

---

## Running tests

```bash
npm ci
npx playwright install chromium

# All tests
npm test

# Smoke only (PR gate — fast)
npm run test:smoke

# Regression suite
npm run test:regression

# API tests
npm run test:api

# Deterministic resilience tests
npm run test:resilience

# Open last HTML report
npm run report
```

---

## CI design

The GitHub Actions workflow first runs TypeScript validation, then executes three Chromium shards in parallel (`1/3`, `2/3`, `3/3`). CI uses Playwright's blob reporter so a final `merge-reports` job can collect the shard results and publish one HTML artifact.

```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3]
    shardTotal: [3]
```

Traces and videos are retained on failure so every flaky failure has a full playback available without rerunning.

---

## Deterministic resilience testing

Public demo systems are useful integration targets, but they cannot be made slow or unhealthy on demand. This repository therefore includes a deliberately small local test application. Playwright routes inject controlled faults into its inventory dependency while the tests verify observable user behavior:

- a loading state remains visible during latency;
- HTTP 503 responses produce a recoverable error state;
- malformed JSON is handled without silently rendering bad data;
- a transient failure succeeds after an explicit retry.

The local application is a test target, not a mock of SauceDemo. Keeping these concerns separate prevents simulated failures from being presented as evidence about behavior the external application does not own.

---

## Authentication, contracts, and test data

The `auth-setup` Playwright project signs in once and saves browser storage state. Only the `authenticated-chromium` project consumes that state, so login tests remain isolated and continue to exercise the real login form.

Runtime URLs and the authentication-state path are validated with Zod when configuration loads. Invalid configuration therefore fails before the suite starts rather than producing misleading navigation errors later.

The local test-order API demonstrates a complete data lifecycle: a fixture creates unique records through a typed client, validates every response against a runtime schema, registers each created identifier, and deletes all registered records during teardown—including when the test assertion fails.

---

## Design decisions

**No magic literals** — every selector, URL, credential, and expected string is a named constant in `src/config/constants.ts`.

**Fixtures over `beforeEach`** — Playwright fixtures compose better than `beforeEach` blocks; they are lazily initialized and automatically torn down.

**`data-test` attribute strategy** — `testIdAttribute: 'data-test'` is set globally in `playwright.config.ts` so `getByTestId()` resolves the correct attribute across the whole suite without per-call overrides.

**Two-tier tagging** — `@smoke` supports fast feedback and `@regression` supports deeper coverage. The same test can carry both tags when it is critical and fast; the current CI workflow executes both tiers.

**Controlled faults over unreliable dependencies** — failure paths run against a local target so their timing and responses are repeatable in parallel and in CI.

**Authentication state is scoped, not global** — only tests that opt into the authenticated project receive saved state; authentication tests always start clean.

**Types do not replace runtime contracts** — external JSON is parsed with Zod before tests use it, because TypeScript cannot validate data received over the network.

**Fixtures own cleanup** — tests request data and never need to remember teardown logic; the fixture tracks and deletes every record it creates.

## Strengthened enterprise POM architecture

The framework now includes:

- `src/core/BasePage.ts` with intentionally thin framework responsibilities.
- `src/workflows/` for reusable business/domain operations outside the POM layer.
- `src/components/` for reusable UI components using composition.
- `POM_CONTRACT.md` defining the enterprise POM contract and deterministic locator policy.
- An enhanced non-AI POM generator that produces Page Objects, component candidates, and a machine-readable `.pom.json` manifest.
- Safe generated output using `.generated.ts` naming so manual POM code is not overwritten.

The architecture is designed with a 50,000-test estate in mind: reuse, change isolation, safe regeneration, worker safety, and clear separation of test intent from UI mechanics.
