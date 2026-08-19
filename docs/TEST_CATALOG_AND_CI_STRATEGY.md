# Test Catalog and CI Strategy

## 1) Production-ready GitHub Actions workflow

This workflow supports the exact requirement for large-scale automation estates: run a single known test, a confidence test group, or a larger suite from GitHub Actions.

```yaml
name: Targeted Playwright Test Run

on:
  workflow_dispatch:
    inputs:
      test_id:
        description: 'Unique test ID to run, for example AUTH-LOGIN-VALID-001'
        required: false
        default: ''
        type: string

      tag:
        description: 'Optional Playwright tag filter, for example @confidence or @resilience'
        required: false
        default: ''
        type: string

      project:
        description: 'Browser project to run'
        required: false
        type: choice
        default: chromium
        options:
          - chromium
          - firefox
          - webkit

      scope:
        description: 'Execution scope'
        required: false
        type: choice
        default: single
        options:
          - single
          - confidence
          - regression
          - full

      workers:
        description: 'Number of Playwright workers'
        required: false
        default: '2'
        type: string

jobs:
  validate:
    name: Validate and prepare
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Validate POM contract
        run: npm run lint:pom-contract

  execute:
    name: Run selected tests
    needs: validate
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ inputs.project }}

      - name: Resolve selector
        id: selector
        shell: bash
        run: |
          TEST_ID="${{ inputs.test_id }}"
          TAG="${{ inputs.tag }}"
          SCOPE="${{ inputs.scope }}"

          if [ -n "$TEST_ID" ]; then
            echo "value=$TEST_ID" >> "$GITHUB_OUTPUT"
          elif [ -n "$TAG" ]; then
            echo "value=$TAG" >> "$GITHUB_OUTPUT"
          elif [ "$SCOPE" = "confidence" ]; then
            echo "value=@confidence" >> "$GITHUB_OUTPUT"
          elif [ "$SCOPE" = "regression" ]; then
            echo "value=@regression" >> "$GITHUB_OUTPUT"
          else
            echo "value=" >> "$GITHUB_OUTPUT"
          fi

      - name: Run targeted Playwright tests
        shell: bash
        env:
          CI: true
        run: |
          SELECTOR="${{ steps.selector.outputs.value }}"
          PROJECT="${{ inputs.project }}"
          WORKERS="${{ inputs.workers }}"

          if [ -n "$SELECTOR" ]; then
            echo "Running selector: $SELECTOR"
            npx playwright test --project="$PROJECT" --grep="$SELECTOR" --workers="$WORKERS"
          else
            echo "Running full suite for project: $PROJECT"
            npx playwright test --project="$PROJECT" --workers="$WORKERS"
          fi

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ inputs.project }}-${{ inputs.scope }}
          path: playwright-report/
          if-no-files-found: ignore
          retention-days: 14
```

This gives you:
- single test rerun by `test_id`
- confidence suite rerun by `@confidence`
- full regression or specific browser project execution
- artifact retention for failure diagnosis

---

## 2) Sample test catalog format

This catalog acts like the registry for a 40,000-test estate. Every test gets a stable ID, business intent, and execution tier.

### Example JSON

```json
{
  "catalogVersion": "1.0",
  "tests": [
    {
      "testId": "AUTH-LOGIN-VALID-001",
      "area": "auth",
      "feature": "login",
      "title": "user can login with valid credentials",
      "tags": ["@smoke", "@confidence"],
      "priority": "P0",
      "owner": "qa-platform",
      "browser": ["chromium", "firefox"],
      "criticality": "high"
    },
    {
      "testId": "CHECKOUT-CONFIRM-013",
      "area": "checkout",
      "feature": "payment confirmation",
      "title": "user confirms checkout and sees order confirmation",
      "tags": ["@regression", "@confidence"],
      "priority": "P0",
      "owner": "checkout-team",
      "browser": ["chromium"],
      "criticality": "high"
    },
    {
      "testId": "RES-503-004",
      "area": "resilience",
      "feature": "retry handling",
      "title": "system recovers after transient 503 response",
      "tags": ["@resilience", "@confidence"],
      "priority": "P1",
      "owner": "platform-eng",
      "browser": ["chromium"],
      "criticality": "medium"
    }
  ]
}
```

### Example Markdown table

| Test ID | Area | Feature | Tags | Criticality | Owner |
|---|---|---|---|---|---|
| AUTH-LOGIN-VALID-001 | auth | login | @smoke, @confidence | high | qa-platform |
| CHECKOUT-CONFIRM-013 | checkout | payment confirmation | @regression, @confidence | high | checkout-team |
| RES-503-004 | resilience | retry handling | @resilience, @confidence | medium | platform-eng |

This allows management to ask:
- which tests are part of the confidence suite?
- which tests are critical?
- which one test needs rerun after a regression?

---

## 3) Executive-facing architecture view

```mermaid
flowchart TB
    A[Business / Management] --> B[Test confidence dashboard]
    B --> C[Critical tests tracked by ID]
    C --> D[GitHub Actions workflow dispatch]

    D --> E[Input: test_id or @confidence or full suite]
    E --> F[Playwright runner]
    F --> G[Test catalog registry]
    G --> H[Selected test(s)]

    H --> I[Browser / API / resilience lab]
    I --> J[Pass / fail results]
    J --> K[Reports + traces + artifacts]
    K --> L[Decision: fix, release, or escalate]

    M[40,000 test estate] --> G
    G --> N[Single test rerun]
    G --> O[Confidence suite]
    G --> P[Full regression]
```

### Executive summary

The framework is designed to do three things at scale:
- run one exact test when needed,
- protect a confidence suite that management trusts,
- run broad regression when the release risk is higher.

This is the right operating model for a large automation estate because it balances speed, reliability, and accountability.
