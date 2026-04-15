// `cw init <slug>` — scaffold a new customer website.
//
// Flow:
//   1. Validate env (GITHUB_TOKEN / gh available) unless --dry-run
//   2. Validate slug (kebab-case)
//   3. Copy templates/customer-starter → ./<target>
//   4. Replace {{CUSTOMER_NAME}}, {{CUSTOMER_SLUG}}, {{CUSTOMER_DOMAIN}}
//   5. pnpm install (unless --skip-install)
//   6. git init + first commit
//   7. Create GitHub repo + push (unless --dry-run)
//
// Each step is idempotent-ish: it errors early if the target dir exists so we
// don't stomp work-in-progress.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import pc from 'picocolors';
import { copyTemplate, replacePlaceholders } from '../utils/template.js';
import { assertEnv } from '../utils/env.js';
import { createGithubRepo, runCommand } from '../utils/github.js';

export interface InitOptions {
  slug: string;
  name: string;
  domain: string;
  dryRun: boolean;
  skipInstall: boolean;
  target?: string;
}

export async function initCommand(opts: InitOptions): Promise<void> {
  validateSlug(opts.slug);

  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, opts.target ?? opts.slug);

  // 1. Env check (only when we actually talk to GitHub)
  if (!opts.dryRun) {
    assertEnv(['GITHUB_TOKEN']);
  }

  // 2. Locate template source. Use import.meta.url so this works whether we
  //    run from dist/ or via ts-node; resolve relative to this file.
  const templateDir = locateTemplateDir();

  console.log(pc.cyan(`\n[cw init] ${opts.slug}`));
  console.log(`  name:   ${opts.name}`);
  console.log(`  domain: ${opts.domain}`);
  console.log(`  target: ${targetDir}`);
  console.log(`  dry-run: ${opts.dryRun}\n`);

  // 3. Guard against overwriting existing work
  if (await fs.pathExists(targetDir)) {
    throw new Error(
      `Target directory already exists: ${targetDir}\n` +
        `Remove it first or pick a different slug.`,
    );
  }

  // 4. Copy template
  console.log(pc.dim('→ copying template'));
  await copyTemplate(templateDir, targetDir);

  // 5. Replace placeholders
  console.log(pc.dim('→ replacing placeholders'));
  await replacePlaceholders(targetDir, {
    '{{CUSTOMER_NAME}}': opts.name,
    '{{CUSTOMER_SLUG}}': opts.slug,
    '{{CUSTOMER_DOMAIN}}': opts.domain,
  });

  // 6. pnpm install
  if (!opts.skipInstall) {
    console.log(pc.dim('→ pnpm install'));
    await runCommand('pnpm', ['install'], { cwd: targetDir });
  } else {
    console.log(pc.yellow('⚠ skipping pnpm install (--skip-install)'));
  }

  // 7. git init + first commit
  console.log(pc.dim('→ git init'));
  await runCommand('git', ['init', '-b', 'main'], { cwd: targetDir });
  await runCommand('git', ['add', '.'], { cwd: targetDir });
  await runCommand(
    'git',
    [
      'commit',
      '-m',
      `chore: scaffold ${opts.slug} from customer-starter template`,
    ],
    { cwd: targetDir, allowFail: true }, // may fail if git user not configured
  );

  // 8. GitHub repo + push (skip in dry-run)
  if (!opts.dryRun) {
    console.log(pc.dim(`→ creating siluri/${opts.slug} on GitHub`));
    await createGithubRepo({
      org: 'siluri',
      name: opts.slug,
      cwd: targetDir,
      private: true,
    });
  } else {
    console.log(pc.yellow('⚠ dry-run: skipping GitHub repo creation and push'));
  }

  console.log(
    pc.green(`\n✓ Done. ${pc.bold(`cd ${path.relative(cwd, targetDir)}`)} && pnpm dev`),
  );
}

function validateSlug(slug: string): void {
  if (!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(slug)) {
    throw new Error(
      `Invalid slug "${slug}". Use kebab-case: lowercase letters, digits, and hyphens, 3–64 chars, no leading/trailing hyphen.`,
    );
  }
}

/**
 * Find the customer-starter template directory.
 *
 * Resolution strategy:
 *   1. From dist/: ../../templates/customer-starter (cli/dist → cli → repo root)
 *   2. From src/:  ../../../templates/customer-starter (cli/src/commands → cli → repo root)
 *   3. Env override: CW_TEMPLATE_DIR (useful for testing)
 */
function locateTemplateDir(): string {
  if (process.env.CW_TEMPLATE_DIR) {
    return path.resolve(process.env.CW_TEMPLATE_DIR);
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  // Try from dist/commands → ../..
  const candidates = [
    path.resolve(here, '../../templates/customer-starter'), // dist/commands → cli → repo
    path.resolve(here, '../../../templates/customer-starter'), // nested deeper
    path.resolve(here, '../../../../templates/customer-starter'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'package.json'))) return c;
  }
  throw new Error(
    `Cannot locate customer-starter template. Tried:\n${candidates.map((c) => `  ${c}`).join('\n')}\n` +
      `Set CW_TEMPLATE_DIR to override.`,
  );
}
