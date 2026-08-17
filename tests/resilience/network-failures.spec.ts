import { test, expect } from '@playwright/test';
import { faultProfiles } from '../../src/resilience/faultProfiles.js';
import { ResilienceLabPage } from '../../src/pages/ResilienceLabPage.js';

test.describe('Resilience: inventory dependency', () => {
  test('keeps a visible loading state during a slow response @resilience', async ({ page }) => {
    const resilienceLabPage = new ResilienceLabPage(page);
    await faultProfiles.latency(page, 500);

    await resilienceLabPage.goto();
    await expect(resilienceLabPage.status).toHaveText('Loading inventory…');
    await expect(resilienceLabPage.status).toHaveText('2 products available');
  });

  test('exposes a recoverable state for HTTP 503 @resilience', async ({ page }) => {
    const resilienceLabPage = new ResilienceLabPage(page);
    await faultProfiles.serviceUnavailable(page);

    await resilienceLabPage.goto();

    await expect(resilienceLabPage.status).toHaveText('Service unavailable (503)');
    await expect(resilienceLabPage.retryButton).toBeVisible();
  });

  test('handles a malformed dependency response @resilience', async ({ page }) => {
    const resilienceLabPage = new ResilienceLabPage(page);
    await faultProfiles.malformedResponse(page);

    await resilienceLabPage.goto();

    await expect(resilienceLabPage.status).toHaveText(/Unexpected end of JSON input/);
    await expect(resilienceLabPage.retryButton).toBeVisible();
  });

  test('recovers when a transient failure succeeds on retry @resilience', async ({ page }) => {
    const resilienceLabPage = new ResilienceLabPage(page);
    await faultProfiles.failOnce(page);

    await resilienceLabPage.goto();
    await expect(resilienceLabPage.status).toHaveText('Service unavailable (503)');

    await resilienceLabPage.retryInventory();

    await expect(resilienceLabPage.status).toHaveText('2 products available');
    await expect(resilienceLabPage.inventoryList.getByRole('listitem')).toHaveCount(2);
  });
});
