// Main CLI router. Wires commands into commander and exposes `run()` for the
// bin entry point (bin/cw.mjs).
import { Command } from 'commander';
import { initCommand } from './commands/init.js';

export async function run(argv: string[]): Promise<void> {
  const program = new Command();

  program
    .name('cw')
    .description('Blitzsicht customer-website CLI')
    .version('0.1.0-alpha');

  program
    .command('init')
    .description('Scaffold a new customer website from the customer-starter template')
    .argument('<slug>', 'customer slug, e.g. "acme-bau" (kebab-case)')
    .option('-n, --name <name>', 'human-readable customer name (defaults to Title-Cased slug)')
    .option('-d, --domain <domain>', 'customer domain (defaults to <slug>.com)')
    .option('--dry-run', 'scaffold locally without creating GitHub repo or pushing', false)
    .option('--skip-install', 'skip pnpm install after scaffolding', false)
    .option('--target <dir>', 'target directory (defaults to ./<slug>)')
    .action(async (slug: string, opts: Record<string, unknown>) => {
      await initCommand({
        slug,
        name: (opts.name as string | undefined) ?? toTitleCase(slug),
        domain: (opts.domain as string | undefined) ?? `${slug}.com`,
        dryRun: Boolean(opts.dryRun),
        skipInstall: Boolean(opts.skipInstall),
        target: opts.target as string | undefined,
      });
    });

  await program.parseAsync(argv);
}

function toTitleCase(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
