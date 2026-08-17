const INVENTORY_API = '**/api/inventory';
export const faultProfiles = {
    latency: async (page, delayMs) => {
        await page.route(INVENTORY_API, async (route) => {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            await route.continue();
        });
    },
    serviceUnavailable: async (page) => {
        await page.route(INVENTORY_API, (route) => respondWithServiceUnavailable(route));
    },
    malformedResponse: async (page) => {
        await page.route(INVENTORY_API, (route) => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '{"inventory":',
        }));
    },
    failOnce: async (page) => {
        let requestCount = 0;
        await page.route(INVENTORY_API, async (route) => {
            requestCount += 1;
            if (requestCount === 1) {
                await respondWithServiceUnavailable(route);
                return;
            }
            await route.continue();
        });
    },
};
async function respondWithServiceUnavailable(route) {
    await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Inventory service unavailable' }),
    });
}
