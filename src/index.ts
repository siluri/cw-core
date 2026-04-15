/**
 * @cw/core — package entry point.
 *
 * Astro components (.astro) are consumed via subpath imports:
 *   import Hero from "@cw/core/components/blocks/Hero.astro";
 *   import BaseLayout from "@cw/core/layouts/BaseLayout.astro";
 *   import { submitForm } from "@cw/core/utils/forms/submit";
 *
 * This barrel re-exports the public **types** that component consumers need
 * for typed props (e.g. when wiring `site-data.ts` into a Hero or Footer).
 *
 * Runtime helpers (like `submitForm`) live under their dedicated subpath
 * (`@cw/core/utils/forms/submit`) and are intentionally NOT re-exported here
 * to keep the main entry tree-shakeable and free of side effects.
 */

// ---------------------------------------------------------------------------
// Block component types
// ---------------------------------------------------------------------------
export type { HeroCTA, HeroUSP } from './components/blocks/Hero.astro';
export type { USPItem } from './components/blocks/USPSection.astro';
export type { LeistungItem } from './components/blocks/LeistungenSection.astro';
export type { PaketeItem } from './components/blocks/PaketeSection.astro';
export type { FAQItem } from './components/blocks/FAQ.astro';
export type { Testimonial } from './components/blocks/Testimonials.astro';
export type { ProcessStep } from './components/blocks/ProcessSteps.astro';
export type { BenefitItem } from './components/blocks/ArbeitgeberVorteile.astro';
export type { StelleItem, StelleTyp } from './components/blocks/StellenListe.astro';

// ---------------------------------------------------------------------------
// Layout component types
// ---------------------------------------------------------------------------
export type { FooterLink } from './components/layout/Footer.astro';
export type { NavItem } from './components/layout/Header.astro';

// ---------------------------------------------------------------------------
// Page layout wrapper types
// ---------------------------------------------------------------------------
export type {
  HeaderConfig as ContentPageHeaderConfig,
  FooterConfig as ContentPageFooterConfig,
} from './layouts/ContentPage.astro';
export type {
  HeaderConfig as LandingPageHeaderConfig,
  FooterConfig as LandingPageFooterConfig,
} from './layouts/LandingPage.astro';
export type { SchemaProps } from './layouts/BaseLayout.astro';

// ---------------------------------------------------------------------------
// Forms / utilities
// ---------------------------------------------------------------------------
export type { SubmitOptions, SubmitResult } from './utils/forms/submit';

// ---------------------------------------------------------------------------
// Site data template type
// ---------------------------------------------------------------------------
export type { SiteData } from './templates/site-data.template';
