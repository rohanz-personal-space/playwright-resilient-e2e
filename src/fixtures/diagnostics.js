import { test as base } from '@playwright/test';
export const test = base.extend({
    page: async ({ page }, use, testInfo) => {
        const consoleErrors = [];
        const failedRequests = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        page.on('response', (response) => {
            if (response.status() >= 400) {
                failedRequests.push(`${response.status()} ${response.url()}`);
            }
        });
        await use(page);
        if (testInfo.status !== testInfo.expectedStatus) {
            if (consoleErrors.length > 0) {
                await testInfo.attach('console-errors', {
                    body: consoleErrors.join('\n'),
                    contentType: 'text/plain',
                });
            }
            if (failedRequests.length > 0) {
                await testInfo.attach('failed-requests', {
                    body: failedRequests.join('\n'),
                    contentType: 'text/plain',
                });
            }
        }
    },
});
export { expect } from '@playwright/test';
