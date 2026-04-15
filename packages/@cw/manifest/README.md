# @cw/manifest

Zod schema + TypeScript types for the Blitzsicht customer-website **SiteManifest**
(Single Source of Truth per customer site).

## Concept

Every customer site has exactly one `src/data/site-data.ts` file that describes
the entire site: brand, legal/contact, SEO, navigation, blocks (hero,
leistungen, usps, pakete, testimonials, faqs, process steps), and optional
modules (karriere).

`@cw/manifest` defines what that file must look like — at runtime (Zod) and at
compile time (TypeScript).

## Installation

```jsonc
// customer-site/package.json
{
  "dependencies": {
    "@cw/manifest": "workspace:*",
    "zod": "^3.23.0"
  }
}
```

## Usage

### Validate a site's data (build-time guardrail)

```ts
import { manifestSchema } from '@cw/manifest';
import { siteData } from './data/site-data';

const result = manifestSchema.safeParse(siteData);
if (!result.success) {
  console.error('site-data.ts failed schema validation:');
  console.error(result.error.format());
  process.exit(1);
}
```

### Consume typed data in components

```ts
import type { SiteManifest, HeroConfig } from '@cw/manifest';

export function Hero({ hero }: { hero: HeroConfig }) {
  return <h1 set:html={hero.headline} />;
}
```

## Schema overview

| Field          | Required | Notes                                                |
|----------------|----------|------------------------------------------------------|
| `name`         | yes      | Brand name                                           |
| `tagline`      | yes      |                                                      |
| `description`  | yes      |                                                      |
| `url`          | yes      | Must be a valid URL                                  |
| `brand`        | no       | Optional design tokens (most customers use tokens.css) |
| `legal`        | yes      | Impressum data                                       |
| `contact`      | yes      | Email/phone/web3forms/calendly                       |
| `images`       | yes      | ogImage at minimum                                   |
| `analytics`    | no       | Plausible script URL                                 |
| `seo`          | yes      | title/desc/og defaults                               |
| `nav`          | yes      | main + footer sections                               |
| `hero`         | yes      | headline is required                                 |
| `leistungen`   | yes      | min 1                                                |
| `usps`         | yes      | min 1                                                |
| `processSteps` | yes      | min 1                                                |
| `packages`     | yes      | min 1                                                |
| `testimonials` | no       | defaults to `[]`                                     |
| `faqs`         | no       | defaults to `[]`                                     |
| `karriere`     | no       | opt-in module                                        |
| `extensions`   | no       | **Escape hatch — see below**                         |

## The `extensions` escape hatch

Customer-specific fields that don't fit the core schema go under `extensions`:

```ts
export const siteData = {
  // ... core fields ...
  extensions: {
    localLandingCities: ['Regensburg', 'Nuremberg'],
    webinarFunnelId: 'wh-abc-123',
  },
} as const satisfies SiteManifest;
```

Rules:

- `extensions` is **NOT validated** — anything goes.
- If a field here becomes common across 2+ customers, **promote** it into the
  core schema and remove it from `extensions`.
- Phase 3+ tooling (codegen, CLI scaffolding) may ignore `extensions`.

## Passthrough

Every sub-schema also uses `.passthrough()`, so customers can add quirky
inline fields (e.g. a custom `hero.videoUrl`) without needing the
top-level `extensions` object. Use `extensions` only for truly ad-hoc
top-level concepts.

## Versioning

Breaking schema changes bump the MAJOR version and require a migration note
in `CHANGELOG.md`. Additive fields (optional) are MINOR; doc-only changes are
PATCH.

## See also

- `@cw/core` — shared Astro components that consume `SiteManifest`
- `customer-blitzsicht/src/data/site-data.ts` — Customer Zero reference
