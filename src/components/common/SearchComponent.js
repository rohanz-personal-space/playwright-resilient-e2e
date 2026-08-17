/**
 * Reference implementation of the Component Object pattern.
 * Not yet composed into a Page Object — the current target apps (SauceDemo,
 * the local resilience lab) have no search UI to bind it to. Kept here as the
 * pattern example referenced by POM_CONTRACT.md; wire it into a real Page
 * Object the first time a search region actually appears in the app under test.
 */
export class SearchComponent {
    page;
    constructor(page) {
        this.page = page;
    }
    input = () => this.page.getByRole('textbox', { name: /search/i });
    submitButton = () => this.page.getByRole('button', { name: /search/i });
    async search(value) {
        await this.input().fill(value);
        await this.submitButton().click();
    }
}
