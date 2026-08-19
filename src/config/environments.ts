import { z } from 'zod';

const environmentSchema = z.object({
  target: z.enum(['demo', 'staging', 'prod-like']).default('demo'),
  baseURL: z.url(),
  apiBaseURL: z.url(),
  resilienceBaseURL: z.url(),
  authStatePath: z.string().min(1),
  testIdPrefix: z.string().default('AUTO'),
});

export const environments = environmentSchema.parse({
  target: process.env.TEST_TARGET ?? 'demo',
  baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  apiBaseURL: process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
  resilienceBaseURL: process.env.RESILIENCE_BASE_URL ?? 'http://127.0.0.1:4173',
  authStatePath: process.env.AUTH_STATE_PATH ?? '.auth/standard-user.json',
  testIdPrefix: process.env.TEST_ID_PREFIX ?? 'AUTO',
});
