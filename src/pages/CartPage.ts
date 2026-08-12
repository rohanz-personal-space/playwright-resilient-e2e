import { type Page } from '@playwright/test';
import { ROUTES } from '../config/constants.js';

export class CartPage {
  constructor(private readonly page: Page) {}

  private readonly cartItems = () => this.page.locator('.cart_item');
  private readonly checkoutButton = () => this.page.getByRole('button', { name: 'Checkout' });

  async getItemCount() {
    return this.cartItems().count();
  }

  async proceedToCheckout() {
    await this.checkoutButton().click();
    await this.page.waitForURL(ROUTES.CHECKOUT_STEP_ONE);
  }
}
