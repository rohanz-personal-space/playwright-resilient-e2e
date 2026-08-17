import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../src/core/BasePage.js';

/**
 * GENERATED FILE — do not add business logic here.
 * Regenerate safely; add human-maintained behavior in ResilienceLabPage.ts or a workflow.
 */
export class ResilienceLabPageGenerated extends BasePage {
  /** action | getByRole | score=100 | tag=button */
  readonly retryButton: Locator = this.page.getByRole('button', { name: 'Retry' });

  /** state | getByTestId | score=90 | tag=p */
  readonly status: Locator = this.page.getByTestId('status');

  /** state | getByTestId | score=90 | tag=ul */
  readonly inventoryList: Locator = this.page.getByTestId('inventory-list');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
