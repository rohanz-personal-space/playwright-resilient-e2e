import { BasePage } from '../core/BasePage.js';
import { ROUTES } from '../config/constants.js';
export class CartPage extends BasePage {
    constructor(page) {
        super(page);
    }
    cartItems = () => this.page.locator('.cart_item');
    checkoutButton = () => this.page.getByRole('button', { name: 'Checkout' });
    async getItemCount() {
        return this.cartItems().count();
    }
    async proceedToCheckout() {
        await this.checkoutButton().click();
        await this.page.waitForURL(ROUTES.CHECKOUT_STEP_ONE);
    }
}
