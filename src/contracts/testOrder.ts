import { z } from 'zod';

export const createTestOrderSchema = z.object({
  customerName: z.string().min(1),
  product: z.string().min(1),
});

export const testOrderSchema = createTestOrderSchema.extend({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
});

export type CreateTestOrder = z.infer<typeof createTestOrderSchema>;
export type TestOrder = z.infer<typeof testOrderSchema>;
