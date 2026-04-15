// Template copy + placeholder replacement helpers.
import path from 'node:path';
import fs from 'fs-extra';

const IGNORE_DIRS = new Set(['node_modules', 'dist', '.astro', '.vercel', '.git']);

/**
 * Copy a template directory into the target, skipping node_modules and build
 * artefacts. Uses fs-extra's copy for speed + built-in filter.
 */
export async function copyTemplate(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest, {
    filter: (p) => {
      const base = path.basename(p);
      return !IGNORE_DIRS.has(base);
    },
  });
}

/**
 * Walk every text file in `dir` and replace each placeholder with its value.
 *
 * Binary files (images, fonts) are skipped by extension; this is a pragmatic
 * guard — the template contains none today, but this keeps it safe if OG
 * images get added later.
 */
export async function replacePlaceholders(
  dir: string,
  replacements: Record<string, string>,
): Promise<void> {
  const entries = await walk(dir);
  const keys = Object.keys(replacements);

  for (const filePath of entries) {
    if (isBinary(filePath)) continue;
    const original = await fs.readFile(filePath, 'utf8');
    let modified = original;
    for (const key of keys) {
      if (modified.includes(key)) {
        // Replace ALL occurrences (global). Escape is unnecessary because our
        // placeholder format `{{KEY}}` contains no regex meta we inject.
        modified = modified.split(key).join(replacements[key]!);
      }
    }
    if (modified !== original) {
      await fs.writeFile(filePath, modified, 'utf8');
    }
  }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const stack: string[] = [dir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.pdf', '.zip', '.tar', '.gz',
]);

function isBinary(filePath: string): boolean {
  return BINARY_EXT.has(path.extname(filePath).toLowerCase());
}
