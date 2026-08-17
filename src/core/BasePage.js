export class BasePage {
    page;
    constructor(page) {
        this.page = page;
    }
    async waitForVisible(locator) {
        await locator.waitFor({ state: 'visible' });
    }
    async waitForUrl(url) {
        await this.page.waitForURL(url);
    }
    async click(locator) {
        await locator.click();
    }
    async fill(locator, value) {
        await locator.fill(value);
    }
}
