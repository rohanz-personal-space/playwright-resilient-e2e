import { createTestOrderSchema, testOrderSchema, } from '../contracts/testOrder.js';
export class TestOrdersClient {
    request;
    baseURL;
    constructor(request, baseURL) {
        this.request = request;
        this.baseURL = baseURL;
    }
    async create(input) {
        const payload = createTestOrderSchema.parse(input);
        const response = await this.request.post(`${this.baseURL}/api/test-orders`, { data: payload });
        if (response.status() !== 201)
            throw new Error(`POST /api/test-orders failed: ${response.status()}`);
        return testOrderSchema.parse(await response.json());
    }
    async get(id) {
        const response = await this.request.get(`${this.baseURL}/api/test-orders/${id}`);
        if (response.status() !== 200)
            throw new Error(`GET /api/test-orders/${id} failed: ${response.status()}`);
        return testOrderSchema.parse(await response.json());
    }
    async delete(id) {
        const response = await this.request.delete(`${this.baseURL}/api/test-orders/${id}`);
        if (response.status() !== 204)
            throw new Error(`DELETE /api/test-orders/${id} failed: ${response.status()}`);
    }
}
