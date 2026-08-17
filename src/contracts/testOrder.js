import { z } from 'zod';
export const createTestOrderSchema = z.object({
    customerName: z.string().min(1),
    product: z.string().min(1),
});
export const testOrderSchema = createTestOrderSchema.extend({
    id: z.uuid(),
    createdAt: z.iso.datetime(),
});
