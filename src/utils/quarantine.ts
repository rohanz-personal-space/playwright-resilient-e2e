import { test } from '@playwright/test';

export type QuarantineEntry = {
  testId: string;
  owner: string;
  reason: string;
  expiresAt: string;
  createdAt: string;
};

export function registerQuarantine(entry: Omit<QuarantineEntry, 'createdAt'>): QuarantineEntry {
  return {
    ...entry,
    createdAt: new Date().toISOString(),
  };
}

export function quarantined(testId: string, owner: string, reason: string, expiresAt: string): void {
  const entry = registerQuarantine({ testId, owner, reason, expiresAt });
  test.skip(!!process.env.CI, `Quarantined on CI: ${entry.testId} (${entry.reason}) owned by ${entry.owner}; expires ${entry.expiresAt}`);
}
