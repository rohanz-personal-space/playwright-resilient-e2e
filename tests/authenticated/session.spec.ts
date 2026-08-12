import { test, expect } from '../../src/fixtures/index.js';
import { ROUTES } from '../../src/config/constants.js';

test('reuses authenticated state without repeating UI login @regression', async ({
  page,
  inventoryPage,
}) => {
  await page.goto(ROUTES.INVENTORY);

  await inventoryPage.isLoaded();
  await expect(page).toHaveURL(ROUTES.INVENTORY);
});
