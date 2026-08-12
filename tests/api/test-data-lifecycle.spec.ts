import { apiTest as test, expect } from '../../src/fixtures/api.js';

test.describe('API: managed test data', () => {
  test('creates contract-valid isolated data and registers cleanup @regression', async ({
    createTestOrder,
    ordersClient,
  }) => {
    const createdOrder = await createTestOrder({ product: 'Interview-ready Backpack' });
    const persistedOrder = await ordersClient.get(createdOrder.id);

    expect(persistedOrder).toEqual(createdOrder);
  });
});
