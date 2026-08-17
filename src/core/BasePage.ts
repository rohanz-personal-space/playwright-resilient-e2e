import { type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  protected async waitForUrl(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url);
  }

  protected async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }
}
