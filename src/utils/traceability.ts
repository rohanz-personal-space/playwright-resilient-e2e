export type TraceabilityMetadata = {
  testId: string;
  requirementId?: string;
  jiraId?: string;
  owner?: string;
  tags?: string[];
};

export function buildTraceabilityMetadata(metadata: Partial<TraceabilityMetadata> & { testId: string }): TraceabilityMetadata {
  return {
    testId: metadata.testId,
    requirementId: metadata.requirementId,
    jiraId: metadata.jiraId,
    owner: metadata.owner,
    tags: metadata.tags ?? [],
  };
}

export function loadScenarioMatrix<T>(rows: T[]): T[] {
  return rows.map((row) => row);
}

export function quarantineRegistry(entry: {
  testId: string;
  owner: string;
  reason: string;
  expiresAt: string;
}) {
  return {
    ...entry,
    status: 'quarantined',
    createdAt: new Date().toISOString(),
  };
}
