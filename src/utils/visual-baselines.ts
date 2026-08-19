export type VisualBaselineConfig = {
  platform: 'linux' | 'windows' | 'macos';
  browser: 'chromium' | 'firefox' | 'webkit';
  snapshotDirectory: string;
};

export function createVisualBaselineConfig(config: Partial<VisualBaselineConfig> & { browser: 'chromium' | 'firefox' | 'webkit' }): VisualBaselineConfig {
  return {
    platform: config.platform ?? 'linux',
    browser: config.browser,
    snapshotDirectory: config.snapshotDirectory ?? 'tests/visual/__snapshots__',
  };
}
