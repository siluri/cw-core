# {{CUSTOMER_NAME}}

Customer website scaffolded from `@cw/cli` using the `customer-starter` template.

## Stack

- [Astro 5](https://astro.build/) — static site generator
- [Tailwind CSS v4](https://tailwindcss.com/) — utility-first styling (`@theme` tokens)
- [@cw/core](https://github.com/siluri/cw-core) — shared Blitzsicht components
- [@cw/manifest](https://github.com/siluri/cw-core) — typed SSOT schema (Zod)

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321).

## Customization

1. **Edit `src/data/site-data.ts`** — this is the Single Source of Truth (SSOT).
   Every `{{FILL_ME}}` placeholder must be replaced with real values before launch.
2. **Brand colors** — edit `src/styles/global.css` (`@theme` block).
3. **Legal** — replace placeholder `legal.*` fields with real Impressum data.
4. **Contact form** — register at [web3forms.com](https://web3forms.com/) and paste
   the access key into `site-data.ts → contact.web3formsKey`.

## Validation

`site-data.ts` validates against `@cw/manifest`'s Zod schema at build time. Run:

```bash
pnpm check
```

Errors point at the exact path (e.g. `legal.email: invalid email`).

## Pages

| Route            | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `/`              | Landing page (Hero, USPs, Leistungen, Pakete) |
| `/kontakt`       | Contact form                                   |
| `/impressum`     | Legal (German TMG §5)                          |
| `/datenschutz`   | Privacy policy                                 |

Add more pages under `src/pages/` following the same `{...landingBaseProps}` pattern.

## Deploy

Push to GitHub → Vercel auto-deploys. See `@cw/cli` docs for `cw init` flow.
