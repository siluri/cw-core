// Proto-Manifest (SSOT) – {{CUSTOMER_NAME}}
// Scaffolded from @cw/cli customer-starter template.
//
// Every {{FILL_ME}} marker MUST be replaced before launch. This file is
// validated against @cw/manifest's Zod schema on import below — if a required
// field is missing or malformed, the build fails with a pointer to the problem.

import { manifestSchema } from '@cw/manifest/schema';

const data = {
  name: '{{CUSTOMER_NAME}}',
  tagline: 'FILL_ME – short one-line tagline for {{CUSTOMER_NAME}}.',
  description: 'FILL_ME – meta description (140–160 chars). Used for SEO and OG.',
  url: 'https://{{CUSTOMER_DOMAIN}}',

  // ─── Rechtliche Angaben (Impressum) ───────────────────────────────────────
  legal: {
    form: 'Einzelunternehmen', // FILL_ME – Rechtsform (GmbH, UG, etc.)
    owner: 'FILL_ME – Owner full name',
    street: 'FILL_ME – Street + number',
    zip: '00000',
    city: 'FILL_ME – City',
    country: 'DE',
    email: 'hello@{{CUSTOMER_DOMAIN}}',
    phone: '',
    ustIdNr: undefined as string | undefined,
  },

  // ─── Kontakt (öffentlich) ─────────────────────────────────────────────────
  contact: {
    email: 'hello@{{CUSTOMER_DOMAIN}}',
    phone: '',
    web3formsKey: '', // FILL_ME – register at https://web3forms.com
    calendlyUrl: '',
  },

  // ─── Bilder ───────────────────────────────────────────────────────────────
  images: {
    ogImage: '/og/default.png',
    aboutTeam: undefined as string | undefined,
    gallery: [] as string[],
  },

  // ─── Analytics (Plausible, cookie-frei) ───────────────────────────────────
  analytics: {
    plausibleScript: undefined as string | undefined, // FILL_ME – full Plausible script URL
  },

  // ─── SEO ──────────────────────────────────────────────────────────────────
  seo: {
    titleTemplate: '%s | {{CUSTOMER_NAME}}',
    defaultTitle: '{{CUSTOMER_NAME}} – FILL_ME tagline',
    defaultDescription: 'FILL_ME – meta description (140–160 chars).',
    ogImage: '/og/default.png',
  },

  // ─── Navigation ───────────────────────────────────────────────────────────
  nav: {
    main: [
      { label: 'Leistungen', href: '/#leistungen' },
      { label: 'Kontakt', href: '/kontakt', highlight: true },
    ],
    footer: {
      leistungen: [
        { label: 'Leistungen', href: '/#leistungen' },
        { label: 'Kontakt', href: '/kontakt' },
      ],
      rechtliches: [
        { label: 'Impressum', href: '/impressum' },
        { label: 'Datenschutz', href: '/datenschutz' },
      ],
    },
  },

  // ─── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    badge: undefined as string | undefined,
    headline: 'FILL_ME – Hero headline for {{CUSTOMER_NAME}}.',
    subtext: 'FILL_ME – Hero subtext. 1–2 sentences, customer-facing value prop.',
    image: undefined as string | undefined,
    imageAlt: undefined as string | undefined,
    ctaPrimary: { label: 'Kontakt aufnehmen', href: '/kontakt' },
    ctaSecondary: undefined as { label: string; href: string } | undefined,
  },

  // ─── Leistungen ───────────────────────────────────────────────────────────
  leistungen: [
    {
      icon: '🎯',
      title: 'FILL_ME – Service 1',
      description: 'FILL_ME – short description of this service.',
      href: undefined as string | undefined,
    },
  ],

  // ─── USPs ─────────────────────────────────────────────────────────────────
  usps: [
    {
      icon: '⚡',
      title: 'FILL_ME – USP 1',
      description: 'FILL_ME – why this matters to the customer.',
    },
  ],

  // ─── Prozess-Schritte ─────────────────────────────────────────────────────
  processSteps: [
    {
      nr: '01',
      icon: '💬',
      title: 'FILL_ME – Step 1',
      desc: 'FILL_ME – what happens in this step.',
    },
  ],

  // ─── Pakete ───────────────────────────────────────────────────────────────
  packages: [
    {
      name: 'FILL_ME – Package name',
      subtitle: 'FILL_ME – target audience',
      pages: '1–5 Seiten',
      priceSetup: 0,
      priceMonthly: 0,
      features: ['FILL_ME – feature 1'],
      highlighted: false,
    },
  ],

  // ─── Testimonials ─────────────────────────────────────────────────────────
  testimonials: [] as Array<{ name: string; role: string; text: string; stars: number }>,

  // ─── FAQs ─────────────────────────────────────────────────────────────────
  faqs: [] as Array<{ q: string; a: string }>,

  // ─── Karriere (optional) ──────────────────────────────────────────────────
  // karriere: { enabled: false, ... }  // uncomment when hiring
} as const;

// Validate at build time. Throws a descriptive ZodError if fields are wrong.
// Parse is a no-op at runtime cost (runs once at import) but catches mistakes
// as early as possible.
const result = manifestSchema.safeParse(data);
if (!result.success) {
  // eslint-disable-next-line no-console
  console.error('[site-data] manifest validation failed:', result.error.format());
  throw new Error(
    'site-data.ts does not match @cw/manifest schema. Fix the errors above before building.',
  );
}

export const siteData = data;
export type SiteData = typeof siteData;
