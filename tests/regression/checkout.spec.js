import { test, expect } from '../../src/fixtures/index.js';
import { generateCheckoutInfo } from '../../src/utils/dataFactory.js';
import { MESSAGES, PRODUCTS, ROUTES } from '../../src/config/constants.js';
test.describe('Regression: Checkout flow', () => {
    test.beforeEach(async ({ loginPage, inventoryPage }) => {
        await loginPage.goto();
        await loginPage.loginAsStandardUser();
        await inventoryPage.isLoaded();
    });
    test('user can add an item and complete checkout @regression', async ({ inventoryPage, cartPage, checkoutPage, page, }) => {
        await inventoryPage.addItemToCart(PRODUCTS.BACKPACK);
        expect(await inventoryPage.getCartBadgeCount()).toBe('1');
        await inventoryPage.goToCart();
        expect(await cartPage.getItemCount()).toBe(1);
        await cartPage.proceedToCheckout();
        const info = generateCheckoutInfo();
        await checkoutPage.fillShippingInfo(info.firstName, info.lastName, info.postalCode);
        await checkoutPage.finish();
        await expect(page).toHaveURL(ROUTES.CHECKOUT_COMPLETE);
        const header = await checkoutPage.getConfirmationHeader();
        expect(header).toContain(MESSAGES.ORDER_COMPLETE);
    });
    test('inventory page shows products @regression', async ({ inventoryPage }) => {
        const count = await inventoryPage.getItemCount();
        expect(count).toBeGreaterThan(0);
    });
});
