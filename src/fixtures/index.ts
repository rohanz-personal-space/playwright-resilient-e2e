import { test as withDiagnostics } from './diagnostics.js';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { AuthenticationWorkflow } from '../workflows/AuthenticationWorkflow.js';

interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  authenticationWorkflow: AuthenticationWorkflow;
}

export const test = withDiagnostics.extend<PageFixtures>({
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
