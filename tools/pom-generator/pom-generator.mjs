#!/usr/bin/env node
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const ACTIONABLE_ROLES = new Set(['button','link','checkbox','radio','combobox','textbox','tab','switch','menuitem','option']);
// Observable-state roles: not clickable, but routinely the target of assertions
// (loading/error/status text, live counts, alerts). Captured separately from
// actionable elements so they never affect --strict's "no strong locator" check.
const STATE_ROLES = new Set(['status','alert','alertdialog','log','marquee','timer','list','region']);
const DEFAULT_EXCLUDES = new Set(['SCRIPT','STYLE','SVG','NOSCRIPT','HEAD','META','LINK']);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i += 1; }
  }
  return args;
}

function usage() {
  console.log(`\nEnterprise deterministic Playwright POM Generator\n\nUsage:\n  npm run pom:generate -- --url <url> --name <PageName> [options]\n\nOptions:\n  --url <url>                    Page URL (required)\n  --name <PageName>              Generated class name (required)\n  --output-dir <dir>             Generated POM directory (default: generated-poms)\n  --components-dir <dir>         Generated components directory (default: generated-poms/components)\n  --storage-state <file>         Optional Playwright storage state\n  --headless <true|false>        Headless mode (default: true)\n  --executable-path <path>       Optional browser executable path\n  --base-url <url>               Optional base URL\n  --extends-base-page            Generate against BasePage contract\n  --base-page-import <path>      BasePage import path (default: ../src/core/BasePage.js)\n  --strict                       Fail when no strong locator is available\n  --dry-run                      Print model only; do not write generated files\n  --help                         Show help\n`);
}

function assertString(value, name) {
  if (!value || typeof value !== 'string') throw new Error(`Missing required argument: --${name}`);
}

function escapeSingle(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function classNameFromFileName(name) {
  const clean = name.replace(/[^A-Za-z0-9]+/g, ' ').trim();
  if (!clean) return 'GeneratedPage';
  return clean.split(/\s+/).map((part) => part[0].toUpperCase() + part.slice(1)).join('');
}

function pascalToKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function sanitizeIdentifier(value, fallback = 'element') {
  const normalized = String(value ?? '')
    .replace(/&/g, ' and ')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  const candidate = normalized ? normalized[0].toLowerCase() + normalized.slice(1) : fallback;
  return /^[A-Za-z_$]/.test(candidate) ? candidate : `_${candidate}`;
}

function controlSuffix(tag, type, role) {
  const t = String(type || '').toLowerCase();
  const r = String(role || '').toLowerCase();
  if (tag === 'button' || r === 'button') return 'Button';
  if (tag === 'a' || r === 'link') return 'Link';
  if (tag === 'textarea' || r === 'textbox') return 'Input';
  if (tag === 'select' || r === 'combobox') return 'Select';
  if (t === 'checkbox' || r === 'checkbox' || r === 'switch') return 'Checkbox';
  if (t === 'radio' || r === 'radio') return 'Radio';
  if (t === 'date') return 'DateInput';
  if (tag === 'table' || r === 'table' || r === 'grid') return 'Table';
  return '';
}

function countBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

function buildCounts(elements) {
  return {
    testId: countBy(elements, (e) => e.testId),
    roleName: countBy(elements, (e) => e.role && e.accessibleName ? `${e.role}::${e.accessibleName}` : null),
    label: countBy(elements, (e) => e.label),
    placeholder: countBy(elements, (e) => e.placeholder),
    text: countBy(elements, (e) => e.text),
    id: countBy(elements, (e) => e.id),
    name: countBy(elements, (e) => e.name),
  };
}

function candidateScore(strategy, element) {
  const scores = {
    getByRole: 100,
    getByLabel: 95,
    getByTestId: 90,
    getByPlaceholder: 80,
    getByText: 70,
    cssId: 60,
    cssName: 50,
  };
  let score = scores[strategy] ?? 0;
  if (element.dynamic) score -= 15;
  if (element.ambiguousContext) score -= 20;
  return score;
}

function chooseLocator(element, counts) {
  const candidates = [];

  if (element.role && element.accessibleName && ACTIONABLE_ROLES.has(element.role)) {
    const key = `${element.role}::${element.accessibleName}`;
    if (counts.roleName.get(key) === 1) {
      candidates.push({ strategy: 'getByRole', score: candidateScore('getByRole', element), code: `page.getByRole('${escapeSingle(element.role)}', { name: '${escapeSingle(element.accessibleName)}' })` });
    }
  }

  if (element.label && counts.label.get(element.label) === 1 && ['input', 'textarea', 'select'].includes(element.tag)) {
    candidates.push({ strategy: 'getByLabel', score: candidateScore('getByLabel', element), code: `page.getByLabel('${escapeSingle(element.label)}')` });
  }

  if (element.testId && counts.testId.get(element.testId) === 1) {
    candidates.push({ strategy: 'getByTestId', score: candidateScore('getByTestId', element), code: `page.getByTestId('${escapeSingle(element.testId)}')` });
  }

  if (element.placeholder && counts.placeholder.get(element.placeholder) === 1 && ['input', 'textarea'].includes(element.tag)) {
    candidates.push({ strategy: 'getByPlaceholder', score: candidateScore('getByPlaceholder', element), code: `page.getByPlaceholder('${escapeSingle(element.placeholder)}')` });
  }

  if (element.text && ['button', 'a'].includes(element.tag) && counts.text.get(element.text) === 1) {
    candidates.push({ strategy: 'getByText', score: candidateScore('getByText', element), code: `page.getByText('${escapeSingle(element.text)}', { exact: true })` });
  }

  if (element.id && counts.id.get(element.id) === 1 && !/^[-_]?\d+$/.test(element.id)) {
    candidates.push({ strategy: 'cssId', score: candidateScore('cssId', element), code: `page.locator('#${escapeSingle(element.id)}')` });
  }

  if (element.name && counts.name.get(element.name) === 1) {
    candidates.push({ strategy: 'cssName', score: candidateScore('cssName', element), code: `page.locator('[name="${escapeSingle(element.name)}"]')` });
  }

  return candidates.sort((a, b) => b.score - a.score)[0] || null;
}

async function collectModel(page) {
  return page.locator('body *').evaluateAll((nodes) => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const associatedLabel = (el) => {
      if (el.labels?.length) return el.labels[0].innerText?.trim() || null;
      const id = el.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (label) return label.innerText?.trim() || null;
      }
      return null;
    };
    const accessibleName = (el) => {
      const aria = el.getAttribute('aria-label')?.trim();
      if (aria) return aria;
      const labelledBy = el.getAttribute('aria-labelledby');
      if (labelledBy) {
        const text = labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.innerText?.trim()).filter(Boolean).join(' ');
        if (text) return text;
      }
      const label = associatedLabel(el);
      if (label) return label;
      const placeholder = el.getAttribute('placeholder')?.trim();
      if (placeholder) return placeholder;
      const title = el.getAttribute('title')?.trim();
      if (title) return title;
      const text = el.innerText?.replace(/\s+/g, ' ').trim();
      return text ? text.slice(0, 80) : null;
    };
    const computeRole = (el) => el.getAttribute('role') || (() => {
      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (tag === 'button') return 'button';
      if (tag === 'a' && el.getAttribute('href')) return 'link';
      if (tag === 'textarea') return 'textbox';
      if (tag === 'select') return 'combobox';
      if (tag === 'input') {
        if (['button','submit','reset','image'].includes(type)) return 'button';
        if (type === 'checkbox') return 'checkbox';
        if (type === 'radio') return 'radio';
        return 'textbox';
      }
      return null;
    })();
    const nearestRegion = (el) => {
      const candidate = el.closest('[data-test],[data-testid],[role="dialog"],[role="region"],[role="tabpanel"],section,form,fieldset');
      if (!candidate || candidate === el) return null;
      return {
        tag: candidate.tagName.toLowerCase(),
        testId: candidate.getAttribute('data-test') || candidate.getAttribute('data-testid'),
        role: candidate.getAttribute('role'),
        name: candidate.getAttribute('aria-label') || candidate.getAttribute('data-test') || candidate.getAttribute('data-testid'),
      };
    };
    return nodes
      .filter((el) => visible(el))
      .filter((el) => !['SCRIPT','STYLE','SVG','NOSCRIPT','HEAD','META','LINK'].includes(el.tagName))
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type'),
        role: computeRole(el),
        id: el.getAttribute('id'),
        testId: el.getAttribute('data-test') || el.getAttribute('data-testid'),
        name: el.getAttribute('name'),
        placeholder: el.getAttribute('placeholder'),
        title: el.getAttribute('title'),
        label: associatedLabel(el),
        accessibleName: accessibleName(el),
        text: el.innerText?.replace(/\s+/g, ' ').trim()?.slice(0, 80) || null,
        region: nearestRegion(el),
      }));
  });
}

function isActionable(element) {
  return Boolean(element.role && ACTIONABLE_ROLES.has(element.role)) || ['input', 'textarea', 'select', 'button', 'a', 'table'].includes(element.tag);
}

// Observable-state elements: not actionable, but the usual target of test
// assertions (loading/error/status text, live lists, alert banners). Captured
// alongside actionable elements but tracked separately so they never affect
// --strict's "no strong locator" outcome.
function isStateElement(element) {
  if (isActionable(element)) return false;
  if (element.role && STATE_ROLES.has(element.role)) return true;
  return ['ul', 'ol'].includes(element.tag) && Boolean(element.testId || element.id);
}

function dedupeByCode(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.code)) return false;
    seen.add(item.code);
    return true;
  });
}

function dedupeNames(items) {
  const used = new Map();
  return items.map((item) => {
    const base = item.name || 'element';
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    return { ...item, name: count === 0 ? base : `${base}${count + 1}` };
  });
}

function detectComponents(elements) {
  const regions = new Map();
  for (const element of elements) {
    if (!element.region) continue;
    const key = JSON.stringify(element.region);
    const entry = regions.get(key) || { ...element.region, members: 0 };
    entry.members += 1;
    regions.set(key, entry);
  }
  return [...regions.values()]
    .filter((region) => region.testId || region.role || region.members >= 3)
    .sort((a, b) => b.members - a.members)
    .slice(0, 12);
}

function generateBasePageImport(importPath) {
  return importPath || '../src/core/BasePage.js';
}

function generateSource({ className, url, locators, components, basePageImport, extendsBasePage }) {
  const generatedClassName = `${className}Generated`;
  const imports = [`import { type Page, type Locator } from '@playwright/test';`];
  if (extendsBasePage) imports.push(`import { BasePage } from '${generateBasePageImport(basePageImport)}';`);
  const classDecl = extendsBasePage ? `export class ${generatedClassName} extends BasePage {` : `export class ${generatedClassName} {`;
  const ctor = extendsBasePage ? `  constructor(page: Page) {\n    super(page);\n  }` : `  constructor(protected readonly page: Page) {}`;
  const locatorLines = locators.length ? locators.map((item) => `  /** ${item.kind ?? 'action'} | ${item.strategy} | score=${item.score} | tag=${item.tag} */\n  readonly ${item.name}: Locator = ${item.code};`).join('\n\n') : '  // No strong unique locators were discovered.';
  const componentComment = components.length ? `\n\n  /** Component candidates discovered during traversal:\n${components.map((c) => `   * - ${c.name || c.testId || c.role || 'region'} (${c.members} interactive descendants)`).join('\n')}\n   */` : '';
  const gotoMethod = `\n\n  async goto(): Promise<void> {\n    await this.page.goto('${escapeSingle(url)}');\n  }`;
  return `${imports.join('\n')}\n\n${classDecl}\n${ctor}\n\n${locatorLines}${componentComment}${gotoMethod}\n}\n`;
}

function generateComponentSource({ name, region, locators }) {
  const className = `${classNameFromFileName(name)}Component`;
  const locatorLines = locators.length ? locators.map((item) => `  readonly ${item.name}: Locator = ${item.code};`).join('\n\n') : '  // No strong unique locators discovered inside this component.';
  return `import { type Locator, type Page } from '@playwright/test';\n\nexport class ${className} {\n  constructor(private readonly page: Page) {}\n\n${locatorLines}\n}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return usage();
  assertString(args.url, 'url');
  assertString(args.name, 'name');

  const className = classNameFromFileName(args.name);
  const outputDir = args['output-dir'] || 'generated-poms';
  const componentsDir = args['components-dir'] || path.join(outputDir, 'components');
  const headless = args.headless !== 'false';
  const storageState = typeof args['storage-state'] === 'string' ? args['storage-state'] : undefined;
  const baseURL = typeof args['base-url'] === 'string' ? args['base-url'] : undefined;
  const executablePath = typeof args['executable-path'] === 'string' ? args['executable-path'] : undefined;

  const browser = await chromium.launch({ headless, executablePath });
  const context = await browser.newContext({ storageState, baseURL });
  const page = await context.newPage();

  try {
    await page.goto(args.url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const elements = await collectModel(page);
    const counts = buildCounts(elements);
    const selected = [];
    const actionable = elements.filter(isActionable);
    const stateElements = elements.filter(isStateElement);
    const skipped = [];
    const skippedState = [];

    for (const element of actionable) {
      const locator = chooseLocator(element, counts);
      if (!locator) {
        skipped.push({ tag: element.tag, role: element.role, name: element.accessibleName, reason: 'no-strong-unique-locator' });
        continue;
      }
      const semantic = element.label || element.accessibleName || element.testId || element.name || element.placeholder || element.text || element.id || 'element';
      const suffix = controlSuffix(element.tag, element.type, element.role);
      selected.push({
        name: sanitizeIdentifier(`${semantic}${suffix}`),
        code: locator.code,
        score: locator.score,
        strategy: locator.strategy,
        tag: element.tag,
        role: element.role,
        region: element.region,
        kind: 'action',
      });
    }

    for (const element of stateElements) {
      const locator = chooseLocator(element, counts);
      if (!locator) {
        // Not a --strict failure: state elements are best-effort, documented in POM_GENERATOR.md.
        skippedState.push({ tag: element.tag, role: element.role, name: element.accessibleName, reason: 'no-strong-unique-locator' });
        continue;
      }
      const semantic = element.testId || element.accessibleName || element.role || element.id || 'state';
      selected.push({
        name: sanitizeIdentifier(`${semantic}`),
        code: locator.code,
        score: locator.score,
        strategy: locator.strategy,
        tag: element.tag,
        role: element.role,
        region: element.region,
        kind: 'state',
      });
    }

    const locators = dedupeNames(dedupeByCode(selected)).sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));
    const componentRegions = detectComponents(elements);
    const componentObjects = [];

    for (const region of componentRegions) {
      const members = selected.filter((item) => JSON.stringify(item.region) === JSON.stringify(region));
      if (members.length < 2) continue;
      const regionName = region.testId || region.name || region.role || `${className}Region`;
      const componentName = sanitizeIdentifier(regionName, 'Component');
      componentObjects.push({ name: componentName, region, locators: dedupeByCode(members).slice(0, 30) });
    }

    const source = generateSource({
      className,
      url: args.url,
      locators,
      components: componentObjects,
      basePageImport: args['base-page-import'],
      extendsBasePage: Boolean(args['extends-base-page']),
    });

    const model = {
      schemaVersion: '1.0',
      generatedAt: new Date().toISOString(),
      url: args.url,
      pageTitle: await page.title(),
      pageClass: className,
      generatedClass: `${className}Generated`,
      locatorPolicy: ['getByRole','getByLabel','getByTestId','getByPlaceholder','getByText','cssId','cssName'],
      discoveredElements: elements.length,
      actionableElements: actionable.length,
      stateElements: stateElements.length,
      generatedLocators: locators.length,
      skipped,
      skippedState,
      components: componentObjects.map((component) => ({
        name: component.name,
        members: component.locators.length,
        region: component.region,
      })),
      strategies: locators.reduce((acc, item) => { acc[item.strategy] = (acc[item.strategy] || 0) + 1; return acc; }, {}),
    };

    if (args.strict && skipped.length > 0) throw new Error(`Strict mode: ${skipped.length} actionable elements could not receive a strong unique locator.`);

    if (args['dry-run']) {
      console.log(JSON.stringify({ model, source }, null, 2));
      return;
    }

    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(componentsDir, { recursive: true });
    const pageFile = path.join(outputDir, `${pascalToKebab(className)}.generated.ts`);
    const manifestFile = path.join(outputDir, `${pascalToKebab(className)}.pom.json`);
    await fs.writeFile(pageFile, source, 'utf8');
    await fs.writeFile(manifestFile, JSON.stringify(model, null, 2), 'utf8');

    for (const component of componentObjects) {
      const file = path.join(componentsDir, `${pascalToKebab(component.name)}-component.generated.ts`);
      await fs.writeFile(file, generateComponentSource({ name: component.name, region: component.region, locators: component.locators }), 'utf8');
    }

    console.log(`\nGenerated POM: ${path.resolve(pageFile)}`);
    console.log(`Manifest:      ${path.resolve(manifestFile)}`);
    console.log(`Elements:      ${elements.length}`);
    console.log(`Actionable:    ${actionable.length}`);
    console.log(`State:         ${stateElements.length}`);
    console.log(`Locators:      ${locators.length}`);
    console.log(`Components:    ${componentObjects.length}`);
    console.log(`Skipped (action): ${skipped.length}`);
    console.log(`Skipped (state):  ${skippedState.length}`);
    console.log(`Strategies:    ${JSON.stringify(model.strategies)}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error('\nPOM generation failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
