# @cw/cli — Blitzsicht Customer-Website CLI

Scaffolds new customer websites from the `customer-starter` template.

## Install (monorepo-local)

From the `cw-core` root:

```bash
pnpm install
pnpm --filter @cw/cli build
```

The `cw` binary is then available as `node cli/bin/cw.mjs` or via
`pnpm --filter @cw/cli exec cw ...`.

For a global install (after publish):

```bash
pnpm add -g @cw/cli
cw --help
```

## Commands

### `cw init <slug>`

Scaffolds a new customer website and (by default) creates a private GitHub
repo under `siluri/<slug>`.

```bash
cw init acme-bau                        # full flow: scaffold → install → git → GitHub
cw init acme-bau --dry-run              # scaffold locally, NO GitHub repo
cw init acme-bau --name "ACME Bau GmbH" # override display name
cw init acme-bau --domain acme-bau.de   # override domain
cw init acme-bau --skip-install         # skip pnpm install
cw init acme-bau --target ./customers/acme-bau  # custom target dir
```

**What happens:**

1. Validate `GITHUB_TOKEN` (skipped with `--dry-run`)
2. Validate slug (kebab-case, 3–64 chars)
3. Copy `templates/customer-starter/` → target dir
4. Replace `{{CUSTOMER_NAME}}`, `{{CUSTOMER_SLUG}}`, `{{CUSTOMER_DOMAIN}}` placeholders
5. Run `pnpm install`
6. `git init` + initial commit
7. `gh repo create siluri/<slug> --private --push` (skipped with `--dry-run`)

## Environment setup

### Required for production use (not `--dry-run`)

| Variable        | Purpose                             | Where                                                     |
| --------------- | ----------------------------------- | --------------------------------------------------------- |
| `GITHUB_TOKEN`  | Create GitHub repos via `gh` CLI    | https://github.com/settings/tokens                        |
| `VERCEL_TOKEN`  | Vercel deploy automation (Phase 3+) | https://vercel.com/account/tokens                         |

### Setup steps

1. **Generate `GITHUB_TOKEN`**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Scopes required: `repo`, `workflow`
   - Copy the `ghp_...` token
2. **Generate `VERCEL_TOKEN`**
   - Vercel Dashboard → Settings → Tokens
   - Create a token with appropriate scope for your team
3. **Add to `~/.zshrc` (or `~/.bashrc`)**

   ```bash
   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   export VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   Then: `source ~/.zshrc`

### Alternative: `gh auth login`

Instead of `GITHUB_TOKEN`, you can authenticate interactively:

```bash
brew install gh           # macOS
gh auth login             # follow the browser flow
```

`gh` will pick up the stored token; `cw init` still requires `GITHUB_TOKEN` env
var to be exported to make the setup explicit and scriptable.

### Failure modes

| Symptom                                          | Fix                                                |
| ------------------------------------------------ | -------------------------------------------------- |
| `Missing required environment variable: GITHUB_TOKEN` | Export `GITHUB_TOKEN` (see above)                  |
| `The gh CLI is required`                         | `brew install gh && gh auth login`                 |
| `Target directory already exists`                | Remove it or pick a different slug                 |
| `Invalid slug "..."`                             | Use kebab-case, 3–64 chars, no leading/trailing `-` |

## Overrides

| Env var            | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `CW_TEMPLATE_DIR`  | Override path to `customer-starter/` (useful for tests) |

## Development

```bash
# Type check (no emit)
pnpm --filter @cw/cli check

# Build → dist/
pnpm --filter @cw/cli build

# Smoke test: show help
node cli/bin/cw.mjs --help

# Smoke test: dry-run init
node cli/bin/cw.mjs init customer-test --dry-run --skip-install
```

## Architecture

```
cli/
├── bin/cw.mjs                    # Executable entry (calls dist/index.js)
├── src/
│   ├── index.ts                  # Commander wiring
│   ├── commands/init.ts          # `cw init` implementation
│   └── utils/
│       ├── env.ts                # GITHUB_TOKEN validation
│       ├── github.ts             # gh repo create + spawn helper
│       └── template.ts           # copy + placeholder replacement
└── README.md                     # You are here
```

All logic is kept in `src/` (TypeScript, compiled to `dist/`). The `.mjs` bin
is a thin loader so the CLI runs on vanilla Node ≥20 without a loader flag.
