import { test } from '@playwright/test';
export function quarantined(reason) {
    test.skip(!!process.env.CI, `Quarantined on CI: ${reason}`);
}
