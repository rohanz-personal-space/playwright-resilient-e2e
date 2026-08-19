import { describe, test, expect } from '@playwright/test';
import { buildTraceabilityMetadata, loadScenarioMatrix, quarantineRegistry } from '../../src/utils/traceability.js';

describe('enterprise governance scaffolding', () => {
  test('builds traceability metadata for individual cases', () => {
    const metadata = buildTraceabilityMetadata({
      testId: 'AUTH-LOGIN-001',
      requirementId: 'REQ-42',
      jiraId: 'CAIZ-118',
      owner: 'identity-team',
    });

    expect(metadata).toMatchObject({
      testId: 'AUTH-LOGIN-001',
      requirementId: 'REQ-42',
      jiraId: 'CAIZ-118',
      owner: 'identity-team',
    });
  });

  test('loads a scenario matrix from JSON data', () => {
    const matrix = loadScenarioMatrix([
      { input: 'standard', expected: 'allowed' },
      { input: 'locked', expected: 'denied' },
    ]);

    expect(matrix).toHaveLength(2);
    expect(matrix[0]).toMatchObject({ input: 'standard', expected: 'allowed' });
  });

  test('quarantine registry tracks expiry and ownership', () => {
    const entry = quarantineRegistry({
      testId: 'AUTH-LOGIN-999',
      owner: 'platform-team',
      reason: 'Known flaky under CI',
      expiresAt: '2027-01-01',
    });

    expect(entry).toMatchObject({
      testId: 'AUTH-LOGIN-999',
      owner: 'platform-team',
      reason: 'Known flaky under CI',
      expiresAt: '2027-01-01',
    });
  });
});
