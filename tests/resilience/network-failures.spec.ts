import { test, expect } from '@playwright/test';
import { faultProfiles } from '../../src/resilience/faultProfiles.js';
import { environment } from '../../src/config/environment.js';

test.describe('Resilience: inventory dependency', () => {
  test('keeps a visible loading state during a slow response @resilience', async ({ page }) => {
    await faultProfiles.latency(page, 500);

    await page.goto(environment.resilienceBaseURL);
    await expect(page.getByRole('status')).toHaveText('Loading inventory…');
    await expect(page.getByRole('status')).toHaveText('2 products available');
  });

  test('exposes a recoverable state for HTTP 503 @resilience', async ({ page }) => {
    await faultProfiles.serviceUnavailable(page);

    await page.goto(environment.resilienceBaseURL);

    await expect(page.getByRole('status')).toHaveText('Service unavailable (503)');
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('handles a malformed dependency response @resilience', async ({ page }) => {
    await faultProfiles.malformedResponse(page);

    await page.goto(environment.resilienceBaseURL);

    await expect(page.getByRole('status')).toHaveText(/Unexpected end of JSON input/);
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('recovers when a transient failure succeeds on retry @resilience', async ({ page }) => {
    await faultProfiles.failOnce(page);

    await page.goto(environment.resilienceBaseURL);
    await expect(page.getByRole('status')).toHaveText('Service unavailable (503)');

    await page.getByRole('button', { name: 'Retry' }).click();

    await expect(page.getByRole('status')).toHaveText('2 products available');
    await expect(page.getByTestId('inventory-list').getByRole('listitem')).toHaveCount(2);
  });
});
