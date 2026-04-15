// Env-var validation. Kept separate so commands can declare their requirements
// declaratively and we print a single, helpful error if anything's missing.

export function assertEnv(required: string[]): void {
  const missing = required.filter((k) => !process.env[k] || process.env[k]!.trim() === '');
  if (missing.length === 0) return;

  const lines = [
    `Missing required environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
    '',
    'Setup:',
    '  1. GITHUB_TOKEN — Personal Access Token with "repo" + "workflow" scopes.',
    '     Create at: https://github.com/settings/tokens',
    '  2. VERCEL_TOKEN — Vercel personal token (needed for Phase 3+ deploy automation).',
    '     Create at: https://vercel.com/account/tokens',
    '',
    'Add to ~/.zshrc or ~/.bashrc:',
    '  export GITHUB_TOKEN=ghp_xxxxx',
    '  export VERCEL_TOKEN=xxxxx',
    '',
    'Then: source ~/.zshrc  (or restart your shell)',
  ];
  throw new Error(lines.join('\n'));
}
