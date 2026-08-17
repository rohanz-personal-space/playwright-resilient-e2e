import { BasePage } from '../core/BasePage.js';
import { ROUTES } from '../config/constants.js';
export class InventoryPage extends BasePage {
    constructor(page) {
        super(page);
    }
    pageTitle = () => this.page.getByTestId('title');
    inventoryItems = () => this.page.getByTestId('inventory-item');
    cartBadge = () => this.page.getByTestId('shopping-cart-badge');
    cartLink = () => this.page.getByTestId('shopping-cart-link');
    inventoryItem = (itemName) => this.inventoryItems().filter({
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
    async addItemToCart(itemName) {
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
