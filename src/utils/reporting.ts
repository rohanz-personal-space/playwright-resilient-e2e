export type HistoricalRun = {
  runId: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'flaky';
  durationMs: number;
  passRate: number;
};

export function persistHistoricalRun(run: HistoricalRun): HistoricalRun {
  return {
    ...run,
    timestamp: run.timestamp || new Date().toISOString(),
  };
}

export function summarizeTrends(runs: HistoricalRun[]): { averagePassRate: number; averageDurationMs: number } {
  if (runs.length === 0) {
    return { averagePassRate: 0, averageDurationMs: 0 };
  }

  const totalPass = runs.reduce((sum, run) => sum + run.passRate, 0);
  const totalDuration = runs.reduce((sum, run) => sum + run.durationMs, 0);

  return {
    averagePassRate: totalPass / runs.length,
    averageDurationMs: totalDuration / runs.length,
  };
}
