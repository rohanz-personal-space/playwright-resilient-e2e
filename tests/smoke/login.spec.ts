import { test, expect } from '../../src/fixtures/index.js';
import { ROUTES } from '../../src/config/constants.js';

test.describe('Smoke: Login', () => {
  test('standard user can log in @smoke', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    await inventoryPage.isLoaded();
    await expect(page).toHaveURL(ROUTES.INVENTORY);
  });

  test('locked user sees error message @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAs('locked_out_user', 'secret_sauce');
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('locked out');
  });
});
