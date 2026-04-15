// @cw/manifest — Zod schema for the SiteManifest (SSOT of a customer site).
//
// This schema is derived from customer-blitzsicht/src/data/site-data.ts
// (Blitzsicht = Customer Zero). It MUST validate that file unchanged.
//
// Philosophy:
//   - The schema models the common shape that ALL customer sites share.
//   - Customer-specific quirks go into `extensions` (permissive, unvalidated).
//   - If a field in `extensions` becomes common across customers, PROMOTE it
//     into the core schema — don't leave it quarantined.
//
// Versioning: breaking changes to this schema require a major-version bump of
// @cw/manifest and a migration note in CHANGELOG.md.

import { z } from 'zod';

// ─── Brand ───────────────────────────────────────────────────────────────────

/**
 * Brand colors.
 *
 * At minimum: `primary` and `accent`. Customers can add additional named
 * colors (background, surface, muted, etc.) via the passthrough.
 */
export const brandColorsSchema = z
  .object({
    primary: z.string().min(1).describe('Primary brand color (hex / css color).'),
    accent: z.string().min(1).describe('Accent / CTA color (hex / css color).'),
    background: z.string().optional(),
    surface: z.string().optional(),
    text: z.string().optional(),
    muted: z.string().optional(),
  })
  .passthrough();

/**
 * Brand fonts. System-UI stack is the Blitzsicht default (no Google Fonts / GDPR).
 */
export const brandFontsSchema = z
  .object({
    sans: z.string().optional(),
    serif: z.string().optional(),
    mono: z.string().optional(),
    display: z.string().optional(),
  })
  .passthrough();

/**
 * High-level brand identity. Blitzsicht's site-data puts `name`, `tagline`,
 * `description`, `url` at the ROOT (not under `brand`) — we mirror that
 * shape at the manifest root and leave `brand` optional for future use.
 */
export const brandSchema = z
  .object({
    name: z.string().min(1).optional(),
    colors: brandColorsSchema.optional(),
    fonts: brandFontsSchema.optional(),
    logo: z.string().optional(),
  })
  .passthrough();

// ─── Legal / Impressum ───────────────────────────────────────────────────────

export const legalSchema = z
  .object({
    form: z.string().min(1).describe('Rechtsform (e.g. Einzelunternehmen, GmbH).'),
    owner: z.string().min(1),
    street: z.string().min(1),
    zip: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(2).describe('ISO 3166-1 alpha-2 (DE, AT, CH, ...).'),
    email: z.string().email(),
    phone: z.string().optional().default(''),
    ustIdNr: z.string().optional(),
    handelsregister: z.string().optional(),
    registergericht: z.string().optional(),
  })
  .passthrough();

// ─── Contact ─────────────────────────────────────────────────────────────────

export const contactSchema = z
  .object({
    email: z.string().email(),
    phone: z.string().optional().default(''),
    web3formsKey: z.string().optional().describe('Web3Forms access key for contact forms.'),
    calendlyUrl: z.string().optional().describe('Calendly link for discovery calls (may be empty until provisioned).'),
  })
  .passthrough();

// ─── Images ──────────────────────────────────────────────────────────────────

export const imagesSchema = z
  .object({
    ogImage: z.string().min(1).describe('Default Open Graph image (absolute or /public-relative).'),
    aboutTeam: z.string().optional(),
    gallery: z.array(z.string()).optional().default([]),
  })
  .passthrough();

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsSchema = z
  .object({
    plausibleScript: z
      .string()
      .url()
      .optional()
      .describe('Full URL to Plausible tracking script (cookie-free).'),
  })
  .passthrough();

// ─── SEO ─────────────────────────────────────────────────────────────────────

export const seoSchema = z
  .object({
    titleTemplate: z.string().min(1).describe('Template with %s placeholder, e.g. "%s | Blitzsicht".'),
    defaultTitle: z.string().min(1),
    defaultDescription: z.string().min(1),
    ogImage: z.string().min(1),
  })
  .passthrough();

// ─── Navigation ──────────────────────────────────────────────────────────────

export const navItemSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
    highlight: z.boolean().optional(),
  })
  .passthrough();

export const navSchema = z
  .object({
    main: z.array(navItemSchema).min(1),
    footer: z.object({
      leistungen: z.array(navItemSchema),
      rechtliches: z.array(navItemSchema),
    }),
  })
  .passthrough();

// ─── Hero block ──────────────────────────────────────────────────────────────

export const ctaSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
  })
  .passthrough();

export const heroSchema = z
  .object({
    badge: z.string().optional(),
    headline: z.string().min(1).describe('May contain inline HTML (e.g. <br/>).'),
    subtext: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    ctaPrimary: ctaSchema.optional(),
    ctaSecondary: ctaSchema.optional(),
  })
  .passthrough();

// ─── Leistungen / USPs / ProcessSteps ────────────────────────────────────────

export const leistungSchema = z
  .object({
    icon: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    href: z.string().optional(),
  })
  .passthrough();

export const uspSchema = z
  .object({
    icon: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
  })
  .passthrough();

export const processStepSchema = z
  .object({
    nr: z.string().min(1),
    icon: z.string().min(1),
    title: z.string().min(1),
    desc: z.string().min(1),
  })
  .passthrough();

// ─── Pakete (Pricing) ────────────────────────────────────────────────────────

export const packageSchema = z
  .object({
    name: z.string().min(1),
    subtitle: z.string().optional(),
    pages: z.string().optional().describe('Free-form range like "8–12 Seiten".'),
    priceSetup: z.number().nonnegative(),
    priceMonthly: z.number().nonnegative(),
    features: z.array(z.string()).min(1),
    highlighted: z.boolean().optional().default(false),
  })
  .passthrough();

// ─── Testimonials ────────────────────────────────────────────────────────────

export const testimonialSchema = z
  .object({
    name: z.string().min(1),
    role: z.string().min(1),
    text: z.string().min(1),
    stars: z.number().int().min(1).max(5),
  })
  .passthrough();

// ─── FAQs ────────────────────────────────────────────────────────────────────

export const faqSchema = z
  .object({
    q: z.string().min(1),
    a: z.string().min(1),
  })
  .passthrough();

// ─── Karriere ────────────────────────────────────────────────────────────────

export const karriereBenefitSchema = z
  .object({
    icon: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
  })
  .passthrough();

export const karriereStelleSchema = z
  .object({
    titel: z.string().min(1),
    typ: z.string().min(1),
    beschreibung: z.string().min(1),
  })
  .passthrough();

export const karriereSchema = z
  .object({
    enabled: z.boolean().default(true),
    headline: z.string().min(1),
    subtext: z.string().optional(),
    benefits: z.array(karriereBenefitSchema),
    stellen: z.array(karriereStelleSchema).default([]),
    kontaktEmail: z.string().email(),
  })
  .passthrough();

// ─── Root Manifest ───────────────────────────────────────────────────────────

/**
 * The complete SiteManifest — a Single Source of Truth for one customer site.
 *
 * Shape matches customer-blitzsicht/src/data/site-data.ts (Customer Zero).
 *
 * Every sub-object uses `.passthrough()` so customers can add quirky fields
 * inline without hitting "unrecognized key" errors. For truly ad-hoc, top-level
 * customer quirks, prefer the `extensions` escape hatch below.
 */
export const manifestSchema = z
  .object({
    // ── Identity ──
    name: z.string().min(1),
    tagline: z.string().min(1),
    description: z.string().min(1),
    url: z.string().url(),

    // ── Optional top-level brand object (tokens / design system). Many
    //    customers keep colors in tokens.css and omit this field. ──
    brand: brandSchema.optional(),

    // ── Core sections (match site-data.ts shape 1:1) ──
    legal: legalSchema,
    contact: contactSchema,
    images: imagesSchema,
    analytics: analyticsSchema.optional(),
    seo: seoSchema,
    nav: navSchema,

    // ── Content blocks ──
    hero: heroSchema,
    leistungen: z.array(leistungSchema).min(1),
    usps: z.array(uspSchema).min(1),
    processSteps: z.array(processStepSchema).min(1),
    packages: z.array(packageSchema).min(1),
    testimonials: z.array(testimonialSchema).default([]),
    faqs: z.array(faqSchema).default([]),

    // ── Optional modules ──
    karriere: karriereSchema.optional(),

    /**
     * Customer-specific extensions that don't fit the core schema.
     *
     * Use sparingly — fields here are NOT validated and may break Phase 3+
     * tooling (codegen, page scaffolding, cw CLI). If a field becomes common
     * across customers, promote it into the core schema.
     *
     * Examples of what belongs here:
     *   - one-off landing pages specific to one customer
     *   - experimental blocks not yet standardized
     *   - legacy fields kept for backwards-compat during migration
     */
    extensions: z.record(z.unknown()).optional(),
  })
  .passthrough();
