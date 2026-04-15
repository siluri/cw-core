#!/usr/bin/env node
// Entry point for the `cw` CLI. Thin wrapper — all logic lives in ./dist
// (compiled from src/). We keep this .mjs so it runs without a separate build
// step on the bin itself.
import { run } from '../dist/index.js';

run(process.argv).catch((err) => {
  // Top-level error guard. Commands should handle their own errors; this
  // catches truly unexpected crashes so users see a clean exit code.
  // eslint-disable-next-line no-console
  console.error('[cw] fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
