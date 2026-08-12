import { type APIRequestContext } from '@playwright/test';
import {
  createTestOrderSchema,
  testOrderSchema,
  type CreateTestOrder,
  type TestOrder,
} from '../contracts/testOrder.js';

export class TestOrdersClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  async create(input: CreateTestOrder): Promise<TestOrder> {
    const payload = createTestOrderSchema.parse(input);
    const response = await this.request.post(`${this.baseURL}/api/test-orders`, { data: payload });
    if (response.status() !== 201) throw new Error(`POST /api/test-orders failed: ${response.status()}`);
    return testOrderSchema.parse(await response.json());
  }

  async get(id: string): Promise<TestOrder> {
    const response = await this.request.get(`${this.baseURL}/api/test-orders/${id}`);
    if (response.status() !== 200) throw new Error(`GET /api/test-orders/${id} failed: ${response.status()}`);
    return testOrderSchema.parse(await response.json());
  }

  async delete(id: string): Promise<void> {
    const response = await this.request.delete(`${this.baseURL}/api/test-orders/${id}`);
    if (response.status() !== 204) throw new Error(`DELETE /api/test-orders/${id} failed: ${response.status()}`);
  }
}
