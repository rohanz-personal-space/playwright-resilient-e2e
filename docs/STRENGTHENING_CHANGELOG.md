# Framework Strengthening — POM/Architecture POC

## What changed

### 1. Deterministic POM generator v2
- Traverses the page with Playwright.
- Builds an intermediate POM model before writing code.
- Uses a deterministic locator scoring policy.
- Favors semantic locators and skips ambiguous actionable elements rather than inventing positional selectors.
- Detects repeated/meaningful UI regions as component candidates.
- Generates page POMs, component POM candidates, and machine-readable `.pom.json` manifests.
- Uses `.generated.ts` files so human-maintained POMs are not overwritten.
- Supports `--dry-run` and `--strict` modes.

### 2. POM contract
`POM_CONTRACT.md` defines separation of concerns for a large test estate:

`Test -> Workflow -> Page/Component -> Core -> Playwright`

### 3. Thin BasePage
`src/core/BasePage.ts` provides only generic page mechanics. Application/business behavior stays outside BasePage.

### 4. Workflow layer
`src/workflows/` provides a home for reusable business/domain operations so Page Objects do not become business-process containers.

### 5. Component layer
`src/components/common/` starts a composition-based component model for reusable UI regions.

### 6. Fixture integration
A workflow fixture is provided so reusable domain actions can be injected through Playwright's fixture model.

## Why this matters at ~50K tests

The objective is to minimize duplication and change amplification. A UI change should normally affect one authoritative Page/Component representation rather than thousands of tests. Business workflow reuse should happen above POM, and generated code should be safely regenerable.

## Round 2 — review fixes

1. **Doc drift fixed.** `POM_GENERATOR.md` no longer restates locator policy (it now had
   drifted out of sync with `POM_CONTRACT.md`, the v0.1-era doc still listed the old
   testId-first order). It now only covers usage and defers all policy to `POM_CONTRACT.md`.
2. **Workflow layer now dogfooded.** `tests/smoke/login.spec.ts` was migrated to drive
   `authenticationWorkflow` instead of calling `loginPage` directly, proving the
   `Test → Workflow → Page` layering end-to-end rather than leaving it wired but unused.
   `SearchComponent` remains an intentionally-unbound reference example — there's no search
   UI in the current target apps to attach it to — and is now documented as such rather than
   left ambiguous.
3. **Generator: observable-state elements are no longer silently dropped.** Added a
   `STATE_ROLES` set (`status`, `alert`, `list`, `region`, …) captured alongside actionable
   elements, tagged `state` vs `action` in the generated file and manifest, and explicitly
   excluded from `--strict`'s pass/fail check. `ResilienceLabPage.generated.ts` was
   regenerated to include `status` and `inventoryList` again.
4. **Generator bug fix.** `collectModel`'s role computation referenced `el` outside the
   `.map()` callback where it was defined — a `ReferenceError` waiting to happen the first
   time the generator ran against a live page. Typecheck didn't catch it because the code
   runs as a string inside `page.evaluateAll()`, invisible to `tsc`. Fixed.
5. **Resilience spec migrated off raw selectors.** `tests/resilience/network-failures.spec.ts`
   now goes through `ResilienceLabPage` instead of `page.getByRole('status')` etc. — it was
   the one spec violating the framework's own "tests never contain raw selectors" rule.
   Uncovered and fixed a real environment-wiring bug in the process: the generated
   `goto()` navigated to `'/'`, which resolves against the suite's global `baseURL`
   (SauceDemo), not the resilience lab's own origin. Fixed with an explicit override in
   the hand-maintained `ResilienceLabPage` wrapper.
6. **POM contract CI gate added.** `tools/lint/check-pom-contract.mjs` fails the build if a
   spec file calls a raw Playwright locator directly, with an explicit
   `// pom-contract-allow: <reason>` escape hatch for reviewed exceptions. Wired in as a
   required `pom-contract-check` job that `smoke` and `regression` now depend on.

Verified: `tsc --noEmit` passes clean; `npm run lint:pom-contract` passes clean (0 violations
across 8 spec files). Browser-level execution of the suite could not be verified in this
environment (sandboxed network blocks the Chromium binary download) — run `npx playwright
test` in CI or locally before merging to confirm runtime behavior, particularly the
resilience spec's navigation fix.

## POC boundary

This is still a POC. The next maturity steps are:
- production-grade component detection,
- DOM-change diffing and impact analysis,
- generated/manual file protection conventions,
- locator validation against the live page,
- generator unit/integration test coverage,
- large-scale repository conventions and governance.
