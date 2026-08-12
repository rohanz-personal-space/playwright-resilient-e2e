import { test } from '@playwright/test';

export function quarantined(reason: string): void {
  test.skip(!!process.env.CI, `Quarantined on CI: ${reason}`);
}
