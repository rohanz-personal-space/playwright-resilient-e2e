import { ResilienceLabPageGenerated } from '../../generated-poms/ResilienceLabPage.generated.js';
import { environment } from '../config/environment.js';
/**
 * Human-maintained wrapper around generated UI locators.
 * `status` and `inventoryList` are inherited from the generated base class and
 * exposed as-is — assertions belong in the spec layer (POM_CONTRACT.md), so
 * this wrapper only adds page-level actions and query helpers, not `expect()` calls.
 *
 * `goto()` is overridden rather than left as the generated default: the
 * resilience lab runs on its own origin (`environment.resilienceBaseURL`),
 * separate from the suite's global `baseURL`. The generated `'/'` navigation
 * is only correct if this page is ever traversed under a project whose
 * baseURL already points at the resilience lab; until then, override here.
 */
export class ResilienceLabPage extends ResilienceLabPageGenerated {
    async goto() {
        await this.page.goto(environment.resilienceBaseURL);
    }
    async retryInventory() {
        await this.retryButton.click();
    }
    async getInventoryCount() {
        return this.inventoryList.locator(':scope > *').count();
    }
}
