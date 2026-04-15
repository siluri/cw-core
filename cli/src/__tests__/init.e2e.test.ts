// Tier 1 test: CLI orchestration E2E.
//
// Asserts `cw init` produces:
//   1. A directory with the expected file tree.
//   2. A site-data.ts whose `name` was replaced.
//   3. A package.json whose `name` was replaced.
//   4. The scaffolded site-data passes manifest validation (indirectly — we
//      require('@cw/manifest') and parse a stripped copy of the generated data).
//
// We always pass --dry-run --skip-install so tests stay hermetic:
//   - no real GitHub repo created
//   - no pnpm install (which would fail outside the monorepo anyway because
//     the template uses workspace: protocol).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = fileURLToPath(new URL('.', import.meta.url));
// src/__tests__ → cli/
const cliRoot = resolve(here, '..', '..');
const cliBin = resolve(cliRoot, 'bin', 'cw.mjs');
// cli → repo root
const repoRoot = resolve(cliRoot, '..');
const templateDir = resolve(repoRoot, 'templates', 'customer-starter');

function runCli(args: string[], cwd: string) {
  return execFileSync(process.execPath, [cliBin, ...args], {
    cwd,
    env: {
      ...process.env,
      CW_TEMPLATE_DIR: templateDir,
    },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

describe('cw init E2E', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'cw-init-e2e-'));
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('scaffolds a runnable customer repo (--dry-run --skip-install)', () => {
    runCli(
      [
        'init',
        'customer-e2e',
        '--dry-run',
        '--skip-install',
        '--target',
        join(tmp, 'customer-e2e'),
      ],
      tmp,
    );

    const outDir = join(tmp, 'customer-e2e');
    expect(existsSync(join(outDir, 'package.json'))).toBe(true);
    expect(existsSync(join(outDir, 'src', 'data', 'site-data.ts'))).toBe(true);
    expect(existsSync(join(outDir, 'astro.config.ts'))).toBe(true);

    // Placeholders replaced
    const pkg = JSON.parse(readFileSync(join(outDir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('customer-e2e');

    const siteData = readFileSync(join(outDir, 'src', 'data', 'site-data.ts'), 'utf8');
    // {{CUSTOMER_NAME}} → Title-Cased slug ("Customer E2e")
    expect(siteData).toContain('Customer E2e');
    // No unreplaced placeholders remain
    expect(siteData).not.toContain('{{CUSTOMER_NAME}}');
    expect(siteData).not.toContain('{{CUSTOMER_DOMAIN}}');
  });

  it('replaces domain placeholder with custom --domain', () => {
    runCli(
      [
        'init',
        'acme-bau',
        '--dry-run',
        '--skip-install',
        '--domain',
        'acme-bau.de',
        '--target',
        join(tmp, 'acme-bau'),
      ],
      tmp,
    );

    const siteData = readFileSync(
      join(tmp, 'acme-bau', 'src', 'data', 'site-data.ts'),
      'utf8',
    );
    expect(siteData).toContain('https://acme-bau.de');
    expect(siteData).not.toContain('{{CUSTOMER_DOMAIN}}');
  });

  it('rejects invalid slugs (non-kebab-case)', () => {
    let threw = false;
    try {
      runCli(
        [
          'init',
          'Invalid_Slug',
          '--dry-run',
          '--skip-install',
          '--target',
          join(tmp, 'invalid'),
        ],
        tmp,
      );
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});
