// Shared test fixtures for manifest schema tests.
//
// `validManifest` is a minimal but complete object that satisfies every
// required field in manifestSchema. Derived from customer-blitzsicht
// site-data.ts (Customer Zero) but stripped to the essentials so test failures
// point at schema bugs rather than fixture bloat.

export const validManifest = {
  name: 'Test Customer',
  tagline: 'Short tagline.',
  description: 'Meta description between 140 and 160 chars for SEO / OG cards.',
  url: 'https://example.com',

  legal: {
    form: 'Einzelunternehmen',
    owner: 'Jane Doe',
    street: 'Teststr. 1',
    zip: '12345',
    city: 'Musterstadt',
    country: 'DE',
    email: 'legal@example.com',
    phone: '',
  },

  contact: {
    email: 'hello@example.com',
    phone: '',
    web3formsKey: 'test-key',
    calendlyUrl: '',
  },

  images: {
    ogImage: '/og/default.png',
    gallery: [],
  },

  analytics: {
    plausibleScript: 'https://plausible.io/js/pa-test.js',
  },

  seo: {
    titleTemplate: '%s | Test',
    defaultTitle: 'Test – Default',
    defaultDescription: 'Default meta description.',
    ogImage: '/og/default.png',
  },

  nav: {
    main: [{ label: 'Kontakt', href: '/kontakt', highlight: true }],
    footer: {
      leistungen: [{ label: 'Kontakt', href: '/kontakt' }],
      rechtliches: [{ label: 'Impressum', href: '/impressum' }],
    },
  },

  hero: {
    headline: 'Hello world.',
    ctaPrimary: { label: 'Kontakt', href: '/kontakt' },
  },

  leistungen: [
    { icon: '🎯', title: 'Service 1', description: 'Description 1.' },
  ],
  usps: [{ icon: '⚡', title: 'USP 1', description: 'Why it matters.' }],
  processSteps: [{ nr: '01', icon: '💬', title: 'Step 1', desc: 'Talk.' }],
  packages: [
    {
      name: 'Starter',
      priceSetup: 0,
      priceMonthly: 0,
      features: ['feature 1'],
    },
  ],
  testimonials: [],
  faqs: [],
};
