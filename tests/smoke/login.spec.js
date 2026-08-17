import { test, expect } from '../../src/fixtures/index.js';
import { ROUTES, CREDENTIALS } from '../../src/config/constants.js';
test.describe('Smoke: Login', () => {
    test('standard user can log in @smoke', async ({ authenticationWorkflow, inventoryPage, page }) => {
        // Business-level intent lives in the workflow, not in the test or the Page Object.
        await authenticationWorkflow.loginAs(CREDENTIALS.STANDARD_USER.username, CREDENTIALS.STANDARD_USER.password);
        await inventoryPage.isLoaded();
        await expect(page).toHaveURL(ROUTES.INVENTORY);
    });
    test('locked user sees error message @smoke', async ({ authenticationWorkflow, loginPage }) => {
        await authenticationWorkflow.loginAs(CREDENTIALS.LOCKED_USER.username, CREDENTIALS.LOCKED_USER.password);
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('locked out');
    });
});
