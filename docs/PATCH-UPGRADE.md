# Patch Upgrade Workflow

When `@cw/core` is patched, customer repositories pick up the change through
a tagged subtree-split branch (`release/cw-core`). This keeps the monorepo
layout clean while still giving customer repos a clean `github:`-style URL
that resolves to the package root (not the monorepo root).

## Architecture

```
cw-core (monorepo)
├─ packages/@cw/core/      ← authoring location
├─ packages/@cw/manifest/
└─ cli/

release/cw-core            ← subtree-split branch (auto-generated)
                             content = packages/@cw/core/ at repo root
                             tagged as release/cw-core/v<semver>

customer-<slug>
└─ package.json
   "@cw/core": "github:siluri/cw-core#release/cw-core/v0.1.1"
```

## Maintainer Workflow (siluri)

### 1. Make the change

```bash
cd cw-core
git checkout main
# Fix bug / add feature in packages/@cw/core/
```

### 2. Bump version

```bash
# Patch: 0.1.0 → 0.1.1
pnpm --filter @cw/core version patch

# Minor: 0.1.0 → 0.2.0
pnpm --filter @cw/core version minor
```

### 3. Commit

```bash
git add packages/@cw/core/
git commit -m "fix(@cw/core): <description>"
git push origin main
```

### 4. Split and tag

```bash
# From repo root — regenerates release/cw-core branch from latest main
pnpm release:cw-core

# Push the branch
git push origin release/cw-core

# Tag the release
VERSION=$(node -p "require('./packages/@cw/core/package.json').version")
git tag "release/cw-core/v${VERSION}" release/cw-core
git push origin "release/cw-core/v${VERSION}"
```

The `pnpm release:cw-core` script wraps `git subtree split` so the branch
always has @cw/core at the root, ready for `github:` consumers.

## Customer Workflow (per customer repo)

### 1. Update the dependency

Edit `customer-<slug>/package.json`:

```diff
 {
   "dependencies": {
-    "@cw/core": "github:siluri/cw-core#release/cw-core/v0.1.0-alpha"
+    "@cw/core": "github:siluri/cw-core#release/cw-core/v0.1.1"
   }
 }
```

### 2. Install + verify

```bash
cd customer-<slug>
pnpm install
pnpm build       # astro build — must succeed (0 errors)
pnpm astro check # type-check — must succeed (0 errors)
```

### 3. Commit + deploy

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: bump @cw/core to v0.1.1"
git push
# Vercel auto-deploys from main
```

## Troubleshooting

### "Cannot find module '@cw/core/...'"

The `github:` URL resolved to the monorepo root, not the package. Ensure the
URL references the `release/cw-core/v*` **tag**, not a monorepo commit SHA
or `main`.

### Customer repo reports stale version

pnpm caches git tarballs. Bust it:

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### Breaking changes

Breaking changes require a **major** version bump of `@cw/core`. Coordinate
with live customers before tagging — they need to test the upgrade in a
branch before merging to main.

## Escape hatches

If the subtree-split workflow breaks (e.g. history got rewritten, tag
conflicts), customer repos can temporarily pin to a commit SHA on
`release/cw-core`:

```json
"@cw/core": "github:siluri/cw-core#<sha>"
```

This is a short-term patch — always return to a tagged release for
long-lived customer dependencies.
