// GitHub repo creation + process-exec helper.
//
// We deliberately shell out to `gh` (GitHub CLI) rather than using octokit:
//   - User already has `gh auth login` set up in most cases
//   - No need to bundle auth flow in the CLI
//   - GITHUB_TOKEN is picked up automatically by `gh`
//
// If `gh` is unavailable, we surface a clear error pointing at the install URL.
import { spawn, type SpawnOptions } from 'node:child_process';
import pc from 'picocolors';

export interface RunOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  /** If true, non-zero exit codes are logged but don't throw. */
  allowFail?: boolean;
  /** If true, suppress stdout/stderr pass-through. */
  silent?: boolean;
}

/**
 * Run a subprocess and wait for it to exit. Inherits stdio by default so the
 * user sees pnpm/git progress live.
 */
export async function runCommand(
  cmd: string,
  args: string[],
  opts: RunOptions = {},
): Promise<number> {
  return new Promise((resolve, reject) => {
    const spawnOpts: SpawnOptions = {
      cwd: opts.cwd,
      env: opts.env ?? process.env,
      stdio: opts.silent ? 'ignore' : 'inherit',
      shell: false,
    };
    const child = spawn(cmd, args, spawnOpts);
    child.on('error', (err) => {
      if (opts.allowFail) {
        console.warn(pc.yellow(`⚠ ${cmd} failed to start: ${err.message}`));
        resolve(1);
      } else {
        reject(new Error(`Failed to run ${cmd} ${args.join(' ')}: ${err.message}`));
      }
    });
    child.on('exit', (code) => {
      const exitCode = code ?? 0;
      if (exitCode !== 0 && !opts.allowFail) {
        reject(new Error(`${cmd} ${args.join(' ')} exited with code ${exitCode}`));
        return;
      }
      resolve(exitCode);
    });
  });
}

export interface CreateRepoOptions {
  org: string;
  name: string;
  cwd: string;
  private: boolean;
}

/**
 * Create a GitHub repo using `gh repo create`. The repo is created, the
 * current cwd is set as the source, and an initial push is performed.
 */
export async function createGithubRepo(opts: CreateRepoOptions): Promise<void> {
  await assertGhAvailable();
  const visibility = opts.private ? '--private' : '--public';
  await runCommand(
    'gh',
    [
      'repo',
      'create',
      `${opts.org}/${opts.name}`,
      visibility,
      '--source=.',
      '--push',
      '--remote=origin',
    ],
    { cwd: opts.cwd },
  );
}

async function assertGhAvailable(): Promise<void> {
  try {
    await runCommand('gh', ['--version'], { silent: true });
  } catch {
    throw new Error(
      'The `gh` CLI is required for GitHub repo creation.\n' +
        'Install: https://cli.github.com/\n' +
        'Then: gh auth login  (or set GITHUB_TOKEN)',
    );
  }
}
