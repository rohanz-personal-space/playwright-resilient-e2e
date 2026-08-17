import { test as setup, expect } from '@playwright/test';
import { ROUTES } from '../../src/config/constants.js';
import { environment } from '../../src/config/environment.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
setup('authenticate standard user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    await expect(page).toHaveURL(ROUTES.INVENTORY);
    await page.context().storageState({ path: environment.authStatePath });
});
