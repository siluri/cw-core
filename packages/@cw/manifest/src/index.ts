// @cw/manifest — public API.
//
// Two entry points:
//   1. `manifestSchema` + sub-schemas (Zod) — runtime validation.
//   2. `SiteManifest` + sub-types (TS) — compile-time type-checking.
//
// Consumer usage (customer site):
//
//   import { manifestSchema, type SiteManifest } from '@cw/manifest';
//   import { siteData } from './data/site-data';
//
//   const parsed: SiteManifest = manifestSchema.parse(siteData);

export {
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

export type {
  SiteManifest,
  BrandConfig,
  BrandColors,
  BrandFonts,
  LegalConfig,
  ContactConfig,
  ImagesConfig,
  AnalyticsConfig,
  SeoConfig,
  NavConfig,
  NavItem,
  HeroConfig,
  CtaConfig,
  Leistung,
  Usp,
  ProcessStep,
  Package,
  Testimonial,
  Faq,
  KarriereConfig,
  KarriereBenefit,
  KarriereStelle,
} from './types';
