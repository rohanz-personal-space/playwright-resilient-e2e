import { faker } from '@faker-js/faker';
import { test as base } from '@playwright/test';
import { environment } from '../config/environment.js';
import { TestOrdersClient } from '../api/TestOrdersClient.js';
import { type CreateTestOrder, type TestOrder } from '../contracts/testOrder.js';

interface ApiFixtures {
  ordersClient: TestOrdersClient;
  createTestOrder: (overrides?: Partial<CreateTestOrder>) => Promise<TestOrder>;
}

export const apiTest = base.extend<ApiFixtures>({
  ordersClient: async ({ request }, use) => {
    await use(new TestOrdersClient(request, environment.resilienceBaseURL));
  },

  createTestOrder: async ({ ordersClient }, use) => {
    const createdOrderIds: string[] = [];

    await use(async (overrides = {}) => {
      const order = await ordersClient.create({
        customerName: faker.person.fullName(),
        product: faker.commerce.productName(),
        ...overrides,
      });
      createdOrderIds.push(order.id);
      return order;
    });

    await Promise.all(createdOrderIds.map((id) => ordersClient.delete(id)));
  },
});

export { expect } from '@playwright/test';
