#!/usr/bin/env node
/**
 * POM contract gate (see POM_CONTRACT.md, principle: "Tests own assertions and
 * scenario intent", not raw locators).
 *
 * Fails the build if a spec file under tests/ calls a raw Playwright locator
 * (page.getByRole, page.locator, etc.) directly, instead of going through a
 * Page Object or Component. This is a
 * deliberately simple, dependency-free grep-based check — swap for an ESLint
 * rule if/when the repo adopts a shared lint config across teams.
 *
 * Escape hatch: a line ending in `// pom-contract-allow: <reason>` is exempt.
 * Use sparingly and only with a stated reason — this is reviewed in PRs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const TESTS_DIR = 'tests';
const RAW_LOCATOR_PATTERN = /\bpage\.(getByRole|getByLabel|getByTestId|getByPlaceholder|getByText|locator)\s*\(/;
const ALLOW_COMMENT = /\/\/\s*pom-contract-allow:/;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && /\.spec\.ts$/.test(entry.name)) files.push(full);
  }
  return files;
}

async function main() {
  const specFiles = await walk(TESTS_DIR);
  const violations = [];

  for (const file of specFiles) {
    const content = await fs.readFile(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (RAW_LOCATOR_PATTERN.test(line) && !ALLOW_COMMENT.test(line)) {
        violations.push(`${file}:${index + 1}  ${line.trim()}`);
      }
    });
  }

  if (violations.length > 0) {
    console.error('\nPOM contract violation: raw page locators found in spec files.');
    console.error('Move these into a Page Object or Component (see POM_CONTRACT.md), or add');
    console.error('a `// pom-contract-allow: <reason>` comment if this is a deliberate exception.\n');
    violations.forEach((v) => console.error(`  ${v}`));
    console.error(`\n${violations.length} violation(s) found.`);
    process.exitCode = 1;
    return;
  }

  console.log(`POM contract check passed — ${specFiles.length} spec file(s) scanned, 0 raw locator violations.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
