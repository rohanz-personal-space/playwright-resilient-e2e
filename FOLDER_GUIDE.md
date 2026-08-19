# Framework Folder Guide

This project is a Playwright-based E2E test framework designed for reliability, maintainability, and resilience testing. Each folder has a specific responsibility so the test suite stays clean even as it grows to thousands of scenarios.

## Root level folders

### .github/
GitHub automation for CI/CD, workflows, and automation rules.

### docs/
Architecture notes, design decisions, and historical documentation for the framework.

### generated-poms/
Generated Page Object Model files created by the POM generator as example or reusable output.

### src/
Core framework source code for pages, fixtures, config, workflow logic, test data, and resilience helpers.

### test-app/
Local application used to simulate controlled failures and validate resilience behavior in a repeatable way.

### test-results/
Raw Playwright output such as traces, artifacts, screenshots, and reports created during test runs.

### tests/
Actual test specifications organized by purpose such as smoke, regression, API, and resilience.

### tools/
Internal automation scripts, lint rules, and helper utilities used to support framework quality.

### playwright-report/
Generated HTML report for test execution results and diagnostics.

### node_modules/
Installed third-party dependencies for the project.

---

## src/ folders

### src/api/
API client code that talks to backend services with typed requests and response handling.

### src/components/
Reusable UI component abstractions that can be composed into Page Objects.

### src/config/
Centralized configuration, URLs, constants, and environment validation used across the framework.

### src/contracts/
Data contracts and schemas that define the expected structure of runtime API payloads.

### src/core/
Base page and shared foundational logic used by all Page Objects.

### src/fixtures/
Playwright fixtures that automatically provide common test dependencies and setup/teardown behavior.

### src/pages/
Page Object Model classes for real application pages, such as login, cart, checkout, and resilience view.

### src/resilience/
Fault profiles and simulated failure scenarios used to test how the app behaves under bad network or server conditions.

### src/utils/
Reusable helper utilities like data generation, quarantine handling, and shared helper logic.

### src/workflows/
Business-level action flows that combine pages and logic without embedding UI details into tests.

---

## tests/ folders

### tests/accessibility/
Tests focused on accessibility validation and WCAG-related checks.

### tests/api/
API-specific tests that validate backend contracts, CRUD flows, and response behavior.

### tests/authenticated/
Tests that reuse login/session state to validate user journeys without repeating authentication steps.

### tests/regression/
Broader end-to-end regression flows that validate critical user journeys over time.

### tests/resilience/
Tests designed to simulate network slowness, request failures, malformed payloads, and retry behavior.

### tests/setup/
Setup/authentication bootstrap tests that prepare browser state for downstream test runs.

### tests/smoke/
Fast, high-signal tests used for quick validation of critical user paths.

### tests/visual/
Visual regression or UI comparison tests used to catch rendering changes.

---

## tools/ folders

### tools/lint/
Linting and validation scripts that enforce repository quality and architectural rules.

### tools/pom-generator/
Generator utility that creates Page Object Model code from actual UI traversal and rules.

---

## Special generated folder summary

### generated-poms/
Example generated Page Object code and metadata produced from a page scan, helpful for standardizing page automation.

### playwright-report/
Human-readable HTML execution report that helps teams investigate failures quickly.

---

## Why do we have both .ts and .js files?

The repo is TypeScript-first, and the .ts files are the real source of logic, while .js files are usually compatibility or generated copies kept for runtime or migration support.

This project is configured as a TypeScript framework in [tsconfig.json](tsconfig.json), and the scripts in [package.json](package.json) validate it with TypeScript checks. That means the expected developer path is to write and maintain code in .ts files.

The .js files exist for practical reasons such as compatibility, legacy support, generated output, or a gradual migration from JavaScript to TypeScript. The team should treat .ts as the authoring source and .js as secondary or derived output unless a specific reason says otherwise.

## Mental model for the team

Think of the framework in layers:

- tests/ = what business scenarios we want to validate
- workflows/ = how the business process works
- pages/ = how the UI is structured
- components/ = reusable UI regions
- fixtures/ = setup and teardown services
- config/ = environment and constants
- resilience/ = failure simulation
- reports/ = evidence and diagnostics

This separation keeps the framework maintainable even when the suite grows to tens of thousands of tests.
