import { test as withDiagnostics } from './diagnostics.js';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { AuthenticationWorkflow } from '../workflows/AuthenticationWorkflow.js';
export const test = withDiagnostics.extend({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
    authenticationWorkflow: async ({ loginPage }, use) => {
        await use(new AuthenticationWorkflow(loginPage));
    },
});
export { expect } from '@playwright/test';
