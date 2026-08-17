import { BasePage } from '../src/core/BasePage.js';
/**
 * GENERATED FILE — do not add business logic here.
 * Regenerate safely; add human-maintained behavior in ResilienceLabPage.ts or a workflow.
 */
export class ResilienceLabPageGenerated extends BasePage {
    /** action | getByRole | score=100 | tag=button */
    retryButton = this.page.getByRole('button', { name: 'Retry' });
    /** state | getByTestId | score=90 | tag=p */
    status = this.page.getByTestId('status');
    /** state | getByTestId | score=90 | tag=ul */
    inventoryList = this.page.getByTestId('inventory-list');
    constructor(page) {
        super(page);
    }
    async goto() {
        await this.page.goto('/');
    }
}
