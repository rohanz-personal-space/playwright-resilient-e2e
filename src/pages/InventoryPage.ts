import { type Page } from '@playwright/test';
import { ROUTES } from '../config/constants.js';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  private readonly pageTitle = () => this.page.getByTestId('title');
  private readonly inventoryItems = () => this.page.getByTestId('inventory-item');
  private readonly cartBadge = () => this.page.getByTestId('shopping-cart-badge');
  private readonly cartLink = () => this.page.getByTestId('shopping-cart-link');

  private inventoryItem = (itemName: string) =>
    this.inventoryItems().filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: itemName }),
    });

  async isLoaded() {
    await this.pageTitle().waitFor();
  }

  async getTitle() {
    return this.pageTitle().textContent();
  }

  async getItemCount() {
    return this.inventoryItems().count();
  }

  async addItemToCart(itemName: string) {
    await this.inventoryItem(itemName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async getCartBadgeCount() {
    return this.cartBadge().textContent();
  }

  async goToCart() {
    await this.cartLink().click();
    await this.page.waitForURL(`**${ROUTES.CART}`);
  }
}
