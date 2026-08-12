import { test, expect } from '../../src/fixtures/index.js';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from '../../src/config/constants.js';

test.describe('Accessibility', () => {
  test('login page has no critical WCAG violations @smoke', async ({ page }, testInfo) => {
    await page.goto(ROUTES.HOME);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    await testInfo.attach('axe-violations', {
      body: JSON.stringify(
        results.violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })),
        null,
        2,
      ),
      contentType: 'application/json',
    });

    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    expect(
      criticalViolations,
      criticalViolations.map((v) => `${v.id}: ${v.description}`).join('\n'),
    ).toHaveLength(0);
  });

  test('inventory page has no critical WCAG violations @regression', async ({ loginPage, page }, testInfo) => {
    await loginPage.goto();
    await loginPage.loginAsStandardUser();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // SauceDemo's sort <select> has no accessible label — known third-party demo limitation
      .disableRules(['select-name'])
      .analyze();

    await testInfo.attach('axe-violations', {
      body: JSON.stringify(
        results.violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })),
        null,
        2,
      ),
      contentType: 'application/json',
    });

    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    expect(
      criticalViolations,
      criticalViolations.map((v) => `${v.id}: ${v.description}`).join('\n'),
    ).toHaveLength(0);
  });
});
