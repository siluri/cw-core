# cw-core (monorepo)

**Private monorepo for the Blitzsicht customer-website template system.**

Version: `0.1.0-alpha` (pre-release, breaking changes expected).

Consumed as a Git dependency (no npm publish):

```jsonc
{
  "dependencies": {
    "@cw/core": "github:siluri/cw-core#v0.1.0-alpha"
  }
}
```

## Structure

```
cw-core/
├── packages/
│   └── @cw/
│       ├── core/          — Astro components, layouts, blocks, SEO (this package)
│       └── manifest/      — Zod schema for site-data.ts (Phase 2 Task 2.x)
├── cli/                    — `cw init` command (Phase 2 Task 3.x)
├── templates/
│   └── customer-starter/   — Astro boilerplate for new customer sites
├── package.json            — workspace root
├── pnpm-workspace.yaml
└── tsconfig.json           — shared base config
```

## Requirements

- Node 18+
- pnpm 8+ (workspace support required)
- Astro 5, Tailwind v4 (peer dependencies of `@cw/core`)

## Commands

```bash
pnpm install                       # install all workspaces
pnpm build                         # build every package that defines a build script
pnpm --filter @cw/core check       # type-check @cw/core only
pnpm --filter @cw/core build       # build @cw/core only
```

## Versioning

Phase 2 uses Git tags for version pinning. See
[PHASE2-SCOPE.md](../customer-websites/PHASE2-SCOPE.md) for the patch-upgrade
workflow.

- `v1.0.x` tags: legacy flat-layout package (still consumed by
  `customer-blitzsicht` until Phase 2 migration completes).
- `v0.1.0-alpha+` tags: new monorepo layout (this branch).

## Status

- Phase 2 Task 1.1 — repo exists (private, `siluri/cw-core`) ✓
- Phase 2 Task 1.2 — monorepo skeleton (pnpm workspaces) ✓
- Phase 2 Task 1.3 — `@cw/core` package skeleton ✓
- Phase 2 Task 1.4 — extract Hero, Features, CTA, Footer — **next**
