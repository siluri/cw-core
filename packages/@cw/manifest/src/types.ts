// @cw/manifest — TypeScript type aliases derived from the Zod schema.
//
// These are the types customer sites (and @cw/core consumers) should import.
// They stay in lock-step with schema.ts via `z.infer`, so the schema remains
// the Single Source of Truth.

import type { z } from 'zod';
import type {
  manifestSchema,
  brandSchema,
  brandColorsSchema,
  brandFontsSchema,
  legalSchema,
  contactSchema,
  imagesSchema,
  analyticsSchema,
  seoSchema,
  navSchema,
  navItemSchema,
  heroSchema,
  ctaSchema,
  leistungSchema,
  uspSchema,
  processStepSchema,
  packageSchema,
  testimonialSchema,
  faqSchema,
  karriereSchema,
  karriereBenefitSchema,
  karriereStelleSchema,
} from './schema';

/** The complete SiteManifest — the shape a customer's site-data.ts must match. */
export type SiteManifest = z.infer<typeof manifestSchema>;

// ─── Brand ──
export type BrandConfig = z.infer<typeof brandSchema>;
export type BrandColors = z.infer<typeof brandColorsSchema>;
export type BrandFonts = z.infer<typeof brandFontsSchema>;

// ─── Legal / Contact ──
export type LegalConfig = z.infer<typeof legalSchema>;
export type ContactConfig = z.infer<typeof contactSchema>;

// ─── Media / Analytics / SEO ──
export type ImagesConfig = z.infer<typeof imagesSchema>;
export type AnalyticsConfig = z.infer<typeof analyticsSchema>;
export type SeoConfig = z.infer<typeof seoSchema>;

// ─── Navigation ──
export type NavConfig = z.infer<typeof navSchema>;
export type NavItem = z.infer<typeof navItemSchema>;

// ─── Blocks ──
export type HeroConfig = z.infer<typeof heroSchema>;
export type CtaConfig = z.infer<typeof ctaSchema>;
export type Leistung = z.infer<typeof leistungSchema>;
export type Usp = z.infer<typeof uspSchema>;
export type ProcessStep = z.infer<typeof processStepSchema>;
export type Package = z.infer<typeof packageSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Faq = z.infer<typeof faqSchema>;

// ─── Karriere ──
export type KarriereConfig = z.infer<typeof karriereSchema>;
export type KarriereBenefit = z.infer<typeof karriereBenefitSchema>;
export type KarriereStelle = z.infer<typeof karriereStelleSchema>;
