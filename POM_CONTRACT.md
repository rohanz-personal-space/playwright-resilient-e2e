# Enterprise Playwright POM Contract v1.0

This contract defines the standard for Page Objects and reusable UI Components for a large Playwright estate.

## Principles

1. **POM represents UI semantics, not test intent.**
2. **Workflow/domain code owns reusable business operations.**
3. **Components own reusable UI regions.**
4. **Tests own assertions and scenario intent.**
5. **BasePage/Core remains thin and infrastructure-focused.**
6. **Locators follow a deterministic, documented priority.**
7. **POMs are stateless and safe for Playwright workers.**
8. **Generated code is deterministic and safely regenerable.**

## Layering

`Test/Spec -> Workflow -> Page/Component -> Core -> Playwright`

## Locator policy

Preferred order:

1. `getByRole`
2. `getByLabel`
3. `getByTestId`
4. `getByPlaceholder`
5. `getByText`
6. stable id/CSS
7. stable name/CSS
8. XPath only when explicitly justified

The generator must skip ambiguous actionable elements rather than inventing fragile positional selectors.

## Page Object responsibilities

A Page Object may contain page navigation, stable locators, page-level actions, page state/query methods, and references to reusable components.

A Page Object must not contain CI/CD logic, environment configuration, test data ownership, or broad business workflows.

## Components

A repeated or independently meaningful UI region should be modeled as a Component Object and composed into Page Objects.

## Assertions

Assertions normally remain in the test/spec layer. Page Objects may expose state/query methods and page-loaded checks.

## Synchronization

Prefer Playwright auto-waiting and web-first assertions. Fixed sleeps are prohibited by convention.

## BasePage

BasePage provides only generic framework behavior such as page access, common waiting/navigation helpers, and low-level interaction primitives. Business functionality must not move into BasePage.

## Generator contract

The generator is a development-time tool. It traverses the page with Playwright, creates an intermediate POM model, applies the locator policy, identifies component candidates, and generates `.generated.ts` files plus a `.pom.json` manifest.

Generated files must never overwrite human-maintained POM files. Human business logic should live outside generated files.

## 50K-test scale requirements

- Prefer one authoritative Page/Component representation per UI structure.
- Avoid locator duplication.
- Avoid global mutable state.
- Support safe regeneration.
- Keep business workflows separate from POM.
- Keep artifacts and test-data strategies external to the POM layer.
