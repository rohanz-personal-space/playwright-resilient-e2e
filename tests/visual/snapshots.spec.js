import { test, expect } from '../../src/fixtures/index.js';
import { ROUTES } from '../../src/config/constants.js';
test.describe('Visual: Login page', () => {
    test('login page matches snapshot @regression', async ({ page }) => {
        await page.goto(ROUTES.HOME);
        await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixelRatio: 0.02 });
    });
});
test.describe('Visual: Inventory page', () => {
    test('inventory page matches snapshot @regression', async ({ loginPage, inventoryPage, page }) => {
        await loginPage.goto();
        await loginPage.loginAsStandardUser();
        await inventoryPage.isLoaded();
        await expect(page).toHaveScreenshot('inventory-page.png', { maxDiffPixelRatio: 0.02 });
    });
});
